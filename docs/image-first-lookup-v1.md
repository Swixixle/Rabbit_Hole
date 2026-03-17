# Image-First Lookup Improvements v1

Improves the image/object lookup flow so the lens interaction feels more confident, discoverable, and useful without adding clutter or changing the overall product structure.

## Purpose

- Strengthen the core "lens" feeling: tap an object → see what you selected → confirm lookup → get an article or pick from candidates.
- Build on Object Selection UX v1: first tap selects, selected object highlights/enlarges, explicit "Look up" confirms.
- No new surface, no floating toolbar, no immediate lookup on first tap.

## What changed in the selection/lookup flow

- **No-hit feedback:** When the user taps and no segment is hit (but the image has segments), a calm one-line hint appears: "No object here — try tapping something in the scene." It clears on the next tap (whether they hit an object or tap outside).
- **Empty image:** When no segments are detected for the image, the main hint is "No objects detected. Try another photo."
- **Selected state:** When a segment is selected, the main hint is "Tap outside to deselect, or look up in Rabbit Hole." If the segment has a label (from API), "Selected: {label}" is shown above the Look up button.
- **Loading between confirm and result:** After the user taps "Look up", a loading state ("Looking up…" with spinner) is shown instead of the button. The selection highlight remains until the result is back; then the app either navigates to the article or opens the candidate picker. No silent wait.
- **Candidate picker copy:** When there are multiple candidates, the sheet title is "Pick what you meant" and the subtitle is "We found more than one match. Choose one to explore." so the multi-match case feels intentional, not like an error. Single "no article here" case keeps the previous copy.

## Selected state behavior

- First tap on a segment: segment highlights (white border, slightly enlarged bbox), hint updates, "Look up" button and optional "Selected: {label}" appear.
- Tap outside selected segment: selection clears, hint returns to "Tap an object to explore."
- Tap "Look up": button is replaced by "Looking up…" and spinner; selection stays visible until the request completes.

## No-hit behavior

- Tap on empty space (with segments loaded): hint "No object here — try tapping something in the scene." appears below the main hint. Any subsequent tap (hit or miss) clears it.

## Loading / candidate handling

- **Loading:** Only between "Look up" and the exploreTap response. No full-screen loader; inline "Looking up…" under the canvas.
- **Single article:** Navigate directly to Article screen.
- **Multiple candidates:** Picker sheet with intentional copy ("Pick what you meant", "We found more than one match. Choose one to explore.").
- **Single unknown:** Picker still shown with "No article here. Try tapping a different object or cancel."

## What is still intentionally simple

- No drag-to-Rabbit-Hole gesture.
- No confidence badge on the image (only in picker when multiple).
- No animated transition from selection to article.
- No near-miss "Did you mean X?" when tap is close to a segment.
- Segment hints (pills) on the canvas remain minimal; no extra labels on the image beyond the selection highlight.
- Overlapping segments: first matching segment still wins (existing hit-test behavior).

## Manual validation checklist

- [ ] Upload image → segments load → hint says "Tap an object to explore."
- [ ] Tap on empty area → no-hit hint appears; tap again (anywhere) → no-hit hint clears.
- [ ] Tap on object → selection highlight appears, hint says "Tap outside to deselect, or look up in Rabbit Hole.", "Selected: …" (if label exists) and "Look up" appear.
- [ ] Tap "Look up" → "Looking up…" and spinner show; then either article opens or picker opens.
- [ ] Picker with multiple candidates shows "Pick what you meant" and "We found more than one match."
- [ ] Image with no segments shows "No objects detected. Try another photo."

## Future path

- **Drag-to-Rabbit-Hole gesture:** Drag selected object to a drop zone to trigger lookup (optional alternative to "Look up" button).
- **Richer segment labels:** Show labels on the image for each segment (e.g. small chips) when not selected, or on hover/focus.
- **Object confidence display:** Show confidence on the selection (e.g. "High confidence" / "Low confidence") when data is available.
- **Animated lookup transitions:** Short animation from selection to article or picker (e.g. expand card, fade).
- **Near-miss suggestion:** If tap misses all segments but one segment is close, optionally show "Did you mean X?" with a single suggestion.

## Files touched

- `apps/mobile/src/screens/ImageFocusScreen.tsx`: no-hit hint state and copy, empty-image hint, selected-segment label, lookup loading state.
- `apps/mobile/src/components/CandidatePickerSheet.tsx`: title/subtitle when multiple candidates vs single unknown.
