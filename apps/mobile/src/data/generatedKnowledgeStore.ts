/**
 * Rabbit Hole v17 — In-memory store for generated (provisional) nodes and their claims.
 * Used so NodeViewer and tray resolution can resolve generated nodes by id.
 */
import type { KnowledgeNode } from "../types/knowledgeNodes";
import type { ClaimRecord } from "../types/provenance";

const nodes = new Map<string, KnowledgeNode>();
const claimsByNodeId = new Map<string, ClaimRecord[]>();

export function addGeneratedNode(node: KnowledgeNode): void {
  nodes.set(node.id, node);
}

export function getGeneratedNodeById(id: string): KnowledgeNode | undefined {
  return nodes.get(id);
}

export function getGeneratedNodes(): KnowledgeNode[] {
  return Array.from(nodes.values());
}

export function setGeneratedClaimsForNode(nodeId: string, claimRecords: ClaimRecord[]): void {
  claimsByNodeId.set(nodeId, claimRecords);
}

export function getGeneratedClaimsForNode(nodeId: string): ClaimRecord[] | undefined {
  return claimsByNodeId.get(nodeId);
}
