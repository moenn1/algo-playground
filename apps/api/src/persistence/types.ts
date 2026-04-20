import type {
  JsonValue,
  TraceAlgorithmDescriptor,
  TraceEnvelope,
  TraceMetricDefinition,
  TraceReplayDescriptor,
  TraceStep
} from "@tracedeck/trace-core";

export interface PersistedAlgorithmRecord extends TraceAlgorithmDescriptor {
  createdAt: string;
  updatedAt: string;
  runCount: number;
  latestRunId?: string;
  lastRunAt?: string;
}

export interface PersistedRunSummary {
  id: string;
  algorithmId: string;
  algorithmLabel: string;
  algorithmDomain: TraceAlgorithmDescriptor["domain"];
  schemaVersion: string;
  createdAt: string;
  recordedAt: string;
  stepCount: number;
  inputDigest: string;
  finalMetrics: Record<string, number>;
  comparisonMetricKeys: string[];
  tags: string[];
  presetId?: string;
  seed?: number;
}

export interface PersistedRunRecord extends PersistedRunSummary {
  input: JsonValue;
  metricDefinitions: TraceMetricDefinition[];
  stepKeys: string[];
  replay: TraceReplayDescriptor;
}

export interface PersistedRunDetail extends PersistedRunRecord {
  algorithm: TraceAlgorithmDescriptor;
  steps: TraceStep[];
  trace: TraceEnvelope;
}

export interface ComparisonRunReference {
  id: string;
  algorithmId: string;
  algorithmLabel: string;
  recordedAt: string;
}

export interface PersistedComparisonMetric extends TraceMetricDefinition {
  baseValue: number | null;
  candidateValue: number | null;
  delta: number | null;
  deltaRatio: number | null;
}

export interface PersistedComparisonRecord {
  id: string;
  createdAt: string;
  label?: string;
  baseRun: ComparisonRunReference;
  candidateRun: ComparisonRunReference;
  metricKeys: string[];
  metrics: PersistedComparisonMetric[];
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string;
}

export interface ListRunsQuery {
  algorithmId?: string;
  cursor?: string;
  limit: number;
}

export interface ListComparisonsQuery {
  runId?: string;
  cursor?: string;
  limit: number;
}

export interface ListStepsQuery {
  offset: number;
  limit: number;
}

export interface RunStepsPage {
  items: TraceStep[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface CreateRunRecordInput {
  trace: TraceEnvelope;
  recordedAt?: string;
  presetId?: string;
  seed?: number;
  tags: string[];
}

export interface CreateComparisonInput {
  baseRunId: string;
  candidateRunId: string;
  label?: string;
  metricKeys?: string[];
}

export interface PersistenceMetadata {
  storageSchemaVersion: number;
  dataFile: string;
  counts: {
    algorithms: number;
    runs: number;
    comparisons: number;
  };
}

export interface StorageSnapshot {
  storageSchemaVersion: number;
  algorithms: Record<string, PersistedAlgorithmRecord>;
  runs: Record<string, PersistedRunRecord>;
  runSteps: Record<string, TraceStep[]>;
  comparisons: Record<string, PersistedComparisonRecord>;
  indexes: {
    recentRunIds: string[];
    runIdsByAlgorithmId: Record<string, string[]>;
    recentComparisonIds: string[];
    comparisonIdsByRunId: Record<string, string[]>;
  };
}
