/**
 * Rabbit Hole v13 — Saved object persistence and serialization tests.
 */
import type { SavedObjectItem } from "../types/savedObjects";
import {
  isSavedObjectItem,
  normalizeSavedObjectItems,
} from "../utils/savedObjectSerialization";
import {
  SAVED_OBJECTS_STORAGE_KEY,
  setSavedObjectStorage,
  loadSavedObjectItems,
  saveSavedObjectItems,
  clearSavedObjectItems,
} from "../utils/savedObjectPersistence";
import { createSavedObjectItemId } from "../utils/savedObjects";
import { resolveKnowledgeNodeForSavedObject } from "../utils/savedObjectResolution";

function makeItem(overrides: Partial<SavedObjectItem> = {}): SavedObjectItem {
  return {
    id: createSavedObjectItemId("env-1", "region-1"),
    sourceEnvelopeId: "env-1",
    sourceRegionId: "region-1",
    label: "Sony WH-1000XM5",
    savedAt: "2025-01-01T00:00:00Z",
    verificationKind: "evidenced",
    ...overrides,
  };
}

function createMockStorage(): {
  store: Map<string, string>;
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
} {
  const store = new Map<string, string>();
  return {
    store,
    getItem: (key: string) => Promise.resolve(store.get(key) ?? null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      store.delete(key);
      return Promise.resolve();
    },
  };
}

describe("saved object serialization", () => {
  describe("isSavedObjectItem", () => {
    it("accepts valid item with required fields only", () => {
      const item = makeItem();
      expect(isSavedObjectItem(item)).toBe(true);
    });

    it("accepts item with optional pipeline ids", () => {
      const item = makeItem({
        recognitionCandidateId: "cand-1",
        identifiedEntityId: "ent-1",
        knowledgeNodeId: "node-1",
      });
      expect(isSavedObjectItem(item)).toBe(true);
    });

    it("rejects non-object", () => {
      expect(isSavedObjectItem(null)).toBe(false);
      expect(isSavedObjectItem(42)).toBe(false);
      expect(isSavedObjectItem("x")).toBe(false);
    });

    it("rejects missing required string fields", () => {
      expect(isSavedObjectItem({})).toBe(false);
      expect(isSavedObjectItem({ id: "x", sourceEnvelopeId: "e", sourceRegionId: "r", label: "l", savedAt: "2025-01-01", verificationKind: "unverified" })).toBe(true);
      expect(isSavedObjectItem({ id: "x", sourceEnvelopeId: "e", sourceRegionId: "r", label: "l", savedAt: "2025-01-01" })).toBe(false);
    });

    it("rejects invalid verificationKind", () => {
      expect(
        isSavedObjectItem({
          id: "x",
          sourceEnvelopeId: "e",
          sourceRegionId: "r",
          label: "l",
          savedAt: "2025-01-01",
          verificationKind: "invalid",
        })
      ).toBe(false);
    });
  });

  describe("normalizeSavedObjectItems", () => {
    it("keeps valid items and preserves order", () => {
      const a = makeItem({ id: "id-a" });
      const b = makeItem({ id: "id-b", sourceRegionId: "region-2" });
      const result = normalizeSavedObjectItems([a, b]);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("id-a");
      expect(result[1].id).toBe("id-b");
    });

    it("returns [] for non-array", () => {
      expect(normalizeSavedObjectItems(null)).toEqual([]);
      expect(normalizeSavedObjectItems({})).toEqual([]);
      expect(normalizeSavedObjectItems("x")).toEqual([]);
    });

    it("discards invalid entries and keeps valid ones", () => {
      const valid = makeItem();
      const result = normalizeSavedObjectItems([
        valid,
        null,
        { bad: true },
        { id: "x", sourceEnvelopeId: "e", sourceRegionId: "r", label: "l", savedAt: "2025-01-01", verificationKind: "recognition_only" },
      ]);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(valid.id);
      expect(result[1].id).toBe("x");
    });
  });
});

describe("saved object persistence", () => {
  beforeEach(() => {
    setSavedObjectStorage(createMockStorage());
  });

  afterEach(() => {
    setSavedObjectStorage(null);
  });

  it("loadSavedObjectItems returns [] for missing storage", async () => {
    const result = await loadSavedObjectItems();
    expect(result).toEqual([]);
  });

  it("loadSavedObjectItems returns [] for malformed JSON", async () => {
    const mock = createMockStorage();
    await mock.setItem(SAVED_OBJECTS_STORAGE_KEY, "not json");
    setSavedObjectStorage(mock);
    const result = await loadSavedObjectItems();
    expect(result).toEqual([]);
  });

  it("saveSavedObjectItems persists canonical array", async () => {
    const items = [makeItem()];
    await saveSavedObjectItems(items);
    const loaded = await loadSavedObjectItems();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe(items[0].id);
    expect(loaded[0].verificationKind).toBe(items[0].verificationKind);
  });

  it("clearSavedObjectItems empties storage", async () => {
    await saveSavedObjectItems([makeItem()]);
    await clearSavedObjectItems();
    const loaded = await loadSavedObjectItems();
    expect(loaded).toEqual([]);
  });

  it("verificationKind is preserved exactly across save/load (no recompute)", async () => {
    const item = makeItem({ verificationKind: "recognition_only" });
    await saveSavedObjectItems([item]);
    const loaded = await loadSavedObjectItems();
    expect(loaded[0].verificationKind).toBe("recognition_only");
  });

  it("persisted SavedObjectItem can be reloaded and still resolve Sony node", async () => {
    const { getSampleSceneRegionSummary } = require("../data/sampleScene");
    const { getSampleRecognitionCandidates, getSampleIdentifiedEntities } = require("../data/sampleRecognition");
    const { getSampleNodes } = require("../data/sampleNodes");
    const { SAMPLE_ENVELOPE_ID_CONST } = require("../data/sampleNodes");
    const { selectSceneObjectRegionsForEnvelope } = require("../utils/sceneRegionSelectors");
    const { getSampleClaims } = require("../data/sampleClaims");
    const { selectNodeClaimsAvailability } = require("../utils/evidenceAvailabilitySelectors");
    const { deriveSavedObjectItemFromRegion } = require("../utils/savedObjects");

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

    await saveSavedObjectItems([item]);
    const loaded = await loadSavedObjectItems();
    expect(loaded).toHaveLength(1);

    const nodes = getSampleNodes();
    const node = resolveKnowledgeNodeForSavedObject(loaded[0], nodes);
    expect(node).not.toBeNull();
    expect(node?.title).toBe("Sony WH-1000XM5");
  });
});
