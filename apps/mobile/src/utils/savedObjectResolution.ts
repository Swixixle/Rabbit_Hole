/**
 * Rabbit Hole v13 — Resolve saved object to node or pipeline trace.
 * Uses stored references only; does not invent relationships.
 */
import type { SavedObjectItem } from "../types/savedObjects";
import type { KnowledgeNode } from "../types/knowledgeNodes";
import type { PipelineTraceRecord } from "../types/pipelineTrace";

/**
 * Resolve knowledge node for a saved item. Returns null if id missing or node not in list.
 */
export function resolveKnowledgeNodeForSavedObject(
  item: SavedObjectItem,
  nodes: KnowledgeNode[]
): KnowledgeNode | null {
  if (!item.knowledgeNodeId) return null;
  return nodes.find((n) => n.id === item.knowledgeNodeId) ?? null;
}

/**
 * Build pipeline trace from stored envelope/region/pipeline ids only.
 * Does not look up entities or candidates; supports inspection when node is missing.
 */
export function resolvePipelineTraceForSavedObject(
  item: SavedObjectItem
): PipelineTraceRecord {
  const trace: PipelineTraceRecord = {
    envelopeId: item.sourceEnvelopeId,
  };
  if (item.recognitionCandidateId) trace.candidateId = item.recognitionCandidateId;
  if (item.identifiedEntityId) trace.identifiedEntityId = item.identifiedEntityId;
  if (item.knowledgeNodeId) trace.knowledgeNodeId = item.knowledgeNodeId;
  return trace;
}
