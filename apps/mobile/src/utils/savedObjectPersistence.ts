/**
 * Rabbit Hole v13/v18 — Local persistence for saved object tray.
 * Device-only; no sync. Delegates to savedObjectStorage for durable AsyncStorage-backed persistence.
 */
import type { SavedObjectItem } from "../types/savedObjects";
import {
  loadSavedObjectItems as loadFromStorage,
  saveSavedObjectItems as saveToStorage,
  clearSavedObjectItems as clearStorage,
  setSavedObjectStorageAdapter,
  type SavedObjectStorageAdapter,
} from "./savedObjectStorage";

/** @deprecated Use STORAGE_KEY from savedObjectStorage. Kept for test compatibility. */
export const SAVED_OBJECTS_STORAGE_KEY = "rabbit-hole:savedObjects:v1";

/** Adapter type for tests. Use setSavedObjectStorage to inject mock. */
export type SavedObjectStorage = SavedObjectStorageAdapter;

export function setSavedObjectStorage(s: SavedObjectStorage | null): void {
  setSavedObjectStorageAdapter(s);
}

export async function loadSavedObjectItems(): Promise<SavedObjectItem[]> {
  return loadFromStorage();
}

export async function saveSavedObjectItems(items: SavedObjectItem[]): Promise<void> {
  return saveToStorage(items);
}

export async function clearSavedObjectItems(): Promise<void> {
  return clearStorage();
}
