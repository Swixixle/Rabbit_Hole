/**
 * Rabbit Hole Core Groundwork v12 — Saved object selectors and list utilities.
 */
import type { SavedObjectItem } from "../types/savedObjects";

export function selectSavedObjectById(
  id: string,
  items: SavedObjectItem[]
): SavedObjectItem | null {
  return items.find((item) => item.id === id) ?? null;
}

export function selectSavedObjectsForEnvelope(
  envelopeId: string,
  items: SavedObjectItem[]
): SavedObjectItem[] {
  return items.filter((item) => item.sourceEnvelopeId === envelopeId);
}

/**
 * Newest first by savedAt; then id for stability.
 */
export function selectSavedObjectsOrdered(
  items: SavedObjectItem[]
): SavedObjectItem[] {
  return [...items].sort((a, b) => {
    const tA = new Date(a.savedAt).getTime();
    const tB = new Date(b.savedAt).getTime();
    if (tB !== tA) return tB - tA;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Dedupe by item.id; newest item wins when same id. Returns new array.
 */
export function upsertSavedObjectItem(
  item: SavedObjectItem,
  items: SavedObjectItem[]
): SavedObjectItem[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  byId.set(item.id, item);
  return selectSavedObjectsOrdered(Array.from(byId.values()));
}
