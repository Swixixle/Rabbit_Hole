/**
 * Rabbit Hole v17 — Generated/provisional knowledge from backend.
 * Not canonical graph truth; explicitly unverified.
 */

export type GeneratedRelationSuggestion = {
  label: string;
  relationType:
    | "is_a"
    | "part_of"
    | "made_of"
    | "related_to"
    | "alternative_to"
    | "used_for"
    | "produced_by";
  confidence: number | null;
};

export type GeneratedClaimInput = {
  text: string;
  claimKind: "identity" | "material" | "functional" | "comparative" | "contextual";
  confidence: number | null;
};

export type GenerateNodeRequest = {
  label: string;
  candidateType: "entity" | "product" | "landmark" | "topic" | "media";
  alternativeLabels?: string[];
  confidence?: number | null;
  visualDescription?: string;
  specificityHint?: string;
  likelyVariant?: string;
  observedText?: string[];
  lineageHints?: string[];
};

export type GenerateNodeResponse = {
  title: string;
  description: string;
  nodeKind: "entity" | "product" | "landmark" | "topic" | "media";
  claims: GeneratedClaimInput[];
  suggestedRelations?: GeneratedRelationSuggestion[];
};
