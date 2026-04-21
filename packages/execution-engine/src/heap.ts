import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type HeapAlgorithmId =
  | "kth-largest-element-in-an-array"
  | "top-k-frequent-elements";

export const heapAlgorithmIds: HeapAlgorithmId[] = [
  "kth-largest-element-in-an-array",
  "top-k-frequent-elements"
];

export interface KthLargestElementInput extends JsonObject {
  array: number[];
  k: number;
}

export interface TopKFrequentElementsInput extends JsonObject {
  array: number[];
  k: number;
}

export type HeapInput = KthLargestElementInput | TopKFrequentElementsInput;

export interface HeapValueEntry extends JsonObject {
  index: number;
  value: number;
}

export interface HeapFrequencyEntry extends JsonObject {
  value: number;
  frequency: number;
  firstIndex: number;
}

export interface KthLargestElementExecutionState extends JsonObject {
  kind: "kth-largest-element-in-an-array";
  array: number[];
  k: number;
  currentIndex: number | null;
  currentValue: number | null;
  heapEntries: HeapValueEntry[];
  rankedEntries: HeapValueEntry[];
  processedIndices: number[];
  candidateEntry: HeapValueEntry | null;
  evictedEntry: HeapValueEntry | null;
  result: number | null;
}

export interface TopKFrequentElementsExecutionState extends JsonObject {
  kind: "top-k-frequent-elements";
  array: number[];
  k: number;
  currentIndex: number | null;
  currentValue: number | null;
  currentFrequency: number | null;
  frequencyLedger: HeapFrequencyEntry[];
  heapEntries: HeapFrequencyEntry[];
  rankedEntries: HeapFrequencyEntry[];
  processedIndices: number[];
  candidateEntry: HeapFrequencyEntry | null;
  evictedEntry: HeapFrequencyEntry | null;
  result: number[];
}

export type HeapExecutionState =
  | KthLargestElementExecutionState
  | TopKFrequentElementsExecutionState;

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
    implementationVersion: "heap-engine-0.2.0"
  },
  "top-k-frequent-elements": {
    id: "top-k-frequent-elements",
    label: "Top K Frequent Elements",
    implementationVersion: "heap-engine-0.2.0"
  }
};

export const heapMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "inspections",
    label: "Input inspections",
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

export const defaultKthLargestElementInput: KthLargestElementInput = {
  array: [3, 2, 1, 5, 6, 4],
  k: 2
};

export const defaultTopKFrequentElementsInput: TopKFrequentElementsInput = {
  array: [1, 1, 1, 2, 2, 3],
  k: 2
};

function cloneHeapValueEntry(entry: HeapValueEntry | null): HeapValueEntry | null {
  if (!entry) {
    return null;
  }

  return {
    index: entry.index,
    value: entry.value
  };
}

function cloneHeapValueEntries(entries: HeapValueEntry[]): HeapValueEntry[] {
  return entries.map((entry) => ({
    index: entry.index,
    value: entry.value
  }));
}

function cloneHeapFrequencyEntry(entry: HeapFrequencyEntry | null): HeapFrequencyEntry | null {
  if (!entry) {
    return null;
  }

  return {
    value: entry.value,
    frequency: entry.frequency,
    firstIndex: entry.firstIndex
  };
}

function cloneHeapFrequencyEntries(entries: HeapFrequencyEntry[]): HeapFrequencyEntry[] {
  return entries.map((entry) => ({
    value: entry.value,
    frequency: entry.frequency,
    firstIndex: entry.firstIndex
  }));
}

function rankHeapValueEntries(entries: HeapValueEntry[]): HeapValueEntry[] {
  return cloneHeapValueEntries(entries).sort(
    (left, right) => right.value - left.value || left.index - right.index
  );
}

function rankHeapFrequencyEntries(entries: HeapFrequencyEntry[]): HeapFrequencyEntry[] {
  return cloneHeapFrequencyEntries(entries).sort(
    (left, right) =>
      right.frequency - left.frequency ||
      left.value - right.value ||
      left.firstIndex - right.firstIndex
  );
}

