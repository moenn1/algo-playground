import { afterEach, describe, expect, it } from "vitest";

import { buildServer } from "../src/server.js";

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
