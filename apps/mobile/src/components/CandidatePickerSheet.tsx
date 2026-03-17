import React from "react";
import { View, Text, Image, Pressable, StyleSheet, Modal } from "react-native";
import type { ImageSegment } from "@rabbit-hole/contracts";

export function CandidatePickerSheet({
  candidates,
  onSelect,
  onDismiss,
  visible,
}: {
  candidates: ImageSegment[];
  onSelect: (c: ImageSegment) => void;
  onDismiss: () => void;
  visible: boolean;
}) {
  if (!visible) return null;
  const isSingleUnknown =
    candidates.length === 1 && candidates[0].segmentId === "seg-unknown";
  const isMultiple = candidates.length > 1;
  const title = isSingleUnknown
    ? "What did you tap?"
    : isMultiple
      ? "Pick what you meant"
      : "What did you tap?";
  const subtitle = isSingleUnknown
    ? "No article here. Try tapping a different object or cancel."
    : isMultiple
      ? "We found more than one match. Choose one to explore."
      : "Choose one to explore. Low confidence options are marked.";

  return (
    <Modal transparent visible animationType="slide">
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {candidates.map((c) => (
            <Pressable
              key={c.segmentId}
              style={styles.option}
              onPress={() => onSelect(c)}
            >
              <Text style={styles.optionLabel}>{c.label}</Text>
              <Text style={[styles.confidence, (typeof c.confidence === "string" && c.confidence === "low") && styles.confidenceLow]}>
                {typeof c.confidence === "string" ? c.confidence : "medium"}
              </Text>
              <Text style={styles.explore}>Explore this</Text>
            </Pressable>
          ))}
          <Pressable style={styles.cancel} onPress={onDismiss}>
            <Text>Cancel</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 20 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#666", marginBottom: 16 },
  option: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
  optionLabel: { fontSize: 16 },
  confidence: { fontSize: 12, color: "#666", marginTop: 2 },
  confidenceLow: { color: "#b71c1c" },
  explore: { marginTop: 6, color: "#0066cc", fontWeight: "600" },
  cancel: { marginTop: 16, alignItems: "center" },
});
