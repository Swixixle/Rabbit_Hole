/**
 * Rabbit Hole Core Groundwork v6 — Selectors for node branches and branch targets.
 */
import type { KnowledgeNode } from "../types/knowledgeNodes";
import type { EntityGraphEdge } from "../types/entityGraph";
import type { BranchRecord, BranchTarget } from "../types/branches";
import { deriveBranchRecordsForNode, deriveBranchTargetsForNodeBranch } from "./branches";

/** Branch records for a node (stable order from derivation). */
export function selectBranchRecordsForNode(node: KnowledgeNode): BranchRecord[] {
  return deriveBranchRecordsForNode(node);
}

/** Branch targets for a node's branch. */
export function selectBranchTargetsForNodeBranch(
  node: KnowledgeNode,
  branch: BranchRecord,
  nodes: KnowledgeNode[],
  edges: EntityGraphEdge[]
): BranchTarget[] {
  return deriveBranchTargetsForNodeBranch(node, branch, nodes, edges);
}
