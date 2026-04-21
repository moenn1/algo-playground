import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type HashAlgorithmId = "two-sum";

export const hashAlgorithmIds: HashAlgorithmId[] = ["two-sum"];

export interface HashInput extends JsonObject {
  array: number[];
  target: number;
}

export interface HashSeenEntry extends JsonObject {
  value: number;
  index: number;
}

export interface HashExecutionState extends JsonObject {
  array: number[];
  target: number;
  currentIndex: number | null;
  currentValue: number | null;
  complement: number | null;
  complementIndex: number | null;
  seenEntries: HashSeenEntry[];
  inspectedIndices: number[];
  matchedPairIndices: number[];
  matchedPairValues: number[];
}

interface HashMetricState {
  inspections: number;
  lookups: number;
  stores: number;
}

interface HashAlgorithmDefinition {
  id: HashAlgorithmId;
  label: string;
  implementationVersion: string;
}

const hashAlgorithmDefinitions: Record<HashAlgorithmId, HashAlgorithmDefinition> = {
  "two-sum": {
    id: "two-sum",
    label: "Two Sum",
    implementationVersion: "hash-engine-0.1.0"
  }
};

export const hashMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "inspections",
    label: "Array inspections",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "lookups",
    label: "Complement lookups",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "stores",
    label: "Hash stores",
    unit: "count",
    direction: "lower-is-better"
  }
];

export const defaultTwoSumInput: HashInput = {
  array: [2, 7, 11, 15],
  target: 9
};

function cloneSeenEntries(entries: HashSeenEntry[]): HashSeenEntry[] {
  return entries.map((entry) => ({
    value: entry.value,
    index: entry.index
  }));
}

function cloneHashState(state: HashExecutionState): HashExecutionState {
  return {
    array: state.array.slice(),
    target: state.target,
    currentIndex: state.currentIndex,
    currentValue: state.currentValue,
    complement: state.complement,
    complementIndex: state.complementIndex,
    seenEntries: cloneSeenEntries(state.seenEntries),
    inspectedIndices: state.inspectedIndices.slice(),
    matchedPairIndices: state.matchedPairIndices.slice(),
    matchedPairValues: state.matchedPairValues.slice()
  };
}

function createHashRecorder(algorithmId: HashAlgorithmId) {
  return createTraceRecorder<HashExecutionState, HashExecutionState, HashMetricState>({
    algorithmId,
    projectState: cloneHashState,
    projectMetrics(metrics) {
      return {
        inspections: metrics.inspections,
        lookups: metrics.lookups,
        stores: metrics.stores
      };
    }
  });
}

function countMatchingPairs(array: number[], target: number) {
  let pairCount = 0;

  for (let left = 0; left < array.length - 1; left += 1) {
    for (let right = left + 1; right < array.length; right += 1) {
      if (array[left]! + array[right]! === target) {
        pairCount += 1;
      }
    }
  }

  return pairCount;
}

function normalizeHashInput(candidate: unknown): HashInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Hash input must be an object with array and target.");
  }

  const value = candidate as {
    array?: unknown;
    target?: unknown;
  };

  if (!Array.isArray(value.array) || value.array.length < 2) {
    throw new Error("Hash input must include an array with at least two integers.");
  }

  if (value.array.length > 24) {
    throw new Error("Hash input arrays must contain 24 integers or fewer.");
  }

  const array = value.array.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry)) {
      throw new Error(`array[${index}] must be an integer.`);
    }

    return entry;
  });

  if (typeof value.target !== "number" || !Number.isInteger(value.target)) {
    throw new Error("Hash input target must be an integer.");
  }

  const pairCount = countMatchingPairs(array, value.target);

  if (pairCount === 0) {
    throw new Error("Two Sum input must contain exactly one solution pair.");
  }

  if (pairCount > 1) {
    throw new Error(
      "Two Sum input must contain exactly one solution pair so replay stays deterministic."
    );
  }

  return {
    array,
    target: value.target
  };
}

export function parseHashInputText(inputText: string): HashInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(inputText);
  } catch {
    throw new Error("Hash input must be valid JSON.");
  }

  return normalizeHashInput(parsed);
}

export function serializeHashInput(input: HashInput): string {
  return JSON.stringify(
    {
      array: input.array,
      target: input.target
    },
    null,
    2
  );
}

function buildHashEnvelope(
  definition: HashAlgorithmDefinition,
  input: HashInput,
  recorder: ReturnType<typeof createHashRecorder>
): TraceEnvelope<HashExecutionState> {
  return createTraceEnvelope({
    algorithm: {
      id: definition.id,
      label: definition.label,
      domain: "hash",
      implementationVersion: definition.implementationVersion
    },
    input,
    steps: recorder.getSteps(),
    metricDefinitions: hashMetricDefinitions,
    comparisonMetricKeys: ["inspections", "lookups", "stores"]
  });
}

