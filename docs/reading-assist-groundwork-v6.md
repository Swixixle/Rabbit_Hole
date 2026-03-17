# Reading-Assist Groundwork v6 — Focus Follow Scrolling

**Status:** Implemented  
**Depends on:** v1–v5 (block focus through guided sentence progression)

---

## 1. Purpose

v5 added manual sentence progression inside the focused block.

v6 makes the reading surface **follow the user’s focus** so the focused block (and sentence band when present) stays in a comfortable viewing zone. This improves the assistive experience without eye tracking, autoplay, or a new mode.

Stack:

```
Focused Block
→ Focused Sentence
→ Local Enlargement Surface
→ Guided Sentence Progression
→ Focus Follow Scrolling
```

This is the last major mechanical assist layer before adaptive or gaze-driven behavior.

---

## 2. Why scroll-follow now

With progression (v5), the user can move through sentences; scroll-follow keeps the focused block and band visible so the experience feels continuous. Introducing it after progression keeps the behavior clearly driven by focus changes.

---

## 3. Block-level follow vs sentence-level follow

- **v6 is block-follow only.** We scroll so the **focused block** (and, when present, the sentence band below it) is in a comfortable zone.
- We do **not** measure or scroll to the exact sentence span. Sentence-level layout and centering are deferred to a later phase.
- When sentence focus changes within the same block, we re-check visibility of the block + band and scroll only if the band would be clipped or too low.

---

## 4. Behavior rules

- Scrolling **only** reacts to the currently focused block/sentence (and mode).
- No autonomous reading mode; no continuous auto-scroll; no scroll when reading assist is off.
- **Keep visible:** if the block (and band) is already comfortably in view, we do nothing. If it’s too high or extends too low, we scroll just enough to bring it into the preferred zone.
- Conservative thresholds and a minimum scroll delta avoid jitter.
- We do not scroll on every render; we react to focus (and relevant layout) changes.

---

## 5. Why sentence-level measurement is deferred

Sentence text is inline; the system does not yet track sentence-level layout coordinates. v6 keeps the contract simple: scroll to the **block**, optionally including an estimated height for the sentence band. Exact sentence tracking, centering, and reading-ruler behavior belong to later phases.

---

## 6. Study unchanged

No changes to StudySheet. Study remains unchanged; no scroll-follow there.

---

## 7. Out of scope (v6)

- Eye tracking  
- Auto-reading mode  
- Exact sentence centering  
- Word-level tracking  
- Cross-block progression  
- Study / transcript / OCR / subtitle scrolling  
- Persistence  
- Configuration UI for scrolling  

These belong to later phases.

---

## 8. Future compatibility

Focus follow scrolling is the base for:

- **Exact sentence tracking** (measure sentence spans, then scroll to sentence).
- **Eye tracking input** (keep the gaze target in view).
- **Adaptive reading assist** (combine scroll-follow with gaze and progression).

All can build on the existing scroll helper and block/sentence state without changing the v6 contract.

---

## 9. Success criteria (met when)

- Focused block is kept comfortably visible during reading-assist use.  
- Sentence progression feels smoother because the surface follows focus.  
- No new UI; article remains the primary surface; no new mode; Study unchanged.  
- All tests pass.
