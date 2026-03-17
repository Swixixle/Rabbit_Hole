/**
 * Reading-Assist Groundwork v1/v2: lightweight state for text-focus mode.
 * v1: block-level focus. v2: sentence anchoring (data model only; no UI change).
 * Supports future eye-tracking, rotary sentence enlargement, and adaptive subtitle focus.
 */

export type ReadingAssistMode = "off" | "focus_block";

export type ReadingAssistSourceType = "article" | "study" | "transcript" | "ocr";

/** v8: focus event types for the event spine. */
export type ReadingAssistEventType =
  | "block_focus_set"
  | "block_focus_cleared"
  | "sentence_focus_set"
  | "sentence_focus_cleared"
  | "sentence_progress_next"
  | "sentence_progress_previous";

/** v8: structured focus event for debugging, analytics, and future sensor integration. */
export interface ReadingAssistEvent {
  type: ReadingAssistEventType;
  timestamp: number;
  sourceType: ReadingAssistSourceType | null;
  blockId: string | null;
  sentenceId: string | null;
}

/** v9: in-memory session summary derived from the focus event spine. */
export interface ReadingAssistSessionSummary {
  sourceType: ReadingAssistSourceType | null;
  startedAt: number | null;
  endedAt: number | null;
  focusedBlockIds: string[];
  focusedSentenceIds: string[];
  blockFocusCount: number;
  sentenceFocusCount: number;
  sentenceProgressNextCount: number;
  sentenceProgressPreviousCount: number;
  lastBlockId: string | null;
  lastSentenceId: string | null;
}

export const DEFAULT_READING_ASSIST_SESSION_SUMMARY: ReadingAssistSessionSummary = {
  sourceType: null,
  startedAt: null,
  endedAt: null,
  focusedBlockIds: [],
  focusedSentenceIds: [],
  blockFocusCount: 0,
  sentenceFocusCount: 0,
  sentenceProgressNextCount: 0,
  sentenceProgressPreviousCount: 0,
  lastBlockId: null,
  lastSentenceId: null,
};

/**
 * v9: pure reducer — derive next session summary from previous and one event.
 * Deterministic; keeps arrays deduplicated by id.
 */
export function reduceReadingAssistSessionSummary(
  prev: ReadingAssistSessionSummary,
  event: ReadingAssistEvent
): ReadingAssistSessionSummary {
  const startedAt = prev.startedAt ?? event.timestamp;
  const endedAt = event.timestamp;
  const sourceType = event.sourceType ?? prev.sourceType;

  let focusedBlockIds = prev.focusedBlockIds;
  let focusedSentenceIds = prev.focusedSentenceIds;
  let blockFocusCount = prev.blockFocusCount;
  let sentenceFocusCount = prev.sentenceFocusCount;
  let sentenceProgressNextCount = prev.sentenceProgressNextCount;
  let sentenceProgressPreviousCount = prev.sentenceProgressPreviousCount;
  let lastBlockId = prev.lastBlockId;
  let lastSentenceId = prev.lastSentenceId;

  switch (event.type) {
    case "block_focus_set":
      if (event.blockId != null) {
        if (!focusedBlockIds.includes(event.blockId)) {
          focusedBlockIds = [...focusedBlockIds, event.blockId];
        }
        blockFocusCount += 1;
        lastBlockId = event.blockId;
      }
      lastSentenceId = null;
      break;
    case "block_focus_cleared":
      lastBlockId = null;
      lastSentenceId = null;
      break;
    case "sentence_focus_set":
      if (event.sentenceId != null) {
        if (!focusedSentenceIds.includes(event.sentenceId)) {
          focusedSentenceIds = [...focusedSentenceIds, event.sentenceId];
        }
        sentenceFocusCount += 1;
        lastSentenceId = event.sentenceId;
      }
      if (event.blockId != null) lastBlockId = event.blockId;
      break;
    case "sentence_focus_cleared":
      lastSentenceId = null;
      break;
    case "sentence_progress_next":
      sentenceProgressNextCount += 1;
      if (event.sentenceId != null) lastSentenceId = event.sentenceId;
      if (event.blockId != null) lastBlockId = event.blockId;
      break;
    case "sentence_progress_previous":
      sentenceProgressPreviousCount += 1;
      if (event.sentenceId != null) lastSentenceId = event.sentenceId;
      if (event.blockId != null) lastBlockId = event.blockId;
      break;
  }

  return {
    sourceType,
    startedAt,
    endedAt,
    focusedBlockIds,
    focusedSentenceIds,
    blockFocusCount,
    sentenceFocusCount,
    sentenceProgressNextCount,
    sentenceProgressPreviousCount,
    lastBlockId,
    lastSentenceId,
  };
}

/** v10: derived dwell and backtrack summary. Observational only. */
export interface ReadingAssistHeuristicSummary {
  totalBlockDwellMs: number;
  totalSentenceDwellMs: number;
  dwellByBlockId: Record<string, number>;
  dwellBySentenceId: Record<string, number>;
  backtrackCount: number;
  lastProgressDirection: "next" | "previous" | null;
}

export const DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY: ReadingAssistHeuristicSummary = {
  totalBlockDwellMs: 0,
  totalSentenceDwellMs: 0,
  dwellByBlockId: {},
  dwellBySentenceId: {},
  backtrackCount: 0,
  lastProgressDirection: null,
};

/** v10: state carrier for heuristic reduction (active focus + last timestamp). */
export interface ReadingAssistHeuristicState {
  summary: ReadingAssistHeuristicSummary;
  activeBlockId: string | null;
  activeSentenceId: string | null;
  lastEventTimestamp: number | null;
}

export const DEFAULT_READING_ASSIST_HEURISTIC_STATE: ReadingAssistHeuristicState = {
  summary: DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
  activeBlockId: null,
  activeSentenceId: null,
  lastEventTimestamp: null,
};

/**
 * v10: pure reducer — derive next heuristic state from previous and one event.
 * Dwell: event-gap estimation (elapsed since last event attributed to active block/sentence).
 * Backtrack: direction reversal (next→previous or previous→next).
 */
export function reduceReadingAssistHeuristicState(
  prev: ReadingAssistHeuristicState,
  event: ReadingAssistEvent
): ReadingAssistHeuristicState {
  const ts = event.timestamp;
  const lastTs = prev.lastEventTimestamp;
  const elapsed =
    typeof lastTs === "number" && typeof ts === "number" && ts > lastTs ? ts - lastTs : 0;

  const summary = { ...prev.summary };
  summary.dwellByBlockId = { ...prev.summary.dwellByBlockId };
  summary.dwellBySentenceId = { ...prev.summary.dwellBySentenceId };

  if (elapsed > 0) {
    if (prev.activeBlockId != null) {
      summary.totalBlockDwellMs += elapsed;
      summary.dwellByBlockId[prev.activeBlockId] =
        (summary.dwellByBlockId[prev.activeBlockId] ?? 0) + elapsed;
    }
    if (prev.activeSentenceId != null) {
      summary.totalSentenceDwellMs += elapsed;
      summary.dwellBySentenceId[prev.activeSentenceId] =
        (summary.dwellBySentenceId[prev.activeSentenceId] ?? 0) + elapsed;
    }
  }

  let activeBlockId = prev.activeBlockId;
  let activeSentenceId = prev.activeSentenceId;

  switch (event.type) {
    case "block_focus_set":
      activeBlockId = event.blockId;
      activeSentenceId = null;
      break;
    case "block_focus_cleared":
      activeBlockId = null;
      activeSentenceId = null;
      break;
    case "sentence_focus_set":
      activeSentenceId = event.sentenceId;
      if (event.blockId != null) activeBlockId = event.blockId;
      break;
    case "sentence_focus_cleared":
      activeSentenceId = null;
      break;
    case "sentence_progress_next":
      if (summary.lastProgressDirection === "previous") summary.backtrackCount += 1;
      summary.lastProgressDirection = "next";
      break;
    case "sentence_progress_previous":
      if (summary.lastProgressDirection === "next") summary.backtrackCount += 1;
      summary.lastProgressDirection = "previous";
      break;
  }

  return {
    summary,
    activeBlockId,
    activeSentenceId,
    lastEventTimestamp: ts,
  };
}

/** v11: per-sentence examined record for verification-aware reading path. */
export interface ReadingAssistExaminedSentence {
  sentenceId: string;
  blockId: string | null;
  firstSeenAt: number | null;
  lastSeenAt: number | null;
  estimatedDwellMs: number;
  focusCount: number;
  progressedToCount: number;
  progressedFromCount: number;
}

/** v11: per-block examined record for verification-aware reading path. */
export interface ReadingAssistExaminedBlock {
  blockId: string;
  firstSeenAt: number | null;
  lastSeenAt: number | null;
  estimatedDwellMs: number;
  focusCount: number;
  examinedSentenceIds: string[];
}

/** v12: kind of examination marker for disagreement-ready attachment points. */
export type ReadingAssistMarkerKind =
  | "sentence_examined"
  | "sentence_revisited"
  | "sentence_backtracked"
  | "block_examined";

/** v12: single examination marker; derived, observational, non-semantic. */
export interface ReadingAssistExaminationMarker {
  id: string;
  kind: ReadingAssistMarkerKind;
  blockId: string | null;
  sentenceId: string | null;
  createdAt: number;
}

/** v13: one anchor slot for claim/source/disagreement attachment. */
export interface ReadingAssistClaimReadyAnchorSlot {
  anchorId: string;
  blockId: string | null;
  sentenceId: string | null;
  slotType: "block" | "sentence";
  createdAt: number | null;
  markerIds: string[];
  claimIds: string[];
  sourceIds: string[];
  disagreementIds: string[];
  /** v14: source-ready attachment envelope; canonical grouping for future attachments. */
  attachments: ReadingAssistAttachmentEnvelope;
}

/** v14: explicit attachment container for claim/source/disagreement/verification references. */
export interface ReadingAssistAttachmentEnvelope {
  markerIds: string[];
  claimIds: string[];
  sourceIds: string[];
  disagreementIds: string[];
  verificationIds: string[];
}

export const DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE: ReadingAssistAttachmentEnvelope = {
  markerIds: [],
  claimIds: [],
  sourceIds: [],
  disagreementIds: [],
  verificationIds: [],
};

/** v15: shell record for claim attachment in the registry. */
export interface ReadingAssistClaimAttachmentRecord {
  id: string;
  anchorIds: string[];
  createdAt: number | null;
  /** v16: marker-derived placeholder. */
  placeholderKind: "marker-derived";
  markerIds: string[];
}

/** v15: shell record for source attachment in the registry. */
export interface ReadingAssistSourceAttachmentRecord {
  id: string;
  anchorIds: string[];
  createdAt: number | null;
  /** v17: marker-derived placeholder. */
  placeholderKind: "marker-derived";
  markerIds: string[];
}

/** v15: shell record for disagreement attachment in the registry. */
export interface ReadingAssistDisagreementAttachmentRecord {
  id: string;
  anchorIds: string[];
  createdAt: number | null;
  /** v18: marker-derived placeholder. */
  placeholderKind: "marker-derived";
  markerIds: string[];
}

/** v15: shell record for verification attachment in the registry. */
export interface ReadingAssistVerificationAttachmentRecord {
  id: string;
  anchorIds: string[];
  createdAt: number | null;
}

/** v15: registries keyed by id; ids arrays for stable ordering. */
export interface ReadingAssistAttachmentRegistrySummary {
  claimRegistry: Record<string, ReadingAssistClaimAttachmentRecord>;
  sourceRegistry: Record<string, ReadingAssistSourceAttachmentRecord>;
  disagreementRegistry: Record<string, ReadingAssistDisagreementAttachmentRecord>;
  verificationRegistry: Record<string, ReadingAssistVerificationAttachmentRecord>;
  claimIds: string[];
  sourceIds: string[];
  disagreementIds: string[];
  verificationIds: string[];
}

export const DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY: ReadingAssistAttachmentRegistrySummary = {
  claimRegistry: {},
  sourceRegistry: {},
  disagreementRegistry: {},
  verificationRegistry: {},
  claimIds: [],
  sourceIds: [],
  disagreementIds: [],
  verificationIds: [],
};

/** v13: all claim-ready anchor slots keyed by slot id. */
export interface ReadingAssistClaimReadyAnchorSummary {
  blockSlots: Record<string, ReadingAssistClaimReadyAnchorSlot>;
  sentenceSlots: Record<string, ReadingAssistClaimReadyAnchorSlot>;
  blockSlotIds: string[];
  sentenceSlotIds: string[];
}

export const DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY: ReadingAssistClaimReadyAnchorSummary = {
  blockSlots: {},
  sentenceSlots: {},
  blockSlotIds: [],
  sentenceSlotIds: [],
};

/**
 * v13: deterministic id for a block-level anchor slot.
 */
export function createReadingAssistBlockAnchorId(blockId: string): string {
  return `ra-anchor|block|${blockId}`;
}

/**
 * v13: deterministic id for a sentence-level anchor slot.
 */
export function createReadingAssistSentenceAnchorId(sentenceId: string): string {
  return `ra-anchor|sentence|${sentenceId}`;
}

/** v19: one cross-link slot linking placeholders co-occurring on a sentence. */
export interface ReadingAssistPlaceholderCrossLink {
  id: string;
  sentenceId: string;
  anchorId: string;
  claimId: string | null;
  sourceId: string | null;
  disagreementId: string | null;
  verificationId: string | null;
  createdAt: number | null;
}

/** v19: all cross-links keyed by id. */
export interface ReadingAssistPlaceholderCrossLinkSummary {
  links: Record<string, ReadingAssistPlaceholderCrossLink>;
  linkIds: string[];
}

export const DEFAULT_READING_ASSIST_PLACEHOLDER_CROSS_LINK_SUMMARY: ReadingAssistPlaceholderCrossLinkSummary = {
  links: {},
  linkIds: [],
};

/** v20: sentence-local verification bundle derived from a cross-link. Structural container only. */
export interface ReadingAssistVerificationBundle {
  id: string;
  sentenceId: string;
  anchorId: string;
  crossLinkId: string;
  claimId: string;
  sourceId: string;
  verificationId: string;
  disagreementId: string | null;
  createdAt: string;
}

/** v20: all verification bundles keyed by id. */
export interface ReadingAssistVerificationBundleSummary {
  bundles: Record<string, ReadingAssistVerificationBundle>;
  bundleIds: string[];
}

export const DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY: ReadingAssistVerificationBundleSummary = {
  bundles: {},
  bundleIds: [],
};

/** v21: deterministic retrieval indexes over verification bundles. Values are bundleIds. */
export type ReadingAssistVerificationBundleIndexSummary = {
  bySentenceId: Record<string, string[]>;
  byAnchorId: Record<string, string[]>;
  byClaimId: Record<string, string[]>;
  bySourceId: Record<string, string[]>;
  byVerificationId: Record<string, string[]>;
  byDisagreementId: Record<string, string[]>;
};

export const DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY: ReadingAssistVerificationBundleIndexSummary = {
  bySentenceId: {},
  byAnchorId: {},
  byClaimId: {},
  bySourceId: {},
  byVerificationId: {},
  byDisagreementId: {},
};

/** v22: curiosity signal kinds — structural only, no semantic interpretation. */
export type ReadingAssistCuriositySignalKind =
  | "explore_point"
  | "source_available"
  | "verification_opportunity"
  | "disagreement_present";

/** v22: sentence-local curiosity signal derived from a verification bundle. */
export type ReadingAssistCuriositySignal = {
  id: string;
  sentenceId: string;
  anchorId: string;
  bundleId: string;
  crossLinkId: string;
  signalKinds: ReadingAssistCuriositySignalKind[];
  createdAt: string;
};

/** v22: all curiosity signals keyed by id. */
export type ReadingAssistCuriositySignalSummary = {
  signals: Record<string, ReadingAssistCuriositySignal>;
  signalIds: string[];
};

export const DEFAULT_READING_ASSIST_CURIOSITY_SIGNAL_SUMMARY: ReadingAssistCuriositySignalSummary = {
  signals: {},
  signalIds: [],
};

/** v23: prompt tone slot kinds — structural only, no copy generation. */
export type ReadingAssistPromptToneSlotKind =
  | "gentle_nudge"
  | "curious_invite"
  | "source_peek"
  | "soft_compare";

/** v23: tone family for presentation-neutral prompt posture. */
export type ReadingAssistPromptToneFamily = "neutral_warm" | "calm" | "playful_light";

/** v23: prompt tone intensity. */
export type ReadingAssistPromptToneIntensity = "low" | "medium";

/** v23: presentation-neutral prompt slot derived from a curiosity signal. */
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

/** v23: all prompt tone slots keyed by id. */
export type ReadingAssistPromptToneSlotSummary = {
  slots: Record<string, ReadingAssistPromptToneSlot>;
  slotIds: string[];
};

export const DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY: ReadingAssistPromptToneSlotSummary = {
  slots: {},
  slotIds: [],
};

/** v24: stable prompt-copy family keys — structural only, no generated text. */
export type ReadingAssistPromptCopyKey =
  | "copy_explore_gentle"
  | "copy_source_peek"
  | "copy_compare_soft";

