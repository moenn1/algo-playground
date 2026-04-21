import type { AlgorithmDomain, JsonObject, JsonValue } from "@tracedeck/trace-core";

import { HttpError } from "../lib/http.js";

import type {
  DynamicProgrammingInputPayload,
  GraphInputPayload,
  InputPresetListQuery,
  InputPresetSummary,
  ResolveInputPresetInput,
  ResolvedInputPreset,
  SearchInputPayload,
  StackInputPayload,
  SupportedAlgorithmDescriptor,
  SupportedAlgorithmId,
  ValidateCustomInputInput,
  ValidatedCustomInput,
  WindowInputPayload
} from "./types.js";

const supportedAlgorithms: Record<SupportedAlgorithmId, SupportedAlgorithmDescriptor> = {
  "bubble-sort": {
    id: "bubble-sort",
    label: "Bubble Sort",
    domain: "sorting"
  },
  "selection-sort": {
    id: "selection-sort",
    label: "Selection Sort",
    domain: "sorting"
  },
  "quick-sort": {
    id: "quick-sort",
    label: "Quick Sort",
    domain: "sorting"
  },
  "merge-sort": {
    id: "merge-sort",
    label: "Merge Sort",
    domain: "sorting"
  },
  "binary-search": {
    id: "binary-search",
    label: "Binary Search",
    domain: "search"
  },
  "minimum-size-subarray-sum": {
    id: "minimum-size-subarray-sum",
    label: "Minimum Size Subarray Sum",
    domain: "window"
  },
  "longest-common-subsequence": {
    id: "longest-common-subsequence",
    label: "Longest Common Subsequence",
    domain: "dynamic-programming"
  },
  "valid-parentheses": {
    id: "valid-parentheses",
    label: "Valid Parentheses",
    domain: "stack"
  },
  bfs: {
    id: "bfs",
    label: "Breadth-First Search",
    domain: "graph"
  },
  dijkstra: {
    id: "dijkstra",
    label: "Dijkstra",
    domain: "graph"
  }
};

const sortingAlgorithms = [
  supportedAlgorithms["bubble-sort"],
  supportedAlgorithms["selection-sort"],
  supportedAlgorithms["quick-sort"],
  supportedAlgorithms["merge-sort"]
] as const;
const searchAlgorithms = [supportedAlgorithms["binary-search"]] as const;
const windowAlgorithms = [supportedAlgorithms["minimum-size-subarray-sum"]] as const;
const dynamicProgrammingAlgorithms = [supportedAlgorithms["longest-common-subsequence"]] as const;
const stackAlgorithms = [supportedAlgorithms["valid-parentheses"]] as const;
const graphAlgorithms = [supportedAlgorithms.bfs, supportedAlgorithms.dijkstra] as const;
const defaultSortingValues = [18, 7, 12, 3, 15, 4, 11];
const defaultSearchInput: SearchInputPayload = {
  array: [2, 5, 8, 12, 16, 23, 38, 56, 72],
  target: 23
};
const defaultWindowInput: WindowInputPayload = {
  array: [2, 3, 1, 2, 4, 3],
  target: 7
};
const defaultDynamicProgrammingInput: DynamicProgrammingInputPayload = {
  left: "XMJYAUZ",
  right: "MZJAWXU"
};
const defaultStackInput: StackInputPayload = {
  expression: "({[]})[]"
};
const defaultGraphInput: GraphInputPayload = {
  nodes: ["A", "B", "C", "D", "E", "F"],
  edges: [
    ["A", "B", 4],
    ["A", "C", 2],
    ["B", "C", 1],
    ["B", "D", 5],
    ["C", "D", 8],
    ["C", "E", 10],
    ["D", "E", 2],
    ["D", "F", 6],
    ["E", "F", 3]
  ],
  start: "A",
  target: "F",
  directed: false
};

interface NormalizedInputPayload {
  input: JsonValue;
  normalizedInputText: string;
  footprint: string;
}

