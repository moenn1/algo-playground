# Execution Engine

## Scope

`packages/execution-engine` owns reusable algorithm runtimes that emit deterministic TraceDeck envelopes on top of `packages/trace-core`.

The current package covers shared sorting, search, two-pointers, window, hash, heap, interval, dynamic-programming, stack, and graph runtimes:

- `bubble-sort`
- `insertion-sort`
- `shell-sort`
- `selection-sort`
- `quick-sort`
- `merge-sort`
- `heap-sort`
- `binary-search`
- `search-in-rotated-sorted-array`
- `container-with-most-water`
- `trapping-rain-water`
- `minimum-size-subarray-sum`
- `longest-substring-without-repeating-characters`
- `two-sum`
- `kth-largest-element-in-an-array`
- `top-k-frequent-elements`
- `merge-intervals`
- `longest-common-subsequence`
- `valid-parentheses`
- `daily-temperatures`
- `largest-rectangle-in-histogram`
- `min-stack`
- `bfs`
- `dfs`
- `dijkstra`
- `network-delay-time`
- `clone-graph`
- `graph-valid-tree`
- `count-connected-components`
- `redundant-connection`
- `course-schedule`
- `course-schedule-ii`
- `rotting-oranges`
- `number-of-islands`
- `max-area-of-island`
- `island-perimeter`
- `pacific-atlantic-water-flow`
- `shortest-bridge`
- `shortest-path-binary-matrix`
- `nearest-exit-from-entrance-in-maze`
- `01-matrix`
- `as-far-from-land-as-possible`
- `map-of-highest-peak`
- `surrounded-regions`
- `walls-and-gates`

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

The package intentionally avoids algorithm-specific comparison metrics in the shared deck so Bubble Sort, Insertion Sort, Shell Sort, Selection Sort, Quick Sort, Merge Sort, and Heap Sort can stay directly comparable.

Insertion Sort uses the same state shape without marking any lane as globally final before the terminal frame, because later values can still insert ahead of the current prefix even when the local prefix is ordered.

Shell Sort uses that same state shape without marking globally final lanes early, because each shrinking gap pass only preconditions the array for later repairs and the final adjacent pass can still reorder any lane.

Heap Sort uses that same state shape while allowing `state.sortedIndices` to grow as an extracted suffix before the terminal frame, because each root swap seals one more maximum value at the end of the array.

## Search Runtime Model

Binary Search and Search in Rotated Sorted Array now share the interval-search runtime shape:

- `state.array`: the sorted array snapshot used for every probe
- `state.target`: the requested value the runtime is resolving
- `state.low`: the inclusive left bound of the active interval, or `null` when exhausted
- `state.high`: the inclusive right bound of the active interval, or `null` when exhausted
- `state.mid`: the midpoint lane under inspection for the current probe step
- `state.sortedSide`: the currently ordered half for rotated-array probes, or `null` for standard binary-search steps and exhausted frames
- `state.eliminatedIndices`: lanes ruled out by previous interval cuts
- `state.foundIndex`: the resolved match lane when the target is present

Shared search metrics focus on the interval-search decision path:

- `probes`: midpoint inspections performed so far
- `comparisons`: equality and directional comparisons committed so far

That shape stays reusable across classic binary search and rotated-array search because the visualization only depends on the active bounds, current probe, ordered-half signal, discarded lanes, and terminal match state.

## Window Runtime Model

The window runtime family now covers both Minimum Size Subarray Sum and Longest Substring Without Repeating Characters through one shared metric vocabulary plus algorithm-specific replay-safe state.

Minimum Size Subarray Sum records:

- `state.kind`: `"minimum-size-subarray-sum"`
- `state.array`: the positive integer array under scan
- `state.target`: the required minimum sum
- `state.left`: the inclusive left bound of the active window, or `null` when the window is collapsed
- `state.right`: the inclusive right bound of the active window, or `null` when the window is collapsed
- `state.activeSum`: the current window sum
- `state.bestStart` and `state.bestEnd`: the best qualifying window recorded so far
- `state.bestLength`: the best qualifying length, or `null` while no candidate exists
- `state.candidateSatisfied`: whether the active window currently meets the target before the next shrink

Longest Substring Without Repeating Characters records:

- `state.kind`: `"longest-substring-without-repeating-characters"`
- `state.text`: the source string under scan
- `state.left` and `state.right`: the inclusive character bounds of the active unique window, or `null` when the window is collapsed
- `state.currentIndex` and `state.currentChar`: the character currently entering or settling the window
- `state.activeSubstring`: the current substring inside the live window
- `state.activeEntries`: the active character/index pairs inside the live window
- `state.characterLedger`: the current per-character counts and latest indices inside the window
- `state.duplicateChar` and `state.duplicateIndex`: the duplicate that forced contraction, when one is active
- `state.bestStart`, `state.bestEnd`, `state.bestLength`, and `state.bestSubstring`: the best unique substring recorded so far

Shared window metrics focus on replaying the scan and contraction rhythm directly:

- `expansions`: right-edge growth steps performed so far
- `shrinks`: left-edge contraction steps performed so far
- `bestUpdates`: times the runtime published a better window

Minimum Size Subarray Sum records explicit `Expand`, `Candidate`, `Best Update`, `Shrink`, and terminal `Done` or `No Solution` checkpoints so replay never has to infer qualifying intervals from aggregate counters alone.

Longest Substring Without Repeating Characters records `Expand`, `Repeat`, `Shrink`, `Best Update`, and terminal `Done` checkpoints so replay can reopen the duplicate that forced contraction instead of jumping the left edge in one hidden move.

## Two-Pointers Runtime Model

Container With Most Water and Trapping Rain Water now share the two-pointer runtime family:

