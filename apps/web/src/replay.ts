import {
  buildSortingTrace,
  type SortingAlgorithmId,
  type SortingExecutionState
} from "@tracedeck/execution-engine";
import {
  createTraceRecorder,
  createTraceEnvelope,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition,
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

export type SortingReplayState = SortingExecutionState;

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

type GraphMetrics = {
  settled: number;
  frontier: number;
  relaxations: number;
};

type DijkstraRuntimeState = {
  distances: Record<string, number>;
  settled: Set<string>;
  frontier: Set<string>;
  current: string | null;
  activeEdge: string[];
  path: string[];
};

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
  const target =
    candidate.target === null || candidate.target === undefined
      ? null
      : String(candidate.target);

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
    id: "dijkstra",
    name: "Dijkstra",
    badge: "Graph",
    accent: "teal",
    description:
      "Weighted shortest-path playback with visible frontier churn and route recovery.",
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

function cloneGraphState(state: GraphReplayState): GraphReplayState {
  return {
    distances: {
      ...state.distances
    },
    settled: state.settled.slice(),
    frontier: state.frontier.slice(),
    current: state.current,
    activeEdge: state.activeEdge.slice(),
    path: state.path.slice()
  };
}

function createGraphMetrics(metrics: GraphMetrics): Record<string, number> {
  return {
    settled: metrics.settled,
    frontier: metrics.frontier,
    relaxations: metrics.relaxations
  };
}

function orderedFrontier(
  frontier: ReadonlySet<string>,
  distances: Record<string, number>
): string[] {
  return Array.from(frontier).sort(
    (left, right) =>
      (distances[left] ?? Number.POSITIVE_INFINITY) -
        (distances[right] ?? Number.POSITIVE_INFINITY) || left.localeCompare(right)
  );
}

function syncGraphMetrics(
  metrics: GraphMetrics,
  runtimeState: Pick<DijkstraRuntimeState, "frontier" | "settled">
) {
  metrics.frontier = runtimeState.frontier.size;
  metrics.settled = runtimeState.settled.size;
}

function createGraphRecorder(graph: GraphInput) {
  return createTraceRecorder<DijkstraRuntimeState, GraphReplayState, GraphMetrics>({
    algorithmId: "dijkstra",
    projectState(runtimeState) {
      return cloneGraphState({
        distances: serializeDistances(graph.nodes, runtimeState.distances),
        settled: Array.from(runtimeState.settled),
        frontier: orderedFrontier(runtimeState.frontier, runtimeState.distances),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        path: runtimeState.path.slice()
      });
    },
    projectMetrics: createGraphMetrics
  });
}

function buildAdjacency(graph: GraphInput): Map<string, Array<{ to: string; weight: number }>> {
  const adjacency = new Map(
    graph.nodes.map((node) => [node, [] as Array<{ to: string; weight: number }>])
  );

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
    nodes.map((node) => {
      const distance = distances[node];
      return [node, Number.isFinite(distance) ? distance : null];
    })
  ) as Record<string, number | null>;
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
    const previousNode = previousByNode[cursor];
    if (!previousNode) {
      return [];
    }
    cursor = previousNode;
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
  const recorder = createGraphRecorder(graph);
  const metrics: GraphMetrics = {
    settled: 0,
    frontier: 1,
    relaxations: 0
  };

  distances[graph.start] = 0;
  syncGraphMetrics(metrics, {
    frontier,
    settled
  });

  recorder.push({
    phase: "Initialization",
    description:
      "The graph replay starts with the source node in the frontier and every other distance unresolved.",
    explanation: {
      summary: "Seed the frontier with the source node and initialize every other distance to infinity.",
      details:
        "This first checkpoint gives the replay shell a full distance table before any edge inspections happen.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: {
      distances,
      settled,
      frontier,
      current: graph.start,
      activeEdge: [],
      path: []
    },
    metrics,
    highlights: [
      {
        key: "dijkstra-start-node",
        path: `state.distances.${graph.start}`,
        kind: "node",
        intent: "focus",
        label: `Source node ${graph.start}`
      }
    ]
  });

  while (frontier.size > 0) {
    const current = orderedFrontier(frontier, distances)[0]!;
    frontier.delete(current);
    syncGraphMetrics(metrics, {
      frontier,
      settled
    });

    recorder.push({
      phase: "Extract",
      description: `Node ${current} has the smallest tentative distance and becomes the active focus.`,
      explanation: {
        summary: "Extract the lightest frontier node as the next relaxation source.",
        details:
          "Dijkstra always expands the frontier node with the smallest tentative distance.",
        tags: ["frontier", "focus"]
      },
      runtimeState: {
        distances,
        settled,
        frontier,
        current,
        activeEdge: [],
        path: reconstructPath(previousByNode, graph.start, current)
      },
      metrics,
      highlights: [
        {
          key: `dijkstra-current-${current}`,
          path: `state.distances.${current}`,
          kind: "node",
          intent: "active",
          label: `Expand node ${current}`
        }
      ]
    });

    for (const edge of adjacency.get(current) ?? []) {
      if (settled.has(edge.to)) {
        continue;
      }

      metrics.relaxations += 1;
      const currentDistance = distances[current] ?? Number.POSITIVE_INFINITY;
      const previousDistance = distances[edge.to] ?? Number.POSITIVE_INFINITY;
      const candidateDistance = currentDistance + edge.weight;
      const hasImproved = candidateDistance < previousDistance;

      if (hasImproved) {
        distances[edge.to] = candidateDistance;
        previousByNode[edge.to] = current;
        frontier.add(edge.to);
      }

      syncGraphMetrics(metrics, {
        frontier,
        settled
      });

      recorder.push({
        phase: hasImproved ? "Relax" : "Inspect",
        description: hasImproved
          ? `Distance to ${edge.to} improves to ${candidateDistance}; the node is promoted into the frontier.`
          : `The candidate distance ${candidateDistance} does not beat the current best route to ${edge.to}.`,
        explanation: {
          summary: hasImproved
            ? "Record an improved route and push the target node into the frontier."
            : "Inspect the edge without changing the best-known route.",
          details: hasImproved
            ? `The path through ${current} is shorter than the previous route to ${edge.to}.`
            : `The best-known route to ${edge.to} remains ${formatDistanceValue(
                Number.isFinite(previousDistance) ? previousDistance : null
              )}.`,
          tags: ["edge", hasImproved ? "candidate" : "focus"]
        },
        runtimeState: {
          distances,
          settled,
          frontier,
          current,
          activeEdge: [current, edge.to],
          path: reconstructPath(previousByNode, graph.start, hasImproved ? edge.to : current)
        },
        metrics,
        highlights: [
          {
            key: `dijkstra-edge-${current}-${edge.to}-${metrics.relaxations}`,
            path: "state.activeEdge",
            kind: "edge",
            intent: hasImproved ? "candidate" : "focus",
            label: `${current} -> ${edge.to} (${edge.weight})`
          }
        ]
      });
    }

    settled.add(current);
    syncGraphMetrics(metrics, {
      frontier,
      settled
    });

    recorder.push({
      phase: "Checkpoint",
      description:
        `Node ${current} is now final. The scrubber can jump here without replaying frontier decisions.`,
      explanation: {
        summary: "Seal the current node into the settled set.",
        details:
          "Once settled, the node's shortest-path distance is final for the rest of the run.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: {
        distances,
        settled,
        frontier,
        current,
        activeEdge: [],
        path: reconstructPath(previousByNode, graph.start, current)
      },
      metrics,
      highlights: [
        {
          key: `dijkstra-settled-${current}`,
          path: "state.settled",
          kind: "node",
          intent: "visited",
          label: `Settled ${current}`
        }
      ]
    });
  }

  const finalPath = reconstructPath(previousByNode, graph.start, graph.target);
  syncGraphMetrics(metrics, {
    frontier,
    settled
  });

  recorder.push({
    phase: finalPath.length > 0 ? "Resolution" : "No Route",
    description:
      finalPath.length > 0
        ? `Recovered the shortest path ${finalPath.join(" -> ")}.`
        : `No route reaches ${graph.target ?? "the requested target"}; the replay ends with the best-known frontier exhausted.`,
    explanation: {
      summary:
        finalPath.length > 0
          ? "Publish the final shortest path for side-panel inspection."
          : "Publish the exhausted search state with no route to the requested target.",
      details:
        finalPath.length > 0
          ? "The route overlay is now stable because every required predecessor is already final."
          : "The shell still records the terminal frontier state so saved runs can restore the failed search directly.",
      tags: ["result", "path"]
    },
    runtimeState: {
      distances,
      settled,
      frontier,
      current: graph.target,
      activeEdge: [],
      path: finalPath
    },
    metrics,
    highlights: [
      {
        key: "dijkstra-final-path",
        path: "state.path",
        kind: "path",
        intent: "result",
        label:
          finalPath.length > 0 ? `Shortest path ${finalPath.join(" -> ")}` : "No route recovered"
      }
    ],
    additionalChanges: [
      {
        path: "state.path",
        op: "set",
        nextValue: finalPath
      }
    ]
  });

  return createTraceEnvelope({
    algorithm: {
      id: "dijkstra",
      label: "Dijkstra",
      domain: "graph",
      implementationVersion: "seeded-local-0.2.0"
    },
    input: graph,
    steps: recorder.getSteps(),
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
    trace: buildDijkstraTrace(graph)
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

  const input = parseGraphInput(inputText);
  return buildGraphRunFromInput(algorithm, input);
}

export function describeInputFootprint(run: ReplayRun): string {
  if (Array.isArray(run.input)) {
    return `${run.input.length} lanes`;
  }

  return `${run.input.nodes.length} nodes / ${run.input.edges.length} edges`;
}

export function getTraceStepPaths<State extends JsonObject>(
  step: TraceStep<State> | TraceStep
): string[] {
  return Array.from(new Set(step.changes.map((change) => change.path)));
}
