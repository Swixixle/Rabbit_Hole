// v19 — Placeholder Cross-Link Slots

export type ReadingAssistCrossLinkSlot = {
  id: string;
  sentenceId: string;
  anchorId: string;
  createdAt: string;
};

export type ReadingAssistCrossLinkSummary = {
  slots: Record<string, ReadingAssistCrossLinkSlot>;
};

// v20 — Verification Bundle Skeleton

export type ReadingAssistVerificationBundle = {
  id: string;
  crossLinkId: string;
  sentenceId: string;
  anchorId: string;
  claimId: string | null;
  sourceId: string | null;
  verificationId: string | null;
  disagreementId: string | null;
  createdAt: string;
};

export type ReadingAssistVerificationBundleSummary = {
  bundles: Record<string, ReadingAssistVerificationBundle>;
};

// v21 — Verification Bundle Indexes

export type ReadingAssistVerificationBundleIndexSummary = {
  bySentenceId: Record<string, string[]>;
  byAnchorId: Record<string, string[]>;
  byClaimId: Record<string, string[]>;
  bySourceId: Record<string, string[]>;
  byVerificationId: Record<string, string[]>;
  byDisagreementId: Record<string, string[]>;
};

// v22 — Curiosity Signal Skeleton

export type ReadingAssistCuriositySignalKind =
  | 'explore_point'
  | 'source_available'
  | 'verification_opportunity'
  | 'disagreement_present';

export type ReadingAssistCuriositySignal = {
  id: string;
  bundleId: string;
  crossLinkId: string;
  sentenceId: string;
  anchorId: string;
  kinds: ReadingAssistCuriositySignalKind[];
  createdAt: string;
};

export type ReadingAssistCuriositySignalSummary = {
  signals: Record<string, ReadingAssistCuriositySignal>;
};

// v23 — Prompt Tone Slots

export type ReadingAssistPromptToneSlotKind =
  | 'gentle_nudge'
  | 'curious_invite'
  | 'source_peek'
  | 'soft_compare';

export type ReadingAssistPromptToneFamily =
  | 'neutral_warm'
  | 'calm'
  | 'playful_light';

export type ReadingAssistPromptToneIntensity =
  | 'low'
  | 'medium';

export type ReadingAssistPromptToneSlot = {
  id: string;
  sentenceId: string;
  anchorId: string;
  signalId: string;
  bundleId: string;
  crossLinkId: string;
  slotKinds: ReadingAssistPromptToneSlotKind[];
  toneFamily: ReadingAssistPromptToneFamily;
  intensity: ReadingAssistPromptToneIntensity;
  createdAt: string;
};

export type ReadingAssistPromptToneSlotSummary = {
  slots: Record<string, ReadingAssistPromptToneSlot>;
};

// v24 — Prompt Copy Selections

export type ReadingAssistPromptCopySelectionKind =
  | 'nudge'
  | 'invite'
  | 'peek'
  | 'compare';

export type ReadingAssistPromptCopySelection = {
  id: string;
  sentenceId: string;
  anchorId: string;
  slotId: string;
  signalId: string;
  bundleId: string;
  crossLinkId: string;
  selectedKind: ReadingAssistPromptCopySelectionKind;
  copyKey: string | null;
  createdAt: string;
};

export type ReadingAssistPromptCopySelectionSummary = {
  selections: Record<string, ReadingAssistPromptCopySelection>;
};
