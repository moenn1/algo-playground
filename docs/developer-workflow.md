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

Start a single workspace when you only need one surface:

```bash
npm run dev:api
npm run dev:web
```

The web app proxies `/api/*` requests to the local API on port `4000`.

## Verification

Run the full local smoke check:

```bash
npm run smoke
```

Or run individual stages:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Package Conventions

- Put cross-cutting contracts in `packages/trace-core`.
- Keep HTTP boundaries and persistence flows inside `apps/api`.
- Keep replay UI state derived from trace payloads inside `apps/web`.
- Prefer additive contracts so trace consumers can evolve without silent semantic drift.

## Documentation Baseline

- Update the nearest relevant docs in the same iteration as implementation changes.
- Keep `CHANGELOG.md` aligned with each reviewable change set.
- Use the docs in this repo as the product and contributor entrypoint rather than relying on source discovery alone.
