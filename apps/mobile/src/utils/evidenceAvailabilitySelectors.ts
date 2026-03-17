/**
 * Rabbit Hole v10 — Evidence availability selectors.
 */
import type { ExplorationTarget } from "../types/exploration";
import type { EntityGraphEdge } from "../types/entityGraph";
import type { EdgeClaimReference } from "../types/relationEvidence";
import type { ClaimRecord } from "../types/provenance";
import type {
  RelationEvidenceAvailability,
  NodeClaimsAvailability,
} from "../types/evidenceAvailability";
import { resolveExplorationEdgeForTarget } from "./explorationEdgeResolver";
import { selectClaimReferencesForEdge } from "./relationEvidenceSelectors";

/**
 * Relation evidence availability: supported, not_yet_evidenced, or unresolvable_relation.
 */
export function selectRelationEvidenceAvailability(
  sourceNodeId: string,
  target: ExplorationTarget,
  entityGraphEdges: EntityGraphEdge[],
  refs: EdgeClaimReference[]
): RelationEvidenceAvailability {
  const edge = resolveExplorationEdgeForTarget(
    sourceNodeId,
    target,
    entityGraphEdges
  );
  if (!edge) {
    return {
      sourceNodeId,
      targetNodeId: target.targetNodeId,
      relationType: target.relationType,
      kind: "unresolvable_relation",
    };
  }
  const edgeRefs = selectClaimReferencesForEdge(edge.id, refs);
  const kind = edgeRefs.length > 0 ? "supported" : "not_yet_evidenced";
  return {
    edgeId: edge.id,
    sourceNodeId,
    targetNodeId: target.targetNodeId,
    relationType: target.relationType,
    kind,
  };
}

/**
 * Node claims availability: has_claims or no_claims_yet.
 */
export function selectNodeClaimsAvailability(
  nodeId: string,
  claims: ClaimRecord[]
): NodeClaimsAvailability {
  const count = claims.filter((c) => c.nodeId === nodeId).length;
  return {
    nodeId,
    kind: count >= 1 ? "has_claims" : "no_claims_yet",
  };
}
