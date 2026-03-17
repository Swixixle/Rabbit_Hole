"""
v0 API routes. Stubbed responses, contract-aligned shapes.
Tap resolution is coordinate-aware via app.region_resolution (fixture-backed).
"""
import logging
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, UploadFile, Body, File, Form

_log = logging.getLogger(__name__)

from app.claim_epistemic import enrich_claim
from app.fixtures import (
    get_article_by_id,
    get_article_by_node_id,
    get_claim,
    get_experience_for_article,
    get_questions_for_article,
    get_sources_for_article,
    get_source,
    get_traces_for_node,
    get_verification_bundle,
    search_articles,
    get_article_market,
    get_article_study,
    resolve_media,
    get_media_interpretation,
    get_media_verification_bundle,
    get_organization_profile,
    get_related_sources_for_org,
    get_related_claims_for_org,
    recognize_audio_clip,
    get_ecological_entity_for_segment,
)
from app.models import (
    Article,
    Claim,
    EvidenceSpan,
    ExploreImageResponse,
    ExploreImageRequestBody,
    ExploreTapResponse,
    ExploreTapRequestBody,
    ImageSegment,
    Source,
    UploadResponse,
    VerificationResponse,
    TracesResponse,
    SearchResult,
    ArticleMarket,
    ArticleStudyGuide,
    MediaReference,
    MediaInterpretation,
    OrganizationProfile,
    AnalyticsEvent,
    AudioRecognitionResult,
    AudioRecognizeRequestBody,
    EcologicalEntity,
    PageExtractTextResponse,
    VisionRecognitionResponse,
    GenerateNodeRequestBody,
    GenerateNodeResponseBody,
    GenerateNodeClaimItem,
    GenerateNodeRelationItem,
)
from app.ocr import extract_text_from_image_bytes
from app.region_resolution import (
    get_regions_for_image,
    get_regions_with_bounds,
    resolve_tap,
)

router = APIRouter(prefix="/v1", tags=["v0"])

# In-memory stub: uploadId -> fake image ref (no real storage)
_uploads: dict[str, str] = {}

# Lens Analytics v1: in-memory event store (append-only, capped)
_ANALYTICS_MAX_EVENTS = 10_000
_analytics_events: list[dict[str, Any]] = []


def _append_analytics_events(events: list[AnalyticsEvent]) -> None:
    global _analytics_events
    for e in events:
        _analytics_events.append(e.model_dump())
    while len(_analytics_events) > _ANALYTICS_MAX_EVENTS:
        _analytics_events.pop(0)


@router.post("/media/upload", response_model=UploadResponse)
async def media_upload(file: UploadFile | None = None) -> dict[str, Any]:
    """Accept image; return uploadId and imageUri (stub). File optional for stub/demo."""
    if file is not None:
        ct = file.content_type or ""
        if not ct.startswith("image/"):
            raise HTTPException(status_code=400, detail="Invalid or missing image file")
    upload_id = str(uuid.uuid4())
    image_uri = f"stub://uploads/{upload_id}"
    _uploads[upload_id] = image_uri
    return UploadResponse(uploadId=upload_id, imageUri=image_uri)


@router.post("/page/extract-text", response_model=PageExtractTextResponse)
async def page_extract_text(file: UploadFile | None = File(None)) -> dict[str, Any]:
    """OCR / Page Capture: extract text from a page image. Returns { text, confidence }. If OCR unavailable or fails, returns empty text and low confidence."""
    if file is None:
        return PageExtractTextResponse(text="", confidence="low")
    ct = file.content_type or ""
    if not ct.startswith("image/"):
        return PageExtractTextResponse(text="", confidence="low")
    try:
        body = await file.read()
    except Exception:
        return PageExtractTextResponse(text="", confidence="low")
    text, confidence = extract_text_from_image_bytes(body)
    return PageExtractTextResponse(text=text, confidence=confidence)


