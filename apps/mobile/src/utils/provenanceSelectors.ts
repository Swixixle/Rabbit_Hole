/**
 * Rabbit Hole Core Groundwork v8 — Provenance selectors.
 */
import type { ClaimRecord, SourceRecord, ClaimSupportEdge } from "../types/provenance";

const SUPPORT_KIND_PRIORITY: ClaimSupportEdge["supportKind"][] = [
  "supports",
  "mentions",
  "contradicts",
];

function supportKindOrder(k: ClaimSupportEdge["supportKind"]): number {
  const i = SUPPORT_KIND_PRIORITY.indexOf(k);
  return i >= 0 ? i : SUPPORT_KIND_PRIORITY.length;
}

/** Claims for a node; order: confidence desc, then id. */
export function selectClaimsForNode(
  nodeId: string,
  claims: ClaimRecord[]
): ClaimRecord[] {
  const out = claims.filter((c) => c.nodeId === nodeId);
  out.sort((a, b) => {
    if (a.confidence !== b.confidence) return b.confidence - a.confidence;
    return a.id.localeCompare(b.id);
  });
  return out;
}

/** Support edges for a claim; order: supportKind priority, confidence desc, id. */
export function selectSupportEdgesForClaim(
  claimId: string,
  supportEdges: ClaimSupportEdge[]
): ClaimSupportEdge[] {
  const out = supportEdges.filter((e) => e.claimId === claimId);
  out.sort((a, b) => {
    const ka = supportKindOrder(a.supportKind);
    const kb = supportKindOrder(b.supportKind);
    if (ka !== kb) return ka - kb;
    if (a.confidence !== b.confidence) return b.confidence - a.confidence;
    return a.id.localeCompare(b.id);
  });
  return out;
}

/** Sources linked to a claim via support edges; stable by source id. */
export function selectSourcesForClaim(
  claimId: string,
  supportEdges: ClaimSupportEdge[],
  sources: SourceRecord[]
): SourceRecord[] {
  const sourceIds = [...new Set(
    supportEdges.filter((e) => e.claimId === claimId).map((e) => e.sourceId)
  )].sort();
  const sourceMap = new Map(sources.map((s) => [s.id, s]));
  const out: SourceRecord[] = [];
  for (const id of sourceIds) {
    const s = sourceMap.get(id);
    if (s) out.push(s);
  }
  return out;
}
