// ── Sentence Anchor ─────────────────────────────────────────────────────────
// A structural anchor that ties a sentence to a named position in the
// reading path. Introduced in early reading-assist groundwork.

export type ReadingAssistSentenceAnchor = {
  id: string
  sentenceId: string
}

// ── Cross-Link Slot ──────────────────────────────────────────────────────────
// A structural slot that links a sentence anchor to the claim, source,
// verification, and (optionally) disagreement identifiers it touches.
// Introduced in reading-assist groundwork v19/v20.

export type ReadingAssistCrossLink = {
  id: string
  sentenceId: string
  anchorId: string
  claimId: string
  sourceId: string
  verificationId: string
  disagreementId: string | null
}

export type ReadingAssistCrossLinkSummary = {
  crossLinks: Record<string, ReadingAssistCrossLink>
}

export const DEFAULT_READING_ASSIST_CROSS_LINK_SUMMARY: ReadingAssistCrossLinkSummary = {
  crossLinks: {},
}

// ── Verification Bundle Skeleton ─────────────────────────────────────────────
// A skeleton that groups all structural identifiers for a single verification
// unit. Derived from a cross-link. Introduced in reading-assist groundwork v20.

export type ReadingAssistVerificationBundle = {
  id: string
  sentenceId: string
  anchorId: string
  claimId: string
  sourceId: string
  verificationId: string
  disagreementId: string | null
}

export type ReadingAssistVerificationBundleSummary = {
  bundles: Record<string, ReadingAssistVerificationBundle>
}

export const DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY: ReadingAssistVerificationBundleSummary =
  {
    bundles: {},
  }

// ── Verification Bundle Index Summary ────────────────────────────────────────
// Deterministic retrieval indexes over verification bundle objects, keyed by
// structural ids only. No semantic meaning. Introduced in reading-assist
// groundwork v21.

export type ReadingAssistVerificationBundleIndexSummary = {
  bySentenceId: Record<string, string[]>
  byAnchorId: Record<string, string[]>
  byClaimId: Record<string, string[]>
  bySourceId: Record<string, string[]>
  byVerificationId: Record<string, string[]>
  byDisagreementId: Record<string, string[]>
}

export const DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY: ReadingAssistVerificationBundleIndexSummary =
  {
    bySentenceId: {},
    byAnchorId: {},
    byClaimId: {},
    bySourceId: {},
    byVerificationId: {},
    byDisagreementId: {},
  }

// ── Reading Path Summary ──────────────────────────────────────────────────────
// Top-level reducer state for the reading-assist pipeline. Accumulates
// cross-links, verification bundle skeletons, and (v21) bundle indexes as the
// user progresses through a document.

export type ReadingAssistReadingPathSummary = {
  crossLinkSummary: ReadingAssistCrossLinkSummary
  verificationBundleSummary: ReadingAssistVerificationBundleSummary
  verificationBundleIndexSummary: ReadingAssistVerificationBundleIndexSummary
}

export const DEFAULT_READING_ASSIST_READING_PATH_SUMMARY: ReadingAssistReadingPathSummary = {
  crossLinkSummary: DEFAULT_READING_ASSIST_CROSS_LINK_SUMMARY,
  verificationBundleSummary: DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY,
  verificationBundleIndexSummary: DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY,
}

// ── Reducer Events ────────────────────────────────────────────────────────────
// Events consumed by the reading-path reducer. Only structural data — no
// content, no semantics.

export type ReadingAssistSentenceObservedEvent = {
  type: 'SENTENCE_OBSERVED'
  sentenceId: string
  anchorId: string
  claimId: string
  sourceId: string
  verificationId: string
  disagreementId?: string | null
}

export type ReadingAssistBlockObservedEvent = {
  type: 'BLOCK_OBSERVED'
  blockId: string
}

export type ReadingAssistEvent =
  | ReadingAssistSentenceObservedEvent
  | ReadingAssistBlockObservedEvent
