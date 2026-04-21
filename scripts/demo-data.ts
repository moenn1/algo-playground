import { access, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { TraceDeckInputCatalog } from "../apps/api/src/input/service.ts";
import type { SupportedAlgorithmId } from "../apps/api/src/input/types.ts";
import { TraceDeckPersistenceStore } from "../apps/api/src/persistence/store.ts";
import { buildRun } from "../apps/web/src/replay.ts";

type DemoRunPlan = {
  key: string;
  algorithmId: SupportedAlgorithmId;
  presetId: string;
  recordedAt: string;
  tags: string[];
};

type DemoComparisonPlan = {
  label: string;
  baseRunKey: string;
  candidateRunKey: string;
};

const defaultDemoDataFile = path.resolve(process.cwd(), ".tracedeck", "demo-storage.json");

const demoRunPlans: DemoRunPlan[] = [
  {
    key: "sorting-baseline-bubble",
    algorithmId: "bubble-sort",
    presetId: "sorting.baseline",
    recordedAt: "2026-04-20T09:00:00.000Z",
    tags: ["seeded-demo", "sorting", "baseline"]
  },
  {
    key: "sorting-baseline-selection",
    algorithmId: "selection-sort",
    presetId: "sorting.baseline",
    recordedAt: "2026-04-20T09:02:00.000Z",
    tags: ["seeded-demo", "sorting", "baseline"]
  },
  {
    key: "sorting-reverse-bubble",
    algorithmId: "bubble-sort",
    presetId: "sorting.reverse-sorted",
    recordedAt: "2026-04-20T09:04:00.000Z",
    tags: ["seeded-demo", "sorting", "worst-case"]
  },
  {
    key: "sorting-reverse-selection",
    algorithmId: "selection-sort",
    presetId: "sorting.reverse-sorted",
    recordedAt: "2026-04-20T09:06:00.000Z",
    tags: ["seeded-demo", "sorting", "worst-case"]
  },
  {
    key: "search-reference-hit",
    algorithmId: "binary-search",
    presetId: "search.reference-hit",
    recordedAt: "2026-04-20T09:07:00.000Z",
    tags: ["seeded-demo", "search", "reference-hit"]
  },
  {
    key: "search-missing-target",
    algorithmId: "binary-search",
    presetId: "search.missing-target",
    recordedAt: "2026-04-20T09:07:30.000Z",
    tags: ["seeded-demo", "search", "missing-target"]
  },
  {
    key: "search-rotated-reference-hit",
    algorithmId: "search-in-rotated-sorted-array",
    presetId: "search.rotated-reference-hit",
    recordedAt: "2026-04-20T09:07:35.000Z",
    tags: ["seeded-demo", "search", "rotated-reference-hit"]
  },
  {
    key: "search-rotated-missing-target",
    algorithmId: "search-in-rotated-sorted-array",
    presetId: "search.rotated-missing-target",
    recordedAt: "2026-04-20T09:07:40.000Z",
    tags: ["seeded-demo", "search", "rotated-missing-target"]
  },
  {
    key: "two-pointers-reference-basin",
    algorithmId: "container-with-most-water",
    presetId: "two-pointers.reference-basin",
    recordedAt: "2026-04-20T09:07:42.000Z",
    tags: ["seeded-demo", "two-pointers", "reference-basin"]
  },
  {
    key: "two-pointers-inner-peak",
    algorithmId: "container-with-most-water",
    presetId: "two-pointers.inner-peak",
    recordedAt: "2026-04-20T09:07:43.000Z",
    tags: ["seeded-demo", "two-pointers", "inner-peak"]
  },
  {
    key: "two-pointers-reference-rain-basin",
    algorithmId: "trapping-rain-water",
    presetId: "two-pointers.reference-rain-basin",
    recordedAt: "2026-04-20T09:07:43.500Z",
    tags: ["seeded-demo", "two-pointers", "reference-rain-basin"]
  },
  {
    key: "two-pointers-stepped-reservoir",
    algorithmId: "trapping-rain-water",
    presetId: "two-pointers.stepped-reservoir",
    recordedAt: "2026-04-20T09:07:44.000Z",
    tags: ["seeded-demo", "two-pointers", "stepped-reservoir"]
  },
  {
    key: "window-reference-target",
    algorithmId: "minimum-size-subarray-sum",
    presetId: "window.reference-target",
    recordedAt: "2026-04-20T09:07:45.000Z",
    tags: ["seeded-demo", "window", "reference-target"]
  },
  {
    key: "window-no-solution",
    algorithmId: "minimum-size-subarray-sum",
    presetId: "window.no-solution",
    recordedAt: "2026-04-20T09:07:50.000Z",
    tags: ["seeded-demo", "window", "no-solution"]
  },
  {
    key: "window-reference-substring",
    algorithmId: "longest-substring-without-repeating-characters",
    presetId: "window.reference-substring",
    recordedAt: "2026-04-20T09:07:50.250Z",
    tags: ["seeded-demo", "window", "reference-substring"]
  },
  {
    key: "window-overlapping-repeat",
    algorithmId: "longest-substring-without-repeating-characters",
    presetId: "window.overlapping-repeat",
    recordedAt: "2026-04-20T09:07:50.500Z",
    tags: ["seeded-demo", "window", "overlapping-repeat"]
  },
  {
    key: "hash-reference-hit",
    algorithmId: "two-sum",
    presetId: "hash.reference-hit",
    recordedAt: "2026-04-20T09:07:51.000Z",
    tags: ["seeded-demo", "hash", "reference-hit"]
  },
  {
    key: "hash-negative-values",
    algorithmId: "two-sum",
    presetId: "hash.negative-values",
    recordedAt: "2026-04-20T09:07:51.500Z",
    tags: ["seeded-demo", "hash", "negative-values"]
  },
  {
    key: "heap-reference-kth",
    algorithmId: "kth-largest-element-in-an-array",
    presetId: "heap.reference-kth",
    recordedAt: "2026-04-20T09:07:51.700Z",
    tags: ["seeded-demo", "heap", "reference-kth"]
  },
  {
    key: "heap-duplicate-cutoff",
    algorithmId: "kth-largest-element-in-an-array",
    presetId: "heap.duplicate-cutoff",
    recordedAt: "2026-04-20T09:07:51.800Z",
    tags: ["seeded-demo", "heap", "duplicate-cutoff"]
  },
  {
    key: "interval-reference-overlap",
    algorithmId: "merge-intervals",
    presetId: "interval.reference-overlap",
    recordedAt: "2026-04-20T09:07:52.000Z",
    tags: ["seeded-demo", "interval", "reference-overlap"]
  },
  {
    key: "interval-touching-ranges",
    algorithmId: "merge-intervals",
    presetId: "interval.touching-ranges",
    recordedAt: "2026-04-20T09:07:53.000Z",
    tags: ["seeded-demo", "interval", "touching-ranges"]
  },
  {
    key: "dp-reference-overlap",
    algorithmId: "longest-common-subsequence",
    presetId: "dynamic-programming.reference-overlap",
    recordedAt: "2026-04-20T09:07:55.000Z",
    tags: ["seeded-demo", "dynamic-programming", "reference-overlap"]
  },
  {
    key: "dp-no-overlap",
    algorithmId: "longest-common-subsequence",
    presetId: "dynamic-programming.no-overlap",
    recordedAt: "2026-04-20T09:07:57.000Z",
    tags: ["seeded-demo", "dynamic-programming", "no-overlap"]
  },
  {
    key: "stack-reference-valid",
    algorithmId: "valid-parentheses",
    presetId: "stack.reference-valid",
    recordedAt: "2026-04-20T09:07:58.000Z",
    tags: ["seeded-demo", "stack", "reference-valid"]
  },
  {
    key: "stack-early-mismatch",
    algorithmId: "valid-parentheses",
    presetId: "stack.early-mismatch",
    recordedAt: "2026-04-20T09:07:59.000Z",
    tags: ["seeded-demo", "stack", "early-mismatch"]
  },
  {
    key: "stack-reference-forecast",
    algorithmId: "daily-temperatures",
    presetId: "stack.reference-forecast",
    recordedAt: "2026-04-20T09:07:59.500Z",
    tags: ["seeded-demo", "stack", "reference-forecast"]
  },
  {
    key: "stack-late-spike",
    algorithmId: "daily-temperatures",
    presetId: "stack.late-spike",
    recordedAt: "2026-04-20T09:07:59.750Z",
    tags: ["seeded-demo", "stack", "late-spike"]
  },
  {
    key: "stack-reference-histogram",
    algorithmId: "largest-rectangle-in-histogram",
    presetId: "stack.reference-histogram",
    recordedAt: "2026-04-20T09:07:59.875Z",
    tags: ["seeded-demo", "stack", "reference-histogram"]
  },
  {
    key: "stack-inner-valley",
    algorithmId: "largest-rectangle-in-histogram",
    presetId: "stack.inner-valley",
    recordedAt: "2026-04-20T09:07:59.937Z",
    tags: ["seeded-demo", "stack", "inner-valley"]
  },
  {
    key: "stack-reference-min-stack",
    algorithmId: "min-stack",
    presetId: "stack.reference-min-stack",
    recordedAt: "2026-04-20T09:07:59.968Z",
    tags: ["seeded-demo", "stack", "reference-min-stack"]
  },
  {
    key: "stack-recovering-minimum",
    algorithmId: "min-stack",
    presetId: "stack.recovering-minimum",
    recordedAt: "2026-04-20T09:07:59.984Z",
    tags: ["seeded-demo", "stack", "recovering-minimum"]
  },
  {
    key: "graph-reference-route",
    algorithmId: "dijkstra",
    presetId: "graph.reference-route",
    recordedAt: "2026-04-20T09:08:00.000Z",
    tags: ["seeded-demo", "graph", "reference-route"]
  },
  {
    key: "graph-weighted-detour",
    algorithmId: "dijkstra",
    presetId: "graph.weighted-detour",
    recordedAt: "2026-04-20T09:10:00.000Z",
    tags: ["seeded-demo", "graph", "weighted-detour"]
  },
  {
    key: "graph-reference-schedule",
    algorithmId: "course-schedule",
    presetId: "graph.reference-schedule",
    recordedAt: "2026-04-20T09:11:00.000Z",
    tags: ["seeded-demo", "graph", "reference-schedule"]
  },
  {
    key: "graph-blocked-cycle",
    algorithmId: "course-schedule",
    presetId: "graph.blocked-cycle",
    recordedAt: "2026-04-20T09:12:00.000Z",
    tags: ["seeded-demo", "graph", "blocked-cycle"]
  },
  {
    key: "graph-reference-oranges",
    algorithmId: "rotting-oranges",
    presetId: "graph.reference-oranges",
    recordedAt: "2026-04-20T09:13:00.000Z",
    tags: ["seeded-demo", "graph", "reference-oranges"]
  },
  {
    key: "graph-isolated-fresh",
    algorithmId: "rotting-oranges",
    presetId: "graph.isolated-fresh",
    recordedAt: "2026-04-20T09:14:00.000Z",
    tags: ["seeded-demo", "graph", "isolated-fresh"]
  },
  {
    key: "graph-reference-islands",
    algorithmId: "number-of-islands",
    presetId: "graph.reference-islands",
    recordedAt: "2026-04-20T09:15:00.000Z",
    tags: ["seeded-demo", "graph", "reference-islands"]
  },
  {
    key: "graph-diagonal-islands",
    algorithmId: "number-of-islands",
    presetId: "graph.diagonal-islands",
    recordedAt: "2026-04-20T09:16:00.000Z",
    tags: ["seeded-demo", "graph", "diagonal-islands"]
  },
  {
    key: "graph-reference-gates",
    algorithmId: "walls-and-gates",
    presetId: "graph.reference-gates",
    recordedAt: "2026-04-20T09:17:00.000Z",
    tags: ["seeded-demo", "graph", "reference-gates"]
  },
  {
    key: "graph-isolated-rooms",
    algorithmId: "walls-and-gates",
    presetId: "graph.isolated-rooms",
    recordedAt: "2026-04-20T09:18:00.000Z",
    tags: ["seeded-demo", "graph", "isolated-rooms"]
  }
];

const demoComparisonPlans: DemoComparisonPlan[] = [
  {
    label: "Sorting baseline matchup",
    baseRunKey: "sorting-baseline-bubble",
    candidateRunKey: "sorting-baseline-selection"
  },
  {
    label: "Sorting reverse-sorted matchup",
    baseRunKey: "sorting-reverse-bubble",
    candidateRunKey: "sorting-reverse-selection"
  }
];

function parseOptions(argv: string[]) {
  const [command, ...rest] = argv;
  const options = {
    command,
    dataFile: process.env.TRACEDECK_DATA_FILE
      ? path.resolve(process.env.TRACEDECK_DATA_FILE)
      : defaultDemoDataFile,
    replace: false
  };

  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];

    if (value === "--replace") {
      options.replace = true;
      continue;
    }

    if (value === "--data-file") {
      const nextValue = rest[index + 1];

      if (!nextValue) {
        throw new Error("--data-file requires a value.");
      }

      options.dataFile = path.resolve(nextValue);
      index += 1;
    }
  }

  if (!options.command || !["seed", "summary"].includes(options.command)) {
    throw new Error('Usage: tsx scripts/demo-data.ts <seed|summary> [--replace] [--data-file <path>]');
  }

  return options;
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureWritableTarget(dataFile: string, replace: boolean) {
  if (replace) {
    await rm(dataFile, { force: true });
    return;
  }

  if (!(await fileExists(dataFile))) {
    return;
  }

  const store = new TraceDeckPersistenceStore(dataFile);
  const metadata = await store.getMetadata();
  const hasData =
    metadata.counts.algorithms > 0 ||
    metadata.counts.runs > 0 ||
    metadata.counts.comparisons > 0;

  if (hasData) {
    throw new Error(
      `Refusing to seed into non-empty store ${dataFile}. Re-run with --replace or pick another file.`
    );
  }
}

