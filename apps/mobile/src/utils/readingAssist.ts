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
}
