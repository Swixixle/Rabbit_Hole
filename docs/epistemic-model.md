# Epistemic model (confidence & support)

Short canonical note so the model does not drift.

## What confidence means

**Confidence** = how strongly the system stands behind the claim.

- **High** — direct or strong backing; system is willing to stand behind it.
- **Medium** — inferred or interpreted; reasonable support but not definitive.
- **Low** — speculative or weak support; reader should treat with caution.

Confidence is **not** a fact-check label (true/false/misleading). It is an epistemic stance.

## What support means

**Support** = what kind of epistemic backing the claim has.

- **Direct** — verified fact; traceable to direct source support.
- **Inference** — synthesized from sources; not a direct quote.
- **Interpretation** — analytical or interpretive; reading of evidence.
- **Speculation** — hypothetical or future-facing; weak or no direct support.

Support is **not** the same as claimType. claimType is editorial/content classification (e.g. verified_fact, opinion). Support is the epistemic category used for reader trust.

## How they differ

- **claimType** — authoring/editorial (e.g. “this is an opinion”, “this is a verified fact”). Can stay for downstream logic and labels.
- **support** — epistemic backing (direct / inference / interpretation / speculation). Used for reader-facing “what kind of claim is this?”
- **confidence** — strength of stance (high / medium / low). Used for “how much should I trust this?”

Do not use claimType as the sole proxy for reader trust unless the mapping to support/confidence is defined.

## What gets derived automatically

When a claim has no explicit `support` or `confidence`, the backend derives them from `claimType`:

| claimType        | support       | default confidence |
|------------------|---------------|---------------------|
| verified_fact    | direct        | high                |
| synthesized_claim| inference     | medium              |
| interpretation   | interpretation| medium              |
| speculation      | speculation   | low                 |
| opinion, anecdote| inference     | medium              |
| disputed_claim   | interpretation| low                 |
| conspiracy_claim, advertisement, satire_or_joke | speculation | low |

Fixtures can set `support` and `confidence` explicitly; derivation fills only when missing.

## What the reader shows

1. **Claim-level** — In the claim modal: confidence glyph (● high, ○ medium, ◌ low) and support label (Direct, Inferred, Interpreted, Speculative).
2. **Block-level** — At the top of each block with claims: “Confidence: High 2 · Medium 1” and “Support: Direct 1 · Inference 2”.
3. **Filter** — Toggle: “Show all” vs “Hide low confidence”. When on, low-confidence claim chips are hidden and “Low-confidence claim hidden” is shown where applicable.

## What it intentionally does not show

- No numeric score.
- No fact-check style true/false/misleading.
- No warning styling for medium confidence; calm, neutral tone.
- Interpretation hint (from article assembly) and confidence/support indicators are complementary, not duplicated.

## Where derivation lives

- **Backend:** `apps/api/app/claim_epistemic.py` — `derive_support()`, `default_confidence()`, `enrich_claim()`.
- **Frontend:** `apps/mobile/src/utils/confidenceDisplay.ts` — `deriveSupport()`, `defaultConfidence()`, `getClaimConfidence()`, `getClaimSupport()` for when API omits fields.

## Contract

- **Claim** (contracts): `confidence?: ConfidenceLevel`, `support?: ClaimSupport`.
- **ConfidenceLevel:** `high` | `medium` | `low`.
- **ClaimSupport:** `direct` | `inference` | `interpretation` | `speculation`.
