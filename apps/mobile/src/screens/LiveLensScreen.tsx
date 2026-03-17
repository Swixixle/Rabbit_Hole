/**
 * Live Camera Recognition Groundwork v1: capture a frame and hand off to ImageFocus.
 * Location Context v1: optional "Use location" / "Not now" before capture; when used, pass location to image flow.
 */
import React, { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { captureAndUploadFrame } from "../utils/liveLensHandoff";
import { api } from "../api/client";
import { LoadingStateBlock } from "../components/LoadingStateBlock";
import { EmptyStateBlock } from "../components/EmptyStateBlock";
import { getCurrentLocationContext } from "../utils/locationContext";

export function LiveLensScreen({
  onImageReady,
}: {
  /** On successful capture+upload, call with (uploadId, imageUri, optional locationContext). */
  onImageReady: (uploadId: string, imageUri: string, locationContext?: import("@rabbit-hole/contracts").LocationContext) => void;
}) {
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationContext, setLocationContext] = useState<import("@rabbit-hole/contracts").LocationContext | null>(null);
  const [locationDeclined, setLocationDeclined] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleCapture = useCallback(async () => {
    setError(null);
    setCapturing(true);
    try {
      const result = await captureAndUploadFrame(api.uploadImage);
      if (result.ok) {
        onImageReady(result.uploadId, result.imageUri, locationContext ?? undefined);
        return;
      }
      setError(result.error);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setCapturing(false);
    }
  }, [onImageReady, locationContext]);

  if (capturing) return <LoadingStateBlock message="Capturing…" />;
  if (error)
    return (
      <EmptyStateBlock
        message={error}
        actionLabel="Try again"
        onAction={() => setError(null)}
      />
    );

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Point at something, then tap Capture.</Text>
      {!locationContext && !locationDeclined ? (
        <View style={styles.locationPrompt}>
          <Text style={styles.locationHint}>Location could improve identification.</Text>
          <View style={styles.locationButtons}>
            <Pressable
              style={styles.locationUseButton}
              onPress={async () => {
                setLocationLoading(true);
                const ctx = await getCurrentLocationContext();
                setLocationContext(ctx ?? null);
                setLocationLoading(false);
              }}
              disabled={locationLoading}
            >
              <Text style={styles.locationButtonText}>{locationLoading ? "…" : "Use location"}</Text>
            </Pressable>
            <Pressable style={styles.locationSkipButton} onPress={() => setLocationDeclined(true)}>
              <Text style={styles.locationSkipText}>Not now</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      <Pressable style={styles.captureButton} onPress={handleCapture}>
        <Text style={styles.captureButtonText}>Capture</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  hint: { fontSize: 16, color: "#666", marginBottom: 24, textAlign: "center" },
  locationPrompt: { marginBottom: 20 },
  locationHint: { fontSize: 13, color: "#666", marginBottom: 8 },
  locationButtons: { flexDirection: "row", gap: 12, alignItems: "center" },
  locationUseButton: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: "#e8e8e8", borderRadius: 8 },
  locationButtonText: { fontSize: 14, color: "#333" },
  locationSkipButton: { paddingVertical: 10, paddingHorizontal: 12 },
  locationSkipText: { fontSize: 14, color: "#888" },
  captureButton: { backgroundColor: "#333", paddingHorizontal: 32, paddingVertical: 16, borderRadius: 8 },
  captureButtonText: { color: "#fff", fontSize: 16 },
});
