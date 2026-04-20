# TraceDeck

TraceDeck is an interactive algorithm execution platform built around deterministic traces, replayable timelines, persisted run history, and comparison-ready metric surfaces.

This repository starts with the product foundation: a workspace-based codebase, a persistence-ready API boundary, a web shell for replay-oriented UX direction, shared sorting, search, and graph execution engines, and a shared trace contract that execution and history features build on.

## Workspace Layout

```text
apps/
  api/            Fastify service for persistence, input, comparison, and foundation APIs
  web/            React replay shell and visualization UX
packages/
  execution-engine/ Shared sorting and graph runtimes plus trace emitters
  trace-core/     Shared trace schema, replay invariants, and validation helpers
docs/             Architecture and workflow notes
```

## Run Locally

Install workspace dependencies first:

```bash
npm install
```

Run that command from the repository root. TraceDeck now verifies the internal `@tracedeck/*` workspace links during install and before local build, test, demo, or dev commands start, so nested `npm install` runs inside `apps/*` or `packages/*` are rejected as incomplete workspace bootstraps.

Start the API and web shell together:

```bash
npm run dev
```

Start the seeded local demo environment when you want a predictable persistence dataset for replay, history, and comparison checks:

```bash
npm run dev:demo
```

Run a single workspace when you only need one surface:

```bash
npm run dev:api
npm run dev:web
```

The web app runs on `http://localhost:5173` and proxies `/api` to the local API on port `4000`.

Set `TRACEDECK_DATA_FILE` when you want the API to store durable run history somewhere other than the default local path at `.tracedeck/storage.json`. The Fastify entrypoint reads that env var directly, so local runs and restart checks can point at a stable file without changing source code.

`npm run dev:demo` seeds `.tracedeck/demo-storage.json` before startup and then launches both services against that file. You can inspect or reseed that dataset manually with:

```bash
npm run demo:seed -- --replace
npm run demo:summary
```

See `docs/operator-runbook.md` for the local operator workflow, expected demo dataset, and reset guidance.

## Persistence API

The API now exposes durable storage for algorithms, runs, step windows, and comparison records:

- `GET /api/persistence` for storage metadata and aggregate counts
- `GET /api/algorithms` for registered algorithms and run counts
- `POST /api/runs`, `GET /api/runs`, `GET /api/runs/:runId`, and `GET /api/runs/:runId/steps`
- `POST /api/comparisons`, `GET /api/comparisons`, and `GET /api/comparisons/:comparisonId`

Run summaries stay lightweight while replay clients can page step payloads on demand.

## Input Services

The API also exposes a deterministic input-service layer for preset scenarios and validated custom payloads:

- `GET /api/input-presets` and `GET /api/input-presets/:presetId`
- `POST /api/input-presets/:presetId/resolve`
- `POST /api/inputs/validate`

The current preset catalog covers seeded random inputs, worst-case scenarios, curated baselines, binary-search fixtures, and graph pathfinding cases across Bubble Sort, Selection Sort, Quick Sort, Merge Sort, Binary Search, Breadth-First Search, and Dijkstra. See `docs/input-generation.md` for the contract and option details.

## Current Foundation

- `apps/web` exposes the replay and comparison shell: seeded traces, command-surface telemetry, deterministic timeline scrubbing, active-frame step inspection, a dedicated binary-search interval stage, one shared graph runtime for BFS and Dijkstra, and a synchronized sorting comparison deck across four shared-engine sorting algorithms.
- `apps/api` serves durable run persistence, input preset resolution, comparison APIs, foundation metadata, and the health endpoint that local development depends on.
- `packages/execution-engine` owns the shared sorting, search, and graph runtimes, deterministic replay state projection, and trace emitters for Bubble Sort, Selection Sort, Quick Sort, Merge Sort, Binary Search, Breadth-First Search, and Dijkstra.
- `packages/trace-core` holds the deterministic trace envelope contract, replay invariants, validation helpers, and shared instrumentation primitives for runtime-to-trace projection.
- `docs/` captures the architecture, execution-engine, workflow, persistence-model, and input-service decisions that shape execution and replay work.
- `docs/operator-runbook.md` captures the local orchestration and seeded-demo operating flow.

## Verification

```bash
npm run check
npm run smoke
```

All local entrypoints that depend on shared packages now fail fast with the workspace-integrity guard. If a command reports missing `@tracedeck/*` links, rerun `npm install` from the repository root before retrying.
