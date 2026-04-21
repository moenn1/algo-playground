import { describe, expect, it } from "vitest";

import {
  buildBreadthFirstSearchTrace,
  buildCourseScheduleTrace,
  buildDijkstraTrace,
  buildRottingOrangesTrace,
  defaultBreadthFirstSearchInput,
  defaultCourseScheduleInput,
  defaultRottingOrangesInput,
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

  it("formats graph helpers for replay-safe input and distance rendering", () => {
    expect(serializeGraphInput(defaultBreadthFirstSearchInput)).toContain('"start": "A"');
    expect(serializeGraphInput(defaultCourseScheduleInput)).toContain('"courseCount": 4');
    expect(serializeGraphInput(defaultRottingOrangesInput)).toContain('"grid"');
    expect(parseGraphInputText(serializeGraphInput(defaultCourseScheduleInput), "course-schedule")).toEqual(
      defaultCourseScheduleInput
    );
    expect(
      parseGraphInputText(serializeGraphInput(defaultRottingOrangesInput), "rotting-oranges")
    ).toEqual(defaultRottingOrangesInput);
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
});
