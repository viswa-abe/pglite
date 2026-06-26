# Work-items overview

Producer's harvest/search ledger. Tracks what is harvested, deeper/broader
directions, and which rungs are executor-ready. The map points to specs; this
file holds strategy.

## Current claimable rungs (executor queue)

- `durability-commit-survives-reopen / r0-clean-reopen` — **ready**. Phase-0
  spine: build → inject → run → record one green/red durability result.

## Harvested

- (none — the first run has not landed.)

## Deeper search (promising depth axes)

- crash-mid-COMMIT and crash-mid-batch rungs under `durability` (fault injection
  is the runtime's strength).

## Broader search (surface not yet represented)

- isolation/atomicity of a single failed statement inside a transaction.
- catalog/schema durability (DDL survives reopen).
- large-value / TOAST round-trip integrity.
