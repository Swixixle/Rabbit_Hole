/**
 * Native Share Entry v1: normalize shared text/URL for intake and search.
 * Keeps logic modular so OS share extension can call the same intake flow.
 */

/**
 * Normalizes raw shared input: trim and collapse internal whitespace.
 * Preserves the string (e.g. URL) for display; no URL parsing in v1.
 */
export function normalizeSharedInput(input: string): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ");
}

/**
 * Returns true if the input looks like a single media-capable URL (http/https, no newlines).
 * Used to try media resolve before search.
 */
export function isLikelyMediaUrl(input: string): boolean {
  if (typeof input !== "string") return false;
  if (input.includes("\n")) return false;
  const t = normalizeSharedInput(input);
  if (!t) return false;
  if (t.length > 2000) return false;
  return t.startsWith("http://") || t.startsWith("https://");
}

/**
 * Returns the string to send to search. In v1 this is the normalized input.
 * Later could extract path/query from URLs for better matching.
 */
export function maybeExtractSearchString(input: string): string {
  return normalizeSharedInput(input);
}
