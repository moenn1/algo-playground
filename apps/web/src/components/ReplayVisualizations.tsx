import {
  type DailyTemperaturesExecutionState,
  type ContainerWithMostWaterExecutionState,
  type GraphExecutionState,
  type LargestRectangleInHistogramExecutionState,
  type MinStackExecutionState,
  type SortingExecutionState,
  type ValidParenthesesExecutionState,
  type TrappingRainWaterExecutionState,
  type TwoPointersExecutionState
} from "@tracedeck/execution-engine";
import { type JsonObject, type TraceStep } from "@tracedeck/trace-core";

import {
  formatDistance,
  type GraphRun,
  type HashRun,
  type HeapRun,
  type IntervalRun,
  isCourseScheduleInput,
  isGraphValidTreeInput,
  isNumberOfIslandsInput,
  isPacificAtlanticWaterFlowInput,
  isPathfindingGraphInput,
  isRottingOrangesInput,
  isShortestBridgeInput,
  isShortestPathBinaryMatrixInput,
  isZeroOneMatrixInput,
  isSurroundedRegionsInput,
  isWallsAndGatesInput,
  type SearchRun,
  type SortingRun,
  type StackRun,
  type TwoPointersRun
} from "../replay.js";

type SortingStageDensity = "detailed" | "compact";
type GraphPoint = { x: number; y: number };

function getStep<State extends JsonObject>(
  steps: Array<TraceStep<State>>,
  stepIndex: number
): TraceStep<State> {
  const safeIndex = Math.max(0, Math.min(stepIndex, steps.length - 1));
  return steps[safeIndex]!;
}

function getSortingWindow(indices: number[]) {
  if (indices.length === 0) {
    return null;
  }

  return {
    start: Math.min(...indices),
    end: Math.max(...indices)
  };
}

export function describeSortingOperation(step: TraceStep<SortingExecutionState>): string {
  if (step.state.swapPair.length === 2) {
    return `Swap lanes ${step.state.swapPair[0]} and ${step.state.swapPair[1]}`;
  }

  const activeWindow = getSortingWindow(step.state.activeIndices);

  if (activeWindow) {
    if (activeWindow.start === activeWindow.end) {
      return `Inspect lane ${activeWindow.start}`;
    }

    return `Scan lanes ${activeWindow.start} through ${activeWindow.end}`;
  }

  if (step.state.sortedIndices.length === step.state.array.length) {
    return "All lanes locked";
  }

  return step.phase;
}

function describeSortingWindow(step: TraceStep<SortingExecutionState>): string {
  const activeWindow = getSortingWindow(step.state.activeIndices);

  if (!activeWindow) {
    return "Awaiting focus";
  }

  if (activeWindow.start === activeWindow.end) {
    return `Lane ${activeWindow.start}`;
  }

  return `${activeWindow.start} to ${activeWindow.end}`;
}

function getSortingLaneTone(
  laneIndex: number,
  step: TraceStep<SortingExecutionState>
): "active" | "swap" | "sorted" | "idle" {
  if (step.state.swapPair.includes(laneIndex)) {
    return "swap";
  }

  if (step.state.activeIndices.includes(laneIndex)) {
    return "active";
  }

  if (step.state.sortedIndices.includes(laneIndex)) {
    return "sorted";
  }

  return "idle";
}

function formatSortingLaneStatus(tone: ReturnType<typeof getSortingLaneTone>): string {
  switch (tone) {
    case "swap":
      return "Swap";
    case "active":
      return "Active";
    case "sorted":
      return "Locked";
    default:
      return "Idle";
  }
}

export function buildGraphLayout(nodes: string[]): Record<string, GraphPoint> {
  const radius = nodes.length <= 4 ? 92 : nodes.length <= 6 ? 116 : 132;
  const centerX = 180;
  const centerY = 150;

  return Object.fromEntries(
    nodes.map((node, index) => {
      const angle = (Math.PI * 2 * index) / nodes.length - Math.PI / 2;

      return [
        node,
        {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * (radius * 0.82)
        }
      ];
    })
  );
}

function getPathfindingGraphNodeTone(
  node: string,
  step: TraceStep<GraphExecutionState>
): "current" | "path" | "settled" | "frontier" | "idle" {
  if (step.state.kind !== "bfs" && step.state.kind !== "dfs" && step.state.kind !== "dijkstra") {
    return "idle";
  }

  if (step.state.current === node) {
    return "current";
  }

  if (step.state.path.includes(node)) {
    return "path";
  }

  if (step.state.settled.includes(node)) {
    return "settled";
  }

  if (step.state.frontier.includes(node)) {
    return "frontier";
  }

  return "idle";
}

function formatGraphNodeStatus(
  node: string,
  step: TraceStep<GraphExecutionState>,
  run: GraphRun
): string {
  if (
    step.state.kind === "course-schedule" ||
    step.state.kind === "rotting-oranges" ||
    step.state.kind === "number-of-islands" ||
    step.state.kind === "max-area-of-island" ||
    step.state.kind === "island-perimeter" ||
    step.state.kind === "pacific-atlantic-water-flow" ||
    step.state.kind === "shortest-bridge" ||
    step.state.kind === "shortest-path-binary-matrix" ||
    step.state.kind === "01-matrix" ||
    step.state.kind === "surrounded-regions" ||
    step.state.kind === "walls-and-gates" ||
    isCourseScheduleInput(run.input) ||
    isRottingOrangesInput(run.input) ||
    isNumberOfIslandsInput(run.input) ||
    isPacificAtlanticWaterFlowInput(run.input) ||
    isShortestBridgeInput(run.input) ||
    isShortestPathBinaryMatrixInput(run.input) ||
    isZeroOneMatrixInput(run.input) ||
    isSurroundedRegionsInput(run.input) ||
    isWallsAndGatesInput(run.input)
  ) {
    return "Blocked";
  }

  const tone = getPathfindingGraphNodeTone(node, step);

  switch (tone) {
    case "current":
      return "Current";
    case "path":
      return "Route";
    case "settled":
      return "Settled";
    case "frontier":
      if (run.algorithm.id === "bfs") {
        return "Queued";
      }

      if (run.algorithm.id === "dfs") {
        return "Stacked";
      }

      return "Frontier";
    default:
      if (run.input.start === node) {
        return "Source";
      }

      if (run.input.target === node) {
        return "Target";
      }

      return "Idle";
  }
}

function formatGraphNodeMeta(node: string, run: GraphRun): string {
  if (isCourseScheduleInput(run.input)) {
    return "Course node";
  }

  if (
    isNumberOfIslandsInput(run.input) ||
    isShortestBridgeInput(run.input) ||
    isShortestPathBinaryMatrixInput(run.input) ||
    isZeroOneMatrixInput(run.input) ||
    isPacificAtlanticWaterFlowInput(run.input) ||
    isRottingOrangesInput(run.input) ||
    isWallsAndGatesInput(run.input)
  ) {
    return "Grid cell";
  }

  const labels: string[] = [];

  if (run.input.start === node) {
    labels.push("Source");
  }

  if (run.input.target === node) {
    labels.push("Target");
  }

  if (labels.length === 0) {
    return "Intermediate node";
  }

  return labels.join(" · ");
}

function formatActiveEdge(activeEdge: string[]): string {
  if (activeEdge.length !== 2) {
    return "No edge under inspection";
  }

  return `${activeEdge[0]} -> ${activeEdge[1]}`;
}

function getCourseNodeTone(
  course: string,
  step: TraceStep<Extract<GraphExecutionState, { kind: "course-schedule" }>>
): "current" | "path" | "settled" | "frontier" | "idle" {
  if (step.state.current === course) {
    return "current";
  }

  if (step.state.settled.includes(course)) {
    return "settled";
  }

  if (step.state.frontier.includes(course)) {
    return "frontier";
  }

  if (step.state.cycleNodes.includes(course)) {
    return "path";
  }

  return "idle";
}

function formatCourseNodeStatus(
  course: string,
  step: TraceStep<Extract<GraphExecutionState, { kind: "course-schedule" }>>
): string {
  const tone = getCourseNodeTone(course, step);

  switch (tone) {
    case "current":
      return "Current";
    case "settled":
      return "Scheduled";
    case "frontier":
      return "Ready";
    case "path":
      return step.state.schedulable === false ? "Cycle" : "Ordered";
    default:
      return step.state.indegrees[course] === 0 ? "Waiting" : "Blocked";
  }
}

function formatCourseNodeMeta(
  course: string,
  step: TraceStep<Extract<GraphExecutionState, { kind: "course-schedule" }>>
): string {
  const orderIndex = step.state.order.indexOf(course);

  if (orderIndex >= 0) {
    return `Order #${orderIndex + 1}`;
  }

  if (step.state.cycleNodes.includes(course)) {
    return "Unresolved dependency cycle";
  }

  return `Indegree ${step.state.indegrees[course] ?? 0}`;
}

type UnionFindGraphStep = TraceStep<
  | Extract<GraphExecutionState, { kind: "graph-valid-tree" }>
  | Extract<GraphExecutionState, { kind: "count-connected-components" }>
  | Extract<GraphExecutionState, { kind: "redundant-connection" }>
>;

function getTreeNodeTone(
  node: string,
  step: UnionFindGraphStep
): "current" | "path" | "settled" | "frontier" | "idle" {
  if (step.state.activeEdge.includes(node)) {
    return "current";
  }

  if (step.state.currentRoots.includes(node)) {
    return "frontier";
  }

  if (step.state.parents[node] === Number(node)) {
    return "settled";
  }

  if (step.state.kind === "graph-valid-tree" && step.state.isTree === true) {
    return "path";
  }

  if (step.state.kind === "redundant-connection" && step.state.hasRedundantConnection === true) {
    return "path";
  }

  if (step.state.kind === "count-connected-components" && step.state.current === null) {
    const component = step.state.components.find((group) => group.includes(node));
    if (component && component.length > 1) {
      return "path";
    }
  }

  return "idle";
}

function formatTreeNodeStatus(
  node: string,
  step: UnionFindGraphStep
): string {
  const tone = getTreeNodeTone(node, step);

  switch (tone) {
    case "current":
      return "Inspect";
    case "frontier":
      return "Root";
    case "settled":
      return "Representative";
    case "path":
      return "Connected";
    default: {
      const component = step.state.components.find((group) => group.includes(node));
      return component && component.length === 1 ? "Isolated" : "Attached";
    }
  }
}

function formatTreeNodeMeta(
  node: string,
  step: UnionFindGraphStep
): string {
  const component = step.state.components.find((group) => group.includes(node)) ?? [node];
  return `Parent ${step.state.parents[node]} · Rank ${step.state.ranks[node]} · ${component.join(", ")}`;
}

function createCloneGraphEdgeLabel(from: string, to: string, directed: boolean): string {
  if (directed) {
    return `${from}->${to}`;
  }

  return [from, to].sort((left, right) => left.localeCompare(right)).join("-");
}

function getCloneNodeTone(
  node: string,
  step: TraceStep<Extract<GraphExecutionState, { kind: "clone-graph" }>>
): "current" | "path" | "settled" | "frontier" | "idle" {
  if (step.state.current === node || step.state.activeEdge.includes(node)) {
    return "current";
  }

  if (step.state.settled.includes(node)) {
    return "settled";
  }

  if (step.state.frontier.includes(node)) {
    return "frontier";
  }

  if (step.state.clonedNodes.includes(node)) {
    return "path";
  }

  return "idle";
}

function formatCloneNodeStatus(
  node: string,
  step: TraceStep<Extract<GraphExecutionState, { kind: "clone-graph" }>>
): string {
  const tone = getCloneNodeTone(node, step);

  switch (tone) {
    case "current":
      return "Inspect";
    case "settled":
      return "Copied";
    case "frontier":
      return "Queued";
    case "path":
      return "Cloned";
    default:
      return step.state.unreachableNodes.includes(node) ? "Unreached" : "Idle";
  }
}

function formatCloneNodeMeta(
  node: string,
  step: TraceStep<Extract<GraphExecutionState, { kind: "clone-graph" }>>
): string {
  const cloneLabel = step.state.cloneMap[node];

  if (cloneLabel) {
    return `Clone ${cloneLabel}`;
  }

  if (step.state.unreachableNodes.includes(node)) {
    return "Outside the entry component";
  }

  return "Awaiting clone allocation";
}

function getOrangeCellTone(
  cell: string,
  value: number,
  step: TraceStep<Extract<GraphExecutionState, { kind: "rotting-oranges" }>>
):
  | "current"
  | "frontier"
  | "settled"
  | "newly"
  | "fresh"
  | "stalled"
  | "empty" {
  if (value === 0) {
    return "empty";
  }

  if (step.state.current === cell) {
    return "current";
  }

  if (step.state.frontier.includes(cell)) {
    return "frontier";
  }

  if (step.state.newlyRotted.includes(cell)) {
    return "newly";
  }

  if (step.state.settled.includes(cell)) {
    return "settled";
  }

  if (step.state.stalledFresh.includes(cell)) {
    return "stalled";
  }

  return "fresh";
}

function formatOrangeCellStatus(
  cell: string,
  value: number,
  step: TraceStep<Extract<GraphExecutionState, { kind: "rotting-oranges" }>>
): string {
  switch (getOrangeCellTone(cell, value, step)) {
    case "current":
      return "Active source";
    case "frontier":
      return `Minute ${step.state.minute + 1} frontier`;
    case "newly":
      return "Newly rotten";
    case "settled":
      return "Processed";
    case "stalled":
      return "Unreachable fresh";
    case "empty":
      return "Empty";
    default:
      return "Fresh";
  }
}

type IslandTraversalState = Extract<
  GraphExecutionState,
  { kind: "number-of-islands" | "max-area-of-island" }
>;

type IslandPerimeterState = Extract<GraphExecutionState, { kind: "island-perimeter" }>;

function getIslandCellTone(
  cell: string,
  value: string,
  step: TraceStep<IslandTraversalState>
):
  | "current"
  | "frontier"
  | "scan"
  | "active"
  | "settled"
  | "land"
  | "water" {
  if (value === "0") {
    return step.state.scan === cell ? "scan" : "water";
  }

  if (step.state.current === cell) {
    return "current";
  }

  if (step.state.frontier.includes(cell)) {
    return "frontier";
  }

  if (step.state.scan === cell) {
    return "scan";
  }

  if (step.state.activeIsland.includes(cell)) {
    return "active";
  }

  if (step.state.settled.includes(cell)) {
    return "settled";
  }

  return "land";
}

function formatIslandCellStatus(
  cell: string,
  value: string,
  step: TraceStep<IslandTraversalState>
): string {
  switch (getIslandCellTone(cell, value, step)) {
    case "current":
      return `Island ${step.state.activeIslandId ?? "?"} focus`;
    case "frontier":
      return `Island ${step.state.activeIslandId ?? "?"} frontier`;
    case "scan":
      return value === "0" ? "Water scan" : "Scan cursor";
    case "active":
      return `Island ${step.state.cellIslands[cell] ?? "?"} claimed`;
    case "settled":
      return `Island ${step.state.cellIslands[cell] ?? "?"} complete`;
    case "water":
      return "Water";
    default:
      return "Unclaimed land";
  }
}

function getIslandPerimeterCellTone(
  cell: string,
  value: string,
  step: TraceStep<IslandPerimeterState>
): "current" | "frontier" | "scan" | "active" | "settled" | "land" | "water" {
  if (value === "0") {
    return step.state.scan === cell ? "scan" : "water";
  }

  if (step.state.current === cell) {
    return "current";
  }

  if (step.state.settled.includes(cell)) {
    return "settled";
  }

  if (step.state.remainingLand.includes(cell)) {
    return "frontier";
  }

  if (step.state.scan === cell) {
    return "scan";
  }

  return "land";
}

function formatIslandPerimeterCellStatus(
  cell: string,
  value: string,
  step: TraceStep<IslandPerimeterState>
): string {
  switch (getIslandPerimeterCellTone(cell, value, step)) {
    case "current":
      return `Adds ${step.state.currentContribution} edge${step.state.currentContribution === 1 ? "" : "s"}`;
    case "frontier":
      return "Pending land";
    case "scan":
      return value === "0" ? "Water scan" : "Scan cursor";
    case "settled":
      return "Perimeter counted";
    case "water":
      return "Water";
    default:
      return "Land";
  }
}

function getSurroundedRegionCellTone(
  cell: string,
  value: string,
  step: TraceStep<Extract<GraphExecutionState, { kind: "surrounded-regions" }>>
): "current" | "frontier" | "scan" | "active" | "settled" | "land" | "water" {
  if (step.state.current === cell) {
    return "current";
  }

  if (step.state.frontier.includes(cell)) {
    return "frontier";
  }

  if (step.state.capturedCells.includes(cell)) {
    return "settled";
  }

  if (value === "X") {
    return "water";
  }

  if (step.state.safeCells.includes(cell)) {
    return step.state.settled.includes(cell) ? "scan" : "active";
  }

  if (step.state.remainingOpen.includes(cell)) {
    return "land";
  }

  return "scan";
}

function formatSurroundedRegionCellStatus(
  cell: string,
  value: string,
  step: TraceStep<Extract<GraphExecutionState, { kind: "surrounded-regions" }>>
): string {
  if (step.state.current === cell) {
    return step.state.phaseMode === "capture" ? "Capture focus" : "Safe flood focus";
  }

  if (step.state.frontier.includes(cell)) {
    return step.state.phaseMode === "capture" ? "Capture queue" : "Safe frontier";
  }

  if (step.state.capturedCells.includes(cell)) {
    return "Captured to X";
  }

  if (value === "X") {
    return "Wall";
  }

  if (step.state.safeCells.includes(cell)) {
    return step.state.boundarySeeds.includes(cell) ? "Boundary-safe O" : "Protected O";
  }

  if (step.state.remainingOpen.includes(cell)) {
    return "Enclosed candidate";
  }

  return "Resolved";
}

function getPacificAtlanticCellTone(
  cell: string,
  step: TraceStep<Extract<GraphExecutionState, { kind: "pacific-atlantic-water-flow" }>>
): "current" | "frontier" | "scan" | "active" | "settled" | "land" | "water" {
  if (step.state.current === cell) {
    return "current";
  }

  if (step.state.frontier.includes(cell)) {
    return "frontier";
  }

  if (step.state.dualReachable.includes(cell)) {
    return "settled";
  }

  if (step.state.pacificReachable.includes(cell)) {
    return "active";
  }

  if (step.state.atlanticReachable.includes(cell)) {
    return "land";
  }

  return "water";
}

