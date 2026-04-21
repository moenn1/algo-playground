import Fastify from "fastify";

import { TraceDeckPersistenceStore } from "./persistence/store.js";
import { registerInputPresetRoutes } from "./routes/input-presets.js";
import { registerPersistenceRoutes } from "./routes/persistence.js";

const foundationServices = [
  {
    name: "execution",
    role: "Deterministic trace generation and replay-safe contracts"
  },
  {
    name: "persistence",
    role: "Durable run storage, history retrieval, and comparison records"
  },
  {
    name: "inputs",
    role: "Scenario presets, seeded generators, and custom payload validation"
  },
  {
    name: "experience",
    role: "Replay controls, state inspection, and synchronized comparison UX"
  }
];

export interface BuildServerOptions {
  dataFile?: string;
}

export function buildServer(options: BuildServerOptions = {}) {
  const app = Fastify({
    logger: false
  });
  const persistenceStore = new TraceDeckPersistenceStore(
    options.dataFile ?? process.env.TRACEDECK_DATA_FILE
  );

  app.get("/health", async () => ({
    status: "ok",
    service: "tracedeck-api",
    timestamp: new Date().toISOString()
  }));

  app.get("/api/foundation", async () => ({
    product: "TraceDeck",
    priorities: [
      "trace playback",
      "saved runs",
      "input presets",
      "comparison metrics"
    ],
    services: foundationServices
  }));

  registerPersistenceRoutes(app, persistenceStore);
  registerInputPresetRoutes(app);

  return app;
}

async function start() {
  const app = buildServer();
  const host = process.env.HOST ?? "0.0.0.0";
  const port = Number(process.env.PORT ?? 4000);

  try {
    await app.listen({ host, port });
    console.log(`TraceDeck API listening on http://${host}:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exitCode = 1;
    await app.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void start();
}
