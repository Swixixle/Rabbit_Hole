/**
 * Rabbit Hole — Exploration graph edge.
 * Structural primitive for related nodes; traversal not implemented yet.
 */

export type EntityGraphEdgeRelationType =
  | "is_a"
  | "part_of"
  | "made_of"
  | "related_to"
  | "alternative_to"
  | "used_for"
  | "produced_by";

export type EntityGraphEdge = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: EntityGraphEdgeRelationType;
  confidence: number;
  createdAt: string;
};
