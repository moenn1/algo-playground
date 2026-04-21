import { describe, expect, it } from "vitest";

import {
  buildHashTrace,
  buildTwoSumTrace,
  defaultTwoSumInput,
  hashAlgorithmIds,
  parseHashInputText,
  serializeHashInput
} from "../src/index.js";

describe("hash execution engine", () => {
  it.each(hashAlgorithmIds)("emits deterministic traces for %s", (algorithmId) => {
    const input = {
      array: [2, 7, 11, 15],
      target: 9
    };
    const firstTrace = buildHashTrace(algorithmId, input);
    const secondTrace = buildHashTrace(algorithmId, input);
    const phases = firstTrace.steps.map((step) => step.phase);
    const finalStep = firstTrace.steps[firstTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(phases).toEqual(["Initialization", "Lookup", "Store", "Lookup", "Match", "Done"]);
    expect(firstTrace.summary.comparisonMetricKeys).toEqual([
      "inspections",
      "lookups",
      "stores"
    ]);
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.matchedPairIndices).toEqual([0, 1]);
    expect(finalStep.state.matchedPairValues).toEqual([2, 7]);
  });

  it("tracks complements with negative values", () => {
    const trace = buildTwoSumTrace({
      array: [-3, 4, 3, 90],
      target: 0
    });
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(finalStep.state.matchedPairIndices).toEqual([0, 2]);
    expect(finalStep.state.matchedPairValues).toEqual([-3, 3]);
    expect(trace.summary.finalMetrics.stores).toBe(2);
  });

  it("rejects ambiguous multi-solution inputs", () => {
    expect(() =>
      buildTwoSumTrace({
        array: [1, 2, 3, 4],
        target: 5
      })
    ).toThrow(/exactly one solution pair/i);
  });

  it("serializes and parses replay-safe hash inputs", () => {
    expect(parseHashInputText(serializeHashInput(defaultTwoSumInput))).toEqual(defaultTwoSumInput);
  });
});
