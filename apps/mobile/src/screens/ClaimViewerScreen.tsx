/**
 * Rabbit Hole v8 — Claim viewer: claim text, kind, confidence, supporting sources.
 */
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import type { KnowledgeNode } from "../types/knowledgeNodes";
import type { ClaimRecord } from "../types/provenance";
import { selectSourcesForClaim } from "../utils/provenanceSelectors";
import { getSampleSources } from "../data/sampleSources";
import { getSampleClaimSupportEdges } from "../data/sampleClaimSupport";
import { SourceRecordList } from "../components/knowledge/SourceRecordList";

export type ClaimViewerScreenParams = {
  node: KnowledgeNode;
  claim: ClaimRecord;
};

export function ClaimViewerScreen() {
  const route = useRoute();
  const params = route.params as ClaimViewerScreenParams | undefined;
  const node = params?.node;
  const claim = params?.claim;

  if (!node || !claim) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Missing node or claim.</Text>
      </View>
    );
  }

  const sources = getSampleSources();
  const supportEdges = getSampleClaimSupportEdges();
  const linkedSources = selectSourcesForClaim(claim.id, supportEdges, sources);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.claimText}>{claim.text}</Text>
        <Text style={styles.kind}>{claim.claimKind}</Text>
        <Text style={styles.confidence}>Confidence: {(claim.confidence * 100).toFixed(0)}%</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Supporting sources</Text>
        <SourceRecordList
          sources={linkedSources}
          emptyText="No supporting sources available yet."
          showSourceKind={true}
          showCitationLabel={true}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 20 },
  claimText: { fontSize: 17, color: "#111", lineHeight: 24, marginBottom: 8 },
  kind: { fontSize: 12, color: "rgba(0,0,0,0.5)", textTransform: "capitalize", marginBottom: 4 },
  confidence: { fontSize: 13, color: "rgba(0,0,0,0.6)" },
  empty: { padding: 16, fontSize: 16, color: "#666" },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "rgba(0,0,0,0.6)", marginBottom: 10 },
});
