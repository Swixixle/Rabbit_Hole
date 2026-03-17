/**
 * Rabbit Hole v10 — Presentational notice for evidence availability state.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const DEFAULT_COPY: Record<
  "supported" | "not_yet_evidenced" | "unresolvable_relation" | "no_claims_yet",
  { title: string; body: string }
> = {
  supported: {
    title: "Evidence available",
    body: "This connection has linked claim support.",
  },
  not_yet_evidenced: {
    title: "Evidence not added yet",
    body: "This connection exists in the exploration graph, but supporting claim evidence has not been attached yet.",
  },
  unresolvable_relation: {
    title: "Connection could not be resolved",
    body: "Rabbit Hole could not match this displayed connection to a graph edge.",
  },
  no_claims_yet: {
    title: "No claims yet",
    body: "This node does not have claim records attached yet.",
  },
};

type Kind = keyof typeof DEFAULT_COPY;

type Props = {
  kind: Kind;
  title?: string;
  body?: string;
};

export function EvidenceAvailabilityNotice({
  kind,
  title,
  body,
}: Props) {
  const defaults = DEFAULT_COPY[kind];
  const displayTitle = title ?? defaults.title;
  const displayBody = body ?? defaults.body;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{displayTitle}</Text>
      <Text style={styles.body}>{displayBody}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 14, fontWeight: "600", color: "rgba(0,0,0,0.7)", marginBottom: 4 },
  body: { fontSize: 13, color: "rgba(0,0,0,0.6)", lineHeight: 18 },
});
