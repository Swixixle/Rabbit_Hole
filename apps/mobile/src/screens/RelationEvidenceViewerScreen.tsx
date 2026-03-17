/**
 * Rabbit Hole v9/v10 — Relation evidence viewer: why a connection exists.
 * v10: explicit availability states (supported / not_yet_evidenced / unresolvable_relation).
 */
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import type { KnowledgeNode } from "../types/knowledgeNodes";
import type { ExplorationTarget } from "../types/exploration";
import { selectRelationEvidenceAvailability } from "../utils/evidenceAvailabilitySelectors";
import {
  selectClaimsForEdge,
  selectSourcesForEdge,
} from "../utils/relationEvidenceSelectors";
import { getSampleGraphEdges } from "../data/sampleGraph";
import { getSampleClaims } from "../data/sampleClaims";
import { getSampleClaimSupportEdges } from "../data/sampleClaimSupport";
import { getSampleEdgeClaimReferences } from "../data/sampleRelationEvidence";
import { getSampleSources } from "../data/sampleSources";
import { SourceRecordList } from "../components/knowledge/SourceRecordList";
import { EvidenceAvailabilityNotice } from "../components/knowledge/EvidenceAvailabilityNotice";

export type RelationEvidenceViewerScreenParams = {
  sourceNode: KnowledgeNode;
  target: ExplorationTarget;
};

export function RelationEvidenceViewerScreen() {
  const route = useRoute();
  const params = route.params as RelationEvidenceViewerScreenParams | undefined;
  const sourceNode = params?.sourceNode;
  const target = params?.target;

  if (!sourceNode || !target) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Missing source node or target.</Text>
      </View>
    );
  }

  const entityGraphEdges = getSampleGraphEdges();
  const refs = getSampleEdgeClaimReferences();
  const availability = selectRelationEvidenceAvailability(
    sourceNode.id,
    target,
    entityGraphEdges,
    refs
  );

  const claims = getSampleClaims();
  const supportEdges = getSampleClaimSupportEdges();
  const sources = getSampleSources();

  const edgeClaims =
    availability.edgeId && availability.kind === "supported"
      ? selectClaimsForEdge(availability.edgeId, refs, claims)
      : [];
  const edgeSources =
    availability.edgeId && availability.kind === "supported"
      ? selectSourcesForEdge(availability.edgeId, refs, claims, supportEdges, sources)
      : [];

  if (availability.kind === "unresolvable_relation") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <Text style={styles.connectionText}>
            {sourceNode.title} → {target.relationType} → {target.label}
          </Text>
        </View>
        <View style={styles.section}>
          <EvidenceAvailabilityNotice kind="unresolvable_relation" />
        </View>
      </ScrollView>
    );
  }

  if (availability.kind === "not_yet_evidenced") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <Text style={styles.connectionText}>
            {sourceNode.title} → {target.relationType} → {target.label}
          </Text>
        </View>
        <View style={styles.section}>
          <EvidenceAvailabilityNotice kind="not_yet_evidenced" />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection</Text>
        <Text style={styles.connectionText}>
          {sourceNode.title} → {target.relationType} → {target.label}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Claims supporting this connection</Text>
        {edgeClaims.length === 0 ? (
          <Text style={styles.emptyState}>No claim records linked for this connection yet.</Text>
        ) : (
          edgeClaims.map((c) => (
            <View key={c.id} style={styles.claimRow}>
              <Text style={styles.claimText}>{c.text}</Text>
              <Text style={styles.claimMeta}>
                {c.claimKind}
                {c.claimKind !== "identity" ? ` · ${(c.confidence * 100).toFixed(0)}%` : ""}
              </Text>
            </View>
          ))
        )}
      </View>

      {edgeClaims.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sources</Text>
          <SourceRecordList
            sources={edgeSources}
            emptyText="No supporting sources for this connection yet."
            showSourceKind={true}
            showCitationLabel={true}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 32 },
  empty: { padding: 16, fontSize: 16, color: "#666" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "rgba(0,0,0,0.6)", marginBottom: 10 },
  connectionText: { fontSize: 16, color: "#333", lineHeight: 22 },
  emptyState: { fontSize: 15, color: "rgba(0,0,0,0.6)", fontStyle: "italic" },
  claimRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  claimText: { fontSize: 15, color: "#333" },
  claimMeta: { fontSize: 12, color: "rgba(0,0,0,0.5)", marginTop: 4, textTransform: "capitalize" },
});
