import {
  buildDynamicProgrammingTrace,
  buildGraphTrace,
  buildHashTrace,
  buildHeapTrace,
  buildIntervalTrace,
  buildSearchTrace,
  buildStackTrace,
  buildSortingTrace,
  buildTwoPointersTrace,
  buildWindowTrace,
  defaultLongestCommonSubsequenceInput,
  defaultBreadthFirstSearchInput,
  defaultBinarySearchInput,
  defaultCourseScheduleInput,
  defaultContainerWithMostWaterInput,
  defaultDailyTemperaturesInput,
  defaultDijkstraInput,
  defaultLongestSubstringInput,
  defaultKthLargestElementInput,
  defaultTopKFrequentElementsInput,
  defaultLargestRectangleInHistogramInput,
  defaultMinStackInput,
  defaultNumberOfIslandsInput,
  defaultRottingOrangesInput,
  defaultWallsAndGatesInput,
  defaultTwoSumInput,
  defaultTrappingRainWaterInput,
  defaultMergeIntervalsInput,
  defaultMinimumSizeSubarrayInput,
  defaultRotatedSearchInput,
  defaultValidParenthesesInput,
  parseDynamicProgrammingInputText,
  formatGraphDistance,
  parseGraphInputText,
  parseHashInputText,
  parseHeapInputText,
  parseIntervalInputText,
  parseSearchInputText,
  parseStackInputText,
  parseTwoPointersInputText,
  parseWindowInputText,
  serializeDynamicProgrammingInput,
  serializeGraphInput,
  serializeHashInput,
  serializeHeapInput,
  serializeIntervalInput,
  serializeSearchInput,
  serializeStackInput,
  serializeTwoPointersInput,
  serializeWindowInput,
  type DynamicProgrammingAlgorithmId,
  type DynamicProgrammingExecutionState,
  type DynamicProgrammingInput,
  type GraphAlgorithmId,
  type GraphExecutionState,
  type GraphInput,
  type HashAlgorithmId,
  type HashExecutionState,
  type HashInput,
  type HeapAlgorithmId,
  type HeapExecutionState,
  type HeapInput,
  type IntervalAlgorithmId,
  type IntervalExecutionState,
  type IntervalInput,
  type SearchAlgorithmId,
  type SearchExecutionState,
  type SearchInput,
  type StackAlgorithmId,
  type StackExecutionState,
  type StackInput,
  type TwoPointersAlgorithmId,
  type TwoPointersExecutionState,
  type TwoPointersInput,
  type WindowAlgorithmId,
  type WindowExecutionState,
  type WindowInput,
  type SortingAlgorithmId,
  type SortingExecutionState
} from "@tracedeck/execution-engine";
import {
  type JsonObject,
  type TraceEnvelope,
  type TraceStep
} from "@tracedeck/trace-core";

export type AccentTone = "ember" | "teal" | "gold";

type ReplayAlgorithmBase = {
  id: string;
  name: string;
  badge: string;
  accent: AccentTone;
  description: string;
  inputLabel: string;
  inputHint: string;
  defaultInput: string;
};

export type SortingAlgorithm = ReplayAlgorithmBase & {
  id: SortingAlgorithmId;
  domain: "sorting";
};

export type GraphAlgorithm = ReplayAlgorithmBase & {
  id: GraphAlgorithmId;
  domain: "graph";
};

export type SearchAlgorithm = ReplayAlgorithmBase & {
  id: SearchAlgorithmId;
  domain: "search";
};

export type TwoPointersAlgorithm = ReplayAlgorithmBase & {
  id: TwoPointersAlgorithmId;
  domain: "two-pointers";
};

export type WindowAlgorithm = ReplayAlgorithmBase & {
  id: WindowAlgorithmId;
  domain: "window";
};

export type HashAlgorithm = ReplayAlgorithmBase & {
  id: HashAlgorithmId;
  domain: "hash";
};

