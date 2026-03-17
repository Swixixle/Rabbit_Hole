"""Contract validity: API returns shapes that match expected fields."""
import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_upload_returns_upload_id_and_uri():
    r = client.post("/v1/media/upload", files={"file": ("test.jpg", b"\xff\xd8\xff", "image/jpeg")})
    assert r.status_code == 200
    data = r.json()
    assert "uploadId" in data
    assert "imageUri" in data


def test_explore_image_returns_segments():
    r = client.post("/v1/explore/image", json={"uploadId": "any"})
    assert r.status_code == 200
    data = r.json()
    assert "segments" in data
    segs = data["segments"]
    assert isinstance(segs, list)
    if segs:
        assert "segmentId" in segs[0]
        assert "label" in segs[0]
        assert "confidence" in segs[0]


def test_explore_tap_returns_candidates():
    """segmentId override: resolve by segment (e.g. user picked from sheet)."""
    r = client.post("/v1/explore/image/tap", json={"uploadId": "any", "segmentId": "seg-coffee"})
    assert r.status_code == 200
    data = r.json()
    assert "candidates" in data
    assert isinstance(data["candidates"], list)
    assert data.get("articleId") == "article-coffee"


def test_explore_tap_inside_region_coffee():
    """Tap in left region (coffee) returns coffee candidate and articleId."""
    r = client.post("/v1/explore/image/tap", json={"uploadId": "any", "tapXNorm": 0.2, "tapYNorm": 0.5})
    assert r.status_code == 200
    data = r.json()
    assert data.get("articleId") == "article-coffee"
    cands = data.get("candidates") or []
    assert len(cands) == 1
    assert cands[0]["segmentId"] == "seg-coffee"
    assert cands[0]["label"] == "Coffee cup"


def test_explore_tap_inside_region_uhaul():
    """Tap in right region (uhaul) returns uhaul candidate and articleId."""
    r = client.post("/v1/explore/image/tap", json={"uploadId": "any", "tapXNorm": 0.75, "tapYNorm": 0.5})
    assert r.status_code == 200
    data = r.json()
    assert data.get("articleId") == "article-uhaul"
    cands = data.get("candidates") or []
    assert len(cands) == 1
    assert cands[0]["segmentId"] == "seg-uhaul"


def test_explore_tap_outside_regions_low_confidence_or_no_match():
    """Tap outside all defined regions returns low-confidence or no-match (no articleId)."""
    r = client.post("/v1/explore/image/tap", json={"uploadId": "any", "tapXNorm": 0.9, "tapYNorm": 0.9})
    assert r.status_code == 200
    data = r.json()
    # Should not have a confident article; may have one low-confidence candidate or "No good match"
    assert data.get("articleId") is None
    cands = data.get("candidates") or []
    assert len(cands) >= 1
    if cands[0]["segmentId"] == "seg-unknown":
        assert cands[0]["label"] == "No good match here"


def test_explore_image_segments_have_region_model_and_optional_bbox():
    """explore/image returns segments consistent with tap resolution; optional bbox for overlay."""
    r = client.post("/v1/explore/image", json={"uploadId": "any"})
    assert r.status_code == 200
    segs = r.json().get("segments") or []
    assert len(segs) >= 2
    ids = {s["segmentId"] for s in segs}
    assert "seg-coffee" in ids
    assert "seg-uhaul" in ids
    for s in segs:
        assert "segmentId" in s and "label" in s and "confidence" in s
    # At least one segment has bbox (normalized bounds)
    with_bbox = [s for s in segs if s.get("bbox")]
    assert len(with_bbox) >= 1
    assert "x" in with_bbox[0]["bbox"] and "y" in with_bbox[0]["bbox"] and "width" in with_bbox[0]["bbox"] and "height" in with_bbox[0]["bbox"]


