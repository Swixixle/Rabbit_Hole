/**
 * Rabbit Hole v9 — Relation evidence selectors.
 */
import type { EdgeClaimReference } from "../types/relationEvidence";
import type { ClaimRecord, SourceRecord, ClaimSupportEdge } from "../types/provenance";

/** References for an edge; order by id. */
export function selectClaimReferencesForEdge(
  edgeId: string,
  refs: EdgeClaimReference[]
): EdgeClaimReference[] {
  const out = refs.filter((r) => r.edgeId === edgeId);
  out.sort((a, b) => a.id.localeCompare(b.id));
  return out;
}

/** Claims linked to an edge via references; order: confidence desc, then id. Missing claims excluded. */
export function selectClaimsForEdge(
  edgeId: string,
  refs: EdgeClaimReference[],
  claims: ClaimRecord[]
): ClaimRecord[] {
  const claimIds = new Set(
    refs.filter((r) => r.edgeId === edgeId).map((r) => r.claimId)
  );
  const claimMap = new Map(claims.map((c) => [c.id, c]));
  const out: ClaimRecord[] = [];
  for (const id of claimIds) {
    const c = claimMap.get(id);
    if (c) out.push(c);
  }
  out.sort((a, b) => {
    if (a.confidence !== b.confidence) return b.confidence - a.confidence;
    return a.id.localeCompare(b.id);
  });
  return out;
}

/** Sources for an edge via its claims' support edges; stable by source id. Missing sources excluded. */
export function selectSourcesForEdge(
  edgeId: string,
  refs: EdgeClaimReference[],
  claims: ClaimRecord[],
  supportEdges: ClaimSupportEdge[],
  sources: SourceRecord[]
): SourceRecord[] {
  const claimIds = new Set(
    refs.filter((r) => r.edgeId === edgeId).map((r) => r.claimId)
  );
  const sourceIds = new Set<string>();
  for (const e of supportEdges) {
    if (claimIds.has(e.claimId)) sourceIds.add(e.sourceId);
  }
  const sourceMap = new Map(sources.map((s) => [s.id, s]));
  const sortedIds = [...sourceIds].sort();
  const out: SourceRecord[] = [];
  for (const id of sortedIds) {
    const s = sourceMap.get(id);
    if (s) out.push(s);
  }
  return out;
}
