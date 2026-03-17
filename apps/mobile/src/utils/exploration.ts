/**
 * Rabbit Hole Core Groundwork v7 — Unified exploration graph derivation.
 * One graph source; related summary and branch targets are derived views.
 */
import type { KnowledgeNode } from "../types/knowledgeNodes";
import type { EntityGraphEdge } from "../types/entityGraph";
import type { BranchRecord } from "../types/branches";
import type {
  ExplorationEdge,
  ExplorationTarget,
  ExplorationRelationType,
} from "../types/exploration";

/** Structural mapping; preserves input order. */
export function adaptEntityGraphEdgesToExplorationEdges(
  edges: EntityGraphEdge[]
): ExplorationEdge[] {
  return edges.map((e) => ({
    id: e.id,
    sourceNodeId: e.sourceNodeId,
    targetNodeId: e.targetNodeId,
    relationType: e.relationType as ExplorationRelationType,
    confidence: e.confidence,
    createdAt: e.createdAt,
  }));
}

const RELATION_TYPE_PRIORITY: ExplorationRelationType[] = [
  "is_a",
  "part_of",
  "related_to",
  "produced_by",
  "made_of",
  "used_for",
  "alternative_to",
];

function relationPriority(rt: ExplorationRelationType): number {
  const i = RELATION_TYPE_PRIORITY.indexOf(rt);
  return i >= 0 ? i : RELATION_TYPE_PRIORITY.length;
}

/**
 * All outgoing exploration targets for a node. Excludes missing target nodes.
 * Order: relation-type priority, then confidence desc, then edge id.
 */
export function deriveExplorationTargetsForNode(
  node: KnowledgeNode,
  allNodes: KnowledgeNode[],
  edges: ExplorationEdge[]
): ExplorationTarget[] {
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
  const outgoing = edges.filter((e) => e.sourceNodeId === node.id);
  const withTarget: Array<{ edge: ExplorationEdge; targetNode: KnowledgeNode }> = [];
  for (const e of outgoing) {
    const targetNode = nodeMap.get(e.targetNodeId);
    if (!targetNode) continue;
    withTarget.push({ edge: e, targetNode });
  }
  withTarget.sort((a, b) => {
    const pa = relationPriority(a.edge.relationType);
    const pb = relationPriority(b.edge.relationType);
    if (pa !== pb) return pa - pb;
    if (a.edge.confidence !== b.edge.confidence) return b.edge.confidence - a.edge.confidence;
    return a.edge.id.localeCompare(b.edge.id);
  });
  return withTarget.map(({ edge, targetNode }) => ({
    id: edge.id,
    sourceNodeId: edge.sourceNodeId,
    targetNodeId: edge.targetNodeId,
    label: targetNode.title,
    relationType: edge.relationType,
    confidence: edge.confidence,
    createdAt: edge.createdAt,
  }));
}

/** Relation types allowed per branch kind (v6 mapping). */
function relationTypesForBranchKind(
  kind: BranchRecord["kind"]
): ExplorationRelationType[] {
  switch (kind) {
    case "alternatives":
    case "compare":
      return ["alternative_to"];
    case "materials":
      return ["made_of"];
    case "uses":
      return ["used_for"];
    case "learn":
      return ["is_a", "related_to", "part_of"];
    case "context":
      return ["related_to"];
    case "history":
    case "technical":
    case "source":
    case "market":
    case "diy":
      return [];
    default:
      return [];
  }
}

/**
 * Branch-filtered exploration targets. Same branch rules as v6; returns ExplorationTarget[].
 */
export function deriveExplorationTargetsForNodeBranch(
  node: KnowledgeNode,
  branch: BranchRecord,
  allNodes: KnowledgeNode[],
  edges: ExplorationEdge[]
): ExplorationTarget[] {
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
  const allowedTypes = relationTypesForBranchKind(branch.kind);
  if (allowedTypes.length === 0) return [];

  const outgoing = edges.filter(
    (e) => e.sourceNodeId === node.id && allowedTypes.includes(e.relationType)
  );
  const result: ExplorationTarget[] = [];
  for (const e of outgoing) {
    const targetNode = nodeMap.get(e.targetNodeId);
    if (!targetNode) continue;
    result.push({
      id: e.id,
      sourceNodeId: e.sourceNodeId,
      targetNodeId: e.targetNodeId,
      label: targetNode.title,
      relationType: e.relationType,
      confidence: e.confidence,
      createdAt: e.createdAt,
    });
  }
  return result;
}
