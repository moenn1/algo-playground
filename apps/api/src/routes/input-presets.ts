import type { FastifyInstance } from "fastify";

import { TraceDeckInputCatalog } from "../input/service.js";
import { sendError } from "../lib/http.js";
import {
  parseInputPresetListQuery,
  parseResolveInputPresetBody,
  parseValidateCustomInputBody
} from "../lib/validation.js";

export function registerInputPresetRoutes(
  app: FastifyInstance,
  catalog = new TraceDeckInputCatalog()
) {
  app.get("/api/input-presets", async (request, reply) => {
    try {
      return {
        items: catalog.listPresets(parseInputPresetListQuery(request.query))
      };
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get<{
    Params: {
      presetId: string;
    };
  }>("/api/input-presets/:presetId", async (request, reply) => {
    try {
      return catalog.getPreset(request.params.presetId);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post<{
    Params: {
      presetId: string;
    };
  }>("/api/input-presets/:presetId/resolve", async (request, reply) => {
    try {
      return catalog.resolvePreset(
        request.params.presetId,
        parseResolveInputPresetBody(request.body)
      );
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post("/api/inputs/validate", async (request, reply) => {
    try {
      return catalog.validateCustomInput(parseValidateCustomInputBody(request.body));
    } catch (error) {
      return sendError(reply, error);
    }
  });
}
