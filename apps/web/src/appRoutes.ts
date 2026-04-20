import { algorithms } from "./replay.js";

export type AppRoute =
  | { page: "overview" }
  | { page: "playground"; algorithmId?: string }
  | { page: "library" }
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
    title: "Product landing",
    description: "A spacious front door with product context, recent activity, and route selection."
  },
  {
    page: "playground",
    label: "Playground",
    title: "Replay workspace",
    description:
      "Single-run playback with transport controls, timeline scrubbing, and step inspection."
  },
  {
    page: "library",
    label: "Library",
    title: "Algorithm catalog",
    description:
      "Browse supported algorithms by domain and jump into focused reference pages."
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
    title: "Comparison studio",
    description:
      "Dedicated side-by-side sorting playback with synchronized metrics and trend charts."
  }
];

function isKnownAlgorithmId(value: string): boolean {
  return algorithms.some((algorithm) => algorithm.id === value);
}

function normalizeHashPath(hash: string): string {
  const rawPath = hash.startsWith("#") ? hash.slice(1) : hash;

  if (rawPath.length === 0) {
    return "/";
  }

  const [pathOnly] = rawPath.split("?");
  return pathOnly || "/";
}

export function parseHashRoute(hash: string): AppRoute {
  const path = normalizeHashPath(hash);
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) {
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
    return { page: "library" };
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
      return "#/";
    case "playground":
      return route.algorithmId ? `#/playground/${route.algorithmId}` : "#/playground";
    case "library":
      return "#/library";
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
