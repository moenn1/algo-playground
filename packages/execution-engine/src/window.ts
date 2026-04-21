import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type WindowAlgorithmId =
  | "minimum-size-subarray-sum"
  | "longest-substring-without-repeating-characters";

export const windowAlgorithmIds: WindowAlgorithmId[] = [
  "minimum-size-subarray-sum",
  "longest-substring-without-repeating-characters"
];

export interface MinimumSizeSubarrayWindowInput extends JsonObject {
  array: number[];
  target: number;
}

export interface LongestSubstringWindowInput extends JsonObject {
  text: string;
}

export type WindowInput = MinimumSizeSubarrayWindowInput | LongestSubstringWindowInput;

export interface WindowCharacterEntry extends JsonObject {
  char: string;
  index: number;
}

export interface WindowLedgerEntry extends JsonObject {
  char: string;
  count: number;
  latestIndex: number;
}

export interface MinimumSizeSubarrayExecutionState extends JsonObject {
  kind: "minimum-size-subarray-sum";
  array: number[];
  target: number;
  left: number | null;
  right: number | null;
  activeSum: number;
  bestStart: number | null;
  bestEnd: number | null;
  bestLength: number | null;
  candidateSatisfied: boolean;
}

export interface LongestSubstringExecutionState extends JsonObject {
  kind: "longest-substring-without-repeating-characters";
  text: string;
  left: number | null;
  right: number | null;
  currentIndex: number | null;
  currentChar: string | null;
  activeSubstring: string;
  activeEntries: WindowCharacterEntry[];
  characterLedger: WindowLedgerEntry[];
  duplicateChar: string | null;
  duplicateIndex: number | null;
  bestStart: number | null;
  bestEnd: number | null;
  bestLength: number | null;
  bestSubstring: string;
}

export type WindowExecutionState =
  | MinimumSizeSubarrayExecutionState
  | LongestSubstringExecutionState;

interface WindowMetricState {
  expansions: number;
  shrinks: number;
  bestUpdates: number;
}

interface WindowAlgorithmDefinition {
  id: WindowAlgorithmId;
  label: string;
  implementationVersion: string;
}

const windowAlgorithmDefinitions: Record<WindowAlgorithmId, WindowAlgorithmDefinition> = {
  "minimum-size-subarray-sum": {
    id: "minimum-size-subarray-sum",
    label: "Minimum Size Subarray Sum",
    implementationVersion: "window-engine-0.2.0"
  },
  "longest-substring-without-repeating-characters": {
    id: "longest-substring-without-repeating-characters",
    label: "Longest Substring Without Repeating Characters",
    implementationVersion: "window-engine-0.2.0"
  }
};

export const windowMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "expansions",
    label: "Window expansions",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "shrinks",
    label: "Window shrinks",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "bestUpdates",
    label: "Best-window updates",
    unit: "count",
    direction: "lower-is-better"
  }
];

export const defaultMinimumSizeSubarrayInput: MinimumSizeSubarrayWindowInput = {
  array: [2, 3, 1, 2, 4, 3],
  target: 7
};

export const defaultLongestSubstringInput: LongestSubstringWindowInput = {
  text: "abcabcbb"
};

function splitWindowText(text: string): string[] {
  return Array.from(text);
}

function cloneWindowCharacterEntries(entries: WindowCharacterEntry[]): WindowCharacterEntry[] {
  return entries.map((entry) => ({
    char: entry.char,
    index: entry.index
  }));
}

function cloneWindowLedgerEntries(entries: WindowLedgerEntry[]): WindowLedgerEntry[] {
  return entries.map((entry) => ({
    char: entry.char,
    count: entry.count,
    latestIndex: entry.latestIndex
  }));
}

