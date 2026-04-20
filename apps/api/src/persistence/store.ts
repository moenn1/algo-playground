import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  stableStringifyJson,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

import { HttpError } from "../lib/http.js";

import type {
  ComparisonRunReference,
  CreateComparisonInput,
  CreateRunRecordInput,
  ListComparisonsQuery,
  ListRunsQuery,
  ListStepsQuery,
  PaginatedResult,
  PersistedAlgorithmRecord,
  PersistedComparisonRecord,
  PersistedRunDetail,
  PersistedRunRecord,
  PersistedRunSummary,
  PersistenceMetadata,
  RunStepsPage,
  StorageSnapshot
} from "./types.js";

const storageSchemaVersion = 1;
const defaultDataFile = path.resolve(process.cwd(), ".tracedeck", "storage.json");

function createEmptySnapshot(): StorageSnapshot {
  return {
    storageSchemaVersion,
    algorithms: {},
    runs: {},
    runSteps: {},
    comparisons: {},
    indexes: {
      recentRunIds: [],
      runIdsByAlgorithmId: {},
      recentComparisonIds: [],
      comparisonIdsByRunId: {}
    }
  };
}

function createInputDigest(input: PersistedRunRecord["input"]) {
  return createHash("sha256").update(stableStringifyJson(input)).digest("hex");
}

function paginateIds(ids: string[], limit: number, cursor?: string) {
  if (!cursor) {
    return {
      ids: ids.slice(0, limit),
      nextCursor: ids.length > limit ? ids[limit - 1] : undefined
    };
  }

  const startIndex = ids.indexOf(cursor);

  if (startIndex === -1) {
    throw new HttpError(400, `Cursor "${cursor}" does not exist.`);
  }

  const pageIds = ids.slice(startIndex + 1, startIndex + 1 + limit);
  const nextCursor =
    ids.length > startIndex + 1 + limit ? pageIds[pageIds.length - 1] : undefined;

  return {
    ids: pageIds,
    nextCursor
  };
}

function toRunReference(run: PersistedRunRecord): ComparisonRunReference {
  return {
    id: run.id,
    algorithmId: run.algorithmId,
    algorithmLabel: run.algorithmLabel,
    recordedAt: run.recordedAt
  };
}

function calculateDelta(baseValue: number | null, candidateValue: number | null) {
  if (baseValue === null || candidateValue === null) {
    return null;
  }

  return candidateValue - baseValue;
}

function calculateDeltaRatio(baseValue: number | null, candidateValue: number | null) {
  if (baseValue === null || candidateValue === null || baseValue === 0) {
    return null;
  }

  return Number(((candidateValue - baseValue) / baseValue).toFixed(6));
}

function hydrateTrace(
  run: PersistedRunRecord,
  algorithm: PersistedAlgorithmRecord,
  steps: PersistedRunDetail["steps"]
): TraceEnvelope {
  return {
    schemaVersion: run.schemaVersion,
    algorithm,
    input: run.input,
    steps,
    replay: run.replay,
    summary: {
      stepCount: run.stepCount,
      stepKeys: run.stepKeys,
      comparisonMetricKeys: run.comparisonMetricKeys,
      metricDefinitions: run.metricDefinitions,
      finalMetrics: run.finalMetrics
    }
  };
}

function findComparableMetrics(
  baseRun: PersistedRunRecord,
  candidateRun: PersistedRunRecord
): TraceMetricDefinition[] {
  const candidateDefinitions = new Map(
    candidateRun.metricDefinitions.map((metric) => [metric.key, metric])
  );

  return baseRun.metricDefinitions.flatMap((metric) => {
    const candidateMetric = candidateDefinitions.get(metric.key);

    if (!candidateMetric) {
      return [];
    }

    if (
      !baseRun.comparisonMetricKeys.includes(metric.key) ||
      !candidateRun.comparisonMetricKeys.includes(metric.key)
    ) {
      return [];
    }

    if (
      candidateMetric.unit !== metric.unit ||
      candidateMetric.direction !== metric.direction
    ) {
      return [];
    }

    return [metric];
  });
}

export class TraceDeckPersistenceStore {
  private readonly dataFile: string;
  private snapshotPromise?: Promise<StorageSnapshot>;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(dataFile = defaultDataFile) {
    this.dataFile = path.resolve(dataFile);
  }

  async getMetadata(): Promise<PersistenceMetadata> {
    const snapshot = await this.loadSnapshot();

    return {
      storageSchemaVersion: snapshot.storageSchemaVersion,
      dataFile: this.dataFile,
      counts: {
        algorithms: Object.keys(snapshot.algorithms).length,
        runs: Object.keys(snapshot.runs).length,
        comparisons: Object.keys(snapshot.comparisons).length
      }
    };
  }

  async listAlgorithms(): Promise<PersistedAlgorithmRecord[]> {
    const snapshot = await this.loadSnapshot();

    return Object.values(snapshot.algorithms).sort((left, right) =>
      left.label.localeCompare(right.label)
    );
  }

