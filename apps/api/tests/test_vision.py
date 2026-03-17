"""Rabbit Hole v16 — Vision recognition provider and route tests."""
import io
import json
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.services.vision_provider import (
    VisionRecognitionResult,
    crop_region_to_bytes,
    parse_bounding_box,
    _parse_vision_response,
)
from main import app

client = TestClient(app)


# ----- parse_bounding_box -----


def test_parse_bounding_box_valid():
    bbox = parse_bounding_box('{"x": 0.2, "y": 0.3, "width": 0.2, "height": 0.25}')
    assert bbox is not None
    assert bbox["x"] == 0.2
    assert bbox["y"] == 0.3
    assert bbox["width"] == 0.2
    assert bbox["height"] == 0.25


def test_parse_bounding_box_empty_returns_none():
    assert parse_bounding_box("") is None
    assert parse_bounding_box("{}") is None


def test_parse_bounding_box_degenerate_width_returns_none():
    assert parse_bounding_box('{"x": 0, "y": 0, "width": 0, "height": 0.2}') is None
    assert parse_bounding_box('{"x": 0, "y": 0, "width": 0.1, "height": 0}') is None


def test_parse_bounding_box_invalid_json_returns_none():
    assert parse_bounding_box("not json") is None
    assert parse_bounding_box('["array"]') is None


# ----- crop_region_to_bytes -----


def _minimal_jpeg_bytes() -> bytes:
    img = Image.new("RGB", (100, 100), color=(128, 128, 128))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


def test_crop_region_to_bytes_returns_jpeg():
    jpeg = _minimal_jpeg_bytes()
    bbox = {"x": 0.1, "y": 0.1, "width": 0.5, "height": 0.5}
    out = crop_region_to_bytes(jpeg, bbox)
    assert out is not None
    assert len(out) > 0
    assert out[:2] == b"\xff\xd8"


def test_crop_region_to_bytes_clamps_to_bounds():
    jpeg = _minimal_jpeg_bytes()
    # Box partly outside 0-1
    bbox = {"x": -0.1, "y": 0.5, "width": 0.8, "height": 0.6}
    out = crop_region_to_bytes(jpeg, bbox)
    assert out is not None
    assert len(out) > 0


def test_crop_region_to_bytes_degenerate_returns_none():
    jpeg = _minimal_jpeg_bytes()
    # Zero size
    assert crop_region_to_bytes(jpeg, {"x": 0.5, "y": 0.5, "width": 0, "height": 0.1}) is None
    # Empty image
    assert crop_region_to_bytes(b"", {"x": 0, "y": 0, "width": 0.2, "height": 0.2}) is None


# ----- _parse_vision_response -----


def test_parse_vision_response_valid():
    raw = '{"label": "Coffee cup", "candidateType": "product", "confidence": 0.9}'
    r = _parse_vision_response(raw)
    assert r is not None
    assert r.label == "Coffee cup"
    assert r.candidateType == "product"
    assert r.confidence == 0.9


def test_parse_vision_response_malformed_returns_none():
    assert _parse_vision_response("") is None
    assert _parse_vision_response("not json") is None
    assert _parse_vision_response('{"label": ""}') is None
    assert _parse_vision_response('{"label": "x", "candidateType": "invalid"}') is not None  # falls back to entity


def test_parse_vision_response_confidence_clamped():
    r = _parse_vision_response('{"label": "X", "candidateType": "entity", "confidence": 1.5}')
    assert r is not None
    assert r.confidence is None  # out of range -> None


def test_parse_vision_response_specificity_fields_v17():
    """v17 refinement: optional visualDescription, specificityHint, likelyVariant, observedText, lineageHints."""
    raw = json.dumps({
        "label": "Whitesnake tour shirt",
        "candidateType": "product",
        "confidence": 0.8,
        "alternativeLabels": ["band tee"],
        "visualDescription": "Black t-shirt with band logo and tour dates.",
        "specificityHint": "likely 1984 summer tour shirt",
        "likelyVariant": "likely 1984 summer tour shirt",
        "observedText": ["Whitesnake", "1984", "Summer Tour"],
        "lineageHints": ["concert merchandise", "tour apparel"],
    })
    r = _parse_vision_response(raw)
    assert r is not None
    assert r.label == "Whitesnake tour shirt"
    assert r.visualDescription == "Black t-shirt with band logo and tour dates."
    assert r.specificityHint == "likely 1984 summer tour shirt"
    assert r.likelyVariant == "likely 1984 summer tour shirt"
    assert r.observedText == ["Whitesnake", "1984", "Summer Tour"]
    assert r.lineageHints == ["concert merchandise", "tour apparel"]


