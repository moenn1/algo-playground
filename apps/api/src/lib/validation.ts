import {
  TRACE_REPLAY_INVARIANTS,
  createTraceEnvelope,
  isSerializableJsonValue,
  stableStringifyJson,
  type AlgorithmDomain,
  type ComparisonDirection,
  type JsonObject,
  type JsonValue,
  type MetricUnit,
  type TraceAlgorithmDescriptor,
  type TraceChange,
  type TraceChangeOperation,
  type TraceEnvelope,
  type TraceHighlight,
  type TraceHighlightIntent,
  type TraceHighlightKind,
  type TraceMetricDefinition,
  type TraceStep
} from "@tracedeck/trace-core";

import { HttpError } from "./http.js";
import {
  supportedAlgorithmIds,
  type InputPresetListQuery,
  type ResolveInputPresetInput,
  type ValidateCustomInputInput
} from "../input/types.js";

import type {
  CreateComparisonInput,
  CreateRunRecordInput,
  ListComparisonsQuery,
  ListRunsQuery,
  ListStepsQuery
} from "../persistence/types.js";

const algorithmDomains = new Set<AlgorithmDomain>([
  "sorting",
  "graph",
  "search",
  "window",
  "hash",
  "heap",
  "dynamic-programming",
  "stack",
  "interval"
]);
const algorithmIds = new Set(supportedAlgorithmIds);
const metricUnits = new Set<MetricUnit>([
  "count",
  "milliseconds",
  "bytes",
  "ratio",
  "items"
]);
const comparisonDirections = new Set<ComparisonDirection>([
  "lower-is-better",
  "higher-is-better",
  "neutral"
]);
const traceChangeOperations = new Set<TraceChangeOperation>([
  "set",
  "insert",
  "remove",
  "move"
]);
const traceHighlightKinds = new Set<TraceHighlightKind>([
  "value",
  "index",
  "range",
  "node",
  "edge",
  "path",
  "collection"
]);
const traceHighlightIntents = new Set<TraceHighlightIntent>([
  "focus",
  "active",
  "candidate",
  "mutation",
  "sorted",
  "visited",
  "frontier",
  "result"
]);

const defaultPageSize = 20;
const maxPageSize = 50;

function expectRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, `${label} must be an object.`);
  }

  return value as Record<string, unknown>;
}

function expectString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new HttpError(400, `${label} must be a string.`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new HttpError(400, `${label} cannot be empty.`);
  }

  return trimmed;
}

function expectOptionalString(value: unknown, label: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return expectString(value, label);
}

function expectFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new HttpError(400, `${label} must be a finite number.`);
  }

  return value;
}

function expectInteger(value: unknown, label: string): number {
  const parsed = expectFiniteNumber(value, label);

  if (!Number.isInteger(parsed)) {
    throw new HttpError(400, `${label} must be an integer.`);
  }

  return parsed;
}

function expectOptionalInteger(value: unknown, label: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  return expectInteger(value, label);
}

function expectArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new HttpError(400, `${label} must be an array.`);
  }

  return value;
}

function expectStringArray(value: unknown, label: string): string[] {
  return expectArray(value, label).map((entry, index) =>
    expectString(entry, `${label}[${index}]`)
  );
}

function expectJsonValue(value: unknown, label: string): JsonValue {
  if (!isSerializableJsonValue(value)) {
    throw new HttpError(
      400,
      `${label} must be JSON-serializable with finite numeric values.`
    );
  }

  return value;
}

function expectOptionalJsonObject(value: unknown, label: string): JsonObject | undefined {
  if (value === undefined) {
    return undefined;
  }

  const jsonValue = expectJsonValue(value, label);

  if (!jsonValue || typeof jsonValue !== "object" || Array.isArray(jsonValue)) {
    throw new HttpError(400, `${label} must be a JSON object.`);
  }

  return jsonValue as JsonObject;
}

function expectDomain(value: unknown, label: string): AlgorithmDomain {
  const domain = expectString(value, label);

  if (!algorithmDomains.has(domain as AlgorithmDomain)) {
    throw new HttpError(400, `${label} must be a supported algorithm domain.`);
  }

  return domain as AlgorithmDomain;
}

