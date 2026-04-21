import { describe, expect, it } from "vitest";

import { buildRouteHref, isRouteActive, parseHashRoute } from "./appRoutes.js";

describe("appRoutes", () => {
  it("maps empty hashes to the overview surface", () => {
    expect(parseHashRoute("")).toEqual({ page: "overview" });
    expect(parseHashRoute("#/")).toEqual({ page: "overview" });
  });

  it("parses algorithm detail and playground routes for known algorithms", () => {
    expect(parseHashRoute("#/algorithms/dijkstra")).toEqual({
      page: "algorithm-detail",
      algorithmId: "dijkstra"
    });
    expect(parseHashRoute("#/playground/quick-sort")).toEqual({
      page: "playground",
      algorithmId: "quick-sort"
    });
  });

  it("falls back to stable catalog routes for unknown paths", () => {
    expect(parseHashRoute("#/algorithms/not-real")).toEqual({ page: "library" });
    expect(parseHashRoute("#/unknown/path")).toEqual({ page: "overview" });
  });

  it("builds stable hash hrefs for product surfaces", () => {
    expect(buildRouteHref({ page: "overview" })).toBe("#/");
    expect(buildRouteHref({ page: "playground", algorithmId: "bfs" })).toBe(
      "#/playground/bfs"
    );
    expect(
      buildRouteHref({
        page: "library",
        domain: "sorting",
        stage: "core",
        sort: "most-saved",
        q: "merge"
      })
    ).toBe("#/library?domain=sorting&stage=core&sort=most-saved&q=merge");
    expect(buildRouteHref({ page: "algorithm-detail", algorithmId: "merge-sort" })).toBe(
      "#/algorithms/merge-sort"
    );
  });

  it("parses library browse state from hash query params", () => {
    expect(
      parseHashRoute("#/library?domain=graph&stage=advanced&focus=pathfinding&sort=name&q=frontier")
    ).toEqual({
      page: "library",
      domain: "graph",
      stage: "advanced",
      focus: "pathfinding",
      sort: "name",
      q: "frontier"
    });
    expect(parseHashRoute("#/library?domain=nope&sort=invalid")).toEqual({ page: "library" });
  });

  it("keeps the library navigation active on algorithm reference pages", () => {
    expect(
      isRouteActive({ page: "algorithm-detail", algorithmId: "binary-search" }, "library")
    ).toBe(true);
    expect(isRouteActive({ page: "history" }, "compare")).toBe(false);
  });
});
