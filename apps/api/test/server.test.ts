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

  it("resolves hash presets and validates custom Two Sum inputs", async () => {
    const server = await createServer();

    const presetResponse = await server.inject({
      method: "POST",
      url: "/api/input-presets/hash.reference-hit/resolve",
      payload: {
        algorithmId: "two-sum"
      }
    });

    expect(presetResponse.statusCode).toBe(200);
    expect(presetResponse.json()).toMatchObject({
      algorithm: {
        id: "two-sum",
        domain: "hash"
      },
      preset: {
        id: "hash.reference-hit",
        domain: "hash"
      },
      footprint: "4 lanes / target 9"
    });

    const validateResponse = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "two-sum",
        payload: {
          array: [-3, 4, 3, 90],
          target: 0
        }
      }
    });

    expect(validateResponse.statusCode).toBe(200);
    expect(validateResponse.json()).toMatchObject({
      algorithm: {
        id: "two-sum",
        domain: "hash"
      },
      footprint: "4 lanes / target 0"
    });
  });

  it("resolves heap presets and validates custom heap inputs", async () => {
    const server = await createServer();

    const presetResponse = await server.inject({
      method: "POST",
      url: "/api/input-presets/heap.reference-kth/resolve",
      payload: {
        algorithmId: "kth-largest-element-in-an-array"
      }
    });

    expect(presetResponse.statusCode).toBe(200);
    expect(presetResponse.json()).toMatchObject({
      algorithm: {
        id: "kth-largest-element-in-an-array",
        domain: "heap"
      },
      preset: {
        id: "heap.reference-kth",
        domain: "heap"
      },
      footprint: "6 lanes / k 2"
    });

    const validateResponse = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "kth-largest-element-in-an-array",
        payload: {
          array: [3, 2, 3, 1, 2, 4, 5, 5, 6],
          k: 4
        }
      }
    });

    expect(validateResponse.statusCode).toBe(200);
    expect(validateResponse.json()).toMatchObject({
      algorithm: {
        id: "kth-largest-element-in-an-array",
        domain: "heap"
      },
      footprint: "9 lanes / k 4"
    });

    const topKPresetResponse = await server.inject({
      method: "POST",
      url: "/api/input-presets/heap.reference-top-frequencies/resolve",
      payload: {
        algorithmId: "top-k-frequent-elements"
      }
    });

    expect(topKPresetResponse.statusCode).toBe(200);
    expect(topKPresetResponse.json()).toMatchObject({
      algorithm: {
        id: "top-k-frequent-elements",
        domain: "heap"
      },
      preset: {
        id: "heap.reference-top-frequencies",
        domain: "heap"
      },
      footprint: "6 lanes / k 2"
    });

    const topKValidateResponse = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "top-k-frequent-elements",
        payload: {
          array: [4, 1, -1, 2, -1, 2, 3, 3],
          k: 2
        }
      }
    });

    expect(topKValidateResponse.statusCode).toBe(200);
    expect(topKValidateResponse.json()).toMatchObject({
      algorithm: {
        id: "top-k-frequent-elements",
        domain: "heap"
      },
      footprint: "8 lanes / k 2"
    });
  });

  it("rejects top-k-frequent payloads whose k exceeds the distinct value count", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "top-k-frequent-elements",
        payload: {
          array: [1, 1, 2, 2, 3],
          k: 4
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "Top K Frequent Elements input k must be between 1 and the number of distinct values."
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

    const insertionPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/sorting.baseline/resolve",
      payload: {
        algorithmId: "insertion-sort"
      }
    });

    expect(insertionPreset.statusCode).toBe(200);
    expect(insertionPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "sorting.baseline"
      },
      algorithm: {
        id: "insertion-sort",
        domain: "sorting"
      },
      footprint: "7 lanes"
    });

    const shellSortPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/sorting.baseline/resolve",
      payload: {
        algorithmId: "shell-sort"
      }
    });

    expect(shellSortPreset.statusCode).toBe(200);
    expect(shellSortPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "sorting.baseline"
      },
      algorithm: {
        id: "shell-sort",
        domain: "sorting"
      },
      footprint: "7 lanes"
    });

    const heapSortPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/sorting.baseline/resolve",
      payload: {
        algorithmId: "heap-sort"
      }
    });

    expect(heapSortPreset.statusCode).toBe(200);
    expect(heapSortPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "sorting.baseline"
      },
      algorithm: {
        id: "heap-sort",
        domain: "sorting"
      },
      footprint: "7 lanes"
    });
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

    const dfsPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-route/resolve",
      payload: {
        algorithmId: "dfs"
      }
    });

    expect(dfsPreset.statusCode).toBe(200);
    expect(dfsPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-route"
      },
      algorithm: {
        id: "dfs",
        domain: "graph"
      },
      footprint: "6 nodes / 9 edges"
    });

    const referenceBroadcastPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-broadcast/resolve",
      payload: {
        algorithmId: "network-delay-time"
      }
    });

    expect(referenceBroadcastPreset.statusCode).toBe(200);
    expect(referenceBroadcastPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-broadcast"
      },
      algorithm: {
        id: "network-delay-time",
        domain: "graph"
      },
      footprint: "5 nodes / 7 edges"
    });

    const unreachableBroadcastPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.unreachable-broadcast/resolve",
      payload: {
        algorithmId: "network-delay-time"
      }
    });

    expect(unreachableBroadcastPreset.statusCode).toBe(200);
    expect(unreachableBroadcastPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.unreachable-broadcast"
      },
      algorithm: {
        id: "network-delay-time",
        domain: "graph"
      },
      footprint: "5 nodes / 3 edges"
    });

    const clonePreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-clone/resolve",
      payload: {
        algorithmId: "clone-graph"
      }
    });

    expect(clonePreset.statusCode).toBe(200);
    expect(clonePreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-clone"
      },
      algorithm: {
        id: "clone-graph",
        domain: "graph"
      },
      footprint: "5 nodes / 5 edges"
    });

    const treePreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-tree/resolve",
      payload: {
        algorithmId: "graph-valid-tree"
      }
    });

    expect(treePreset.statusCode).toBe(200);
    expect(treePreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-tree"
      },
      algorithm: {
        id: "graph-valid-tree",
        domain: "graph"
      },
      footprint: "5 nodes / 4 edges"
    });

    const componentsPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-components/resolve",
      payload: {
        algorithmId: "count-connected-components"
      }
    });

    expect(componentsPreset.statusCode).toBe(200);
    expect(componentsPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-components"
      },
      algorithm: {
        id: "count-connected-components",
        domain: "graph"
      },
      footprint: "6 nodes / 3 edges"
    });

    const cycleComponentsPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.cycle-components/resolve",
      payload: {
        algorithmId: "count-connected-components"
      }
    });

    expect(cycleComponentsPreset.statusCode).toBe(200);
    expect(cycleComponentsPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.cycle-components"
      },
      algorithm: {
        id: "count-connected-components",
        domain: "graph"
      },
      footprint: "5 nodes / 4 edges"
    });

    const zeroMatrixPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-zero-matrix/resolve",
      payload: {
        algorithmId: "01-matrix"
      }
    });

    expect(zeroMatrixPreset.statusCode).toBe(200);
    expect(zeroMatrixPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-zero-matrix"
      },
      algorithm: {
        id: "01-matrix",
        domain: "graph"
      },
      footprint: "3 x 3 grid"
    });

    const noZeroMatrixPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.no-zero-matrix/resolve",
      payload: {
        algorithmId: "01-matrix"
      }
    });

    expect(noZeroMatrixPreset.statusCode).toBe(200);
    expect(noZeroMatrixPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.no-zero-matrix"
      },
      algorithm: {
        id: "01-matrix",
        domain: "graph"
      },
      footprint: "3 x 3 grid"
    });

    const shorelinePreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-shoreline/resolve",
      payload: {
        algorithmId: "as-far-from-land-as-possible"
      }
    });

    expect(shorelinePreset.statusCode).toBe(200);
    expect(shorelinePreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-shoreline"
      },
      algorithm: {
        id: "as-far-from-land-as-possible",
        domain: "graph"
      },
      footprint: "3 x 3 grid"
    });

    const oceanOnlyPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.ocean-only/resolve",
      payload: {
        algorithmId: "as-far-from-land-as-possible"
      }
    });

    expect(oceanOnlyPreset.statusCode).toBe(200);
    expect(oceanOnlyPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.ocean-only"
      },
      algorithm: {
        id: "as-far-from-land-as-possible",
        domain: "graph"
      },
      footprint: "3 x 3 grid"
    });

    const highestPeakPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-highest-peak/resolve",
      payload: {
        algorithmId: "map-of-highest-peak"
      }
    });

    expect(highestPeakPreset.statusCode).toBe(200);
    expect(highestPeakPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-highest-peak"
      },
      algorithm: {
        id: "map-of-highest-peak",
        domain: "graph"
      },
      footprint: "3 x 3 grid"
    });

    const allWaterPeakPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.all-water-plateau/resolve",
      payload: {
        algorithmId: "map-of-highest-peak"
      }
    });

    expect(allWaterPeakPreset.statusCode).toBe(200);
    expect(allWaterPeakPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.all-water-plateau"
      },
      algorithm: {
        id: "map-of-highest-peak",
        domain: "graph"
      },
      footprint: "2 x 2 grid"
    });

    const mazeExitPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-maze-exit/resolve",
      payload: {
        algorithmId: "nearest-exit-from-entrance-in-maze"
      }
    });

    expect(mazeExitPreset.statusCode).toBe(200);
    expect(mazeExitPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-maze-exit"
      },
      algorithm: {
        id: "nearest-exit-from-entrance-in-maze",
        domain: "graph"
      },
      footprint: "5 x 5 grid"
    });

    const sealedMazePreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.sealed-maze-exit/resolve",
      payload: {
        algorithmId: "nearest-exit-from-entrance-in-maze"
      }
    });

    expect(sealedMazePreset.statusCode).toBe(200);
    expect(sealedMazePreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.sealed-maze-exit"
      },
      algorithm: {
        id: "nearest-exit-from-entrance-in-maze",
        domain: "graph"
      },
      footprint: "5 x 5 grid"
    });

    const redundantPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-redundant/resolve",
      payload: {
        algorithmId: "redundant-connection"
      }
    });

    expect(redundantPreset.statusCode).toBe(200);
    expect(redundantPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-redundant"
      },
      algorithm: {
        id: "redundant-connection",
        domain: "graph"
      },
      footprint: "5 nodes / 5 edges"
    });

    const lateRedundantPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.late-redundant/resolve",
      payload: {
        algorithmId: "redundant-connection"
      }
    });

    expect(lateRedundantPreset.statusCode).toBe(200);
    expect(lateRedundantPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.late-redundant"
      },
      algorithm: {
        id: "redundant-connection",
        domain: "graph"
      },
      footprint: "5 nodes / 5 edges"
    });

    const courseSchedulePreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-schedule/resolve",
      payload: {
        algorithmId: "course-schedule"
      }
    });

    expect(courseSchedulePreset.statusCode).toBe(200);
    expect(courseSchedulePreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-schedule"
      },
      algorithm: {
        id: "course-schedule",
        domain: "graph"
      },
      footprint: "5 courses / 5 prerequisites"
    });

    const blockedCyclePreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.blocked-cycle/resolve",
      payload: {
        algorithmId: "course-schedule"
      }
    });

    expect(blockedCyclePreset.statusCode).toBe(200);
    expect(blockedCyclePreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.blocked-cycle"
      },
      algorithm: {
        id: "course-schedule",
        domain: "graph"
      },
      footprint: "5 courses / 5 prerequisites"
    });

    const courseOrderPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-schedule/resolve",
      payload: {
        algorithmId: "course-schedule-ii"
      }
    });

    expect(courseOrderPreset.statusCode).toBe(200);
    expect(courseOrderPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-schedule"
      },
      algorithm: {
        id: "course-schedule-ii",
        domain: "graph"
      },
      footprint: "5 courses / 5 prerequisites"
    });

    const blockedCourseOrderPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.blocked-cycle/resolve",
      payload: {
        algorithmId: "course-schedule-ii"
      }
    });

    expect(blockedCourseOrderPreset.statusCode).toBe(200);
    expect(blockedCourseOrderPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.blocked-cycle"
      },
      algorithm: {
        id: "course-schedule-ii",
        domain: "graph"
      },
      footprint: "5 courses / 5 prerequisites"
    });

    const rottingOrangesPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-oranges/resolve",
      payload: {
        algorithmId: "rotting-oranges"
      }
    });

    expect(rottingOrangesPreset.statusCode).toBe(200);
    expect(rottingOrangesPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-oranges"
      },
      algorithm: {
        id: "rotting-oranges",
        domain: "graph"
      },
      footprint: "3 x 3 grid"
    });

    const isolatedFreshPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.isolated-fresh/resolve",
      payload: {
        algorithmId: "rotting-oranges"
      }
    });

    expect(isolatedFreshPreset.statusCode).toBe(200);
    expect(isolatedFreshPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.isolated-fresh"
      },
      algorithm: {
        id: "rotting-oranges",
        domain: "graph"
      },
      footprint: "3 x 3 grid"
    });

    const numberOfIslandsPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-islands/resolve",
      payload: {
        algorithmId: "number-of-islands"
      }
    });

    expect(numberOfIslandsPreset.statusCode).toBe(200);
    expect(numberOfIslandsPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-islands"
      },
      algorithm: {
        id: "number-of-islands",
        domain: "graph"
      },
      footprint: "4 x 5 grid"
    });

    const diagonalIslandsPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.diagonal-islands/resolve",
      payload: {
        algorithmId: "number-of-islands"
      }
    });

    expect(diagonalIslandsPreset.statusCode).toBe(200);
    expect(diagonalIslandsPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.diagonal-islands"
      },
      algorithm: {
        id: "number-of-islands",
        domain: "graph"
      },
      footprint: "3 x 3 grid"
    });

    const maxAreaPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-max-area/resolve",
      payload: {
        algorithmId: "max-area-of-island"
      }
    });

    expect(maxAreaPreset.statusCode).toBe(200);
    expect(maxAreaPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-max-area"
      },
      algorithm: {
        id: "max-area-of-island",
        domain: "graph"
      },
      footprint: "4 x 5 grid"
    });

    const diagonalSingleCellsPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.diagonal-single-cells/resolve",
      payload: {
        algorithmId: "max-area-of-island"
      }
    });

    expect(diagonalSingleCellsPreset.statusCode).toBe(200);
    expect(diagonalSingleCellsPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.diagonal-single-cells"
      },
      algorithm: {
        id: "max-area-of-island",
        domain: "graph"
      },
      footprint: "3 x 3 grid"
    });

    const islandPerimeterPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-perimeter/resolve",
      payload: {
        algorithmId: "island-perimeter"
      }
    });

    expect(islandPerimeterPreset.statusCode).toBe(200);
    expect(islandPerimeterPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-perimeter"
      },
      algorithm: {
        id: "island-perimeter",
        domain: "graph"
      },
      footprint: "4 x 4 grid"
    });

    const singleCellPerimeterPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.single-cell-perimeter/resolve",
      payload: {
        algorithmId: "island-perimeter"
      }
    });

    expect(singleCellPerimeterPreset.statusCode).toBe(200);
    expect(singleCellPerimeterPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.single-cell-perimeter"
      },
      algorithm: {
        id: "island-perimeter",
        domain: "graph"
      },
      footprint: "1 x 1 grid"
    });

    const pacificAtlanticPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-flow/resolve",
      payload: {
        algorithmId: "pacific-atlantic-water-flow"
      }
    });

    expect(pacificAtlanticPreset.statusCode).toBe(200);
    expect(pacificAtlanticPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-flow"
      },
      algorithm: {
        id: "pacific-atlantic-water-flow",
        domain: "graph"
      },
      footprint: "5 x 5 grid"
    });

    const interiorSinkPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.interior-sink/resolve",
      payload: {
        algorithmId: "pacific-atlantic-water-flow"
      }
    });

    expect(interiorSinkPreset.statusCode).toBe(200);
    expect(interiorSinkPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.interior-sink"
      },
      algorithm: {
        id: "pacific-atlantic-water-flow",
        domain: "graph"
      },
      footprint: "3 x 3 grid"
    });

    const referenceBridgePreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-bridge/resolve",
      payload: {
        algorithmId: "shortest-bridge"
      }
    });

    expect(referenceBridgePreset.statusCode).toBe(200);
    expect(referenceBridgePreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-bridge"
      },
      algorithm: {
        id: "shortest-bridge",
        domain: "graph"
      },
      footprint: "4 x 4 grid"
    });

    const singleGapBridgePreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.single-gap-bridge/resolve",
      payload: {
        algorithmId: "shortest-bridge"
      }
    });

    expect(singleGapBridgePreset.statusCode).toBe(200);
    expect(singleGapBridgePreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.single-gap-bridge"
      },
      algorithm: {
        id: "shortest-bridge",
        domain: "graph"
      },
      footprint: "3 x 3 grid"
    });

    const binaryPathPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-binary-path/resolve",
      payload: {
        algorithmId: "shortest-path-binary-matrix"
      }
    });

    expect(binaryPathPreset.statusCode).toBe(200);
    expect(binaryPathPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-binary-path"
      },
      algorithm: {
        id: "shortest-path-binary-matrix",
        domain: "graph"
      },
      footprint: "5 x 5 grid"
    });

    const sealedBinaryExitPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.sealed-binary-exit/resolve",
      payload: {
        algorithmId: "shortest-path-binary-matrix"
      }
    });

    expect(sealedBinaryExitPreset.statusCode).toBe(200);
    expect(sealedBinaryExitPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.sealed-binary-exit"
      },
      algorithm: {
        id: "shortest-path-binary-matrix",
        domain: "graph"
      },
      footprint: "4 x 4 grid"
    });

    const surroundedRegionsPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-capture/resolve",
      payload: {
        algorithmId: "surrounded-regions"
      }
    });

    expect(surroundedRegionsPreset.statusCode).toBe(200);
    expect(surroundedRegionsPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-capture"
      },
      algorithm: {
        id: "surrounded-regions",
        domain: "graph"
      },
      footprint: "4 x 4 grid"
    });

    const borderSafePreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.border-safe/resolve",
      payload: {
        algorithmId: "surrounded-regions"
      }
    });

    expect(borderSafePreset.statusCode).toBe(200);
    expect(borderSafePreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.border-safe"
      },
      algorithm: {
        id: "surrounded-regions",
        domain: "graph"
      },
      footprint: "4 x 4 grid"
    });

    const wallsAndGatesPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.reference-gates/resolve",
      payload: {
        algorithmId: "walls-and-gates"
      }
    });

    expect(wallsAndGatesPreset.statusCode).toBe(200);
    expect(wallsAndGatesPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.reference-gates"
      },
      algorithm: {
        id: "walls-and-gates",
        domain: "graph"
      },
      footprint: "4 x 4 grid"
    });

    const isolatedRoomsPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/graph.isolated-rooms/resolve",
      payload: {
        algorithmId: "walls-and-gates"
      }
    });

    expect(isolatedRoomsPreset.statusCode).toBe(200);
    expect(isolatedRoomsPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "graph.isolated-rooms"
      },
      algorithm: {
        id: "walls-and-gates",
        domain: "graph"
      },
      footprint: "4 x 4 grid"
    });

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

    const rotatedSearchPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/search.rotated-reference-hit/resolve",
      payload: {
        algorithmId: "search-in-rotated-sorted-array"
      }
    });

    expect(rotatedSearchPreset.statusCode).toBe(200);
    expect(rotatedSearchPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "search.rotated-reference-hit"
      },
      algorithm: {
        id: "search-in-rotated-sorted-array",
        domain: "search"
      },
      footprint: "8 lanes / target 6"
    });

    const twoPointersPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/two-pointers.reference-basin/resolve",
      payload: {
        algorithmId: "container-with-most-water"
      }
    });

    expect(twoPointersPreset.statusCode).toBe(200);
    expect(twoPointersPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "two-pointers.reference-basin"
      },
      algorithm: {
        id: "container-with-most-water",
        domain: "two-pointers"
      },
      footprint: "9 heights"
    });

    const trappingRainWaterPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/two-pointers.reference-rain-basin/resolve",
      payload: {
        algorithmId: "trapping-rain-water"
      }
    });

    expect(trappingRainWaterPreset.statusCode).toBe(200);
    expect(trappingRainWaterPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "two-pointers.reference-rain-basin"
      },
      algorithm: {
        id: "trapping-rain-water",
        domain: "two-pointers"
      },
      footprint: "12 heights"
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

    const substringWindowPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/window.reference-substring/resolve",
      payload: {
        algorithmId: "longest-substring-without-repeating-characters"
      }
    });

    expect(substringWindowPreset.statusCode).toBe(200);
    expect(substringWindowPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "window.reference-substring"
      },
      algorithm: {
        id: "longest-substring-without-repeating-characters",
        domain: "window"
      },
      footprint: "8 chars"
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

    const dailyTemperaturesPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/stack.reference-forecast/resolve",
      payload: {
        algorithmId: "daily-temperatures"
      }
    });

    expect(dailyTemperaturesPreset.statusCode).toBe(200);
    expect(dailyTemperaturesPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "stack.reference-forecast"
      },
      algorithm: {
        id: "daily-temperatures",
        domain: "stack"
      },
      footprint: "8 days"
    });

    const histogramPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/stack.reference-histogram/resolve",
      payload: {
        algorithmId: "largest-rectangle-in-histogram"
      }
    });

    expect(histogramPreset.statusCode).toBe(200);
    expect(histogramPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "stack.reference-histogram"
      },
      algorithm: {
        id: "largest-rectangle-in-histogram",
        domain: "stack"
      },
      footprint: "6 bars"
    });

    const minStackPreset = await server.inject({
      method: "POST",
      url: "/api/input-presets/stack.reference-min-stack/resolve",
      payload: {
        algorithmId: "min-stack"
      }
    });

    expect(minStackPreset.statusCode).toBe(200);
    expect(minStackPreset.json()).toMatchObject({
      source: "preset",
      preset: {
        id: "stack.reference-min-stack"
      },
      algorithm: {
        id: "min-stack",
        domain: "stack"
      },
      footprint: "7 ops"
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

    const validateRotatedSearchInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "search-in-rotated-sorted-array",
        payload: {
          array: [15, 18, 22, 1, 3, 6, 10, 12],
          target: 6
        }
      }
    });

    expect(validateRotatedSearchInput.statusCode).toBe(200);
    expect(validateRotatedSearchInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "search-in-rotated-sorted-array",
        domain: "search"
      },
      input: {
        array: [15, 18, 22, 1, 3, 6, 10, 12],
        target: 6
      },
      footprint: "8 lanes / target 6"
    });

    const validateTwoPointersInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "container-with-most-water",
        payload: {
          heights: [1, 8, 6, 2, 5, 4, 8, 3, 7]
        }
      }
    });

    expect(validateTwoPointersInput.statusCode).toBe(200);
    expect(validateTwoPointersInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "container-with-most-water",
        domain: "two-pointers"
      },
      input: {
        heights: [1, 8, 6, 2, 5, 4, 8, 3, 7]
      },
      footprint: "9 heights"
    });

    const validateTrappingRainWaterInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "trapping-rain-water",
        payload: {
          heights: [0, 2, 0, 3, 1, 0, 1]
        }
      }
    });

    expect(validateTrappingRainWaterInput.statusCode).toBe(200);
    expect(validateTrappingRainWaterInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "trapping-rain-water",
        domain: "two-pointers"
      },
      input: {
        heights: [0, 2, 0, 3, 1, 0, 1]
      },
      footprint: "7 heights"
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

    const validateSubstringWindowInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "longest-substring-without-repeating-characters",
        payload: {
          text: "pwwkew"
        }
      }
    });

    expect(validateSubstringWindowInput.statusCode).toBe(200);
    expect(validateSubstringWindowInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "longest-substring-without-repeating-characters",
        domain: "window"
      },
      input: {
        text: "pwwkew"
      },
      footprint: "6 chars"
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

    const validateDailyTemperaturesInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "daily-temperatures",
        payload: {
          temperatures: [70, 71, 69, 72]
        }
      }
    });

    expect(validateDailyTemperaturesInput.statusCode).toBe(200);
    expect(validateDailyTemperaturesInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "daily-temperatures",
        domain: "stack"
      },
      input: {
        temperatures: [70, 71, 69, 72]
      },
      footprint: "4 days"
    });

    const validateHistogramInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "largest-rectangle-in-histogram",
        payload: {
          heights: [2, 1, 5, 6, 2, 3]
        }
      }
    });

    expect(validateHistogramInput.statusCode).toBe(200);
    expect(validateHistogramInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "largest-rectangle-in-histogram",
        domain: "stack"
      },
      input: {
        heights: [2, 1, 5, 6, 2, 3]
      },
      footprint: "6 bars"
    });

    const validateMinStackInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "min-stack",
        payload: {
          operations: [
            { type: "push", value: 3 },
            { type: "push", value: -1 },
            { type: "getMin" },
            { type: "pop" },
            { type: "top" }
          ]
        }
      }
    });

    expect(validateMinStackInput.statusCode).toBe(200);
    expect(validateMinStackInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "min-stack",
        domain: "stack"
      },
      input: {
        operations: [
          { type: "push", value: 3 },
          { type: "push", value: -1 },
          { type: "getMin" },
          { type: "pop" },
          { type: "top" }
        ]
      },
      footprint: "5 ops"
    });

    const validateCloneGraphInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "clone-graph",
        payload: {
          nodes: ["A", "B", "C", "D", "E"],
          edges: [
            ["A", "B", 1],
            ["A", "C", 1],
            ["B", "D", 1],
            ["C", "D", 1],
            ["D", "E", 1]
          ],
          start: "A",
          target: null,
          directed: false
        }
      }
    });

    expect(validateCloneGraphInput.statusCode).toBe(200);
    expect(validateCloneGraphInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "clone-graph",
        domain: "graph"
      },
      input: {
        nodes: ["A", "B", "C", "D", "E"],
        edges: [
          ["A", "B", 1],
          ["A", "C", 1],
          ["B", "D", 1],
          ["C", "D", 1],
          ["D", "E", 1]
        ],
        start: "A",
        target: null,
        directed: false
      },
      footprint: "5 nodes / 5 edges"
    });

    const validateNetworkDelayTimeInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "network-delay-time",
        payload: {
          nodes: ["A", "B", "C", "D", "E"],
          edges: [
            ["A", "B", 1],
            ["A", "C", 4],
            ["B", "C", 2],
            ["B", "D", 6],
            ["C", "D", 3],
            ["D", "E", 1],
            ["C", "E", 7]
          ],
          start: "A",
          target: null,
          directed: true
        }
      }
    });

    expect(validateNetworkDelayTimeInput.statusCode).toBe(200);
    expect(validateNetworkDelayTimeInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "network-delay-time",
        domain: "graph"
      },
      input: {
        nodes: ["A", "B", "C", "D", "E"],
        edges: [
          ["A", "B", 1],
          ["A", "C", 4],
          ["B", "C", 2],
          ["B", "D", 6],
          ["C", "D", 3],
          ["D", "E", 1],
          ["C", "E", 7]
        ],
        start: "A",
        target: null,
        directed: true
      },
      footprint: "5 nodes / 7 edges"
    });

    const validateCourseScheduleInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "course-schedule",
        payload: {
          courseCount: 4,
          prerequisites: [
            [1, 0],
            [2, 0],
            [3, 1]
          ]
        }
      }
    });

    expect(validateCourseScheduleInput.statusCode).toBe(200);
    expect(validateCourseScheduleInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "course-schedule",
        domain: "graph"
      },
      input: {
        courseCount: 4,
        prerequisites: [
          [1, 0],
          [2, 0],
          [3, 1]
        ]
      },
      footprint: "4 courses / 3 prerequisites"
    });

    const validateCourseOrderInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "course-schedule-ii",
        payload: {
          courseCount: 4,
          prerequisites: [
            [1, 0],
            [2, 0],
            [3, 1]
          ]
        }
      }
    });

    expect(validateCourseOrderInput.statusCode).toBe(200);
    expect(validateCourseOrderInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "course-schedule-ii",
        domain: "graph"
      },
      input: {
        courseCount: 4,
        prerequisites: [
          [1, 0],
          [2, 0],
          [3, 1]
        ]
      },
      footprint: "4 courses / 3 prerequisites"
    });

    const validateRottingOrangesInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "rotting-oranges",
        payload: {
          grid: [
            [2, 1, 1],
            [1, 1, 0],
            [0, 1, 1]
          ]
        }
      }
    });

    expect(validateRottingOrangesInput.statusCode).toBe(200);
    expect(validateRottingOrangesInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "rotting-oranges",
        domain: "graph"
      },
      input: {
        grid: [
          [2, 1, 1],
          [1, 1, 0],
          [0, 1, 1]
        ]
      },
      footprint: "3 x 3 grid"
    });

    const validateNumberOfIslandsInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "number-of-islands",
        payload: {
          grid: [
            [1, 1, 0],
            [0, 1, 0],
            [1, 0, 1]
          ]
        }
      }
    });

    expect(validateNumberOfIslandsInput.statusCode).toBe(200);
    expect(validateNumberOfIslandsInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "number-of-islands",
        domain: "graph"
      },
      input: {
        grid: [
          ["1", "1", "0"],
          ["0", "1", "0"],
          ["1", "0", "1"]
        ]
      },
      footprint: "3 x 3 grid"
    });

    const validateMaxAreaOfIslandInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "max-area-of-island",
        payload: {
          grid: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 1, 0]
          ]
        }
      }
    });

    expect(validateMaxAreaOfIslandInput.statusCode).toBe(200);
    expect(validateMaxAreaOfIslandInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "max-area-of-island",
        domain: "graph"
      },
      input: {
        grid: [
          ["0", "0", "1"],
          ["1", "1", "1"],
          ["0", "1", "0"]
        ]
      },
      footprint: "3 x 3 grid"
    });

    const validateIslandPerimeterInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "island-perimeter",
        payload: {
          grid: [
            [1, 1],
            [1, 0]
          ]
        }
      }
    });

    expect(validateIslandPerimeterInput.statusCode).toBe(200);
    expect(validateIslandPerimeterInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "island-perimeter",
        domain: "graph"
      },
      input: {
        grid: [
          ["1", "1"],
          ["1", "0"]
        ]
      },
      footprint: "2 x 2 grid"
    });

    const validatePacificAtlanticInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "pacific-atlantic-water-flow",
        payload: {
          grid: [
            [1, 2, 2, 3, 5],
            [3, 2, 3, 4, 4],
            [2, 4, 5, 3, 1],
            [6, 7, 1, 4, 5],
            [5, 1, 1, 2, 4]
          ]
        }
      }
    });

    expect(validatePacificAtlanticInput.statusCode).toBe(200);
    expect(validatePacificAtlanticInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "pacific-atlantic-water-flow",
        domain: "graph"
      },
      input: {
        grid: [
          [1, 2, 2, 3, 5],
          [3, 2, 3, 4, 4],
          [2, 4, 5, 3, 1],
          [6, 7, 1, 4, 5],
          [5, 1, 1, 2, 4]
        ]
      },
      footprint: "5 x 5 grid"
    });

    const validateShortestBridgeInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "shortest-bridge",
        payload: {
          grid: [
            [0, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 1],
            [0, 0, 1, 1]
          ]
        }
      }
    });

    expect(validateShortestBridgeInput.statusCode).toBe(200);
    expect(validateShortestBridgeInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "shortest-bridge",
        domain: "graph"
      },
      input: {
        grid: [
          [0, 1, 1, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 1],
          [0, 0, 1, 1]
        ]
      },
      footprint: "4 x 4 grid"
    });

    const validateShortestPathBinaryMatrixInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "shortest-path-binary-matrix",
        payload: {
          grid: [
            [0, 1, 0, 0, 0],
            [0, 1, 0, 1, 0],
            [0, 0, 0, 1, 0],
            [1, 1, 0, 0, 0],
            [1, 1, 1, 1, 0]
          ]
        }
      }
    });

    expect(validateShortestPathBinaryMatrixInput.statusCode).toBe(200);
    expect(validateShortestPathBinaryMatrixInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "shortest-path-binary-matrix",
        domain: "graph"
      },
      input: {
        grid: [
          [0, 1, 0, 0, 0],
          [0, 1, 0, 1, 0],
          [0, 0, 0, 1, 0],
          [1, 1, 0, 0, 0],
          [1, 1, 1, 1, 0]
        ]
      },
      footprint: "5 x 5 grid"
    });

    const validateZeroOneMatrixInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "01-matrix",
        payload: {
          grid: [
            [0, 0, 0],
            [0, 1, 0],
            [1, 1, 1]
          ]
        }
      }
    });

    expect(validateZeroOneMatrixInput.statusCode).toBe(200);
    expect(validateZeroOneMatrixInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "01-matrix",
        domain: "graph"
      },
      input: {
        grid: [
          [0, 0, 0],
          [0, 1, 0],
          [1, 1, 1]
        ]
      },
      footprint: "3 x 3 grid"
    });

    const validateAsFarFromLandInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "as-far-from-land-as-possible",
        payload: {
          grid: [
            [1, 0, 1],
            [0, 0, 0],
            [1, 0, 1]
          ]
        }
      }
    });

    expect(validateAsFarFromLandInput.statusCode).toBe(200);
    expect(validateAsFarFromLandInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "as-far-from-land-as-possible",
        domain: "graph"
      },
      input: {
        grid: [
          [1, 0, 1],
          [0, 0, 0],
          [1, 0, 1]
        ]
      },
      footprint: "3 x 3 grid"
    });

    const validateHighestPeakInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "map-of-highest-peak",
        payload: {
          grid: [
            [0, 0, 0],
            [0, 1, 0],
            [0, 0, 0]
          ]
        }
      }
    });

    expect(validateHighestPeakInput.statusCode).toBe(200);
    expect(validateHighestPeakInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "map-of-highest-peak",
        domain: "graph"
      },
      input: {
        grid: [
          [0, 0, 0],
          [0, 1, 0],
          [0, 0, 0]
        ]
      },
      footprint: "3 x 3 grid"
    });

    const validateMazeExitInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "nearest-exit-from-entrance-in-maze",
        payload: {
          grid: [
            ["+", "+", "+", "+", "+"],
            ["+", ".", ".", ".", "+"],
            ["+", "+", "+", ".", "+"],
            ["+", "+", "+", ".", "."],
            ["+", "+", "+", "+", "+"]
          ],
          entrance: [1, 1]
        }
      }
    });

    expect(validateMazeExitInput.statusCode).toBe(200);
    expect(validateMazeExitInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "nearest-exit-from-entrance-in-maze",
        domain: "graph"
      },
      input: {
        grid: [
          ["+", "+", "+", "+", "+"],
          ["+", ".", ".", ".", "+"],
          ["+", "+", "+", ".", "+"],
          ["+", "+", "+", ".", "."],
          ["+", "+", "+", "+", "+"]
        ],
        entrance: [1, 1]
      },
      footprint: "5 x 5 grid"
    });

    const validateCountComponentsInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "count-connected-components",
        payload: {
          nodeCount: 6,
          edges: [
            [0, 1],
            [1, 2],
            [3, 4]
          ]
        }
      }
    });

    expect(validateCountComponentsInput.statusCode).toBe(200);
    expect(validateCountComponentsInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "count-connected-components",
        domain: "graph"
      },
      input: {
        nodeCount: 6,
        edges: [
          [0, 1],
          [1, 2],
          [3, 4]
        ]
      },
      footprint: "6 nodes / 3 edges"
    });

    const validateSurroundedRegionsInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "surrounded-regions",
        payload: {
          grid: [
            ["x", "x", "x", "x"],
            ["x", "o", "o", "x"],
            ["x", "x", "o", "x"],
            ["x", "o", "x", "x"]
          ]
        }
      }
    });

    expect(validateSurroundedRegionsInput.statusCode).toBe(200);
    expect(validateSurroundedRegionsInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "surrounded-regions",
        domain: "graph"
      },
      input: {
        grid: [
          ["X", "X", "X", "X"],
          ["X", "O", "O", "X"],
          ["X", "X", "O", "X"],
          ["X", "O", "X", "X"]
        ]
      },
      footprint: "4 x 4 grid"
    });

    const validateWallsAndGatesInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "walls-and-gates",
        payload: {
          grid: [
            [2147483647, -1, 0, 2147483647],
            [2147483647, 2147483647, 2147483647, -1],
            [2147483647, -1, 2147483647, -1],
            [0, -1, 2147483647, 2147483647]
          ]
        }
      }
    });

    expect(validateWallsAndGatesInput.statusCode).toBe(200);
    expect(validateWallsAndGatesInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "walls-and-gates",
        domain: "graph"
      },
      input: {
        grid: [
          [2147483647, -1, 0, 2147483647],
          [2147483647, 2147483647, 2147483647, -1],
          [2147483647, -1, 2147483647, -1],
          [0, -1, 2147483647, 2147483647]
        ]
      },
      footprint: "4 x 4 grid"
    });

    const validateGraphValidTreeInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "graph-valid-tree",
        payload: {
          nodeCount: 5,
          edges: [
            [0, 1],
            [0, 2],
            [1, 3],
            [1, 4]
          ]
        }
      }
    });

    expect(validateGraphValidTreeInput.statusCode).toBe(200);
    expect(validateGraphValidTreeInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "graph-valid-tree",
        domain: "graph"
      },
      input: {
        nodeCount: 5,
        edges: [
          [0, 1],
          [0, 2],
          [1, 3],
          [1, 4]
        ]
      },
      footprint: "5 nodes / 4 edges"
    });

    const validateRedundantConnectionInput = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "redundant-connection",
        payload: {
          nodeCount: 5,
          edges: [
            [0, 1],
            [1, 2],
            [2, 3],
            [1, 3],
            [1, 4]
          ]
        }
      }
    });

    expect(validateRedundantConnectionInput.statusCode).toBe(200);
    expect(validateRedundantConnectionInput.json()).toMatchObject({
      source: "custom",
      algorithm: {
        id: "redundant-connection",
        domain: "graph"
      },
      input: {
        nodeCount: 5,
        edges: [
          [0, 1],
          [1, 2],
          [2, 3],
          [1, 3],
          [1, 4]
        ]
      },
      footprint: "5 nodes / 5 edges"
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

  it("rejects graph-valid-tree payloads whose edges reference missing nodes", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "graph-valid-tree",
        payload: {
          nodeCount: 4,
          edges: [
            [0, 1],
            [1, 4]
          ]
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "edges[1] must reference node ids between 0 and 3."
    });
  });

  it("rejects rotting-oranges payloads with ragged grid rows", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "rotting-oranges",
        payload: {
          grid: [
            [2, 1, 1],
            [1, 0]
          ]
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "Rotting Oranges input rows must all be the same length."
    });
  });

  it("rejects number-of-islands payloads with invalid cell values", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "number-of-islands",
        payload: {
          grid: [
            ["1", "0", "1"],
            ["0", "2", "0"]
          ]
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: 'grid[1][1] must be "0" or "1".'
    });
  });

  it("rejects pacific-atlantic-water-flow payloads with invalid cell values", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "pacific-atlantic-water-flow",
        payload: {
          grid: [
            [1, 2, 3],
            [4, -1, 6]
          ]
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "grid[1][1] must be a non-negative integer height."
    });
  });

  it("rejects shortest-bridge payloads with invalid cell values", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "shortest-bridge",
        payload: {
          grid: [
            [0, 1, 0],
            [0, 2, 0]
          ]
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "grid[1][1] must be either 0 or 1."
    });
  });

  it("rejects network-delay-time payloads with non-null targets", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "network-delay-time",
        payload: {
          nodes: ["A", "B", "C"],
          edges: [
            ["A", "B", 1],
            ["B", "C", 2]
          ],
          start: "A",
          target: "C",
          directed: true
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "Network Delay Time input target must be null."
    });
  });

  it("rejects shortest-path-binary-matrix payloads with invalid cell values", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "shortest-path-binary-matrix",
        payload: {
          grid: [
            [0, 1, 0],
            [0, 2, 0]
          ]
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "grid[1][1] must be either 0 or 1."
    });
  });

  it("rejects nearest-exit-from-entrance-in-maze payloads whose entrance is blocked", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "nearest-exit-from-entrance-in-maze",
        payload: {
          grid: [
            ["+", "+", "+"],
            ["+", "+", "."],
            ["+", "+", "+"]
          ],
          entrance: [1, 1]
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "Nearest Exit from Entrance in Maze entrance must start on an open cell."
    });
  });

  it("rejects as-far-from-land-as-possible payloads with invalid cell values", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "as-far-from-land-as-possible",
        payload: {
          grid: [
            [1, 0, 1],
            [0, 2, 0]
          ]
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "grid[1][1] must be either 0 or 1."
    });
  });

  it("rejects map-of-highest-peak payloads with no water source", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "map-of-highest-peak",
        payload: {
          grid: [
            [0, 0],
            [0, 0]
          ]
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "Map of Highest Peak input must include at least one water cell."
    });
  });

  it("rejects surrounded-regions payloads with invalid cell values", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "surrounded-regions",
        payload: {
          grid: [
            ["X", "O", "X"],
            ["O", "Y", "O"]
          ]
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: 'grid[1][1] must be "X" or "O".'
    });
  });

  it("rejects walls-and-gates payloads with invalid cell values", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "walls-and-gates",
        payload: {
          grid: [
            [2147483647, -1, 0],
            [2147483647, 1, -1]
          ]
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "grid[1][1] must be -1, 0, or 2147483647."
    });
  });

  it("rejects rotated-search payloads that are not a single rotation of ascending order", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "search-in-rotated-sorted-array",
        payload: {
          array: [9, 4, 12, 2, 7],
          target: 7
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "Search in Rotated Sorted Array input must be a rotation of a strictly increasing array."
    });
  });

  it("rejects two-pointer payloads with negative heights", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "container-with-most-water",
        payload: {
          heights: [1, -1, 6]
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "heights[1] must be a non-negative integer."
    });
  });

  it("rejects daily-temperatures payloads with out-of-range values", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "daily-temperatures",
        payload: {
          temperatures: [72, 151, 69]
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "temperatures[1] must be between 0 and 150."
    });
  });

  it("rejects histogram payloads with negative heights", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "largest-rectangle-in-histogram",
        payload: {
          heights: [2, -1, 3]
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "heights[1] must be between 0 and 150."
    });
  });

  it("rejects min-stack payloads that read from an empty stack", async () => {
    const server = await createServer();

    const response = await server.inject({
      method: "POST",
      url: "/api/inputs/validate",
      payload: {
        algorithmId: "min-stack",
        payload: {
          operations: [{ type: "getMin" }]
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "operations[0] cannot run on an empty stack."
    });
  });
});
