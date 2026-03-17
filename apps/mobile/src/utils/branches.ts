/**
 * Rabbit Hole Core Groundwork v6 — Canonical branch derivation.
 * Branches are first-class records derived deterministically from node and graph data.
 */
import type { KnowledgeNode } from "../types/knowledgeNodes";
import type { EntityGraphEdge } from "../types/entityGraph";
import type { BranchRecord, BranchTarget, BranchKind } from "../types/branches";
import { deriveDefaultNodeActionSlotKinds } from "./knowledgeNodes";

const BRANCH_RECORD_ID_PREFIX = "rh-branch-record|";
const BRANCH_TARGET_ID_PREFIX = "rh-branch-target|";

function normalizeIdSegment(s: string): string {
  return s.replace(/\|/g, "_");
}

/** Deterministic id for a branch record. */
export function createBranchRecordId(nodeId: string, kind: BranchKind): string {
  const safeNodeId = normalizeIdSegment(nodeId);
  return `${BRANCH_RECORD_ID_PREFIX}${safeNodeId}|${kind}`;
}

/** Human-readable title for a branch kind. */
function branchKindTitle(kind: BranchKind): string {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

/**
 * Derive canonical branch records for a node from its allowed slot kinds.
 * Order is stable (slot order). No inference, no remote data.
 */
export function deriveBranchRecordsForNode(node: KnowledgeNode): BranchRecord[] {
  const slotKinds = deriveDefaultNodeActionSlotKinds(node);
  const created = node.createdAt ?? new Date().toISOString();
  return slotKinds.map((kind) => ({
    id: createBranchRecordId(node.id, kind as BranchKind),
    nodeId: node.id,
    kind: kind as BranchKind,
    title: branchKindTitle(kind as BranchKind),
    createdAt: created,
  }));
}

/** Relation types that qualify for each branch kind (outgoing from node). */
function relationTypesForBranchKind(kind: BranchKind): EntityGraphEdge["relationType"][] {
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
 * Derive branch targets for a node's branch from graph edges and nodes.
 * Only includes targets whose node exists in allNodes. Deterministic order by edge id.
 */
export function deriveBranchTargetsForNodeBranch(
  node: KnowledgeNode,
  branch: BranchRecord,
  allNodes: KnowledgeNode[],
  edges: EntityGraphEdge[]
): BranchTarget[] {
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
  const allowedTypes = relationTypesForBranchKind(branch.kind);
  if (allowedTypes.length === 0) return [];

  const outgoing = edges.filter(
    (e) => e.sourceNodeId === node.id && allowedTypes.includes(e.relationType)
  );
  const created = branch.createdAt ?? new Date().toISOString();
  const targets: BranchTarget[] = [];

  for (const e of outgoing) {
    const targetNode = nodeMap.get(e.targetNodeId);
    if (!targetNode) continue;
    const id = `${BRANCH_TARGET_ID_PREFIX}${normalizeIdSegment(branch.id)}|${normalizeIdSegment(e.id)}`;
    targets.push({
      id,
      branchId: branch.id,
      targetNodeId: e.targetNodeId,
      label: targetNode.title,
      relationType: e.relationType,
      createdAt: created,
    });
  }

  return targets;
}
