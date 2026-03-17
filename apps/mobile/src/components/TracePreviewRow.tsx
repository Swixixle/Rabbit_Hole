import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { TracePreview } from "@rabbit-hole/contracts";

export function TracePreviewRow({
  trace,
  onNodePress,
}: {
  trace: TracePreview;
  onNodePress?: (nodeId: string) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.path}>
        {trace.path.map((n, i) => (
          <React.Fragment key={n.nodeId}>
            <Pressable onPress={() => onNodePress?.(n.nodeId)}>
              <Text style={styles.nodeName}>{n.name}</Text>
            </Pressable>
            {i < trace.path.length - 1 && <Text style={styles.arrow}> → </Text>}
          </React.Fragment>
        ))}
      </View>
      <Text style={styles.label}>{trace.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  path: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  nodeName: { color: "#0066cc", fontSize: 15 },
  arrow: { fontSize: 14, color: "#666" },
  label: { fontSize: 12, color: "#666", marginTop: 4 },
});
