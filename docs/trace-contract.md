# Trace Contract

## Scope

`packages/trace-core` defines the canonical execution trace envelope shared by the execution-engine workspaces, API persistence, and the replay UI.

## Deterministic Replay Rules

- Every step is a full state snapshot. Replay never depends on re-running algorithm logic between frames.
- Input payloads and step state must be JSON-serializable with finite numbers only.
- Object keys are canonicalized before serialization so persisted traces stringify deterministically.
- Step indexes are zero-based and contiguous, and every step carries a unique stable `key`.

## Envelope Shape

- `algorithm` identifies the algorithm, domain, and implementation version that produced the trace.
- `input` stores the canonicalized execution input used for replay and comparison.
- `steps` stores the ordered step stream used by replay, diffing, and persistence.
- `replay` captures the normalized replay descriptor and the invariant set consumers must respect.
- `summary` stores comparison-ready metrics, terminal metric values, and the ordered list of step keys.

## Step Payload Semantics

- `phase` gives replay surfaces a stable high-level frame label.
- `description` carries the narrative sentence shown in the step inspector.
- `explanation` stores a concise summary plus optional details and tags for richer narration.
- `changes` records explicit path-based deltas. Each change includes `path`, `op`, and explicit previous/next values when they exist.
- `highlights` uses structured selectors with `key`, `path`, `kind`, `intent`, and optional `label`/`metadata` so the backend and UI share the same emphasis semantics.
- `metrics` is a finite numeric map whose keys must be declared in the trace metric definitions.

## Instrumentation Rules

- Algorithm emitters should build steps through shared `trace-core` instrumentation helpers instead of hand-authoring step indexes, keys, or diff lists per algorithm.
- Shared runtime packages such as `packages/execution-engine` should keep algorithm-specific state projection close to the algorithm implementation while delegating key generation, canonicalization, and diffing to `trace-core`.
- Instrumentation may project non-serializable runtime structures such as `Set`-backed frontier state into replay-safe JSON snapshots before the envelope is assembled.
- Object-shaped diffs recurse to the leaf path so node-distance updates stay precise, while array-shaped diffs stay at the collection path so swaps, frontiers, and sorted ranges remain readable.
- Emitters may append semantic changes for publication steps whose meaning matters even when the projected snapshot matches the previous frame.
- Shared graph runtimes should publish ordered frontier arrays rather than opaque queue or heap internals so replay, persistence, and explanations all read the same pathfinding state.

## Comparison Rules

- Comparison metric keys must be declared in `metricDefinitions`.
- Metric definition order is preserved for presentation.
- The terminal step must include every metric listed in `comparisonMetricKeys`.
- Replay clients should read comparison-ready metrics from the recorded trace envelope rather than reconstructing them from algorithm logic.
