import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type GraphAlgorithmId =
  | "bfs"
  | "dfs"
  | "dijkstra"
  | "clone-graph"
  | "graph-valid-tree"
  | "course-schedule"
  | "rotting-oranges"
  | "number-of-islands"
  | "surrounded-regions"
  | "walls-and-gates";

export const graphAlgorithmIds: GraphAlgorithmId[] = [
  "bfs",
  "dfs",
  "dijkstra",
  "clone-graph",
  "graph-valid-tree",
  "course-schedule",
  "rotting-oranges",
  "number-of-islands",
  "surrounded-regions",
  "walls-and-gates"
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

export interface GraphValidTreeInput extends JsonObject {
  nodeCount: number;
  edges: Array<[number, number]>;
}

export interface RottingOrangesInput extends JsonObject {
  grid: number[][];
}

export interface NumberOfIslandsInput extends JsonObject {
  grid: string[][];
}

export interface SurroundedRegionsInput extends JsonObject {
  grid: string[][];
}

export interface WallsAndGatesInput extends JsonObject {
  grid: number[][];
}

export type GraphInput =
  | PathfindingGraphInput
  | GraphValidTreeInput
  | CourseScheduleInput
  | RottingOrangesInput
  | NumberOfIslandsInput
  | SurroundedRegionsInput
  | WallsAndGatesInput;

export interface PathfindingGraphExecutionState extends JsonObject {
  kind: "bfs" | "dfs" | "dijkstra";
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

export interface CloneGraphExecutionState extends JsonObject {
  kind: "clone-graph";
  nodes: string[];
  edges: Array<[string, string, number]>;
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  cloneMap: Record<string, string>;
  clonedNodes: string[];
  clonedEdges: string[];
  currentClone: string | null;
  unreachableNodes: string[];
  fullyCloned: boolean | null;
}

export interface GraphValidTreeExecutionState extends JsonObject {
  kind: "graph-valid-tree";
  nodeCount: number;
  edges: Array<[number, number]>;
  parents: Record<string, number>;
  ranks: Record<string, number>;
  components: string[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  currentRoots: string[];
  acceptedEdges: string[];
  rejectedEdges: string[];
  componentCount: number;
  isTree: boolean | null;
  failureReason: string | null;
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

export interface NumberOfIslandsExecutionState extends JsonObject {
  kind: "number-of-islands";
  grid: string[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  scan: string | null;
  islandCount: number;
  activeIslandId: number | null;
  activeIsland: string[];
  completedIslands: string[][];
  cellIslands: Record<string, number>;
  remainingLand: string[];
}

export interface SurroundedRegionsExecutionState extends JsonObject {
  kind: "surrounded-regions";
  grid: string[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  phaseMode: "mark-safe" | "capture" | "resolved";
  boundarySeeds: string[];
  safeCells: string[];
  capturedCells: string[];
  remainingOpen: string[];
  capturedAny: boolean | null;
}

export interface WallsAndGatesExecutionState extends JsonObject {
  kind: "walls-and-gates";
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  gates: string[];
  walls: string[];
  updatedRooms: string[];
  remainingRooms: string[];
  fullyReachable: boolean | null;
  maxDistance: number | null;
  unreachableRooms: string[];
}

export type GraphExecutionState =
  | PathfindingGraphExecutionState
  | CloneGraphExecutionState
  | GraphValidTreeExecutionState
  | CourseScheduleExecutionState
  | RottingOrangesExecutionState
  | NumberOfIslandsExecutionState
  | SurroundedRegionsExecutionState
  | WallsAndGatesExecutionState;

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

interface DepthFirstSearchRuntimeState extends PathfindingGraphRuntimeStateBase {
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

interface CloneGraphRuntimeState {
  nodes: string[];
  edges: Array<[string, string, number]>;
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  cloneMap: Record<string, string>;
  clonedNodes: string[];
  clonedEdges: string[];
  currentClone: string | null;
  unreachableNodes: string[];
  fullyCloned: boolean | null;
}

interface GraphValidTreeRuntimeState {
  nodeCount: number;
  edges: Array<[number, number]>;
  parents: number[];
  ranks: number[];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  currentRoots: string[];
  acceptedEdges: string[];
  rejectedEdges: string[];
  componentCount: number;
  isTree: boolean | null;
  failureReason: string | null;
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

interface NumberOfIslandsRuntimeState {
  grid: string[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  scan: string | null;
  islandCount: number;
  activeIslandId: number | null;
  activeIsland: string[];
  completedIslands: string[][];
  cellIslands: Record<string, number>;
  remainingLand: Set<string>;
}

interface SurroundedRegionsRuntimeState {
  grid: string[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  phaseMode: "mark-safe" | "capture" | "resolved";
  boundarySeeds: string[];
  safeCells: string[];
  capturedCells: string[];
  remainingOpen: Set<string>;
  capturedAny: boolean | null;
}

interface WallsAndGatesRuntimeState {
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  gates: string[];
  walls: string[];
  updatedRooms: string[];
  remainingRooms: Set<string>;
  fullyReachable: boolean | null;
  maxDistance: number | null;
  unreachableRooms: string[];
}

const graphAlgorithmDefinitions: Record<GraphAlgorithmId, GraphAlgorithmDefinition> = {
  bfs: {
    id: "bfs",
    label: "Breadth-First Search",
    implementationVersion: "graph-engine-0.1.0"
  },
  dfs: {
    id: "dfs",
    label: "Depth-First Search",
    implementationVersion: "graph-engine-0.1.0"
  },
  dijkstra: {
    id: "dijkstra",
    label: "Dijkstra",
    implementationVersion: "graph-engine-0.1.0"
  },
  "clone-graph": {
    id: "clone-graph",
    label: "Clone Graph",
    implementationVersion: "graph-engine-0.7.0"
  },
  "graph-valid-tree": {
    id: "graph-valid-tree",
    label: "Graph Valid Tree",
    implementationVersion: "graph-engine-0.6.0"
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
  },
  "number-of-islands": {
    id: "number-of-islands",
    label: "Number of Islands",
    implementationVersion: "graph-engine-0.4.0"
  },
  "surrounded-regions": {
    id: "surrounded-regions",
    label: "Surrounded Regions",
    implementationVersion: "graph-engine-0.8.0"
  },
  "walls-and-gates": {
    id: "walls-and-gates",
    label: "Walls and Gates",
    implementationVersion: "graph-engine-0.5.0"
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
    label: "Inspections",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "updates",
    label: "Updates",
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

export const defaultCloneGraphInput: PathfindingGraphInput = {
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

export const defaultGraphValidTreeInput: GraphValidTreeInput = {
  nodeCount: 5,
  edges: [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4]
  ]
};

export const defaultRottingOrangesInput: RottingOrangesInput = {
  grid: [
    [2, 1, 1],
    [1, 1, 0],
    [0, 1, 1]
  ]
};

export const defaultNumberOfIslandsInput: NumberOfIslandsInput = {
  grid: [
    ["1", "1", "0", "0", "0"],
    ["1", "1", "0", "0", "0"],
    ["0", "0", "1", "0", "0"],
    ["0", "0", "0", "1", "1"]
  ]
};

export const defaultSurroundedRegionsInput: SurroundedRegionsInput = {
  grid: [
    ["X", "X", "X", "X"],
    ["X", "O", "O", "X"],
    ["X", "X", "O", "X"],
    ["X", "O", "X", "X"]
  ]
};

export const wallsAndGatesInfinity = 2147483647;

export const defaultWallsAndGatesInput: WallsAndGatesInput = {
  grid: [
    [wallsAndGatesInfinity, -1, 0, wallsAndGatesInfinity],
    [wallsAndGatesInfinity, wallsAndGatesInfinity, wallsAndGatesInfinity, -1],
    [wallsAndGatesInfinity, -1, wallsAndGatesInfinity, -1],
    [0, -1, wallsAndGatesInfinity, wallsAndGatesInfinity]
  ]
};

function cloneGrid<Value>(grid: Value[][]): Value[][] {
  return grid.map((row) => row.slice());
}

function cloneGraphState(state: GraphExecutionState): GraphExecutionState {
  if (state.kind === "clone-graph") {
    return {
      kind: state.kind,
      nodes: state.nodes.slice(),
      edges: state.edges.map((edge) => edge.slice() as [string, string, number]),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      cloneMap: {
        ...state.cloneMap
      },
      clonedNodes: state.clonedNodes.slice(),
      clonedEdges: state.clonedEdges.slice(),
      currentClone: state.currentClone,
      unreachableNodes: state.unreachableNodes.slice(),
      fullyCloned: state.fullyCloned
    };
  }

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

  if (state.kind === "graph-valid-tree") {
    return {
      kind: state.kind,
      nodeCount: state.nodeCount,
      edges: state.edges.map((edge) => edge.slice() as [number, number]),
      parents: {
        ...state.parents
      },
      ranks: {
        ...state.ranks
      },
      components: state.components.map((component) => component.slice()),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      currentRoots: state.currentRoots.slice(),
      acceptedEdges: state.acceptedEdges.slice(),
      rejectedEdges: state.rejectedEdges.slice(),
      componentCount: state.componentCount,
      isTree: state.isTree,
      failureReason: state.failureReason
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

  if (state.kind === "number-of-islands") {
    return {
      kind: state.kind,
      grid: cloneGrid(state.grid),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      scan: state.scan,
      islandCount: state.islandCount,
      activeIslandId: state.activeIslandId,
      activeIsland: state.activeIsland.slice(),
      completedIslands: state.completedIslands.map((island) => island.slice()),
      cellIslands: {
        ...state.cellIslands
      },
      remainingLand: state.remainingLand.slice()
    };
  }

  if (state.kind === "surrounded-regions") {
    return {
      kind: state.kind,
      grid: cloneGrid(state.grid),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      phaseMode: state.phaseMode,
      boundarySeeds: state.boundarySeeds.slice(),
      safeCells: state.safeCells.slice(),
      capturedCells: state.capturedCells.slice(),
      remainingOpen: state.remainingOpen.slice(),
      capturedAny: state.capturedAny
    };
  }

  if (state.kind === "walls-and-gates") {
    return {
      kind: state.kind,
      grid: cloneGrid(state.grid),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      gates: state.gates.slice(),
      walls: state.walls.slice(),
      updatedRooms: state.updatedRooms.slice(),
      remainingRooms: state.remainingRooms.slice(),
      fullyReachable: state.fullyReachable,
      maxDistance: state.maxDistance,
      unreachableRooms: state.unreachableRooms.slice()
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

function normalizeGraphValidTreeInput(candidate: unknown): GraphValidTreeInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Graph Valid Tree input must be an object with nodeCount and edges.");
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
    throw new Error("Graph Valid Tree input nodeCount must be an integer of at least 2.");
  }

  if (value.nodeCount > 12) {
    throw new Error("Graph Valid Tree input nodeCount must be 12 or fewer.");
  }

  const nodeCount = value.nodeCount;

  if (!Array.isArray(value.edges) || value.edges.length === 0) {
    throw new Error("Graph Valid Tree input must include at least one edge.");
  }

  if (value.edges.length > 24) {
    throw new Error("Graph Valid Tree input must use 24 edges or fewer.");
  }

  const edges = value.edges.map((edge, index) => {
    if (!Array.isArray(edge) || edge.length !== 2) {
      throw new Error(`edges[${index}] must contain [from, to].`);
    }

    const [from, to] = edge;

    if (typeof from !== "number" || !Number.isInteger(from)) {
      throw new Error(`edges[${index}][0] must be an integer.`);
    }

    if (typeof to !== "number" || !Number.isInteger(to)) {
      throw new Error(`edges[${index}][1] must be an integer.`);
    }

    if (from < 0 || from >= nodeCount || to < 0 || to >= nodeCount) {
      throw new Error(
        `edges[${index}] must reference node ids between 0 and ${nodeCount - 1}.`
      );
    }

    return [from, to] as [number, number];
  });

  return {
    nodeCount,
    edges
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

function normalizeNumberOfIslandsInput(candidate: unknown): NumberOfIslandsInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Number of Islands input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new Error("Number of Islands input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new Error("Number of Islands input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new Error(`grid[${rowIndex}] must be a non-empty land-water array.`);
    }

    if (row.length > 8) {
      throw new Error(`grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (cell === 0 || cell === "0") {
        return "0";
      }

      if (cell === 1 || cell === "1") {
        return "1";
      }

      throw new Error(`grid[${rowIndex}][${columnIndex}] must be "0" or "1".`);
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new Error("Number of Islands input rows must all be the same length.");
  }

  return {
    grid
  };
}

function normalizeSurroundedRegionsInput(candidate: unknown): SurroundedRegionsInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Surrounded Regions input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new Error("Surrounded Regions input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new Error("Surrounded Regions input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new Error(`grid[${rowIndex}] must be a non-empty capture grid row.`);
    }

    if (row.length > 8) {
      throw new Error(`grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "string") {
        throw new Error(`grid[${rowIndex}][${columnIndex}] must be \"X\" or \"O\".`);
      }

      const normalizedCell = cell.trim().toUpperCase();

      if (normalizedCell !== "X" && normalizedCell !== "O") {
        throw new Error(`grid[${rowIndex}][${columnIndex}] must be "X" or "O".`);
      }

      return normalizedCell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new Error("Surrounded Regions input rows must all be the same length.");
  }

  return {
    grid
  };
}

function normalizeWallsAndGatesInput(candidate: unknown): WallsAndGatesInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Walls and Gates input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new Error("Walls and Gates input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new Error("Walls and Gates input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new Error(`grid[${rowIndex}] must be a non-empty integer array.`);
    }

    if (row.length > 8) {
      throw new Error(`grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (
        typeof cell !== "number" ||
        !Number.isInteger(cell) ||
        ![-1, 0, wallsAndGatesInfinity].includes(cell)
      ) {
        throw new Error(
          `grid[${rowIndex}][${columnIndex}] must be -1, 0, or ${wallsAndGatesInfinity}.`
        );
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new Error("Walls and Gates input rows must all be the same length.");
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
    case "clone-graph":
      return normalizeParsedPathfindingGraph(parsed);
    case "graph-valid-tree":
      return normalizeGraphValidTreeInput(parsed);
    case "course-schedule":
      return normalizeCourseScheduleInput(parsed);
    case "rotting-oranges":
      return normalizeRottingOrangesInput(parsed);
    case "number-of-islands":
      return normalizeNumberOfIslandsInput(parsed);
    case "surrounded-regions":
      return normalizeSurroundedRegionsInput(parsed);
    case "walls-and-gates":
      return normalizeWallsAndGatesInput(parsed);
    default:
      return normalizeParsedPathfindingGraph(parsed);
  }
}

export function normalizeGraphInput(
  input: unknown,
  algorithmId: GraphAlgorithmId = "dijkstra"
): GraphInput {
  switch (algorithmId) {
    case "clone-graph":
      return normalizeParsedPathfindingGraph(input);
    case "graph-valid-tree":
      return normalizeGraphValidTreeInput(input);
    case "course-schedule":
      return normalizeCourseScheduleInput(input);
    case "rotting-oranges":
      return normalizeRottingOrangesInput(input);
    case "number-of-islands":
      return normalizeNumberOfIslandsInput(input);
    case "surrounded-regions":
      return normalizeSurroundedRegionsInput(input);
    case "walls-and-gates":
      return normalizeWallsAndGatesInput(input);
    default:
      return normalizeParsedPathfindingGraph(input);
  }
}

export function serializeGraphInput(graph: GraphInput): string {
  if ("nodeCount" in graph) {
    return JSON.stringify(
      {
        nodeCount: graph.nodeCount,
        edges: graph.edges
      },
      null,
      2
    );
  }

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

function createCloneNodeLabel(node: string): string {
  return `${node}'`;
}

function createCloneEdgeLabel(from: string, to: string, directed: boolean): string {
  if (directed) {
    return `${from}->${to}`;
  }

  return [from, to].sort((left, right) => left.localeCompare(right)).join("-");
}

function findUnreachableGraphNodes(
  nodes: string[],
  cloneMap: Record<string, string>
): string[] {
  return nodes.filter((node) => !(node in cloneMap));
}

function createTreeEdgeLabel(edge: [number, number], index: number): string {
  return `#${index + 1} ${edge[0]}-${edge[1]}`;
}

function findTreeRoot(parents: number[], node: number): number {
  let cursor = node;

  while (parents[cursor] !== cursor) {
    cursor = parents[cursor]!;
  }

  return cursor;
}

function serializeTreeNodeLedger(values: number[]): Record<string, number> {
  return Object.fromEntries(values.map((value, index) => [String(index), value]));
}

function projectTreeComponents(nodeCount: number, parents: number[]): string[][] {
  const groups = new Map<number, number[]>();

  for (let node = 0; node < nodeCount; node += 1) {
    const root = findTreeRoot(parents, node);
    const members = groups.get(root) ?? [];
    members.push(node);
    groups.set(root, members);
  }

  return Array.from(groups.values())
    .map((members) => members.sort((left, right) => left - right).map(String))
    .sort((left, right) => Number(left[0]) - Number(right[0]));
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

function projectDepthFirstFrontier(frontier: string[]): string[] {
  return frontier.slice().reverse();
}

function createDepthFirstSearchRecorder(graph: PathfindingGraphInput) {
  return createTraceRecorder<DepthFirstSearchRuntimeState, GraphExecutionState, GraphMetricState>({
    algorithmId: "dfs",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "dfs",
        distances: serializeDistances(graph.nodes, runtimeState.distances),
        settled: Array.from(runtimeState.settled),
        frontier: projectDepthFirstFrontier(runtimeState.frontier),
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

function createCloneGraphRecorder(input: PathfindingGraphInput) {
  return createTraceRecorder<CloneGraphRuntimeState, GraphExecutionState, GraphMetricState>({
    algorithmId: "clone-graph",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "clone-graph",
        nodes: input.nodes.slice(),
        edges: input.edges.map((edge) => edge.slice() as [string, string, number]),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        cloneMap: {
          ...runtimeState.cloneMap
        },
        clonedNodes: runtimeState.clonedNodes.slice(),
        clonedEdges: runtimeState.clonedEdges.slice(),
        currentClone: runtimeState.currentClone,
        unreachableNodes: runtimeState.unreachableNodes.slice(),
        fullyCloned: runtimeState.fullyCloned
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createGraphValidTreeRecorder() {
  return createTraceRecorder<
    GraphValidTreeRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "graph-valid-tree",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "graph-valid-tree",
        nodeCount: runtimeState.nodeCount,
        edges: runtimeState.edges.map((edge) => edge.slice() as [number, number]),
        parents: serializeTreeNodeLedger(runtimeState.parents),
        ranks: serializeTreeNodeLedger(runtimeState.ranks),
        components: projectTreeComponents(runtimeState.nodeCount, runtimeState.parents),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        currentRoots: runtimeState.currentRoots.slice(),
        acceptedEdges: runtimeState.acceptedEdges.slice(),
        rejectedEdges: runtimeState.rejectedEdges.slice(),
        componentCount: runtimeState.componentCount,
        isTree: runtimeState.isTree,
        failureReason: runtimeState.failureReason
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

function createNumberOfIslandsRecorder() {
  return createTraceRecorder<
    NumberOfIslandsRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "number-of-islands",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "number-of-islands",
        grid: cloneGrid(runtimeState.grid),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        scan: runtimeState.scan,
        islandCount: runtimeState.islandCount,
        activeIslandId: runtimeState.activeIslandId,
        activeIsland: runtimeState.activeIsland.slice(),
        completedIslands: runtimeState.completedIslands.map((island) => island.slice()),
        cellIslands: {
          ...runtimeState.cellIslands
        },
        remainingLand: Array.from(runtimeState.remainingLand).sort(compareCellIds)
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createSurroundedRegionsRecorder() {
  return createTraceRecorder<
    SurroundedRegionsRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "surrounded-regions",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "surrounded-regions",
        grid: cloneGrid(runtimeState.grid),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        phaseMode: runtimeState.phaseMode,
        boundarySeeds: runtimeState.boundarySeeds.slice(),
        safeCells: runtimeState.safeCells.slice(),
        capturedCells: runtimeState.capturedCells.slice(),
        remainingOpen: Array.from(runtimeState.remainingOpen).sort(compareCellIds),
        capturedAny: runtimeState.capturedAny
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createWallsAndGatesRecorder() {
  return createTraceRecorder<
    WallsAndGatesRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "walls-and-gates",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "walls-and-gates",
        grid: cloneGrid(runtimeState.grid),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        gates: runtimeState.gates.slice(),
        walls: runtimeState.walls.slice(),
        updatedRooms: runtimeState.updatedRooms.slice(),
        remainingRooms: Array.from(runtimeState.remainingRooms).sort(compareCellIds),
        fullyReachable: runtimeState.fullyReachable,
        maxDistance: runtimeState.maxDistance,
        unreachableRooms: runtimeState.unreachableRooms.slice()
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
    | ReturnType<typeof createDepthFirstSearchRecorder>
    | ReturnType<typeof createDijkstraRecorder>
    | ReturnType<typeof createCloneGraphRecorder>
    | ReturnType<typeof createGraphValidTreeRecorder>
    | ReturnType<typeof createCourseScheduleRecorder>
    | ReturnType<typeof createRottingOrangesRecorder>
    | ReturnType<typeof createNumberOfIslandsRecorder>
    | ReturnType<typeof createSurroundedRegionsRecorder>
    | ReturnType<typeof createWallsAndGatesRecorder>
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

export function buildDepthFirstSearchTrace(
  graph: PathfindingGraphInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions.dfs;
  const normalizedGraph = normalizeGraphInput(graph, "dfs") as PathfindingGraphInput;
  const adjacency = buildAdjacency(normalizedGraph);
  const distances = Object.fromEntries(
    normalizedGraph.nodes.map((node) => [node, Number.POSITIVE_INFINITY])
  ) as Record<string, number>;
  const previousByNode: Record<string, string> = {};
  const frontier: string[] = [normalizedGraph.start];
  const discovered = new Set<string>([normalizedGraph.start]);
  const settled = new Set<string>();
  const recorder = createDepthFirstSearchRecorder(normalizedGraph);
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
  ): DepthFirstSearchRuntimeState => ({
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
      "The traversal begins with the source node stacked as the first depth-first checkpoint and every other node unresolved.",
    explanation: {
      summary: "Seed the traversal stack with the source node before any edges are inspected.",
      details:
        "The recorded frontier is serialized in top-first stack order so replay and persistence consumers agree on the next expansion point.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(normalizedGraph.start, [], []),
    metrics,
    highlights: [
      {
        key: "dfs-start-node",
        path: `state.distances.${normalizedGraph.start}`,
        kind: "node",
        intent: "focus",
        label: `Source node ${normalizedGraph.start}`
      }
    ]
  });

  while (frontier.length > 0) {
    const current = frontier.pop()!;
    syncMetrics(metrics, {
      settled: Array.from(settled),
      frontier: projectDepthFirstFrontier(frontier)
    });

    recorder.push({
      phase: "Extract",
      description: `Node ${current} is popped from the stack and becomes the active depth-first expansion point.`,
      explanation: {
        summary: "Expand the most recently stacked node to preserve deterministic depth-first order.",
        details:
          "The stack is projected directly into replay-safe frontier snapshots, so scrubbing never depends on re-running hidden push and pop operations.",
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
          key: `dfs-current-${current}`,
          path: `state.distances.${current}`,
          kind: "node",
          intent: "active",
          label: `Expand node ${current}`
        }
      ]
    });

    if (normalizedGraph.target !== null && current === normalizedGraph.target) {
      settled.add(current);
      syncMetrics(metrics, {
        settled: Array.from(settled),
        frontier: projectDepthFirstFrontier(frontier)
      });

      recorder.push({
        phase: "Checkpoint",
        description:
          `Node ${current} satisfied the target, so the stack freezes here and replay can jump directly to the recovered route state.`,
        explanation: {
          summary: "Seal the target node into the settled set before publishing the final route.",
          details:
            "Stopping on the first popped target preserves the exact predecessor chain captured by the deterministic stack discipline.",
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
            key: `dfs-settled-${current}`,
            path: "state.settled",
            kind: "node",
            intent: "visited",
            label: `Settled ${current}`
          }
        ]
      });

      break;
    }

    const outgoingEdges = adjacency.get(current) ?? [];

    for (let index = outgoingEdges.length - 1; index >= 0; index -= 1) {
      const edge = outgoingEdges[index]!;
      metrics.inspections += 1;
      const hasDiscovered = discovered.has(edge.to);

      if (!hasDiscovered) {
        discovered.add(edge.to);
        distances[edge.to] = distances[current]! + 1;
        previousByNode[edge.to] = current;
        frontier.push(edge.to);
        metrics.updates += 1;
      }

      syncMetrics(metrics, {
        settled: Array.from(settled),
        frontier: projectDepthFirstFrontier(frontier)
      });

      recorder.push({
        phase: hasDiscovered ? "Inspect" : "Discover",
        description: hasDiscovered
          ? `Node ${edge.to} was already discovered at depth ${formatGraphDistance(
              Number.isFinite(distances[edge.to]!) ? distances[edge.to]! : null
            )}, so the existing stack order stays intact.`
          : `Node ${edge.to} is discovered at depth ${distances[edge.to]} and pushed onto the depth-first stack.`,
        explanation: {
          summary: hasDiscovered
            ? "Inspect the edge without changing the recorded predecessor chain or stack order."
            : "Record the first route to an undiscovered neighbor and push it onto the stack.",
          details: hasDiscovered
            ? `Because ${edge.to} already has a recorded discovery route, revisiting this edge cannot change the deterministic DFS trace.`
            : `Depth-first traversal commits ${current} as the predecessor for ${edge.to} the first time that neighbor is stacked.`,
          tags: ["edge", hasDiscovered ? "focus" : "frontier"]
        },
        runtimeState: createRuntimeState(
          current,
          [current, edge.to],
          reconstructPath(
            previousByNode,
            normalizedGraph.start,
            hasDiscovered ? current : edge.to
          )
        ),
        metrics,
        highlights: [
          {
            key: `dfs-edge-${current}-${edge.to}-${metrics.inspections}`,
            path: "state.activeEdge",
            kind: "edge",
            intent: hasDiscovered ? "focus" : "frontier",
            label: `${current} -> ${edge.to}`
          }
        ]
      });
    }

    settled.add(current);
    syncMetrics(metrics, {
      settled: Array.from(settled),
      frontier: projectDepthFirstFrontier(frontier)
    });

    recorder.push({
      phase: "Checkpoint",
      description:
        `Node ${current} has finished expanding, so replay can restore the settled set and remaining stack without recomputing earlier pushes.`,
      explanation: {
        summary: "Seal the expanded node into the settled set after its outgoing edges are inspected.",
        details:
          "This checkpoint captures the predecessor ledger and top-first stack order together, which keeps depth-first replay deterministic across the same graph input.",
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
          key: `dfs-settled-${current}`,
          path: "state.settled",
          kind: "node",
          intent: "visited",
          label: `Settled ${current}`
        }
      ]
    });
  }

  const finalPath = reconstructPath(previousByNode, normalizedGraph.start, normalizedGraph.target);
  const outcome = describeTraversalOutcome(normalizedGraph, finalPath);
  syncMetrics(metrics, {
    settled: Array.from(settled),
    frontier: projectDepthFirstFrontier(frontier)
  });

  recorder.push({
    phase: outcome.phase,
    description: outcome.description,
    explanation: outcome.explanation,
    runtimeState: createRuntimeState(normalizedGraph.target, [], finalPath),
    metrics,
    highlights: [
      {
        key: "dfs-final-path",
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

export function buildCloneGraphTrace(
  graph: PathfindingGraphInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["clone-graph"];
  const normalizedGraph = normalizeGraphInput(graph, "clone-graph") as PathfindingGraphInput;
  const adjacency = buildAdjacency(normalizedGraph);
  const frontier: string[] = [normalizedGraph.start];
  const queued = new Set<string>([normalizedGraph.start]);
  const settled: string[] = [];
  const cloneMap: Record<string, string> = {
    [normalizedGraph.start]: createCloneNodeLabel(normalizedGraph.start)
  };
  const clonedNodes = [normalizedGraph.start];
  const clonedEdges: string[] = [];
  const linkedEdges = new Set<string>();
  let current: string | null = normalizedGraph.start;
  let activeEdge: string[] = [];
  let currentClone: string | null = cloneMap[normalizedGraph.start]!;
  let fullyCloned: boolean | null = null;
  const recorder = createCloneGraphRecorder(normalizedGraph);
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: 1,
    inspections: 0,
    updates: 1
  };

  const createRuntimeState = (): CloneGraphRuntimeState => ({
    nodes: normalizedGraph.nodes,
    edges: normalizedGraph.edges,
    settled,
    frontier,
    current,
    activeEdge,
    cloneMap,
    clonedNodes,
    clonedEdges,
    currentClone,
    unreachableNodes: findUnreachableGraphNodes(normalizedGraph.nodes, cloneMap),
    fullyCloned
  });

  recorder.push({
    phase: "Initialization",
    description:
      "Seed the clone ledger with the entry node so replay can rebuild the reachable component without live object references.",
    explanation: {
      summary: "Create the first clone from the start node before any neighbor links are inspected.",
      details:
        "Replay records the original-to-clone mapping directly, which keeps clone construction serialization-safe and deterministic frame by frame.",
      tags: ["snapshot", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "clone-graph-start",
        path: `state.cloneMap.${normalizedGraph.start}`,
        kind: "node",
        intent: "focus",
        label: `Clone ${normalizedGraph.start}`
      }
    ]
  });

  while (frontier.length > 0) {
    current = frontier.shift()!;
    queued.delete(current);
    currentClone = cloneMap[current]!;
    metrics.frontier = frontier.length;
    metrics.settled = settled.length;

    recorder.push({
      phase: "Extract",
      description: `Original node ${current} becomes the active source while replay fills clone ${currentClone}.`,
      explanation: {
        summary: "Pop the next reachable original node from the queue and continue building its clone adjacency.",
        details:
          "The frontier stores original nodes, not clone instances, so replay can explain traversal and clone construction separately.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `clone-graph-current-${current}`,
          path: `state.cloneMap.${current}`,
          kind: "node",
          intent: "active",
          label: `Expand ${current}`
        }
      ]
    });

    for (const edge of adjacency.get(current) ?? []) {
      activeEdge = [current, edge.to];
      metrics.inspections += 1;

      const createdClone = !(edge.to in cloneMap);
      if (createdClone) {
        cloneMap[edge.to] = createCloneNodeLabel(edge.to);
        clonedNodes.push(edge.to);

        if (!queued.has(edge.to)) {
          frontier.push(edge.to);
          queued.add(edge.to);
        }

        metrics.updates += 1;
      }

      const linkLabel = createCloneEdgeLabel(current, edge.to, normalizedGraph.directed);
      const linkedClone = !linkedEdges.has(linkLabel);
      if (linkedClone) {
        linkedEdges.add(linkLabel);
        clonedEdges.push(linkLabel);
        metrics.updates += 1;
      }

      currentClone = cloneMap[current]!;
      metrics.frontier = frontier.length;
      metrics.settled = settled.length;

      recorder.push({
        phase: createdClone ? "Clone" : linkedClone ? "Link" : "Inspect",
        description: createdClone
          ? `Allocate clone ${cloneMap[edge.to]!} and queue original node ${edge.to} for its own adjacency replay.`
          : linkedClone
            ? `Link clone ${currentClone} to ${cloneMap[edge.to]!} without allocating a new clone node.`
            : `Inspect edge ${current}-${edge.to} without changing the existing clone ledger.`,
        explanation: {
          summary: createdClone
            ? "Allocate a neighbor clone the first time replay reaches that original node."
            : linkedClone
              ? "Commit the clone-to-clone edge once both endpoint clones already exist."
              : "Skip duplicate clone work when both the node and the edge were already recorded earlier.",
          details: createdClone
            ? `Replay records both the new clone label and the queued original node in one frame so clone construction never depends on hidden object allocation.`
            : linkedClone
              ? `The cloned edge ledger stays explicit, which keeps undirected deduplication and directed edge direction stable across replays.`
              : `Because ${edge.to} already has a clone and ${linkLabel} is already recorded, this frame stays read-only.`,
          tags: ["edge", createdClone || linkedClone ? "frontier" : "focus"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `clone-graph-edge-${current}-${edge.to}-${metrics.inspections}`,
            path: "state.activeEdge",
            kind: "edge",
            intent: createdClone || linkedClone ? "frontier" : "focus",
            label: `${current} -> ${edge.to}`
          }
        ]
      });
    }

    settled.push(current);
    activeEdge = [];
    metrics.settled = settled.length;
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Checkpoint",
      description: `Node ${current} and clone ${currentClone} now have a fully recorded adjacency ledger.`,
      explanation: {
        summary: "Seal the active original node after every neighbor inspection is recorded.",
        details:
          "This checkpoint captures the settled originals, queued originals, and accumulated clone map together so replay can jump directly to any finished clone boundary.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `clone-graph-settled-${current}`,
          path: "state.settled",
          kind: "node",
          intent: "visited",
          label: `Settled ${current}`
        }
      ]
    });
  }

  current = null;
  activeEdge = [];
  currentClone = null;
  fullyCloned = Object.keys(cloneMap).length === normalizedGraph.nodes.length;
  metrics.frontier = 0;
  metrics.settled = settled.length;

  const unreachableNodes = findUnreachableGraphNodes(normalizedGraph.nodes, cloneMap);

  recorder.push({
    phase: "Resolution",
    description: fullyCloned
      ? `Cloned all ${clonedNodes.length} reachable nodes and ${clonedEdges.length} clone links from the entry component.`
      : `Cloned the entry component and left ${unreachableNodes.length} unreachable node${unreachableNodes.length === 1 ? "" : "s"} outside the clone ledger.`,
    explanation: {
      summary: fullyCloned
        ? "Publish the completed clone map for the entire graph."
        : "Publish the completed clone map for the reachable component and the explicit unreachable-node ledger.",
      details: fullyCloned
        ? "The terminal frame keeps the original-to-clone mapping and clone-edge ledger explicit, so replay never depends on live references to explain the copied graph."
        : "Disconnected inputs stay deterministic because replay records both the cloned component and the untouched originals that never entered the queue.",
      tags: ["result", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "clone-graph-final",
        path: fullyCloned ? "state.cloneMap" : "state.unreachableNodes",
        kind: "collection",
        intent: "result",
        label: fullyCloned ? "Clone complete" : "Partial clone coverage"
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedGraph, recorder);
}

export function buildGraphValidTreeTrace(
  input: GraphValidTreeInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["graph-valid-tree"];
  const normalizedInput = normalizeGraphInput(input, "graph-valid-tree") as GraphValidTreeInput;
  const edgeLabels = normalizedInput.edges.map((edge, index) => createTreeEdgeLabel(edge, index));
  const frontier = edgeLabels.slice();
  const parents = Array.from({ length: normalizedInput.nodeCount }, (_, index) => index);
  const ranks = Array.from({ length: normalizedInput.nodeCount }, () => 0);
  const settled: string[] = [];
  const acceptedEdges: string[] = [];
  const rejectedEdges: string[] = [];
  let current: string | null = null;
  let activeEdge: string[] = [];
  let currentRoots: string[] = [];
  let componentCount = normalizedInput.nodeCount;
  let isTree: boolean | null = null;
  let failureReason: string | null = null;
  const recorder = createGraphValidTreeRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: frontier.length,
    inspections: 0,
    updates: 0
  };

  const createRuntimeState = (): GraphValidTreeRuntimeState => ({
    nodeCount: normalizedInput.nodeCount,
    edges: normalizedInput.edges,
    parents,
    ranks,
    settled,
    frontier,
    current,
    activeEdge,
    currentRoots,
    acceptedEdges,
    rejectedEdges,
    componentCount,
    isTree,
    failureReason
  });

  recorder.push({
    phase: "Initialization",
    description:
      "Each node starts as its own representative and the edge queue stays in input order for deterministic tree validation replay.",
    explanation: {
      summary: "Seed the Union-Find ledger with one singleton component per node.",
      details:
        "Replay stores the parent and rank ledgers directly, so union decisions stay serializable and deterministic without hidden mutable state.",
      tags: ["snapshot", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "graph-valid-tree-init",
        path: "state.components",
        kind: "collection",
        intent: "focus",
        label: `${normalizedInput.nodeCount} singleton components`
      }
    ]
  });

  for (let index = 0; index < normalizedInput.edges.length; index += 1) {
    const edge = normalizedInput.edges[index]!;
    const edgeLabel = edgeLabels[index]!;
    current = edgeLabel;
    activeEdge = [String(edge[0]), String(edge[1])];
    frontier.shift();
    const leftRoot = findTreeRoot(parents, edge[0]);
    const rightRoot = findTreeRoot(parents, edge[1]);
    currentRoots = [String(leftRoot), String(rightRoot)];
    metrics.inspections += 1;
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Inspect",
      description: `Inspect edge ${edge[0]}-${edge[1]} and compare roots ${leftRoot} and ${rightRoot}.`,
      explanation: {
        summary: "Read both representatives before deciding whether the edge preserves tree validity.",
        details:
          "Because the edge queue is deterministic and root comparisons are recorded explicitly, replay can explain every union or rejection without rerunning Union-Find.",
        tags: ["edge", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `graph-valid-tree-inspect-${index}`,
          path: "state.activeEdge",
          kind: "edge",
          intent: "active",
          label: edgeLabel
        }
      ]
    });

    if (leftRoot === rightRoot) {
      rejectedEdges.push(edgeLabel);
      failureReason ??= `Cycle closes on edge ${edge[0]}-${edge[1]}.`;
      isTree = false;

      recorder.push({
        phase: "Reject",
        description: `Reject edge ${edge[0]}-${edge[1]} because both endpoints already share component ${leftRoot}.`,
        explanation: {
          summary: "A same-component edge would create a cycle, so it stays out of the accepted forest.",
          details:
            "Rejected edges remain explicit in the state payload so replay can explain invalidity with recorded evidence instead of inferred cycle detection.",
          tags: ["edge", "candidate"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `graph-valid-tree-reject-${index}`,
            path: "state.rejectedEdges",
            kind: "collection",
            intent: "candidate",
            label: `Rejected ${edge[0]}-${edge[1]}`
          }
        ]
      });
    } else {
      let parentRoot = leftRoot;
      let childRoot = rightRoot;

      if (
        ranks[leftRoot]! < ranks[rightRoot]! ||
        (ranks[leftRoot] === ranks[rightRoot] && leftRoot > rightRoot)
      ) {
        parentRoot = rightRoot;
        childRoot = leftRoot;
      }

      parents[childRoot] = parentRoot;
      if (ranks[leftRoot] === ranks[rightRoot]) {
        ranks[parentRoot] = ranks[parentRoot]! + 1;
      }
      acceptedEdges.push(edgeLabel);
      componentCount -= 1;
      metrics.updates += 1;
      currentRoots = [String(findTreeRoot(parents, edge[0])), String(findTreeRoot(parents, edge[1]))];

      recorder.push({
        phase: "Union",
        description: `Accept edge ${edge[0]}-${edge[1]} and merge component ${childRoot} into representative ${parentRoot}.`,
        explanation: {
          summary: "Commit one union because the edge connects two separate components.",
          details:
            "The updated parent and rank ledgers are recorded in the same frame as the accepted edge so replay can reopen the merged component structure directly.",
          tags: ["edge", "frontier"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `graph-valid-tree-union-${index}`,
            path: "state.acceptedEdges",
            kind: "collection",
            intent: "frontier",
            label: `Accepted ${edge[0]}-${edge[1]}`
          }
        ]
      });
    }

    settled.push(edgeLabel);
    metrics.settled = settled.length;

    recorder.push({
      phase: "Checkpoint",
      description: `Edge ${edge[0]}-${edge[1]} is fully recorded in the validation ledger.`,
      explanation: {
        summary: "Seal the accepted or rejected edge decision before moving to the next queued edge.",
        details:
          "This checkpoint stores the remaining edge queue, component groups, and Union-Find ledgers together so replay can scrub edge by edge without hidden transitions.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `graph-valid-tree-settled-${index}`,
          path: "state.settled",
          kind: "collection",
          intent: "visited",
          label: edgeLabel
        }
      ]
    });
  }

  current = null;
  activeEdge = [];
  currentRoots = [];

  if (
    rejectedEdges.length === 0 &&
    componentCount === 1 &&
    acceptedEdges.length === normalizedInput.nodeCount - 1
  ) {
    isTree = true;
    failureReason = null;
  } else if (failureReason === null) {
    failureReason =
      acceptedEdges.length < normalizedInput.nodeCount - 1
        ? `Accepted ${acceptedEdges.length} edges across ${componentCount} components, so the graph stays disconnected.`
        : `Accepted ${acceptedEdges.length} edges but the components never collapsed into one tree.`;
    isTree = false;
  } else {
    isTree = false;
  }

  recorder.push({
    phase: isTree ? "Resolution" : "Invalid",
    description: isTree
      ? `Accepted ${acceptedEdges.length} edges and connected all ${normalizedInput.nodeCount} nodes without a cycle.`
      : failureReason!,
    explanation: {
      summary: isTree
        ? "Publish the accepted forest once it proves one connected acyclic tree."
        : "Publish the rejected edges or remaining components that prove the graph is not a valid tree.",
      details: isTree
        ? "The terminal frame stores the merged component ledger directly, so replay never needs to recompute connectivity to justify the result."
        : "The terminal frame keeps both the component ledger and the accepted-versus-rejected edge lists explicit so replay can explain the failure source without recomputation.",
      tags: ["result", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "graph-valid-tree-final",
        path: isTree
          ? "state.acceptedEdges"
          : rejectedEdges.length > 0
            ? "state.rejectedEdges"
            : "state.components",
        kind: "collection",
        intent: "result",
        label: isTree ? "Valid tree" : "Invalid tree"
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
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

export function buildNumberOfIslandsTrace(
  input: NumberOfIslandsInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["number-of-islands"];
  const normalizedInput = normalizeNumberOfIslandsInput(input);
  const grid = cloneGrid(normalizedInput.grid);
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  const remainingLand = new Set<string>();
  const settled: string[] = [];
  const frontier: string[] = [];
  const completedIslands: string[][] = [];
  const cellIslands: Record<string, number> = {};
  const recorder = createNumberOfIslandsRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: 0,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let activeEdge: string[] = [];
  let scan: string | null = null;
  let islandCount = 0;
  let activeIslandId: number | null = null;
  let activeIsland: string[] = [];

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      if (grid[row]![column] === "1") {
        remainingLand.add(makeCellId(row, column));
      }
    }
  }

  const createRuntimeState = (): NumberOfIslandsRuntimeState => ({
    grid,
    settled,
    frontier,
    current,
    activeEdge,
    scan,
    islandCount,
    activeIslandId,
    activeIsland,
    completedIslands,
    cellIslands,
    remainingLand
  });

  recorder.push({
    phase: "Initialization",
    description:
      "The grid scan records every unresolved land cell before traversal starts so replay can restore both the scan cursor and component state without rebuilding visited sets.",
    explanation: {
      summary: "Seed the remaining-land ledger before the first row-major scan step.",
      details:
        "The opening frame stores the full grid and every unresolved land coordinate directly so replay never has to infer which cells are still waiting for island discovery.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "number-of-islands-initial",
        path: "state.remainingLand",
        kind: "collection",
        intent: "focus",
        label: `${remainingLand.size} land cell${remainingLand.size === 1 ? "" : "s"} awaiting scan`
      }
    ]
  });

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      const cell = makeCellId(row, column);
      const value = grid[row]![column]!;
      scan = cell;
      current = null;
      activeEdge = [];
      metrics.frontier = frontier.length;

      if (value === "0") {
        recorder.push({
          phase: "Scan",
          description: `Scan ${formatCellLabel(cell)} and skip water because it cannot start a new island.`,
          explanation: {
            summary: "Advance the row-major scan across water without creating a frontier.",
            details:
              "Water still gets its own checkpoint so replay can explain why this cell did not contribute to the island count.",
            tags: ["scan", "focus"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `number-of-islands-water-${cell}`,
              path: "state.scan",
              kind: "node",
              intent: "candidate",
              label: `Water ${formatCellLabel(cell)}`
            }
          ]
        });
        continue;
      }

      if (!remainingLand.has(cell)) {
        recorder.push({
          phase: "Scan",
          description: `Scan ${formatCellLabel(cell)} and keep moving because that land already belongs to island ${cellIslands[cell] ?? "?"}.`,
          explanation: {
            summary: "Advance the row-major scan past land that was already claimed during an earlier island traversal.",
            details:
              "Replay records these passes explicitly so the scan order stays deterministic even after a flood-fill consumes multiple later cells at once.",
            tags: ["scan", "visited"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `number-of-islands-claimed-${cell}`,
              path: "state.scan",
              kind: "node",
              intent: "visited",
              label: `Island ${cellIslands[cell] ?? "?"} already claimed ${formatCellLabel(cell)}`
            }
          ]
        });
        continue;
      }

      islandCount += 1;
      activeIslandId = islandCount;
      activeIsland = [cell];
      frontier.push(cell);
      remainingLand.delete(cell);
      cellIslands[cell] = activeIslandId;
      metrics.frontier = frontier.length;
      metrics.updates += 1;

      recorder.push({
        phase: "Seed Island",
        description: `Land ${formatCellLabel(cell)} starts island ${activeIslandId} and becomes the first frontier cell.`,
        explanation: {
          summary: "Start a new island when the row-major scan reaches unresolved land.",
          details:
            "The seed cell is claimed immediately so replay can show the island count rising before the rest of the component is explored.",
          tags: ["scan", "frontier"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `number-of-islands-seed-${cell}`,
            path: "state.activeIsland",
            kind: "collection",
            intent: "frontier",
            label: `Island ${activeIslandId} seeded at ${formatCellLabel(cell)}`
          }
        ]
      });

      scan = null;

      while (frontier.length > 0) {
        const currentCell = frontier.shift();

        if (!currentCell) {
          break;
        }

        current = currentCell;
        activeEdge = [];
        metrics.frontier = frontier.length;

        recorder.push({
          phase: "Extract",
          description: `Island ${activeIslandId} expands from ${formatCellLabel(currentCell)} in deterministic queue order.`,
          explanation: {
            summary: "Expand the next claimed land cell from the active island frontier.",
            details:
              "The queue order is recorded before neighbor checks begin so replay can follow the connected component one land cell at a time.",
            tags: ["frontier", "focus"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `number-of-islands-current-${currentCell}`,
              path: "state.current",
              kind: "node",
              intent: "active",
              label: `Explore ${formatCellLabel(currentCell)}`
            }
          ]
        });

        const { row: currentRow, column: currentColumn } = parseCellId(currentCell);

        for (const neighbor of getNeighborCellIds(currentRow, currentColumn, rowCount, columnCount)) {
          const { row: neighborRow, column: neighborColumn } = parseCellId(neighbor);
          const neighborValue = grid[neighborRow]![neighborColumn]!;
          activeEdge = [currentCell, neighbor];
          metrics.inspections += 1;

          if (neighborValue === "0") {
            recorder.push({
              phase: "Inspect",
              description: `Inspect ${formatCellLabel(neighbor)} and stop because water breaks the current island boundary.`,
              explanation: {
                summary: "Inspect a neighboring water cell without growing the island frontier.",
                details:
                  "Water adjacency is recorded explicitly so replay can explain why the current component does not cross that boundary.",
                tags: ["edge", "focus"]
              },
              runtimeState: createRuntimeState(),
              metrics,
              highlights: [
                {
                  key: `number-of-islands-water-edge-${currentCell}-${neighbor}-${metrics.inspections}`,
                  path: `state.grid.${neighborRow}.${neighborColumn}`,
                  kind: "node",
                  intent: "candidate",
                  label: `Water ${formatCellLabel(neighbor)}`
                }
              ]
            });
            continue;
          }

          if (!remainingLand.has(neighbor)) {
            recorder.push({
              phase: "Inspect",
              description: `Inspect ${formatCellLabel(neighbor)} and keep the frontier stable because island ${cellIslands[neighbor] ?? activeIslandId} already claimed it.`,
              explanation: {
                summary: "Inspect previously claimed land without re-enqueuing it.",
                details:
                  "This keeps component membership deterministic and prevents replay from inferring deduplication from hidden visited state.",
                tags: ["edge", "visited"]
              },
              runtimeState: createRuntimeState(),
              metrics,
              highlights: [
                {
                  key: `number-of-islands-claimed-edge-${currentCell}-${neighbor}-${metrics.inspections}`,
                  path: `state.cellIslands.${neighbor}`,
                  kind: "node",
                  intent: "visited",
                  label: `Island ${cellIslands[neighbor] ?? activeIslandId}`
                }
              ]
            });
            continue;
          }

          frontier.push(neighbor);
          activeIsland.push(neighbor);
          remainingLand.delete(neighbor);
          cellIslands[neighbor] = activeIslandId;
          metrics.frontier = frontier.length;
          metrics.updates += 1;

          recorder.push({
            phase: "Expand",
            description: `Land ${formatCellLabel(neighbor)} joins island ${activeIslandId} and enters the frontier.`,
            explanation: {
              summary: "Claim one neighboring land cell and append it to the active frontier.",
              details:
                "The recorded state includes the frontier queue, island membership, and remaining unresolved land so replay never rebuilds connected components from scratch.",
              tags: ["edge", "frontier"]
            },
            runtimeState: createRuntimeState(),
            metrics,
            highlights: [
              {
                key: `number-of-islands-expand-${currentCell}-${neighbor}-${metrics.updates}`,
                path: `state.cellIslands.${neighbor}`,
                kind: "node",
                intent: "frontier",
                label: `Island ${activeIslandId} claims ${formatCellLabel(neighbor)}`
              }
            ]
          });
        }

        settled.push(currentCell);
        current = currentCell;
        activeEdge = [];
        metrics.settled = settled.length;
        metrics.frontier = frontier.length;

        recorder.push({
          phase: "Checkpoint",
          description: `${formatCellLabel(currentCell)} is fully processed inside island ${activeIslandId}.`,
          explanation: {
            summary: "Seal one land cell after all of its neighbor inspections are recorded.",
            details:
              "This checkpoint preserves the component frontier and processed land ledger directly so replay can jump to any flood-fill boundary.",
            tags: ["checkpoint", "visited"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `number-of-islands-settled-${currentCell}`,
              path: "state.settled",
              kind: "collection",
              intent: "visited",
              label: `${formatCellLabel(currentCell)} settled`
            }
          ]
        });
      }

      completedIslands.push(activeIsland.slice());
      current = null;
      activeEdge = [];
      metrics.frontier = frontier.length;

      recorder.push({
        phase: "Island Complete",
        description: `Island ${activeIslandId} closes with ${activeIsland.length} land cell${activeIsland.length === 1 ? "" : "s"}.`,
        explanation: {
          summary: "Publish the completed connected component before the row-major scan resumes.",
          details:
            "Replay stores the full component membership so later scan steps can explain why those cells no longer start new islands.",
          tags: ["checkpoint", "result"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `number-of-islands-complete-${activeIslandId}`,
            path: "state.completedIslands",
            kind: "collection",
            intent: "result",
            label: `Island ${activeIslandId} complete`
          }
        ]
      });

      activeIslandId = null;
      activeIsland = [];
    }
  }

  scan = null;
  current = null;
  activeEdge = [];
  metrics.frontier = frontier.length;

  recorder.push({
    phase: "Resolution",
    description: `The full row-major scan completes with ${islandCount} island${islandCount === 1 ? "" : "s"} discovered.`,
    explanation: {
      summary: "Publish the terminal island count once every grid cell has been scanned or claimed.",
      details:
        "The terminal frame preserves the final component ledger, per-cell island assignments, and remaining-land set directly so replay can explain the final count without rerunning traversal.",
      tags: ["result", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "number-of-islands-final",
        path: "state.islandCount",
        kind: "node",
        intent: "result",
        label: `${islandCount} island${islandCount === 1 ? "" : "s"} total`
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

export function buildSurroundedRegionsTrace(
  input: SurroundedRegionsInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["surrounded-regions"];
  const normalizedInput = normalizeSurroundedRegionsInput(input);
  const grid = cloneGrid(normalizedInput.grid);
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  const settled: string[] = [];
  const frontier: string[] = [];
  const boundarySeeds: string[] = [];
  const safeCells: string[] = [];
  const capturedCells: string[] = [];
  const remainingOpen = new Set<string>();
  const recorder = createSurroundedRegionsRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: 0,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let activeEdge: string[] = [];
  let phaseMode: "mark-safe" | "capture" | "resolved" = "mark-safe";
  let capturedAny: boolean | null = null;

  const safeSet = new Set<string>();

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      const cell = makeCellId(row, column);
      const value = grid[row]![column]!;

      if (value !== "O") {
        continue;
      }

      const isBoundary = row === 0 || column === 0 || row === rowCount - 1 || column === columnCount - 1;

      if (isBoundary) {
        if (!safeSet.has(cell)) {
          safeSet.add(cell);
          boundarySeeds.push(cell);
          safeCells.push(cell);
          frontier.push(cell);
        }
      } else {
        remainingOpen.add(cell);
      }
    }
  }

  metrics.frontier = frontier.length;
  metrics.updates = safeCells.length;

  const createRuntimeState = (): SurroundedRegionsRuntimeState => ({
    grid,
    settled,
    frontier,
    current,
    activeEdge,
    phaseMode,
    boundarySeeds,
    safeCells,
    capturedCells,
    remainingOpen,
    capturedAny
  });

  recorder.push({
    phase: "Initialization",
    description:
      "Seed the border-connected O cells before traversal starts so replay can separate safe regions from enclosed regions deterministically.",
    explanation: {
      summary: "Record the boundary O frontier and the unresolved interior O ledger before any flood-fill step begins.",
      details:
        "The opening frame stores both the safe-entry queue and the remaining open cells directly, so replay never reconstructs border reachability from hidden visited state.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "surrounded-regions-initial",
        path: boundarySeeds.length > 0 ? "state.boundarySeeds" : "state.remainingOpen",
        kind: "collection",
        intent: "focus",
        label:
          boundarySeeds.length > 0
            ? `${boundarySeeds.length} border seed${boundarySeeds.length === 1 ? "" : "s"} ready`
            : `${remainingOpen.size} enclosed candidate${remainingOpen.size === 1 ? "" : "s"} pending capture`
      }
    ]
  });

  while (frontier.length > 0) {
    const currentCell = frontier.shift();

    if (!currentCell) {
      break;
    }

    current = currentCell;
    activeEdge = [];
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Extract",
      description: `${formatCellLabel(currentCell)} leaves the safe frontier and becomes the next border-connected cell under inspection.`,
      explanation: {
        summary: "Expand the next border-connected O cell in deterministic row-major queue order.",
        details:
          "Replay stores the active frontier cell before neighbor checks begin so the safe-region flood fill stays explicit rather than inferred.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `surrounded-regions-current-${currentCell}`,
          path: "state.current",
          kind: "node",
          intent: "active",
          label: `Protect ${formatCellLabel(currentCell)}`
        }
      ]
    });

    const { row: currentRow, column: currentColumn } = parseCellId(currentCell);

    for (const neighbor of getNeighborCellIds(currentRow, currentColumn, rowCount, columnCount)) {
      const { row: neighborRow, column: neighborColumn } = parseCellId(neighbor);
      const neighborValue = grid[neighborRow]![neighborColumn]!;
      activeEdge = [currentCell, neighbor];
      metrics.inspections += 1;

      if (neighborValue === "X") {
        recorder.push({
          phase: "Inspect",
          description: `Inspect ${formatCellLabel(neighbor)} and stop because an X wall blocks the safe-region flood fill.`,
          explanation: {
            summary: "Inspect a blocked neighboring cell without changing the safe frontier.",
            details:
              "Blocked walls stay explicit in the trace so replay can explain why the current safe region does not cross that boundary.",
            tags: ["edge", "focus"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `surrounded-regions-wall-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: `state.grid.${neighborRow}.${neighborColumn}`,
              kind: "node",
              intent: "candidate",
              label: `Wall ${formatCellLabel(neighbor)}`
            }
          ]
        });
        continue;
      }

      if (safeSet.has(neighbor)) {
        recorder.push({
          phase: "Inspect",
          description: `Inspect ${formatCellLabel(neighbor)} and keep the frontier stable because it is already marked safe.`,
          explanation: {
            summary: "Inspect previously protected O without re-enqueuing it.",
            details:
              "This keeps the safe-region ledger deterministic and prevents replay from inferring deduplication from hidden visited state.",
            tags: ["edge", "visited"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `surrounded-regions-safe-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: "state.safeCells",
              kind: "collection",
              intent: "visited",
              label: `${formatCellLabel(neighbor)} already safe`
            }
          ]
        });
        continue;
      }

      safeSet.add(neighbor);
      safeCells.push(neighbor);
      frontier.push(neighbor);
      remainingOpen.delete(neighbor);
      metrics.frontier = frontier.length;
      metrics.updates += 1;

      recorder.push({
        phase: "Mark Safe",
        description: `${formatCellLabel(neighbor)} stays O because the border-connected flood fill reaches it from ${formatCellLabel(currentCell)}.`,
        explanation: {
          summary: "Protect one neighboring O by adding it to the safe-region frontier.",
          details:
            "Replay removes the cell from the unresolved-open ledger and appends it to the safe frontier in the same frame so capture never depends on recomputation.",
          tags: ["edge", "frontier"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `surrounded-regions-mark-safe-${currentCell}-${neighbor}-${metrics.updates}`,
            path: "state.safeCells",
            kind: "collection",
            intent: "frontier",
            label: `Protect ${formatCellLabel(neighbor)}`
          }
        ]
      });
    }

    settled.push(currentCell);
    activeEdge = [];
    metrics.settled = settled.length;
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Checkpoint",
      description: `${formatCellLabel(currentCell)} is fully processed inside the border-connected safe region.`,
      explanation: {
        summary: "Seal one safe cell after all of its neighbor inspections are recorded.",
        details:
          "This checkpoint preserves the safe frontier, protected-cell ledger, and unresolved-open set directly so replay can jump to any flood-fill boundary.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `surrounded-regions-settled-${currentCell}`,
          path: "state.settled",
          kind: "collection",
          intent: "visited",
          label: `${formatCellLabel(currentCell)} settled`
        }
      ]
    });
  }

  phaseMode = "capture";
  current = null;
  activeEdge = [];
  frontier.push(...Array.from(remainingOpen).sort(compareCellIds));
  metrics.frontier = frontier.length;

  recorder.push({
    phase: "Capture Phase",
    description:
      frontier.length > 0
        ? `${frontier.length} enclosed O cell${frontier.length === 1 ? "" : "s"} remain and move into deterministic row-major capture order.`
        : "No enclosed O cells remain, so capture can finish without flipping the grid.",
    explanation: {
      summary: "Switch from safe-region discovery to deterministic capture of every unresolved enclosed cell.",
      details:
        "Replay serializes the pending capture queue directly so the final flips stay stable and inspectable one cell at a time.",
      tags: ["checkpoint", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "surrounded-regions-capture-phase",
        path: "state.frontier",
        kind: "collection",
        intent: "focus",
        label:
          frontier.length > 0
            ? `${frontier.length} capture target${frontier.length === 1 ? "" : "s"} queued`
            : "No capture targets"
      }
    ]
  });

  while (frontier.length > 0) {
    const currentCell = frontier.shift();

    if (!currentCell) {
      break;
    }

    current = currentCell;
    activeEdge = [];
    metrics.inspections += 1;

    const { row, column } = parseCellId(currentCell);
    grid[row]![column] = "X";
    remainingOpen.delete(currentCell);
    capturedCells.push(currentCell);
    settled.push(currentCell);
    metrics.updates += 1;
    metrics.settled = settled.length;
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Capture",
      description: `${formatCellLabel(currentCell)} flips from O to X because no border-connected path ever marked it safe.`,
      explanation: {
        summary: "Capture one enclosed region cell in deterministic row-major order.",
        details:
          "The updated grid, captured-cell ledger, and shrinking unresolved-open set are stored together so replay can explain each flip without rerunning the flood fill.",
        tags: ["result", "graph"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `surrounded-regions-capture-${currentCell}`,
          path: `state.grid.${row}.${column}`,
          kind: "node",
          intent: "result",
          label: `Capture ${formatCellLabel(currentCell)}`
        }
      ]
    });
  }

  phaseMode = "resolved";
  current = null;
  activeEdge = [];
  capturedAny = capturedCells.length > 0;
  metrics.frontier = frontier.length;

  recorder.push({
    phase: "Resolution",
    description: capturedAny
      ? `Captured ${capturedCells.length} enclosed O cell${capturedCells.length === 1 ? "" : "s"} while preserving ${safeCells.length} safe border-connected cell${safeCells.length === 1 ? "" : "s"}.`
      : `Every O cell stayed border-connected, so the grid resolves without any captures.`,
    explanation: {
      summary: capturedAny
        ? "Publish the final captured-cell ledger and the preserved safe region."
        : "Publish the final safe-region ledger when no enclosed O cells remain to flip.",
      details: capturedAny
        ? "The terminal frame preserves the final grid, safe cells, and captured cells directly so replay can justify every surviving or flipped region without recomputation."
        : "Because the unresolved-open set is empty, replay can show that every O was reachable from the boundary without performing another flood fill.",
      tags: ["result", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "surrounded-regions-final",
        path: capturedAny ? "state.capturedCells" : "state.safeCells",
        kind: "collection",
        intent: "result",
        label: capturedAny ? "Captured enclosed regions" : "No enclosed regions"
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

export function buildWallsAndGatesTrace(
  input: WallsAndGatesInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["walls-and-gates"];
  const normalizedInput = normalizeWallsAndGatesInput(input);
  const grid = cloneGrid(normalizedInput.grid);
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  const settled: string[] = [];
  const frontier: string[] = [];
  const gates: string[] = [];
  const walls: string[] = [];
  const remainingRooms = new Set<string>();
  const recorder = createWallsAndGatesRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: 0,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let activeEdge: string[] = [];
  let updatedRooms: string[] = [];
  let fullyReachable: boolean | null = null;
  let maxDistance: number | null = null;
  let unreachableRooms: string[] = [];

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      const value = grid[row]![column]!;
      const cell = makeCellId(row, column);

      if (value === 0) {
        gates.push(cell);
        frontier.push(cell);
      } else if (value === -1) {
        walls.push(cell);
      } else {
        remainingRooms.add(cell);
      }
    }
  }

  metrics.frontier = frontier.length;

  const createRuntimeState = (): WallsAndGatesRuntimeState => ({
    grid,
    settled,
    frontier,
    current,
    activeEdge,
    gates,
    walls,
    updatedRooms,
    remainingRooms,
    fullyReachable,
    maxDistance,
    unreachableRooms
  });

  recorder.push({
    phase: "Initialization",
    description:
      "The multi-source BFS records gates, walls, and unresolved rooms before the first queue extraction so replay can restore the map without rebuilding frontier state.",
    explanation: {
      summary: "Seed the gate frontier and the unresolved-room ledger before distance filling begins.",
      details:
        "The opening frame stores the entire grid, the ordered gate queue, and every remaining room directly so replay never reconstructs the initial map from hidden BFS state.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "walls-and-gates-initial",
        path: frontier.length > 0 ? "state.frontier" : "state.remainingRooms",
        kind: "collection",
        intent: "focus",
        label:
          frontier.length > 0
            ? `${frontier.length} gate${frontier.length === 1 ? "" : "s"} queued`
            : `${remainingRooms.size} room${remainingRooms.size === 1 ? "" : "s"} waiting for a gate`
      }
    ]
  });

  if (remainingRooms.size === 0) {
    fullyReachable = true;
    maxDistance = 0;

    recorder.push({
      phase: "Resolution",
      description: "No empty rooms remain, so the map resolves immediately without any distance updates.",
      explanation: {
        summary: "Publish the terminal map immediately when every cell is already a gate or a wall.",
        details:
          "The terminal frame still records the gate and wall ledgers directly so replay can explain why no BFS expansion was required.",
        tags: ["result", "graph"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "walls-and-gates-final-immediate",
          path: "state.maxDistance",
          kind: "node",
          intent: "result",
          label: "All cells already fixed"
        }
      ]
    });

    return buildGraphEnvelope(definition, normalizedInput, recorder);
  }

  while (frontier.length > 0) {
    const currentCell = frontier.shift();

    if (!currentCell) {
      break;
    }

    current = currentCell;
    updatedRooms = [];
    activeEdge = [];
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Extract",
      description: `Cell ${formatCellLabel(currentCell)} becomes the active BFS source for room filling.`,
      explanation: {
        summary: "Expand the next gate or resolved room from the ordered frontier.",
        details:
          "Replay records the active source before neighbor checks begin so the distance wave stays readable without recomputing queue order.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `walls-and-gates-current-${currentCell}`,
          path: "state.current",
          kind: "node",
          intent: "active",
          label: `Fill from ${formatCellLabel(currentCell)}`
        }
      ]
    });

    const { row, column } = parseCellId(currentCell);
    const currentDistance = grid[row]![column]!;

    for (const neighbor of getNeighborCellIds(row, column, rowCount, columnCount)) {
      const { row: neighborRow, column: neighborColumn } = parseCellId(neighbor);
      const neighborValue = grid[neighborRow]![neighborColumn]!;
      activeEdge = [currentCell, neighbor];
      metrics.inspections += 1;

      if (neighborValue === -1 || neighborValue === 0 || neighborValue !== wallsAndGatesInfinity) {
        recorder.push({
          phase: "Inspect",
          description:
            neighborValue === -1
              ? `Inspect ${formatCellLabel(neighbor)} and stop because a wall blocks the current distance wave.`
              : neighborValue === 0
                ? `Inspect ${formatCellLabel(neighbor)} and keep the frontier stable because that cell is already a gate.`
                : `Inspect ${formatCellLabel(neighbor)} and keep the frontier stable because that room already holds distance ${neighborValue}.`,
          explanation: {
            summary:
              neighborValue === -1
                ? "Inspect a wall without extending the frontier."
                : neighborValue === 0
                  ? "Inspect a gate without re-enqueuing it."
                  : "Inspect an already resolved room without replacing its shorter distance.",
            details:
              neighborValue === -1
                ? "Walls stay explicit in the trace so replay can explain why the BFS wave stopped at that boundary."
                : neighborValue === 0
                  ? "Gate cells remain fixed at distance 0, so replay preserves the original multi-source seed without duplicate queue work."
                  : "Previously resolved rooms keep their first recorded distance, which prevents replay from inferring shortest-distance stability from hidden comparisons.",
            tags: ["edge", "focus"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `walls-and-gates-inspect-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: `state.grid.${neighborRow}.${neighborColumn}`,
              kind: "node",
              intent: "candidate",
              label:
                neighborValue === -1
                  ? `Wall ${formatCellLabel(neighbor)}`
                  : neighborValue === 0
                    ? `Gate ${formatCellLabel(neighbor)}`
                    : `Distance ${neighborValue} at ${formatCellLabel(neighbor)}`
            }
          ]
        });
        continue;
      }

      const nextDistance = currentDistance + 1;
      grid[neighborRow]![neighborColumn] = nextDistance;
      frontier.push(neighbor);
      updatedRooms.push(neighbor);
      remainingRooms.delete(neighbor);
      maxDistance = maxDistance === null ? nextDistance : Math.max(maxDistance, nextDistance);
      metrics.updates += 1;
      metrics.frontier = frontier.length;

      recorder.push({
        phase: "Update",
        description: `Room ${formatCellLabel(neighbor)} receives distance ${nextDistance} and joins the frontier.`,
        explanation: {
          summary: "Publish one newly resolved room and enqueue it for the next BFS expansion steps.",
          details:
            "The updated grid and frontier are recorded immediately so replay can jump to any room-distance assignment without replay-time recomputation.",
          tags: ["edge", "frontier"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `walls-and-gates-update-${currentCell}-${neighbor}-${metrics.updates}`,
            path: `state.grid.${neighborRow}.${neighborColumn}`,
            kind: "node",
            intent: "frontier",
            label: `Distance ${nextDistance}`
          }
        ]
      });
    }

    settled.push(currentCell);
    activeEdge = [];
    metrics.settled = settled.length;
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Checkpoint",
      description: `${formatCellLabel(currentCell)} is fully processed for room-filling replay.`,
      explanation: {
        summary: "Seal one BFS source after all of its neighboring cells are recorded.",
        details:
          "This checkpoint captures the updated distance grid, remaining rooms, and queue state directly so replay can jump between frontier boundaries safely.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `walls-and-gates-settled-${currentCell}`,
          path: "state.settled",
          kind: "collection",
          intent: "visited",
          label: `${formatCellLabel(currentCell)} processed`
        }
      ]
    });
  }

  current = null;
  activeEdge = [];
  updatedRooms = [];
  unreachableRooms = Array.from(remainingRooms).sort(compareCellIds);
  fullyReachable = unreachableRooms.length === 0;
  metrics.frontier = frontier.length;

  recorder.push({
    phase: fullyReachable ? "Resolution" : "Stalled",
    description: fullyReachable
      ? `Every room reaches a gate with a maximum recorded distance of ${maxDistance ?? 0}.`
      : `Rooms ${unreachableRooms.map(formatCellLabel).join(", ")} remain unreachable after the frontier empties.`,
    explanation: {
      summary: fullyReachable
        ? "Publish the terminal map once every room has a gate distance."
        : "Publish the unreachable rooms once the BFS frontier can no longer expand.",
      details: fullyReachable
        ? "The terminal frame stores the fully resolved distance grid and the farthest assigned room directly so replay never recomputes the fill depth."
        : "The remaining infinity rooms stay explicit in the terminal frame so replay can explain the blocked layout without rerunning the BFS wave.",
      tags: ["result", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "walls-and-gates-final",
        path: fullyReachable ? "state.maxDistance" : "state.unreachableRooms",
        kind: fullyReachable ? "node" : "collection",
        intent: "result",
        label: fullyReachable
          ? `Max distance ${maxDistance ?? 0}`
          : `Blocked rooms ${unreachableRooms.map(formatCellLabel).join(", ")}`
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
    case "dfs":
      return buildDepthFirstSearchTrace(graph as PathfindingGraphInput);
    case "dijkstra":
      return buildDijkstraTrace(graph as PathfindingGraphInput);
    case "clone-graph":
      return buildCloneGraphTrace(graph as PathfindingGraphInput);
    case "graph-valid-tree":
      return buildGraphValidTreeTrace(graph as GraphValidTreeInput);
    case "course-schedule":
      return buildCourseScheduleTrace(graph as CourseScheduleInput);
    case "rotting-oranges":
      return buildRottingOrangesTrace(graph as RottingOrangesInput);
    case "number-of-islands":
      return buildNumberOfIslandsTrace(graph as NumberOfIslandsInput);
    case "surrounded-regions":
      return buildSurroundedRegionsTrace(graph as SurroundedRegionsInput);
    case "walls-and-gates":
      return buildWallsAndGatesTrace(graph as WallsAndGatesInput);
  }
}

export function formatGraphDistance(distance: number | null): string {
  return distance === null ? "inf" : String(distance);
}