function expectAlgorithmId(
  value: unknown,
  label: string
): ResolveInputPresetInput["algorithmId"] {
  const algorithmId = expectString(value, label);

  if (!algorithmIds.has(algorithmId as ResolveInputPresetInput["algorithmId"])) {
    throw new HttpError(400, `${label} must be a supported algorithm id.`);
  }

  return algorithmId as ResolveInputPresetInput["algorithmId"];
}

function expectMetricUnit(value: unknown, label: string): MetricUnit {
  const unit = expectString(value, label);

  if (!metricUnits.has(unit as MetricUnit)) {
    throw new HttpError(400, `${label} must be a supported metric unit.`);
  }

  return unit as MetricUnit;
}

function expectComparisonDirection(
  value: unknown,
  label: string
): ComparisonDirection {
  const direction = expectString(value, label);

  if (!comparisonDirections.has(direction as ComparisonDirection)) {
    throw new HttpError(400, `${label} must be a supported comparison direction.`);
  }

  return direction as ComparisonDirection;
}

function expectTraceChangeOperation(
  value: unknown,
  label: string
): TraceChangeOperation {
  const operation = expectString(value, label);

  if (!traceChangeOperations.has(operation as TraceChangeOperation)) {
    throw new HttpError(400, `${label} must be a supported trace change operation.`);
  }

  return operation as TraceChangeOperation;
}

function expectTraceHighlightKind(value: unknown, label: string): TraceHighlightKind {
  const kind = expectString(value, label);

  if (!traceHighlightKinds.has(kind as TraceHighlightKind)) {
    throw new HttpError(400, `${label} must be a supported trace highlight kind.`);
  }

  return kind as TraceHighlightKind;
}

function expectTraceHighlightIntent(
  value: unknown,
  label: string
): TraceHighlightIntent {
  const intent = expectString(value, label);

  if (!traceHighlightIntents.has(intent as TraceHighlightIntent)) {
    throw new HttpError(400, `${label} must be a supported trace highlight intent.`);
  }

  return intent as TraceHighlightIntent;
}

function parseMetricDefinitions(value: unknown): TraceMetricDefinition[] {
  const metricDefinitions = expectArray(value, "trace.summary.metricDefinitions").map(
    (entry, index) => {
      const metric = expectRecord(entry, `trace.summary.metricDefinitions[${index}]`);

      return {
        key: expectString(metric.key, `trace.summary.metricDefinitions[${index}].key`),
        label: expectString(metric.label, `trace.summary.metricDefinitions[${index}].label`),
        unit: expectMetricUnit(metric.unit, `trace.summary.metricDefinitions[${index}].unit`),
        direction: expectComparisonDirection(
          metric.direction,
          `trace.summary.metricDefinitions[${index}].direction`
        )
      };
    }
  );

  const seenMetricKeys = new Set<string>();

  for (const metric of metricDefinitions) {
    if (seenMetricKeys.has(metric.key)) {
      throw new HttpError(400, `trace.summary.metricDefinitions must not reuse "${metric.key}".`);
    }

    seenMetricKeys.add(metric.key);
  }

  return metricDefinitions;
}

function parseAlgorithmDescriptor(value: unknown): TraceAlgorithmDescriptor {
  const algorithm = expectRecord(value, "trace.algorithm");

  return {
    id: expectString(algorithm.id, "trace.algorithm.id"),
    label: expectString(algorithm.label, "trace.algorithm.label"),
    domain: expectDomain(algorithm.domain, "trace.algorithm.domain"),
    implementationVersion: expectString(
      algorithm.implementationVersion,
      "trace.algorithm.implementationVersion"
    )
  };
}

function parseMetricsRecord(value: unknown, label: string): Record<string, number> {
  const metrics = expectRecord(value, label);

  return Object.fromEntries(
    Object.entries(metrics).map(([key, entry]) => [
      expectString(key, `${label}.key`),
      expectFiniteNumber(entry, `${label}.${key}`)
    ])
  );
}

