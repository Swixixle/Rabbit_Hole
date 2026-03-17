/**
 * Rabbit Hole v9 — Relation evidence (edge–claim references) tests.
 */
import type { EdgeClaimReference } from "../types/relationEvidence";
import type { ClaimRecord, SourceRecord, ClaimSupportEdge } from "../types/provenance";
import type { EntityGraphEdge } from "../types/entityGraph";
import type { ExplorationTarget } from "../types/exploration";
import {
  selectClaimReferencesForEdge,
  selectClaimsForEdge,
  selectSourcesForEdge,
} from "../utils/relationEvidenceSelectors";
import { resolveExplorationEdgeForTarget } from "../utils/explorationEdgeResolver";

const CREATED = "2025-01-01T00:00:00Z";

function makeRef(id: string, edgeId: string, claimId: string): EdgeClaimReference {
  return { id, edgeId, claimId, createdAt: CREATED };
}

function makeClaim(
  id: string,
  nodeId: string,
  text: string,
  claimKind: ClaimRecord["claimKind"],
  confidence: number
): ClaimRecord {
  return { id, nodeId, text, claimKind, confidence, createdAt: CREATED };
}

function makeSource(
  id: string,
  title: string,
  sourceKind: SourceRecord["sourceKind"],
  citationLabel: string
): SourceRecord {
  return { id, title, sourceKind, citationLabel, createdAt: CREATED };
}

function makeSupport(
  id: string,
  claimId: string,
  sourceId: string,
  supportKind: ClaimSupportEdge["supportKind"],
  confidence: number
): ClaimSupportEdge {
  return { id, claimId, sourceId, supportKind, confidence, createdAt: CREATED };
}

function makeEntityEdge(
  id: string,
  sourceNodeId: string,
  targetNodeId: string,
  relationType: EntityGraphEdge["relationType"],
  confidence: number
): EntityGraphEdge {
  return { id, sourceNodeId, targetNodeId, relationType, confidence, createdAt: CREATED };
}

