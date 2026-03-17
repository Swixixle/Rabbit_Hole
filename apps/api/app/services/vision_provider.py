"""
Rabbit Hole v16 — Vision recognition provider.
Crops image region and calls configured vision model; returns candidate-level result only.
"""
from __future__ import annotations

import io
import json
import logging
import os
from typing import Literal

from pydantic import BaseModel

logger = logging.getLogger(__name__)

CandidateType = Literal["entity", "product", "landmark", "topic", "media"]
CANDIDATE_TYPES: tuple[CandidateType, ...] = ("entity", "product", "landmark", "topic", "media")


class VisionRecognitionResult(BaseModel):
    label: str
    candidateType: CandidateType
    confidence: float | None = None
    alternativeLabels: list[str] = []
    # v17 refinement: specificity and provenance-sensitive cues (observational aids only)
    visualDescription: str | None = None
    specificityHint: str | None = None
    likelyVariant: str | None = None
    observedText: list[str] = []
    lineageHints: list[str] = []


def parse_bounding_box(bounding_box_str: str) -> dict[str, float] | None:
    """Parse boundingBox JSON. Returns {x, y, width, height} in 0-1 normalized coords or None."""
    if not bounding_box_str or not bounding_box_str.strip():
        return None
    try:
        data = json.loads(bounding_box_str)
        if not isinstance(data, dict):
            return None
        x = float(data.get("x", 0))
        y = float(data.get("y", 0))
        w = float(data.get("width", 0))
        h = float(data.get("height", 0))
        if w <= 0 or h <= 0:
            return None
        return {"x": x, "y": y, "width": w, "height": h}
    except (json.JSONDecodeError, TypeError, ValueError):
        return None


def crop_region_to_bytes(
    image_bytes: bytes,
    bbox: dict[str, float],
    mime_type: str | None = None,
) -> bytes | None:
    """
    Crop image to normalized bounding box (0-1). Clamps to image bounds.
    Returns cropped image as JPEG bytes or None on failure.
    """
    if not image_bytes or len(image_bytes) < 10:
        return None
    try:
        from PIL import Image

        img = Image.open(io.BytesIO(image_bytes))
        if img.mode not in ("RGB", "L", "RGBA"):
            img = img.convert("RGB")
        if img.mode == "RGBA":
            img = img.convert("RGB")
        w, h = img.size
        # Normalized to pixels; clamp to image bounds
        x1 = max(0, min(1, bbox["x"])) * w
        y1 = max(0, min(1, bbox["y"])) * h
        x2 = max(0, min(1, bbox["x"] + bbox["width"])) * w
        y2 = max(0, min(1, bbox["y"] + bbox["height"])) * h
        # Ensure valid box
        x1, x2 = min(x1, x2), max(x1, x2)
        y1, y2 = min(y1, y2), max(y1, y2)
        if x2 - x1 < 1 or y2 - y1 < 1:
            return None
        cropped = img.crop((int(x1), int(y1), int(x2), int(y2)))
        buf = io.BytesIO()
        cropped.save(buf, format="JPEG", quality=85)
        return buf.getvalue()
    except Exception as e:
        logger.warning("vision crop failed: %s", e)
        return None


