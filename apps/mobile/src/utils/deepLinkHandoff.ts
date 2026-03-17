/**
 * Browser Extension Lens v1: parse incoming rabbit-hole://share deep link.
 * Matches the URL format produced by the extension (see docs/browser-extension-lens-v1.md).
 */

const SCHEME = "rabbit-hole";
const HOST = "share";
const PARAM_TEXT = "text";

/**
 * Parses an incoming Rabbit Hole handoff URL and returns sharedText if valid.
 * Used when the app is opened via the browser extension "Open in Rabbit Hole".
 */
export function parseHandoffUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith(`${SCHEME}://`)) return null;
  try {
    const withoutScheme = trimmed.slice((SCHEME + "://").length);
    const [pathPart, queryPart] = withoutScheme.split("?");
    if (pathPart !== HOST || !queryPart) return null;
    const params = new URLSearchParams(queryPart);
    const text = params.get(PARAM_TEXT);
    return text != null ? decodeURIComponent(text) : null;
  } catch {
    return null;
  }
}
