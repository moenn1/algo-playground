import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition,
  type TraceStep
} from "@tracedeck/trace-core";

export type StackAlgorithmId = "valid-parentheses" | "daily-temperatures";

export const stackAlgorithmIds: StackAlgorithmId[] = [
  "valid-parentheses",
  "daily-temperatures"
];

export interface ValidParenthesesInput extends JsonObject {
  expression: string;
}

export interface DailyTemperaturesInput extends JsonObject {
  temperatures: number[];
}

export type StackInput = ValidParenthesesInput | DailyTemperaturesInput;

export interface ValidParenthesesExecutionState extends JsonObject {
  kind: "valid-parentheses";
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

export interface DailyTemperaturesExecutionState extends JsonObject {
  kind: "daily-temperatures";
  temperatures: number[];
  cursor: number | null;
  currentTemperature: number | null;
  comparisonIndex: number | null;
  stackIndices: number[];
  stackTemperatures: number[];
  processedIndices: number[];
  resolvedWaits: number[];
  currentResolvedIndex: number | null;
  currentWait: number | null;
}

export type StackExecutionState =
  | ValidParenthesesExecutionState
  | DailyTemperaturesExecutionState;

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
    implementationVersion: "stack-engine-0.2.0"
  },
  "daily-temperatures": {
    id: "daily-temperatures",
    label: "Daily Temperatures",
    implementationVersion: "stack-engine-0.2.0"
  }
};

export const stackMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "comparisons",
    label: "Stack comparisons",
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

export const defaultValidParenthesesInput: ValidParenthesesInput = {
  expression: "({[]})[]"
};

export const defaultDailyTemperaturesInput: DailyTemperaturesInput = {
  temperatures: [73, 74, 75, 71, 69, 72, 76, 73]
};

function isOpeningToken(token: string): token is OpeningToken {
  return token === "(" || token === "[" || token === "{";
}

function cloneMatchedPairs(pairs: number[][]): number[][] {
  return pairs.map((pair) => pair.slice());
}

function cloneValidParenthesesState(
  state: ValidParenthesesExecutionState
): ValidParenthesesExecutionState {
  return {
    kind: state.kind,
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

function cloneDailyTemperaturesState(
  state: DailyTemperaturesExecutionState
): DailyTemperaturesExecutionState {
  return {
    kind: state.kind,
    temperatures: state.temperatures.slice(),
    cursor: state.cursor,
    currentTemperature: state.currentTemperature,
    comparisonIndex: state.comparisonIndex,
    stackIndices: state.stackIndices.slice(),
    stackTemperatures: state.stackTemperatures.slice(),
    processedIndices: state.processedIndices.slice(),
    resolvedWaits: state.resolvedWaits.slice(),
    currentResolvedIndex: state.currentResolvedIndex,
    currentWait: state.currentWait
  };
}

function createStackRecorder<State extends StackExecutionState>(
  algorithmId: StackAlgorithmId,
  projectState: (state: State) => State
) {
  return createTraceRecorder<State, State, StackMetricState>({
    algorithmId,
    projectState,
    projectMetrics(metrics) {
      return {
        comparisons: metrics.comparisons,
        pushes: metrics.pushes,
        pops: metrics.pops
      };
    }
  });
}

function normalizeValidParenthesesInput(candidate: unknown): ValidParenthesesInput {
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

function normalizeDailyTemperaturesInput(candidate: unknown): DailyTemperaturesInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Stack input must be an object with a temperatures array.");
  }

  const value = candidate as {
    temperatures?: unknown;
  };

  if (!Array.isArray(value.temperatures) || value.temperatures.length < 2) {
    throw new Error("Daily Temperatures input must include at least two temperatures.");
  }

  if (value.temperatures.length > 24) {
    throw new Error("Daily Temperatures input arrays must contain 24 temperatures or fewer.");
  }

  const temperatures = value.temperatures.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry)) {
      throw new Error(`temperatures[${index}] must be an integer.`);
    }

    if (entry < 0 || entry > 150) {
      throw new Error(`temperatures[${index}] must be between 0 and 150.`);
    }

    return entry;
  });

  return {
    temperatures
  };
}

function normalizeStackInput(
  candidate: unknown,
  algorithmId: StackAlgorithmId = "valid-parentheses"
): StackInput {
  switch (algorithmId) {
    case "valid-parentheses":
      return normalizeValidParenthesesInput(candidate);
    case "daily-temperatures":
      return normalizeDailyTemperaturesInput(candidate);
  }
}

