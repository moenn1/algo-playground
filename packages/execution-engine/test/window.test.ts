import { describe, expect, it } from "vitest";

import {
  buildLongestSubstringWithoutRepeatingCharactersTrace,
  buildMinimumSizeSubarrayTrace,
  buildWindowTrace,
  defaultLongestSubstringInput,
  defaultMinimumSizeSubarrayInput,
  parseWindowInputText,
  serializeWindowInput,
  windowAlgorithmIds
} from "../src/index.js";

describe("window execution engine", () => {
  it.each(windowAlgorithmIds)("emits deterministic traces for %s", (algorithmId) => {
    const input =
      algorithmId === "longest-substring-without-repeating-characters"
        ? {
            text: "abcabcbb"
          }
        : {
            array: [2, 3, 1, 2, 4, 3],
            target: 7
          };
    const firstTrace = buildWindowTrace(algorithmId, input);
    const secondTrace = buildWindowTrace(algorithmId, input);
    const finalStep = firstTrace.steps[firstTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(firstTrace.summary.comparisonMetricKeys).toEqual([
      "expansions",
      "shrinks",
      "bestUpdates"
    ]);

    if (algorithmId === "longest-substring-without-repeating-characters") {
      expect(finalStep.phase).toBe("Done");
      expect(finalStep.state.kind).toBe("longest-substring-without-repeating-characters");
      expect(finalStep.state.bestSubstring).toBe("abc");
      expect(finalStep.state.bestLength).toBe(3);
      return;
    }

    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.kind).toBe("minimum-size-subarray-sum");
    expect(finalStep.state.bestStart).toBe(4);
    expect(finalStep.state.bestEnd).toBe(5);
    expect(finalStep.state.bestLength).toBe(2);
  });

  it("records an explicit no-solution terminal frame", () => {
    const trace = buildMinimumSizeSubarrayTrace({
      array: [1, 1, 1, 1, 1],
      target: 9
    });
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(finalStep.phase).toBe("No Solution");
    expect(finalStep.state.bestStart).toBeNull();
    expect(finalStep.state.bestEnd).toBeNull();
    expect(finalStep.state.bestLength).toBeNull();
  });

  it("serializes and parses replay-safe sliding-window inputs", () => {
    expect(
      parseWindowInputText(
        serializeWindowInput(defaultMinimumSizeSubarrayInput),
        "minimum-size-subarray-sum"
      )
    ).toEqual(defaultMinimumSizeSubarrayInput);
    expect(
      parseWindowInputText(
        serializeWindowInput(defaultLongestSubstringInput),
        "longest-substring-without-repeating-characters"
      )
    ).toEqual(defaultLongestSubstringInput);
  });

  it("records duplicate-driven contractions for longest unique substrings", () => {
    const trace = buildLongestSubstringWithoutRepeatingCharactersTrace({
      text: "pwwkew"
    });
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(trace.steps.some((step) => step.phase === "Repeat")).toBe(true);
    expect(trace.steps.some((step) => step.phase === "Shrink")).toBe(true);
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.kind).toBe("longest-substring-without-repeating-characters");
    expect(finalStep.state.bestSubstring).toBe("wke");
    expect(finalStep.state.bestLength).toBe(3);
  });
});