interface InputPresetDefinition {
  summary: InputPresetSummary;
  resolve: (request: ResolveInputPresetInput) => {
    input: unknown;
    options: JsonObject;
    seed?: number;
  };
}

function cloneAlgorithmDescriptor(
  descriptor: SupportedAlgorithmDescriptor
): SupportedAlgorithmDescriptor {
  return {
    ...descriptor
  };
}

function clonePresetSummary(summary: InputPresetSummary): InputPresetSummary {
  return {
    ...summary,
    algorithms: summary.algorithms.map(cloneAlgorithmDescriptor),
    ...(summary.defaultOptions !== undefined
      ? {
          defaultOptions: {
            ...summary.defaultOptions
          }
        }
      : {})
  };
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);

    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function expectIntegerOption(
  options: JsonObject,
  key: string,
  fallback: number,
  minimum: number,
  maximum: number
) {
  const value = options[key];

  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new HttpError(400, `options.${key} must be an integer.`);
  }

  if (value < minimum || value > maximum) {
    throw new HttpError(
      400,
      `options.${key} must be between ${minimum} and ${maximum}.`
    );
  }

  return value;
}

function expectBooleanOption(options: JsonObject, key: string, fallback: boolean) {
  const value = options[key];

  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "boolean") {
    throw new HttpError(400, `options.${key} must be a boolean.`);
  }

  return value;
}

function assertAllowedOptionKeys(
  options: JsonObject,
  allowedKeys: string[],
  presetId: string
) {
  for (const key of Object.keys(options)) {
    if (!allowedKeys.includes(key)) {
      throw new HttpError(
        400,
        `Preset "${presetId}" does not support option "${key}".`
      );
    }
  }
}

function normalizeSortingValues(payload: unknown): number[] {
  const values =
    typeof payload === "string"
      ? payload
          .split(",")
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
          .map((value) => Number.parseInt(value, 10))
      : Array.isArray(payload)
        ? payload.map((value) => {
            if (typeof value !== "number" || !Number.isInteger(value)) {
              throw new HttpError(
                400,
                "Sorting input arrays must contain only integers."
              );
            }

            return value;
          })
        : null;

  if (!values) {
    throw new HttpError(
      400,
      "Sorting input must be either a comma-separated string or an integer array."
    );
  }

  if (values.some((value) => !Number.isFinite(value))) {
    throw new HttpError(400, "Sorting input must contain only finite integers.");
  }

  if (values.length < 2) {
    throw new HttpError(400, "Sorting input must include at least two integers.");
  }

  if (values.length > 24) {
    throw new HttpError(
      400,
      "Sorting input must contain 24 integers or fewer."
    );
  }

  return values;
}

function serializeSortingValues(values: number[]) {
  return values.join(", ");
}

function normalizeSearchInput(payload: unknown): SearchInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Search input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Search input must be an object with array and target.");
  }

  const value = candidate as {
    array?: unknown;
    target?: unknown;
  };

  if (!Array.isArray(value.array) || value.array.length < 2) {
    throw new HttpError(
      400,
      "Search input must define a sorted array with at least two integers."
    );
  }

  if (value.array.length > 32) {
    throw new HttpError(400, "Search input must contain 32 integers or fewer.");
  }

  const array = value.array.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry)) {
      throw new HttpError(400, `array[${index}] must be an integer.`);
    }

    return entry;
  });

  for (let index = 1; index < array.length; index += 1) {
    if (array[index - 1]! > array[index]!) {
      throw new HttpError(400, "Search input array must be sorted in ascending order.");
    }
  }

  if (typeof value.target !== "number" || !Number.isInteger(value.target)) {
    throw new HttpError(400, "Search input target must be an integer.");
  }

  return {
    array,
    target: value.target
  };
}

