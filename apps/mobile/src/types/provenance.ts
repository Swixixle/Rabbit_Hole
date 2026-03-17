/**
 * Rabbit Hole Core Groundwork v8 — Claim / Source / Support substrate.
 * Provenance layer: why claims about nodes are believed.
 */

export type ClaimRecord = {
  id: string;
  nodeId: string;
  text: string;
  claimKind: "identity" | "material" | "functional" | "comparative" | "contextual";
  confidence: number;
  createdAt: string;
};

export type SourceRecord = {
  id: string;
  title: string;
  sourceKind: "manufacturer" | "editorial" | "reference" | "manual" | "dataset";
  citationLabel: string;
  createdAt: string;
};

export type ClaimSupportEdge = {
  id: string;
  claimId: string;
  sourceId: string;
  supportKind: "supports" | "mentions" | "contradicts";
  confidence: number;
  createdAt: string;
};
