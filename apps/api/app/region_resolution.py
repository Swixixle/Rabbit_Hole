"""
Coordinate-aware tap resolution for v0. Fixture-backed regions; replaceable by real segmentation later.
All coordinates are normalized 0-1 (fraction of image/view width and height).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from app.models import ConfidenceLevel, ImageSegment


@dataclass
class RegionDef:
    """One tappable region. Bounds in normalized 0-1 (x, y, width, height)."""
    segment_id: str
    label: str
    x: float
    y: float
    width: float
    height: float
    confidence: ConfidenceLevel
    node_id: Optional[str] = None
    article_id: Optional[str] = None


# Default fixture regions for any image (replace with per-image or real segmentation later).
# Bounds: x, y, width, height in [0, 1]. Left = coffee, right = uhaul, overlap zone = ambiguous.
DEFAULT_REGIONS: list[RegionDef] = [
    RegionDef(
        segment_id="seg-coffee",
        label="Coffee cup",
        x=0.05,
        y=0.2,
        width=0.4,
        height=0.6,
        confidence=ConfidenceLevel.high,
        node_id="node-coffee-cup",
        article_id="article-coffee",
    ),
    RegionDef(
        segment_id="seg-uhaul",
        label="U-Haul box",
        x=0.55,
        y=0.2,
        width=0.4,
        height=0.6,
        confidence=ConfidenceLevel.high,
        node_id="node-uhaul-box",
        article_id="article-uhaul",
    ),
    # Ambiguous strip in the middle: tap here can match either
    RegionDef(
        segment_id="seg-ambiguous",
        label="Possible object",
        x=0.42,
        y=0.25,
        width=0.16,
        height=0.5,
        confidence=ConfidenceLevel.low,
        node_id=None,
        article_id=None,
    ),
]

# Ecological Identification Groundwork v1: fixture regions for natural objects (use when upload_id == "eco").
ECOLOGICAL_REGIONS: list[RegionDef] = [
    RegionDef(
        segment_id="seg-poison-ivy",
        label="Poison ivy",
        x=0.1,
        y=0.2,
        width=0.35,
        height=0.5,
        confidence=ConfidenceLevel.high,
        node_id="node-poison-ivy",
        article_id="article-poison-ivy",
    ),
    RegionDef(
        segment_id="seg-tick",
        label="Tick",
        x=0.5,
        y=0.3,
        width=0.2,
        height=0.3,
        confidence=ConfidenceLevel.high,
        node_id=None,
        article_id=None,
    ),
    RegionDef(
        segment_id="seg-oak",
        label="Oak tree",
        x=0.1,
        y=0.6,
        width=0.4,
        height=0.35,
        confidence=ConfidenceLevel.high,
        node_id="node-oak",
        article_id=None,
    ),
    RegionDef(
        segment_id="seg-bee",
        label="Honey bee",
        x=0.55,
        y=0.2,
        width=0.25,
        height=0.35,
        confidence=ConfidenceLevel.high,
        node_id=None,
        article_id=None,
    ),
    RegionDef(
        segment_id="seg-mushroom",
        label="Mushroom",
        x=0.6,
        y=0.6,
        width=0.3,
        height=0.35,
        confidence=ConfidenceLevel.medium,
        node_id=None,
        article_id=None,
    ),
]


def _regions_for_image(upload_id: str) -> list[RegionDef]:
    """Return region set for this image. 'eco' / 'eco-demo' → ecological fixtures; else default."""
    if upload_id in ("eco", "eco-demo"):
        return ECOLOGICAL_REGIONS
    return DEFAULT_REGIONS


def _contains(r: RegionDef, x_norm: float, y_norm: float) -> bool:
    return (
        r.x <= x_norm <= r.x + r.width
        and r.y <= y_norm <= r.y + r.height
    )


def _distance_to_region(r: RegionDef, x_norm: float, y_norm: float) -> float:
    """Squared distance from point to nearest edge of rect (0 if inside)."""
    cx = r.x + r.width / 2
    cy = r.y + r.height / 2
    dx = max(0, abs(x_norm - cx) - r.width / 2)
    dy = max(0, abs(y_norm - cy) - r.height / 2)
    return dx * dx + dy * dy


def get_regions_for_image(upload_id: str) -> list[ImageSegment]:
    """
    Return segments (with optional bbox) for the image. Same region set used by tap resolution.
    For upload_id 'eco' or 'eco-demo' returns ecological fixture regions; else default.
    """
    regions = _regions_for_image(upload_id)
    out: list[ImageSegment] = []
    for r in regions:
        seg = ImageSegment(
            segmentId=r.segment_id,
            label=r.label,
            confidence=r.confidence,
            nodeId=r.node_id,
        )
        out.append(seg)
    return out


def get_regions_with_bounds(upload_id: str) -> list[dict]:
    """
    Return regions with normalized bounds for UI overlay. Same ids as get_regions_for_image.
    """
    regions = _regions_for_image(upload_id)
    return [
        {
            "segmentId": r.segment_id,
            "label": r.label,
            "confidence": r.confidence.value,
            "nodeId": r.node_id,
            "bbox": {"x": r.x, "y": r.y, "width": r.width, "height": r.height},
        }
        for r in regions
    ]


@dataclass
class TapResolutionResult:
    candidates: list[ImageSegment]
    article_id: Optional[str] = None
    no_match: bool = False


def resolve_tap(
    upload_id: str,
    tap_x_norm: float,
    tap_y_norm: float,
    *,
    segment_id_override: Optional[str] = None,
) -> TapResolutionResult:
    """
    Resolve tap (normalized 0-1) to candidate(s) and optional article.
    If segment_id_override is set (user picked from sheet), resolve by segment id instead.
    Uses ecological regions when upload_id is 'eco'/'eco-demo', else default regions.
    """
    regions = _regions_for_image(upload_id)
    if segment_id_override is not None:
        for r in regions:
            if r.segment_id == segment_id_override:
                cand = ImageSegment(
                    segmentId=r.segment_id,
                    label=r.label,
                    confidence=r.confidence,
                    nodeId=r.node_id,
                )
                return TapResolutionResult(
                    candidates=[cand],
                    article_id=r.article_id,
                )
        # Override segment not found
        return TapResolutionResult(candidates=[], no_match=True)

    # Find all regions containing the point
    containing: list[RegionDef] = [r for r in regions if _contains(r, tap_x_norm, tap_y_norm)]

    if len(containing) == 1:
        r = containing[0]
        cand = ImageSegment(
            segmentId=r.segment_id,
            label=r.label,
            confidence=r.confidence,
            nodeId=r.node_id,
        )
        return TapResolutionResult(candidates=[cand], article_id=r.article_id)

    if len(containing) >= 2:
        # Ambiguous: return all with medium confidence for disambiguation
        candidates = [
            ImageSegment(
                segmentId=r.segment_id,
                label=r.label,
                confidence=ConfidenceLevel.medium,
                nodeId=r.node_id,
            )
            for r in containing
        ]
        return TapResolutionResult(candidates=candidates, article_id=None)

    # No region contains tap: find nearest and return as low-confidence, or no match
    nearest = min(regions, key=lambda r: _distance_to_region(r, tap_x_norm, tap_y_norm))
    dist = _distance_to_region(nearest, tap_x_norm, tap_y_norm)
    if dist < 0.05:  # within ~22% of region center
        cand = ImageSegment(
            segmentId=nearest.segment_id,
            label=nearest.label,
            confidence=ConfidenceLevel.low,
            nodeId=nearest.node_id,
        )
        return TapResolutionResult(candidates=[cand], article_id=None)
    # True no-match: return single low-confidence "unknown" candidate
    return TapResolutionResult(
        candidates=[
            ImageSegment(
                segmentId="seg-unknown",
                label="No good match here",
                confidence=ConfidenceLevel.low,
                nodeId=None,
            )
        ],
        no_match=True,
    )
