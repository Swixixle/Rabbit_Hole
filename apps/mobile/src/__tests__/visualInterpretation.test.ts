/**
 * Landmark Recognition Groundwork v1 — visual interpretation pipeline tests.
 * Deterministic pipeline behavior; no semantic inference.
 */
import type {
  VisualCapture,
  VisualRecognitionCandidate,
  LandmarkInterpretation,
  LandmarkClaimPlaceholder,
} from "../types/visualCapture";
import {
  createLandmarkInterpretationId,
  deriveLandmarkInterpretations,
  createLandmarkClaimPlaceholderId,
  deriveLandmarkClaimPlaceholders,
} from "../utils/visualInterpretation";

describe("Landmark Recognition Groundwork v1", () => {
  describe("visual capture creation", () => {
    it("creates a valid VisualCapture with required fields", () => {
      const capture: VisualCapture = {
        id: "vc-1",
        createdAt: "2025-01-01T00:00:00Z",
        source: "camera",
        uri: "file:///photo.jpg",
      };
      expect(capture.id).toBe("vc-1");
      expect(capture.source).toBe("camera");
      expect(capture.uri).toBe("file:///photo.jpg");
    });

    it("accepts optional width, height, metadata", () => {
      const capture: VisualCapture = {
        id: "vc-2",
        createdAt: "2025-01-01T00:00:00Z",
        source: "upload",
        uri: "file:///upload.jpg",
        width: 1920,
        height: 1080,
        metadata: { mimeType: "image/jpeg" },
      };
      expect(capture.width).toBe(1920);
      expect(capture.height).toBe(1080);
      expect(capture.metadata?.mimeType).toBe("image/jpeg");
    });
  });

  describe("recognition candidate creation", () => {
    it("creates a valid VisualRecognitionCandidate", () => {
      const candidate: VisualRecognitionCandidate = {
        id: "cand-1",
        captureId: "vc-1",
        label: "Eiffel Tower",
        confidence: 0.95,
      };
      expect(candidate.label).toBe("Eiffel Tower");
      expect(candidate.confidence).toBe(0.95);
    });
  });

  describe("interpretation derivation", () => {
    it("deriveLandmarkInterpretations produces one interpretation per candidate", () => {
      const capture: VisualCapture = {
        id: "cap-1",
        createdAt: "2025-01-01T00:00:00Z",
        source: "camera",
        uri: "file:///img.jpg",
      };
      const candidates: VisualRecognitionCandidate[] = [
        { id: "c1", captureId: "cap-1", label: "Eiffel Tower", confidence: 0.9 },
        { id: "c2", captureId: "cap-1", label: "Statue of Liberty", confidence: 0.7 },
      ];
      const interpretations = deriveLandmarkInterpretations(capture, candidates);
      expect(interpretations).toHaveLength(2);
      expect(interpretations[0].entityName).toBe("Eiffel Tower");
      expect(interpretations[0].confidence).toBe(0.9);
      expect(interpretations[1].entityName).toBe("Statue of Liberty");
      expect(interpretations[1].confidence).toBe(0.7);
    });

    it("deriveLandmarkInterpretations returns empty array when no candidates", () => {
      const capture: VisualCapture = {
        id: "cap-1",
        createdAt: "2025-01-01T00:00:00Z",
        source: "camera",
        uri: "file:///img.jpg",
      };
      const interpretations = deriveLandmarkInterpretations(capture, []);
      expect(interpretations).toEqual([]);
    });
  });

  describe("deterministic interpretation IDs", () => {
    it("createLandmarkInterpretationId returns deterministic id", () => {
      const id = createLandmarkInterpretationId("capture-1", "candidate-1");
      expect(id).toBe("landmark-interpretation|capture-1|candidate-1");
      expect(createLandmarkInterpretationId("capture-1", "candidate-1")).toBe(id);
    });

    it("deriveLandmarkInterpretations uses deterministic ids", () => {
      const capture: VisualCapture = {
        id: "cap-a",
        createdAt: "2025-01-01T00:00:00Z",
        source: "camera",
        uri: "file:///x.jpg",
      };
      const candidates: VisualRecognitionCandidate[] = [
        { id: "c-x", captureId: "cap-a", label: "Golden Gate Bridge", confidence: 0.85 },
      ];
      const interpretations = deriveLandmarkInterpretations(capture, candidates);
      expect(interpretations[0].id).toBe("landmark-interpretation|cap-a|c-x");
      expect(interpretations[0].captureId).toBe("cap-a");
      expect(interpretations[0].candidateId).toBe("c-x");
    });
  });

  describe("interpretation-to-claim placeholder mapping", () => {
    it("deriveLandmarkClaimPlaceholders produces one placeholder per interpretation", () => {
      const interpretations: LandmarkInterpretation[] = [
        {
          id: "landmark-interpretation|cap-1|c1",
          captureId: "cap-1",
          candidateId: "c1",
          entityName: "Eiffel Tower",
          confidence: 0.9,
        },
      ];
      const placeholders = deriveLandmarkClaimPlaceholders(interpretations);
      expect(placeholders).toHaveLength(1);
      expect(placeholders[0].text).toBe("Eiffel Tower is a landmark.");
      expect(placeholders[0].confidence).toBe(0.9);
      expect(placeholders[0].interpretationId).toBe("landmark-interpretation|cap-1|c1");
    });

    it("createLandmarkClaimPlaceholderId returns deterministic id", () => {
      const id = createLandmarkClaimPlaceholderId("landmark-interpretation|cap-1|c1");
      expect(id).toBe("landmark-claim-placeholder|landmark-interpretation|cap-1|c1");
    });

    it("full pipeline: capture → candidates → interpretations → claim placeholders", () => {
      const capture: VisualCapture = {
        id: "vc-pipeline",
        createdAt: "2025-01-01T00:00:00Z",
        source: "video_frame",
        uri: "file:///frame.jpg",
      };
      const candidates: VisualRecognitionCandidate[] = [
        { id: "c1", captureId: "vc-pipeline", label: "Eiffel Tower", confidence: 0.95 },
      ];
      const interpretations = deriveLandmarkInterpretations(capture, candidates);
      const placeholders = deriveLandmarkClaimPlaceholders(interpretations);
      expect(interpretations).toHaveLength(1);
      expect(interpretations[0].entityName).toBe("Eiffel Tower");
      expect(placeholders).toHaveLength(1);
      expect(placeholders[0].id).toBe(
        "landmark-claim-placeholder|landmark-interpretation|vc-pipeline|c1"
      );
      expect(placeholders[0].text).toBe("Eiffel Tower is a landmark.");
    });
  });

  describe("deterministic pipeline behavior", () => {
    it("same inputs produce same interpretations and placeholders", () => {
      const capture: VisualCapture = {
        id: "cap-d",
        createdAt: "2025-01-01T00:00:00Z",
        source: "upload",
        uri: "file:///a.jpg",
      };
      const candidates: VisualRecognitionCandidate[] = [
        { id: "c1", captureId: "cap-d", label: "Colosseum", confidence: 0.88 },
      ];
      const run1 = deriveLandmarkClaimPlaceholders(deriveLandmarkInterpretations(capture, candidates));
      const run2 = deriveLandmarkClaimPlaceholders(deriveLandmarkInterpretations(capture, candidates));
      expect(run1).toEqual(run2);
      expect(run1[0].id).toBe(run2[0].id);
      expect(run1[0].text).toBe(run2[0].text);
    });

    it("no semantic inference: interpretations mirror candidate label and confidence", () => {
      const capture: VisualCapture = {
        id: "cap-m",
        createdAt: "2025-01-01T00:00:00Z",
        source: "camera",
        uri: "file:///m.jpg",
      };
      const candidates: VisualRecognitionCandidate[] = [
        { id: "c1", captureId: "cap-m", label: "Unknown Monument", confidence: 0.5 },
      ];
      const interpretations = deriveLandmarkInterpretations(capture, candidates);
      expect(interpretations[0].entityName).toBe("Unknown Monument");
      expect(interpretations[0].confidence).toBe(0.5);
      const placeholders = deriveLandmarkClaimPlaceholders(interpretations);
      expect(placeholders[0].text).toBe("Unknown Monument is a landmark.");
    });
  });
});