export type HeapAlgorithm = ReplayAlgorithmBase & {
  id: HeapAlgorithmId;
  domain: "heap";
};

export type IntervalAlgorithm = ReplayAlgorithmBase & {
  id: IntervalAlgorithmId;
  domain: "interval";
};

export type DynamicProgrammingAlgorithm = ReplayAlgorithmBase & {
  id: DynamicProgrammingAlgorithmId;
  domain: "dynamic-programming";
};

export type StackAlgorithm = ReplayAlgorithmBase & {
  id: StackAlgorithmId;
  domain: "stack";
};

export type ReplayAlgorithm =
  | SortingAlgorithm
  | GraphAlgorithm
  | SearchAlgorithm
  | TwoPointersAlgorithm
  | WindowAlgorithm
  | HashAlgorithm
  | HeapAlgorithm
  | IntervalAlgorithm
  | DynamicProgrammingAlgorithm
  | StackAlgorithm;

export type SortingReplayState = SortingExecutionState;
export type GraphReplayState = GraphExecutionState;
export type SearchReplayState = SearchExecutionState;
export type TwoPointersReplayState = TwoPointersExecutionState;
export type DynamicProgrammingReplayState = DynamicProgrammingExecutionState;
export type StackReplayState = StackExecutionState;
export type IntervalReplayState = IntervalExecutionState;
export type HashReplayState = HashExecutionState;
export type HeapReplayState = HeapExecutionState;

export type SortingRun = {
  algorithm: SortingAlgorithm;
  input: number[];
  normalizedInputText: string;
  trace: TraceEnvelope<SortingReplayState>;
};

export type GraphRun = {
  algorithm: GraphAlgorithm;
  input: GraphInput;
  normalizedInputText: string;
  trace: TraceEnvelope<GraphReplayState>;
};

export type SearchRun = {
  algorithm: SearchAlgorithm;
  input: SearchInput;
  normalizedInputText: string;
  trace: TraceEnvelope<SearchReplayState>;
};

export type TwoPointersRun = {
  algorithm: TwoPointersAlgorithm;
  input: TwoPointersInput;
  normalizedInputText: string;
  trace: TraceEnvelope<TwoPointersReplayState>;
};

export type WindowRun = {
  algorithm: WindowAlgorithm;
  input: WindowInput;
  normalizedInputText: string;
  trace: TraceEnvelope<WindowExecutionState>;
};

export type HashRun = {
  algorithm: HashAlgorithm;
  input: HashInput;
  normalizedInputText: string;
  trace: TraceEnvelope<HashReplayState>;
};

export type HeapRun = {
  algorithm: HeapAlgorithm;
  input: HeapInput;
  normalizedInputText: string;
  trace: TraceEnvelope<HeapReplayState>;
};

export type IntervalRun = {
  algorithm: IntervalAlgorithm;
  input: IntervalInput;
  normalizedInputText: string;
  trace: TraceEnvelope<IntervalReplayState>;
};

export type DynamicProgrammingRun = {
  algorithm: DynamicProgrammingAlgorithm;
  input: DynamicProgrammingInput;
  normalizedInputText: string;
  trace: TraceEnvelope<DynamicProgrammingReplayState>;
};

export type StackRun = {
  algorithm: StackAlgorithm;
  input: StackInput;
  normalizedInputText: string;
  trace: TraceEnvelope<StackReplayState>;
};

export type ReplayRun =
  | SortingRun
  | GraphRun
  | SearchRun
  | TwoPointersRun
  | WindowRun
  | HashRun
  | HeapRun
  | IntervalRun
  | DynamicProgrammingRun
  | StackRun;

export function isCourseScheduleInput(
  input: GraphInput
): input is Extract<GraphInput, { courseCount: number }> {
  return "courseCount" in input;
}

export function isPathfindingGraphInput(
  input: GraphInput
): input is Extract<GraphInput, { nodes: string[] }> {
  return "nodes" in input;
}

