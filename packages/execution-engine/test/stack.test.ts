import { describe, expect, it } from "vitest";

import {
  buildStackTrace,
  buildDailyTemperaturesTrace,
  buildValidParenthesesTrace,
  defaultDailyTemperaturesInput,
  defaultValidParenthesesInput,
  parseStackInputText,
  serializeStackInput,
  stackAlgorithmIds
} from "../src/index.js";

describe("stack execution engine", () => {
  it.each(stackAlgorithmIds)("emits deterministic traces for %s", (algorithmId) => {
    const input =
      algorithmId === "valid-parentheses"
        ? {
            expression: "({[]})[]"
          }
        : {
            temperatures: [73, 74, 75, 71, 69, 72, 76, 73]
          };
    const firstTrace = buildStackTrace(algorithmId, input);
    const secondTrace = buildStackTrace(algorithmId, input);
    const finalStep = firstTrace.steps[firstTrace.steps.length - 1]!;

    expect(firstTrace).toEqual(secondTrace);
    expect(firstTrace.summary.comparisonMetricKeys).toEqual(["comparisons", "pushes", "pops"]);
    expect(finalStep.phase).toBe("Done");

    if (algorithmId === "valid-parentheses") {
      expect(finalStep.state.kind).toBe("valid-parentheses");
      expect(finalStep.state.valid).toBe(true);
      expect(finalStep.state.stackTokens).toEqual([]);
      expect(finalStep.state.matchedPairs).toHaveLength(4);
      return;
    }

    expect(finalStep.state.kind).toBe("daily-temperatures");
    expect(finalStep.state.resolvedWaits).toEqual([1, 1, 4, 2, 1, 1, 0, 0]);
    expect(finalStep.state.stackIndices).toEqual([6, 7]);
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

  it("records resolved wait distances for warmer future days", () => {
    const trace = buildDailyTemperaturesTrace({
      temperatures: [30, 60, 90]
    });
    const resolveSteps = trace.steps.filter((step) => step.phase === "Resolve");
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(resolveSteps).toHaveLength(2);
    expect(finalStep.state.resolvedWaits).toEqual([1, 1, 0]);
    expect(trace.summary.finalMetrics.pops).toBe(2);
  });

  it("serializes and parses replay-safe stack inputs", () => {
    expect(parseStackInputText(serializeStackInput(defaultValidParenthesesInput))).toEqual(
      defaultValidParenthesesInput
    );
    expect(
      parseStackInputText(serializeStackInput(defaultDailyTemperaturesInput), "daily-temperatures")
    ).toEqual(defaultDailyTemperaturesInput);
  });
});
