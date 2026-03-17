/**
 * Rabbit Hole Core Groundwork v2 — Recognition Envelope System tests.
 */
import type { RecognitionEnvelope, RecognitionCandidate } from "../types/recognition";
import {
  createRecognitionEnvelopeId,
  createRecognitionCandidateId,
  createRecognitionEnvelope,
  deriveRecognitionCandidates,
} from "../utils/recognition";

describe("Recognition Envelope System", () => {
  describe("createRecognitionEnvelopeId", () => {
    it("is deterministic for same modality, source, and inputRef", () => {
      const a = createRecognitionEnvelopeId("image", "camera", "file:///photo.jpg");
      const b = createRecognitionEnvelopeId("image", "camera", "file:///photo.jpg");
      expect(a).toBe(b);
      expect(a).toMatch(/^rh-recognition-envelope\|image\|camera\|/);
    });

    it("differs when modality differs", () => {
      const image = createRecognitionEnvelopeId("image", "upload", "ref1");
      const audio = createRecognitionEnvelopeId("audio", "upload", "ref1");
      const text = createRecognitionEnvelopeId("text", "upload", "ref1");
      expect(image).not.toBe(audio);
      expect(image).not.toBe(text);
      expect(audio).not.toBe(text);
    });

    it("differs when inputRef differs", () => {
      const a = createRecognitionEnvelopeId("image", "camera", "file:///a.jpg");
      const b = createRecognitionEnvelopeId("image", "camera", "file:///b.jpg");
      expect(a).not.toBe(b);
    });
  });

  describe("createRecognitionCandidateId", () => {
    const envelopeId = "rh-recognition-envelope|image|camera|file:///photo.jpg";

    it("is deterministic for same envelope, label, and type", () => {
      const a = createRecognitionCandidateId(envelopeId, "Eiffel Tower", "landmark");
      const b = createRecognitionCandidateId(envelopeId, "Eiffel Tower", "landmark");
      expect(a).toBe(b);
      expect(a).toMatch(/^rh-recognition-candidate\|/);
    });

    it("differs when label differs", () => {
      const a = createRecognitionCandidateId(envelopeId, "Eiffel Tower", "landmark");
      const b = createRecognitionCandidateId(envelopeId, "Statue of Liberty", "landmark");
      expect(a).not.toBe(b);
    });

    it("differs when type differs", () => {
      const landmark = createRecognitionCandidateId(envelopeId, "Eiffel Tower", "landmark");
      const entity = createRecognitionCandidateId(envelopeId, "Eiffel Tower", "entity");
      expect(landmark).not.toBe(entity);
    });
  });

  describe("createRecognitionEnvelope", () => {
    it("returns correct shape with required fields", () => {
      const envelope = createRecognitionEnvelope({
        modality: "image",
        captureSource: "upload",
        inputRef: "file:///photo.jpg",
      });
      expect(envelope.id).toBeDefined();
      expect(envelope.modality).toBe("image");
      expect(envelope.captureSource).toBe("upload");
      expect(envelope.createdAt).toBeDefined();
      expect(envelope.inputRef).toBe("file:///photo.jpg");
      expect(envelope.id).toBe(
        createRecognitionEnvelopeId("image", "upload", "file:///photo.jpg")
      );
    });

    it("respects optional mimeType", () => {
      const envelope = createRecognitionEnvelope({
        modality: "image",
        captureSource: "upload",
        inputRef: "file:///x.jpg",
        mimeType: "image/jpeg",
      });
      expect(envelope.mimeType).toBe("image/jpeg");
    });

    it("respects optional metadata", () => {
      const envelope = createRecognitionEnvelope({
        modality: "audio",
        captureSource: "microphone",
        inputRef: "rec:///clip1",
        metadata: { durationMs: 5000 },
      });
      expect(envelope.metadata).toEqual({ durationMs: 5000 });
    });

    it("uses supplied createdAt when given", () => {
      const createdAt = "2025-01-15T12:00:00.000Z";
      const envelope = createRecognitionEnvelope({
        modality: "text",
        captureSource: "manual_text",
        inputRef: "text-ref-1",
        createdAt,
      });
      expect(envelope.createdAt).toBe(createdAt);
    });
  });

  describe("deriveRecognitionCandidates", () => {
    const envelope: RecognitionEnvelope = {
      id: "rh-recognition-envelope|image|camera|file:///landmark.jpg",
      modality: "image",
      captureSource: "camera",
      createdAt: "2025-01-01T00:00:00Z",
      inputRef: "file:///landmark.jpg",
    };

    it("returns empty summary for empty rawCandidates", () => {
      const summary = deriveRecognitionCandidates({ envelope, rawCandidates: [] });
      expect(summary.candidateIds).toEqual([]);
      expect(Object.keys(summary.candidates)).toHaveLength(0);
    });

    it("preserves stable order in candidateIds", () => {
      const summary = deriveRecognitionCandidates({
        envelope,
        rawCandidates: [
          { label: "Eiffel Tower", confidence: 0.95, candidateType: "landmark" },
          { label: "Paris", confidence: 0.8, candidateType: "entity" },
        ],
      });
      expect(summary.candidateIds).toHaveLength(2);
      expect(summary.candidateIds[0]).toContain("landmark");
      expect(summary.candidateIds[0]).toContain("Eiffel");
      expect(summary.candidateIds[1]).toContain("entity");
      expect(summary.candidateIds[1]).toContain("Paris");
    });

    it("stores candidates by deterministic id", () => {
      const summary = deriveRecognitionCandidates({
        envelope,
        rawCandidates: [
          { label: "Sony WH-1000XM5", confidence: 0.9, candidateType: "product" },
        ],
      });
      const id = summary.candidateIds[0];
      expect(summary.candidates[id]).toBeDefined();
      expect(summary.candidates[id].id).toBe(id);
    });

    it("includes expected envelopeId, label, confidence, candidateType", () => {
      const summary = deriveRecognitionCandidates({
        envelope,
        rawCandidates: [
          { label: "Eiffel Tower", confidence: 0.95, candidateType: "landmark" },
        ],
      });
      const c = summary.candidates[summary.candidateIds[0]];
      expect(c.envelopeId).toBe(envelope.id);
      expect(c.label).toBe("Eiffel Tower");
      expect(c.confidence).toBe(0.95);
      expect(c.candidateType).toBe("landmark");
    });

    it("does not sort or reinterpret candidates", () => {
      const raw = [
        { label: "B", confidence: 0.5, candidateType: "entity" as const },
        { label: "A", confidence: 0.9, candidateType: "entity" as const },
      ];
      const summary = deriveRecognitionCandidates({ envelope, rawCandidates: raw });
      expect(summary.candidateIds.length).toBe(2);
      expect(summary.candidates[summary.candidateIds[0]].label).toBe("B");
      expect(summary.candidates[summary.candidateIds[1]].label).toBe("A");
    });

    it("image + landmark fixture", () => {
      const env = createRecognitionEnvelope({
        modality: "image",
        captureSource: "camera",
        inputRef: "file:///landmark.jpg",
      });
      const summary = deriveRecognitionCandidates({
        envelope: env,
        rawCandidates: [
          { label: "Eiffel Tower", confidence: 0.95, candidateType: "landmark" },
        ],
      });
      expect(summary.candidateIds).toHaveLength(1);
      expect(summary.candidates[summary.candidateIds[0]].candidateType).toBe("landmark");
    });

    it("image + product fixture", () => {
      const env = createRecognitionEnvelope({
        modality: "image",
        captureSource: "upload",
        inputRef: "file:///headphones.jpg",
      });
      const summary = deriveRecognitionCandidates({
        envelope: env,
        rawCandidates: [
          { label: "Sony WH-1000XM5", confidence: 0.88, candidateType: "product" },
        ],
      });
      expect(summary.candidateIds).toHaveLength(1);
      expect(summary.candidates[summary.candidateIds[0]].label).toBe("Sony WH-1000XM5");
    });

    it("audio + media fixture", () => {
      const env = createRecognitionEnvelope({
        modality: "audio",
        captureSource: "microphone",
        inputRef: "rec:///clip",
      });
      const summary = deriveRecognitionCandidates({
        envelope: env,
        rawCandidates: [
          { label: "Unknown Song", confidence: 0.6, candidateType: "media" },
        ],
      });
      expect(summary.candidates[summary.candidateIds[0]].candidateType).toBe("media");
    });

    it("text + topic fixture", () => {
      const env = createRecognitionEnvelope({
        modality: "text",
        captureSource: "manual_text",
        inputRef: "text-ref",
      });
      const summary = deriveRecognitionCandidates({
        envelope: env,
        rawCandidates: [
          { label: "French Revolution", confidence: 0.85, candidateType: "topic" },
        ],
      });
      expect(summary.candidates[summary.candidateIds[0]].candidateType).toBe("topic");
    });
  });
});