/** v24: prompt copy variant for selection hierarchy. */
export type ReadingAssistPromptCopyVariant = "primary" | "secondary";

/** v24: prompt copy selection derived from a prompt tone slot. */
export type ReadingAssistPromptCopySelection = {
  id: string;
  sentenceId: string;
  anchorId: string;
  signalId: string;
  bundleId: string;
  crossLinkId: string;
  slotId: string;
  primaryCopyKey: ReadingAssistPromptCopyKey;
  secondaryCopyKey: ReadingAssistPromptCopyKey | null;
  toneFamily: ReadingAssistPromptToneFamily;
  intensity: ReadingAssistPromptToneIntensity;
  createdAt: string;
};

/** v24: all prompt copy selections keyed by id. */
export type ReadingAssistPromptCopySelectionSummary = {
  selections: Record<string, ReadingAssistPromptCopySelection>;
  selectionIds: string[];
};

export const DEFAULT_READING_ASSIST_PROMPT_COPY_SELECTION_SUMMARY: ReadingAssistPromptCopySelectionSummary = {
  selections: {},
  selectionIds: [],
};

/** v25: prompt copy library family — structural only, no rendered text. */
export type ReadingAssistPromptCopyLibraryFamily =
  | "library_explore"
  | "library_source"
  | "library_compare";

/** v25: tone profile for copy library lookup. */
export type ReadingAssistPromptCopyLibraryToneProfile = "warm" | "calm";

/** v25: variant key for copy library expansion. */
export type ReadingAssistPromptCopyLibraryVariantKey = "v1" | "v2";

/** v25: prompt copy library record derived from a prompt copy selection. */
export type ReadingAssistPromptCopyLibraryRecord = {
  id: string;
  sentenceId: string;
  anchorId: string;
  signalId: string;
  bundleId: string;
  crossLinkId: string;
  slotId: string;
  selectionId: string;
  libraryFamily: ReadingAssistPromptCopyLibraryFamily;
  primaryCopyKey: ReadingAssistPromptCopyKey;
  secondaryCopyKey: ReadingAssistPromptCopyKey | null;
  toneProfile: ReadingAssistPromptCopyLibraryToneProfile;
  primaryVariantKey: ReadingAssistPromptCopyLibraryVariantKey;
  secondaryVariantKey: ReadingAssistPromptCopyLibraryVariantKey | null;
  createdAt: string;
};

/** v25: all prompt copy library records keyed by id. */
export type ReadingAssistPromptCopyLibraryRecordSummary = {
  records: Record<string, ReadingAssistPromptCopyLibraryRecord>;
  recordIds: string[];
};

export const DEFAULT_READING_ASSIST_PROMPT_COPY_LIBRARY_RECORD_SUMMARY: ReadingAssistPromptCopyLibraryRecordSummary =
  {
    records: {},
    recordIds: [],
  };

/** v26: prompt copy catalog entry id — deterministic key into curated copy. */
export type ReadingAssistPromptCopyCatalogEntryId =
  | "catalog_explore_warm_v1"
  | "catalog_explore_warm_v2"
  | "catalog_source_warm_v1"
  | "catalog_source_warm_v2"
  | "catalog_compare_calm_v1"
  | "catalog_compare_calm_v2";

/** v26: structural action label key for catalog entry (not yet a UI button). */
export type ReadingAssistPromptCopyCatalogActionKey =
  | "look_closer"
  | "see_source"
  | "compare_views";

/** v26: curated copy catalog entry — static title/body, no generated language. */
export type ReadingAssistPromptCopyCatalogEntry = {
  id: ReadingAssistPromptCopyCatalogEntryId;
  libraryFamily: ReadingAssistPromptCopyLibraryFamily;
  toneProfile: ReadingAssistPromptCopyLibraryToneProfile;
  variantKey: ReadingAssistPromptCopyLibraryVariantKey;
  title: string;
  body: string;
  actionKey: ReadingAssistPromptCopyCatalogActionKey;
};

/** v26: binding from a library record to primary/secondary catalog entries. */
export type ReadingAssistPromptCopyCatalogBinding = {
  id: string;
  sentenceId: string;
  anchorId: string;
  signalId: string;
  bundleId: string;
  crossLinkId: string;
  slotId: string;
  selectionId: string;
  recordId: string;
  primaryCatalogEntryId: ReadingAssistPromptCopyCatalogEntryId;
  secondaryCatalogEntryId: ReadingAssistPromptCopyCatalogEntryId | null;
  createdAt: string;
};

/** v26: all prompt copy catalog bindings keyed by id. */
export type ReadingAssistPromptCopyCatalogBindingSummary = {
  bindings: Record<string, ReadingAssistPromptCopyCatalogBinding>;
  bindingIds: string[];
};

export const DEFAULT_READING_ASSIST_PROMPT_COPY_CATALOG_BINDING_SUMMARY: ReadingAssistPromptCopyCatalogBindingSummary =
  {
    bindings: {},
    bindingIds: [],
  };

/** v27: presentation posture for display-ready prompt records. */
export type ReadingAssistPromptPresentationPosture =
  | "inline_gentle"
  | "inline_source"
  | "inline_compare";

/** v27: visibility readiness (eligible default; deferred reserved for future pacing). */
export type ReadingAssistPromptVisibilityReadiness = "eligible" | "deferred";

/** v27: render-ready presentation record with title/body/actionKey from catalog. */
export type ReadingAssistPromptPresentationRecord = {
  id: string;
  sentenceId: string;
  anchorId: string;
  signalId: string;
  bundleId: string;
  crossLinkId: string;
  slotId: string;
  selectionId: string;
  recordId: string;
  bindingId: string;
  primaryCatalogEntryId: ReadingAssistPromptCopyCatalogEntryId;
  secondaryCatalogEntryId: ReadingAssistPromptCopyCatalogEntryId | null;
  title: string;
  body: string;
  actionKey: ReadingAssistPromptCopyCatalogActionKey;
  posture: ReadingAssistPromptPresentationPosture;
  readiness: ReadingAssistPromptVisibilityReadiness;
  createdAt: string;
};

/** v27: all prompt presentation records keyed by id. */
export type ReadingAssistPromptPresentationRecordSummary = {
  records: Record<string, ReadingAssistPromptPresentationRecord>;
  recordIds: string[];
};

export const DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY: ReadingAssistPromptPresentationRecordSummary =
  {
    records: {},
    recordIds: [],
  };

/** v28: prompt surface placement (after_sentence default; within_sentence_flow reserved). */
export type ReadingAssistPromptSurfacePlacement = "after_sentence" | "within_sentence_flow";

/** v28: structural action posture for surface candidate (not UI behavior yet). */
export type ReadingAssistPromptSurfaceAffordance =
  | "tap_inline"
  | "expand_inline"
  | "compare_inline";

/** v28: prompt surface priority (normal for gentle/source; elevated for compare). */
export type ReadingAssistPromptSurfacePriority = "normal" | "elevated";

/** v28: mount-ready surface candidate derived from presentation record. */
export type ReadingAssistPromptSurfaceCandidate = {
  id: string;
  sentenceId: string;
  anchorId: string;
  signalId: string;
  bundleId: string;
  crossLinkId: string;
  slotId: string;
  selectionId: string;
  recordId: string;
  bindingId: string;
  presentationRecordId: string;
  title: string;
  body: string;
  actionKey: ReadingAssistPromptCopyCatalogActionKey;
  posture: ReadingAssistPromptPresentationPosture;
  readiness: ReadingAssistPromptVisibilityReadiness;
  placement: ReadingAssistPromptSurfacePlacement;
  affordance: ReadingAssistPromptSurfaceAffordance;
  priority: ReadingAssistPromptSurfacePriority;
  createdAt: string;
};

/** v28: all prompt surface candidates keyed by id. */
export type ReadingAssistPromptSurfaceCandidateSummary = {
  candidates: Record<string, ReadingAssistPromptSurfaceCandidate>;
  candidateIds: string[];
};

export const DEFAULT_READING_ASSIST_PROMPT_SURFACE_CANDIDATE_SUMMARY: ReadingAssistPromptSurfaceCandidateSummary =
  {
    candidates: {},
    candidateIds: [],
  };

/** v29: prompt mount status (mountable when eligible; held reserved for future pacing). */
export type ReadingAssistPromptMountStatus = "mountable" | "held";

/** v29: structural orchestration metadata for when to consider mounting. */
export type ReadingAssistPromptMountTrigger =
  | "sentence_settle"
  | "sentence_expand"
  | "sentence_compare";

/** v29: inline expansion mode for mount orchestration. */
export type ReadingAssistPromptExpansionMode =
  | "collapsed_inline"
  | "expandable_inline"
  | "compare_inline";

/** v29: prompt mount urgency (standard vs heightened for elevated priority). */
export type ReadingAssistPromptMountUrgency = "standard" | "heightened";

/** v29: mount-orchestration plan derived from surface candidate. */
export type ReadingAssistPromptMountPlan = {
  id: string;
  sentenceId: string;
  anchorId: string;
  signalId: string;
  bundleId: string;
  crossLinkId: string;
  slotId: string;
  selectionId: string;
  recordId: string;
  bindingId: string;
  presentationRecordId: string;
  surfaceCandidateId: string;
  title: string;
  body: string;
  actionKey: ReadingAssistPromptCopyCatalogActionKey;
  posture: ReadingAssistPromptPresentationPosture;
  readiness: ReadingAssistPromptVisibilityReadiness;
  placement: ReadingAssistPromptSurfacePlacement;
  affordance: ReadingAssistPromptSurfaceAffordance;
  priority: ReadingAssistPromptSurfacePriority;
  mountStatus: ReadingAssistPromptMountStatus;
  mountTrigger: ReadingAssistPromptMountTrigger;
  expansionMode: ReadingAssistPromptExpansionMode;
  urgency: ReadingAssistPromptMountUrgency;
  createdAt: string;
};

/** v29: all prompt mount plans keyed by id. */
export type ReadingAssistPromptMountPlanSummary = {
  plans: Record<string, ReadingAssistPromptMountPlan>;
  planIds: string[];
};

export const DEFAULT_READING_ASSIST_PROMPT_MOUNT_PLAN_SUMMARY: ReadingAssistPromptMountPlanSummary =
  {
    plans: {},
    planIds: [],
  };

/** v30: app-facing selected prompt payload (derived from mount plan; no UI props). */
export type ReadingAssistActivePrompt = {
  sentenceId: string;
  anchorId: string;
  signalId: string;
  bundleId: string;
  crossLinkId: string;
  slotId: string;
  selectionId: string;
  recordId: string;
  bindingId: string;
  presentationRecordId: string;
  surfaceCandidateId: string;
  mountPlanId: string;
  title: string;
  body: string;
  actionKey: ReadingAssistPromptCopyCatalogActionKey;
  posture: ReadingAssistPromptPresentationPosture;
  readiness: ReadingAssistPromptVisibilityReadiness;
  placement: ReadingAssistPromptSurfacePlacement;
  affordance: ReadingAssistPromptSurfaceAffordance;
  priority: ReadingAssistPromptSurfacePriority;
  mountStatus: ReadingAssistPromptMountStatus;
  mountTrigger: ReadingAssistPromptMountTrigger;
  expansionMode: ReadingAssistPromptExpansionMode;
  urgency: ReadingAssistPromptMountUrgency;
};

/** v30: result of active prompt selection (one prompt or none). */
export type ReadingAssistActivePromptSelectionResult = {
  activePrompt: ReadingAssistActivePrompt | null;
};

/** v26: deterministic curated copy catalog. */
export const READING_ASSIST_PROMPT_COPY_CATALOG: Record<
  ReadingAssistPromptCopyCatalogEntryId,
  ReadingAssistPromptCopyCatalogEntry
> = {
  catalog_explore_warm_v1: {
    id: "catalog_explore_warm_v1",
    libraryFamily: "library_explore",
    toneProfile: "warm",
    variantKey: "v1",
    title: "Something interesting is happening here.",
    body: "This sentence feels worth a closer look.",
    actionKey: "look_closer",
  },
  catalog_explore_warm_v2: {
    id: "catalog_explore_warm_v2",
    libraryFamily: "library_explore",
    toneProfile: "warm",
    variantKey: "v2",
    title: "There may be more to this point.",
    body: "Want to take a second look?",
    actionKey: "look_closer",
  },
  catalog_source_warm_v1: {
    id: "catalog_source_warm_v1",
    libraryFamily: "library_source",
    toneProfile: "warm",
    variantKey: "v1",
    title: "There's something behind this idea.",
    body: "You can trace where this point is coming from.",
    actionKey: "see_source",
  },
  catalog_source_warm_v2: {
    id: "catalog_source_warm_v2",
    libraryFamily: "library_source",
    toneProfile: "warm",
    variantKey: "v2",
    title: "This point has a trail to follow.",
    body: "Want to see the source behind it?",
    actionKey: "see_source",
  },
  catalog_compare_calm_v1: {
    id: "catalog_compare_calm_v1",
    libraryFamily: "library_compare",
    toneProfile: "calm",
    variantKey: "v1",
    title: "There's more than one way to read this.",
    body: "A softer comparison might help here.",
    actionKey: "compare_views",
  },
  catalog_compare_calm_v2: {
    id: "catalog_compare_calm_v2",
    libraryFamily: "library_compare",
    toneProfile: "calm",
    variantKey: "v2",
    title: "This point may open into a wider view.",
    body: "You can look at how other readings line up.",
    actionKey: "compare_views",
  },
};

/** v11: verification-aware reading path summary. Derived and observational. */
export interface ReadingAssistReadingPathSummary {
  examinedBlockIds: string[];
  examinedSentenceIds: string[];
  blocks: Record<string, ReadingAssistExaminedBlock>;
  sentences: Record<string, ReadingAssistExaminedSentence>;
  lastExaminedBlockId: string | null;
  lastExaminedSentenceId: string | null;
  /** v12: disagreement-ready examination markers. */
  markers: ReadingAssistExaminationMarker[];
  markerIds: string[];
  observedBacktrackCount: number;
  /** v13: claim-ready anchor slots for future claim/source attachment. */
  anchorSummary: ReadingAssistClaimReadyAnchorSummary;
  /** v15: verification-ready attachment registries. */
  attachmentRegistry: ReadingAssistAttachmentRegistrySummary;
  /** v19: placeholder cross-link slots. */
  crossLinkSummary: ReadingAssistPlaceholderCrossLinkSummary;
  /** v20: verification bundle skeletons derived from cross-links. */
  verificationBundleSummary: ReadingAssistVerificationBundleSummary;
  /** v21: retrieval indexes over verification bundles. */
  verificationBundleIndexSummary: ReadingAssistVerificationBundleIndexSummary;
  /** v22: curiosity signal skeletons derived from verification bundles. */
  curiositySignalSummary: ReadingAssistCuriositySignalSummary;
  /** v23: prompt tone slots derived from curiosity signals. */
  promptToneSlotSummary: ReadingAssistPromptToneSlotSummary;
  /** v24: prompt copy selection keys derived from prompt tone slots. */
  promptCopySelectionSummary: ReadingAssistPromptCopySelectionSummary;
  /** v25: prompt copy library records derived from prompt copy selections. */
  promptCopyLibraryRecordSummary: ReadingAssistPromptCopyLibraryRecordSummary;
  /** v26: prompt copy catalog bindings derived from prompt copy library records. */
  promptCopyCatalogBindingSummary: ReadingAssistPromptCopyCatalogBindingSummary;
  /** v27: prompt presentation records derived from prompt copy catalog bindings. */
  promptPresentationRecordSummary: ReadingAssistPromptPresentationRecordSummary;
  /** v28: prompt surface candidates derived from prompt presentation records. */
  promptSurfaceCandidateSummary: ReadingAssistPromptSurfaceCandidateSummary;
  /** v29: prompt mount plans derived from prompt surface candidates. */
  promptMountPlanSummary: ReadingAssistPromptMountPlanSummary;
}

export const DEFAULT_READING_ASSIST_READING_PATH_SUMMARY: ReadingAssistReadingPathSummary = {
  examinedBlockIds: [],
  examinedSentenceIds: [],
  blocks: {},
  sentences: {},
  lastExaminedBlockId: null,
  lastExaminedSentenceId: null,
  markers: [],
  markerIds: [],
  observedBacktrackCount: 0,
  anchorSummary: DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY,
  attachmentRegistry: DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
  crossLinkSummary: DEFAULT_READING_ASSIST_PLACEHOLDER_CROSS_LINK_SUMMARY,
  verificationBundleSummary: DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY,
  verificationBundleIndexSummary: DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY,
  curiositySignalSummary: DEFAULT_READING_ASSIST_CURIOSITY_SIGNAL_SUMMARY,
  promptToneSlotSummary: DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY,
  promptCopySelectionSummary: DEFAULT_READING_ASSIST_PROMPT_COPY_SELECTION_SUMMARY,
  promptCopyLibraryRecordSummary: DEFAULT_READING_ASSIST_PROMPT_COPY_LIBRARY_RECORD_SUMMARY,
  promptCopyCatalogBindingSummary: DEFAULT_READING_ASSIST_PROMPT_COPY_CATALOG_BINDING_SUMMARY,
  promptPresentationRecordSummary: DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY,
  promptSurfaceCandidateSummary: DEFAULT_READING_ASSIST_PROMPT_SURFACE_CANDIDATE_SUMMARY,
  promptMountPlanSummary: DEFAULT_READING_ASSIST_PROMPT_MOUNT_PLAN_SUMMARY,
};