function parseTraceChange(value: unknown, stepIndex: number, changeIndex: number): TraceChange {
  const change = expectRecord(value, `trace.steps[${stepIndex}].changes[${changeIndex}]`);
  const result: TraceChange = {
    path: expectString(change.path, `trace.steps[${stepIndex}].changes[${changeIndex}].path`),
    op: expectTraceChangeOperation(
      change.op,
      `trace.steps[${stepIndex}].changes[${changeIndex}].op`
    )
  };

  if (change.previousValue !== undefined) {
    result.previousValue = expectJsonValue(
      change.previousValue,
      `trace.steps[${stepIndex}].changes[${changeIndex}].previousValue`
    );
  }

  if (change.nextValue !== undefined) {
    result.nextValue = expectJsonValue(
      change.nextValue,
      `trace.steps[${stepIndex}].changes[${changeIndex}].nextValue`
    );
  }

  return result;
}

function parseTraceHighlight(
  value: unknown,
  stepIndex: number,
  highlightIndex: number
): TraceHighlight {
  const highlight = expectRecord(
    value,
    `trace.steps[${stepIndex}].highlights[${highlightIndex}]`
  );
  const result: TraceHighlight = {
    key: expectString(
      highlight.key,
      `trace.steps[${stepIndex}].highlights[${highlightIndex}].key`
    ),
    path: expectString(
      highlight.path,
      `trace.steps[${stepIndex}].highlights[${highlightIndex}].path`
    ),
    kind: expectTraceHighlightKind(
      highlight.kind,
      `trace.steps[${stepIndex}].highlights[${highlightIndex}].kind`
    ),
    intent: expectTraceHighlightIntent(
      highlight.intent,
      `trace.steps[${stepIndex}].highlights[${highlightIndex}].intent`
    )
  };

  if (highlight.label !== undefined) {
    result.label = expectString(
      highlight.label,
      `trace.steps[${stepIndex}].highlights[${highlightIndex}].label`
    );
  }

  if (highlight.metadata !== undefined) {
    const metadata = expectJsonValue(
      highlight.metadata,
      `trace.steps[${stepIndex}].highlights[${highlightIndex}].metadata`
    );

    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      throw new HttpError(
        400,
        `trace.steps[${stepIndex}].highlights[${highlightIndex}].metadata must be an object.`
      );
    }

    result.metadata = metadata as JsonObject;
  }

  return result;
}

function parseTraceStep(value: unknown, index: number): TraceStep<JsonObject> {
  const step = expectRecord(value, `trace.steps[${index}]`);
  const explanation = expectRecord(step.explanation, `trace.steps[${index}].explanation`);
  const state = expectJsonValue(step.state, `trace.steps[${index}].state`);

  if (!state || typeof state !== "object" || Array.isArray(state)) {
    throw new HttpError(400, `trace.steps[${index}].state must be an object.`);
  }

  const parsedStep: TraceStep<JsonObject> = {
    index: expectInteger(step.index, `trace.steps[${index}].index`),
    key: expectString(step.key, `trace.steps[${index}].key`),
    phase: expectString(step.phase, `trace.steps[${index}].phase`),
    description: expectString(step.description, `trace.steps[${index}].description`),
    explanation: {
      summary: expectString(
        explanation.summary,
        `trace.steps[${index}].explanation.summary`
      )
    },
    state: state as JsonObject,
    changes: expectArray(step.changes, `trace.steps[${index}].changes`).map(
      (change, changeIndex) => parseTraceChange(change, index, changeIndex)
    ),
    highlights: expectArray(step.highlights, `trace.steps[${index}].highlights`).map(
      (highlight, highlightIndex) => parseTraceHighlight(highlight, index, highlightIndex)
    ),
    metrics: parseMetricsRecord(step.metrics, `trace.steps[${index}].metrics`)
  };

  if (explanation.details !== undefined) {
    parsedStep.explanation.details = expectString(
      explanation.details,
      `trace.steps[${index}].explanation.details`
    );
  }

  if (explanation.tags !== undefined) {
    parsedStep.explanation.tags = expectStringArray(
      explanation.tags,
      `trace.steps[${index}].explanation.tags`
    );
  }

  return parsedStep;
}

