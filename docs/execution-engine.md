# Execution Engine

## Scope

`packages/execution-engine` owns reusable algorithm runtimes that emit deterministic TraceDeck envelopes on top of `packages/trace-core`.

The current package covers shared sorting, search, window, dynamic-programming, stack, and graph runtimes:

- `bubble-sort`
- `selection-sort`
- `quick-sort`
- `merge-sort`
- `binary-search`
- `minimum-size-subarray-sum`
- `longest-common-subsequence`
- `valid-parentheses`
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

## Window Runtime Model

Minimum Size Subarray Sum establishes the first sliding-window runtime shape:

- `state.array`: the positive integer array under scan
- `state.target`: the required minimum sum
- `state.left`: the inclusive left bound of the active window, or `null` when the window is collapsed
- `state.right`: the inclusive right bound of the active window, or `null` when the window is collapsed
- `state.activeSum`: the current window sum
- `state.bestStart` and `state.bestEnd`: the best qualifying window recorded so far
- `state.bestLength`: the best qualifying length, or `null` while no candidate exists
- `state.candidateSatisfied`: whether the active window currently meets the target before the next shrink

Shared window metrics focus on replaying the scan and contraction rhythm directly:

- `expansions`: right-edge growth steps performed so far
- `shrinks`: left-edge contraction steps performed so far
- `bestUpdates`: times the runtime published a shorter qualifying window

The runtime records explicit `Expand`, `Candidate`, `Best Update`, `Shrink`, and terminal `Done` or `No Solution` checkpoints so replay never has to infer qualifying intervals from aggregate counters alone.

## Dynamic-Programming Runtime Model

Longest Common Subsequence establishes the first table-driven runtime shape:

- `state.left` and `state.right`: the source strings under comparison
- `state.table`: the full LCS table snapshot, including the zero row and zero column
- `state.activeCell`: the table coordinate currently being filled or traced back
- `state.dependencyCells`: the predecessor cells that justify the current recurrence choice
- `state.currentValue`: the value committed at the active cell, or `null` outside active cell work
- `state.matching`: whether the current active cell came from a character match
- `state.resultLength`: the terminal LCS length once the table is complete
- `state.resultSequence`: the reconstructed subsequence during traceback and on the terminal frame
- `state.tracebackPath`: the ordered coordinates already visited while recovering the subsequence

Shared dynamic-programming metrics keep the table fill and recovery phases readable:

- `cellsComputed`: interior table cells finalized so far
- `matches`: character matches recorded while filling the table
- `tracebackSteps`: traceback moves committed while recovering the result

The runtime records explicit `Initialization`, per-cell `Match` and `Carry`, `Table Complete`, traceback, and terminal `Done` checkpoints so replay can jump between recurrence work and result recovery without recomputing the table in the browser.

## Stack Runtime Model

Valid Parentheses establishes the first stack-validation runtime shape:

- `state.expression`: the bracket string under validation
- `state.cursor`: the current token index, or `null` outside active token work
- `state.currentChar`: the bracket token under inspection for the current frame
- `state.stackTokens`: the opening brackets still waiting for a closer
- `state.stackIndices`: the source indices for those opening brackets
- `state.processedIndices`: the token slots already consumed by the validator
- `state.matchedPairs`: the opener/closer index pairs already validated successfully
- `state.expectedCloser`: the closer currently required by the stack top, or `null` when the stack is empty
- `state.failureIndex` and `state.failureReason`: the first invalid token and the explicit reason it failed
- `state.valid`: `true` for a terminal success, `false` for a terminal failure, and `null` while validation is still in progress

Shared stack metrics keep validation work legible across future stack problems:

- `comparisons`: closer checks performed so far
- `pushes`: opening tokens pushed onto the stack so far
- `pops`: matched opening tokens popped so far

The runtime records explicit `Initialization`, per-token `Push` and `Match`, and terminal `Reject`, `Unclosed`, or `Done` checkpoints so replay can jump directly to the first mismatch or the empty-stack finish without replay-time inference.

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
- Minimum Size Subarray Sum records expansion, qualifying, and shrink checkpoints explicitly so replay can jump between window states without recomputing running sums.
- Longest Common Subsequence records row-major table fills, deterministic up-first traceback ties, and the recovered sequence explicitly so replay can jump between fill and traceback phases without recomputing DP state.
- Valid Parentheses records opener pushes, closer matches, and terminal mismatch frames explicitly so replay can restore the exact stack and failure reason for any token boundary.
- BFS records queue extraction and first-discovery checkpoints explicitly so replay can restore hop-based traversal order without hidden queue mutation.
- Dijkstra records deterministic frontier ordering and settled-node checkpoints so weighted path playback never depends on live priority-queue state.

## Consumers

- `apps/web` builds sorting replay, binary-search replay, sliding-window replay, longest-common-subsequence replay, valid-parentheses replay, BFS replay, and Dijkstra replay from this package.
- `apps/api` exposes the same sorting, search, window, dynamic-programming, stack, and graph algorithm identifiers through the input-service layer.
- Demo and persistence workflows consume the envelopes produced by the shared runtime instead of maintaining UI-local sorting builders.