describe("relation evidence", () => {
  describe("selectClaimReferencesForEdge", () => {
    it("returns references for edge id in id order", () => {
      const refs: EdgeClaimReference[] = [
        makeRef("r2", "edge-a", "claim-2"),
        makeRef("r1", "edge-a", "claim-1"),
      ];
      const out = selectClaimReferencesForEdge("edge-a", refs);
      expect(out).toHaveLength(2);
      expect(out[0].id).toBe("r1");
      expect(out[1].id).toBe("r2");
    });

    it("unknown edge id returns empty array", () => {
      const refs: EdgeClaimReference[] = [makeRef("r1", "edge-a", "claim-1")];
      expect(selectClaimReferencesForEdge("edge-other", refs)).toEqual([]);
    });
  });

  describe("selectClaimsForEdge", () => {
    it("resolves claims for edge and orders by confidence desc then id", () => {
      const refs: EdgeClaimReference[] = [
        makeRef("r1", "e1", "c-low"),
        makeRef("r2", "e1", "c-high"),
      ];
      const claims: ClaimRecord[] = [
        makeClaim("c-low", "n1", "Low", "identity", 0.7),
        makeClaim("c-high", "n1", "High", "functional", 0.95),
      ];
      const out = selectClaimsForEdge("e1", refs, claims);
      expect(out).toHaveLength(2);
      expect(out[0].id).toBe("c-high");
      expect(out[1].id).toBe("c-low");
    });

    it("missing claims excluded safely", () => {
      const refs: EdgeClaimReference[] = [
        makeRef("r1", "e1", "c-real"),
        makeRef("r2", "e1", "c-missing"),
      ];
      const claims: ClaimRecord[] = [
        makeClaim("c-real", "n1", "Real", "identity", 0.9),
      ];
      const out = selectClaimsForEdge("e1", refs, claims);
      expect(out).toHaveLength(1);
      expect(out[0].id).toBe("c-real");
    });

    it("one edge can resolve multiple claims", () => {
      const refs: EdgeClaimReference[] = [
        makeRef("r1", "e1", "c1"),
        makeRef("r2", "e1", "c2"),
      ];
      const claims: ClaimRecord[] = [
        makeClaim("c1", "n1", "A", "identity", 0.8),
        makeClaim("c2", "n1", "B", "functional", 0.9),
      ];
      const out = selectClaimsForEdge("e1", refs, claims);
      expect(out).toHaveLength(2);
    });
  });

  describe("selectSourcesForEdge", () => {
    it("resolves sources through claim support edges", () => {
      const refs: EdgeClaimReference[] = [makeRef("r1", "e1", "c1")];
      const claims: ClaimRecord[] = [
        makeClaim("c1", "n1", "Claim", "identity", 0.9),
      ];
      const supportEdges: ClaimSupportEdge[] = [
        makeSupport("s1", "c1", "src-1", "supports", 0.9),
      ];
      const sources: SourceRecord[] = [
        makeSource("src-1", "Source 1", "manufacturer", "S1"),
      ];
      const out = selectSourcesForEdge("e1", refs, claims, supportEdges, sources);
      expect(out).toHaveLength(1);
      expect(out[0].title).toBe("Source 1");
    });

    it("missing sources excluded safely", () => {
      const refs: EdgeClaimReference[] = [makeRef("r1", "e1", "c1")];
      const claims: ClaimRecord[] = [
        makeClaim("c1", "n1", "Claim", "identity", 0.9),
      ];
      const supportEdges: ClaimSupportEdge[] = [
        makeSupport("s1", "c1", "src-missing", "supports", 0.9),
      ];
      const sources: SourceRecord[] = [
        makeSource("src-real", "Real", "reference", "R"),
      ];
      const out = selectSourcesForEdge("e1", refs, claims, supportEdges, sources);
      expect(out).toHaveLength(0);
    });
  });

  describe("resolveExplorationEdgeForTarget", () => {
    it("returns correct edge when single match", () => {
      const target: ExplorationTarget = {
        id: "edge-1",
        sourceNodeId: "n1",
        targetNodeId: "n2",
        label: "Target",
        relationType: "is_a",
        confidence: 0.9,
        createdAt: CREATED,
      };
      const edges: EntityGraphEdge[] = [
        makeEntityEdge("edge-1", "n1", "n2", "is_a", 0.9),
      ];
      const out = resolveExplorationEdgeForTarget("n1", target, edges);
      expect(out).not.toBeNull();
      expect(out!.id).toBe("edge-1");
    });

    it("returns null when no match", () => {
      const target: ExplorationTarget = {
        id: "x",
        sourceNodeId: "n1",
        targetNodeId: "n99",
        label: "Other",
        relationType: "related_to",
        confidence: 0.8,
        createdAt: CREATED,
      };
      const edges: EntityGraphEdge[] = [
        makeEntityEdge("edge-1", "n1", "n2", "is_a", 0.9),
      ];
      const out = resolveExplorationEdgeForTarget("n1", target, edges);
      expect(out).toBeNull();
    });

    it("multiple matches: highest confidence then id order", () => {
      const target: ExplorationTarget = {
        id: "edge-a",
        sourceNodeId: "n1",
        targetNodeId: "n2",
        label: "Target",
        relationType: "is_a",
        confidence: 0.9,
        createdAt: CREATED,
      };
      const edges: EntityGraphEdge[] = [
        makeEntityEdge("edge-b", "n1", "n2", "is_a", 0.85),
        makeEntityEdge("edge-a", "n1", "n2", "is_a", 0.95),
      ];
      const out = resolveExplorationEdgeForTarget("n1", target, edges);
      expect(out).not.toBeNull();
      expect(out!.confidence).toBe(0.95);
      expect(out!.id).toBe("edge-a");
    });

    it("same confidence: stable id order", () => {
      const target: ExplorationTarget = {
        id: "edge-z",
        sourceNodeId: "n1",
        targetNodeId: "n2",
        label: "Target",
        relationType: "is_a",
        confidence: 0.9,
        createdAt: CREATED,
      };
      const edges: EntityGraphEdge[] = [
        makeEntityEdge("edge-z", "n1", "n2", "is_a", 0.9),
        makeEntityEdge("edge-a", "n1", "n2", "is_a", 0.9),
      ];
      const out = resolveExplorationEdgeForTarget("n1", target, edges);
      expect(out).not.toBeNull();
      expect(out!.id).toBe("edge-a");
    });
  });
});
