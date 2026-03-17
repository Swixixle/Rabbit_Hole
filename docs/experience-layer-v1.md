# Experience Layer v1

Short note on the experience layer: system path and lifecycle as guided reading modes.

## Purpose

Turn the article from a static reading surface into a **guided system view** so the reader can answer:

- How does this unfold?
- Where does the system break?
- What are the pressure points?

Experience sits **on top of** the epistemic layer (confidence/support); it does not replace it.

## Data model

- **ExperienceStep:** id, label, shortTitle, description?, relatedBlockIds?, relatedClaimIds?, kind? (stage | failure_point | decision | handoff).
- **ArticleExperience:** mode ('lifecycle' | 'system_path'), steps: ExperienceStep[].
- **Article:** optional `experience?: ArticleExperience`.

**relatedBlockIds** = content-block indices as strings (0 = first block after identification). Used to scroll to and highlight the relevant part of the article when a step is tapped.

## Modes

1. **Read** — Default narrative: identification → summary → context → evidence/trace → questions.
2. **Follow system** — Horizontal stepper of system-path steps; tap step scrolls to related block(s).
3. **Lifecycle** — (v1 fixtures use system_path only; lifecycle mode uses same stepper UI when we add lifecycle data.)

## Reader UX

- When the article has `experience`, a **View** section appears near the top: **Read** | **Follow system**.
- In "Follow system", **ExperienceStepper** shows steps; tap scrolls to the first related block and highlights the step.
- Confidence/support cues remain on claims; no extra animation or graph.

## Fixtures

- **article-coffee:** system_path steps (Paper shell → Plastic lining → Beverage use → Waste stream → Recycling failure point) with relatedBlockIds and relatedClaimIds.
- **article-uhaul:** system_path steps (Material → Product use → Reuse → Wear → End-of-life) with linkage.

## What we do not do (v1)

- Heavy animation, freeform graphs, editable maps, admin tooling.
- Auto-generated diagrams, story voiceover, simulation engine.

## API

- **GET /v1/articles/:id** and **GET /v1/articles/by-node/:id** include `experience` when present (from fixtures).
- No separate experience endpoint; experience is part of the article payload.

## Next

- **Lifecycle** mode with distinct step labels/copy when we add lifecycle fixtures.
- **Share surface** (distribution) as a parallel feature.
- **Market layer** after experience and sharing.