export function isRottingOrangesInput(
  input: GraphInput
): input is Extract<GraphInput, { grid: number[][] }> {
  return (
    "grid" in input &&
    input.grid.every((row) =>
      row.every((cell) => typeof cell === "number" && Number.isInteger(cell) && cell >= 0 && cell <= 2)
    )
  );
}

export function isNumberOfIslandsInput(
  input: GraphInput
): input is Extract<GraphInput, { grid: string[][] }> {
  return "grid" in input && input.grid.every((row) => row.every((cell) => typeof cell === "string"));
}

export function isWallsAndGatesInput(
  input: GraphInput
): input is Extract<GraphInput, { grid: number[][] }> {
  return (
    "grid" in input &&
    input.grid.every((row) =>
      row.every(
        (cell) =>
          typeof cell === "number" && Number.isInteger(cell) && [-1, 0, 2147483647].includes(cell)
      )
    )
  );
}

function isSearchRun(run: ReplayRun): run is SearchRun {
  return run.algorithm.domain === "search";
}

function isTwoPointersRun(run: ReplayRun): run is TwoPointersRun {
  return run.algorithm.domain === "two-pointers";
}

function isWindowRun(run: ReplayRun): run is WindowRun {
  return run.algorithm.domain === "window";
}

function isLongestSubstringWindowInput(
  input: WindowInput
): input is Extract<WindowInput, { text: string }> {
  return "text" in input && typeof input.text === "string";
}

function isHashRun(run: ReplayRun): run is HashRun {
  return run.algorithm.domain === "hash";
}

function isHeapRun(run: ReplayRun): run is HeapRun {
  return run.algorithm.domain === "heap";
}

function isIntervalRun(run: ReplayRun): run is IntervalRun {
  return run.algorithm.domain === "interval";
}

function isDynamicProgrammingRun(run: ReplayRun): run is DynamicProgrammingRun {
  return run.algorithm.domain === "dynamic-programming";
}

function isStackRun(run: ReplayRun): run is StackRun {
  return run.algorithm.domain === "stack";
}

function parseSortingInput(inputText: string): number[] {
  const tokens = inputText
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  const values = tokens.map((token) => Number.parseInt(token, 10));

  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error("Sorting input must contain only comma-separated integers.");
  }

  if (values.length < 2) {
    throw new Error("Enter at least two comma-separated integers for sorting.");
  }

  if (values.length > 24) {
    throw new Error("Keep sorting input to 24 values or fewer so playback remains readable.");
  }

  return values;
}

function serializeSortingInput(values: number[]): string {
  return values.join(", ");
}

