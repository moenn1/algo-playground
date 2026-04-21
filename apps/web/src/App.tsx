import { startTransition, useDeferredValue, useEffect, useState, type ReactNode } from "react";

import {
  buildRouteHref,
  isRouteActive,
  navigationSurfaces,
  parseHashRoute,
  type AppRoute
} from "./appRoutes.js";
import {
  defaultLibraryFilters,
  getLibraryFocusArea,
  getLibraryProfile,
  getLibraryStage,
  libraryFocusAreas,
  libraryPathways,
  librarySortModes,
  libraryStages,
  resolveLibraryAlgorithms,
  type LibraryFilters
} from "./libraryCatalog.js";
import {
  GraphStage,
  HashStage,
  HeapStage,
  IntervalStage,
  SearchStage,
  SortingStage,
  StackStage,
  TwoPointersStage
} from "./components/ReplayVisualizations.js";
import {
  fetchPersistedRunDetail,
  fetchProductData,
  hydratePersistedRun,
  type PersistedAlgorithmRecord,
  type PersistedComparisonMetric,
  type PersistedComparisonRecord,
  type PersistedRunSummary,
  type ProductDataPayload,
  type PersistenceMetadata
} from "./productData.js";
import {
  algorithms,
  buildComparisonRuns,
  buildRun,
  comparisonAlgorithms,
  describeInputFootprint,
  formatDistance,
  getAlgorithmById,
  getTraceStepPaths,
  isCourseScheduleInput,
  isNumberOfIslandsInput,
  isRottingOrangesInput,
  isWallsAndGatesInput,
  type AccentTone,
  type DynamicProgrammingRun,
  type GraphRun,
  type HashRun,
  type HeapRun,
  type IntervalRun,
  type ReplayAlgorithm,
  type ReplayRun,
  type SearchRun,
  type StackRun,
  type SortingRun,
  type TwoPointersRun,
  type WindowRun
} from "./replay.js";

type FoundationResponse = ProductDataPayload["foundation"];

const playbackProfiles = {
  slow: { label: "0.75x", intervalMs: 1250 },
  normal: { label: "1x", intervalMs: 800 },
  fast: { label: "1.6x", intervalMs: 450 }
} as const;

type PlaybackSpeed = keyof typeof playbackProfiles;
type DataStatus = "loading" | "ready" | "offline";
type StoryboardStop = {
  key: string;
  stepIndex: number;
  progressLabel: string;
  title: string;
  detail: string;
};
type RunSource = {
  label: string;
  detail: string;
};

const defaultAlgorithm = algorithms[0];
const defaultComparisonAlgorithm = comparisonAlgorithms[0];

if (!defaultAlgorithm || !defaultComparisonAlgorithm) {
  throw new Error("TraceDeck requires seeded algorithms to render the replay workspace.");
}

const assuredDefaultAlgorithm = defaultAlgorithm;
const assuredDefaultComparisonAlgorithm = defaultComparisonAlgorithm;

const domainLabels: Record<ReplayAlgorithm["domain"], string> = {
  sorting: "Sorting systems",
  search: "Search systems",
  "two-pointers": "Two-pointer systems",
  window: "Window systems",
  hash: "Hash systems",
  heap: "Heap systems",
  interval: "Interval systems",
  "dynamic-programming": "Dynamic-programming systems",
  stack: "Stack systems",
  graph: "Graph systems"
};

const domainReference: Record<
  ReplayAlgorithm["domain"],
  {
    lens: string;
    flow: string;
    metrics: string;
    checkpoints: string;
  }
> = {
  sorting: {
    lens: "Expose how array state moves through scan windows, pivot locks, swaps, and settled lanes.",
    flow: "Sorting traces stay array-first so every checkpoint can rehydrate the exact lane ordering.",
    metrics: "Sorting comparisons center on `comparisons` and `writes` so cross-run rankings stay stable.",
    checkpoints: "Checkpoint windows focus on local passes while storyboard stops highlight the broader journey."
  },
  search: {
    lens: "Focus on interval collapse, midpoint probes, and the exact moment a target is found or ruled out.",
    flow: "Search playback uses full snapshots of `low`, `high`, `mid`, and eliminated lanes for deterministic jumps.",
    metrics: "Recorded `probes` and `comparisons` capture search work without reconstructing the decision tree in the UI.",
    checkpoints: "Checkpoint cards frame the active interval so long traces still stay readable on mobile."
  },
  "two-pointers": {
    lens: "Track active walls, computed area, and the exact pruning move that discards one side of the container search.",
    flow: "Two-pointer playback records both boundary positions, the limiting wall, and the best container directly in every snapshot.",
    metrics: "Two-pointer metrics emphasize `evaluations`, `moves`, and `bestUpdates` so boundary-pruning work stays readable across future pointer sweeps.",
    checkpoints: "Checkpoint stops separate area evaluations, best-pair updates, and pruning moves so pointer logic stays easy to scrub."
  },
  window: {
    lens: "Track expansions, duplicate or target hits, contractions, and best-window updates without hiding intermediate state.",
    flow: "Window traces carry active bounds plus the algorithm-specific sum or substring state directly in the recorded snapshot.",
    metrics: "Window metrics emphasize `expansions`, `shrinks`, and `bestUpdates` for replay and history surfaces.",
    checkpoints: "Storyboard stops call out the moments when the window first qualifies, repeats, contracts, or lands a better answer."
  },
  hash: {
    lens: "Track complement lookups, stored entries, and the exact pair lock without reconstructing a hidden hash table.",
    flow: "Hash playback records the active value, missing complement, insertion-ordered table entries, and matched pair in every snapshot.",
    metrics: "Hash metrics emphasize `inspections`, `lookups`, and `stores` so lookup-table work stays readable across future array and hash problems.",
    checkpoints: "Checkpoint stops separate failed lookups, table stores, and the winning complement hit so classic hash-map problems stay easy to scrub."
  },
  heap: {
    lens: "Track the size-k cutoff heap, root replacements, frequency candidates, and the final ranked output without reconstructing hidden heap state.",
    flow: "Heap playback records the current value, internal heap order, ranked top-k view, and active cutoff directly in every snapshot.",
    metrics: "Heap metrics emphasize `inspections`, `pushes`, and `pops` so heap-selection and frequency-ranking work stay readable across future heap problems.",
    checkpoints: "Checkpoint stops separate counting, seed pushes, root replacements, skips, and the final cutoff so heap replay stays easy to scrub."
  },
  interval: {
    lens: "Track sorted ranges, overlap checks, active merge spans, and committed outputs without guessing which interval group is live.",
    flow: "Interval playback records the ordered ranges, current comparison, active merged span, and committed outputs in every snapshot.",
    metrics: "Interval metrics emphasize `comparisons`, `merges`, and `outputs` so range resolution work stays readable across future interval problems.",
    checkpoints: "Checkpoint stops separate sort, compare, merge, and commit phases so classic range problems stay easy to scrub."
  },
  "dynamic-programming": {
    lens: "Surface table fill order, recurrence dependencies, and traceback recovery without reconstructing cells in the browser.",
    flow: "DP playback records the full table, current cell, predecessor dependencies, and recovered sequence in every snapshot.",
    metrics: "DP metrics track `cellsComputed`, `matches`, and `tracebackSteps` so recurrence work stays comparable across future table-driven algorithms.",
    checkpoints: "Checkpoint stops separate table fill from traceback so large grids still stay readable in replay."
  },
  stack: {
    lens: "Track unresolved stack entries, minimum ledgers, comparisons, and resolved outputs whether the problem is validating brackets, waiting for warmer days, closing histogram rectangles, or replaying stack operations.",
    flow: "Stack playback records the active cursor, full stack contents, and per-step result signals directly in each snapshot instead of reconstructing browser-only state.",
    metrics: "Stack metrics emphasize `comparisons`, `pushes`, and `pops` so bracket validation, monotonic-stack scans, and stack-operation timelines stay comparable inside one reusable runtime family.",
    checkpoints: "Storyboard stops call out the decisive mismatch, warmer-day resolution burst, histogram pop, minimum read, or clean terminal ledger instead of inferring stack outcomes after the fact."
  },
  graph: {
    lens: "Show frontier churn, active inspections, settled progress, and published outcomes whether the graph is recovering a path, proving a schedule, or spreading across a grid.",
    flow: "Graph playback now spans BFS, Dijkstra, Course Schedule, Rotting Oranges, Number of Islands, and Walls and Gates through deterministic frontier ordering plus serialization-safe union state.",
    metrics: "Graph runs surface settled progress, queue pressure, inspections, and updates directly from the trace envelope instead of browser-only state.",
    checkpoints: "Checkpoint windows anchor around frontier shifts, unlock events, infection-wave jumps, room-distance fills, and terminal cycle or stall reporting so graph playback stays navigable even with denser traces."
  }
};

const libraryDomainOrder = [
  "sorting",
  "search",
  "two-pointers",
  "window",
  "hash",
  "heap",
  "interval",
  "dynamic-programming",
  "stack",
  "graph"
] as const;

type LibraryRouteState = Extract<AppRoute, { page: "library" }>;

function getLibraryFilters(route: LibraryRouteState): LibraryFilters {
  return {
    domain: route.domain ?? defaultLibraryFilters.domain,
    stage: route.stage ?? defaultLibraryFilters.stage,
    focus: route.focus ?? defaultLibraryFilters.focus,
    sort: route.sort ?? defaultLibraryFilters.sort,
    q: route.q ?? defaultLibraryFilters.q
  };
}

function buildLibraryRoute(filters: LibraryFilters): LibraryRouteState {
  const route: LibraryRouteState = { page: "library" };

  if (filters.domain !== "all") {
    route.domain = filters.domain;
  }

  if (filters.stage !== "all") {
    route.stage = filters.stage;
  }

  if (filters.focus !== "all") {
    route.focus = filters.focus;
  }

  if (filters.sort !== defaultLibraryFilters.sort) {
    route.sort = filters.sort;
  }

  const trimmedQuery = filters.q.trim();

  if (trimmedQuery.length > 0) {
    route.q = trimmedQuery;
  }

  return route;
}

function getRouteScrollKey(route: AppRoute): string {
  switch (route.page) {
    case "playground":
      return `${route.page}:${route.algorithmId ?? ""}`;
    case "algorithm-detail":
      return `${route.page}:${route.algorithmId}`;
    default:
      return route.page;
  }
}

function isSortingRun(run: ReplayRun): run is SortingRun {
  return run.algorithm.domain === "sorting";
}

function isGraphRun(run: ReplayRun): run is GraphRun {
  return run.algorithm.domain === "graph";
}

function isSearchRun(run: ReplayRun): run is SearchRun {
  return run.algorithm.domain === "search";
}

function isWindowRun(run: ReplayRun): run is WindowRun {
  return run.algorithm.domain === "window";
}

function isTwoPointersRun(run: ReplayRun): run is TwoPointersRun {
  return run.algorithm.domain === "two-pointers";
}

function isHashRun(run: ReplayRun): run is HashRun {
  return run.algorithm.domain === "hash";
}

function isHeapRun(run: ReplayRun): run is HeapRun {
  return run.algorithm.domain === "heap";
}

function isIntervalRun(run: ReplayRun): run is IntervalRun {
  return run.algorithm.domain === "interval";
}

function isDynamicProgrammingRun(run: ReplayRun): run is DynamicProgrammingRun {
  return run.algorithm.domain === "dynamic-programming";
}

function isStackRun(run: ReplayRun): run is StackRun {
  return run.algorithm.domain === "stack";
}

function isValidParenthesesStackStep(
  step: StackRun["trace"]["steps"][number]
): step is StackRun["trace"]["steps"][number] & {
  state: Extract<StackRun["trace"]["steps"][number]["state"], { kind: "valid-parentheses" }>;
} {
  return step.state.kind === "valid-parentheses";
}

function isDailyTemperaturesStackStep(
  step: StackRun["trace"]["steps"][number]
): step is StackRun["trace"]["steps"][number] & {
  state: Extract<StackRun["trace"]["steps"][number]["state"], { kind: "daily-temperatures" }>;
} {
  return step.state.kind === "daily-temperatures";
}

function isLargestRectangleStackStep(
  step: StackRun["trace"]["steps"][number]
): step is StackRun["trace"]["steps"][number] & {
  state: Extract<
    StackRun["trace"]["steps"][number]["state"],
    { kind: "largest-rectangle-in-histogram" }
  >;
} {
  return step.state.kind === "largest-rectangle-in-histogram";
}

function isMinStackStep(
  step: StackRun["trace"]["steps"][number]
): step is StackRun["trace"]["steps"][number] & {
  state: Extract<StackRun["trace"]["steps"][number]["state"], { kind: "min-stack" }>;
} {
  return step.state.kind === "min-stack";
}

function formatGridCoordinate(cell: number[]): string | null {
  if (cell.length !== 2) {
    return null;
  }

  return `[${cell[0]}, ${cell[1]}]`;
}

function formatIntervalValue(interval: number[]): string {
  if (interval.length !== 2) {
    return "Pending";
  }

  return `[${interval[0]}, ${interval[1]}]`;
}

