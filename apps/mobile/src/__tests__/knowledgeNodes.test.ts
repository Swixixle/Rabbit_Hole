/**
 * Rabbit Hole Core Groundwork v4 — Knowledge Node Conversion Layer tests.
 */
import type { IdentifiedEntity, IdentifiedEntitySummary } from "../types/entityIdentification";
import { DEFAULT_IDENTIFIED_ENTITY_SUMMARY } from "../types/entityIdentification";
import {
  createRecognitionEnvelope,
  deriveRecognitionCandidates,
} from "../utils/recognition";
import { deriveIdentifiedEntities } from "../utils/entityIdentification";
import {
  mapEntityKindToNodeKind,
  createKnowledgeNodeId,
  deriveKnowledgeNodeDescription,
  deriveKnowledgeNodes,
} from "../utils/knowledgeNodes";

describe("Knowledge Node Conversion Layer", () => {
  describe("mapEntityKindToNodeKind", () => {
    it("maps entity to entity", () => {
      expect(mapEntityKindToNodeKind("entity")).toBe("entity");
    });
    it("maps topic to topic", () => {
      expect(mapEntityKindToNodeKind("topic")).toBe("topic");
    });
    it("maps product to product", () => {
      expect(mapEntityKindToNodeKind("product")).toBe("product");
    });
    it("maps landmark to landmark", () => {
      expect(mapEntityKindToNodeKind("landmark")).toBe("landmark");
    });
    it("maps media to media", () => {
      expect(mapEntityKindToNodeKind("media")).toBe("media");
    });
  });

  describe("createKnowledgeNodeId", () => {
    const envelopeId = "rh-recognition-envelope|image|camera|file_photo.jpg";

    it("is deterministic for same inputs", () => {
      const a = createKnowledgeNodeId(envelopeId, "landmark", "Eiffel Tower");
      const b = createKnowledgeNodeId(envelopeId, "landmark", "Eiffel Tower");
      expect(a).toBe(b);
      expect(a).toMatch(/^rh-knowledge-node\|/);
    });

    it("differs when title differs", () => {
      const a = createKnowledgeNodeId(envelopeId, "landmark", "Eiffel Tower");
      const b = createKnowledgeNodeId(envelopeId, "landmark", "Statue of Liberty");
      expect(a).not.toBe(b);
    });

    it("differs when kind differs", () => {
      const a = createKnowledgeNodeId(envelopeId, "landmark", "Eiffel Tower");
      const b = createKnowledgeNodeId(envelopeId, "entity", "Eiffel Tower");
      expect(a).not.toBe(b);
    });
  });

  describe("deriveKnowledgeNodeDescription", () => {
    it("returns null in v4", () => {
      const entity: IdentifiedEntity = {
        id: "e1",
        envelopeId: "env1",
        candidateId: "c1",
        title: "Eiffel Tower",
        entityKind: "landmark",
        confidence: 0.95,
        createdAt: "2025-01-01T00:00:00Z",
      };
      expect(deriveKnowledgeNodeDescription(entity)).toBeNull();
    });
  });

  describe("deriveKnowledgeNodes", () => {
    function makeEntitySummary(entities: IdentifiedEntity[]): IdentifiedEntitySummary {
      const byId: Record<string, IdentifiedEntity> = {};
      const ids: string[] = [];
      for (const e of entities) {
        byId[e.id] = e;
        ids.push(e.id);
      }
      return { entities: byId, entityIds: ids };
    }

    const envelopeId = "rh-recognition-envelope|image|camera|file_landmark.jpg";

    it("returns empty summary for empty identified entity summary", () => {
      const summary = deriveKnowledgeNodes({
        identifiedEntitySummary: DEFAULT_IDENTIFIED_ENTITY_SUMMARY,
      });
      expect(summary.nodeIds).toEqual([]);
      expect(Object.keys(summary.nodes)).toHaveLength(0);
    });

    it("preserves stable input order in nodeIds", () => {
      const entitySummary = makeEntitySummary([
        {
          id: "ie1",
          envelopeId,
          candidateId: "c1",
          title: "Eiffel Tower",
          entityKind: "landmark",
          confidence: 0.95,
          createdAt: "2025-01-01T00:00:00Z",
        },
        {
          id: "ie2",
          envelopeId,
          candidateId: "c2",
          title: "Paris",
          entityKind: "entity",
          confidence: 0.8,
          createdAt: "2025-01-01T00:00:00Z",
        },
      ]);
      const summary = deriveKnowledgeNodes({ identifiedEntitySummary: entitySummary });
      expect(summary.nodeIds).toHaveLength(2);
      expect(summary.nodes[summary.nodeIds[0]].title).toBe("Eiffel Tower");
      expect(summary.nodes[summary.nodeIds[1]].title).toBe("Paris");
    });

    it("stores nodes by deterministic id", () => {
      const entitySummary = makeEntitySummary([
        {
          id: "ie1",
          envelopeId,
          candidateId: "c1",
          title: "Sony WH-1000XM5",
          entityKind: "product",
          confidence: 0.9,
          createdAt: "2025-01-01T00:00:00Z",
        },
      ]);
      const summary = deriveKnowledgeNodes({ identifiedEntitySummary: entitySummary });
      const id = summary.nodeIds[0];
      expect(summary.nodes[id]).toBeDefined();
      expect(summary.nodes[id].id).toBe(id);
    });

    it("copies expected identifiedEntityId, envelopeId, title, nodeKind, confidence", () => {
      const entitySummary = makeEntitySummary([
        {
          id: "ie-eiffel",
          envelopeId,
          candidateId: "c1",
          title: "Eiffel Tower",
          entityKind: "landmark",
          confidence: 0.95,
          createdAt: "2025-01-01T00:00:00Z",
        },
      ]);
      const summary = deriveKnowledgeNodes({ identifiedEntitySummary: entitySummary });
      const node = summary.nodes[summary.nodeIds[0]];
      expect(node.identifiedEntityId).toBe("ie-eiffel");
      expect(node.envelopeId).toBe(envelopeId);
      expect(node.title).toBe("Eiffel Tower");
      expect(node.nodeKind).toBe("landmark");
      expect(node.confidence).toBe(0.95);
    });

    it("sets description = null, relatedNodeIds = [], sourceIds = []", () => {
      const entitySummary = makeEntitySummary([
        {
          id: "ie1",
          envelopeId,
          candidateId: "c1",
          title: "Topic",
          entityKind: "topic",
          confidence: 0.8,
          createdAt: "2025-01-01T00:00:00Z",
        },
      ]);
      const summary = deriveKnowledgeNodes({ identifiedEntitySummary: entitySummary });
      const node = summary.nodes[summary.nodeIds[0]];
      expect(node.description).toBeNull();
      expect(node.relatedNodeIds).toEqual([]);
      expect(node.sourceIds).toEqual([]);
    });

    it("respects provided createdAt", () => {
      const entitySummary = makeEntitySummary([
        {
          id: "ie1",
          envelopeId,
          candidateId: "c1",
          title: "Entity",
          entityKind: "entity",
          confidence: 0.7,
          createdAt: "2025-01-01T00:00:00Z",
        },
      ]);
      const createdAt = "2025-06-15T12:00:00.000Z";
      const summary = deriveKnowledgeNodes({
        identifiedEntitySummary: entitySummary,
        createdAt,
      });
      expect(summary.nodes[summary.nodeIds[0]].createdAt).toBe(createdAt);
    });

    it("does not sort or reinterpret nodes", () => {
      const entitySummary = makeEntitySummary([
        {
          id: "ie2",
          envelopeId,
          candidateId: "c2",
          title: "B",
          entityKind: "entity",
          confidence: 0.5,
          createdAt: "2025-01-01T00:00:00Z",
        },
        {
          id: "ie1",
          envelopeId,
          candidateId: "c1",
          title: "A",
          entityKind: "entity",
          confidence: 0.9,
          createdAt: "2025-01-01T00:00:00Z",
        },
      ]);
      const summary = deriveKnowledgeNodes({ identifiedEntitySummary: entitySummary });
      expect(summary.nodes[summary.nodeIds[0]].title).toBe("B");
      expect(summary.nodes[summary.nodeIds[1]].title).toBe("A");
    });

    it("landmark fixture", () => {
      const envelope = createRecognitionEnvelope({
        modality: "image",
        captureSource: "camera",
        inputRef: "file:///landmark.jpg",
      });
      const candidateSummary = deriveRecognitionCandidates({
        envelope,
        rawCandidates: [
          { label: "Eiffel Tower", confidence: 0.95, candidateType: "landmark" },
        ],
      });
      const entitySummary = deriveIdentifiedEntities({ envelope, candidateSummary });
      const nodeSummary = deriveKnowledgeNodes({ identifiedEntitySummary: entitySummary });
      expect(nodeSummary.nodeIds).toHaveLength(1);
      expect(nodeSummary.nodes[nodeSummary.nodeIds[0]].nodeKind).toBe("landmark");
      expect(nodeSummary.nodes[nodeSummary.nodeIds[0]].title).toBe("Eiffel Tower");
    });

    it("product fixture", () => {
      const envelope = createRecognitionEnvelope({
        modality: "image",
        captureSource: "upload",
        inputRef: "file:///headphones.jpg",
      });
      const candidateSummary = deriveRecognitionCandidates({
        envelope,
        rawCandidates: [
          { label: "Sony WH-1000XM5", confidence: 0.88, candidateType: "product" },
        ],
      });
      const entitySummary = deriveIdentifiedEntities({ envelope, candidateSummary });
      const nodeSummary = deriveKnowledgeNodes({ identifiedEntitySummary: entitySummary });
      expect(nodeSummary.nodes[nodeSummary.nodeIds[0]].nodeKind).toBe("product");
    });

    it("topic fixture", () => {
      const envelope = createRecognitionEnvelope({
        modality: "text",
        captureSource: "manual_text",
        inputRef: "text-ref",
      });
      const candidateSummary = deriveRecognitionCandidates({
        envelope,
        rawCandidates: [
          { label: "French Revolution", confidence: 0.85, candidateType: "topic" },
        ],
      });
      const entitySummary = deriveIdentifiedEntities({ envelope, candidateSummary });
      const nodeSummary = deriveKnowledgeNodes({ identifiedEntitySummary: entitySummary });
      expect(nodeSummary.nodes[nodeSummary.nodeIds[0]].nodeKind).toBe("topic");
    });

    it("media fixture", () => {
      const envelope = createRecognitionEnvelope({
        modality: "audio",
        captureSource: "microphone",
        inputRef: "rec:///clip",
      });
      const candidateSummary = deriveRecognitionCandidates({
        envelope,
        rawCandidates: [
          { label: "Unknown Song", confidence: 0.6, candidateType: "media" },
        ],
      });
      const entitySummary = deriveIdentifiedEntities({ envelope, candidateSummary });
      const nodeSummary = deriveKnowledgeNodes({ identifiedEntitySummary: entitySummary });
      expect(nodeSummary.nodes[nodeSummary.nodeIds[0]].nodeKind).toBe("media");
    });
  });
});