/**
 * v12: deterministic id for a reading-assist examination marker.
 * Uniqueness relies on kind + blockId + sentenceId + createdAt (and multiple markers per event use different kinds).
 */
export function createReadingAssistMarkerId(
  kind: ReadingAssistMarkerKind,
  blockId: string | null,
  sentenceId: string | null,
  createdAt: number
): string {
  const b = blockId ?? "";
  const s = sentenceId ?? "";
  return `ra-marker|${kind}|${b}|${s}|${createdAt}`;
}

/**
 * v19: deterministic id for a placeholder cross-link.
 */
export function createReadingAssistPlaceholderCrossLinkId(
  sentenceId: string,
  claimId: string | null,
  sourceId: string | null,
  disagreementId: string | null,
  verificationId: string | null
): string {
  const c = claimId ?? "";
  const s = sourceId ?? "";
  const d = disagreementId ?? "";
  const v = verificationId ?? "";
  return `ra-cross-link|${sentenceId}|${c}|${s}|${d}|${v}`;
}

/**
 * v19: ensure a cross-link exists; add to linkIds if missing. Pure. Preserves original createdAt.
 * If a link with the same id exists and the new link has disagreementId set where the existing does not, update it.
 */
export function ensureReadingAssistPlaceholderCrossLink(
  summary: ReadingAssistPlaceholderCrossLinkSummary,
  link: ReadingAssistPlaceholderCrossLink
): ReadingAssistPlaceholderCrossLinkSummary {
  const existing = summary.links[link.id];
  if (existing) {
    if (link.disagreementId != null && existing.disagreementId === null) {
      const links = { ...summary.links, [link.id]: { ...existing, disagreementId: link.disagreementId } };
      return { ...summary, links };
    }
    return summary;
  }
  const links = { ...summary.links, [link.id]: link };
  const linkIds = summary.linkIds.includes(link.id) ? summary.linkIds : [...summary.linkIds, link.id];
  return { links, linkIds };
}

/**
 * v20: deterministic id for a verification bundle from its cross-link id.
 */
export function createReadingAssistVerificationBundleId(crossLinkId: string): string {
  return `ra-verification-bundle|${crossLinkId}`;
}

/**
 * v20: ensure a verification bundle exists; add to bundleIds if missing. Pure.
 * Preserves original createdAt. Updates disagreementId when existing is null and incoming is non-null.
 */
export function ensureReadingAssistVerificationBundle(
  summary: ReadingAssistVerificationBundleSummary,
  bundle: ReadingAssistVerificationBundle
): ReadingAssistVerificationBundleSummary {
  const existing = summary.bundles[bundle.id];
  if (existing) {
    if (bundle.disagreementId != null && existing.disagreementId === null) {
      const bundles = { ...summary.bundles, [bundle.id]: { ...existing, disagreementId: bundle.disagreementId } };
      return { ...summary, bundles };
    }
    return summary;
  }
  const bundles = { ...summary.bundles, [bundle.id]: bundle };
  const bundleIds = summary.bundleIds.includes(bundle.id) ? summary.bundleIds : [...summary.bundleIds, bundle.id];
  return { bundles, bundleIds };
}

/**
 * v20: materialize one verification bundle from a cross-link. Operates from cross-link layer only.
 */
export function ensureVerificationBundleForCrossLink(
  verificationBundleSummary: ReadingAssistVerificationBundleSummary,
  crossLinkSummary: ReadingAssistPlaceholderCrossLinkSummary,
  crossLinkId: string
): ReadingAssistVerificationBundleSummary {
  const link = crossLinkSummary.links[crossLinkId];
  if (!link || link.claimId == null || link.sourceId == null || link.verificationId == null) {
    return verificationBundleSummary;
  }
  const id = createReadingAssistVerificationBundleId(crossLinkId);
  const bundle: ReadingAssistVerificationBundle = {
    id,
    sentenceId: link.sentenceId,
    anchorId: link.anchorId,
    crossLinkId,
    claimId: link.claimId,
    sourceId: link.sourceId,
    verificationId: link.verificationId,
    disagreementId: link.disagreementId,
    createdAt: String(link.createdAt ?? ""),
  };
  return ensureReadingAssistVerificationBundle(verificationBundleSummary, bundle);
}

/**
 * v21: ensure an id is present in an index map under key. Pure; no duplicate ids; immutable.
 */
export function ensureReadingAssistIdIndexEntry(
  indexMap: Record<string, string[]>,
  key: string | null | undefined,
  id: string
): Record<string, string[]> {
  if (key == null || key === "") return indexMap;
  const existing = indexMap[key];
  if (existing?.includes(id)) return indexMap;
  const nextList = existing ? [...existing, id] : [id];
  return { ...indexMap, [key]: nextList };
}

/**
 * v21: index a single bundle into all relevant index dimensions. Idempotent; no duplicate bundle ids.
 */
export function ensureReadingAssistVerificationBundleIndexes(
  summary: ReadingAssistVerificationBundleIndexSummary,
  bundle: ReadingAssistVerificationBundle
): ReadingAssistVerificationBundleIndexSummary {
  const bySentenceId = ensureReadingAssistIdIndexEntry(summary.bySentenceId, bundle.sentenceId, bundle.id);
  const byAnchorId = ensureReadingAssistIdIndexEntry(summary.byAnchorId, bundle.anchorId, bundle.id);
  const byClaimId = ensureReadingAssistIdIndexEntry(summary.byClaimId, bundle.claimId, bundle.id);
  const bySourceId = ensureReadingAssistIdIndexEntry(summary.bySourceId, bundle.sourceId, bundle.id);
  const byVerificationId = ensureReadingAssistIdIndexEntry(summary.byVerificationId, bundle.verificationId, bundle.id);
  const byDisagreementId =
    bundle.disagreementId != null
      ? ensureReadingAssistIdIndexEntry(summary.byDisagreementId, bundle.disagreementId, bundle.id)
      : summary.byDisagreementId;
  return {
    bySentenceId,
    byAnchorId,
    byClaimId,
    bySourceId,
    byVerificationId,
    byDisagreementId,
  };
}

/**
 * v21: ensure indexes for one bundle by id. Operates from bundle layer only.
 */
export function ensureVerificationBundleIndexesForBundleId(
  indexSummary: ReadingAssistVerificationBundleIndexSummary,
  verificationBundleSummary: ReadingAssistVerificationBundleSummary,
  bundleId: string
): ReadingAssistVerificationBundleIndexSummary {
  const bundle = verificationBundleSummary.bundles[bundleId];
  if (!bundle) return indexSummary;
  return ensureReadingAssistVerificationBundleIndexes(indexSummary, bundle);
}

/**
 * v22: deterministic id for a curiosity signal from its bundle id. One signal per bundle.
 */
export function createReadingAssistCuriositySignalId(bundleId: string): string {
  return `ra-curiosity-signal|${bundleId}`;
}

/**
 * v22: build stable, deduplicated signal kinds from a bundle. Deterministic order.
 */
export function buildReadingAssistCuriositySignalKinds(
  bundle: ReadingAssistVerificationBundle
): ReadingAssistCuriositySignalKind[] {
  const kinds: ReadingAssistCuriositySignalKind[] = [
    "explore_point",
    "source_available",
    "verification_opportunity",
  ];
  if (bundle.disagreementId != null) {
    kinds.push("disagreement_present");
  }
  return kinds;
}

/**
 * v22: ensure a curiosity signal exists; add to signalIds if missing. Pure.
 * Preserves original createdAt. Expands signalKinds additively (e.g. add disagreement_present when later set).
 */
export function ensureReadingAssistCuriositySignal(
  summary: ReadingAssistCuriositySignalSummary,
  signal: ReadingAssistCuriositySignal
): ReadingAssistCuriositySignalSummary {
  const existing = summary.signals[signal.id];
  if (existing) {
    const hasNewDisagreement =
      signal.signalKinds.includes("disagreement_present") && !existing.signalKinds.includes("disagreement_present");
    if (!hasNewDisagreement) return summary;
    const mergedKinds = [...existing.signalKinds];
    if (!mergedKinds.includes("disagreement_present")) mergedKinds.push("disagreement_present");
    const signals = {
      ...summary.signals,
      [signal.id]: { ...existing, signalKinds: mergedKinds },
    };
    return { ...summary, signals };
  }
  const signals = { ...summary.signals, [signal.id]: signal };
  const signalIds = summary.signalIds.includes(signal.id) ? summary.signalIds : [...summary.signalIds, signal.id];
  return { signals, signalIds };
}

/**
 * v22: materialize one curiosity signal from a bundle. Operates from bundle layer only.
 */
export function ensureCuriositySignalForBundleId(
  curiositySignalSummary: ReadingAssistCuriositySignalSummary,
  verificationBundleSummary: ReadingAssistVerificationBundleSummary,
  bundleId: string
): ReadingAssistCuriositySignalSummary {
  const bundle = verificationBundleSummary.bundles[bundleId];
  if (!bundle) return curiositySignalSummary;
  const id = createReadingAssistCuriositySignalId(bundleId);
  const signal: ReadingAssistCuriositySignal = {
    id,
    sentenceId: bundle.sentenceId,
    anchorId: bundle.anchorId,
    bundleId: bundle.id,
    crossLinkId: bundle.crossLinkId,
    signalKinds: buildReadingAssistCuriositySignalKinds(bundle),
    createdAt: bundle.createdAt,
  };
  return ensureReadingAssistCuriositySignal(curiositySignalSummary, signal);
}

/**
 * v23: deterministic id for a prompt tone slot from its signal id. One slot per curiosity signal.
 */
export function createReadingAssistPromptToneSlotId(signalId: string): string {
  return `ra-prompt-tone-slot|${signalId}`;
}

/**
 * v23: build stable, deduplicated slot kinds from a curiosity signal. Deterministic order.
 */
export function buildReadingAssistPromptToneSlotKinds(
  signal: ReadingAssistCuriositySignal
): ReadingAssistPromptToneSlotKind[] {
  const kinds: ReadingAssistPromptToneSlotKind[] = ["gentle_nudge", "curious_invite"];
  if (signal.signalKinds.includes("source_available")) {
    kinds.push("source_peek");
  }
  if (signal.signalKinds.includes("disagreement_present")) {
    kinds.push("soft_compare");
  }
  return kinds;
}

/**
 * v23: derive tone family from signal. Conservative: neutral_warm or calm only in v23.
 */
export function deriveReadingAssistPromptToneFamily(
  signal: ReadingAssistCuriositySignal
): ReadingAssistPromptToneFamily {
  return signal.signalKinds.includes("disagreement_present") ? "calm" : "neutral_warm";
}

/**
 * v23: derive intensity from signal. low unless disagreement present.
 */
export function deriveReadingAssistPromptToneIntensity(
  signal: ReadingAssistCuriositySignal
): ReadingAssistPromptToneIntensity {
  return signal.signalKinds.includes("disagreement_present") ? "medium" : "low";
}

/**
 * v23: ensure a prompt tone slot exists; add to slotIds if missing. Pure.
 * Preserves original createdAt. Expands slotKinds additively; upgrades toneFamily and intensity when disagreement appears.
 */
export function ensureReadingAssistPromptToneSlot(
  summary: ReadingAssistPromptToneSlotSummary,
  slot: ReadingAssistPromptToneSlot
): ReadingAssistPromptToneSlotSummary {
  const existing = summary.slots[slot.id];
  if (existing) {
    const hasNewSoftCompare =
      slot.slotKinds.includes("soft_compare") && !existing.slotKinds.includes("soft_compare");
    const familyUpgrade = slot.toneFamily === "calm" && existing.toneFamily === "neutral_warm";
    const intensityUpgrade = slot.intensity === "medium" && existing.intensity === "low";
    if (!hasNewSoftCompare && !familyUpgrade && !intensityUpgrade) return summary;
    const mergedKinds = [...existing.slotKinds];
    if (slot.slotKinds.includes("soft_compare") && !mergedKinds.includes("soft_compare")) {
      mergedKinds.push("soft_compare");
    }
    const toneFamily = familyUpgrade ? "calm" : existing.toneFamily;
    const intensity = intensityUpgrade ? "medium" : existing.intensity;
    const slots = {
      ...summary.slots,
      [slot.id]: { ...existing, slotKinds: mergedKinds, toneFamily, intensity },
    };
    return { ...summary, slots };
  }
  const slots = { ...summary.slots, [slot.id]: slot };
  const slotIds = summary.slotIds.includes(slot.id) ? summary.slotIds : [...summary.slotIds, slot.id];
  return { slots, slotIds };
}

/**
 * v23: materialize one prompt tone slot from a curiosity signal. Operates from signal layer only.
 */
export function ensurePromptToneSlotForSignalId(
  promptToneSlotSummary: ReadingAssistPromptToneSlotSummary,
  curiositySignalSummary: ReadingAssistCuriositySignalSummary,
  signalId: string
): ReadingAssistPromptToneSlotSummary {
  const signal = curiositySignalSummary.signals[signalId];
  if (!signal) return promptToneSlotSummary;
  const id = createReadingAssistPromptToneSlotId(signalId);
  const slot: ReadingAssistPromptToneSlot = {
    id,
    sentenceId: signal.sentenceId,
    anchorId: signal.anchorId,
    signalId: signal.id,
    bundleId: signal.bundleId,
    crossLinkId: signal.crossLinkId,
    slotKinds: buildReadingAssistPromptToneSlotKinds(signal),
    toneFamily: deriveReadingAssistPromptToneFamily(signal),
    intensity: deriveReadingAssistPromptToneIntensity(signal),
    createdAt: signal.createdAt,
  };
  return ensureReadingAssistPromptToneSlot(promptToneSlotSummary, slot);
}

/**
 * v24: deterministic id for a prompt copy selection from its slot id. One selection per prompt tone slot.
 */
export function createReadingAssistPromptCopySelectionId(slotId: string): string {
  return `ra-prompt-copy-selection|${slotId}`;
}

const COPY_KEY_RANK: Record<ReadingAssistPromptCopyKey, number> = {
  copy_explore_gentle: 0,
  copy_source_peek: 1,
  copy_compare_soft: 2,
};

/**
 * v24: derive primary copy key from slot. Order: soft_compare > source_peek > explore_gentle.
 */
export function deriveReadingAssistPrimaryPromptCopyKey(
  slot: ReadingAssistPromptToneSlot
): ReadingAssistPromptCopyKey {
  if (slot.slotKinds.includes("soft_compare")) return "copy_compare_soft";
  if (slot.slotKinds.includes("source_peek")) return "copy_source_peek";
  return "copy_explore_gentle";
}

/**
 * v24: derive secondary copy key from slot. Fallback hierarchy; null when primary is explore_gentle.
 */
export function deriveReadingAssistSecondaryPromptCopyKey(
  slot: ReadingAssistPromptToneSlot
): ReadingAssistPromptCopyKey | null {
  const primary = deriveReadingAssistPrimaryPromptCopyKey(slot);
  if (primary === "copy_compare_soft") return "copy_source_peek";
  if (primary === "copy_source_peek") return "copy_explore_gentle";
  return null;
}

/**
 * v24: ensure a prompt copy selection exists; add to selectionIds if missing. Pure.
 * Preserves original createdAt. Allows conservative upgrades only; never regress.
 */
export function ensureReadingAssistPromptCopySelection(
  summary: ReadingAssistPromptCopySelectionSummary,
  selection: ReadingAssistPromptCopySelection
): ReadingAssistPromptCopySelectionSummary {
  const existing = summary.selections[selection.id];
  if (existing) {
    const primaryRankIn = COPY_KEY_RANK[selection.primaryCopyKey];
    const primaryRankEx = COPY_KEY_RANK[existing.primaryCopyKey];
    const primaryUpgrade = primaryRankIn > primaryRankEx;
    const secondaryFill =
      selection.secondaryCopyKey != null && existing.secondaryCopyKey === null;
    const familyUpgrade =
      selection.toneFamily === "calm" && existing.toneFamily === "neutral_warm";
    const intensityUpgrade =
      selection.intensity === "medium" && existing.intensity === "low";
    if (
      !primaryUpgrade &&
      !secondaryFill &&
      !familyUpgrade &&
      !intensityUpgrade
    )
      return summary;
    const primaryCopyKey = primaryUpgrade ? selection.primaryCopyKey : existing.primaryCopyKey;
    const secondaryCopyKey =
      primaryUpgrade && selection.secondaryCopyKey != null
        ? selection.secondaryCopyKey
        : secondaryFill && existing.secondaryCopyKey === null
          ? selection.secondaryCopyKey
          : existing.secondaryCopyKey;
    const toneFamily = familyUpgrade ? "calm" : existing.toneFamily;
    const intensity = intensityUpgrade ? "medium" : existing.intensity;
    const selections = {
      ...summary.selections,
      [selection.id]: {
        ...existing,
        primaryCopyKey,
        secondaryCopyKey,
        toneFamily,
        intensity,
      },
    };
    return { ...summary, selections };
  }
  const selections = { ...summary.selections, [selection.id]: selection };
  const selectionIds = summary.selectionIds.includes(selection.id)
    ? summary.selectionIds
    : [...summary.selectionIds, selection.id];
  return { selections, selectionIds };
}