function cloneWindowState(state: WindowExecutionState): WindowExecutionState {
  if (state.kind === "minimum-size-subarray-sum") {
    return {
      kind: state.kind,
      array: state.array.slice(),
      target: state.target,
      left: state.left,
      right: state.right,
      activeSum: state.activeSum,
      bestStart: state.bestStart,
      bestEnd: state.bestEnd,
      bestLength: state.bestLength,
      candidateSatisfied: state.candidateSatisfied
    };
  }

  return {
    kind: state.kind,
    text: state.text,
    left: state.left,
    right: state.right,
    currentIndex: state.currentIndex,
    currentChar: state.currentChar,
    activeSubstring: state.activeSubstring,
    activeEntries: cloneWindowCharacterEntries(state.activeEntries),
    characterLedger: cloneWindowLedgerEntries(state.characterLedger),
    duplicateChar: state.duplicateChar,
    duplicateIndex: state.duplicateIndex,
    bestStart: state.bestStart,
    bestEnd: state.bestEnd,
    bestLength: state.bestLength,
    bestSubstring: state.bestSubstring
  };
}

function createWindowRecorder(algorithmId: WindowAlgorithmId) {
  return createTraceRecorder<WindowExecutionState, WindowExecutionState, WindowMetricState>({
    algorithmId,
    projectState: cloneWindowState,
    projectMetrics(metrics) {
      return {
        expansions: metrics.expansions,
        shrinks: metrics.shrinks,
        bestUpdates: metrics.bestUpdates
      };
    }
  });
}

function normalizeMinimumSizeSubarrayInput(
  candidate: unknown
): MinimumSizeSubarrayWindowInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Window input must be an object with array and target.");
  }

  const value = candidate as {
    array?: unknown;
    target?: unknown;
  };

  if (!Array.isArray(value.array) || value.array.length < 2) {
    throw new Error("Window input must include an array with at least two positive integers.");
  }

  if (value.array.length > 32) {
    throw new Error("Window input arrays must contain 32 integers or fewer.");
  }

  const array = value.array.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry) || entry <= 0) {
      throw new Error(`array[${index}] must be a positive integer.`);
    }

    return entry;
  });

  if (typeof value.target !== "number" || !Number.isInteger(value.target) || value.target <= 0) {
    throw new Error("Window input target must be a positive integer.");
  }

  return {
    array,
    target: value.target
  };
}

function normalizeLongestSubstringInput(candidate: unknown): LongestSubstringWindowInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Window input must be an object with text.");
  }

  const value = candidate as {
    text?: unknown;
  };

  if (typeof value.text !== "string") {
    throw new Error("Window input text must be a string.");
  }

  const characters = splitWindowText(value.text);

  if (characters.length < 1) {
    throw new Error("Window input text must contain at least one character.");
  }

  if (characters.length > 32) {
    throw new Error("Window input text must contain 32 characters or fewer.");
  }

  return {
    text: value.text
  };
}

function normalizeWindowInput(
  candidate: unknown,
  algorithmId: WindowAlgorithmId
): WindowInput {
  switch (algorithmId) {
    case "minimum-size-subarray-sum":
      return normalizeMinimumSizeSubarrayInput(candidate);
    case "longest-substring-without-repeating-characters":
      return normalizeLongestSubstringInput(candidate);
  }
}

export function parseWindowInputText(
  inputText: string,
  algorithmId: WindowAlgorithmId
): WindowInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(inputText);
  } catch {
    throw new Error("Window input must be valid JSON.");
  }

  return normalizeWindowInput(parsed, algorithmId);
}

export function serializeWindowInput(input: WindowInput): string {
  if ("text" in input) {
    return JSON.stringify(
      {
        text: input.text
      },
      null,
      2
    );
  }

  return JSON.stringify(
    {
      array: input.array,
      target: input.target
    },
    null,
    2
  );
}

function buildWindowEnvelope(
  definition: WindowAlgorithmDefinition,
  input: WindowInput,
  recorder: ReturnType<typeof createWindowRecorder>
): TraceEnvelope<WindowExecutionState> {
  return createTraceEnvelope({
    algorithm: {
      id: definition.id,
      label: definition.label,
      domain: "window",
      implementationVersion: definition.implementationVersion
    },
    input,
    steps: recorder.getSteps(),
    metricDefinitions: windowMetricDefinitions,
    comparisonMetricKeys: ["expansions", "shrinks", "bestUpdates"]
  });
}

