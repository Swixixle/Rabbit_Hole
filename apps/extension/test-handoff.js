/**
 * Tests for handoff URL building and parsing (pure logic).
 */
const { buildHandoffUrl, parseHandoffUrl, chooseHandoffText } = require("./handoff.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// buildHandoffUrl
const url1 = buildHandoffUrl("https://example.com/page");
assert(url1 === "rabbit-hole://share?text=" + encodeURIComponent("https://example.com/page"), "buildHandoffUrl encodes URL");

const url2 = buildHandoffUrl("  selected text here  ");
assert(url2 !== null && url2.includes(encodeURIComponent("selected text here")), "buildHandoffUrl trims and encodes");

assert(buildHandoffUrl("") === null, "buildHandoffUrl returns null for empty string");
assert(buildHandoffUrl(null) === null, "buildHandoffUrl returns null for null");
assert(buildHandoffUrl("   ") === null, "buildHandoffUrl returns null for whitespace only");

// chooseHandoffText: selection wins when meaningful
assert(chooseHandoffText("selected", "https://a.com", "Title") === "selected", "chooseHandoffText prefers selection");
assert(chooseHandoffText("  x  ", "https://a.com", "Title") === "x", "chooseHandoffText trims selection");
assert(chooseHandoffText("", "https://a.com", "Title") === "https://a.com", "chooseHandoffText fallback to URL when selection empty");
assert(chooseHandoffText(null, "https://a.com", "Title") === "https://a.com", "chooseHandoffText fallback to URL when selection null");
assert(chooseHandoffText("", "", "Title") === "Title", "chooseHandoffText fallback to title when no URL");
assert(chooseHandoffText("", "", "") === "", "chooseHandoffText empty when all empty");
assert(chooseHandoffText("  ", "https://a.com", "Title") === "https://a.com", "chooseHandoffText whitespace-only selection falls back to URL");

// Handoff payload for selected text: buildHandoffUrl(selected) round-trip
const selected = "What is a disposable coffee cup?";
const handoffUrl = buildHandoffUrl(selected);
assert(handoffUrl !== null && handoffUrl.indexOf(encodeURIComponent(selected)) !== -1, "buildHandoffUrl builds for selected text");
assert(parseHandoffUrl(handoffUrl) === selected, "parseHandoffUrl round-trip for selected text");

// parseHandoffUrl
const parsed = parseHandoffUrl("rabbit-hole://share?text=" + encodeURIComponent("https://example.com"));
assert(parsed === "https://example.com", "parseHandoffUrl decodes text");

assert(parseHandoffUrl("rabbit-hole://share?text=hello") === "hello", "parseHandoffUrl simple");

assert(parseHandoffUrl("other://share?text=x") === null, "parseHandoffUrl wrong scheme returns null");
assert(parseHandoffUrl("rabbit-hole://other?text=x") === null, "parseHandoffUrl wrong host returns null");
assert(parseHandoffUrl("") === null, "parseHandoffUrl empty returns null");
assert(parseHandoffUrl(null) === null, "parseHandoffUrl null returns null");

// Round-trip
const original = "https://example.com/page?q=1";
const built = buildHandoffUrl(original);
const back = parseHandoffUrl(built);
assert(back === original, "round-trip preserves text");

console.log("All handoff tests passed.");
