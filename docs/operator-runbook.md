# TraceDeck Operator Runbook

This runbook covers the local orchestration path for TraceDeck, including deterministic demo seeding and the persistence file layout used during operator checks.

## Default local modes

Use the regular local stack when you want the API to write into the default workspace data file:

```bash
npm run dev
```

Use the seeded demo stack when you want replayable runs and comparison records available immediately after startup:

```bash
npm run dev:demo
```

`npm run dev:demo` always reseeds `.tracedeck/demo-storage.json` before it starts the API and web processes. The generated file is local-only and ignored by git.

## Seeded demo contents

The demo seed currently materializes:

- Bubble Sort on `sorting.baseline`
- Selection Sort on `sorting.baseline`
- Bubble Sort on `sorting.reverse-sorted`
- Selection Sort on `sorting.reverse-sorted`
- Binary Search on `search.reference-hit`
- Binary Search on `search.missing-target`
- Minimum Size Subarray Sum on `window.reference-target`
- Minimum Size Subarray Sum on `window.no-solution`
- Longest Common Subsequence on `dynamic-programming.reference-overlap`
- Longest Common Subsequence on `dynamic-programming.no-overlap`
- Dijkstra on `graph.reference-route`
- Dijkstra on `graph.weighted-detour`
- A baseline sorting comparison between Bubble Sort and Selection Sort
- A reverse-sorted sorting comparison between Bubble Sort and Selection Sort

Those records are stored with `seeded-demo` tags so operators can distinguish them from ad hoc local runs.

## Manual demo store operations

Seed the default demo store directly:

```bash
npm run demo:seed -- --replace
```

Inspect the seeded file without launching the local servers:

```bash
npm run demo:summary
```

Use a different storage target when needed:

```bash
npm run demo:seed -- --replace --data-file /tmp/tracedeck-demo.json
npm run demo:summary -- --data-file /tmp/tracedeck-demo.json
```

The seed command refuses to write into a non-empty target unless `--replace` is provided.

## Persistence guidance

- `npm run dev` defaults to `.tracedeck/storage.json` unless `TRACEDECK_DATA_FILE` is already set.
- `npm run dev:demo` targets `.tracedeck/demo-storage.json`.
- `TRACEDECK_DATA_FILE` remains the override for custom local storage paths.
- The API persists data atomically, so reseeding replaces the file as a single write target rather than partially mutating it.

## Verification

Use these checks after orchestration or persistence changes:

```bash
npm run demo:seed -- --replace
npm run demo:summary
npm run check
```

If the local stack is already running, verify the seeded metadata through the API:

```bash
curl http://localhost:4000/api/persistence
curl http://localhost:4000/api/runs
curl http://localhost:4000/api/comparisons
```
