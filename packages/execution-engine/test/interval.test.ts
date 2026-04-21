import { describe, expect, it } from "vitest";

import {
  buildIntervalTrace,
  buildMergeIntervalsTrace,
  defaultMergeIntervalsInput,
  intervalAlgorithmIds,
  parseIntervalInputText,
  serializeIntervalInput
} from "../src/index.js";

describe("interval execution engine", () => {
  it.each(intervalAlgorithmIds)("emits deterministic traces for %s", (algorithmId) => {
    const input = {
      intervals: [
        [1, 3],
        [2, 6],
        [8, 10],
        [15, 18]
      ]
    };
    const firstTrace = buildIntervalTrace(algorithmId, input);
    const secondTrace = buildIntervalTrace(algorithmId, input);
    const finalStep = firstTrace.steps[firstTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(firstTrace.summary.comparisonMetricKeys).toEqual([
      "comparisons",
      "merges",
      "outputs"
    ]);
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.mergedIntervals).toEqual([
      [1, 6],
      [8, 10],
      [15, 18]
    ]);
  });

  it("treats touching intervals as mergeable in the final result", () => {
    const trace = buildMergeIntervalsTrace({
      intervals: [
        [1, 4],
        [4, 5],
        [8, 10]
      ]
    });
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(finalStep.state.mergedIntervals).toEqual([
      [1, 5],
      [8, 10]
    ]);
    expect(trace.summary.finalMetrics.merges).toBeGreaterThan(0);
  });

  it("serializes and parses replay-safe interval inputs", () => {
    expect(parseIntervalInputText(serializeIntervalInput(defaultMergeIntervalsInput))).toEqual(
      defaultMergeIntervalsInput
    );
  });
});
