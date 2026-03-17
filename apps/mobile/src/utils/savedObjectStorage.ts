/**
 * Rabbit Hole v18 — Durable local storage for saved object tray.
 * AsyncStorage-backed; references only. Isolated so backend sync can replace later.
 */
import type { SavedObjectItem } from "../types/savedObjects";
import { normalizeSavedObjectItems } from "./savedObjectSerialization";

export const STORAGE_KEY = "rabbit-hole:savedObjects:v1";

export interface SavedObjectStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

function getDefaultStorage(): SavedObjectStorageAdapter {
  const AsyncStorage = require("@react-native-async-storage/async-storage").default;
  return AsyncStorage;
}

let adapter: SavedObjectStorageAdapter | null = null;

export function setSavedObjectStorageAdapter(a: SavedObjectStorageAdapter | null): void {
  adapter = a;
}

function getStorage(): SavedObjectStorageAdapter {
  if (!adapter) adapter = getDefaultStorage();
  return adapter;
}

/**
 * Load saved tray items. Returns [] on missing, corrupted, or error.
 */
export async function loadSavedObjectItems(): Promise<SavedObjectItem[]> {
  try {
    const raw = await getStorage().getItem(STORAGE_KEY);
    if (raw == null || raw === "") return [];
    const parsed = JSON.parse(raw) as unknown;
    return normalizeSavedObjectItems(parsed);
  } catch {
    return [];
  }
}

/**
 * Persist tray items. References only; no image data.
 */
export async function saveSavedObjectItems(items: SavedObjectItem[]): Promise<void> {
  try {
    await getStorage().setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Fail quietly; do not throw into UI
  }
}

/**
 * Clear persisted tray.
 */
export async function clearSavedObjectItems(): Promise<void> {
  try {
    await getStorage().removeItem(STORAGE_KEY);
  } catch {
    // Fail quietly
  }
}
