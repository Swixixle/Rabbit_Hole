import type {
  ReadingAssistCrossLinkSummary,
  ReadingAssistVerificationBundle,
  ReadingAssistVerificationBundleSummary,
  ReadingAssistVerificationBundleIndexSummary,
  ReadingAssistCuriositySignal,
  ReadingAssistCuriositySignalSummary,
  ReadingAssistPromptToneSlot,
  ReadingAssistPromptToneSlotKind,
  ReadingAssistPromptToneFamily,
  ReadingAssistPromptToneIntensity,
  ReadingAssistPromptToneSlotSummary,
  ReadingAssistPromptCopySelection,
  ReadingAssistPromptCopySelectionKind,
  ReadingAssistPromptCopySelectionSummary,
  ReadingAssistPromptCopyLibraryRecord,
  ReadingAssistPromptCopyLibraryRecordSummary,
} from '../types/readingAssist';

// v20 — Verification Bundle Skeleton

export function buildVerificationBundleSummary(
  crossLinkSummary: ReadingAssistCrossLinkSummary,
): ReadingAssistVerificationBundleSummary {
  const bundles: Record<string, ReadingAssistVerificationBundle> = {};
  const now = new Date().toISOString();

  for (const slot of Object.values(crossLinkSummary.slots)) {
    const id = `ra-verification-bundle|${slot.id}`;
    bundles[id] = {
      id,
      crossLinkId: slot.id,
      sentenceId: slot.sentenceId,
      anchorId: slot.anchorId,
      claimId: null,
      sourceId: null,
      verificationId: null,
      disagreementId: null,
      createdAt: now,
    };
  }

  return { bundles };
}

// v21 — Verification Bundle Indexes

export function buildVerificationBundleIndexSummary(
  bundleSummary: ReadingAssistVerificationBundleSummary,
): ReadingAssistVerificationBundleIndexSummary {
  const bySentenceId: Record<string, string[]> = {};
  const byAnchorId: Record<string, string[]> = {};
  const byClaimId: Record<string, string[]> = {};
  const bySourceId: Record<string, string[]> = {};
  const byVerificationId: Record<string, string[]> = {};
  const byDisagreementId: Record<string, string[]> = {};

  for (const bundle of Object.values(bundleSummary.bundles)) {
    const { id, sentenceId, anchorId, claimId, sourceId, verificationId, disagreementId } = bundle;

    if (!bySentenceId[sentenceId]) bySentenceId[sentenceId] = [];
    bySentenceId[sentenceId].push(id);

    if (!byAnchorId[anchorId]) byAnchorId[anchorId] = [];
    byAnchorId[anchorId].push(id);

    if (claimId !== null) {
      if (!byClaimId[claimId]) byClaimId[claimId] = [];
      byClaimId[claimId].push(id);
    }

    if (sourceId !== null) {
      if (!bySourceId[sourceId]) bySourceId[sourceId] = [];
      bySourceId[sourceId].push(id);
    }

    if (verificationId !== null) {
      if (!byVerificationId[verificationId]) byVerificationId[verificationId] = [];
      byVerificationId[verificationId].push(id);
    }

    if (disagreementId !== null) {
      if (!byDisagreementId[disagreementId]) byDisagreementId[disagreementId] = [];
      byDisagreementId[disagreementId].push(id);
    }
  }

  return { bySentenceId, byAnchorId, byClaimId, bySourceId, byVerificationId, byDisagreementId };
}

// v22 — Curiosity Signal Skeleton

export function buildCuriositySignalSummary(
  bundleSummary: ReadingAssistVerificationBundleSummary,
): ReadingAssistCuriositySignalSummary {
  const signals: Record<string, ReadingAssistCuriositySignal> = {};
  const now = new Date().toISOString();

  for (const bundle of Object.values(bundleSummary.bundles)) {
    const id = `ra-curiosity-signal|${bundle.id}`;
    const kinds: ReadingAssistCuriositySignal['kinds'] = [
      'explore_point',
      'source_available',
      'verification_opportunity',
    ];

    if (bundle.disagreementId !== null) {
      kinds.push('disagreement_present');
    }

    signals[id] = {
      id,
      bundleId: bundle.id,
      crossLinkId: bundle.crossLinkId,
      sentenceId: bundle.sentenceId,
      anchorId: bundle.anchorId,
      kinds,
      createdAt: now,
    };
  }

  return { signals };
}

