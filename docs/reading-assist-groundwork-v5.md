# Reading-Assist Groundwork v5 — Guided Sentence Progression

**Status:** Implemented  
**Depends on:** v1 (block focus), v2 (sentence anchoring), v3 (sentence focus surface), v4 (local enlargement surface)

---

## 1. Purpose

v4 added a local enlargement surface for the focused sentence.

v5 adds **guided progression** through sentence anchors inside the focused block. Sentence focus becomes a **navigable reading path** without eye tracking, autoplay, or a new mode.

Stack:

```
Focused Block
→ Focused Sentence
→ Local Enlargement Surface
→ Guided Sentence Progression
```

This is the last major manual-control layer before future gaze-driven or adaptive progression.

---

## 2. Why progression now

The enlargement band (v4) gave a clear target; the next step is to move that target within the block. Progression is manual and local, so we validate the within-block navigation model before adding eye tracking or auto-advance.

---

## 3. Relationship to v1–v4

- Progression is **strictly subordinate** to block focus and sentence anchors.
- No progression without a focused block; no progression without sentence anchors for that block.
- No new mode; no autoplay; no cross-block progression; no separate reader surface.
- Mode remains `'off' | 'focus_block'`.

---

## 4. Progression rules

- **Within-block only:** Previous/Next move only within the currently focused block’s anchors.
- **Manual only:** User taps Previous or Next; no auto-advance, no timed progression.
- **Boundaries:** Previous disabled at first sentence; Next disabled at last sentence.
- **Clearing:** Changing focused block clears sentence focus (existing v2/v3 behavior), so progression context resets naturally.
- **User-driven focus:** We do not auto-focus the first sentence when a block is focused; sentence focus stays user-driven.

---

## 5. No autoplay

We do **not** implement:

- Auto-advance after tap  
- Timed progression  
- Scroll-follow  
- Sentence snapping across blocks  
- Persistence of sentence position  

This is **manual guided progression only**.

---

## 6. Study unchanged

No UI or behavior changes on StudySheet. Study remains anchor-compatible only; no sentence band, no progression controls.

---

## 7. Out of scope (v5)

- Eye tracking  
- Auto-advance or adaptive progression  
- Subtitle / OCR / transcript progression  
- Swipe gestures  
- Persistence  
- Global reading controls  
- Cross-block sentence stepping  

These belong to later phases.

---

## 8. Future compatibility

Guided progression is the intended base for:

- **Eye tracking input** (drive which sentence is focused and thus enlarged).  
- **Adaptive sentence steering** (e.g. advance on gaze or intent).  
- **Full reading-assist intelligence** (combine gaze + enlargement + progression).

All can build on the existing progression helpers and band controls without changing the v5 contract.

---

## 9. Success criteria (met when)

- Focused sentence band still renders correctly.  
- Previous / Next work inside the focused block.  
- Controls disable correctly at first/last sentence.  
- Sentence text fidelity preserved (same `getFocusedSentenceText` path).  
- No new mode; UI remains tidy; Study unchanged.  
- All tests pass.
