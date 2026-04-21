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
  isNumberOfIslandsInput,
  isRottingOrangesInput,
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
  if (step.state.kind !== "bfs" && step.state.kind !== "dijkstra") {
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
    isCourseScheduleInput(run.input) ||
    isRottingOrangesInput(run.input) ||
    isNumberOfIslandsInput(run.input)
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
      return run.algorithm.id === "bfs" ? "Queued" : "Frontier";
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

  if (isNumberOfIslandsInput(run.input) || isRottingOrangesInput(run.input)) {
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

function getIslandCellTone(
  cell: string,
  value: string,
  step: TraceStep<Extract<GraphExecutionState, { kind: "number-of-islands" }>>
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
  step: TraceStep<Extract<GraphExecutionState, { kind: "number-of-islands" }>>
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

function formatHeapEntry(entry: { value: number; index: number } | null): string {
  if (!entry) {
    return "Pending";
  }

  return `${entry.value}@${entry.index}`;
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
  if (step.state.kind === "number-of-islands" && isNumberOfIslandsInput(run.input)) {
    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} archipelago</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="graph-legend" aria-label="Number of Islands status legend">
          <span className="graph-legend-pill graph-legend-pill-current">Active land</span>
          <span className="graph-legend-pill graph-legend-pill-frontier">Frontier</span>
          <span className="graph-legend-pill graph-legend-pill-settled">Claimed land</span>
          <span className="graph-legend-pill graph-legend-pill-path">Scan cursor</span>
        </div>
        <div className="graph-visual-grid">
          <div className="graph-stage island-stage">
            <div className="island-banner">
              <span>{step.state.islandCount} island{step.state.islandCount === 1 ? "" : "s"} found</span>
              <strong>
                {step.state.activeIslandId !== null
                  ? `Exploring island ${step.state.activeIslandId}`
                  : step.state.scan
                    ? `Scanning ${step.state.scan}`
                    : "Full grid scan complete"}
              </strong>
              <p>{step.state.activeEdge.length > 0 ? formatActiveEdge(step.state.activeEdge) : step.state.scan ?? "No neighbor under inspection"}</p>
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
              <span>Scan focus</span>
              <strong>{step.state.scan ?? step.state.current ?? "Complete"}</strong>
              <p>
                {step.state.activeIslandId !== null
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
                  <strong>Remaining land</strong>
                  <span className="graph-node-status">{step.state.remainingLand.length}</span>
                </div>
                <span className="graph-node-distance">Unresolved land cells</span>
                <span className="graph-node-meta">
                  {step.state.remainingLand.length > 0
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
                    ? step.state.completedIslands
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
                ? step.state.completedIslands
                    .map((island, index) => `#${index + 1}: ${island.length}`)
                    .join(", ")
                : "No completed islands yet"}
            </p>
          </div>
          <div className="mini-card">
            <span>Traversal state</span>
            <strong>
              {step.state.activeIslandId !== null
                ? `Island ${step.state.activeIslandId}`
                : `${step.state.islandCount} total`}
            </strong>
            <p>
              {step.state.remainingLand.length > 0
                ? `${step.state.remainingLand.length} land cell${step.state.remainingLand.length === 1 ? "" : "s"} still waiting for the scan cursor.`
                : "Replay records the final island ledger directly from the grid snapshots."}
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

  if (!isCourseScheduleInput(run.input)) {
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
            <svg viewBox="0 0 360 300" role="img" aria-label="Weighted graph replay">
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
