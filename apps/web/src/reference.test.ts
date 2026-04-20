import { describe, expect, it } from "vitest";

import {
  algorithmReferences,
  getAlgorithmReferenceById,
  referenceLanguageOrder
} from "./reference.js";
import { algorithms } from "./replay.js";

describe("algorithmReferences", () => {
  it("covers every replay algorithm with four language implementations", () => {
    expect(algorithmReferences).toHaveLength(algorithms.length);

    for (const reference of algorithmReferences) {
      expect(getAlgorithmReferenceById(reference.algorithm.id)?.algorithm.id).toBe(
        reference.algorithm.id
      );
      expect(reference.reasoningSteps.length).toBeGreaterThanOrEqual(4);
      expect(reference.useCases.length).toBeGreaterThanOrEqual(3);
      expect(reference.watchouts.length).toBeGreaterThanOrEqual(3);
      expect(reference.implementations.map((implementation) => implementation.language)).toEqual(
        referenceLanguageOrder.map((language) => language.id)
      );
      expect(reference.implementations.every((implementation) => implementation.code.length > 40)).toBe(
        true
      );
    }
  });

  it("returns null for unsupported algorithm reference requests", () => {
    expect(getAlgorithmReferenceById("missing-algorithm")).toBeNull();
  });
});