- `state.heights`: the wall heights under inspection
- `state.left` and `state.right`: the active wall indices, or `null` once the sweep is complete
- Container With Most Water adds `state.width`, `state.limitingHeight`, `state.currentArea`, `state.bestArea`, `state.bestLeft`, `state.bestRight`, and `state.evaluatedPairs`
- Trapping Rain Water adds `state.leftMax`, `state.rightMax`, `state.currentFillIndex`, `state.currentFillAmount`, `state.totalWater`, `state.waterByIndex`, and `state.inspectedPairs`
- Both algorithms record `state.movedPointer` so the latest pruning or settling move stays explicit in replay

Two-pointer metrics stay stable inside each algorithm family:

- Container With Most Water uses `evaluations`, `moves`, and `bestUpdates`
- Trapping Rain Water uses `evaluations`, `moves`, and `fills`

The runtimes record explicit `Initialization`, `Evaluate`, pointer-move checkpoints, and terminal `Done` frames. Container With Most Water adds `Best Update` checkpoints, while Trapping Rain Water adds boundary-max updates and explicit fill checkpoints so replay can jump between basin segments without recomputing local water totals.

## Hash Runtime Model

Two Sum establishes the first lookup-table runtime shape:

- `state.array`: the integer array under scan
- `state.target`: the requested pair sum
- `state.currentIndex` and `state.currentValue`: the active array slot under inspection, or `null` outside active lookup work
- `state.complement`: the missing value required to close the target with the current value
- `state.complementIndex`: the stored index for that complement when the lookup succeeds
- `state.seenEntries`: the insertion-ordered lookup-table entries already stored by prior steps
- `state.inspectedIndices`: array slots already checked for complements
- `state.matchedPairIndices` and `state.matchedPairValues`: the resolved solution pair once replay locks it

Shared hash metrics keep lookup-table work readable:

- `inspections`: array values inspected so far
- `lookups`: complement checks performed so far
- `stores`: values stored into the lookup table so far

The runtime records explicit `Initialization`, per-value `Lookup` and `Store`, and terminal `Match` plus `Done` checkpoints so replay can jump directly between failed complements, table growth, and the winning pair without replay-time inference.

## Heap Runtime Model

The heap runtime family now covers both Kth Largest Element in an Array and Top K Frequent Elements through one replay-safe discriminated union plus a shared metric vocabulary.

Kth Largest Element in an Array records:

- `state.kind`: `"kth-largest-element-in-an-array"`
- `state.array`: the integer array under scan
- `state.k`: the requested rank that the runtime must preserve inside the heap
- `state.currentIndex` and `state.currentValue`: the active array slot under inspection, or `null` outside active scan work
- `state.heapEntries`: the live size-`k` min-heap in internal heap order so replay can reopen the exact cutoff structure
- `state.rankedEntries`: the same top-`k` candidates sorted from largest to smallest for human-readable inspection
- `state.processedIndices`: array slots already inspected by the scan
- `state.candidateEntry`: the current heap root once the heap is full, or `null` while the heap is still seeding
- `state.evictedEntry`: the root displaced by a larger value during a replacement step
- `state.result`: the terminal kth-largest value once the scan completes

Top K Frequent Elements records:

- `state.kind`: `"top-k-frequent-elements"`
- `state.array`: the integer array under scan
- `state.k`: the requested number of ranked frequency winners
- `state.currentIndex`, `state.currentValue`, and `state.currentFrequency`: the distinct value currently being counted or inspected, or `null` outside active work
- `state.frequencyLedger`: the first-seen-order ledger of `{ value, frequency, firstIndex }` entries that drives deterministic replay and serialization
- `state.heapEntries`: the live size-`k` min-heap of `{ value, frequency, firstIndex }` entries in internal heap order
- `state.rankedEntries`: the same top-`k` candidates sorted for human-readable ranking by frequency descending and value ascending
- `state.processedIndices`: the distinct-value slots already inspected after counting completes
- `state.candidateEntry`: the current heap root once the heap is full, or `null` while the heap is still seeding
- `state.evictedEntry`: the heap entry displaced by a stronger frequency candidate during a replacement step
- `state.result`: the terminal top-`k` value list once the scan completes

Shared heap metrics keep top-`k` selection work readable:

- `inspections`: array values inspected so far
- `pushes`: heap insertions committed so far
- `pops`: heap-root removals committed through replacement steps so far

Kth Largest Element in an Array records explicit `Initialization`, `Inspect`, `Push`, `Replace`, `Skip`, and terminal `Done` checkpoints so replay can jump directly between heap seeding, cutoff changes, rejected values, and the final threshold without reconstructing hidden priority-queue state in the browser.

Top K Frequent Elements adds a deterministic `Count` phase ahead of the heap scan, then records `Inspect`, `Push`, `Replace`, `Skip`, and terminal `Done` checkpoints so replay can reopen the frequency ledger, tie-break cutoff, and final ranked output without rebuilding the counts in the UI.

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

## Interval Runtime Model

Merge Intervals establishes the first range-merging runtime shape:

- `state.orderedIntervals`: the intervals after deterministic start-boundary sorting
- `state.currentIndex`: the interval currently being compared against the active span
- `state.activeInterval`: the live merged span that may still absorb later ranges
- `state.comparisonInterval`: the next interval under inspection
- `state.mergedIntervals`: the committed output intervals published so far
- `state.activeGroupIndices`: the sorted interval slots already absorbed into the active span
- `state.consumedIndices`: source intervals that have already been folded into either the active span or committed output
- `state.overlapRange`: the currently overlapping sub-range when the active span and comparison interval intersect

Shared interval metrics keep the sweep and output phases readable:

