import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export function EmptyStateBlock({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      {actionLabel && onAction && (
        <Pressable style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  text: { fontSize: 16, textAlign: "center", marginBottom: 16 },
  button: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#333" },
  buttonText: { color: "#fff" },
});
