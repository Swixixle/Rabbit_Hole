/**
 * Rabbit Hole Core Groundwork v6 — Branch records and targets tests.
 */
import type { KnowledgeNode } from "../types/knowledgeNodes";
import type { EntityGraphEdge } from "../types/entityGraph";
import type { BranchRecord } from "../types/branches";
import {
  createBranchRecordId,
  deriveBranchRecordsForNode,
  deriveBranchTargetsForNodeBranch,
} from "../utils/branches";

const CREATED = "2025-01-01T00:00:00Z";

function makeNode(id: string, title: string, nodeKind: KnowledgeNode["nodeKind"]): KnowledgeNode {
  return {
    id,
    identifiedEntityId: `entity-${id}`,
    envelopeId: "env",
    title,
    nodeKind,
    description: null,
    relatedNodeIds: [],
    sourceIds: [],
    confidence: 0.9,
    createdAt: CREATED,
  };
}

function makeEdge(
  sourceNodeId: string,
  targetNodeId: string,
  relationType: EntityGraphEdge["relationType"]
): EntityGraphEdge {
  return {
    id: `edge|${sourceNodeId}|${targetNodeId}|${relationType}`,
    sourceNodeId,
    targetNodeId,
    relationType,
    confidence: 0.9,
    createdAt: CREATED,
  };
}

describe("branches", () => {
  describe("createBranchRecordId", () => {
    it("is deterministic for same nodeId and kind", () => {
      const a = createBranchRecordId("node-1", "learn");
      const b = createBranchRecordId("node-1", "learn");
      expect(a).toBe(b);
      expect(a).toMatch(/^rh-branch-record\|/);
    });

    it("differs when kind differs", () => {
      const a = createBranchRecordId("node-1", "learn");
      const b = createBranchRecordId("node-1", "alternatives");
      expect(a).not.toBe(b);
    });

    it("differs when nodeId differs", () => {
      const a = createBranchRecordId("node-1", "learn");
      const b = createBranchRecordId("node-2", "learn");
      expect(a).not.toBe(b);
    });
  });

  describe("deriveBranchRecordsForNode", () => {
    it("produces stable branch records from node", () => {
      const node = makeNode("n1", "Sony WH-1000XM5", "product");
      const records = deriveBranchRecordsForNode(node);
      expect(records.length).toBeGreaterThan(0);
      expect(records.every((r) => r.nodeId === node.id)).toBe(true);
      const kinds = records.map((r) => r.kind);
      expect(kinds).toContain("learn");
      expect(kinds).toContain("alternatives");
      expect(kinds).toContain("materials");
    });

    it("orders branches deterministically from slot order", () => {
      const node = makeNode("n1", "Product", "product");
      const first = deriveBranchRecordsForNode(node);
      const second = deriveBranchRecordsForNode(node);
      expect(second.map((r) => r.id)).toEqual(first.map((r) => r.id));
    });

    it("each record has deterministic id", () => {
      const node = makeNode("n1", "Landmark", "landmark");
      const records = deriveBranchRecordsForNode(node);
      for (const r of records) {
        expect(r.id).toBe(createBranchRecordId(node.id, r.kind));
      }
    });
  });

  describe("deriveBranchTargetsForNodeBranch", () => {
    const nodeId = "node-product";
    const node = makeNode(nodeId, "Sony WH-1000XM5", "product");
    const headphoneId = "node-headphones";
    const boseId = "node-bose";
    const batteryId = "node-battery";
    const nodes: KnowledgeNode[] = [
      node,
      makeNode(headphoneId, "Headphones", "topic"),
      makeNode(boseId, "Bose QC Ultra", "product"),
      makeNode(batteryId, "Lithium battery", "entity"),
    ];
    const edges: EntityGraphEdge[] = [
      makeEdge(nodeId, headphoneId, "is_a"),
      makeEdge(nodeId, boseId, "alternative_to"),
      makeEdge(nodeId, batteryId, "made_of"),
    ];

    it("alternatives branch returns alternative_to targets", () => {
      const branch: BranchRecord = {
        id: createBranchRecordId(nodeId, "alternatives"),
        nodeId,
        kind: "alternatives",
        title: "Alternatives",
        createdAt: CREATED,
      };
      const targets = deriveBranchTargetsForNodeBranch(node, branch, nodes, edges);
      expect(targets.length).toBe(1);
      expect(targets[0].label).toBe("Bose QC Ultra");
      expect(targets[0].relationType).toBe("alternative_to");
    });

    it("materials branch returns made_of targets", () => {
      const branch: BranchRecord = {
        id: createBranchRecordId(nodeId, "materials"),
        nodeId,
        kind: "materials",
        title: "Materials",
        createdAt: CREATED,
      };
      const targets = deriveBranchTargetsForNodeBranch(node, branch, nodes, edges);
      expect(targets.length).toBe(1);
      expect(targets[0].label).toBe("Lithium battery");
      expect(targets[0].relationType).toBe("made_of");
    });

    it("learn branch returns is_a / related_to / part_of targets", () => {
      const branch: BranchRecord = {
        id: createBranchRecordId(nodeId, "learn"),
        nodeId,
        kind: "learn",
        title: "Learn",
        createdAt: CREATED,
      };
      const targets = deriveBranchTargetsForNodeBranch(node, branch, nodes, edges);
      expect(targets.length).toBe(1);
      expect(targets[0].label).toBe("Headphones");
      expect(targets[0].relationType).toBe("is_a");
    });

    it("unsupported branch kinds return empty target arrays", () => {
      const branchHistory: BranchRecord = {
        id: createBranchRecordId(nodeId, "history"),
        nodeId,
        kind: "history",
        title: "History",
        createdAt: CREATED,
      };
      const branchMarket: BranchRecord = {
        id: createBranchRecordId(nodeId, "market"),
        nodeId,
        kind: "market",
        title: "Market",
        createdAt: CREATED,
      };
      expect(deriveBranchTargetsForNodeBranch(node, branchHistory, nodes, edges)).toEqual([]);
      expect(deriveBranchTargetsForNodeBranch(node, branchMarket, nodes, edges)).toEqual([]);
    });

    it("missing target nodes are excluded", () => {
      const orphanEdge = makeEdge(nodeId, "missing-node-id", "alternative_to");
      const branch: BranchRecord = {
        id: createBranchRecordId(nodeId, "alternatives"),
        nodeId,
        kind: "alternatives",
        title: "Alternatives",
        createdAt: CREATED,
      };
      const targets = deriveBranchTargetsForNodeBranch(node, branch, nodes, [
        ...edges,
        orphanEdge,
      ]);
      expect(targets.every((t) => t.targetNodeId !== "missing-node-id")).toBe(true);
      expect(targets.length).toBe(1);
    });
  });
});
