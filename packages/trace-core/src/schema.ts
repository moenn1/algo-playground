export const TRACE_SCHEMA_VERSION = "0.2.0";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export type AlgorithmDomain = "sorting" | "graph" | "search";
export type MetricUnit = "count" | "milliseconds" | "bytes" | "ratio" | "items";
export type ComparisonDirection = "lower-is-better" | "higher-is-better" | "neutral";
export type TraceChangeOperation = "set" | "insert" | "remove" | "move";
export type TraceHighlightKind =
  | "value"
  | "index"
  | "range"
  | "node"
  | "edge"
  | "path"
  | "collection";
export type TraceHighlightIntent =
  | "focus"
  | "active"
  | "candidate"
  | "mutation"
  | "sorted"
  | "visited"
  | "frontier"
  | "result";

export interface TraceMetricDefinition {
  key: string;
  label: string;
  unit: MetricUnit;
  direction: ComparisonDirection;
}

export interface TraceAlgorithmDescriptor {
  id: string;
  label: string;
  domain: AlgorithmDomain;
  implementationVersion: string;
}

export interface TraceChange {
  path: string;
  op: TraceChangeOperation;
  previousValue?: JsonValue;
  nextValue?: JsonValue;
}

export interface TraceHighlight {
  key: string;
  path: string;
  kind: TraceHighlightKind;
  intent: TraceHighlightIntent;
  label?: string;
  metadata?: JsonObject;
}

export interface TraceExplanation {
  summary: string;
  details?: string;
  tags?: string[];
}

export interface TraceStep<State extends JsonObject = JsonObject> {
  index: number;
  key: string;
  phase: string;
  description: string;
  explanation: TraceExplanation;
  state: State;
  changes: TraceChange[];
  highlights: TraceHighlight[];
  metrics: Record<string, number>;
}

export interface TraceReplayInvariants {
  stateEncoding: "canonical-json";
  stepOrdering: "contiguous-zero-based";
  replayStrategy: "full-snapshot";
  changeEncoding: "path-based-explicit-values";
  highlightEncoding: "structured-selectors";
}

export interface TraceReplayDescriptor {
  initialStepIndex: number;
  finalStepIndex: number;
  invariants: TraceReplayInvariants;
}

export interface TraceSummary {
  stepCount: number;
  stepKeys: string[];
  comparisonMetricKeys: string[];
  metricDefinitions: TraceMetricDefinition[];
  finalMetrics: Record<string, number>;
}

export interface TraceEnvelope<State extends JsonObject = JsonObject> {
  schemaVersion: string;
  algorithm: TraceAlgorithmDescriptor;
  input: JsonValue;
  steps: TraceStep<State>[];
  replay: TraceReplayDescriptor;
  summary: TraceSummary;
}

export interface CreateTraceEnvelopeInput<State extends JsonObject = JsonObject> {
  algorithm: TraceAlgorithmDescriptor;
  input: JsonValue;
  steps: TraceStep<State>[];
  metricDefinitions: TraceMetricDefinition[];
  comparisonMetricKeys: string[];
}

export const TRACE_REPLAY_INVARIANTS: TraceReplayInvariants = {
  stateEncoding: "canonical-json",
  stepOrdering: "contiguous-zero-based",
  replayStrategy: "full-snapshot",
  changeEncoding: "path-based-explicit-values",
  highlightEncoding: "structured-selectors"
};

export function isSerializableJsonValue(value: unknown): value is JsonValue {
  if (value === null) {
    return true;
  }

  if (typeof value === "string" || typeof value === "boolean") {
    return true;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.every((entry) => isSerializableJsonValue(entry));
  }

  if (
    typeof value === "object" &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.values(value as Record<string, unknown>).every((entry) =>
      isSerializableJsonValue(entry)
    );
  }

  return false;
}

export function assertSerializableJson(
  value: unknown,
  label: string
): asserts value is JsonValue {
  if (!isSerializableJsonValue(value)) {
    throw new Error(`${label} must be JSON-serializable with finite numeric values.`);
  }
}

export function canonicalizeJson<T extends JsonValue>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => canonicalizeJson(entry)) as T;
  }

  if (value !== null && typeof value === "object") {
    const objectValue = value as JsonObject;
    const canonicalObject: JsonObject = {};

    Object.keys(objectValue)
      .sort((left, right) => left.localeCompare(right))
      .forEach((key) => {
        canonicalObject[key] = canonicalizeJson(objectValue[key]!);
      });

    return canonicalObject as T;
  }

  return value;
}

