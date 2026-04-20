import { describe, expect, it } from "vitest";

import { getAppRouteHref, parseAppRoute } from "./routes.js";

describe("parseAppRoute", () => {
  it("parses the replay shell root", () => {
    expect(parseAppRoute("/")).toEqual({ view: "studio" });
  });

  it("parses a reference detail route", () => {
    expect(parseAppRoute("/reference/quick-sort")).toEqual({
      view: "reference-detail",
      algorithmId: "quick-sort"
    });
  });

  it("falls back to the reference index for unknown algorithms", () => {
    expect(parseAppRoute("/reference/not-real")).toEqual({
      view: "reference-index",
      missingAlgorithmId: "not-real"
    });
  });
});

describe("getAppRouteHref", () => {
  it("builds canonical hrefs for each route type", () => {
    expect(getAppRouteHref({ view: "studio" })).toBe("/");
    expect(getAppRouteHref({ view: "reference-index" })).toBe("/reference");
    expect(getAppRouteHref({ view: "reference-detail", algorithmId: "bfs" })).toBe(
      "/reference/bfs"
    );
  });
});