function normalizeWindowInput(payload: unknown): WindowInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Window input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Window input must be an object with array and target.");
  }

  const value = candidate as {
    array?: unknown;
    target?: unknown;
  };

  if (!Array.isArray(value.array) || value.array.length < 2) {
    throw new HttpError(
      400,
      "Window input must include an array with at least two positive integers."
    );
  }

  if (value.array.length > 32) {
    throw new HttpError(400, "Window input arrays must contain 32 integers or fewer.");
  }

  const array = value.array.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry) || entry <= 0) {
      throw new HttpError(400, `array[${index}] must be a positive integer.`);
    }

    return entry;
  });

  if (typeof value.target !== "number" || !Number.isInteger(value.target) || value.target <= 0) {
    throw new HttpError(400, "Window input target must be a positive integer.");
  }

  return {
    array,
    target: value.target
  };
}

function serializeSearchInput(input: SearchInputPayload) {
  return JSON.stringify(
    {
      array: input.array,
      target: input.target
    },
    null,
    2
  );
}

function serializeWindowInput(input: WindowInputPayload) {
  return JSON.stringify(
    {
      array: input.array,
      target: input.target
    },
    null,
    2
  );
}

function normalizeStackInput(payload: unknown): StackInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Stack input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(400, "Stack input must be an object with an expression string.");
  }

  const value = candidate as {
    expression?: unknown;
  };

  if (typeof value.expression !== "string" || value.expression.length === 0) {
    throw new HttpError(400, "Stack input expression must be a non-empty string.");
  }

  if (value.expression.length > 32) {
    throw new HttpError(400, "Stack input expressions must be 32 characters or fewer.");
  }

  if (!/^[()[\]{}]+$/.test(value.expression)) {
    throw new HttpError(400, "Stack input expression must contain only bracket tokens: (), [], {}.");
  }

  return {
    expression: value.expression
  };
}

function serializeStackInput(input: StackInputPayload) {
  return JSON.stringify(
    {
      expression: input.expression
    },
    null,
    2
  );
}

function normalizeDynamicProgrammingInput(payload: unknown): DynamicProgrammingInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(
              400,
              "Dynamic-programming input strings must contain valid JSON."
            );
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(
      400,
      "Dynamic-programming input must be an object with left and right strings."
    );
  }

  const value = candidate as {
    left?: unknown;
    right?: unknown;
  };

  if (typeof value.left !== "string" || value.left.length === 0) {
    throw new HttpError(400, "Dynamic-programming input left must be a non-empty string.");
  }

  if (typeof value.right !== "string" || value.right.length === 0) {
    throw new HttpError(400, "Dynamic-programming input right must be a non-empty string.");
  }

  if (value.left.length > 12 || value.right.length > 12) {
    throw new HttpError(
      400,
      "Dynamic-programming input strings must be 12 characters or fewer."
    );
  }

  return {
    left: value.left,
    right: value.right
  };
}

function serializeDynamicProgrammingInput(input: DynamicProgrammingInputPayload) {
  return JSON.stringify(
    {
      left: input.left,
      right: input.right
    },
    null,
    2
  );
}

function normalizeGraphEdge(edge: unknown, label: string): [string, string, number] {
  if (!Array.isArray(edge) || edge.length !== 3) {
    throw new HttpError(400, `${label} must contain [from, to, weight] tuples.`);
  }

  const [from, to, weight] = edge;

  if (typeof from !== "string" || typeof to !== "string") {
    throw new HttpError(400, `${label} endpoints must be strings.`);
  }

  if (typeof weight !== "number" || !Number.isFinite(weight) || weight <= 0) {
    throw new HttpError(400, `${label} weights must be positive finite numbers.`);
  }

  return [from.trim(), to.trim(), Number(weight)];
}

