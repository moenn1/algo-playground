import { describe, expect, it } from "vitest";

import { buildComparisonRuns, buildRun, getTraceStepPaths, type SortingRun } from "./replay.js";

describe("buildRun", () => {
  it("emits schema-compliant sorting traces for quick sort", () => {
    const run = buildRun("quick-sort", "5, 1, 4, 2");

    if (run.algorithm.domain !== "sorting") {
      throw new Error("Expected a sorting run.");
    }

    const sortingRun = run as SortingRun;

    expect(sortingRun.algorithm.id).toBe("quick-sort");
    expect(sortingRun.trace.steps[0]!.explanation.summary.length).toBeGreaterThan(0);
    expect(sortingRun.trace.steps[0]!.changes.length).toBeGreaterThan(0);
    expect(sortingRun.trace.steps[0]!.highlights.length).toBeGreaterThan(0);
    expect(sortingRun.trace.summary.finalMetrics.comparisons).toBeGreaterThan(0);
    expect(sortingRun.trace.summary.finalMetrics.writes).toBeGreaterThanOrEqual(0);

    const finalStep = sortingRun.trace.steps[sortingRun.trace.steps.length - 1]!;
    expect(finalStep.state.array).toEqual([1, 2, 4, 5]);
    expect(finalStep.state.sortedIndices).toEqual([0, 1, 2, 3]);
  });

  it("emits structured graph trace paths for dijkstra", () => {
    const run = buildRun(
      "dijkstra",
      JSON.stringify(
        {
          nodes: ["A", "B", "C"],
          edges: [
            ["A", "B", 2],
            ["B", "C", 2],
            ["A", "C", 5]
          ],
          start: "A",
          target: "C",
          directed: false
        },
        null,
        2
      )
    );

    if (run.algorithm.domain !== "graph") {
      throw new Error("Expected a graph run.");
    }

    const finalStep = run.trace.steps[run.trace.steps.length - 1]!;
    expect(finalStep.state.path).toEqual(["A", "B", "C"]);
    expect(getTraceStepPaths(finalStep)).toContain("state.path");
  });

  it("builds breadth-first replay runs from the shared graph engine", () => {
    const run = buildRun(
      "bfs",
      JSON.stringify(
        {
          nodes: ["A", "B", "C", "D"],
          edges: [
            ["A", "B", 1],
            ["A", "C", 1],
            ["B", "D", 1],
            ["C", "D", 1]
          ],
          start: "A",
          target: "D",
          directed: false
        },
        null,
        2
      )
    );

    if (run.algorithm.domain !== "graph") {
      throw new Error("Expected a graph run.");
    }

    const finalStep = run.trace.steps[run.trace.steps.length - 1]!;
    expect(run.algorithm.id).toBe("bfs");
    expect(finalStep.state.path).toEqual(["A", "B", "D"]);
    expect(finalStep.state.frontier).toEqual([]);
    expect(run.trace.summary.finalMetrics.settled).toBeGreaterThan(0);
  });
});

describe("buildComparisonRuns", () => {
  it("builds multiple sorting runs from the same normalized input", () => {
    const runs = buildComparisonRuns("9,3,7,1");

    expect(runs).toHaveLength(4);
    expect(new Set(runs.map((run) => run.normalizedInputText))).toEqual(new Set(["9, 3, 7, 1"]));
    expect(runs.map((run) => run.algorithm.id)).toEqual([
      "bubble-sort",
      "selection-sort",
      "quick-sort",
      "merge-sort"
    ]);
    expect(
      runs.every((run) => run.trace.summary.comparisonMetricKeys.join(",") === "comparisons,writes")
    ).toBe(true);
  });
});
