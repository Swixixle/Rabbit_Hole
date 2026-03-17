import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { Node } from "@rabbit-hole/contracts";

export function NodeChip({ node, onPress }: { node: Node; onPress: () => void }) {
  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <Text style={styles.text}>{node.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#e0e0e0", borderRadius: 16, marginRight: 8, marginBottom: 8 },
  text: { fontSize: 14 },
});
