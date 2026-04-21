import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type StackAlgorithmId = "valid-parentheses";

export const stackAlgorithmIds: StackAlgorithmId[] = ["valid-parentheses"];

export interface StackInput extends JsonObject {
  expression: string;
}

export interface StackExecutionState extends JsonObject {
  expression: string;
  cursor: number | null;
  currentChar: string | null;
  stackTokens: string[];
  stackIndices: number[];
  processedIndices: number[];
  matchedPairs: number[][];
  expectedCloser: string | null;
  failureIndex: number | null;
  failureReason: string | null;
  valid: boolean | null;
}

interface StackMetricState {
  pushes: number;
  pops: number;
  comparisons: number;
}

interface StackAlgorithmDefinition {
  id: StackAlgorithmId;
  label: string;
  implementationVersion: string;
}

const openingToClosing = {
  "(": ")",
  "[": "]",
  "{": "}"
} as const;

type OpeningToken = keyof typeof openingToClosing;

const stackAlgorithmDefinitions: Record<StackAlgorithmId, StackAlgorithmDefinition> = {
  "valid-parentheses": {
    id: "valid-parentheses",
    label: "Valid Parentheses",
    implementationVersion: "stack-engine-0.1.0"
  }
};

export const stackMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "comparisons",
    label: "Closer checks",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "pushes",
    label: "Stack pushes",
    unit: "count",
    direction: "neutral"
  },
  {
    key: "pops",
    label: "Stack pops",
    unit: "count",
    direction: "neutral"
  }
];

export const defaultValidParenthesesInput: StackInput = {
  expression: "({[]})[]"
};

function isOpeningToken(token: string): token is OpeningToken {
  return token === "(" || token === "[" || token === "{";
}

function cloneMatchedPairs(pairs: number[][]): number[][] {
  return pairs.map((pair) => pair.slice());
}

function cloneStackState(state: StackExecutionState): StackExecutionState {
  return {
    expression: state.expression,
    cursor: state.cursor,
    currentChar: state.currentChar,
    stackTokens: state.stackTokens.slice(),
    stackIndices: state.stackIndices.slice(),
    processedIndices: state.processedIndices.slice(),
    matchedPairs: cloneMatchedPairs(state.matchedPairs),
    expectedCloser: state.expectedCloser,
    failureIndex: state.failureIndex,
    failureReason: state.failureReason,
    valid: state.valid
  };
}

function createStackRecorder(algorithmId: StackAlgorithmId) {
  return createTraceRecorder<StackExecutionState, StackExecutionState, StackMetricState>({
    algorithmId,
    projectState: cloneStackState,
    projectMetrics(metrics) {
      return {
        comparisons: metrics.comparisons,
        pushes: metrics.pushes,
        pops: metrics.pops
      };
    }
  });
}

function normalizeStackInput(candidate: unknown): StackInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Stack input must be an object with an expression string.");
  }

  const value = candidate as {
    expression?: unknown;
  };

  if (typeof value.expression !== "string" || value.expression.length === 0) {
    throw new Error("Stack input expression must be a non-empty string.");
  }

  if (value.expression.length > 32) {
    throw new Error("Stack input expressions must be 32 characters or fewer.");
  }

  if (!/^[()[\]{}]+$/.test(value.expression)) {
    throw new Error("Stack input expression must contain only bracket tokens: (), [], {}.");
  }

  return {
    expression: value.expression
  };
}

export function parseStackInputText(inputText: string): StackInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(inputText);
  } catch {
    throw new Error("Stack input must be valid JSON.");
  }

  return normalizeStackInput(parsed);
}

export function serializeStackInput(input: StackInput): string {
  return JSON.stringify(
    {
      expression: input.expression
    },
    null,
    2
  );
}

function getExpectedCloser(stackTokens: string[]): string | null {
  const top = stackTokens[stackTokens.length - 1];

  if (!top || !isOpeningToken(top)) {
    return null;
  }

  return openingToClosing[top];
}

function buildStackEnvelope(
  definition: StackAlgorithmDefinition,
  input: StackInput,
  recorder: ReturnType<typeof createStackRecorder>
): TraceEnvelope<StackExecutionState> {
  return createTraceEnvelope({
    algorithm: {
      id: definition.id,
      label: definition.label,
      domain: "stack",
      implementationVersion: definition.implementationVersion
    },
    input,
    steps: recorder.getSteps(),
    metricDefinitions: stackMetricDefinitions,
    comparisonMetricKeys: ["comparisons", "pushes", "pops"]
  });
}

