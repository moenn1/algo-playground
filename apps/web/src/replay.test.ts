import { describe, expect, it } from "vitest";

import {
  buildGraphLayout,
  describeSortingOperation
} from "./components/ReplayVisualizations.js";
import {
  buildComparisonRuns,
  buildRun,
  getTraceStepPaths,
  type DynamicProgrammingRun,
  type IntervalRun,
  type SearchRun,
  type StackRun,
  type SortingRun,
  type WindowRun
} from "./replay.js";

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

  it("builds binary-search replay runs from the shared search engine", () => {
    const run = buildRun(
      "binary-search",
      JSON.stringify(
        {
          array: [2, 5, 8, 12, 16, 23, 38],
          target: 12
        },
        null,
        2
      )
    );

    if (run.algorithm.domain !== "search") {
      throw new Error("Expected a search run.");
    }

    const searchRun = run as SearchRun;
    const finalStep = searchRun.trace.steps[searchRun.trace.steps.length - 1]!;

    expect(searchRun.algorithm.id).toBe("binary-search");
    expect(finalStep.phase).toBe("Found");
    expect(finalStep.state.foundIndex).toBe(3);
    expect(getTraceStepPaths(finalStep)).toContain("state.foundIndex");
  });

  it("builds rotated-search replay runs from the shared search engine", () => {
    const run = buildRun(
      "search-in-rotated-sorted-array",
      JSON.stringify(
        {
          array: [15, 18, 22, 1, 3, 6, 10, 12],
          target: 6
        },
        null,
        2
      )
    );

    if (run.algorithm.domain !== "search") {
      throw new Error("Expected a search run.");
    }

    const searchRun = run as SearchRun;
    const probeSteps = searchRun.trace.steps.filter((step) => step.phase === "Probe");
    const finalStep = searchRun.trace.steps[searchRun.trace.steps.length - 1]!;

    expect(searchRun.algorithm.id).toBe("search-in-rotated-sorted-array");
    expect(probeSteps.map((step) => step.state.sortedSide)).toEqual(["right", "left"]);
    expect(finalStep.phase).toBe("Found");
    expect(finalStep.state.foundIndex).toBe(5);
    expect(getTraceStepPaths(probeSteps[0]!)).toContain("state.sortedSide");
  });

  it("builds sliding-window replay runs from the shared window engine", () => {
    const run = buildRun(
      "minimum-size-subarray-sum",
      JSON.stringify(
        {
          array: [2, 3, 1, 2, 4, 3],
          target: 7
        },
        null,
        2
      )
    );

    if (run.algorithm.domain !== "window") {
      throw new Error("Expected a window run.");
    }

    const windowRun = run as WindowRun;
    const finalStep = windowRun.trace.steps[windowRun.trace.steps.length - 1]!;

    expect(windowRun.algorithm.id).toBe("minimum-size-subarray-sum");
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.bestStart).toBe(4);
    expect(finalStep.state.bestEnd).toBe(5);
    expect(finalStep.state.bestLength).toBe(2);
    expect(
      windowRun.trace.steps.some((step) => getTraceStepPaths(step).includes("state.bestLength"))
    ).toBe(true);
  });

  it("builds dynamic-programming replay runs from the shared DP engine", () => {
    const run = buildRun(
      "longest-common-subsequence",
      JSON.stringify(
        {
          left: "XMJYAUZ",
          right: "MZJAWXU"
        },
        null,
        2
      )
    );

    if (run.algorithm.domain !== "dynamic-programming") {
      throw new Error("Expected a dynamic-programming run.");
    }

    const dynamicProgrammingRun = run as DynamicProgrammingRun;
    const finalStep = dynamicProgrammingRun.trace.steps[dynamicProgrammingRun.trace.steps.length - 1]!;

    expect(dynamicProgrammingRun.algorithm.id).toBe("longest-common-subsequence");
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.resultLength).toBe(4);
    expect(finalStep.state.resultSequence).toBe("MJAU");
    expect(finalStep.highlights.map((highlight) => highlight.path)).toContain("state.resultSequence");
  });

  it("builds interval replay runs from the shared interval engine", () => {
    const run = buildRun(
      "merge-intervals",
      JSON.stringify(
        {
          intervals: [
            [1, 3],
            [2, 6],
            [8, 10],
            [15, 18]
          ]
        },
        null,
        2
      )
    );

    if (run.algorithm.domain !== "interval") {
      throw new Error("Expected an interval run.");
    }

    const intervalRun = run as IntervalRun;
    const finalStep = intervalRun.trace.steps[intervalRun.trace.steps.length - 1]!;

    expect(intervalRun.algorithm.id).toBe("merge-intervals");
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.mergedIntervals).toEqual([
      [1, 6],
      [8, 10],
      [15, 18]
    ]);
    expect(finalStep.highlights.map((highlight) => highlight.path)).toContain("state.mergedIntervals");
  });

  it("builds stack replay runs from the shared stack engine", () => {
    const run = buildRun(
      "valid-parentheses",
      JSON.stringify(
        {
          expression: "({[]})[]"
        },
        null,
        2
      )
    );

    if (run.algorithm.domain !== "stack") {
      throw new Error("Expected a stack run.");
    }

    const stackRun = run as StackRun;
    const finalStep = stackRun.trace.steps[stackRun.trace.steps.length - 1]!;

    expect(stackRun.algorithm.id).toBe("valid-parentheses");
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.valid).toBe(true);
    expect(finalStep.state.stackTokens).toEqual([]);
    expect(finalStep.state.matchedPairs).toHaveLength(4);
  });
});

describe("replay visualizations", () => {
  it("describes swap-focused sorting steps from recorded trace state", () => {
    const run = buildRun("bubble-sort", "2, 1");

    if (run.algorithm.domain !== "sorting") {
      throw new Error("Expected a sorting run.");
    }

    const sortingRun = run as SortingRun;
    const swapStep = sortingRun.trace.steps.find((step) => step.state.swapPair.length === 2);

    expect(swapStep).toBeDefined();
    expect(describeSortingOperation(swapStep!)).toBe("Swap lanes 0 and 1");
  });

  it("builds deterministic graph layouts inside the shared viewport", () => {
    const layout = buildGraphLayout(["A", "B", "C", "D", "E", "F"]);
    const points = Object.values(layout);

    expect(points).toHaveLength(6);
    expect(new Set(points.map((point) => `${point.x}:${point.y}`)).size).toBe(6);
    expect(points.every((point) => point.x > 0 && point.x < 360)).toBe(true);
    expect(points.every((point) => point.y > 0 && point.y < 300)).toBe(true);
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
