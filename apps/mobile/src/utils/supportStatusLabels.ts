/**
 * Display labels for support-status values returned by the verification API.
 * Driven by fixture/claim/source structure, not decoration.
 * Verify-from-Media v1: media-specific statuses use epistemically honest copy.
 */
export const SUPPORT_STATUS_LABELS: Record<string, string> = {
  supported_fact: "Supported fact",
  supported_synthesis: "Supported synthesis",
  interpretation: "Interpretation",
  limited_support: "Limited support",
  insufficient_support: "Insufficient support",
  disputed: "Disputed",
  // Verify-from-Media v1
  support_available: "Support available",
  no_support_yet: "No support attached yet",
  interpretation_only: "Interpretive support",
};

export function getSupportStatusLabel(status: string): string {
  return SUPPORT_STATUS_LABELS[status] ?? status;
}