@router.post("/explore/image", response_model=ExploreImageResponse)
async def explore_image(body: ExploreImageRequestBody | None = Body(None)) -> dict[str, Any]:
    """Return segments from region fixture. Optional location accepted (not used in v1). Ecological v1: when segments include an ecological fixture segment, include ecologicalEntity."""
    b = body.model_dump() if body else {}
    upload_id = b.get("uploadId") or ""
    segments = get_regions_for_image(upload_id)
    regions_with_bounds = get_regions_with_bounds(upload_id)
    # Attach bbox to each segment for UI overlay
    bbox_by_id = {r["segmentId"]: r["bbox"] for r in regions_with_bounds if "bbox" in r}
    out = []
    for s in segments:
        seg_dict = s.model_dump()
        if s.segmentId in bbox_by_id:
            seg_dict["bbox"] = bbox_by_id[s.segmentId]
        out.append(seg_dict)
    # Ecological Identification v1: if any segment maps to an ecological entity, attach the first one
    ecological_entity = None
    for s in segments:
        ent = get_ecological_entity_for_segment(s.segmentId)
        if ent is not None:
            ecological_entity = ent
            break
    return ExploreImageResponse(
        segments=[ImageSegment(**x) for x in out],
        ecologicalEntity=ecological_entity,
    )


@router.post("/explore/image/tap", response_model=ExploreTapResponse)
async def explore_image_tap(body: ExploreTapRequestBody | None = Body(None)) -> dict[str, Any]:
    """Resolve tap to candidate(s) using coordinate-aware region model. Uses tapXNorm/tapYNorm (0-1) or segmentId."""
    b = body.model_dump() if body else {}
    upload_id = b.get("uploadId") or ""
    segment_id_override = b.get("segmentId")
    tap_x = b.get("tapXNorm")
    tap_y = b.get("tapYNorm")
    x_legacy, y_legacy = b.get("x"), b.get("y")

    if segment_id_override is not None:
        result = resolve_tap(upload_id, 0.0, 0.0, segment_id_override=segment_id_override)
    elif tap_x is not None and tap_y is not None and 0 <= tap_x <= 1 and 0 <= tap_y <= 1:
        result = resolve_tap(upload_id, float(tap_x), float(tap_y))
    elif x_legacy is not None and y_legacy is not None:
        # Legacy: treat x,y as normalized if in [0,1], else normalize by 1000
        nx = float(x_legacy) if 0 <= x_legacy <= 1 else float(x_legacy) / 1000.0
        ny = float(y_legacy) if 0 <= y_legacy <= 1 else float(y_legacy) / 1000.0
        result = resolve_tap(upload_id, nx, ny)
    else:
        # No coordinates: return ambiguous (both regions) so user picks
        result = resolve_tap(upload_id, 0.45, 0.45)

    return ExploreTapResponse(
        candidates=result.candidates,
        articleId=result.article_id,
    )


