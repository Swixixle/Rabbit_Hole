import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from "react-native";
import type { MediaInterpretation, MediaSummaryBlock, MediaTranscriptBlock, Claim } from "@rabbit-hole/contracts";
import { ClaimTypeBadge } from "./ClaimTypeBadge";
import { getClaimConfidence, getClaimSupport, getConfidenceLabel, getSupportLabel, confidenceGlyph } from "../utils/confidenceDisplay";
import { getSupportStatusLabel } from "../utils/supportStatusLabels";

export function MediaInterpretationSheet({
  interpretation,
  visible,
  onDismiss,
  onOpenVerifyFromMedia,
  onOpenOrganization,
  onSearchFromTranscript,
}: {
  interpretation: MediaInterpretation | null;
  visible: boolean;
  onDismiss: () => void;
  /** Verify-from-Media v1: when user taps "Verify from this media", fetch bundle and call this with it. */
  onOpenVerifyFromMedia?: (url: string) => Promise<void>;
  /** Organization/Company Profile v1: when user taps Organization, open profile for this org id. */
  onOpenOrganization?: (orgId: string) => void;
  /** Live subtitle groundwork: when user taps "Search from transcript", pass transcript text into Share Intake. */
  onSearchFromTranscript?: (text: string) => void;
}) {
  const [verifyLoading, setVerifyLoading] = useState(false);
  if (!visible) return null;

  const title = interpretation?.ref?.title ?? "Summary & transcript";
  const summaryBlocks = interpretation?.summaryBlocks ?? [];
  const transcriptBlocks = interpretation?.transcriptBlocks ?? [];
  const claims = interpretation?.claims ?? [];
  const supportStatusByClaimId = interpretation?.supportStatusByClaimId ?? {};
  const mediaUrl = interpretation?.ref?.originalUrl ?? "";

  const handleVerifyFromMedia = async () => {
    if (!onOpenVerifyFromMedia || !mediaUrl) return;
    setVerifyLoading(true);
    try {
      await onOpenVerifyFromMedia(mediaUrl);
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <Modal transparent visible animationType="slide">
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onDismiss}>
              <Text style={styles.dismiss}>Close</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.scroll}>
            {interpretation?.ref?.organizationId && onOpenOrganization ? (
              <View style={styles.section}>
                <Pressable
                  style={styles.orgLink}
                  onPress={() => onOpenOrganization(interpretation.ref!.organizationId!)}
                >
                  <Text style={styles.orgLinkText}>Organization</Text>
                </Pressable>
              </View>
            ) : null}
            {summaryBlocks.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Summary</Text>
                {summaryBlocks.map((b) => (
                  <SummaryBlockView key={b.id} block={b} />
                ))}
              </View>
            ) : null}
            {transcriptBlocks.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Transcript</Text>
                {transcriptBlocks.map((b) => (
                  <TranscriptBlockView key={b.id} block={b} />
                ))}
                {onSearchFromTranscript ? (
                  <Pressable
                    style={styles.searchFromTranscriptButton}
                    onPress={() => {
                      const text = transcriptBlocks.map((b) => b.content ?? "").join("\n").trim();
                      onSearchFromTranscript(text);
                    }}
                  >
                    <Text style={styles.searchFromTranscriptButtonText}>Search from transcript</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
            {claims.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Claims from this media</Text>
                <Text style={styles.claimsHint}>Claims surfaced from this media; not independently verified.</Text>
                {claims.map((c) => (
                  <MediaClaimRow key={c.id} claim={c} supportStatus={supportStatusByClaimId[c.id]} />
                ))}
                {onOpenVerifyFromMedia && mediaUrl ? (
                  <Pressable style={styles.verifyButton} onPress={handleVerifyFromMedia} disabled={verifyLoading}>
                    <Text style={styles.verifyButtonText}>
                      {verifyLoading ? "Loading…" : "Verify from this media"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

function SummaryBlockView({ block }: { block: MediaSummaryBlock }) {
  return (
    <View style={styles.summaryBlock}>
      {block.title ? <Text style={styles.summaryBlockTitle}>{block.title}</Text> : null}
      <Text style={styles.summaryBlockContent}>{block.content}</Text>
    </View>
  );
}

function TranscriptBlockView({ block }: { block: MediaTranscriptBlock }) {
  return (
    <View style={styles.transcriptBlock}>
      {block.speaker ? (
        <Text style={styles.transcriptSpeaker}>{block.speaker}</Text>
      ) : null}
      <Text style={styles.transcriptContent}>{block.content}</Text>
    </View>
  );
}

function MediaClaimRow({ claim, supportStatus }: { claim: Claim; supportStatus?: string }) {
  const conf = getClaimConfidence(claim);
  const sup = getClaimSupport(claim);
  const supportLabel = supportStatus ? getSupportStatusLabel(supportStatus) : getSupportLabel(sup);
  return (
    <View style={styles.claimRow}>
      <View style={styles.claimMetaRow}>
        <ClaimTypeBadge claimType={claim.claimType} />
        <Text style={styles.claimMeta}>
          {confidenceGlyph(conf)} {getConfidenceLabel(conf)} · {supportLabel}
        </Text>
      </View>
      <Text style={styles.claimText}>{claim.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "80%",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "600" },
  dismiss: { color: "#0066cc" },
  scroll: { maxHeight: 400 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 8, textTransform: "uppercase" },
  summaryBlock: { marginBottom: 12 },
  summaryBlockTitle: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 4 },
  summaryBlockContent: { fontSize: 14, color: "#444", lineHeight: 20 },
  transcriptBlock: { marginBottom: 10 },
  transcriptSpeaker: { fontSize: 12, fontWeight: "600", color: "#666", marginBottom: 2 },
  transcriptContent: { fontSize: 14, color: "#444", lineHeight: 20 },
  claimRow: { marginBottom: 14 },
  claimMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  claimMeta: { fontSize: 12, color: "#666" },
  claimText: { fontSize: 14, color: "#444", lineHeight: 20 },
  claimsHint: { fontSize: 12, color: "#666", fontStyle: "italic", marginBottom: 10 },
  verifyButton: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: "#333", alignSelf: "flex-start", borderRadius: 8 },
  verifyButtonText: { color: "#fff", fontSize: 14 },
  searchFromTranscriptButton: { marginTop: 10, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: "#333", alignSelf: "flex-start", borderRadius: 8 },
  searchFromTranscriptButtonText: { color: "#fff", fontSize: 14 },
  orgLink: { paddingVertical: 8, alignSelf: "flex-start" },
  orgLinkText: { fontSize: 14, color: "#0066cc" },
});