- `comparisons`: overlap checks performed so far
- `merges`: overlapping ranges collapsed into the active span so far
- `outputs`: merged intervals committed to the result so far

The runtime records explicit `Initialization`, `Sort`, `Seed Active`, `Compare`, `Merge`, `Commit`, `Start New`, `Final Commit`, and `Done` checkpoints so replay can jump between sort-time preparation and output commits without recomputing the active span in the browser.

## Stack Runtime Model

The stack runtime family now covers bracket validation, monotonic-stack wait resolution, histogram rectangle resolution, and stack-operation replay:

- Valid Parentheses records `state.expression`, `state.currentChar`, `state.stackTokens`, `state.stackIndices`, `state.matchedPairs`, `state.expectedCloser`, `state.failureIndex`, `state.failureReason`, and terminal `state.valid`
- Daily Temperatures records `state.temperatures`, `state.currentTemperature`, `state.comparisonIndex`, `state.stackIndices`, `state.stackTemperatures`, `state.resolvedWaits`, `state.currentResolvedIndex`, and `state.currentWait`
- Largest Rectangle in Histogram records `state.heights`, `state.currentHeight`, `state.comparisonIndex`, `state.stackIndices`, `state.stackHeights`, `state.currentResolvedIndex`, `state.currentArea`, `state.currentWidth`, `state.currentSpanStart`, `state.currentSpanEnd`, `state.bestArea`, `state.bestStart`, `state.bestEnd`, and `state.bestHeight`
- Min Stack records `state.operations`, `state.currentOperation`, `state.currentValue`, `state.comparisonValue`, `state.stackValues`, `state.minimumValues`, `state.currentMinimum`, `state.currentResultType`, and `state.currentResultValue`
- All stack algorithms share `state.cursor` and `state.processedIndices` so replay can frame one active scan position and one deterministic processed-prefix ledger

Shared stack metrics keep stack work legible across all four algorithms:

- `comparisons`: closer checks or monotonic-stack comparisons performed so far
- `pushes`: stack entries pushed onto the stack so far
- `pops`: matched or resolved stack entries popped so far

The runtime records explicit `Initialization` and `Push` checkpoints for all stack algorithms. Valid Parentheses adds `Match`, `Reject`, `Unclosed`, and terminal `Done` frames. Daily Temperatures adds `Inspect`, `Compare`, `Resolve`, and terminal `Done` frames. Largest Rectangle in Histogram adds `Inspect`, `Compare`, `Resolve`, `Flush`, and terminal `Done` frames. Min Stack adds `Inspect`, `Compare`, `Pop`, `Read`, and terminal `Done` frames so replay can jump directly to a mismatch, a warmer-day burst, a resolved rectangle span, a minimum read, or the final stack ledger without replay-time inference.

## Graph Runtime Model

The graph runtime family now uses a discriminated replay-safe union so pathfinding, tree validation, dependency scheduling, and grid traversal can share one metric vocabulary without collapsing into one overloaded state payload.

Pathfinding state for Breadth-First Search, Depth-First Search, and Dijkstra records:

- `state.kind`: `"bfs"`, `"dfs"`, or `"dijkstra"`
- `state.distances`: recorded hop counts or weighted distances per node
- `state.settled`: nodes whose expansion or shortest-path state is final for the current frame
- `state.frontier`: queue order for BFS, top-first stack order for DFS, or weighted frontier order for Dijkstra
- `state.current`: the node currently being expanded
- `state.activeEdge`: the edge under inspection or relaxation
- `state.path`: the current recovered path overlay

Network Delay Time records:

- `state.kind`: `"network-delay-time"`
- `state.signalSource`: the selected broadcast origin
- `state.distances`: the earliest known arrival time per node
- `state.settled`: nodes whose arrival time is final for the current frame
- `state.frontier`: the weighted relay frontier sorted by arrival time and node-label tie-breaks
- `state.current`: the node currently relaying signal updates
- `state.activeEdge`: the directed edge currently under inspection or relaxation
- `state.reachedNodes`: nodes with at least one finite arrival time from the source
- `state.unreachableNodes`: nodes that still have no route from the source
- `state.networkDelay`: the terminal maximum arrival time when every node is reached
- `state.allReached`: `true`, `false`, or `null` while the broadcast is still in progress

Graph Valid Tree records:

- `state.kind`: `"graph-valid-tree"`
- `state.nodeCount` and `state.edges`: the normalized Union-Find validation fixture
- `state.parents`: the representative-parent ledger per node id
- `state.ranks`: the union-by-rank ledger per node id
- `state.components`: the projected connected components derived from the recorded parent ledger
- `state.settled`: the processed edge labels already sealed into the replay ledger
- `state.frontier`: the remaining input-order edge queue
- `state.current`: the edge label currently being inspected
- `state.activeEdge`: the active edge endpoints as node-id strings
- `state.currentRoots`: the representatives being compared for the active edge
- `state.acceptedEdges`: the accepted forest edges in deterministic input order
- `state.rejectedEdges`: the cycle-closing edges rejected so far
- `state.componentCount`: the remaining connected-component count
- `state.isTree`: `true`, `false`, or `null` while validation is still in progress
- `state.failureReason`: the explicit cycle or disconnected-component reason when validation fails

Redundant Connection records:

- `state.kind`: `"redundant-connection"`
- `state.nodeCount` and `state.edges`: the normalized Union-Find input fixture
- `state.parents`: the representative-parent ledger per node id
- `state.ranks`: the union-by-rank ledger per node id
- `state.components`: the projected connected components derived from the recorded parent ledger
- `state.settled`: the processed edge labels already sealed into replay
- `state.frontier`: the remaining input-order edge queue
- `state.current`: the edge label currently being inspected
- `state.activeEdge`: the active edge endpoints as node-id strings
- `state.currentRoots`: the representatives being compared for the active edge
- `state.acceptedEdges`: the accepted forest edges recorded before the cycle closes
- `state.rejectedEdges`: the first same-component edge recorded as redundant
- `state.componentCount`: the remaining connected-component count at the recorded frame
- `state.redundantEdge`: the first cycle-closing edge in deterministic input order, or `null` while scanning
- `state.hasRedundantConnection`: `true`, `false`, or `null` while the runtime is still in progress