def test_parse_vision_response_specificity_optional_empty():
    """New specificity fields are optional; minimal payload still parses."""
    r = _parse_vision_response('{"label": "Headphones", "candidateType": "product"}')
    assert r is not None
    assert r.label == "Headphones"
    assert r.visualDescription is None
    assert r.likelyVariant is None
    assert r.observedText == []
    assert r.lineageHints == []


# ----- route -----


def test_vision_recognize_region_missing_file_returns_400():
    r = client.post(
        "/v1/vision/recognize-region",
        data={"boundingBox": json.dumps({"x": 0, "y": 0, "width": 0.2, "height": 0.2})},
    )
    assert r.status_code == 400


def test_vision_recognize_region_invalid_bbox_returns_400():
    jpeg = _minimal_jpeg_bytes()
    r = client.post(
        "/v1/vision/recognize-region",
        files={"file": ("img.jpg", jpeg, "image/jpeg")},
        data={"boundingBox": "invalid"},
    )
    assert r.status_code == 400


def test_vision_recognize_region_provider_returns_none_gives_404():
    jpeg = _minimal_jpeg_bytes()
    with patch("app.services.vision_provider.recognize_cropped_region", new_callable=AsyncMock, return_value=None):
        r = client.post(
            "/v1/vision/recognize-region",
            files={"file": ("img.jpg", jpeg, "image/jpeg")},
            data={"boundingBox": json.dumps({"x": 0.2, "y": 0.2, "width": 0.2, "height": 0.2})},
        )
    assert r.status_code == 404
    assert "recognize" in r.json().get("detail", "").lower() or "could not" in r.json().get("detail", "").lower()


def test_vision_recognize_region_provider_returns_result_gives_200():
    jpeg = _minimal_jpeg_bytes()
    result = VisionRecognitionResult(
        label="Headphones",
        candidateType="product",
        confidence=0.85,
        alternativeLabels=["earphones"],
    )
    with patch("app.services.vision_provider.recognize_cropped_region", new_callable=AsyncMock, return_value=result):
        r = client.post(
            "/v1/vision/recognize-region",
            files={"file": ("img.jpg", jpeg, "image/jpeg")},
            data={"boundingBox": json.dumps({"x": 0.2, "y": 0.2, "width": 0.2, "height": 0.2})},
        )
    assert r.status_code == 200
    data = r.json()
    assert data["label"] == "Headphones"
    assert data["candidateType"] == "product"
    assert data["confidence"] == 0.85
    assert data.get("alternativeLabels") == ["earphones"]


def test_vision_recognize_region_returns_specificity_fields_when_present():
    """v17: route returns visualDescription, likelyVariant, observedText, lineageHints when provider includes them."""
    jpeg = _minimal_jpeg_bytes()
    result = VisionRecognitionResult(
        label="Sony WH-1000XM5",
        candidateType="product",
        confidence=0.9,
        alternativeLabels=[],
        visualDescription="Over-ear headphones with Sony branding.",
        specificityHint="likely Sony flagship noise-cancelling model",
        likelyVariant="WH-1000XM5 black",
        observedText=[],
        lineageHints=["consumer electronics", "noise-cancelling headphones"],
    )
    with patch("app.services.vision_provider.recognize_cropped_region", new_callable=AsyncMock, return_value=result):
        r = client.post(
            "/v1/vision/recognize-region",
            files={"file": ("img.jpg", jpeg, "image/jpeg")},
            data={"boundingBox": json.dumps({"x": 0.2, "y": 0.2, "width": 0.2, "height": 0.2})},
        )
    assert r.status_code == 200
    data = r.json()
    assert data["label"] == "Sony WH-1000XM5"
    assert data["likelyVariant"] == "WH-1000XM5 black"
    assert data["lineageHints"] == ["consumer electronics", "noise-cancelling headphones"]


def test_vision_recognize_region_no_longer_returns_sony_stub():
    """Route must not always return Sony headphones; with mocked provider it returns provider result."""
    jpeg = _minimal_jpeg_bytes()
    result = VisionRecognitionResult(label="Desk lamp", candidateType="product", confidence=None, alternativeLabels=[])
    with patch("app.services.vision_provider.recognize_cropped_region", new_callable=AsyncMock, return_value=result):
        r = client.post(
            "/v1/vision/recognize-region",
            files={"file": ("img.jpg", jpeg, "image/jpeg")},
            data={"boundingBox": json.dumps({"x": 0, "y": 0, "width": 0.3, "height": 0.3})},
        )
    assert r.status_code == 200
    assert r.json()["label"] == "Desk lamp"
    assert r.json()["confidence"] is None