function parseTraceEnvelope(value: unknown): TraceEnvelope {
  const trace = expectRecord(value, "trace");
  const summary = expectRecord(trace.summary, "trace.summary");
  const replay = trace.replay === undefined ? undefined : expectRecord(trace.replay, "trace.replay");
  const input = expectJsonValue(trace.input, "trace.input");
  const steps = expectArray(trace.steps, "trace.steps").map((step, index) =>
    parseTraceStep(step, index)
  );
  const derivedTrace = createTraceEnvelope({
    algorithm: parseAlgorithmDescriptor(trace.algorithm),
    input,
    steps,
    metricDefinitions: parseMetricDefinitions(summary.metricDefinitions),
    comparisonMetricKeys: expectStringArray(
      summary.comparisonMetricKeys,
      "trace.summary.comparisonMetricKeys"
    )
  });
  const providedSchemaVersion = expectString(trace.schemaVersion, "trace.schemaVersion");
  const providedStepCount = expectInteger(summary.stepCount, "trace.summary.stepCount");

  if (providedSchemaVersion !== derivedTrace.schemaVersion) {
    throw new HttpError(
      400,
      `trace.schemaVersion must be "${derivedTrace.schemaVersion}".`
    );
  }

  if (providedStepCount !== derivedTrace.summary.stepCount) {
    throw new HttpError(400, "Trace summary stepCount must match the number of emitted steps.");
  }

  if (summary.stepKeys !== undefined) {
    const stepKeys = expectStringArray(summary.stepKeys, "trace.summary.stepKeys");

    if (JSON.stringify(stepKeys) !== JSON.stringify(derivedTrace.summary.stepKeys)) {
      throw new HttpError(400, "Trace summary stepKeys must match the emitted step keys.");
    }
  }

  if (summary.finalMetrics !== undefined) {
    const finalMetrics = parseMetricsRecord(summary.finalMetrics, "trace.summary.finalMetrics");

    if (
      stableStringifyJson(finalMetrics as JsonValue) !==
      stableStringifyJson(derivedTrace.summary.finalMetrics as JsonValue)
    ) {
      throw new HttpError(
        400,
        "Trace summary finalMetrics must match the final emitted step metrics."
      );
    }
  }

  if (replay) {
    const initialStepIndex = expectInteger(
      replay.initialStepIndex,
      "trace.replay.initialStepIndex"
    );
    const finalStepIndex = expectInteger(replay.finalStepIndex, "trace.replay.finalStepIndex");
    const invariants = expectRecord(replay.invariants, "trace.replay.invariants");

    if (
      initialStepIndex !== derivedTrace.replay.initialStepIndex ||
      finalStepIndex !== derivedTrace.replay.finalStepIndex
    ) {
      throw new HttpError(400, "trace.replay must match the normalized replay descriptor.");
    }

    if (
      expectString(invariants.stateEncoding, "trace.replay.invariants.stateEncoding") !==
        TRACE_REPLAY_INVARIANTS.stateEncoding ||
      expectString(invariants.stepOrdering, "trace.replay.invariants.stepOrdering") !==
        TRACE_REPLAY_INVARIANTS.stepOrdering ||
      expectString(invariants.replayStrategy, "trace.replay.invariants.replayStrategy") !==
        TRACE_REPLAY_INVARIANTS.replayStrategy ||
      expectString(invariants.changeEncoding, "trace.replay.invariants.changeEncoding") !==
        TRACE_REPLAY_INVARIANTS.changeEncoding ||
      expectString(invariants.highlightEncoding, "trace.replay.invariants.highlightEncoding") !==
        TRACE_REPLAY_INVARIANTS.highlightEncoding
    ) {
      throw new HttpError(400, "trace.replay must use the normalized TraceDeck invariants.");
    }
  }

  return derivedTrace;
}

function normalizeTags(value: unknown): string[] {
  if (value === undefined) {
    return [];
  }

  return Array.from(new Set(expectStringArray(value, "tags")));
}

function normalizeTimestamp(value: unknown, label: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const timestamp = expectString(value, label);
  const parsed = new Date(timestamp);

  if (Number.isNaN(parsed.getTime())) {
    throw new HttpError(400, `${label} must be a valid ISO timestamp.`);
  }

  return parsed.toISOString();
}

function parsePositiveInteger(
  value: unknown,
  label: string,
  fallback: number,
  max = maxPageSize
): number {
  if (value === undefined) {
    return fallback;
  }

  const parsed =
    typeof value === "string" ? Number.parseInt(value, 10) : expectInteger(value, label);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new HttpError(400, `${label} must be a positive integer.`);
  }

  return Math.min(parsed, max);
}

function parseNonNegativeInteger(value: unknown, label: string, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }

  const parsed =
    typeof value === "string" ? Number.parseInt(value, 10) : expectInteger(value, label);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new HttpError(400, `${label} must be a non-negative integer.`);
  }

  return parsed;
}

