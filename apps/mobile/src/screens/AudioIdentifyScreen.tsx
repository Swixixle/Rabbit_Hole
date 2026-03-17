/**
 * Audio Recognition Groundwork v1: "Identify audio" flow.
 * Real Microphone Capture v1: record short clip → send placeholder token → recognition (fixture-backed; recorded = no match).
 * Location Context v1: optional "Use location" / "Not now" prompt; when used, pass location to recognize.
 */
import React, { useState, useCallback, useRef } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { AudioRecognitionResult } from "@rabbit-hole/contracts";
import { api } from "../api/client";
import { addHistoryEntry } from "../utils/historyStore";
import { trackEvent } from "../utils/analytics";
import { OrganizationProfileSheet } from "../components/OrganizationProfileSheet";
import {
  requestRecordingPermission,
  setAudioModeForRecording,
  startRecording,
  normalizedRecordedClipToken,
  type RecordingRef,
} from "../utils/audioRecording";
import { getCurrentLocationContext } from "../utils/locationContext";

const SAMPLE_CLIPS: { clipId: string; label: string }[] = [
  { clipId: "sample-song", label: "Sample song" },
  { clipId: "sample-podcast", label: "Sample podcast" },
  { clipId: "sample-show-theme", label: "Sample show theme" },
  { clipId: "sample-tv-show", label: "Sample TV show" },
  { clipId: "sample-org-only", label: "Sample (org only)" },
];

