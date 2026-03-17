/**
 * Minimal API client. Uses normalized contracts; no raw ingestion output.
 */
const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  uploadImage: async (uri: string): Promise<{ uploadId: string; imageUri?: string }> => {
    const form = new FormData();
    form.append("file", { uri, type: "image/jpeg", name: "image.jpg" } as any);
    const res = await fetch(`${API_BASE}/v1/media/upload`, { method: "POST", body: form });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  /** OCR / Page Capture: extract text from a page image. Returns { text, confidence }. On failure returns { text: "", confidence: "low" }. */
  extractPageText: async (imageUri: string): Promise<{ text: string; confidence?: "high" | "medium" | "low" }> => {
    const form = new FormData();
    form.append("file", { uri: imageUri, type: "image/jpeg", name: "page.jpg" } as any);
    const res = await fetch(`${API_BASE}/v1/page/extract-text`, { method: "POST", body: form });
    if (!res.ok) return { text: "", confidence: "low" };
    const data = (await res.json()) as { text?: string; confidence?: string };
    const text = typeof data.text === "string" ? data.text.trim() : "";
    const confidence = data.confidence === "high" || data.confidence === "medium" || data.confidence === "low" ? data.confidence : "low";
    return { text, confidence };
  },

  exploreImage: async (uploadId: string, locationContext?: import("@rabbit-hole/contracts").LocationContext | null) =>
    request<{
      segments?: Array<{
        segmentId: string;
        label: string;
        confidence: string;
        nodeId?: string;
        bbox?: { x: number; y: number; width: number; height: number };
      }>;
      ecologicalEntity?: import("@rabbit-hole/contracts").EcologicalEntity;
    }>("/v1/explore/image", {
      method: "POST",
      body: JSON.stringify({
        uploadId,
        ...(locationContext && {
          location: {
            latitude: locationContext.latitude,
            longitude: locationContext.longitude,
            accuracy: locationContext.accuracy,
          },
        }),
      }),
    }),

  exploreTap: async (body: {
    uploadId?: string;
    segmentId?: string;
    x?: number;
    y?: number;
    tapXNorm?: number;
    tapYNorm?: number;
  }) =>
    request<{
      candidates: Array<{ segmentId: string; label: string; confidence: string; nodeId?: string }>;
      articleId?: string;
    }>("/v1/explore/image/tap", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getArticle: (articleId: string) =>
    request<import("@rabbit-hole/contracts").Article>(`/v1/articles/${articleId}`),

  getArticleByNode: (nodeId: string) =>
    request<import("@rabbit-hole/contracts").Article>(`/v1/articles/by-node/${nodeId}`),

  getClaim: (claimId: string) => request<import("@rabbit-hole/contracts").Claim>(`/v1/claims/${claimId}`),

  getSource: (sourceId: string) => request<import("@rabbit-hole/contracts").Source>(`/v1/sources/${sourceId}`),

  getVerification: (articleId: string) =>
    request<import("@rabbit-hole/contracts").VerificationResponse>(`/v1/verification/article/${articleId}`),

  getTraces: (nodeId: string) =>
    request<import("@rabbit-hole/contracts").TracesResponse>(`/v1/traces/${nodeId}`),

  getArticleQuestions: (articleId: string) =>
    request<{ questions: import("@rabbit-hole/contracts").Question[] }>(`/v1/articles/${articleId}/questions`),

  search: (q: string) =>
    request<import("@rabbit-hole/contracts").SearchResult[]>(
      `/v1/search?q=${encodeURIComponent(q.trim())}`
    ),

  getArticleMarket: (articleId: string) =>
    request<import("@rabbit-hole/contracts").ArticleMarket>(`/v1/articles/${articleId}/market`),

  /** Page-to-Study v1: study guide for article. 404 → caller should treat as no study (e.g. set null). */
  getArticleStudy: (articleId: string) =>
    request<import("../types/study").ArticleStudyGuide>(`/v1/articles/${articleId}/study`),

  /** Media Lens v1: resolve media URL to kind and optional articleId. 404 → not media, fall back to search. */
  resolveMediaUrl: (url: string) =>
    request<import("@rabbit-hole/contracts").MediaReference>(
      `/v1/media/resolve?url=${encodeURIComponent(url.trim())}`
    ).catch(() => null),

  /** Media Transcript/Summary v1: summary and transcript for a media URL. 404 → no interpretation. */
  getMediaInterpretation: (url: string) =>
    request<import("@rabbit-hole/contracts").MediaInterpretation>(
      `/v1/media/interpretation?url=${encodeURIComponent(url.trim())}`
    ).catch(() => null),

  /** Verify-from-Media v1: verification bundle for a media URL. 404 → no verification data. */
  getMediaVerification: (url: string) =>
    request<import("@rabbit-hole/contracts").VerificationResponse>(
      `/v1/media/verification?url=${encodeURIComponent(url.trim())}`
    ).catch(() => null),

  /** Organization/Company Profile v1: profile by id. 404 → null. */
  getOrganizationProfile: (orgId: string) =>
    request<import("@rabbit-hole/contracts").OrganizationProfile>(`/v1/organizations/${encodeURIComponent(orgId)}`).catch(
      () => null
    ),

  /** Audio Recognition Groundwork v1: recognize by clipId or uri. Optional location (accepted, not used in v1). 404 → null. */
  recognizeAudioClip: (
    clipIdOrUri: string,
    locationContext?: import("@rabbit-hole/contracts").LocationContext | null
  ) =>
    request<import("@rabbit-hole/contracts").AudioRecognitionResult>("/v1/audio/recognize", {
      method: "POST",
      body: JSON.stringify({
        clipId: clipIdOrUri.trim() || undefined,
        uri: clipIdOrUri.trim() || undefined,
        ...(locationContext && {
          location: {
            latitude: locationContext.latitude,
            longitude: locationContext.longitude,
            accuracy: locationContext.accuracy,
          },
        }),
      }),
    }).catch(() => null),
};
