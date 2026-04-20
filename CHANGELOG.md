# Changelog

## 2026-04-20

- Added a GitHub Actions CI workflow that enforces documentation updates and runs lint, typecheck, test, and build on pushes and pull requests.
- Added a dependency-free docs guard script plus a pull request template so repository changes must ship with `CHANGELOG.md` and nearby docs updates.
- Expanded `packages/trace-core` with canonical JSON snapshot normalization, structured changes/highlights/explanations, and replay invariant metadata for deterministic trace persistence.
- Added trace-core validation coverage for metric declarations, terminal comparison metrics, and canonical serialization helpers.
- Documented the shared trace contract invariants in the architecture and workspace overview docs.
- Established the workspace monorepo foundation around `apps/web`, `apps/api`, and `packages/trace-core`.
- Added a root development orchestrator plus consistent `check` and `smoke` commands for local verification.
- Updated the workspace-level docs to match the current foundation scope and repository-facing language.