function cloneHeapState(state: HeapExecutionState): HeapExecutionState {
  if (state.kind === "kth-largest-element-in-an-array") {
    return {
      kind: state.kind,
      array: state.array.slice(),
      k: state.k,
      currentIndex: state.currentIndex,
      currentValue: state.currentValue,
      heapEntries: cloneHeapValueEntries(state.heapEntries),
      rankedEntries: cloneHeapValueEntries(state.rankedEntries),
      processedIndices: state.processedIndices.slice(),
      candidateEntry: cloneHeapValueEntry(state.candidateEntry),
      evictedEntry: cloneHeapValueEntry(state.evictedEntry),
      result: state.result
    };
  }

  return {
    kind: state.kind,
    array: state.array.slice(),
    k: state.k,
    currentIndex: state.currentIndex,
    currentValue: state.currentValue,
    currentFrequency: state.currentFrequency,
    frequencyLedger: cloneHeapFrequencyEntries(state.frequencyLedger),
    heapEntries: cloneHeapFrequencyEntries(state.heapEntries),
    rankedEntries: cloneHeapFrequencyEntries(state.rankedEntries),
    processedIndices: state.processedIndices.slice(),
    candidateEntry: cloneHeapFrequencyEntry(state.candidateEntry),
    evictedEntry: cloneHeapFrequencyEntry(state.evictedEntry),
    result: state.result.slice()
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

function normalizeHeapArray(candidate: unknown, algorithmLabel: string, minimumLength: number) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error(`${algorithmLabel} input must be an object with array and k.`);
  }

  const value = candidate as {
    array?: unknown;
    k?: unknown;
  };

  if (!Array.isArray(value.array) || value.array.length < minimumLength) {
    throw new Error(
      `${algorithmLabel} input must include an array with at least ${minimumLength} integer${minimumLength === 1 ? "" : "s"}.`
    );
  }

  if (value.array.length > 24) {
    throw new Error(`${algorithmLabel} input arrays must contain 24 integers or fewer.`);
  }

  const array = value.array.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry)) {
      throw new Error(`array[${index}] must be an integer.`);
    }

    return entry;
  });

  if (typeof value.k !== "number" || !Number.isInteger(value.k)) {
    throw new Error(`${algorithmLabel} input k must be an integer.`);
  }

  return {
    array,
    k: value.k
  };
}

function normalizeKthLargestElementInput(candidate: unknown): KthLargestElementInput {
  const normalized = normalizeHeapArray(candidate, "Heap", 2);

  if (normalized.k < 1 || normalized.k > normalized.array.length) {
    throw new Error("Heap input k must be between 1 and the array length.");
  }

  return normalized;
}

function normalizeTopKFrequentElementsInput(candidate: unknown): TopKFrequentElementsInput {
  const normalized = normalizeHeapArray(candidate, "Heap", 1);
  const uniqueCount = new Set(normalized.array).size;

  if (normalized.k < 1 || normalized.k > uniqueCount) {
    throw new Error("Top K Frequent Elements input k must be between 1 and the number of distinct values.");
  }

  return normalized;
}

function normalizeHeapInput(candidate: unknown, algorithmId: HeapAlgorithmId): HeapInput {
  switch (algorithmId) {
    case "kth-largest-element-in-an-array":
      return normalizeKthLargestElementInput(candidate);
    case "top-k-frequent-elements":
      return normalizeTopKFrequentElementsInput(candidate);
  }
}

export function parseHeapInputText(
  inputText: string,
  algorithmId: HeapAlgorithmId
): HeapInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(inputText);
  } catch {
    throw new Error("Heap input must be valid JSON.");
  }

  return normalizeHeapInput(parsed, algorithmId);
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

function compareHeapValueEntries(left: HeapValueEntry, right: HeapValueEntry): number {
  return left.value - right.value || left.index - right.index;
}

function compareHeapFrequencyEntries(left: HeapFrequencyEntry, right: HeapFrequencyEntry): number {
  return (
    left.frequency - right.frequency ||
    right.value - left.value ||
    left.firstIndex - right.firstIndex
  );
}

