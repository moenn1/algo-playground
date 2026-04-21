import {
  type ReferenceAlgorithmId,
  type ReferenceImplementation
} from "./reference.js"
import { type AccentTone } from "./replay.js"

export type ReferenceProblemId =
  | "merge-intervals"
  | "kth-largest-element-in-an-array"
  | "two-sum"
  | "valid-parentheses"
  | "longest-substring-without-repeating-characters"
  | "search-in-rotated-sorted-array"
  | "number-of-islands"
  | "shortest-path-in-binary-matrix"
  | "network-delay-time"
  | "coin-change"

export type ProblemDifficulty = "Easy" | "Medium" | "Hard"

export type ProblemPatternGroup =
  | "Array & Hashing"
  | "Intervals"
  | "Selection & Heaps"
  | "Stack"
  | "Sliding Window"
  | "Binary Search"
  | "Graph Traversal"
  | "Shortest Paths"
  | "Dynamic Programming"

export type ProblemImplementationVariant = {
  title: string
  summary: string
  whenToUse: string
}

export type ProblemReference = {
  id: ReferenceProblemId
  title: string
  difficulty: ProblemDifficulty
  summary: string
  problemStatement: string
  accent: AccentTone
  patternGroup: ProblemPatternGroup
  patternTags: string[]
  primaryAlgorithmIds: ReferenceAlgorithmId[]
  relatedAlgorithmIds: ReferenceAlgorithmId[]
  relatedProblemIds: ReferenceProblemId[]
  takeaways: string[]
  implementationVariants: ProblemImplementationVariant[]
  implementations: ReferenceImplementation[]
}

export const problemPatternGroups: ProblemPatternGroup[] = [
  "Array & Hashing",
  "Intervals",
  "Selection & Heaps",
  "Stack",
  "Sliding Window",
  "Binary Search",
  "Graph Traversal",
  "Shortest Paths",
  "Dynamic Programming"
]

