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
  type HashRun,
  type HeapRun,
  type IntervalRun,
  type SearchRun,
  type StackRun,
  type SortingRun,
  type TwoPointersRun,
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

  it("builds course-schedule replay runs from the shared graph engine", () => {
    const run = buildRun(
      "course-schedule",
      JSON.stringify(
        {
          courseCount: 4,
          prerequisites: [
            [1, 0],
            [2, 0],
            [3, 1]
          ]
        },
        null,
        2
      )
    );

    if (run.algorithm.domain !== "graph") {
      throw new Error("Expected a graph run.");
    }

    const finalStep = run.trace.steps[run.trace.steps.length - 1]!;

    expect(run.algorithm.id).toBe("course-schedule");
    expect(finalStep.state.kind).toBe("course-schedule");
    if (finalStep.state.kind !== "course-schedule") {
      throw new Error("Expected the course-schedule graph state.");
    }
    expect(finalStep.state.order).toEqual(["0", "1", "2", "3"]);
    expect(finalStep.state.schedulable).toBe(true);
    expect(
      run.trace.steps.some((step) => getTraceStepPaths(step).includes("state.order"))
    ).toBe(true);
  });

  it("builds rotting-oranges replay runs from the shared graph engine", () => {
    const run = buildRun(
      "rotting-oranges",
      JSON.stringify(
        {
          grid: [
            [2, 1, 1],
            [1, 1, 0],
            [0, 1, 1]
          ]
        },
        null,
        2
      )
    );

    if (run.algorithm.domain !== "graph") {
      throw new Error("Expected a graph run.");
    }

    const finalStep = run.trace.steps[run.trace.steps.length - 1]!;

    expect(run.algorithm.id).toBe("rotting-oranges");
    expect(finalStep.state.kind).toBe("rotting-oranges");
    if (finalStep.state.kind !== "rotting-oranges") {
      throw new Error("Expected the rotting-oranges graph state.");
    }
    expect(finalStep.state.rottable).toBe(true);
    expect(finalStep.state.minutesToRotAll).toBe(4);
    expect(
      run.trace.steps.some((step) =>
        getTraceStepPaths(step).some((path) => path.startsWith("state.grid"))
      )
    ).toBe(true);
  });

  it("builds number-of-islands replay runs from the shared graph engine", () => {
    const run = buildRun(
      "number-of-islands",
      JSON.stringify(
        {
          grid: [
            ["1", "1", "0", "0", "0"],
            ["1", "1", "0", "0", "0"],
            ["0", "0", "1", "0", "0"],
            ["0", "0", "0", "1", "1"]
          ]
        },
        null,
        2
      )
    );

    if (run.algorithm.domain !== "graph") {
      throw new Error("Expected a graph run.");
    }

    const finalStep = run.trace.steps[run.trace.steps.length - 1]!;

    expect(run.algorithm.id).toBe("number-of-islands");
    expect(finalStep.state.kind).toBe("number-of-islands");
    if (finalStep.state.kind !== "number-of-islands") {
      throw new Error("Expected the number-of-islands graph state.");
    }
    expect(finalStep.state.islandCount).toBe(3);
    expect(finalStep.state.remainingLand).toEqual([]);
    expect(
      run.trace.steps.some((step) => getTraceStepPaths(step).includes("state.islandCount"))
    ).toBe(true);
  });

  it("builds walls-and-gates replay runs from the shared graph engine", () => {
    const run = buildRun(
      "walls-and-gates",
      JSON.stringify(
        {
          grid: [
            [2147483647, -1, 0, 2147483647],
            [2147483647, 2147483647, 2147483647, -1],
            [2147483647, -1, 2147483647, -1],
            [0, -1, 2147483647, 2147483647]
          ]
        },
        null,
        2
      )
    );

    if (run.algorithm.domain !== "graph") {
      throw new Error("Expected a graph run.");
    }

    const finalStep = run.trace.steps[run.trace.steps.length - 1]!;

    expect(run.algorithm.id).toBe("walls-and-gates");
    expect(finalStep.state.kind).toBe("walls-and-gates");
    if (finalStep.state.kind !== "walls-and-gates") {
      throw new Error("Expected the walls-and-gates graph state.");
    }
    expect(finalStep.state.fullyReachable).toBe(true);
    expect(finalStep.state.maxDistance).toBe(4);
    expect(finalStep.state.unreachableRooms).toEqual([]);
    expect(
      run.trace.steps.some((step) =>
        getTraceStepPaths(step).some((path) => path.startsWith("state.grid"))
      )
    ).toBe(true);
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

  it("builds two-pointer replay runs from the shared two-pointer engine", () => {
    const run = buildRun(
      "container-with-most-water",
      JSON.stringify(
        {
          heights: [1, 8, 6, 2, 5, 4, 8, 3, 7]
        },
        null,
        2
      )
    );

    if (run.algorithm.domain !== "two-pointers") {
      throw new Error("Expected a two-pointer run.");
    }

    const twoPointersRun = run as TwoPointersRun;
    const finalStep = twoPointersRun.trace.steps[twoPointersRun.trace.steps.length - 1]!;

    expect(twoPointersRun.algorithm.id).toBe("container-with-most-water");
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.bestArea).toBe(49);
    expect(finalStep.state.bestLeft).toBe(1);
    expect(finalStep.state.bestRight).toBe(8);
    expect(
      twoPointersRun.trace.steps.some((step) => getTraceStepPaths(step).includes("state.bestArea"))
    ).toBe(true);
  });

  it("builds rainwater replay runs from the shared two-pointer engine", () => {
    const run = buildRun(
      "trapping-rain-water",
      JSON.stringify(
        {
          heights: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
        },
        null,
        2
      )
    );

    if (run.algorithm.domain !== "two-pointers") {
      throw new Error("Expected a two-pointer run.");
    }

    const twoPointersRun = run as TwoPointersRun;
    const finalStep = twoPointersRun.trace.steps[twoPointersRun.trace.steps.length - 1]!;

    expect(twoPointersRun.algorithm.id).toBe("trapping-rain-water");
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.kind).toBe("trapping-rain-water");
    if (finalStep.state.kind !== "trapping-rain-water") {
      throw new Error("Expected the rainwater state.");
    }
    expect(finalStep.state.totalWater).toBe(6);
    expect(finalStep.state.waterByIndex[5]).toBe(2);
    expect(
      twoPointersRun.trace.steps.some((step) => getTraceStepPaths(step).includes("state.totalWater"))
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

  it("builds hash replay runs from the shared hash engine", () => {
    const run = buildRun(
      "two-sum",
      JSON.stringify(
        {
          array: [2, 7, 11, 15],
          target: 9
        },
        null,
        2
      )
    );

    if (run.algorithm.domain !== "hash") {
      throw new Error("Expected a hash run.");
    }

    const hashRun = run as HashRun;
    const finalStep = hashRun.trace.steps[hashRun.trace.steps.length - 1]!;

    expect(hashRun.algorithm.id).toBe("two-sum");
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.matchedPairIndices).toEqual([0, 1]);
    expect(finalStep.state.matchedPairValues).toEqual([2, 7]);
    expect(finalStep.highlights.map((highlight) => highlight.path)).toContain(
      "state.matchedPairIndices"
    );
  });

  it("builds heap replay runs from the shared heap engine", () => {
    const run = buildRun(
      "kth-largest-element-in-an-array",
      JSON.stringify(
        {
          array: [3, 2, 1, 5, 6, 4],
          k: 2
        },
        null,
        2
      )
    );

    if (run.algorithm.domain !== "heap") {
      throw new Error("Expected a heap run.");
    }

    const heapRun = run as HeapRun;
    const finalStep = heapRun.trace.steps[heapRun.trace.steps.length - 1]!;

    expect(heapRun.algorithm.id).toBe("kth-largest-element-in-an-array");
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.result).toBe(5);
    expect(finalStep.state.rankedEntries.map((entry) => entry.value)).toEqual([6, 5]);
    expect(finalStep.highlights.map((highlight) => highlight.path)).toContain("state.result");
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

  it("builds daily-temperatures replay runs from the shared stack engine", () => {
    const run = buildRun(
      "daily-temperatures",
      JSON.stringify(
        {
          temperatures: [73, 74, 75, 71, 69, 72, 76, 73]
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

    expect(stackRun.algorithm.id).toBe("daily-temperatures");
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.kind).toBe("daily-temperatures");
    if (finalStep.state.kind !== "daily-temperatures") {
      throw new Error("Expected the daily-temperatures stack state.");
    }
    expect(finalStep.state.resolvedWaits).toEqual([1, 1, 4, 2, 1, 1, 0, 0]);
    expect(finalStep.state.stackIndices).toEqual([6, 7]);
  });

  it("builds histogram replay runs from the shared stack engine", () => {
    const run = buildRun(
      "largest-rectangle-in-histogram",
      JSON.stringify(
        {
          heights: [2, 1, 5, 6, 2, 3]
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

    expect(stackRun.algorithm.id).toBe("largest-rectangle-in-histogram");
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.kind).toBe("largest-rectangle-in-histogram");
    if (finalStep.state.kind !== "largest-rectangle-in-histogram") {
      throw new Error("Expected the histogram stack state.");
    }
    expect(finalStep.state.bestArea).toBe(10);
    expect(finalStep.state.bestStart).toBe(2);
    expect(finalStep.state.bestEnd).toBe(3);
  });

  it("builds min-stack replay runs from the shared stack engine", () => {
    const run = buildRun(
      "min-stack",
      JSON.stringify(
        {
          operations: [
            { type: "push", value: -2 },
            { type: "push", value: 0 },
            { type: "push", value: -3 },
            { type: "getMin" },
            { type: "pop" },
            { type: "top" },
            { type: "getMin" }
          ]
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

    expect(stackRun.algorithm.id).toBe("min-stack");
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.kind).toBe("min-stack");
    if (finalStep.state.kind !== "min-stack") {
      throw new Error("Expected the min-stack state.");
    }
    expect(finalStep.state.currentMinimum).toBe(-2);
    expect(finalStep.state.stackValues).toEqual([-2, 0]);
    expect(finalStep.state.minimumValues).toEqual([-2, -2]);
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
