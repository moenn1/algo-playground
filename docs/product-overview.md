# TraceDeck Product Overview

## Product Intent

TraceDeck is an algorithm execution and comparison platform built around one core promise: every replayed frame comes from a recorded, deterministic trace rather than from hidden recomputation in the UI.

The product is being shaped for three audiences at once:

- Developers who need a stable contract for execution, persistence, and replay.
- Learners who need step-by-step algorithm insight without ambiguity.
- Reviewers who need consistent metrics and synchronized comparison views across implementations.

## Product Pillars

### Deterministic Replay

- Every algorithm run is recorded as a durable trace envelope.
- Each step is a full snapshot so playback can jump directly to any frame.
- State transitions are inspectable, serializable, and stable across replays.

### Comparable Execution

- Comparison metrics are declared explicitly rather than inferred ad hoc.
- Step semantics stay stable across algorithms in the same domain.
- Comparison surfaces should align on shared inputs, explicit metric baselines, and synchronized playback.

### Durable History

- Persisted runs are treated as product data, not temporary UI state.
- APIs and storage should support replay, saved history, and future benchmark analysis from the same trace source.

### Product-Grade Delivery

- Local development should be easy to boot, verify, and document.
- Documentation should explain the system as a full product foundation with phased delivery.
- Quality gates should defend the trace contract, not just superficial UI output.

## Current Foundation

- `apps/web` provides the replay-oriented shell and experience direction.
- `apps/api` establishes the HTTP boundary that future run, history, and comparison APIs will extend.
- `packages/trace-core` defines the deterministic trace envelope contract shared across the stack.

## Primary User Flows

1. Choose an algorithm and provide or generate an input.
2. Execute the algorithm into a deterministic trace envelope.
3. Replay the recorded steps with transport controls and state inspection.
4. Save or reload the trace for later review.
5. Compare multiple runs against shared metrics and aligned playback semantics.

## Documentation Map

- `docs/architecture.md`: system boundaries, execution model, and service seams
- `docs/trace-contract.md`: canonical trace rules and payload semantics
- `docs/replay-shell.md`: replay UX direction and extension guidance
- `docs/roadmap.md`: phased delivery plan, benchmark strategy, and extensibility roadmap
- `docs/contribution-standards.md`: implementation and review expectations for contributors
- `docs/diagrams.md`: architecture and trace-flow diagrams
