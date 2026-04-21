import type { ReplayAlgorithm } from "./replay.js";

export type LibraryStageId = "foundation" | "core" | "advanced";
export type LibraryFocusId =
  | "state-tracking"
  | "tradeoffs"
  | "partitioning"
  | "targeting"
  | "windowing"
  | "dependencies"
  | "pathfinding";
export type LibrarySortMode = "recommended" | "most-saved" | "name";

export type LibraryStage = {
  id: LibraryStageId;
  label: string;
  description: string;
};

export type LibraryFocusArea = {
  id: LibraryFocusId;
  label: string;
  description: string;
};

export type LibraryPathway = {
  id: string;
  label: string;
  description: string;
  previewAlgorithmIds: ReplayAlgorithm["id"][];
  filters: Partial<LibraryFilters>;
};

export type LibraryProfile = {
  stage: LibraryStageId;
  focus: LibraryFocusId;
  order: number;
  timeToExplore: string;
  complexity: string;
  outcome: string;
  metricsLens: string;
  skills: string[];
  spotlight: string;
  nextAlgorithmIds: ReplayAlgorithm["id"][];
};

export type LibraryFilters = {
  domain: ReplayAlgorithm["domain"] | "all";
  stage: LibraryStageId | "all";
  focus: LibraryFocusId | "all";
  sort: LibrarySortMode;
  q: string;
};

export const libraryStages: LibraryStage[] = [
  {
    id: "foundation",
    label: "Foundation",
    description: "Shorter traces and clearer invariants for learning how to read state changes."
  },
  {
    id: "core",
    label: "Core",
    description: "Multi-phase systems where tradeoffs and coupled state start to matter."
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "Dense frontiers, recursive structure, or dependency tables that reward slower study."
  }
];

export const libraryFocusAreas: LibraryFocusArea[] = [
  {
    id: "state-tracking",
    label: "State Tracking",
    description: "Read local state changes, settled regions, and explicit frame-to-frame movement."
  },
  {
    id: "tradeoffs",
    label: "Tradeoffs",
    description: "Compare work, writes, and algorithmic shape across similar problem families."
  },
  {
    id: "partitioning",
    label: "Recursive Partitions",
    description: "Watch recursive decomposition and merge or partition boundaries unfold."
  },
  {
    id: "targeting",
    label: "Target Discovery",
    description: "Focus on narrowing search scope and proving when a target is or is not reachable."
  },
  {
    id: "windowing",
    label: "Rolling Windows",
    description: "Track moving bounds, qualifying hits, and best-range updates over time."
  },
  {
    id: "dependencies",
    label: "Dependency Tables",
    description: "Inspect how current work depends on earlier cells and how recovery walks backward."
  },
  {
    id: "pathfinding",
    label: "Pathfinding",
    description: "Study frontier churn, inspected edges, and recovered routes through a graph."
  }
];

export const librarySortModes: Array<{
  id: LibrarySortMode;
  label: string;
  description: string;
}> = [
  {
    id: "recommended",
    label: "Recommended",
    description: "Curated order that favors progression and scanability."
  },
  {
    id: "most-saved",
    label: "Most saved",
    description: "Bring algorithms with the most persisted replay activity to the front."
  },
  {
    id: "name",
    label: "A-Z",
    description: "Alphabetical order for direct lookup."
  }
];

export const defaultLibraryFilters: LibraryFilters = {
  domain: "all",
  stage: "all",
  focus: "all",
  sort: "recommended",
  q: ""
};