export const algorithms: ReplayAlgorithm[] = [
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    badge: "Sorting",
    accent: "ember",
    description:
      "Adjacent swaps with explicit pass checkpoints and deterministic timeline scrubbing.",
    inputLabel: "Array Input",
    inputHint: "Comma-separated integers",
    defaultInput: "18, 7, 12, 3, 15, 4, 11",
    domain: "sorting"
  },
  {
    id: "insertion-sort",
    name: "Insertion Sort",
    badge: "Sorting",
    accent: "teal",
    description:
      "Prefix-building replay surfaces adjacent candidate swaps and the exact point where each insertion frontier settles.",
    inputLabel: "Array Input",
    inputHint: "Comma-separated integers",
    defaultInput: "18, 7, 12, 3, 15, 4, 11",
    domain: "sorting"
  },
  {
    id: "shell-sort",
    name: "Shell Sort",
    badge: "Sorting",
    accent: "gold",
    description:
      "Gap-driven replay surfaces long-distance swaps first, then the final adjacent cleanup pass inside the shared sorting stage.",
    inputLabel: "Array Input",
    inputHint: "Comma-separated integers",
    defaultInput: "18, 7, 12, 3, 15, 4, 11",
    domain: "sorting"
  },
  {
    id: "selection-sort",
    name: "Selection Sort",
    badge: "Sorting",
    accent: "gold",
    description:
      "Selection-driven passes expose how fewer swaps can still require broad scanning.",
    inputLabel: "Array Input",
    inputHint: "Comma-separated integers",
    defaultInput: "18, 7, 12, 3, 15, 4, 11",
    domain: "sorting"
  },
  {
    id: "quick-sort",
    name: "Quick Sort",
    badge: "Sorting",
    accent: "teal",
    description:
      "Partition-focused replay shows pivot locks, boundary scans, and deterministic recursive checkpoints.",
    inputLabel: "Array Input",
    inputHint: "Comma-separated integers",
    defaultInput: "18, 7, 12, 3, 15, 4, 11",
    domain: "sorting"
  },
  {
    id: "merge-sort",
    name: "Merge Sort",
    badge: "Sorting",
    accent: "ember",
    description:
      "Split-and-merge playback surfaces write-heavy merge windows and stable deterministic snapshots.",
    inputLabel: "Array Input",
    inputHint: "Comma-separated integers",
    defaultInput: "18, 7, 12, 3, 15, 4, 11",
    domain: "sorting"
  },
  {
    id: "heap-sort",
    name: "Heap Sort",
    badge: "Sorting",
    accent: "gold",
    description:
      "Heapify and suffix-extraction replay shows root swaps, sift-down repairs, and the growing sorted tail directly in the shared sorting stage.",
    inputLabel: "Array Input",
    inputHint: "Comma-separated integers",
    defaultInput: "18, 7, 12, 3, 15, 4, 11",
    domain: "sorting"
  },
  {
    id: "binary-search",
    name: "Binary Search",
    badge: "Search",
    accent: "gold",
    description:
      "Interval-driven replay records midpoint probes, discarded halves, and explicit exhausted searches.",
    inputLabel: "Search Input",
    inputHint: "JSON with a sorted integer array and a target value.",
    defaultInput: serializeSearchInput(defaultBinarySearchInput),
    domain: "search"
  },
  {
    id: "search-in-rotated-sorted-array",
    name: "Search in Rotated Sorted Array",
    badge: "Search",
    accent: "teal",
    description:
      "Rotated-array replay records ordered-half detection, discarded branches, and deterministic interval collapse.",
    inputLabel: "Search Input",
    inputHint: "JSON with a rotated distinct integer array and a target value.",
    defaultInput: serializeSearchInput(defaultRotatedSearchInput),
    domain: "search"
  },
  {
    id: "container-with-most-water",
    name: "Container With Most Water",
    badge: "Two pointers",
    accent: "teal",
    description:
      "Dual-pointer replay records active walls, area evaluations, and the pruning move that keeps the sweep deterministic.",
    inputLabel: "Two-pointer Input",
    inputHint: "JSON with a non-negative integer heights array.",
    defaultInput: serializeTwoPointersInput(defaultContainerWithMostWaterInput),
    domain: "two-pointers"
  },
  {
    id: "trapping-rain-water",
    name: "Trapping Rain Water",
    badge: "Two pointers",
    accent: "gold",
    description:
      "Basin replay records boundary-max updates, per-index fills, and the deterministic side that settles next.",
    inputLabel: "Two-pointer Input",
    inputHint: "JSON with a non-negative integer heights array.",
    defaultInput: serializeTwoPointersInput(defaultTrappingRainWaterInput),
    domain: "two-pointers"
  },
  {
    id: "minimum-size-subarray-sum",
    name: "Minimum Size Subarray Sum",
    badge: "Window",
    accent: "ember",
    description:
      "Positive-array replay records window expansions, qualifying contractions, and shortest-hit checkpoints.",
    inputLabel: "Window Input",
    inputHint: "JSON with a positive integer array and a target sum.",
    defaultInput: serializeWindowInput(defaultMinimumSizeSubarrayInput),
    domain: "window"
  },
  {
    id: "longest-substring-without-repeating-characters",
    name: "Longest Substring Without Repeating Characters",
    badge: "Window",
    accent: "teal",
    description:
      "String-window replay records duplicate hits, left-edge contractions, and the best unique substring without browser-side recomputation.",
    inputLabel: "Window Input",
    inputHint: "JSON with a text string up to 32 characters.",
    defaultInput: serializeWindowInput(defaultLongestSubstringInput),
    domain: "window"
  },
  {
    id: "two-sum",
    name: "Two Sum",
    badge: "Hash",
    accent: "gold",
    description:
      "Lookup-table replay records complement checks, stored values, and the exact pair that closes the target.",
    inputLabel: "Hash Input",
    inputHint: "JSON with an integer array and a target that has exactly one solution pair.",
    defaultInput: serializeHashInput(defaultTwoSumInput),
    domain: "hash"
  },
  {
    id: "kth-largest-element-in-an-array",
    name: "Kth Largest Element in an Array",
    badge: "Heap",
    accent: "teal",
    description:
      "Size-k min-heap replay records candidate pushes, root replacements, and the cutoff that settles the final answer.",
    inputLabel: "Heap Input",
    inputHint: "JSON with an integer array and a kth rank between 1 and the array length.",
    defaultInput: serializeHeapInput(defaultKthLargestElementInput),
    domain: "heap"
  },
  {
    id: "top-k-frequent-elements",
    name: "Top K Frequent Elements",
    badge: "Heap",
    accent: "gold",
    description:
      "Frequency-heap replay records count building, size-k cutoff updates, and the final ranked frequency output.",
    inputLabel: "Heap Input",
    inputHint: "JSON with an integer array and a k between 1 and the number of distinct values.",
    defaultInput: serializeHeapInput(defaultTopKFrequentElementsInput),
    domain: "heap"
  },
  {
    id: "merge-intervals",
    name: "Merge Intervals",
    badge: "Intervals",
    accent: "teal",
    description:
      "Classic range-merging replay records sort order, overlap checks, and explicit output commits.",
    inputLabel: "Interval Input",
    inputHint: "JSON with an intervals array of [start, end] integer pairs.",
    defaultInput: serializeIntervalInput(defaultMergeIntervalsInput),
    domain: "interval"
  },
  {
    id: "longest-common-subsequence",
    name: "Longest Common Subsequence",
    badge: "DP",
    accent: "teal",
    description:
      "Table-driven replay records cell fills, diagonal matches, and deterministic traceback through the finished matrix.",
    inputLabel: "DP Input",
    inputHint: "JSON with left and right strings up to 12 characters each.",
    defaultInput: serializeDynamicProgrammingInput(defaultLongestCommonSubsequenceInput),
    domain: "dynamic-programming"
  },
  {
    id: "valid-parentheses",
    name: "Valid Parentheses",
    badge: "Stack",
    accent: "gold",
    description:
      "Bracket-validation replay records push, match, and reject checkpoints over one deterministic stack timeline.",
    inputLabel: "Stack Input",
    inputHint: "JSON with a bracket expression using only (), [], and {}.",
    defaultInput: serializeStackInput(defaultValidParenthesesInput),
    domain: "stack"
  },
  {
    id: "daily-temperatures",
    name: "Daily Temperatures",
    badge: "Stack",
    accent: "teal",
    description:
      "Monotonic-stack replay records unresolved days, warmer-day resolutions, and the final wait ledger without browser-side recomputation.",
    inputLabel: "Stack Input",
    inputHint: "JSON with an integer temperatures array between 0 and 150.",
    defaultInput: serializeStackInput(defaultDailyTemperaturesInput),
    domain: "stack"
  },
  {
    id: "largest-rectangle-in-histogram",
    name: "Largest Rectangle in Histogram",
    badge: "Stack",
    accent: "ember",
    description:
      "Histogram replay records monotonic-stack comparisons, pop-area resolutions, and the final widest rectangle without browser-side recomputation.",
    inputLabel: "Stack Input",
    inputHint: "JSON with a non-negative integer heights array.",
    defaultInput: serializeStackInput(defaultLargestRectangleInHistogramInput),
    domain: "stack"
  },
  {
    id: "min-stack",
    name: "Min Stack",
    badge: "Stack",
    accent: "gold",
    description:
      "Operation-sequence replay records pushes, minimum comparisons, pops, and non-mutating reads without browser-side stack simulation.",
    inputLabel: "Stack Input",
    inputHint:
      "JSON with an operations array using push, pop, top, and getMin. Push values must be integers between -999 and 999.",
    defaultInput: serializeStackInput(defaultMinStackInput),
    domain: "stack"
  },
  {
    id: "bfs",
    name: "Breadth-First Search",
    badge: "Graph",
    accent: "gold",
    description:
      "Hop-count traversal with deterministic queue checkpoints and route recovery.",
    inputLabel: "Graph Input",
    inputHint: "JSON with nodes, edges, start, and target. Edge weights are ignored.",
    defaultInput: serializeGraphInput(defaultBreadthFirstSearchInput),
    domain: "graph"
  },
  {
    id: "dijkstra",
    name: "Dijkstra",
    badge: "Graph",
    accent: "teal",
    description:
      "Weighted shortest-path playback with visible frontier churn and route recovery.",
    inputLabel: "Graph Input",
    inputHint: "JSON with nodes, edges, start, and target",
    defaultInput: serializeGraphInput(defaultDijkstraInput),
    domain: "graph"
  },
  {
    id: "course-schedule",
    name: "Course Schedule",
    badge: "Graph",
    accent: "ember",
    description:
      "Topological scheduling replay with deterministic zero-indegree queue updates and explicit cycle reporting.",
    inputLabel: "Graph Input",
    inputHint: "JSON with courseCount and prerequisite pairs as [course, prerequisite].",
    defaultInput: serializeGraphInput(defaultCourseScheduleInput),
    domain: "graph"
  },
  {
    id: "rotting-oranges",
    name: "Rotting Oranges",
    badge: "Graph",
    accent: "teal",
    description:
      "Minute-based BFS replay records infection waves, fresh-cell stalls, and deterministic grid updates.",
    inputLabel: "Graph Input",
    inputHint: "JSON with a grid using 0 for empty, 1 for fresh oranges, and 2 for rotten oranges.",
    defaultInput: serializeGraphInput(defaultRottingOrangesInput),
    domain: "graph"
  },
  {
    id: "number-of-islands",
    name: "Number of Islands",
    badge: "Graph",
    accent: "gold",
    description:
      "Connected-component replay records row-major scan checkpoints, island expansion, and deterministic grid membership.",
    inputLabel: "Graph Input",
    inputHint: 'JSON with a grid using "0" for water and "1" for land.',
    defaultInput: serializeGraphInput(defaultNumberOfIslandsInput),
    domain: "graph"
  },
  {
    id: "walls-and-gates",
    name: "Walls and Gates",
    badge: "Graph",
    accent: "ember",
    description:
      "Multi-source gate replay records room-distance fills, blocked walls, and unreachable infinity rooms through deterministic BFS waves.",
    inputLabel: "Graph Input",
    inputHint:
      "JSON with a grid using -1 for walls, 0 for gates, and 2147483647 for empty rooms.",
    defaultInput: serializeGraphInput(defaultWallsAndGatesInput),
    domain: "graph"
  }
];