export function buildValidParenthesesTrace(input: StackInput): TraceEnvelope<StackExecutionState> {
  const definition = stackAlgorithmDefinitions["valid-parentheses"];
  const normalizedInput = normalizeStackInput(input);
  const tokens = normalizedInput.expression.split("");
  const recorder = createStackRecorder(definition.id);
  const metrics: StackMetricState = {
    pushes: 0,
    pops: 0,
    comparisons: 0
  };
  const stackTokens: string[] = [];
  const stackIndices: number[] = [];
  const processedIndices: number[] = [];
  const matchedPairs: number[][] = [];
  let failureIndex: number | null = null;
  let failureReason: string | null = null;
  let valid: boolean | null = null;

  const createRuntimeState = (cursor: number | null, currentChar: string | null) =>
    cloneStackState({
      expression: normalizedInput.expression,
      cursor,
      currentChar,
      stackTokens,
      stackIndices,
      processedIndices,
      matchedPairs,
      expectedCloser: getExpectedCloser(stackTokens),
      failureIndex,
      failureReason,
      valid
    });

  recorder.push({
    phase: "Initialization",
    description:
      "The replay begins before any bracket token is consumed, with an empty validation stack and no recorded mismatch.",
    explanation: {
      summary: "Seed the expression and empty stack before processing the first token.",
      details:
        "The timeline stores the empty-stack baseline explicitly so later jumps never have to infer stack contents from previous frames.",
      tags: ["snapshot", "stack"]
    },
    runtimeState: createRuntimeState(null, null),
    metrics,
    highlights: [
      {
        key: "stack-expression-initial",
        path: "state.expression",
        kind: "collection",
        intent: "focus",
        label: `${tokens.length} bracket tokens queued`
      }
    ]
  });

  for (const [index, token] of tokens.entries()) {
    processedIndices.push(index);

    if (isOpeningToken(token)) {
      stackTokens.push(token);
      stackIndices.push(index);
      metrics.pushes += 1;

      recorder.push({
        phase: "Push",
        description: `Token ${token} at slot ${index} opens a new segment, so it is pushed onto the validation stack.`,
        explanation: {
          summary: "Push the opening bracket so a later closer can validate against it.",
          details:
            "Replay stores both the opener token and its source index, which keeps later matches readable without browser-only bookkeeping.",
          tags: ["stack", "push"]
        },
        runtimeState: createRuntimeState(index, token),
        metrics,
        highlights: [
          {
            key: `stack-push-${index}`,
            path: "state.stackTokens",
            kind: "collection",
            intent: "mutation",
            label: `Push ${token} from slot ${index}`
          }
        ]
      });

      continue;
    }

    metrics.comparisons += 1;
    const expectedCloser = getExpectedCloser(stackTokens);
    const openingIndex = stackIndices[stackIndices.length - 1] ?? null;
    const openingToken = stackTokens[stackTokens.length - 1] ?? null;

    if (expectedCloser === token && openingIndex !== null && openingToken !== null) {
      stackTokens.pop();
      stackIndices.pop();
      matchedPairs.push([openingIndex, index]);
      metrics.pops += 1;

      recorder.push({
        phase: "Match",
        description: `Token ${token} at slot ${index} closes ${openingToken} from slot ${openingIndex}, so the stack pops one level.`,
        explanation: {
          summary: "Validate the closer against the current stack top and pop the matched opener.",
          details:
            "Matched-pair indices remain in the snapshot so replay can highlight both ends of the validated segment after the pop occurs.",
          tags: ["stack", "match"]
        },
        runtimeState: createRuntimeState(index, token),
        metrics,
        highlights: [
          {
            key: `stack-match-${openingIndex}-${index}`,
            path: "state.matchedPairs",
            kind: "collection",
            intent: "result",
            label: `Match ${openingToken}${token} across slots ${openingIndex} and ${index}`
          }
        ]
      });

      continue;
    }

    failureIndex = index;
    failureReason =
      expectedCloser === null
        ? `Closer ${token} has no matching opener on the stack.`
        : `Expected ${expectedCloser} from slot ${openingIndex} before ${token}.`;
    valid = false;

    recorder.push({
      phase: "Reject",
      description:
        expectedCloser === null
          ? `Token ${token} at slot ${index} fails immediately because the stack is already empty.`
          : `Token ${token} at slot ${index} mismatches the expected closer ${expectedCloser} for opener ${openingToken} from slot ${openingIndex}.`,
      explanation: {
        summary: "Publish the first invalid closer as the terminal replay frame.",
        details:
          "The mismatch frame records the current token, the remaining stack, and the expected closer so consumers never infer why validation failed.",
        tags: ["stack", "reject"]
      },
      runtimeState: createRuntimeState(index, token),
      metrics,
      highlights: [
        {
          key: `stack-reject-${index}`,
          path: "state.failureIndex",
          kind: "index",
          intent: "result",
          label: `Mismatch at slot ${index}`
        }
      ]
    });

    return buildStackEnvelope(definition, normalizedInput, recorder);
  }

  valid = stackTokens.length === 0;

  if (valid) {
    recorder.push({
      phase: "Done",
      description:
        "Every bracket closes in the correct order, so the expression finishes with an empty validation stack.",
      explanation: {
        summary: "Publish the successful validation frame with no unmatched openers remaining.",
        details:
          "The terminal success snapshot keeps the fully processed expression and empty stack in one replay-safe frame.",
        tags: ["result", "stack"]
      },
      runtimeState: createRuntimeState(null, null),
      metrics,
      highlights: [
        {
          key: "stack-valid",
          path: "state.valid",
          kind: "value",
          intent: "result",
          label: "Expression is valid"
        }
      ]
    });

    return buildStackEnvelope(definition, normalizedInput, recorder);
  }

  failureIndex = stackIndices[stackIndices.length - 1] ?? null;
  failureReason = `${stackTokens.length} opening token${stackTokens.length === 1 ? "" : "s"} remain on the stack.`;

  recorder.push({
    phase: "Unclosed",
    description:
      "The expression exhausts its input with opening brackets still on the stack, so validation ends without a full match.",
    explanation: {
      summary: "Publish the terminal frame with unmatched openers still pending.",
      details:
        "Recording the leftover stack directly keeps unclosed expressions deterministic in replay instead of inferring failure from missing closers.",
      tags: ["result", "stack"]
    },
    runtimeState: createRuntimeState(null, null),
    metrics,
    highlights: [
      {
        key: "stack-unclosed",
        path: "state.stackTokens",
        kind: "collection",
        intent: "result",
        label: `${stackTokens.length} opening token${stackTokens.length === 1 ? "" : "s"} unclosed`
      }
    ]
  });

  return buildStackEnvelope(definition, normalizedInput, recorder);
}

export function buildStackTrace(
  algorithmId: StackAlgorithmId,
  input: StackInput
): TraceEnvelope<StackExecutionState> {
  switch (algorithmId) {
    case "valid-parentheses":
      return buildValidParenthesesTrace(input);
  }
}
