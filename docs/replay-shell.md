# Replay Shell UX Notes

## Scope

This document describes the replay shell direction established in `apps/web`.

Today the web app is a replay and comparison studio: it validates API connectivity, exposes deterministic single-run playback, and ships a synchronized sorting comparison deck that sits on the same trace contract as the replay shell.

## Interaction model

- Replay surfaces should treat recorded trace envelopes as the source of truth instead of recomputing hidden state in the browser.
- The selected algorithm should own its input editor format and trace builder so transport and inspection views stay domain-aware.
- Algorithm trace builders should lean on the shared `trace-core` recorder so step keys, path diffs, and runtime-state projection stay consistent across domains.
- Playback and timeline scrubbing should operate on full step snapshots encoded through `trace-core`. This keeps restoration deterministic and avoids replay drift.
- Timeline checkpoints should render as focused working windows around the active step instead of naive markers for every frame.
- Comparison playback should synchronize runs by normalized progress instead of forcing algorithms with different trace densities onto the same absolute step count.
- Step inspectors should read structured explanations, explicit change paths, and structured highlights from the recorded trace envelope rather than deriving them ad hoc in the UI.
- The shell should foreground the active frame with a briefing layer before deeper inspector panels so the current replay moment stays readable during scrubbing.
- Global storyboard stops should complement local checkpoint windows: the storyboard communicates journey-level progress while nearby checkpoints keep precise jumps fast.
- Comparison mode should surface compact per-lane sync signals ahead of the full comparison deck so multi-run playback remains legible on narrow viewports.

## Replay Surfaces

- Product priorities and service seams are visible in the landing shell.
- API availability is surfaced directly so local development failures are obvious.
- Single-run replay exposes domain-aware sorting and graph stages, transport controls, structured step narratives, and explicit change-path chips.
- The hero band now acts as a command surface with live progress telemetry, playback context, and product-priority pills for the current run.
- Single replay adds an active-frame briefing strip with a snapshot lens and recorded-signal summary before the detailed inspector panels.
- The graph stage now runs on the shared execution-engine package for both Breadth-First Search and Dijkstra, so queue order, weighted frontier order, and route recovery all come from one deterministic runtime surface.

## Comparison Surfaces

- Compare mode rebuilds multiple sorting traces from one shared input editor and keeps playback synchronized through a shared progress line.
- Side-by-side stage cards preserve each algorithm's own deterministic checkpoints while showing normalized frame progress and per-run metric cards.
- Metric trend charts visualize how comparisons, swaps, and passes diverge over the same synchronized timeline.
- Comparison summary cards read final comparison metrics directly from the trace envelope instead of recomputing winners in the UI layer.
- A sync-signal grid summarizes each algorithm's current phase and normalized position before the full comparison deck, which improves scanability on desktop and mobile.
- Timeline scrubbing now pairs a progress bar, storyboard stops, and local checkpoint windows so users can switch between global navigation and precise frame stepping.

## Extension guidance

- Add algorithm selection, seeded inputs, transport controls, and step inspection on top of the existing shell rather than replacing it with a separate app path.
- Hook persistence into the eventual run-builder shape so saved runs can hydrate the shell without changing the transport model.
- Extend comparison mode by adding more compare-ready algorithms that share an input contract and metric vocabulary.
- Keep future visualizations snapshot-driven. The timeline should always be able to jump to a step without replaying intermediate mutations.
