import { useEffect, useState } from "react";

import {
  algorithms,
  buildComparisonRuns,
  buildRun,
  comparisonAlgorithms,
  describeInputFootprint,
  formatDistance,
  getAlgorithmById,
  getTraceStepPaths,
  type AccentTone,
  type GraphRun,
  type ReplayRun,
  type SearchRun,
  type SortingRun
} from "./replay.js";

type FoundationResponse = {
  product: string;
  priorities: string[];
  services: Array<{
    name: string;
    role: string;
  }>;
};

const playbackProfiles = {
  slow: { label: "0.75x", intervalMs: 1250 },
  normal: { label: "1x", intervalMs: 800 },
  fast: { label: "1.6x", intervalMs: 450 }
} as const;

type PlaybackSpeed = keyof typeof playbackProfiles;
type ViewMode = "single" | "compare";

const defaultAlgorithm = algorithms[0];
const defaultComparisonAlgorithm = comparisonAlgorithms[0];

if (!defaultAlgorithm || !defaultComparisonAlgorithm) {
  throw new Error("TraceDeck requires seeded algorithms to render the replay shell.");
}

const assuredDefaultAlgorithm = defaultAlgorithm;
const assuredDefaultComparisonAlgorithm = defaultComparisonAlgorithm;

function isSortingRun(run: ReplayRun): run is SortingRun {
  return run.algorithm.domain === "sorting";
}

function isGraphRun(run: ReplayRun): run is GraphRun {
  return run.algorithm.domain === "graph";
}

function isSearchRun(run: ReplayRun): run is SearchRun {
  return run.algorithm.domain === "search";
}

type StoryboardStop = {
  key: string;
  stepIndex: number;
  progressLabel: string;
  title: string;
  detail: string;
};

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function formatStepProgress(stepIndex: number, totalSteps: number): string {
  if (totalSteps <= 1) {
    return "100%";
  }

  return `${Math.round((stepIndex / (totalSteps - 1)) * 100)}%`;
}

function buildCheckpointWindow(totalSteps: number, currentStepIndex: number): number[] {
  const anchorIndices = new Set<number>([0, currentStepIndex, totalSteps - 1]);

  for (let offset = -2; offset <= 2; offset += 1) {
    const candidate = currentStepIndex + offset;
    if (candidate >= 0 && candidate < totalSteps) {
      anchorIndices.add(candidate);
    }
  }

  return Array.from(anchorIndices).sort((left, right) => left - right);
}

function buildStoryboardIndices(totalSteps: number, currentStepIndex: number): number[] {
  const lastIndex = Math.max(0, totalSteps - 1);
  const anchorIndices = new Set<number>([0, currentStepIndex, lastIndex]);

  for (const ratio of [0.2, 0.4, 0.6, 0.8]) {
    anchorIndices.add(Math.round(lastIndex * ratio));
  }

  return Array.from(anchorIndices).sort((left, right) => left - right);
}

function graphLayout(nodes: string[]): Record<string, { x: number; y: number }> {
  const radius = 120;
  const centerX = 180;
  const centerY = 150;

  return Object.fromEntries(
    nodes.map((node, index) => {
      const angle = (Math.PI * 2 * index) / nodes.length - Math.PI / 2;
      return [
        node,
        {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        }
      ];
    })
  );
}

function getSyncedStepIndex(stepCount: number, syncIndex: number, syncStepCount: number): number {
  if (stepCount <= 1 || syncStepCount <= 1) {
    return 0;
  }

  const ratio = syncIndex / (syncStepCount - 1);
  return Math.min(stepCount - 1, Math.round(ratio * (stepCount - 1)));
}

