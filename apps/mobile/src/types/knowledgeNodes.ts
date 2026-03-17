/**
 * Rabbit Hole Core Groundwork v4 — Knowledge Node Conversion Layer.
 * IdentifiedEntity is interpretation-ready but pre-node; KnowledgeNode is the first
 * canonical Rabbit Hole exploration object. Branches, sources, and related links come later.
 * This step is intentionally minimal and trunk-first.
 */

/** Canonical node kind; mirrors entity kinds in v4. Claim, source, organization, market can come later. */
export type RabbitHoleNodeKind =
  | "entity"
  | "topic"
  | "product"
  | "landmark"
  | "media";

/** v17: Whether the node is authored (sample/curated) or generated (provisional). */
export type KnowledgeNodeOrigin = "authored" | "generated";

/** First explorable node record. Canonical Rabbit Hole knowledge node. */
export type KnowledgeNode = {
  id: string;
  identifiedEntityId: string;
  envelopeId: string;
  title: string;
  nodeKind: RabbitHoleNodeKind;
  description: string | null;
  relatedNodeIds: string[];
  sourceIds: string[];
  confidence: number;
  createdAt: string;
  /** v17: authored = sample/curated; generated = provisional from recognition. */
  origin?: KnowledgeNodeOrigin;
};

/** Collection of knowledge nodes keyed by id with stable order. */
export type KnowledgeNodeSummary = {
  nodes: Record<string, KnowledgeNode>;
  nodeIds: string[];
};

export const DEFAULT_KNOWLEDGE_NODE_SUMMARY: KnowledgeNodeSummary = {
  nodes: {},
  nodeIds: [],
};

/**
 * v5 — Action/branch slot kinds. Live retailer links and live prices come later;
 * this establishes branch expectations per node kind (market, materials, uses, alternatives, diy).
 */
export type NodeActionSlotKind =
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