export function buildMinimumSizeSubarrayTrace(
  input: MinimumSizeSubarrayWindowInput
): TraceEnvelope<WindowExecutionState> {
  const definition = windowAlgorithmDefinitions["minimum-size-subarray-sum"];
  const normalizedInput = normalizeMinimumSizeSubarrayInput(input);
  const values = normalizedInput.array.slice();
  const recorder = createWindowRecorder(definition.id);
  const metrics: WindowMetricState = {
    expansions: 0,
    shrinks: 0,
    bestUpdates: 0
  };
  let left = 0;
  let activeSum = 0;
  let bestStart: number | null = null;
  let bestEnd: number | null = null;
  let bestLength: number | null = null;

  const createState = (
    right: number | null,
    candidateSatisfied: boolean
  ): MinimumSizeSubarrayExecutionState => ({
    kind: "minimum-size-subarray-sum",
    array: values,
    target: normalizedInput.target,
    left: right !== null && right >= left ? left : null,
    right: right !== null && right >= left ? right : null,
    activeSum,
    bestStart,
    bestEnd,
    bestLength,
    candidateSatisfied
  });

  recorder.push({
    phase: "Initialization",
    description:
      "The replay begins before the first expansion, with an empty active window and no qualifying segment recorded yet.",
    explanation: {
      summary: "Seed the array, target, and empty window before any expansion occurs.",
      details:
        "The timeline stores an explicit empty-window frame so later scrubs never have to infer the pre-scan state.",
      tags: ["snapshot", "input"]
    },
    runtimeState: createState(null, false),
    metrics,
    highlights: [
      {
        key: "window-target-initial",
        path: "state.target",
        kind: "value",
        intent: "focus",
        label: `Target sum ${normalizedInput.target}`
      }
    ]
  });

  for (let right = 0; right < values.length; right += 1) {
    activeSum += values[right]!;
    metrics.expansions += 1;

    recorder.push({
      phase: "Expand",
      description: `Extend the window through lane ${right}, raising the active sum to ${activeSum}.`,
      explanation: {
        summary: "Grow the right edge and record the new active sum.",
        details:
          "Sliding-window replay depends on explicit expansion checkpoints so the active interval and aggregate sum always restore together.",
        tags: ["window", "expansion"]
      },
      runtimeState: createState(right, activeSum >= normalizedInput.target),
      metrics,
      highlights: [
        {
          key: `window-active-${right}`,
          path: "state.activeSum",
          kind: "range",
          intent: activeSum >= normalizedInput.target ? "candidate" : "focus",
          label: `Active window ${left} through ${right}`,
          metadata: {
            start: left,
            end: right,
            sum: activeSum
          }
        }
      ]
    });

    while (activeSum >= normalizedInput.target) {
      const currentLength = right - left + 1;

      recorder.push({
        phase: "Candidate",
        description: `The current window reaches target ${normalizedInput.target}, so lane range ${left} through ${right} becomes a qualifying candidate.`,
        explanation: {
          summary: "Mark the current interval as a valid candidate before shrinking it.",
          details:
            "Recording the qualifying window separately keeps the candidate sum and best-window comparison visible in replay.",
          tags: ["window", "candidate"]
        },
        runtimeState: createState(right, true),
        metrics,
        highlights: [
          {
            key: `window-candidate-${left}-${right}`,
            path: "state.activeSum",
            kind: "range",
            intent: "candidate",
            label: `Candidate window ${left} through ${right}`,
            metadata: {
              start: left,
              end: right,
              sum: activeSum
            }
          }
        ]
      });

      if (bestLength === null || currentLength < bestLength) {
        bestStart = left;
        bestEnd = right;
        bestLength = currentLength;
        metrics.bestUpdates += 1;

        recorder.push({
          phase: "Best Update",
          description: `Window ${left} through ${right} is the shortest qualifying segment so far at length ${currentLength}.`,
          explanation: {
            summary: "Publish a new best qualifying window.",
            details:
              "The best-window checkpoint stores both the active interval and the best-so-far bounds so replay can compare them directly.",
            tags: ["result", "candidate"]
          },
          runtimeState: createState(right, true),
          metrics,
          highlights: [
            {
              key: `window-best-${left}-${right}`,
              path: "state.bestLength",
              kind: "range",
              intent: "result",
              label: `Best window ${left} through ${right}`,
              metadata: {
                start: left,
                end: right,
                length: currentLength
              }
            }
          ]
        });
      }

      const outgoing = values[left]!;

      activeSum -= outgoing;
      left += 1;
      metrics.shrinks += 1;

      recorder.push({
        phase: "Shrink",
        description: `Drop lane ${left - 1} from the left edge, leaving active sum ${activeSum}.`,
        explanation: {
          summary: "Contract the left edge to search for a shorter qualifying interval.",
          details:
            "Positive inputs guarantee that shrinking only decreases the active sum, which keeps the minimum-window search deterministic.",
          tags: ["window", "shrink"]
        },
        runtimeState: createState(right, activeSum >= normalizedInput.target),
        metrics,
        highlights: [
          {
            key: `window-shrink-${left - 1}-${right}`,
            path: "state.left",
            kind: "range",
            intent: "mutation",
            label:
              left <= right
                ? `Active window ${left} through ${right}`
                : "Window collapsed after shrink",
            metadata:
              left <= right
                ? {
                    start: left,
                    end: right,
                    sum: activeSum
                  }
                : {
                    start: left - 1,
                    end: right
                  }
          }
        ]
      });
    }
  }

  recorder.push({
    phase: bestLength === null ? "No Solution" : "Done",
    description:
      bestLength === null
        ? `No contiguous window reaches target ${normalizedInput.target}; the replay ends with no qualifying segment.`
        : `The best qualifying window spans lanes ${bestStart} through ${bestEnd} with length ${bestLength}.`,
    explanation: {
      summary:
        bestLength === null
          ? "Publish the terminal state with no qualifying window."
          : "Publish the shortest qualifying window as the terminal replay frame.",
      details:
        bestLength === null
          ? "The timeline stores the failed search explicitly so consumers do not infer absence from missing best-window bounds."
          : "The terminal frame keeps the best bounds, active sum, and final metrics in one replay-safe snapshot.",
      tags: ["result", bestLength === null ? "exhausted" : "window"]
    },
    runtimeState: createState(values.length - 1, false),
    metrics,
    highlights: [
      {
        key: bestLength === null ? "window-no-solution" : "window-final-best",
        path: bestLength === null ? "state.target" : "state.bestLength",
        kind: bestLength === null ? "value" : "range",
        intent: "result",
        label:
          bestLength === null
            ? `No window reached target ${normalizedInput.target}`
            : `Shortest window ${bestStart} through ${bestEnd}`
      }
    ]
  });

  return buildWindowEnvelope(definition, normalizedInput, recorder);
}

