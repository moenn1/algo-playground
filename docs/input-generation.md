# Input Generation API

## Scope

`apps/api` exposes a deterministic input-service layer for TraceDeck clients that need repeatable demo data, preset scenarios, and validated custom payloads.

The service currently covers the supported algorithms already present in the workspace:

- Sorting: `bubble-sort`, `selection-sort`, `quick-sort`, `merge-sort`
- Search: `binary-search`, `search-in-rotated-sorted-array`
- Two-pointers: `container-with-most-water`, `trapping-rain-water`
- Window: `minimum-size-subarray-sum`
- Hash: `two-sum`
- Heap: `kth-largest-element-in-an-array`
- Interval: `merge-intervals`
- Dynamic Programming: `longest-common-subsequence`
- Stack: `valid-parentheses`, `daily-temperatures`, `largest-rectangle-in-histogram`, `min-stack`
- Graph: `bfs`, `dijkstra`, `course-schedule`, `rotting-oranges`, `number-of-islands`

## Endpoints

### `GET /api/input-presets`

Returns the available preset catalog.

Optional query parameters:

- `algorithmId`
- `domain`

Each preset summary includes:

- Stable `id`
- `scenario`, `kind`, and `description`
- Supported `algorithms`
- `supportsSeed`
- Any `defaultSeed` and `defaultOptions`

### `GET /api/input-presets/:presetId`

Returns a single preset definition without materializing an input payload.

### `POST /api/input-presets/:presetId/resolve`

Materializes a preset into a normalized input payload.

Request body:

```json
{
  "algorithmId": "bubble-sort",
  "seed": 17,
  "options": {
    "size": 8
  }
}
```

Response shape:

```json
{
  "source": "preset",
  "preset": {
    "id": "sorting.random-distinct",
    "scenario": "random"
  },
  "algorithm": {
    "id": "bubble-sort",
    "label": "Bubble Sort",
    "domain": "sorting"
  },
  "input": [12, 19, 7, 31, 4, 26, 8, 15],
  "normalizedInputText": "12, 19, 7, 31, 4, 26, 8, 15",
  "footprint": "8 lanes",
  "seed": 17,
  "options": {
    "size": 8
  }
}
```

### `POST /api/inputs/validate`

Validates and normalizes custom payloads before clients create runs.

Request body:

```json
{
  "algorithmId": "dijkstra",
  "payload": {
    "nodes": ["A", "B", "C"],
    "edges": [["A", "B", 2], ["B", "C", 3]],
    "start": "A",
    "target": "C",
    "directed": false
  }
}
```

The response includes the normalized `input`, `normalizedInputText`, and `footprint`.

## Preset Catalog

### Sorting presets

- `sorting.baseline`: fixed demo array aligned with the replay shell
- `sorting.reverse-sorted`: descending worst-case scenario with `size`, `start`, and `step`
- `sorting.nearly-sorted`: seeded near-best-case scenario with `size` and `swaps`
- `sorting.random-distinct`: seeded random distinct integers with `size`, `minimum`, and `maximum`

Every sorting preset can be resolved for Bubble Sort, Selection Sort, Quick Sort, or Merge Sort through the same `algorithmId` field.

### Graph presets

- `graph.reference-route`: fixed weighted graph aligned with the replay shell
- `graph.disconnected-target`: curated no-route scenario
- `graph.weighted-detour`: curated pathfinding case with a cheaper multi-hop route
- `graph.reference-schedule`: curated prerequisite graph with a deterministic topological order
- `graph.blocked-cycle`: curated prerequisite graph where a dependency cycle blocks completion
- `graph.reference-oranges`: curated infection grid that resolves after several minute waves
- `graph.isolated-fresh`: curated infection grid where one fresh orange remains unreachable
- `graph.reference-islands`: curated archipelago grid with three deterministic connected components
- `graph.diagonal-islands`: curated diagonal land pattern that stays disconnected under four-directional adjacency
- `graph.random-network`: seeded generated network with `nodes`, `extraEdges`, and `directed`

The first three graph presets plus `graph.random-network` resolve for Breadth-First Search or Dijkstra through the same `algorithmId` field. BFS ignores edge weights but preserves the shared graph input contract so pathfinding fixtures can be replayed across both algorithms.

The scheduling presets resolve for Course Schedule and use `{ "courseCount": number, "prerequisites": [[course, prerequisite], ...] }` as the normalized contract.

The infection presets resolve for Rotting Oranges and use `{ "grid": number[][] }` as the normalized contract, where `0` is empty, `1` is fresh, and `2` is rotten.

The island-count presets resolve for Number of Islands and use `{ "grid": string[][] }` as the normalized contract, where `"0"` is water and `"1"` is land. Numeric `0` and `1` values are accepted during validation and normalized to strings.

### Search presets

- `search.reference-hit`: curated sorted array where the target is present
- `search.missing-target`: curated sorted array where the target is absent
- `search.rotated-reference-hit`: curated rotated array where the target sits behind the pivot
- `search.rotated-missing-target`: curated rotated array where the target is absent

The sorted search presets resolve for Binary Search. The rotated search presets resolve for Search in Rotated Sorted Array.

### Window presets

- `window.reference-target`: curated positive-array case with a shrinking best window
- `window.no-solution`: curated positive-array case where no contiguous window reaches the target

Both window presets currently resolve for Minimum Size Subarray Sum through the same `algorithmId` field.

### Two-pointers presets

- `two-pointers.reference-basin`: curated classic wall array with an early large container and clear outward-to-inward pruning
- `two-pointers.inner-peak`: curated wall array where the best container appears after several inward pointer moves
- `two-pointers.reference-rain-basin`: curated classic skyline with zero-height dips and fills on both sides of the basin
- `two-pointers.stepped-reservoir`: curated stepped skyline with repeated interior fills under stable outer walls

