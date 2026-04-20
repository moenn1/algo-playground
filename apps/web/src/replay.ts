import {
  buildBreadthFirstSearchTrace,
  buildDijkstraTrace,
  createTraceEnvelope,
  defaultBreadthFirstSearchInput,
  defaultDijkstraInput,
  formatGraphDistance,
  parseGraphInputText,
  serializeGraphInput,
  type GraphInput,
  type GraphReplayState,
  type JsonObject,
  type TraceChange,
  type TraceEnvelope,
  type TraceHighlight,
  type TraceMetricDefinition,
  type TraceStep
} from "../../../packages/trace-core/src/index.js";

export type AccentTone = "ember" | "teal" | "gold";

type ReplayAlgorithmBase = {
  id: string;
  name: string;
  badge: string;
  accent: AccentTone;
  description: string;
  inputLabel: string;
  inputHint: string;
  defaultInput: string;
};

export type SortingAlgorithm = ReplayAlgorithmBase & {
  id: "bubble-sort";
  domain: "sorting";
};

export type GraphAlgorithm = ReplayAlgorithmBase & {
  id: "bfs" | "dijkstra";
  domain: "graph";
};

export type ReplayAlgorithm = SortingAlgorithm | GraphAlgorithm;

export type SortingReplayState = JsonObject & {
  array: number[];
  activeIndices: number[];
  swapPair: number[];
  sortedIndices: number[];
};

export type SortingRun = {
  algorithm: SortingAlgorithm;
  input: number[];
  normalizedInputText: string;
  trace: TraceEnvelope<SortingReplayState>;
};

export type GraphRun = {
  algorithm: GraphAlgorithm;
  input: GraphInput;
  normalizedInputText: string;
  trace: TraceEnvelope<GraphReplayState>;
};

export type ReplayRun = SortingRun | GraphRun;

type SortingMetrics = {
  comparisons: number;
  swaps: number;
  passes: number;
};

const sortingMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "comparisons",
    label: "Comparisons",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "swaps",
    label: "Swaps",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "passes",
    label: "Passes",
    unit: "count",
    direction: "lower-is-better"
  }
];

function parseSortingInput(inputText: string): number[] {
  const tokens = inputText
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  const values = tokens.map((token) => Number.parseInt(token, 10));

  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error("Sorting input must contain only comma-separated integers.");
  }

  if (values.length < 2) {
    throw new Error("Enter at least two comma-separated integers for sorting.");
  }

  if (values.length > 24) {
    throw new Error("Keep sorting input to 24 values or fewer so playback remains readable.");
  }

  return values;
}

function serializeSortingInput(values: number[]): string {
  return values.join(", ");
}

export const algorithms: ReplayAlgorithm[] = [
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    badge: "Sorting",
    accent: "ember",
    description:
      "Adjacent swaps with explicit pass checkpoints and deterministic timeline scrubbing.",
    inputLabel: "Array Input",
    inputHint: "Comma-separated integers",
    defaultInput: "18, 7, 12, 3, 15, 4, 11",
    domain: "sorting"
  },
  {
    id: "bfs",
    name: "Breadth-First Search",
    badge: "Graph",
    accent: "gold",
    description:
      "Hop-count traversal with deterministic queue checkpoints and route recovery.",
    inputLabel: "Graph Input",
    inputHint: "JSON with nodes, edges, start, and target. Edge weights are ignored.",
    defaultInput: serializeGraphInput(defaultBreadthFirstSearchInput),
    domain: "graph"
  },
  {
    id: "dijkstra",
    name: "Dijkstra",
    badge: "Graph",
    accent: "teal",
    description:
      "Weighted shortest-path playback with visible frontier churn and route recovery.",
    inputLabel: "Graph Input",
    inputHint: "JSON with nodes, edges, start, and target",
    defaultInput: serializeGraphInput(defaultDijkstraInput),
    domain: "graph"
  }
];

const defaultAlgorithm = algorithms[0]!;

if (!defaultAlgorithm) {
  throw new Error("TraceDeck requires at least one seeded algorithm.");
}

export function getAlgorithmById(algorithmId: string): ReplayAlgorithm {
  return algorithms.find((algorithm) => algorithm.id === algorithmId) ?? defaultAlgorithm;
}

