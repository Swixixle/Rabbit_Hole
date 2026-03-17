/**
 * Rabbit Hole v17 — Map backend GenerateNodeResponse to canonical KnowledgeNode and ClaimRecord[].
 * Generated nodes have origin "generated"; generated claims have no sources/support edges.
 */
import type { KnowledgeNode, RabbitHoleNodeKind } from "../types/knowledgeNodes";
import type { ClaimRecord } from "../types/provenance";
import type { GenerateNodeResponse, GeneratedClaimInput } from "../types/generatedKnowledge";
import { createKnowledgeNodeId } from "./knowledgeNodes";

const CLAIM_ID_PREFIX = "gen-claim-";

function generateId(prefix: string): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createGeneratedKnowledgeNode(options: {
  envelopeId: string;
  identifiedEntityId: string;
  response: GenerateNodeResponse;
}): KnowledgeNode {
  const { envelopeId, identifiedEntityId, response } = options;
  const nodeKind = response.nodeKind as RabbitHoleNodeKind;
  const id = createKnowledgeNodeId(envelopeId, nodeKind, response.title);
  return {
    id,
    identifiedEntityId,
    envelopeId,
    title: response.title,
    nodeKind,
    description: response.description || null,
    relatedNodeIds: [],
    sourceIds: [],
    confidence: 0,
    createdAt: new Date().toISOString(),
    origin: "generated",
  };
}

export function createGeneratedClaimsForNode(options: {
  nodeId: string;
  claims: GeneratedClaimInput[];
}): ClaimRecord[] {
  const { nodeId, claims } = options;
  const now = new Date().toISOString();
  return claims.map((c) => ({
    id: generateId(CLAIM_ID_PREFIX),
    nodeId,
    text: c.text,
    claimKind: c.claimKind,
    confidence: c.confidence != null && c.confidence >= 0 && c.confidence <= 1 ? c.confidence : 0,
    createdAt: now,
  }));
}
