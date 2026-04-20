import {
  createTraceEnvelope,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "../../../packages/trace-core/src/schema";

export type AccentTone = "ember" | "teal";

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
  domain: "sorting";
};

export type GraphAlgorithm = ReplayAlgorithmBase & {
  domain: "graph";
};

export type ReplayAlgorithm = SortingAlgorithm | GraphAlgorithm;

export type GraphInput = {
  nodes: string[];
  edges: Array<[string, string, number]>;
  start: string;
  target: string | null;
  directed: boolean;
};

export type SortingReplayState = {
  array: number[];
  activeIndices: number[];
  swapPair: number[];
  sortedIndices: number[];
};

export type GraphReplayState = {
  distances: Record<string, number | null>;
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  path: string[];
};

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

export type ReplayRun = SortingRun | GraphRun;

type SortingMetrics = {
  comparisons: number;
  swaps: number;
  passes: number;
};

type GraphMetrics = {
  settled: number;
  frontier: number;
  relaxations: number;
};

const sortingMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "comparisons",
    label: "Comparisons",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "swaps",
    label: "Swaps",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "passes",
    label: "Passes",
    unit: "count",
    direction: "lower-is-better"
  }
];

const graphMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "settled",
    label: "Settled",
    unit: "count",
    direction: "higher-is-better"
  },
  {
    key: "frontier",
    label: "Frontier",
    unit: "count",
    direction: "neutral"
  },
  {
    key: "relaxations",
    label: "Relaxations",
    unit: "count",
    direction: "lower-is-better"
  }
];

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

function normalizeEdge(edge: unknown): [string, string, number] {
  if (!Array.isArray(edge) || edge.length < 3) {
    throw new Error('Each graph edge must look like ["A", "B", 4].');
  }

  const [from, to, weight] = edge;
  if (typeof from !== "string" || typeof to !== "string") {
    throw new Error("Graph edge endpoints must be strings.");
  }

  const normalizedWeight = Number(weight);
  if (!Number.isFinite(normalizedWeight) || normalizedWeight <= 0) {
    throw new Error("Graph edge weights must be positive numbers.");
  }

  return [from, to, normalizedWeight];
}

function parseGraphInput(inputText: string): GraphInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(inputText);
  } catch {
    throw new Error("Graph input must be valid JSON.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Graph input must be an object with nodes, edges, start, and target.");
  }

  const candidate = parsed as {
    nodes?: unknown;
    edges?: unknown;
    start?: unknown;
    target?: unknown;
    directed?: unknown;
  };

  if (!Array.isArray(candidate.nodes) || candidate.nodes.length < 2) {
    throw new Error("Graph input must include a nodes array with at least two entries.");
  }

  if (!Array.isArray(candidate.edges) || candidate.edges.length === 0) {
    throw new Error("Graph input must include at least one weighted edge.");
  }

  const nodes = Array.from(new Set(candidate.nodes.map((node) => String(node))));
  const edges = candidate.edges.map(normalizeEdge);
  const start = String(candidate.start);
  const target = candidate.target === null || candidate.target === undefined ? null : String(candidate.target);

  if (!nodes.includes(start)) {
    throw new Error("The graph start node must exist in the nodes array.");
  }

  if (target && !nodes.includes(target)) {
    throw new Error("The graph target node must exist in the nodes array.");
  }

  return {
    nodes,
    edges,
    start,
    target,
    directed: Boolean(candidate.directed)
  };
}

function serializeGraphInput(graph: GraphInput): string {
  return JSON.stringify(
    {
      nodes: graph.nodes,
      edges: graph.edges,
      start: graph.start,
      target: graph.target,
      directed: graph.directed
    },
    null,
    2
  );
}