function formatPacificAtlanticCellStatus(
  cell: string,
  step: TraceStep<Extract<GraphExecutionState, { kind: "pacific-atlantic-water-flow" }>>
): string {
  if (step.state.current === cell) {
    return step.state.phaseMode === "pacific" ? "Pacific focus" : "Atlantic focus";
  }

  if (step.state.frontier.includes(cell)) {
    return step.state.phaseMode === "pacific" ? "Pacific frontier" : "Atlantic frontier";
  }

  if (step.state.dualReachable.includes(cell)) {
    return "Both oceans";
  }

  if (step.state.pacificReachable.includes(cell)) {
    return "Pacific only";
  }

  if (step.state.atlanticReachable.includes(cell)) {
    return "Atlantic only";
  }

  return "Unreached";
}

function getShortestBridgeCellTone(
  cell: string,
  value: number,
  step: TraceStep<Extract<GraphExecutionState, { kind: "shortest-bridge" }>>
): "current" | "frontier" | "scan" | "active" | "settled" | "land" | "water" {
  if (step.state.current === cell) {
    return "current";
  }

  if (step.state.frontier.includes(cell)) {
    return "frontier";
  }

  if (step.state.scan === cell) {
    return "scan";
  }

  if (step.state.reachedSecondIsland.includes(cell)) {
    return "settled";
  }

  if (step.state.expandedWater.includes(cell)) {
    return "active";
  }

  if (step.state.firstIsland.includes(cell)) {
    return step.state.settled.includes(cell) ? "settled" : "land";
  }

  return value === 1 ? "land" : "water";
}

function formatShortestBridgeCellStatus(
  cell: string,
  value: number,
  step: TraceStep<Extract<GraphExecutionState, { kind: "shortest-bridge" }>>
): string {
  if (step.state.current === cell) {
    return step.state.phaseMode === "mark-island" ? "Mark focus" : "Bridge focus";
  }

  if (step.state.frontier.includes(cell)) {
    return step.state.phaseMode === "mark-island" ? "Island frontier" : `Wave ${step.state.wave + 1} frontier`;
  }

  if (step.state.scan === cell) {
    return value === 1 ? "Land scan" : "Water scan";
  }

  if (step.state.reachedSecondIsland.includes(cell)) {
    return "Second island";
  }

  if (step.state.expandedWater.includes(cell)) {
    return "Bridge water";
  }

  if (step.state.firstIsland.includes(cell)) {
    return "First island";
  }

  return value === 1 ? "Unreached land" : "Water";
}

function getShortestPathBinaryMatrixCellTone(
  cell: string,
  step: TraceStep<Extract<GraphExecutionState, { kind: "shortest-path-binary-matrix" }>>
): "current" | "frontier" | "scan" | "active" | "settled" | "land" | "water" {
  if (step.state.current === cell) {
    return "current";
  }

  if (step.state.path.includes(cell)) {
    return "settled";
  }

  if (step.state.frontier.includes(cell)) {
    return "frontier";
  }

  if (step.state.blockedCells.includes(cell)) {
    return "water";
  }

  if (step.state.visitedOpen.includes(cell)) {
    return "active";
  }

  return "land";
}

function formatShortestPathBinaryMatrixCellStatus(
  cell: string,
  step: TraceStep<Extract<GraphExecutionState, { kind: "shortest-path-binary-matrix" }>>
): string {
  if (step.state.current === cell) {
    return step.state.phaseMode === "traceback" ? "Traceback focus" : "Search focus";
  }

  if (step.state.path.includes(cell)) {
    return "Shortest path";
  }

  if (step.state.frontier.includes(cell)) {
    return "Queued open cell";
  }

  if (step.state.blockedCells.includes(cell)) {
    return "Blocked";
  }

  if (step.state.visitedOpen.includes(cell)) {
    return step.state.phaseMode === "traceback" ? "Reachable open cell" : "Discovered open cell";
  }

  return "Open";
}

function formatGateCellValue(value: number): string {
  if (value === -1) {
    return "Wall";
  }

  if (value === 0) {
    return "Gate";
  }

  if (value === 2147483647) {
    return "Room";
  }

  return `Dist ${value}`;
}

function getGateCellTone(
  cell: string,
  value: number,
  step: TraceStep<Extract<GraphExecutionState, { kind: "walls-and-gates" }>>
):
  | "current"
  | "frontier"
  | "settled"
  | "updated"
  | "gate"
  | "wall"
  | "room"
  | "blocked" {
  if (value === -1) {
    return "wall";
  }

  if (step.state.current === cell) {
    return "current";
  }

  if (step.state.frontier.includes(cell)) {
    return "frontier";
  }

  if (value === 0) {
    return "gate";
  }

  if (step.state.updatedRooms.includes(cell)) {
    return "updated";
  }

  if (step.state.unreachableRooms.includes(cell)) {
    return "blocked";
  }

  if (step.state.settled.includes(cell)) {
    return "settled";
  }

  return "room";
}

function formatGateCellStatus(
  cell: string,
  value: number,
  step: TraceStep<Extract<GraphExecutionState, { kind: "walls-and-gates" }>>
): string {
  switch (getGateCellTone(cell, value, step)) {
    case "current":
      return value === 0 ? "Active gate" : "Fill source";
    case "frontier":
      return value === 0 ? "Queued gate" : "Queued room";
    case "updated":
      return `Distance ${value}`;
    case "settled":
      return value === 0 ? "Processed gate" : `Settled ${value}`;
    case "gate":
      return "Gate";
    case "wall":
      return "Wall";
    case "blocked":
      return "Unreachable room";
    default:
      return "Infinity room";
  }
}

function formatZeroOneMatrixCellValue(value: number): string {
  if (value === 0) {
    return "Zero";
  }

  if (value === 2147483647) {
    return "Pending";
  }

  return `Dist ${value}`;
}

function getZeroOneMatrixCellTone(
  cell: string,
  value: number,
  step: TraceStep<Extract<GraphExecutionState, { kind: "01-matrix" }>>
): "current" | "frontier" | "settled" | "updated" | "gate" | "room" | "blocked" {
  if (step.state.current === cell) {
    return "current";
  }

  if (step.state.frontier.includes(cell)) {
    return "frontier";
  }

  if (value === 0 && step.state.zeroCells.includes(cell)) {
    return "gate";
  }

  if (step.state.updatedCells.includes(cell)) {
    return "updated";
  }

  if (step.state.unresolvedCells.includes(cell)) {
    return "blocked";
  }

  if (step.state.settled.includes(cell)) {
    return "settled";
  }

  return "room";
}

function formatZeroOneMatrixCellStatus(
  cell: string,
  value: number,
  step: TraceStep<Extract<GraphExecutionState, { kind: "01-matrix" }>>
): string {
  switch (getZeroOneMatrixCellTone(cell, value, step)) {
    case "current":
      return value === 0 ? "Active zero" : "Fill source";
    case "frontier":
      return value === 0 ? "Queued zero" : "Queued distance";
    case "updated":
      return `Distance ${value}`;
    case "settled":
      return value === 0 ? "Processed zero" : `Settled ${value}`;
    case "gate":
      return "Zero source";
    case "blocked":
      return "Unresolved 1";
    default:
      return value === 2147483647 ? "Pending 1" : `Distance ${value}`;
  }
}

function formatInterval(interval: number[]): string {
  if (interval.length !== 2) {
    return "Pending";
  }

  return `[${interval[0]}, ${interval[1]}]`;
}

function formatHashPair(values: number[]): string {
  if (values.length !== 2) {
    return "Pending";
  }

  return `${values[0]} + ${values[1]}`;
}

function formatHeapEntry(
  entry:
    | {
        value: number;
        index: number;
      }
    | {
        value: number;
        frequency: number;
      }
    | null
): string {
  if (!entry) {
    return "Pending";
  }

  return "frequency" in entry ? `${entry.value} × ${entry.frequency}` : `${entry.value}@${entry.index}`;
}

function getStackTokenTone(
  index: number,
  step: TraceStep<ValidParenthesesExecutionState>
): "current" | "failed" | "stacked" | "matched" | "processed" | "idle" {
  if (step.state.failureIndex === index) {
    return "failed";
  }

  if (step.state.cursor === index) {
    return "current";
  }

  if (step.state.stackIndices.includes(index)) {
    return "stacked";
  }

  if (step.state.matchedPairs.some((pair) => pair.includes(index))) {
    return "matched";
  }

  if (step.state.processedIndices.includes(index)) {
    return "processed";
  }

  return "idle";
}

function formatStackTokenStatus(
  tone: ReturnType<typeof getStackTokenTone>
): string {
  switch (tone) {
    case "failed":
      return "Mismatch";
    case "current":
      return "Current";
    case "stacked":
      return "On stack";
    case "matched":
      return "Matched";
    case "processed":
      return "Cleared";
    default:
      return "Pending";
  }
}

function isValidParenthesesStackState(
  state: StackRun["trace"]["steps"][number]["state"]
): state is ValidParenthesesExecutionState {
  return state.kind === "valid-parentheses";
}

function isDailyTemperaturesStackState(
  state: StackRun["trace"]["steps"][number]["state"]
): state is DailyTemperaturesExecutionState {
  return state.kind === "daily-temperatures";
}

function isLargestRectangleStackState(
  state: StackRun["trace"]["steps"][number]["state"]
): state is LargestRectangleInHistogramExecutionState {
  return state.kind === "largest-rectangle-in-histogram";
}

function isMinStackState(
  state: StackRun["trace"]["steps"][number]["state"]
): state is MinStackExecutionState {
  return state.kind === "min-stack";
}

function formatDailyTemperatureStatus(
  index: number,
  step: TraceStep<DailyTemperaturesExecutionState>
): string {
  if (step.state.cursor === index) {
    return "Current";
  }

  if (step.state.comparisonIndex === index) {
    return "Compare";
  }

  if (step.state.currentResolvedIndex === index && step.state.currentWait !== null) {
    return `+${step.state.currentWait} day${step.state.currentWait === 1 ? "" : "s"}`;
  }

  if (step.state.stackIndices.includes(index)) {
    return "Waiting";
  }

  if (step.state.resolvedWaits[index]! > 0) {
    return `${step.state.resolvedWaits[index]} day${step.state.resolvedWaits[index] === 1 ? "" : "s"}`;
  }

  if (step.phase === "Done") {
    return "No warmer day";
  }

  if (step.state.processedIndices.includes(index)) {
    return "Scanned";
  }

  return "Pending";
}

function formatLargestRectangleStatus(
  index: number,
  step: TraceStep<LargestRectangleInHistogramExecutionState>
): string {
  if (step.state.cursor === index) {
    return "Current";
  }

  if (step.state.comparisonIndex === index) {
    return "Compare";
  }

  if (step.state.currentResolvedIndex === index && step.state.currentArea !== null) {
    return `Area ${step.state.currentArea}`;
  }

  if (step.state.stackIndices.includes(index)) {
    return "Candidate";
  }

  if (
    step.state.bestStart !== null &&
    step.state.bestEnd !== null &&
    index >= step.state.bestStart &&
    index <= step.state.bestEnd
  ) {
    return "Best span";
  }

  if (step.state.processedIndices.includes(index)) {
    return "Scanned";
  }

  return "Pending";
}

function formatMinStackOperationStatus(
  index: number,
  step: TraceStep<MinStackExecutionState>
): string {
  if (step.state.cursor === index) {
    return "Current";
  }

  if (step.state.processedIndices.includes(index)) {
    return "Done";
  }

  return "Pending";
}

function isContainerState(
  state: TwoPointersExecutionState
): state is ContainerWithMostWaterExecutionState {
  return state.kind === "container-with-most-water";
}

function isTrappingRainWaterState(
  state: TwoPointersExecutionState
): state is TrappingRainWaterExecutionState {
  return state.kind === "trapping-rain-water";
}

function getTwoPointersLaneTone(
  index: number,
  step: TwoPointersRun["trace"]["steps"][number]
): "active" | "sorted" | "idle" {
  if (step.state.left === index || step.state.right === index) {
    return "active";
  }

  if (
    isContainerState(step.state) &&
    (step.state.bestLeft === index || step.state.bestRight === index)
  ) {
    return "sorted";
  }

  if (
    isTrappingRainWaterState(step.state) &&
    (step.state.currentFillIndex === index || step.state.waterByIndex[index]! > 0)
  ) {
    return "sorted";
  }

  return "idle";
}

function formatTwoPointersStatus(
  index: number,
  step: TwoPointersRun["trace"]["steps"][number]
): string {
  if (step.state.left === index) {
    return "Left";
  }

  if (step.state.right === index) {
    return "Right";
  }

  if (
    isContainerState(step.state) &&
    (step.state.bestLeft === index || step.state.bestRight === index)
  ) {
    return "Best";
  }

  if (isTrappingRainWaterState(step.state)) {
    if (step.state.currentFillIndex === index && step.state.currentFillAmount !== null) {
      return `+${step.state.currentFillAmount} water`;
    }

    if (step.state.waterByIndex[index]! > 0) {
      return `${step.state.waterByIndex[index]} stored`;
    }
  }

  return "Idle";
}

