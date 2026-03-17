/**
 * Reading-Assist Groundwork v1: state shape, helpers, and off-state behavior.
 */
import type {
  ReadingAssistState,
  ReadingAssistSourceType,
  ReadingAssistEvent,
  ReadingAssistEventType,
  ReadingAssistSessionSummary,
  ReadingAssistHeuristicSummary,
  ReadingAssistHeuristicState,
  ReadingAssistReadingPathSummary,
  ReadingAssistPlaceholderCrossLink,
  ReadingAssistPlaceholderCrossLinkSummary,
  ReadingAssistVerificationBundle,
  ReadingAssistVerificationBundleSummary,
  ReadingAssistVerificationBundleIndexSummary,
  ReadingAssistCuriositySignalKind,
  ReadingAssistCuriositySignal,
  ReadingAssistCuriositySignalSummary,
  ReadingAssistPromptToneSlotKind,
  ReadingAssistPromptToneSlot,
  ReadingAssistPromptToneSlotSummary,
  ReadingAssistPromptCopyKey,
  ReadingAssistPromptCopySelection,
  ReadingAssistPromptCopySelectionSummary,
  ReadingAssistPromptCopyLibraryFamily,
  ReadingAssistPromptCopyLibraryRecord,
  ReadingAssistPromptCopyLibraryRecordSummary,
  ReadingAssistPromptCopyCatalogEntryId,
  ReadingAssistPromptCopyCatalogBinding,
  ReadingAssistPromptCopyCatalogBindingSummary,
  ReadingAssistPromptPresentationPosture,
  ReadingAssistPromptVisibilityReadiness,
  ReadingAssistPromptPresentationRecord,
  ReadingAssistPromptPresentationRecordSummary,
  ReadingAssistPromptSurfacePlacement,
  ReadingAssistPromptSurfaceAffordance,
  ReadingAssistPromptSurfacePriority,
  ReadingAssistPromptSurfaceCandidate,
  ReadingAssistPromptSurfaceCandidateSummary,
  ReadingAssistPromptMountStatus,
  ReadingAssistPromptMountTrigger,
  ReadingAssistPromptExpansionMode,
  ReadingAssistPromptMountUrgency,
  ReadingAssistPromptMountPlan,
  ReadingAssistPromptMountPlanSummary,
  ReadingAssistActivePrompt,
  ReadingAssistActivePromptSelectionResult,
  ReadingAssistExaminedBlock,
  ReadingAssistExaminedSentence,
  ReadingAssistMarkerKind,
  ReadingAssistExaminationMarker,
  ReadingAssistClaimReadyAnchorSummary,
  ReadingAssistClaimReadyAnchorSlot,
} from "../types/readingAssist";
import {
  DEFAULT_READING_ASSIST_STATE,
  isReadingFocusActive,
  isBlockFocused,
  isAnyBlockFocused,
  isSentenceFocused,
  isAnySentenceFocused,
  getSentenceAnchorsForBlock,
  getSentenceAnchorsForStudyBlock,
  getFocusedSentenceText,
  getFocusedSentenceIndex,
  getPreviousSentenceId,
  getNextSentenceId,
  getSentenceProgressionState,
  getReadingAssistScrollTarget,
  getAdjacentSentenceIds,
  isAdjacentSentence,
  DEFAULT_READING_ASSIST_SESSION_SUMMARY,
  reduceReadingAssistSessionSummary,
  DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
  DEFAULT_READING_ASSIST_HEURISTIC_STATE,
  reduceReadingAssistHeuristicState,
  DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
  reduceReadingAssistReadingPathSummary,
  createReadingAssistMarkerId,
  createReadingAssistBlockAnchorId,
  createReadingAssistSentenceAnchorId,
  DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY,
  DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE,
  DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
  ensureVerificationAttachmentRecord,
  ensureClaimAttachmentRecord,
  attachMarkerToClaimAttachmentRecord,
  ensureSourceAttachmentRecord,
  attachMarkerToSourceAttachmentRecord,
  ensureDisagreementAttachmentRecord,
  attachMarkerToDisagreementAttachmentRecord,
  createReadingAssistPlaceholderCrossLinkId,
  ensureReadingAssistPlaceholderCrossLink,
  DEFAULT_READING_ASSIST_PLACEHOLDER_CROSS_LINK_SUMMARY,
  ensureCrossLinkForSentenceSlot,
  createReadingAssistVerificationBundleId,
  ensureReadingAssistVerificationBundle,
  ensureVerificationBundleForCrossLink,
  DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY,
  ensureReadingAssistIdIndexEntry,
  ensureReadingAssistVerificationBundleIndexes,
  ensureVerificationBundleIndexesForBundleId,
  DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY,
  createReadingAssistCuriositySignalId,
  buildReadingAssistCuriositySignalKinds,
  ensureReadingAssistCuriositySignal,
  ensureCuriositySignalForBundleId,
  DEFAULT_READING_ASSIST_CURIOSITY_SIGNAL_SUMMARY,
  createReadingAssistPromptToneSlotId,
  buildReadingAssistPromptToneSlotKinds,
  deriveReadingAssistPromptToneFamily,
  deriveReadingAssistPromptToneIntensity,
  ensureReadingAssistPromptToneSlot,
  ensurePromptToneSlotForSignalId,
  DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY,
  createReadingAssistPromptCopySelectionId,
  deriveReadingAssistPrimaryPromptCopyKey,
  deriveReadingAssistSecondaryPromptCopyKey,
  ensureReadingAssistPromptCopySelection,
  ensurePromptCopySelectionForSlotId,
  DEFAULT_READING_ASSIST_PROMPT_COPY_SELECTION_SUMMARY,
  createReadingAssistPromptCopyLibraryRecordId,
  deriveReadingAssistPromptCopyLibraryFamily,
  deriveReadingAssistPromptCopyLibraryToneProfile,
  deriveReadingAssistPrimaryPromptCopyLibraryVariantKey,
  deriveReadingAssistSecondaryPromptCopyLibraryVariantKey,
  ensureReadingAssistPromptCopyLibraryRecord,
  ensurePromptCopyLibraryRecordForSelectionId,
  DEFAULT_READING_ASSIST_PROMPT_COPY_LIBRARY_RECORD_SUMMARY,
  createReadingAssistPromptCopyCatalogBindingId,
  deriveReadingAssistPrimaryPromptCopyCatalogEntryId,
  deriveReadingAssistSecondaryPromptCopyCatalogEntryId,
  ensureReadingAssistPromptCopyCatalogBinding,
  ensurePromptCopyCatalogBindingForRecordId,
  DEFAULT_READING_ASSIST_PROMPT_COPY_CATALOG_BINDING_SUMMARY,
  READING_ASSIST_PROMPT_COPY_CATALOG,
  createReadingAssistPromptPresentationRecordId,
  deriveReadingAssistPromptPresentationPosture,
  deriveReadingAssistPromptVisibilityReadiness,
  ensureReadingAssistPromptPresentationRecord,
  ensurePromptPresentationRecordForBindingId,
  DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY,
  createReadingAssistPromptSurfaceCandidateId,
  deriveReadingAssistPromptSurfacePlacement,
  deriveReadingAssistPromptSurfaceAffordance,
  deriveReadingAssistPromptSurfacePriority,
  ensureReadingAssistPromptSurfaceCandidate,
  ensurePromptSurfaceCandidateForPresentationRecordId,
  DEFAULT_READING_ASSIST_PROMPT_SURFACE_CANDIDATE_SUMMARY,
  createReadingAssistPromptMountPlanId,
  deriveReadingAssistPromptMountStatus,
  deriveReadingAssistPromptMountTrigger,
  deriveReadingAssistPromptExpansionMode,
  deriveReadingAssistPromptMountUrgency,
  ensureReadingAssistPromptMountPlan,
  ensurePromptMountPlanForSurfaceCandidateId,
  DEFAULT_READING_ASSIST_PROMPT_MOUNT_PLAN_SUMMARY,
} from "../types/readingAssist";
import {
  selectPromptMountPlansForSentence,
  selectMountablePromptPlansForSentence,
  selectPrimaryPromptMountPlanForSentence,
  selectActivePromptForSentence,
  selectActivePromptForFocusedSentence,
} from "../utils/readingAssistSelectors";

describe("ReadingAssistState shape", () => {
  it("default state has mode off and no focus", () => {
    expect(DEFAULT_READING_ASSIST_STATE.mode).toBe("off");
    expect(DEFAULT_READING_ASSIST_STATE.focusedBlockId).toBeNull();
    expect(DEFAULT_READING_ASSIST_STATE.sourceType).toBeNull();
  });

  it("v2 default state has focusedSentenceId null", () => {
    expect(DEFAULT_READING_ASSIST_STATE.focusedSentenceId).toBeNull();
  });

  it("state allows focus_block mode and optional focusedBlockId and sourceType", () => {
    const state: ReadingAssistState = {
      mode: "focus_block",
      focusedBlockId: "article-1-block-2",
      focusedSentenceId: null,
      sourceType: "article",
    };
    expect(state.mode).toBe("focus_block");
    expect(state.focusedBlockId).toBe("article-1-block-2");
    expect(state.sourceType).toBe("article");
  });
});

describe("isReadingFocusActive", () => {
  it("returns true when mode is focus_block", () => {
    expect(isReadingFocusActive({ ...DEFAULT_READING_ASSIST_STATE, mode: "focus_block" })).toBe(true);
  });

  it("returns false when mode is off", () => {
    expect(isReadingFocusActive(DEFAULT_READING_ASSIST_STATE)).toBe(false);
  });
});

describe("isBlockFocused", () => {
  it("returns true when mode is focus_block and blockId and sourceType match", () => {
    const state: ReadingAssistState = {
      mode: "focus_block",
      focusedBlockId: "study-1",
      focusedSentenceId: null,
      sourceType: "study",
    };
    expect(isBlockFocused(state, "study-1", "study")).toBe(true);
  });

  it("returns false when blockId does not match", () => {
    const state: ReadingAssistState = {
      mode: "focus_block",
      focusedBlockId: "study-1",
      focusedSentenceId: null,
      sourceType: "study",
    };
    expect(isBlockFocused(state, "study-2", "study")).toBe(false);
  });

  it("returns false when sourceType does not match", () => {
    const state: ReadingAssistState = {
      mode: "focus_block",
      focusedBlockId: "article-1-block-0",
      focusedSentenceId: null,
      sourceType: "article",
    };
    expect(isBlockFocused(state, "article-1-block-0", "study")).toBe(false);
  });

  it("returns false when mode is off", () => {
    const state: ReadingAssistState = {
      ...DEFAULT_READING_ASSIST_STATE,
      focusedBlockId: "article-1-block-0",
      sourceType: "article",
    };
    expect(state.mode).toBe("off");
    expect(isBlockFocused(state, "article-1-block-0", "article")).toBe(false);
  });
});

describe("isAnyBlockFocused", () => {
  it("returns true when mode is focus_block and focusedBlockId is set", () => {
    expect(
      isAnyBlockFocused({
        mode: "focus_block",
        focusedBlockId: "x",
        focusedSentenceId: null,
        sourceType: "article",
      })
    ).toBe(true);
  });

  it("returns false when focusedBlockId is null", () => {
    expect(
      isAnyBlockFocused({
        mode: "focus_block",
        focusedBlockId: null,
        focusedSentenceId: null,
        sourceType: null,
      })
    ).toBe(false);
  });

  it("returns false when mode is off", () => {
    expect(isAnyBlockFocused(DEFAULT_READING_ASSIST_STATE)).toBe(false);
  });
});

describe("sentence focus (v2)", () => {
  it("default state has focusedSentenceId null", () => {
    expect(DEFAULT_READING_ASSIST_STATE.focusedSentenceId).toBeNull();
    expect(isAnySentenceFocused(DEFAULT_READING_ASSIST_STATE)).toBe(false);
  });

  it("isSentenceFocused returns true when block and sentence match", () => {
    const state: ReadingAssistState = {
      mode: "focus_block",
      focusedBlockId: "article-1-block-0",
      focusedSentenceId: "article-1-block-0-sentence-2",
      sourceType: "article",
    };
    expect(isSentenceFocused(state, "article-1-block-0-sentence-2", "article-1-block-0", "article")).toBe(true);
  });

  it("isSentenceFocused returns false when sentenceId does not match", () => {
    const state: ReadingAssistState = {
      mode: "focus_block",
      focusedBlockId: "article-1-block-0",
      focusedSentenceId: "article-1-block-0-sentence-2",
      sourceType: "article",
    };
    expect(isSentenceFocused(state, "article-1-block-0-sentence-1", "article-1-block-0", "article")).toBe(false);
  });

  it("isSentenceFocused returns false when blockId does not match", () => {
    const state: ReadingAssistState = {
      mode: "focus_block",
      focusedBlockId: "article-1-block-0",
      focusedSentenceId: "article-1-block-0-sentence-2",
      sourceType: "article",
    };
    expect(isSentenceFocused(state, "article-1-block-0-sentence-2", "article-1-block-1", "article")).toBe(false);
  });

  it("isSentenceFocused returns false when mode is off", () => {
    const state: ReadingAssistState = {
      ...DEFAULT_READING_ASSIST_STATE,
      focusedSentenceId: "article-1-block-0-sentence-0",
    };
    expect(state.mode).toBe("off");
    expect(isSentenceFocused(state, "article-1-block-0-sentence-0", "article-1-block-0", "article")).toBe(false);
  });

  it("isAnySentenceFocused returns true when focusedSentenceId is set", () => {
    expect(
      isAnySentenceFocused({
        mode: "focus_block",
        focusedBlockId: "b",
        focusedSentenceId: "b-sentence-0",
        sourceType: "article",
      })
    ).toBe(true);
  });

  it("isAnySentenceFocused returns false when focusedSentenceId is null", () => {
    expect(
      isAnySentenceFocused({
        mode: "focus_block",
        focusedBlockId: "b",
        focusedSentenceId: null,
        sourceType: "article",
      })
    ).toBe(false);
  });
});

describe("sentence anchoring (v2)", () => {
  it("getSentenceAnchorsForBlock returns anchors with correct id scheme", () => {
    const text = "First sentence. Second sentence! Third?";
    const anchors = getSentenceAnchorsForBlock(text, "article-123-block-4");
    expect(anchors.length).toBeGreaterThanOrEqual(1);
    expect(anchors[0].id).toBe("article-123-block-4-sentence-0");
    expect(anchors[0].startOffset).toBeGreaterThanOrEqual(0);
    expect(anchors[0].endOffset).toBeGreaterThan(anchors[0].startOffset);
  });

  it("getSentenceAnchorsForBlock returns empty for empty text", () => {
    expect(getSentenceAnchorsForBlock("", "article-1-block-0")).toEqual([]);
    expect(getSentenceAnchorsForBlock("   ", "article-1-block-0")).toEqual([]);
  });

  it("getSentenceAnchorsForStudyBlock concatenates content and bulletItems", () => {
    const anchors = getSentenceAnchorsForStudyBlock("Overview here.", ["Point one.", "Point two."], "sb-1");
    expect(anchors.length).toBeGreaterThanOrEqual(1);
    expect(anchors[0].id).toMatch(/^sb-1-sentence-\d+$/);
  });
});

describe("off-state behavior", () => {
  it("default state does not indicate any block focused", () => {
    expect(isAnyBlockFocused(DEFAULT_READING_ASSIST_STATE)).toBe(false);
    expect(isBlockFocused(DEFAULT_READING_ASSIST_STATE, "any-id", "article")).toBe(false);
    expect(isReadingFocusActive(DEFAULT_READING_ASSIST_STATE)).toBe(false);
  });
});

describe("v3 sentence focus surface — state transitions", () => {
  it("tapping a sentence sets focusedSentenceId when block is focused", () => {
    const state: ReadingAssistState = {
      mode: "focus_block",
      focusedBlockId: "article-1-block-0",
      focusedSentenceId: null,
      sourceType: "article",
    };
    const nextState: ReadingAssistState = { ...state, focusedSentenceId: "article-1-block-0-sentence-1" };
    expect(isSentenceFocused(nextState, "article-1-block-0-sentence-1", "article-1-block-0", "article")).toBe(true);
    expect(isAnySentenceFocused(nextState)).toBe(true);
  });

  it("tapping same sentence again clears focusedSentenceId (UI calls clearSentenceFocus)", () => {
    const state: ReadingAssistState = {
      mode: "focus_block",
      focusedBlockId: "article-1-block-0",
      focusedSentenceId: "article-1-block-0-sentence-1",
      sourceType: "article",
    };
    const cleared: ReadingAssistState = { ...state, focusedSentenceId: null };
    expect(isAnySentenceFocused(cleared)).toBe(false);
    expect(isSentenceFocused(cleared, "article-1-block-0-sentence-1", "article-1-block-0", "article")).toBe(false);
  });

  it("changing block clears sentence focus (context setFocus sets focusedSentenceId to null)", () => {
    const afterBlockChange: ReadingAssistState = {
      mode: "focus_block",
      focusedBlockId: "article-1-block-1",
      focusedSentenceId: null,
      sourceType: "article",
    };
    expect(afterBlockChange.focusedSentenceId).toBeNull();
    expect(isSentenceFocused(afterBlockChange, "article-1-block-0-sentence-0", "article-1-block-0", "article")).toBe(false);
  });

  it("turning mode off clears sentence focus", () => {
    const stateOff: ReadingAssistState = {
      ...DEFAULT_READING_ASSIST_STATE,
      mode: "off",
      focusedSentenceId: null,
    };
    expect(stateOff.focusedSentenceId).toBeNull();
    expect(isAnySentenceFocused(stateOff)).toBe(false);
  });
});

describe("v3 text reconstruction from anchors", () => {
  it("anchors slice trimmed block text without changing content", () => {
    const text = "  First. Second! Third?  ";
    const trimmed = text.trim();
    const anchors = getSentenceAnchorsForBlock(text, "b");
    let reconstructed = "";
    anchors.forEach((a) => {
      reconstructed += trimmed.slice(a.startOffset, a.endOffset);
    });
    expect(reconstructed).toBe(trimmed);
  });
});

describe("v4 getFocusedSentenceText", () => {
  it("returns exact sentence text when focused sentence id matches an anchor", () => {
    const blockText = "First sentence. Second sentence! Third?";
    const anchors = getSentenceAnchorsForBlock(blockText, "article-1-block-0");
    const secondId = anchors[1].id;
    const result = getFocusedSentenceText(blockText, anchors, secondId);
    expect(result).not.toBeNull();
    expect(result).toBe(blockText.trim().slice(anchors[1].startOffset, anchors[1].endOffset));
  });

  it("returns null when focusedSentenceId is null", () => {
    const blockText = "One. Two.";
    const anchors = getSentenceAnchorsForBlock(blockText, "b");
    expect(getFocusedSentenceText(blockText, anchors, null)).toBeNull();
  });

  it("returns null when sentence id does not match any anchor", () => {
    const blockText = "One. Two.";
    const anchors = getSentenceAnchorsForBlock(blockText, "b");
    expect(getFocusedSentenceText(blockText, anchors, "other-block-sentence-0")).toBeNull();
  });

  it("returns null when anchors array is empty", () => {
    expect(getFocusedSentenceText("Hello.", [], "b-sentence-0")).toBeNull();
  });

  it("preserves text fidelity exactly", () => {
    const blockText = "  Punctuation: period. exclamation! question?  ";
    const trimmed = blockText.trim();
    const anchors = getSentenceAnchorsForBlock(blockText, "x");
    const first = getFocusedSentenceText(blockText, anchors, anchors[0].id);
    expect(first).toBe(trimmed.slice(anchors[0].startOffset, anchors[0].endOffset));
    expect(first).not.toBeNull();
  });
});

describe("v5 guided sentence progression", () => {
  const blockText = "First. Second! Third?";
  const anchors = getSentenceAnchorsForBlock(blockText, "b");

  it("getFocusedSentenceIndex resolves correctly", () => {
    expect(getFocusedSentenceIndex(anchors, anchors[0].id)).toBe(0);
    expect(getFocusedSentenceIndex(anchors, anchors[1].id)).toBe(1);
    expect(getFocusedSentenceIndex(anchors, anchors[2].id)).toBe(2);
  });

  it("getPreviousSentenceId returns null at first sentence", () => {
    expect(getPreviousSentenceId(anchors, anchors[0].id)).toBeNull();
  });

  it("getPreviousSentenceId resolves correctly in middle", () => {
    expect(getPreviousSentenceId(anchors, anchors[1].id)).toBe(anchors[0].id);
    expect(getPreviousSentenceId(anchors, anchors[2].id)).toBe(anchors[1].id);
  });

  it("getNextSentenceId returns null at last sentence", () => {
    expect(getNextSentenceId(anchors, anchors[anchors.length - 1].id)).toBeNull();
  });

  it("getNextSentenceId resolves correctly in middle", () => {
    expect(getNextSentenceId(anchors, anchors[0].id)).toBe(anchors[1].id);
    expect(getNextSentenceId(anchors, anchors[1].id)).toBe(anchors[2].id);
  });

  it("invalid focused sentence id returns null progression", () => {
    expect(getPreviousSentenceId(anchors, "other-sentence-0")).toBeNull();
    expect(getNextSentenceId(anchors, "other-sentence-0")).toBeNull();
    expect(getFocusedSentenceIndex(anchors, "other-sentence-0")).toBe(-1);
  });

  it("empty anchors handled safely", () => {
    expect(getFocusedSentenceIndex([], "b-sentence-0")).toBe(-1);
    expect(getPreviousSentenceId([], "b-sentence-0")).toBeNull();
    expect(getNextSentenceId([], "b-sentence-0")).toBeNull();
    const state = getSentenceProgressionState([], "b-sentence-0");
    expect(state.currentIndex).toBe(-1);
    expect(state.total).toBe(0);
    expect(state.previousSentenceId).toBeNull();
    expect(state.nextSentenceId).toBeNull();
  });

  it("getSentenceProgressionState returns correct shape", () => {
    const state = getSentenceProgressionState(anchors, anchors[1].id);
    expect(state.currentIndex).toBe(1);
    expect(state.total).toBe(3);
    expect(state.previousSentenceId).toBe(anchors[0].id);
    expect(state.nextSentenceId).toBe(anchors[2].id);
  });

  it("v5 state transition: Next focuses next sentence, Previous returns", () => {
    const state1 = getSentenceProgressionState(anchors, anchors[0].id);
    expect(state1.nextSentenceId).toBe(anchors[1].id);
    const state2 = getSentenceProgressionState(anchors, anchors[1].id);
    expect(state2.previousSentenceId).toBe(anchors[0].id);
    expect(state2.nextSentenceId).toBe(anchors[2].id);
  });
});

describe("v6 getReadingAssistScrollTarget", () => {
  const viewportHeight = 400;
  const currentScrollY = 100;

  it("returns null when block is already comfortably visible", () => {
    const result = getReadingAssistScrollTarget({
      blockTop: 200,
      blockHeight: 80,
      viewportHeight,
      currentScrollY,
      preferredTopOffset: 80,
      bottomPadding: 24,
    });
    expect(result).toBeNull();
  });

  it("returns upward target when block is too high", () => {
    const result = getReadingAssistScrollTarget({
      blockTop: 50,
      blockHeight: 60,
      viewportHeight,
      currentScrollY,
      preferredTopOffset: 80,
    });
    expect(result).not.toBeNull();
    expect(result!).toBeLessThanOrEqual(currentScrollY);
    expect(result!).toBeGreaterThanOrEqual(0);
  });

  it("returns downward target when block extends too low", () => {
    const result = getReadingAssistScrollTarget({
      blockTop: 400,
      blockHeight: 100,
      viewportHeight,
      currentScrollY,
      bottomPadding: 24,
    });
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThanOrEqual(currentScrollY);
    expect(result!).toBeGreaterThanOrEqual(0);
  });

  it("handles small viewport safely", () => {
    const result = getReadingAssistScrollTarget({
      blockTop: 10,
      blockHeight: 50,
      viewportHeight: 100,
      currentScrollY: 0,
    });
    expect(result === null || (typeof result === "number" && result >= 0)).toBe(true);
  });

  it("returns null when viewport height is zero", () => {
    expect(
      getReadingAssistScrollTarget({
        blockTop: 0,
        blockHeight: 100,
        viewportHeight: 0,
        currentScrollY: 0,
      })
    ).toBeNull();
  });

  it("clamps target to non-negative", () => {
    const result = getReadingAssistScrollTarget({
      blockTop: 10,
      blockHeight: 60,
      viewportHeight,
      currentScrollY: 50,
      preferredTopOffset: 80,
    });
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThanOrEqual(0);
  });

  it("returns null when delta below minDelta (avoids jitter)", () => {
    const result = getReadingAssistScrollTarget({
      blockTop: 175,
      blockHeight: 80,
      viewportHeight,
      currentScrollY: 100,
      preferredTopOffset: 80,
      minDelta: 20,
    });
    expect(result).toBeNull();
  });
});

describe("v7 inline sentence steering", () => {
  const blockText = "First. Second! Third?";
  const anchors = getSentenceAnchorsForBlock(blockText, "b");

  it("getAdjacentSentenceIds returns previous/next for middle sentence", () => {
    const mid = getAdjacentSentenceIds(anchors, anchors[1].id);
    expect(mid.previousSentenceId).toBe(anchors[0].id);
    expect(mid.nextSentenceId).toBe(anchors[2].id);
  });

  it("getAdjacentSentenceIds previous null at first sentence", () => {
    const first = getAdjacentSentenceIds(anchors, anchors[0].id);
    expect(first.previousSentenceId).toBeNull();
    expect(first.nextSentenceId).toBe(anchors[1].id);
  });

  it("getAdjacentSentenceIds next null at last sentence", () => {
    const last = getAdjacentSentenceIds(anchors, anchors[2].id);
    expect(last.previousSentenceId).toBe(anchors[1].id);
    expect(last.nextSentenceId).toBeNull();
  });

  it("getAdjacentSentenceIds both null when focused id invalid", () => {
    const invalid = getAdjacentSentenceIds(anchors, "other-sentence-0");
    expect(invalid.previousSentenceId).toBeNull();
    expect(invalid.nextSentenceId).toBeNull();
  });

  it("getAdjacentSentenceIds safe for empty anchors", () => {
    const empty = getAdjacentSentenceIds([], "b-sentence-0");
    expect(empty.previousSentenceId).toBeNull();
    expect(empty.nextSentenceId).toBeNull();
  });

  it("isAdjacentSentence true for previous and next only", () => {
    const focusedId = anchors[1].id;
    expect(isAdjacentSentence(anchors, focusedId, anchors[0].id)).toBe(true);
    expect(isAdjacentSentence(anchors, focusedId, anchors[2].id)).toBe(true);
  });

  it("isAdjacentSentence false for focused sentence itself", () => {
    const focusedId = anchors[1].id;
    expect(isAdjacentSentence(anchors, focusedId, anchors[1].id)).toBe(false);
  });

  it("isAdjacentSentence false for non-adjacent sentences", () => {
    const focusedId = anchors[1].id;
    expect(isAdjacentSentence(anchors, focusedId, anchors[0].id)).toBe(true);
    expect(isAdjacentSentence(anchors, focusedId, anchors[2].id)).toBe(true);
    expect(isAdjacentSentence(anchors, focusedId, "other-block-sentence-0")).toBe(false);
  });

  it("isAdjacentSentence safe for empty anchors or null focused id", () => {
    expect(isAdjacentSentence([], null, "b-sentence-0")).toBe(false);
    expect(isAdjacentSentence(anchors, null, anchors[0].id)).toBe(false);
  });
});

describe("v8 focus event spine — event shape", () => {
  const eventTypes: ReadingAssistEventType[] = [
    "block_focus_set",
    "block_focus_cleared",
    "sentence_focus_set",
    "sentence_focus_cleared",
    "sentence_progress_next",
    "sentence_progress_previous",
  ];

  it("ReadingAssistEvent has required fields", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 123,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    expect(event.type).toBe("block_focus_set");
    expect(event.timestamp).toBe(123);
    expect(event.sourceType).toBe("article");
    expect(event.blockId).toBe("b1");
    expect(event.sentenceId).toBeNull();
  });

  it("all event types are valid", () => {
    eventTypes.forEach((type) => {
      const event: ReadingAssistEvent = {
        type,
        timestamp: Date.now(),
        sourceType: null,
        blockId: null,
        sentenceId: null,
      };
      expect(event.type).toBe(type);
    });
  });

  it("block_focus_set event payload contract", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: Date.now(),
      sourceType: "article",
      blockId: "article-1-block-0",
      sentenceId: null,
    };
    expect(event.blockId).toBeTruthy();
    expect(event.sentenceId).toBeNull();
  });

  it("block_focus_cleared event payload contract", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_cleared",
      timestamp: Date.now(),
      sourceType: null,
      blockId: null,
      sentenceId: null,
    };
    expect(event.blockId).toBeNull();
    expect(event.sentenceId).toBeNull();
  });

  it("sentence_focus_set event payload contract", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: Date.now(),
      sourceType: "article",
      blockId: "article-1-block-0",
      sentenceId: "article-1-block-0-sentence-1",
    };
    expect(event.blockId).toBeTruthy();
    expect(event.sentenceId).toBeTruthy();
  });

  it("sentence_progress_next and sentence_progress_previous payload contract", () => {
    const next: ReadingAssistEvent = {
      type: "sentence_progress_next",
      timestamp: Date.now(),
      sourceType: "article",
      blockId: "article-1-block-0",
      sentenceId: "article-1-block-0-sentence-2",
    };
    const prev: ReadingAssistEvent = {
      type: "sentence_progress_previous",
      timestamp: Date.now(),
      sourceType: "article",
      blockId: "article-1-block-0",
      sentenceId: "article-1-block-0-sentence-0",
    };
    expect(next.blockId).toBeTruthy();
    expect(next.sentenceId).toBeTruthy();
    expect(prev.blockId).toBeTruthy();
    expect(prev.sentenceId).toBeTruthy();
  });
});

describe("v9 focus session aggregator", () => {
  it("default summary initializes correctly", () => {
    const s = DEFAULT_READING_ASSIST_SESSION_SUMMARY;
    expect(s.sourceType).toBeNull();
    expect(s.startedAt).toBeNull();
    expect(s.endedAt).toBeNull();
    expect(s.focusedBlockIds).toEqual([]);
    expect(s.focusedSentenceIds).toEqual([]);
    expect(s.blockFocusCount).toBe(0);
    expect(s.sentenceFocusCount).toBe(0);
    expect(s.sentenceProgressNextCount).toBe(0);
    expect(s.sentenceProgressPreviousCount).toBe(0);
    expect(s.lastBlockId).toBeNull();
    expect(s.lastSentenceId).toBeNull();
  });

  it("first event sets startedAt", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const next = reduceReadingAssistSessionSummary(
      DEFAULT_READING_ASSIST_SESSION_SUMMARY,
      event
    );
    expect(next.startedAt).toBe(100);
    expect(next.endedAt).toBe(100);
  });

  it("every event updates endedAt", () => {
    const prev: ReadingAssistSessionSummary = {
      ...DEFAULT_READING_ASSIST_SESSION_SUMMARY,
      startedAt: 50,
      endedAt: 50,
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 200,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const next = reduceReadingAssistSessionSummary(prev, event);
    expect(next.endedAt).toBe(200);
    expect(next.startedAt).toBe(50);
  });

  it("block_focus_set adds unique block id and increments count", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "article-1-block-0",
      sentenceId: null,
    };
    const next = reduceReadingAssistSessionSummary(
      DEFAULT_READING_ASSIST_SESSION_SUMMARY,
      event
    );
    expect(next.focusedBlockIds).toEqual(["article-1-block-0"]);
    expect(next.blockFocusCount).toBe(1);
    expect(next.lastBlockId).toBe("article-1-block-0");
    expect(next.lastSentenceId).toBeNull();
  });

  it("duplicate block focus increments count but does not duplicate id", () => {
    const prev: ReadingAssistSessionSummary = {
      ...DEFAULT_READING_ASSIST_SESSION_SUMMARY,
      focusedBlockIds: ["b1"],
      blockFocusCount: 1,
    };
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 200,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const next = reduceReadingAssistSessionSummary(prev, event);
    expect(next.focusedBlockIds).toEqual(["b1"]);
    expect(next.blockFocusCount).toBe(2);
  });

  it("sentence_focus_set adds unique sentence id and increments count", () => {
    const prev: ReadingAssistSessionSummary = {
      ...DEFAULT_READING_ASSIST_SESSION_SUMMARY,
      focusedBlockIds: ["b1"],
      lastBlockId: "b1",
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-sentence-0",
    };
    const next = reduceReadingAssistSessionSummary(prev, event);
    expect(next.focusedSentenceIds).toEqual(["b1-sentence-0"]);
    expect(next.sentenceFocusCount).toBe(1);
    expect(next.lastSentenceId).toBe("b1-sentence-0");
    expect(next.lastBlockId).toBe("b1");
  });

  it("progression events increment their respective counters", () => {
    let s: ReadingAssistSessionSummary = {
      ...DEFAULT_READING_ASSIST_SESSION_SUMMARY,
      startedAt: 0,
      endedAt: 0,
    };
    s = reduceReadingAssistSessionSummary(s, {
      type: "sentence_progress_next",
      timestamp: 10,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s1",
    });
    expect(s.sentenceProgressNextCount).toBe(1);
    s = reduceReadingAssistSessionSummary(s, {
      type: "sentence_progress_previous",
      timestamp: 20,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    });
    expect(s.sentenceProgressNextCount).toBe(1);
    expect(s.sentenceProgressPreviousCount).toBe(1);
  });

  it("sourceType updates from latest non-null event", () => {
    let s = reduceReadingAssistSessionSummary(
      DEFAULT_READING_ASSIST_SESSION_SUMMARY,
      {
        type: "block_focus_set",
        timestamp: 1,
        sourceType: "article",
        blockId: "b1",
        sentenceId: null,
      }
    );
    expect(s.sourceType).toBe("article");
    s = reduceReadingAssistSessionSummary(s, {
      type: "block_focus_cleared",
      timestamp: 2,
      sourceType: null,
      blockId: null,
      sentenceId: null,
    });
    expect(s.sourceType).toBe("article");
  });

  it("block_focus_cleared sets last ids to null", () => {
    const prev: ReadingAssistSessionSummary = {
      ...DEFAULT_READING_ASSIST_SESSION_SUMMARY,
      lastBlockId: "b1",
      lastSentenceId: "b1-s0",
    };
    const next = reduceReadingAssistSessionSummary(prev, {
      type: "block_focus_cleared",
      timestamp: 100,
      sourceType: null,
      blockId: null,
      sentenceId: null,
    });
    expect(next.lastBlockId).toBeNull();
    expect(next.lastSentenceId).toBeNull();
  });

  it("sentence_focus_cleared sets lastSentenceId to null", () => {
    const prev: ReadingAssistSessionSummary = {
      ...DEFAULT_READING_ASSIST_SESSION_SUMMARY,
      lastBlockId: "b1",
      lastSentenceId: "b1-s0",
    };
    const next = reduceReadingAssistSessionSummary(prev, {
      type: "sentence_focus_cleared",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    });
    expect(next.lastSentenceId).toBeNull();
    expect(next.lastBlockId).toBe("b1");
  });

  it("reset yields default summary shape", () => {
    const s = DEFAULT_READING_ASSIST_SESSION_SUMMARY;
    expect(s.blockFocusCount).toBe(0);
    expect(s.sentenceFocusCount).toBe(0);
    expect(s.focusedBlockIds).toEqual([]);
    expect(s.startedAt).toBeNull();
  });
});

