import type { AlgorithmDomain, JsonObject, JsonValue } from "@tracedeck/trace-core";

import { HttpError } from "../lib/http.js";

import type {
  CourseScheduleInputPayload,
  DynamicProgrammingInputPayload,
  GraphValidTreeInputPayload,
  GraphInputPayload,
  HashInputPayload,
  HeapInputPayload,
  IntervalInputPayload,
  InputPresetListQuery,
  NumberOfIslandsInputPayload,
  PacificAtlanticWaterFlowInputPayload,
  PathfindingGraphInputPayload,
  ShortestBridgeInputPayload,
  ShortestPathBinaryMatrixInputPayload,
  ZeroOneMatrixInputPayload,
  AsFarFromLandAsPossibleInputPayload,
  MapOfHighestPeakInputPayload,
  InputPresetSummary,
  RottingOrangesInputPayload,
  ResolveInputPresetInput,
  ResolvedInputPreset,
  SearchInputPayload,
  StackInputPayload,
  SurroundedRegionsInputPayload,
  SupportedAlgorithmDescriptor,
  SupportedAlgorithmId,
  TwoPointersInputPayload,
  ValidateCustomInputInput,
  ValidatedCustomInput,
  WallsAndGatesInputPayload,
  WindowInputPayload
} from "./types.js";

const supportedAlgorithms: Record<SupportedAlgorithmId, SupportedAlgorithmDescriptor> = {
  "bubble-sort": {
    id: "bubble-sort",
    label: "Bubble Sort",
    domain: "sorting"
  },
  "insertion-sort": {
    id: "insertion-sort",
    label: "Insertion Sort",
    domain: "sorting"
  },
  "shell-sort": {
    id: "shell-sort",
    label: "Shell Sort",
    domain: "sorting"
  },
  "selection-sort": {
    id: "selection-sort",
    label: "Selection Sort",
    domain: "sorting"
  },
  "quick-sort": {
    id: "quick-sort",
    label: "Quick Sort",
    domain: "sorting"
  },
  "merge-sort": {
    id: "merge-sort",
    label: "Merge Sort",
    domain: "sorting"
  },
  "heap-sort": {
    id: "heap-sort",
    label: "Heap Sort",
    domain: "sorting"
  },
  "binary-search": {
    id: "binary-search",
    label: "Binary Search",
    domain: "search"
  },
  "search-in-rotated-sorted-array": {
    id: "search-in-rotated-sorted-array",
    label: "Search in Rotated Sorted Array",
    domain: "search"
  },
  "container-with-most-water": {
    id: "container-with-most-water",
    label: "Container With Most Water",
    domain: "two-pointers"
  },
  "trapping-rain-water": {
    id: "trapping-rain-water",
    label: "Trapping Rain Water",
    domain: "two-pointers"
  },
  "minimum-size-subarray-sum": {
    id: "minimum-size-subarray-sum",
    label: "Minimum Size Subarray Sum",
    domain: "window"
  },
  "longest-substring-without-repeating-characters": {
    id: "longest-substring-without-repeating-characters",
    label: "Longest Substring Without Repeating Characters",
    domain: "window"
  },
  "two-sum": {
    id: "two-sum",
    label: "Two Sum",
    domain: "hash"
  },
  "kth-largest-element-in-an-array": {
    id: "kth-largest-element-in-an-array",
    label: "Kth Largest Element in an Array",
    domain: "heap"
  },
  "top-k-frequent-elements": {
    id: "top-k-frequent-elements",
    label: "Top K Frequent Elements",
    domain: "heap"
  },
  "merge-intervals": {
    id: "merge-intervals",
    label: "Merge Intervals",
    domain: "interval"
  },
  "longest-common-subsequence": {
    id: "longest-common-subsequence",
    label: "Longest Common Subsequence",
    domain: "dynamic-programming"
  },
  "valid-parentheses": {
    id: "valid-parentheses",
    label: "Valid Parentheses",
    domain: "stack"
  },
  "daily-temperatures": {
    id: "daily-temperatures",
    label: "Daily Temperatures",
    domain: "stack"
  },
  "largest-rectangle-in-histogram": {
    id: "largest-rectangle-in-histogram",
    label: "Largest Rectangle in Histogram",
    domain: "stack"
  },
  "min-stack": {
    id: "min-stack",
    label: "Min Stack",
    domain: "stack"
  },
  bfs: {
    id: "bfs",
    label: "Breadth-First Search",
    domain: "graph"
  },
  dfs: {
    id: "dfs",
    label: "Depth-First Search",
    domain: "graph"
  },
  dijkstra: {
    id: "dijkstra",
    label: "Dijkstra",
    domain: "graph"
  },
  "network-delay-time": {
    id: "network-delay-time",
    label: "Network Delay Time",
    domain: "graph"
  },
  "clone-graph": {
    id: "clone-graph",
    label: "Clone Graph",
    domain: "graph"
  },
  "graph-valid-tree": {
    id: "graph-valid-tree",
    label: "Graph Valid Tree",
    domain: "graph"
  },
  "count-connected-components": {
    id: "count-connected-components",
    label: "Count Connected Components",
    domain: "graph"
  },
  "redundant-connection": {
    id: "redundant-connection",
    label: "Redundant Connection",
    domain: "graph"
  },
  "course-schedule": {
    id: "course-schedule",
    label: "Course Schedule",
    domain: "graph"
  },
  "course-schedule-ii": {
    id: "course-schedule-ii",
    label: "Course Schedule II",
    domain: "graph"
  },
  "rotting-oranges": {
    id: "rotting-oranges",
    label: "Rotting Oranges",
    domain: "graph"
  },
  "number-of-islands": {
    id: "number-of-islands",
    label: "Number of Islands",
    domain: "graph"
  },
  "max-area-of-island": {
    id: "max-area-of-island",
    label: "Max Area of Island",
    domain: "graph"
  },
  "island-perimeter": {
    id: "island-perimeter",
    label: "Island Perimeter",
    domain: "graph"
  },
  "pacific-atlantic-water-flow": {
    id: "pacific-atlantic-water-flow",
    label: "Pacific Atlantic Water Flow",
    domain: "graph"
  },
  "shortest-bridge": {
    id: "shortest-bridge",
    label: "Shortest Bridge",
    domain: "graph"
  },
  "shortest-path-binary-matrix": {
    id: "shortest-path-binary-matrix",
    label: "Shortest Path in Binary Matrix",
    domain: "graph"
  },
  "01-matrix": {
    id: "01-matrix",
    label: "01 Matrix",
    domain: "graph"
  },
  "as-far-from-land-as-possible": {
    id: "as-far-from-land-as-possible",
    label: "As Far from Land as Possible",
    domain: "graph"
  },
  "map-of-highest-peak": {
    id: "map-of-highest-peak",
    label: "Map of Highest Peak",
    domain: "graph"
  },
  "surrounded-regions": {
    id: "surrounded-regions",
    label: "Surrounded Regions",
    domain: "graph"
  },
  "walls-and-gates": {
    id: "walls-and-gates",
    label: "Walls and Gates",
    domain: "graph"
  }
};

