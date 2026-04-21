import { describe, expect, it } from "vitest";

import {
  buildContainerWithMostWaterTrace,
  buildTwoPointersTrace,
  defaultContainerWithMostWaterInput,
  parseTwoPointersInputText,
  serializeTwoPointersInput,
  twoPointersAlgorithmIds
} from "../src/index.js";

describe("two-pointers execution engine", () => {
  it.each(twoPointersAlgorithmIds)("emits deterministic traces for %s", (algorithmId) => {
    const input = {
      heights: [1, 8, 6, 2, 5, 4, 8, 3, 7]
    };
    const firstTrace = buildTwoPointersTrace(algorithmId, input);
    const secondTrace = buildTwoPointersTrace(algorithmId, input);
    const finalStep = firstTrace.steps[firstTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(firstTrace.summary.comparisonMetricKeys).toEqual([
      "evaluations",
      "moves",
      "bestUpdates"
    ]);
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.bestArea).toBe(49);
    expect(finalStep.state.bestLeft).toBe(1);
    expect(finalStep.state.bestRight).toBe(8);
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

  it("serializes and parses replay-safe two-pointer inputs", () => {
    expect(
      parseTwoPointersInputText(serializeTwoPointersInput(defaultContainerWithMostWaterInput))
    ).toEqual(defaultContainerWithMostWaterInput);
  });
});