def _parse_vision_response(raw: str) -> VisionRecognitionResult | None:
    """Parse and validate model JSON output. Returns None on malformed."""
    if not raw or not raw.strip():
        return None
    raw = raw.strip()
    # Handle markdown code block
    if raw.startswith("```"):
        lines = raw.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        raw = "\n".join(lines)
    try:
        data = json.loads(raw)
        if not isinstance(data, dict):
            return None
        label = (data.get("label") or "").strip()
        if not label:
            return None
        ct = (data.get("candidateType") or "").strip().lower()
        if ct not in CANDIDATE_TYPES:
            ct = "entity"
        conf = data.get("confidence")
        if conf is not None:
            try:
                conf = float(conf)
                if not (0 <= conf <= 1):
                    conf = None
            except (TypeError, ValueError):
                conf = None
        alts = data.get("alternativeLabels")
        if not isinstance(alts, list):
            alts = []
        alts = [str(a).strip() for a in alts if a and str(a).strip()][:10]
        vd = (data.get("visualDescription") or "").strip() or None
        sh = (data.get("specificityHint") or "").strip() or None
        lv = (data.get("likelyVariant") or "").strip() or None
        ot = data.get("observedText")
        if not isinstance(ot, list):
            ot = []
        ot = [str(t).strip() for t in ot if t and str(t).strip()][:20]
        lh = data.get("lineageHints")
        if not isinstance(lh, list):
            lh = []
        lh = [str(h).strip() for h in lh if h and str(h).strip()][:10]
        return VisionRecognitionResult(
            label=label,
            candidateType=ct,
            confidence=conf,
            alternativeLabels=alts,
            visualDescription=vd,
            specificityHint=sh,
            likelyVariant=lv,
            observedText=ot,
            lineageHints=lh,
        )
    except (json.JSONDecodeError, TypeError, ValueError):
        return None


async def recognize_cropped_region(
    image_bytes: bytes,
    mime_type: str | None = None,
) -> VisionRecognitionResult | None:
    """
    Send cropped image to configured vision provider. Returns candidate-level result or None.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    model = os.environ.get("OPENAI_VISION_MODEL", "gpt-4o-mini")
    if not api_key or not api_key.strip():
        logger.debug("vision: OPENAI_API_KEY not set, skipping recognition")
        return None
    if not image_bytes or len(image_bytes) < 10:
        logger.debug("vision: empty or tiny image")
        return None

    import base64

    b64 = base64.standard_b64encode(image_bytes).decode("ascii")
    prompt = """Identify the most specific safe identity of the primary object in this image. Prefer the exact object/variant when the image supports it over a broad category.

Reply with ONLY a single JSON object, no other text. Use this exact shape:
{
  "label": "short name — prefer specific (e.g. Sony WH-1000XM5, Whitesnake tour shirt) over generic (headphones, t-shirt)",
  "candidateType": "entity"|"product"|"landmark"|"topic"|"media",
  "confidence": 0.0-1.0 or null,
  "alternativeLabels": ["other name", ...],
  "visualDescription": "short factual description of what is visibly present in the crop",
  "specificityHint": "best-effort narrowing phrase, e.g. likely over-ear Sony flagship headphones",
  "likelyVariant": "best-effort specific model/version/edition if visible, e.g. WH-1000XM5, Bialetti moka pot, tour shirt",
  "observedText": ["visible text snippet 1", "snippet 2"] or [],
  "lineageHints": ["e.g. concert merchandise", "tour apparel", "stovetop espresso maker", "utility billing document"] or []
}

Rules:
- Prefer specific object identity over broad category. If exact model/version is uncertain, use "likely" in likelyVariant or specificityHint.
- For clothing/merchandise/posters/documents, pay close attention to printed text, logos, dates, tour names, brand marks, utility/company names. Put readable text in observedText.
- Do not hallucinate provenance not visually supported. If you cannot identify specifically, fall back to subtype/category.
- candidateType must be exactly one of: entity, product, landmark, topic, media.
- Optional fields may be empty arrays or omitted."""

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{b64}"},
                        },
                    ],
                }
            ],
            max_tokens=500,
        )
        content = (response.choices[0].message.content or "").strip()
        if not content:
            logger.debug("vision: empty model response")
            return None
        result = _parse_vision_response(content)
        if result:
            logger.info(
                "vision: recognized label=%r candidateType=%s confidence=%s",
                result.label,
                result.candidateType,
                result.confidence,
            )
        else:
            logger.warning("vision: failed to parse model response")
        return result
    except Exception as e:
        logger.warning("vision provider error: %s", e)
        return None