/**
 * v24: materialize one prompt copy selection from a prompt tone slot. Operates from slot layer only.
 */
export function ensurePromptCopySelectionForSlotId(
  promptCopySelectionSummary: ReadingAssistPromptCopySelectionSummary,
  promptToneSlotSummary: ReadingAssistPromptToneSlotSummary,
  slotId: string
): ReadingAssistPromptCopySelectionSummary {
  const slot = promptToneSlotSummary.slots[slotId];
  if (!slot) return promptCopySelectionSummary;
  const id = createReadingAssistPromptCopySelectionId(slotId);
  const selection: ReadingAssistPromptCopySelection = {
    id,
    sentenceId: slot.sentenceId,
    anchorId: slot.anchorId,
    signalId: slot.signalId,
    bundleId: slot.bundleId,
    crossLinkId: slot.crossLinkId,
    slotId: slot.id,
    primaryCopyKey: deriveReadingAssistPrimaryPromptCopyKey(slot),
    secondaryCopyKey: deriveReadingAssistSecondaryPromptCopyKey(slot),
    toneFamily: slot.toneFamily,
    intensity: slot.intensity,
    createdAt: slot.createdAt,
  };
  return ensureReadingAssistPromptCopySelection(promptCopySelectionSummary, selection);
}

/**
 * v25: deterministic id for a prompt copy library record from its selection id. One record per selection.
 */
export function createReadingAssistPromptCopyLibraryRecordId(selectionId: string): string {
  return `ra-prompt-copy-library-record|${selectionId}`;
}

const LIBRARY_FAMILY_RANK: Record<ReadingAssistPromptCopyLibraryFamily, number> = {
  library_explore: 0,
  library_source: 1,
  library_compare: 2,
};

/**
 * v25: derive library family from selection primary copy key.
 */
export function deriveReadingAssistPromptCopyLibraryFamily(
  selection: ReadingAssistPromptCopySelection
): ReadingAssistPromptCopyLibraryFamily {
  if (selection.primaryCopyKey === "copy_compare_soft") return "library_compare";
  if (selection.primaryCopyKey === "copy_source_peek") return "library_source";
  return "library_explore";
}

/**
 * v25: derive tone profile from selection. calm when toneFamily calm or intensity medium.
 */
export function deriveReadingAssistPromptCopyLibraryToneProfile(
  selection: ReadingAssistPromptCopySelection
): ReadingAssistPromptCopyLibraryToneProfile {
  if (selection.toneFamily === "calm" || selection.intensity === "medium") return "calm";
  return "warm";
}

/**
 * v25: primary variant key. Always v1 in v25.
 */
export function deriveReadingAssistPrimaryPromptCopyLibraryVariantKey(
  _selection: ReadingAssistPromptCopySelection
): ReadingAssistPromptCopyLibraryVariantKey {
  return "v1";
}

/**
 * v25: secondary variant key. v2 when secondaryCopyKey present, else null.
 */
export function deriveReadingAssistSecondaryPromptCopyLibraryVariantKey(
  selection: ReadingAssistPromptCopySelection
): ReadingAssistPromptCopyLibraryVariantKey | null {
  return selection.secondaryCopyKey != null ? "v2" : null;
}

/**
 * v25: ensure a prompt copy library record exists; add to recordIds if missing. Pure.
 * Preserves original createdAt. Allows conservative upgrades only; never regress.
 */
export function ensureReadingAssistPromptCopyLibraryRecord(
  summary: ReadingAssistPromptCopyLibraryRecordSummary,
  record: ReadingAssistPromptCopyLibraryRecord
): ReadingAssistPromptCopyLibraryRecordSummary {
  const existing = summary.records[record.id];
  if (existing) {
    const familyRankIn = LIBRARY_FAMILY_RANK[record.libraryFamily];
    const familyRankEx = LIBRARY_FAMILY_RANK[existing.libraryFamily];
    const familyUpgrade = familyRankIn > familyRankEx;
    const secondaryCopyFill =
      record.secondaryCopyKey != null && existing.secondaryCopyKey === null;
    const secondaryVariantFill =
      record.secondaryVariantKey != null && existing.secondaryVariantKey === null;
    const toneUpgrade = record.toneProfile === "calm" && existing.toneProfile === "warm";
    if (
      !familyUpgrade &&
      !secondaryCopyFill &&
      !secondaryVariantFill &&
      !toneUpgrade
    )
      return summary;
    const libraryFamily = familyUpgrade ? record.libraryFamily : existing.libraryFamily;
    const primaryCopyKey = familyUpgrade ? record.primaryCopyKey : existing.primaryCopyKey;
    const secondaryCopyKey =
      familyUpgrade && record.secondaryCopyKey != null
        ? record.secondaryCopyKey
        : secondaryCopyFill && existing.secondaryCopyKey === null
          ? record.secondaryCopyKey
          : existing.secondaryCopyKey;
    const toneProfile = toneUpgrade ? "calm" : existing.toneProfile;
    const secondaryVariantKey =
      familyUpgrade && record.secondaryVariantKey != null
        ? record.secondaryVariantKey
        : secondaryVariantFill && existing.secondaryVariantKey === null
          ? record.secondaryVariantKey
          : existing.secondaryVariantKey;
    const records = {
      ...summary.records,
      [record.id]: {
        ...existing,
        libraryFamily,
        primaryCopyKey,
        secondaryCopyKey,
        toneProfile,
        secondaryVariantKey,
      },
    };
    return { ...summary, records };
  }
  const records = { ...summary.records, [record.id]: record };
  const recordIds = summary.recordIds.includes(record.id)
    ? summary.recordIds
    : [...summary.recordIds, record.id];
  return { records, recordIds };
}

/**
 * v25: materialize one prompt copy library record from a prompt copy selection. Operates from selection layer only.
 */
export function ensurePromptCopyLibraryRecordForSelectionId(
  promptCopyLibraryRecordSummary: ReadingAssistPromptCopyLibraryRecordSummary,
  promptCopySelectionSummary: ReadingAssistPromptCopySelectionSummary,
  selectionId: string
): ReadingAssistPromptCopyLibraryRecordSummary {
  const selection = promptCopySelectionSummary.selections[selectionId];
  if (!selection) return promptCopyLibraryRecordSummary;
  const id = createReadingAssistPromptCopyLibraryRecordId(selectionId);
  const record: ReadingAssistPromptCopyLibraryRecord = {
    id,
    sentenceId: selection.sentenceId,
    anchorId: selection.anchorId,
    signalId: selection.signalId,
    bundleId: selection.bundleId,
    crossLinkId: selection.crossLinkId,
    slotId: selection.slotId,
    selectionId: selection.id,
    libraryFamily: deriveReadingAssistPromptCopyLibraryFamily(selection),
    primaryCopyKey: selection.primaryCopyKey,
    secondaryCopyKey: selection.secondaryCopyKey,
    toneProfile: deriveReadingAssistPromptCopyLibraryToneProfile(selection),
    primaryVariantKey: deriveReadingAssistPrimaryPromptCopyLibraryVariantKey(selection),
    secondaryVariantKey: deriveReadingAssistSecondaryPromptCopyLibraryVariantKey(selection),
    createdAt: selection.createdAt,
  };
  return ensureReadingAssistPromptCopyLibraryRecord(promptCopyLibraryRecordSummary, record);
}

/**
 * v26: deterministic id for a prompt copy catalog binding from its library record id. One binding per record.
 */
export function createReadingAssistPromptCopyCatalogBindingId(recordId: string): string {
  return `ra-prompt-copy-catalog-binding|${recordId}`;
}

const CATALOG_ENTRY_ID_RANK: Record<ReadingAssistPromptCopyCatalogEntryId, number> = {
  catalog_explore_warm_v1: 0,
  catalog_explore_warm_v2: 0,
  catalog_source_warm_v1: 1,
  catalog_source_warm_v2: 1,
  catalog_compare_calm_v1: 2,
  catalog_compare_calm_v2: 2,
};

/**
 * v26: derive primary catalog entry id from library record. Deterministic and conservative.
 */
export function deriveReadingAssistPrimaryPromptCopyCatalogEntryId(
  record: ReadingAssistPromptCopyLibraryRecord
): ReadingAssistPromptCopyCatalogEntryId {
  if (record.libraryFamily === "library_compare") return "catalog_compare_calm_v1";
  if (record.libraryFamily === "library_source") return "catalog_source_warm_v1";
  return "catalog_explore_warm_v1";
}

/**
 * v26: derive secondary catalog entry id from library record when secondaryVariantKey is v2.
 */
export function deriveReadingAssistSecondaryPromptCopyCatalogEntryId(
  record: ReadingAssistPromptCopyLibraryRecord
): ReadingAssistPromptCopyCatalogEntryId | null {
  if (record.secondaryVariantKey !== "v2") return null;
  if (record.libraryFamily === "library_compare") return "catalog_compare_calm_v2";
  if (record.libraryFamily === "library_source") return "catalog_source_warm_v2";
  if (record.libraryFamily === "library_explore") return "catalog_explore_warm_v2";
  return null;
}

/**
 * v26: ensure a prompt copy catalog binding exists; add to bindingIds if missing. Pure.
 * Preserves original createdAt. Allows conservative upgrades only; never regress.
 */
export function ensureReadingAssistPromptCopyCatalogBinding(
  summary: ReadingAssistPromptCopyCatalogBindingSummary,
  binding: ReadingAssistPromptCopyCatalogBinding
): ReadingAssistPromptCopyCatalogBindingSummary {
  const existing = summary.bindings[binding.id];
  if (existing) {
    const primaryRankIn = CATALOG_ENTRY_ID_RANK[binding.primaryCatalogEntryId];
    const primaryRankEx = CATALOG_ENTRY_ID_RANK[existing.primaryCatalogEntryId];
    const primaryUpgrade = primaryRankIn > primaryRankEx;
    const secondaryFill =
      binding.secondaryCatalogEntryId != null && existing.secondaryCatalogEntryId === null;
    if (!primaryUpgrade && !secondaryFill) return summary;
    const primaryCatalogEntryId = primaryUpgrade ? binding.primaryCatalogEntryId : existing.primaryCatalogEntryId;
    const secondaryCatalogEntryId =
      primaryUpgrade && binding.secondaryCatalogEntryId != null
        ? binding.secondaryCatalogEntryId
        : secondaryFill && existing.secondaryCatalogEntryId === null
          ? binding.secondaryCatalogEntryId
          : existing.secondaryCatalogEntryId;
    const bindings = {
      ...summary.bindings,
      [binding.id]: {
        ...existing,
        primaryCatalogEntryId,
        secondaryCatalogEntryId,
      },
    };
    return { ...summary, bindings };
  }
  const bindings = { ...summary.bindings, [binding.id]: binding };
  const bindingIds = summary.bindingIds.includes(binding.id)
    ? summary.bindingIds
    : [...summary.bindingIds, binding.id];
  return { bindings, bindingIds };
}

/**
 * v26: materialize one prompt copy catalog binding from a prompt copy library record. Operates from record layer only.
 */
export function ensurePromptCopyCatalogBindingForRecordId(
  promptCopyCatalogBindingSummary: ReadingAssistPromptCopyCatalogBindingSummary,
  promptCopyLibraryRecordSummary: ReadingAssistPromptCopyLibraryRecordSummary,
  recordId: string
): ReadingAssistPromptCopyCatalogBindingSummary {
  const record = promptCopyLibraryRecordSummary.records[recordId];
  if (!record) return promptCopyCatalogBindingSummary;
  const id = createReadingAssistPromptCopyCatalogBindingId(recordId);
  const binding: ReadingAssistPromptCopyCatalogBinding = {
    id,
    sentenceId: record.sentenceId,
    anchorId: record.anchorId,
    signalId: record.signalId,
    bundleId: record.bundleId,
    crossLinkId: record.crossLinkId,
    slotId: record.slotId,
    selectionId: record.selectionId,
    recordId: record.id,
    primaryCatalogEntryId: deriveReadingAssistPrimaryPromptCopyCatalogEntryId(record),
    secondaryCatalogEntryId: deriveReadingAssistSecondaryPromptCopyCatalogEntryId(record),
    createdAt: record.createdAt,
  };
  return ensureReadingAssistPromptCopyCatalogBinding(promptCopyCatalogBindingSummary, binding);
}

/**
 * v27: deterministic id for a prompt presentation record from its binding id. One record per binding.
 */
export function createReadingAssistPromptPresentationRecordId(bindingId: string): string {
  return `ra-prompt-presentation-record|${bindingId}`;
}

/**
 * v27: derive presentation posture from binding primary catalog entry id.
 */
export function deriveReadingAssistPromptPresentationPosture(
  binding: ReadingAssistPromptCopyCatalogBinding
): ReadingAssistPromptPresentationPosture {
  if (binding.primaryCatalogEntryId === "catalog_compare_calm_v1") return "inline_compare";
  if (binding.primaryCatalogEntryId === "catalog_source_warm_v1") return "inline_source";
  return "inline_gentle";
}

/**
 * v27: derive visibility readiness. Always eligible in v27.
 */
export function deriveReadingAssistPromptVisibilityReadiness(
  _binding: ReadingAssistPromptCopyCatalogBinding
): ReadingAssistPromptVisibilityReadiness {
  return "eligible";
}

const PRESENTATION_POSTURE_RANK: Record<ReadingAssistPromptPresentationPosture, number> = {
  inline_gentle: 0,
  inline_source: 1,
  inline_compare: 2,
};

/**
 * v27: ensure a prompt presentation record exists; add to recordIds if missing. Pure.
 * Preserves original createdAt. Allows conservative upgrades only; never regress.
 */
export function ensureReadingAssistPromptPresentationRecord(
  summary: ReadingAssistPromptPresentationRecordSummary,
  record: ReadingAssistPromptPresentationRecord
): ReadingAssistPromptPresentationRecordSummary {
  const existing = summary.records[record.id];
  if (existing) {
    const primaryRankIn = CATALOG_ENTRY_ID_RANK[record.primaryCatalogEntryId];
    const primaryRankEx = CATALOG_ENTRY_ID_RANK[existing.primaryCatalogEntryId];
    const primaryUpgrade = primaryRankIn > primaryRankEx;
    const secondaryFill =
      record.secondaryCatalogEntryId != null && existing.secondaryCatalogEntryId === null;
    const postureRankIn = PRESENTATION_POSTURE_RANK[record.posture];
    const postureRankEx = PRESENTATION_POSTURE_RANK[existing.posture];
    const postureUpgrade = postureRankIn > postureRankEx;
    if (!primaryUpgrade && !secondaryFill && !postureUpgrade) return summary;
    const primaryCatalogEntryId = primaryUpgrade ? record.primaryCatalogEntryId : existing.primaryCatalogEntryId;
    const secondaryCatalogEntryId =
      primaryUpgrade && record.secondaryCatalogEntryId != null
        ? record.secondaryCatalogEntryId
        : secondaryFill && existing.secondaryCatalogEntryId === null
          ? record.secondaryCatalogEntryId
          : existing.secondaryCatalogEntryId;
    const posture = postureUpgrade ? record.posture : existing.posture;
    const title = primaryUpgrade ? record.title : existing.title;
    const body = primaryUpgrade ? record.body : existing.body;
    const actionKey = primaryUpgrade ? record.actionKey : existing.actionKey;
    const records = {
      ...summary.records,
      [record.id]: {
        ...existing,
        primaryCatalogEntryId,
        secondaryCatalogEntryId,
        title,
        body,
        actionKey,
        posture,
      },
    };
    return { ...summary, records };
  }
  const records = { ...summary.records, [record.id]: record };
  const recordIds = summary.recordIds.includes(record.id)
    ? summary.recordIds
    : [...summary.recordIds, record.id];
  return { records, recordIds };
}

/**
 * v27: materialize one prompt presentation record from a catalog binding. Operates from binding layer + catalog lookup.
 */
