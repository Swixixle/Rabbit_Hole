# Reading-Assist Groundwork v11 — Verification-Aware Reading Paths

**Status:** Implemented  
**Depends on:** v1–v10 (block focus through dwell and backtrack heuristics)

---

## 1. Purpose

Reading Assist now has focus state, sentence anchoring, progression, focus-follow scrolling, inline steering, an event spine, session aggregation, and dwell/backtrack heuristics. The next step is to derive a **verification-aware reading path** from that infrastructure.

The goal is **not** to verify truth yet. The goal is to record **what the user actually examined** in a way that future verification, disagreement analysis, transcript sync, and anti-hallucination tooling can use.

This step creates a bridge from:

- raw interaction → session summary → heuristic summary  

to:

- **examined reading path**

This is still **infrastructure only**. There are **no user-visible UI changes**.

---

## 2. Why reading-path summary now

With the event spine, session summary, and heuristic summary in place, we can derive a single **reading path summary** that answers:

- Which blocks were actually examined  
- Which sentences were actually examined  
- How often (focus counts)  
- With how much estimated dwell  
- What progression relationships occurred (progressed to / from)

Verification-aware reading paths remain **derived**, **observational**, and **non-controlling**. They do not alter focus behavior, scrolling, progression, UI state, or reading modes. This layer describes what was meaningfully examined; it does not decide what is true yet.

---

## 3. Event stream, session summary, heuristic summary, and reading-path summary

- **Event stream:** Each focus action emits one event (source of truth).  
- **Session summary (v9):** Accumulated session metadata (startedAt, endedAt, ids, counts).  
- **Heuristic summary (v10):** Derived dwell and backtrack (totals, per-block/per-sentence dwell, backtrack count, last progress direction).  
- **Reading path summary (v11):** Per-block and per-sentence examined records (firstSeenAt, lastSeenAt, estimatedDwellMs, focusCount, progressedToCount, progressedFromCount), with blocks listing their examined sentence ids and last-examined block/sentence.

The reading path reducer takes the **current event** and the **updated heuristic state** (after reducing the same event) so that dwell can be mirrored from the heuristic summary into each block/sentence record.

---

## 4. Examined block model

On `block_focus_set` with non-null `blockId`:

- Add block id to `examinedBlockIds` if new.  
- Create or update `blocks[blockId]`: increment `focusCount`, set `firstSeenAt` if null, set `lastSeenAt` to event timestamp.  
- Set `lastExaminedBlockId` to blockId.  
- `estimatedDwellMs` is always mirrored from `heuristicSummary.dwellByBlockId[blockId]` (and from the heuristic state passed into the reducer).

---

## 5. Examined sentence model

On `sentence_focus_set` with non-null `sentenceId`:

- Add sentence id to `examinedSentenceIds` if new.  
- Create or update `sentences[sentenceId]`: increment `focusCount`, set `firstSeenAt` if null, set `lastSeenAt` to event timestamp, set `blockId` from event when provided.  
- If `event.blockId` is non-null, ensure the block exists (create if missing) and that its `examinedSentenceIds` includes this sentenceId.  
- Set `lastExaminedSentenceId` and `lastExaminedBlockId` accordingly.  
- `estimatedDwellMs` is mirrored from `heuristicSummary.dwellBySentenceId[sentenceId]`.

---

## 6. Progression relationship model

For `sentence_progress_next` and `sentence_progress_previous`:

- **Destination sentence** (event.sentenceId): create sentence record if missing, then increment `progressedToCount`.  
- **Prior sentence** (prev.lastExaminedSentenceId, if non-null and different from event.sentenceId): if a record exists, increment `progressedFromCount`.  
- Update `lastExaminedSentenceId` and `lastExaminedBlockId` from the event.

Behavior is conservative and event-driven; no hidden transitions are inferred.

---

## 7. Dwell mirroring model

Dwell is **not** recomputed in the reading-path reducer. The reducer receives the **updated heuristic state** (after reducing the current event). For every block and sentence in the reading path summary, `estimatedDwellMs` is set from:

- `heuristicSummary.dwellByBlockId[blockId] ?? 0`  
- `heuristicSummary.dwellBySentenceId[sentenceId] ?? 0`

This keeps dwell sourced from a single place (the heuristic layer).

---

## 8. Why verification labels are deferred

This step does **not** add:

- Verified / inferred / unsupported labels  
- Disagreement flags  
- Hallucination scoring  
- Claim or source linkage  
- Contradiction detection  
- User-visible reading path UI  

It only creates the reading-path substrate. Verification and disagreement layers will consume this summary later.

---

## 9. Future compatibility

The reading path summary is the base for:

- **Verification-aware interfaces:** Highlight or gate by “what the user actually looked at.”  
- **Disagreement exploration:** Surface disagreement only for examined content.  
- **“Show me what I actually looked at”:** Replay or summarize the examined path.  
- **Anti-hallucination workflows:** Distinguish surfaced text from examined text.  
- **Transcript/audio sync:** Align playback to examined sentence sequence and dwell.  

All of these can consume the v11 reading path summary without changing its contract.

---

## 10. Success criteria (met when)

- All existing reading-assist behavior still works.  
- Session and heuristic aggregation still work as before.  
- Reading path summary updates deterministically from emitted events.  
- Examined blocks/sentences and progression relations are captured.  
- Dwell values mirror the heuristic summary.  
- No user-visible UI changes.  
- `resetReadingPathSummary()`, `resetSessionSummary()`, and `resetHeuristicSummary()` are independent.  
- Tests pass.
