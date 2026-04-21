import {
  createTraceEnvelope,
  createTraceRecorder,
  type JsonObject,
  type TraceEnvelope,
  type TraceMetricDefinition
} from "@tracedeck/trace-core";

export type SortingAlgorithmId =
  | "bubble-sort"
  | "insertion-sort"
  | "selection-sort"
  | "quick-sort"
  | "merge-sort"
  | "heap-sort";

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
  "insertion-sort": {
    id: "insertion-sort",
    label: "Insertion Sort",
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
  },
  "heap-sort": {
    id: "heap-sort",
    label: "Heap Sort",
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

function buildInsertionSortTrace(numbers: number[]): TraceEnvelope<SortingExecutionState> {
  const definition = sortingAlgorithmDefinitions["insertion-sort"];
  const values = numbers.slice();
  const recorder = createSortingRecorder(definition.id);
  const metrics: SortingMetricState = {
    comparisons: 0,
    writes: 0
  };

  recorder.push({
    phase: "Initialization",
    description:
      "Replay begins from the seeded array snapshot so each later insertion step can be restored without re-running the prefix scan.",
    explanation: {
      summary: "Capture the input array before the insertion frontier starts moving.",
      details:
        "Insertion sort grows an ordered prefix one comparison at a time, but the replay still restores each frame directly from the recorded state.",
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

  for (let boundary = 1; boundary < values.length; boundary += 1) {
    let current = boundary;

    while (current > 0) {
      const leftIndex = current - 1;
      const rightIndex = current;
      const leftValue = values[leftIndex]!;
      const rightValue = values[rightIndex]!;
      const requiresSwap = leftValue > rightValue;

      metrics.comparisons += 1;

      recorder.push({
        phase: "Compare",
        description: requiresSwap
          ? `Value ${rightValue} must move left past ${leftValue}, so the replay records the inversion before swapping the adjacent pair.`
          : `Value ${leftValue} is already less than or equal to ${rightValue}, so the current insertion frontier can stop shifting left.`,
        explanation: {
          summary: "Compare the active adjacent pair inside the insertion frontier.",
          details: requiresSwap
            ? "This adjacent swap variant keeps the candidate value visible in the array while it walks left through the ordered prefix."
            : "Once the pair is ordered, insertion sort knows the candidate has reached its deterministic resting place for this prefix.",
          tags: ["comparison", requiresSwap ? "mutation" : "focus"]
        },
        runtimeState: {
          array: values,
          activeIndices: [leftIndex, rightIndex],
          swapPair: [],
          sortedIndices: []
        },
        metrics,
        highlights: [
          {
            key: `insertion-compare-${boundary}-${current}`,
            path: "state.activeIndices",
            kind: "range",
            intent: requiresSwap ? "candidate" : "focus",
            label: `Inspect lanes ${leftIndex} and ${rightIndex}`,
            metadata: {
              start: leftIndex,
              end: rightIndex
            }
          }
        ]
      });

      if (!requiresSwap) {
        break;
      }

      [values[leftIndex], values[rightIndex]] = [rightValue, leftValue];
      metrics.writes += 2;

      recorder.push({
        phase: "Swap",
        description:
          "The replay records the adjacent swap immediately so the candidate's leftward movement never depends on replaying earlier compares.",
        explanation: {
          summary: "Swap the inverted pair so the insertion candidate shifts one lane left.",
          details:
            "Adjacent swaps keep the runtime state serialization-safe because the candidate value always stays inside the visible array snapshot.",
          tags: ["mutation", "swap"]
        },
        runtimeState: {
          array: values,
          activeIndices: [leftIndex, rightIndex],
          swapPair: [leftIndex, rightIndex],
          sortedIndices: []
        },
        metrics,
        highlights: [
          {
            key: `insertion-swap-${boundary}-${current}`,
            path: "state.swapPair",
            kind: "range",
            intent: "mutation",
            label: `Shift candidate through lanes ${leftIndex} and ${rightIndex}`,
            metadata: {
              start: leftIndex,
              end: rightIndex
            }
          }
        ]
      });

      current -= 1;
    }
  }

  const allSorted = createInclusiveRange(0, values.length - 1);

  recorder.push({
    phase: "Done",
    description:
      "The ordered array is recorded as the terminal snapshot so comparison views can line up insertion sort with the other shared sorting traces.",
    explanation: {
      summary: "Publish the final sorted snapshot and terminal insertion-sort metrics.",
      details:
        "Insertion sort's metric profile emphasizes how many adjacent fixes were needed to keep the growing prefix ordered.",
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
        key: "insertion-final-state",
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

function buildHeapSortTrace(numbers: number[]): TraceEnvelope<SortingExecutionState> {
  const definition = sortingAlgorithmDefinitions["heap-sort"];
  const values = numbers.slice();
  const recorder = createSortingRecorder(definition.id);
  const metrics: SortingMetricState = {
    comparisons: 0,
    writes: 0
  };

  const sortedSuffix = (heapSize: number) => createInclusiveRange(heapSize, values.length - 1);

  recorder.push({
    phase: "Initialization",
    description:
      "Heap sort begins from the seeded array snapshot so the max-heap build and extracted suffix can be replayed without reconstructing the heap in the browser.",
    explanation: {
      summary: "Capture the input array before heapify starts.",
      details:
        "The runtime will first build a max-heap in place, then repeatedly swap the root into the sorted suffix.",
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
        key: "heap-sort-seed-array",
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

  const siftDown = (rootIndex: number, heapSize: number, phasePrefix: string) => {
    let root = rootIndex;

    while (true) {
      const leftChild = root * 2 + 1;

      if (leftChild >= heapSize) {
        return;
      }

      const rightChild = leftChild + 1;
      let candidate = leftChild;

      if (rightChild < heapSize) {
        metrics.comparisons += 1;
        const rightBeatsLeft = values[rightChild]! > values[leftChild]!;

        recorder.push({
          phase: `${phasePrefix} Compare Children`,
          description: rightBeatsLeft
            ? `Right child lane ${rightChild} overtakes left child lane ${leftChild} as the stronger heap candidate.`
            : `Left child lane ${leftChild} stays ahead of right child lane ${rightChild} inside the heap.`,
          explanation: {
            summary: "Compare both children before deciding which branch can challenge the heap root.",
            details: rightBeatsLeft
              ? "The larger child becomes the only branch that can force the next sift-down swap."
              : "The left child already dominates, so the right branch cannot force the next swap.",
            tags: ["comparison", rightBeatsLeft ? "candidate" : "focus"]
          },
          runtimeState: {
            array: values,
            activeIndices: [root, leftChild, rightChild],
            swapPair: [],
            sortedIndices: sortedSuffix(heapSize)
          },
          metrics,
          highlights: [
            {
              key: `heap-sort-children-${phasePrefix}-${root}-${heapSize}`,
              path: "state.activeIndices",
              kind: "range",
              intent: rightBeatsLeft ? "candidate" : "focus",
              label: `Compare children ${leftChild} and ${rightChild}`,
              metadata: {
                root,
                leftChild,
                rightChild
              }
            }
          ]
        });

        if (rightBeatsLeft) {
          candidate = rightChild;
        }
      }

      metrics.comparisons += 1;
      const childBeatsRoot = values[candidate]! > values[root]!;

      recorder.push({
        phase: `${phasePrefix} Compare Root`,
        description: childBeatsRoot
          ? `Child lane ${candidate} exceeds root lane ${root}, so heap sort schedules a sift-down swap.`
          : `Root lane ${root} already dominates child lane ${candidate}, so this heap branch is stable.`,
        explanation: {
          summary: "Compare the strongest child against the current root.",
          details: childBeatsRoot
            ? "The heap invariant is broken at this branch, so the larger child must rise toward the root."
            : "Once the root beats its strongest child, the current subtree is a valid max-heap.",
          tags: ["comparison", childBeatsRoot ? "mutation" : "focus"]
        },
        runtimeState: {
          array: values,
          activeIndices: [root, candidate],
          swapPair: [],
          sortedIndices: sortedSuffix(heapSize)
        },
        metrics,
        highlights: [
          {
            key: `heap-sort-root-${phasePrefix}-${root}-${candidate}-${heapSize}`,
            path: "state.activeIndices",
            kind: "range",
            intent: childBeatsRoot ? "candidate" : "focus",
            label: `Inspect root ${root} against child ${candidate}`,
            metadata: {
              root,
              candidate
            }
          }
        ]
      });

      if (!childBeatsRoot) {
        return;
      }

      [values[root], values[candidate]] = [values[candidate]!, values[root]!];
      metrics.writes += 2;

      recorder.push({
        phase: `${phasePrefix} Swap`,
        description:
          "Record the sift-down swap immediately so replay can reopen the heap mutation without re-running earlier comparisons.",
        explanation: {
          summary: "Swap the root with the stronger child to restore the max-heap invariant.",
          details:
            "Heap sort reuses the main array as heap storage, so every sift-down mutation stays serialization-safe.",
          tags: ["mutation", "heapify"]
        },
        runtimeState: {
          array: values,
          activeIndices: [root, candidate],
          swapPair: [root, candidate],
          sortedIndices: sortedSuffix(heapSize)
        },
        metrics,
        highlights: [
          {
            key: `heap-sort-swap-${phasePrefix}-${root}-${candidate}-${heapSize}`,
            path: "state.swapPair",
            kind: "range",
            intent: "mutation",
            label: `Swapped lanes ${root} and ${candidate}`,
            metadata: {
              start: root,
              end: candidate
            }
          }
        ]
      });

      root = candidate;
    }
  };

  for (let start = Math.floor(values.length / 2) - 1; start >= 0; start -= 1) {
    recorder.push({
      phase: "Heapify Seed",
      description: `Start heapifying subtree rooted at lane ${start}.`,
      explanation: {
        summary: "Pick the next internal node and sift it down into heap order.",
        details:
          "Heap build runs from the last parent back to the root so every sift-down sees child subtrees that are already heap-ordered.",
        tags: ["heapify", "focus"]
      },
      runtimeState: {
        array: values,
        activeIndices: [start],
        swapPair: [],
        sortedIndices: []
      },
      metrics,
      highlights: [
        {
          key: `heap-sort-heapify-seed-${start}`,
          path: "state.activeIndices",
          kind: "index",
          intent: "focus",
          label: `Heapify root ${start}`
        }
      ]
    });

    siftDown(start, values.length, "Heapify");
  }

  for (let heapSize = values.length; heapSize > 1; heapSize -= 1) {
    const lastHeapIndex = heapSize - 1;

    recorder.push({
      phase: "Extract Root",
      description: `Swap the heap root into lane ${lastHeapIndex} to extend the sorted suffix.`,
      explanation: {
        summary: "Move the current maximum value out of the heap and into its final lane.",
        details:
          "The max-heap root is globally largest inside the remaining heap, so the swap seals one more suffix lane immediately.",
        tags: ["mutation", "sorted"]
      },
      runtimeState: {
        array: values,
        activeIndices: [0, lastHeapIndex],
        swapPair: [],
        sortedIndices: sortedSuffix(heapSize)
      },
      metrics,
      highlights: [
        {
          key: `heap-sort-extract-${heapSize}`,
          path: "state.activeIndices",
          kind: "range",
          intent: "candidate",
          label: `Root 0 trades with lane ${lastHeapIndex}`,
          metadata: {
            start: 0,
            end: lastHeapIndex
          }
        }
      ]
    });

    [values[0], values[lastHeapIndex]] = [values[lastHeapIndex]!, values[0]!];
    metrics.writes += 2;

    recorder.push({
      phase: "Swap Into Suffix",
      description: `Lane ${lastHeapIndex} is now fixed in the sorted suffix after the root swap.`,
      explanation: {
        summary: "Commit the extracted maximum into its final suffix lane.",
        details:
          "Replay records the suffix extension immediately so the sorted region can be restored without replaying heap operations.",
        tags: ["mutation", "sorted"]
      },
      runtimeState: {
        array: values,
        activeIndices: [0, lastHeapIndex],
        swapPair: [0, lastHeapIndex],
        sortedIndices: sortedSuffix(heapSize - 1)
      },
      metrics,
      highlights: [
        {
          key: `heap-sort-suffix-swap-${heapSize}`,
          path: "state.swapPair",
          kind: "range",
          intent: "mutation",
          label: `Moved max into lane ${lastHeapIndex}`,
          metadata: {
            start: 0,
            end: lastHeapIndex
          }
        }
      ]
    });

    siftDown(0, lastHeapIndex, "Sift Down");
  }

  const allSorted = createInclusiveRange(0, values.length - 1);

  recorder.push({
    phase: "Done",
    description:
      "Heap construction and suffix extraction are complete, so the array is ready for replay inspection and comparison against the other shared sorting traces.",
    explanation: {
      summary: "Publish the final sorted snapshot and terminal heap-sort metrics.",
      details:
        "The comparison deck can now contrast heapify-driven extraction work against adjacent-swap, selection, partition, and merge-oriented sorting traces.",
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
        key: "heap-sort-final-state",
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
    case "insertion-sort":
      return buildInsertionSortTrace(numbers);
    case "selection-sort":
      return buildSelectionSortTrace(numbers);
    case "quick-sort":
      return buildQuickSortTrace(numbers);
    case "merge-sort":
      return buildMergeSortTrace(numbers);
    case "heap-sort":
      return buildHeapSortTrace(numbers);
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