export function ensurePromptPresentationRecordForBindingId(
  promptPresentationRecordSummary: ReadingAssistPromptPresentationRecordSummary,
  promptCopyCatalogBindingSummary: ReadingAssistPromptCopyCatalogBindingSummary,
  bindingId: string
): ReadingAssistPromptPresentationRecordSummary {
  const binding = promptCopyCatalogBindingSummary.bindings[bindingId];
  if (!binding) return promptPresentationRecordSummary;
  const primaryCatalogEntry = READING_ASSIST_PROMPT_COPY_CATALOG[binding.primaryCatalogEntryId];
  const id = createReadingAssistPromptPresentationRecordId(bindingId);
  const record: ReadingAssistPromptPresentationRecord = {
    id,
    sentenceId: binding.sentenceId,
    anchorId: binding.anchorId,
    signalId: binding.signalId,
    bundleId: binding.bundleId,
    crossLinkId: binding.crossLinkId,
    slotId: binding.slotId,
    selectionId: binding.selectionId,
    recordId: binding.recordId,
    bindingId: binding.id,
    primaryCatalogEntryId: binding.primaryCatalogEntryId,
    secondaryCatalogEntryId: binding.secondaryCatalogEntryId,
    title: primaryCatalogEntry.title,
    body: primaryCatalogEntry.body,
    actionKey: primaryCatalogEntry.actionKey,
    posture: deriveReadingAssistPromptPresentationPosture(binding),
    readiness: deriveReadingAssistPromptVisibilityReadiness(binding),
    createdAt: binding.createdAt,
  };
  return ensureReadingAssistPromptPresentationRecord(promptPresentationRecordSummary, record);
}

/**
 * v28: deterministic id for a prompt surface candidate from its presentation record id. One candidate per presentation record.
 */
export function createReadingAssistPromptSurfaceCandidateId(presentationRecordId: string): string {
  return `ra-prompt-surface-candidate|${presentationRecordId}`;
}

/**
 * v28: derive surface placement. Always after_sentence in v28.
 */
export function deriveReadingAssistPromptSurfacePlacement(
  _record: ReadingAssistPromptPresentationRecord
): ReadingAssistPromptSurfacePlacement {
  return "after_sentence";
}

/**
 * v28: derive surface affordance from presentation posture.
 */
export function deriveReadingAssistPromptSurfaceAffordance(
  record: ReadingAssistPromptPresentationRecord
): ReadingAssistPromptSurfaceAffordance {
  if (record.posture === "inline_compare") return "compare_inline";
  if (record.posture === "inline_source") return "expand_inline";
  return "tap_inline";
}

/**
 * v28: derive surface priority from presentation posture.
 */
export function deriveReadingAssistPromptSurfacePriority(
  record: ReadingAssistPromptPresentationRecord
): ReadingAssistPromptSurfacePriority {
  return record.posture === "inline_compare" ? "elevated" : "normal";
}

const SURFACE_AFFORDANCE_RANK: Record<ReadingAssistPromptSurfaceAffordance, number> = {
  tap_inline: 0,
  expand_inline: 1,
  compare_inline: 2,
};

/**
 * v28: ensure a prompt surface candidate exists; add to candidateIds if missing. Pure.
 * Preserves original createdAt. Allows conservative upgrades only; never regress.
 */
export function ensureReadingAssistPromptSurfaceCandidate(
  summary: ReadingAssistPromptSurfaceCandidateSummary,
  candidate: ReadingAssistPromptSurfaceCandidate
): ReadingAssistPromptSurfaceCandidateSummary {
  const existing = summary.candidates[candidate.id];
  if (existing) {
    const postureRankIn = PRESENTATION_POSTURE_RANK[candidate.posture];
    const postureRankEx = PRESENTATION_POSTURE_RANK[existing.posture];
    const postureUpgrade = postureRankIn > postureRankEx;
    const affordanceRankIn = SURFACE_AFFORDANCE_RANK[candidate.affordance];
    const affordanceRankEx = SURFACE_AFFORDANCE_RANK[existing.affordance];
    const affordanceUpgrade = affordanceRankIn > affordanceRankEx;
    const priorityUpgrade =
      candidate.priority === "elevated" && existing.priority === "normal";
    if (!postureUpgrade && !affordanceUpgrade && !priorityUpgrade) return summary;
    const posture = postureUpgrade ? candidate.posture : existing.posture;
    const affordance = affordanceUpgrade ? candidate.affordance : existing.affordance;
    const priority = priorityUpgrade ? candidate.priority : existing.priority;
    const title = postureUpgrade ? candidate.title : existing.title;
    const body = postureUpgrade ? candidate.body : existing.body;
    const actionKey = postureUpgrade ? candidate.actionKey : existing.actionKey;
    const candidates = {
      ...summary.candidates,
      [candidate.id]: {
        ...existing,
        posture,
        affordance,
        priority,
        title,
        body,
        actionKey,
      },
    };
    return { ...summary, candidates };
  }
  const candidates = { ...summary.candidates, [candidate.id]: candidate };
  const candidateIds = summary.candidateIds.includes(candidate.id)
    ? summary.candidateIds
    : [...summary.candidateIds, candidate.id];
  return { candidates, candidateIds };
}

/**
 * v28: materialize one prompt surface candidate from a presentation record. Operates from presentation-record layer only.
 */
export function ensurePromptSurfaceCandidateForPresentationRecordId(
  promptSurfaceCandidateSummary: ReadingAssistPromptSurfaceCandidateSummary,
  promptPresentationRecordSummary: ReadingAssistPromptPresentationRecordSummary,
  presentationRecordId: string
): ReadingAssistPromptSurfaceCandidateSummary {
  const record = promptPresentationRecordSummary.records[presentationRecordId];
  if (!record) return promptSurfaceCandidateSummary;
  const id = createReadingAssistPromptSurfaceCandidateId(presentationRecordId);
  const candidate: ReadingAssistPromptSurfaceCandidate = {
    id,
    sentenceId: record.sentenceId,
    anchorId: record.anchorId,
    signalId: record.signalId,
    bundleId: record.bundleId,
    crossLinkId: record.crossLinkId,
    slotId: record.slotId,
    selectionId: record.selectionId,
    recordId: record.recordId,
    bindingId: record.bindingId,
    presentationRecordId: record.id,
    title: record.title,
    body: record.body,
    actionKey: record.actionKey,
    posture: record.posture,
    readiness: record.readiness,
    placement: deriveReadingAssistPromptSurfacePlacement(record),
    affordance: deriveReadingAssistPromptSurfaceAffordance(record),
    priority: deriveReadingAssistPromptSurfacePriority(record),
    createdAt: record.createdAt,
  };
  return ensureReadingAssistPromptSurfaceCandidate(promptSurfaceCandidateSummary, candidate);
}

/**
 * v29: deterministic id for a prompt mount plan from its surface candidate id. One plan per surface candidate.
 */
export function createReadingAssistPromptMountPlanId(surfaceCandidateId: string): string {
  return `ra-prompt-mount-plan|${surfaceCandidateId}`;
}

/**
 * v29: derive mount status from candidate readiness.
 */
export function deriveReadingAssistPromptMountStatus(
  candidate: ReadingAssistPromptSurfaceCandidate
): ReadingAssistPromptMountStatus {
  return candidate.readiness === "eligible" ? "mountable" : "held";
}

/**
 * v29: derive mount trigger from candidate posture.
 */
export function deriveReadingAssistPromptMountTrigger(
  candidate: ReadingAssistPromptSurfaceCandidate
): ReadingAssistPromptMountTrigger {
  if (candidate.posture === "inline_compare") return "sentence_compare";
  if (candidate.posture === "inline_source") return "sentence_expand";
  return "sentence_settle";
}

/**
 * v29: derive expansion mode from candidate posture.
 */
export function deriveReadingAssistPromptExpansionMode(
  candidate: ReadingAssistPromptSurfaceCandidate
): ReadingAssistPromptExpansionMode {
  if (candidate.posture === "inline_compare") return "compare_inline";
  if (candidate.posture === "inline_source") return "expandable_inline";
  return "collapsed_inline";
}

/**
 * v29: derive mount urgency from candidate priority.
 */
export function deriveReadingAssistPromptMountUrgency(
  candidate: ReadingAssistPromptSurfaceCandidate
): ReadingAssistPromptMountUrgency {
  return candidate.priority === "elevated" ? "heightened" : "standard";
}

const MOUNT_TRIGGER_RANK: Record<ReadingAssistPromptMountTrigger, number> = {
  sentence_settle: 0,
  sentence_expand: 1,
  sentence_compare: 2,
};

const EXPANSION_MODE_RANK: Record<ReadingAssistPromptExpansionMode, number> = {
  collapsed_inline: 0,
  expandable_inline: 1,
  compare_inline: 2,
};

/**
 * v29: ensure a prompt mount plan exists; add to planIds if missing. Pure.
 * Preserves original createdAt. Allows conservative upgrades only; never regress.
 */
export function ensureReadingAssistPromptMountPlan(
  summary: ReadingAssistPromptMountPlanSummary,
  plan: ReadingAssistPromptMountPlan
): ReadingAssistPromptMountPlanSummary {
  const existing = summary.plans[plan.id];
  if (existing) {
    const postureRankIn = PRESENTATION_POSTURE_RANK[plan.posture];
    const postureRankEx = PRESENTATION_POSTURE_RANK[existing.posture];
    const postureUpgrade = postureRankIn > postureRankEx;
    const affordanceRankIn = SURFACE_AFFORDANCE_RANK[plan.affordance];
    const affordanceRankEx = SURFACE_AFFORDANCE_RANK[existing.affordance];
    const affordanceUpgrade = affordanceRankIn > affordanceRankEx;
    const priorityUpgrade = plan.priority === "elevated" && existing.priority === "normal";
    const mountStatusUpgrade =
      plan.mountStatus === "mountable" && existing.mountStatus === "held";
    const triggerRankIn = MOUNT_TRIGGER_RANK[plan.mountTrigger];
    const triggerRankEx = MOUNT_TRIGGER_RANK[existing.mountTrigger];
    const triggerUpgrade = triggerRankIn > triggerRankEx;
    const expansionRankIn = EXPANSION_MODE_RANK[plan.expansionMode];
    const expansionRankEx = EXPANSION_MODE_RANK[existing.expansionMode];
    const expansionUpgrade = expansionRankIn > expansionRankEx;
    const urgencyUpgrade =
      plan.urgency === "heightened" && existing.urgency === "standard";
    if (
      !postureUpgrade &&
      !affordanceUpgrade &&
      !priorityUpgrade &&
      !mountStatusUpgrade &&
      !triggerUpgrade &&
      !expansionUpgrade &&
      !urgencyUpgrade
    )
      return summary;
    const posture = postureUpgrade ? plan.posture : existing.posture;
    const affordance = affordanceUpgrade ? plan.affordance : existing.affordance;
    const priority = priorityUpgrade ? plan.priority : existing.priority;
    const mountStatus = mountStatusUpgrade ? plan.mountStatus : existing.mountStatus;
    const mountTrigger = triggerUpgrade ? plan.mountTrigger : existing.mountTrigger;
    const expansionMode = expansionUpgrade ? plan.expansionMode : existing.expansionMode;
    const urgency = urgencyUpgrade ? plan.urgency : existing.urgency;
    const title = postureUpgrade ? plan.title : existing.title;
    const body = postureUpgrade ? plan.body : existing.body;
    const actionKey = postureUpgrade ? plan.actionKey : existing.actionKey;
    const plans = {
      ...summary.plans,
      [plan.id]: {
        ...existing,
        posture,
        affordance,
        priority,
        mountStatus,
        mountTrigger,
        expansionMode,
        urgency,
        title,
        body,
        actionKey,
      },
    };
    return { ...summary, plans };
  }
  const plans = { ...summary.plans, [plan.id]: plan };
  const planIds = summary.planIds.includes(plan.id)
    ? summary.planIds
    : [...summary.planIds, plan.id];
  return { plans, planIds };
}

/**
 * v29: materialize one prompt mount plan from a surface candidate. Operates from surface-candidate layer only.
 */
export function ensurePromptMountPlanForSurfaceCandidateId(
  promptMountPlanSummary: ReadingAssistPromptMountPlanSummary,
  promptSurfaceCandidateSummary: ReadingAssistPromptSurfaceCandidateSummary,
  surfaceCandidateId: string
): ReadingAssistPromptMountPlanSummary {
  const candidate = promptSurfaceCandidateSummary.candidates[surfaceCandidateId];
  if (!candidate) return promptMountPlanSummary;
  const id = createReadingAssistPromptMountPlanId(surfaceCandidateId);
  const plan: ReadingAssistPromptMountPlan = {
    id,
    sentenceId: candidate.sentenceId,
    anchorId: candidate.anchorId,
    signalId: candidate.signalId,
    bundleId: candidate.bundleId,
    crossLinkId: candidate.crossLinkId,
    slotId: candidate.slotId,
    selectionId: candidate.selectionId,
    recordId: candidate.recordId,
    bindingId: candidate.bindingId,
    presentationRecordId: candidate.presentationRecordId,
    surfaceCandidateId: candidate.id,
    title: candidate.title,
    body: candidate.body,
    actionKey: candidate.actionKey,
    posture: candidate.posture,
    readiness: candidate.readiness,
    placement: candidate.placement,
    affordance: candidate.affordance,
    priority: candidate.priority,
    mountStatus: deriveReadingAssistPromptMountStatus(candidate),
    mountTrigger: deriveReadingAssistPromptMountTrigger(candidate),
    expansionMode: deriveReadingAssistPromptExpansionMode(candidate),
    urgency: deriveReadingAssistPromptMountUrgency(candidate),
    createdAt: candidate.createdAt,
  };
  return ensureReadingAssistPromptMountPlan(promptMountPlanSummary, plan);
}

/**
 * v15/v16: ensure a claim attachment record exists; add anchorId and id to arrays if missing. Pure.
 * New records get placeholderKind 'marker-derived' and markerIds [].
 */
export function ensureClaimAttachmentRecord(
  registry: ReadingAssistAttachmentRegistrySummary,
  id: string,
  anchorId: string,
  createdAt: number | null
): ReadingAssistAttachmentRegistrySummary {
  const existing = registry.claimRegistry[id];
  if (existing) {
    const anchorIds = existing.anchorIds.includes(anchorId)
      ? existing.anchorIds
      : [...existing.anchorIds, anchorId];
    if (anchorIds === existing.anchorIds) return registry;
    const claimRegistry = { ...registry.claimRegistry };
    claimRegistry[id] = { ...existing, anchorIds };
    return { ...registry, claimRegistry };
  }
  const claimRegistry = { ...registry.claimRegistry };
  claimRegistry[id] = {
    id,
    anchorIds: [anchorId],
    createdAt,
    placeholderKind: "marker-derived",
    markerIds: [],
  };
  const claimIds = registry.claimIds.includes(id) ? registry.claimIds : [...registry.claimIds, id];
  return { ...registry, claimRegistry, claimIds };
}

/**
 * v16: attach a marker id to a claim attachment record's markerIds. Pure; no duplication.
 */
export function attachMarkerToClaimAttachmentRecord(
  registry: ReadingAssistAttachmentRegistrySummary,
  claimId: string,
  markerId: string
): ReadingAssistAttachmentRegistrySummary {
  const record = registry.claimRegistry[claimId];
  if (!record || record.markerIds.includes(markerId)) return registry;
  const claimRegistry = { ...registry.claimRegistry };
  claimRegistry[claimId] = { ...record, markerIds: [...record.markerIds, markerId] };
  return { ...registry, claimRegistry };
}

/**
 * v15/v17: ensure a source attachment record exists; add anchorId and id to arrays if missing. Pure.
 * New records get placeholderKind 'marker-derived' and markerIds [].
 */
export function ensureSourceAttachmentRecord(
  registry: ReadingAssistAttachmentRegistrySummary,
  id: string,
  anchorId: string,
  createdAt: number | null
): ReadingAssistAttachmentRegistrySummary {
  const existing = registry.sourceRegistry[id];
  if (existing) {
    const anchorIds = existing.anchorIds.includes(anchorId)
      ? existing.anchorIds
      : [...existing.anchorIds, anchorId];
    if (anchorIds === existing.anchorIds) return registry;
    const sourceRegistry = { ...registry.sourceRegistry };
    sourceRegistry[id] = { ...existing, anchorIds };
    return { ...registry, sourceRegistry };
  }
  const sourceRegistry = { ...registry.sourceRegistry };
  sourceRegistry[id] = {
    id,
    anchorIds: [anchorId],
    createdAt,
    placeholderKind: "marker-derived",
    markerIds: [],
  };
  const sourceIds = registry.sourceIds.includes(id) ? registry.sourceIds : [...registry.sourceIds, id];
  return { ...registry, sourceRegistry, sourceIds };
}

/**
 * v17: attach a marker id to a source attachment record's markerIds. Pure; no duplication.
 */
export function attachMarkerToSourceAttachmentRecord(
  registry: ReadingAssistAttachmentRegistrySummary,
  sourceId: string,
  markerId: string
): ReadingAssistAttachmentRegistrySummary {
  const record = registry.sourceRegistry[sourceId];
  if (!record || record.markerIds.includes(markerId)) return registry;
  const sourceRegistry = { ...registry.sourceRegistry };
  sourceRegistry[sourceId] = { ...record, markerIds: [...record.markerIds, markerId] };
  return { ...registry, sourceRegistry };
}

/**
 * v15/v18: ensure a disagreement attachment record exists; add anchorId and id to arrays if missing. Pure.
 * New records get placeholderKind 'marker-derived' and markerIds [].
 */