export const comparisonAlgorithms = algorithms.filter(
  (algorithm): algorithm is SortingAlgorithm => algorithm.domain === "sorting"
);

const defaultAlgorithm = algorithms[0];
const defaultComparisonAlgorithm = comparisonAlgorithms[0];

if (!defaultAlgorithm || !defaultComparisonAlgorithm) {
  throw new Error("TraceDeck requires seeded algorithms to build replay runs.");
}

const assuredDefaultAlgorithm = defaultAlgorithm;

export function getAlgorithmById(algorithmId: string): ReplayAlgorithm {
  return algorithms.find((algorithm) => algorithm.id === algorithmId) ?? assuredDefaultAlgorithm;
}

export function formatDistance(distance: number | null): string {
  return formatGraphDistance(distance);
}

function buildSortingRunFromValues(
  algorithm: SortingAlgorithm,
  values: number[],
  normalizedInputText = serializeSortingInput(values)
): SortingRun {
  return {
    algorithm,
    input: values.slice(),
    normalizedInputText,
    trace: buildSortingTrace(algorithm.id, values)
  };
}

function buildGraphRunFromInput(
  algorithm: GraphAlgorithm,
  graph: GraphInput,
  normalizedInputText = serializeGraphInput(graph)
): GraphRun {
  return {
    algorithm,
    input: graph,
    normalizedInputText,
    trace: buildGraphTrace(algorithm.id, graph)
  };
}