function bubbleUp<T>(entries: T[], index: number, compare: (left: T, right: T) => number) {
  let currentIndex = index;

  while (currentIndex > 0) {
    const parentIndex = Math.floor((currentIndex - 1) / 2);
    const current = entries[currentIndex]!;
    const parent = entries[parentIndex]!;

    if (compare(parent, current) <= 0) {
      break;
    }

    entries[parentIndex] = current;
    entries[currentIndex] = parent;
    currentIndex = parentIndex;
  }
}

function sinkDown<T>(entries: T[], index: number, compare: (left: T, right: T) => number) {
  let currentIndex = index;

  while (true) {
    const leftIndex = currentIndex * 2 + 1;
    const rightIndex = currentIndex * 2 + 2;
    let smallestIndex = currentIndex;

    if (
      leftIndex < entries.length &&
      compare(entries[leftIndex]!, entries[smallestIndex]!) < 0
    ) {
      smallestIndex = leftIndex;
    }

    if (
      rightIndex < entries.length &&
      compare(entries[rightIndex]!, entries[smallestIndex]!) < 0
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

export function buildKthLargestElementTrace(
  input: KthLargestElementInput
): TraceEnvelope<HeapExecutionState> {
  const definition = heapAlgorithmDefinitions["kth-largest-element-in-an-array"];
  const normalizedInput = normalizeKthLargestElementInput(input);
  const values = normalizedInput.array.slice();
  const recorder = createHeapRecorder(definition.id);
  const metrics: HeapMetricState = {
    inspections: 0,
    pushes: 0,
    pops: 0
  };
  const heapEntries: HeapValueEntry[] = [];
  const processedIndices: number[] = [];
  let currentIndex: number | null = null;
  let currentValue: number | null = null;
  let evictedEntry: HeapValueEntry | null = null;
  let result: number | null = null;

  const createRuntimeState = (): KthLargestElementExecutionState =>
    cloneHeapState({
      kind: "kth-largest-element-in-an-array",
      array: values,
      k: normalizedInput.k,
      currentIndex,
      currentValue,
      heapEntries,
      rankedEntries: rankHeapValueEntries(heapEntries),
      processedIndices,
      candidateEntry: heapEntries.length >= normalizedInput.k ? heapEntries[0]! : null,
      evictedEntry,
      result
    }) as KthLargestElementExecutionState;

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

    const nextEntry: HeapValueEntry = {
      index,
      value
    };

    if (heapEntries.length < normalizedInput.k) {
      heapEntries.push(nextEntry);
      bubbleUp(heapEntries, heapEntries.length - 1, compareHeapValueEntries);
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
      evictedEntry = cloneHeapValueEntry(heapEntries[0]!);
      heapEntries[0] = nextEntry;
      sinkDown(heapEntries, 0, compareHeapValueEntries);
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

function buildTopKFrequencyLedger(
  frequencyByValue: ReadonlyMap<number, HeapFrequencyEntry>
): HeapFrequencyEntry[] {
  return Array.from(frequencyByValue.values())
    .map((entry) => ({
      value: entry.value,
      frequency: entry.frequency,
      firstIndex: entry.firstIndex
    }))
    .sort((left, right) => left.firstIndex - right.firstIndex || left.value - right.value);
}

export function buildTopKFrequentElementsTrace(
  input: TopKFrequentElementsInput
): TraceEnvelope<HeapExecutionState> {
  const definition = heapAlgorithmDefinitions["top-k-frequent-elements"];
  const normalizedInput = normalizeTopKFrequentElementsInput(input);
  const values = normalizedInput.array.slice();
  const recorder = createHeapRecorder(definition.id);
  const metrics: HeapMetricState = {
    inspections: 0,
    pushes: 0,
    pops: 0
  };
  const frequencyByValue = new Map<number, HeapFrequencyEntry>();
  const heapEntries: HeapFrequencyEntry[] = [];
  const processedIndices: number[] = [];
  let currentIndex: number | null = null;
  let currentValue: number | null = null;
  let currentFrequency: number | null = null;
  let evictedEntry: HeapFrequencyEntry | null = null;
  let result: number[] = [];

  const createRuntimeState = (): TopKFrequentElementsExecutionState =>
    cloneHeapState({
      kind: "top-k-frequent-elements",
      array: values,
      k: normalizedInput.k,
      currentIndex,
      currentValue,
      currentFrequency,
      frequencyLedger: buildTopKFrequencyLedger(frequencyByValue),
      heapEntries,
      rankedEntries: rankHeapFrequencyEntries(heapEntries),
      processedIndices,
      candidateEntry: heapEntries.length >= normalizedInput.k ? heapEntries[0]! : null,
      evictedEntry,
      result
    }) as TopKFrequentElementsExecutionState;

  recorder.push({
    phase: "Initialization",
    description:
      "The replay begins before any frequency counts or heap candidates exist, with the full array still waiting for the top-k frequency scan.",
    explanation: {
      summary: "Seed the array, empty frequency ledger, and empty heap before counting begins.",
      details:
        "The opening frame keeps both counting and heap selection replay-safe so later scrubs never reconstruct the frequency map from hidden state.",
      tags: ["snapshot", "heap"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "heap-frequency-initial",
        path: "state.array",
        kind: "collection",
        intent: "focus",
        label: `${values.length} values queued`
      }
    ]
  });

  for (const [index, value] of values.entries()) {
    const existingEntry = frequencyByValue.get(value);
    const nextFrequency = existingEntry ? existingEntry.frequency + 1 : 1;

    currentIndex = index;
    currentValue = value;
    currentFrequency = nextFrequency;
    evictedEntry = null;
    processedIndices.push(index);
    metrics.inspections += 1;

    frequencyByValue.set(value, {
      value,
      frequency: nextFrequency,
      firstIndex: existingEntry?.firstIndex ?? index
    });

    recorder.push({
      phase: "Count",
      description: `Count value ${value} at index ${index}, raising its observed frequency to ${nextFrequency}.`,
      explanation: {
        summary: "Every array inspection publishes the updated frequency ledger before heap selection begins.",
        details:
          "Counting frames keep duplicate pressure explicit so the later heap phase can rank deterministic value-frequency pairs instead of reconstructing counts on demand.",
        tags: ["count", "frequency"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `heap-frequency-count-${index}`,
          path: "state.frequencyLedger",
          kind: "collection",
          intent: "mutation",
          label: `${value} seen ${nextFrequency} time${nextFrequency === 1 ? "" : "s"}`
        }
      ]
    });
  }

  for (const entry of buildTopKFrequencyLedger(frequencyByValue)) {
    currentIndex = entry.firstIndex;
    currentValue = entry.value;
    currentFrequency = entry.frequency;
    evictedEntry = null;
    metrics.inspections += 1;

    recorder.push({
      phase: "Inspect",
      description: `Inspect value ${entry.value} with frequency ${entry.frequency} against the current size-${normalizedInput.k} cutoff heap.`,
      explanation: {
        summary: "Each distinct value is checked against the heap root once the frequency ledger is complete.",
        details:
          "The min-heap root tracks the weakest top-k frequency candidate using a deterministic tie-break that prefers smaller values when counts match.",
        tags: ["inspection", "cutoff"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `heap-frequency-current-${entry.value}`,
          path: "state.currentValue",
          kind: "value",
          intent: "active",
          label: `Inspect ${entry.value} × ${entry.frequency}`
        },
        {
          key: `heap-frequency-candidate-${entry.value}`,
          path: "state.candidateEntry",
          kind: "collection",
          intent: "focus",
          label:
            heapEntries.length >= normalizedInput.k
              ? `Current cutoff ${heapEntries[0]!.value} × ${heapEntries[0]!.frequency}`
              : `${heapEntries.length} of ${normalizedInput.k} heap slots filled`
        }
      ]
    });

    const nextEntry: HeapFrequencyEntry = {
      value: entry.value,
      frequency: entry.frequency,
      firstIndex: entry.firstIndex
    };

    if (heapEntries.length < normalizedInput.k) {
      heapEntries.push(nextEntry);
      bubbleUp(heapEntries, heapEntries.length - 1, compareHeapFrequencyEntries);
      metrics.pushes += 1;

      recorder.push({
        phase: "Push",
        description: `Value ${entry.value} enters the heap because fewer than ${normalizedInput.k} frequency candidates have been recorded so far.`,
        explanation: {
          summary: "The heap fills to size k before lower-frequency candidates can be rejected.",
          details:
            "Each push stores a deterministic value-frequency pair, which makes the tie-breaking cutoff visible instead of hiding it inside a later replacement.",
          tags: ["push", "seeding"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `heap-frequency-push-${entry.value}`,
            path: "state.heapEntries",
            kind: "collection",
            intent: "mutation",
            label: `${heapEntries.length} heap entr${heapEntries.length === 1 ? "y" : "ies"}`
          }
        ]
      });

      continue;
    }

    if (compareHeapFrequencyEntries(nextEntry, heapEntries[0]!) > 0) {
      evictedEntry = cloneHeapFrequencyEntry(heapEntries[0]!);
      heapEntries[0] = nextEntry;
      sinkDown(heapEntries, 0, compareHeapFrequencyEntries);
      metrics.pops += 1;
      metrics.pushes += 1;

      recorder.push({
        phase: "Replace",
        description: `Value ${entry.value} with frequency ${entry.frequency} beats the current cutoff ${evictedEntry!.value} × ${evictedEntry!.frequency}, so it replaces the heap root.`,
        explanation: {
          summary: "A stronger frequency candidate evicts the current minimum from the size-k heap.",
          details:
            "The replacement frame keeps both the evicted cutoff and the new root explicit so replay can explain why one tied frequency survived while another left the top-k set.",
          tags: ["replace", "evict"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `heap-frequency-replace-${entry.value}`,
            path: "state.evictedEntry",
            kind: "collection",
            intent: "mutation",
            label: `Evict ${evictedEntry!.value} × ${evictedEntry!.frequency}`
          },
          {
            key: `heap-frequency-cutoff-${entry.value}`,
            path: "state.candidateEntry",
            kind: "collection",
            intent: "result",
            label: `New cutoff ${heapEntries[0]!.value} × ${heapEntries[0]!.frequency}`
          }
        ]
      });

      continue;
    }

    recorder.push({
      phase: "Skip",
      description: `Value ${entry.value} with frequency ${entry.frequency} stays outside the heap because it does not beat the current cutoff ${heapEntries[0]!.value} × ${heapEntries[0]!.frequency}.`,
      explanation: {
        summary: "Lower-ranked frequency candidates cannot change the top-k answer once the heap is full.",
        details:
          "Skip frames make rejected value-frequency pairs explicit so replay can reopen tie-break decisions without reconstructing the heap from scratch.",
        tags: ["skip", "cutoff"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `heap-frequency-skip-${entry.value}`,
          path: "state.candidateEntry",
          kind: "collection",
          intent: "focus",
          label: `Cutoff holds at ${heapEntries[0]!.value} × ${heapEntries[0]!.frequency}`
        }
      ]
    });
  }

  currentIndex = null;
  currentValue = null;
  currentFrequency = null;
  evictedEntry = null;
  result = rankHeapFrequencyEntries(heapEntries).map((entry) => entry.value);

  recorder.push({
    phase: "Done",
    description: `The heap resolves to ${result.join(", ")} as the deterministic top-${normalizedInput.k} frequent values.`,
    explanation: {
      summary: "The replay ends with the ranked heap candidates publishing the final top-k frequency answer.",
      details:
        "Terminal playback keeps both the heap cutoff order and the ranked output order so the result can reopen without reconstructing the frequency map or tie-break rules.",
      tags: ["terminal", "result"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "heap-frequency-result",
        path: "state.result",
        kind: "collection",
        intent: "result",
        label: `Top ${normalizedInput.k}: ${result.join(", ")}`
      },
      {
        key: "heap-frequency-ranked-result",
        path: "state.rankedEntries",
        kind: "collection",
        intent: "result",
        label: `${heapEntries.length} ranked frequency candidates`
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
    case "top-k-frequent-elements":
      return buildTopKFrequentElementsTrace(input);
  }
}
