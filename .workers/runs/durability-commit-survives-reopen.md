# Run: durability-commit-survives-reopen / r0-clean-reopen

Local sensitivity proof (the §15 proof obligation), run against real
`@electric-sql/pglite@0.2` in Node 22 before the cloud injected run. This is the
"never trust a green you haven't seen go red" evidence for this rung.

- **Workload:** `.workers/workloads/durability_commit_survives_reopen.mjs`
- **Invariant:** `durability_commit_survives_reopen`
- **Runner:** `node .workers/workloads/durability_commit_survives_reopen.mjs`

## Evidence

Correct product (durability holds):
```
INVARIANT durability_commit_survives_reopen durability PASS 500 committed rows recovered with matching checksum after reopen; rolled-back batch absent
(exit 0)
```

Planted violation (persistence wiped between close and reopen):
```
INVARIANT durability_commit_survives_reopen durability FAIL committed data unreadable after reopen (durability lost): relation "ledger" does not exist
(exit 0)
```

## Oracle gap found + fixed during this proof

The first cut of the workload let a total-durability-loss reopen throw
("relation does not exist") into the catch-all `WORKLOAD_ERROR` path — i.e. a
real violation was being mis-classified as a harness/setup error and would never
have emitted FAIL. The reopen phase now has its own try/catch that classifies any
read-back failure as a durability `FAIL`. This is exactly the kind of false-green
the proof obligation exists to catch.

## Interpretation

green evidence on correct product; demonstrated red on a planted violation. The
oracle is sensitive. Ready for the cloud injected run, which on a green flips the
rung to `done_green` and lands the result in the convex grid.

## Next: cloud injected run (after fork connect + prep)

```
wio simulate create --project <id> \
  --command "node .workers/workloads/durability_commit_survives_reopen.mjs" \
  --workload-file .workers/workloads/durability_commit_survives_reopen.mjs
```
