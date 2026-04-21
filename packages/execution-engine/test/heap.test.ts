import { describe, expect, it } from "vitest";

import {
  buildHeapTrace,
  buildKthLargestElementTrace,
  buildTopKFrequentElementsTrace,
  defaultKthLargestElementInput,
  defaultTopKFrequentElementsInput,
  heapAlgorithmIds,
  parseHeapInputText,
  serializeHeapInput
} from "../src/index.js";

describe("heap execution engine", () => {
  it.each(heapAlgorithmIds)("emits deterministic traces for %s", (algorithmId) => {
    const input =
      algorithmId === "kth-largest-element-in-an-array"
        ? {
            array: [3, 2, 1, 5, 6, 4],
            k: 2
          }
        : {
            array: [1, 1, 1, 2, 2, 3],
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

    if (finalStep.state.kind === "kth-largest-element-in-an-array") {
      expect(finalStep.state.result).toBe(5);
      expect(finalStep.state.rankedEntries.map((entry) => entry.value)).toEqual([6, 5]);
      return;
    }

    expect(finalStep.state.result).toEqual([1, 2]);
    expect(finalStep.state.rankedEntries.map((entry) => entry.value)).toEqual([1, 2]);
  });

  it("tracks duplicate values while preserving the kth cutoff", () => {
    const trace = buildKthLargestElementTrace({
      array: [3, 2, 3, 1, 2, 4, 5, 5, 6],
      k: 4
    });
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(finalStep.state.kind).toBe("kth-largest-element-in-an-array");
    if (finalStep.state.kind !== "kth-largest-element-in-an-array") {
      throw new Error("Expected the kth-largest-element-in-an-array state.");
    }
    expect(finalStep.state.result).toBe(4);
    expect(finalStep.state.rankedEntries.map((entry) => entry.value)).toEqual([6, 5, 5, 4]);
    expect(trace.summary.finalMetrics.pops).toBeGreaterThan(0);
  });

  it("serializes and parses replay-safe heap inputs", () => {
    expect(
      parseHeapInputText(
        serializeHeapInput(defaultKthLargestElementInput),
        "kth-largest-element-in-an-array"
      )
    ).toEqual(defaultKthLargestElementInput);
    expect(
      parseHeapInputText(
        serializeHeapInput(defaultTopKFrequentElementsInput),
        "top-k-frequent-elements"
      )
    ).toEqual(defaultTopKFrequentElementsInput);
  });

  it("records deterministic frequency counting and tie-break ranking for Top K Frequent Elements", () => {
    const referenceTrace = buildTopKFrequentElementsTrace({
      array: [1, 1, 1, 2, 2, 3],
      k: 2
    });
    const tieTrace = buildTopKFrequentElementsTrace({
      array: [4, 1, -1, 2, -1, 2, 3, 3],
      k: 2
    });
    const referenceFinalStep = referenceTrace.steps[referenceTrace.steps.length - 1]!;
    const tieFinalStep = tieTrace.steps[tieTrace.steps.length - 1]!;

    expect(referenceFinalStep.phase).toBe("Done");
    expect(referenceFinalStep.state.kind).toBe("top-k-frequent-elements");
    if (referenceFinalStep.state.kind !== "top-k-frequent-elements") {
      throw new Error("Expected the top-k-frequent-elements state.");
    }
    expect(referenceFinalStep.state.result).toEqual([1, 2]);
    expect(referenceFinalStep.state.rankedEntries.map((entry) => entry.frequency)).toEqual([3, 2]);

    expect(tieFinalStep.phase).toBe("Done");
    expect(tieFinalStep.state.kind).toBe("top-k-frequent-elements");
    if (tieFinalStep.state.kind !== "top-k-frequent-elements") {
      throw new Error("Expected the top-k-frequent-elements state.");
    }
    expect(tieFinalStep.state.result).toEqual([-1, 2]);
    expect(tieFinalStep.state.rankedEntries.map((entry) => entry.value)).toEqual([-1, 2]);
  });
});
