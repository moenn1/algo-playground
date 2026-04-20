# TraceDeck Persistence API

TraceDeck persists deterministic trace runs as durable records so replay, history, and comparison workflows can build on one storage contract.

## Storage model

- Algorithms are registered from incoming trace envelopes and tracked with run counts and last-run timestamps.
- Runs store lightweight summary metadata separately from the step stream used for replay.
- Steps are retrieved through a paged endpoint so large traces do not inflate list responses.
- Comparisons reference persisted runs and materialize metric deltas at creation time for fast retrieval later.

The local API writes data to `.tracedeck/storage.json` by default. Override that location with `TRACEDECK_DATA_FILE` when you need a different local persistence target. The server bootstrap reads that env var on startup, so CLI runs and local restart checks use the same durable file path automatically.

## Endpoints

### `GET /api/persistence`

Returns storage metadata and aggregate counts for algorithms, runs, and comparisons.

### `GET /api/algorithms`

Returns registered algorithms with run counts, latest run IDs, and last-run timestamps.

### `POST /api/runs`

Persists a deterministic trace envelope and returns the stored run record.

### `GET /api/runs`

Lists stored run summaries. Supports `algorithmId`, `limit`, and `cursor`.

### `GET /api/runs/:runId`

Returns a full persisted run, including the normalized trace envelope used for replay.

### `GET /api/runs/:runId/steps`

Returns a paged step window for replay surfaces. Supports `offset` and `limit`.

### `POST /api/comparisons`

Creates a comparison record from two persisted runs. Optionally restrict metric evaluation with `metricKeys`.

### `GET /api/comparisons`

Lists comparison records. Supports `runId`, `limit`, and `cursor`.

### `GET /api/comparisons/:comparisonId`

Returns a single comparison record with materialized metric deltas.
