import type { AlgorithmDomain, JsonObject, JsonValue } from "@tracedeck/trace-core";

export const supportedAlgorithmIds = [
  "bubble-sort",
  "selection-sort",
  "quick-sort",
  "merge-sort",
  "binary-search",
  "search-in-rotated-sorted-array",
  "minimum-size-subarray-sum",
  "merge-intervals",
  "longest-common-subsequence",
  "valid-parentheses",
  "bfs",
  "dijkstra"
] as const;

export type SupportedAlgorithmId = (typeof supportedAlgorithmIds)[number];

export interface SupportedAlgorithmDescriptor {
  id: SupportedAlgorithmId;
  label: string;
  domain: AlgorithmDomain;
}

export interface GraphInputPayload extends JsonObject {
  nodes: string[];
  edges: Array<[string, string, number]>;
  start: string;
  target: string | null;
  directed: boolean;
}

export interface SearchInputPayload extends JsonObject {
  array: number[];
  target: number;
}

export interface WindowInputPayload extends JsonObject {
  array: number[];
  target: number;
}

export interface IntervalInputPayload extends JsonObject {
  intervals: number[][];
}

export interface DynamicProgrammingInputPayload extends JsonObject {
  left: string;
  right: string;
}

export interface StackInputPayload extends JsonObject {
  expression: string;
}

export interface InputPresetSummary {
  id: string;
  label: string;
  description: string;
  scenario: string;
  kind: "curated" | "generated";
  domain: AlgorithmDomain;
  algorithms: SupportedAlgorithmDescriptor[];
  supportsSeed: boolean;
  defaultSeed?: number;
  defaultOptions?: JsonObject;
}

export interface InputPresetListQuery {
  algorithmId?: SupportedAlgorithmId;
  domain?: AlgorithmDomain;
}

export interface ResolveInputPresetInput {
  algorithmId: SupportedAlgorithmId;
  seed?: number;
  options?: JsonObject;
}

export interface ResolvedInputPreset {
  source: "preset";
  preset: InputPresetSummary;
  algorithm: SupportedAlgorithmDescriptor;
  input: JsonValue;
  normalizedInputText: string;
  footprint: string;
  seed?: number;
  options: JsonObject;
}

export interface ValidateCustomInputInput {
  algorithmId: SupportedAlgorithmId;
  payload: unknown;
}

export interface ValidatedCustomInput {
  source: "custom";
  algorithm: SupportedAlgorithmDescriptor;
  input: JsonValue;
  normalizedInputText: string;
  footprint: string;
}