export function SortingStage({
  run,
  stepIndex,
  density = "detailed"
}: {
  run: SortingRun;
  stepIndex: number;
  density?: SortingStageDensity;
}) {
  const step = getStep(run.trace.steps, stepIndex);
  const values = step.state.array;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(1, maxValue - minValue);
  const activeLaneLabel =
    step.state.activeIndices.length > 0 ? step.state.activeIndices.join(", ") : "None";
  const isDetailed = density === "detailed";

  return (
    <>
      <div className="visual-heading">
        <div>
          <p className="eyebrow">Live State</p>
          <h2>{run.algorithm.name} lanes</h2>
        </div>
        <p className="visual-meta">Current phase: {step.phase}</p>
      </div>
      <div className={`sort-stage-shell ${isDetailed ? "" : "sort-stage-shell-compact"}`}>
        <div className="sort-stage">
          {values.map((value, index) => {
            const tone = getSortingLaneTone(index, step);
            const classes = [
              "sort-bar",
              tone === "active" ? "sort-bar-active" : "",
              tone === "swap" ? "sort-bar-swap" : "",
              tone === "sorted" ? "sort-bar-sorted" : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div className={classes} key={`${index}-${value}`}>
                <span className="sort-bar-value">{value}</span>
                <div
                  className="sort-bar-rod"
                  style={{ height: `${18 + ((value - minValue + 1) / (range + 1)) * 180}px` }}
                />
                <span className="sort-bar-index">{index}</span>
              </div>
            );
          })}
        </div>
        <div className={`mini-grid ${isDetailed ? "" : "mini-grid-compact"}`}>
          <div className="mini-card">
            <span>Operation</span>
            <strong>{describeSortingOperation(step)}</strong>
            {isDetailed ? <p>{step.explanation.summary}</p> : null}
          </div>
          <div className="mini-card">
            <span>Active window</span>
            <strong>{describeSortingWindow(step)}</strong>
            <p>{activeLaneLabel}</p>
          </div>
          <div className="mini-card">
            <span>Trace metrics</span>
            <strong>
              {step.metrics.comparisons ?? 0} comparisons / {step.metrics.writes ?? 0} writes
            </strong>
            <p>{step.state.sortedIndices.length} lanes locked</p>
          </div>
        </div>
      </div>
      {isDetailed ? (
        <div className="sort-lane-strip" aria-label="Sorting lane ledger">
          {values.map((value, index) => {
            const tone = getSortingLaneTone(index, step);

            return (
              <article className={`lane-chip lane-chip-${tone}`} key={`lane-${index}`}>
                <div className="lane-chip-header">
                  <span>Lane {index}</span>
                  <strong>{value}</strong>
                </div>
                <span className="lane-chip-status">{formatSortingLaneStatus(tone)}</span>
              </article>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

export function SearchStage({ run, stepIndex }: { run: SearchRun; stepIndex: number }) {
  const step = getStep(run.trace.steps, stepIndex);
  const activeLow = step.state.low;
  const activeHigh = step.state.high;
  const eliminatedSet = new Set(step.state.eliminatedIndices);
  const sortedSideLabel =
    step.state.sortedSide === "left"
      ? "Left half ordered"
      : step.state.sortedSide === "right"
        ? "Right half ordered"
        : run.algorithm.id === "search-in-rotated-sorted-array"
          ? "Awaiting probe"
          : "Whole interval ordered";

  return (
    <>
      <div className="visual-heading">
        <div>
          <p className="eyebrow">Live State</p>
          <h2>{run.algorithm.name} interval</h2>
        </div>
        <p className="visual-meta">Current phase: {step.phase}</p>
      </div>
      <div className="search-stage">
        <div className="search-interval-banner">
          <span>Target {step.state.target}</span>
          <strong>
            {activeLow !== null && activeHigh !== null
              ? `Search lanes ${activeLow} through ${activeHigh}`
              : "Interval exhausted"}
          </strong>
        </div>
        <div className="search-grid">
          {step.state.array.map((value, index) => {
            const isFound = step.state.foundIndex === index;
            const isMid = step.state.mid === index;
            const isEliminated = eliminatedSet.has(index);
            const isActive =
              activeLow !== null &&
              activeHigh !== null &&
              index >= activeLow &&
              index <= activeHigh;
            const className = [
              "search-cell",
              isActive ? "search-cell-active" : "",
              isMid ? "search-cell-mid" : "",
              isFound ? "search-cell-found" : "",
              isEliminated ? "search-cell-eliminated" : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div className={className} key={`${index}-${value}`}>
                <span className="search-cell-index">{index}</span>
                <strong className="search-cell-value">{value}</strong>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mini-grid">
        <div className="mini-card">
          <span>Midpoint</span>
          <strong>{step.state.mid !== null ? step.state.mid : "Waiting"}</strong>
        </div>
        <div className="mini-card">
          <span>Active interval</span>
          <strong>
            {activeLow !== null && activeHigh !== null ? `${activeLow} to ${activeHigh}` : "Exhausted"}
          </strong>
        </div>
        <div className="mini-card">
          <span>Match state</span>
          <strong>
            {step.state.foundIndex !== null
              ? `Lane ${step.state.foundIndex}`
              : activeLow === null
                ? "Not found"
                : "Searching"}
          </strong>
        </div>
        <div className="mini-card">
          <span>Order signal</span>
          <strong>{sortedSideLabel}</strong>
        </div>
      </div>
    </>
  );
}

export function TwoPointersStage({
  run,
  stepIndex
}: {
  run: TwoPointersRun;
  stepIndex: number;
}) {
  const step = getStep(run.trace.steps, stepIndex);
  const values = step.state.heights;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(1, maxValue - minValue);
  const activePairLabel =
    step.state.left !== null && step.state.right !== null
      ? `${step.state.left} and ${step.state.right}`
      : "Sweep complete";

  return (
    <>
      <div className="visual-heading">
        <div>
          <p className="eyebrow">Live State</p>
          <h2>
            {isContainerState(step.state) ? `${run.algorithm.name} walls` : `${run.algorithm.name} basin`}
          </h2>
        </div>
        <p className="visual-meta">Current phase: {step.phase}</p>
      </div>
      <div className="sort-stage-shell">
        <div className="sort-stage">
          {values.map((value, index) => {
            const tone = getTwoPointersLaneTone(index, step);
            const className = [
              "sort-bar",
              tone === "active" ? "sort-bar-active" : "",
              tone === "sorted" ? "sort-bar-sorted" : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div className={className} key={`two-pointers-${index}-${value}`}>
                <span className="sort-bar-value">{value}</span>
                <div
                  className="sort-bar-rod"
                  style={{ height: `${18 + ((value - minValue + 1) / (range + 1)) * 180}px` }}
                />
                <span className="sort-bar-index">{index}</span>
              </div>
            );
          })}
        </div>
        <div className="mini-grid">
          {isContainerState(step.state) ? (
            <>
              <div className="mini-card">
                <span>Active pair</span>
                <strong>{activePairLabel}</strong>
                <p>
                  {step.state.currentArea !== null
                    ? `Area ${step.state.currentArea}`
                    : "No active container"}
                </p>
              </div>
              <div className="mini-card">
                <span>Width / height</span>
                <strong>
                  {step.state.width !== null && step.state.limitingHeight !== null
                    ? `${step.state.width} x ${step.state.limitingHeight}`
                    : "Sweep complete"}
                </strong>
                <p>
                  {step.state.movedPointer
                    ? `${step.state.movedPointer === "left" ? "Left" : "Right"} pointer moved last`
                    : "Waiting for first pruning move"}
                </p>
              </div>
              <div className="mini-card">
                <span>Best container</span>
                <strong>{step.state.bestArea}</strong>
                <p>
                  {step.state.bestLeft !== null && step.state.bestRight !== null
                    ? `${step.state.bestLeft} and ${step.state.bestRight}`
                    : "Pending"}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mini-card">
                <span>Active pair</span>
                <strong>{activePairLabel}</strong>
                <p>
                  {step.state.movedPointer
                    ? `${step.state.movedPointer === "left" ? "Left" : "Right"} side settled last`
                    : "Waiting for the first basin decision"}
                </p>
              </div>
              <div className="mini-card">
                <span>Boundary maxima</span>
                <strong>
                  {step.state.leftMax !== null && step.state.rightMax !== null
                    ? `${step.state.leftMax} / ${step.state.rightMax}`
                    : "Sweep complete"}
                </strong>
                <p>Left max / right max</p>
              </div>
              <div className="mini-card">
                <span>Trapped water</span>
                <strong>{step.state.totalWater}</strong>
                <p>
                  {step.state.currentFillAmount !== null && step.state.currentFillIndex !== null
                    ? `+${step.state.currentFillAmount} at wall ${step.state.currentFillIndex}`
                    : "No new fill on this step"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="sort-lane-strip" aria-label="Two-pointer wall ledger">
        {values.map((value, index) => (
          <article
            className={`lane-chip lane-chip-${getTwoPointersLaneTone(index, step)}`}
            key={`two-pointers-lane-${index}`}
          >
            <div className="lane-chip-header">
              <span>Wall {index}</span>
              <strong>{value}</strong>
            </div>
            <span className="lane-chip-status">{formatTwoPointersStatus(index, step)}</span>
          </article>
        ))}
      </div>
    </>
  );
}

export function GraphStage({ run, stepIndex }: { run: GraphRun; stepIndex: number }) {
  const step = getStep(run.trace.steps, stepIndex);
  if (step.state.kind === "01-matrix" && isZeroOneMatrixInput(run.input)) {
    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} distance grid</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="graph-legend" aria-label="01 Matrix status legend">
          <span className="graph-legend-pill graph-legend-pill-current">Active source</span>
          <span className="graph-legend-pill graph-legend-pill-frontier">Frontier</span>
          <span className="graph-legend-pill graph-legend-pill-settled">Settled distance</span>
          <span className="graph-legend-pill graph-legend-pill-path">
            {step.state.fullyResolved === false ? "Unresolved 1 cell" : "Zero source"}
          </span>
        </div>
        <div className="graph-visual-grid">
          <div className="graph-stage gate-stage">
            <div className="gate-banner">
              <span>
                {step.state.zeroCells.length} zero source
                {step.state.zeroCells.length === 1 ? "" : "s"}
              </span>
              <strong>
                {step.state.fullyResolved === false
                  ? `${step.state.unresolvedCells.length} cell${step.state.unresolvedCells.length === 1 ? "" : "s"} remain unresolved`
                  : step.state.fullyResolved === true
                    ? `Every 1 cell reaches a zero within ${step.state.maxDistance ?? 0} step${step.state.maxDistance === 1 ? "" : "s"}`
                    : `${step.state.remainingCells.length} cell${step.state.remainingCells.length === 1 ? "" : "s"} still pending`}
              </strong>
              <p>
                {step.state.activeEdge.length > 0
                  ? formatActiveEdge(step.state.activeEdge)
                  : step.state.current
                    ? `Expanding ${step.state.current}`
                    : "No edge under inspection"}
              </p>
            </div>
            <div
              className="gate-stage-grid"
              style={{
                gridTemplateColumns: `repeat(${run.input.grid[0]!.length}, minmax(0, 1fr))`
              }}
            >
              {step.state.grid.flatMap((row, rowIndex) =>
                row.map((value, columnIndex) => {
                  const cell = `${rowIndex},${columnIndex}`;
                  const tone = getZeroOneMatrixCellTone(cell, value, step);
                  const className = ["gate-cell", `gate-cell-${tone}`].filter(Boolean).join(" ");

                  return (
                    <article className={className} key={cell}>
                      <span className="gate-cell-index">
                        {rowIndex},{columnIndex}
                      </span>
                      <strong className="gate-cell-value">{formatZeroOneMatrixCellValue(value)}</strong>
                      <span className="gate-cell-status">
                        {formatZeroOneMatrixCellStatus(cell, value, step)}
                      </span>
                    </article>
                  );
                })
              )}
            </div>
          </div>
          <div className="graph-state-rail">
            <article className="mini-card graph-summary-card">
              <span>Fill focus</span>
              <strong>{step.state.current ?? "Pending extraction"}</strong>
              <p>
                {step.state.current
                  ? `${step.state.remainingCells.length} cell${step.state.remainingCells.length === 1 ? "" : "s"} still unresolved`
                  : `${step.state.frontier.length} cell${step.state.frontier.length === 1 ? "" : "s"} remain queued`}
              </p>
            </article>
            <div className="graph-node-grid">
              <article className="graph-node-card graph-node-card-frontier">
                <div className="graph-node-card-header">
                  <strong>Frontier</strong>
                  <span className="graph-node-status">{step.state.frontier.length}</span>
                </div>
                <span className="graph-node-distance">Queued distance sources</span>
                <span className="graph-node-meta">
                  {step.state.frontier.length > 0
                    ? step.state.frontier.join(" · ")
                    : "No queued cells"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-settled">
                <div className="graph-node-card-header">
                  <strong>Processed</strong>
                  <span className="graph-node-status">{step.state.settled.length}</span>
                </div>
                <span className="graph-node-distance">Settled zero and distance cells</span>
                <span className="graph-node-meta">
                  {step.state.settled.length > 0
                    ? step.state.settled.slice(-4).join(" · ")
                    : "No processed cells yet"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-path">
                <div className="graph-node-card-header">
                  <strong>Remaining</strong>
                  <span className="graph-node-status">{step.state.remainingCells.length}</span>
                </div>
                <span className="graph-node-distance">Pending 1 cells</span>
                <span className="graph-node-meta">
                  {step.state.remainingCells.length > 0
                    ? step.state.remainingCells.join(" · ")
                    : "All 1 cells resolved"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-current">
                <div className="graph-node-card-header">
                  <strong>Outcome</strong>
                  <span className="graph-node-status">
                    {step.state.fullyResolved === null
                      ? "Filling"
                      : step.state.fullyResolved
                        ? "Resolved"
                        : "Stalled"}
                  </span>
                </div>
                <span className="graph-node-distance">
                  {step.state.maxDistance !== null
                    ? `Max distance ${step.state.maxDistance}`
                    : "No terminal distance yet"}
                </span>
                <span className="graph-node-meta">
                  {step.state.unresolvedCells.length > 0
                    ? `Unresolved: ${step.state.unresolvedCells.join(" · ")}`
                    : "Nearest-zero distances are recorded directly in the grid."}
                </span>
              </article>
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Updated cells</span>
            <div className="pill-row">
              {step.state.updatedCells.length > 0 ? (
                step.state.updatedCells.map((cell) => (
                  <span className="pill" key={cell}>
                    {cell}
                  </span>
                ))
              ) : (
                <span className="empty-pill">No new distances this frame</span>
              )}
            </div>
          </div>
          <div className="mini-card">
            <span>Zero ledger</span>
            <strong>{step.state.zeroCells.join(" · ")}</strong>
            <p>
              {step.state.zeroCells.length > 0
                ? "Every zero source seeds the BFS distance wave."
                : "No zero source exists in this input."}
            </p>
          </div>
          <div className="mini-card">
            <span>Reachability</span>
            <strong>
              {step.state.fullyResolved === null
                ? "Wave active"
                : step.state.fullyResolved
                  ? "All resolved"
                  : "Missing source"}
            </strong>
            <p>
              {step.state.unresolvedCells.length > 0
                ? `Pending 1 cells remain at ${step.state.unresolvedCells.join(", ")}`
                : "Replay records every nearest-zero fill directly from the matrix snapshots."}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (step.state.kind === "walls-and-gates" && isWallsAndGatesInput(run.input)) {
    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} floorplan</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="graph-legend" aria-label="Walls and Gates status legend">
          <span className="graph-legend-pill graph-legend-pill-current">Active source</span>
          <span className="graph-legend-pill graph-legend-pill-frontier">Frontier</span>
          <span className="graph-legend-pill graph-legend-pill-settled">Settled room</span>
          <span className="graph-legend-pill graph-legend-pill-path">
            {step.state.fullyReachable === false ? "Blocked room" : "Gate or wall"}
          </span>
        </div>
        <div className="graph-visual-grid">
          <div className="graph-stage gate-stage">
            <div className="gate-banner">
              <span>
                {step.state.gates.length} gate{step.state.gates.length === 1 ? "" : "s"} ·{" "}
                {step.state.walls.length} wall{step.state.walls.length === 1 ? "" : "s"}
              </span>
              <strong>
                {step.state.fullyReachable === false
                  ? `${step.state.unreachableRooms.length} room${step.state.unreachableRooms.length === 1 ? "" : "s"} remain unreachable`
                  : step.state.fullyReachable === true
                    ? `Every room reaches a gate within ${step.state.maxDistance ?? 0} step${step.state.maxDistance === 1 ? "" : "s"}`
                    : `${step.state.remainingRooms.length} room${step.state.remainingRooms.length === 1 ? "" : "s"} still unresolved`}
              </strong>
              <p>
                {step.state.activeEdge.length > 0
                  ? formatActiveEdge(step.state.activeEdge)
                  : step.state.current
                    ? `Expanding ${step.state.current}`
                    : "No edge under inspection"}
              </p>
            </div>
            <div
              className="gate-stage-grid"
              style={{
                gridTemplateColumns: `repeat(${run.input.grid[0]!.length}, minmax(0, 1fr))`
              }}
            >
              {step.state.grid.flatMap((row, rowIndex) =>
                row.map((value, columnIndex) => {
                  const cell = `${rowIndex},${columnIndex}`;
                  const tone = getGateCellTone(cell, value, step);
                  const className = ["gate-cell", `gate-cell-${tone}`].filter(Boolean).join(" ");

                  return (
                    <article className={className} key={cell}>
                      <span className="gate-cell-index">
                        {rowIndex},{columnIndex}
                      </span>
                      <strong className="gate-cell-value">{formatGateCellValue(value)}</strong>
                      <span className="gate-cell-status">
                        {formatGateCellStatus(cell, value, step)}
                      </span>
                    </article>
                  );
                })
              )}
            </div>
          </div>
          <div className="graph-state-rail">
            <article className="mini-card graph-summary-card">
              <span>Fill focus</span>
              <strong>{step.state.current ?? "Pending extraction"}</strong>
              <p>
                {step.state.current
                  ? `${step.state.remainingRooms.length} room${step.state.remainingRooms.length === 1 ? "" : "s"} still at inf`
                  : `${step.state.frontier.length} cell${step.state.frontier.length === 1 ? "" : "s"} remain queued`}
              </p>
            </article>
            <div className="graph-node-grid">
              <article className="graph-node-card graph-node-card-frontier">
                <div className="graph-node-card-header">
                  <strong>Frontier</strong>
                  <span className="graph-node-status">{step.state.frontier.length}</span>
                </div>
                <span className="graph-node-distance">Queued fill sources</span>
                <span className="graph-node-meta">
                  {step.state.frontier.length > 0
                    ? step.state.frontier.join(" · ")
                    : "No queued cells"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-settled">
                <div className="graph-node-card-header">
                  <strong>Processed</strong>
                  <span className="graph-node-status">{step.state.settled.length}</span>
                </div>
                <span className="graph-node-distance">Settled gates and rooms</span>
                <span className="graph-node-meta">
                  {step.state.settled.length > 0
                    ? step.state.settled.slice(-4).join(" · ")
                    : "No processed cells yet"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-path">
                <div className="graph-node-card-header">
                  <strong>Remaining</strong>
                  <span className="graph-node-status">{step.state.remainingRooms.length}</span>
                </div>
                <span className="graph-node-distance">Infinity rooms</span>
                <span className="graph-node-meta">
                  {step.state.remainingRooms.length > 0
                    ? step.state.remainingRooms.join(" · ")
                    : "All rooms resolved"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-current">
                <div className="graph-node-card-header">
                  <strong>Outcome</strong>
                  <span className="graph-node-status">
                    {step.state.fullyReachable === null
                      ? "Filling"
                      : step.state.fullyReachable
                        ? "Resolved"
                        : "Stalled"}
                  </span>
                </div>
                <span className="graph-node-distance">
                  {step.state.maxDistance !== null
                    ? `Max distance ${step.state.maxDistance}`
                    : "No terminal distance yet"}
                </span>
                <span className="graph-node-meta">
                  {step.state.unreachableRooms.length > 0
                    ? `Blocked: ${step.state.unreachableRooms.join(" · ")}`
                    : "No blocked rooms"}
                </span>
              </article>
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Updated rooms</span>
            <div className="pill-row">
              {step.state.updatedRooms.length > 0 ? (
                step.state.updatedRooms.map((cell) => (
                  <span className="pill" key={cell}>
                    {cell}
                  </span>
                ))
              ) : (
                <span className="empty-pill">No new rooms this frame</span>
              )}
            </div>
          </div>
          <div className="mini-card">
            <span>Gate ledger</span>
            <strong>{step.state.gates.join(" · ")}</strong>
            <p>
              {step.state.walls.length > 0
                ? `${step.state.walls.length} blocking wall${step.state.walls.length === 1 ? "" : "s"} recorded`
                : "No wall cells on this map"}
            </p>
          </div>
          <div className="mini-card">
            <span>Reachability</span>
            <strong>
              {step.state.fullyReachable === null
                ? "Wave active"
                : step.state.fullyReachable
                  ? "All reachable"
                  : "Blocked rooms"}
            </strong>
            <p>
              {step.state.unreachableRooms.length > 0
                ? `Infinity remains at ${step.state.unreachableRooms.join(", ")}`
                : "Replay records every distance fill directly from the grid snapshots."}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (
    (step.state.kind === "number-of-islands" || step.state.kind === "max-area-of-island") &&
    isNumberOfIslandsInput(run.input)
  ) {
    const maxAreaState = step.state.kind === "max-area-of-island" ? step.state : null;

    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} island grid</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="graph-legend" aria-label={`${run.algorithm.name} status legend`}>
          <span className="graph-legend-pill graph-legend-pill-current">Active land</span>
          <span className="graph-legend-pill graph-legend-pill-frontier">Frontier</span>
          <span className="graph-legend-pill graph-legend-pill-settled">Claimed land</span>
          <span className="graph-legend-pill graph-legend-pill-path">Scan cursor</span>
        </div>
        <div className="graph-visual-grid">
          <div className="graph-stage island-stage">
            <div className="island-banner">
              <span>
                {maxAreaState
                  ? `Largest area ${maxAreaState.maxArea}`
                  : `${step.state.islandCount} island${step.state.islandCount === 1 ? "" : "s"} found`}
              </span>
              <strong>
                {step.state.activeIslandId !== null
                  ? `Exploring island ${step.state.activeIslandId}`
                  : step.state.scan
                    ? `Scanning ${step.state.scan}`
                    : "Full grid scan complete"}
              </strong>
              <p>
                {step.state.activeEdge.length > 0
                  ? formatActiveEdge(step.state.activeEdge)
                  : step.state.scan ?? "No neighbor under inspection"}
              </p>
            </div>
            <div
              className="island-stage-grid"
              style={{
                gridTemplateColumns: `repeat(${run.input.grid[0]!.length}, minmax(0, 1fr))`
              }}
            >
              {step.state.grid.flatMap((row, rowIndex) =>
                row.map((value, columnIndex) => {
                  const cell = `${rowIndex},${columnIndex}`;
                  const tone = getIslandCellTone(cell, value, step);
                  const className = ["island-cell", `island-cell-${tone}`]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <article className={className} key={cell}>
                      <span className="island-cell-index">
                        {rowIndex},{columnIndex}
                      </span>
                      <strong className="island-cell-value">
                        {value === "1" ? "Land" : "Water"}
                      </strong>
                      <span className="island-cell-status">
                        {formatIslandCellStatus(cell, value, step)}
                      </span>
                    </article>
                  );
                })
              )}
            </div>
          </div>
          <div className="graph-state-rail">
            <article className="mini-card graph-summary-card">
              <span>{maxAreaState ? "Largest island" : "Scan focus"}</span>
              <strong>
                {maxAreaState
                  ? maxAreaState.largestIslandId !== null
                    ? `Island ${maxAreaState.largestIslandId} · area ${maxAreaState.maxArea}`
                    : "No land yet"
                  : step.state.scan ?? step.state.current ?? "Complete"}
              </strong>
              <p>
                {maxAreaState
                  ? maxAreaState.largestIsland.length > 0
                    ? `${maxAreaState.largestIsland.join(" · ")}`
                    : `${step.state.remainingLand.length} land cell${step.state.remainingLand.length === 1 ? "" : "s"} still unresolved`
                  : step.state.activeIslandId !== null
                    ? `Island ${step.state.activeIslandId} currently expanding`
                    : `${step.state.remainingLand.length} land cell${step.state.remainingLand.length === 1 ? "" : "s"} still unresolved`}
              </p>
            </article>
            <div className="graph-node-grid">
              <article className="graph-node-card graph-node-card-frontier">
                <div className="graph-node-card-header">
                  <strong>Frontier</strong>
                  <span className="graph-node-status">{step.state.frontier.length}</span>
                </div>
                <span className="graph-node-distance">Queued land cells</span>
                <span className="graph-node-meta">
                  {step.state.frontier.length > 0
                    ? step.state.frontier.join(" · ")
                    : "No queued cells"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-settled">
                <div className="graph-node-card-header">
                  <strong>Claimed land</strong>
                  <span className="graph-node-status">{step.state.settled.length}</span>
                </div>
                <span className="graph-node-distance">Settled land cells</span>
                <span className="graph-node-meta">
                  {step.state.settled.length > 0
                    ? step.state.settled.slice(-4).join(" · ")
                    : "No settled land yet"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-path">
                <div className="graph-node-card-header">
                  <strong>{maxAreaState ? "Largest area" : "Remaining land"}</strong>
                  <span className="graph-node-status">
                    {maxAreaState ? maxAreaState.maxArea : step.state.remainingLand.length}
                  </span>
                </div>
                <span className="graph-node-distance">
                  {maxAreaState ? "Current winning island" : "Unresolved land cells"}
                </span>
                <span className="graph-node-meta">
                  {maxAreaState
                    ? maxAreaState.largestIsland.length > 0
                      ? maxAreaState.largestIsland.join(" · ")
                      : "No winning island yet"
                    : step.state.remainingLand.length > 0
                      ? step.state.remainingLand.join(" · ")
                      : "Every land cell claimed"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-current">
                <div className="graph-node-card-header">
                  <strong>Completed</strong>
                  <span className="graph-node-status">{step.state.completedIslands.length}</span>
                </div>
                <span className="graph-node-distance">Finished island groups</span>
                <span className="graph-node-meta">
                  {step.state.completedIslands.length > 0
                    ? maxAreaState
                      ? maxAreaState.completedAreas
                          .map((area, index) => `#${index + 1} (${area})`)
                          .join(" · ")
                      : step.state.completedIslands
                          .map((island, index) => `#${index + 1} (${island.length})`)
                          .join(" · ")
                    : "No completed islands yet"}
                </span>
              </article>
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Active island</span>
            <strong>
              {step.state.activeIslandId !== null
                ? `Island ${step.state.activeIslandId}${maxAreaState ? ` · area ${maxAreaState.activeIslandArea}` : ""}`
                : "No active island"}
            </strong>
            <div className="pill-row">
              {step.state.activeIsland.length > 0 ? (
                step.state.activeIsland.map((cell) => (
                  <span className="pill" key={cell}>
                    {cell}
                  </span>
                ))
              ) : (
                <span className="empty-pill">No active island on this frame</span>
              )}
            </div>
          </div>
          <div className="mini-card">
            <span>Island sizes</span>
            <p>
              {step.state.completedIslands.length > 0
                ? (maxAreaState
                    ? maxAreaState.completedAreas
                    : step.state.completedIslands.map((island) => island.length))
                    .map((area, index) => `#${index + 1}: ${area}`)
                    .join(", ")
                : "No completed islands yet"}
            </p>
          </div>
          <div className="mini-card">
            <span>{maxAreaState ? "Outcome" : "Traversal state"}</span>
            <strong>
              {maxAreaState
                ? `Max area ${maxAreaState.maxArea}`
                : step.state.activeIslandId !== null
                  ? `Island ${step.state.activeIslandId}`
                  : `${step.state.islandCount} total`}
            </strong>
            <p>
              {maxAreaState
                ? step.state.remainingLand.length > 0
                  ? `${step.state.remainingLand.length} land cell${step.state.remainingLand.length === 1 ? "" : "s"} still waiting for the scan cursor.`
                  : "Replay records the winning island ledger directly from the grid snapshots."
                : step.state.remainingLand.length > 0
                  ? `${step.state.remainingLand.length} land cell${step.state.remainingLand.length === 1 ? "" : "s"} still waiting for the scan cursor.`
                  : "Replay records the final island ledger directly from the grid snapshots."}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (step.state.kind === "island-perimeter" && isNumberOfIslandsInput(run.input)) {
    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} coastline grid</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="graph-legend" aria-label="Island Perimeter status legend">
          <span className="graph-legend-pill graph-legend-pill-current">Active land</span>
          <span className="graph-legend-pill graph-legend-pill-frontier">Pending land</span>
          <span className="graph-legend-pill graph-legend-pill-settled">Counted land</span>
          <span className="graph-legend-pill graph-legend-pill-path">Scan cursor</span>
        </div>
        <div className="graph-visual-grid">
          <div className="graph-stage island-stage">
            <div className="island-banner">
              <span>Perimeter {step.state.perimeter}</span>
              <strong>
                {step.state.current
                  ? `Accounting ${step.state.current}`
                  : step.state.scan
                    ? `Scanning ${step.state.scan}`
                    : "Full coastline scan complete"}
              </strong>
              <p>
                {step.state.activeEdge.length > 0
                  ? formatActiveEdge(step.state.activeEdge)
                  : step.state.scan ?? "No edge under inspection"}
              </p>
            </div>
            <div
              className="island-stage-grid"
              style={{
                gridTemplateColumns: `repeat(${run.input.grid[0]!.length}, minmax(0, 1fr))`
              }}
            >
              {step.state.grid.flatMap((row, rowIndex) =>
                row.map((value, columnIndex) => {
                  const cell = `${rowIndex},${columnIndex}`;
                  const tone = getIslandPerimeterCellTone(cell, value, step);
                  const className = ["island-cell", `island-cell-${tone}`]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <article className={className} key={cell}>
                      <span className="island-cell-index">
                        {rowIndex},{columnIndex}
                      </span>
                      <strong className="island-cell-value">
                        {value === "1" ? "Land" : "Water"}
                      </strong>
                      <span className="island-cell-status">
                        {formatIslandPerimeterCellStatus(cell, value, step)}
                      </span>
                    </article>
                  );
                })
              )}
            </div>
          </div>
          <div className="graph-state-rail">
            <article className="mini-card graph-summary-card">
              <span>Scan focus</span>
              <strong>{step.state.current ?? step.state.scan ?? "Complete"}</strong>
              <p>
                {step.state.current
                  ? `${step.state.currentContribution} edge${step.state.currentContribution === 1 ? "" : "s"} counted for the active land cell so far`
                  : `${step.state.remainingLand.length} land cell${step.state.remainingLand.length === 1 ? "" : "s"} still pending`}
              </p>
            </article>
            <div className="graph-node-grid">
              <article className="graph-node-card graph-node-card-frontier">
                <div className="graph-node-card-header">
                  <strong>Pending land</strong>
                  <span className="graph-node-status">{step.state.remainingLand.length}</span>
                </div>
                <span className="graph-node-distance">Uncounted land cells</span>
                <span className="graph-node-meta">
                  {step.state.remainingLand.length > 0
                    ? step.state.remainingLand.join(" · ")
                    : "Every land cell processed"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-settled">
                <div className="graph-node-card-header">
                  <strong>Counted land</strong>
                  <span className="graph-node-status">{step.state.settled.length}</span>
                </div>
                <span className="graph-node-distance">Processed land cells</span>
                <span className="graph-node-meta">
                  {step.state.settled.length > 0
                    ? step.state.settled.slice(-4).join(" · ")
                    : "No land processed yet"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-path">
                <div className="graph-node-card-header">
                  <strong>Perimeter</strong>
                  <span className="graph-node-status">{step.state.perimeter}</span>
                </div>
                <span className="graph-node-distance">Exposed coastline length</span>
                <span className="graph-node-meta">
                  {step.state.exposedEdges.length > 0
                    ? step.state.exposedEdges.slice(-3).join(" · ")
                    : "No exposed edges yet"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-current">
                <div className="graph-node-card-header">
                  <strong>Land ledger</strong>
                  <span className="graph-node-status">{step.state.landCells.length}</span>
                </div>
                <span className="graph-node-distance">Tracked land cells</span>
                <span className="graph-node-meta">
                  {step.state.landCells.length > 0
                    ? step.state.landCells.join(" · ")
                    : "No land on this map"}
                </span>
              </article>
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Current contribution</span>
            <strong>{step.state.currentContribution}</strong>
            <p>
              {step.state.current
                ? `${step.state.current} is the active land cell`
                : "No active land cell on this frame"}
            </p>
          </div>
          <div className="mini-card">
            <span>Exposed edges</span>
            <div className="pill-row">
              {step.state.exposedEdges.length > 0 ? (
                step.state.exposedEdges.slice(-6).map((edge) => (
                  <span className="pill" key={edge}>
                    {edge}
                  </span>
                ))
              ) : (
                <span className="empty-pill">No exposed edges recorded yet</span>
              )}
            </div>
          </div>
          <div className="mini-card">
            <span>Outcome</span>
            <strong>Perimeter {step.state.perimeter}</strong>
            <p>
              {step.state.remainingLand.length > 0
                ? `${step.state.remainingLand.length} land cell${step.state.remainingLand.length === 1 ? "" : "s"} still waiting for coastline accounting.`
                : "Replay records the final coastline ledger directly from the grid snapshots."}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (
    step.state.kind === "pacific-atlantic-water-flow" &&
    isPacificAtlanticWaterFlowInput(run.input)
  ) {
    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} ocean grid</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="graph-legend" aria-label="Pacific Atlantic status legend">
          <span className="graph-legend-pill graph-legend-pill-current">Active cell</span>
          <span className="graph-legend-pill graph-legend-pill-frontier">Frontier</span>
          <span className="graph-legend-pill graph-legend-pill-settled">Both oceans</span>
          <span className="graph-legend-pill graph-legend-pill-path">Single-ocean reach</span>
        </div>
        <div className="graph-visual-grid">
          <div className="graph-stage island-stage">
            <div className="island-banner">
              <span>
                {step.state.phaseMode === "pacific"
                  ? `${step.state.pacificSeeds.length} Pacific seed${step.state.pacificSeeds.length === 1 ? "" : "s"}`
                  : step.state.phaseMode === "atlantic"
                    ? `${step.state.atlanticSeeds.length} Atlantic seed${step.state.atlanticSeeds.length === 1 ? "" : "s"}`
                    : `${step.state.dualReachable.length} dual-ocean cell${step.state.dualReachable.length === 1 ? "" : "s"}`}
              </span>
              <strong>
                {step.state.phaseMode === "pacific"
                  ? `Pacific reachability has ${step.state.pacificReachable.length} cell${step.state.pacificReachable.length === 1 ? "" : "s"}`
                  : step.state.phaseMode === "atlantic"
                    ? `Atlantic reachability has ${step.state.atlanticReachable.length} cell${step.state.atlanticReachable.length === 1 ? "" : "s"}`
                    : `${step.state.dualReachable.length} cell${step.state.dualReachable.length === 1 ? "" : "s"} reach both oceans`}
              </strong>
              <p>
                {step.state.activeEdge.length > 0
                  ? formatActiveEdge(step.state.activeEdge)
                  : step.state.current ?? "No neighbor under inspection"}
              </p>
            </div>
            <div
              className="island-stage-grid"
              style={{
                gridTemplateColumns: `repeat(${run.input.grid[0]!.length}, minmax(0, 1fr))`
              }}
            >
              {step.state.grid.flatMap((row, rowIndex) =>
                row.map((value, columnIndex) => {
                  const cell = `${rowIndex},${columnIndex}`;
                  const tone = getPacificAtlanticCellTone(cell, step);
                  const className = ["island-cell", `island-cell-${tone}`]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <article className={className} key={cell}>
                      <span className="island-cell-index">
                        {rowIndex},{columnIndex}
                      </span>
                      <strong className="island-cell-value">{value}</strong>
                      <span className="island-cell-status">
                        {formatPacificAtlanticCellStatus(cell, step)}
                      </span>
                    </article>
                  );
                })
              )}
            </div>
          </div>
          <div className="graph-state-rail">
            <article className="mini-card graph-summary-card">
              <span>Flow focus</span>
              <strong>{step.state.current ?? "Awaiting next source"}</strong>
              <p>
                {step.state.phaseMode === "resolved"
                  ? `${step.state.dualReachable.length} dual-ocean cell${step.state.dualReachable.length === 1 ? "" : "s"} final`
                  : `${step.state.frontier.length} cell${step.state.frontier.length === 1 ? "" : "s"} remain queued`}
              </p>
            </article>
            <div className="graph-node-grid">
              <article className="graph-node-card graph-node-card-frontier">
                <div className="graph-node-card-header">
                  <strong>Frontier</strong>
                  <span className="graph-node-status">{step.state.frontier.length}</span>
                </div>
                <span className="graph-node-distance">
                  {step.state.phaseMode === "atlantic" ? "Atlantic queue" : "Pacific queue"}
                </span>
                <span className="graph-node-meta">
                  {step.state.frontier.length > 0
                    ? step.state.frontier.join(" · ")
                    : "No queued cells"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-path">
                <div className="graph-node-card-header">
                  <strong>Pacific</strong>
                  <span className="graph-node-status">{step.state.pacificReachable.length}</span>
                </div>
                <span className="graph-node-distance">Top and left reachability</span>
                <span className="graph-node-meta">
                  {step.state.pacificReachable.length > 0
                    ? step.state.pacificReachable.join(" · ")
                    : "No Pacific cells recorded"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-settled">
                <div className="graph-node-card-header">
                  <strong>Atlantic</strong>
                  <span className="graph-node-status">{step.state.atlanticReachable.length}</span>
                </div>
                <span className="graph-node-distance">Bottom and right reachability</span>
                <span className="graph-node-meta">
                  {step.state.atlanticReachable.length > 0
                    ? step.state.atlanticReachable.join(" · ")
                    : "No Atlantic cells recorded"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-current">
                <div className="graph-node-card-header">
                  <strong>Both oceans</strong>
                  <span className="graph-node-status">{step.state.dualReachable.length}</span>
                </div>
                <span className="graph-node-distance">{step.state.phaseMode}</span>
                <span className="graph-node-meta">
                  {step.state.dualReachable.length > 0
                    ? step.state.dualReachable.join(" · ")
                    : "No dual-ocean cells yet"}
                </span>
              </article>
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Pacific seeds</span>
            <div className="pill-row">
              {step.state.pacificSeeds.length > 0 ? (
                step.state.pacificSeeds.map((cell) => (
                  <span className="pill" key={cell}>
                    {cell}
                  </span>
                ))
              ) : (
                <span className="empty-pill">No Pacific seeds</span>
              )}
            </div>
          </div>
          <div className="mini-card">
            <span>Atlantic seeds</span>
            <div className="pill-row">
              {step.state.atlanticSeeds.length > 0 ? (
                step.state.atlanticSeeds.map((cell) => (
                  <span className="pill" key={cell}>
                    {cell}
                  </span>
                ))
              ) : (
                <span className="empty-pill">No Atlantic seeds</span>
              )}
            </div>
          </div>
          <div className="mini-card">
            <span>Dual-ocean cells</span>
            <strong>{step.state.dualReachable.length}</strong>
            <p>
              {step.state.dualReachable.length > 0
                ? step.state.dualReachable.join(", ")
                : "Replay has not published a shared-ocean cell yet."}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (step.state.kind === "shortest-bridge" && isShortestBridgeInput(run.input)) {
    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} bridge grid</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="graph-legend" aria-label="Shortest Bridge status legend">
          <span className="graph-legend-pill graph-legend-pill-current">Active cell</span>
          <span className="graph-legend-pill graph-legend-pill-frontier">Frontier</span>
          <span className="graph-legend-pill graph-legend-pill-settled">Claimed or reached land</span>
          <span className="graph-legend-pill graph-legend-pill-path">Bridge water</span>
        </div>
        <div className="graph-visual-grid">
          <div className="graph-stage island-stage">
            <div className="island-banner">
              <span>
                {step.state.firstIsland.length} first-island cell
                {step.state.firstIsland.length === 1 ? "" : "s"}
              </span>
              <strong>
                {step.state.bridgeLength !== null
                  ? `Shortest bridge uses ${step.state.bridgeLength} flip${step.state.bridgeLength === 1 ? "" : "s"}`
                  : step.state.phaseMode === "locate-island"
                    ? "Scanning for the first island"
                    : step.state.phaseMode === "mark-island"
                      ? `Marking island ${step.state.firstIsland.length > 0 ? "one" : ""}`.trim()
                      : `${step.state.frontier.length} bridge source${step.state.frontier.length === 1 ? "" : "s"} remain queued`}
              </strong>
              <p>
                {step.state.activeEdge.length > 0
                  ? formatActiveEdge(step.state.activeEdge)
                  : step.state.current ?? step.state.scan ?? "No neighbor under inspection"}
              </p>
            </div>
            <div
              className="island-stage-grid"
              style={{
                gridTemplateColumns: `repeat(${run.input.grid[0]!.length}, minmax(0, 1fr))`
              }}
            >
              {step.state.grid.flatMap((row, rowIndex) =>
                row.map((value, columnIndex) => {
                  const cell = `${rowIndex},${columnIndex}`;
                  const tone = getShortestBridgeCellTone(cell, value, step);
                  const className = ["island-cell", `island-cell-${tone}`]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <article className={className} key={cell}>
                      <span className="island-cell-index">
                        {rowIndex},{columnIndex}
                      </span>
                      <strong className="island-cell-value">{value === 1 ? "Land" : "Water"}</strong>
                      <span className="island-cell-status">
                        {formatShortestBridgeCellStatus(cell, value, step)}
                      </span>
                    </article>
                  );
                })
              )}
            </div>
          </div>
          <div className="graph-state-rail">
            <article className="mini-card graph-summary-card">
              <span>Bridge focus</span>
              <strong>{step.state.current ?? step.state.scan ?? "Resolved"}</strong>
              <p>
                {step.state.phaseMode === "expand-bridge"
                  ? `Wave ${step.state.wave}`
                  : step.state.phaseMode === "mark-island"
                    ? "Marking first island"
                    : step.state.phaseMode === "locate-island"
                      ? "Row-major discovery"
                      : "Bridge resolved"}
              </p>
            </article>
            <div className="graph-node-grid">
              <article className="graph-node-card graph-node-card-frontier">
                <div className="graph-node-card-header">
                  <strong>Frontier</strong>
                  <span className="graph-node-status">{step.state.frontier.length}</span>
                </div>
                <span className="graph-node-distance">
                  {step.state.phaseMode === "mark-island" ? "Island queue" : "Bridge queue"}
                </span>
                <span className="graph-node-meta">
                  {step.state.frontier.length > 0
                    ? step.state.frontier.join(" · ")
                    : "No queued cells"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-settled">
                <div className="graph-node-card-header">
                  <strong>First island</strong>
                  <span className="graph-node-status">{step.state.firstIsland.length}</span>
                </div>
                <span className="graph-node-distance">Claimed land cells</span>
                <span className="graph-node-meta">
                  {step.state.firstIsland.length > 0
                    ? step.state.firstIsland.join(" · ")
                    : "No island cells claimed yet"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-path">
                <div className="graph-node-card-header">
                  <strong>Bridge water</strong>
                  <span className="graph-node-status">{step.state.expandedWater.length}</span>
                </div>
                <span className="graph-node-distance">Queued or claimed flips</span>
                <span className="graph-node-meta">
                  {step.state.expandedWater.length > 0
                    ? step.state.expandedWater.join(" · ")
                    : "No bridge water yet"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-current">
                <div className="graph-node-card-header">
                  <strong>Outcome</strong>
                  <span className="graph-node-status">
                    {step.state.bridgeLength !== null
                      ? "Resolved"
                      : step.state.phaseMode === "expand-bridge"
                        ? `Wave ${step.state.wave}`
                        : step.state.phaseMode}
                  </span>
                </div>
                <span className="graph-node-distance">
                  {step.state.bridgeLength !== null
                    ? `Bridge length ${step.state.bridgeLength}`
                    : "Awaiting second-island contact"}
                </span>
                <span className="graph-node-meta">
                  {step.state.reachedSecondIsland.length > 0
                    ? `Reached ${step.state.reachedSecondIsland.join(" · ")}`
                    : "No second-island contact yet"}
                </span>
              </article>
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Processed cells</span>
            <strong>{step.state.settled.length}</strong>
            <p>
              {step.state.settled.length > 0
                ? step.state.settled.join(", ")
                : "No processed cells yet"}
            </p>
          </div>
          <div className="mini-card">
            <span>Scan and waves</span>
            <strong>
              {step.state.scan ?? (step.state.phaseMode === "expand-bridge" ? `Wave ${step.state.wave}` : step.state.phaseMode)}
            </strong>
            <p>
              {step.state.phaseMode === "locate-island"
                ? "The row-major cursor is still locating island one."
                : step.state.phaseMode === "mark-island"
                  ? "Replay is still expanding the first island boundary."
                  : step.state.phaseMode === "expand-bridge"
                    ? "Bridge BFS is expanding outward from every first-island cell."
                    : "The minimum bridge length is locked in the final frame."}
            </p>
          </div>
          <div className="mini-card">
            <span>Second island</span>
            <strong>
              {step.state.reachedSecondIsland.length > 0
                ? step.state.reachedSecondIsland.join(" · ")
                : "Pending"}
            </strong>
            <p>
              {step.state.bridgeLength !== null
                ? `Replay stores the first second-island contact and the minimum ${step.state.bridgeLength}-flip bridge directly.`
                : "The bridge BFS has not touched the second island yet."}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (
    step.state.kind === "shortest-path-binary-matrix" &&
    isShortestPathBinaryMatrixInput(run.input)
  ) {
    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} route grid</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="graph-legend" aria-label="Shortest Path in Binary Matrix status legend">
          <span className="graph-legend-pill graph-legend-pill-current">Active cell</span>
          <span className="graph-legend-pill graph-legend-pill-frontier">Frontier</span>
          <span className="graph-legend-pill graph-legend-pill-settled">Shortest path</span>
          <span className="graph-legend-pill graph-legend-pill-path">Discovered open cell</span>
        </div>
        <div className="graph-visual-grid">
          <div className="graph-stage island-stage">
            <div className="island-banner">
              <span>
                {step.state.blockedCells.length} blocked cell
                {step.state.blockedCells.length === 1 ? "" : "s"}
              </span>
              <strong>
                {step.state.reachable === true
                  ? `Shortest path length ${step.state.pathLength ?? 0}`
                  : step.state.reachable === false
                    ? "Destination remains unreachable"
                    : `${step.state.frontier.length} open cell${step.state.frontier.length === 1 ? "" : "s"} remain queued`}
              </strong>
              <p>
                {step.state.activeEdge.length > 0
                  ? formatActiveEdge(step.state.activeEdge)
                  : step.state.current ?? "No neighbor under inspection"}
              </p>
            </div>
            <div
              className="island-stage-grid"
              style={{
                gridTemplateColumns: `repeat(${run.input.grid[0]!.length}, minmax(0, 1fr))`
              }}
            >
              {step.state.grid.flatMap((row, rowIndex) =>
                row.map((value, columnIndex) => {
                  const cell = `${rowIndex},${columnIndex}`;
                  const tone = getShortestPathBinaryMatrixCellTone(cell, step);
                  const className = ["island-cell", `island-cell-${tone}`]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <article className={className} key={cell}>
                      <span className="island-cell-index">
                        {rowIndex},{columnIndex}
                      </span>
                      <strong className="island-cell-value">
                        {value === 1 ? "Blocked" : "Open"}
                      </strong>
                      <span className="island-cell-status">
                        {formatShortestPathBinaryMatrixCellStatus(cell, step)}
                      </span>
                    </article>
                  );
                })
              )}
            </div>
          </div>
          <div className="graph-state-rail">
            <article className="mini-card graph-summary-card">
              <span>Route focus</span>
              <strong>{step.state.current ?? "Awaiting next search cell"}</strong>
              <p>
                {step.state.phaseMode === "traceback"
                  ? `${step.state.path.length} path cell${step.state.path.length === 1 ? "" : "s"} published`
                  : `${step.state.visitedOpen.length} open cell${step.state.visitedOpen.length === 1 ? "" : "s"} discovered`}
              </p>
            </article>
            <div className="graph-node-grid">
              <article className="graph-node-card graph-node-card-frontier">
                <div className="graph-node-card-header">
                  <strong>Frontier</strong>
                  <span className="graph-node-status">{step.state.frontier.length}</span>
                </div>
                <span className="graph-node-distance">Queued search cells</span>
                <span className="graph-node-meta">
                  {step.state.frontier.length > 0
                    ? step.state.frontier.join(" · ")
                    : "No queued cells"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-path">
                <div className="graph-node-card-header">
                  <strong>Visited open</strong>
                  <span className="graph-node-status">{step.state.visitedOpen.length}</span>
                </div>
                <span className="graph-node-distance">Reachable open cells</span>
                <span className="graph-node-meta">
                  {step.state.visitedOpen.length > 0
                    ? step.state.visitedOpen.join(" · ")
                    : "No open cells discovered"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-settled">
                <div className="graph-node-card-header">
                  <strong>Shortest path</strong>
                  <span className="graph-node-status">{step.state.path.length}</span>
                </div>
                <span className="graph-node-distance">
                  {step.state.pathLength !== null
                    ? `${step.state.pathLength} path cell${step.state.pathLength === 1 ? "" : "s"}`
                    : "No path yet"}
                </span>
                <span className="graph-node-meta">
                  {step.state.path.length > 0 ? step.state.path.join(" · ") : "No traced route"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-current">
                <div className="graph-node-card-header">
                  <strong>Outcome</strong>
                  <span className="graph-node-status">
                    {step.state.reachable === null
                      ? step.state.phaseMode === "traceback"
                        ? "Traceback"
                        : "Searching"
                      : step.state.reachable
                        ? "Resolved"
                        : "No path"}
                  </span>
                </div>
                <span className="graph-node-distance">{step.state.phaseMode}</span>
                <span className="graph-node-meta">
                  {step.state.reachable === true
                    ? `Path length ${step.state.pathLength ?? 0}`
                    : `${step.state.blockedCells.length} blocked cell${step.state.blockedCells.length === 1 ? "" : "s"} recorded`}
                </span>
              </article>
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Blocked cells</span>
            <div className="pill-row">
              {step.state.blockedCells.length > 0 ? (
                step.state.blockedCells.map((cell) => (
                  <span className="pill" key={cell}>
                    {cell}
                  </span>
                ))
              ) : (
                <span className="empty-pill">No blocked cells</span>
              )}
            </div>
          </div>
          <div className="mini-card">
            <span>Settled search cells</span>
            <strong>{step.state.settled.length}</strong>
            <p>
              {step.state.settled.length > 0
                ? step.state.settled.join(", ")
                : "No fully processed cells yet"}
            </p>
          </div>
          <div className="mini-card">
            <span>Resolution</span>
            <strong>
              {step.state.reachable === null
                ? step.state.phaseMode
                : step.state.reachable
                  ? `${step.state.pathLength ?? 0} cells`
                  : "Unreachable"}
            </strong>
            <p>
              {step.state.reachable
                ? `Replay stores the exact route from ${step.state.path[0]} to ${step.state.path[step.state.path.length - 1]}.`
                : "Replay stores the visited-open ledger directly when the frontier exhausts."}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (step.state.kind === "surrounded-regions" && isSurroundedRegionsInput(run.input)) {
    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} capture grid</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="graph-legend" aria-label="Surrounded Regions status legend">
          <span className="graph-legend-pill graph-legend-pill-current">Active cell</span>
          <span className="graph-legend-pill graph-legend-pill-frontier">Frontier</span>
          <span className="graph-legend-pill graph-legend-pill-settled">Captured cell</span>
          <span className="graph-legend-pill graph-legend-pill-path">Protected border region</span>
        </div>
        <div className="graph-visual-grid">
          <div className="graph-stage island-stage">
            <div className="island-banner">
              <span>
                {step.state.phaseMode === "mark-safe"
                  ? `${step.state.boundarySeeds.length} border seed${step.state.boundarySeeds.length === 1 ? "" : "s"}`
                  : `${step.state.capturedCells.length} captured cell${step.state.capturedCells.length === 1 ? "" : "s"}`}
              </span>
              <strong>
                {step.state.phaseMode === "mark-safe"
                  ? `Protecting ${step.state.safeCells.length} border-connected O cell${step.state.safeCells.length === 1 ? "" : "s"}`
                  : step.state.phaseMode === "capture"
                    ? `${step.state.remainingOpen.length} enclosed O cell${step.state.remainingOpen.length === 1 ? "" : "s"} still pending capture`
                    : step.state.capturedAny
                      ? `Captured ${step.state.capturedCells.length} enclosed region cell${step.state.capturedCells.length === 1 ? "" : "s"}`
                      : "Every O stayed connected to the border"}
              </strong>
              <p>
                {step.state.activeEdge.length > 0
                  ? formatActiveEdge(step.state.activeEdge)
                  : step.state.current ?? "No neighbor under inspection"}
              </p>
            </div>
            <div
              className="island-stage-grid"
              style={{
                gridTemplateColumns: `repeat(${run.input.grid[0]!.length}, minmax(0, 1fr))`
              }}
            >
              {step.state.grid.flatMap((row, rowIndex) =>
                row.map((value, columnIndex) => {
                  const cell = `${rowIndex},${columnIndex}`;
                  const tone = getSurroundedRegionCellTone(cell, value, step);
                  const className = ["island-cell", `island-cell-${tone}`]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <article className={className} key={cell}>
                      <span className="island-cell-index">
                        {rowIndex},{columnIndex}
                      </span>
                      <strong className="island-cell-value">{value}</strong>
                      <span className="island-cell-status">
                        {formatSurroundedRegionCellStatus(cell, value, step)}
                      </span>
                    </article>
                  );
                })
              )}
            </div>
          </div>
          <div className="graph-state-rail">
            <article className="mini-card graph-summary-card">
              <span>Capture focus</span>
              <strong>{step.state.current ?? "Pending phase shift"}</strong>
              <p>
                {step.state.phaseMode === "mark-safe"
                  ? `${step.state.frontier.length} safe cell${step.state.frontier.length === 1 ? "" : "s"} remain queued`
                  : `${step.state.remainingOpen.length} enclosed O cell${step.state.remainingOpen.length === 1 ? "" : "s"} unresolved`}
              </p>
            </article>
            <div className="graph-node-grid">
              <article className="graph-node-card graph-node-card-frontier">
                <div className="graph-node-card-header">
                  <strong>Frontier</strong>
                  <span className="graph-node-status">{step.state.frontier.length}</span>
                </div>
                <span className="graph-node-distance">
                  {step.state.phaseMode === "capture" ? "Capture queue" : "Safe-region queue"}
                </span>
                <span className="graph-node-meta">
                  {step.state.frontier.length > 0
                    ? step.state.frontier.join(" · ")
                    : "No queued cells"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-path">
                <div className="graph-node-card-header">
                  <strong>Safe cells</strong>
                  <span className="graph-node-status">{step.state.safeCells.length}</span>
                </div>
                <span className="graph-node-distance">Border-connected O cells</span>
                <span className="graph-node-meta">
                  {step.state.safeCells.length > 0
                    ? step.state.safeCells.join(" · ")
                    : "No safe cells recorded"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-settled">
                <div className="graph-node-card-header">
                  <strong>Captured</strong>
                  <span className="graph-node-status">{step.state.capturedCells.length}</span>
                </div>
                <span className="graph-node-distance">Flipped enclosed cells</span>
                <span className="graph-node-meta">
                  {step.state.capturedCells.length > 0
                    ? step.state.capturedCells.join(" · ")
                    : "No enclosed cells captured"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-current">
                <div className="graph-node-card-header">
                  <strong>Outcome</strong>
                  <span className="graph-node-status">
                    {step.state.capturedAny === null
                      ? step.state.phaseMode === "capture"
                        ? "Capturing"
                        : "Scanning"
                      : step.state.capturedAny
                        ? "Captured"
                        : "No capture"}
                  </span>
                </div>
                <span className="graph-node-distance">{step.state.phaseMode}</span>
                <span className="graph-node-meta">
                  {step.state.remainingOpen.length > 0
                    ? `Pending: ${step.state.remainingOpen.join(" · ")}`
                    : "No enclosed O cells remain unresolved"}
                </span>
              </article>
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Boundary seeds</span>
            <div className="pill-row">
              {step.state.boundarySeeds.length > 0 ? (
                step.state.boundarySeeds.map((cell) => (
                  <span className="pill" key={cell}>
                    {cell}
                  </span>
                ))
              ) : (
                <span className="empty-pill">No boundary O cells</span>
              )}
            </div>
          </div>
          <div className="mini-card">
            <span>Remaining open</span>
            <strong>{step.state.remainingOpen.length}</strong>
            <p>
              {step.state.remainingOpen.length > 0
                ? step.state.remainingOpen.join(", ")
                : "Every O is either safe or already captured"}
            </p>
          </div>
          <div className="mini-card">
            <span>Resolution</span>
            <strong>
              {step.state.capturedAny === null
                ? step.state.phaseMode
                : step.state.capturedAny
                  ? `${step.state.capturedCells.length} captured`
                  : "No captures"}
            </strong>
            <p>
              {step.state.capturedAny
                ? `Protected cells remain at ${step.state.safeCells.join(", ")}`
                : "Replay stores the safe-region ledger directly without recomputing border reachability."}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (step.state.kind === "rotting-oranges" && isRottingOrangesInput(run.input)) {
    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} orchard</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="graph-legend" aria-label="Rotting Oranges status legend">
          <span className="graph-legend-pill graph-legend-pill-current">Active source</span>
          <span className="graph-legend-pill graph-legend-pill-frontier">Frontier</span>
          <span className="graph-legend-pill graph-legend-pill-settled">Processed rotten</span>
          <span className="graph-legend-pill graph-legend-pill-path">
            {step.state.rottable === false ? "Stalled fresh" : "Newly rotten"}
          </span>
        </div>
        <div className="graph-visual-grid">
          <div className="graph-stage orange-stage">
            <div className="orange-banner">
              <span>Minute {step.state.minute}</span>
              <strong>
                {step.state.rottable === false
                  ? "Fresh oranges remain unreachable"
                  : step.state.minutesToRotAll !== null
                    ? `All oranges rot in ${step.state.minutesToRotAll} minute${step.state.minutesToRotAll === 1 ? "" : "s"}`
                    : `${step.state.fresh.length} fresh orange${step.state.fresh.length === 1 ? "" : "s"} remain`}
              </strong>
              <p>{formatActiveEdge(step.state.activeEdge)}</p>
            </div>
            <div
              className="orange-stage-grid"
              style={{
                gridTemplateColumns: `repeat(${run.input.grid[0]!.length}, minmax(0, 1fr))`
              }}
            >
              {step.state.grid.flatMap((row, rowIndex) =>
                row.map((value, columnIndex) => {
                  const cell = `${rowIndex},${columnIndex}`;
                  const tone = getOrangeCellTone(cell, value, step);
                  const className = ["orange-cell", `orange-cell-${tone}`]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <article className={className} key={cell}>
                      <span className="orange-cell-index">
                        {rowIndex},{columnIndex}
                      </span>
                      <strong className="orange-cell-value">
                        {value === 0 ? "Empty" : value === 1 ? "Fresh" : "Rotten"}
                      </strong>
                      <span className="orange-cell-status">
                        {formatOrangeCellStatus(cell, value, step)}
                      </span>
                    </article>
                  );
                })
              )}
            </div>
          </div>
          <div className="graph-state-rail">
            <article className="mini-card graph-summary-card">
              <span>Spread focus</span>
              <strong>{step.state.current ?? "Awaiting next source"}</strong>
              <p>
                {step.state.current
                  ? `Minute ${step.state.minute} source ${step.state.current}`
                  : `${step.state.frontier.length} cells remain queued`}
              </p>
            </article>
            <div className="graph-node-grid">
              <article className="graph-node-card graph-node-card-frontier">
                <div className="graph-node-card-header">
                  <strong>Frontier</strong>
                  <span className="graph-node-status">{step.state.frontier.length}</span>
                </div>
                <span className="graph-node-distance">Queued rotten cells</span>
                <span className="graph-node-meta">
                  {step.state.frontier.length > 0
                    ? step.state.frontier.join(" · ")
                    : "No queued cells"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-settled">
                <div className="graph-node-card-header">
                  <strong>Processed</strong>
                  <span className="graph-node-status">{step.state.settled.length}</span>
                </div>
                <span className="graph-node-distance">Settled rotten cells</span>
                <span className="graph-node-meta">
                  {step.state.settled.length > 0
                    ? step.state.settled.slice(-4).join(" · ")
                    : "No processed cells yet"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-path">
                <div className="graph-node-card-header">
                  <strong>Fresh</strong>
                  <span className="graph-node-status">{step.state.fresh.length}</span>
                </div>
                <span className="graph-node-distance">Fresh cells remaining</span>
                <span className="graph-node-meta">
                  {step.state.fresh.length > 0 ? step.state.fresh.join(" · ") : "All rotten"}
                </span>
              </article>
              <article className="graph-node-card graph-node-card-current">
                <div className="graph-node-card-header">
                  <strong>Outcome</strong>
                  <span className="graph-node-status">
                    {step.state.rottable === null
                      ? "Spreading"
                      : step.state.rottable
                        ? "Resolved"
                        : "Stalled"}
                  </span>
                </div>
                <span className="graph-node-distance">
                  {step.state.minutesToRotAll !== null
                    ? `${step.state.minutesToRotAll} minute${step.state.minutesToRotAll === 1 ? "" : "s"}`
                    : "No terminal minute yet"}
                </span>
                <span className="graph-node-meta">
                  {step.state.stalledFresh.length > 0
                    ? `Blocked: ${step.state.stalledFresh.join(" · ")}`
                    : "No blocked fresh cells"}
                </span>
              </article>
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Newly rotten</span>
            <div className="pill-row">
              {step.state.newlyRotted.length > 0 ? (
                step.state.newlyRotted.map((cell) => (
                  <span className="pill" key={cell}>
                    {cell}
                  </span>
                ))
              ) : (
                <span className="empty-pill">No new cells this frame</span>
              )}
            </div>
          </div>
          <div className="mini-card">
            <span>Fresh remaining</span>
            <strong>{step.state.fresh.length}</strong>
            <p>
              {step.state.fresh.length > 0
                ? step.state.fresh.join(", ")
                : "No fresh oranges remain"}
            </p>
          </div>
          <div className="mini-card">
            <span>Minute outcome</span>
            <strong>
              {step.state.rottable === false
                ? "Stalled"
                : step.state.minutesToRotAll !== null
                  ? `${step.state.minutesToRotAll} minutes`
                  : `Minute ${step.state.minute}`}
            </strong>
            <p>
              {step.state.stalledFresh.length > 0
                ? `Blocked fresh cells: ${step.state.stalledFresh.join(", ")}`
                : "Replay records each infection wave directly from the grid snapshot."}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (step.state.kind === "clone-graph" && isPathfindingGraphInput(run.input)) {
    const nodes = run.input.nodes;
    const layout = buildGraphLayout(nodes);
    const clonedEdges = new Set(step.state.clonedEdges);
    const activeLabel =
      step.state.activeEdge.length === 2
        ? createCloneGraphEdgeLabel(
            step.state.activeEdge[0]!,
            step.state.activeEdge[1]!,
            run.input.directed
          )
        : null;

    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} clone ledger</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="graph-legend" aria-label="Clone Graph status legend">
          <span className="graph-legend-pill graph-legend-pill-current">Active inspection</span>
          <span className="graph-legend-pill graph-legend-pill-frontier">Queued originals</span>
          <span className="graph-legend-pill graph-legend-pill-settled">Copied originals</span>
          <span className="graph-legend-pill graph-legend-pill-path">Allocated clones</span>
        </div>
        <div className="graph-visual-grid">
          <div className="graph-stage">
            <svg viewBox="0 0 360 300" role="img" aria-label="Clone Graph replay">
              {run.input.edges.map(([from, to, weight], index) => {
                const edgeLabel = createCloneGraphEdgeLabel(from, to, run.input.directed);
                const start = layout[from]!;
                const end = layout[to]!;
                const classNames = [
                  "graph-edge",
                  activeLabel === edgeLabel ? "graph-edge-active" : "",
                  clonedEdges.has(edgeLabel) ? "graph-edge-path" : ""
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <g key={`${edgeLabel}-${index}`}>
                    <line
                      className={classNames}
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                    />
                    <text
                      className="graph-weight"
                      x={(start.x + end.x) / 2}
                      y={(start.y + end.y) / 2 - 8}
                    >
                      {clonedEdges.has(edgeLabel) ? "c" : weight}
                    </text>
                  </g>
                );
              })}

              {nodes.map((node) => {
                const { x, y } = layout[node]!;
                const tone = getCloneNodeTone(node, step);
                const classNames = [
                  "graph-node",
                  tone === "current" ? "graph-node-current" : "",
                  tone === "settled" ? "graph-node-settled" : "",
                  tone === "frontier" ? "graph-node-frontier" : "",
                  tone === "path" ? "graph-node-path" : ""
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <g className={classNames} key={node}>
                    <circle cx={x} cy={y} r="26" />
                    <text className="graph-label" x={x} y={y - 2}>
                      {node}
                    </text>
                    <text className="graph-distance" x={x} y={y + 16}>
                      {step.state.cloneMap[node] ?? "--"}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="graph-state-rail">
            <article className="mini-card graph-summary-card">
              <span>Clone focus</span>
              <strong>{step.state.currentClone ?? "Clone ledger"}</strong>
              <p>
                {step.state.current
                  ? `Original ${step.state.current}`
                  : step.state.fullyCloned
                    ? "Every node reached the clone map"
                    : `${step.state.unreachableNodes.length} nodes stayed outside the entry component`}
              </p>
            </article>
            <div className="graph-node-grid">
              {nodes.map((node) => {
                const tone = getCloneNodeTone(node, step);

                return (
                  <article className={`graph-node-card graph-node-card-${tone}`} key={`clone-${node}`}>
                    <div className="graph-node-card-header">
                      <strong>{node}</strong>
                      <span className="graph-node-status">{formatCloneNodeStatus(node, step)}</span>
                    </div>
                    <span className="graph-node-distance">
                      {step.state.cloneMap[node] ? `Clone ${step.state.cloneMap[node]}` : "No clone yet"}
                    </span>
                    <span className="graph-node-meta">{formatCloneNodeMeta(node, step)}</span>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Queued originals</span>
            <div className="pill-row">
              {step.state.frontier.length > 0 ? (
                step.state.frontier.map((node) => (
                  <span className="pill" key={node}>
                    {node}
                  </span>
                ))
              ) : (
                <span className="empty-pill">Queue empty</span>
              )}
            </div>
          </div>
          <div className="mini-card">
            <span>Clone map</span>
            <strong>{step.state.clonedNodes.length}</strong>
            <p>
              {step.state.clonedNodes.length > 0
                ? step.state.clonedNodes
                    .map((node) => `${node} -> ${step.state.cloneMap[node]}`)
                    .join(", ")
                : "No clones allocated yet"}
            </p>
          </div>
          <div className="mini-card">
            <span>Clone links</span>
            <strong>{step.state.clonedEdges.length}</strong>
            <p>
              {step.state.clonedEdges.length > 0
                ? step.state.clonedEdges.join(", ")
                : "No clone links committed"}
            </p>
          </div>
          <div className="mini-card">
            <span>Coverage</span>
            <strong>{step.state.fullyCloned ? "Full" : "Partial"}</strong>
            <p>
              {step.state.unreachableNodes.length > 0
                ? `Outside component: ${step.state.unreachableNodes.join(", ")}`
                : "Every node reached from the entry clone"}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (
    (
      step.state.kind === "graph-valid-tree" ||
      step.state.kind === "count-connected-components" ||
      step.state.kind === "redundant-connection"
    ) &&
    isGraphValidTreeInput(run.input)
  ) {
    const nodes = Array.from({ length: run.input.nodeCount }, (_, index) => `${index}`);
    const layout = buildGraphLayout(nodes);
    const currentLabel = step.state.current;
    const acceptedSet = new Set(step.state.acceptedEdges);
    const rejectedSet = new Set(step.state.rejectedEdges);

    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} union-find graph</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="graph-legend" aria-label="Graph valid tree status legend">
          <span className="graph-legend-pill graph-legend-pill-current">Active edge</span>
          <span className="graph-legend-pill graph-legend-pill-frontier">Current roots</span>
          <span className="graph-legend-pill graph-legend-pill-settled">Representatives</span>
          <span className="graph-legend-pill graph-legend-pill-path">Accepted forest</span>
        </div>
        <div className="graph-visual-grid">
          <div className="graph-stage">
            <svg viewBox="0 0 360 300" role="img" aria-label="Graph valid tree replay">
              {run.input.edges.map(([from, to], index) => {
                const edgeLabel = `#${index + 1} ${from}-${to}`;
                const start = layout[`${from}`]!;
                const end = layout[`${to}`]!;
                const classNames = [
                  "graph-edge",
                  currentLabel === edgeLabel ? "graph-edge-active" : "",
                  acceptedSet.has(edgeLabel) ? "graph-edge-path" : ""
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <g key={edgeLabel}>
                    <line
                      className={classNames}
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                    />
                    <text
                      className="graph-weight"
                      x={(start.x + end.x) / 2}
                      y={(start.y + end.y) / 2 - 8}
                    >
                      {rejectedSet.has(edgeLabel) ? "x" : index + 1}
                    </text>
                  </g>
                );
              })}

              {nodes.map((node) => {
                const { x, y } = layout[node]!;
                const tone = getTreeNodeTone(node, step);
                const classNames = [
                  "graph-node",
                  tone === "current" ? "graph-node-current" : "",
                  tone === "settled" ? "graph-node-settled" : "",
                  tone === "frontier" ? "graph-node-frontier" : "",
                  tone === "path" ? "graph-node-path" : ""
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <g className={classNames} key={node}>
                    <circle cx={x} cy={y} r="26" />
                    <text className="graph-label" x={x} y={y - 2}>
                      {node}
                    </text>
                    <text className="graph-distance" x={x} y={y + 16}>
                      p {step.state.parents[node]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        <div className="graph-state-rail">
          <article className="mini-card graph-summary-card">
            <span>
              {step.state.kind === "graph-valid-tree"
                ? "Validation focus"
                : step.state.kind === "count-connected-components"
                  ? "Component focus"
                  : "Cycle focus"}
            </span>
            <strong>{step.state.current ?? "Final ledger"}</strong>
            <p>
                {step.state.currentRoots.length === 2
                  ? `Roots ${step.state.currentRoots.join(" · ")}`
                  : `${step.state.componentCount} component${step.state.componentCount === 1 ? "" : "s"} remain`}
              </p>
            </article>
            <div className="graph-node-grid">
              {nodes.map((node) => {
                const tone = getTreeNodeTone(node, step);

                return (
                  <article className={`graph-node-card graph-node-card-${tone}`} key={`tree-${node}`}>
                    <div className="graph-node-card-header">
                      <strong>{node}</strong>
                      <span className="graph-node-status">{formatTreeNodeStatus(node, step)}</span>
                    </div>
                    <span className="graph-node-distance">
                      Parent {step.state.parents[node]} · Rank {step.state.ranks[node]}
                    </span>
                    <span className="graph-node-meta">{formatTreeNodeMeta(node, step)}</span>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Pending edges</span>
            <div className="pill-row">
              {step.state.frontier.length > 0 ? (
                step.state.frontier.map((edgeLabel) => (
                  <span className="pill" key={edgeLabel}>
                    {edgeLabel}
                  </span>
                ))
              ) : (
                <span className="empty-pill">Edge queue empty</span>
              )}
            </div>
          </div>
          <div className="mini-card">
            <span>Accepted forest</span>
            <strong>{step.state.acceptedEdges.length}</strong>
            <p>
              {step.state.acceptedEdges.length > 0
                ? step.state.acceptedEdges.join(", ")
                : "No accepted edges yet"}
            </p>
          </div>
          <div className="mini-card">
            <span>Rejected edges</span>
            <strong>{step.state.rejectedEdges.length}</strong>
            <p>
              {step.state.rejectedEdges.length > 0
                ? step.state.rejectedEdges.join(", ")
                : "No rejected edges"}
            </p>
          </div>
          <div className="mini-card">
            <span>Outcome</span>
            <strong>
              {step.state.kind === "graph-valid-tree"
                ? step.state.isTree === null
                  ? "Validating"
                  : step.state.isTree
                    ? "Valid tree"
                    : "Invalid"
                : step.state.kind === "count-connected-components"
                  ? step.state.current === null
                    ? "Resolved"
                    : "Counting"
                : step.state.hasRedundantConnection === null
                  ? "Scanning"
                  : step.state.hasRedundantConnection
                    ? "Redundant edge found"
                    : "Acyclic"}
            </strong>
            <p>
              {step.state.kind === "graph-valid-tree"
                ? step.state.failureReason ??
                  step.state.components.map((group) => group.join(" · ")).join(" | ")
                : step.state.kind === "count-connected-components"
                  ? `${step.state.componentCount} component${step.state.componentCount === 1 ? "" : "s"} · ${step.state.components.map((group) => group.join(" · ")).join(" | ")}`
                : step.state.redundantEdge ?? step.state.components.map((group) => group.join(" · ")).join(" | ")}
            </p>
          </div>
          {step.state.kind === "redundant-connection" ? (
            <div className="mini-card">
              <span>Redundant edge</span>
              <strong>{step.state.redundantEdge ?? "Pending"}</strong>
              <p>
                {step.state.redundantEdge
                  ? "First cycle-closing edge in input order"
                  : "No same-component edge detected yet"}
              </p>
            </div>
          ) : step.state.kind === "count-connected-components" ? (
            <div className="mini-card">
              <span>Components</span>
              <strong>{step.state.componentCount}</strong>
              <p>
                {step.state.rejectedEdges.length > 0
                  ? `${step.state.rejectedEdges.length} same-component edge${step.state.rejectedEdges.length === 1 ? "" : "s"} recorded`
                  : "Every accepted edge reduced the total"}
              </p>
            </div>
          ) : null}
        </div>
      </>
    );
  }

  if (step.state.kind === "course-schedule" && isCourseScheduleInput(run.input)) {
    const courses = Array.from({ length: run.input.courseCount }, (_, index) => `${index}`);
    const layout = buildGraphLayout(courses);
    const settledSet = new Set(step.state.settled);
    const frontierSet = new Set(step.state.frontier);
    const cycleSet = new Set(step.state.cycleNodes);
    const activeEdgeKey =
      step.state.activeEdge.length === 2
        ? `${step.state.activeEdge[0]}->${step.state.activeEdge[1]}`
        : "";

    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} dependency graph</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="graph-legend" aria-label="Course schedule status legend">
          <span className="graph-legend-pill graph-legend-pill-current">Current course</span>
          <span className="graph-legend-pill graph-legend-pill-frontier">Ready queue</span>
          <span className="graph-legend-pill graph-legend-pill-settled">Scheduled</span>
          <span className="graph-legend-pill graph-legend-pill-path">
            {step.state.schedulable === false ? "Cycle" : "Blocked"}
          </span>
        </div>
        <div className="graph-visual-grid">
          <div className="graph-stage">
            <svg viewBox="0 0 360 300" role="img" aria-label="Course dependency replay">
              {run.input.prerequisites.map(([course, prerequisite]) => {
                const from = `${prerequisite}`;
                const to = `${course}`;
                const start = layout[from]!;
                const end = layout[to]!;
                const classNames = [
                  "graph-edge",
                  activeEdgeKey === `${from}->${to}` ? "graph-edge-active" : "",
                  cycleSet.has(from) && cycleSet.has(to) ? "graph-edge-path" : ""
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <g key={`${from}-${to}`}>
                    <line className={classNames} x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
                  </g>
                );
              })}

              {courses.map((course) => {
                const { x, y } = layout[course]!;
                const classNames = [
                  "graph-node",
                  step.state.current === course ? "graph-node-current" : "",
                  settledSet.has(course) ? "graph-node-settled" : "",
                  frontierSet.has(course) ? "graph-node-frontier" : "",
                  cycleSet.has(course) ? "graph-node-path" : ""
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <g className={classNames} key={course}>
                    <circle cx={x} cy={y} r="26" />
                    <text className="graph-label" x={x} y={y - 2}>
                      {course}
                    </text>
                    <text className="graph-distance" x={x} y={y + 16}>
                      in {step.state.indegrees[course] ?? 0}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="graph-state-rail">
            <article className="mini-card graph-summary-card">
              <span>Scheduling focus</span>
              <strong>{step.state.current ?? "Pending extraction"}</strong>
              <p>{formatActiveEdge(step.state.activeEdge)}</p>
            </article>
            <div className="graph-node-grid">
              {courses.map((course) => {
                const tone = getCourseNodeTone(course, step);

                return (
                  <article
                    className={`graph-node-card graph-node-card-${tone}`}
                    key={`course-${course}`}
                  >
                    <div className="graph-node-card-header">
                      <strong>{course}</strong>
                      <span className="graph-node-status">
                        {formatCourseNodeStatus(course, step)}
                      </span>
                    </div>
                    <span className="graph-node-distance">
                      Indegree {step.state.indegrees[course] ?? 0}
                    </span>
                    <span className="graph-node-meta">{formatCourseNodeMeta(course, step)}</span>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Ready queue</span>
            <div className="pill-row">
              {step.state.frontier.length > 0 ? (
                step.state.frontier.map((course) => (
                  <span className="pill" key={course}>
                    {course}
                  </span>
                ))
              ) : (
                <span className="empty-pill">Queue empty</span>
              )}
            </div>
          </div>
          <div className="mini-card">
            <span>Committed order</span>
            <strong>{step.state.order.length > 0 ? step.state.order.join(" -> ") : "Pending"}</strong>
            <p>
              {step.state.order.length > 0
                ? `${step.state.order.length} course${step.state.order.length === 1 ? "" : "s"} scheduled`
                : "No courses committed yet"}
            </p>
          </div>
          <div className="mini-card">
            <span>Outcome</span>
            <strong>
              {step.state.schedulable === null
                ? "Scheduling"
                : step.state.schedulable
                  ? "Schedulable"
                  : "Cycle detected"}
            </strong>
            <p>
              {step.state.schedulable === false && step.state.cycleNodes.length > 0
                ? `Blocked: ${step.state.cycleNodes.join(", ")}`
                : "Replay publishes the queue, indegrees, and final order directly."}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (step.state.kind === "network-delay-time" && isPathfindingGraphInput(run.input)) {
    const layout = buildGraphLayout(run.input.nodes);
    const settledSet = new Set(step.state.settled);
    const frontierSet = new Set(step.state.frontier);
    const reachedSet = new Set(step.state.reachedNodes);
    const unreachableSet = new Set(step.state.unreachableNodes);
    const activeEdgeKey =
      step.state.activeEdge.length === 2
        ? `${step.state.activeEdge[0]}->${step.state.activeEdge[1]}`
        : "";

    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} network</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="graph-legend" aria-label="Graph status legend">
          <span className="graph-legend-pill graph-legend-pill-current">Current node</span>
          <span className="graph-legend-pill graph-legend-pill-frontier">Frontier</span>
          <span className="graph-legend-pill graph-legend-pill-settled">Settled</span>
          <span className="graph-legend-pill graph-legend-pill-path">Reached</span>
        </div>
        <div className="graph-visual-grid">
          <div className="graph-stage">
            <svg viewBox="0 0 360 300" role="img" aria-label="Network delay graph replay">
              {run.input.edges.map(([from, to, weight]) => {
                const start = layout[from]!;
                const end = layout[to]!;
                const classNames = [
                  "graph-edge",
                  activeEdgeKey === `${from}->${to}` ? "graph-edge-active" : ""
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <g key={`${from}-${to}`}>
                    <line
                      className={classNames}
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                    />
                    <text
                      className="graph-weight"
                      x={(start.x + end.x) / 2}
                      y={(start.y + end.y) / 2 - 8}
                    >
                      {weight}
                    </text>
                  </g>
                );
              })}

              {run.input.nodes.map((node) => {
                const { x, y } = layout[node]!;
                const classNames = [
                  "graph-node",
                  step.state.current === node ? "graph-node-current" : "",
                  settledSet.has(node) ? "graph-node-settled" : "",
                  frontierSet.has(node) ? "graph-node-frontier" : "",
                  reachedSet.has(node) ? "graph-node-path" : ""
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <g className={classNames} key={node}>
                    <circle cx={x} cy={y} r="26" />
                    <text className="graph-label" x={x} y={y - 2}>
                      {node}
                    </text>
                    <text className="graph-distance" x={x} y={y + 16}>
                      {formatDistance(step.state.distances[node] ?? null)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="graph-state-rail">
            <article className="mini-card graph-summary-card">
              <span>Broadcast focus</span>
              <strong>{step.state.current ?? step.state.signalSource}</strong>
              <p>{formatActiveEdge(step.state.activeEdge)}</p>
            </article>
            <div className="graph-node-grid">
              {run.input.nodes.map((node) => {
                const status = step.state.current === node
                  ? "Current"
                  : settledSet.has(node)
                    ? "Settled"
                    : frontierSet.has(node)
                      ? "Frontier"
                      : unreachableSet.has(node)
                        ? "Unreachable"
                        : reachedSet.has(node)
                          ? "Reached"
                          : node === step.state.signalSource
                            ? "Source"
                            : "Idle";
                const tone = step.state.current === node
                  ? "current"
                  : settledSet.has(node)
                    ? "settled"
                    : frontierSet.has(node)
                      ? "frontier"
                      : reachedSet.has(node)
                        ? "path"
                        : "idle";

                return (
                  <article className={`graph-node-card graph-node-card-${tone}`} key={`node-${node}`}>
                    <div className="graph-node-card-header">
                      <strong>{node}</strong>
                      <span className="graph-node-status">{status}</span>
                    </div>
                    <span className="graph-node-distance">
                      Arrival {formatDistance(step.state.distances[node] ?? null)}
                    </span>
                    <span className="graph-node-meta">
                      {node === step.state.signalSource
                        ? "Signal source"
                        : unreachableSet.has(node)
                          ? "No route from the source"
                          : reachedSet.has(node)
                            ? "Reachable relay"
                            : "Pending relay"}
                    </span>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Frontier</span>
            <div className="pill-row">
              {step.state.frontier.length > 0 ? (
                step.state.frontier.map((node) => (
                  <span className="pill" key={node}>
                    {node}
                  </span>
                ))
              ) : (
                <span className="empty-pill">Frontier empty</span>
              )}
            </div>
          </div>
          <div className="mini-card">
            <span>Reached nodes</span>
            <strong>{step.state.reachedNodes.length}</strong>
            <p>
              {step.state.reachedNodes.length > 0
                ? step.state.reachedNodes.join(", ")
                : "Only the source is known"}
            </p>
          </div>
          <div className="mini-card">
            <span>Outcome</span>
            <strong>
              {step.state.allReached === null
                ? "Broadcasting"
                : step.state.allReached
                  ? `Delay ${step.state.networkDelay ?? 0}`
                  : "Unreachable nodes"}
            </strong>
            <p>
              {step.state.allReached === null
                ? "The weighted frontier is still resolving arrival times."
                : step.state.allReached
                  ? "Every node received the signal from the chosen source."
                  : step.state.unreachableNodes.join(", ")}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (isPathfindingGraphInput(run.input)) {
    const layout = buildGraphLayout(run.input.nodes);
    const settledSet = new Set(step.state.settled);
    const frontierSet = new Set(step.state.frontier);
    const pathPairs = new Set(
      step.state.kind === "course-schedule"
        ? []
        : step.state.path
            .slice(0, -1)
            .map((node, index) => `${node}->${step.state.path[index + 1]}`)
    );
    const activeEdgeKey =
      step.state.activeEdge.length === 2
        ? `${step.state.activeEdge[0]}->${step.state.activeEdge[1]}`
        : "";

    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} network</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="graph-legend" aria-label="Graph status legend">
          <span className="graph-legend-pill graph-legend-pill-current">Current node</span>
          <span className="graph-legend-pill graph-legend-pill-frontier">Frontier</span>
          <span className="graph-legend-pill graph-legend-pill-settled">Settled</span>
          <span className="graph-legend-pill graph-legend-pill-path">Recovered route</span>
        </div>
        <div className="graph-visual-grid">
          <div className="graph-stage">
            <svg viewBox="0 0 360 300" role="img" aria-label="Pathfinding graph replay">
              {run.input.edges.map(([from, to, weight]) => {
                const start = layout[from]!;
                const end = layout[to]!;
                const classNames = [
                  "graph-edge",
                  activeEdgeKey === `${from}->${to}` || activeEdgeKey === `${to}->${from}`
                    ? "graph-edge-active"
                    : "",
                  pathPairs.has(`${from}->${to}`) || pathPairs.has(`${to}->${from}`)
                    ? "graph-edge-path"
                    : ""
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <g key={`${from}-${to}`}>
                    <line
                      className={classNames}
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                    />
                    <text
                      className="graph-weight"
                      x={(start.x + end.x) / 2}
                      y={(start.y + end.y) / 2 - 8}
                    >
                      {weight}
                    </text>
                  </g>
                );
              })}

              {run.input.nodes.map((node) => {
                const { x, y } = layout[node]!;
                const distance = step.state.kind === "course-schedule" ? null : step.state.distances[node] ?? null;
                const classNames = [
                  "graph-node",
                  step.state.current === node ? "graph-node-current" : "",
                  settledSet.has(node) ? "graph-node-settled" : "",
                  frontierSet.has(node) ? "graph-node-frontier" : "",
                  step.state.kind === "course-schedule" ? "" : step.state.path.includes(node) ? "graph-node-path" : ""
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <g className={classNames} key={node}>
                    <circle cx={x} cy={y} r="26" />
                    <text className="graph-label" x={x} y={y - 2}>
                      {node}
                    </text>
                    <text className="graph-distance" x={x} y={y + 16}>
                      {formatDistance(distance)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="graph-state-rail">
            <article className="mini-card graph-summary-card">
              <span>Traversal focus</span>
              <strong>{step.state.current ?? "Pending expansion"}</strong>
              <p>{formatActiveEdge(step.state.activeEdge)}</p>
            </article>
            <div className="graph-node-grid">
              {run.input.nodes.map((node) => {
                const tone = getPathfindingGraphNodeTone(node, step);

                return (
                  <article className={`graph-node-card graph-node-card-${tone}`} key={`node-${node}`}>
                    <div className="graph-node-card-header">
                      <strong>{node}</strong>
                      <span className="graph-node-status">
                        {formatGraphNodeStatus(node, step, run)}
                      </span>
                    </div>
                    <span className="graph-node-distance">
                      Distance {formatDistance(step.state.kind === "course-schedule" ? null : step.state.distances[node] ?? null)}
                    </span>
                    <span className="graph-node-meta">{formatGraphNodeMeta(node, run)}</span>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Frontier</span>
            <div className="pill-row">
              {step.state.frontier.length > 0 ? (
                step.state.frontier.map((node) => (
                  <span className="pill" key={node}>
                    {node}
                  </span>
                ))
              ) : (
                <span className="empty-pill">Frontier empty</span>
              )}
            </div>
          </div>
          <div className="mini-card">
            <span>Settled</span>
            <strong>{step.state.settled.length}</strong>
            <p>
              {step.state.settled.length > 0 ? step.state.settled.join(", ") : "No nodes settled"}
            </p>
          </div>
          <div className="mini-card">
            <span>Route</span>
            <strong>{step.state.kind === "course-schedule" ? "Pending" : step.state.path.length > 0 ? step.state.path.join(" -> ") : "Pending"}</strong>
            <p>
              {step.state.kind === "course-schedule"
                ? "The trace has not recovered a target route yet."
                : step.state.path.length > 0
                  ? `${step.state.path.length} nodes on the recovered route`
                  : "The trace has not recovered a target route yet."}
            </p>
          </div>
        </div>
      </>
    );
  }

  throw new Error("Graph runs require a matching graph-family state.");
}

export function StackStage({ run, stepIndex }: { run: StackRun; stepIndex: number }) {
  const step = getStep(run.trace.steps, stepIndex);

  if (isMinStackState(step.state)) {
    const operationLabel =
      step.state.cursor !== null && step.state.currentOperation !== null
        ? step.state.currentOperation === "push" && step.state.currentValue !== null
          ? `Inspect push ${step.state.currentValue}`
          : `Inspect ${step.state.currentOperation}`
        : "Operation stream settled";
    const resultLabel =
      step.state.currentResultType !== null && step.state.currentResultValue !== null
        ? `${step.state.currentResultType} returned ${step.state.currentResultValue}.`
        : step.state.currentMinimum !== null
          ? `Current minimum stays at ${step.state.currentMinimum}.`
          : "No current result is published on this frame.";

    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} stack</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="stack-stage">
          <div className="stack-banner">
            <span>{step.state.operations.length} operations queued</span>
            <strong>{operationLabel}</strong>
            <p>
              {step.state.comparisonValue !== null && step.state.currentValue !== null
                ? `Compare pushed value ${step.state.currentValue} against current minimum ${step.state.comparisonValue}.`
                : resultLabel}
            </p>
          </div>
          <div className="stack-visual-grid">
            <div className="stack-token-grid" aria-label="Min Stack operation stream">
              {step.state.operations.map((operation, index) => (
                <article
                  className={`stack-char ${
                    step.state.cursor === index
                      ? "stack-char-current"
                      : step.state.processedIndices.includes(index)
                        ? "stack-char-processed"
                        : "stack-char-stacked"
                  }`}
                  key={`min-stack-op-${index}`}
                >
                  <span className="stack-char-index">Op {index}</span>
                  <strong className="stack-char-value">
                    {operation.type}
                    {operation.type === "push" ? ` ${operation.value}` : ""}
                  </strong>
                  <span className="stack-char-status">
                    {formatMinStackOperationStatus(index, step)}
                  </span>
                </article>
              ))}
            </div>
            <div className="stack-stack-rail">
              <article className="mini-card">
                <span>Current minimum</span>
                <strong>{step.state.currentMinimum !== null ? step.state.currentMinimum : "None"}</strong>
                <p>
                  {step.state.stackValues.length > 0
                    ? `${step.state.stackValues.length} value${step.state.stackValues.length === 1 ? "" : "s"} on the stack`
                    : "The stack is empty"}
                </p>
              </article>
              <div className="stack-stack-grid">
                {step.state.stackValues.length > 0 ? (
                  [...step.state.stackValues]
                    .map((value, index) => ({
                      value,
                      min: step.state.minimumValues[index] ?? null
                    }))
                    .reverse()
                    .map(({ value, min }, index) => (
                      <article className="stack-frame-card" key={`min-stack-frame-${index}-${value}`}>
                        <span>{index === 0 ? "Top" : `Depth ${index}`}</span>
                        <strong>{value}</strong>
                        <p>{min !== null ? `Minimum at depth: ${min}` : "No minimum recorded"}</p>
                      </article>
                    ))
                ) : (
                  <div className="stack-frame-empty">Stack empty</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Current op</span>
            <strong>
              {step.state.currentOperation !== null
                ? step.state.currentOperation
                : "Done"}
            </strong>
            <p>
              {step.state.currentOperation === "push" && step.state.currentValue !== null
                ? `Value ${step.state.currentValue}`
                : "No active push value"}
            </p>
          </div>
          <div className="mini-card">
            <span>Comparison</span>
            <strong>
              {step.state.comparisonValue !== null ? step.state.comparisonValue : "None"}
            </strong>
            <p>
              {step.state.comparisonValue !== null
                ? "Current minimum under comparison"
                : "No minimum comparison on this frame"}
            </p>
          </div>
          <div className="mini-card">
            <span>Latest result</span>
            <strong>
              {step.state.currentResultType !== null && step.state.currentResultValue !== null
                ? `${step.state.currentResultType}: ${step.state.currentResultValue}`
                : "Waiting"}
            </strong>
            <p>
              {step.state.currentResultType !== null
                ? "Read and pop operations publish explicit results in the trace."
                : "No read result is active on this frame."}
            </p>
          </div>
        </div>
        <div className="sort-lane-strip" aria-label="Min Stack operation ledger">
          {step.state.operations.map((operation, index) => (
            <article className="lane-chip lane-chip-idle" key={`min-stack-ledger-${index}`}>
              <div className="lane-chip-header">
                <span>Op {index}</span>
                <strong>
                  {operation.type}
                  {operation.type === "push" ? ` ${operation.value}` : ""}
                </strong>
              </div>
              <span className="lane-chip-status">
                {formatMinStackOperationStatus(index, step)}
              </span>
            </article>
          ))}
        </div>
      </>
    );
  }

  if (isLargestRectangleStackState(step.state)) {
    const minHeight = Math.min(...step.state.heights);
    const maxHeight = Math.max(...step.state.heights);
    const range = Math.max(1, maxHeight - minHeight);
    const waitingLabel =
      step.state.stackIndices.length > 0
        ? step.state.stackIndices.map((index) => `Bar ${index}`).join(", ")
        : "No candidate bars";

    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} stack</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="stack-stage">
          <div className="stack-banner">
            <span>{step.state.heights.length} histogram bars queued</span>
            <strong>
              {step.state.cursor !== null && step.state.currentHeight !== null
                ? `Inspect bar ${step.state.cursor} = ${step.state.currentHeight}`
                : step.phase === "Flush"
                  ? "Flush remaining candidates"
                  : "Histogram settled"}
            </strong>
            <p>
              {step.state.currentResolvedIndex !== null &&
              step.state.currentArea !== null &&
              step.state.currentSpanStart !== null &&
              step.state.currentSpanEnd !== null
                ? `Bar ${step.state.currentResolvedIndex} closes area ${step.state.currentArea} across bars ${step.state.currentSpanStart}-${step.state.currentSpanEnd}.`
                : step.state.comparisonIndex !== null && step.state.cursor !== null
                  ? `Compare bar ${step.state.cursor} against stacked bar ${step.state.comparisonIndex}.`
                  : step.phase === "Flush"
                    ? "The terminal boundary is resolving every remaining candidate rectangle."
                    : step.state.stackIndices.length > 0
                      ? `${step.state.stackIndices.length} candidate bar${step.state.stackIndices.length === 1 ? "" : "s"} still define open left boundaries.`
                      : "No candidate bar is waiting on the stack."}
            </p>
          </div>
          <div className="stack-visual-grid">
            <div className="sort-stage" aria-label="Histogram state">
              {step.state.heights.map((height, index) => {
                const isBest =
                  step.state.bestStart !== null &&
                  step.state.bestEnd !== null &&
                  index >= step.state.bestStart &&
                  index <= step.state.bestEnd;
                const classes = [
                  "sort-bar",
                  step.state.cursor === index ? "sort-bar-active" : "",
                  step.state.comparisonIndex === index ? "sort-bar-swap" : "",
                  step.state.currentResolvedIndex === index || isBest ? "sort-bar-sorted" : ""
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <div className={classes} key={`histogram-${index}-${height}`}>
                    <span className="sort-bar-value">{height}</span>
                    <div
                      className="sort-bar-rod"
                      style={{ height: `${18 + ((height - minHeight + 1) / (range + 1)) * 180}px` }}
                    />
                    <span className="sort-bar-index">{index}</span>
                  </div>
                );
              })}
            </div>
            <div className="stack-stack-rail">
              <article className="mini-card">
                <span>Candidate stack</span>
                <strong>{step.state.stackIndices.length} bar(s)</strong>
                <p>{waitingLabel}</p>
              </article>
              <div className="stack-stack-grid">
                {step.state.stackIndices.length > 0 ? (
                  [...step.state.stackIndices]
                    .map((bar, index) => ({
                      bar,
                      height: step.state.stackHeights[index] ?? null
                    }))
                    .reverse()
                    .map(({ bar, height }, index) => (
                      <article className="stack-frame-card" key={`histogram-frame-${bar}`}>
                        <span>{index === 0 ? "Top" : `Depth ${index}`}</span>
                        <strong>{height !== null ? `${height}` : "Pending"}</strong>
                        <p>Bar {bar} remains an open left boundary</p>
                      </article>
                    ))
                ) : (
                  <div className="stack-frame-empty">Stack empty</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Current bar</span>
            <strong>{step.state.cursor !== null ? step.state.cursor : "Done"}</strong>
            <p>{step.state.currentHeight !== null ? `Height ${step.state.currentHeight}` : "No active bar"}</p>
          </div>
          <div className="mini-card">
            <span>Comparison</span>
            <strong>{step.state.comparisonIndex !== null ? `Bar ${step.state.comparisonIndex}` : "None"}</strong>
            <p>
              {step.state.comparisonIndex !== null
                ? `Height ${step.state.heights[step.state.comparisonIndex]}`
                : "No stacked bar under inspection"}
            </p>
          </div>
          <div className="mini-card">
            <span>Best rectangle</span>
            <strong>{step.state.bestArea}</strong>
            <p>
              {step.state.bestStart !== null && step.state.bestEnd !== null
                ? `Bars ${step.state.bestStart}-${step.state.bestEnd} at height ${step.state.bestHeight ?? "?"}`
                : "No rectangle recorded yet"}
            </p>
          </div>
        </div>
        <div className="sort-lane-strip" aria-label="Histogram ledger">
          {step.state.heights.map((height, index) => (
            <article className="lane-chip lane-chip-idle" key={`histogram-ledger-${index}`}>
              <div className="lane-chip-header">
                <span>Bar {index}</span>
                <strong>{height}</strong>
              </div>
              <span className="lane-chip-status">{formatLargestRectangleStatus(index, step)}</span>
            </article>
          ))}
        </div>
      </>
    );
  }

  if (isDailyTemperaturesStackState(step.state)) {
    const minTemperature = Math.min(...step.state.temperatures);
    const maxTemperature = Math.max(...step.state.temperatures);
    const range = Math.max(1, maxTemperature - minTemperature);
    const waitingLabel =
      step.state.stackIndices.length > 0
        ? step.state.stackIndices.map((index) => `Day ${index}`).join(", ")
        : "No unresolved days";

    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} stack</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="stack-stage">
          <div className="stack-banner">
            <span>{step.state.temperatures.length} forecast days queued</span>
            <strong>
              {step.state.cursor !== null && step.state.currentTemperature !== null
                ? `Inspect day ${step.state.cursor} = ${step.state.currentTemperature}°`
                : "Forecast resolved"}
            </strong>
            <p>
              {step.state.currentResolvedIndex !== null && step.state.currentWait !== null
                ? `Day ${step.state.currentResolvedIndex} settles after ${step.state.currentWait} day${step.state.currentWait === 1 ? "" : "s"}.`
                : step.state.comparisonIndex !== null && step.state.cursor !== null
                  ? `Compare day ${step.state.cursor} against unresolved day ${step.state.comparisonIndex}.`
                  : step.state.stackIndices.length > 0
                    ? `${step.state.stackIndices.length} unresolved day${step.state.stackIndices.length === 1 ? "" : "s"} still waiting for a warmer temperature.`
                    : "No unresolved day is waiting on the stack."}
            </p>
          </div>
          <div className="stack-visual-grid">
            <div className="sort-stage" aria-label="Temperature forecast state">
              {step.state.temperatures.map((temperature, index) => {
                const classes = [
                  "sort-bar",
                  step.state.cursor === index ? "sort-bar-active" : "",
                  step.state.comparisonIndex === index ? "sort-bar-swap" : "",
                  step.state.currentResolvedIndex === index || step.state.resolvedWaits[index]! > 0
                    ? "sort-bar-sorted"
                    : ""
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <div className={classes} key={`temperature-${index}-${temperature}`}>
                    <span className="sort-bar-value">{temperature}</span>
                    <div
                      className="sort-bar-rod"
                      style={{
                        height: `${18 + ((temperature - minTemperature + 1) / (range + 1)) * 180}px`
                      }}
                    />
                    <span className="sort-bar-index">{index}</span>
                  </div>
                );
              })}
            </div>
            <div className="stack-stack-rail">
              <article className="mini-card">
                <span>Unresolved stack</span>
                <strong>{step.state.stackIndices.length} day(s)</strong>
                <p>{waitingLabel}</p>
              </article>
              <div className="stack-stack-grid">
                {step.state.stackIndices.length > 0 ? (
                  [...step.state.stackIndices]
                    .map((day, index) => ({
                      day,
                      temperature: step.state.stackTemperatures[index] ?? null
                    }))
                    .reverse()
                    .map(({ day, temperature }, index) => (
                      <article className="stack-frame-card" key={`temperature-frame-${day}`}>
                        <span>{index === 0 ? "Top" : `Depth ${index}`}</span>
                        <strong>{temperature !== null ? `${temperature}°` : "Pending"}</strong>
                        <p>Day {day} still needs a warmer future day</p>
                      </article>
                    ))
                ) : (
                  <div className="stack-frame-empty">Stack empty</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Current day</span>
            <strong>{step.state.cursor !== null ? step.state.cursor : "Done"}</strong>
            <p>
              {step.state.currentTemperature !== null
                ? `${step.state.currentTemperature} degrees`
                : "No active temperature"}
            </p>
          </div>
          <div className="mini-card">
            <span>Comparison</span>
            <strong>{step.state.comparisonIndex !== null ? `Day ${step.state.comparisonIndex}` : "None"}</strong>
            <p>
              {step.state.comparisonIndex !== null
                ? `${step.state.temperatures[step.state.comparisonIndex]} degrees`
                : "No unresolved day under inspection"}
            </p>
          </div>
          <div className="mini-card">
            <span>Resolved waits</span>
            <strong>{step.state.resolvedWaits.filter((wait) => wait > 0).length}</strong>
            <p>
              {step.state.currentResolvedIndex !== null && step.state.currentWait !== null
                ? `Latest: day ${step.state.currentResolvedIndex} waits ${step.state.currentWait}`
                : "Zeroes stay visible for days with no warmer future temperature"}
            </p>
          </div>
        </div>
        <div className="sort-lane-strip" aria-label="Daily temperature ledger">
          {step.state.temperatures.map((temperature, index) => (
            <article className="lane-chip lane-chip-idle" key={`temperature-ledger-${index}`}>
              <div className="lane-chip-header">
                <span>Day {index}</span>
                <strong>{temperature}°</strong>
              </div>
              <span className="lane-chip-status">
                {formatDailyTemperatureStatus(index, step)}
              </span>
            </article>
          ))}
        </div>
      </>
    );
  }

  if (!isValidParenthesesStackState(step.state)) {
    return null;
  }

  const verdict =
    step.state.valid === true
      ? "Valid expression"
      : step.state.valid === false
        ? "Invalid expression"
        : "Validation in progress";

  return (
    <>
      <div className="visual-heading">
        <div>
          <p className="eyebrow">Live State</p>
          <h2>{run.algorithm.name} stack</h2>
        </div>
        <p className="visual-meta">Current phase: {step.phase}</p>
      </div>
      <div className="stack-stage">
        <div className="stack-banner">
          <span>{step.state.expression.length} tokens queued</span>
          <strong>
            {step.state.currentChar !== null
              ? `Inspect slot ${step.state.cursor} = ${step.state.currentChar}`
              : verdict}
          </strong>
          <p>
            {step.state.failureReason
              ? step.state.failureReason
              : step.state.expectedCloser
                ? `Next closer must be ${step.state.expectedCloser}.`
                : "The stack is empty, so the next opener starts a fresh segment."}
          </p>
        </div>
        <div className="stack-visual-grid">
          <div className="stack-token-grid" aria-label="Bracket expression state">
            {step.state.expression.split("").map((token, index) => {
              const tone = getStackTokenTone(index, step);

              return (
                <article className={`stack-char stack-char-${tone}`} key={`stack-token-${index}`}>
                  <span className="stack-char-index">Slot {index}</span>
                  <strong className="stack-char-value">{token}</strong>
                  <span className="stack-char-status">{formatStackTokenStatus(tone)}</span>
                </article>
              );
            })}
          </div>
          <div className="stack-stack-rail">
            <article className="mini-card">
              <span>Expected closer</span>
              <strong>{step.state.expectedCloser ?? "None"}</strong>
              <p>{step.state.stackTokens.length} opener(s) on the stack</p>
            </article>
            <div className="stack-stack-grid">
              {step.state.stackTokens.length > 0 ? (
                [...step.state.stackTokens]
                  .map((token, index) => ({
                    token,
                    stackIndex: step.state.stackIndices[index] ?? null
                  }))
                  .reverse()
                  .map(({ token, stackIndex }, index) => (
                    <article className="stack-frame-card" key={`stack-frame-${index}-${stackIndex}`}>
                      <span>{index === 0 ? "Top" : `Depth ${index}`}</span>
                      <strong>{token}</strong>
                      <p>{stackIndex !== null ? `Opened at slot ${stackIndex}` : "Pending slot"}</p>
                    </article>
                  ))
              ) : (
                <div className="stack-frame-empty">Stack empty</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mini-grid">
        <div className="mini-card">
          <span>Stack depth</span>
          <strong>{step.state.stackTokens.length}</strong>
        </div>
        <div className="mini-card">
          <span>Matched pairs</span>
          <strong>{step.state.matchedPairs.length}</strong>
        </div>
        <div className="mini-card">
          <span>Verdict</span>
          <strong>{verdict}</strong>
        </div>
      </div>
    </>
  );
}

export function HashStage({ run, stepIndex }: { run: HashRun; stepIndex: number }) {
  const step = getStep(run.trace.steps, stepIndex);

  return (
    <>
      <div className="visual-heading">
        <div>
          <p className="eyebrow">Live State</p>
          <h2>{run.algorithm.name} lookup</h2>
        </div>
        <p className="visual-meta">Current phase: {step.phase}</p>
      </div>
      <div className="window-stage">
        <div className="window-banner">
          <span>Target {step.state.target}</span>
          <strong>
            {step.state.currentIndex !== null && step.state.currentValue !== null
              ? `Inspect index ${step.state.currentIndex} = ${step.state.currentValue}`
              : "Awaiting first lookup"}
          </strong>
          <p>
            {step.state.matchedPairValues.length === 2
              ? `Resolved pair ${formatHashPair(step.state.matchedPairValues)} = ${step.state.target}`
              : step.state.complement !== null
                ? `Need complement ${step.state.complement}${
                    step.state.complementIndex !== null
                      ? ` at stored index ${step.state.complementIndex}`
                      : " from a future or unseen entry"
                  }.`
                : "The lookup table starts empty so the first value can only be stored."}
          </p>
        </div>
        <div className="window-grid">
          {step.state.array.map((value, index) => {
            const isCurrent = step.state.currentIndex === index;
            const isMatched = step.state.matchedPairIndices.includes(index);
            const isStored = step.state.seenEntries.some((entry) => entry.index === index);
            const className = [
              "window-cell",
              isStored ? "window-cell-active" : "",
              isCurrent ? "window-cell-candidate" : "",
              isMatched ? "window-cell-best" : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div className={className} key={`hash-card-${index}-${value}`}>
                <span className="window-cell-index">{index}</span>
                <strong className="window-cell-value">{value}</strong>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mini-grid">
        <div className="mini-card">
          <span>Complement</span>
          <strong>{step.state.complement !== null ? step.state.complement : "Waiting"}</strong>
          <p>
            {step.state.complementIndex !== null
              ? `Stored at index ${step.state.complementIndex}`
              : "No stored match yet"}
          </p>
        </div>
        <div className="mini-card">
          <span>Lookup table</span>
          <strong>{step.state.seenEntries.length} entries</strong>
          <div className="pill-row">
            {step.state.seenEntries.length > 0 ? (
              step.state.seenEntries.map((entry) => (
                <span className="pill" key={`hash-entry-${entry.index}`}>
                  {entry.value}@{entry.index}
                </span>
              ))
            ) : (
              <span className="empty-pill">Empty table</span>
            )}
          </div>
        </div>
        <div className="mini-card">
          <span>Result pair</span>
          <strong>
            {step.state.matchedPairIndices.length === 2
              ? step.state.matchedPairIndices.join(" and ")
              : "Pending"}
          </strong>
          <p>
            {step.state.matchedPairValues.length === 2
              ? `${formatHashPair(step.state.matchedPairValues)} = ${step.state.target}`
              : "No complement pair locked yet"}
          </p>
        </div>
      </div>
    </>
  );
}

export function HeapStage({ run, stepIndex }: { run: HeapRun; stepIndex: number }) {
  const step = getStep(run.trace.steps, stepIndex);

  if (step.state.kind === "top-k-frequent-elements") {
    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} heap</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="window-stage">
          <div className="window-banner">
            <span>Top {step.state.k} frequencies</span>
            <strong>
              {step.state.currentValue !== null && step.state.currentFrequency !== null
                ? `${step.state.currentValue} × ${step.state.currentFrequency}`
                : step.state.result.length > 0
                  ? `Top ${step.state.k} frequent values resolve to ${step.state.result.join(", ")}`
                  : "Awaiting first frequency candidate"}
            </strong>
            <p>
              {step.state.result.length > 0
                ? `Final ranked output ${step.state.result.join(", ")} comes from cutoff ${formatHeapEntry(step.state.candidateEntry)}.`
                : step.state.evictedEntry
                  ? `Evicted ${formatHeapEntry(step.state.evictedEntry)} while rebalancing the size-${step.state.k} heap.`
                  : step.state.candidateEntry
                    ? `Current cutoff is ${formatHeapEntry(step.state.candidateEntry)}.`
                    : `${step.state.frequencyLedger.length} distinct value${step.state.frequencyLedger.length === 1 ? "" : "s"} counted so far.`}
            </p>
          </div>
          <div className="window-grid">
            {step.state.frequencyLedger.length > 0 ? (
              step.state.frequencyLedger.map((entry) => {
                const isCurrent = step.state.currentValue === entry.value;
                const isStored = step.state.heapEntries.some(
                  (heapEntry) => heapEntry.value === entry.value
                );
                const className = [
                  "window-cell",
                  isStored ? "window-cell-best" : "",
                  isCurrent ? "window-cell-candidate" : ""
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <div className={className} key={`heap-frequency-card-${entry.value}`}>
                    <span className="window-cell-index">{entry.firstIndex}</span>
                    <strong className="window-cell-value">{entry.value}</strong>
                    <span className="graph-node-meta">{entry.frequency} hits</span>
                  </div>
                );
              })
            ) : (
              step.state.array.map((value, index) => (
                <div className="window-cell" key={`heap-array-card-${index}`}>
                  <span className="window-cell-index">{index}</span>
                  <strong className="window-cell-value">{value}</strong>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Cutoff root</span>
            <strong>{formatHeapEntry(step.state.candidateEntry)}</strong>
            <p>
              {step.state.heapEntries.length >= step.state.k
                ? `${step.state.k} heap slots filled`
                : `${step.state.heapEntries.length} of ${step.state.k} filled`}
            </p>
          </div>
          <div className="mini-card">
            <span>Heap order</span>
            <div className="pill-row">
              {step.state.heapEntries.length > 0 ? (
                step.state.heapEntries.map((entry) => (
                  <span className="pill" key={`heap-entry-${entry.value}`}>
                    {entry.value}×{entry.frequency}
                  </span>
                ))
              ) : (
                <span className="empty-pill">Heap empty</span>
              )}
            </div>
          </div>
          <div className="mini-card">
            <span>Ranked top-k</span>
            <div className="pill-row">
              {step.state.rankedEntries.length > 0 ? (
                step.state.rankedEntries.map((entry) => (
                  <span className="pill" key={`heap-ranked-${entry.value}`}>
                    {entry.value}×{entry.frequency}
                  </span>
                ))
              ) : (
                <span className="empty-pill">No ranked candidates</span>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="visual-heading">
        <div>
          <p className="eyebrow">Live State</p>
          <h2>{run.algorithm.name} heap</h2>
        </div>
        <p className="visual-meta">Current phase: {step.phase}</p>
      </div>
      <div className="window-stage">
        <div className="window-banner">
          <span>Top {step.state.k} target</span>
          <strong>
            {step.state.currentIndex !== null && step.state.currentValue !== null
              ? `Inspect index ${step.state.currentIndex} = ${step.state.currentValue}`
              : step.state.result !== null
                ? `${step.state.k}th largest resolves to ${step.state.result}`
                : "Awaiting first heap candidate"}
          </strong>
          <p>
            {step.state.result !== null
              ? `Final cutoff ${step.state.result} comes from heap root ${formatHeapEntry(step.state.candidateEntry)}.`
              : step.state.evictedEntry
                ? `Evicted ${formatHeapEntry(step.state.evictedEntry)} while rebalancing the size-${step.state.k} heap.`
                : step.state.candidateEntry
                  ? `Current cutoff is ${formatHeapEntry(step.state.candidateEntry)}.`
                  : `Heap has ${step.state.heapEntries.length} of ${step.state.k} required entries.`}
          </p>
        </div>
        <div className="window-grid">
          {step.state.array.map((value, index) => {
            const isCurrent = step.state.currentIndex === index;
            const isStored = step.state.heapEntries.some((entry) => entry.index === index);
            const isProcessed = step.state.processedIndices.includes(index);
            const className = [
              "window-cell",
              isStored ? "window-cell-best" : "",
              isCurrent ? "window-cell-candidate" : "",
              isProcessed && !isStored ? "window-cell-active" : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div className={className} key={`heap-card-${index}-${value}`}>
                <span className="window-cell-index">{index}</span>
                <strong className="window-cell-value">{value}</strong>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mini-grid">
        <div className="mini-card">
          <span>Cutoff root</span>
          <strong>{formatHeapEntry(step.state.candidateEntry)}</strong>
          <p>
            {step.state.heapEntries.length >= step.state.k
              ? `${step.state.k} heap slots filled`
              : `${step.state.heapEntries.length} of ${step.state.k} filled`}
          </p>
        </div>
        <div className="mini-card">
          <span>Heap order</span>
          <div className="pill-row">
            {step.state.heapEntries.length > 0 ? (
              step.state.heapEntries.map((entry) => (
                <span className="pill" key={`heap-entry-${entry.index}`}>
                  {entry.value}@{entry.index}
                </span>
              ))
            ) : (
              <span className="empty-pill">Heap empty</span>
            )}
          </div>
        </div>
        <div className="mini-card">
          <span>Ranked top-k</span>
          <div className="pill-row">
            {step.state.rankedEntries.length > 0 ? (
              step.state.rankedEntries.map((entry) => (
                <span className="pill" key={`heap-ranked-${entry.index}`}>
                  {entry.value}@{entry.index}
                </span>
              ))
            ) : (
              <span className="empty-pill">No ranked candidates</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function IntervalStage({ run, stepIndex }: { run: IntervalRun; stepIndex: number }) {
  const step = getStep(run.trace.steps, stepIndex);

  return (
    <>
      <div className="visual-heading">
        <div>
          <p className="eyebrow">Live State</p>
          <h2>{run.algorithm.name} ranges</h2>
        </div>
        <p className="visual-meta">Current phase: {step.phase}</p>
      </div>
      <div className="window-stage">
        <div className="window-banner">
          <span>{step.state.orderedIntervals.length} sorted intervals</span>
          <strong>
            {step.state.comparisonInterval.length === 2
              ? `Compare ${formatInterval(step.state.comparisonInterval)} against ${formatInterval(step.state.activeInterval)}`
              : step.state.activeInterval.length === 2
                ? `Active merged span ${formatInterval(step.state.activeInterval)}`
                : `${step.state.mergedIntervals.length} merged outputs ready`}
          </strong>
          <p>
            {step.state.overlapRange.length === 2
              ? `Current overlap spans ${formatInterval(step.state.overlapRange)}.`
              : step.state.mergedIntervals.length > 0
                ? `Committed outputs: ${step.state.mergedIntervals.map((interval) => formatInterval(interval)).join(" · ")}`
                : "The scan is ordering and comparing ranges before committing merged output."}
          </p>
        </div>
        <div className="window-grid">
          {step.state.orderedIntervals.map((interval, index) => {
            const isActive = step.state.activeGroupIndices.includes(index);
            const isCurrent = step.state.currentIndex === index;
            const isCommitted = step.state.consumedIndices.includes(index) && !isActive;
            const className = [
              "window-cell",
              isActive ? "window-cell-active" : "",
              isCurrent ? "window-cell-candidate" : "",
              isCommitted ? "window-cell-best" : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div className={className} key={`interval-card-${index}`}>
                <span className="window-cell-index">#{index}</span>
                <strong className="window-cell-value">{formatInterval(interval)}</strong>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mini-grid">
        <div className="mini-card">
          <span>Active span</span>
          <strong>{formatInterval(step.state.activeInterval)}</strong>
        </div>
        <div className="mini-card">
          <span>Overlap</span>
          <strong>{formatInterval(step.state.overlapRange)}</strong>
        </div>
        <div className="mini-card">
          <span>Merged outputs</span>
          <strong>{step.state.mergedIntervals.length}</strong>
        </div>
      </div>
    </>
  );
}
