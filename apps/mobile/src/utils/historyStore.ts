/**
 * Exploration History v1 — local store with optional persistence.
 * Dedupes by articleId (move to top + update timestamp). Cap at MAX_ENTRIES.
 */

import type { HistoryEntry } from "../types/history";

const STORAGE_KEY = "rabbit-hole-exploration-history";
const MAX_ENTRIES = 50;

export interface HistoryStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

function defaultStorage(): HistoryStorage {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AsyncStorage = require("@react-native-async-storage/async-storage").default;
  return AsyncStorage;
}

let memoryCache: HistoryEntry[] = [];
let storage: HistoryStorage | null = null;
let initPromise: Promise<void> | null = null;

function getStorage(): HistoryStorage {
  if (!storage) storage = defaultStorage();
  return storage;
}

async function loadFromStorage(): Promise<HistoryEntry[]> {
  const s = getStorage();
  const raw = await s.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function persist(entries: HistoryEntry[]): Promise<void> {
  await getStorage().setItem(STORAGE_KEY, JSON.stringify(entries));
}

export async function initHistoryStore(s?: HistoryStorage): Promise<void> {
  if (s) storage = s;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    memoryCache = await loadFromStorage();
  })();
  return initPromise;
}

/** For tests: reset in-memory state and optional storage. */
export function resetHistoryStore(s?: HistoryStorage): void {
  memoryCache = [];
  initPromise = null;
  if (s !== undefined) storage = s;
}

/**
 * Add or update a history entry. Same articleId moves to top and updates timestamp/title.
 * Returns the entries array (newest first) after the update.
 */
export async function addHistoryEntry(entry: Omit<HistoryEntry, "id" | "openedAt">): Promise<HistoryEntry[]> {
  await initHistoryStore();
  const now = new Date().toISOString();
  const full: HistoryEntry = {
    ...entry,
    id: entry.articleId + "-" + now,
    openedAt: now,
  };
  const filtered = memoryCache.filter((e) => e.articleId !== entry.articleId);
  memoryCache = [full, ...filtered].slice(0, MAX_ENTRIES);
  await persist(memoryCache);
  return memoryCache;
}

/**
 * List entries newest first. Ensures store is initialized (loads from storage if needed).
 * Returns a shallow copy of entries so mutating items does not affect the store.
 */
export async function listHistoryEntries(): Promise<HistoryEntry[]> {
  await initHistoryStore();
  return memoryCache.map((e) => ({ ...e }));
}

/** Clear all history. Optional for v1. */
export async function clearHistory(): Promise<void> {
  await initHistoryStore();
  memoryCache = [];
  await persist(memoryCache);
}

/** Serialize entries for persistence (used by persist; exposed for tests). */
export function serializeEntries(entries: HistoryEntry[]): string {
  return JSON.stringify(entries);
}

/** Parse stored JSON (exposed for tests). */
export function parseStoredEntries(raw: string | null): HistoryEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
