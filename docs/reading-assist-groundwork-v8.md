# Reading-Assist Groundwork v8 — Focus Event Spine

**Status:** Implemented  
**Depends on:** v1–v7 (block focus through inline steering)

---

## 1. Purpose

Reading Assist now supports block focus, sentence focus, inline steering, sentence band, progression, and focus-follow scrolling. These actions were previously only state mutations.

v8 adds a **Focus Event Spine**: every reading action can emit a structured event describing what happened. This enables:

- Debugging reading behavior  
- Replaying user reading paths  
- Analytics for assist features  
- Future integration with eye-tracking  
- Future synchronization with transcript/audio systems  

Stack:

```
Reading Assist
→ Block Focus
→ Sentence Focus
→ Sentence Progression
→ Focus Follow Scrolling
→ Inline Steering
→ Focus Event Spine
```

This is **infrastructure only**. There are **no UI changes**.

---

## 2. Why focus events now

With the manual steering layer (v1–v7) in place, the next step is to make actions observable so future sensors and automation can consume them without changing UI again. Events are optional and observational; behavior is unchanged.

---

## 3. Event schema

**Event type union:**

- `block_focus_set` — a block was focused  
- `block_focus_cleared` — block focus was cleared  
- `sentence_focus_set` — a sentence was focused  
- `sentence_focus_cleared` — sentence focus was cleared  
- `sentence_progress_next` — user moved to next sentence (e.g. band Next)  
- `sentence_progress_previous` — user moved to previous sentence (e.g. band Previous)  

**Event shape:**

- `type` — one of the above  
- `timestamp` — number (e.g. `Date.now()`)  
- `sourceType` — `'article' | 'study' | 'transcript' | 'ocr' | null`  
- `blockId` — string or null  
- `sentenceId` — string or null  

---

## 4. How events enable future features

- **Analytics:** Subscribe to the callback and send events to your analytics backend.  
- **Replay:** Store events and replay a reading session (e.g. for debugging or research).  
- **Eye tracking:** Later, compare gaze targets with focus events.  
- **Transcript sync:** Drive or validate transcript position from focus events.  

Events do not trigger behavior; they describe what already happened.

---

## 5. Example event flow

1. User turns on Focus block → (no event; mode change only)  
2. User taps block → `block_focus_set` (blockId, sourceType: article)  
3. User taps a sentence → `sentence_focus_set` (blockId, sentenceId)  
4. User taps band Next → `sentence_progress_next` then context emits `sentence_focus_set`  
5. User taps same sentence → `sentence_focus_cleared`  
6. User taps elsewhere / clears block → `block_focus_cleared`  

---

## 6. Out of scope (v8)

- Analytics dashboards  
- Event persistence or session recording  
- Reading heatmaps  
- Adaptive reading algorithms  
- Eye-tracking or transcript integration  

Those come in later phases.

---

## 7. Success criteria (met when)

- All existing reading-assist behavior still works.  
- Focus actions emit structured events when a callback is provided.  
- Events are optional and safe (no callback → no-op).  
- No UI changes.  
- Tests pass.
