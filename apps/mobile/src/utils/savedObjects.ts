/**
 * Rabbit Hole Core Groundwork v12 — Saved object derivation utilities.
 */
import type { SceneObjectRegion } from "../types/sceneRegions";
import type {
  SavedObjectItem,
  SavedObjectVerificationKind,
} from "../types/savedObjects";
import type { NodeClaimsAvailabilityKind } from "../types/evidenceAvailability";

const SAVED_OBJECT_ITEM_ID_PREFIX = "rh-saved-object|";

function normalizeIdSegment(s: string): string {
  return s.replace(/\|/g, "_");
}

/**
 * Deterministic id for a saved tray item. Same envelope + region yields same id.
 */
export function createSavedObjectItemId(
  envelopeId: string,
  regionId: string
): string {
  const safeEnvelope = normalizeIdSegment(envelopeId);
  const safeRegion = normalizeIdSegment(regionId);
  return `${SAVED_OBJECT_ITEM_ID_PREFIX}${safeEnvelope}|${safeRegion}`;
}

/**
 * Derive verification readiness from node and claims state.
 * "verified" reserved for later; not used in v12.
 */
export function deriveSavedObjectVerificationKind(
  knowledgeNodeId: string | undefined,
  claimsAvailability: NodeClaimsAvailabilityKind | null,
  hasCandidateOrEntity?: boolean
): SavedObjectVerificationKind {
  if (knowledgeNodeId && claimsAvailability === "has_claims") {
    return "evidenced";
  }
  if (knowledgeNodeId && (claimsAvailability === "no_claims_yet" || claimsAvailability === null)) {
    return "recognition_only";
  }
  if (!knowledgeNodeId && hasCandidateOrEntity) {
    return "recognition_only";
  }
  return "unverified";
}

/**
 * Build a SavedObjectItem from a scene region and optional resolved state.
 */
export function deriveSavedObjectItemFromRegion(
  region: SceneObjectRegion,
  options: {
    label?: string;
    knowledgeNodeId?: string;
    claimsAvailability?: NodeClaimsAvailabilityKind | null;
    relationEvidenceAvailable?: boolean;
    savedAt?: string;
  }
): SavedObjectItem {
  const savedAt = options.savedAt ?? new Date().toISOString();
  const knowledgeNodeId = options.knowledgeNodeId ?? region.knowledgeNodeId ?? undefined;
  const hasCandidateOrEntity = !!(region.recognitionCandidateId || region.identifiedEntityId);
  const verificationKind = deriveSavedObjectVerificationKind(
    knowledgeNodeId,
    options.claimsAvailability ?? null,
    hasCandidateOrEntity
  );

  return {
    id: createSavedObjectItemId(region.envelopeId, region.id),
    sourceEnvelopeId: region.envelopeId,
    sourceRegionId: region.id,
    recognitionCandidateId: region.recognitionCandidateId ?? undefined,
    identifiedEntityId: region.identifiedEntityId ?? undefined,
    knowledgeNodeId: knowledgeNodeId ?? undefined,
    label: options.label ?? region.label,
    savedAt,
    verificationKind,
  };
}
