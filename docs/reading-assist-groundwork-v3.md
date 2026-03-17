# Reading-Assist Groundwork v3 — Sentence Focus Surface

**Status:** Implemented  
**Depends on:** v1 (block focus), v2 (sentence anchoring)

---

## 1. Purpose

v1 established **block focus**. v2 established **sentence anchors** (data only).

v3 introduces a **minimal sentence focus surface** so the system can visibly and interactively target a sentence inside a focused block. This is the first user-visible sentence-layer behavior, kept restrained.

Goal: prove the hierarchy works

```
Mode
→ Focused Block
→ Focused Sentence
```

without damaging layout simplicity.

---

## 2. Why sentence focus now

Sentence anchoring (v2) gave stable ids and offsets; the next step is to expose that layer in the UI so we can later add rotary sentence enlargement and eye tracking on a known, working surface. Doing it now keeps the architecture clear: block remains primary, sentence is a fine-grained assist inside the block.

---

## 3. Block vs sentence relationship

- Sentence focus is **nested inside** block focus.
- A sentence can only be focused if its parent block is focused.
- Sentence focus cannot exist independently.
- Block focus remains the dominant reading unit.
- There is **no** separate “sentence mode”; `ReadingAssistMode` stays `'off' | 'focus_block'`.

---

## 4. Rendering strategy

- **ArticleScreen + MicroParagraphCard only.** No sentence focus UI on StudySheet, transcript, or OCR.
- When the block is **not** focused, or reading assist is off: block text renders as before (single block of text).
- When the block **is** focused and mode is `focus_block` and sentence anchors exist: block text is rendered as sentence-segmented **inline** spans using anchor `startOffset`/`endOffset` against the **trimmed** block text. No re-tokenization; text fidelity is preserved.
- Tapping a sentence sets `focusedSentenceId`; tapping the same sentence again clears it.
- Focused sentence gets a light emphasis (e.g. subtle background); other sentences in the same block get slight deemphasis (e.g. reduced opacity), remaining readable.

---

## 5. Study unchanged

StudySheet continues to compute sentence anchors for future use but has **no** sentence focus UI. Study remains compatible at the data level only.

---

## 6. Out of scope (v3)

- Rotary sentence enlargement  
- Eye tracking  
- Automatic sentence progression  
- Subtitle sentence tracking  
- Persistence or scroll follow  
- Sentence-level controls outside the text body  
- New reading modes  

These belong to later phases.

---

## 7. Future compatibility

The sentence focus surface is the intended base for:

- **Rotary sentence enlargement** (enlarge the focused sentence).
- **Eye tracking** (drive focus from gaze).

Both can be added on top of the existing `focusedSentenceId` and anchor data without changing the v3 contract.

---

## 8. Success criteria (met when)

- Article reading still feels clean.  
- Sentence focus only appears inside a focused block.  
- Sentence tap sets/clears focus correctly.  
- Sentence focus is visually helpful without clutter.  
- Study surfaces are unchanged.  
- Existing reading-assist behavior still works.  
- All tests pass.
