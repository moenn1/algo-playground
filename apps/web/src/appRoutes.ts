import { algorithms } from "./replay.js";
import {
  defaultLibraryFilters,
  libraryFocusAreas,
  librarySortModes,
  libraryStages,
  type LibraryFocusId,
  type LibrarySortMode,
  type LibraryStageId
} from "./libraryCatalog.js";

type LibraryDomainFilter = (typeof algorithms)[number]["domain"] | "all";

type LibraryRoute = {
  page: "library";
  domain?: LibraryDomainFilter;
  stage?: LibraryStageId;
  focus?: LibraryFocusId;
  sort?: LibrarySortMode;
  q?: string;
};

export type AppRoute =
  | { page: "overview" }
  | { page: "playground"; algorithmId?: string }
  | LibraryRoute
  | { page: "algorithm-detail"; algorithmId: string }
  | { page: "history" }
  | { page: "compare" };

export type NavigationSurface = {
  page: Exclude<AppRoute["page"], "algorithm-detail">;
  label: string;
  title: string;
  description: string;
};

export const navigationSurfaces: NavigationSurface[] = [
  {
    page: "overview",
    label: "Overview",
    title: "Overview",
    description: "Start here for navigation, API status, and recent saved activity."
  },
  {
    page: "playground",
    label: "Replay",
    title: "Replay",
    description:
      "Single-run playback with transport controls, timeline scrubbing, and step inspection."
  },
  {
    page: "library",
    label: "Library",
    title: "Algorithms",
    description: "Browse algorithms by domain and open their reference pages."
  },
  {
    page: "history",
    label: "History",
    title: "Saved runs",
    description: "Review persisted runs and saved comparisons without returning to the replay page."
  },
  {
    page: "compare",
    label: "Compare",
    title: "Comparison",
    description: "Side-by-side sorting replay with synchronized metrics and trend charts."
  }
];

function isKnownAlgorithmId(value: string): boolean {
  return algorithms.some((algorithm) => algorithm.id === value);
}

function normalizeHashPath(hash: string): { path: string; params: URLSearchParams } {
  const rawPath = hash.startsWith("#") ? hash.slice(1) : hash;

  if (rawPath.length === 0) {
    return { path: "/", params: new URLSearchParams() };
  }

  const [pathOnly, query = ""] = rawPath.split("?");

  return {
    path: pathOnly || "/",
    params: new URLSearchParams(query)
  };
}

function isKnownDomainFilter(value: string | null): value is LibraryDomainFilter {
  return value === "all" || algorithms.some((algorithm) => algorithm.domain === value);
}

function isKnownStageFilter(value: string | null): value is LibraryStageId {
  return libraryStages.some((stage) => stage.id === value);
}

function isKnownFocusFilter(value: string | null): value is LibraryFocusId {
  return libraryFocusAreas.some((focus) => focus.id === value);
}

function isKnownSortMode(value: string | null): value is LibrarySortMode {
  return librarySortModes.some((sortMode) => sortMode.id === value);
}

function buildLibraryRoute(params: URLSearchParams): LibraryRoute {
  const domain = params.get("domain");
  const stage = params.get("stage");
  const focus = params.get("focus");
  const sort = params.get("sort");
  const q = params.get("q")?.trim();

  return {
    page: "library",
    ...(domain && isKnownDomainFilter(domain) && domain !== defaultLibraryFilters.domain
      ? { domain }
      : {}),
    ...(stage && isKnownStageFilter(stage) && stage !== defaultLibraryFilters.stage
      ? { stage }
      : {}),
    ...(focus && isKnownFocusFilter(focus) && focus !== defaultLibraryFilters.focus
      ? { focus }
      : {}),
    ...(sort && isKnownSortMode(sort) && sort !== defaultLibraryFilters.sort ? { sort } : {}),
    ...(q && q.length > 0 ? { q } : {})
  };
}

export function parseHashRoute(hash: string): AppRoute {
  const { path, params } = normalizeHashPath(hash);
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) {
    return algorithms[0]?.id
      ? { page: "playground", algorithmId: algorithms[0].id }
      : { page: "playground" };
  }

  if (segments[0] === "overview") {
    return { page: "overview" };
  }

  if (segments[0] === "playground") {
    const algorithmId = segments[1];

    if (algorithmId && isKnownAlgorithmId(algorithmId)) {
      return { page: "playground", algorithmId };
    }

    return { page: "playground" };
  }

  if (segments[0] === "library") {
    return buildLibraryRoute(params);
  }

  if (segments[0] === "algorithms") {
    const algorithmId = segments[1];

    if (algorithmId && isKnownAlgorithmId(algorithmId)) {
      return { page: "algorithm-detail", algorithmId };
    }

    return { page: "library" };
  }

  if (segments[0] === "history") {
    return { page: "history" };
  }

  if (segments[0] === "compare") {
    return { page: "compare" };
  }

  return { page: "overview" };
}

export function buildRouteHref(route: AppRoute): string {
  switch (route.page) {
    case "overview":
      return "#/overview";
    case "playground":
      return route.algorithmId ? `#/playground/${route.algorithmId}` : "#/playground";
    case "library":
      return (() => {
        const params = new URLSearchParams();

        if (route.domain && route.domain !== defaultLibraryFilters.domain) {
          params.set("domain", route.domain);
        }

        if (route.stage && route.stage !== defaultLibraryFilters.stage) {
          params.set("stage", route.stage);
        }

        if (route.focus && route.focus !== defaultLibraryFilters.focus) {
          params.set("focus", route.focus);
        }

        if (route.sort && route.sort !== defaultLibraryFilters.sort) {
          params.set("sort", route.sort);
        }

        if (route.q) {
          const trimmed = route.q.trim();

          if (trimmed.length > 0) {
            params.set("q", trimmed);
          }
        }

        const query = params.toString();

        return query.length > 0 ? `#/library?${query}` : "#/library";
      })();
    case "algorithm-detail":
      return `#/algorithms/${route.algorithmId}`;
    case "history":
      return "#/history";
    case "compare":
      return "#/compare";
    default:
      return "#/";
  }
}

export function isRouteActive(currentRoute: AppRoute, page: AppRoute["page"]): boolean {
  if (page === "library" && currentRoute.page === "algorithm-detail") {
    return true;
  }

  return currentRoute.page === page;
}
