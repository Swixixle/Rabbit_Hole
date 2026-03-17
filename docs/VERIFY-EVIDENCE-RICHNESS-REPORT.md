# Verify Evidence Richness Pass — Implementation Report

**Date:** 2025-03-11  
**Scope:** Deepen claim ↔ source ↔ evidence relationships and Verify surface UX within the existing mobile v0 slice.

---

## 1. Implementation approach

- **Audit:** Verified that the Verify layer was thin: verification API returned only `sources`; no claims, evidence spans, or mappings. Verify surface showed a flat source list; EvidenceDrawer showed only source metadata and a single excerpt. Article claim modal showed type and source count but no path to evidence.
- **Fixture richness:** Added claim-6 (verified fact, 2 sources), expanded sources (src-4 academic, excerpts on src-2), and more evidence spans so article-coffee has multiple claims with evidence and article-uhaul has claim-5 with zero sources (insufficient support).
- **Support-status layer:** Introduced a small, fixture-driven support-status vocabulary in `verification_bundle.py`: `supported_fact`, `supported_synthesis`, `interpretation`, `limited_support`, `insufficient_support`, `disputed`. Derived from claim type, confidence, and actual source count (no numeric confidence).
- **Verification bundle:** Built an explicit bundle (claims, sources, evidenceSpans, claimToSources, claimToEvidence, supportStatusByClaimId) in fixtures and return it from the verification endpoint so the UI does not infer relationships.
- **Verify surface:** Redesigned as claim-first: each claim is expandable to show supporting sources and evidence excerpts; support-status labels and source count are visible; EvidenceDrawer shows claim-linked evidence when opened from a claim’s source.
- **Article Reader:** Claim modal now uses ClaimTypeBadge, source count, and a clear “Sources & Verify” CTA that opens the Verify sheet.
- **Degraded states:** Empty/unknown article returns a safe empty bundle; no sources for a claim shows “No supporting sources” and optional “Limited/insufficient support”; no excerpt shows “Source supports this claim (no excerpt)” or “No excerpt available”; API failure keeps retry.

---

## 2. Files created

| File | Purpose |
|------|--------|
| `apps/api/app/verification_bundle.py` | Support-status derivation from claim type + source count; constants for status labels. Future: replace with verification/confidence layer. |
| `apps/mobile/src/utils/supportStatusLabels.ts` | Display labels for support-status values (Supported fact, Interpretation, Limited support, etc.). |

---

## 3. Files updated

| File | Changes |
|------|--------|
| `apps/api/app/fixtures.py` | Added claim-6, src-4, evidence ev-6/ev-7; src-2 excerpt; claim-5 confidence low; article-coffee block for claim-6. Added `get_verification_bundle(article_id)` building claims, sources, evidenceSpans, claimToSources, claimToEvidence, supportStatusByClaimId. |
| `apps/api/app/models.py` | `VerificationResponse`: added optional `claims`, `evidenceSpans`, `claimToSources`, `claimToEvidence`, `supportStatusByClaimId`. |
| `apps/api/app/routes.py` | Verification endpoint now uses `get_verification_bundle` and returns the full response (sources + claims + evidence + mappings). |
| `packages/contracts/src/types.ts` | `VerificationResponse`: added optional `claims`, `evidenceSpans`, `claimToSources`, `claimToEvidence`, `supportStatusByClaimId`. |
| `apps/mobile/src/screens/VerifySheet.tsx` | Rebuilt as claim-first: load bundle, expandable claims with support status and source count, nested sources and evidence excerpts; “No sources” / “No excerpt” copy; open EvidenceDrawer with claim-linked evidence. |
| `apps/mobile/src/screens/ArticleScreen.tsx` | Claim modal: ClaimTypeBadge, source count, “Open Verify to see sources and evidence”, “Sources & Verify” button that opens Verify sheet. |
| `apps/mobile/src/components/EvidenceDrawer.tsx` | Optional `evidenceSpans` prop; shows “Evidence linked to this claim” with excerpts when present; “No excerpt available” when missing. |
| `apps/api/tests/test_routes.py` | New tests: verification bundle structure, at least one claim with evidence, support status values, article-uhaul claim-5 insufficient_support, unknown article safe empty shape. |

---

## 4. How the verification model is richer now

