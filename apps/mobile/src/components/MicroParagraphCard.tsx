import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { ArticleBlock } from "@rabbit-hole/contracts";
import { ClaimTypeBadge } from "./ClaimTypeBadge";
import type { Claim } from "@rabbit-hole/contracts";
import { getClaimConfidence, getClaimSupport, getConfidenceLabel, getSupportLabel, confidenceGlyph } from "../utils/confidenceDisplay";
import type { SentenceAnchor } from "../types/readingAssist";

const BLOCK_TYPE = ["identification", "summary", "context", "content"] as const;
type BlockType = (typeof BLOCK_TYPE)[number];

export function MicroParagraphCard({
  block,
  claims,
  onClaimPress,
  showSectionLabel,
  hideLowConfidence = false,
  sentenceAnchors,
  isSentenceLayerActive = false,
  focusedSentenceId = null,
  onSentencePress,
  isSentenceFocused,
  adjacentSentenceIds,
}: {
  block: ArticleBlock;
  claims: Claim[];
  onClaimPress?: (claimId: string) => void;
  showSectionLabel?: boolean;
  hideLowConfidence?: boolean;
  /** v2: sentence anchors for sentence-level focus. */
  sentenceAnchors?: SentenceAnchor[];
  /** v3: when true and sentenceAnchors present, render tappable sentences inside this block. */
  isSentenceLayerActive?: boolean;
  focusedSentenceId?: string | null;
  onSentencePress?: (sentenceId: string) => void;
  isSentenceFocused?: (sentenceId: string) => boolean;
  /** v7: immediate previous/next sentence ids for inline steering target styling. */
  adjacentSentenceIds?: { previousSentenceId: string | null; nextSentenceId: string | null };
}) {
  const blockType = (block.blockType as BlockType) || "content";
  const blockClaims = (block.claimIds || [])
    .map((id) => claims.find((c) => c.id === id))
    .filter(Boolean) as Claim[];
  const visibleClaims = hideLowConfidence
    ? blockClaims.filter((c) => getClaimConfidence(c) !== "low")
    : blockClaims;
  const allInterpretation =
    blockClaims.length > 0 &&
    blockClaims.every((c) => c.claimType === "interpretation");

  const isIdentification = blockType === "identification";
  const isSummary = blockType === "summary";
  const isContext = blockType === "context";

  const confCounts = { high: 0, medium: 0, low: 0 };
  const supportCounts: Record<string, number> = {};
  blockClaims.forEach((c) => {
    const conf = getClaimConfidence(c);
    confCounts[conf as keyof typeof confCounts] = (confCounts[conf as keyof typeof confCounts] ?? 0) + 1;
    const sup = getClaimSupport(c);
    supportCounts[sup] = (supportCounts[sup] ?? 0) + 1;
  });
  const rollupParts: string[] = [];
  if (confCounts.high) rollupParts.push(`High ${confCounts.high}`);
  if (confCounts.medium) rollupParts.push(`Medium ${confCounts.medium}`);
  if (confCounts.low) rollupParts.push(`Low ${confCounts.low}`);
  const confidenceRollup = rollupParts.length ? rollupParts.join(" · ") : null;
  const supportRollup =
    Object.keys(supportCounts).length > 0
      ? Object.entries(supportCounts)
          .map(([k, v]) => `${getSupportLabel(k)} ${v}`)
          .join(" · ")
      : null;

  const useSentenceLayer =
    isSentenceLayerActive &&
    sentenceAnchors &&
    sentenceAnchors.length > 0 &&
    onSentencePress &&
    isSentenceFocused;

  const trimmedText = (block.text ?? "").trim();

  const renderBlockContent = () => {
    const baseTextStyle = [
      styles.text,
      isIdentification && styles.textIdentification,
      isSummary && styles.textSummary,
    ];
    if (!useSentenceLayer) {
      return <Text style={baseTextStyle}>{block.text}</Text>;
    }
    const anchors = sentenceAnchors!;
    const parts: Array<{ type: "gap" | "sentence"; text: string; sentenceId?: string }> = [];
    let pos = 0;
    anchors.forEach((a) => {
      if (a.startOffset > pos) {
        parts.push({ type: "gap", text: trimmedText.slice(pos, a.startOffset) });
      }
      parts.push({
        type: "sentence",
        text: trimmedText.slice(a.startOffset, a.endOffset),
        sentenceId: a.id,
      });
      pos = a.endOffset;
    });
    if (pos < trimmedText.length) {
      parts.push({ type: "gap", text: trimmedText.slice(pos) });
    }
    const hasAnySentenceFocused = anchors.some((a) => isSentenceFocused!(a.id));
    const isAdjacent = (sentenceId: string) =>
      adjacentSentenceIds &&
      (sentenceId === adjacentSentenceIds.previousSentenceId ||
        sentenceId === adjacentSentenceIds.nextSentenceId);
    return (
      <Text style={baseTextStyle}>
        {parts.map((part, i) => {
          if (part.type === "gap") {
            return <Text key={`g-${i}`}>{part.text}</Text>;
          }
          const focused = isSentenceFocused!(part.sentenceId!);
          const adjacent = !focused && isAdjacent(part.sentenceId!);
          const deemphasized =
            hasAnySentenceFocused && !focused && !adjacent;
          return (
            <Text
              key={part.sentenceId}
              onPress={() => onSentencePress!(part.sentenceId!)}
              style={[
                focused && styles.sentenceTextFocused,
                adjacent && styles.sentenceTextAdjacent,
                deemphasized && styles.sentenceTextDeemphasized,
              ]}
            >
              {part.text}
            </Text>
          );
        })}
      </Text>
    );
  };

  return (
    <View style={[styles.card, isSummary && styles.cardSummary]}>
      {showSectionLabel && isContext && (
        <Text style={styles.sectionLabel}>Context</Text>
      )}
      {blockClaims.length > 0 && (confidenceRollup || supportRollup) && (
        <View style={styles.rollup}>
          {confidenceRollup && <Text style={styles.rollupText}>Confidence: {confidenceRollup}</Text>}
          {supportRollup && <Text style={styles.rollupText}>Support: {supportRollup}</Text>}
        </View>
      )}
      {allInterpretation && !isIdentification && (
        <Text style={styles.interpretationHint}>Interpretation</Text>
      )}
      {renderBlockContent()}
      {visibleClaims.length > 0 && (
        <View style={styles.badges}>
          {visibleClaims.map((c) => (
            <Pressable
              key={c.id}
              style={styles.badgeWrap}
              onPress={onClaimPress ? () => onClaimPress(c.id) : undefined}
            >
              <ClaimTypeBadge claimType={c.claimType} onPress={undefined} />
              <Text style={styles.epistemicChip}>{confidenceGlyph(getClaimConfidence(c))} {getClaimConfidence(c)}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {hideLowConfidence && blockClaims.some((c) => getClaimConfidence(c) === "low") && (
        <Text style={styles.hiddenHint}>Low-confidence claim hidden</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderBottomWidth: 1, borderColor: "#eee" },
  cardSummary: { paddingTop: 20, paddingBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: "600", color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  rollup: { marginBottom: 8 },
  rollupText: { fontSize: 11, color: "#666", marginBottom: 2 },
  interpretationHint: { fontSize: 11, color: "#666", marginBottom: 4, fontStyle: "italic" },
  text: { fontSize: 16, lineHeight: 24 },
  textIdentification: { fontSize: 15, color: "#444", lineHeight: 22 },
  textSummary: { fontSize: 17, lineHeight: 26, color: "#111" },
  sentenceTextFocused: { backgroundColor: "#ebebeb" },
  sentenceTextAdjacent: { backgroundColor: "#f5f5f5" },
  sentenceTextDeemphasized: { opacity: 0.88 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  badgeWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  epistemicChip: { fontSize: 10, color: "#666" },
  hiddenHint: { fontSize: 11, color: "#888", marginTop: 6, fontStyle: "italic" },
});