function buildMetricTrend(values: number[], width: number, height: number): string {
  if (values.length === 0) {
    return "";
  }

  if (values.length === 1) {
    const y = height / 2;
    return `M 0 ${y} L ${width} ${y}`;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function getTrendPoint(values: number[], index: number, width: number, height: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const safeIndex = Math.min(index, values.length - 1);
  const currentValue = values[safeIndex] ?? 0;
  const x = values.length <= 1 ? width / 2 : (safeIndex / (values.length - 1)) * width;
  const y = height - ((currentValue - min) / range) * height;

  return { x, y };
}

function getRunStep<Run extends ReplayRun>(
  run: Run,
  stepIndex: number
): Run["trace"]["steps"][number] {
  const safeIndex = Math.max(0, Math.min(stepIndex, run.trace.steps.length - 1));
  return run.trace.steps[safeIndex]!;
}

function formatHighlightLabel(label: string | undefined, key: string): string {
  if (label && label.trim().length > 0) {
    return label;
  }

  return key
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getAccentClass(accent: AccentTone): string {
  return `accent-${accent}`;
}

function metricRank(
  runs: SortingRun[],
  metricKey: string,
  direction: "lower-is-better" | "higher-is-better" | "neutral"
) {
  return runs
    .map((run) => ({
      run,
      value: run.trace.summary.finalMetrics[metricKey] ?? 0
    }))
    .sort((left, right) => {
      const delta =
        direction === "higher-is-better" ? right.value - left.value : left.value - right.value;

      if (delta !== 0) {
        return delta;
      }

      return left.run.algorithm.name.localeCompare(right.run.algorithm.name);
    });
}

function formatMetricLead(
  direction: "lower-is-better" | "higher-is-better" | "neutral",
  leaderValue: number,
  runnerUpValue: number | undefined
): string {
  if (runnerUpValue === undefined || leaderValue === runnerUpValue) {
    return "Tied finish";
  }

  const gap = Math.abs(leaderValue - runnerUpValue);

  if (direction === "higher-is-better") {
    return `Lead +${gap}`;
  }

  return `Lead ${gap}`;
}

function describeRunSnapshot(run: ReplayRun, stepIndex: number): string {
  if (isSortingRun(run)) {
    const step = getRunStep(run, stepIndex);
    return truncateText(step.state.array.join(" · "), 56);
  }

  if (isSearchRun(run)) {
    const step = getRunStep(run, stepIndex);

    if (step.state.foundIndex !== null) {
      return `Found ${step.state.target} at lane ${step.state.foundIndex}`;
    }

    if (step.state.mid !== null) {
      return `Probe lane ${step.state.mid} = ${step.state.array[step.state.mid]}`;
    }

    if (step.state.low !== null && step.state.high !== null) {
      return `Active interval ${step.state.low}-${step.state.high}`;
    }

    return `Target ${step.state.target} absent`;
  }

  const step = getRunStep(run, stepIndex);

  if (step.state.path.length > 0) {
    return truncateText(step.state.path.join(" -> "), 56);
  }

  if (step.state.current) {
    return `Current node ${step.state.current}`;
  }

  return "Route pending";
}

function buildSingleStoryboard(run: ReplayRun, currentStepIndex: number): StoryboardStop[] {
  return buildStoryboardIndices(run.trace.steps.length, currentStepIndex).map((stepIndex) => {
    const step = getRunStep(run, stepIndex);

    return {
      key: step.key,
      stepIndex,
      progressLabel: formatStepProgress(stepIndex, run.trace.steps.length),
      title: step.phase,
      detail: truncateText(step.explanation.summary, 88)
    };
  });
}

function buildComparisonStoryboard(
  runs: SortingRun[],
  currentStepIndex: number,
  stepCount: number
): StoryboardStop[] {
  return buildStoryboardIndices(stepCount, currentStepIndex).map((stepIndex) => {
    const mappedSummaries = runs.map((run) => {
      const syncedIndex = getSyncedStepIndex(run.trace.steps.length, stepIndex, stepCount);
      const step = getRunStep(run, syncedIndex);

      return `${run.algorithm.name.split(" ")[0]}: ${step.phase}`;
    });

    return {
      key: `compare-${stepIndex}`,
      stepIndex,
      progressLabel: formatStepProgress(stepIndex, stepCount),
      title: `Shared frame ${stepIndex + 1}`,
      detail: truncateText(mappedSummaries.join(" · "), 88)
    };
  });
}

function StoryboardRail({
  activeStepIndex,
  onSelect,
  stops
}: {
  activeStepIndex: number;
  onSelect: (stepIndex: number) => void;
  stops: StoryboardStop[];
}) {
  return (
    <div className="storyboard-row">
      {stops.map((stop) => (
        <button
          className={`storyboard-card ${stop.stepIndex === activeStepIndex ? "storyboard-card-active" : ""}`}
          key={stop.key}
          onClick={() => {
            onSelect(stop.stepIndex);
          }}
          type="button"
        >
          <span className="storyboard-index">{stop.progressLabel}</span>
          <strong>{stop.title}</strong>
          <span>{stop.detail}</span>
        </button>
      ))}
    </div>
  );
}

function SingleReplayBriefing({ run, stepIndex }: { run: ReplayRun; stepIndex: number }) {
  const step = getRunStep(run, stepIndex);
  const snapshotLabel = describeRunSnapshot(run, stepIndex);
  const deltaPaths = getTraceStepPaths(step);
  const signalLabels = (
    step.highlights.length > 0
      ? step.highlights.map((highlight) => formatHighlightLabel(highlight.label, highlight.key))
      : deltaPaths
  ).slice(0, 3);
  const stateStatus = isSortingRun(run)
    ? `${getRunStep(run, stepIndex).state.sortedIndices.length} lanes locked`
    : isSearchRun(run)
      ? (() => {
          const searchStep = getRunStep(run, stepIndex);
          return searchStep.state.foundIndex !== null
            ? `Match locked at lane ${searchStep.state.foundIndex}`
            : `${searchStep.state.eliminatedIndices.length} lanes ruled out`;
        })()
      : `${getRunStep(run, stepIndex).state.settled.length} nodes settled`;

  return (
    <section className="focus-strip" aria-label="Active frame briefing">
      <article className="focus-card focus-card-primary">
        <p className="card-kicker">Frame Briefing</p>
        <h3>{step.phase}</h3>
        <p className="focus-copy">{step.explanation.summary}</p>
        {step.explanation.details ? <p className="focus-copy">{step.explanation.details}</p> : null}
      </article>
      <article className="focus-card">
        <span>Snapshot lens</span>
        <strong>{snapshotLabel}</strong>
        <p className="focus-meta">{stateStatus}</p>
      </article>
      <article className="focus-card">
        <span>Recorded signals</span>
        <strong>{deltaPaths.length} delta paths</strong>
        <div className="compare-pill-row">
          {(signalLabels.length > 0 ? signalLabels : ["Full snapshot recorded"]).map(
            (signalLabel, index) => (
              <span className="number-pill" key={`${signalLabel}-${index}`}>
                {signalLabel}
              </span>
            )
          )}
        </div>
      </article>
    </section>
  );
}

function SortingStage({ run, stepIndex }: { run: SortingRun; stepIndex: number }) {
  const step = getRunStep(run, stepIndex);
  const values = step.state.array;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(1, maxValue - minValue);
  const activeSet = new Set(step.state.activeIndices);
  const swapSet = new Set(step.state.swapPair);
  const sortedSet = new Set(step.state.sortedIndices);

  return (
    <>
      <div className="visual-heading">
        <div>
          <p className="eyebrow">Live State</p>
          <h2>{run.algorithm.name} lanes</h2>
        </div>
        <p className="visual-meta">Current phase: {step.phase}</p>
      </div>
      <div className="sort-stage">
        {values.map((value, index) => {
          const classes = [
            "sort-bar",
            activeSet.has(index) ? "sort-bar-active" : "",
            swapSet.has(index) ? "sort-bar-swap" : "",
            sortedSet.has(index) ? "sort-bar-sorted" : ""
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
      <div className="mini-grid">
        <div className="mini-card">
          <span>Focused lanes</span>
          <strong>
            {step.state.activeIndices.length > 0 ? step.state.activeIndices.join(", ") : "None"}
          </strong>
        </div>
        <div className="mini-card">
          <span>Sorted lanes</span>
          <strong>{step.state.sortedIndices.length}</strong>
        </div>
        <div className="mini-card">
          <span>Replay mode</span>
          <strong>Deterministic restore</strong>
        </div>
      </div>
    </>
  );
}

function SearchStage({ run, stepIndex }: { run: SearchRun; stepIndex: number }) {
  const step = getRunStep(run, stepIndex);
  const activeLow = step.state.low;
  const activeHigh = step.state.high;
  const eliminatedSet = new Set(step.state.eliminatedIndices);

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
            {activeLow !== null && activeHigh !== null
              ? `${activeLow} to ${activeHigh}`
              : "Exhausted"}
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
      </div>
    </>
  );
}

function GraphStage({ run, stepIndex }: { run: GraphRun; stepIndex: number }) {
  const step = getRunStep(run, stepIndex);
  const layout = graphLayout(run.input.nodes);
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
        </div>
        <div className="mini-card">
          <span>Route</span>
          <strong>{step.state.path.length > 0 ? step.state.path.join(" -> ") : "Pending"}</strong>
        </div>
      </div>
    </>
  );
}

function renderMetricCards(run: ReplayRun, stepIndex: number) {
  const step = getRunStep(run, stepIndex);

  return run.trace.summary.metricDefinitions.map((metric) => (
    <div className="metric-card" key={metric.key}>
      <span>{metric.label}</span>
      <strong>{step.metrics[metric.key] ?? 0}</strong>
    </div>
  ));
}

function renderSingleStage(run: ReplayRun, stepIndex: number) {
  if (isSortingRun(run)) {
    return <SortingStage run={run} stepIndex={stepIndex} />;
  }

  if (isSearchRun(run)) {
    return <SearchStage run={run} stepIndex={stepIndex} />;
  }

  return <GraphStage run={run} stepIndex={stepIndex} />;
}

function renderStateSnapshot(run: ReplayRun, stepIndex: number) {
  if (isGraphRun(run)) {
    return (
      <div className="distance-grid">
        {Object.entries(getRunStep(run, stepIndex).state.distances).map(([node, distance]) => (
          <div className="distance-row" key={node}>
            <span>{node}</span>
            <strong>{formatDistance(distance)}</strong>
          </div>
        ))}
      </div>
    );
  }

  if (isSearchRun(run)) {
    const step = getRunStep(run, stepIndex);

    return (
      <>
        <div className="search-summary-grid">
          <div className="distance-row">
            <span>Target</span>
            <strong>{step.state.target}</strong>
          </div>
          <div className="distance-row">
            <span>Midpoint</span>
            <strong>{step.state.mid !== null ? step.state.mid : "Waiting"}</strong>
          </div>
          <div className="distance-row">
            <span>Window</span>
            <strong>
              {step.state.low !== null && step.state.high !== null
                ? `${step.state.low} to ${step.state.high}`
                : "Exhausted"}
            </strong>
          </div>
          <div className="distance-row">
            <span>Match</span>
            <strong>{step.state.foundIndex !== null ? step.state.foundIndex : "None"}</strong>
          </div>
        </div>
        <div className="number-grid">
          {step.state.array.map((value, index) => (
            <span className="number-pill" key={`${value}-${index}`}>
              {index}:{value}
            </span>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="number-grid">
      {getRunStep(run, stepIndex).state.array.map((value, index) => (
        <span className="number-pill" key={`${value}-${index}`}>
          {value}
        </span>
      ))}
    </div>
  );
}

function ComparisonWorkspace({
  runs,
  currentStepIndex,
  stepCount
}: {
  runs: SortingRun[];
  currentStepIndex: number;
  stepCount: number;
}) {
  if (runs.length === 0) {
    return null;
  }

  const syncedRuns = runs.map((run) => {
    const stepIndex = getSyncedStepIndex(run.trace.steps.length, currentStepIndex, stepCount);
    return {
      run,
      stepIndex,
      step: getRunStep(run, stepIndex)
    };
  });
  const syncProgress =
    stepCount <= 1 ? 100 : Math.round((currentStepIndex / (stepCount - 1)) * 100);
  const metricDefinitions = runs[0]!.trace.summary.metricDefinitions;

  return (
    <>
      <section className="panel compare-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Comparison Summary</p>
            <h3>Synchronized metrics on one shared input</h3>
          </div>
          <p className="panel-copy">
            Each algorithm keeps its own deterministic checkpoints while the transport bar
            advances both runs on a shared progress line.
          </p>
        </div>
        <div className="compare-summary-grid">
          <article className="summary-card">
            <p className="card-kicker">Shared Input</p>
            <h3>{runs[0] ? describeInputFootprint(runs[0]) : "0 lanes"}</h3>
          </article>
          <article className="summary-card">
            <p className="card-kicker">Sync Progress</p>
            <h3>{syncProgress}%</h3>
          </article>
          <article className="summary-card">
            <p className="card-kicker">Longest Deck</p>
            <h3>{stepCount} frames</h3>
          </article>
        </div>
        <div className="compare-metric-grid">
          {metricDefinitions.map((metric) => {
            const ranking = metricRank(runs, metric.key, metric.direction);
            const leader = ranking[0];
            const runnerUp = ranking[1];

            return (
              <article className="metric-card compare-metric-card" key={metric.key}>
                <span>{metric.label}</span>
                <strong>
                  {leader ? `${leader.run.algorithm.name} · ${leader.value}` : "Pending"}
                </strong>
                <p className="metric-caption">
                  {leader
                    ? formatMetricLead(metric.direction, leader.value, runnerUp?.value)
                    : "No data yet"}
                </p>
              </article>
            );
          })}
        </div>
        <div className="compare-sync-grid">
          {syncedRuns.map(({ run, stepIndex, step }) => (
            <article className={`sync-card ${getAccentClass(run.algorithm.accent)}`} key={run.algorithm.id}>
              <div className="sync-card-header">
                <span className={`algorithm-badge algorithm-badge-${run.algorithm.accent}`}>
                  {run.algorithm.badge}
                </span>
                <span className="sync-card-progress">
                  {formatStepProgress(stepIndex, run.trace.summary.stepCount)}
                </span>
              </div>
              <strong>{run.algorithm.name}</strong>
              <p>{truncateText(step.explanation.summary, 104)}</p>
              <span className="sync-card-meta">
                {step.phase} · Frame {stepIndex + 1} of {run.trace.summary.stepCount}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel stage-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Comparison Deck</p>
            <h3>Side-by-side replay states</h3>
          </div>
          <p className="panel-copy">
            Frame mapping is normalized by run length, so both algorithms stay aligned even when
            their trace counts diverge.
          </p>
        </div>
        <div className="compare-stage-grid">
          {syncedRuns.map(({ run, stepIndex, step }) => (
            <article
              className={`compare-stage-card ${getAccentClass(run.algorithm.accent)}`}
              key={run.algorithm.id}
            >
              <div className="compare-stage-header">
                <div>
                  <p className="eyebrow">{run.algorithm.badge}</p>
                  <h3>{run.algorithm.name}</h3>
                </div>
                <span className="phase-badge">
                  Frame {stepIndex + 1} / {run.trace.summary.stepCount}
                </span>
              </div>
              <p className="compare-stage-copy">{step.explanation.summary}</p>
              <SortingStage run={run} stepIndex={stepIndex} />
              <div className="comparison-metric-strip">{renderMetricCards(run, stepIndex)}</div>
              <div className="compare-pill-row">
                {step.highlights.map((highlight) => (
                  <span className="number-pill" key={highlight.key}>
                    {formatHighlightLabel(highlight.label, highlight.key)}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel compare-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Trend Charts</p>
            <h3>Metric drift across synchronized playback</h3>
          </div>
        </div>
        <div className="compare-trend-grid">
          {metricDefinitions.map((metric) => (
            <article className="trend-card" key={metric.key}>
              <div className="trend-card-header">
                <strong>{metric.label}</strong>
                <span>{metric.direction === "lower-is-better" ? "Lower is better" : metric.direction === "higher-is-better" ? "Higher is better" : "Track side by side"}</span>
              </div>
              <svg className="trend-chart" viewBox="0 0 240 110" role="img" aria-label={`${metric.label} trend`}>
                <line className="trend-baseline" x1="0" y1="104" x2="240" y2="104" />
                {runs.map((run) => {
                  const values = Array.from({ length: stepCount }, (_, index) => {
                    const stepIndex = getSyncedStepIndex(run.trace.steps.length, index, stepCount);
                    return getRunStep(run, stepIndex).metrics[metric.key] ?? 0;
                  });
                  const marker = getTrendPoint(values, currentStepIndex, 240, 96);

                  return (
                    <g key={run.algorithm.id}>
                      <path
                        className={`trend-line ${getAccentClass(run.algorithm.accent)}`}
                        d={buildMetricTrend(values, 240, 96)}
                      />
                      <circle
                        className={`trend-marker ${getAccentClass(run.algorithm.accent)}`}
                        cx={marker.x}
                        cy={marker.y}
                        r="4"
                      />
                    </g>
                  );
                })}
              </svg>
              <div className="compare-legend">
                {runs.map((run) => (
                  <div className="compare-legend-item" key={`${metric.key}-${run.algorithm.id}`}>
                    <span className={`legend-swatch ${getAccentClass(run.algorithm.accent)}`} />
                    <span>{run.algorithm.name}</span>
                    <strong>{run.trace.summary.finalMetrics[metric.key] ?? 0}</strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default function App() {
  const [foundation, setFoundation] = useState<FoundationResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "offline">("loading");
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [selectedAlgorithmId, setSelectedAlgorithmId] = useState<string>(assuredDefaultAlgorithm.id);
  const [singleInputText, setSingleInputText] = useState<string>(assuredDefaultAlgorithm.defaultInput);
  const [compareInputText, setCompareInputText] = useState<string>(
    assuredDefaultComparisonAlgorithm.defaultInput
  );
  const [run, setRun] = useState<ReplayRun>(() =>
    buildRun(assuredDefaultAlgorithm.id, assuredDefaultAlgorithm.defaultInput)
  );
  const [comparisonRuns, setComparisonRuns] = useState<SortingRun[]>(() =>
    buildComparisonRuns(assuredDefaultComparisonAlgorithm.defaultInput)
  );
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedId, setSpeedId] = useState<PlaybackSpeed>("normal");
  const [singleError, setSingleError] = useState<string>("");
  const [compareError, setCompareError] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function loadFoundation() {
      try {
        const response = await fetch("/api/foundation");

        if (!response.ok) {
          throw new Error("Unable to load foundation metadata.");
        }

        const payload = (await response.json()) as FoundationResponse;

        if (active) {
          setFoundation(payload);
          setStatus("ready");
        }
      } catch {
        if (active) {
          setStatus("offline");
        }
      }
    }

    void loadFoundation();

    return () => {
      active = false;
    };
  }, []);

  const activeStepCount =
    viewMode === "compare"
      ? Math.max(...comparisonRuns.map((comparisonRun) => comparisonRun.trace.steps.length))
      : run.trace.steps.length;

  useEffect(() => {
    if (currentStepIndex >= activeStepCount) {
      setCurrentStepIndex(Math.max(0, activeStepCount - 1));
    }
  }, [activeStepCount, currentStepIndex]);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    if (currentStepIndex >= activeStepCount - 1) {
      setIsPlaying(false);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCurrentStepIndex((stepIndex) => {
        if (stepIndex >= activeStepCount - 1) {
          setIsPlaying(false);
          return stepIndex;
        }

        return stepIndex + 1;
      });
    }, playbackProfiles[speedId].intervalMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeStepCount, currentStepIndex, isPlaying, speedId]);

  const selectedAlgorithm = getAlgorithmById(selectedAlgorithmId);
  const currentStep =
    viewMode === "single"
      ? getRunStep(run, currentStepIndex)
      : null;
  const checkpointWindow = buildCheckpointWindow(activeStepCount, currentStepIndex);
  const syncProgress =
    activeStepCount <= 1 ? 100 : Math.round((currentStepIndex / (activeStepCount - 1)) * 100);
  const storyboardStops =
    viewMode === "compare"
      ? buildComparisonStoryboard(comparisonRuns, currentStepIndex, activeStepCount)
      : buildSingleStoryboard(run, currentStepIndex);
  const compareLaneSignals =
    viewMode === "compare"
      ? comparisonRuns.map((comparisonRun) => {
          const syncedIndex = getSyncedStepIndex(
            comparisonRun.trace.steps.length,
            currentStepIndex,
            activeStepCount
          );
          const syncedStep = getRunStep(comparisonRun, syncedIndex);

          return `${comparisonRun.algorithm.name.split(" ")[0]}: ${syncedStep.phase}`;
        })
      : [];
  const compareMatchupLabel = comparisonRuns
    .map((comparisonRun) => comparisonRun.algorithm.name.split(" ")[0])
    .join(" / ");
  const heroHeadline =
    viewMode === "compare" ? "Comparison command center" : `${run.algorithm.name} under replay lens`;
  const heroNarrative =
    viewMode === "compare"
      ? `Shared transport keeps ${comparisonRuns.length} deterministic runs on one progress line while every lane preserves its own checkpoint density. ${compareLaneSignals.join(" · ")}`
      : currentStep?.explanation.summary ?? run.trace.steps[0]!.explanation.summary;
  const heroStats =
    viewMode === "compare"
      ? [
          {
            label: "Matchup",
            value: compareMatchupLabel,
            detail: `${comparisonRuns.length} algorithms on one seeded array`
          },
          {
            label: "Shared input",
            value: comparisonRuns[0] ? describeInputFootprint(comparisonRuns[0]) : "Pending",
            detail: "Every metric reads from the same normalized payload"
          },
          {
            label: "Sync progress",
            value: `${syncProgress}%`,
            detail: `Shared frame ${currentStepIndex + 1} of ${activeStepCount}`
          },
          {
            label: "Playback profile",
            value: playbackProfiles[speedId].label,
            detail: isPlaying ? "Transport rolling" : "Transport paused"
          }
        ]
      : [
          {
            label: "Active algorithm",
            value: run.algorithm.name,
            detail: run.algorithm.description
          },
          {
            label: "Input footprint",
            value: describeInputFootprint(run),
            detail: selectedAlgorithm.inputHint
          },
          {
            label: "Current frame",
            value: currentStep ? `${currentStep.index + 1} / ${run.trace.summary.stepCount}` : "0 / 0",
            detail: currentStep?.phase ?? "Awaiting trace"
          },
          {
            label: "Playback profile",
            value: playbackProfiles[speedId].label,
            detail: isPlaying ? "Transport rolling" : "Transport paused"
          }
        ];
  const platformPriorities = foundation?.priorities ?? [];
  const timelineSnapshotDetail =
    viewMode === "compare"
      ? compareLaneSignals.join(" · ")
      : currentStep
        ? describeRunSnapshot(run, currentStep.index)
        : "";

  function resetPlayback(nextMode: ViewMode) {
    setViewMode(nextMode);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }

  function launchRun(algorithmId: string, nextInputText: string) {
    try {
      const nextRun = buildRun(algorithmId, nextInputText);
      setRun(nextRun);
      setSingleInputText(nextRun.normalizedInputText);
      setSelectedAlgorithmId(algorithmId);
      setCurrentStepIndex(0);
      setIsPlaying(false);
      setSingleError("");
    } catch (launchError) {
      setIsPlaying(false);
      setSingleError(
        launchError instanceof Error
          ? launchError.message
          : "Unable to build the requested trace."
      );
    }
  }

  function launchComparison(nextInputText: string) {
    try {
      const nextRuns = buildComparisonRuns(nextInputText);
      setComparisonRuns(nextRuns);
      setCompareInputText(nextRuns[0]?.normalizedInputText ?? nextInputText);
      setCurrentStepIndex(0);
      setIsPlaying(false);
      setCompareError("");
    } catch (launchError) {
      setIsPlaying(false);
      setCompareError(
        launchError instanceof Error
          ? launchError.message
          : "Unable to build the comparison deck."
      );
    }
  }

  return (
    <main className="shell">
      <section className="hero-band">
        <div>
          <p className="eyebrow">TraceDeck</p>
          <h1>Replay and comparison studio for deterministic algorithm traces.</h1>
          <p className="hero-copy">
            The shell keeps replay, step inspection, and algorithm comparison on top of the same
            checkpointed trace model so every scrub lands on recorded state instead of reconstructed
            mutations.
          </p>
        </div>
        <div className="hero-command">
          <div className="hero-command-panel">
            <div className="panel-heading hero-command-header">
              <div>
                <p className="eyebrow">Live Workspace</p>
                <h2>{heroHeadline}</h2>
              </div>
              <span className="phase-badge">
                {viewMode === "compare"
                  ? `${syncProgress}% synchronized`
                  : currentStep
                    ? `Frame ${currentStep.index + 1}`
                    : "Frame 1"}
              </span>
            </div>
            <p className="hero-copy hero-command-copy">{heroNarrative}</p>
            <div className="hero-meter">
              <div className="hero-meter-bar">
                <span style={{ width: `${syncProgress}%` }} />
              </div>
              <div className="hero-meter-labels">
                <span>{viewMode === "compare" ? "Lift-off" : "Seed"}</span>
                <span>{viewMode === "compare" ? `${syncProgress}% synced` : currentStep?.phase}</span>
                <span>Done</span>
              </div>
            </div>
          </div>
          <div className="hero-stat-grid">
            {heroStats.map((stat) => (
              <article className="hero-stat-card" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <p>{stat.detail}</p>
              </article>
            ))}
          </div>
        </div>
        {platformPriorities.length > 0 ? (
          <div className="priority-row">
            {platformPriorities.map((priority) => (
              <span className="priority-pill" key={priority}>
                {priority}
              </span>
            ))}
          </div>
        ) : null}
        <div className="hero-status">
          <div className="status-row">
            <span className={`status-chip status-chip--${status}`}>
              {status === "ready"
                ? "API connected"
                : status === "offline"
                  ? "API offline"
                  : "Loading foundation"}
            </span>
            <span className="status-chip status-chip--accent">
              {foundation?.product ?? "TraceDeck"} {viewMode === "compare" ? "comparison" : "replay"}
            </span>
          </div>
          <div className="status-row">
            <span className="status-chip">
              {viewMode === "compare"
                ? comparisonRuns.map((comparisonRun) => comparisonRun.algorithm.name).join(" vs ")
                : run.algorithm.name}
            </span>
            <span className="status-chip">
              {viewMode === "compare"
                ? `Sync ${syncProgress}%`
                : `Frame ${Math.min(currentStepIndex, run.trace.summary.stepCount - 1) + 1} of ${run.trace.summary.stepCount}`}
            </span>
            <span className="status-chip">Contract-driven replay</span>
          </div>
          <div className="view-switch">
            <button
              className={`segmented ${viewMode === "single" ? "segmented-active" : ""}`}
              onClick={() => {
                resetPlayback("single");
              }}
              type="button"
            >
              Single Replay
            </button>
            <button
              className={`segmented ${viewMode === "compare" ? "segmented-active" : ""}`}
              onClick={() => {
                resetPlayback("compare");
              }}
              type="button"
            >
              Compare Runs
            </button>
          </div>
        </div>
      </section>

      <div className="workspace-grid">
        <aside className="sidebar panel">
          {viewMode === "single" ? (
            <>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Scenario</p>
                  <h2>Choose an algorithm</h2>
                </div>
                <p className="panel-copy">
                  Seeded trace builders exercise replay and inspection surfaces before persistence
                  services hydrate saved runs.
                </p>
              </div>
              <div className="algorithm-list">
                {algorithms.map((algorithm) => (
                  <button
                    className={`algorithm-card ${
                      algorithm.id === selectedAlgorithmId ? "algorithm-card-active" : ""
                    }`}
                    key={algorithm.id}
                    onClick={() => launchRun(algorithm.id, algorithm.defaultInput)}
                    type="button"
                  >
                    <span className={`algorithm-badge algorithm-badge-${algorithm.accent}`}>
                      {algorithm.badge}
                    </span>
                    <strong>{algorithm.name}</strong>
                    <p>{algorithm.description}</p>
                  </button>
                ))}
              </div>

              <label className="input-label" htmlFor="single-input-editor">
                {selectedAlgorithm.inputLabel}
              </label>
              <p className="input-hint">{selectedAlgorithm.inputHint}</p>
              <textarea
                className="input-editor"
                id="single-input-editor"
                onChange={(event) => {
                  setSingleInputText(event.target.value);
                }}
                spellCheck={false}
                value={singleInputText}
              />
              {singleError ? (
                <div className="error-banner">{singleError}</div>
              ) : (
                <div className="note-banner">
                  Launch rebuilds the trace from the editor content and resets the replay cursor.
                </div>
              )}
              <button
                className="launch-button"
                onClick={() => launchRun(selectedAlgorithmId, singleInputText)}
                type="button"
              >
                Launch Run
              </button>
            </>
          ) : (
            <>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Comparison Deck</p>
                  <h2>Build a shared-input matchup</h2>
                </div>
                <p className="panel-copy">
                  The comparison deck replays multiple sorting algorithms against the same array and
                  keeps playback synchronized through normalized progress.
                </p>
              </div>
              <div className="algorithm-list">
                {comparisonAlgorithms.map((algorithm) => (
                  <article className="algorithm-card algorithm-card-static" key={algorithm.id}>
                    <span className={`algorithm-badge algorithm-badge-${algorithm.accent}`}>
                      {algorithm.badge}
                    </span>
                    <strong>{algorithm.name}</strong>
                    <p>{algorithm.description}</p>
                  </article>
                ))}
              </div>
              <label className="input-label" htmlFor="compare-input-editor">
                Shared Array Input
              </label>
              <p className="input-hint">
                One seeded array feeds every comparison lane so metrics stay directly comparable.
              </p>
              <textarea
                className="input-editor"
                id="compare-input-editor"
                onChange={(event) => {
                  setCompareInputText(event.target.value);
                }}
                spellCheck={false}
                value={compareInputText}
              />
              {compareError ? (
                <div className="error-banner">{compareError}</div>
              ) : (
                <div className="note-banner">
                  Build deck regenerates every trace from the same array and resets the synchronized
                  transport line.
                </div>
              )}
              <button
                className="launch-button"
                onClick={() => launchComparison(compareInputText)}
                type="button"
              >
                Build Deck
              </button>
            </>
          )}
        </aside>

        <div className="main-column">
          {viewMode === "single" && currentStep ? (
            <>
              <section className="panel stage-panel">
                <SingleReplayBriefing
                  run={run}
                  stepIndex={Math.min(currentStepIndex, run.trace.steps.length - 1)}
                />
                <div className="stage-layout">
                  <div className="visual-panel">
                    {renderSingleStage(
                      run,
                      Math.min(currentStepIndex, run.trace.steps.length - 1)
                    )}
                  </div>

                  <div className="inspector-column">
                    <section className="panel inspector-panel">
                      <div className="panel-heading">
                        <div>
                          <p className="eyebrow">Step Narrative</p>
                          <h3>{currentStep.phase}</h3>
                        </div>
                        <span className="phase-badge">Frame {currentStep.index + 1}</span>
                      </div>
                      <p className="step-detail">{currentStep.explanation.summary}</p>
                      {currentStep.explanation.details ? (
                        <p className="step-detail">{currentStep.explanation.details}</p>
                      ) : null}
                      {currentStep.explanation.tags?.length ? (
                        <div className="tag-row">
                          {currentStep.explanation.tags.map((tag) => (
                            <span className="number-pill" key={tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <ul className="change-list">
                        {currentStep.highlights.map((highlight) => (
                          <li key={highlight.key}>
                            {formatHighlightLabel(highlight.label, highlight.key)}
                          </li>
                        ))}
                      </ul>
                      <div className="metric-grid">
                        {renderMetricCards(
                          run,
                          Math.min(currentStepIndex, run.trace.steps.length - 1)
                        )}
                      </div>
                    </section>

                    <section className="panel state-panel">
                      <div className="panel-heading">
                        <div>
                          <p className="eyebrow">Changed Paths</p>
                          <h3>Recorded deltas</h3>
                        </div>
                      </div>
                      <div className="number-grid">
                        {getTraceStepPaths(currentStep).map((path) => (
                          <span className="number-pill" key={path}>
                            {path}
                          </span>
                        ))}
                      </div>
                      {renderStateSnapshot(run, currentStep.index)}
                    </section>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <ComparisonWorkspace
              currentStepIndex={currentStepIndex}
              runs={comparisonRuns}
              stepCount={activeStepCount}
            />
          )}

          <section className="panel transport-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Transport</p>
                <h3>{viewMode === "compare" ? "Synchronized controls" : "Replay controls"}</h3>
              </div>
              <p className="panel-copy">
                {viewMode === "compare"
                  ? "Shared transport keeps each run on the same progress line while preserving its own trace density."
                  : "Large traces use checkpointed scrubbing instead of rendering a DOM marker for every frame."}
              </p>
            </div>

            <div className="transport-row">
              <button
                className="transport-button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex(0);
                }}
                type="button"
              >
                Start
              </button>
              <button
                className="transport-button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex((stepIndex) => Math.max(0, stepIndex - 1));
                }}
                type="button"
              >
                Step Back
              </button>
              <button
                className="transport-button transport-button-primary"
                onClick={() => {
                  if (isPlaying) {
                    setIsPlaying(false);
                    return;
                  }

                  if (currentStepIndex >= activeStepCount - 1) {
                    setCurrentStepIndex(0);
                  }

                  setIsPlaying(true);
                }}
                type="button"
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                className="transport-button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex((stepIndex) => Math.min(activeStepCount - 1, stepIndex + 1));
                }}
                type="button"
              >
                Step Forward
              </button>
              <button
                className="transport-button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex(activeStepCount - 1);
                }}
                type="button"
              >
                End
              </button>
            </div>

            <div className="speed-row">
              {(
                Object.entries(playbackProfiles) as Array<
                  [PlaybackSpeed, (typeof playbackProfiles)[PlaybackSpeed]]
                >
              ).map(([profileId, profile]) => (
                <button
                  className={`segmented ${profileId === speedId ? "segmented-active" : ""}`}
                  key={profileId}
                  onClick={() => {
                    setSpeedId(profileId);
                  }}
                  type="button"
                >
                  {profile.label}
                </button>
              ))}
            </div>

            <div className="transport-summary">
              <div className="metric-inline">
                <span>{viewMode === "compare" ? "Sync progress" : "Current frame"}</span>
                <strong>{viewMode === "compare" ? `${syncProgress}%` : currentStep?.phase}</strong>
              </div>
              <div className="metric-inline">
                <span>Playback profile</span>
                <strong>{playbackProfiles[speedId].label}</strong>
              </div>
              <div className="metric-inline">
                <span>{viewMode === "compare" ? "Deck size" : "Input footprint"}</span>
                <strong>
                  {viewMode === "compare"
                    ? `${comparisonRuns.length} algorithms`
                    : describeInputFootprint(run)}
                </strong>
              </div>
            </div>
          </section>

          <section className="panel timeline-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Timeline</p>
                <h3>
                  {viewMode === "compare"
                    ? "Scrub the synchronized progress line"
                    : "Scrub to any deterministic checkpoint"}
                </h3>
              </div>
              <p className="panel-copy">
                {viewMode === "compare"
                  ? `Shared frame ${currentStepIndex + 1} of ${activeStepCount}`
                  : `Frame ${Math.min(currentStepIndex, run.trace.summary.stepCount - 1) + 1} of ${run.trace.summary.stepCount}`}
              </p>
            </div>
            <div className="timeline-progress-shell">
              <div className="timeline-progress-bar">
                <span style={{ width: `${syncProgress}%` }} />
              </div>
              <div className="timeline-progress-copy">
                <strong>
                  {viewMode === "compare"
                    ? `${syncProgress}% synchronized`
                    : currentStep?.explanation.summary}
                </strong>
                <span>{timelineSnapshotDetail}</span>
              </div>
            </div>
            <input
              aria-label="Replay timeline"
              className="timeline-range"
              max={activeStepCount - 1}
              min={0}
              onChange={(event) => {
                setIsPlaying(false);
                setCurrentStepIndex(Number(event.target.value));
              }}
              onInput={(event) => {
                setIsPlaying(false);
                setCurrentStepIndex(Number((event.target as HTMLInputElement).value));
              }}
              type="range"
              value={currentStepIndex}
            />
            <div className="timeline-labels">
              <span>{viewMode === "compare" ? "Lift-off" : "Seed"}</span>
              <span>{viewMode === "compare" ? `${syncProgress}% synced` : currentStep?.phase}</span>
              <span>Done</span>
            </div>
            <StoryboardRail
              activeStepIndex={currentStepIndex}
              onSelect={(stepIndex) => {
                setIsPlaying(false);
                setCurrentStepIndex(stepIndex);
              }}
              stops={storyboardStops}
            />
            <div className="checkpoint-row">
              {checkpointWindow.map((stepIndex) => {
                if (viewMode === "compare") {
                  const phaseSummary = comparisonRuns.map((comparisonRun) => {
                    const syncedIndex = getSyncedStepIndex(
                      comparisonRun.trace.steps.length,
                      stepIndex,
                      activeStepCount
                    );
                    return getRunStep(comparisonRun, syncedIndex).phase;
                  });

                  return (
                    <button
                      className={`checkpoint ${stepIndex === currentStepIndex ? "checkpoint-active" : ""}`}
                      key={`compare-${stepIndex}`}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStepIndex(stepIndex);
                      }}
                      type="button"
                    >
                      <span className="checkpoint-index">
                        {Math.round((stepIndex / Math.max(1, activeStepCount - 1)) * 100)}%
                      </span>
                      <strong>{phaseSummary.join(" / ")}</strong>
                      <span>Synchronized frame {stepIndex + 1}</span>
                    </button>
                  );
                }

                const step = getRunStep(run, stepIndex);
                return (
                  <button
                    className={`checkpoint ${stepIndex === currentStepIndex ? "checkpoint-active" : ""}`}
                    key={step.key}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStepIndex(stepIndex);
                    }}
                    type="button"
                  >
                    <span className="checkpoint-index">{step.index + 1}</span>
                    <strong>{step.phase}</strong>
                    <span>{step.explanation.summary}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {foundation?.services?.length ? (
            <section className="panel summary-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Product Focus</p>
                  <h3>Execution seams already visible in the shell</h3>
                </div>
              </div>
              <div className="summary-grid">
                {foundation.services.map((service) => (
                  <article className="summary-card" key={service.name}>
                    <p className="card-kicker">{service.name}</p>
                    <h3>{service.role}</h3>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
