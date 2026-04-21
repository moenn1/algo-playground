# Replay Interface Notes

## Scope

This document describes the replay interface direction established in `apps/web`.

Today the web app is a multi-route local interface: it validates API connectivity, separates overview, replay, library, reference, history, and comparison pages, and keeps each surface on the same deterministic trace contract.

## Route structure

- `#/overview` is the overview index for route selection, persistence status, and recent activity.
- An empty hash now resolves to `#/playground/:algorithmId?`, so first load opens replay instead of the overview route.
- `#/playground/:algorithmId?` is the dedicated single-run workspace for live replay, transport, timeline, and step inspection.
- `#/library` now acts as a browseable catalog with a calmer navigation rail, one shared control band for search and refinement, route-backed search, domain, progression-stage, learning-goal, and sort filters, plus curated pathways into focused reference pages.
- `#/algorithms/:algorithmId` captures per-algorithm guidance, input format, and replay expectations in a reference-style dossier without crowding the live replay surface.
- `#/history` surfaces saved runs and saved comparison records as lightweight summaries first, then hydrates a replay only when the user resumes one.
- `#/compare` reserves synchronized sorting playback, route-level sync context, trend charts, and leaderboard metrics for a dedicated comparison route.

## Interaction model

- Replay surfaces should treat recorded trace envelopes as the source of truth instead of recomputing hidden state in the browser.
- Navigation should create genuinely separate working surfaces, not one long page disguised with anchor jumps or tabs.
- Route splitting alone is not enough: overview, replay, library, reference, comparison, and history should each keep a different composition pattern instead of reusing the same card grid with new labels.
- Library browse state should live in the route so discovery filters can be revisited, shared, and recovered without rebuilding them manually.
- Library controls should cluster by responsibility: navigation belongs in the rail, while search, active filters, and sort controls belong beside the results they modify.
- Shared surface styling should stay calm across routes: title scale, border weight, spacing rhythm, and card interior treatment need one coherent system instead of changing panel by panel.
- The selected algorithm should own its input editor format and trace builder so transport and inspection views stay domain-aware.
- Algorithm trace builders should lean on the shared `trace-core` recorder so step keys, path diffs, and runtime-state projection stay consistent across domains.
- Playback and timeline scrubbing should operate on full step snapshots encoded through `trace-core`. This keeps restoration deterministic and avoids replay drift.
- Timeline checkpoints should render as focused working windows around the active step instead of naive markers for every frame.
- Comparison playback should synchronize runs by normalized progress instead of forcing algorithms with different trace densities onto the same absolute step count.
- Step inspectors should read structured explanations, explicit change paths, and structured highlights from the recorded trace envelope rather than deriving them ad hoc in the UI.
- The interface should foreground the active frame with a briefing layer before deeper inspector panels so the current replay moment stays readable during scrubbing.
- Route headers should stay neutral and operational. The product should read like a working trace tool, not a promotional landing page.
- Global storyboard stops should complement local checkpoint windows: the storyboard communicates journey-level progress while nearby checkpoints keep precise jumps fast.
- Comparison mode should surface compact per-lane sync signals ahead of the full comparison deck so multi-run playback remains legible on narrow viewports.
- The visual system should read as an intentional replay tool rather than a generic dashboard: solid surfaces, bolder section separation, and a distinct palette shift should be visible on first load.
- Above-the-fold framing on desktop should fit a common laptop viewport without horizontal page scrolling or a long first-load stack.
- Repeated bordered cards should not be the default composition pattern when a rail, shelf, list, or docked panel communicates the job more clearly.
- Browse-heavy surfaces should privilege calm rails, compact toolbars, and dense result ledgers over stacks of individually framed promo cards.
- Nested sections inside those routes should also resist card sprawl: summaries, sync signals, and saved records should prefer strips, ledgers, and dividers when a larger route panel already provides the frame.
- Motion should clarify replay state instead of adding ambient ornament: panel entrances can stage dense information, while live playback cues should stay tied to the transport surface and timeline progress.
- Any animated replay affordance needs a reduced-motion fallback so deterministic stepping remains comfortable during long inspection sessions.
- Tablet and mobile layouts should keep controls in explicit grids and let dense navigation rows scroll horizontally instead of compressing core replay actions into cramped wraps.

## Replay Surfaces

