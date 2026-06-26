# Run: <work-item-or-rung-id>

- **Command:** `wio simulate create --project <id> --command "..." --workload-file ...`
- **Exploration id:** <id>
- **Target commit:** <sha>
- **Seed / case:** <seed>
- **Fault:** <fault model or baseline>
- **Invariant:** `durability_commit_survives_reopen`
- **Result:** PASS | FAIL (`hasInvariantViolation`)
- **Artifacts:** <links to wio investigate timeline / artifacts>

## Raw evidence

```
<INVARIANT line + relevant stdout>
```

## Interpretation (producer/triage fills in)

green evidence | bug candidate | historical finding | fixed-upstream |
environment-sensitive | harness issue | setup blocker | regression guard
