---
key: durability
title: Durability — committed writes survive reopen/crash
state: mapped
---

# Area: Durability

pglite is an in-process WASM Postgres that can persist to a data directory (the
filesystem in Node, IndexedDB/OPFS in the browser). The core durability
guarantee Postgres users rely on: **once a transaction COMMITs, its effects are
permanent** — they survive closing the instance and opening a new one against the
same persisted data, and (deeper rungs) survive a crash mid-write.

This is invariant-rich and exactly where the fault-injection + deterministic
replay runtime is strong: the failure modes are partial flush, lost-on-reopen,
resurrected-rollback, and torn-write-on-crash.

## Promise ladder

- `durability-commit-survives-reopen` — committed batch is exactly recoverable
  after a clean close + reopen; a ROLLBACK'd batch leaves no trace. (Phase-0
  seed promise — mapped by hand to de-risk producer judgment.)

## Deeper rungs to harvest next (producer notes)

- crash mid-COMMIT (kill the process between flush and fsync) → on reopen the txn
  is wholly present or wholly absent, never partial.
- crash mid-batch before COMMIT → none of the batch is present after reopen.
- power-fault during checkpoint → no torn page / corrupt catalog on reopen.

These are distinct fault models (`strategy-critic` would name them), each a new
rung under this area, most sharing the same workload file with a `--rung`
selector.
