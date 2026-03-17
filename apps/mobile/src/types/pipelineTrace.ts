/**
 * Rabbit Hole Core Groundwork v11 — Pipeline trace for demo/debug/display.
 * Lightweight trace from recognition records to opened node; no embedded content.
 */
export type PipelineTraceRecord = {
  envelopeId: string;
  candidateId?: string;
  identifiedEntityId?: string;
  knowledgeNodeId?: string;
};
