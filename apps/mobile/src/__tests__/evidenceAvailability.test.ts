/**
 * Rabbit Hole v10 — Evidence availability selectors tests.
 */
import type { ExplorationTarget } from "../types/exploration";
import type { EntityGraphEdge } from "../types/entityGraph";
import type { EdgeClaimReference } from "../types/relationEvidence";
import type { ClaimRecord } from "../types/provenance";
import {
  selectRelationEvidenceAvailability,
  selectNodeClaimsAvailability,
} from "../utils/evidenceAvailabilitySelectors";

const CREATED = "2025-01-01T00:00:00Z";

function makeRef(edgeId: string, claimId: string): EdgeClaimReference {
  return { id: `ref|${edgeId}|${claimId}`, edgeId, claimId, createdAt: CREATED };
}

function makeClaim(
  id: string,
  nodeId: string,
  _text: string,
  claimKind: ClaimRecord["claimKind"],
  confidence: number
): ClaimRecord {
  return { id, nodeId, text: "x", claimKind, confidence, createdAt: CREATED };
}

function makeEdge(
  id: string,
  sourceNodeId: string,
  targetNodeId: string,
  relationType: EntityGraphEdge["relationType"],
  confidence: number
): EntityGraphEdge {
  return { id, sourceNodeId, targetNodeId, relationType, confidence, createdAt: CREATED };
}

function makeTarget(
  id: string,
  sourceNodeId: string,
  targetNodeId: string,
  relationType: ExplorationTarget["relationType"],
  label: string
): ExplorationTarget {
  return {
    id,
    sourceNodeId,
    targetNodeId,
    label,
    relationType,
    confidence: 0.9,
    createdAt: CREATED,
  };
}

describe("evidence availability", () => {
  describe("selectRelationEvidenceAvailability", () => {
    const sourceNodeId = "n1";
    const targetNodeId = "n2";
    const target = makeTarget("e1", sourceNodeId, targetNodeId, "is_a", "Category");
    const edges: EntityGraphEdge[] = [
      makeEdge("e1", sourceNodeId, targetNodeId, "is_a", 0.9),
    ];

    it("returns supported when edge resolves and refs exist", () => {
      const refs: EdgeClaimReference[] = [makeRef("e1", "claim-1")];
      const out = selectRelationEvidenceAvailability(
        sourceNodeId,
        target,
        edges,
        refs
      );
      expect(out.kind).toBe("supported");
      expect(out.edgeId).toBe("e1");
    });

    it("returns not_yet_evidenced when edge resolves and no refs exist", () => {
      const refs: EdgeClaimReference[] = [];
      const out = selectRelationEvidenceAvailability(
        sourceNodeId,
        target,
        edges,
        refs
      );
      expect(out.kind).toBe("not_yet_evidenced");
      expect(out.edgeId).toBe("e1");
    });

    it("returns unresolvable_relation when edge cannot be resolved", () => {
      const wrongTarget = makeTarget(
        "e99",
        sourceNodeId,
        "n99",
        "related_to",
        "Other"
      );
      const refs: EdgeClaimReference[] = [];
      const out = selectRelationEvidenceAvailability(
        sourceNodeId,
        wrongTarget,
        edges,
        refs
      );
      expect(out.kind).toBe("unresolvable_relation");
      expect(out.edgeId).toBeUndefined();
    });
  });

  describe("selectNodeClaimsAvailability", () => {
    it("returns has_claims when node has claims", () => {
      const claims: ClaimRecord[] = [
        makeClaim("c1", "n1", "A", "identity", 0.9),
      ];
      const out = selectNodeClaimsAvailability("n1", claims);
      expect(out.kind).toBe("has_claims");
      expect(out.nodeId).toBe("n1");
    });

    it("returns no_claims_yet when none exist", () => {
      const claims: ClaimRecord[] = [
        makeClaim("c1", "n2", "B", "functional", 0.8),
      ];
      const out = selectNodeClaimsAvailability("n1", claims);
      expect(out.kind).toBe("no_claims_yet");
    });
  });
});
