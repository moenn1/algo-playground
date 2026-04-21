# Replay Shell UX Notes

## Scope

This document describes the replay shell direction established in `apps/web`.

Today the web app is a multi-surface product shell: it validates API connectivity, separates overview, replay, library, reference, history, and comparison pages, and keeps each surface on the same deterministic trace contract.

## Product structure

- `#/` is the landing overview with product context, recent activity, and primary route selection.
- `#/playground/:algorithmId?` is the dedicated single-run workspace for live replay, transport, timeline, and step inspection.
- `#/library` now acts as a browseable catalog with route-backed search, domain, progression-stage, learning-goal, and sort filters plus curated pathways into focused reference pages.
- `#/algorithms/:algorithmId` captures per-algorithm guidance, input format, and replay expectations without crowding the live playground.
- `#/history` surfaces saved runs and saved comparison records as lightweight summaries first, then hydrates a replay only when the user resumes one.
- `#/compare` reserves synchronized sorting playback, trend charts, and leaderboard metrics for a dedicated comparison route.

## Interaction model

- Replay surfaces should treat recorded trace envelopes as the source of truth instead of recomputing hidden state in the browser.
- Navigation should create genuinely separate working surfaces, not one long page disguised with anchor jumps or tabs.
- Library browse state should live in the route so discovery filters can be revisited, shared, and recovered without rebuilding them manually.
- The selected algorithm should own its input editor format and trace builder so transport and inspection views stay domain-aware.
- Algorithm trace builders should lean on the shared `trace-core` recorder so step keys, path diffs, and runtime-state projection stay consistent across domains.
- Playback and timeline scrubbing should operate on full step snapshots encoded through `trace-core`. This keeps restoration deterministic and avoids replay drift.
- Timeline checkpoints should render as focused working windows around the active step instead of naive markers for every frame.
- Comparison playback should synchronize runs by normalized progress instead of forcing algorithms with different trace densities onto the same absolute step count.
- Step inspectors should read structured explanations, explicit change paths, and structured highlights from the recorded trace envelope rather than deriving them ad hoc in the UI.
- The shell should foreground the active frame with a briefing layer before deeper inspector panels so the current replay moment stays readable during scrubbing.
- Global storyboard stops should complement local checkpoint windows: the storyboard communicates journey-level progress while nearby checkpoints keep precise jumps fast.
- Comparison mode should surface compact per-lane sync signals ahead of the full comparison deck so multi-run playback remains legible on narrow viewports.
- The visual system should read as an intentional replay studio rather than a generic dashboard: solid surfaces, bolder section separation, and a distinct palette shift should be visible on first load.
- Motion should clarify replay state instead of adding ambient ornament: panel entrances can stage dense information, while live playback cues should stay tied to the transport surface and timeline progress.
- Any animated replay affordance needs a reduced-motion fallback so deterministic stepping remains comfortable during long inspection sessions.
- Tablet and mobile layouts should keep controls in explicit grids and let dense navigation rows scroll horizontally instead of compressing core replay actions into cramped wraps.

## Replay Surfaces

- Product priorities, recent activity, and route choices are visible in the landing shell.
- API availability is surfaced directly so local development failures are obvious.
- Single-run replay exposes domain-aware sorting, search, sliding-window, dynamic-programming, stack, and graph stages, transport controls, structured step narratives, and explicit change-path chips.
- The product shell uses a persistent top-level navigation band so users can move between landing, replay, library, history, and compare without collapsing the whole product into one page.
- The current shell art direction uses warm paper tones, ink-heavy control surfaces, and section-level color blocking so each page reads like part of one product rather than a disconnected tool set.
- The library should feel like a discovery surface, not a flattened appendix: category rails, progression cues, and saved-activity signals should help users understand breadth before they open a replay.
- Single replay adds an active-frame briefing strip with a snapshot lens and recorded-signal summary before the detailed inspector panels.
- Live playback now adds subtle emphasis to the transport panel, play control, and progress bar so active runs read as active even when the stage viewport itself is visually dense.
- Sorting replay now ships through a reusable stage module that adds an operation summary, live trace metrics, and a per-lane ledger so the same component can serve the main shell and future page-level layouts.
- The search stage renders interval cuts, midpoint probes, and explicit found-versus-exhausted outcomes from the shared execution-engine snapshots.
- The sliding-window stage renders active bounds, current sum, candidate hits, and best-window overlays directly from the shared execution-engine snapshots.
- The dynamic-programming stage renders the full matrix, dependency cells, and traceback highlights directly from the shared execution-engine snapshots.
- The stack stage renders token-by-token validation status, the live opener stack, expected closers, and first-failure context directly from the shared execution-engine snapshots.
- The graph stage now runs on the shared execution-engine package for both Breadth-First Search and Dijkstra, so queue order, weighted frontier order, and route recovery all come from one deterministic runtime surface.
- Graph replay now pairs the SVG network map with a structural-state rail for node status, distance inspection, and route focus so the shell can surface graph state without inventing browser-only metadata.
- Saved-run history now lives on its own page and loads replay payloads on demand so persistence browsing stays responsive with larger trace payloads.

## Comparison Surfaces

- Compare mode rebuilds multiple sorting traces from one shared input editor and keeps playback synchronized through a shared progress line.
- Side-by-side stage cards preserve each algorithm's own deterministic checkpoints while showing normalized frame progress and per-run metric cards.
- Metric trend charts visualize how comparisons, swaps, and passes diverge over the same synchronized timeline.
- Comparison summary cards read final comparison metrics directly from the trace envelope instead of recomputing winners in the UI layer.
- A sync-signal grid summarizes each algorithm's current phase and normalized position before the full comparison deck, which improves scanability on desktop and mobile.
- Timeline scrubbing now pairs a progress bar, storyboard stops, and local checkpoint windows so users can switch between global navigation and precise frame stepping.
- Storyboard cards, sync cards, and transport metrics enter with staged motion and keep snap-aligned horizontal browsing on smaller screens so multi-run inspection remains readable without shrinking the cards away.
- Mobile and tablet comparison layouts now prioritize stacked cards, grid-based controls, and horizontal checkpoint browsing so synchronized playback stays readable without shrinking the visualization cards away.

## Extension guidance

- Add new product areas as first-class routes inside the navigation shell instead of extending one long page.
- Hook persistence into the eventual run-builder shape so saved runs can hydrate the shell without changing the transport model.
- Extend comparison mode by adding more compare-ready algorithms that share an input contract and metric vocabulary.
- Keep future visualizations snapshot-driven. The timeline should always be able to jump to a step without replaying intermediate mutations.
- Reuse the extracted stage visualization modules when product restructuring introduces additional pages or saved-run entry points so replay surfaces keep one rendering contract across the app.
