# Rabbit Hole — v0 Failure Modes and Fallbacks

Rabbit Hole must degrade gracefully. This doc defines user-facing and system behavior for each failure mode; we expose uncertainty instead of pretending confidence.

---

## Image segmentation weak

| Aspect | Behavior |
|--------|----------|
| **User-facing** | Show image with generic "Tap something to explore" or fewer/no hotspots. Allow tap anywhere; backend resolves from coordinates. |
| **System** | Return empty or low-confidence segments; do not invent regions. Prefer tap-only flow if segmentation fails. |
| **Fallback** | Accept raw tap (x, y); POST /v1/explore/image/tap with coords. |
| **Do not** | Fake segment boxes or labels. |
| **Uncertainty** | If no segments, message: "Tap an object in the photo to explore." |

---

## Tap confidence low

| Aspect | Behavior |
|--------|----------|
| **User-facing** | Show confidence in CandidatePickerSheet (e.g. "Low confidence"); offer "Explore anyway" or "Try another area". |
| **System** | Return candidates with confidence scores; do not hide low confidence. |
| **Fallback** | User can still choose a candidate; article may be thinner. |
| **Do not** | Present low-confidence result as high confidence; do not suppress result. |
| **Uncertainty** | Badge or text: "Low confidence" and optional "Explore anyway". |

---

## Multiple candidates plausible

| Aspect | Behavior |
|--------|----------|
| **User-facing** | Bottom sheet with list of options (name + confidence); user picks one → "Explore this". |
| **System** | Return all plausible candidates; do not auto-pick unless one is clearly dominant. |
| **Fallback** | Disambiguation is the path; no fake single answer. |
| **Do not** | Pick one at random without user choice. |
| **Uncertainty** | "We found a few possibilities — pick one to explore." |

---

## No candidate plausible

| Aspect | Behavior |
|--------|----------|
| **User-facing** | Empty state: "We couldn't identify anything there. Try a different area or photo." Retry or new tap. |
| **System** | Return empty candidates or 422; do not invent a node. |
| **Fallback** | Allow user to tap again or upload new image. |
| **Do not** | Show a generic or fake article. |
| **Uncertainty** | Clear message that no match was found. |

---

## Article generation thin

| Aspect | Behavior |
|--------|----------|
| **User-facing** | Show what exists: fewer blocks, maybe only "What this is". Optional line: "We have limited information on this." |
| **System** | Return partial article; blocks array may have one or two items. |
| **Fallback** | Still show sources and trace if available; questions can be generic. |
| **Do not** | Pad with fake or speculative content; do not mark interpretation as verified_fact. |
| **Uncertainty** | Short article is acceptable; claim types must still be correct. |

---

## Source support sparse

| Aspect | Behavior |
|--------|----------|
| **User-facing** | Sources sheet shows list (may be short); "No sources" if empty. Do not hide the button. |
| **System** | Return empty or short source list; verification endpoint still returns 200. |
| **Fallback** | Empty state in sheet: "No sources linked yet." |
| **Do not** | Invent or placeholder sources. |
| **Uncertainty** | "Few sources" or "No sources" is visible; no trust theater. |

---

## No trace available

| Aspect | Behavior |
|--------|----------|
| **User-facing** | Trace Preview shows empty state: "No trace data for this yet." or "Trace not available for this node." |
| **System** | Return empty list or 404; do not fake a trace path. |
| **Fallback** | User still has article, sources, questions. |
| **Do not** | Invent trace rows. |
| **Uncertainty** | Explicit empty state; trace is optional per node. |

---

## Verification data incomplete

| Aspect | Behavior |
|--------|----------|
| **User-facing** | Show what exists: sources without hash/timestamp when not preserved; claim modal shows "Source count: 0" or N. No fake badges. |
| **System** | Omit hash/timestamp when not stored; do not send placeholder hashes. |
| **Fallback** | Source list and claim types still real; missing fields are absent, not faked. |
| **Do not** | Show "Snapshot preserved" when it is not; do not invent hashes. |
| **Uncertainty** | Hash badge only when contentHash present; timestamp only when retrievedAt present. |

---

## Async processing still running

| Aspect | Behavior |
|--------|----------|
| **User-facing** | Loading state with message (e.g. "Building your article…"); poll or wait. Option to cancel and return to image. |
| **System** | Job status returned (pending/running); resultId when completed. |
| **Fallback** | Timeout after N seconds; show "Taking longer than usual. Try again or try a different photo." |
| **Do not** | Leave user with no feedback; do not pretend result is ready. |
| **Uncertainty** | Progress or "still working" message. |

---

## Network fails

| Aspect | Behavior |
|--------|----------|
| **User-facing** | ErrorStateBlock: "Something went wrong. Check your connection and try again." Retry button. |
| **System** | Client handles errors; no silent failure. |
| **Fallback** | Retry same request; optionally cache last successful state. |
| **Do not** | Show stale data as if it were fresh without indication. |
| **Uncertainty** | Clear error; retry available. |

---

## Uploaded media invalid

| Aspect | Behavior |
|--------|----------|
| **User-facing** | Error: "This file couldn't be used. Try a different photo or format." (size, type, or corrupt). |
| **System** | 400 with clear reason; do not process invalid input. |
| **Fallback** | User picks another file or takes new photo. |
| **Do not** | Process and then fail later with vague error. |
| **Uncertainty** | Validation errors are explicit. |

---

## Principle

**Expose uncertainty; do not bluff.** Every fallback keeps the architecture honest: claims typed, sources real or absent, trace present or explicitly empty. No decorative trust or fake confidence.
