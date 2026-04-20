import { afterEach, describe, expect, it } from "vitest";

import { buildServer, resolveListenConfig } from "../src/server.js";

const servers: ReturnType<typeof buildServer>[] = [];

afterEach(async () => {
  while (servers.length > 0) {
    const server = servers.pop();

    if (server) {
      await server.close();
    }
  }
});

describe("TraceDeck API foundation", () => {
  it("uses localhost-first defaults for local development", () => {
    expect(resolveListenConfig({})).toEqual({
      host: "127.0.0.1",
      port: 4000
    });
  });

  it("allows explicit listen overrides", () => {
    expect(
      resolveListenConfig({
        HOST: "0.0.0.0",
        PORT: "4500"
      })
    ).toEqual({
      host: "0.0.0.0",
      port: 4500
    });
  });

  it("returns a health response", async () => {
    const server = buildServer();
    servers.push(server);

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
    const server = buildServer();
    servers.push(server);

    const response = await server.inject({
      method: "GET",
      url: "/api/foundation"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      product: "TraceDeck"
    });
  });
});
