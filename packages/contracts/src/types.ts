/**
 * v0 minimal contract types. Align with docs/architecture/v0-contract-profile.md.
 * Deferred fields documented in comments.
 */

import type { ClaimType, NodeType, SourceType, JobStatusEnum, ConfidenceLevel, ClaimSupport } from './enums';

export interface Node {
  id: string;
  name: string;
  nodeType: NodeType;
  /** @deferred description, imageUrl, metadata, edges */
  slug?: string;
  displayLabel?: string;
}

export interface Claim {
  id: string;
  text: string;
  claimType: ClaimType;
  /** How strongly the system stands behind the claim. */
  confidence?: ConfidenceLevel;
  sourceCount: number;
  /** What kind of epistemic backing the claim has. Derived from claimType if omitted. */
  support?: ClaimSupport;
  /** @deferred evidenceSpanIds, linkedNodeIds, createdAt */
}

export interface Source {
  id: string;
  type: SourceType;
  title: string;
  publisher?: string;
  /** Organization/Company Profile v1: optional link to organization profile. */
  organizationId?: string;
  contentHash?: string;
  retrievedAt?: string; // ISO
  /** @deferred url, excerpt in list */
}

export interface EvidenceSpan {
  id: string;
  claimId: string;
  sourceId: string;
  excerpt?: string;
  /** @deferred offset, length */
}

export interface ArticleBlock {
  text: string;
  claimIds?: string[];
  /** Canonical assembly: identification | summary | context | content. Omit = content. */
  blockType?: 'identification' | 'summary' | 'context' | 'content';
}

export interface Article {
  id: string;
  nodeId: string;
  title: string;
  nodeType: NodeType;
  blocks: ArticleBlock[];
  relatedNodeIds?: string[];
  questionIds?: string[];
  /** Optional experience layer: system path or lifecycle steps. */
  experience?: ArticleExperience;
  /** @deferred tracePreviewId, generatedAt */
}

/** Single step in system path or lifecycle. relatedBlockIds = block indices as strings for v1. */
export interface ExperienceStep {
  id: string;
  label: string;
  shortTitle: string;
  description?: string;
  relatedBlockIds?: string[];
  relatedClaimIds?: string[];
  kind?: 'stage' | 'failure_point' | 'decision' | 'handoff';
}

export interface ArticleExperience {
  mode: 'lifecycle' | 'system_path';
  steps: ExperienceStep[];
}

/** Share payload for distribution layer. Used by Share Surface v1. */
export interface ArticleSharePayload {
  title: string;
  summary: string;
  url: string;
  teaser?: string;
  imageUrl?: string;
}

/** Lens Surface v1: one search hit for GET /v1/search. */
export interface SearchResult {
  nodeId: string;
  articleId?: string;
  title: string;
  summary?: string;
  imageUrl?: string;
  matchReason?: 'title' | 'alias' | 'keyword';
}

export interface Question {
  id: string;
  text: string;
  category?: string; // historical, scientific, legal, etc.
  /** @deferred linkedNodeIds */
}

export interface TraceNodeRef {
  nodeId: string;
  name: string;
}

export interface TracePreview {
  path: TraceNodeRef[];
  traceType?: string; // material, legal, etc.
  label: string;
}

export interface ImageSegment {
  segmentId: string;
  label: string;
  confidence: number | ConfidenceLevel;
  nodeId?: string;
  /** Normalized 0-1: { x, y, width, height } for region overlay; optional */
  bbox?: { x: number; y: number; width: number; height: number };
}

/** Alias for tap response candidate; same shape as ImageSegment for v0 */
export interface Candidate extends ImageSegment {}

export interface JobStatus {
  jobId: string;
  status: JobStatusEnum;
  resultId?: string; // articleId or nodeId when completed
  /** @deferred progress, errorCode */
}

// API request/response helpers
export interface UploadResponse {
  uploadId: string;
  imageUri?: string;
  jobId?: string;
}

export interface ExploreImageResponse {
  jobId?: string;
  segments?: ImageSegment[];
  /** Ecological Identification Groundwork v1: optional entity when image resolves to a natural object (plant, animal, etc.). */
  ecologicalEntity?: EcologicalEntity;
}

/** Ecological Identification Groundwork v1: kind of natural entity (fixture-backed). */
export type EcologicalEntityKind =
  | 'plant'
  | 'tree'
  | 'insect'
  | 'fungus'
  | 'bird'
  | 'animal'
  | 'ecosystem_feature'
  | 'unknown';

/** Ecological Identification Groundwork v1: lightweight entity for plants, wildlife, fungi, etc. No medical advice; safety notes are general awareness only. */
export interface EcologicalEntity {
  id: string;
  name: string;
  kind: EcologicalEntityKind;
  summary?: string;
  seasonalNotes?: string[];
  safetyNotes?: string[];
  articleId?: string;
}

export interface ExploreTapRequest {
  uploadId?: string;
  imageUri?: string;
  x?: number;
  y?: number;
  tapXNorm?: number;
  tapYNorm?: number;
  segmentId?: string;
}

export interface ExploreTapResponse {
  candidates: Candidate[];
  articleId?: string;
}

export interface VerificationResponse {
  sources: Source[];
  /** Claims referenced by the article (for Verify surface) */
  claims?: Claim[];
  /** Evidence spans linking claims to sources */
  evidenceSpans?: EvidenceSpan[];
  /** claimId -> sourceIds[] */
  claimToSources?: Record<string, string[]>;
  /** claimId -> evidence span objects */
  claimToEvidence?: Record<string, EvidenceSpan[]>;
  /** claimId -> support status label (supported_fact, interpretation, limited_support, etc.) */
  supportStatusByClaimId?: Record<string, string>;
}

