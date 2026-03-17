# Reading-Assist Groundwork v10 — Dwell and Backtrack Heuristics

**Status:** Implemented  
**Depends on:** v1–v9 (block focus through focus session aggregator)

---

## 1. Purpose

v9 added a focus session aggregator that derives a session summary from the event spine. The next step is to derive the first **behavioral heuristics** from that event/session layer:

1. **Dwell estimation** — how long the user stayed on a focused sentence or block  
2. **Backtrack detection** — whether the user moved backward through a sentence path (direction reversal)

This is the first step where the system begins to **infer reading behavior**, not just record interaction. It prepares the system for:

- Future adaptive reading assist  
- Transcript / audio sync heuristics  
- Eye-tracking comparison  
- Verification-aware “what the user actually examined” logic  
- Disagreement / ambiguity examination flows later  

This step is **infrastructure only**. There are **no user-visible UI changes**.

---

## 2. Why heuristics now

With the event spine and session aggregation in place, we can derive lightweight behavioral summaries without persisting raw events. Heuristics remain **derived**, **lightweight**, and **non-controlling**: they summarize behavior but do not alter focus, scrolling, progression, UI state, or reading modes. No adaptive behavior yet.

---

## 3. Event stream, session summary, and heuristic summary

- **Event stream:** Each focus action emits one event (source of truth).  
- **Session summary (v9):** Accumulated session metadata (startedAt, endedAt, ids, counts).  
- **Heuristic summary (v10):** Derived dwell and backtrack summary (totals, per-block/per-sentence dwell, backtrack count, last progress direction).  

All three layers are in-memory and observational. The heuristic summary is updated by reducing each emitted event into an internal **heuristic state** (summary + active block/sentence ids + last event timestamp), then exposing only the summary.

---

## 4. Dwell estimation model

Dwell is **event-gap estimation**, not continuous measurement:

- When the next event has a **later** timestamp than the previous one, the elapsed time is attributed to the **currently active** block and/or sentence (from the previous state).  
- That elapsed time is added to `totalBlockDwellMs`, `totalSentenceDwellMs`, and to `dwellByBlockId` / `dwellBySentenceId` for the active ids.  
- Negative or zero deltas are ignored. Missing or invalid timestamps result in no dwell added.  
- Active block/sentence are updated from focus events (`block_focus_set`, `block_focus_cleared`, `sentence_focus_set`, `sentence_focus_cleared`). Progression events do **not** set active ids; they only update direction and backtrack count.

This is the correct minimal model for this phase.

---

## 5. Backtrack detection model

Backtracking is **direction reversal**:

- If the previous progress direction was `next` and the new event is `sentence_progress_previous`, increment `backtrackCount`.  
- If the previous progress direction was `previous` and the new event is `sentence_progress_next`, increment `backtrackCount`.  
- Otherwise do not increment.  

So “backtrack” means a change of direction (next→previous or previous→next), not merely any use of Previous. `lastProgressDirection` is updated on each progression event.

---

## 6. Observational only

Heuristics summarize behavior; they do **not**:

- Change focus behavior  
- Change scrolling or progression  
- Change UI state or reading modes  
- Trigger adaptive feedback  
- Gate verification or disagreement flows  

Persistence, analytics upload, behavioral scoring, and adaptive reading feedback are **deferred**.

---

## 7. Future compatibility

This layer prepares the system for:

- **Verification-aware reading paths:** Use dwell and backtrack to reason about “what the user actually examined.”  
- **Eye-tracking comparison:** Compare gaze dwell and backtrack to heuristic-derived values.  
- **Transcript/audio sync:** Use dwell and sentence path to align playback or captions.  
- **Disagreement/ambiguity analysis:** Use backtrack and dwell to surface confusion or re-reading.  
- **Adaptive reading assist:** Later layers can consume heuristics to adjust pacing or emphasis.  

All of this can build on the v10 heuristic summary without changing its contract.

---

## 8. Success criteria (met when)

- All existing reading-assist behavior still works.  
- Focus events and session aggregation still work as before.  
- Heuristic summary updates correctly from emitted events.  
- Dwell and backtrack values are derived deterministically.  
- No user-visible UI changes.  
- `resetHeuristicSummary()` and `resetSessionSummary()` are independent.  
- Tests pass.