Count Connected Components records:

- `state.kind`: `"count-connected-components"`
- `state.nodeCount` and `state.edges`: the normalized Union-Find counting fixture
- `state.parents`: the representative-parent ledger per node id
- `state.ranks`: the union-by-rank ledger per node id
- `state.components`: the projected connected components derived from the recorded parent ledger
- `state.settled`: the processed edge labels already sealed into replay
- `state.frontier`: the remaining input-order edge queue
- `state.current`: the edge label currently being inspected
- `state.activeEdge`: the active edge endpoints as node-id strings
- `state.currentRoots`: the representatives being compared for the active edge
- `state.acceptedEdges`: the accepted merge edges that reduced the component total
- `state.rejectedEdges`: the same-component edges recorded as no-op scans
- `state.componentCount`: the remaining connected-component count at the recorded frame

Clone Graph records:

- `state.kind`: `"clone-graph"`
- `state.nodes` and `state.edges`: the normalized original graph fixture
- `state.settled`: original nodes whose clone adjacency is fully recorded
- `state.frontier`: the queued original nodes waiting for clone expansion
- `state.current`: the original node currently filling its clone adjacency
- `state.activeEdge`: the original edge currently under inspection
- `state.cloneMap`: the explicit original-to-clone label ledger
- `state.clonedNodes`: original nodes that already have an allocated clone label
- `state.clonedEdges`: clone-to-clone links already committed into the copied component
- `state.currentClone`: the active clone label while the current original node is being expanded
- `state.unreachableNodes`: original nodes that never entered the queue from the chosen start node
- `state.fullyCloned`: `true`, `false`, or `null` while clone construction is still in progress

Course Schedule and Course Schedule II record:

- `state.kind`: `"course-schedule"`
- `state.courseCount` and `state.prerequisites`: the normalized dependency fixture
- `state.indegrees`: the live indegree ledger per course id
- `state.settled`: courses already committed into the topological order
- `state.frontier`: the deterministic zero-indegree queue
- `state.current`: the course currently being scheduled
- `state.activeEdge`: the prerequisite edge currently reducing a dependent indegree
- `state.order`: the committed topological order prefix
- `state.schedulable`: `true`, `false`, or `null` while the runtime is still in progress
- `state.cycleNodes`: the remaining blocked courses when the queue empties early

Rotting Oranges records:

- `state.kind`: `"rotting-oranges"`
- `state.grid`: the grid snapshot for the current infection frame
- `state.settled`: cells whose outgoing spread checks are fully recorded
- `state.frontier`: the ordered rotten-orange queue for the current or next minute wave
- `state.current`: the rotten cell currently acting as the spread source
- `state.activeEdge`: the active source-to-neighbor inspection
- `state.minute`: the current completed infection minute
- `state.fresh`: the remaining fresh cells in deterministic row-major order
- `state.newlyRotted`: cells converted during the current minute wave
- `state.rottable`: `true`, `false`, or `null` while the runtime is still in progress
- `state.minutesToRotAll`: the terminal infection time when every fresh orange can rot
- `state.stalledFresh`: the remaining unreachable fresh cells when the frontier stalls

Number of Islands records:

- `state.kind`: `"number-of-islands"`
- `state.grid`: the land-water grid snapshot for the current traversal frame
- `state.settled`: land cells whose neighbor checks are fully recorded
- `state.frontier`: the ordered queue for the active island flood-fill
- `state.current`: the land cell currently being expanded inside the active island
- `state.activeEdge`: the active source-to-neighbor inspection
- `state.scan`: the row-major scan cursor when the runtime is not currently expanding a frontier cell
- `state.islandCount`: the number of islands discovered so far
- `state.activeIslandId`: the current island identifier while one component is still being explored
- `state.activeIsland`: the land cells currently claimed by the active island
- `state.completedIslands`: the deterministic membership list for every fully explored island
- `state.cellIslands`: the per-cell island assignment ledger for claimed land
- `state.remainingLand`: the unresolved land cells that have not yet been claimed by any island

Max Area of Island records:

- `state.kind`: `"max-area-of-island"`
- `state.grid`: the land-water grid snapshot for the current traversal frame
- `state.settled`: land cells whose neighbor checks are fully recorded
- `state.frontier`: the ordered queue for the active island flood-fill
- `state.current`: the land cell currently being expanded inside the active island
- `state.activeEdge`: the active source-to-neighbor inspection
- `state.scan`: the row-major scan cursor when the runtime is not currently expanding a frontier cell
- `state.islandCount`: the number of islands discovered so far
- `state.activeIslandId`: the current island identifier while one component is still being explored
- `state.activeIsland`: the land cells currently claimed by the active island
- `state.activeIslandArea`: the current area of the active island while flood-fill is still in progress
- `state.completedIslands`: the deterministic membership list for every fully explored island
- `state.completedAreas`: the per-island area ledger in island-discovery order
- `state.cellIslands`: the per-cell island assignment ledger for claimed land
- `state.remainingLand`: the unresolved land cells that have not yet been claimed by any island
- `state.maxArea`: the largest completed island area published so far
- `state.largestIslandId`: the current winning island identifier, or `null` before any land is completed
- `state.largestIsland`: the deterministic membership list for the current winning island

