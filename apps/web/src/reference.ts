import { algorithms, type ReplayAlgorithm } from "./replay.js"

export type ReferenceAlgorithmId = ReplayAlgorithm["id"]
export type ReferenceLanguageId = "typescript" | "python" | "java" | "cpp"

export type ComplexityProfile = {
  best: string
  average: string
  worst: string
  space: string
  note: string
}

export type ReferenceReasoningStep = {
  title: string
  detail: string
}

export type ReferenceImplementation = {
  language: ReferenceLanguageId
  label: string
  filename: string
  summary: string
  code: string
}

export type AlgorithmReference = {
  algorithm: ReplayAlgorithm
  coreIdea: string
  whyItWorks: string[]
  complexity: ComplexityProfile
  useCases: string[]
  interviewPrompts: string[]
  reasoningSteps: ReferenceReasoningStep[]
  watchouts: string[]
  implementations: ReferenceImplementation[]
}

type AlgorithmReferenceBlueprint = Omit<AlgorithmReference, "algorithm">

export const referenceLanguageOrder: Array<{
  id: ReferenceLanguageId
  label: string
}> = [
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" }
]

const blueprintByAlgorithmId: Record<ReferenceAlgorithmId, AlgorithmReferenceBlueprint> = {
  "bubble-sort": {
    coreIdea:
      "Bubble Sort walks the array in passes and swaps inverted adjacent pairs so the largest unsorted value settles at the right edge after each pass.",
    whyItWorks: [
      "Each full pass pushes the maximum remaining value into its final position.",
      "The sorted suffix grows from right to left, so later passes can stop earlier.",
      "An early-exit flag lets the algorithm terminate once a pass makes no swaps."
    ],
    complexity: {
      best: "O(n)",
      average: "O(n²)",
      worst: "O(n²)",
      space: "O(1)",
      note: "The early-exit optimization helps nearly sorted inputs, but quadratic behavior still dominates most larger workloads."
    },
    useCases: [
      "Teaching loop invariants, stability, and local mutations in an approachable way.",
      "Visual playback when you want every swap to be obvious to the user.",
      "Very small or nearly sorted collections where simplicity matters more than throughput."
    ],
    interviewPrompts: [
      "Explain why Bubble Sort is stable and how the no-swap optimization changes best-case complexity.",
      "Describe the invariant after each outer pass and how you would prove it.",
      "Compare Bubble Sort with Selection Sort when swap count matters more than comparisons."
    ],
    reasoningSteps: [
      {
        title: "Scan an unsorted prefix",
        detail: "Start at the left edge of the unsorted region and compare adjacent values."
      },
      {
        title: "Swap local inversions",
        detail: "Whenever the left value is larger, swap the pair so the larger item moves right."
      },
      {
        title: "Lock the pass boundary",
        detail: "After the pass ends, the largest remaining value is fixed at the boundary."
      },
      {
        title: "Exit early when stable",
        detail: "If a full pass makes no swaps, the remaining prefix is already sorted."
      }
    ],
    watchouts: [
      "Do not run the inner loop across the already sorted suffix.",
      "Missing the swap flag turns the best case back into O(n²).",
      "Bubble Sort is easy to explain but rarely the right production choice for large arrays."
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "bubbleSort.ts",
        summary: "In-place sort with a shrinking boundary and an early-exit flag.",
        code: String.raw`export function bubbleSort(values: number[]): number[] {
  const array = [...values]

  for (let boundary = array.length - 1; boundary > 0; boundary -= 1) {
    let swapped = false

    for (let index = 0; index < boundary; index += 1) {
      if (array[index]! > array[index + 1]!) {
        ;[array[index], array[index + 1]] = [array[index + 1]!, array[index]!]
        swapped = true
      }
    }

    if (!swapped) {
      break
    }
  }

  return array
}`
      },
      {
        language: "python",
        label: "Python",
        filename: "bubble_sort.py",
        summary: "Copies the input, then stops as soon as a pass performs no swaps.",
        code: String.raw`def bubble_sort(values: list[int]) -> list[int]:
    array = values[:]

    for boundary in range(len(array) - 1, 0, -1):
        swapped = False

        for index in range(boundary):
            if array[index] > array[index + 1]:
                array[index], array[index + 1] = array[index + 1], array[index]
                swapped = True

        if not swapped:
            break

    return array`
      },
      {
        language: "java",
        label: "Java",
        filename: "BubbleSort.java",
        summary: "Classic iterative implementation that preserves stable ordering for equal values.",
        code: String.raw`import java.util.Arrays;

public final class BubbleSort {
  public static int[] sort(int[] values) {
    int[] array = Arrays.copyOf(values, values.length);

    for (int boundary = array.length - 1; boundary > 0; boundary--) {
      boolean swapped = false;

      for (int index = 0; index < boundary; index++) {
        if (array[index] > array[index + 1]) {
          int temp = array[index];
          array[index] = array[index + 1];
          array[index + 1] = temp;
          swapped = true;
        }
      }

      if (!swapped) {
        break;
      }
    }

    return array;
  }
}`
      },
      {
        language: "cpp",
        label: "C++",
        filename: "bubble_sort.cpp",
        summary: "Vector-based version with the same shrinking-pass structure.",
        code: String.raw`#include <utility>
#include <vector>

std::vector<int> bubble_sort(const std::vector<int>& values) {
  std::vector<int> array = values;

  for (int boundary = static_cast<int>(array.size()) - 1; boundary > 0; --boundary) {
    bool swapped = false;

    for (int index = 0; index < boundary; ++index) {
      if (array[index] > array[index + 1]) {
        std::swap(array[index], array[index + 1]);
        swapped = true;
      }
    }

    if (!swapped) {
      break;
    }
  }

  return array;
}`
      }
    ]
  },
  "selection-sort": {
    coreIdea:
      "Selection Sort repeatedly selects the minimum value from the unsorted suffix and swaps it into the next fixed slot on the left.",
    whyItWorks: [
      "After each pass, the prefix contains the globally smallest values in sorted order.",
      "Only one swap is needed per pass, which can be attractive when writes are expensive.",
      "The scan cost stays high because every pass still inspects the full unsorted suffix."
    ],
    complexity: {
      best: "O(n²)",
      average: "O(n²)",
      worst: "O(n²)",
      space: "O(1)",
      note: "Selection Sort keeps swap volume low, but it never gains the best-case speedup that Bubble Sort can achieve."
    },
    useCases: [
      "Teaching the tradeoff between comparison count and write count.",
      "Environments where writes are costlier than reads, such as limited-write media.",
      "Small datasets where implementation simplicity and deterministic pass structure matter."
    ],
    interviewPrompts: [
      "Why does Selection Sort perform the same number of comparisons even on sorted input?",
      "How would you make Selection Sort stable, and what cost would that add?",
      "Compare Selection Sort with Bubble Sort when memory writes are constrained."
    ],
    reasoningSteps: [
      {
        title: "Fix the next prefix slot",
        detail: "Choose the leftmost unsorted index as the slot that will receive the next minimum."
      },
      {
        title: "Scan for the minimum",
        detail: "Walk the remaining suffix and remember the index of the smallest value seen."
      },
      {
        title: "Swap once",
        detail: "Exchange the minimum with the prefix slot so the sorted prefix grows by one."
      },
      {
        title: "Repeat on the suffix",
        detail: "Continue until only one value remains unsorted."
      }
    ],
    watchouts: [
      "The standard version is not stable because swapping can reorder equal values.",
      "Avoid swapping when the minimum is already in place.",
      "Selection Sort does not adapt to nearly sorted data."
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "selectionSort.ts",
        summary: "Tracks the minimum index for each pass, then swaps once.",
        code: String.raw`export function selectionSort(values: number[]): number[] {
  const array = [...values]

  for (let index = 0; index < array.length - 1; index += 1) {
    let minimumIndex = index

    for (let probe = index + 1; probe < array.length; probe += 1) {
      if (array[probe]! < array[minimumIndex]!) {
        minimumIndex = probe
      }
    }

    if (minimumIndex !== index) {
      ;[array[index], array[minimumIndex]] = [array[minimumIndex]!, array[index]!]
    }
  }

  return array
}`
      },
      {
        language: "python",
        label: "Python",
        filename: "selection_sort.py",
        summary: "One scan finds the minimum and one swap places it.",
        code: String.raw`def selection_sort(values: list[int]) -> list[int]:
    array = values[:]

    for index in range(len(array) - 1):
        minimum_index = index

        for probe in range(index + 1, len(array)):
            if array[probe] < array[minimum_index]:
                minimum_index = probe

        if minimum_index != index:
            array[index], array[minimum_index] = array[minimum_index], array[index]

    return array`
      },
      {
        language: "java",
        label: "Java",
        filename: "SelectionSort.java",
        summary: "The minimum index is updated during the scan, then swapped into the prefix.",
        code: String.raw`import java.util.Arrays;

public final class SelectionSort {
  public static int[] sort(int[] values) {
    int[] array = Arrays.copyOf(values, values.length);

    for (int index = 0; index < array.length - 1; index++) {
      int minimumIndex = index;

      for (int probe = index + 1; probe < array.length; probe++) {
        if (array[probe] < array[minimumIndex]) {
          minimumIndex = probe;
        }
      }

      if (minimumIndex != index) {
        int temp = array[index];
        array[index] = array[minimumIndex];
        array[minimumIndex] = temp;
      }
    }

    return array;
  }
}`
      },
      {
        language: "cpp",
        label: "C++",
        filename: "selection_sort.cpp",
        summary: "Minimal in-place implementation with explicit minimum tracking.",
        code: String.raw`#include <algorithm>
#include <vector>

std::vector<int> selection_sort(const std::vector<int>& values) {
  std::vector<int> array = values;

  for (int index = 0; index < static_cast<int>(array.size()) - 1; ++index) {
    int minimum_index = index;

    for (int probe = index + 1; probe < static_cast<int>(array.size()); ++probe) {
      if (array[probe] < array[minimum_index]) {
        minimum_index = probe;
      }
    }

    if (minimum_index != index) {
      std::swap(array[index], array[minimum_index]);
    }
  }

  return array;
}`
      }
    ]
  },
  "quick-sort": {
    coreIdea:
      "Quick Sort picks a pivot, partitions the array into values on either side of that pivot, then recursively sorts the partitions.",
    whyItWorks: [
      "Partitioning places the pivot in its final sorted position before the recursive calls begin.",
      "The left partition contains only smaller values and the right partition contains only larger or equal values.",
      "Balanced pivots produce shallow recursion and the familiar O(n log n) average behavior."
    ],
    complexity: {
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n²)",
      space: "O(log n)",
      note: "Quick Sort is usually fast in practice, but bad pivot choices can collapse the recursion into quadratic behavior."
    },
    useCases: [
      "General-purpose in-memory sorting when average-case speed matters and recursion is acceptable.",
      "Interview problems that test partition reasoning and divide-and-conquer invariants.",
      "Replay experiences where pivot locks and boundary scans make the algorithm behavior legible."
    ],
    interviewPrompts: [
      "Explain the partition invariant and why the pivot can be considered finished afterward.",
      "How do randomized or median-of-three pivots reduce the chance of worst-case partitions?",
      "Why is Quick Sort typically not stable in its in-place form?"
    ],
    reasoningSteps: [
      {
        title: "Choose a pivot",
        detail: "Select a value that will split the current range into left and right partitions."
      },
      {
        title: "Partition in place",
        detail: "Move smaller values left of the pivot boundary and larger values to the right."
      },
      {
        title: "Lock the pivot",
        detail: "Swap the pivot into its final position once the scan finishes."
      },
      {
        title: "Recurse on both sides",
        detail: "Sort the left and right partitions independently until ranges collapse."
      }
    ],
    watchouts: [
      "Worst-case recursion depth appears when pivots repeatedly split poorly.",
      "Partition code is easy to get off by one, especially around equal values.",
      "In-place Quick Sort is not stable."
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "quickSort.ts",
        summary: "Lomuto-style partitioning with recursive range sorting.",
        code: String.raw`export function quickSort(values: number[]): number[] {
  const array = [...values]

  function partition(low: number, high: number): number {
    const pivot = array[high]!
    let storeIndex = low

    for (let index = low; index < high; index += 1) {
      if (array[index]! < pivot) {
        ;[array[index], array[storeIndex]] = [array[storeIndex]!, array[index]!]
        storeIndex += 1
      }
    }

    ;[array[storeIndex], array[high]] = [array[high]!, array[storeIndex]!]
    return storeIndex
  }

  function sortRange(low: number, high: number) {
    if (low >= high) {
      return
    }

    const pivotIndex = partition(low, high)
    sortRange(low, pivotIndex - 1)
    sortRange(pivotIndex + 1, high)
  }

  sortRange(0, array.length - 1)
  return array
}`
      },
      {
        language: "python",
        label: "Python",
        filename: "quick_sort.py",
        summary: "Recursive in-place sorting with an explicit partition helper.",
        code: String.raw`def quick_sort(values: list[int]) -> list[int]:
    array = values[:]

    def partition(low: int, high: int) -> int:
        pivot = array[high]
        store_index = low

        for index in range(low, high):
            if array[index] < pivot:
                array[index], array[store_index] = array[store_index], array[index]
                store_index += 1

        array[store_index], array[high] = array[high], array[store_index]
        return store_index

    def sort_range(low: int, high: int) -> None:
        if low >= high:
            return

        pivot_index = partition(low, high)
        sort_range(low, pivot_index - 1)
        sort_range(pivot_index + 1, high)

    sort_range(0, len(array) - 1)
    return array`
      },
      {
        language: "java",
        label: "Java",
        filename: "QuickSort.java",
        summary: "In-place recursive Quick Sort using the final element as the pivot.",
        code: String.raw`import java.util.Arrays;

public final class QuickSort {
  public static int[] sort(int[] values) {
    int[] array = Arrays.copyOf(values, values.length);
    sortRange(array, 0, array.length - 1);
    return array;
  }

  private static void sortRange(int[] array, int low, int high) {
    if (low >= high) {
      return;
    }

    int pivotIndex = partition(array, low, high);
    sortRange(array, low, pivotIndex - 1);
    sortRange(array, pivotIndex + 1, high);
  }

  private static int partition(int[] array, int low, int high) {
    int pivot = array[high];
    int storeIndex = low;

    for (int index = low; index < high; index++) {
      if (array[index] < pivot) {
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
        filename: "quick_sort.cpp",
        summary: "Partition-based recursion over a copied vector.",
        code: String.raw`#include <utility>
#include <vector>

int partition(std::vector<int>& array, int low, int high) {
  int pivot = array[high];
  int store_index = low;

  for (int index = low; index < high; ++index) {
    if (array[index] < pivot) {
      std::swap(array[index], array[store_index]);
      ++store_index;
    }
  }

  std::swap(array[store_index], array[high]);
  return store_index;
}

void quick_sort_range(std::vector<int>& array, int low, int high) {
  if (low >= high) {
    return;
  }

  int pivot_index = partition(array, low, high);
  quick_sort_range(array, low, pivot_index - 1);
  quick_sort_range(array, pivot_index + 1, high);
}

std::vector<int> quick_sort(const std::vector<int>& values) {
  std::vector<int> array = values;
  quick_sort_range(array, 0, static_cast<int>(array.size()) - 1);
  return array;
}`
      }
    ]
  },
  "merge-sort": {
    coreIdea:
      "Merge Sort recursively splits the array into smaller halves, sorts each half, then merges the sorted halves back together in order.",
    whyItWorks: [
      "Single-element arrays are already sorted, giving the recursion a clean base case.",
      "Merging two sorted halves produces a sorted whole while preserving stable ordering.",
      "The split depth stays logarithmic, so the total work becomes O(n log n)."
    ],
    complexity: {
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n log n)",
      space: "O(n)",
      note: "Merge Sort guarantees its runtime, but the extra buffer space is the tradeoff."
    },
    useCases: [
      "Stable sorting when predictable worst-case performance matters.",
      "Linked-list or external-sorting contexts where merge operations are natural.",
      "Teaching divide-and-conquer without the pivot-path pitfalls of Quick Sort."
    ],
    interviewPrompts: [
      "Why is Merge Sort stable while standard Quick Sort is not?",
      "How does the merge step preserve sorted order across both halves?",
      "When would you choose Merge Sort over Quick Sort despite the extra memory?"
    ],
    reasoningSteps: [
      {
        title: "Split the range",
        detail: "Cut the current array into left and right halves until single items remain."
      },
      {
        title: "Sort recursively",
        detail: "Each half is sorted independently before any merge begins."
      },
      {
        title: "Merge by front pointers",
        detail: "Compare the front items of both halves and emit the smaller one into a buffer."
      },
      {
        title: "Append leftovers",
        detail: "Once one side is exhausted, copy the remainder of the other side directly."
      }
    ],
    watchouts: [
      "The merge buffer increases memory usage to O(n).",
      "Be explicit about whether the function sorts in place or returns a new collection.",
      "Off-by-one mistakes often appear when splitting odd-length arrays."
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "mergeSort.ts",
        summary: "Returns a new sorted array and keeps equal values stable during merge.",
        code: String.raw`export function mergeSort(values: number[]): number[] {
  if (values.length <= 1) {
    return [...values]
  }

  const midpoint = Math.floor(values.length / 2)
  const left = mergeSort(values.slice(0, midpoint))
  const right = mergeSort(values.slice(midpoint))

  const merged: number[] = []
  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex]! <= right[rightIndex]!) {
      merged.push(left[leftIndex]!)
      leftIndex += 1
    } else {
      merged.push(right[rightIndex]!)
      rightIndex += 1
    }
  }

  return [...merged, ...left.slice(leftIndex), ...right.slice(rightIndex)]
}`
      },
      {
        language: "python",
        label: "Python",
        filename: "merge_sort.py",
        summary: "Pure functional style that builds and returns merged subarrays.",
        code: String.raw`def merge_sort(values: list[int]) -> list[int]:
    if len(values) <= 1:
        return values[:]

    midpoint = len(values) // 2
    left = merge_sort(values[:midpoint])
    right = merge_sort(values[midpoint:])

    merged: list[int] = []
    left_index = 0
    right_index = 0

    while left_index < len(left) and right_index < len(right):
        if left[left_index] <= right[right_index]:
            merged.append(left[left_index])
            left_index += 1
        else:
            merged.append(right[right_index])
            right_index += 1

    merged.extend(left[left_index:])
    merged.extend(right[right_index:])
    return merged`
      },
      {
        language: "java",
        label: "Java",
        filename: "MergeSort.java",
        summary: "Recursive split-and-merge implementation that returns a new array.",
        code: String.raw`import java.util.Arrays;

