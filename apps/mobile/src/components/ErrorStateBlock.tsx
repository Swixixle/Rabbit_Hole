import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export function ErrorStateBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      {onRetry && (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Try again</Text>
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
