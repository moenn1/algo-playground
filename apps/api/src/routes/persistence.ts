import type { FastifyInstance } from "fastify";

import { sendError } from "../lib/http.js";
import {
  parseComparisonListQuery,
  parseCreateComparisonBody,
  parseCreateRunBody,
  parseRunListQuery,
  parseStepListQuery
} from "../lib/validation.js";
import type { TraceDeckPersistenceStore } from "../persistence/store.js";

export function registerPersistenceRoutes(
  app: FastifyInstance,
  store: TraceDeckPersistenceStore
) {
  app.get("/api/persistence", async () => store.getMetadata());

  app.get("/api/algorithms", async () => ({
    items: await store.listAlgorithms()
  }));

  app.get("/api/runs", async (request, reply) => {
    try {
      return await store.listRuns(parseRunListQuery(request.query));
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post("/api/runs", async (request, reply) => {
    try {
      const run = await store.createRun(parseCreateRunBody(request.body));

      return reply.status(201).send(run);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get<{
    Params: {
      runId: string;
    };
  }>("/api/runs/:runId", async (request, reply) => {
    try {
      return await store.getRun(request.params.runId);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get<{
    Params: {
      runId: string;
    };
  }>("/api/runs/:runId/steps", async (request, reply) => {
    try {
      return await store.getRunSteps(
        request.params.runId,
        parseStepListQuery(request.query)
      );
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/comparisons", async (request, reply) => {
    try {
      return await store.listComparisons(parseComparisonListQuery(request.query));
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post("/api/comparisons", async (request, reply) => {
    try {
      const comparison = await store.createComparison(
        parseCreateComparisonBody(request.body)
      );

      return reply.status(201).send(comparison);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get<{
    Params: {
      comparisonId: string;
    };
  }>("/api/comparisons/:comparisonId", async (request, reply) => {
    try {
      return await store.getComparison(request.params.comparisonId);
    } catch (error) {
      return sendError(reply, error);
    }
  });
}
