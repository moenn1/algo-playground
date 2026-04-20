# Replay Shell UX Notes

## Scope

This document describes the replay shell direction established in `apps/web`.

Today the web app is a product foundation shell: it validates API connectivity, communicates TraceDeck priorities, and anchors the UX principles that later replay and comparison features should extend rather than replace.

## Interaction model

- Replay surfaces should treat recorded trace envelopes as the source of truth instead of recomputing hidden state in the browser.
- The selected algorithm should own its input editor format and trace builder so transport and inspection views stay domain-aware.
- Playback and timeline scrubbing should operate on full step snapshots encoded through `trace-core`. This keeps restoration deterministic and avoids replay drift.
- Timeline checkpoints should render as focused working windows around the active step instead of naive markers for every frame.

## Foundation Surfaces

- Product priorities and service seams are visible in the landing shell.
- API availability is surfaced directly so local development failures are obvious.
- Replay and comparison principles are communicated before deeper execution features land.

## Extension guidance

- Add algorithm selection, seeded inputs, transport controls, and step inspection on top of the existing shell rather than replacing it with a separate app path.
- Hook persistence into the eventual run-builder shape so saved runs can hydrate the shell without changing the transport model.
- Add comparison mode as another shell composition around the current stage, inspector, and transport surfaces.
- Keep future visualizations snapshot-driven. The timeline should always be able to jump to a step without replaying intermediate mutations.
