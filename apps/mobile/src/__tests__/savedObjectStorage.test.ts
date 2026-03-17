/**
 * Rabbit Hole v18 — Saved object storage tests. Mock storage adapter; no AsyncStorage.
 */
import type { SavedObjectItem } from "../types/savedObjects";
import {
  setSavedObjectStorageAdapter,
  loadSavedObjectItems,
  saveSavedObjectItems,
  clearSavedObjectItems,
} from "../utils/savedObjectStorage";
import { normalizeSavedObjectItems } from "../utils/savedObjectSerialization";
import { createSavedObjectItemId } from "../utils/savedObjects";

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

describe("savedObjectStorage", () => {
  beforeEach(() => {
    setSavedObjectStorageAdapter(createMockStorage());
  });

  afterEach(() => {
    setSavedObjectStorageAdapter(null);
  });

  it("loadSavedObjectItems returns [] when empty", async () => {
    const result = await loadSavedObjectItems();
    expect(result).toEqual([]);
  });

  it("saveSavedObjectItems persists correctly", async () => {
    const items = [makeItem()];
    await saveSavedObjectItems(items);
    const loaded = await loadSavedObjectItems();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe(items[0].id);
    expect(loaded[0].label).toBe(items[0].label);
  });

  it("loadSavedObjectItems restores saved items", async () => {
    const a = makeItem({ id: "id-a", label: "A" });
    const b = makeItem({ id: "id-b", label: "B", verificationKind: "recognition_only" });
    await saveSavedObjectItems([a, b]);
    const loaded = await loadSavedObjectItems();
    expect(loaded).toHaveLength(2);
    expect(loaded[0].id).toBe("id-a");
    expect(loaded[1].verificationKind).toBe("recognition_only");
  });

  it("clearSavedObjectItems removes stored data", async () => {
    await saveSavedObjectItems([makeItem()]);
    await clearSavedObjectItems();
    const loaded = await loadSavedObjectItems();
    expect(loaded).toEqual([]);
  });

  it("verificationKind remains unchanged after load", async () => {
    const item = makeItem({ verificationKind: "recognition_only" });
    await saveSavedObjectItems([item]);
    const loaded = await loadSavedObjectItems();
    expect(loaded[0].verificationKind).toBe("recognition_only");
  });
});

describe("normalizeSavedObjectItems (storage integrity)", () => {
  it("filters invalid entries and preserves valid order", () => {
    const valid = makeItem({ id: "valid-1" });
    const result = normalizeSavedObjectItems([
      valid,
      null,
      { bad: true },
      { id: "x", sourceEnvelopeId: "e", sourceRegionId: "r", label: "l", savedAt: "2025-01-01", verificationKind: "recognition_only" },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("valid-1");
    expect(result[1].id).toBe("x");
  });
});
