/**
 * Rabbit Hole v12 — Saved object tray and verification tests.
 */
import type { SceneObjectRegion } from "../types/sceneRegions";
import type { SavedObjectItem } from "../types/savedObjects";
import {
  createSavedObjectItemId,
  deriveSavedObjectVerificationKind,
  deriveSavedObjectItemFromRegion,
} from "../utils/savedObjects";
import {
  selectSavedObjectById,
  selectSavedObjectsForEnvelope,
  selectSavedObjectsOrdered,
  upsertSavedObjectItem,
} from "../utils/savedObjectSelectors";

const CREATED = "2025-01-01T00:00:00Z";

function makeRegion(overrides: Partial<SceneObjectRegion> = {}): SceneObjectRegion {
  return {
    id: "region-1",
    envelopeId: "env-1",
    label: "Sony WH-1000XM5",
    regionKind: "product",
    confidence: 0.9,
    boundingBox: { x: 0.2, y: 0.2, width: 0.3, height: 0.3 },
    recognitionCandidateId: "cand-1",
    identifiedEntityId: "ent-1",
    knowledgeNodeId: "node-1",
    createdAt: CREATED,
    ...overrides,
  };
}

function makeItem(overrides: Partial<SavedObjectItem> = {}): SavedObjectItem {
  return {
    id: createSavedObjectItemId("env-1", "region-1"),
    sourceEnvelopeId: "env-1",
    sourceRegionId: "region-1",
    label: "Sony WH-1000XM5",
    savedAt: CREATED,
    verificationKind: "recognition_only",
    ...overrides,
  };
}

describe("saved objects", () => {
  describe("createSavedObjectItemId", () => {
    it("is deterministic for same envelope and region", () => {
      const a = createSavedObjectItemId("env-1", "region-1");
      const b = createSavedObjectItemId("env-1", "region-1");
      expect(a).toBe(b);
    });

    it("differs for different region", () => {
      const a = createSavedObjectItemId("env-1", "region-1");
      const b = createSavedObjectItemId("env-1", "region-2");
      expect(a).not.toBe(b);
    });
  });

  describe("deriveSavedObjectVerificationKind", () => {
    it("returns evidenced when node has claims", () => {
      expect(
        deriveSavedObjectVerificationKind("node-1", "has_claims")
      ).toBe("evidenced");
    });

    it("returns recognition_only when node exists but no claims", () => {
      expect(
        deriveSavedObjectVerificationKind("node-1", "no_claims_yet")
      ).toBe("recognition_only");
    });

    it("returns recognition_only when node exists and claimsAvailability null", () => {
      expect(
        deriveSavedObjectVerificationKind("node-1", null)
      ).toBe("recognition_only");
    });

    it("returns recognition_only when no node but has candidate/entity", () => {
      expect(
        deriveSavedObjectVerificationKind(undefined, null, true)
      ).toBe("recognition_only");
    });

    it("returns unverified when no node and no candidate/entity", () => {
      expect(
        deriveSavedObjectVerificationKind(undefined, null, false)
      ).toBe("unverified");
    });
  });

  describe("deriveSavedObjectItemFromRegion", () => {
    it("preserves envelope, region, candidate, entity, node links", () => {
      const region = makeRegion({
        envelopeId: "env-1",
        id: "region-1",
        recognitionCandidateId: "cand-1",
        identifiedEntityId: "ent-1",
        knowledgeNodeId: "node-1",
      });
      const item = deriveSavedObjectItemFromRegion(region, { savedAt: CREATED });
      expect(item.sourceEnvelopeId).toBe("env-1");
      expect(item.sourceRegionId).toBe("region-1");
      expect(item.recognitionCandidateId).toBe("cand-1");
      expect(item.identifiedEntityId).toBe("ent-1");
      expect(item.knowledgeNodeId).toBe("node-1");
      expect(item.id).toBe(createSavedObjectItemId("env-1", "region-1"));
    });

    it("uses options.knowledgeNodeId and options.claimsAvailability for verification", () => {
      const region = makeRegion({ knowledgeNodeId: null });
      const item = deriveSavedObjectItemFromRegion(region, {
        knowledgeNodeId: "node-1",
        claimsAvailability: "has_claims",
        savedAt: CREATED,
      });
      expect(item.verificationKind).toBe("evidenced");
    });

    it("sets recognition_only when node has no claims", () => {
      const region = makeRegion({ knowledgeNodeId: "node-1" });
      const item = deriveSavedObjectItemFromRegion(region, {
        claimsAvailability: "no_claims_yet",
        savedAt: CREATED,
      });
      expect(item.verificationKind).toBe("recognition_only");
    });

    it("sets unverified when no node and no candidate/entity", () => {
      const region = makeRegion({
        knowledgeNodeId: null,
        recognitionCandidateId: null,
        identifiedEntityId: null,
      });
      const item = deriveSavedObjectItemFromRegion(region, { savedAt: CREATED });
      expect(item.verificationKind).toBe("unverified");
    });
  });
});

