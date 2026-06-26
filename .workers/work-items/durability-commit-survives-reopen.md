---
key: durability-commit-survives-reopen
area: durability
title: A committed transaction survives a fresh open of the persisted data directory
invariant: durability_commit_survives_reopen
state: ready
---

# Promise: commit survives reopen

**Guarantee:** once a transaction COMMITs, every committed row is present and
unchanged after the pglite instance is closed and a new instance is opened on the
same data directory; a transaction that ROLLBACKs leaves no trace.

**Invariant id:** `durability_commit_survives_reopen` (emitted as a structured
`INVARIANT` checkpoint → `workloadInvariantStats` → `hasInvariantViolation`).

## Rung ladder

| rung key | fault model | state | workload | selector |
| --- | --- | --- | --- | --- |
| `r0-clean-reopen` | none (clean close + reopen) | ready | `.workers/workloads/durability_commit_survives_reopen.mjs` | (whole file) |
| `r1-crash-mid-commit` | process kill between flush and fsync | draft | (same file, future `--rung r1`) | — |
| `r2-crash-mid-batch` | kill before COMMIT | draft | (same file, future `--rung r2`) | — |

### r0-clean-reopen (Phase-0, ready)

- **Promise / invariant:** as above.
- **Freshness:** new; no prior evidence. This is the spine run.
- **Adversarial model / fault dimensions:** baseline (no fault) first; the value
  is the reopen oracle, not yet fault injection. Reward is seeing it go red on a
  planted durability bug (the ruler), then green on the fix.
- **Setup:** base image built by `.workers/build.sh` (`npm i @electric-sql/pglite`).
- **Build profile / runtime args:** Node ESM; mem 1024; timeout 300s.
- **Workload plan / path:** `.workers/workloads/durability_commit_survives_reopen.mjs`.
  Writes 500 committed rows + a 250-row ROLLBACK, closes, reopens, asserts count
  and checksum of the committed batch and absence of the rolled-back batch.
- **Oracle:** `actualCount == 500 && checksum matches && rolled-back rows absent`.
- **Replay command shape:**
  `wio simulate create --project <id> --command "node .workers/workloads/durability_commit_survives_reopen.mjs" --workload-file .workers/workloads/durability_commit_survives_reopen.mjs`
- **Stale conditions:** pglite major upgrade; change to the persistence backend;
  change to the data-dir path contract.

## Execution / evidence notes

(none yet — awaiting the first injected run; see `.workers/runs/`.)

## Finding summary

(none yet.)

## Regression notes

Once green-on-correct + red-on-planted-bug is demonstrated (the proof
obligation), this rung joins the regression suite and is rerun per commit.