async function seedDemoData(dataFile: string, replace: boolean) {
  await ensureWritableTarget(dataFile, replace);

  const catalog = new TraceDeckInputCatalog();
  const store = new TraceDeckPersistenceStore(dataFile);
  const runIdByKey = new Map<string, string>();

  for (const plan of demoRunPlans) {
    const resolved = catalog.resolvePreset(plan.presetId, {
      algorithmId: plan.algorithmId
    });
    const replayRun = buildRun(plan.algorithmId, resolved.normalizedInputText);
    const persistedRun = await store.createRun({
      trace: replayRun.trace,
      recordedAt: plan.recordedAt,
      presetId: plan.presetId,
      ...(resolved.seed !== undefined ? { seed: resolved.seed } : {}),
      tags: [...plan.tags, `demo-plan:${plan.key}`]
    });

    runIdByKey.set(plan.key, persistedRun.id);
  }

  for (const plan of demoComparisonPlans) {
    const baseRunId = runIdByKey.get(plan.baseRunKey);
    const candidateRunId = runIdByKey.get(plan.candidateRunKey);

    if (!baseRunId || !candidateRunId) {
      throw new Error(`Missing seeded runs for comparison "${plan.label}".`);
    }

    await store.createComparison({
      label: plan.label,
      baseRunId,
      candidateRunId
    });
  }

  await printSummary(dataFile, "Seeded deterministic TraceDeck demo data");
}

