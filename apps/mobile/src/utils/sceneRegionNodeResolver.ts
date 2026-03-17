/**
 * Rabbit Hole — Region → Node resolver.
 * Resolves a SceneObjectRegion to a KnowledgeNode using only existing pipeline data.
 * Never infers or creates nodes; resolution order is deterministic.
 */
import type { SceneObjectRegion } from "../types/sceneRegions";
import type { RecognitionCandidate } from "../types/recognition";
import type { IdentifiedEntity } from "../types/entityIdentification";
import type { KnowledgeNode } from "../types/knowledgeNodes";

/**
 * Resolve a scene region to a knowledge node.
 * Order: 1) region.knowledgeNodeId, 2) region.identifiedEntityId → node, 3) region.recognitionCandidateId → entity → node.
 * Returns null if no link exists or referenced structures are missing.
 */
export function resolveKnowledgeNodeFromRegion(
  region: SceneObjectRegion,
  candidates: RecognitionCandidate[],
  entities: IdentifiedEntity[],
  nodes: KnowledgeNode[]
): KnowledgeNode | null {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const entityById = new Map(entities.map((e) => [e.id, e]));
  const candidateById = new Map(candidates.map((c) => [c.id, c]));

  if (region.knowledgeNodeId) {
    const node = nodeById.get(region.knowledgeNodeId) ?? null;
    if (node) return node;
  }

  if (region.identifiedEntityId) {
    const entity = entityById.get(region.identifiedEntityId) ?? null;
    if (entity) {
      const node = nodes.find((n) => n.identifiedEntityId === entity.id) ?? null;
      if (node) return node;
    }
  }

  if (region.recognitionCandidateId) {
    const candidate = candidateById.get(region.recognitionCandidateId) ?? null;
    if (candidate) {
      const entity = entities.find((e) => e.candidateId === candidate.id) ?? null;
      if (entity) {
        const node = nodes.find((n) => n.identifiedEntityId === entity.id) ?? null;
        if (node) return node;
      }
    }
  }

  return null;
}