export function buildTwoSumTrace(input: HashInput): TraceEnvelope<HashExecutionState> {
  const definition = hashAlgorithmDefinitions["two-sum"];
  const normalizedInput = normalizeHashInput(input);
  const values = normalizedInput.array.slice();
  const recorder = createHashRecorder(definition.id);
  const metrics: HashMetricState = {
    inspections: 0,
    lookups: 0,
    stores: 0
  };
  const seenEntries: HashSeenEntry[] = [];
  const seenIndices = new Map<number, number>();
  const inspectedIndices: number[] = [];
  let currentIndex: number | null = null;
  let currentValue: number | null = null;
  let complement: number | null = null;
  let complementIndex: number | null = null;
  let matchedPairIndices: number[] = [];
  let matchedPairValues: number[] = [];

  const createRuntimeState = () =>
    cloneHashState({
      array: values,
      target: normalizedInput.target,
      currentIndex,
      currentValue,
      complement,
      complementIndex,
      seenEntries,
      inspectedIndices,
      matchedPairIndices,
      matchedPairValues
    });

  recorder.push({
    phase: "Initialization",
    description:
      "The replay begins before any lookup, with an empty hash table and the target pair still unresolved.",
    explanation: {
      summary: "Seed the array scan and empty lookup table before the first complement check.",
      details:
        "The timeline records an explicit empty-table baseline so later jumps never have to infer which values were already stored.",
      tags: ["snapshot", "hash"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "hash-array-initial",
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
    complement = normalizedInput.target - value;
    complementIndex = seenIndices.get(complement) ?? null;
    inspectedIndices.push(index);
    metrics.inspections += 1;
    metrics.lookups += 1;

    recorder.push({
      phase: "Lookup",
      description:
        complementIndex !== null
          ? `Value ${value} at index ${index} finds complement ${complement} already stored at index ${complementIndex}.`
          : `Value ${value} at index ${index} checks for complement ${complement} before it is stored.`,
      explanation: {
        summary:
          complementIndex !== null
            ? "The complement is already present in the lookup table, so the solution pair is now explicit."
            : "Two Sum looks up the missing complement before storing the current value.",
        details:
          "The replay keeps the lookup table as insertion-ordered entries so the UI and backend can read the exact stored state without reconstructing a map.",
        tags: ["lookup", "complement"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `hash-current-${index}`,
          path: "state.currentIndex",
          kind: "index",
          intent: "active",
          label: `Inspect index ${index}`
        },
        {
          key: `hash-seen-${index}`,
          path: "state.seenEntries",
          kind: "collection",
          intent: "focus",
          label:
            seenEntries.length > 0
              ? `${seenEntries.length} stored lookup entr${seenEntries.length === 1 ? "y" : "ies"}`
              : "Lookup table empty"
        }
      ]
    });

    if (complementIndex !== null) {
      matchedPairIndices = [complementIndex, index];
      matchedPairValues = [values[complementIndex]!, value];

      recorder.push({
        phase: "Match",
        description: `Indices ${complementIndex} and ${index} resolve the target ${normalizedInput.target}.`,
        explanation: {
          summary: "The stored complement and current value close the only valid pair.",
          details:
            "Because the input is normalized to exactly one solution pair, the first successful lookup also fixes the final replay result deterministically.",
          tags: ["solution", "pair"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `hash-pair-${complementIndex}-${index}`,
            path: "state.matchedPairIndices",
            kind: "collection",
            intent: "result",
            label: `Match ${matchedPairValues[0]} + ${matchedPairValues[1]}`
          }
        ]
      });

      break;
    }

    seenIndices.set(value, index);
    seenEntries.push({
      value,
      index
    });
    metrics.stores += 1;

    recorder.push({
      phase: "Store",
      description: `Store value ${value} from index ${index} for later complement lookups.`,
      explanation: {
        summary: "The current value enters the lookup table after the failed complement check.",
        details:
          "Recording the store as a separate frame keeps the hash-table mutation explicit instead of hiding it inside the next lookup step.",
        tags: ["store", "state-tracking"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `hash-store-${index}`,
          path: "state.seenEntries",
          kind: "collection",
          intent: "mutation",
          label: `${seenEntries.length} stored entr${seenEntries.length === 1 ? "y" : "ies"}`
        }
      ]
    });
  }

  recorder.push({
    phase: "Done",
    description: `Two Sum finishes with indices ${matchedPairIndices.join(" and ")} for target ${normalizedInput.target}.`,
    explanation: {
      summary: "The replay ends on the resolved pair and the final lookup-table snapshot.",
      details:
        "Terminal playback keeps the winning indices, values, and stored entries in one full snapshot so history and visualization surfaces can reopen the exact solution state.",
      tags: ["terminal", "result"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "hash-result-indices",
        path: "state.matchedPairIndices",
        kind: "collection",
        intent: "result",
        label: `Indices ${matchedPairIndices.join(" and ")}`
      },
      {
        key: "hash-result-values",
        path: "state.matchedPairValues",
        kind: "collection",
        intent: "result",
        label: `${matchedPairValues[0]} + ${matchedPairValues[1]} = ${normalizedInput.target}`
      }
    ]
  });

  return buildHashEnvelope(definition, normalizedInput, recorder);
}

export function buildHashTrace(
  algorithmId: HashAlgorithmId,
  input: HashInput
): TraceEnvelope<HashExecutionState> {
  switch (algorithmId) {
    case "two-sum":
      return buildTwoSumTrace(input);
  }
}