export function stableStringifyJson(value: JsonValue): string {
  return JSON.stringify(canonicalizeJson(value));
}

function assertNonEmptyString(value: string, label: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}

function normalizeStringList(values: string[], label: string): string[] {
  const seen = new Set<string>();

  return values.map((value, index) => {
    assertNonEmptyString(value, `${label} entry ${index}`);

    if (seen.has(value)) {
      throw new Error(`${label} must not contain duplicate values. Duplicate: "${value}".`);
    }

    seen.add(value);
    return value;
  });
}

function normalizeMetricDefinitions(
  metricDefinitions: TraceMetricDefinition[]
): TraceMetricDefinition[] {
  const seen = new Set<string>();

  return metricDefinitions.map((metric, index) => {
    assertNonEmptyString(metric.key, `Metric definition ${index} key`);
    assertNonEmptyString(metric.label, `Metric definition ${index} label`);

    if (seen.has(metric.key)) {
      throw new Error(`Metric definitions must not reuse the key "${metric.key}".`);
    }

    seen.add(metric.key);
    return {
      ...metric
    };
  });
}

function normalizeMetrics(
  metrics: Record<string, number>,
  metricKeys: Set<string>,
  label: string
): Record<string, number> {
  const normalizedMetrics: Record<string, number> = {};

  Object.keys(metrics)
    .sort((left, right) => left.localeCompare(right))
    .forEach((metricKey) => {
      if (!metricKeys.has(metricKey)) {
        throw new Error(`${label} references undeclared metric "${metricKey}".`);
      }

      const value = metrics[metricKey]!;

      if (!Number.isFinite(value)) {
        throw new Error(`${label} metric "${metricKey}" must use a finite numeric value.`);
      }

      normalizedMetrics[metricKey] = value;
    });

  return normalizedMetrics;
}

function normalizeTraceChange(change: TraceChange, stepIndex: number, changeIndex: number): TraceChange {
  assertNonEmptyString(change.path, `Trace step ${stepIndex} change ${changeIndex} path`);

  if (change.previousValue !== undefined) {
    assertSerializableJson(
      change.previousValue,
      `Trace step ${stepIndex} change ${changeIndex} previousValue`
    );
  }

  if (change.nextValue !== undefined) {
    assertSerializableJson(
      change.nextValue,
      `Trace step ${stepIndex} change ${changeIndex} nextValue`
    );
  }

  const normalizedChange: TraceChange = {
    path: change.path,
    op: change.op
  };

  if (change.previousValue !== undefined) {
    normalizedChange.previousValue = canonicalizeJson(change.previousValue);
  }

  if (change.nextValue !== undefined) {
    normalizedChange.nextValue = canonicalizeJson(change.nextValue);
  }

  return normalizedChange;
}

function normalizeTraceHighlight(
  highlight: TraceHighlight,
  stepIndex: number,
  highlightIndex: number,
  seenHighlightKeys: Set<string>
): TraceHighlight {
  assertNonEmptyString(
    highlight.key,
    `Trace step ${stepIndex} highlight ${highlightIndex} key`
  );
  assertNonEmptyString(
    highlight.path,
    `Trace step ${stepIndex} highlight ${highlightIndex} path`
  );

  if (seenHighlightKeys.has(highlight.key)) {
    throw new Error(
      `Trace step ${stepIndex} must not repeat the highlight key "${highlight.key}".`
    );
  }

  seenHighlightKeys.add(highlight.key);

  if (highlight.label !== undefined) {
    assertNonEmptyString(
      highlight.label,
      `Trace step ${stepIndex} highlight ${highlightIndex} label`
    );
  }

  if (highlight.metadata !== undefined) {
    assertSerializableJson(
      highlight.metadata,
      `Trace step ${stepIndex} highlight ${highlightIndex} metadata`
    );
  }

  const normalizedHighlight: TraceHighlight = {
    key: highlight.key,
    path: highlight.path,
    kind: highlight.kind,
    intent: highlight.intent
  };

  if (highlight.label !== undefined) {
    normalizedHighlight.label = highlight.label;
  }

  if (highlight.metadata !== undefined) {
    normalizedHighlight.metadata = canonicalizeJson(highlight.metadata);
  }

  return normalizedHighlight;
}

