import {
  createTraceEnvelope,
  type JsonObject,
  type TraceChange,
  type TraceEnvelope,
  type TraceHighlight,
  type TraceMetricDefinition,
  type TraceStep
} from "./schema.js";

export type GraphAlgorithmId = "bfs" | "dijkstra";

export interface GraphInput extends JsonObject {
  nodes: string[];
  edges: Array<[string, string, number]>;
  start: string;
  target: string | null;
  directed: boolean;
}

export interface GraphReplayState extends JsonObject {
  distances: Record<string, number | null>;
  visited: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  path: string[];
}

interface GraphMetrics {
  visited: number;
  frontier: number;
  inspections: number;
  updates: number;
}

interface GraphEdge {
  to: string;
  weight: number;
}

const graphMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "visited",
    label: "Visited",
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

function createStepKey(algorithmId: GraphAlgorithmId, phase: string, index: number): string {
  return `${algorithmId}-${index.toString().padStart(3, "0")}-${phase
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

function cloneGraphState(state: GraphReplayState): GraphReplayState {
  return {
    distances: {
      ...state.distances
    },
    visited: state.visited.slice(),
    frontier: state.frontier.slice(),
    current: state.current,
    activeEdge: state.activeEdge.slice(),
    path: state.path.slice()
  };
}

function createGraphMetrics(metrics: GraphMetrics): Record<string, number> {
  return {
    visited: metrics.visited,
    frontier: metrics.frontier,
    inspections: metrics.inspections,
    updates: metrics.updates
  };
}

function pushGraphStep(
  steps: TraceStep<GraphReplayState>[],
  algorithmId: GraphAlgorithmId,
  metrics: GraphMetrics,
  phase: string,
  description: string,
  explanation: {
    summary: string;
    details?: string;
    tags?: string[];
  },
  state: GraphReplayState,
  changes: TraceChange[],
  highlights: TraceHighlight[]
): void {
  const index = steps.length;

  steps.push({
    index,
    key: createStepKey(algorithmId, phase, index),
    phase,
    description,
    explanation,
    state: cloneGraphState(state),
    changes,
    highlights,
    metrics: createGraphMetrics(metrics)
  });
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

function describeTraversalOutcome(graph: GraphInput, finalPath: string[]): {
  phase: string;
  description: string;
  explanation: {
    summary: string;
    details?: string;
    tags?: string[];
  };
  label: string;
} {
  if (graph.target === null) {
    return {
      phase: "Traversal Complete",
      description:
        "The traversal exhausted its reachable frontier without a requested target, so the terminal frame publishes the final search state.",
      explanation: {
        summary: "Publish the terminal traversal snapshot when no explicit route target is requested.",
        details:
          "Replay clients can still restore the final frontier, visited set, and distance table from one deterministic frame.",
        tags: ["result", "traversal"]
      },
      label: "Traversal finished"
    };
  }

  if (finalPath.length > 0) {
    return {
      phase: "Resolution",
      description: `Recovered the shortest path ${finalPath.join(" -> ")}.`,
      explanation: {
        summary: "Publish the recovered route for the requested target.",
        details:
          "Because each predecessor update is already captured in prior steps, the terminal path overlay restores directly from the recorded state.",
        tags: ["result", "path"]
      },
      label: `Shortest path ${finalPath.join(" -> ")}`
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

function pushFinalGraphStep(
  steps: TraceStep<GraphReplayState>[],
  algorithmId: GraphAlgorithmId,
  graph: GraphInput,
  metrics: GraphMetrics,
  currentState: (current: string | null, activeEdge: string[], path: string[]) => GraphReplayState,
  previousByNode: Record<string, string>
): void {
  const finalPath = reconstructPath(previousByNode, graph.start, graph.target);
  const outcome = describeTraversalOutcome(graph, finalPath);

  pushGraphStep(
    steps,
    algorithmId,
    metrics,
    outcome.phase,
    outcome.description,
    outcome.explanation,
    currentState(graph.target, [], finalPath),
    [
      {
        path: "state.path",
        op: "set",
        nextValue: finalPath
      }
    ],
    [
      {
        key: `${algorithmId}-final-path`,
        path: "state.path",
        kind: "path",
        intent: "result",
        label: outcome.label
      }
    ]
  );
}

export function buildBreadthFirstSearchTrace(
  graph: GraphInput
): TraceEnvelope<GraphReplayState> {
  const normalizedGraph = normalizeGraphInput(graph);
  const adjacency = buildAdjacency(normalizedGraph);
  const distances = Object.fromEntries(
    normalizedGraph.nodes.map((node) => [node, Number.POSITIVE_INFINITY])
  ) as Record<string, number>;
  const previousByNode: Record<string, string> = {};
  const frontier: string[] = [normalizedGraph.start];
  const queued = new Set<string>([normalizedGraph.start]);
  const visited = new Set<string>();
  const steps: TraceStep<GraphReplayState>[] = [];
  const metrics: GraphMetrics = {
    visited: 0,
    frontier: 1,
    inspections: 0,
    updates: 0
  };

  distances[normalizedGraph.start] = 0;

  function currentState(
    current: string | null,
    activeEdge: string[],
    path: string[]
  ): GraphReplayState {
    metrics.frontier = frontier.length;
    metrics.visited = visited.size;

    return {
      distances: serializeDistances(normalizedGraph.nodes, distances),
      visited: Array.from(visited),
      frontier: frontier.slice(),
      current,
      activeEdge: activeEdge.slice(),
      path: path.slice()
    };
  }

  pushGraphStep(
    steps,
    "bfs",
    metrics,
    "Initialization",
    "The traversal begins with the source node at depth zero and the frontier queue seeded with that single checkpoint.",
    {
      summary: "Seed the traversal queue with the source node before any edges are inspected.",
      details:
        "The first replay frame captures the baseline distance table so later scrubs never depend on rebuilding queue state.",
      tags: ["snapshot", "frontier"]
    },
    currentState(normalizedGraph.start, [], []),
    [
      {
        path: "state.frontier",
        op: "set",
        nextValue: [normalizedGraph.start]
      },
      {
        path: "state.distances",
        op: "set",
        nextValue: serializeDistances(normalizedGraph.nodes, distances)
      }
    ],
    [
      {
        key: "bfs-start-node",
        path: `state.distances.${normalizedGraph.start}`,
        kind: "node",
        intent: "focus",
        label: `Source node ${normalizedGraph.start}`
      }
    ]
  );

  while (frontier.length > 0) {
    const current = frontier.shift()!;
    queued.delete(current);

    pushGraphStep(
      steps,
      "bfs",
      metrics,
      "Extract",
      `Node ${current} is dequeued from the frontier and becomes the active expansion point.`,
      {
        summary: "Expand the oldest queued node to preserve breadth-first ordering.",
        details:
          "The recorded frontier order is stable, so replay and backend consumers see the same queue progression.",
        tags: ["frontier", "focus"]
      },
      currentState(current, [], reconstructPath(previousByNode, normalizedGraph.start, current)),
      [
        {
          path: "state.current",
          op: "set",
          nextValue: current
        },
        {
          path: "state.frontier",
          op: "set",
          nextValue: frontier.slice()
        }
      ],
      [
        {
          key: `bfs-current-${current}`,
          path: `state.distances.${current}`,
          kind: "node",
          intent: "active",
          label: `Expand node ${current}`
        }
      ]
    );

    for (const edge of adjacency.get(current) ?? []) {
      metrics.inspections += 1;
      const previousDistance = distances[edge.to];
      const hasDiscovered = !Number.isFinite(previousDistance);

      if (hasDiscovered) {
        distances[edge.to] = distances[current]! + 1;
        previousByNode[edge.to] = current;
        frontier.push(edge.to);
        queued.add(edge.to);
        metrics.updates += 1;
      }

      pushGraphStep(
        steps,
        "bfs",
        metrics,
        hasDiscovered ? "Discover" : "Inspect",
        hasDiscovered
          ? `Node ${edge.to} is discovered at depth ${distances[edge.to]} and appended to the frontier queue.`
          : `Node ${edge.to} was already discovered at depth ${previousDistance}, so the existing queue order stays intact.`,
        {
          summary: hasDiscovered
            ? "Record the first route to an undiscovered neighbor and append it to the queue."
            : "Inspect the edge without changing the previously recorded breadth-first route.",
          details: hasDiscovered
            ? `Breadth-first traversal commits the first discovered route to ${edge.to}, making that predecessor chain stable for replay.`
            : `Because ${edge.to} already has a recorded depth, this edge cannot improve the breadth-first route.`,
          tags: ["edge", hasDiscovered ? "frontier" : "focus"]
        },
        currentState(
          current,
          [current, edge.to],
          reconstructPath(
            previousByNode,
            normalizedGraph.start,
            hasDiscovered ? edge.to : current
          )
        ),
        [
          {
            path: "state.activeEdge",
            op: "set",
            nextValue: [current, edge.to]
          },
          {
            path: "metrics.inspections",
            op: "set",
            nextValue: metrics.inspections
          },
          ...(hasDiscovered
            ? [
                {
                  path: `state.distances.${edge.to}`,
                  op: "set" as const,
                  previousValue: null,
                  nextValue: distances[edge.to]!
                },
                {
                  path: "state.frontier",
                  op: "set" as const,
                  nextValue: frontier.slice()
                },
                {
                  path: "metrics.updates",
                  op: "set" as const,
                  nextValue: metrics.updates
                }
              ]
            : [])
        ],
        [
          {
            key: `bfs-edge-${current}-${edge.to}-${steps.length}`,
            path: "state.activeEdge",
            kind: "edge",
            intent: hasDiscovered ? "frontier" : "focus",
            label: `${current} -> ${edge.to}`
          }
        ]
      );
    }

    visited.add(current);

    pushGraphStep(
      steps,
      "bfs",
      metrics,
      "Checkpoint",
      `Node ${current} has finished expanding, so replay can jump here without re-running earlier queue operations.`,
      {
        summary: "Seal the expanded node into the visited set after its outgoing edges are inspected.",
        details:
          "This checkpoint captures both the visited set and the live queue, which keeps replay deterministic even across sparse graphs.",
        tags: ["checkpoint", "visited"]
      },
      currentState(current, [], reconstructPath(previousByNode, normalizedGraph.start, current)),
      [
        {
          path: "state.visited",
          op: "set",
          nextValue: Array.from(visited)
        }
      ],
      [
        {
          key: `bfs-visited-${current}`,
          path: "state.visited",
          kind: "node",
          intent: "visited",
          label: `Visited ${current}`
        }
      ]
    );

    if (normalizedGraph.target !== null && current === normalizedGraph.target) {
      break;
    }
  }

  pushFinalGraphStep(
    steps,
    "bfs",
    normalizedGraph,
    metrics,
    currentState,
    previousByNode
  );

  return createTraceEnvelope({
    algorithm: {
      id: "bfs",
      label: "Breadth-First Search",
      domain: "graph",
      implementationVersion: "graph-engine-0.1.0"
    },
    input: normalizedGraph,
    steps,
    metricDefinitions: graphMetricDefinitions,
    comparisonMetricKeys: ["visited", "inspections", "updates"]
  });
}

export function buildDijkstraTrace(graph: GraphInput): TraceEnvelope<GraphReplayState> {
  const normalizedGraph = normalizeGraphInput(graph);
  const adjacency = buildAdjacency(normalizedGraph);
  const distances = Object.fromEntries(
    normalizedGraph.nodes.map((node) => [node, Number.POSITIVE_INFINITY])
  ) as Record<string, number>;
  const previousByNode: Record<string, string> = {};
  const frontier = new Set<string>([normalizedGraph.start]);
  const visited = new Set<string>();
  const steps: TraceStep<GraphReplayState>[] = [];
  const metrics: GraphMetrics = {
    visited: 0,
    frontier: 1,
    inspections: 0,
    updates: 0
  };

  distances[normalizedGraph.start] = 0;

  function orderedFrontier(): string[] {
    return Array.from(frontier).sort(
      (left, right) => distances[left]! - distances[right]! || left.localeCompare(right)
    );
  }

  function currentState(
    current: string | null,
    activeEdge: string[],
    path: string[]
  ): GraphReplayState {
    metrics.frontier = frontier.size;
    metrics.visited = visited.size;

    return {
      distances: serializeDistances(normalizedGraph.nodes, distances),
      visited: Array.from(visited),
      frontier: orderedFrontier(),
      current,
      activeEdge: activeEdge.slice(),
      path: path.slice()
    };
  }

  pushGraphStep(
    steps,
    "dijkstra",
    metrics,
    "Initialization",
    "The weighted search begins with the source node in the frontier and every other distance unresolved.",
    {
      summary: "Seed the frontier with the source node and initialize all other distances to infinity.",
      details:
        "This baseline frame makes the weighted shortest-path search replay-safe before any relaxations occur.",
      tags: ["snapshot", "frontier"]
    },
    currentState(normalizedGraph.start, [], []),
    [
      {
        path: "state.frontier",
        op: "set",
        nextValue: [normalizedGraph.start]
      },
      {
        path: "state.distances",
        op: "set",
        nextValue: serializeDistances(normalizedGraph.nodes, distances)
      }
    ],
    [
      {
        key: "dijkstra-start-node",
        path: `state.distances.${normalizedGraph.start}`,
        kind: "node",
        intent: "focus",
        label: `Source node ${normalizedGraph.start}`
      }
    ]
  );

  while (frontier.size > 0) {
    const current = orderedFrontier()[0]!;
    frontier.delete(current);

    pushGraphStep(
      steps,
      "dijkstra",
      metrics,
      "Extract",
      `Node ${current} has the lightest tentative distance and becomes the next relaxation source.`,
      {
        summary: "Extract the frontier node with the smallest recorded distance.",
        details:
          "The frontier ordering is deterministic: shortest tentative distance first, then node label as a stable tie-breaker.",
        tags: ["frontier", "focus"]
      },
      currentState(current, [], reconstructPath(previousByNode, normalizedGraph.start, current)),
      [
        {
          path: "state.current",
          op: "set",
          nextValue: current
        },
        {
          path: "state.frontier",
          op: "set",
          nextValue: orderedFrontier()
        }
      ],
      [
        {
          key: `dijkstra-current-${current}`,
          path: `state.distances.${current}`,
          kind: "node",
          intent: "active",
          label: `Expand node ${current}`
        }
      ]
    );

    for (const edge of adjacency.get(current) ?? []) {
      if (visited.has(edge.to)) {
        continue;
      }

      metrics.inspections += 1;
      const candidateDistance = distances[current]! + edge.weight;
      const previousDistance = distances[edge.to]!;
      const hasImproved = candidateDistance < previousDistance;

      if (hasImproved) {
        distances[edge.to] = candidateDistance;
        previousByNode[edge.to] = current;
        frontier.add(edge.to);
        metrics.updates += 1;
      }

      pushGraphStep(
        steps,
        "dijkstra",
        metrics,
        hasImproved ? "Relax" : "Inspect",
        hasImproved
          ? `Distance to ${edge.to} improves to ${candidateDistance}; the node is promoted into the weighted frontier.`
          : `The candidate distance ${candidateDistance} does not beat the current best route to ${edge.to}.`,
        {
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
        currentState(
          current,
          [current, edge.to],
          reconstructPath(
            previousByNode,
            normalizedGraph.start,
            hasImproved ? edge.to : current
          )
        ),
        [
          {
            path: "state.activeEdge",
            op: "set",
            nextValue: [current, edge.to]
          },
          {
            path: "metrics.inspections",
            op: "set",
            nextValue: metrics.inspections
          },
          ...(hasImproved
            ? [
                {
                  path: `state.distances.${edge.to}`,
                  op: "set" as const,
                  previousValue: Number.isFinite(previousDistance)
                    ? previousDistance
                    : null,
                  nextValue: candidateDistance
                },
                {
                  path: "state.frontier",
                  op: "set" as const,
                  nextValue: orderedFrontier()
                },
                {
                  path: "metrics.updates",
                  op: "set" as const,
                  nextValue: metrics.updates
                }
              ]
            : [])
        ],
        [
          {
            key: `dijkstra-edge-${current}-${edge.to}-${steps.length}`,
            path: "state.activeEdge",
            kind: "edge",
            intent: hasImproved ? "candidate" : "focus",
            label: `${current} -> ${edge.to} (${edge.weight})`
          }
        ]
      );
    }

    visited.add(current);

    pushGraphStep(
      steps,
      "dijkstra",
      metrics,
      "Checkpoint",
      `Node ${current} is now settled, so replay can jump here without re-running earlier frontier decisions.`,
      {
        summary: "Seal the extracted node into the visited set once its weighted distance is final.",
        details:
          "In Dijkstra's algorithm, a settled node keeps its shortest-path distance for the remainder of the run.",
        tags: ["checkpoint", "visited"]
      },
      currentState(current, [], reconstructPath(previousByNode, normalizedGraph.start, current)),
      [
        {
          path: "state.visited",
          op: "set",
          nextValue: Array.from(visited)
        }
      ],
      [
        {
          key: `dijkstra-visited-${current}`,
          path: "state.visited",
          kind: "node",
          intent: "visited",
          label: `Settled ${current}`
        }
      ]
    );

    if (normalizedGraph.target !== null && current === normalizedGraph.target) {
      break;
    }
  }

  pushFinalGraphStep(
    steps,
    "dijkstra",
    normalizedGraph,
    metrics,
    currentState,
    previousByNode
  );

  return createTraceEnvelope({
    algorithm: {
      id: "dijkstra",
      label: "Dijkstra",
      domain: "graph",
      implementationVersion: "graph-engine-0.1.0"
    },
    input: normalizedGraph,
    steps,
    metricDefinitions: graphMetricDefinitions,
    comparisonMetricKeys: ["visited", "inspections", "updates"]
  });
}

export function formatGraphDistance(distance: number | null): string {
  return distance === null ? "inf" : String(distance);
}