describe("v10 dwell and backtrack heuristics", () => {
  it("default heuristic state has zero counts and null direction", () => {
    const h = DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY;
    expect(h.totalBlockDwellMs).toBe(0);
    expect(h.totalSentenceDwellMs).toBe(0);
    expect(h.dwellByBlockId).toEqual({});
    expect(h.dwellBySentenceId).toEqual({});
    expect(h.backtrackCount).toBe(0);
    expect(h.lastProgressDirection).toBeNull();
  });

  it("default heuristic state carrier has null actives and timestamp", () => {
    const s = DEFAULT_READING_ASSIST_HEURISTIC_STATE;
    expect(s.summary).toEqual(DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY);
    expect(s.activeBlockId).toBeNull();
    expect(s.activeSentenceId).toBeNull();
    expect(s.lastEventTimestamp).toBeNull();
  });

  it("block dwell increases by event timestamp delta", () => {
    let state: ReadingAssistHeuristicState = DEFAULT_READING_ASSIST_HEURISTIC_STATE;
    state = reduceReadingAssistHeuristicState(state, {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    });
    state = reduceReadingAssistHeuristicState(state, {
      type: "sentence_focus_set",
      timestamp: 250,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    });
    expect(state.summary.totalBlockDwellMs).toBe(150);
    expect(state.summary.dwellByBlockId["b1"]).toBe(150);
  });

  it("sentence dwell increases by event timestamp delta", () => {
    let state: ReadingAssistHeuristicState = {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      activeBlockId: "b1",
      activeSentenceId: "b1-s0",
      lastEventTimestamp: 100,
    };
    state = reduceReadingAssistHeuristicState(state, {
      type: "sentence_progress_next",
      timestamp: 300,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s1",
    });
    expect(state.summary.totalSentenceDwellMs).toBe(200);
    expect(state.summary.dwellBySentenceId["b1-s0"]).toBe(200);
    expect(state.summary.totalBlockDwellMs).toBe(200);
    expect(state.summary.dwellByBlockId["b1"]).toBe(200);
  });

  it("totals and per-id maps update correctly across multiple dwells", () => {
    let state: ReadingAssistHeuristicState = DEFAULT_READING_ASSIST_HEURISTIC_STATE;
    state = reduceReadingAssistHeuristicState(state, {
      type: "block_focus_set",
      timestamp: 0,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    });
    state = reduceReadingAssistHeuristicState(state, {
      type: "sentence_focus_set",
      timestamp: 50,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    });
    state = reduceReadingAssistHeuristicState(state, {
      type: "sentence_progress_next",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s1",
    });
    expect(state.summary.totalBlockDwellMs).toBe(150);
    expect(state.summary.totalSentenceDwellMs).toBe(100);
    expect(state.summary.dwellByBlockId["b1"]).toBe(150);
    expect(state.summary.dwellBySentenceId["b1-s0"]).toBe(100);
    expect(state.summary.dwellBySentenceId["b1-s1"]).toBeUndefined();
  });

  it("negative or zero delta adds no dwell", () => {
    let state: ReadingAssistHeuristicState = {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      activeBlockId: "b1",
      lastEventTimestamp: 100,
    };
    state = reduceReadingAssistHeuristicState(state, {
      type: "block_focus_cleared",
      timestamp: 80,
      sourceType: null,
      blockId: null,
      sentenceId: null,
    });
    expect(state.summary.totalBlockDwellMs).toBe(0);
    state = reduceReadingAssistHeuristicState(state, {
      type: "block_focus_set",
      timestamp: 80,
      sourceType: "article",
      blockId: "b2",
      sentenceId: null,
    });
    state = reduceReadingAssistHeuristicState(state, {
      type: "block_focus_cleared",
      timestamp: 80,
      sourceType: null,
      blockId: null,
      sentenceId: null,
    });
    expect(state.summary.totalBlockDwellMs).toBe(0);
  });

  it("no active block or sentence means no dwell added", () => {
    let state: ReadingAssistHeuristicState = DEFAULT_READING_ASSIST_HEURISTIC_STATE;
    state = reduceReadingAssistHeuristicState(state, {
      type: "block_focus_cleared",
      timestamp: 100,
      sourceType: null,
      blockId: null,
      sentenceId: null,
    });
    state = reduceReadingAssistHeuristicState(state, {
      type: "block_focus_set",
      timestamp: 200,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    });
    expect(state.summary.totalBlockDwellMs).toBe(0);
    expect(state.summary.totalSentenceDwellMs).toBe(0);
  });

  it("block_focus_set activates block and clears sentence", () => {
    let state: ReadingAssistHeuristicState = {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      activeBlockId: "b0",
      activeSentenceId: "b0-s0",
      lastEventTimestamp: 0,
    };
    state = reduceReadingAssistHeuristicState(state, {
      type: "block_focus_set",
      timestamp: 10,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    });
    expect(state.activeBlockId).toBe("b1");
    expect(state.activeSentenceId).toBeNull();
  });

  it("sentence_focus_set activates sentence and can set block", () => {
    let state: ReadingAssistHeuristicState = {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      activeBlockId: "b1",
      lastEventTimestamp: 0,
    };
    state = reduceReadingAssistHeuristicState(state, {
      type: "sentence_focus_set",
      timestamp: 10,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s2",
    });
    expect(state.activeSentenceId).toBe("b1-s2");
    expect(state.activeBlockId).toBe("b1");
  });

  it("block_focus_cleared clears both actives", () => {
    let state: ReadingAssistHeuristicState = {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      activeBlockId: "b1",
      activeSentenceId: "b1-s0",
      lastEventTimestamp: 0,
    };
    state = reduceReadingAssistHeuristicState(state, {
      type: "block_focus_cleared",
      timestamp: 10,
      sourceType: null,
      blockId: null,
      sentenceId: null,
    });
    expect(state.activeBlockId).toBeNull();
    expect(state.activeSentenceId).toBeNull();
  });

  it("sentence_focus_cleared clears active sentence only", () => {
    let state: ReadingAssistHeuristicState = {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      activeBlockId: "b1",
      activeSentenceId: "b1-s0",
      lastEventTimestamp: 0,
    };
    state = reduceReadingAssistHeuristicState(state, {
      type: "sentence_focus_cleared",
      timestamp: 10,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    });
    expect(state.activeSentenceId).toBeNull();
    expect(state.activeBlockId).toBe("b1");
  });

  it("next then previous increments backtrack count", () => {
    let state: ReadingAssistHeuristicState = DEFAULT_READING_ASSIST_HEURISTIC_STATE;
    state = reduceReadingAssistHeuristicState(state, {
      type: "sentence_progress_next",
      timestamp: 10,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s1",
    });
    expect(state.summary.backtrackCount).toBe(0);
    state = reduceReadingAssistHeuristicState(state, {
      type: "sentence_progress_previous",
      timestamp: 20,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    });
    expect(state.summary.backtrackCount).toBe(1);
    expect(state.summary.lastProgressDirection).toBe("previous");
  });

  it("previous then next increments backtrack count", () => {
    let state: ReadingAssistHeuristicState = DEFAULT_READING_ASSIST_HEURISTIC_STATE;
    state = reduceReadingAssistHeuristicState(state, {
      type: "sentence_progress_previous",
      timestamp: 10,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    });
    state = reduceReadingAssistHeuristicState(state, {
      type: "sentence_progress_next",
      timestamp: 20,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s1",
    });
    expect(state.summary.backtrackCount).toBe(1);
    expect(state.summary.lastProgressDirection).toBe("next");
  });

  it("next then next does not increment backtrack count", () => {
    let state: ReadingAssistHeuristicState = DEFAULT_READING_ASSIST_HEURISTIC_STATE;
    state = reduceReadingAssistHeuristicState(state, {
      type: "sentence_progress_next",
      timestamp: 10,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s1",
    });
    state = reduceReadingAssistHeuristicState(state, {
      type: "sentence_progress_next",
      timestamp: 20,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s2",
    });
    expect(state.summary.backtrackCount).toBe(0);
    expect(state.summary.lastProgressDirection).toBe("next");
  });

  it("previous then previous does not increment backtrack count", () => {
    let state: ReadingAssistHeuristicState = DEFAULT_READING_ASSIST_HEURISTIC_STATE;
    state = reduceReadingAssistHeuristicState(state, {
      type: "sentence_progress_previous",
      timestamp: 10,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    });
    state = reduceReadingAssistHeuristicState(state, {
      type: "sentence_progress_previous",
      timestamp: 20,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    });
    expect(state.summary.backtrackCount).toBe(0);
    expect(state.summary.lastProgressDirection).toBe("previous");
  });

  it("reset yields default heuristic summary shape", () => {
    const s = DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY;
    expect(s.totalBlockDwellMs).toBe(0);
    expect(s.totalSentenceDwellMs).toBe(0);
    expect(Object.keys(s.dwellByBlockId)).toHaveLength(0);
    expect(Object.keys(s.dwellBySentenceId)).toHaveLength(0);
    expect(s.backtrackCount).toBe(0);
    expect(s.lastProgressDirection).toBeNull();
  });
});

describe("v11 verification-aware reading path", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
      },
    };
  }

  it("default reading path summary has empty ids and null last ids", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.examinedBlockIds).toEqual([]);
    expect(r.examinedSentenceIds).toEqual([]);
    expect(r.blocks).toEqual({});
    expect(r.sentences).toEqual({});
    expect(r.lastExaminedBlockId).toBeNull();
    expect(r.lastExaminedSentenceId).toBeNull();
  });

  it("block_focus_set creates block record", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.examinedBlockIds).toEqual(["b1"]);
    expect(next.blocks["b1"]).toBeDefined();
    expect(next.blocks["b1"].blockId).toBe("b1");
    expect(next.blocks["b1"].focusCount).toBe(1);
    expect(next.blocks["b1"].firstSeenAt).toBe(100);
    expect(next.blocks["b1"].lastSeenAt).toBe(100);
    expect(next.lastExaminedBlockId).toBe("b1");
  });

  it("duplicate block focus increments focusCount but does not duplicate id", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedBlockIds: ["b1"],
      blocks: {
        b1: {
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          examinedSentenceIds: [],
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 200,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 100 }, {});
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.examinedBlockIds).toEqual(["b1"]);
    expect(next.blocks["b1"].focusCount).toBe(2);
    expect(next.blocks["b1"].firstSeenAt).toBe(50);
    expect(next.blocks["b1"].lastSeenAt).toBe(200);
  });

  it("sentence_focus_set creates sentence record", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.examinedSentenceIds).toContain("b1-s0");
    expect(next.sentences["b1-s0"]).toBeDefined();
    expect(next.sentences["b1-s0"].sentenceId).toBe("b1-s0");
    expect(next.sentences["b1-s0"].blockId).toBe("b1");
    expect(next.sentences["b1-s0"].focusCount).toBe(1);
    expect(next.sentences["b1-s0"].firstSeenAt).toBe(100);
    expect(next.sentences["b1-s0"].lastSeenAt).toBe(100);
    expect(next.lastExaminedSentenceId).toBe("b1-s0");
  });

  it("sentence_focus_set links sentence into parent block examinedSentenceIds", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedBlockIds: ["b1"],
      blocks: {
        b1: {
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          examinedSentenceIds: [],
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.blocks["b1"].examinedSentenceIds).toContain("b1-s0");
  });

  it("duplicate sentence focus increments focusCount but does not duplicate id", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 20 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.sentences["b1-s0"].focusCount).toBe(2);
    expect(next.sentences["b1-s0"].firstSeenAt).toBe(50);
    expect(next.sentences["b1-s0"].lastSeenAt).toBe(150);
  });

  it("progression to sentence increments progressedToCount", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0", "b1-s1"],
      lastExaminedSentenceId: "b1-s0",
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 10,
          lastSeenAt: 10,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
        "b1-s1": {
          sentenceId: "b1-s1",
          blockId: "b1",
          firstSeenAt: null,
          lastSeenAt: null,
          estimatedDwellMs: 0,
          focusCount: 0,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_progress_next",
      timestamp: 20,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s1",
    };
    const heuristic = heuristicStateWithDwell({ b1: 10 }, { "b1-s0": 10, "b1-s1": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.sentences["b1-s1"].progressedToCount).toBe(1);
    expect(next.lastExaminedSentenceId).toBe("b1-s1");
  });

  it("prior sentence gets progressedFromCount when progressing to another", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0", "b1-s1"],
      lastExaminedSentenceId: "b1-s0",
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 10,
          lastSeenAt: 10,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
        "b1-s1": {
          sentenceId: "b1-s1",
          blockId: "b1",
          firstSeenAt: null,
          lastSeenAt: null,
          estimatedDwellMs: 0,
          focusCount: 0,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_progress_next",
      timestamp: 20,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s1",
    };
    const heuristic = heuristicStateWithDwell({}, {});
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.sentences["b1-s0"].progressedFromCount).toBe(1);
  });

  it("progression when prior sentence missing does not throw", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      lastExaminedSentenceId: "missing-s",
    };
    const event: ReadingAssistEvent = {
      type: "sentence_progress_next",
      timestamp: 20,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s1",
    };
    const heuristic = heuristicStateWithDwell({}, {});
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.sentences["b1-s1"]).toBeDefined();
    expect(next.sentences["b1-s1"].progressedToCount).toBe(1);
  });

  it("progression when destination sentence null is safe", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      lastExaminedSentenceId: "b1-s0",
    };
    const event: ReadingAssistEvent = {
      type: "sentence_progress_next",
      timestamp: 20,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = DEFAULT_READING_ASSIST_HEURISTIC_STATE;
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.lastExaminedSentenceId).toBe("b1-s0");
  });

  it("dwell mirrors from heuristic summary for known block and sentence", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedBlockIds: ["b1"],
      examinedSentenceIds: ["b1-s0"],
      blocks: {
        b1: {
          blockId: "b1",
          firstSeenAt: 0,
          lastSeenAt: 0,
          estimatedDwellMs: 0,
          focusCount: 1,
          examinedSentenceIds: ["b1-s0"],
        },
      },
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 0,
          lastSeenAt: 0,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 50,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 100 }, { "b1-s0": 40 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.blocks["b1"].estimatedDwellMs).toBe(100);
    expect(next.sentences["b1-s0"].estimatedDwellMs).toBe(40);
  });

  it("unknown block/sentence ids in heuristic do not break reading path", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedBlockIds: ["b1"],
      blocks: {
        b1: {
          blockId: "b1",
          firstSeenAt: 0,
          lastSeenAt: 0,
          estimatedDwellMs: 0,
          focusCount: 1,
          examinedSentenceIds: [],
        },
      },
    };
    const heuristic = heuristicStateWithDwell({ otherBlock: 999 }, { otherSentence: 999 });
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 10,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.blocks["b1"].estimatedDwellMs).toBe(0);
    expect(next.blocks["otherBlock"]).toBeUndefined();
  });

  it("reset yields default reading path shape", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.examinedBlockIds).toEqual([]);
    expect(r.examinedSentenceIds).toEqual([]);
    expect(Object.keys(r.blocks)).toHaveLength(0);
    expect(Object.keys(r.sentences)).toHaveLength(0);
    expect(r.lastExaminedBlockId).toBeNull();
    expect(r.lastExaminedSentenceId).toBeNull();
    expect(r.markers).toEqual([]);
    expect(r.markerIds).toEqual([]);
    expect(r.observedBacktrackCount).toBe(0);
    expect(r.anchorSummary.blockSlots).toEqual({});
    expect(r.anchorSummary.sentenceSlots).toEqual({});
    expect(r.anchorSummary.blockSlotIds).toEqual([]);
    expect(r.anchorSummary.sentenceSlotIds).toEqual([]);
    expect(r.attachmentRegistry.claimRegistry).toEqual({});
    expect(r.attachmentRegistry.sourceRegistry).toEqual({});
    expect(r.attachmentRegistry.disagreementRegistry).toEqual({});
    expect(r.attachmentRegistry.verificationRegistry).toEqual({});
    expect(r.attachmentRegistry.claimIds).toEqual([]);
    expect(r.attachmentRegistry.sourceIds).toEqual([]);
    expect(r.attachmentRegistry.disagreementIds).toEqual([]);
    expect(r.attachmentRegistry.verificationIds).toEqual([]);
    expect(r.crossLinkSummary.links).toEqual({});
    expect(r.crossLinkSummary.linkIds).toEqual([]);
    expect(r.verificationBundleSummary).toBeDefined();
    expect(r.verificationBundleSummary.bundles).toEqual({});
    expect(r.verificationBundleSummary.bundleIds).toEqual([]);
    expect(r.verificationBundleIndexSummary).toBeDefined();
    expect(r.verificationBundleIndexSummary.bySentenceId).toEqual({});
    expect(r.verificationBundleIndexSummary.byAnchorId).toEqual({});
    expect(r.verificationBundleIndexSummary.byClaimId).toEqual({});
    expect(r.verificationBundleIndexSummary.bySourceId).toEqual({});
    expect(r.verificationBundleIndexSummary.byVerificationId).toEqual({});
    expect(r.verificationBundleIndexSummary.byDisagreementId).toEqual({});
    expect(r.curiositySignalSummary).toBeDefined();
    expect(r.curiositySignalSummary.signals).toEqual({});
    expect(r.curiositySignalSummary.signalIds).toEqual([]);
    expect(r.promptToneSlotSummary).toBeDefined();
    expect(r.promptToneSlotSummary.slots).toEqual({});
    expect(r.promptToneSlotSummary.slotIds).toEqual([]);
    expect(r.promptCopySelectionSummary).toBeDefined();
    expect(r.promptCopySelectionSummary.selections).toEqual({});
    expect(r.promptCopySelectionSummary.selectionIds).toEqual([]);
    expect(r.promptCopyLibraryRecordSummary).toBeDefined();
    expect(r.promptCopyLibraryRecordSummary.records).toEqual({});
    expect(r.promptCopyLibraryRecordSummary.recordIds).toEqual([]);
    expect(r.promptCopyCatalogBindingSummary).toBeDefined();
    expect(r.promptCopyCatalogBindingSummary.bindings).toEqual({});
    expect(r.promptCopyCatalogBindingSummary.bindingIds).toEqual([]);
    expect(r.promptPresentationRecordSummary).toBeDefined();
    expect(r.promptPresentationRecordSummary.records).toEqual({});
    expect(r.promptPresentationRecordSummary.recordIds).toEqual([]);
    expect(r.promptSurfaceCandidateSummary).toBeDefined();
    expect(r.promptSurfaceCandidateSummary.candidates).toEqual({});
    expect(r.promptSurfaceCandidateSummary.candidateIds).toEqual([]);
    expect(r.promptMountPlanSummary).toBeDefined();
    expect(r.promptMountPlanSummary.plans).toEqual({});
    expect(r.promptMountPlanSummary.planIds).toEqual([]);
  });
});

describe("v12 disagreement-ready examination markers", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  it("default shape has empty markers and zero observedBacktrackCount", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.markers).toEqual([]);
    expect(r.markerIds).toEqual([]);
    expect(r.observedBacktrackCount).toBe(0);
  });

  it("block_focus_set adds block_examined marker", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.markers.length).toBe(1);
    expect(next.markers[0].kind).toBe("block_examined");
    expect(next.markers[0].blockId).toBe("b1");
    expect(next.markers[0].sentenceId).toBeNull();
    expect(next.markers[0].createdAt).toBe(100);
    expect(next.markerIds).toEqual([next.markers[0].id]);
  });

  it("sentence_focus_set adds sentence_examined marker", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.markers.some((m) => m.kind === "sentence_examined")).toBe(true);
    const examined = next.markers.find((m) => m.kind === "sentence_examined");
    expect(examined!.sentenceId).toBe("b1-s0");
    expect(examined!.blockId).toBe("b1");
    expect(examined!.createdAt).toBe(100);
  });

  it("repeated sentence_focus_set on same sentence adds sentence_revisited", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.markers.some((m) => m.kind === "sentence_examined")).toBe(true);
    expect(next.markers.some((m) => m.kind === "sentence_revisited")).toBe(true);
  });

  it("progression with new backtrack adds sentence_backtracked marker", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      lastExaminedSentenceId: "b1-s0",
      observedBacktrackCount: 0,
    };
    const event: ReadingAssistEvent = {
      type: "sentence_progress_previous",
      timestamp: 20,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, {}, 1);
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.markers.some((m) => m.kind === "sentence_backtracked")).toBe(true);
    const back = next.markers.find((m) => m.kind === "sentence_backtracked");
    expect(back!.sentenceId).toBe("b1-s0");
    expect(back!.blockId).toBe("b1");
    expect(next.observedBacktrackCount).toBe(1);
  });

  it("marker has id, kind, blockId, sentenceId, createdAt", () => {
    const id = createReadingAssistMarkerId("block_examined", "b1", null, 100);
    expect(typeof id).toBe("string");
    expect(id).toContain("block_examined");
    expect(id).toContain("b1");
    expect(id).toContain("100");
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const m = next.markers[0];
    expect(m.id).toBeDefined();
    expect(m.kind).toBe("block_examined");
    expect(m.blockId).toBe("b1");
    expect(m.sentenceId).toBeNull();
    expect(m.createdAt).toBe(100);
    expect(next.markerIds).toContain(m.id);
    expect(next.markers.map((x) => x.id)).toEqual(next.markerIds);
  });

  it("null blockId on block_focus_set does not crash and does not add block_examined", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: null,
      sentenceId: null,
    };
    const heuristic = DEFAULT_READING_ASSIST_HEURISTIC_STATE;
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.markers.filter((m) => m.kind === "block_examined")).toHaveLength(0);
  });

  it("no false backtrack marker when backtrack count did not increase", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      lastExaminedSentenceId: "b1-s0",
      observedBacktrackCount: 1,
    };
    const event: ReadingAssistEvent = {
      type: "sentence_progress_next",
      timestamp: 30,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s1",
    };
    const heuristic = heuristicStateWithDwell({}, {}, 1);
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.markers.some((m) => m.kind === "sentence_backtracked")).toBe(false);
    expect(next.observedBacktrackCount).toBe(1);
  });
});

describe("v13 claim-ready anchor slots", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  it("default anchor summary has empty slots and slot ids", () => {
    const a = DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY;
    expect(a.blockSlots).toEqual({});
    expect(a.sentenceSlots).toEqual({});
    expect(a.blockSlotIds).toEqual([]);
    expect(a.sentenceSlotIds).toEqual([]);
  });

  it("createReadingAssistBlockAnchorId and createReadingAssistSentenceAnchorId are deterministic", () => {
    expect(createReadingAssistBlockAnchorId("b1")).toBe("ra-anchor|block|b1");
    expect(createReadingAssistSentenceAnchorId("b1-s0")).toBe("ra-anchor|sentence|b1-s0");
  });

  it("block_focus_set ensures block slot exists", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const slotId = createReadingAssistBlockAnchorId("b1");
    expect(next.anchorSummary.blockSlotIds).toContain(slotId);
    const slot = next.anchorSummary.blockSlots[slotId];
    expect(slot).toBeDefined();
    expect(slot.anchorId).toBe(slotId);
    expect(slot.blockId).toBe("b1");
    expect(slot.sentenceId).toBeNull();
    expect(slot.slotType).toBe("block");
    expect(slot.createdAt).toBe(100);
    expect(slot.claimIds).toEqual([]);
    expect(slot.sourceIds).toEqual([]);
    expect(slot.disagreementIds).toEqual([]);
    expect(slot.markerIds).toHaveLength(1);
  });

  it("duplicate block focus does not duplicate slot id", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: {
        ...DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY,
        blockSlotIds: [createReadingAssistBlockAnchorId("b1")],
        blockSlots: {
          [createReadingAssistBlockAnchorId("b1")]: {
            anchorId: createReadingAssistBlockAnchorId("b1"),
            blockId: "b1",
            sentenceId: null,
            slotType: "block",
            createdAt: 50,
            markerIds: ["m1"],
            claimIds: [],
            sourceIds: [],
            disagreementIds: [],
            attachments: { ...DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE, markerIds: ["m1"] },
          },
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 200,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 100 }, {});
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.anchorSummary.blockSlotIds).toEqual([createReadingAssistBlockAnchorId("b1")]);
    expect(next.anchorSummary.blockSlots[createReadingAssistBlockAnchorId("b1")].createdAt).toBe(50);
    expect(next.anchorSummary.blockSlots[createReadingAssistBlockAnchorId("b1")].markerIds.length).toBe(2);
  });

  it("sentence_focus_set ensures sentence slot exists", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const slotId = createReadingAssistSentenceAnchorId("b1-s0");
    expect(next.anchorSummary.sentenceSlotIds).toContain(slotId);
    const slot = next.anchorSummary.sentenceSlots[slotId];
    expect(slot).toBeDefined();
    expect(slot.sentenceId).toBe("b1-s0");
    expect(slot.blockId).toBe("b1");
    expect(slot.slotType).toBe("sentence");
    expect(slot.createdAt).toBe(100);
    expect(slot.markerIds).toHaveLength(1);
  });

  it("duplicate sentence focus does not duplicate sentence slot id", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      anchorSummary: {
        ...DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY,
        sentenceSlotIds: [createReadingAssistSentenceAnchorId("b1-s0")],
        sentenceSlots: {
          [createReadingAssistSentenceAnchorId("b1-s0")]: {
            anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
            blockId: "b1",
            sentenceId: "b1-s0",
            slotType: "sentence",
            createdAt: 50,
            markerIds: ["m1"],
            claimIds: [],
            sourceIds: [],
            disagreementIds: [],
            attachments: { ...DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE, markerIds: ["m1"] },
          },
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.anchorSummary.sentenceSlotIds).toEqual([createReadingAssistSentenceAnchorId("b1-s0")]);
    expect(next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")].createdAt).toBe(50);
  });

  it("block_examined marker attaches to matching block slot", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const slot = next.anchorSummary.blockSlots[createReadingAssistBlockAnchorId("b1")];
    expect(slot.markerIds).toHaveLength(1);
    expect(next.markers[0].id).toBe(slot.markerIds[0]);
    expect(next.markers[0].kind).toBe("block_examined");
  });

  it("sentence_examined marker attaches to matching sentence slot", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const slot = next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")];
    expect(slot.markerIds).toHaveLength(1);
    expect(next.markers.some((m) => m.kind === "sentence_examined")).toBe(true);
    expect(slot.markerIds).toContain(next.markers.find((m) => m.kind === "sentence_examined")!.id);
  });

  it("revisit and backtrack markers attach to sentence slot when applicable", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      lastExaminedSentenceId: "b1-s0",
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
      anchorSummary: {
        ...DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY,
        sentenceSlotIds: [createReadingAssistSentenceAnchorId("b1-s0")],
        sentenceSlots: {
          [createReadingAssistSentenceAnchorId("b1-s0")]: {
            anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
            blockId: "b1",
            sentenceId: "b1-s0",
            slotType: "sentence",
            createdAt: 50,
            markerIds: [],
            claimIds: [],
            sourceIds: [],
            disagreementIds: [],
            attachments: { ...DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE },
          },
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const slot = next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")];
    expect(slot.markerIds.length).toBeGreaterThanOrEqual(2);
    expect(next.markers.some((m) => m.kind === "sentence_revisited")).toBe(true);
  });

  it("marker ids are not duplicated inside slot arrays", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: {
        ...DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY,
        blockSlotIds: [createReadingAssistBlockAnchorId("b1")],
        blockSlots: {
          [createReadingAssistBlockAnchorId("b1")]: {
            anchorId: createReadingAssistBlockAnchorId("b1"),
            blockId: "b1",
            sentenceId: null,
            slotType: "block",
            createdAt: 50,
            markerIds: ["existing-id"],
            claimIds: [],
            sourceIds: [],
            disagreementIds: [],
            attachments: { ...DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE, markerIds: ["existing-id"] },
          },
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const slot = next.anchorSummary.blockSlots[createReadingAssistBlockAnchorId("b1")];
    const uniqueIds = [...new Set(slot.markerIds)];
    expect(uniqueIds).toHaveLength(slot.markerIds.length);
  });

  it("null blockId on block_focus_set does not crash", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: null,
      sentenceId: null,
    };
    const heuristic = DEFAULT_READING_ASSIST_HEURISTIC_STATE;
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.anchorSummary.blockSlotIds).toEqual([]);
  });
});

describe("v14 source-ready attachment envelopes", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  it("new block slot includes attachments; non-marker envelope arrays start empty", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const slot = next.anchorSummary.blockSlots[createReadingAssistBlockAnchorId("b1")];
    expect(slot.attachments).toBeDefined();
    expect(slot.attachments.claimIds).toEqual([]);
    expect(slot.attachments.sourceIds).toEqual([]);
    expect(slot.attachments.disagreementIds).toEqual([]);
    expect(slot.attachments.verificationIds).toHaveLength(1);
    expect(slot.attachments.verificationIds[0]).toMatch(/^ra-verification-placeholder\|ra-marker\|block_examined\|/);
  });

  it("block_focus_set creates block slot with empty attachments", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const slot = next.anchorSummary.blockSlots[createReadingAssistBlockAnchorId("b1")];
    expect(slot.createdAt).toBe(100);
    expect(slot.attachments.markerIds).toHaveLength(1);
  });

  it("sentence_focus_set creates sentence slot with attachments, claim and source placeholders (v16/v17)", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const slot = next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")];
    expect(slot.attachments).toBeDefined();
    expect(slot.blockId).toBe("b1");
    expect(slot.sentenceId).toBe("b1-s0");
    expect(slot.attachments.claimIds).toHaveLength(1);
    expect(slot.attachments.claimIds[0]).toMatch(/^ra-claim-placeholder\|ra-marker\|sentence_examined\|/);
    expect(slot.attachments.sourceIds).toHaveLength(1);
    expect(slot.attachments.sourceIds[0]).toMatch(/^ra-source-placeholder\|ra-marker\|sentence_examined\|/);
    expect(slot.attachments.disagreementIds).toEqual([]);
    expect(slot.attachments.verificationIds).toHaveLength(1);
    expect(slot.attachments.verificationIds[0]).toMatch(/^ra-verification-placeholder\|ra-marker\|sentence_examined\|/);
  });

  it("when block marker attaches, slot markerIds and attachments.markerIds both contain it", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const slot = next.anchorSummary.blockSlots[createReadingAssistBlockAnchorId("b1")];
    expect(slot.markerIds).toHaveLength(1);
    expect(slot.attachments.markerIds).toHaveLength(1);
    expect(slot.markerIds[0]).toBe(slot.attachments.markerIds[0]);
    expect(slot.markerIds[0]).toBe(next.markers[0].id);
  });

  it("when sentence marker attaches, slot markerIds and attachments.markerIds both contain it", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const slot = next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")];
    expect(slot.markerIds).toHaveLength(1);
    expect(slot.attachments.markerIds).toHaveLength(1);
    expect(slot.markerIds[0]).toBe(slot.attachments.markerIds[0]);
  });

  it("repeated attachment does not duplicate ids in markerIds or attachments.markerIds", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: {
        ...DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY,
        blockSlotIds: [createReadingAssistBlockAnchorId("b1")],
        blockSlots: {
          [createReadingAssistBlockAnchorId("b1")]: {
            anchorId: createReadingAssistBlockAnchorId("b1"),
            blockId: "b1",
            sentenceId: null,
            slotType: "block",
            createdAt: 50,
            markerIds: ["existing-id"],
            claimIds: [],
            sourceIds: [],
            disagreementIds: [],
            attachments: { ...DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE, markerIds: ["existing-id"] },
          },
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const slot = next.anchorSummary.blockSlots[createReadingAssistBlockAnchorId("b1")];
    expect(slot.markerIds).toHaveLength(2);
    expect(slot.attachments.markerIds).toHaveLength(2);
    expect([...new Set(slot.markerIds)]).toHaveLength(2);
    expect([...new Set(slot.attachments.markerIds)]).toHaveLength(2);
  });

  it("top-level claimIds sourceIds disagreementIds still exist and remain empty", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const slot = next.anchorSummary.blockSlots[createReadingAssistBlockAnchorId("b1")];
    expect(slot.claimIds).toEqual([]);
    expect(slot.sourceIds).toEqual([]);
    expect(slot.disagreementIds).toEqual([]);
    expect(slot.attachments.claimIds).toEqual([]);
    expect(slot.attachments.sourceIds).toEqual([]);
    expect(slot.attachments.disagreementIds).toEqual([]);
    expect(slot.attachments.verificationIds).toHaveLength(1);
  });
});