function buildSearchRunFromInput(
  algorithm: SearchAlgorithm,
  input: SearchInput,
  normalizedInputText = serializeSearchInput(input)
): SearchRun {
  return {
    algorithm,
    input,
    normalizedInputText,
    trace: buildSearchTrace(algorithm.id, input)
  };
}

function buildWindowRunFromInput(
  algorithm: WindowAlgorithm,
  input: WindowInput,
  normalizedInputText = serializeWindowInput(input)
): WindowRun {
  return {
    algorithm,
    input,
    normalizedInputText,
    trace: buildWindowTrace(algorithm.id, input)
  };
}

function buildTwoPointersRunFromInput(
  algorithm: TwoPointersAlgorithm,
  input: TwoPointersInput,
  normalizedInputText = serializeTwoPointersInput(input)
): TwoPointersRun {
  return {
    algorithm,
    input,
    normalizedInputText,
    trace: buildTwoPointersTrace(algorithm.id, input)
  };
}

function buildHashRunFromInput(
  algorithm: HashAlgorithm,
  input: HashInput,
  normalizedInputText = serializeHashInput(input)
): HashRun {
  return {
    algorithm,
    input,
    normalizedInputText,
    trace: buildHashTrace(algorithm.id, input)
  };
}

function buildHeapRunFromInput(
  algorithm: HeapAlgorithm,
  input: HeapInput,
  normalizedInputText = serializeHeapInput(input)
): HeapRun {
  return {
    algorithm,
    input,
    normalizedInputText,
    trace: buildHeapTrace(algorithm.id, input)
  };
}

