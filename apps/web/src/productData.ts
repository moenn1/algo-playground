import type { TraceAlgorithmDescriptor, TraceMetricDefinition } from "@tracedeck/trace-core";

import { getAlgorithmById, type ReplayRun } from "./replay.js";

export type PersistedAlgorithmRecord = TraceAlgorithmDescriptor & {
  createdAt: string;
  updatedAt: string;
  runCount: number;
  latestRunId?: string;
  lastRunAt?: string;
};

export type PersistedRunSummary = {
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
};

export type PersistedRunDetail = PersistedRunSummary & {
  input: unknown;
  metricDefinitions: TraceMetricDefinition[];
  stepKeys: string[];
  replay: {
    entryStepKey: string;
    terminalStepKey: string;
  };
  algorithm: TraceAlgorithmDescriptor;
  steps: unknown[];
  trace: ReplayRun["trace"];
};

export type PersistedComparisonMetric = TraceMetricDefinition & {
  baseValue: number | null;
  candidateValue: number | null;
  delta: number | null;
  deltaRatio: number | null;
};

export type PersistedComparisonRecord = {
  id: string;
  createdAt: string;
  label?: string;
  baseRun: {
    id: string;
    algorithmId: string;
    algorithmLabel: string;
    recordedAt: string;
  };
  candidateRun: {
    id: string;
    algorithmId: string;
    algorithmLabel: string;
    recordedAt: string;
  };
  metricKeys: string[];
  metrics: PersistedComparisonMetric[];
};

export type PersistenceMetadata = {
  storageSchemaVersion: number;
  dataFile: string;
  counts: {
    algorithms: number;
    runs: number;
    comparisons: number;
  };
};

type PaginatedResult<T> = {
  items: T[];
  nextCursor?: string;
};

export type ProductDataPayload = {
  foundation: {
    product: string;
    priorities: string[];
    services: Array<{
      name: string;
      role: string;
    }>;
  };
  persistence: PersistenceMetadata;
  algorithms: PersistedAlgorithmRecord[];
  runs: PersistedRunSummary[];
  comparisons: PersistedComparisonRecord[];
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed for "${url}" with status ${response.status}.`);
  }

  return (await response.json()) as T;
}

export async function fetchProductData(): Promise<ProductDataPayload> {
  const [foundation, persistence, algorithmPayload, runPayload, comparisonPayload] =
    await Promise.all([
      fetchJson<ProductDataPayload["foundation"]>("/api/foundation"),
      fetchJson<PersistenceMetadata>("/api/persistence"),
      fetchJson<{ items: PersistedAlgorithmRecord[] }>("/api/algorithms"),
      fetchJson<PaginatedResult<PersistedRunSummary>>("/api/runs?limit=8"),
      fetchJson<PaginatedResult<PersistedComparisonRecord>>("/api/comparisons?limit=6")
    ]);

  return {
    foundation,
    persistence,
    algorithms: algorithmPayload.items,
    runs: runPayload.items,
    comparisons: comparisonPayload.items
  };
}

export async function fetchPersistedRunDetail(runId: string): Promise<PersistedRunDetail> {
  return fetchJson<PersistedRunDetail>(`/api/runs/${runId}`);
}

function formatPersistedInput(input: unknown): string {
  if (Array.isArray(input)) {
    return input.join(", ");
  }

  return JSON.stringify(input, null, 2);
}

export function hydratePersistedRun(detail: PersistedRunDetail): ReplayRun {
  const algorithm = getAlgorithmById(detail.algorithmId);

  return {
    algorithm,
    input: detail.input as ReplayRun["input"],
    normalizedInputText: formatPersistedInput(detail.input),
    trace: detail.trace
  } as ReplayRun;
}
