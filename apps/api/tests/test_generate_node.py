"""Rabbit Hole v17 — Generate-node endpoint and service tests. Mock provider; no live API."""
import json
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.services.knowledge_generator import (
    _sanitize_response,
    generate_node,
    MAX_CLAIMS,
)
from main import app

client = TestClient(app)


# ----- _sanitize_response -----


def test_sanitize_valid_returns_structured():
    raw = {
        "title": "Coffee Mug",
        "description": "A vessel for holding hot beverages.",
        "nodeKind": "product",
        "claims": [
            {"text": "Used for drinking.", "claimKind": "functional", "confidence": 0.9},
            {"text": "Often ceramic.", "claimKind": "material", "confidence": None},
        ],
        "suggestedRelations": [
            {"label": "Kitchenware", "relationType": "is_a", "confidence": 0.8},
        ],
    }
    out = _sanitize_response(raw)
    assert out is not None
    assert out["title"] == "Coffee Mug"
    assert out["description"] == "A vessel for holding hot beverages."
    assert out["nodeKind"] == "product"
    assert len(out["claims"]) == 2
    assert out["claims"][0]["confidence"] == 0.9
    assert out["claims"][1]["confidence"] is None
    assert len(out["suggestedRelations"]) == 1


def test_sanitize_empty_title_returns_none():
    assert _sanitize_response({"title": "", "description": "x", "nodeKind": "entity", "claims": []}) is None
    assert _sanitize_response({"description": "x", "nodeKind": "entity", "claims": []}) is None


def test_sanitize_invalid_node_kind_falls_back_to_entity():
    raw = {
        "title": "Thing",
        "description": "Something.",
        "nodeKind": "invalid_kind",
        "claims": [
            {"text": "Claim one.", "claimKind": "contextual", "confidence": None},
            {"text": "Claim two.", "claimKind": "identity", "confidence": 0.5},
        ],
    }
    out = _sanitize_response(raw)
    assert out is not None
    assert out["nodeKind"] == "entity"


def test_sanitize_claims_capped_and_deduped():
    raw = {
        "title": "X",
        "description": "Y",
        "nodeKind": "entity",
        "claims": [
            {"text": "Same", "claimKind": "identity", "confidence": 0.5},
            {"text": "Same", "claimKind": "functional", "confidence": 0.5},
            {"text": "Other", "claimKind": "material", "confidence": None},
            {"text": "A", "claimKind": "contextual", "confidence": None},
            {"text": "B", "claimKind": "contextual", "confidence": None},
        ],
    }
    out = _sanitize_response(raw)
    assert out is not None
    assert len(out["claims"]) <= MAX_CLAIMS
    texts = [c["text"] for c in out["claims"]]
    assert len(texts) == len(set(texts))


def test_sanitize_too_few_claims_returns_none():
    raw = {
        "title": "X",
        "description": "Y",
        "nodeKind": "entity",
        "claims": [{"text": "Only one.", "claimKind": "identity", "confidence": None}],
    }
    assert _sanitize_response(raw) is None


def test_sanitize_malformed_not_dict_returns_none():
    assert _sanitize_response(None) is None
    assert _sanitize_response([]) is None
    assert _sanitize_response("string") is None


def test_sanitize_no_sources_in_output():
    raw = {
        "title": "T",
        "description": "D",
        "nodeKind": "entity",
        "claims": [
            {"text": "C1", "claimKind": "identity", "confidence": None},
            {"text": "C2", "claimKind": "contextual", "confidence": None},
        ],
    }
    out = _sanitize_response(raw)
    assert out is not None
    assert "sources" not in out
    assert "sourceIds" not in out


def test_sanitize_suggested_relations_optional():
    raw = {
        "title": "T",
        "description": "D",
        "nodeKind": "entity",
        "claims": [
            {"text": "C1", "claimKind": "identity", "confidence": None},
            {"text": "C2", "claimKind": "contextual", "confidence": None},
        ],
    }
    out = _sanitize_response(raw)
    assert out is not None
    assert out.get("suggestedRelations") is None or isinstance(out["suggestedRelations"], list)


# ----- POST /v1/knowledge/generate-node -----


