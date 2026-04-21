# TraceDeck

TraceDeck is an interactive algorithm execution platform built around deterministic traces, replayable timelines, persisted run history, comparison-ready metric surfaces, and a route-based interface that separates overview, replay, reference, and saved activity.

This repository starts with the product foundation: a workspace-based codebase, a persistence-ready API boundary, a multi-route web interface for replay-oriented UX, shared sorting, search, two-pointers, window, hash, interval, dynamic-programming, stack, and graph execution engines, and a shared trace contract that execution and history features build on.

## Workspace Layout

```text
apps/
  api/            Fastify service for persistence, input, comparison, and foundation APIs
  web/            React replay interface and visualization UX
packages/
  execution-engine/ Shared sorting, search, two-pointers, window, hash, interval, dynamic-programming, stack, and graph runtimes plus trace emitters
  trace-core/     Shared trace schema, replay invariants, and validation helpers
docs/             Architecture and workflow notes
```

## Run Locally

Install workspace dependencies first:

```bash
npm install
```

Run that command from the repository root. TraceDeck now verifies the internal `@tracedeck/*` workspace links during install and before local build, test, demo, or dev commands start, so nested `npm install` runs inside `apps/*` or `packages/*` are rejected as incomplete workspace bootstraps.

Start the API and web interface together:

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

## Interface Routes

The web app is organized into distinct routes instead of one vertically condensed page:

- `#/overview` overview index with route selection, persistence status, and recent activity
- `#/playground/:algorithmId?` single-run replay workspace, and the default first-load route when the hash is empty
- `#/library` algorithm catalog with a docked filter rail, shareable browse state for domain, stage, goal, sort, and search filters, and dense result rows for reference-first scanning
- `#/algorithms/:algorithmId` focused reference pages for each algorithm
- `#/history` saved runs and saved comparison records
- `#/compare` synchronized sorting comparison view

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

The current preset catalog covers seeded random inputs, worst-case scenarios, curated baselines, binary-search fixtures, rotated-search fixtures, two-pointer cases, numeric and string sliding-window cases, array-and-hash cases, heap cutoff and top-frequency cases, interval merges, dynamic-programming references, stack-validation, monotonic-stack, histogram-rectangle, stack-operation cases, and graph pathfinding, weighted-broadcast, clone-construction, tree-validation, connected-component counting, redundant-edge detection, dependency-scheduling, returned-course-order scheduling, grid-infection, largest-island area ledgers, coastline-perimeter accounting, shortest-bridge expansion, binary-matrix pathfinding, nearest-zero distance matrices, shoreline-distance ledgers, water-seeded height maps, dual-ocean reachability, border-capture, plus room-distance-fill cases across Bubble Sort, Insertion Sort, Shell Sort, Selection Sort, Quick Sort, Merge Sort, Heap Sort, Binary Search, Search in Rotated Sorted Array, Container With Most Water, Trapping Rain Water, Minimum Size Subarray Sum, Longest Substring Without Repeating Characters, Two Sum, Kth Largest Element in an Array, Top K Frequent Elements, Merge Intervals, Longest Common Subsequence, Valid Parentheses, Daily Temperatures, Largest Rectangle in Histogram, Min Stack, Breadth-First Search, Depth-First Search, Dijkstra, Network Delay Time, Clone Graph, Graph Valid Tree, Count Connected Components, Redundant Connection, Course Schedule, Course Schedule II, Rotting Oranges, Number of Islands, Max Area of Island, Island Perimeter, Pacific Atlantic Water Flow, Shortest Bridge, Shortest Path in Binary Matrix, 01 Matrix, As Far from Land as Possible, Map of Highest Peak, Surrounded Regions, and Walls and Gates. See `docs/input-generation.md` for the contract and option details.

## Current Foundation

- `apps/web` exposes the multi-route replay interface: overview, replay, a browseable algorithm library with a calmer filter rail, progression paths, dense result-ledger rows, and shareable discovery filters, algorithm detail pages, saved-run history, and a dedicated comparison view backed by seeded traces, deterministic timeline scrubbing, active-frame step inspection, reusable visualization modules, domain-specific replay stages, and synchronized sorting matchups.
- `apps/api` serves durable run persistence, input preset resolution, comparison APIs, foundation metadata, and the health endpoint that local development depends on.
- `packages/execution-engine` owns the shared sorting, search, two-pointers, window, hash, heap, interval, dynamic-programming, stack, and graph runtimes, deterministic replay state projection, and trace emitters for Bubble Sort, Insertion Sort, Shell Sort, Selection Sort, Quick Sort, Merge Sort, Heap Sort, Binary Search, Search in Rotated Sorted Array, Container With Most Water, Trapping Rain Water, Minimum Size Subarray Sum, Longest Substring Without Repeating Characters, Two Sum, Kth Largest Element in an Array, Top K Frequent Elements, Merge Intervals, Longest Common Subsequence, Valid Parentheses, Daily Temperatures, Largest Rectangle in Histogram, Min Stack, Breadth-First Search, Depth-First Search, Dijkstra, Network Delay Time, Clone Graph, Graph Valid Tree, Count Connected Components, Redundant Connection, Course Schedule, Course Schedule II, Rotting Oranges, Number of Islands, Max Area of Island, Island Perimeter, Pacific Atlantic Water Flow, Shortest Bridge, Shortest Path in Binary Matrix, 01 Matrix, As Far from Land as Possible, Map of Highest Peak, Surrounded Regions, and Walls and Gates.
- `packages/trace-core` holds the deterministic trace envelope contract, replay invariants, validation helpers, and shared instrumentation primitives for runtime-to-trace projection.
- `docs/` captures the architecture, execution-engine, workflow, persistence-model, and input-service decisions that shape execution and replay work.
- `docs/operator-runbook.md` captures the local orchestration and seeded-demo operating flow.

## Verification

```bash
npm run check
npm run smoke
```

All local entrypoints that depend on shared packages now fail fast with the workspace-integrity guard. If a command reports missing `@tracedeck/*` links, rerun `npm install` from the repository root before retrying.
