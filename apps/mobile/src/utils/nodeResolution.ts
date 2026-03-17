/**
 * Rabbit Hole v17 — Resolve node by id from both sample (authored) and generated stores.
 */
import type { KnowledgeNode } from "../types/knowledgeNodes";
import { getSampleNodeById } from "../data/sampleNodes";
import { getGeneratedNodeById } from "../data/generatedKnowledgeStore";

export function getNodeById(id: string): KnowledgeNode | undefined {
  return getSampleNodeById(id) ?? getGeneratedNodeById(id);
}
