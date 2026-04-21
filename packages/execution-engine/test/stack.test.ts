import { describe, expect, it } from "vitest";

import {
  buildStackTrace,
  buildValidParenthesesTrace,
  defaultValidParenthesesInput,
  parseStackInputText,
  serializeStackInput,
  stackAlgorithmIds
} from "../src/index.js";

describe("stack execution engine", () => {
  it.each(stackAlgorithmIds)("emits deterministic traces for %s", (algorithmId) => {
    const input = {
      expression: "({[]})[]"
    };
    const firstTrace = buildStackTrace(algorithmId, input);
    const secondTrace = buildStackTrace(algorithmId, input);
    const finalStep = firstTrace.steps[firstTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(firstTrace.summary.comparisonMetricKeys).toEqual(["comparisons", "pushes", "pops"]);
    expect(finalStep.phase).toBe("Done");
    expect(finalStep.state.valid).toBe(true);
    expect(finalStep.state.stackTokens).toEqual([]);
    expect(finalStep.state.matchedPairs).toHaveLength(4);
  });

  it("records the first mismatched closer as the terminal frame", () => {
    const trace = buildValidParenthesesTrace({
      expression: "([)]"
    });
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(finalStep.phase).toBe("Reject");
    expect(finalStep.state.valid).toBe(false);
    expect(finalStep.state.failureIndex).toBe(2);
    expect(finalStep.state.failureReason).toContain("Expected ]");
  });

  it("serializes and parses replay-safe stack inputs", () => {
    expect(parseStackInputText(serializeStackInput(defaultValidParenthesesInput))).toEqual(
      defaultValidParenthesesInput
    );
  });
});
