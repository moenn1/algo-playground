# Developer Workflow

## Requirements

- Node.js 20.11 or newer
- `npm` 10 or newer

## Install

```bash
npm install
```

If your environment requires a proxy, `npm` and git should honor the standard `HTTP_PROXY`, `HTTPS_PROXY`, and `NO_PROXY` variables.

## Local Development

Start both services from the repo root:

```bash
npm run dev
```

The root script keeps the API and web processes tied to the same terminal session so local setup stays predictable.

Start the deterministic local demo stack when you need persisted baseline runs and comparison records ready on boot:

```bash
npm run dev:demo
```

That flow reseeds `.tracedeck/demo-storage.json` and passes it through `TRACEDECK_DATA_FILE` to both local services.

Start a single workspace when you only need one surface:

```bash
npm run dev:api
npm run dev:web
```

The web app proxies `/api/*` requests to the local API on port `4000`.

Seed or inspect the demo persistence file without starting the dev servers:

```bash
npm run demo:seed -- --replace
npm run demo:summary
```

Use `--data-file <path>` with either command when you want the seeded dataset somewhere other than `.tracedeck/demo-storage.json`.

## Verification

Run the full local smoke check:

```bash
npm run smoke
```

Or run individual stages:

```bash
npm run verify:workspaces
npm run lint
npm run typecheck
npm run test
npm run build
```

`npm run verify:workspaces` checks that internal TraceDeck workspace packages are recorded in `package-lock.json` and linked correctly under `node_modules/@tracedeck/*` before lint, typecheck, test, or Vite startup depend on them.

## Package Conventions

- Put cross-cutting contracts in `packages/trace-core`.
- Keep HTTP boundaries and persistence flows inside `apps/api`.
- Keep replay UI state derived from trace payloads inside `apps/web`.
- Prefer additive contracts so trace consumers can evolve without silent semantic drift.

## Operator Runbook

Use `docs/operator-runbook.md` for the local orchestration sequence, seeded demo expectations, reset policy, and operator verification checks.
