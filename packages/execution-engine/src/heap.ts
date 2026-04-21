import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type HeapAlgorithmId = "kth-largest-element-in-an-array";

export const heapAlgorithmIds: HeapAlgorithmId[] = ["kth-largest-element-in-an-array"];

export interface HeapInput extends JsonObject {
  array: number[];
  k: number;
}

export interface HeapEntry extends JsonObject {
  index: number;
  value: number;
}

export interface HeapExecutionState extends JsonObject {
  array: number[];
  k: number;
  currentIndex: number | null;
  currentValue: number | null;
  heapEntries: HeapEntry[];
  rankedEntries: HeapEntry[];
  processedIndices: number[];
  candidateEntry: HeapEntry | null;
  evictedEntry: HeapEntry | null;
  result: number | null;
}

interface HeapMetricState {
  inspections: number;
  pushes: number;
  pops: number;
}

interface HeapAlgorithmDefinition {
  id: HeapAlgorithmId;
  label: string;
  implementationVersion: string;
}

const heapAlgorithmDefinitions: Record<HeapAlgorithmId, HeapAlgorithmDefinition> = {
  "kth-largest-element-in-an-array": {
    id: "kth-largest-element-in-an-array",
    label: "Kth Largest Element in an Array",
    implementationVersion: "heap-engine-0.1.0"
  }
};

export const heapMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "inspections",
    label: "Array inspections",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "pushes",
    label: "Heap pushes",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "pops",
    label: "Heap pops",
    unit: "count",
    direction: "lower-is-better"
  }
];

export const defaultKthLargestElementInput: HeapInput = {
  array: [3, 2, 1, 5, 6, 4],
  k: 2
};

function cloneHeapEntry(entry: HeapEntry | null): HeapEntry | null {
  if (!entry) {
    return null;
  }

  return {
    index: entry.index,
    value: entry.value
  };
}

function cloneHeapEntries(entries: HeapEntry[]): HeapEntry[] {
  return entries.map((entry) => ({
    index: entry.index,
    value: entry.value
  }));
}

function rankHeapEntries(entries: HeapEntry[]): HeapEntry[] {
  return cloneHeapEntries(entries).sort(
    (left, right) => right.value - left.value || left.index - right.index
  );
}

function cloneHeapState(state: HeapExecutionState): HeapExecutionState {
  return {
    array: state.array.slice(),
    k: state.k,
    currentIndex: state.currentIndex,
    currentValue: state.currentValue,
    heapEntries: cloneHeapEntries(state.heapEntries),
    rankedEntries: cloneHeapEntries(state.rankedEntries),
    processedIndices: state.processedIndices.slice(),
    candidateEntry: cloneHeapEntry(state.candidateEntry),
    evictedEntry: cloneHeapEntry(state.evictedEntry),
    result: state.result
  };
}

function createHeapRecorder(algorithmId: HeapAlgorithmId) {
  return createTraceRecorder<HeapExecutionState, HeapExecutionState, HeapMetricState>({
    algorithmId,
    projectState: cloneHeapState,
    projectMetrics(metrics) {
      return {
        inspections: metrics.inspections,
        pushes: metrics.pushes,
        pops: metrics.pops
      };
    }
  });
}

function normalizeHeapInput(candidate: unknown): HeapInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Heap input must be an object with array and k.");
  }

  const value = candidate as {
    array?: unknown;
    k?: unknown;
  };

  if (!Array.isArray(value.array) || value.array.length < 2) {
    throw new Error("Heap input must include an array with at least two integers.");
  }

  if (value.array.length > 24) {
    throw new Error("Heap input arrays must contain 24 integers or fewer.");
  }

  const array = value.array.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry)) {
      throw new Error(`array[${index}] must be an integer.`);
    }

    return entry;
  });

  if (typeof value.k !== "number" || !Number.isInteger(value.k)) {
    throw new Error("Heap input k must be an integer.");
  }

  if (value.k < 1 || value.k > array.length) {
    throw new Error("Heap input k must be between 1 and the array length.");
  }

  return {
    array,
    k: value.k
  };
}

export function parseHeapInputText(inputText: string): HeapInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(inputText);
  } catch {
    throw new Error("Heap input must be valid JSON.");
  }

  return normalizeHeapInput(parsed);
}

