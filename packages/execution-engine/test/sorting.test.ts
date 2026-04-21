import { describe, expect, it } from "vitest";

import { buildSortingTrace, sortingAlgorithmIds } from "../src/index.js";

describe("buildSortingTrace", () => {
  it.each(sortingAlgorithmIds)("sorts deterministically for %s", (algorithmId) => {
    const input = [5, 1, 4, 2];
    const firstTrace = buildSortingTrace(algorithmId, input);
    const secondTrace = buildSortingTrace(algorithmId, input);
    const finalStep = firstTrace.steps[firstTrace.steps.length - 1]!;

    expect(finalStep.state.array).toEqual([1, 2, 4, 5]);
    expect(finalStep.state.sortedIndices).toEqual([0, 1, 2, 3]);
    expect(firstTrace.summary.comparisonMetricKeys).toEqual(["comparisons", "writes"]);
    expect(firstTrace.summary.finalMetrics.comparisons).toBeGreaterThan(0);
    expect(firstTrace.steps[0]!.changes.length).toBeGreaterThan(0);
    expect(firstTrace.steps[0]!.highlights.length).toBeGreaterThan(0);
    expect(firstTrace.steps[0]!.explanation.summary.length).toBeGreaterThan(0);
    expect(secondTrace).toEqual(firstTrace);
  });

  it("records merge-sort writes without inventing sorted prefixes before the terminal frame", () => {
    const trace = buildSortingTrace("merge-sort", [9, 3, 7, 1]);
    const lastNonTerminalStep = trace.steps[trace.steps.length - 2]!;
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(lastNonTerminalStep.state.sortedIndices).toEqual([]);
    expect(finalStep.state.sortedIndices).toEqual([0, 1, 2, 3]);
    expect(trace.summary.finalMetrics.writes).toBeGreaterThan(0);
  });

  it("records insertion sort as adjacent swaps without marking globally final lanes early", () => {
    const trace = buildSortingTrace("insertion-sort", [5, 2, 4, 6, 1, 3]);
    const swapSteps = trace.steps.filter((step) => step.phase === "Swap");
    const lastNonTerminalStep = trace.steps[trace.steps.length - 2]!;
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(swapSteps.length).toBeGreaterThan(0);
    expect(lastNonTerminalStep.state.sortedIndices).toEqual([]);
    expect(finalStep.state.array).toEqual([1, 2, 3, 4, 5, 6]);
    expect(finalStep.state.sortedIndices).toEqual([0, 1, 2, 3, 4, 5]);
    expect(trace.summary.finalMetrics.writes).toBeGreaterThan(0);
  });

  it("records heap sort suffix growth while preserving deterministic heap writes", () => {
    const trace = buildSortingTrace("heap-sort", [4, 10, 3, 5, 1]);
    const extractedSuffixStep = trace.steps.find((step) => step.state.sortedIndices.length > 0);
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(extractedSuffixStep).toBeDefined();
    expect(finalStep.state.array).toEqual([1, 3, 4, 5, 10]);
    expect(finalStep.state.sortedIndices).toEqual([0, 1, 2, 3, 4]);
    expect(trace.summary.finalMetrics.comparisons).toBeGreaterThan(0);
    expect(trace.summary.finalMetrics.writes).toBeGreaterThan(0);
  });
});
