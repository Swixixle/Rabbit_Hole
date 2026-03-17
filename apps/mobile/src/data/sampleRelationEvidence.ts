/**
 * Rabbit Hole v9 — Sample edge–claim references.
 * Links sample graph edges to claims that justify the relation.
 */
import type { EdgeClaimReference } from "../types/relationEvidence";
import { getSampleGraphEdges } from "./sampleGraph";
import { getSampleClaims } from "./sampleClaims";
import { getSampleNodeById } from "./sampleNodes";

const CREATED = "2025-01-01T00:00:00Z";
const REF_PREFIX = "sample-edge-claim-ref|";

function ref(edgeId: string, claimId: string): EdgeClaimReference {
  return {
    id: `${REF_PREFIX}${edgeId}|${claimId}`,
    edgeId,
    claimId,
    createdAt: CREATED,
  };
}

function buildRefs(): EdgeClaimReference[] {
  const edges = getSampleGraphEdges();
  const claims = getSampleClaims();
  const sonyNodeId = claims[0].nodeId;

  const edgeIsA = edges.find(
    (e) => e.sourceNodeId === sonyNodeId && e.relationType === "is_a"
  );
  const edgeProducedBy = edges.find(
    (e) => e.sourceNodeId === sonyNodeId && e.relationType === "produced_by"
  );
  const edgeRelatedToNoise = edges.find((e) => {
    if (e.sourceNodeId !== sonyNodeId || e.relationType !== "related_to") return false;
    const target = getSampleNodeById(e.targetNodeId);
    return target?.title === "Noise cancelling";
  });

  const claimOverEar = claims.find((c) => c.text.includes("over-ear wireless headphones"));
  const claimProducedBy = claims.find((c) => c.text.includes("produced by Sony"));
  const claimNoiseCancelling = claims.find((c) => c.text.includes("noise-cancelling functionality"));

  const refs: EdgeClaimReference[] = [];
  if (edgeIsA && claimOverEar) refs.push(ref(edgeIsA.id, claimOverEar.id));
  if (edgeProducedBy && claimProducedBy) refs.push(ref(edgeProducedBy.id, claimProducedBy.id));
  if (edgeRelatedToNoise && claimNoiseCancelling) refs.push(ref(edgeRelatedToNoise.id, claimNoiseCancelling.id));
  return refs;
}

const refs = buildRefs();
const byEdgeId = new Map<string, EdgeClaimReference[]>();
for (const r of refs) {
  const list = byEdgeId.get(r.edgeId) ?? [];
  list.push(r);
  byEdgeId.set(r.edgeId, list);
}

export function getSampleEdgeClaimReferences(): EdgeClaimReference[] {
  return refs;
}

export function getSampleRefsByEdgeId(edgeId: string): EdgeClaimReference[] {
  return byEdgeId.get(edgeId) ?? [];
}
