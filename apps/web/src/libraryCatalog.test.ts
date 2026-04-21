import { describe, expect, it } from "vitest";

import {
  defaultLibraryFilters,
  resolveLibraryAlgorithms
} from "./libraryCatalog.js";
import { algorithms } from "./replay.js";

describe("libraryCatalog", () => {
  const savedRunCounts = new Map<string, number>([
    ["merge-sort", 7],
    ["quick-sort", 4],
    ["bubble-sort", 2],
    ["dijkstra", 1]
  ]);

  it("filters algorithms by stage and focus", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        stage: "advanced",
        focus: "pathfinding"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toEqual(["dijkstra"]);
  });

  it("matches text queries against discovery metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "traceback"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("longest-common-subsequence");
  });

  it("surfaces rotated-search study paths through targeting metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "targeting",
        q: "rotated"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("search-in-rotated-sorted-array");
  });

  it("surfaces two-pointer study paths through container metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "pointer pruning"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("container-with-most-water");
  });

  it("surfaces trapped-water study paths through basin metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "basin fills"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("trapping-rain-water");
  });

  it("surfaces daily-temperatures study paths through monotonic-stack metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "monotonic stack"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("daily-temperatures");
  });

  it("surfaces histogram study paths through rectangle metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "histogram spans"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("largest-rectangle-in-histogram");
  });

  it("surfaces min-stack study paths through minimum-ledger metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "minimum recovery"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("min-stack");
  });

  it("surfaces course-schedule study paths through dependency metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "dependencies",
        q: "topological cycle"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("course-schedule");
  });

  it("surfaces rotting-oranges study paths through grid-bfs metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "pathfinding",
        q: "minute waves contagion"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("rotting-oranges");
  });

  it("sorts by persisted activity when requested", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms.filter((algorithm) => algorithm.domain === "sorting"),
      {
        ...defaultLibraryFilters,
        domain: "sorting",
        sort: "most-saved"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id).slice(0, 3)).toEqual([
      "merge-sort",
      "quick-sort",
      "bubble-sort"
    ]);
  });
});
