/**
 * Rabbit Hole v8 — Provenance substrate tests.
 */
import type { ClaimRecord, SourceRecord, ClaimSupportEdge } from "../types/provenance";
import {
  selectClaimsForNode,
  selectSupportEdgesForClaim,
  selectSourcesForClaim,
} from "../utils/provenanceSelectors";

const CREATED = "2025-01-01T00:00:00Z";

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

describe("provenance selectors", () => {
  describe("selectClaimsForNode", () => {
    it("returns only claims for the given node", () => {
      const claims: ClaimRecord[] = [
        makeClaim("c1", "n1", "Claim A", "identity", 0.9),
        makeClaim("c2", "n2", "Claim B", "functional", 0.8),
        makeClaim("c3", "n1", "Claim C", "contextual", 0.85),
      ];
      const out = selectClaimsForNode("n1", claims);
      expect(out).toHaveLength(2);
      expect(out.map((c) => c.id).sort()).toEqual(["c1", "c3"]);
    });

    it("orders by confidence desc then id", () => {
      const claims: ClaimRecord[] = [
        makeClaim("c-low", "n1", "Low", "identity", 0.7),
        makeClaim("c-high", "n1", "High", "identity", 0.95),
        makeClaim("c-mid", "n1", "Mid", "identity", 0.95),
      ];
      const out = selectClaimsForNode("n1", claims);
      expect(out[0].confidence).toBe(0.95);
      expect(out[0].id).toBe("c-high"); // same confidence: id order
      expect(out[1].id).toBe("c-mid");
      expect(out[2].confidence).toBe(0.7);
    });

    it("returns empty array for node with no claims", () => {
      const claims: ClaimRecord[] = [
        makeClaim("c1", "n1", "Only n1", "identity", 0.9),
      ];
      expect(selectClaimsForNode("n99", claims)).toEqual([]);
    });
  });

  describe("selectSupportEdgesForClaim", () => {
    it("filters edges by claim and orders by supportKind then confidence then id", () => {
      const edges: ClaimSupportEdge[] = [
        makeSupport("e1", "claim-a", "src1", "mentions", 0.7),
        makeSupport("e2", "claim-a", "src2", "supports", 0.9),
        makeSupport("e3", "claim-b", "src1", "supports", 0.8),
        makeSupport("e4", "claim-a", "src3", "supports", 0.85),
      ];
      const out = selectSupportEdgesForClaim("claim-a", edges);
      expect(out).toHaveLength(3);
      expect(out[0].supportKind).toBe("supports");
      expect(out[0].confidence).toBe(0.9);
      expect(out[1].supportKind).toBe("supports");
      expect(out[1].confidence).toBe(0.85);
      expect(out[2].supportKind).toBe("mentions");
    });

    it("unsupported claim id returns empty array", () => {
      const edges: ClaimSupportEdge[] = [
        makeSupport("e1", "claim-a", "src1", "supports", 0.9),
      ];
      expect(selectSupportEdgesForClaim("claim-none", edges)).toEqual([]);
    });
  });

  describe("selectSourcesForClaim", () => {
    it("returns only sources linked via support edges", () => {
      const sources: SourceRecord[] = [
        makeSource("s1", "Source 1", "manufacturer", "S1"),
        makeSource("s2", "Source 2", "reference", "S2"),
        makeSource("s3", "Source 3", "manual", "S3"),
      ];
      const edges: ClaimSupportEdge[] = [
        makeSupport("e1", "claim-a", "s1", "supports", 0.9),
        makeSupport("e2", "claim-a", "s3", "supports", 0.8),
      ];
      const out = selectSourcesForClaim("claim-a", edges, sources);
      expect(out).toHaveLength(2);
      expect(out.map((s) => s.id).sort()).toEqual(["s1", "s3"]);
    });

    it("excludes missing sources safely", () => {
      const sources: SourceRecord[] = [
        makeSource("s1", "Source 1", "manufacturer", "S1"),
      ];
      const edges: ClaimSupportEdge[] = [
        makeSupport("e1", "claim-a", "s1", "supports", 0.9),
        makeSupport("e2", "claim-a", "missing-id", "supports", 0.8),
      ];
      const out = selectSourcesForClaim("claim-a", edges, sources);
      expect(out).toHaveLength(1);
      expect(out[0].id).toBe("s1");
    });

    it("one claim can resolve multiple sources", () => {
      const sources: SourceRecord[] = [
        makeSource("s1", "A", "manufacturer", "A"),
        makeSource("s2", "B", "reference", "B"),
      ];
      const edges: ClaimSupportEdge[] = [
        makeSupport("e1", "c1", "s1", "supports", 0.9),
        makeSupport("e2", "c1", "s2", "mentions", 0.7),
      ];
      const out = selectSourcesForClaim("c1", edges, sources);
      expect(out).toHaveLength(2);
    });

    it("unsupported claim id returns empty sources", () => {
      const sources: SourceRecord[] = [
        makeSource("s1", "Source 1", "manufacturer", "S1"),
      ];
      const edges: ClaimSupportEdge[] = [
        makeSupport("e1", "other-claim", "s1", "supports", 0.9),
      ];
      expect(selectSourcesForClaim("no-claim", edges, sources)).toEqual([]);
    });
  });
});