const sortingAlgorithms = [
  supportedAlgorithms["bubble-sort"],
  supportedAlgorithms["insertion-sort"],
  supportedAlgorithms["shell-sort"],
  supportedAlgorithms["selection-sort"],
  supportedAlgorithms["quick-sort"],
  supportedAlgorithms["merge-sort"],
  supportedAlgorithms["heap-sort"]
] as const;
const binarySearchAlgorithms = [supportedAlgorithms["binary-search"]] as const;
const rotatedSearchAlgorithms = [
  supportedAlgorithms["search-in-rotated-sorted-array"]
] as const;
const containerTwoPointersAlgorithms = [supportedAlgorithms["container-with-most-water"]] as const;
const trappingRainWaterAlgorithms = [supportedAlgorithms["trapping-rain-water"]] as const;
const minimumSizeWindowAlgorithms = [supportedAlgorithms["minimum-size-subarray-sum"]] as const;
const substringWindowAlgorithms = [
  supportedAlgorithms["longest-substring-without-repeating-characters"]
] as const;
const hashAlgorithms = [supportedAlgorithms["two-sum"]] as const;
const kthLargestHeapAlgorithms = [
  supportedAlgorithms["kth-largest-element-in-an-array"]
] as const;
const topKFrequentHeapAlgorithms = [supportedAlgorithms["top-k-frequent-elements"]] as const;
const intervalAlgorithms = [supportedAlgorithms["merge-intervals"]] as const;
const dynamicProgrammingAlgorithms = [supportedAlgorithms["longest-common-subsequence"]] as const;
const validParenthesesAlgorithms = [supportedAlgorithms["valid-parentheses"]] as const;
const dailyTemperaturesAlgorithms = [supportedAlgorithms["daily-temperatures"]] as const;
const largestRectangleAlgorithms = [
  supportedAlgorithms["largest-rectangle-in-histogram"]
] as const;
const minStackAlgorithms = [supportedAlgorithms["min-stack"]] as const;
const pathfindingGraphAlgorithms = [
  supportedAlgorithms.bfs,
  supportedAlgorithms.dfs,
  supportedAlgorithms.dijkstra
] as const;
const networkDelayAlgorithms = [supportedAlgorithms["network-delay-time"]] as const;
const cloneGraphAlgorithms = [supportedAlgorithms["clone-graph"]] as const;
const treeValidationAlgorithms = [supportedAlgorithms["graph-valid-tree"]] as const;
const countConnectedComponentsAlgorithms = [
  supportedAlgorithms["count-connected-components"]
] as const;
const redundantConnectionAlgorithms = [supportedAlgorithms["redundant-connection"]] as const;
const courseScheduleAlgorithms = [
  supportedAlgorithms["course-schedule"],
  supportedAlgorithms["course-schedule-ii"]
] as const;
const rottingOrangesAlgorithms = [supportedAlgorithms["rotting-oranges"]] as const;
const numberOfIslandsAlgorithms = [supportedAlgorithms["number-of-islands"]] as const;
const maxAreaOfIslandAlgorithms = [supportedAlgorithms["max-area-of-island"]] as const;
const islandPerimeterAlgorithms = [supportedAlgorithms["island-perimeter"]] as const;
const pacificAtlanticAlgorithms = [supportedAlgorithms["pacific-atlantic-water-flow"]] as const;
const shortestBridgeAlgorithms = [supportedAlgorithms["shortest-bridge"]] as const;
const shortestPathBinaryMatrixAlgorithms = [
  supportedAlgorithms["shortest-path-binary-matrix"]
] as const;
const zeroOneMatrixAlgorithms = [supportedAlgorithms["01-matrix"]] as const;
const asFarFromLandAsPossibleAlgorithms = [
  supportedAlgorithms["as-far-from-land-as-possible"]
] as const;
const mapOfHighestPeakAlgorithms = [supportedAlgorithms["map-of-highest-peak"]] as const;
const surroundedRegionsAlgorithms = [supportedAlgorithms["surrounded-regions"]] as const;
const wallsAndGatesAlgorithms = [supportedAlgorithms["walls-and-gates"]] as const;
const defaultSortingValues = [18, 7, 12, 3, 15, 4, 11];
const defaultSearchInput: SearchInputPayload = {
  array: [2, 5, 8, 12, 16, 23, 38, 56, 72],
  target: 23
};
const defaultRotatedSearchInput: SearchInputPayload = {
  array: [15, 18, 22, 1, 3, 6, 10, 12],
  target: 6
};
const defaultContainerWithMostWaterInput: TwoPointersInputPayload = {
  heights: [1, 8, 6, 2, 5, 4, 8, 3, 7]
};
const defaultTrappingRainWaterInput: TwoPointersInputPayload = {
  heights: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
};
const defaultWindowInput: WindowInputPayload = {
  array: [2, 3, 1, 2, 4, 3],
  target: 7
};
const defaultLongestSubstringInput: WindowInputPayload = {
  text: "abcabcbb"
};
const defaultHashInput: HashInputPayload = {
  array: [2, 7, 11, 15],
  target: 9
};
const defaultHeapInput: HeapInputPayload = {
  array: [3, 2, 1, 5, 6, 4],
  k: 2
};
const defaultTopKFrequentHeapInput: HeapInputPayload = {
  array: [1, 1, 1, 2, 2, 3],
  k: 2
};
const defaultIntervalInput: IntervalInputPayload = {
  intervals: [
    [1, 3],
    [2, 6],
    [8, 10],
    [15, 18]
  ]
};
const defaultDynamicProgrammingInput: DynamicProgrammingInputPayload = {
  left: "XMJYAUZ",
  right: "MZJAWXU"
};
const defaultStackInput: StackInputPayload = {
  expression: "({[]})[]"
};
const defaultDailyTemperaturesInput: StackInputPayload = {
  temperatures: [73, 74, 75, 71, 69, 72, 76, 73]
};
const defaultLargestRectangleInHistogramInput: StackInputPayload = {
  heights: [2, 1, 5, 6, 2, 3]
};
const defaultMinStackInput: StackInputPayload = {
  operations: [
    { type: "push", value: -2 },
    { type: "push", value: 0 },
    { type: "push", value: -3 },
    { type: "getMin" },
    { type: "pop" },
    { type: "top" },
    { type: "getMin" }
  ]
};
const defaultGraphInput: PathfindingGraphInputPayload = {
  nodes: ["A", "B", "C", "D", "E", "F"],
  edges: [
    ["A", "B", 4],
    ["A", "C", 2],
    ["B", "C", 1],
    ["B", "D", 5],
    ["C", "D", 8],
    ["C", "E", 10],
    ["D", "E", 2],
    ["D", "F", 6],
    ["E", "F", 3]
  ],
  start: "A",
  target: "F",
  directed: false
};
const defaultCourseScheduleInput: CourseScheduleInputPayload = {
  courseCount: 5,
  prerequisites: [
    [1, 0],
    [2, 0],
    [3, 1],
    [3, 2],
    [4, 3]
  ]
};
const defaultCloneGraphInput: PathfindingGraphInputPayload = {
  nodes: ["A", "B", "C", "D", "E"],
  edges: [
    ["A", "B", 1],
    ["A", "C", 1],
    ["B", "D", 1],
    ["C", "D", 1],
    ["D", "E", 1]
  ],
  start: "A",
  target: null,
  directed: false
};
const defaultNetworkDelayTimeInput: PathfindingGraphInputPayload = {
  nodes: ["A", "B", "C", "D", "E"],
  edges: [
    ["A", "B", 1],
    ["A", "C", 4],
    ["B", "C", 2],
    ["B", "D", 6],
    ["C", "D", 3],
    ["D", "E", 1],
    ["C", "E", 7]
  ],
  start: "A",
  target: null,
  directed: true
};
const defaultGraphValidTreeInput: GraphValidTreeInputPayload = {
  nodeCount: 5,
  edges: [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4]
  ]
};
const defaultCountConnectedComponentsInput: GraphValidTreeInputPayload = {
  nodeCount: 6,
  edges: [
    [0, 1],
    [1, 2],
    [3, 4]
  ]
};
const defaultRedundantConnectionInput: GraphValidTreeInputPayload = {
  nodeCount: 5,
  edges: [
    [0, 1],
    [1, 2],
    [2, 3],
    [1, 3],
    [1, 4]
  ]
};
const defaultRottingOrangesInput: RottingOrangesInputPayload = {
  grid: [
    [2, 1, 1],
    [1, 1, 0],
    [0, 1, 1]
  ]
};
const defaultNumberOfIslandsInput: NumberOfIslandsInputPayload = {
  grid: [
    ["1", "1", "0", "0", "0"],
    ["1", "1", "0", "0", "0"],
    ["0", "0", "1", "0", "0"],
    ["0", "0", "0", "1", "1"]
  ]
};
const defaultMaxAreaOfIslandInput: NumberOfIslandsInputPayload = {
  grid: [
    ["0", "0", "1", "0", "0"],
    ["1", "1", "1", "0", "1"],
    ["0", "1", "0", "0", "1"],
    ["0", "0", "0", "1", "1"]
  ]
};
const defaultIslandPerimeterInput: NumberOfIslandsInputPayload = {
  grid: [
    ["0", "1", "0", "0"],
    ["1", "1", "1", "0"],
    ["0", "1", "0", "0"],
    ["1", "1", "0", "0"]
  ]
};
const defaultPacificAtlanticWaterFlowInput: PacificAtlanticWaterFlowInputPayload = {
  grid: [
    [1, 2, 2, 3, 5],
    [3, 2, 3, 4, 4],
    [2, 4, 5, 3, 1],
    [6, 7, 1, 4, 5],
    [5, 1, 1, 2, 4]
  ]
};
const defaultShortestBridgeInput: ShortestBridgeInputPayload = {
  grid: [
    [0, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 1, 1]
  ]
};
const defaultShortestPathBinaryMatrixInput: ShortestPathBinaryMatrixInputPayload = {
  grid: [
    [0, 1, 0, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0]
  ]
};
const defaultZeroOneMatrixInput: ZeroOneMatrixInputPayload = {
  grid: [
    [0, 0, 0],
    [0, 1, 0],
    [1, 1, 1]
  ]
};
const defaultAsFarFromLandAsPossibleInput: AsFarFromLandAsPossibleInputPayload = {
  grid: [
    [1, 0, 1],
    [0, 0, 0],
    [1, 0, 1]
  ]
};
const defaultMapOfHighestPeakInput: MapOfHighestPeakInputPayload = {
  grid: [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0]
  ]
};
const defaultSurroundedRegionsInput: SurroundedRegionsInputPayload = {
  grid: [
    ["X", "X", "X", "X"],
    ["X", "O", "O", "X"],
    ["X", "X", "O", "X"],
    ["X", "O", "X", "X"]
  ]
};
const wallsAndGatesInfinity = 2147483647;
const defaultWallsAndGatesInput: WallsAndGatesInputPayload = {
  grid: [
    [wallsAndGatesInfinity, -1, 0, wallsAndGatesInfinity],
    [wallsAndGatesInfinity, wallsAndGatesInfinity, wallsAndGatesInfinity, -1],
    [wallsAndGatesInfinity, -1, wallsAndGatesInfinity, -1],
    [0, -1, wallsAndGatesInfinity, wallsAndGatesInfinity]
  ]
};

interface NormalizedInputPayload {
  input: JsonValue;
  normalizedInputText: string;
  footprint: string;
}

interface InputPresetDefinition {
  summary: InputPresetSummary;
  resolve: (request: ResolveInputPresetInput) => {
    input: unknown;
    options: JsonObject;
    seed?: number;
  };
}

function isLongestSubstringWindowInput(
  input: WindowInputPayload
): input is Extract<WindowInputPayload, { text: string }> {
  return "text" in input && typeof input.text === "string";
}

function cloneAlgorithmDescriptor(
  descriptor: SupportedAlgorithmDescriptor
): SupportedAlgorithmDescriptor {
  return {
    ...descriptor
  };
}

function clonePresetSummary(summary: InputPresetSummary): InputPresetSummary {
  return {
    ...summary,
    algorithms: summary.algorithms.map(cloneAlgorithmDescriptor),
    ...(summary.defaultOptions !== undefined
      ? {
          defaultOptions: {
            ...summary.defaultOptions
          }
        }
      : {})
  };
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);

    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function expectIntegerOption(
  options: JsonObject,
  key: string,
  fallback: number,
  minimum: number,
  maximum: number
) {
  const value = options[key];

  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new HttpError(400, `options.${key} must be an integer.`);
  }

  if (value < minimum || value > maximum) {
    throw new HttpError(
      400,
      `options.${key} must be between ${minimum} and ${maximum}.`
    );
  }

  return value;
}

function expectBooleanOption(options: JsonObject, key: string, fallback: boolean) {
  const value = options[key];

  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "boolean") {
    throw new HttpError(400, `options.${key} must be a boolean.`);
  }

  return value;
}

function assertAllowedOptionKeys(
  options: JsonObject,
  allowedKeys: string[],
  presetId: string
) {
  for (const key of Object.keys(options)) {
    if (!allowedKeys.includes(key)) {
      throw new HttpError(
        400,
        `Preset "${presetId}" does not support option "${key}".`
      );
    }
  }
}

function normalizeSortingValues(payload: unknown): number[] {
  const values =
    typeof payload === "string"
      ? payload
          .split(",")
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
          .map((value) => Number.parseInt(value, 10))
      : Array.isArray(payload)
        ? payload.map((value) => {
            if (typeof value !== "number" || !Number.isInteger(value)) {
              throw new HttpError(
                400,
                "Sorting input arrays must contain only integers."
              );
            }

            return value;
          })
        : null;

  if (!values) {
    throw new HttpError(
      400,
      "Sorting input must be either a comma-separated string or an integer array."
    );
  }

  if (values.some((value) => !Number.isFinite(value))) {
    throw new HttpError(400, "Sorting input must contain only finite integers.");
  }

  if (values.length < 2) {
    throw new HttpError(400, "Sorting input must include at least two integers.");
  }

  if (values.length > 24) {
    throw new HttpError(
      400,
      "Sorting input must contain 24 integers or fewer."
    );
  }

  return values;
}

function serializeSortingValues(values: number[]) {
  return values.join(", ");
}

function normalizeIntegerSearchInput(payload: unknown): SearchInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Search input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Search input must be an object with array and target.");
  }

  const value = candidate as {
    array?: unknown;
    target?: unknown;
  };

  if (!Array.isArray(value.array) || value.array.length < 2) {
    throw new HttpError(
      400,
      "Search input must define a sorted array with at least two integers."
    );
  }

  if (value.array.length > 32) {
    throw new HttpError(400, "Search input must contain 32 integers or fewer.");
  }

  const array = value.array.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry)) {
      throw new HttpError(400, `array[${index}] must be an integer.`);
    }

    return entry;
  });

  if (typeof value.target !== "number" || !Number.isInteger(value.target)) {
    throw new HttpError(400, "Search input target must be an integer.");
  }

  return {
    array,
    target: value.target
  };
}

function assertAscendingSortedSearchInput(array: number[]) {
  for (let index = 1; index < array.length; index += 1) {
    if (array[index - 1]! > array[index]!) {
      throw new HttpError(400, "Binary Search input array must be sorted in ascending order.");
    }
  }
}

function assertRotatedSortedSearchInput(array: number[]) {
  const seen = new Set<number>();
  let dropCount = 0;

  for (let index = 0; index < array.length; index += 1) {
    const value = array[index]!;

    if (seen.has(value)) {
      throw new HttpError(
        400,
        "Search in Rotated Sorted Array requires distinct integers."
      );
    }

    seen.add(value);

    if (index > 0 && array[index - 1]! > value) {
      dropCount += 1;
    }
  }

  if (dropCount > 1) {
    throw new HttpError(
      400,
      "Search in Rotated Sorted Array input must be a rotation of a strictly increasing array."
    );
  }

  if (dropCount === 1 && array[array.length - 1]! >= array[0]!) {
    throw new HttpError(
      400,
      "Search in Rotated Sorted Array input must wrap exactly once when the order drops."
    );
  }
}

function normalizeSearchInput(
  payload: unknown,
  algorithmId: "binary-search" | "search-in-rotated-sorted-array"
): SearchInputPayload {
  const input = normalizeIntegerSearchInput(payload);

  if (algorithmId === "binary-search") {
    assertAscendingSortedSearchInput(input.array);
    return input;
  }

  assertRotatedSortedSearchInput(input.array);
  return input;
}

function parseWindowCandidate(payload: unknown) {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Window input strings must contain valid JSON.");
          }
        })()
      : payload;

  return candidate;
}

