import { describe, expect, it } from "vitest";

import {
  buildHeapTrace,
  buildKthLargestElementTrace,
  defaultKthLargestElementInput,
  heapAlgorithmIds,
  parseHeapInputText,
  serializeHeapInput
} from "../src/index.js";

describe("heap execution engine", () => {
  it.each(heapAlgorithmIds)("emits deterministic traces for %s", (algorithmId) => {
    const input = {
      array: [3, 2, 1, 5, 6, 4],
      k: 2
    };
    const firstTrace = buildHeapTrace(algorithmId, input);
    const secondTrace = buildHeapTrace(algorithmId, input);
    const finalStep = firstTrace.steps[firstTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(firstTrace.summary.comparisonMetricKeys).toEqual([
      "inspections",
      "pushes",
      "pops"
    ]);
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.result).toBe(5);
    expect(finalStep.state.rankedEntries.map((entry) => entry.value)).toEqual([6, 5]);
  });

  it("tracks duplicate values while preserving the kth cutoff", () => {
    const trace = buildKthLargestElementTrace({
      array: [3, 2, 3, 1, 2, 4, 5, 5, 6],
      k: 4
    });
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(finalStep.state.result).toBe(4);
    expect(finalStep.state.rankedEntries.map((entry) => entry.value)).toEqual([6, 5, 5, 4]);
    expect(trace.summary.finalMetrics.pops).toBeGreaterThan(0);
  });

  it("serializes and parses replay-safe heap inputs", () => {
    expect(parseHeapInputText(serializeHeapInput(defaultKthLargestElementInput))).toEqual(
      defaultKthLargestElementInput
    );
  });
});