export function ensureDisagreementAttachmentRecord(
  registry: ReadingAssistAttachmentRegistrySummary,
  id: string,
  anchorId: string,
  createdAt: number | null
): ReadingAssistAttachmentRegistrySummary {
  const existing = registry.disagreementRegistry[id];
  if (existing) {
    const anchorIds = existing.anchorIds.includes(anchorId)
      ? existing.anchorIds
      : [...existing.anchorIds, anchorId];
    if (anchorIds === existing.anchorIds) return registry;
    const disagreementRegistry = { ...registry.disagreementRegistry };
    disagreementRegistry[id] = { ...existing, anchorIds };
    return { ...registry, disagreementRegistry };
  }
  const disagreementRegistry = { ...registry.disagreementRegistry };
  disagreementRegistry[id] = {
    id,
    anchorIds: [anchorId],
    createdAt,
    placeholderKind: "marker-derived",
    markerIds: [],
  };
  const disagreementIds = registry.disagreementIds.includes(id)
    ? registry.disagreementIds
    : [...registry.disagreementIds, id];
  return { ...registry, disagreementRegistry, disagreementIds };
}

/**
 * v18: attach a marker id to a disagreement attachment record's markerIds. Pure; no duplication.
 */
export function attachMarkerToDisagreementAttachmentRecord(
  registry: ReadingAssistAttachmentRegistrySummary,
  disagreementId: string,
  markerId: string
): ReadingAssistAttachmentRegistrySummary {
  const record = registry.disagreementRegistry[disagreementId];
  if (!record || record.markerIds.includes(markerId)) return registry;
  const disagreementRegistry = { ...registry.disagreementRegistry };
  disagreementRegistry[disagreementId] = { ...record, markerIds: [...record.markerIds, markerId] };
  return { ...registry, disagreementRegistry };
}

/**
 * v15: ensure a verification attachment record exists; add anchorId and id to arrays if missing. Pure.
 */
export function ensureVerificationAttachmentRecord(
  registry: ReadingAssistAttachmentRegistrySummary,
  id: string,
  anchorId: string,
  createdAt: number | null
): ReadingAssistAttachmentRegistrySummary {
  const existing = registry.verificationRegistry[id];
  if (existing) {
    const anchorIds = existing.anchorIds.includes(anchorId)
      ? existing.anchorIds
      : [...existing.anchorIds, anchorId];
    if (anchorIds === existing.anchorIds) return registry;
    const verificationRegistry = { ...registry.verificationRegistry };
    verificationRegistry[id] = { ...existing, anchorIds };
    return { ...registry, verificationRegistry };
  }
  const verificationRegistry = { ...registry.verificationRegistry };
  verificationRegistry[id] = { id, anchorIds: [anchorId], createdAt };
  const verificationIds = registry.verificationIds.includes(id)
    ? registry.verificationIds
    : [...registry.verificationIds, id];
  return { ...registry, verificationRegistry, verificationIds };
}

function mirrorDwellFromHeuristic(
  summary: ReadingAssistReadingPathSummary,
  heuristicSummary: ReadingAssistHeuristicSummary
): ReadingAssistReadingPathSummary {
  const blocks = { ...summary.blocks };
  for (const id of Object.keys(blocks)) {
    blocks[id] = { ...blocks[id], estimatedDwellMs: heuristicSummary.dwellByBlockId[id] ?? 0 };
  }
  const sentences = { ...summary.sentences };
  for (const id of Object.keys(sentences)) {
    sentences[id] = { ...sentences[id], estimatedDwellMs: heuristicSummary.dwellBySentenceId[id] ?? 0 };
  }
  return { ...summary, blocks, sentences };
}

function ensureBlockSlot(
  summary: ReadingAssistClaimReadyAnchorSummary,
  blockId: string,
  createdAt: number
): ReadingAssistClaimReadyAnchorSummary {
  const anchorId = createReadingAssistBlockAnchorId(blockId);
  if (summary.blockSlots[anchorId]) return summary;
  const blockSlots = { ...summary.blockSlots };
  const envelope = { ...DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE };
  blockSlots[anchorId] = {
    anchorId,
    blockId,
    sentenceId: null,
    slotType: "block",
    createdAt,
    markerIds: [],
    claimIds: [],
    sourceIds: [],
    disagreementIds: [],
    attachments: {
      markerIds: [...envelope.markerIds],
      claimIds: [...envelope.claimIds],
      sourceIds: [...envelope.sourceIds],
      disagreementIds: [...envelope.disagreementIds],
      verificationIds: [...envelope.verificationIds],
    },
  };
  return {
    ...summary,
    blockSlots,
    blockSlotIds: [...summary.blockSlotIds, anchorId],
  };
}

function ensureSentenceSlot(
  summary: ReadingAssistClaimReadyAnchorSummary,
  sentenceId: string,
  blockId: string | null,
  createdAt: number
): ReadingAssistClaimReadyAnchorSummary {
  const anchorId = createReadingAssistSentenceAnchorId(sentenceId);
  if (summary.sentenceSlots[anchorId]) return summary;
  const sentenceSlots = { ...summary.sentenceSlots };
  const envelope = { ...DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE };
  sentenceSlots[anchorId] = {
    anchorId,
    blockId,
    sentenceId,
    slotType: "sentence",
    createdAt,
    markerIds: [],
    claimIds: [],
    sourceIds: [],
    disagreementIds: [],
    attachments: {
      markerIds: [...envelope.markerIds],
      claimIds: [...envelope.claimIds],
      sourceIds: [...envelope.sourceIds],
      disagreementIds: [...envelope.disagreementIds],
      verificationIds: [...envelope.verificationIds],
    },
  };
  return {
    ...summary,
    sentenceSlots,
    sentenceSlotIds: [...summary.sentenceSlotIds, anchorId],
  };
}

function attachMarkerToSlots(
  summary: ReadingAssistClaimReadyAnchorSummary,
  markerId: string,
  blockId: string | null,
  sentenceId: string | null
): ReadingAssistClaimReadyAnchorSummary {
  let next = summary;
  if (blockId != null) {
    const aid = createReadingAssistBlockAnchorId(blockId);
    const slot = next.blockSlots[aid];
    if (slot && !slot.markerIds.includes(markerId)) {
      const blockSlots = { ...next.blockSlots };
      const newMarkerIds = [...slot.markerIds, markerId];
      const newAttachmentsMarkerIds = [...slot.attachments.markerIds, markerId];
      blockSlots[aid] = {
        ...slot,
        markerIds: newMarkerIds,
        attachments: { ...slot.attachments, markerIds: newAttachmentsMarkerIds },
      };
      next = { ...next, blockSlots };
    }
  }
  if (sentenceId != null) {
    const aid = createReadingAssistSentenceAnchorId(sentenceId);
    const slot = next.sentenceSlots[aid];
    if (slot && !slot.markerIds.includes(markerId)) {
      const sentenceSlots = { ...next.sentenceSlots };
      const newMarkerIds = [...slot.markerIds, markerId];
      const newAttachmentsMarkerIds = [...slot.attachments.markerIds, markerId];
      sentenceSlots[aid] = {
        ...slot,
        markerIds: newMarkerIds,
        attachments: { ...slot.attachments, markerIds: newAttachmentsMarkerIds },
      };
      next = { ...next, sentenceSlots };
    }
  }
  return next;
}

const VERIFICATION_PLACEHOLDER_PREFIX = "ra-verification-placeholder|";

function applyVerificationPlaceholderForMarker(
  registry: ReadingAssistAttachmentRegistrySummary,
  anchorSummary: ReadingAssistClaimReadyAnchorSummary,
  markerId: string,
  blockId: string | null,
  sentenceId: string | null,
  createdAt: number
): { registry: ReadingAssistAttachmentRegistrySummary; anchorSummary: ReadingAssistClaimReadyAnchorSummary } {
  const placeholderId = `${VERIFICATION_PLACEHOLDER_PREFIX}${markerId}`;
  let nextRegistry = registry;
  let nextSummary = anchorSummary;

  if (blockId != null) {
    const aid = createReadingAssistBlockAnchorId(blockId);
    const slot = nextSummary.blockSlots[aid];
    if (slot && slot.markerIds.includes(markerId)) {
      if (!slot.attachments.verificationIds.includes(placeholderId)) {
        const blockSlots = { ...nextSummary.blockSlots };
        blockSlots[aid] = {
          ...slot,
          attachments: {
            ...slot.attachments,
            verificationIds: [...slot.attachments.verificationIds, placeholderId],
          },
        };
        nextSummary = { ...nextSummary, blockSlots };
      }
      nextRegistry = ensureVerificationAttachmentRecord(nextRegistry, placeholderId, aid, createdAt);
    }
  }
  if (sentenceId != null) {
    const aid = createReadingAssistSentenceAnchorId(sentenceId);
    const slot = nextSummary.sentenceSlots[aid];
    if (slot && slot.markerIds.includes(markerId)) {
      if (!slot.attachments.verificationIds.includes(placeholderId)) {
        const sentenceSlots = { ...nextSummary.sentenceSlots };
        sentenceSlots[aid] = {
          ...slot,
          attachments: {
            ...slot.attachments,
            verificationIds: [...slot.attachments.verificationIds, placeholderId],
          },
        };
        nextSummary = { ...nextSummary, sentenceSlots };
      }
      nextRegistry = ensureVerificationAttachmentRecord(nextRegistry, placeholderId, aid, createdAt);
    }
  }
  return { registry: nextRegistry, anchorSummary: nextSummary };
}

const CLAIM_PLACEHOLDER_PREFIX = "ra-claim-placeholder|";

const SENTENCE_CLAIM_MARKER_KINDS: ReadingAssistMarkerKind[] = [
  "sentence_examined",
  "sentence_revisited",
  "sentence_backtracked",
];

function applyClaimPlaceholderForMarker(
  registry: ReadingAssistAttachmentRegistrySummary,
  anchorSummary: ReadingAssistClaimReadyAnchorSummary,
  markerId: string,
  kind: ReadingAssistMarkerKind,
  sentenceId: string | null,
  createdAt: number
): { registry: ReadingAssistAttachmentRegistrySummary; anchorSummary: ReadingAssistClaimReadyAnchorSummary } {
  if (sentenceId == null || !SENTENCE_CLAIM_MARKER_KINDS.includes(kind)) {
    return { registry, anchorSummary };
  }
  const aid = createReadingAssistSentenceAnchorId(sentenceId);
  const slot = anchorSummary.sentenceSlots[aid];
  if (!slot || !slot.markerIds.includes(markerId)) return { registry, anchorSummary };

  const claimId = `${CLAIM_PLACEHOLDER_PREFIX}${markerId}`;
  let nextRegistry = registry;
  let nextSummary = anchorSummary;

  const alreadyHasClaimId = slot.claimIds.includes(claimId) && slot.attachments.claimIds.includes(claimId);
  if (!alreadyHasClaimId) {
    const newClaimIds = slot.claimIds.includes(claimId) ? slot.claimIds : [...slot.claimIds, claimId];
    const newAttachmentsClaimIds = slot.attachments.claimIds.includes(claimId)
      ? slot.attachments.claimIds
      : [...slot.attachments.claimIds, claimId];
    const sentenceSlots = { ...nextSummary.sentenceSlots };
    sentenceSlots[aid] = {
      ...slot,
      claimIds: newClaimIds,
      attachments: { ...slot.attachments, claimIds: newAttachmentsClaimIds },
    };
    nextSummary = { ...nextSummary, sentenceSlots };
  }

  nextRegistry = ensureClaimAttachmentRecord(nextRegistry, claimId, aid, createdAt);
  nextRegistry = attachMarkerToClaimAttachmentRecord(nextRegistry, claimId, markerId);
  return { registry: nextRegistry, anchorSummary: nextSummary };
}

const SOURCE_PLACEHOLDER_PREFIX = "ra-source-placeholder|";

function applySourcePlaceholderForMarker(
  registry: ReadingAssistAttachmentRegistrySummary,
  anchorSummary: ReadingAssistClaimReadyAnchorSummary,
  markerId: string,
  kind: ReadingAssistMarkerKind,
  sentenceId: string | null,
  createdAt: number
): { registry: ReadingAssistAttachmentRegistrySummary; anchorSummary: ReadingAssistClaimReadyAnchorSummary } {
  if (sentenceId == null || !SENTENCE_CLAIM_MARKER_KINDS.includes(kind)) {
    return { registry, anchorSummary };
  }
  const aid = createReadingAssistSentenceAnchorId(sentenceId);
  const slot = anchorSummary.sentenceSlots[aid];
  if (!slot || !slot.markerIds.includes(markerId)) return { registry, anchorSummary };

  const sourceId = `${SOURCE_PLACEHOLDER_PREFIX}${markerId}`;
  let nextRegistry = registry;
  let nextSummary = anchorSummary;

  const alreadyHasSourceId = slot.sourceIds.includes(sourceId) && slot.attachments.sourceIds.includes(sourceId);
  if (!alreadyHasSourceId) {
    const newSourceIds = slot.sourceIds.includes(sourceId) ? slot.sourceIds : [...slot.sourceIds, sourceId];
    const newAttachmentsSourceIds = slot.attachments.sourceIds.includes(sourceId)
      ? slot.attachments.sourceIds
      : [...slot.attachments.sourceIds, sourceId];
    const sentenceSlots = { ...nextSummary.sentenceSlots };
    sentenceSlots[aid] = {
      ...slot,
      sourceIds: newSourceIds,
      attachments: { ...slot.attachments, sourceIds: newAttachmentsSourceIds },
    };
    nextSummary = { ...nextSummary, sentenceSlots };
  }

  nextRegistry = ensureSourceAttachmentRecord(nextRegistry, sourceId, aid, createdAt);
  nextRegistry = attachMarkerToSourceAttachmentRecord(nextRegistry, sourceId, markerId);
  return { registry: nextRegistry, anchorSummary: nextSummary };
}

const DISAGREEMENT_PLACEHOLDER_PREFIX = "ra-disagreement-placeholder|";

const SENTENCE_DISAGREEMENT_MARKER_KINDS: ReadingAssistMarkerKind[] = [
  "sentence_revisited",
  "sentence_backtracked",
];

function applyDisagreementPlaceholderForMarker(
  registry: ReadingAssistAttachmentRegistrySummary,
  anchorSummary: ReadingAssistClaimReadyAnchorSummary,
  markerId: string,
  kind: ReadingAssistMarkerKind,
  sentenceId: string | null,
  createdAt: number
): { registry: ReadingAssistAttachmentRegistrySummary; anchorSummary: ReadingAssistClaimReadyAnchorSummary } {
  if (sentenceId == null || !SENTENCE_DISAGREEMENT_MARKER_KINDS.includes(kind)) {
    return { registry, anchorSummary };
  }
  const aid = createReadingAssistSentenceAnchorId(sentenceId);
  const slot = anchorSummary.sentenceSlots[aid];
  if (!slot || !slot.markerIds.includes(markerId)) return { registry, anchorSummary };

  const disagreementId = `${DISAGREEMENT_PLACEHOLDER_PREFIX}${markerId}`;
  let nextRegistry = registry;
  let nextSummary = anchorSummary;

  const alreadyHasDisagreementId =
    slot.disagreementIds.includes(disagreementId) && slot.attachments.disagreementIds.includes(disagreementId);
  if (!alreadyHasDisagreementId) {
    const newDisagreementIds = slot.disagreementIds.includes(disagreementId)
      ? slot.disagreementIds
      : [...slot.disagreementIds, disagreementId];
    const newAttachmentsDisagreementIds = slot.attachments.disagreementIds.includes(disagreementId)
      ? slot.attachments.disagreementIds
      : [...slot.attachments.disagreementIds, disagreementId];
    const sentenceSlots = { ...nextSummary.sentenceSlots };
    sentenceSlots[aid] = {
      ...slot,
      disagreementIds: newDisagreementIds,
      attachments: { ...slot.attachments, disagreementIds: newAttachmentsDisagreementIds },
    };
    nextSummary = { ...nextSummary, sentenceSlots };
  }

  nextRegistry = ensureDisagreementAttachmentRecord(nextRegistry, disagreementId, aid, createdAt);
  nextRegistry = attachMarkerToDisagreementAttachmentRecord(nextRegistry, disagreementId, markerId);
  return { registry: nextRegistry, anchorSummary: nextSummary };
}

export function ensureCrossLinkForSentenceSlot(
  crossLinkSummary: ReadingAssistPlaceholderCrossLinkSummary,
  anchorSummary: ReadingAssistClaimReadyAnchorSummary,
  sentenceId: string,
  createdAt: number
): ReadingAssistPlaceholderCrossLinkSummary {
  const anchorId = createReadingAssistSentenceAnchorId(sentenceId);
  const slot = anchorSummary.sentenceSlots[anchorId];
  if (!slot) return crossLinkSummary;
  const claimIds = slot.attachments.claimIds;
  const sourceIds = slot.attachments.sourceIds;
  const verificationIds = slot.attachments.verificationIds;
  if (claimIds.length === 0 || sourceIds.length === 0 || verificationIds.length === 0) {
    return crossLinkSummary;
  }
  const claimId = claimIds[0];
  const sourceId = sourceIds[0];
  const verificationId = verificationIds[0];
  const disagreementId = slot.attachments.disagreementIds.length > 0 ? slot.attachments.disagreementIds[0] : null;
  const id = createReadingAssistPlaceholderCrossLinkId(sentenceId, claimId, sourceId, null, verificationId);
  const link: ReadingAssistPlaceholderCrossLink = {
    id,
    sentenceId,
    anchorId,
    claimId,
    sourceId,
    disagreementId,
    verificationId,
    createdAt,
  };
  return ensureReadingAssistPlaceholderCrossLink(crossLinkSummary, link);
}

