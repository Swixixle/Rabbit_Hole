/**
 * Rabbit Hole v17 — API client for generating provisional nodes.
 * Returns null on network/parse failure.
 */
import type { GenerateNodeRequest, GenerateNodeResponse } from "../types/generatedKnowledge";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
const GENERATE_NODE_PATH = "/v1/knowledge/generate-node";

export async function generateProvisionalNode(
  request: GenerateNodeRequest
): Promise<GenerateNodeResponse | null> {
  try {
    const res = await fetch(`${API_BASE}${GENERATE_NODE_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        label: request.label,
        candidateType: request.candidateType,
        alternativeLabels: request.alternativeLabels ?? undefined,
        confidence: request.confidence ?? undefined,
        visualDescription: request.visualDescription ?? undefined,
        specificityHint: request.specificityHint ?? undefined,
        likelyVariant: request.likelyVariant ?? undefined,
        observedText: request.observedText ?? undefined,
        lineageHints: request.lineageHints ?? undefined,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!isValidGenerateNodeResponse(data)) return null;
    return data as GenerateNodeResponse;
  } catch {
    return null;
  }
}

function isValidGenerateNodeResponse(value: unknown): value is GenerateNodeResponse {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (typeof o.title !== "string" || !o.title.trim()) return false;
  if (typeof o.description !== "string") return false;
  const validKinds = ["entity", "product", "landmark", "topic", "media"];
  if (!validKinds.includes(o.nodeKind as string)) return false;
  if (!Array.isArray(o.claims)) return false;
  const validClaimKinds = ["identity", "material", "functional", "comparative", "contextual"];
  for (const c of o.claims) {
    if (c === null || typeof c !== "object") return false;
    const claim = c as Record<string, unknown>;
    if (typeof claim.text !== "string") return false;
    if (!validClaimKinds.includes((claim.claimKind as string) ?? "")) return false;
  }
  return true;
}
