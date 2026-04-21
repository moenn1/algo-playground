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
  | "network-delay-time"
  | "clone-graph"
  | "graph-valid-tree"
  | "count-connected-components"
  | "redundant-connection"
  | "course-schedule"
  | "course-schedule-ii"
  | "rotting-oranges"
  | "number-of-islands"
  | "max-area-of-island"
  | "island-perimeter"
  | "pacific-atlantic-water-flow"
  | "shortest-bridge"
  | "shortest-path-binary-matrix"
  | "nearest-exit-from-entrance-in-maze"
  | "shortest-path-in-a-grid-with-obstacles-elimination"
  | "minimum-obstacle-removal-to-reach-corner"
  | "swim-in-rising-water"
  | "shortest-path-to-get-food"
  | "01-matrix"
  | "as-far-from-land-as-possible"
  | "map-of-highest-peak"
  | "surrounded-regions"
  | "walls-and-gates";

export const graphAlgorithmIds: GraphAlgorithmId[] = [
  "bfs",
  "dfs",
  "dijkstra",
  "network-delay-time",
  "clone-graph",
  "graph-valid-tree",
  "count-connected-components",
  "redundant-connection",
  "course-schedule",
  "course-schedule-ii",
  "rotting-oranges",
  "number-of-islands",
  "max-area-of-island",
  "island-perimeter",
  "pacific-atlantic-water-flow",
  "shortest-bridge",
  "shortest-path-binary-matrix",
  "nearest-exit-from-entrance-in-maze",
  "shortest-path-in-a-grid-with-obstacles-elimination",
  "minimum-obstacle-removal-to-reach-corner",
  "swim-in-rising-water",
  "shortest-path-to-get-food",
  "01-matrix",
  "as-far-from-land-as-possible",
  "map-of-highest-peak",
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

export interface PacificAtlanticWaterFlowInput extends JsonObject {
  grid: number[][];
}

export interface ShortestBridgeInput extends JsonObject {
  grid: number[][];
}

export interface ShortestPathBinaryMatrixInput extends JsonObject {
  grid: number[][];
}

export interface NearestExitFromEntranceInMazeInput extends JsonObject {
  grid: string[][];
  entrance: [number, number];
}

export interface ShortestPathGridWithObstaclesEliminationInput extends JsonObject {
  grid: number[][];
  eliminations: number;
}

export interface MinimumObstacleRemovalToReachCornerInput extends JsonObject {
  grid: number[][];
}

export interface SwimInRisingWaterInput extends JsonObject {
  grid: number[][];
}

export interface ShortestPathToGetFoodInput extends JsonObject {
  grid: string[][];
}

export interface ZeroOneMatrixInput extends JsonObject {
  grid: number[][];
}

export interface AsFarFromLandAsPossibleInput extends JsonObject {
  grid: number[][];
}

export interface MapOfHighestPeakInput extends JsonObject {
  grid: number[][];
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
  | PacificAtlanticWaterFlowInput
  | ShortestBridgeInput
  | ShortestPathBinaryMatrixInput
  | NearestExitFromEntranceInMazeInput
  | ShortestPathGridWithObstaclesEliminationInput
  | MinimumObstacleRemovalToReachCornerInput
  | SwimInRisingWaterInput
  | ShortestPathToGetFoodInput
  | ZeroOneMatrixInput
  | AsFarFromLandAsPossibleInput
  | MapOfHighestPeakInput
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

export interface NetworkDelayTimeExecutionState extends JsonObject {
  kind: "network-delay-time";
  signalSource: string;
  distances: Record<string, number | null>;
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  reachedNodes: string[];
  unreachableNodes: string[];
  networkDelay: number | null;
  allReached: boolean | null;
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

export interface CountConnectedComponentsExecutionState extends JsonObject {
  kind: "count-connected-components";
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
}

export interface RedundantConnectionExecutionState extends JsonObject {
  kind: "redundant-connection";
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
  redundantEdge: string | null;
  hasRedundantConnection: boolean | null;
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

export interface MaxAreaOfIslandExecutionState extends JsonObject {
  kind: "max-area-of-island";
  grid: string[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  scan: string | null;
  islandCount: number;
  activeIslandId: number | null;
  activeIsland: string[];
  activeIslandArea: number;
  completedIslands: string[][];
  completedAreas: number[];
  cellIslands: Record<string, number>;
  remainingLand: string[];
  maxArea: number;
  largestIslandId: number | null;
  largestIsland: string[];
}

export interface IslandPerimeterExecutionState extends JsonObject {
  kind: "island-perimeter";
  grid: string[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  scan: string | null;
  landCells: string[];
  remainingLand: string[];
  exposedEdges: string[];
  currentContribution: number;
  perimeter: number;
}

export interface PacificAtlanticWaterFlowExecutionState extends JsonObject {
  kind: "pacific-atlantic-water-flow";
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  phaseMode: "pacific" | "atlantic" | "resolved";
  pacificSeeds: string[];
  atlanticSeeds: string[];
  pacificReachable: string[];
  atlanticReachable: string[];
  dualReachable: string[];
}

export interface ShortestBridgeExecutionState extends JsonObject {
  kind: "shortest-bridge";
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  scan: string | null;
  phaseMode: "locate-island" | "mark-island" | "expand-bridge" | "resolved";
  firstIsland: string[];
  expandedWater: string[];
  reachedSecondIsland: string[];
  wave: number;
  bridgeLength: number | null;
}

export interface ShortestPathBinaryMatrixExecutionState extends JsonObject {
  kind: "shortest-path-binary-matrix";
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  phaseMode: "search" | "traceback" | "resolved";
  path: string[];
  visitedOpen: string[];
  blockedCells: string[];
  pathLength: number | null;
  reachable: boolean | null;
}

export interface NearestExitFromEntranceInMazeExecutionState extends JsonObject {
  kind: "nearest-exit-from-entrance-in-maze";
  grid: string[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  phaseMode: "search" | "traceback" | "resolved";
  entrance: string;
  exits: string[];
  path: string[];
  visitedOpen: string[];
  blockedCells: string[];
  stepsToExit: number | null;
  reachable: boolean | null;
  exit: string | null;
}

export interface ShortestPathGridWithObstaclesEliminationExecutionState extends JsonObject {
  kind: "shortest-path-in-a-grid-with-obstacles-elimination";
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  phaseMode: "search" | "traceback" | "resolved";
  start: string;
  target: string;
  path: string[];
  obstacleCells: string[];
  visitedOpen: string[];
  visitedObstacles: string[];
  frontierStates: string[];
  settledStates: string[];
  currentState: string | null;
  currentBudget: number | null;
  bestRemainingByCell: Record<string, number>;
  eliminatedCells: string[];
  eliminations: number;
  remainingEliminations: number | null;
  stepsToTarget: number | null;
  reachable: boolean | null;
}

export interface MinimumObstacleRemovalToReachCornerExecutionState extends JsonObject {
  kind: "minimum-obstacle-removal-to-reach-corner";
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  currentRemovalCost: number | null;
  activeEdge: string[];
  phaseMode: "search" | "traceback" | "resolved";
  start: string;
  target: string;
  path: string[];
  obstacleCells: string[];
  visitedOpen: string[];
  visitedObstacles: string[];
  bestRemovalsByCell: Record<string, number>;
  removedObstacleCells: string[];
  minimumRemovals: number | null;
}

export interface SwimInRisingWaterExecutionState extends JsonObject {
  kind: "swim-in-rising-water";
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  currentWaterLevel: number | null;
  activeEdge: string[];
  phaseMode: "search" | "traceback" | "resolved";
  start: string;
  target: string;
  path: string[];
  visitedCells: string[];
  bestTimeByCell: Record<string, number>;
  swimTime: number | null;
}

export interface ShortestPathToGetFoodExecutionState extends JsonObject {
  kind: "shortest-path-to-get-food";
  grid: string[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  phaseMode: "search" | "traceback" | "resolved";
  start: string;
  food: string;
  path: string[];
  visitedOpen: string[];
  blockedCells: string[];
  stepsToFood: number | null;
  reachable: boolean | null;
}

export interface ZeroOneMatrixExecutionState extends JsonObject {
  kind: "01-matrix";
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  zeroCells: string[];
  updatedCells: string[];
  remainingCells: string[];
  fullyResolved: boolean | null;
  maxDistance: number | null;
  unresolvedCells: string[];
}

export interface AsFarFromLandAsPossibleExecutionState extends JsonObject {
  kind: "as-far-from-land-as-possible";
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  landCells: string[];
  updatedWater: string[];
  remainingWater: string[];
  outcome: "active" | "resolved" | "no-land" | "no-water";
  maxDistance: number | null;
  answer: number | null;
  farthestWater: string[];
  unreachableWater: string[];
}

export interface MapOfHighestPeakExecutionState extends JsonObject {
  kind: "map-of-highest-peak";
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  waterCells: string[];
  updatedLand: string[];
  remainingLand: string[];
  fullyAssigned: boolean | null;
  maxHeight: number | null;
  highestCells: string[];
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
  | NetworkDelayTimeExecutionState
  | CloneGraphExecutionState
  | GraphValidTreeExecutionState
  | CountConnectedComponentsExecutionState
  | RedundantConnectionExecutionState
  | CourseScheduleExecutionState
  | RottingOrangesExecutionState
  | NumberOfIslandsExecutionState
  | MaxAreaOfIslandExecutionState
  | IslandPerimeterExecutionState
  | PacificAtlanticWaterFlowExecutionState
  | ShortestBridgeExecutionState
  | ShortestPathBinaryMatrixExecutionState
  | NearestExitFromEntranceInMazeExecutionState
  | ShortestPathGridWithObstaclesEliminationExecutionState
  | MinimumObstacleRemovalToReachCornerExecutionState
  | SwimInRisingWaterExecutionState
  | ShortestPathToGetFoodExecutionState
  | ZeroOneMatrixExecutionState
  | AsFarFromLandAsPossibleExecutionState
  | MapOfHighestPeakExecutionState
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

interface NetworkDelayTimeRuntimeState {
  signalSource: string;
  distances: Record<string, number>;
  settled: Set<string>;
  frontier: Set<string>;
  current: string | null;
  activeEdge: string[];
  reachedNodes: Set<string>;
  networkDelay: number | null;
  allReached: boolean | null;
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

interface CountConnectedComponentsRuntimeState {
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
}

interface RedundantConnectionRuntimeState {
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
  redundantEdge: string | null;
  hasRedundantConnection: boolean | null;
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

interface MaxAreaOfIslandRuntimeState {
  grid: string[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  scan: string | null;
  islandCount: number;
  activeIslandId: number | null;
  activeIsland: string[];
  activeIslandArea: number;
  completedIslands: string[][];
  completedAreas: number[];
  cellIslands: Record<string, number>;
  remainingLand: Set<string>;
  maxArea: number;
  largestIslandId: number | null;
  largestIsland: string[];
}

interface IslandPerimeterRuntimeState {
  grid: string[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  scan: string | null;
  landCells: string[];
  remainingLand: Set<string>;
  exposedEdges: string[];
  currentContribution: number;
  perimeter: number;
}

interface PacificAtlanticWaterFlowRuntimeState {
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  phaseMode: "pacific" | "atlantic" | "resolved";
  pacificSeeds: string[];
  atlanticSeeds: string[];
  pacificReachable: Set<string>;
  atlanticReachable: Set<string>;
  dualReachable: Set<string>;
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

interface ShortestPathBinaryMatrixRuntimeState {
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  phaseMode: "search" | "traceback" | "resolved";
  path: string[];
  visitedOpen: Set<string>;
  blockedCells: string[];
  pathLength: number | null;
  reachable: boolean | null;
}

interface ShortestPathGridWithObstaclesEliminationRuntimeState {
  grid: number[][];
  settledStates: string[];
  frontierStates: string[];
  current: string | null;
  currentState: string | null;
  currentBudget: number | null;
  activeEdge: string[];
  phaseMode: "search" | "traceback" | "resolved";
  start: string;
  target: string;
  path: string[];
  obstacleCells: string[];
  visitedOpen: Set<string>;
  visitedObstacles: Set<string>;
  bestRemainingByCell: Record<string, number>;
  eliminatedCells: string[];
  eliminations: number;
  remainingEliminations: number | null;
  stepsToTarget: number | null;
  reachable: boolean | null;
}

interface MinimumObstacleRemovalToReachCornerRuntimeState {
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  currentRemovalCost: number | null;
  activeEdge: string[];
  phaseMode: "search" | "traceback" | "resolved";
  start: string;
  target: string;
  path: string[];
  obstacleCells: string[];
  visitedOpen: Set<string>;
  visitedObstacles: Set<string>;
  bestRemovalsByCell: Record<string, number>;
  removedObstacleCells: string[];
  minimumRemovals: number | null;
}

interface SwimInRisingWaterRuntimeState {
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  currentWaterLevel: number | null;
  activeEdge: string[];
  phaseMode: "search" | "traceback" | "resolved";
  start: string;
  target: string;
  path: string[];
  visitedCells: Set<string>;
  bestTimeByCell: Record<string, number>;
  swimTime: number | null;
}

interface ZeroOneMatrixRuntimeState {
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  zeroCells: string[];
  updatedCells: string[];
  remainingCells: Set<string>;
  fullyResolved: boolean | null;
  maxDistance: number | null;
  unresolvedCells: string[];
}

interface AsFarFromLandAsPossibleRuntimeState {
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  landCells: string[];
  updatedWater: string[];
  remainingWater: Set<string>;
  outcome: "active" | "resolved" | "no-land" | "no-water";
  maxDistance: number | null;
  answer: number | null;
  farthestWater: string[];
  unreachableWater: string[];
}

interface MapOfHighestPeakRuntimeState {
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  waterCells: string[];
  updatedLand: string[];
  remainingLand: Set<string>;
  fullyAssigned: boolean | null;
  maxHeight: number | null;
  highestCells: string[];
}

interface ShortestBridgeRuntimeState {
  grid: number[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  scan: string | null;
  phaseMode: "locate-island" | "mark-island" | "expand-bridge" | "resolved";
  firstIsland: Set<string>;
  expandedWater: Set<string>;
  reachedSecondIsland: string[];
  wave: number;
  bridgeLength: number | null;
}

interface NearestExitFromEntranceInMazeRuntimeState {
  grid: string[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  phaseMode: "search" | "traceback" | "resolved";
  entrance: string;
  exits: string[];
  path: string[];
  visitedOpen: string[];
  blockedCells: string[];
  stepsToExit: number | null;
  reachable: boolean | null;
  exit: string | null;
}

interface ShortestPathToGetFoodRuntimeState {
  grid: string[][];
  settled: string[];
  frontier: string[];
  current: string | null;
  activeEdge: string[];
  phaseMode: "search" | "traceback" | "resolved";
  start: string;
  food: string;
  path: string[];
  visitedOpen: string[];
  blockedCells: string[];
  stepsToFood: number | null;
  reachable: boolean | null;
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
  "network-delay-time": {
    id: "network-delay-time",
    label: "Network Delay Time",
    implementationVersion: "graph-engine-0.12.0"
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
  "count-connected-components": {
    id: "count-connected-components",
    label: "Count Connected Components",
    implementationVersion: "graph-engine-0.17.0"
  },
  "redundant-connection": {
    id: "redundant-connection",
    label: "Redundant Connection",
    implementationVersion: "graph-engine-0.13.0"
  },
  "course-schedule": {
    id: "course-schedule",
    label: "Course Schedule",
    implementationVersion: "graph-engine-0.2.0"
  },
  "course-schedule-ii": {
    id: "course-schedule-ii",
    label: "Course Schedule II",
    implementationVersion: "graph-engine-0.16.0"
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
  "max-area-of-island": {
    id: "max-area-of-island",
    label: "Max Area of Island",
    implementationVersion: "graph-engine-0.14.0"
  },
  "island-perimeter": {
    id: "island-perimeter",
    label: "Island Perimeter",
    implementationVersion: "graph-engine-0.15.0"
  },
  "pacific-atlantic-water-flow": {
    id: "pacific-atlantic-water-flow",
    label: "Pacific Atlantic Water Flow",
    implementationVersion: "graph-engine-0.9.0"
  },
  "shortest-bridge": {
    id: "shortest-bridge",
    label: "Shortest Bridge",
    implementationVersion: "graph-engine-0.11.0"
  },
  "shortest-path-binary-matrix": {
    id: "shortest-path-binary-matrix",
    label: "Shortest Path in Binary Matrix",
    implementationVersion: "graph-engine-0.10.0"
  },
  "nearest-exit-from-entrance-in-maze": {
    id: "nearest-exit-from-entrance-in-maze",
    label: "Nearest Exit from Entrance in Maze",
    implementationVersion: "graph-engine-0.19.0"
  },
  "shortest-path-in-a-grid-with-obstacles-elimination": {
    id: "shortest-path-in-a-grid-with-obstacles-elimination",
    label: "Shortest Path in a Grid with Obstacles Elimination",
    implementationVersion: "graph-engine-0.21.0"
  },
  "minimum-obstacle-removal-to-reach-corner": {
    id: "minimum-obstacle-removal-to-reach-corner",
    label: "Minimum Obstacle Removal to Reach Corner",
    implementationVersion: "graph-engine-0.22.0"
  },
  "swim-in-rising-water": {
    id: "swim-in-rising-water",
    label: "Swim in Rising Water",
    implementationVersion: "graph-engine-0.23.0"
  },
  "shortest-path-to-get-food": {
    id: "shortest-path-to-get-food",
    label: "Shortest Path to Get Food",
    implementationVersion: "graph-engine-0.20.0"
  },
  "01-matrix": {
    id: "01-matrix",
    label: "01 Matrix",
    implementationVersion: "graph-engine-0.16.0"
  },
  "as-far-from-land-as-possible": {
    id: "as-far-from-land-as-possible",
    label: "As Far from Land as Possible",
    implementationVersion: "graph-engine-0.17.0"
  },
  "map-of-highest-peak": {
    id: "map-of-highest-peak",
    label: "Map of Highest Peak",
    implementationVersion: "graph-engine-0.18.0"
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

export const defaultNetworkDelayTimeInput: GraphInput = {
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

export const defaultRedundantConnectionInput: GraphValidTreeInput = {
  nodeCount: 5,
  edges: [
    [0, 1],
    [1, 2],
    [2, 3],
    [1, 3],
    [1, 4]
  ]
};

export const defaultCountConnectedComponentsInput: GraphValidTreeInput = {
  nodeCount: 6,
  edges: [
    [0, 1],
    [1, 2],
    [3, 4]
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

export const defaultMaxAreaOfIslandInput: NumberOfIslandsInput = {
  grid: [
    ["0", "0", "1", "0", "0"],
    ["1", "1", "1", "0", "1"],
    ["0", "1", "0", "0", "1"],
    ["0", "0", "0", "1", "1"]
  ]
};

export const defaultIslandPerimeterInput: NumberOfIslandsInput = {
  grid: [
    ["0", "1", "0", "0"],
    ["1", "1", "1", "0"],
    ["0", "1", "0", "0"],
    ["1", "1", "0", "0"]
  ]
};

export const defaultPacificAtlanticWaterFlowInput: PacificAtlanticWaterFlowInput = {
  grid: [
    [1, 2, 2, 3, 5],
    [3, 2, 3, 4, 4],
    [2, 4, 5, 3, 1],
    [6, 7, 1, 4, 5],
    [5, 1, 1, 2, 4]
  ]
};

export const defaultShortestBridgeInput: ShortestBridgeInput = {
  grid: [
    [0, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 1, 1]
  ]
};

export const defaultShortestPathBinaryMatrixInput: ShortestPathBinaryMatrixInput = {
  grid: [
    [0, 1, 0, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0]
  ]
};

export const defaultNearestExitFromEntranceInMazeInput: NearestExitFromEntranceInMazeInput = {
  grid: [
    ["+", "+", "+", "+", "+"],
    ["+", ".", ".", ".", "+"],
    ["+", "+", "+", ".", "+"],
    ["+", "+", "+", ".", "."],
    ["+", "+", "+", "+", "+"]
  ],
  entrance: [1, 1]
};

export const defaultShortestPathGridWithObstaclesEliminationInput: ShortestPathGridWithObstaclesEliminationInput =
  {
    grid: [
      [0, 0, 0],
      [1, 1, 0],
      [0, 0, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    eliminations: 1
  };

export const defaultMinimumObstacleRemovalToReachCornerInput: MinimumObstacleRemovalToReachCornerInput =
  {
    grid: [
      [0, 1, 1],
      [1, 1, 0],
      [1, 1, 0]
    ]
  };

export const defaultSwimInRisingWaterInput: SwimInRisingWaterInput = {
  grid: [
    [0, 1, 2, 3, 4],
    [24, 23, 22, 21, 5],
    [12, 13, 14, 15, 16],
    [11, 17, 18, 19, 20],
    [10, 9, 8, 7, 6]
  ]
};

export const defaultShortestPathToGetFoodInput: ShortestPathToGetFoodInput = {
  grid: [
    ["X", "X", "X", "X", "X"],
    ["X", "*", "O", "O", "X"],
    ["X", "X", "X", "O", "X"],
    ["X", "X", "X", "O", "#"],
    ["X", "X", "X", "X", "X"]
  ]
};

export const defaultZeroOneMatrixInput: ZeroOneMatrixInput = {
  grid: [
    [0, 0, 0],
    [0, 1, 0],
    [1, 1, 1]
  ]
};

export const defaultAsFarFromLandAsPossibleInput: AsFarFromLandAsPossibleInput = {
  grid: [
    [1, 0, 1],
    [0, 0, 0],
    [1, 0, 1]
  ]
};

export const defaultMapOfHighestPeakInput: MapOfHighestPeakInput = {
  grid: [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0]
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

  if (state.kind === "network-delay-time") {
    return {
      kind: state.kind,
      signalSource: state.signalSource,
      distances: {
        ...state.distances
      },
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      reachedNodes: state.reachedNodes.slice(),
      unreachableNodes: state.unreachableNodes.slice(),
      networkDelay: state.networkDelay,
      allReached: state.allReached
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

  if (state.kind === "count-connected-components") {
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
      componentCount: state.componentCount
    };
  }

  if (state.kind === "redundant-connection") {
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
      redundantEdge: state.redundantEdge,
      hasRedundantConnection: state.hasRedundantConnection
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

  if (state.kind === "max-area-of-island") {
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
      activeIslandArea: state.activeIslandArea,
      completedIslands: state.completedIslands.map((island) => island.slice()),
      completedAreas: state.completedAreas.slice(),
      cellIslands: {
        ...state.cellIslands
      },
      remainingLand: state.remainingLand.slice(),
      maxArea: state.maxArea,
      largestIslandId: state.largestIslandId,
      largestIsland: state.largestIsland.slice()
    };
  }

  if (state.kind === "island-perimeter") {
    return {
      kind: state.kind,
      grid: cloneGrid(state.grid),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      scan: state.scan,
      landCells: state.landCells.slice(),
      remainingLand: state.remainingLand.slice(),
      exposedEdges: state.exposedEdges.slice(),
      currentContribution: state.currentContribution,
      perimeter: state.perimeter
    };
  }

  if (state.kind === "pacific-atlantic-water-flow") {
    return {
      kind: state.kind,
      grid: cloneGrid(state.grid),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      phaseMode: state.phaseMode,
      pacificSeeds: state.pacificSeeds.slice(),
      atlanticSeeds: state.atlanticSeeds.slice(),
      pacificReachable: state.pacificReachable.slice(),
      atlanticReachable: state.atlanticReachable.slice(),
      dualReachable: state.dualReachable.slice()
    };
  }

  if (state.kind === "shortest-bridge") {
    return {
      kind: state.kind,
      grid: cloneGrid(state.grid),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      scan: state.scan,
      phaseMode: state.phaseMode,
      firstIsland: state.firstIsland.slice(),
      expandedWater: state.expandedWater.slice(),
      reachedSecondIsland: state.reachedSecondIsland.slice(),
      wave: state.wave,
      bridgeLength: state.bridgeLength
    };
  }

  if (state.kind === "shortest-path-binary-matrix") {
    return {
      kind: state.kind,
      grid: cloneGrid(state.grid),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      phaseMode: state.phaseMode,
      path: state.path.slice(),
      visitedOpen: state.visitedOpen.slice(),
      blockedCells: state.blockedCells.slice(),
      pathLength: state.pathLength,
      reachable: state.reachable
    };
  }

  if (state.kind === "nearest-exit-from-entrance-in-maze") {
    return {
      kind: state.kind,
      grid: cloneGrid(state.grid),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      phaseMode: state.phaseMode,
      entrance: state.entrance,
      exits: state.exits.slice(),
      path: state.path.slice(),
      visitedOpen: state.visitedOpen.slice(),
      blockedCells: state.blockedCells.slice(),
      stepsToExit: state.stepsToExit,
      reachable: state.reachable,
      exit: state.exit
    };
  }

  if (state.kind === "shortest-path-to-get-food") {
    return {
      kind: state.kind,
      grid: cloneGrid(state.grid),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      phaseMode: state.phaseMode,
      start: state.start,
      food: state.food,
      path: state.path.slice(),
      visitedOpen: state.visitedOpen.slice(),
      blockedCells: state.blockedCells.slice(),
      stepsToFood: state.stepsToFood,
      reachable: state.reachable
    };
  }

  if (state.kind === "01-matrix") {
    return {
      kind: state.kind,
      grid: cloneGrid(state.grid),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      zeroCells: state.zeroCells.slice(),
      updatedCells: state.updatedCells.slice(),
      remainingCells: state.remainingCells.slice(),
      fullyResolved: state.fullyResolved,
      maxDistance: state.maxDistance,
      unresolvedCells: state.unresolvedCells.slice()
    };
  }

  if (state.kind === "as-far-from-land-as-possible") {
    return {
      kind: state.kind,
      grid: cloneGrid(state.grid),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      landCells: state.landCells.slice(),
      updatedWater: state.updatedWater.slice(),
      remainingWater: state.remainingWater.slice(),
      outcome: state.outcome,
      maxDistance: state.maxDistance,
      answer: state.answer,
      farthestWater: state.farthestWater.slice(),
      unreachableWater: state.unreachableWater.slice()
    };
  }

  if (state.kind === "map-of-highest-peak") {
    return {
      kind: state.kind,
      grid: cloneGrid(state.grid),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      waterCells: state.waterCells.slice(),
      updatedLand: state.updatedLand.slice(),
      remainingLand: state.remainingLand.slice(),
      fullyAssigned: state.fullyAssigned,
      maxHeight: state.maxHeight,
      highestCells: state.highestCells.slice()
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

  if (state.kind === "shortest-path-in-a-grid-with-obstacles-elimination") {
    return {
      kind: state.kind,
      grid: cloneGrid(state.grid),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      activeEdge: state.activeEdge.slice(),
      phaseMode: state.phaseMode,
      start: state.start,
      target: state.target,
      path: state.path.slice(),
      obstacleCells: state.obstacleCells.slice(),
      visitedOpen: state.visitedOpen.slice(),
      visitedObstacles: state.visitedObstacles.slice(),
      frontierStates: state.frontierStates.slice(),
      settledStates: state.settledStates.slice(),
      currentState: state.currentState,
      currentBudget: state.currentBudget,
      bestRemainingByCell: {
        ...state.bestRemainingByCell
      },
      eliminatedCells: state.eliminatedCells.slice(),
      eliminations: state.eliminations,
      remainingEliminations: state.remainingEliminations,
      stepsToTarget: state.stepsToTarget,
      reachable: state.reachable
    };
  }

  if (state.kind === "minimum-obstacle-removal-to-reach-corner") {
    return {
      kind: state.kind,
      grid: cloneGrid(state.grid),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      currentRemovalCost: state.currentRemovalCost,
      activeEdge: state.activeEdge.slice(),
      phaseMode: state.phaseMode,
      start: state.start,
      target: state.target,
      path: state.path.slice(),
      obstacleCells: state.obstacleCells.slice(),
      visitedOpen: state.visitedOpen.slice(),
      visitedObstacles: state.visitedObstacles.slice(),
      bestRemovalsByCell: {
        ...state.bestRemovalsByCell
      },
      removedObstacleCells: state.removedObstacleCells.slice(),
      minimumRemovals: state.minimumRemovals
    };
  }

  if (state.kind === "swim-in-rising-water") {
    return {
      kind: state.kind,
      grid: cloneGrid(state.grid),
      settled: state.settled.slice(),
      frontier: state.frontier.slice(),
      current: state.current,
      currentWaterLevel: state.currentWaterLevel,
      activeEdge: state.activeEdge.slice(),
      phaseMode: state.phaseMode,
      start: state.start,
      target: state.target,
      path: state.path.slice(),
      visitedCells: state.visitedCells.slice(),
      bestTimeByCell: {
        ...state.bestTimeByCell
      },
      swimTime: state.swimTime
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

function normalizeNetworkDelayTimeInput(candidate: unknown): PathfindingGraphInput {
  const input = normalizeParsedPathfindingGraph(candidate);

  if (input.target !== null) {
    throw new Error("Network Delay Time input target must be null.");
  }

  return input;
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

function normalizePacificAtlanticWaterFlowInput(
  candidate: unknown
): PacificAtlanticWaterFlowInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Pacific Atlantic Water Flow input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new Error("Pacific Atlantic Water Flow input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new Error("Pacific Atlantic Water Flow input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new Error(`grid[${rowIndex}] must be a non-empty heights row.`);
    }

    if (row.length > 8) {
      throw new Error(`grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || cell < 0) {
        throw new Error(
          `grid[${rowIndex}][${columnIndex}] must be a non-negative integer height.`
        );
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new Error("Pacific Atlantic Water Flow input rows must all be the same length.");
  }

  return {
    grid
  };
}

function normalizeShortestBridgeInput(candidate: unknown): ShortestBridgeInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Shortest Bridge input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new Error("Shortest Bridge input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new Error("Shortest Bridge input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new Error(`grid[${rowIndex}] must be a non-empty binary row.`);
    }

    if (row.length > 8) {
      throw new Error(`grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || (cell !== 0 && cell !== 1)) {
        throw new Error(`grid[${rowIndex}][${columnIndex}] must be either 0 or 1.`);
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new Error("Shortest Bridge input rows must all be the same length.");
  }

  return {
    grid
  };
}

function normalizeShortestPathBinaryMatrixInput(
  candidate: unknown
): ShortestPathBinaryMatrixInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Shortest Path in Binary Matrix input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new Error("Shortest Path in Binary Matrix input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new Error("Shortest Path in Binary Matrix input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new Error(`grid[${rowIndex}] must be a non-empty binary row.`);
    }

    if (row.length > 8) {
      throw new Error(`grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || (cell !== 0 && cell !== 1)) {
        throw new Error(`grid[${rowIndex}][${columnIndex}] must be either 0 or 1.`);
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new Error("Shortest Path in Binary Matrix input rows must all be the same length.");
  }

  return {
    grid
  };
}

function normalizeNearestExitFromEntranceInMazeInput(
  candidate: unknown
): NearestExitFromEntranceInMazeInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error(
      "Nearest Exit from Entrance in Maze input must be an object with grid and entrance fields."
    );
  }

  const value = candidate as {
    grid?: unknown;
    entrance?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new Error("Nearest Exit from Entrance in Maze input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new Error("Nearest Exit from Entrance in Maze input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new Error(`grid[${rowIndex}] must be a non-empty maze row.`);
    }

    if (row.length > 8) {
      throw new Error(`grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "string" || (cell !== "." && cell !== "+")) {
        throw new Error(`grid[${rowIndex}][${columnIndex}] must be "." or "+".`);
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new Error(
      "Nearest Exit from Entrance in Maze input rows must all be the same length."
    );
  }

  if (
    !Array.isArray(value.entrance) ||
    value.entrance.length !== 2 ||
    typeof value.entrance[0] !== "number" ||
    !Number.isInteger(value.entrance[0]) ||
    typeof value.entrance[1] !== "number" ||
    !Number.isInteger(value.entrance[1])
  ) {
    throw new Error(
      "Nearest Exit from Entrance in Maze input must include an entrance coordinate pair."
    );
  }

  const entrance = [value.entrance[0], value.entrance[1]] as [number, number];

  if (entrance[0] < 0 || entrance[0] >= grid.length || entrance[1] < 0 || entrance[1] >= columnCount) {
    throw new Error("Nearest Exit from Entrance in Maze entrance must stay within the grid.");
  }

  if (grid[entrance[0]]![entrance[1]] !== ".") {
    throw new Error("Nearest Exit from Entrance in Maze entrance must start on an open cell.");
  }

  return {
    grid,
    entrance
  };
}

function normalizeShortestPathGridWithObstaclesEliminationInput(
  candidate: unknown
): ShortestPathGridWithObstaclesEliminationInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error(
      "Shortest Path in a Grid with Obstacles Elimination input must be an object with grid and eliminations fields."
    );
  }

  const value = candidate as {
    grid?: unknown;
    eliminations?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new Error(
      "Shortest Path in a Grid with Obstacles Elimination input must include a non-empty grid."
    );
  }

  if (value.grid.length > 8) {
    throw new Error(
      "Shortest Path in a Grid with Obstacles Elimination input must use 8 rows or fewer."
    );
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new Error(`grid[${rowIndex}] must be a non-empty binary row.`);
    }

    if (row.length > 8) {
      throw new Error(`grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || (cell !== 0 && cell !== 1)) {
        throw new Error(`grid[${rowIndex}][${columnIndex}] must be either 0 or 1.`);
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new Error(
      "Shortest Path in a Grid with Obstacles Elimination input rows must all be the same length."
    );
  }

  if (
    typeof value.eliminations !== "number" ||
    !Number.isInteger(value.eliminations) ||
    value.eliminations < 0
  ) {
    throw new Error(
      "Shortest Path in a Grid with Obstacles Elimination input eliminations must be a non-negative integer."
    );
  }

  if (value.eliminations > 8) {
    throw new Error(
      "Shortest Path in a Grid with Obstacles Elimination input eliminations must be 8 or fewer."
    );
  }

  if (grid[0]![0] !== 0) {
    throw new Error(
      "Shortest Path in a Grid with Obstacles Elimination input must start on an open top-left cell."
    );
  }

  if (grid[grid.length - 1]![columnCount - 1] !== 0) {
    throw new Error(
      "Shortest Path in a Grid with Obstacles Elimination input must end on an open bottom-right cell."
    );
  }

  return {
    grid,
    eliminations: value.eliminations
  };
}

function normalizeMinimumObstacleRemovalToReachCornerInput(
  candidate: unknown
): MinimumObstacleRemovalToReachCornerInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error(
      "Minimum Obstacle Removal to Reach Corner input must be an object with a grid field."
    );
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new Error("Minimum Obstacle Removal to Reach Corner input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new Error("Minimum Obstacle Removal to Reach Corner input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new Error(`grid[${rowIndex}] must be a non-empty binary row.`);
    }

    if (row.length > 8) {
      throw new Error(`grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || (cell !== 0 && cell !== 1)) {
        throw new Error(`grid[${rowIndex}][${columnIndex}] must be either 0 or 1.`);
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new Error("Minimum Obstacle Removal to Reach Corner input rows must all be the same length.");
  }

  return {
    grid
  };
}

function normalizeSwimInRisingWaterInput(candidate: unknown): SwimInRisingWaterInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Swim in Rising Water input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new Error("Swim in Rising Water input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new Error("Swim in Rising Water input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new Error(`grid[${rowIndex}] must be a non-empty integer row.`);
    }

    if (row.length > 8) {
      throw new Error(`grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || cell < 0) {
        throw new Error(`grid[${rowIndex}][${columnIndex}] must be a non-negative integer.`);
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new Error("Swim in Rising Water input rows must all be the same length.");
  }

  if (grid.length !== columnCount) {
    throw new Error("Swim in Rising Water input must use a square grid.");
  }

  return {
    grid
  };
}

function normalizeShortestPathToGetFoodInput(candidate: unknown): ShortestPathToGetFoodInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Shortest Path to Get Food input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new Error("Shortest Path to Get Food input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new Error("Shortest Path to Get Food input must use 8 rows or fewer.");
  }

  let startCount = 0;
  let foodCount = 0;

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new Error(`grid[${rowIndex}] must be a non-empty food row.`);
    }

    if (row.length > 8) {
      throw new Error(`grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (
        typeof cell !== "string" ||
        (cell !== "X" && cell !== "O" && cell !== "*" && cell !== "#")
      ) {
        throw new Error(`grid[${rowIndex}][${columnIndex}] must be "X", "O", "*", or "#".`);
      }

      if (cell === "*") {
        startCount += 1;
      } else if (cell === "#") {
        foodCount += 1;
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new Error("Shortest Path to Get Food input rows must all be the same length.");
  }

  if (startCount !== 1) {
    throw new Error("Shortest Path to Get Food input must contain exactly one start cell.");
  }

  if (foodCount !== 1) {
    throw new Error("Shortest Path to Get Food input must contain exactly one food cell.");
  }

  return {
    grid
  };
}

function normalizeZeroOneMatrixInput(candidate: unknown): ZeroOneMatrixInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("01 Matrix input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new Error("01 Matrix input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new Error("01 Matrix input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new Error(`grid[${rowIndex}] must be a non-empty binary row.`);
    }

    if (row.length > 8) {
      throw new Error(`grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || (cell !== 0 && cell !== 1)) {
        throw new Error(`grid[${rowIndex}][${columnIndex}] must be either 0 or 1.`);
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new Error("01 Matrix input rows must all be the same length.");
  }

  return {
    grid
  };
}

function normalizeAsFarFromLandAsPossibleInput(
  candidate: unknown
): AsFarFromLandAsPossibleInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("As Far from Land as Possible input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new Error("As Far from Land as Possible input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new Error("As Far from Land as Possible input must use 8 rows or fewer.");
  }

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new Error(`grid[${rowIndex}] must be a non-empty binary row.`);
    }

    if (row.length > 8) {
      throw new Error(`grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || (cell !== 0 && cell !== 1)) {
        throw new Error(`grid[${rowIndex}][${columnIndex}] must be either 0 or 1.`);
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new Error("As Far from Land as Possible input rows must all be the same length.");
  }

  return {
    grid
  };
}

function normalizeMapOfHighestPeakInput(candidate: unknown): MapOfHighestPeakInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Map of Highest Peak input must be an object with a grid field.");
  }

  const value = candidate as {
    grid?: unknown;
  };

  if (!Array.isArray(value.grid) || value.grid.length === 0) {
    throw new Error("Map of Highest Peak input must include a non-empty grid.");
  }

  if (value.grid.length > 8) {
    throw new Error("Map of Highest Peak input must use 8 rows or fewer.");
  }

  let hasWater = false;

  const grid = value.grid.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new Error(`grid[${rowIndex}] must be a non-empty binary row.`);
    }

    if (row.length > 8) {
      throw new Error(`grid[${rowIndex}] must use 8 columns or fewer.`);
    }

    return row.map((cell, columnIndex) => {
      if (typeof cell !== "number" || !Number.isInteger(cell) || (cell !== 0 && cell !== 1)) {
        throw new Error(`grid[${rowIndex}][${columnIndex}] must be either 0 or 1.`);
      }

      if (cell === 1) {
        hasWater = true;
      }

      return cell;
    });
  });

  const columnCount = grid[0]!.length;

  if (grid.some((row) => row.length !== columnCount)) {
    throw new Error("Map of Highest Peak input rows must all be the same length.");
  }

  if (!hasWater) {
    throw new Error("Map of Highest Peak input must include at least one water cell.");
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
    case "network-delay-time":
      return normalizeNetworkDelayTimeInput(parsed);
    case "clone-graph":
      return normalizeParsedPathfindingGraph(parsed);
    case "graph-valid-tree":
    case "count-connected-components":
      return normalizeGraphValidTreeInput(parsed);
    case "redundant-connection":
      return normalizeGraphValidTreeInput(parsed);
    case "course-schedule":
    case "course-schedule-ii":
      return normalizeCourseScheduleInput(parsed);
    case "rotting-oranges":
      return normalizeRottingOrangesInput(parsed);
    case "number-of-islands":
      return normalizeNumberOfIslandsInput(parsed);
    case "max-area-of-island":
    case "island-perimeter":
      return normalizeNumberOfIslandsInput(parsed);
    case "pacific-atlantic-water-flow":
      return normalizePacificAtlanticWaterFlowInput(parsed);
    case "shortest-bridge":
      return normalizeShortestBridgeInput(parsed);
    case "shortest-path-binary-matrix":
      return normalizeShortestPathBinaryMatrixInput(parsed);
    case "nearest-exit-from-entrance-in-maze":
      return normalizeNearestExitFromEntranceInMazeInput(parsed);
    case "shortest-path-in-a-grid-with-obstacles-elimination":
      return normalizeShortestPathGridWithObstaclesEliminationInput(parsed);
    case "minimum-obstacle-removal-to-reach-corner":
      return normalizeMinimumObstacleRemovalToReachCornerInput(parsed);
    case "swim-in-rising-water":
      return normalizeSwimInRisingWaterInput(parsed);
    case "shortest-path-to-get-food":
      return normalizeShortestPathToGetFoodInput(parsed);
    case "01-matrix":
      return normalizeZeroOneMatrixInput(parsed);
    case "as-far-from-land-as-possible":
      return normalizeAsFarFromLandAsPossibleInput(parsed);
    case "map-of-highest-peak":
      return normalizeMapOfHighestPeakInput(parsed);
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
    case "network-delay-time":
      return normalizeNetworkDelayTimeInput(input);
    case "clone-graph":
      return normalizeParsedPathfindingGraph(input);
    case "graph-valid-tree":
    case "count-connected-components":
      return normalizeGraphValidTreeInput(input);
    case "redundant-connection":
      return normalizeGraphValidTreeInput(input);
    case "course-schedule":
    case "course-schedule-ii":
      return normalizeCourseScheduleInput(input);
    case "rotting-oranges":
      return normalizeRottingOrangesInput(input);
    case "number-of-islands":
      return normalizeNumberOfIslandsInput(input);
    case "max-area-of-island":
    case "island-perimeter":
      return normalizeNumberOfIslandsInput(input);
    case "pacific-atlantic-water-flow":
      return normalizePacificAtlanticWaterFlowInput(input);
    case "shortest-bridge":
      return normalizeShortestBridgeInput(input);
    case "shortest-path-binary-matrix":
      return normalizeShortestPathBinaryMatrixInput(input);
    case "nearest-exit-from-entrance-in-maze":
      return normalizeNearestExitFromEntranceInMazeInput(input);
    case "shortest-path-in-a-grid-with-obstacles-elimination":
      return normalizeShortestPathGridWithObstaclesEliminationInput(input);
    case "minimum-obstacle-removal-to-reach-corner":
      return normalizeMinimumObstacleRemovalToReachCornerInput(input);
    case "swim-in-rising-water":
      return normalizeSwimInRisingWaterInput(input);
    case "shortest-path-to-get-food":
      return normalizeShortestPathToGetFoodInput(input);
    case "01-matrix":
      return normalizeZeroOneMatrixInput(input);
    case "as-far-from-land-as-possible":
      return normalizeAsFarFromLandAsPossibleInput(input);
    case "map-of-highest-peak":
      return normalizeMapOfHighestPeakInput(input);
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

  if ("entrance" in graph) {
    return JSON.stringify(
      {
        grid: graph.grid,
        entrance: graph.entrance
      },
      null,
      2
    );
  }

  if ("eliminations" in graph) {
    return JSON.stringify(
      {
        grid: graph.grid,
        eliminations: graph.eliminations
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

function createNetworkDelayTimeRecorder(graph: PathfindingGraphInput) {
  return createTraceRecorder<
    NetworkDelayTimeRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "network-delay-time",
    projectState(runtimeState) {
      const reachedNodes = Array.from(runtimeState.reachedNodes).sort((left, right) =>
        left.localeCompare(right)
      );

      return cloneGraphState({
        kind: "network-delay-time",
        signalSource: runtimeState.signalSource,
        distances: serializeDistances(graph.nodes, runtimeState.distances),
        settled: Array.from(runtimeState.settled),
        frontier: orderWeightedFrontier(runtimeState.frontier, runtimeState.distances),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        reachedNodes,
        unreachableNodes: graph.nodes.filter((node) => !runtimeState.reachedNodes.has(node)),
        networkDelay: runtimeState.networkDelay,
        allReached: runtimeState.allReached
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createCourseScheduleRecorder(
  input: CourseScheduleInput,
  algorithmId: "course-schedule" | "course-schedule-ii"
) {
  return createTraceRecorder<CourseScheduleRuntimeState, GraphExecutionState, GraphMetricState>({
    algorithmId,
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

function createCountConnectedComponentsRecorder() {
  return createTraceRecorder<
    CountConnectedComponentsRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "count-connected-components",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "count-connected-components",
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
        componentCount: runtimeState.componentCount
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createRedundantConnectionRecorder() {
  return createTraceRecorder<
    RedundantConnectionRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "redundant-connection",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "redundant-connection",
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
        redundantEdge: runtimeState.redundantEdge,
        hasRedundantConnection: runtimeState.hasRedundantConnection
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

function makeBudgetStateId(cell: string, remainingBudget: number): string {
  return `${cell}|${remainingBudget}`;
}

function parseBudgetStateId(stateId: string): { cell: string; remainingBudget: number } {
  const [cell = "0,0", remainingBudgetText = "0"] = stateId.split("|");
  return {
    cell,
    remainingBudget: Number(remainingBudgetText)
  };
}

function collapseBudgetStateCells(states: string[]): string[] {
  const seen = new Set<string>();
  const cells: string[] = [];

  for (const stateId of states) {
    const { cell } = parseBudgetStateId(stateId);

    if (seen.has(cell)) {
      continue;
    }

    seen.add(cell);
    cells.push(cell);
  }

  return cells;
}

function updateZeroOneFrontier(
  frontier: string[],
  cell: string,
  bestRemovalsByCell: Record<string, number>,
  mode: "front" | "back"
) {
  const existingIndex = frontier.indexOf(cell);

  if (existingIndex >= 0) {
    frontier.splice(existingIndex, 1);
  }

  if (mode === "back") {
    frontier.push(cell);
    return;
  }

  const cellCost = bestRemovalsByCell[cell] ?? Number.POSITIVE_INFINITY;
  let insertIndex = 0;

  while (
    insertIndex < frontier.length &&
    (bestRemovalsByCell[frontier[insertIndex]!] ?? Number.POSITIVE_INFINITY) <= cellCost
  ) {
    insertIndex += 1;
  }

  frontier.splice(insertIndex, 0, cell);
}

function insertWeightedCellFrontier(
  frontier: string[],
  cell: string,
  bestCostByCell: Record<string, number>
) {
  const existingIndex = frontier.indexOf(cell);

  if (existingIndex >= 0) {
    frontier.splice(existingIndex, 1);
  }

  const cellCost = bestCostByCell[cell] ?? Number.POSITIVE_INFINITY;
  let insertIndex = 0;

  while (insertIndex < frontier.length) {
    const frontierCell = frontier[insertIndex]!;
    const frontierCost = bestCostByCell[frontierCell] ?? Number.POSITIVE_INFINITY;

    if (
      cellCost < frontierCost ||
      (cellCost === frontierCost && compareCellIds(cell, frontierCell) < 0)
    ) {
      break;
    }

    insertIndex += 1;
  }

  frontier.splice(insertIndex, 0, cell);
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

function getDiagonalNeighborCellIds(
  row: number,
  column: number,
  rowCount: number,
  columnCount: number
): string[] {
  const candidates: Array<[number, number]> = [
    [row - 1, column - 1],
    [row - 1, column],
    [row - 1, column + 1],
    [row, column - 1],
    [row, column + 1],
    [row + 1, column - 1],
    [row + 1, column],
    [row + 1, column + 1]
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

function createMaxAreaOfIslandRecorder() {
  return createTraceRecorder<MaxAreaOfIslandRuntimeState, GraphExecutionState, GraphMetricState>({
    algorithmId: "max-area-of-island",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "max-area-of-island",
        grid: cloneGrid(runtimeState.grid),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        scan: runtimeState.scan,
        islandCount: runtimeState.islandCount,
        activeIslandId: runtimeState.activeIslandId,
        activeIsland: runtimeState.activeIsland.slice(),
        activeIslandArea: runtimeState.activeIslandArea,
        completedIslands: runtimeState.completedIslands.map((island) => island.slice()),
        completedAreas: runtimeState.completedAreas.slice(),
        cellIslands: {
          ...runtimeState.cellIslands
        },
        remainingLand: Array.from(runtimeState.remainingLand).sort(compareCellIds),
        maxArea: runtimeState.maxArea,
        largestIslandId: runtimeState.largestIslandId,
        largestIsland: runtimeState.largestIsland.slice()
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createIslandPerimeterRecorder() {
  return createTraceRecorder<IslandPerimeterRuntimeState, GraphExecutionState, GraphMetricState>({
    algorithmId: "island-perimeter",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "island-perimeter",
        grid: cloneGrid(runtimeState.grid),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        scan: runtimeState.scan,
        landCells: runtimeState.landCells.slice(),
        remainingLand: Array.from(runtimeState.remainingLand).sort(compareCellIds),
        exposedEdges: runtimeState.exposedEdges.slice(),
        currentContribution: runtimeState.currentContribution,
        perimeter: runtimeState.perimeter
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createPacificAtlanticWaterFlowRecorder() {
  return createTraceRecorder<
    PacificAtlanticWaterFlowRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "pacific-atlantic-water-flow",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "pacific-atlantic-water-flow",
        grid: cloneGrid(runtimeState.grid),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        phaseMode: runtimeState.phaseMode,
        pacificSeeds: runtimeState.pacificSeeds.slice(),
        atlanticSeeds: runtimeState.atlanticSeeds.slice(),
        pacificReachable: Array.from(runtimeState.pacificReachable).sort(compareCellIds),
        atlanticReachable: Array.from(runtimeState.atlanticReachable).sort(compareCellIds),
        dualReachable: Array.from(runtimeState.dualReachable).sort(compareCellIds)
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createShortestBridgeRecorder() {
  return createTraceRecorder<ShortestBridgeRuntimeState, GraphExecutionState, GraphMetricState>({
    algorithmId: "shortest-bridge",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "shortest-bridge",
        grid: cloneGrid(runtimeState.grid),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        scan: runtimeState.scan,
        phaseMode: runtimeState.phaseMode,
        firstIsland: Array.from(runtimeState.firstIsland).sort(compareCellIds),
        expandedWater: Array.from(runtimeState.expandedWater).sort(compareCellIds),
        reachedSecondIsland: runtimeState.reachedSecondIsland.slice(),
        wave: runtimeState.wave,
        bridgeLength: runtimeState.bridgeLength
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createShortestPathBinaryMatrixRecorder() {
  return createTraceRecorder<
    ShortestPathBinaryMatrixRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "shortest-path-binary-matrix",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "shortest-path-binary-matrix",
        grid: cloneGrid(runtimeState.grid),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        phaseMode: runtimeState.phaseMode,
        path: runtimeState.path.slice(),
        visitedOpen: Array.from(runtimeState.visitedOpen).sort(compareCellIds),
        blockedCells: runtimeState.blockedCells.slice(),
        pathLength: runtimeState.pathLength,
        reachable: runtimeState.reachable
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createNearestExitFromEntranceInMazeRecorder() {
  return createTraceRecorder<
    NearestExitFromEntranceInMazeRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "nearest-exit-from-entrance-in-maze",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "nearest-exit-from-entrance-in-maze",
        grid: cloneGrid(runtimeState.grid),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        phaseMode: runtimeState.phaseMode,
        entrance: runtimeState.entrance,
        exits: runtimeState.exits.slice(),
        path: runtimeState.path.slice(),
        visitedOpen: runtimeState.visitedOpen.slice(),
        blockedCells: runtimeState.blockedCells.slice(),
        stepsToExit: runtimeState.stepsToExit,
        reachable: runtimeState.reachable,
        exit: runtimeState.exit
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createShortestPathGridWithObstaclesEliminationRecorder() {
  return createTraceRecorder<
    ShortestPathGridWithObstaclesEliminationRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "shortest-path-in-a-grid-with-obstacles-elimination",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "shortest-path-in-a-grid-with-obstacles-elimination",
        grid: cloneGrid(runtimeState.grid),
        settled: collapseBudgetStateCells(runtimeState.settledStates),
        frontier: collapseBudgetStateCells(runtimeState.frontierStates),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        phaseMode: runtimeState.phaseMode,
        start: runtimeState.start,
        target: runtimeState.target,
        path: runtimeState.path.slice(),
        obstacleCells: runtimeState.obstacleCells.slice(),
        visitedOpen: Array.from(runtimeState.visitedOpen).sort(compareCellIds),
        visitedObstacles: Array.from(runtimeState.visitedObstacles).sort(compareCellIds),
        frontierStates: runtimeState.frontierStates.slice(),
        settledStates: runtimeState.settledStates.slice(),
        currentState: runtimeState.currentState,
        currentBudget: runtimeState.currentBudget,
        bestRemainingByCell: {
          ...runtimeState.bestRemainingByCell
        },
        eliminatedCells: runtimeState.eliminatedCells.slice(),
        eliminations: runtimeState.eliminations,
        remainingEliminations: runtimeState.remainingEliminations,
        stepsToTarget: runtimeState.stepsToTarget,
        reachable: runtimeState.reachable
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createMinimumObstacleRemovalToReachCornerRecorder() {
  return createTraceRecorder<
    MinimumObstacleRemovalToReachCornerRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "minimum-obstacle-removal-to-reach-corner",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "minimum-obstacle-removal-to-reach-corner",
        grid: cloneGrid(runtimeState.grid),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        currentRemovalCost: runtimeState.currentRemovalCost,
        activeEdge: runtimeState.activeEdge.slice(),
        phaseMode: runtimeState.phaseMode,
        start: runtimeState.start,
        target: runtimeState.target,
        path: runtimeState.path.slice(),
        obstacleCells: runtimeState.obstacleCells.slice(),
        visitedOpen: Array.from(runtimeState.visitedOpen).sort(compareCellIds),
        visitedObstacles: Array.from(runtimeState.visitedObstacles).sort(compareCellIds),
        bestRemovalsByCell: {
          ...runtimeState.bestRemovalsByCell
        },
        removedObstacleCells: runtimeState.removedObstacleCells.slice(),
        minimumRemovals: runtimeState.minimumRemovals
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createSwimInRisingWaterRecorder() {
  return createTraceRecorder<SwimInRisingWaterRuntimeState, GraphExecutionState, GraphMetricState>({
    algorithmId: "swim-in-rising-water",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "swim-in-rising-water",
        grid: cloneGrid(runtimeState.grid),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        currentWaterLevel: runtimeState.currentWaterLevel,
        activeEdge: runtimeState.activeEdge.slice(),
        phaseMode: runtimeState.phaseMode,
        start: runtimeState.start,
        target: runtimeState.target,
        path: runtimeState.path.slice(),
        visitedCells: Array.from(runtimeState.visitedCells).sort(compareCellIds),
        bestTimeByCell: {
          ...runtimeState.bestTimeByCell
        },
        swimTime: runtimeState.swimTime
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createShortestPathToGetFoodRecorder() {
  return createTraceRecorder<
    ShortestPathToGetFoodRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "shortest-path-to-get-food",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "shortest-path-to-get-food",
        grid: cloneGrid(runtimeState.grid),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        phaseMode: runtimeState.phaseMode,
        start: runtimeState.start,
        food: runtimeState.food,
        path: runtimeState.path.slice(),
        visitedOpen: runtimeState.visitedOpen.slice(),
        blockedCells: runtimeState.blockedCells.slice(),
        stepsToFood: runtimeState.stepsToFood,
        reachable: runtimeState.reachable
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createZeroOneMatrixRecorder() {
  return createTraceRecorder<ZeroOneMatrixRuntimeState, GraphExecutionState, GraphMetricState>({
    algorithmId: "01-matrix",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "01-matrix",
        grid: cloneGrid(runtimeState.grid),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        zeroCells: runtimeState.zeroCells.slice(),
        updatedCells: runtimeState.updatedCells.slice(),
        remainingCells: Array.from(runtimeState.remainingCells).sort(compareCellIds),
        fullyResolved: runtimeState.fullyResolved,
        maxDistance: runtimeState.maxDistance,
        unresolvedCells: runtimeState.unresolvedCells.slice()
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createAsFarFromLandAsPossibleRecorder() {
  return createTraceRecorder<
    AsFarFromLandAsPossibleRuntimeState,
    GraphExecutionState,
    GraphMetricState
  >({
    algorithmId: "as-far-from-land-as-possible",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "as-far-from-land-as-possible",
        grid: cloneGrid(runtimeState.grid),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        landCells: runtimeState.landCells.slice(),
        updatedWater: runtimeState.updatedWater.slice(),
        remainingWater: Array.from(runtimeState.remainingWater).sort(compareCellIds),
        outcome: runtimeState.outcome,
        maxDistance: runtimeState.maxDistance,
        answer: runtimeState.answer,
        farthestWater: runtimeState.farthestWater.slice(),
        unreachableWater: runtimeState.unreachableWater.slice()
      });
    },
    projectMetrics: projectGraphMetrics
  });
}

function createMapOfHighestPeakRecorder() {
  return createTraceRecorder<MapOfHighestPeakRuntimeState, GraphExecutionState, GraphMetricState>({
    algorithmId: "map-of-highest-peak",
    projectState(runtimeState) {
      return cloneGraphState({
        kind: "map-of-highest-peak",
        grid: cloneGrid(runtimeState.grid),
        settled: runtimeState.settled.slice(),
        frontier: runtimeState.frontier.slice(),
        current: runtimeState.current,
        activeEdge: runtimeState.activeEdge.slice(),
        waterCells: runtimeState.waterCells.slice(),
        updatedLand: runtimeState.updatedLand.slice(),
        remainingLand: Array.from(runtimeState.remainingLand).sort(compareCellIds),
        fullyAssigned: runtimeState.fullyAssigned,
        maxHeight: runtimeState.maxHeight,
        highestCells: runtimeState.highestCells.slice()
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
    | ReturnType<typeof createNetworkDelayTimeRecorder>
    | ReturnType<typeof createCloneGraphRecorder>
    | ReturnType<typeof createGraphValidTreeRecorder>
    | ReturnType<typeof createCountConnectedComponentsRecorder>
    | ReturnType<typeof createRedundantConnectionRecorder>
    | ReturnType<typeof createCourseScheduleRecorder>
    | ReturnType<typeof createRottingOrangesRecorder>
    | ReturnType<typeof createNumberOfIslandsRecorder>
    | ReturnType<typeof createMaxAreaOfIslandRecorder>
    | ReturnType<typeof createIslandPerimeterRecorder>
    | ReturnType<typeof createPacificAtlanticWaterFlowRecorder>
    | ReturnType<typeof createShortestBridgeRecorder>
    | ReturnType<typeof createShortestPathBinaryMatrixRecorder>
    | ReturnType<typeof createNearestExitFromEntranceInMazeRecorder>
    | ReturnType<typeof createShortestPathGridWithObstaclesEliminationRecorder>
    | ReturnType<typeof createMinimumObstacleRemovalToReachCornerRecorder>
    | ReturnType<typeof createSwimInRisingWaterRecorder>
    | ReturnType<typeof createShortestPathToGetFoodRecorder>
    | ReturnType<typeof createZeroOneMatrixRecorder>
    | ReturnType<typeof createAsFarFromLandAsPossibleRecorder>
    | ReturnType<typeof createMapOfHighestPeakRecorder>
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

export function buildNetworkDelayTimeTrace(
  graph: PathfindingGraphInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["network-delay-time"];
  const normalizedGraph = normalizeGraphInput(
    graph,
    "network-delay-time"
  ) as PathfindingGraphInput;
  const adjacency = buildAdjacency(normalizedGraph);
  const distances = Object.fromEntries(
    normalizedGraph.nodes.map((node) => [node, Number.POSITIVE_INFINITY])
  ) as Record<string, number>;
  const frontier = new Set<string>([normalizedGraph.start]);
  const settled = new Set<string>();
  const reachedNodes = new Set<string>([normalizedGraph.start]);
  const recorder = createNetworkDelayTimeRecorder(normalizedGraph);
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: 1,
    inspections: 0,
    updates: 0
  };
  let current: string | null = normalizedGraph.start;
  let activeEdge: string[] = [];
  let networkDelay: number | null = null;
  let allReached: boolean | null = null;

  distances[normalizedGraph.start] = 0;

  const createRuntimeState = (): NetworkDelayTimeRuntimeState => ({
    signalSource: normalizedGraph.start,
    distances,
    settled,
    frontier,
    current,
    activeEdge,
    reachedNodes,
    networkDelay,
    allReached
  });

  recorder.push({
    phase: "Initialization",
    description:
      "The signal source starts at time zero while every other node remains unresolved in the weighted frontier ledger.",
    explanation: {
      summary: "Seed the weighted broadcast from one source before any relaxations occur.",
      details:
        "The first frame records the broadcast source, tentative distance table, and empty reachability verdict so replay never has to reconstruct the initial weighted state.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "network-delay-start-node",
        path: `state.distances.${normalizedGraph.start}`,
        kind: "node",
        intent: "focus",
        label: `Signal source ${normalizedGraph.start}`
      }
    ]
  });

  while (frontier.size > 0) {
    current = orderWeightedFrontier(frontier, distances)[0]!;
    frontier.delete(current);
    activeEdge = [];
    syncMetrics(metrics, {
      settled: Array.from(settled),
      frontier: orderWeightedFrontier(frontier, distances)
    });

    recorder.push({
      phase: "Extract",
      description: `Node ${current} has the earliest known arrival time and becomes the next broadcast relay.`,
      explanation: {
        summary: "Extract the reachable node with the smallest tentative arrival time.",
        details:
          "Arrival-time ordering stays deterministic by sorting on distance first and node label second, so replay and backend consumers share the same frontier progression.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `network-delay-current-${current}`,
          path: `state.distances.${current}`,
          kind: "node",
          intent: "active",
          label: `Relay from ${current}`
        }
      ]
    });

    for (const edge of adjacency.get(current) ?? []) {
      if (settled.has(edge.to)) {
        continue;
      }

      metrics.inspections += 1;
      activeEdge = [current, edge.to];
      const candidateDistance = distances[current]! + edge.weight;
      const previousDistance = distances[edge.to] ?? Number.POSITIVE_INFINITY;
      const hasImproved = candidateDistance < previousDistance;

      if (hasImproved) {
        distances[edge.to] = candidateDistance;
        frontier.add(edge.to);
        reachedNodes.add(edge.to);
        metrics.updates += 1;
      }

      syncMetrics(metrics, {
        settled: Array.from(settled),
        frontier: orderWeightedFrontier(frontier, distances)
      });

      recorder.push({
        phase: hasImproved ? "Relax" : "Inspect",
        description: hasImproved
          ? `Signal arrival for ${edge.to} improves to ${candidateDistance}, so the frontier promotes that relay candidate.`
          : `The candidate arrival ${candidateDistance} does not beat the current best signal time for ${edge.to}.`,
        explanation: {
          summary: hasImproved
            ? "Record the faster arrival time and refresh the weighted broadcast frontier."
            : "Inspect the weighted edge without changing the best-known arrival time.",
          details: hasImproved
            ? `${edge.to} is now reachable from ${normalizedGraph.start} in ${candidateDistance} time units through ${current}.`
            : `The best recorded arrival time for ${edge.to} remains ${formatGraphDistance(
                Number.isFinite(previousDistance) ? previousDistance : null
              )}.`,
          tags: ["edge", hasImproved ? "candidate" : "focus"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `network-delay-edge-${current}-${edge.to}-${metrics.inspections}`,
            path: "state.activeEdge",
            kind: "edge",
            intent: hasImproved ? "candidate" : "focus",
            label: `${current} -> ${edge.to} (${edge.weight})`
          }
        ]
      });
    }

    settled.add(current);
    activeEdge = [];
    syncMetrics(metrics, {
      settled: Array.from(settled),
      frontier: orderWeightedFrontier(frontier, distances)
    });

    recorder.push({
      phase: "Checkpoint",
      description:
        `Node ${current} is settled with its final arrival time, so replay can resume from this broadcast ledger without replaying earlier relaxations.`,
      explanation: {
        summary: "Seal the extracted relay once its earliest arrival time is final.",
        details:
          "This checkpoint preserves the settled relay set, the weighted frontier, and the reached-node ledger in one deterministic frame.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `network-delay-settled-${current}`,
          path: "state.settled",
          kind: "node",
          intent: "visited",
          label: `Settled ${current}`
        }
      ]
    });
  }

  allReached = reachedNodes.size === normalizedGraph.nodes.length;
  networkDelay = allReached
    ? Math.max(...normalizedGraph.nodes.map((node) => distances[node]!))
    : null;
  syncMetrics(metrics, {
    settled: Array.from(settled),
    frontier: orderWeightedFrontier(frontier, distances)
  });

  recorder.push({
    phase: allReached ? "Resolution" : "Unreachable",
    description: allReached
      ? `Every node receives the signal; the final network delay is ${networkDelay}.`
      : `The signal cannot reach every node from ${normalizedGraph.start}, so unreachable nodes remain in the terminal ledger.`,
    explanation: {
      summary: allReached
        ? "Publish the terminal weighted broadcast once the slowest reachable node is known."
        : "Publish the exhausted broadcast frontier and unreachable-node ledger together.",
      details: allReached
        ? "The final frame records the maximum settled arrival time directly so replay consumers do not need to recompute it from the distance table."
        : "The final frame keeps both the finite arrival ledger and the unreachable node list serialization-safe for replay, persistence, and diff inspection.",
      tags: ["result", allReached ? "path" : "collection"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "network-delay-final",
        path: allReached ? "state.networkDelay" : "state.unreachableNodes",
        kind: allReached ? "node" : "collection",
        intent: "result",
        label: allReached
          ? `Network delay ${networkDelay ?? 0}`
          : `Unreachable nodes ${normalizedGraph.nodes
              .filter((node) => !reachedNodes.has(node))
              .join(", ")}`
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

export function buildCountConnectedComponentsTrace(
  input: GraphValidTreeInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["count-connected-components"];
  const normalizedInput = normalizeGraphInput(
    input,
    "count-connected-components"
  ) as GraphValidTreeInput;
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
  const recorder = createCountConnectedComponentsRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: frontier.length,
    inspections: 0,
    updates: 0
  };

  const createRuntimeState = (): CountConnectedComponentsRuntimeState => ({
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
    componentCount
  });

  recorder.push({
    phase: "Initialization",
    description:
      "Each node starts in its own component and the edge queue stays in input order so replay can explain every merge and same-component no-op deterministically.",
    explanation: {
      summary: "Seed the Union-Find ledger with one singleton component per node before counting connected components.",
      details:
        "Replay stores the parent and rank ledgers directly, so component merges and cycle no-ops stay serializable without hidden mutable state.",
      tags: ["snapshot", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "count-components-init",
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
        summary: "Read both representatives before deciding whether the edge reduces the component count.",
        details:
          "Input-order inspection is part of the replay contract, so the representative comparison is recorded directly instead of inferred later.",
        tags: ["edge", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `count-components-inspect-${index}`,
          path: "state.activeEdge",
          kind: "edge",
          intent: "active",
          label: edgeLabel
        }
      ]
    });

    if (leftRoot === rightRoot) {
      rejectedEdges.push(edgeLabel);

      recorder.push({
        phase: "Cycle",
        description: `Edge ${edge[0]}-${edge[1]} stays inside component ${leftRoot}, so the connected-component count does not change.`,
        explanation: {
          summary: "A same-component edge is recorded as a no-op because it cannot merge separate groups.",
          details:
            "Replay keeps these no-op cycle edges explicit so the final component total never hides which scans failed to reduce the count.",
          tags: ["edge", "candidate"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `count-components-cycle-${index}`,
            path: "state.rejectedEdges",
            kind: "collection",
            intent: "candidate",
            label: `No-op ${edge[0]}-${edge[1]}`
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
            "The updated parent and rank ledgers are recorded in the same frame as the accepted edge so replay can reopen the exact component-count transition.",
          tags: ["edge", "frontier"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `count-components-union-${index}`,
            path: "state.acceptedEdges",
            kind: "collection",
            intent: "frontier",
            label: `Merge ${edge[0]}-${edge[1]}`
          }
        ]
      });
    }

    settled.push(edgeLabel);
    metrics.settled = settled.length;

    recorder.push({
      phase: "Checkpoint",
      description: `Edge ${edge[0]}-${edge[1]} is fully recorded in the connected-components ledger.`,
      explanation: {
        summary: "Seal the merge or no-op decision before moving to the next queued edge.",
        details:
          "This checkpoint stores the remaining edge queue, component groups, and Union-Find ledgers together so replay can scrub edge by edge without hidden transitions.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `count-components-settled-${index}`,
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
  metrics.frontier = frontier.length;
  metrics.settled = settled.length;

  recorder.push({
    phase: "Resolution",
    description:
      rejectedEdges.length > 0
        ? `Finished with ${componentCount} connected component${componentCount === 1 ? "" : "s"} after ${rejectedEdges.length} same-component edge${rejectedEdges.length === 1 ? "" : "s"} stayed inside existing groups.`
        : `Finished with ${componentCount} connected component${componentCount === 1 ? "" : "s"} after every accepted edge reduced the total.`,
    explanation: {
      summary: "Publish the final connected-component total together with the accepted merges and any same-component no-op edges.",
      details:
        rejectedEdges.length > 0
          ? "The terminal frame keeps both the component ledger and the no-op cycle-edge ledger explicit so replay can explain why some edges did not change the total."
          : "The terminal frame keeps the merged component groups explicit so replay never recomputes the final total from earlier unions.",
      tags: ["result", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "count-components-final",
        path: "state.components",
        kind: "collection",
        intent: "result",
        label: `${componentCount} component${componentCount === 1 ? "" : "s"}`
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

export function buildRedundantConnectionTrace(
  input: GraphValidTreeInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["redundant-connection"];
  const normalizedInput = normalizeGraphInput(
    input,
    "redundant-connection"
  ) as GraphValidTreeInput;
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
  let redundantEdge: string | null = null;
  let hasRedundantConnection: boolean | null = null;
  const recorder = createRedundantConnectionRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: frontier.length,
    inspections: 0,
    updates: 0
  };

  const createRuntimeState = (): RedundantConnectionRuntimeState => ({
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
    redundantEdge,
    hasRedundantConnection
  });

  recorder.push({
    phase: "Initialization",
    description:
      "Each node starts as its own representative and the input-order edge queue stays fixed so the first cycle-closing edge can be recovered deterministically.",
    explanation: {
      summary: "Seed the Union-Find ledger with one singleton component per node before scanning edges.",
      details:
        "The recorded parent and rank ledgers preserve the exact component state that produced the first redundant edge, so replay never has to rerun hidden unions.",
      tags: ["snapshot", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "redundant-connection-init",
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
        summary: "Read both representatives before deciding whether the edge closes a cycle.",
        details:
          "Input-order inspection is the contract for Redundant Connection, so replay records the representatives directly instead of inferring them later.",
        tags: ["edge", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `redundant-connection-inspect-${index}`,
          path: "state.activeEdge",
          kind: "edge",
          intent: "active",
          label: edgeLabel
        }
      ]
    });

    if (leftRoot === rightRoot) {
      rejectedEdges.push(edgeLabel);
      redundantEdge = edgeLabel;
      hasRedundantConnection = true;

      recorder.push({
        phase: "Cycle",
        description: `Edge ${edge[0]}-${edge[1]} is redundant because both endpoints already share component ${leftRoot}.`,
        explanation: {
          summary: "The first same-component edge is the redundant connection returned by the runtime.",
          details:
            "The cycle-closing edge is recorded immediately with the live component ledger so replay can justify the verdict without recomputing earlier unions.",
          tags: ["edge", "candidate"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `redundant-connection-cycle-${index}`,
            path: "state.redundantEdge",
            kind: "value",
            intent: "candidate",
            label: `Redundant ${edge[0]}-${edge[1]}`
          }
        ]
      });

      settled.push(edgeLabel);
      metrics.settled = settled.length;

      recorder.push({
        phase: "Checkpoint",
        description: `Edge ${edge[0]}-${edge[1]} is sealed as the first cycle-closing edge in input order.`,
        explanation: {
          summary: "Seal the redundant-edge verdict before publishing the terminal result.",
          details:
            "This checkpoint keeps the remaining frontier, accepted forest, and rejected edge explicit so the terminal frame can stay purely result-oriented.",
          tags: ["checkpoint", "visited"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `redundant-connection-settled-${index}`,
            path: "state.settled",
            kind: "collection",
            intent: "visited",
            label: edgeLabel
          }
        ]
      });

      break;
    }

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
        summary: "Commit one union because the edge still expands the forest without creating a cycle.",
        details:
          "The accepted forest and updated component ledger are recorded in the same frame so replay can reopen the exact state that led to the later redundant edge.",
        tags: ["edge", "frontier"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `redundant-connection-union-${index}`,
          path: "state.acceptedEdges",
          kind: "collection",
          intent: "frontier",
          label: `Accepted ${edge[0]}-${edge[1]}`
        }
      ]
    });

    settled.push(edgeLabel);
    metrics.settled = settled.length;

    recorder.push({
      phase: "Checkpoint",
      description: `Edge ${edge[0]}-${edge[1]} is fully recorded in the redundant-connection ledger.`,
      explanation: {
        summary: "Seal the accepted edge decision before moving to the next queued edge.",
        details:
          "This checkpoint stores the remaining edge queue, component groups, and accepted forest together so replay can scrub edge by edge without hidden transitions.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `redundant-connection-checkpoint-${index}`,
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
  hasRedundantConnection = redundantEdge !== null;

  recorder.push({
    phase: hasRedundantConnection ? "Resolution" : "No Cycle",
    description: hasRedundantConnection
      ? `Recovered ${redundantEdge} as the first cycle-closing edge in input order.`
      : "No edge closed a cycle, so the input never produced a redundant connection.",
    explanation: {
      summary: hasRedundantConnection
        ? "Publish the first redundant edge once the Union-Find scan detects a same-component link."
        : "Publish the final forest state when no redundant connection exists in the scanned input.",
      details: hasRedundantConnection
        ? "The terminal frame keeps the accepted forest, rejected edge list, and component ledger together so replay can justify why this specific edge is returned."
        : "The terminal frame preserves the final component ledger so replay can explain why every processed edge still expanded the forest.",
      tags: ["result", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "redundant-connection-final",
        path: hasRedundantConnection ? "state.redundantEdge" : "state.acceptedEdges",
        kind: hasRedundantConnection ? "value" : "collection",
        intent: "result",
        label: hasRedundantConnection ? "Redundant edge" : "Acyclic forest"
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

function buildCourseScheduleReplayTrace(
  input: CourseScheduleInput,
  algorithmId: "course-schedule" | "course-schedule-ii"
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions[algorithmId];
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
  const recorder = createCourseScheduleRecorder(normalizedInput, algorithmId);
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

export function buildCourseScheduleTrace(
  input: CourseScheduleInput
): TraceEnvelope<GraphExecutionState> {
  return buildCourseScheduleReplayTrace(input, "course-schedule");
}

export function buildCourseScheduleIiTrace(
  input: CourseScheduleInput
): TraceEnvelope<GraphExecutionState> {
  return buildCourseScheduleReplayTrace(input, "course-schedule-ii");
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

export function buildPacificAtlanticWaterFlowTrace(
  input: PacificAtlanticWaterFlowInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["pacific-atlantic-water-flow"];
  const normalizedInput = normalizePacificAtlanticWaterFlowInput(input);
  const grid = cloneGrid(normalizedInput.grid);
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  const settled: string[] = [];
  const frontier: string[] = [];
  const pacificSeeds: string[] = [];
  const atlanticSeeds: string[] = [];
  const pacificReachable = new Set<string>();
  const atlanticReachable = new Set<string>();
  const dualReachable = new Set<string>();
  const recorder = createPacificAtlanticWaterFlowRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: 0,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let activeEdge: string[] = [];
  let phaseMode: "pacific" | "atlantic" | "resolved" = "pacific";

  const addDualReachable = (cell: string) => {
    if (pacificReachable.has(cell) && atlanticReachable.has(cell)) {
      dualReachable.add(cell);
    }
  };

  const createRuntimeState = (): PacificAtlanticWaterFlowRuntimeState => ({
    grid,
    settled,
    frontier,
    current,
    activeEdge,
    phaseMode,
    pacificSeeds,
    atlanticSeeds,
    pacificReachable,
    atlanticReachable,
    dualReachable
  });

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      const cell = makeCellId(row, column);

      if ((row === 0 || column === 0) && !pacificReachable.has(cell)) {
        pacificReachable.add(cell);
        pacificSeeds.push(cell);
        frontier.push(cell);
      }
    }
  }

  metrics.frontier = frontier.length;
  metrics.updates = pacificSeeds.length;

  recorder.push({
    phase: "Initialization",
    description:
      "Seed the Pacific border first so replay can record reverse-flow reachability from the top and left edges in deterministic row-major order.",
    explanation: {
      summary: "Publish the Pacific ocean seeds before any reverse-flow expansion begins.",
      details:
        "The opening frame stores the border seed queue directly, so replay can explain why later reachability grows from edge-adjacent cells instead of reconstructing ocean contact on demand.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "pacific-atlantic-initial",
        path: "state.pacificSeeds",
        kind: "collection",
        intent: "focus",
        label: `${pacificSeeds.length} Pacific seed${pacificSeeds.length === 1 ? "" : "s"} ready`
      }
    ]
  });

  const runOceanPhase = (ocean: "pacific" | "atlantic") => {
    const currentReachable = ocean === "pacific" ? pacificReachable : atlanticReachable;
    const otherReachable = ocean === "pacific" ? atlanticReachable : pacificReachable;
    const oceanLabel = ocean === "pacific" ? "Pacific" : "Atlantic";

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
        description: `${formatCellLabel(currentCell)} leaves the ${oceanLabel} frontier and becomes the next reverse-flow source.`,
        explanation: {
          summary: `Expand the next ${oceanLabel} reachable cell in deterministic queue order.`,
          details:
            "Replay stores the active flow source before neighbor checks begin so the reachability frontier stays explicit across both ocean phases.",
          tags: ["frontier", "focus"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `pacific-atlantic-current-${ocean}-${currentCell}`,
            path: "state.current",
            kind: "node",
            intent: "active",
            label: `${oceanLabel} expands ${formatCellLabel(currentCell)}`
          }
        ]
      });

      const { row: currentRow, column: currentColumn } = parseCellId(currentCell);
      const currentHeight = grid[currentRow]![currentColumn]!;

      for (const neighbor of getNeighborCellIds(currentRow, currentColumn, rowCount, columnCount)) {
        const { row: neighborRow, column: neighborColumn } = parseCellId(neighbor);
        const neighborHeight = grid[neighborRow]![neighborColumn]!;
        activeEdge = [currentCell, neighbor];
        metrics.inspections += 1;

        if (neighborHeight < currentHeight) {
          recorder.push({
            phase: "Inspect",
            description: `Inspect ${formatCellLabel(neighbor)} and stop because height ${neighborHeight} cannot reverse-flow uphill from ${currentHeight} toward the ${oceanLabel} edge.`,
            explanation: {
              summary: "Reject a downhill neighbor during reverse-flow expansion.",
              details:
                "Pacific Atlantic reachability is computed in reverse, so only neighbors with height greater than or equal to the current cell can be marked reachable from the same ocean.",
              tags: ["edge", "focus"]
            },
            runtimeState: createRuntimeState(),
            metrics,
            highlights: [
              {
                key: `pacific-atlantic-blocked-${ocean}-${currentCell}-${neighbor}-${metrics.inspections}`,
                path: `state.grid.${neighborRow}.${neighborColumn}`,
                kind: "node",
                intent: "candidate",
                label: `Blocked by height at ${formatCellLabel(neighbor)}`
              }
            ]
          });
          continue;
        }

        if (currentReachable.has(neighbor)) {
          recorder.push({
            phase: "Inspect",
            description: `Inspect ${formatCellLabel(neighbor)} and keep the frontier stable because the ${oceanLabel} phase already marked it reachable.`,
            explanation: {
              summary: "Inspect a previously reached cell without re-enqueuing it.",
              details:
                "This keeps the ocean-specific reachability ledger deterministic and prevents replay from inferring deduplication from hidden visited state.",
              tags: ["edge", "visited"]
            },
            runtimeState: createRuntimeState(),
            metrics,
            highlights: [
              {
                key: `pacific-atlantic-known-${ocean}-${currentCell}-${neighbor}-${metrics.inspections}`,
                path: ocean === "pacific" ? "state.pacificReachable" : "state.atlanticReachable",
                kind: "collection",
                intent: "visited",
                label: `${formatCellLabel(neighbor)} already reaches ${oceanLabel}`
              }
            ]
          });
          continue;
        }

        currentReachable.add(neighbor);
        frontier.push(neighbor);
        metrics.frontier = frontier.length;
        metrics.updates += 1;

        const reachedBoth = otherReachable.has(neighbor);

        if (reachedBoth) {
          addDualReachable(neighbor);
        }

        recorder.push({
          phase: "Mark Reachable",
          description: reachedBoth
            ? `${formatCellLabel(neighbor)} now reaches both oceans after the ${oceanLabel} reverse-flow frontier climbs to height ${neighborHeight}.`
            : `${formatCellLabel(neighbor)} now reaches the ${oceanLabel} edge because reverse-flow can climb from height ${currentHeight} to ${neighborHeight}.`,
          explanation: {
            summary: reachedBoth
              ? "Mark one cell reachable from the current ocean and publish its dual-ocean intersection immediately."
              : `Mark one neighboring cell reachable from the ${oceanLabel} edge.`,
            details:
              "The recorded state updates the ocean-specific reachability set, frontier queue, and dual-ocean ledger in the same frame so replay can explain intersection cells without recomputation.",
            tags: ["edge", "frontier"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `pacific-atlantic-mark-${ocean}-${currentCell}-${neighbor}-${metrics.updates}`,
              path: reachedBoth ? "state.dualReachable" : ocean === "pacific" ? "state.pacificReachable" : "state.atlanticReachable",
              kind: "collection",
              intent: reachedBoth ? "result" : "frontier",
              label: reachedBoth
                ? `${formatCellLabel(neighbor)} reaches both oceans`
                : `${oceanLabel} reaches ${formatCellLabel(neighbor)}`
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
        description: `${formatCellLabel(currentCell)} is fully processed for the ${oceanLabel} reachability phase.`,
        explanation: {
          summary: "Seal one reverse-flow source after all of its neighbor checks are recorded.",
          details:
            "This checkpoint preserves the ocean reachability ledgers and frontier queue directly so replay can jump to any boundary between reachability updates.",
          tags: ["checkpoint", "visited"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `pacific-atlantic-settled-${ocean}-${currentCell}`,
            path: "state.settled",
            kind: "collection",
            intent: "visited",
            label: `${formatCellLabel(currentCell)} settled for ${oceanLabel}`
          }
        ]
      });
    }
  };

  runOceanPhase("pacific");

  phaseMode = "atlantic";
  current = null;
  activeEdge = [];

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      const cell = makeCellId(row, column);

      if ((row === rowCount - 1 || column === columnCount - 1) && !atlanticReachable.has(cell)) {
        atlanticReachable.add(cell);
        atlanticSeeds.push(cell);
        frontier.push(cell);
        addDualReachable(cell);
      }
    }
  }

  metrics.frontier = frontier.length;
  metrics.updates += atlanticSeeds.length;

  recorder.push({
    phase: "Atlantic Phase",
    description:
      "Switch to Atlantic border seeds so replay can record the second reverse-flow pass from the bottom and right edges before taking the intersection.",
    explanation: {
      summary: "Publish the Atlantic seed queue and any immediate overlap with the Pacific reachability ledger.",
      details:
        "The second-phase opening frame stores both ocean reachability sets directly, so dual-ocean cells do not depend on recomputation when replay jumps into the Atlantic pass.",
      tags: ["checkpoint", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "pacific-atlantic-atlantic-phase",
        path: "state.atlanticSeeds",
        kind: "collection",
        intent: "focus",
        label: `${atlanticSeeds.length} Atlantic seed${atlanticSeeds.length === 1 ? "" : "s"} queued`
      }
    ]
  });

  runOceanPhase("atlantic");

  phaseMode = "resolved";
  current = null;
  activeEdge = [];
  metrics.frontier = frontier.length;

  recorder.push({
    phase: "Resolution",
    description: `${dualReachable.size} cell${dualReachable.size === 1 ? "" : "s"} can reverse-flow to both oceans after both border passes complete.`,
    explanation: {
      summary: "Publish the dual-ocean intersection once Pacific and Atlantic reachability are both complete.",
      details:
        "The terminal frame preserves both ocean reachability ledgers and their final intersection directly, so replay can justify every dual-ocean cell without re-running either flood fill.",
      tags: ["result", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "pacific-atlantic-final",
        path: "state.dualReachable",
        kind: "collection",
        intent: "result",
        label: `${dualReachable.size} dual-ocean cell${dualReachable.size === 1 ? "" : "s"}`
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

export function buildMaxAreaOfIslandTrace(
  input: NumberOfIslandsInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["max-area-of-island"];
  const normalizedInput = normalizeNumberOfIslandsInput(input);
  const grid = cloneGrid(normalizedInput.grid);
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  const remainingLand = new Set<string>();
  const settled: string[] = [];
  const frontier: string[] = [];
  const completedIslands: string[][] = [];
  const completedAreas: number[] = [];
  const cellIslands: Record<string, number> = {};
  const recorder = createMaxAreaOfIslandRecorder();
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
  let activeIslandArea = 0;
  let maxArea = 0;
  let largestIslandId: number | null = null;
  let largestIsland: string[] = [];

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      if (grid[row]![column] === "1") {
        remainingLand.add(makeCellId(row, column));
      }
    }
  }

  const createRuntimeState = (): MaxAreaOfIslandRuntimeState => ({
    grid,
    settled,
    frontier,
    current,
    activeEdge,
    scan,
    islandCount,
    activeIslandId,
    activeIsland,
    activeIslandArea,
    completedIslands,
    completedAreas,
    cellIslands,
    remainingLand,
    maxArea,
    largestIslandId,
    largestIsland
  });

  recorder.push({
    phase: "Initialization",
    description:
      "The grid scan records every unresolved land cell before traversal starts so replay can compare each completed island area against a stable largest-island ledger.",
    explanation: {
      summary: "Seed the remaining-land ledger and reset the largest-area scoreboard before the first row-major scan step.",
      details:
        "The opening frame stores the full grid, every unresolved land coordinate, and a zeroed max-area outcome so replay never infers island sizes from hidden traversal state.",
      tags: ["snapshot", "result"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "max-area-of-island-initial",
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
          description: `Scan ${formatCellLabel(cell)} and skip water because it cannot grow the largest-island area ledger.`,
          explanation: {
            summary: "Advance the row-major scan across water without creating a frontier.",
            details:
              "Water still gets its own checkpoint so replay can explain why this cell does not affect either island discovery or the current max-area result.",
            tags: ["scan", "focus"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `max-area-of-island-water-${cell}`,
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
              "Replay records these passes explicitly so the scan order stays deterministic even after flood-fill work grows and scores an island before the cursor reaches later cells.",
            tags: ["scan", "visited"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `max-area-of-island-claimed-${cell}`,
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
      activeIslandArea = 1;
      frontier.push(cell);
      remainingLand.delete(cell);
      cellIslands[cell] = activeIslandId;
      metrics.frontier = frontier.length;
      metrics.updates += 1;

      recorder.push({
        phase: "Seed Island",
        description: `Land ${formatCellLabel(cell)} starts island ${activeIslandId} with area 1 and becomes the first frontier cell.`,
        explanation: {
          summary: "Start a new island when the row-major scan reaches unresolved land.",
          details:
            "The seed cell is claimed immediately so replay can show both the island count and the active island area rising before the rest of the component is explored.",
          tags: ["scan", "frontier"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `max-area-of-island-seed-${cell}`,
            path: "state.activeIslandArea",
            kind: "node",
            intent: "frontier",
            label: `Island ${activeIslandId} seeded at area 1`
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
          description: `Island ${activeIslandId} expands from ${formatCellLabel(currentCell)} with area ${activeIslandArea} against a current max of ${maxArea}.`,
          explanation: {
            summary: "Expand the next claimed land cell from the active island frontier.",
            details:
              "The queue order is recorded before neighbor checks begin so replay can compare live flood-fill growth against the current largest-island result without hidden bookkeeping.",
            tags: ["frontier", "result"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `max-area-of-island-current-${currentCell}`,
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
                summary: "Inspect a neighboring water cell without growing the active island.",
                details:
                  "Water adjacency is recorded explicitly so replay can explain why the candidate island area does not increase through that edge.",
                tags: ["edge", "focus"]
              },
              runtimeState: createRuntimeState(),
              metrics,
              highlights: [
                {
                  key: `max-area-of-island-water-edge-${currentCell}-${neighbor}-${metrics.inspections}`,
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
                  "This keeps island membership deterministic and prevents replay from inferring deduplication from hidden visited state while the max-area ledger stays unchanged.",
                tags: ["edge", "visited"]
              },
              runtimeState: createRuntimeState(),
              metrics,
              highlights: [
                {
                  key: `max-area-of-island-claimed-edge-${currentCell}-${neighbor}-${metrics.inspections}`,
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
          activeIslandArea += 1;
          remainingLand.delete(neighbor);
          cellIslands[neighbor] = activeIslandId;
          metrics.frontier = frontier.length;
          metrics.updates += 1;

          recorder.push({
            phase: "Expand",
            description: `Land ${formatCellLabel(neighbor)} joins island ${activeIslandId}, raising its area to ${activeIslandArea}.`,
            explanation: {
              summary: "Claim one neighboring land cell and append it to the active frontier.",
              details:
                "The recorded state includes the frontier queue, island membership, current island area, and remaining unresolved land so replay never rebuilds the largest-island candidate from scratch.",
              tags: ["edge", "frontier"]
            },
            runtimeState: createRuntimeState(),
            metrics,
            highlights: [
              {
                key: `max-area-of-island-expand-${currentCell}-${neighbor}-${metrics.updates}`,
                path: "state.activeIslandArea",
                kind: "node",
                intent: "frontier",
                label: `Island ${activeIslandId} grows to ${activeIslandArea}`
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
              "This checkpoint preserves the component frontier, processed land ledger, and current island area directly so replay can reopen any flood-fill boundary.",
            tags: ["checkpoint", "visited"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `max-area-of-island-settled-${currentCell}`,
              path: "state.settled",
              kind: "collection",
              intent: "visited",
              label: `${formatCellLabel(currentCell)} settled`
            }
          ]
        });
      }

      completedIslands.push(activeIsland.slice());
      completedAreas.push(activeIslandArea);
      current = null;
      activeEdge = [];
      metrics.frontier = frontier.length;

      if (activeIslandArea > maxArea) {
        maxArea = activeIslandArea;
        largestIslandId = activeIslandId;
        largestIsland = activeIsland.slice();

        recorder.push({
          phase: "Max Update",
          description: `Island ${activeIslandId} becomes the new largest island with area ${maxArea}.`,
          explanation: {
            summary: "Publish a new leading island area as soon as the active component closes.",
            details:
              "Replay records the winning island id, area, and cell membership directly so later frames can explain the final maximum without replay-time recomputation.",
            tags: ["checkpoint", "result"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `max-area-of-island-max-${activeIslandId}`,
              path: "state.maxArea",
              kind: "node",
              intent: "result",
              label: `Largest area now ${maxArea}`
            }
          ]
        });
      }

      recorder.push({
        phase: "Island Complete",
        description: `Island ${activeIslandId} closes with area ${activeIslandArea}.`,
        explanation: {
          summary: "Publish the completed connected component before the row-major scan resumes.",
          details:
            "Replay stores the full component membership and per-island area ledger so later scan steps can explain both why those cells no longer seed islands and how the current maximum was established.",
          tags: ["checkpoint", "result"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `max-area-of-island-complete-${activeIslandId}`,
            path: "state.completedAreas",
            kind: "collection",
            intent: "result",
            label: `Island ${activeIslandId} area ${activeIslandArea}`
          }
        ]
      });

      activeIslandId = null;
      activeIsland = [];
      activeIslandArea = 0;
    }
  }

  scan = null;
  current = null;
  activeEdge = [];
  metrics.frontier = frontier.length;

  recorder.push({
    phase: "Resolution",
    description: `The full row-major scan completes with a maximum island area of ${maxArea} across ${islandCount} island${islandCount === 1 ? "" : "s"}.`,
    explanation: {
      summary: "Publish the terminal largest-island area once every grid cell has been scanned or claimed.",
      details:
        "The terminal frame preserves the full per-island area ledger, the winning island membership, and the remaining-land set directly so replay can explain the final result without rerunning traversal.",
      tags: ["result", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "max-area-of-island-final",
        path: "state.maxArea",
        kind: "node",
        intent: "result",
        label: `Largest island area ${maxArea}`
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

type IslandEdgeInspection = {
  neighbor: string | null;
  direction: "north" | "east" | "south" | "west";
};

function getIslandEdgeInspections(
  row: number,
  column: number,
  rowCount: number,
  columnCount: number
): IslandEdgeInspection[] {
  const candidates: Array<IslandEdgeInspection & { nextRow: number; nextColumn: number }> = [
    {
      direction: "north",
      nextRow: row - 1,
      nextColumn: column,
      neighbor: null
    },
    {
      direction: "east",
      nextRow: row,
      nextColumn: column + 1,
      neighbor: null
    },
    {
      direction: "south",
      nextRow: row + 1,
      nextColumn: column,
      neighbor: null
    },
    {
      direction: "west",
      nextRow: row,
      nextColumn: column - 1,
      neighbor: null
    }
  ];

  return candidates.map(({ direction, nextRow, nextColumn }) => ({
    direction,
    neighbor:
      nextRow >= 0 && nextRow < rowCount && nextColumn >= 0 && nextColumn < columnCount
        ? makeCellId(nextRow, nextColumn)
        : null
  }));
}

function formatIslandBoundaryLabel(cell: string, direction: IslandEdgeInspection["direction"]) {
  return `${cell} ${direction} boundary`;
}

function formatIslandExposureLabel(
  cell: string,
  direction: IslandEdgeInspection["direction"],
  neighbor: string | null
) {
  if (neighbor === null) {
    return `${formatCellLabel(cell)} ${direction} boundary`;
  }

  return `${formatCellLabel(cell)} to water ${formatCellLabel(neighbor)}`;
}

export function buildIslandPerimeterTrace(
  input: NumberOfIslandsInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["island-perimeter"];
  const normalizedInput = normalizeNumberOfIslandsInput(input);
  const grid = cloneGrid(normalizedInput.grid);
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  const remainingLand = new Set<string>();
  const settled: string[] = [];
  const landCells: string[] = [];
  const exposedEdges: string[] = [];
  const recorder = createIslandPerimeterRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: 0,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let activeEdge: string[] = [];
  let scan: string | null = null;
  let currentContribution = 0;
  let perimeter = 0;

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      if (grid[row]![column] === "1") {
        const cell = makeCellId(row, column);
        landCells.push(cell);
        remainingLand.add(cell);
      }
    }
  }

  const createRuntimeState = (): IslandPerimeterRuntimeState => ({
    grid,
    settled,
    frontier: Array.from(remainingLand).sort(compareCellIds),
    current,
    activeEdge,
    scan,
    landCells,
    remainingLand,
    exposedEdges,
    currentContribution,
    perimeter
  });

  recorder.push({
    phase: "Initialization",
    description:
      "The grid scan records every land cell before perimeter accounting starts so replay can publish each exposed edge without rebuilding adjacency later.",
    explanation: {
      summary: "Seed the land ledger and zero the perimeter counter before the first row-major scan step.",
      details:
        "The opening frame stores every land coordinate directly so replay can explain both pending land cells and the final coastline length from recorded snapshots alone.",
      tags: ["snapshot", "result"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "island-perimeter-initial",
        path: "state.landCells",
        kind: "collection",
        intent: "focus",
        label: `${landCells.length} land cell${landCells.length === 1 ? "" : "s"} awaiting scan`
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
      currentContribution = 0;
      metrics.frontier = remainingLand.size;

      if (value === "0") {
        recorder.push({
          phase: "Scan",
          description: `Scan ${formatCellLabel(cell)} and skip water because it cannot contribute perimeter directly.`,
          explanation: {
            summary: "Advance the row-major scan across water without changing the perimeter ledger.",
            details:
              "Water cells still get explicit checkpoints so replay can explain why the running perimeter remains unchanged for that scan position.",
            tags: ["scan", "focus"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `island-perimeter-water-${cell}`,
              path: "state.scan",
              kind: "node",
              intent: "candidate",
              label: `Water ${formatCellLabel(cell)}`
            }
          ]
        });
        continue;
      }

      current = cell;

      recorder.push({
        phase: "Inspect Cell",
        description: `Inspect ${formatCellLabel(cell)} and start counting its exposed edges into the running perimeter.`,
        explanation: {
          summary: "Focus one land cell before its four edge inspections begin.",
          details:
            "Replay resets the per-cell contribution ledger here so each later edge update can be attributed to a single land cell deterministically.",
          tags: ["scan", "focus"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `island-perimeter-land-${cell}`,
            path: "state.current",
            kind: "node",
            intent: "active",
            label: `Inspect ${formatCellLabel(cell)}`
          }
        ]
      });

      for (const inspection of getIslandEdgeInspections(row, column, rowCount, columnCount)) {
        const neighbor = inspection.neighbor;
        activeEdge = [cell, neighbor ?? formatIslandBoundaryLabel(cell, inspection.direction)];
        metrics.inspections += 1;

        if (neighbor === null) {
          currentContribution += 1;
          perimeter += 1;
          exposedEdges.push(formatIslandExposureLabel(cell, inspection.direction, null));
          metrics.updates += 1;

          recorder.push({
            phase: "Expose Edge",
            description: `${formatCellLabel(cell)} adds 1 perimeter edge on its ${inspection.direction} boundary.`,
            explanation: {
              summary: "Count one out-of-bounds side as exposed coastline.",
              details:
                "The trace records boundary exposures explicitly so replay can explain perimeter growth without reconstructing missing neighbors outside the grid.",
              tags: ["edge", "result"]
            },
            runtimeState: createRuntimeState(),
            metrics,
            highlights: [
              {
                key: `island-perimeter-boundary-${cell}-${inspection.direction}-${metrics.updates}`,
                path: "state.perimeter",
                kind: "node",
                intent: "result",
                label: `Perimeter ${perimeter}`
              }
            ]
          });
          continue;
        }

        const { row: neighborRow, column: neighborColumn } = parseCellId(neighbor);
        const neighborValue = grid[neighborRow]![neighborColumn]!;

        if (neighborValue === "0") {
          currentContribution += 1;
          perimeter += 1;
          exposedEdges.push(formatIslandExposureLabel(cell, inspection.direction, neighbor));
          metrics.updates += 1;

          recorder.push({
            phase: "Expose Edge",
            description: `${formatCellLabel(cell)} adds 1 perimeter edge against water at ${formatCellLabel(neighbor)}.`,
            explanation: {
              summary: "Count one land-to-water side as exposed coastline.",
              details:
                "The trace stores each exposed edge in inspection order so replay can reopen the exact coastline ledger instead of recomputing adjacency from the grid.",
              tags: ["edge", "result"]
            },
            runtimeState: createRuntimeState(),
            metrics,
            highlights: [
              {
                key: `island-perimeter-water-edge-${cell}-${neighbor}-${metrics.updates}`,
                path: "state.perimeter",
                kind: "node",
                intent: "result",
                label: `Perimeter ${perimeter}`
              }
            ]
          });
          continue;
        }

        recorder.push({
          phase: "Shared Edge",
          description: `${formatCellLabel(cell)} shares its ${inspection.direction} side with land at ${formatCellLabel(neighbor)}, so the perimeter does not grow here.`,
          explanation: {
            summary: "Record a land-to-land adjacency without changing the running perimeter.",
            details:
              "Shared edges still get explicit checkpoints so replay can explain why some inspections preserve the current perimeter total.",
            tags: ["edge", "visited"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `island-perimeter-shared-${cell}-${neighbor}-${metrics.inspections}`,
              path: "state.activeEdge",
              kind: "edge",
              intent: "visited",
              label: "Shared land edge"
            }
          ]
        });
      }

      settled.push(cell);
      remainingLand.delete(cell);
      current = cell;
      activeEdge = [];
      metrics.settled = settled.length;
      metrics.frontier = remainingLand.size;

      recorder.push({
        phase: "Checkpoint",
        description: `${formatCellLabel(cell)} contributes ${currentContribution} edge${currentContribution === 1 ? "" : "s"} to the running perimeter.`,
        explanation: {
          summary: "Seal one land cell after all four edge inspections are recorded.",
          details:
            "This checkpoint preserves the per-cell contribution and cumulative perimeter directly so replay can jump to any coastline accounting boundary.",
          tags: ["checkpoint", "result"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `island-perimeter-settled-${cell}`,
            path: "state.currentContribution",
            kind: "node",
            intent: "result",
            label: `${formatCellLabel(cell)} adds ${currentContribution}`
          }
        ]
      });

      current = null;
      currentContribution = 0;
    }
  }

  scan = null;
  current = null;
  activeEdge = [];
  currentContribution = 0;
  metrics.frontier = remainingLand.size;

  recorder.push({
    phase: "Resolution",
    description: `The full row-major scan completes with an island perimeter of ${perimeter}.`,
    explanation: {
      summary: "Publish the terminal coastline length after every land cell finishes its four edge inspections.",
      details:
        "The terminal frame preserves the full exposed-edge ledger and settled land list directly so replay can explain the final perimeter without recomputing adjacency.",
      tags: ["result", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "island-perimeter-final",
        path: "state.perimeter",
        kind: "node",
        intent: "result",
        label: `Perimeter ${perimeter}`
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

export function buildShortestBridgeTrace(
  input: ShortestBridgeInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["shortest-bridge"];
  const normalizedInput = normalizeShortestBridgeInput(input);
  const grid = cloneGrid(normalizedInput.grid);
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  const settled: string[] = [];
  const settledLedger = new Set<string>();
  const frontier: string[] = [];
  const firstIsland = new Set<string>();
  const expandedWater = new Set<string>();
  const reachedSecondIsland: string[] = [];
  const bridgeDistanceByCell = new Map<string, number>();
  const recorder = createShortestBridgeRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: 0,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let activeEdge: string[] = [];
  let scan: string | null = makeCellId(0, 0);
  let phaseMode: "locate-island" | "mark-island" | "expand-bridge" | "resolved" =
    "locate-island";
  let wave = 0;
  let bridgeLength: number | null = null;

  const createRuntimeState = (): ShortestBridgeRuntimeState => ({
    grid,
    settled,
    frontier,
    current,
    activeEdge,
    scan,
    phaseMode,
    firstIsland,
    expandedWater,
    reachedSecondIsland,
    wave,
    bridgeLength
  });

  const settleCell = (cell: string) => {
    if (settledLedger.has(cell)) {
      return;
    }

    settledLedger.add(cell);
    settled.push(cell);
    metrics.settled = settled.length;
  };

  recorder.push({
    phase: "Initialization",
    description:
      "Start with a row-major scan so replay can show exactly where the first island is discovered before the bridge expansion begins.",
    explanation: {
      summary: "Publish the empty frontier, scan cursor, and bridge ledgers before any island cell is claimed.",
      details:
        "The opening frame stores the row-major scan cursor directly so replay never reconstructs where the first island search started.",
      tags: ["snapshot", "scan"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "shortest-bridge-init",
        path: "state.scan",
        kind: "node",
        intent: "focus",
        label: `Scan starts at ${formatCellLabel(scan ?? makeCellId(0, 0))}`
      }
    ]
  });

  let seedCell: string | null = null;

  findFirstIsland: for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      const cell = makeCellId(row, column);
      scan = cell;
      current = null;
      activeEdge = [];

      if (grid[row]![column] === 0) {
        recorder.push({
          phase: "Scan",
          description: `Inspect ${formatCellLabel(cell)} and continue because water cannot seed the first island.`,
          explanation: {
            summary: "Advance the row-major scan over water until the first land cell appears.",
            details:
              "Water scans remain explicit so replay can explain why the first island starts later in the grid.",
            tags: ["scan", "focus"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `shortest-bridge-scan-water-${cell}`,
              path: "state.scan",
              kind: "node",
              intent: "candidate",
              label: `Water at ${formatCellLabel(cell)}`
            }
          ]
        });
        continue;
      }

      seedCell = cell;
      phaseMode = "mark-island";
      frontier.push(cell);
      firstIsland.add(cell);
      metrics.frontier = frontier.length;
      metrics.updates += 1;

      recorder.push({
        phase: "Seed Island",
        description: `Land ${formatCellLabel(cell)} becomes the first-island seed and starts the deterministic marking frontier.`,
        explanation: {
          summary: "Stop the row-major search on the first land cell and seed the island frontier immediately.",
          details:
            "The seed cell is claimed in-place so replay can separate first-island discovery from later bridge expansion.",
          tags: ["scan", "frontier"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `shortest-bridge-seed-${cell}`,
            path: "state.firstIsland",
            kind: "collection",
            intent: "frontier",
            label: `Seed island at ${formatCellLabel(cell)}`
          }
        ]
      });

      scan = null;
      break findFirstIsland;
    }
  }

  if (seedCell === null) {
    phaseMode = "resolved";
    scan = null;

    recorder.push({
      phase: "No Island",
      description:
        "The row-major scan never finds land, so no first island exists to mark or expand into a bridge.",
      explanation: {
        summary: "Publish the empty-island result when the grid contains no land.",
        details:
          "The terminal frame keeps the scan result explicit so replay can explain why the bridge runtime never enters either BFS phase.",
        tags: ["result", "graph"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "shortest-bridge-no-island",
          path: "state.bridgeLength",
          kind: "value",
          intent: "result",
          label: "No island found"
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
    activeEdge = [];
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Extract",
      description: `${formatCellLabel(currentCell)} leaves the first-island queue as the next land cell to mark.`,
      explanation: {
        summary: "Expand the next claimed land cell from the first-island frontier.",
        details:
          "The queue order stays explicit so replay can follow the exact shape of the first island before bridge expansion starts.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `shortest-bridge-mark-current-${currentCell}`,
          path: "state.current",
          kind: "node",
          intent: "active",
          label: `Mark ${formatCellLabel(currentCell)}`
        }
      ]
    });

    const { row: currentRow, column: currentColumn } = parseCellId(currentCell);

    for (const neighbor of getNeighborCellIds(currentRow, currentColumn, rowCount, columnCount)) {
      const { row: neighborRow, column: neighborColumn } = parseCellId(neighbor);
      activeEdge = [currentCell, neighbor];
      metrics.inspections += 1;

      if (grid[neighborRow]![neighborColumn] === 0) {
        recorder.push({
          phase: "Inspect",
          description: `Inspect ${formatCellLabel(neighbor)} and keep the marking frontier stable because water defines the island boundary.`,
          explanation: {
            summary: "Inspect a water neighbor without extending the first-island frontier.",
            details:
              "Water boundaries remain explicit in the trace so replay can show exactly where island marking stops before the bridge phase begins.",
            tags: ["edge", "focus"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `shortest-bridge-boundary-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: `state.grid.${neighborRow}.${neighborColumn}`,
              kind: "node",
              intent: "candidate",
              label: `Water boundary ${formatCellLabel(neighbor)}`
            }
          ]
        });
        continue;
      }

      if (firstIsland.has(neighbor)) {
        recorder.push({
          phase: "Inspect",
          description: `Inspect ${formatCellLabel(neighbor)} and keep the queue stable because the first-island ledger already claimed that land cell.`,
          explanation: {
            summary: "Skip a previously claimed island cell without re-enqueuing it.",
            details:
              "This keeps the first-island membership deterministic and avoids hidden visited-state deductions during replay.",
            tags: ["edge", "visited"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `shortest-bridge-known-island-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: "state.firstIsland",
              kind: "collection",
              intent: "visited",
              label: `${formatCellLabel(neighbor)} already marked`
            }
          ]
        });
        continue;
      }

      firstIsland.add(neighbor);
      frontier.push(neighbor);
      metrics.frontier = frontier.length;
      metrics.updates += 1;

      recorder.push({
        phase: "Mark Land",
        description: `Land ${formatCellLabel(neighbor)} joins the first island and enters the deterministic marking queue.`,
        explanation: {
          summary: "Claim one neighboring land cell and append it to the first-island frontier.",
          details:
            "The recorded state keeps the island ledger and queue growth together so replay can reopen the exact island boundary without recomputation.",
          tags: ["edge", "frontier"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `shortest-bridge-mark-${currentCell}-${neighbor}-${metrics.updates}`,
            path: "state.firstIsland",
            kind: "collection",
            intent: "frontier",
            label: `Claim ${formatCellLabel(neighbor)}`
          }
        ]
      });
    }

    settleCell(currentCell);
    activeEdge = [];
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Checkpoint",
      description: `${formatCellLabel(currentCell)} is fully processed inside the first island.`,
      explanation: {
        summary: "Seal one land cell after its first-island neighbor inspections finish.",
        details:
          "This checkpoint preserves the claimed-island ledger and remaining frontier directly so replay can jump into the marking pass at any stable boundary.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `shortest-bridge-mark-settled-${currentCell}`,
          path: "state.settled",
          kind: "collection",
          intent: "visited",
          label: `${formatCellLabel(currentCell)} marked`
        }
      ]
    });
  }

  phaseMode = "expand-bridge";
  current = null;
  activeEdge = [];
  wave = 0;
  const firstIslandSources = Array.from(firstIsland).sort(compareCellIds);
  frontier.push(...firstIslandSources);
  for (const cell of firstIslandSources) {
    bridgeDistanceByCell.set(cell, 0);
  }
  metrics.frontier = frontier.length;

  recorder.push({
    phase: "Bridge Phase",
    description:
      "Restart the frontier from every first-island cell so the bridge BFS can expand outward in deterministic multi-source waves.",
    explanation: {
      summary: "Switch from island marking to bridge expansion using the full first-island boundary as the source set.",
      details:
        "The phase-change frame records the complete first-island ledger and row-major source order directly so replay can explain every later bridge wave without reconstructing seed cells.",
      tags: ["checkpoint", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "shortest-bridge-bridge-phase",
        path: "state.frontier",
        kind: "collection",
        intent: "focus",
        label: `${firstIslandSources.length} bridge source${firstIslandSources.length === 1 ? "" : "s"}`
      }
    ]
  });

  let resolvedBridge = false;

  bridgeSearch: while (frontier.length > 0) {
    const currentCell = frontier.shift();

    if (!currentCell) {
      break;
    }

    current = currentCell;
    activeEdge = [];
    wave = bridgeDistanceByCell.get(currentCell) ?? 0;
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Extract",
      description: firstIsland.has(currentCell)
        ? `${formatCellLabel(currentCell)} becomes a bridge source on wave ${wave}, expanding outward from the marked first island.`
        : `${formatCellLabel(currentCell)} leaves the bridge queue on wave ${wave} as the next flipped-water candidate.`,
      explanation: {
        summary: "Expand the next deterministic bridge source from the multi-source BFS queue.",
        details:
          "The bridge queue stores both original-island cells and later water expansions explicitly, so replay can show how the shortest bridge grows one wave at a time.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `shortest-bridge-expand-current-${currentCell}-${wave}`,
          path: "state.current",
          kind: "node",
          intent: "active",
          label: `Wave ${wave} at ${formatCellLabel(currentCell)}`
        }
      ]
    });

    const { row: currentRow, column: currentColumn } = parseCellId(currentCell);

    for (const neighbor of getNeighborCellIds(currentRow, currentColumn, rowCount, columnCount)) {
      const { row: neighborRow, column: neighborColumn } = parseCellId(neighbor);
      activeEdge = [currentCell, neighbor];
      metrics.inspections += 1;

      if (firstIsland.has(neighbor)) {
        recorder.push({
          phase: "Inspect",
          description: `Inspect ${formatCellLabel(neighbor)} and keep the bridge wave stable because it already belongs to the first island.`,
          explanation: {
            summary: "Skip a first-island cell during bridge expansion without re-enqueuing it.",
            details:
              "The first-island ledger stays explicit across both phases, so replay can distinguish original land from bridge water without hidden state.",
            tags: ["edge", "visited"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `shortest-bridge-first-island-edge-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: "state.firstIsland",
              kind: "collection",
              intent: "visited",
              label: `${formatCellLabel(neighbor)} stays on island one`
            }
          ]
        });
        continue;
      }

      if (grid[neighborRow]![neighborColumn] === 1) {
        reachedSecondIsland.push(neighbor);
        bridgeLength = wave;
        metrics.updates += 1;
        resolvedBridge = true;

        recorder.push({
          phase: "Contact",
          description: `Wave ${wave} reaches second-island land at ${formatCellLabel(neighbor)}, so the shortest bridge needs ${bridgeLength} flip${bridgeLength === 1 ? "" : "s"}.`,
          explanation: {
            summary: "Stop the bridge BFS on the first contact with land outside the marked first island.",
            details:
              "Because the bridge queue is breadth-first and deterministic, the first second-island contact locks the minimum number of water flips immediately.",
            tags: ["result", "edge"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `shortest-bridge-contact-${currentCell}-${neighbor}`,
              path: "state.reachedSecondIsland",
              kind: "collection",
              intent: "result",
              label: `Second island at ${formatCellLabel(neighbor)}`
            }
          ]
        });

        break bridgeSearch;
      }

      if (expandedWater.has(neighbor)) {
        recorder.push({
          phase: "Inspect",
          description: `Inspect ${formatCellLabel(neighbor)} and keep the bridge queue stable because that water cell already belongs to an earlier wave.`,
          explanation: {
            summary: "Skip a previously expanded water cell without duplicating the bridge frontier.",
            details:
              "This keeps the bridge-water ledger deterministic and prevents replay from inferring deduplication from hidden BFS state.",
            tags: ["edge", "visited"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `shortest-bridge-known-water-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: "state.expandedWater",
              kind: "collection",
              intent: "visited",
              label: `${formatCellLabel(neighbor)} already queued`
            }
          ]
        });
        continue;
      }

      expandedWater.add(neighbor);
      frontier.push(neighbor);
      bridgeDistanceByCell.set(neighbor, wave + 1);
      metrics.frontier = frontier.length;
      metrics.updates += 1;

      recorder.push({
        phase: "Expand Bridge",
        description: `Water ${formatCellLabel(neighbor)} joins bridge wave ${wave + 1} as a new flip candidate.`,
        explanation: {
          summary: "Append one water cell to the next bridge wave.",
          details:
            "The bridge frontier and expanded-water ledger update together in one frame so replay can show the exact wave where each flip candidate entered the search.",
          tags: ["edge", "frontier"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `shortest-bridge-expand-${currentCell}-${neighbor}-${metrics.updates}`,
            path: "state.expandedWater",
            kind: "collection",
            intent: "frontier",
            label: `Wave ${wave + 1} adds ${formatCellLabel(neighbor)}`
          }
        ]
      });
    }

    settleCell(currentCell);
    activeEdge = [];
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Checkpoint",
      description: `${formatCellLabel(currentCell)} is fully processed for bridge wave ${wave}.`,
      explanation: {
        summary: "Seal one bridge source after all of its expansion checks are recorded.",
        details:
          "This checkpoint stores the queued wave frontier, expanded-water ledger, and processed cells directly so replay can jump to any stable bridge boundary.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `shortest-bridge-expand-settled-${currentCell}-${wave}`,
          path: "state.settled",
          kind: "collection",
          intent: "visited",
          label: `${formatCellLabel(currentCell)} settled on wave ${wave}`
        }
      ]
    });
  }

  phaseMode = "resolved";
  current = null;
  activeEdge = [];
  metrics.frontier = frontier.length;

  recorder.push({
    phase: resolvedBridge ? "Resolution" : "No Bridge",
    description: resolvedBridge
      ? `The shortest bridge flips ${bridgeLength ?? 0} water cell${bridgeLength === 1 ? "" : "s"} between the two islands.`
      : "Bridge expansion exhausts every reachable water wave without touching a second island.",
    explanation: {
      summary: resolvedBridge
        ? "Publish the minimum bridge length once the first second-island contact is recorded."
        : "Publish the exhausted bridge frontier when no second island is reached.",
      details: resolvedBridge
        ? "The terminal frame preserves the marked first island, expanded-water ledger, and contacted second-island cell directly, so replay never recomputes the answer."
        : "The terminal frame keeps the fully expanded bridge-water ledger explicit so replay can explain the failure without rerunning BFS.",
      tags: ["result", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "shortest-bridge-final",
        path: resolvedBridge ? "state.bridgeLength" : "state.expandedWater",
        kind: resolvedBridge ? "value" : "collection",
        intent: "result",
        label: resolvedBridge
          ? `Bridge length ${bridgeLength ?? 0}`
          : "No second island reached"
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

export function buildShortestPathBinaryMatrixTrace(
  input: ShortestPathBinaryMatrixInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["shortest-path-binary-matrix"];
  const normalizedInput = normalizeShortestPathBinaryMatrixInput(input);
  const grid = cloneGrid(normalizedInput.grid);
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  const startCell = makeCellId(0, 0);
  const targetCell = makeCellId(rowCount - 1, columnCount - 1);
  const settled: string[] = [];
  const frontier: string[] = [];
  const path: string[] = [];
  const blockedCells = grid.flatMap((row, rowIndex) =>
    row.flatMap((value, columnIndex) =>
      value === 1 ? [makeCellId(rowIndex, columnIndex)] : []
    )
  );
  const visitedOpen = new Set<string>();
  const predecessors = new Map<string, string>();
  const recorder = createShortestPathBinaryMatrixRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: 0,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let activeEdge: string[] = [];
  let phaseMode: "search" | "traceback" | "resolved" = "search";
  let pathLength: number | null = null;
  let reachable: boolean | null = null;
  let foundCell: string | null = null;

  const createRuntimeState = (): ShortestPathBinaryMatrixRuntimeState => ({
    grid,
    settled,
    frontier,
    current,
    activeEdge,
    phaseMode,
    path,
    visitedOpen,
    blockedCells,
    pathLength,
    reachable
  });

  if (grid[0]![0] === 0) {
    frontier.push(startCell);
    visitedOpen.add(startCell);
    metrics.frontier = 1;
    metrics.updates = 1;
  }

  recorder.push({
    phase: "Initialization",
    description:
      "Seed the binary-matrix search from the top-left open cell and publish the blocked-cell ledger before the 8-direction BFS begins.",
    explanation: {
      summary: "Store the opening queue, blocked cells, and empty path directly in the first frame.",
      details:
        "The replay keeps the blocked-cell ledger explicit so every later frontier expansion and traceback step can be explained without rebuilding the matrix topology on demand.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "shortest-path-binary-matrix-init",
        path: "state.blockedCells",
        kind: "collection",
        intent: "focus",
        label: `${blockedCells.length} blocked cell${blockedCells.length === 1 ? "" : "s"}`
      }
    ]
  });

  if (grid[0]![0] === 1 || grid[rowCount - 1]![columnCount - 1] === 1) {
    phaseMode = "resolved";
    reachable = false;
    current = null;
    activeEdge = [];

    recorder.push({
      phase: "Blocked",
      description:
        "Stop immediately because the start or destination cell is blocked, so no binary-matrix path can exist.",
      explanation: {
        summary: "Publish the blocked endpoint result without entering the BFS loop.",
        details:
          "The trace records endpoint failure directly in the state snapshot so replay does not need to infer why the queue stayed empty.",
        tags: ["result", "graph"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "shortest-path-binary-matrix-blocked",
          path: "state.reachable",
          kind: "value",
          intent: "result",
          label: "No path"
        }
      ]
    });

    return buildGraphEnvelope(definition, normalizedInput, recorder);
  }

  searchLoop: while (frontier.length > 0) {
    const currentCell = frontier.shift();

    if (!currentCell) {
      break;
    }

    current = currentCell;
    activeEdge = [];
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Extract",
      description: `${formatCellLabel(currentCell)} leaves the BFS queue as the next binary-matrix search source.`,
      explanation: {
        summary: "Expand the next reachable open cell in deterministic queue order.",
        details:
          "Every extract frame records the active search source before neighbor inspection begins, which keeps the grid frontier explicit across the entire shortest-path search.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `shortest-path-binary-matrix-current-${currentCell}`,
          path: "state.current",
          kind: "node",
          intent: "active",
          label: `Expanding ${formatCellLabel(currentCell)}`
        }
      ]
    });

    if (currentCell === targetCell) {
      reachable = true;
      foundCell = currentCell;
      settled.push(currentCell);
      metrics.settled = settled.length;

      recorder.push({
        phase: "Target",
        description: `${formatCellLabel(currentCell)} is the destination, so the BFS search can stop and switch to traceback.`,
        explanation: {
          summary: "Stop search on the first destination extract because BFS guarantees a shortest path.",
          details:
            "The destination frame locks the search result before the traceback phase reconstructs the path directly into the replay state.",
          tags: ["result", "checkpoint"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `shortest-path-binary-matrix-target-${currentCell}`,
            path: "state.settled",
            kind: "collection",
            intent: "result",
            label: "Destination reached"
          }
        ]
      });
      break;
    }

    const { row: currentRow, column: currentColumn } = parseCellId(currentCell);

    for (const neighbor of getDiagonalNeighborCellIds(
      currentRow,
      currentColumn,
      rowCount,
      columnCount
    )) {
      const { row: neighborRow, column: neighborColumn } = parseCellId(neighbor);
      activeEdge = [currentCell, neighbor];
      metrics.inspections += 1;

      if (grid[neighborRow]![neighborColumn] === 1) {
        recorder.push({
          phase: "Inspect",
          description: `Inspect ${formatCellLabel(neighbor)} and stop because the cell is blocked.`,
          explanation: {
            summary: "Reject a blocked neighbor during the BFS expansion.",
            details:
              "Binary Matrix search only queues open cells, so blocked destinations are recorded as inspected but never discovered.",
            tags: ["edge", "focus"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `shortest-path-binary-matrix-blocked-edge-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: "state.blockedCells",
              kind: "collection",
              intent: "candidate",
              label: `${formatCellLabel(neighbor)} blocked`
            }
          ]
        });
        continue;
      }

      if (visitedOpen.has(neighbor)) {
        recorder.push({
          phase: "Inspect",
          description: `Inspect ${formatCellLabel(neighbor)} and keep the queue stable because the search already discovered that open cell.`,
          explanation: {
            summary: "Skip a previously discovered open cell without re-enqueuing it.",
            details:
              "This keeps the visited-open ledger deterministic and avoids hidden deduplication logic inside the replay.",
            tags: ["edge", "visited"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `shortest-path-binary-matrix-known-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: "state.visitedOpen",
              kind: "collection",
              intent: "visited",
              label: `${formatCellLabel(neighbor)} already discovered`
            }
          ]
        });
        continue;
      }

      visitedOpen.add(neighbor);
      frontier.push(neighbor);
      predecessors.set(neighbor, currentCell);
      metrics.frontier = frontier.length;
      metrics.updates += 1;

      const reachesTarget = neighbor === targetCell;

      recorder.push({
        phase: reachesTarget ? "Target Found" : "Enqueue",
        description: reachesTarget
          ? `${formatCellLabel(neighbor)} enters the queue as the first discovered destination, which locks the shortest path length before traceback.`
          : `${formatCellLabel(neighbor)} is open, so BFS records it as a new shortest-path candidate.`,
        explanation: {
          summary: reachesTarget
            ? "Discover the destination and stop the search after this shortest frontier expansion."
            : "Queue one newly discovered open cell for later expansion.",
          details:
            "The state update records the visited-open ledger, predecessor link, and queue growth in the same frame so replay can justify every later traceback edge.",
          tags: ["frontier", "edge"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `shortest-path-binary-matrix-enqueue-${currentCell}-${neighbor}-${metrics.updates}`,
            path: reachesTarget ? "state.frontier" : "state.visitedOpen",
            kind: "collection",
            intent: reachesTarget ? "result" : "frontier",
            label: reachesTarget
              ? "Destination queued"
              : `${formatCellLabel(neighbor)} discovered`
          }
        ]
      });

      if (reachesTarget) {
        reachable = true;
        foundCell = neighbor;
        settled.push(currentCell);
        metrics.settled = settled.length;
        activeEdge = [];

        recorder.push({
          phase: "Checkpoint",
          description: `${formatCellLabel(currentCell)} is sealed after discovering the destination on its search frontier.`,
          explanation: {
            summary: "Close the final search source before the trace transitions into traceback.",
            details:
              "This checkpoint keeps the BFS search and the path reconstruction phases distinct while preserving the settled and frontier ledgers exactly as they stood when the target was found.",
            tags: ["checkpoint", "visited"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `shortest-path-binary-matrix-checkpoint-${currentCell}`,
              path: "state.settled",
              kind: "collection",
              intent: "visited",
              label: `${formatCellLabel(currentCell)} settled`
            }
          ]
        });

        break searchLoop;
      }
    }

    if (reachable) {
      break;
    }

    settled.push(currentCell);
    activeEdge = [];
    metrics.settled = settled.length;
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Checkpoint",
      description: `${formatCellLabel(currentCell)} is fully processed after all 8-direction neighbor checks.`,
      explanation: {
        summary: "Seal one open cell after its BFS expansion finishes.",
        details:
          "The checkpoint frame stores the search queue and visited ledger directly so replay can jump to any settled boundary without rerunning neighbor scans.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `shortest-path-binary-matrix-settled-${currentCell}`,
          path: "state.settled",
          kind: "collection",
          intent: "visited",
          label: `${formatCellLabel(currentCell)} settled`
        }
      ]
    });
  }

  if (reachable && foundCell) {
    phaseMode = "traceback";
    current = foundCell;
    activeEdge = [];

    recorder.push({
      phase: "Traceback",
      description:
        "Switch from BFS expansion to predecessor traceback so replay can build the shortest path directly from the discovered destination.",
      explanation: {
        summary: "Begin reconstructing the shortest path from the destination back to the source.",
        details:
          "The path is published as an explicit ledger, not inferred from hidden predecessor tables during playback.",
        tags: ["checkpoint", "path"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "shortest-path-binary-matrix-traceback-start",
          path: "state.phaseMode",
          kind: "value",
          intent: "focus",
          label: "Traceback"
        }
      ]
    });

    let tracebackCell: string | null = foundCell;

    while (tracebackCell) {
      current = tracebackCell;
      const previousCell: string | null = predecessors.get(tracebackCell) ?? null;
      activeEdge = previousCell ? [previousCell, tracebackCell] : [];
      path.unshift(tracebackCell);

      recorder.push({
        phase: "Traceback",
        description: previousCell
          ? `${formatCellLabel(tracebackCell)} joins the shortest path, then traceback follows its predecessor to ${formatCellLabel(previousCell)}.`
          : `${formatCellLabel(tracebackCell)} closes the traceback as the source cell.`,
        explanation: {
          summary: previousCell
            ? "Prepend one predecessor-linked cell to the shortest path ledger."
            : "Finish the shortest path at the source cell.",
          details:
            "Each traceback frame grows the path ledger directly so the final route never depends on hidden predecessor reconstruction in the viewer.",
          tags: ["path", "checkpoint"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `shortest-path-binary-matrix-path-${tracebackCell}-${path.length}`,
            path: "state.path",
            kind: "collection",
            intent: "result",
            label: `${path.length} path cell${path.length === 1 ? "" : "s"}`
          }
        ]
      });

      tracebackCell = previousCell;
    }

    pathLength = path.length;
  } else {
    phaseMode = "resolved";
    current = null;
    activeEdge = [];
    reachable = false;

    recorder.push({
      phase: "No Path",
      description:
        "The BFS queue is empty before the destination is discovered, so the binary matrix has no open route to the bottom-right cell.",
      explanation: {
        summary: "Publish the unreachable result once the search frontier stalls.",
        details:
          "The terminal frame preserves the visited-open ledger directly, so replay can explain which open cells were reachable even though no full path exists.",
        tags: ["result", "graph"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "shortest-path-binary-matrix-no-path",
          path: "state.reachable",
          kind: "value",
          intent: "result",
          label: "No path"
        }
      ]
    });

    return buildGraphEnvelope(definition, normalizedInput, recorder);
  }

  phaseMode = "resolved";
  current = null;
  activeEdge = [];
  metrics.frontier = frontier.length;

  recorder.push({
    phase: "Resolution",
    description: `The shortest binary-matrix path is ${pathLength ?? 0} cell${pathLength === 1 ? "" : "s"} long after BFS and traceback both complete.`,
    explanation: {
      summary: "Publish the final shortest-path ledger and path length together.",
      details:
        "The terminal frame stores the exact route, the reachable outcome, and the final queue state directly so replay can justify the solution without recomputing BFS or predecessor chains.",
      tags: ["result", "path"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "shortest-path-binary-matrix-final",
        path: "state.path",
        kind: "collection",
        intent: "result",
        label: `${pathLength ?? 0} path cell${pathLength === 1 ? "" : "s"}`
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

export function buildNearestExitFromEntranceInMazeTrace(
  input: NearestExitFromEntranceInMazeInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["nearest-exit-from-entrance-in-maze"];
  const normalizedInput = normalizeNearestExitFromEntranceInMazeInput(input);
  const grid = cloneGrid(normalizedInput.grid);
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  const entranceCell = makeCellId(normalizedInput.entrance[0], normalizedInput.entrance[1]);
  const exits = grid
    .flatMap((row, rowIndex) =>
      row.flatMap((cell, columnIndex) => {
        const isBoundary =
          rowIndex === 0 ||
          columnIndex === 0 ||
          rowIndex === rowCount - 1 ||
          columnIndex === columnCount - 1;
        const cellId = makeCellId(rowIndex, columnIndex);

        return cell === "." && isBoundary && cellId !== entranceCell ? [cellId] : [];
      })
    )
    .sort(compareCellIds);
  const exitSet = new Set(exits);
  const blockedCells = grid
    .flatMap((row, rowIndex) =>
      row.flatMap((cell, columnIndex) =>
        cell === "+" ? [makeCellId(rowIndex, columnIndex)] : []
      )
    )
    .sort(compareCellIds);
  const settled: string[] = [];
  const frontier: string[] = [entranceCell];
  const visitedOpen = [entranceCell];
  const visitedOpenSet = new Set(visitedOpen);
  const path: string[] = [];
  const predecessors = new Map<string, string>();
  const recorder = createNearestExitFromEntranceInMazeRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: frontier.length,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let activeEdge: string[] = [];
  let phaseMode: "search" | "traceback" | "resolved" = "search";
  let reachable: boolean | null = null;
  let stepsToExit: number | null = null;
  let exit: string | null = null;

  const createRuntimeState = (): NearestExitFromEntranceInMazeRuntimeState => ({
    grid,
    settled,
    frontier,
    current,
    activeEdge,
    phaseMode,
    entrance: entranceCell,
    exits,
    path,
    visitedOpen,
    blockedCells,
    stepsToExit,
    reachable,
    exit
  });

  recorder.push({
    phase: "Initialization",
    description:
      exits.length > 0
        ? `${formatCellLabel(entranceCell)} seeds the maze BFS with ${exits.length} boundary exit candidate${exits.length === 1 ? "" : "s"}.`
        : `${formatCellLabel(entranceCell)} is open, but every boundary opening is either blocked or the entrance itself, so no valid exit candidate exists.`,
    explanation: {
      summary: "Seed the entrance and publish every valid boundary exit candidate before the BFS search begins.",
      details:
        "The opening frame stores the blocked-cell ledger, entrance cell, and ordered exit candidates directly so replay never has to infer which boundary openings count as valid exits.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "nearest-exit-from-entrance-in-maze-initial",
        path: exits.length > 0 ? "state.exits" : "state.entrance",
        kind: exits.length > 0 ? "collection" : "node",
        intent: "focus",
        label:
          exits.length > 0
            ? `${exits.length} exit candidate${exits.length === 1 ? "" : "s"}`
            : `Entrance ${formatCellLabel(entranceCell)}`
      }
    ]
  });

  if (exits.length === 0) {
    phaseMode = "resolved";
    reachable = false;
    stepsToExit = -1;

    recorder.push({
      phase: "Edge Case",
      description:
        "No boundary exit remains after excluding the entrance, so the maze replay returns -1 without expanding the BFS frontier.",
      explanation: {
        summary: "Publish the immediate -1 result when the maze contains no valid exit candidate.",
        details:
          "The terminal frame keeps the blocked-cell ledger and empty exit set explicit so replay can justify the failure without rescanning the grid.",
        tags: ["result", "graph"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "nearest-exit-from-entrance-in-maze-no-exit-candidate",
          path: "state.reachable",
          kind: "value",
          intent: "result",
          label: "Return -1"
        }
      ]
    });

    return buildGraphEnvelope(definition, normalizedInput, recorder);
  }

  searchLoop: while (frontier.length > 0) {
    const currentCell = frontier.shift();

    if (!currentCell) {
      break;
    }

    current = currentCell;
    activeEdge = [];
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Extract",
      description: `${formatCellLabel(currentCell)} leaves the BFS queue as the next maze search source.`,
      explanation: {
        summary: "Expand the next reachable open cell in deterministic queue order.",
        details:
          "Each extract frame records the active maze source before neighbor inspection begins, which keeps the search frontier explicit across the entire exit search.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `nearest-exit-from-entrance-in-maze-current-${currentCell}`,
          path: "state.current",
          kind: "node",
          intent: "active",
          label: `Expand ${formatCellLabel(currentCell)}`
        }
      ]
    });

    if (exitSet.has(currentCell)) {
      reachable = true;
      exit = currentCell;
      settled.push(currentCell);
      metrics.settled = settled.length;

      recorder.push({
        phase: "Exit",
        description: `${formatCellLabel(currentCell)} is the nearest boundary exit, so the BFS search can stop and switch to traceback.`,
        explanation: {
          summary: "Stop search on the first extracted exit because BFS guarantees the shortest escape path.",
          details:
            "The exit frame locks the winning boundary cell before traceback reconstructs the path directly into the replay state.",
          tags: ["result", "checkpoint"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `nearest-exit-from-entrance-in-maze-exit-${currentCell}`,
            path: "state.exit",
            kind: "node",
            intent: "result",
            label: `Exit ${formatCellLabel(currentCell)}`
          }
        ]
      });
      break;
    }

    const { row, column } = parseCellId(currentCell);

    for (const neighbor of getNeighborCellIds(row, column, rowCount, columnCount)) {
      const { row: neighborRow, column: neighborColumn } = parseCellId(neighbor);
      activeEdge = [currentCell, neighbor];
      metrics.inspections += 1;

      if (grid[neighborRow]![neighborColumn] === "+") {
        recorder.push({
          phase: "Inspect",
          description: `Inspect ${formatCellLabel(neighbor)} and stop because that maze cell is blocked.`,
          explanation: {
            summary: "Reject a blocked maze wall during the BFS expansion.",
            details:
              "Blocked cells stay explicit in the recorded grid and never enter the frontier, so replay does not infer wall handling from browser-only logic.",
            tags: ["edge", "focus"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `nearest-exit-from-entrance-in-maze-blocked-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: "state.blockedCells",
              kind: "collection",
              intent: "candidate",
              label: `${formatCellLabel(neighbor)} blocked`
            }
          ]
        });
        continue;
      }

      if (visitedOpenSet.has(neighbor)) {
        recorder.push({
          phase: "Inspect",
          description: `Inspect ${formatCellLabel(neighbor)} and keep the queue stable because BFS already discovered that open maze cell.`,
          explanation: {
            summary: "Skip a previously discovered open cell without re-enqueuing it.",
            details:
              "This preserves a deterministic visited ledger and avoids hidden deduplication during playback.",
            tags: ["edge", "visited"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `nearest-exit-from-entrance-in-maze-known-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: "state.visitedOpen",
              kind: "collection",
              intent: "visited",
              label: `${formatCellLabel(neighbor)} already discovered`
            }
          ]
        });
        continue;
      }

      visitedOpenSet.add(neighbor);
      visitedOpen.push(neighbor);
      frontier.push(neighbor);
      predecessors.set(neighbor, currentCell);
      metrics.frontier = frontier.length;
      metrics.updates += 1;

      const reachesExit = exitSet.has(neighbor);

      recorder.push({
        phase: reachesExit ? "Exit Found" : "Enqueue",
        description: reachesExit
          ? `${formatCellLabel(neighbor)} is the first discovered boundary exit, so replay locks that shortest escape candidate before traceback.`
          : `${formatCellLabel(neighbor)} is open, so BFS records it as a new maze path candidate.`,
        explanation: {
          summary: reachesExit
            ? "Discover the nearest exit and stop once this shortest frontier expansion is recorded."
            : "Queue one newly discovered open maze cell for later expansion.",
          details:
            "The state update records queue growth, the visited-open ledger, and the predecessor link together so replay can justify every later traceback edge.",
          tags: ["frontier", "edge"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `nearest-exit-from-entrance-in-maze-enqueue-${currentCell}-${neighbor}-${metrics.updates}`,
            path: reachesExit ? "state.exits" : "state.visitedOpen",
            kind: "collection",
            intent: reachesExit ? "result" : "frontier",
            label: reachesExit
              ? `Exit ${formatCellLabel(neighbor)} queued`
              : `${formatCellLabel(neighbor)} discovered`
          }
        ]
      });

      if (reachesExit) {
        reachable = true;
        exit = neighbor;
        settled.push(currentCell);
        metrics.settled = settled.length;
        activeEdge = [];

        recorder.push({
          phase: "Checkpoint",
          description: `${formatCellLabel(currentCell)} is sealed after discovering the nearest exit on its search frontier.`,
          explanation: {
            summary: "Close the final search source before the trace transitions into traceback.",
            details:
              "This checkpoint keeps the BFS search and the path reconstruction phases distinct while preserving the settled and frontier ledgers exactly as they stood when the exit was found.",
            tags: ["checkpoint", "visited"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `nearest-exit-from-entrance-in-maze-checkpoint-${currentCell}`,
              path: "state.settled",
              kind: "collection",
              intent: "visited",
              label: `${formatCellLabel(currentCell)} settled`
            }
          ]
        });

        break searchLoop;
      }
    }

    if (reachable) {
      break;
    }

    settled.push(currentCell);
    activeEdge = [];
    metrics.settled = settled.length;
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Checkpoint",
      description: `${formatCellLabel(currentCell)} is fully processed after all 4-direction maze neighbor checks.`,
      explanation: {
        summary: "Seal one open maze cell after its BFS expansion finishes.",
        details:
          "The checkpoint frame stores the queue and visited ledger directly so replay can jump to any settled boundary without rerunning neighbor scans.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `nearest-exit-from-entrance-in-maze-settled-${currentCell}`,
          path: "state.settled",
          kind: "collection",
          intent: "visited",
          label: `${formatCellLabel(currentCell)} settled`
        }
      ]
    });
  }

  if (reachable && exit) {
    phaseMode = "traceback";
    current = exit;
    activeEdge = [];

    recorder.push({
      phase: "Traceback",
      description:
        "Switch from maze BFS expansion to predecessor traceback so replay can build the shortest escape route directly from the discovered exit.",
      explanation: {
        summary: "Begin reconstructing the nearest-exit path from the discovered boundary cell back to the entrance.",
        details:
          "The path is published as an explicit ledger instead of being inferred from hidden predecessor tables during playback.",
        tags: ["checkpoint", "path"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "nearest-exit-from-entrance-in-maze-traceback-start",
          path: "state.phaseMode",
          kind: "value",
          intent: "focus",
          label: "Traceback"
        }
      ]
    });

    let tracebackCell: string | null = exit;

    while (tracebackCell) {
      current = tracebackCell;
      const previousCell: string | null = predecessors.get(tracebackCell) ?? null;
      activeEdge = previousCell ? [previousCell, tracebackCell] : [];
      path.unshift(tracebackCell);

      recorder.push({
        phase: "Traceback",
        description: previousCell
          ? `${formatCellLabel(tracebackCell)} joins the escape route, then traceback follows its predecessor to ${formatCellLabel(previousCell)}.`
          : `${formatCellLabel(tracebackCell)} closes the traceback as the entrance cell.`,
        explanation: {
          summary: previousCell
            ? "Prepend one predecessor-linked maze cell to the escape path ledger."
            : "Finish the escape path at the entrance.",
          details:
            "Each traceback frame grows the path ledger directly so the final route never depends on hidden predecessor reconstruction in the viewer.",
          tags: ["path", "checkpoint"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `nearest-exit-from-entrance-in-maze-path-${tracebackCell}-${path.length}`,
            path: "state.path",
            kind: "collection",
            intent: "result",
            label: `${path.length} path cell${path.length === 1 ? "" : "s"}`
          }
        ]
      });

      tracebackCell = previousCell;
    }

    stepsToExit = path.length - 1;
  } else {
    phaseMode = "resolved";
    current = null;
    activeEdge = [];
    reachable = false;
    stepsToExit = -1;

    recorder.push({
      phase: "No Path",
      description:
        "The BFS queue is empty before any boundary exit is discovered, so the maze has no escape route from the entrance.",
      explanation: {
        summary: "Publish the unreachable result once the maze frontier stalls.",
        details:
          "The terminal frame preserves the visited-open ledger directly, so replay can explain which cells were reachable even though no exit path exists.",
        tags: ["result", "graph"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "nearest-exit-from-entrance-in-maze-no-path",
          path: "state.reachable",
          kind: "value",
          intent: "result",
          label: "Return -1"
        }
      ]
    });

    return buildGraphEnvelope(definition, normalizedInput, recorder);
  }

  phaseMode = "resolved";
  current = null;
  activeEdge = [];
  metrics.frontier = frontier.length;

  recorder.push({
    phase: "Resolution",
    description: `The nearest maze exit is ${formatCellLabel(exit!)} after ${stepsToExit ?? 0} step${stepsToExit === 1 ? "" : "s"} of BFS and traceback.`,
    explanation: {
      summary: "Publish the final escape route together with the returned step count.",
      details:
        "The terminal frame stores the exact exit cell, route ledger, and returned step count directly so replay can justify the maze answer without recomputing predecessor chains.",
      tags: ["result", "path"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "nearest-exit-from-entrance-in-maze-final",
        path: "state.path",
        kind: "collection",
        intent: "result",
        label: `${stepsToExit ?? 0} step${stepsToExit === 1 ? "" : "s"}`
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

export function buildShortestPathGridWithObstaclesEliminationTrace(
  input: ShortestPathGridWithObstaclesEliminationInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["shortest-path-in-a-grid-with-obstacles-elimination"];
  const normalizedInput = normalizeShortestPathGridWithObstaclesEliminationInput(input);
  const grid = cloneGrid(normalizedInput.grid);
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  const startCell = makeCellId(0, 0);
  const targetCell = makeCellId(rowCount - 1, columnCount - 1);
  const startState = makeBudgetStateId(startCell, normalizedInput.eliminations);
  const settledStates: string[] = [];
  const frontierStates: string[] = [startState];
  const visitedOpen = new Set<string>([startCell]);
  const visitedObstacles = new Set<string>();
  const path: string[] = [];
  const obstacleCells = grid
    .flatMap((row, rowIndex) =>
      row.flatMap((cell, columnIndex) =>
        cell === 1 ? [makeCellId(rowIndex, columnIndex)] : []
      )
    )
    .sort(compareCellIds);
  const bestRemainingByCell: Record<string, number> = {
    [startCell]: normalizedInput.eliminations
  };
  const eliminatedCells: string[] = [];
  const predecessors = new Map<string, string>();
  const recorder = createShortestPathGridWithObstaclesEliminationRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: frontierStates.length,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let currentState: string | null = null;
  let currentBudget: number | null = null;
  let activeEdge: string[] = [];
  let phaseMode: "search" | "traceback" | "resolved" = "search";
  let remainingEliminations: number | null = null;
  let stepsToTarget: number | null = null;
  let reachable: boolean | null = null;
  let winningState: string | null = null;

  const createRuntimeState = (): ShortestPathGridWithObstaclesEliminationRuntimeState => ({
    grid,
    settledStates,
    frontierStates,
    current,
    currentState,
    currentBudget,
    activeEdge,
    phaseMode,
    start: startCell,
    target: targetCell,
    path,
    obstacleCells,
    visitedOpen,
    visitedObstacles,
    bestRemainingByCell,
    eliminatedCells,
    eliminations: normalizedInput.eliminations,
    remainingEliminations,
    stepsToTarget,
    reachable
  });

  recorder.push({
    phase: "Initialization",
    description: `${formatCellLabel(startCell)} seeds the obstacle-budget BFS with ${normalizedInput.eliminations} elimination${normalizedInput.eliminations === 1 ? "" : "s"} available before targeting ${formatCellLabel(targetCell)}.`,
    explanation: {
      summary:
        "Publish the start cell, target cell, obstacle map, and elimination budget before the augmented BFS search begins.",
      details:
        "The opening frame makes the obstacle budget explicit in replay state, so later revisits can justify why one cell is re-queued with a stronger remaining budget instead of relying on hidden dominance checks.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "shortest-path-obstacle-elimination-initial",
        path: "state.target",
        kind: "node",
        intent: "focus",
        label: `Target ${formatCellLabel(targetCell)}`
      }
    ]
  });

  searchLoop: while (frontierStates.length > 0) {
    const extractedState = frontierStates.shift();

    if (!extractedState) {
      break;
    }

    const { cell: currentCell, remainingBudget } = parseBudgetStateId(extractedState);
    current = currentCell;
    currentState = extractedState;
    currentBudget = remainingBudget;
    activeEdge = [];
    metrics.frontier = frontierStates.length;

    recorder.push({
      phase: "Extract",
      description: `${formatCellLabel(currentCell)} leaves the BFS queue with ${remainingBudget} elimination${remainingBudget === 1 ? "" : "s"} remaining.`,
      explanation: {
        summary: "Expand the next queued grid state in deterministic queue order.",
        details:
          "The extract frame records both the active cell and its remaining obstacle budget so replay can distinguish a plain revisit from a strictly stronger state.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `shortest-path-obstacle-elimination-current-${extractedState}`,
          path: "state.currentState",
          kind: "node",
          intent: "active",
          label: `${formatCellLabel(currentCell)} · k=${remainingBudget}`
        }
      ]
    });

    if (currentCell === targetCell) {
      reachable = true;
      winningState = extractedState;
      settledStates.push(extractedState);
      metrics.settled = settledStates.length;

      recorder.push({
        phase: "Target",
        description: `${formatCellLabel(currentCell)} is the destination, so replay can stop search and switch to traceback with ${remainingBudget} elimination${remainingBudget === 1 ? "" : "s"} still available.`,
        explanation: {
          summary: "Stop on the first extracted destination state because BFS guarantees the minimum number of steps.",
          details:
            "The winning state includes the remaining budget, so the replay can explain not just the path length but how much obstacle slack survived the shortest route.",
          tags: ["result", "checkpoint"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `shortest-path-obstacle-elimination-target-${extractedState}`,
            path: "state.target",
            kind: "node",
            intent: "result",
            label: `Target ${formatCellLabel(currentCell)}`
          }
        ]
      });
      break;
    }

    const { row, column } = parseCellId(currentCell);

    for (const neighbor of getNeighborCellIds(row, column, rowCount, columnCount)) {
      const { row: neighborRow, column: neighborColumn } = parseCellId(neighbor);
      const isObstacle = grid[neighborRow]![neighborColumn] === 1;
      const nextBudget = remainingBudget - (isObstacle ? 1 : 0);

      activeEdge = [currentCell, neighbor];
      metrics.inspections += 1;

      if (nextBudget < 0) {
        recorder.push({
          phase: "Inspect",
          description: `Inspect ${formatCellLabel(neighbor)} and stop because it is an obstacle but the active state has no elimination budget left.`,
          explanation: {
            summary: "Reject an obstacle when the current BFS state cannot spend another elimination.",
            details:
              "The obstacle ledger stays explicit in replay state, so the viewer can explain why this edge stalled without recalculating budget rules in the browser.",
            tags: ["edge", "budget"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `shortest-path-obstacle-elimination-budget-stop-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: "state.obstacleCells",
              kind: "collection",
              intent: "candidate",
              label: `${formatCellLabel(neighbor)} needs budget`
            }
          ]
        });
        continue;
      }

      const bestSeen = bestRemainingByCell[neighbor];

      if (typeof bestSeen === "number" && nextBudget <= bestSeen) {
        recorder.push({
          phase: "Inspect",
          description: `Inspect ${formatCellLabel(neighbor)} and skip it because replay already holds an equal-or-stronger state with ${bestSeen} elimination${bestSeen === 1 ? "" : "s"} remaining.`,
          explanation: {
            summary: "Prune dominated revisits when the cell already has a better remaining-budget state.",
            details:
              "The best-budget ledger is stored directly in the trace so replay can justify state compression without relying on hidden queue deduplication logic.",
            tags: ["edge", "budget"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `shortest-path-obstacle-elimination-dominated-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: "state.bestRemainingByCell",
              kind: "collection",
              intent: "visited",
              label: `${formatCellLabel(neighbor)} already stronger`
            }
          ]
        });
        continue;
      }

      const neighborState = makeBudgetStateId(neighbor, nextBudget);
      bestRemainingByCell[neighbor] = nextBudget;
      frontierStates.push(neighborState);
      predecessors.set(neighborState, extractedState);
      metrics.frontier = frontierStates.length;
      metrics.updates += 1;

      if (isObstacle) {
        visitedObstacles.add(neighbor);
      } else {
        visitedOpen.add(neighbor);
      }

      const reachesTarget = neighbor === targetCell;

      recorder.push({
        phase: reachesTarget ? "Target Found" : "Enqueue",
        description: reachesTarget
          ? `${formatCellLabel(neighbor)} reaches the destination with ${nextBudget} elimination${nextBudget === 1 ? "" : "s"} remaining, so replay locks that shortest route candidate before traceback.`
          : isObstacle
            ? `${formatCellLabel(neighbor)} spends one obstacle elimination and joins the BFS frontier with ${nextBudget} budget remaining.`
            : `${formatCellLabel(neighbor)} is open, so replay records it as a new queued state with ${nextBudget} elimination${nextBudget === 1 ? "" : "s"} remaining.`,
        explanation: {
          summary: reachesTarget
            ? "Discover the destination and stop once the shortest budget-aware frontier expansion is recorded."
            : isObstacle
              ? "Queue an obstacle cell only after spending one elimination from the active state."
              : "Queue one newly discovered open cell with its carried obstacle budget.",
          details:
            "Each enqueue frame stores the new frontier state and the updated best-budget ledger together so replay can justify later traceback edges and dominated-state skips.",
          tags: ["frontier", "budget"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `shortest-path-obstacle-elimination-enqueue-${currentCell}-${neighbor}-${metrics.updates}`,
            path: reachesTarget ? "state.target" : "state.frontierStates",
            kind: reachesTarget ? "node" : "collection",
            intent: reachesTarget ? "result" : "frontier",
            label: reachesTarget
              ? `Target ${formatCellLabel(neighbor)} queued`
              : `${formatCellLabel(neighbor)} · k=${nextBudget}`
          }
        ]
      });

      if (reachesTarget) {
        reachable = true;
        winningState = neighborState;
        settledStates.push(extractedState);
        metrics.settled = settledStates.length;
        activeEdge = [];

        recorder.push({
          phase: "Checkpoint",
          description: `${formatCellLabel(currentCell)} is sealed after its neighbor expansion discovers the destination state.`,
          explanation: {
            summary: "Close the final search source before replay transitions into traceback.",
            details:
              "This checkpoint keeps the search frontier, settled-state ledger, and budget map explicit at the exact moment the winning target state enters the queue.",
            tags: ["checkpoint", "visited"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `shortest-path-obstacle-elimination-checkpoint-${extractedState}`,
              path: "state.settledStates",
              kind: "collection",
              intent: "visited",
              label: `${formatCellLabel(currentCell)} · k=${remainingBudget}`
            }
          ]
        });

        break searchLoop;
      }
    }

    if (reachable) {
      break;
    }

    settledStates.push(extractedState);
    activeEdge = [];
    metrics.settled = settledStates.length;
    metrics.frontier = frontierStates.length;

    recorder.push({
      phase: "Checkpoint",
      description: `${formatCellLabel(currentCell)} is fully processed with ${remainingBudget} elimination${remainingBudget === 1 ? "" : "s"} remaining after all 4-direction checks.`,
      explanation: {
        summary: "Seal one augmented BFS state after its neighbor expansion completes.",
        details:
          "The checkpoint stores the settled-state ledger and best-budget map directly so replay can jump between queue boundaries without recomputing state dominance.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `shortest-path-obstacle-elimination-settled-${extractedState}`,
          path: "state.settledStates",
          kind: "collection",
          intent: "visited",
          label: `${formatCellLabel(currentCell)} · k=${remainingBudget}`
        }
      ]
    });
  }

  if (reachable && winningState) {
    phaseMode = "traceback";
    const winningSnapshot = parseBudgetStateId(winningState);
    current = winningSnapshot.cell;
    currentState = winningState;
    currentBudget = winningSnapshot.remainingBudget;
    activeEdge = [];

    recorder.push({
      phase: "Traceback",
      description:
        "Switch from budget-aware BFS expansion to predecessor traceback so replay can build the exact shortest route and mark which obstacles were actually eliminated.",
      explanation: {
        summary: "Begin reconstructing the winning path from the destination state back to the start state.",
        details:
          "The traceback frames grow both the path ledger and the eliminated-obstacle ledger directly, so the viewer never has to infer which obstacle visits were part of the final route.",
        tags: ["checkpoint", "path"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "shortest-path-obstacle-elimination-traceback-start",
          path: "state.phaseMode",
          kind: "value",
          intent: "focus",
          label: "Traceback"
        }
      ]
    });

    let tracebackState: string | null = winningState;

    while (tracebackState) {
      const { cell, remainingBudget } = parseBudgetStateId(tracebackState);
      const { row, column } = parseCellId(cell);
      const previousState: string | null = predecessors.get(tracebackState) ?? null;
      const previousCell = previousState ? parseBudgetStateId(previousState).cell : null;

      current = cell;
      currentState = tracebackState;
      currentBudget = remainingBudget;
      activeEdge = previousCell ? [previousCell, cell] : [];
      path.unshift(cell);

      if (grid[row]![column] === 1) {
        eliminatedCells.unshift(cell);
      }

      recorder.push({
        phase: "Traceback",
        description: previousCell
          ? `${formatCellLabel(cell)} joins the final route with ${remainingBudget} elimination${remainingBudget === 1 ? "" : "s"} remaining, then traceback follows its predecessor to ${formatCellLabel(previousCell)}.`
          : `${formatCellLabel(cell)} closes the traceback as the start cell.`,
        explanation: {
          summary: previousCell
            ? "Prepend one predecessor-linked budget state to the final route ledger."
            : "Finish the route at the start cell.",
          details:
            "Each traceback frame records the current state's remaining budget directly, which keeps obstacle spending visible across the final route instead of hiding it in predecessor metadata.",
          tags: ["path", "checkpoint"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `shortest-path-obstacle-elimination-path-${tracebackState}-${path.length}`,
            path: "state.path",
            kind: "collection",
            intent: "result",
            label: `${path.length} path cell${path.length === 1 ? "" : "s"}`
          }
        ]
      });

      tracebackState = previousState;
    }

    stepsToTarget = path.length - 1;
    remainingEliminations = winningSnapshot.remainingBudget;
  } else {
    phaseMode = "resolved";
    current = null;
    currentState = null;
    currentBudget = null;
    activeEdge = [];
    reachable = false;
    stepsToTarget = -1;
    remainingEliminations = null;

    recorder.push({
      phase: "No Path",
      description:
        "The BFS queue is empty before any budget-feasible target state is discovered, so the grid returns -1.",
      explanation: {
        summary: "Publish the unreachable result once every budget-aware frontier state has been exhausted.",
        details:
          "The terminal frame keeps the best-budget ledger and every visited obstacle/open cell explicit so replay can explain which regions were reachable before the search stalled.",
        tags: ["result", "graph"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "shortest-path-obstacle-elimination-no-path",
          path: "state.reachable",
          kind: "value",
          intent: "result",
          label: "Return -1"
        }
      ]
    });

    return buildGraphEnvelope(definition, normalizedInput, recorder);
  }

  phaseMode = "resolved";
  current = null;
  currentState = null;
  currentBudget = null;
  activeEdge = [];
  metrics.frontier = frontierStates.length;

  recorder.push({
    phase: "Resolution",
    description: `The shortest route reaches ${formatCellLabel(targetCell)} in ${stepsToTarget ?? 0} step${stepsToTarget === 1 ? "" : "s"} with ${remainingEliminations ?? 0} elimination${remainingEliminations === 1 ? "" : "s"} remaining.`,
    explanation: {
      summary: "Publish the final route together with the surviving obstacle budget.",
      details:
        "The terminal frame stores the cell path, the subset of eliminated obstacle cells, and the remaining budget directly so replay can justify the returned answer without recomputing augmented BFS state.",
      tags: ["result", "path"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "shortest-path-obstacle-elimination-final",
        path: "state.path",
        kind: "collection",
        intent: "result",
        label: `${stepsToTarget ?? 0} step${stepsToTarget === 1 ? "" : "s"}`
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

export function buildMinimumObstacleRemovalToReachCornerTrace(
  input: MinimumObstacleRemovalToReachCornerInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["minimum-obstacle-removal-to-reach-corner"];
  const normalizedInput = normalizeMinimumObstacleRemovalToReachCornerInput(input);
  const grid = cloneGrid(normalizedInput.grid);
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  const startCell = makeCellId(0, 0);
  const targetCell = makeCellId(rowCount - 1, columnCount - 1);
  const settled: string[] = [];
  const frontier: string[] = [startCell];
  const visitedOpen = new Set<string>();
  const visitedObstacles = new Set<string>();
  const path: string[] = [];
  const obstacleCells = grid
    .flatMap((row, rowIndex) =>
      row.flatMap((cell, columnIndex) =>
        cell === 1 ? [makeCellId(rowIndex, columnIndex)] : []
      )
    )
    .sort(compareCellIds);
  const bestRemovalsByCell: Record<string, number> = {
    [startCell]: 0
  };
  const removedObstacleCells: string[] = [];
  const predecessors = new Map<string, string>();
  const recorder = createMinimumObstacleRemovalToReachCornerRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: frontier.length,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let currentRemovalCost: number | null = null;
  let activeEdge: string[] = [];
  let phaseMode: "search" | "traceback" | "resolved" = "search";
  let minimumRemovals: number | null = null;

  if (grid[0]![0] === 1) {
    visitedObstacles.add(startCell);
  } else {
    visitedOpen.add(startCell);
  }

  const createRuntimeState = (): MinimumObstacleRemovalToReachCornerRuntimeState => ({
    grid,
    settled,
    frontier,
    current,
    currentRemovalCost,
    activeEdge,
    phaseMode,
    start: startCell,
    target: targetCell,
    path,
    obstacleCells,
    visitedOpen,
    visitedObstacles,
    bestRemovalsByCell,
    removedObstacleCells,
    minimumRemovals
  });

  recorder.push({
    phase: "Initialization",
    description: `${formatCellLabel(startCell)} seeds the 0-1 BFS deque while replay targets ${formatCellLabel(targetCell)} through ${obstacleCells.length} removable obstacle cell${obstacleCells.length === 1 ? "" : "s"}.`,
    explanation: {
      summary: "Publish the blocked grid, start cell, and target before the weighted deque search begins.",
      details:
        "The opening frame keeps the obstacle ledger and zero-removal baseline explicit so later front-of-deque versus back-of-deque moves stay explainable without browser-side recomputation.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "minimum-obstacle-removal-initial",
        path: "state.target",
        kind: "node",
        intent: "focus",
        label: `Target ${formatCellLabel(targetCell)}`
      }
    ]
  });

  while (frontier.length > 0) {
    const extractedCell = frontier.shift();

    if (!extractedCell) {
      break;
    }

    current = extractedCell;
    currentRemovalCost = bestRemovalsByCell[extractedCell] ?? null;
    activeEdge = [];
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Extract",
      description: `${formatCellLabel(extractedCell)} leaves the front of the deque with removal cost ${currentRemovalCost ?? 0}.`,
      explanation: {
        summary: "Expand the next minimum-removal cell from the 0-1 BFS deque.",
        details:
          "The deque ordering stays deterministic: zero-cost relaxations join the front band behind older equal-cost work, while obstacle relaxations wait at the back.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `minimum-obstacle-removal-current-${extractedCell}`,
          path: "state.current",
          kind: "node",
          intent: "active",
          label: `${formatCellLabel(extractedCell)} · cost=${currentRemovalCost ?? 0}`
        }
      ]
    });

    if (extractedCell === targetCell) {
      settled.push(extractedCell);
      metrics.settled = settled.length;
      minimumRemovals = currentRemovalCost ?? 0;

      recorder.push({
        phase: "Target",
        description: `${formatCellLabel(extractedCell)} is extracted with the minimum removal cost of ${minimumRemovals}, so replay can stop search and switch to traceback.`,
        explanation: {
          summary: "Stop when the target reaches the front of the deque because its removal cost is now final.",
          details:
            "0-1 BFS gives the same optimality guarantee as Dijkstra on binary edge weights, so the extracted target cost is the answer replay will return.",
          tags: ["result", "checkpoint"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: "minimum-obstacle-removal-target",
            path: "state.target",
            kind: "node",
            intent: "result",
            label: `Target ${formatCellLabel(extractedCell)}`
          }
        ]
      });
      break;
    }

    const { row, column } = parseCellId(extractedCell);

    for (const neighbor of getNeighborCellIds(row, column, rowCount, columnCount)) {
      const { row: neighborRow, column: neighborColumn } = parseCellId(neighbor);
      const isObstacle = grid[neighborRow]![neighborColumn] === 1;
      const candidateRemovals = (currentRemovalCost ?? 0) + (isObstacle ? 1 : 0);
      const bestSeen = bestRemovalsByCell[neighbor];

      activeEdge = [extractedCell, neighbor];
      metrics.inspections += 1;

      if (typeof bestSeen === "number" && candidateRemovals >= bestSeen) {
        recorder.push({
          phase: "Inspect",
          description: `Inspect ${formatCellLabel(neighbor)} and keep the recorded cost ${bestSeen} because the candidate route would cost ${candidateRemovals}.`,
          explanation: {
            summary: "Skip a non-improving 0-1 BFS relaxation.",
            details:
              "The best-removal ledger is stored directly in the trace so replay can justify every skipped revisit without replaying the deque mechanics offline.",
            tags: ["edge", "focus"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `minimum-obstacle-removal-skip-${extractedCell}-${neighbor}-${metrics.inspections}`,
              path: "state.bestRemovalsByCell",
              kind: "collection",
              intent: "visited",
              label: `${formatCellLabel(neighbor)} stays at ${bestSeen}`
            }
          ]
        });
        continue;
      }

      bestRemovalsByCell[neighbor] = candidateRemovals;
      predecessors.set(neighbor, extractedCell);
      updateZeroOneFrontier(
        frontier,
        neighbor,
        bestRemovalsByCell,
        isObstacle ? "back" : "front"
      );
      metrics.frontier = frontier.length;
      metrics.updates += 1;

      if (isObstacle) {
        visitedObstacles.add(neighbor);
      } else {
        visitedOpen.add(neighbor);
      }

      const queuedTarget = neighbor === targetCell;

      recorder.push({
        phase: queuedTarget ? "Target Candidate" : "Relax",
        description: queuedTarget
          ? `${formatCellLabel(neighbor)} becomes a target candidate at removal cost ${candidateRemovals}, but replay still waits for deque extraction before sealing the answer.`
          : isObstacle
            ? `${formatCellLabel(neighbor)} is an obstacle, so replay records one extra removal and appends it to the back of the deque at cost ${candidateRemovals}.`
            : `${formatCellLabel(neighbor)} stays open, so replay promotes it into the front band of the deque at cost ${candidateRemovals}.`,
        explanation: {
          summary: queuedTarget
            ? "Queue the target as a weighted candidate without publishing the answer early."
            : isObstacle
              ? "Append a one-cost relaxation to the back of the 0-1 BFS deque."
              : "Insert a zero-cost relaxation into the front band of the 0-1 BFS deque.",
          details:
            "Each relax frame stores the updated best-removal ledger and deque order directly so replay can explain why some routes cut ahead of others even on the same grid.",
          tags: ["frontier", "candidate"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `minimum-obstacle-removal-relax-${extractedCell}-${neighbor}-${metrics.updates}`,
            path: queuedTarget ? "state.target" : "state.frontier",
            kind: queuedTarget ? "node" : "collection",
            intent: queuedTarget ? "candidate" : "frontier",
            label: queuedTarget
              ? `Target cost ${candidateRemovals}`
              : `${formatCellLabel(neighbor)} · cost=${candidateRemovals}`
          }
        ]
      });
    }

    settled.push(extractedCell);
    activeEdge = [];
    metrics.settled = settled.length;
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Checkpoint",
      description: `${formatCellLabel(extractedCell)} is settled with minimum removal cost ${currentRemovalCost ?? 0}.`,
      explanation: {
        summary: "Seal one deque extraction once every improving neighbor relaxation is recorded.",
        details:
          "The settled ledger marks cells whose minimum removal cost is final, which lets replay jump between checkpoints without re-running the deque search.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `minimum-obstacle-removal-settled-${extractedCell}`,
          path: "state.settled",
          kind: "collection",
          intent: "visited",
          label: `${formatCellLabel(extractedCell)} · cost=${currentRemovalCost ?? 0}`
        }
      ]
    });
  }

  phaseMode = "traceback";
  current = targetCell;
  currentRemovalCost = minimumRemovals;
  activeEdge = [];

  recorder.push({
    phase: "Traceback",
    description:
      "Switch from deque search to predecessor traceback so replay can publish the exact minimum-removal route and the obstacles removed along it.",
    explanation: {
      summary: "Begin reconstructing the winning route from the target back to the start.",
      details:
        "The traceback frames build both the path ledger and the removed-obstacle ledger directly into the trace, so the browser never has to infer which obstacle entries actually belong to the optimal route.",
      tags: ["checkpoint", "path"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "minimum-obstacle-removal-traceback-start",
        path: "state.phaseMode",
        kind: "value",
        intent: "focus",
        label: "Traceback"
      }
    ]
  });

  let tracebackCell: string | null = targetCell;

  while (tracebackCell) {
    const previousCell: string | null = predecessors.get(tracebackCell) ?? null;
    const { row, column } = parseCellId(tracebackCell);

    current = tracebackCell;
    currentRemovalCost = bestRemovalsByCell[tracebackCell] ?? null;
    activeEdge = previousCell ? [previousCell, tracebackCell] : [];
    path.unshift(tracebackCell);

    if (tracebackCell !== startCell && grid[row]![column] === 1) {
      removedObstacleCells.unshift(tracebackCell);
    }

    recorder.push({
      phase: "Traceback",
      description: previousCell
        ? `${formatCellLabel(tracebackCell)} joins the optimal route at removal cost ${currentRemovalCost ?? 0}, then traceback follows its predecessor to ${formatCellLabel(previousCell)}.`
        : `${formatCellLabel(tracebackCell)} closes the route as the starting corner.`,
      explanation: {
        summary: previousCell
          ? "Prepend one predecessor-linked cell to the minimum-removal route."
          : "Finish the route at the start cell.",
        details:
          "Each traceback frame stores the running path and removal count directly, which keeps the final route deterministic even when many equal-length geometric paths exist.",
        tags: ["path", "checkpoint"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `minimum-obstacle-removal-path-${tracebackCell}-${path.length}`,
          path: "state.path",
          kind: "collection",
          intent: "result",
          label: `${path.length} path cell${path.length === 1 ? "" : "s"}`
        }
      ]
    });

    tracebackCell = previousCell;
  }

  phaseMode = "resolved";
  current = null;
  currentRemovalCost = null;
  activeEdge = [];
  metrics.frontier = frontier.length;

  recorder.push({
    phase: "Resolution",
    description: `The optimal route reaches ${formatCellLabel(targetCell)} after removing ${minimumRemovals ?? 0} obstacle${minimumRemovals === 1 ? "" : "s"}.`,
    explanation: {
      summary: "Publish the final minimum-removal route and obstacle ledger.",
      details:
        "The terminal frame stores the answer, path, and removed-obstacle subset directly so replay can justify the returned minimum without replaying the 0-1 BFS search.",
      tags: ["result", "path"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "minimum-obstacle-removal-final",
        path: "state.path",
        kind: "collection",
        intent: "result",
        label: `${minimumRemovals ?? 0} removal${minimumRemovals === 1 ? "" : "s"}`
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

export function buildSwimInRisingWaterTrace(
  input: SwimInRisingWaterInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["swim-in-rising-water"];
  const normalizedInput = normalizeSwimInRisingWaterInput(input);
  const grid = cloneGrid(normalizedInput.grid);
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  const startCell = makeCellId(0, 0);
  const targetCell = makeCellId(rowCount - 1, columnCount - 1);
  const settled: string[] = [];
  const frontier: string[] = [startCell];
  const visitedCells = new Set<string>([startCell]);
  const path: string[] = [];
  const bestTimeByCell: Record<string, number> = {
    [startCell]: grid[0]![0]!
  };
  const predecessors = new Map<string, string>();
  const recorder = createSwimInRisingWaterRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: frontier.length,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let currentWaterLevel: number | null = null;
  let activeEdge: string[] = [];
  let phaseMode: "search" | "traceback" | "resolved" = "search";
  let swimTime: number | null = null;

  const createRuntimeState = (): SwimInRisingWaterRuntimeState => ({
    grid,
    settled,
    frontier,
    current,
    currentWaterLevel,
    activeEdge,
    phaseMode,
    start: startCell,
    target: targetCell,
    path,
    visitedCells,
    bestTimeByCell,
    swimTime
  });

  recorder.push({
    phase: "Initialization",
    description: `${formatCellLabel(startCell)} seeds the weighted grid search at water level ${grid[0]![0]!} before replay targets ${formatCellLabel(targetCell)}.`,
    explanation: {
      summary: "Publish the elevation grid, start cell, and destination before the weighted frontier expansion begins.",
      details:
        "The opening frame keeps the initial water level and best-time ledger explicit so later frontier reordering never depends on hidden priority-queue state in the browser.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "swim-in-rising-water-initial",
        path: "state.target",
        kind: "node",
        intent: "focus",
        label: `Target ${formatCellLabel(targetCell)}`
      }
    ]
  });

  while (frontier.length > 0) {
    const extractedCell = frontier.shift();

    if (!extractedCell) {
      break;
    }

    current = extractedCell;
    currentWaterLevel = bestTimeByCell[extractedCell] ?? null;
    activeEdge = [];
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Extract",
      description: `${formatCellLabel(extractedCell)} leaves the weighted frontier with current water level ${currentWaterLevel ?? 0}.`,
      explanation: {
        summary: "Extract the grid cell with the lightest recorded swim time.",
        details:
          "The weighted frontier stays deterministic: lower swim time first, then cell order as a stable tie-break whenever two routes reach the same water level.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `swim-in-rising-water-current-${extractedCell}`,
          path: "state.current",
          kind: "node",
          intent: "active",
          label: `${formatCellLabel(extractedCell)} · t=${currentWaterLevel ?? 0}`
        }
      ]
    });

    if (extractedCell === targetCell) {
      settled.push(extractedCell);
      metrics.settled = settled.length;
      swimTime = currentWaterLevel ?? 0;

      recorder.push({
        phase: "Target",
        description: `${formatCellLabel(extractedCell)} is extracted at water level ${swimTime}, so replay can stop search and switch to traceback.`,
        explanation: {
          summary: "Seal the destination once its weighted frontier cost becomes final.",
          details:
            "This is a grid-shaped Dijkstra run: once the target leaves the frontier, the recorded swim time is the minimum water level that permits a full route.",
          tags: ["result", "checkpoint"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: "swim-in-rising-water-target",
            path: "state.target",
            kind: "node",
            intent: "result",
            label: `Target ${formatCellLabel(extractedCell)}`
          }
        ]
      });
      break;
    }

    const { row, column } = parseCellId(extractedCell);

    for (const neighbor of getNeighborCellIds(row, column, rowCount, columnCount)) {
      const { row: neighborRow, column: neighborColumn } = parseCellId(neighbor);
      const candidateWaterLevel = Math.max(currentWaterLevel ?? 0, grid[neighborRow]![neighborColumn]!);
      const bestSeen = bestTimeByCell[neighbor];

      activeEdge = [extractedCell, neighbor];
      metrics.inspections += 1;

      if (typeof bestSeen === "number" && candidateWaterLevel >= bestSeen) {
        recorder.push({
          phase: "Inspect",
          description: `Inspect ${formatCellLabel(neighbor)} and keep the recorded swim time ${bestSeen} because the candidate route would require water level ${candidateWaterLevel}.`,
          explanation: {
            summary: "Skip a non-improving weighted grid relaxation.",
            details:
              "The best-time ledger is recorded directly in the trace, so replay can justify every discarded route without re-running the weighted frontier.",
            tags: ["edge", "focus"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `swim-in-rising-water-skip-${extractedCell}-${neighbor}-${metrics.inspections}`,
              path: "state.bestTimeByCell",
              kind: "collection",
              intent: "visited",
              label: `${formatCellLabel(neighbor)} stays at ${bestSeen}`
            }
          ]
        });
        continue;
      }

      bestTimeByCell[neighbor] = candidateWaterLevel;
      predecessors.set(neighbor, extractedCell);
      insertWeightedCellFrontier(frontier, neighbor, bestTimeByCell);
      visitedCells.add(neighbor);
      metrics.frontier = frontier.length;
      metrics.updates += 1;

      recorder.push({
        phase: neighbor === targetCell ? "Target Candidate" : "Relax",
        description:
          neighbor === targetCell
            ? `${formatCellLabel(neighbor)} becomes a target candidate at water level ${candidateWaterLevel}, but replay waits for frontier extraction before sealing the answer.`
            : `${formatCellLabel(neighbor)} improves to swim time ${candidateWaterLevel} and rejoins the weighted frontier in deterministic cost order.`,
        explanation: {
          summary:
            neighbor === targetCell
              ? "Queue the destination with its new swim time without publishing the result early."
              : "Record one improved weighted route and refresh the frontier ordering.",
          details:
            "Each relax frame stores the best-time ledger and reordered frontier directly so replay can explain why one elevation path overtakes another.",
          tags: ["frontier", "candidate"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `swim-in-rising-water-relax-${extractedCell}-${neighbor}-${metrics.updates}`,
            path: neighbor === targetCell ? "state.target" : "state.frontier",
            kind: neighbor === targetCell ? "node" : "collection",
            intent: neighbor === targetCell ? "candidate" : "frontier",
            label:
              neighbor === targetCell
                ? `Target t=${candidateWaterLevel}`
                : `${formatCellLabel(neighbor)} · t=${candidateWaterLevel}`
          }
        ]
      });
    }

    settled.push(extractedCell);
    activeEdge = [];
    metrics.settled = settled.length;
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Checkpoint",
      description: `${formatCellLabel(extractedCell)} is settled with final swim time ${currentWaterLevel ?? 0}.`,
      explanation: {
        summary: "Seal one weighted extraction after its improving relaxations are recorded.",
        details:
          "The settled ledger marks cells whose best swim time is final, which lets replay jump between checkpoints without re-running frontier churn.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `swim-in-rising-water-settled-${extractedCell}`,
          path: "state.settled",
          kind: "collection",
          intent: "visited",
          label: `${formatCellLabel(extractedCell)} · t=${currentWaterLevel ?? 0}`
        }
      ]
    });
  }

  phaseMode = "traceback";
  current = targetCell;
  currentWaterLevel = swimTime;
  activeEdge = [];

  recorder.push({
    phase: "Traceback",
    description:
      "Switch from weighted frontier expansion to predecessor traceback so replay can publish the exact path that first survives the minimum water level.",
    explanation: {
      summary: "Begin reconstructing the winning swim route from the target back to the source.",
      details:
        "The traceback frames build the path ledger directly into the trace so the browser never has to infer which frontier decisions formed the final route.",
      tags: ["checkpoint", "path"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "swim-in-rising-water-traceback-start",
        path: "state.phaseMode",
        kind: "value",
        intent: "focus",
        label: "Traceback"
      }
    ]
  });

  let tracebackCell: string | null = targetCell;

  while (tracebackCell) {
    const previousCell: string | null = predecessors.get(tracebackCell) ?? null;

    current = tracebackCell;
    currentWaterLevel = bestTimeByCell[tracebackCell] ?? null;
    activeEdge = previousCell ? [previousCell, tracebackCell] : [];
    path.unshift(tracebackCell);

    recorder.push({
      phase: "Traceback",
      description: previousCell
        ? `${formatCellLabel(tracebackCell)} joins the swim route at water level ${currentWaterLevel ?? 0}, then traceback follows its predecessor to ${formatCellLabel(previousCell)}.`
        : `${formatCellLabel(tracebackCell)} closes the route as the starting cell.`,
      explanation: {
        summary: previousCell
          ? "Prepend one predecessor-linked cell to the final swim route."
          : "Finish the route at the start cell.",
        details:
          "Each traceback frame keeps the path and best-time ledgers explicit, which lets replay explain the returned route without re-running the weighted search.",
        tags: ["path", "checkpoint"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `swim-in-rising-water-path-${tracebackCell}-${path.length}`,
          path: "state.path",
          kind: "collection",
          intent: "result",
          label: `${path.length} path cell${path.length === 1 ? "" : "s"}`
        }
      ]
    });

    tracebackCell = previousCell;
  }

  phaseMode = "resolved";
  current = null;
  currentWaterLevel = null;
  activeEdge = [];
  metrics.frontier = frontier.length;

  recorder.push({
    phase: "Resolution",
    description: `The swim reaches ${formatCellLabel(targetCell)} once the water rises to ${swimTime ?? 0}.`,
    explanation: {
      summary: "Publish the final swim time together with the route that attains it.",
      details:
        "The terminal frame stores the answer, path, and best-time ledger directly so replay can justify the returned minimum water level without recomputing weighted grid state.",
      tags: ["result", "path"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "swim-in-rising-water-final",
        path: "state.path",
        kind: "collection",
        intent: "result",
        label: `Water level ${swimTime ?? 0}`
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

export function buildShortestPathToGetFoodTrace(
  input: ShortestPathToGetFoodInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["shortest-path-to-get-food"];
  const normalizedInput = normalizeShortestPathToGetFoodInput(input);
  const grid = cloneGrid(normalizedInput.grid);
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  let startCell = "";
  let foodCell = "";

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const cell = grid[rowIndex]![columnIndex];
      const cellId = makeCellId(rowIndex, columnIndex);

      if (cell === "*") {
        startCell = cellId;
      } else if (cell === "#") {
        foodCell = cellId;
      }
    }
  }

  const settled: string[] = [];
  const frontier: string[] = [startCell];
  const visitedOpen = [startCell];
  const visitedOpenSet = new Set(visitedOpen);
  const path: string[] = [];
  const blockedCells = grid
    .flatMap((row, rowIndex) =>
      row.flatMap((cell, columnIndex) =>
        cell === "X" ? [makeCellId(rowIndex, columnIndex)] : []
      )
    )
    .sort(compareCellIds);
  const predecessors = new Map<string, string>();
  const recorder = createShortestPathToGetFoodRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: frontier.length,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let activeEdge: string[] = [];
  let phaseMode: "search" | "traceback" | "resolved" = "search";
  let reachable: boolean | null = null;
  let stepsToFood: number | null = null;

  const createRuntimeState = (): ShortestPathToGetFoodRuntimeState => ({
    grid,
    settled,
    frontier,
    current,
    activeEdge,
    phaseMode,
    start: startCell,
    food: foodCell,
    path,
    visitedOpen,
    blockedCells,
    stepsToFood,
    reachable
  });

  recorder.push({
    phase: "Initialization",
    description: `${formatCellLabel(startCell)} seeds the food search, while ${formatCellLabel(foodCell)} stays marked as the deterministic target corridor cell.`,
    explanation: {
      summary: "Publish the start cell, target food cell, and blocked-cell ledger before the BFS search begins.",
      details:
        "The opening frame keeps the pantry target and blocked-cell topology explicit so replay never has to infer where the route starts or what counts as a wall.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "shortest-path-to-get-food-initial",
        path: "state.food",
        kind: "node",
        intent: "focus",
        label: `Food ${formatCellLabel(foodCell)}`
      }
    ]
  });

  searchLoop: while (frontier.length > 0) {
    const currentCell = frontier.shift();

    if (!currentCell) {
      break;
    }

    current = currentCell;
    activeEdge = [];
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Extract",
      description: `${formatCellLabel(currentCell)} leaves the BFS queue as the next food-search source.`,
      explanation: {
        summary: "Expand the next reachable open cell in deterministic queue order.",
        details:
          "Each extract frame records the active pantry-search source before neighbor inspection begins, which keeps the frontier explicit across the entire shortest-food search.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `shortest-path-to-get-food-current-${currentCell}`,
          path: "state.current",
          kind: "node",
          intent: "active",
          label: `Expand ${formatCellLabel(currentCell)}`
        }
      ]
    });

    if (currentCell === foodCell) {
      reachable = true;
      settled.push(currentCell);
      metrics.settled = settled.length;

      recorder.push({
        phase: "Food",
        description: `${formatCellLabel(currentCell)} is the food cell, so the BFS search can stop and switch to traceback.`,
        explanation: {
          summary: "Stop search on the first food extract because BFS guarantees the fewest movement steps.",
          details:
            "The food frame locks the winning corridor cell before traceback reconstructs the shortest route directly into the replay state.",
          tags: ["result", "checkpoint"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `shortest-path-to-get-food-food-${currentCell}`,
            path: "state.food",
            kind: "node",
            intent: "result",
            label: `Food ${formatCellLabel(currentCell)}`
          }
        ]
      });
      break;
    }

    const { row, column } = parseCellId(currentCell);

    for (const neighbor of getNeighborCellIds(row, column, rowCount, columnCount)) {
      const { row: neighborRow, column: neighborColumn } = parseCellId(neighbor);
      activeEdge = [currentCell, neighbor];
      metrics.inspections += 1;

      if (grid[neighborRow]![neighborColumn] === "X") {
        recorder.push({
          phase: "Inspect",
          description: `Inspect ${formatCellLabel(neighbor)} and stop because that pantry cell is blocked.`,
          explanation: {
            summary: "Reject a blocked pantry wall during the BFS expansion.",
            details:
              "Blocked cells stay explicit in the recorded grid and never enter the frontier, so replay does not infer wall handling from browser-only logic.",
            tags: ["edge", "focus"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `shortest-path-to-get-food-blocked-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: "state.blockedCells",
              kind: "collection",
              intent: "candidate",
              label: `${formatCellLabel(neighbor)} blocked`
            }
          ]
        });
        continue;
      }

      if (visitedOpenSet.has(neighbor)) {
        recorder.push({
          phase: "Inspect",
          description: `Inspect ${formatCellLabel(neighbor)} and keep the queue stable because BFS already discovered that open pantry cell.`,
          explanation: {
            summary: "Skip a previously discovered pantry cell without re-enqueuing it.",
            details:
              "This preserves a deterministic visited ledger and avoids hidden deduplication during playback.",
            tags: ["edge", "visited"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `shortest-path-to-get-food-known-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: "state.visitedOpen",
              kind: "collection",
              intent: "visited",
              label: `${formatCellLabel(neighbor)} already discovered`
            }
          ]
        });
        continue;
      }

      visitedOpenSet.add(neighbor);
      visitedOpen.push(neighbor);
      frontier.push(neighbor);
      predecessors.set(neighbor, currentCell);
      metrics.frontier = frontier.length;
      metrics.updates += 1;

      const reachesFood = neighbor === foodCell;

      recorder.push({
        phase: reachesFood ? "Food Found" : "Enqueue",
        description: reachesFood
          ? `${formatCellLabel(neighbor)} is the first discovered food cell, so replay locks that shortest pantry route candidate before traceback.`
          : `${formatCellLabel(neighbor)} is open, so BFS records it as a new food-path candidate.`,
        explanation: {
          summary: reachesFood
            ? "Discover the food and stop once this shortest frontier expansion is recorded."
            : "Queue one newly discovered open pantry cell for later expansion.",
          details:
            "The state update records queue growth, the visited-open ledger, and the predecessor link together so replay can justify every later traceback edge.",
          tags: ["frontier", "edge"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `shortest-path-to-get-food-enqueue-${currentCell}-${neighbor}-${metrics.updates}`,
            path: reachesFood ? "state.food" : "state.visitedOpen",
            kind: reachesFood ? "node" : "collection",
            intent: reachesFood ? "result" : "frontier",
            label: reachesFood
              ? `Food ${formatCellLabel(neighbor)} queued`
              : `${formatCellLabel(neighbor)} discovered`
          }
        ]
      });

      if (reachesFood) {
        reachable = true;
        settled.push(currentCell);
        metrics.settled = settled.length;
        activeEdge = [];

        recorder.push({
          phase: "Checkpoint",
          description: `${formatCellLabel(currentCell)} is sealed after discovering the food on its search frontier.`,
          explanation: {
            summary: "Close the final search source before the trace transitions into traceback.",
            details:
              "This checkpoint keeps the BFS search and the path reconstruction phases distinct while preserving the settled and frontier ledgers exactly as they stood when the food was found.",
            tags: ["checkpoint", "visited"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `shortest-path-to-get-food-checkpoint-${currentCell}`,
              path: "state.settled",
              kind: "collection",
              intent: "visited",
              label: `${formatCellLabel(currentCell)} settled`
            }
          ]
        });

        break searchLoop;
      }
    }

    if (reachable) {
      break;
    }

    settled.push(currentCell);
    activeEdge = [];
    metrics.settled = settled.length;
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Checkpoint",
      description: `${formatCellLabel(currentCell)} is fully processed after all 4-direction pantry neighbor checks.`,
      explanation: {
        summary: "Seal one open pantry cell after its BFS expansion finishes.",
        details:
          "The checkpoint frame stores the queue and visited ledger directly so replay can jump to any settled corridor boundary without rerunning neighbor scans.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `shortest-path-to-get-food-settled-${currentCell}`,
          path: "state.settled",
          kind: "collection",
          intent: "visited",
          label: `${formatCellLabel(currentCell)} settled`
        }
      ]
    });
  }

  if (reachable) {
    phaseMode = "traceback";
    current = foodCell;
    activeEdge = [];

    recorder.push({
      phase: "Traceback",
      description:
        "Switch from pantry BFS expansion to predecessor traceback so replay can build the shortest route directly from the discovered food cell.",
      explanation: {
        summary: "Begin reconstructing the shortest path from the food cell back to the start.",
        details:
          "The path is published as an explicit ledger instead of being inferred from hidden predecessor tables during playback.",
        tags: ["checkpoint", "path"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "shortest-path-to-get-food-traceback-start",
          path: "state.phaseMode",
          kind: "value",
          intent: "focus",
          label: "Traceback"
        }
      ]
    });

    let tracebackCell: string | null = foodCell;

    while (tracebackCell) {
      current = tracebackCell;
      const previousCell: string | null = predecessors.get(tracebackCell) ?? null;
      activeEdge = previousCell ? [previousCell, tracebackCell] : [];
      path.unshift(tracebackCell);

      recorder.push({
        phase: "Traceback",
        description: previousCell
          ? `${formatCellLabel(tracebackCell)} joins the food route, then traceback follows its predecessor to ${formatCellLabel(previousCell)}.`
          : `${formatCellLabel(tracebackCell)} closes the traceback as the start cell.`,
        explanation: {
          summary: previousCell
            ? "Prepend one predecessor-linked pantry cell to the shortest path ledger."
            : "Finish the shortest food path at the start cell.",
          details:
            "Each traceback frame grows the path ledger directly so the final route never depends on hidden predecessor reconstruction in the viewer.",
          tags: ["path", "checkpoint"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `shortest-path-to-get-food-path-${tracebackCell}-${path.length}`,
            path: "state.path",
            kind: "collection",
            intent: "result",
            label: `${path.length} path cell${path.length === 1 ? "" : "s"}`
          }
        ]
      });

      tracebackCell = previousCell;
    }

    stepsToFood = path.length - 1;
  } else {
    phaseMode = "resolved";
    current = null;
    activeEdge = [];
    reachable = false;
    stepsToFood = -1;

    recorder.push({
      phase: "No Path",
      description:
        "The BFS queue is empty before the food cell is discovered, so the pantry has no open route from the start to the food.",
      explanation: {
        summary: "Publish the unreachable result once the pantry frontier stalls.",
        details:
          "The terminal frame preserves the visited-open ledger directly, so replay can explain which cells were reachable even though no food path exists.",
        tags: ["result", "graph"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "shortest-path-to-get-food-no-path",
          path: "state.reachable",
          kind: "value",
          intent: "result",
          label: "Return -1"
        }
      ]
    });

    return buildGraphEnvelope(definition, normalizedInput, recorder);
  }

  phaseMode = "resolved";
  current = null;
  activeEdge = [];
  metrics.frontier = frontier.length;

  recorder.push({
    phase: "Resolution",
    description: `The shortest pantry route reaches ${formatCellLabel(foodCell)} after ${stepsToFood ?? 0} step${stepsToFood === 1 ? "" : "s"} of BFS and traceback.`,
    explanation: {
      summary: "Publish the final food path together with the returned step count.",
      details:
        "The terminal frame stores the exact food cell, route ledger, and returned step count directly so replay can justify the pantry answer without recomputing predecessor chains.",
      tags: ["result", "path"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "shortest-path-to-get-food-final",
        path: "state.path",
        kind: "collection",
        intent: "result",
        label: `${stepsToFood ?? 0} step${stepsToFood === 1 ? "" : "s"}`
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

export function buildZeroOneMatrixTrace(
  input: ZeroOneMatrixInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["01-matrix"];
  const normalizedInput = normalizeZeroOneMatrixInput(input);
  const grid: number[][] = normalizedInput.grid.map((row) =>
    row.map((cell) => (cell === 0 ? 0 : wallsAndGatesInfinity))
  );
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  const settled: string[] = [];
  const frontier: string[] = [];
  const zeroCells: string[] = [];
  const remainingCells = new Set<string>();
  const recorder = createZeroOneMatrixRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: 0,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let activeEdge: string[] = [];
  let updatedCells: string[] = [];
  let fullyResolved: boolean | null = null;
  let maxDistance: number | null = null;
  let unresolvedCells: string[] = [];

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      const inputValue = normalizedInput.grid[row]![column]!;
      const cell = makeCellId(row, column);

      if (inputValue === 0) {
        zeroCells.push(cell);
        frontier.push(cell);
      } else {
        remainingCells.add(cell);
      }
    }
  }

  metrics.frontier = frontier.length;

  const createRuntimeState = (): ZeroOneMatrixRuntimeState => ({
    grid,
    settled,
    frontier,
    current,
    activeEdge,
    zeroCells,
    updatedCells,
    remainingCells,
    fullyResolved,
    maxDistance,
    unresolvedCells
  });

  recorder.push({
    phase: "Initialization",
    description:
      frontier.length > 0
        ? `${frontier.length} zero cell${frontier.length === 1 ? "" : "s"} seed the multi-source BFS before any 1 cell receives its nearest-zero distance.`
        : `${remainingCells.size} one cell${remainingCells.size === 1 ? "" : "s"} wait for a zero source that never appears in the input grid.`,
    explanation: {
      summary: "Seed every zero-valued source and convert 1 cells into explicit unresolved distance slots.",
      details:
        "The opening frame stores the normalized distance grid, ordered zero frontier, and every unresolved cell directly so replay never reconstructs the starting matrix from hidden BFS state.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "01-matrix-initial",
        path: frontier.length > 0 ? "state.frontier" : "state.remainingCells",
        kind: "collection",
        intent: "focus",
        label:
          frontier.length > 0
            ? `${frontier.length} zero source${frontier.length === 1 ? "" : "s"} queued`
            : `${remainingCells.size} unresolved one cell${remainingCells.size === 1 ? "" : "s"}`
      }
    ]
  });

  if (remainingCells.size === 0) {
    fullyResolved = true;
    maxDistance = 0;

    recorder.push({
      phase: "Resolution",
      description: "Every cell is already 0, so the distance matrix resolves immediately without any BFS expansion.",
      explanation: {
        summary: "Publish the terminal matrix immediately when no 1 cells need a nearest-zero distance.",
        details:
          "The terminal frame still records the zero-source ledger directly so replay can explain why no queue growth or distance fill was required.",
        tags: ["result", "graph"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "01-matrix-final-immediate",
          path: "state.maxDistance",
          kind: "node",
          intent: "result",
          label: "All cells already zero"
        }
      ]
    });

    return buildGraphEnvelope(definition, normalizedInput, recorder);
  }

  if (frontier.length === 0) {
    fullyResolved = false;
    unresolvedCells = Array.from(remainingCells).sort(compareCellIds);

    recorder.push({
      phase: "Stalled",
      description: `No zero source exists, so cells ${unresolvedCells.map(formatCellLabel).join(", ")} cannot resolve to any nearest-zero distance.`,
      explanation: {
        summary: "Publish the unresolved matrix when the BFS frontier never receives a zero-valued source.",
        details:
          "Replay preserves the unresolved cell ledger directly so the terminal failure does not depend on rechecking the input matrix for missing sources.",
        tags: ["result", "graph"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "01-matrix-no-zero-source",
          path: "state.unresolvedCells",
          kind: "collection",
          intent: "result",
          label: "No zero source"
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
    updatedCells = [];
    activeEdge = [];
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Extract",
      description: `${formatCellLabel(currentCell)} becomes the active BFS source for nearest-zero distance filling.`,
      explanation: {
        summary: "Expand the next resolved distance cell from the ordered multi-source frontier.",
        details:
          "Replay records the active source before any neighbor checks begin so each distance wave stays readable without recomputing queue order.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `01-matrix-current-${currentCell}`,
          path: "state.current",
          kind: "node",
          intent: "active",
          label: `Expand ${formatCellLabel(currentCell)}`
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

      if (neighborValue !== wallsAndGatesInfinity) {
        recorder.push({
          phase: "Inspect",
          description:
            neighborValue === 0
              ? `Inspect ${formatCellLabel(neighbor)} and keep the frontier stable because that cell is already a zero source.`
              : `Inspect ${formatCellLabel(neighbor)} and keep the frontier stable because that cell already holds nearest-zero distance ${neighborValue}.`,
          explanation: {
            summary:
              neighborValue === 0
                ? "Inspect a zero source without enqueuing it again."
                : "Inspect an already resolved distance cell without replacing its earlier nearest-zero value.",
            details:
              neighborValue === 0
                ? "Zero cells remain fixed at distance 0, so replay preserves the original multi-source seed without duplicate queue work."
                : "Previously resolved cells keep their first recorded distance, which preserves the BFS proof that the shortest nearest-zero value arrived first.",
            tags: ["edge", "focus"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `01-matrix-inspect-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: `state.grid.${neighborRow}.${neighborColumn}`,
              kind: "node",
              intent: "candidate",
              label:
                neighborValue === 0
                  ? `Zero ${formatCellLabel(neighbor)}`
                  : `Distance ${neighborValue} at ${formatCellLabel(neighbor)}`
            }
          ]
        });
        continue;
      }

      const nextDistance = currentDistance + 1;
      grid[neighborRow]![neighborColumn] = nextDistance;
      frontier.push(neighbor);
      updatedCells.push(neighbor);
      remainingCells.delete(neighbor);
      maxDistance = maxDistance === null ? nextDistance : Math.max(maxDistance, nextDistance);
      metrics.updates += 1;
      metrics.frontier = frontier.length;

      recorder.push({
        phase: "Update",
        description: `Cell ${formatCellLabel(neighbor)} locks nearest-zero distance ${nextDistance} and joins the frontier.`,
        explanation: {
          summary: "Publish one newly resolved cell and enqueue it for the next BFS expansion wave.",
          details:
            "The updated distance grid and frontier are recorded immediately so replay can jump to any nearest-zero assignment without browser-side recomputation.",
          tags: ["edge", "frontier"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `01-matrix-update-${currentCell}-${neighbor}-${metrics.updates}`,
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
      description: `${formatCellLabel(currentCell)} is fully processed for nearest-zero replay.`,
      explanation: {
        summary: "Seal one BFS source after all of its neighboring distance checks are recorded.",
        details:
          "This checkpoint captures the updated matrix, unresolved-cell ledger, and queue state directly so replay can jump between BFS wave boundaries safely.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `01-matrix-settled-${currentCell}`,
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
  updatedCells = [];
  unresolvedCells = Array.from(remainingCells).sort(compareCellIds);
  fullyResolved = unresolvedCells.length === 0;
  metrics.frontier = frontier.length;

  recorder.push({
    phase: fullyResolved ? "Resolution" : "Stalled",
    description: fullyResolved
      ? `Every 1 cell resolves to its nearest 0 with a maximum recorded distance of ${maxDistance ?? 0}.`
      : `Cells ${unresolvedCells.map(formatCellLabel).join(", ")} remain unresolved after the frontier empties.`,
    explanation: {
      summary: fullyResolved
        ? "Publish the terminal nearest-zero distance matrix once every 1 cell is resolved."
        : "Publish the unresolved cell ledger once the BFS frontier can no longer expand.",
      details: fullyResolved
        ? "The terminal frame stores the fully resolved distance grid and farthest nearest-zero distance directly so replay never recomputes the matrix offline."
        : "The remaining unresolved cells stay explicit in the terminal frame so replay can explain the missing zero source without another input scan.",
      tags: ["result", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "01-matrix-final",
        path: fullyResolved ? "state.maxDistance" : "state.unresolvedCells",
        kind: fullyResolved ? "node" : "collection",
        intent: "result",
        label: fullyResolved
          ? `Max distance ${maxDistance ?? 0}`
          : `Unresolved ${unresolvedCells.map(formatCellLabel).join(", ")}`
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

export function buildAsFarFromLandAsPossibleTrace(
  input: AsFarFromLandAsPossibleInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["as-far-from-land-as-possible"];
  const normalizedInput = normalizeAsFarFromLandAsPossibleInput(input);
  const grid: number[][] = normalizedInput.grid.map((row) =>
    row.map((cell) => (cell === 1 ? 0 : wallsAndGatesInfinity))
  );
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  const settled: string[] = [];
  const frontier: string[] = [];
  const landCells: string[] = [];
  const landCellSet = new Set<string>();
  const remainingWater = new Set<string>();
  const recorder = createAsFarFromLandAsPossibleRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: 0,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let activeEdge: string[] = [];
  let updatedWater: string[] = [];
  let outcome: "active" | "resolved" | "no-land" | "no-water" = "active";
  let maxDistance: number | null = null;
  let answer: number | null = null;
  let farthestWater: string[] = [];
  let unreachableWater: string[] = [];

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      const inputValue = normalizedInput.grid[row]![column]!;
      const cell = makeCellId(row, column);

      if (inputValue === 1) {
        landCells.push(cell);
        landCellSet.add(cell);
        frontier.push(cell);
      } else {
        remainingWater.add(cell);
      }
    }
  }

  metrics.frontier = frontier.length;

  const createRuntimeState = (): AsFarFromLandAsPossibleRuntimeState => ({
    grid,
    settled,
    frontier,
    current,
    activeEdge,
    landCells,
    updatedWater,
    remainingWater,
    outcome,
    maxDistance,
    answer,
    farthestWater,
    unreachableWater
  });

  recorder.push({
    phase: "Initialization",
    description:
      frontier.length > 0
        ? `${frontier.length} land cell${frontier.length === 1 ? "" : "s"} seed the shoreline BFS before any water cell receives a distance.`
        : `${remainingWater.size} water cell${remainingWater.size === 1 ? "" : "s"} wait for land that never appears in the grid.`,
    explanation: {
      summary: "Seed every land source and convert water into explicit unresolved shoreline-distance slots.",
      details:
        "The opening frame stores the ordered land frontier and every unresolved water cell directly so replay never rebuilds the shoreline wave from hidden BFS state.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "as-far-from-land-as-possible-initial",
        path: frontier.length > 0 ? "state.frontier" : "state.remainingWater",
        kind: "collection",
        intent: "focus",
        label:
          frontier.length > 0
            ? `${frontier.length} land source${frontier.length === 1 ? "" : "s"} queued`
            : `${remainingWater.size} water cell${remainingWater.size === 1 ? "" : "s"} without land`
      }
    ]
  });

  if (remainingWater.size === 0) {
    outcome = "no-water";
    answer = -1;

    recorder.push({
      phase: "Edge Case",
      description: "Every cell is already land, so no water candidate exists and the algorithm returns -1 immediately.",
      explanation: {
        summary: "Publish the edge-case answer when the grid contains land only.",
        details:
          "Replay still records the land-source ledger directly so the immediate -1 result does not depend on rescanning the input for missing water.",
        tags: ["result", "graph"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "as-far-from-land-as-possible-no-water",
          path: "state.answer",
          kind: "node",
          intent: "result",
          label: "Return -1"
        }
      ]
    });

    return buildGraphEnvelope(definition, normalizedInput, recorder);
  }

  if (frontier.length === 0) {
    outcome = "no-land";
    answer = -1;
    unreachableWater = Array.from(remainingWater).sort(compareCellIds);

    recorder.push({
      phase: "Edge Case",
      description: `No land source exists, so water cells ${unreachableWater.map(formatCellLabel).join(", ")} cannot receive any shoreline distance and the algorithm returns -1.`,
      explanation: {
        summary: "Publish the edge-case answer when the grid contains water only.",
        details:
          "Replay preserves the unresolved water ledger directly so the -1 result does not depend on another source scan after the frontier stays empty.",
        tags: ["result", "graph"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "as-far-from-land-as-possible-no-land",
          path: "state.unreachableWater",
          kind: "collection",
          intent: "result",
          label: "No land source"
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
    updatedWater = [];
    activeEdge = [];
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Extract",
      description: `${formatCellLabel(currentCell)} becomes the active shoreline source for water-distance filling.`,
      explanation: {
        summary: "Expand the next land or resolved water cell from the ordered multi-source frontier.",
        details:
          "Replay records the active shoreline source before neighbor checks begin so each BFS wave stays readable without recomputing queue order.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `as-far-from-land-as-possible-current-${currentCell}`,
          path: "state.current",
          kind: "node",
          intent: "active",
          label: `Expand ${formatCellLabel(currentCell)}`
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

      if (neighborValue !== wallsAndGatesInfinity) {
        const isLand = landCellSet.has(neighbor);

        recorder.push({
          phase: "Inspect",
          description: isLand
            ? `Inspect ${formatCellLabel(neighbor)} and keep the frontier stable because that cell is already land.`
            : `Inspect ${formatCellLabel(neighbor)} and keep the frontier stable because that water cell already holds shoreline distance ${neighborValue}.`,
          explanation: {
            summary: isLand
              ? "Inspect a land source without enqueuing it again."
              : "Inspect an already resolved water cell without replacing its first shoreline distance.",
            details: isLand
              ? "Land cells remain fixed at distance 0, so replay preserves the original multi-source shoreline seed without duplicate queue work."
              : "Previously resolved water cells keep their first recorded distance, which preserves the BFS proof that the nearest shoreline arrived first.",
            tags: ["edge", "focus"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `as-far-from-land-as-possible-inspect-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: `state.grid.${neighborRow}.${neighborColumn}`,
              kind: "node",
              intent: "candidate",
              label: isLand
                ? `Land ${formatCellLabel(neighbor)}`
                : `Distance ${neighborValue} at ${formatCellLabel(neighbor)}`
            }
          ]
        });
        continue;
      }

      const nextDistance = currentDistance + 1;
      grid[neighborRow]![neighborColumn] = nextDistance;
      frontier.push(neighbor);
      updatedWater.push(neighbor);
      remainingWater.delete(neighbor);
      if (maxDistance === null || nextDistance > maxDistance) {
        maxDistance = nextDistance;
        farthestWater = [neighbor];
      } else if (nextDistance === maxDistance) {
        farthestWater = [...farthestWater, neighbor].sort(compareCellIds);
      }
      metrics.updates += 1;
      metrics.frontier = frontier.length;

      recorder.push({
        phase: "Update",
        description: `Water cell ${formatCellLabel(neighbor)} locks shoreline distance ${nextDistance} and joins the frontier.`,
        explanation: {
          summary: "Publish one newly resolved water cell and enqueue it for the next BFS shoreline wave.",
          details:
            "The updated distance grid and frontier are recorded immediately so replay can jump to any shoreline assignment without browser-side recomputation.",
          tags: ["edge", "frontier"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `as-far-from-land-as-possible-update-${currentCell}-${neighbor}-${metrics.updates}`,
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
      description: `${formatCellLabel(currentCell)} is fully processed for shoreline replay.`,
      explanation: {
        summary: "Seal one BFS source after all neighboring shoreline checks are recorded.",
        details:
          "This checkpoint captures the updated distance grid, remaining-water ledger, and queue state directly so replay can jump between BFS wave boundaries safely.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `as-far-from-land-as-possible-settled-${currentCell}`,
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
  updatedWater = [];
  outcome = "resolved";
  answer = maxDistance ?? -1;
  unreachableWater = Array.from(remainingWater).sort(compareCellIds);
  metrics.frontier = frontier.length;

  recorder.push({
    phase: "Resolution",
    description:
      farthestWater.length === 1
        ? `The farthest water cell is ${formatCellLabel(farthestWater[0]!)} at shoreline distance ${answer}.`
        : `Water cells ${farthestWater.map(formatCellLabel).join(", ")} tie for the farthest shoreline distance of ${answer}.`,
    explanation: {
      summary: "Publish the terminal farthest-water result once the shoreline frontier empties.",
      details:
        "The terminal frame stores the final distance grid, farthest-water ledger, and returned answer directly so replay never recomputes the shoreline sweep offline.",
      tags: ["result", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "as-far-from-land-as-possible-final",
        path: "state.farthestWater",
        kind: "collection",
        intent: "result",
        label:
          farthestWater.length === 1
            ? `Farthest ${formatCellLabel(farthestWater[0]!)}`
            : `Farthest tie ${farthestWater.map(formatCellLabel).join(", ")}`
      }
    ]
  });

  return buildGraphEnvelope(definition, normalizedInput, recorder);
}

export function buildMapOfHighestPeakTrace(
  input: MapOfHighestPeakInput
): TraceEnvelope<GraphExecutionState> {
  const definition = graphAlgorithmDefinitions["map-of-highest-peak"];
  const normalizedInput = normalizeMapOfHighestPeakInput(input);
  const grid: number[][] = normalizedInput.grid.map((row) =>
    row.map((cell) => (cell === 1 ? 0 : wallsAndGatesInfinity))
  );
  const rowCount = grid.length;
  const columnCount = grid[0]!.length;
  const settled: string[] = [];
  const frontier: string[] = [];
  const waterCells: string[] = [];
  const waterCellSet = new Set<string>();
  const remainingLand = new Set<string>();
  const recorder = createMapOfHighestPeakRecorder();
  const metrics: GraphMetricState = {
    settled: 0,
    frontier: 0,
    inspections: 0,
    updates: 0
  };
  let current: string | null = null;
  let activeEdge: string[] = [];
  let updatedLand: string[] = [];
  let fullyAssigned: boolean | null = null;
  let maxHeight: number | null = null;
  let highestCells: string[] = [];

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      const inputValue = normalizedInput.grid[row]![column]!;
      const cell = makeCellId(row, column);

      if (inputValue === 1) {
        waterCells.push(cell);
        waterCellSet.add(cell);
        frontier.push(cell);
      } else {
        remainingLand.add(cell);
      }
    }
  }

  metrics.frontier = frontier.length;

  const createRuntimeState = (): MapOfHighestPeakRuntimeState => ({
    grid,
    settled,
    frontier,
    current,
    activeEdge,
    waterCells,
    updatedLand,
    remainingLand,
    fullyAssigned,
    maxHeight,
    highestCells
  });

  recorder.push({
    phase: "Initialization",
    description: `${frontier.length} water cell${frontier.length === 1 ? "" : "s"} seed the height BFS before any land cell receives a peak height.`,
    explanation: {
      summary: "Seed every water source and convert land cells into explicit unresolved height slots.",
      details:
        "The opening frame stores the ordered water frontier and every remaining land cell directly so replay never reconstructs the height wave from hidden BFS state.",
      tags: ["snapshot", "frontier"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "map-of-highest-peak-initial",
        path: "state.frontier",
        kind: "collection",
        intent: "focus",
        label: `${frontier.length} water source${frontier.length === 1 ? "" : "s"} queued`
      }
    ]
  });

  if (remainingLand.size === 0) {
    fullyAssigned = true;
    maxHeight = 0;
    highestCells = waterCells.slice();

    recorder.push({
      phase: "Resolution",
      description: "Every cell is already water, so the height map resolves immediately as a flat zero plateau.",
      explanation: {
        summary: "Publish the terminal height map immediately when no land cell needs a positive height.",
        details:
          "The terminal frame still records the full water-source ledger so replay can explain why no BFS expansion or height growth was required.",
        tags: ["result", "graph"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "map-of-highest-peak-final-immediate",
          path: "state.maxHeight",
          kind: "node",
          intent: "result",
          label: "Flat water plateau"
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
    updatedLand = [];
    activeEdge = [];
    metrics.frontier = frontier.length;

    recorder.push({
      phase: "Extract",
      description: `${formatCellLabel(currentCell)} becomes the active source for height assignment.`,
      explanation: {
        summary: "Expand the next water or resolved land cell from the ordered multi-source frontier.",
        details:
          "Replay records the active source before neighbor checks begin so each height wave stays readable without recomputing queue order.",
        tags: ["frontier", "focus"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `map-of-highest-peak-current-${currentCell}`,
          path: "state.current",
          kind: "node",
          intent: "active",
          label: `Expand ${formatCellLabel(currentCell)}`
        }
      ]
    });

    const { row, column } = parseCellId(currentCell);
    const currentHeight = grid[row]![column]!;

    for (const neighbor of getNeighborCellIds(row, column, rowCount, columnCount)) {
      const { row: neighborRow, column: neighborColumn } = parseCellId(neighbor);
      const neighborValue = grid[neighborRow]![neighborColumn]!;
      activeEdge = [currentCell, neighbor];
      metrics.inspections += 1;

      if (neighborValue !== wallsAndGatesInfinity) {
        const isWater = waterCellSet.has(neighbor);

        recorder.push({
          phase: "Inspect",
          description: isWater
            ? `Inspect ${formatCellLabel(neighbor)} and keep the frontier stable because that cell is already water at height 0.`
            : `Inspect ${formatCellLabel(neighbor)} and keep the frontier stable because that land cell already holds height ${neighborValue}.`,
          explanation: {
            summary: isWater
              ? "Inspect a water source without enqueuing it again."
              : "Inspect an already assigned land cell without replacing its first BFS height.",
            details: isWater
              ? "Water cells remain fixed at height 0, so replay preserves the original multi-source seed without duplicate queue work."
              : "Previously assigned land cells keep their first recorded height, which preserves the BFS proof that the smallest valid height arrived first.",
            tags: ["edge", "focus"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `map-of-highest-peak-inspect-${currentCell}-${neighbor}-${metrics.inspections}`,
              path: `state.grid.${neighborRow}.${neighborColumn}`,
              kind: "node",
              intent: "candidate",
              label: isWater
                ? `Water ${formatCellLabel(neighbor)}`
                : `Height ${neighborValue} at ${formatCellLabel(neighbor)}`
            }
          ]
        });
        continue;
      }

      const nextHeight = currentHeight + 1;
      grid[neighborRow]![neighborColumn] = nextHeight;
      frontier.push(neighbor);
      updatedLand.push(neighbor);
      remainingLand.delete(neighbor);
      if (maxHeight === null || nextHeight > maxHeight) {
        maxHeight = nextHeight;
        highestCells = [neighbor];
      } else if (nextHeight === maxHeight) {
        highestCells = [...highestCells, neighbor].sort(compareCellIds);
      }
      metrics.updates += 1;
      metrics.frontier = frontier.length;

      recorder.push({
        phase: "Update",
        description: `Land cell ${formatCellLabel(neighbor)} locks height ${nextHeight} and joins the frontier.`,
        explanation: {
          summary: "Publish one newly assigned land height and enqueue it for the next BFS wave.",
          details:
            "The updated height grid and frontier are recorded immediately so replay can jump to any peak-assignment step without browser-side recomputation.",
          tags: ["edge", "frontier"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `map-of-highest-peak-update-${currentCell}-${neighbor}-${metrics.updates}`,
            path: `state.grid.${neighborRow}.${neighborColumn}`,
            kind: "node",
            intent: "frontier",
            label: `Height ${nextHeight}`
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
      description: `${formatCellLabel(currentCell)} is fully processed for height-map replay.`,
      explanation: {
        summary: "Seal one BFS source after all neighboring height checks are recorded.",
        details:
          "This checkpoint captures the updated height grid, remaining-land ledger, and queue state directly so replay can jump between BFS wave boundaries safely.",
        tags: ["checkpoint", "visited"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `map-of-highest-peak-settled-${currentCell}`,
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
  updatedLand = [];
  fullyAssigned = remainingLand.size === 0;
  metrics.frontier = frontier.length;

  recorder.push({
    phase: "Resolution",
    description:
      highestCells.length === 1
        ? `Cell ${formatCellLabel(highestCells[0]!)} reaches the highest assigned peak of ${maxHeight ?? 0}.`
        : `Cells ${highestCells.map(formatCellLabel).join(", ")} tie for the highest assigned peak of ${maxHeight ?? 0}.`,
    explanation: {
      summary: "Publish the terminal height map once every land cell has received its BFS-assigned height.",
      details:
        "The terminal frame stores the full height grid and highest-cell ledger directly so replay never recomputes the final peak assignment offline.",
      tags: ["result", "graph"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "map-of-highest-peak-final",
        path: "state.highestCells",
        kind: "collection",
        intent: "result",
        label:
          highestCells.length === 1
            ? `Highest ${formatCellLabel(highestCells[0]!)}`
            : `Highest tie ${highestCells.map(formatCellLabel).join(", ")}`
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
    case "network-delay-time":
      return buildNetworkDelayTimeTrace(graph as PathfindingGraphInput);
    case "clone-graph":
      return buildCloneGraphTrace(graph as PathfindingGraphInput);
    case "graph-valid-tree":
      return buildGraphValidTreeTrace(graph as GraphValidTreeInput);
    case "count-connected-components":
      return buildCountConnectedComponentsTrace(graph as GraphValidTreeInput);
    case "redundant-connection":
      return buildRedundantConnectionTrace(graph as GraphValidTreeInput);
    case "course-schedule":
      return buildCourseScheduleTrace(graph as CourseScheduleInput);
    case "course-schedule-ii":
      return buildCourseScheduleIiTrace(graph as CourseScheduleInput);
    case "rotting-oranges":
      return buildRottingOrangesTrace(graph as RottingOrangesInput);
    case "number-of-islands":
      return buildNumberOfIslandsTrace(graph as NumberOfIslandsInput);
    case "max-area-of-island":
      return buildMaxAreaOfIslandTrace(graph as NumberOfIslandsInput);
    case "island-perimeter":
      return buildIslandPerimeterTrace(graph as NumberOfIslandsInput);
    case "pacific-atlantic-water-flow":
      return buildPacificAtlanticWaterFlowTrace(graph as PacificAtlanticWaterFlowInput);
    case "shortest-bridge":
      return buildShortestBridgeTrace(graph as ShortestBridgeInput);
    case "shortest-path-binary-matrix":
      return buildShortestPathBinaryMatrixTrace(graph as ShortestPathBinaryMatrixInput);
    case "nearest-exit-from-entrance-in-maze":
      return buildNearestExitFromEntranceInMazeTrace(graph as NearestExitFromEntranceInMazeInput);
    case "shortest-path-in-a-grid-with-obstacles-elimination":
      return buildShortestPathGridWithObstaclesEliminationTrace(
        graph as ShortestPathGridWithObstaclesEliminationInput
      );
    case "minimum-obstacle-removal-to-reach-corner":
      return buildMinimumObstacleRemovalToReachCornerTrace(
        graph as MinimumObstacleRemovalToReachCornerInput
      );
    case "swim-in-rising-water":
      return buildSwimInRisingWaterTrace(graph as SwimInRisingWaterInput);
    case "shortest-path-to-get-food":
      return buildShortestPathToGetFoodTrace(graph as ShortestPathToGetFoodInput);
    case "01-matrix":
      return buildZeroOneMatrixTrace(graph as ZeroOneMatrixInput);
    case "as-far-from-land-as-possible":
      return buildAsFarFromLandAsPossibleTrace(graph as AsFarFromLandAsPossibleInput);
    case "map-of-highest-peak":
      return buildMapOfHighestPeakTrace(graph as MapOfHighestPeakInput);
    case "surrounded-regions":
      return buildSurroundedRegionsTrace(graph as SurroundedRegionsInput);
    case "walls-and-gates":
      return buildWallsAndGatesTrace(graph as WallsAndGatesInput);
  }
}

export function formatGraphDistance(distance: number | null): string {
  return distance === null ? "inf" : String(distance);
}
