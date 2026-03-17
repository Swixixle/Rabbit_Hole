/**
 * Rabbit Hole v9 — Resolve exploration target to backing graph edge.
 */
import type { EntityGraphEdge } from "../types/entityGraph";
import type { ExplorationTarget } from "../types/exploration";

/**
 * Find the entity graph edge that backs this exploration target.
 * Match by sourceNodeId, targetNodeId, relationType. If multiple: highest confidence, then id order.
 */
export function resolveExplorationEdgeForTarget(
  sourceNodeId: string,
  target: ExplorationTarget,
  entityGraphEdges: EntityGraphEdge[]
): EntityGraphEdge | null {
  const candidates = entityGraphEdges.filter(
    (e) =>
      e.sourceNodeId === sourceNodeId &&
      e.targetNodeId === target.targetNodeId &&
      e.relationType === target.relationType
  );
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];
  candidates.sort((a, b) => {
    if (a.confidence !== b.confidence) return b.confidence - a.confidence;
    return a.id.localeCompare(b.id);
  });
  return candidates[0];
}