export function serializeHeapInput(input: HeapInput): string {
  return JSON.stringify(
    {
      array: input.array,
      k: input.k
    },
    null,
    2
  );
}

function bubbleUp(entries: HeapEntry[], index: number) {
  let currentIndex = index;

  while (currentIndex > 0) {
    const parentIndex = Math.floor((currentIndex - 1) / 2);
    const current = entries[currentIndex]!;
    const parent = entries[parentIndex]!;

    if (parent.value <= current.value) {
      break;
    }

    entries[parentIndex] = current;
    entries[currentIndex] = parent;
    currentIndex = parentIndex;
  }
}

function sinkDown(entries: HeapEntry[], index: number) {
  let currentIndex = index;

  while (true) {
    const leftIndex = currentIndex * 2 + 1;
    const rightIndex = currentIndex * 2 + 2;
    let smallestIndex = currentIndex;

    if (
      leftIndex < entries.length &&
      entries[leftIndex]!.value < entries[smallestIndex]!.value
    ) {
      smallestIndex = leftIndex;
    }

    if (
      rightIndex < entries.length &&
      entries[rightIndex]!.value < entries[smallestIndex]!.value
    ) {
      smallestIndex = rightIndex;
    }

    if (smallestIndex === currentIndex) {
      break;
    }

    [entries[currentIndex], entries[smallestIndex]] = [
      entries[smallestIndex]!,
      entries[currentIndex]!
    ];
    currentIndex = smallestIndex;
  }
}

function buildHeapEnvelope(
  definition: HeapAlgorithmDefinition,
  input: HeapInput,
  recorder: ReturnType<typeof createHeapRecorder>
): TraceEnvelope<HeapExecutionState> {
  return createTraceEnvelope({
    algorithm: {
      id: definition.id,
      label: definition.label,
      domain: "heap",
      implementationVersion: definition.implementationVersion
    },
    input,
    steps: recorder.getSteps(),
    metricDefinitions: heapMetricDefinitions,
    comparisonMetricKeys: ["inspections", "pushes", "pops"]
  });
}

