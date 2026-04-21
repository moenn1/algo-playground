import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buildServer } from "../src/server.js";

const servers: ReturnType<typeof buildServer>[] = [];
let tempDir: string;
let originalTraceDeckDataFile: string | undefined;

function createTracePayload(values: number[], comparisons: number) {
  const sortedValues = [...values].sort((left, right) => left - right);

  return {
    schemaVersion: "0.2.0",
    algorithm: {
      id: "bubble-sort",
      label: "Bubble Sort",
      domain: "sorting",
      implementationVersion: "0.2.0"
    },
    input: values,
    steps: [
      {
        index: 0,
        key: "start",
        phase: "start",
        description: "Initial array snapshot",
        explanation: {
          summary: "Capture the initial state."
        },
        state: {
          values
        },
        changes: [
          {
            path: "values",
            op: "set",
            nextValue: values
          }
        ],
        highlights: [
          {
            key: "array",
            path: "values",
            kind: "collection",
            intent: "focus",
            label: "Input"
          }
        ],
        metrics: {
          comparisons: 0,
          swaps: 0
        }
      },
      {
        index: 1,
        key: "complete",
        phase: "complete",
        description: "Sorted output",
        explanation: {
          summary: "Emit the sorted state."
        },
        state: {
          values: sortedValues
        },
        changes: [
          {
            path: "values",
            op: "set",
            previousValue: values,
            nextValue: sortedValues
          }
        ],
        highlights: [
          {
            key: "result",
            path: "values",
            kind: "collection",
            intent: "result",
            label: "Sorted"
          }
        ],
        metrics: {
          comparisons,
          swaps: 2
        }
      }
    ],
    replay: {
      initialStepIndex: 0,
      finalStepIndex: 1,
      invariants: {
        stateEncoding: "canonical-json",
        stepOrdering: "contiguous-zero-based",
        replayStrategy: "full-snapshot",
        changeEncoding: "path-based-explicit-values",
        highlightEncoding: "structured-selectors"
      }
    },
    summary: {
      stepCount: 2,
      stepKeys: ["start", "complete"],
      comparisonMetricKeys: ["comparisons", "swaps"],
      metricDefinitions: [
        {
          key: "comparisons",
          label: "Comparisons",
          unit: "count",
          direction: "lower-is-better"
        },
        {
          key: "swaps",
          label: "Swaps",
          unit: "count",
          direction: "lower-is-better"
        }
      ],
      finalMetrics: {
        comparisons,
        swaps: 2
      }
    }
  };
}

async function createServer() {
  const dataFile = path.join(tempDir, "storage.json");
  const server = buildServer({
    dataFile
  });

  servers.push(server);

  return server;
}

beforeEach(async () => {
  originalTraceDeckDataFile = process.env.TRACEDECK_DATA_FILE;
  delete process.env.TRACEDECK_DATA_FILE;
  tempDir = await mkdtemp(path.join(os.tmpdir(), "tracedeck-api-test-"));
});

afterEach(async () => {
  while (servers.length > 0) {
    const server = servers.pop();

    if (server) {
      await server.close();
    }
  }

  await rm(tempDir, { recursive: true, force: true });

  if (originalTraceDeckDataFile === undefined) {
    delete process.env.TRACEDECK_DATA_FILE;
  } else {
    process.env.TRACEDECK_DATA_FILE = originalTraceDeckDataFile;
  }
});

