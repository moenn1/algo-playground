import {
  getProblemReferenceById,
  type ReferenceProblemId
} from "./problemReferences.js"
import {
  getAlgorithmReferenceById,
  type ReferenceAlgorithmId
} from "./reference.js"

export type AppRoute =
  | { view: "studio" }
  | { view: "reference-index"; missingReferenceId?: string }
  | { view: "reference-detail"; algorithmId: ReferenceAlgorithmId }
  | { view: "problem-detail"; problemId: ReferenceProblemId }

function normalizeSegments(pathname: string): string[] {
  return pathname
    .split("/")
    .map((segment) => decodeURIComponent(segment.trim()))
    .filter((segment) => segment.length > 0)
}

export function parseAppRoute(pathname: string): AppRoute {
  const segments = normalizeSegments(pathname)

  if (segments.length === 0) {
    return { view: "studio" }
  }

  if (segments[0] !== "reference") {
    return { view: "studio" }
  }

  if (segments.length === 1) {
    return { view: "reference-index" }
  }

  if (segments[1] === "problems") {
    if (segments.length === 2) {
      return { view: "reference-index" }
    }

    const candidateProblemId = segments[2]!

    if (getProblemReferenceById(candidateProblemId)) {
      return {
        view: "problem-detail",
        problemId: candidateProblemId as ReferenceProblemId
      }
    }

    return {
      view: "reference-index",
      missingReferenceId: candidateProblemId
    }
  }

  const candidateId = segments[1]!

  if (getAlgorithmReferenceById(candidateId)) {
    return {
      view: "reference-detail",
      algorithmId: candidateId as ReferenceAlgorithmId
    }
  }

  return {
    view: "reference-index",
    missingReferenceId: candidateId
  }
}

export function getAppRouteHref(route: AppRoute): string {
  if (route.view === "studio") {
    return "/"
  }

  if (route.view === "reference-detail") {
    return `/reference/${route.algorithmId}`
  }

  if (route.view === "problem-detail") {
    return `/reference/problems/${route.problemId}`
  }

  return "/reference"
}
