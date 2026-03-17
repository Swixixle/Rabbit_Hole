# Reading-Assist Mobile Integration v30 — Active Prompt Selector

**Status:** Implemented  
**Depends on:** v1–v29 (through prompt mount plans)

---

## 1. Purpose

v30 introduces a **single app-facing selector layer** that converts the reading-assist pipeline output into one focused prompt payload for the mobile reader.

This layer bridges:

```
prompt mount plans + prompt surface candidates + prompt presentation records
```

to later:

```
reader screen consumption
```

This step does **not** render UI yet. It only means:

> Given a focused sentence id and the current reading-assist summary, the app can deterministically ask for the one active prompt that should be shown for that sentence.

This is an **adapter / selector layer**, not a UI layer. No component work, no visual styling, no mounting or rendering yet.

---

## 2. Why selectors after mount plans

The stack order is intentional:

```
… → Prompt Surface Candidates
→ Prompt Mount Plans
→ Active Prompt Selector (app-facing)
```

Selectors are derived **only** from the existing reading path summary (and thus from mount plans). They introduce no new reducer state. One active prompt can be selected per sentence (or for the focused sentence). Read-only and deterministic.

---

## 3. Model

**ReadingAssistActivePrompt**: app-facing payload with sentenceId, anchorId, signalId, bundleId, crossLinkId, slotId, selectionId, recordId, bindingId, presentationRecordId, surfaceCandidateId, mountPlanId, title, body, actionKey, posture, readiness, placement, affordance, priority, mountStatus, mountTrigger, expansionMode, urgency. Derived only from a single mount plan; no extra semantics; no UI component props beyond deterministic prompt data.

**ReadingAssistActivePromptSelectionResult**: `{ activePrompt: ReadingAssistActivePrompt | null }`. Kept minimal in v30.

---

## 4. Selectors (read-only)

All live in `apps/mobile/src/utils/readingAssistSelectors.ts`.

- **selectPromptMountPlansForSentence(readingPathSummary, sentenceId)** — returns all mount plans for the sentence in stable order (planIds).
- **selectMountablePromptPlansForSentence(readingPathSummary, sentenceId)** — filters to plans where `mountStatus === 'mountable'` and `readiness === 'eligible'`.
- **selectPrimaryPromptMountPlanForSentence(readingPathSummary, sentenceId)** — returns the single primary plan, or null. Tie-breaking: (1) highest priority (elevated > normal), (2) posture (inline_compare > inline_source > inline_gentle), (3) stable planIds order.
- **selectActivePromptForSentence(readingPathSummary, sentenceId)** — returns `{ activePrompt }` built from the primary mount plan, or `{ activePrompt: null }`.
- **selectActivePromptForFocusedSentence(readingPathSummary)** — uses `lastExaminedSentenceId`; if null/absent returns `{ activePrompt: null }`, otherwise delegates to `selectActivePromptForSentence`. This is the main app-facing selector for the first phone integration.

---

## 5. No reducer changes

v30 is selector-only. The reducer is **not** modified. No new derived state in the reducer. This is an adapter layer on top of the current summary.

---

## 6. Deterministic tie-breaking

When multiple mountable plans exist for a sentence:

1. **Priority:** elevated beats normal.
2. **Posture:** inline_compare > inline_source > inline_gentle.
3. **Stable order:** first by planIds order in the summary.

This is not semantic ranking; it is deterministic surface tie-breaking.

---

## 7. What is deferred

v30 does **not** add:

- React Native or SwiftUI prompt card component
- Rendered prompt UI
- Persistence or UI state manager redesign
- AI-generated explanations or semantics beyond deterministic prompt selection

---

## 8. Future use

Active prompt selectors prepare the system for:

- Reader screen integration
- Prompt card mounting
- Sentence-level app consumption
- Calm one-prompt-at-a-time reading assistance

---

## 9. Success criteria (met when)

- Engine remains unchanged.
- `readingAssistSelectors.ts` provides an app-facing selector API.
- The app can ask for one active prompt for a sentence or for the focused sentence.
- Tie-breaking is explicit and stable.
- All tests pass.
- No UI changes yet.