function buildIntervalRunFromInput(
  algorithm: IntervalAlgorithm,
  input: IntervalInput,
  normalizedInputText = serializeIntervalInput(input)
): IntervalRun {
  return {
    algorithm,
    input,
    normalizedInputText,
    trace: buildIntervalTrace(algorithm.id, input)
  };
}

function buildDynamicProgrammingRunFromInput(
  algorithm: DynamicProgrammingAlgorithm,
  input: DynamicProgrammingInput,
  normalizedInputText = serializeDynamicProgrammingInput(input)
): DynamicProgrammingRun {
  return {
    algorithm,
    input,
    normalizedInputText,
    trace: buildDynamicProgrammingTrace(algorithm.id, input)
  };
}

function buildStackRunFromInput(
  algorithm: StackAlgorithm,
  input: StackInput,
  normalizedInputText = serializeStackInput(input)
): StackRun {
  return {
    algorithm,
    input,
    normalizedInputText,
    trace: buildStackTrace(algorithm.id, input)
  };
}

export function buildComparisonRuns(inputText: string): SortingRun[] {
  const input = parseSortingInput(inputText);
  const normalizedInputText = serializeSortingInput(input);

  return comparisonAlgorithms.map((algorithm) =>
    buildSortingRunFromValues(algorithm, input, normalizedInputText)
  );
}