// v23 — Prompt Tone Slots

export function buildPromptToneSlotSummary(
  signalSummary: ReadingAssistCuriositySignalSummary,
): ReadingAssistPromptToneSlotSummary {
  const slots: Record<string, ReadingAssistPromptToneSlot> = {};
  const now = new Date().toISOString();

  for (const signal of Object.values(signalSummary.signals)) {
    const id = `ra-prompt-tone-slot|${signal.id}`;
    const hasDisagreement = signal.kinds.includes('disagreement_present');
    const hasSourceAvailable = signal.kinds.includes('source_available');

    const slotKinds: ReadingAssistPromptToneSlotKind[] = ['gentle_nudge', 'curious_invite'];
    if (hasSourceAvailable) slotKinds.push('source_peek');
    if (hasDisagreement) slotKinds.push('soft_compare');

    const toneFamily: ReadingAssistPromptToneFamily = hasDisagreement ? 'calm' : 'neutral_warm';
    const intensity: ReadingAssistPromptToneIntensity = hasDisagreement ? 'medium' : 'low';

    slots[id] = {
      id,
      sentenceId: signal.sentenceId,
      anchorId: signal.anchorId,
      signalId: signal.id,
      bundleId: signal.bundleId,
      crossLinkId: signal.crossLinkId,
      slotKinds,
      toneFamily,
      intensity,
      createdAt: now,
    };
  }

  return { slots };
}

// v24 — Prompt Copy Selections

export function buildPromptCopySelectionSummary(
  toneSlotSummary: ReadingAssistPromptToneSlotSummary,
): ReadingAssistPromptCopySelectionSummary {
  const selections: Record<string, ReadingAssistPromptCopySelection> = {};
  const now = new Date().toISOString();

  for (const slot of Object.values(toneSlotSummary.slots)) {
    const id = `ra-prompt-copy-selection|${slot.id}`;

    let selectedKind: ReadingAssistPromptCopySelectionKind;
    if (slot.slotKinds.includes('soft_compare')) {
      selectedKind = 'compare';
    } else if (slot.slotKinds.includes('source_peek')) {
      selectedKind = 'peek';
    } else if (slot.slotKinds.includes('curious_invite')) {
      selectedKind = 'invite';
    } else {
      selectedKind = 'nudge';
    }

    selections[id] = {
      id,
      sentenceId: slot.sentenceId,
      anchorId: slot.anchorId,
      slotId: slot.id,
      signalId: slot.signalId,
      bundleId: slot.bundleId,
      crossLinkId: slot.crossLinkId,
      selectedKind,
      copyKey: null,
      createdAt: now,
    };
  }

  return { selections };
}

// v25 — Prompt Copy Library Records

export function buildPromptCopyLibraryRecordSummary(
  selectionSummary: ReadingAssistPromptCopySelectionSummary,
): ReadingAssistPromptCopyLibraryRecordSummary {
  const records: Record<string, ReadingAssistPromptCopyLibraryRecord> = {};
  const now = new Date().toISOString();

  for (const selection of Object.values(selectionSummary.selections)) {
    const id = `ra-prompt-copy-library-record|${selection.id}`;

    records[id] = {
      id,
      selectionId: selection.id,
      sentenceId: selection.sentenceId,
      anchorId: selection.anchorId,
      slotId: selection.slotId,
      signalId: selection.signalId,
      bundleId: selection.bundleId,
      crossLinkId: selection.crossLinkId,
      selectedKind: selection.selectedKind,
      libraryKey: null,
      variantKeys: [],
      text: null,
      createdAt: now,
    };
  }

  return { records };
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