  async createRun(input: CreateRunRecordInput): Promise<PersistedRunDetail> {
    return this.withWriteLock(async (snapshot) => {
      const trace = input.trace;
      const createdAt = new Date().toISOString();
      const recordedAt = input.recordedAt ?? createdAt;
      const runId = `run_${randomUUID()}`;
      const runRecord: PersistedRunRecord = {
        id: runId,
        algorithmId: trace.algorithm.id,
        algorithmLabel: trace.algorithm.label,
        algorithmDomain: trace.algorithm.domain,
        schemaVersion: trace.schemaVersion,
        createdAt,
        recordedAt,
        stepCount: trace.summary.stepCount,
        inputDigest: createInputDigest(trace.input),
        finalMetrics: {
          ...trace.summary.finalMetrics
        },
        comparisonMetricKeys: [...trace.summary.comparisonMetricKeys],
        tags: [...input.tags],
        input: trace.input,
        metricDefinitions: trace.summary.metricDefinitions.map((metric) => ({
          ...metric
        })),
        stepKeys: [...trace.summary.stepKeys],
        replay: {
          ...trace.replay,
          invariants: {
            ...trace.replay.invariants
          }
        },
        ...(input.presetId !== undefined ? { presetId: input.presetId } : {}),
        ...(input.seed !== undefined ? { seed: input.seed } : {})
      };

      snapshot.runs[runId] = runRecord;
      snapshot.runSteps[runId] = trace.steps.map((step) => ({
        ...step,
        explanation: {
          ...step.explanation,
          ...(step.explanation.tags !== undefined
            ? { tags: [...step.explanation.tags] }
            : {})
        },
        changes: step.changes.map((change) => ({ ...change })),
        highlights: step.highlights.map((highlight) => ({
          ...highlight,
          ...(highlight.metadata !== undefined
            ? { metadata: { ...highlight.metadata } }
            : {})
        })),
        metrics: { ...step.metrics },
        state: { ...step.state }
      }));
      snapshot.indexes.recentRunIds.unshift(runId);
      snapshot.indexes.runIdsByAlgorithmId[trace.algorithm.id] ??= [];
      const runIdsForAlgorithm = snapshot.indexes.runIdsByAlgorithmId[trace.algorithm.id]!;
      runIdsForAlgorithm.unshift(runId);

      const existingAlgorithm = snapshot.algorithms[trace.algorithm.id];

      snapshot.algorithms[trace.algorithm.id] = {
        ...trace.algorithm,
        createdAt: existingAlgorithm?.createdAt ?? createdAt,
        updatedAt: createdAt,
        runCount: (existingAlgorithm?.runCount ?? 0) + 1,
        latestRunId: runId,
        lastRunAt: recordedAt
      };

      const algorithm = snapshot.algorithms[trace.algorithm.id];
      const steps = snapshot.runSteps[runId];

      if (!algorithm || !steps) {
        throw new HttpError(500, `Run "${runId}" is missing its persisted storage state.`);
      }

      return {
        ...runRecord,
        algorithm,
        steps,
        trace: hydrateTrace(runRecord, algorithm, steps)
      };
    });
  }

  async listRuns(query: ListRunsQuery): Promise<PaginatedResult<PersistedRunSummary>> {
    const snapshot = await this.loadSnapshot();
    const runIds = query.algorithmId
      ? (snapshot.indexes.runIdsByAlgorithmId[query.algorithmId] ?? [])
      : snapshot.indexes.recentRunIds;
    const page = paginateIds(runIds, query.limit, query.cursor);
    const result: PaginatedResult<PersistedRunSummary> = {
      items: page.ids
        .map((runId) => snapshot.runs[runId])
        .filter((run): run is PersistedRunRecord => Boolean(run))
    };

    if (page.nextCursor !== undefined) {
      result.nextCursor = page.nextCursor;
    }

    return result;
  }

  async getRun(runId: string): Promise<PersistedRunDetail> {
    const snapshot = await this.loadSnapshot();
    const run = snapshot.runs[runId];

    if (!run) {
      throw new HttpError(404, `Run "${runId}" was not found.`);
    }

    const algorithm = snapshot.algorithms[run.algorithmId];
    const steps = snapshot.runSteps[runId];

    if (!algorithm || !steps) {
      throw new HttpError(500, `Run "${runId}" is missing its persisted trace data.`);
    }

    return {
      ...run,
      algorithm,
      steps,
      trace: hydrateTrace(run, algorithm, steps)
    };
  }

  async getRunSteps(runId: string, query: ListStepsQuery): Promise<RunStepsPage> {
    const snapshot = await this.loadSnapshot();
    const steps = snapshot.runSteps[runId];

    if (!steps) {
      throw new HttpError(404, `Run "${runId}" was not found.`);
    }

    const items = steps.slice(query.offset, query.offset + query.limit);

    return {
      items,
      total: steps.length,
      offset: query.offset,
      limit: query.limit,
      hasMore: query.offset + query.limit < steps.length
    };
  }

