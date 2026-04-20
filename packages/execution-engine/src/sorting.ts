import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type SortingAlgorithmId =
  | "bubble-sort"
  | "selection-sort"
  | "quick-sort"
  | "merge-sort";

export interface SortingExecutionState extends JsonObject {
  array: number[];
  activeIndices: number[];
  swapPair: number[];
  sortedIndices: number[];
}

export interface SortingMetricState {
  comparisons: number;
  writes: number;
}

export interface SortingAlgorithmDefinition {
  id: SortingAlgorithmId;
  label: string;
  implementationVersion: string;
}

const sortingAlgorithmDefinitions: Record<SortingAlgorithmId, SortingAlgorithmDefinition> = {
  "bubble-sort": {
    id: "bubble-sort",
    label: "Bubble Sort",
    implementationVersion: "sorting-engine-0.1.0"
  },
  "selection-sort": {
    id: "selection-sort",
    label: "Selection Sort",
    implementationVersion: "sorting-engine-0.1.0"
  },
  "quick-sort": {
    id: "quick-sort",
    label: "Quick Sort",
    implementationVersion: "sorting-engine-0.1.0"
  },
  "merge-sort": {
    id: "merge-sort",
    label: "Merge Sort",
    implementationVersion: "sorting-engine-0.1.0"
  }
};

export const sortingMetricDefinitions: TraceMetricDefinition[] = [
  {
    key: "comparisons",
    label: "Comparisons",
    unit: "count",
    direction: "lower-is-better"
  },
  {
    key: "writes",
    label: "Writes",
    unit: "count",
    direction: "lower-is-better"
  }
];

function cloneState(state: SortingExecutionState): SortingExecutionState {
  return {
    array: state.array.slice(),
    activeIndices: state.activeIndices.slice(),
    swapPair: state.swapPair.slice(),
    sortedIndices: state.sortedIndices.slice()
  };
}

function createSortingRecorder(algorithmId: SortingAlgorithmId) {
  return createTraceRecorder<SortingExecutionState, SortingExecutionState, SortingMetricState>({
    algorithmId,
    projectState: cloneState,
    projectMetrics(metrics) {
      return {
        comparisons: metrics.comparisons,
        writes: metrics.writes
      };
    }
  });
}

function toSortedUniqueIndices(indices: number[]): number[] {
  return Array.from(new Set(indices)).sort((left, right) => left - right);
}

function createInclusiveRange(start: number, end: number): number[] {
  if (start > end) {
    return [];
  }

  return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
}

function buildSortingEnvelope(
  definition: SortingAlgorithmDefinition,
  input: number[],
  recorder: ReturnType<typeof createSortingRecorder>
): TraceEnvelope<SortingExecutionState> {
  return createTraceEnvelope({
    algorithm: {
      id: definition.id,
      label: definition.label,
      domain: "sorting",
      implementationVersion: definition.implementationVersion
    },
    input,
    steps: recorder.getSteps(),
    metricDefinitions: sortingMetricDefinitions,
    comparisonMetricKeys: ["comparisons", "writes"]
  });
}