export function buildLongestSubstringWithoutRepeatingCharactersTrace(
  input: LongestSubstringWindowInput
): TraceEnvelope<WindowExecutionState> {
  const definition =
    windowAlgorithmDefinitions["longest-substring-without-repeating-characters"];
  const normalizedInput = normalizeLongestSubstringInput(input);
  const characters = splitWindowText(normalizedInput.text);
  const recorder = createWindowRecorder(definition.id);
  const metrics: WindowMetricState = {
    expansions: 0,
    shrinks: 0,
    bestUpdates: 0
  };
  let left = 0;
  let bestStart: number | null = null;
  let bestEnd: number | null = null;
  let bestLength: number | null = null;
  let duplicateChar: string | null = null;
  let duplicateIndex: number | null = null;
  const windowIndicesByChar = new Map<string, number[]>();

  const createCharacterLedger = (): WindowLedgerEntry[] =>
    Array.from(windowIndicesByChar.entries())
      .map(([char, indices]) => ({
        char,
        count: indices.length,
        latestIndex: indices[indices.length - 1]!
      }))
      .sort((leftEntry, rightEntry) => leftEntry.latestIndex - rightEntry.latestIndex);

  const createActiveEntries = (right: number | null): WindowCharacterEntry[] => {
    if (right === null || right < left) {
      return [];
    }

    return characters.slice(left, right + 1).map((char, offset) => ({
      char,
      index: left + offset
    }));
  };

  const createState = (
    currentIndex: number | null,
    currentChar: string | null,
    right: number | null
  ): LongestSubstringExecutionState => {
    const activeEntries = createActiveEntries(right);

    return {
      kind: "longest-substring-without-repeating-characters",
      text: normalizedInput.text,
      left: right !== null && right >= left ? left : null,
      right: right !== null && right >= left ? right : null,
      currentIndex,
      currentChar,
      activeSubstring: activeEntries.map((entry) => entry.char).join(""),
      activeEntries,
      characterLedger: createCharacterLedger(),
      duplicateChar,
      duplicateIndex,
      bestStart,
      bestEnd,
      bestLength,
      bestSubstring:
        bestStart !== null && bestEnd !== null
          ? characters.slice(bestStart, bestEnd + 1).join("")
          : ""
    };
  };

  recorder.push({
    phase: "Initialization",
    description:
      "The replay begins before the first character enters the window, with no duplicate pressure and no best substring recorded yet.",
    explanation: {
      summary: "Seed the string and empty window before the first expansion occurs.",
      details:
        "The empty-window frame makes the later substring growth and duplicate-driven contractions deterministic during replay scrubbing.",
      tags: ["snapshot", "input"]
    },
    runtimeState: createState(null, null, null),
    metrics,
    highlights: [
      {
        key: "window-text-initial",
        path: "state.text",
        kind: "collection",
        intent: "focus",
        label: `${characters.length} characters queued`
      }
    ]
  });

  for (let right = 0; right < characters.length; right += 1) {
    const currentChar = characters[right]!;
    const existingIndices = windowIndicesByChar.get(currentChar) ?? [];

    duplicateChar = existingIndices.length > 0 ? currentChar : null;
    duplicateIndex = existingIndices.length > 0 ? existingIndices[0]! : null;
    existingIndices.push(right);
    windowIndicesByChar.set(currentChar, existingIndices);
    metrics.expansions += 1;

    recorder.push({
      phase: "Expand",
      description: `Extend the window through character "${currentChar}" at index ${right}.`,
      explanation: {
        summary: "Grow the right edge and record the active substring after the new character enters.",
        details:
          "Each expansion stores the active substring and duplicate signal together so replay can explain whether the new character keeps the window valid.",
        tags: ["window", "expansion"]
      },
      runtimeState: createState(right, currentChar, right),
      metrics,
      highlights: [
        {
          key: `window-expand-char-${right}`,
          path: "state.activeSubstring",
          kind: "range",
          intent: duplicateChar ? "candidate" : "focus",
          label: `Window ${left} through ${right}`,
          metadata: {
            start: left,
            end: right,
            substring: characters.slice(left, right + 1).join("")
          }
        }
      ]
    });

    if (duplicateChar) {
      recorder.push({
        phase: "Repeat",
        description: `Character "${currentChar}" repeats within the active window, so the left edge must move past index ${duplicateIndex}.`,
        explanation: {
          summary: "Publish the duplicate before the replay starts shrinking the window.",
          details:
            "The duplicate checkpoint preserves the reason for contraction instead of hiding it inside the first shrink frame.",
          tags: ["window", "duplicate"]
        },
        runtimeState: createState(right, currentChar, right),
        metrics,
        highlights: [
          {
            key: `window-repeat-${right}`,
            path: "state.duplicateChar",
            kind: "value",
            intent: "candidate",
            label: `Repeat "${currentChar}" at ${duplicateIndex}`
          }
        ]
      });
    }

    while ((windowIndicesByChar.get(currentChar)?.length ?? 0) > 1) {
      const outgoingChar = characters[left]!;
      const outgoingIndices = windowIndicesByChar.get(outgoingChar)!;

      outgoingIndices.shift();
      if (outgoingIndices.length === 0) {
        windowIndicesByChar.delete(outgoingChar);
      }

      left += 1;
      metrics.shrinks += 1;

      if ((windowIndicesByChar.get(currentChar)?.length ?? 0) <= 1) {
        duplicateChar = null;
        duplicateIndex = null;
      } else {
        duplicateChar = currentChar;
        duplicateIndex = windowIndicesByChar.get(currentChar)![0]!;
      }

      recorder.push({
        phase: "Shrink",
        description: `Drop character "${outgoingChar}" from index ${left - 1} so the window can recover uniqueness.`,
        explanation: {
          summary: "Contract the left edge until the repeated character becomes unique again inside the window.",
          details:
            "Explicit shrink frames make the duplicate resolution process inspectable instead of jumping the left pointer in one hidden move.",
          tags: ["window", "shrink"]
        },
        runtimeState: createState(right, currentChar, right),
        metrics,
        highlights: [
          {
            key: `window-shrink-char-${left - 1}-${right}`,
            path: "state.left",
            kind: "range",
            intent: "mutation",
            label:
              left <= right
                ? `Active substring ${left} through ${right}`
                : "Window collapsed after duplicate resolution",
            metadata:
              left <= right
                ? {
                    start: left,
                    end: right,
                    substring: characters.slice(left, right + 1).join("")
                  }
                : {
                    start: left - 1,
                    end: right
                  }
          }
        ]
      });
    }

    const currentLength = right - left + 1;

    if (bestLength === null || currentLength > bestLength) {
      bestStart = left;
      bestEnd = right;
      bestLength = currentLength;
      metrics.bestUpdates += 1;

      recorder.push({
        phase: "Best Update",
        description: `Substring "${characters.slice(left, right + 1).join("")}" is the longest unique window so far at length ${currentLength}.`,
        explanation: {
          summary: "Publish a new best unique substring after the window stabilizes.",
          details:
            "The best-window checkpoint stores both the current bounds and the winning substring so replay can reopen the exact answer without rescanning characters.",
          tags: ["result", "candidate"]
        },
        runtimeState: createState(right, currentChar, right),
        metrics,
        highlights: [
          {
            key: `window-best-substring-${left}-${right}`,
            path: "state.bestSubstring",
            kind: "range",
            intent: "result",
            label: `Best unique substring ${left} through ${right}`,
            metadata: {
              start: left,
              end: right,
              substring: characters.slice(left, right + 1).join("")
            }
          }
        ]
      });
    }
  }

  recorder.push({
    phase: "Done",
    description: `The replay ends with "${characters.slice(bestStart!, bestEnd! + 1).join("")}" as the longest substring without repeating characters at length ${bestLength}.`,
    explanation: {
      summary: "Publish the final unique-substring answer as the terminal replay frame.",
      details:
        "The terminal frame keeps the best bounds, best substring, and character ledger together so the final answer can reopen without replay-time recomputation.",
      tags: ["result", "window"]
    },
    runtimeState: createState(null, null, characters.length - 1),
    metrics,
    highlights: [
      {
        key: "window-final-substring",
        path: "state.bestSubstring",
        kind: "range",
        intent: "result",
        label: `Longest unique substring length ${bestLength}`
      }
    ]
  });

  return buildWindowEnvelope(definition, normalizedInput, recorder);
}

export function buildWindowTrace(
  algorithmId: WindowAlgorithmId,
  input: WindowInput
): TraceEnvelope<WindowExecutionState> {
  switch (algorithmId) {
    case "minimum-size-subarray-sum":
      return buildMinimumSizeSubarrayTrace(input as MinimumSizeSubarrayWindowInput);
    case "longest-substring-without-repeating-characters":
      return buildLongestSubstringWithoutRepeatingCharactersTrace(
        input as LongestSubstringWindowInput
      );
  }
}