public final class MergeSort {
  public static int[] sort(int[] values) {
    if (values.length <= 1) {
      return Arrays.copyOf(values, values.length);
    }

    int midpoint = values.length / 2;
    int[] left = sort(Arrays.copyOfRange(values, 0, midpoint));
    int[] right = sort(Arrays.copyOfRange(values, midpoint, values.length));
    int[] merged = new int[values.length];

    int leftIndex = 0;
    int rightIndex = 0;
    int writeIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      if (left[leftIndex] <= right[rightIndex]) {
        merged[writeIndex++] = left[leftIndex++];
      } else {
        merged[writeIndex++] = right[rightIndex++];
      }
    }

    while (leftIndex < left.length) {
      merged[writeIndex++] = left[leftIndex++];
    }

    while (rightIndex < right.length) {
      merged[writeIndex++] = right[rightIndex++];
    }

    return merged;
  }
}`
      },
      {
        language: "cpp",
        label: "C++",
        filename: "merge_sort.cpp",
        summary: "Builds sorted halves recursively, then merges them into a fresh vector.",
        code: String.raw`#include <vector>

std::vector<int> merge_sort(const std::vector<int>& values) {
  if (values.size() <= 1) {
    return values;
  }

  std::size_t midpoint = values.size() / 2;
  std::vector<int> left(values.begin(), values.begin() + midpoint);
  std::vector<int> right(values.begin() + midpoint, values.end());

  left = merge_sort(left);
  right = merge_sort(right);

  std::vector<int> merged;
  merged.reserve(values.size());

  std::size_t left_index = 0;
  std::size_t right_index = 0;

  while (left_index < left.size() && right_index < right.size()) {
    if (left[left_index] <= right[right_index]) {
      merged.push_back(left[left_index++]);
    } else {
      merged.push_back(right[right_index++]);
    }
  }

  merged.insert(merged.end(), left.begin() + static_cast<long>(left_index), left.end());
  merged.insert(merged.end(), right.begin() + static_cast<long>(right_index), right.end());
  return merged;
}`
      }
    ]
  },
  bfs: {
    coreIdea:
      "Breadth-First Search explores graph nodes level by level with a queue, which guarantees the shortest path in an unweighted graph.",
    whyItWorks: [
      "The queue visits all nodes at distance d before any node at distance d + 1.",
      "The first time a node is discovered, BFS already knows the minimum hop count to reach it.",
      "Parent pointers let the algorithm reconstruct the route once the target is found."
    ],
    complexity: {
      best: "O(V + E)",
      average: "O(V + E)",
      worst: "O(V + E)",
      space: "O(V)",
      note: "Runtime grows with the size of the explored graph, not with path length alone."
    },
    useCases: [
      "Shortest-path search in unweighted graphs such as social hops or grid moves.",
      "Level-order traversal, connected-component discovery, and nearest-target problems.",
      "Replay views where queue order and discovered layers should stay visible."
    ],
    interviewPrompts: [
      "Why is BFS optimal for unweighted shortest paths but not for weighted graphs?",
      "Should nodes be marked visited when enqueued or when dequeued, and why?",
      "How do parent pointers turn a reachability walk into a path reconstruction algorithm?"
    ],
    reasoningSteps: [
      {
        title: "Seed the queue",
        detail: "Start with the source node at distance zero and mark it visited immediately."
      },
      {
        title: "Process by layers",
        detail: "Pop the oldest queued node so the traversal moves outward one hop at a time."
      },
      {
        title: "Record parent links",
        detail: "When a new neighbor is discovered, remember which node reached it."
      },
      {
        title: "Reconstruct the route",
        detail: "Walk backward from the target through parent pointers, then reverse the path."
      }
    ],
    watchouts: [
      "BFS only gives shortest paths when edge weights are uniform or irrelevant.",
      "Mark neighbors as visited when they are enqueued, not later, to avoid duplicate work.",
      "A missing adjacency list entry should be treated as an empty neighbor set."
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "bfsPath.ts",
        summary: "Queue-based shortest path for an adjacency-list graph.",
        code: String.raw`type Graph = Record<string, string[]>

