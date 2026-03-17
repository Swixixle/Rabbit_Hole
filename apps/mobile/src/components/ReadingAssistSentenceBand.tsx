/**
 * Reading-Assist v4/v5: enlargement surface for the focused sentence with optional Previous/Next progression.
 * Presentation-only; rendered below the focused block paragraph when a sentence is focused.
 */
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export interface ReadingAssistSentenceBandProps {
  sentenceText: string;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  /** Optional subtle progress label e.g. "2 / 5". */
  progressLabel?: string;
}

export function ReadingAssistSentenceBand({
  sentenceText,
  onPrevious,
  onNext,
  canGoPrevious = false,
  canGoNext = false,
  progressLabel,
}: ReadingAssistSentenceBandProps) {
  return (
    <View style={styles.band}>
      <Text style={styles.text}>{sentenceText}</Text>
      {(onPrevious != null || onNext != null) && (
        <View style={styles.controls}>
          <Pressable
            onPress={canGoPrevious ? onPrevious : undefined}
            style={[styles.control, !canGoPrevious && styles.controlDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Previous sentence"
          >
            <Text style={[styles.controlText, !canGoPrevious && styles.controlTextDisabled]}>
              Previous
            </Text>
          </Pressable>
          {progressLabel != null && progressLabel !== "" && (
            <Text style={styles.progressLabel}>{progressLabel}</Text>
          )}
          <Pressable
            onPress={canGoNext ? onNext : undefined}
            style={[styles.control, !canGoNext && styles.controlDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Next sentence"
          >
            <Text style={[styles.controlText, !canGoNext && styles.controlTextDisabled]}>
              Next
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 8,
    marginHorizontal: 0,
  },
  text: {
    fontSize: 20,
    lineHeight: 28,
    color: "#111",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 12,
  },
  control: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  controlDisabled: {
    opacity: 0.5,
  },
  controlText: {
    fontSize: 13,
    color: "#444",
  },
  controlTextDisabled: {
    color: "#999",
  },
  progressLabel: {
    fontSize: 11,
    color: "#888",
  },
});
