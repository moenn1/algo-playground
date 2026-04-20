# Trace Contract

## Scope

`packages/trace-core` defines the canonical execution trace envelope and reusable graph execution builders shared by algorithm emitters, API persistence, and the replay UI.

## Deterministic Replay Rules

- Every step is a full state snapshot. Replay never depends on re-running algorithm logic between frames.
- Input payloads and step state must be JSON-serializable with finite numbers only.
- Object keys are canonicalized before serialization so persisted traces stringify deterministically.
- Step indexes are zero-based and contiguous, and every step carries a unique stable `key`.

## Step Payload Semantics

- `phase` gives replay surfaces a stable high-level frame label.
- `description` carries the narrative summary for the step inspector.
- `explanation` stores a concise summary plus optional details and tags for richer narration.
- `changes` records explicit path-based deltas. Each change includes `path`, `op`, and explicit previous/next values when they exist.
- `highlights` uses structured selectors with `key`, `path`, `kind`, `intent`, and optional `label`/`metadata` so backend and UI consumers share the same emphasis semantics.
- `metrics` is a finite numeric map whose keys must be declared in the trace metric definitions.

## Graph Runtime Conventions

- BFS and Dijkstra share one graph replay state shape with `distances`, `visited`, `frontier`, `current`, `activeEdge`, and `path`.
- `distances` stores hop counts for BFS and weighted totals for Dijkstra, with unreachable nodes encoded as `null`.
- `visited`, `frontier`, `inspections`, and `updates` keep graph metrics stable across the shared graph engine even though the frontier ordering differs by algorithm.
- Replay clients should treat the recorded `frontier` ordering as authoritative instead of rebuilding queue or priority-queue state from algorithm code.

## Comparison Rules

- Comparison metric keys must be declared in `metricDefinitions`.
- Metric definition order is preserved for presentation.
- Replay clients should read comparison-ready metrics from the recorded trace envelope rather than reconstructing them from algorithm logic.
