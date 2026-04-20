import { canonicalizeJson, type JsonObject, type JsonValue, type TraceChange, type TraceExplanation, type TraceHighlight, type TraceStep } from "./schema.js";

export interface TraceStepKeyContext {
  algorithmId: string;
  phase: string;
  index: number;
}

export interface CreateTraceRecorderOptions<RuntimeState, State extends JsonObject, MetricState> {
  algorithmId: string;
  projectState: (runtimeState: RuntimeState) => State;
  projectMetrics: (metrics: MetricState) => Record<string, number>;
  createStepKey?: (context: TraceStepKeyContext) => string;
  includeInitialMetricChanges?: boolean;
}

export interface TraceRecorderPushInput<RuntimeState, MetricState> {
  phase: string;
  description: string;
  explanation: TraceExplanation;
  runtimeState: RuntimeState;
  metrics: MetricState;
  highlights?: TraceHighlight[];
  additionalChanges?: TraceChange[];
}

export interface TraceRecorder<State extends JsonObject, RuntimeState, MetricState> {
  push: (input: TraceRecorderPushInput<RuntimeState, MetricState>) => TraceStep<State>;
  getSteps: () => TraceStep<State>[];
}

function slugifyTraceToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createTraceStepKey(context: TraceStepKeyContext): string {
  return `${context.algorithmId}-${context.index.toString().padStart(3, "0")}-${slugifyTraceToken(
    context.phase
  )}`;
}

function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneTraceExplanation(explanation: TraceExplanation): TraceExplanation {
  const clonedExplanation: TraceExplanation = {
    summary: explanation.summary
  };

  if (explanation.details !== undefined) {
    clonedExplanation.details = explanation.details;
  }

  if (explanation.tags !== undefined) {
    clonedExplanation.tags = explanation.tags.slice();
  }

  return clonedExplanation;
}

function cloneTraceHighlight(highlight: TraceHighlight): TraceHighlight {
  const clonedHighlight: TraceHighlight = {
    key: highlight.key,
    path: highlight.path,
    kind: highlight.kind,
    intent: highlight.intent
  };

  if (highlight.label !== undefined) {
    clonedHighlight.label = highlight.label;
  }

  if (highlight.metadata !== undefined) {
    clonedHighlight.metadata = canonicalizeJson(highlight.metadata);
  }

  return clonedHighlight;
}

function cloneTraceChange(change: TraceChange): TraceChange {
  const clonedChange: TraceChange = {
    path: change.path,
    op: change.op
  };

  if (change.previousValue !== undefined) {
    clonedChange.previousValue = canonicalizeJson(change.previousValue);
  }

  if (change.nextValue !== undefined) {
    clonedChange.nextValue = canonicalizeJson(change.nextValue);
  }

  return clonedChange;
}

function createStateChange(path: string, previousValue: JsonValue | undefined, nextValue: JsonValue): TraceChange {
  const change: TraceChange = {
    path,
    op: "set",
    nextValue
  };

  if (previousValue !== undefined) {
    change.previousValue = previousValue;
  }

  return change;
}

function createRemoveChange(path: string, previousValue: JsonValue | undefined): TraceChange {
  const change: TraceChange = {
    path,
    op: "remove"
  };

  if (previousValue !== undefined) {
    change.previousValue = previousValue;
  }

  return change;
}

export function diffTraceProjection(
  path: string,
  previousValue: JsonValue | undefined,
  nextValue: JsonValue
): TraceChange[] {
  if (previousValue === undefined) {
    if (isJsonObject(nextValue)) {
      const initialObjectChanges = Object.keys(nextValue)
        .sort((left, right) => left.localeCompare(right))
        .flatMap((key) =>
          diffTraceProjection(`${path}.${key}`, undefined, nextValue[key]!)
        );

      return initialObjectChanges.length > 0
        ? initialObjectChanges
        : [createStateChange(path, undefined, nextValue)];
    }

    return [createStateChange(path, undefined, nextValue)];
  }

  if (Array.isArray(previousValue) && Array.isArray(nextValue)) {
    return JSON.stringify(previousValue) === JSON.stringify(nextValue)
      ? []
      : [createStateChange(path, previousValue, nextValue)];
  }

  if (isJsonObject(previousValue) && isJsonObject(nextValue)) {
    return Array.from(new Set([...Object.keys(previousValue), ...Object.keys(nextValue)]))
      .sort((left, right) => left.localeCompare(right))
      .flatMap((key) => {
        const previousEntry = previousValue[key];
        const nextEntry = nextValue[key];

        if (nextEntry === undefined) {
          return [createRemoveChange(`${path}.${key}`, previousEntry)];
        }

        return diffTraceProjection(`${path}.${key}`, previousEntry, nextEntry);
      });
  }

  return previousValue === nextValue ? [] : [createStateChange(path, previousValue, nextValue)];
}

export function createTraceRecorder<RuntimeState, State extends JsonObject, MetricState>(
  options: CreateTraceRecorderOptions<RuntimeState, State, MetricState>
): TraceRecorder<State, RuntimeState, MetricState> {
  const steps: TraceStep<State>[] = [];
  let previousState: State | undefined;
  let previousMetrics: Record<string, number> | undefined;

  return {
    push(input) {
      const index = steps.length;
      const state = canonicalizeJson(options.projectState(input.runtimeState));
      const metrics = canonicalizeJson(options.projectMetrics(input.metrics));
      const key =
        options.createStepKey?.({
          algorithmId: options.algorithmId,
          phase: input.phase,
          index
        }) ??
        createTraceStepKey({
          algorithmId: options.algorithmId,
          phase: input.phase,
          index
        });
      const changes = [
        ...diffTraceProjection("state", previousState, state),
        ...((previousMetrics !== undefined || options.includeInitialMetricChanges === true)
          ? diffTraceProjection("metrics", previousMetrics, metrics)
          : []),
        ...(input.additionalChanges?.map((change) => cloneTraceChange(change)) ?? [])
      ];
      const step: TraceStep<State> = {
        index,
        key,
        phase: input.phase,
        description: input.description,
        explanation: cloneTraceExplanation(input.explanation),
        state,
        changes,
        highlights: input.highlights?.map((highlight) => cloneTraceHighlight(highlight)) ?? [],
        metrics
      };

      steps.push(step);
      previousState = state;
      previousMetrics = metrics;
      return step;
    },
    getSteps() {
      return steps.map((step) => ({
        ...step,
        explanation: cloneTraceExplanation(step.explanation),
        state: canonicalizeJson(step.state),
        changes: step.changes.map((change) => cloneTraceChange(change)),
        highlights: step.highlights.map((highlight) => cloneTraceHighlight(highlight)),
        metrics: {
          ...step.metrics
        }
      }));
    }
  };
}