export const algorithms: ReplayAlgorithm[] = [
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    badge: "Sorting",
    accent: "ember",
    description: "Adjacent swaps with explicit pass checkpoints and deterministic timeline scrubbing.",
    inputLabel: "Array Input",
    inputHint: "Comma-separated integers",
    defaultInput: "18, 7, 12, 3, 15, 4, 11",
    domain: "sorting"
  },
  {
    id: "dijkstra",
    name: "Dijkstra",
    badge: "Graph",
    accent: "teal",
    description: "Weighted shortest-path playback with visible frontier churn and route recovery.",
    inputLabel: "Graph Input",
    inputHint: "JSON with nodes, edges, start, and target",
    defaultInput: JSON.stringify(
      {
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
      },
      null,
      2
    ),
    domain: "graph"
  }
];

export function getAlgorithmById(algorithmId: string): ReplayAlgorithm {
  return algorithms.find((algorithm) => algorithm.id === algorithmId) ?? algorithms[0];
}

function buildBubbleSortTrace(numbers: number[]): TraceEnvelope<SortingReplayState> {
  const values = numbers.slice();
  const steps: TraceEnvelope<SortingReplayState>["steps"] = [];
  const metrics: SortingMetrics = {
    comparisons: 0,
    swaps: 0,
    passes: 0
  };

  function pushStep(
    phase: string,
    description: string,
    state: SortingReplayState,
    changedPaths: string[],
    highlights: string[]
  ) {
    steps.push({
      index: steps.length,
      phase,
      description,
      changedPaths,
      highlights,
      metrics: {
        comparisons: metrics.comparisons,
        swaps: metrics.swaps,
        passes: metrics.passes
      },
      state: {
        array: state.array.slice(),
        activeIndices: state.activeIndices.slice(),
        swapPair: state.swapPair.slice(),
        sortedIndices: state.sortedIndices.slice()
      }
    });
  }

  pushStep(
    "Initialization",
    "Replay begins from the seeded array snapshot. Every timeline jump restores directly from the recorded frame payload.",
    {
      array: values.slice(),
      activeIndices: [],
      swapPair: [],
      sortedIndices: []
    },
    ["state.array"],
    ["Loaded the editor input into the replay buffer.", "Prepared the first deterministic checkpoint."]
  );

  for (let boundary = values.length - 1; boundary > 0; boundary -= 1) {
    let swappedThisPass = false;

    for (let index = 0; index < boundary; index += 1) {
      metrics.comparisons += 1;
      const activeIndices = [index, index + 1];
      const sortedIndices = Array.from(
        { length: values.length - boundary - 1 },
        (_, offset) => values.length - 1 - offset
      );

      pushStep(
        "Compare",
        values[index] > values[index + 1]
          ? `Values ${values[index]} and ${values[index + 1]} are out of order, so the shell schedules a swap.`
          : `Values ${values[index]} and ${values[index + 1]} are already ordered, so replay advances without mutating the array.`,
        {
          array: values.slice(),
          activeIndices,
          swapPair: [],
          sortedIndices
        },
        ["state.activeIndices", "metrics.comparisons"],
        [
          `Inspected indices ${index} and ${index + 1}.`,
          values[index] > values[index + 1] ? "Swap path is active for this frame." : "No mutation is required for this frame."
        ]
      );

      if (values[index] > values[index + 1]) {
        [values[index], values[index + 1]] = [values[index + 1], values[index]];
        metrics.swaps += 1;
        swappedThisPass = true;

        pushStep(
          "Swap",
          "The post-swap snapshot is recorded immediately so scrubbing to this frame never depends on incremental playback.",
          {
            array: values.slice(),
            activeIndices,
            swapPair: activeIndices,
            sortedIndices
          },
          ["state.array", "metrics.swaps"],
          [`Swapped indices ${index} and ${index + 1}.`, "Updated the lane ordering and swap counter."]
        );
      }
    }

    metrics.passes += 1;
    const sortedIndices = Array.from(
      { length: values.length - boundary },
      (_, offset) => values.length - 1 - offset
    );

    pushStep(
      "Checkpoint",
      `Pass ${metrics.passes} seals lane ${boundary}. Timeline jumps can land here without replaying earlier comparisons.`,
      {
        array: values.slice(),
        activeIndices: [boundary],
        swapPair: [],
        sortedIndices
      },
      ["state.sortedIndices", "metrics.passes"],
      [`Pass ${metrics.passes} is now locked.`, "Published a deterministic checkpoint for the scrubber."]
    );

    if (!swappedThisPass) {
      pushStep(
        "Optimization",
        "No swaps occurred in the latest pass, so the shell exits early with the array already sorted.",
        {
          array: values.slice(),
          activeIndices: [],
          swapPair: [],
          sortedIndices: Array.from({ length: values.length }, (_, index) => index)
        },
        ["state.sortedIndices"],
        ["Detected a stable pass.", "Closed the run without additional comparisons."]
      );
      break;
    }
  }

  pushStep(
    "Done",
    "The final checkpoint marks the array as fully sorted and ready for comparison or saved-run handoff.",
    {
      array: values.slice(),
      activeIndices: [],
      swapPair: [],
      sortedIndices: Array.from({ length: values.length }, (_, index) => index)
    },
    ["state.sortedIndices"],
    ["Marked every lane as sorted.", "Published final metrics to the inspector cards."]
  );

  return createTraceEnvelope({
    algorithm: {
      id: "bubble-sort",
      label: "Bubble Sort",
      domain: "sorting",
      implementationVersion: "seeded-local-0.1.0"
    },
    input: numbers,
    steps,
    metricDefinitions: sortingMetricDefinitions,
    comparisonMetricKeys: ["comparisons", "swaps", "passes"]
  });
}

