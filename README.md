# TraceDeck

TraceDeck is an interactive algorithm execution platform built around deterministic traces, replayable timelines, and comparison-ready metric surfaces.

This repository starts with the product foundation: a workspace-based codebase, a small API boundary, a web shell for replay-oriented UX direction, and a shared trace contract that future execution and persistence work will build on.

## Workspace Layout

```text
apps/
  api/            Fastify service for foundation metadata and future run APIs
  web/            React replay shell and visualization UX
packages/
  trace-core/     Shared trace schema, replay invariants, and validation helpers
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

- `apps/web` exposes the replay shell: seeded traces, transport controls, deterministic timeline scrubbing, and state-specific sorting and graph views.
- `apps/api` serves foundation metadata and the health endpoint that local development depends on.
- `packages/trace-core` holds the deterministic trace envelope contract, replay invariants, and validation helpers.
- `docs/` captures the architecture, workflow, and replay-model decisions that shape upcoming execution and persistence work.

## Documentation

- `docs/product-overview.md` maps the product pillars, user flows, and doc set.
- `docs/architecture.md` covers service boundaries, execution flow, and trace invariants.
- `docs/trace-contract.md` defines the replay and comparison contract semantics.
- `docs/roadmap.md` captures milestone sequencing, benchmark suites, and extensibility gates.
- `docs/quality-baseline.md` defines local verification layers, dependency hygiene, and secure defaults.
- `docs/contribution-standards.md` sets implementation, testing, and documentation expectations.
- `docs/diagrams.md` contains mermaid diagrams for system boundaries and trace flow.

## Verification

```bash
npm run check
npm run smoke
```
