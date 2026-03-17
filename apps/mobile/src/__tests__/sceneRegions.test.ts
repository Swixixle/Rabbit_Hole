/**
 * Rabbit Hole Core Groundwork v5 — Interactive scene regions tests.
 */
import type { RecognitionEnvelope, RecognitionCandidateSummary } from "../types/recognition";
import type { IdentifiedEntitySummary } from "../types/entityIdentification";
import type { KnowledgeNodeSummary } from "../types/knowledgeNodes";
import type { NormalizedBoundingBox, SceneObjectRegionKind } from "../types/sceneRegions";
import {
  createSceneObjectRegionId,
  mapCandidateTypeToSceneRegionKind,
  deriveSceneObjectRegions,
  isPointInsideNormalizedBoundingBox,
  computeNormalizedBoundingBoxArea,
} from "../utils/sceneRegions";
import {
  selectSceneObjectRegionsForEnvelope,
  selectSceneObjectRegionsAtPoint,
  selectPrimarySceneObjectRegionAtPoint,
  selectSceneRegionSelectionResult,
  selectActiveSceneObjectPreview,
} from "../utils/sceneRegionSelectors";
import { createRecognitionCandidateId } from "../utils/recognition";
import { createIdentifiedEntityId } from "../utils/entityIdentification";
import { createKnowledgeNodeId } from "../utils/knowledgeNodes";

const envelopeId = "rh-recognition-envelope|image|camera|file_photo.jpg";
const envelope: RecognitionEnvelope = {
  id: envelopeId,
  modality: "image",
  captureSource: "camera",
  createdAt: "2025-01-01T00:00:00Z",
  inputRef: "file:///photo.jpg",
};

