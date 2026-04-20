import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type GraphAlgorithmId = "bfs" | "dijkstra";

export const graphAlgorithmIds: GraphAlgorithmId[] = ["bfs", "dijkstra"];

export interface GraphInput extends JsonObject {
  nodes: string[];
  edges: Array<[string, string, number]>;
  start: string;
  target: string | null;
  directed: boolean;
}

export interface GraphExecutionState extends JsonObject {
  distances: Record<string, number | null>;
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  path: string[];
}

interface GraphMetricState {
  settled: number;
  frontier: number;
  inspections: number;
  updates: number;
}

interface GraphAlgorithmDefinition {
  id: GraphAlgorithmId;
  label: string;
  implementationVersion: string;
}

interface GraphEdge {
  to: string;
  weight: number;
}

interface GraphRuntimeStateBase {
  distances: Record<string, number>;
  settled: Set<string>;
  current: string | null;
  activeEdge: string[];
  path: string[];
}

interface BreadthFirstSearchRuntimeState extends GraphRuntimeStateBase {
  frontier: string[];
}

interface DijkstraRuntimeState extends GraphRuntimeStateBase {
  frontier: Set<string>;
}

const graphAlgorithmDefinitions: Record<GraphAlgorithmId, GraphAlgorithmDefinition> = {
  bfs: {
    id: "bfs",
    label: "Breadth-First Search",
    implementationVersion: "graph-engine-0.1.0"
  },
  dijkstra: {
    id: "dijkstra",
    label: "Dijkstra",
    implementationVersion: "graph-engine-0.1.0"
  }
};

export const graphMetricDefinitions: TraceMetricDefinition[] = [
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
    key: "inspections",
    label: "Edge inspections",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "updates",
    label: "Route updates",
    unit: "count",
    direction: "lower-is-better"
  }
];

export const defaultBreadthFirstSearchInput: GraphInput = {
  nodes: ["A", "B", "C", "D", "E", "F"],
  edges: [
    ["A", "B", 1],
    ["A", "C", 1],
    ["B", "D", 1],
    ["B", "E", 1],
    ["C", "F", 1],
    ["E", "F", 1]
  ],
  start: "A",
  target: "F",
  directed: false
};

export const defaultDijkstraInput: GraphInput = {
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

function cloneGraphState(state: GraphExecutionState): GraphExecutionState {
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

function projectGraphMetrics(metrics: GraphMetricState): Record<string, number> {
  return {
    settled: metrics.settled,
    frontier: metrics.frontier,
    inspections: metrics.inspections,
    updates: metrics.updates
  };
}

function normalizeNode(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }

  return value.trim();
}

function normalizeEdge(edge: unknown, index: number): [string, string, number] {
  if (!Array.isArray(edge) || edge.length !== 3) {
    throw new Error(`edges[${index}] must contain [from, to, weight] tuples.`);
  }

  const from = normalizeNode(edge[0], `edges[${index}][0]`);
  const to = normalizeNode(edge[1], `edges[${index}][1]`);
  const weight = Number(edge[2]);

  if (!Number.isFinite(weight) || weight <= 0) {
    throw new Error(`edges[${index}][2] must be a positive finite number.`);
  }

  return [from, to, weight];
}

function normalizeParsedGraph(candidate: unknown): GraphInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Graph input must be an object with nodes, edges, start, and target.");
  }

  const value = candidate as {
    nodes?: unknown;
    edges?: unknown;
    start?: unknown;
    target?: unknown;
    directed?: unknown;
  };

  if (!Array.isArray(value.nodes) || value.nodes.length < 2) {
    throw new Error("Graph input must include a nodes array with at least two entries.");
  }

  if (!Array.isArray(value.edges) || value.edges.length === 0) {
    throw new Error("Graph input must include at least one weighted edge.");
  }

  const nodes = Array.from(
    new Set(value.nodes.map((node, index) => normalizeNode(node, `nodes[${index}]`)))
  );
  const edges = value.edges.map((edge, index) => normalizeEdge(edge, index));
  const start = normalizeNode(value.start, "start");
  const target =
    value.target === null || value.target === undefined
      ? null
      : normalizeNode(value.target, "target");

  if (!nodes.includes(start)) {
    throw new Error("The graph start node must exist in the nodes array.");
  }

  if (target !== null && !nodes.includes(target)) {
    throw new Error("The graph target node must exist in the nodes array.");
  }

  for (const [from, to] of edges) {
    if (!nodes.includes(from) || !nodes.includes(to)) {
      throw new Error("Every graph edge endpoint must exist in nodes.");
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

export function parseGraphInputText(inputText: string): GraphInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(inputText);
  } catch {
    throw new Error("Graph input must be valid JSON.");
  }

  return normalizeParsedGraph(parsed);
}

