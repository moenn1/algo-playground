import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition,
  type TraceStep
} from "@tracedeck/trace-core";

export type StackAlgorithmId =
  | "valid-parentheses"
  | "daily-temperatures"
  | "largest-rectangle-in-histogram";

export const stackAlgorithmIds: StackAlgorithmId[] = [
  "valid-parentheses",
  "daily-temperatures",
  "largest-rectangle-in-histogram"
];

export interface ValidParenthesesInput extends JsonObject {
  expression: string;
}

export interface DailyTemperaturesInput extends JsonObject {
  temperatures: number[];
}

export interface LargestRectangleInHistogramInput extends JsonObject {
  heights: number[];
}

export type StackInput =
  | ValidParenthesesInput
  | DailyTemperaturesInput
  | LargestRectangleInHistogramInput;

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

export interface LargestRectangleInHistogramExecutionState extends JsonObject {
  kind: "largest-rectangle-in-histogram";
  heights: number[];
  cursor: number | null;
  currentHeight: number | null;
  comparisonIndex: number | null;
  stackIndices: number[];
  stackHeights: number[];
  processedIndices: number[];
  currentResolvedIndex: number | null;
  currentArea: number | null;
  currentWidth: number | null;
  currentSpanStart: number | null;
  currentSpanEnd: number | null;
  bestArea: number;
  bestStart: number | null;
  bestEnd: number | null;
  bestHeight: number | null;
}

