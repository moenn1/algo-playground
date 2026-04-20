import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type DynamicProgrammingAlgorithmId = "longest-common-subsequence";

export const dynamicProgrammingAlgorithmIds: DynamicProgrammingAlgorithmId[] = [
  "longest-common-subsequence"
];

export interface DynamicProgrammingInput extends JsonObject {
  left: string;
  right: string;
}

export interface DynamicProgrammingExecutionState extends JsonObject {
  left: string;
  right: string;
  table: number[][];
  activeCell: number[];
  dependencyCells: number[][];
  currentValue: number | null;
  matching: boolean;
  resultLength: number | null;
  resultSequence: string;
  tracebackPath: number[][];
}

interface DynamicProgrammingMetricState {
  cellsComputed: number;
  matches: number;
  tracebackSteps: number;
}

interface DynamicProgrammingAlgorithmDefinition {
  id: DynamicProgrammingAlgorithmId;
  label: string;
  implementationVersion: string;
}

const dynamicProgrammingAlgorithmDefinitions: Record<
  DynamicProgrammingAlgorithmId,
  DynamicProgrammingAlgorithmDefinition
> = {
  "longest-common-subsequence": {
    id: "longest-common-subsequence",
    label: "Longest Common Subsequence",
    implementationVersion: "dp-engine-0.1.0"
  }
};

export const dynamicProgrammingMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "cellsComputed",
    label: "Cells computed",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "matches",
    label: "Character matches",
    unit: "count",
    direction: "neutral"
  },
  {
    key: "tracebackSteps",
    label: "Traceback steps",
    unit: "count",
    direction: "lower-is-better"
  }
];

export const defaultLongestCommonSubsequenceInput: DynamicProgrammingInput = {
  left: "XMJYAUZ",
  right: "MZJAWXU"
};

function cloneTable(table: number[][]): number[][] {
  return table.map((row) => row.slice());
}

function cloneDynamicProgrammingState(
  state: DynamicProgrammingExecutionState
): DynamicProgrammingExecutionState {
  return {
    left: state.left,
    right: state.right,
    table: cloneTable(state.table),
    activeCell: state.activeCell.slice(),
    dependencyCells: state.dependencyCells.map((cell) => cell.slice()),
    currentValue: state.currentValue,
    matching: state.matching,
    resultLength: state.resultLength,
    resultSequence: state.resultSequence,
    tracebackPath: state.tracebackPath.map((cell) => cell.slice())
  };
}

function createDynamicProgrammingRecorder(algorithmId: DynamicProgrammingAlgorithmId) {
  return createTraceRecorder<
    DynamicProgrammingExecutionState,
    DynamicProgrammingExecutionState,
    DynamicProgrammingMetricState
  >({
    algorithmId,
    projectState: cloneDynamicProgrammingState,
    projectMetrics(metrics) {
      return {
        cellsComputed: metrics.cellsComputed,
        matches: metrics.matches,
        tracebackSteps: metrics.tracebackSteps
      };
    }
  });
}

function normalizeDynamicProgrammingInput(candidate: unknown): DynamicProgrammingInput {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Dynamic-programming input must be an object with left and right strings.");
  }

  const value = candidate as {
    left?: unknown;
    right?: unknown;
  };

  if (typeof value.left !== "string" || value.left.length === 0) {
    throw new Error("Dynamic-programming input left must be a non-empty string.");
  }

  if (typeof value.right !== "string" || value.right.length === 0) {
    throw new Error("Dynamic-programming input right must be a non-empty string.");
  }

  if (value.left.length > 12 || value.right.length > 12) {
    throw new Error("Dynamic-programming input strings must be 12 characters or fewer.");
  }

  return {
    left: value.left,
    right: value.right
  };
}

export function parseDynamicProgrammingInputText(inputText: string): DynamicProgrammingInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(inputText);
  } catch {
    throw new Error("Dynamic-programming input must be valid JSON.");
  }

  return normalizeDynamicProgrammingInput(parsed);
}

export function serializeDynamicProgrammingInput(input: DynamicProgrammingInput): string {
  return JSON.stringify(
    {
      left: input.left,
      right: input.right
    },
    null,
    2
  );
}

function buildDynamicProgrammingEnvelope(
  definition: DynamicProgrammingAlgorithmDefinition,
  input: DynamicProgrammingInput,
  recorder: ReturnType<typeof createDynamicProgrammingRecorder>
): TraceEnvelope<DynamicProgrammingExecutionState> {
  return createTraceEnvelope({
    algorithm: {
      id: definition.id,
      label: definition.label,
      domain: "dynamic-programming",
      implementationVersion: definition.implementationVersion
    },
    input,
    steps: recorder.getSteps(),
    metricDefinitions: dynamicProgrammingMetricDefinitions,
    comparisonMetricKeys: ["cellsComputed", "matches", "tracebackSteps"]
  });
}

function createTable(rowCount: number, columnCount: number): number[][] {
  return Array.from({ length: rowCount }, () => Array.from({ length: columnCount }, () => 0));
}