function formatHeapEntryValue(
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

function hasGridCoordinate(cells: number[][], row: number, column: number): boolean {
  return cells.some((cell) => cell[0] === row && cell[1] === column);
}

function useHashRoute() {
  const [route, setRoute] = useState<AppRoute>(() => parseHashRoute(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHashRoute(window.location.hash));
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  function navigate(nextRoute: AppRoute) {
    const nextHash = buildRouteHref(nextRoute);

    if (window.location.hash === nextHash) {
      setRoute(parseHashRoute(nextHash));
      return;
    }

    window.location.hash = nextHash;
  }

  return { route, navigate };
}

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

  if (isWindowRun(run)) {
    const step = getRunStep(run, stepIndex);

    if (step.state.kind === "longest-substring-without-repeating-characters") {
      if (step.state.bestLength !== null && step.state.bestSubstring.length > 0) {
        return `Best "${step.state.bestSubstring}" · length ${step.state.bestLength}`;
      }

      if (step.state.currentIndex !== null && step.state.currentChar !== null) {
        return `Inspect "${step.state.currentChar}" at char ${step.state.currentIndex}`;
      }

      if (step.state.left !== null && step.state.right !== null) {
        return `Active substring "${step.state.activeSubstring}"`;
      }

      return "Unique window waiting for first character";
    }

    if (
      step.state.bestLength !== null &&
      step.state.bestStart !== null &&
      step.state.bestEnd !== null
    ) {
      return `Best lanes ${step.state.bestStart}-${step.state.bestEnd} · length ${step.state.bestLength}`;
    }

    if (step.state.left !== null && step.state.right !== null) {
      return `Active sum ${step.state.activeSum} across lanes ${step.state.left}-${step.state.right}`;
    }

    return "Target not reached";
  }

  if (isTwoPointersRun(run)) {
    const step = getRunStep(run, stepIndex);

    if (step.state.bestLeft !== null && step.state.bestRight !== null) {
      return `Best walls ${step.state.bestLeft}-${step.state.bestRight} · area ${step.state.bestArea}`;
    }

    if (step.state.left !== null && step.state.right !== null && step.state.currentArea !== null) {
      return `Evaluate walls ${step.state.left}-${step.state.right} · area ${step.state.currentArea}`;
    }

    return "Pointer sweep complete";
  }

  if (isHashRun(run)) {
    const step = getRunStep(run, stepIndex);

    if (step.state.matchedPairValues.length === 2) {
      return `${step.state.matchedPairValues[0]} + ${step.state.matchedPairValues[1]} = ${step.state.target}`;
    }

    if (step.state.currentIndex !== null && step.state.currentValue !== null) {
      return `Inspect index ${step.state.currentIndex} = ${step.state.currentValue}`;
    }

    if (step.state.seenEntries.length > 0) {
      return `${step.state.seenEntries.length} stored lookup entr${step.state.seenEntries.length === 1 ? "y" : "ies"}`;
    }

    return `Target ${step.state.target} awaiting first lookup`;
  }

  if (isHeapRun(run)) {
    const step = getRunStep(run, stepIndex);

    if (step.state.kind === "top-k-frequent-elements") {
      if (step.state.result.length > 0) {
        return `Top ${step.state.k}: ${truncateText(step.state.result.join(", "), 28)}`;
      }

      if (step.state.currentValue !== null && step.state.currentFrequency !== null) {
        return `${step.state.currentValue} × ${step.state.currentFrequency}`;
      }

      if (step.state.candidateEntry) {
        return `Cutoff ${formatHeapEntryValue(step.state.candidateEntry)}`;
      }

      return `Frequency heap ${step.state.heapEntries.length}/${step.state.k}`;
    }

    if (step.state.result !== null) {
      return `${step.state.k}th largest = ${step.state.result}`;
    }

    if (step.state.currentIndex !== null && step.state.currentValue !== null) {
      return `Inspect index ${step.state.currentIndex} = ${step.state.currentValue}`;
    }

    if (step.state.candidateEntry) {
      return `Cutoff ${formatHeapEntryValue(step.state.candidateEntry)}`;
    }

    return `Heap seeding ${step.state.heapEntries.length}/${step.state.k}`;
  }

  if (isIntervalRun(run)) {
    const step = getRunStep(run, stepIndex);

    if (step.state.comparisonInterval.length === 2 && step.state.activeInterval.length === 2) {
      return `Compare ${formatIntervalValue(step.state.activeInterval)} with ${formatIntervalValue(step.state.comparisonInterval)}`;
    }

    if (step.state.activeInterval.length === 2) {
      return `Active span ${formatIntervalValue(step.state.activeInterval)}`;
    }

    if (step.state.mergedIntervals.length > 0) {
      return `${step.state.mergedIntervals.length} merged interval${step.state.mergedIntervals.length === 1 ? "" : "s"}`;
    }

    return `${step.state.orderedIntervals.length} intervals queued`;
  }

  if (isDynamicProgrammingRun(run)) {
    const step = getRunStep(run, stepIndex);
    const activeCoordinate = formatGridCoordinate(step.state.activeCell);

    if (step.state.resultSequence.length > 0) {
      return `LCS "${step.state.resultSequence}" · length ${step.state.resultLength ?? step.state.resultSequence.length}`;
    }

    if (activeCoordinate) {
      return `Cell ${activeCoordinate} = ${step.state.currentValue ?? 0}`;
    }

    if (step.state.resultLength !== null) {
      return `Table complete · length ${step.state.resultLength}`;
    }

    return `Seed ${step.state.left.length + 1} x ${step.state.right.length + 1} matrix`;
  }

  if (isStackRun(run)) {
    const step = getRunStep(run, stepIndex);

    if (isValidParenthesesStackStep(step)) {
      if (step.state.valid === true) {
        return `Validated ${step.state.expression.length} tokens`;
      }

      if (step.state.failureIndex !== null) {
        return `Mismatch at slot ${step.state.failureIndex}`;
      }

      if (step.state.currentChar !== null && step.state.cursor !== null) {
        return `Inspect slot ${step.state.cursor} = ${step.state.currentChar}`;
      }

      if (step.state.stackTokens.length > 0) {
        return `Stack depth ${step.state.stackTokens.length}`;
      }

      return "Awaiting first token";
    }

    if (isDailyTemperaturesStackStep(step)) {
      if (step.state.currentResolvedIndex !== null && step.state.currentWait !== null) {
        return `Resolve day ${step.state.currentResolvedIndex} in ${step.state.currentWait} day${step.state.currentWait === 1 ? "" : "s"}`;
      }

      if (step.state.cursor !== null && step.state.currentTemperature !== null) {
        return `Inspect day ${step.state.cursor} = ${step.state.currentTemperature}°`;
      }

      if (step.state.stackIndices.length > 0) {
        return `${step.state.stackIndices.length} unresolved day${step.state.stackIndices.length === 1 ? "" : "s"}`;
      }

      return "Forecast settled";
    }

    if (isMinStackStep(step)) {
      if (step.state.currentResultType !== null && step.state.currentResultValue !== null) {
        return `${step.state.currentResultType} = ${step.state.currentResultValue}`;
      }

      if (step.state.cursor !== null && step.state.currentOperation !== null) {
        return step.state.currentOperation === "push" && step.state.currentValue !== null
          ? `Inspect op ${step.state.cursor}: push ${step.state.currentValue}`
          : `Inspect op ${step.state.cursor}: ${step.state.currentOperation}`;
      }

      if (step.state.currentMinimum !== null) {
        return `Min = ${step.state.currentMinimum}`;
      }

      if (step.state.stackValues.length > 0) {
        return `${step.state.stackValues.length} stack value${step.state.stackValues.length === 1 ? "" : "s"}`;
      }

      return "Stack empty";
    }

    if (step.state.currentResolvedIndex !== null && step.state.currentArea !== null) {
      return `Resolve area ${step.state.currentArea} from bar ${step.state.currentResolvedIndex}`;
    }

    if (step.state.cursor !== null && step.state.currentHeight !== null) {
      return `Inspect bar ${step.state.cursor} = ${step.state.currentHeight}`;
    }

    if (step.state.bestArea > 0 && step.state.bestStart !== null && step.state.bestEnd !== null) {
      return `Best area ${step.state.bestArea} across ${step.state.bestStart}-${step.state.bestEnd}`;
    }

    if (step.state.stackIndices.length > 0) {
      return `${step.state.stackIndices.length} candidate bar${step.state.stackIndices.length === 1 ? "" : "s"}`;
    }

    return "Histogram settled";
  }

  const step = getRunStep(run, stepIndex);

  if (isGraphRun(run)) {
    if (step.state.kind === "walls-and-gates" && isWallsAndGatesInput(run.input)) {
      if (step.state.fullyReachable === false && step.state.unreachableRooms.length > 0) {
        return `Blocked rooms ${truncateText(step.state.unreachableRooms.join(" · "), 36)}`;
      }

      if (step.state.maxDistance !== null && step.state.fullyReachable === true) {
        return `All rooms filled by distance ${step.state.maxDistance}`;
      }

      if (step.state.current) {
        return `Fill from ${step.state.current}`;
      }

      if (step.state.updatedRooms.length > 0) {
        return `Update ${truncateText(step.state.updatedRooms.join(" · "), 36)}`;
      }

      return `${step.state.remainingRooms.length} room${step.state.remainingRooms.length === 1 ? "" : "s"} still at inf`;
    }

    if (
      (step.state.kind === "number-of-islands" || step.state.kind === "max-area-of-island") &&
      isNumberOfIslandsInput(run.input)
    ) {
      if (step.state.scan) {
        return step.state.kind === "max-area-of-island"
          ? `Scan ${step.state.scan} · max area ${step.state.maxArea}`
          : `Scan ${step.state.scan} · ${step.state.islandCount} island${step.state.islandCount === 1 ? "" : "s"} found`;
      }

      if (step.state.activeIslandId !== null && step.state.current) {
        return step.state.kind === "max-area-of-island"
          ? `Island ${step.state.activeIslandId} · area ${step.state.activeIslandArea}`
          : `Island ${step.state.activeIslandId} · explore ${step.state.current}`;
      }

      if (step.state.completedIslands.length > 0 || step.state.islandCount > 0) {
        return step.state.kind === "max-area-of-island"
          ? `Largest island area ${step.state.maxArea}`
          : `${step.state.islandCount} island${step.state.islandCount === 1 ? "" : "s"} total`;
      }

      return `${step.state.remainingLand.length} land cell${step.state.remainingLand.length === 1 ? "" : "s"} awaiting scan`;
    }

    if (step.state.kind === "island-perimeter" && isNumberOfIslandsInput(run.input)) {
      if (step.state.current && step.state.activeEdge.length > 0) {
        return `Perimeter ${step.state.perimeter} · ${step.state.currentContribution} edge${step.state.currentContribution === 1 ? "" : "s"} on ${step.state.current}`;
      }

      if (step.state.current) {
        return `Account ${step.state.current} · perimeter ${step.state.perimeter}`;
      }

      if (step.state.scan) {
        return `Scan ${step.state.scan} · perimeter ${step.state.perimeter}`;
      }

      return `Perimeter ${step.state.perimeter} total`;
    }

    if (step.state.kind === "rotting-oranges" && isRottingOrangesInput(run.input)) {
      if (step.state.rottable === false && step.state.stalledFresh.length > 0) {
        return `Stalled fresh ${truncateText(step.state.stalledFresh.join(" · "), 36)}`;
      }

      if (step.state.minutesToRotAll !== null) {
        return `All rotten in ${step.state.minutesToRotAll} minute${step.state.minutesToRotAll === 1 ? "" : "s"}`;
      }

      if (step.state.current) {
        return `Minute ${step.state.minute} · spread from ${step.state.current}`;
      }

      return `Minute ${step.state.minute} · ${step.state.fresh.length} fresh left`;
    }

    if (step.state.kind === "count-connected-components") {
      if (step.state.current && step.state.currentRoots.length === 2) {
        return `Components ${step.state.componentCount} · ${step.state.current}`;
      }

      if (step.state.rejectedEdges.length > 0) {
        return `Components ${step.state.componentCount} · ${step.state.rejectedEdges.length} no-op edge${step.state.rejectedEdges.length === 1 ? "" : "s"}`;
      }

      return `${step.state.componentCount} component${step.state.componentCount === 1 ? "" : "s"} total`;
    }

    if (step.state.kind === "course-schedule" && isCourseScheduleInput(run.input)) {
      if (step.state.schedulable === false && step.state.cycleNodes.length > 0) {
        return `Cycle blocks ${step.state.cycleNodes.join(", ")}`;
      }

      if (step.state.order.length > 0) {
        return run.algorithm.id === "course-schedule-ii"
          ? `Returned order ${truncateText(step.state.order.join(" -> "), 36)}`
          : `Order ${truncateText(step.state.order.join(" -> "), 44)}`;
      }

      if (step.state.current) {
        return run.algorithm.id === "course-schedule-ii"
          ? `Place course ${step.state.current}`
          : `Schedule course ${step.state.current}`;
      }

      return run.algorithm.id === "course-schedule-ii"
        ? `${run.input.courseCount} courses awaiting order`
        : `${run.input.courseCount} courses queued for scheduling`;
    }

    if (
      step.state.kind !== "course-schedule" &&
      step.state.kind !== "rotting-oranges" &&
      step.state.kind !== "number-of-islands" &&
      step.state.kind !== "max-area-of-island" &&
      step.state.kind !== "island-perimeter" &&
      step.state.kind !== "walls-and-gates"
    ) {
      if (step.state.path.length > 0) {
        return truncateText(step.state.path.join(" -> "), 56);
      }

      if (step.state.current) {
        return `Current node ${step.state.current}`;
      }

      return "Route pending";
    }
  }

  return "Snapshot ready";
}

function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

function formatMetricValue(value: number | null): string {
  if (value === null) {
    return "n/a";
  }

  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(2);
}

function formatMetricDelta(metric: PersistedComparisonMetric): string {
  if (metric.delta === null) {
    return "No delta";
  }

  const sign = metric.delta > 0 ? "+" : "";
  return `${sign}${formatMetricValue(metric.delta)}`;
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

function getRunSourceFallback(run: ReplayRun): RunSource {
  return {
    label: "Editor trace",
    detail: `Replay rebuilt from the current ${run.algorithm.badge.toLowerCase()} input editor.`
  };
}

function getAlgorithmMetricsLabel(algorithm: ReplayAlgorithm): string {
  switch (algorithm.domain) {
    case "sorting":
      return "Comparisons and writes";
    case "search":
      return "Probes and comparisons";
    case "two-pointers":
      return "Evaluations, moves, and best updates";
    case "window":
      return "Expansions, shrinks, and best updates";
    case "hash":
      return "Inspections, lookups, and stores";
    case "heap":
      return "Inspections, pushes, and pops";
    case "interval":
      return "Overlap checks, merges, and outputs";
    case "dynamic-programming":
      return "Cells, matches, and traceback steps";
    case "stack":
      return "Stack comparisons, pushes, and pops";
    case "graph":
      return "Settled progress, frontier work, and terminal graph outcomes";
    default:
      return "Deterministic replay metrics";
  }
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
          className={`storyboard-card storyboard-card-enter ${
            stop.stepIndex === activeStepIndex ? "storyboard-card-active" : ""
          }`}
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
        : isWindowRun(run)
          ? (() => {
              const windowStep = getRunStep(run, stepIndex);

              if (windowStep.state.kind === "longest-substring-without-repeating-characters") {
                if (windowStep.state.bestLength !== null) {
                  return `Best unique length ${windowStep.state.bestLength}`;
                }

                if (windowStep.state.left !== null && windowStep.state.right !== null) {
                  return `${windowStep.state.right - windowStep.state.left + 1} active chars`;
                }

                return "Window waiting for first unique span";
              }

              if (windowStep.state.bestLength !== null) {
                return `Best window length ${windowStep.state.bestLength}`;
              }

              if (windowStep.state.left !== null && windowStep.state.right !== null) {
                return `${windowStep.state.right - windowStep.state.left + 1} active lanes`;
              }

              return "Window waiting for first hit";
            })()
        : isTwoPointersRun(run)
          ? (() => {
              const twoPointersStep = getRunStep(run, stepIndex);

              if (twoPointersStep.state.bestLeft !== null && twoPointersStep.state.bestRight !== null) {
                return `Best container ${twoPointersStep.state.bestArea} across ${twoPointersStep.state.bestLeft} and ${twoPointersStep.state.bestRight}`;
              }

              if (
                twoPointersStep.state.left !== null &&
                twoPointersStep.state.right !== null &&
                twoPointersStep.state.currentArea !== null
              ) {
                return `Area ${twoPointersStep.state.currentArea} between walls ${twoPointersStep.state.left} and ${twoPointersStep.state.right}`;
              }

              return `${twoPointersStep.state.evaluatedPairs.length} pair evaluations recorded`;
            })()
        : isHashRun(run)
          ? (() => {
              const hashStep = getRunStep(run, stepIndex);

              if (hashStep.state.matchedPairIndices.length === 2) {
                return `Pair locked at ${hashStep.state.matchedPairIndices.join(" and ")}`;
              }

              if (hashStep.state.complementIndex !== null) {
                return `Complement found at index ${hashStep.state.complementIndex}`;
              }

              if (hashStep.state.seenEntries.length > 0) {
                return `${hashStep.state.seenEntries.length} lookup entr${hashStep.state.seenEntries.length === 1 ? "y" : "ies"} stored`;
              }

              return `${hashStep.state.inspectedIndices.length} values inspected`;
            })()
        : isHeapRun(run)
          ? (() => {
              const heapStep = getRunStep(run, stepIndex);

              if (heapStep.state.kind === "top-k-frequent-elements") {
                if (heapStep.state.result.length > 0) {
                  return `Top ${heapStep.state.k} frequent: ${truncateText(heapStep.state.result.join(", "), 24)}`;
                }

                if (heapStep.state.evictedEntry) {
                  return `Evicted ${heapStep.state.evictedEntry.value}`;
                }

                if (heapStep.state.candidateEntry) {
                  return `Cutoff ${heapStep.state.candidateEntry.value} × ${heapStep.state.candidateEntry.frequency}`;
                }

                return `${heapStep.state.heapEntries.length} of ${heapStep.state.k} heap slots filled`;
              }

              if (heapStep.state.result !== null) {
                return `${heapStep.state.k}th largest locked at ${heapStep.state.result}`;
              }

              if (heapStep.state.evictedEntry) {
                return `Evicted ${heapStep.state.evictedEntry.value}`;
              }

              if (heapStep.state.candidateEntry) {
                return `Cutoff ${heapStep.state.candidateEntry.value} at heap root`;
              }

              return `${heapStep.state.heapEntries.length} of ${heapStep.state.k} heap slots filled`;
            })()
        : isIntervalRun(run)
          ? (() => {
              const intervalStep = getRunStep(run, stepIndex);

              if (intervalStep.state.comparisonInterval.length === 2 && intervalStep.state.currentIndex !== null) {
                return `Checking interval ${intervalStep.state.currentIndex}`;
              }

              if (intervalStep.state.activeGroupIndices.length > 0) {
                return `${intervalStep.state.activeGroupIndices.length} interval(s) in the active merge span`;
              }

              return `${intervalStep.state.mergedIntervals.length} merged outputs committed`;
            })()
      : isDynamicProgrammingRun(run)
          ? (() => {
              const dynamicProgrammingStep = getRunStep(run, stepIndex);
              const activeCoordinate = formatGridCoordinate(dynamicProgrammingStep.state.activeCell);

              if (dynamicProgrammingStep.state.resultSequence.length > 0) {
                return `Recovered "${dynamicProgrammingStep.state.resultSequence}"`;
              }

              if (dynamicProgrammingStep.state.resultLength !== null) {
                return `LCS length ${dynamicProgrammingStep.state.resultLength}`;
              }

              if (activeCoordinate) {
                return `Inspecting cell ${activeCoordinate}`;
              }

              return `${dynamicProgrammingStep.state.left.length} by ${dynamicProgrammingStep.state.right.length} character grid`;
            })()
        : isStackRun(run)
          ? (() => {
              const stackStep = getRunStep(run, stepIndex);

              if (isValidParenthesesStackStep(stackStep)) {
                if (stackStep.state.valid === true) {
                  return "Expression validated";
                }

                if (stackStep.state.failureIndex !== null) {
                  return `Mismatch at slot ${stackStep.state.failureIndex}`;
                }

                if (stackStep.state.stackTokens.length > 0) {
                  return `${stackStep.state.stackTokens.length} opener(s) pending`;
                }

                return `${stackStep.state.processedIndices.length} tokens processed`;
              }

              if (isDailyTemperaturesStackStep(stackStep)) {
                if (
                  stackStep.state.currentResolvedIndex !== null &&
                  stackStep.state.currentWait !== null
                ) {
                  return `Resolved day ${stackStep.state.currentResolvedIndex} with wait ${stackStep.state.currentWait}`;
                }

                if (stackStep.state.stackIndices.length > 0) {
                  return `${stackStep.state.stackIndices.length} unresolved day(s) pending`;
                }

                return `${stackStep.state.processedIndices.length} days scanned`;
              }

              if (isMinStackStep(stackStep)) {
                if (
                  stackStep.state.currentResultType !== null &&
                  stackStep.state.currentResultValue !== null
                ) {
                  return `${stackStep.state.currentResultType} = ${stackStep.state.currentResultValue}`;
                }

                if (stackStep.state.currentMinimum !== null) {
                  return `Min ${stackStep.state.currentMinimum}`;
                }

                if (stackStep.state.stackValues.length > 0) {
                  return `${stackStep.state.stackValues.length} value(s) pending`;
                }

                return `${stackStep.state.processedIndices.length} ops scanned`;
              }

              if (
                stackStep.state.currentResolvedIndex !== null &&
                stackStep.state.currentArea !== null
              ) {
                return `Resolved area ${stackStep.state.currentArea} from bar ${stackStep.state.currentResolvedIndex}`;
              }

              if (stackStep.state.bestArea > 0) {
                return `Best area ${stackStep.state.bestArea}`;
              }

              if (stackStep.state.stackIndices.length > 0) {
                return `${stackStep.state.stackIndices.length} candidate bar(s) pending`;
              }

              return `${stackStep.state.processedIndices.length} bars scanned`;
            })()
        : (() => {
            const graphStep = getRunStep(run, stepIndex);

            if (graphStep.state.kind === "number-of-islands") {
              return `${graphStep.state.islandCount} island${graphStep.state.islandCount === 1 ? "" : "s"} discovered`;
            }

            if (graphStep.state.kind === "max-area-of-island") {
              return `Largest island area ${graphStep.state.maxArea}`;
            }

            if (graphStep.state.kind === "island-perimeter") {
              return `Perimeter ${graphStep.state.perimeter}`;
            }

            if (graphStep.state.kind === "rotting-oranges") {
              return `${graphStep.state.fresh.length} fresh cell${graphStep.state.fresh.length === 1 ? "" : "s"} remaining`;
            }

            if (graphStep.state.kind === "course-schedule") {
              return run.algorithm.id === "course-schedule-ii"
                ? `${graphStep.state.order.length} courses in order`
                : `${graphStep.state.order.length} courses scheduled`;
            }

            if (graphStep.state.kind === "count-connected-components") {
              return `${graphStep.state.componentCount} component${graphStep.state.componentCount === 1 ? "" : "s"}`;
            }

            return `${graphStep.state.settled.length} nodes settled`;
          })();

  return (
    <section className="focus-strip" aria-label="Active frame briefing">
      <article className="focus-card focus-card-primary focus-card-motion">
        <p className="card-kicker">Frame Briefing</p>
        <h3>{step.phase}</h3>
        <p className="focus-copy">{step.explanation.summary}</p>
        {step.explanation.details ? <p className="focus-copy">{step.explanation.details}</p> : null}
      </article>
      <article className="focus-card focus-card-motion">
        <span>Snapshot lens</span>
        <strong>{snapshotLabel}</strong>
        <p className="focus-meta">{stateStatus}</p>
      </article>
      <article className="focus-card focus-card-motion">
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

function WindowStage({ run, stepIndex }: { run: WindowRun; stepIndex: number }) {
  const step = getRunStep(run, stepIndex);

  if (step.state.kind === "longest-substring-without-repeating-characters") {
    const activeLeft = step.state.left;
    const activeRight = step.state.right;
    const bestStart = step.state.bestStart;
    const bestEnd = step.state.bestEnd;

    return (
      <>
        <div className="visual-heading">
          <div>
            <p className="eyebrow">Live State</p>
            <h2>{run.algorithm.name} sweep</h2>
          </div>
          <p className="visual-meta">Current phase: {step.phase}</p>
        </div>
        <div className="window-stage">
          <div className="window-banner">
            <span>{Array.from(step.state.text).length} characters</span>
            <strong>
              {activeLeft !== null && activeRight !== null
                ? `Active substring "${step.state.activeSubstring}" across chars ${activeLeft} through ${activeRight}`
                : "Window collapsed between expansions"}
            </strong>
            <p>
              {step.state.bestLength !== null && step.state.bestSubstring.length > 0
                ? `Best unique substring: "${step.state.bestSubstring}" at length ${step.state.bestLength}`
                : "No unique substring recorded yet"}
            </p>
          </div>
          <div className="window-grid">
            {Array.from(step.state.text).map((char, index) => {
              const isActive =
                activeLeft !== null &&
                activeRight !== null &&
                index >= activeLeft &&
                index <= activeRight;
              const isBest =
                bestStart !== null &&
                bestEnd !== null &&
                index >= bestStart &&
                index <= bestEnd;
              const isCurrent = step.state.currentIndex === index;
              const isDuplicate =
                step.state.duplicateChar !== null &&
                (step.state.duplicateIndex === index || step.state.currentIndex === index);
              const className = [
                "window-cell",
                isActive ? "window-cell-active" : "",
                isCurrent || isDuplicate ? "window-cell-candidate" : "",
                isBest ? "window-cell-best" : "",
                activeLeft === index || activeRight === index ? "window-cell-edge" : ""
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div className={className} key={`${index}-${char}`}>
                  <span className="window-cell-index">{index}</span>
                  <strong className="window-cell-value">{char}</strong>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mini-grid">
          <div className="mini-card">
            <span>Active window</span>
            <strong>
              {activeLeft !== null && activeRight !== null
                ? `${activeLeft} to ${activeRight}`
                : "Collapsed"}
            </strong>
          </div>
          <div className="mini-card">
            <span>Current char</span>
            <strong>
              {step.state.currentIndex !== null && step.state.currentChar !== null
                ? `${step.state.currentChar} @ ${step.state.currentIndex}`
                : "Waiting"}
            </strong>
          </div>
          <div className="mini-card">
            <span>Best substring</span>
            <strong>
              {step.state.bestLength !== null && step.state.bestSubstring.length > 0
                ? `"${step.state.bestSubstring}" (${step.state.bestLength})`
                : "Pending"}
            </strong>
          </div>
        </div>
      </>
    );
  }

  const activeLeft = step.state.left;
  const activeRight = step.state.right;
  const bestStart = step.state.bestStart;
  const bestEnd = step.state.bestEnd;

  return (
    <>
      <div className="visual-heading">
        <div>
          <p className="eyebrow">Live State</p>
          <h2>{run.algorithm.name} sweep</h2>
        </div>
        <p className="visual-meta">Current phase: {step.phase}</p>
      </div>
      <div className="window-stage">
        <div className="window-banner">
          <span>Target {step.state.target}</span>
          <strong>
            {activeLeft !== null && activeRight !== null
              ? `Active sum ${step.state.activeSum} across lanes ${activeLeft} through ${activeRight}`
              : "Window collapsed between expansions"}
          </strong>
          <p>
            {bestStart !== null && bestEnd !== null && step.state.bestLength !== null
              ? `Best hit: lanes ${bestStart} through ${bestEnd} at length ${step.state.bestLength}`
              : "No qualifying window recorded yet"}
          </p>
        </div>
        <div className="window-grid">
          {step.state.array.map((value, index) => {
            const isActive =
              activeLeft !== null &&
              activeRight !== null &&
              index >= activeLeft &&
              index <= activeRight;
            const isBest =
              bestStart !== null &&
              bestEnd !== null &&
              index >= bestStart &&
              index <= bestEnd;
            const isLeftEdge = activeLeft === index;
            const isRightEdge = activeRight === index;
            const className = [
              "window-cell",
              isActive ? "window-cell-active" : "",
              step.state.candidateSatisfied && isActive ? "window-cell-candidate" : "",
              isBest ? "window-cell-best" : "",
              isLeftEdge || isRightEdge ? "window-cell-edge" : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div className={className} key={`${index}-${value}`}>
                <span className="window-cell-index">{index}</span>
                <strong className="window-cell-value">{value}</strong>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mini-grid">
        <div className="mini-card">
          <span>Active window</span>
          <strong>
            {activeLeft !== null && activeRight !== null
              ? `${activeLeft} to ${activeRight}`
              : "Collapsed"}
          </strong>
        </div>
        <div className="mini-card">
          <span>Active sum</span>
          <strong>{step.state.activeSum}</strong>
        </div>
        <div className="mini-card">
          <span>Best length</span>
          <strong>{step.state.bestLength !== null ? step.state.bestLength : "Pending"}</strong>
        </div>
      </div>
    </>
  );
}

function DynamicProgrammingStage({
  run,
  stepIndex
}: {
  run: DynamicProgrammingRun;
  stepIndex: number;
}) {
  const step = getRunStep(run, stepIndex);
  const activeCoordinate = formatGridCoordinate(step.state.activeCell);
  const resultLabel =
    step.state.resultSequence.length > 0
      ? `"${step.state.resultSequence}" · length ${step.state.resultLength ?? step.state.resultSequence.length}`
      : step.state.resultLength !== null
        ? `Length ${step.state.resultLength}`
        : "Pending";

  return (
    <>
      <div className="visual-heading">
        <div>
          <p className="eyebrow">Live State</p>
          <h2>{run.algorithm.name} table</h2>
        </div>
        <p className="visual-meta">Current phase: {step.phase}</p>
      </div>
      <div className="dp-stage">
        <div className="dp-banner">
          <span>
            Left {step.state.left.length} chars · Right {step.state.right.length} chars
          </span>
          <strong>
            {activeCoordinate
              ? `Cell ${activeCoordinate} = ${step.state.currentValue ?? 0}`
              : step.state.resultSequence.length > 0
                ? `Recovered LCS ${resultLabel}`
                : step.state.resultLength !== null
                  ? `Completed table with LCS length ${step.state.resultLength}`
                  : "Boundary conditions seeded for row-major table fill"}
          </strong>
          <p>
            {step.state.tracebackPath.length > 0
              ? `${step.state.tracebackPath.length} traceback cells are recorded in the recovery path.`
              : step.state.dependencyCells.length > 0
                ? `${step.state.dependencyCells.length} predecessor ${
                    step.state.dependencyCells.length === 1 ? "cell" : "cells"
                  } inform the current recurrence.`
                : "The zero row and zero column remain fixed so every later frame can be restored directly."}
          </p>
        </div>
        <div className="dp-table-shell">
          <table className="dp-table">
            <thead>
              <tr>
                <th className="dp-cell dp-cell-header" scope="col">
                  Row
                </th>
                {["Ø", ...step.state.right.split("")].map((label, columnIndex) => (
                  <th className="dp-cell dp-cell-header" key={`dp-col-${columnIndex}`} scope="col">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {step.state.table.map((rowValues, rowIndex) => (
                <tr key={`dp-row-${rowIndex}`}>
                  <th className="dp-cell dp-cell-header" scope="row">
                    {rowIndex === 0 ? "Ø" : step.state.left[rowIndex - 1]}
                  </th>
                  {rowValues.map((value, columnIndex) => {
                    const isActive =
                      step.state.activeCell[0] === rowIndex &&
                      step.state.activeCell[1] === columnIndex;
                    const isDependency = hasGridCoordinate(
                      step.state.dependencyCells,
                      rowIndex,
                      columnIndex
                    );
                    const isTrace = hasGridCoordinate(
                      step.state.tracebackPath,
                      rowIndex,
                      columnIndex
                    );
                    const isMatchCell =
                      rowIndex > 0 &&
                      columnIndex > 0 &&
                      step.state.left[rowIndex - 1] === step.state.right[columnIndex - 1] &&
                      (isTrace || (isActive && step.state.matching));
                    const className = [
                      "dp-cell",
                      isActive ? "dp-cell-active" : "",
                      isDependency ? "dp-cell-dependency" : "",
                      isTrace ? "dp-cell-trace" : "",
                      isMatchCell ? "dp-cell-match" : ""
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <td className={className} key={`dp-value-${rowIndex}-${columnIndex}`}>
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mini-grid">
        <div className="mini-card">
          <span>Active cell</span>
          <strong>{activeCoordinate ?? "None"}</strong>
        </div>
        <div className="mini-card">
          <span>Current value</span>
          <strong>{step.state.currentValue !== null ? step.state.currentValue : "Waiting"}</strong>
        </div>
        <div className="mini-card">
          <span>Result</span>
          <strong>{resultLabel}</strong>
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
    return <SortingStage density="detailed" run={run} stepIndex={stepIndex} />;
  }

  if (isSearchRun(run)) {
    return <SearchStage run={run} stepIndex={stepIndex} />;
  }

  if (isWindowRun(run)) {
    return <WindowStage run={run} stepIndex={stepIndex} />;
  }

  if (isTwoPointersRun(run)) {
    return <TwoPointersStage run={run} stepIndex={stepIndex} />;
  }

  if (isHashRun(run)) {
    return <HashStage run={run} stepIndex={stepIndex} />;
  }

  if (isHeapRun(run)) {
    return <HeapStage run={run} stepIndex={stepIndex} />;
  }

  if (isIntervalRun(run)) {
    return <IntervalStage run={run} stepIndex={stepIndex} />;
  }

  if (isDynamicProgrammingRun(run)) {
    return <DynamicProgrammingStage run={run} stepIndex={stepIndex} />;
  }

  if (isStackRun(run)) {
    return <StackStage run={run} stepIndex={stepIndex} />;
  }

  return <GraphStage run={run} stepIndex={stepIndex} />;
}

function renderStateSnapshot(run: ReplayRun, stepIndex: number) {
  if (isGraphRun(run)) {
    const step = getRunStep(run, stepIndex);

    if (step.state.kind === "walls-and-gates" && isWallsAndGatesInput(run.input)) {
      return (
        <>
          <div className="search-summary-grid">
            <div className="distance-row">
              <span>Frontier</span>
              <strong>{step.state.frontier.length}</strong>
            </div>
            <div className="distance-row">
              <span>Remaining</span>
              <strong>{step.state.remainingRooms.length}</strong>
            </div>
            <div className="distance-row">
              <span>Updated</span>
              <strong>{step.state.updatedRooms.length}</strong>
            </div>
            <div className="distance-row">
              <span>Outcome</span>
              <strong>
                {step.state.fullyReachable === null
                  ? "Filling"
                  : step.state.fullyReachable
                    ? `Max ${step.state.maxDistance ?? 0}`
                    : "Stalled"}
              </strong>
            </div>
          </div>
          <div className="number-grid">
            {step.state.grid.map((row, rowIndex) => (
              <span className="number-pill" key={`gate-row-${rowIndex}`}>
                {rowIndex}:
                {row
                  .map((value) =>
                    value === 2147483647 ? "inf" : value === -1 ? "wall" : value.toString()
                  )
                  .join(" ")}
              </span>
            ))}
          </div>
        </>
      );
    }

    if (
      (step.state.kind === "number-of-islands" || step.state.kind === "max-area-of-island") &&
      isNumberOfIslandsInput(run.input)
    ) {
      return (
        <>
          <div className="search-summary-grid">
            <div className="distance-row">
              <span>{step.state.kind === "max-area-of-island" ? "Max area" : "Islands"}</span>
              <strong>
                {step.state.kind === "max-area-of-island"
                  ? step.state.maxArea
                  : step.state.islandCount}
              </strong>
            </div>
            <div className="distance-row">
              <span>Frontier</span>
              <strong>{step.state.frontier.length}</strong>
            </div>
            <div className="distance-row">
              <span>{step.state.kind === "max-area-of-island" ? "Active area" : "Remaining land"}</span>
              <strong>
                {step.state.kind === "max-area-of-island"
                  ? step.state.activeIslandArea
                  : step.state.remainingLand.length}
              </strong>
            </div>
            <div className="distance-row">
              <span>Scan</span>
              <strong>{step.state.scan ?? step.state.current ?? "Complete"}</strong>
            </div>
          </div>
          <div className="number-grid">
            {step.state.grid.map((row, rowIndex) => (
              <span className="number-pill" key={`island-row-${rowIndex}`}>
                {rowIndex}:{row.join("")}
              </span>
            ))}
          </div>
        </>
      );
    }

    if (step.state.kind === "island-perimeter" && isNumberOfIslandsInput(run.input)) {
      return (
        <>
          <div className="search-summary-grid">
            <div className="distance-row">
              <span>Perimeter</span>
              <strong>{step.state.perimeter}</strong>
            </div>
            <div className="distance-row">
              <span>Pending land</span>
              <strong>{step.state.remainingLand.length}</strong>
            </div>
            <div className="distance-row">
              <span>Current edges</span>
              <strong>{step.state.currentContribution}</strong>
            </div>
            <div className="distance-row">
              <span>Scan</span>
              <strong>{step.state.current ?? step.state.scan ?? "Complete"}</strong>
            </div>
          </div>
          <div className="number-grid">
            {step.state.grid.map((row, rowIndex) => (
              <span className="number-pill" key={`perimeter-row-${rowIndex}`}>
                {rowIndex}:{row.join("")}
              </span>
            ))}
          </div>
        </>
      );
    }

    if (step.state.kind === "rotting-oranges" && isRottingOrangesInput(run.input)) {
      return (
        <>
          <div className="search-summary-grid">
            <div className="distance-row">
              <span>Minute</span>
              <strong>{step.state.minute}</strong>
            </div>
            <div className="distance-row">
              <span>Frontier</span>
              <strong>{step.state.frontier.length}</strong>
            </div>
            <div className="distance-row">
              <span>Fresh</span>
              <strong>{step.state.fresh.length}</strong>
            </div>
            <div className="distance-row">
              <span>Outcome</span>
              <strong>
                {step.state.rottable === null
                  ? "Spreading"
                  : step.state.rottable
                    ? `${step.state.minutesToRotAll} min`
                    : "Stalled"}
              </strong>
            </div>
          </div>
          <div className="number-grid">
            {step.state.grid.map((row, rowIndex) => (
              <span className="number-pill" key={`orange-row-${rowIndex}`}>
                {rowIndex}:{row.join(" ")}
              </span>
            ))}
          </div>
        </>
      );
    }

    if (step.state.kind === "course-schedule" && isCourseScheduleInput(run.input)) {
      const isCourseOrderRun = run.algorithm.id === "course-schedule-ii";

      return (
        <>
          <div className="search-summary-grid">
            <div className="distance-row">
              <span>Courses</span>
              <strong>{run.input.courseCount}</strong>
            </div>
            <div className="distance-row">
              <span>Ready queue</span>
              <strong>{step.state.frontier.length}</strong>
            </div>
            <div className="distance-row">
              <span>{isCourseOrderRun ? "Returned order" : "Committed"}</span>
              <strong>{step.state.order.length}</strong>
            </div>
            <div className="distance-row">
              <span>Outcome</span>
              <strong>
                {step.state.schedulable === null
                  ? isCourseOrderRun
                    ? "Ordering"
                    : "Scheduling"
                  : step.state.schedulable
                    ? isCourseOrderRun
                      ? "Order ready"
                      : "Schedulable"
                    : "Cycle"}
              </strong>
            </div>
          </div>
          <div className="distance-grid">
            {Array.from({ length: run.input.courseCount }, (_, index) => `${index}`).map((course) => (
              <div className="distance-row" key={course}>
                <span>Course {course}</span>
                <strong>in {step.state.indegrees[course] ?? 0}</strong>
              </div>
            ))}
          </div>
        </>
      );
    }

    if (step.state.kind === "count-connected-components") {
      return (
        <>
          <div className="search-summary-grid">
            <div className="distance-row">
              <span>Nodes</span>
              <strong>{step.state.nodeCount}</strong>
            </div>
            <div className="distance-row">
              <span>Pending edges</span>
              <strong>{step.state.frontier.length}</strong>
            </div>
            <div className="distance-row">
              <span>Components</span>
              <strong>{step.state.componentCount}</strong>
            </div>
            <div className="distance-row">
              <span>No-op edges</span>
              <strong>{step.state.rejectedEdges.length}</strong>
            </div>
          </div>
          <div className="distance-grid">
            {Array.from({ length: step.state.nodeCount }, (_, index) => `${index}`).map((node) => (
              <div className="distance-row" key={node}>
                <span>Node {node}</span>
                <strong>p {step.state.parents[node]} · r {step.state.ranks[node]}</strong>
              </div>
            ))}
          </div>
        </>
      );
    }

    return (
      <div className="distance-grid">
        {Object.entries(
          step.state.kind === "course-schedule" ||
            step.state.kind === "number-of-islands" ||
            step.state.kind === "max-area-of-island" ||
            step.state.kind === "island-perimeter" ||
            step.state.kind === "walls-and-gates"
            ? {}
            : step.state.distances
        ).map(
          ([node, distance]) => (
            <div className="distance-row" key={node}>
              <span>{node}</span>
              <strong>{formatDistance(distance)}</strong>
            </div>
          )
        )}
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

  if (isWindowRun(run)) {
    const step = getRunStep(run, stepIndex);

    if (step.state.kind === "longest-substring-without-repeating-characters") {
      return (
        <>
          <div className="search-summary-grid">
            <div className="distance-row">
              <span>Chars</span>
              <strong>{Array.from(step.state.text).length}</strong>
            </div>
            <div className="distance-row">
              <span>Current</span>
              <strong>
                {step.state.currentIndex !== null && step.state.currentChar !== null
                  ? `${step.state.currentIndex}:${step.state.currentChar}`
                  : "Waiting"}
              </strong>
            </div>
            <div className="distance-row">
              <span>Window</span>
              <strong>
                {step.state.left !== null && step.state.right !== null
                  ? `${step.state.left} to ${step.state.right}`
                  : "Collapsed"}
              </strong>
            </div>
            <div className="distance-row">
              <span>Best</span>
              <strong>
                {step.state.bestLength !== null && step.state.bestSubstring.length > 0
                  ? `"${step.state.bestSubstring}" (${step.state.bestLength})`
                  : "None"}
              </strong>
            </div>
          </div>
          <div className="number-grid">
            {Array.from(step.state.text).map((char, index) => (
              <span className="number-pill" key={`${char}-${index}`}>
                {index}:{char}
              </span>
            ))}
          </div>
        </>
      );
    }

    return (
      <>
        <div className="search-summary-grid">
          <div className="distance-row">
            <span>Target</span>
            <strong>{step.state.target}</strong>
          </div>
          <div className="distance-row">
            <span>Active sum</span>
            <strong>{step.state.activeSum}</strong>
          </div>
          <div className="distance-row">
            <span>Window</span>
            <strong>
              {step.state.left !== null && step.state.right !== null
                ? `${step.state.left} to ${step.state.right}`
                : "Collapsed"}
            </strong>
          </div>
          <div className="distance-row">
            <span>Best</span>
            <strong>
              {step.state.bestStart !== null &&
              step.state.bestEnd !== null &&
              step.state.bestLength !== null
                ? `${step.state.bestStart}-${step.state.bestEnd} (${step.state.bestLength})`
                : "None"}
            </strong>
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

  if (isHashRun(run)) {
    const step = getRunStep(run, stepIndex);

    return (
      <>
        <div className="search-summary-grid">
          <div className="distance-row">
            <span>Target</span>
            <strong>{step.state.target}</strong>
          </div>
          <div className="distance-row">
            <span>Current</span>
            <strong>
              {step.state.currentIndex !== null && step.state.currentValue !== null
                ? `${step.state.currentIndex}:${step.state.currentValue}`
                : "Waiting"}
            </strong>
          </div>
          <div className="distance-row">
            <span>Complement</span>
            <strong>{step.state.complement !== null ? step.state.complement : "Waiting"}</strong>
          </div>
          <div className="distance-row">
            <span>Pair</span>
            <strong>
              {step.state.matchedPairIndices.length === 2
                ? step.state.matchedPairIndices.join("-")
                : "Pending"}
            </strong>
          </div>
        </div>
        <div className="number-grid">
          {step.state.seenEntries.length > 0 ? (
            step.state.seenEntries.map((entry) => (
              <span className="number-pill" key={`hash-pill-${entry.index}`}>
                {entry.value}@{entry.index}
              </span>
            ))
          ) : (
            step.state.array.map((value, index) => (
              <span className="number-pill" key={`hash-array-pill-${index}`}>
                {index}:{value}
              </span>
            ))
          )}
        </div>
      </>
    );
  }

  if (isHeapRun(run)) {
    const step = getRunStep(run, stepIndex);

    if (step.state.kind === "top-k-frequent-elements") {
      return (
        <>
          <div className="search-summary-grid">
            <div className="distance-row">
              <span>k</span>
              <strong>{step.state.k}</strong>
            </div>
            <div className="distance-row">
              <span>Current</span>
              <strong>
                {step.state.currentValue !== null && step.state.currentFrequency !== null
                  ? `${step.state.currentValue} × ${step.state.currentFrequency}`
                  : "Waiting"}
              </strong>
            </div>
            <div className="distance-row">
              <span>Cutoff</span>
              <strong>{formatHeapEntryValue(step.state.candidateEntry)}</strong>
            </div>
            <div className="distance-row">
              <span>Result</span>
              <strong>
                {step.state.result.length > 0 ? step.state.result.join(", ") : "Pending"}
              </strong>
            </div>
          </div>
          <div className="number-grid">
            {step.state.rankedEntries.length > 0 ? (
              step.state.rankedEntries.map((entry) => (
                <span className="number-pill" key={`heap-ranked-pill-${entry.value}`}>
                  {entry.value}×{entry.frequency}
                </span>
              ))
            ) : (
              step.state.array.map((value, index) => (
                <span className="number-pill" key={`heap-array-pill-${index}`}>
                  {index}:{value}
                </span>
              ))
            )}
          </div>
        </>
      );
    }

    return (
      <>
        <div className="search-summary-grid">
          <div className="distance-row">
            <span>k</span>
            <strong>{step.state.k}</strong>
          </div>
          <div className="distance-row">
            <span>Current</span>
            <strong>
              {step.state.currentIndex !== null && step.state.currentValue !== null
                ? `${step.state.currentIndex}:${step.state.currentValue}`
                : "Waiting"}
            </strong>
          </div>
          <div className="distance-row">
            <span>Cutoff</span>
            <strong>{formatHeapEntryValue(step.state.candidateEntry)}</strong>
          </div>
          <div className="distance-row">
            <span>Result</span>
            <strong>{step.state.result !== null ? step.state.result : "Pending"}</strong>
          </div>
        </div>
        <div className="number-grid">
          {step.state.rankedEntries.length > 0 ? (
            step.state.rankedEntries.map((entry) => (
              <span className="number-pill" key={`heap-ranked-pill-${entry.index}`}>
                {entry.value}@{entry.index}
              </span>
            ))
          ) : (
            step.state.array.map((value, index) => (
              <span className="number-pill" key={`heap-array-pill-${index}`}>
                {index}:{value}
              </span>
            ))
          )}
        </div>
      </>
    );
  }

  if (isTwoPointersRun(run)) {
    const step = getRunStep(run, stepIndex);

    return (
      <>
        {step.state.kind === "container-with-most-water" ? (
          <div className="search-summary-grid">
            <div className="distance-row">
              <span>Active pair</span>
              <strong>
                {step.state.left !== null && step.state.right !== null
                  ? `${step.state.left}-${step.state.right}`
                  : "Complete"}
              </strong>
            </div>
            <div className="distance-row">
              <span>Current area</span>
              <strong>{step.state.currentArea !== null ? step.state.currentArea : "Waiting"}</strong>
            </div>
            <div className="distance-row">
              <span>Best area</span>
              <strong>{step.state.bestArea}</strong>
            </div>
            <div className="distance-row">
              <span>Best pair</span>
              <strong>
                {step.state.bestLeft !== null && step.state.bestRight !== null
                  ? `${step.state.bestLeft}-${step.state.bestRight}`
                  : "Pending"}
              </strong>
            </div>
          </div>
        ) : (
          <div className="search-summary-grid">
            <div className="distance-row">
              <span>Active pair</span>
              <strong>
                {step.state.left !== null && step.state.right !== null
                  ? `${step.state.left}-${step.state.right}`
                  : "Complete"}
              </strong>
            </div>
            <div className="distance-row">
              <span>Boundary maxima</span>
              <strong>
                {step.state.leftMax !== null && step.state.rightMax !== null
                  ? `${step.state.leftMax} / ${step.state.rightMax}`
                  : "Complete"}
              </strong>
            </div>
            <div className="distance-row">
              <span>Current fill</span>
              <strong>
                {step.state.currentFillAmount !== null && step.state.currentFillIndex !== null
                  ? `+${step.state.currentFillAmount} @ ${step.state.currentFillIndex}`
                  : "Waiting"}
              </strong>
            </div>
            <div className="distance-row">
              <span>Total water</span>
              <strong>{step.state.totalWater}</strong>
            </div>
          </div>
        )}
        <div className="number-grid">
          {step.state.kind === "container-with-most-water"
            ? step.state.heights.map((value, index) => (
                <span className="number-pill" key={`two-pointers-pill-${index}`}>
                  {index}:{value}
                </span>
              ))
            : step.state.heights.map((value, index) => (
                <span className="number-pill" key={`two-pointers-pill-${index}`}>
                  {index}:{value}
                  {step.state.waterByIndex[index]! > 0
                    ? ` (+${step.state.waterByIndex[index]})`
                    : ""}
                </span>
              ))}
        </div>
      </>
    );
  }

  if (isIntervalRun(run)) {
    const step = getRunStep(run, stepIndex);

    return (
      <>
        <div className="search-summary-grid">
          <div className="distance-row">
            <span>Active span</span>
            <strong>{formatIntervalValue(step.state.activeInterval)}</strong>
          </div>
          <div className="distance-row">
            <span>Current compare</span>
            <strong>{formatIntervalValue(step.state.comparisonInterval)}</strong>
          </div>
          <div className="distance-row">
            <span>Overlap</span>
            <strong>{formatIntervalValue(step.state.overlapRange)}</strong>
          </div>
          <div className="distance-row">
            <span>Outputs</span>
            <strong>{step.state.mergedIntervals.length}</strong>
          </div>
        </div>
        <div className="number-grid">
          {step.state.mergedIntervals.length > 0
            ? step.state.mergedIntervals.map((interval, index) => (
                <span className="number-pill" key={`interval-output-${index}`}>
                  {formatIntervalValue(interval)}
                </span>
              ))
            : step.state.orderedIntervals.map((interval, index) => (
                <span className="number-pill" key={`interval-pill-${index}`}>
                  {index}:{formatIntervalValue(interval)}
                </span>
              ))}
        </div>
      </>
    );
  }

  if (isDynamicProgrammingRun(run)) {
    const step = getRunStep(run, stepIndex);
    const activeCoordinate = formatGridCoordinate(step.state.activeCell);

    return (
      <>
        <div className="search-summary-grid">
          <div className="distance-row">
            <span>Active cell</span>
            <strong>{activeCoordinate ?? "None"}</strong>
          </div>
          <div className="distance-row">
            <span>Current value</span>
            <strong>{step.state.currentValue !== null ? step.state.currentValue : "Waiting"}</strong>
          </div>
          <div className="distance-row">
            <span>Result length</span>
            <strong>{step.state.resultLength !== null ? step.state.resultLength : "Pending"}</strong>
          </div>
          <div className="distance-row">
            <span>Sequence</span>
            <strong>{step.state.resultSequence || "Pending"}</strong>
          </div>
        </div>
        <div className="number-grid">
          <span className="number-pill">Left: {step.state.left}</span>
          <span className="number-pill">Right: {step.state.right}</span>
          <span className="number-pill">Traceback cells: {step.state.tracebackPath.length}</span>
          <span className="number-pill">
            Dependencies: {step.state.dependencyCells.length}
          </span>
        </div>
      </>
    );
  }

  if (isStackRun(run)) {
    const step = getRunStep(run, stepIndex);

    if (isMinStackStep(step)) {
      return (
        <>
          <div className="search-summary-grid">
            <div className="distance-row">
              <span>Current op</span>
              <strong>
                {step.state.cursor !== null && step.state.currentOperation !== null
                  ? step.state.currentOperation === "push" && step.state.currentValue !== null
                    ? `${step.state.cursor}:push ${step.state.currentValue}`
                    : `${step.state.cursor}:${step.state.currentOperation}`
                  : "Done"}
              </strong>
            </div>
            <div className="distance-row">
              <span>Current min</span>
              <strong>{step.state.currentMinimum !== null ? step.state.currentMinimum : "None"}</strong>
            </div>
            <div className="distance-row">
              <span>Stack depth</span>
              <strong>{step.state.stackValues.length}</strong>
            </div>
            <div className="distance-row">
              <span>Latest result</span>
              <strong>
                {step.state.currentResultType !== null && step.state.currentResultValue !== null
                  ? `${step.state.currentResultType}:${step.state.currentResultValue}`
                  : "Waiting"}
              </strong>
            </div>
          </div>
          <div className="number-grid">
            {step.state.operations.map((operation, index) => (
              <span className="number-pill" key={`stack-min-op-pill-${index}`}>
                {index}:{operation.type}
                {operation.type === "push" ? ` ${operation.value}` : ""}
              </span>
            ))}
          </div>
        </>
      );
    }

    if (isDailyTemperaturesStackStep(step)) {
      const resolvedCount = step.state.resolvedWaits.filter((wait) => wait > 0).length;

      return (
        <>
          <div className="search-summary-grid">
            <div className="distance-row">
              <span>Current day</span>
              <strong>
                {step.state.cursor !== null && step.state.currentTemperature !== null
                  ? `${step.state.cursor}:${step.state.currentTemperature}°`
                  : "Done"}
              </strong>
            </div>
            <div className="distance-row">
              <span>Comparison day</span>
              <strong>
                {step.state.comparisonIndex !== null
                  ? `Day ${step.state.comparisonIndex}`
                  : "None"}
              </strong>
            </div>
            <div className="distance-row">
              <span>Unresolved stack</span>
              <strong>{step.state.stackIndices.length}</strong>
            </div>
            <div className="distance-row">
              <span>Resolved waits</span>
              <strong>{resolvedCount}</strong>
            </div>
          </div>
          <div className="number-grid">
            {step.state.temperatures.map((temperature, index) => (
              <span className="number-pill" key={`stack-temperature-pill-${index}`}>
                {index}:{temperature}°/{step.state.resolvedWaits[index]}
              </span>
            ))}
          </div>
        </>
      );
    }

    if (isLargestRectangleStackStep(step)) {
      return (
        <>
          <div className="search-summary-grid">
            <div className="distance-row">
              <span>Current bar</span>
              <strong>
                {step.state.cursor !== null && step.state.currentHeight !== null
                  ? `${step.state.cursor}:${step.state.currentHeight}`
                  : "Done"}
              </strong>
            </div>
            <div className="distance-row">
              <span>Comparison bar</span>
              <strong>
                {step.state.comparisonIndex !== null
                  ? `Bar ${step.state.comparisonIndex}`
                  : "None"}
              </strong>
            </div>
            <div className="distance-row">
              <span>Candidate stack</span>
              <strong>{step.state.stackIndices.length}</strong>
            </div>
            <div className="distance-row">
              <span>Best area</span>
              <strong>{step.state.bestArea}</strong>
            </div>
          </div>
          <div className="number-grid">
            {step.state.heights.map((height, index) => (
              <span className="number-pill" key={`stack-histogram-pill-${index}`}>
                {index}:{height}
              </span>
            ))}
          </div>
        </>
      );
    }

    return (
      <>
        <div className="search-summary-grid">
          <div className="distance-row">
            <span>Current token</span>
            <strong>
              {step.state.currentChar !== null && step.state.cursor !== null
                ? `${step.state.cursor}:${step.state.currentChar}`
                : "None"}
            </strong>
          </div>
          <div className="distance-row">
            <span>Expected closer</span>
            <strong>{step.state.expectedCloser ?? "None"}</strong>
          </div>
          <div className="distance-row">
            <span>Stack depth</span>
            <strong>{step.state.stackTokens.length}</strong>
          </div>
          <div className="distance-row">
            <span>Verdict</span>
            <strong>
              {step.state.valid === null ? "Pending" : step.state.valid ? "Valid" : "Invalid"}
            </strong>
          </div>
        </div>
        <div className="number-grid">
          {step.state.expression.split("").map((token, index) => (
            <span className="number-pill" key={`stack-pill-${index}`}>
              {index}:{token}
            </span>
          ))}
        </div>
      </>
    );
  }

  if (isSortingRun(run)) {
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

  return null;
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
            <article
              className={`sync-card sync-card-motion ${getAccentClass(run.algorithm.accent)}`}
              key={run.algorithm.id}
            >
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
              <SortingStage density="compact" run={run} stepIndex={stepIndex} />
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
                <span>
                  {metric.direction === "lower-is-better"
                    ? "Lower is better"
                    : metric.direction === "higher-is-better"
                      ? "Higher is better"
                      : "Track side by side"}
                </span>
              </div>
              <svg
                aria-label={`${metric.label} trend`}
                className="trend-chart"
                role="img"
                viewBox="0 0 240 110"
              >
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

function ProductNav({
  route,
  status,
  foundation
}: {
  route: AppRoute;
  status: DataStatus;
  foundation: FoundationResponse | null;
}) {
  return (
    <header className="product-nav panel">
      <div className="product-nav-brand">
        <a className="product-wordmark" href={buildRouteHref({ page: "overview" })}>
          <span className="product-wordmark-mark">TraceDeck</span>
          <strong>{foundation?.product ?? "Algorithm Replay"}</strong>
        </a>
        <p className="product-nav-copy">
          Local tool for replaying traces, checking reference notes, and reopening saved runs.
        </p>
      </div>
      <nav aria-label="Primary" className="product-nav-links">
        {navigationSurfaces.map((surface) => (
          <a
            className={`product-nav-link ${isRouteActive(route, surface.page) ? "product-nav-link-active" : ""}`}
            href={buildRouteHref(
              surface.page === "playground"
                ? { page: "playground", algorithmId: assuredDefaultAlgorithm.id }
                : { page: surface.page }
            )}
            key={surface.page}
          >
            <span>{surface.label}</span>
            <strong>{surface.title}</strong>
          </a>
        ))}
      </nav>
      <div className="product-nav-status">
        <span className={`status-chip status-chip--${status}`}>
          {status === "ready"
            ? "API connected"
            : status === "offline"
              ? "API offline"
              : "Loading"}
        </span>
        <span className="status-chip status-chip--accent">
          {route.page === "algorithm-detail"
            ? "Reference"
            : route.page === "playground"
              ? "Replay"
              : route.page.charAt(0).toUpperCase() + route.page.slice(1)}
        </span>
      </div>
    </header>
  );
}

function WorkspaceHeader({
  eyebrow,
  title,
  summary,
  actions,
  details,
  className
}: {
  eyebrow: string;
  title: string;
  summary: string;
  actions?: ReactNode;
  details: Array<{
    label: string;
    value: string;
    detail?: string;
  }>;
  className?: string;
}) {
  return (
    <section className={className ? `workspace-header ${className}` : "workspace-header"}>
      <div className="workspace-header-main">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
        <p className="panel-copy workspace-header-copy">{summary}</p>
      </div>
      <div className="workspace-header-meta">
        {details.map((detail) => (
          <div className="workspace-header-detail" key={detail.label}>
            <span>{detail.label}</span>
            <strong>{detail.value}</strong>
            {detail.detail ? <p className="workspace-header-note">{detail.detail}</p> : null}
          </div>
        ))}
      </div>
      {actions ? <div className="workspace-header-actions">{actions}</div> : null}
    </section>
  );
}

function TransportPanel({
  mode,
  isPlaying,
  speedId,
  primaryValue,
  secondaryValue,
  onSpeedSelect,
  onStart,
  onBack,
  onTogglePlay,
  onForward,
  onEnd,
  embedded = false
}: {
  mode: "single" | "compare";
  isPlaying: boolean;
  speedId: PlaybackSpeed;
  primaryValue: string;
  secondaryValue: string;
  onSpeedSelect: (speedId: PlaybackSpeed) => void;
  onStart: () => void;
  onBack: () => void;
  onTogglePlay: () => void;
  onForward: () => void;
  onEnd: () => void;
  embedded?: boolean;
}) {
  return (
    <section
      className={`${embedded ? "dock-section transport-panel-embedded" : "panel transport-panel"} ${
        isPlaying ? "transport-panel-live" : ""
      }`}
    >
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Transport</p>
          <h3>{mode === "compare" ? "Synchronized controls" : "Replay controls"}</h3>
        </div>
        <p className="panel-copy">
          {mode === "compare"
            ? "Shared transport keeps each run on one progress line while preserving its own trace density."
            : "The replay surface stays snapshot-driven, so stepping and scrubbing always land on recorded state."}
        </p>
      </div>

      <div className="transport-row">
        <button className="transport-button" onClick={onStart} type="button">
          Start
        </button>
        <button className="transport-button" onClick={onBack} type="button">
          Step Back
        </button>
        <button
          aria-pressed={isPlaying}
          className={`transport-button transport-button-primary ${
            isPlaying ? "transport-button-live" : ""
          }`}
          onClick={onTogglePlay}
          type="button"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button className="transport-button" onClick={onForward} type="button">
          Step Forward
        </button>
        <button className="transport-button" onClick={onEnd} type="button">
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
              onSpeedSelect(profileId);
            }}
            type="button"
          >
            {profile.label}
          </button>
        ))}
      </div>

      <div className="transport-summary">
        <div className="metric-inline">
          <span>{mode === "compare" ? "Sync progress" : "Current frame"}</span>
          <strong>{primaryValue}</strong>
        </div>
        <div className="metric-inline">
          <span>Playback profile</span>
          <strong>{playbackProfiles[speedId].label}</strong>
        </div>
        <div className="metric-inline">
          <span>{mode === "compare" ? "Deck size" : "Input footprint"}</span>
          <strong>{secondaryValue}</strong>
        </div>
      </div>
    </section>
  );
}

function TimelinePanel({
  mode,
  currentStepIndex,
  activeStepCount,
  syncProgress,
  summary,
  detail,
  storyboardStops,
  checkpointWindow,
  onSelectStep,
  renderCheckpoint,
  embedded = false
}: {
  mode: "single" | "compare";
  currentStepIndex: number;
  activeStepCount: number;
  syncProgress: number;
  summary: string;
  detail: string;
  storyboardStops: StoryboardStop[];
  checkpointWindow: number[];
  onSelectStep: (stepIndex: number) => void;
  renderCheckpoint: (stepIndex: number) => ReactNode;
  embedded?: boolean;
}) {
  return (
    <section className={embedded ? "dock-section timeline-panel-embedded" : "panel timeline-panel"}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Timeline</p>
          <h3>
            {mode === "compare"
              ? "Scrub the synchronized progress line"
              : "Scrub to any deterministic checkpoint"}
          </h3>
        </div>
        <p className="panel-copy">
          {mode === "compare"
            ? `Shared frame ${currentStepIndex + 1} of ${activeStepCount}`
            : `Frame ${currentStepIndex + 1} of ${activeStepCount}`}
        </p>
      </div>
      <div className="timeline-progress-shell">
        <div className="timeline-progress-bar">
          <span style={{ width: `${syncProgress}%` }} />
        </div>
        <div className="timeline-progress-copy">
          <strong>{summary}</strong>
          <span>{detail}</span>
        </div>
      </div>
      <input
        aria-label="Replay timeline"
        className="timeline-range"
        max={activeStepCount - 1}
        min={0}
        onChange={(event) => {
          onSelectStep(Number(event.target.value));
        }}
        onInput={(event) => {
          onSelectStep(Number((event.target as HTMLInputElement).value));
        }}
        type="range"
        value={currentStepIndex}
      />
      <div className="timeline-labels">
        <span>{mode === "compare" ? "Lift-off" : "Seed"}</span>
        <span>{mode === "compare" ? `${syncProgress}% synced` : summary}</span>
        <span>Done</span>
      </div>
      <StoryboardRail activeStepIndex={currentStepIndex} onSelect={onSelectStep} stops={storyboardStops} />
      <div className="checkpoint-row">{checkpointWindow.map((stepIndex) => renderCheckpoint(stepIndex))}</div>
    </section>
  );
}

function OverviewPage({
  foundation,
  status,
  persistence,
  persistedAlgorithms,
  recentRuns,
  recentComparisons,
  onLoadSavedRun
}: {
  foundation: FoundationResponse | null;
  status: DataStatus;
  persistence: PersistenceMetadata | null;
  persistedAlgorithms: PersistedAlgorithmRecord[];
  recentRuns: PersistedRunSummary[];
  recentComparisons: PersistedComparisonRecord[];
  onLoadSavedRun: (runId: string) => void;
}) {
  const directorySurfaces = navigationSurfaces.filter((surface) => surface.page !== "overview");

  return (
    <>
      <WorkspaceHeader
        actions={
          <>
            <a
              className="launch-button"
              href={buildRouteHref({
                page: "playground",
                algorithmId: assuredDefaultAlgorithm.id
              })}
            >
              Open replay
            </a>
            <a className="segmented" href={buildRouteHref({ page: "history" })}>
              Saved runs
            </a>
            <a className="segmented" href={buildRouteHref({ page: "compare" })}>
              Compare
            </a>
          </>
        }
        details={[
          {
            label: "Status",
            value:
              status === "ready" ? "API connected" : status === "offline" ? "Offline-safe" : "Loading"
          },
          {
            label: "Algorithms",
            value: `${algorithms.length}`
          },
          {
            label: "Saved runs",
            value: `${persistence?.counts.runs ?? 0}`
          },
          {
            label: "Comparisons",
            value: `${persistence?.counts.comparisons ?? 0}`
          }
        ]}
        eyebrow="Overview"
        summary="Use this directory to move between replay, references, and saved records without collapsing every task into one screen."
        title="Replay, reference notes, and saved history stay in separate working views."
      />

      <section className="overview-frame">
        <article className="panel overview-panel overview-directory-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Routes</p>
              <h2>Choose a working view</h2>
            </div>
            <p className="panel-copy">
              Each route keeps one job in frame: active replay, reference notes, saved records, or
              side-by-side comparison.
            </p>
          </div>
          <div className="surface-directory">
            {directorySurfaces.map((surface, index) => (
              <a
                className="surface-row"
                href={buildRouteHref(
                  surface.page === "playground"
                    ? { page: "playground", algorithmId: assuredDefaultAlgorithm.id }
                    : { page: surface.page }
                )}
                key={surface.page}
              >
                <span className="surface-row-index">{String(index + 1).padStart(2, "0")}</span>
                <div className="surface-row-main">
                  <p className="eyebrow">{surface.label}</p>
                  <h2>{surface.title}</h2>
                  <p>{surface.description}</p>
                </div>
                <span className="surface-row-action">Open</span>
              </a>
            ))}
          </div>
        </article>

        <div className="overview-side-stack">
          <article className="panel overview-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Local State</p>
                <h2>Current storage and service status</h2>
              </div>
            </div>
            <div className="overview-ledger">
              <article className="ledger-row">
                <span>API</span>
                <strong>
                  {status === "ready"
                    ? "Connected"
                    : status === "offline"
                      ? "Unavailable"
                      : "Loading"}
                </strong>
                <p>
                  {status === "ready"
                    ? "Foundation and persistence metadata are available."
                    : "Replay stays local even when the API is unavailable."}
                </p>
              </article>
              <article className="ledger-row">
                <span>Store file</span>
                <strong>{persistence?.dataFile ?? "Unavailable"}</strong>
                <p>
                  Schema {persistence?.storageSchemaVersion ?? "-"} with {persistedAlgorithms.length} tracked
                  algorithms.
                </p>
              </article>
              <article className="ledger-row">
                <span>Recent saved work</span>
                <strong>
                  {recentRuns.length} runs / {recentComparisons.length} comparisons
                </strong>
                <p>Saved records stay separate from the live replay surface until you reopen them.</p>
              </article>
            </div>
          </article>

          <article className="panel overview-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Recent Activity</p>
                <h2>Latest saved records</h2>
              </div>
            </div>
            <div className="activity-list">
              {recentRuns.slice(0, 3).map((run) => (
                <button
                  className="activity-row"
                  key={run.id}
                  onClick={() => {
                    onLoadSavedRun(run.id);
                  }}
                  type="button"
                >
                  <span>{run.algorithmLabel}</span>
                  <strong>{run.stepCount} frames</strong>
                  <p>{formatTimestamp(run.recordedAt)}</p>
                </button>
              ))}
              {recentComparisons.slice(0, 2).map((comparison) => (
                <a className="activity-row" href={buildRouteHref({ page: "history" })} key={comparison.id}>
                  <span>{comparison.label ?? "Saved comparison"}</span>
                  <strong>
                    {comparison.baseRun.algorithmLabel} vs {comparison.candidateRun.algorithmLabel}
                  </strong>
                  <p>{comparison.metrics.length} tracked metrics</p>
                </a>
              ))}
              {recentRuns.length === 0 && recentComparisons.length === 0 ? (
                <div className="empty-state">
                  <strong>No saved records yet.</strong>
                  <p>Open replay or start the local API seed to populate this index.</p>
                </div>
              ) : null}
            </div>
          </article>
        </div>
      </section>

      <section className="overview-grid overview-grid-ledger">
        <article className="panel overview-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Library Preview</p>
              <h2>Algorithms by domain</h2>
            </div>
          </div>
          <div className="overview-domain-grid overview-domain-ledger">
            {libraryDomainOrder.map((domain) => (
              <article className="overview-domain-card" key={domain}>
                <span>{domainLabels[domain]}</span>
                <strong>
                  {algorithms.filter((algorithm) => algorithm.domain === domain).length} algorithms
                </strong>
                <p>{domainReference[domain].lens}</p>
              </article>
            ))}
          </div>
        </article>

        {foundation?.services.length ? (
          <article className="panel overview-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Modules</p>
                <h2>Core parts of the local stack</h2>
              </div>
            </div>
            <div className="module-ledger">
              {foundation.services.map((service) => (
                <article className="module-row" key={service.name}>
                  <span>{service.name}</span>
                  <strong>{service.role}</strong>
                </article>
              ))}
            </div>
          </article>
        ) : null}
      </section>

    </>
  );
}

function LibraryPage({
  route,
  persistedAlgorithms,
  onOpenPlayground,
  onBrowse
}: {
  route: LibraryRouteState;
  persistedAlgorithms: PersistedAlgorithmRecord[];
  onOpenPlayground: (algorithmId: string) => void;
  onBrowse: (filters: LibraryFilters) => void;
}) {
  const statsByAlgorithmId = new Map(
    persistedAlgorithms.map((algorithm) => [algorithm.id, algorithm] as const)
  );
  const savedRunCounts = new Map(
    persistedAlgorithms.map((algorithm) => [algorithm.id, algorithm.runCount] as const)
  );
  const filters = getLibraryFilters(route);
  const deferredQuery = useDeferredValue(filters.q);
  const deferredFilters = { ...filters, q: deferredQuery };
  const filteredAlgorithms = resolveLibraryAlgorithms(algorithms, deferredFilters, savedRunCounts);
  const visibleSavedRuns = filteredAlgorithms.reduce(
    (total, algorithm) => total + (statsByAlgorithmId.get(algorithm.id)?.runCount ?? 0),
    0
  );
  const activeStage = filters.stage !== "all" ? getLibraryStage(filters.stage) : null;
  const activeFocus = filters.focus !== "all" ? getLibraryFocusArea(filters.focus) : null;
  const activeSortMode =
    librarySortModes.find((sortMode) => sortMode.id === filters.sort) ?? librarySortModes[0]!;
  const activePathway =
    libraryPathways.find((pathway) =>
      Object.entries(pathway.filters).every(
        ([key, value]) => filters[key as keyof LibraryFilters] === value
      )
    ) ?? null;
  const activeFilterTokens = [
    filters.domain === "all" ? null : domainLabels[filters.domain],
    activeStage?.label ?? null,
    activeFocus?.label ?? null,
    filters.q ? `Query: ${filters.q}` : null
  ].filter((token): token is string => Boolean(token));

  function updateFilters(nextPatch: Partial<LibraryFilters>) {
    const nextFilters = {
      ...filters,
      ...nextPatch
    };

    startTransition(() => {
      onBrowse(nextFilters);
    });
  }

  return (
    <>
      <WorkspaceHeader
        actions={
          <>
            <a className="launch-button" href={buildRouteHref({ page: "compare" })}>
              Open comparison view
            </a>
            <a className="segmented" href={buildRouteHref({ page: "history" })}>
              Saved history
            </a>
          </>
        }
        className="workspace-header-library"
        details={[
          {
            label: "Visible algorithms",
            value: `${filteredAlgorithms.length}`,
            detail:
              filteredAlgorithms.length === algorithms.length
                ? "The full catalog is in view."
                : "Results update as the current browse state changes."
          },
          {
            label: "Saved runs",
            value: `${visibleSavedRuns}`,
            detail: "Replay history stays visible without pulling saved runs back into the workspace."
          },
          {
            label: "Progression",
            value: activeStage?.label ?? "All stages",
            detail:
              activeFocus?.label ??
              "Discovery spans walkthroughs, dense-state systems, and comparison-ready sorting decks."
          },
          {
            label: "Browse mode",
            value: activePathway?.label ?? "Custom filters",
            detail: `Sort order: ${activeSortMode.label}`
          }
        ]}
        eyebrow="Library"
        summary="Browse the reference catalog by domain, stage, and learning goal. Filters stay route-backed so you can reopen the same browse state without mixing search and replay on one page."
        title="Algorithm library"
      />

      <section className="panel library-browser-panel">
        <div className="library-browser-shell">
          <aside className="library-filter-rail">
            <div className="library-rail-intro">
              <p className="eyebrow">Reference Index</p>
              <h2>Browse by domain or study route.</h2>
              <p className="panel-copy">
                Use the rail for orientation. Search and refinement stay beside the results they
                change.
              </p>
            </div>

            <div className="library-rail-block">
              <div className="library-rail-heading">
                <div>
                  <p className="eyebrow">Domains</p>
                  <h2>Algorithm families</h2>
                </div>
                <span>{filters.domain === "all" ? "All domains" : domainLabels[filters.domain]}</span>
              </div>
              <div className="library-domain-list">
                <button
                  className={`library-domain-row ${
                    filters.domain === "all" ? "library-domain-row-active" : ""
                  }`}
                  onClick={() => {
                    updateFilters({ domain: "all" });
                  }}
                  type="button"
                >
                  <span>All domains</span>
                  <strong>{filteredAlgorithms.length}</strong>
                  <p>Keep the full catalog in view while stage and goal filters do the narrowing.</p>
                </button>
                {libraryDomainOrder.map((domain) => {
                  const domainCount = resolveLibraryAlgorithms(
                    algorithms,
                    { ...deferredFilters, domain },
                    savedRunCounts
                  ).length;

                  return (
                    <button
                      className={`library-domain-row ${
                        filters.domain === domain ? "library-domain-row-active" : ""
                      }`}
                      key={domain}
                      onClick={() => {
                        updateFilters({ domain });
                      }}
                      type="button"
                    >
                      <span>{domainLabels[domain]}</span>
                      <strong>{domainCount}</strong>
                      <p>{domainReference[domain].lens}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="library-rail-block">
              <div className="library-rail-heading">
                <div>
                  <p className="eyebrow">Study Routes</p>
                  <h2>Suggested sequences</h2>
                </div>
                <span>{activePathway?.label ?? "Custom browse state"}</span>
              </div>
              <div className="library-path-list">
                {libraryPathways.map((pathway) => {
                  const previewNames = pathway.previewAlgorithmIds.map(
                    (algorithmId) => getAlgorithmById(algorithmId).name
                  );
                  const isActive = Object.entries(pathway.filters).every(
                    ([key, value]) => filters[key as keyof LibraryFilters] === value
                  );

                  return (
                    <button
                      className={`library-path-row ${isActive ? "library-path-row-active" : ""}`}
                      key={pathway.id}
                      onClick={() => {
                        updateFilters({
                          ...defaultLibraryFilters,
                          ...pathway.filters
                        });
                      }}
                      type="button"
                    >
                      <span>{pathway.label}</span>
                      <strong>{previewNames.join(" -> ")}</strong>
                      <p>{pathway.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="library-results-column">
            <div className="library-results-header">
              <div className="library-results-intro">
                <p className="eyebrow">Catalog</p>
                <div className="library-results-title-block">
                  <h2>Reference explorer</h2>
                  <strong>{filteredAlgorithms.length} entries</strong>
                </div>
                <p className="panel-copy">
                  Search, sort, and progression cues stay in one control band so the catalog can be
                  refined without hopping between separate framed sections.
                </p>
              </div>
              <div className="library-search-panel">
                <label className="library-search-shell" htmlFor="library-search">
                  <span>Search algorithms</span>
                  <input
                    id="library-search"
                    onChange={(event) => {
                      updateFilters({ q: event.target.value });
                    }}
                    placeholder="Search by algorithm, metric, or learning goal"
                    type="search"
                    value={filters.q}
                  />
                </label>
                <div className="library-results-summary">
                  <div className="library-summary-item">
                    <span>Sort</span>
                    <strong>{activeSortMode.label}</strong>
                  </div>
                  <div className="library-summary-item">
                    <span>Saved runs</span>
                    <strong>{visibleSavedRuns}</strong>
                  </div>
                  <div className="library-summary-item">
                    <span>Current path</span>
                    <strong>{activePathway?.label ?? "Custom browse state"}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="library-toolbar">
              <div className="library-toolbar-meta">
                <p className="library-active-filter-line">
                  <span>Showing</span>
                  <strong>
                    {activeFilterTokens.length > 0
                      ? activeFilterTokens.join(" · ")
                      : "all domains, stages, and learning goals"}
                  </strong>
                </p>
                <button
                  className="segmented"
                  onClick={() => {
                    updateFilters(defaultLibraryFilters);
                  }}
                  type="button"
                >
                  Reset filters
                </button>
              </div>
              <div className="library-toolbar-row">
                <span className="filter-label">Stage</span>
                <div className="filter-chip-row">
                  <button
                    className={`segmented ${filters.stage === "all" ? "segmented-active" : ""}`}
                    onClick={() => {
                      updateFilters({ stage: "all" });
                    }}
                    type="button"
                  >
                    All
                  </button>
                  {libraryStages.map((stage) => (
                    <button
                      className={`segmented ${filters.stage === stage.id ? "segmented-active" : ""}`}
                      key={stage.id}
                      onClick={() => {
                        updateFilters({ stage: stage.id });
                      }}
                      type="button"
                    >
                      {stage.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="library-toolbar-row">
                <span className="filter-label">Learning goal</span>
                <div className="filter-chip-row">
                  <button
                    className={`segmented ${filters.focus === "all" ? "segmented-active" : ""}`}
                    onClick={() => {
                      updateFilters({ focus: "all" });
                    }}
                    type="button"
                  >
                    All
                  </button>
                  {libraryFocusAreas.map((focus) => (
                    <button
                      className={`segmented ${filters.focus === focus.id ? "segmented-active" : ""}`}
                      key={focus.id}
                      onClick={() => {
                        updateFilters({ focus: focus.id });
                      }}
                      type="button"
                    >
                      {focus.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="library-toolbar-row">
                <span className="filter-label">Sort</span>
                <div className="filter-chip-row">
                  {librarySortModes.map((sortMode) => (
                    <button
                      className={`segmented ${filters.sort === sortMode.id ? "segmented-active" : ""}`}
                      key={sortMode.id}
                      onClick={() => {
                        updateFilters({ sort: sortMode.id });
                      }}
                      type="button"
                    >
                      {sortMode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredAlgorithms.length > 0 ? (
              <div className="library-result-list">
                {filteredAlgorithms.map((algorithm) => {
                  const persistedRecord = statsByAlgorithmId.get(algorithm.id);
                  const profile = getLibraryProfile(algorithm.id);
                  const stage = getLibraryStage(profile.stage);
                  const focus = getLibraryFocusArea(profile.focus);
                  const nextNames = profile.nextAlgorithmIds.map(
                    (algorithmId) => getAlgorithmById(algorithmId).name
                  );

                  return (
                    <article className="library-result-row" key={algorithm.id}>
                      <div className="library-result-main">
                        <div className="library-result-heading">
                          <span className={`algorithm-badge algorithm-badge-${algorithm.accent}`}>
                            {algorithm.badge}
                          </span>
                          <span className="library-result-domain">
                            {domainLabels[algorithm.domain]}
                          </span>
                        </div>
                        <div className="library-result-title-row">
                          <h3>{algorithm.name}</h3>
                        </div>
                        <p className="library-result-kicker">
                          {stage.label} stage · {focus.label}
                        </p>
                        <p>{algorithm.description}</p>
                        <div className="library-reference-list">
                          <div className="library-reference-row">
                            <span>Replay focus</span>
                            <p>{profile.outcome}</p>
                          </div>
                          <div className="library-reference-row">
                            <span>Signals to watch</span>
                            <p>{profile.skills.join(" · ")}</p>
                          </div>
                        </div>
                      </div>

                      <div className="library-result-side">
                        <div className="library-result-ledger">
                          <div>
                            <span>Saved runs</span>
                            <strong>{persistedRecord?.runCount ?? 0}</strong>
                          </div>
                          <div>
                            <span>Explore time</span>
                            <strong>{profile.timeToExplore}</strong>
                          </div>
                          <div>
                            <span>Trace lens</span>
                            <strong>{algorithm.inputLabel}</strong>
                          </div>
                          <div>
                            <span>Next up</span>
                            <strong>{nextNames.join(" -> ")}</strong>
                          </div>
                        </div>

                        <div className="library-result-actions">
                          <p className="library-reference-note">{profile.spotlight}</p>
                          <div className="library-card-actions">
                            <a
                              className="segmented"
                              href={buildRouteHref({
                                page: "algorithm-detail",
                                algorithmId: algorithm.id
                              })}
                            >
                              Reference
                            </a>
                            <button
                              className="launch-button"
                              onClick={() => {
                                onOpenPlayground(algorithm.id);
                              }}
                              type="button"
                            >
                              Open replay
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <span>Empty browse state</span>
                <strong>No algorithms match this filter set yet.</strong>
                <p>
                  Reset the current filters or widen the search terms to bring the catalog back
                  into view.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function AlgorithmDetailPage({
  algorithm,
  persistedAlgorithms,
  onOpenPlayground
}: {
  algorithm: ReplayAlgorithm;
  persistedAlgorithms: PersistedAlgorithmRecord[];
  onOpenPlayground: (algorithmId: string) => void;
}) {
  const persistedRecord = persistedAlgorithms.find((entry) => entry.id === algorithm.id);
  const reference = domainReference[algorithm.domain];
  const profile = getLibraryProfile(algorithm.id);
  const stage = getLibraryStage(profile.stage);
  const focus = getLibraryFocusArea(profile.focus);
  const nextAlgorithms = profile.nextAlgorithmIds.map((algorithmId) => getAlgorithmById(algorithmId));

  return (
    <>
      <WorkspaceHeader
        actions={
          <>
            <button
              className="launch-button"
              onClick={() => {
                onOpenPlayground(algorithm.id);
              }}
              type="button"
            >
              Open replay
            </button>
            <a
              className="segmented"
              href={buildRouteHref({
                page: "library",
                domain: algorithm.domain,
                stage: profile.stage
              })}
            >
              Back to library
            </a>
            {algorithm.domain === "sorting" ? (
              <a className="segmented segmented-active" href={buildRouteHref({ page: "compare" })}>
                Compare sorting runs
              </a>
            ) : null}
          </>
        }
        className="workspace-header-reference"
        details={[
          {
            label: "Progression stage",
            value: stage.label,
            detail: stage.description
          },
          {
            label: "Learning goal",
            value: focus.label,
            detail: profile.spotlight
          },
          {
            label: "Replay lens",
            value: getAlgorithmMetricsLabel(algorithm),
            detail: profile.metricsLens
          },
          {
            label: "Saved activity",
            value: `${persistedRecord?.runCount ?? 0}`,
            detail: persistedRecord?.lastRunAt
              ? `Most recent saved run ${formatTimestamp(persistedRecord.lastRunAt)}`
              : "No persisted runs recorded yet"
          }
        ]}
        eyebrow={`${algorithm.badge} Reference`}
        summary={`${algorithm.description} This page keeps the input contract, checkpoints, and replay metric language in one place before you open a live run or reload saved history.`}
        title={algorithm.name}
      />

      <section className="detail-layout detail-layout-reference">
        <article className="panel detail-panel detail-panel-brief">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Reference Brief</p>
              <h2>What the replay view needs to reveal</h2>
            </div>
          </div>
          <div className="detail-copy-grid">
            <article className="detail-note">
              <span>Input contract</span>
              <strong>{algorithm.inputHint}</strong>
              <p>{reference.flow}</p>
            </article>
            <article className="detail-note">
              <span>Checkpoint model</span>
              <strong>{reference.checkpoints}</strong>
              <p>{reference.metrics}</p>
            </article>
            <article className="detail-note">
              <span>Surface expectation</span>
              <strong>{reference.lens}</strong>
              <p>Replay, saved runs, and comparison should all read from the same snapshots.</p>
            </article>
          </div>
        </article>

        <article className="panel detail-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Progression Notes</p>
              <h2>How this algorithm fits the broader library</h2>
            </div>
          </div>
          <div className="detail-copy-grid">
            <article className="detail-note">
              <span>Complexity profile</span>
              <strong>{profile.complexity}</strong>
              <p>{profile.outcome}</p>
            </article>
            <article className="detail-note">
              <span>Skills to watch</span>
              <strong>{profile.skills.join(" · ")}</strong>
              <p>{profile.metricsLens}</p>
            </article>
            <article className="detail-note">
              <span>Next algorithms</span>
              <strong>{nextAlgorithms.map((entry) => entry.name).join(" -> ")}</strong>
              <p>{reference.checkpoints}</p>
            </article>
          </div>
        </article>

        <article className="panel detail-panel detail-panel-code">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Seed Input</p>
              <h2>Default reference payload</h2>
            </div>
          </div>
          <pre className="detail-code-block">
            <code>{algorithm.defaultInput}</code>
          </pre>
        </article>
      </section>
    </>
  );
}

function PlaygroundPage({
  status,
  run,
  runSource,
  selectedAlgorithm,
  selectedAlgorithmId,
  singleInputText,
  singleError,
  currentStepIndex,
  isPlaying,
  speedId,
  onInputChange,
  onSelectAlgorithm,
  onLaunchRun,
  onSpeedSelect,
  onStart,
  onBack,
  onTogglePlay,
  onForward,
  onEnd,
  onSelectStep
}: {
  status: DataStatus;
  run: ReplayRun;
  runSource: RunSource;
  selectedAlgorithm: ReplayAlgorithm;
  selectedAlgorithmId: string;
  singleInputText: string;
  singleError: string;
  currentStepIndex: number;
  isPlaying: boolean;
  speedId: PlaybackSpeed;
  onInputChange: (value: string) => void;
  onSelectAlgorithm: (algorithmId: string) => void;
  onLaunchRun: () => void;
  onSpeedSelect: (speedId: PlaybackSpeed) => void;
  onStart: () => void;
  onBack: () => void;
  onTogglePlay: () => void;
  onForward: () => void;
  onEnd: () => void;
  onSelectStep: (stepIndex: number) => void;
}) {
  const currentStep = getRunStep(run, currentStepIndex);
  const syncProgress =
    run.trace.steps.length <= 1
      ? 100
      : Math.round((currentStepIndex / (run.trace.steps.length - 1)) * 100);
  const checkpointWindow = buildCheckpointWindow(run.trace.steps.length, currentStepIndex);
  const storyboardStops = buildSingleStoryboard(run, currentStepIndex);

  return (
    <>
      <WorkspaceHeader
        actions={
          <>
            <a
              className="segmented"
              href={buildRouteHref({
                page: "algorithm-detail",
                algorithmId: selectedAlgorithm.id
              })}
            >
              Reference
            </a>
            <a className="segmented" href={buildRouteHref({ page: "history" })}>
              Saved runs
            </a>
            {selectedAlgorithm.domain === "sorting" ? (
              <a className="segmented segmented-active" href={buildRouteHref({ page: "compare" })}>
                Compare
              </a>
            ) : null}
          </>
        }
        details={[
          {
            label: "Algorithm",
            value: run.algorithm.name
          },
          {
            label: "Input",
            value: describeInputFootprint(run)
          },
          {
            label: "Source",
            value: runSource.label
          },
          {
            label: "Frame",
            value: `${currentStep.index + 1} / ${run.trace.steps.length}`
          }
        ]}
        eyebrow="Single Run"
        summary="Select an algorithm, load an input, and inspect recorded state frame by frame."
        title="Replay"
      />

      <div className="workspace-grid workspace-grid-replay">
        <aside className="sidebar panel tool-rail tool-rail-replay">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Scenario</p>
              <h2>Algorithm and input</h2>
            </div>
            <p className="panel-copy">
              The selected algorithm controls parsing and trace generation.
            </p>
          </div>
          <div className="status-row">
            <span className={`status-chip status-chip--${status}`}>
              {status === "ready" ? "API connected" : status === "offline" ? "Offline" : "Loading"}
            </span>
            <span className="status-chip">replay</span>
          </div>
          <div className="algorithm-list">
            {algorithms.map((algorithm) => (
              <button
                className={`algorithm-card ${
                  algorithm.id === selectedAlgorithmId ? "algorithm-card-active" : ""
                }`}
                key={algorithm.id}
                onClick={() => {
                  onSelectAlgorithm(algorithm.id);
                }}
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

          <div className="panel-stack">
            <div className="sidebar-note">
              <span>Loaded source</span>
              <strong>{runSource.label}</strong>
              <p>{runSource.detail}</p>
            </div>
            <a
              className="segmented"
              href={buildRouteHref({
                page: "algorithm-detail",
                algorithmId: selectedAlgorithm.id
              })}
            >
              Read reference notes
            </a>
          </div>

          <label className="input-label" htmlFor="single-input-editor">
            {selectedAlgorithm.inputLabel}
          </label>
          <p className="input-hint">{selectedAlgorithm.inputHint}</p>
          <textarea
            className="input-editor"
            id="single-input-editor"
            onChange={(event) => {
              onInputChange(event.target.value);
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
          <button className="launch-button" onClick={onLaunchRun} type="button">
            Rebuild trace
          </button>
        </aside>

        <div className="main-column workspace-main workspace-main-replay">
          <div className="workspace-body workspace-body-replay">
            <section className="panel stage-panel workspace-stage">
              <SingleReplayBriefing run={run} stepIndex={currentStepIndex} />
              <div className="stage-layout">
                <div className="visual-panel">{renderSingleStage(run, currentStepIndex)}</div>
                <div className="inspector-column workspace-inspector">
                  <section className="inspector-panel">
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
                    <div className="metric-grid">{renderMetricCards(run, currentStepIndex)}</div>
                  </section>

                  <section className="state-panel">
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

            <section className="panel workspace-dock workspace-dock-replay">
              <TransportPanel
                embedded
                isPlaying={isPlaying}
                mode="single"
                onBack={onBack}
                onEnd={onEnd}
                onForward={onForward}
                onSpeedSelect={onSpeedSelect}
                onStart={onStart}
                onTogglePlay={onTogglePlay}
                primaryValue={currentStep.phase}
                secondaryValue={describeInputFootprint(run)}
                speedId={speedId}
              />

              <TimelinePanel
                activeStepCount={run.trace.steps.length}
                checkpointWindow={checkpointWindow}
                currentStepIndex={currentStepIndex}
                detail={describeRunSnapshot(run, currentStep.index)}
                embedded
                mode="single"
                onSelectStep={onSelectStep}
                renderCheckpoint={(stepIndex) => {
                  const step = getRunStep(run, stepIndex);

                  return (
                    <button
                      className={`checkpoint ${stepIndex === currentStepIndex ? "checkpoint-active" : ""}`}
                      key={step.key}
                      onClick={() => {
                        onSelectStep(stepIndex);
                      }}
                      type="button"
                    >
                      <span className="checkpoint-index">{step.index + 1}</span>
                      <strong>{step.phase}</strong>
                      <span>{step.explanation.summary}</span>
                    </button>
                  );
                }}
                storyboardStops={storyboardStops}
                summary={currentStep.explanation.summary}
                syncProgress={syncProgress}
              />
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

function ComparePage({
  compareInputText,
  compareError,
  comparisonRuns,
  currentStepIndex,
  isPlaying,
  speedId,
  recentComparisons,
  onInputChange,
  onLaunchComparison,
  onSpeedSelect,
  onStart,
  onBack,
  onTogglePlay,
  onForward,
  onEnd,
  onSelectStep
}: {
  compareInputText: string;
  compareError: string;
  comparisonRuns: SortingRun[];
  currentStepIndex: number;
  isPlaying: boolean;
  speedId: PlaybackSpeed;
  recentComparisons: PersistedComparisonRecord[];
  onInputChange: (value: string) => void;
  onLaunchComparison: () => void;
  onSpeedSelect: (speedId: PlaybackSpeed) => void;
  onStart: () => void;
  onBack: () => void;
  onTogglePlay: () => void;
  onForward: () => void;
  onEnd: () => void;
  onSelectStep: (stepIndex: number) => void;
}) {
  const activeStepCount = Math.max(...comparisonRuns.map((comparisonRun) => comparisonRun.trace.steps.length));
  const syncProgress =
    activeStepCount <= 1 ? 100 : Math.round((currentStepIndex / (activeStepCount - 1)) * 100);
  const compareLaneSignals = comparisonRuns.map((comparisonRun) => {
    const syncedIndex = getSyncedStepIndex(
      comparisonRun.trace.steps.length,
      currentStepIndex,
      activeStepCount
    );
    const syncedStep = getRunStep(comparisonRun, syncedIndex);

    return `${comparisonRun.algorithm.name.split(" ")[0]}: ${syncedStep.phase}`;
  });
  const checkpointWindow = buildCheckpointWindow(activeStepCount, currentStepIndex);
  const storyboardStops = buildComparisonStoryboard(
    comparisonRuns,
    currentStepIndex,
    activeStepCount
  );

  return (
    <>
      <WorkspaceHeader
        actions={
          <>
            <a className="segmented" href={buildRouteHref({ page: "history" })}>
              Saved comparisons
            </a>
            <a className="segmented segmented-active" href={buildRouteHref({ page: "playground" })}>
              Single run
            </a>
          </>
        }
        className="workspace-header-compare"
        details={[
          {
            label: "Matchup",
            value: comparisonRuns.map((run) => run.algorithm.name.split(" ")[0]).join(" / ")
          },
          {
            label: "Input",
            value: comparisonRuns[0] ? describeInputFootprint(comparisonRuns[0]) : "Pending"
          },
          {
            label: "Frame",
            value: `${currentStepIndex + 1} / ${activeStepCount}`
          },
          {
            label: "Saved",
            value: `${recentComparisons.length}`
          }
        ]}
        eyebrow="Comparison"
        summary="Run the shared sorting deck on one normalized array and inspect progress on a common timeline."
        title="Compare"
      />

      <div className="workspace-grid workspace-grid-compare">
        <aside className="sidebar panel tool-rail tool-rail-compare">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Comparison Deck</p>
              <h2>Shared input and lanes</h2>
            </div>
            <p className="panel-copy">
              Every sorting trace is rebuilt from the same array and aligned by normalized progress.
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
          <div className="sidebar-note">
            <span>Live sync</span>
            <strong>{syncProgress}% aligned</strong>
            <p>{compareLaneSignals.join(" · ")}</p>
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
              onInputChange(event.target.value);
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
          <button className="launch-button" onClick={onLaunchComparison} type="button">
            Rebuild deck
          </button>
        </aside>

        <div className="main-column workspace-main workspace-main-compare">
          <section className="compare-route-strip">
            <article className="compare-route-card">
              <span>Deck</span>
              <strong>{comparisonRuns.map((run) => run.algorithm.name.split(" ")[0]).join(" / ")}</strong>
              <p>Every sorting trace is rebuilt from one shared array so the lanes stay directly comparable.</p>
            </article>
            <article className="compare-route-card">
              <span>Current sync</span>
              <strong>{syncProgress}% aligned</strong>
              <p>{compareLaneSignals.join(" · ")}</p>
            </article>
            <article className="compare-route-card">
              <span>Saved comparisons</span>
              <strong>{recentComparisons.length}</strong>
              <p>{activeStepCount} synchronized frames are available in the current deck.</p>
            </article>
          </section>

          <div className="workspace-body workspace-body-compare">
            <ComparisonWorkspace
              currentStepIndex={currentStepIndex}
              runs={comparisonRuns}
              stepCount={activeStepCount}
            />

            <section className="panel workspace-dock workspace-dock-compare">
              <TransportPanel
                embedded
                isPlaying={isPlaying}
                mode="compare"
                onBack={onBack}
                onEnd={onEnd}
                onForward={onForward}
                onSpeedSelect={onSpeedSelect}
                onStart={onStart}
                onTogglePlay={onTogglePlay}
                primaryValue={`${syncProgress}%`}
                secondaryValue={`${comparisonRuns.length} algorithms`}
                speedId={speedId}
              />

              <TimelinePanel
                activeStepCount={activeStepCount}
                checkpointWindow={checkpointWindow}
                currentStepIndex={currentStepIndex}
                detail={compareLaneSignals.join(" · ")}
                embedded
                mode="compare"
                onSelectStep={onSelectStep}
                renderCheckpoint={(stepIndex) => {
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
                        onSelectStep(stepIndex);
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
                }}
                storyboardStops={storyboardStops}
                summary={`${syncProgress}% synchronized`}
                syncProgress={syncProgress}
              />
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

function HistoryPage({
  status,
  persistence,
  recentRuns,
  recentComparisons,
  loadingSavedRunId,
  onRefresh,
  onLoadSavedRun
}: {
  status: DataStatus;
  persistence: PersistenceMetadata | null;
  recentRuns: PersistedRunSummary[];
  recentComparisons: PersistedComparisonRecord[];
  loadingSavedRunId: string | null;
  onRefresh: () => void;
  onLoadSavedRun: (runId: string) => void;
}) {
  return (
    <>
      <WorkspaceHeader
        actions={
          <>
            <button className="segmented" onClick={onRefresh} type="button">
              Refresh saved activity
            </button>
            <a className="segmented segmented-active" href={buildRouteHref({ page: "compare" })}>
              Open comparison view
            </a>
          </>
        }
        className="workspace-header-history"
        details={[
          {
            label: "Runs",
            value: `${persistence?.counts.runs ?? 0}`,
            detail: "Recent replay records are listed as lightweight summaries until a user opens one."
          },
          {
            label: "Comparisons",
            value: `${persistence?.counts.comparisons ?? 0}`,
            detail: "Saved matchups remain browseable without hydrating the comparison deck."
          },
          {
            label: "Storage schema",
            value: `${persistence?.storageSchemaVersion ?? "-"}`,
            detail: persistence?.dataFile ?? "Persistence metadata unavailable"
          },
          {
            label: "API",
            value:
              status === "ready" ? "Connected" : status === "offline" ? "Unavailable" : "Loading",
            detail: "Refresh re-queries the persistence index without reopening the replay workspace."
          }
        ]}
        eyebrow="Saved Records"
        summary="Saved runs and comparisons stay in their own route so persisted output can be reviewed without reopening the live replay workspace."
        title="History"
      />

      {status === "offline" ? (
        <section className="panel summary-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Persistence Offline</p>
              <h3>The API is unavailable, so saved activity cannot be listed right now.</h3>
            </div>
          </div>
          <p className="panel-copy">
            Bring the API back up and use the refresh control to repopulate saved runs and
            comparison summaries.
          </p>
        </section>
      ) : null}

      <div className="history-layout">
        <section className="panel history-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Saved Runs</p>
              <h2>Replay-ready history</h2>
            </div>
            <p className="panel-copy">
              Saved runs stay summary-first and only hydrate full trace payloads when you resume a
              replay.
            </p>
          </div>
          <div className="history-grid">
            {recentRuns.length > 0 ? (
              recentRuns.map((run) => (
                <article className="history-card" key={run.id}>
                  <div className="history-card-header">
                    <div>
                      <span className="card-kicker">{run.algorithmDomain}</span>
                      <h3>{run.algorithmLabel}</h3>
                    </div>
                    <span className="phase-badge">{run.stepCount} frames</span>
                  </div>
                  <p className="history-card-meta">
                    Recorded {formatTimestamp(run.recordedAt)} · digest {truncateText(run.inputDigest, 16)}
                  </p>
                  <div className="compare-pill-row">
                    {Object.entries(run.finalMetrics)
                      .slice(0, 3)
                      .map(([metricKey, value]) => (
                        <span className="number-pill" key={`${run.id}-${metricKey}`}>
                          {metricKey}: {value}
                        </span>
                      ))}
                  </div>
                  <div className="history-card-actions">
                    <button
                      className="launch-button"
                      disabled={loadingSavedRunId === run.id}
                      onClick={() => {
                        onLoadSavedRun(run.id);
                      }}
                      type="button"
                    >
                      {loadingSavedRunId === run.id ? "Loading replay..." : "Resume replay"}
                    </button>
                    <a
                      className="segmented"
                      href={buildRouteHref({
                        page: "algorithm-detail",
                        algorithmId: run.algorithmId
                      })}
                    >
                      Reference page
                    </a>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <strong>No saved runs yet.</strong>
                <p>Launch a replay or start the demo stack to seed persisted history.</p>
              </div>
            )}
          </div>
        </section>

        <section className="panel history-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Saved Comparisons</p>
              <h2>Recent matchup records</h2>
            </div>
            <p className="panel-copy">
              Comparison records stay compact and metric-led, which keeps history pages responsive
              even when the underlying trace payloads are large.
            </p>
          </div>
          <div className="history-grid">
            {recentComparisons.length > 0 ? (
              recentComparisons.map((comparison) => (
                <article className="history-card" key={comparison.id}>
                  <div className="history-card-header">
                    <div>
                      <span className="card-kicker">{comparison.label ?? "Saved comparison"}</span>
                      <h3>
                        {comparison.baseRun.algorithmLabel} vs {comparison.candidateRun.algorithmLabel}
                      </h3>
                    </div>
                    <span className="phase-badge">{comparison.metrics.length} metrics</span>
                  </div>
                  <p className="history-card-meta">Saved {formatTimestamp(comparison.createdAt)}</p>
                  <div className="history-metric-list">
                    {comparison.metrics.slice(0, 4).map((metric) => (
                      <div className="history-metric-row" key={`${comparison.id}-${metric.key}`}>
                        <span>{metric.label}</span>
                        <strong>
                          {formatMetricValue(metric.baseValue)} / {formatMetricValue(metric.candidateValue)}
                        </strong>
                        <span>{formatMetricDelta(metric)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="history-card-actions">
                    <a className="launch-button" href={buildRouteHref({ page: "compare" })}>
                      Open comparison view
                    </a>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <strong>No saved comparisons yet.</strong>
                <p>Build persisted comparisons through the API or demo seed to populate this view.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

export default function App() {
  const { route, navigate } = useHashRoute();
  const [foundation, setFoundation] = useState<FoundationResponse | null>(null);
  const [status, setStatus] = useState<DataStatus>("loading");
  const [persistence, setPersistence] = useState<PersistenceMetadata | null>(null);
  const [persistedAlgorithms, setPersistedAlgorithms] = useState<PersistedAlgorithmRecord[]>([]);
  const [recentRuns, setRecentRuns] = useState<PersistedRunSummary[]>([]);
  const [recentComparisons, setRecentComparisons] = useState<PersistedComparisonRecord[]>([]);
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
  const [loadingSavedRunId, setLoadingSavedRunId] = useState<string | null>(null);
  const [runSource, setRunSource] = useState<RunSource>(() =>
    getRunSourceFallback(buildRun(assuredDefaultAlgorithm.id, assuredDefaultAlgorithm.defaultInput))
  );

  const selectedAlgorithm = getAlgorithmById(selectedAlgorithmId);

  async function refreshProductData() {
    setStatus("loading");

    try {
      const payload = await fetchProductData();
      setFoundation(payload.foundation);
      setPersistence(payload.persistence);
      setPersistedAlgorithms(payload.algorithms);
      setRecentRuns(payload.runs);
      setRecentComparisons(payload.comparisons);
      setStatus("ready");
    } catch {
      setStatus("offline");
    }
  }

  useEffect(() => {
    void refreshProductData();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [getRouteScrollKey(route)]);

  useEffect(() => {
    if (route.page !== "playground" || !route.algorithmId) {
      return;
    }

    if (route.algorithmId === selectedAlgorithmId) {
      return;
    }

    const nextAlgorithm = getAlgorithmById(route.algorithmId);
    launchRun(nextAlgorithm.id, nextAlgorithm.defaultInput);
  }, [route, selectedAlgorithmId]);

  const activeStepCount =
    route.page === "compare"
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

  function launchRun(algorithmId: string, nextInputText: string) {
    try {
      const nextRun = buildRun(algorithmId, nextInputText);
      setRun(nextRun);
      setSingleInputText(nextRun.normalizedInputText);
      setSelectedAlgorithmId(nextRun.algorithm.id);
      setCurrentStepIndex(0);
      setIsPlaying(false);
      setSingleError("");
      setRunSource(getRunSourceFallback(nextRun));
    } catch (launchError) {
      setIsPlaying(false);
      setSingleError(
        launchError instanceof Error
          ? launchError.message
          : "Unable to build the requested trace."
      );
    }
  }

  function openAlgorithmPlayground(algorithmId: string) {
    const nextAlgorithm = getAlgorithmById(algorithmId);
    launchRun(nextAlgorithm.id, nextAlgorithm.defaultInput);
    navigate({ page: "playground", algorithmId: nextAlgorithm.id });
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

  async function loadSavedRun(runId: string) {
    setLoadingSavedRunId(runId);

    try {
      const detail = await fetchPersistedRunDetail(runId);
      const hydratedRun = hydratePersistedRun(detail);
      setRun(hydratedRun);
      setSelectedAlgorithmId(hydratedRun.algorithm.id);
      setSingleInputText(hydratedRun.normalizedInputText);
      setCurrentStepIndex(0);
      setIsPlaying(false);
      setSingleError("");
      setRunSource({
        label: "Saved run",
        detail: `${detail.algorithmLabel} recorded ${formatTimestamp(detail.recordedAt)} with ${detail.stepCount} frames.`
      });
      navigate({ page: "playground", algorithmId: hydratedRun.algorithm.id });
    } catch (error) {
      setSingleError(
        error instanceof Error ? error.message : "Unable to load the selected saved run."
      );
      navigate({ page: "history" });
    } finally {
      setLoadingSavedRunId(null);
    }
  }

  function selectStep(stepIndex: number) {
    setIsPlaying(false);
    setCurrentStepIndex(stepIndex);
  }

  function resetPlaybackToStart() {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }

  function togglePlay() {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (currentStepIndex >= activeStepCount - 1) {
      setCurrentStepIndex(0);
    }

    setIsPlaying(true);
  }

  return (
    <main className={`shell product-shell ${isPlaying ? "shell-playing" : ""}`}>
      <ProductNav foundation={foundation} route={route} status={status} />

      {route.page === "overview" ? (
        <OverviewPage
          foundation={foundation}
          onLoadSavedRun={loadSavedRun}
          persistence={persistence}
          persistedAlgorithms={persistedAlgorithms}
          recentComparisons={recentComparisons}
          recentRuns={recentRuns}
          status={status}
        />
      ) : null}

      {route.page === "library" ? (
        <LibraryPage
          onBrowse={(filters) => {
            navigate(buildLibraryRoute(filters));
          }}
          onOpenPlayground={openAlgorithmPlayground}
          persistedAlgorithms={persistedAlgorithms}
          route={route}
        />
      ) : null}

      {route.page === "algorithm-detail" ? (
        <AlgorithmDetailPage
          algorithm={getAlgorithmById(route.algorithmId)}
          onOpenPlayground={openAlgorithmPlayground}
          persistedAlgorithms={persistedAlgorithms}
        />
      ) : null}

      {route.page === "playground" ? (
        <PlaygroundPage
          currentStepIndex={currentStepIndex}
          isPlaying={isPlaying}
          onBack={() => {
            setIsPlaying(false);
            setCurrentStepIndex((stepIndex) => Math.max(0, stepIndex - 1));
          }}
          onEnd={() => {
            setIsPlaying(false);
            setCurrentStepIndex(run.trace.steps.length - 1);
          }}
          onForward={() => {
            setIsPlaying(false);
            setCurrentStepIndex((stepIndex) => Math.min(run.trace.steps.length - 1, stepIndex + 1));
          }}
          onInputChange={setSingleInputText}
          onLaunchRun={() => {
            launchRun(selectedAlgorithmId, singleInputText);
          }}
          onSelectAlgorithm={openAlgorithmPlayground}
          onSelectStep={selectStep}
          onSpeedSelect={setSpeedId}
          onStart={resetPlaybackToStart}
          onTogglePlay={togglePlay}
          run={run}
          runSource={runSource}
          selectedAlgorithm={selectedAlgorithm}
          selectedAlgorithmId={selectedAlgorithmId}
          singleError={singleError}
          singleInputText={singleInputText}
          speedId={speedId}
          status={status}
        />
      ) : null}

      {route.page === "compare" ? (
        <ComparePage
          compareError={compareError}
          compareInputText={compareInputText}
          comparisonRuns={comparisonRuns}
          currentStepIndex={currentStepIndex}
          isPlaying={isPlaying}
          onBack={() => {
            setIsPlaying(false);
            setCurrentStepIndex((stepIndex) => Math.max(0, stepIndex - 1));
          }}
          onEnd={() => {
            const lastIndex = Math.max(
              ...comparisonRuns.map((comparisonRun) => comparisonRun.trace.steps.length - 1)
            );
            setIsPlaying(false);
            setCurrentStepIndex(lastIndex);
          }}
          onForward={() => {
            const lastIndex = Math.max(
              ...comparisonRuns.map((comparisonRun) => comparisonRun.trace.steps.length - 1)
            );
            setIsPlaying(false);
            setCurrentStepIndex((stepIndex) => Math.min(lastIndex, stepIndex + 1));
          }}
          onInputChange={setCompareInputText}
          onLaunchComparison={() => {
            launchComparison(compareInputText);
          }}
          onSelectStep={selectStep}
          onSpeedSelect={setSpeedId}
          onStart={resetPlaybackToStart}
          onTogglePlay={togglePlay}
          recentComparisons={recentComparisons}
          speedId={speedId}
        />
      ) : null}

      {route.page === "history" ? (
        <HistoryPage
          loadingSavedRunId={loadingSavedRunId}
          onLoadSavedRun={loadSavedRun}
          onRefresh={() => {
            void refreshProductData();
          }}
          persistence={persistence}
          recentComparisons={recentComparisons}
          recentRuns={recentRuns}
          status={status}
        />
      ) : null}
    </main>
  );
}