const libraryProfiles: Record<ReplayAlgorithm["id"], LibraryProfile> = {
  "bubble-sort": {
    stage: "foundation",
    focus: "state-tracking",
    order: 1,
    timeToExplore: "4 min",
    complexity: "Single-pass behavior stays visible frame by frame.",
    outcome: "Spot swaps, pass completion, and the growing settled suffix without leaving the stage.",
    metricsLens: "Comparisons and writes show how local fixes accumulate into a finished array.",
    skills: ["swap signals", "pass invariants", "timeline basics"],
    spotlight: "Best first stop when you want to learn how TraceDeck encodes deterministic state changes.",
    nextAlgorithmIds: ["selection-sort", "binary-search"]
  },
  "binary-search": {
    stage: "foundation",
    focus: "targeting",
    order: 2,
    timeToExplore: "4 min",
    complexity: "One interval, one midpoint, one clear decision at a time.",
    outcome: "Read interval collapse and target confirmation without reconstructing eliminated regions mentally.",
    metricsLens: "Probes and comparisons capture how quickly the search space closes.",
    skills: ["interval narrowing", "midpoint probes", "negative outcomes"],
    spotlight: "Useful when you want a compact trace that still proves why the target was found or rejected.",
    nextAlgorithmIds: ["search-in-rotated-sorted-array", "minimum-size-subarray-sum"]
  },
  "search-in-rotated-sorted-array": {
    stage: "core",
    focus: "targeting",
    order: 3,
    timeToExplore: "6 min",
    complexity: "The search window stays compact, but each probe must first identify which half of the rotated interval remains ordered.",
    outcome: "See exactly when replay trusts an ordered half, discards the impossible branch, and converges on a target hidden behind the pivot.",
    metricsLens: "Probes and comparisons expose the extra branch work required to preserve logarithmic search after rotation.",
    skills: ["ordered-half detection", "branch elimination", "rotated interval invariants"],
    spotlight: "A recognizable interview staple that extends Binary Search without forcing the replay surface to invent a new state model.",
    nextAlgorithmIds: ["valid-parentheses", "bfs"]
  },
  bfs: {
    stage: "foundation",
    focus: "pathfinding",
    order: 4,
    timeToExplore: "5 min",
    complexity: "Queue order is visible, but the frontier still stays approachable on first read.",
    outcome: "Follow level-order expansion and route recovery without losing where the queue shifts next.",
    metricsLens: "Settled, inspections, and updates expose the cost of expanding the reachable frontier.",
    skills: ["queue discipline", "frontier scanning", "route recovery"],
    spotlight: "A strong bridge from simple scans into graph-focused replay because the queue remains intuitive.",
    nextAlgorithmIds: ["dijkstra", "binary-search"]
  },
  "valid-parentheses": {
    stage: "foundation",
    focus: "state-tracking",
    order: 5,
    timeToExplore: "5 min",
    complexity: "One token stream and one explicit stack make the core invariant easy to verify.",
    outcome: "Watch opener pushes, closer checks, and the first invalid token without inferring hidden stack state.",
    metricsLens: "Comparisons, pushes, and pops expose validator effort while keeping the rejection point explicit.",
    skills: ["stack discipline", "token validation", "failure checkpoints"],
    spotlight: "A compact bridge from linear scans into stateful replay because every bracket change is visible.",
    nextAlgorithmIds: ["daily-temperatures", "min-stack"]
  },
  "selection-sort": {
    stage: "core",
    focus: "tradeoffs",
    order: 6,
    timeToExplore: "5 min",
    complexity: "The trace stays readable while separating scan cost from write cost.",
    outcome: "Compare broad scanning against fewer writes and see why a cleaner end state can still cost time.",
    metricsLens: "Comparisons stay high while writes stay restrained, which makes tradeoffs legible.",
    skills: ["leader tracking", "scan breadth", "write minimization"],
    spotlight: "Open this after Bubble Sort to contrast two deterministic sorting stories on the same deck.",
    nextAlgorithmIds: ["merge-sort", "quick-sort"]
  },
  "minimum-size-subarray-sum": {
    stage: "core",
    focus: "windowing",
    order: 7,
    timeToExplore: "6 min",
    complexity: "Two moving bounds and best-hit updates create a more coupled replay surface.",
    outcome: "See the exact frames where the window qualifies, contracts, and improves the best answer.",
    metricsLens: "Expansions, shrinks, and best updates summarize how hard the window had to work.",
    skills: ["moving bounds", "candidate windows", "best-hit updates"],
    spotlight: "Good for learning replay surfaces where the active region moves even when the result stays the same.",
    nextAlgorithmIds: ["merge-intervals", "binary-search"]
  },
  "daily-temperatures": {
    stage: "core",
    focus: "state-tracking",
    order: 8,
    timeToExplore: "6 min",
    complexity: "The scan stays linear, but one warmer day can settle several older days at once through the monotonic stack.",
    outcome: "See exactly when replay compares against the unresolved stack top, pops cooler days, and commits each wait distance into the final ledger.",
    metricsLens: "Comparisons, pushes, and pops reveal how much monotonic-stack churn happened before the forecast fully settled.",
    skills: ["monotonic stacks", "wait ledgers", "burst resolutions"],
    spotlight: "A high-signal stack problem that shows how one reusable stack runtime can power more than bracket validation.",
    nextAlgorithmIds: ["largest-rectangle-in-histogram", "trapping-rain-water"]
  },
  "largest-rectangle-in-histogram": {
    stage: "core",
    focus: "state-tracking",
    order: 9,
    timeToExplore: "7 min",
    complexity: "Each shorter bar can collapse several older candidates at once, so the trace stays linear while the rectangle story changes abruptly.",
    outcome: "See exactly when a monotonic-stack pop settles a rectangle width, when the best area improves, and how the terminal boundary flush closes the last candidates.",
    metricsLens: "Comparisons, pushes, and pops expose how much histogram churn happened before the widest rectangle was proven.",
    skills: ["histogram spans", "monotonic stacks", "area resolution"],
    spotlight: "A classic stack staple that reuses the same replay primitives while adding a more geometric rectangle story than bracket matching or wait ledgers.",
    nextAlgorithmIds: ["min-stack", "trapping-rain-water"]
  },
  "min-stack": {
    stage: "core",
    focus: "state-tracking",
    order: 9.5,
    timeToExplore: "6 min",
    complexity: "The stack itself stays compact, but every push also has to extend a depth-aligned minimum ledger while reads stay explicit in the trace.",
    outcome: "Watch exactly when pushes compare against the current minimum, when reads publish top or minimum values, and how a pop restores the previous minimum without hidden state.",
    metricsLens: "Comparisons, pushes, and pops expose how much work happened before the minimum stabilized across the operation stream.",
    skills: ["stack ledgers", "minimum recovery", "operation traces"],
    spotlight: "A strong stack-systems follow-up because it turns a mutable data structure API into one deterministic replay timeline instead of a one-off widget.",
    nextAlgorithmIds: ["daily-temperatures", "largest-rectangle-in-histogram"]
  },
  "container-with-most-water": {
    stage: "core",
    focus: "state-tracking",
    order: 10,
    timeToExplore: "6 min",
    complexity: "Only two pointers move, but every frame has to balance width loss against the chance of finding a taller wall.",
    outcome: "See exactly when replay measures a container, records a new best basin, and prunes the shorter wall from future consideration.",
    metricsLens: "Evaluations, moves, and best updates expose how efficiently the pointer sweep closes on the maximum area.",
    skills: ["pointer pruning", "area bounds", "best-pair tracking"],
    spotlight: "A staple two-pointer interview problem that adds a distinct pointer-pruning story to the catalog without needing a dense state table.",
    nextAlgorithmIds: ["trapping-rain-water", "minimum-size-subarray-sum"]
  },
  "trapping-rain-water": {
    stage: "core",
    focus: "state-tracking",
    order: 11,
    timeToExplore: "7 min",
    complexity: "The pointers still move from both sides, but every settled wall now depends on boundary maxima and per-index water fills.",
    outcome: "See exactly when a boundary max rises, when a basin segment traps water, and how the final per-index reservoir total forms.",
    metricsLens: "Boundary evaluations, moves, and fills expose how much sweep work happened before the basin fully settled.",
    skills: ["boundary maxima", "basin fills", "per-index ledgers"],
    spotlight: "A natural follow-up to Container With Most Water because it reuses the wall skyline while telling a denser two-pointer story.",
    nextAlgorithmIds: ["container-with-most-water", "minimum-size-subarray-sum"]
  },
  "two-sum": {
    stage: "foundation",
    focus: "state-tracking",
    order: 12,
    timeToExplore: "5 min",
    complexity: "One pass and one lookup table keep the trace compact while the complement state still changes meaningfully every frame.",
    outcome: "See exactly when a value checks for its complement, when a failed lookup becomes a store, and when the winning pair locks.",
    metricsLens: "Inspections, lookups, and stores expose the real work behind the classic O(n) hash-map solution.",
    skills: ["complement search", "lookup tables", "pair locking"],
    spotlight: "One of the most recognizable interview problems in the catalog and a strong bridge from linear scans into hash-backed state.",
    nextAlgorithmIds: ["valid-parentheses", "merge-intervals"]
  },
  "kth-largest-element-in-an-array": {
    stage: "core",
    focus: "state-tracking",
    order: 12.5,
    timeToExplore: "6 min",
    complexity: "The scan stays linear, but every new contender has to prove it belongs in a live size-k heap instead of the discarded tail.",
    outcome: "See exactly when replay seeds the heap, when a larger value evicts the cutoff root, and how the final kth-largest threshold locks.",
    metricsLens: "Inspections, pushes, and pops expose how much heap churn happened before the cutoff stabilized.",
    skills: ["size-k heaps", "root replacements", "top-k cutoffs"],
    spotlight: "A classic heap interview problem that adds a real priority-queue state model to the catalog without needing a dense tree renderer.",
    nextAlgorithmIds: ["two-sum", "largest-rectangle-in-histogram"]
  },
  "merge-intervals": {
    stage: "core",
    focus: "state-tracking",
    order: 13,
    timeToExplore: "6 min",
    complexity: "Sorted range order keeps the scan linear while the active merge span still changes meaningfully over time.",
    outcome: "See exactly when a range extends the active span, when a gap forces an output commit, and how the final interval list forms.",
    metricsLens: "Overlap checks, merges, and outputs show how many comparisons the interval sweep needed before each result span locked in.",
    skills: ["interval sorting", "overlap detection", "range commits"],
    spotlight: "One of the most recognizable interview problems in the catalog and a strong bridge from arrays into interval reasoning.",
    nextAlgorithmIds: ["longest-common-subsequence", "dijkstra"]
  },
  "course-schedule": {
    stage: "core",
    focus: "dependencies",
    order: 13.5,
    timeToExplore: "7 min",
    complexity: "The queue stays readable, but each unlock depends on a live indegree ledger and deterministic dependency processing.",
    outcome: "See exactly when a course leaves the ready queue, when a dependent unlocks, and when a cycle blocks the remaining schedule.",
    metricsLens: "Settled, frontier, inspections, and updates expose how much dependency work happened before the order resolved or failed.",
    skills: ["indegree ledgers", "topological order", "cycle detection"],
    spotlight: "A clean bridge from pathfinding into graph dependencies because the same graph metrics now explain a very different runtime story.",
    nextAlgorithmIds: ["longest-common-subsequence", "dijkstra"]
  },
  "rotting-oranges": {
    stage: "core",
    focus: "pathfinding",
    order: 13.75,
    timeToExplore: "7 min",
    complexity: "The frontier still behaves like BFS, but each minute-level wave also changes the full grid and can stall with unreachable fresh cells.",
    outcome: "See exactly when the infection wave advances, which fresh oranges rot next, and when empty cells isolate a stalled remainder.",
    metricsLens: "Settled, inspections, and updates expose how much neighbor scanning and spread work happened before the orchard resolved or stalled.",
    skills: ["grid bfs", "minute waves", "frontier contagion"],
    spotlight: "A strong graph follow-up because it keeps the BFS queue semantics while shifting the replay surface from abstract nodes to a changing grid.",
    nextAlgorithmIds: ["number-of-islands", "course-schedule"]
  },
  "walls-and-gates": {
    stage: "core",
    focus: "pathfinding",
    order: 13.82,
    timeToExplore: "7 min",
    complexity: "The frontier stays BFS-readable, but each update mutates the whole room-distance grid while blocked walls and unreachable infinity rooms remain explicit.",
    outcome: "See exactly when multi-source gates seed the wave, which rooms lock a shortest distance next, and where walls force the terminal blocked-room ledger to remain at infinity.",
    metricsLens: "Settled, inspections, and updates expose how much queue churn and distance-filling work happened before the map resolved or stalled.",
    skills: ["multi-source bfs", "distance fills", "blocked room ledgers"],
    spotlight: "A strong graph continuation because it reuses the grid BFS surface from Rotting Oranges while switching the outcome from contagion timing to stable shortest-distance fills.",
    nextAlgorithmIds: ["number-of-islands", "course-schedule"]
  },
  "number-of-islands": {
    stage: "core",
    focus: "state-tracking",
    order: 13.9,
    timeToExplore: "7 min",
    complexity: "The replay interleaves a row-major scan with frontier-based expansion, so the viewer has to track both the global scan cursor and the local component queue.",
    outcome: "See exactly when a land cell starts a new island, how neighboring land joins the current component, and why diagonal cells stay separate.",
    metricsLens: "Settled, frontier, inspections, and updates show how much scan and flood-fill work happened before the final island count locked in.",
    skills: ["connected components", "grid traversal", "flood fill"],
    spotlight: "A strong graph continuation because it reuses the grid replay surface from contagion-style BFS while shifting the goal to deterministic component counting.",
    nextAlgorithmIds: ["rotting-oranges", "course-schedule"]
  },
  "merge-sort": {
    stage: "core",
    focus: "partitioning",
    order: 14,
    timeToExplore: "6 min",
    complexity: "Split and merge phases ask the viewer to connect multiple local windows.",
    outcome: "Track recursive decomposition and the write-heavy merge path back to a stable final ordering.",
    metricsLens: "Writes spike in merge phases, which clarifies the cost of preserving sorted structure.",
    skills: ["recursive splits", "merge windows", "stable writes"],
    spotlight: "This is the cleanest route into recursive playback before heavier partition churn.",
    nextAlgorithmIds: ["quick-sort", "longest-common-subsequence"]
  },
  "quick-sort": {
    stage: "advanced",
    focus: "partitioning",
    order: 15,
    timeToExplore: "7 min",
    complexity: "Pivot locks and recursive partitions create dense local transitions across the deck.",
    outcome: "Inspect how partition boundaries move and why one pivot choice can reshape the next trace segment.",
    metricsLens: "Comparisons and writes reveal when aggressive partitioning pays off and when it thrashes.",
    skills: ["pivot strategy", "partition boundaries", "recursive checkpoints"],
    spotlight: "Best when you already trust the replay controls and want a busier recursive trace to inspect.",
    nextAlgorithmIds: ["dijkstra", "merge-sort"]
  },
  "longest-common-subsequence": {
    stage: "advanced",
    focus: "dependencies",
    order: 16,
    timeToExplore: "8 min",
    complexity: "A full table plus traceback shifts the user from linear scans to dependency-heavy state.",
    outcome: "Separate matrix fill work from traceback recovery while keeping the current cell and dependencies visible.",
    metricsLens: "Cells computed, matches, and traceback steps show both fill cost and recovery effort.",
    skills: ["table fill order", "dependency reading", "traceback recovery"],
    spotlight: "Use this when you want to study a replay that cannot be understood from one moving pointer alone.",
    nextAlgorithmIds: ["dijkstra", "minimum-size-subarray-sum"]
  },
  dijkstra: {
    stage: "advanced",
    focus: "pathfinding",
    order: 17,
    timeToExplore: "8 min",
    complexity: "Weighted frontier ordering makes every inspection and update more consequential.",
    outcome: "Read tentative distances, inspected edges, and recovered shortest paths without hidden queue state.",
    metricsLens: "Settled, inspections, and updates surface how much work the weighted frontier performs.",
    skills: ["weighted frontiers", "distance updates", "shortest-path recovery"],
    spotlight: "The richest graph replay in the library, with enough state to justify a slower frame-by-frame pass.",
    nextAlgorithmIds: ["longest-common-subsequence", "quick-sort"]
  }
};

