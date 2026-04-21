# TraceDeck Architecture

## Goals

TraceDeck is structured around one rule: deterministic execution traces drive replay, inspection, and comparison. The repository shape reflects that rule so future work can extend the product without rewriting the foundation.

## Selected Stack

### Frontend

The frontend uses React with Vite. The replay interface needs quick iteration on stateful interactions, timeline controls, and visual comparison surfaces. Vite keeps local feedback fast while leaving room to swap in richer visualization packages later.

### API

The API uses Fastify. It provides a small service boundary today and leaves enough headroom for persisted runs, preset-driven input services, trace retrieval, comparison APIs, and future background execution services without a framework-heavy bootstrap.

### Shared Contracts

The `packages/trace-core` workspace is the canonical contract for trace envelopes, serializable state, and comparison metric definitions. Shared trace semantics belong in one package so the execution engine, persistence layer, and UI all consume the same shape.

### Execution Runtime

The `packages/execution-engine` workspace owns reusable algorithm runtime models and trace emitters. It sits above `trace-core`: the engine package decides how runtime state is projected into stable replay snapshots, while `trace-core` defines the envelope and instrumentation rules those snapshots must satisfy.

## Repository Layout

```text
apps/
  api/            Fastify service boundary
  web/            React replay shell
packages/
  execution-engine/ Shared sorting, search, window, interval, dynamic-programming, stack, and graph runtimes plus trace emitters
  trace-core/     Trace envelope contract and validation helpers
docs/             Architecture and developer workflow
```

## Service Boundaries

### `packages/trace-core`

- Defines the trace envelope shape
- Enforces canonical JSON-serializable inputs and full step snapshots
- Guards contiguous step indexing and stable step keys for deterministic replay
- Carries explicit change records, structured highlights, explanations, and metric definitions that can be reused by replay and comparison views
- Provides reusable instrumentation helpers that project runtime state into replay-safe snapshots and derive deterministic step diffs automatically
- Gives the persistence layer one normalization path for replay-safe traces

### `packages/execution-engine`

- Owns deterministic sorting, search, window, interval, dynamic-programming, stack, and graph runtime models plus trace emitters
- Shares one replay-safe sorting state shape across Bubble Sort, Selection Sort, Quick Sort, and Merge Sort
- Shares one replay-safe interval-search state shape across Binary Search and Search in Rotated Sorted Array so midpoint probes, ordered-half signals, discarded lanes, and terminal match state stay readable across replay and persistence
- Shares one replay-safe sliding-window state shape for Minimum Size Subarray Sum so active bounds, running sums, and best-window updates stay readable across replay and persistence
- Shares one replay-safe interval state shape for Merge Intervals so sorted ranges, active merge spans, overlap checks, and committed outputs stay readable across replay and persistence
- Shares one replay-safe dynamic-programming state shape for Longest Common Subsequence so table snapshots, predecessor dependencies, and traceback recovery stay readable across replay and persistence
- Shares one replay-safe stack state shape for Valid Parentheses so cursor position, stack contents, matched pairs, and failure reasons stay readable across replay and persistence
- Shares one replay-safe graph state shape across Breadth-First Search and Dijkstra so the UI and persistence layers can render either algorithm without special-case payload parsing
- Publishes stable comparison metrics for sorting runs through the shared `comparisons` and `writes` counters
- Publishes stable search semantics for midpoint probes, ordered-half detection, interval bounds, and explicit exhausted-search outcomes
- Publishes stable window semantics for explicit expand, candidate, shrink, and terminal no-solution frames
- Publishes stable interval semantics for sort-first range scans, overlap merges, and committed output intervals
- Publishes stable dynamic-programming semantics for row-major table fills, deterministic traceback ties, and recovered subsequences
- Publishes stable stack semantics for opener pushes, closer checks, matched-pair recovery, and terminal mismatch reporting
- Publishes stable graph semantics for frontier ordering, settled nodes, edge inspections, and route updates across BFS and Dijkstra
- Keeps algorithm narration, highlights, and mutation checkpoints close to the execution logic instead of scattering them through the UI

### `apps/api`

- Owns runtime entrypoints and HTTP boundaries
- Exposes health, foundation metadata, persistence endpoints, and input-service endpoints
- Persists algorithm registrations, run summaries, step streams, and comparison records to a durable local data file
- Resolves seeded presets and validates custom payloads so replay clients and automation share one normalization path
- Keeps run listings lightweight by storing summary metadata separately from paged step retrieval

### `apps/web`

- Owns input workflows, replay controls, timeline rendering, and future comparison UX
- Treats server data and trace payloads as the source of truth rather than deriving hidden state locally
- Uses a local proxy to keep API access straightforward during development

## Execution Model

1. Clients either resolve a preset scenario or submit a custom payload for validation.
2. An algorithm implementation receives the normalized input payload.
3. The execution engine emits a deterministic sequence of serializable steps.
4. The final trace envelope stores both step-level state and metric summaries.
5. Replay reconstructs UI state from the recorded trace rather than recomputing algorithm behavior.
6. Comparison views align algorithms through explicit metric definitions and stable step semantics.

## Foundation Decisions

- Persisted traces will be treated as durable records, not transient UI artifacts.
- State transitions must be inspectable and serializable at every step.
- Shared contract changes should happen in `trace-core` first so replay and persistence remain aligned.
- The repo is intentionally split into apps and packages now to reduce migration churn once storage, comparison history, and isolated execution workers are added.
- The initial persistence backend uses atomic file writes so local replay history survives API restarts without forcing an early database commitment.
- Input preset resolution happens server-side so seeded demos, local orchestration, and future saved-run workflows can reuse the same scenario contract.

## Trace Contract Invariants

- Each trace step is a full snapshot so replay can jump directly to any frame without recomputing intermediate mutations.
- Snapshot state and input payloads use canonical JSON key ordering to keep serialized traces deterministic across runtimes.
- Step payloads carry explicit `changes`, structured `highlights`, and human-readable `explanation` fields so the API and UI consume the same semantics.
- Runtime-only structures must be projected into JSON-safe step state before they enter the envelope; replay never depends on live `Set`, `Map`, or class instances.
- Diff generation should stay readable as well as deterministic: object leaves can change independently, while array-oriented views publish collection-level changes.
- Comparison metrics must be declared up front and present on the terminal step when they are used for run-to-run comparisons.
- Sorting engines currently share `comparisons` and `writes` so bubble, selection, quick, and merge traces stay comparable without overloading algorithm-specific counters.
- Search engines currently publish `probes` and `comparisons` so interval-search traces can compare midpoint work without reconstructing the decision path in consumers.
- Window engines currently publish `expansions`, `shrinks`, and `bestUpdates` so sliding-window traces can compare scan pressure and qualifying-window churn without replay-time derivation.
- Interval engines currently publish `comparisons`, `merges`, and `outputs` so range-merging traces can compare overlap work and committed result spans without replay-time inference.
- Dynamic-programming engines currently publish `cellsComputed`, `matches`, and `tracebackSteps` so table-driven traces can compare fill work and recovery cost without reconstructing the recurrence in consumers.
- Stack engines currently publish `comparisons`, `pushes`, and `pops` so validation traces can compare closer checks and stack churn without replay-time inference.
- Graph engines currently share `settled`, `frontier`, `inspections`, and `updates` so BFS and Dijkstra expose one stable pathfinding vocabulary to replay and persistence consumers.
