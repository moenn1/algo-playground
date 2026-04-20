import { describe, expect, it } from "vitest";

import {
  canonicalizeJson,
  createTraceEnvelope,
  TRACE_SCHEMA_VERSION,
  TRACE_REPLAY_INVARIANTS,
  stableStringifyJson,
  type TraceMetricDefinition,
  type TraceStep
} from "../src/index.js";

const metricDefinitions: TraceMetricDefinition[] = [
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
  }
];

const steps: TraceStep[] = [
  {
    index: 0,
    key: "start",
    phase: "start",
    description: "Initial array snapshot",
    explanation: {
      summary: "Capture the unsorted input before any comparisons.",
      tags: ["snapshot", "input"]
    },
    state: {
      values: [5, 1, 3],
      pointers: {
        left: 0,
        right: 1
      }
    },
    changes: [
      {
        path: "values",
        op: "set",
        nextValue: [5, 1, 3]
      }
    ],
    highlights: [
      {
        key: "cursor-left",
        path: "pointers.left",
        kind: "index",
        intent: "focus",
        label: "Left cursor"
      }
    ],
    metrics: {
      comparisons: 0,
      swaps: 0
    }
  },
  {
    index: 1,
    key: "compare-0-1",
    phase: "compare",
    description: "Compare the first pair",
    explanation: {
      summary: "Compare adjacent values and swap them when out of order.",
      details: "Bubble sort swaps 5 and 1 so the smaller value moves left.",
      tags: ["comparison", "swap"]
    },
    state: {
      values: [1, 5, 3],
      pointers: {
        left: 0,
        right: 1
      }
    },
    changes: [
      {
        path: "values.0",
        op: "set",
        previousValue: 5,
        nextValue: 1
      },
      {
        path: "values.1",
        op: "set",
        previousValue: 1,
        nextValue: 5
      }
    ],
    highlights: [
      {
        key: "swap-window",
        path: "values",
        kind: "range",
        intent: "mutation",
        metadata: {
          start: 0,
          end: 1
        }
      }
    ],
    metrics: {
      comparisons: 1,
      swaps: 1
    }
  }
];

describe("createTraceEnvelope", () => {
  it("builds a summary around deterministic steps", () => {
    const trace = createTraceEnvelope({
      algorithm: {
        id: "bubble-sort",
        label: "Bubble Sort",
        domain: "sorting",
        implementationVersion: "0.1.0"
      },
      input: {
        values: [5, 1, 3],
        meta: {
          seed: "demo",
          scenario: "adjacent-swap"
        }
      },
      steps,
      metricDefinitions: [
        metricDefinitions[1],
        metricDefinitions[0]
      ],
      comparisonMetricKeys: ["comparisons", "swaps"]
    });

    expect(trace.schemaVersion).toBe(TRACE_SCHEMA_VERSION);
    expect(trace.summary.stepCount).toBe(2);
    expect(trace.summary.stepKeys).toEqual(["start", "compare-0-1"]);
    expect(trace.summary.comparisonMetricKeys).toEqual(["comparisons", "swaps"]);
    expect(trace.summary.finalMetrics).toEqual({
      comparisons: 1,
      swaps: 1
    });
    expect(trace.replay.invariants).toEqual(TRACE_REPLAY_INVARIANTS);
    expect(Object.keys(trace.steps[0].state)).toEqual(["pointers", "values"]);
    expect(Object.keys(trace.input as Record<string, unknown>)).toEqual(["meta", "values"]);
    expect(trace.summary.metricDefinitions.map((metric) => metric.key)).toEqual([
      "swaps",
      "comparisons"
    ]);
  });

  it("rejects traces with non-contiguous steps", () => {
    expect(() =>
      createTraceEnvelope({
        algorithm: {
          id: "bubble-sort",
          label: "Bubble Sort",
          domain: "sorting",
          implementationVersion: "0.1.0"
        },
        input: [5, 1, 3],
        steps: [
          {
            ...steps[0],
            index: 2
          }
        ],
        metricDefinitions,
        comparisonMetricKeys: ["comparisons"]
      })
    ).toThrow("Trace steps must use contiguous indexes starting at 0.");
  });

  it("rejects undeclared step metrics", () => {
    expect(() =>
      createTraceEnvelope({
        algorithm: {
          id: "bubble-sort",
          label: "Bubble Sort",
          domain: "sorting",
          implementationVersion: "0.1.0"
        },
        input: [5, 1, 3],
        steps: [
          {
            ...steps[0],
            metrics: {
              comparisons: 0,
              writes: 1
            }
          }
        ],
        metricDefinitions,
        comparisonMetricKeys: ["comparisons"]
      })
    ).toThrow('Trace step 0 references undeclared metric "writes".');
  });

  it("rejects traces whose final step omits a comparison metric", () => {
    expect(() =>
      createTraceEnvelope({
        algorithm: {
          id: "bubble-sort",
          label: "Bubble Sort",
          domain: "sorting",
          implementationVersion: "0.1.0"
        },
        input: [5, 1, 3],
        steps: [
          steps[0],
          {
            ...steps[1],
            metrics: {
              comparisons: 1
            }
          }
        ],
        metricDefinitions,
        comparisonMetricKeys: ["comparisons", "swaps"]
      })
    ).toThrow('Final step metrics must include comparison metric "swaps".');
  });
});

describe("JSON canonicalization helpers", () => {
  it("sorts nested object keys deterministically", () => {
    const canonical = canonicalizeJson({
      zebra: {
        beta: 2,
        alpha: 1
      },
      alpha: {
        beta: true,
        alpha: false
      }
    });

    expect(Object.keys(canonical)).toEqual(["alpha", "zebra"]);
    expect(Object.keys(canonical.alpha as Record<string, unknown>)).toEqual([
      "alpha",
      "beta"
    ]);
  });

  it("stable-stringifies canonical JSON payloads", () => {
    expect(
      stableStringifyJson({
        beta: 2,
        alpha: {
          delta: 4,
          gamma: 3
        }
      })
    ).toBe('{"alpha":{"delta":4,"gamma":3},"beta":2}');
  });
});