function normalizeMinimumSizeWindowInput(payload: unknown): WindowInputPayload {
  const candidate = parseWindowCandidate(payload);

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Window input must be an object with array and target.");
  }

  const value = candidate as {
    array?: unknown;
    target?: unknown;
  };

  if (!Array.isArray(value.array) || value.array.length < 2) {
    throw new HttpError(
      400,
      "Window input must include an array with at least two positive integers."
    );
  }

  if (value.array.length > 32) {
    throw new HttpError(400, "Window input arrays must contain 32 integers or fewer.");
  }

  const array = value.array.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry) || entry <= 0) {
      throw new HttpError(400, `array[${index}] must be a positive integer.`);
    }

    return entry;
  });

  if (typeof value.target !== "number" || !Number.isInteger(value.target) || value.target <= 0) {
    throw new HttpError(400, "Window input target must be a positive integer.");
  }

  return {
    array,
    target: value.target
  };
}

function normalizeLongestSubstringWindowInput(payload: unknown): WindowInputPayload {
  const candidate = parseWindowCandidate(payload);

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Window input must be an object with text.");
  }

  const value = candidate as {
    text?: unknown;
  };

  if (typeof value.text !== "string") {
    throw new HttpError(400, "Window input text must be a string.");
  }

  const characters = Array.from(value.text);

  if (characters.length < 1) {
    throw new HttpError(400, "Window input text must contain at least one character.");
  }

  if (characters.length > 32) {
    throw new HttpError(400, "Window input text must contain 32 characters or fewer.");
  }

  return {
    text: value.text
  };
}

function normalizeWindowInput(
  payload: unknown,
  algorithmId: "minimum-size-subarray-sum" | "longest-substring-without-repeating-characters"
): WindowInputPayload {
  if (algorithmId === "longest-substring-without-repeating-characters") {
    return normalizeLongestSubstringWindowInput(payload);
  }

  return normalizeMinimumSizeWindowInput(payload);
}

function normalizeTwoPointersInput(payload: unknown): TwoPointersInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Two-pointers input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Two-pointers input must be an object with a heights array.");
  }

  const value = candidate as {
    heights?: unknown;
  };

  if (!Array.isArray(value.heights) || value.heights.length < 2) {
    throw new HttpError(400, "Two-pointers input must include at least two heights.");
  }

  if (value.heights.length > 24) {
    throw new HttpError(400, "Two-pointers input arrays must contain 24 heights or fewer.");
  }

  const heights = value.heights.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry) || entry < 0) {
      throw new HttpError(400, `heights[${index}] must be a non-negative integer.`);
    }

    return entry;
  });

  return {
    heights
  };
}

function normalizeIntervalInput(payload: unknown): IntervalInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Interval input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Interval input must be an object with an intervals array.");
  }

  const value = candidate as {
    intervals?: unknown;
  };

  if (!Array.isArray(value.intervals) || value.intervals.length === 0) {
    throw new HttpError(400, "Interval input must include at least one interval.");
  }

  if (value.intervals.length > 12) {
    throw new HttpError(400, "Interval input must contain 12 intervals or fewer.");
  }

  const intervals = value.intervals.map((interval, index) => {
    if (!Array.isArray(interval) || interval.length !== 2) {
      throw new HttpError(
        400,
        `intervals[${index}] must contain exactly two integer boundaries.`
      );
    }

    const start = interval[0];
    const end = interval[1];

    if (typeof start !== "number" || !Number.isInteger(start)) {
      throw new HttpError(400, `intervals[${index}][0] must be an integer.`);
    }

    if (typeof end !== "number" || !Number.isInteger(end)) {
      throw new HttpError(400, `intervals[${index}][1] must be an integer.`);
    }

    if (start > end) {
      throw new HttpError(400, `intervals[${index}] must satisfy start <= end.`);
    }

    return [start, end];
  });

  return {
    intervals
  };
}

function serializeSearchInput(input: SearchInputPayload) {
  return JSON.stringify(
    {
      array: input.array,
      target: input.target
    },
    null,
    2
  );
}

function serializeWindowInput(input: WindowInputPayload) {
  if ("text" in input) {
    return JSON.stringify(
      {
        text: input.text
      },
      null,
      2
    );
  }

  return JSON.stringify(
    {
      array: input.array,
      target: input.target
    },
    null,
    2
  );
}

function serializeTwoPointersInput(input: TwoPointersInputPayload) {
  return JSON.stringify(
    {
      heights: input.heights
    },
    null,
    2
  );
}

function countHashPairs(array: number[], target: number) {
  let pairCount = 0;

  for (let left = 0; left < array.length - 1; left += 1) {
    for (let right = left + 1; right < array.length; right += 1) {
      if (array[left]! + array[right]! === target) {
        pairCount += 1;
      }
    }
  }

  return pairCount;
}

function normalizeHashInput(payload: unknown): HashInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Hash input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Hash input must be an object with array and target.");
  }

  const value = candidate as {
    array?: unknown;
    target?: unknown;
  };

  if (!Array.isArray(value.array) || value.array.length < 2) {
    throw new HttpError(400, "Hash input must include an array with at least two integers.");
  }

  if (value.array.length > 24) {
    throw new HttpError(400, "Hash input arrays must contain 24 integers or fewer.");
  }

  const array = value.array.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry)) {
      throw new HttpError(400, `array[${index}] must be an integer.`);
    }

    return entry;
  });

  if (typeof value.target !== "number" || !Number.isInteger(value.target)) {
    throw new HttpError(400, "Hash input target must be an integer.");
  }

  const pairCount = countHashPairs(array, value.target);

  if (pairCount === 0) {
    throw new HttpError(400, "Two Sum input must contain exactly one solution pair.");
  }

  if (pairCount > 1) {
    throw new HttpError(
      400,
      "Two Sum input must contain exactly one solution pair so replay stays deterministic."
    );
  }

  return {
    array,
    target: value.target
  };
}

function serializeHashInput(input: HashInputPayload) {
  return JSON.stringify(
    {
      array: input.array,
      target: input.target
    },
    null,
    2
  );
}

function normalizeHeapBaseInput(
  payload: unknown,
  options: {
    minimumLength: number;
    minimumLabel: string;
  }
) {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Heap input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Heap input must be an object with array and k.");
  }

  const value = candidate as {
    array?: unknown;
    k?: unknown;
  };

  if (!Array.isArray(value.array) || value.array.length < options.minimumLength) {
    throw new HttpError(
      400,
      `Heap input must include an array with at least ${options.minimumLabel}.`
    );
  }

  if (value.array.length > 24) {
    throw new HttpError(400, "Heap input arrays must contain 24 integers or fewer.");
  }

  const array = value.array.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry)) {
      throw new HttpError(400, `array[${index}] must be an integer.`);
    }

    return entry;
  });

  if (typeof value.k !== "number" || !Number.isInteger(value.k)) {
    throw new HttpError(400, "Heap input k must be an integer.");
  }

  return {
    array,
    k: value.k
  };
}

function normalizeKthLargestElementInput(payload: unknown): HeapInputPayload {
  const heap = normalizeHeapBaseInput(payload, {
    minimumLength: 2,
    minimumLabel: "two integers"
  });

  if (heap.k < 1 || heap.k > heap.array.length) {
    throw new HttpError(400, "Heap input k must be between 1 and the array length.");
  }

  return heap;
}

function normalizeTopKFrequentElementsInput(payload: unknown): HeapInputPayload {
  const heap = normalizeHeapBaseInput(payload, {
    minimumLength: 1,
    minimumLabel: "one integer"
  });
  const distinctCount = new Set(heap.array).size;

  if (heap.k < 1 || heap.k > distinctCount) {
    throw new HttpError(
      400,
      "Top K Frequent Elements input k must be between 1 and the number of distinct values."
    );
  }

  return heap;
}

function serializeHeapInput(input: HeapInputPayload) {
  return JSON.stringify(
    {
      array: input.array,
      k: input.k
    },
    null,
    2
  );
}

function serializeIntervalInput(input: IntervalInputPayload) {
  return JSON.stringify(
    {
      intervals: input.intervals
    },
    null,
    2
  );
}

function normalizeValidParenthesesInput(payload: unknown): StackInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Stack input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Stack input must be an object with an expression string.");
  }

  const value = candidate as {
    expression?: unknown;
  };

  if (typeof value.expression !== "string" || value.expression.length === 0) {
    throw new HttpError(400, "Stack input expression must be a non-empty string.");
  }

  if (value.expression.length > 32) {
    throw new HttpError(400, "Stack input expressions must be 32 characters or fewer.");
  }

  if (!/^[()[\]{}]+$/.test(value.expression)) {
    throw new HttpError(400, "Stack input expression must contain only bracket tokens: (), [], {}.");
  }

  return {
    expression: value.expression
  };
}

function normalizeDailyTemperaturesInput(payload: unknown): StackInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Stack input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Stack input must be an object with a temperatures array.");
  }

  const value = candidate as {
    temperatures?: unknown;
  };

  if (!Array.isArray(value.temperatures) || value.temperatures.length < 2) {
    throw new HttpError(400, "Daily Temperatures input must include at least two temperatures.");
  }

  if (value.temperatures.length > 24) {
    throw new HttpError(
      400,
      "Daily Temperatures input arrays must contain 24 temperatures or fewer."
    );
  }

  const temperatures = value.temperatures.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry)) {
      throw new HttpError(400, `temperatures[${index}] must be an integer.`);
    }

    if (entry < 0 || entry > 150) {
      throw new HttpError(400, `temperatures[${index}] must be between 0 and 150.`);
    }

    return entry;
  });

  return {
    temperatures
  };
}

function normalizeLargestRectangleInHistogramInput(payload: unknown): StackInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Stack input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Stack input must be an object with a heights array.");
  }

  const value = candidate as {
    heights?: unknown;
  };

  if (!Array.isArray(value.heights) || value.heights.length === 0) {
    throw new HttpError(
      400,
      "Largest Rectangle in Histogram input must include at least one height."
    );
  }

  if (value.heights.length > 24) {
    throw new HttpError(
      400,
      "Largest Rectangle in Histogram input arrays must contain 24 heights or fewer."
    );
  }

  const heights = value.heights.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry)) {
      throw new HttpError(400, `heights[${index}] must be an integer.`);
    }

    if (entry < 0 || entry > 150) {
      throw new HttpError(400, `heights[${index}] must be between 0 and 150.`);
    }

    return entry;
  });

  return {
    heights
  };
}

function isMinStackOperationType(
  value: unknown
): value is "push" | "pop" | "top" | "getMin" {
  return value === "push" || value === "pop" || value === "top" || value === "getMin";
}

function normalizeMinStackInput(payload: unknown): StackInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Stack input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Stack input must be an object with an operations array.");
  }

  const value = candidate as {
    operations?: unknown;
  };

  if (!Array.isArray(value.operations) || value.operations.length === 0) {
    throw new HttpError(400, "Min Stack input must include at least one operation.");
  }

  if (value.operations.length > 24) {
    throw new HttpError(400, "Min Stack input arrays must contain 24 operations or fewer.");
  }

  let depth = 0;
  const operations = value.operations.map((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new HttpError(400, `operations[${index}] must be an object.`);
    }

    const operation = entry as {
      type?: unknown;
      value?: unknown;
    };

    if (!isMinStackOperationType(operation.type)) {
      throw new HttpError(
        400,
        `operations[${index}].type must be one of push, pop, top, or getMin.`
      );
    }

    if (operation.type === "push") {
      if (typeof operation.value !== "number" || !Number.isInteger(operation.value)) {
        throw new HttpError(400, `operations[${index}].value must be an integer.`);
      }

      if (operation.value < -999 || operation.value > 999) {
        throw new HttpError(400, `operations[${index}].value must be between -999 and 999.`);
      }

      depth += 1;

      return {
        type: operation.type,
        value: operation.value
      };
    }

    if (operation.value !== undefined) {
      throw new HttpError(
        400,
        `operations[${index}] must not include value for ${operation.type}.`
      );
    }

    if (depth === 0) {
      throw new HttpError(400, `operations[${index}] cannot run on an empty stack.`);
    }

    if (operation.type === "pop") {
      depth -= 1;
    }

    return {
      type: operation.type
    };
  });

  return {
    operations
  };
}