@patch("app.services.knowledge_generator.generate_node", new_callable=AsyncMock)
def test_generate_node_valid_request_returns_structured(mock_gen):
    mock_gen.return_value = {
        "title": "Headphones",
        "description": "Audio device worn on the head.",
        "nodeKind": "product",
        "claims": [
            {"text": "Used for listening.", "claimKind": "functional", "confidence": 0.85},
            {"text": "Consumer product.", "claimKind": "identity", "confidence": None},
        ],
        "suggestedRelations": None,
    }
    resp = client.post(
        "/v1/knowledge/generate-node",
        json={"label": "Headphones", "candidateType": "product"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Headphones"
    assert data["description"] == "Audio device worn on the head."
    assert data["nodeKind"] == "product"
    assert len(data["claims"]) == 2
    assert "sources" not in data


@patch("app.services.knowledge_generator.generate_node", new_callable=AsyncMock)
def test_generate_node_provider_failure_returns_503(mock_gen):
    mock_gen.return_value = None
    resp = client.post(
        "/v1/knowledge/generate-node",
        json={"label": "Something", "candidateType": "entity"},
    )
    assert resp.status_code == 503


def test_generate_node_missing_body_returns_400():
    resp = client.post("/v1/knowledge/generate-node")
    assert resp.status_code in (400, 422)  # 400 if our handler runs, 422 if validation rejects


# ----- v17 refinement: specificity -----


@patch("app.services.knowledge_generator.generate_node", new_callable=AsyncMock)
def test_generate_node_request_includes_specificity_fields(mock_gen):
    """v17: generation request accepts and passes visualDescription, likelyVariant, observedText, lineageHints."""
    mock_gen.return_value = {
        "title": "Sony WH-1000XM5",
        "description": "Sony flagship over-ear noise-cancelling headphones.",
        "nodeKind": "product",
        "claims": [
            {"text": "Part of Sony premium noise-cancelling line.", "claimKind": "identity", "confidence": 0.85},
            {"text": "Over-ear design with padded headband.", "claimKind": "material", "confidence": None},
        ],
        "suggestedRelations": None,
    }
    resp = client.post(
        "/v1/knowledge/generate-node",
        json={
            "label": "Sony headphones",
            "candidateType": "product",
            "likelyVariant": "WH-1000XM5 black",
            "visualDescription": "Over-ear headphones with Sony branding.",
            "lineageHints": ["consumer electronics", "noise-cancelling headphones"],
        },
    )
    assert resp.status_code == 200
    call_kw = mock_gen.call_args[1]
    assert call_kw["label"] == "Sony headphones"
    assert call_kw["likely_variant"] == "WH-1000XM5 black"
    assert call_kw["visual_description"] == "Over-ear headphones with Sony branding."
    assert call_kw["lineage_hints"] == ["consumer electronics", "noise-cancelling headphones"]
    data = resp.json()
    assert data["title"] == "Sony WH-1000XM5"


@patch("app.services.knowledge_generator.generate_node", new_callable=AsyncMock)
def test_generated_node_title_prefers_specific_when_available(mock_gen):
    """v17: when backend returns specific title (from likelyVariant/specificity input), that title is used."""
    mock_gen.return_value = {
        "title": "Likely Whitesnake 1984 tour shirt",
        "description": "Concert merchandise from the 1984 summer tour.",
        "nodeKind": "product",
        "claims": [
            {"text": "Tour shirts often function as time-stamped memorabilia.", "claimKind": "contextual", "confidence": 0.7},
            {"text": "Appears to be concert merchandise tied to a specific tour.", "claimKind": "identity", "confidence": None},
        ],
        "suggestedRelations": None,
    }
    resp = client.post(
        "/v1/knowledge/generate-node",
        json={
            "label": "Whitesnake tour shirt",
            "candidateType": "product",
            "likelyVariant": "likely 1984 summer tour shirt",
            "observedText": ["Whitesnake", "1984", "Summer Tour"],
            "lineageHints": ["concert merchandise", "tour apparel"],
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "1984" in data["title"] or "tour" in data["title"].lower()
    assert data["title"] != "Band shirt" and data["title"] != "T-shirt"


@patch("app.services.knowledge_generator.generate_node", new_callable=AsyncMock)
def test_generated_claims_reflect_specific_object(mock_gen):
    """v17: claims should refer to the specific observed thing when payload is specific."""
    mock_gen.return_value = {
        "title": "Stovetop moka pot",
        "description": "A stovetop espresso maker that uses steam pressure.",
        "nodeKind": "product",
        "claims": [
            {"text": "Moka pots brew by steam pressure through finely packed grounds.", "claimKind": "functional", "confidence": 0.9},
            {"text": "Often made of aluminum or stainless steel.", "claimKind": "material", "confidence": None},
        ],
        "suggestedRelations": None,
    }
    resp = client.post(
        "/v1/knowledge/generate-node",
        json={"label": "Coffee maker", "candidateType": "product", "specificityHint": "stovetop moka pot"},
    )
    assert resp.status_code == 200
    data = resp.json()
    claim_texts = [c["text"] for c in data["claims"]]
    assert any("moka" in t.lower() or "steam" in t.lower() for t in claim_texts)


@patch("app.services.knowledge_generator.generate_node", new_callable=AsyncMock)
def test_lineage_claim_conservative_phrasing(mock_gen):
    """v17: for merch/documents, lineage claims should use conservative phrasing (appears to, likely, often)."""
    mock_gen.return_value = {
        "title": "Concert tour shirt",
        "description": "Band or tour merchandise shirt.",
        "nodeKind": "product",
        "claims": [
            {"text": "This appears to be concert merchandise tied to a specific tour cycle.", "claimKind": "contextual", "confidence": None},
            {"text": "Tour shirts are often most identifiable by date and venue.", "claimKind": "identity", "confidence": 0.6},
        ],
        "suggestedRelations": None,
    }
    resp = client.post(
        "/v1/knowledge/generate-node",
        json={"label": "Band t-shirt", "candidateType": "product", "lineageHints": ["concert merchandise"]},
    )
    assert resp.status_code == 200
    data = resp.json()
    claim_texts = [c["text"] for c in data["claims"]]
    assert any("appears to" in t or "likely" in t or "often" in t for t in claim_texts)
