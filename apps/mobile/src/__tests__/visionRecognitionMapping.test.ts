/**
 * Rabbit Hole v15 — Vision response → candidate/entity mapping tests.
 */
import type { SceneObjectRegion } from "../types/sceneRegions";
import type { VisionRecognitionResponse } from "../types/visionApi";
import { createManualSceneObjectRegion } from "../utils/manualSceneRegion";
import {
  createRecognitionCandidateFromVisionResponse,
  createIdentifiedEntityFromVisionCandidate,
} from "../utils/visionRecognitionMapping";
import { resolveKnowledgeNodeForManualEntity } from "../utils/manualRecognition";
import { getSampleNodes } from "../data/sampleNodes";

function makeRegion(overrides: Partial<SceneObjectRegion> = {}): SceneObjectRegion {
  return createManualSceneObjectRegion({
    envelopeId: "env-1",
    label: "Placeholder",
    boundingBox: { x: 0.2, y: 0.2, width: 0.2, height: 0.2 },
    ...overrides,
  });
}

describe("vision recognition mapping", () => {
  it("createRecognitionCandidateFromVisionResponse maps label/type/confidence correctly", () => {
    const region = makeRegion();
    const response: VisionRecognitionResponse = {
      label: "Sony WH-1000XM5",
      candidateType: "product",
      confidence: 0.93,
    };
    const candidate = createRecognitionCandidateFromVisionResponse({ region, response });
    expect(candidate.label).toBe("Sony WH-1000XM5");
    expect(candidate.candidateType).toBe("product");
    expect(candidate.confidence).toBe(0.93);
    expect(candidate.envelopeId).toBe(region.envelopeId);
    expect(candidate.id).toContain("rh-recognition-candidate|");
  });

  it("uses 0 confidence when backend omits confidence", () => {
    const region = makeRegion();
    const response: VisionRecognitionResponse = {
      label: "Unknown object",
      candidateType: "entity",
    };
    const candidate = createRecognitionCandidateFromVisionResponse({ region, response });
    expect(candidate.confidence).toBe(0);
  });

  it("createIdentifiedEntityFromVisionCandidate preserves envelope/candidate linkage", () => {
    const region = makeRegion();
    const response: VisionRecognitionResponse = { label: "Headphones", candidateType: "product", confidence: 0.8 };
    const candidate = createRecognitionCandidateFromVisionResponse({ region, response });
    const entity = createIdentifiedEntityFromVisionCandidate({ envelopeId: region.envelopeId, candidate });
    expect(entity.envelopeId).toBe(region.envelopeId);
    expect(entity.candidateId).toBe(candidate.id);
    expect(entity.title).toBe(candidate.label);
    expect(entity.entityKind).toBe("product");
  });

  it("exact normalized backend label match resolves existing sample node", () => {
    const nodes = getSampleNodes();
    const node = resolveKnowledgeNodeForManualEntity("Sony WH-1000XM5", nodes);
    expect(node).not.toBeNull();
    expect(node?.title).toBe("Sony WH-1000XM5");
  });

  it("non-matching backend label does not invent node", () => {
    const nodes = getSampleNodes();
    expect(resolveKnowledgeNodeForManualEntity("Random product XYZ", nodes)).toBeNull();
  });
});
