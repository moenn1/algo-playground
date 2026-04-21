import { describe, expect, it } from "vitest";

import {
  buildBreadthFirstSearchTrace,
  buildCloneGraphTrace,
  buildCountConnectedComponentsTrace,
  buildCourseScheduleTrace,
  buildCourseScheduleIiTrace,
  buildDepthFirstSearchTrace,
  buildDijkstraTrace,
  buildNetworkDelayTimeTrace,
  buildRedundantConnectionTrace,
  buildGraphValidTreeTrace,
  buildIslandPerimeterTrace,
  buildMaxAreaOfIslandTrace,
  buildNumberOfIslandsTrace,
  buildPacificAtlanticWaterFlowTrace,
  buildRottingOrangesTrace,
  buildShortestBridgeTrace,
  buildShortestPathBinaryMatrixTrace,
  buildNearestExitFromEntranceInMazeTrace,
  buildShortestPathToGetFoodTrace,
  buildZeroOneMatrixTrace,
  buildAsFarFromLandAsPossibleTrace,
  buildMapOfHighestPeakTrace,
  buildSurroundedRegionsTrace,
  buildWallsAndGatesTrace,
  defaultBreadthFirstSearchInput,
  defaultCloneGraphInput,
  defaultCountConnectedComponentsInput,
  defaultCourseScheduleInput,
  defaultGraphValidTreeInput,
  defaultIslandPerimeterInput,
  defaultMaxAreaOfIslandInput,
  defaultNetworkDelayTimeInput,
  defaultRedundantConnectionInput,
  defaultNumberOfIslandsInput,
  defaultPacificAtlanticWaterFlowInput,
  defaultRottingOrangesInput,
  defaultShortestBridgeInput,
  defaultShortestPathBinaryMatrixInput,
  defaultNearestExitFromEntranceInMazeInput,
  defaultShortestPathToGetFoodInput,
  defaultZeroOneMatrixInput,
  defaultAsFarFromLandAsPossibleInput,
  defaultMapOfHighestPeakInput,
  defaultSurroundedRegionsInput,
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

  it("records deterministic weighted broadcast outcomes for Network Delay Time", () => {
    const firstTrace = buildNetworkDelayTimeTrace(defaultNetworkDelayTimeInput);
    const secondTrace = buildNetworkDelayTimeTrace(defaultNetworkDelayTimeInput);
    const unreachableTrace = buildNetworkDelayTimeTrace({
      nodes: ["A", "B", "C", "D", "E"],
      edges: [
        ["A", "B", 1],
        ["B", "C", 2],
        ["C", "D", 2]
      ],
      start: "A",
      target: null,
      directed: true
    });
    const referenceFinalStep = firstTrace.steps[firstTrace.steps.length - 1]!;
    const unreachableFinalStep = unreachableTrace.steps[unreachableTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(referenceFinalStep.phase).toBe("Resolution");
    expect(referenceFinalStep.state.kind).toBe("network-delay-time");
    if (referenceFinalStep.state.kind !== "network-delay-time") {
      throw new Error("Expected the network-delay-time state.");
    }
    expect(referenceFinalStep.state.allReached).toBe(true);
    expect(referenceFinalStep.state.networkDelay).toBe(7);
    expect(referenceFinalStep.state.unreachableNodes).toEqual([]);
    expect(referenceFinalStep.state.reachedNodes).toEqual(["A", "B", "C", "D", "E"]);

    expect(unreachableFinalStep.phase).toBe("Unreachable");
    expect(unreachableFinalStep.state.kind).toBe("network-delay-time");
    if (unreachableFinalStep.state.kind !== "network-delay-time") {
      throw new Error("Expected the network-delay-time state.");
    }
    expect(unreachableFinalStep.state.allReached).toBe(false);
    expect(unreachableFinalStep.state.networkDelay).toBeNull();
    expect(unreachableFinalStep.state.unreachableNodes).toEqual(["E"]);
    expect(unreachableFinalStep.state.reachedNodes).toEqual(["A", "B", "C", "D"]);
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

  it("records deterministic redundant-edge detection in input order", () => {
    const firstTrace = buildRedundantConnectionTrace(defaultRedundantConnectionInput);
    const secondTrace = buildRedundantConnectionTrace(defaultRedundantConnectionInput);
    const lateCycleTrace = buildRedundantConnectionTrace({
      nodeCount: 5,
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [0, 4]
      ]
    });
    const referenceFinalStep = firstTrace.steps[firstTrace.steps.length - 1]!;
    const lateCycleFinalStep = lateCycleTrace.steps[lateCycleTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(referenceFinalStep.phase).toBe("Resolution");
    expect(referenceFinalStep.state.kind).toBe("redundant-connection");
    if (referenceFinalStep.state.kind !== "redundant-connection") {
      throw new Error("Expected the redundant-connection state.");
    }
    expect(referenceFinalStep.state.hasRedundantConnection).toBe(true);
    expect(referenceFinalStep.state.redundantEdge).toBe("#4 1-3");
    expect(referenceFinalStep.state.rejectedEdges).toEqual(["#4 1-3"]);
    expect(referenceFinalStep.state.acceptedEdges).toEqual(["#1 0-1", "#2 1-2", "#3 2-3"]);

    expect(lateCycleFinalStep.phase).toBe("Resolution");
    expect(lateCycleFinalStep.state.kind).toBe("redundant-connection");
    if (lateCycleFinalStep.state.kind !== "redundant-connection") {
      throw new Error("Expected the redundant-connection state.");
    }
    expect(lateCycleFinalStep.state.redundantEdge).toBe("#5 0-4");
    expect(lateCycleFinalStep.state.componentCount).toBe(1);
  });

  it("records deterministic connected-component counts and same-component no-ops", () => {
    const referenceTrace = buildCountConnectedComponentsTrace(defaultCountConnectedComponentsInput);
    const cyclicTrace = buildCountConnectedComponentsTrace({
      nodeCount: 5,
      edges: [
        [0, 1],
        [1, 2],
        [2, 0],
        [3, 4]
      ]
    });
    const referenceFinalStep = referenceTrace.steps[referenceTrace.steps.length - 1]!;
    const cyclicFinalStep = cyclicTrace.steps[cyclicTrace.steps.length - 1]!;

    expect(referenceFinalStep.phase).toBe("Resolution");
    expect(referenceFinalStep.state.kind).toBe("count-connected-components");
    if (referenceFinalStep.state.kind !== "count-connected-components") {
      throw new Error("Expected the count-connected-components state.");
    }
    expect(referenceFinalStep.state.componentCount).toBe(3);
    expect(referenceFinalStep.state.acceptedEdges).toEqual(["#1 0-1", "#2 1-2", "#3 3-4"]);
    expect(referenceFinalStep.state.rejectedEdges).toEqual([]);

    expect(cyclicFinalStep.phase).toBe("Resolution");
    expect(cyclicFinalStep.state.kind).toBe("count-connected-components");
    if (cyclicFinalStep.state.kind !== "count-connected-components") {
      throw new Error("Expected the count-connected-components state.");
    }
    expect(cyclicFinalStep.state.componentCount).toBe(2);
    expect(cyclicFinalStep.state.rejectedEdges).toEqual(["#3 2-0"]);
    expect(cyclicFinalStep.state.acceptedEdges).toEqual(["#1 0-1", "#2 1-2", "#4 3-4"]);
  });

  it("records clone-ledger progress and unreachable nodes for Clone Graph", () => {
    const referenceTrace = buildCloneGraphTrace(defaultCloneGraphInput);
    const disconnectedTrace = buildCloneGraphTrace({
      nodes: ["A", "B", "C", "D", "E", "F"],
      edges: [
        ["A", "B", 1],
        ["A", "C", 1],
        ["B", "D", 1],
        ["C", "D", 1],
        ["E", "F", 1]
      ],
      start: "A",
      target: null,
      directed: false
    });
    const referenceFinalStep = referenceTrace.steps[referenceTrace.steps.length - 1]!;
    const disconnectedFinalStep = disconnectedTrace.steps[disconnectedTrace.steps.length - 1]!;

    expect(referenceFinalStep.phase).toBe("Resolution");
    expect(referenceFinalStep.state.kind).toBe("clone-graph");
    if (referenceFinalStep.state.kind !== "clone-graph") {
      throw new Error("Expected the clone-graph state.");
    }
    expect(referenceFinalStep.state.fullyCloned).toBe(true);
    expect(referenceFinalStep.state.clonedNodes).toEqual(["A", "B", "C", "D", "E"]);
    expect(referenceFinalStep.state.unreachableNodes).toEqual([]);
    expect(referenceFinalStep.state.cloneMap).toMatchObject({
      A: "A'",
      B: "B'",
      C: "C'",
      D: "D'",
      E: "E'"
    });

    expect(disconnectedFinalStep.phase).toBe("Resolution");
    expect(disconnectedFinalStep.state.kind).toBe("clone-graph");
    if (disconnectedFinalStep.state.kind !== "clone-graph") {
      throw new Error("Expected the clone-graph state.");
    }
    expect(disconnectedFinalStep.state.fullyCloned).toBe(false);
    expect(disconnectedFinalStep.state.unreachableNodes).toEqual(["E", "F"]);
    expect(disconnectedFinalStep.state.clonedNodes).toEqual(["A", "B", "C", "D"]);
  });

  it("formats graph helpers for replay-safe input and distance rendering", () => {
    expect(serializeGraphInput(defaultBreadthFirstSearchInput)).toContain('"start": "A"');
    expect(serializeGraphInput(defaultCloneGraphInput)).toContain('"target": null');
    expect(serializeGraphInput(defaultGraphValidTreeInput)).toContain('"nodeCount": 5');
    expect(serializeGraphInput(defaultCourseScheduleInput)).toContain('"courseCount": 4');
    expect(serializeGraphInput(defaultRottingOrangesInput)).toContain('"grid"');
    expect(serializeGraphInput(defaultNumberOfIslandsInput)).toContain('"1"');
    expect(serializeGraphInput(defaultMaxAreaOfIslandInput)).toContain('"1"');
    expect(serializeGraphInput(defaultIslandPerimeterInput)).toContain('"1"');
    expect(
      parseGraphInputText(serializeGraphInput(defaultGraphValidTreeInput), "graph-valid-tree")
    ).toEqual(defaultGraphValidTreeInput);
    expect(
      parseGraphInputText(
        serializeGraphInput(defaultCountConnectedComponentsInput),
        "count-connected-components"
      )
    ).toEqual(defaultCountConnectedComponentsInput);
    expect(
      parseGraphInputText(
        serializeGraphInput(defaultRedundantConnectionInput),
        "redundant-connection"
      )
    ).toEqual(defaultRedundantConnectionInput);
    expect(parseGraphInputText(serializeGraphInput(defaultCourseScheduleInput), "course-schedule")).toEqual(
      defaultCourseScheduleInput
    );
    expect(
      parseGraphInputText(serializeGraphInput(defaultCourseScheduleInput), "course-schedule-ii")
    ).toEqual(defaultCourseScheduleInput);
    expect(parseGraphInputText(serializeGraphInput(defaultCloneGraphInput), "clone-graph")).toEqual(
      defaultCloneGraphInput
    );
    expect(
      parseGraphInputText(
        serializeGraphInput(defaultNetworkDelayTimeInput),
        "network-delay-time"
      )
    ).toEqual(defaultNetworkDelayTimeInput);
    expect(
      parseGraphInputText(serializeGraphInput(defaultRottingOrangesInput), "rotting-oranges")
    ).toEqual(defaultRottingOrangesInput);
    expect(
      parseGraphInputText(serializeGraphInput(defaultNumberOfIslandsInput), "number-of-islands")
    ).toEqual(defaultNumberOfIslandsInput);
    expect(
      parseGraphInputText(serializeGraphInput(defaultMaxAreaOfIslandInput), "max-area-of-island")
    ).toEqual(defaultMaxAreaOfIslandInput);
    expect(
      parseGraphInputText(serializeGraphInput(defaultIslandPerimeterInput), "island-perimeter")
    ).toEqual(defaultIslandPerimeterInput);
    expect(
      parseGraphInputText(
        serializeGraphInput(defaultPacificAtlanticWaterFlowInput),
        "pacific-atlantic-water-flow"
      )
    ).toEqual(defaultPacificAtlanticWaterFlowInput);
    expect(
      parseGraphInputText(serializeGraphInput(defaultShortestBridgeInput), "shortest-bridge")
    ).toEqual(defaultShortestBridgeInput);
    expect(
      parseGraphInputText(
        serializeGraphInput(defaultShortestPathBinaryMatrixInput),
        "shortest-path-binary-matrix"
      )
    ).toEqual(defaultShortestPathBinaryMatrixInput);
    expect(parseGraphInputText(serializeGraphInput(defaultZeroOneMatrixInput), "01-matrix")).toEqual(
      defaultZeroOneMatrixInput
    );
    expect(
      parseGraphInputText(
        serializeGraphInput(defaultAsFarFromLandAsPossibleInput),
        "as-far-from-land-as-possible"
      )
    ).toEqual(defaultAsFarFromLandAsPossibleInput);
    expect(
      parseGraphInputText(
        serializeGraphInput(defaultMapOfHighestPeakInput),
        "map-of-highest-peak"
      )
    ).toEqual(defaultMapOfHighestPeakInput);
    expect(
      parseGraphInputText(
        serializeGraphInput(defaultSurroundedRegionsInput),
        "surrounded-regions"
      )
    ).toEqual(defaultSurroundedRegionsInput);
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

  it("reuses deterministic scheduling state for Course Schedule II while publishing its own algorithm id", () => {
    const orderTrace = buildCourseScheduleIiTrace({
      courseCount: 4,
      prerequisites: [
        [1, 0],
        [2, 0],
        [3, 1],
        [3, 2]
      ]
    });
    const blockedTrace = buildCourseScheduleIiTrace({
      courseCount: 3,
      prerequisites: [
        [1, 0],
        [2, 1],
        [0, 2]
      ]
    });
    const orderFinalStep = orderTrace.steps[orderTrace.steps.length - 1]!;
    const blockedFinalStep = blockedTrace.steps[blockedTrace.steps.length - 1]!;

    expect(orderTrace.algorithm.id).toBe("course-schedule-ii");
    expect(orderFinalStep.phase).toBe("Resolution");
    expect(orderFinalStep.state.kind).toBe("course-schedule");
    if (orderFinalStep.state.kind !== "course-schedule") {
      throw new Error("Expected the course-schedule state.");
    }
    expect(orderFinalStep.state.schedulable).toBe(true);
    expect(orderFinalStep.state.order).toEqual(["0", "1", "2", "3"]);

    expect(blockedTrace.algorithm.id).toBe("course-schedule-ii");
    expect(blockedFinalStep.phase).toBe("Cycle");
    expect(blockedFinalStep.state.kind).toBe("course-schedule");
    if (blockedFinalStep.state.kind !== "course-schedule") {
      throw new Error("Expected the course-schedule state.");
    }
    expect(blockedFinalStep.state.schedulable).toBe(false);
    expect(blockedFinalStep.state.order).toEqual([]);
    expect(blockedFinalStep.state.cycleNodes).toEqual(["0", "1", "2"]);
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

  it("records deterministic largest-island ledgers for Max Area of Island", () => {
    const firstTrace = buildMaxAreaOfIslandTrace(defaultMaxAreaOfIslandInput);
    const secondTrace = buildMaxAreaOfIslandTrace(defaultMaxAreaOfIslandInput);
    const diagonalTrace = buildMaxAreaOfIslandTrace({
      grid: [
        ["1", "0", "1"],
        ["0", "1", "0"],
        ["1", "0", "1"]
      ]
    });
    const referenceFinalStep = firstTrace.steps[firstTrace.steps.length - 1]!;
    const diagonalFinalStep = diagonalTrace.steps[diagonalTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(referenceFinalStep.phase).toBe("Resolution");
    expect(referenceFinalStep.state.kind).toBe("max-area-of-island");
    if (referenceFinalStep.state.kind !== "max-area-of-island") {
      throw new Error("Expected the max-area-of-island state.");
    }
    expect(referenceFinalStep.state.maxArea).toBe(5);
    expect(referenceFinalStep.state.completedAreas).toEqual([5, 4]);
    expect(referenceFinalStep.state.largestIslandId).toBe(1);
    expect(referenceFinalStep.state.remainingLand).toEqual([]);

    expect(diagonalFinalStep.phase).toBe("Resolution");
    expect(diagonalFinalStep.state.kind).toBe("max-area-of-island");
    if (diagonalFinalStep.state.kind !== "max-area-of-island") {
      throw new Error("Expected the max-area-of-island state.");
    }
    expect(diagonalFinalStep.state.maxArea).toBe(1);
    expect(diagonalFinalStep.state.completedAreas).toEqual([1, 1, 1, 1, 1]);
    expect(diagonalFinalStep.state.largestIslandId).toBe(1);
  });

  it("records deterministic coastline ledgers for Island Perimeter", () => {
    const firstTrace = buildIslandPerimeterTrace(defaultIslandPerimeterInput);
    const secondTrace = buildIslandPerimeterTrace(defaultIslandPerimeterInput);
    const singleCellTrace = buildIslandPerimeterTrace({
      grid: [["1"]]
    });
    const referenceFinalStep = firstTrace.steps[firstTrace.steps.length - 1]!;
    const singleCellFinalStep = singleCellTrace.steps[singleCellTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(referenceFinalStep.phase).toBe("Resolution");
    expect(referenceFinalStep.state.kind).toBe("island-perimeter");
    if (referenceFinalStep.state.kind !== "island-perimeter") {
      throw new Error("Expected the island-perimeter state.");
    }
    expect(referenceFinalStep.state.perimeter).toBe(16);
    expect(referenceFinalStep.state.exposedEdges).toHaveLength(16);
    expect(referenceFinalStep.state.remainingLand).toEqual([]);

    expect(singleCellFinalStep.phase).toBe("Resolution");
    expect(singleCellFinalStep.state.kind).toBe("island-perimeter");
    if (singleCellFinalStep.state.kind !== "island-perimeter") {
      throw new Error("Expected the island-perimeter state.");
    }
    expect(singleCellFinalStep.state.perimeter).toBe(4);
    expect(singleCellFinalStep.state.exposedEdges).toHaveLength(4);
  });

  it("records deterministic safe-region discovery and enclosed captures for Surrounded Regions", () => {
    const firstTrace = buildSurroundedRegionsTrace(defaultSurroundedRegionsInput);
    const secondTrace = buildSurroundedRegionsTrace(defaultSurroundedRegionsInput);
    const borderSafeTrace = buildSurroundedRegionsTrace({
      grid: [
        ["O", "O", "X", "X"],
        ["X", "O", "X", "O"],
        ["X", "O", "O", "O"],
        ["X", "X", "X", "O"]
      ]
    });
    const referenceFinalStep = firstTrace.steps[firstTrace.steps.length - 1]!;
    const borderSafeFinalStep = borderSafeTrace.steps[borderSafeTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(referenceFinalStep.phase).toBe("Resolution");
    expect(referenceFinalStep.state.kind).toBe("surrounded-regions");
    if (referenceFinalStep.state.kind !== "surrounded-regions") {
      throw new Error("Expected the surrounded-regions state.");
    }
    expect(referenceFinalStep.state.safeCells).toEqual(["3,1"]);
    expect(referenceFinalStep.state.capturedCells).toEqual(["1,1", "1,2", "2,2"]);
    expect(referenceFinalStep.state.capturedAny).toBe(true);
    expect(referenceFinalStep.state.remainingOpen).toEqual([]);
    expect(referenceFinalStep.state.grid).toEqual([
      ["X", "X", "X", "X"],
      ["X", "X", "X", "X"],
      ["X", "X", "X", "X"],
      ["X", "O", "X", "X"]
    ]);

    expect(borderSafeFinalStep.phase).toBe("Resolution");
    expect(borderSafeFinalStep.state.kind).toBe("surrounded-regions");
    if (borderSafeFinalStep.state.kind !== "surrounded-regions") {
      throw new Error("Expected the surrounded-regions state.");
    }
    expect(borderSafeFinalStep.state.capturedAny).toBe(false);
    expect(borderSafeFinalStep.state.capturedCells).toEqual([]);
    expect(borderSafeFinalStep.state.remainingOpen).toEqual([]);
    expect(borderSafeFinalStep.state.grid).toEqual([
      ["O", "O", "X", "X"],
      ["X", "O", "X", "O"],
      ["X", "O", "O", "O"],
      ["X", "X", "X", "O"]
    ]);
  });

  it("records deterministic dual-ocean reachability for Pacific Atlantic Water Flow", () => {
    const firstTrace = buildPacificAtlanticWaterFlowTrace(defaultPacificAtlanticWaterFlowInput);
    const secondTrace = buildPacificAtlanticWaterFlowTrace(defaultPacificAtlanticWaterFlowInput);
    const interiorSinkTrace = buildPacificAtlanticWaterFlowTrace({
      grid: [
        [10, 10, 10],
        [10, 1, 10],
        [10, 10, 10]
      ]
    });
    const referenceFinalStep = firstTrace.steps[firstTrace.steps.length - 1]!;
    const interiorSinkFinalStep = interiorSinkTrace.steps[interiorSinkTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(referenceFinalStep.phase).toBe("Resolution");
    expect(referenceFinalStep.state.kind).toBe("pacific-atlantic-water-flow");
    if (referenceFinalStep.state.kind !== "pacific-atlantic-water-flow") {
      throw new Error("Expected the pacific-atlantic-water-flow state.");
    }
    expect(referenceFinalStep.state.phaseMode).toBe("resolved");
    expect(referenceFinalStep.state.dualReachable).toEqual([
      "0,4",
      "1,3",
      "1,4",
      "2,2",
      "3,0",
      "3,1",
      "4,0"
    ]);
    expect(referenceFinalStep.state.pacificSeeds).toEqual([
      "0,0",
      "0,1",
      "0,2",
      "0,3",
      "0,4",
      "1,0",
      "2,0",
      "3,0",
      "4,0"
    ]);

    expect(interiorSinkFinalStep.phase).toBe("Resolution");
    expect(interiorSinkFinalStep.state.kind).toBe("pacific-atlantic-water-flow");
    if (interiorSinkFinalStep.state.kind !== "pacific-atlantic-water-flow") {
      throw new Error("Expected the pacific-atlantic-water-flow state.");
    }
    expect(interiorSinkFinalStep.state.dualReachable).toEqual([
      "0,0",
      "0,1",
      "0,2",
      "1,0",
      "1,2",
      "2,0",
      "2,1",
      "2,2"
    ]);
    expect(interiorSinkFinalStep.state.pacificReachable).not.toContain("1,1");
    expect(interiorSinkFinalStep.state.atlanticReachable).not.toContain("1,1");
  });

  it("records deterministic island marking and bridge expansion for Shortest Bridge", () => {
    const firstTrace = buildShortestBridgeTrace(defaultShortestBridgeInput);
    const secondTrace = buildShortestBridgeTrace(defaultShortestBridgeInput);
    const singleGapTrace = buildShortestBridgeTrace({
      grid: [
        [1, 1, 0],
        [0, 0, 0],
        [0, 1, 1]
      ]
    });
    const referenceFinalStep = firstTrace.steps[firstTrace.steps.length - 1]!;
    const singleGapFinalStep = singleGapTrace.steps[singleGapTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(referenceFinalStep.phase).toBe("Resolution");
    expect(referenceFinalStep.state.kind).toBe("shortest-bridge");
    if (referenceFinalStep.state.kind !== "shortest-bridge") {
      throw new Error("Expected the shortest-bridge state.");
    }
    expect(referenceFinalStep.state.phaseMode).toBe("resolved");
    expect(referenceFinalStep.state.bridgeLength).toBe(2);
    expect(referenceFinalStep.state.firstIsland).toEqual(["0,1", "0,2"]);
    expect(referenceFinalStep.state.reachedSecondIsland).toEqual(["2,3"]);
    expect(referenceFinalStep.state.expandedWater).toContain("1,2");

    expect(singleGapFinalStep.phase).toBe("Resolution");
    expect(singleGapFinalStep.state.kind).toBe("shortest-bridge");
    if (singleGapFinalStep.state.kind !== "shortest-bridge") {
      throw new Error("Expected the shortest-bridge state.");
    }
    expect(singleGapFinalStep.state.bridgeLength).toBe(1);
    expect(singleGapFinalStep.state.firstIsland).toEqual(["0,0", "0,1"]);
    expect(singleGapFinalStep.state.reachedSecondIsland).toEqual(["2,1"]);
  });

  it("records deterministic shortest paths and unreachable grids for Shortest Path in Binary Matrix", () => {
    const firstTrace = buildShortestPathBinaryMatrixTrace(defaultShortestPathBinaryMatrixInput);
    const secondTrace = buildShortestPathBinaryMatrixTrace(defaultShortestPathBinaryMatrixInput);
    const unreachableTrace = buildShortestPathBinaryMatrixTrace({
      grid: [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 1, 1],
        [0, 1, 1, 0]
      ]
    });
    const referenceFinalStep = firstTrace.steps[firstTrace.steps.length - 1]!;
    const unreachableFinalStep = unreachableTrace.steps[unreachableTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(referenceFinalStep.phase).toBe("Resolution");
    expect(referenceFinalStep.state.kind).toBe("shortest-path-binary-matrix");
    if (referenceFinalStep.state.kind !== "shortest-path-binary-matrix") {
      throw new Error("Expected the shortest-path-binary-matrix state.");
    }
    expect(referenceFinalStep.state.phaseMode).toBe("resolved");
    expect(referenceFinalStep.state.reachable).toBe(true);
    expect(referenceFinalStep.state.pathLength).toBe(6);
    expect(referenceFinalStep.state.path).toEqual([
      "0,0",
      "1,0",
      "2,1",
      "2,2",
      "3,3",
      "4,4"
    ]);

    expect(unreachableFinalStep.phase).toBe("No Path");
    expect(unreachableFinalStep.state.kind).toBe("shortest-path-binary-matrix");
    if (unreachableFinalStep.state.kind !== "shortest-path-binary-matrix") {
      throw new Error("Expected the shortest-path-binary-matrix state.");
    }
    expect(unreachableFinalStep.state.reachable).toBe(false);
    expect(unreachableFinalStep.state.pathLength).toBeNull();
    expect(unreachableFinalStep.state.path).toEqual([]);
    expect(unreachableFinalStep.state.visitedOpen).toEqual(["0,0", "0,1", "0,2", "0,3", "1,3"]);
  });

  it("records deterministic nearest exits and sealed mazes for Nearest Exit from Entrance in Maze", () => {
    const firstTrace = buildNearestExitFromEntranceInMazeTrace(
      defaultNearestExitFromEntranceInMazeInput
    );
    const secondTrace = buildNearestExitFromEntranceInMazeTrace(
      defaultNearestExitFromEntranceInMazeInput
    );
    const sealedTrace = buildNearestExitFromEntranceInMazeTrace({
      grid: [
        ["+", "+", "+", "+", "+"],
        ["+", ".", ".", ".", "+"],
        ["+", "+", "+", ".", "+"],
        ["+", "+", "+", ".", "+"],
        ["+", "+", "+", "+", "."]
      ],
      entrance: [1, 1]
    });
    const referenceFinalStep = firstTrace.steps[firstTrace.steps.length - 1]!;
    const sealedFinalStep = sealedTrace.steps[sealedTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(referenceFinalStep.phase).toBe("Resolution");
    expect(referenceFinalStep.state.kind).toBe("nearest-exit-from-entrance-in-maze");
    if (referenceFinalStep.state.kind !== "nearest-exit-from-entrance-in-maze") {
      throw new Error("Expected the nearest-exit-from-entrance-in-maze state.");
    }
    expect(referenceFinalStep.state.phaseMode).toBe("resolved");
    expect(referenceFinalStep.state.reachable).toBe(true);
    expect(referenceFinalStep.state.stepsToExit).toBe(5);
    expect(referenceFinalStep.state.exit).toBe("3,4");
    expect(referenceFinalStep.state.path).toEqual(["1,1", "1,2", "1,3", "2,3", "3,3", "3,4"]);

    expect(sealedFinalStep.phase).toBe("No Path");
    expect(sealedFinalStep.state.kind).toBe("nearest-exit-from-entrance-in-maze");
    if (sealedFinalStep.state.kind !== "nearest-exit-from-entrance-in-maze") {
      throw new Error("Expected the nearest-exit-from-entrance-in-maze state.");
    }
    expect(sealedFinalStep.state.reachable).toBe(false);
    expect(sealedFinalStep.state.stepsToExit).toBe(-1);
    expect(sealedFinalStep.state.path).toEqual([]);
    expect(sealedFinalStep.state.visitedOpen).toEqual(["1,1", "1,2", "1,3", "2,3", "3,3"]);
    expect(sealedFinalStep.state.exits).toEqual(["4,4"]);
  });

  it("records deterministic pantry routes and sealed food targets for Shortest Path to Get Food", () => {
    const firstTrace = buildShortestPathToGetFoodTrace(defaultShortestPathToGetFoodInput);
    const secondTrace = buildShortestPathToGetFoodTrace(defaultShortestPathToGetFoodInput);
    const sealedTrace = buildShortestPathToGetFoodTrace({
      grid: [
        ["X", "X", "X", "X", "X"],
        ["X", "*", "O", "O", "X"],
        ["X", "X", "X", "O", "X"],
        ["X", "X", "X", "O", "X"],
        ["X", "X", "X", "X", "#"]
      ]
    });
    const referenceFinalStep = firstTrace.steps[firstTrace.steps.length - 1]!;
    const sealedFinalStep = sealedTrace.steps[sealedTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(referenceFinalStep.phase).toBe("Resolution");
    expect(referenceFinalStep.state.kind).toBe("shortest-path-to-get-food");
    if (referenceFinalStep.state.kind !== "shortest-path-to-get-food") {
      throw new Error("Expected the shortest-path-to-get-food state.");
    }
    expect(referenceFinalStep.state.phaseMode).toBe("resolved");
    expect(referenceFinalStep.state.reachable).toBe(true);
    expect(referenceFinalStep.state.stepsToFood).toBe(5);
    expect(referenceFinalStep.state.food).toBe("3,4");
    expect(referenceFinalStep.state.path).toEqual(["1,1", "1,2", "1,3", "2,3", "3,3", "3,4"]);

    expect(sealedFinalStep.phase).toBe("No Path");
    expect(sealedFinalStep.state.kind).toBe("shortest-path-to-get-food");
    if (sealedFinalStep.state.kind !== "shortest-path-to-get-food") {
      throw new Error("Expected the shortest-path-to-get-food state.");
    }
    expect(sealedFinalStep.state.reachable).toBe(false);
    expect(sealedFinalStep.state.stepsToFood).toBe(-1);
    expect(sealedFinalStep.state.path).toEqual([]);
    expect(sealedFinalStep.state.visitedOpen).toEqual(["1,1", "1,2", "1,3", "2,3", "3,3"]);
    expect(sealedFinalStep.state.food).toBe("4,4");
  });

  it("records deterministic nearest-zero fills and missing-source stalls for 01 Matrix", () => {
    const resolvedTrace = buildZeroOneMatrixTrace(defaultZeroOneMatrixInput);
    const stalledTrace = buildZeroOneMatrixTrace({
      grid: [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
      ]
    });
    const resolvedFinalStep = resolvedTrace.steps[resolvedTrace.steps.length - 1]!;
    const stalledFinalStep = stalledTrace.steps[stalledTrace.steps.length - 1]!;

    expect(resolvedFinalStep.phase).toBe("Resolution");
    expect(resolvedFinalStep.state.kind).toBe("01-matrix");
    if (resolvedFinalStep.state.kind !== "01-matrix") {
      throw new Error("Expected the 01-matrix state.");
    }
    expect(resolvedFinalStep.state.fullyResolved).toBe(true);
    expect(resolvedFinalStep.state.maxDistance).toBe(2);
    expect(resolvedFinalStep.state.unresolvedCells).toEqual([]);
    expect(resolvedFinalStep.state.grid).toEqual([
      [0, 0, 0],
      [0, 1, 0],
      [1, 2, 1]
    ]);

    expect(stalledFinalStep.phase).toBe("Stalled");
    expect(stalledFinalStep.state.kind).toBe("01-matrix");
    if (stalledFinalStep.state.kind !== "01-matrix") {
      throw new Error("Expected the 01-matrix state.");
    }
    expect(stalledFinalStep.state.fullyResolved).toBe(false);
    expect(stalledFinalStep.state.maxDistance).toBeNull();
    expect(stalledFinalStep.state.unresolvedCells).toEqual([
      "0,0",
      "0,1",
      "0,2",
      "1,0",
      "1,1",
      "1,2",
      "2,0",
      "2,1",
      "2,2"
    ]);
  });

  it("records deterministic shoreline fills and explicit edge cases for As Far from Land as Possible", () => {
    const resolvedTrace = buildAsFarFromLandAsPossibleTrace(defaultAsFarFromLandAsPossibleInput);
    const noLandTrace = buildAsFarFromLandAsPossibleTrace({
      grid: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ]
    });
    const noWaterTrace = buildAsFarFromLandAsPossibleTrace({
      grid: [
        [1, 1],
        [1, 1]
      ]
    });
    const resolvedFinalStep = resolvedTrace.steps[resolvedTrace.steps.length - 1]!;
    const noLandFinalStep = noLandTrace.steps[noLandTrace.steps.length - 1]!;
    const noWaterFinalStep = noWaterTrace.steps[noWaterTrace.steps.length - 1]!;

    expect(resolvedFinalStep.phase).toBe("Resolution");
    expect(resolvedFinalStep.state.kind).toBe("as-far-from-land-as-possible");
    if (resolvedFinalStep.state.kind !== "as-far-from-land-as-possible") {
      throw new Error("Expected the as-far-from-land-as-possible state.");
    }
    expect(resolvedFinalStep.state.outcome).toBe("resolved");
    expect(resolvedFinalStep.state.answer).toBe(2);
    expect(resolvedFinalStep.state.maxDistance).toBe(2);
    expect(resolvedFinalStep.state.farthestWater).toEqual(["1,1"]);
    expect(resolvedFinalStep.state.grid).toEqual([
      [0, 1, 0],
      [1, 2, 1],
      [0, 1, 0]
    ]);

    expect(noLandFinalStep.phase).toBe("Edge Case");
    expect(noLandFinalStep.state.kind).toBe("as-far-from-land-as-possible");
    if (noLandFinalStep.state.kind !== "as-far-from-land-as-possible") {
      throw new Error("Expected the as-far-from-land-as-possible state.");
    }
    expect(noLandFinalStep.state.outcome).toBe("no-land");
    expect(noLandFinalStep.state.answer).toBe(-1);
    expect(noLandFinalStep.state.unreachableWater).toEqual([
      "0,0",
      "0,1",
      "0,2",
      "1,0",
      "1,1",
      "1,2",
      "2,0",
      "2,1",
      "2,2"
    ]);

    expect(noWaterFinalStep.phase).toBe("Edge Case");
    expect(noWaterFinalStep.state.kind).toBe("as-far-from-land-as-possible");
    if (noWaterFinalStep.state.kind !== "as-far-from-land-as-possible") {
      throw new Error("Expected the as-far-from-land-as-possible state.");
    }
    expect(noWaterFinalStep.state.outcome).toBe("no-water");
    expect(noWaterFinalStep.state.answer).toBe(-1);
    expect(noWaterFinalStep.state.remainingWater).toEqual([]);
  });

  it("records deterministic peak heights and immediate water plateaus for Map of Highest Peak", () => {
    const resolvedTrace = buildMapOfHighestPeakTrace(defaultMapOfHighestPeakInput);
    const allWaterTrace = buildMapOfHighestPeakTrace({
      grid: [
        [1, 1],
        [1, 1]
      ]
    });
    const resolvedFinalStep = resolvedTrace.steps[resolvedTrace.steps.length - 1]!;
    const allWaterFinalStep = allWaterTrace.steps[allWaterTrace.steps.length - 1]!;

    expect(resolvedFinalStep.phase).toBe("Resolution");
    expect(resolvedFinalStep.state.kind).toBe("map-of-highest-peak");
    if (resolvedFinalStep.state.kind !== "map-of-highest-peak") {
      throw new Error("Expected the map-of-highest-peak state.");
    }
    expect(resolvedFinalStep.state.fullyAssigned).toBe(true);
    expect(resolvedFinalStep.state.maxHeight).toBe(2);
    expect(resolvedFinalStep.state.highestCells).toEqual(["0,0", "0,2", "2,0", "2,2"]);
    expect(resolvedFinalStep.state.grid).toEqual([
      [2, 1, 2],
      [1, 0, 1],
      [2, 1, 2]
    ]);

    expect(allWaterFinalStep.phase).toBe("Resolution");
    expect(allWaterFinalStep.state.kind).toBe("map-of-highest-peak");
    if (allWaterFinalStep.state.kind !== "map-of-highest-peak") {
      throw new Error("Expected the map-of-highest-peak state.");
    }
    expect(allWaterFinalStep.state.fullyAssigned).toBe(true);
    expect(allWaterFinalStep.state.maxHeight).toBe(0);
    expect(allWaterFinalStep.state.highestCells).toEqual(["0,0", "0,1", "1,0", "1,1"]);
    expect(allWaterFinalStep.state.remainingLand).toEqual([]);
  });

  it("rejects map-of-highest-peak inputs with no water source", () => {
    expect(() =>
      buildMapOfHighestPeakTrace({
        grid: [
          [0, 0],
          [0, 0]
        ]
      })
    ).toThrow("Map of Highest Peak input must include at least one water cell.");
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