- Route choices, recent activity, and persistence state are visible in the overview index.
- API availability is surfaced directly so local development failures are obvious.
- Single-run replay exposes domain-aware sorting, search, two-pointer, sliding-window, hash, heap, interval, dynamic-programming, stack, and graph stages, transport controls, structured step narratives, and explicit change-path chips.
- The top-level navigation band should let users move between overview, replay, library, history, and compare without collapsing the interface into one long page.
- The current art direction uses warm paper tones, ink-heavy control surfaces, flatter navigation tabs, calmer borders, and route-specific composition so each page reads like part of one toolset rather than a disconnected card stack.
- The library should feel like one coherent browsing tool, not a flattened appendix: a calm filter rail, progression-path shortcuts, and dense result rows should help users understand breadth before they open a replay.
- Library styling should favor continuous browse hierarchy over nested boxed sections: a quieter domain rail, one shared control band, and two-column result rows communicate the catalog more clearly than more framed cards.
- Library result interiors should prefer reference patterns over decorative sub-cards: labeled replay-focus notes, plain signal lines, and ledger-style metadata keep the index readable when many entries are visible together.
- Library, reference, and history now share one neutral workspace-header system with metadata ledgers instead of banner-style intros, which keeps cross-route hierarchy consistent without making the pages feel identical.
- Reference, comparison, and history interiors now lean on lighter ledger rows, quieter metric treatments, and flatter controls so internal sections feel deliberate instead of visually busy.
- Single replay adds an active-frame briefing strip with a snapshot lens and recorded-signal summary before the detailed inspector panels.
- Single replay now gives the visualization stage the full main width and moves the transport-and-timeline dock below it on desktop, which keeps playback controls visible without forcing the page wider than a laptop frame.
- Overview, library, and history now lean on directories and ledger-style lists instead of large hero sections or repeated card grids.
- Live playback now adds subtle emphasis to the transport panel, play control, and progress bar so active runs read as active even when the stage viewport itself is visually dense.
- Sorting replay now ships through a reusable stage module that adds an operation summary, live trace metrics, and a per-lane ledger so the same component can serve Bubble Sort, Insertion Sort, Shell Sort, Selection Sort, Quick Sort, Merge Sort, Heap Sort, the main interface, and future page-level layouts.
- The search stage renders interval cuts, midpoint probes, ordered-half signals for rotated-array search, and explicit found-versus-exhausted outcomes from the shared execution-engine snapshots.
- The two-pointer stage renders the active walls, container-area or basin-fill summaries, boundary maxima, per-index trapped water, and final best-result state directly from the shared execution-engine snapshots.
- The sliding-window stage renders active bounds, current sum or active substring, candidate or duplicate-hit signals, and best-window overlays directly from the shared execution-engine snapshots.
- The hash stage renders the active array slot, requested complement, insertion-ordered lookup table, and final matched pair directly from the shared execution-engine snapshots.
- The heap stage renders the active array slot or frequency ledger, live size-`k` heap order, ranked top-`k` cutoff view, evicted root, and final kth-largest threshold or ranked top-frequency output directly from the shared execution-engine snapshots.
- The interval stage renders sorted ranges, the live merge span, overlap checks, and committed outputs directly from the shared execution-engine snapshots.
- The dynamic-programming stage renders the full matrix, dependency cells, and traceback highlights directly from the shared execution-engine snapshots.
- The stack stage renders token-by-token validation status for Valid Parentheses, a temperature skyline plus unresolved-day stack for Daily Temperatures, histogram bars with the candidate stack and best rectangle for Largest Rectangle in Histogram, or an operation ledger plus minimum stack rail for Min Stack directly from the shared execution-engine snapshots.
- The graph stage now runs on the shared execution-engine package for Breadth-First Search, Depth-First Search, Dijkstra, Clone Graph, Graph Valid Tree, Course Schedule, Rotting Oranges, Number of Islands, Surrounded Regions, and Walls and Gates, so queue order, top-first stack order, weighted frontier order, clone-map allocation, Union-Find root comparison, zero-indegree unlocks, minute-wave infection spread, row-major scan checkpoints, border-safe ledgers, row-major capture queues, room-distance fills, and terminal stall reporting all come from one deterministic runtime family.
- Graph replay now pairs the SVG graph map or grid stage with a structural-state rail for node, course, or cell status, distance, clone label, representative-root, parent-rank, indegree, safe-region, capture queue, or room-distance inspection, plus path-, clone-link-, accepted-edge-, order-, infection-, connectivity-, capture-, or distance-fill focus so the interface can surface graph state without inventing browser-only metadata.
- Saved-run history now lives on its own page and loads replay payloads on demand so persistence browsing stays responsive with larger trace payloads.

## Comparison Surfaces

- Compare mode rebuilds multiple sorting traces from one shared input editor and keeps playback synchronized through a shared progress line.
- Side-by-side stage cards preserve each algorithm's own deterministic checkpoints while showing normalized frame progress and per-run metric cards.
- Metric trend charts visualize how comparisons, swaps, and passes diverge over the same synchronized timeline.
- Comparison summary cards read final comparison metrics directly from the trace envelope instead of recomputing winners in the UI layer.
- A sync-signal grid summarizes each algorithm's current phase and normalized position before the full comparison deck, which improves scanability on desktop and mobile.
- The compare route also carries a dedicated deck-and-sync strip above the main workspace so it reads differently from single-run replay before users reach the heavier charts and stage cards.
- Timeline scrubbing now pairs a progress bar, storyboard stops, and local checkpoint windows so users can switch between global navigation and precise frame stepping.
- Storyboard cards, sync cards, and transport metrics enter with staged motion and keep snap-aligned horizontal browsing on smaller screens so multi-run inspection remains readable without shrinking the cards away.
- Mobile and tablet comparison layouts now prioritize stacked cards, grid-based controls, and horizontal checkpoint browsing so synchronized playback stays readable without shrinking the visualization cards away.

## Extension guidance

- Add new product areas as first-class routes inside the navigation system instead of extending one long page.
- Hook persistence into the eventual run-builder shape so saved runs can hydrate the interface without changing the transport model.
- Extend comparison mode by adding more compare-ready algorithms that share an input contract and metric vocabulary.
- Keep future visualizations snapshot-driven. The timeline should always be able to jump to a step without replaying intermediate mutations.
- Reuse the extracted stage visualization modules when product restructuring introduces additional pages or saved-run entry points so replay surfaces keep one rendering contract across the app.
