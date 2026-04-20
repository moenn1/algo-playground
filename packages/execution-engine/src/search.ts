import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type SearchAlgorithmId = "binary-search";

export const searchAlgorithmIds: SearchAlgorithmId[] = ["binary-search"];

export interface SearchInput extends JsonObject {
  array: number[];
  target: number;
}

export interface SearchExecutionState extends JsonObject {
  array: number[];
  target: number;
  low: number | null;
  high: number | null;
  mid: number | null;
  eliminatedIndices: number[];
  foundIndex: number | null;
}

interface SearchMetricState {
  probes: number;
  comparisons: number;
}

interface SearchAlgorithmDefinition {
  id: SearchAlgorithmId;
  label: string;
  implementationVersion: string;
}

const searchAlgorithmDefinitions: Record<SearchAlgorithmId, SearchAlgorithmDefinition> = {
  "binary-search": {
    id: "binary-search",
    label: "Binary Search",
    implementationVersion: "search-engine-0.1.0"
  }
};

export const searchMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "probes",
    label: "Midpoint probes",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "comparisons",
    label: "Comparisons",
    unit: "count",
    direction: "lower-is-better"
  }
];

export const defaultBinarySearchInput: SearchInput = {
  array: [2, 5, 8, 12, 16, 23, 38, 56, 72],
  target: 23
};

function cloneSearchState(state: SearchExecutionState): SearchExecutionState {
  return {
    array: state.array.slice(),
    target: state.target,
    low: state.low,
    high: state.high,
    mid: state.mid,
    eliminatedIndices: state.eliminatedIndices.slice(),
    foundIndex: state.foundIndex
  };
}

function createSearchRecorder(algorithmId: SearchAlgorithmId) {
  return createTraceRecorder<SearchExecutionState, SearchExecutionState, SearchMetricState>({
    algorithmId,
    projectState: cloneSearchState,
    projectMetrics(metrics) {
      return {
        probes: metrics.probes,
        comparisons: metrics.comparisons
      };
    }
  });
}

function createInclusiveRange(start: number, end: number): number[] {
  if (start > end) {
    return [];
  }

  return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
}

function toSortedUniqueIndices(indices: number[]): number[] {
  return Array.from(new Set(indices)).sort((left, right) => left - right);
}

function normalizeSearchInput(candidate: unknown): SearchInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Search input must be an object with array and target.");
  }

  const value = candidate as {
    array?: unknown;
    target?: unknown;
  };

  if (!Array.isArray(value.array) || value.array.length < 2) {
    throw new Error("Search input must include a sorted array with at least two integers.");
  }

  if (value.array.length > 32) {
    throw new Error("Search input arrays must contain 32 integers or fewer.");
  }

  const array = value.array.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry)) {
      throw new Error(`array[${index}] must be an integer.`);
    }

    return entry;
  });

  for (let index = 1; index < array.length; index += 1) {
    if (array[index - 1]! > array[index]!) {
      throw new Error("Search input array must be sorted in ascending order.");
    }
  }

  if (typeof value.target !== "number" || !Number.isInteger(value.target)) {
    throw new Error("Search input target must be an integer.");
  }

  return {
    array,
    target: value.target
  };
}

export function parseSearchInputText(inputText: string): SearchInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(inputText);
  } catch {
    throw new Error("Search input must be valid JSON.");
  }

  return normalizeSearchInput(parsed);
}

export function serializeSearchInput(input: SearchInput): string {
  return JSON.stringify(
    {
      array: input.array,
      target: input.target
    },
    null,
    2
  );
}

function buildSearchEnvelope(
  definition: SearchAlgorithmDefinition,
  input: SearchInput,
  recorder: ReturnType<typeof createSearchRecorder>
): TraceEnvelope<SearchExecutionState> {
  return createTraceEnvelope({
    algorithm: {
      id: definition.id,
      label: definition.label,
      domain: "search",
      implementationVersion: definition.implementationVersion
    },
    input,
    steps: recorder.getSteps(),
    metricDefinitions: searchMetricDefinitions,
    comparisonMetricKeys: ["probes", "comparisons"]
  });
}