describe("v15 verification-ready attachment registries", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  it("attachmentRegistry exists with all registries and id arrays empty by default", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.attachmentRegistry).toBeDefined();
    expect(r.attachmentRegistry.claimRegistry).toEqual({});
    expect(r.attachmentRegistry.sourceRegistry).toEqual({});
    expect(r.attachmentRegistry.disagreementRegistry).toEqual({});
    expect(r.attachmentRegistry.verificationRegistry).toEqual({});
    expect(r.attachmentRegistry.claimIds).toEqual([]);
    expect(r.attachmentRegistry.sourceIds).toEqual([]);
    expect(r.attachmentRegistry.disagreementIds).toEqual([]);
    expect(r.attachmentRegistry.verificationIds).toEqual([]);
  });

  it("ensureVerificationAttachmentRecord creates registry entry", () => {
    const reg = ensureVerificationAttachmentRecord(
      DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
      "v1",
      createReadingAssistBlockAnchorId("b1"),
      100
    );
    expect(reg.verificationRegistry["v1"]).toBeDefined();
    expect(reg.verificationRegistry["v1"].id).toBe("v1");
    expect(reg.verificationRegistry["v1"].anchorIds).toEqual([createReadingAssistBlockAnchorId("b1")]);
    expect(reg.verificationRegistry["v1"].createdAt).toBe(100);
    expect(reg.verificationIds).toEqual(["v1"]);
  });

  it("duplicate ensureVerificationAttachmentRecord does not duplicate anchorIds or verificationIds", () => {
    let reg = ensureVerificationAttachmentRecord(
      DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
      "v1",
      createReadingAssistBlockAnchorId("b1"),
      100
    );
    reg = ensureVerificationAttachmentRecord(reg, "v1", createReadingAssistBlockAnchorId("b1"), 200);
    expect(reg.verificationRegistry["v1"].anchorIds).toEqual([createReadingAssistBlockAnchorId("b1")]);
    expect(reg.verificationIds).toEqual(["v1"]);
  });

  it("ensureVerificationAttachmentRecord adds second anchorId to existing record", () => {
    let reg = ensureVerificationAttachmentRecord(
      DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
      "v1",
      createReadingAssistBlockAnchorId("b1"),
      100
    );
    reg = ensureVerificationAttachmentRecord(reg, "v1", createReadingAssistSentenceAnchorId("b1-s0"), 150);
    expect(reg.verificationRegistry["v1"].anchorIds).toHaveLength(2);
    expect(reg.verificationRegistry["v1"].anchorIds).toContain(createReadingAssistBlockAnchorId("b1"));
    expect(reg.verificationRegistry["v1"].anchorIds).toContain(createReadingAssistSentenceAnchorId("b1-s0"));
    expect(reg.verificationRegistry["v1"].createdAt).toBe(100);
  });

  it("marker attachment creates verification placeholder id in slot envelope", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const slot = next.anchorSummary.blockSlots[createReadingAssistBlockAnchorId("b1")];
    expect(slot.attachments.verificationIds).toHaveLength(1);
    expect(slot.attachments.verificationIds[0]).toMatch(/^ra-verification-placeholder\|ra-marker\|block_examined\|b1\|/);
  });

  it("verification placeholder record appears in attachmentRegistry.verificationRegistry", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const markerId = next.markers[0].id;
    const placeholderId = `ra-verification-placeholder|${markerId}`;
    expect(next.attachmentRegistry.verificationIds).toContain(placeholderId);
    expect(next.attachmentRegistry.verificationRegistry[placeholderId]).toBeDefined();
    expect(next.attachmentRegistry.verificationRegistry[placeholderId].anchorIds).toEqual([
      createReadingAssistBlockAnchorId("b1"),
    ]);
    expect(next.attachmentRegistry.verificationRegistry[placeholderId].createdAt).toBe(100);
  });

  it("when marker has both block and sentence anchors, placeholder record includes both anchor ids", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const markerId = next.markers.find((m) => m.kind === "sentence_examined")!.id;
    const placeholderId = `ra-verification-placeholder|${markerId}`;
    const rec = next.attachmentRegistry.verificationRegistry[placeholderId];
    expect(rec).toBeDefined();
    expect(rec.anchorIds).toContain(createReadingAssistSentenceAnchorId("b1-s0"));
    expect(next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")].attachments.verificationIds).toContain(
      placeholderId
    );
  });

  it("repeated reduction does not duplicate anchor ids or verification ids", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next1 = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const prev = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: next1.anchorSummary,
      attachmentRegistry: next1.attachmentRegistry,
    };
    const next2 = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next2.attachmentRegistry.verificationIds).toHaveLength(1);
    const placeholderId = next2.attachmentRegistry.verificationIds[0];
    expect(next2.attachmentRegistry.verificationRegistry[placeholderId].anchorIds).toHaveLength(1);
  });

  it("claim and source and disagreement registries remain empty after block_focus_set", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.attachmentRegistry.claimRegistry).toEqual({});
    expect(next.attachmentRegistry.sourceRegistry).toEqual({});
    expect(next.attachmentRegistry.disagreementRegistry).toEqual({});
    expect(next.attachmentRegistry.claimIds).toEqual([]);
    expect(next.attachmentRegistry.sourceIds).toEqual([]);
    expect(next.attachmentRegistry.disagreementIds).toEqual([]);
  });
});

describe("v16 claim placeholder records", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  it("ensureClaimAttachmentRecord creates record with placeholderKind and markerIds", () => {
    const reg = ensureClaimAttachmentRecord(
      DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
      "c1",
      createReadingAssistSentenceAnchorId("b1-s0"),
      100
    );
    expect(reg.claimRegistry["c1"]).toBeDefined();
    expect(reg.claimRegistry["c1"].id).toBe("c1");
    expect(reg.claimRegistry["c1"].anchorIds).toEqual([createReadingAssistSentenceAnchorId("b1-s0")]);
    expect(reg.claimRegistry["c1"].createdAt).toBe(100);
    expect(reg.claimRegistry["c1"].placeholderKind).toBe("marker-derived");
    expect(reg.claimRegistry["c1"].markerIds).toEqual([]);
    expect(reg.claimIds).toEqual(["c1"]);
  });

  it("duplicate ensureClaimAttachmentRecord does not duplicate anchor ids or claimIds", () => {
    let reg = ensureClaimAttachmentRecord(
      DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
      "c1",
      createReadingAssistSentenceAnchorId("b1-s0"),
      100
    );
    reg = ensureClaimAttachmentRecord(reg, "c1", createReadingAssistSentenceAnchorId("b1-s0"), 200);
    expect(reg.claimRegistry["c1"].anchorIds).toEqual([createReadingAssistSentenceAnchorId("b1-s0")]);
    expect(reg.claimIds).toEqual(["c1"]);
    expect(reg.claimRegistry["c1"].createdAt).toBe(100);
  });

  it("attachMarkerToClaimAttachmentRecord does not duplicate marker id", () => {
    let reg = ensureClaimAttachmentRecord(
      DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
      "c1",
      createReadingAssistSentenceAnchorId("b1-s0"),
      100
    );
    reg = attachMarkerToClaimAttachmentRecord(reg, "c1", "m1");
    expect(reg.claimRegistry["c1"].markerIds).toEqual(["m1"]);
    reg = attachMarkerToClaimAttachmentRecord(reg, "c1", "m1");
    expect(reg.claimRegistry["c1"].markerIds).toEqual(["m1"]);
  });

  it("attachMarkerToClaimAttachmentRecord adds second marker id", () => {
    let reg = ensureClaimAttachmentRecord(
      DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
      "c1",
      createReadingAssistSentenceAnchorId("b1-s0"),
      100
    );
    reg = attachMarkerToClaimAttachmentRecord(reg, "c1", "m1");
    reg = attachMarkerToClaimAttachmentRecord(reg, "c1", "m2");
    expect(reg.claimRegistry["c1"].markerIds).toEqual(["m1", "m2"]);
  });

  it("sentence_examined marker creates claim placeholder id in sentence slot", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const slot = next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")];
    const markerId = next.markers.find((m) => m.kind === "sentence_examined")!.id;
    const claimId = `ra-claim-placeholder|${markerId}`;
    expect(slot.claimIds).toContain(claimId);
    expect(slot.attachments.claimIds).toContain(claimId);
  });

  it("sentence_revisited marker creates/attaches claim placeholder", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const slot = next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")];
    const revisitedMarker = next.markers.find((m) => m.kind === "sentence_revisited");
    expect(revisitedMarker).toBeDefined();
    const claimId = `ra-claim-placeholder|${revisitedMarker!.id}`;
    expect(slot.claimIds).toContain(claimId);
    expect(slot.attachments.claimIds).toContain(claimId);
  });

  it("sentence_backtracked marker creates/attaches claim placeholder", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      lastExaminedSentenceId: "b1-s0",
      observedBacktrackCount: 0,
      anchorSummary: {
        ...DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY,
        sentenceSlotIds: [createReadingAssistSentenceAnchorId("b1-s0")],
        sentenceSlots: {
          [createReadingAssistSentenceAnchorId("b1-s0")]: {
            anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
            blockId: "b1",
            sentenceId: "b1-s0",
            slotType: "sentence",
            createdAt: 50,
            markerIds: ["existing-marker"],
            claimIds: [],
            sourceIds: [],
            disagreementIds: [],
            attachments: { ...DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE, markerIds: ["existing-marker"] },
          },
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_progress_previous",
      timestamp: 20,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, {}, 1);
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const backMarker = next.markers.find((m) => m.kind === "sentence_backtracked");
    expect(backMarker).toBeDefined();
    const claimId = `ra-claim-placeholder|${backMarker!.id}`;
    const slot = next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")];
    expect(slot.claimIds).toContain(claimId);
    expect(slot.attachments.claimIds).toContain(claimId);
  });

  it("claim placeholder record appears in attachmentRegistry.claimRegistry", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const markerId = next.markers.find((m) => m.kind === "sentence_examined")!.id;
    const claimId = `ra-claim-placeholder|${markerId}`;
    expect(next.attachmentRegistry.claimIds).toContain(claimId);
    const rec = next.attachmentRegistry.claimRegistry[claimId];
    expect(rec).toBeDefined();
    expect(rec.id).toBe(claimId);
    expect(rec.anchorIds).toContain(createReadingAssistSentenceAnchorId("b1-s0"));
    expect(rec.placeholderKind).toBe("marker-derived");
    expect(rec.markerIds).toContain(markerId);
  });

  it("repeated reduction does not duplicate slot claim ids or record marker ids", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next1 = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const prev = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: next1.anchorSummary,
      attachmentRegistry: next1.attachmentRegistry,
      markers: next1.markers,
      markerIds: next1.markerIds,
      examinedSentenceIds: next1.examinedSentenceIds,
      sentences: next1.sentences,
    };
    const next2 = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const slot = next2.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")];
    const claimIdsInSlot = slot.claimIds.filter((id) => id.startsWith("ra-claim-placeholder|"));
    expect([...new Set(claimIdsInSlot)]).toHaveLength(claimIdsInSlot.length);
    const claimId = slot.claimIds[0];
    const rec = next2.attachmentRegistry.claimRegistry[claimId];
    expect(rec).toBeDefined();
    expect([...new Set(rec.markerIds)]).toHaveLength(rec.markerIds.length);
  });

  it("block_examined markers do not create claim placeholders", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.attachmentRegistry.claimIds).toEqual([]);
    expect(Object.keys(next.attachmentRegistry.claimRegistry)).toHaveLength(0);
    const slot = next.anchorSummary.blockSlots[createReadingAssistBlockAnchorId("b1")];
    expect(slot.claimIds).toEqual([]);
    expect(slot.attachments.claimIds).toEqual([]);
  });

  it("disagreement registry remains empty (v17 populates source for sentence markers)", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.attachmentRegistry.disagreementRegistry).toEqual({});
    expect(next.attachmentRegistry.disagreementIds).toEqual([]);
  });

  it("verification placeholder behavior still works unchanged", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const markerId = next.markers.find((m) => m.kind === "sentence_examined")!.id;
    const verificationId = `ra-verification-placeholder|${markerId}`;
    expect(next.attachmentRegistry.verificationIds).toContain(verificationId);
    expect(next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")].attachments.verificationIds).toContain(
      verificationId
    );
  });
});

describe("v17 source placeholder records", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  it("ensureSourceAttachmentRecord creates record with placeholderKind and markerIds", () => {
    const reg = ensureSourceAttachmentRecord(
      DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
      "src1",
      createReadingAssistSentenceAnchorId("b1-s0"),
      100
    );
    expect(reg.sourceRegistry["src1"]).toBeDefined();
    expect(reg.sourceRegistry["src1"].id).toBe("src1");
    expect(reg.sourceRegistry["src1"].anchorIds).toEqual([createReadingAssistSentenceAnchorId("b1-s0")]);
    expect(reg.sourceRegistry["src1"].createdAt).toBe(100);
    expect(reg.sourceRegistry["src1"].placeholderKind).toBe("marker-derived");
    expect(reg.sourceRegistry["src1"].markerIds).toEqual([]);
    expect(reg.sourceIds).toEqual(["src1"]);
  });

  it("duplicate ensureSourceAttachmentRecord does not duplicate anchor ids or sourceIds", () => {
    let reg = ensureSourceAttachmentRecord(
      DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
      "src1",
      createReadingAssistSentenceAnchorId("b1-s0"),
      100
    );
    reg = ensureSourceAttachmentRecord(reg, "src1", createReadingAssistSentenceAnchorId("b1-s0"), 200);
    expect(reg.sourceRegistry["src1"].anchorIds).toEqual([createReadingAssistSentenceAnchorId("b1-s0")]);
    expect(reg.sourceIds).toEqual(["src1"]);
    expect(reg.sourceRegistry["src1"].createdAt).toBe(100);
  });

  it("attachMarkerToSourceAttachmentRecord does not duplicate marker id", () => {
    let reg = ensureSourceAttachmentRecord(
      DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
      "src1",
      createReadingAssistSentenceAnchorId("b1-s0"),
      100
    );
    reg = attachMarkerToSourceAttachmentRecord(reg, "src1", "m1");
    expect(reg.sourceRegistry["src1"].markerIds).toEqual(["m1"]);
    reg = attachMarkerToSourceAttachmentRecord(reg, "src1", "m1");
    expect(reg.sourceRegistry["src1"].markerIds).toEqual(["m1"]);
  });

  it("attachMarkerToSourceAttachmentRecord adds second marker id", () => {
    let reg = ensureSourceAttachmentRecord(
      DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
      "src1",
      createReadingAssistSentenceAnchorId("b1-s0"),
      100
    );
    reg = attachMarkerToSourceAttachmentRecord(reg, "src1", "m1");
    reg = attachMarkerToSourceAttachmentRecord(reg, "src1", "m2");
    expect(reg.sourceRegistry["src1"].markerIds).toEqual(["m1", "m2"]);
  });

  it("sentence_examined marker creates source placeholder id in sentence slot", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const slot = next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")];
    const markerId = next.markers.find((m) => m.kind === "sentence_examined")!.id;
    const sourceId = `ra-source-placeholder|${markerId}`;
    expect(slot.sourceIds).toContain(sourceId);
    expect(slot.attachments.sourceIds).toContain(sourceId);
  });

  it("sentence_revisited marker creates/attaches source placeholder", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const slot = next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")];
    const revisitedMarker = next.markers.find((m) => m.kind === "sentence_revisited");
    expect(revisitedMarker).toBeDefined();
    const sourceId = `ra-source-placeholder|${revisitedMarker!.id}`;
    expect(slot.sourceIds).toContain(sourceId);
    expect(slot.attachments.sourceIds).toContain(sourceId);
  });

  it("sentence_backtracked marker creates/attaches source placeholder", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      lastExaminedSentenceId: "b1-s0",
      observedBacktrackCount: 0,
      anchorSummary: {
        ...DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY,
        sentenceSlotIds: [createReadingAssistSentenceAnchorId("b1-s0")],
        sentenceSlots: {
          [createReadingAssistSentenceAnchorId("b1-s0")]: {
            anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
            blockId: "b1",
            sentenceId: "b1-s0",
            slotType: "sentence",
            createdAt: 50,
            markerIds: ["existing-marker"],
            claimIds: [],
            sourceIds: [],
            disagreementIds: [],
            attachments: { ...DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE, markerIds: ["existing-marker"] },
          },
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_progress_previous",
      timestamp: 20,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, {}, 1);
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const backMarker = next.markers.find((m) => m.kind === "sentence_backtracked");
    expect(backMarker).toBeDefined();
    const sourceId = `ra-source-placeholder|${backMarker!.id}`;
    const slot = next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")];
    expect(slot.sourceIds).toContain(sourceId);
    expect(slot.attachments.sourceIds).toContain(sourceId);
  });

  it("source placeholder record appears in attachmentRegistry.sourceRegistry", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const markerId = next.markers.find((m) => m.kind === "sentence_examined")!.id;
    const sourceId = `ra-source-placeholder|${markerId}`;
    expect(next.attachmentRegistry.sourceIds).toContain(sourceId);
    const rec = next.attachmentRegistry.sourceRegistry[sourceId];
    expect(rec).toBeDefined();
    expect(rec.id).toBe(sourceId);
    expect(rec.anchorIds).toContain(createReadingAssistSentenceAnchorId("b1-s0"));
    expect(rec.placeholderKind).toBe("marker-derived");
    expect(rec.markerIds).toContain(markerId);
  });

  it("repeated reduction does not duplicate slot source ids or record marker ids", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next1 = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const prev = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: next1.anchorSummary,
      attachmentRegistry: next1.attachmentRegistry,
      markers: next1.markers,
      markerIds: next1.markerIds,
      examinedSentenceIds: next1.examinedSentenceIds,
      sentences: next1.sentences,
    };
    const next2 = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const slot = next2.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")];
    const sourceIdsInSlot = slot.sourceIds.filter((id) => id.startsWith("ra-source-placeholder|"));
    expect([...new Set(sourceIdsInSlot)]).toHaveLength(sourceIdsInSlot.length);
    const sourceId = slot.sourceIds.find((id) => id.startsWith("ra-source-placeholder|"))!;
    const rec = next2.attachmentRegistry.sourceRegistry[sourceId];
    expect(rec).toBeDefined();
    expect([...new Set(rec.markerIds)]).toHaveLength(rec.markerIds.length);
  });

  it("block_examined markers do not create source placeholders", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.attachmentRegistry.sourceIds).toEqual([]);
    expect(Object.keys(next.attachmentRegistry.sourceRegistry)).toHaveLength(0);
    const slot = next.anchorSummary.blockSlots[createReadingAssistBlockAnchorId("b1")];
    expect(slot.sourceIds).toEqual([]);
    expect(slot.attachments.sourceIds).toEqual([]);
  });

  it("disagreement registry remains empty", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.attachmentRegistry.disagreementRegistry).toEqual({});
    expect(next.attachmentRegistry.disagreementIds).toEqual([]);
  });

  it("claim placeholder behavior still works unchanged", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const markerId = next.markers.find((m) => m.kind === "sentence_examined")!.id;
    const claimId = `ra-claim-placeholder|${markerId}`;
    expect(next.attachmentRegistry.claimIds).toContain(claimId);
    expect(next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")].claimIds).toContain(claimId);
  });

  it("verification placeholder behavior still works unchanged", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const markerId = next.markers.find((m) => m.kind === "sentence_examined")!.id;
    const verificationId = `ra-verification-placeholder|${markerId}`;
    expect(next.attachmentRegistry.verificationIds).toContain(verificationId);
    expect(next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")].attachments.verificationIds).toContain(
      verificationId
    );
  });
});

describe("v18 disagreement placeholder records", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  it("ensureDisagreementAttachmentRecord creates record with placeholderKind and markerIds", () => {
    const reg = ensureDisagreementAttachmentRecord(
      DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
      "d1",
      createReadingAssistSentenceAnchorId("b1-s0"),
      100
    );
    expect(reg.disagreementRegistry["d1"]).toBeDefined();
    expect(reg.disagreementRegistry["d1"].id).toBe("d1");
    expect(reg.disagreementRegistry["d1"].anchorIds).toEqual([createReadingAssistSentenceAnchorId("b1-s0")]);
    expect(reg.disagreementRegistry["d1"].createdAt).toBe(100);
    expect(reg.disagreementRegistry["d1"].placeholderKind).toBe("marker-derived");
    expect(reg.disagreementRegistry["d1"].markerIds).toEqual([]);
    expect(reg.disagreementIds).toEqual(["d1"]);
  });

  it("duplicate ensureDisagreementAttachmentRecord does not duplicate anchor ids or disagreementIds", () => {
    let reg = ensureDisagreementAttachmentRecord(
      DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
      "d1",
      createReadingAssistSentenceAnchorId("b1-s0"),
      100
    );
    reg = ensureDisagreementAttachmentRecord(reg, "d1", createReadingAssistSentenceAnchorId("b1-s0"), 200);
    expect(reg.disagreementRegistry["d1"].anchorIds).toEqual([createReadingAssistSentenceAnchorId("b1-s0")]);
    expect(reg.disagreementIds).toEqual(["d1"]);
    expect(reg.disagreementRegistry["d1"].createdAt).toBe(100);
  });

  it("attachMarkerToDisagreementAttachmentRecord does not duplicate marker id", () => {
    let reg = ensureDisagreementAttachmentRecord(
      DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
      "d1",
      createReadingAssistSentenceAnchorId("b1-s0"),
      100
    );
    reg = attachMarkerToDisagreementAttachmentRecord(reg, "d1", "m1");
    expect(reg.disagreementRegistry["d1"].markerIds).toEqual(["m1"]);
    reg = attachMarkerToDisagreementAttachmentRecord(reg, "d1", "m1");
    expect(reg.disagreementRegistry["d1"].markerIds).toEqual(["m1"]);
  });

  it("attachMarkerToDisagreementAttachmentRecord adds second marker id", () => {
    let reg = ensureDisagreementAttachmentRecord(
      DEFAULT_READING_ASSIST_ATTACHMENT_REGISTRY_SUMMARY,
      "d1",
      createReadingAssistSentenceAnchorId("b1-s0"),
      100
    );
    reg = attachMarkerToDisagreementAttachmentRecord(reg, "d1", "m1");
    reg = attachMarkerToDisagreementAttachmentRecord(reg, "d1", "m2");
    expect(reg.disagreementRegistry["d1"].markerIds).toEqual(["m1", "m2"]);
  });

  it("sentence_revisited marker creates disagreement placeholder id in sentence slot", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const slot = next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")];
    const revisitedMarker = next.markers.find((m) => m.kind === "sentence_revisited");
    expect(revisitedMarker).toBeDefined();
    const disagreementId = `ra-disagreement-placeholder|${revisitedMarker!.id}`;
    expect(slot.disagreementIds).toContain(disagreementId);
    expect(slot.attachments.disagreementIds).toContain(disagreementId);
  });

  it("sentence_backtracked marker creates disagreement placeholder id in sentence slot", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      lastExaminedSentenceId: "b1-s0",
      observedBacktrackCount: 0,
      anchorSummary: {
        ...DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY,
        sentenceSlotIds: [createReadingAssistSentenceAnchorId("b1-s0")],
        sentenceSlots: {
          [createReadingAssistSentenceAnchorId("b1-s0")]: {
            anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
            blockId: "b1",
            sentenceId: "b1-s0",
            slotType: "sentence",
            createdAt: 50,
            markerIds: ["existing-marker"],
            claimIds: [],
            sourceIds: [],
            disagreementIds: [],
            attachments: { ...DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE, markerIds: ["existing-marker"] },
          },
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_progress_previous",
      timestamp: 20,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, {}, 1);
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const backMarker = next.markers.find((m) => m.kind === "sentence_backtracked");
    expect(backMarker).toBeDefined();
    const disagreementId = `ra-disagreement-placeholder|${backMarker!.id}`;
    const slot = next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")];
    expect(slot.disagreementIds).toContain(disagreementId);
    expect(slot.attachments.disagreementIds).toContain(disagreementId);
  });

  it("disagreement placeholder record appears in attachmentRegistry.disagreementRegistry", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const revisitedMarker = next.markers.find((m) => m.kind === "sentence_revisited");
    expect(revisitedMarker).toBeDefined();
    const disagreementId = `ra-disagreement-placeholder|${revisitedMarker!.id}`;
    expect(next.attachmentRegistry.disagreementIds).toContain(disagreementId);
    const rec = next.attachmentRegistry.disagreementRegistry[disagreementId];
    expect(rec).toBeDefined();
    expect(rec.id).toBe(disagreementId);
    expect(rec.anchorIds).toContain(createReadingAssistSentenceAnchorId("b1-s0"));
    expect(rec.placeholderKind).toBe("marker-derived");
    expect(rec.markerIds).toContain(revisitedMarker!.id);
  });

  it("repeated reduction does not duplicate slot disagreement ids or record marker ids", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next1 = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const prev2 = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: next1.anchorSummary,
      attachmentRegistry: next1.attachmentRegistry,
      markers: next1.markers,
      markerIds: next1.markerIds,
      examinedSentenceIds: next1.examinedSentenceIds,
      sentences: next1.sentences,
    };
    const next2 = reduceReadingAssistReadingPathSummary(prev2, event, heuristic);
    const slot = next2.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")];
    const disagreementIdsInSlot = slot.disagreementIds.filter((id) => id.startsWith("ra-disagreement-placeholder|"));
    expect([...new Set(disagreementIdsInSlot)]).toHaveLength(disagreementIdsInSlot.length);
    const disagreementId = slot.disagreementIds.find((id) => id.startsWith("ra-disagreement-placeholder|"))!;
    const rec = next2.attachmentRegistry.disagreementRegistry[disagreementId];
    expect(rec).toBeDefined();
    expect([...new Set(rec.markerIds)]).toHaveLength(rec.markerIds.length);
  });

  it("sentence_examined does not create disagreement placeholders", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.attachmentRegistry.disagreementIds).toEqual([]);
    expect(Object.keys(next.attachmentRegistry.disagreementRegistry)).toHaveLength(0);
    const slot = next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")];
    expect(slot.disagreementIds).toEqual([]);
    expect(slot.attachments.disagreementIds).toEqual([]);
  });

  it("block_examined does not create disagreement placeholders", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.attachmentRegistry.disagreementIds).toEqual([]);
    expect(Object.keys(next.attachmentRegistry.disagreementRegistry)).toHaveLength(0);
  });

  it("claim placeholder behavior still works unchanged", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const revisitedMarker = next.markers.find((m) => m.kind === "sentence_revisited");
    expect(revisitedMarker).toBeDefined();
    const claimId = `ra-claim-placeholder|${revisitedMarker!.id}`;
    expect(next.attachmentRegistry.claimIds).toContain(claimId);
    expect(next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")].claimIds).toContain(claimId);
  });

  it("source placeholder behavior still works unchanged", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const revisitedMarker = next.markers.find((m) => m.kind === "sentence_revisited");
    expect(revisitedMarker).toBeDefined();
    const sourceId = `ra-source-placeholder|${revisitedMarker!.id}`;
    expect(next.attachmentRegistry.sourceIds).toContain(sourceId);
    expect(next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")].sourceIds).toContain(sourceId);
  });

  it("verification placeholder behavior still works unchanged", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const revisitedMarker = next.markers.find((m) => m.kind === "sentence_revisited");
    expect(revisitedMarker).toBeDefined();
    const verificationId = `ra-verification-placeholder|${revisitedMarker!.id}`;
    expect(next.attachmentRegistry.verificationIds).toContain(verificationId);
    expect(next.anchorSummary.sentenceSlots[createReadingAssistSentenceAnchorId("b1-s0")].attachments.verificationIds).toContain(
      verificationId
    );
  });
});

describe("v19 placeholder cross-link slots", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  it("default crossLinkSummary has empty links and linkIds", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.crossLinkSummary.links).toEqual({});
    expect(r.crossLinkSummary.linkIds).toEqual([]);
  });

  it("ensureReadingAssistPlaceholderCrossLink adds link once", () => {
    const link: ReadingAssistPlaceholderCrossLink = {
      id: createReadingAssistPlaceholderCrossLinkId("b1-s0", "c1", "src1", null, "v1"),
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      claimId: "c1",
      sourceId: "src1",
      disagreementId: null,
      verificationId: "v1",
      createdAt: 100,
    };
    const summary = ensureReadingAssistPlaceholderCrossLink(
      DEFAULT_READING_ASSIST_PLACEHOLDER_CROSS_LINK_SUMMARY,
      link
    );
    expect(summary.linkIds).toHaveLength(1);
    expect(summary.linkIds[0]).toBe(link.id);
    expect(summary.links[link.id]).toEqual(link);
  });

  it("duplicate ensureReadingAssistPlaceholderCrossLink does not duplicate linkIds", () => {
    const link: ReadingAssistPlaceholderCrossLink = {
      id: createReadingAssistPlaceholderCrossLinkId("b1-s0", "c1", "src1", null, "v1"),
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      claimId: "c1",
      sourceId: "src1",
      disagreementId: null,
      verificationId: "v1",
      createdAt: 100,
    };
    let summary = ensureReadingAssistPlaceholderCrossLink(
      DEFAULT_READING_ASSIST_PLACEHOLDER_CROSS_LINK_SUMMARY,
      link
    );
    summary = ensureReadingAssistPlaceholderCrossLink(summary, link);
    expect(summary.linkIds).toHaveLength(1);
    expect(summary.links[link.id].createdAt).toBe(100);
  });

  it("sentence slot with claim + source + verification creates one cross-link", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.crossLinkSummary.linkIds).toHaveLength(1);
    const linkId = next.crossLinkSummary.linkIds[0];
    const link = next.crossLinkSummary.links[linkId];
    expect(link).toBeDefined();
    expect(link.sentenceId).toBe("b1-s0");
    expect(link.anchorId).toBe(createReadingAssistSentenceAnchorId("b1-s0"));
    expect(link.claimId).not.toBeNull();
    expect(link.sourceId).not.toBeNull();
    expect(link.verificationId).not.toBeNull();
    expect(link.createdAt).toBe(100);
  });

  it("disagreement id null when slot has no disagreement placeholder", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const linkId = next.crossLinkSummary.linkIds[0];
    const link = next.crossLinkSummary.links[linkId];
    expect(link.disagreementId).toBeNull();
  });

  it("disagreement id included when slot has disagreement placeholder", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.crossLinkSummary.linkIds.length).toBeGreaterThanOrEqual(1);
    const linkId = next.crossLinkSummary.linkIds[next.crossLinkSummary.linkIds.length - 1];
    const link = next.crossLinkSummary.links[linkId];
    expect(link.disagreementId).not.toBeNull();
  });

  it("repeated reduction does not duplicate cross-link", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next1 = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const prev2 = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: next1.anchorSummary,
      attachmentRegistry: next1.attachmentRegistry,
      crossLinkSummary: next1.crossLinkSummary,
      markers: next1.markers,
      markerIds: next1.markerIds,
      examinedSentenceIds: next1.examinedSentenceIds,
      sentences: next1.sentences,
    };
    const next2 = reduceReadingAssistReadingPathSummary(prev2, event, heuristic);
    expect(next2.crossLinkSummary.linkIds).toHaveLength(next1.crossLinkSummary.linkIds.length);
  });

  it("no cross-link if claim missing", () => {
    const anchorSummary: ReadingAssistClaimReadyAnchorSummary = {
      ...DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY,
      sentenceSlotIds: [createReadingAssistSentenceAnchorId("b1-s0")],
      sentenceSlots: {
        [createReadingAssistSentenceAnchorId("b1-s0")]: {
          anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
          blockId: "b1",
          sentenceId: "b1-s0",
          slotType: "sentence",
          createdAt: 100,
          markerIds: ["m1"],
          claimIds: [],
          sourceIds: ["ra-source-placeholder|m1"],
          disagreementIds: [],
          attachments: {
            ...DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE,
            markerIds: ["m1"],
            claimIds: [],
            sourceIds: ["ra-source-placeholder|m1"],
            disagreementIds: [],
            verificationIds: ["ra-verification-placeholder|m1"],
          },
        },
      },
    };
    const out = ensureCrossLinkForSentenceSlot(
      DEFAULT_READING_ASSIST_PLACEHOLDER_CROSS_LINK_SUMMARY,
      anchorSummary,
      "b1-s0",
      100
    );
    expect(out.linkIds).toHaveLength(0);
    expect(Object.keys(out.links)).toHaveLength(0);
  });

  it("no cross-link if source missing", () => {
    const anchorSummary: ReadingAssistClaimReadyAnchorSummary = {
      ...DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY,
      sentenceSlotIds: [createReadingAssistSentenceAnchorId("b1-s0")],
      sentenceSlots: {
        [createReadingAssistSentenceAnchorId("b1-s0")]: {
          anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
          blockId: "b1",
          sentenceId: "b1-s0",
          slotType: "sentence",
          createdAt: 100,
          markerIds: ["m1"],
          claimIds: ["ra-claim-placeholder|m1"],
          sourceIds: [],
          disagreementIds: [],
          attachments: {
            ...DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE,
            markerIds: ["m1"],
            claimIds: ["ra-claim-placeholder|m1"],
            sourceIds: [],
            disagreementIds: [],
            verificationIds: ["ra-verification-placeholder|m1"],
          },
        },
      },
    };
    const out = ensureCrossLinkForSentenceSlot(
      DEFAULT_READING_ASSIST_PLACEHOLDER_CROSS_LINK_SUMMARY,
      anchorSummary,
      "b1-s0",
      100
    );
    expect(out.linkIds).toHaveLength(0);
    expect(Object.keys(out.links)).toHaveLength(0);
  });

  it("no cross-link if verification missing", () => {
    const anchorSummary: ReadingAssistClaimReadyAnchorSummary = {
      ...DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY,
      sentenceSlotIds: [createReadingAssistSentenceAnchorId("b1-s0")],
      sentenceSlots: {
        [createReadingAssistSentenceAnchorId("b1-s0")]: {
          anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
          blockId: "b1",
          sentenceId: "b1-s0",
          slotType: "sentence",
          createdAt: 100,
          markerIds: ["m1"],
          claimIds: ["ra-claim-placeholder|m1"],
          sourceIds: ["ra-source-placeholder|m1"],
          disagreementIds: [],
          attachments: {
            ...DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE,
            markerIds: ["m1"],
            claimIds: ["ra-claim-placeholder|m1"],
            sourceIds: ["ra-source-placeholder|m1"],
            disagreementIds: [],
            verificationIds: [],
          },
        },
      },
    };
    const out = ensureCrossLinkForSentenceSlot(
      DEFAULT_READING_ASSIST_PLACEHOLDER_CROSS_LINK_SUMMARY,
      anchorSummary,
      "b1-s0",
      100
    );
    expect(out.linkIds).toHaveLength(0);
    expect(Object.keys(out.links)).toHaveLength(0);
  });

  it("block slot alone never creates a cross-link", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.crossLinkSummary.linkIds).toHaveLength(0);
    expect(next.crossLinkSummary.links).toEqual({});
  });
});

