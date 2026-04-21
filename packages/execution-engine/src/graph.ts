import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type GraphAlgorithmId =
  | "bfs"
  | "dijkstra"
  | "course-schedule"
  | "rotting-oranges";

export const graphAlgorithmIds: GraphAlgorithmId[] = [
  "bfs",
  "dijkstra",
  "course-schedule",
  "rotting-oranges"
];

export interface PathfindingGraphInput extends JsonObject {
  nodes: string[];
  edges: Array<[string, string, number]>;
  start: string;
  target: string | null;
  directed: boolean;
}

export interface CourseScheduleInput extends JsonObject {
  courseCount: number;
  prerequisites: Array<[number, number]>;
}

export interface RottingOrangesInput extends JsonObject {
  grid: number[][];
}

export type GraphInput = PathfindingGraphInput | CourseScheduleInput | RottingOrangesInput;

export interface PathfindingGraphExecutionState extends JsonObject {
  kind: "bfs" | "dijkstra";
  distances: Record<string, number | null>;
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  path: string[];
}

export interface CourseScheduleExecutionState extends JsonObject {
  kind: "course-schedule";
  courseCount: number;
  prerequisites: Array<[number, number]>;
  indegrees: Record<string, number>;
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  order: string[];
  schedulable: boolean | null;
  cycleNodes: string[];
}

export interface RottingOrangesExecutionState extends JsonObject {
  kind: "rotting-oranges";
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  minute: number;
  fresh: string[];
  newlyRotted: string[];
  rottable: boolean | null;
  minutesToRotAll: number | null;
  stalledFresh: string[];
}

export type GraphExecutionState =
  | PathfindingGraphExecutionState
  | CourseScheduleExecutionState
  | RottingOrangesExecutionState;

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

interface PathfindingGraphRuntimeStateBase {
  distances: Record<string, number>;
  settled: Set<string>;
  current: string | null;
  activeEdge: string[];
  path: string[];
}

interface BreadthFirstSearchRuntimeState extends PathfindingGraphRuntimeStateBase {
  frontier: string[];
}

interface DijkstraRuntimeState extends PathfindingGraphRuntimeStateBase {
  frontier: Set<string>;
}

interface CourseScheduleRuntimeState {
  indegrees: Record<string, number>;
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  order: string[];
  schedulable: boolean | null;
  cycleNodes: string[];
}

interface RottingOrangesRuntimeState {
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  minute: number;
  fresh: Set<string>;
  newlyRotted: string[];
  rottable: boolean | null;
  minutesToRotAll: number | null;
  stalledFresh: string[];
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
  },
  "course-schedule": {
    id: "course-schedule",
    label: "Course Schedule",
    implementationVersion: "graph-engine-0.2.0"
  },
  "rotting-oranges": {
    id: "rotting-oranges",
    label: "Rotting Oranges",
    implementationVersion: "graph-engine-0.3.0"
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

export const defaultCourseScheduleInput: CourseScheduleInput = {
  courseCount: 4,
  prerequisites: [
    [1, 0],
    [2, 1],
    [3, 2]
  ]
};

export const defaultRottingOrangesInput: RottingOrangesInput = {
  grid: [
    [2, 1, 1],
    [1, 1, 0],
    [0, 1, 1]
  ]
};

function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => row.slice());
}

