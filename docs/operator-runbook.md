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
- Insertion Sort on `sorting.baseline`
- Shell Sort on `sorting.baseline`
- Selection Sort on `sorting.baseline`
- Quick Sort on `sorting.baseline`
- Merge Sort on `sorting.baseline`
- Heap Sort on `sorting.baseline`
- Bubble Sort on `sorting.reverse-sorted`
- Insertion Sort on `sorting.reverse-sorted`
- Shell Sort on `sorting.reverse-sorted`
- Selection Sort on `sorting.reverse-sorted`
- Quick Sort on `sorting.reverse-sorted`
- Merge Sort on `sorting.reverse-sorted`
- Heap Sort on `sorting.reverse-sorted`
- Binary Search on `search.reference-hit`
- Binary Search on `search.missing-target`
- Search in Rotated Sorted Array on `search.rotated-reference-hit`
- Search in Rotated Sorted Array on `search.rotated-missing-target`
- Container With Most Water on `two-pointers.reference-basin`
- Container With Most Water on `two-pointers.inner-peak`
- Trapping Rain Water on `two-pointers.reference-rain-basin`
- Trapping Rain Water on `two-pointers.stepped-reservoir`
- Minimum Size Subarray Sum on `window.reference-target`
- Minimum Size Subarray Sum on `window.no-solution`
- Longest Substring Without Repeating Characters on `window.reference-substring`
- Longest Substring Without Repeating Characters on `window.overlapping-repeat`
- Two Sum on `hash.reference-hit`
- Two Sum on `hash.negative-values`
- Kth Largest Element in an Array on `heap.reference-kth`
- Kth Largest Element in an Array on `heap.duplicate-cutoff`
- Top K Frequent Elements on `heap.reference-top-frequencies`
- Top K Frequent Elements on `heap.tie-frequency-cutoff`
- Merge Intervals on `interval.reference-overlap`
- Merge Intervals on `interval.touching-ranges`
- Longest Common Subsequence on `dynamic-programming.reference-overlap`
- Longest Common Subsequence on `dynamic-programming.no-overlap`
- Valid Parentheses on `stack.reference-valid`
- Valid Parentheses on `stack.early-mismatch`
- Daily Temperatures on `stack.reference-forecast`
- Daily Temperatures on `stack.late-spike`
- Largest Rectangle in Histogram on `stack.reference-histogram`
- Largest Rectangle in Histogram on `stack.inner-valley`
- Min Stack on `stack.reference-min-stack`
- Min Stack on `stack.recovering-minimum`
- Breadth-First Search on `graph.reference-route`
- Breadth-First Search on `graph.disconnected-target`
- Depth-First Search on `graph.reference-route`
- Depth-First Search on `graph.disconnected-target`
- Dijkstra on `graph.reference-route`
- Dijkstra on `graph.weighted-detour`
- Network Delay Time on `graph.reference-broadcast`
- Network Delay Time on `graph.unreachable-broadcast`
- Clone Graph on `graph.reference-clone`
- Clone Graph on `graph.disconnected-clone`
- Graph Valid Tree on `graph.reference-tree`
- Graph Valid Tree on `graph.cycle-closing-tree`
- Course Schedule on `graph.reference-schedule`
- Course Schedule on `graph.blocked-cycle`
- Rotting Oranges on `graph.reference-oranges`
- Rotting Oranges on `graph.isolated-fresh`
- Number of Islands on `graph.reference-islands`
- Number of Islands on `graph.diagonal-islands`
- Pacific Atlantic Water Flow on `graph.reference-flow`
- Pacific Atlantic Water Flow on `graph.interior-sink`
- Shortest Bridge on `graph.reference-bridge`
- Shortest Bridge on `graph.single-gap-bridge`
- Shortest Path in Binary Matrix on `graph.reference-binary-path`
- Shortest Path in Binary Matrix on `graph.sealed-binary-exit`
- Surrounded Regions on `graph.reference-capture`
- Surrounded Regions on `graph.border-safe`
- Walls and Gates on `graph.reference-gates`
- Walls and Gates on `graph.isolated-rooms`
- A baseline sorting comparison between Bubble Sort and Selection Sort
- A reverse-sorted sorting comparison between Bubble Sort and Selection Sort

That seed currently produces 36 algorithms with runs, 72 runs total, and 2 saved comparisons.

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
