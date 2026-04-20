# Changelog

## 2026-04-20

- Added a shared graph execution engine in `packages/trace-core` with deterministic BFS and Dijkstra trace builders, stable graph step metrics, and replay-safe path reconstruction helpers.
- Rewired the replay shell to consume structured trace `changes`, `highlights`, and `explanation` payloads while exposing Bubble Sort, Breadth-First Search, and Dijkstra from the same deterministic runtime model.
- Added focused runtime and shell tests that distinguish BFS hop-count routing from Dijkstra weighted routing on the same input graph.
- Expanded `packages/trace-core` with canonical JSON snapshot normalization, structured changes/highlights/explanations, and replay invariant metadata for deterministic trace persistence.
- Added trace-core validation coverage for metric declarations, terminal comparison metrics, and canonical serialization helpers.
- Documented the shared trace contract invariants in the architecture and workspace overview docs.
- Established the workspace monorepo foundation around `apps/web`, `apps/api`, and `packages/trace-core`.
- Added a root development orchestrator plus consistent `check` and `smoke` commands for local verification.
- Updated the workspace-level docs to match the current foundation scope and repository-facing language.
