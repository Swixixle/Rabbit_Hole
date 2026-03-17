/**
 * Ecological Identification Groundwork v1: compact block for ecological entity context.
 * Renders name, kind, summary, optional seasonal/safety notes. Safety notes are labeled as general awareness only.
 */
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { EcologicalEntity } from "@rabbit-hole/contracts";

export function EcologicalContextBlock({
  entity,
  onOpenArticle,
}: {
  entity: EcologicalEntity;
  onOpenArticle: (articleId: string) => void;
}) {
  const hasSafety = entity.safetyNotes?.length;
  const hasSeasonal = entity.seasonalNotes?.length;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Nature</Text>
      <View style={styles.card}>
        <Text style={styles.name}>{entity.name}</Text>
        <Text style={styles.kind}>{entity.kind}</Text>
        {entity.summary ? (
          <Text style={styles.summary}>{entity.summary}</Text>
        ) : null}
        {hasSeasonal ? (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Seasonal</Text>
            {entity.seasonalNotes!.map((line, i) => (
              <Text key={i} style={styles.noteLine}>{line}</Text>
            ))}
          </View>
        ) : null}
        {hasSafety ? (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>General awareness</Text>
            {entity.safetyNotes!.map((line, i) => (
              <Text key={i} style={styles.safetyLine}>{line}</Text>
            ))}
          </View>
        ) : null}
        {entity.articleId ? (
          <Pressable
            style={styles.readMoreButton}
            onPress={() => onOpenArticle(entity.articleId!)}
          >
            <Text style={styles.readMoreText}>Read more</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#2e7d32",
  },
  name: { fontSize: 16, fontWeight: "600", color: "#333" },
  kind: { fontSize: 12, color: "#666", marginTop: 2, textTransform: "capitalize" },
  summary: { fontSize: 14, color: "#444", marginTop: 8, lineHeight: 20 },
  notes: { marginTop: 10 },
  notesLabel: { fontSize: 11, fontWeight: "600", color: "#666", marginBottom: 4 },
  noteLine: { fontSize: 13, color: "#444", lineHeight: 18 },
  safetyLine: { fontSize: 13, color: "#444", lineHeight: 18, fontStyle: "italic" },
  readMoreButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#333",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  readMoreText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