export type StackExecutionState =
  | ValidParenthesesExecutionState
  | DailyTemperaturesExecutionState
  | LargestRectangleInHistogramExecutionState;

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
  },
  "largest-rectangle-in-histogram": {
    id: "largest-rectangle-in-histogram",
    label: "Largest Rectangle in Histogram",
    implementationVersion: "stack-engine-0.3.0"
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

export const defaultLargestRectangleInHistogramInput: LargestRectangleInHistogramInput = {
  heights: [2, 1, 5, 6, 2, 3]
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

function cloneLargestRectangleInHistogramState(
  state: LargestRectangleInHistogramExecutionState
): LargestRectangleInHistogramExecutionState {
  return {
    kind: state.kind,
    heights: state.heights.slice(),
    cursor: state.cursor,
    currentHeight: state.currentHeight,
    comparisonIndex: state.comparisonIndex,
    stackIndices: state.stackIndices.slice(),
    stackHeights: state.stackHeights.slice(),
    processedIndices: state.processedIndices.slice(),
    currentResolvedIndex: state.currentResolvedIndex,
    currentArea: state.currentArea,
    currentWidth: state.currentWidth,
    currentSpanStart: state.currentSpanStart,
    currentSpanEnd: state.currentSpanEnd,
    bestArea: state.bestArea,
    bestStart: state.bestStart,
    bestEnd: state.bestEnd,
    bestHeight: state.bestHeight
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

function normalizeLargestRectangleInHistogramInput(
  candidate: unknown
): LargestRectangleInHistogramInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Stack input must be an object with a heights array.");
  }

  const value = candidate as {
    heights?: unknown;
  };

  if (!Array.isArray(value.heights) || value.heights.length === 0) {
    throw new Error("Largest Rectangle in Histogram input must include at least one height.");
  }

  if (value.heights.length > 24) {
    throw new Error(
      "Largest Rectangle in Histogram input arrays must contain 24 heights or fewer."
    );
  }

  const heights = value.heights.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry)) {
      throw new Error(`heights[${index}] must be an integer.`);
    }

    if (entry < 0 || entry > 150) {
      throw new Error(`heights[${index}] must be between 0 and 150.`);
    }

    return entry;
  });

  return {
    heights
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
    case "largest-rectangle-in-histogram":
      return normalizeLargestRectangleInHistogramInput(candidate);
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

  if ("temperatures" in input) {
    return JSON.stringify(
      {
        temperatures: input.temperatures
      },
      null,
      2
    );
  }

  return JSON.stringify(
    {
      heights: input.heights
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

function getPreviousHistogramIndex(stackIndices: number[]): number {
  return stackIndices.length > 0 ? stackIndices[stackIndices.length - 1]! : -1;
}

function updateHistogramBest(
  area: number,
  height: number,
  start: number,
  end: number,
  best: {
    area: number;
    start: number | null;
    end: number | null;
    height: number | null;
  }
) {
  if (area > best.area) {
    best.area = area;
    best.start = start;
    best.end = end;
    best.height = height;
    return true;
  }

  return false;
}

export function buildLargestRectangleInHistogramTrace(
  input: LargestRectangleInHistogramInput
): TraceEnvelope<LargestRectangleInHistogramExecutionState> {
  const definition = stackAlgorithmDefinitions["largest-rectangle-in-histogram"];
  const normalizedInput = normalizeLargestRectangleInHistogramInput(input);
  const heights = normalizedInput.heights.slice();
  const recorder = createStackRecorder<LargestRectangleInHistogramExecutionState>(
    definition.id,
    cloneLargestRectangleInHistogramState
  );
  const metrics: StackMetricState = {
    comparisons: 0,
    pushes: 0,
    pops: 0
  };
  const stackIndices: number[] = [];
  const stackHeights: number[] = [];
  const processedIndices: number[] = [];
  const best = {
    area: 0,
    start: null as number | null,
    end: null as number | null,
    height: null as number | null
  };
  let cursor: number | null = null;
  let currentHeight: number | null = null;
  let comparisonIndex: number | null = null;
  let currentResolvedIndex: number | null = null;
  let currentArea: number | null = null;
  let currentWidth: number | null = null;
  let currentSpanStart: number | null = null;
  let currentSpanEnd: number | null = null;

  const createRuntimeState = (): LargestRectangleInHistogramExecutionState =>
    cloneLargestRectangleInHistogramState({
      kind: "largest-rectangle-in-histogram",
      heights,
      cursor,
      currentHeight,
      comparisonIndex,
      stackIndices,
      stackHeights,
      processedIndices,
      currentResolvedIndex,
      currentArea,
      currentWidth,
      currentSpanStart,
      currentSpanEnd,
      bestArea: best.area,
      bestStart: best.start,
      bestEnd: best.end,
      bestHeight: best.height
    });

  recorder.push({
    phase: "Initialization",
    description:
      "The replay begins with an empty monotonic stack, no active rectangle, and the histogram bars ready for the first scan step.",
    explanation: {
      summary: "Seed the histogram and empty candidate stack before scanning the first bar.",
      details:
        "The timeline stores the untouched histogram, empty stack, and zero best-area baseline explicitly so later jumps never reconstruct rectangle candidates from prior frames.",
      tags: ["snapshot", "stack"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "largest-rectangle-initial",
        path: "state.heights",
        kind: "collection",
        intent: "focus",
        label: `${heights.length} histogram bars queued`
      }
    ]
  });

  for (const [index, height] of heights.entries()) {
    cursor = index;
    currentHeight = height;
    comparisonIndex = stackIndices[stackIndices.length - 1] ?? null;
    currentResolvedIndex = null;
    currentArea = null;
    currentWidth = null;
    currentSpanStart = null;
    currentSpanEnd = null;
    processedIndices.push(index);

    recorder.push({
      phase: "Inspect",
      description: `Inspect bar ${index} at height ${height} and compare it against the candidate bars waiting on the monotonic stack.`,
      explanation: {
        summary: "Start a new histogram scan step with the current bar and the active stack top.",
        details:
          "The current bar and the live stack contents are recorded together so replay can show which candidate rectangles remain open before any pop occurs.",
        tags: ["stack", "inspect"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `largest-rectangle-bar-${index}`,
          path: "state.cursor",
          kind: "index",
          intent: "active",
          label: `Inspect bar ${index}`,
          metadata: {
            index,
            height
          }
        }
      ]
    });

    while (stackIndices.length > 0) {
      comparisonIndex = stackIndices[stackIndices.length - 1] ?? null;
      metrics.comparisons += 1;

      recorder.push({
        phase: "Compare",
        description: `Compare bar ${index} at height ${height} against stacked bar ${comparisonIndex} at height ${comparisonIndex !== null ? heights[comparisonIndex] : "?"}.`,
        explanation: {
          summary: "Check whether the current bar closes the rectangle anchored by the stack top.",
          details:
            "Each comparison step keeps the current bar, stack top, and candidate stack explicit so replay can follow the monotonic invariant without browser-only reconstruction.",
          tags: ["stack", "compare"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `largest-rectangle-compare-${index}-${comparisonIndex}`,
            path: "state.comparisonIndex",
            kind: "index",
            intent: "candidate",
            label: `Compare against bar ${comparisonIndex}`,
            metadata: {
              index: comparisonIndex ?? -1
            }
          }
        ]
      });

      if (comparisonIndex === null || heights[comparisonIndex]! <= height) {
        break;
      }

      const resolvedIndex = stackIndices.pop()!;
      const resolvedHeight = stackHeights.pop()!;
      const leftBoundary = getPreviousHistogramIndex(stackIndices);
      const width = index - leftBoundary - 1;
      const area = resolvedHeight * width;
      const start = leftBoundary + 1;
      const end = index - 1;
      metrics.pops += 1;
      currentResolvedIndex = resolvedIndex;
      currentArea = area;
      currentWidth = width;
      currentSpanStart = start;
      currentSpanEnd = end;
      const becameBest = updateHistogramBest(area, resolvedHeight, start, end, best);

      recorder.push({
        phase: "Resolve",
        description: `Bar ${resolvedIndex} at height ${resolvedHeight} resolves a rectangle of area ${area} across width ${width} from bar ${start} through ${end}.`,
        explanation: {
          summary: "Pop the stack top once the current bar closes its widest valid rectangle.",
          details:
            "The resolved span, width, and area are recorded directly in the snapshot so replay can jump to each closed rectangle without recomputing boundaries from neighboring bars.",
          tags: ["stack", "resolve"]
        },
        runtimeState: createRuntimeState(),
        metrics,
        highlights: [
          {
            key: `largest-rectangle-resolve-${resolvedIndex}-${index}`,
            path: becameBest ? "state.bestArea" : "state.currentArea",
            kind: "value",
            intent: becameBest ? "result" : "mutation",
            label: becameBest
              ? `Best area ${area} across bars ${start}-${end}`
              : `Area ${area} across bars ${start}-${end}`,
            metadata: {
              index: resolvedIndex,
              area,
              width
            }
          }
        ]
      });

      currentResolvedIndex = null;
      currentArea = null;
      currentWidth = null;
      currentSpanStart = null;
      currentSpanEnd = null;
    }

    stackIndices.push(index);
    stackHeights.push(height);
    comparisonIndex = null;
    metrics.pushes += 1;

    recorder.push({
      phase: "Push",
      description: `Push bar ${index} at height ${height} so later bars can test whether its rectangle can extend farther to the right.`,
      explanation: {
        summary: "Record the current bar as a new candidate left boundary on the stack.",
        details:
          "Replay stores both the candidate bar index and its height so the stack rail stays readable without mapping indices back through the histogram on every frame.",
        tags: ["stack", "push"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `largest-rectangle-push-${index}`,
          path: "state.stackIndices",
          kind: "collection",
          intent: "mutation",
          label: `Push bar ${index} at height ${height}`
        }
      ]
    });
  }

  cursor = null;
  currentHeight = null;
  comparisonIndex = stackIndices[stackIndices.length - 1] ?? null;
  currentResolvedIndex = null;
  currentArea = null;
  currentWidth = null;
  currentSpanStart = null;
  currentSpanEnd = null;

  if (stackIndices.length > 0) {
    recorder.push({
      phase: "Flush",
      description:
        stackIndices.length > 0
          ? `The scan has finished, so the remaining ${stackIndices.length} candidate bar${stackIndices.length === 1 ? "" : "s"} must resolve against the terminal boundary.`
          : "The scan has finished and no candidate bars remain on the stack.",
      explanation: {
        summary: "Use the terminal boundary after the last bar to close every remaining candidate rectangle.",
        details:
          "The flush checkpoint keeps the unresolved stack visible before the remaining rectangles are popped, which makes the cleanup phase replay-safe instead of implicit.",
        tags: ["stack", "flush"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: "largest-rectangle-flush",
          path: "state.stackIndices",
          kind: "collection",
          intent: "focus",
          label: `${stackIndices.length} remaining candidate bars`
        }
      ]
    });
  }

  while (stackIndices.length > 0) {
    comparisonIndex = stackIndices[stackIndices.length - 1] ?? null;
    metrics.comparisons += 1;

    recorder.push({
      phase: "Compare",
      description: `Compare remaining bar ${comparisonIndex} at height ${comparisonIndex !== null ? heights[comparisonIndex] : "?"} against the terminal boundary after the histogram ends.`,
      explanation: {
        summary: "Compare the remaining stack top against the terminal boundary after the histogram ends.",
        details:
          "The terminal boundary is recorded as an explicit comparison checkpoint so replay can distinguish cleanup pops from in-scan pops safely.",
        tags: ["stack", "compare"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `largest-rectangle-final-compare-${comparisonIndex}`,
          path: "state.comparisonIndex",
          kind: "index",
          intent: "candidate",
          label: `Flush bar ${comparisonIndex}`,
          metadata: {
            index: comparisonIndex ?? -1
          }
        }
      ]
    });

    const resolvedIndex = stackIndices.pop()!;
    const resolvedHeight = stackHeights.pop()!;
    const leftBoundary = getPreviousHistogramIndex(stackIndices);
    const width = heights.length - leftBoundary - 1;
    const area = resolvedHeight * width;
    const start = leftBoundary + 1;
    const end = heights.length - 1;
    metrics.pops += 1;
    currentResolvedIndex = resolvedIndex;
    currentArea = area;
    currentWidth = width;
    currentSpanStart = start;
    currentSpanEnd = end;
    const becameBest = updateHistogramBest(area, resolvedHeight, start, end, best);

    recorder.push({
      phase: "Resolve",
      description: `Bar ${resolvedIndex} at height ${resolvedHeight} resolves a rectangle of area ${area} across width ${width} from bar ${start} through ${end}.`,
      explanation: {
        summary: "Pop the remaining stack top against the terminal boundary and publish its final rectangle.",
        details:
          "The cleanup resolve frame keeps the final width and area explicit, so replay never has to infer how far the last open rectangle extended after the scan ended.",
        tags: ["stack", "resolve"]
      },
      runtimeState: createRuntimeState(),
      metrics,
      highlights: [
        {
          key: `largest-rectangle-final-resolve-${resolvedIndex}`,
          path: becameBest ? "state.bestArea" : "state.currentArea",
          kind: "value",
          intent: becameBest ? "result" : "mutation",
          label: becameBest
            ? `Best area ${area} across bars ${start}-${end}`
            : `Area ${area} across bars ${start}-${end}`,
          metadata: {
            index: resolvedIndex,
            area,
            width
          }
        }
      ]
    });

    currentResolvedIndex = null;
    currentArea = null;
    currentWidth = null;
    currentSpanStart = null;
    currentSpanEnd = null;
  }

  comparisonIndex = null;

  recorder.push({
    phase: "Done",
    description:
      best.start !== null && best.end !== null
        ? `The scan is complete with best area ${best.area} across bars ${best.start}-${best.end}.`
        : "The scan is complete and no positive-area rectangle was recorded.",
    explanation: {
      summary: "Publish the largest rectangle once every bar has resolved against the monotonic stack.",
      details:
        "The terminal snapshot keeps the best span and area directly in the replay-safe state so consumers never recompute the winning rectangle from prior pop steps.",
      tags: ["result", "stack"]
    },
    runtimeState: createRuntimeState(),
    metrics,
    highlights: [
      {
        key: "largest-rectangle-done",
        path: "state.bestArea",
        kind: "value",
        intent: "result",
        label:
          best.start !== null && best.end !== null
            ? `Best area ${best.area} across bars ${best.start}-${best.end}`
            : "Best area 0"
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
    case "largest-rectangle-in-histogram":
      return buildLargestRectangleInHistogramTrace(
        input as LargestRectangleInHistogramInput
      );
  }
}
