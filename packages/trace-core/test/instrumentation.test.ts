import { describe, expect, it } from "vitest";

import { createTraceRecorder, diffTraceProjection } from "../src/index.js";

describe("diffTraceProjection", () => {
  it("keeps array diffs at the collection path and recurses object leaves", () => {
    expect(
      diffTraceProjection(
        "state",
        {
          array: [5, 1, 3],
          distances: {
            A: 0,
            B: null
          }
        },
        {
          array: [1, 5, 3],
          distances: {
            A: 0,
            B: 4
          }
        }
      )
    ).toEqual([
      {
        path: "state.array",
        op: "set",
        previousValue: [5, 1, 3],
        nextValue: [1, 5, 3]
      },
      {
        path: "state.distances.B",
        op: "set",
        previousValue: null,
        nextValue: 4
      }
    ]);
  });
});

describe("createTraceRecorder", () => {
  it("projects runtime state into deterministic steps and automatic path diffs", () => {
    const recorder = createTraceRecorder<
      {
        values: number[];
        frontier: Set<number>;
      },
      {
        values: number[];
        frontier: number[];
      },
      {
        comparisons: number;
      }
    >({
      algorithmId: "selection-sort",
      projectState(runtimeState) {
        return {
          values: runtimeState.values.slice(),
          frontier: Array.from(runtimeState.frontier).sort((left, right) => left - right)
        };
      },
      projectMetrics(metrics) {
        return {
          comparisons: metrics.comparisons
        };
      }
    });

    recorder.push({
      phase: "Initialization",
      description: "Seed the runtime model.",
      explanation: {
        summary: "Capture the runtime snapshot before any comparisons.",
        tags: ["snapshot"]
      },
      runtimeState: {
        values: [5, 1, 3],
        frontier: new Set([0])
      },
      metrics: {
        comparisons: 0
      }
    });

    recorder.push({
      phase: "Compare",
      description: "Swap the first pair.",
      explanation: {
        summary: "Promote the smaller value into the left lane."
      },
      runtimeState: {
        values: [1, 5, 3],
        frontier: new Set([0, 1])
      },
      metrics: {
        comparisons: 1
      }
    });

    const steps = recorder.getSteps();

    expect(steps.map((step) => step.key)).toEqual([
      "selection-sort-000-initialization",
      "selection-sort-001-compare"
    ]);
    expect(steps[0]?.changes).toEqual([
      {
        path: "state.frontier",
        op: "set",
        nextValue: [0]
      },
      {
        path: "state.values",
        op: "set",
        nextValue: [5, 1, 3]
      }
    ]);
    expect(steps[1]?.changes).toEqual([
      {
        path: "state.frontier",
        op: "set",
        previousValue: [0],
        nextValue: [0, 1]
      },
      {
        path: "state.values",
        op: "set",
        previousValue: [5, 1, 3],
        nextValue: [1, 5, 3]
      },
      {
        path: "metrics.comparisons",
        op: "set",
        previousValue: 0,
        nextValue: 1
      }
    ]);
  });
});
