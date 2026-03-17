/**
 * Rabbit Hole — Minimal node viewer for the first exploration loop.
 * Shows node title, description, kind, branch buttons, and related (graph-derived).
 */
import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { KnowledgeNode } from "../types/knowledgeNodes";
import { getSampleNodes } from "../data/sampleNodes";
import { getGeneratedClaimsForNode } from "../data/generatedKnowledgeStore";
import { getNodeById } from "../utils/nodeResolution";
import { getSampleGraphEdges } from "../data/sampleGraph";
import { selectBranchRecordsForNode } from "../utils/branchSelectors";
import { selectExplorationTargetsForNode } from "../utils/explorationSelectors";
import { selectClaimsForNode } from "../utils/provenanceSelectors";
import { selectNodeClaimsAvailability } from "../utils/evidenceAvailabilitySelectors";
import { getSampleClaims } from "../data/sampleClaims";
import { ExplorationTargetList } from "../components/knowledge/ExplorationTargetList";
import { selectPipelineTraceForNode } from "../utils/pipelineTraceSelectors";
import { getSampleRecognitionCandidates, getSampleIdentifiedEntities } from "../data/sampleRecognition";
import { PipelineTraceSummary } from "../components/knowledge/PipelineTraceSummary";

export type NodeViewerScreenParams = {
  node: KnowledgeNode;
  /** v17: when generated, optional recognition line e.g. "Sony WH-1000XM5" or "Likely variant: 1984 tour shirt" */
  recognitionDetail?: string;
};

export function NodeViewerScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as NodeViewerScreenParams | undefined;
  const node = params?.node;
  const recognitionDetail = params?.recognitionDetail;
  if (!node) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No node</Text>
      </View>
    );
  }

  const onOpenNode = (targetNode: KnowledgeNode) => {
    (navigation as any).navigate("NodeViewer", { node: targetNode });
  };
  const branchRecords = selectBranchRecordsForNode(node);
  const nodes = getSampleNodes();
  const entityGraphEdges = getSampleGraphEdges();
  const relatedTargets = selectExplorationTargetsForNode(node, nodes, entityGraphEdges);
  const claims =
    node.origin === "generated"
      ? getGeneratedClaimsForNode(node.id) ?? []
      : selectClaimsForNode(node.id, getSampleClaims());
  selectNodeClaimsAvailability(node.id, getSampleClaims()); // future-ready: supports visible "no claims yet" notice if desired

  const candidates = getSampleRecognitionCandidates();
  const entities = getSampleIdentifiedEntities();
  const pipelineTrace = selectPipelineTraceForNode(node.id, nodes, entities, candidates);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {node.origin === "generated" ? (
          <>
            <Text style={styles.generatedNotice}>Generated from recognition — provisional and not yet verified.</Text>
            {recognitionDetail ? (
              <Text style={styles.recognitionDetail}>Recognized as: {recognitionDetail}</Text>
            ) : null}
          </>
        ) : null}
        <Text style={styles.title}>{node.title}</Text>
        <Text style={styles.kind}>{node.nodeKind}</Text>
        {node.description ? (
          <Text style={styles.description}>{node.description}</Text>
        ) : null}
      </View>

      {pipelineTrace ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recognition Trace</Text>
          <PipelineTraceSummary trace={pipelineTrace} />
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore</Text>
        <View style={styles.branchRow}>
          {branchRecords.map((branch) => (
            <Pressable
              key={branch.id}
              style={styles.branchButton}
              onPress={() =>
                (navigation as any).navigate("BranchViewer", { node, branch })
              }
            >
              <Text style={styles.branchButtonText}>{branch.title}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {claims.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Claims</Text>
          {claims.map((claim) => (
            <Pressable
              key={claim.id}
              style={styles.claimRow}
              onPress={() =>
                (navigation as any).navigate("ClaimViewer", { node, claim })
              }
            >
              <Text style={styles.claimText} numberOfLines={2}>{claim.text}</Text>
              <Text style={styles.claimMeta}>
                {claim.claimKind}
                {claim.claimKind !== "identity" ? ` · ${(claim.confidence * 100).toFixed(0)}%` : ""}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Related</Text>
        <ExplorationTargetList
          targets={relatedTargets}
          onPressTarget={(target) => {
            const targetNode = getNodeById(target.targetNodeId);
            if (targetNode) onOpenNode(targetNode);
          }}
          emptyText="No related nodes yet."
          showRelationType={true}
          showWhyAction={true}
          onPressWhy={(target) =>
            (navigation as any).navigate("RelationEvidenceViewer", {
              sourceNode: node,
              target,
            })
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: "700", color: "#111", marginBottom: 4 },
  kind: { fontSize: 12, color: "rgba(0,0,0,0.5)", textTransform: "capitalize", marginBottom: 8 },
  description: { fontSize: 15, color: "rgba(0,0,0,0.8)", lineHeight: 22 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "rgba(0,0,0,0.6)", marginBottom: 10 },
  branchRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  branchButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  branchButtonText: { fontSize: 14, color: "#333", textTransform: "capitalize" },
  claimRow: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  claimText: { fontSize: 15, color: "#333" },
  claimMeta: { fontSize: 12, color: "rgba(0,0,0,0.5)", marginTop: 4, textTransform: "capitalize" },
  generatedNotice: {
    fontSize: 12,
    color: "rgba(0,0,0,0.55)",
    fontStyle: "italic",
    marginBottom: 4,
  },
  recognitionDetail: {
    fontSize: 11,
    color: "rgba(0,0,0,0.5)",
    marginBottom: 8,
  },
});
