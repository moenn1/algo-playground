# Contribution Standards

## Engineering Expectations

- Keep deterministic trace behavior as the first constraint. Replay correctness matters more than cosmetic breadth.
- Treat persisted traces as durable product records. Avoid hidden UI-only state that cannot be reconstructed from the trace.
- Preserve explicit comparison semantics. If a metric is important, declare it and keep its meaning stable.

## Change Shape

- Prefer small, reviewable commits that cover one coherent change.
- Update the nearest relevant documentation in the same iteration when behavior, workflows, contracts, or architecture change.
- Keep `CHANGELOG.md` current with the same iteration so repository history remains readable.

## Branching

- Use `feature/<scope>` for product work and `fix/<scope>` for corrective changes.
- Keep branch names scoped to the change, not the contributor.

## Code and Contract Rules

- Put cross-cutting execution contracts in `packages/trace-core`.
- Keep HTTP and persistence concerns in `apps/api`.
- Keep replay and comparison presentation concerns in `apps/web`.
- Prefer additive contract evolution so older traces and consumers do not silently drift.

## Testing Expectations

- Add or update tests when changing trace semantics, persistence behavior, or replay logic.
- Favor deterministic fixtures over implicit runtime state.
- Verify that step ordering, snapshot stability, and comparison metrics remain coherent after contract changes.
- Use `npm run verify:contracts` for trace-contract-sensitive changes before relying on the broader smoke pass alone.

## Documentation Expectations

- Repository-facing docs should describe TraceDeck as a polished product foundation with phased delivery.
- Write docs so a contributor can understand how replay, persistence, and comparison fit together without reading source first.
- Add diagrams when a change affects service boundaries, execution flow, or contract ownership.
- Update `docs/quality-baseline.md` when local verification commands, dependency requirements, or secure defaults change.

## Review Checklist

- Does the change preserve deterministic replay from recorded trace data?
- Are state transitions inspectable and serializable at every step?
- Are comparison metrics explicit, stable, and documented?
- Were docs and the changelog updated alongside the implementation?