export function parseStackInputText(
  inputText: string,
  algorithmId: StackAlgorithmId = "valid-parentheses"
): StackInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(inputText);
  } catch {
    throw new Error("Stack input must be valid JSON.");
  }

  return normalizeStackInput(parsed, algorithmId);
}

export function serializeStackInput(input: StackInput): string {
  if ("expression" in input) {
    return JSON.stringify(
      {
        expression: input.expression
      },
      null,
      2
    );
  }

  return JSON.stringify(
    {
      temperatures: input.temperatures
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

function buildStackEnvelope<State extends StackExecutionState>(
  definition: StackAlgorithmDefinition,
  input: StackInput,
  steps: TraceStep<State>[]
): TraceEnvelope<State> {
  return createTraceEnvelope({
    algorithm: {
      id: definition.id,
      label: definition.label,
      domain: "stack",
      implementationVersion: definition.implementationVersion
    },
    input,
    steps,
    metricDefinitions: stackMetricDefinitions,
    comparisonMetricKeys: ["comparisons", "pushes", "pops"]
  });
}

export function buildValidParenthesesTrace(
  input: ValidParenthesesInput
): TraceEnvelope<ValidParenthesesExecutionState> {
  const definition = stackAlgorithmDefinitions["valid-parentheses"];
  const normalizedInput = normalizeValidParenthesesInput(input);
  const tokens = normalizedInput.expression.split("");
  const recorder = createStackRecorder<ValidParenthesesExecutionState>(
    definition.id,
    cloneValidParenthesesState
  );
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

  const createRuntimeState = (
    cursor: number | null,
    currentChar: string | null
  ): ValidParenthesesExecutionState =>
    cloneValidParenthesesState({
      kind: "valid-parentheses",
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

    return buildStackEnvelope(definition, normalizedInput, recorder.getSteps());
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

    return buildStackEnvelope(definition, normalizedInput, recorder.getSteps());
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

  return buildStackEnvelope(definition, normalizedInput, recorder.getSteps());
}

export function buildDailyTemperaturesTrace(
  input: DailyTemperaturesInput
): TraceEnvelope<DailyTemperaturesExecutionState> {
  const definition = stackAlgorithmDefinitions["daily-temperatures"];
  const normalizedInput = normalizeDailyTemperaturesInput(input);
  const temperatures = normalizedInput.temperatures.slice();
  const recorder = createStackRecorder<DailyTemperaturesExecutionState>(
    definition.id,
    cloneDailyTemperaturesState
  );
  const metrics: StackMetricState = {
    comparisons: 0,
    pushes: 0,
    pops: 0
  };
  const stackIndices: number[] = [];
  const stackTemperatures: number[] = [];
  const processedIndices: number[] = [];
  const resolvedWaits = Array.from({ length: temperatures.length }, () => 0);
  let cursor: number | null = null;
  let currentTemperature: number | null = null;
  let comparisonIndex: number | null = null;
  let currentResolvedIndex: number | null = null;
  let currentWait: number | null = null;

  const createRuntimeState = (): DailyTemperaturesExecutionState =>
    cloneDailyTemperaturesState({
      kind: "daily-temperatures",
      temperatures,
      cursor,
      currentTemperature,
      comparisonIndex,
      stackIndices,
      stackTemperatures,
      processedIndices,
      resolvedWaits,
      currentResolvedIndex,
      currentWait
    });

  recorder.push({
    phase: "Initialization",
    description:
      "The replay begins with an empty monotonic stack, no resolved waits, and the temperature skyline ready for the first day.",
    explanation: {
      summary: "Seed the forecast and empty unresolved-day stack before scanning the first temperature.",
      details:
        "The timeline stores the empty stack, zero wait ledger, and untouched temperature array explicitly so later jumps never reconstruct unresolved days from prior frames.",
      tags: ["snapshot", "stack"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "daily-temperatures-initial",
        path: "state.temperatures",
        kind: "collection",
        intent: "focus",
        label: `${temperatures.length} forecast days queued`
      }
    ]
  });

  for (const [index, temperature] of temperatures.entries()) {
    cursor = index;
    currentTemperature = temperature;
    comparisonIndex = stackIndices[stackIndices.length - 1] ?? null;
    currentResolvedIndex = null;
    currentWait = null;
    processedIndices.push(index);

    recorder.push({
      phase: "Inspect",
      description: `Inspect day ${index} at ${temperature} degrees and compare it against the unresolved days waiting on the monotonic stack.`,
      explanation: {
        summary: "Start a new daily scan with the current forecast value and the active unresolved stack top.",
        details:
          "The current day and the top unresolved day are recorded together so replay can show which older temperature is about to be tested against the new reading.",
        tags: ["stack", "inspect"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `daily-temperatures-day-${index}`,
          path: "state.cursor",
          kind: "index",
          intent: "active",
          label: `Inspect day ${index}`,
          metadata: {
            index,
            temperature
          }
        }
      ]
    });

    while (stackIndices.length > 0) {
      comparisonIndex = stackIndices[stackIndices.length - 1] ?? null;
      metrics.comparisons += 1;

      recorder.push({
        phase: "Compare",
        description: `Compare day ${index} at ${temperature} degrees against unresolved day ${comparisonIndex} at ${comparisonIndex !== null ? temperatures[comparisonIndex] : "?"} degrees.`,
        explanation: {
          summary: "Check whether the current day is warm enough to resolve the top waiting day.",
          details:
            "Each comparison step keeps the current day, the stack top, and the live stack contents explicit so replay can follow the monotonic invariant without browser-only derivation.",
          tags: ["stack", "compare"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `daily-temperatures-compare-${index}-${comparisonIndex}`,
            path: "state.comparisonIndex",
            kind: "index",
            intent: "candidate",
            label: `Compare against day ${comparisonIndex}`,
            metadata: {
              index: comparisonIndex ?? -1
            }
          }
        ]
      });

      if (comparisonIndex === null || temperatures[comparisonIndex]! >= temperature) {
        break;
      }

      stackIndices.pop();
      stackTemperatures.pop();
      metrics.pops += 1;
      currentResolvedIndex = comparisonIndex;
      currentWait = index - comparisonIndex;
      resolvedWaits[comparisonIndex] = currentWait;

      recorder.push({
        phase: "Resolve",
        description: `Day ${comparisonIndex} waits ${currentWait} day${currentWait === 1 ? "" : "s"} for a warmer temperature on day ${index}.`,
        explanation: {
          summary: "Pop a cooler day once the current temperature resolves its wait distance.",
          details:
            "The resolved day index and wait amount are recorded in the snapshot so replay can jump directly to the exact warming relationship that closed the pending day.",
          tags: ["stack", "resolve"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `daily-temperatures-resolve-${comparisonIndex}-${index}`,
            path: "state.currentResolvedIndex",
            kind: "index",
            intent: "result",
            label: `Resolve day ${comparisonIndex} with wait ${currentWait}`,
            metadata: {
              index: comparisonIndex,
              wait: currentWait
            }
          }
        ]
      });

      currentResolvedIndex = null;
      currentWait = null;
    }

    stackIndices.push(index);
    stackTemperatures.push(temperature);
    comparisonIndex = null;
    metrics.pushes += 1;

    recorder.push({
      phase: "Push",
      description: `Push day ${index} onto the monotonic stack because it still needs a warmer future day to settle its wait.`,
      explanation: {
        summary: "Record the current day as a new unresolved stack entry.",
        details:
          "Replay stores both the unresolved day index and its temperature so the stack rail stays readable without mapping indices back through the forecast array at render time.",
        tags: ["stack", "push"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `daily-temperatures-push-${index}`,
          path: "state.stackIndices",
          kind: "collection",
          intent: "mutation",
          label: `Push day ${index} at ${temperature} degrees`
        }
      ]
    });
  }

  cursor = null;
  currentTemperature = null;
  comparisonIndex = null;
  currentResolvedIndex = null;
  currentWait = null;

  recorder.push({
    phase: "Done",
    description:
      stackIndices.length > 0
        ? `The forecast is exhausted. ${stackIndices.length} day${stackIndices.length === 1 ? "" : "s"} stay on the stack and keep a wait of 0 because no warmer temperature appears later.`
        : "The forecast is exhausted and every day has already resolved to a warmer future temperature.",
    explanation: {
      summary: "Publish the final wait ledger once the monotonic scan reaches the end of the forecast.",
      details:
        "The terminal snapshot keeps the full wait array plus the unresolved stack entries that never found a warmer day, so replay can distinguish resolved waits from terminal zeroes safely.",
      tags: ["result", "stack"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "daily-temperatures-done",
        path: "state.resolvedWaits",
        kind: "collection",
        intent: "result",
        label: "Final wait ledger"
      }
    ]
  });

  return buildStackEnvelope(definition, normalizedInput, recorder.getSteps());
}

export function buildStackTrace(
  algorithmId: StackAlgorithmId,
  input: StackInput
): TraceEnvelope<StackExecutionState> {
  switch (algorithmId) {
    case "valid-parentheses":
      return buildValidParenthesesTrace(input as ValidParenthesesInput);
    case "daily-temperatures":
      return buildDailyTemperaturesTrace(input as DailyTemperaturesInput);
  }
}
