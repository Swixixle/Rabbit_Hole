# Reading-Assist Groundwork v4 — Rotary Sentence Enlargement Surface

**Status:** Implemented  
**Depends on:** v1 (block focus), v2 (sentence anchoring), v3 (sentence focus surface)

---

## 1. Purpose

v3 made it possible to focus a sentence inside a focused article block.

v4 adds a **minimal enlargement surface** for the focused sentence so users can read the current sentence with reduced friction and higher clarity. This is the first assistive magnification layer, kept lightweight and subordinate to the article flow.

Goal: prove the stack works

```
Focused Block
→ Focused Sentence
→ Enlarged Sentence Surface
```

without a separate reader mode.

---

## 2. Why enlargement now

Sentence focus (v3) gave a stable target; the next step is to surface that sentence in a clearer, larger band. Doing it now validates the data flow (block text + anchors → focused sentence text) and creates the right bridge for guided progression and eye tracking later.

---

## 3. Relationship to block and sentence focus

- The enlargement surface is **downstream of sentence focus**.
- No enlargement without a focused sentence; no focused sentence without a focused block.
- No separate enlargement mode; no new `ReadingAssistMode` value.
- The article remains the primary reading surface; the band is an assistive layer.

---

## 4. Placement rules

- The enlargement surface is rendered **inside the focused article block**, directly **below** the paragraph text (below `MicroParagraphCard`).
- It appears only when: reading assist mode is `focus_block`, the block is focused, and a sentence is focused.
- If no sentence is focused, the band does not render. Only one band exists at a time (the focused block’s focused sentence).

---

## 5. Why embedded instead of modal/fullscreen

The spec requires a **visually tidy, locally attached** surface: no modal, fullscreen reader, bottom sheet, or floating widget. The enlarged sentence is a **small embedded assistive band** so the article stays primary and layout stays simple.

---

## 6. Data flow

- Use existing sentence anchors and focused sentence state.
- For the focused block: find the focused sentence anchor, reconstruct the exact sentence text from block text using anchor offsets (`getFocusedSentenceText`).
- Do not re-segment; do not infer from rendered spans. Text fidelity is preserved.

---

## 7. Study unchanged

No UI or behavior changes on StudySheet. Study remains compatible at the anchor/model level only; sentence enlargement is not exposed there yet.

---

## 8. Out of scope (v4)

- Eye tracking  
- Automatic sentence progression  
- Dial/rotary gestures or swipe sentence navigation  
- Subtitle synchronization  
- Persistence or dedicated reading-assist screen  
- Study / OCR / transcript sentence enlargement  
- Text-to-speech controls  

These belong to later phases.

---

## 9. Compatibility with future eye tracking

The local enlargement surface is the intended target for:

- **Guided sentence progression** (e.g. advance to next sentence).
- **Eye tracking input** (drive which sentence is focused and thus enlarged).
- **Adaptive reading assist** (combine gaze + enlargement).

All can build on the existing `focusedSentenceId` and `ReadingAssistSentenceBand` without changing the v4 contract.

---

## 10. Success criteria (met when)

- Focused sentence behavior still matches v3.  
- A focused sentence shows an enlarged assistive band below the focused block.  
- The band disappears when focus (sentence or block) or mode is cleared.  
- Article layout stays clean; no new mode; Study unchanged.  
- All tests pass.