describe("v20 verification bundle skeleton", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  it("default reading path summary includes verificationBundleSummary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.verificationBundleSummary).toBeDefined();
    expect(r.verificationBundleSummary.bundles).toEqual({});
    expect(r.verificationBundleSummary.bundleIds).toEqual([]);
  });

  it("reset yields empty verification bundle summary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.verificationBundleSummary.bundles).toEqual({});
    expect(r.verificationBundleSummary.bundleIds).toEqual([]);
  });

  it("createReadingAssistVerificationBundleId returns deterministic id", () => {
    const crossLinkId = "ra-placeholder-cross-link|b1-s0|c1|src1||v1";
    expect(createReadingAssistVerificationBundleId(crossLinkId)).toBe(
      "ra-verification-bundle|ra-placeholder-cross-link|b1-s0|c1|src1||v1"
    );
    expect(createReadingAssistVerificationBundleId(crossLinkId)).toBe(
      createReadingAssistVerificationBundleId(crossLinkId)
    );
  });

  it("ensureReadingAssistVerificationBundle adds once", () => {
    const bundle: ReadingAssistVerificationBundle = {
      id: "ra-verification-bundle|link1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      crossLinkId: "link1",
      claimId: "c1",
      sourceId: "src1",
      verificationId: "v1",
      disagreementId: null,
      createdAt: "100",
    };
    const summary = ensureReadingAssistVerificationBundle(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY,
      bundle
    );
    expect(summary.bundleIds).toHaveLength(1);
    expect(summary.bundleIds[0]).toBe(bundle.id);
    expect(summary.bundles[bundle.id]).toEqual(bundle);
  });

  it("repeated ensureReadingAssistVerificationBundle does not duplicate bundleIds", () => {
    const bundle: ReadingAssistVerificationBundle = {
      id: "ra-verification-bundle|link1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      crossLinkId: "link1",
      claimId: "c1",
      sourceId: "src1",
      verificationId: "v1",
      disagreementId: null,
      createdAt: "100",
    };
    let summary = ensureReadingAssistVerificationBundle(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY,
      bundle
    );
    summary = ensureReadingAssistVerificationBundle(summary, bundle);
    expect(summary.bundleIds).toHaveLength(1);
  });

  it("ensureReadingAssistVerificationBundle preserves existing createdAt on re-ensure", () => {
    const bundle: ReadingAssistVerificationBundle = {
      id: "ra-verification-bundle|link1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      crossLinkId: "link1",
      claimId: "c1",
      sourceId: "src1",
      verificationId: "v1",
      disagreementId: null,
      createdAt: "100",
    };
    let summary = ensureReadingAssistVerificationBundle(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY,
      bundle
    );
    const bundleLater = { ...bundle, createdAt: "200" };
    summary = ensureReadingAssistVerificationBundle(summary, bundleLater);
    expect(summary.bundles[bundle.id].createdAt).toBe("100");
  });

  it("ensureReadingAssistVerificationBundle updates disagreementId when existing is null and incoming is non-null", () => {
    const bundle: ReadingAssistVerificationBundle = {
      id: "ra-verification-bundle|link1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      crossLinkId: "link1",
      claimId: "c1",
      sourceId: "src1",
      verificationId: "v1",
      disagreementId: null,
      createdAt: "100",
    };
    let summary = ensureReadingAssistVerificationBundle(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY,
      bundle
    );
    const bundleWithDisagreement = { ...bundle, disagreementId: "d1" };
    summary = ensureReadingAssistVerificationBundle(summary, bundleWithDisagreement);
    expect(summary.bundles[bundle.id].disagreementId).toBe("d1");
  });

  it("ensureReadingAssistVerificationBundle does not clear existing non-null disagreementId", () => {
    const bundleWithD: ReadingAssistVerificationBundle = {
      id: "ra-verification-bundle|link1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      crossLinkId: "link1",
      claimId: "c1",
      sourceId: "src1",
      verificationId: "v1",
      disagreementId: "d1",
      createdAt: "100",
    };
    let summary = ensureReadingAssistVerificationBundle(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY,
      bundleWithD
    );
    const bundleNullD = { ...bundleWithD, disagreementId: null };
    summary = ensureReadingAssistVerificationBundle(summary, bundleNullD);
    expect(summary.bundles[bundleWithD.id].disagreementId).toBe("d1");
  });

  it("ensureVerificationBundleForCrossLink creates bundle when cross-link exists", () => {
    const crossLinkId = createReadingAssistPlaceholderCrossLinkId("b1-s0", "c1", "src1", null, "v1");
    const crossLinkSummary: ReadingAssistPlaceholderCrossLinkSummary = {
      links: {
        [crossLinkId]: {
          id: crossLinkId,
          sentenceId: "b1-s0",
          anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
          claimId: "c1",
          sourceId: "src1",
          disagreementId: null,
          verificationId: "v1",
          createdAt: 100,
        },
      },
      linkIds: [crossLinkId],
    };
    const out = ensureVerificationBundleForCrossLink(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY,
      crossLinkSummary,
      crossLinkId
    );
    expect(out.bundleIds).toHaveLength(1);
    const bundleId = createReadingAssistVerificationBundleId(crossLinkId);
    expect(out.bundles[bundleId]).toBeDefined();
    expect(out.bundles[bundleId].sentenceId).toBe("b1-s0");
    expect(out.bundles[bundleId].claimId).toBe("c1");
    expect(out.bundles[bundleId].sourceId).toBe("src1");
    expect(out.bundles[bundleId].verificationId).toBe("v1");
    expect(out.bundles[bundleId].crossLinkId).toBe(crossLinkId);
    expect(out.bundles[bundleId].disagreementId).toBeNull();
    expect(out.bundles[bundleId].createdAt).toBe("100");
  });

  it("ensureVerificationBundleForCrossLink does not create bundle when cross-link id is missing", () => {
    const crossLinkSummary = DEFAULT_READING_ASSIST_PLACEHOLDER_CROSS_LINK_SUMMARY;
    const out = ensureVerificationBundleForCrossLink(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY,
      crossLinkSummary,
      "missing-id"
    );
    expect(out.bundleIds).toHaveLength(0);
    expect(Object.keys(out.bundles)).toHaveLength(0);
  });

  it("repeated ensureVerificationBundleForCrossLink does not duplicate bundle", () => {
    const crossLinkId = createReadingAssistPlaceholderCrossLinkId("b1-s0", "c1", "src1", null, "v1");
    const crossLinkSummary: ReadingAssistPlaceholderCrossLinkSummary = {
      links: {
        [crossLinkId]: {
          id: crossLinkId,
          sentenceId: "b1-s0",
          anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
          claimId: "c1",
          sourceId: "src1",
          disagreementId: null,
          verificationId: "v1",
          createdAt: 100,
        },
      },
      linkIds: [crossLinkId],
    };
    let out = ensureVerificationBundleForCrossLink(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY,
      crossLinkSummary,
      crossLinkId
    );
    out = ensureVerificationBundleForCrossLink(out, crossLinkSummary, crossLinkId);
    expect(out.bundleIds).toHaveLength(1);
  });

  it("sentence path that produces eligible cross-link produces exactly one verification bundle", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.crossLinkSummary.linkIds).toHaveLength(1);
    expect(next.verificationBundleSummary.bundleIds).toHaveLength(1);
    const linkId = next.crossLinkSummary.linkIds[0];
    const bundleId = createReadingAssistVerificationBundleId(linkId);
    expect(next.verificationBundleSummary.bundles[bundleId]).toBeDefined();
    expect(next.verificationBundleSummary.bundles[bundleId].crossLinkId).toBe(linkId);
    expect(next.verificationBundleSummary.bundles[bundleId].sentenceId).toBe("b1-s0");
  });

  it("repeated reduction does not duplicate verification bundle", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next1 = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const prev2: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: next1.anchorSummary,
      attachmentRegistry: next1.attachmentRegistry,
      crossLinkSummary: next1.crossLinkSummary,
      verificationBundleSummary: next1.verificationBundleSummary,
      verificationBundleIndexSummary: next1.verificationBundleIndexSummary,
      markers: next1.markers,
      markerIds: next1.markerIds,
      examinedSentenceIds: next1.examinedSentenceIds,
      sentences: next1.sentences,
    };
    const next2 = reduceReadingAssistReadingPathSummary(prev2, event, heuristic);
    expect(next2.verificationBundleSummary.bundleIds).toHaveLength(
      next1.verificationBundleSummary.bundleIds.length
    );
  });

  it("disagreement remains null when absent", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const bundleId = next.verificationBundleSummary.bundleIds[0];
    expect(next.verificationBundleSummary.bundles[bundleId].disagreementId).toBeNull();
  });

  it("disagreement is populated when sentence revisit introduces disagreement on same cross-link", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.crossLinkSummary.linkIds.length).toBeGreaterThanOrEqual(1);
    const linkId = next.crossLinkSummary.linkIds[next.crossLinkSummary.linkIds.length - 1];
    const link = next.crossLinkSummary.links[linkId];
    expect(link.disagreementId).not.toBeNull();
    const bundleId = createReadingAssistVerificationBundleId(linkId);
    expect(next.verificationBundleSummary.bundles[bundleId]).toBeDefined();
    expect(next.verificationBundleSummary.bundles[bundleId].disagreementId).not.toBeNull();
  });

  it("block-only events do not create verification bundles", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.verificationBundleSummary.bundleIds).toHaveLength(0);
    expect(Object.keys(next.verificationBundleSummary.bundles)).toHaveLength(0);
  });

  it("no verification bundle when required placeholders do not produce a cross-link", () => {
    const anchorSummary: ReadingAssistClaimReadyAnchorSummary = {
      ...DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY,
      sentenceSlotIds: [createReadingAssistSentenceAnchorId("b1-s0")],
      sentenceSlots: {
        [createReadingAssistSentenceAnchorId("b1-s0")]: {
          anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
          blockId: "b1",
          sentenceId: "b1-s0",
          slotType: "sentence",
          createdAt: 100,
          markerIds: ["m1"],
          claimIds: [],
          sourceIds: ["ra-source-placeholder|m1"],
          disagreementIds: [],
          attachments: {
            ...DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE,
            markerIds: ["m1"],
            claimIds: [],
            sourceIds: ["ra-source-placeholder|m1"],
            disagreementIds: [],
            verificationIds: ["ra-verification-placeholder|m1"],
          },
        },
      },
    };
    const crossLinkSummary = ensureCrossLinkForSentenceSlot(
      DEFAULT_READING_ASSIST_PLACEHOLDER_CROSS_LINK_SUMMARY,
      anchorSummary,
      "b1-s0",
      100
    );
    expect(crossLinkSummary.linkIds).toHaveLength(0);
    const out = ensureVerificationBundleForCrossLink(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY,
      crossLinkSummary,
      "any-id"
    );
    expect(out.bundleIds).toHaveLength(0);
  });
});

describe("v21 verification bundle indexes / retrieval surface", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  it("default reading path summary includes verificationBundleIndexSummary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.verificationBundleIndexSummary).toBeDefined();
    expect(r.verificationBundleIndexSummary.bySentenceId).toEqual({});
    expect(r.verificationBundleIndexSummary.byAnchorId).toEqual({});
    expect(r.verificationBundleIndexSummary.byClaimId).toEqual({});
    expect(r.verificationBundleIndexSummary.bySourceId).toEqual({});
    expect(r.verificationBundleIndexSummary.byVerificationId).toEqual({});
    expect(r.verificationBundleIndexSummary.byDisagreementId).toEqual({});
  });

  it("reset yields empty verification bundle index summary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(Object.keys(r.verificationBundleIndexSummary.bySentenceId)).toHaveLength(0);
    expect(Object.keys(r.verificationBundleIndexSummary.byDisagreementId)).toHaveLength(0);
  });

  it("ensureReadingAssistIdIndexEntry initializes a new entry", () => {
    const out = ensureReadingAssistIdIndexEntry({}, "s1", "bundle-1");
    expect(out.s1).toEqual(["bundle-1"]);
  });

  it("ensureReadingAssistIdIndexEntry repeated ensure with same id does not duplicate", () => {
    const map = ensureReadingAssistIdIndexEntry({}, "s1", "bundle-1");
    const out = ensureReadingAssistIdIndexEntry(map, "s1", "bundle-1");
    expect(out.s1).toEqual(["bundle-1"]);
  });

  it("ensureReadingAssistIdIndexEntry adding a second id appends it", () => {
    const map = ensureReadingAssistIdIndexEntry({}, "s1", "bundle-1");
    const out = ensureReadingAssistIdIndexEntry(map, "s1", "bundle-2");
    expect(out.s1).toEqual(["bundle-1", "bundle-2"]);
  });

  it("ensureReadingAssistIdIndexEntry falsy key returns original unchanged", () => {
    const map = { k: ["x"] };
    expect(ensureReadingAssistIdIndexEntry(map, null, "id")).toBe(map);
    expect(ensureReadingAssistIdIndexEntry(map, undefined, "id")).toBe(map);
    expect(ensureReadingAssistIdIndexEntry(map, "", "id")).toBe(map);
  });

  it("ensureReadingAssistVerificationBundleIndexes indexes bundle into sentence anchor claim source verification", () => {
    const bundle: ReadingAssistVerificationBundle = {
      id: "ra-verification-bundle|link1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      crossLinkId: "link1",
      claimId: "c1",
      sourceId: "src1",
      verificationId: "v1",
      disagreementId: null,
      createdAt: "100",
    };
    const out = ensureReadingAssistVerificationBundleIndexes(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY,
      bundle
    );
    expect(out.bySentenceId["b1-s0"]).toEqual([bundle.id]);
    expect(out.byAnchorId[bundle.anchorId]).toEqual([bundle.id]);
    expect(out.byClaimId["c1"]).toEqual([bundle.id]);
    expect(out.bySourceId["src1"]).toEqual([bundle.id]);
    expect(out.byVerificationId["v1"]).toEqual([bundle.id]);
    expect(Object.keys(out.byDisagreementId)).toHaveLength(0);
  });

  it("ensureReadingAssistVerificationBundleIndexes indexes disagreement only when non-null", () => {
    const bundle: ReadingAssistVerificationBundle = {
      id: "ra-verification-bundle|link1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      crossLinkId: "link1",
      claimId: "c1",
      sourceId: "src1",
      verificationId: "v1",
      disagreementId: "d1",
      createdAt: "100",
    };
    const out = ensureReadingAssistVerificationBundleIndexes(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY,
      bundle
    );
    expect(out.byDisagreementId["d1"]).toEqual([bundle.id]);
  });

  it("ensureReadingAssistVerificationBundleIndexes repeated ensure does not duplicate bundle ids", () => {
    const bundle: ReadingAssistVerificationBundle = {
      id: "ra-verification-bundle|link1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      crossLinkId: "link1",
      claimId: "c1",
      sourceId: "src1",
      verificationId: "v1",
      disagreementId: null,
      createdAt: "100",
    };
    let summary = ensureReadingAssistVerificationBundleIndexes(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY,
      bundle
    );
    summary = ensureReadingAssistVerificationBundleIndexes(summary, bundle);
    expect(summary.bySentenceId["b1-s0"]).toEqual([bundle.id]);
  });

  it("ensureVerificationBundleIndexesForBundleId indexes when bundle exists", () => {
    const bundle: ReadingAssistVerificationBundle = {
      id: "ra-verification-bundle|link1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      crossLinkId: "link1",
      claimId: "c1",
      sourceId: "src1",
      verificationId: "v1",
      disagreementId: null,
      createdAt: "100",
    };
    const verificationBundleSummary: ReadingAssistVerificationBundleSummary = {
      bundles: { [bundle.id]: bundle },
      bundleIds: [bundle.id],
    };
    const out = ensureVerificationBundleIndexesForBundleId(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY,
      verificationBundleSummary,
      bundle.id
    );
    expect(out.bySentenceId["b1-s0"]).toEqual([bundle.id]);
    expect(out.byClaimId["c1"]).toEqual([bundle.id]);
  });

  it("ensureVerificationBundleIndexesForBundleId no change when bundle id is missing", () => {
    const verificationBundleSummary = DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY;
    const indexSummary = DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY;
    const out = ensureVerificationBundleIndexesForBundleId(
      indexSummary,
      verificationBundleSummary,
      "missing-bundle-id"
    );
    expect(out).toBe(indexSummary);
    expect(Object.keys(out.bySentenceId)).toHaveLength(0);
  });

  it("ensureVerificationBundleIndexesForBundleId repeated ensure does not duplicate", () => {
    const bundle: ReadingAssistVerificationBundle = {
      id: "ra-verification-bundle|link1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      crossLinkId: "link1",
      claimId: "c1",
      sourceId: "src1",
      verificationId: "v1",
      disagreementId: null,
      createdAt: "100",
    };
    const verificationBundleSummary: ReadingAssistVerificationBundleSummary = {
      bundles: { [bundle.id]: bundle },
      bundleIds: [bundle.id],
    };
    let out = ensureVerificationBundleIndexesForBundleId(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY,
      verificationBundleSummary,
      bundle.id
    );
    out = ensureVerificationBundleIndexesForBundleId(out, verificationBundleSummary, bundle.id);
    expect(out.bySentenceId["b1-s0"]).toEqual([bundle.id]);
  });

  it("eligible sentence path that produces verification bundle produces bundle id in each relevant index", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.verificationBundleSummary.bundleIds).toHaveLength(1);
    const bundleId = next.verificationBundleSummary.bundleIds[0];
    expect(next.verificationBundleIndexSummary.bySentenceId["b1-s0"]).toEqual([bundleId]);
    const bundle = next.verificationBundleSummary.bundles[bundleId];
    expect(next.verificationBundleIndexSummary.byAnchorId[bundle.anchorId]).toEqual([bundleId]);
    expect(next.verificationBundleIndexSummary.byClaimId[bundle.claimId]).toEqual([bundleId]);
    expect(next.verificationBundleIndexSummary.bySourceId[bundle.sourceId]).toEqual([bundleId]);
    expect(next.verificationBundleIndexSummary.byVerificationId[bundle.verificationId]).toEqual([bundleId]);
  });

  it("repeated reduction does not duplicate bundle ids in any index", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next1 = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const prev2: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: next1.anchorSummary,
      attachmentRegistry: next1.attachmentRegistry,
      crossLinkSummary: next1.crossLinkSummary,
      verificationBundleSummary: next1.verificationBundleSummary,
      verificationBundleIndexSummary: next1.verificationBundleIndexSummary,
      curiositySignalSummary: next1.curiositySignalSummary,
      promptToneSlotSummary: next1.promptToneSlotSummary,
      markers: next1.markers,
      markerIds: next1.markerIds,
      examinedSentenceIds: next1.examinedSentenceIds,
      sentences: next1.sentences,
    };
    const next2 = reduceReadingAssistReadingPathSummary(prev2, event, heuristic);
    expect(next2.verificationBundleIndexSummary.bySentenceId["b1-s0"]).toEqual(
      next1.verificationBundleIndexSummary.bySentenceId["b1-s0"]
    );
    expect(next2.verificationBundleIndexSummary.bySentenceId["b1-s0"]).toHaveLength(1);
  });

  it("revisit that adds disagreement updates byDisagreementId", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const bundleId = next.verificationBundleSummary.bundleIds[0];
    const bundle = next.verificationBundleSummary.bundles[bundleId];
    expect(bundle.disagreementId).not.toBeNull();
    expect(next.verificationBundleIndexSummary.byDisagreementId[bundle.disagreementId!]).toContain(bundleId);
  });

  it("block-only events do not create bundle indexes", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(Object.keys(next.verificationBundleIndexSummary.bySentenceId)).toHaveLength(0);
    expect(Object.keys(next.verificationBundleIndexSummary.byClaimId)).toHaveLength(0);
  });

  it("no indexes exist when no verification bundle exists", () => {
    const anchorSummary: ReadingAssistClaimReadyAnchorSummary = {
      ...DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY,
      sentenceSlotIds: [createReadingAssistSentenceAnchorId("b1-s0")],
      sentenceSlots: {
        [createReadingAssistSentenceAnchorId("b1-s0")]: {
          anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
          blockId: "b1",
          sentenceId: "b1-s0",
          slotType: "sentence",
          createdAt: 100,
          markerIds: ["m1"],
          claimIds: [],
          sourceIds: ["ra-source-placeholder|m1"],
          disagreementIds: [],
          attachments: {
            ...DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE,
            markerIds: ["m1"],
            claimIds: [],
            sourceIds: ["ra-source-placeholder|m1"],
            disagreementIds: [],
            verificationIds: ["ra-verification-placeholder|m1"],
          },
        },
      },
    };
    const crossLinkSummary = ensureCrossLinkForSentenceSlot(
      DEFAULT_READING_ASSIST_PLACEHOLDER_CROSS_LINK_SUMMARY,
      anchorSummary,
      "b1-s0",
      100
    );
    expect(crossLinkSummary.linkIds).toHaveLength(0);
    const bundleSummary = ensureVerificationBundleForCrossLink(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY,
      crossLinkSummary,
      "any-id"
    );
    expect(bundleSummary.bundleIds).toHaveLength(0);
    const indexOut = ensureVerificationBundleIndexesForBundleId(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY,
      bundleSummary,
      "any-bundle-id"
    );
    expect(Object.keys(indexOut.bySentenceId)).toHaveLength(0);
  });
});

describe("v22 curiosity signal skeleton", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  it("default reading path summary includes curiositySignalSummary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.curiositySignalSummary).toBeDefined();
    expect(r.curiositySignalSummary.signals).toEqual({});
    expect(r.curiositySignalSummary.signalIds).toEqual([]);
  });

  it("reset yields empty curiosity signal summary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(Object.keys(r.curiositySignalSummary.signals)).toHaveLength(0);
    expect(r.curiositySignalSummary.signalIds).toHaveLength(0);
  });

  it("createReadingAssistCuriositySignalId returns deterministic id", () => {
    const bundleId = "ra-verification-bundle|link1";
    expect(createReadingAssistCuriositySignalId(bundleId)).toBe("ra-curiosity-signal|ra-verification-bundle|link1");
    expect(createReadingAssistCuriositySignalId(bundleId)).toBe(createReadingAssistCuriositySignalId(bundleId));
  });

  it("buildReadingAssistCuriositySignalKinds returns explore_point source_available verification_opportunity when disagreement is null", () => {
    const bundle: ReadingAssistVerificationBundle = {
      id: "ra-verification-bundle|link1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      crossLinkId: "link1",
      claimId: "c1",
      sourceId: "src1",
      verificationId: "v1",
      disagreementId: null,
      createdAt: "100",
    };
    const kinds = buildReadingAssistCuriositySignalKinds(bundle);
    expect(kinds).toEqual(["explore_point", "source_available", "verification_opportunity"]);
  });

  it("buildReadingAssistCuriositySignalKinds includes disagreement_present when disagreement is non-null", () => {
    const bundle: ReadingAssistVerificationBundle = {
      id: "ra-verification-bundle|link1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      crossLinkId: "link1",
      claimId: "c1",
      sourceId: "src1",
      verificationId: "v1",
      disagreementId: "d1",
      createdAt: "100",
    };
    const kinds = buildReadingAssistCuriositySignalKinds(bundle);
    expect(kinds).toEqual(["explore_point", "source_available", "verification_opportunity", "disagreement_present"]);
  });

  it("buildReadingAssistCuriositySignalKinds order is deterministic and no duplicates", () => {
    const bundle: ReadingAssistVerificationBundle = {
      id: "b",
      sentenceId: "s",
      anchorId: "a",
      crossLinkId: "c",
      claimId: "cl",
      sourceId: "sr",
      verificationId: "v",
      disagreementId: "d",
      createdAt: "1",
    };
    const kinds = buildReadingAssistCuriositySignalKinds(bundle);
    expect(kinds).toEqual(["explore_point", "source_available", "verification_opportunity", "disagreement_present"]);
    expect([...new Set(kinds)].length).toBe(kinds.length);
  });

  it("ensureReadingAssistCuriositySignal adds once", () => {
    const signal: ReadingAssistCuriositySignal = {
      id: createReadingAssistCuriositySignalId("bundle-1"),
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      bundleId: "bundle-1",
      crossLinkId: "link1",
      signalKinds: ["explore_point", "source_available", "verification_opportunity"],
      createdAt: "100",
    };
    const summary = ensureReadingAssistCuriositySignal(DEFAULT_READING_ASSIST_CURIOSITY_SIGNAL_SUMMARY, signal);
    expect(summary.signalIds).toHaveLength(1);
    expect(summary.signalIds[0]).toBe(signal.id);
    expect(summary.signals[signal.id]).toEqual(signal);
  });

  it("ensureReadingAssistCuriositySignal repeated ensure does not duplicate signalIds", () => {
    const signal: ReadingAssistCuriositySignal = {
      id: createReadingAssistCuriositySignalId("bundle-1"),
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      bundleId: "bundle-1",
      crossLinkId: "link1",
      signalKinds: ["explore_point", "source_available", "verification_opportunity"],
      createdAt: "100",
    };
    let summary = ensureReadingAssistCuriositySignal(DEFAULT_READING_ASSIST_CURIOSITY_SIGNAL_SUMMARY, signal);
    summary = ensureReadingAssistCuriositySignal(summary, signal);
    expect(summary.signalIds).toHaveLength(1);
  });

  it("ensureReadingAssistCuriositySignal preserves existing createdAt on re-ensure", () => {
    const signal: ReadingAssistCuriositySignal = {
      id: createReadingAssistCuriositySignalId("bundle-1"),
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      bundleId: "bundle-1",
      crossLinkId: "link1",
      signalKinds: ["explore_point", "source_available", "verification_opportunity"],
      createdAt: "100",
    };
    let summary = ensureReadingAssistCuriositySignal(DEFAULT_READING_ASSIST_CURIOSITY_SIGNAL_SUMMARY, signal);
    const signalLater = { ...signal, createdAt: "200" };
    summary = ensureReadingAssistCuriositySignal(summary, signalLater);
    expect(summary.signals[signal.id].createdAt).toBe("100");
  });

  it("ensureReadingAssistCuriositySignal expands signalKinds when later ensure adds disagreement_present", () => {
    const signal: ReadingAssistCuriositySignal = {
      id: createReadingAssistCuriositySignalId("bundle-1"),
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      bundleId: "bundle-1",
      crossLinkId: "link1",
      signalKinds: ["explore_point", "source_available", "verification_opportunity"],
      createdAt: "100",
    };
    let summary = ensureReadingAssistCuriositySignal(DEFAULT_READING_ASSIST_CURIOSITY_SIGNAL_SUMMARY, signal);
    const signalWithD: ReadingAssistCuriositySignal = {
      ...signal,
      signalKinds: ["explore_point", "source_available", "verification_opportunity", "disagreement_present"],
    };
    summary = ensureReadingAssistCuriositySignal(summary, signalWithD);
    expect(summary.signals[signal.id].signalKinds).toContain("disagreement_present");
    expect(summary.signals[signal.id].signalKinds).toContain("explore_point");
  });

  it("ensureReadingAssistCuriositySignal does not regress or shrink existing signal kinds", () => {
    const signalWithD: ReadingAssistCuriositySignal = {
      id: createReadingAssistCuriositySignalId("bundle-1"),
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      bundleId: "bundle-1",
      crossLinkId: "link1",
      signalKinds: ["explore_point", "source_available", "verification_opportunity", "disagreement_present"],
      createdAt: "100",
    };
    let summary = ensureReadingAssistCuriositySignal(DEFAULT_READING_ASSIST_CURIOSITY_SIGNAL_SUMMARY, signalWithD);
    const signalWithoutD: ReadingAssistCuriositySignal = {
      ...signalWithD,
      signalKinds: ["explore_point", "source_available", "verification_opportunity"],
    };
    summary = ensureReadingAssistCuriositySignal(summary, signalWithoutD);
    expect(summary.signals[signalWithD.id].signalKinds).toContain("disagreement_present");
  });

  it("ensureCuriositySignalForBundleId creates signal when bundle exists", () => {
    const bundle: ReadingAssistVerificationBundle = {
      id: "ra-verification-bundle|link1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      crossLinkId: "link1",
      claimId: "c1",
      sourceId: "src1",
      verificationId: "v1",
      disagreementId: null,
      createdAt: "100",
    };
    const verificationBundleSummary: ReadingAssistVerificationBundleSummary = {
      bundles: { [bundle.id]: bundle },
      bundleIds: [bundle.id],
    };
    const out = ensureCuriositySignalForBundleId(
      DEFAULT_READING_ASSIST_CURIOSITY_SIGNAL_SUMMARY,
      verificationBundleSummary,
      bundle.id
    );
    expect(out.signalIds).toHaveLength(1);
    const signalId = createReadingAssistCuriositySignalId(bundle.id);
    expect(out.signals[signalId]).toBeDefined();
    expect(out.signals[signalId].sentenceId).toBe(bundle.sentenceId);
    expect(out.signals[signalId].anchorId).toBe(bundle.anchorId);
    expect(out.signals[signalId].bundleId).toBe(bundle.id);
    expect(out.signals[signalId].crossLinkId).toBe(bundle.crossLinkId);
    expect(out.signals[signalId].createdAt).toBe(bundle.createdAt);
    expect(out.signals[signalId].signalKinds).toEqual(["explore_point", "source_available", "verification_opportunity"]);
  });

  it("ensureCuriositySignalForBundleId no signal created when bundle id missing", () => {
    const verificationBundleSummary = DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY;
    const out = ensureCuriositySignalForBundleId(
      DEFAULT_READING_ASSIST_CURIOSITY_SIGNAL_SUMMARY,
      verificationBundleSummary,
      "missing-bundle-id"
    );
    expect(out.signalIds).toHaveLength(0);
    expect(Object.keys(out.signals)).toHaveLength(0);
  });

  it("ensureCuriositySignalForBundleId repeated ensure does not duplicate signal", () => {
    const bundle: ReadingAssistVerificationBundle = {
      id: "ra-verification-bundle|link1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      crossLinkId: "link1",
      claimId: "c1",
      sourceId: "src1",
      verificationId: "v1",
      disagreementId: null,
      createdAt: "100",
    };
    const verificationBundleSummary: ReadingAssistVerificationBundleSummary = {
      bundles: { [bundle.id]: bundle },
      bundleIds: [bundle.id],
    };
    let out = ensureCuriositySignalForBundleId(
      DEFAULT_READING_ASSIST_CURIOSITY_SIGNAL_SUMMARY,
      verificationBundleSummary,
      bundle.id
    );
    out = ensureCuriositySignalForBundleId(out, verificationBundleSummary, bundle.id);
    expect(out.signalIds).toHaveLength(1);
  });

  it("eligible sentence path that produces verification bundle produces exactly one curiosity signal", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.verificationBundleSummary.bundleIds).toHaveLength(1);
    expect(next.curiositySignalSummary.signalIds).toHaveLength(1);
    const bundleId = next.verificationBundleSummary.bundleIds[0];
    const signalId = createReadingAssistCuriositySignalId(bundleId);
    expect(next.curiositySignalSummary.signals[signalId]).toBeDefined();
    expect(next.curiositySignalSummary.signals[signalId].signalKinds).toEqual([
      "explore_point",
      "source_available",
      "verification_opportunity",
    ]);
  });

  it("repeated reduction does not duplicate curiosity signal", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next1 = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const prev2: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: next1.anchorSummary,
      attachmentRegistry: next1.attachmentRegistry,
      crossLinkSummary: next1.crossLinkSummary,
      verificationBundleSummary: next1.verificationBundleSummary,
      verificationBundleIndexSummary: next1.verificationBundleIndexSummary,
      curiositySignalSummary: next1.curiositySignalSummary,
      promptToneSlotSummary: next1.promptToneSlotSummary,
      markers: next1.markers,
      markerIds: next1.markerIds,
      examinedSentenceIds: next1.examinedSentenceIds,
      sentences: next1.sentences,
    };
    const next2 = reduceReadingAssistReadingPathSummary(prev2, event, heuristic);
    expect(next2.curiositySignalSummary.signalIds).toHaveLength(next1.curiositySignalSummary.signalIds.length);
  });

  it("revisit that adds disagreement updates same signal to include disagreement_present", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const bundleId = next.verificationBundleSummary.bundleIds[0];
    const signalId = createReadingAssistCuriositySignalId(bundleId);
    expect(next.curiositySignalSummary.signals[signalId].signalKinds).toContain("disagreement_present");
  });

  it("block-only events do not create curiosity signals", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.curiositySignalSummary.signalIds).toHaveLength(0);
    expect(Object.keys(next.curiositySignalSummary.signals)).toHaveLength(0);
  });

  it("no curiosity signal when no verification bundle exists", () => {
    const anchorSummary: ReadingAssistClaimReadyAnchorSummary = {
      ...DEFAULT_READING_ASSIST_CLAIM_READY_ANCHOR_SUMMARY,
      sentenceSlotIds: [createReadingAssistSentenceAnchorId("b1-s0")],
      sentenceSlots: {
        [createReadingAssistSentenceAnchorId("b1-s0")]: {
          anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
          blockId: "b1",
          sentenceId: "b1-s0",
          slotType: "sentence",
          createdAt: 100,
          markerIds: ["m1"],
          claimIds: [],
          sourceIds: ["ra-source-placeholder|m1"],
          disagreementIds: [],
          attachments: {
            ...DEFAULT_READING_ASSIST_ATTACHMENT_ENVELOPE,
            markerIds: ["m1"],
            claimIds: [],
            sourceIds: ["ra-source-placeholder|m1"],
            disagreementIds: [],
            verificationIds: ["ra-verification-placeholder|m1"],
          },
        },
      },
    };
    const crossLinkSummary = ensureCrossLinkForSentenceSlot(
      DEFAULT_READING_ASSIST_PLACEHOLDER_CROSS_LINK_SUMMARY,
      anchorSummary,
      "b1-s0",
      100
    );
    expect(crossLinkSummary.linkIds).toHaveLength(0);
    const bundleSummary = ensureVerificationBundleForCrossLink(
      DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_SUMMARY,
      crossLinkSummary,
      "any-id"
    );
    expect(bundleSummary.bundleIds).toHaveLength(0);
    const signalOut = ensureCuriositySignalForBundleId(
      DEFAULT_READING_ASSIST_CURIOSITY_SIGNAL_SUMMARY,
      bundleSummary,
      "any-bundle-id"
    );
    expect(signalOut.signalIds).toHaveLength(0);
  });
});