Island Perimeter records:

- `state.kind`: `"island-perimeter"`
- `state.grid`: the land-water grid snapshot for the current scan frame
- `state.settled`: land cells whose four edge inspections are fully recorded
- `state.frontier`: the remaining land cells still waiting for coastline accounting
- `state.current`: the land cell currently being inspected for exposed edges
- `state.activeEdge`: the active land-to-water, land-to-boundary, or land-to-land inspection
- `state.scan`: the row-major scan cursor when the runtime is not currently focused on a land edge inspection
- `state.landCells`: the full deterministic ledger of land cells on the grid
- `state.remainingLand`: the land cells that have not yet completed all four edge inspections
- `state.exposedEdges`: the exposed-edge ledger in deterministic inspection order
- `state.currentContribution`: the number of exposed edges attributed to the current land cell so far
- `state.perimeter`: the running coastline length published so far

Pacific Atlantic Water Flow records:

- `state.kind`: `"pacific-atlantic-water-flow"`
- `state.grid`: the height grid snapshot for the current reverse-flow frame
- `state.settled`: cells whose outgoing reverse-flow checks are fully recorded
- `state.frontier`: the ordered queue for the active ocean pass
- `state.current`: the height cell currently acting as the reverse-flow source
- `state.activeEdge`: the active source-to-neighbor inspection
- `state.phaseMode`: `"pacific"`, `"atlantic"`, or `"resolved"` so replay can explain which ocean owns the current frontier
- `state.pacificSeeds`: the deterministic row-major ledger of top-and-left ocean border cells
- `state.atlanticSeeds`: the deterministic row-major ledger of bottom-and-right ocean border cells
- `state.pacificReachable`: cells confirmed to reach the Pacific border through reverse flow
- `state.atlanticReachable`: cells confirmed to reach the Atlantic border through reverse flow
- `state.dualReachable`: cells confirmed to reach both oceans

Shortest Bridge records:

- `state.kind`: `"shortest-bridge"`
- `state.grid`: the land-water grid snapshot for the current scan, marking, or bridge-expansion frame
- `state.settled`: cells whose outgoing marking or bridge-expansion checks are fully recorded
- `state.frontier`: the ordered queue for the active island-marking or bridge-expansion phase
- `state.current`: the land or water cell currently acting as the active marking or bridge source
- `state.activeEdge`: the active source-to-neighbor inspection
- `state.scan`: the row-major scan cursor while the runtime is still locating the first island
- `state.phaseMode`: `"locate-island"`, `"mark-island"`, `"expand-bridge"`, or `"resolved"` so replay can explain the current runtime phase
- `state.firstIsland`: the deterministic row-major ledger of cells claimed into the first island
- `state.expandedWater`: the deterministic row-major ledger of water cells queued by bridge expansion
- `state.reachedSecondIsland`: the second-island cell or cells contacted by the winning bridge wave
- `state.wave`: the current bridge-wave distance from the marked first island
- `state.bridgeLength`: the terminal minimum number of water flips once the second island is reached

Shortest Path in Binary Matrix records:

- `state.kind`: `"shortest-path-binary-matrix"`
- `state.grid`: the open-vs-blocked matrix snapshot for the current search or traceback frame
- `state.settled`: open cells whose outgoing BFS checks are fully recorded
- `state.frontier`: the ordered queue of open cells still waiting to expand
- `state.current`: the open cell currently acting as the search focus or traceback cursor
- `state.activeEdge`: the active source-to-neighbor inspection or predecessor traceback edge
- `state.phaseMode`: `"search"`, `"traceback"`, or `"resolved"` so replay can explain whether the runtime is still expanding the frontier or reconstructing the route
- `state.path`: the explicit shortest-path ledger published during traceback
- `state.visitedOpen`: the deterministic row-major ledger of reachable open cells discovered so far
- `state.blockedCells`: the deterministic row-major ledger of blocked cells in the grid
- `state.pathLength`: the terminal shortest-path length in cells when the destination is reachable
- `state.reachable`: `true`, `false`, or `null` while the runtime is still in progress

Nearest Exit from Entrance in Maze records:

- `state.kind`: `"nearest-exit-from-entrance-in-maze"`
- `state.grid`: the open-vs-wall maze snapshot for the current search or traceback frame
- `state.settled`: corridor cells whose outgoing BFS checks are fully recorded
- `state.frontier`: the ordered queue of corridor cells still waiting to expand
- `state.current`: the corridor cell currently acting as the search focus or traceback cursor
- `state.activeEdge`: the active source-to-neighbor inspection or predecessor traceback edge
- `state.phaseMode`: `"search"`, `"traceback"`, or `"resolved"` so replay can distinguish live corridor expansion from route reconstruction
- `state.entrance`: the fixed starting corridor cell
- `state.exits`: the deterministic boundary-exit candidates, excluding the entrance cell itself
- `state.path`: the explicit nearest-exit path ledger published during traceback
- `state.visitedOpen`: the deterministic ledger of reachable corridor cells discovered so far
- `state.blockedCells`: the deterministic row-major ledger of wall cells in the maze
- `state.stepsToExit`: the returned shortest escape distance in steps, or `-1` when no exit is reachable
- `state.reachable`: `true`, `false`, or `null` while the runtime is still in progress
- `state.exit`: the boundary cell chosen as the nearest deterministic exit once one is discovered

Shortest Path to Get Food records:

