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

    expect(matches.map((algorithm) => algorithm.id)).toEqual([
      "dijkstra",
      "network-delay-time"
    ]);
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

  it("surfaces redundant-connection study paths through union-find metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "cycle closing edge union-find"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("redundant-connection");
  });

  it("surfaces connected-components study paths through union-find metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "component counting union-find"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("count-connected-components");
  });

  it("surfaces network-delay-time study paths through broadcast metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "weighted broadcast unreachable nodes"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("network-delay-time");
  });

  it("surfaces maze-exit study paths through boundary-exit metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "boundary exits traceback"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain(
      "nearest-exit-from-entrance-in-maze"
    );
  });

  it("surfaces food-path study paths through target-traceback metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "food target traceback blocked pantry"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("shortest-path-to-get-food");
  });

  it("surfaces obstacle-elimination study paths through budget-pruning metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "budget pruning obstacle bfs"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain(
      "shortest-path-in-a-grid-with-obstacles-elimination"
    );
  });

  it("surfaces minimum-obstacle-removal study paths through 0-1 bfs metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "0-1 bfs weighted deque"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain(
      "minimum-obstacle-removal-to-reach-corner"
    );
  });

  it("surfaces swim study paths through weighted-water metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "rising tide weighted frontier water-level traceback"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("swim-in-rising-water");
  });

  it("surfaces top-k-frequent study paths through frequency-heap metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "frequency ledgers tie-breaks"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("top-k-frequent-elements");
  });

  it("surfaces insertion-sort study paths through prefix-growth metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "prefix growth adjacent candidate shifts"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("insertion-sort");
  });

  it("surfaces shell-sort study paths through gap-pass metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "gap scheduling gapped swaps preconditioning"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("shell-sort");
  });

  it("surfaces heap-sort study paths through heapify metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        q: "heapify sift down suffix extraction"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("heap-sort");
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

  it("surfaces course-schedule-ii study paths through ordering metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "dependencies",
        q: "returned topological order"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("course-schedule-ii");
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

  it("surfaces number-of-islands study paths through connected-component metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "state-tracking",
        q: "connected components diagonal"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("number-of-islands");
  });

  it("surfaces max-area-of-island study paths through largest-island metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "state-tracking",
        q: "largest island area flood fill"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("max-area-of-island");
  });

  it("surfaces island-perimeter study paths through coastline metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "state-tracking",
        q: "coastline exposed edges perimeter"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("island-perimeter");
  });

  it("surfaces walls-and-gates study paths through multi-source bfs metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "pathfinding",
        q: "multi-source infinity rooms"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("walls-and-gates");
  });

  it("surfaces surrounded-regions study paths through border-capture metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "state-tracking",
        q: "border flood fill capture queue"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("surrounded-regions");
  });

  it("surfaces pacific-atlantic-water-flow study paths through dual-ocean metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "pathfinding",
        q: "dual ocean reverse flow"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("pacific-atlantic-water-flow");
  });

  it("surfaces shortest-path-binary-matrix study paths through traceback metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "pathfinding",
        q: "traceback blocked-cell bfs"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("shortest-path-binary-matrix");
  });

  it("surfaces 01-matrix study paths through nearest-zero metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "pathfinding",
        q: "nearest zero distance matrix multi-source"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("01-matrix");
  });

  it("surfaces as-far-from-land-as-possible study paths through shoreline metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "pathfinding",
        q: "shoreline farthest water multi-source"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("as-far-from-land-as-possible");
  });

  it("surfaces map-of-highest-peak study paths through height-map metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "pathfinding",
        q: "water seeded peak height plateau"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("map-of-highest-peak");
  });

  it("surfaces shortest-bridge study paths through bridge-wave metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "pathfinding",
        q: "island marking bridge waves second island"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("shortest-bridge");
  });

  it("surfaces dfs study paths through depth-first stack metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "pathfinding",
        q: "depth-first stack deep branch"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("dfs");
  });

  it("surfaces graph-valid-tree study paths through union-find metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "state-tracking",
        q: "union find cycle rejection"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("graph-valid-tree");
  });

  it("surfaces clone-graph study paths through clone-ledger metadata", () => {
    const matches = resolveLibraryAlgorithms(
      algorithms,
      {
        ...defaultLibraryFilters,
        focus: "state-tracking",
        q: "clone mapping component coverage"
      },
      savedRunCounts
    );

    expect(matches.map((algorithm) => algorithm.id)).toContain("clone-graph");
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
