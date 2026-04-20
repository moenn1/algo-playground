import { describe, expect, it } from "vitest";

import { buildRun, getTraceStepPaths } from "./replay.js";

describe("buildRun", () => {
  it("emits schema-compliant sorting traces for bubble sort", () => {
    const run = buildRun("bubble-sort", "5, 1, 4, 2");

    if (run.algorithm.domain !== "sorting") {
      throw new Error("Expected a sorting run.");
    }

    const finalStep = run.trace.steps[run.trace.steps.length - 1]!;

    expect(finalStep.state.array).toEqual([1, 2, 4, 5]);
    expect(finalStep.explanation.summary.length).toBeGreaterThan(0);
    expect(finalStep.highlights.length).toBeGreaterThan(0);
    expect(getTraceStepPaths(finalStep)).toContain("state.sortedIndices");
  });

  it("builds a BFS replay trace with hop-based path recovery", () => {
    const run = buildRun(
      "bfs",
      JSON.stringify(
        {
          nodes: ["A", "B", "C", "D"],
          edges: [
            ["A", "B", 1],
            ["B", "D", 1],
            ["A", "C", 5],
            ["C", "D", 1],
            ["A", "D", 9]
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
    expect(finalStep.state.path).toEqual(["A", "D"]);
    expect(finalStep.state.distances.D).toBe(1);
    expect(getTraceStepPaths(finalStep)).toContain("state.path");
  });

  it("builds a Dijkstra replay trace with weighted shortest-path recovery", () => {
    const run = buildRun(
      "dijkstra",
      JSON.stringify(
        {
          nodes: ["A", "B", "C", "D"],
          edges: [
            ["A", "B", 1],
            ["B", "D", 1],
            ["A", "C", 5],
            ["C", "D", 1],
            ["A", "D", 9]
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

    expect(run.algorithm.id).toBe("dijkstra");
    expect(finalStep.state.path).toEqual(["A", "B", "D"]);
    expect(finalStep.state.distances.D).toBe(2);
  });
});
