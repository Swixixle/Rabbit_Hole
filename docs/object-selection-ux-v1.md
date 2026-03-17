# Object Selection UX v1

Before lookup, a tapped object enters a **selected** state instead of immediately opening. The user gets clear visual confirmation and then explicitly confirms lookup.

## Behavior

- **First tap** on a tappable region → **select** that object (highlight, slight enlarge). No API call yet.
- **Second action** → confirm lookup: user taps the **Look up** button. Then existing lookup runs (exploreTap by segmentId → open article or candidate picker).
- **Tap outside** the selected object → **clear** selection.
- Tapping inside the selected region again does nothing until they tap "Look up" or tap outside.

## Visual treatment

- **Selected state:** White border around the segment, slightly enlarged (inset so the box is a bit larger than the segment bbox). Calm and intentional; no animation.
- **Look up:** Primary button below the image when something is selected.
- No dimming of the rest of the image in v1 (kept minimal).

## Implementation

- **Hit-test:** Client-side point-in-bbox using segment bboxes from `explore/image` (normalized 0–1). See `utils/segmentHitTest.ts`: `getSegmentIdAtPoint`, `isPointInSegment`.
- **State:** `ImageFocusScreen` holds `selectedSegmentId`. `ImageCanvas` receives `selectedSegmentId` and draws the selection overlay.
- **Lookup:** On "Look up", `api.exploreTap({ uploadId, segmentId: selectedSegmentId })` is called; then the same logic as before (single article → open, multiple → picker).
- Existing lookup logic (exploreTap, CandidatePickerSheet, onSelectArticle) is unchanged; only the **pre-lookup** interaction (tap → select, then confirm) is new.

## Future path

- **Drag-to–Rabbit Hole:** A future gesture (e.g. drag the selected object toward a target zone) could trigger lookup using the same selected-state model. Selection state and segmentId are the integration point.

## Out of scope (v1)

- Animation, drag gesture, or other interaction changes.
- Changes to article contract, epistemic model, or search/lookup API.
