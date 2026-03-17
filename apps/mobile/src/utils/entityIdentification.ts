/**
 * Rabbit Hole Core Groundwork v3 — Entity identification helpers.
 * Converts RecognitionCandidate into IdentifiedEntity (normalized, interpretation-ready).
 * RecognitionCandidate is raw recognition output; IdentifiedEntity is the bridge before
 * full node conversion (EntityNode, TopicNode, MarketNode).
 */
import type {
  RecognitionEnvelope,
  RecognitionCandidate,
  RecognitionCandidateSummary,
} from "../types/recognition";
import type { RabbitHoleEntityKind, IdentifiedEntity, IdentifiedEntitySummary } from "../types/entityIdentification";

const IDENTIFIED_ENTITY_ID_PREFIX = "rh-identified-entity|";

/** Normalize a segment for use in deterministic ids (no pipe so format stays parseable). */
function normalizeIdSegment(s: string): string {
  return s.replace(/\|/g, "_");
}

/**
 * Light normalization for exploration-facing title: trim, collapse internal whitespace.
 * Does not title-case or add semantics.
 */
export function normalizeIdentifiedEntityTitle(label: string): string {
  return label.trim().replace(/\s+/g, " ");
}

/**
 * Direct mapping from recognition candidate type to entity kind. No inference in v3.
 */
export function mapRecognitionCandidateTypeToEntityKind(
  candidateType: RecognitionCandidate["candidateType"]
): RabbitHoleEntityKind {
  return candidateType;
}

/**
 * Deterministic id for an identified entity. Same inputs always yield the same id.
 * Title is normalized before use in id; envelopeId and title are safe-segmented.
 */
export function createIdentifiedEntityId(
  envelopeId: string,
  candidateId: string,
  entityKind: RabbitHoleEntityKind,
  title: string
): string {
  const safeTitle = normalizeIdSegment(normalizeIdentifiedEntityTitle(title));
  const safeEnvelope = normalizeIdSegment(envelopeId);
  return `${IDENTIFIED_ENTITY_ID_PREFIX}${safeEnvelope}|${entityKind}|${safeTitle}`;
}

/**
 * Convert recognition candidates into identified entities. Preserves candidateIds order;
 * no sorting, filtering, or semantic resolution. Uses provided createdAt or current ISO.
 */
export function deriveIdentifiedEntities(args: {
  envelope: RecognitionEnvelope;
  candidateSummary: RecognitionCandidateSummary;
  createdAt?: string;
}): IdentifiedEntitySummary {
  const { envelope, candidateSummary, createdAt } = args;
  const created = createdAt ?? new Date().toISOString();
  const entities: Record<string, IdentifiedEntity> = {};
  const entityIds: string[] = [];
  for (const candidateId of candidateSummary.candidateIds) {
    const candidate = candidateSummary.candidates[candidateId];
    if (!candidate) continue;
    const title = normalizeIdentifiedEntityTitle(candidate.label);
    const entityKind = mapRecognitionCandidateTypeToEntityKind(candidate.candidateType);
    const id = createIdentifiedEntityId(envelope.id, candidate.id, entityKind, title);
    if (entities[id]) continue;
    entities[id] = {
      id,
      envelopeId: envelope.id,
      candidateId: candidate.id,
      title,
      entityKind,
      confidence: candidate.confidence,
      createdAt: created,
    };
    entityIds.push(id);
  }
  return { entities, entityIds };
}
