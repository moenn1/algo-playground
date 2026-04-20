import {
  buildGraphTrace,
  buildSearchTrace,
  buildSortingTrace,
  defaultBreadthFirstSearchInput,
  defaultBinarySearchInput,
  defaultDijkstraInput,
  formatGraphDistance,
  parseGraphInputText,
  parseSearchInputText,
  serializeGraphInput,
  serializeSearchInput,
  type GraphAlgorithmId,
  type GraphExecutionState,
  type GraphInput,
  type SearchAlgorithmId,
  type SearchExecutionState,
  type SearchInput,
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

export type ReplayAlgorithm = SortingAlgorithm | GraphAlgorithm | SearchAlgorithm;

export type SortingReplayState = SortingExecutionState;
export type GraphReplayState = GraphExecutionState;
export type SearchReplayState = SearchExecutionState;

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

export type ReplayRun = SortingRun | GraphRun | SearchRun;

function isSearchRun(run: ReplayRun): run is SearchRun {
  return run.algorithm.domain === "search";
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
    const input = parseSearchInputText(inputText);
    return buildSearchRunFromInput(algorithm, input);
  }

  const input = parseGraphInputText(inputText);
  return buildGraphRunFromInput(algorithm, input);
}

export function describeInputFootprint(run: ReplayRun): string {
  if (Array.isArray(run.input)) {
    return `${run.input.length} lanes`;
  }

  if (isSearchRun(run)) {
    return `${run.input.array.length} lanes / target ${run.input.target}`;
  }

  return `${run.input.nodes.length} nodes / ${run.input.edges.length} edges`;
}

export function getTraceStepPaths<State extends JsonObject>(
  step: TraceStep<State> | TraceStep
): string[] {
  return Array.from(new Set(step.changes.map((change) => change.path)));
}
