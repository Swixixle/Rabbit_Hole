import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { Question } from "@rabbit-hole/contracts";

export function QuestionCard({ question, onPress }: { question: Question; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.text}>{question.text}</Text>
      {question.category && <Text style={styles.category}>{question.category}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, backgroundColor: "#f5f5f5", borderRadius: 8, marginBottom: 8 },
  text: { fontSize: 15 },
  category: { fontSize: 11, color: "#666", marginTop: 4 },
});