describe("v23 prompt tone slots", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  it("default reading path summary includes promptToneSlotSummary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.promptToneSlotSummary).toBeDefined();
    expect(r.promptToneSlotSummary.slots).toEqual({});
    expect(r.promptToneSlotSummary.slotIds).toEqual([]);
  });

  it("reset yields empty prompt tone slot summary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(Object.keys(r.promptToneSlotSummary.slots)).toHaveLength(0);
    expect(r.promptToneSlotSummary.slotIds).toHaveLength(0);
  });

  it("createReadingAssistPromptToneSlotId returns deterministic id", () => {
    const signalId = "ra-curiosity-signal|bundle-1";
    expect(createReadingAssistPromptToneSlotId(signalId)).toBe("ra-prompt-tone-slot|ra-curiosity-signal|bundle-1");
    expect(createReadingAssistPromptToneSlotId(signalId)).toBe(createReadingAssistPromptToneSlotId(signalId));
  });

  it("buildReadingAssistPromptToneSlotKinds returns gentle_nudge curious_invite source_peek when disagreement absent but source available", () => {
    const signal: ReadingAssistCuriositySignal = {
      id: "ra-curiosity-signal|b1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      bundleId: "b1",
      crossLinkId: "c1",
      signalKinds: ["explore_point", "source_available", "verification_opportunity"],
      createdAt: "100",
    };
    const kinds = buildReadingAssistPromptToneSlotKinds(signal);
    expect(kinds).toEqual(["gentle_nudge", "curious_invite", "source_peek"]);
  });

  it("buildReadingAssistPromptToneSlotKinds includes soft_compare when disagreement_present exists", () => {
    const signal: ReadingAssistCuriositySignal = {
      id: "ra-curiosity-signal|b1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      bundleId: "b1",
      crossLinkId: "c1",
      signalKinds: ["explore_point", "source_available", "verification_opportunity", "disagreement_present"],
      createdAt: "100",
    };
    const kinds = buildReadingAssistPromptToneSlotKinds(signal);
    expect(kinds).toContain("soft_compare");
    expect(kinds).toEqual(["gentle_nudge", "curious_invite", "source_peek", "soft_compare"]);
  });

  it("buildReadingAssistPromptToneSlotKinds order is deterministic and no duplicates", () => {
    const signal: ReadingAssistCuriositySignal = {
      id: "s",
      sentenceId: "s",
      anchorId: "a",
      bundleId: "b",
      crossLinkId: "c",
      signalKinds: ["disagreement_present", "source_available"],
      createdAt: "1",
    };
    const kinds = buildReadingAssistPromptToneSlotKinds(signal);
    expect(kinds).toEqual(["gentle_nudge", "curious_invite", "source_peek", "soft_compare"]);
    expect([...new Set(kinds)].length).toBe(kinds.length);
  });

  it("deriveReadingAssistPromptToneFamily returns neutral_warm when disagreement absent", () => {
    const signal: ReadingAssistCuriositySignal = {
      id: "s",
      sentenceId: "s",
      anchorId: "a",
      bundleId: "b",
      crossLinkId: "c",
      signalKinds: ["explore_point", "source_available", "verification_opportunity"],
      createdAt: "1",
    };
    expect(deriveReadingAssistPromptToneFamily(signal)).toBe("neutral_warm");
  });

  it("deriveReadingAssistPromptToneFamily returns calm when disagreement present", () => {
    const signal: ReadingAssistCuriositySignal = {
      id: "s",
      sentenceId: "s",
      anchorId: "a",
      bundleId: "b",
      crossLinkId: "c",
      signalKinds: ["explore_point", "source_available", "verification_opportunity", "disagreement_present"],
      createdAt: "1",
    };
    expect(deriveReadingAssistPromptToneFamily(signal)).toBe("calm");
  });

  it("deriveReadingAssistPromptToneIntensity returns low when disagreement absent", () => {
    const signal: ReadingAssistCuriositySignal = {
      id: "s",
      sentenceId: "s",
      anchorId: "a",
      bundleId: "b",
      crossLinkId: "c",
      signalKinds: ["explore_point", "source_available", "verification_opportunity"],
      createdAt: "1",
    };
    expect(deriveReadingAssistPromptToneIntensity(signal)).toBe("low");
  });

  it("deriveReadingAssistPromptToneIntensity returns medium when disagreement present", () => {
    const signal: ReadingAssistCuriositySignal = {
      id: "s",
      sentenceId: "s",
      anchorId: "a",
      bundleId: "b",
      crossLinkId: "c",
      signalKinds: ["explore_point", "source_available", "verification_opportunity", "disagreement_present"],
      createdAt: "1",
    };
    expect(deriveReadingAssistPromptToneIntensity(signal)).toBe("medium");
  });

  it("ensureReadingAssistPromptToneSlot adds once", () => {
    const slot: ReadingAssistPromptToneSlot = {
      id: createReadingAssistPromptToneSlotId("sig-1"),
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      signalId: "sig-1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite", "source_peek"],
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    const summary = ensureReadingAssistPromptToneSlot(DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY, slot);
    expect(summary.slotIds).toHaveLength(1);
    expect(summary.slotIds[0]).toBe(slot.id);
    expect(summary.slots[slot.id]).toEqual(slot);
  });

  it("ensureReadingAssistPromptToneSlot repeated ensure does not duplicate slotIds", () => {
    const slot: ReadingAssistPromptToneSlot = {
      id: createReadingAssistPromptToneSlotId("sig-1"),
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      signalId: "sig-1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite", "source_peek"],
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptToneSlot(DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY, slot);
    summary = ensureReadingAssistPromptToneSlot(summary, slot);
    expect(summary.slotIds).toHaveLength(1);
  });

  it("ensureReadingAssistPromptToneSlot preserves existing createdAt on re-ensure", () => {
    const slot: ReadingAssistPromptToneSlot = {
      id: createReadingAssistPromptToneSlotId("sig-1"),
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      signalId: "sig-1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite", "source_peek"],
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptToneSlot(DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY, slot);
    const slotLater = { ...slot, createdAt: "200" };
    summary = ensureReadingAssistPromptToneSlot(summary, slotLater);
    expect(summary.slots[slot.id].createdAt).toBe("100");
  });

  it("ensureReadingAssistPromptToneSlot expands slotKinds when later ensure adds soft_compare", () => {
    const slot: ReadingAssistPromptToneSlot = {
      id: createReadingAssistPromptToneSlotId("sig-1"),
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      signalId: "sig-1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite", "source_peek"],
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptToneSlot(DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY, slot);
    const slotWithSoft: ReadingAssistPromptToneSlot = {
      ...slot,
      slotKinds: ["gentle_nudge", "curious_invite", "source_peek", "soft_compare"],
      toneFamily: "calm",
      intensity: "medium",
    };
    summary = ensureReadingAssistPromptToneSlot(summary, slotWithSoft);
    expect(summary.slots[slot.id].slotKinds).toContain("soft_compare");
    expect(summary.slots[slot.id].toneFamily).toBe("calm");
    expect(summary.slots[slot.id].intensity).toBe("medium");
  });

  it("ensureReadingAssistPromptToneSlot tone family upgrades from neutral_warm to calm when disagreement appears later", () => {
    const slot: ReadingAssistPromptToneSlot = {
      id: createReadingAssistPromptToneSlotId("sig-1"),
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      signalId: "sig-1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite", "source_peek"],
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptToneSlot(DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY, slot);
    const slotWithD: ReadingAssistPromptToneSlot = { ...slot, slotKinds: [...slot.slotKinds, "soft_compare"], toneFamily: "calm", intensity: "medium" };
    summary = ensureReadingAssistPromptToneSlot(summary, slotWithD);
    expect(summary.slots[slot.id].toneFamily).toBe("calm");
  });

  it("ensureReadingAssistPromptToneSlot intensity upgrades from low to medium when disagreement appears later", () => {
    const slot: ReadingAssistPromptToneSlot = {
      id: createReadingAssistPromptToneSlotId("sig-1"),
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      signalId: "sig-1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite", "source_peek"],
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptToneSlot(DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY, slot);
    const slotWithD: ReadingAssistPromptToneSlot = { ...slot, slotKinds: [...slot.slotKinds, "soft_compare"], toneFamily: "calm", intensity: "medium" };
    summary = ensureReadingAssistPromptToneSlot(summary, slotWithD);
    expect(summary.slots[slot.id].intensity).toBe("medium");
  });

  it("ensureReadingAssistPromptToneSlot slot kinds do not regress or shrink", () => {
    const slotWithSoft: ReadingAssistPromptToneSlot = {
      id: createReadingAssistPromptToneSlotId("sig-1"),
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      signalId: "sig-1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite", "source_peek", "soft_compare"],
      toneFamily: "calm",
      intensity: "medium",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptToneSlot(DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY, slotWithSoft);
    const slotWithoutSoft: ReadingAssistPromptToneSlot = { ...slotWithSoft, slotKinds: ["gentle_nudge", "curious_invite", "source_peek"], toneFamily: "neutral_warm", intensity: "low" };
    summary = ensureReadingAssistPromptToneSlot(summary, slotWithoutSoft);
    expect(summary.slots[slotWithSoft.id].slotKinds).toContain("soft_compare");
  });

  it("ensureReadingAssistPromptToneSlot tone family does not regress", () => {
    const slotCalm: ReadingAssistPromptToneSlot = {
      id: createReadingAssistPromptToneSlotId("sig-1"),
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      signalId: "sig-1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite", "source_peek", "soft_compare"],
      toneFamily: "calm",
      intensity: "medium",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptToneSlot(DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY, slotCalm);
    const slotNeutral: ReadingAssistPromptToneSlot = { ...slotCalm, toneFamily: "neutral_warm", intensity: "low" };
    summary = ensureReadingAssistPromptToneSlot(summary, slotNeutral);
    expect(summary.slots[slotCalm.id].toneFamily).toBe("calm");
  });

  it("ensureReadingAssistPromptToneSlot intensity does not regress", () => {
    const slotMedium: ReadingAssistPromptToneSlot = {
      id: createReadingAssistPromptToneSlotId("sig-1"),
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      signalId: "sig-1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite", "source_peek", "soft_compare"],
      toneFamily: "calm",
      intensity: "medium",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptToneSlot(DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY, slotMedium);
    const slotLow: ReadingAssistPromptToneSlot = { ...slotMedium, intensity: "low" };
    summary = ensureReadingAssistPromptToneSlot(summary, slotLow);
    expect(summary.slots[slotMedium.id].intensity).toBe("medium");
  });

  it("ensurePromptToneSlotForSignalId creates slot when signal exists", () => {
    const signal: ReadingAssistCuriositySignal = {
      id: "ra-curiosity-signal|b1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      bundleId: "b1",
      crossLinkId: "c1",
      signalKinds: ["explore_point", "source_available", "verification_opportunity"],
      createdAt: "100",
    };
    const curiositySignalSummary: ReadingAssistCuriositySignalSummary = {
      signals: { [signal.id]: signal },
      signalIds: [signal.id],
    };
    const out = ensurePromptToneSlotForSignalId(
      DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY,
      curiositySignalSummary,
      signal.id
    );
    expect(out.slotIds).toHaveLength(1);
    const slotId = createReadingAssistPromptToneSlotId(signal.id);
    expect(out.slots[slotId]).toBeDefined();
    expect(out.slots[slotId].sentenceId).toBe(signal.sentenceId);
    expect(out.slots[slotId].anchorId).toBe(signal.anchorId);
    expect(out.slots[slotId].signalId).toBe(signal.id);
    expect(out.slots[slotId].bundleId).toBe(signal.bundleId);
    expect(out.slots[slotId].crossLinkId).toBe(signal.crossLinkId);
    expect(out.slots[slotId].createdAt).toBe(signal.createdAt);
    expect(out.slots[slotId].slotKinds).toEqual(["gentle_nudge", "curious_invite", "source_peek"]);
    expect(out.slots[slotId].toneFamily).toBe("neutral_warm");
    expect(out.slots[slotId].intensity).toBe("low");
  });

  it("ensurePromptToneSlotForSignalId no slot created when signal id missing", () => {
    const curiositySignalSummary = DEFAULT_READING_ASSIST_CURIOSITY_SIGNAL_SUMMARY;
    const out = ensurePromptToneSlotForSignalId(
      DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY,
      curiositySignalSummary,
      "missing-signal-id"
    );
    expect(out.slotIds).toHaveLength(0);
    expect(Object.keys(out.slots)).toHaveLength(0);
  });

  it("ensurePromptToneSlotForSignalId repeated ensure does not duplicate slot", () => {
    const signal: ReadingAssistCuriositySignal = {
      id: "ra-curiosity-signal|b1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      bundleId: "b1",
      crossLinkId: "c1",
      signalKinds: ["explore_point", "source_available", "verification_opportunity"],
      createdAt: "100",
    };
    const curiositySignalSummary: ReadingAssistCuriositySignalSummary = {
      signals: { [signal.id]: signal },
      signalIds: [signal.id],
    };
    let out = ensurePromptToneSlotForSignalId(
      DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY,
      curiositySignalSummary,
      signal.id
    );
    out = ensurePromptToneSlotForSignalId(out, curiositySignalSummary, signal.id);
    expect(out.slotIds).toHaveLength(1);
  });

  it("eligible sentence path that produces curiosity signal produces exactly one prompt tone slot", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.curiositySignalSummary.signalIds).toHaveLength(1);
    expect(next.promptToneSlotSummary.slotIds).toHaveLength(1);
    const signalId = next.curiositySignalSummary.signalIds[0];
    const slotId = createReadingAssistPromptToneSlotId(signalId);
    expect(next.promptToneSlotSummary.slots[slotId]).toBeDefined();
    expect(next.promptToneSlotSummary.slots[slotId].slotKinds).toEqual(["gentle_nudge", "curious_invite", "source_peek"]);
    expect(next.promptToneSlotSummary.slots[slotId].toneFamily).toBe("neutral_warm");
    expect(next.promptToneSlotSummary.slots[slotId].intensity).toBe("low");
  });

  it("repeated reduction does not duplicate prompt tone slot", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next1 = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const prev2: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: next1.anchorSummary,
      attachmentRegistry: next1.attachmentRegistry,
      crossLinkSummary: next1.crossLinkSummary,
      verificationBundleSummary: next1.verificationBundleSummary,
      verificationBundleIndexSummary: next1.verificationBundleIndexSummary,
      curiositySignalSummary: next1.curiositySignalSummary,
      promptToneSlotSummary: next1.promptToneSlotSummary,
      promptCopySelectionSummary: next1.promptCopySelectionSummary,
      markers: next1.markers,
      markerIds: next1.markerIds,
      examinedSentenceIds: next1.examinedSentenceIds,
      sentences: next1.sentences,
    };
    const next2 = reduceReadingAssistReadingPathSummary(prev2, event, heuristic);
    expect(next2.promptToneSlotSummary.slotIds).toHaveLength(next1.promptToneSlotSummary.slotIds.length);
  });

  it("revisit that adds disagreement updates same slot to include soft_compare toneFamily calm intensity medium", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const signalId = next.curiositySignalSummary.signalIds[0];
    const slotId = createReadingAssistPromptToneSlotId(signalId);
    expect(next.promptToneSlotSummary.slots[slotId].slotKinds).toContain("soft_compare");
    expect(next.promptToneSlotSummary.slots[slotId].toneFamily).toBe("calm");
    expect(next.promptToneSlotSummary.slots[slotId].intensity).toBe("medium");
  });

  it("block-only events do not create prompt tone slots", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.promptToneSlotSummary.slotIds).toHaveLength(0);
    expect(Object.keys(next.promptToneSlotSummary.slots)).toHaveLength(0);
  });

  it("no prompt tone slot when no curiosity signal exists", () => {
    const curiositySignalSummary = DEFAULT_READING_ASSIST_CURIOSITY_SIGNAL_SUMMARY;
    const out = ensurePromptToneSlotForSignalId(
      DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY,
      curiositySignalSummary,
      "any-signal-id"
    );
    expect(out.slotIds).toHaveLength(0);
    expect(Object.keys(out.slots)).toHaveLength(0);
  });
});

describe("v24 prompt copy keys", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  it("default reading path summary includes promptCopySelectionSummary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.promptCopySelectionSummary).toBeDefined();
    expect(r.promptCopySelectionSummary.selections).toEqual({});
    expect(r.promptCopySelectionSummary.selectionIds).toEqual([]);
  });

  it("reset yields empty prompt copy selection summary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(Object.keys(r.promptCopySelectionSummary.selections)).toHaveLength(0);
    expect(r.promptCopySelectionSummary.selectionIds).toHaveLength(0);
  });

  it("createReadingAssistPromptCopySelectionId returns deterministic id", () => {
    const slotId = "ra-prompt-tone-slot|sig-1";
    expect(createReadingAssistPromptCopySelectionId(slotId)).toBe(
      "ra-prompt-copy-selection|ra-prompt-tone-slot|sig-1"
    );
    expect(createReadingAssistPromptCopySelectionId(slotId)).toBe(
      createReadingAssistPromptCopySelectionId(slotId)
    );
  });

  it("deriveReadingAssistPrimaryPromptCopyKey returns copy_source_peek when source_peek exists", () => {
    const slot: ReadingAssistPromptToneSlot = {
      id: "slot-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite", "source_peek"],
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    expect(deriveReadingAssistPrimaryPromptCopyKey(slot)).toBe("copy_source_peek");
  });

  it("deriveReadingAssistPrimaryPromptCopyKey returns copy_explore_gentle when no source_peek or soft_compare", () => {
    const slot: ReadingAssistPromptToneSlot = {
      id: "slot-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite"],
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    expect(deriveReadingAssistPrimaryPromptCopyKey(slot)).toBe("copy_explore_gentle");
  });

  it("deriveReadingAssistPrimaryPromptCopyKey returns copy_compare_soft when soft_compare", () => {
    const slot: ReadingAssistPromptToneSlot = {
      id: "slot-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite", "source_peek", "soft_compare"],
      toneFamily: "calm",
      intensity: "medium",
      createdAt: "100",
    };
    expect(deriveReadingAssistPrimaryPromptCopyKey(slot)).toBe("copy_compare_soft");
  });

  it("deriveReadingAssistSecondaryPromptCopyKey returns copy_source_peek when primary is copy_compare_soft", () => {
    const slot: ReadingAssistPromptToneSlot = {
      id: "slot-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite", "source_peek", "soft_compare"],
      toneFamily: "calm",
      intensity: "medium",
      createdAt: "100",
    };
    expect(deriveReadingAssistSecondaryPromptCopyKey(slot)).toBe("copy_source_peek");
  });

  it("deriveReadingAssistSecondaryPromptCopyKey returns copy_explore_gentle when primary is copy_source_peek", () => {
    const slot: ReadingAssistPromptToneSlot = {
      id: "slot-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite", "source_peek"],
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    expect(deriveReadingAssistSecondaryPromptCopyKey(slot)).toBe("copy_explore_gentle");
  });

  it("deriveReadingAssistSecondaryPromptCopyKey returns null when primary is copy_explore_gentle", () => {
    const slot: ReadingAssistPromptToneSlot = {
      id: "slot-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite"],
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    expect(deriveReadingAssistSecondaryPromptCopyKey(slot)).toBeNull();
  });

  it("ensureReadingAssistPromptCopySelection adds once", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: createReadingAssistPromptCopySelectionId("slot-1"),
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    const summary = ensureReadingAssistPromptCopySelection(
      DEFAULT_READING_ASSIST_PROMPT_COPY_SELECTION_SUMMARY,
      selection
    );
    expect(summary.selectionIds).toHaveLength(1);
    expect(summary.selectionIds[0]).toBe(selection.id);
    expect(summary.selections[selection.id]).toEqual(selection);
  });

  it("ensureReadingAssistPromptCopySelection repeated ensure does not duplicate selectionIds", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: createReadingAssistPromptCopySelectionId("slot-1"),
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopySelection(
      DEFAULT_READING_ASSIST_PROMPT_COPY_SELECTION_SUMMARY,
      selection
    );
    summary = ensureReadingAssistPromptCopySelection(summary, selection);
    expect(summary.selectionIds).toHaveLength(1);
  });

  it("ensureReadingAssistPromptCopySelection preserves existing createdAt on re-ensure", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: createReadingAssistPromptCopySelectionId("slot-1"),
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopySelection(
      DEFAULT_READING_ASSIST_PROMPT_COPY_SELECTION_SUMMARY,
      selection
    );
    const selectionLater = { ...selection, createdAt: "200" };
    summary = ensureReadingAssistPromptCopySelection(summary, selectionLater);
    expect(summary.selections[selection.id].createdAt).toBe("100");
  });

  it("ensureReadingAssistPromptCopySelection primary key upgrades conservatively", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: createReadingAssistPromptCopySelectionId("slot-1"),
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopySelection(
      DEFAULT_READING_ASSIST_PROMPT_COPY_SELECTION_SUMMARY,
      selection
    );
    const selectionUpgrade: ReadingAssistPromptCopySelection = {
      ...selection,
      primaryCopyKey: "copy_compare_soft",
      secondaryCopyKey: "copy_source_peek",
      toneFamily: "calm",
      intensity: "medium",
    };
    summary = ensureReadingAssistPromptCopySelection(summary, selectionUpgrade);
    expect(summary.selections[selection.id].primaryCopyKey).toBe("copy_compare_soft");
    expect(summary.selections[selection.id].secondaryCopyKey).toBe("copy_source_peek");
  });

  it("ensureReadingAssistPromptCopySelection secondary key can fill when later available", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: createReadingAssistPromptCopySelectionId("slot-1"),
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_source_peek",
      secondaryCopyKey: null,
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopySelection(
      DEFAULT_READING_ASSIST_PROMPT_COPY_SELECTION_SUMMARY,
      selection
    );
    const selectionWithSecondary: ReadingAssistPromptCopySelection = {
      ...selection,
      secondaryCopyKey: "copy_explore_gentle",
    };
    summary = ensureReadingAssistPromptCopySelection(summary, selectionWithSecondary);
    expect(summary.selections[selection.id].secondaryCopyKey).toBe("copy_explore_gentle");
  });

  it("ensureReadingAssistPromptCopySelection tone family and intensity upgrade", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: createReadingAssistPromptCopySelectionId("slot-1"),
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopySelection(
      DEFAULT_READING_ASSIST_PROMPT_COPY_SELECTION_SUMMARY,
      selection
    );
    const selectionUpgrade: ReadingAssistPromptCopySelection = {
      ...selection,
      primaryCopyKey: "copy_compare_soft",
      secondaryCopyKey: "copy_source_peek",
      toneFamily: "calm",
      intensity: "medium",
    };
    summary = ensureReadingAssistPromptCopySelection(summary, selectionUpgrade);
    expect(summary.selections[selection.id].toneFamily).toBe("calm");
    expect(summary.selections[selection.id].intensity).toBe("medium");
  });

  it("ensureReadingAssistPromptCopySelection no regression of primary secondary tone intensity", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: createReadingAssistPromptCopySelectionId("slot-1"),
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_compare_soft",
      secondaryCopyKey: "copy_source_peek",
      toneFamily: "calm",
      intensity: "medium",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopySelection(
      DEFAULT_READING_ASSIST_PROMPT_COPY_SELECTION_SUMMARY,
      selection
    );
    const selectionDowngrade: ReadingAssistPromptCopySelection = {
      ...selection,
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneFamily: "neutral_warm",
      intensity: "low",
    };
    summary = ensureReadingAssistPromptCopySelection(summary, selectionDowngrade);
    expect(summary.selections[selection.id].primaryCopyKey).toBe("copy_compare_soft");
    expect(summary.selections[selection.id].secondaryCopyKey).toBe("copy_source_peek");
    expect(summary.selections[selection.id].toneFamily).toBe("calm");
    expect(summary.selections[selection.id].intensity).toBe("medium");
  });

  it("ensurePromptCopySelectionForSlotId creates selection when slot exists", () => {
    const slot: ReadingAssistPromptToneSlot = {
      id: "ra-prompt-tone-slot|sig-1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      signalId: "sig-1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite", "source_peek"],
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    const promptToneSlotSummary: ReadingAssistPromptToneSlotSummary = {
      slots: { [slot.id]: slot },
      slotIds: [slot.id],
    };
    const out = ensurePromptCopySelectionForSlotId(
      DEFAULT_READING_ASSIST_PROMPT_COPY_SELECTION_SUMMARY,
      promptToneSlotSummary,
      slot.id
    );
    expect(out.selectionIds).toHaveLength(1);
    const selectionId = createReadingAssistPromptCopySelectionId(slot.id);
    expect(out.selections[selectionId]).toBeDefined();
    expect(out.selections[selectionId].sentenceId).toBe(slot.sentenceId);
    expect(out.selections[selectionId].anchorId).toBe(slot.anchorId);
    expect(out.selections[selectionId].signalId).toBe(slot.signalId);
    expect(out.selections[selectionId].bundleId).toBe(slot.bundleId);
    expect(out.selections[selectionId].crossLinkId).toBe(slot.crossLinkId);
    expect(out.selections[selectionId].slotId).toBe(slot.id);
    expect(out.selections[selectionId].createdAt).toBe(slot.createdAt);
    expect(out.selections[selectionId].primaryCopyKey).toBe("copy_source_peek");
    expect(out.selections[selectionId].secondaryCopyKey).toBe("copy_explore_gentle");
    expect(out.selections[selectionId].toneFamily).toBe("neutral_warm");
    expect(out.selections[selectionId].intensity).toBe("low");
  });

  it("ensurePromptCopySelectionForSlotId no selection created when slot id missing", () => {
    const promptToneSlotSummary = DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY;
    const out = ensurePromptCopySelectionForSlotId(
      DEFAULT_READING_ASSIST_PROMPT_COPY_SELECTION_SUMMARY,
      promptToneSlotSummary,
      "missing-slot-id"
    );
    expect(out.selectionIds).toHaveLength(0);
    expect(Object.keys(out.selections)).toHaveLength(0);
  });

  it("ensurePromptCopySelectionForSlotId repeated ensure does not duplicate selection", () => {
    const slot: ReadingAssistPromptToneSlot = {
      id: "ra-prompt-tone-slot|sig-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotKinds: ["gentle_nudge", "curious_invite", "source_peek"],
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    const promptToneSlotSummary: ReadingAssistPromptToneSlotSummary = {
      slots: { [slot.id]: slot },
      slotIds: [slot.id],
    };
    let out = ensurePromptCopySelectionForSlotId(
      DEFAULT_READING_ASSIST_PROMPT_COPY_SELECTION_SUMMARY,
      promptToneSlotSummary,
      slot.id
    );
    out = ensurePromptCopySelectionForSlotId(out, promptToneSlotSummary, slot.id);
    expect(out.selectionIds).toHaveLength(1);
  });

  it("eligible sentence path that produces prompt tone slot produces exactly one prompt copy selection", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.promptToneSlotSummary.slotIds).toHaveLength(1);
    expect(next.promptCopySelectionSummary.selectionIds).toHaveLength(1);
    const slotId = next.promptToneSlotSummary.slotIds[0];
    const selectionId = createReadingAssistPromptCopySelectionId(slotId);
    expect(next.promptCopySelectionSummary.selections[selectionId]).toBeDefined();
    expect(next.promptCopySelectionSummary.selections[selectionId].primaryCopyKey).toBe("copy_source_peek");
    expect(next.promptCopySelectionSummary.selections[selectionId].secondaryCopyKey).toBe("copy_explore_gentle");
    expect(next.promptCopySelectionSummary.selections[selectionId].toneFamily).toBe("neutral_warm");
    expect(next.promptCopySelectionSummary.selections[selectionId].intensity).toBe("low");
  });

  it("repeated reduction does not duplicate prompt copy selection", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next1 = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const prev2: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: next1.anchorSummary,
      attachmentRegistry: next1.attachmentRegistry,
      crossLinkSummary: next1.crossLinkSummary,
      verificationBundleSummary: next1.verificationBundleSummary,
      verificationBundleIndexSummary: next1.verificationBundleIndexSummary,
      curiositySignalSummary: next1.curiositySignalSummary,
      promptToneSlotSummary: next1.promptToneSlotSummary,
      promptCopySelectionSummary: next1.promptCopySelectionSummary,
      promptCopyLibraryRecordSummary: next1.promptCopyLibraryRecordSummary,
      markers: next1.markers,
      markerIds: next1.markerIds,
      examinedSentenceIds: next1.examinedSentenceIds,
      sentences: next1.sentences,
    };
    const next2 = reduceReadingAssistReadingPathSummary(prev2, event, heuristic);
    expect(next2.promptCopySelectionSummary.selectionIds).toHaveLength(
      next1.promptCopySelectionSummary.selectionIds.length
    );
  });

  it("revisit that adds disagreement updates same selection to copy_compare_soft copy_source_peek calm medium", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const slotId = next.promptToneSlotSummary.slotIds[0];
    const selectionId = createReadingAssistPromptCopySelectionId(slotId);
    expect(next.promptCopySelectionSummary.selections[selectionId].primaryCopyKey).toBe("copy_compare_soft");
    expect(next.promptCopySelectionSummary.selections[selectionId].secondaryCopyKey).toBe("copy_source_peek");
    expect(next.promptCopySelectionSummary.selections[selectionId].toneFamily).toBe("calm");
    expect(next.promptCopySelectionSummary.selections[selectionId].intensity).toBe("medium");
  });

  it("block-only events do not create prompt copy selections", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.promptCopySelectionSummary.selectionIds).toHaveLength(0);
    expect(Object.keys(next.promptCopySelectionSummary.selections)).toHaveLength(0);
  });

  it("no prompt copy selection when no prompt tone slot exists", () => {
    const promptToneSlotSummary = DEFAULT_READING_ASSIST_PROMPT_TONE_SLOT_SUMMARY;
    const out = ensurePromptCopySelectionForSlotId(
      DEFAULT_READING_ASSIST_PROMPT_COPY_SELECTION_SUMMARY,
      promptToneSlotSummary,
      "any-slot-id"
    );
    expect(out.selectionIds).toHaveLength(0);
    expect(Object.keys(out.selections)).toHaveLength(0);
  });
});

