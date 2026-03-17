import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from "react-native";
import type { ArticleStudyGuide, StudyBlock } from "../types/study";
import { useReadingAssist } from "../context/ReadingAssistContext";
import { getSentenceAnchorsForStudyBlock } from "../types/readingAssist";

export function StudySheet({
  guide,
  visible,
  onDismiss,
}: {
  guide: ArticleStudyGuide | null;
  visible: boolean;
  onDismiss: () => void;
}) {
  if (!visible) return null;

  const blocks = guide?.blocks ?? [];
  const readingAssist = useReadingAssist();

  return (
    <Modal transparent visible animationType="slide">
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>{guide?.title ?? "Study"}</Text>
            <Pressable onPress={onDismiss}>
              <Text style={styles.dismiss}>Close</Text>
            </Pressable>
          </View>
          {guide?.intro ? (
            <Text style={styles.intro}>{guide.intro}</Text>
          ) : null}
          {readingAssist && (
            <View style={styles.readingFocusRow}>
              <Text style={styles.readingFocusLabel}>Reading focus</Text>
              <View style={styles.readingFocusToggles}>
                <Pressable
                  style={[styles.focusToggle, readingAssist.mode === "off" && styles.focusToggleActive]}
                  onPress={() => readingAssist.setMode("off")}
                >
                  <Text style={styles.focusToggleText}>Off</Text>
                </Pressable>
                <Pressable
                  style={[styles.focusToggle, readingAssist.mode === "focus_block" && styles.focusToggleActive]}
                  onPress={() => readingAssist.setMode("focus_block")}
                >
                  <Text style={styles.focusToggleText}>Focus block</Text>
                </Pressable>
              </View>
            </View>
          )}
          <ScrollView style={styles.scroll}>
            {blocks.map((block) => (
              <StudyBlockView
                key={block.id}
                block={block}
                isFocused={readingAssist?.isBlockFocused(block.id, "study") ?? false}
                isDeemphasized={(readingAssist?.isAnyBlockFocused ?? false) && !(readingAssist?.isBlockFocused(block.id, "study") ?? false)}
                onPress={readingAssist ? () => {
                  const focused = readingAssist.isBlockFocused(block.id, "study");
                  if (focused) readingAssist.setFocus(null, null);
                  else readingAssist.setFocus(block.id, "study");
                } : undefined}
              />
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

function StudyBlockView({
  block,
  isFocused,
  isDeemphasized,
  onPress,
}: {
  block: StudyBlock;
  isFocused: boolean;
  isDeemphasized: boolean;
  onPress?: () => void;
}) {
  const _sentenceAnchors = getSentenceAnchorsForStudyBlock(
    block.content,
    block.bulletItems,
    block.id
  );
  const content = (
    <View style={[styles.block, isFocused && styles.blockFocused, isDeemphasized && styles.blockDeemphasized]}>
      <Text style={styles.blockTitle}>{block.title}</Text>
      {block.content ? (
        <Text style={styles.blockContent}>{block.content}</Text>
      ) : null}
      {block.bulletItems?.length ? (
        <View style={styles.bulletList}>
          {block.bulletItems.map((item, i) => (
            <Text key={i} style={styles.bulletItem}>
              • {item}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "80%",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "600" },
  dismiss: { color: "#0066cc" },
  intro: { fontSize: 14, color: "#555", marginBottom: 12, lineHeight: 20 },
  scroll: { maxHeight: 400 },
  block: { marginBottom: 20 },
  blockFocused: { backgroundColor: "#f5f5f5", padding: 12, borderRadius: 8 },
  blockDeemphasized: { opacity: 0.88 },
  blockTitle: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 6 },
  blockContent: { fontSize: 14, color: "#444", lineHeight: 20, marginBottom: 6 },
  bulletList: { marginTop: 4 },
  bulletItem: { fontSize: 14, color: "#444", lineHeight: 22, marginBottom: 2 },
  readingFocusRow: { marginBottom: 12 },
  readingFocusLabel: { fontSize: 12, color: "#666", marginBottom: 6 },
  readingFocusToggles: { flexDirection: "row", gap: 8 },
  focusToggle: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#f0f0f0" },
  focusToggleActive: { backgroundColor: "#e3f2fd" },
  focusToggleText: { fontSize: 13, color: "#333" },
});