export function parseCreateRunBody(body: unknown): CreateRunRecordInput {
  const payload = expectRecord(body, "request body");
  const result: CreateRunRecordInput = {
    trace: parseTraceEnvelope(payload.trace),
    tags: normalizeTags(payload.tags)
  };
  const recordedAt = normalizeTimestamp(payload.recordedAt, "recordedAt");
  const presetId = expectOptionalString(payload.presetId, "presetId");
  const seed = expectOptionalInteger(payload.seed, "seed");

  if (recordedAt !== undefined) {
    result.recordedAt = recordedAt;
  }

  if (presetId !== undefined) {
    result.presetId = presetId;
  }

  if (seed !== undefined) {
    result.seed = seed;
  }

  return result;
}

export function parseRunListQuery(query: unknown): ListRunsQuery {
  const value = query ? expectRecord(query, "query") : {};
  const result: ListRunsQuery = {
    limit: parsePositiveInteger(value.limit, "limit", defaultPageSize)
  };
  const algorithmId = expectOptionalString(value.algorithmId, "algorithmId");
  const cursor = expectOptionalString(value.cursor, "cursor");

  if (algorithmId !== undefined) {
    result.algorithmId = algorithmId;
  }

  if (cursor !== undefined) {
    result.cursor = cursor;
  }

  return result;
}

export function parseStepListQuery(query: unknown): ListStepsQuery {
  const value = query ? expectRecord(query, "query") : {};

  return {
    offset: parseNonNegativeInteger(value.offset, "offset", 0),
    limit: parsePositiveInteger(value.limit, "limit", defaultPageSize)
  };
}

export function parseCreateComparisonBody(body: unknown): CreateComparisonInput {
  const payload = expectRecord(body, "request body");
  const result: CreateComparisonInput = {
    baseRunId: expectString(payload.baseRunId, "baseRunId"),
    candidateRunId: expectString(payload.candidateRunId, "candidateRunId")
  };
  const label = expectOptionalString(payload.label, "label");

  if (label !== undefined) {
    result.label = label;
  }

  if (payload.metricKeys !== undefined) {
    result.metricKeys = Array.from(new Set(expectStringArray(payload.metricKeys, "metricKeys")));
  }

  return result;
}

export function parseComparisonListQuery(query: unknown): ListComparisonsQuery {
  const value = query ? expectRecord(query, "query") : {};
  const result: ListComparisonsQuery = {
    limit: parsePositiveInteger(value.limit, "limit", defaultPageSize)
  };
  const runId = expectOptionalString(value.runId, "runId");
  const cursor = expectOptionalString(value.cursor, "cursor");

  if (runId !== undefined) {
    result.runId = runId;
  }

  if (cursor !== undefined) {
    result.cursor = cursor;
  }

  return result;
}

export function parseInputPresetListQuery(query: unknown): InputPresetListQuery {
  const value = query ? expectRecord(query, "query") : {};
  const result: InputPresetListQuery = {};
  const algorithmId = value.algorithmId;
  const domain = value.domain;

  if (algorithmId !== undefined) {
    result.algorithmId = expectAlgorithmId(algorithmId, "algorithmId");
  }

  if (domain !== undefined) {
    result.domain = expectDomain(domain, "domain");
  }

  return result;
}

export function parseResolveInputPresetBody(body: unknown): ResolveInputPresetInput {
  const payload = expectRecord(body, "request body");
  const result: ResolveInputPresetInput = {
    algorithmId: expectAlgorithmId(payload.algorithmId, "algorithmId")
  };
  const seed = expectOptionalInteger(payload.seed, "seed");
  const options = expectOptionalJsonObject(payload.options, "options");

  if (seed !== undefined) {
    result.seed = seed;
  }

  if (options !== undefined) {
    result.options = options;
  }

  return result;
}

export function parseValidateCustomInputBody(body: unknown): ValidateCustomInputInput {
  const payload = expectRecord(body, "request body");

  if (!Object.prototype.hasOwnProperty.call(payload, "payload")) {
    throw new HttpError(400, "payload is required.");
  }

  return {
    algorithmId: expectAlgorithmId(payload.algorithmId, "algorithmId"),
    payload: payload.payload
  };
}
