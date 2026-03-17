/**
 * Rabbit Hole Core Groundwork v7 — Unified exploration graph tests.
 */
import type { KnowledgeNode } from "../types/knowledgeNodes";
import type { EntityGraphEdge } from "../types/entityGraph";
import type { BranchRecord } from "../types/branches";
import type { ExplorationEdge } from "../types/exploration";
import { adaptEntityGraphEdgesToExplorationEdges } from "../utils/exploration";
import {
  deriveExplorationTargetsForNode,
  deriveExplorationTargetsForNodeBranch,
} from "../utils/exploration";
import {
  selectExplorationTargetsForNode,
  selectExplorationTargetsForNodeBranch,
} from "../utils/explorationSelectors";
import { createBranchRecordId } from "../utils/branches";

const CREATED = "2025-01-01T00:00:00Z";

function makeNode(
  id: string,
  title: string,
  nodeKind: KnowledgeNode["nodeKind"]
): KnowledgeNode {
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

describe("exploration", () => {
  describe("adaptEntityGraphEdgesToExplorationEdges", () => {
    it("maps EntityGraphEdge[] to ExplorationEdge[] structurally", () => {
      const entityEdges: EntityGraphEdge[] = [
        makeEdge("n1", "n2", "is_a"),
        makeEdge("n1", "n3", "alternative_to"),
      ];
      const out = adaptEntityGraphEdgesToExplorationEdges(entityEdges);
      expect(out).toHaveLength(2);
      expect(out[0].id).toBe(entityEdges[0].id);
      expect(out[0].sourceNodeId).toBe("n1");
      expect(out[0].targetNodeId).toBe("n2");
      expect(out[0].relationType).toBe("is_a");
      expect(out[0].confidence).toBe(0.9);
    });

    it("preserves stable order", () => {
      const entityEdges: EntityGraphEdge[] = [
        makeEdge("a", "b", "made_of"),
        makeEdge("a", "c", "is_a"),
      ];
      const out = adaptEntityGraphEdgesToExplorationEdges(entityEdges);
      expect(out[0].relationType).toBe("made_of");
      expect(out[1].relationType).toBe("is_a");
    });
  });

  describe("deriveExplorationTargetsForNode", () => {
    const nodeId = "node-1";
    const node = makeNode(nodeId, "Product", "product");
    const nodes: KnowledgeNode[] = [
      node,
      makeNode("n2", "Category", "topic"),
      makeNode("n3", "Other", "product"),
      makeNode("n4", "Material", "entity"),
    ];
    const entityEdges: EntityGraphEdge[] = [
      makeEdge(nodeId, "n2", "is_a"),
      makeEdge(nodeId, "n3", "alternative_to"),
      makeEdge(nodeId, "n4", "made_of"),
    ];
    const edges = adaptEntityGraphEdgesToExplorationEdges(entityEdges);

    it("returns all valid outgoing targets", () => {
      const targets = deriveExplorationTargetsForNode(node, nodes, edges);
      expect(targets).toHaveLength(3);
      expect(targets.map((t) => t.targetNodeId).sort()).toEqual(["n2", "n3", "n4"]);
    });

    it("excludes missing target nodes", () => {
      const withOrphan: ExplorationEdge[] = [
        ...edges,
        { id: "e4", sourceNodeId: nodeId, targetNodeId: "missing", relationType: "related_to", confidence: 0.8, createdAt: CREATED },
      ];
      const targets = deriveExplorationTargetsForNode(node, nodes, withOrphan);
      expect(targets.every((t) => t.targetNodeId !== "missing")).toBe(true);
      expect(targets).toHaveLength(3);
    });

    it("follows deterministic ordering: relation-type priority then confidence then edge id", () => {
      const targets = deriveExplorationTargetsForNode(node, nodes, edges);
      const types = targets.map((t) => t.relationType);
      expect(types[0]).toBe("is_a");
      expect(types[1]).toBe("made_of");
      expect(types[2]).toBe("alternative_to");
    });
  });

  describe("deriveExplorationTargetsForNodeBranch", () => {
    const nodeId = "node-p";
    const node = makeNode(nodeId, "Sony WH-1000XM5", "product");
    const nodes: KnowledgeNode[] = [
      node,
      makeNode("nh", "Headphones", "topic"),
      makeNode("nb", "Bose", "product"),
      makeNode("nbatt", "Battery", "entity"),
      makeNode("nt", "Travel", "topic"),
    ];
    const edges = adaptEntityGraphEdgesToExplorationEdges([
      makeEdge(nodeId, "nh", "is_a"),
      makeEdge(nodeId, "nb", "alternative_to"),
      makeEdge(nodeId, "nbatt", "made_of"),
      makeEdge(nodeId, "nt", "used_for"),
    ]);

    it("learn branch returns is_a, related_to, part_of targets", () => {
      const branch: BranchRecord = {
        id: createBranchRecordId(nodeId, "learn"),
        nodeId,
        kind: "learn",
        title: "Learn",
        createdAt: CREATED,
      };
      const targets = deriveExplorationTargetsForNodeBranch(node, branch, nodes, edges);
      expect(targets).toHaveLength(1);
      expect(targets[0].label).toBe("Headphones");
      expect(targets[0].relationType).toBe("is_a");
    });

    it("materials branch returns made_of targets", () => {
      const branch: BranchRecord = {
        id: createBranchRecordId(nodeId, "materials"),
        nodeId,
        kind: "materials",
        title: "Materials",
        createdAt: CREATED,
      };
      const targets = deriveExplorationTargetsForNodeBranch(node, branch, nodes, edges);
      expect(targets).toHaveLength(1);
      expect(targets[0].label).toBe("Battery");
      expect(targets[0].relationType).toBe("made_of");
    });

    it("uses branch returns used_for targets", () => {
      const branch: BranchRecord = {
        id: createBranchRecordId(nodeId, "uses"),
        nodeId,
        kind: "uses",
        title: "Uses",
        createdAt: CREATED,
      };
      const targets = deriveExplorationTargetsForNodeBranch(node, branch, nodes, edges);
      expect(targets).toHaveLength(1);
      expect(targets[0].label).toBe("Travel");
      expect(targets[0].relationType).toBe("used_for");
    });

    it("alternatives/compare return alternative_to targets", () => {
      const branch: BranchRecord = {
        id: createBranchRecordId(nodeId, "alternatives"),
        nodeId,
        kind: "alternatives",
        title: "Alternatives",
        createdAt: CREATED,
      };
      const targets = deriveExplorationTargetsForNodeBranch(node, branch, nodes, edges);
      expect(targets).toHaveLength(1);
      expect(targets[0].label).toBe("Bose");
      expect(targets[0].relationType).toBe("alternative_to");
    });

    it("unsupported branch kinds return empty arrays", () => {
      const branch: BranchRecord = {
        id: createBranchRecordId(nodeId, "market"),
        nodeId,
        kind: "market",
        title: "Market",
        createdAt: CREATED,
      };
      const targets = deriveExplorationTargetsForNodeBranch(node, branch, nodes, edges);
      expect(targets).toEqual([]);
    });
  });

  describe("selector parity", () => {
    const nodeId = "n1";
    const node = makeNode(nodeId, "Thing", "product");
    const nodes: KnowledgeNode[] = [
      node,
      makeNode("n2", "Category", "topic"),
    ];
    const entityEdges: EntityGraphEdge[] = [
      makeEdge(nodeId, "n2", "is_a"),
    ];

    it("selectExplorationTargetsForNode and selectExplorationTargetsForNodeBranch both resolve from same graph", () => {
      const related = selectExplorationTargetsForNode(node, nodes, entityEdges);
      const branch: BranchRecord = {
        id: createBranchRecordId(nodeId, "learn"),
        nodeId,
        kind: "learn",
        title: "Learn",
        createdAt: CREATED,
      };
      const branchTargets = selectExplorationTargetsForNodeBranch(
        node,
        branch,
        nodes,
        entityEdges
      );
      expect(related).toHaveLength(1);
      expect(branchTargets).toHaveLength(1);
      expect(related[0].targetNodeId).toBe(branchTargets[0].targetNodeId);
      expect(related[0].label).toBe(branchTargets[0].label);
    });
  });
});
