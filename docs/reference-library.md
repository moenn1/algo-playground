# Reference Library

## Scope

TraceDeck now ships a dedicated algorithm reference surface inside `apps/web`.

The reference library is not a detached docs appendix. It is a product path that sits beside replay and comparison so users can:

- browse the supported algorithm catalog without launching a run first
- open a detail page for a specific algorithm
- open dedicated named-problem pages for classic interview-style and LeetCode-style prompts
- study the idea, complexity profile, use cases, interview framing, and reasoning steps
- study problem summaries, pattern-group families, pattern tags, related problems, and implementation variants
- switch between TypeScript, Python, Java, and C++ solution implementations
- jump directly from a reference page into the replay shell for the same algorithm

## Routes

- `/` keeps the replay and comparison studio
- `/reference` opens the reference catalog
- `/reference/:algorithmId` opens the detail page for the matching algorithm
- `/reference/problems/:problemId` opens the detail page for a named problem reference

Routing is handled in the browser through `apps/web/src/routes.ts` so direct navigation and history controls stay consistent without introducing an external router dependency.

## Content model

Reference content lives in `apps/web/src/reference.ts`.
Named problem content lives in `apps/web/src/problemReferences.ts`.

Each algorithm entry carries:

- a core idea statement
- correctness and behavior notes under `whyItWorks`
- explicit best, average, worst, and space complexity values
- use-case guidance and interview prompts
- ordered reasoning steps for walkthrough-style reading
- implementation watchouts
- four language implementations with filename, summary, and code body

The file is keyed by TraceDeck algorithm identifiers so the catalog stays aligned with the replay runtime rather than drifting into a separate naming scheme.

Each named problem entry carries:

- a concise problem statement summary
- a pattern-family grouping for catalog navigation
- pattern tags that make the recognition surface explicit
- related algorithms and related problems for deeper study paths
- implementation variants with tradeoff notes
- four language implementations for the primary approach

Problem entries can either link back to replay-backed algorithms or stand alone as study-first pages when TraceDeck has not added replay coverage for that technique yet.

## UI composition

`apps/web/src/ReferenceLibrary.tsx` renders two product surfaces:

- a catalog grouped by algorithm domain with quick complexity cards and replay handoff actions
- a pattern-grouped named-problem catalog so the study library grows by recognizable interview families instead of one flat list
- an algorithm detail layout with overview facts, reasoning walkthrough, side-rail study guidance, linked named problems, and language tabs for code
- a problem detail layout with statement summaries, interview framing, pattern-group context, related problems, implementation variants, and language tabs for code

The shared hero in `App.tsx` adapts between replay mode and reference mode so the top-level navigation remains stable while the page context changes.

## Extension guidance

- Add new algorithm pages by updating `apps/web/src/reference.ts` alongside the replay metadata in `apps/web/src/replay.ts`.
- Add named problem pages in `apps/web/src/problemReferences.ts` whenever TraceDeck grows into a new interview-heavy area or pattern family.
- Keep algorithm IDs identical across replay, persistence, and reference content.
- If a new algorithm is replayable, it should also receive a reference entry in the same iteration.
- If a new named problem is added, include its pattern family, pattern tags, related links, and at least one documented implementation variant in the same change.
- Use study-first problem pages when a technique is valuable for interview preparation but does not yet have a replay-backed algorithm page.
- Prefer concise, readable starter implementations over framework-specific snippets so the library remains broadly useful.