export const problemReferences: ProblemReference[] = [
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    summary:
      "Sort intervals by start time, then sweep once to collapse every overlap into a minimal disjoint schedule.",
    problemStatement:
      "Given an array of intervals where each interval is a start and end pair, merge every overlapping interval and return the smallest equivalent set of non-overlapping ranges.",
    accent: "ember",
    patternGroup: "Intervals",
    patternTags: ["sorting", "interval sweep", "canonicalization"],
    primaryAlgorithmIds: ["merge-sort"],
    relatedAlgorithmIds: ["merge-sort", "quick-sort"],
    relatedProblemIds: ["kth-largest-element-in-an-array", "search-in-rotated-sorted-array"],
    takeaways: [
      "Sorting converts a pairwise overlap problem into a single forward scan.",
      "You only ever compare the next interval against the last merged interval.",
      "The sweep stays correct because later intervals cannot overlap anything earlier than the current merged tail."
    ],
    implementationVariants: [
      {
        title: "Sort and sweep",
        summary: "Sort by start time, then extend or append one merged interval at a time.",
        whenToUse: "Default approach for unsorted input and interview settings."
      },
      {
        title: "In-place compaction",
        summary: "Reuse the sorted array as the output buffer to reduce additional allocations.",
        whenToUse: "Useful when input mutation is allowed and memory pressure matters."
      }
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "mergeIntervals.ts",
        summary: "Copies and sorts the intervals, then merges them into a fresh result list.",
        code: String.raw`export function mergeIntervals(intervals: number[][]): number[][] {
  if (intervals.length <= 1) {
    return intervals.map(([start, end]) => [start, end])
  }

  const sorted = intervals
    .map(([start, end]) => [start, end])
    .sort((left, right) => left[0]! - right[0]!)

  const merged: number[][] = [sorted[0]!.slice()]

  for (const [start, end] of sorted.slice(1)) {
    const current = merged[merged.length - 1]!

    if (start <= current[1]!) {
      current[1] = Math.max(current[1]!, end)
    } else {
      merged.push([start, end])
    }
  }

  return merged
}`
      },
      {
        language: "python",
        label: "Python",
        filename: "merge_intervals.py",
        summary: "Canonical sort-and-sweep solution with one running merged tail.",
        code: String.raw`def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    if len(intervals) <= 1:
        return [interval[:] for interval in intervals]

    sorted_intervals = sorted((interval[:] for interval in intervals), key=lambda interval: interval[0])
    merged: list[list[int]] = [sorted_intervals[0]]

    for start, end in sorted_intervals[1:]:
        current = merged[-1]

        if start <= current[1]:
            current[1] = max(current[1], end)
        else:
            merged.append([start, end])

    return merged`
      },
      {
        language: "java",
        label: "Java",
        filename: "MergeIntervals.java",
        summary: "Sorts by interval start, then extends or appends merged ranges.",
        code: String.raw`import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

public final class MergeIntervals {
  public static int[][] solve(int[][] intervals) {
    if (intervals.length <= 1) {
      return Arrays.stream(intervals).map(int[]::clone).toArray(int[][]::new);
    }

    int[][] sorted = Arrays.stream(intervals).map(int[]::clone).toArray(int[][]::new);
    Arrays.sort(sorted, Comparator.comparingInt(interval -> interval[0]));

    List<int[]> merged = new ArrayList<>();
    merged.add(sorted[0].clone());

    for (int index = 1; index < sorted.length; index++) {
      int[] current = merged.get(merged.size() - 1);
      int[] interval = sorted[index];

      if (interval[0] <= current[1]) {
        current[1] = Math.max(current[1], interval[1]);
      } else {
        merged.add(interval.clone());
      }
    }

    return merged.toArray(new int[0][]);
  }
}`
      },
      {
        language: "cpp",
        label: "C++",
        filename: "merge_intervals.cpp",
        summary: "Uses `std::sort` plus one forward pass over the sorted ranges.",
        code: String.raw`#include <algorithm>
#include <vector>

std::vector<std::vector<int>> merge_intervals(std::vector<std::vector<int>> intervals) {
  if (intervals.size() <= 1) {
    return intervals;
  }

  std::sort(intervals.begin(), intervals.end(), [](const auto& left, const auto& right) {
    return left[0] < right[0];
  });

  std::vector<std::vector<int>> merged{intervals.front()};

  for (std::size_t index = 1; index < intervals.size(); ++index) {
    auto& current = merged.back();
    const auto& interval = intervals[index];

    if (interval[0] <= current[1]) {
      current[1] = std::max(current[1], interval[1]);
    } else {
      merged.push_back(interval);
    }
  }

  return merged;
}`
      }
    ]
  },
  {
    id: "kth-largest-element-in-an-array",
    title: "Kth Largest Element in an Array",
    difficulty: "Medium",
    summary:
      "Use partitioning or a bounded heap to avoid fully sorting the array when you only need one ranked element.",
    problemStatement:
      "Given an unsorted integer array and an integer k, return the kth largest element in the array without assuming values are unique.",
    accent: "teal",
    patternGroup: "Selection & Heaps",
    patternTags: ["quickselect", "partition", "heap"],
    primaryAlgorithmIds: ["quick-sort"],
    relatedAlgorithmIds: ["quick-sort", "selection-sort"],
    relatedProblemIds: ["merge-intervals", "search-in-rotated-sorted-array"],
    takeaways: [
      "Quickselect keeps only the partition that still contains the target rank.",
      "A size-k min-heap gives a predictable O(n log k) alternative.",
      "Convert the kth-largest request into an ascending index with `length - k`."
    ],
    implementationVariants: [
      {
        title: "Quickselect",
        summary: "Partition until the pivot lands exactly on the target rank.",
        whenToUse: "Best average-case choice when in-place mutation is acceptable."
      },
      {
        title: "Size-k min-heap",
        summary: "Maintain the largest k elements seen so far and return the smallest among them.",
        whenToUse: "Good when worst-case Quickselect behavior is undesirable."
      }
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "findKthLargest.ts",
        summary: "Iterative Quickselect over a copied array.",
        code: String.raw`export function findKthLargest(values: number[], k: number): number {
  const array = [...values]
  const targetIndex = array.length - k

  function partition(low: number, high: number): number {
    const pivot = array[high]!
    let storeIndex = low

    for (let index = low; index < high; index += 1) {
      if (array[index]! <= pivot) {
        ;[array[index], array[storeIndex]] = [array[storeIndex]!, array[index]!]
        storeIndex += 1
      }
    }

    ;[array[storeIndex], array[high]] = [array[high]!, array[storeIndex]!]
    return storeIndex
  }

  let low = 0
  let high = array.length - 1

  while (low <= high) {
    const pivotIndex = partition(low, high)

    if (pivotIndex === targetIndex) {
      return array[pivotIndex]!
    }

    if (pivotIndex < targetIndex) {
      low = pivotIndex + 1
    } else {
      high = pivotIndex - 1
    }
  }

  throw new Error("k is out of bounds")
}`
      },
      {
        language: "python",
        label: "Python",
        filename: "find_kth_largest.py",
        summary: "Quickselect with a last-element pivot and iterative bounds updates.",
        code: String.raw`def find_kth_largest(values: list[int], k: int) -> int:
    array = values[:]
    target_index = len(array) - k

    def partition(low: int, high: int) -> int:
        pivot = array[high]
        store_index = low

        for index in range(low, high):
            if array[index] <= pivot:
                array[index], array[store_index] = array[store_index], array[index]
                store_index += 1

        array[store_index], array[high] = array[high], array[store_index]
        return store_index

    low = 0
    high = len(array) - 1

    while low <= high:
        pivot_index = partition(low, high)

        if pivot_index == target_index:
            return array[pivot_index]

        if pivot_index < target_index:
            low = pivot_index + 1
        else:
            high = pivot_index - 1

    raise ValueError("k is out of bounds")`
      },
      {
        language: "java",
        label: "Java",
        filename: "FindKthLargest.java",
        summary: "Standard Quickselect implementation using ascending target index conversion.",
        code: String.raw`import java.util.Arrays;

public final class FindKthLargest {
  public static int solve(int[] values, int k) {
    int[] array = Arrays.copyOf(values, values.length);
    int targetIndex = array.length - k;
    int low = 0;
    int high = array.length - 1;

    while (low <= high) {
      int pivotIndex = partition(array, low, high);

      if (pivotIndex == targetIndex) {
        return array[pivotIndex];
      }

      if (pivotIndex < targetIndex) {
        low = pivotIndex + 1;
      } else {
        high = pivotIndex - 1;
      }
    }

    throw new IllegalArgumentException("k is out of bounds");
  }

  private static int partition(int[] array, int low, int high) {
    int pivot = array[high];
    int storeIndex = low;

    for (int index = low; index < high; index++) {
      if (array[index] <= pivot) {
        int temp = array[index];
        array[index] = array[storeIndex];
        array[storeIndex] = temp;
        storeIndex++;
      }
    }

    int temp = array[storeIndex];
    array[storeIndex] = array[high];
    array[high] = temp;
    return storeIndex;
  }
}`
      },
      {
        language: "cpp",
        label: "C++",
        filename: "find_kth_largest.cpp",
        summary: "Quickselect with iterative narrowing over a copied vector.",
        code: String.raw`#include <stdexcept>
#include <utility>
#include <vector>

int partition(std::vector<int>& array, int low, int high) {
  int pivot = array[high];
  int store_index = low;

  for (int index = low; index < high; ++index) {
    if (array[index] <= pivot) {
      std::swap(array[index], array[store_index]);
      ++store_index;
    }
  }

  std::swap(array[store_index], array[high]);
  return store_index;
}

int find_kth_largest(const std::vector<int>& values, int k) {
  std::vector<int> array = values;
  int target_index = static_cast<int>(array.size()) - k;
  int low = 0;
  int high = static_cast<int>(array.size()) - 1;

  while (low <= high) {
    int pivot_index = partition(array, low, high);

    if (pivot_index == target_index) {
      return array[pivot_index];
    }

    if (pivot_index < target_index) {
      low = pivot_index + 1;
    } else {
      high = pivot_index - 1;
    }
  }

  throw std::invalid_argument("k is out of bounds");
}`
      }
    ]
  },
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    summary:
      "Walk the array once while storing seen values in a hash map so each element can immediately look up its needed complement.",
    problemStatement:
      "Given an integer array and a target sum, return the indices of the two numbers whose values add to the target. Assume exactly one solution exists and an element cannot be used twice.",
    accent: "gold",
    patternGroup: "Array & Hashing",
    patternTags: ["hash map", "complement lookup", "one-pass"],
    primaryAlgorithmIds: [],
    relatedAlgorithmIds: [],
    relatedProblemIds: ["longest-substring-without-repeating-characters", "search-in-rotated-sorted-array"],
    takeaways: [
      "The key observation is that every value only needs to know whether its complement has already appeared.",
      "The map stores value-to-index so the solution is produced in one pass.",
      "Sorting is unnecessary because the original indices must be returned."
    ],
    implementationVariants: [
      {
        title: "One-pass hash map",
        summary: "Check for the complement before inserting the current value.",
        whenToUse: "Default solution with O(n) time and O(n) extra space."
      },
      {
        title: "Sort plus two pointers",
        summary: "Sort value-index pairs, then move inward from both ends.",
        whenToUse: "Useful when you want a pointer-based variant and can tolerate extra bookkeeping."
      }
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "twoSum.ts",
        summary: "One-pass complement lookup using a `Map`.",
        code: String.raw`export function twoSum(values: number[], target: number): number[] {
  const seen = new Map<number, number>()

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]!
    const complement = target - value

    if (seen.has(complement)) {
      return [seen.get(complement)!, index]
    }

    seen.set(value, index)
  }

  throw new Error("No valid pair found")
}`
      },
      {
        language: "python",
        label: "Python",
        filename: "two_sum.py",
        summary: "Dictionary-backed one-pass solution.",
        code: String.raw`def two_sum(values: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}

    for index, value in enumerate(values):
        complement = target - value

        if complement in seen:
            return [seen[complement], index]

        seen[value] = index

    raise ValueError("No valid pair found")`
      },
      {
        language: "java",
        label: "Java",
        filename: "TwoSum.java",
        summary: "HashMap solution that returns as soon as the complement appears.",
        code: String.raw`import java.util.HashMap;
import java.util.Map;

public final class TwoSum {
  public static int[] solve(int[] values, int target) {
    Map<Integer, Integer> seen = new HashMap<>();

    for (int index = 0; index < values.length; index++) {
      int value = values[index];
      int complement = target - value;

      if (seen.containsKey(complement)) {
        return new int[] {seen.get(complement), index};
      }

      seen.put(value, index);
    }

    throw new IllegalArgumentException("No valid pair found");
  }
}`
      },
      {
        language: "cpp",
        label: "C++",
        filename: "two_sum.cpp",
        summary: "Unordered map lookup for the complement of each value.",
        code: String.raw`#include <stdexcept>
#include <unordered_map>
#include <vector>

std::vector<int> two_sum(const std::vector<int>& values, int target) {
  std::unordered_map<int, int> seen;

  for (int index = 0; index < static_cast<int>(values.size()); ++index) {
    int value = values[index];
    int complement = target - value;
    auto found = seen.find(complement);

    if (found != seen.end()) {
      return {found->second, index};
    }

    seen[value] = index;
  }

  throw std::invalid_argument("No valid pair found");
}`
      }
    ]
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    summary:
      "Use a stack of opening brackets so every closing bracket can verify the most recent unmatched opener.",
    problemStatement:
      "Given a string containing only the characters `()[]{}`, determine whether the input string is valid. A valid string must close brackets in the correct order and with matching bracket types.",
    accent: "gold",
    patternGroup: "Stack",
    patternTags: ["stack", "delimiter matching", "last-in-first-out"],
    primaryAlgorithmIds: [],
    relatedAlgorithmIds: [],
    relatedProblemIds: ["longest-substring-without-repeating-characters", "two-sum"],
    takeaways: [
      "The newest unmatched opener must be the first one a closing bracket resolves.",
      "A mismatch or an early closing bracket invalidates the string immediately.",
      "The stack must be empty after the full scan for the string to be valid."
    ],
    implementationVariants: [
      {
        title: "Explicit opener stack",
        summary: "Push open brackets and pop only when the closing bracket matches the expected type.",
        whenToUse: "Best default interview solution."
      },
      {
        title: "Expected-closer stack",
        summary: "Push the expected closing bracket instead of the opener.",
        whenToUse: "Useful when you want to avoid a separate matching map during pops."
      }
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "isValidParentheses.ts",
        summary: "Stores unmatched opening brackets in an array-backed stack.",
        code: String.raw`export function isValidParentheses(text: string): boolean {
  const matches: Record<string, string> = {
    ")": "(",
    "]": "[",
    "}": "{"
  }
  const stack: string[] = []

  for (const character of text) {
    if (character === "(" || character === "[" || character === "{") {
      stack.push(character)
      continue
    }

    const opener = stack.pop()

    if (opener !== matches[character]) {
      return false
    }
  }

  return stack.length === 0
}`
      },
      {
        language: "python",
        label: "Python",
        filename: "is_valid_parentheses.py",
        summary: "Checks each closer against the most recent unmatched opener.",
        code: String.raw`def is_valid_parentheses(text: str) -> bool:
    matches = {
        ")": "(",
        "]": "[",
        "}": "{",
    }
    stack: list[str] = []

    for character in text:
        if character in "([{":
            stack.append(character)
            continue

        opener = stack.pop() if stack else None

        if opener != matches[character]:
            return False

    return not stack`
      },
      {
        language: "java",
        label: "Java",
        filename: "ValidParentheses.java",
        summary: "Deque-backed stack for matching brackets.",
        code: String.raw`import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;

public final class ValidParentheses {
  public static boolean solve(String text) {
    Map<Character, Character> matches = Map.of(
        ')', '(',
        ']', '[',
        '}', '{'
    );
    Deque<Character> stack = new ArrayDeque<>();

    for (int index = 0; index < text.length(); index++) {
      char character = text.charAt(index);

      if (character == '(' || character == '[' || character == '{') {
        stack.push(character);
        continue;
      }

      Character opener = stack.poll();

      if (opener == null || opener != matches.get(character)) {
        return false;
      }
    }

    return stack.isEmpty();
  }
}`
      },
      {
        language: "cpp",
        label: "C++",
        filename: "valid_parentheses.cpp",
        summary: "Vector-backed stack with explicit closer-to-opener mapping.",
        code: String.raw`#include <string>
#include <unordered_map>
#include <vector>

bool valid_parentheses(const std::string& text) {
  const std::unordered_map<char, char> matches{
      {')', '('},
      {']', '['},
      {'}', '{'}
  };
  std::vector<char> stack;

  for (char character : text) {
    if (character == '(' || character == '[' || character == '{') {
      stack.push_back(character);
      continue;
    }

    if (stack.empty() || stack.back() != matches.at(character)) {
      return false;
    }

    stack.pop_back();
  }

  return stack.empty();
}`
      }
    ]
  },
  {
    id: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    summary:
      "Use a sliding window with last-seen positions so the left edge only moves when a duplicate enters the active window.",
    problemStatement:
      "Given a string, return the length of the longest substring that contains no repeated characters.",
    accent: "ember",
    patternGroup: "Sliding Window",
    patternTags: ["sliding window", "last seen index", "substring"],
    primaryAlgorithmIds: [],
    relatedAlgorithmIds: [],
    relatedProblemIds: ["two-sum", "valid-parentheses"],
    takeaways: [
      "The active window is always duplicate-free after the left edge is updated.",
      "Last-seen indices let the left bound jump instead of moving one step at a time.",
      "The left edge should never move backward, even if the duplicate was seen earlier in the string."
    ],
    implementationVariants: [
      {
        title: "Index map window",
        summary: "Store the most recent index for each character and jump the left edge forward on duplicates.",
        whenToUse: "Most common interview solution with O(n) time."
      },
      {
        title: "Frequency-count window",
        summary: "Grow the right edge, then shrink the left edge while any character count exceeds one.",
        whenToUse: "Useful when you want one reusable template for many sliding-window questions."
      }
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "lengthOfLongestSubstring.ts",
        summary: "Sliding window powered by a `Map` of last-seen indices.",
        code: String.raw`export function lengthOfLongestSubstring(text: string): number {
  const lastSeen = new Map<string, number>()
  let left = 0
  let best = 0

  for (let right = 0; right < text.length; right += 1) {
    const character = text[right]!

    if (lastSeen.has(character)) {
      left = Math.max(left, lastSeen.get(character)! + 1)
    }

    lastSeen.set(character, right)
    best = Math.max(best, right - left + 1)
  }

  return best
}`
      },
      {
        language: "python",
        label: "Python",
        filename: "length_of_longest_substring.py",
        summary: "Tracks the last index of each character in a dictionary.",
        code: String.raw`def length_of_longest_substring(text: str) -> int:
    last_seen: dict[str, int] = {}
    left = 0
    best = 0

    for right, character in enumerate(text):
        if character in last_seen:
            left = max(left, last_seen[character] + 1)

        last_seen[character] = right
        best = max(best, right - left + 1)

    return best`
      },
      {
        language: "java",
        label: "Java",
        filename: "LengthOfLongestSubstring.java",
        summary: "HashMap-based sliding window with non-decreasing left bound.",
        code: String.raw`import java.util.HashMap;
import java.util.Map;

public final class LengthOfLongestSubstring {
  public static int solve(String text) {
    Map<Character, Integer> lastSeen = new HashMap<>();
    int left = 0;
    int best = 0;

    for (int right = 0; right < text.length(); right++) {
      char character = text.charAt(right);

      if (lastSeen.containsKey(character)) {
        left = Math.max(left, lastSeen.get(character) + 1);
      }

      lastSeen.put(character, right);
      best = Math.max(best, right - left + 1);
    }

    return best;
  }
}`
      },
      {
        language: "cpp",
        label: "C++",
        filename: "length_of_longest_substring.cpp",
        summary: "Unordered map with sliding-window boundaries.",
        code: String.raw`#include <algorithm>
#include <string>
#include <unordered_map>

int length_of_longest_substring(const std::string& text) {
  std::unordered_map<char, int> last_seen;
  int left = 0;
  int best = 0;

  for (int right = 0; right < static_cast<int>(text.size()); ++right) {
    char character = text[right];
    auto found = last_seen.find(character);

    if (found != last_seen.end()) {
      left = std::max(left, found->second + 1);
    }

    last_seen[character] = right;
    best = std::max(best, right - left + 1);
  }

  return best;
}`
      }
    ]
  },
  {
    id: "search-in-rotated-sorted-array",
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    summary:
      "Use modified binary search to decide which half remains sorted after rotation, then discard the half that cannot contain the target.",
    problemStatement:
      "Given a rotated sorted array of distinct integers and a target value, return the index of the target if it exists, otherwise return `-1`.",
    accent: "teal",
    patternGroup: "Binary Search",
    patternTags: ["binary search", "rotated array", "sorted half invariant"],
    primaryAlgorithmIds: [],
    relatedAlgorithmIds: [],
    relatedProblemIds: ["kth-largest-element-in-an-array", "two-sum"],
    takeaways: [
      "At least one half of the current interval is always normally sorted.",
      "Once you know which half is sorted, you can check whether the target belongs there before discarding the other half.",
      "The loop invariant is still binary search: the target, if present, stays inside the active interval."
    ],
    implementationVariants: [
      {
        title: "Sorted-half detection",
        summary: "Check whether the left half or right half is sorted on each step, then decide where the target can still live.",
        whenToUse: "Default solution for distinct values."
      },
      {
        title: "Pivot then binary search",
        summary: "First find the rotation pivot, then run ordinary binary search on the appropriate half.",
        whenToUse: "Helpful when you want to split reasoning into two simpler phases."
      }
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "searchRotatedArray.ts",
        summary: "Modified binary search that detects the sorted half each iteration.",
        code: String.raw`export function searchRotatedArray(values: number[], target: number): number {
  let left = 0
  let right = values.length - 1

  while (left <= right) {
    const middle = Math.floor((left + right) / 2)
    const middleValue = values[middle]!

    if (middleValue === target) {
      return middle
    }

    if (values[left]! <= middleValue) {
      if (values[left]! <= target && target < middleValue) {
        right = middle - 1
      } else {
        left = middle + 1
      }
    } else {
      if (middleValue < target && target <= values[right]!) {
        left = middle + 1
      } else {
        right = middle - 1
      }
    }
  }

  return -1
}`
      },
      {
        language: "python",
        label: "Python",
        filename: "search_rotated_array.py",
        summary: "Binary search over a rotated interval with sorted-half checks.",
        code: String.raw`def search_rotated_array(values: list[int], target: int) -> int:
    left = 0
    right = len(values) - 1

    while left <= right:
        middle = (left + right) // 2
        middle_value = values[middle]

        if middle_value == target:
            return middle

        if values[left] <= middle_value:
            if values[left] <= target < middle_value:
                right = middle - 1
            else:
                left = middle + 1
        else:
            if middle_value < target <= values[right]:
                left = middle + 1
            else:
                right = middle - 1

    return -1`
      },
      {
        language: "java",
        label: "Java",
        filename: "SearchRotatedArray.java",
        summary: "Classic sorted-half reasoning for distinct rotated values.",
        code: String.raw`public final class SearchRotatedArray {
  public static int solve(int[] values, int target) {
    int left = 0;
    int right = values.length - 1;

    while (left <= right) {
      int middle = left + (right - left) / 2;
      int middleValue = values[middle];

      if (middleValue == target) {
        return middle;
      }

      if (values[left] <= middleValue) {
        if (values[left] <= target && target < middleValue) {
          right = middle - 1;
        } else {
          left = middle + 1;
        }
      } else {
        if (middleValue < target && target <= values[right]) {
          left = middle + 1;
        } else {
          right = middle - 1;
        }
      }
    }

    return -1;
  }
}`
      },
      {
        language: "cpp",
        label: "C++",
        filename: "search_rotated_array.cpp",
        summary: "Binary search with explicit sorted-half narrowing.",
        code: String.raw`#include <vector>

int search_rotated_array(const std::vector<int>& values, int target) {
  int left = 0;
  int right = static_cast<int>(values.size()) - 1;

  while (left <= right) {
    int middle = left + (right - left) / 2;
    int middle_value = values[middle];

    if (middle_value == target) {
      return middle;
    }

    if (values[left] <= middle_value) {
      if (values[left] <= target && target < middle_value) {
        right = middle - 1;
      } else {
        left = middle + 1;
      }
    } else {
      if (middle_value < target && target <= values[right]) {
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }
  }

  return -1;
}`
      }
    ]
  },
  {
    id: "number-of-islands",
    title: "Number of Islands",
    difficulty: "Medium",
    summary:
      "Treat each land cell as a graph node and run flood-fill traversal whenever an unseen island cell appears.",
    problemStatement:
      "Given a 2D grid of `1`s and `0`s, return the number of connected land components. Cells connect horizontally and vertically.",
    accent: "gold",
    patternGroup: "Graph Traversal",
    patternTags: ["grid bfs", "flood fill", "connected components"],
    primaryAlgorithmIds: ["bfs"],
    relatedAlgorithmIds: ["bfs"],
    relatedProblemIds: ["shortest-path-in-binary-matrix", "network-delay-time"],
    takeaways: [
      "Each BFS or DFS launched from unseen land consumes exactly one island.",
      "Marking visited cells immediately prevents duplicate work across neighboring expansions.",
      "This is fundamentally a connected-components problem on an implicit grid graph."
    ],
    implementationVariants: [
      {
        title: "BFS flood fill",
        summary: "Use a queue to consume one island at a time.",
        whenToUse: "Natural fit when the platform already teaches queue-based graph traversal."
      },
      {
        title: "DFS flood fill",
        summary: "Use recursion or an explicit stack to mark one connected land mass.",
        whenToUse: "Shorter to write when recursion depth is safe."
      }
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "numIslands.ts",
        summary: "Queue-based flood fill over four-direction neighbors.",
        code: String.raw`export function numIslands(grid: string[][]): number {
  const rows = grid.length
  const columns = grid[0]?.length ?? 0
  const visited = new Set<string>()
  let islands = 0

  function enqueueIsland(startRow: number, startColumn: number) {
    const queue: Array<[number, number]> = [[startRow, startColumn]]
    visited.add(startRow + "," + startColumn)

    while (queue.length > 0) {
      const [row, column] = queue.shift()!

      for (const [rowDelta, columnDelta] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nextRow = row + rowDelta
        const nextColumn = column + columnDelta
        const key = nextRow + "," + nextColumn

        if (
          nextRow < 0 ||
          nextColumn < 0 ||
          nextRow >= rows ||
          nextColumn >= columns ||
          grid[nextRow]?.[nextColumn] !== "1" ||
          visited.has(key)
        ) {
          continue
        }

        visited.add(key)
        queue.push([nextRow, nextColumn])
      }
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const key = row + "," + column

      if (grid[row]?.[column] !== "1" || visited.has(key)) {
        continue
      }

      islands += 1
      enqueueIsland(row, column)
    }
  }

  return islands
}`
      },
      {
        language: "python",
        label: "Python",
        filename: "num_islands.py",
        summary: "BFS flood fill with a visited set.",
        code: String.raw`from collections import deque

def num_islands(grid: list[list[str]]) -> int:
    rows = len(grid)
    columns = len(grid[0]) if grid else 0
    visited: set[tuple[int, int]] = set()
    islands = 0

    def flood_fill(start_row: int, start_column: int) -> None:
        queue = deque([(start_row, start_column)])
        visited.add((start_row, start_column))

        while queue:
            row, column = queue.popleft()

            for row_delta, column_delta in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                next_row = row + row_delta
                next_column = column + column_delta

                if (
                    next_row < 0
                    or next_column < 0
                    or next_row >= rows
                    or next_column >= columns
                    or grid[next_row][next_column] != "1"
                    or (next_row, next_column) in visited
                ):
                    continue

                visited.add((next_row, next_column))
                queue.append((next_row, next_column))

    for row in range(rows):
        for column in range(columns):
            if grid[row][column] != "1" or (row, column) in visited:
                continue

            islands += 1
            flood_fill(row, column)

    return islands`
      },
      {
        language: "java",
        label: "Java",
        filename: "NumIslands.java",
        summary: "Queue-driven component counting over the grid graph.",
        code: String.raw`import java.util.ArrayDeque;
import java.util.Deque;

public final class NumIslands {
  private static final int[][] DIRECTIONS = {
      {1, 0},
      {-1, 0},
      {0, 1},
      {0, -1}
  };

  public static int solve(char[][] grid) {
    int rows = grid.length;
    int columns = grid[0].length;
    boolean[][] visited = new boolean[rows][columns];
    int islands = 0;

    for (int row = 0; row < rows; row++) {
      for (int column = 0; column < columns; column++) {
        if (grid[row][column] != '1' || visited[row][column]) {
          continue;
        }

        islands++;
        Deque<int[]> queue = new ArrayDeque<>();
        queue.addLast(new int[] {row, column});
        visited[row][column] = true;

        while (!queue.isEmpty()) {
          int[] cell = queue.removeFirst();

          for (int[] direction : DIRECTIONS) {
            int nextRow = cell[0] + direction[0];
            int nextColumn = cell[1] + direction[1];

            if (
                nextRow < 0
                || nextColumn < 0
                || nextRow >= rows
                || nextColumn >= columns
                || grid[nextRow][nextColumn] != '1'
                || visited[nextRow][nextColumn]
            ) {
              continue;
            }

            visited[nextRow][nextColumn] = true;
            queue.addLast(new int[] {nextRow, nextColumn});
          }
        }
      }
    }

    return islands;
  }
}`
      },
      {
        language: "cpp",
        label: "C++",
        filename: "num_islands.cpp",
        summary: "Counts components with BFS over four-direction land neighbors.",
        code: String.raw`#include <queue>
#include <utility>
#include <vector>

int num_islands(const std::vector<std::vector<char>>& grid) {
  int rows = static_cast<int>(grid.size());
  int columns = rows == 0 ? 0 : static_cast<int>(grid[0].size());
  std::vector<std::vector<bool>> visited(rows, std::vector<bool>(columns, false));
  int islands = 0;

  for (int row = 0; row < rows; ++row) {
    for (int column = 0; column < columns; ++column) {
      if (grid[row][column] != '1' || visited[row][column]) {
        continue;
      }

      ++islands;
      std::queue<std::pair<int, int>> queue;
      queue.push({row, column});
      visited[row][column] = true;

      while (!queue.empty()) {
        auto [current_row, current_column] = queue.front();
        queue.pop();

        for (const auto& [row_delta, column_delta] : std::vector<std::pair<int, int>>{
                 {1, 0}, {-1, 0}, {0, 1}, {0, -1}}) {
          int next_row = current_row + row_delta;
          int next_column = current_column + column_delta;

          if (
              next_row < 0 ||
              next_column < 0 ||
              next_row >= rows ||
              next_column >= columns ||
              grid[next_row][next_column] != '1' ||
              visited[next_row][next_column]
          ) {
            continue;
          }

          visited[next_row][next_column] = true;
          queue.push({next_row, next_column});
        }
      }
    }
  }

  return islands;
}`
      }
    ]
  },
  {
    id: "shortest-path-in-binary-matrix",
    title: "Shortest Path in Binary Matrix",
    difficulty: "Medium",
    summary:
      "Treat each open cell as a graph node and run breadth-first search over eight directions to find the fewest moves from the top-left corner to the bottom-right corner.",
    problemStatement:
      "Given an `n x n` binary matrix where `0` means open and `1` means blocked, return the length of the shortest clear path from the top-left cell to the bottom-right cell when moves in eight directions are allowed.",
    accent: "gold",
    patternGroup: "Graph Traversal",
    patternTags: ["bfs", "grid graph", "shortest path"],
    primaryAlgorithmIds: ["bfs"],
    relatedAlgorithmIds: ["bfs", "dijkstra"],
    relatedProblemIds: ["number-of-islands", "network-delay-time"],
    takeaways: [
      "Uniform move cost means BFS already produces the shortest path length.",
      "Mark cells visited when they are enqueued so the same cell never re-enters the frontier.",
      "The queue expands the grid one distance layer at a time."
    ],
    implementationVariants: [
      {
        title: "Eight-direction BFS",
        summary: "Store a distance alongside each queued cell and explore all valid neighbors.",
        whenToUse: "Default solution when every move has equal cost."
      },
      {
        title: "Layered BFS",
        summary: "Track the frontier layer externally and increment the path length once per wave.",
        whenToUse: "Useful when you want to avoid storing distance in each queue entry."
      }
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "shortestPathBinaryMatrix.ts",
        summary: "Queue-based BFS with eight-direction movement.",
        code: String.raw`export function shortestPathBinaryMatrix(grid: number[][]): number {
  const size = grid.length

  if (grid[0]?.[0] !== 0 || grid[size - 1]?.[size - 1] !== 0) {
    return -1
  }

  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ]
  const queue: Array<[number, number, number]> = [[0, 0, 1]]
  const visited = new Set<string>(["0,0"])

  while (queue.length > 0) {
    const [row, column, distance] = queue.shift()!

    if (row === size - 1 && column === size - 1) {
      return distance
    }

    for (const [rowDelta, columnDelta] of directions) {
      const nextRow = row + rowDelta
      const nextColumn = column + columnDelta
      const key = nextRow + "," + nextColumn

      if (
        nextRow < 0 ||
        nextColumn < 0 ||
        nextRow >= size ||
        nextColumn >= size ||
        grid[nextRow]?.[nextColumn] !== 0 ||
        visited.has(key)
      ) {
        continue
      }

      visited.add(key)
      queue.push([nextRow, nextColumn, distance + 1])
    }
  }

  return -1
}`
      },
      {
        language: "python",
        label: "Python",
        filename: "shortest_path_binary_matrix.py",
        summary: "Straightforward deque-driven BFS for an implicit grid graph.",
        code: String.raw`from collections import deque

def shortest_path_binary_matrix(grid: list[list[int]]) -> int:
    size = len(grid)

    if grid[0][0] != 0 or grid[size - 1][size - 1] != 0:
        return -1

    directions = [
        (-1, -1), (-1, 0), (-1, 1),
        (0, -1),           (0, 1),
        (1, -1),  (1, 0),  (1, 1),
    ]
    queue = deque([(0, 0, 1)])
    visited = {(0, 0)}

    while queue:
        row, column, distance = queue.popleft()

        if row == size - 1 and column == size - 1:
            return distance

        for row_delta, column_delta in directions:
            next_row = row + row_delta
            next_column = column + column_delta

            if (
                next_row < 0
                or next_column < 0
                or next_row >= size
                or next_column >= size
                or grid[next_row][next_column] != 0
                or (next_row, next_column) in visited
            ):
                continue

            visited.add((next_row, next_column))
            queue.append((next_row, next_column, distance + 1))

    return -1`
      },
      {
        language: "java",
        label: "Java",
        filename: "ShortestPathBinaryMatrix.java",
        summary: "ArrayDeque-based BFS with eight-direction neighbor expansion.",
        code: String.raw`import java.util.ArrayDeque;
import java.util.Deque;

public final class ShortestPathBinaryMatrix {
  private static final int[][] DIRECTIONS = {
      {-1, -1}, {-1, 0}, {-1, 1},
      {0, -1},           {0, 1},
      {1, -1},  {1, 0},  {1, 1}
  };

  public static int solve(int[][] grid) {
    int size = grid.length;

    if (grid[0][0] != 0 || grid[size - 1][size - 1] != 0) {
      return -1;
    }

    Deque<int[]> queue = new ArrayDeque<>();
    boolean[][] visited = new boolean[size][size];
    queue.addLast(new int[] {0, 0, 1});
    visited[0][0] = true;

    while (!queue.isEmpty()) {
      int[] state = queue.removeFirst();
      int row = state[0];
      int column = state[1];
      int distance = state[2];

      if (row == size - 1 && column == size - 1) {
        return distance;
      }

      for (int[] direction : DIRECTIONS) {
        int nextRow = row + direction[0];
        int nextColumn = column + direction[1];

        if (
            nextRow < 0
            || nextColumn < 0
            || nextRow >= size
            || nextColumn >= size
            || grid[nextRow][nextColumn] != 0
            || visited[nextRow][nextColumn]
        ) {
          continue;
        }

        visited[nextRow][nextColumn] = true;
        queue.addLast(new int[] {nextRow, nextColumn, distance + 1});
      }
    }

    return -1;
  }
}`
      },
      {
        language: "cpp",
        label: "C++",
        filename: "shortest_path_binary_matrix.cpp",
        summary: "Breadth-first traversal with eight valid movement directions.",
        code: String.raw`#include <array>
#include <queue>
#include <tuple>
#include <vector>

int shortest_path_binary_matrix(const std::vector<std::vector<int>>& grid) {
  int size = static_cast<int>(grid.size());

  if (grid[0][0] != 0 || grid[size - 1][size - 1] != 0) {
    return -1;
  }

  const std::array<std::pair<int, int>, 8> directions{{
      {-1, -1}, {-1, 0}, {-1, 1},
      {0, -1},            {0, 1},
      {1, -1},  {1, 0},   {1, 1}
  }};

  std::queue<std::tuple<int, int, int>> queue;
  std::vector<std::vector<bool>> visited(size, std::vector<bool>(size, false));
  queue.push({0, 0, 1});
  visited[0][0] = true;

  while (!queue.empty()) {
    auto [row, column, distance] = queue.front();
    queue.pop();

    if (row == size - 1 && column == size - 1) {
      return distance;
    }

    for (const auto& [row_delta, column_delta] : directions) {
      int next_row = row + row_delta;
      int next_column = column + column_delta;

      if (
          next_row < 0 ||
          next_column < 0 ||
          next_row >= size ||
          next_column >= size ||
          grid[next_row][next_column] != 0 ||
          visited[next_row][next_column]
      ) {
        continue;
      }

      visited[next_row][next_column] = true;
      queue.push({next_row, next_column, distance + 1});
    }
  }

  return -1;
}`
      }
    ]
  },
  {
    id: "network-delay-time",
    title: "Network Delay Time",
    difficulty: "Medium",
    summary:
      "Run Dijkstra from the source and return the maximum shortest-path distance across all nodes that receive the signal.",
    problemStatement:
      "Given directed travel times between nodes, a node count, and a source node, compute how long it takes for the signal to reach every node or return `-1` if any node is unreachable.",
    accent: "teal",
    patternGroup: "Shortest Paths",
    patternTags: ["dijkstra", "weighted graph", "shortest path"],
    primaryAlgorithmIds: ["dijkstra"],
    relatedAlgorithmIds: ["dijkstra", "bfs"],
    relatedProblemIds: ["shortest-path-in-binary-matrix", "number-of-islands"],
    takeaways: [
      "The answer is not one target distance; it is the maximum shortest-path distance among all reachable nodes.",
      "A min-heap keeps the next expansion aligned with Dijkstra's greedy invariant.",
      "If some nodes are never reached, the problem asks for `-1`."
    ],
    implementationVariants: [
      {
        title: "Adjacency list plus min-heap",
        summary: "Use Dijkstra with a priority queue over the current frontier.",
        whenToUse: "Best default choice for sparse weighted graphs."
      },
      {
        title: "Dense-graph scan",
        summary: "Replace the heap with repeated scans for the nearest unsettled node.",
        whenToUse: "Useful when graph density is high and code simplicity matters more than asymptotic speed."
      }
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "networkDelayTime.ts",
        summary: "Uses a sorted frontier array to keep the logic explicit.",
        code: String.raw`export function networkDelayTime(
  times: number[][],
  nodeCount: number,
  source: number
): number {
  const graph = new Map<number, Array<[number, number]>>()

  for (const [from, to, weight] of times) {
    const neighbors = graph.get(from) ?? []
    neighbors.push([to, weight])
    graph.set(from, neighbors)
  }

  const distances = new Map<number, number>([[source, 0]])
  const frontier: Array<[number, number]> = [[0, source]]

  while (frontier.length > 0) {
    frontier.sort((left, right) => left[0] - right[0])
    const [distance, node] = frontier.shift()!

    if (distance !== distances.get(node)) {
      continue
    }

    for (const [neighbor, weight] of graph.get(node) ?? []) {
      const nextDistance = distance + weight

      if (nextDistance < (distances.get(neighbor) ?? Number.POSITIVE_INFINITY)) {
        distances.set(neighbor, nextDistance)
        frontier.push([nextDistance, neighbor])
      }
    }
  }

  if (distances.size !== nodeCount) {
    return -1
  }

  return Math.max(...distances.values())
}`
      },
      {
        language: "python",
        label: "Python",
        filename: "network_delay_time.py",
        summary: "Heap-backed Dijkstra over a directed adjacency list.",
        code: String.raw`import heapq

def network_delay_time(times: list[list[int]], node_count: int, source: int) -> int:
    graph: dict[int, list[tuple[int, int]]] = {}

    for from_node, to_node, weight in times:
        graph.setdefault(from_node, []).append((to_node, weight))

    heap: list[tuple[int, int]] = [(0, source)]
    distances: dict[int, int] = {source: 0}

    while heap:
        distance, node = heapq.heappop(heap)

        if distance != distances.get(node):
            continue

        for neighbor, weight in graph.get(node, []):
            next_distance = distance + weight

            if next_distance < distances.get(neighbor, float("inf")):
                distances[neighbor] = next_distance
                heapq.heappush(heap, (next_distance, neighbor))

    if len(distances) != node_count:
        return -1

    return max(distances.values())`
      },
      {
        language: "java",
        label: "Java",
        filename: "NetworkDelayTime.java",
        summary: "PriorityQueue-driven Dijkstra that returns the farthest settled distance.",
        code: String.raw`import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;

public final class NetworkDelayTime {
  private static final class State implements Comparable<State> {
    private final int distance;
    private final int node;

    private State(int distance, int node) {
      this.distance = distance;
      this.node = node;
    }

    @Override
    public int compareTo(State other) {
      return Integer.compare(distance, other.distance);
    }
  }

  public static int solve(int[][] times, int nodeCount, int source) {
    Map<Integer, List<int[]>> graph = new HashMap<>();

    for (int[] edge : times) {
      graph.computeIfAbsent(edge[0], ignored -> new ArrayList<>()).add(new int[] {edge[1], edge[2]});
    }

    Map<Integer, Integer> distances = new HashMap<>();
    PriorityQueue<State> heap = new PriorityQueue<>();
    distances.put(source, 0);
    heap.add(new State(0, source));

    while (!heap.isEmpty()) {
      State current = heap.remove();

      if (current.distance != distances.getOrDefault(current.node, Integer.MAX_VALUE)) {
        continue;
      }

      for (int[] edge : graph.getOrDefault(current.node, List.of())) {
        int nextDistance = current.distance + edge[1];

        if (nextDistance < distances.getOrDefault(edge[0], Integer.MAX_VALUE)) {
          distances.put(edge[0], nextDistance);
          heap.add(new State(nextDistance, edge[0]));
        }
      }
    }

    if (distances.size() != nodeCount) {
      return -1;
    }

    int answer = 0;

    for (int distance : distances.values()) {
      answer = Math.max(answer, distance);
    }

    return answer;
  }
}`
      },
      {
        language: "cpp",
        label: "C++",
        filename: "network_delay_time.cpp",
        summary: "Priority-queue Dijkstra returning the maximum settled distance.",
        code: String.raw`#include <algorithm>
#include <functional>
#include <queue>
#include <unordered_map>
#include <utility>
#include <vector>

int network_delay_time(const std::vector<std::vector<int>>& times, int node_count, int source) {
  std::unordered_map<int, std::vector<std::pair<int, int>>> graph;

  for (const auto& edge : times) {
    graph[edge[0]].push_back({edge[1], edge[2]});
  }

  using State = std::pair<int, int>;
  std::priority_queue<State, std::vector<State>, std::greater<State>> heap;
  std::unordered_map<int, int> distances;
  heap.push({0, source});
  distances[source] = 0;

  while (!heap.empty()) {
    auto [distance, node] = heap.top();
    heap.pop();

    if (distance != distances[node]) {
      continue;
    }

    for (const auto& [neighbor, weight] : graph[node]) {
      int next_distance = distance + weight;
      auto found = distances.find(neighbor);

      if (found == distances.end() || next_distance < found->second) {
        distances[neighbor] = next_distance;
        heap.push({next_distance, neighbor});
      }
    }
  }

  if (static_cast<int>(distances.size()) != node_count) {
    return -1;
  }

  int answer = 0;

  for (const auto& [node, distance] : distances) {
    answer = std::max(answer, distance);
  }

  return answer;
}`
      }
    ]
  },
  {
    id: "coin-change",
    title: "Coin Change",
    difficulty: "Medium",
    summary:
      "Build a bottom-up dynamic-programming table where each amount stores the fewest coins needed to reach it.",
    problemStatement:
      "Given a list of coin denominations and a target amount, return the minimum number of coins needed to make up that amount or `-1` if it is impossible.",
    accent: "ember",
    patternGroup: "Dynamic Programming",
    patternTags: ["dynamic programming", "unbounded knapsack", "minimum steps"],
    primaryAlgorithmIds: [],
    relatedAlgorithmIds: [],
    relatedProblemIds: ["two-sum", "search-in-rotated-sorted-array"],
    takeaways: [
      "Each amount depends only on smaller amounts that have already been solved.",
      "The recurrence is `dp[amount] = min(dp[amount], dp[amount - coin] + 1)`.",
      "A sentinel larger than the target amount makes impossible states easy to detect."
    ],
    implementationVariants: [
      {
        title: "Bottom-up DP",
        summary: "Fill a table from amount zero up to the target amount.",
        whenToUse: "Most direct iterative solution with predictable O(amount * coinCount) time."
      },
      {
        title: "Top-down memoization",
        summary: "Recursively try coins while caching solved sub-amounts.",
        whenToUse: "Useful when you want the recurrence to read more directly from the problem statement."
      }
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "coinChange.ts",
        summary: "Bottom-up DP with an impossible sentinel of `amount + 1`.",
        code: String.raw`export function coinChange(coins: number[], amount: number): number {
  const dp = new Array<number>(amount + 1).fill(amount + 1)
  dp[0] = 0

  for (let current = 1; current <= amount; current += 1) {
    for (const coin of coins) {
      if (coin <= current) {
        dp[current] = Math.min(dp[current]!, dp[current - coin]! + 1)
      }
    }
  }

  return dp[amount]! > amount ? -1 : dp[amount]!
}`
      },
      {
        language: "python",
        label: "Python",
        filename: "coin_change.py",
        summary: "Iterative table fill from amount zero upward.",
        code: String.raw`def coin_change(coins: list[int], amount: int) -> int:
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0

    for current in range(1, amount + 1):
        for coin in coins:
            if coin <= current:
                dp[current] = min(dp[current], dp[current - coin] + 1)

    return -1 if dp[amount] > amount else dp[amount]`
      },
      {
        language: "java",
        label: "Java",
        filename: "CoinChange.java",
        summary: "Bottom-up DP minimizing the coin count for each intermediate amount.",
        code: String.raw`import java.util.Arrays;

public final class CoinChange {
  public static int solve(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);
    dp[0] = 0;

    for (int current = 1; current <= amount; current++) {
      for (int coin : coins) {
        if (coin <= current) {
          dp[current] = Math.min(dp[current], dp[current - coin] + 1);
        }
      }
    }

    return dp[amount] > amount ? -1 : dp[amount];
  }
}`
      },
      {
        language: "cpp",
        label: "C++",
        filename: "coin_change.cpp",
        summary: "Classic bottom-up DP over all amounts up to the target.",
        code: String.raw`#include <algorithm>
#include <vector>

int coin_change(const std::vector<int>& coins, int amount) {
  std::vector<int> dp(amount + 1, amount + 1);
  dp[0] = 0;

  for (int current = 1; current <= amount; ++current) {
    for (int coin : coins) {
      if (coin <= current) {
        dp[current] = std::min(dp[current], dp[current - coin] + 1);
      }
    }
  }

  return dp[amount] > amount ? -1 : dp[amount];
}`
      }
    ]
  }
]

const problemReferenceById = new Map(problemReferences.map((problem) => [problem.id, problem] as const))

export function getProblemReferenceById(problemId: string): ProblemReference | null {
  return problemReferenceById.get(problemId as ReferenceProblemId) ?? null
}

export function getRelatedProblemReferences(problemId: ReferenceProblemId): ProblemReference[] {
  const reference = getProblemReferenceById(problemId)

  if (!reference) {
    return []
  }

  return reference.relatedProblemIds
    .map((relatedProblemId) => getProblemReferenceById(relatedProblemId))
    .filter((problem): problem is ProblemReference => problem !== null)
}

export function getProblemReferencesForAlgorithm(
  algorithmId: ReferenceAlgorithmId
): ProblemReference[] {
  return problemReferences.filter((problem) => problem.primaryAlgorithmIds.includes(algorithmId))
}

export function getProblemReferencesByPatternGroup(
  patternGroup: ProblemPatternGroup
): ProblemReference[] {
  return problemReferences.filter((problem) => problem.patternGroup === patternGroup)
}