function normalizeGraphInput(payload: unknown): GraphInputPayload {
  const candidate =
    typeof payload === "string"
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            throw new HttpError(400, "Graph input strings must contain valid JSON.");
          }
        })()
      : payload;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new HttpError(
      400,
      "Graph input must be an object with nodes, edges, start, and target."
    );
  }

  const value = candidate as {
    nodes?: unknown;
    edges?: unknown;
    start?: unknown;
    target?: unknown;
    directed?: unknown;
  };

  if (!Array.isArray(value.nodes) || value.nodes.length < 2) {
    throw new HttpError(400, "Graph input must define at least two nodes.");
  }

  if (!Array.isArray(value.edges) || value.edges.length === 0) {
    throw new HttpError(400, "Graph input must define at least one weighted edge.");
  }

  const nodes = Array.from(
    new Set(
      value.nodes.map((node, index) => {
        if (typeof node !== "string" || !node.trim()) {
          throw new HttpError(400, `nodes[${index}] must be a non-empty string.`);
        }

        return node.trim();
      })
    )
  );
  const edges = value.edges.map((edge, index) =>
    normalizeGraphEdge(edge, `edges[${index}]`)
  );

  if (typeof value.start !== "string" || !value.start.trim()) {
    throw new HttpError(400, "Graph input start must be a non-empty string.");
  }

  const start = value.start.trim();
  const target =
    value.target === null || value.target === undefined
      ? null
      : typeof value.target === "string" && value.target.trim()
        ? value.target.trim()
        : (() => {
            throw new HttpError(
              400,
              "Graph input target must be a string or null."
            );
          })();

  if (!nodes.includes(start)) {
    throw new HttpError(400, "Graph input start must exist in nodes.");
  }

  if (target !== null && !nodes.includes(target)) {
    throw new HttpError(400, "Graph input target must exist in nodes.");
  }

  for (const [from, to] of edges) {
    if (!nodes.includes(from) || !nodes.includes(to)) {
      throw new HttpError(400, "Every graph edge endpoint must exist in nodes.");
    }
  }

  return {
    nodes,
    edges,
    start,
    target,
    directed: Boolean(value.directed)
  };
}

function serializeGraphInput(input: GraphInputPayload) {
  return JSON.stringify(
    {
      nodes: input.nodes,
      edges: input.edges,
      start: input.start,
      target: input.target,
      directed: input.directed
    },
    null,
    2
  );
}

function normalizeAlgorithmInput(
  algorithmId: SupportedAlgorithmId,
  payload: unknown
): NormalizedInputPayload {
  const algorithm = supportedAlgorithms[algorithmId];

  if (!algorithm) {
    throw new HttpError(400, `Algorithm "${algorithmId}" is not supported.`);
  }

  if (algorithm.domain === "sorting") {
    const values = normalizeSortingValues(payload);

    return {
      input: values,
      normalizedInputText: serializeSortingValues(values),
      footprint: `${values.length} lanes`
    };
  }

  if (algorithm.domain === "search") {
    const search = normalizeSearchInput(payload);

    return {
      input: search,
      normalizedInputText: serializeSearchInput(search),
      footprint: `${search.array.length} lanes / target ${search.target}`
    };
  }

  if (algorithm.domain === "window") {
    const window = normalizeWindowInput(payload);

    return {
      input: window,
      normalizedInputText: serializeWindowInput(window),
      footprint: `${window.array.length} lanes / target ${window.target}`
    };
  }

  if (algorithm.domain === "dynamic-programming") {
    const dynamicProgramming = normalizeDynamicProgrammingInput(payload);

    return {
      input: dynamicProgramming,
      normalizedInputText: serializeDynamicProgrammingInput(dynamicProgramming),
      footprint: `${dynamicProgramming.left.length} x ${dynamicProgramming.right.length} table`
    };
  }

  if (algorithm.domain === "stack") {
    const stack = normalizeStackInput(payload);

    return {
      input: stack,
      normalizedInputText: serializeStackInput(stack),
      footprint: `${stack.expression.length} tokens`
    };
  }

  const graph = normalizeGraphInput(payload);

  return {
    input: graph,
    normalizedInputText: serializeGraphInput(graph),
    footprint: `${graph.nodes.length} nodes / ${graph.edges.length} edges`
  };
}

