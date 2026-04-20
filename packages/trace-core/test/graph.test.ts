import { describe, expect, it } from "vitest";

import {
  buildBreadthFirstSearchTrace,
  buildDijkstraTrace,
  defaultBreadthFirstSearchInput,
  formatGraphDistance,
  serializeGraphInput
} from "../src/index.js";

describe("graph execution engine", () => {
  it("keeps BFS and Dijkstra replay semantics distinct on the same graph", () => {
    const graph = {
      nodes: ["A", "B", "C", "D"],
      edges: [
        ["A", "B", 1],
        ["B", "D", 1],
        ["A", "C", 4],
        ["C", "D", 1],
        ["A", "D", 9]
      ] as Array<[string, string, number]>,
      start: "A",
      target: "D",
      directed: false
    };

    const bfsTrace = buildBreadthFirstSearchTrace(graph);
    const dijkstraTrace = buildDijkstraTrace(graph);
    const bfsFinalStep = bfsTrace.steps[bfsTrace.steps.length - 1]!;
    const dijkstraFinalStep = dijkstraTrace.steps[dijkstraTrace.steps.length - 1]!;

    expect(bfsFinalStep.state.path).toEqual(["A", "D"]);
    expect(dijkstraFinalStep.state.path).toEqual(["A", "B", "D"]);
    expect(bfsFinalStep.state.distances.D).toBe(1);
    expect(dijkstraFinalStep.state.distances.D).toBe(2);
  });

  it("emits deterministic step keys and metric summaries for repeated BFS runs", () => {
    const firstTrace = buildBreadthFirstSearchTrace(defaultBreadthFirstSearchInput);
    const secondTrace = buildBreadthFirstSearchTrace(defaultBreadthFirstSearchInput);

    expect(firstTrace).toEqual(secondTrace);
    expect(firstTrace.summary.comparisonMetricKeys).toEqual([
      "visited",
      "inspections",
      "updates"
    ]);
    expect(firstTrace.steps[0]!.changes.map((change) => change.path)).toEqual([
      "state.frontier",
      "state.distances"
    ]);
  });

  it("formats graph helpers for replay-safe input and distance rendering", () => {
    expect(serializeGraphInput(defaultBreadthFirstSearchInput)).toContain('"start": "A"');
    expect(formatGraphDistance(null)).toBe("inf");
    expect(formatGraphDistance(3)).toBe("3");
  });
});
