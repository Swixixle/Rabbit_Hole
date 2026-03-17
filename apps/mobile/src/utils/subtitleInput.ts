/**
 * Live subtitle / caption text input groundwork.
 * Feeds the same Share Intake / search pipeline as OCR and pasted text.
 * Shape is compatible with future reading-assist (continuous text stream, optional segments).
 */
import type { MediaTranscriptBlock } from "@rabbit-hole/contracts";
import { normalizeSharedInput } from "./sharedInput";

/** Optional segment for future subtitle anchoring (start/end ms). */
export interface SubtitleSegment {
  startMs?: number;
  endMs?: number;
  text: string;
}

/** Subtitle text stream: same pipeline as OCR/paste; supports future segment anchoring. */
export interface SubtitleInput {
  text: string;
  source: "subtitle";
  segments?: SubtitleSegment[];
}

/**
 * Build SubtitleInput from plain text (e.g. pasted captions). Segments optional for future anchoring.
 */
export function toSubtitleInput(
  plainText: string,
  segments?: SubtitleSegment[]
): SubtitleInput {
  const text = typeof plainText === "string" ? plainText.trim() : "";
  return {
    text,
    source: "subtitle",
    ...(segments && segments.length > 0 ? { segments } : undefined),
  };
}

/**
 * Normalize subtitle input to a single searchable string for the Share Intake pipeline.
 * Uses same trim/collapse as shared input so search behavior is identical.
 */
export function normalizeSubtitleToSearchText(subtitle: SubtitleInput): string {
  if (subtitle.source !== "subtitle") return "";
  return normalizeSharedInput(subtitle.text);
}

/**
 * Build SubtitleInput from media interpretation transcript blocks.
 * Preserves segment structure (startMs, text) for future anchoring.
 */
export function subtitleInputFromMediaTranscript(
  blocks: MediaTranscriptBlock[]
): SubtitleInput {
  if (!blocks?.length) return { text: "", source: "subtitle" };
  const segments: SubtitleSegment[] = blocks.map((b) => ({
    startMs: b.startMs,
    text: (b.content ?? "").trim(),
  }));
  const text = segments.map((s) => s.text).filter(Boolean).join("\n");
  return { text, source: "subtitle", segments };
}

/**
 * Extract plain text from SubtitleInput for routing into Share Intake (same as OCR/paste path).
 */
export function subtitleTextForIntake(subtitle: SubtitleInput): string {
  return normalizeSubtitleToSearchText(subtitle);
}
