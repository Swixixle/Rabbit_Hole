import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from "react-native";
import type { ArticleMarket, MarketItem } from "@rabbit-hole/contracts";

const MEDICAL_PANEL_WARNING =
  "Information only — not medical advice. Talk to a licensed clinician or pharmacist before making treatment decisions.";

export function MarketSheet({
  market,
  visible,
  onDismiss,
  onItemPress,
}: {
  market: ArticleMarket | null;
  visible: boolean;
  onDismiss: () => void;
  /** Called when user taps an item; caller handles external/search/internal and may close sheet. */
  onItemPress: (item: MarketItem) => void;
}) {
  if (!visible) return null;

  const items = market?.items ?? [];
  const hasMedical = items.some((i) => i.category === "medical_info");

  const handleItemPress = (item: MarketItem) => {
    onItemPress(item);
  };

  return (
    <Modal transparent visible animationType="slide">
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>{market?.title ?? "Market"}</Text>
            <Pressable onPress={onDismiss}>
              <Text style={styles.dismiss}>Close</Text>
            </Pressable>
          </View>
          {market?.intro ? (
            <Text style={styles.intro}>{market.intro}</Text>
          ) : null}
          {hasMedical ? (
            <View style={styles.warningBlock}>
              <Text style={styles.warningText}>{MEDICAL_PANEL_WARNING}</Text>
            </View>
          ) : null}
          <ScrollView style={styles.scroll}>
            {items.map((item) => (
              <Pressable
                key={item.id}
                style={styles.item}
                onPress={() => handleItemPress(item)}
              >
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.subtitle ? (
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                ) : null}
                {item.description ? (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                ) : null}
                {item.category === "medical_info" && item.warning ? (
                  <Text style={styles.itemWarning}>{item.warning}</Text>
                ) : null}
                {item.actionLabel ? (
                  <Text style={styles.itemAction}>{item.actionLabel}</Text>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: "75%", padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { fontSize: 18, fontWeight: "600" },
  dismiss: { color: "#0066cc" },
  intro: { fontSize: 14, color: "#555", marginBottom: 12, lineHeight: 20 },
  warningBlock: { backgroundColor: "#fff8e1", padding: 12, borderRadius: 8, marginBottom: 12 },
  warningText: { fontSize: 12, color: "#5d4037", lineHeight: 18 },
  scroll: { maxHeight: 360 },
  item: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  itemTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  itemSubtitle: { fontSize: 13, color: "#666", marginTop: 2 },
  itemDescription: { fontSize: 13, color: "#555", marginTop: 4, lineHeight: 18 },
  itemWarning: { fontSize: 11, color: "#795548", marginTop: 6, fontStyle: "italic", lineHeight: 16 },
  itemAction: { fontSize: 13, color: "#1565c0", marginTop: 6, fontWeight: "500" },
});
