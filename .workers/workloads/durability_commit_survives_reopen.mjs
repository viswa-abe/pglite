// Promise: durability — once a transaction COMMITs, its writes survive a fresh
// open of the same persisted data directory. Rung: clean close + reopen (no
// fault). Oracle: every committed row is present after reopen; a ROLLBACK'd
// batch leaves no trace.
//
// Determinism is provided by the substrate (the seed pins guest entropy at the
// hypervisor level), so this workload is a fixed deterministic sequence. It
// emits the promise's invariant as a single structured line the runtime parses:
//   INVARIANT <id> <name> <PASS|FAIL> <summary>
// (packages/events/src/lib.rs::parse_invariant_line)

import { PGlite } from "@electric-sql/pglite";
import { rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const INVARIANT_ID = "durability_commit_survives_reopen";
const INVARIANT_NAME = "durability";
const COMMITTED_ROWS = 500;
const ROLLED_BACK_ROWS = 250;

function emit(status, summary) {
  // summary is the remainder of the line; keep it single-line and non-empty.
  console.log(`INVARIANT ${INVARIANT_ID} ${INVARIANT_NAME} ${status} ${summary}`);
}

async function main() {
  const dataDir = join(tmpdir(), "pglite-durability");
  // Start from a clean directory so the result reflects this run only.
  rmSync(dataDir, { recursive: true, force: true });
  mkdirSync(dataDir, { recursive: true });

  // ── write phase: one committed batch, one rolled-back batch ──────────────
  const db = new PGlite(dataDir);
  await db.exec(`
    CREATE TABLE ledger (id INTEGER PRIMARY KEY, amount INTEGER NOT NULL);
  `);

  await db.exec("BEGIN");
  for (let i = 0; i < COMMITTED_ROWS; i++) {
    await db.query("INSERT INTO ledger (id, amount) VALUES ($1, $2)", [i, i * 7]);
  }
  await db.exec("COMMIT");

  // This batch is deliberately discarded; durability must not resurrect it.
  await db.exec("BEGIN");
  for (let i = 0; i < ROLLED_BACK_ROWS; i++) {
    await db.query("INSERT INTO ledger (id, amount) VALUES ($1, $2)", [
      COMMITTED_ROWS + i,
      -1,
    ]);
  }
  await db.exec("ROLLBACK");

  const expectedChecksum = checksum(COMMITTED_ROWS);
  await db.close(); // flush to the persisted data directory

  // ── reopen phase: the committed batch must be exactly recoverable ────────
  // Any failure to read back the committed data — a missing relation, a corrupt
  // catalog, a query error — is a durability violation, not a harness error, so
  // it must emit FAIL (red), never crash into WORKLOAD_ERROR. Total loss is the
  // most severe violation of this promise, and the oracle must catch it.
  let actualCount;
  let actualChecksum;
  try {
    const reopened = new PGlite(dataDir);
    const countRes = await reopened.query(
      "SELECT count(*)::int AS n FROM ledger"
    );
    const sumRes = await reopened.query(
      "SELECT COALESCE(sum(amount), 0)::int AS s FROM ledger"
    );
    await reopened.close();
    actualCount = countRes.rows[0].n;
    actualChecksum = sumRes.rows[0].s;
  } catch (err) {
    emit(
      "FAIL",
      `committed data unreadable after reopen (durability lost): ${oneLine(err)}`
    );
    return;
  }

  if (actualCount !== COMMITTED_ROWS) {
    emit(
      "FAIL",
      `expected ${COMMITTED_ROWS} committed rows after reopen, found ${actualCount}`
    );
    return;
  }
  if (actualChecksum !== expectedChecksum) {
    emit(
      "FAIL",
      `committed-row checksum diverged after reopen: expected ${expectedChecksum}, found ${actualChecksum}`
    );
    return;
  }
  emit(
    "PASS",
    `${COMMITTED_ROWS} committed rows recovered with matching checksum after reopen; rolled-back batch absent`
  );
}

function oneLine(err) {
  const msg = err && err.message ? err.message : String(err);
  return msg.replace(/\s+/g, " ").trim();
}

function checksum(rows) {
  let sum = 0;
  for (let i = 0; i < rows; i++) sum += i * 7;
  return sum;
}

main().catch((err) => {
  // A harness/setup failure is not a product bug; surface it loudly but do not
  // emit a FAIL invariant (which would be read as a durability violation).
  console.error("WORKLOAD_ERROR", err && err.stack ? err.stack : String(err));
  process.exit(1);
});
