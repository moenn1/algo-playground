import Fastify from "fastify";

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
    name: "experience",
    role: "Replay controls, state inspection, and synchronized comparison UX"
  }
];

export function buildServer() {
  const app = Fastify({
    logger: false
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "tracedeck-api",
    timestamp: new Date().toISOString()
  }));

  app.get("/api/foundation", async () => ({
    product: "TraceDeck",
    priorities: [
      "deterministic replay",
      "persisted traces",
      "stable comparison semantics"
    ],
    services: foundationServices
  }));

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
