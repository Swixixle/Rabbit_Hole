/**
 * Rabbit Hole v8 — Presentational list of source records.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { SourceRecord } from "../../types/provenance";

type Props = {
  sources: SourceRecord[];
  emptyText?: string;
  showSourceKind?: boolean;
  showCitationLabel?: boolean;
};

export function SourceRecordList({
  sources,
  emptyText = "No sources available.",
  showSourceKind = true,
  showCitationLabel = true,
}: Props) {
  if (sources.length === 0) {
    return <Text style={styles.empty}>{emptyText}</Text>;
  }
  return (
    <View style={styles.container}>
      {sources.map((s) => (
        <View key={s.id} style={styles.row}>
          <Text style={styles.title}>{s.title}</Text>
          {showSourceKind ? (
            <Text style={styles.meta}>{s.sourceKind}</Text>
          ) : null}
          {showCitationLabel && s.citationLabel ? (
            <Text style={styles.citation}>{s.citationLabel}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 4 },
  row: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 15, color: "#333" },
  meta: { fontSize: 12, color: "rgba(0,0,0,0.5)", marginTop: 2, textTransform: "capitalize" },
  citation: { fontSize: 12, color: "rgba(0,0,0,0.6)", marginTop: 2 },
  empty: { fontSize: 15, color: "rgba(0,0,0,0.6)", fontStyle: "italic" },
});
