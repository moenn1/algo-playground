import { describe, expect, it } from "vitest";

import {
  buildEditDistanceTrace,
  buildDynamicProgrammingTrace,
  buildLongestCommonSubstringTrace,
  buildLongestCommonSubsequenceTrace,
  defaultEditDistanceInput,
  defaultLongestCommonSubstringInput,
  defaultLongestCommonSubsequenceInput,
  dynamicProgrammingAlgorithmIds,
  parseDynamicProgrammingInputText,
  serializeDynamicProgrammingInput
} from "../src/index.js";

describe("dynamic-programming execution engine", () => {
  it.each([
    {
      algorithmId: "longest-common-subsequence",
      expectedLength: 4,
      expectedSequence: "MJAU"
    },
    {
      algorithmId: "edit-distance",
      expectedLength: 6
    },
    {
      algorithmId: "longest-common-substring",
      expectedLength: 1,
      expectedSequence: "X"
    }
  ] satisfies Array<{
    algorithmId: (typeof dynamicProgrammingAlgorithmIds)[number];
    expectedLength: number;
    expectedSequence?: string;
  }>)(
    "emits deterministic traces for $algorithmId",
    ({ algorithmId, expectedLength, expectedSequence }) => {
      const input = {
        left: "XMJYAUZ",
        right: "MZJAWXU"
      };
      const firstTrace = buildDynamicProgrammingTrace(algorithmId, input);
      const secondTrace = buildDynamicProgrammingTrace(algorithmId, input);
      const finalStep = firstTrace.steps[firstTrace.steps.length - 1]!;

      expect(firstTrace).toEqual(secondTrace);
      expect(firstTrace.summary.comparisonMetricKeys).toEqual([
        "cellsComputed",
        "matches",
        "tracebackSteps"
      ]);
      expect(finalStep.phase).toBe("Done");
      expect(finalStep.state.resultLength).toBe(expectedLength);
      if (expectedSequence !== undefined) {
        expect(finalStep.state.resultSequence).toBe(expectedSequence);
      } else {
        expect(finalStep.state.resultSequence.length).toBeGreaterThan(0);
      }
      expect(finalStep.state.tracebackPath.length).toBeGreaterThan(0);
    }
  );

  it("records traceback steps even when no shared characters exist", () => {
    const trace = buildLongestCommonSubsequenceTrace({
      left: "ABC",
      right: "XYZ"
    });
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(finalStep.state.resultLength).toBe(0);
    expect(finalStep.state.resultSequence).toBe("");
    expect(trace.summary.finalMetrics.tracebackSteps).toBeGreaterThan(0);
  });

  it("records deterministic edit-distance costs and edit script traceback", () => {
    const firstTrace = buildEditDistanceTrace(defaultEditDistanceInput);
    const secondTrace = buildEditDistanceTrace(defaultEditDistanceInput);
    const finalStep = firstTrace.steps[firstTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.resultLength).toBe(3);
    expect(finalStep.state.resultSequence).toContain("replace k->s");
    expect(finalStep.state.resultSequence).toContain("insert g");
    expect(firstTrace.summary.finalMetrics.cellsComputed).toBe(42);
    expect(firstTrace.summary.finalMetrics.tracebackSteps).toBeGreaterThan(0);
  });

  it("records deterministic longest-common-substring resets and result recovery", () => {
    const trace = buildLongestCommonSubstringTrace(defaultLongestCommonSubstringInput);
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.resultLength).toBe(4);
    expect(finalStep.state.resultSequence).toBe("race");
    expect(finalStep.state.tracebackPath).toEqual([
      [2, 1],
      [3, 2],
      [4, 3],
      [5, 4]
    ]);
    expect(trace.summary.finalMetrics.matches).toBeGreaterThanOrEqual(4);
  });

  it("serializes and parses replay-safe dynamic-programming inputs", () => {
    expect(
      parseDynamicProgrammingInputText(serializeDynamicProgrammingInput(defaultLongestCommonSubsequenceInput))
    ).toEqual(defaultLongestCommonSubsequenceInput);
  });
});
