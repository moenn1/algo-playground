# Trace Contract

## Scope

`packages/trace-core` defines the canonical execution trace envelope shared by algorithm emitters, API persistence, and the replay UI.

## Deterministic Replay Rules

- Every step is a full state snapshot. Replay never depends on re-running algorithm logic between frames.
- Input payloads and step state must be JSON-serializable with finite numbers only.
- Step indexes are zero-based and contiguous.

## Step Payload Semantics

- `phase` gives replay surfaces a stable high-level frame label.
- `description` carries the narrative summary for the step inspector.
- `changedPaths` records the state and metric paths touched by the frame.
- `highlights` carries the concise bullet points shown in replay and inspection surfaces.
- `metrics` is a finite numeric map whose keys must be declared in the trace metric definitions.

## Comparison Rules

- Comparison metric keys must be declared in `metricDefinitions`.
- Metric definition order is preserved for presentation.
- Replay clients should read comparison-ready metrics from the recorded trace envelope rather than reconstructing them from algorithm logic.

## Related References

- `docs/architecture.md` for service ownership and execution flow
- `docs/roadmap.md` for benchmark and extensibility planning
- `docs/diagrams.md` for the trace lifecycle view
