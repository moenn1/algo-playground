import { useEffect, useState } from "react";

import {
  algorithms,
  buildRun,
  formatDistance,
  getAlgorithmById,
  type GraphRun,
  type ReplayRun,
  type SortingRun
} from "./replay.js";

type FoundationResponse = {
  product: string;
  priorities: string[];
  services: Array<{
    name: string;
    role: string;
  }>;
};

const playbackProfiles = {
  slow: { label: "0.75x", intervalMs: 1250 },
  normal: { label: "1x", intervalMs: 800 },
  fast: { label: "1.6x", intervalMs: 450 }
} as const;

type PlaybackSpeed = keyof typeof playbackProfiles;

function buildCheckpointWindow(totalSteps: number, currentStepIndex: number): number[] {
  const anchorIndices = new Set<number>([0, currentStepIndex, totalSteps - 1]);

  for (let offset = -2; offset <= 2; offset += 1) {
    const candidate = currentStepIndex + offset;
    if (candidate >= 0 && candidate < totalSteps) {
      anchorIndices.add(candidate);
    }
  }

  return Array.from(anchorIndices).sort((left, right) => left - right);
}

function graphLayout(nodes: string[]) {
  const radius = 120;
  const centerX = 180;
  const centerY = 150;

  return Object.fromEntries(
    nodes.map((node, index) => {
      const angle = (Math.PI * 2 * index) / nodes.length - Math.PI / 2;
      return [
        node,
        {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        }
      ];
    })
  );
}

function SortingStage({ run, stepIndex }: { run: SortingRun; stepIndex: number }) {
  const step = run.trace.steps[stepIndex];
  const values = step.state.array;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(1, maxValue - minValue);
  const activeSet = new Set(step.state.activeIndices);
  const swapSet = new Set(step.state.swapPair);
  const sortedSet = new Set(step.state.sortedIndices);

  return (
    <>
      <div className="visual-heading">
        <div>
          <p className="eyebrow">Live State</p>
          <h2>{run.algorithm.name} lanes</h2>
        </div>
        <p className="visual-meta">Current phase: {step.phase}</p>
      </div>
      <div className="sort-stage">
        {values.map((value, index) => {
          const classes = [
            "sort-bar",
            activeSet.has(index) ? "sort-bar-active" : "",
            swapSet.has(index) ? "sort-bar-swap" : "",
            sortedSet.has(index) ? "sort-bar-sorted" : ""
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div className={classes} key={`${index}-${value}`}>
              <span className="sort-bar-value">{value}</span>
              <div
                className="sort-bar-rod"
                style={{ height: `${18 + ((value - minValue + 1) / (range + 1)) * 180}px` }}
              />
              <span className="sort-bar-index">{index}</span>
            </div>
          );
        })}
      </div>
      <div className="mini-grid">
        <div className="mini-card">
          <span>Focused lanes</span>
          <strong>
            {step.state.activeIndices.length > 0 ? step.state.activeIndices.join(", ") : "None"}
          </strong>
        </div>
        <div className="mini-card">
          <span>Sorted lanes</span>
          <strong>{step.state.sortedIndices.length}</strong>
        </div>
        <div className="mini-card">
          <span>Replay mode</span>
          <strong>Deterministic restore</strong>
        </div>
      </div>
    </>
  );
}

