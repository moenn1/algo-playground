import type { AlgorithmDomain, JsonObject, JsonValue } from "@tracedeck/trace-core";

export const supportedAlgorithmIds = [
  "bubble-sort",
  "selection-sort",
  "quick-sort",
  "merge-sort",
  "binary-search",
  "search-in-rotated-sorted-array",
  "container-with-most-water",
  "trapping-rain-water",
  "minimum-size-subarray-sum",
  "two-sum",
  "kth-largest-element-in-an-array",
  "merge-intervals",
  "longest-common-subsequence",
  "valid-parentheses",
  "daily-temperatures",
  "largest-rectangle-in-histogram",
  "min-stack",
  "bfs",
  "dijkstra",
  "course-schedule",
  "rotting-oranges",
  "number-of-islands",
  "walls-and-gates"
] as const;

export type SupportedAlgorithmId = (typeof supportedAlgorithmIds)[number];

export interface SupportedAlgorithmDescriptor {
  id: SupportedAlgorithmId;
  label: string;
  domain: AlgorithmDomain;
}

export interface PathfindingGraphInputPayload extends JsonObject {
  nodes: string[];
  edges: Array<[string, string, number]>;
  start: string;
  target: string | null;
  directed: boolean;
}

export interface CourseScheduleInputPayload extends JsonObject {
  courseCount: number;
  prerequisites: Array<[number, number]>;
}

export interface RottingOrangesInputPayload extends JsonObject {
  grid: number[][];
}

export interface NumberOfIslandsInputPayload extends JsonObject {
  grid: string[][];
}

export interface WallsAndGatesInputPayload extends JsonObject {
  grid: number[][];
}

export type GraphInputPayload =
  | PathfindingGraphInputPayload
  | CourseScheduleInputPayload
  | RottingOrangesInputPayload
  | NumberOfIslandsInputPayload
  | WallsAndGatesInputPayload;

export interface SearchInputPayload extends JsonObject {
  array: number[];
  target: number;
}

export interface TwoPointersInputPayload extends JsonObject {
  heights: number[];
}

export interface WindowInputPayload extends JsonObject {
  array: number[];
  target: number;
}

export interface HashInputPayload extends JsonObject {
  array: number[];
  target: number;
}

export interface HeapInputPayload extends JsonObject {
  array: number[];
  k: number;
}

export interface IntervalInputPayload extends JsonObject {
  intervals: number[][];
}

export interface DynamicProgrammingInputPayload extends JsonObject {
  left: string;
  right: string;
}

export interface StackInputPayload extends JsonObject {
  expression?: string;
  temperatures?: number[];
  heights?: number[];
  operations?: Array<{
    type: "push" | "pop" | "top" | "getMin";
    value?: number;
  }>;
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
