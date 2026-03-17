import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import type { Source, EvidenceSpan } from "@rabbit-hole/contracts";
import { SourceTypeBadge } from "./SourceTypeBadge";

export function EvidenceDrawer({
  source,
  evidenceSpans = [],
  onDismiss,
}: {
  source: Source;
  evidenceSpans?: EvidenceSpan[];
  onDismiss: () => void;
}) {
  const hasExcerpts = evidenceSpans.length > 0 && evidenceSpans.some((e) => e.excerpt);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Source & evidence</Text>
        <Pressable onPress={onDismiss}><Text style={styles.dismiss}>Close</Text></Pressable>
      </View>
      <ScrollView style={styles.body}>
        <SourceTypeBadge sourceType={source.type} />
        <Text style={styles.sourceTitle}>{source.title}</Text>
        {source.publisher && <Text style={styles.publisher}>{source.publisher}</Text>}
        {source.retrievedAt && <Text style={styles.meta}>Retrieved: {source.retrievedAt}</Text>}
        {source.contentHash && <Text style={styles.meta}>Hash: {source.contentHash}</Text>}
        {source.excerpt && <Text style={styles.excerpt}>{source.excerpt}</Text>}
        {hasExcerpts && (
          <View style={styles.evidenceSection}>
            <Text style={styles.evidenceSectionTitle}>Evidence linked to this claim</Text>
            {evidenceSpans.filter((e) => e.excerpt).map((e) => (
              <View key={e.id} style={styles.evidenceBlock}>
                <Text style={styles.evidenceExcerpt}>"{e.excerpt}"</Text>
              </View>
            ))}
          </View>
        )}
        {evidenceSpans.length === 0 && !source.excerpt && (
          <Text style={styles.noExcerpt}>No excerpt available for this source.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", padding: 16, maxHeight: "80%" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "600" },
  dismiss: { color: "#0066cc" },
  body: {},
  sourceTitle: { fontSize: 16, marginTop: 8 },
  publisher: { fontSize: 12, color: "#666", marginTop: 4 },
  meta: { fontSize: 11, color: "#888", marginTop: 4 },
  excerpt: { marginTop: 12, fontStyle: "italic" },
  evidenceSection: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderColor: "#eee" },
  evidenceSectionTitle: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  evidenceBlock: { marginBottom: 8 },
  evidenceExcerpt: { fontSize: 13, fontStyle: "italic", color: "#444" },
  noExcerpt: { marginTop: 12, fontSize: 13, color: "#888" },
});
