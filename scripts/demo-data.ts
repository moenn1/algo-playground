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
