/**
 * Rabbit Hole — Region → Node resolver tests.
 */
import type { SceneObjectRegion } from "../types/sceneRegions";
import type { RecognitionCandidate } from "../types/recognition";
import type { IdentifiedEntity } from "../types/entityIdentification";
import type { KnowledgeNode } from "../types/knowledgeNodes";
import { resolveKnowledgeNodeFromRegion } from "../utils/sceneRegionNodeResolver";

const envelopeId = "rh-recognition-envelope|image|camera|file_photo.jpg";

function makeRegion(overrides: Partial<SceneObjectRegion> = {}): SceneObjectRegion {
  return {
    id: "region-1",
    envelopeId,
    label: "Eiffel Tower",
    regionKind: "landmark",
    confidence: 0.9,
    boundingBox: { x: 0.2, y: 0.1, width: 0.4, height: 0.6 },
    recognitionCandidateId: null,
    identifiedEntityId: null,
    knowledgeNodeId: null,
    createdAt: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeNode(id: string, identifiedEntityId: string): KnowledgeNode {
  return {
    id,
    identifiedEntityId,
    envelopeId,
    title: "Eiffel Tower",
    nodeKind: "landmark",
    description: null,
    relatedNodeIds: [],
    sourceIds: [],
    confidence: 0.9,
    createdAt: "2025-01-01T00:00:00Z",
  };
}

function makeEntity(id: string, candidateId: string): IdentifiedEntity {
  return {
    id,
    envelopeId,
    candidateId,
    title: "Eiffel Tower",
    entityKind: "landmark",
    confidence: 0.9,
    createdAt: "2025-01-01T00:00:00Z",
  };
}

function makeCandidate(id: string): RecognitionCandidate {
  return {
    id,
    envelopeId,
    label: "Eiffel Tower",
    confidence: 0.9,
    candidateType: "landmark",
  };
}

describe("sceneRegionNodeResolver", () => {
  it("resolves node when region.knowledgeNodeId is set", () => {
    const nodeId = "rh-knowledge-node|env|landmark|Eiffel_Tower";
    const node = makeNode(nodeId, "entity-1");
    const region = makeRegion({ knowledgeNodeId: nodeId });
    const result = resolveKnowledgeNodeFromRegion(region, [], [], [node]);
    expect(result).not.toBeNull();
    expect(result!.id).toBe(nodeId);
  });

  it("resolves node when region.identifiedEntityId links to entity and node", () => {
    const entityId = "rh-identified-entity|env|landmark|Eiffel_Tower";
    const nodeId = "rh-knowledge-node|env|landmark|Eiffel_Tower";
    const entity = makeEntity(entityId, "candidate-1");
    const node = makeNode(nodeId, entityId);
    const region = makeRegion({
      knowledgeNodeId: null,
      identifiedEntityId: entityId,
    });
    const result = resolveKnowledgeNodeFromRegion(region, [], [entity], [node]);
    expect(result).not.toBeNull();
    expect(result!.id).toBe(nodeId);
  });

  it("resolves node when region.recognitionCandidateId links to candidate → entity → node", () => {
    const candidateId = "rh-recognition-candidate|env|landmark|Eiffel_Tower";
    const entityId = "rh-identified-entity|env|landmark|Eiffel_Tower";
    const nodeId = "rh-knowledge-node|env|landmark|Eiffel_Tower";
    const candidate = makeCandidate(candidateId);
    const entity = makeEntity(entityId, candidateId);
    const node = makeNode(nodeId, entityId);
    const region = makeRegion({
      knowledgeNodeId: null,
      identifiedEntityId: null,
      recognitionCandidateId: candidateId,
    });
    const result = resolveKnowledgeNodeFromRegion(region, [candidate], [entity], [node]);
    expect(result).not.toBeNull();
    expect(result!.id).toBe(nodeId);
  });

  it("returns null when region has no links", () => {
    const region = makeRegion({
      knowledgeNodeId: null,
      identifiedEntityId: null,
      recognitionCandidateId: null,
    });
    const result = resolveKnowledgeNodeFromRegion(region, [], [], []);
    expect(result).toBeNull();
  });

  it("returns null when region.knowledgeNodeId is set but node not in list", () => {
    const region = makeRegion({ knowledgeNodeId: "missing-node-id" });
    const result = resolveKnowledgeNodeFromRegion(region, [], [], []);
    expect(result).toBeNull();
  });

  it("returns null when region.identifiedEntityId is set but entity/node not in lists", () => {
    const region = makeRegion({ identifiedEntityId: "missing-entity-id" });
    const result = resolveKnowledgeNodeFromRegion(region, [], [], []);
    expect(result).toBeNull();
  });
});
