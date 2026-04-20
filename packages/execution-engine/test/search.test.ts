import { describe, expect, it } from "vitest";

import {
  buildBinarySearchTrace,
  buildSearchTrace,
  defaultBinarySearchInput,
  parseSearchInputText,
  searchAlgorithmIds,
  serializeSearchInput
} from "../src/index.js";

describe("search execution engine", () => {
  it.each(searchAlgorithmIds)("emits deterministic traces for %s", (algorithmId) => {
    const input = {
      array: [2, 5, 8, 12, 16, 23, 38],
      target: 16
    };
    const firstTrace = buildSearchTrace(algorithmId, input);
    const secondTrace = buildSearchTrace(algorithmId, input);
    const finalStep = firstTrace.steps[firstTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(firstTrace.summary.comparisonMetricKeys).toEqual(["probes", "comparisons"]);
    expect(firstTrace.summary.finalMetrics.probes).toBeGreaterThan(0);
    expect(finalStep.phase).toBe("Found");
    expect(finalStep.state.foundIndex).toBe(4);
    expect(finalStep.state.array[finalStep.state.foundIndex!]).toBe(16);
  });

  it("records an explicit exhausted interval when the target is absent", () => {
    const trace = buildBinarySearchTrace({
      array: [1, 4, 7, 11, 18, 25],
      target: 9
    });
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(finalStep.phase).toBe("Not Found");
    expect(finalStep.state.low).toBeNull();
    expect(finalStep.state.high).toBeNull();
    expect(finalStep.state.mid).toBeNull();
    expect(finalStep.state.foundIndex).toBeNull();
    expect(finalStep.state.eliminatedIndices).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("serializes and parses replay-safe binary search inputs", () => {
    expect(parseSearchInputText(serializeSearchInput(defaultBinarySearchInput))).toEqual(
      defaultBinarySearchInput
    );
  });
});
