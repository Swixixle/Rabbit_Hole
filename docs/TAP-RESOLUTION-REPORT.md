# Tap-Resolution Upgrade Report

**Date:** 2025-03-11  
**Scope:** Minimal real tap-resolution system — coordinate-aware, fixture-backed, architecture-safe.

---

## 1. Implementation approach

- **Backend:** Introduced a dedicated **region resolution** layer (`app/region_resolution.py`) that is fixture-backed and deterministic. Regions are defined with normalized bounds (0–1). Tap resolution: point-in-rect for containment; if multiple regions contain the point, return all (ambiguous); if none, use nearest-region heuristic or return a single low-confidence “No good match here” candidate. No ML/vision; easy to swap for real segmentation later.
- **API:** `POST /v1/explore/image` now returns segments from the same region fixture, with optional **bbox** (x, y, width, height in 0–1) for overlays. `POST /v1/explore/image/tap` accepts **tapXNorm** / **tapYNorm** (0–1) and **segmentId** (disambiguation). Response shape unchanged: `candidates`, `articleId`; uncertainty is expressed via confidence and multiple candidates, not fake certainty.
- **Mobile:** Image Focus measures the image container with `onLayout`, converts tap (locationX, locationY) to normalized (xNorm, yNorm), and sends **tapXNorm** / **tapYNorm** to the tap endpoint. Added hint “Tap an object to explore” and clearer no-match copy in the candidate sheet.
- **Contracts:** Optional **bbox** on `ImageSegment`; **tapXNorm** / **tapYNorm** on `ExploreTapRequest`. Backward compatible.

---

## 2. Files created

| File | Purpose |
|------|--------|
| `apps/api/app/region_resolution.py` | Region fixture (DEFAULT_REGIONS), `get_regions_for_image`, `get_regions_with_bounds`, `resolve_tap` (coordinate + segmentId override). |

---

## 3. Files updated

| File | Changes |
|------|--------|
| `apps/api/app/models.py` | `ExploreTapRequestBody`: added `tapXNorm`, `tapYNorm`. `ImageSegment`: added optional `bbox`. |
| `apps/api/app/routes.py` | `explore/image`: segments from region fixture + bbox. `explore/image/tap`: uses `resolve_tap` with tapXNorm/tapYNorm or segmentId; legacy x,y supported. |
| `packages/contracts/src/types.ts` | `ImageSegment`: optional `bbox`. `ExploreTapRequest`: `tapXNorm`, `tapYNorm`. |
| `apps/mobile/src/components/ImageCanvas.tsx` | Layout measurement; normalized tap (xNorm, yNorm) passed to `onTap`. |
| `apps/mobile/src/screens/ImageFocusScreen.tsx` | `handleTap(xNorm, yNorm)`; sends `tapXNorm`, `tapYNorm` to API; “Tap an object to explore” hint; no-match handling for seg-unknown. |
| `apps/mobile/src/components/CandidatePickerSheet.tsx` | Subtitle for single “No good match here” candidate. |
| `apps/mobile/src/api/client.ts` | `exploreTap` body: `tapXNorm`, `tapYNorm`; `exploreImage` response type includes `bbox`. |
| `apps/api/tests/test_routes.py` | segmentId test uses `seg-coffee`; added tests: tap inside coffee region, tap inside uhaul region, tap outside regions, explore/image segments + bbox. |

---

## 4. How tap resolution works now

1. **Inputs:** `uploadId`, and either:
   - **tapXNorm, tapYNorm** (0–1), or  
   - **segmentId** (user chose from sheet), or  
   - legacy **x, y** (normalized if in [0,1], else /1000).
2. **Resolution:**  
   - If `segmentId` is set: resolve that segment only → one candidate + articleId if defined.  
   - Else: find all regions that **contain** (tapXNorm, tapYNorm).  
     - One region → one candidate + articleId.  
     - Two+ regions → multiple candidates, no articleId (picker).  
     - No region → nearest region within distance threshold → one low-confidence candidate, no articleId; else one “No good match here” candidate, no articleId.
3. **Output:** `ExploreTapResponse`: `candidates` (list of ImageSegment), `articleId` (optional). No fake certainty; low confidence and no-match surfaced via confidence and single “No good match here” candidate.

---

## 5. How region fixtures are structured

