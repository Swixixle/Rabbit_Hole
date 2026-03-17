import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import type { ArticleExperience, ExperienceStep } from "@rabbit-hole/contracts";

export function ExperienceStepper({
  experience,
  onStepPress,
  highlightedStepId,
}: {
  experience: ArticleExperience;
  onStepPress: (step: ExperienceStep) => void;
  highlightedStepId?: string | null;
}) {
  const steps = experience.steps || [];
  if (steps.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {experience.mode === "lifecycle" ? "Lifecycle" : "Follow the system"}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {steps.map((step, i) => (
          <Pressable
            key={step.id}
            style={[
              styles.step,
              highlightedStepId === step.id && styles.stepHighlighted,
            ]}
            onPress={() => onStepPress(step)}
          >
            {i > 0 && <Text style={styles.arrow}>→</Text>}
            <Text style={styles.stepShortTitle} numberOfLines={1}>
              {step.shortTitle}
            </Text>
            {step.description ? (
              <Text style={styles.stepDesc} numberOfLines={2}>
                {step.description}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  title: { fontSize: 12, fontWeight: "600", color: "#666", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 },
  scroll: { marginHorizontal: -16 },
  step: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
    minWidth: 100,
    maxWidth: 140,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  stepHighlighted: { backgroundColor: "#e3f2fd" },
  arrow: { fontSize: 10, color: "#999", marginBottom: 2 },
  stepShortTitle: { fontSize: 13, fontWeight: "600", color: "#333" },
  stepDesc: { fontSize: 11, color: "#666", marginTop: 2 },
});