function buildBubbleSortTrace(numbers: number[]): TraceEnvelope<SortingExecutionState> {
  const definition = sortingAlgorithmDefinitions["bubble-sort"];
  const values = numbers.slice();
  const recorder = createSortingRecorder(definition.id);
  const metrics: SortingMetricState = {
    comparisons: 0,
    writes: 0
  };

  recorder.push({
    phase: "Initialization",
    description:
      "Replay begins from the seeded array snapshot. Every timeline jump restores directly from the recorded frame payload.",
    explanation: {
      summary: "Capture the input array as the first deterministic checkpoint.",
      details: "The replay shell restores this frame without re-running the algorithm.",
      tags: ["snapshot", "input"]
    },
    runtimeState: {
      array: values,
      activeIndices: [],
      swapPair: [],
      sortedIndices: []
    },
    metrics,
    highlights: [
      {
        key: "seed-array",
        path: "state.array",
        kind: "range",
        intent: "focus",
        label: "Loaded seed array",
        metadata: {
          start: 0,
          end: values.length - 1
        }
      }
    ]
  });

  for (let boundary = values.length - 1; boundary > 0; boundary -= 1) {
    let swappedThisPass = false;
    const sortedSuffix = createInclusiveRange(boundary + 1, values.length - 1);

    for (let index = 0; index < boundary; index += 1) {
      metrics.comparisons += 1;
      const activeIndices = [index, index + 1];
      const leftValue = values[index]!;
      const rightValue = values[index + 1]!;
      const requiresSwap = leftValue > rightValue;

      recorder.push({
        phase: "Compare",
        description: requiresSwap
          ? `Values ${leftValue} and ${rightValue} are out of order, so the shell schedules a swap.`
          : `Values ${leftValue} and ${rightValue} are already ordered, so replay advances without mutating the array.`,
        explanation: {
          summary: "Inspect the current adjacent pair before deciding whether to swap.",
          details: requiresSwap
            ? "Bubble sort bubbles the larger value rightward when the pair is inverted."
            : "The pair is already ordered, so the next frame can move forward without changing the array.",
          tags: ["comparison", requiresSwap ? "mutation" : "focus"]
        },
        runtimeState: {
          array: values,
          activeIndices,
          swapPair: [],
          sortedIndices: sortedSuffix
        },
        metrics,
        highlights: [
          {
            key: `bubble-window-${index}`,
            path: "state.activeIndices",
            kind: "range",
            intent: requiresSwap ? "candidate" : "focus",
            label: `Inspect lanes ${index} and ${index + 1}`,
            metadata: {
              start: index,
              end: index + 1
            }
          }
        ]
      });

      if (requiresSwap) {
        [values[index], values[index + 1]] = [rightValue, leftValue];
        metrics.writes += 2;
        swappedThisPass = true;

        recorder.push({
          phase: "Swap",
          description:
            "The post-swap snapshot is recorded immediately so scrubbing to this frame never depends on incremental playback.",
          explanation: {
            summary: "Record the mutated array immediately after the swap.",
            details:
              "Because the full snapshot is stored here, the scrubber can jump to this mutation without replaying earlier compares.",
            tags: ["mutation", "snapshot"]
          },
          runtimeState: {
            array: values,
            activeIndices,
            swapPair: activeIndices,
            sortedIndices: sortedSuffix
          },
          metrics,
          highlights: [
            {
              key: `bubble-swap-${index}`,
              path: "state.swapPair",
              kind: "range",
              intent: "mutation",
              label: `Swapped lanes ${index} and ${index + 1}`,
              metadata: {
                start: index,
                end: index + 1
              }
            }
          ]
        });
      }
    }

    const lockedSuffix = createInclusiveRange(boundary, values.length - 1);

    recorder.push({
      phase: "Checkpoint",
      description: `Pass ${values.length - boundary} seals lane ${boundary}. Timeline jumps can land here without replaying earlier comparisons.`,
      explanation: {
        summary: "Lock the newest sorted suffix into a replay checkpoint.",
        details:
          "Bubble sort guarantees the rightmost unsorted lane is final at the end of each completed pass.",
        tags: ["checkpoint", "sorted"]
      },
      runtimeState: {
        array: values,
        activeIndices: [boundary],
        swapPair: [],
        sortedIndices: lockedSuffix
      },
      metrics,
      highlights: [
        {
          key: `bubble-checkpoint-${boundary}`,
          path: "state.sortedIndices",
          kind: "range",
          intent: "sorted",
          label: `Locked suffix through lane ${boundary}`,
          metadata: {
            start: boundary,
            end: values.length - 1
          }
        }
      ]
    });

    if (!swappedThisPass) {
      const allSorted = createInclusiveRange(0, values.length - 1);

      recorder.push({
        phase: "Optimization",
        description:
          "No swaps occurred in the latest pass, so the shell exits early with the array already sorted.",
        explanation: {
          summary: "End early because the latest pass discovered no inversions.",
          details: "Bubble sort can stop once a full pass completes without any swaps.",
          tags: ["optimization", "sorted"]
        },
        runtimeState: {
          array: values,
          activeIndices: [],
          swapPair: [],
          sortedIndices: allSorted
        },
        metrics,
        highlights: [
          {
            key: "bubble-optimized-finish",
            path: "state.sortedIndices",
            kind: "collection",
            intent: "result",
            label: "Marked the full array as sorted"
          }
        ]
      });
      break;
    }
  }

  const allSorted = createInclusiveRange(0, values.length - 1);

  recorder.push({
    phase: "Done",
    description:
      "The final checkpoint marks the array as fully sorted and ready for comparison or saved-run handoff.",
    explanation: {
      summary: "Publish the terminal sorted snapshot and final metrics.",
      details: "Comparison surfaces can now read the final step directly from the trace envelope.",
      tags: ["result", "metrics"]
    },
    runtimeState: {
      array: values,
      activeIndices: [],
      swapPair: [],
      sortedIndices: allSorted
    },
    metrics,
    highlights: [
      {
        key: "bubble-final-state",
        path: "state.array",
        kind: "collection",
        intent: "result",
        label: "Final sorted order"
      }
    ]
  });

  return buildSortingEnvelope(definition, numbers, recorder);
}