export const libraryPathways: LibraryPathway[] = [
  {
    id: "read-the-trace",
    label: "Build replay instincts",
    description:
      "Start with short deterministic stories that teach what highlights, deltas, and settled state really mean.",
    previewAlgorithmIds: ["bubble-sort", "valid-parentheses", "binary-search"],
    filters: { stage: "foundation", sort: "recommended" }
  },
  {
    id: "compare-strategies",
    label: "Compare strategy families",
    description:
      "Browse the sorting family together to see how similar inputs expose very different replay signatures.",
    previewAlgorithmIds: ["selection-sort", "merge-sort", "quick-sort"],
    filters: { domain: "sorting", sort: "most-saved" }
  },
  {
    id: "dense-state-systems",
    label: "Step into dense state",
    description:
      "Move into recursive partitions, table recovery, and weighted frontiers when one pointer is no longer enough.",
    previewAlgorithmIds: ["quick-sort", "longest-common-subsequence", "dijkstra"],
    filters: { stage: "advanced", sort: "recommended" }
  }
];

const stageById = new Map(libraryStages.map((stage) => [stage.id, stage] as const));
const focusById = new Map(libraryFocusAreas.map((focus) => [focus.id, focus] as const));

function normalizeSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

function buildSearchCorpus(algorithm: ReplayAlgorithm, profile: LibraryProfile): string {
  return [
    algorithm.name,
    algorithm.badge,
    algorithm.description,
    algorithm.inputLabel,
    algorithm.inputHint,
    profile.outcome,
    profile.metricsLens,
    profile.spotlight,
    profile.complexity,
    ...profile.skills
  ]
    .join(" ")
    .toLowerCase();
}

