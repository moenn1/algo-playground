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

  it("parses a named problem detail route", () => {
    expect(parseAppRoute("/reference/problems/network-delay-time")).toEqual({
      view: "problem-detail",
      problemId: "network-delay-time"
    });
  });

  it("falls back to the reference index for unknown algorithms", () => {
    expect(parseAppRoute("/reference/not-real")).toEqual({
      view: "reference-index",
      missingReferenceId: "not-real"
    });
  });

  it("falls back to the reference index for unknown problem ids", () => {
    expect(parseAppRoute("/reference/problems/not-real")).toEqual({
      view: "reference-index",
      missingReferenceId: "not-real"
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
    expect(getAppRouteHref({ view: "problem-detail", problemId: "merge-intervals" })).toBe(
      "/reference/problems/merge-intervals"
    );
  });
});
