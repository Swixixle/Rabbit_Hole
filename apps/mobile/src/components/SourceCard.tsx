import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { Source } from "@rabbit-hole/contracts";
import { SourceTypeBadge } from "./SourceTypeBadge";

export function SourceCard({
  source,
  onPress,
  onPressOrganization,
}: {
  source: Source;
  onPress: () => void;
  /** Organization/Company Profile v1: when set and source has organizationId, show Organization entry. */
  onPressOrganization?: (orgId: string) => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <SourceTypeBadge sourceType={source.type} />
      <Text style={styles.title} numberOfLines={2}>{source.title}</Text>
      {source.publisher && <Text style={styles.publisher}>{source.publisher}</Text>}
      {source.organizationId && onPressOrganization ? (
        <Pressable
          style={styles.orgLink}
          onPress={(e) => {
            e.stopPropagation();
            onPressOrganization(source.organizationId!);
          }}
        >
          <Text style={styles.orgLinkText}>Organization</Text>
        </Pressable>
      ) : null}
      {source.contentHash && (
        <View style={styles.hashBadge}>
          <Text style={styles.hashText}>Hash</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  title: { fontSize: 16, marginTop: 4 },
  publisher: { fontSize: 12, color: "#666", marginTop: 2 },
  orgLink: { marginTop: 6, alignSelf: "flex-start" },
  orgLinkText: { fontSize: 13, color: "#0066cc" },
  hashBadge: { marginTop: 4, alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#e8f5e9" },
  hashText: { fontSize: 10 },
});