function createSortingReverseSortedInput(options: JsonObject): number[] {
  assertAllowedOptionKeys(options, ["size", "start", "step"], "sorting.reverse-sorted");

  const size = expectIntegerOption(options, "size", 8, 2, 24);
  const start = expectIntegerOption(options, "start", size * 4, size, 999);
  const step = expectIntegerOption(options, "step", 3, 1, 100);

  return Array.from({ length: size }, (_, index) => start - index * step);
}

function createSortingNearlySortedInput(seed: number, options: JsonObject): number[] {
  assertAllowedOptionKeys(options, ["size", "swaps"], "sorting.nearly-sorted");

  const size = expectIntegerOption(options, "size", 10, 2, 24);
  const swaps = expectIntegerOption(options, "swaps", 2, 1, Math.max(1, size - 1));
  const random = createSeededRandom(seed);
  const values = Array.from({ length: size }, (_, index) => index + 1);

  for (let index = 0; index < swaps; index += 1) {
    const left = Math.floor(random() * (size - 1));
    const right = left + 1;

    [values[left], values[right]] = [values[right]!, values[left]!];
  }

  return values;
}

function createSortingRandomInput(seed: number, options: JsonObject): number[] {
  assertAllowedOptionKeys(
    options,
    ["size", "minimum", "maximum"],
    "sorting.random-distinct"
  );

  const size = expectIntegerOption(options, "size", 8, 2, 24);
  const minimum = expectIntegerOption(options, "minimum", 1, -999, 999);
  const maximum = expectIntegerOption(
    options,
    "maximum",
    Math.max(40, size * 8),
    minimum + size - 1,
    5000
  );

  if (maximum - minimum + 1 < size) {
    throw new HttpError(
      400,
      "options.maximum must leave enough room for distinct generated values."
    );
  }

  const random = createSeededRandom(seed);
  const values = new Set<number>();

  while (values.size < size) {
    values.add(minimum + Math.floor(random() * (maximum - minimum + 1)));
  }

  return Array.from(values);
}

function edgeKey(from: string, to: string, directed: boolean) {
  return directed ? `${from}->${to}` : [from, to].sort().join("<->");
}

function createRandomGraph(seed: number, options: JsonObject): GraphInputPayload {
  assertAllowedOptionKeys(
    options,
    ["nodes", "extraEdges", "directed"],
    "graph.random-network"
  );

  const nodeCount = expectIntegerOption(options, "nodes", 6, 3, 12);
  const directed = expectBooleanOption(options, "directed", false);
  const baseEdgeCount = nodeCount - 1;
  const maximumPossibleEdges = directed
    ? nodeCount * (nodeCount - 1)
    : (nodeCount * (nodeCount - 1)) / 2;
  const maxExtraEdges = maximumPossibleEdges - baseEdgeCount;
  const extraEdges = expectIntegerOption(
    options,
    "extraEdges",
    Math.min(Math.max(2, nodeCount - 2), maxExtraEdges),
    0,
    maxExtraEdges
  );
  const random = createSeededRandom(seed);
  const nodes = Array.from({ length: nodeCount }, (_, index) =>
    String.fromCharCode(65 + index)
  );
  const edges: Array<[string, string, number]> = [];
  const seen = new Set<string>();

  for (let index = 0; index < nodes.length - 1; index += 1) {
    const from = nodes[index]!;
    const to = nodes[index + 1]!;

    edges.push([from, to, 2 + Math.floor(random() * 8)]);
    seen.add(edgeKey(from, to, directed));
  }

  let remainingExtraEdges = extraEdges;

  while (remainingExtraEdges > 0) {
    const from = nodes[Math.floor(random() * nodes.length)]!;
    const to = nodes[Math.floor(random() * nodes.length)]!;

    if (from === to) {
      continue;
    }

    const key = edgeKey(from, to, directed);

    if (seen.has(key)) {
      continue;
    }

    edges.push([from, to, 1 + Math.floor(random() * 9)]);
    seen.add(key);
    remainingExtraEdges -= 1;
  }

  return {
    nodes,
    edges,
    start: nodes[0]!,
    target: nodes[nodes.length - 1]!,
    directed
  };
}