async function printSummary(dataFile: string, heading = "TraceDeck demo data summary") {
  const store = new TraceDeckPersistenceStore(dataFile);
  const metadata = await store.getMetadata();
  const runs = await store.listRuns({ limit: 20 });
  const comparisons = await store.listComparisons({ limit: 20 });

  console.log(heading);
  console.log(`data file: ${metadata.dataFile}`);
  console.log(
    `counts: ${metadata.counts.algorithms} algorithms, ${metadata.counts.runs} runs, ${metadata.counts.comparisons} comparisons`
  );

  if (runs.items.length > 0) {
    console.log("runs:");
    for (const run of runs.items) {
      console.log(
        `- ${run.algorithmLabel} | preset=${run.presetId ?? "custom"} | recordedAt=${run.recordedAt} | tags=${run.tags.join(", ")}`
      );
    }
  }

  if (comparisons.items.length > 0) {
    console.log("comparisons:");
    for (const comparison of comparisons.items) {
      console.log(
        `- ${comparison.label ?? comparison.id} | ${comparison.baseRun.algorithmLabel} vs ${comparison.candidateRun.algorithmLabel} | metrics=${comparison.metricKeys.join(", ")}`
      );
    }
  }
}

async function main() {
  const options = parseOptions(process.argv.slice(2));

  if (options.command === "seed") {
    await seedDemoData(options.dataFile, options.replace);
    return;
  }

  await printSummary(options.dataFile);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
