# Ecological / Plant / Wildlife Identification Groundwork v1

Allow Rabbit Hole to recognize when a captured image or page scan might represent a natural object (plant, animal, insect, fungus, or ecological feature) and route that into a structured ecological interpretation path.

## Status

**Implemented (groundwork).** Fixture-backed ecological entities; no real species classifier or ML. When the image pipeline returns ecological segments (e.g. for a dedicated demo upload id), the app shows a compact ecological context block and can link to an article when available.

## Purpose

- Introduce an **ecological entity** interpretation category alongside objects, media, organizations, and products.
- Provide a small, contract-aligned path for plants, trees, insects, fungi, birds, animals, and ecosystem features.
- Integrate with the existing article + explanation model (optional `articleId` on the entity).
- Use neutral, general-awareness language for safety notes; no medical advice.

## Model

```ts
type EcologicalEntityKind =
  | 'plant'
  | 'tree'
  | 'insect'
  | 'fungus'
  | 'bird'
  | 'animal'
  | 'ecosystem_feature'
  | 'unknown';

type EcologicalEntity = {
  id: string;
  name: string;
  kind: EcologicalEntityKind;
  summary?: string;
  seasonalNotes?: string[];
  safetyNotes?: string[];
  articleId?: string;
}
```

## Example fixtures

- **Poison ivy** (plant) — summary, seasonal note, safety notes (general awareness), links to `article-poison-ivy`.
- **Tick** (insect) — summary, seasonal note, safety note (general awareness).
- **Oak tree** (tree) — summary only.
- **Honey bee** (insect) — summary, seasonal note, safety note.
- **Mushroom** (fungus) — summary, seasonal note, safety note (do not consume without expert ID).

## Integration with Lens

- **POST /v1/explore/image**  
  Response may include optional `ecologicalEntity` when the fixture region set for the given `uploadId` includes ecological segments. For v1, when `uploadId` is `"eco"` or `"eco-demo"`, the API returns ecological regions (e.g. seg-poison-ivy, seg-tick, seg-oak, seg-bee, seg-mushroom) and the first matching ecological entity is attached to the response.

- **POST /v1/explore/image/tap**  
  When `uploadId` is `"eco"` (or `"eco-demo"`), tap resolution uses the same ecological regions; e.g. `segmentId: "seg-poison-ivy"` returns `articleId: "article-poison-ivy"` when the fixture links that segment to the poison ivy article.

- **Mobile**  
  When `exploreImage` returns `ecologicalEntity`, Image Focus shows a compact **Nature** block (name, kind, summary, seasonal notes, safety notes labeled “General awareness”, and “Read more” if `articleId` is set).

## Limitations of v1

- No real species recognition; no ML or classifier.
- Ecological path is triggered only by fixture: use `uploadId` `"eco"` or `"eco-demo"` to exercise it (e.g. in tests or a future “nature demo” entry).
- One ecological entity per image response (first matching segment).
- Safety and seasonal content are fixture-authored and general-awareness only.

## Epistemic / safety

- No medical advice.
- Safety notes are clearly labeled as general awareness.
- Avoid prescriptive language (e.g. no “treatment”); prefer neutral phrasing such as “Some people experience skin irritation from contact.”

## Future path

- **Plant recognition** — real vision or hybrid model for plants.
- **Wildlife recognition** — birds, animals, insects.
- **Seasonal hazard alerts** — ticks, pollen, poison ivy, etc., possibly combined with Location Context.
- **Ecological education mode** — deeper explainers, life cycle, habitat.
- **Location-enhanced species disambiguation** — use optional location to narrow or rank species by region.

## README

See repo README for a short note on ecological identification groundwork.
