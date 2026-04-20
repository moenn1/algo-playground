# TraceDeck Roadmap

## Delivery Principles

- Build depth before breadth. Deterministic replay and comparison semantics come before expanding the algorithm catalog.
- Keep one source of truth. Persisted trace envelopes should drive replay, history, and comparison.
- Treat each phase as product infrastructure, not throwaway scaffolding.

## Milestone Sequence

### Phase 1: Product Foundation

- Establish the workspace layout, shared trace contract, API boundary, and replay shell.
- Document the architecture, execution model, and developer workflow.
- Keep local development and smoke checks straightforward.

### Phase 2: Deterministic Execution Coverage

- Implement sorting and graph execution engines against the shared trace contract.
- Expand explanations, highlights, and state-change semantics so recorded runs are readable and comparable.
- Validate determinism and contract stability through tests, not manual inspection alone.

### Phase 3: Persistence and History

- Add durable APIs and storage models for runs, steps, and comparison metadata.
- Introduce saved runs, history exploration, and replay restoration from persisted records.
- Keep persisted structures aligned with the contract already consumed by the UI.

### Phase 4: Comparison Surfaces

- Deliver synchronized playback for multiple algorithms on the same input.
- Surface shared metrics, charts, and contrasting state behaviors with explicit semantics.
- Reuse the same step model and trace contract rather than inventing a comparison-only path.

### Phase 5: Operator and Contributor Maturity

- Harden CI, smoke checks, dependency hygiene, and contribution standards.
- Add repeatable demo flows, seeded examples, and runbooks for local execution.
- Prepare the platform for broader algorithm families and isolated execution workers.

## Benchmarking Plan

### Goals

- Measure algorithm behavior using recorded traces rather than loose runtime anecdotes.
- Keep comparison metrics consistent within a domain and explain what each metric represents.

### Benchmark Inputs

- Curated presets for canonical best-case, average-case, and stress scenarios
- Randomized but reproducible seeded inputs
- Domain-specific fixtures for graph density, branching, and path-shape variation

### Benchmark Outputs

- Terminal comparison metrics declared in the trace contract
- Step counts and phase distribution summaries
- Persisted run metadata that allows the same benchmark set to be replayed later

## Extensibility Model

### New Algorithms

- Reuse the shared trace envelope and metric-definition model.
- Emit domain-stable phases and highlights so replay and comparison surfaces remain coherent.

### New Domains

- Add domain-specific state snapshots while preserving contract invariants.
- Prefer additive fields to preserve compatibility for replay and persistence consumers.

### Future Execution Isolation

- Keep the API boundary narrow enough to introduce worker or sandbox execution later.
- Ensure serialized traces remain portable across local development, CI, and future isolated runners.
