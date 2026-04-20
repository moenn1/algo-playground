import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type WindowAlgorithmId = "minimum-size-subarray-sum";

export const windowAlgorithmIds: WindowAlgorithmId[] = ["minimum-size-subarray-sum"];

export interface WindowInput extends JsonObject {
  array: number[];
  target: number;
}

export interface WindowExecutionState extends JsonObject {
  array: number[];
  target: number;
  left: number | null;
  right: number | null;
  activeSum: number;
  bestStart: number | null;
  bestEnd: number | null;
  bestLength: number | null;
  candidateSatisfied: boolean;
}

interface WindowMetricState {
  expansions: number;
  shrinks: number;
  bestUpdates: number;
}

interface WindowAlgorithmDefinition {
  id: WindowAlgorithmId;
  label: string;
  implementationVersion: string;
}

interface WindowRuntimeState {
  array: number[];
  target: number;
  left: number;
  right: number;
  activeSum: number;
  bestStart: number | null;
  bestEnd: number | null;
  bestLength: number | null;
  candidateSatisfied: boolean;
}

const windowAlgorithmDefinitions: Record<WindowAlgorithmId, WindowAlgorithmDefinition> = {
  "minimum-size-subarray-sum": {
    id: "minimum-size-subarray-sum",
    label: "Minimum Size Subarray Sum",
    implementationVersion: "window-engine-0.1.0"
  }
};

export const windowMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "expansions",
    label: "Window expansions",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "shrinks",
    label: "Window shrinks",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "bestUpdates",
    label: "Best-window updates",
    unit: "count",
    direction: "lower-is-better"
  }
];

export const defaultMinimumSizeSubarrayInput: WindowInput = {
  array: [2, 3, 1, 2, 4, 3],
  target: 7
};

function cloneWindowState(state: WindowExecutionState): WindowExecutionState {
  return {
    array: state.array.slice(),
    target: state.target,
    left: state.left,
    right: state.right,
    activeSum: state.activeSum,
    bestStart: state.bestStart,
    bestEnd: state.bestEnd,
    bestLength: state.bestLength,
    candidateSatisfied: state.candidateSatisfied
  };
}

function createWindowRecorder(algorithmId: WindowAlgorithmId) {
  return createTraceRecorder<WindowRuntimeState, WindowExecutionState, WindowMetricState>({
    algorithmId,
    projectState(runtimeState) {
      const hasActiveWindow = runtimeState.right >= runtimeState.left;

      return cloneWindowState({
        array: runtimeState.array,
        target: runtimeState.target,
        left: hasActiveWindow ? runtimeState.left : null,
        right: hasActiveWindow ? runtimeState.right : null,
        activeSum: runtimeState.activeSum,
        bestStart: runtimeState.bestStart,
        bestEnd: runtimeState.bestEnd,
        bestLength: runtimeState.bestLength,
        candidateSatisfied: runtimeState.candidateSatisfied
      });
    },
    projectMetrics(metrics) {
      return {
        expansions: metrics.expansions,
        shrinks: metrics.shrinks,
        bestUpdates: metrics.bestUpdates
      };
    }
  });
}

function normalizeWindowInput(candidate: unknown): WindowInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Window input must be an object with array and target.");
  }

  const value = candidate as {
    array?: unknown;
    target?: unknown;
  };

  if (!Array.isArray(value.array) || value.array.length < 2) {
    throw new Error("Window input must include an array with at least two positive integers.");
  }

  if (value.array.length > 32) {
    throw new Error("Window input arrays must contain 32 integers or fewer.");
  }

  const array = value.array.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry) || entry <= 0) {
      throw new Error(`array[${index}] must be a positive integer.`);
    }

    return entry;
  });

  if (typeof value.target !== "number" || !Number.isInteger(value.target) || value.target <= 0) {
    throw new Error("Window input target must be a positive integer.");
  }

  return {
    array,
    target: value.target
  };
}

