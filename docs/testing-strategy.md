# Testing Strategy

## Scope

This document describes how TraceDeck layers verification around deterministic traces, persistence-safe contracts, and replay behavior.

## Testing Layers

### Contract Tests

- `packages/trace-core` owns the canonical trace envelope, serialization helpers, and replay invariants.
- Contract tests should be the first stop for changes to step structure, metric rules, canonical ordering, and replay semantics.
- Use deterministic fixtures so the same payload can support API, replay, and comparison assertions.

### API Tests

- `apps/api` tests should cover HTTP boundaries, validation behavior, secure defaults, and persistence-facing semantics.
- Favor fast injection-style tests for service contracts before adding slower end-to-end coverage.
- When persistence APIs land, test stored-run retrieval against recorded trace payloads rather than synthetic UI-only shapes.

### Replay and Interaction Tests

- `apps/web` tests should focus on replay transport, state restoration, input normalization, and comparison synchronization.
- UI tests should assert behavior derived from recorded trace steps, not hidden reducer state.
- Add targeted fixtures for sorting and graph scenarios so visual regressions can be tied back to concrete trace inputs.

## Determinism Checks

- A deterministic trace change should update or add tests that prove step ordering, snapshot completeness, and metric availability remain stable.
- Canonical JSON ordering belongs in automated tests because replay and persistence depend on byte-stable serialized payloads.
- If a change affects comparison semantics, verify both the metric definition metadata and the terminal comparison values.

## Local Execution Order

1. Run `npm run preflight` for install-free structural checks.
2. Run `npm run verify:contracts` when trace-contract behavior changes.
3. Run `npm run test` for workspace-level test coverage.
4. Run `npm run smoke` before pushing a broader, review-ready checkpoint.

## Fixture Guidance

- Prefer explicit seeded inputs over random generation in primary assertions.
- Keep benchmark and replay fixtures small enough to debug but rich enough to expose phase transitions and metric changes.
- Reuse the same fixtures across contract, API, and replay tests where possible so the product stays aligned on one trace vocabulary.
