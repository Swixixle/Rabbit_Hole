/**
 * Landmark Recognition Groundwork v1 — interpretation reducer and claim placeholder step.
 * Converts recognition candidates into interpretation envelopes and claim placeholders.
 * No semantic logic; deterministic pipeline only.
 */
import type {
  VisualCapture,
  VisualRecognitionCandidate,
  LandmarkInterpretation,
  LandmarkClaimPlaceholder,
} from "../types/visualCapture";

const LANDMARK_INTERPRETATION_ID_PREFIX = "landmark-interpretation|";
const LANDMARK_CLAIM_PLACEHOLDER_ID_PREFIX = "landmark-claim-placeholder|";

/** Deterministic id for a landmark interpretation. */
export function createLandmarkInterpretationId(
  captureId: string,
  candidateId: string
): string {
  return `${LANDMARK_INTERPRETATION_ID_PREFIX}${captureId}|${candidateId}`;
}

/**
 * Converts recognition candidates into interpretation envelopes.
 * One LandmarkInterpretation per candidate; deterministic IDs.
 */
export function deriveLandmarkInterpretations(
  capture: VisualCapture,
  candidates: VisualRecognitionCandidate[]
): LandmarkInterpretation[] {
  return candidates.map((c) => ({
    id: createLandmarkInterpretationId(capture.id, c.id),
    captureId: capture.id,
    candidateId: c.id,
    entityName: c.label,
    confidence: c.confidence,
  }));
}

/** Deterministic id for a landmark-derived claim placeholder. */
export function createLandmarkClaimPlaceholderId(interpretationId: string): string {
  return `${LANDMARK_CLAIM_PLACEHOLDER_ID_PREFIX}${interpretationId}`;
}

/**
 * Converts landmark interpretations into claim placeholders.
 * Placeholder text format: "{entityName} is a landmark."
 * No external sources yet.
 */
export function deriveLandmarkClaimPlaceholders(
  interpretations: LandmarkInterpretation[]
): LandmarkClaimPlaceholder[] {
  return interpretations.map((interp) => ({
    id: createLandmarkClaimPlaceholderId(interp.id),
    interpretationId: interp.id,
    text: `${interp.entityName} is a landmark.`,
    confidence: interp.confidence,
  }));
}
