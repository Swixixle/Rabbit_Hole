/**
 * Rabbit Hole v14 — Real camera capture for pipeline stress test.
 * Capture photo → create RecognitionEnvelope → hand off to review flow.
 */
import React, { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { createRecognitionEnvelopeFromCapturedImage } from "../utils/recognitionEnvelopeFactory";
import type { RecognitionEnvelope } from "../types/recognition";

type Props = {
  onCaptured: (envelope: RecognitionEnvelope, imageUri: string) => void;
};

export function CameraCaptureScreen({ onCaptured }: Props) {
  const [error, setError] = useState<string | null>(null);

  const handleCapture = useCallback(async () => {
    setError(null);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      setError("Camera permission is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const uri = asset.uri;
    const envelope = createRecognitionEnvelopeFromCapturedImage({
      imageUri: uri,
      mimeType: asset.mimeType ?? undefined,
      captureSource: "camera",
      width: asset.width ?? undefined,
      height: asset.height ?? undefined,
    });
    onCaptured(envelope, uri);
  }, [onCaptured]);

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Take a photo of an object to add it to your collection.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.button} onPress={handleCapture}>
        <Text style={styles.buttonText}>Take photo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
  hint: { fontSize: 15, color: "rgba(0,0,0,0.7)", textAlign: "center", marginBottom: 24 },
  error: { fontSize: 14, color: "#c00", marginBottom: 16 },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: "#333",
    borderRadius: 10,
  },
  buttonText: { fontSize: 16, color: "#fff", fontWeight: "600" },
});
