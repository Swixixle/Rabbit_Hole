# Reading-Assist Groundwork v23 — Prompt Tone Slots

**Status:** Implemented  
**Depends on:** v1–v22 (through curiosity signals)

---

## 1. Purpose

v23 introduces a **presentation-neutral prompt preparation layer** derived from existing curiosity signals. This layer is the bridge between curiosity signals and later actual user-facing microcopy / prompt rendering.

A prompt tone slot does **not** mean the system is generating text. It only means:

> Based on already-existing curiosity signals, this sentence has a stable, structured prompt posture that later UI/copy systems can render in a calm, human way.

This is a **slot layer**, not a language layer. No final copy, no natural language generation, no semantic interpretation, no UI surface yet.

---

## 2. Why slots after curiosity signals

The stack order is intentional:

```
Sentence Anchor
→ Placeholder Registries
→ Cross-Link Slots
→ Verification Bundle Skeletons
→ Verification Bundle Indexes
→ Curiosity Signals
→ Prompt Tone Slots
```

Slots are derived **only** from existing curiosity signals. One slot per curiosity signal; slot kinds, tone family, and intensity are determined purely from signal shape (e.g. presence of `source_available`, `disagreement_present`).

---

## 3. Model

**ReadingAssistPromptToneSlotKind** (union):

- `gentle_nudge` — sentence has a curiosity signal, eligible for low-pressure prompt posture
- `curious_invite` — eligible for exploration-oriented prompt posture
- `source_peek` — signal includes `source_available`
- `soft_compare` — signal includes `disagreement_present`

**ReadingAssistPromptToneFamily** (union):

- `neutral_warm` — baseline human-friendly posture
- `calm` — lower-intensity, reassurance-friendly (v23: when disagreement present)
- `playful_light` — reserved for future use; not emitted in v23

**ReadingAssistPromptToneIntensity** (union):

- `low` — baseline gentle prompting
- `medium` — when disagreement present and slot includes `soft_compare`

**ReadingAssistPromptToneSlot** has:

- `id`, `sentenceId`, `anchorId`, `signalId`, `bundleId`, `crossLinkId`
- `slotKinds: ReadingAssistPromptToneSlotKind[]`
- `toneFamily: ReadingAssistPromptToneFamily`
- `intensity: ReadingAssistPromptToneIntensity`
- `createdAt` (string)

**ReadingAssistPromptToneSlotSummary** has `slots` (record by id) and `slotIds`.

---

## 4. One slot per curiosity signal

- At most **one prompt tone slot per curiosity signal** (id: `ra-prompt-tone-slot|<signalId>`).
- When disagreement is added later (e.g. on revisit), the same slot is updated additively: `slotKinds` gains `soft_compare`, `toneFamily` may upgrade to `calm`, `intensity` may upgrade to `medium`. No regression: never change calm back to neutral_warm or medium back to low.

---

## 5. Helpers

- **createReadingAssistPromptToneSlotId(signalId)** — returns `ra-prompt-tone-slot|<signalId>`.
- **buildReadingAssistPromptToneSlotKinds(signal)** — deterministic order: gentle_nudge, curious_invite, source_peek (when source_available), soft_compare (when disagreement_present).
- **deriveReadingAssistPromptToneFamily(signal)** — calm when disagreement_present, else neutral_warm. (playful_light not used in v23.)
- **deriveReadingAssistPromptToneIntensity(signal)** — medium when disagreement_present, else low.
- **ensureReadingAssistPromptToneSlot(summary, slot)** — insert if missing; do not duplicate slotIds; preserve createdAt; allow additive slotKinds and conservative upgrades (toneFamily, intensity) when disagreement appears; never regress.
- **ensurePromptToneSlotForSignalId(promptToneSlotSummary, curiositySignalSummary, signalId)** — find signal by id; if missing return summary unchanged; else build slot from signal and upsert. Operates from signal layer only.

---

## 6. Reducer integration

The reading-assist reducer carries `promptToneSlotSummary` and initializes it from the default reading path summary. After each place where `curiositySignalSummary` is updated for a sentence-local event (same four sites as v20/v21/v22), the reducer calls `ensurePromptToneSlotForSignalId(promptToneSlotSummary, curiositySignalSummary, createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkId)))` and assigns the result back. The final reading path summary includes `promptToneSlotSummary`. No global scan; only the relevant signal id is used.

---

## 7. What is deferred

v23 does **not** add:

- User-facing microcopy or prompt strings
- AI-generated explanations
- Semantic claim/source pairing or verification scoring
- Persistence or UI component changes

---

## 8. Future use

Prompt tone slots prepare the system for:

- Prompt selection by slot kind / tone family / intensity
- Calm reading overlays
- Comfort-oriented dialogue rendering
- Later copy libraries mapped onto stable slots
- Playful variants (playful_light) added without changing engine logic

---

## 9. Success criteria (met when)

- Reading path summary includes `promptToneSlotSummary` with default empty slots/slotIds.
- Eligible sentence-local curiosity signals automatically materialize one prompt tone slot each.
- Repeated reduction remains idempotent (no duplicate slots).
- Disagreement added later upgrades the same slot with soft_compare, toneFamily calm, intensity medium.
- All behavior remains observational only; no UI changes; no user-facing language yet.
- All tests pass.