export function bfsPath(graph: Graph, start: string, target: string): string[] {
  const queue: string[] = [start]
  const visited = new Set<string>([start])
  const parent = new Map<string, string | null>([[start, null]])

  while (queue.length > 0) {
    const node = queue.shift()!

    if (node === target) {
      break
    }

    for (const neighbor of graph[node] ?? []) {
      if (visited.has(neighbor)) {
        continue
      }

      visited.add(neighbor)
      parent.set(neighbor, node)
      queue.push(neighbor)
    }
  }

  if (!parent.has(target)) {
    return []
  }

  const path: string[] = []
  for (let cursor: string | null = target; cursor !== null; cursor = parent.get(cursor) ?? null) {
    path.push(cursor)
  }

  return path.reverse()
}`
      },
      {
        language: "python",
        label: "Python",
        filename: "bfs_path.py",
        summary: "Uses a deque for FIFO traversal and parent tracking.",
        code: String.raw`from collections import deque

def bfs_path(graph: dict[str, list[str]], start: str, target: str) -> list[str]:
    queue: deque[str] = deque([start])
    visited = {start}
    parent: dict[str, str | None] = {start: None}

    while queue:
        node = queue.popleft()

        if node == target:
            break

        for neighbor in graph.get(node, []):
            if neighbor in visited:
                continue

            visited.add(neighbor)
            parent[neighbor] = node
            queue.append(neighbor)

    if target not in parent:
        return []

    path: list[str] = []
    cursor: str | None = target
    while cursor is not None:
        path.append(cursor)
        cursor = parent[cursor]

    return list(reversed(path))`
      },
      {
        language: "java",
        label: "Java",
        filename: "BreadthFirstSearch.java",
        summary: "Map-backed BFS that reconstructs the discovered route.",
        code: String.raw`import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class BreadthFirstSearch {
  public static List<String> path(Map<String, List<String>> graph, String start, String target) {
    Deque<String> queue = new ArrayDeque<>();
    Set<String> visited = new HashSet<>();
    Map<String, String> parent = new HashMap<>();

    queue.add(start);
    visited.add(start);
    parent.put(start, null);

    while (!queue.isEmpty()) {
      String node = queue.removeFirst();

      if (node.equals(target)) {
        break;
      }

      for (String neighbor : graph.getOrDefault(node, List.of())) {
        if (visited.contains(neighbor)) {
          continue;
        }

        visited.add(neighbor);
        parent.put(neighbor, node);
        queue.addLast(neighbor);
      }
    }

    if (!parent.containsKey(target)) {
      return List.of();
    }

    List<String> path = new ArrayList<>();
    for (String cursor = target; cursor != null; cursor = parent.get(cursor)) {
      path.add(cursor);
    }

    Collections.reverse(path);
    return path;
  }
}`
      },
      {
        language: "cpp",
        label: "C++",
        filename: "breadth_first_search.cpp",
        summary: "Adjacency-list BFS with parent recovery for the final route.",
        code: String.raw`#include <algorithm>
