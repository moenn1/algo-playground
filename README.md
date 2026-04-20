# TraceDeck

TraceDeck is an interactive algorithm execution platform built around deterministic traces, replayable timelines, and comparison-ready metric surfaces.

This repository starts with the product foundation: a workspace-based codebase, a small API boundary, a replay-oriented web shell, and shared execution contracts that future persistence and comparison work build on.

## Workspace Layout

```text
apps/
  api/            Fastify service for foundation metadata and future run APIs
  web/            React replay shell and visualization UX
packages/
  trace-core/     Shared trace schema, replay invariants, graph execution builders, and validation helpers
docs/             Architecture and workflow notes
```

## Run Locally

Install workspace dependencies first:

```bash
npm install
```

Start the API and web shell together:

```bash
npm run dev
```

Run a single workspace when you only need one surface:

```bash
npm run dev:api
npm run dev:web
```

The web app runs on `http://localhost:5173` and proxies `/api` to the local API on port `4000`.

## Current Foundation

- `apps/web` exposes the replay shell for Bubble Sort, Breadth-First Search, and Dijkstra: transport controls, deterministic timeline scrubbing, and state-specific sorting and graph views.
- `apps/api` serves foundation metadata and the health endpoint that local development depends on.
- `packages/trace-core` holds the deterministic trace envelope contract, replay invariants, reusable BFS/Dijkstra execution builders, and validation helpers.
- `docs/` captures the architecture, workflow, and replay-model decisions that shape upcoming execution and persistence work.

## Graph Execution Engine

- BFS and Dijkstra now share one replay-safe graph state model with `distances`, `visited`, `frontier`, `current`, `activeEdge`, and `path`.
- The shared graph engine records explicit `changes`, structured `highlights`, and human-readable `explanation` data on every step so the backend and replay shell consume the same semantics.
- BFS preserves queue order and hop-count distances, while Dijkstra preserves distance-ordered frontier extraction and weighted route updates.

## Verification

```bash
npm run check
npm run smoke
```