The first two-pointer presets currently resolve for Container With Most Water. The rain-basin presets currently resolve for Trapping Rain Water.

### Hash presets

- `hash.reference-hit`: curated classic Two Sum case with an early complement hit
- `hash.negative-values`: curated mixed-sign case where the complement crosses the sign boundary

Both hash presets currently resolve for Two Sum through the same `algorithmId` field.

### Heap presets

- `heap.reference-kth`: curated classic kth-largest fixture that shows heap seeding, root replacement, and the final cutoff
- `heap.duplicate-cutoff`: curated duplicate-heavy fixture that shows how equal high values interact with the size-`k` heap near the threshold

Both heap presets currently resolve for Kth Largest Element in an Array through the same `algorithmId` field.

### Interval presets

- `interval.reference-overlap`: curated classic Merge Intervals chain with one large early merge and two preserved disjoint outputs
- `interval.touching-ranges`: curated boundary-touching case that shows inclusive overlap at exact shared endpoints

Both interval presets currently resolve for Merge Intervals through the same `algorithmId` field.

### Dynamic-programming presets

- `dynamic-programming.reference-overlap`: curated pair of strings with a non-trivial shared subsequence and visible traceback
- `dynamic-programming.no-overlap`: curated pair of strings with no shared characters so the runtime still exercises table fill plus deterministic traceback

Both dynamic-programming presets currently resolve for Longest Common Subsequence through the same `algorithmId` field.

### Stack presets

- `stack.reference-valid`: curated balanced bracket string with a clean empty-stack finish
- `stack.early-mismatch`: curated crossing mismatch that fails on the first invalid closer
- `stack.reference-forecast`: curated canonical forecast with multiple warmer-day resolutions
- `stack.late-spike`: curated forecast where one late warm day resolves several waiting days at once
- `stack.reference-histogram`: curated canonical skyline where one flush closes the widest rectangle after several deterministic pops
- `stack.inner-valley`: curated valley-shaped skyline that forces several candidate rectangles to resolve before the final best span is clear
- `stack.reference-min-stack`: curated classic Min Stack operation stream with pushes, reads, a pop, and minimum recovery
- `stack.recovering-minimum`: curated operation stream where a deeper low is removed and the previous minimum resurfaces explicitly in replay

The bracket presets resolve for Valid Parentheses. The forecast presets resolve for Daily Temperatures. The histogram presets resolve for Largest Rectangle in Histogram. The operation-sequence presets resolve for Min Stack.

## Validation Rules

- Sorting payloads accept either integer arrays or comma-separated integer strings.
- Search payloads accept either JSON objects or JSON strings.
- Two-pointer payloads accept either JSON objects or JSON strings.
- Window payloads accept either JSON objects or JSON strings.
- Hash payloads accept either JSON objects or JSON strings.
- Heap payloads accept either JSON objects or JSON strings.
- Interval payloads accept either JSON objects or JSON strings.
- Dynamic-programming payloads accept either JSON objects or JSON strings.
- Stack payloads accept either JSON objects or JSON strings.
- Graph payloads accept either JSON objects or JSON strings.
- Sorting inputs must contain between 2 and 24 integers.
- Binary Search payloads must define a sorted integer array between 2 and 32 entries plus an integer target.
- Search in Rotated Sorted Array payloads must define a distinct-integer array between 2 and 32 entries that is a rotation of a strictly increasing array, plus an integer target.
- Two-pointer payloads must define between 2 and 24 non-negative integers in `heights`.
- Window payloads must define between 2 and 32 positive integers plus a positive integer target.
- Hash payloads must define between 2 and 24 integers plus an integer target, and they must contain exactly one valid solution pair so replay stays deterministic.
- Heap payloads must define between 2 and 24 integers plus an integer `k` between `1` and the array length.
- Interval payloads must define between 1 and 12 `[start, end]` integer pairs where `start <= end`.
- Dynamic-programming payloads must define non-empty `left` and `right` strings up to 12 characters each.
- Valid Parentheses payloads must define a non-empty bracket expression up to 32 characters using only `()`, `[]`, and `{}`.
- Daily Temperatures payloads must define between 2 and 24 integer temperatures in the inclusive range `0` through `150`.
- Largest Rectangle in Histogram payloads must define between 1 and 24 integer heights in the inclusive range `0` through `150`.
- Min Stack payloads must define between 1 and 24 operations using `push`, `pop`, `top`, and `getMin`; `push` values must be integers in the inclusive range `-999` through `999`; and non-push operations cannot run on an empty stack.
- Pathfinding graph payloads must define valid node ids, positive edge weights, and edge endpoints that exist in the node set.
- Course Schedule payloads must define an integer `courseCount` between 2 and 16 plus `[course, prerequisite]` pairs that stay within range and never self-reference.
- Rotting Oranges payloads must define a rectangular `grid` between `1 x 1` and `8 x 8`, and every cell must be `0`, `1`, or `2`.
- Number of Islands payloads must define a rectangular `grid` between `1 x 1` and `8 x 8`, and every cell must normalize to `"0"` or `"1"`.
- Preset option objects reject unknown keys so clients can treat the contract as explicit rather than best-effort.

## Design Notes

- Seeded presets are deterministic: the same `presetId`, `algorithmId`, `seed`, and `options` produce the same normalized payload.
- Preset resolution is server-side so replay clients, persistence flows, and future automation can share the same scenario contract.
- Custom validation returns normalized text alongside structured JSON so UI editors can preserve domain-specific formatting without reimplementing parsers.
