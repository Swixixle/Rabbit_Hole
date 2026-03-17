/**
 * Rabbit Hole Core Groundwork v11 — Canonical region→pipeline resolution selectors.
 * Region→node/candidate/entity resolution lives here rather than in screen wiring.
 */
import type { SceneObjectRegion } from "../types/sceneRegions";
import type { RecognitionCandidate } from "../types/recognition";
import type { IdentifiedEntity } from "../types/entityIdentification";
import type { KnowledgeNode } from "../types/knowledgeNodes";
import { resolveKnowledgeNodeFromRegion } from "./sceneRegionNodeResolver";

/**
 * Resolve the knowledge node for a scene region via pipeline data.
 * Delegates to existing resolveKnowledgeNodeFromRegion.
 */
export function selectKnowledgeNodeForRegion(
  region: SceneObjectRegion,
  candidates: RecognitionCandidate[],
  entities: IdentifiedEntity[],
  nodes: KnowledgeNode[]
): KnowledgeNode | null {
  return resolveKnowledgeNodeFromRegion(region, candidates, entities, nodes);
}

/**
 * Resolve the identified entity for a scene region (from region.identifiedEntityId or lookup).
 */
export function selectIdentifiedEntityForRegion(
  region: SceneObjectRegion,
  entities: IdentifiedEntity[]
): IdentifiedEntity | null {
  if (region.identifiedEntityId) {
    return entities.find((e) => e.id === region.identifiedEntityId) ?? null;
  }
  return null;
}

/**
 * Resolve the recognition candidate for a scene region (from region.recognitionCandidateId).
 */
export function selectRecognitionCandidateForRegion(
  region: SceneObjectRegion,
  candidates: RecognitionCandidate[]
): RecognitionCandidate | null {
  if (region.recognitionCandidateId) {
    return candidates.find((c) => c.id === region.recognitionCandidateId) ?? null;
  }
  return null;
}