export function buildRun(algorithmId: string, inputText: string): ReplayRun {
  const algorithm = getAlgorithmById(algorithmId);

  if (algorithm.domain === "sorting") {
    const input = parseSortingInput(inputText);
    return buildSortingRunFromValues(algorithm, input);
  }

  if (algorithm.domain === "search") {
    const input = parseSearchInputText(inputText, algorithm.id);
    return buildSearchRunFromInput(algorithm, input);
  }

  if (algorithm.domain === "two-pointers") {
    const input = parseTwoPointersInputText(inputText);
    return buildTwoPointersRunFromInput(algorithm, input);
  }

  if (algorithm.domain === "window") {
    const input = parseWindowInputText(inputText, algorithm.id);
    return buildWindowRunFromInput(algorithm, input);
  }

  if (algorithm.domain === "hash") {
    const input = parseHashInputText(inputText);
    return buildHashRunFromInput(algorithm, input);
  }

  if (algorithm.domain === "heap") {
    const input = parseHeapInputText(inputText, algorithm.id);
    return buildHeapRunFromInput(algorithm, input);
  }

  if (algorithm.domain === "interval") {
    const input = parseIntervalInputText(inputText);
    return buildIntervalRunFromInput(algorithm, input);
  }

  if (algorithm.domain === "dynamic-programming") {
    const input = parseDynamicProgrammingInputText(inputText);
    return buildDynamicProgrammingRunFromInput(algorithm, input);
  }

  if (algorithm.domain === "stack") {
    const input = parseStackInputText(inputText, algorithm.id);
    return buildStackRunFromInput(algorithm, input);
  }

  const input = parseGraphInputText(inputText, algorithm.id);
  return buildGraphRunFromInput(algorithm, input);
}

export function describeInputFootprint(run: ReplayRun): string {
  if (Array.isArray(run.input)) {
    return `${run.input.length} lanes`;
  }

  if (isSearchRun(run)) {
    return `${run.input.array.length} lanes / target ${run.input.target}`;
  }

  if (isWindowRun(run)) {
    return isLongestSubstringWindowInput(run.input)
      ? `${Array.from(run.input.text).length} chars`
      : `${run.input.array.length} lanes / target ${run.input.target}`;
  }

  if (isTwoPointersRun(run)) {
    return `${run.input.heights.length} heights`;
  }

  if (isHashRun(run)) {
    return `${run.input.array.length} lanes / target ${run.input.target}`;
  }

  if (isHeapRun(run)) {
    return `${run.input.array.length} lanes / k ${run.input.k}`;
  }

  if (isIntervalRun(run)) {
    return `${run.input.intervals.length} intervals`;
  }

  if (isDynamicProgrammingRun(run)) {
    return `${run.input.left.length} x ${run.input.right.length} table`;
  }

  if (isStackRun(run)) {
    return "expression" in run.input
      ? `${run.input.expression.length} tokens`
      : "temperatures" in run.input
        ? `${run.input.temperatures.length} days`
        : "heights" in run.input
          ? `${run.input.heights.length} bars`
          : `${run.input.operations.length} ops`;
  }

  return isCourseScheduleInput(run.input)
    ? `${run.input.courseCount} courses / ${run.input.prerequisites.length} prerequisites`
    : isRottingOrangesInput(run.input) ||
        isNumberOfIslandsInput(run.input) ||
        isWallsAndGatesInput(run.input)
      ? `${run.input.grid.length} x ${run.input.grid[0]!.length} grid`
    : `${run.input.nodes.length} nodes / ${run.input.edges.length} edges`;
}

export function getTraceStepPaths<State extends JsonObject>(
  step: TraceStep<State> | TraceStep
): string[] {
  return Array.from(new Set(step.changes.map((change) => change.path)));
}
