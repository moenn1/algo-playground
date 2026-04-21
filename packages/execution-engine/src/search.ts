import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type SearchAlgorithmId = "binary-search" | "search-in-rotated-sorted-array";

export const searchAlgorithmIds: SearchAlgorithmId[] = [
  "binary-search",
  "search-in-rotated-sorted-array"
];

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
  sortedSide: "left" | "right" | null;
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
    implementationVersion: "search-engine-0.2.0"
  },
  "search-in-rotated-sorted-array": {
    id: "search-in-rotated-sorted-array",
    label: "Search in Rotated Sorted Array",
    implementationVersion: "search-engine-0.2.0"
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

export const defaultRotatedSearchInput: SearchInput = {
  array: [15, 18, 22, 1, 3, 6, 10, 12],
  target: 6
};

function cloneSearchState(state: SearchExecutionState): SearchExecutionState {
  return {
    array: state.array.slice(),
    target: state.target,
    low: state.low,
    high: state.high,
    mid: state.mid,
    sortedSide: state.sortedSide,
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

function normalizeIntegerSearchInput(candidate: unknown): SearchInput {
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

  if (typeof value.target !== "number" || !Number.isInteger(value.target)) {
    throw new Error("Search input target must be an integer.");
  }

  return {
    array,
    target: value.target
  };
}

function assertAscendingSorted(array: number[]) {
  for (let index = 1; index < array.length; index += 1) {
    if (array[index - 1]! > array[index]!) {
      throw new Error("Binary Search input array must be sorted in ascending order.");
    }
  }
}

function assertRotatedSortedDistinct(array: number[]) {
  const seen = new Set<number>();
  let dropCount = 0;

  for (let index = 0; index < array.length; index += 1) {
    const value = array[index]!;

    if (seen.has(value)) {
      throw new Error(
        "Search in Rotated Sorted Array requires distinct integers so the sorted half stays deterministic."
      );
    }

    seen.add(value);

    if (index > 0 && array[index - 1]! > value) {
      dropCount += 1;
    }
  }

  if (dropCount > 1) {
    throw new Error(
      "Search in Rotated Sorted Array input must be a rotation of a strictly increasing array."
    );
  }

  if (dropCount === 1 && array[array.length - 1]! >= array[0]!) {
    throw new Error(
      "Search in Rotated Sorted Array input must wrap exactly once when the order drops."
    );
  }
}

function normalizeSearchInput(
  candidate: unknown,
  algorithmId: SearchAlgorithmId = "binary-search"
): SearchInput {
  const input = normalizeIntegerSearchInput(candidate);

  switch (algorithmId) {
    case "binary-search":
      assertAscendingSorted(input.array);
      return input;
    case "search-in-rotated-sorted-array":
      assertRotatedSortedDistinct(input.array);
      return input;
  }
}

export function parseSearchInputText(
  inputText: string,
  algorithmId: SearchAlgorithmId = "binary-search"
): SearchInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(inputText);
  } catch {
    throw new Error("Search input must be valid JSON.");
  }

  return normalizeSearchInput(parsed, algorithmId);
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
        sortedSide: null,
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
        sortedSide: null,
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
          sortedSide: null,
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
          sortedSide: null,
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
        sortedSide: null,
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
      sortedSide: null,
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

export function buildRotatedSearchTrace(input: SearchInput): TraceEnvelope<SearchExecutionState> {
  const definition = searchAlgorithmDefinitions["search-in-rotated-sorted-array"];
  const normalizedInput = normalizeSearchInput(input, definition.id);
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
      "The replay begins with the full rotated array available, so every later jump can restore the current search window and discarded lanes directly.",
    explanation: {
      summary: "Seed the rotated array before the first midpoint probe.",
      details:
        "The shared search stage still replays one interval at a time, but rotated-search frames also record which half is currently ordered so the branch decision stays explicit.",
      tags: ["snapshot", "input"]
    },
    runtimeState: {
      array: values,
      target: normalizedInput.target,
      low,
      high,
      mid: null,
      sortedSide: null,
      eliminatedIndices,
      foundIndex: null
    },
    metrics,
    highlights: [
      {
        key: "rotated-search-range-initial",
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
    const lowValue = values[activeLow]!;
    const highValue = values[activeHigh]!;
    const sortedSide = lowValue <= probeValue ? "left" : "right";
    metrics.probes += 1;
    metrics.comparisons += 2;

    recorder.push({
      phase: "Probe",
      description: `Probe lane ${mid}. Value ${probeValue} is checked inside a rotated window where the ${sortedSide} half is currently ordered.`,
      explanation: {
        summary: "Inspect the midpoint and identify which half of the rotated interval is sorted.",
        details:
          "Distinct values guarantee that at least one half remains globally ordered, so replay records that half explicitly before discarding the impossible side.",
        tags: ["probe", "rotation"]
      },
      runtimeState: {
        array: values,
        target: normalizedInput.target,
        low: activeLow,
        high: activeHigh,
        mid,
        sortedSide,
        eliminatedIndices,
        foundIndex: null
      },
      metrics,
      highlights: [
        {
          key: `rotated-search-window-${mid}`,
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
          key: `rotated-search-mid-${mid}`,
          path: "state.mid",
          kind: "index",
          intent: "candidate",
          label: `Probe midpoint ${mid}`,
          metadata: {
            index: mid,
            value: probeValue
          }
        },
        {
          key: `rotated-search-sorted-${sortedSide}-${mid}`,
          path: "state.array",
          kind: "range",
          intent: "candidate",
          label:
            sortedSide === "left"
              ? `Ordered half ${activeLow} through ${mid}`
              : `Ordered half ${mid} through ${activeHigh}`,
          metadata:
            sortedSide === "left"
              ? {
                  start: activeLow,
                  end: mid
                }
              : {
                  start: mid,
                  end: activeHigh
                }
        }
      ]
    });

    if (probeValue === normalizedInput.target) {
      recorder.push({
        phase: "Found",
        description: `Target ${normalizedInput.target} is present at lane ${mid}, so the replay stores the rotated-array hit as a terminal checkpoint.`,
        explanation: {
          summary: "Record the successful rotated-search match without recomputing branch logic.",
          details:
            "The terminal frame keeps the active interval, ordered side, and match lane together so scrubbed playback never reruns the sorted-half test.",
          tags: ["result", "checkpoint"]
        },
        runtimeState: {
          array: values,
          target: normalizedInput.target,
          low: activeLow,
          high: activeHigh,
          mid,
          sortedSide,
          eliminatedIndices,
          foundIndex: mid
        },
        metrics,
        highlights: [
          {
            key: `rotated-search-found-${mid}`,
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

    let discardStart = activeLow;
    let discardEnd = mid;
    let nextLow = activeLow;
    let nextHigh = activeHigh;
    let phase: "Discard Left" | "Discard Right" = "Discard Left";
    let description = "";
    let summary = "";
    let details = "";

    if (sortedSide === "left") {
      metrics.comparisons += 2;

      if (lowValue <= normalizedInput.target && normalizedInput.target < probeValue) {
        discardStart = mid;
        discardEnd = activeHigh;
        nextHigh = mid - 1;
        phase = "Discard Right";
        description = `Lanes ${activeLow} through ${mid} stay live because they are ordered and still contain target ${normalizedInput.target}, so the rotated tail ${mid} through ${activeHigh} is discarded.`;
        summary = "Keep the ordered left half and discard the rotated right tail.";
        details =
          "The left half is strictly increasing and the target falls within its bounds, so every lane at or to the right of the midpoint becomes impossible.";
      } else {
        nextLow = mid + 1;
        phase = "Discard Left";
        description = `The ordered left half ${activeLow} through ${mid} cannot contain target ${normalizedInput.target}, so those lanes are discarded and replay moves into the rotated right side.`;
        summary = "Discard the ordered left half and continue on the rotated right side.";
        details =
          "Once the target falls outside the ordered left-half bounds, only the remaining right segment can still contain it.";
      }
    } else {
      metrics.comparisons += 2;

      if (probeValue < normalizedInput.target && normalizedInput.target <= highValue) {
        nextLow = mid + 1;
        phase = "Discard Left";
        description = `The ordered right half ${mid} through ${activeHigh} still brackets target ${normalizedInput.target}, so lanes ${activeLow} through ${mid} are discarded.`;
        summary = "Keep the ordered right half and discard the rotated left side.";
        details =
          "The right half is strictly increasing and its bounds still contain the target, so the left segment can be removed from the search window.";
      } else {
        discardStart = mid;
        discardEnd = activeHigh;
        nextHigh = mid - 1;
        phase = "Discard Right";
        description = `Target ${normalizedInput.target} falls outside the ordered right-half bounds, so replay discards lanes ${mid} through ${activeHigh} and returns to the left side.`;
        summary = "Discard the ordered right half and continue on the left side.";
        details =
          "Because the target is not inside the ordered right-half interval, the only remaining candidate region is the left segment.";
      }
    }

    eliminatedIndices = toSortedUniqueIndices([
      ...eliminatedIndices,
      ...createInclusiveRange(discardStart, discardEnd)
    ]);
    low = nextLow;
    high = nextHigh;

    recorder.push({
      phase,
      description,
      explanation: {
        summary,
        details,
        tags: ["interval", "discard", "rotation"]
      },
      runtimeState: {
        array: values,
        target: normalizedInput.target,
        low: low <= high ? low : null,
        high: low <= high ? high : null,
        mid: null,
        sortedSide: null,
        eliminatedIndices,
        foundIndex: null
      },
      metrics,
      highlights: [
        {
          key: `rotated-search-discard-${phase === "Discard Left" ? "left" : "right"}-${mid}`,
          path: "state.eliminatedIndices",
          kind: "range",
          intent: "mutation",
          label: `Discarded lanes ${discardStart} through ${discardEnd}`,
          metadata: {
            start: discardStart,
            end: discardEnd
          }
        }
      ]
    });
  }

  recorder.push({
    phase: "Not Found",
    description: `No lane contains target ${normalizedInput.target}; the rotated-search window collapses after every impossible side has been discarded explicitly.`,
    explanation: {
      summary: "Record the exhausted rotated-search interval as a terminal frame.",
      details:
        "The final checkpoint stores the fully eliminated lane set and null bounds so replay never infers why the rotated search terminated.",
      tags: ["result", "exhausted", "rotation"]
    },
    runtimeState: {
      array: values,
      target: normalizedInput.target,
      low: null,
      high: null,
      mid: null,
      sortedSide: null,
      eliminatedIndices,
      foundIndex: null
    },
    metrics,
    highlights: [
      {
        key: "rotated-search-not-found",
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
    case "search-in-rotated-sorted-array":
      return buildRotatedSearchTrace(input);
  }
}