function createStepKey(algorithmId: string, phase: string, index: number): string {
  return `${algorithmId}-${index.toString().padStart(3, "0")}-${phase
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

function cloneSortingState(state: SortingReplayState): SortingReplayState {
  return {
    array: state.array.slice(),
    activeIndices: state.activeIndices.slice(),
    swapPair: state.swapPair.slice(),
    sortedIndices: state.sortedIndices.slice()
  };
}

function createSortingMetrics(metrics: SortingMetrics): Record<string, number> {
  return {
    comparisons: metrics.comparisons,
    swaps: metrics.swaps,
    passes: metrics.passes
  };
}

function pushSortingStep(
  steps: TraceStep<SortingReplayState>[],
  metrics: SortingMetrics,
  phase: string,
  description: string,
  explanation: {
    summary: string;
    details?: string;
    tags?: string[];
  },
  state: SortingReplayState,
  changes: TraceChange[],
  highlights: TraceHighlight[]
): void {
  const index = steps.length;

  steps.push({
    index,
    key: createStepKey("bubble-sort", phase, index),
    phase,
    description,
    explanation,
    state: cloneSortingState(state),
    changes,
    highlights,
    metrics: createSortingMetrics(metrics)
  });
}

function buildBubbleSortTrace(numbers: number[]): TraceEnvelope<SortingReplayState> {
  const values = numbers.slice();
  const steps: TraceStep<SortingReplayState>[] = [];
  const metrics: SortingMetrics = {
    comparisons: 0,
    swaps: 0,
    passes: 0
  };

  pushSortingStep(
    steps,
    metrics,
    "Initialization",
    "Replay begins from the seeded array snapshot. Every timeline jump restores directly from the recorded frame payload.",
    {
      summary: "Capture the input array as the first deterministic checkpoint.",
      details: "The replay shell restores this frame without re-running the algorithm.",
      tags: ["snapshot", "input"]
    },
    {
      array: values,
      activeIndices: [],
      swapPair: [],
      sortedIndices: []
    },
    [
      {
        path: "state.array",
        op: "set",
        nextValue: values
      }
    ],
    [
      {
        key: "bubble-seed-array",
        path: "state.array",
        kind: "range",
        intent: "focus",
        label: "Loaded the seed array",
        metadata: {
          start: 0,
          end: values.length - 1
        }
      }
    ]
  );

  for (let boundary = values.length - 1; boundary > 0; boundary -= 1) {
    let swappedThisPass = false;

    for (let index = 0; index < boundary; index += 1) {
      metrics.comparisons += 1;
      const activeIndices = [index, index + 1];
      const sortedIndices = Array.from(
        { length: values.length - boundary - 1 },
        (_, offset) => values.length - 1 - offset
      );
      const leftValue = values[index]!;
      const rightValue = values[index + 1]!;
      const requiresSwap = leftValue > rightValue;

      pushSortingStep(
        steps,
        metrics,
        "Compare",
        requiresSwap
          ? `Values ${leftValue} and ${rightValue} are out of order, so the next frame performs a swap.`
          : `Values ${leftValue} and ${rightValue} are already ordered, so replay advances without mutating the array.`,
        {
          summary: "Inspect the active adjacent pair before deciding whether to swap.",
          details: requiresSwap
            ? "Bubble sort bubbles the larger value rightward when the pair is inverted."
            : "The pair is already ordered, so the algorithm can move forward without changing the array.",
          tags: ["comparison", requiresSwap ? "mutation" : "focus"]
        },
        {
          array: values,
          activeIndices,
          swapPair: [],
          sortedIndices
        },
        [
          {
            path: "state.activeIndices",
            op: "set",
            nextValue: activeIndices
          },
          {
            path: "metrics.comparisons",
            op: "set",
            nextValue: metrics.comparisons
          }
        ],
        [
          {
            key: `bubble-compare-${index}`,
            path: "state.activeIndices",
            kind: "range",
            intent: requiresSwap ? "candidate" : "focus",
            label: `Inspect lanes ${index} and ${index + 1}`,
            metadata: {
              start: index,
              end: index + 1
            }
          }
        ]
      );

      if (requiresSwap) {
        const previousArray = values.slice();

        [values[index], values[index + 1]] = [rightValue, leftValue];
        metrics.swaps += 1;
        swappedThisPass = true;

        pushSortingStep(
          steps,
          metrics,
          "Swap",
          "The post-swap snapshot is recorded immediately so scrubbing to this frame never depends on incremental playback.",
          {
            summary: "Record the mutated array immediately after the swap.",
            details:
              "Because the full snapshot is stored here, the scrubber can jump to this mutation without replaying earlier comparisons.",
            tags: ["mutation", "snapshot"]
          },
          {
            array: values,
            activeIndices,
            swapPair: activeIndices,
            sortedIndices
          },
          [
            {
              path: "state.array",
              op: "set",
              previousValue: previousArray,
              nextValue: values
            },
            {
              path: "state.swapPair",
              op: "set",
              nextValue: activeIndices
            },
            {
              path: "metrics.swaps",
              op: "set",
              nextValue: metrics.swaps
            }
          ],
          [
            {
              key: `bubble-swap-${index}`,
              path: "state.swapPair",
              kind: "range",
              intent: "mutation",
              label: `Swapped lanes ${index} and ${index + 1}`,
              metadata: {
                start: index,
                end: index + 1
              }
            }
          ]
        );
      }
    }

    metrics.passes += 1;
    const sortedIndices = Array.from(
      { length: values.length - boundary },
      (_, offset) => values.length - 1 - offset
    );

    pushSortingStep(
      steps,
      metrics,
      "Checkpoint",
      `Pass ${metrics.passes} seals lane ${boundary}. Timeline jumps can land here without replaying earlier comparisons.`,
      {
        summary: "Lock the newest sorted suffix into a replay checkpoint.",
        details:
          "Bubble sort guarantees the rightmost unsorted lane is final at the end of each completed pass.",
        tags: ["checkpoint", "sorted"]
      },
      {
        array: values,
        activeIndices: [boundary],
        swapPair: [],
        sortedIndices
      },
      [
        {
          path: "state.sortedIndices",
          op: "set",
          nextValue: sortedIndices
        },
        {
          path: "metrics.passes",
          op: "set",
          nextValue: metrics.passes
        }
      ],
      [
        {
          key: `bubble-checkpoint-${boundary}`,
          path: "state.sortedIndices",
          kind: "range",
          intent: "sorted",
          label: `Locked suffix through lane ${boundary}`,
          metadata: {
            start: boundary,
            end: values.length - 1
          }
        }
      ]
    );

    if (!swappedThisPass) {
      const allSorted = Array.from({ length: values.length }, (_, sortedIndex) => sortedIndex);

      pushSortingStep(
        steps,
        metrics,
        "Optimization",
        "No swaps occurred in the latest pass, so the shell exits early with the array already sorted.",
        {
          summary: "End early because the latest pass discovered no inversions.",
          details: "Bubble sort can stop once a full pass completes without any swaps.",
          tags: ["optimization", "sorted"]
        },
        {
          array: values,
          activeIndices: [],
          swapPair: [],
          sortedIndices: allSorted
        },
        [
          {
            path: "state.sortedIndices",
            op: "set",
            nextValue: allSorted
          }
        ],
        [
          {
            key: "bubble-optimized-finish",
            path: "state.sortedIndices",
            kind: "collection",
            intent: "result",
            label: "Marked the full array as sorted"
          }
        ]
      );
      break;
    }
  }

  const allSorted = Array.from({ length: values.length }, (_, index) => index);

  pushSortingStep(
    steps,
    metrics,
    "Done",
    "The final checkpoint marks the array as fully sorted and ready for comparison or saved-run handoff.",
    {
      summary: "Publish the terminal sorted snapshot and final metrics.",
      details: "Comparison surfaces can read the final step directly from the trace envelope.",
      tags: ["result", "metrics"]
    },
    {
      array: values,
      activeIndices: [],
      swapPair: [],
      sortedIndices: allSorted
    },
    [
      {
        path: "state.sortedIndices",
        op: "set",
        nextValue: allSorted
      }
    ],
    [
      {
        key: "bubble-final-state",
        path: "state.array",
        kind: "collection",
        intent: "result",
        label: "Final sorted order"
      }
    ]
  );

  return createTraceEnvelope({
    algorithm: {
      id: "bubble-sort",
      label: "Bubble Sort",
      domain: "sorting",
      implementationVersion: "sorting-engine-0.1.0"
    },
    input: numbers,
    steps,
    metricDefinitions: sortingMetricDefinitions,
    comparisonMetricKeys: ["comparisons", "swaps", "passes"]
  });
}

function buildSortingRunFromValues(
  algorithm: SortingAlgorithm,
  values: number[],
  normalizedInputText = serializeSortingInput(values)
): SortingRun {
  return {
    algorithm,
    input: values.slice(),
    normalizedInputText,
    trace: buildBubbleSortTrace(values)
  };
}

function buildGraphRunFromInput(
  algorithm: GraphAlgorithm,
  graph: GraphInput,
  normalizedInputText = serializeGraphInput(graph)
): GraphRun {
  return {
    algorithm,
    input: graph,
    normalizedInputText,
    trace:
      algorithm.id === "bfs"
        ? buildBreadthFirstSearchTrace(graph)
        : buildDijkstraTrace(graph)
  };
}

export function buildRun(algorithmId: string, inputText: string): ReplayRun {
  const algorithm = getAlgorithmById(algorithmId);

  if (algorithm.domain === "sorting") {
    const input = parseSortingInput(inputText);
    return buildSortingRunFromValues(algorithm, input);
  }

  const input = parseGraphInputText(inputText);
  return buildGraphRunFromInput(algorithm, input);
}

export function formatDistance(distance: number | null): string {
  return formatGraphDistance(distance);
}

export function getTraceStepPaths(step: TraceStep): string[] {
  return Array.from(new Set(step.changes.map((change) => change.path)));
}