describe("v25 prompt copy library records", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  it("default reading path summary includes promptCopyLibraryRecordSummary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.promptCopyLibraryRecordSummary).toBeDefined();
    expect(r.promptCopyLibraryRecordSummary.records).toEqual({});
    expect(r.promptCopyLibraryRecordSummary.recordIds).toEqual([]);
  });

  it("reset yields empty prompt copy library record summary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(Object.keys(r.promptCopyLibraryRecordSummary.records)).toHaveLength(0);
    expect(r.promptCopyLibraryRecordSummary.recordIds).toHaveLength(0);
  });

  it("createReadingAssistPromptCopyLibraryRecordId returns deterministic id", () => {
    const selectionId = "ra-prompt-copy-selection|slot-1";
    expect(createReadingAssistPromptCopyLibraryRecordId(selectionId)).toBe(
      "ra-prompt-copy-library-record|ra-prompt-copy-selection|slot-1"
    );
    expect(createReadingAssistPromptCopyLibraryRecordId(selectionId)).toBe(
      createReadingAssistPromptCopyLibraryRecordId(selectionId)
    );
  });

  it("deriveReadingAssistPromptCopyLibraryFamily returns library_explore for copy_explore_gentle", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: "sel-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    expect(deriveReadingAssistPromptCopyLibraryFamily(selection)).toBe("library_explore");
  });

  it("deriveReadingAssistPromptCopyLibraryFamily returns library_source for copy_source_peek", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: "sel-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_source_peek",
      secondaryCopyKey: "copy_explore_gentle",
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    expect(deriveReadingAssistPromptCopyLibraryFamily(selection)).toBe("library_source");
  });

  it("deriveReadingAssistPromptCopyLibraryFamily returns library_compare for copy_compare_soft", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: "sel-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_compare_soft",
      secondaryCopyKey: "copy_source_peek",
      toneFamily: "calm",
      intensity: "medium",
      createdAt: "100",
    };
    expect(deriveReadingAssistPromptCopyLibraryFamily(selection)).toBe("library_compare");
  });

  it("deriveReadingAssistPromptCopyLibraryToneProfile returns warm for neutral_warm + low", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: "sel-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    expect(deriveReadingAssistPromptCopyLibraryToneProfile(selection)).toBe("warm");
  });

  it("deriveReadingAssistPromptCopyLibraryToneProfile returns calm for calm toneFamily", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: "sel-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_compare_soft",
      secondaryCopyKey: "copy_source_peek",
      toneFamily: "calm",
      intensity: "medium",
      createdAt: "100",
    };
    expect(deriveReadingAssistPromptCopyLibraryToneProfile(selection)).toBe("calm");
  });

  it("deriveReadingAssistPromptCopyLibraryToneProfile returns calm for medium intensity", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: "sel-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_source_peek",
      secondaryCopyKey: "copy_explore_gentle",
      toneFamily: "neutral_warm",
      intensity: "medium",
      createdAt: "100",
    };
    expect(deriveReadingAssistPromptCopyLibraryToneProfile(selection)).toBe("calm");
  });

  it("deriveReadingAssistPrimaryPromptCopyLibraryVariantKey always returns v1", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: "sel-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_compare_soft",
      secondaryCopyKey: "copy_source_peek",
      toneFamily: "calm",
      intensity: "medium",
      createdAt: "100",
    };
    expect(deriveReadingAssistPrimaryPromptCopyLibraryVariantKey(selection)).toBe("v1");
  });

  it("deriveReadingAssistSecondaryPromptCopyLibraryVariantKey returns v2 when secondaryCopyKey exists", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: "sel-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_source_peek",
      secondaryCopyKey: "copy_explore_gentle",
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    expect(deriveReadingAssistSecondaryPromptCopyLibraryVariantKey(selection)).toBe("v2");
  });

  it("deriveReadingAssistSecondaryPromptCopyLibraryVariantKey returns null when no secondaryCopyKey", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: "sel-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    expect(deriveReadingAssistSecondaryPromptCopyLibraryVariantKey(selection)).toBeNull();
  });

  it("ensureReadingAssistPromptCopyLibraryRecord adds once", () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: createReadingAssistPromptCopyLibraryRecordId("sel-1"),
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      libraryFamily: "library_explore",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneProfile: "warm",
      primaryVariantKey: "v1",
      secondaryVariantKey: null,
      createdAt: "100",
    };
    const summary = ensureReadingAssistPromptCopyLibraryRecord(
      DEFAULT_READING_ASSIST_PROMPT_COPY_LIBRARY_RECORD_SUMMARY,
      record
    );
    expect(summary.recordIds).toHaveLength(1);
    expect(summary.recordIds[0]).toBe(record.id);
    expect(summary.records[record.id]).toEqual(record);
  });

  it("ensureReadingAssistPromptCopyLibraryRecord repeated ensure does not duplicate recordIds", () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: createReadingAssistPromptCopyLibraryRecordId("sel-1"),
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      libraryFamily: "library_explore",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneProfile: "warm",
      primaryVariantKey: "v1",
      secondaryVariantKey: null,
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopyLibraryRecord(
      DEFAULT_READING_ASSIST_PROMPT_COPY_LIBRARY_RECORD_SUMMARY,
      record
    );
    summary = ensureReadingAssistPromptCopyLibraryRecord(summary, record);
    expect(summary.recordIds).toHaveLength(1);
  });

  it("ensureReadingAssistPromptCopyLibraryRecord preserves existing createdAt on re-ensure", () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: createReadingAssistPromptCopyLibraryRecordId("sel-1"),
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      libraryFamily: "library_explore",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneProfile: "warm",
      primaryVariantKey: "v1",
      secondaryVariantKey: null,
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopyLibraryRecord(
      DEFAULT_READING_ASSIST_PROMPT_COPY_LIBRARY_RECORD_SUMMARY,
      record
    );
    const recordLater = { ...record, createdAt: "200" };
    summary = ensureReadingAssistPromptCopyLibraryRecord(summary, recordLater);
    expect(summary.records[record.id].createdAt).toBe("100");
  });

  it("ensureReadingAssistPromptCopyLibraryRecord library family upgrades conservatively", () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: createReadingAssistPromptCopyLibraryRecordId("sel-1"),
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      libraryFamily: "library_explore",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneProfile: "warm",
      primaryVariantKey: "v1",
      secondaryVariantKey: null,
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopyLibraryRecord(
      DEFAULT_READING_ASSIST_PROMPT_COPY_LIBRARY_RECORD_SUMMARY,
      record
    );
    const recordUpgrade: ReadingAssistPromptCopyLibraryRecord = {
      ...record,
      libraryFamily: "library_compare",
      primaryCopyKey: "copy_compare_soft",
      secondaryCopyKey: "copy_source_peek",
      toneProfile: "calm",
      secondaryVariantKey: "v2",
    };
    summary = ensureReadingAssistPromptCopyLibraryRecord(summary, recordUpgrade);
    expect(summary.records[record.id].libraryFamily).toBe("library_compare");
  });

  it("ensureReadingAssistPromptCopyLibraryRecord secondaryCopyKey and secondaryVariantKey can fill when later available", () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: createReadingAssistPromptCopyLibraryRecordId("sel-1"),
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      libraryFamily: "library_source",
      primaryCopyKey: "copy_source_peek",
      secondaryCopyKey: null,
      toneProfile: "warm",
      primaryVariantKey: "v1",
      secondaryVariantKey: null,
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopyLibraryRecord(
      DEFAULT_READING_ASSIST_PROMPT_COPY_LIBRARY_RECORD_SUMMARY,
      record
    );
    const recordWithSecondary: ReadingAssistPromptCopyLibraryRecord = {
      ...record,
      secondaryCopyKey: "copy_explore_gentle",
      secondaryVariantKey: "v2",
    };
    summary = ensureReadingAssistPromptCopyLibraryRecord(summary, recordWithSecondary);
    expect(summary.records[record.id].secondaryCopyKey).toBe("copy_explore_gentle");
    expect(summary.records[record.id].secondaryVariantKey).toBe("v2");
  });

  it("ensureReadingAssistPromptCopyLibraryRecord toneProfile upgrades from warm to calm", () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: createReadingAssistPromptCopyLibraryRecordId("sel-1"),
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      libraryFamily: "library_explore",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneProfile: "warm",
      primaryVariantKey: "v1",
      secondaryVariantKey: null,
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopyLibraryRecord(
      DEFAULT_READING_ASSIST_PROMPT_COPY_LIBRARY_RECORD_SUMMARY,
      record
    );
    const recordCalm: ReadingAssistPromptCopyLibraryRecord = {
      ...record,
      libraryFamily: "library_compare",
      primaryCopyKey: "copy_compare_soft",
      secondaryCopyKey: "copy_source_peek",
      toneProfile: "calm",
      secondaryVariantKey: "v2",
    };
    summary = ensureReadingAssistPromptCopyLibraryRecord(summary, recordCalm);
    expect(summary.records[record.id].toneProfile).toBe("calm");
  });

  it("ensureReadingAssistPromptCopyLibraryRecord no regression of family secondary toneProfile", () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: createReadingAssistPromptCopyLibraryRecordId("sel-1"),
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      libraryFamily: "library_compare",
      primaryCopyKey: "copy_compare_soft",
      secondaryCopyKey: "copy_source_peek",
      toneProfile: "calm",
      primaryVariantKey: "v1",
      secondaryVariantKey: "v2",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopyLibraryRecord(
      DEFAULT_READING_ASSIST_PROMPT_COPY_LIBRARY_RECORD_SUMMARY,
      record
    );
    const recordDowngrade: ReadingAssistPromptCopyLibraryRecord = {
      ...record,
      libraryFamily: "library_explore",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneProfile: "warm",
      secondaryVariantKey: null,
    };
    summary = ensureReadingAssistPromptCopyLibraryRecord(summary, recordDowngrade);
    expect(summary.records[record.id].libraryFamily).toBe("library_compare");
    expect(summary.records[record.id].secondaryCopyKey).toBe("copy_source_peek");
    expect(summary.records[record.id].toneProfile).toBe("calm");
  });

  it("ensurePromptCopyLibraryRecordForSelectionId creates record when selection exists", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: "ra-prompt-copy-selection|slot-1",
      sentenceId: "b1-s0",
      anchorId: createReadingAssistSentenceAnchorId("b1-s0"),
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_source_peek",
      secondaryCopyKey: "copy_explore_gentle",
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    const promptCopySelectionSummary: ReadingAssistPromptCopySelectionSummary = {
      selections: { [selection.id]: selection },
      selectionIds: [selection.id],
    };
    const out = ensurePromptCopyLibraryRecordForSelectionId(
      DEFAULT_READING_ASSIST_PROMPT_COPY_LIBRARY_RECORD_SUMMARY,
      promptCopySelectionSummary,
      selection.id
    );
    expect(out.recordIds).toHaveLength(1);
    const recordId = createReadingAssistPromptCopyLibraryRecordId(selection.id);
    expect(out.records[recordId]).toBeDefined();
    expect(out.records[recordId].sentenceId).toBe(selection.sentenceId);
    expect(out.records[recordId].selectionId).toBe(selection.id);
    expect(out.records[recordId].libraryFamily).toBe("library_source");
    expect(out.records[recordId].primaryCopyKey).toBe("copy_source_peek");
    expect(out.records[recordId].secondaryCopyKey).toBe("copy_explore_gentle");
    expect(out.records[recordId].toneProfile).toBe("warm");
    expect(out.records[recordId].primaryVariantKey).toBe("v1");
    expect(out.records[recordId].secondaryVariantKey).toBe("v2");
  });

  it("ensurePromptCopyLibraryRecordForSelectionId no record created when selection id missing", () => {
    const promptCopySelectionSummary = DEFAULT_READING_ASSIST_PROMPT_COPY_SELECTION_SUMMARY;
    const out = ensurePromptCopyLibraryRecordForSelectionId(
      DEFAULT_READING_ASSIST_PROMPT_COPY_LIBRARY_RECORD_SUMMARY,
      promptCopySelectionSummary,
      "missing-selection-id"
    );
    expect(out.recordIds).toHaveLength(0);
    expect(Object.keys(out.records)).toHaveLength(0);
  });

  it("ensurePromptCopyLibraryRecordForSelectionId repeated ensure does not duplicate record", () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: "ra-prompt-copy-selection|slot-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneFamily: "neutral_warm",
      intensity: "low",
      createdAt: "100",
    };
    const promptCopySelectionSummary: ReadingAssistPromptCopySelectionSummary = {
      selections: { [selection.id]: selection },
      selectionIds: [selection.id],
    };
    let out = ensurePromptCopyLibraryRecordForSelectionId(
      DEFAULT_READING_ASSIST_PROMPT_COPY_LIBRARY_RECORD_SUMMARY,
      promptCopySelectionSummary,
      selection.id
    );
    out = ensurePromptCopyLibraryRecordForSelectionId(out, promptCopySelectionSummary, selection.id);
    expect(out.recordIds).toHaveLength(1);
  });

  it("eligible sentence path that produces prompt copy selection produces exactly one prompt copy library record", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.promptCopySelectionSummary.selectionIds).toHaveLength(1);
    expect(next.promptCopyLibraryRecordSummary.recordIds).toHaveLength(1);
    const selectionId = next.promptCopySelectionSummary.selectionIds[0];
    const recordId = createReadingAssistPromptCopyLibraryRecordId(selectionId);
    expect(next.promptCopyLibraryRecordSummary.records[recordId]).toBeDefined();
    expect(next.promptCopyLibraryRecordSummary.records[recordId].libraryFamily).toBe("library_source");
    expect(next.promptCopyLibraryRecordSummary.records[recordId].primaryCopyKey).toBe("copy_source_peek");
    expect(next.promptCopyLibraryRecordSummary.records[recordId].toneProfile).toBe("warm");
    expect(next.promptCopyLibraryRecordSummary.records[recordId].primaryVariantKey).toBe("v1");
  });

  it("repeated reduction does not duplicate prompt copy library record", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next1 = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const prev2: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: next1.anchorSummary,
      attachmentRegistry: next1.attachmentRegistry,
      crossLinkSummary: next1.crossLinkSummary,
      verificationBundleSummary: next1.verificationBundleSummary,
      verificationBundleIndexSummary: next1.verificationBundleIndexSummary,
      curiositySignalSummary: next1.curiositySignalSummary,
      promptToneSlotSummary: next1.promptToneSlotSummary,
      promptCopySelectionSummary: next1.promptCopySelectionSummary,
      promptCopyLibraryRecordSummary: next1.promptCopyLibraryRecordSummary,
      promptCopyCatalogBindingSummary: next1.promptCopyCatalogBindingSummary,
      markers: next1.markers,
      markerIds: next1.markerIds,
      examinedSentenceIds: next1.examinedSentenceIds,
      sentences: next1.sentences,
    };
    const next2 = reduceReadingAssistReadingPathSummary(prev2, event, heuristic);
    expect(next2.promptCopyLibraryRecordSummary.recordIds).toHaveLength(
      next1.promptCopyLibraryRecordSummary.recordIds.length
    );
  });

  it("revisit that adds disagreement updates same record to library_compare copy_compare_soft copy_source_peek calm v2", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const selectionId = next.promptCopySelectionSummary.selectionIds[0];
    const recordId = createReadingAssistPromptCopyLibraryRecordId(selectionId);
    expect(next.promptCopyLibraryRecordSummary.records[recordId].libraryFamily).toBe("library_compare");
    expect(next.promptCopyLibraryRecordSummary.records[recordId].primaryCopyKey).toBe("copy_compare_soft");
    expect(next.promptCopyLibraryRecordSummary.records[recordId].secondaryCopyKey).toBe("copy_source_peek");
    expect(next.promptCopyLibraryRecordSummary.records[recordId].toneProfile).toBe("calm");
    expect(next.promptCopyLibraryRecordSummary.records[recordId].secondaryVariantKey).toBe("v2");
  });

  it("block-only events do not create prompt copy library records", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.promptCopyLibraryRecordSummary.recordIds).toHaveLength(0);
    expect(Object.keys(next.promptCopyLibraryRecordSummary.records)).toHaveLength(0);
  });

  it("no prompt copy library record when no prompt copy selection exists", () => {
    const promptCopySelectionSummary = DEFAULT_READING_ASSIST_PROMPT_COPY_SELECTION_SUMMARY;
    const out = ensurePromptCopyLibraryRecordForSelectionId(
      DEFAULT_READING_ASSIST_PROMPT_COPY_LIBRARY_RECORD_SUMMARY,
      promptCopySelectionSummary,
      "any-selection-id"
    );
    expect(out.recordIds).toHaveLength(0);
    expect(Object.keys(out.records)).toHaveLength(0);
  });
});

describe("v26 prompt copy catalog bindings", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  const EXPECTED_CATALOG_ENTRY_IDS: ReadingAssistPromptCopyCatalogEntryId[] = [
    "catalog_explore_warm_v1",
    "catalog_explore_warm_v2",
    "catalog_source_warm_v1",
    "catalog_source_warm_v2",
    "catalog_compare_calm_v1",
    "catalog_compare_calm_v2",
  ];

  it("default reading path summary includes promptCopyCatalogBindingSummary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.promptCopyCatalogBindingSummary).toBeDefined();
    expect(r.promptCopyCatalogBindingSummary.bindings).toEqual({});
    expect(r.promptCopyCatalogBindingSummary.bindingIds).toEqual([]);
  });

  it("reset yields empty prompt copy catalog binding summary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(Object.keys(r.promptCopyCatalogBindingSummary.bindings)).toHaveLength(0);
    expect(r.promptCopyCatalogBindingSummary.bindingIds).toHaveLength(0);
  });

  it("READING_ASSIST_PROMPT_COPY_CATALOG contains exactly the 6 expected ids", () => {
    expect(Object.keys(READING_ASSIST_PROMPT_COPY_CATALOG).sort()).toEqual(
      EXPECTED_CATALOG_ENTRY_IDS.slice().sort()
    );
  });

  it("each catalog entry has expected family tone variant actionKey", () => {
    expect(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_explore_warm_v1.libraryFamily).toBe("library_explore");
    expect(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_explore_warm_v1.toneProfile).toBe("warm");
    expect(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_explore_warm_v1.variantKey).toBe("v1");
    expect(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_explore_warm_v1.actionKey).toBe("look_closer");
    expect(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_source_warm_v1.actionKey).toBe("see_source");
    expect(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_compare_calm_v1.actionKey).toBe("compare_views");
  });

  it("each catalog entry has non-empty title and body", () => {
    for (const id of EXPECTED_CATALOG_ENTRY_IDS) {
      const entry = READING_ASSIST_PROMPT_COPY_CATALOG[id];
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.body.length).toBeGreaterThan(0);
    }
  });

  it("createReadingAssistPromptCopyCatalogBindingId returns deterministic id", () => {
    const recordId = "ra-prompt-copy-library-record|sel-1";
    expect(createReadingAssistPromptCopyCatalogBindingId(recordId)).toBe(
      "ra-prompt-copy-catalog-binding|ra-prompt-copy-library-record|sel-1"
    );
    expect(createReadingAssistPromptCopyCatalogBindingId(recordId)).toBe(
      createReadingAssistPromptCopyCatalogBindingId(recordId)
    );
  });

  it("deriveReadingAssistPrimaryPromptCopyCatalogEntryId library_explore returns catalog_explore_warm_v1", () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: "rec-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      libraryFamily: "library_explore",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneProfile: "warm",
      primaryVariantKey: "v1",
      secondaryVariantKey: null,
      createdAt: "100",
    };
    expect(deriveReadingAssistPrimaryPromptCopyCatalogEntryId(record)).toBe("catalog_explore_warm_v1");
  });

  it("deriveReadingAssistPrimaryPromptCopyCatalogEntryId library_source returns catalog_source_warm_v1", () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: "rec-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      libraryFamily: "library_source",
      primaryCopyKey: "copy_source_peek",
      secondaryCopyKey: null,
      toneProfile: "warm",
      primaryVariantKey: "v1",
      secondaryVariantKey: null,
      createdAt: "100",
    };
    expect(deriveReadingAssistPrimaryPromptCopyCatalogEntryId(record)).toBe("catalog_source_warm_v1");
  });

  it("deriveReadingAssistPrimaryPromptCopyCatalogEntryId library_compare returns catalog_compare_calm_v1", () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: "rec-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      libraryFamily: "library_compare",
      primaryCopyKey: "copy_compare_soft",
      secondaryCopyKey: "copy_source_peek",
      toneProfile: "calm",
      primaryVariantKey: "v1",
      secondaryVariantKey: "v2",
      createdAt: "100",
    };
    expect(deriveReadingAssistPrimaryPromptCopyCatalogEntryId(record)).toBe("catalog_compare_calm_v1");
  });

  it("deriveReadingAssistSecondaryPromptCopyCatalogEntryId record with family explore + secondaryVariantKey v2 returns catalog_explore_warm_v2", () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: "rec-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      libraryFamily: "library_explore",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: "copy_explore_gentle",
      toneProfile: "warm",
      primaryVariantKey: "v1",
      secondaryVariantKey: "v2",
      createdAt: "100",
    };
    expect(deriveReadingAssistSecondaryPromptCopyCatalogEntryId(record)).toBe("catalog_explore_warm_v2");
  });

  it("deriveReadingAssistSecondaryPromptCopyCatalogEntryId record with family source + secondaryVariantKey v2 returns catalog_source_warm_v2", () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: "rec-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      libraryFamily: "library_source",
      primaryCopyKey: "copy_source_peek",
      secondaryCopyKey: "copy_explore_gentle",
      toneProfile: "warm",
      primaryVariantKey: "v1",
      secondaryVariantKey: "v2",
      createdAt: "100",
    };
    expect(deriveReadingAssistSecondaryPromptCopyCatalogEntryId(record)).toBe("catalog_source_warm_v2");
  });

  it("deriveReadingAssistSecondaryPromptCopyCatalogEntryId record with family compare + secondaryVariantKey v2 returns catalog_compare_calm_v2", () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: "rec-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      libraryFamily: "library_compare",
      primaryCopyKey: "copy_compare_soft",
      secondaryCopyKey: "copy_source_peek",
      toneProfile: "calm",
      primaryVariantKey: "v1",
      secondaryVariantKey: "v2",
      createdAt: "100",
    };
    expect(deriveReadingAssistSecondaryPromptCopyCatalogEntryId(record)).toBe("catalog_compare_calm_v2");
  });

  it("deriveReadingAssistSecondaryPromptCopyCatalogEntryId returns null when no secondaryVariantKey", () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: "rec-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      libraryFamily: "library_explore",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneProfile: "warm",
      primaryVariantKey: "v1",
      secondaryVariantKey: null,
      createdAt: "100",
    };
    expect(deriveReadingAssistSecondaryPromptCopyCatalogEntryId(record)).toBeNull();
  });

  it("ensureReadingAssistPromptCopyCatalogBinding adds once", () => {
    const binding: ReadingAssistPromptCopyCatalogBinding = {
      id: createReadingAssistPromptCopyCatalogBindingId("rec-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
      createdAt: "100",
    };
    const summary = ensureReadingAssistPromptCopyCatalogBinding(
      DEFAULT_READING_ASSIST_PROMPT_COPY_CATALOG_BINDING_SUMMARY,
      binding
    );
    expect(summary.bindingIds).toHaveLength(1);
    expect(summary.bindingIds[0]).toBe(binding.id);
    expect(summary.bindings[binding.id]).toEqual(binding);
  });

  it("ensureReadingAssistPromptCopyCatalogBinding repeated ensure does not duplicate bindingIds", () => {
    const binding: ReadingAssistPromptCopyCatalogBinding = {
      id: createReadingAssistPromptCopyCatalogBindingId("rec-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopyCatalogBinding(
      DEFAULT_READING_ASSIST_PROMPT_COPY_CATALOG_BINDING_SUMMARY,
      binding
    );
    summary = ensureReadingAssistPromptCopyCatalogBinding(summary, binding);
    expect(summary.bindingIds).toHaveLength(1);
  });

  it("ensureReadingAssistPromptCopyCatalogBinding preserves existing createdAt on re-ensure", () => {
    const binding: ReadingAssistPromptCopyCatalogBinding = {
      id: createReadingAssistPromptCopyCatalogBindingId("rec-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopyCatalogBinding(
      DEFAULT_READING_ASSIST_PROMPT_COPY_CATALOG_BINDING_SUMMARY,
      binding
    );
    const bindingLater = { ...binding, createdAt: "200" };
    summary = ensureReadingAssistPromptCopyCatalogBinding(summary, bindingLater);
    expect(summary.bindings[binding.id].createdAt).toBe("100");
  });

  it("ensureReadingAssistPromptCopyCatalogBinding primary entry upgrades conservatively", () => {
    const binding: ReadingAssistPromptCopyCatalogBinding = {
      id: createReadingAssistPromptCopyCatalogBindingId("rec-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopyCatalogBinding(
      DEFAULT_READING_ASSIST_PROMPT_COPY_CATALOG_BINDING_SUMMARY,
      binding
    );
    const bindingUpgrade: ReadingAssistPromptCopyCatalogBinding = {
      ...binding,
      primaryCatalogEntryId: "catalog_compare_calm_v1",
      secondaryCatalogEntryId: "catalog_compare_calm_v2",
    };
    summary = ensureReadingAssistPromptCopyCatalogBinding(summary, bindingUpgrade);
    expect(summary.bindings[binding.id].primaryCatalogEntryId).toBe("catalog_compare_calm_v1");
  });

  it("ensureReadingAssistPromptCopyCatalogBinding secondary entry can fill when later available", () => {
    const binding: ReadingAssistPromptCopyCatalogBinding = {
      id: createReadingAssistPromptCopyCatalogBindingId("rec-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      primaryCatalogEntryId: "catalog_source_warm_v1",
      secondaryCatalogEntryId: null,
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopyCatalogBinding(
      DEFAULT_READING_ASSIST_PROMPT_COPY_CATALOG_BINDING_SUMMARY,
      binding
    );
    const bindingWithSecondary: ReadingAssistPromptCopyCatalogBinding = {
      ...binding,
      secondaryCatalogEntryId: "catalog_source_warm_v2",
    };
    summary = ensureReadingAssistPromptCopyCatalogBinding(summary, bindingWithSecondary);
    expect(summary.bindings[binding.id].secondaryCatalogEntryId).toBe("catalog_source_warm_v2");
  });

  it("ensureReadingAssistPromptCopyCatalogBinding no regression of primary secondary", () => {
    const binding: ReadingAssistPromptCopyCatalogBinding = {
      id: createReadingAssistPromptCopyCatalogBindingId("rec-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      primaryCatalogEntryId: "catalog_compare_calm_v1",
      secondaryCatalogEntryId: "catalog_compare_calm_v2",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptCopyCatalogBinding(
      DEFAULT_READING_ASSIST_PROMPT_COPY_CATALOG_BINDING_SUMMARY,
      binding
    );
    const bindingDowngrade: ReadingAssistPromptCopyCatalogBinding = {
      ...binding,
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
    };
    summary = ensureReadingAssistPromptCopyCatalogBinding(summary, bindingDowngrade);
    expect(summary.bindings[binding.id].primaryCatalogEntryId).toBe("catalog_compare_calm_v1");
    expect(summary.bindings[binding.id].secondaryCatalogEntryId).toBe("catalog_compare_calm_v2");
  });

  it("ensurePromptCopyCatalogBindingForRecordId creates binding when record exists", () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: "ra-prompt-copy-library-record|sel-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      libraryFamily: "library_source",
      primaryCopyKey: "copy_source_peek",
      secondaryCopyKey: "copy_explore_gentle",
      toneProfile: "warm",
      primaryVariantKey: "v1",
      secondaryVariantKey: "v2",
      createdAt: "100",
    };
    const promptCopyLibraryRecordSummary: ReadingAssistPromptCopyLibraryRecordSummary = {
      records: { [record.id]: record },
      recordIds: [record.id],
    };
    const out = ensurePromptCopyCatalogBindingForRecordId(
      DEFAULT_READING_ASSIST_PROMPT_COPY_CATALOG_BINDING_SUMMARY,
      promptCopyLibraryRecordSummary,
      record.id
    );
    expect(out.bindingIds).toHaveLength(1);
    const bindingId = createReadingAssistPromptCopyCatalogBindingId(record.id);
    expect(out.bindings[bindingId]).toBeDefined();
    expect(out.bindings[bindingId].sentenceId).toBe(record.sentenceId);
    expect(out.bindings[bindingId].recordId).toBe(record.id);
    expect(out.bindings[bindingId].primaryCatalogEntryId).toBe("catalog_source_warm_v1");
    expect(out.bindings[bindingId].secondaryCatalogEntryId).toBe("catalog_source_warm_v2");
  });

  it("ensurePromptCopyCatalogBindingForRecordId no binding created when record id missing", () => {
    const promptCopyLibraryRecordSummary = DEFAULT_READING_ASSIST_PROMPT_COPY_LIBRARY_RECORD_SUMMARY;
    const out = ensurePromptCopyCatalogBindingForRecordId(
      DEFAULT_READING_ASSIST_PROMPT_COPY_CATALOG_BINDING_SUMMARY,
      promptCopyLibraryRecordSummary,
      "missing-record-id"
    );
    expect(out.bindingIds).toHaveLength(0);
    expect(Object.keys(out.bindings)).toHaveLength(0);
  });

  it("ensurePromptCopyCatalogBindingForRecordId repeated ensure does not duplicate binding", () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: "ra-prompt-copy-library-record|sel-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      libraryFamily: "library_explore",
      primaryCopyKey: "copy_explore_gentle",
      secondaryCopyKey: null,
      toneProfile: "warm",
      primaryVariantKey: "v1",
      secondaryVariantKey: null,
      createdAt: "100",
    };
    const promptCopyLibraryRecordSummary: ReadingAssistPromptCopyLibraryRecordSummary = {
      records: { [record.id]: record },
      recordIds: [record.id],
    };
    let out = ensurePromptCopyCatalogBindingForRecordId(
      DEFAULT_READING_ASSIST_PROMPT_COPY_CATALOG_BINDING_SUMMARY,
      promptCopyLibraryRecordSummary,
      record.id
    );
    out = ensurePromptCopyCatalogBindingForRecordId(out, promptCopyLibraryRecordSummary, record.id);
    expect(out.bindingIds).toHaveLength(1);
  });

  it("eligible sentence path that produces prompt copy library record also produces exactly one prompt copy catalog binding", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.promptCopyLibraryRecordSummary.recordIds).toHaveLength(1);
    expect(next.promptCopyCatalogBindingSummary.bindingIds).toHaveLength(1);
    const recordId = next.promptCopyLibraryRecordSummary.recordIds[0];
    const bindingId = createReadingAssistPromptCopyCatalogBindingId(recordId);
    expect(next.promptCopyCatalogBindingSummary.bindings[bindingId]).toBeDefined();
    expect(next.promptCopyCatalogBindingSummary.bindings[bindingId].primaryCatalogEntryId).toBe(
      "catalog_source_warm_v1"
    );
    expect(next.promptCopyCatalogBindingSummary.bindings[bindingId].secondaryCatalogEntryId).toBe(
      "catalog_source_warm_v2"
    );
  });

  it("repeated reduction does not duplicate prompt copy catalog binding", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next1 = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const prev2: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: next1.anchorSummary,
      attachmentRegistry: next1.attachmentRegistry,
      crossLinkSummary: next1.crossLinkSummary,
      verificationBundleSummary: next1.verificationBundleSummary,
      verificationBundleIndexSummary: next1.verificationBundleIndexSummary,
      curiositySignalSummary: next1.curiositySignalSummary,
      promptToneSlotSummary: next1.promptToneSlotSummary,
      promptCopySelectionSummary: next1.promptCopySelectionSummary,
      promptCopyLibraryRecordSummary: next1.promptCopyLibraryRecordSummary,
      promptCopyCatalogBindingSummary: next1.promptCopyCatalogBindingSummary,
      promptPresentationRecordSummary: next1.promptPresentationRecordSummary,
      promptSurfaceCandidateSummary: next1.promptSurfaceCandidateSummary,
      promptMountPlanSummary: next1.promptMountPlanSummary,
      markers: next1.markers,
      markerIds: next1.markerIds,
      examinedSentenceIds: next1.examinedSentenceIds,
      sentences: next1.sentences,
    };
    const next2 = reduceReadingAssistReadingPathSummary(prev2, event, heuristic);
    expect(next2.promptCopyCatalogBindingSummary.bindingIds).toHaveLength(
      next1.promptCopyCatalogBindingSummary.bindingIds.length
    );
  });

  it("revisit that adds disagreement updates same binding to catalog_compare_calm_v1 catalog_compare_calm_v2", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const recordId = next.promptCopyLibraryRecordSummary.recordIds[0];
    const bindingId = createReadingAssistPromptCopyCatalogBindingId(recordId);
    expect(next.promptCopyCatalogBindingSummary.bindings[bindingId].primaryCatalogEntryId).toBe(
      "catalog_compare_calm_v1"
    );
    expect(next.promptCopyCatalogBindingSummary.bindings[bindingId].secondaryCatalogEntryId).toBe(
      "catalog_compare_calm_v2"
    );
  });

  it("block-only events do not create prompt copy catalog bindings", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.promptCopyCatalogBindingSummary.bindingIds).toHaveLength(0);
    expect(Object.keys(next.promptCopyCatalogBindingSummary.bindings)).toHaveLength(0);
  });

  it("no prompt copy catalog binding when no prompt copy library record exists", () => {
    const promptCopyLibraryRecordSummary = DEFAULT_READING_ASSIST_PROMPT_COPY_LIBRARY_RECORD_SUMMARY;
    const out = ensurePromptCopyCatalogBindingForRecordId(
      DEFAULT_READING_ASSIST_PROMPT_COPY_CATALOG_BINDING_SUMMARY,
      promptCopyLibraryRecordSummary,
      "any-record-id"
    );
    expect(out.bindingIds).toHaveLength(0);
    expect(Object.keys(out.bindings)).toHaveLength(0);
  });
});

