/**
 * Rabbit Hole v10 — Evidence availability status descriptors.
 * Makes epistemic state legible without embedding content.
 */

export type RelationEvidenceAvailabilityKind =
  | "supported"
  | "not_yet_evidenced"
  | "unresolvable_relation";

export type NodeClaimsAvailabilityKind =
  | "has_claims"
  | "no_claims_yet";

export type RelationEvidenceAvailability = {
  edgeId?: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: string;
  kind: RelationEvidenceAvailabilityKind;
};

export type NodeClaimsAvailability = {
  nodeId: string;
  kind: NodeClaimsAvailabilityKind;
};