- `state.kind`: `"shortest-path-to-get-food"`
- `state.grid`: the pantry snapshot for the current search or traceback frame
- `state.settled`: pantry cells whose outgoing BFS checks are fully recorded
- `state.frontier`: the ordered queue of pantry cells still waiting to expand
- `state.current`: the pantry cell currently acting as the search focus or traceback cursor
- `state.activeEdge`: the active source-to-neighbor inspection or predecessor traceback edge
- `state.phaseMode`: `"search"`, `"traceback"`, or `"resolved"` so replay can distinguish live pantry expansion from route reconstruction
- `state.start`: the fixed starting pantry cell
- `state.food`: the fixed pantry target cell
- `state.path`: the explicit shortest food path ledger published during traceback
- `state.visitedOpen`: the deterministic ledger of reachable pantry cells discovered so far
- `state.blockedCells`: the deterministic row-major ledger of wall cells in the pantry
- `state.stepsToFood`: the returned shortest food distance in steps, or `-1` when the food is unreachable
- `state.reachable`: `true`, `false`, or `null` while the runtime is still in progress

01 Matrix records:

- `state.kind`: `"01-matrix"`
- `state.grid`: the nearest-zero distance grid snapshot for the current BFS frame, with unresolved `1` cells held at infinity until their distance locks
- `state.settled`: cells whose outgoing nearest-zero checks are fully recorded
- `state.frontier`: the ordered queue of zero sources or already resolved distance cells waiting to expand
- `state.current`: the zero or resolved-distance cell currently acting as the fill source
- `state.activeEdge`: the active source-to-neighbor inspection
- `state.zeroCells`: the deterministic row-major ledger of zero-valued source cells
- `state.updatedCells`: the `1` cells assigned a nearest-zero distance during the current frame
- `state.remainingCells`: unresolved `1` cells that have not yet received any nearest-zero distance
- `state.fullyResolved`: `true`, `false`, or `null` while the runtime is still in progress
- `state.maxDistance`: the farthest nearest-zero distance published once at least one `1` cell resolves
- `state.unresolvedCells`: the remaining `1` cells when the frontier stalls because no zero source exists

As Far from Land as Possible records:

- `state.kind`: `"as-far-from-land-as-possible"`
- `state.grid`: the shoreline-distance grid snapshot for the current BFS frame, with land held at `0` and unresolved water held at infinity until its shoreline distance locks
- `state.settled`: cells whose outgoing shoreline checks are fully recorded
- `state.frontier`: the ordered queue of land sources or already resolved water cells waiting to expand
- `state.current`: the land or resolved-water cell currently acting as the shoreline source
- `state.activeEdge`: the active source-to-neighbor inspection
- `state.landCells`: the deterministic row-major ledger of land source cells
- `state.updatedWater`: the water cells assigned a shoreline distance during the current frame
- `state.remainingWater`: unresolved water cells that have not yet received any shoreline distance
- `state.outcome`: `"active"`, `"resolved"`, `"no-land"`, or `"no-water"` so replay can distinguish live shoreline waves from terminal `-1` edge cases
- `state.maxDistance`: the farthest shoreline distance published once at least one water cell resolves
- `state.answer`: the returned algorithm answer, including `-1` when the grid contains only land or only water
- `state.farthestWater`: the water cell or cells tied for the final farthest shoreline distance
- `state.unreachableWater`: the water ledger published when no land source exists

Map of Highest Peak records:

- `state.kind`: `"map-of-highest-peak"`
- `state.grid`: the height-map snapshot for the current BFS frame, with water held at `0` and unresolved land held at infinity until its height locks
- `state.settled`: cells whose outgoing height checks are fully recorded
- `state.frontier`: the ordered queue of water sources or already assigned land cells waiting to expand
- `state.current`: the water or resolved-land cell currently acting as the height source
- `state.activeEdge`: the active source-to-neighbor inspection
- `state.waterCells`: the deterministic row-major ledger of water source cells
- `state.updatedLand`: the land cells assigned a height during the current frame
- `state.remainingLand`: unresolved land cells that have not yet received any height
- `state.fullyAssigned`: `true` or `null` while the runtime is still in progress
- `state.maxHeight`: the highest assigned land height, or `0` when the grid resolves as an all-water plateau
- `state.highestCells`: the cell or cells tied for the highest assigned peak

Surrounded Regions records:

- `state.kind`: `"surrounded-regions"`
- `state.grid`: the capture grid snapshot for the current frame
- `state.settled`: cells whose safe-flood or capture work is fully sealed into the replay ledger
- `state.frontier`: the ordered safe-region queue during border discovery or the ordered capture queue during the flip phase
- `state.current`: the cell currently being expanded or captured
- `state.activeEdge`: the active source-to-neighbor inspection during the safe flood fill
- `state.phaseMode`: `"mark-safe"`, `"capture"`, or `"resolved"` so replay can explain which runtime phase owns the current frontier
- `state.boundarySeeds`: the deterministic row-major ledger of border-connected `O` seeds
- `state.safeCells`: every `O` cell protected by the border flood fill
- `state.capturedCells`: every enclosed `O` cell already flipped to `X`
- `state.remainingOpen`: unresolved enclosed `O` cells that the safe flood fill never reached
- `state.capturedAny`: `true`, `false`, or `null` while the runtime is still deciding whether any enclosed region will flip

Walls and Gates records:

- `state.kind`: `"walls-and-gates"`
- `state.grid`: the room-distance grid snapshot for the current BFS frame
- `state.settled`: cells whose outgoing room-fill checks are fully recorded
- `state.frontier`: the ordered queue of gates or already resolved rooms waiting to expand
- `state.current`: the gate or resolved room currently acting as the fill source
- `state.activeEdge`: the active source-to-neighbor inspection
- `state.gates`: the deterministic row-major ledger of gate cells
- `state.walls`: the deterministic row-major ledger of wall cells
- `state.updatedRooms`: the rooms assigned a distance during the current frame
- `state.remainingRooms`: the unresolved infinity rooms that have not yet reached any gate
- `state.fullyReachable`: `true`, `false`, or `null` while the runtime is still in progress
- `state.maxDistance`: the farthest resolved room distance once at least one room fill has happened
- `state.unreachableRooms`: the remaining infinity rooms when the frontier stalls