function compareRecommended(
  left: ReplayAlgorithm,
  right: ReplayAlgorithm,
  savedRunCounts: ReadonlyMap<string, number>
): number {
  const leftProfile = getLibraryProfile(left.id);
  const rightProfile = getLibraryProfile(right.id);

  if (leftProfile.order !== rightProfile.order) {
    return leftProfile.order - rightProfile.order;
  }

  const savedDelta = (savedRunCounts.get(right.id) ?? 0) - (savedRunCounts.get(left.id) ?? 0);

  if (savedDelta !== 0) {
    return savedDelta;
  }

  return left.name.localeCompare(right.name);
}

function compareBySavedRuns(
  left: ReplayAlgorithm,
  right: ReplayAlgorithm,
  savedRunCounts: ReadonlyMap<string, number>
): number {
  const savedDelta = (savedRunCounts.get(right.id) ?? 0) - (savedRunCounts.get(left.id) ?? 0);

  if (savedDelta !== 0) {
    return savedDelta;
  }

  return compareRecommended(left, right, savedRunCounts);
}

export function getLibraryProfile(algorithmId: ReplayAlgorithm["id"]): LibraryProfile {
  return libraryProfiles[algorithmId];
}

export function getLibraryStage(stageId: LibraryStageId): LibraryStage {
  return stageById.get(stageId) ?? libraryStages[0]!;
}