export function parseWindowInputText(inputText: string): WindowInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(inputText);
  } catch {
    throw new Error("Window input must be valid JSON.");
  }

  return normalizeWindowInput(parsed);
}

export function serializeWindowInput(input: WindowInput): string {
  return JSON.stringify(
    {
      array: input.array,
      target: input.target
    },
    null,
    2
  );
}

function buildWindowEnvelope(
  definition: WindowAlgorithmDefinition,
  input: WindowInput,
  recorder: ReturnType<typeof createWindowRecorder>
): TraceEnvelope<WindowExecutionState> {
  return createTraceEnvelope({
    algorithm: {
      id: definition.id,
      label: definition.label,
      domain: "window",
      implementationVersion: definition.implementationVersion
    },
    input,
    steps: recorder.getSteps(),
    metricDefinitions: windowMetricDefinitions,
    comparisonMetricKeys: ["expansions", "shrinks", "bestUpdates"]
  });
}

export function buildMinimumSizeSubarrayTrace(
  input: WindowInput
): TraceEnvelope<WindowExecutionState> {
  const definition = windowAlgorithmDefinitions["minimum-size-subarray-sum"];
  const normalizedInput = normalizeWindowInput(input);
  const values = normalizedInput.array.slice();
  const recorder = createWindowRecorder(definition.id);
  const metrics: WindowMetricState = {
    expansions: 0,
    shrinks: 0,
    bestUpdates: 0
  };
  let left = 0;
  let activeSum = 0;
  let bestStart: number | null = null;
  let bestEnd: number | null = null;
  let bestLength: number | null = null;

  const createRuntimeState = (
    right: number,
    candidateSatisfied: boolean
  ): WindowRuntimeState => ({
    array: values,
    target: normalizedInput.target,
    left,
    right,
    activeSum,
    bestStart,
    bestEnd,
    bestLength,
    candidateSatisfied
  });

  recorder.push({
    phase: "Initialization",
    description:
      "The replay begins before the first expansion, with an empty active window and no qualifying segment recorded yet.",
    explanation: {
      summary: "Seed the array, target, and empty window before any expansion occurs.",
      details:
        "The timeline stores an explicit empty-window frame so later scrubs never have to infer the pre-scan state.",
      tags: ["snapshot", "input"]
    },
    runtimeState: createRuntimeState(-1, false),
    metrics,
    highlights: [
      {
        key: "window-target-initial",
        path: "state.target",
        kind: "value",
        intent: "focus",
        label: `Target sum ${normalizedInput.target}`
      }
    ]
  });

  for (let right = 0; right < values.length; right += 1) {
    activeSum += values[right]!;
    metrics.expansions += 1;

    recorder.push({
      phase: "Expand",
      description: `Extend the window through lane ${right}, raising the active sum to ${activeSum}.`,
      explanation: {
        summary: "Grow the right edge and record the new active sum.",
        details:
          "Sliding-window replay depends on explicit expansion checkpoints so the active interval and aggregate sum always restore together.",
        tags: ["window", "expansion"]
      },
      runtimeState: createRuntimeState(right, activeSum >= normalizedInput.target),
      metrics,
      highlights: [
        {
          key: `window-active-${right}`,
          path: "state.activeSum",
          kind: "range",
          intent: activeSum >= normalizedInput.target ? "candidate" : "focus",
          label: `Active window ${left} through ${right}`,
          metadata: {
            start: left,
            end: right,
            sum: activeSum
          }
        }
      ]
    });

    while (activeSum >= normalizedInput.target) {
      const currentLength = right - left + 1;

      recorder.push({
        phase: "Candidate",
        description: `The current window reaches target ${normalizedInput.target}, so lane range ${left} through ${right} becomes a qualifying candidate.`,
        explanation: {
          summary: "Mark the current interval as a valid candidate before shrinking it.",
          details:
            "Recording the qualifying window separately keeps the candidate sum and best-window comparison visible in replay.",
          tags: ["window", "candidate"]
        },
        runtimeState: createRuntimeState(right, true),
        metrics,
        highlights: [
          {
            key: `window-candidate-${left}-${right}`,
            path: "state.activeSum",
            kind: "range",
            intent: "candidate",
            label: `Candidate window ${left} through ${right}`,
            metadata: {
              start: left,
              end: right,
              sum: activeSum
            }
          }
        ]
      });

      if (bestLength === null || currentLength < bestLength) {
        bestStart = left;
        bestEnd = right;
        bestLength = currentLength;
        metrics.bestUpdates += 1;

        recorder.push({
          phase: "Best Update",
          description: `Window ${left} through ${right} is the shortest qualifying segment so far at length ${currentLength}.`,
          explanation: {
            summary: "Publish a new best qualifying window.",
            details:
              "The best-window checkpoint stores both the active interval and the best-so-far bounds so replay can compare them directly.",
            tags: ["result", "candidate"]
          },
          runtimeState: createRuntimeState(right, true),
          metrics,
          highlights: [
            {
              key: `window-best-${left}-${right}`,
              path: "state.bestLength",
              kind: "range",
              intent: "result",
              label: `Best window ${left} through ${right}`,
              metadata: {
                start: left,
                end: right,
                length: currentLength
              }
            }
          ]
        });
      }

      const outgoing = values[left]!;

      activeSum -= outgoing;
      left += 1;
      metrics.shrinks += 1;

      recorder.push({
        phase: "Shrink",
        description: `Drop lane ${left - 1} from the left edge, leaving active sum ${activeSum}.`,
        explanation: {
          summary: "Contract the left edge to search for a shorter qualifying interval.",
          details:
            "Positive inputs guarantee that shrinking only decreases the active sum, which keeps the minimum-window search deterministic.",
          tags: ["window", "shrink"]
        },
        runtimeState: createRuntimeState(right, activeSum >= normalizedInput.target),
        metrics,
        highlights: [
          {
            key: `window-shrink-${left - 1}-${right}`,
            path: "state.left",
            kind: "range",
            intent: "mutation",
            label:
              left <= right
                ? `Active window ${left} through ${right}`
                : "Window collapsed after shrink",
            metadata:
              left <= right
                ? {
                    start: left,
                    end: right,
                    sum: activeSum
                  }
                : {
                    start: left - 1,
                    end: right
                  }
          }
        ]
      });
    }
  }

  recorder.push({
    phase: bestLength === null ? "No Solution" : "Done",
    description:
      bestLength === null
        ? `No contiguous window reaches target ${normalizedInput.target}; the replay ends with no qualifying segment.`
        : `The best qualifying window spans lanes ${bestStart} through ${bestEnd} with length ${bestLength}.`,
    explanation: {
      summary:
        bestLength === null
          ? "Publish the terminal state with no qualifying window."
          : "Publish the shortest qualifying window as the terminal replay frame.",
      details:
        bestLength === null
          ? "The timeline stores the failed search explicitly so consumers do not infer absence from missing best-window bounds."
          : "The terminal frame keeps the best bounds, active sum, and final metrics in one replay-safe snapshot.",
      tags: ["result", bestLength === null ? "exhausted" : "window"]
    },
    runtimeState: createRuntimeState(values.length - 1, false),
    metrics,
    highlights: [
      {
        key: bestLength === null ? "window-no-solution" : "window-final-best",
        path: bestLength === null ? "state.target" : "state.bestLength",
        kind: bestLength === null ? "value" : "range",
        intent: "result",
        label:
          bestLength === null
            ? `No window reached target ${normalizedInput.target}`
            : `Shortest window ${bestStart} through ${bestEnd}`
      }
    ]
  });

  return buildWindowEnvelope(definition, normalizedInput, recorder);
}

export function buildWindowTrace(
  algorithmId: WindowAlgorithmId,
  input: WindowInput
): TraceEnvelope<WindowExecutionState> {
  switch (algorithmId) {
    case "minimum-size-subarray-sum":
      return buildMinimumSizeSubarrayTrace(input);
  }
}