function normalizeTraceExplanation(
  explanation: TraceExplanation,
  stepIndex: number
): TraceExplanation {
  assertNonEmptyString(explanation.summary, `Trace step ${stepIndex} explanation summary`);

  if (explanation.details !== undefined) {
    assertNonEmptyString(explanation.details, `Trace step ${stepIndex} explanation details`);
  }

  const normalizedExplanation: TraceExplanation = {
    summary: explanation.summary
  };

  if (explanation.details !== undefined) {
    normalizedExplanation.details = explanation.details;
  }

  if (explanation.tags !== undefined) {
    normalizedExplanation.tags = normalizeStringList(
      explanation.tags,
      `Trace step ${stepIndex} explanation tags`
    );
  }

  return normalizedExplanation;
}

function normalizeTraceStep<State extends JsonObject>(
  step: TraceStep<State>,
  expectedIndex: number,
  metricKeys: Set<string>,
  seenStepKeys: Set<string>
): TraceStep<State> {
  if (step.index !== expectedIndex) {
    throw new Error("Trace steps must use contiguous indexes starting at 0.");
  }

  assertNonEmptyString(step.key, `Trace step ${step.index} key`);
  assertNonEmptyString(step.phase, `Trace step ${step.index} phase`);
  assertNonEmptyString(step.description, `Trace step ${step.index} description`);

  if (seenStepKeys.has(step.key)) {
    throw new Error(`Trace steps must not reuse the key "${step.key}".`);
  }

  seenStepKeys.add(step.key);

  assertSerializableJson(step.state, `Trace step ${step.index} state`);

  const seenHighlightKeys = new Set<string>();

  return {
    ...step,
    explanation: normalizeTraceExplanation(step.explanation, step.index),
    state: canonicalizeJson(step.state),
    changes: step.changes.map((change, changeIndex) =>
      normalizeTraceChange(change, step.index, changeIndex)
    ),
    highlights: step.highlights.map((highlight, highlightIndex) =>
      normalizeTraceHighlight(highlight, step.index, highlightIndex, seenHighlightKeys)
    ),
    metrics: normalizeMetrics(step.metrics, metricKeys, `Trace step ${step.index}`)
  };
}

function normalizeAlgorithmDescriptor(
  algorithm: TraceAlgorithmDescriptor
): TraceAlgorithmDescriptor {
  assertNonEmptyString(algorithm.id, "Trace algorithm id");
  assertNonEmptyString(algorithm.label, "Trace algorithm label");
  assertNonEmptyString(
    algorithm.implementationVersion,
    "Trace algorithm implementationVersion"
  );

  return {
    ...algorithm
  };
}

export function createTraceEnvelope<State extends JsonObject>(
  input: CreateTraceEnvelopeInput<State>
): TraceEnvelope<State> {
  assertSerializableJson(input.input, "Trace input");

  if (input.steps.length === 0) {
    throw new Error("Trace envelopes must include at least one step.");
  }

  const metricDefinitions = normalizeMetricDefinitions(input.metricDefinitions);
  const metricKeys = new Set(metricDefinitions.map((metric) => metric.key));
  const comparisonMetricKeys = normalizeStringList(
    input.comparisonMetricKeys,
    "Comparison metric keys"
  );
  const unknownComparisonMetric = comparisonMetricKeys.find(
    (metricKey) => !metricKeys.has(metricKey)
  );

  if (unknownComparisonMetric) {
    throw new Error(
      `Comparison metric "${unknownComparisonMetric}" must be declared in metricDefinitions.`
    );
  }

  const seenStepKeys = new Set<string>();
  const steps = input.steps.map((step, expectedIndex) =>
    normalizeTraceStep(step, expectedIndex, metricKeys, seenStepKeys)
  );
  const finalStep = steps[steps.length - 1]!;
  const missingComparisonMetric = comparisonMetricKeys.find(
    (metricKey) => finalStep.metrics[metricKey] === undefined
  );

  if (missingComparisonMetric) {
    throw new Error(
      `Final step metrics must include comparison metric "${missingComparisonMetric}".`
    );
  }

  return {
    schemaVersion: TRACE_SCHEMA_VERSION,
    algorithm: normalizeAlgorithmDescriptor(input.algorithm),
    input: canonicalizeJson(input.input),
    steps,
    replay: {
      initialStepIndex: 0,
      finalStepIndex: finalStep.index,
      invariants: TRACE_REPLAY_INVARIANTS
    },
    summary: {
      stepCount: steps.length,
      stepKeys: steps.map((step) => step.key),
      comparisonMetricKeys,
      metricDefinitions,
      finalMetrics: {
        ...finalStep.metrics
      }
    }
  };
}
