# Article Assembly Quality Pass — Implementation Report

**Date:** 2025-03-11  
**Scope:** Improve the article so it feels assembled from Rabbit Hole’s structured knowledge model (identification, summary, context, evidence/trace entry, questions) within the mobile v0 slice.

---

## 1. Implementation approach

- **Audit:** Articles were a flat list of blocks with no section identity; no identification or summary block; Verify and Trace were two links in one block; questions were generic and shared across articles. No block typing or section labels.
- **Canonical order:** Used existing `blockType` with values `identification`, `summary`, `context`, `content`. Fixtures were restructured so each article has: (1) identification block, (2) summary block, (3) context blocks. Evidence and trace are UI entry points after content, not block types. Questions remain at the end with article-specific ids.
- **Contract:** Tightened `ArticleBlock.blockType` in TypeScript to an optional union `'identification' | 'summary' | 'context' | 'content'` and documented it; API model left as optional string.
- **API:** No change; article is returned as-is from fixtures with blocks in order. No new endpoints.
- **ArticleScreen:** Identification block is shown in the header under title/nodeType; content blocks are rendered with a “Context” section label before the first context block; “Evidence & trace” section groups Verify and Trace with a section title; “Suggested questions” at the end with “Explore further” intro. Summary blocks get lead-style typography.
- **Support-awareness:** MicroParagraphCard shows a subtle “Interpretation” hint when all claims in the block are interpretation type; no badge soup.
- **Questions:** Article-specific questionIds (coffee: q1–q5, uhaul: q6–q10) with distinct, object/trace-focused questions for uhaul.

---

## 2. Files created

None. All changes are in existing files.

---

## 3. Files updated

| File | Changes |
|------|--------|
| `packages/contracts/src/types.ts` | `ArticleBlock.blockType` documented as optional `'identification' \| 'summary' \| 'context' \| 'content'`. |
| `apps/api/app/models.py` | Comment on `ArticleBlock.blockType` (identification \| summary \| context \| content). |
| `apps/api/app/fixtures.py` | Articles restructured: identification + summary + context blocks; article-coffee 5 blocks, article-uhaul 4 blocks. Added QUESTIONS q6–q10 (uhaul). article-uhaul questionIds set to q6–q10. |
| `apps/mobile/src/components/MicroParagraphCard.tsx` | Uses `blockType` for identification/summary/context styling; adds optional `showSectionLabel` for “Context”; shows “Interpretation” hint when all claims are interpretation. |
| `apps/mobile/src/screens/ArticleScreen.tsx` | Identification block in header; content blocks exclude identification; section label for first context block; “Evidence & trace” section with Verify and Trace; “Suggested questions” with “Explore further”; calmer link color. |
| `apps/api/tests/test_routes.py` | test_article_has_structured_blocks_and_sections; test_article_questions_at_end_article_specific; test_article_has_verify_and_trace_entry_points. |

---

## 4. How article assembly is better now

- **Identification:** First block can be `identification`; its text is shown in the header under the title so the object is clearly named and framed.
- **Summary:** A short `summary` block appears next (lead paragraph) with slightly larger type and spacing so the article has a clear high-signal lead.
- **Context:** Remaining body blocks use `context`; the first context block gets a “Context” section label so the reader sees a clear shift from summary to detail.
- **Evidence & trace:** Verify and Trace are grouped under one section title, so the article content is clearly separate from navigation to evidence and trace.
- **Questions:** At the end, with “Suggested questions” and “Explore further”; article-specific so coffee and uhaul each have relevant next-step questions.

---

## 5. Contract changes

- **ArticleBlock.blockType:** In TypeScript, type is now an optional union `'identification' | 'summary' | 'context' | 'content'` with a short comment. In Python, still `Optional[str]` with a comment. No new fields; backward compatible.

---

## 6. How the article structure behaves now

1. **Header:** Title, nodeType, then identification line (if present).
2. **Content:** Summary block (lead style), then context blocks with “Context” label on first context block. Each block can have claim chips; interpretation-only blocks get a small “Interpretation” hint.
3. **Evidence & trace:** Section title, then “Sources & Verify” and “Trace through systems” with subtext.
4. **Related:** Section title, then related node chips.
5. **Suggested questions:** Section title, “Explore further”, then up to 5 question cards.

Identification is not repeated in the scroll; only non-identification blocks are in the main content list.

---

## 7. How support-awareness is reflected without clutter

- **Interpretation hint:** If every claim in a block has `claimType === 'interpretation'`, MicroParagraphCard shows a single small italic “Interpretation” line above the text. No extra badges.
- **Fact vs interpretation:** Claim chips (Verified fact, Interpretation, etc.) stay as-is; the lead summary and context blocks are not overloaded with support labels. Verify remains the place for full evidence inspection.

---

## 8. Tests added

- **test_article_has_structured_blocks_and_sections:** article-coffee has at least three blocks and at least one block each with blockType identification, summary, context.
- **test_article_questions_at_end_article_specific:** article-uhaul has questionIds with at least 5 ids; questions endpoint returns at least 5; uhaul uses q6 (so questionIds include "q6").
- **test_article_has_verify_and_trace_entry_points:** article has relatedNodeIds and questionIds as lists.

All 23 API tests pass.

---

## 9. Weakest remaining stub after this pass

- **Confidence scaffolding:** Support status is still derived from type + source count only; no deeper verification or scoring.
- **Experience layer:** Rabbit drop, sound, transition not implemented (deferred).
- **Market layer:** Commerce, alternatives, affiliate not in scope.

---

## 10. Next best upgrade recommendation

**Recommendation: confidence scaffolding** (support-status/verification logic and clearer boundaries) **or experience layer** (rabbit drop, transition) next. Market layer after that. This pass focused only on making the main article surface stronger and more structured.

---

## Summary

The article is now assembled in a canonical order (identification, summary, context) with clear section labels and entry points for Verify and Trace, and article-specific suggested questions at the end. Support is hinted with a light “Interpretation” label where appropriate, without turning the article into a second Verify screen. All changes stay within the existing contract and mobile v0 slice.