function getCrossLinkIdForSentence(
  anchorSummary: ReadingAssistClaimReadyAnchorSummary,
  sentenceId: string
): string | null {
  const anchorId = createReadingAssistSentenceAnchorId(sentenceId);
  const slot = anchorSummary.sentenceSlots[anchorId];
  if (!slot) return null;
  const claimIds = slot.attachments.claimIds;
  const sourceIds = slot.attachments.sourceIds;
  const verificationIds = slot.attachments.verificationIds;
  if (claimIds.length === 0 || sourceIds.length === 0 || verificationIds.length === 0) return null;
  return createReadingAssistPlaceholderCrossLinkId(
    sentenceId,
    claimIds[0],
    sourceIds[0],
    null,
    verificationIds[0]
  );
}

/**
 * v11: pure reducer — derive next reading path summary from prev, event, and current heuristic state.
 * Heuristic state must be the state after reducing with this event (dwell is mirrored from it).
 */
export function reduceReadingAssistReadingPathSummary(
  prev: ReadingAssistReadingPathSummary,
  event: ReadingAssistEvent,
  heuristicState: ReadingAssistHeuristicState
): ReadingAssistReadingPathSummary {
  const ts = event.timestamp;
  const h = heuristicState.summary;
  let examinedBlockIds = prev.examinedBlockIds;
  let examinedSentenceIds = prev.examinedSentenceIds;
  let blocks = { ...prev.blocks };
  let sentences = { ...prev.sentences };
  let lastExaminedBlockId = prev.lastExaminedBlockId;
  let lastExaminedSentenceId = prev.lastExaminedSentenceId;
  let markers = prev.markers;
  let markerIds = prev.markerIds;
  let observedBacktrackCount = prev.observedBacktrackCount;
  let anchorSummary = prev.anchorSummary;
  let attachmentRegistry = prev.attachmentRegistry;
  let crossLinkSummary = prev.crossLinkSummary;
  let verificationBundleSummary = prev.verificationBundleSummary;
  let verificationBundleIndexSummary = prev.verificationBundleIndexSummary;
  let curiositySignalSummary = prev.curiositySignalSummary;
  let promptToneSlotSummary = prev.promptToneSlotSummary;
  let promptCopySelectionSummary = prev.promptCopySelectionSummary;
  let promptCopyLibraryRecordSummary = prev.promptCopyLibraryRecordSummary;
  let promptCopyCatalogBindingSummary = prev.promptCopyCatalogBindingSummary;
  let promptPresentationRecordSummary = prev.promptPresentationRecordSummary;
  let promptSurfaceCandidateSummary = prev.promptSurfaceCandidateSummary;
  let promptMountPlanSummary = prev.promptMountPlanSummary;

  const appendMarker = (kind: ReadingAssistMarkerKind, blockId: string | null, sentenceId: string | null): string => {
    const id = createReadingAssistMarkerId(kind, blockId, sentenceId, ts);
    markers = [...markers, { id, kind, blockId, sentenceId, createdAt: ts }];
    markerIds = [...markerIds, id];
    return id;
  };

  switch (event.type) {
    case "block_focus_set":
      if (event.blockId != null) {
        const bid = event.blockId;
        anchorSummary = ensureBlockSlot(anchorSummary, bid, ts);
        const markerId = appendMarker("block_examined", bid, null);
        anchorSummary = attachMarkerToSlots(anchorSummary, markerId, bid, null);
        const vPlaceholder = applyVerificationPlaceholderForMarker(
          attachmentRegistry,
          anchorSummary,
          markerId,
          bid,
          null,
          ts
        );
        attachmentRegistry = vPlaceholder.registry;
        anchorSummary = vPlaceholder.anchorSummary;
        if (!examinedBlockIds.includes(bid)) examinedBlockIds = [...examinedBlockIds, bid];
        const existingBlock = blocks[bid];
        if (existingBlock) {
          blocks[bid] = {
            ...existingBlock,
            focusCount: existingBlock.focusCount + 1,
            lastSeenAt: ts,
            estimatedDwellMs: h.dwellByBlockId[bid] ?? 0,
          };
        } else {
          blocks[bid] = {
            blockId: bid,
            firstSeenAt: ts,
            lastSeenAt: ts,
            estimatedDwellMs: h.dwellByBlockId[bid] ?? 0,
            focusCount: 1,
            examinedSentenceIds: [],
          };
        }
        lastExaminedBlockId = bid;
      }
      break;
    case "block_focus_cleared":
      break;
    case "sentence_focus_set":
      if (event.sentenceId != null) {
        const sid = event.sentenceId;
        const bidForSlot = event.blockId ?? null;
        if (bidForSlot != null) anchorSummary = ensureBlockSlot(anchorSummary, bidForSlot, ts);
        anchorSummary = ensureSentenceSlot(anchorSummary, sid, bidForSlot, ts);
        if (!examinedSentenceIds.includes(sid)) examinedSentenceIds = [...examinedSentenceIds, sid];
        const existingSentence = sentences[sid];
        if (existingSentence) {
          const newFocusCount = existingSentence.focusCount + 1;
          sentences[sid] = {
            ...existingSentence,
            focusCount: newFocusCount,
            lastSeenAt: ts,
            blockId: event.blockId ?? existingSentence.blockId,
            estimatedDwellMs: h.dwellBySentenceId[sid] ?? 0,
          };
          const mid1 = appendMarker("sentence_examined", event.blockId ?? null, sid);
          anchorSummary = attachMarkerToSlots(anchorSummary, mid1, event.blockId ?? null, sid);
          const v1 = applyVerificationPlaceholderForMarker(
            attachmentRegistry,
            anchorSummary,
            mid1,
            event.blockId ?? null,
            sid,
            ts
          );
          attachmentRegistry = v1.registry;
          anchorSummary = v1.anchorSummary;
          const c1 = applyClaimPlaceholderForMarker(attachmentRegistry, anchorSummary, mid1, "sentence_examined", sid, ts);
          attachmentRegistry = c1.registry;
          anchorSummary = c1.anchorSummary;
          const s1 = applySourcePlaceholderForMarker(attachmentRegistry, anchorSummary, mid1, "sentence_examined", sid, ts);
          attachmentRegistry = s1.registry;
          anchorSummary = s1.anchorSummary;
          crossLinkSummary = ensureCrossLinkForSentenceSlot(crossLinkSummary, anchorSummary, sid, ts);
          const crossLinkId1 = getCrossLinkIdForSentence(anchorSummary, sid);
          if (crossLinkId1 != null) {
            verificationBundleSummary = ensureVerificationBundleForCrossLink(
              verificationBundleSummary,
              crossLinkSummary,
              crossLinkId1
            );
            verificationBundleIndexSummary = ensureVerificationBundleIndexesForBundleId(
              verificationBundleIndexSummary,
              verificationBundleSummary,
              createReadingAssistVerificationBundleId(crossLinkId1)
            );
            curiositySignalSummary = ensureCuriositySignalForBundleId(
              curiositySignalSummary,
              verificationBundleSummary,
              createReadingAssistVerificationBundleId(crossLinkId1)
            );
            promptToneSlotSummary = ensurePromptToneSlotForSignalId(
              promptToneSlotSummary,
              curiositySignalSummary,
              createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkId1))
            );
            promptCopySelectionSummary = ensurePromptCopySelectionForSlotId(
              promptCopySelectionSummary,
              promptToneSlotSummary,
              createReadingAssistPromptToneSlotId(
                createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkId1))
              )
            );
            promptCopyLibraryRecordSummary = ensurePromptCopyLibraryRecordForSelectionId(
              promptCopyLibraryRecordSummary,
              promptCopySelectionSummary,
              createReadingAssistPromptCopySelectionId(
                createReadingAssistPromptToneSlotId(
                  createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkId1))
                )
              )
            );
            const recordId1 = createReadingAssistPromptCopyLibraryRecordId(
              createReadingAssistPromptCopySelectionId(
                createReadingAssistPromptToneSlotId(
                  createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkId1))
                )
              )
            );
            promptCopyCatalogBindingSummary = ensurePromptCopyCatalogBindingForRecordId(
              promptCopyCatalogBindingSummary,
              promptCopyLibraryRecordSummary,
              recordId1
            );
            const bindingId1 = createReadingAssistPromptCopyCatalogBindingId(recordId1);
            promptPresentationRecordSummary = ensurePromptPresentationRecordForBindingId(
              promptPresentationRecordSummary,
              promptCopyCatalogBindingSummary,
              bindingId1
            );
            const presentationRecordId1 = createReadingAssistPromptPresentationRecordId(bindingId1);
            promptSurfaceCandidateSummary = ensurePromptSurfaceCandidateForPresentationRecordId(
              promptSurfaceCandidateSummary,
              promptPresentationRecordSummary,
              presentationRecordId1
            );
            const surfaceCandidateId1 = createReadingAssistPromptSurfaceCandidateId(presentationRecordId1);
            promptMountPlanSummary = ensurePromptMountPlanForSurfaceCandidateId(
              promptMountPlanSummary,
              promptSurfaceCandidateSummary,
              surfaceCandidateId1
            );
          }
          if (newFocusCount > 1) {
            const mid2 = appendMarker("sentence_revisited", event.blockId ?? null, sid);
            anchorSummary = attachMarkerToSlots(anchorSummary, mid2, event.blockId ?? null, sid);
            const v2 = applyVerificationPlaceholderForMarker(
              attachmentRegistry,
              anchorSummary,
              mid2,
              event.blockId ?? null,
              sid,
              ts
            );
            attachmentRegistry = v2.registry;
            anchorSummary = v2.anchorSummary;
            const c2 = applyClaimPlaceholderForMarker(attachmentRegistry, anchorSummary, mid2, "sentence_revisited", sid, ts);
            attachmentRegistry = c2.registry;
            anchorSummary = c2.anchorSummary;
            const s2 = applySourcePlaceholderForMarker(attachmentRegistry, anchorSummary, mid2, "sentence_revisited", sid, ts);
            attachmentRegistry = s2.registry;
            anchorSummary = s2.anchorSummary;
            const d2 = applyDisagreementPlaceholderForMarker(attachmentRegistry, anchorSummary, mid2, "sentence_revisited", sid, ts);
            attachmentRegistry = d2.registry;
            anchorSummary = d2.anchorSummary;
            crossLinkSummary = ensureCrossLinkForSentenceSlot(crossLinkSummary, anchorSummary, sid, ts);
            const crossLinkId2 = getCrossLinkIdForSentence(anchorSummary, sid);
            if (crossLinkId2 != null) {
              verificationBundleSummary = ensureVerificationBundleForCrossLink(
                verificationBundleSummary,
                crossLinkSummary,
                crossLinkId2
              );
              verificationBundleIndexSummary = ensureVerificationBundleIndexesForBundleId(
                verificationBundleIndexSummary,
                verificationBundleSummary,
                createReadingAssistVerificationBundleId(crossLinkId2)
              );
              curiositySignalSummary = ensureCuriositySignalForBundleId(
                curiositySignalSummary,
                verificationBundleSummary,
                createReadingAssistVerificationBundleId(crossLinkId2)
              );
              promptToneSlotSummary = ensurePromptToneSlotForSignalId(
                promptToneSlotSummary,
                curiositySignalSummary,
                createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkId2))
              );
              promptCopySelectionSummary = ensurePromptCopySelectionForSlotId(
                promptCopySelectionSummary,
                promptToneSlotSummary,
                createReadingAssistPromptToneSlotId(
                  createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkId2))
                )
              );
              promptCopyLibraryRecordSummary = ensurePromptCopyLibraryRecordForSelectionId(
                promptCopyLibraryRecordSummary,
                promptCopySelectionSummary,
                createReadingAssistPromptCopySelectionId(
                  createReadingAssistPromptToneSlotId(
                    createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkId2))
                  )
                )
              );
              const recordId2 = createReadingAssistPromptCopyLibraryRecordId(
                createReadingAssistPromptCopySelectionId(
                  createReadingAssistPromptToneSlotId(
                    createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkId2))
                  )
                )
              );
              promptCopyCatalogBindingSummary = ensurePromptCopyCatalogBindingForRecordId(
                promptCopyCatalogBindingSummary,
                promptCopyLibraryRecordSummary,
                recordId2
              );
              const bindingId2 = createReadingAssistPromptCopyCatalogBindingId(recordId2);
              promptPresentationRecordSummary = ensurePromptPresentationRecordForBindingId(
                promptPresentationRecordSummary,
                promptCopyCatalogBindingSummary,
                bindingId2
              );
              const presentationRecordId2 = createReadingAssistPromptPresentationRecordId(bindingId2);
              promptSurfaceCandidateSummary = ensurePromptSurfaceCandidateForPresentationRecordId(
                promptSurfaceCandidateSummary,
                promptPresentationRecordSummary,
                presentationRecordId2
              );
              const surfaceCandidateId2 = createReadingAssistPromptSurfaceCandidateId(presentationRecordId2);
              promptMountPlanSummary = ensurePromptMountPlanForSurfaceCandidateId(
                promptMountPlanSummary,
                promptSurfaceCandidateSummary,
                surfaceCandidateId2
              );
            }
          }
        } else {
          sentences[sid] = {
            sentenceId: sid,
            blockId: event.blockId ?? null,
            firstSeenAt: ts,
            lastSeenAt: ts,
            estimatedDwellMs: h.dwellBySentenceId[sid] ?? 0,
            focusCount: 1,
            progressedToCount: 0,
            progressedFromCount: 0,
          };
          const mid = appendMarker("sentence_examined", event.blockId ?? null, sid);
          anchorSummary = attachMarkerToSlots(anchorSummary, mid, event.blockId ?? null, sid);
          const v = applyVerificationPlaceholderForMarker(
            attachmentRegistry,
            anchorSummary,
            mid,
            event.blockId ?? null,
            sid,
            ts
          );
          attachmentRegistry = v.registry;
          anchorSummary = v.anchorSummary;
          const c = applyClaimPlaceholderForMarker(attachmentRegistry, anchorSummary, mid, "sentence_examined", sid, ts);
          attachmentRegistry = c.registry;
          anchorSummary = c.anchorSummary;
          const s = applySourcePlaceholderForMarker(attachmentRegistry, anchorSummary, mid, "sentence_examined", sid, ts);
          attachmentRegistry = s.registry;
          anchorSummary = s.anchorSummary;
          crossLinkSummary = ensureCrossLinkForSentenceSlot(crossLinkSummary, anchorSummary, sid, ts);
          const crossLinkIdNew = getCrossLinkIdForSentence(anchorSummary, sid);
          if (crossLinkIdNew != null) {
            verificationBundleSummary = ensureVerificationBundleForCrossLink(
              verificationBundleSummary,
              crossLinkSummary,
              crossLinkIdNew
            );
            verificationBundleIndexSummary = ensureVerificationBundleIndexesForBundleId(
              verificationBundleIndexSummary,
              verificationBundleSummary,
              createReadingAssistVerificationBundleId(crossLinkIdNew)
            );
            curiositySignalSummary = ensureCuriositySignalForBundleId(
              curiositySignalSummary,
              verificationBundleSummary,
              createReadingAssistVerificationBundleId(crossLinkIdNew)
            );
            promptToneSlotSummary = ensurePromptToneSlotForSignalId(
              promptToneSlotSummary,
              curiositySignalSummary,
              createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkIdNew))
            );
            promptCopySelectionSummary = ensurePromptCopySelectionForSlotId(
              promptCopySelectionSummary,
              promptToneSlotSummary,
              createReadingAssistPromptToneSlotId(
                createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkIdNew))
              )
            );
            promptCopyLibraryRecordSummary = ensurePromptCopyLibraryRecordForSelectionId(
              promptCopyLibraryRecordSummary,
              promptCopySelectionSummary,
              createReadingAssistPromptCopySelectionId(
                createReadingAssistPromptToneSlotId(
                  createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkIdNew))
                )
              )
            );
            const recordIdNew = createReadingAssistPromptCopyLibraryRecordId(
              createReadingAssistPromptCopySelectionId(
                createReadingAssistPromptToneSlotId(
                  createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkIdNew))
                )
              )
            );
            promptCopyCatalogBindingSummary = ensurePromptCopyCatalogBindingForRecordId(
              promptCopyCatalogBindingSummary,
              promptCopyLibraryRecordSummary,
              recordIdNew
            );
            const bindingIdNew = createReadingAssistPromptCopyCatalogBindingId(recordIdNew);
            promptPresentationRecordSummary = ensurePromptPresentationRecordForBindingId(
              promptPresentationRecordSummary,
              promptCopyCatalogBindingSummary,
              bindingIdNew
            );
            const presentationRecordIdNew = createReadingAssistPromptPresentationRecordId(bindingIdNew);
            promptSurfaceCandidateSummary = ensurePromptSurfaceCandidateForPresentationRecordId(
              promptSurfaceCandidateSummary,
              promptPresentationRecordSummary,
              presentationRecordIdNew
            );
            const surfaceCandidateIdNew = createReadingAssistPromptSurfaceCandidateId(presentationRecordIdNew);
            promptMountPlanSummary = ensurePromptMountPlanForSurfaceCandidateId(
              promptMountPlanSummary,
              promptSurfaceCandidateSummary,
              surfaceCandidateIdNew
            );
          }
        }
        lastExaminedSentenceId = sid;
        if (event.blockId != null) {
          const bid = event.blockId;
          if (!blocks[bid]) {
            if (!examinedBlockIds.includes(bid)) examinedBlockIds = [...examinedBlockIds, bid];
            blocks[bid] = {
              blockId: bid,
              firstSeenAt: ts,
              lastSeenAt: ts,
              estimatedDwellMs: h.dwellByBlockId[bid] ?? 0,
              focusCount: 0,
              examinedSentenceIds: [sid],
            };
          } else if (!blocks[bid].examinedSentenceIds.includes(sid)) {
            blocks[bid] = {
              ...blocks[bid],
              examinedSentenceIds: [...blocks[bid].examinedSentenceIds, sid],
              estimatedDwellMs: h.dwellByBlockId[bid] ?? 0,
            };
          } else {
            blocks[bid] = { ...blocks[bid], estimatedDwellMs: h.dwellByBlockId[bid] ?? 0 };
          }
          lastExaminedBlockId = bid;
        }
      }
      break;
    case "sentence_focus_cleared":
      break;
    case "sentence_progress_next":
    case "sentence_progress_previous": {
      if (prev.lastExaminedSentenceId != null && prev.lastExaminedSentenceId !== event.sentenceId) {
        const priorId = prev.lastExaminedSentenceId;
        const prior = sentences[priorId];
        if (prior) {
          sentences[priorId] = {
            ...prior,
            progressedFromCount: prior.progressedFromCount + 1,
            estimatedDwellMs: h.dwellBySentenceId[priorId] ?? 0,
          };
        }
      }
      if (event.sentenceId != null) {
        const sid = event.sentenceId;
        const dest = sentences[sid];
        if (dest) {
          sentences[sid] = {
            ...dest,
            progressedToCount: dest.progressedToCount + 1,
            estimatedDwellMs: h.dwellBySentenceId[sid] ?? 0,
          };
        } else {
          if (!examinedSentenceIds.includes(sid)) examinedSentenceIds = [...examinedSentenceIds, sid];
          sentences[sid] = {
            sentenceId: sid,
            blockId: event.blockId ?? null,
            firstSeenAt: null,
            lastSeenAt: null,
            estimatedDwellMs: h.dwellBySentenceId[sid] ?? 0,
            focusCount: 0,
            progressedToCount: 1,
            progressedFromCount: 0,
          };
        }
        lastExaminedSentenceId = sid;
      }
      if (event.blockId != null) lastExaminedBlockId = event.blockId;
      if (h.backtrackCount > prev.observedBacktrackCount) {
        const backMarkerId = appendMarker("sentence_backtracked", event.blockId ?? null, event.sentenceId ?? null);
        anchorSummary = attachMarkerToSlots(anchorSummary, backMarkerId, event.blockId ?? null, event.sentenceId ?? null);
        const vBack = applyVerificationPlaceholderForMarker(
          attachmentRegistry,
          anchorSummary,
          backMarkerId,
          event.blockId ?? null,
          event.sentenceId ?? null,
          ts
        );
        attachmentRegistry = vBack.registry;
        anchorSummary = vBack.anchorSummary;
        const cBack = applyClaimPlaceholderForMarker(
          attachmentRegistry,
          anchorSummary,
          backMarkerId,
          "sentence_backtracked",
          event.sentenceId ?? null,
          ts
        );
        attachmentRegistry = cBack.registry;
        anchorSummary = cBack.anchorSummary;
        const sBack = applySourcePlaceholderForMarker(
          attachmentRegistry,
          anchorSummary,
          backMarkerId,
          "sentence_backtracked",
          event.sentenceId ?? null,
          ts
        );
        attachmentRegistry = sBack.registry;
        anchorSummary = sBack.anchorSummary;
        const dBack = applyDisagreementPlaceholderForMarker(
          attachmentRegistry,
          anchorSummary,
          backMarkerId,
          "sentence_backtracked",
          event.sentenceId ?? null,
          ts
        );
        attachmentRegistry = dBack.registry;
        anchorSummary = dBack.anchorSummary;
        observedBacktrackCount = h.backtrackCount;
        if (event.sentenceId != null) {
          crossLinkSummary = ensureCrossLinkForSentenceSlot(
            crossLinkSummary,
            anchorSummary,
            event.sentenceId,
            ts
          );
          const crossLinkIdBack = getCrossLinkIdForSentence(anchorSummary, event.sentenceId);
          if (crossLinkIdBack != null) {
            verificationBundleSummary = ensureVerificationBundleForCrossLink(
              verificationBundleSummary,
              crossLinkSummary,
              crossLinkIdBack
            );
            verificationBundleIndexSummary = ensureVerificationBundleIndexesForBundleId(
              verificationBundleIndexSummary,
              verificationBundleSummary,
              createReadingAssistVerificationBundleId(crossLinkIdBack)
            );
            curiositySignalSummary = ensureCuriositySignalForBundleId(
              curiositySignalSummary,
              verificationBundleSummary,
              createReadingAssistVerificationBundleId(crossLinkIdBack)
            );
            promptToneSlotSummary = ensurePromptToneSlotForSignalId(
              promptToneSlotSummary,
              curiositySignalSummary,
              createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkIdBack))
            );
            promptCopySelectionSummary = ensurePromptCopySelectionForSlotId(
              promptCopySelectionSummary,
              promptToneSlotSummary,
              createReadingAssistPromptToneSlotId(
                createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkIdBack))
              )
            );
            promptCopyLibraryRecordSummary = ensurePromptCopyLibraryRecordForSelectionId(
              promptCopyLibraryRecordSummary,
              promptCopySelectionSummary,
              createReadingAssistPromptCopySelectionId(
                createReadingAssistPromptToneSlotId(
                  createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkIdBack))
                )
              )
            );
            const recordIdBack = createReadingAssistPromptCopyLibraryRecordId(
              createReadingAssistPromptCopySelectionId(
                createReadingAssistPromptToneSlotId(
                  createReadingAssistCuriositySignalId(createReadingAssistVerificationBundleId(crossLinkIdBack))
                )
              )
            );
            promptCopyCatalogBindingSummary = ensurePromptCopyCatalogBindingForRecordId(
              promptCopyCatalogBindingSummary,
              promptCopyLibraryRecordSummary,
              recordIdBack
            );
            const bindingIdBack = createReadingAssistPromptCopyCatalogBindingId(recordIdBack);
            promptPresentationRecordSummary = ensurePromptPresentationRecordForBindingId(
              promptPresentationRecordSummary,
              promptCopyCatalogBindingSummary,
              bindingIdBack
            );
            const presentationRecordIdBack = createReadingAssistPromptPresentationRecordId(bindingIdBack);
            promptSurfaceCandidateSummary = ensurePromptSurfaceCandidateForPresentationRecordId(
              promptSurfaceCandidateSummary,
              promptPresentationRecordSummary,
              presentationRecordIdBack
            );
            const surfaceCandidateIdBack = createReadingAssistPromptSurfaceCandidateId(presentationRecordIdBack);
            promptMountPlanSummary = ensurePromptMountPlanForSurfaceCandidateId(
              promptMountPlanSummary,
              promptSurfaceCandidateSummary,
              surfaceCandidateIdBack
            );
          }
        }
      }
      break;
    }
  }

  let next: ReadingAssistReadingPathSummary = {
    examinedBlockIds,
    examinedSentenceIds,
    blocks,
    sentences,
    lastExaminedBlockId,
    lastExaminedSentenceId,
    markers,
    markerIds,
    observedBacktrackCount,
    anchorSummary,
    attachmentRegistry,
    crossLinkSummary,
    verificationBundleSummary,
    verificationBundleIndexSummary,
    curiositySignalSummary,
    promptToneSlotSummary,
    promptCopySelectionSummary,
    promptCopyLibraryRecordSummary,
    promptCopyCatalogBindingSummary,
    promptPresentationRecordSummary,
    promptSurfaceCandidateSummary,
    promptMountPlanSummary,
  };
  return mirrorDwellFromHeuristic(next, h);
}

