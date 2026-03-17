/**
 * Rabbit Hole v8 — Sample claim–source support edges.
 */
import type { ClaimSupportEdge } from "../types/provenance";
import { getSampleClaims } from "./sampleClaims";
import { getSampleSources } from "./sampleSources";

const CREATED = "2025-01-01T00:00:00Z";

const claims = getSampleClaims();
const sources = getSampleSources();

const [sonyProduct, sonyManual, reference] = sources;
const [claimOverEarRec, claimProducedByRec, claimNoiseCancellingRec] = claims;

const sonyProductId = sonyProduct.id;
const sonyManualId = sonyManual.id;
const referenceId = reference.id;
const claimOverEar = claimOverEarRec.id;
const claimProducedBy = claimProducedByRec.id;
const claimNoiseCancelling = claimNoiseCancellingRec.id;

const edges: ClaimSupportEdge[] = [
  {
    id: `sample-support|${claimOverEar}|${sonyProductId}|supports`,
    claimId: claimOverEar,
    sourceId: sonyProductId,
    supportKind: "supports",
    confidence: 0.9,
    createdAt: CREATED,
  },
  {
    id: `sample-support|${claimProducedBy}|${sonyProductId}|supports`,
    claimId: claimProducedBy,
    sourceId: sonyProductId,
    supportKind: "supports",
    confidence: 0.95,
    createdAt: CREATED,
  },
  {
    id: `sample-support|${claimNoiseCancelling}|${sonyManualId}|supports`,
    claimId: claimNoiseCancelling,
    sourceId: sonyManualId,
    supportKind: "supports",
    confidence: 0.9,
    createdAt: CREATED,
  },
  {
    id: `sample-support|${claimNoiseCancelling}|${referenceId}|mentions`,
    claimId: claimNoiseCancelling,
    sourceId: referenceId,
    supportKind: "mentions",
    confidence: 0.7,
    createdAt: CREATED,
  },
];

const byClaimId = new Map<string, ClaimSupportEdge[]>();
for (const e of edges) {
  const list = byClaimId.get(e.claimId) ?? [];
  list.push(e);
  byClaimId.set(e.claimId, list);
}

export function getSampleClaimSupportEdges(): ClaimSupportEdge[] {
  return edges;
}

export function getSampleSupportEdgesForClaim(claimId: string): ClaimSupportEdge[] {
  return byClaimId.get(claimId) ?? [];
}
