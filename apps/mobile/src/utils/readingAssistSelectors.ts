/**
 * v30: App-facing, read-only selectors for reading-assist.
 * Converts reading path summary into one active prompt payload per sentence / focused sentence.
 * No reducer logic; no UI rendering.
 */
import type {
  ReadingAssistReadingPathSummary,
  ReadingAssistPromptMountPlan,
  ReadingAssistActivePrompt,
  ReadingAssistActivePromptSelectionResult,
} from "../types/readingAssist";

/** Priority rank for tie-breaking: elevated > normal. */
const PRIORITY_RANK: Record<string, number> = {
  normal: 0,
  elevated: 1,
};

/** Posture rank for tie-breaking: inline_compare > inline_source > inline_gentle. */
const POSTURE_RANK: Record<string, number> = {
  inline_gentle: 0,
  inline_source: 1,
  inline_compare: 2,
};

/**
 * Returns all mount plans for a sentence in stable order (planIds).
 */
export function selectPromptMountPlansForSentence(
  readingPathSummary: ReadingAssistReadingPathSummary,
  sentenceId: string
): ReadingAssistPromptMountPlan[] {
  const { plans, planIds } = readingPathSummary.promptMountPlanSummary;
  const out: ReadingAssistPromptMountPlan[] = [];
  for (const id of planIds) {
    const plan = plans[id];
    if (plan && plan.sentenceId === sentenceId) out.push(plan);
  }
  return out;
}

/**
 * Returns only mountable and eligible plans for a sentence (stable order).
 */
export function selectMountablePromptPlansForSentence(
  readingPathSummary: ReadingAssistReadingPathSummary,
  sentenceId: string
): ReadingAssistPromptMountPlan[] {
  const plans = selectPromptMountPlansForSentence(readingPathSummary, sentenceId);
  return plans.filter(
    (p) => p.mountStatus === "mountable" && p.readiness === "eligible"
  );
}

/**
 * Returns the single primary mount plan for a sentence, or null.
 * Tie-breaking: priority (elevated > normal), then posture (compare > source > gentle), then planIds order.
 */
export function selectPrimaryPromptMountPlanForSentence(
  readingPathSummary: ReadingAssistReadingPathSummary,
  sentenceId: string
): ReadingAssistPromptMountPlan | null {
  const candidates = selectMountablePromptPlansForSentence(
    readingPathSummary,
    sentenceId
  );
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  let best = candidates[0];
  for (let i = 1; i < candidates.length; i++) {
    const curr = candidates[i];
    const priorityBest = PRIORITY_RANK[best.priority] ?? 0;
    const priorityCurr = PRIORITY_RANK[curr.priority] ?? 0;
    if (priorityCurr > priorityBest) {
      best = curr;
      continue;
    }
    if (priorityCurr < priorityBest) continue;

    const postureBest = POSTURE_RANK[best.posture] ?? 0;
    const postureCurr = POSTURE_RANK[curr.posture] ?? 0;
    if (postureCurr > postureBest) {
      best = curr;
      continue;
    }
    if (postureCurr < postureBest) continue;

    // Tied: keep first by planIds order (best already first)
  }
  return best;
}

/**
 * Builds app-facing active prompt from a mount plan (no extra fields).
 */
function activePromptFromPlan(plan: ReadingAssistPromptMountPlan): ReadingAssistActivePrompt {
  return {
    sentenceId: plan.sentenceId,
    anchorId: plan.anchorId,
    signalId: plan.signalId,
    bundleId: plan.bundleId,
    crossLinkId: plan.crossLinkId,
    slotId: plan.slotId,
    selectionId: plan.selectionId,
    recordId: plan.recordId,
    bindingId: plan.bindingId,
    presentationRecordId: plan.presentationRecordId,
    surfaceCandidateId: plan.surfaceCandidateId,
    mountPlanId: plan.id,
    title: plan.title,
    body: plan.body,
    actionKey: plan.actionKey,
    posture: plan.posture,
    readiness: plan.readiness,
    placement: plan.placement,
    affordance: plan.affordance,
    priority: plan.priority,
    mountStatus: plan.mountStatus,
    mountTrigger: plan.mountTrigger,
    expansionMode: plan.expansionMode,
    urgency: plan.urgency,
  };
}

/**
 * Returns the one active prompt for a sentence, or { activePrompt: null }.
 */
export function selectActivePromptForSentence(
  readingPathSummary: ReadingAssistReadingPathSummary,
  sentenceId: string
): ReadingAssistActivePromptSelectionResult {
  const plan = selectPrimaryPromptMountPlanForSentence(
    readingPathSummary,
    sentenceId
  );
  if (plan == null) return { activePrompt: null };
  return { activePrompt: activePromptFromPlan(plan) };
}

/**
 * Returns the active prompt for the focused (last examined) sentence, or { activePrompt: null }.
 */
export function selectActivePromptForFocusedSentence(
  readingPathSummary: ReadingAssistReadingPathSummary
): ReadingAssistActivePromptSelectionResult {
  const sentenceId = readingPathSummary.lastExaminedSentenceId;
  if (sentenceId == null || sentenceId === "") return { activePrompt: null };
  return selectActivePromptForSentence(readingPathSummary, sentenceId);
}
