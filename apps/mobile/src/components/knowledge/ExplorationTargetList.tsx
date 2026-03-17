/**
 * Rabbit Hole Core Groundwork v7 — Reusable list of exploration targets.
 * Used by NodeViewer (Related) and BranchViewer; keeps presentation consistent.
 */
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { ExplorationTarget } from "../../types/exploration";

type Props = {
  targets: ExplorationTarget[];
  onPressTarget: (target: ExplorationTarget) => void;
  emptyText?: string;
  showRelationType?: boolean;
  onPressWhy?: (target: ExplorationTarget) => void;
  showWhyAction?: boolean;
};

export function ExplorationTargetList({
  targets,
  onPressTarget,
  emptyText = "No targets available.",
  showRelationType = true,
  onPressWhy,
  showWhyAction = false,
}: Props) {
  if (targets.length === 0) {
    return <Text style={styles.empty}>{emptyText}</Text>;
  }
  const showWhy = showWhyAction && onPressWhy;
  return (
    <View style={styles.container}>
      {targets.map((t) => (
        <View key={t.id} style={styles.row}>
          <Pressable
            style={styles.rowMain}
            onPress={() => onPressTarget(t)}
          >
            <Text style={styles.label}>{t.label}</Text>
            {showRelationType && t.relationType ? (
              <Text style={styles.relationType}>{t.relationType}</Text>
            ) : null}
          </Pressable>
          {showWhy ? (
            <Pressable
              style={styles.whyButton}
              onPress={() => onPressWhy(t)}
            >
              <Text style={styles.whyText}>Why this connection?</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 4 },
  row: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  rowMain: { flex: 1 },
  label: { fontSize: 16, color: "#333" },
  relationType: { fontSize: 12, color: "rgba(0,0,0,0.5)", marginTop: 2 },
  whyButton: { paddingVertical: 6, paddingHorizontal: 0 },
  whyText: { fontSize: 12, color: "rgba(0,0,0,0.5)" },
  empty: { fontSize: 15, color: "rgba(0,0,0,0.6)", fontStyle: "italic" },
});
