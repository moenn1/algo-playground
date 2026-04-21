import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type TwoPointersAlgorithmId =
  | "container-with-most-water"
  | "trapping-rain-water";

export const twoPointersAlgorithmIds: TwoPointersAlgorithmId[] = [
  "container-with-most-water",
  "trapping-rain-water"
];

export interface TwoPointersInput extends JsonObject {
  heights: number[];
}

export interface ContainerWithMostWaterExecutionState extends JsonObject {
  kind: "container-with-most-water";
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

export interface TrappingRainWaterExecutionState extends JsonObject {
  kind: "trapping-rain-water";
  heights: number[];
  left: number | null;
  right: number | null;
  leftMax: number | null;
  rightMax: number | null;
  currentFillIndex: number | null;
  currentFillAmount: number | null;
  totalWater: number;
  waterByIndex: number[];
  movedPointer: "left" | "right" | null;
  inspectedPairs: number[][];
}

export type TwoPointersExecutionState =
  | ContainerWithMostWaterExecutionState
  | TrappingRainWaterExecutionState;

interface ContainerMetricState extends JsonObject {
  evaluations: number;
  moves: number;
  bestUpdates: number;
}

interface TrappingRainWaterMetricState extends JsonObject {
  evaluations: number;
  moves: number;
  fills: number;
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
    implementationVersion: "two-pointers-engine-0.2.0"
  },
  "trapping-rain-water": {
    id: "trapping-rain-water",
    label: "Trapping Rain Water",
    implementationVersion: "two-pointers-engine-0.2.0"
  }
};

const containerMetricDefinitions: TraceMetricDefinition[] = [
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

const trappingRainWaterMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "evaluations",
    label: "Boundary evaluations",
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
    key: "fills",
    label: "Water fills",
    unit: "count",
    direction: "neutral"
  }
];

export const defaultContainerWithMostWaterInput: TwoPointersInput = {
  heights: [1, 8, 6, 2, 5, 4, 8, 3, 7]
};

export const defaultTrappingRainWaterInput: TwoPointersInput = {
  heights: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
};

function clonePairs(pairs: number[][]) {
  return pairs.map((pair) => pair.slice(0, 2));
}

function cloneContainerState(
  state: ContainerWithMostWaterExecutionState
): ContainerWithMostWaterExecutionState {
  return {
    kind: state.kind,
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
    evaluatedPairs: clonePairs(state.evaluatedPairs)
  };
}

function cloneTrappingRainWaterState(
  state: TrappingRainWaterExecutionState
): TrappingRainWaterExecutionState {
  return {
    kind: state.kind,
    heights: state.heights.slice(),
    left: state.left,
    right: state.right,
    leftMax: state.leftMax,
    rightMax: state.rightMax,
    currentFillIndex: state.currentFillIndex,
    currentFillAmount: state.currentFillAmount,
    totalWater: state.totalWater,
    waterByIndex: state.waterByIndex.slice(),
    movedPointer: state.movedPointer,
    inspectedPairs: clonePairs(state.inspectedPairs)
  };
}

