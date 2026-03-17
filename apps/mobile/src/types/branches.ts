/**
 * Rabbit Hole Core Groundwork v6 — Canonical branch types.
 * A branch is a first-class record in the exploration substrate, not a button label.
 */

export type BranchKind =
  | "learn"
  | "compare"
  | "source"
  | "history"
  | "technical"
  | "context"
  | "market"
  | "materials"
  | "uses"
  | "alternatives"
  | "diy";

/** Canonical branch object for a node. */
export type BranchRecord = {
  id: string;
  nodeId: string;
  kind: BranchKind;
  title: string;
  createdAt: string;
};

/** Deterministic target exposed through a branch. */
export type BranchTarget = {
  id: string;
  branchId: string;
  targetNodeId: string;
  label: string;
  relationType?: string;
  createdAt: string;
};