export function buildLongestCommonSubsequenceTrace(
  input: DynamicProgrammingInput
): TraceEnvelope<DynamicProgrammingExecutionState> {
  const definition = dynamicProgrammingAlgorithmDefinitions["longest-common-subsequence"];
  const normalizedInput = normalizeDynamicProgrammingInput(input);
  const leftChars = normalizedInput.left.split("");
  const rightChars = normalizedInput.right.split("");
  const table = createTable(leftChars.length + 1, rightChars.length + 1);
  const recorder = createDynamicProgrammingRecorder(definition.id);
  const metrics: DynamicProgrammingMetricState = {
    cellsComputed: 0,
    matches: 0,
    tracebackSteps: 0
  };

  const pushState = (state: DynamicProgrammingExecutionState) => state;

  recorder.push({
    phase: "Initialization",
    description:
      "The replay begins with the empty LCS table so any timeline jump can restore the zero-filled boundary conditions directly.",
    explanation: {
      summary: "Seed the dynamic-programming table before computing any interior cells.",
      details:
        "The first row and first column stay at zero, which makes the recurrence deterministic for every later cell.",
      tags: ["snapshot", "table"]
    },
    runtimeState: pushState({
      left: normalizedInput.left,
      right: normalizedInput.right,
      table,
      activeCell: [],
      dependencyCells: [],
      currentValue: null,
      matching: false,
      resultLength: null,
      resultSequence: "",
      tracebackPath: []
    }),
    metrics,
    highlights: [
      {
        key: "dp-table-seeded",
        path: "state.table",
        kind: "collection",
        intent: "focus",
        label: `Seed ${(leftChars.length + 1).toString()} x ${(rightChars.length + 1).toString()} table`
      }
    ]
  });

  for (let row = 1; row <= leftChars.length; row += 1) {
    for (let column = 1; column <= rightChars.length; column += 1) {
      const leftCharacter = leftChars[row - 1]!;
      const rightCharacter = rightChars[column - 1]!;
      const matching = leftCharacter === rightCharacter;
      let description: string;
      let details: string;

      metrics.cellsComputed += 1;

      if (matching) {
        table[row]![column] = table[row - 1]![column - 1]! + 1;
        metrics.matches += 1;
        description = `Characters "${leftCharacter}" and "${rightCharacter}" match at row ${row}, column ${column}, so the diagonal subsequence extends to ${table[row]![column]}.`;
        details =
          "Matching characters add one to the diagonal predecessor, which grows the subsequence without recomputing earlier rows or columns.";
      } else {
        const fromAbove = table[row - 1]![column]!;
        const fromLeft = table[row]![column - 1]!;
        const chooseAbove = fromAbove >= fromLeft;

        table[row]![column] = chooseAbove ? fromAbove : fromLeft;
        description = chooseAbove
          ? fromAbove === fromLeft
            ? `Characters "${leftCharacter}" and "${rightCharacter}" differ, so the table carries ${fromAbove} from above at row ${row}, column ${column} using the deterministic up-first tie break.`
            : `Characters "${leftCharacter}" and "${rightCharacter}" differ, so the table carries ${fromAbove} from above at row ${row}, column ${column}.`
          : `Characters "${leftCharacter}" and "${rightCharacter}" differ, so the table carries ${fromLeft} from the left at row ${row}, column ${column}.`;
        details =
          "When characters do not match, the runtime chooses the longer subsequence already known from the top or left neighbor.";
      }

      recorder.push({
        phase: matching ? "Match" : "Carry",
        description,
        explanation: {
          summary: `Finalize table cell [${row}, ${column}] as ${table[row]![column]}.`,
          details,
          tags: ["table", matching ? "match" : "recurrence"]
        },
        runtimeState: pushState({
          left: normalizedInput.left,
          right: normalizedInput.right,
          table,
          activeCell: [row, column],
          dependencyCells: matching
            ? [[row - 1, column - 1]]
            : [
                [row - 1, column],
                [row, column - 1]
              ],
          currentValue: table[row]![column]!,
          matching,
          resultLength: null,
          resultSequence: "",
          tracebackPath: []
        }),
        metrics,
        highlights: [
          {
            key: `dp-cell-${row}-${column}`,
            path: "state.activeCell",
            kind: "index",
            intent: matching ? "mutation" : "candidate",
            label: `Cell [${row}, ${column}]`,
            metadata: {
              row,
              column
            }
          },
          {
            key: `dp-deps-${row}-${column}`,
            path: "state.dependencyCells",
            kind: "collection",
            intent: "focus",
            label: matching ? "Diagonal dependency" : "Top and left dependencies"
          }
        ]
      });
    }
  }

  const resultLength = table[leftChars.length]![rightChars.length]!;

  recorder.push({
    phase: "Table Complete",
    description: `The full table is now populated, and the terminal LCS length is ${resultLength}.`,
    explanation: {
      summary: "Lock the completed DP table before reconstructing the subsequence.",
      details:
        "This checkpoint separates fill-time recurrence work from traceback so replay can jump to either phase directly.",
      tags: ["checkpoint", "table"]
    },
    runtimeState: pushState({
      left: normalizedInput.left,
      right: normalizedInput.right,
      table,
      activeCell: [],
      dependencyCells: [],
      currentValue: null,
      matching: false,
      resultLength,
      resultSequence: "",
      tracebackPath: []
    }),
    metrics,
    highlights: [
      {
        key: "dp-table-complete",
        path: "state.table",
        kind: "collection",
        intent: "focus",
        label: `Completed table with LCS length ${resultLength}`
      }
    ]
  });

  let row = leftChars.length;
  let column = rightChars.length;
  const resultCharacters: string[] = [];
  let tracebackPath: number[][] = [];

  while (row > 0 && column > 0) {
    tracebackPath = [...tracebackPath, [row, column]];
    const leftCharacter = leftChars[row - 1]!;
    const rightCharacter = rightChars[column - 1]!;

    if (leftCharacter === rightCharacter) {
      resultCharacters.unshift(leftCharacter);
      metrics.tracebackSteps += 1;

      recorder.push({
        phase: "Traceback Match",
        description: `Traceback keeps "${leftCharacter}" because row ${row} and column ${column} align on a matching character.`,
        explanation: {
          summary: `Append "${leftCharacter}" and move diagonally to continue traceback.`,
          details:
            "A matching traceback step confirms that this cell contributed directly to the final subsequence.",
          tags: ["traceback", "match"]
        },
        runtimeState: pushState({
          left: normalizedInput.left,
          right: normalizedInput.right,
          table,
          activeCell: [row, column],
          dependencyCells: [[row - 1, column - 1]],
          currentValue: table[row]![column]!,
          matching: true,
          resultLength,
          resultSequence: resultCharacters.join(""),
          tracebackPath
        }),
        metrics,
        highlights: [
          {
            key: `dp-traceback-match-${row}-${column}`,
            path: "state.tracebackPath",
            kind: "collection",
            intent: "result",
            label: `Traceback path through [${row}, ${column}]`
          }
        ]
      });

      row -= 1;
      column -= 1;
      continue;
    }

    const fromAbove = table[row - 1]![column]!;
    const fromLeft = table[row]![column - 1]!;
    const moveUp = fromAbove >= fromLeft;
    metrics.tracebackSteps += 1;

    recorder.push({
      phase: moveUp ? "Traceback Up" : "Traceback Left",
      description: moveUp
        ? fromAbove === fromLeft
          ? `Traceback moves up from [${row}, ${column}] because both predecessor lengths tie at ${fromAbove}, and the runtime uses the deterministic up-first rule.`
          : `Traceback moves up from [${row}, ${column}] because the top predecessor ${fromAbove} dominates the left predecessor ${fromLeft}.`
        : `Traceback moves left from [${row}, ${column}] because the left predecessor ${fromLeft} dominates the top predecessor ${fromAbove}.`,
      explanation: {
        summary: "Choose the predecessor that preserves the known LCS length.",
        details:
          "Non-matching traceback steps follow the larger neighboring value so the recovered sequence remains consistent with the completed table.",
        tags: ["traceback", moveUp ? "up" : "left"]
      },
      runtimeState: pushState({
        left: normalizedInput.left,
        right: normalizedInput.right,
        table,
        activeCell: [row, column],
        dependencyCells: [
          [row - 1, column],
          [row, column - 1]
        ],
        currentValue: table[row]![column]!,
        matching: false,
        resultLength,
        resultSequence: resultCharacters.join(""),
        tracebackPath
      }),
      metrics,
      highlights: [
        {
          key: `dp-traceback-step-${row}-${column}`,
          path: "state.tracebackPath",
          kind: "collection",
          intent: "focus",
          label: `Traceback through [${row}, ${column}]`
        }
      ]
    });

    if (moveUp) {
      row -= 1;
    } else {
      column -= 1;
    }
  }

  const resultSequence = resultCharacters.join("");

  recorder.push({
    phase: "Done",
    description: `The replay resolves the longest common subsequence as "${resultSequence}" with length ${resultLength}.`,
    explanation: {
      summary: "Publish the recovered subsequence and the full traceback footprint.",
      details:
        "The terminal frame keeps both the completed table and the reconstructed sequence so replay consumers never derive the answer from scratch.",
      tags: ["result", "traceback"]
    },
    runtimeState: pushState({
      left: normalizedInput.left,
      right: normalizedInput.right,
      table,
      activeCell: [],
      dependencyCells: [],
      currentValue: null,
      matching: false,
      resultLength,
      resultSequence,
      tracebackPath
    }),
    metrics,
    highlights: [
      {
        key: "dp-result-sequence",
        path: "state.resultSequence",
        kind: "value",
        intent: "result",
        label: `LCS "${resultSequence}"`
      }
    ]
  });

  return buildDynamicProgrammingEnvelope(definition, normalizedInput, recorder);
}

export function buildDynamicProgrammingTrace(
  algorithmId: DynamicProgrammingAlgorithmId,
  input: DynamicProgrammingInput
): TraceEnvelope<DynamicProgrammingExecutionState> {
  switch (algorithmId) {
    case "longest-common-subsequence":
      return buildLongestCommonSubsequenceTrace(input);
  }
}
