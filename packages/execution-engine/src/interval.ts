import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type IntervalAlgorithmId = "merge-intervals";

export const intervalAlgorithmIds: IntervalAlgorithmId[] = ["merge-intervals"];

export interface IntervalInput extends JsonObject {
  intervals: number[][];
}

export interface IntervalExecutionState extends JsonObject {
  orderedIntervals: number[][];
  currentIndex: number | null;
  activeInterval: number[];
  comparisonInterval: number[];
  mergedIntervals: number[][];
  activeGroupIndices: number[];
  consumedIndices: number[];
  overlapRange: number[];
}

interface IntervalMetricState {
  comparisons: number;
  merges: number;
  outputs: number;
}

interface IntervalAlgorithmDefinition {
  id: IntervalAlgorithmId;
  label: string;
  implementationVersion: string;
}

const intervalAlgorithmDefinitions: Record<IntervalAlgorithmId, IntervalAlgorithmDefinition> = {
  "merge-intervals": {
    id: "merge-intervals",
    label: "Merge Intervals",
    implementationVersion: "interval-engine-0.1.0"
  }
};

export const intervalMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "comparisons",
    label: "Overlap checks",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "merges",
    label: "Merges",
    unit: "count",
    direction: "neutral"
  },
  {
    key: "outputs",
    label: "Merged outputs",
    unit: "count",
    direction: "lower-is-better"
  }
];

export const defaultMergeIntervalsInput: IntervalInput = {
  intervals: [
    [1, 3],
    [2, 6],
    [8, 10],
    [15, 18]
  ]
};

function cloneIntervals(intervals: number[][]): number[][] {
  return intervals.map((interval) => interval.slice());
}

function cloneIntervalState(state: IntervalExecutionState): IntervalExecutionState {
  return {
    orderedIntervals: cloneIntervals(state.orderedIntervals),
    currentIndex: state.currentIndex,
    activeInterval: state.activeInterval.slice(),
    comparisonInterval: state.comparisonInterval.slice(),
    mergedIntervals: cloneIntervals(state.mergedIntervals),
    activeGroupIndices: state.activeGroupIndices.slice(),
    consumedIndices: state.consumedIndices.slice(),
    overlapRange: state.overlapRange.slice()
  };
}

function createIntervalRecorder(algorithmId: IntervalAlgorithmId) {
  return createTraceRecorder<IntervalExecutionState, IntervalExecutionState, IntervalMetricState>({
    algorithmId,
    projectState: cloneIntervalState,
    projectMetrics(metrics) {
      return {
        comparisons: metrics.comparisons,
        merges: metrics.merges,
        outputs: metrics.outputs
      };
    }
  });
}

function normalizeSingleInterval(interval: unknown, index: number): number[] {
  if (!Array.isArray(interval) || interval.length !== 2) {
    throw new Error(`Interval input interval[${index}] must contain exactly two integers.`);
  }

  const start = interval[0];
  const end = interval[1];

  if (typeof start !== "number" || !Number.isInteger(start)) {
    throw new Error(`Interval input interval[${index}][0] must be an integer.`);
  }

  if (typeof end !== "number" || !Number.isInteger(end)) {
    throw new Error(`Interval input interval[${index}][1] must be an integer.`);
  }

  if (start > end) {
    throw new Error(`Interval input interval[${index}] must satisfy start <= end.`);
  }

  return [start, end];
}

function normalizeIntervalInput(candidate: unknown): IntervalInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Interval input must be an object with an intervals array.");
  }

  const value = candidate as {
    intervals?: unknown;
  };

  if (!Array.isArray(value.intervals) || value.intervals.length === 0) {
    throw new Error("Interval input must include at least one interval.");
  }

  if (value.intervals.length > 12) {
    throw new Error("Interval input must contain 12 intervals or fewer.");
  }

  return {
    intervals: value.intervals.map((interval, index) =>
      normalizeSingleInterval(interval, index)
    )
  };
}

export function parseIntervalInputText(inputText: string): IntervalInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(inputText);
  } catch {
    throw new Error("Interval input must be valid JSON.");
  }

  return normalizeIntervalInput(parsed);
}

export function serializeIntervalInput(input: IntervalInput): string {
  return JSON.stringify(
    {
      intervals: input.intervals
    },
    null,
    2
  );
}

function sortIntervals(intervals: number[][]): number[][] {
  return cloneIntervals(intervals).sort((left, right) => {
    if (left[0] !== right[0]) {
      return left[0]! - right[0]!;
    }

    return left[1]! - right[1]!;
  });
}

function buildIntervalEnvelope(
  definition: IntervalAlgorithmDefinition,
  input: IntervalInput,
  recorder: ReturnType<typeof createIntervalRecorder>
): TraceEnvelope<IntervalExecutionState> {
  return createTraceEnvelope({
    algorithm: {
      id: definition.id,
      label: definition.label,
      domain: "interval",
      implementationVersion: definition.implementationVersion
    },
    input,
    steps: recorder.getSteps(),
    metricDefinitions: intervalMetricDefinitions,
    comparisonMetricKeys: ["comparisons", "merges", "outputs"]
  });
}