describe("v27 prompt presentation records", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  it("default reading path summary includes promptPresentationRecordSummary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.promptPresentationRecordSummary).toBeDefined();
    expect(r.promptPresentationRecordSummary.records).toEqual({});
    expect(r.promptPresentationRecordSummary.recordIds).toEqual([]);
  });

  it("reset yields empty prompt presentation record summary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(Object.keys(r.promptPresentationRecordSummary.records)).toHaveLength(0);
    expect(r.promptPresentationRecordSummary.recordIds).toHaveLength(0);
  });

  it("createReadingAssistPromptPresentationRecordId returns deterministic id", () => {
    const bindingId = "ra-prompt-copy-catalog-binding|rec-1";
    expect(createReadingAssistPromptPresentationRecordId(bindingId)).toBe(
      "ra-prompt-presentation-record|ra-prompt-copy-catalog-binding|rec-1"
    );
    expect(createReadingAssistPromptPresentationRecordId(bindingId)).toBe(
      createReadingAssistPromptPresentationRecordId(bindingId)
    );
  });

  it("deriveReadingAssistPromptPresentationPosture compare primary returns inline_compare", () => {
    const binding: ReadingAssistPromptCopyCatalogBinding = {
      id: "bind-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      primaryCatalogEntryId: "catalog_compare_calm_v1",
      secondaryCatalogEntryId: "catalog_compare_calm_v2",
      createdAt: "100",
    };
    expect(deriveReadingAssistPromptPresentationPosture(binding)).toBe("inline_compare");
  });

  it("deriveReadingAssistPromptPresentationPosture source primary returns inline_source", () => {
    const binding: ReadingAssistPromptCopyCatalogBinding = {
      id: "bind-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      primaryCatalogEntryId: "catalog_source_warm_v1",
      secondaryCatalogEntryId: "catalog_source_warm_v2",
      createdAt: "100",
    };
    expect(deriveReadingAssistPromptPresentationPosture(binding)).toBe("inline_source");
  });

  it("deriveReadingAssistPromptPresentationPosture explore primary returns inline_gentle", () => {
    const binding: ReadingAssistPromptCopyCatalogBinding = {
      id: "bind-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
      createdAt: "100",
    };
    expect(deriveReadingAssistPromptPresentationPosture(binding)).toBe("inline_gentle");
  });

  it("deriveReadingAssistPromptVisibilityReadiness always returns eligible in v27", () => {
    const binding: ReadingAssistPromptCopyCatalogBinding = {
      id: "bind-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
      createdAt: "100",
    };
    expect(deriveReadingAssistPromptVisibilityReadiness(binding)).toBe("eligible");
  });

  it("ensureReadingAssistPromptPresentationRecord adds once", () => {
    const record: ReadingAssistPromptPresentationRecord = {
      id: createReadingAssistPromptPresentationRecordId("bind-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      bindingId: "bind-1",
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
      title: "Something interesting is happening here.",
      body: "This sentence feels worth a closer look.",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      createdAt: "100",
    };
    const summary = ensureReadingAssistPromptPresentationRecord(
      DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY,
      record
    );
    expect(summary.recordIds).toHaveLength(1);
    expect(summary.recordIds[0]).toBe(record.id);
    expect(summary.records[record.id]).toEqual(record);
  });

  it("ensureReadingAssistPromptPresentationRecord repeated ensure does not duplicate recordIds", () => {
    const record: ReadingAssistPromptPresentationRecord = {
      id: createReadingAssistPromptPresentationRecordId("bind-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      bindingId: "bind-1",
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
      title: "Something interesting is happening here.",
      body: "This sentence feels worth a closer look.",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptPresentationRecord(
      DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY,
      record
    );
    summary = ensureReadingAssistPromptPresentationRecord(summary, record);
    expect(summary.recordIds).toHaveLength(1);
  });

  it("ensureReadingAssistPromptPresentationRecord preserves existing createdAt on re-ensure", () => {
    const record: ReadingAssistPromptPresentationRecord = {
      id: createReadingAssistPromptPresentationRecordId("bind-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      bindingId: "bind-1",
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
      title: "Something interesting is happening here.",
      body: "This sentence feels worth a closer look.",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptPresentationRecord(
      DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY,
      record
    );
    const recordLater = { ...record, createdAt: "200" };
    summary = ensureReadingAssistPromptPresentationRecord(summary, recordLater);
    expect(summary.records[record.id].createdAt).toBe("100");
  });

  it("ensureReadingAssistPromptPresentationRecord primary entry upgrades conservatively", () => {
    const record: ReadingAssistPromptPresentationRecord = {
      id: createReadingAssistPromptPresentationRecordId("bind-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      bindingId: "bind-1",
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
      title: "Something interesting is happening here.",
      body: "This sentence feels worth a closer look.",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptPresentationRecord(
      DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY,
      record
    );
    const recordUpgrade: ReadingAssistPromptPresentationRecord = {
      ...record,
      primaryCatalogEntryId: "catalog_compare_calm_v1",
      secondaryCatalogEntryId: "catalog_compare_calm_v2",
      title: "There's more than one way to read this.",
      body: "A softer comparison might help here.",
      actionKey: "compare_views",
      posture: "inline_compare",
    };
    summary = ensureReadingAssistPromptPresentationRecord(summary, recordUpgrade);
    expect(summary.records[record.id].primaryCatalogEntryId).toBe("catalog_compare_calm_v1");
    expect(summary.records[record.id].posture).toBe("inline_compare");
  });

  it("ensureReadingAssistPromptPresentationRecord secondary entry can fill when later available", () => {
    const record: ReadingAssistPromptPresentationRecord = {
      id: createReadingAssistPromptPresentationRecordId("bind-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      bindingId: "bind-1",
      primaryCatalogEntryId: "catalog_source_warm_v1",
      secondaryCatalogEntryId: null,
      title: "There's something behind this idea.",
      body: "You can trace where this point is coming from.",
      actionKey: "see_source",
      posture: "inline_source",
      readiness: "eligible",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptPresentationRecord(
      DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY,
      record
    );
    const recordWithSecondary: ReadingAssistPromptPresentationRecord = {
      ...record,
      secondaryCatalogEntryId: "catalog_source_warm_v2",
    };
    summary = ensureReadingAssistPromptPresentationRecord(summary, recordWithSecondary);
    expect(summary.records[record.id].secondaryCatalogEntryId).toBe("catalog_source_warm_v2");
  });

  it("ensureReadingAssistPromptPresentationRecord title body actionKey update when primary upgrades", () => {
    const record: ReadingAssistPromptPresentationRecord = {
      id: createReadingAssistPromptPresentationRecordId("bind-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      bindingId: "bind-1",
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
      title: "Something interesting is happening here.",
      body: "This sentence feels worth a closer look.",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptPresentationRecord(
      DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY,
      record
    );
    const recordUpgrade: ReadingAssistPromptPresentationRecord = {
      ...record,
      primaryCatalogEntryId: "catalog_compare_calm_v1",
      title: "There's more than one way to read this.",
      body: "A softer comparison might help here.",
      actionKey: "compare_views",
      posture: "inline_compare",
    };
    summary = ensureReadingAssistPromptPresentationRecord(summary, recordUpgrade);
    expect(summary.records[record.id].title).toBe("There's more than one way to read this.");
    expect(summary.records[record.id].body).toBe("A softer comparison might help here.");
    expect(summary.records[record.id].actionKey).toBe("compare_views");
  });

  it("ensureReadingAssistPromptPresentationRecord posture upgrades when primary upgrades", () => {
    const record: ReadingAssistPromptPresentationRecord = {
      id: createReadingAssistPromptPresentationRecordId("bind-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      bindingId: "bind-1",
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
      title: "Something interesting is happening here.",
      body: "This sentence feels worth a closer look.",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptPresentationRecord(
      DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY,
      record
    );
    const recordUpgrade: ReadingAssistPromptPresentationRecord = {
      ...record,
      primaryCatalogEntryId: "catalog_source_warm_v1",
      title: "There's something behind this idea.",
      body: "You can trace where this point is coming from.",
      actionKey: "see_source",
      posture: "inline_source",
    };
    summary = ensureReadingAssistPromptPresentationRecord(summary, recordUpgrade);
    expect(summary.records[record.id].posture).toBe("inline_source");
  });

  it("ensureReadingAssistPromptPresentationRecord no regression of primary secondary posture", () => {
    const record: ReadingAssistPromptPresentationRecord = {
      id: createReadingAssistPromptPresentationRecordId("bind-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      bindingId: "bind-1",
      primaryCatalogEntryId: "catalog_compare_calm_v1",
      secondaryCatalogEntryId: "catalog_compare_calm_v2",
      title: "There's more than one way to read this.",
      body: "A softer comparison might help here.",
      actionKey: "compare_views",
      posture: "inline_compare",
      readiness: "eligible",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptPresentationRecord(
      DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY,
      record
    );
    const recordDowngrade: ReadingAssistPromptPresentationRecord = {
      ...record,
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
      title: "Something interesting is happening here.",
      body: "This sentence feels worth a closer look.",
      actionKey: "look_closer",
      posture: "inline_gentle",
    };
    summary = ensureReadingAssistPromptPresentationRecord(summary, recordDowngrade);
    expect(summary.records[record.id].primaryCatalogEntryId).toBe("catalog_compare_calm_v1");
    expect(summary.records[record.id].secondaryCatalogEntryId).toBe("catalog_compare_calm_v2");
    expect(summary.records[record.id].posture).toBe("inline_compare");
  });

  it("ensurePromptPresentationRecordForBindingId creates presentation record when binding exists", () => {
    const binding: ReadingAssistPromptCopyCatalogBinding = {
      id: "ra-prompt-copy-catalog-binding|rec-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      primaryCatalogEntryId: "catalog_source_warm_v1",
      secondaryCatalogEntryId: "catalog_source_warm_v2",
      createdAt: "100",
    };
    const promptCopyCatalogBindingSummary: ReadingAssistPromptCopyCatalogBindingSummary = {
      bindings: { [binding.id]: binding },
      bindingIds: [binding.id],
    };
    const out = ensurePromptPresentationRecordForBindingId(
      DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY,
      promptCopyCatalogBindingSummary,
      binding.id
    );
    expect(out.recordIds).toHaveLength(1);
    const recordId = createReadingAssistPromptPresentationRecordId(binding.id);
    expect(out.records[recordId]).toBeDefined();
    expect(out.records[recordId].sentenceId).toBe(binding.sentenceId);
    expect(out.records[recordId].bindingId).toBe(binding.id);
    expect(out.records[recordId].primaryCatalogEntryId).toBe("catalog_source_warm_v1");
    expect(out.records[recordId].title).toBe(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_source_warm_v1.title);
    expect(out.records[recordId].body).toBe(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_source_warm_v1.body);
    expect(out.records[recordId].actionKey).toBe("see_source");
    expect(out.records[recordId].posture).toBe("inline_source");
    expect(out.records[recordId].readiness).toBe("eligible");
  });

  it("ensurePromptPresentationRecordForBindingId no record created when binding id missing", () => {
    const promptCopyCatalogBindingSummary = DEFAULT_READING_ASSIST_PROMPT_COPY_CATALOG_BINDING_SUMMARY;
    const out = ensurePromptPresentationRecordForBindingId(
      DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY,
      promptCopyCatalogBindingSummary,
      "missing-binding-id"
    );
    expect(out.recordIds).toHaveLength(0);
    expect(Object.keys(out.records)).toHaveLength(0);
  });

  it("ensurePromptPresentationRecordForBindingId repeated ensure does not duplicate record", () => {
    const binding: ReadingAssistPromptCopyCatalogBinding = {
      id: "ra-prompt-copy-catalog-binding|rec-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "rec-1",
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
      createdAt: "100",
    };
    const promptCopyCatalogBindingSummary: ReadingAssistPromptCopyCatalogBindingSummary = {
      bindings: { [binding.id]: binding },
      bindingIds: [binding.id],
    };
    let out = ensurePromptPresentationRecordForBindingId(
      DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY,
      promptCopyCatalogBindingSummary,
      binding.id
    );
    out = ensurePromptPresentationRecordForBindingId(out, promptCopyCatalogBindingSummary, binding.id);
    expect(out.recordIds).toHaveLength(1);
  });

  it("eligible sentence path that produces prompt copy catalog binding also produces exactly one prompt presentation record", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.promptCopyCatalogBindingSummary.bindingIds).toHaveLength(1);
    expect(next.promptPresentationRecordSummary.recordIds).toHaveLength(1);
    const bindingId = next.promptCopyCatalogBindingSummary.bindingIds[0];
    const recordId = createReadingAssistPromptPresentationRecordId(bindingId);
    expect(next.promptPresentationRecordSummary.records[recordId]).toBeDefined();
    const rec = next.promptPresentationRecordSummary.records[recordId];
    expect(rec.primaryCatalogEntryId).toBe("catalog_source_warm_v1");
    expect(rec.title).toBe(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_source_warm_v1.title);
    expect(rec.body).toBe(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_source_warm_v1.body);
    expect(rec.actionKey).toBe("see_source");
    expect(rec.posture).toBe("inline_source");
    expect(rec.readiness).toBe("eligible");
  });

  it("repeated reduction does not duplicate prompt presentation record", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next1 = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const prev2: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: next1.anchorSummary,
      attachmentRegistry: next1.attachmentRegistry,
      crossLinkSummary: next1.crossLinkSummary,
      verificationBundleSummary: next1.verificationBundleSummary,
      verificationBundleIndexSummary: next1.verificationBundleIndexSummary,
      curiositySignalSummary: next1.curiositySignalSummary,
      promptToneSlotSummary: next1.promptToneSlotSummary,
      promptCopySelectionSummary: next1.promptCopySelectionSummary,
      promptCopyLibraryRecordSummary: next1.promptCopyLibraryRecordSummary,
      promptCopyCatalogBindingSummary: next1.promptCopyCatalogBindingSummary,
      promptPresentationRecordSummary: next1.promptPresentationRecordSummary,
      promptSurfaceCandidateSummary: next1.promptSurfaceCandidateSummary,
      promptMountPlanSummary: next1.promptMountPlanSummary,
      markers: next1.markers,
      markerIds: next1.markerIds,
      examinedSentenceIds: next1.examinedSentenceIds,
      sentences: next1.sentences,
    };
    const next2 = reduceReadingAssistReadingPathSummary(prev2, event, heuristic);
    expect(next2.promptPresentationRecordSummary.recordIds).toHaveLength(
      next1.promptPresentationRecordSummary.recordIds.length
    );
  });

  it("revisit that adds disagreement updates same record to catalog_compare_calm_v1 catalog_compare_calm_v2 compare title body actionKey posture inline_compare", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const bindingId = next.promptCopyCatalogBindingSummary.bindingIds[0];
    const recordId = createReadingAssistPromptPresentationRecordId(bindingId);
    const rec = next.promptPresentationRecordSummary.records[recordId];
    expect(rec.primaryCatalogEntryId).toBe("catalog_compare_calm_v1");
    expect(rec.secondaryCatalogEntryId).toBe("catalog_compare_calm_v2");
    expect(rec.title).toBe(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_compare_calm_v1.title);
    expect(rec.body).toBe(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_compare_calm_v1.body);
    expect(rec.actionKey).toBe("compare_views");
    expect(rec.posture).toBe("inline_compare");
  });

  it("block-only events do not create prompt presentation records", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.promptPresentationRecordSummary.recordIds).toHaveLength(0);
    expect(Object.keys(next.promptPresentationRecordSummary.records)).toHaveLength(0);
  });

  it("no prompt presentation record when no prompt copy catalog binding exists", () => {
    const promptCopyCatalogBindingSummary = DEFAULT_READING_ASSIST_PROMPT_COPY_CATALOG_BINDING_SUMMARY;
    const out = ensurePromptPresentationRecordForBindingId(
      DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY,
      promptCopyCatalogBindingSummary,
      "any-binding-id"
    );
    expect(out.recordIds).toHaveLength(0);
    expect(Object.keys(out.records)).toHaveLength(0);
  });
});

describe("v28 prompt surface candidates", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>,
    backtrackCount = 0
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
        backtrackCount,
      },
    };
  }

  it("default reading path summary includes promptSurfaceCandidateSummary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.promptSurfaceCandidateSummary).toBeDefined();
    expect(r.promptSurfaceCandidateSummary.candidates).toEqual({});
    expect(r.promptSurfaceCandidateSummary.candidateIds).toEqual([]);
  });

  it("reset yields empty prompt surface candidate summary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(Object.keys(r.promptSurfaceCandidateSummary.candidates)).toHaveLength(0);
    expect(r.promptSurfaceCandidateSummary.candidateIds).toHaveLength(0);
  });

  it("createReadingAssistPromptSurfaceCandidateId returns deterministic id", () => {
    const presentationRecordId = "ra-prompt-presentation-record|bind-1";
    expect(createReadingAssistPromptSurfaceCandidateId(presentationRecordId)).toBe(
      "ra-prompt-surface-candidate|ra-prompt-presentation-record|bind-1"
    );
    expect(createReadingAssistPromptSurfaceCandidateId(presentationRecordId)).toBe(
      createReadingAssistPromptSurfaceCandidateId(presentationRecordId)
    );
  });

  it("deriveReadingAssistPromptSurfacePlacement always returns after_sentence in v28", () => {
    const record: ReadingAssistPromptPresentationRecord = {
      id: "rec-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "r1",
      bindingId: "b1",
      primaryCatalogEntryId: "catalog_compare_calm_v1",
      secondaryCatalogEntryId: "catalog_compare_calm_v2",
      title: "Title",
      body: "Body",
      actionKey: "compare_views",
      posture: "inline_compare",
      readiness: "eligible",
      createdAt: "100",
    };
    expect(deriveReadingAssistPromptSurfacePlacement(record)).toBe("after_sentence");
  });

  it("deriveReadingAssistPromptSurfaceAffordance compare posture returns compare_inline", () => {
    const record: ReadingAssistPromptPresentationRecord = {
      id: "rec-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "r1",
      bindingId: "b1",
      primaryCatalogEntryId: "catalog_compare_calm_v1",
      secondaryCatalogEntryId: null,
      title: "Title",
      body: "Body",
      actionKey: "compare_views",
      posture: "inline_compare",
      readiness: "eligible",
      createdAt: "100",
    };
    expect(deriveReadingAssistPromptSurfaceAffordance(record)).toBe("compare_inline");
  });

  it("deriveReadingAssistPromptSurfaceAffordance source posture returns expand_inline", () => {
    const record: ReadingAssistPromptPresentationRecord = {
      id: "rec-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "r1",
      bindingId: "b1",
      primaryCatalogEntryId: "catalog_source_warm_v1",
      secondaryCatalogEntryId: null,
      title: "Title",
      body: "Body",
      actionKey: "see_source",
      posture: "inline_source",
      readiness: "eligible",
      createdAt: "100",
    };
    expect(deriveReadingAssistPromptSurfaceAffordance(record)).toBe("expand_inline");
  });

  it("deriveReadingAssistPromptSurfaceAffordance gentle posture returns tap_inline", () => {
    const record: ReadingAssistPromptPresentationRecord = {
      id: "rec-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "r1",
      bindingId: "b1",
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
      title: "Title",
      body: "Body",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      createdAt: "100",
    };
    expect(deriveReadingAssistPromptSurfaceAffordance(record)).toBe("tap_inline");
  });

  it("deriveReadingAssistPromptSurfacePriority compare posture returns elevated", () => {
    const record: ReadingAssistPromptPresentationRecord = {
      id: "rec-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "r1",
      bindingId: "b1",
      primaryCatalogEntryId: "catalog_compare_calm_v1",
      secondaryCatalogEntryId: null,
      title: "Title",
      body: "Body",
      actionKey: "compare_views",
      posture: "inline_compare",
      readiness: "eligible",
      createdAt: "100",
    };
    expect(deriveReadingAssistPromptSurfacePriority(record)).toBe("elevated");
  });

  it("deriveReadingAssistPromptSurfacePriority source gentle posture returns normal", () => {
    const record: ReadingAssistPromptPresentationRecord = {
      id: "rec-1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "r1",
      bindingId: "b1",
      primaryCatalogEntryId: "catalog_source_warm_v1",
      secondaryCatalogEntryId: null,
      title: "Title",
      body: "Body",
      actionKey: "see_source",
      posture: "inline_source",
      readiness: "eligible",
      createdAt: "100",
    };
    expect(deriveReadingAssistPromptSurfacePriority(record)).toBe("normal");
  });

  it("ensureReadingAssistPromptSurfaceCandidate adds once", () => {
    const candidate: ReadingAssistPromptSurfaceCandidate = {
      id: createReadingAssistPromptSurfaceCandidateId("rec-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "r1",
      bindingId: "b1",
      presentationRecordId: "rec-1",
      title: "Title",
      body: "Body",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      createdAt: "100",
    };
    const summary = ensureReadingAssistPromptSurfaceCandidate(
      DEFAULT_READING_ASSIST_PROMPT_SURFACE_CANDIDATE_SUMMARY,
      candidate
    );
    expect(summary.candidateIds).toHaveLength(1);
    expect(summary.candidateIds[0]).toBe(candidate.id);
    expect(summary.candidates[candidate.id]).toEqual(candidate);
  });

  it("ensureReadingAssistPromptSurfaceCandidate repeated ensure does not duplicate candidateIds", () => {
    const candidate: ReadingAssistPromptSurfaceCandidate = {
      id: createReadingAssistPromptSurfaceCandidateId("rec-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "r1",
      bindingId: "b1",
      presentationRecordId: "rec-1",
      title: "Title",
      body: "Body",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptSurfaceCandidate(
      DEFAULT_READING_ASSIST_PROMPT_SURFACE_CANDIDATE_SUMMARY,
      candidate
    );
    summary = ensureReadingAssistPromptSurfaceCandidate(summary, candidate);
    expect(summary.candidateIds).toHaveLength(1);
  });

  it("ensureReadingAssistPromptSurfaceCandidate preserves existing createdAt on re-ensure", () => {
    const candidate: ReadingAssistPromptSurfaceCandidate = {
      id: createReadingAssistPromptSurfaceCandidateId("rec-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "r1",
      bindingId: "b1",
      presentationRecordId: "rec-1",
      title: "Title",
      body: "Body",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptSurfaceCandidate(
      DEFAULT_READING_ASSIST_PROMPT_SURFACE_CANDIDATE_SUMMARY,
      candidate
    );
    const candidateLater = { ...candidate, createdAt: "200" };
    summary = ensureReadingAssistPromptSurfaceCandidate(summary, candidateLater);
    expect(summary.candidates[candidate.id].createdAt).toBe("100");
  });

  it("ensureReadingAssistPromptSurfaceCandidate posture upgrades conservatively", () => {
    const candidate: ReadingAssistPromptSurfaceCandidate = {
      id: createReadingAssistPromptSurfaceCandidateId("rec-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "r1",
      bindingId: "b1",
      presentationRecordId: "rec-1",
      title: "Something interesting is happening here.",
      body: "This sentence feels worth a closer look.",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptSurfaceCandidate(
      DEFAULT_READING_ASSIST_PROMPT_SURFACE_CANDIDATE_SUMMARY,
      candidate
    );
    const candidateUpgrade: ReadingAssistPromptSurfaceCandidate = {
      ...candidate,
      posture: "inline_compare",
      title: "There's more than one way to read this.",
      body: "A softer comparison might help here.",
      actionKey: "compare_views",
      affordance: "compare_inline",
      priority: "elevated",
    };
    summary = ensureReadingAssistPromptSurfaceCandidate(summary, candidateUpgrade);
    expect(summary.candidates[candidate.id].posture).toBe("inline_compare");
  });

  it("ensureReadingAssistPromptSurfaceCandidate title body actionKey update when posture upgrades", () => {
    const candidate: ReadingAssistPromptSurfaceCandidate = {
      id: createReadingAssistPromptSurfaceCandidateId("rec-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "r1",
      bindingId: "b1",
      presentationRecordId: "rec-1",
      title: "Title",
      body: "Body",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptSurfaceCandidate(
      DEFAULT_READING_ASSIST_PROMPT_SURFACE_CANDIDATE_SUMMARY,
      candidate
    );
    const candidateUpgrade: ReadingAssistPromptSurfaceCandidate = {
      ...candidate,
      posture: "inline_compare",
      title: "Compare title",
      body: "Compare body",
      actionKey: "compare_views",
      affordance: "compare_inline",
      priority: "elevated",
    };
    summary = ensureReadingAssistPromptSurfaceCandidate(summary, candidateUpgrade);
    expect(summary.candidates[candidate.id].title).toBe("Compare title");
    expect(summary.candidates[candidate.id].body).toBe("Compare body");
    expect(summary.candidates[candidate.id].actionKey).toBe("compare_views");
  });

  it("ensureReadingAssistPromptSurfaceCandidate affordance updates when posture upgrades", () => {
    const candidate: ReadingAssistPromptSurfaceCandidate = {
      id: createReadingAssistPromptSurfaceCandidateId("rec-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "r1",
      bindingId: "b1",
      presentationRecordId: "rec-1",
      title: "Title",
      body: "Body",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptSurfaceCandidate(
      DEFAULT_READING_ASSIST_PROMPT_SURFACE_CANDIDATE_SUMMARY,
      candidate
    );
    const candidateUpgrade: ReadingAssistPromptSurfaceCandidate = {
      ...candidate,
      posture: "inline_source",
      affordance: "expand_inline",
    };
    summary = ensureReadingAssistPromptSurfaceCandidate(summary, candidateUpgrade);
    expect(summary.candidates[candidate.id].affordance).toBe("expand_inline");
  });

  it("ensureReadingAssistPromptSurfaceCandidate priority upgrades when posture upgrades", () => {
    const candidate: ReadingAssistPromptSurfaceCandidate = {
      id: createReadingAssistPromptSurfaceCandidateId("rec-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "r1",
      bindingId: "b1",
      presentationRecordId: "rec-1",
      title: "Title",
      body: "Body",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptSurfaceCandidate(
      DEFAULT_READING_ASSIST_PROMPT_SURFACE_CANDIDATE_SUMMARY,
      candidate
    );
    const candidateUpgrade: ReadingAssistPromptSurfaceCandidate = {
      ...candidate,
      posture: "inline_compare",
      affordance: "compare_inline",
      priority: "elevated",
    };
    summary = ensureReadingAssistPromptSurfaceCandidate(summary, candidateUpgrade);
    expect(summary.candidates[candidate.id].priority).toBe("elevated");
  });

  it("ensureReadingAssistPromptSurfaceCandidate no regression of posture affordance priority", () => {
    const candidate: ReadingAssistPromptSurfaceCandidate = {
      id: createReadingAssistPromptSurfaceCandidateId("rec-1"),
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "r1",
      bindingId: "b1",
      presentationRecordId: "rec-1",
      title: "Compare title",
      body: "Compare body",
      actionKey: "compare_views",
      posture: "inline_compare",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "compare_inline",
      priority: "elevated",
      createdAt: "100",
    };
    let summary = ensureReadingAssistPromptSurfaceCandidate(
      DEFAULT_READING_ASSIST_PROMPT_SURFACE_CANDIDATE_SUMMARY,
      candidate
    );
    const candidateDowngrade: ReadingAssistPromptSurfaceCandidate = {
      ...candidate,
      posture: "inline_gentle",
      title: "Title",
      body: "Body",
      actionKey: "look_closer",
      affordance: "tap_inline",
      priority: "normal",
    };
    summary = ensureReadingAssistPromptSurfaceCandidate(summary, candidateDowngrade);
    expect(summary.candidates[candidate.id].posture).toBe("inline_compare");
    expect(summary.candidates[candidate.id].affordance).toBe("compare_inline");
    expect(summary.candidates[candidate.id].priority).toBe("elevated");
  });

  it("ensurePromptSurfaceCandidateForPresentationRecordId creates candidate when presentation record exists", () => {
    const record: ReadingAssistPromptPresentationRecord = {
      id: "ra-prompt-presentation-record|bind-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "r1",
      bindingId: "b1",
      primaryCatalogEntryId: "catalog_source_warm_v1",
      secondaryCatalogEntryId: "catalog_source_warm_v2",
      title: "There's something behind this idea.",
      body: "You can trace where this point is coming from.",
      actionKey: "see_source",
      posture: "inline_source",
      readiness: "eligible",
      createdAt: "100",
    };
    const promptPresentationRecordSummary: ReadingAssistPromptPresentationRecordSummary = {
      records: { [record.id]: record },
      recordIds: [record.id],
    };
    const out = ensurePromptSurfaceCandidateForPresentationRecordId(
      DEFAULT_READING_ASSIST_PROMPT_SURFACE_CANDIDATE_SUMMARY,
      promptPresentationRecordSummary,
      record.id
    );
    expect(out.candidateIds).toHaveLength(1);
    const candidateId = createReadingAssistPromptSurfaceCandidateId(record.id);
    expect(out.candidates[candidateId]).toBeDefined();
    expect(out.candidates[candidateId].sentenceId).toBe(record.sentenceId);
    expect(out.candidates[candidateId].presentationRecordId).toBe(record.id);
    expect(out.candidates[candidateId].title).toBe(record.title);
    expect(out.candidates[candidateId].posture).toBe("inline_source");
    expect(out.candidates[candidateId].placement).toBe("after_sentence");
    expect(out.candidates[candidateId].affordance).toBe("expand_inline");
    expect(out.candidates[candidateId].priority).toBe("normal");
  });

  it("ensurePromptSurfaceCandidateForPresentationRecordId no candidate created when presentationRecordId missing", () => {
    const promptPresentationRecordSummary = DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY;
    const out = ensurePromptSurfaceCandidateForPresentationRecordId(
      DEFAULT_READING_ASSIST_PROMPT_SURFACE_CANDIDATE_SUMMARY,
      promptPresentationRecordSummary,
      "missing-presentation-record-id"
    );
    expect(out.candidateIds).toHaveLength(0);
    expect(Object.keys(out.candidates)).toHaveLength(0);
  });

  it("ensurePromptSurfaceCandidateForPresentationRecordId repeated ensure does not duplicate candidate", () => {
    const record: ReadingAssistPromptPresentationRecord = {
      id: "ra-prompt-presentation-record|bind-1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "s1",
      bundleId: "b1",
      crossLinkId: "c1",
      slotId: "slot-1",
      selectionId: "sel-1",
      recordId: "r1",
      bindingId: "b1",
      primaryCatalogEntryId: "catalog_explore_warm_v1",
      secondaryCatalogEntryId: null,
      title: "Title",
      body: "Body",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      createdAt: "100",
    };
    const promptPresentationRecordSummary: ReadingAssistPromptPresentationRecordSummary = {
      records: { [record.id]: record },
      recordIds: [record.id],
    };
    let out = ensurePromptSurfaceCandidateForPresentationRecordId(
      DEFAULT_READING_ASSIST_PROMPT_SURFACE_CANDIDATE_SUMMARY,
      promptPresentationRecordSummary,
      record.id
    );
    out = ensurePromptSurfaceCandidateForPresentationRecordId(
      out,
      promptPresentationRecordSummary,
      record.id
    );
    expect(out.candidateIds).toHaveLength(1);
  });

  it("eligible sentence path that produces prompt presentation record also produces exactly one prompt surface candidate", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.promptPresentationRecordSummary.recordIds).toHaveLength(1);
    expect(next.promptSurfaceCandidateSummary.candidateIds).toHaveLength(1);
    const presentationRecordId = next.promptPresentationRecordSummary.recordIds[0];
    const candidateId = createReadingAssistPromptSurfaceCandidateId(presentationRecordId);
    expect(next.promptSurfaceCandidateSummary.candidates[candidateId]).toBeDefined();
    const cand = next.promptSurfaceCandidateSummary.candidates[candidateId];
    expect(cand.title).toBe(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_source_warm_v1.title);
    expect(cand.body).toBe(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_source_warm_v1.body);
    expect(cand.actionKey).toBe("see_source");
    expect(cand.posture).toBe("inline_source");
    expect(cand.placement).toBe("after_sentence");
    expect(cand.affordance).toBe("expand_inline");
    expect(cand.priority).toBe("normal");
  });

  it("repeated reduction does not duplicate prompt surface candidate", () => {
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 0 });
    const next1 = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const prev2: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      anchorSummary: next1.anchorSummary,
      attachmentRegistry: next1.attachmentRegistry,
      crossLinkSummary: next1.crossLinkSummary,
      verificationBundleSummary: next1.verificationBundleSummary,
      verificationBundleIndexSummary: next1.verificationBundleIndexSummary,
      curiositySignalSummary: next1.curiositySignalSummary,
      promptToneSlotSummary: next1.promptToneSlotSummary,
      promptCopySelectionSummary: next1.promptCopySelectionSummary,
      promptCopyLibraryRecordSummary: next1.promptCopyLibraryRecordSummary,
      promptCopyCatalogBindingSummary: next1.promptCopyCatalogBindingSummary,
      promptPresentationRecordSummary: next1.promptPresentationRecordSummary,
      promptSurfaceCandidateSummary: next1.promptSurfaceCandidateSummary,
      promptMountPlanSummary: next1.promptMountPlanSummary,
      markers: next1.markers,
      markerIds: next1.markerIds,
      examinedSentenceIds: next1.examinedSentenceIds,
      sentences: next1.sentences,
    };
    const next2 = reduceReadingAssistReadingPathSummary(prev2, event, heuristic);
    expect(next2.promptSurfaceCandidateSummary.candidateIds).toHaveLength(
      next1.promptSurfaceCandidateSummary.candidateIds.length
    );
  });

  it("revisit that adds disagreement updates same candidate to compare title body actionKey posture affordance priority elevated", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const presentationRecordId = next.promptPresentationRecordSummary.recordIds[0];
    const candidateId = createReadingAssistPromptSurfaceCandidateId(presentationRecordId);
    const cand = next.promptSurfaceCandidateSummary.candidates[candidateId];
    expect(cand.title).toBe(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_compare_calm_v1.title);
    expect(cand.body).toBe(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_compare_calm_v1.body);
    expect(cand.actionKey).toBe("compare_views");
    expect(cand.posture).toBe("inline_compare");
    expect(cand.affordance).toBe("compare_inline");
    expect(cand.priority).toBe("elevated");
  });

  it("block-only events do not create prompt surface candidates", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.promptSurfaceCandidateSummary.candidateIds).toHaveLength(0);
    expect(Object.keys(next.promptSurfaceCandidateSummary.candidates)).toHaveLength(0);
  });

  it("no prompt surface candidate when no prompt presentation record exists", () => {
    const promptPresentationRecordSummary = DEFAULT_READING_ASSIST_PROMPT_PRESENTATION_RECORD_SUMMARY;
    const out = ensurePromptSurfaceCandidateForPresentationRecordId(
      DEFAULT_READING_ASSIST_PROMPT_SURFACE_CANDIDATE_SUMMARY,
      promptPresentationRecordSummary,
      "any-presentation-record-id"
    );
    expect(out.candidateIds).toHaveLength(0);
    expect(Object.keys(out.candidates)).toHaveLength(0);
  });
});

describe("v29 prompt mount plans", () => {
  function heuristicStateWithDwell(
    dwellByBlockId: Record<string, number>,
    dwellBySentenceId: Record<string, number>
  ): ReadingAssistHeuristicState {
    return {
      ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
      summary: {
        ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
        dwellByBlockId,
        dwellBySentenceId,
      },
    };
  }

  it("default reading path summary includes promptMountPlanSummary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.promptMountPlanSummary).toBeDefined();
    expect(r.promptMountPlanSummary.plans).toEqual({});
    expect(r.promptMountPlanSummary.planIds).toEqual([]);
  });

  it("reset yields empty prompt mount plan summary", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.promptMountPlanSummary).toEqual(DEFAULT_READING_ASSIST_PROMPT_MOUNT_PLAN_SUMMARY);
    expect(r.promptMountPlanSummary.planIds).toHaveLength(0);
  });

  it("createReadingAssistPromptMountPlanId returns deterministic id", () => {
    const id = createReadingAssistPromptMountPlanId("ra-prompt-surface-candidate|foo");
    expect(id).toBe("ra-prompt-mount-plan|ra-prompt-surface-candidate|foo");
  });

  it("deriveReadingAssistPromptMountStatus eligible returns mountable", () => {
    const c: ReadingAssistPromptSurfaceCandidate = {
      id: "c1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      title: "t",
      body: "b",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      createdAt: "0",
    };
    expect(deriveReadingAssistPromptMountStatus(c)).toBe("mountable");
  });

  it("deriveReadingAssistPromptMountStatus non-eligible returns held", () => {
    const c: ReadingAssistPromptSurfaceCandidate = {
      id: "c1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      title: "t",
      body: "b",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "deferred",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      createdAt: "0",
    };
    expect(deriveReadingAssistPromptMountStatus(c)).toBe("held");
  });

  it("deriveReadingAssistPromptMountTrigger compare returns sentence_compare", () => {
    const c: ReadingAssistPromptSurfaceCandidate = {
      id: "c1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      title: "t",
      body: "b",
      actionKey: "compare_views",
      posture: "inline_compare",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "compare_inline",
      priority: "elevated",
      createdAt: "0",
    };
    expect(deriveReadingAssistPromptMountTrigger(c)).toBe("sentence_compare");
  });

  it("deriveReadingAssistPromptMountTrigger source returns sentence_expand", () => {
    const c: ReadingAssistPromptSurfaceCandidate = {
      id: "c1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      title: "t",
      body: "b",
      actionKey: "see_source",
      posture: "inline_source",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "expand_inline",
      priority: "normal",
      createdAt: "0",
    };
    expect(deriveReadingAssistPromptMountTrigger(c)).toBe("sentence_expand");
  });

  it("deriveReadingAssistPromptMountTrigger gentle returns sentence_settle", () => {
    const c: ReadingAssistPromptSurfaceCandidate = {
      id: "c1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      title: "t",
      body: "b",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      createdAt: "0",
    };
    expect(deriveReadingAssistPromptMountTrigger(c)).toBe("sentence_settle");
  });

  it("deriveReadingAssistPromptExpansionMode compare returns compare_inline", () => {
    const c: ReadingAssistPromptSurfaceCandidate = {
      id: "c1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      title: "t",
      body: "b",
      actionKey: "compare_views",
      posture: "inline_compare",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "compare_inline",
      priority: "elevated",
      createdAt: "0",
    };
    expect(deriveReadingAssistPromptExpansionMode(c)).toBe("compare_inline");
  });

  it("deriveReadingAssistPromptExpansionMode source returns expandable_inline", () => {
    const c: ReadingAssistPromptSurfaceCandidate = {
      id: "c1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      title: "t",
      body: "b",
      actionKey: "see_source",
      posture: "inline_source",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "expand_inline",
      priority: "normal",
      createdAt: "0",
    };
    expect(deriveReadingAssistPromptExpansionMode(c)).toBe("expandable_inline");
  });

  it("deriveReadingAssistPromptExpansionMode gentle returns collapsed_inline", () => {
    const c: ReadingAssistPromptSurfaceCandidate = {
      id: "c1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      title: "t",
      body: "b",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      createdAt: "0",
    };
    expect(deriveReadingAssistPromptExpansionMode(c)).toBe("collapsed_inline");
  });

  it("deriveReadingAssistPromptMountUrgency elevated returns heightened", () => {
    const c: ReadingAssistPromptSurfaceCandidate = {
      id: "c1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      title: "t",
      body: "b",
      actionKey: "compare_views",
      posture: "inline_compare",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "compare_inline",
      priority: "elevated",
      createdAt: "0",
    };
    expect(deriveReadingAssistPromptMountUrgency(c)).toBe("heightened");
  });

  it("deriveReadingAssistPromptMountUrgency normal returns standard", () => {
    const c: ReadingAssistPromptSurfaceCandidate = {
      id: "c1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      title: "t",
      body: "b",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      createdAt: "0",
    };
    expect(deriveReadingAssistPromptMountUrgency(c)).toBe("standard");
  });

  it("ensureReadingAssistPromptMountPlan adds once", () => {
    const plan: ReadingAssistPromptMountPlan = {
      id: "ra-prompt-mount-plan|sc1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      surfaceCandidateId: "sc1",
      title: "Title",
      body: "Body",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      mountStatus: "mountable",
      mountTrigger: "sentence_settle",
      expansionMode: "collapsed_inline",
      urgency: "standard",
      createdAt: "100",
    };
    const out = ensureReadingAssistPromptMountPlan(DEFAULT_READING_ASSIST_PROMPT_MOUNT_PLAN_SUMMARY, plan);
    expect(out.planIds).toHaveLength(1);
    expect(out.planIds[0]).toBe("ra-prompt-mount-plan|sc1");
    expect(Object.keys(out.plans)).toHaveLength(1);
    expect(out.plans["ra-prompt-mount-plan|sc1"].title).toBe("Title");
  });

  it("ensureReadingAssistPromptMountPlan repeated ensure does not duplicate planIds", () => {
    const plan: ReadingAssistPromptMountPlan = {
      id: "ra-prompt-mount-plan|sc1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      surfaceCandidateId: "sc1",
      title: "Title",
      body: "Body",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      mountStatus: "mountable",
      mountTrigger: "sentence_settle",
      expansionMode: "collapsed_inline",
      urgency: "standard",
      createdAt: "100",
    };
    const out1 = ensureReadingAssistPromptMountPlan(DEFAULT_READING_ASSIST_PROMPT_MOUNT_PLAN_SUMMARY, plan);
    const out2 = ensureReadingAssistPromptMountPlan(out1, plan);
    expect(out2.planIds).toHaveLength(1);
    expect(out2.planIds).toEqual(out1.planIds);
  });

  it("ensureReadingAssistPromptMountPlan preserves existing createdAt on re-ensure", () => {
    const plan: ReadingAssistPromptMountPlan = {
      id: "ra-prompt-mount-plan|sc1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      surfaceCandidateId: "sc1",
      title: "Title",
      body: "Body",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      mountStatus: "mountable",
      mountTrigger: "sentence_settle",
      expansionMode: "collapsed_inline",
      urgency: "standard",
      createdAt: "100",
    };
    const out1 = ensureReadingAssistPromptMountPlan(DEFAULT_READING_ASSIST_PROMPT_MOUNT_PLAN_SUMMARY, plan);
    const planNewCreated = { ...plan, createdAt: "200" };
    const out2 = ensureReadingAssistPromptMountPlan(out1, planNewCreated);
    expect(out2.plans["ra-prompt-mount-plan|sc1"].createdAt).toBe("100");
  });

  it("ensureReadingAssistPromptMountPlan posture upgrades conservatively", () => {
    const base: ReadingAssistPromptMountPlan = {
      id: "ra-prompt-mount-plan|sc1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      surfaceCandidateId: "sc1",
      title: "Gentle",
      body: "Gentle body",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      mountStatus: "mountable",
      mountTrigger: "sentence_settle",
      expansionMode: "collapsed_inline",
      urgency: "standard",
      createdAt: "100",
    };
    const out1 = ensureReadingAssistPromptMountPlan(DEFAULT_READING_ASSIST_PROMPT_MOUNT_PLAN_SUMMARY, base);
    const sourcePlan: ReadingAssistPromptMountPlan = {
      ...base,
      title: "Source",
      body: "Source body",
      actionKey: "see_source",
      posture: "inline_source",
      affordance: "expand_inline",
      priority: "normal",
      mountTrigger: "sentence_expand",
      expansionMode: "expandable_inline",
      urgency: "standard",
    };
    const out2 = ensureReadingAssistPromptMountPlan(out1, sourcePlan);
    expect(out2.plans["ra-prompt-mount-plan|sc1"].posture).toBe("inline_source");
    expect(out2.plans["ra-prompt-mount-plan|sc1"].title).toBe("Source");
    expect(out2.plans["ra-prompt-mount-plan|sc1"].body).toBe("Source body");
    expect(out2.plans["ra-prompt-mount-plan|sc1"].actionKey).toBe("see_source");
    expect(out2.plans["ra-prompt-mount-plan|sc1"].affordance).toBe("expand_inline");
    expect(out2.plans["ra-prompt-mount-plan|sc1"].mountTrigger).toBe("sentence_expand");
    expect(out2.plans["ra-prompt-mount-plan|sc1"].expansionMode).toBe("expandable_inline");
  });

  it("ensureReadingAssistPromptMountPlan priority and urgency upgrade", () => {
    const base: ReadingAssistPromptMountPlan = {
      id: "ra-prompt-mount-plan|sc1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      surfaceCandidateId: "sc1",
      title: "T",
      body: "B",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      mountStatus: "mountable",
      mountTrigger: "sentence_settle",
      expansionMode: "collapsed_inline",
      urgency: "standard",
      createdAt: "100",
    };
    const out1 = ensureReadingAssistPromptMountPlan(DEFAULT_READING_ASSIST_PROMPT_MOUNT_PLAN_SUMMARY, base);
    const elevated: ReadingAssistPromptMountPlan = {
      ...base,
      priority: "elevated",
      urgency: "heightened",
    };
    const out2 = ensureReadingAssistPromptMountPlan(out1, elevated);
    expect(out2.plans["ra-prompt-mount-plan|sc1"].priority).toBe("elevated");
    expect(out2.plans["ra-prompt-mount-plan|sc1"].urgency).toBe("heightened");
  });

  it("ensureReadingAssistPromptMountPlan no regression of posture", () => {
    const comparePlan: ReadingAssistPromptMountPlan = {
      id: "ra-prompt-mount-plan|sc1",
      sentenceId: "s1",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      surfaceCandidateId: "sc1",
      title: "Compare",
      body: "Compare body",
      actionKey: "compare_views",
      posture: "inline_compare",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "compare_inline",
      priority: "elevated",
      mountStatus: "mountable",
      mountTrigger: "sentence_compare",
      expansionMode: "compare_inline",
      urgency: "heightened",
      createdAt: "100",
    };
    const out1 = ensureReadingAssistPromptMountPlan(DEFAULT_READING_ASSIST_PROMPT_MOUNT_PLAN_SUMMARY, comparePlan);
    const downgrade: ReadingAssistPromptMountPlan = {
      ...comparePlan,
      posture: "inline_gentle",
      affordance: "tap_inline",
      priority: "normal",
      mountTrigger: "sentence_settle",
      expansionMode: "collapsed_inline",
      urgency: "standard",
    };
    const out2 = ensureReadingAssistPromptMountPlan(out1, downgrade);
    expect(out2.plans["ra-prompt-mount-plan|sc1"].posture).toBe("inline_compare");
    expect(out2.plans["ra-prompt-mount-plan|sc1"].affordance).toBe("compare_inline");
    expect(out2.plans["ra-prompt-mount-plan|sc1"].priority).toBe("elevated");
    expect(out2.plans["ra-prompt-mount-plan|sc1"].mountTrigger).toBe("sentence_compare");
    expect(out2.plans["ra-prompt-mount-plan|sc1"].expansionMode).toBe("compare_inline");
    expect(out2.plans["ra-prompt-mount-plan|sc1"].urgency).toBe("heightened");
  });

  it("ensurePromptMountPlanForSurfaceCandidateId creates plan when candidate exists", () => {
    const candidate: ReadingAssistPromptSurfaceCandidate = {
      id: "ra-prompt-surface-candidate|pr1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      title: "Learn more",
      body: "Body",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      createdAt: "100",
    };
    const candidateSummary: ReadingAssistPromptSurfaceCandidateSummary = {
      candidates: { [candidate.id]: candidate },
      candidateIds: [candidate.id],
    };
    const out = ensurePromptMountPlanForSurfaceCandidateId(
      DEFAULT_READING_ASSIST_PROMPT_MOUNT_PLAN_SUMMARY,
      candidateSummary,
      candidate.id
    );
    expect(out.planIds).toHaveLength(1);
    expect(out.planIds[0]).toBe(createReadingAssistPromptMountPlanId(candidate.id));
    const plan = out.plans[out.planIds[0]];
    expect(plan.sentenceId).toBe("b1-s0");
    expect(plan.title).toBe("Learn more");
    expect(plan.body).toBe("Body");
    expect(plan.actionKey).toBe("look_closer");
    expect(plan.posture).toBe("inline_gentle");
    expect(plan.mountStatus).toBe("mountable");
    expect(plan.mountTrigger).toBe("sentence_settle");
    expect(plan.expansionMode).toBe("collapsed_inline");
    expect(plan.urgency).toBe("standard");
  });

  it("ensurePromptMountPlanForSurfaceCandidateId no plan when surfaceCandidateId missing", () => {
    const out = ensurePromptMountPlanForSurfaceCandidateId(
      DEFAULT_READING_ASSIST_PROMPT_MOUNT_PLAN_SUMMARY,
      DEFAULT_READING_ASSIST_PROMPT_SURFACE_CANDIDATE_SUMMARY,
      "nonexistent-id"
    );
    expect(out.planIds).toHaveLength(0);
    expect(Object.keys(out.plans)).toHaveLength(0);
  });

  it("ensurePromptMountPlanForSurfaceCandidateId repeated ensure does not duplicate plan", () => {
    const candidate: ReadingAssistPromptSurfaceCandidate = {
      id: "ra-prompt-surface-candidate|pr1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      title: "Learn more",
      body: "Body",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      createdAt: "100",
    };
    const candidateSummary: ReadingAssistPromptSurfaceCandidateSummary = {
      candidates: { [candidate.id]: candidate },
      candidateIds: [candidate.id],
    };
    const out1 = ensurePromptMountPlanForSurfaceCandidateId(
      DEFAULT_READING_ASSIST_PROMPT_MOUNT_PLAN_SUMMARY,
      candidateSummary,
      candidate.id
    );
    const out2 = ensurePromptMountPlanForSurfaceCandidateId(out1, candidateSummary, candidate.id);
    expect(out2.planIds).toHaveLength(1);
    expect(out2.planIds).toEqual(out1.planIds);
  });

  it("eligible sentence path that produces surface candidate also produces exactly one prompt mount plan", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: [],
      sentences: {},
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 50 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.promptSurfaceCandidateSummary.candidateIds.length).toBeGreaterThanOrEqual(1);
    const candidateId = next.promptSurfaceCandidateSummary.candidateIds[0];
    expect(next.promptMountPlanSummary.planIds).toHaveLength(next.promptSurfaceCandidateSummary.candidateIds.length);
    const planId = createReadingAssistPromptMountPlanId(candidateId);
    expect(next.promptMountPlanSummary.plans[planId]).toBeDefined();
    const plan = next.promptMountPlanSummary.plans[planId];
    expect(plan.title).toBeDefined();
    expect(plan.body).toBeDefined();
    expect(plan.actionKey).toBeDefined();
    expect(["inline_gentle", "inline_source", "inline_compare"]).toContain(plan.posture);
    expect(plan.mountStatus).toBe("mountable");
    expect(
      (plan.posture === "inline_compare" && plan.mountTrigger === "sentence_compare") ||
        (plan.posture === "inline_source" && plan.mountTrigger === "sentence_expand") ||
        (plan.mountTrigger === "sentence_settle")
    ).toBe(true);
    expect(
      (plan.posture === "inline_compare" && plan.expansionMode === "compare_inline") ||
        (plan.posture === "inline_source" && plan.expansionMode === "expandable_inline") ||
        (plan.expansionMode === "collapsed_inline")
    ).toBe(true);
    expect(plan.urgency).toBe(plan.priority === "elevated" ? "heightened" : "standard");
  });

  it("repeated reduction does not duplicate the plan", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next1 = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const prev2: ReadingAssistReadingPathSummary = {
      ...prev,
      ...next1,
      promptMountPlanSummary: next1.promptMountPlanSummary,
    };
    const next2 = reduceReadingAssistReadingPathSummary(prev2, event, heuristic);
    expect(next2.promptMountPlanSummary.planIds.length).toBe(next1.promptMountPlanSummary.planIds.length);
  });

  it("revisit that adds disagreement updates same plan to compare title body actionKey posture affordance priority mountTrigger expansionMode urgency", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const presentationRecordId = next.promptPresentationRecordSummary.recordIds[0];
    const candidateId = createReadingAssistPromptSurfaceCandidateId(presentationRecordId);
    const planId = createReadingAssistPromptMountPlanId(candidateId);
    const plan = next.promptMountPlanSummary.plans[planId];
    expect(plan).toBeDefined();
    expect(plan.title).toBe(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_compare_calm_v1.title);
    expect(plan.body).toBe(READING_ASSIST_PROMPT_COPY_CATALOG.catalog_compare_calm_v1.body);
    expect(plan.actionKey).toBe("compare_views");
    expect(plan.posture).toBe("inline_compare");
    expect(plan.affordance).toBe("compare_inline");
    expect(plan.priority).toBe("elevated");
    expect(plan.mountTrigger).toBe("sentence_compare");
    expect(plan.expansionMode).toBe("compare_inline");
    expect(plan.urgency).toBe("heightened");
  });

  it("block-only events do not create prompt mount plans", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    expect(next.promptMountPlanSummary.planIds).toHaveLength(0);
    expect(Object.keys(next.promptMountPlanSummary.plans)).toHaveLength(0);
  });

  it("no prompt mount plan when no prompt surface candidate exists", () => {
    const r = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(r.promptMountPlanSummary.planIds).toHaveLength(0);
    expect(r.promptSurfaceCandidateSummary.candidateIds).toHaveLength(0);
  });
});

