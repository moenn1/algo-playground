# TraceDeck Architecture

## Goals

TraceDeck is structured around one rule: deterministic execution traces drive replay, inspection, and comparison. The repository shape reflects that rule so future work can extend the product without rewriting the foundation.

## Selected Stack

### Frontend

The frontend uses React with Vite. The replay interface needs quick iteration on stateful interactions, timeline controls, and visual comparison surfaces. Vite keeps local feedback fast while leaving room to swap in richer visualization packages later.

### API

The API uses Fastify. It provides a small service boundary today and leaves enough headroom for persisted runs, trace retrieval, comparison APIs, and future background execution services without a framework-heavy bootstrap.

### Shared Contracts

The `packages/trace-core` workspace is the canonical contract for trace envelopes, serializable state, and comparison metric definitions. Shared trace semantics belong in one package so the execution engine, persistence layer, and UI all consume the same shape.

## Repository Layout

```text
apps/
  api/            Fastify service boundary
  web/            React replay shell
packages/
  trace-core/     Trace envelope contract and validation helpers
docs/             Architecture and developer workflow
```

## Service Boundaries

### `packages/trace-core`

- Defines the trace envelope shape
- Enforces canonical JSON-serializable inputs and full step snapshots
- Guards contiguous step indexing and stable step keys for deterministic replay
- Carries explicit change records, structured highlights, explanations, and metric definitions that can be reused by replay and comparison views

### `apps/api`

- Owns runtime entrypoints and HTTP boundaries
- Exposes health and foundation metadata now
- Will own run creation, persisted traces, and comparison retrieval later

### `apps/web`

- Owns input workflows, replay controls, timeline rendering, and future comparison UX
- Treats server data and trace payloads as the source of truth rather than deriving hidden state locally
- Uses a local proxy to keep API access straightforward during development

## Execution Model

1. An algorithm implementation receives a validated input payload.
2. The execution engine emits a deterministic sequence of serializable steps.
3. The final trace envelope stores both step-level state and metric summaries.
4. Replay reconstructs UI state from the recorded trace rather than recomputing algorithm behavior.
5. Comparison views align algorithms through explicit metric definitions and stable step semantics.

## Foundation Decisions

- Persisted traces will be treated as durable records, not transient UI artifacts.
- State transitions must be inspectable and serializable at every step.
- Shared contract changes should happen in `trace-core` first so replay and persistence remain aligned.
- The repo is intentionally split into apps and packages now to reduce migration churn once storage, comparison history, and isolated execution workers are added.

## Related References

- `docs/product-overview.md` for product framing and user flows
- `docs/trace-contract.md` for step payload semantics
- `docs/diagrams.md` for system and trace lifecycle diagrams

## Trace Contract Invariants

- Each trace step is a full snapshot so replay can jump directly to any frame without recomputing intermediate mutations.
- Snapshot state and input payloads use canonical JSON key ordering to keep serialized traces deterministic across runtimes.
- Step payloads carry explicit `changes`, structured `highlights`, and human-readable `explanation` fields so the API and UI consume the same semantics.
- Comparison metrics must be declared up front and present on the terminal step when they are used for run-to-run comparisons.
