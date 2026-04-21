import { describe, expect, it } from "vitest";

import {
  getProblemReferenceById,
  getProblemReferencesForAlgorithm,
  getRelatedProblemReferences,
  problemReferences
} from "./problemReferences.js";
import { referenceLanguageOrder } from "./reference.js";

describe("problemReferences", () => {
  it("ships named problem pages with tags, variants, related links, and four language implementations", () => {
    expect(problemReferences.length).toBeGreaterThanOrEqual(4);

    for (const problem of problemReferences) {
      expect(getProblemReferenceById(problem.id)?.id).toBe(problem.id);
      expect(problem.patternTags.length).toBeGreaterThanOrEqual(3);
      expect(problem.implementationVariants.length).toBeGreaterThanOrEqual(2);
      expect(problem.takeaways.length).toBeGreaterThanOrEqual(3);
      expect(problem.relatedProblemIds.length).toBeGreaterThanOrEqual(1);
      expect(problem.implementations.map((implementation) => implementation.language)).toEqual(
        referenceLanguageOrder.map((language) => language.id)
      );
    }
  });

  it("maps algorithms back to their named problem spotlights", () => {
    expect(getProblemReferencesForAlgorithm("merge-sort").map((problem) => problem.id)).toContain(
      "merge-intervals"
    );
    expect(getProblemReferencesForAlgorithm("dijkstra").map((problem) => problem.id)).toContain(
      "network-delay-time"
    );
  });

  it("resolves related problems by id", () => {
    expect(
      getRelatedProblemReferences("shortest-path-in-binary-matrix").map((problem) => problem.id)
    ).toContain("network-delay-time");
  });
});
