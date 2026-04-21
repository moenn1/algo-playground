import { describe, expect, it } from "vitest";

import {
  buildStackTrace,
  buildDailyTemperaturesTrace,
  buildLargestRectangleInHistogramTrace,
  buildMinStackTrace,
  buildValidParenthesesTrace,
  defaultDailyTemperaturesInput,
  defaultLargestRectangleInHistogramInput,
  defaultMinStackInput,
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
        : algorithmId === "daily-temperatures"
          ? {
              temperatures: [73, 74, 75, 71, 69, 72, 76, 73]
            }
          : algorithmId === "largest-rectangle-in-histogram"
            ? {
              heights: [2, 1, 5, 6, 2, 3]
              }
            : {
                operations: [
                  { type: "push", value: -2 },
                  { type: "push", value: 0 },
                  { type: "push", value: -3 },
                  { type: "getMin" },
                  { type: "pop" },
                  { type: "top" },
                  { type: "getMin" }
                ]
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

    if (algorithmId === "daily-temperatures") {
      expect(finalStep.state.kind).toBe("daily-temperatures");
      expect(finalStep.state.resolvedWaits).toEqual([1, 1, 4, 2, 1, 1, 0, 0]);
      expect(finalStep.state.stackIndices).toEqual([6, 7]);
      return;
    }

    if (algorithmId === "largest-rectangle-in-histogram") {
      expect(finalStep.state.kind).toBe("largest-rectangle-in-histogram");
      expect(finalStep.state.bestArea).toBe(10);
      expect(finalStep.state.bestStart).toBe(2);
      expect(finalStep.state.bestEnd).toBe(3);
      return;
    }

    expect(finalStep.state.kind).toBe("min-stack");
    expect(finalStep.state.currentMinimum).toBe(-2);
    expect(finalStep.state.stackValues).toEqual([-2, 0]);
    expect(finalStep.state.minimumValues).toEqual([-2, -2]);
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

  it("records best histogram rectangles through deterministic pop checkpoints", () => {
    const trace = buildLargestRectangleInHistogramTrace({
      heights: [2, 1, 5, 6, 2, 3]
    });
    const resolveSteps = trace.steps.filter((step) => step.phase === "Resolve");
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(resolveSteps.length).toBeGreaterThan(0);
    expect(finalStep.state.bestArea).toBe(10);
    expect(finalStep.state.bestStart).toBe(2);
    expect(finalStep.state.bestEnd).toBe(3);
    expect(finalStep.state.bestHeight).toBe(5);
    expect(trace.summary.finalMetrics.pops).toBe(6);
  });

  it("records stack reads and minimum recovery through deterministic operation checkpoints", () => {
    const trace = buildMinStackTrace({
      operations: [
        { type: "push", value: -2 },
        { type: "push", value: 0 },
        { type: "push", value: -3 },
        { type: "getMin" },
        { type: "pop" },
        { type: "top" },
        { type: "getMin" }
      ]
    });
    const readSteps = trace.steps.filter((step) => step.phase === "Read");
    const popStep = trace.steps.find((step) => step.phase === "Pop");
    const finalStep = trace.steps[trace.steps.length - 1]!;

    expect(readSteps).toHaveLength(3);
    expect(readSteps[0]?.state.currentResultValue).toBe(-3);
    expect(popStep?.state.currentResultValue).toBe(-3);
    expect(finalStep.state.currentMinimum).toBe(-2);
    expect(trace.summary.finalMetrics.comparisons).toBe(2);
  });

  it("serializes and parses replay-safe stack inputs", () => {
    expect(parseStackInputText(serializeStackInput(defaultValidParenthesesInput))).toEqual(
      defaultValidParenthesesInput
    );
    expect(
      parseStackInputText(serializeStackInput(defaultDailyTemperaturesInput), "daily-temperatures")
    ).toEqual(defaultDailyTemperaturesInput);
    expect(
      parseStackInputText(
        serializeStackInput(defaultLargestRectangleInHistogramInput),
        "largest-rectangle-in-histogram"
      )
    ).toEqual(defaultLargestRectangleInHistogramInput);
    expect(parseStackInputText(serializeStackInput(defaultMinStackInput), "min-stack")).toEqual(
      defaultMinStackInput
    );
  });
});