function buildAdjacency(graph: GraphInput): Map<string, Array<{ to: string; weight: number }>> {
  const adjacency = new Map(graph.nodes.map((node) => [node, [] as Array<{ to: string; weight: number }>]));

  for (const [from, to, weight] of graph.edges) {
    adjacency.get(from)?.push({ to, weight });
    if (!graph.directed) {
      adjacency.get(to)?.push({ to: from, weight });
    }
  }

  return adjacency;
}

function serializeDistances(
  nodes: string[],
  distances: Record<string, number>
): Record<string, number | null> {
  return Object.fromEntries(
    nodes.map((node) => [node, Number.isFinite(distances[node]) ? distances[node] : null])
  );
}

function reconstructPath(
  previousByNode: Record<string, string>,
  start: string,
  target: string | null
): string[] {
  if (!target) {
    return [];
  }

  if (target === start) {
    return [start];
  }

  if (!(target in previousByNode)) {
    return [];
  }

  const path = [target];
  let cursor = target;

  while (cursor !== start) {
    cursor = previousByNode[cursor];
    if (!cursor) {
      return [];
    }
    path.unshift(cursor);
  }

  return path;
}

function buildDijkstraTrace(graph: GraphInput): TraceEnvelope<GraphReplayState> {
  const adjacency = buildAdjacency(graph);
  const distances = Object.fromEntries(
    graph.nodes.map((node) => [node, Number.POSITIVE_INFINITY])
  ) as Record<string, number>;
  const previousByNode: Record<string, string> = {};
  const frontier = new Set<string>([graph.start]);
  const settled = new Set<string>();
  const steps: TraceEnvelope<GraphReplayState>["steps"] = [];
  const metrics: GraphMetrics = {
    settled: 0,
    frontier: 1,
    relaxations: 0
  };

  distances[graph.start] = 0;

  function orderedFrontier(): string[] {
    return Array.from(frontier).sort(
      (left, right) => distances[left] - distances[right] || left.localeCompare(right)
    );
  }

  function pushStep(
    phase: string,
    description: string,
    current: string | null,
    activeEdge: string[],
    path: string[],
    changedPaths: string[],
    highlights: string[]
  ) {
    metrics.frontier = frontier.size;
    metrics.settled = settled.size;

    steps.push({
      index: steps.length,
      phase,
      description,
      changedPaths,
      highlights,
      metrics: {
        settled: metrics.settled,
        frontier: metrics.frontier,
        relaxations: metrics.relaxations
      },
      state: {
        distances: serializeDistances(graph.nodes, distances),
        settled: Array.from(settled),
        frontier: orderedFrontier(),
        current,
        activeEdge: activeEdge.slice(),
        path: path.slice()
      }
    });
  }

  pushStep(
    "Initialization",
    "The graph replay starts with the source node in the frontier and every other distance unresolved.",
    graph.start,
    [],
    [],
    ["state.frontier", "state.distances"],
    ["Initialized the frontier with the source node.", "Captured the baseline distance table."]
  );

  while (frontier.size > 0) {
    const current = orderedFrontier()[0]!;
    frontier.delete(current);

    pushStep(
      "Extract",
      `Node ${current} has the smallest tentative distance and becomes the active focus.`,
      current,
      [],
      reconstructPath(previousByNode, graph.start, current),
      ["state.current", "state.frontier"],
      [`Removed ${current} from the frontier.`, "Pinned the active node for inspection."]
    );

    for (const edge of adjacency.get(current) ?? []) {
      if (settled.has(edge.to)) {
        continue;
      }

      metrics.relaxations += 1;
      const candidateDistance = distances[current] + edge.weight;
      const hasImproved = candidateDistance < distances[edge.to];

      if (hasImproved) {
        distances[edge.to] = candidateDistance;
        previousByNode[edge.to] = current;
        frontier.add(edge.to);
      }

      pushStep(
        hasImproved ? "Relax" : "Inspect",
        hasImproved
          ? `Distance to ${edge.to} improves to ${candidateDistance}; the node is promoted into the frontier.`
          : `The candidate distance ${candidateDistance} does not beat the current best route to ${edge.to}.`,
        current,
        [current, edge.to],
        reconstructPath(previousByNode, graph.start, hasImproved ? edge.to : current),
        hasImproved
          ? ["state.distances", "state.frontier", "metrics.relaxations"]
          : ["metrics.relaxations"],
        [
          `Traversed edge ${current} -> ${edge.to} with weight ${edge.weight}.`,
          hasImproved
            ? `Updated ${edge.to} to ${candidateDistance}.`
            : `Kept ${edge.to} at ${formatDistanceValue(serializeDistances(graph.nodes, distances)[edge.to])}.`
        ]
      );
    }

    settled.add(current);

    pushStep(
      "Checkpoint",
      `Node ${current} is now final. The scrubber can jump here without replaying frontier decisions.`,
      current,
      [],
      reconstructPath(previousByNode, graph.start, current),
      ["state.settled"],
      [`Locked ${current} into the settled set.`, "Published the latest frontier and distance snapshot."]
    );
  }

  const finalPath = reconstructPath(previousByNode, graph.start, graph.target);

  pushStep(
    finalPath.length > 0 ? "Resolution" : "No Route",
    finalPath.length > 0
      ? `Recovered the shortest path ${finalPath.join(" -> ")}.`
      : `No route reaches ${graph.target ?? "the requested target"}; the replay ends with the best-known frontier exhausted.`,
    graph.target,
    [],
    finalPath,
    ["state.path"],
    [
      finalPath.length > 0 ? "Highlighted the recovered shortest path." : "Left the path overlay empty.",
      "Published the terminal route summary."
    ]
  );

  return createTraceEnvelope({
    algorithm: {
      id: "dijkstra",
      label: "Dijkstra",
      domain: "graph",
      implementationVersion: "seeded-local-0.1.0"
    },
    input: graph,
    steps,
    metricDefinitions: graphMetricDefinitions,
    comparisonMetricKeys: ["settled", "relaxations"]
  });
}

function formatDistanceValue(distance: number | null): string {
  return distance === null ? "inf" : String(distance);
}

export function formatDistance(distance: number | null): string {
  return formatDistanceValue(distance);
}

export function buildRun(algorithmId: string, inputText: string): ReplayRun {
  const algorithm = getAlgorithmById(algorithmId);

  if (algorithm.domain === "sorting") {
    const input = parseSortingInput(inputText);
    return {
      algorithm,
      input,
      normalizedInputText: serializeSortingInput(input),
      trace: buildBubbleSortTrace(input)
    };
  }

  const input = parseGraphInput(inputText);
  return {
    algorithm,
    input,
    normalizedInputText: serializeGraphInput(input),
    trace: buildDijkstraTrace(input)
  };
}