const presetDefinitions: InputPresetDefinition[] = [
  {
    summary: {
      id: "sorting.baseline",
      label: "Sorting baseline deck",
      description:
        "Use the same baseline array as the replay shell so side-by-side sorting runs stay comparable.",
      scenario: "baseline",
      kind: "curated",
      domain: "sorting",
      algorithms: sortingAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultSortingValues,
      options: {}
    })
  },
  {
    summary: {
      id: "sorting.reverse-sorted",
      label: "Reverse sorted worst case",
      description:
        "Start from a descending array to emphasize the broadest mutation cost for comparison-oriented sorting traces.",
      scenario: "worst-case",
      kind: "generated",
      domain: "sorting",
      algorithms: sortingAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false,
      defaultOptions: {
        size: 8,
        start: 32,
        step: 3
      }
    },
    resolve: (request) => ({
      input: createSortingReverseSortedInput(request.options ?? {}),
      options: {
        ...(request.options ?? {})
      }
    })
  },
  {
    summary: {
      id: "sorting.nearly-sorted",
      label: "Nearly sorted array",
      description:
        "Generate a mostly ordered array with a small number of seeded inversions for regression-style replay checks.",
      scenario: "near-best-case",
      kind: "generated",
      domain: "sorting",
      algorithms: sortingAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: true,
      defaultSeed: 23,
      defaultOptions: {
        size: 10,
        swaps: 2
      }
    },
    resolve: (request) => {
      const seed = request.seed ?? 23;

      return {
        input: createSortingNearlySortedInput(seed, request.options ?? {}),
        seed,
        options: {
          ...(request.options ?? {})
        }
      };
    }
  },
  {
    summary: {
      id: "sorting.random-distinct",
      label: "Seeded random array",
      description:
        "Generate a deterministic set of distinct integers so repeated runs can share the same replay input.",
      scenario: "random",
      kind: "generated",
      domain: "sorting",
      algorithms: sortingAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: true,
      defaultSeed: 17,
      defaultOptions: {
        size: 8,
        minimum: 1,
        maximum: 64
      }
    },
    resolve: (request) => {
      const seed = request.seed ?? 17;

      return {
        input: createSortingRandomInput(seed, request.options ?? {}),
        seed,
        options: {
          ...(request.options ?? {})
        }
      };
    }
  },
  {
    summary: {
      id: "search.reference-hit",
      label: "Reference midpoint hit",
      description:
        "Use a curated sorted array where the target is present so binary-search probes and interval cuts stay easy to inspect.",
      scenario: "baseline",
      kind: "curated",
      domain: "search",
      algorithms: searchAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultSearchInput,
      options: {}
    })
  },
  {
    summary: {
      id: "search.missing-target",
      label: "Absent target search",
      description:
        "Keep the target outside the sorted array so replay ends on an explicit exhausted interval instead of a match.",
      scenario: "miss",
      kind: "curated",
      domain: "search",
      algorithms: searchAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        array: [3, 7, 11, 18, 24, 31, 42, 56],
        target: 19
      },
      options: {}
    })
  },
  {
    summary: {
      id: "window.reference-target",
      label: "Reference shrinking window",
      description:
        "Use the classic positive-array target hit so sliding-window contractions and best-window updates stay easy to inspect.",
      scenario: "baseline",
      kind: "curated",
      domain: "window",
      algorithms: windowAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultWindowInput,
      options: {}
    })
  },
  {
    summary: {
      id: "window.no-solution",
      label: "No qualifying window",
      description:
        "Keep the target larger than every reachable contiguous sum so replay ends with an explicit no-solution outcome.",
      scenario: "miss",
      kind: "curated",
      domain: "window",
      algorithms: windowAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        array: [1, 1, 1, 1, 1, 1],
        target: 9
      },
      options: {}
    })
  },
  {
    summary: {
      id: "dynamic-programming.reference-overlap",
      label: "Reference overlap table",
      description:
        "Use a classic LCS pair with a non-trivial traceback so the table fill and reconstruction phases stay visible in replay.",
      scenario: "baseline",
      kind: "curated",
      domain: "dynamic-programming",
      algorithms: dynamicProgrammingAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultDynamicProgrammingInput,
      options: {}
    })
  },
  {
    summary: {
      id: "dynamic-programming.no-overlap",
      label: "No-overlap strings",
      description:
        "Keep both strings disjoint so the replay exercises zero-length tables and deterministic traceback tie breaks.",
      scenario: "no-overlap",
      kind: "curated",
      domain: "dynamic-programming",
      algorithms: dynamicProgrammingAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        left: "ABC",
        right: "XYZ"
      },
      options: {}
    })
  },
  {
    summary: {
      id: "stack.reference-valid",
      label: "Reference valid bracket string",
      description:
        "Use a balanced bracket expression so replay can show pushes, matches, and a clean empty-stack finish.",
      scenario: "baseline",
      kind: "curated",
      domain: "stack",
      algorithms: stackAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultStackInput,
      options: {}
    })
  },
  {
    summary: {
      id: "stack.early-mismatch",
      label: "Early mismatch bracket string",
      description:
        "Introduce a classic crossing mismatch so replay ends on the first invalid closer with the expected token still visible.",
      scenario: "mismatch",
      kind: "curated",
      domain: "stack",
      algorithms: stackAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        expression: "([)]"
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.reference-route",
      label: "Reference shortest-path graph",
      description:
        "Weighted graph fixture aligned with the shared graph execution runtime and local replay shell.",
      scenario: "baseline",
      kind: "curated",
      domain: "graph",
      algorithms: graphAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: defaultGraphInput,
      options: {}
    })
  },
  {
    summary: {
      id: "graph.disconnected-target",
      label: "Disconnected target",
      description:
        "Keep the requested target unreachable so path replay and validation can exercise the no-route outcome explicitly.",
      scenario: "no-route",
      kind: "curated",
      domain: "graph",
      algorithms: graphAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        nodes: ["A", "B", "C", "D", "E", "F"],
        edges: [
          ["A", "B", 2],
          ["B", "C", 3],
          ["C", "D", 2],
          ["E", "F", 1]
        ],
        start: "A",
        target: "F",
        directed: false
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.weighted-detour",
      label: "Weighted detour",
      description:
        "Favor a cheaper multi-hop route over the obvious direct path so frontier churn stays visible in replay traces.",
      scenario: "weighted-detour",
      kind: "curated",
      domain: "graph",
      algorithms: graphAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: false
    },
    resolve: () => ({
      input: {
        nodes: ["A", "B", "C", "D", "E", "F"],
        edges: [
          ["A", "B", 1],
          ["B", "F", 20],
          ["A", "C", 4],
          ["C", "D", 2],
          ["D", "E", 2],
          ["E", "F", 2],
          ["B", "D", 6],
          ["C", "F", 12]
        ],
        start: "A",
        target: "F",
        directed: false
      },
      options: {}
    })
  },
  {
    summary: {
      id: "graph.random-network",
      label: "Seeded random network",
      description:
        "Generate a deterministic weighted network with a guaranteed start-to-target path for pathfinding comparisons.",
      scenario: "random",
      kind: "generated",
      domain: "graph",
      algorithms: graphAlgorithms.map(cloneAlgorithmDescriptor),
      supportsSeed: true,
      defaultSeed: 29,
      defaultOptions: {
        nodes: 6,
        extraEdges: 4,
        directed: false
      }
    },
    resolve: (request) => {
      const seed = request.seed ?? 29;

      return {
        input: createRandomGraph(seed, request.options ?? {}),
        seed,
        options: {
          ...(request.options ?? {})
        }
      };
    }
  }
];

