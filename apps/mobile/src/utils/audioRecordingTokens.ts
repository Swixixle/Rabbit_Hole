/**
 * Tokens and normalizers for audio recognition handoff. No runtime deps (expo-av lives in audioRecording.ts).
 * Real Microphone Capture v1: recorded clips send this token; backend returns no-match until fingerprinting exists.
 */
export const RECORDED_CLIP_TOKEN = "recorded";

export function normalizedRecordedClipToken(_localUri: string | null): string {
  return RECORDED_CLIP_TOKEN;
}
