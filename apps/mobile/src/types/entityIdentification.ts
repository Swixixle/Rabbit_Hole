/**
 * Rabbit Hole Core Groundwork v3 — Entity Identification Layer.
 * RecognitionCandidate is raw recognition output; IdentifiedEntity is normalized
 * interpretation-ready output. Nodes (EntityNode, TopicNode, etc.) come later.
 * This layer is the bridge between recognition and node conversion.
 */

/** Normalized entity kind; aligns with recognition candidate types in v3. */
export type RabbitHoleEntityKind =
  | "entity"
  | "topic"
  | "product"
  | "landmark"
  | "media";

/** Final pre-node identification object. Ready for node conversion later. */
export type IdentifiedEntity = {
  id: string;
  envelopeId: string;
  candidateId: string;
  title: string;
  entityKind: RabbitHoleEntityKind;
  confidence: number;
  createdAt: string;
};

/** Collection of identified entities keyed by id with stable order. */
export type IdentifiedEntitySummary = {
  entities: Record<string, IdentifiedEntity>;
  entityIds: string[];
};

export const DEFAULT_IDENTIFIED_ENTITY_SUMMARY: IdentifiedEntitySummary = {
  entities: {},
  entityIds: [],
};