export interface ReadingAssistState {
  mode: ReadingAssistMode;
  focusedBlockId: string | null;
  focusedSentenceId: string | null;
  sourceType: ReadingAssistSourceType | null;
}

export const DEFAULT_READING_ASSIST_STATE: ReadingAssistState = {
  mode: "off",
  focusedBlockId: null,
  focusedSentenceId: null,
  sourceType: null,
};

/** v2: anchor for a sentence within a block. Foundation for sentence-level focus and rotary enlargement. */
export interface SentenceAnchor {
  id: string;
  startOffset: number;
  endOffset: number;
}

export function isReadingFocusActive(state: ReadingAssistState): boolean {
  return state.mode === "focus_block";
}

export function isBlockFocused(
  state: ReadingAssistState,
  blockId: string,
  sourceType: ReadingAssistSourceType
): boolean {
  return (
    state.mode === "focus_block" &&
    state.focusedBlockId === blockId &&
    state.sourceType === sourceType
  );
}

export function isAnyBlockFocused(state: ReadingAssistState): boolean {
  return state.mode === "focus_block" && state.focusedBlockId != null;
}

/** v2: sentence focus exists only inside a focused block. */
export function isSentenceFocused(
  state: ReadingAssistState,
  sentenceId: string,
  blockId: string,
  sourceType: ReadingAssistSourceType
): boolean {
  return (
    state.mode === "focus_block" &&
    state.focusedBlockId === blockId &&
    state.sourceType === sourceType &&
    state.focusedSentenceId === sentenceId
  );
}

export function isAnySentenceFocused(state: ReadingAssistState): boolean {
  return state.mode === "focus_block" && state.focusedSentenceId != null;
}

/**
 * v2: lightweight sentence segmentation by terminal punctuation (. ! ?).
 * Returns anchors with id `${blockId}-sentence-${index}` for future sentence-level UI.
 */
export function getSentenceAnchorsForBlock(blockText: string, blockId: string): SentenceAnchor[] {
  if (!blockText || typeof blockText !== "string") return [];
  const text = blockText.trim();
  if (!text) return [];
  const anchors: SentenceAnchor[] = [];
  const re = /[^.!?]+[.!?]?/g;
  let match;
  let index = 0;
  while ((match = re.exec(text)) !== null) {
    const segment = match[0].trim();
    if (!segment) continue;
    anchors.push({
      id: `${blockId}-sentence-${index}`,
      startOffset: match.index,
      endOffset: match.index + match[0].length,
    });
    index += 1;
  }
  return anchors;
}

/** v2: sentence anchors for a study block (content + bullet items as one text). Study sheet does not render sentence focus yet. */
export function getSentenceAnchorsForStudyBlock(
  content: string,
  bulletItems: string[] | undefined,
  blockId: string
): SentenceAnchor[] {
  const text = [content, ...(bulletItems ?? [])].filter(Boolean).join("\n");
  return getSentenceAnchorsForBlock(text, blockId);
}

/**
 * v4: get exact sentence text for the focused sentence from block text and anchors.
 * Uses anchor offsets against trimmed block text; no re-segmentation. Returns null if no focus or no match.
 */
export function getFocusedSentenceText(
  blockText: string,
  sentenceAnchors: SentenceAnchor[],
  focusedSentenceId: string | null
): string | null {
  if (focusedSentenceId == null || !blockText || typeof blockText !== "string") return null;
  if (!sentenceAnchors?.length) return null;
  const trimmed = blockText.trim();
  if (!trimmed) return null;
  const anchor = sentenceAnchors.find((a) => a.id === focusedSentenceId);
  if (!anchor) return null;
  return trimmed.slice(anchor.startOffset, anchor.endOffset);
}

/**
 * v5: index of the focused sentence in the anchors array, or -1 if not found.
 */
export function getFocusedSentenceIndex(
  sentenceAnchors: SentenceAnchor[],
  focusedSentenceId: string | null
): number {
  if (focusedSentenceId == null || !sentenceAnchors?.length) return -1;
  const i = sentenceAnchors.findIndex((a) => a.id === focusedSentenceId);
  return i >= 0 ? i : -1;
}

/**
 * v5: id of the sentence before the focused one in the same block, or null at first sentence.
 */
export function getPreviousSentenceId(
  sentenceAnchors: SentenceAnchor[],
  focusedSentenceId: string | null
): string | null {
  const i = getFocusedSentenceIndex(sentenceAnchors, focusedSentenceId);
  if (i <= 0) return null;
  return sentenceAnchors[i - 1].id;
}

/**
 * v5: id of the sentence after the focused one in the same block, or null at last sentence.
 */
export function getNextSentenceId(
  sentenceAnchors: SentenceAnchor[],
  focusedSentenceId: string | null
): string | null {
  const i = getFocusedSentenceIndex(sentenceAnchors, focusedSentenceId);
  if (i < 0 || i >= sentenceAnchors.length - 1) return null;
  return sentenceAnchors[i + 1].id;
}

/**
 * v5: combined progression state for the focused sentence within a block.
 */
export function getSentenceProgressionState(
  sentenceAnchors: SentenceAnchor[],
  focusedSentenceId: string | null
): {
  currentIndex: number;
  total: number;
  previousSentenceId: string | null;
  nextSentenceId: string | null;
} {
  const total = sentenceAnchors?.length ?? 0;
  const currentIndex = getFocusedSentenceIndex(sentenceAnchors ?? [], focusedSentenceId);
  return {
    currentIndex,
    total,
    previousSentenceId: getPreviousSentenceId(sentenceAnchors ?? [], focusedSentenceId),
    nextSentenceId: getNextSentenceId(sentenceAnchors ?? [], focusedSentenceId),
  };
}

/** v6: params for scroll-target math. All values in the same coordinate system (e.g. scroll content). */
export interface GetReadingAssistScrollTargetParams {
  blockTop: number;
  blockHeight: number;
  viewportHeight: number;
  currentScrollY: number;
  topPadding?: number;
  bottomPadding?: number;
  preferredTopOffset?: number;
  /** Min scroll delta to avoid jitter; if |target - current| < this, return null. */
  minDelta?: number;
}

/**
 * v6: determine target scroll Y to keep the block in a comfortable reading zone.
 * Pure math; no React Native. Returns null when no scroll needed.
 * Clamps result to >= 0.
 */
export function getReadingAssistScrollTarget(
  params: GetReadingAssistScrollTargetParams
): number | null {
  const {
    blockTop,
    blockHeight,
    viewportHeight,
    currentScrollY,
    topPadding = 16,
    bottomPadding = 24,
    preferredTopOffset = 80,
    minDelta = 8,
  } = params;

  if (viewportHeight <= 0) return null;

  const visibleTop = currentScrollY;
  const visibleBottom = currentScrollY + viewportHeight;
  const blockBottom = blockTop + blockHeight;

  let target: number | null = null;

  if (blockTop < visibleTop + preferredTopOffset) {
    target = Math.max(0, blockTop - preferredTopOffset);
  } else if (blockBottom > visibleBottom - bottomPadding) {
    target = Math.max(0, blockBottom - viewportHeight + bottomPadding);
  }

  if (target == null) return null;
  if (Math.abs(target - currentScrollY) < minDelta) return null;
  return target;
}

/**
 * v7: ids of the sentences immediately before and after the focused sentence in the same block.
 * Uses existing anchors only; no re-segmentation.
 */
export function getAdjacentSentenceIds(
  sentenceAnchors: SentenceAnchor[],
  focusedSentenceId: string | null
): { previousSentenceId: string | null; nextSentenceId: string | null } {
  return {
    previousSentenceId: getPreviousSentenceId(sentenceAnchors ?? [], focusedSentenceId),
    nextSentenceId: getNextSentenceId(sentenceAnchors ?? [], focusedSentenceId),
  };
}

/**
 * v7: true only when sentenceId is the immediate previous or next sentence to the focused one.
 * Focused sentence itself is not considered adjacent.
 */
export function isAdjacentSentence(
  sentenceAnchors: SentenceAnchor[],
  focusedSentenceId: string | null,
  sentenceId: string
): boolean {
  const { previousSentenceId, nextSentenceId } = getAdjacentSentenceIds(
    sentenceAnchors ?? [],
    focusedSentenceId
  );
  return sentenceId === previousSentenceId || sentenceId === nextSentenceId;
}
