/**
 * Rabbit Hole v8 — Sample claim records for provenance substrate.
 * Claims attached to the Sony WH-1000XM5 sample node.
 */
import type { ClaimRecord } from "../types/provenance";
import { createKnowledgeNodeId } from "../utils/knowledgeNodes";
import { SAMPLE_ENVELOPE_ID_CONST } from "./sampleNodes";

const CREATED = "2025-01-01T00:00:00Z";

const SONY_NODE_ID = createKnowledgeNodeId(
  SAMPLE_ENVELOPE_ID_CONST,
  "product",
  "Sony WH-1000XM5"
);

const CLAIM_PREFIX = "sample-claim|";

const claims: ClaimRecord[] = [
  {
    id: `${CLAIM_PREFIX}${SONY_NODE_ID}|identity|over-ear-wireless`,
    nodeId: SONY_NODE_ID,
    text: "Sony WH-1000XM5 is a pair of over-ear wireless headphones.",
    claimKind: "identity",
    confidence: 0.95,
    createdAt: CREATED,
  },
  {
    id: `${CLAIM_PREFIX}${SONY_NODE_ID}|identity|produced-by`,
    nodeId: SONY_NODE_ID,
    text: "Sony WH-1000XM5 is produced by Sony.",
    claimKind: "identity",
    confidence: 0.98,
    createdAt: CREATED,
  },
  {
    id: `${CLAIM_PREFIX}${SONY_NODE_ID}|functional|noise-cancelling`,
    nodeId: SONY_NODE_ID,
    text: "Sony WH-1000XM5 includes noise-cancelling functionality.",
    claimKind: "functional",
    confidence: 0.92,
    createdAt: CREATED,
  },
];

const byId = new Map(claims.map((c) => [c.id, c]));
const byNodeId = new Map<string, ClaimRecord[]>();
for (const c of claims) {
  const list = byNodeId.get(c.nodeId) ?? [];
  list.push(c);
  byNodeId.set(c.nodeId, list);
}

export function getSampleClaims(): ClaimRecord[] {
  return claims;
}

export function getSampleClaimById(id: string): ClaimRecord | undefined {
  return byId.get(id);
}

export function getSampleClaimsForNode(nodeId: string): ClaimRecord[] {
  return byNodeId.get(nodeId) ?? [];
}