function GraphStage({ run, stepIndex }: { run: GraphRun; stepIndex: number }) {
  const step = run.trace.steps[stepIndex];
  const layout = graphLayout(run.input.nodes);
  const settledSet = new Set(step.state.settled);
  const frontierSet = new Set(step.state.frontier);
  const pathPairs = new Set(
    step.state.path.slice(0, -1).map((node, index) => `${node}->${step.state.path[index + 1]}`)
  );
  const activeEdgeKey =
    step.state.activeEdge.length === 2
      ? `${step.state.activeEdge[0]}->${step.state.activeEdge[1]}`
      : "";

  return (
    <>
      <div className="visual-heading">
        <div>
          <p className="eyebrow">Live State</p>
          <h2>{run.algorithm.name} network</h2>
        </div>
        <p className="visual-meta">Current phase: {step.phase}</p>
      </div>
      <div className="graph-stage">
        <svg viewBox="0 0 360 300" role="img" aria-label="Weighted graph replay">
          {run.input.edges.map(([from, to, weight]) => {
            const start = layout[from];
            const end = layout[to];
            const classNames = [
              "graph-edge",
              activeEdgeKey === `${from}->${to}` || activeEdgeKey === `${to}->${from}`
                ? "graph-edge-active"
                : "",
              pathPairs.has(`${from}->${to}`) || pathPairs.has(`${to}->${from}`)
                ? "graph-edge-path"
                : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <g key={`${from}-${to}`}>
                <line
                  className={classNames}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                />
                <text className="graph-weight" x={(start.x + end.x) / 2} y={(start.y + end.y) / 2 - 8}>
                  {weight}
                </text>
              </g>
            );
          })}

          {run.input.nodes.map((node) => {
            const { x, y } = layout[node];
            const distance = step.state.distances[node] ?? null;
            const classNames = [
              "graph-node",
              step.state.current === node ? "graph-node-current" : "",
              settledSet.has(node) ? "graph-node-settled" : "",
              frontierSet.has(node) ? "graph-node-frontier" : "",
              step.state.path.includes(node) ? "graph-node-path" : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <g className={classNames} key={node}>
                <circle cx={x} cy={y} r="26" />
                <text className="graph-label" x={x} y={y - 2}>
                  {node}
                </text>
                <text className="graph-distance" x={x} y={y + 16}>
                  {formatDistance(distance)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mini-grid">
        <div className="mini-card">
          <span>Frontier</span>
          <div className="pill-row">
            {step.state.frontier.length > 0 ? (
              step.state.frontier.map((node) => (
                <span className="pill" key={node}>
                  {node}
                </span>
              ))
            ) : (
              <span className="empty-pill">Frontier empty</span>
            )}
          </div>
        </div>
        <div className="mini-card">
          <span>Settled</span>
          <strong>{step.state.settled.length}</strong>
        </div>
        <div className="mini-card">
          <span>Route</span>
          <strong>{step.state.path.length > 0 ? step.state.path.join(" -> ") : "Pending"}</strong>
        </div>
      </div>
    </>
  );
}

function renderMetricCards(run: ReplayRun, stepIndex: number) {
  const step = run.trace.steps[stepIndex];

  return run.trace.summary.metricDefinitions.map((metric) => (
    <div className="metric-card" key={metric.key}>
      <span>{metric.label}</span>
      <strong>{step.metrics[metric.key] ?? 0}</strong>
    </div>
  ));
}

export default function App() {
  const [foundation, setFoundation] = useState<FoundationResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "offline">("loading");
  const [selectedAlgorithmId, setSelectedAlgorithmId] = useState<string>(algorithms[0].id);
  const [inputText, setInputText] = useState<string>(algorithms[0].defaultInput);
  const [run, setRun] = useState<ReplayRun>(() => buildRun(algorithms[0].id, algorithms[0].defaultInput));
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedId, setSpeedId] = useState<PlaybackSpeed>("normal");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function loadFoundation() {
      try {
        const response = await fetch("/api/foundation");

        if (!response.ok) {
          throw new Error("Unable to load foundation metadata.");
        }

        const payload = (await response.json()) as FoundationResponse;

        if (active) {
          setFoundation(payload);
          setStatus("ready");
        }
      } catch {
        if (active) {
          setStatus("offline");
        }
      }
    }

    void loadFoundation();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    if (currentStepIndex >= run.trace.steps.length - 1) {
      setIsPlaying(false);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCurrentStepIndex((stepIndex) => {
        if (stepIndex >= run.trace.steps.length - 1) {
          setIsPlaying(false);
          return stepIndex;
        }

        return stepIndex + 1;
      });
    }, playbackProfiles[speedId].intervalMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentStepIndex, isPlaying, run.trace.steps.length, speedId]);

  const currentStep = run.trace.steps[currentStepIndex];
  const selectedAlgorithm = getAlgorithmById(selectedAlgorithmId);
  const checkpointWindow = buildCheckpointWindow(run.trace.steps.length, currentStepIndex);

  function launchRun(algorithmId: string, nextInputText: string) {
    try {
      const nextRun = buildRun(algorithmId, nextInputText);
      setRun(nextRun);
      setInputText(nextRun.normalizedInputText);
      setSelectedAlgorithmId(algorithmId);
      setCurrentStepIndex(0);
      setIsPlaying(false);
      setError("");
    } catch (launchError) {
      setIsPlaying(false);
      setError(
        launchError instanceof Error
          ? launchError.message
          : "Unable to build the requested trace."
      );
    }
  }

  return (
    <main className="shell">
      <section className="hero-band">
        <div>
          <p className="eyebrow">TraceDeck</p>
          <h1>
            Replay shell for algorithm execution, step inspection, and deterministic
            timeline recovery.
          </h1>
          <p className="hero-copy">
            The shell favors transport clarity over generic tutorial chrome. Each
            frame is a standalone checkpoint, so scrubbing never depends on
            incremental playback.
          </p>
        </div>
        <div className="hero-status">
          <div className="status-row">
            <span className={`status-chip status-chip--${status}`}>
              {status === "ready"
                ? "API connected"
                : status === "offline"
                  ? "API offline"
                  : "Loading foundation"}
            </span>
            <span className="status-chip status-chip--accent">{foundation?.product ?? "TraceDeck"} shell</span>
          </div>
          <div className="status-row">
            <span className="status-chip">{run.algorithm.name}</span>
            <span className="status-chip">Frame {currentStepIndex + 1} of {run.trace.summary.stepCount}</span>
            <span className="status-chip">Contract-driven replay</span>
          </div>
        </div>
      </section>

      <div className="workspace-grid">
        <aside className="sidebar panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Scenario</p>
              <h2>Choose an algorithm</h2>
            </div>
            <p className="panel-copy">
              Seeded trace builders exercise the replay UX until persistence and
              execution services land.
            </p>
          </div>
          <div className="algorithm-list">
            {algorithms.map((algorithm) => (
              <button
                className={`algorithm-card ${
                  algorithm.id === selectedAlgorithmId ? "algorithm-card-active" : ""
                }`}
                key={algorithm.id}
                onClick={() => launchRun(algorithm.id, algorithm.defaultInput)}
                type="button"
              >
                <span className={`algorithm-badge algorithm-badge-${algorithm.accent}`}>
                  {algorithm.badge}
                </span>
                <strong>{algorithm.name}</strong>
                <p>{algorithm.description}</p>
              </button>
            ))}
          </div>

          <label className="input-label" htmlFor="input-editor">
            {selectedAlgorithm.inputLabel}
          </label>
          <p className="input-hint">{selectedAlgorithm.inputHint}</p>
          <textarea
            className="input-editor"
            id="input-editor"
            onChange={(event) => {
              setInputText(event.target.value);
            }}
            spellCheck={false}
            value={inputText}
          />
          {error ? (
            <div className="error-banner">{error}</div>
          ) : (
            <div className="note-banner">
              Launch rebuilds the trace from the editor content and resets the
              replay cursor.
            </div>
          )}
          <button
            className="launch-button"
            onClick={() => launchRun(selectedAlgorithmId, inputText)}
            type="button"
          >
            Launch Run
          </button>
        </aside>

        <div className="main-column">
          <section className="panel stage-panel">
            <div className="stage-layout">
              <div className="visual-panel">
                {run.algorithm.domain === "sorting" ? (
                  <SortingStage run={run} stepIndex={currentStepIndex} />
                ) : (
                  <GraphStage run={run} stepIndex={currentStepIndex} />
                )}
              </div>

              <div className="inspector-column">
                <section className="panel inspector-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Step Narrative</p>
                      <h3>{currentStep.phase}</h3>
                    </div>
                    <span className="phase-badge">Frame {currentStep.index + 1}</span>
                  </div>
                  <p className="step-detail">{currentStep.description}</p>
                  <ul className="change-list">
                    {currentStep.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                  <div className="metric-grid">{renderMetricCards(run, currentStepIndex)}</div>
                </section>

                <section className="panel state-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Changed Paths</p>
                      <h3>Recorded step deltas</h3>
                    </div>
                  </div>
                  <div className="number-grid">
                    {currentStep.changedPaths.map((path) => (
                      <span className="number-pill" key={path}>
                        {path}
                      </span>
                    ))}
                  </div>
                  {run.algorithm.domain === "graph" ? (
                    <div className="distance-grid">
                      {Object.entries(run.trace.steps[currentStepIndex].state.distances).map(
                        ([node, distance]) => (
                          <div className="distance-row" key={node}>
                            <span>{node}</span>
                            <strong>{formatDistance(distance)}</strong>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="number-grid">
                      {run.trace.steps[currentStepIndex].state.array.map((value, index) => (
                        <span className="number-pill" key={`${value}-${index}`}>
                          {value}
                        </span>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </section>

          <section className="panel transport-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Transport</p>
                <h3>Replay controls</h3>
              </div>
              <p className="panel-copy">
                Large traces use checkpointed scrubbing instead of rendering a DOM
                marker for every frame.
              </p>
            </div>

            <div className="transport-row">
              <button className="transport-button" onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(0);
              }} type="button">
                Start
              </button>
              <button className="transport-button" onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex((stepIndex) => Math.max(0, stepIndex - 1));
              }} type="button">
                Step Back
              </button>
              <button
                className="transport-button transport-button-primary"
                onClick={() => {
                  if (isPlaying) {
                    setIsPlaying(false);
                    return;
                  }

                  if (currentStepIndex >= run.trace.steps.length - 1) {
                    setCurrentStepIndex(0);
                  }

                  setIsPlaying(true);
                }}
                type="button"
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button className="transport-button" onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex((stepIndex) =>
                  Math.min(run.trace.steps.length - 1, stepIndex + 1)
                );
              }} type="button">
                Step Forward
              </button>
              <button className="transport-button" onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(run.trace.steps.length - 1);
              }} type="button">
                End
              </button>
            </div>

            <div className="speed-row">
              {(Object.entries(playbackProfiles) as Array<[PlaybackSpeed, (typeof playbackProfiles)[PlaybackSpeed]]>).map(
                ([profileId, profile]) => (
                  <button
                    className={`segmented ${profileId === speedId ? "segmented-active" : ""}`}
                    key={profileId}
                    onClick={() => {
                      setSpeedId(profileId);
                    }}
                    type="button"
                  >
                    {profile.label}
                  </button>
                )
              )}
            </div>

            <div className="transport-summary">
              <div className="metric-inline">
                <span>Current frame</span>
                <strong>{currentStep.phase}</strong>
              </div>
              <div className="metric-inline">
                <span>Playback profile</span>
                <strong>{playbackProfiles[speedId].label}</strong>
              </div>
              <div className="metric-inline">
                <span>Foundation status</span>
                <strong>{status === "ready" ? "API connected" : "Local trace only"}</strong>
              </div>
            </div>
          </section>

          <section className="panel timeline-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Timeline</p>
                <h3>Scrub to any deterministic checkpoint</h3>
              </div>
              <p className="panel-copy">
                Frame {currentStepIndex + 1} of {run.trace.summary.stepCount}
              </p>
            </div>
            <input
              aria-label="Replay timeline"
              className="timeline-range"
              max={run.trace.steps.length - 1}
              min={0}
              onChange={(event) => {
                setIsPlaying(false);
                setCurrentStepIndex(Number(event.target.value));
              }}
              onInput={(event) => {
                setIsPlaying(false);
                setCurrentStepIndex(Number((event.target as HTMLInputElement).value));
              }}
              type="range"
              value={currentStepIndex}
            />
            <div className="timeline-labels">
              <span>Seed</span>
              <span>{currentStep.phase}</span>
              <span>Done</span>
            </div>
            <div className="checkpoint-row">
              {checkpointWindow.map((stepIndex) => {
                const step = run.trace.steps[stepIndex];
                return (
                  <button
                    className={`checkpoint ${
                      stepIndex === currentStepIndex ? "checkpoint-active" : ""
                    }`}
                    key={step.index}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStepIndex(stepIndex);
                    }}
                    type="button"
                  >
                    <span className="checkpoint-index">{step.index + 1}</span>
                    <strong>{step.phase}</strong>
                    <span>{step.description}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {foundation?.services?.length ? (
            <section className="panel summary-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Product Focus</p>
                  <h3>Execution seams already visible in the shell</h3>
                </div>
              </div>
              <div className="summary-grid">
                {foundation.services.map((service) => (
                  <article className="summary-card" key={service.name}>
                    <p className="card-kicker">{service.name}</p>
                    <h3>{service.role}</h3>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
