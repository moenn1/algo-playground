# TraceDeck Roadmap

## Delivery Principles

- Build depth before breadth. Deterministic replay and comparison semantics come before expanding the algorithm catalog.
- Keep one source of truth. Persisted trace envelopes should drive replay, history, and comparison.
- Treat each phase as product infrastructure, not throwaway scaffolding.
- Sequence work so contracts and persistence semantics settle before UI polish depends on them.

## Sequencing Rules

1. Stabilize shared trace semantics before widening algorithm coverage.
2. Persist the same trace model that replay already consumes before adding history-heavy UX.
3. Land synchronized comparison only after metric definitions and step semantics are consistent across domains.
4. Treat quality gates and operator workflow as release enablers, not post-launch cleanup.

## Milestone Plan

### Phase 1: Product Foundation

- Establish the workspace layout, shared trace contract, API boundary, and replay shell.
- Document the architecture, execution model, and developer workflow.
- Keep local development and smoke checks straightforward.

Exit criteria:

- The repo has a stable apps-and-packages layout with documented ownership boundaries.
- The replay shell can boot locally and consume the shared trace contract.
- Core docs explain the architecture, workflow, and product framing.

### Phase 2: Deterministic Execution Coverage

- Implement sorting and graph execution engines against the shared trace contract.
- Expand explanations, highlights, and state-change semantics so recorded runs are readable and comparable.
- Validate determinism and contract stability through tests, not manual inspection alone.

Exit criteria:

- Sorting and graph runs emit full step snapshots with stable explanations, highlights, and metric semantics.
- Determinism checks cover contiguous step ordering, serialization rules, and repeatable replay outcomes.
- Trace contract consumers no longer rely on ad hoc per-algorithm assumptions.

### Phase 3: Persistence and History

- Add durable APIs and storage models for runs, steps, and comparison metadata.
- Introduce saved runs, history exploration, and replay restoration from persisted records.
- Keep persisted structures aligned with the contract already consumed by the UI.

Exit criteria:

- Run and step APIs can store and reload trace envelopes without contract translation layers.
- Saved-run flows restore replay state directly from persisted trace records.
- Persistence docs describe the stored entities, API contracts, and retrieval guarantees.

### Phase 4: Comparison Surfaces

- Deliver synchronized playback for multiple algorithms on the same input.
- Surface shared metrics, charts, and contrasting state behaviors with explicit semantics.
- Reuse the same step model and trace contract rather than inventing a comparison-only path.

Exit criteria:

- Comparison views align algorithms on the same input and metric-definition set.
- Shared charts and summaries are sourced from recorded trace metrics rather than UI-derived heuristics.
- The replay experience can move between single-run and multi-run views without semantic drift.

### Phase 5: Operator and Contributor Maturity

- Harden CI, smoke checks, dependency hygiene, and contribution standards.
- Add repeatable demo flows, seeded examples, and runbooks for local execution.
- Prepare the platform for broader algorithm families and isolated execution workers.

Exit criteria:

- Local and CI workflows enforce the same lint, test, build, and docs expectations.
- Demo and contributor setup is documented well enough to reproduce the platform without tribal knowledge.
- The platform can accept new algorithms or future isolated execution backends without reworking the replay contract.

## Workstream Order

### Current critical path

1. Shared trace contract and replay invariants
2. Execution engines and instrumentation coverage
3. Persistence APIs and stored run model
4. Saved-run and comparison experience layers
5. CI, dependency hygiene, and operator workflows

### Parallelizable work

- Product docs, diagrams, and contributor standards can advance alongside implementation as long as they describe concrete landed behavior.
- Design-system and visual polish work can move in parallel once replay semantics and comparison contracts are stable enough to avoid redesign churn.
- Input generation can progress beside persistence work if it reuses the same validation and trace-execution boundaries.

## Near-Term Delivery Focus

### Immediate

- Finish deterministic trace semantics for sorting and graph domains.
- Land the first persisted run and step APIs against the shared contract.
- Keep replay-shell changes aligned with the stored trace model rather than inventing UI-only state.

### Next

- Add saved-run retrieval and history navigation.
- Deliver synchronized comparison using the shared metric-definition model.
- Tighten CI, smoke checks, and dependency hygiene around the same workflows used locally.

### Later

- Add broader algorithm coverage within the existing domain boundaries.
- Extend benchmarking suites and historical comparisons for larger datasets.
- Introduce isolated execution workers when the storage and contract boundaries are already stable.

## Benchmarking Plan

### Goals

- Measure algorithm behavior using recorded traces rather than loose runtime anecdotes.
- Keep comparison metrics consistent within a domain and explain what each metric represents.

### Benchmark Inputs

- Curated presets for canonical best-case, average-case, and stress scenarios
- Randomized but reproducible seeded inputs
- Domain-specific fixtures for graph density, branching, and path-shape variation

### Benchmark Suites

#### Sorting

- Ordered, reverse-ordered, nearly sorted, duplicate-heavy, and randomized arrays
- Size tiers that expose algorithm-shape differences without making replay unreadable
- Stable seeds so visual comparison and stored benchmarks are reproducible

#### Graph

- Sparse graphs, dense graphs, weighted path-focused graphs, and disconnected-node cases
- Fixtures that expose queue or heap behavior, frontier growth, and path recovery
- Shared node-label conventions so replay and comparison stay readable across scenarios

### Benchmark Outputs

- Terminal comparison metrics declared in the trace contract
- Step counts and phase distribution summaries
- Persisted run metadata that allows the same benchmark set to be replayed later

### Benchmark Cadence

- Run smoke-sized benchmark fixtures in local verification to catch obvious semantic regressions quickly.
- Run broader benchmark sets in CI once persistence and comparison APIs are stable enough to store historical baselines.
- Re-record benchmark fixtures only when the trace contract or metric semantics intentionally change, and document that change in the changelog and relevant docs.

### Benchmark Acceptance Rules

- A benchmark suite is only comparable when all participating algorithms use the same input shape and metric-definition set.
- Comparison-ready metrics must be present on the terminal step and documented alongside their meaning.
- Benchmark traces should remain replayable artifacts so visual inspection and metric inspection refer to the same recorded run.

## Extensibility Model

### New Algorithms

- Reuse the shared trace envelope and metric-definition model.
- Emit domain-stable phases and highlights so replay and comparison surfaces remain coherent.
- Ship with benchmark fixtures and deterministic replay tests before being treated as comparison-ready.

### New Domains

- Add domain-specific state snapshots while preserving contract invariants.
- Prefer additive fields to preserve compatibility for replay and persistence consumers.
- Define domain-local metric semantics explicitly before exposing multi-run comparison for that domain.

### Future Execution Isolation

- Keep the API boundary narrow enough to introduce worker or sandbox execution later.
- Ensure serialized traces remain portable across local development, CI, and future isolated runners.

## Extension Readiness Checklist

- The new execution path emits full snapshots with stable ordering and finite numeric metrics.
- Replay can restore any recorded step without recomputing intermediate logic.
- Persistence can store and reload the new trace payload without a one-off adapter.
- Comparison metrics are declared, documented, and meaningful for the target domain.
- The docs set includes updated roadmap, contract, or workflow notes wherever the new capability changes expectations.
