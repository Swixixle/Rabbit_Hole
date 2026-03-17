/**
 * Rabbit Hole Core Groundwork v11 — Pipeline trace selectors.
 * Build trace records from region or node for demo/debug/display.
 */
import type { SceneObjectRegion } from "../types/sceneRegions";
import type { PipelineTraceRecord } from "../types/pipelineTrace";
import type { KnowledgeNode } from "../types/knowledgeNodes";
import type { IdentifiedEntity } from "../types/entityIdentification";
import type { RecognitionCandidate } from "../types/recognition";

/**
 * Build a trace record from IDs already present on the region.
 */
export function selectPipelineTraceForRegion(
  region: SceneObjectRegion
): PipelineTraceRecord {
  const trace: PipelineTraceRecord = { envelopeId: region.envelopeId };
  if (region.recognitionCandidateId) trace.candidateId = region.recognitionCandidateId;
  if (region.identifiedEntityId) trace.identifiedEntityId = region.identifiedEntityId;
  if (region.knowledgeNodeId) trace.knowledgeNodeId = region.knowledgeNodeId;
  return trace;
}

/**
 * Trace backward from node to envelope/candidate/entity where available.
 * Returns null if node cannot be traced (e.g. not in list or no linked entity).
 */
export function selectPipelineTraceForNode(
  nodeId: string,
  nodes: KnowledgeNode[],
  entities: IdentifiedEntity[],
  candidates: RecognitionCandidate[]
): PipelineTraceRecord | null {
  const node = nodes.find((n) => n.id === nodeId) ?? null;
  if (!node) return null;

  const entity = node.identifiedEntityId
    ? (entities.find((e) => e.id === node.identifiedEntityId) ?? null)
    : null;
  const candidate = entity?.candidateId
    ? (candidates.find((c) => c.id === entity.candidateId) ?? null)
    : null;

  const trace: PipelineTraceRecord = {
    envelopeId: node.envelopeId,
    knowledgeNodeId: node.id,
  };
  if (candidate?.id) trace.candidateId = candidate.id;
  if (entity?.id) trace.identifiedEntityId = entity.id;
  return trace;
}