function normalizeStackInput(
  payload: unknown,
  algorithmId: SupportedAlgorithmId = "valid-parentheses"
): StackInputPayload {
  switch (algorithmId) {
    case "valid-parentheses":
      return normalizeValidParenthesesInput(payload);
    case "daily-temperatures":
      return normalizeDailyTemperaturesInput(payload);
    case "largest-rectangle-in-histogram":
      return normalizeLargestRectangleInHistogramInput(payload);
    case "min-stack":
      return normalizeMinStackInput(payload);
    default:
      throw new HttpError(400, `Stack algorithm "${algorithmId}" is not supported.`);
  }
}

function serializeStackInput(input: StackInputPayload) {
  if (typeof input.expression === "string") {
    return JSON.stringify(
      {
        expression: input.expression
      },
      null,
      2
    );
  }

  return JSON.stringify(
    typeof input.temperatures !== "undefined"
      ? {
          temperatures: input.temperatures
        }
      : typeof input.heights !== "undefined"
        ? {
            heights: input.heights
          }
        : {
            operations: input.operations
          },
    null,
    2
  );
}

function normalizeDynamicProgrammingInput(payload: unknown): DynamicProgrammingInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(
              400,
              "Dynamic-programming input strings must contain valid JSON."
            );
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(
      400,
      "Dynamic-programming input must be an object with left and right strings."
    );
  }

  const value = candidate as {
    left?: unknown;
    right?: unknown;
  };

  if (typeof value.left !== "string" || value.left.length === 0) {
    throw new HttpError(400, "Dynamic-programming input left must be a non-empty string.");
  }

  if (typeof value.right !== "string" || value.right.length === 0) {
    throw new HttpError(400, "Dynamic-programming input right must be a non-empty string.");
  }

  if (value.left.length > 12 || value.right.length > 12) {
    throw new HttpError(
      400,
      "Dynamic-programming input strings must be 12 characters or fewer."
    );
  }

  return {
    left: value.left,
    right: value.right
  };
}

function serializeDynamicProgrammingInput(input: DynamicProgrammingInputPayload) {
  return JSON.stringify(
    {
      left: input.left,
      right: input.right
    },
    null,
    2
  );
}

function normalizeGraphEdge(edge: unknown, label: string): [string, string, number] {
  if (!Array.isArray(edge) || edge.length !== 3) {
    throw new HttpError(400, `${label} must contain [from, to, weight] tuples.`);
  }

  const [from, to, weight] = edge;

  if (typeof from !== "string" || typeof to !== "string") {
    throw new HttpError(400, `${label} endpoints must be strings.`);
  }

  if (typeof weight !== "number" || !Number.isFinite(weight) || weight <= 0) {
    throw new HttpError(400, `${label} weights must be positive finite numbers.`);
  }

  return [from.trim(), to.trim(), Number(weight)];
}

function normalizePathfindingGraphInput(payload: unknown): PathfindingGraphInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Graph input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(
      400,
      "Graph input must be an object with nodes, edges, start, and target."
    );
  }

  const value = candidate as {
    nodes?: unknown;
    edges?: unknown;
    start?: unknown;
    target?: unknown;
    directed?: unknown;
  };

  if (!Array.isArray(value.nodes) || value.nodes.length < 2) {
    throw new HttpError(400, "Graph input must define at least two nodes.");
  }

  if (!Array.isArray(value.edges) || value.edges.length === 0) {
    throw new HttpError(400, "Graph input must define at least one weighted edge.");
  }

  const nodes = Array.from(
    new Set(
      value.nodes.map((node, index) => {
        if (typeof node !== "string" || !node.trim()) {
          throw new HttpError(400, `nodes[${index}] must be a non-empty string.`);
        }

        return node.trim();
      })
    )
  );
  const edges = value.edges.map((edge, index) =>
    normalizeGraphEdge(edge, `edges[${index}]`)
  );

  if (typeof value.start !== "string" || !value.start.trim()) {
    throw new HttpError(400, "Graph input start must be a non-empty string.");
  }

  const start = value.start.trim();
  const target =
    value.target === null || value.target === undefined
      ? null
      : typeof value.target === "string" && value.target.trim()
        ? value.target.trim()
        : (() => {
            throw new HttpError(
              400,
              "Graph input target must be a string or null."
            );
          })();

  if (!nodes.includes(start)) {
    throw new HttpError(400, "Graph input start must exist in nodes.");
  }

  if (target !== null && !nodes.includes(target)) {
    throw new HttpError(400, "Graph input target must exist in nodes.");
  }

  for (const [from, to] of edges) {
    if (!nodes.includes(from) || !nodes.includes(to)) {
      throw new HttpError(400, "Every graph edge endpoint must exist in nodes.");
    }
  }

  return {
    nodes,
    edges,
    start,
    target,
    directed: Boolean(value.directed)
  };
}

function normalizeNetworkDelayTimeInput(payload: unknown): PathfindingGraphInputPayload {
  const input = normalizePathfindingGraphInput(payload);

  if (input.target !== null) {
    throw new HttpError(400, "Network Delay Time input target must be null.");
  }

  return input;
}

function normalizeCourseScheduleInput(payload: unknown): CourseScheduleInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(
              400,
              "Course Schedule input strings must contain valid JSON."
            );
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(
      400,
      "Course Schedule input must be an object with courseCount and prerequisites."
    );
  }

  const value = candidate as {
    courseCount?: unknown;
    prerequisites?: unknown;
  };

  if (
    typeof value.courseCount !== "number" ||
    !Number.isInteger(value.courseCount) ||
    value.courseCount < 2
  ) {
    throw new HttpError(
      400,
      "Course Schedule input courseCount must be an integer of at least 2."
    );
  }

  if (value.courseCount > 16) {
    throw new HttpError(400, "Course Schedule input courseCount must be 16 or fewer.");
  }

  const courseCount = value.courseCount;

  if (!Array.isArray(value.prerequisites)) {
    throw new HttpError(
      400,
      "Course Schedule input must include a prerequisites array."
    );
  }

  const prerequisites = value.prerequisites.map((entry, index) => {
    if (!Array.isArray(entry) || entry.length !== 2) {
      throw new HttpError(
        400,
        `prerequisites[${index}] must contain [course, prerequisite].`
      );
    }

    const [course, prerequisite] = entry;

    if (typeof course !== "number" || !Number.isInteger(course)) {
      throw new HttpError(400, `prerequisites[${index}][0] must be an integer.`);
    }

    if (typeof prerequisite !== "number" || !Number.isInteger(prerequisite)) {
      throw new HttpError(400, `prerequisites[${index}][1] must be an integer.`);
    }

    if (
      course < 0 ||
      course >= courseCount ||
      prerequisite < 0 ||
      prerequisite >= courseCount
    ) {
      throw new HttpError(
        400,
        `prerequisites[${index}] must reference course ids between 0 and ${courseCount - 1}.`
      );
    }

    if (course === prerequisite) {
      throw new HttpError(
        400,
        `prerequisites[${index}] must not depend on the same course twice.`
      );
    }

    return [course, prerequisite] as [number, number];
  });

  return {
    courseCount,
    prerequisites
  };
}

function normalizeGraphValidTreeInput(payload: unknown): GraphValidTreeInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(
              400,
              "Graph Valid Tree input strings must contain valid JSON."
            );
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Graph Valid Tree input must be an object with nodeCount and edges.");
  }

  const value = candidate as {
    nodeCount?: unknown;
    edges?: unknown;
  };

  if (
    typeof value.nodeCount !== "number" ||
    !Number.isInteger(value.nodeCount) ||
    value.nodeCount < 2
  ) {
    throw new HttpError(400, "Graph Valid Tree input nodeCount must be an integer of at least 2.");
  }

  if (value.nodeCount > 12) {
    throw new HttpError(400, "Graph Valid Tree input nodeCount must be 12 or fewer.");
  }

  if (!Array.isArray(value.edges) || value.edges.length === 0) {
    throw new HttpError(400, "Graph Valid Tree input must include at least one edge.");
  }

  if (value.edges.length > 24) {
    throw new HttpError(400, "Graph Valid Tree input must use 24 edges or fewer.");
  }

  const edges = value.edges.map((edge, index) => {
    if (!Array.isArray(edge) || edge.length !== 2) {
      throw new HttpError(400, `edges[${index}] must contain [from, to].`);
    }

    const [from, to] = edge;

    if (typeof from !== "number" || !Number.isInteger(from)) {
      throw new HttpError(400, `edges[${index}][0] must be an integer.`);
    }

    if (typeof to !== "number" || !Number.isInteger(to)) {
      throw new HttpError(400, `edges[${index}][1] must be an integer.`);
    }

    if (from < 0 || from >= value.nodeCount || to < 0 || to >= value.nodeCount) {
      throw new HttpError(
        400,
        `edges[${index}] must reference node ids between 0 and ${value.nodeCount - 1}.`
      );
    }

    return [from, to] as [number, number];
  });

  return {
    nodeCount: value.nodeCount,
    edges
  };
}

function normalizeRottingOrangesInput(payload: unknown): RottingOrangesInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(
              400,
              "Rotting Oranges input strings must contain valid JSON."
            );
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Rotting Oranges input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new HttpError(400, "Rotting Oranges input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new HttpError(400, "Rotting Oranges input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new HttpError(400, `grid[${rowIndex}] must be a non-empty integer array.`);
    }

    if (row.length > 8) {
      throw new HttpError(400, `grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || cell < 0 || cell > 2) {
        throw new HttpError(400, `grid[${rowIndex}][${columnIndex}] must be 0, 1, or 2.`);
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new HttpError(400, "Rotting Oranges input rows must all be the same length.");
  }

  return {
    grid
  };
}

function normalizeNumberOfIslandsInput(payload: unknown): NumberOfIslandsInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(
              400,
              "Number of Islands input strings must contain valid JSON."
            );
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Number of Islands input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new HttpError(400, "Number of Islands input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new HttpError(400, "Number of Islands input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new HttpError(400, `grid[${rowIndex}] must be a non-empty land-water array.`);
    }

    if (row.length > 8) {
      throw new HttpError(400, `grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (cell === 0 || cell === "0") {
        return "0";
      }

      if (cell === 1 || cell === "1") {
        return "1";
      }

      throw new HttpError(400, `grid[${rowIndex}][${columnIndex}] must be "0" or "1".`);
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new HttpError(400, "Number of Islands input rows must all be the same length.");
  }

  return {
    grid
  };
}

function normalizePacificAtlanticWaterFlowInput(
  payload: unknown
): PacificAtlanticWaterFlowInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(
              400,
              "Pacific Atlantic Water Flow input strings must contain valid JSON."
            );
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(
      400,
      "Pacific Atlantic Water Flow input must be an object with a grid field."
    );
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new HttpError(400, "Pacific Atlantic Water Flow input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new HttpError(400, "Pacific Atlantic Water Flow input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new HttpError(400, `grid[${rowIndex}] must be a non-empty heights row.`);
    }

    if (row.length > 8) {
      throw new HttpError(400, `grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || cell < 0) {
        throw new HttpError(
          400,
          `grid[${rowIndex}][${columnIndex}] must be a non-negative integer height.`
        );
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new HttpError(
      400,
      "Pacific Atlantic Water Flow input rows must all be the same length."
    );
  }

  return {
    grid
  };
}

function normalizeShortestBridgeInput(payload: unknown): ShortestBridgeInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Shortest Bridge input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Shortest Bridge input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new HttpError(400, "Shortest Bridge input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new HttpError(400, "Shortest Bridge input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new HttpError(400, `grid[${rowIndex}] must be a non-empty binary row.`);
    }

    if (row.length > 8) {
      throw new HttpError(400, `grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || (cell !== 0 && cell !== 1)) {
        throw new HttpError(400, `grid[${rowIndex}][${columnIndex}] must be either 0 or 1.`);
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new HttpError(400, "Shortest Bridge input rows must all be the same length.");
  }

  return {
    grid
  };
}

