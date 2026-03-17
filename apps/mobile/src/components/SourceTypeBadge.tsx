import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { SourceType } from "@rabbit-hole/contracts";

const LABELS: Record<string, string> = {
  gov: "Gov",
  academic: "Academic",
  news: "News",
  social: "Social",
  other: "Other",
};

export function SourceTypeBadge({ sourceType }: { sourceType: SourceType }) {
  const label = LABELS[sourceType] ?? sourceType;
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#d0d0d0", borderRadius: 4 },
  text: { fontSize: 11 },
});