describe("v30 active prompt selector", () => {
  function makePlan(overrides: Partial<ReadingAssistPromptMountPlan>): ReadingAssistPromptMountPlan {
    return {
      id: "ra-prompt-mount-plan|sc1",
      sentenceId: "b1-s0",
      anchorId: "a1",
      signalId: "sig1",
      bundleId: "b1",
      crossLinkId: "x1",
      slotId: "slot1",
      selectionId: "sel1",
      recordId: "rec1",
      bindingId: "bind1",
      presentationRecordId: "pr1",
      surfaceCandidateId: "sc1",
      title: "Title",
      body: "Body",
      actionKey: "look_closer",
      posture: "inline_gentle",
      readiness: "eligible",
      placement: "after_sentence",
      affordance: "tap_inline",
      priority: "normal",
      mountStatus: "mountable",
      mountTrigger: "sentence_settle",
      expansionMode: "collapsed_inline",
      urgency: "standard",
      createdAt: "100",
      ...overrides,
    };
  }

  function summaryWithPlans(plans: ReadingAssistPromptMountPlan[]): ReadingAssistReadingPathSummary {
    const planIds = plans.map((p) => p.id);
    const plansRecord: Record<string, ReadingAssistPromptMountPlan> = {};
    for (const p of plans) plansRecord[p.id] = p;
    return {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      promptMountPlanSummary: { plans: plansRecord, planIds },
    };
  }

  it("selectPromptMountPlansForSentence returns empty array when none exist", () => {
    const summary = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    const out = selectPromptMountPlansForSentence(summary, "b1-s0");
    expect(out).toEqual([]);
  });

  it("selectPromptMountPlansForSentence returns sentence-matching plans only", () => {
    const p1 = makePlan({ id: "plan-1", sentenceId: "b1-s0" });
    const p2 = makePlan({ id: "plan-2", sentenceId: "b1-s1" });
    const p3 = makePlan({ id: "plan-3", sentenceId: "b1-s0" });
    const summary = summaryWithPlans([p1, p2, p3]);
    const out = selectPromptMountPlansForSentence(summary, "b1-s0");
    expect(out).toHaveLength(2);
    expect(out.map((x) => x.id)).toEqual(["plan-1", "plan-3"]);
  });

  it("selectPromptMountPlansForSentence preserves stable order from planIds", () => {
    const p1 = makePlan({ id: "plan-a", sentenceId: "s1" });
    const p2 = makePlan({ id: "plan-b", sentenceId: "s1" });
    const summary = summaryWithPlans([p1, p2]);
    const out = selectPromptMountPlansForSentence(summary, "s1");
    expect(out[0].id).toBe("plan-a");
    expect(out[1].id).toBe("plan-b");
    const reversed = summaryWithPlans([p2, p1]);
    const outReversed = selectPromptMountPlansForSentence(reversed, "s1");
    expect(outReversed[0].id).toBe("plan-b");
    expect(outReversed[1].id).toBe("plan-a");
  });

  it("selectMountablePromptPlansForSentence filters out non-mountable and non-eligible", () => {
    const mountable = makePlan({ id: "m1", sentenceId: "s1", mountStatus: "mountable", readiness: "eligible" });
    const held = makePlan({ id: "h1", sentenceId: "s1", mountStatus: "held", readiness: "eligible" });
    const deferred = makePlan({ id: "d1", sentenceId: "s1", mountStatus: "mountable", readiness: "deferred" });
    const summary = summaryWithPlans([mountable, held, deferred]);
    const out = selectMountablePromptPlansForSentence(summary, "s1");
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("m1");
  });

  it("selectPrimaryPromptMountPlanForSentence returns null when no plans", () => {
    const summary = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    expect(selectPrimaryPromptMountPlanForSentence(summary, "b1-s0")).toBeNull();
  });

  it("selectPrimaryPromptMountPlanForSentence returns the only plan when one exists", () => {
    const p = makePlan({ id: "only", sentenceId: "s1" });
    const summary = summaryWithPlans([p]);
    const out = selectPrimaryPromptMountPlanForSentence(summary, "s1");
    expect(out).not.toBeNull();
    expect(out!.id).toBe("only");
  });

  it("selectPrimaryPromptMountPlanForSentence picks elevated over normal", () => {
    const normal = makePlan({ id: "n1", sentenceId: "s1", priority: "normal", posture: "inline_gentle" });
    const elevated = makePlan({ id: "e1", sentenceId: "s1", priority: "elevated", posture: "inline_compare" });
    const summary = summaryWithPlans([normal, elevated]);
    const out = selectPrimaryPromptMountPlanForSentence(summary, "s1");
    expect(out!.id).toBe("e1");
    expect(out!.priority).toBe("elevated");
  });

  it("selectPrimaryPromptMountPlanForSentence picks compare over source over gentle when same priority", () => {
    const gentle = makePlan({ id: "g1", sentenceId: "s1", priority: "normal", posture: "inline_gentle" });
    const source = makePlan({ id: "s1", sentenceId: "s1", priority: "normal", posture: "inline_source" });
    const compare = makePlan({ id: "c1", sentenceId: "s1", priority: "normal", posture: "inline_compare" });
    const summary = summaryWithPlans([gentle, source, compare]);
    const out = selectPrimaryPromptMountPlanForSentence(summary, "s1");
    expect(out!.posture).toBe("inline_compare");
    expect(out!.id).toBe("c1");
  });

  it("selectPrimaryPromptMountPlanForSentence respects stable planIds order when tied", () => {
    const a = makePlan({ id: "first", sentenceId: "s1", priority: "normal", posture: "inline_gentle" });
    const b = makePlan({ id: "second", sentenceId: "s1", priority: "normal", posture: "inline_gentle" });
    const summary = summaryWithPlans([a, b]);
    const out = selectPrimaryPromptMountPlanForSentence(summary, "s1");
    expect(out!.id).toBe("first");
  });

  it("selectActivePromptForSentence returns activePrompt null when no plan exists", () => {
    const summary = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    const result = selectActivePromptForSentence(summary, "b1-s0");
    expect(result.activePrompt).toBeNull();
  });

  it("selectActivePromptForSentence returns activePrompt with expected copied fields when plan exists", () => {
    const p = makePlan({
      id: "plan-1",
      sentenceId: "b1-s0",
      title: "Learn more",
      body: "Body text",
      actionKey: "see_source",
      posture: "inline_source",
      placement: "after_sentence",
      affordance: "expand_inline",
      priority: "normal",
      mountStatus: "mountable",
      mountTrigger: "sentence_expand",
      expansionMode: "expandable_inline",
      urgency: "standard",
    });
    const summary = summaryWithPlans([p]);
    const result = selectActivePromptForSentence(summary, "b1-s0");
    expect(result.activePrompt).not.toBeNull();
    const ap = result.activePrompt!;
    expect(ap.sentenceId).toBe("b1-s0");
    expect(ap.title).toBe("Learn more");
    expect(ap.body).toBe("Body text");
    expect(ap.actionKey).toBe("see_source");
    expect(ap.posture).toBe("inline_source");
    expect(ap.placement).toBe("after_sentence");
    expect(ap.affordance).toBe("expand_inline");
    expect(ap.priority).toBe("normal");
    expect(ap.mountStatus).toBe("mountable");
    expect(ap.mountTrigger).toBe("sentence_expand");
    expect(ap.expansionMode).toBe("expandable_inline");
    expect(ap.urgency).toBe("standard");
    expect(ap.mountPlanId).toBe("plan-1");
  });

  it("selectActivePromptForFocusedSentence returns null when lastExaminedSentenceId missing", () => {
    const summary = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    const result = selectActivePromptForFocusedSentence(summary);
    expect(result.activePrompt).toBeNull();
  });

  it("selectActivePromptForFocusedSentence returns active prompt for lastExaminedSentenceId when present", () => {
    const p = makePlan({ id: "fp", sentenceId: "b1-s0", title: "Focused" });
    const summary: ReadingAssistReadingPathSummary = {
      ...summaryWithPlans([p]),
      lastExaminedSentenceId: "b1-s0",
    };
    const result = selectActivePromptForFocusedSentence(summary);
    expect(result.activePrompt).not.toBeNull();
    expect(result.activePrompt!.title).toBe("Focused");
    expect(result.activePrompt!.sentenceId).toBe("b1-s0");
  });

  it("sentence path that produces mount plan yields non-null active prompt for that sentence", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: [],
      sentences: {},
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    function heuristicStateWithDwell(
      dwellByBlockId: Record<string, number>,
      dwellBySentenceId: Record<string, number>
    ): ReadingAssistHeuristicState {
      return {
        ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
        summary: {
          ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
          dwellByBlockId,
          dwellBySentenceId,
        },
      };
    }
    const heuristic = heuristicStateWithDwell({ b1: 0 }, { "b1-s0": 50 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    expect(next.promptMountPlanSummary.planIds.length).toBeGreaterThanOrEqual(1);
    const sentenceId = next.lastExaminedSentenceId;
    expect(sentenceId).toBe("b1-s0");
    const result = selectActivePromptForSentence(next, sentenceId!);
    expect(result.activePrompt).not.toBeNull();
    expect(result.activePrompt!.sentenceId).toBe("b1-s0");
  });

  it("compare-upgraded path yields compare-flavored active prompt", () => {
    const prev: ReadingAssistReadingPathSummary = {
      ...DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      examinedSentenceIds: ["b1-s0"],
      sentences: {
        "b1-s0": {
          sentenceId: "b1-s0",
          blockId: "b1",
          firstSeenAt: 50,
          lastSeenAt: 50,
          estimatedDwellMs: 0,
          focusCount: 1,
          progressedToCount: 0,
          progressedFromCount: 0,
        },
      },
    };
    const event: ReadingAssistEvent = {
      type: "sentence_focus_set",
      timestamp: 150,
      sourceType: "article",
      blockId: "b1",
      sentenceId: "b1-s0",
    };
    function heuristicStateWithDwell(
      dwellByBlockId: Record<string, number>,
      dwellBySentenceId: Record<string, number>
    ): ReadingAssistHeuristicState {
      return {
        ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
        summary: {
          ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
          dwellByBlockId,
          dwellBySentenceId,
        },
      };
    }
    const heuristic = heuristicStateWithDwell({}, { "b1-s0": 0 });
    const next = reduceReadingAssistReadingPathSummary(prev, event, heuristic);
    const result = selectActivePromptForFocusedSentence(next);
    expect(result.activePrompt).not.toBeNull();
    expect(result.activePrompt!.posture).toBe("inline_compare");
    expect(result.activePrompt!.actionKey).toBe("compare_views");
    expect(result.activePrompt!.priority).toBe("elevated");
    expect(result.activePrompt!.urgency).toBe("heightened");
  });

  it("block-only event path yields activePrompt null", () => {
    const event: ReadingAssistEvent = {
      type: "block_focus_set",
      timestamp: 100,
      sourceType: "article",
      blockId: "b1",
      sentenceId: null,
    };
    function heuristicStateWithDwell(
      dwellByBlockId: Record<string, number>,
      dwellBySentenceId: Record<string, number>
    ): ReadingAssistHeuristicState {
      return {
        ...DEFAULT_READING_ASSIST_HEURISTIC_STATE,
        summary: {
          ...DEFAULT_READING_ASSIST_HEURISTIC_SUMMARY,
          dwellByBlockId,
          dwellBySentenceId,
        },
      };
    }
    const heuristic = heuristicStateWithDwell({ b1: 0 }, {});
    const next = reduceReadingAssistReadingPathSummary(
      DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
      event,
      heuristic
    );
    const result = selectActivePromptForFocusedSentence(next);
    expect(result.activePrompt).toBeNull();
  });
});
