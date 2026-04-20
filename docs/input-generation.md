# Input Generation API

## Scope

`apps/api` exposes a deterministic input-service layer for TraceDeck clients that need repeatable demo data, preset scenarios, and validated custom payloads.

The service currently covers the supported algorithms already present in the workspace:

- Sorting: `bubble-sort`, `selection-sort`, `quick-sort`, `merge-sort`
- Search: `binary-search`
- Graph: `bfs`, `dijkstra`

## Endpoints

### `GET /api/input-presets`

Returns the available preset catalog.

Optional query parameters:

- `algorithmId`
- `domain`

Each preset summary includes:

- Stable `id`
- `scenario`, `kind`, and `description`
- Supported `algorithms`
- `supportsSeed`
- Any `defaultSeed` and `defaultOptions`

### `GET /api/input-presets/:presetId`

Returns a single preset definition without materializing an input payload.

### `POST /api/input-presets/:presetId/resolve`

Materializes a preset into a normalized input payload.

Request body:

```json
{
  "algorithmId": "bubble-sort",
  "seed": 17,
  "options": {
    "size": 8
  }
}
```

Response shape:

```json
{
  "source": "preset",
  "preset": {
    "id": "sorting.random-distinct",
    "scenario": "random"
  },
  "algorithm": {
    "id": "bubble-sort",
    "label": "Bubble Sort",
    "domain": "sorting"
  },
  "input": [12, 19, 7, 31, 4, 26, 8, 15],
  "normalizedInputText": "12, 19, 7, 31, 4, 26, 8, 15",
  "footprint": "8 lanes",
  "seed": 17,
  "options": {
    "size": 8
  }
}
```

### `POST /api/inputs/validate`

Validates and normalizes custom payloads before clients create runs.

Request body:

```json
{
  "algorithmId": "dijkstra",
  "payload": {
    "nodes": ["A", "B", "C"],
    "edges": [["A", "B", 2], ["B", "C", 3]],
    "start": "A",
    "target": "C",
    "directed": false
  }
}
```

The response includes the normalized `input`, `normalizedInputText`, and `footprint`.

## Preset Catalog

### Sorting presets

- `sorting.baseline`: fixed demo array aligned with the replay shell
- `sorting.reverse-sorted`: descending worst-case scenario with `size`, `start`, and `step`
- `sorting.nearly-sorted`: seeded near-best-case scenario with `size` and `swaps`
- `sorting.random-distinct`: seeded random distinct integers with `size`, `minimum`, and `maximum`

Every sorting preset can be resolved for Bubble Sort, Selection Sort, Quick Sort, or Merge Sort through the same `algorithmId` field.

### Graph presets

- `graph.reference-route`: fixed weighted graph aligned with the replay shell
- `graph.disconnected-target`: curated no-route scenario
- `graph.weighted-detour`: curated pathfinding case with a cheaper multi-hop route
- `graph.random-network`: seeded generated network with `nodes`, `extraEdges`, and `directed`

Every graph preset can be resolved for Breadth-First Search or Dijkstra through the same `algorithmId` field. BFS ignores edge weights but preserves the shared graph input contract so pathfinding fixtures can be replayed across both algorithms.

### Search presets

- `search.reference-hit`: curated sorted array where the target is present
- `search.missing-target`: curated sorted array where the target is absent

Both search presets currently resolve for Binary Search through the same `algorithmId` field.

## Validation Rules

- Sorting payloads accept either integer arrays or comma-separated integer strings.
- Search payloads accept either JSON objects or JSON strings.
- Graph payloads accept either JSON objects or JSON strings.
- Sorting inputs must contain between 2 and 24 integers.
- Search payloads must define a sorted integer array between 2 and 32 entries plus an integer target.
- Graph payloads must define valid node ids, positive edge weights, and edge endpoints that exist in the node set.
- Preset option objects reject unknown keys so clients can treat the contract as explicit rather than best-effort.

## Design Notes

- Seeded presets are deterministic: the same `presetId`, `algorithmId`, `seed`, and `options` produce the same normalized payload.
- Preset resolution is server-side so replay clients, persistence flows, and future automation can share the same scenario contract.
- Custom validation returns normalized text alongside structured JSON so UI editors can preserve domain-specific formatting without reimplementing parsers.
