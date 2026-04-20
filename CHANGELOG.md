# Changelog

## 2026-04-20

- Added a local quality-baseline document covering verification layers, dependency hygiene, determinism expectations, and secure defaults.
- Added focused root scripts for trace-contract verification and explicit engine requirements for supported Node.js and npm versions.
- Changed the API default listen host to `127.0.0.1` and added tests for the secure local default plus explicit overrides.
- Expanded the roadmap with milestone exit criteria, workstream ordering, benchmark suites, and extension readiness gates.
- Added a delivery-sequence diagram to connect trace contracts, persistence, comparison, and operator maturity work.
- Added a product documentation set covering the platform overview, phased roadmap, contribution standards, and architecture diagrams.
- Linked the README and core docs into a navigable documentation map for TraceDeck contributors.
- Expanded `packages/trace-core` with canonical JSON snapshot normalization, structured changes/highlights/explanations, and replay invariant metadata for deterministic trace persistence.
- Added trace-core validation coverage for metric declarations, terminal comparison metrics, and canonical serialization helpers.
- Documented the shared trace contract invariants in the architecture and workspace overview docs.
- Established the workspace monorepo foundation around `apps/web`, `apps/api`, and `packages/trace-core`.
- Added a root development orchestrator plus consistent `check` and `smoke` commands for local verification.
- Updated the workspace-level docs to match the current foundation scope and repository-facing language.