export function AudioIdentifyScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AudioRecognitionResult | null>(null);
  const [noMatch, setNoMatch] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);
  const recordingRef = useRef<RecordingRef | null>(null);
  const [locationContext, setLocationContext] = useState<import("@rabbit-hole/contracts").LocationContext | null>(null);
  const [locationDeclined, setLocationDeclined] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const recognize = useCallback(
    async (clipIdOrToken: string) => {
      setLoading(true);
      setResult(null);
      setNoMatch(false);
      setRecordError(null);
      try {
        const res = await api.recognizeAudioClip(clipIdOrToken, locationContext);
        if (res) {
        setResult(res);
        trackEvent("audio_recognized", {
          kind: res.kind,
          hasArticle: !!res.articleId,
          hasMedia: !!res.mediaUrl,
          hasOrg: !!res.organizationId,
        });
      } else {
        setNoMatch(true);
      }
    } catch {
      setNoMatch(true);
    } finally {
      setLoading(false);
    }
  }, [locationContext]);

  const startRecordFlow = useCallback(async () => {
    setPermissionDenied(false);
    setRecordError(null);
    const granted = await requestRecordingPermission();
    if (!granted) {
      setPermissionDenied(true);
      return;
    }
    try {
      await setAudioModeForRecording();
      const ref = await startRecording();
      recordingRef.current = ref;
      setRecording(true);
    } catch {
      setRecordError("Recording could not start. Try again.");
    }
  }, []);

  const stopAndIdentify = useCallback(async () => {
    const ref = recordingRef.current;
    if (!ref) return;
    setRecording(false);
    recordingRef.current = null;
    try {
      const uri = await ref.stopAndGetUri();
      const token = normalizedRecordedClipToken(uri);
      await recognize(token);
    } catch {
      setRecordError("Recording failed. Try again.");
    }
  }, [recognize]);

  const openArticle = useCallback(
    (articleId: string, title: string) => {
      trackEvent("article_opened", { source: "audio", articleId });
      addHistoryEntry({ articleId, title, source: "audio" });
      (navigation as any).navigate("Article", { articleId });
      setResult(null);
    },
    [navigation]
  );

  const openMedia = useCallback(
    (mediaUrl: string) => {
      (navigation as any).navigate("ShareIntake", { sharedText: mediaUrl });
      setResult(null);
    },
    [navigation]
  );

  const retry = useCallback(() => {
    setNoMatch(false);
    setResult(null);
    setRecordError(null);
    setPermissionDenied(false);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={styles.spinner} />
        <Text style={styles.hint}>Identifying…</Text>
      </View>
    );
  }

  if (noMatch) {
    return (
      <View style={styles.container}>
        <Text style={styles.noMatchTitle}>No Rabbit Hole match yet.</Text>
        <Text style={styles.noMatchHint}>Try another clip or add one later.</Text>
        <Pressable style={styles.primaryButton} onPress={retry}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (permissionDenied) {
    return (
      <View style={styles.container}>
        <Text style={styles.noMatchTitle}>Microphone access needed</Text>
        <Text style={styles.noMatchHint}>
          To identify audio from the environment, allow microphone access in Settings. You can try again after enabling it.
        </Text>
        <Pressable style={styles.primaryButton} onPress={startRecordFlow}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (recordError) {
    return (
      <View style={styles.container}>
        <Text style={styles.noMatchTitle}>Recording failed</Text>
        <Text style={styles.noMatchHint}>{recordError}</Text>
        <Pressable style={styles.primaryButton} onPress={retry}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (recording) {
    return (
      <View style={styles.container}>
        <Text style={styles.recordingTitle}>Recording…</Text>
        <Text style={styles.recordingHint}>Tap below when you have a few seconds of audio.</Text>
        <Pressable style={styles.stopButton} onPress={stopAndIdentify}>
          <Text style={styles.primaryButtonText}>Stop & identify</Text>
        </Pressable>
      </View>
    );
  }

  if (result) {
    return (
      <View style={styles.container}>
        <Text style={styles.resultKind}>{result.kind}</Text>
        <Text style={styles.resultTitle}>{result.title}</Text>
        {result.subtitle ? <Text style={styles.resultSubtitle}>{result.subtitle}</Text> : null}
        {result.networkOrPlatform ? (
          <Text style={styles.resultMeta}>Network: {result.networkOrPlatform}</Text>
        ) : null}
        {result.notableCast && result.notableCast.length > 0 ? (
          <Text style={styles.resultMeta}>Cast: {result.notableCast.join(", ")}</Text>
        ) : null}
        <View style={styles.actions}>
          {result.articleId ? (
            <Pressable
              style={styles.primaryButton}
              onPress={() => openArticle(result!.articleId!, result!.title)}
            >
              <Text style={styles.primaryButtonText}>Open article</Text>
            </Pressable>
          ) : null}
          {result.mediaUrl ? (
            <Pressable style={styles.secondaryButton} onPress={() => openMedia(result!.mediaUrl!)}>
              <Text style={styles.secondaryButtonText}>View media</Text>
            </Pressable>
          ) : null}
          {result.organizationId ? (
            <Pressable
              style={styles.secondaryButton}
              onPress={() => setSelectedOrgId(result!.organizationId!)}
            >
              <Text style={styles.secondaryButtonText}>Organization profile</Text>
            </Pressable>
          ) : null}
        </View>
        <Pressable style={styles.backLink} onPress={retry}>
          <Text style={styles.backLinkText}>Identify another</Text>
        </Pressable>
        <OrganizationProfileSheet
          organizationId={selectedOrgId}
          visible={!!selectedOrgId}
          onDismiss={() => setSelectedOrgId(null)}
          onOpenArticle={(aid) => {
            setSelectedOrgId(null);
            (navigation as any).navigate("Article", { articleId: aid });
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Identify audio</Text>
      <Text style={styles.subtitle}>Record a short clip of the audio you want to identify.</Text>
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
      <Pressable style={styles.primaryButton} onPress={startRecordFlow}>
        <Text style={styles.primaryButtonText}>Record</Text>
      </Pressable>
      <Text style={styles.sampleSectionLabel}>Try a sample (for testing)</Text>
      {SAMPLE_CLIPS.map(({ clipId, label }) => (
        <Pressable
          key={clipId}
          style={styles.sampleButton}
          onPress={() => recognize(clipId)}
        >
          <Text style={styles.sampleButtonText}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 24 },
  primaryButton: { backgroundColor: "#333", padding: 16, borderRadius: 8, alignItems: "center", marginBottom: 12 },
  stopButton: { backgroundColor: "#b71c1c", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 24 },
  sampleSectionLabel: { fontSize: 12, color: "#888", marginTop: 16, marginBottom: 8 },
  sampleButton: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  sampleButtonText: { fontSize: 16, color: "#333" },
  recordingTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  recordingHint: { fontSize: 14, color: "#666" },
  spinner: { marginTop: 48 },
  hint: { fontSize: 14, color: "#666", marginTop: 12, textAlign: "center" },
  noMatchTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  noMatchHint: { fontSize: 14, color: "#666", marginBottom: 24 },
  resultKind: { fontSize: 12, textTransform: "uppercase", color: "#666", marginBottom: 4 },
  resultTitle: { fontSize: 20, fontWeight: "600", marginBottom: 4 },
  resultSubtitle: { fontSize: 14, color: "#666", marginBottom: 4 },
  resultMeta: { fontSize: 13, color: "#888", marginBottom: 4 },
  actions: { gap: 12, marginTop: 16, marginBottom: 24 },
  primaryButtonText: { color: "#fff", fontSize: 16 },
  secondaryButton: { padding: 16, alignItems: "center" },
  secondaryButtonText: { color: "#0066cc", fontSize: 16 },
  backLink: { padding: 12, alignItems: "center" },
  backLinkText: { fontSize: 14, color: "#888" },
  locationPrompt: { marginBottom: 16 },
  locationHint: { fontSize: 13, color: "#666", marginBottom: 8 },
  locationButtons: { flexDirection: "row", gap: 12, alignItems: "center" },
  locationUseButton: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: "#e8e8e8", borderRadius: 8 },
  locationButtonText: { fontSize: 14, color: "#333" },
  locationSkipButton: { paddingVertical: 10, paddingHorizontal: 12 },
  locationSkipText: { fontSize: 14, color: "#888" },
});