Shared graph metrics keep the runtime readable across all graph-family algorithms:

- `settled`: finalized work items so far, such as expanded nodes, committed courses, or processed edges
- `frontier`: queue, weighted-frontier, or remaining-edge count at the recorded frame
- `inspections`: edges or neighbor relationships inspected so far
- `updates`: committed state changes such as predecessor locks, indegree unlocks, room fills, or successful unions

The frontier representation is intentionally serialized as an ordered array. BFS records queue order directly, DFS records top-first stack order, Dijkstra records the weighted frontier sorted by tentative distance and node-label tie-breaks, Network Delay Time records the weighted relay frontier with that same deterministic ordering while publishing reached-versus-unreachable ledgers, Clone Graph records the remaining original-node queue in fixed discovery order, Graph Valid Tree records the remaining edge queue in fixed input order, Redundant Connection records that same input-order edge queue but stops at the first same-component edge, Course Schedule records the zero-indegree queue sorted by numeric course id, Rotting Oranges records the minute-wave infection queue in fixed neighbor order, Number of Islands records the active connected-component queue in fixed neighbor order while the row-major scan cursor stays explicit, Max Area of Island records that same queue and scan discipline while publishing a largest-island scoreboard after each completed component, Island Perimeter records the remaining land ledger in row-major order while each active land cell expands into four deterministic edge inspections, Pacific Atlantic Water Flow records the Pacific queue first and then the Atlantic queue in row-major border-seed order, Shortest Bridge records the first-island marking queue and then the bridge-expansion queue in deterministic row-major source order, Shortest Path in Binary Matrix records the open-cell BFS queue in fixed 8-direction neighbor order before switching to predecessor traceback, Nearest Exit from Entrance in Maze records the corridor BFS queue in fixed 4-direction neighbor order before switching to boundary-exit traceback, Shortest Path to Get Food records the pantry BFS queue in fixed 4-direction neighbor order before switching to pantry-target traceback, 01 Matrix records the multi-source zero frontier in row-major source order before publishing nearest-zero fills, As Far from Land as Possible records the multi-source land frontier in row-major source order before publishing shoreline-distance fills, Map of Highest Peak records the multi-source water frontier in row-major source order before publishing land-height fills, Surrounded Regions records the border-safe queue first and then the row-major capture queue, and Walls and Gates records the multi-source room-fill queue in fixed neighbor order so shortest gate distances stay replay-safe.

## Deterministic Emission Rules

