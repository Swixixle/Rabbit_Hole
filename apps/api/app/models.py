"""
Pydantic models mirroring @rabbit-hole/contracts. Keep in sync with packages/contracts/src.
"""
from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field, model_validator


class NodeType(str, Enum):
    object = "object"
    product = "product"
    place = "place"
    organization = "organization"
    person = "person"
    event = "event"
    law = "law"
    legal_case = "legal_case"
    institution = "institution"
    source = "source"
    other = "other"


class ClaimType(str, Enum):
    verified_fact = "verified_fact"
    synthesized_claim = "synthesized_claim"
    interpretation = "interpretation"
    opinion = "opinion"
    anecdote = "anecdote"
    speculation = "speculation"
    conspiracy_claim = "conspiracy_claim"
    advertisement = "advertisement"
    satire_or_joke = "satire_or_joke"
    disputed_claim = "disputed_claim"


class SourceType(str, Enum):
    gov = "gov"
    academic = "academic"
    news = "news"
    social = "social"
    other = "other"


class ConfidenceLevel(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class ClaimSupport(str, Enum):
    direct = "direct"
    inference = "inference"
    interpretation = "interpretation"
    speculation = "speculation"


class Node(BaseModel):
    id: str
    name: str
    nodeType: NodeType
    slug: Optional[str] = None
    displayLabel: Optional[str] = None
    imageUrl: Optional[str] = None  # optional for search result thumbnails


class Claim(BaseModel):
    id: str
    text: str
    claimType: ClaimType
    confidence: Optional[ConfidenceLevel] = None
    sourceCount: int
    support: Optional[ClaimSupport] = None


class Source(BaseModel):
    id: str
    type: SourceType
    title: str
    publisher: Optional[str] = None
    organizationId: Optional[str] = None  # Organization/Company Profile v1
    contentHash: Optional[str] = None
    retrievedAt: Optional[str] = None
    excerpt: Optional[str] = None


class EvidenceSpan(BaseModel):
    id: str
    claimId: str
    sourceId: str
    excerpt: Optional[str] = None


class ArticleBlock(BaseModel):
    text: str
    claimIds: Optional[list[str]] = None
    blockType: Optional[str] = None  # identification | summary | context | content


class Article(BaseModel):
    id: str
    nodeId: str
    title: str
    nodeType: NodeType
    blocks: list[ArticleBlock]
    relatedNodeIds: Optional[list[str]] = None
    questionIds: Optional[list[str]] = None
    experience: Optional["ArticleExperience"] = None


class ExperienceStep(BaseModel):
    id: str
    label: str
    shortTitle: str
    description: Optional[str] = None
    relatedBlockIds: Optional[list[str]] = None
    relatedClaimIds: Optional[list[str]] = None
    kind: Optional[str] = None  # stage | failure_point | decision | handoff


class ArticleExperience(BaseModel):
    mode: str  # lifecycle | system_path
    steps: list[ExperienceStep]


class Question(BaseModel):
    id: str
    text: str
    category: Optional[str] = None


class TraceNodeRef(BaseModel):
    nodeId: str
    name: str


class TracePreview(BaseModel):
    path: list[TraceNodeRef]
    traceType: Optional[str] = None
    label: str


class ImageSegment(BaseModel):
    segmentId: str
    label: str
    confidence: float | ConfidenceLevel
    nodeId: Optional[str] = None
    bbox: Optional[dict[str, float]] = None  # normalized 0-1: x, y, width, height


class JobStatusEnum(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class JobStatus(BaseModel):
    jobId: str
    status: JobStatusEnum
    resultId: Optional[str] = None


# Response wrappers
class UploadResponse(BaseModel):
    uploadId: str
    imageUri: Optional[str] = None
    jobId: Optional[str] = None


class PageExtractTextResponse(BaseModel):
    """OCR / Page Capture: extracted text and optional confidence. Used by POST /v1/page/extract-text."""
    text: str
    confidence: Optional[str] = None  # high | medium | low


class ExploreImageResponse(BaseModel):
    jobId: Optional[str] = None
    segments: Optional[list[ImageSegment]] = None
    ecologicalEntity: Optional["EcologicalEntity"] = None  # Ecological Identification Groundwork v1


class EcologicalEntityKind(str, Enum):
    """Ecological Identification Groundwork v1."""
    plant = "plant"
    tree = "tree"
    insect = "insect"
    fungus = "fungus"
    bird = "bird"
    animal = "animal"
    ecosystem_feature = "ecosystem_feature"
    unknown = "unknown"


class EcologicalEntity(BaseModel):
    """Lightweight ecological entity (plant, wildlife, fungus, etc.). No medical advice; safety notes are general awareness only."""
    id: str
    name: str
    kind: str  # EcologicalEntityKind value
    summary: Optional[str] = None
    seasonalNotes: Optional[list[str]] = None
    safetyNotes: Optional[list[str]] = None
    articleId: Optional[str] = None


class LocationContext(BaseModel):
    """Location Context Groundwork v1: optional context for recognition. Accepted but not used algorithmically in v1."""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[str] = None  # approximate | precise


class ExploreImageRequestBody(BaseModel):
    """Request body for POST /v1/explore/image. Optional location (accepted, not used in v1)."""
    uploadId: Optional[str] = None
    location: Optional[LocationContext] = None


class ExploreTapResponse(BaseModel):
    candidates: list[ImageSegment]
    articleId: Optional[str] = None


class ExploreTapRequestBody(BaseModel):
    uploadId: Optional[str] = None
    imageUri: Optional[str] = None
    segmentId: Optional[str] = None
    x: Optional[float] = None
    y: Optional[float] = None
    tapXNorm: Optional[float] = None  # normalized 0-1, used for coordinate-aware resolution
    tapYNorm: Optional[float] = None


class VerificationResponse(BaseModel):
    sources: list[Source]
    claims: Optional[list[Claim]] = None
    evidenceSpans: Optional[list[EvidenceSpan]] = None
    claimToSources: Optional[dict[str, list[str]]] = None  # claimId -> sourceIds
    claimToEvidence: Optional[dict[str, list[dict]]] = None  # claimId -> evidence span dicts
    supportStatusByClaimId: Optional[dict[str, str]] = None  # claimId -> support_status label


class TracesResponse(BaseModel):
    traces: list[TracePreview]


class SearchResult(BaseModel):
    """Lens Surface v1: one search hit."""
    nodeId: str
    articleId: Optional[str] = None
    title: str
    summary: Optional[str] = None
    imageUrl: Optional[str] = None
    matchReason: Optional[str] = None  # title | alias | keyword


# Market Surface v1
class MarketCategory(str, Enum):
    shopping = "shopping"
    restaurants = "restaurants"
    healthier_alternative = "healthier_alternative"
    vehicle_safety = "vehicle_safety"
    medical_info = "medical_info"


class MarketItem(BaseModel):
    id: str
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    category: MarketCategory
    actionLabel: Optional[str] = None
    destinationType: Optional[str] = None  # internal | external | search
    destinationValue: Optional[str] = None
    warning: Optional[str] = None
    tags: Optional[list[str]] = None


class ArticleMarket(BaseModel):
    title: Optional[str] = None
    intro: Optional[str] = None
    items: list[MarketItem]


# ----- Lens Analytics v1: event capture -----

ANALYTICS_EVENT_NAMES = frozenset({
    "image_segment_selected",
    "image_tap_miss",
    "lookup_confirmed",
    "lookup_candidates_shown",
    "lookup_candidate_selected",
    "article_opened",
    "search_executed",
    "search_result_selected",
    "share_intake_opened",
    "share_intake_resolved",
    "market_item_selected",
    "history_item_opened",
    "page_capture_completed",
    "audio_recognized",
})


def _is_valid_property_value(v: Any) -> bool:
    if v is None:
        return True
    if isinstance(v, bool):
        return True
    if isinstance(v, (int, float)):
        return True
    if isinstance(v, str):
        return True
    return False


class AnalyticsEvent(BaseModel):
    """Single analytics event; validated for allowed name and property types."""
    id: str
    name: str
    occurredAt: str
    properties: Optional[dict[str, Any]] = None

    @model_validator(mode="after")
    def validate_name_and_properties(self) -> "AnalyticsEvent":
        if self.name not in ANALYTICS_EVENT_NAMES:
            raise ValueError(f"Invalid event name: {self.name}")
        if self.properties is not None:
            for k, v in self.properties.items():
                if not _is_valid_property_value(v):
                    raise ValueError(f"Invalid property value for {k}")
        return self


# ----- Page-to-Study Groundwork v1 -----

STUDY_BLOCK_KINDS = frozenset({
    "overview",
    "explain_simple",
    "key_points",
    "why_it_matters",
    "common_confusion",
    "study_questions",
})


class StudyBlock(BaseModel):
    id: str
    kind: str
    title: str
    content: str
    bulletItems: Optional[list[str]] = None

    @model_validator(mode="after")
    def validate_kind(self) -> "StudyBlock":
        if self.kind not in STUDY_BLOCK_KINDS:
            raise ValueError(f"Invalid study block kind: {self.kind}")
        return self


class ArticleStudyGuide(BaseModel):
    title: Optional[str] = None
    intro: Optional[str] = None
    blocks: list[StudyBlock]


# ----- Media Lens Groundwork v1 -----

MEDIA_KINDS = frozenset({"youtube", "podcast", "tiktok", "reel", "unknown"})


class MediaReference(BaseModel):
    """Result of resolving a media URL: kind, optional normalizedId and articleId. Organization Profile v1: optional organizationId."""
    kind: str
    originalUrl: str
    normalizedId: Optional[str] = None
    title: Optional[str] = None
    articleId: Optional[str] = None
    organizationId: Optional[str] = None

    @model_validator(mode="after")
    def validate_kind(self) -> "MediaReference":
        if self.kind not in MEDIA_KINDS:
            raise ValueError(f"Invalid media kind: {self.kind}")
        return self


# ----- Media Transcript / Summary Ingestion Groundwork v1 -----


class MediaSummaryBlock(BaseModel):
    id: str
    title: Optional[str] = None
    content: str


class MediaTranscriptBlock(BaseModel):
    id: str
    speaker: Optional[str] = None
    content: str
    startMs: Optional[int] = None


class MediaInterpretation(BaseModel):
    """Fixture-backed summary and/or transcript for a resolved media item. Optional claims (Claim Extraction from Media v1). Verify-from-Media v1: optional supportStatusByClaimId."""
    ref: MediaReference
    summaryBlocks: Optional[list[MediaSummaryBlock]] = None
    transcriptBlocks: Optional[list[MediaTranscriptBlock]] = None
    claims: Optional[list[Claim]] = None
    supportStatusByClaimId: Optional[dict[str, str]] = None


# ----- Organization/Company Profile v1 -----

class OrganizationKind(str, Enum):
    company = "company"
    publisher = "publisher"
    network = "network"
    regulator = "regulator"
    insurer = "insurer"
    pharma = "pharma"
    nonprofit = "nonprofit"
    unknown = "unknown"


class OrganizationLinkedItemKind(str, Enum):
    product = "product"
    medication = "medication"
    brand = "brand"
    service = "service"
    media_property = "media_property"
    unknown = "unknown"


class OrganizationLinkedItem(BaseModel):
    """Organization-to-Product/Med Linking v1: one product, med, brand, or media property linked to an org."""
    id: str
    name: str
    kind: OrganizationLinkedItemKind
    summary: Optional[str] = None
    articleId: Optional[str] = None
    notes: Optional[list[str]] = None


class OrganizationRelatedSource(BaseModel):
    """Organization-to-Claim/Source Cross-Linking v1: compact related source (id + title)."""
    id: str
    title: str


class OrganizationRelatedClaim(BaseModel):
    """Organization-to-Claim/Source Cross-Linking v1: compact related claim (id + text + optional confidence)."""
    id: str
    text: str
    confidence: Optional[str] = None  # high | medium | low


class OrganizationProfile(BaseModel):
    """Lightweight organization/company profile: who stands behind a source, media, or article."""
    id: str
    name: str
    kind: OrganizationKind
    summary: str
    description: Optional[str] = None
    notableProducts: Optional[list[str]] = None
    notableFigures: Optional[list[str]] = None
    relatedTopics: Optional[list[str]] = None
    ownershipNote: Optional[str] = None
    notes: Optional[list[str]] = None
    linkedItems: Optional[list[OrganizationLinkedItem]] = None
    relatedSources: Optional[list[OrganizationRelatedSource]] = None
    relatedClaims: Optional[list[OrganizationRelatedClaim]] = None


# ----- Audio Recognition Groundwork v1 -----

AUDIO_RECOGNITION_KINDS = frozenset({"song", "show_theme", "podcast", "media_clip", "tv_show", "unknown"})


class AudioRecognitionKind(str, Enum):
    song = "song"
    show_theme = "show_theme"
    podcast = "podcast"
    media_clip = "media_clip"
    tv_show = "tv_show"
    unknown = "unknown"


class AudioRecognitionResult(BaseModel):
    """Audio Recognition Groundwork v1: fixture-backed result; routes to article, media, or organization. TV/Show v1: optional show context."""
    kind: str
    title: str
    subtitle: Optional[str] = None
    articleId: Optional[str] = None
    mediaUrl: Optional[str] = None
    organizationId: Optional[str] = None
    confidence: Optional[str] = None
    networkOrPlatform: Optional[str] = None
    notableCast: Optional[list[str]] = None

    @model_validator(mode="after")
    def validate_kind(self) -> "AudioRecognitionResult":
        if self.kind not in AUDIO_RECOGNITION_KINDS:
            raise ValueError(f"Invalid audio recognition kind: {self.kind}")
        return self


class AudioRecognizeRequestBody(BaseModel):
    """Request body for POST /v1/audio/recognize. clipId/uri = stub identifier; optional location (accepted, not used in v1)."""
    clipId: Optional[str] = None
    uri: Optional[str] = None
    location: Optional[LocationContext] = None


class VisionRecognitionResponse(BaseModel):
    """Rabbit Hole v15/v17: vision region recognition. Recognition only; no claims/sources. v17: optional specificity cues."""
    label: str
    candidateType: str  # entity | product | landmark | topic | media
    confidence: Optional[float] = None
    alternativeLabels: Optional[list[str]] = None
    visualDescription: Optional[str] = None
    specificityHint: Optional[str] = None
    likelyVariant: Optional[str] = None
    observedText: Optional[list[str]] = None
    lineageHints: Optional[list[str]] = None


# ----- v17: Generate provisional node (no sources) -----


class GenerateNodeClaimItem(BaseModel):
    text: str
    claimKind: str  # identity | material | functional | comparative | contextual
    confidence: Optional[float] = None


class GenerateNodeRelationItem(BaseModel):
    label: str
    relationType: str  # is_a | part_of | made_of | related_to | alternative_to | used_for | produced_by
    confidence: Optional[float] = None


class GenerateNodeRequestBody(BaseModel):
    """Request for POST /v1/knowledge/generate-node. v17: optional specificity from recognition."""
    label: str
    candidateType: str = "entity"  # entity | product | landmark | topic | media
    alternativeLabels: Optional[list[str]] = None
    confidence: Optional[float] = None
    visualDescription: Optional[str] = None
    specificityHint: Optional[str] = None
    likelyVariant: Optional[str] = None
    observedText: Optional[list[str]] = None
    lineageHints: Optional[list[str]] = None


class GenerateNodeResponseBody(BaseModel):
    """Response: minimal provisional node package. No sources."""
    title: str
    description: str
    nodeKind: str  # entity | product | landmark | topic | media
    claims: list[GenerateNodeClaimItem]
    suggestedRelations: Optional[list[GenerateNodeRelationItem]] = None
