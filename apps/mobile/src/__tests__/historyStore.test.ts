import {
  initHistoryStore,
  resetHistoryStore,
  addHistoryEntry,
  listHistoryEntries,
  clearHistory,
  serializeEntries,
  parseStoredEntries,
} from "../utils/historyStore";
import type { HistoryEntry } from "../types/history";

function inMemoryStorage(): { store: Map<string, string>; adapter: { getItem: (k: string) => Promise<string | null>; setItem: (k: string, v: string) => Promise<void> } } {
  const store = new Map<string, string>();
  return {
    store,
    adapter: {
      getItem: async (k: string) => store.get(k) ?? null,
      setItem: async (k: string, v: string) => { store.set(k, v); },
    },
  };
}

describe("historyStore", () => {
  beforeEach(async () => {
    const { adapter } = inMemoryStorage();
    await initHistoryStore(adapter);
  });

  afterEach(() => {
    resetHistoryStore();
  });

  describe("addHistoryEntry", () => {
    it("adds an entry and returns newest first", async () => {
      await addHistoryEntry({
        articleId: "art-1",
        title: "First",
        source: "search",
      });
      const list = await listHistoryEntries();
      expect(list).toHaveLength(1);
      expect(list[0].articleId).toBe("art-1");
      expect(list[0].title).toBe("First");
      expect(list[0].source).toBe("search");
      expect(list[0].openedAt).toBeDefined();
      expect(list[0].id).toBeDefined();
    });

    it("dedupes by articleId and moves to top with updated timestamp", async () => {
      await addHistoryEntry({ articleId: "art-1", title: "First", source: "search" });
      await addHistoryEntry({ articleId: "art-2", title: "Second", source: "share" });
      let list = await listHistoryEntries();
      expect(list).toHaveLength(2);
      expect(list[0].articleId).toBe("art-2");

      await addHistoryEntry({ articleId: "art-1", title: "First updated", source: "trace" });
      list = await listHistoryEntries();
      expect(list).toHaveLength(2);
      expect(list[0].articleId).toBe("art-1");
      expect(list[0].title).toBe("First updated");
      expect(list[1].articleId).toBe("art-2");
    });
  });

  describe("listHistoryEntries", () => {
    it("returns entries in newest-first order", async () => {
      await addHistoryEntry({ articleId: "a", title: "A", source: "search" });
      await addHistoryEntry({ articleId: "b", title: "B", source: "share" });
      await addHistoryEntry({ articleId: "c", title: "C", source: "image" });
      const list = await listHistoryEntries();
      expect(list.map((e) => e.articleId)).toEqual(["c", "b", "a"]);
    });

    it("returns a copy so mutating does not affect store", async () => {
      await addHistoryEntry({ articleId: "art-1", title: "T", source: "search" });
      const list = await listHistoryEntries();
      list[0].title = "mutated";
      const again = await listHistoryEntries();
      expect(again[0].title).toBe("T");
    });
  });

  describe("clearHistory", () => {
    it("removes all entries", async () => {
      await addHistoryEntry({ articleId: "art-1", title: "T", source: "search" });
      await clearHistory();
      const list = await listHistoryEntries();
      expect(list).toHaveLength(0);
    });
  });

  describe("persistence", () => {
    it("persists entries across initHistoryStore with same storage", async () => {
      const { store, adapter } = inMemoryStorage();
      await initHistoryStore(adapter);
      await addHistoryEntry({ articleId: "art-1", title: "Persisted", source: "search" });
      const raw = store.get("rabbit-hole-exploration-history");
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].title).toBe("Persisted");

      resetHistoryStore();
      await initHistoryStore(adapter);
      const list = await listHistoryEntries();
      expect(list).toHaveLength(1);
      expect(list[0].articleId).toBe("art-1");
    });
  });

  describe("serializeEntries / parseStoredEntries", () => {
    it("serializes and parses entries round-trip", () => {
      const entries: HistoryEntry[] = [
        {
          id: "id-1",
          articleId: "art-1",
          title: "One",
          subtitle: "Sub",
          source: "search",
          openedAt: new Date().toISOString(),
        },
      ];
      const raw = serializeEntries(entries);
      expect(typeof raw).toBe("string");
      const back = parseStoredEntries(raw);
      expect(back).toHaveLength(1);
      expect(back[0].articleId).toBe("art-1");
      expect(back[0].title).toBe("One");
    });

    it("parseStoredEntries returns [] for null or invalid JSON", () => {
      expect(parseStoredEntries(null)).toEqual([]);
      expect(parseStoredEntries("")).toEqual([]);
      expect(parseStoredEntries("not json")).toEqual([]);
      expect(parseStoredEntries("{}")).toEqual([]);
    });
  });
});