function buildSelectionSortTrace(numbers: number[]): TraceEnvelope<SortingExecutionState> {
  const definition = sortingAlgorithmDefinitions["selection-sort"];
  const values = numbers.slice();
  const recorder = createSortingRecorder(definition.id);
  const metrics: SortingMetricState = {
    comparisons: 0,
    writes: 0
  };

  recorder.push({
    phase: "Initialization",
    description:
      "Selection sort starts from the full unsorted array with the first lane acting as the initial anchor.",
    explanation: {
      summary: "Capture the seed array before the first anchor begins scanning for a smaller value.",
      details:
        "Each pass will scan the unsorted suffix, then place the best candidate into the anchor lane.",
      tags: ["snapshot", "input"]
    },
    runtimeState: {
      array: values,
      activeIndices: [0],
      swapPair: [],
      sortedIndices: []
    },
    metrics,
    highlights: [
      {
        key: "selection-anchor-start",
        path: "state.activeIndices",
        kind: "index",
        intent: "focus",
        label: "Anchor lane 0"
      }
    ]
  });

  for (let anchor = 0; anchor < values.length - 1; anchor += 1) {
    let minimumIndex = anchor;
    const sortedIndices = createInclusiveRange(0, anchor - 1);

    recorder.push({
      phase: "Anchor",
      description: `Pass ${anchor + 1} anchors lane ${anchor} and scans the remaining suffix for the minimum value.`,
      explanation: {
        summary: "Pin the anchor lane before scanning the remaining suffix.",
        details:
          "Selection sort keeps the smallest seen value as the current minimum candidate for this pass.",
        tags: ["anchor", "focus"]
      },
      runtimeState: {
        array: values,
        activeIndices: [anchor],
        swapPair: [],
        sortedIndices
      },
      metrics,
      highlights: [
        {
          key: `selection-anchor-${anchor}`,
          path: "state.activeIndices",
          kind: "index",
          intent: "focus",
          label: `Anchor lane ${anchor}`
        }
      ]
    });

    for (let scan = anchor + 1; scan < values.length; scan += 1) {
      metrics.comparisons += 1;
      const previousMinimumIndex = minimumIndex;
      const scanValue = values[scan]!;
      const minimumValue = values[minimumIndex]!;
      const foundNewMinimum = scanValue < minimumValue;

      if (foundNewMinimum) {
        minimumIndex = scan;
      }

      recorder.push({
        phase: foundNewMinimum ? "Promote Minimum" : "Scan Candidate",
        description: foundNewMinimum
          ? `Lane ${scan} becomes the new minimum candidate for anchor ${anchor}.`
          : `Lane ${scan} stays behind the current minimum candidate at lane ${minimumIndex}.`,
        explanation: {
          summary: foundNewMinimum
            ? "Promote the scanned lane to the current minimum candidate."
            : "Keep the existing minimum candidate and continue scanning.",
          details: foundNewMinimum
            ? `The candidate at lane ${scan} is smaller than lane ${previousMinimumIndex}, so the pass pivots to the new minimum.`
            : "Selection sort still records the comparison so the comparison deck can show the broader scan cost.",
          tags: ["comparison", foundNewMinimum ? "candidate" : "focus"]
        },
        runtimeState: {
          array: values,
          activeIndices: toSortedUniqueIndices([anchor, minimumIndex, scan]),
          swapPair: [],
          sortedIndices
        },
        metrics,
        highlights: [
          {
            key: `selection-window-${anchor}-${scan}`,
            path: "state.activeIndices",
            kind: "range",
            intent: foundNewMinimum ? "candidate" : "focus",
            label: foundNewMinimum ? `Lane ${scan} is the new minimum` : `Scanned lane ${scan}`,
            metadata: {
              anchor,
              minimumIndex,
              scan
            }
          }
        ]
      });
    }

    if (minimumIndex !== anchor) {
      const anchorValue = values[anchor]!;
      const minimumValue = values[minimumIndex]!;

      [values[anchor], values[minimumIndex]] = [minimumValue, anchorValue];
      metrics.writes += 2;

      recorder.push({
        phase: "Swap Into Place",
        description: `Selection sort commits the minimum value into lane ${anchor}, then seals the pass.`,
        explanation: {
          summary: "Place the minimum candidate into the anchor lane.",
          details: "Selection sort trades fewer writes for wider scans across the unsorted suffix.",
          tags: ["mutation", "anchor"]
        },
        runtimeState: {
          array: values,
          activeIndices: [anchor, minimumIndex],
          swapPair: [anchor, minimumIndex],
          sortedIndices
        },
        metrics,
        highlights: [
          {
            key: `selection-swap-${anchor}`,
            path: "state.swapPair",
            kind: "range",
            intent: "mutation",
            label: `Moved minimum into lane ${anchor}`,
            metadata: {
              start: anchor,
              end: minimumIndex
            }
          }
        ]
      });
    }

    const lockedPrefix = createInclusiveRange(0, anchor);

    recorder.push({
      phase: "Checkpoint",
      description: `Pass ${anchor + 1} seals the prefix through lane ${anchor}.`,
      explanation: {
        summary: "Seal the sorted prefix after the selected minimum is committed.",
        details:
          "Everything to the left of the next anchor is now final and can be restored directly from this frame.",
        tags: ["checkpoint", "sorted"]
      },
      runtimeState: {
        array: values,
        activeIndices: [anchor],
        swapPair: [],
        sortedIndices: lockedPrefix
      },
      metrics,
      highlights: [
        {
          key: `selection-checkpoint-${anchor}`,
          path: "state.sortedIndices",
          kind: "range",
          intent: "sorted",
          label: `Locked prefix through lane ${anchor}`,
          metadata: {
            start: 0,
            end: anchor
          }
        }
      ]
    });
  }

  const allSorted = createInclusiveRange(0, values.length - 1);

  recorder.push({
    phase: "Done",
    description:
      "The full array has been sealed into deterministic checkpoints, ready for side-by-side comparison.",
    explanation: {
      summary: "Publish the final sorted order and terminal selection-sort metrics.",
      details:
        "Comparison surfaces can now contrast the broader scan work against the relatively small write count.",
      tags: ["result", "metrics"]
    },
    runtimeState: {
      array: values,
      activeIndices: [],
      swapPair: [],
      sortedIndices: allSorted
    },
    metrics,
    highlights: [
      {
        key: "selection-final-state",
        path: "state.array",
        kind: "collection",
        intent: "result",
        label: "Final sorted order"
      }
    ]
  });

  return buildSortingEnvelope(definition, numbers, recorder);
}