- Every algorithm records full snapshots through the `trace-core` recorder helpers.
- Recursive algorithms emit structural checkpoints instead of relying on replay-time recursion.
- Merge sort does not mark intermediate windows as globally sorted; `sortedIndices` only advances when that claim is true for the full array position.
- Quick sort records pivot commits and single-lane base cases explicitly so replay can jump to any partition boundary without reconstructing recursion.
- Binary search records both midpoint probes and discard checkpoints explicitly so replay can jump between interval cuts without re-running bound updates.
- Search in Rotated Sorted Array records ordered-half detection plus discard checkpoints explicitly so replay can jump between pivot-aware interval cuts without rerunning branch selection.
- Minimum Size Subarray Sum records expansion, qualifying, and shrink checkpoints explicitly so replay can jump between window states without recomputing running sums.
- Container With Most Water records area evaluations, best-container updates, and pointer-pruning moves explicitly so replay can jump between wall pairs without rerunning the sweep.
- Trapping Rain Water records boundary-max updates, per-index fills, and accumulated trapped-water totals explicitly so replay can jump between basin segments without reconstructing local water contributions.
- Two Sum records complement checks, lookup-table stores, and the winning pair explicitly so replay can jump between hash states without reconstructing a live `Map`.
- Merge Intervals records sorted range order, active-span merges, and committed outputs explicitly so replay can jump between overlap checks and result commits without recomputing interval groups.
- Longest Common Subsequence records row-major table fills, deterministic up-first traceback ties, and the recovered sequence explicitly so replay can jump between fill and traceback phases without recomputing DP state.
- Valid Parentheses records opener pushes, closer matches, and terminal mismatch frames explicitly so replay can restore the exact stack and failure reason for any token boundary.
- Daily Temperatures records monotonic-stack comparisons, resolved waits, and terminal zero-wait days explicitly so replay can restore the exact unresolved-day stack and final wait ledger for any frame.
- Largest Rectangle in Histogram records stack comparisons, resolved span widths, deterministic best-rectangle updates, and final flush work explicitly so replay can restore the exact candidate stack and best-area ledger for any frame.
- Min Stack records push-time minimum comparisons, non-mutating `top` and `getMin` reads, and minimum recovery after pops explicitly so replay can restore the exact value stack and minimum ledger for any frame.
- BFS records queue extraction and first-discovery checkpoints explicitly so replay can restore hop-based traversal order without hidden queue mutation.
- DFS records stack extraction and first-discovery checkpoints explicitly so replay can restore depth-first branch order without hidden recursion state.
- Dijkstra records deterministic frontier ordering and settled-node checkpoints so weighted path playback never depends on live priority-queue state.
- Clone Graph records input-order neighbor inspection, explicit clone allocation, deduplicated clone-link commits, and terminal unreachable-node ledgers so replay never depends on live object references or browser-side copy reconstruction.
- Graph Valid Tree records input-order edge inspection, deterministic union-by-rank merges with lower-root tie-breaks, explicit cycle rejection, and terminal component ledgers so replay never depends on path-compression side effects or live Union-Find recomputation.
- Count Connected Components records input-order edge inspection, deterministic union-by-rank merges with lower-root tie-breaks, explicit same-component no-op checkpoints, and terminal component ledgers so replay can explain both the final total and every edge that failed to reduce it without recomputation.
- Course Schedule and Course Schedule II record initialization, queue extraction, dependency inspection, unlock checkpoints, committed-order checkpoints, and terminal cycle reporting explicitly so replay can explain both feasibility verdicts and returned topological orders without re-running Kahn's algorithm.
- Rotting Oranges records queue extraction, per-neighbor infection checks, explicit spread updates, minute-wave checkpoints, and terminal resolution-or-stall reporting explicitly so replay can explain both complete infections and unreachable fresh cells without re-running the grid BFS.
- Number of Islands records row-major scan passes, island-seed checkpoints, per-neighbor land or water inspections, explicit component-expansion updates, island-complete checkpoints, and terminal island counts explicitly so replay can explain both scan order and connected-component membership without re-running the flood fill.
- Max Area of Island records row-major scan passes, island-seed checkpoints, per-neighbor land or water inspections, explicit component-expansion updates, max-area checkpoints, and terminal largest-island reporting explicitly so replay can explain both flood-fill growth and the winning area ledger without re-running the traversal.
- Island Perimeter records row-major scan passes, per-cell edge-inspection checkpoints, explicit exposed-edge updates, shared-edge no-op checkpoints, and terminal coastline reporting explicitly so replay can explain both the running perimeter total and each land cell's contribution without recomputing adjacency.
- Pacific Atlantic Water Flow records Pacific border seeding, Atlantic border seeding, uphill reverse-flow inspections, explicit ocean-reachability updates, immediate dual-ocean intersections, and terminal coastline reporting explicitly so replay can explain both single-ocean and dual-ocean reachability without re-running either pass.
- Shortest Bridge records row-major first-island discovery, deterministic island-marking expansion, explicit bridge-water wave growth, immediate second-island contact, and terminal bridge-length reporting explicitly so replay can explain both the marked source island and the winning bridge wave without re-running either BFS phase.
- Shortest Path in Binary Matrix records blocked-cell inspection, open-cell discovery, destination-found checkpoints, predecessor traceback, and terminal reachable-or-unreachable reporting explicitly so replay can explain both frontier search and route reconstruction without re-running the grid BFS.
- Nearest Exit from Entrance in Maze records boundary-exit discovery, blocked-corridor inspection, predecessor traceback, and terminal reachable-or-unreachable reporting explicitly so replay can explain both frontier search and escape-route reconstruction without re-running the corridor BFS.
- Shortest Path to Get Food records pantry-wall inspection, food-target discovery, predecessor traceback, and terminal reachable-or-unreachable reporting explicitly so replay can explain both frontier search and food-route reconstruction without re-running the blocked-grid BFS.
- 01 Matrix records zero seeding, queue extraction, per-neighbor nearest-zero inspections, explicit distance-fill updates, per-source checkpoints, and terminal resolution-or-stall reporting explicitly so replay can explain both complete nearest-zero coverage and missing-zero-source failures without re-running the grid BFS.
- As Far from Land as Possible records land seeding, queue extraction, per-neighbor shoreline inspections, explicit water-distance updates, per-source checkpoints, and terminal farthest-water or `-1` edge-case reporting explicitly so replay can explain both the live shoreline wave and the returned answer without re-running the grid BFS.
- Map of Highest Peak records water seeding, queue extraction, per-neighbor land-height inspections, explicit height-fill updates, per-source checkpoints, and terminal highest-peak reporting explicitly so replay can explain both the live height wave and the final plateau ledger without re-running the grid BFS.
- Surrounded Regions records border-seed discovery, safe-flood queue extraction, per-neighbor wall-or-open inspections, explicit safe-region updates, deterministic row-major capture flips, and terminal preserve-versus-capture reporting explicitly so replay can explain both protected border regions and enclosed captures without re-running the flood fill.
- Walls and Gates records gate seeding, queue extraction, per-neighbor wall-or-room inspections, explicit distance-fill updates, per-source checkpoints, and terminal resolution-or-stall reporting explicitly so replay can explain both complete room coverage and blocked infinity rooms without re-running the grid BFS.

## Consumers

- `apps/web` builds sorting replay, binary-search replay, rotated-array search replay, container-with-most-water replay, trapping-rain-water replay, sliding-window replay, two-sum replay, merge-intervals replay, longest-common-subsequence replay, valid-parentheses replay, daily-temperatures replay, largest-rectangle-in-histogram replay, min-stack replay, BFS replay, DFS replay, Dijkstra replay, Clone Graph replay, Graph Valid Tree replay, Count Connected Components replay, Redundant Connection replay, Course Schedule replay, Course Schedule II replay, Rotting Oranges replay, Number of Islands replay, Max Area of Island replay, Island Perimeter replay, Pacific Atlantic Water Flow replay, Shortest Bridge replay, Shortest Path in Binary Matrix replay, Nearest Exit from Entrance in Maze replay, Shortest Path to Get Food replay, 01 Matrix replay, As Far from Land as Possible replay, Map of Highest Peak replay, Surrounded Regions replay, and Walls and Gates replay from this package.
- `apps/api` exposes the same sorting, search, two-pointers, window, hash, interval, dynamic-programming, stack, and graph algorithm identifiers through the input-service layer, including the graph-family route, clone-construction, tree-validation, schedule, dual-ocean reachability, shortest-bridge expansion, blocked-cell shortest-path search, border-capture, and grid contracts.
- Demo and persistence workflows consume the envelopes produced by the shared runtime instead of maintaining UI-local sorting builders.
