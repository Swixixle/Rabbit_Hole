/**
 * Rabbit Hole Core Groundwork v7 — Generic branch viewer.
 * Graph-filtered exploration targets; same substrate as Related summary.
 */
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { KnowledgeNode } from "../types/knowledgeNodes";
import type { BranchRecord } from "../types/branches";
import { selectExplorationTargetsForNodeBranch } from "../utils/explorationSelectors";
import { getSampleNodes } from "../data/sampleNodes";
import { getNodeById } from "../utils/nodeResolution";
import { getSampleGraphEdges } from "../data/sampleGraph";
import { ExplorationTargetList } from "../components/knowledge/ExplorationTargetList";

export type BranchViewerScreenParams = {
  node: KnowledgeNode;
  branch: BranchRecord;
};

export function BranchViewerScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as BranchViewerScreenParams | undefined;
  const node = params?.node;
  const branch = params?.branch;

  if (!node || !branch) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Missing node or branch.</Text>
      </View>
    );
  }

  const nodes = getSampleNodes();
  const entityGraphEdges = getSampleGraphEdges();
  const targets = selectExplorationTargetsForNodeBranch(
    node,
    branch,
    nodes,
    entityGraphEdges
  );

  const onOpenNode = (targetNode: KnowledgeNode) => {
    (navigation as any).navigate("NodeViewer", { node: targetNode });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.branchTitle}>{branch.title}</Text>
        <Text style={styles.sourceLabel}>From: {node.title}</Text>
      </View>

      <View style={styles.section}>
        <ExplorationTargetList
          targets={targets}
          onPressTarget={(target) => {
            const targetNode = getNodeById(target.targetNodeId);
            if (targetNode) onOpenNode(targetNode);
          }}
          emptyText="No branch targets available yet."
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
  header: { marginBottom: 20 },
  branchTitle: { fontSize: 20, fontWeight: "700", color: "#111", marginBottom: 4 },
  sourceLabel: { fontSize: 14, color: "rgba(0,0,0,0.5)" },
  empty: { padding: 16, fontSize: 16, color: "#666" },
  section: { marginTop: 8 },
});