function normalizeShortestPathBinaryMatrixInput(
  payload: unknown
): ShortestPathBinaryMatrixInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(
              400,
              "Shortest Path in Binary Matrix input strings must contain valid JSON."
            );
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(
      400,
      "Shortest Path in Binary Matrix input must be an object with a grid field."
    );
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new HttpError(400, "Shortest Path in Binary Matrix input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new HttpError(400, "Shortest Path in Binary Matrix input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new HttpError(400, `grid[${rowIndex}] must be a non-empty binary row.`);
    }

    if (row.length > 8) {
      throw new HttpError(400, `grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || (cell !== 0 && cell !== 1)) {
        throw new HttpError(400, `grid[${rowIndex}][${columnIndex}] must be either 0 or 1.`);
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new HttpError(
      400,
      "Shortest Path in Binary Matrix input rows must all be the same length."
    );
  }

  return {
    grid
  };
}

function normalizeZeroOneMatrixInput(payload: unknown): ZeroOneMatrixInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "01 Matrix input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "01 Matrix input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new HttpError(400, "01 Matrix input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new HttpError(400, "01 Matrix input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new HttpError(400, `grid[${rowIndex}] must be a non-empty binary row.`);
    }

    if (row.length > 8) {
      throw new HttpError(400, `grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || (cell !== 0 && cell !== 1)) {
        throw new HttpError(400, `grid[${rowIndex}][${columnIndex}] must be either 0 or 1.`);
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new HttpError(400, "01 Matrix input rows must all be the same length.");
  }

  return {
    grid
  };
}

function normalizeAsFarFromLandAsPossibleInput(
  payload: unknown
): AsFarFromLandAsPossibleInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(
              400,
              "As Far from Land as Possible input strings must contain valid JSON."
            );
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(
      400,
      "As Far from Land as Possible input must be an object with a grid field."
    );
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new HttpError(400, "As Far from Land as Possible input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new HttpError(400, "As Far from Land as Possible input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new HttpError(400, `grid[${rowIndex}] must be a non-empty binary row.`);
    }

    if (row.length > 8) {
      throw new HttpError(400, `grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || (cell !== 0 && cell !== 1)) {
        throw new HttpError(400, `grid[${rowIndex}][${columnIndex}] must be either 0 or 1.`);
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new HttpError(
      400,
      "As Far from Land as Possible input rows must all be the same length."
    );
  }

  return {
    grid
  };
}

function normalizeMapOfHighestPeakInput(payload: unknown): MapOfHighestPeakInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Map of Highest Peak input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Map of Highest Peak input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new HttpError(400, "Map of Highest Peak input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new HttpError(400, "Map of Highest Peak input must use 8 rows or fewer.");
  }

  let hasWater = false;

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new HttpError(400, `grid[${rowIndex}] must be a non-empty binary row.`);
    }

    if (row.length > 8) {
      throw new HttpError(400, `grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || (cell !== 0 && cell !== 1)) {
        throw new HttpError(400, `grid[${rowIndex}][${columnIndex}] must be either 0 or 1.`);
      }

      if (cell === 1) {
        hasWater = true;
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new HttpError(400, "Map of Highest Peak input rows must all be the same length.");
  }

  if (!hasWater) {
    throw new HttpError(400, "Map of Highest Peak input must include at least one water cell.");
  }

  return {
    grid
  };
}

