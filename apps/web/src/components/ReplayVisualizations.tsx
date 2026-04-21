import {
  type GraphExecutionState,
  type SortingExecutionState
} from "@tracedeck/execution-engine";
import { type JsonObject, type TraceStep } from "@tracedeck/trace-core";

import {
  formatDistance,
  type GraphRun,
  type HashRun,
  type IntervalRun,
  type SearchRun,
  type SortingRun,
  type StackRun
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

function getGraphNodeTone(
  node: string,
  step: TraceStep<GraphExecutionState>
): "current" | "path" | "settled" | "frontier" | "idle" {
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
  const tone = getGraphNodeTone(node, step);

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

function getStackTokenTone(
  index: number,
  step: StackRun["trace"]["steps"][number]
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

export function GraphStage({ run, stepIndex }: { run: GraphRun; stepIndex: number }) {
  const step = getStep(run.trace.steps, stepIndex);
  const layout = buildGraphLayout(run.input.nodes);
  const settledSet = new Set(step.state.settled);
  const frontierSet = new Set(step.state.frontier);
  const pathPairs = new Set(
    step.state.path.slice(0, -1).map((node, index) => `${node}->${step.state.path[index + 1]}`)
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
              const distance = step.state.distances[node] ?? null;
              const classNames = [
                "graph-node",
                step.state.current === node ? "graph-node-current" : "",
                settledSet.has(node) ? "graph-node-settled" : "",
                frontierSet.has(node) ? "graph-node-frontier" : "",
                step.state.path.includes(node) ? "graph-node-path" : ""
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
              const tone = getGraphNodeTone(node, step);

              return (
                <article className={`graph-node-card graph-node-card-${tone}`} key={`node-${node}`}>
                  <div className="graph-node-card-header">
                    <strong>{node}</strong>
                    <span className="graph-node-status">
                      {formatGraphNodeStatus(node, step, run)}
                    </span>
                  </div>
                  <span className="graph-node-distance">
                    Distance {formatDistance(step.state.distances[node] ?? null)}
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
          <p>{step.state.settled.length > 0 ? step.state.settled.join(", ") : "No nodes settled"}</p>
        </div>
        <div className="mini-card">
          <span>Route</span>
          <strong>{step.state.path.length > 0 ? step.state.path.join(" -> ") : "Pending"}</strong>
          <p>
            {step.state.path.length > 0
              ? `${step.state.path.length} nodes on the recovered route`
              : "The trace has not recovered a target route yet."}
          </p>
        </div>
      </div>
    </>
  );
}

export function StackStage({ run, stepIndex }: { run: StackRun; stepIndex: number }) {
  const step = getStep(run.trace.steps, stepIndex);
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
