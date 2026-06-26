# Resilience Map — pglite

Factual index of the product surface and durable evidence. Not a queue (claims
and live status live in convex). Joined to convex rows by the frontmatter `key`
in each spec file.

## Areas

| key | area | state | spec |
| --- | --- | --- | --- |
| `durability` | Durability — committed writes survive reopen/crash | mapped | [areas/durability.md](areas/durability.md) |

## Promises

| key | promise | area | invariant | spec |
| --- | --- | --- | --- | --- |
| `durability-commit-survives-reopen` | A committed transaction survives a fresh open of the persisted data directory | `durability` | `durability_commit_survives_reopen` | [work-items/durability-commit-survives-reopen.md](work-items/durability-commit-survives-reopen.md) |