def test_explore_image_accepts_optional_location_context():
    """Location Context v1: POST /v1/explore/image accepts optional location; behavior unchanged."""
    r = client.post(
        "/v1/explore/image",
        json={
            "uploadId": "any",
            "location": {"latitude": 40.7, "longitude": -74.0, "accuracy": "approximate"},
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert "segments" in data
    segs = data["segments"]
    assert isinstance(segs, list)
    # Same fixture behavior as without location
    ids = {s["segmentId"] for s in segs}
    assert "seg-coffee" in ids
    assert "seg-uhaul" in ids


def test_explore_image_returns_ecological_entity_when_eco_upload():
    """Ecological Identification v1: when uploadId is 'eco' or 'eco-demo', response includes ecologicalEntity and ecological segments."""
    r = client.post("/v1/explore/image", json={"uploadId": "eco"})
    assert r.status_code == 200
    data = r.json()
    assert "segments" in data
    segs = data["segments"]
    assert len(segs) >= 1
    segment_ids = {s["segmentId"] for s in segs}
    assert "seg-poison-ivy" in segment_ids or "seg-tick" in segment_ids
    assert "ecologicalEntity" in data
    ent = data["ecologicalEntity"]
    assert ent is not None
    assert "id" in ent and "name" in ent and "kind" in ent
    assert ent["kind"] in ("plant", "tree", "insect", "fungus", "bird", "animal", "ecosystem_feature", "unknown")
    if ent.get("safetyNotes"):
        assert isinstance(ent["safetyNotes"], list)


def test_explore_image_no_ecological_entity_for_default_upload():
    """Ecological Identification v1: default uploadId 'any' returns no ecologicalEntity."""
    r = client.post("/v1/explore/image", json={"uploadId": "any"})
    assert r.status_code == 200
    data = r.json()
    assert "segments" in data
    assert data.get("ecologicalEntity") is None


def test_explore_tap_eco_poison_ivy_returns_article():
    """Ecological Identification v1: tap with uploadId 'eco' and segmentId seg-poison-ivy returns article-poison-ivy."""
    r = client.post("/v1/explore/image/tap", json={"uploadId": "eco", "segmentId": "seg-poison-ivy"})
    assert r.status_code == 200
    data = r.json()
    assert data.get("articleId") == "article-poison-ivy"
    cands = data.get("candidates") or []
    assert len(cands) == 1
    assert cands[0]["segmentId"] == "seg-poison-ivy"
    assert cands[0]["label"] == "Poison ivy"


def test_article_poison_ivy_returns_200_and_blocks():
    """Ecological Identification v1: article-poison-ivy exists and has identification/summary/context blocks."""
    r = client.get("/v1/articles/article-poison-ivy")
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == "article-poison-ivy"
    assert data["title"] == "Poison ivy"
    blocks = data.get("blocks") or []
    assert len(blocks) >= 1
    assert any(b.get("blockType") == "identification" for b in blocks)


def test_get_article_returns_contract_shape():
    r = client.get("/v1/articles/article-coffee")
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == "article-coffee"
    assert "nodeId" in data
    assert "title" in data
    assert "nodeType" in data
    assert "blocks" in data
    assert isinstance(data["blocks"], list)


def test_article_has_structured_blocks_and_sections():
    """Article blocks use canonical blockType for assembly (identification, summary, context)."""
    r = client.get("/v1/articles/article-coffee")
    assert r.status_code == 200
    blocks = r.json().get("blocks") or []
    assert len(blocks) >= 3
    types = [b.get("blockType") for b in blocks if b.get("blockType")]
    assert "identification" in types
    assert "summary" in types
    assert "context" in types


def test_article_questions_at_end_article_specific():
    """Article has questionIds; questions endpoint returns article-specific list."""
    r = client.get("/v1/articles/article-uhaul")
    assert r.status_code == 200
    data = r.json()
    assert "questionIds" in data
    qids = data.get("questionIds") or []
    assert len(qids) >= 5
    rq = client.get(f"/v1/articles/{data['id']}/questions")
    assert rq.status_code == 200
    questions = rq.json().get("questions") or []
    assert len(questions) >= 5
    # Uhaul uses q6–q10
    assert "q6" in qids


def test_article_has_verify_and_trace_entry_points():
    """Article has relatedNodeIds and questionIds for navigation/entry points."""
    r = client.get("/v1/articles/article-coffee")
    assert r.status_code == 200
    data = r.json()
    assert "relatedNodeIds" in data
    assert "questionIds" in data
    assert isinstance(data.get("relatedNodeIds"), list)
    assert isinstance(data.get("questionIds"), list)


def test_article_coffee_has_experience_system_path():
    """Article with experience returns system_path steps and step linkage."""
    r = client.get("/v1/articles/article-coffee")
    assert r.status_code == 200
    data = r.json()
    assert "experience" in data
    exp = data["experience"]
    assert exp["mode"] == "system_path"
    steps = exp.get("steps") or []
    assert len(steps) >= 3
    for s in steps:
        assert "id" in s and "label" in s and "shortTitle" in s
    step_with_blocks = next((s for s in steps if s.get("relatedBlockIds")), None)
    assert step_with_blocks is not None
    assert isinstance(step_with_blocks["relatedBlockIds"], list)


def test_verification_returns_sources_list():
    r = client.get("/v1/verification/article/article-coffee")
    assert r.status_code == 200
    data = r.json()
    assert "sources" in data
    assert isinstance(data["sources"], list)


def test_verification_bundle_has_claims_sources_evidence():
    """Verification response contains claims, sources, evidence spans, and mappings."""
    r = client.get("/v1/verification/article/article-coffee")
    assert r.status_code == 200
    data = r.json()
    assert "claims" in data
    assert "evidenceSpans" in data
    assert "claimToSources" in data
    assert "claimToEvidence" in data
    assert "supportStatusByClaimId" in data
    claims = data.get("claims") or []
    assert len(claims) >= 1
    evidence = data.get("evidenceSpans") or []
    assert len(evidence) >= 1
    for c in claims:
        assert "id" in c and "text" in c and "claimType" in c


def test_verification_at_least_one_claim_has_evidence():
    """At least one claim has linked evidence spans."""
    r = client.get("/v1/verification/article/article-coffee")
    assert r.status_code == 200
    claim_to_evidence = r.json().get("claimToEvidence") or {}
    with_evidence = [cid for cid, spans in claim_to_evidence.items() if spans]
    assert len(with_evidence) >= 1


def test_verification_support_status_present():
    """At least one claim has interpretive or limited-support status."""
    r = client.get("/v1/verification/article/article-coffee")
    assert r.status_code == 200
    status_by_claim = r.json().get("supportStatusByClaimId") or {}
    assert len(status_by_claim) >= 1
    allowed = {"supported_fact", "supported_synthesis", "interpretation", "limited_support", "insufficient_support", "disputed"}
    for cid, status in status_by_claim.items():
        assert status in allowed


def test_verification_article_uhaul_has_insufficient_support_claim():
    """article-uhaul has claim-5 with 0 sources -> insufficient_support."""
    r = client.get("/v1/verification/article/article-uhaul")
    assert r.status_code == 200
    status_by_claim = r.json().get("supportStatusByClaimId") or {}
    assert status_by_claim.get("claim-5") == "insufficient_support"


def test_verification_unknown_article_safe_shape():
    """Unknown article returns empty but safe verification shape."""
    r = client.get("/v1/verification/article/nonexistent-article-id")
    assert r.status_code == 200
    data = r.json()
    assert data.get("sources") == []
    assert data.get("claims") == []
    assert data.get("evidenceSpans") == []
    assert data.get("claimToSources") == {}
    assert data.get("supportStatusByClaimId") == {}


def test_traces_returns_traces_list():
    r = client.get("/v1/traces/node-coffee-cup")
    assert r.status_code == 200
    data = r.json()
    assert "traces" in data
    assert isinstance(data["traces"], list)


def test_upload_without_file_accepted_for_stub():
    r = client.post("/v1/media/upload")
    assert r.status_code == 200
    assert "uploadId" in r.json()


def test_page_extract_text_no_file_returns_empty():
    """OCR / Page Capture: POST /v1/page/extract-text with no file returns empty text and low confidence."""
    r = client.post("/v1/page/extract-text")
    assert r.status_code == 200
    data = r.json()
    assert data.get("text") == ""
    assert data.get("confidence") == "low"


def test_page_extract_text_accepts_image_returns_shape():
    """OCR / Page Capture: POST /v1/page/extract-text with image returns { text, confidence }."""
    # Minimal JPEG bytes (valid header, no real content - OCR may return empty)
    jpeg_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xd9"
    r = client.post("/v1/page/extract-text", files={"file": ("page.jpg", jpeg_bytes, "image/jpeg")})
    assert r.status_code == 200
    data = r.json()
    assert "text" in data
    assert "confidence" in data
    assert isinstance(data["text"], str)
    assert data["confidence"] in ("high", "medium", "low", None)


def test_explore_tap_empty_body():
    r = client.post("/v1/explore/image/tap", json={})
    assert r.status_code == 200
    assert "candidates" in r.json()


def test_verification_source_shape():
    r = client.get("/v1/verification/article/article-coffee")
    sources = r.json().get("sources") or []
    for s in sources:
        assert "id" in s and "type" in s and "title" in s


def test_traces_unknown_node_empty():
    r = client.get("/v1/traces/unknown-node-id")
    assert r.status_code == 200
    assert r.json().get("traces") == []


def test_claim_returns_enriched_confidence_and_support():
    """GET /claims/:id returns claim with confidence and support (derived if missing)."""
    r = client.get("/v1/claims/claim-1")
    assert r.status_code == 200
    data = r.json()
    assert data.get("confidence") in ("high", "medium", "low")
    assert data.get("support") in ("direct", "inference", "interpretation", "speculation")


def test_verification_claims_have_confidence_and_support():
    """Verification bundle claims have confidence and support."""
    r = client.get("/v1/verification/article/article-coffee")
    assert r.status_code == 200
    claims = r.json().get("claims") or []
    for c in claims:
        assert c.get("confidence") in ("high", "medium", "low"), f"claim {c.get('id')} missing valid confidence"
        assert c.get("support") in ("direct", "inference", "interpretation", "speculation"), f"claim {c.get('id')} missing valid support"


def test_epistemic_derivation_verified_fact():
    """verified_fact claim gets direct support and high confidence when not set."""
    r = client.get("/v1/claims/claim-1")
    assert r.status_code == 200
    data = r.json()
    assert data["support"] == "direct"
    assert data["confidence"] == "high"


def test_epistemic_derivation_interpretation():
    """interpretation claim gets interpretation support."""
    r = client.get("/v1/claims/claim-2")
    assert r.status_code == 200
    data = r.json()
    assert data["support"] == "interpretation"
    assert data["confidence"] in ("high", "medium", "low")


# ----- Lens Surface v1: search -----


def test_search_returns_article_coffee_for_coffee_query():
    """Search for coffee-related query returns article-coffee."""
    r = client.get("/v1/search?q=coffee")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    ids = [hit["articleId"] for hit in data if hit.get("articleId")]
    assert "article-coffee" in ids


def test_search_returns_article_uhaul_for_uhaul_query():
    """Search for uhaul-related query returns article-uhaul."""
    r = client.get("/v1/search?q=uhaul")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    ids = [hit["articleId"] for hit in data if hit.get("articleId")]
    assert "article-uhaul" in ids


def test_search_case_insensitive():
    """Search is case-insensitive."""
    r_lower = client.get("/v1/search?q=coffee")
    r_upper = client.get("/v1/search?q=COFFEE")
    assert r_lower.status_code == 200 and r_upper.status_code == 200
    assert r_lower.json() == r_upper.json()


def test_search_result_payload_has_expected_fields():
    """Search result items have nodeId, articleId, title, and optional summary, imageUrl, matchReason."""
    r = client.get("/v1/search?q=coffee")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    if data:
        hit = data[0]
        assert "nodeId" in hit
        assert "title" in hit
        assert hit.get("articleId") is not None
        assert hit.get("matchReason") in (None, "title", "alias", "keyword")


# ----- Native Share Entry v1: shared text resolves via search -----


def test_shared_plain_text_coffee_resolves_through_search():
    """Shared plain text (e.g. 'coffee cup recycling') resolves to article-coffee."""
    r = client.get("/v1/search?q=coffee%20cup%20recycling")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    ids = [hit["articleId"] for hit in data if hit.get("articleId")]
    assert "article-coffee" in ids


def test_shared_text_uhaul_resolves_through_search():
    """Shared text with uhaul-related content returns article-uhaul."""
    r = client.get("/v1/search?q=uhaul%20moving%20blankets")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    ids = [hit["articleId"] for hit in data if hit.get("articleId")]
    assert "article-uhaul" in ids


def test_shared_input_no_results_returns_empty_list():
    """Unmatched shared input returns empty list (no-result path)."""
    r = client.get("/v1/search?q=xyznonexistenttopic123")
    assert r.status_code == 200
    data = r.json()
    assert data == []


# --- Market Surface v1 ---


def test_article_market_returns_200_and_valid_payload_for_article_with_market():
    """Article with market data returns 200 and valid ArticleMarket shape."""
    r = client.get("/v1/articles/article-coffee/market")
    assert r.status_code == 200
    data = r.json()
    assert "title" in data
    assert "items" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) >= 1
    item = data["items"][0]
    assert "id" in item
    assert "title" in item
    assert "category" in item
    assert data.get("title") == "Market"
    assert "intro" in data


def test_article_market_returns_404_when_no_market():
    """Article without market data returns 404 (do not show Market entry)."""
    r = client.get("/v1/articles/article-nonexistent-market/market")
    assert r.status_code == 404


def test_article_market_medical_info_items_have_warning():
    """medical_info category items include warning text (safety constraint)."""
    from app.fixtures import MEDICAL_WARNING

    r = client.get("/v1/articles/article-coffee/market")
    assert r.status_code == 200
    data = r.json()
    medical = [i for i in data["items"] if i.get("category") == "medical_info"]
    assert len(medical) >= 1
    for m in medical:
        assert "warning" in m
        assert m["warning"] == MEDICAL_WARNING


def test_article_market_payload_shape_stable():
    """Market payload has stable shape: items with required fields."""
    r = client.get("/v1/articles/article-uhaul/market")
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    for item in data["items"]:
        assert "id" in item and isinstance(item["id"], str)
        assert "title" in item and isinstance(item["title"], str)
        assert "category" in item and item["category"] in (
            "shopping",
            "restaurants",
            "healthier_alternative",
            "vehicle_safety",
            "medical_info",
        )


def test_article_market_has_search_destination_items():
    """At least one item has destinationType search so client can trigger Lens search."""
    r = client.get("/v1/articles/article-coffee/market")
    assert r.status_code == 200
    data = r.json()
    search_items = [i for i in data["items"] if i.get("destinationType") == "search"]
    assert len(search_items) >= 1
    for i in search_items:
        assert i.get("destinationValue"), "search items must have destinationValue (query)"


def test_article_market_has_internal_destination_item():
    """At least one article has an internal item so client can open article by id."""
    r = client.get("/v1/articles/article-uhaul/market")
    assert r.status_code == 200
    data = r.json()
    internal_items = [i for i in data["items"] if i.get("destinationType") == "internal"]
    assert len(internal_items) >= 1
    for i in internal_items:
        assert i.get("destinationValue"), "internal items must have destinationValue (articleId)"


def test_article_market_has_local_recommendation_items():
    """Local Recommendations v1: articles include place-oriented items that resolve via search."""
    r = client.get("/v1/articles/article-coffee/market")
    assert r.status_code == 200
    data = r.json()
    restaurants = [i for i in data["items"] if i.get("category") == "restaurants"]
    assert len(restaurants) >= 1, "article-coffee should have at least one restaurants (local) item"
    r2 = client.get("/v1/articles/article-uhaul/market")
    assert r2.status_code == 200
    data2 = r2.json()
    place_search_items = [i for i in data2["items"] if i.get("destinationType") == "search" and i.get("destinationValue")]
    assert len(place_search_items) >= 1, "article-uhaul should have place-oriented search items"


def test_article_market_local_items_resolve_through_search():
    """Local recommendation items use destinationType search so they resolve through Lens."""
    r = client.get("/v1/articles/article-coffee/market")
    assert r.status_code == 200
    data = r.json()
    local_tagged = [i for i in data["items"] if (i.get("tags") or []) and "local" in (i.get("tags") or [])]
    for item in local_tagged:
        assert item.get("destinationType") == "search", "local items must resolve via search"
        assert item.get("destinationValue"), "search items must have destinationValue"


def test_article_market_health_resource_item_has_warning():
    """Health-oriented resource recommendation (e.g. pharmacist) carries medical warning."""
    from app.fixtures import MEDICAL_WARNING

    r = client.get("/v1/articles/article-coffee/market")
    assert r.status_code == 200
    data = r.json()
    health_resource = [i for i in data["items"] if i.get("category") == "medical_info"]
    assert len(health_resource) >= 1
    for m in health_resource:
        assert m.get("warning") == MEDICAL_WARNING, "medical_info items must include safety warning"


def test_article_market_has_healthier_alternative_items():
    """Healthier Alternatives v1: article market includes healthier_alternative category items."""
    r = client.get("/v1/articles/article-coffee/market")
    assert r.status_code == 200
    data = r.json()
    alt_items = [i for i in data["items"] if i.get("category") == "healthier_alternative"]
    assert len(alt_items) >= 3, "article-coffee should have multiple healthier alternative items"
    r2 = client.get("/v1/articles/article-uhaul/market")
    assert r2.status_code == 200
    data2 = r2.json()
    alt_items2 = [i for i in data2["items"] if i.get("category") == "healthier_alternative"]
    assert len(alt_items2) >= 3, "article-uhaul should have multiple healthier alternative items"


def test_article_market_healthier_alternative_items_resolve():
    """Healthier alternative items resolve through existing market resolution (search or internal)."""
    for article_id in ("article-coffee", "article-uhaul"):
        r = client.get(f"/v1/articles/{article_id}/market")
        assert r.status_code == 200
        data = r.json()
        alt_items = [i for i in data["items"] if i.get("category") == "healthier_alternative"]
        for item in alt_items:
            dest = item.get("destinationType")
            assert dest in ("search", "internal"), "healthier_alternative must resolve via search or internal"
            assert item.get("destinationValue"), "search/internal items must have destinationValue"


def test_article_market_has_safer_option_items():
    """Safer Products / Safer Vehicles v1: payload includes safer-option items where expected."""
    r = client.get("/v1/articles/article-coffee/market")
    assert r.status_code == 200
    data = r.json()
    safer_coffee = [i for i in data["items"] if "safer" in (i.get("tags") or []) or "safer" in (i.get("title") or "").lower()]
    assert len(safer_coffee) >= 1, "article-coffee should have at least one safer-option item"
    r2 = client.get("/v1/articles/article-uhaul/market")
    assert r2.status_code == 200
    data2 = r2.json()
    vehicle_safety_items = [i for i in data2["items"] if i.get("category") == "vehicle_safety"]
    assert len(vehicle_safety_items) >= 2, "article-uhaul should have at least two vehicle_safety items"


def test_article_market_vehicle_safety_items_resolve():
    """vehicle_safety items resolve through existing market resolution (search or internal)."""
    r = client.get("/v1/articles/article-uhaul/market")
    assert r.status_code == 200
    data = r.json()
    vs_items = [i for i in data["items"] if i.get("category") == "vehicle_safety"]
    for item in vs_items:
        dest = item.get("destinationType")
        assert dest in ("search", "internal"), "vehicle_safety must resolve via search or internal"
        assert item.get("destinationValue"), "search/internal items must have destinationValue"


# --- Page-to-Study Groundwork v1 ---


def test_article_study_returns_200_and_valid_payload_for_article_with_study():
    """Article with study guide returns 200 and valid ArticleStudyGuide shape."""
    r = client.get("/v1/articles/article-coffee/study")
    assert r.status_code == 200
    data = r.json()
    assert "blocks" in data
    assert isinstance(data["blocks"], list)
    assert len(data["blocks"]) >= 1
    block = data["blocks"][0]
    assert "id" in block and "kind" in block and "title" in block and "content" in block
    assert block["kind"] in (
        "overview",
        "explain_simple",
        "key_points",
        "why_it_matters",
        "common_confusion",
        "study_questions",
    )
    assert data.get("title") is not None or len(data["blocks"]) > 0


def test_article_study_returns_404_when_no_study():
    """Article without study guide returns 404 (do not show Study entry)."""
    r = client.get("/v1/articles/article-nonexistent/study")
    assert r.status_code == 404


def test_article_study_payload_shape_stable():
    """Study guide payload has stable shape: blocks with required fields and allowed kinds."""
    from app.models import STUDY_BLOCK_KINDS

    for article_id in ("article-coffee", "article-uhaul"):
        r = client.get(f"/v1/articles/{article_id}/study")
        assert r.status_code == 200, f"expected 200 for {article_id}"
        data = r.json()
        assert "blocks" in data and isinstance(data["blocks"], list)
        for b in data["blocks"]:
            assert "id" in b and isinstance(b["id"], str)
            assert "kind" in b and b["kind"] in STUDY_BLOCK_KINDS
            assert "title" in b and isinstance(b["title"], str)
            assert "content" in b and isinstance(b["content"], str)
            if b.get("bulletItems") is not None:
                assert isinstance(b["bulletItems"], list)
                for item in b["bulletItems"]:
                    assert isinstance(item, str)


def test_article_study_blocks_include_expected_kinds():
    """Study guides for fixture articles include overview, explain_simple, key_points, study_questions."""
    r = client.get("/v1/articles/article-coffee/study")
    assert r.status_code == 200
    kinds = {b["kind"] for b in r.json()["blocks"]}
    assert "overview" in kinds
    assert "explain_simple" in kinds
    assert "key_points" in kinds
    assert "study_questions" in kinds


# ----- Media Lens Groundwork v1 -----


def test_media_resolve_youtube_mapped_returns_article_id():
    """YouTube URL that is in the fixture registry returns 200 with articleId."""
    r = client.get("/v1/media/resolve", params={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"})
    assert r.status_code == 200
    data = r.json()
    assert data["kind"] == "youtube"
    assert data["normalizedId"] == "dQw4w9WgXcQ"
    assert data["articleId"] == "article-coffee"
    assert data.get("title") == "Disposable coffee cup"


def test_media_resolve_youtube_short_url():
    """youtu.be short URL is classified and normalized."""
    r = client.get("/v1/media/resolve", params={"url": "https://youtu.be/jNQXAC9IVRw"})
    assert r.status_code == 200
    data = r.json()
    assert data["kind"] == "youtube"
    assert data["normalizedId"] == "jNQXAC9IVRw"
    assert data["articleId"] == "article-uhaul"


def test_media_resolve_podcast_mapped():
    """Podcast URL with path in registry returns articleId."""
    r = client.get(
        "/v1/media/resolve",
        params={"url": "https://podcasts.apple.com/podcast/episode/123"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["kind"] == "podcast"
    assert data["articleId"] == "article-coffee"


def test_media_resolve_recognized_but_unmapped_returns_200_no_article_id():
    """TikTok or other recognized media not in registry returns 200 with kind but no articleId."""
    r = client.get(
        "/v1/media/resolve",
        params={"url": "https://www.tiktok.com/@user/video/1234567890123456789"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["kind"] == "tiktok"
    assert data.get("normalizedId") == "1234567890123456789"
    assert data.get("articleId") is None


def test_media_resolve_non_media_url_returns_404():
    """Plain HTTP URL that is not a recognized media pattern returns 404."""
    r = client.get("/v1/media/resolve", params={"url": "https://example.com/page"})
    assert r.status_code == 404


def test_media_resolve_non_url_returns_404():
    """Non-URL input returns 404."""
    r = client.get("/v1/media/resolve", params={"url": "coffee cup recycling"})
    assert r.status_code == 404


def test_media_resolve_payload_shape():
    """Media resolve response has stable shape: kind, originalUrl, optional normalizedId, title, articleId."""
    r = client.get("/v1/media/resolve", params={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"})
    assert r.status_code == 200
    data = r.json()
    assert "kind" in data and data["kind"] in ("youtube", "podcast", "tiktok", "reel", "unknown")
    assert "originalUrl" in data and isinstance(data["originalUrl"], str)
    assert "normalizedId" in data  # can be null
    assert "articleId" in data  # can be null
    assert "title" in data  # can be null


# ----- Media Transcript / Summary Ingestion Groundwork v1 -----


def test_media_interpretation_returns_200_with_summary_and_transcript():
    """Media URL with fixture interpretation returns 200 and payload shape."""
    r = client.get("/v1/media/interpretation", params={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"})
    assert r.status_code == 200
    data = r.json()
    assert "ref" in data
    assert data["ref"]["kind"] == "youtube"
    assert data["ref"]["normalizedId"] == "dQw4w9WgXcQ"
    assert "summaryBlocks" in data and isinstance(data["summaryBlocks"], list)
    assert len(data["summaryBlocks"]) >= 1
    assert "id" in data["summaryBlocks"][0] and "content" in data["summaryBlocks"][0]
    assert "transcriptBlocks" in data and isinstance(data["transcriptBlocks"], list)
    assert len(data["transcriptBlocks"]) >= 1
    assert "id" in data["transcriptBlocks"][0] and "content" in data["transcriptBlocks"][0]


def test_media_interpretation_podcast_returns_200():
    """Podcast URL with fixture interpretation returns 200."""
    r = client.get(
        "/v1/media/interpretation",
        params={"url": "https://podcasts.apple.com/podcast/episode/123"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["ref"]["kind"] == "podcast"
    assert len(data.get("summaryBlocks") or []) >= 1
    assert len(data.get("transcriptBlocks") or []) >= 1


def test_media_interpretation_unmapped_media_returns_404():
    """Recognized media without interpretation fixture returns 404."""
    r = client.get(
        "/v1/media/interpretation",
        params={"url": "https://www.tiktok.com/@user/video/1234567890123456789"},
    )
    assert r.status_code == 404


def test_media_interpretation_non_media_returns_404():
    """Non-media URL returns 404."""
    r = client.get("/v1/media/interpretation", params={"url": "https://example.com/page"})
    assert r.status_code == 404


def test_media_interpretation_payload_shape():
    """Interpretation response has ref, summaryBlocks, transcriptBlocks; blocks have required fields."""
    r = client.get("/v1/media/interpretation", params={"url": "https://youtu.be/jNQXAC9IVRw"})
    assert r.status_code == 200
    data = r.json()
    assert "ref" in data and "kind" in data["ref"] and "originalUrl" in data["ref"]
    for b in data.get("summaryBlocks") or []:
        assert "id" in b and "content" in b
    for b in data.get("transcriptBlocks") or []:
        assert "id" in b and "content" in b
    for c in data.get("claims") or []:
        assert "id" in c and "text" in c and "claimType" in c


def test_media_interpretation_includes_claims_with_valid_shape():
    """Claim Extraction from Media v1: interpretation can include claims with id, text, claimType, confidence, support."""
    r = client.get("/v1/media/interpretation", params={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"})
    assert r.status_code == 200
    data = r.json()
    claims = data.get("claims") or []
    assert len(claims) >= 1
    for c in claims:
        assert "id" in c and isinstance(c["id"], str)
        assert "text" in c and isinstance(c["text"], str)
        assert "claimType" in c and c["claimType"] in (
            "verified_fact", "synthesized_claim", "interpretation", "opinion", "anecdote",
            "speculation", "conspiracy_claim", "advertisement", "satire_or_joke", "disputed_claim",
        )
        assert "sourceCount" in c and isinstance(c["sourceCount"], int)
        if c.get("confidence") is not None:
            assert c["confidence"] in ("high", "medium", "low")
        if c.get("support") is not None:
            assert c["support"] in ("direct", "inference", "interpretation", "speculation")


def test_media_interpretation_claims_use_valid_confidence_support():
    """Media claims use valid confidence and support values from the epistemic model."""
    from app.models import ConfidenceLevel, ClaimSupport

    r = client.get("/v1/media/interpretation", params={"url": "https://podcasts.apple.com/podcast/episode/123"})
    assert r.status_code == 200
    data = r.json()
    for c in data.get("claims") or []:
        if c.get("confidence"):
            assert c["confidence"] in [e.value for e in ConfidenceLevel]
        if c.get("support"):
            assert c["support"] in [e.value for e in ClaimSupport]


def test_media_interpretation_without_claims_returns_valid_payload():
    """Interpretation for media with no claims fixture still returns 200 and valid shape (claims absent or empty)."""
    r = client.get(
        "/v1/media/interpretation",
        params={"url": "https://podcasts.apple.com/podcast/episode/456"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "ref" in data and data["ref"]["kind"] == "podcast"
    assert len(data.get("summaryBlocks") or []) >= 1
    assert data.get("claims") is None or data.get("claims") == [] or len(data.get("claims")) == 0


def test_media_interpretation_includes_support_status_by_claim_id():
    """Verify-from-Media v1: interpretation with claims includes supportStatusByClaimId when fixture has it."""
    r = client.get(
        "/v1/media/interpretation",
        params={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "claims" in data and len(data["claims"]) >= 1
    assert "supportStatusByClaimId" in data
    status_by_id = data["supportStatusByClaimId"]
    assert isinstance(status_by_id, dict)
    for c in data["claims"]:
        cid = c["id"]
        assert cid in status_by_id
        assert status_by_id[cid] in ("interpretation_only", "no_support_yet", "support_available")


def test_media_verification_returns_200_with_bundle():
    """GET /v1/media/verification returns 200 with claims and supportStatusByClaimId for media URL with interpretation."""
    r = client.get(
        "/v1/media/verification",
        params={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "claims" in data and len(data["claims"]) >= 1
    assert "supportStatusByClaimId" in data
    assert "sources" in data
    assert isinstance(data["sources"], list)


def test_media_verification_returns_404_for_non_media():
    """GET /v1/media/verification returns 404 for non-media URL."""
    r = client.get("/v1/media/verification", params={"url": "https://example.com/page"})
    assert r.status_code == 404


def test_media_verification_bundle_support_available_includes_sources():
    """For media with support_available claim, verification bundle includes sources and evidence."""
    r = client.get(
        "/v1/media/verification",
        params={"url": "https://podcasts.apple.com/podcast/episode/123"},
    )
    assert r.status_code == 200
    data = r.json()
    assert len(data.get("claims") or []) >= 1
    assert data["supportStatusByClaimId"].get("mc-p1") == "support_available"
    assert len(data.get("sources") or []) >= 1
    assert "claimToSources" in data and "mc-p1" in data["claimToSources"]
    assert len(data["claimToSources"]["mc-p1"]) >= 1


# ----- Organization/Company Profile v1 -----

VALID_ORG_KINDS = {"company", "publisher", "network", "regulator", "insurer", "pharma", "nonprofit", "unknown"}


def test_organization_profile_returns_200_with_valid_shape():
    """GET /v1/organizations/{id} returns 200 with OrganizationProfile shape."""
    r = client.get("/v1/organizations/org-epa")
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == "org-epa"
    assert data["name"]
    assert data["kind"] in VALID_ORG_KINDS
    assert "summary" in data
    assert isinstance(data.get("notableProducts"), (list, type(None)))
    assert isinstance(data.get("notes"), (list, type(None)))


def test_organization_profile_unknown_id_returns_404():
    """GET /v1/organizations/{id} returns 404 for unknown id."""
    r = client.get("/v1/organizations/nonexistent-org-id")
    assert r.status_code == 404


def test_media_resolve_includes_organization_id_when_fixture_has_it():
    """Media resolve returns organizationId for podcast episode 123."""
    r = client.get(
        "/v1/media/resolve",
        params={"url": "https://podcasts.apple.com/podcast/episode/123"},
    )
    assert r.status_code == 200
    assert r.json().get("organizationId") == "org-podcast-demo"


def test_verification_bundle_sources_include_organization_id():
    """Article verification bundle sources include organizationId when fixture has it."""
    r = client.get("/v1/verification/article/article-coffee")
    assert r.status_code == 200
    sources = r.json().get("sources") or []
    assert len(sources) >= 1
    org_ids = [s.get("organizationId") for s in sources if s.get("organizationId")]
    assert len(org_ids) >= 1
    r2 = client.get(f"/v1/organizations/{org_ids[0]}")
    assert r2.status_code == 200


VALID_LINKED_ITEM_KINDS = {"product", "medication", "brand", "service", "media_property", "unknown"}


def test_organization_profile_includes_linked_items_when_present():
    """Organization profile returns linkedItems array when fixture has them."""
    r = client.get("/v1/organizations/org-uhaul")
    assert r.status_code == 200
    data = r.json()
    assert "linkedItems" in data
    items = data.get("linkedItems") or []
    assert len(items) >= 1
    for item in items:
        assert "id" in item and "name" in item and "kind" in item
        assert item["kind"] in VALID_LINKED_ITEM_KINDS


def test_organization_profile_linked_item_with_article_id():
    """Linked item with articleId can resolve to existing article."""
    r = client.get("/v1/organizations/org-uhaul")
    assert r.status_code == 200
    items = r.json().get("linkedItems") or []
    with_article = [i for i in items if i.get("articleId")]
    assert len(with_article) >= 1
    article_id = with_article[0]["articleId"]
    r2 = client.get(f"/v1/articles/{article_id}")
    assert r2.status_code == 200


def test_organization_profile_without_linked_items_valid():
    """Profile without linked items (e.g. org-epa) still returns valid shape."""
    r = client.get("/v1/organizations/org-epa")
    assert r.status_code == 200
    data = r.json()
    assert data.get("linkedItems") is None or data.get("linkedItems") == []


def test_organization_profile_pharma_linked_medication_context():
    """org-pharma-demo has medication-style linked item for context-only demo."""
    r = client.get("/v1/organizations/org-pharma-demo")
    assert r.status_code == 200
    data = r.json()
    assert data["kind"] == "pharma"
    items = data.get("linkedItems") or []
    assert len(items) >= 1
    med = next((i for i in items if i.get("kind") == "medication"), None)
    assert med is not None
    assert "name" in med and "summary" in med


# ----- Organization-to-Claim/Source Cross-Linking v1 -----


def test_organization_profile_includes_related_sources_when_present():
    """Profile includes relatedSources when fixture has them; each has id and title."""
    r = client.get("/v1/organizations/org-recycling-today")
    assert r.status_code == 200
    data = r.json()
    assert "relatedSources" in data
    sources = data.get("relatedSources") or []
    assert len(sources) >= 1
    for s in sources:
        assert "id" in s and "title" in s
    ids = [s["id"] for s in sources]
    assert "src-1" in ids


def test_organization_profile_related_source_ids_resolve_to_valid_sources():
    """Related source ids in profile resolve to valid GET /v1/sources/:id."""
    r = client.get("/v1/organizations/org-epa")
    assert r.status_code == 200
    sources = r.json().get("relatedSources") or []
    for s in sources:
        r2 = client.get(f"/v1/sources/{s['id']}")
        assert r2.status_code == 200
        assert r2.json().get("title") == s["title"]


def test_organization_profile_includes_related_claims_when_present():
    """Profile includes relatedClaims when fixture has them; each has id, text, optional confidence."""
    r = client.get("/v1/organizations/org-recycling-today")
    assert r.status_code == 200
    data = r.json()
    assert "relatedClaims" in data
    claims = data.get("relatedClaims") or []
    assert len(claims) >= 1
    for c in claims:
        assert "id" in c and "text" in c
    ids = [c["id"] for c in claims]
    assert "claim-1" in ids or "claim-3" in ids or "claim-6" in ids


def test_organization_profile_related_claim_ids_resolve_to_valid_claims():
    """Related claim ids in profile resolve to valid GET /v1/claims/:id."""
    r = client.get("/v1/organizations/org-uhaul")
    assert r.status_code == 200
    claims = r.json().get("relatedClaims") or []
    for c in claims:
        r2 = client.get(f"/v1/claims/{c['id']}")
        assert r2.status_code == 200
        assert r2.json().get("text") == c["text"]


def test_organization_profile_without_related_sources_unchanged():
    """Profile without related sources (e.g. org-pharma-demo) has empty or absent relatedSources."""
    r = client.get("/v1/organizations/org-pharma-demo")
    assert r.status_code == 200
    data = r.json()
    # org-pharma-demo is not in ORG_RELATED_SOURCE_IDS so relatedSources should be empty/absent
    sources = data.get("relatedSources")
    assert sources is None or sources == []


# ----- Audio Recognition Groundwork v1 -----


def test_audio_recognize_result_shape():
    """POST /v1/audio/recognize returns AudioRecognitionResult with kind, title, optional articleId/mediaUrl/organizationId."""
    r = client.post("/v1/audio/recognize", json={"clipId": "sample-song"})
    assert r.status_code == 200
    data = r.json()
    assert data.get("kind") == "song"
    assert "title" in data
    assert data.get("articleId") == "article-coffee"
    assert "confidence" in data or data.get("confidence") is None


def test_audio_recognize_fixture_mapping_by_clip_id():
    """Fixture-backed recognition: known clipIds return correct routing targets."""
    # sample-song -> articleId
    r = client.post("/v1/audio/recognize", json={"clipId": "sample-song"})
    assert r.status_code == 200
    assert r.json().get("articleId") == "article-coffee"
    # sample-podcast -> mediaUrl + organizationId
    r2 = client.post("/v1/audio/recognize", json={"clipId": "sample-podcast"})
    assert r2.status_code == 200
    j = r2.json()
    assert "mediaUrl" in j and j["mediaUrl"]
    assert j.get("organizationId") == "org-podcast-demo"
    # sample-org-only -> organizationId only
    r3 = client.post("/v1/audio/recognize", json={"clipId": "sample-org-only"})
    assert r3.status_code == 200
    assert r3.json().get("organizationId") == "org-uhaul"
    assert r3.json().get("articleId") is None


def test_audio_recognize_stub_uri_form():
    """Stub URI form stub://audio/<clipId> resolves to same fixture."""
    r = client.post("/v1/audio/recognize", json={"uri": "stub://audio/sample-show-theme"})
    assert r.status_code == 200
    assert r.json().get("articleId") == "article-uhaul"


def test_audio_recognize_tv_show_result_shape():
    """TV/Show Recognition v1: sample-tv-show returns kind tv_show with networkOrPlatform and notableCast."""
    r = client.post("/v1/audio/recognize", json={"clipId": "sample-tv-show"})
    assert r.status_code == 200
    data = r.json()
    assert data.get("kind") == "tv_show"
    assert data.get("title")
    assert data.get("networkOrPlatform") == "Demo Network"
    assert data.get("notableCast") == ["Host One", "Host Two"]
    assert data.get("articleId") == "article-uhaul"
    assert data.get("organizationId") == "org-uhaul"


def test_audio_recognize_show_theme_has_show_context():
    """TV/Show v1: sample-show-theme can include networkOrPlatform and notableCast."""
    r = client.post("/v1/audio/recognize", json={"clipId": "sample-show-theme"})
    assert r.status_code == 200
    data = r.json()
    assert data.get("kind") == "show_theme"
    assert data.get("networkOrPlatform") == "Demo Network"
    assert data.get("notableCast") == ["Fixture Actor A"]


def test_audio_recognize_unknown_returns_404():
    """Unknown clipId or uri returns 404 with calm message."""
    r = client.post("/v1/audio/recognize", json={"clipId": "unknown-clip-xyz"})
    assert r.status_code == 404
    assert "No Rabbit Hole match" in (r.json().get("detail") or "")


def test_audio_recognize_recorded_clip_returns_404():
    """Real microphone capture v1: recorded clips send placeholder token; backend returns no match (no fingerprinting)."""
    r = client.post("/v1/audio/recognize", json={"clipId": "recorded"})
    assert r.status_code == 404
    r2 = client.post("/v1/audio/recognize", json={"uri": "recorded://local"})
    assert r2.status_code == 404
    r3 = client.post("/v1/audio/recognize", json={"uri": "file:///path/to/recording.m4a"})
    assert r3.status_code == 404


def test_audio_recognize_empty_body_returns_404():
    """Empty or missing clipId/uri returns 404."""
    r = client.post("/v1/audio/recognize", json={})
    assert r.status_code == 404


def test_audio_recognize_accepts_optional_location_context():
    """Location Context v1: POST /v1/audio/recognize accepts optional location; behavior unchanged."""
    r = client.post(
        "/v1/audio/recognize",
        json={
            "clipId": "sample-song",
            "location": {"latitude": 40.7, "longitude": -74.0, "accuracy": "precise"},
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert data.get("articleId") == "article-coffee"
    assert data.get("kind") == "song"


# ----- Lens Analytics v1: backend event capture -----


def test_analytics_post_accepts_valid_event():
    """POST /v1/analytics/events accepts a valid event array."""
    payload = [
        {
            "id": "evt-test-1",
            "name": "article_opened",
            "occurredAt": "2025-01-15T12:00:00.000Z",
            "properties": {"source": "search", "articleId": "article-coffee"},
        }
    ]
    r = client.post("/v1/analytics/events", json=payload)
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_analytics_post_accepts_multiple_events():
    """POST /v1/analytics/events accepts multiple events."""
    payload = [
        {"id": "e1", "name": "search_executed", "occurredAt": "2025-01-15T12:00:00Z", "properties": {"queryLength": 5, "resultCount": 2}},
        {"id": "e2", "name": "search_result_selected", "occurredAt": "2025-01-15T12:00:01Z", "properties": {"source": "search", "articleId": "art-1"}},
    ]
    r = client.post("/v1/analytics/events", json=payload)
    assert r.status_code == 200


def test_analytics_post_rejects_invalid_event_name():
    """Invalid event name returns 422."""
    payload = [{"id": "e1", "name": "invalid_event", "occurredAt": "2025-01-15T12:00:00Z"}]
    r = client.post("/v1/analytics/events", json=payload)
    assert r.status_code == 422


def test_analytics_post_rejects_invalid_property_value():
    """Property value must be string, number, boolean, or null."""
    payload = [
        {"id": "e1", "name": "article_opened", "occurredAt": "2025-01-15T12:00:00Z", "properties": {"source": ["array"]}}
    ]
    r = client.post("/v1/analytics/events", json=payload)
    assert r.status_code == 422


def test_analytics_get_returns_recent_events():
    """GET /v1/analytics/events returns recent events (debug endpoint)."""
    client.post("/v1/analytics/events", json=[{"id": "evt-debug", "name": "lookup_confirmed", "occurredAt": "2025-01-15T12:00:00Z", "properties": {"segmentId": "seg-1"}}])
    r = client.get("/v1/analytics/events?limit=10")
    assert r.status_code == 200
    data = r.json()
    assert "events" in data
    assert isinstance(data["events"], list)
    recent = [e for e in data["events"] if e.get("id") == "evt-debug"]
    assert len(recent) >= 1
    assert recent[0]["name"] == "lookup_confirmed"
    assert recent[0]["properties"]["segmentId"] == "seg-1"