export function getLibraryFocusArea(focusId: LibraryFocusId): LibraryFocusArea {
  return focusById.get(focusId) ?? libraryFocusAreas[0]!;
}

export function resolveLibraryAlgorithms(
  availableAlgorithms: ReplayAlgorithm[],
  filters: LibraryFilters,
  savedRunCounts: ReadonlyMap<string, number>
): ReplayAlgorithm[] {
  const normalizedQuery = normalizeSearchQuery(filters.q).toLowerCase();
  const queryTokens = normalizedQuery.length > 0 ? normalizedQuery.split(" ") : [];

  return availableAlgorithms
    .filter((algorithm) => {
      const profile = getLibraryProfile(algorithm.id);

      if (filters.domain !== "all" && algorithm.domain !== filters.domain) {
        return false;
      }

      if (filters.stage !== "all" && profile.stage !== filters.stage) {
        return false;
      }

      if (filters.focus !== "all" && profile.focus !== filters.focus) {
        return false;
      }

      if (queryTokens.length === 0) {
        return true;
      }

      const searchCorpus = buildSearchCorpus(algorithm, profile);

      return queryTokens.every((token) => searchCorpus.includes(token));
    })
    .sort((left, right) => {
      switch (filters.sort) {
        case "most-saved":
          return compareBySavedRuns(left, right, savedRunCounts);
        case "name":
          return left.name.localeCompare(right.name);
        case "recommended":
        default:
          return compareRecommended(left, right, savedRunCounts);
      }
    });
}