function normalizeSurroundedRegionsInput(payload: unknown): SurroundedRegionsInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(
              400,
              "Surrounded Regions input strings must contain valid JSON."
            );
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Surrounded Regions input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new HttpError(400, "Surrounded Regions input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new HttpError(400, "Surrounded Regions input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new HttpError(400, `grid[${rowIndex}] must be a non-empty capture grid row.`);
    }

    if (row.length > 8) {
      throw new HttpError(400, `grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "string") {
        throw new HttpError(400, `grid[${rowIndex}][${columnIndex}] must be "X" or "O".`);
      }

      const normalizedCell = cell.trim().toUpperCase();

      if (normalizedCell !== "X" && normalizedCell !== "O") {
        throw new HttpError(400, `grid[${rowIndex}][${columnIndex}] must be "X" or "O".`);
      }

      return normalizedCell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new HttpError(400, "Surrounded Regions input rows must all be the same length.");
  }

  return {
    grid
  };
}

function normalizeWallsAndGatesInput(payload: unknown): WallsAndGatesInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(
              400,
              "Walls and Gates input strings must contain valid JSON."
            );
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Walls and Gates input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new HttpError(400, "Walls and Gates input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new HttpError(400, "Walls and Gates input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new HttpError(400, `grid[${rowIndex}] must be a non-empty integer array.`);
    }

    if (row.length > 8) {
      throw new HttpError(400, `grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (
        typeof cell !== "number" ||
        !Number.isInteger(cell) ||
        ![-1, 0, wallsAndGatesInfinity].includes(cell)
      ) {
        throw new HttpError(
          400,
          `grid[${rowIndex}][${columnIndex}] must be -1, 0, or ${wallsAndGatesInfinity}.`
        );
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new HttpError(400, "Walls and Gates input rows must all be the same length.");
  }

  return {
    grid
  };
}

function normalizeGraphInput(
  payload: unknown,
  algorithmId: SupportedAlgorithmId
): GraphInputPayload {
  switch (algorithmId) {
    case "network-delay-time":
      return normalizeNetworkDelayTimeInput(payload);
    case "graph-valid-tree":
    case "count-connected-components":
    case "redundant-connection":
      return normalizeGraphValidTreeInput(payload);
    case "course-schedule":
    case "course-schedule-ii":
      return normalizeCourseScheduleInput(payload);
    case "rotting-oranges":
      return normalizeRottingOrangesInput(payload);
    case "number-of-islands":
    case "max-area-of-island":
    case "island-perimeter":
      return normalizeNumberOfIslandsInput(payload);
    case "pacific-atlantic-water-flow":
      return normalizePacificAtlanticWaterFlowInput(payload);
    case "shortest-bridge":
      return normalizeShortestBridgeInput(payload);
    case "shortest-path-binary-matrix":
      return normalizeShortestPathBinaryMatrixInput(payload);
    case "01-matrix":
      return normalizeZeroOneMatrixInput(payload);
    case "as-far-from-land-as-possible":
      return normalizeAsFarFromLandAsPossibleInput(payload);
    case "map-of-highest-peak":
      return normalizeMapOfHighestPeakInput(payload);
    case "surrounded-regions":
      return normalizeSurroundedRegionsInput(payload);
    case "walls-and-gates":
      return normalizeWallsAndGatesInput(payload);
    default:
      return normalizePathfindingGraphInput(payload);
  }
}

function isCourseScheduleGraphPayload(graph: GraphInputPayload): graph is CourseScheduleInputPayload {
  return "courseCount" in graph && Array.isArray(graph.prerequisites);
}

function isGraphValidTreePayload(graph: GraphInputPayload): graph is GraphValidTreeInputPayload {
  return "nodeCount" in graph && Array.isArray(graph.edges);
}

function isGridGraphPayload(
  graph: GraphInputPayload
): graph is
  | RottingOrangesInputPayload
  | NumberOfIslandsInputPayload
  | PacificAtlanticWaterFlowInputPayload
  | ShortestBridgeInputPayload
  | ShortestPathBinaryMatrixInputPayload
  | AsFarFromLandAsPossibleInputPayload
  | MapOfHighestPeakInputPayload
  | SurroundedRegionsInputPayload
  | WallsAndGatesInputPayload {
  return "grid" in graph && Array.isArray(graph.grid);
}

function serializeGraphInput(input: GraphInputPayload) {
  if (isGraphValidTreePayload(input)) {
    return JSON.stringify(
      {
        nodeCount: input.nodeCount,
        edges: input.edges
      },
      null,
      2
    );
  }

  if ("courseCount" in input) {
    return JSON.stringify(
      {
        courseCount: input.courseCount,
        prerequisites: input.prerequisites
      },
      null,
      2
    );
  }

  if ("grid" in input) {
    return JSON.stringify(
      {
        grid: input.grid
      },
      null,
      2
    );
  }

  return JSON.stringify(
    {
      nodes: input.nodes,
      edges: input.edges,
      start: input.start,
      target: input.target,
      directed: input.directed
    },
    null,
    2
  );
}

function normalizeAlgorithmInput(
  algorithmId: SupportedAlgorithmId,
  payload: unknown
): NormalizedInputPayload {
  const algorithm = supportedAlgorithms[algorithmId];

  if (!algorithm) {
    throw new HttpError(400, `Algorithm "${algorithmId}" is not supported.`);
  }

  if (algorithm.domain === "sorting") {
    const values = normalizeSortingValues(payload);

    return {
      input: values,
      normalizedInputText: serializeSortingValues(values),
      footprint: `${values.length} lanes`
    };
  }

  if (algorithm.domain === "search") {
    const searchAlgorithmId =
      algorithm.id === "search-in-rotated-sorted-array"
        ? "search-in-rotated-sorted-array"
        : "binary-search";
    const search = normalizeSearchInput(payload, searchAlgorithmId);

    return {
      input: search,
      normalizedInputText: serializeSearchInput(search),
      footprint: `${search.array.length} lanes / target ${search.target}`
    };
  }

  if (algorithm.domain === "window") {
    const window = normalizeWindowInput(
      payload,
      algorithm.id === "longest-substring-without-repeating-characters"
        ? "longest-substring-without-repeating-characters"
        : "minimum-size-subarray-sum"
    );

    return {
      input: window,
      normalizedInputText: serializeWindowInput(window),
      footprint: isLongestSubstringWindowInput(window)
        ? `${Array.from(window.text).length} chars`
        : `${window.array.length} lanes / target ${window.target}`
    };
  }

  if (algorithm.domain === "two-pointers") {
    const twoPointers = normalizeTwoPointersInput(payload);

    return {
      input: twoPointers,
      normalizedInputText: serializeTwoPointersInput(twoPointers),
      footprint: `${twoPointers.heights.length} heights`
    };
  }

  if (algorithm.domain === "hash") {
    const hash = normalizeHashInput(payload);

    return {
      input: hash,
      normalizedInputText: serializeHashInput(hash),
      footprint: `${hash.array.length} lanes / target ${hash.target}`
    };
  }

  if (algorithm.domain === "heap") {
    const heap =
      algorithm.id === "kth-largest-element-in-an-array"
        ? normalizeKthLargestElementInput(payload)
        : normalizeTopKFrequentElementsInput(payload);

    return {
      input: heap,
      normalizedInputText: serializeHeapInput(heap),
      footprint: `${heap.array.length} lanes / k ${heap.k}`
    };
  }

  if (algorithm.domain === "interval") {
    const interval = normalizeIntervalInput(payload);

    return {
      input: interval,
      normalizedInputText: serializeIntervalInput(interval),
      footprint: `${interval.intervals.length} intervals`
    };
  }

  if (algorithm.domain === "dynamic-programming") {
    const dynamicProgramming = normalizeDynamicProgrammingInput(payload);

    return {
      input: dynamicProgramming,
      normalizedInputText: serializeDynamicProgrammingInput(dynamicProgramming),
      footprint: `${dynamicProgramming.left.length} x ${dynamicProgramming.right.length} table`
    };
  }

  if (algorithm.domain === "stack") {
    const stack = normalizeStackInput(payload, algorithm.id);

    return {
      input: stack,
      normalizedInputText: serializeStackInput(stack),
      footprint:
        typeof stack.expression === "string"
          ? `${stack.expression.length} tokens`
          : typeof stack.temperatures !== "undefined"
            ? `${stack.temperatures.length} days`
            : typeof stack.heights !== "undefined"
              ? `${stack.heights.length} bars`
              : `${Array.isArray(stack.operations) ? stack.operations.length : 0} ops`
    };
  }

  const graph = normalizeGraphInput(payload, algorithm.id);

  return {
    input: graph,
    normalizedInputText: serializeGraphInput(graph),
    footprint:
      isGraphValidTreePayload(graph)
        ? `${graph.nodeCount} nodes / ${graph.edges.length} edges`
        : isCourseScheduleGraphPayload(graph)
        ? `${graph.courseCount} courses / ${graph.prerequisites.length} prerequisites`
        : isGridGraphPayload(graph)
          ? `${graph.grid.length} x ${graph.grid[0]!.length} grid`
          : `${graph.nodes.length} nodes / ${graph.edges.length} edges`
  };
}

function createSortingReverseSortedInput(options: JsonObject): number[] {
  assertAllowedOptionKeys(options, ["size", "start", "step"], "sorting.reverse-sorted");

  const size = expectIntegerOption(options, "size", 8, 2, 24);
  const start = expectIntegerOption(options, "start", size * 4, size, 999);
  const step = expectIntegerOption(options, "step", 3, 1, 100);

  return Array.from({ length: size }, (_, index) => start - index * step);
}

function createSortingNearlySortedInput(seed: number, options: JsonObject): number[] {
  assertAllowedOptionKeys(options, ["size", "swaps"], "sorting.nearly-sorted");

  const size = expectIntegerOption(options, "size", 10, 2, 24);
  const swaps = expectIntegerOption(options, "swaps", 2, 1, Math.max(1, size - 1));
  const random = createSeededRandom(seed);
  const values = Array.from({ length: size }, (_, index) => index + 1);

  for (let index = 0; index < swaps; index += 1) {
    const left = Math.floor(random() * (size - 1));
    const right = left + 1;

    [values[left], values[right]] = [values[right]!, values[left]!];
  }

  return values;
}

function createSortingRandomInput(seed: number, options: JsonObject): number[] {
  assertAllowedOptionKeys(
    options,
    ["size", "minimum", "maximum"],
    "sorting.random-distinct"
  );

  const size = expectIntegerOption(options, "size", 8, 2, 24);
  const minimum = expectIntegerOption(options, "minimum", 1, -999, 999);
  const maximum = expectIntegerOption(
    options,
    "maximum",
    Math.max(40, size * 8),
    minimum + size - 1,
    5000
  );

  if (maximum - minimum + 1 < size) {
    throw new HttpError(
      400,
      "options.maximum must leave enough room for distinct generated values."
    );
  }

  const random = createSeededRandom(seed);
  const values = new Set<number>();

  while (values.size < size) {
    values.add(minimum + Math.floor(random() * (maximum - minimum + 1)));
  }

  return Array.from(values);
}

function edgeKey(from: string, to: string, directed: boolean) {
  return directed ? `${from}->${to}` : [from, to].sort().join("<->");
}

function createRandomGraph(seed: number, options: JsonObject): GraphInputPayload {
  assertAllowedOptionKeys(
    options,
    ["nodes", "extraEdges", "directed"],
    "graph.random-network"
  );

  const nodeCount = expectIntegerOption(options, "nodes", 6, 3, 12);
  const directed = expectBooleanOption(options, "directed", false);
  const baseEdgeCount = nodeCount - 1;
  const maximumPossibleEdges = directed
    ? nodeCount * (nodeCount - 1)
    : (nodeCount * (nodeCount - 1)) / 2;
  const maxExtraEdges = maximumPossibleEdges - baseEdgeCount;
  const extraEdges = expectIntegerOption(
    options,
    "extraEdges",
    Math.min(Math.max(2, nodeCount - 2), maxExtraEdges),
    0,
    maxExtraEdges
  );
  const random = createSeededRandom(seed);
  const nodes = Array.from({ length: nodeCount }, (_, index) =>
    String.fromCharCode(65 + index)
  );
  const edges: Array<[string, string, number]> = [];
  const seen = new Set<string>();

  for (let index = 0; index < nodes.length - 1; index += 1) {
    const from = nodes[index]!;
    const to = nodes[index + 1]!;

    edges.push([from, to, 2 + Math.floor(random() * 8)]);
    seen.add(edgeKey(from, to, directed));
  }

  let remainingExtraEdges = extraEdges;

  while (remainingExtraEdges > 0) {
    const from = nodes[Math.floor(random() * nodes.length)]!;
    const to = nodes[Math.floor(random() * nodes.length)]!;

    if (from === to) {
      continue;
    }

    const key = edgeKey(from, to, directed);

    if (seen.has(key)) {
      continue;
    }

    edges.push([from, to, 1 + Math.floor(random() * 9)]);
    seen.add(key);
    remainingExtraEdges -= 1;
  }

  return {
    nodes,
    edges,
    start: nodes[0]!,
    target: nodes[nodes.length - 1]!,
    directed
  };
}

const presetDefinitions: InputPresetDefinition[] = [
  {
    summary: {
      id: "sorting.baseline",
      label: "Sorting baseline deck",
      description:
        "Use the same baseline array as the replay shell so side-by-side sorting runs stay comparable.",
      scenario: "baseline",
      kind: "curated",
      domain: "sorting",
      algorithms: sortingAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultSortingValues,
      options: {}
    })
  },
  {
    summary: {
      id: "sorting.reverse-sorted",
      label: "Reverse sorted worst case",
      description:
        "Start from a descending array to emphasize the broadest mutation cost for comparison-oriented sorting traces.",
      scenario: "worst-case",
      kind: "generated",
      domain: "sorting",
      algorithms: sortingAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false,
      defaultOptions: {
        size: 8,
        start: 32,
        step: 3
      }
    },
    resolve: (request) => ({
      input: createSortingReverseSortedInput(request.options ?? {}),
      options: {
        ...(request.options ?? {})
      }
    })
  },
  {
    summary: {
      id: "sorting.nearly-sorted",
      label: "Nearly sorted array",
      description:
        "Generate a mostly ordered array with a small number of seeded inversions for regression-style replay checks.",
      scenario: "near-best-case",
      kind: "generated",
      domain: "sorting",
      algorithms: sortingAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: true,
      defaultSeed: 23,
      defaultOptions: {
        size: 10,
        swaps: 2
      }
    },
    resolve: (request) => {
      const seed = request.seed ?? 23;

      return {
        input: createSortingNearlySortedInput(seed, request.options ?? {}),
        seed,
        options: {
          ...(request.options ?? {})
        }
      };
    }
  },
  {
    summary: {
      id: "sorting.random-distinct",
      label: "Seeded random array",
      description:
        "Generate a deterministic set of distinct integers so repeated runs can share the same replay input.",
      scenario: "random",
      kind: "generated",
      domain: "sorting",
      algorithms: sortingAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: true,
      defaultSeed: 17,
      defaultOptions: {
        size: 8,
        minimum: 1,
        maximum: 64
      }
    },
    resolve: (request) => {
      const seed = request.seed ?? 17;

      return {
        input: createSortingRandomInput(seed, request.options ?? {}),
        seed,
        options: {
          ...(request.options ?? {})
        }
      };
    }
  },
  {
    summary: {
      id: "search.reference-hit",
      label: "Reference midpoint hit",
      description:
        "Use a curated sorted array where the target is present so binary-search probes and interval cuts stay easy to inspect.",
      scenario: "baseline",
      kind: "curated",
      domain: "search",
      algorithms: binarySearchAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultSearchInput,
      options: {}
    })
  },
  {
    summary: {
      id: "search.rotated-reference-hit",
      label: "Rotated reference hit",
      description:
        "Use a curated rotated array with a target behind the pivot so ordered-half detection stays visible in replay.",
      scenario: "baseline",
      kind: "curated",
      domain: "search",
      algorithms: rotatedSearchAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultRotatedSearchInput,
      options: {}
    })
  },
  {
    summary: {
      id: "search.missing-target",
      label: "Absent target search",
      description:
        "Keep the target outside the sorted array so replay ends on an explicit exhausted interval instead of a match.",
      scenario: "miss",
      kind: "curated",
      domain: "search",
      algorithms: binarySearchAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        array: [3, 7, 11, 18, 24, 31, 42, 56],
        target: 19
      },
      options: {}
    })
  },
  {
    summary: {
      id: "search.rotated-missing-target",
      label: "Rotated absent target",
      description:
        "Keep the target outside a curated rotated array so replay ends on an explicit exhausted interval after multiple ordered-half checks.",
      scenario: "miss",
      kind: "curated",
      domain: "search",
      algorithms: rotatedSearchAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        array: [30, 34, 41, 5, 9, 12, 18, 24],
        target: 17
      },
      options: {}
    })
  },
  {
    summary: {
      id: "two-pointers.reference-basin",
      label: "Reference wide basin",
      description:
        "Use the canonical Container With Most Water heights so replay shows the early best area and later pointer pruning clearly.",
      scenario: "baseline",
      kind: "curated",
      domain: "two-pointers",
      algorithms: containerTwoPointersAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultContainerWithMostWaterInput,
      options: {}
    })
  },
  {
    summary: {
      id: "two-pointers.inner-peak",
      label: "Inner peak basin",
      description:
        "Keep the tallest wall away from the edge so replay has to prune inward before the best container is discovered.",
      scenario: "inner-peak",
      kind: "curated",
      domain: "two-pointers",
      algorithms: containerTwoPointersAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        heights: [2, 3, 10, 5, 7, 8, 9]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "two-pointers.reference-rain-basin",
      label: "Reference rain basin",
      description:
        "Use the canonical rainwater skyline so replay shows boundary-max updates and trapped-water fills on both sides of the basin.",
      scenario: "baseline",
      kind: "curated",
      domain: "two-pointers",
      algorithms: trappingRainWaterAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultTrappingRainWaterInput,
      options: {}
    })
  },
  {
    summary: {
      id: "two-pointers.stepped-reservoir",
      label: "Stepped reservoir",
      description:
        "Keep multiple internal dips between tall boundary walls so replay surfaces repeated fills without changing the boundary maxima every frame.",
      scenario: "stepped-reservoir",
      kind: "curated",
      domain: "two-pointers",
      algorithms: trappingRainWaterAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        heights: [4, 2, 0, 3, 2, 5]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "window.reference-target",
      label: "Reference shrinking window",
      description:
        "Use the classic positive-array target hit so sliding-window contractions and best-window updates stay easy to inspect.",
      scenario: "baseline",
      kind: "curated",
      domain: "window",
      algorithms: minimumSizeWindowAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultWindowInput,
      options: {}
    })
  },
  {
    summary: {
      id: "window.no-solution",
      label: "No qualifying window",
      description:
        "Keep the target larger than every reachable contiguous sum so replay ends with an explicit no-solution outcome.",
      scenario: "miss",
      kind: "curated",
      domain: "window",
      algorithms: minimumSizeWindowAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        array: [1, 1, 1, 1, 1, 1],
        target: 9
      },
      options: {}
    })
  },
  {
    summary: {
      id: "window.reference-substring",
      label: "Reference unique substring",
      description:
        "Use the classic repeating-pattern string so replay shows expansion, duplicate detection, contraction, and the final longest unique substring.",
      scenario: "baseline",
      kind: "curated",
      domain: "window",
      algorithms: substringWindowAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultLongestSubstringInput,
      options: {}
    })
  },
  {
    summary: {
      id: "window.overlapping-repeat",
      label: "Overlapping repeat window",
      description:
        "Keep repeats close together so replay shows several shrink steps before a new unique substring can become the best answer.",
      scenario: "overlap",
      kind: "curated",
      domain: "window",
      algorithms: substringWindowAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        text: "pwwkew"
      },
      options: {}
    })
  },
  {
    summary: {
      id: "hash.reference-hit",
      label: "Reference complement hit",
      description:
        "Use the canonical Two Sum array so replay shows the early complement lookup and explicit pair lock.",
      scenario: "baseline",
      kind: "curated",
      domain: "hash",
      algorithms: hashAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultHashInput,
      options: {}
    })
  },
  {
    summary: {
      id: "hash.negative-values",
      label: "Negative complement pair",
      description:
        "Mix negative and positive values so the lookup table has to recover a complement across the sign boundary.",
      scenario: "negative-values",
      kind: "curated",
      domain: "hash",
      algorithms: hashAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        array: [-3, 4, 3, 90],
        target: 0
      },
      options: {}
    })
  },
  {
    summary: {
      id: "heap.reference-kth",
      label: "Reference kth-largest cutoff",
      description:
        "Use the classic Kth Largest Element in an Array fixture so replay shows heap seeding, root replacement, and the final cutoff.",
      scenario: "baseline",
      kind: "curated",
      domain: "heap",
      algorithms: kthLargestHeapAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultHeapInput,
      options: {}
    })
  },
  {
    summary: {
      id: "heap.duplicate-cutoff",
      label: "Duplicate cutoff heap",
      description:
        "Include duplicates near the cutoff so replay shows exactly when equal high values stay inside the heap and where the kth threshold lands.",
      scenario: "duplicates",
      kind: "curated",
      domain: "heap",
      algorithms: kthLargestHeapAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        array: [3, 2, 3, 1, 2, 4, 5, 5, 6],
        k: 4
      },
      options: {}
    })
  },
  {
    summary: {
      id: "heap.reference-top-frequencies",
      label: "Reference top frequencies",
      description:
        "Use the canonical Top K Frequent Elements fixture so replay shows frequency counting, heap seeding, and the final ranked frequency output.",
      scenario: "baseline",
      kind: "curated",
      domain: "heap",
      algorithms: topKFrequentHeapAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultTopKFrequentHeapInput,
      options: {}
    })
  },
  {
    summary: {
      id: "heap.tie-frequency-cutoff",
      label: "Tie-frequency cutoff",
      description:
        "Force several values to share the same count so replay has to apply the deterministic heap tie-break when the top-k frontier fills.",
      scenario: "tie-break",
      kind: "curated",
      domain: "heap",
      algorithms: topKFrequentHeapAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        array: [4, 1, -1, 2, -1, 2, 3, 3],
        k: 2
      },
      options: {}
    })
  },
  {
    summary: {
      id: "interval.reference-overlap",
      label: "Reference overlap chain",
      description:
        "Use the classic Merge Intervals example so replay shows sorting, overlap checks, and multi-range output commits.",
      scenario: "baseline",
      kind: "curated",
      domain: "interval",
      algorithms: intervalAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultIntervalInput,
      options: {}
    })
  },
  {
    summary: {
      id: "interval.touching-ranges",
      label: "Touching interval boundaries",
      description:
        "Include touching ranges so replay makes the inclusive overlap rule visible at the boundary itself.",
      scenario: "touching",
      kind: "curated",
      domain: "interval",
      algorithms: intervalAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        intervals: [
          [1, 4],
          [4, 5],
          [7, 9],
          [8, 12]
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "dynamic-programming.reference-overlap",
      label: "Reference overlap table",
      description:
        "Use a classic LCS pair with a non-trivial traceback so the table fill and reconstruction phases stay visible in replay.",
      scenario: "baseline",
      kind: "curated",
      domain: "dynamic-programming",
      algorithms: dynamicProgrammingAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultDynamicProgrammingInput,
      options: {}
    })
  },
  {
    summary: {
      id: "dynamic-programming.no-overlap",
      label: "No-overlap strings",
      description:
        "Keep both strings disjoint so the replay exercises zero-length tables and deterministic traceback tie breaks.",
      scenario: "no-overlap",
      kind: "curated",
      domain: "dynamic-programming",
      algorithms: dynamicProgrammingAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        left: "ABC",
        right: "XYZ"
      },
      options: {}
    })
  },
  {
    summary: {
      id: "stack.reference-valid",
      label: "Reference valid bracket string",
      description:
        "Use a balanced bracket expression so replay can show pushes, matches, and a clean empty-stack finish.",
      scenario: "baseline",
      kind: "curated",
      domain: "stack",
      algorithms: validParenthesesAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultStackInput,
      options: {}
    })
  },
  {
    summary: {
      id: "stack.early-mismatch",
      label: "Early mismatch bracket string",
      description:
        "Introduce a classic crossing mismatch so replay ends on the first invalid closer with the expected token still visible.",
      scenario: "mismatch",
      kind: "curated",
      domain: "stack",
      algorithms: validParenthesesAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        expression: "([)]"
      },
      options: {}
    })
  },
  {
    summary: {
      id: "stack.reference-forecast",
      label: "Reference warming forecast",
      description:
        "Use the canonical monotonic-stack forecast so replay shows unresolved days popping as warmer temperatures arrive.",
      scenario: "baseline",
      kind: "curated",
      domain: "stack",
      algorithms: dailyTemperaturesAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultDailyTemperaturesInput,
      options: {}
    })
  },
  {
    summary: {
      id: "stack.late-spike",
      label: "Late spike forecast",
      description:
        "Hold the warmest day until late in the skyline so replay resolves several waiting days in one deterministic burst.",
      scenario: "late-spike",
      kind: "curated",
      domain: "stack",
      algorithms: dailyTemperaturesAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        temperatures: [68, 67, 65, 64, 66, 63, 72, 70]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "stack.reference-histogram",
      label: "Reference histogram",
      description:
        "Use the canonical histogram so replay shows monotonic-stack pops closing the widest rectangle in a short, readable skyline.",
      scenario: "baseline",
      kind: "curated",
      domain: "stack",
      algorithms: largestRectangleAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultLargestRectangleInHistogramInput,
      options: {}
    })
  },
  {
    summary: {
      id: "stack.inner-valley",
      label: "Inner valley histogram",
      description:
        "Drop to a narrow valley between taller bars so replay has to flush several candidate rectangles before the widest span is clear.",
      scenario: "inner-valley",
      kind: "curated",
      domain: "stack",
      algorithms: largestRectangleAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        heights: [3, 1, 3, 2, 2]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "stack.reference-min-stack",
      label: "Reference Min Stack",
      description:
        "Use the classic Min Stack operation stream so replay shows minimum updates, non-mutating reads, and minimum recovery after a pop.",
      scenario: "baseline",
      kind: "curated",
      domain: "stack",
      algorithms: minStackAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultMinStackInput,
      options: {}
    })
  },
  {
    summary: {
      id: "stack.recovering-minimum",
      label: "Recovering minimum",
      description:
        "Push a deeper low, read it, pop it away, and confirm the earlier minimum resurfaces without rebuilding the stack in the client.",
      scenario: "minimum-recovery",
      kind: "curated",
      domain: "stack",
      algorithms: minStackAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        operations: [
          { type: "push", value: 4 },
          { type: "push", value: 1 },
          { type: "push", value: -5 },
          { type: "getMin" },
          { type: "pop" },
          { type: "getMin" },
          { type: "top" }
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-route",
      label: "Reference route graph",
      description:
        "Weighted graph fixture aligned with the shared pathfinding runtime and local replay shell.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: pathfindingGraphAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultGraphInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-broadcast",
      label: "Reference broadcast graph",
      description:
        "Weighted directed network fixture aligned with the shared broadcast runtime and terminal network-delay ledger.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: networkDelayAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultNetworkDelayTimeInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.unreachable-broadcast",
      label: "Unreachable broadcast",
      description:
        "Leave one node outside the directed signal fan-out so replay can publish both the arrival ledger and the unreachable-node result.",
      scenario: "unreachable",
      kind: "curated",
      domain: "graph",
      algorithms: networkDelayAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        nodes: ["A", "B", "C", "D", "E"],
        edges: [
          ["A", "B", 1],
          ["B", "C", 2],
          ["C", "D", 2]
        ],
        start: "A",
        target: null,
        directed: true
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.disconnected-target",
      label: "Disconnected target",
      description:
        "Keep the requested target unreachable so path replay and validation can exercise the no-route outcome explicitly.",
      scenario: "no-route",
      kind: "curated",
      domain: "graph",
      algorithms: pathfindingGraphAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        nodes: ["A", "B", "C", "D", "E", "F"],
        edges: [
          ["A", "B", 2],
          ["B", "C", 3],
          ["C", "D", 2],
          ["E", "F", 1]
        ],
        start: "A",
        target: "F",
        directed: false
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.weighted-detour",
      label: "Weighted detour",
      description:
        "Favor a cheaper multi-hop route over the obvious direct path so frontier churn stays visible in replay traces.",
      scenario: "weighted-detour",
      kind: "curated",
      domain: "graph",
      algorithms: pathfindingGraphAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        nodes: ["A", "B", "C", "D", "E", "F"],
        edges: [
          ["A", "B", 1],
          ["B", "F", 20],
          ["A", "C", 4],
          ["C", "D", 2],
          ["D", "E", 2],
          ["E", "F", 2],
          ["B", "D", 6],
          ["C", "F", 12]
        ],
        start: "A",
        target: "F",
        directed: false
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-clone",
      label: "Reference clone graph",
      description:
        "Use one connected graph with a shared neighbor so replay shows clone allocation, clone-link commits, and a fully covered component ledger.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: cloneGraphAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultCloneGraphInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.disconnected-clone",
      label: "Disconnected clone component",
      description:
        "Leave one component unreachable from the entry node so replay can publish both the cloned component and the untouched nodes.",
      scenario: "disconnected",
      kind: "curated",
      domain: "graph",
      algorithms: cloneGraphAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        nodes: ["A", "B", "C", "D", "E", "F"],
        edges: [
          ["A", "B", 1],
          ["A", "C", 1],
          ["B", "D", 1],
          ["C", "D", 1],
          ["E", "F", 1]
        ],
        start: "A",
        target: null,
        directed: false
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-tree",
      label: "Reference valid tree",
      description:
        "Use a branching acyclic graph so replay shows deterministic Union-Find merges and one final connected component.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: treeValidationAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultGraphValidTreeInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-components",
      label: "Reference components",
      description:
        "Use two multi-node groups plus one isolated node so replay shows deterministic Union-Find merges and an explicit terminal component ledger.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: countConnectedComponentsAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultCountConnectedComponentsInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-redundant",
      label: "Reference redundant edge",
      description:
        "Use one early cycle-closing edge so replay can publish the first redundant connection in deterministic input order.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: redundantConnectionAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultRedundantConnectionInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.late-redundant",
      label: "Late redundant edge",
      description:
        "Delay the cycle until the last edge so replay preserves a longer accepted forest before the redundant connection locks.",
      scenario: "late-cycle",
      kind: "curated",
      domain: "graph",
      algorithms: redundantConnectionAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        nodeCount: 5,
        edges: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
          [0, 4]
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.cycle-closing-tree",
      label: "Cycle-closing graph",
      description:
        "Close one early cycle and leave a second component isolated so replay can publish both the rejected edge and the remaining disconnected components.",
      scenario: "cycle",
      kind: "curated",
      domain: "graph",
      algorithms: treeValidationAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        nodeCount: 5,
        edges: [
          [0, 1],
          [1, 2],
          [2, 0],
          [3, 4]
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.cycle-components",
      label: "Cycle inside one component",
      description:
        "Leave one component cyclic and a second component separate so replay can publish both the no-op cycle edges and the final connected-component total.",
      scenario: "cycle",
      kind: "curated",
      domain: "graph",
      algorithms: countConnectedComponentsAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        nodeCount: 5,
        edges: [
          [0, 1],
          [1, 2],
          [2, 0],
          [3, 4]
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-schedule",
      label: "Reference course schedule",
      description:
        "Layer prerequisite chains and one converging dependency so deterministic queue ordering and committed topological order stay readable in replay.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: courseScheduleAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultCourseScheduleInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.blocked-cycle",
      label: "Blocked prerequisite cycle",
      description:
        "Leave one dependency cycle unresolved so the runtime can publish the blocked course set after the zero-indegree queue empties.",
      scenario: "cycle",
      kind: "curated",
      domain: "graph",
      algorithms: courseScheduleAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        courseCount: 5,
        prerequisites: [
          [1, 0],
          [2, 1],
          [3, 2],
          [1, 3],
          [4, 2]
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-oranges",
      label: "Reference orchard",
      description:
        "Use the canonical infection grid so replay shows minute-based spread, queued rotten cells, and the final fully rotten orchard.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: rottingOrangesAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultRottingOrangesInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.isolated-fresh",
      label: "Isolated fresh orange",
      description:
        "Trap one fresh orange behind empty cells so the BFS wave stalls and the terminal frame can publish the unreachable cell explicitly.",
      scenario: "stalled-fresh",
      kind: "curated",
      domain: "graph",
      algorithms: rottingOrangesAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        grid: [
          [2, 1, 1],
          [0, 1, 1],
          [1, 0, 1]
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-islands",
      label: "Reference islands",
      description:
        "Use the canonical archipelago grid so replay shows row-major scan checkpoints, connected-component expansion, and the final island count.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: numberOfIslandsAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultNumberOfIslandsInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.diagonal-islands",
      label: "Diagonal archipelago",
      description:
        "Separate land cells diagonally so replay can show that only four-directional adjacency merges cells into the same island.",
      scenario: "diagonal",
      kind: "curated",
      domain: "graph",
      algorithms: numberOfIslandsAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        grid: [
          ["1", "0", "1"],
          ["0", "1", "0"],
          ["1", "0", "1"]
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-max-area",
      label: "Reference max-area island",
      description:
        "Use a flood-fill grid with one plus-shaped island that overtakes the area ledger before a smaller trailing component closes.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: maxAreaOfIslandAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultMaxAreaOfIslandInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.diagonal-single-cells",
      label: "Diagonal single cells",
      description:
        "Separate every land cell diagonally so replay can show the largest-island ledger staying pinned at area 1 under four-directional adjacency.",
      scenario: "diagonal",
      kind: "curated",
      domain: "graph",
      algorithms: maxAreaOfIslandAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        grid: [
          ["1", "0", "1"],
          ["0", "1", "0"],
          ["1", "0", "1"]
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-perimeter",
      label: "Reference perimeter",
      description:
        "Use the canonical cross-shaped island so replay can show row-major land scans, exposed-edge checkpoints, and the terminal coastline ledger.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: islandPerimeterAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultIslandPerimeterInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.single-cell-perimeter",
      label: "Single cell perimeter",
      description:
        "Reduce the island to one land cell so replay can show all four perimeter contributions coming from one row-major inspection.",
      scenario: "single-cell",
      kind: "curated",
      domain: "graph",
      algorithms: islandPerimeterAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        grid: [["1"]]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-flow",
      label: "Reference dual-ocean flow",
      description:
        "Use the canonical heights grid so replay shows Pacific and Atlantic border seeding, uphill reverse-flow reachability, and the final dual-ocean intersection.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: pacificAtlanticAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultPacificAtlanticWaterFlowInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.interior-sink",
      label: "Interior sink basin",
      description:
        "Trap one low cell inside a high ring so replay can show that edge cells still reach both oceans while the interior sink never joins either ocean frontier.",
      scenario: "interior-sink",
      kind: "curated",
      domain: "graph",
      algorithms: pacificAtlanticAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        grid: [
          [10, 10, 10],
          [10, 1, 10],
          [10, 10, 10]
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-bridge",
      label: "Reference shortest bridge",
      description:
        "Use a two-island grid with one clear shortest connection so replay shows first-island marking before the outward bridge waves touch the second island.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: shortestBridgeAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultShortestBridgeInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.single-gap-bridge",
      label: "Single-gap bridge",
      description:
        "Keep the islands one water cell apart so replay can show the bridge BFS resolving on its first outward wave.",
      scenario: "single-gap",
      kind: "curated",
      domain: "graph",
      algorithms: shortestBridgeAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        grid: [
          [1, 1, 0],
          [0, 0, 0],
          [0, 1, 1]
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-binary-path",
      label: "Reference binary path",
      description:
        "Use a blocked-grid route that still admits one clean diagonal-leaning BFS path so replay can separate blocked inspections, queue growth, and explicit traceback.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: shortestPathBinaryMatrixAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultShortestPathBinaryMatrixInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.sealed-binary-exit",
      label: "Sealed binary exit",
      description:
        "Box the destination behind blocked cells so replay can show the BFS frontier exhausting every reachable open cell before publishing an unreachable result.",
      scenario: "sealed-target",
      kind: "curated",
      domain: "graph",
      algorithms: shortestPathBinaryMatrixAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        grid: [
          [0, 0, 0, 0],
          [1, 1, 1, 0],
          [0, 0, 1, 1],
          [0, 1, 1, 0]
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-zero-matrix",
      label: "Reference 01 matrix",
      description:
        "Use the canonical nearest-zero grid so replay shows multi-source zero seeding, deterministic distance fills, and the farthest resolved 1 cell.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: zeroOneMatrixAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultZeroOneMatrixInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.no-zero-matrix",
      label: "No-zero matrix",
      description:
        "Remove every zero source so replay can publish the unresolved 1-cell ledger immediately instead of filling any nearest-zero distances.",
      scenario: "missing-source",
      kind: "curated",
      domain: "graph",
      algorithms: zeroOneMatrixAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        grid: [
          [1, 1, 1],
          [1, 1, 1],
          [1, 1, 1]
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-shoreline",
      label: "Reference shoreline",
      description:
        "Use the canonical shoreline grid so replay shows multi-source land seeding, deterministic water-distance fills, and the farthest water cell.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: asFarFromLandAsPossibleAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultAsFarFromLandAsPossibleInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.ocean-only",
      label: "Ocean-only grid",
      description:
        "Remove every land source so replay can publish the full unresolved water ledger and the immediate -1 shoreline answer.",
      scenario: "missing-source",
      kind: "curated",
      domain: "graph",
      algorithms: asFarFromLandAsPossibleAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        grid: [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0]
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-highest-peak",
      label: "Reference highest peak",
      description:
        "Use the canonical height map where one water source fans heights outward and the corner plateau ties for the highest assigned peak.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: mapOfHighestPeakAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultMapOfHighestPeakInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.all-water-plateau",
      label: "All-water plateau",
      description:
        "Fill the grid with water so replay can publish the immediate zero-height plateau without any land-height expansion.",
      scenario: "water-only",
      kind: "curated",
      domain: "graph",
      algorithms: mapOfHighestPeakAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        grid: [
          [1, 1],
          [1, 1]
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-capture",
      label: "Reference capture grid",
      description:
        "Use the canonical enclosed-region grid so replay shows border-safe discovery first and then deterministic row-major capture flips.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: surroundedRegionsAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultSurroundedRegionsInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.border-safe",
      label: "Border-safe region",
      description:
        "Keep every O connected to the border so replay can publish a full safe-region ledger without flipping any enclosed cells.",
      scenario: "no-capture",
      kind: "curated",
      domain: "graph",
      algorithms: surroundedRegionsAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        grid: [
          ["O", "O", "X", "X"],
          ["X", "O", "X", "O"],
          ["X", "O", "O", "O"],
          ["X", "X", "X", "O"]
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-gates",
      label: "Reference gates",
      description:
        "Use the canonical rooms map so replay shows multi-source gate seeding, room-distance updates, and the farthest resolved room.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: wallsAndGatesAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultWallsAndGatesInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.isolated-rooms",
      label: "Isolated rooms",
      description:
        "Trap a small room cluster behind walls so replay can publish the remaining infinity rooms once the gate frontier stalls.",
      scenario: "isolated",
      kind: "curated",
      domain: "graph",
      algorithms: wallsAndGatesAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        grid: [
          [wallsAndGatesInfinity, -1, 0, wallsAndGatesInfinity],
          [wallsAndGatesInfinity, -1, wallsAndGatesInfinity, -1],
          [wallsAndGatesInfinity, -1, -1, -1],
          [0, -1, wallsAndGatesInfinity, wallsAndGatesInfinity]
        ]
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.random-network",
      label: "Seeded random network",
      description:
        "Generate a deterministic weighted network with a guaranteed start-to-target path for pathfinding comparisons.",
      scenario: "random",
      kind: "generated",
      domain: "graph",
      algorithms: pathfindingGraphAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: true,
      defaultSeed: 29,
      defaultOptions: {
        nodes: 6,
        extraEdges: 4,
        directed: false
      }
    },
    resolve: (request) => {
      const seed = request.seed ?? 29;

      return {
        input: createRandomGraph(seed, request.options ?? {}),
        seed,
        options: {
          ...(request.options ?? {})
        }
      };
    }
  }
];

const presetDefinitionsById = new Map(
  presetDefinitions.map((preset) => [preset.summary.id, preset])
);

export class TraceDeckInputCatalog {
  listPresets(query: InputPresetListQuery = {}): InputPresetSummary[] {
    return presetDefinitions
      .map((preset) => preset.summary)
      .filter((preset) => {
        if (query.domain && preset.domain !== query.domain) {
          return false;
        }

        if (
          query.algorithmId &&
          !preset.algorithms.some((algorithm) => algorithm.id === query.algorithmId)
        ) {
          return false;
        }

        return true;
      })
      .map(clonePresetSummary);
  }

  getPreset(presetId: string): InputPresetSummary {
    const preset = presetDefinitionsById.get(presetId);

    if (!preset) {
      throw new HttpError(404, `Input preset "${presetId}" was not found.`);
    }

    return clonePresetSummary(preset.summary);
  }

  resolvePreset(
    presetId: string,
    request: ResolveInputPresetInput
  ): ResolvedInputPreset {
    const preset = presetDefinitionsById.get(presetId);

    if (!preset) {
      throw new HttpError(404, `Input preset "${presetId}" was not found.`);
    }

    const algorithm = supportedAlgorithms[request.algorithmId];

    if (!algorithm) {
      throw new HttpError(400, `Algorithm "${request.algorithmId}" is not supported.`);
    }

    if (!preset.summary.algorithms.some((entry) => entry.id === request.algorithmId)) {
      throw new HttpError(
        400,
        `Preset "${presetId}" does not support algorithm "${request.algorithmId}".`
      );
    }

    if (!preset.summary.supportsSeed && request.seed !== undefined) {
      throw new HttpError(400, `Preset "${presetId}" does not accept a seed.`);
    }

    const resolved = preset.resolve(request);
    const normalized = normalizeAlgorithmInput(request.algorithmId, resolved.input);

    return {
      source: "preset",
      preset: clonePresetSummary(preset.summary),
      algorithm: cloneAlgorithmDescriptor(algorithm),
      input: normalized.input,
      normalizedInputText: normalized.normalizedInputText,
      footprint: normalized.footprint,
      ...(resolved.seed !== undefined ? { seed: resolved.seed } : {}),
      options: {
        ...resolved.options
      }
    };
  }

  validateCustomInput(request: ValidateCustomInputInput): ValidatedCustomInput {
    const algorithm = supportedAlgorithms[request.algorithmId];

    if (!algorithm) {
      throw new HttpError(400, `Algorithm "${request.algorithmId}" is not supported.`);
    }

    const normalized = normalizeAlgorithmInput(request.algorithmId, request.payload);

    return {
      source: "custom",
      algorithm: cloneAlgorithmDescriptor(algorithm),
      input: normalized.input,
      normalizedInputText: normalized.normalizedInputText,
      footprint: normalized.footprint
    };
  }
}

export function getSupportedAlgorithmDescriptor(
  algorithmId: SupportedAlgorithmId
): SupportedAlgorithmDescriptor {
  const algorithm = supportedAlgorithms[algorithmId];

  if (!algorithm) {
    throw new HttpError(400, `Algorithm "${algorithmId}" is not supported.`);
  }

  return cloneAlgorithmDescriptor(algorithm);
}

export function getSupportedAlgorithmsByDomain(domain: AlgorithmDomain) {
  return Object.values(supportedAlgorithms)
    .filter((algorithm) => algorithm.domain === domain)
    .map(cloneAlgorithmDescriptor);
}
