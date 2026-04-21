# TraceDeck CI And Docs Guard

## GitHub Actions workflow

TraceDeck runs a single GitHub Actions workflow on pull requests and on pushes to `main`, `feature/*`, and `fix/*` branches.

- `Docs Guard` resolves the diff range first and blocks merges when implementation or workflow changes land without both `CHANGELOG.md` and a repository-facing doc update in `README.md` or `docs/`.
- `Build Verification` restores the npm cache from the root `package-lock.json`, runs `npm ci` so dependency resolution stays lockfile-exact, validates internal workspace links with `npm run verify:workspaces`, and then runs `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.

The workflow lives in `.github/workflows/ci.yml` and uses `.nvmrc` to keep the GitHub Actions Node version aligned with local development.

The repo now also runs the same workspace-integrity check during root `npm install` and ahead of build, test, demo, and workspace-start commands so local failures match CI more closely. CI uses `npm ci` instead of `npm install`, which means changes to `package.json` that are not reflected in the committed root lockfile fail during dependency installation instead of being repaired implicitly inside GitHub Actions.

## Dependency install and cache contract

`Build Verification` uses `actions/setup-node` with `cache: npm` and `cache-dependency-path: package-lock.json`.

That makes the cache key follow the committed root lockfile instead of incidental workspace state on the runner, and it keeps cache reuse bounded to the exact dependency graph that TraceDeck has checked into source control.

The expected maintenance rules are:

- update and commit the root `package-lock.json` in the same change set as any dependency manifest change
- keep CI dependency installs at the repository root so npm materializes the full workspace graph before verification begins
- use local `npm install` when intentionally refreshing the lockfile, and expect CI to validate the result with `npm ci`

## Local docs guard usage

Run the guard directly when you want to validate a change before pushing:

```bash
node scripts/check-docs.mjs --base <git-sha> --head HEAD
```

You can also validate explicit file lists when you only need to check a targeted subset of changes:

```bash
node scripts/check-docs.mjs --file .github/workflows/ci.yml --file docs/ci-cd.md --file CHANGELOG.md
```

## Local workspace integrity guard

Run the workspace guard after `npm install` when you need to confirm that internal TraceDeck packages are linked correctly:

```bash
npm run verify:workspaces
```

The guard resolves the repository root from `scripts/check-workspace-links.mjs`, so the same validation works when it is triggered from root commands, CI, or workspace lifecycle hooks such as `prebuild` and `pretypecheck`.

The guard fails when:

- a workspace package is declared but missing from the root workspace map
- `package-lock.json` does not record the workspace link metadata
- `node_modules/@tracedeck/*` does not point at the expected local workspace directory

When the guard fails, the expected recovery path is to rerun `npm install` from the repository root. Nested installs inside `apps/*` or `packages/*` are not treated as valid TraceDeck workspace bootstraps.

## Enforcement scope

The guard treats the following paths as implementation or delivery changes that require docs plus changelog updates:

- `apps/`
- `packages/`
- `scripts/`
- `.github/workflows/`
- `.gitignore`
- `.nvmrc`
- `eslint.config.js`
- `package.json`
- `tsconfig.base.json`

When local dependency installation is blocked, keep the GitHub Actions changes, the nearest relevant docs update, and the changelog entry in the same change set, then document the verification blocker in the pull request. When CI fails in the install step, inspect `package-lock.json` first because the workflow no longer regenerates dependency state on the runner.