@router.get("/articles/{article_id}", response_model=Article)
async def get_article(article_id: str) -> Article:
    """Fetch article by id. Includes experience (system path / lifecycle) when present."""
    article = get_article_by_id(article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    experience = get_experience_for_article(article_id)
    if experience is not None:
        return Article(**(article.model_dump() | {"experience": experience}))
    return article


@router.get("/articles/by-node/{node_id}", response_model=Article)
async def get_article_by_node(node_id: str) -> Article:
    """Fetch article by node id. Includes experience when present."""
    article = get_article_by_node_id(node_id)
    if not article:
        raise HTTPException(status_code=404, detail="No article for this node")
    experience = get_experience_for_article(article.id)
    if experience is not None:
        return Article(**(article.model_dump() | {"experience": experience}))
    return article


@router.get("/claims/{claim_id}")
async def get_claim_by_id(claim_id: str):
    """Claim detail for modal. Returns claim with support and confidence guaranteed (derived if missing)."""
    claim = get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return enrich_claim(claim)


@router.get("/sources/{source_id}")
async def get_source_by_id(source_id: str):
    """Source detail for snapshot info."""
    source = get_source(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return source


@router.get("/verification/article/{article_id}", response_model=VerificationResponse)
async def verification_article(article_id: str) -> VerificationResponse:
    """Verification bundle: claims, sources, evidence spans, and mappings for the Verify surface."""
    bundle = get_verification_bundle(article_id)
    sources = [Source(**s) for s in bundle["sources"]]
    claims = [Claim(**c) for c in bundle["claims"]]
    evidence_spans = [EvidenceSpan(**e) for e in bundle["evidenceSpans"]]
    return VerificationResponse(
        sources=sources,
        claims=claims,
        evidenceSpans=evidence_spans,
        claimToSources=bundle.get("claimToSources"),
        claimToEvidence=bundle.get("claimToEvidence"),
        supportStatusByClaimId=bundle.get("supportStatusByClaimId"),
    )


@router.get("/media/verification", response_model=VerificationResponse)
async def media_verification(url: str = "") -> VerificationResponse:
    """Verify-from-Media v1: verification bundle for a media URL (claims + support status + optional sources/evidence). 404 if not media or no interpretation."""
    bundle = get_media_verification_bundle(url)
    if not bundle:
        raise HTTPException(status_code=404, detail="No verification data for this media URL")
    sources = [Source(**s) for s in bundle["sources"]]
    claims = [Claim(**c) for c in bundle["claims"]]
    evidence_spans = [EvidenceSpan(**e) for e in bundle["evidenceSpans"]]
    return VerificationResponse(
        sources=sources,
        claims=claims,
        evidenceSpans=evidence_spans,
        claimToSources=bundle.get("claimToSources"),
        claimToEvidence=bundle.get("claimToEvidence"),
        supportStatusByClaimId=bundle.get("supportStatusByClaimId"),
    )


@router.get("/traces/{node_id}", response_model=TracesResponse)
async def traces_node(node_id: str) -> TracesResponse:
    """Trace preview for node. Empty list if none."""
    traces = get_traces_for_node(node_id)
    return TracesResponse(traces=traces)


@router.get("/articles/{article_id}/questions")
async def article_questions(article_id: str):
    """Suggested questions for article (v0 stub)."""
    questions = get_questions_for_article(article_id)
    return {"questions": questions}


@router.get("/search", response_model=list[SearchResult])
async def search(q: str = "") -> list[SearchResult]:
    """Lens Surface v1: case-insensitive search over articles/nodes. Returns compact result list."""
    raw = search_articles(q)
    return [SearchResult(**r) for r in raw]


@router.get("/articles/{article_id}/market", response_model=ArticleMarket)
async def article_market(article_id: str) -> ArticleMarket:
    """Market Surface v1: market data for an article. 404 if no market (do not show entry)."""
    market = get_article_market(article_id)
    if not market:
        raise HTTPException(status_code=404, detail="No market for this article")
    return market


@router.get("/articles/{article_id}/study", response_model=ArticleStudyGuide)
async def article_study(article_id: str) -> ArticleStudyGuide:
    """Page-to-Study Groundwork v1: study guide for an article. 404 if none (do not show Study entry)."""
    study = get_article_study(article_id)
    if not study:
        raise HTTPException(status_code=404, detail="No study guide for this article")
    return study


@router.get("/media/resolve", response_model=MediaReference)
async def media_resolve(url: str = "") -> MediaReference:
    """Media Lens Groundwork v1: resolve media URL to kind and optional articleId. 404 if not recognized as media."""
    result = resolve_media(url)
    if not result:
        raise HTTPException(status_code=404, detail="Not a recognized media URL")
    return result


@router.get("/organizations/{org_id}", response_model=OrganizationProfile)
async def organization_profile(org_id: str) -> OrganizationProfile:
    """Organization/Company Profile v1: lightweight profile by id. Includes related sources/claims when fixture-backed. 404 if not found."""
    profile = get_organization_profile(org_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Organization not found")
    related_sources = get_related_sources_for_org(org_id)
    related_claims = get_related_claims_for_org(org_id)
    return OrganizationProfile(
        **(profile.model_dump() | {
            "relatedSources": related_sources if related_sources else None,
            "relatedClaims": related_claims if related_claims else None,
        })
    )


@router.post("/vision/recognize-region", response_model=VisionRecognitionResponse)
async def vision_recognize_region(
    file: UploadFile | None = File(None),
    boundingBox: str = Form("{}"),
) -> VisionRecognitionResponse:
    """Rabbit Hole v16: recognize object in image region. Crops region, calls vision provider. 404 if no result."""
    from app.services.vision_provider import (
        crop_region_to_bytes,
        parse_bounding_box,
        recognize_cropped_region,
    )

    if file is None:
        raise HTTPException(status_code=400, detail="Missing image file")
    ct = file.content_type or ""
    if not ct.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid or missing image content type")
    try:
        image_bytes = await file.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to read image")
    if not image_bytes or len(image_bytes) < 10:
        raise HTTPException(status_code=400, detail="Image too small or empty")
    _log.info("vision/recognize-region: image received, size=%d", len(image_bytes))

    bbox = parse_bounding_box(boundingBox)
    if bbox is None:
        raise HTTPException(status_code=400, detail="Invalid or missing boundingBox")
    cropped = crop_region_to_bytes(image_bytes, bbox, ct)
    if cropped is None:
        _log.warning("vision/recognize-region: crop failed")
        raise HTTPException(status_code=422, detail="Could not crop region")
    _log.debug("vision/recognize-region: cropped size=%d", len(cropped))
    result = await recognize_cropped_region(cropped, ct)
    if result is None:
        _log.info("vision/recognize-region: no recognition result")
        raise HTTPException(status_code=404, detail="Could not recognize object")
    return VisionRecognitionResponse(
        label=result.label,
        candidateType=result.candidateType,
        confidence=result.confidence,
        alternativeLabels=result.alternativeLabels or None,
        visualDescription=result.visualDescription or None,
        specificityHint=result.specificityHint or None,
        likelyVariant=result.likelyVariant or None,
        observedText=result.observedText or None,
        lineageHints=result.lineageHints or None,
    )


@router.post("/knowledge/generate-node", response_model=GenerateNodeResponseBody)
async def knowledge_generate_node(body: GenerateNodeRequestBody | None = Body(None)) -> GenerateNodeResponseBody:
    """Rabbit Hole v17: generate minimal provisional node for unmatched recognition. No sources."""
    from app.services.knowledge_generator import generate_node

    if body is None:
        raise HTTPException(status_code=400, detail="Missing request body")
    result = await generate_node(
        label=body.label,
        candidate_type=body.candidateType or "entity",
        alternative_labels=body.alternativeLabels,
        visual_description=body.visualDescription,
        specificity_hint=body.specificityHint,
        likely_variant=body.likelyVariant,
        observed_text=body.observedText,
        lineage_hints=body.lineageHints,
    )
    if result is None:
        raise HTTPException(status_code=503, detail="Could not generate provisional node")
    return GenerateNodeResponseBody(
        title=result["title"],
        description=result["description"],
        nodeKind=result["nodeKind"],
        claims=[GenerateNodeClaimItem(**c) for c in result["claims"]],
        suggestedRelations=[GenerateNodeRelationItem(**r) for r in result["suggestedRelations"]] if result.get("suggestedRelations") else None,
    )


@router.post("/audio/recognize", response_model=AudioRecognitionResult)
async def audio_recognize(body: AudioRecognizeRequestBody | None = Body(None)) -> AudioRecognitionResult:
    """Audio Recognition Groundwork v1: fixture-backed recognition by clipId or uri. 404 if no match. No real fingerprinting."""
    b = body.model_dump() if body else {}
    clip_id_or_uri = (b.get("clipId") or b.get("uri") or "").strip()
    result = recognize_audio_clip(clip_id_or_uri)
    if not result:
        raise HTTPException(status_code=404, detail="No Rabbit Hole match yet.")
    return AudioRecognitionResult(**result)


@router.get("/media/interpretation", response_model=MediaInterpretation)
async def media_interpretation(url: str = "") -> MediaInterpretation:
    """Media Transcript/Summary Groundwork v1: summary and transcript for a media URL. 404 if none."""
    result = get_media_interpretation(url)
    if not result:
        raise HTTPException(status_code=404, detail="No interpretation for this media URL")
    return result


# ----- Lens Analytics v1: event capture -----


@router.post("/analytics/events")
async def post_analytics_events(events: list[AnalyticsEvent] = Body(...)) -> dict[str, str]:
    """Accept one or more analytics events. Send as JSON array. Best-effort; no auth. In-memory store for v1."""
    if not events:
        return {"status": "ok"}
    _append_analytics_events(events)
    return {"status": "ok"}


@router.get("/analytics/events")
async def get_analytics_events(limit: int = 100) -> dict[str, Any]:
    """Debug only: return recent events from in-memory store. Not for production dashboards."""
    global _analytics_events
    n = min(max(1, limit), 500)
    return {"events": list(_analytics_events[-n:])}
