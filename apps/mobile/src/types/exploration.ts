/**
 * Rabbit Hole Core Groundwork v7 — Unified exploration graph types.
 * Related and branch targets are views over the same graph-backed substrate.
 */

export type ExplorationRelationType =
  | "is_a"
  | "part_of"
  | "made_of"
  | "related_to"
  | "alternative_to"
  | "used_for"
  | "produced_by";

/** Canonical exploration edge; mirrors graph edge model. */
export type ExplorationEdge = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: ExplorationRelationType;
  confidence: number;
  createdAt: string;
};

/** Normalized UI-facing graph target. */
export type ExplorationTarget = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label: string;
  relationType: ExplorationRelationType;
  confidence: number;
  createdAt: string;
};

export type ExplorationSectionKind = "related_summary" | "branch_targets";
