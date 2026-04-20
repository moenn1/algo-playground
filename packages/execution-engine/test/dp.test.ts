import { describe, expect, it } from "vitest";

import {
  buildDynamicProgrammingTrace,
  buildLongestCommonSubsequenceTrace,
  defaultLongestCommonSubsequenceInput,
  dynamicProgrammingAlgorithmIds,
  parseDynamicProgrammingInputText,
  serializeDynamicProgrammingInput
} from "../src/index.js";

describe("dynamic-programming execution engine", () => {
  it.each(dynamicProgrammingAlgorithmIds)("emits deterministic traces for %s", (algorithmId) => {
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
    expect(finalStep.state.resultLength).toBe(4);
    expect(finalStep.state.resultSequence).toBe("MJAU");
    expect(finalStep.state.tracebackPath.length).toBeGreaterThan(0);
  });

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

  it("serializes and parses replay-safe dynamic-programming inputs", () => {
    expect(
      parseDynamicProgrammingInputText(serializeDynamicProgrammingInput(defaultLongestCommonSubsequenceInput))
    ).toEqual(defaultLongestCommonSubsequenceInput);
  });
});
