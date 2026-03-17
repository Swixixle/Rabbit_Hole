/**
 * Rabbit Hole Core Groundwork v12 — Saved object tray.
 * Horizontal scrollable line of saved items; each preserves traceability.
 */
import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import type { SavedObjectItem } from "../../types/savedObjects";
import { VerificationBadge } from "./VerificationBadge";

type Props = {
  items: SavedObjectItem[];
  onPressItem: (item: SavedObjectItem) => void;
  emptyText?: string;
};

export function SavedObjectTray({
  items,
  onPressItem,
  emptyText = "No saved objects yet.",
}: Props) {
  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Saved objects</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={styles.tile}
            onPress={() => onPressItem(item)}
          >
            <Text style={styles.label} numberOfLines={2}>
              {item.label}
            </Text>
            <VerificationBadge kind={item.verificationKind} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16, marginBottom: 8 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(0,0,0,0.5)",
    marginBottom: 8,
  },
  scrollContent: { paddingRight: 16, gap: 8 },
  tile: {
    minWidth: 100,
    maxWidth: 120,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  label: { fontSize: 13, color: "#333", marginBottom: 4 },
  empty: { marginTop: 16 },
  emptyText: { fontSize: 13, color: "rgba(0,0,0,0.5)" },
});