function buildQuickSortTrace(numbers: number[]): TraceEnvelope<SortingExecutionState> {
  const definition = sortingAlgorithmDefinitions["quick-sort"];
  const values = numbers.slice();
  const recorder = createSortingRecorder(definition.id);
  const metrics: SortingMetricState = {
    comparisons: 0,
    writes: 0
  };
  const sortedIndices = new Set<number>();

  const sortedSnapshot = () => toSortedUniqueIndices(Array.from(sortedIndices));

  const markSingleIndex = (index: number) => {
    if (sortedIndices.has(index)) {
      return;
    }

    sortedIndices.add(index);
    recorder.push({
      phase: "Base Case",
      description: `Lane ${index} is the only value in its active partition, so it is already final.`,
      explanation: {
        summary: "Seal the single-lane partition without further partitioning.",
        details: "A one-element partition is already in its final position.",
        tags: ["checkpoint", "sorted"]
      },
      runtimeState: {
        array: values,
        activeIndices: [index],
        swapPair: [],
        sortedIndices: sortedSnapshot()
      },
      metrics,
      highlights: [
        {
          key: `quick-base-${index}`,
          path: "state.sortedIndices",
          kind: "index",
          intent: "sorted",
          label: `Lane ${index} is final`
        }
      ]
    });
  };

  const partition = (start: number, end: number): number => {
    const pivotIndex = end;
    const pivotValue = values[pivotIndex]!;
    let boundary = start;

    recorder.push({
      phase: "Partition",
      description: `Partition lanes ${start} through ${end} around pivot value ${pivotValue}.`,
      explanation: {
        summary: "Choose the rightmost value as the deterministic partition pivot.",
        details:
          "Every value smaller than or equal to the pivot will move left of the partition boundary.",
        tags: ["pivot", "focus"]
      },
      runtimeState: {
        array: values,
        activeIndices: [start, pivotIndex],
        swapPair: [],
        sortedIndices: sortedSnapshot()
      },
      metrics,
      highlights: [
        {
          key: `quick-partition-${start}-${end}`,
          path: "state.activeIndices",
          kind: "range",
          intent: "focus",
          label: `Active partition ${start}-${end}`,
          metadata: {
            start,
            end,
            pivotIndex
          }
        }
      ]
    });

    for (let scan = start; scan < end; scan += 1) {
      metrics.comparisons += 1;
      const candidateValue = values[scan]!;
      const movesLeft = candidateValue <= pivotValue;

      recorder.push({
        phase: movesLeft ? "Accept Left" : "Scan Right",
        description: movesLeft
          ? `Lane ${scan} stays in the left partition because ${candidateValue} does not exceed pivot ${pivotValue}.`
          : `Lane ${scan} remains to the right of the pivot because ${candidateValue} exceeds ${pivotValue}.`,
        explanation: {
          summary: movesLeft
            ? "Keep the scanned value in the left partition."
            : "Leave the scanned value to the right of the pivot boundary.",
          details: movesLeft
            ? `The partition boundary will advance after lane ${scan} is accepted.`
            : `The pivot boundary stays at lane ${boundary} until a smaller value appears.`,
          tags: ["comparison", movesLeft ? "candidate" : "focus"]
        },
        runtimeState: {
          array: values,
          activeIndices: toSortedUniqueIndices([boundary, scan, pivotIndex]),
          swapPair: [],
          sortedIndices: sortedSnapshot()
        },
        metrics,
        highlights: [
          {
            key: `quick-scan-${start}-${end}-${scan}`,
            path: "state.activeIndices",
            kind: "range",
            intent: movesLeft ? "candidate" : "focus",
            label: `Boundary ${boundary}, scan ${scan}, pivot ${pivotIndex}`,
            metadata: {
              boundary,
              scan,
              pivotIndex
            }
          }
        ]
      });

      if (!movesLeft) {
        continue;
      }

      if (boundary !== scan) {
        const boundaryValue = values[boundary]!;
        values[boundary] = values[scan]!;
        values[scan] = boundaryValue;
        metrics.writes += 2;

        recorder.push({
          phase: "Swap",
          description: `Move lane ${scan} into the left partition by swapping it with lane ${boundary}.`,
          explanation: {
            summary: "Commit the newly accepted value into the left partition.",
            details:
              "This swap stores the partition mutation as a full snapshot so replay never depends on re-running the partition.",
            tags: ["mutation", "snapshot"]
          },
          runtimeState: {
            array: values,
            activeIndices: [boundary, scan, pivotIndex],
            swapPair: [boundary, scan],
            sortedIndices: sortedSnapshot()
          },
          metrics,
          highlights: [
            {
              key: `quick-swap-${start}-${end}-${scan}`,
              path: "state.swapPair",
              kind: "range",
              intent: "mutation",
              label: `Swapped lanes ${boundary} and ${scan}`,
              metadata: {
                start: boundary,
                end: scan
              }
            }
          ]
        });
      }

      boundary += 1;
    }

    if (boundary !== pivotIndex) {
      const boundaryValue = values[boundary]!;
      values[boundary] = values[pivotIndex]!;
      values[pivotIndex] = boundaryValue;
      metrics.writes += 2;
    }

    sortedIndices.add(boundary);

    recorder.push({
      phase: "Pivot Commit",
      description: `Pivot value ${pivotValue} locks into final lane ${boundary}.`,
      explanation: {
        summary: "Commit the pivot to its final partition boundary.",
        details:
          "Everything left of the pivot is less than or equal to it, and everything to the right is greater.",
        tags: ["pivot", "sorted"]
      },
      runtimeState: {
        array: values,
        activeIndices: [boundary],
        swapPair: boundary === pivotIndex ? [boundary] : [boundary, pivotIndex],
        sortedIndices: sortedSnapshot()
      },
      metrics,
      highlights: [
        {
          key: `quick-pivot-${start}-${end}`,
          path: "state.sortedIndices",
          kind: "index",
          intent: "sorted",
          label: `Pivot fixed at lane ${boundary}`
        }
      ]
    });

    return boundary;
  };

  const quickSort = (start: number, end: number) => {
    if (start > end) {
      return;
    }

    if (start === end) {
      markSingleIndex(start);
      return;
    }

    const pivotIndex = partition(start, end);
    quickSort(start, pivotIndex - 1);
    quickSort(pivotIndex + 1, end);
  };

  recorder.push({
    phase: "Initialization",
    description:
      "Quick sort begins from the full unsorted array and records every partition as a replay checkpoint.",
    explanation: {
      summary: "Capture the input array before the first pivot partition begins.",
      details: "Every recursive partition will emit full snapshots instead of relying on replay-time recursion.",
      tags: ["snapshot", "input"]
    },
    runtimeState: {
      array: values,
      activeIndices: values.length > 0 ? [0, values.length - 1] : [],
      swapPair: [],
      sortedIndices: []
    },
    metrics,
    highlights: [
      {
        key: "quick-seed-array",
        path: "state.array",
        kind: "range",
        intent: "focus",
        label: "Loaded seed array",
        metadata: {
          start: 0,
          end: values.length - 1
        }
      }
    ]
  });

  quickSort(0, values.length - 1);

  const allSorted = createInclusiveRange(0, values.length - 1);

  recorder.push({
    phase: "Done",
    description:
      "Every partition has resolved, so the array is ready for replay inspection and cross-algorithm comparison.",
    explanation: {
      summary: "Publish the final sorted snapshot and terminal quick-sort metrics.",
      details: "The replay shell can now contrast quick sort's partition work against the other sorting engines.",
      tags: ["result", "metrics"]
    },
    runtimeState: {
      array: values,
      activeIndices: [],
      swapPair: [],
      sortedIndices: allSorted
    },
    metrics,
    highlights: [
      {
        key: "quick-final-state",
        path: "state.array",
        kind: "collection",
        intent: "result",
        label: "Final sorted order"
      }
    ]
  });

  return buildSortingEnvelope(definition, numbers, recorder);
}