const presetDefinitionsById = new Map(
  presetDefinitions.map((preset) => [preset.summary.id, preset])
);

export class TraceDeckInputCatalog {
  listPresets(query: InputPresetListQuery = {}): InputPresetSummary[] {
    return presetDefinitions
      .map((preset) => preset.summary)
      .filter((preset) => {
        if (query.domain && preset.domain !== query.domain) {
          return false;
        }

        if (
          query.algorithmId &&
          !preset.algorithms.some((algorithm) => algorithm.id === query.algorithmId)
        ) {
          return false;
        }

        return true;
      })
      .map(clonePresetSummary);
  }

  getPreset(presetId: string): InputPresetSummary {
    const preset = presetDefinitionsById.get(presetId);

    if (!preset) {
      throw new HttpError(404, `Input preset "${presetId}" was not found.`);
    }

    return clonePresetSummary(preset.summary);
  }

  resolvePreset(
    presetId: string,
    request: ResolveInputPresetInput
  ): ResolvedInputPreset {
    const preset = presetDefinitionsById.get(presetId);

    if (!preset) {
      throw new HttpError(404, `Input preset "${presetId}" was not found.`);
    }

    const algorithm = supportedAlgorithms[request.algorithmId];

    if (!algorithm) {
      throw new HttpError(400, `Algorithm "${request.algorithmId}" is not supported.`);
    }

    if (!preset.summary.algorithms.some((entry) => entry.id === request.algorithmId)) {
      throw new HttpError(
        400,
        `Preset "${presetId}" does not support algorithm "${request.algorithmId}".`
      );
    }

    if (!preset.summary.supportsSeed && request.seed !== undefined) {
      throw new HttpError(400, `Preset "${presetId}" does not accept a seed.`);
    }

    const resolved = preset.resolve(request);
    const normalized = normalizeAlgorithmInput(request.algorithmId, resolved.input);

    return {
      source: "preset",
      preset: clonePresetSummary(preset.summary),
      algorithm: cloneAlgorithmDescriptor(algorithm),
      input: normalized.input,
      normalizedInputText: normalized.normalizedInputText,
      footprint: normalized.footprint,
      ...(resolved.seed !== undefined ? { seed: resolved.seed } : {}),
      options: {
        ...resolved.options
      }
    };
  }

  validateCustomInput(request: ValidateCustomInputInput): ValidatedCustomInput {
    const algorithm = supportedAlgorithms[request.algorithmId];

    if (!algorithm) {
      throw new HttpError(400, `Algorithm "${request.algorithmId}" is not supported.`);
    }

    const normalized = normalizeAlgorithmInput(request.algorithmId, request.payload);

    return {
      source: "custom",
      algorithm: cloneAlgorithmDescriptor(algorithm),
      input: normalized.input,
      normalizedInputText: normalized.normalizedInputText,
      footprint: normalized.footprint
    };
  }
}

export function getSupportedAlgorithmDescriptor(
  algorithmId: SupportedAlgorithmId
): SupportedAlgorithmDescriptor {
  const algorithm = supportedAlgorithms[algorithmId];

  if (!algorithm) {
    throw new HttpError(400, `Algorithm "${algorithmId}" is not supported.`);
  }

  return cloneAlgorithmDescriptor(algorithm);
}

export function getSupportedAlgorithmsByDomain(domain: AlgorithmDomain) {
  return Object.values(supportedAlgorithms)
    .filter((algorithm) => algorithm.domain === domain)
    .map(cloneAlgorithmDescriptor);
}