#include <queue>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

std::vector<std::string> bfs_path(
    const std::unordered_map<std::string, std::vector<std::string>>& graph,
    const std::string& start,
    const std::string& target) {
  std::queue<std::string> queue;
  std::unordered_set<std::string> visited;
  std::unordered_map<std::string, std::string> parent;

  queue.push(start);
  visited.insert(start);
  parent[start] = "";

  while (!queue.empty()) {
    std::string node = queue.front();
    queue.pop();

    if (node == target) {
      break;
    }

    auto found = graph.find(node);
    if (found == graph.end()) {
      continue;
    }

    for (const auto& neighbor : found->second) {
      if (visited.contains(neighbor)) {
        continue;
      }

      visited.insert(neighbor);
      parent[neighbor] = node;
      queue.push(neighbor);
    }
  }

  if (!parent.contains(target)) {
    return {};
  }

  std::vector<std::string> path;
  for (std::string cursor = target; !cursor.empty(); cursor = parent[cursor]) {
    path.push_back(cursor);
  }

  std::reverse(path.begin(), path.end());
  return path;
}`
      }
    ]
  },
  dijkstra: {
    coreIdea:
      "Dijkstra's algorithm always expands the frontier node with the lowest known distance, which makes the first settled distance for each node final when all weights are non-negative.",
    whyItWorks: [
      "The min-priority frontier guarantees the next settled node cannot later receive a shorter route.",
      "Relaxation updates both the best-known distance and the parent pointer for improved routes.",
      "Route reconstruction works the same way as BFS once the best parents are known."
    ],
    complexity: {
      best: "O((V + E) log V)",
      average: "O((V + E) log V)",
      worst: "O((V + E) log V)",
      space: "O(V + E)",
      note: "The heap keeps the frontier efficient, but the algorithm still requires non-negative edge weights."
    },
    useCases: [
      "Shortest-path routing on weighted road, network, or dependency graphs.",
      "Replay scenarios where frontier churn and distance improvements must remain inspectable.",
      "Interview questions about greedy correctness, relaxation, and heap-backed graph traversal."
    ],
    interviewPrompts: [
      "Why do negative weights break Dijkstra's greedy choice?",
      "What does it mean for a node to become settled, and why is that distance final?",
      "How do stale heap entries arise, and how do you safely ignore them?"
    ],
    reasoningSteps: [
      {
        title: "Initialize distances",
        detail: "Start every node at infinity except the source, which begins at zero."
      },
      {
        title: "Pop the nearest frontier node",
        detail: "Take the node with the smallest current distance from the min-heap."
      },
      {
        title: "Relax outgoing edges",
        detail: "Update neighbor distances whenever the current route beats the known best route."
      },
      {
        title: "Rebuild the shortest path",
        detail: "Once the target is settled or the frontier is exhausted, follow parent links backward."
      }
    ],
    watchouts: [
      "Negative edge weights invalidate the settled-node guarantee.",
      "Heap implementations often accumulate stale entries, so compare popped distance with the current best before processing.",
      "The path is empty when the target remains unreachable."
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "dijkstra.ts",
        summary: "Heapless priority queue for clarity; ideal for reference reading and interviews.",
        code: String.raw`type WeightedEdge = { to: string; weight: number }
