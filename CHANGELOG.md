# Changelog

## 2026-04-21

- Expanded the reference library in `apps/web` so it now covers both replay-backed algorithms and named problem pages, including problem routes, pattern tags, related problems, implementation variants, replay handoff, and TypeScript/Python/Java/C++ starter implementations.
- Added shared graph execution-engine builders for Breadth-First Search and Dijkstra, and fixed the workspace-integrity guard so root-linked validation still works when package lifecycle hooks invoke it from nested workspaces.
- Elevated the replay shell with a hero command surface that exposes live playback telemetry, product priorities, and current replay context.
- Added an active-frame briefing strip for single-run replay with snapshot summaries and recorded-signal chips ahead of the detailed inspector panels.
- Expanded timeline navigation with a progress bar plus storyboard stops so users can jump between global milestones and local checkpoints more deliberately.
- Added per-lane sync signal cards to comparison mode and documented the updated replay-shell interaction model in the README and replay-shell notes.

## 2026-04-20

- Added shared graph runtimes in `packages/execution-engine` for Breadth-First Search and Dijkstra, including deterministic frontier ordering, route recovery, and stable graph metrics.
- Refactored the web replay shell to consume shared graph trace builders instead of maintaining a UI-local Dijkstra runtime, and added BFS to the seeded graph algorithm catalog.
- Expanded the input-service contract and docs so graph presets resolve for both Breadth-First Search and Dijkstra through the same normalized payload shape.
- Moved the workspace-integrity guard onto root install plus local build, test, demo, and dev entrypoints so stale or partial workspace installs fail before Vite or TypeScript resolve internal packages.
- Clarified the local workflow and CI docs around root-only workspace bootstrapping and the recovery path for missing `@tracedeck/*` links.
- Added a workspace-integrity guard for internal `@tracedeck/*` package links and wired it into local and GitHub Actions verification.
- Updated the CI and developer workflow docs to cover workspace-link validation before build and app startup checks.
- Added `packages/execution-engine` as a shared sorting runtime with deterministic trace emitters for Bubble Sort, Selection Sort, Quick Sort, and Merge Sort.
- Wired the replay shell and input-service catalog to the shared sorting engine so four sorting algorithms now share stable `comparisons` and `writes` metrics.
- Documented the execution-engine package and the sorting runtime model alongside the updated workspace layout and input-service contract.
- Added a shared trace recorder that projects runtime state into deterministic step snapshots and auto-derives readable path diffs and stable step keys.
- Refactored the seeded sorting and graph trace builders to emit explanations, highlights, and deltas through the shared instrumentation layer instead of hand-authored step changes.
- Documented the runtime-projection and diffing rules that now govern TraceDeck execution traces.
- Added a GitHub Actions CI workflow that enforces documentation updates and runs lint, typecheck, test, and build on pushes and pull requests.
- Added a dependency-free docs guard script plus a pull request template so repository changes must ship with `CHANGELOG.md` and nearby docs updates.
- Added deterministic demo seeding and summary commands for local replay, history, and comparison verification.
- Added a `dev:demo` orchestration flow that reseeds a dedicated demo storage file before launching the API and web workspaces.
- Documented the local operator runbook, demo storage policy, and root workflow updates for repeatable on-demand setup.
- Added deterministic input-service APIs for preset discovery, preset resolution, and custom payload validation in `apps/api`.
- Introduced seeded random, worst-case, and curated scenario presets for the supported sorting and graph algorithms.
- Documented the input-service contract and preset catalog in the README and architecture docs.
- Clarified the trace contract docs around stable step keys, structured explanations and deltas, canonical serialization, and terminal comparison metric requirements.
- Added a synchronized comparison mode in `apps/web` with shared-input sorting matchups, side-by-side replay stages, metric leaders, and trend charts.
- Upgraded the seeded web trace builders to the structured `trace-core` contract with explicit changes, highlights, explanations, and deterministic comparison metrics.
- Expanded the replay shell with selection sort, structured step inspection, and compare-ready documentation for the frontend surfaces.
- Added durable TraceDeck persistence APIs for algorithms, runs, step windows, and comparison records in `apps/api`.
- Introduced an atomic file-backed storage engine for local run history and cached comparison retrieval.
- Fixed the API bootstrap so `TRACEDECK_DATA_FILE` now drives the persistence store path during local runs and restart verification.
- Documented the persistence contract and local storage behavior in the architecture and API docs.
- Expanded `packages/trace-core` with canonical JSON snapshot normalization, structured changes/highlights/explanations, and replay invariant metadata for deterministic trace persistence.
- Added trace-core validation coverage for metric declarations, terminal comparison metrics, and canonical serialization helpers.
- Documented the shared trace contract invariants in the architecture and workspace overview docs.
- Established the workspace monorepo foundation around `apps/web`, `apps/api`, and `packages/trace-core`.
- Added a root development orchestrator plus consistent `check` and `smoke` commands for local verification.
- Updated the workspace-level docs to match the current foundation scope and repository-facing language.
