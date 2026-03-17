/**
 * Rabbit Hole v14 — Honest manual recognition stub.
 * Creates candidate and entity from user input; resolves to existing sample node only on exact label match.
 * Does not invent knowledge or create new rich nodes.
 */
import type { RecognitionCandidate } from "../types/recognition";
import type { IdentifiedEntity } from "../types/entityIdentification";
import type { KnowledgeNode } from "../types/knowledgeNodes";
import type { SceneObjectRegion } from "../types/sceneRegions";
import { createRecognitionCandidateId } from "./recognition";
import { createIdentifiedEntityId } from "./entityIdentification";
import { normalizeIdentifiedEntityTitle } from "./entityIdentification";
import { mapRecognitionCandidateTypeToEntityKind } from "./entityIdentification";

const MANUAL_CONFIDENCE = 0.5;

export function createManualRecognitionCandidateFromRegion(options: {
  region: SceneObjectRegion;
  label: string;
  candidateType?: RecognitionCandidate["candidateType"];
}): RecognitionCandidate {
  const label = normalizeIdentifiedEntityTitle(options.label) || "Unlabeled object";
  const candidateType = options.candidateType ?? "entity";
  const id = createRecognitionCandidateId(options.region.envelopeId, label, candidateType);
  return {
    id,
    envelopeId: options.region.envelopeId,
    label,
    confidence: MANUAL_CONFIDENCE,
    candidateType,
  };
}

export function createIdentifiedEntityFromManualCandidate(options: {
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

/**
 * Resolve to an existing sample node only if the manual label exactly matches a node title (normalized).
 * Returns null otherwise. Does not create nodes.
 */
export function resolveKnowledgeNodeForManualEntity(
  label: string,
  nodes: KnowledgeNode[]
): KnowledgeNode | null {
  const normalized = normalizeIdentifiedEntityTitle(label);
  if (!normalized) return null;
  return nodes.find((n) => normalizeIdentifiedEntityTitle(n.title) === normalized) ?? null;
}