- **Per article:** The API returns all claims referenced by the article’s blocks, all sources that support those claims (via evidence spans), and all evidence spans linking claims to sources.
- **Mappings:** `claimToSources` (claimId → sourceIds[]) and `claimToEvidence` (claimId → evidence span list) make support explicit so the UI can show “which sources support this claim” and “what excerpt supports it” without guessing.
- **Support status:** Each claim gets a derived label: e.g. verified_fact + 2+ sources + high → `supported_fact`; interpretation + 1 source → `interpretation`; 0 sources → `insufficient_support`. This is used only for display and is clearly fixture-driven (no fake scores).
- **Evidence visibility:** Evidence spans are returned in the bundle and shown in the Verify surface (under each claim) and in the EvidenceDrawer when opened from a source, with “no excerpt” stated when absent.

---

## 5. Contract changes

- **VerificationResponse** (contracts and API): Extended with optional `claims`, `evidenceSpans`, `claimToSources`, `claimToEvidence`, `supportStatusByClaimId`. Existing `sources` remains required; new fields are additive so existing clients still work.
- No changes to Claim, Source, or EvidenceSpan shapes; no new enums. Support status is a string value set by the API.

---

## 6. How the Verify surface behaves now

- **Header:** “Verify” with subtitle “Claims and their support.”
- **Claim-first list:** Each claim shows:
  - Claim text (expandable).
  - Claim type badge (e.g. Verified fact, Interpretation).
  - Support-status label (e.g. Supported fact, Interpretation, Limited support, Insufficient support), with weaker support in red.
  - Source count (“2 sources” or “No sources”).
  - Expand control (▶/▼).
- **Expanded claim:** Lists supporting sources; each source has a card and either an evidence excerpt (“Excerpt: …”) or “Source supports this claim (no excerpt).” Tapping a source opens EvidenceDrawer with that claim’s evidence for that source.
- **No support:** If a claim has no sources, the expanded section shows “No supporting sources. This claim is marked as limited or insufficient support.”
- **Fallbacks:** No claims and no sources → “No claims or sources for this article yet.” No claims but some sources → “No claims to verify” plus list of sources. API error → error message and retry.

---

## 7. Degraded verification states supported

- **No sources for article:** Empty bundle; UI shows “No claims or sources for this article yet.”
- **No claims (e.g. article has no block claimIds):** Empty claims list; if there are sources, show “No claims to verify” and list sources.
- **Claim with no evidence/sources:** Expand shows “No supporting sources” and optional limited/insufficient copy.
- **Evidence span without excerpt:** Show “Source supports this claim (no excerpt)” in Verify and “No excerpt available” in EvidenceDrawer when applicable.
- **Unknown article ID:** Bundle returns empty lists and empty dicts; API returns 200 with safe shape (no 404).
- **API failure:** Error message and retry; no fake data.

---

## 8. Tests added

- **test_verification_bundle_has_claims_sources_evidence:** Response includes claims, evidenceSpans, claimToSources, claimToEvidence, supportStatusByClaimId; at least one claim and one evidence span.
- **test_verification_at_least_one_claim_has_evidence:** At least one claim has non-empty claimToEvidence.
- **test_verification_support_status_present:** supportStatusByClaimId is non-empty and values are in the allowed set.
- **test_verification_article_uhaul_has_insufficient_support_claim:** claim-5 has status `insufficient_support` (0 sources).
- **test_verification_unknown_article_safe_shape:** Unknown article returns 200 with empty sources, claims, evidenceSpans, and empty dicts for mappings.

All 20 API tests pass.

---

## 9. Weakest remaining stub after this pass

- **Article assembly quality:** Article content is still static blocks from fixtures; no dynamic assembly from claims/sources or richer narrative structure.
- **Experience layer:** Rabbit drop, sound, transition not implemented (by design).
- **Source/claim confidence scaffolding:** Support status is derived from type + count only; a future verification/confidence layer could plug into `verification_bundle.get_support_status` and richer scoring.

---

## 10. Next best upgrade recommendation

**Recommendation: article assembly quality.**

- Make the article feel more dynamically assembled from structured claims and blocks (e.g. ordering, grouping, optional “Limited support” callouts).
- Then: confidence scaffolding (real support-status/verification logic, not just type+count).
- Then: experience layer (rabbit drop, sound, transition).

This keeps the product intellectually credible and improves the reading experience before adding more trust logic or polish.

---

## Summary

Verify now surfaces **claim ↔ source ↔ evidence** explicitly: the API returns a verification bundle with claims, sources, evidence spans, and mappings; the Verify surface is claim-first with expandable support, support-status labels, and evidence excerpts; and degraded cases (no sources, no evidence, unknown article, API failure) are handled with clear, honest copy and retry where appropriate. The implementation is isolated (verification_bundle, supportStatusLabels) and ready for a future verification/confidence layer to plug in.
