# Reading-Assist Groundwork v7 — Inline Sentence Steering Targets

**Status:** Implemented  
**Depends on:** v1–v6 (block focus through focus follow scrolling)

---

## 1. Purpose

v6 made the article follow focus at the block level.

v7 improves the **inline sentence interaction surface** so the focused sentence and its immediate neighbors are easier to acquire and steer through, without a new mode or extra UI.

Stack:

```
Focused Block
→ Focused Sentence
→ Local Enlargement Surface
→ Guided Sentence Progression
→ Focus Follow Scrolling
→ Inline Sentence Steering Targets
```

This is the final manual interaction layer before future gaze-driven or adaptive steering.

---

## 2. Why inline steering now

Sentence focus (v3), progression (v5), and the band (v4) already exist; v6 added follow scrolling. The sentence layer was still relatively thin for interaction. v7 adds a **deliberate inline steering surface** so that inside the paragraph the user sees a clear “previous ← current → next” and can tap neighbors without relying only on the band.

---

## 3. Relationship to v3–v6

- Inline steering stays **subordinate to sentence focus inside the focused block**.
- No steering outside the focused block; no sentence controls for non-focused blocks; no global navigator; no new mode; no detached overlay.
- Mode remains `'off' | 'focus_block'`.
- Tap behavior is unchanged: tap previous/next focuses them, tap current clears sentence focus, tap any other sentence focuses it. v7 only refines **visual** affordances for the immediate neighbors.

---

## 4. Current vs adjacent sentence treatment

Inside the focused block when the sentence layer is active:

- **Current sentence:** Existing emphasis (e.g. background), slightly legible as the active target.
- **Adjacent sentences** (previous and next only): Very subtle extra treatment (e.g. lighter background tint) so they read as the natural steering targets.
- **Other sentences:** Unchanged (or existing sentence-layer behavior; e.g. deemphasized when any sentence is focused).

No bright colors, no inline icons, no boxed chips.

---

## 5. Why no overlay or global controls

The spec requires an **inline interaction refinement**, not a new product surface. No floating handles, tooltips, popovers, extra bars, sentence list, or minimap. The user should still feel like they are reading the article; the paragraph itself becomes a better steering surface.

---

## 6. Band vs inline steering

- **Inline sentence layer** = local, tactile steering inside the paragraph (tap any sentence; neighbors are visually suggested).
- **Sentence band** = enlarged reading surface + explicit Previous/Next.

The band remains the explicit control surface; the paragraph becomes a better steering surface. They are coordinated, not redundant.

---

## 7. Study unchanged

No changes to StudySheet. Study remains unchanged.

---

## 8. Out of scope (v7)

- Eye tracking  
- Automatic sentence prediction  
- Gesture swiping  
- Cross-block stepping  
- Global sentence navigator  
- Study/transcript/OCR/subtitle inline steering  
- Persistence  
- Adaptive highlighting  
- Word-level steering  

These belong to later phases.

---

## 9. Future compatibility

Inline steering targets are the base for:

- **Exact sentence tracking** (measure and scroll to sentence).
- **Eye tracking input** (drive which sentence is focused).
- **Adaptive sentence steering** (combine gaze with inline and band).

All can build on the existing adjacency helpers and styling without changing the v7 contract.

---

## 10. Success criteria (met when)

- Current sentence remains clear and readable.  
- Adjacent sentences are subtly legible as steering targets.  
- Inline sentence tapping still works; band controls remain intact.  
- No new UI clutter; no new mode; Study unchanged.  
- All tests pass.
