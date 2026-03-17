/**
 * Rabbit Hole Core Groundwork v7 — Selectors for unified exploration.
 * Adapt graph edges and derive targets; single substrate for related and branch views.
 */
import type { KnowledgeNode } from "../types/knowledgeNodes";
import type { EntityGraphEdge } from "../types/entityGraph";
import type { BranchRecord } from "../types/branches";
import type { ExplorationTarget } from "../types/exploration";
import { adaptEntityGraphEdgesToExplorationEdges } from "./exploration";
import {
  deriveExplorationTargetsForNode,
  deriveExplorationTargetsForNodeBranch,
} from "./exploration";

/** Related summary: all exploration targets for the node from the graph. */
export function selectExplorationTargetsForNode(
  node: KnowledgeNode,
  nodes: KnowledgeNode[],
  entityGraphEdges: EntityGraphEdge[]
): ExplorationTarget[] {
  const edges = adaptEntityGraphEdgesToExplorationEdges(entityGraphEdges);
  return deriveExplorationTargetsForNode(node, nodes, edges);
}

/** Branch-filtered exploration targets. */
export function selectExplorationTargetsForNodeBranch(
  node: KnowledgeNode,
  branch: BranchRecord,
  nodes: KnowledgeNode[],
  entityGraphEdges: EntityGraphEdge[]
): ExplorationTarget[] {
  const edges = adaptEntityGraphEdgesToExplorationEdges(entityGraphEdges);
  return deriveExplorationTargetsForNodeBranch(node, branch, nodes, edges);
}