describe("saved object selectors", () => {
  describe("selectSavedObjectById", () => {
    it("returns item when id exists", () => {
      const item = makeItem();
      expect(selectSavedObjectById(item.id, [item])).toBe(item);
    });

    it("returns null when id missing", () => {
      expect(selectSavedObjectById("missing", [makeItem()])).toBeNull();
    });
  });

  describe("selectSavedObjectsForEnvelope", () => {
    it("filters by envelopeId", () => {
      const a = makeItem({ sourceEnvelopeId: "env-1" });
      const b = makeItem({ id: "id-2", sourceEnvelopeId: "env-2", sourceRegionId: "region-2" });
      expect(selectSavedObjectsForEnvelope("env-1", [a, b])).toEqual([a]);
    });
  });

  describe("selectSavedObjectsOrdered", () => {
    it("sorts newest first by savedAt, then by id", () => {
      const older = makeItem({ savedAt: "2025-01-01T00:00:00Z" });
      const newer = makeItem({
        id: createSavedObjectItemId("env-1", "region-2"),
        sourceRegionId: "region-2",
        savedAt: "2025-01-02T00:00:00Z",
      });
      const result = selectSavedObjectsOrdered([older, newer]);
      expect(result[0].savedAt).toBe("2025-01-02T00:00:00Z");
      expect(result[1].savedAt).toBe("2025-01-01T00:00:00Z");
    });
  });

  describe("upsertSavedObjectItem", () => {
    it("dedupes by id and newest wins", () => {
      const item1 = makeItem({ savedAt: "2025-01-01T00:00:00Z" });
      const item2 = makeItem({ savedAt: "2025-01-02T00:00:00Z" });
      const result = upsertSavedObjectItem(item2, [item1]);
      expect(result.length).toBe(1);
      expect(result[0].savedAt).toBe("2025-01-02T00:00:00Z");
    });

    it("appends new item when id not present", () => {
      const a = makeItem({ id: createSavedObjectItemId("env-1", "region-1") });
      const b = makeItem({
        id: createSavedObjectItemId("env-1", "region-2"),
        sourceRegionId: "region-2",
      });
      const result = upsertSavedObjectItem(b, [a]);
      expect(result.length).toBe(2);
    });
  });
});

describe("saved Sony region derives openable item", () => {
  it("derived item has knowledgeNodeId that resolves to Sony node", () => {
    const { getSampleSceneRegionSummary } = require("../data/sampleScene");
    const { getSampleRecognitionCandidates, getSampleIdentifiedEntities } = require("../data/sampleRecognition");
    const { getSampleNodes } = require("../data/sampleNodes");
    const { SAMPLE_ENVELOPE_ID_CONST } = require("../data/sampleNodes");
    const { selectSceneObjectRegionsForEnvelope } = require("../utils/sceneRegionSelectors");
    const { getSampleClaims } = require("../data/sampleClaims");
    const { selectNodeClaimsAvailability } = require("../utils/evidenceAvailabilitySelectors");

    const summary = getSampleSceneRegionSummary();
    const regions = selectSceneObjectRegionsForEnvelope(summary, SAMPLE_ENVELOPE_ID_CONST);
    expect(regions.length).toBeGreaterThanOrEqual(1);
    const region = regions[0];
    const claims = getSampleClaims();
    const nodeId = region.knowledgeNodeId ?? undefined;
    const claimsAvailability = nodeId
      ? selectNodeClaimsAvailability(nodeId, claims).kind
      : null;

    const item = deriveSavedObjectItemFromRegion(region, {
      knowledgeNodeId: nodeId,
      claimsAvailability,
    });
    expect(item.knowledgeNodeId).toBeDefined();

    const { getSampleNodeById } = require("../data/sampleNodes");
    const node = getSampleNodeById(item.knowledgeNodeId!);
    expect(node).not.toBeNull();
    expect(node?.title).toBe("Sony WH-1000XM5");
  });
});
