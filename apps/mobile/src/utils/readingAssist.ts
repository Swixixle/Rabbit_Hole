import type {
  ReadingAssistCrossLink,
  ReadingAssistCrossLinkSummary,
  ReadingAssistEvent,
  ReadingAssistReadingPathSummary,
  ReadingAssistVerificationBundle,
  ReadingAssistVerificationBundleIndexSummary,
  ReadingAssistVerificationBundleSummary,
} from '../types/readingAssist'

// ── ID creators ───────────────────────────────────────────────────────────────

export function createReadingAssistCrossLinkId(sentenceId: string, anchorId: string): string {
  return `${sentenceId}::${anchorId}`
}

export function createReadingAssistVerificationBundleId(crossLinkId: string): string {
  return `bundle::${crossLinkId}`
}

// ── Index helpers (v21) ───────────────────────────────────────────────────────

/**
 * Ensure that `id` appears exactly once under `key` in `indexMap`.
 *
 * Rules:
 * - If `key` is empty or falsy, return `indexMap` unchanged.
 * - If `indexMap[key]` does not exist, initialise it with `[id]`.
 * - If `id` is already present, do not duplicate.
 * - Otherwise append `id`.
 *
 * Always returns a new object (immutable update).
 */
export function ensureReadingAssistIdIndexEntry(
  indexMap: Record<string, string[]>,
  key: string,
  id: string,
): Record<string, string[]> {
  if (!key) {
    return indexMap
  }

  const existing = indexMap[key]

  if (existing === undefined) {
    return { ...indexMap, [key]: [id] }
  }

  if (existing.includes(id)) {
    return indexMap
  }

  return { ...indexMap, [key]: [...existing, id] }
}

/**
 * Populate all applicable index maps in `summary` with `bundle.id`.
 *
 * Indexed keys:
 * - bySentenceId[bundle.sentenceId]
 * - byAnchorId[bundle.anchorId]
 * - byClaimId[bundle.claimId]
 * - bySourceId[bundle.sourceId]
 * - byVerificationId[bundle.verificationId]
 * - byDisagreementId[bundle.disagreementId]  (only when non-null)
 *
 * Idempotent: repeated calls do not produce duplicate ids.
 */
export function ensureReadingAssistVerificationBundleIndexes(
  summary: ReadingAssistVerificationBundleIndexSummary,
  bundle: ReadingAssistVerificationBundle,
): ReadingAssistVerificationBundleIndexSummary {
  const { id } = bundle

  let bySentenceId = ensureReadingAssistIdIndexEntry(summary.bySentenceId, bundle.sentenceId, id)
  let byAnchorId = ensureReadingAssistIdIndexEntry(summary.byAnchorId, bundle.anchorId, id)
  let byClaimId = ensureReadingAssistIdIndexEntry(summary.byClaimId, bundle.claimId, id)
  let bySourceId = ensureReadingAssistIdIndexEntry(summary.bySourceId, bundle.sourceId, id)
  let byVerificationId = ensureReadingAssistIdIndexEntry(
    summary.byVerificationId,
    bundle.verificationId,
    id,
  )

  let byDisagreementId = summary.byDisagreementId
  if (bundle.disagreementId != null) {
    byDisagreementId = ensureReadingAssistIdIndexEntry(
      summary.byDisagreementId,
      bundle.disagreementId,
      id,
    )
  }

  return {
    bySentenceId,
    byAnchorId,
    byClaimId,
    bySourceId,
    byVerificationId,
    byDisagreementId,
  }
}

/**
 * Look up `bundleId` in `verificationBundleSummary` and, if found, ensure
 * that bundle's structural ids are indexed in `indexSummary`.
 *
 * Returns `indexSummary` unchanged when the bundle does not exist.
 */
export function ensureVerificationBundleIndexesForBundleId(
  indexSummary: ReadingAssistVerificationBundleIndexSummary,
  verificationBundleSummary: ReadingAssistVerificationBundleSummary,
  bundleId: string,
): ReadingAssistVerificationBundleIndexSummary {
  const bundle = verificationBundleSummary.bundles[bundleId]

  if (!bundle) {
    return indexSummary
  }

  return ensureReadingAssistVerificationBundleIndexes(indexSummary, bundle)
}

// ── Reducer ───────────────────────────────────────────────────────────────────

/**
 * Pure reducer for the reading-path pipeline.
 *
 * SENTENCE_OBSERVED:
 *   1. Ensure cross-link for (sentenceId, anchorId)
 *   2. Ensure verification bundle derived from that cross-link
 *   3. Ensure bundle indexes for the new/updated bundle (v21)
 *
 * BLOCK_OBSERVED:
 *   Pass-through — block events carry no cross-link or bundle data.
 */
export function readingAssistReadingPathReducer(
  state: ReadingAssistReadingPathSummary,
  event: ReadingAssistEvent,
): ReadingAssistReadingPathSummary {
  switch (event.type) {
    case 'SENTENCE_OBSERVED': {
      const { sentenceId, anchorId, claimId, sourceId, verificationId } = event
      const disagreementId = event.disagreementId ?? null

      // 1. Ensure cross-link
      const crossLinkId = createReadingAssistCrossLinkId(sentenceId, anchorId)
      const crossLink: ReadingAssistCrossLink = {
        id: crossLinkId,
        sentenceId,
        anchorId,
        claimId,
        sourceId,
        verificationId,
        disagreementId,
      }
      const newCrossLinkSummary: ReadingAssistCrossLinkSummary = {
        crossLinks: { ...state.crossLinkSummary.crossLinks, [crossLinkId]: crossLink },
      }

      // 2. Ensure verification bundle
      const bundleId = createReadingAssistVerificationBundleId(crossLinkId)
      const bundle: ReadingAssistVerificationBundle = {
        id: bundleId,
        sentenceId,
        anchorId,
        claimId,
        sourceId,
        verificationId,
        disagreementId,
      }
      const newBundleSummary: ReadingAssistVerificationBundleSummary = {
        bundles: { ...state.verificationBundleSummary.bundles, [bundleId]: bundle },
      }

      // 3. Ensure bundle indexes (v21)
      const newIndexSummary = ensureVerificationBundleIndexesForBundleId(
        state.verificationBundleIndexSummary,
        newBundleSummary,
        bundleId,
      )

      return {
        crossLinkSummary: newCrossLinkSummary,
        verificationBundleSummary: newBundleSummary,
        verificationBundleIndexSummary: newIndexSummary,
      }
    }

    case 'BLOCK_OBSERVED': {
      return state
    }

    default:
      return state
  }
}
