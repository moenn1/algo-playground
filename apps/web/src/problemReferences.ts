import {
  getAlgorithmReferenceById,
  type ReferenceAlgorithmId,
  type ReferenceImplementation
} from "./reference.js"
import { type AccentTone } from "./replay.js"

export type ReferenceProblemId =
  | "merge-intervals"
  | "kth-largest-element-in-an-array"
  | "shortest-path-in-binary-matrix"
  | "network-delay-time"

export type ProblemDifficulty = "Easy" | "Medium" | "Hard"

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
  patternTags: string[]
  primaryAlgorithmIds: ReferenceAlgorithmId[]
  relatedAlgorithmIds: ReferenceAlgorithmId[]
  relatedProblemIds: ReferenceProblemId[]
  takeaways: string[]
  implementationVariants: ProblemImplementationVariant[]
  implementations: ReferenceImplementation[]
}

export const problemReferences: ProblemReference[] = [
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    summary:
      "Sort intervals by start time, then sweep once to coalesce overlapping ranges into a canonical schedule.",
    problemStatement:
      "Given an array of intervals where each interval is a start and end pair, merge every overlapping interval and return the smallest equivalent set of disjoint ranges.",
    accent: "ember",
    patternTags: ["sorting", "interval sweep", "canonicalization"],
    primaryAlgorithmIds: ["merge-sort"],
    relatedAlgorithmIds: ["merge-sort", "quick-sort"],
    relatedProblemIds: ["kth-largest-element-in-an-array"],
    takeaways: [
      "Sorting converts a pairwise overlap problem into a single forward scan.",
      "You only need to compare each interval against the last merged output range.",
      "The correctness hinge is that sorted starts guarantee any future overlap must hit the current tail range first."
    ],
    implementationVariants: [
      {
        title: "Sort and sweep",
        summary: "Sort by start value, then either extend the last merged interval or append a new one.",
        whenToUse: "Default choice for unsorted input and interview settings."
      },
      {
        title: "In-place compaction",
        summary: "Reuse the sorted array as the output buffer to reduce extra allocations.",
        whenToUse: "Useful when memory pressure matters and input mutation is acceptable."
      }
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "mergeIntervals.ts",
        summary: "Sorts a copied interval list, then collapses overlaps into one output array.",
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
        summary: "ArrayList-based solution after sorting by interval start.",
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
        summary: "Uses `std::sort` and appends or extends the merged tail range.",
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
      "Use partitioning or a heap to avoid fully sorting the array when you only need one ranked element.",
    problemStatement:
      "Given an unsorted integer array and an integer k, return the kth largest element in the array without assuming the data is unique.",
    accent: "teal",
    patternTags: ["partition", "quickselect", "heap"],
    primaryAlgorithmIds: ["quick-sort"],
    relatedAlgorithmIds: ["quick-sort", "selection-sort"],
    relatedProblemIds: ["merge-intervals"],
    takeaways: [
      "Quickselect keeps the useful half of the array and discards the rest after each partition.",
      "A fixed-size min-heap gives predictable O(n log k) behavior when worst-case Quickselect is undesirable.",
      "The rank transform is usually `targetIndex = length - k` when working in ascending order."
    ],
    implementationVariants: [
      {
        title: "Quickselect",
        summary: "Partition the array until the pivot lands on the target rank.",
        whenToUse: "Best average-case choice when in-place mutation is acceptable."
      },
      {
        title: "Min-heap of size k",
        summary: "Maintain only the k largest values seen so far.",
        whenToUse: "Good when you want stable upper bounds or the stream is processed incrementally."
      }
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "kthLargestQuickselect.ts",
        summary: "In-place Quickselect using the last element as a pivot.",
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
        filename: "kth_largest_quickselect.py",
        summary: "Iterative Quickselect over a copied array.",
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
        filename: "KthLargestQuickselect.java",
        summary: "Iterative partition search with ascending-rank target conversion.",
        code: String.raw`import java.util.Arrays;

public final class KthLargestQuickselect {
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
        filename: "kth_largest_quickselect.cpp",
        summary: "Quickselect over a copied vector with iterative bounds narrowing.",
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
    id: "shortest-path-in-binary-matrix",
    title: "Shortest Path in Binary Matrix",
    difficulty: "Medium",
    summary:
      "Treat each open cell as a graph node and run breadth-first search over eight directions to find the fewest moves from the top-left to the bottom-right corner.",
    problemStatement:
      "Given an n x n binary matrix where `0` means open and `1` means blocked, return the length of the shortest clear path from the top-left cell to the bottom-right cell when moves in eight directions are allowed.",
    accent: "gold",
    patternTags: ["bfs", "grid graph", "shortest path"],
    primaryAlgorithmIds: ["bfs"],
    relatedAlgorithmIds: ["bfs", "dijkstra"],
    relatedProblemIds: ["network-delay-time"],
    takeaways: [
      "Uniform edge cost means BFS gives the shortest path length immediately.",
      "Mark cells visited as soon as they are enqueued so the same cell never enters the queue twice.",
      "The queue naturally expands the frontier by path length, which is exactly the value the problem asks for."
    ],
    implementationVariants: [
      {
        title: "Eight-direction BFS",
        summary: "Use a queue of cells paired with their path length and explore all valid neighbors.",
        whenToUse: "Default solution when each move has equal cost."
      },
      {
        title: "Layered BFS",
        summary: "Count levels outside the queue entries and process one layer at a time.",
        whenToUse: "Good when you want cleaner distance accounting without storing path length per node."
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
      const key = \`\${nextRow},\${nextColumn}\`

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
        summary: "Straightforward deque-driven BFS for a grid graph.",
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
        summary: "ArrayDeque-based BFS with encoded grid states.",
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
        summary: "Breadth-first traversal with eight directions and a visited grid.",
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
      "Run Dijkstra from the source node and take the maximum settled shortest-path distance across all reachable nodes.",
    problemStatement:
      "Given directed travel times between nodes, a node count, and a source node, compute how long it takes for the signal to reach every node or return `-1` if any node is unreachable.",
    accent: "teal",
    patternTags: ["dijkstra", "weighted graph", "shortest path"],
    primaryAlgorithmIds: ["dijkstra"],
    relatedAlgorithmIds: ["dijkstra", "bfs"],
    relatedProblemIds: ["shortest-path-in-binary-matrix"],
    takeaways: [
      "The answer is not the target distance to one node; it is the maximum shortest-path distance across the entire graph.",
      "A min-heap keeps the next frontier expansion aligned with Dijkstra's greedy invariant.",
      "Unreached nodes after the heap drains mean the graph is disconnected from the source."
    ],
    implementationVariants: [
      {
        title: "Adjacency list plus min-heap",
        summary: "Classic Dijkstra with heap-based frontier updates.",
        whenToUse: "Best default choice for sparse weighted graphs with non-negative edges."
      },
      {
        title: "Dense-graph scan",
        summary: "Replace the heap with repeated scans for the nearest unsettled node.",
        whenToUse: "Reasonable when the graph is dense and code simplicity matters more than asymptotic optimality."
      }
    ],
    implementations: [
      {
        language: "typescript",
        label: "TypeScript",
        filename: "networkDelayTime.ts",
        summary: "Priority-queue logic via sorted frontier array for readability.",
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
        summary: "Heapq-backed Dijkstra over a directed adjacency list.",
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
        summary: "PriorityQueue-based shortest-path propagation across all nodes.",
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
        summary: "Priority-queue Dijkstra that returns the farthest settled distance.",
        code: String.raw`#include <limits>
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

export function getPrimaryAlgorithmAccent(
  algorithmIds: ReferenceAlgorithmId[]
): AccentTone {
  return getAlgorithmReferenceById(algorithmIds[0] ?? "")?.algorithm.accent ?? "gold"
}
