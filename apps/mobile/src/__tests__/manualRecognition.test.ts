/**
 * Rabbit Hole v14 — Manual recognition and envelope factory tests.
 */
import type { SceneObjectRegion } from "../types/sceneRegions";
import { createRecognitionEnvelopeFromCapturedImage } from "../utils/recognitionEnvelopeFactory";
import { createManualSceneObjectRegion } from "../utils/manualSceneRegion";
import {
  createManualRecognitionCandidateFromRegion,
  createIdentifiedEntityFromManualCandidate,
  resolveKnowledgeNodeForManualEntity,
} from "../utils/manualRecognition";
import { getSampleNodes } from "../data/sampleNodes";
import { getSampleClaims } from "../data/sampleClaims";
import { deriveSavedObjectItemFromRegion } from "../utils/savedObjects";
import { selectNodeClaimsAvailability } from "../utils/evidenceAvailabilitySelectors";

describe("recognition envelope from capture", () => {
  it("createRecognitionEnvelopeFromCapturedImage creates valid image/camera envelope", () => {
    const uri = "file:///path/to/photo.jpg";
    const envelope = createRecognitionEnvelopeFromCapturedImage({
      imageUri: uri,
      captureSource: "camera",
    });
    expect(envelope.modality).toBe("image");
    expect(envelope.captureSource).toBe("camera");
    expect(envelope.inputRef).toBe(uri);
    expect(envelope.id).toContain("rh-recognition-envelope|");
    expect(typeof envelope.createdAt).toBe("string");
  });

  it("accepts optional width/height in metadata", () => {
    const envelope = createRecognitionEnvelopeFromCapturedImage({
      imageUri: "file:///x.jpg",
      width: 800,
      height: 600,
    });
    expect(envelope.metadata).toEqual({ width: 800, height: 600 });
  });
});

describe("manual scene region", () => {
  it("createManualSceneObjectRegion preserves envelope + bbox", () => {
    const region = createManualSceneObjectRegion({
      envelopeId: "env-1",
      label: "Coffee cup",
      boundingBox: { x: 0.2, y: 0.3, width: 0.2, height: 0.2 },
    });
    expect(region.envelopeId).toBe("env-1");
    expect(region.label).toBe("Coffee cup");
    expect(region.boundingBox).toEqual({ x: 0.2, y: 0.3, width: 0.2, height: 0.2 });
    expect(region.regionKind).toBe("entity");
    expect(region.id).toContain("rh-scene-object-region|");
    expect(region.recognitionCandidateId).toBeNull();
    expect(region.identifiedEntityId).toBeNull();
    expect(region.knowledgeNodeId).toBeNull();
  });

  it("defaults label to Unlabeled object when empty", () => {
    const region = createManualSceneObjectRegion({
      envelopeId: "env-1",
      boundingBox: { x: 0, y: 0, width: 0.1, height: 0.1 },
    });
    expect(region.label).toBe("Unlabeled object");
  });
});

describe("manual recognition", () => {
  it("manual candidate/entity creation produces canonical links", () => {
    const region = createManualSceneObjectRegion({
      envelopeId: "env-1",
      label: "Sony WH-1000XM5",
      boundingBox: { x: 0.25, y: 0.2, width: 0.2, height: 0.2 },
    });
    const candidate = createManualRecognitionCandidateFromRegion({
      region,
      label: "Sony WH-1000XM5",
      candidateType: "product",
    });
    expect(candidate.envelopeId).toBe("env-1");
    expect(candidate.label).toBe("Sony WH-1000XM5");
    expect(candidate.candidateType).toBe("product");
    expect(candidate.id).toContain("rh-recognition-candidate|");

    const entity = createIdentifiedEntityFromManualCandidate({
      envelopeId: "env-1",
      candidate,
    });
    expect(entity.envelopeId).toBe("env-1");
    expect(entity.candidateId).toBe(candidate.id);
    expect(entity.title).toBe(candidate.label);
    expect(entity.entityKind).toBe("product");
  });

  it("exact label match to sample node resolves existing node", () => {
    const nodes = getSampleNodes();
    const node = resolveKnowledgeNodeForManualEntity("Sony WH-1000XM5", nodes);
    expect(node).not.toBeNull();
    expect(node?.title).toBe("Sony WH-1000XM5");
  });

  it("normalized label match resolves (trim/whitespace)", () => {
    const nodes = getSampleNodes();
    expect(resolveKnowledgeNodeForManualEntity("  Sony WH-1000XM5  ", nodes)?.title).toBe("Sony WH-1000XM5");
  });

  it("non-matching label does not invent a node", () => {
    const nodes = getSampleNodes();
    expect(resolveKnowledgeNodeForManualEntity("Random thing", nodes)).toBeNull();
    expect(resolveKnowledgeNodeForManualEntity("Sony WH-1000XM4", nodes)).toBeNull();
  });
});

describe("derived saved object from captured/manual flow", () => {
  it("becomes recognition_only when no node match", () => {
    const region = createManualSceneObjectRegion({
      envelopeId: "env-captured",
      label: "Unknown object",
      boundingBox: { x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
    });
    const candidate = createManualRecognitionCandidateFromRegion({ region, label: "Unknown object" });
    const entity = createIdentifiedEntityFromManualCandidate({ envelopeId: "env-captured", candidate });
    const regionWithIds: SceneObjectRegion = {
      ...region,
      recognitionCandidateId: candidate.id,
      identifiedEntityId: entity.id,
      knowledgeNodeId: null,
    };
    const item = deriveSavedObjectItemFromRegion(regionWithIds, { claimsAvailability: null });
    expect(item.verificationKind).toBe("recognition_only");
    expect(item.knowledgeNodeId).toBeUndefined();
  });

  it("becomes evidenced when node matches and has claims", () => {
    const nodes = getSampleNodes();
    const claims = getSampleClaims();
    const node = resolveKnowledgeNodeForManualEntity("Sony WH-1000XM5", nodes);
    expect(node).not.toBeNull();
    const claimsAvailability = node ? selectNodeClaimsAvailability(node.id, claims).kind : null;

    const region = createManualSceneObjectRegion({
      envelopeId: "env-captured",
      label: "Sony WH-1000XM5",
      boundingBox: { x: 0.2, y: 0.2, width: 0.2, height: 0.2 },
    });
    const candidate = createManualRecognitionCandidateFromRegion({ region, label: "Sony WH-1000XM5", candidateType: "product" });
    const entity = createIdentifiedEntityFromManualCandidate({ envelopeId: "env-captured", candidate });
    const regionWithIds: SceneObjectRegion = {
      ...region,
      recognitionCandidateId: candidate.id,
      identifiedEntityId: entity.id,
      knowledgeNodeId: node!.id,
    };
    const item = deriveSavedObjectItemFromRegion(regionWithIds, {
      knowledgeNodeId: node!.id,
      claimsAvailability,
    });
    expect(item.verificationKind).toBe("evidenced");
    expect(item.knowledgeNodeId).toBe(node!.id);
  });
});