export function buildKthLargestElementTrace(input: HeapInput): TraceEnvelope<HeapExecutionState> {
  const definition = heapAlgorithmDefinitions["kth-largest-element-in-an-array"];
  const normalizedInput = normalizeHeapInput(input);
  const values = normalizedInput.array.slice();
  const recorder = createHeapRecorder(definition.id);
  const metrics: HeapMetricState = {
    inspections: 0,
    pushes: 0,
    pops: 0
  };
  const heapEntries: HeapEntry[] = [];
  const processedIndices: number[] = [];
  let currentIndex: number | null = null;
  let currentValue: number | null = null;
  let evictedEntry: HeapEntry | null = null;
  let result: number | null = null;

  const createRuntimeState = () =>
    cloneHeapState({
      array: values,
      k: normalizedInput.k,
      currentIndex,
      currentValue,
      heapEntries,
      rankedEntries: rankHeapEntries(heapEntries),
      processedIndices,
      candidateEntry: heapEntries.length >= normalizedInput.k ? heapEntries[0]! : null,
      evictedEntry,
      result
    });

  recorder.push({
    phase: "Initialization",
    description:
      "The replay begins before the min-heap is seeded, with every array value still waiting for the kth-largest cutoff.",
    explanation: {
      summary: "Seed the array scan and empty heap before the first candidate enters the top-k window.",
      details:
        "The timeline stores the empty heap explicitly so later jumps can reopen the candidate cutoff without reconstructing prior heap operations.",
      tags: ["snapshot", "heap"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "heap-array-initial",
        path: "state.array",
        kind: "collection",
        intent: "focus",
        label: `${values.length} values queued`
      }
    ]
  });

  for (const [index, value] of values.entries()) {
    currentIndex = index;
    currentValue = value;
    evictedEntry = null;
    processedIndices.push(index);
    metrics.inspections += 1;

    recorder.push({
      phase: "Inspect",
      description: `Inspect value ${value} at index ${index} against the current size-${normalizedInput.k} cutoff heap.`,
      explanation: {
        summary: "Each value is checked against the current heap root before the replay decides whether it belongs in the top-k set.",
        details:
          "The min-heap root represents the current kth-largest cutoff whenever the heap already holds k entries.",
        tags: ["inspection", "cutoff"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `heap-current-${index}`,
          path: "state.currentIndex",
          kind: "index",
          intent: "active",
          label: `Inspect index ${index}`
        },
        {
          key: `heap-candidate-${index}`,
          path: "state.candidateEntry",
          kind: "collection",
          intent: "focus",
          label:
            heapEntries.length >= normalizedInput.k
              ? `Current cutoff ${heapEntries[0]!.value}`
              : `${heapEntries.length} of ${normalizedInput.k} heap slots filled`
        }
      ]
    });

    const nextEntry: HeapEntry = {
      index,
      value
    };

    if (heapEntries.length < normalizedInput.k) {
      heapEntries.push(nextEntry);
      bubbleUp(heapEntries, heapEntries.length - 1);
      metrics.pushes += 1;

      recorder.push({
        phase: "Push",
        description: `Value ${value} enters the heap because fewer than ${normalizedInput.k} candidates have been recorded so far.`,
        explanation: {
          summary: "The heap fills to size k before the runtime starts rejecting smaller values.",
          details:
            "Early pushes seed the top-k window. Once the heap reaches size k, the root becomes the live kth-largest cutoff.",
          tags: ["push", "seeding"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `heap-push-${index}`,
            path: "state.heapEntries",
            kind: "collection",
            intent: "mutation",
            label: `${heapEntries.length} heap entr${heapEntries.length === 1 ? "y" : "ies"}`
          }
        ]
      });

      continue;
    }

    if (value > heapEntries[0]!.value) {
      evictedEntry = cloneHeapEntry(heapEntries[0]!);
      heapEntries[0] = nextEntry;
      sinkDown(heapEntries, 0);
      metrics.pops += 1;
      metrics.pushes += 1;

      recorder.push({
        phase: "Replace",
        description: `Value ${value} is larger than the current cutoff ${evictedEntry!.value}, so it replaces that root in the heap.`,
        explanation: {
          summary: "A larger value evicts the current minimum from the size-k heap and raises the kth-largest cutoff.",
          details:
            "Recording the evicted root separately keeps the heap transition explicit instead of hiding the cutoff change inside the next inspection.",
          tags: ["replace", "evict"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `heap-replace-${index}`,
            path: "state.evictedEntry",
            kind: "collection",
            intent: "mutation",
            label: `Evict ${evictedEntry!.value}`
          },
          {
            key: `heap-candidate-updated-${index}`,
            path: "state.candidateEntry",
            kind: "collection",
            intent: "result",
            label: `New cutoff ${heapEntries[0]!.value}`
          }
        ]
      });

      continue;
    }

    recorder.push({
      phase: "Skip",
      description: `Value ${value} stays outside the heap because it does not exceed the current cutoff ${heapEntries[0]!.value}.`,
      explanation: {
        summary: "Values at or below the heap root cannot change the kth-largest answer once the heap is full.",
        details:
          "Skip frames make rejected candidates explicit so replay can jump between stable heap states without inferring why a value disappeared.",
        tags: ["skip", "cutoff"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `heap-skip-${index}`,
          path: "state.candidateEntry",
          kind: "collection",
          intent: "focus",
          label: `Cutoff holds at ${heapEntries[0]!.value}`
        }
      ]
    });
  }

  currentIndex = null;
  currentValue = null;
  evictedEntry = null;
  result = heapEntries[0]!.value;

  recorder.push({
    phase: "Done",
    description: `The min-heap root settles at ${result}, which is the ${normalizedInput.k}th largest value in the array.`,
    explanation: {
      summary: "The replay ends with the heap root publishing the final kth-largest answer.",
      details:
        "Terminal playback keeps both the internal heap order and the ranked top-k view so the answer and its supporting candidate set reopen from one snapshot.",
      tags: ["terminal", "result"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "heap-result",
        path: "state.result",
        kind: "value",
        intent: "result",
        label: `${normalizedInput.k}th largest = ${result}`
      },
      {
        key: "heap-ranked-result",
        path: "state.rankedEntries",
        kind: "collection",
        intent: "result",
        label: `${heapEntries.length} top candidates ranked`
      }
    ]
  });

  return buildHeapEnvelope(definition, normalizedInput, recorder);
}

export function buildHeapTrace(
  algorithmId: HeapAlgorithmId,
  input: HeapInput
): TraceEnvelope<HeapExecutionState> {
  switch (algorithmId) {
    case "kth-largest-element-in-an-array":
      return buildKthLargestElementTrace(input);
  }
}
