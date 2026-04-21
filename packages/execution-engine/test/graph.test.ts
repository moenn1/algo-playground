import { describe, expect, it } from "vitest";

import {
  buildBreadthFirstSearchTrace,
  buildCourseScheduleTrace,
  buildDepthFirstSearchTrace,
  buildDijkstraTrace,
  buildGraphValidTreeTrace,
  buildNumberOfIslandsTrace,
  buildRottingOrangesTrace,
  buildWallsAndGatesTrace,
  defaultBreadthFirstSearchInput,
  defaultCourseScheduleInput,
  defaultGraphValidTreeInput,
  defaultNumberOfIslandsInput,
  defaultRottingOrangesInput,
  defaultWallsAndGatesInput,
  formatGraphDistance,
  parseGraphInputText,
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

  it("keeps BFS and DFS replay semantics distinct on the same graph", () => {
    const graph = {
      nodes: ["A", "B", "C", "D", "E"],
      edges: [
        ["A", "B", 1],
        ["A", "C", 1],
        ["B", "D", 1],
        ["D", "E", 1],
        ["C", "E", 1]
      ] as Array<[string, string, number]>,
      start: "A",
      target: "E",
      directed: false
    };

    const bfsTrace = buildBreadthFirstSearchTrace(graph);
    const dfsTrace = buildDepthFirstSearchTrace(graph);
    const bfsFinalStep = bfsTrace.steps[bfsTrace.steps.length - 1]!;
    const dfsFinalStep = dfsTrace.steps[dfsTrace.steps.length - 1]!;

    expect(bfsFinalStep.state.path).toEqual(["A", "C", "E"]);
    expect(dfsFinalStep.state.path).toEqual(["A", "B", "D", "E"]);
    expect(bfsFinalStep.state.distances.E).toBe(2);
    expect(dfsFinalStep.state.distances.E).toBe(3);
  });

  it("emits deterministic step keys and graph metrics for repeated BFS runs", () => {
    const firstTrace = buildBreadthFirstSearchTrace(defaultBreadthFirstSearchInput);
    const secondTrace = buildBreadthFirstSearchTrace(defaultBreadthFirstSearchInput);

    expect(firstTrace).toEqual(secondTrace);
    expect(firstTrace.summary.comparisonMetricKeys).toEqual([
      "settled",
      "inspections",
      "updates"
    ]);
    expect(firstTrace.steps[0]!.changes.map((change) => change.path)).toEqual([
      "state.activeEdge",
      "state.current",
      "state.distances.A",
      "state.distances.B",
      "state.distances.C",
      "state.distances.D",
      "state.distances.E",
      "state.distances.F",
      "state.frontier",
      "state.kind",
      "state.path",
      "state.settled"
    ]);
  });

  it("emits deterministic step keys and graph metrics for repeated DFS runs", () => {
    const firstTrace = buildDepthFirstSearchTrace(defaultBreadthFirstSearchInput);
    const secondTrace = buildDepthFirstSearchTrace(defaultBreadthFirstSearchInput);

    expect(firstTrace).toEqual(secondTrace);
    expect(firstTrace.summary.comparisonMetricKeys).toEqual([
      "settled",
      "inspections",
      "updates"
    ]);
    expect(firstTrace.steps[0]!.changes.map((change) => change.path)).toEqual([
      "state.activeEdge",
      "state.current",
      "state.distances.A",
      "state.distances.B",
      "state.distances.C",
      "state.distances.D",
      "state.distances.E",
      "state.distances.F",
      "state.frontier",
      "state.kind",
      "state.path",
      "state.settled"
    ]);
  });

  it("records deterministic union-find merges and cycle rejection for graph valid tree", () => {
    const validTrace = buildGraphValidTreeTrace(defaultGraphValidTreeInput);
    const invalidTrace = buildGraphValidTreeTrace({
      nodeCount: 5,
      edges: [
        [0, 1],
        [1, 2],
        [2, 0],
        [3, 4]
      ]
    });
    const validFinalStep = validTrace.steps[validTrace.steps.length - 1]!;
    const invalidFinalStep = invalidTrace.steps[invalidTrace.steps.length - 1]!;

    expect(validFinalStep.phase).toBe("Resolution");
    expect(validFinalStep.state.kind).toBe("graph-valid-tree");
    if (validFinalStep.state.kind !== "graph-valid-tree") {
      throw new Error("Expected the graph-valid-tree state.");
    }
    expect(validFinalStep.state.isTree).toBe(true);
    expect(validFinalStep.state.componentCount).toBe(1);
    expect(validFinalStep.state.acceptedEdges).toHaveLength(4);
    expect(validFinalStep.state.rejectedEdges).toEqual([]);

    expect(invalidFinalStep.phase).toBe("Invalid");
    expect(invalidFinalStep.state.kind).toBe("graph-valid-tree");
    if (invalidFinalStep.state.kind !== "graph-valid-tree") {
      throw new Error("Expected the graph-valid-tree state.");
    }
    expect(invalidFinalStep.state.isTree).toBe(false);
    expect(invalidFinalStep.state.rejectedEdges).toEqual(["#3 2-0"]);
    expect(invalidFinalStep.state.componentCount).toBe(2);
  });

  it("formats graph helpers for replay-safe input and distance rendering", () => {
    expect(serializeGraphInput(defaultBreadthFirstSearchInput)).toContain('"start": "A"');
    expect(serializeGraphInput(defaultGraphValidTreeInput)).toContain('"nodeCount": 5');
    expect(serializeGraphInput(defaultCourseScheduleInput)).toContain('"courseCount": 4');
    expect(serializeGraphInput(defaultRottingOrangesInput)).toContain('"grid"');
    expect(serializeGraphInput(defaultNumberOfIslandsInput)).toContain('"1"');
    expect(
      parseGraphInputText(serializeGraphInput(defaultGraphValidTreeInput), "graph-valid-tree")
    ).toEqual(defaultGraphValidTreeInput);
    expect(parseGraphInputText(serializeGraphInput(defaultCourseScheduleInput), "course-schedule")).toEqual(
      defaultCourseScheduleInput
    );
    expect(
      parseGraphInputText(serializeGraphInput(defaultRottingOrangesInput), "rotting-oranges")
    ).toEqual(defaultRottingOrangesInput);
    expect(
      parseGraphInputText(serializeGraphInput(defaultNumberOfIslandsInput), "number-of-islands")
    ).toEqual(defaultNumberOfIslandsInput);
    expect(
      parseGraphInputText(serializeGraphInput(defaultWallsAndGatesInput), "walls-and-gates")
    ).toEqual(defaultWallsAndGatesInput);
    expect(formatGraphDistance(null)).toBe("inf");
    expect(formatGraphDistance(3)).toBe("3");
  });

  it("records deterministic topological scheduling and cycle failures for Course Schedule", () => {
    const acyclicTrace = buildCourseScheduleTrace({
      courseCount: 4,
      prerequisites: [
        [1, 0],
        [2, 1],
        [3, 1]
      ]
    });
    const cyclicTrace = buildCourseScheduleTrace({
      courseCount: 2,
      prerequisites: [
        [1, 0],
        [0, 1]
      ]
    });
    const acyclicFinalStep = acyclicTrace.steps[acyclicTrace.steps.length - 1]!;
    const cyclicFinalStep = cyclicTrace.steps[cyclicTrace.steps.length - 1]!;

    expect(acyclicFinalStep.phase).toBe("Resolution");
    expect(acyclicFinalStep.state.kind).toBe("course-schedule");
    if (acyclicFinalStep.state.kind !== "course-schedule") {
      throw new Error("Expected the course-schedule state.");
    }
    expect(acyclicFinalStep.state.schedulable).toBe(true);
    expect(acyclicFinalStep.state.order).toEqual(["0", "1", "2", "3"]);

    expect(cyclicFinalStep.phase).toBe("Cycle");
    expect(cyclicFinalStep.state.kind).toBe("course-schedule");
    if (cyclicFinalStep.state.kind !== "course-schedule") {
      throw new Error("Expected the course-schedule state.");
    }
    expect(cyclicFinalStep.state.schedulable).toBe(false);
    expect(cyclicFinalStep.state.cycleNodes).toEqual(["0", "1"]);
  });

  it("records deterministic infection waves and stalled fresh cells for Rotting Oranges", () => {
    const resolvedTrace = buildRottingOrangesTrace({
      grid: [
        [2, 1, 1],
        [1, 1, 0],
        [0, 1, 1]
      ]
    });
    const stalledTrace = buildRottingOrangesTrace({
      grid: [
        [2, 1, 1],
        [0, 1, 1],
        [1, 0, 1]
      ]
    });
    const resolvedFinalStep = resolvedTrace.steps[resolvedTrace.steps.length - 1]!;
    const stalledFinalStep = stalledTrace.steps[stalledTrace.steps.length - 1]!;

    expect(resolvedFinalStep.phase).toBe("Resolution");
    expect(resolvedFinalStep.state.kind).toBe("rotting-oranges");
    if (resolvedFinalStep.state.kind !== "rotting-oranges") {
      throw new Error("Expected the rotting-oranges state.");
    }
    expect(resolvedFinalStep.state.rottable).toBe(true);
    expect(resolvedFinalStep.state.minutesToRotAll).toBe(4);
    expect(resolvedFinalStep.state.fresh).toEqual([]);

    expect(stalledFinalStep.phase).toBe("Stalled");
    expect(stalledFinalStep.state.kind).toBe("rotting-oranges");
    if (stalledFinalStep.state.kind !== "rotting-oranges") {
      throw new Error("Expected the rotting-oranges state.");
    }
    expect(stalledFinalStep.state.rottable).toBe(false);
    expect(stalledFinalStep.state.stalledFresh).toEqual(["2,0"]);
  });

  it("records deterministic connected components for Number of Islands", () => {
    const referenceTrace = buildNumberOfIslandsTrace({
      grid: [
        ["1", "1", "0", "0", "0"],
        ["1", "1", "0", "0", "0"],
        ["0", "0", "1", "0", "0"],
        ["0", "0", "0", "1", "1"]
      ]
    });
    const diagonalTrace = buildNumberOfIslandsTrace({
      grid: [
        ["1", "0", "1"],
        ["0", "1", "0"],
        ["1", "0", "1"]
      ]
    });
    const referenceFinalStep = referenceTrace.steps[referenceTrace.steps.length - 1]!;
    const diagonalFinalStep = diagonalTrace.steps[diagonalTrace.steps.length - 1]!;

    expect(referenceFinalStep.phase).toBe("Resolution");
    expect(referenceFinalStep.state.kind).toBe("number-of-islands");
    if (referenceFinalStep.state.kind !== "number-of-islands") {
      throw new Error("Expected the number-of-islands state.");
    }
    expect(referenceFinalStep.state.islandCount).toBe(3);
    expect(referenceFinalStep.state.completedIslands).toHaveLength(3);
    expect(referenceFinalStep.state.remainingLand).toEqual([]);

    expect(diagonalFinalStep.phase).toBe("Resolution");
    expect(diagonalFinalStep.state.kind).toBe("number-of-islands");
    if (diagonalFinalStep.state.kind !== "number-of-islands") {
      throw new Error("Expected the number-of-islands state.");
    }
    expect(diagonalFinalStep.state.islandCount).toBe(5);
    expect(diagonalFinalStep.state.completedIslands).toHaveLength(5);
    expect(diagonalFinalStep.state.cellIslands["1,1"]).toBe(3);
  });

  it("records deterministic room fills and blocked rooms for Walls and Gates", () => {
    const resolvedTrace = buildWallsAndGatesTrace({
      grid: [
        [2147483647, -1, 0, 2147483647],
        [2147483647, 2147483647, 2147483647, -1],
        [2147483647, -1, 2147483647, -1],
        [0, -1, 2147483647, 2147483647]
      ]
    });
    const stalledTrace = buildWallsAndGatesTrace({
      grid: [
        [2147483647, -1, 0, 2147483647],
        [2147483647, -1, 2147483647, -1],
        [2147483647, -1, -1, -1],
        [0, -1, 2147483647, 2147483647]
      ]
    });
    const resolvedFinalStep = resolvedTrace.steps[resolvedTrace.steps.length - 1]!;
    const stalledFinalStep = stalledTrace.steps[stalledTrace.steps.length - 1]!;

    expect(resolvedFinalStep.phase).toBe("Resolution");
    expect(resolvedFinalStep.state.kind).toBe("walls-and-gates");
    if (resolvedFinalStep.state.kind !== "walls-and-gates") {
      throw new Error("Expected the walls-and-gates state.");
    }
    expect(resolvedFinalStep.state.fullyReachable).toBe(true);
    expect(resolvedFinalStep.state.maxDistance).toBe(4);
    expect(resolvedFinalStep.state.unreachableRooms).toEqual([]);

    expect(stalledFinalStep.phase).toBe("Stalled");
    expect(stalledFinalStep.state.kind).toBe("walls-and-gates");
    if (stalledFinalStep.state.kind !== "walls-and-gates") {
      throw new Error("Expected the walls-and-gates state.");
    }
    expect(stalledFinalStep.state.fullyReachable).toBe(false);
    expect(stalledFinalStep.state.unreachableRooms).toEqual(["3,2", "3,3"]);
    expect(stalledFinalStep.state.grid[0]![0]).toBe(3);
  });
});