export function normalizeGraphInput(input: unknown): GraphInput {
  return normalizeParsedGraph(input);
}

export function serializeGraphInput(graph: GraphInput): string {
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

function buildAdjacency(graph: GraphInput): Map<string, GraphEdge[]> {
  const adjacency = new Map(graph.nodes.map((node) => [node, [] as GraphEdge[]]));

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
    nodes.map((node) => [node, Number.isFinite(distances[node]!) ? distances[node]! : null])
  );
}

function reconstructPath(
  previousByNode: Record<string, string>,
  start: string,
  target: string | null
): string[] {
  if (target === null) {
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

function createBreadthFirstSearchRecorder(graph: GraphInput) {
  return createTraceRecorder<
    BreadthFirstSearchRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "bfs",
    projectState(runtimeState) {
      return cloneGraphState({
        distances: serializeDistances(graph.nodes, runtimeState.distances),
        settled: Array.from(runtimeState.settled),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        path: runtimeState.path.slice()
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function orderWeightedFrontier(
  frontier: ReadonlySet<string>,
  distances: Record<string, number>
): string[] {
  return Array.from(frontier).sort(
    (left, right) =>
      (distances[left] ?? Number.POSITIVE_INFINITY) -
        (distances[right] ?? Number.POSITIVE_INFINITY) || left.localeCompare(right)
  );
}

function createDijkstraRecorder(graph: GraphInput) {
  return createTraceRecorder<DijkstraRuntimeState, GraphExecutionState, GraphMetricState>({
    algorithmId: "dijkstra",
    projectState(runtimeState) {
      return cloneGraphState({
        distances: serializeDistances(graph.nodes, runtimeState.distances),
        settled: Array.from(runtimeState.settled),
        frontier: orderWeightedFrontier(runtimeState.frontier, runtimeState.distances),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        path: runtimeState.path.slice()
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function buildGraphEnvelope(
  definition: GraphAlgorithmDefinition,
  input: GraphInput,
  recorder:
    | ReturnType<typeof createBreadthFirstSearchRecorder>
    | ReturnType<typeof createDijkstraRecorder>
): TraceEnvelope<GraphExecutionState> {
  return createTraceEnvelope({
    algorithm: {
      id: definition.id,
      label: definition.label,
      domain: "graph",
      implementationVersion: definition.implementationVersion
    },
    input,
    steps: recorder.getSteps(),
    metricDefinitions: graphMetricDefinitions,
    comparisonMetricKeys: ["settled", "inspections", "updates"]
  });
}

function describeTraversalOutcome(graph: GraphInput, finalPath: string[]) {
  if (graph.target === null) {
    return {
      phase: "Traversal Complete",
      description:
        "The traversal exhausted its reachable frontier without a requested target, so the terminal frame publishes the final search state.",
      explanation: {
        summary: "Publish the terminal traversal snapshot when no explicit route target is requested.",
        details:
          "Replay clients can still restore the final frontier, settled set, and distance table from one deterministic frame.",
        tags: ["result", "traversal"]
      },
      label: "Traversal finished"
    };
  }

  if (finalPath.length > 0) {
    return {
      phase: "Resolution",
      description: `Recovered the path ${finalPath.join(" -> ")}.`,
      explanation: {
        summary: "Publish the recovered route for the requested target.",
        details:
          "Because every predecessor update is already captured in earlier steps, the terminal path overlay restores directly from recorded state.",
        tags: ["result", "path"]
      },
      label: `Recovered ${finalPath.join(" -> ")}`
    };
  }

  return {
    phase: "No Route",
    description: `No route reaches ${graph.target}; the replay ends with the frontier exhausted.`,
    explanation: {
      summary: "Publish the exhausted search state with no route to the requested target.",
      details:
        "The trace still stores the terminal state so replay never needs to re-run the traversal to explain the failure.",
      tags: ["result", "path"]
    },
    label: "No route recovered"
  };
}

function syncMetrics(
  metrics: GraphMetricState,
  runtimeState: Pick<GraphExecutionState, "settled" | "frontier">
): void {
  metrics.settled = runtimeState.settled.length;
  metrics.frontier = runtimeState.frontier.length;
}

export function buildBreadthFirstSearchTrace(
  graph: GraphInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions.bfs;
  const normalizedGraph = normalizeGraphInput(graph);
  const adjacency = buildAdjacency(normalizedGraph);
  const distances = Object.fromEntries(
    normalizedGraph.nodes.map((node) => [node, Number.POSITIVE_INFINITY])
  ) as Record<string, number>;
  const previousByNode: Record<string, string> = {};
  const frontier: string[] = [normalizedGraph.start];
  const enqueued = new Set<string>([normalizedGraph.start]);
  const settled = new Set<string>();
  const recorder = createBreadthFirstSearchRecorder(normalizedGraph);
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: 1,
    inspections: 0,
    updates: 0
  };

  distances[normalizedGraph.start] = 0;

  const createRuntimeState = (
    current: string | null,
    activeEdge: string[],
    path: string[]
  ): BreadthFirstSearchRuntimeState => ({
    distances,
    settled,
    frontier,
    current,
    activeEdge,
    path
  });

  recorder.push({
    phase: "Initialization",
    description:
      "The traversal begins with the source node at depth zero and the frontier queue seeded with that single checkpoint.",
    explanation: {
      summary: "Seed the traversal queue with the source node before any edges are inspected.",
      details:
        "The first replay frame captures the baseline distance table so later scrubs never depend on rebuilding queue state.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(normalizedGraph.start, [], []),
    metrics,
    highlights: [
      {
        key: "bfs-start-node",
        path: `state.distances.${normalizedGraph.start}`,
        kind: "node",
        intent: "focus",
        label: `Source node ${normalizedGraph.start}`
      }
    ]
  });

  while (frontier.length > 0) {
    const current = frontier.shift()!;
    enqueued.delete(current);
    syncMetrics(metrics, {
      settled: Array.from(settled),
      frontier: frontier.slice()
    });

    recorder.push({
      phase: "Extract",
      description: `Node ${current} is dequeued from the frontier and becomes the active expansion point.`,
      explanation: {
        summary: "Expand the oldest queued node to preserve breadth-first ordering.",
        details:
          "The recorded frontier order is stable, so replay and backend consumers see the same queue progression.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(
        current,
        [],
        reconstructPath(previousByNode, normalizedGraph.start, current)
      ),
      metrics,
      highlights: [
        {
          key: `bfs-current-${current}`,
          path: `state.distances.${current}`,
          kind: "node",
          intent: "active",
          label: `Expand node ${current}`
        }
      ]
    });

    for (const edge of adjacency.get(current) ?? []) {
      metrics.inspections += 1;
      const previousDistance = distances[edge.to] ?? Number.POSITIVE_INFINITY;
      const hasDiscovered = !Number.isFinite(previousDistance);

      if (hasDiscovered) {
        distances[edge.to] = distances[current]! + 1;
        previousByNode[edge.to] = current;

        if (!enqueued.has(edge.to) && !settled.has(edge.to)) {
          frontier.push(edge.to);
          enqueued.add(edge.to);
        }

        metrics.updates += 1;
      }

      syncMetrics(metrics, {
        settled: Array.from(settled),
        frontier: frontier.slice()
      });

      recorder.push({
        phase: hasDiscovered ? "Discover" : "Inspect",
        description: hasDiscovered
          ? `Node ${edge.to} is discovered at depth ${distances[edge.to]} and appended to the frontier queue.`
          : `Node ${edge.to} was already discovered at depth ${formatGraphDistance(
              Number.isFinite(previousDistance) ? previousDistance : null
            )}, so the existing queue order stays intact.`,
        explanation: {
          summary: hasDiscovered
            ? "Record the first route to an undiscovered neighbor and append it to the queue."
            : "Inspect the edge without changing the previously recorded breadth-first route.",
          details: hasDiscovered
            ? `Breadth-first traversal commits the first discovered route to ${edge.to}, making that predecessor chain stable for replay.`
            : `Because ${edge.to} already has a recorded depth, this edge cannot improve the breadth-first route.`,
          tags: ["edge", hasDiscovered ? "frontier" : "focus"]
        },
        runtimeState: createRuntimeState(
          current,
          [current, edge.to],
          reconstructPath(
            previousByNode,
            normalizedGraph.start,
            hasDiscovered ? edge.to : current
          )
        ),
        metrics,
        highlights: [
          {
            key: `bfs-edge-${current}-${edge.to}-${metrics.inspections}`,
            path: "state.activeEdge",
            kind: "edge",
            intent: hasDiscovered ? "frontier" : "focus",
            label: `${current} -> ${edge.to}`
          }
        ]
      });
    }

    settled.add(current);
    syncMetrics(metrics, {
      settled: Array.from(settled),
      frontier: frontier.slice()
    });

    recorder.push({
      phase: "Checkpoint",
      description:
        `Node ${current} has finished expanding, so replay can jump here without re-running earlier queue operations.`,
      explanation: {
        summary: "Seal the expanded node into the settled set after its outgoing edges are inspected.",
        details:
          "This checkpoint captures both the settled set and the live queue, which keeps replay deterministic even across sparse graphs.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(
        current,
        [],
        reconstructPath(previousByNode, normalizedGraph.start, current)
      ),
      metrics,
      highlights: [
        {
          key: `bfs-settled-${current}`,
          path: "state.settled",
          kind: "node",
          intent: "visited",
          label: `Settled ${current}`
        }
      ]
    });

    if (normalizedGraph.target !== null && current === normalizedGraph.target) {
      break;
    }
  }

  const finalPath = reconstructPath(previousByNode, normalizedGraph.start, normalizedGraph.target);
  const outcome = describeTraversalOutcome(normalizedGraph, finalPath);
  syncMetrics(metrics, {
    settled: Array.from(settled),
    frontier: frontier.slice()
  });

  recorder.push({
    phase: outcome.phase,
    description: outcome.description,
    explanation: outcome.explanation,
    runtimeState: createRuntimeState(normalizedGraph.target, [], finalPath),
    metrics,
    highlights: [
      {
        key: "bfs-final-path",
        path: "state.path",
        kind: "path",
        intent: "result",
        label: outcome.label
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

  return buildGraphEnvelope(definition, normalizedGraph, recorder);
}

export function buildDijkstraTrace(
  graph: GraphInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions.dijkstra;
  const normalizedGraph = normalizeGraphInput(graph);
  const adjacency = buildAdjacency(normalizedGraph);
  const distances = Object.fromEntries(
    normalizedGraph.nodes.map((node) => [node, Number.POSITIVE_INFINITY])
  ) as Record<string, number>;
  const previousByNode: Record<string, string> = {};
  const frontier = new Set<string>([normalizedGraph.start]);
  const settled = new Set<string>();
  const recorder = createDijkstraRecorder(normalizedGraph);
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: 1,
    inspections: 0,
    updates: 0
  };

  distances[normalizedGraph.start] = 0;

  const createRuntimeState = (
    current: string | null,
    activeEdge: string[],
    path: string[]
  ): DijkstraRuntimeState => ({
    distances,
    settled,
    frontier,
    current,
    activeEdge,
    path
  });

  recorder.push({
    phase: "Initialization",
    description:
      "The weighted search begins with the source node in the frontier and every other distance unresolved.",
    explanation: {
      summary: "Seed the frontier with the source node and initialize all other distances to infinity.",
      details:
        "This baseline frame makes the weighted shortest-path search replay-safe before any relaxations occur.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(normalizedGraph.start, [], []),
    metrics,
    highlights: [
      {
        key: "dijkstra-start-node",
        path: `state.distances.${normalizedGraph.start}`,
        kind: "node",
        intent: "focus",
        label: `Source node ${normalizedGraph.start}`
      }
    ]
  });

  while (frontier.size > 0) {
    const current = orderWeightedFrontier(frontier, distances)[0]!;
    frontier.delete(current);
    syncMetrics(metrics, {
      settled: Array.from(settled),
      frontier: orderWeightedFrontier(frontier, distances)
    });

    recorder.push({
      phase: "Extract",
      description: `Node ${current} has the lightest tentative distance and becomes the next relaxation source.`,
      explanation: {
        summary: "Extract the frontier node with the smallest recorded distance.",
        details:
          "The frontier ordering is deterministic: shortest tentative distance first, then node label as a stable tie-breaker.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(
        current,
        [],
        reconstructPath(previousByNode, normalizedGraph.start, current)
      ),
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

      metrics.inspections += 1;
      const candidateDistance = distances[current]! + edge.weight;
      const previousDistance = distances[edge.to] ?? Number.POSITIVE_INFINITY;
      const hasImproved = candidateDistance < previousDistance;

      if (hasImproved) {
        distances[edge.to] = candidateDistance;
        previousByNode[edge.to] = current;
        frontier.add(edge.to);
        metrics.updates += 1;
      }

      syncMetrics(metrics, {
        settled: Array.from(settled),
        frontier: orderWeightedFrontier(frontier, distances)
      });

      recorder.push({
        phase: hasImproved ? "Relax" : "Inspect",
        description: hasImproved
          ? `Distance to ${edge.to} improves to ${candidateDistance}; the node is promoted into the weighted frontier.`
          : `The candidate distance ${candidateDistance} does not beat the current best route to ${edge.to}.`,
        explanation: {
          summary: hasImproved
            ? "Record the shorter weighted route and refresh the frontier ordering."
            : "Inspect the weighted edge without changing the best-known route.",
          details: hasImproved
            ? `The predecessor chain for ${edge.to} now flows through ${current}.`
            : `The best recorded distance to ${edge.to} remains ${formatGraphDistance(
                Number.isFinite(previousDistance) ? previousDistance : null
              )}.`,
          tags: ["edge", hasImproved ? "candidate" : "focus"]
        },
        runtimeState: createRuntimeState(
          current,
          [current, edge.to],
          reconstructPath(
            previousByNode,
            normalizedGraph.start,
            hasImproved ? edge.to : current
          )
        ),
        metrics,
        highlights: [
          {
            key: `dijkstra-edge-${current}-${edge.to}-${metrics.inspections}`,
            path: "state.activeEdge",
            kind: "edge",
            intent: hasImproved ? "candidate" : "focus",
            label: `${current} -> ${edge.to} (${edge.weight})`
          }
        ]
      });
    }

    settled.add(current);
    syncMetrics(metrics, {
      settled: Array.from(settled),
      frontier: orderWeightedFrontier(frontier, distances)
    });

    recorder.push({
      phase: "Checkpoint",
      description:
        `Node ${current} is now settled, so replay can jump here without re-running earlier frontier decisions.`,
      explanation: {
        summary: "Seal the extracted node into the settled set once its weighted distance is final.",
        details:
          "In Dijkstra's algorithm, a settled node keeps its shortest-path distance for the remainder of the run.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(
        current,
        [],
        reconstructPath(previousByNode, normalizedGraph.start, current)
      ),
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

    if (normalizedGraph.target !== null && current === normalizedGraph.target) {
      break;
    }
  }

  const finalPath = reconstructPath(previousByNode, normalizedGraph.start, normalizedGraph.target);
  const outcome = describeTraversalOutcome(normalizedGraph, finalPath);
  syncMetrics(metrics, {
    settled: Array.from(settled),
    frontier: orderWeightedFrontier(frontier, distances)
  });

  recorder.push({
    phase: outcome.phase,
    description: outcome.description,
    explanation: outcome.explanation,
    runtimeState: createRuntimeState(normalizedGraph.target, [], finalPath),
    metrics,
    highlights: [
      {
        key: "dijkstra-final-path",
        path: "state.path",
        kind: "path",
        intent: "result",
        label: outcome.label
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

  return buildGraphEnvelope(definition, normalizedGraph, recorder);
}

export function buildGraphTrace(
  algorithmId: GraphAlgorithmId,
  graph: GraphInput
): TraceEnvelope<GraphExecutionState> {
  return algorithmId === "bfs"
    ? buildBreadthFirstSearchTrace(graph)
    : buildDijkstraTrace(graph);
}

export function formatGraphDistance(distance: number | null): string {
  return distance === null ? "inf" : String(distance);
}
