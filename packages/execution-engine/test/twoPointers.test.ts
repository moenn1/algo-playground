import { describe, expect, it } from "vitest";

import {
  buildContainerWithMostWaterTrace,
  buildTrappingRainWaterTrace,
  buildTwoPointersTrace,
  defaultContainerWithMostWaterInput,
  defaultTrappingRainWaterInput,
  parseTwoPointersInputText,
  serializeTwoPointersInput,
  twoPointersAlgorithmIds
} from "../src/index.js";

describe("two-pointers execution engine", () => {
  it.each(twoPointersAlgorithmIds)("emits deterministic traces for %s", (algorithmId) => {
    const input =
      algorithmId === "container-with-most-water"
        ? {
            heights: [1, 8, 6, 2, 5, 4, 8, 3, 7]
          }
        : {
            heights: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
          };
    const firstTrace = buildTwoPointersTrace(algorithmId, input);
    const secondTrace = buildTwoPointersTrace(algorithmId, input);
    const finalStep = firstTrace.steps[firstTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(finalStep.phase).toBe("Done");

    if (algorithmId === "container-with-most-water") {
      expect(firstTrace.summary.comparisonMetricKeys).toEqual([
        "evaluations",
        "moves",
        "bestUpdates"
      ]);
      expect(finalStep.state.kind).toBe("container-with-most-water");
      expect(finalStep.state.bestArea).toBe(49);
      expect(finalStep.state.bestLeft).toBe(1);
      expect(finalStep.state.bestRight).toBe(8);
      return;
    }

    expect(firstTrace.summary.comparisonMetricKeys).toEqual([
      "evaluations",
      "moves",
      "fills"
    ]);
    expect(finalStep.state.kind).toBe("trapping-rain-water");
    expect(finalStep.state.totalWater).toBe(6);
    expect(finalStep.state.waterByIndex[5]).toBe(2);
  });

  it("records a pointer sweep with explicit best updates", () => {
    const trace = buildContainerWithMostWaterTrace({
      heights: [4, 3, 2, 1, 4]
    });
    const bestUpdateSteps = trace.steps.filter((step) => step.phase === "Best Update");
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(bestUpdateSteps).toHaveLength(1);
    expect(finalStep.state.bestArea).toBe(16);
    expect(finalStep.state.evaluatedPairs).toContainEqual([0, 4]);
    expect(trace.summary.finalMetrics.moves).toBe(4);
  });

  it("records trapped-water fills and per-index totals explicitly", () => {
    const trace = buildTrappingRainWaterTrace({
      heights: [4, 2, 0, 3, 2, 5]
    });
    const fillSteps = trace.steps.filter(
      (step) => step.phase === "Fill Left" || step.phase === "Fill Right"
    );
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(fillSteps).toHaveLength(4);
    expect(finalStep.state.totalWater).toBe(9);
    expect(finalStep.state.waterByIndex).toEqual([0, 2, 4, 1, 2, 0]);
    expect(trace.summary.finalMetrics.fills).toBe(4);
  });

  it("serializes and parses replay-safe two-pointer inputs", () => {
    expect(
      parseTwoPointersInputText(serializeTwoPointersInput(defaultContainerWithMostWaterInput))
    ).toEqual(defaultContainerWithMostWaterInput);
    expect(
      parseTwoPointersInputText(serializeTwoPointersInput(defaultTrappingRainWaterInput))
    ).toEqual(defaultTrappingRainWaterInput);
  });
});