export function buildBinarySearchTrace(input: SearchInput): TraceEnvelope<SearchExecutionState> {
  const definition = searchAlgorithmDefinitions["binary-search"];
  const normalizedInput = normalizeSearchInput(input);
  const values = normalizedInput.array.slice();
  const recorder = createSearchRecorder(definition.id);
  const metrics: SearchMetricState = {
    probes: 0,
    comparisons: 0
  };
  let low = 0;
  let high = values.length - 1;
  let eliminatedIndices: number[] = [];

  recorder.push({
    phase: "Initialization",
    description:
      "The replay begins with the full sorted interval available, so any timeline jump can restore the full search bounds directly.",
    explanation: {
      summary: "Seed the sorted array and target before the first midpoint probe.",
      details:
        "Binary search only mutates interval bounds, so replay snapshots record the full array plus the active low and high indices.",
      tags: ["snapshot", "input"]
    },
    runtimeState: {
      array: values,
      target: normalizedInput.target,
      low,
      high,
      mid: null,
      eliminatedIndices,
      foundIndex: null
    },
    metrics,
    highlights: [
      {
        key: "search-range-initial",
        path: "state.array",
        kind: "range",
        intent: "focus",
        label: `Search lanes ${low} through ${high}`,
        metadata: {
          start: low,
          end: high
        }
      }
    ]
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const probeValue = values[mid]!;
    const activeLow = low;
    const activeHigh = high;
    metrics.probes += 1;
    metrics.comparisons += 1;

    recorder.push({
      phase: "Probe",
      description: `Probe lane ${mid}. Value ${probeValue} is compared against target ${normalizedInput.target}.`,
      explanation: {
        summary: "Inspect the midpoint of the remaining sorted interval.",
        details:
          "The midpoint is chosen deterministically with floor division so repeated runs emit identical probe sequences.",
        tags: ["probe", "midpoint"]
      },
      runtimeState: {
        array: values,
        target: normalizedInput.target,
        low: activeLow,
        high: activeHigh,
        mid,
        eliminatedIndices,
        foundIndex: null
      },
      metrics,
      highlights: [
        {
          key: `search-window-${mid}`,
          path: "state.array",
          kind: "range",
          intent: "focus",
          label: `Active interval ${activeLow} through ${activeHigh}`,
          metadata: {
            start: activeLow,
            end: activeHigh
          }
        },
        {
          key: `search-mid-${mid}`,
          path: "state.mid",
          kind: "index",
          intent: "candidate",
          label: `Probe midpoint ${mid}`,
          metadata: {
            index: mid,
            value: probeValue
          }
        }
      ]
    });

    if (probeValue === normalizedInput.target) {
      recorder.push({
        phase: "Found",
        description: `Target ${normalizedInput.target} is present at lane ${mid}, so the replay records the match as a terminal checkpoint.`,
        explanation: {
          summary: "Record the successful match without relying on live search state.",
          details:
            "The terminal frame keeps the active interval and the resolved match index in one snapshot so scrubbing never recomputes the probe path.",
          tags: ["result", "checkpoint"]
        },
        runtimeState: {
          array: values,
          target: normalizedInput.target,
          low: activeLow,
          high: activeHigh,
          mid,
          eliminatedIndices,
          foundIndex: mid
        },
        metrics,
        highlights: [
          {
            key: `search-found-${mid}`,
            path: "state.foundIndex",
            kind: "index",
            intent: "result",
            label: `Found target at lane ${mid}`,
            metadata: {
              index: mid,
              value: probeValue
            }
          }
        ]
      });

      return buildSearchEnvelope(definition, normalizedInput, recorder);
    }

    metrics.comparisons += 1;

    if (probeValue < normalizedInput.target) {
      const discardedRange = createInclusiveRange(activeLow, mid);
      eliminatedIndices = toSortedUniqueIndices([...eliminatedIndices, ...discardedRange]);
      low = mid + 1;

      recorder.push({
        phase: "Discard Left",
        description: `Value ${probeValue} is smaller than target ${normalizedInput.target}, so lanes ${activeLow} through ${mid} are removed from consideration.`,
        explanation: {
          summary: "Discard the lower half including the midpoint probe.",
          details:
            "Every value left of the midpoint is also smaller because the array remains sorted at every recorded frame.",
          tags: ["interval", "discard"]
        },
        runtimeState: {
          array: values,
          target: normalizedInput.target,
          low,
          high: activeHigh,
          mid: null,
          eliminatedIndices,
          foundIndex: null
        },
        metrics,
        highlights: [
          {
            key: `search-discard-left-${mid}`,
            path: "state.eliminatedIndices",
            kind: "range",
            intent: "mutation",
            label: `Discarded lanes ${activeLow} through ${mid}`,
            metadata: {
              start: activeLow,
              end: mid
            }
          }
        ]
      });

      continue;
    }

    const discardedRange = createInclusiveRange(mid, activeHigh);
    eliminatedIndices = toSortedUniqueIndices([...eliminatedIndices, ...discardedRange]);
    high = mid - 1;

    recorder.push({
      phase: "Discard Right",
      description: `Value ${probeValue} is larger than target ${normalizedInput.target}, so lanes ${mid} through ${activeHigh} are removed from consideration.`,
      explanation: {
        summary: "Discard the upper half including the midpoint probe.",
        details:
          "Because the array is sorted, every lane to the right of the midpoint must also exceed the target.",
        tags: ["interval", "discard"]
      },
      runtimeState: {
        array: values,
        target: normalizedInput.target,
        low: activeLow,
        high,
        mid: null,
        eliminatedIndices,
        foundIndex: null
      },
      metrics,
      highlights: [
        {
          key: `search-discard-right-${mid}`,
          path: "state.eliminatedIndices",
          kind: "range",
          intent: "mutation",
          label: `Discarded lanes ${mid} through ${activeHigh}`,
          metadata: {
            start: mid,
            end: activeHigh
          }
        }
      ]
    });
  }

  recorder.push({
    phase: "Not Found",
    description: `No lane contains target ${normalizedInput.target}; the replay ends after the search interval collapses.`,
    explanation: {
      summary: "Record the exhausted interval as an explicit terminal frame.",
      details:
        "The search stops when the low bound crosses the high bound, so the timeline stores that exhausted state instead of inferring it at replay time.",
      tags: ["result", "exhausted"]
    },
    runtimeState: {
      array: values,
      target: normalizedInput.target,
      low: null,
      high: null,
      mid: null,
      eliminatedIndices,
      foundIndex: null
    },
    metrics,
    highlights: [
      {
        key: "search-not-found",
        path: "state.array",
        kind: "collection",
        intent: "result",
        label: `Target ${normalizedInput.target} not present`
      }
    ]
  });

  return buildSearchEnvelope(definition, normalizedInput, recorder);
}

export function buildSearchTrace(
  algorithmId: SearchAlgorithmId,
  input: SearchInput
): TraceEnvelope<SearchExecutionState> {
  switch (algorithmId) {
    case "binary-search":
      return buildBinarySearchTrace(input);
  }
}