type WeightedGraph = Record<string, WeightedEdge[]>

export function dijkstraPath(
  graph: WeightedGraph,
  start: string,
  target: string
): { distance: number; path: string[] } {
  const distances = new Map<string, number>()
  const parent = new Map<string, string | null>()
  const frontier: Array<{ node: string; distance: number }> = [{ node: start, distance: 0 }]

  distances.set(start, 0)
  parent.set(start, null)

  while (frontier.length > 0) {
    frontier.sort((left, right) => left.distance - right.distance)
    const current = frontier.shift()!

    if (current.distance !== distances.get(current.node)) {
      continue
    }

    if (current.node === target) {
      break
    }

    for (const edge of graph[current.node] ?? []) {
      const nextDistance = current.distance + edge.weight

      if (nextDistance < (distances.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
        distances.set(edge.to, nextDistance)
        parent.set(edge.to, current.node)
        frontier.push({ node: edge.to, distance: nextDistance })
      }
    }
  }

  if (!distances.has(target)) {
    return { distance: Number.POSITIVE_INFINITY, path: [] }
  }

  const path: string[] = []
  for (let cursor: string | null = target; cursor !== null; cursor = parent.get(cursor) ?? null) {
    path.push(cursor)
  }

  return {
    distance: distances.get(target)!,
    path: path.reverse()
  }
}`
      },
      {
        language: "python",
        label: "Python",
        filename: "dijkstra.py",
        summary: "Priority-queue implementation with stale-entry checks.",
        code: String.raw`import heapq

def dijkstra_path(
    graph: dict[str, list[tuple[str, int]]], start: str, target: str
) -> tuple[float, list[str]]:
    heap: list[tuple[int, str]] = [(0, start)]
    distances: dict[str, int] = {start: 0}
    parent: dict[str, str | None] = {start: None}

    while heap:
        distance, node = heapq.heappop(heap)

        if distance != distances.get(node):
            continue

        if node == target:
            break

        for neighbor, weight in graph.get(node, []):
            next_distance = distance + weight

            if next_distance < distances.get(neighbor, float("inf")):
                distances[neighbor] = next_distance
                parent[neighbor] = node
                heapq.heappush(heap, (next_distance, neighbor))

    if target not in distances:
        return float("inf"), []

    path: list[str] = []
    cursor: str | None = target
    while cursor is not None:
        path.append(cursor)
        cursor = parent[cursor]

    return distances[target], list(reversed(path))`
      },
      {
        language: "java",
        label: "Java",
        filename: "Dijkstra.java",
        summary: "PriorityQueue-backed shortest-path search with parent reconstruction.",
        code: String.raw`import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;

public final class Dijkstra {
  public static final class Edge {
    public final String to;
    public final int weight;

    public Edge(String to, int weight) {
      this.to = to;
      this.weight = weight;
    }
  }

  private static final class State implements Comparable<State> {
    private final String node;
    private final int distance;

    private State(String node, int distance) {
      this.node = node;
      this.distance = distance;
    }

    @Override
    public int compareTo(State other) {
      return Integer.compare(distance, other.distance);
    }
  }

  public static List<String> path(Map<String, List<Edge>> graph, String start, String target) {
    PriorityQueue<State> heap = new PriorityQueue<>();
    Map<String, Integer> distances = new HashMap<>();
    Map<String, String> parent = new HashMap<>();

    heap.add(new State(start, 0));
    distances.put(start, 0);
    parent.put(start, null);

    while (!heap.isEmpty()) {
      State current = heap.remove();

      if (current.distance != distances.getOrDefault(current.node, Integer.MAX_VALUE)) {
        continue;
      }

      if (current.node.equals(target)) {
        break;
      }

      for (Edge edge : graph.getOrDefault(current.node, List.of())) {
        int nextDistance = current.distance + edge.weight;

        if (nextDistance < distances.getOrDefault(edge.to, Integer.MAX_VALUE)) {
          distances.put(edge.to, nextDistance);
          parent.put(edge.to, current.node);
          heap.add(new State(edge.to, nextDistance));
        }
      }
    }

    if (!distances.containsKey(target)) {
      return List.of();
    }

    List<String> path = new ArrayList<>();
    for (String cursor = target; cursor != null; cursor = parent.get(cursor)) {
      path.add(cursor);
    }

    Collections.reverse(path);
    return path;
  }
}`
      },
      {
        language: "cpp",
        label: "C++",
        filename: "dijkstra.cpp",
        summary: "Min-heap implementation using a priority queue and stale-entry guard.",
        code: String.raw`#include <algorithm>
#include <limits>
#include <queue>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

struct Edge {
  std::string to;
  int weight;
};

std::pair<int, std::vector<std::string>> dijkstra_path(
    const std::unordered_map<std::string, std::vector<Edge>>& graph,
    const std::string& start,
    const std::string& target) {
  using State = std::pair<int, std::string>;
  std::priority_queue<State, std::vector<State>, std::greater<State>> heap;
  std::unordered_map<std::string, int> distances;
  std::unordered_map<std::string, std::string> parent;

  heap.push({0, start});
  distances[start] = 0;
  parent[start] = "";

  while (!heap.empty()) {
    auto [distance, node] = heap.top();
    heap.pop();

    if (distance != distances[node]) {
      continue;
    }

    if (node == target) {
      break;
    }

    auto found = graph.find(node);
    if (found == graph.end()) {
      continue;
    }

    for (const auto& edge : found->second) {
      int next_distance = distance + edge.weight;
      auto current = distances.find(edge.to);

      if (current == distances.end() || next_distance < current->second) {
        distances[edge.to] = next_distance;
        parent[edge.to] = node;
        heap.push({next_distance, edge.to});
      }
    }
  }

  if (!distances.contains(target)) {
    return {std::numeric_limits<int>::max(), {}};
  }

  std::vector<std::string> path;
  for (std::string cursor = target; !cursor.empty(); cursor = parent[cursor]) {
    path.push_back(cursor);
  }

  std::reverse(path.begin(), path.end());
  return {distances[target], path};
}`
      }
    ]
  }
}

export const algorithmReferences: AlgorithmReference[] = algorithms.map((algorithm) => ({
  algorithm,
  ...blueprintByAlgorithmId[algorithm.id]
}))

const referenceByAlgorithmId = new Map(
  algorithmReferences.map((reference) => [reference.algorithm.id, reference] as const)
)

export function getAlgorithmReferenceById(algorithmId: string): AlgorithmReference | null {
  return referenceByAlgorithmId.get(algorithmId as ReferenceAlgorithmId) ?? null
}

export function getRelatedAlgorithmReferences(
  algorithmId: ReferenceAlgorithmId
): AlgorithmReference[] {
  const activeReference = getAlgorithmReferenceById(algorithmId)

  if (!activeReference) {
    return []
  }

  return algorithmReferences.filter(
    (reference) =>
      reference.algorithm.domain === activeReference.algorithm.domain &&
      reference.algorithm.id !== activeReference.algorithm.id
  )
}
