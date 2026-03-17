import React from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";

export function LoadingStateBlock({ message = "Loading…" }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  text: { marginTop: 12, fontSize: 16 },
});