- **RegionDef** (internal): `segment_id`, `label`, `x`, `y`, `width`, `height` (normalized 0–1), `confidence`, `node_id`, `article_id`.
- **DEFAULT_REGIONS** (v0):
  - **seg-coffee:** left (0.05, 0.2, 0.4, 0.6) → article-coffee, node-coffee-cup.  
  - **seg-uhaul:** right (0.55, 0.2, 0.4, 0.6) → article-uhaul, node-uhaul-box.  
  - **seg-ambiguous:** center strip (0.42, 0.25, 0.16, 0.5) → low confidence, no node/article (disambiguation).
- **seg-unknown:** Not a stored region; returned only when tap is outside all regions and not near any (single low-confidence “No good match here” candidate).

Fixture is a single list; no per-image key yet. Comments in code mark where per-upload or real segmentation can replace this.

---

## 6. How mobile coordinate handling works

- **ImageCanvas:** `onLayout` stores container `width` and `height`. On press, `locationX`/`locationY` are in the same coordinate system. `xNorm = locationX / width`, `yNorm = locationY / height`, clamped to [0, 1]. If layout not yet available, sends (0.5, 0.5).
- **ImageFocusScreen:** Passes `handleTap(xNorm, yNorm)` to ImageCanvas; calls `api.exploreTap({ uploadId, tapXNorm: xNorm, tapYNorm: yNorm })`.
- **Region overlays:** API returns segments with optional `bbox`; mobile types accept it. Overlay drawing can use bbox later; no overlay rendering added in this pass (only hint text and segment list).

---

## 7. Degraded-state behavior confirmed

- **Tap outside all regions:** Returns one low-confidence candidate “No good match here” (segmentId seg-unknown), no articleId; picker shows; selecting it shows “No article here. Try tapping a different object.” (no API call).
- **Ambiguous (multiple regions):** Returns multiple candidates, no articleId; picker lets user choose; then segmentId is sent and resolution is single-segment.
- **Missing segmentId override:** If segmentId is sent but not in fixture, backend returns no_match (empty candidates); client error path handles it.
- **Empty tap body:** Backend uses (0.45, 0.45) → ambiguous region → two candidates, picker.
- No fake certainty; retry path remains “tap again” or “choose another option”.

---

## 8. Tests added

- **test_explore_tap_returns_candidates:** segmentId `seg-coffee` → articleId `article-coffee`.
- **test_explore_tap_inside_region_coffee:** tapXNorm=0.2, tapYNorm=0.5 → coffee candidate + article-coffee.
- **test_explore_tap_inside_region_uhaul:** tapXNorm=0.75, tapYNorm=0.5 → uhaul candidate + article-uhaul.
- **test_explore_tap_outside_regions_low_confidence_or_no_match:** tap (0.9, 0.9) → no articleId; candidates include low-confidence or “No good match here”.
- **test_explore_image_segments_have_region_model_and_optional_bbox:** Segments include seg-coffee, seg-uhaul; at least one segment has bbox with x, y, width, height.

All 15 API tests pass.

---

## 9. Remaining weakest stub after this pass

- **Article generation / assembly:** Content is still fixture blocks; no dynamic assembly from claims/sources.
- **Verify evidence richness:** Claim–source–evidence relationships are present but minimal; not yet “concrete” or rich.
- **Image-region UX:** Segments have bbox but the mobile app does not yet draw region overlays on the image; only the hint and candidate sheet.

Among these, **verify evidence richness** is the most impactful next step for credibility (sources and evidence feel more real). Then article assembly, then experience layer (rabbit drop, sound, transition).

---

## 10. Next best upgrade recommendation

**Recommendation: verify evidence richness.**

- Make claim/source/evidence relationships more concrete (excerpts, spans, clearer verification flow).
- Then: article generation quality (dynamic assembly from structured blocks).
- Then: experience layer (rabbit drop, sound, transition).

This order keeps the product intellectually credible before adding theatrical polish.

---

## Summary

Tap resolution is now **coordinate-aware and fixture-backed**: tap position (normalized 0–1) maps to regions, different taps yield different candidates/articles, and out-of-region or ambiguous taps produce low-confidence or no-match behavior without fake certainty. The implementation is isolated, contract-safe, and ready to be replaced by a real segmentation/resolution layer later.