function createTwoPointersRecorder<State extends TwoPointersExecutionState, MetricState>(
  algorithmId: TwoPointersAlgorithmId,
  projectState: (state: State) => State
) {
  return createTraceRecorder<State, State, MetricState>({
    algorithmId,
    projectState,
    projectMetrics(metrics) {
      return { ...(metrics as Record<string, number>) };
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
    if (typeof entry !== "number" || !Number.isInteger(entry) || entry < 0) {
      throw new Error(`heights[${index}] must be a non-negative integer.`);
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

function buildTwoPointersEnvelope<State extends TwoPointersExecutionState>(
  definition: TwoPointersAlgorithmDefinition,
  input: TwoPointersInput,
  recorder: {
    getSteps(): ReturnType<typeof createTraceEnvelope<State>> extends never
      ? never
      : Array<unknown>;
  },
  metricDefinitions: TraceMetricDefinition[],
  comparisonMetricKeys: string[]
): TraceEnvelope<State> {
  return createTraceEnvelope({
    algorithm: {
      id: definition.id,
      label: definition.label,
      domain: "two-pointers",
      implementationVersion: definition.implementationVersion
    },
    input,
    steps: recorder.getSteps() as TraceEnvelope<State>["steps"],
    metricDefinitions,
    comparisonMetricKeys
  });
}

export function buildContainerWithMostWaterTrace(
  input: TwoPointersInput
): TraceEnvelope<ContainerWithMostWaterExecutionState> {
  const definition = twoPointersAlgorithmDefinitions["container-with-most-water"];
  const normalizedInput = normalizeTwoPointersInput(input);
  const heights = normalizedInput.heights.slice();
  const recorder = createTwoPointersRecorder<
    ContainerWithMostWaterExecutionState,
    ContainerMetricState
  >(definition.id, cloneContainerState);
  const metrics: ContainerMetricState = {
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

  const createRuntimeState = (): ContainerWithMostWaterExecutionState =>
    cloneContainerState({
      kind: "container-with-most-water",
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

  return buildTwoPointersEnvelope(
    definition,
    normalizedInput,
    recorder,
    containerMetricDefinitions,
    ["evaluations", "moves", "bestUpdates"]
  );
}

export function buildTrappingRainWaterTrace(
  input: TwoPointersInput
): TraceEnvelope<TrappingRainWaterExecutionState> {
  const definition = twoPointersAlgorithmDefinitions["trapping-rain-water"];
  const normalizedInput = normalizeTwoPointersInput(input);
  const heights = normalizedInput.heights.slice();
  const recorder = createTwoPointersRecorder<
    TrappingRainWaterExecutionState,
    TrappingRainWaterMetricState
  >(definition.id, cloneTrappingRainWaterState);
  const metrics: TrappingRainWaterMetricState = {
    evaluations: 0,
    moves: 0,
    fills: 0
  };
  const waterByIndex = Array.from({ length: heights.length }, () => 0);
  const inspectedPairs: number[][] = [];
  let left: number | null = 0;
  let right: number | null = heights.length - 1;
  let leftMax: number | null = heights[0] ?? null;
  let rightMax: number | null = heights[heights.length - 1] ?? null;
  let currentFillIndex: number | null = null;
  let currentFillAmount: number | null = null;
  let totalWater = 0;
  let movedPointer: "left" | "right" | null = null;

  const createRuntimeState = (): TrappingRainWaterExecutionState =>
    cloneTrappingRainWaterState({
      kind: "trapping-rain-water",
      heights,
      left,
      right,
      leftMax,
      rightMax,
      currentFillIndex,
      currentFillAmount,
      totalWater,
      waterByIndex,
      movedPointer,
      inspectedPairs
    });

  recorder.push({
    phase: "Initialization",
    description:
      "The replay starts with both boundary walls active so every later frame can restore the trapped-water basin without replaying prior maxima.",
    explanation: {
      summary: "Seed the wall deck together with both running boundary maxima.",
      details:
        "Trapping Rain Water needs the active bounds, the best wall seen from each side, and the accumulated water ledger to stay deterministic during scrubbing.",
      tags: ["snapshot", "input"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "two-pointers-water-initial-span",
        path: "state.heights",
        kind: "range",
        intent: "focus",
        label: `Basin span 0 through ${heights.length - 1}`,
        metadata: {
          start: 0,
          end: heights.length - 1
        }
      }
    ]
  });

  while (left !== null && right !== null && left < right) {
    currentFillIndex = null;
    currentFillAmount = null;
    movedPointer = null;
    inspectedPairs.push([left, right]);
    metrics.evaluations += 1;

    recorder.push({
      phase: "Evaluate",
      description: `Compare boundaries ${left} and ${right}. Left max ${leftMax} and right max ${rightMax} decide which side can be settled next.`,
      explanation: {
        summary: "Inspect both boundary maxima before moving the smaller limiting side.",
        details:
          "The smaller running maximum bounds the water level on its side, so replay records both maxima before deciding which pointer advances.",
        tags: ["evaluate", "basin"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `two-pointers-water-span-${left}-${right}`,
          path: "state.heights",
          kind: "range",
          intent: "focus",
          label: `Inspect basin ${left} through ${right}`,
          metadata: {
            start: left,
            end: right
          }
        }
      ]
    });

    if ((leftMax ?? 0) <= (rightMax ?? 0)) {
      left += 1;
      movedPointer = "left";
      metrics.moves += 1;

      recorder.push({
        phase: "Move Left",
        description: `Advance the left pointer to ${left} because the left boundary max is no taller than the right boundary max.`,
        explanation: {
          summary: "The left side can be settled once its running maximum is the smaller boundary.",
          details:
            "Any water trapped at the new left position depends only on the left maximum because the right boundary is already tall enough to close the basin.",
          tags: ["pointer", "settle"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `two-pointers-water-move-left-${metrics.moves}`,
            path: "state.left",
            kind: "index",
            intent: "mutation",
            label: `Left pointer moved to ${left}`,
            metadata: {
              index: left
            }
          }
        ]
      });

      if (left !== null && heights[left]! >= (leftMax ?? 0)) {
        leftMax = heights[left]!;

        recorder.push({
          phase: "Left Max Update",
          description: `Wall ${left} raises the left boundary max to ${leftMax}. No water is trapped at this index.`,
          explanation: {
            summary: "Promote a taller wall into the left boundary maximum.",
            details:
              "When the new wall meets or exceeds the old left max, replay records a boundary update instead of a water fill because the basin height increases.",
            tags: ["boundary", "max"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `two-pointers-water-left-max-${left}`,
              path: "state.leftMax",
              kind: "index",
              intent: "result",
              label: `Left max ${leftMax}`,
              metadata: {
                index: left,
                height: leftMax
              }
            }
          ]
        });
      } else if (left !== null) {
        currentFillIndex = left;
        currentFillAmount = (leftMax ?? 0) - heights[left]!;
        waterByIndex[left] = currentFillAmount;
        totalWater += currentFillAmount;
        metrics.fills += 1;

        recorder.push({
          phase: "Fill Left",
          description: `Trap ${currentFillAmount} units above wall ${left} because the left boundary max ${leftMax} closes this basin segment.`,
          explanation: {
            summary: "Record the trapped water at the newly settled left index.",
            details:
              "Replay stores the fill index, the amount added, and the per-index water ledger so later jumps never recompute local basin contributions.",
            tags: ["water", "fill"]
          },
          runtimeState: createRuntimeState(),
          metrics,
          highlights: [
            {
              key: `two-pointers-water-fill-left-${left}`,
              path: "state.currentFillAmount",
              kind: "index",
              intent: "result",
              label: `Trap ${currentFillAmount} at ${left}`,
              metadata: {
                index: left,
                amount: currentFillAmount
              }
            }
          ]
        });
      }

      continue;
    }

    right -= 1;
    movedPointer = "right";
    metrics.moves += 1;

    recorder.push({
      phase: "Move Right",
      description: `Advance the right pointer to ${right} because the right boundary max is shorter than the left boundary max.`,
      explanation: {
        summary: "The right side can be settled once its running maximum is the smaller boundary.",
        details:
          "Any water trapped at the new right position depends only on the right maximum because the left boundary is already tall enough to close the basin.",
        tags: ["pointer", "settle"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `two-pointers-water-move-right-${metrics.moves}`,
          path: "state.right",
          kind: "index",
          intent: "mutation",
          label: `Right pointer moved to ${right}`,
          metadata: {
            index: right
          }
        }
      ]
    });

    if (right !== null && heights[right]! >= (rightMax ?? 0)) {
      rightMax = heights[right]!;

      recorder.push({
        phase: "Right Max Update",
        description: `Wall ${right} raises the right boundary max to ${rightMax}. No water is trapped at this index.`,
        explanation: {
          summary: "Promote a taller wall into the right boundary maximum.",
          details:
            "When the new wall meets or exceeds the old right max, replay records a boundary update instead of a water fill because the basin height increases.",
          tags: ["boundary", "max"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `two-pointers-water-right-max-${right}`,
            path: "state.rightMax",
            kind: "index",
            intent: "result",
            label: `Right max ${rightMax}`,
            metadata: {
              index: right,
              height: rightMax
            }
          }
        ]
      });
    } else if (right !== null) {
      currentFillIndex = right;
      currentFillAmount = (rightMax ?? 0) - heights[right]!;
      waterByIndex[right] = currentFillAmount;
      totalWater += currentFillAmount;
      metrics.fills += 1;

      recorder.push({
        phase: "Fill Right",
        description: `Trap ${currentFillAmount} units above wall ${right} because the right boundary max ${rightMax} closes this basin segment.`,
        explanation: {
          summary: "Record the trapped water at the newly settled right index.",
          details:
            "Replay stores the fill index, the amount added, and the per-index water ledger so later jumps never recompute local basin contributions.",
          tags: ["water", "fill"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `two-pointers-water-fill-right-${right}`,
            path: "state.currentFillAmount",
            kind: "index",
            intent: "result",
            label: `Trap ${currentFillAmount} at ${right}`,
            metadata: {
              index: right,
              amount: currentFillAmount
            }
          }
        ]
      });
    }
  }

  left = null;
  right = null;
  currentFillIndex = null;
  currentFillAmount = null;
  movedPointer = null;

  recorder.push({
    phase: "Done",
    description: `The basin sweep is complete. Total trapped water is ${totalWater}.`,
    explanation: {
      summary: "Record the final trapped-water total after every basin segment is settled.",
      details:
        "The terminal checkpoint stores the full per-index water ledger and accumulated total directly so replay never reconstructs the result from prior fills.",
      tags: ["result", "water"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "two-pointers-water-total",
        path: "state.totalWater",
        kind: "collection",
        intent: "result",
        label: `Total water ${totalWater}`
      }
    ]
  });

  return buildTwoPointersEnvelope(
    definition,
    normalizedInput,
    recorder,
    trappingRainWaterMetricDefinitions,
    ["evaluations", "moves", "fills"]
  );
}

export function buildTwoPointersTrace(
  algorithmId: TwoPointersAlgorithmId,
  input: TwoPointersInput
): TraceEnvelope<TwoPointersExecutionState> {
  switch (algorithmId) {
    case "container-with-most-water":
      return buildContainerWithMostWaterTrace(input);
    case "trapping-rain-water":
      return buildTrappingRainWaterTrace(input);
  }
}
