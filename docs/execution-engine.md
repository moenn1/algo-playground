# Execution Engine

## Scope

`packages/execution-engine` owns reusable algorithm runtimes that emit deterministic TraceDeck envelopes on top of `packages/trace-core`.

The current package covers shared sorting, search, and graph runtimes:

- `bubble-sort`
- `selection-sort`
- `quick-sort`
- `merge-sort`
- `binary-search`
- `bfs`
- `dijkstra`

## Sorting Runtime Model

Every sorting trace projects runtime state into one replay-safe shape:

- `state.array`: the primary array snapshot for the current frame
- `state.activeIndices`: the lanes currently under inspection
- `state.swapPair`: the lanes mutated by the current write or swap step
- `state.sortedIndices`: lanes known to be globally final at that frame

That model keeps replay rendering simple while still letting each algorithm express its own control flow through phase labels, explanations, highlights, and path-based diffs.

## Shared Metric Semantics

Sorting traces currently share two comparison metrics:

- `comparisons`: value-to-value comparisons performed by the algorithm
- `writes`: writes committed into the primary array state

The package intentionally avoids algorithm-specific comparison metrics in the shared deck so Bubble Sort, Selection Sort, Quick Sort, and Merge Sort can stay directly comparable.

## Search Runtime Model

Binary Search currently establishes the first interval-search runtime shape:

- `state.array`: the sorted array snapshot used for every probe
- `state.target`: the requested value the runtime is resolving
- `state.low`: the inclusive left bound of the active interval, or `null` when exhausted
- `state.high`: the inclusive right bound of the active interval, or `null` when exhausted
- `state.mid`: the midpoint lane under inspection for the current probe step
- `state.eliminatedIndices`: lanes ruled out by previous interval cuts
- `state.foundIndex`: the resolved match lane when the target is present

Shared search metrics focus on the binary-search decision path:

- `probes`: midpoint inspections performed so far
- `comparisons`: equality and directional comparisons committed so far

That shape is designed to stay reusable for future interval-search variants because the visualization only depends on sorted input, active bounds, the current probe, and the terminal match state.

## Graph Runtime Model

Breadth-First Search and Dijkstra share one replay-safe graph state shape:

- `state.distances`: recorded hop counts or weighted distances per node
- `state.settled`: nodes whose expansion or shortest-path state is final for the current frame
- `state.frontier`: queue order for BFS or weighted frontier order for Dijkstra
- `state.current`: the node currently being expanded
- `state.activeEdge`: the edge under inspection or relaxation
- `state.path`: the current recovered path overlay

Shared graph metrics keep the runtime readable across both algorithms:

- `settled`: nodes finalized so far
- `frontier`: queue or weighted-frontier size at the recorded frame
- `inspections`: edges inspected so far
- `updates`: predecessor or distance updates committed so far

The frontier representation is intentionally serialized as an ordered array. BFS records queue order directly, while Dijkstra records the weighted frontier sorted by tentative distance and node label tie-breaks.

## Deterministic Emission Rules

- Every algorithm records full snapshots through the `trace-core` recorder helpers.
- Recursive algorithms emit structural checkpoints instead of relying on replay-time recursion.
- Merge sort does not mark intermediate windows as globally sorted; `sortedIndices` only advances when that claim is true for the full array position.
- Quick sort records pivot commits and single-lane base cases explicitly so replay can jump to any partition boundary without reconstructing recursion.
- Binary search records both midpoint probes and discard checkpoints explicitly so replay can jump between interval cuts without re-running bound updates.
- BFS records queue extraction and first-discovery checkpoints explicitly so replay can restore hop-based traversal order without hidden queue mutation.
- Dijkstra records deterministic frontier ordering and settled-node checkpoints so weighted path playback never depends on live priority-queue state.

## Consumers

- `apps/web` builds sorting replay, binary-search replay, BFS replay, and Dijkstra replay from this package.
- `apps/api` exposes the same sorting, search, and graph algorithm identifiers through the input-service layer.
- Demo and persistence workflows consume the envelopes produced by the shared runtime instead of maintaining UI-local sorting builders.
