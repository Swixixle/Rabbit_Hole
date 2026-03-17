/**
 * Rabbit Hole v15 — Map backend vision response to canonical candidate/entity.
 * Confidence from backend only; no inflation.
 */
import type { SceneObjectRegion } from "../types/sceneRegions";
import type { RecognitionCandidate } from "../types/recognition";
import type { IdentifiedEntity } from "../types/entityIdentification";
import type { VisionRecognitionResponse } from "../types/visionApi";
import { createRecognitionCandidateId } from "./recognition";
import { createIdentifiedEntityId } from "./entityIdentification";
import { normalizeIdentifiedEntityTitle } from "./entityIdentification";
import { mapRecognitionCandidateTypeToEntityKind } from "./entityIdentification";

/** RecognitionCandidate.confidence is required; use 0 when backend omits it. */
const NO_CONFIDENCE = 0;

export function createRecognitionCandidateFromVisionResponse(options: {
  region: SceneObjectRegion;
  response: VisionRecognitionResponse;
}): RecognitionCandidate {
  const { region, response } = options;
  const label = normalizeIdentifiedEntityTitle(response.label) || "Unlabeled object";
  const id = createRecognitionCandidateId(region.envelopeId, label, response.candidateType);
  const confidence =
    response.confidence != null && typeof response.confidence === "number"
      ? response.confidence
      : NO_CONFIDENCE;
  return {
    id,
    envelopeId: region.envelopeId,
    label,
    confidence,
    candidateType: response.candidateType,
  };
}

export function createIdentifiedEntityFromVisionCandidate(options: {
  envelopeId: string;
  candidate: RecognitionCandidate;
  createdAt?: string;
}): IdentifiedEntity {
  const created = options.createdAt ?? new Date().toISOString();
  const entityKind = mapRecognitionCandidateTypeToEntityKind(options.candidate.candidateType);
  const id = createIdentifiedEntityId(
    options.envelopeId,
    options.candidate.id,
    entityKind,
    options.candidate.label
  );
  return {
    id,
    envelopeId: options.envelopeId,
    candidateId: options.candidate.id,
    title: options.candidate.label,
    entityKind,
    confidence: options.candidate.confidence,
    createdAt: created,
  };
}
