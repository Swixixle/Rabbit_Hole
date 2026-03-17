# Cursor instruction: next-step recommendation

This file defines **three control documents** for the development loop:

- **docs/system-architecture-v1.md** → what exists (canonical architecture, dependencies, pipelines)
- **docs/cursor-instruction-next-step.md** → how to choose the next technical step (this file)
- **docs/viral-capabilities-roadmap-v1.md** → product adoption roadmap (viral capabilities and implementation prompts)

---

## 1. One-time setup: tell Cursor about the control documents

Paste this into Cursor **once** so it knows the repo has these references:

```
A reusable prompt for next-step recommendations has been added:

docs/cursor-instruction-next-step.md

When asked for the next development recommendation, read and follow the instructions in that file.

The architecture reference remains:

docs/system-architecture-v1.md

Rules:

1. docs/system-architecture-v1.md is the canonical architecture.
2. docs/cursor-instruction-next-step.md is the canonical next-step prompt.
3. Do not modify these documents unless explicitly instructed.
4. When recommending work, follow the dependency order in the architecture spec.
```

---

## 2. Copy-paste this when you want the next move

```
A canonical system architecture document has been added:

docs/system-architecture-v1.md

Before recommending or implementing any future changes, read this file and treat it as the authoritative description of the Rabbit Hole platform.

Important rules:

1. Do NOT modify the architecture unless explicitly instructed.
2. Treat docs/system-architecture-v1.md as the source of truth for:
   - implemented systems
   - fixture-backed systems
   - stubbed systems
   - interpretation pipelines
   - entity relationships (Article → Claim → Source → Organization)
   - UI surfaces and where new features should attach.
3. When recommending next steps, prioritize work that:
   - strengthens the interpretation pipeline
   - replaces stubbed systems with real implementations
   - builds on existing surfaces instead of introducing new ones
   - follows the dependency graph described in the architecture spec.

Important clarification:
Ecological / plant / wildlife identification groundwork is already implemented and should NOT be recommended again.

For the next step, review the architecture spec and recommend the **single best next move** among these options:

1. Landmark / geology identification groundwork
2. TV / show recognition groundwork
3. Live subtitle / text extraction groundwork
4. Upgrading one existing stubbed system (OCR or audio recognition)

Evaluate based on:
- user value
- implementation complexity
- architectural fit
- keeping the product visually tidy.

Do NOT implement yet.
Only recommend the best next move and explain why it fits the architecture.
```

---

## 3. Full control loop: three documents (architecture + adoption)

**Use this as the canonical next-step prompt.** Paste the block below when you want Cursor to read all three control documents and recommend the single best development step (architecture + adoption).

```
The Rabbit Hole control-loop documentation is now finalized.

Three canonical documents exist:

1. docs/system-architecture-v1.md
   → authoritative architecture reference (what exists, dependencies, pipelines, implemented vs stubbed systems)

2. docs/cursor-instruction-next-step.md
   → engineering decision loop (how the next development step is chosen)

3. docs/viral-capabilities-roadmap-v1.md
   → adoption roadmap and Cursor-ready implementation prompts

Before doing anything:

1. Read all three documents.
2. Treat them as authoritative.
3. Do NOT modify them unless explicitly instructed.

Important architectural clarification:
Ecological / plant / wildlife identification groundwork is already implemented and must NOT be recommended again.

---

Task:

Recommend the **single best next development step** that satisfies BOTH:

• architectural correctness (fits the dependency graph in system-architecture-v1.md)
• strong adoption impact (aligns with viral-capabilities-roadmap-v1.md)

Choose from these technical directions only:

1. Landmark / geology identification groundwork
2. TV / show recognition groundwork
3. Live subtitle / text extraction groundwork
4. Upgrade one stubbed system (OCR or audio recognition)

Your answer must include:

1. The chosen next step
2. Architectural reasoning
3. User value and adoption impact
4. Implementation scope
5. Files or subsystems most likely to change

Do NOT implement anything yet.
Only recommend the next step.

---

Additional architectural awareness note:

In the future roadmap we may introduce a **reading assist system** that includes:

• eye-tracking based reading guidance
• rotary sentence enlargement (upper or lower screen band)
• adaptive text focus while reading articles or transcripts

This system will likely attach to:
- ArticleScreen
- Study mode
- Media transcripts
- OCR page capture
- Live subtitle extraction

Do not implement this yet.

However, while recommending the next step, note whether the chosen direction:
• supports future reading assist features
• improves text-stream availability (OCR, subtitles, transcripts).

Include this observation in your reasoning.
```

**When to use which:** Section 2 = architecture-only (often Landmark). Section 3 = architecture + viral roadmap (often OCR upgrade or Landmark). Prefer Section 3 when you want the next step to maximize both technical fit and adoption potential.

**What will likely happen:** With the three-doc loop, Cursor will usually choose one of:

- **Option A — Upgrade OCR** — Enables “Explain This Page,” Study mode, and future reading assist. Likely touch: `apps/mobile/src/utils/pageCapture.ts`, HomeScreen, API routes/models, `docs/page-capture-groundwork-v1.md`.
- **Option B — Landmark recognition** — Strengthens “Point-at-the-World Lens.” Likely touch: API models/fixtures, ImageFocusScreen, LiveLensScreen, new `docs/landmark-recognition-groundwork-v1.md`.

**Reading-assist precursor:** OCR or live subtitle extraction creates the text streams (pages, transcripts, subtitles) that a future reading-assist system (eye-tracking, rotary sentence enlargement) would enhance. Schedule reading assist **after** those capabilities.

**Stage:** Architecture phase is complete. Rabbit Hole is in the **capability phase**: improvements come from better recognition, interpretation, and explanation — not new architecture.

---

## Why this version (Section 2)

- **Ecological is explicit:** "already implemented and should NOT be recommended again" removes any ambiguity.
- **Options list is reduced:** Only the four valid next moves (ecological removed).
- **Dependency order:** "Follows the dependency graph" is spelled out so Cursor respects the spec’s order.
- **Single output:** "Only recommend" + "Do NOT implement" keeps the answer to one next move and an explanation.

## Likely recommendation

Given the architecture, Cursor will likely recommend **Landmark / geology identification groundwork** (reuses lens pipeline + location context, minimal new UI, extends ecological naturally).

## Development arc (after that)

Landmark → TV/show recognition → upgrade OCR → upgrade audio recognition turns the current scaffold into a real-world intelligence engine.