export function buildMergeIntervalsTrace(input: IntervalInput): TraceEnvelope<IntervalExecutionState> {
  const definition = intervalAlgorithmDefinitions["merge-intervals"];
  const normalizedInput = normalizeIntervalInput(input);
  const orderedIntervals = cloneIntervals(normalizedInput.intervals);
  const recorder = createIntervalRecorder(definition.id);
  const metrics: IntervalMetricState = {
    comparisons: 0,
    merges: 0,
    outputs: 0
  };
  const mergedIntervals: number[][] = [];
  let activeInterval: number[] = [];
  let activeGroupIndices: number[] = [];
  const consumedIndices: number[] = [];
  let comparisonInterval: number[] = [];
  let currentIndex: number | null = null;
  let overlapRange: number[] = [];

  const runtimeState = (): IntervalExecutionState => ({
    orderedIntervals: cloneIntervals(orderedIntervals),
    currentIndex,
    activeInterval: activeInterval.slice(),
    comparisonInterval: comparisonInterval.slice(),
    mergedIntervals: cloneIntervals(mergedIntervals),
    activeGroupIndices: activeGroupIndices.slice(),
    consumedIndices: consumedIndices.slice(),
    overlapRange: overlapRange.slice()
  });

  recorder.push({
    phase: "Initialization",
    description:
      "The replay starts from the raw interval list before any ordering or overlap reasoning has happened.",
    explanation: {
      summary: "Seed the interval list before sorting or merging begins.",
      details:
        "The initial frame keeps the unsorted editor order explicit so replay can separate the sort phase from overlap resolution.",
      tags: ["snapshot", "intervals"]
    },
    runtimeState: runtimeState(),
    metrics,
    highlights: [
      {
        key: "interval-input-seeded",
        path: "state.orderedIntervals",
        kind: "collection",
        intent: "focus",
        label: `${orderedIntervals.length} intervals queued`
      }
    ]
  });

  const sortedIntervals = sortIntervals(orderedIntervals);
  orderedIntervals.splice(0, orderedIntervals.length, ...sortedIntervals);

  recorder.push({
    phase: "Sort",
    description:
      "The intervals are ordered by start time, with end-time tie breaks, so one left-to-right pass can merge every overlap deterministically.",
    explanation: {
      summary: "Sort intervals by their starting boundary before scanning for overlaps.",
      details:
        "Merge Intervals becomes a single deterministic scan once the earlier-starting ranges always appear first.",
      tags: ["ordering", "intervals"]
    },
    runtimeState: runtimeState(),
    metrics,
    highlights: [
      {
        key: "intervals-sorted",
        path: "state.orderedIntervals",
        kind: "collection",
        intent: "focus",
        label: "Intervals sorted by start boundary"
      }
    ]
  });

  activeInterval = orderedIntervals[0]!.slice();
  activeGroupIndices = [0];
  consumedIndices.push(0);

  recorder.push({
    phase: "Seed Active",
    description:
      "The first sorted interval becomes the active merged span before any overlap checks begin.",
    explanation: {
      summary: "Promote the first sorted interval into the active span.",
      details:
        "The active span carries forward until a later interval proves disjoint enough to force a commit.",
      tags: ["active", "intervals"]
    },
    runtimeState: runtimeState(),
    metrics,
    highlights: [
      {
        key: "interval-active-seed",
        path: "state.activeInterval",
        kind: "range",
        intent: "active",
        label: `Active ${activeInterval[0]}-${activeInterval[1]}`
      }
    ]
  });

  for (let index = 1; index < orderedIntervals.length; index += 1) {
    const candidateInterval = orderedIntervals[index]!.slice();
    const overlapStart = Math.max(activeInterval[0]!, candidateInterval[0]!);
    const overlapEnd = Math.min(activeInterval[1]!, candidateInterval[1]!);
    const overlaps = overlapStart <= overlapEnd;

    currentIndex = index;
    comparisonInterval = candidateInterval;
    overlapRange = overlaps ? [overlapStart, overlapEnd] : [];
    metrics.comparisons += 1;

    recorder.push({
      phase: "Compare",
      description: overlaps
        ? `Interval ${candidateInterval[0]}-${candidateInterval[1]} overlaps the active span ${activeInterval[0]}-${activeInterval[1]} across ${overlapStart}-${overlapEnd}.`
        : `Interval ${candidateInterval[0]}-${candidateInterval[1]} starts after the active span ${activeInterval[0]}-${activeInterval[1]}, so the current merge must be committed first.`,
      explanation: {
        summary: overlaps
          ? "Check the next interval against the current merged span and confirm the overlap."
          : "Check the next interval against the current merged span and detect a gap.",
        details:
          "Each comparison happens in sorted order, so the scan only needs to compare the current interval with the active merged span instead of rechecking earlier ranges.",
        tags: ["comparison", overlaps ? "overlap" : "gap"]
      },
      runtimeState: runtimeState(),
      metrics,
      highlights: [
        {
          key: `interval-compare-${index}`,
          path: "state.comparisonInterval",
          kind: "range",
          intent: overlaps ? "candidate" : "focus",
          label: `Compare ${candidateInterval[0]}-${candidateInterval[1]}`
        },
        ...(overlaps
          ? [
              {
                key: `interval-overlap-${index}`,
                path: "state.overlapRange",
                kind: "range" as const,
                intent: "focus" as const,
                label: `Overlap ${overlapStart}-${overlapEnd}`
              }
            ]
          : [])
      ]
    });

    if (overlaps) {
      activeInterval = [
        Math.min(activeInterval[0]!, candidateInterval[0]!),
        Math.max(activeInterval[1]!, candidateInterval[1]!)
      ];
      activeGroupIndices = [...activeGroupIndices, index];
      consumedIndices.push(index);
      metrics.merges += 1;

      recorder.push({
        phase: "Merge",
        description: `The active span expands to ${activeInterval[0]}-${activeInterval[1]} so both intervals collapse into one merged range.`,
        explanation: {
          summary: "Extend the active span to cover the full overlap cluster.",
          details:
            "Only the right boundary can grow after sorting, which keeps the merge step deterministic and easy to replay.",
          tags: ["merge", "intervals"]
        },
        runtimeState: runtimeState(),
        metrics,
        highlights: [
          {
            key: `interval-merge-${index}`,
            path: "state.activeInterval",
            kind: "range",
            intent: "mutation",
            label: `Merged span ${activeInterval[0]}-${activeInterval[1]}`
          }
        ]
      });

      continue;
    }

    mergedIntervals.push(activeInterval.slice());
    metrics.outputs += 1;

    recorder.push({
      phase: "Commit",
      description: `The merged span ${activeInterval[0]}-${activeInterval[1]} is committed because the next interval begins at ${candidateInterval[0]}.`,
      explanation: {
        summary: "Publish the finished merged span before starting a new group.",
        details:
          "A gap means no later interval can connect back to the current span, so the result can be committed immediately.",
        tags: ["output", "intervals"]
      },
      runtimeState: runtimeState(),
      metrics,
      highlights: [
        {
          key: `interval-output-${index}`,
          path: "state.mergedIntervals",
          kind: "collection",
          intent: "result",
          label: `Output ${activeInterval[0]}-${activeInterval[1]}`
        }
      ]
    });

    activeInterval = candidateInterval.slice();
    activeGroupIndices = [index];
    consumedIndices.push(index);
    comparisonInterval = [];
    overlapRange = [];

    recorder.push({
      phase: "Start New",
      description: `Interval ${activeInterval[0]}-${activeInterval[1]} becomes the next active span after the gap.`,
      explanation: {
        summary: "Reset the active span to the first disjoint interval.",
        details:
          "The scan continues from left to right with the new disjoint interval as the active merge candidate.",
        tags: ["active", "intervals"]
      },
      runtimeState: runtimeState(),
      metrics,
      highlights: [
        {
          key: `interval-new-active-${index}`,
          path: "state.activeInterval",
          kind: "range",
          intent: "active",
          label: `Active ${activeInterval[0]}-${activeInterval[1]}`
        }
      ]
    });
  }

  mergedIntervals.push(activeInterval.slice());
  metrics.outputs += 1;
  currentIndex = null;
  comparisonInterval = [];
  overlapRange = [];

  recorder.push({
    phase: "Final Commit",
    description: `The last active span ${activeInterval[0]}-${activeInterval[1]} is appended to complete the merged result.`,
    explanation: {
      summary: "Commit the final active span after the scan finishes.",
      details:
        "The scan ends with one active span still live, so the terminal output step records it explicitly before publishing the final result.",
      tags: ["output", "result"]
    },
    runtimeState: runtimeState(),
    metrics,
    highlights: [
      {
        key: "interval-final-output",
        path: "state.mergedIntervals",
        kind: "collection",
        intent: "result",
        label: `${mergedIntervals.length} merged intervals ready`
      }
    ]
  });

  activeInterval = [];
  activeGroupIndices = [];

  recorder.push({
    phase: "Done",
    description: `The replay resolves ${normalizedInput.intervals.length} input intervals into ${mergedIntervals.length} merged interval${mergedIntervals.length === 1 ? "" : "s"}.`,
    explanation: {
      summary: "Publish the merged interval list as the terminal result.",
      details:
        "The terminal frame keeps the sorted inputs and merged outputs together so replay never recomputes the answer from intermediate steps.",
      tags: ["result", "intervals"]
    },
    runtimeState: runtimeState(),
    metrics,
    highlights: [
      {
        key: "interval-result",
        path: "state.mergedIntervals",
        kind: "collection",
        intent: "result",
        label: `Result ${mergedIntervals.map((interval) => `${interval[0]}-${interval[1]}`).join(", ")}`
      }
    ]
  });

  return buildIntervalEnvelope(definition, normalizedInput, recorder);
}

export function buildIntervalTrace(
  algorithmId: IntervalAlgorithmId,
  input: IntervalInput
): TraceEnvelope<IntervalExecutionState> {
  switch (algorithmId) {
    case "merge-intervals":
      return buildMergeIntervalsTrace(input);
  }
}
