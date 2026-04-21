import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type TwoPointersAlgorithmId = "container-with-most-water";

export const twoPointersAlgorithmIds: TwoPointersAlgorithmId[] = [
  "container-with-most-water"
];

export interface TwoPointersInput extends JsonObject {
  heights: number[];
}

export interface TwoPointersExecutionState extends JsonObject {
  heights: number[];
  left: number | null;
  right: number | null;
  width: number | null;
  limitingHeight: number | null;
  currentArea: number | null;
  bestArea: number;
  bestLeft: number | null;
  bestRight: number | null;
  movedPointer: "left" | "right" | null;
  evaluatedPairs: number[][];
}

interface TwoPointersMetricState {
  evaluations: number;
  moves: number;
  bestUpdates: number;
}

interface TwoPointersAlgorithmDefinition {
  id: TwoPointersAlgorithmId;
  label: string;
  implementationVersion: string;
}

const twoPointersAlgorithmDefinitions: Record<
  TwoPointersAlgorithmId,
  TwoPointersAlgorithmDefinition
> = {
  "container-with-most-water": {
    id: "container-with-most-water",
    label: "Container With Most Water",
    implementationVersion: "two-pointers-engine-0.1.0"
  }
};

export const twoPointersMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "evaluations",
    label: "Pair evaluations",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "moves",
    label: "Pointer moves",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "bestUpdates",
    label: "Best-area updates",
    unit: "count",
    direction: "neutral"
  }
];

export const defaultContainerWithMostWaterInput: TwoPointersInput = {
  heights: [1, 8, 6, 2, 5, 4, 8, 3, 7]
};

function cloneEvaluatedPairs(pairs: number[][]) {
  return pairs.map((pair) => pair.slice(0, 2));
}

function cloneTwoPointersState(
  state: TwoPointersExecutionState
): TwoPointersExecutionState {
  return {
    heights: state.heights.slice(),
    left: state.left,
    right: state.right,
    width: state.width,
    limitingHeight: state.limitingHeight,
    currentArea: state.currentArea,
    bestArea: state.bestArea,
    bestLeft: state.bestLeft,
    bestRight: state.bestRight,
    movedPointer: state.movedPointer,
    evaluatedPairs: cloneEvaluatedPairs(state.evaluatedPairs)
  };
}

function createTwoPointersRecorder(algorithmId: TwoPointersAlgorithmId) {
  return createTraceRecorder<
    TwoPointersExecutionState,
    TwoPointersExecutionState,
    TwoPointersMetricState
  >({
    algorithmId,
    projectState: cloneTwoPointersState,
    projectMetrics(metrics) {
      return {
        evaluations: metrics.evaluations,
        moves: metrics.moves,
        bestUpdates: metrics.bestUpdates
      };
    }
  });
}

function normalizeTwoPointersInput(candidate: unknown): TwoPointersInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Two-pointers input must be an object with a heights array.");
  }

  const value = candidate as {
    heights?: unknown;
  };

  if (!Array.isArray(value.heights) || value.heights.length < 2) {
    throw new Error("Two-pointers input must include at least two heights.");
  }

  if (value.heights.length > 24) {
    throw new Error("Two-pointers input arrays must contain 24 heights or fewer.");
  }

  const heights = value.heights.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry) || entry <= 0) {
      throw new Error(`heights[${index}] must be a positive integer.`);
    }

    return entry;
  });

  return {
    heights
  };
}

export function parseTwoPointersInputText(inputText: string): TwoPointersInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(inputText);
  } catch {
    throw new Error("Two-pointers input must be valid JSON.");
  }

  return normalizeTwoPointersInput(parsed);
}

export function serializeTwoPointersInput(input: TwoPointersInput): string {
  return JSON.stringify(
    {
      heights: input.heights
    },
    null,
    2
  );
}

function buildTwoPointersEnvelope(
  definition: TwoPointersAlgorithmDefinition,
  input: TwoPointersInput,
  recorder: ReturnType<typeof createTwoPointersRecorder>
): TraceEnvelope<TwoPointersExecutionState> {
  return createTraceEnvelope({
    algorithm: {
      id: definition.id,
      label: definition.label,
      domain: "two-pointers",
      implementationVersion: definition.implementationVersion
    },
    input,
    steps: recorder.getSteps(),
    metricDefinitions: twoPointersMetricDefinitions,
    comparisonMetricKeys: ["evaluations", "moves", "bestUpdates"]
  });
}