describe("Scene Regions", () => {
  describe("createSceneObjectRegionId", () => {
    const base = {
      envelopeId,
      regionKind: "product" as SceneObjectRegionKind,
      label: "Tile flooring",
      boundingBox: { x: 0.1, y: 0.2, width: 0.3, height: 0.15 },
    };

    it("is deterministic for same inputs", () => {
      const a = createSceneObjectRegionId(base);
      const b = createSceneObjectRegionId(base);
      expect(a).toBe(b);
      expect(a).toMatch(/^rh-scene-object-region\|/);
    });

    it("differs when bbox differs", () => {
      const a = createSceneObjectRegionId(base);
      const b = createSceneObjectRegionId({
        ...base,
        boundingBox: { x: 0.2, y: 0.2, width: 0.3, height: 0.15 },
      });
      expect(a).not.toBe(b);
    });

    it("differs when label differs", () => {
      const a = createSceneObjectRegionId(base);
      const b = createSceneObjectRegionId({ ...base, label: "Hardwood floor" });
      expect(a).not.toBe(b);
    });
  });

  describe("mapCandidateTypeToSceneRegionKind", () => {
    it("maps entity, topic, product, landmark, media 1:1", () => {
      expect(mapCandidateTypeToSceneRegionKind("entity")).toBe("entity");
      expect(mapCandidateTypeToSceneRegionKind("topic")).toBe("topic");
      expect(mapCandidateTypeToSceneRegionKind("product")).toBe("product");
      expect(mapCandidateTypeToSceneRegionKind("landmark")).toBe("landmark");
      expect(mapCandidateTypeToSceneRegionKind("media")).toBe("media");
    });
  });

  describe("deriveSceneObjectRegions", () => {
    it("returns empty summary for empty raw regions", () => {
      const summary = deriveSceneObjectRegions({ envelope, rawRegions: [] });
      expect(summary.regionIds).toEqual([]);
      expect(Object.keys(summary.regions)).toHaveLength(0);
    });

    it("preserves input order in regionIds", () => {
      const raw = [
        { label: "Shirt", regionKind: "apparel" as SceneObjectRegionKind, confidence: 0.9, boundingBox: { x: 0.2, y: 0.1, width: 0.2, height: 0.3 } },
        { label: "Tile floor", regionKind: "material" as SceneObjectRegionKind, confidence: 0.85, boundingBox: { x: 0, y: 0.7, width: 1, height: 0.3 } },
        { label: "Tree", regionKind: "plant" as SceneObjectRegionKind, confidence: 0.8, boundingBox: { x: 0.7, y: 0, width: 0.3, height: 0.5 } },
      ];
      const summary = deriveSceneObjectRegions({ envelope, rawRegions: raw });
      expect(summary.regionIds.length).toBe(3);
      expect(summary.regionIds[0]).toBe(createSceneObjectRegionId({ envelopeId, regionKind: raw[0].regionKind, label: raw[0].label, boundingBox: raw[0].boundingBox }));
      expect(summary.regionIds[1]).toBe(createSceneObjectRegionId({ envelopeId, regionKind: raw[1].regionKind, label: raw[1].label, boundingBox: raw[1].boundingBox }));
      expect(summary.regionIds[2]).toBe(createSceneObjectRegionId({ envelopeId, regionKind: raw[2].regionKind, label: raw[2].label, boundingBox: raw[2].boundingBox }));
    });

    it("stores regions by deterministic id", () => {
      const raw = [{ label: "Car", regionKind: "vehicle" as SceneObjectRegionKind, confidence: 0.95, boundingBox: { x: 0.1, y: 0.2, width: 0.25, height: 0.2 } }];
      const summary = deriveSceneObjectRegions({ envelope, rawRegions: raw });
      const id = createSceneObjectRegionId({ envelopeId, regionKind: raw[0].regionKind, label: raw[0].label, boundingBox: raw[0].boundingBox });
      expect(summary.regions[id]).toBeDefined();
      expect(summary.regions[id].label).toBe("Car");
      expect(summary.regions[id].regionKind).toBe("vehicle");
      expect(summary.regions[id].confidence).toBe(0.95);
      expect(summary.regions[id].boundingBox).toEqual(raw[0].boundingBox);
      expect(summary.regions[id].envelopeId).toBe(envelopeId);
    });

    it("respects provided createdAt", () => {
      const created = "2025-06-15T12:00:00Z";
      const raw = [{ label: "Landmark", regionKind: "landmark" as SceneObjectRegionKind, confidence: 1, boundingBox: { x: 0, y: 0, width: 0.5, height: 0.5 } }];
      const summary = deriveSceneObjectRegions({ envelope, rawRegions: raw, createdAt: created });
      const r = Object.values(summary.regions)[0];
      expect(r.createdAt).toBe(created);
    });

    it("leaves links null when no matching summaries", () => {
      const raw = [{ label: "Eiffel Tower", regionKind: "landmark" as SceneObjectRegionKind, confidence: 0.9, boundingBox: { x: 0.3, y: 0.1, width: 0.4, height: 0.6 } }];
      const summary = deriveSceneObjectRegions({ envelope, rawRegions: raw });
      const r = Object.values(summary.regions)[0];
      expect(r.recognitionCandidateId).toBeNull();
      expect(r.identifiedEntityId).toBeNull();
      expect(r.knowledgeNodeId).toBeNull();
    });

    it("links candidate/entity/node when matching data supplied", () => {
      const raw = [{ label: "Eiffel Tower", regionKind: "landmark" as SceneObjectRegionKind, confidence: 0.9, boundingBox: { x: 0.3, y: 0.1, width: 0.4, height: 0.6 } }];
      const candidateId = createRecognitionCandidateId(envelopeId, "Eiffel Tower", "landmark");
      const entityId = createIdentifiedEntityId(envelopeId, candidateId, "landmark", "Eiffel Tower");
      const nodeId = createKnowledgeNodeId(envelopeId, "landmark", "Eiffel Tower");
      const candidateSummary: RecognitionCandidateSummary = {
        candidates: {
          [candidateId]: {
            id: candidateId,
            envelopeId,
            label: "Eiffel Tower",
            confidence: 0.9,
            candidateType: "landmark",
          },
        },
        candidateIds: [candidateId],
      };
      const identifiedEntitySummary: IdentifiedEntitySummary = {
        entities: {
          [entityId]: {
            id: entityId,
            envelopeId,
            candidateId,
            title: "Eiffel Tower",
            entityKind: "landmark",
            confidence: 0.9,
            createdAt: "2025-01-01T00:00:00Z",
          },
        },
        entityIds: [entityId],
      };
      const knowledgeNodeSummary: KnowledgeNodeSummary = {
        nodes: {
          [nodeId]: {
            id: nodeId,
            identifiedEntityId: entityId,
            envelopeId,
            title: "Eiffel Tower",
            nodeKind: "landmark",
            description: null,
            relatedNodeIds: [],
            sourceIds: [],
            confidence: 0.9,
            createdAt: "2025-01-01T00:00:00Z",
          },
        },
        nodeIds: [nodeId],
      };
      const summary = deriveSceneObjectRegions({
        envelope,
        rawRegions: raw,
        candidateSummary,
        identifiedEntitySummary,
        knowledgeNodeSummary,
      });
      const r = Object.values(summary.regions)[0];
      expect(r.recognitionCandidateId).toBe(candidateId);
      expect(r.identifiedEntityId).toBe(entityId);
      expect(r.knowledgeNodeId).toBe(nodeId);
    });
  });

  describe("bounding box helpers", () => {
    const box: NormalizedBoundingBox = { x: 0.2, y: 0.3, width: 0.4, height: 0.3 };

    it("point inside box returns true", () => {
      expect(isPointInsideNormalizedBoundingBox(0.3, 0.4, box)).toBe(true);
      expect(isPointInsideNormalizedBoundingBox(0.2, 0.3, box)).toBe(true);
      expect(isPointInsideNormalizedBoundingBox(0.6, 0.6, box)).toBe(true);
    });

    it("point outside returns false", () => {
      expect(isPointInsideNormalizedBoundingBox(0.1, 0.4, box)).toBe(false);
      expect(isPointInsideNormalizedBoundingBox(0.3, 0.2, box)).toBe(false);
      expect(isPointInsideNormalizedBoundingBox(0.7, 0.5, box)).toBe(false);
    });

    it("area computed correctly", () => {
      expect(computeNormalizedBoundingBoxArea({ x: 0, y: 0, width: 0.5, height: 0.2 })).toBe(0.1);
      expect(computeNormalizedBoundingBoxArea(box)).toBe(0.4 * 0.3);
    });
  });

  describe("selectors", () => {
    const shirtBox = { x: 0.2, y: 0.1, width: 0.2, height: 0.3 };
    const tileBox = { x: 0, y: 0.7, width: 1, height: 0.3 };
    const treeBox = { x: 0.7, y: 0, width: 0.3, height: 0.5 };
    const carBox = { x: 0.1, y: 0.25, width: 0.25, height: 0.2 };
    const otherEnvelopeId = "rh-recognition-envelope|image|upload|other.jpg";
    const raw = [
      { label: "Shirt", regionKind: "apparel" as SceneObjectRegionKind, confidence: 0.9, boundingBox: shirtBox },
      { label: "Tile floor", regionKind: "material" as SceneObjectRegionKind, confidence: 0.85, boundingBox: tileBox },
      { label: "Tree", regionKind: "plant" as SceneObjectRegionKind, confidence: 0.8, boundingBox: treeBox },
      { label: "Car", regionKind: "vehicle" as SceneObjectRegionKind, confidence: 0.95, boundingBox: carBox },
    ];
    const summary = deriveSceneObjectRegions({ envelope, rawRegions: raw });

    it("regions for one envelope only", () => {
      const list = selectSceneObjectRegionsForEnvelope(summary, envelopeId);
      expect(list.length).toBe(4);
      expect(list.every((r) => r.envelopeId === envelopeId)).toBe(true);
      expect(selectSceneObjectRegionsForEnvelope(summary, otherEnvelopeId)).toEqual([]);
    });

    it("all containing regions at point returned in order", () => {
      const atCarOnly = selectSceneObjectRegionsAtPoint({ summary, envelopeId, x: 0.15, y: 0.3 });
      expect(atCarOnly.length).toBe(1);
      expect(atCarOnly[0].label).toBe("Car");
      const inTile = selectSceneObjectRegionsAtPoint({ summary, envelopeId, x: 0.5, y: 0.85 });
      expect(inTile.length).toBe(1);
      expect(inTile[0].label).toBe("Tile floor");
    });

    it("primary region chooses smallest containing box", () => {
      const smallBox = { x: 0.15, y: 0.12, width: 0.1, height: 0.1 };
      const bigBox = { x: 0, y: 0, width: 0.5, height: 0.5 };
      const twoSummary = deriveSceneObjectRegions({
        envelope,
        rawRegions: [
          { label: "Small", regionKind: "entity" as SceneObjectRegionKind, confidence: 0.8, boundingBox: smallBox },
          { label: "Big", regionKind: "entity" as SceneObjectRegionKind, confidence: 0.9, boundingBox: bigBox },
        ],
      });
      const primary = selectPrimarySceneObjectRegionAtPoint({
        summary: twoSummary,
        envelopeId,
        x: 0.2,
        y: 0.17,
      });
      expect(primary).not.toBeNull();
      expect(primary!.label).toBe("Small");
    });

    it("confidence breaks ties when area equal", () => {
      const sameBox = { x: 0.1, y: 0.1, width: 0.2, height: 0.2 };
      const twoSummary = deriveSceneObjectRegions({
        envelope,
        rawRegions: [
          { label: "A", regionKind: "entity" as SceneObjectRegionKind, confidence: 0.7, boundingBox: sameBox },
          { label: "B", regionKind: "entity" as SceneObjectRegionKind, confidence: 0.9, boundingBox: sameBox },
        ],
      });
      const primary = selectPrimarySceneObjectRegionAtPoint({
        summary: twoSummary,
        envelopeId,
        x: 0.2,
        y: 0.2,
      });
      expect(primary).not.toBeNull();
      expect(primary!.label).toBe("B");
    });

    it("null when no region contains point", () => {
      const primary = selectPrimarySceneObjectRegionAtPoint({
        summary,
        envelopeId,
        x: 0.5,
        y: 0.5,
      });
      expect(primary).toBeNull();
    });

    it("selectSceneRegionSelectionResult returns selectedRegion", () => {
      const result = selectSceneRegionSelectionResult({
        summary,
        envelopeId,
        x: 0.15,
        y: 0.3,
      });
      expect(result.selectedRegion).not.toBeNull();
      expect(result.selectedRegion!.label).toBe("Car");
      const noResult = selectSceneRegionSelectionResult({
        summary,
        envelopeId,
        x: 0.5,
        y: 0.5,
      });
      expect(noResult.selectedRegion).toBeNull();
    });

    it("active preview returns expected payload", () => {
      const preview = selectActiveSceneObjectPreview({
        summary,
        envelopeId,
        x: 0.15,
        y: 0.3,
      });
      expect(preview).not.toBeNull();
      expect(preview!.regionId).toBeDefined();
      expect(preview!.envelopeId).toBe(envelopeId);
      expect(preview!.label).toBe("Car");
      expect(preview!.regionKind).toBe("vehicle");
      expect(preview!.confidence).toBe(0.95);
      expect(preview!.knowledgeNodeId).toBeNull();
      expect(selectActiveSceneObjectPreview({ summary, envelopeId, x: 0.5, y: 0.5 })).toBeNull();
    });
  });
});