export interface TracesResponse {
  traces: TracePreview[];
}

/** Market Surface v1: category for market items. */
export type MarketCategory =
  | 'shopping'
  | 'restaurants'
  | 'healthier_alternative'
  | 'vehicle_safety'
  | 'medical_info';

/** Market Surface v1: one actionable item (fixture-backed in v1). */
export interface MarketItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  category: MarketCategory;
  actionLabel?: string;
  destinationType?: 'internal' | 'external' | 'search';
  destinationValue?: string;
  /** Shown for medical_info and when present on item. */
  warning?: string;
  tags?: string[];
}

/** Market Surface v1: market data for an article. Optional; no entry point when absent. */
export interface ArticleMarket {
  title?: string;
  intro?: string;
  items: MarketItem[];
}

/** Media Lens Groundwork v1: result of resolving a media URL. */
export type MediaKind = 'youtube' | 'podcast' | 'tiktok' | 'reel' | 'unknown';

/** Organization/Company Profile v1: kind of institution. */
export type OrganizationKind =
  | 'company'
  | 'publisher'
  | 'network'
  | 'regulator'
  | 'insurer'
  | 'pharma'
  | 'nonprofit'
  | 'unknown';

/** Organization/Company Profile v1: lightweight profile for who stands behind a source, media, or article. */
export type OrganizationLinkedItemKind =
  | 'product'
  | 'medication'
  | 'brand'
  | 'service'
  | 'media_property'
  | 'unknown';

/** Organization-to-Product/Med Linking v1: one product, med, brand, or media property linked to an org. */
export interface OrganizationLinkedItem {
  id: string;
  name: string;
  kind: OrganizationLinkedItemKind;
  summary?: string;
  /** When set, client can navigate to this article. */
  articleId?: string;
  notes?: string[];
}

/** Organization-to-Claim/Source Cross-Linking v1: compact related source (id + title). */
export interface OrganizationRelatedSource {
  id: string;
  title: string;
}

/** Organization-to-Claim/Source Cross-Linking v1: compact related claim (id + text + optional confidence). */
export interface OrganizationRelatedClaim {
  id: string;
  text: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface OrganizationProfile {
  id: string;
  name: string;
  kind: OrganizationKind;
  summary: string;
  description?: string;
  notableProducts?: string[];
  notableFigures?: string[];
  relatedTopics?: string[];
  ownershipNote?: string;
  /** Carefully phrased, fixture-backed only; no speculative or defamatory content. */
  notes?: string[];
  /** Organization-to-Product/Med Linking v1: linked products, meds, brands, media. */
  linkedItems?: OrganizationLinkedItem[];
  /** Organization-to-Claim/Source Cross-Linking v1: related sources (associated with this org). */
  relatedSources?: OrganizationRelatedSource[];
  /** Organization-to-Claim/Source Cross-Linking v1: related claims (e.g. cited by org sources; not endorsement). */
  relatedClaims?: OrganizationRelatedClaim[];
}

export interface MediaReference {
  kind: MediaKind;
  originalUrl: string;
  normalizedId?: string;
  title?: string;
  articleId?: string;
  /** Organization/Company Profile v1: optional link to organization (e.g. network, publisher). */
  organizationId?: string;
}

/** Media Transcript/Summary Groundwork v1: one summary block. */
export interface MediaSummaryBlock {
  id: string;
  title?: string;
  content: string;
}

/** Media Transcript/Summary Groundwork v1: one transcript segment. */
export interface MediaTranscriptBlock {
  id: string;
  speaker?: string;
  content: string;
  startMs?: number;
}

/** Media Transcript/Summary Groundwork v1: ref + optional summary, transcript, and claims (Claim Extraction from Media v1). */
export interface MediaInterpretation {
  ref: MediaReference;
  summaryBlocks?: MediaSummaryBlock[];
  transcriptBlocks?: MediaTranscriptBlock[];
  /** Fixture-backed claims surfaced from this media; reuse Claim shape. */
  claims?: Claim[];
  /** Verify-from-Media v1: claimId -> support status (support_available, no_support_yet, interpretation_only). */
  supportStatusByClaimId?: Record<string, string>;
}

/** Audio Recognition Groundwork v1: kind of recognized audio (fixture-backed; no real fingerprinting). TV/Show v1: tv_show for show-style results. */
export type AudioRecognitionKind = 'song' | 'show_theme' | 'podcast' | 'media_clip' | 'tv_show' | 'unknown';

/** Audio Recognition Groundwork v1: result of recognizeAudioClip(uri). Routes to article, media, or organization. TV/Show v1: optional networkOrPlatform, notableCast. */
export interface AudioRecognitionResult {
  kind: AudioRecognitionKind;
  title: string;
  subtitle?: string;
  articleId?: string;
  mediaUrl?: string;
  organizationId?: string;
  confidence?: 'high' | 'medium' | 'low';
  /** TV/Show Recognition Groundwork v1: network or platform (e.g. "NBC", "Netflix"). */
  networkOrPlatform?: string;
  /** TV/Show Recognition Groundwork v1: notable cast (fixture-backed). */
  notableCast?: string[];
}

/** Location Context Groundwork v1: optional context enhancer for recognition. Not requested on launch; no background tracking. */
export type LocationContextAccuracy = 'approximate' | 'precise';

export interface LocationContext {
  latitude?: number;
  longitude?: number;
  accuracy?: LocationContextAccuracy;
}