export function buildContainerWithMostWaterTrace(
  input: TwoPointersInput
): TraceEnvelope<TwoPointersExecutionState> {
  const definition = twoPointersAlgorithmDefinitions["container-with-most-water"];
  const normalizedInput = normalizeTwoPointersInput(input);
  const heights = normalizedInput.heights.slice();
  const recorder = createTwoPointersRecorder(definition.id);
  const metrics: TwoPointersMetricState = {
    evaluations: 0,
    moves: 0,
    bestUpdates: 0
  };
  const evaluatedPairs: number[][] = [];
  let left: number | null = 0;
  let right: number | null = heights.length - 1;
  let width: number | null = null;
  let limitingHeight: number | null = null;
  let currentArea: number | null = null;
  let bestArea = 0;
  let bestLeft: number | null = null;
  let bestRight: number | null = null;
  let movedPointer: "left" | "right" | null = null;

  const createRuntimeState = () =>
    cloneTwoPointersState({
      heights,
      left,
      right,
      width,
      limitingHeight,
      currentArea,
      bestArea,
      bestLeft,
      bestRight,
      movedPointer,
      evaluatedPairs
    });

  recorder.push({
    phase: "Initialization",
    description:
      "The replay begins with both pointers at the outer walls so every later jump can restore the full candidate span directly.",
    explanation: {
      summary: "Seed the full wall array before the first container evaluation.",
      details:
        "Container With Most Water only mutates pointer positions and the running best area, so replay snapshots record the whole height deck plus the active walls at every checkpoint.",
      tags: ["snapshot", "input"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "two-pointers-initial-span",
        path: "state.heights",
        kind: "range",
        intent: "focus",
        label: `Active span 0 through ${heights.length - 1}`,
        metadata: {
          start: 0,
          end: heights.length - 1
        }
      }
    ]
  });

  while (left !== null && right !== null && left < right) {
    width = right - left;
    limitingHeight = Math.min(heights[left]!, heights[right]!);
    currentArea = width * limitingHeight;
    movedPointer = null;
    evaluatedPairs.push([left, right]);
    metrics.evaluations += 1;

    recorder.push({
      phase: "Evaluate",
      description: `Evaluate walls ${left} and ${right}. Width ${width} with limiting height ${limitingHeight} yields area ${currentArea}.`,
      explanation: {
        summary: "Measure the container defined by the active outer walls.",
        details:
          "The current area depends only on the pointer gap and the shorter wall, so replay stores both values explicitly before any pointer moves.",
        tags: ["evaluate", "container"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `two-pointers-current-span-${left}-${right}`,
          path: "state.heights",
          kind: "range",
          intent: "focus",
          label: `Evaluate walls ${left} and ${right}`,
          metadata: {
            start: left,
            end: right
          }
        },
        {
          key: `two-pointers-left-${left}`,
          path: "state.left",
          kind: "index",
          intent: "active",
          label: `Left wall ${left}`,
          metadata: {
            index: left,
            height: heights[left]!
          }
        },
        {
          key: `two-pointers-right-${right}`,
          path: "state.right",
          kind: "index",
          intent: "active",
          label: `Right wall ${right}`,
          metadata: {
            index: right,
            height: heights[right]!
          }
        }
      ]
    });

    if (currentArea > bestArea) {
      bestArea = currentArea;
      bestLeft = left;
      bestRight = right;
      metrics.bestUpdates += 1;

      recorder.push({
        phase: "Best Update",
        description: `Area ${currentArea} becomes the new best container, replacing the previous best area.`,
        explanation: {
          summary: "Publish a new best container when the active pair beats every earlier evaluation.",
          details:
            "Best-area updates are recorded as their own checkpoints so replay can jump directly to the winning pair history without recomputing prior evaluations.",
          tags: ["best", "checkpoint"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `two-pointers-best-${left}-${right}`,
            path: "state.bestArea",
            kind: "range",
            intent: "result",
            label: `Best pair ${left} through ${right}`,
            metadata: {
              start: left,
              end: right,
              area: currentArea
            }
          }
        ]
      });
    }

    if (heights[left]! <= heights[right]!) {
      left += 1;
      movedPointer = "left";
    } else {
      right -= 1;
      movedPointer = "right";
    }

    metrics.moves += 1;

    recorder.push({
      phase: movedPointer === "left" ? "Move Left" : "Move Right",
      description:
        movedPointer === "left"
          ? `Move the left pointer inward because wall ${left - 1} cannot beat the current best with any narrower container.`
          : `Move the right pointer inward because wall ${right + 1} cannot beat the current best with any narrower container.`,
      explanation: {
        summary:
          movedPointer === "left"
            ? "Discard the shorter left wall and search for a taller replacement."
            : "Discard the shorter right wall and search for a taller replacement.",
        details:
          "The shorter wall limits the current area, so keeping it while shrinking the width cannot improve the result. Replay stores the chosen pointer move as explicit state instead of inferring it from the next evaluation.",
        tags: ["pointer", "prune"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `two-pointers-move-${movedPointer}-${metrics.moves}`,
          path: movedPointer === "left" ? "state.left" : "state.right",
          kind: "index",
          intent: "mutation",
          label:
            movedPointer === "left"
              ? `Left pointer moved to ${left}`
              : `Right pointer moved to ${right}`,
          metadata: {
            index: movedPointer === "left" ? left : right
          }
        }
      ]
    });
  }

  left = null;
  right = null;
  width = null;
  limitingHeight = null;
  currentArea = null;
  movedPointer = null;

  recorder.push({
    phase: "Done",
    description: `The pointer sweep is complete. Best container area ${bestArea} comes from walls ${bestLeft} and ${bestRight}.`,
    explanation: {
      summary: "Record the final best container after the pointer sweep collapses.",
      details:
        "The terminal checkpoint stores the winning wall pair and best area directly so replay and persistence never infer the result from earlier frames.",
      tags: ["result", "container"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "two-pointers-final-best-area",
        path: "state.bestArea",
        kind: "collection",
        intent: "result",
        label: `Best area ${bestArea}`
      }
    ]
  });

  return buildTwoPointersEnvelope(definition, normalizedInput, recorder);
}

export function buildTwoPointersTrace(
  algorithmId: TwoPointersAlgorithmId,
  input: TwoPointersInput
): TraceEnvelope<TwoPointersExecutionState> {
  switch (algorithmId) {
    case "container-with-most-water":
      return buildContainerWithMostWaterTrace(input);
  }
}