function buildMergeSortTrace(numbers: number[]): TraceEnvelope<SortingExecutionState> {
  const definition = sortingAlgorithmDefinitions["merge-sort"];
  const values = numbers.slice();
  const recorder = createSortingRecorder(definition.id);
  const metrics: SortingMetricState = {
    comparisons: 0,
    writes: 0
  };

  const merge = (start: number, middle: number, end: number) => {
    const leftValues = values.slice(start, middle);
    const rightValues = values.slice(middle, end);
    let leftIndex = 0;
    let rightIndex = 0;
    let writeIndex = start;

    recorder.push({
      phase: "Merge Window",
      description: `Merge the sorted windows ${start}-${middle - 1} and ${middle}-${end - 1}.`,
      explanation: {
        summary: "Open a deterministic merge window over the two sorted halves.",
        details:
          "The merge writes directly back into the primary array so each committed lane is replay-safe immediately.",
        tags: ["merge", "focus"]
      },
      runtimeState: {
        array: values,
        activeIndices: [start, middle - 1, end - 1],
        swapPair: [],
        sortedIndices: []
      },
      metrics,
      highlights: [
        {
          key: `merge-window-${start}-${end}`,
          path: "state.activeIndices",
          kind: "range",
          intent: "focus",
          label: `Merge window ${start}-${end - 1}`,
          metadata: {
            start,
            middle,
            end: end - 1
          }
        }
      ]
    });

    while (leftIndex < leftValues.length && rightIndex < rightValues.length) {
      const sourceLeftIndex = start + leftIndex;
      const sourceRightIndex = middle + rightIndex;
      const leftValue = leftValues[leftIndex]!;
      const rightValue = rightValues[rightIndex]!;
      const takeLeft = leftValue <= rightValue;

      metrics.comparisons += 1;

      recorder.push({
        phase: "Compare Halves",
        description: takeLeft
          ? `Lane ${sourceLeftIndex} wins the merge comparison against lane ${sourceRightIndex}.`
          : `Lane ${sourceRightIndex} wins the merge comparison against lane ${sourceLeftIndex}.`,
        explanation: {
          summary: "Compare the current heads of the left and right merge buffers.",
          details: takeLeft
            ? `${leftValue} stays ahead of ${rightValue}, so the next write comes from the left buffer.`
            : `${rightValue} is smaller than ${leftValue}, so the next write comes from the right buffer.`,
          tags: ["comparison", takeLeft ? "candidate" : "focus"]
        },
        runtimeState: {
          array: values,
          activeIndices: toSortedUniqueIndices([sourceLeftIndex, sourceRightIndex, writeIndex]),
          swapPair: [],
          sortedIndices: []
        },
        metrics,
        highlights: [
          {
            key: `merge-compare-${start}-${end}-${writeIndex}`,
            path: "state.activeIndices",
            kind: "range",
            intent: takeLeft ? "candidate" : "focus",
            label: `Compare lanes ${sourceLeftIndex} and ${sourceRightIndex}`,
            metadata: {
              sourceLeftIndex,
              sourceRightIndex,
              writeIndex
            }
          }
        ]
      });

      values[writeIndex] = takeLeft ? leftValue : rightValue;
      metrics.writes += 1;

      recorder.push({
        phase: "Write Merge",
        description: `Write the next merged value into lane ${writeIndex}.`,
        explanation: {
          summary: "Commit the next merged value into the primary array.",
          details:
            "Each write is recorded as its own snapshot so replay can land on intermediate merge states safely.",
          tags: ["merge", "mutation"]
        },
        runtimeState: {
          array: values,
          activeIndices: [writeIndex],
          swapPair: [writeIndex],
          sortedIndices: []
        },
        metrics,
        highlights: [
          {
            key: `merge-write-${start}-${end}-${writeIndex}`,
            path: "state.swapPair",
            kind: "index",
            intent: "mutation",
            label: `Committed lane ${writeIndex}`
          }
        ]
      });

      if (takeLeft) {
        leftIndex += 1;
      } else {
        rightIndex += 1;
      }

      writeIndex += 1;
    }

    while (leftIndex < leftValues.length) {
      values[writeIndex] = leftValues[leftIndex]!;
      metrics.writes += 1;

      recorder.push({
        phase: "Drain Left",
        description: `Drain the remaining left-buffer value into lane ${writeIndex}.`,
        explanation: {
          summary: "Copy the remaining left half into the merge window.",
          details: "No comparison is required because the right buffer is already exhausted.",
          tags: ["merge", "mutation"]
        },
        runtimeState: {
          array: values,
          activeIndices: [writeIndex],
          swapPair: [writeIndex],
          sortedIndices: []
        },
        metrics,
        highlights: [
          {
            key: `merge-drain-left-${start}-${end}-${writeIndex}`,
            path: "state.swapPair",
            kind: "index",
            intent: "mutation",
            label: `Copied into lane ${writeIndex}`
          }
        ]
      });

      leftIndex += 1;
      writeIndex += 1;
    }

    while (rightIndex < rightValues.length) {
      values[writeIndex] = rightValues[rightIndex]!;
      metrics.writes += 1;

      recorder.push({
        phase: "Drain Right",
        description: `Drain the remaining right-buffer value into lane ${writeIndex}.`,
        explanation: {
          summary: "Copy the remaining right half into the merge window.",
          details: "No comparison is required because the left buffer is already exhausted.",
          tags: ["merge", "mutation"]
        },
        runtimeState: {
          array: values,
          activeIndices: [writeIndex],
          swapPair: [writeIndex],
          sortedIndices: []
        },
        metrics,
        highlights: [
          {
            key: `merge-drain-right-${start}-${end}-${writeIndex}`,
            path: "state.swapPair",
            kind: "index",
            intent: "mutation",
            label: `Copied into lane ${writeIndex}`
          }
        ]
      });

      rightIndex += 1;
      writeIndex += 1;
    }

    recorder.push({
      phase: "Merge Commit",
      description: `The merged window ${start}-${end - 1} is now internally ordered and ready for its parent merge.`,
      explanation: {
        summary: "Seal the merged window as the next replay checkpoint.",
        details:
          "The merge result is stable for the current recursion level even though larger windows may still reorder around it.",
        tags: ["merge", "checkpoint"]
      },
      runtimeState: {
        array: values,
        activeIndices: createInclusiveRange(start, end - 1),
        swapPair: [],
        sortedIndices: []
      },
      metrics,
      highlights: [
        {
          key: `merge-commit-${start}-${end}`,
          path: "state.activeIndices",
          kind: "range",
          intent: "focus",
          label: `Merged window ${start}-${end - 1}`,
          metadata: {
            start,
            end: end - 1
          }
        }
      ]
    });
  };

  const mergeSort = (start: number, end: number) => {
    if (end - start <= 1) {
      return;
    }

    const middle = Math.floor((start + end) / 2);

    recorder.push({
      phase: "Split",
      description: `Split window ${start}-${end - 1} into ${start}-${middle - 1} and ${middle}-${end - 1}.`,
      explanation: {
        summary: "Divide the active window before recursively sorting each half.",
        details:
          "Merge sort defers mutation until the merge step, so this frame records the structural recursion boundary only.",
        tags: ["split", "focus"]
      },
      runtimeState: {
        array: values,
        activeIndices: [start, middle - 1, middle, end - 1],
        swapPair: [],
        sortedIndices: []
      },
      metrics,
      highlights: [
        {
          key: `merge-split-${start}-${end}`,
          path: "state.activeIndices",
          kind: "range",
          intent: "focus",
          label: `Split window ${start}-${end - 1}`,
          metadata: {
            start,
            middle,
            end: end - 1
          }
        }
      ]
    });

    mergeSort(start, middle);
    mergeSort(middle, end);
    merge(start, middle, end);
  };

  recorder.push({
    phase: "Initialization",
    description:
      "Merge sort begins from the full unsorted array and records every split and merge as deterministic checkpoints.",
    explanation: {
      summary: "Capture the input array before recursive splitting begins.",
      details: "Replay restores the full array from snapshots instead of re-running the recursive call tree.",
      tags: ["snapshot", "input"]
    },
    runtimeState: {
      array: values,
      activeIndices: values.length > 0 ? [0, values.length - 1] : [],
      swapPair: [],
      sortedIndices: []
    },
    metrics,
    highlights: [
      {
        key: "merge-seed-array",
        path: "state.array",
        kind: "range",
        intent: "focus",
        label: "Loaded seed array",
        metadata: {
          start: 0,
          end: values.length - 1
        }
      }
    ]
  });

  mergeSort(0, values.length);

  const allSorted = createInclusiveRange(0, values.length - 1);

  recorder.push({
    phase: "Done",
    description:
      "The final merged window covers the full array, so the deterministic replay can publish the terminal sorted order.",
    explanation: {
      summary: "Publish the final sorted snapshot and terminal merge-sort metrics.",
      details:
        "The comparison deck can now contrast merge sort's write-heavy merges against the other sorting traces.",
      tags: ["result", "metrics"]
    },
    runtimeState: {
      array: values,
      activeIndices: [],
      swapPair: [],
      sortedIndices: allSorted
    },
    metrics,
    highlights: [
      {
        key: "merge-final-state",
        path: "state.array",
        kind: "collection",
        intent: "result",
        label: "Final sorted order"
      }
    ]
  });

  return buildSortingEnvelope(definition, numbers, recorder);
}

export function buildSortingTrace(
  algorithmId: SortingAlgorithmId,
  numbers: number[]
): TraceEnvelope<SortingExecutionState> {
  switch (algorithmId) {
    case "bubble-sort":
      return buildBubbleSortTrace(numbers);
    case "selection-sort":
      return buildSelectionSortTrace(numbers);
    case "quick-sort":
      return buildQuickSortTrace(numbers);
    case "merge-sort":
      return buildMergeSortTrace(numbers);
  }
}

export function getSortingAlgorithmDefinition(
  algorithmId: SortingAlgorithmId
): SortingAlgorithmDefinition {
  return {
    ...sortingAlgorithmDefinitions[algorithmId]
  };
}

export const sortingAlgorithmIds = Object.freeze(
  Object.keys(sortingAlgorithmDefinitions) as SortingAlgorithmId[]
);