describe("TraceDeck API foundation", () => {
  it("returns a health response", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "GET",
      url: "/health"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "ok",
      service: "tracedeck-api"
    });
  });

  it("returns the foundation metadata contract", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "GET",
      url: "/api/foundation"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      product: "TraceDeck"
    });
  });

  it("persists runs, algorithms, and paged step retrieval", async () => {
    const server = await createServer();

    const createRun = await server.inject({
      method: "POST",
      url: "/api/runs",
      payload: {
        trace: createTracePayload([5, 1, 3], 3),
        recordedAt: "2026-04-20T21:00:00.000Z",
        presetId: "sorting/baseline",
        seed: 17,
        tags: ["sorting", "baseline"]
      }
    });

    expect(createRun.statusCode).toBe(201);

    const run = createRun.json();

    expect(run.algorithm.id).toBe("bubble-sort");
    expect(run.stepCount).toBe(2);
    expect(run.finalMetrics).toEqual({
      comparisons: 3,
      swaps: 2
    });

    const listRuns = await server.inject({
      method: "GET",
      url: "/api/runs?algorithmId=bubble-sort&limit=10"
    });

    expect(listRuns.statusCode).toBe(200);
    expect(listRuns.json().items).toHaveLength(1);

    const getSteps = await server.inject({
      method: "GET",
      url: `/api/runs/${run.id}/steps?offset=1&limit=1`
    });

    expect(getSteps.statusCode).toBe(200);
    expect(getSteps.json()).toMatchObject({
      total: 2,
      hasMore: false
    });
    expect(getSteps.json().items[0].phase).toBe("complete");

    const algorithms = await server.inject({
      method: "GET",
      url: "/api/algorithms"
    });

    expect(algorithms.statusCode).toBe(200);
    expect(algorithms.json().items[0]).toMatchObject({
      id: "bubble-sort",
      runCount: 1
    });

    const metadata = await server.inject({
      method: "GET",
      url: "/api/persistence"
    });

    expect(metadata.statusCode).toBe(200);
    expect(metadata.json()).toMatchObject({
      storageSchemaVersion: 1,
      counts: {
        algorithms: 1,
        runs: 1,
        comparisons: 0
      }
    });
  });

  it("keeps persisted runs available after a server restart", async () => {
    const firstServer = await createServer();

    const created = await firstServer.inject({
      method: "POST",
      url: "/api/runs",
      payload: {
        trace: createTracePayload([9, 2, 4], 5),
        tags: ["durable"]
      }
    });

    expect(created.statusCode).toBe(201);
    const runId = created.json().id as string;

    await firstServer.close();
    servers.pop();

    const secondServer = buildServer({
      dataFile: path.join(tempDir, "storage.json")
    });
    servers.push(secondServer);

    const response = await secondServer.inject({
      method: "GET",
      url: `/api/runs/${runId}`
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: runId,
      stepCount: 2
    });
  });

  it("honors TRACEDECK_DATA_FILE when booting without an explicit dataFile option", async () => {
    const envDataFile = path.join(tempDir, "env-storage.json");
    process.env.TRACEDECK_DATA_FILE = envDataFile;

    const firstServer = buildServer();
    servers.push(firstServer);

    const created = await firstServer.inject({
      method: "POST",
      url: "/api/runs",
      payload: {
        trace: createTracePayload([4, 2, 7], 4),
        tags: ["env-configured"]
      }
    });

    expect(created.statusCode).toBe(201);
    const runId = created.json().id as string;

    const metadata = await firstServer.inject({
      method: "GET",
      url: "/api/persistence"
    });

    expect(metadata.statusCode).toBe(200);
    expect(metadata.json()).toMatchObject({
      dataFile: envDataFile
    });

    await firstServer.close();
    servers.pop();

    const secondServer = buildServer();
    servers.push(secondServer);

    const response = await secondServer.inject({
      method: "GET",
      url: `/api/runs/${runId}`
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: runId,
      stepCount: 2
    });
  });

  it("creates comparison records from persisted runs", async () => {
    const server = await createServer();

    const baseline = await server.inject({
      method: "POST",
      url: "/api/runs",
      payload: {
        trace: createTracePayload([6, 2, 1], 6),
        tags: ["baseline"]
      }
    });
    const candidate = await server.inject({
      method: "POST",
      url: "/api/runs",
      payload: {
        trace: createTracePayload([6, 2, 1], 4),
        tags: ["candidate"]
      }
    });

    const response = await server.inject({
      method: "POST",
      url: "/api/comparisons",
      payload: {
        baseRunId: baseline.json().id,
        candidateRunId: candidate.json().id,
        label: "Bubble Sort tuning"
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      label: "Bubble Sort tuning",
      metricKeys: ["comparisons", "swaps"]
    });
    expect(response.json().metrics[0]).toMatchObject({
      key: "comparisons",
      baseValue: 6,
      candidateValue: 4,
      delta: -2
    });

    const listResponse = await server.inject({
      method: "GET",
      url: `/api/comparisons?runId=${baseline.json().id}`
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().items).toHaveLength(1);
  });

  it("rejects invalid traces before writing them to storage", async () => {
    const server = await createServer();
    const invalidTrace = createTracePayload([5, 1, 3], 3);

    invalidTrace.summary.stepCount = 99;

    const response = await server.inject({
      method: "POST",
      url: "/api/runs",
      payload: {
        trace: invalidTrace
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "Trace summary stepCount must match the number of emitted steps."
    });
  });

  it("lists input presets and resolves seeded sorting scenarios deterministically", async () => {
    const server = await createServer();

    const listResponse = await server.inject({
      method: "GET",
      url: "/api/input-presets?algorithmId=bubble-sort"
    });

    expect(listResponse.statusCode).toBe(200);
    expect(
      listResponse.json().items.map((item: { id: string }) => item.id)
    ).toEqual(
      expect.arrayContaining([
        "sorting.baseline",
        "sorting.reverse-sorted",
        "sorting.nearly-sorted",
        "sorting.random-distinct"
      ])
    );

    const resolveResponse = await server.inject({
      method: "POST",
      url: "/api/input-presets/sorting.random-distinct/resolve",
      payload: {
        algorithmId: "bubble-sort",
        seed: 11,
        options: {
          size: 5,
          minimum: 10,
          maximum: 30
        }
      }
    });

    expect(resolveResponse.statusCode).toBe(200);
    expect(resolveResponse.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "sorting.random-distinct"
      },
      algorithm: {
        id: "bubble-sort",
        domain: "sorting"
      },
      seed: 11,
      options: {
        size: 5,
        minimum: 10,
        maximum: 30
      },
      footprint: "5 lanes"
    });
    expect((resolveResponse.json().input as number[])).toHaveLength(5);
    expect(new Set(resolveResponse.json().input as number[]).size).toBe(5);

    const repeatedResolve = await server.inject({
      method: "POST",
      url: "/api/input-presets/sorting.random-distinct/resolve",
      payload: {
        algorithmId: "bubble-sort",
        seed: 11,
        options: {
          size: 5,
          minimum: 10,
          maximum: 30
        }
      }
    });

    expect(repeatedResolve.statusCode).toBe(200);
    expect(repeatedResolve.json().input).toEqual(resolveResponse.json().input);
  });

  it("resolves graph and window presets and validates custom inputs", async () => {
    const server = await createServer();

    const graphPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.random-network/resolve",
      payload: {
        algorithmId: "bfs",
        seed: 29,
        options: {
          nodes: 5,
          extraEdges: 2,
          directed: false
        }
      }
    });

    expect(graphPreset.statusCode).toBe(200);
    expect(graphPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.random-network"
      },
      algorithm: {
        id: "bfs",
        domain: "graph"
      },
      seed: 29,
      footprint: "5 nodes / 6 edges"
    });
    expect(graphPreset.json().input.start).toBe("A");
    expect(graphPreset.json().input.target).toBe("E");

    const searchPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/search.reference-hit/resolve",
      payload: {
        algorithmId: "binary-search"
      }
    });

    expect(searchPreset.statusCode).toBe(200);
    expect(searchPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "search.reference-hit"
      },
      algorithm: {
        id: "binary-search",
        domain: "search"
      },
      footprint: "9 lanes / target 23"
    });

    const windowPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/window.reference-target/resolve",
      payload: {
        algorithmId: "minimum-size-subarray-sum"
      }
    });

    expect(windowPreset.statusCode).toBe(200);
    expect(windowPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "window.reference-target"
      },
      algorithm: {
        id: "minimum-size-subarray-sum",
        domain: "window"
      },
      footprint: "6 lanes / target 7"
    });

    const intervalPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/interval.reference-overlap/resolve",
      payload: {
        algorithmId: "merge-intervals"
      }
    });

    expect(intervalPreset.statusCode).toBe(200);
    expect(intervalPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "interval.reference-overlap"
      },
      algorithm: {
        id: "merge-intervals",
        domain: "interval"
      },
      footprint: "4 intervals"
    });

    const dynamicProgrammingPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/dynamic-programming.reference-overlap/resolve",
      payload: {
        algorithmId: "longest-common-subsequence"
      }
    });

    expect(dynamicProgrammingPreset.statusCode).toBe(200);
    expect(dynamicProgrammingPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "dynamic-programming.reference-overlap"
      },
      algorithm: {
        id: "longest-common-subsequence",
        domain: "dynamic-programming"
      },
      footprint: "7 x 7 table"
    });

    const stackPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/stack.reference-valid/resolve",
      payload: {
        algorithmId: "valid-parentheses"
      }
    });

    expect(stackPreset.statusCode).toBe(200);
    expect(stackPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "stack.reference-valid"
      },
      algorithm: {
        id: "valid-parentheses",
        domain: "stack"
      },
      footprint: "8 tokens"
    });

    const validateSortingInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "merge-sort",
        payload: "9, 4, 1, 7"
      }
    });

    expect(validateSortingInput.statusCode).toBe(200);
    expect(validateSortingInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "merge-sort",
        domain: "sorting"
      },
      input: [9, 4, 1, 7],
      normalizedInputText: "9, 4, 1, 7",
      footprint: "4 lanes"
    });

    const validateSearchInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "binary-search",
        payload: {
          array: [4, 9, 12, 18, 27],
          target: 18
        }
      }
    });

    expect(validateSearchInput.statusCode).toBe(200);
    expect(validateSearchInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "binary-search",
        domain: "search"
      },
      input: {
        array: [4, 9, 12, 18, 27],
        target: 18
      },
      footprint: "5 lanes / target 18"
    });

    const validateWindowInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "minimum-size-subarray-sum",
        payload: {
          array: [5, 1, 3, 5, 10, 7],
          target: 15
        }
      }
    });

    expect(validateWindowInput.statusCode).toBe(200);
    expect(validateWindowInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "minimum-size-subarray-sum",
        domain: "window"
      },
      input: {
        array: [5, 1, 3, 5, 10, 7],
        target: 15
      },
      footprint: "6 lanes / target 15"
    });

    const validateIntervalInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "merge-intervals",
        payload: {
          intervals: [
            [1, 4],
            [4, 5],
            [9, 11]
          ]
        }
      }
    });

    expect(validateIntervalInput.statusCode).toBe(200);
    expect(validateIntervalInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "merge-intervals",
        domain: "interval"
      },
      input: {
        intervals: [
          [1, 4],
          [4, 5],
          [9, 11]
        ]
      },
      footprint: "3 intervals"
    });

    const validateDynamicProgrammingInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "longest-common-subsequence",
        payload: {
          left: "BANANA",
          right: "ATANA"
        }
      }
    });

    expect(validateDynamicProgrammingInput.statusCode).toBe(200);
    expect(validateDynamicProgrammingInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "longest-common-subsequence",
        domain: "dynamic-programming"
      },
      input: {
        left: "BANANA",
        right: "ATANA"
      },
      footprint: "6 x 5 table"
    });

    const validateStackInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "valid-parentheses",
        payload: {
          expression: "([]{})"
        }
      }
    });

    expect(validateStackInput.statusCode).toBe(200);
    expect(validateStackInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "valid-parentheses",
        domain: "stack"
      },
      input: {
        expression: "([]{})"
      },
      footprint: "6 tokens"
    });
  });

  it("rejects custom graph payloads whose edges reference missing nodes", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "dijkstra",
        payload: {
          nodes: ["A", "B"],
          edges: [["A", "C", 3]],
          start: "A",
          target: "B",
          directed: false
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "Every graph edge endpoint must exist in nodes."
    });
  });
});