  async createComparison(input: CreateComparisonInput): Promise<PersistedComparisonRecord> {
    return this.withWriteLock(async (snapshot) => {
      const baseRun = snapshot.runs[input.baseRunId];
      const candidateRun = snapshot.runs[input.candidateRunId];

      if (!baseRun) {
        throw new HttpError(404, `Run "${input.baseRunId}" was not found.`);
      }

      if (!candidateRun) {
        throw new HttpError(404, `Run "${input.candidateRunId}" was not found.`);
      }

      const availableMetrics = findComparableMetrics(baseRun, candidateRun);
      const selectedMetricKeys = input.metricKeys ?? availableMetrics.map((metric) => metric.key);

      if (selectedMetricKeys.length === 0) {
        throw new HttpError(
          400,
          "The selected runs do not share any compatible comparison metrics."
        );
      }

      const metrics = selectedMetricKeys.map((metricKey) => {
        const metric = availableMetrics.find((entry) => entry.key === metricKey);

        if (!metric) {
          throw new HttpError(
            400,
            `Metric "${metricKey}" is not comparable between the selected runs.`
          );
        }

        const baseValue = baseRun.finalMetrics[metric.key] ?? null;
        const candidateValue = candidateRun.finalMetrics[metric.key] ?? null;

        return {
          ...metric,
          baseValue,
          candidateValue,
          delta: calculateDelta(baseValue, candidateValue),
          deltaRatio: calculateDeltaRatio(baseValue, candidateValue)
        };
      });

      const comparisonRecord: PersistedComparisonRecord = {
        id: `cmp_${randomUUID()}`,
        createdAt: new Date().toISOString(),
        baseRun: toRunReference(baseRun),
        candidateRun: toRunReference(candidateRun),
        metricKeys: metrics.map((metric) => metric.key),
        metrics,
        ...(input.label !== undefined ? { label: input.label } : {})
      };

      snapshot.comparisons[comparisonRecord.id] = comparisonRecord;
      snapshot.indexes.recentComparisonIds.unshift(comparisonRecord.id);

      for (const runId of new Set([baseRun.id, candidateRun.id])) {
        snapshot.indexes.comparisonIdsByRunId[runId] ??= [];
        snapshot.indexes.comparisonIdsByRunId[runId].unshift(comparisonRecord.id);
      }

      return comparisonRecord;
    });
  }

  async listComparisons(
    query: ListComparisonsQuery
  ): Promise<PaginatedResult<PersistedComparisonRecord>> {
    const snapshot = await this.loadSnapshot();
    const comparisonIds = query.runId
      ? (snapshot.indexes.comparisonIdsByRunId[query.runId] ?? [])
      : snapshot.indexes.recentComparisonIds;
    const page = paginateIds(comparisonIds, query.limit, query.cursor);
    const result: PaginatedResult<PersistedComparisonRecord> = {
      items: page.ids
        .map((comparisonId) => snapshot.comparisons[comparisonId])
        .filter((comparison): comparison is PersistedComparisonRecord => Boolean(comparison))
    };

    if (page.nextCursor !== undefined) {
      result.nextCursor = page.nextCursor;
    }

    return result;
  }

  async getComparison(comparisonId: string): Promise<PersistedComparisonRecord> {
    const snapshot = await this.loadSnapshot();
    const comparison = snapshot.comparisons[comparisonId];

    if (!comparison) {
      throw new HttpError(404, `Comparison "${comparisonId}" was not found.`);
    }

    return comparison;
  }

  private async loadSnapshot() {
    if (!this.snapshotPromise) {
      this.snapshotPromise = this.readSnapshot();
    }

    return this.snapshotPromise;
  }

  private async readSnapshot() {
    try {
      const raw = await readFile(this.dataFile, "utf8");
      const snapshot = JSON.parse(raw) as StorageSnapshot;

      if (snapshot.storageSchemaVersion !== storageSchemaVersion) {
        throw new HttpError(
          500,
          `Unsupported storage schema version "${snapshot.storageSchemaVersion}".`
        );
      }

      return snapshot;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return createEmptySnapshot();
      }

      throw error;
    }
  }

  private async withWriteLock<T>(work: (snapshot: StorageSnapshot) => Promise<T> | T) {
    const operation = this.writeQueue.then(async () => {
      const snapshot = await this.loadSnapshot();
      const result = await work(snapshot);
      await this.persistSnapshot(snapshot);
      return result;
    });

    this.writeQueue = operation.then(
      () => undefined,
      () => undefined
    );

    return operation;
  }

  private async persistSnapshot(snapshot: StorageSnapshot) {
    await mkdir(path.dirname(this.dataFile), { recursive: true });

    const tempFile = `${this.dataFile}.${randomUUID()}.tmp`;

    await writeFile(tempFile, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    await rename(tempFile, this.dataFile);
  }
}
