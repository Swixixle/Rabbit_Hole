/**
 * Rabbit Hole Core Groundwork v3 — Entity Identification Layer tests.
 */
import type {
  RecognitionEnvelope,
  RecognitionCandidate,
  RecognitionCandidateSummary,
} from "../types/recognition";
import { createRecognitionEnvelope, deriveRecognitionCandidates } from "../utils/recognition";
import {
  normalizeIdentifiedEntityTitle,
  mapRecognitionCandidateTypeToEntityKind,
  createIdentifiedEntityId,
  deriveIdentifiedEntities,
} from "../utils/entityIdentification";

describe("Entity Identification Layer", () => {
  describe("normalizeIdentifiedEntityTitle", () => {
    it("trims outer whitespace", () => {
      expect(normalizeIdentifiedEntityTitle("  Eiffel Tower  ")).toBe("Eiffel Tower");
      expect(normalizeIdentifiedEntityTitle("\tParis\n")).toBe("Paris");
    });

    it("collapses repeated internal whitespace to single spaces", () => {
      expect(normalizeIdentifiedEntityTitle("Golden   Gate   Bridge")).toBe("Golden Gate Bridge");
    });

    it("preserves readable capitalization as-is", () => {
      expect(normalizeIdentifiedEntityTitle("Eiffel Tower")).toBe("Eiffel Tower");
      expect(normalizeIdentifiedEntityTitle("Sony WH-1000XM5")).toBe("Sony WH-1000XM5");
    });
  });

  describe("mapRecognitionCandidateTypeToEntityKind", () => {
    it("maps each recognition candidate type directly to entity kind", () => {
      expect(mapRecognitionCandidateTypeToEntityKind("entity")).toBe("entity");
      expect(mapRecognitionCandidateTypeToEntityKind("topic")).toBe("topic");
      expect(mapRecognitionCandidateTypeToEntityKind("product")).toBe("product");
      expect(mapRecognitionCandidateTypeToEntityKind("landmark")).toBe("landmark");
      expect(mapRecognitionCandidateTypeToEntityKind("media")).toBe("media");
    });
  });

  describe("createIdentifiedEntityId", () => {
    const envelopeId = "rh-recognition-envelope|image|camera|file_photo.jpg";
    const candidateId = "rh-recognition-candidate|env|landmark|Eiffel Tower";

    it("is deterministic for same inputs", () => {
      const a = createIdentifiedEntityId(envelopeId, candidateId, "landmark", "Eiffel Tower");
      const b = createIdentifiedEntityId(envelopeId, candidateId, "landmark", "Eiffel Tower");
      expect(a).toBe(b);
      expect(a).toMatch(/^rh-identified-entity\|/);
    });

    it("differs when title differs", () => {
      const a = createIdentifiedEntityId(envelopeId, candidateId, "landmark", "Eiffel Tower");
      const b = createIdentifiedEntityId(envelopeId, candidateId, "landmark", "Statue of Liberty");
      expect(a).not.toBe(b);
    });

    it("differs when kind differs", () => {
      const a = createIdentifiedEntityId(envelopeId, candidateId, "landmark", "Eiffel Tower");
      const b = createIdentifiedEntityId(envelopeId, candidateId, "entity", "Eiffel Tower");
      expect(a).not.toBe(b);
    });
  });

  describe("deriveIdentifiedEntities", () => {
    const envelope: RecognitionEnvelope = {
      id: "rh-recognition-envelope|image|camera|file_landmark.jpg",
      modality: "image",
      captureSource: "camera",
      createdAt: "2025-01-01T00:00:00Z",
      inputRef: "file:///landmark.jpg",
    };

    function makeCandidateSummary(
      ...items: Array<{ label: string; confidence: number; candidateType: RecognitionCandidate["candidateType"] }>
    ): RecognitionCandidateSummary {
      return deriveRecognitionCandidates({
        envelope,
        rawCandidates: items,
      });
    }

    it("returns empty summary for empty candidate summary", () => {
      const candidateSummary: RecognitionCandidateSummary = { candidates: {}, candidateIds: [] };
      const summary = deriveIdentifiedEntities({ envelope, candidateSummary });
      expect(summary.entityIds).toEqual([]);
      expect(Object.keys(summary.entities)).toHaveLength(0);
    });

    it("preserves stable input order in entityIds", () => {
      const candidateSummary = makeCandidateSummary(
        { label: "Eiffel Tower", confidence: 0.95, candidateType: "landmark" },
        { label: "Paris", confidence: 0.8, candidateType: "entity" }
      );
      const summary = deriveIdentifiedEntities({ envelope, candidateSummary });
      expect(summary.entityIds).toHaveLength(2);
      expect(summary.entities[summary.entityIds[0]].title).toBe("Eiffel Tower");
      expect(summary.entities[summary.entityIds[1]].title).toBe("Paris");
    });

    it("stores entities by deterministic id", () => {
      const candidateSummary = makeCandidateSummary(
        { label: "Sony WH-1000XM5", confidence: 0.9, candidateType: "product" }
      );
      const summary = deriveIdentifiedEntities({ envelope, candidateSummary });
      const id = summary.entityIds[0];
      expect(summary.entities[id]).toBeDefined();
      expect(summary.entities[id].id).toBe(id);
    });

    it("copies expected envelopeId, candidateId, confidence, entityKind, normalized title", () => {
      const candidateSummary = makeCandidateSummary(
        { label: "  Eiffel Tower  ", confidence: 0.95, candidateType: "landmark" }
      );
      const summary = deriveIdentifiedEntities({ envelope, candidateSummary });
      const e = summary.entities[summary.entityIds[0]];
      expect(e.envelopeId).toBe(envelope.id);
      expect(e.candidateId).toBe(candidateSummary.candidateIds[0]);
      expect(e.confidence).toBe(0.95);
      expect(e.entityKind).toBe("landmark");
      expect(e.title).toBe("Eiffel Tower");
    });

    it("respects provided createdAt", () => {
      const candidateSummary = makeCandidateSummary(
        { label: "Topic", confidence: 0.8, candidateType: "topic" }
      );
      const createdAt = "2025-06-15T12:00:00.000Z";
      const summary = deriveIdentifiedEntities({ envelope, candidateSummary, createdAt });
      expect(summary.entities[summary.entityIds[0]].createdAt).toBe(createdAt);
    });

    it("does not sort or reinterpret entities", () => {
      const candidateSummary = makeCandidateSummary(
        { label: "B", confidence: 0.5, candidateType: "entity" },
        { label: "A", confidence: 0.9, candidateType: "entity" }
      );
      const summary = deriveIdentifiedEntities({ envelope, candidateSummary });
      expect(summary.entities[summary.entityIds[0]].title).toBe("B");
      expect(summary.entities[summary.entityIds[1]].title).toBe("A");
    });

    it("image + landmark fixture", () => {
      const env = createRecognitionEnvelope({
        modality: "image",
        captureSource: "camera",
        inputRef: "file:///landmark.jpg",
      });
      const candidateSummary = deriveRecognitionCandidates({
        envelope: env,
        rawCandidates: [
          { label: "Eiffel Tower", confidence: 0.95, candidateType: "landmark" },
        ],
      });
      const summary = deriveIdentifiedEntities({ envelope: env, candidateSummary });
      expect(summary.entityIds).toHaveLength(1);
      expect(summary.entities[summary.entityIds[0]].entityKind).toBe("landmark");
      expect(summary.entities[summary.entityIds[0]].title).toBe("Eiffel Tower");
    });

    it("image + product fixture", () => {
      const env = createRecognitionEnvelope({
        modality: "image",
        captureSource: "upload",
        inputRef: "file:///headphones.jpg",
      });
      const candidateSummary = deriveRecognitionCandidates({
        envelope: env,
        rawCandidates: [
          { label: "Sony WH-1000XM5", confidence: 0.88, candidateType: "product" },
        ],
      });
      const summary = deriveIdentifiedEntities({ envelope: env, candidateSummary });
      expect(summary.entities[summary.entityIds[0]].entityKind).toBe("product");
      expect(summary.entities[summary.entityIds[0]].title).toBe("Sony WH-1000XM5");
    });

    it("text + topic fixture", () => {
      const env = createRecognitionEnvelope({
        modality: "text",
        captureSource: "manual_text",
        inputRef: "text-ref",
      });
      const candidateSummary = deriveRecognitionCandidates({
        envelope: env,
        rawCandidates: [
          { label: "French Revolution", confidence: 0.85, candidateType: "topic" },
        ],
      });
      const summary = deriveIdentifiedEntities({ envelope: env, candidateSummary });
      expect(summary.entities[summary.entityIds[0]].entityKind).toBe("topic");
      expect(summary.entities[summary.entityIds[0]].title).toBe("French Revolution");
    });

    it("audio + media fixture", () => {
      const env = createRecognitionEnvelope({
        modality: "audio",
        captureSource: "microphone",
        inputRef: "rec:///clip",
      });
      const candidateSummary = deriveRecognitionCandidates({
        envelope: env,
        rawCandidates: [
          { label: "Unknown Song", confidence: 0.6, candidateType: "media" },
        ],
      });
      const summary = deriveIdentifiedEntities({ envelope: env, candidateSummary });
      expect(summary.entities[summary.entityIds[0]].entityKind).toBe("media");
      expect(summary.entities[summary.entityIds[0]].title).toBe("Unknown Song");
    });
  });
});
