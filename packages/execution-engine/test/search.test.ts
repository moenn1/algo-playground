import { describe, expect, it } from "vitest";

import {
  buildBinarySearchTrace,
  buildRotatedSearchTrace,
  buildSearchTrace,
  defaultBinarySearchInput,
  defaultRotatedSearchInput,
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

  it("records sorted-half decisions for rotated-array search", () => {
    const trace = buildRotatedSearchTrace({
      array: [15, 18, 22, 1, 3, 6, 10, 12],
      target: 6
    });
    const probeSteps = trace.steps.filter((step) => step.phase === "Probe");
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(probeSteps.map((step) => step.state.sortedSide)).toEqual(["right", "left"]);
    expect(finalStep.phase).toBe("Found");
    expect(finalStep.state.foundIndex).toBe(5);
    expect(finalStep.state.array[finalStep.state.foundIndex!]).toBe(6);
  });

  it("rejects rotated-search inputs that are not a single rotation of ascending order", () => {
    expect(() =>
      buildSearchTrace("search-in-rotated-sorted-array", {
        array: [9, 4, 12, 2, 7],
        target: 7
      })
    ).toThrow("rotation of a strictly increasing array");
  });

  it("serializes and parses replay-safe binary search inputs", () => {
    expect(parseSearchInputText(serializeSearchInput(defaultBinarySearchInput))).toEqual(
      defaultBinarySearchInput
    );
  });

  it("serializes and parses replay-safe rotated-search inputs", () => {
    expect(
      parseSearchInputText(
        serializeSearchInput(defaultRotatedSearchInput),
        "search-in-rotated-sorted-array"
      )
    ).toEqual(defaultRotatedSearchInput);
  });
});
