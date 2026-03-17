import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { ClaimType } from "@rabbit-hole/contracts";

const LABELS: Record<string, string> = {
  verified_fact: "Verified fact",
  synthesized_claim: "Synthesized",
  interpretation: "Interpretation",
  opinion: "Opinion",
  anecdote: "Anecdote",
  speculation: "Speculation",
  conspiracy_claim: "Conspiracy claim",
  advertisement: "Ad",
  satire_or_joke: "Satire",
  disputed_claim: "Disputed",
};

export function ClaimTypeBadge({
  claimType,
  onPress,
}: {
  claimType: ClaimType;
  onPress?: () => void;
}) {
  const label = LABELS[claimType] ?? claimType;
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "#e0e0e0", borderRadius: 4, alignSelf: "flex-start" },
  text: { fontSize: 12 },
});
