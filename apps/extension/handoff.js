/**
 * Browser Extension Lens v1: build handoff URL for Rabbit Hole.
 * Single source of truth for the scheme and query param; no duplicate logic.
 */

const SCHEME = "rabbit-hole";
const HOST = "share";
const PARAM_TEXT = "text";

/**
 * Builds the Rabbit Hole handoff URL for the given text (e.g. page URL or selection).
 * The app will receive this as sharedText and run it through Share Intake.
 */
function buildHandoffUrl(text) {
  if (text == null || String(text).trim() === "") return null;
  const encoded = encodeURIComponent(String(text).trim());
  return `${SCHEME}://${HOST}?${PARAM_TEXT}=${encoded}`;
}

/**
 * Chooses the handoff text: selected text if meaningful, otherwise tab URL, then tab title.
 * Used by the popup to decide what to send to Rabbit Hole.
 * @param {string|null|undefined} selection - From window.getSelection().toString().trim()
 * @param {string|null|undefined} url - Tab URL
 * @param {string|null|undefined} title - Tab title
 * @returns {string} Text to send (may be empty string)
 */
function chooseHandoffText(selection, url, title) {
  const s = selection != null ? String(selection).trim() : "";
  if (s.length > 0) return s;
  const u = url != null ? String(url).trim() : "";
  if (u.length > 0) return u;
  const t = title != null ? String(title).trim() : "";
  return t;
}

/**
 * Parses an incoming Rabbit Hole URL and returns sharedText if valid.
 * Used by the mobile app to handle deep links.
 */
function parseHandoffUrl(url) {
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
  } catch (_) {
    return null;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { buildHandoffUrl, parseHandoffUrl, chooseHandoffText };
} else {
  window.buildHandoffUrl = buildHandoffUrl;
  window.parseHandoffUrl = parseHandoffUrl;
  window.chooseHandoffText = chooseHandoffText;
}