function cloneGraphState(state: GraphExecutionState): GraphExecutionState {
  if (state.kind === "course-schedule") {
    return {
      kind: state.kind,
      courseCount: state.courseCount,
      prerequisites: state.prerequisites.map((pair) => pair.slice() as [number, number]),
      indegrees: {
        ...state.indegrees
      },
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      order: state.order.slice(),
      schedulable: state.schedulable,
      cycleNodes: state.cycleNodes.slice()
    };
  }

  if (state.kind === "rotting-oranges") {
    return {
      kind: state.kind,
      grid: cloneGrid(state.grid),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      minute: state.minute,
      fresh: state.fresh.slice(),
      newlyRotted: state.newlyRotted.slice(),
      rottable: state.rottable,
      minutesToRotAll: state.minutesToRotAll,
      stalledFresh: state.stalledFresh.slice()
    };
  }

  return {
    kind: state.kind,
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

function normalizeParsedPathfindingGraph(candidate: unknown): PathfindingGraphInput {
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

function normalizeCourseScheduleInput(candidate: unknown): CourseScheduleInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error(
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
    throw new Error("Course Schedule input courseCount must be an integer of at least 2.");
  }

  if (value.courseCount > 16) {
    throw new Error("Course Schedule input courseCount must be 16 or fewer.");
  }

  const courseCount = value.courseCount;

  if (!Array.isArray(value.prerequisites)) {
    throw new Error("Course Schedule input must include a prerequisites array.");
  }

  const prerequisites = value.prerequisites.map((entry, index) => {
    if (!Array.isArray(entry) || entry.length !== 2) {
      throw new Error(`prerequisites[${index}] must contain [course, prerequisite].`);
    }

    const course = entry[0];
    const prerequisite = entry[1];

    if (typeof course !== "number" || !Number.isInteger(course)) {
      throw new Error(`prerequisites[${index}][0] must be an integer.`);
    }

    if (typeof prerequisite !== "number" || !Number.isInteger(prerequisite)) {
      throw new Error(`prerequisites[${index}][1] must be an integer.`);
    }

    if (
      course < 0 ||
      course >= courseCount ||
      prerequisite < 0 ||
      prerequisite >= courseCount
    ) {
      throw new Error(
        `prerequisites[${index}] must reference course ids between 0 and ${courseCount - 1}.`
      );
    }

    if (course === prerequisite) {
      throw new Error(`prerequisites[${index}] must not depend on the same course twice.`);
    }

    return [course, prerequisite] as [number, number];
  });

  return {
    courseCount,
    prerequisites
  };
}

function normalizeRottingOrangesInput(candidate: unknown): RottingOrangesInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Rotting Oranges input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new Error("Rotting Oranges input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new Error("Rotting Oranges input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new Error(`grid[${rowIndex}] must be a non-empty integer array.`);
    }

    if (row.length > 8) {
      throw new Error(`grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || cell < 0 || cell > 2) {
        throw new Error(`grid[${rowIndex}][${columnIndex}] must be 0, 1, or 2.`);
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new Error("Rotting Oranges input rows must all be the same length.");
  }

  return {
    grid
  };
}

export function parseGraphInputText(
  inputText: string,
  algorithmId: GraphAlgorithmId = "dijkstra"
): GraphInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(inputText);
  } catch {
    throw new Error("Graph input must be valid JSON.");
  }

  switch (algorithmId) {
    case "course-schedule":
      return normalizeCourseScheduleInput(parsed);
    case "rotting-oranges":
      return normalizeRottingOrangesInput(parsed);
    default:
      return normalizeParsedPathfindingGraph(parsed);
  }
}

export function normalizeGraphInput(
  input: unknown,
  algorithmId: GraphAlgorithmId = "dijkstra"
): GraphInput {
  switch (algorithmId) {
    case "course-schedule":
      return normalizeCourseScheduleInput(input);
    case "rotting-oranges":
      return normalizeRottingOrangesInput(input);
    default:
      return normalizeParsedPathfindingGraph(input);
  }
}

export function serializeGraphInput(graph: GraphInput): string {
  if ("courseCount" in graph) {
    return JSON.stringify(
      {
        courseCount: graph.courseCount,
        prerequisites: graph.prerequisites
      },
      null,
      2
    );
  }

  if ("grid" in graph) {
    return JSON.stringify(
      {
        grid: graph.grid
      },
      null,
      2
    );
  }

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

function buildAdjacency(graph: PathfindingGraphInput): Map<string, GraphEdge[]> {
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

function createBreadthFirstSearchRecorder(graph: PathfindingGraphInput) {
  return createTraceRecorder<
    BreadthFirstSearchRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "bfs",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "bfs",
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

function createDijkstraRecorder(graph: PathfindingGraphInput) {
  return createTraceRecorder<DijkstraRuntimeState, GraphExecutionState, GraphMetricState>({
    algorithmId: "dijkstra",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "dijkstra",
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

function createCourseScheduleRecorder(input: CourseScheduleInput) {
  return createTraceRecorder<CourseScheduleRuntimeState, GraphExecutionState, GraphMetricState>({
    algorithmId: "course-schedule",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "course-schedule",
        courseCount: input.courseCount,
        prerequisites: input.prerequisites.map((pair) => pair.slice() as [number, number]),
        indegrees: {
          ...runtimeState.indegrees
        },
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        order: runtimeState.order.slice(),
        schedulable: runtimeState.schedulable,
        cycleNodes: runtimeState.cycleNodes.slice()
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function compareCellIds(left: string, right: string): number {
  const [leftRowText = "0", leftColumnText = "0"] = left.split(",");
  const [rightRowText = "0", rightColumnText = "0"] = right.split(",");
  const leftRow = Number(leftRowText);
  const leftColumn = Number(leftColumnText);
  const rightRow = Number(rightRowText);
  const rightColumn = Number(rightColumnText);

  return leftRow - rightRow || leftColumn - rightColumn;
}

function makeCellId(row: number, column: number): string {
  return `${row},${column}`;
}

function formatCellLabel(cell: string): string {
  const { row, column } = parseCellId(cell);
  return `(${row}, ${column})`;
}

function parseCellId(cell: string): { row: number; column: number } {
  const [rowText = "0", columnText = "0"] = cell.split(",");
  const row = Number(rowText);
  const column = Number(columnText);
  return { row, column };
}

function getNeighborCellIds(
  row: number,
  column: number,
  rowCount: number,
  columnCount: number
): string[] {
  const candidates: Array<[number, number]> = [
    [row - 1, column],
    [row, column + 1],
    [row + 1, column],
    [row, column - 1]
  ];

  return candidates
    .filter(
      ([neighborRow, neighborColumn]) =>
        neighborRow >= 0 &&
        neighborRow < rowCount &&
        neighborColumn >= 0 &&
        neighborColumn < columnCount
    )
    .map(([neighborRow, neighborColumn]) => makeCellId(neighborRow, neighborColumn));
}

function createRottingOrangesRecorder() {
  return createTraceRecorder<
    RottingOrangesRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "rotting-oranges",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "rotting-oranges",
        grid: cloneGrid(runtimeState.grid),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        minute: runtimeState.minute,
        fresh: Array.from(runtimeState.fresh).sort(compareCellIds),
        newlyRotted: runtimeState.newlyRotted.slice(),
        rottable: runtimeState.rottable,
        minutesToRotAll: runtimeState.minutesToRotAll,
        stalledFresh: runtimeState.stalledFresh.slice()
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
    | ReturnType<typeof createCourseScheduleRecorder>
    | ReturnType<typeof createRottingOrangesRecorder>
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
  graph: PathfindingGraphInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions.bfs;
  const normalizedGraph = normalizeGraphInput(graph, "bfs") as PathfindingGraphInput;
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
  graph: PathfindingGraphInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions.dijkstra;
  const normalizedGraph = normalizeGraphInput(graph, "dijkstra") as PathfindingGraphInput;
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

function compareCourseIds(left: string, right: string): number {
  return Number(left) - Number(right);
}

function insertSortedCourse(frontier: string[], course: string) {
  frontier.push(course);
  frontier.sort(compareCourseIds);
}

export function buildCourseScheduleTrace(
  input: CourseScheduleInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["course-schedule"];
  const normalizedInput = normalizeCourseScheduleInput(input);
  const courses = Array.from({ length: normalizedInput.courseCount }, (_, index) => `${index}`);
  const adjacency = new Map(courses.map((course) => [course, [] as string[]]));
  const indegrees = Object.fromEntries(courses.map((course) => [course, 0])) as Record<
    string,
    number
  >;

  for (const [course, prerequisite] of normalizedInput.prerequisites) {
    const prerequisiteId = `${prerequisite}`;
    const courseId = `${course}`;
    adjacency.get(prerequisiteId)?.push(courseId);
    indegrees[courseId] = (indegrees[courseId] ?? 0) + 1;
  }

  for (const neighbors of adjacency.values()) {
    neighbors.sort(compareCourseIds);
  }

  const frontier = courses.filter((course) => indegrees[course] === 0).sort(compareCourseIds);
  const settled: string[] = [];
  const order: string[] = [];
  const recorder = createCourseScheduleRecorder(normalizedInput);
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: frontier.length,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let activeEdge: string[] = [];
  let schedulable: boolean | null = null;
  let cycleNodes: string[] = [];

  const createRuntimeState = (): CourseScheduleRuntimeState => ({
    indegrees,
    settled,
    frontier,
    current,
    activeEdge,
    order,
    schedulable,
    cycleNodes
  });

  recorder.push({
    phase: "Initialization",
    description:
      "The schedule begins with all course indegrees recorded and the zero-prerequisite queue seeded before any dependency edge is inspected.",
    explanation: {
      summary: "Seed the indegree ledger and initial zero-prerequisite frontier before scheduling any course.",
      details:
        "The first frame stores the full indegree map and queue order directly so replay never reconstructs which courses were immediately available.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "course-schedule-initial",
        path: "state.frontier",
        kind: "collection",
        intent: "focus",
        label: `${frontier.length} zero-prerequisite course${frontier.length === 1 ? "" : "s"} ready`
      }
    ]
  });

  while (frontier.length > 0) {
    const currentCourse = frontier.shift();

    if (!currentCourse) {
      break;
    }

    current = currentCourse;
    activeEdge = [];
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Extract",
      description: `Course ${current} leaves the zero-prerequisite queue and becomes the next course under inspection.`,
      explanation: {
        summary: "Take the next available course from the frontier in deterministic course-id order.",
        details:
          "The queue ordering is stable, so replay and backend consumers agree on which zero-indegree course is scheduled first.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `course-schedule-current-${current}`,
          path: "state.current",
          kind: "node",
          intent: "active",
          label: `Schedule course ${current}`
        }
      ]
    });

    for (const dependent of adjacency.get(currentCourse) ?? []) {
      activeEdge = [currentCourse, dependent];
      metrics.inspections += 1;
      indegrees[dependent] = Math.max(0, (indegrees[dependent] ?? 0) - 1);
      metrics.updates += 1;
      const unlocked = indegrees[dependent] === 0;

      if (unlocked) {
        insertSortedCourse(frontier, dependent);
      }

      metrics.frontier = frontier.length;

      recorder.push({
        phase: unlocked ? "Unlock" : "Inspect",
        description: unlocked
          ? `Course ${dependent} drops to indegree 0 and joins the scheduling frontier after ${current} completes.`
          : `Course ${dependent} still has ${indegrees[dependent]} prerequisite${indegrees[dependent] === 1 ? "" : "s"} remaining after ${current} completes.`,
        explanation: {
          summary: unlocked
            ? "Decrease the dependent course indegree and unlock it once no prerequisites remain."
            : "Decrease the dependent indegree without unlocking the course yet.",
          details: unlocked
            ? `The zero-indegree queue now includes ${dependent}, which makes the next scheduling choice replay-safe and explicit.`
            : `The schedule still needs more prerequisite courses before ${dependent} can enter the frontier.`,
          tags: ["edge", unlocked ? "frontier" : "focus"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `course-schedule-edge-${current}-${dependent}-${metrics.inspections}`,
            path: unlocked ? "state.frontier" : `state.indegrees.${dependent}`,
            kind: unlocked ? "collection" : "node",
            intent: unlocked ? "frontier" : "candidate",
          label: unlocked
            ? `Unlock ${dependent}`
            : `Reduce indegree of ${dependent} to ${indegrees[dependent]}`
          }
        ]
      });
    }

    order.push(currentCourse);
    settled.push(currentCourse);
    activeEdge = [];
    metrics.settled = settled.length;
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Checkpoint",
      description: `Course ${current} is sealed into the committed schedule order, so replay can jump here without re-running earlier indegree updates.`,
      explanation: {
        summary: "Commit the scheduled course after all outgoing prerequisite edges are processed.",
        details:
          "This checkpoint captures the updated indegree ledger, live queue, and committed order in one deterministic frame.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `course-schedule-settled-${current}`,
          path: "state.order",
          kind: "path",
          intent: "visited",
          label: `Order now ends with ${current}`
        }
      ]
    });
  }

  current = null;
  activeEdge = [];
  cycleNodes = courses.filter((course) => !settled.includes(course)).sort(compareCourseIds);
  schedulable = cycleNodes.length === 0;
  metrics.settled = settled.length;
  metrics.frontier = frontier.length;

  recorder.push({
    phase: schedulable ? "Resolution" : "Cycle",
    description: schedulable
      ? `All ${order.length} courses fit into the order ${order.join(" -> ")}.`
      : `A cycle blocks the remaining courses ${cycleNodes.join(", ")}, so no full schedule exists.`,
    explanation: {
      summary: schedulable
        ? "Publish the completed topological order once every course is scheduled."
        : "Publish the blocked courses once the zero-indegree frontier is exhausted before all courses are scheduled.",
      details: schedulable
        ? "The terminal frame stores the full order directly so replay never recomputes the final course sequence from earlier checkpoints."
        : "The remaining positive-indegree courses stay explicit in the terminal frame so replay can explain why scheduling failed without re-running Kahn's algorithm.",
      tags: ["result", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "course-schedule-final",
        path: schedulable ? "state.order" : "state.cycleNodes",
        kind: schedulable ? "path" : "collection",
        intent: "result",
        label: schedulable
          ? `Order ${order.join(" -> ")}`
          : `Cycle blocks ${cycleNodes.join(", ")}`
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

export function buildRottingOrangesTrace(
  input: RottingOrangesInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["rotting-oranges"];
  const normalizedInput = normalizeRottingOrangesInput(input);
  const grid = cloneGrid(normalizedInput.grid);
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  const frontier: string[] = [];
  const fresh = new Set<string>();
  const settled: string[] = [];
  const recorder = createRottingOrangesRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: 0,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let activeEdge: string[] = [];
  let minute = 0;
  let newlyRotted: string[] = [];
  let rottable: boolean | null = null;
  let minutesToRotAll: number | null = null;
  let stalledFresh: string[] = [];

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      const value = grid[row]![column]!;
      const id = makeCellId(row, column);

      if (value === 2) {
        frontier.push(id);
      } else if (value === 1) {
        fresh.add(id);
      }
    }
  }

  metrics.frontier = frontier.length;

  const createRuntimeState = (): RottingOrangesRuntimeState => ({
    grid,
    settled,
    frontier,
    current,
    activeEdge,
    minute,
    fresh,
    newlyRotted,
    rottable,
    minutesToRotAll,
    stalledFresh
  });

  recorder.push({
    phase: "Initialization",
    description:
      "The infection scan records every fresh and rotten orange before the first minute begins so replay can restore the grid without rebuilding queue state.",
    explanation: {
      summary: "Seed the rotten-orange frontier and fresh-orange ledger before the first spread step.",
      details:
        "The initial frame stores the full grid, the ordered frontier, and the remaining fresh cells directly so replay never reconstructs the starting orchard from live queue state.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "rotting-oranges-initial",
        path: frontier.length > 0 ? "state.frontier" : "state.fresh",
        kind: "collection",
        intent: "focus",
        label:
          frontier.length > 0
            ? `${frontier.length} rotten source${frontier.length === 1 ? "" : "s"} ready`
            : `${fresh.size} fresh orange${fresh.size === 1 ? "" : "s"} awaiting exposure`
      }
    ]
  });

  if (fresh.size === 0) {
    rottable = true;
    minutesToRotAll = 0;

    recorder.push({
      phase: "Resolution",
      description: "No fresh oranges remain, so the grid resolves immediately at minute 0.",
      explanation: {
        summary: "Publish the terminal grid immediately when every orange is already rotten or empty.",
        details:
          "The terminal frame still records the grid and counters so replay can explain why no minute-to-minute spread was required.",
        tags: ["result", "graph"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "rotting-oranges-final-immediate",
          path: "state.minutesToRotAll",
          kind: "node",
          intent: "result",
          label: "All oranges already resolved at minute 0"
        }
      ]
    });

    return buildGraphEnvelope(definition, normalizedInput, recorder);
  }

  while (frontier.length > 0 && fresh.size > 0) {
    const waveSize = frontier.length;
    newlyRotted = [];

    for (let waveIndex = 0; waveIndex < waveSize; waveIndex += 1) {
      const currentOrange = frontier.shift();

      if (!currentOrange) {
        break;
      }

      current = currentOrange;
      activeEdge = [];
      metrics.frontier = frontier.length;

      recorder.push({
        phase: "Extract",
        description: `Rotten orange ${formatCellLabel(currentOrange)} becomes the active spread source for minute ${minute}.`,
        explanation: {
          summary: "Expand one rotten orange from the frontier in deterministic row-major queue order.",
          details:
            "The trace records which rotten orange is active before neighbor checks begin so replay can follow the infection wave one source at a time.",
          tags: ["frontier", "focus"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `rotting-oranges-current-${currentOrange}-${minute}`,
            path: "state.current",
            kind: "node",
            intent: "active",
            label: `Spread from ${formatCellLabel(currentOrange)}`
          }
        ]
      });

      const { row, column } = parseCellId(currentOrange);

      for (const neighbor of getNeighborCellIds(row, column, rowCount, columnCount)) {
        const neighborCoordinates = parseCellId(neighbor);
        const neighborValue = grid[neighborCoordinates.row]![neighborCoordinates.column]!;
        activeEdge = [currentOrange, neighbor];
        metrics.inspections += 1;

        if (neighborValue !== 1) {
          metrics.frontier = frontier.length;

          recorder.push({
            phase: "Inspect",
            description:
              neighborValue === 0
                ? `Cell ${formatCellLabel(neighbor)} is empty, so the infection wave passes without a new orange to rot.`
                : `Cell ${formatCellLabel(neighbor)} is already rotten, so this inspection preserves the existing infection state.`,
            explanation: {
              summary:
                neighborValue === 0
                  ? "Inspect an empty neighboring cell without changing the infection frontier."
                  : "Inspect an already rotten neighboring cell without re-enqueuing it.",
              details:
                neighborValue === 0
                  ? "Empty cells stay explicit in the trace so replay can explain why the infection did not cross that position."
                  : "Previously rotten cells remain stable, so the queue order and infected grid do not change on this step.",
              tags: ["edge", "focus"]
            },
            runtimeState: createRuntimeState(),
            metrics,
            highlights: [
              {
                key: `rotting-oranges-inspect-${currentOrange}-${neighbor}-${metrics.inspections}`,
                path: `state.grid.${neighborCoordinates.row}.${neighborCoordinates.column}`,
                kind: "node",
                intent: "candidate",
                label:
                  neighborValue === 0
                    ? `Empty cell ${formatCellLabel(neighbor)}`
                    : `Already rotten ${formatCellLabel(neighbor)}`
              }
            ]
          });

          continue;
        }

        grid[neighborCoordinates.row]![neighborCoordinates.column] = 2;
        fresh.delete(neighbor);
        frontier.push(neighbor);
        newlyRotted.push(neighbor);
        metrics.updates += 1;
        metrics.frontier = frontier.length;

        recorder.push({
          phase: "Spread",
          description: `Fresh orange ${formatCellLabel(neighbor)} turns rotten and joins the frontier for minute ${minute + 1}.`,
          explanation: {
            summary: "Convert one fresh neighboring orange and append it to the next infection wave.",
            details:
              "The updated grid and queue are recorded immediately so replay never needs to recompute which fresh cells became rotten this minute.",
            tags: ["edge", "frontier"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `rotting-oranges-spread-${currentOrange}-${neighbor}-${metrics.updates}`,
              path: `state.grid.${neighborCoordinates.row}.${neighborCoordinates.column}`,
              kind: "node",
              intent: "frontier",
              label: `Rot ${formatCellLabel(neighbor)}`
            }
          ]
        });
      }

      settled.push(currentOrange);
      activeEdge = [];
      metrics.settled = settled.length;
      metrics.frontier = frontier.length;

      recorder.push({
        phase: "Checkpoint",
        description: `Rotten orange ${formatCellLabel(currentOrange)} is fully processed for minute ${minute}.`,
        explanation: {
          summary: "Seal the processed spread source once all of its neighboring checks are recorded.",
          details:
            "This checkpoint captures the current grid, the remaining frontier, and any newly rotten cells without replaying earlier inspections.",
          tags: ["checkpoint", "visited"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `rotting-oranges-settled-${currentOrange}-${minute}`,
            path: "state.settled",
            kind: "collection",
            intent: "visited",
            label: `${formatCellLabel(currentOrange)} processed`
          }
        ]
      });
    }

    if (newlyRotted.length === 0) {
      break;
    }

    minute += 1;
    current = null;
    activeEdge = [];
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Minute",
      description: `Minute ${minute} begins with ${newlyRotted.length} newly rotten orange${newlyRotted.length === 1 ? "" : "s"} queued for spread.`,
      explanation: {
        summary: "Advance the replay clock after one full infection wave completes.",
        details:
          "The next wave starts only after every rotten orange from the prior minute is processed, which keeps the minute counter deterministic.",
        tags: ["frontier", "checkpoint"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `rotting-oranges-minute-${minute}`,
          path: "state.minute",
          kind: "node",
          intent: "focus",
          label: `Minute ${minute}`
        }
      ]
    });
  }

  current = null;
  activeEdge = [];
  stalledFresh = Array.from(fresh).sort(compareCellIds);
  rottable = stalledFresh.length === 0;
  minutesToRotAll = rottable ? minute : null;
  metrics.frontier = frontier.length;

  recorder.push({
    phase: rottable ? "Resolution" : "Stalled",
    description: rottable
      ? `All fresh oranges rot by minute ${minute}.`
      : `Fresh oranges ${stalledFresh.map(formatCellLabel).join(", ")} remain unreachable after minute ${minute}.`,
    explanation: {
      summary: rottable
        ? "Publish the terminal minute once every fresh orange has turned rotten."
        : "Publish the unreachable fresh oranges once the frontier can no longer spread.",
      details: rottable
        ? "The terminal frame stores the last fully recorded grid and minute counter directly so replay never recomputes the infection duration."
        : "The remaining fresh cells stay explicit in the terminal frame so replay can explain the impossible outcome without rerunning the BFS wave.",
      tags: ["result", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "rotting-oranges-final",
        path: rottable ? "state.minutesToRotAll" : "state.stalledFresh",
        kind: rottable ? "node" : "collection",
        intent: "result",
        label: rottable
          ? `All oranges rot in ${minute} minute${minute === 1 ? "" : "s"}`
          : `Stalled fresh ${stalledFresh.map(formatCellLabel).join(", ")}`
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

export function buildGraphTrace(
  algorithmId: GraphAlgorithmId,
  graph: GraphInput
): TraceEnvelope<GraphExecutionState> {
  switch (algorithmId) {
    case "bfs":
      return buildBreadthFirstSearchTrace(graph as PathfindingGraphInput);
    case "dijkstra":
      return buildDijkstraTrace(graph as PathfindingGraphInput);
    case "course-schedule":
      return buildCourseScheduleTrace(graph as CourseScheduleInput);
    case "rotting-oranges":
      return buildRottingOrangesTrace(graph as RottingOrangesInput);
  }
}

export function formatGraphDistance(distance: number | null): string {
  return distance === null ? "inf" : String(distance);
}
