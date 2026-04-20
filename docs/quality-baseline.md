# Quality Baseline

## Scope

This document defines the local quality baseline for TraceDeck before broader CI workflow automation is layered on top.

## Local Verification Layers

### Workspace Health

- `npm run lint` validates the shared TypeScript and JavaScript surface.
- `npm run typecheck` verifies the API, web, and trace-contract workspaces together.
- `npm run build` ensures the API, web, and shared contract compile as production artifacts.

### Test Layers

- `npm run test:trace-core` protects the canonical trace envelope and replay invariants.
- `npm run test:api` covers service-boundary behavior and secure local defaults.
- `npm run test:web` is reserved for replay-shell and interaction tests as the UI surface expands.
- `npm run verify:contracts` is the focused guardrail for deterministic trace-contract changes.

### Full Smoke Pass

- `npm run smoke` remains the local pre-push gate for a full lint, typecheck, test, and build pass.

## Determinism Expectations

- Trace payloads must stay JSON-serializable with stable step ordering and explicit metric definitions.
- Contract changes should add or update trace-core tests before downstream work depends on them.
- Replay surfaces should consume recorded snapshots directly rather than re-deriving hidden state.

## Dependency Hygiene

- The root workspace enforces Node.js and npm minimum versions through `engines`.
- `.npmrc` enables `engine-strict` so unsupported runtimes fail early during install.
- Dependency additions should land with tests or docs that explain why the new package belongs in the stack.

## Secure Local Defaults

- The API binds to `127.0.0.1` by default for local development.
- Use explicit `HOST` and `PORT` environment overrides when external network exposure is intentional.
- Documentation and runbooks should treat broader network exposure as an opt-in behavior.
