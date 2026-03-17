import React, { useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, TextInput, ScrollView, ActivityIndicator, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import type { SearchResult } from "@rabbit-hole/contracts";
import { LoadingStateBlock } from "../components/LoadingStateBlock";
import { EmptyStateBlock } from "../components/EmptyStateBlock";
import { api } from "../api/client";
import { addHistoryEntry } from "../utils/historyStore";
import { trackEvent } from "../utils/analytics";
import { extractTextFromImage } from "../utils/pageCapture";

export function HomeScreen({
  onImageReady,
  onOpenLiveLens,
  onOpenShareIntake,
  onOpenShareIntakeWithText,
  onOpenShareIntakeWithCaptions,
  onOpenAudioIdentify,
  onOpenSceneExplore,
  onOpenCameraCapture,
  initialSearchQuery,
}: {
  onImageReady: (uploadId: string, imageUri: string) => void;
  onOpenLiveLens?: () => void;
  onOpenShareIntake?: () => void;
  onOpenShareIntakeWithText?: (text: string) => void;
  /** Live subtitle groundwork: open Share Intake in captions mode (paste captions/transcript). */
  onOpenShareIntakeWithCaptions?: () => void;
  onOpenAudioIdentify?: () => void;
  /** Open sample scene (tap object → node → branches). */
  onOpenSceneExplore?: () => void;
  /** Open camera capture for real pipeline flow (v14). */
  onOpenCameraCapture?: () => void;
  /** When set (e.g. from Market resolution), run search and show results. */
  initialSearchQuery?: string;
}) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [pageCaptureReading, setPageCaptureReading] = useState(false);
  const [pageCaptureError, setPageCaptureError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const list = await api.search(trimmed);
      trackEvent("search_executed", { queryLength: trimmed.length, resultCount: list.length });
      setSearchResults(list);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (initialSearchQuery?.trim()) {
      const q = initialSearchQuery.trim();
      setSearchQuery(q);
      runSearch(q);
    }
  }, [initialSearchQuery, runSearch]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    runSearch(text);
  }, [runSearch]);

  const openArticle = useCallback(
    (result: SearchResult) => {
      const articleId = result.articleId;
      if (articleId) {
        trackEvent("search_result_selected", { source: "search", articleId });
        trackEvent("article_opened", { source: "search", articleId });
        addHistoryEntry({
          articleId,
          title: result.title,
          subtitle: result.summary,
          source: "search",
        });
        (navigation as any).navigate("Article", { articleId });
      }
    },
    [navigation]
  );

  const pickImage = async () => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Permission to access photos is required.");
      return;
    }
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
      if (result.canceled || !result.assets[0]) {
        setLoading(false);
        return;
      }
      const uri = result.assets[0].uri;
      const res = await api.uploadImage(uri);
      // EXPERIENCE LAYER HOOK: Transition trigger boundary. After capture success,
      // the Exploration Transition will run here (see docs/architecture/experience-layer.md).
      // For first slice we navigate directly; later RabbitHoleTransition will animate then navigate.
      onImageReady(res.uploadId, uri);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const scanPage = useCallback(async () => {
    setPageCaptureError(null);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setPageCaptureError("Camera permission is required to scan a page.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    setPageCaptureReading(true);
    try {
      const { text, confidence } = await extractTextFromImage(uri);
      if (text.trim()) {
        trackEvent("page_capture_completed", { confidence: confidence ?? "unknown", textLength: text.trim().length });
        onOpenShareIntakeWithText?.(text.trim());
      } else {
        setPageCaptureError("Couldn't read text from this image. Try again or paste text manually.");
      }
    } catch {
      setPageCaptureError("Couldn't read text from this image. Try again or paste text manually.");
    } finally {
      setPageCaptureReading(false);
    }
  }, [onOpenShareIntakeWithText]);

  if (loading) return <LoadingStateBlock message="Uploading…" />;
  if (pageCaptureReading) return <LoadingStateBlock message="Reading page…" />;
  if (pageCaptureError)
    return (
      <EmptyStateBlock
        message={pageCaptureError}
        actionLabel="Try again"
        onAction={() => setPageCaptureError(null)}
      />
    );
  if (error) return <EmptyStateBlock message={error} actionLabel="Try again" onAction={() => setError(null)} />;

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search or explore anything..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearchChange}
          returnKeyType="search"
        />
        {searching && <ActivityIndicator size="small" style={styles.searchSpinner} />}
      </View>
      {searchQuery.trim() !== "" && (
        <View style={styles.resultsSection}>
          {searching && searchResults.length === 0 ? (
            <Text style={styles.resultsHint}>Searching…</Text>
          ) : searchResults.length === 0 ? (
            <Text style={styles.resultsEmpty}>No results yet.</Text>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled" style={styles.resultsScroll}>
              {searchResults.map((r) => (
                <Pressable
                  key={`${r.nodeId}-${r.articleId || ""}`}
                  style={styles.resultRow}
                  onPress={() => openArticle(r)}
                >
                  {r.imageUrl ? (
                    <Image source={{ uri: r.imageUrl }} style={styles.resultThumb} />
                  ) : null}
                  <View style={styles.resultText}>
                    <Text style={styles.resultTitle}>{r.title}</Text>
                    {r.summary ? <Text style={styles.resultSummary} numberOfLines={2}>{r.summary}</Text> : null}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      )}
      <Text style={styles.title}>Rabbit Hole</Text>
      <Text style={styles.subtitle}>Tap something in a photo to explore.</Text>
      <Pressable style={styles.primaryButton} onPress={pickImage}>
        <Text style={styles.primaryButtonText}>Upload image</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={pickImage}>
        <Text style={styles.secondaryButtonText}>Take photo (same as upload for now)</Text>
      </Pressable>
      {onOpenLiveLens ? (
        <Pressable style={styles.secondaryButton} onPress={onOpenLiveLens}>
          <Text style={styles.secondaryButtonText}>Live Lens</Text>
        </Pressable>
      ) : null}
      {onOpenShareIntakeWithText ? (
        <Pressable style={styles.secondaryButton} onPress={scanPage}>
          <Text style={styles.secondaryButtonText}>Scan page</Text>
        </Pressable>
      ) : null}
      {onOpenShareIntakeWithCaptions ? (
        <Pressable style={styles.secondaryButton} onPress={onOpenShareIntakeWithCaptions}>
          <Text style={styles.secondaryButtonText}>Paste captions</Text>
        </Pressable>
      ) : null}
      {onOpenAudioIdentify ? (
        <Pressable style={styles.secondaryButton} onPress={onOpenAudioIdentify}>
          <Text style={styles.secondaryButtonText}>Identify audio</Text>
        </Pressable>
      ) : null}
      {onOpenSceneExplore ? (
        <Pressable style={styles.secondaryButton} onPress={onOpenSceneExplore}>
          <Text style={styles.secondaryButtonText}>Try sample (tap → node → explore)</Text>
        </Pressable>
      ) : null}
      {onOpenCameraCapture ? (
        <Pressable style={styles.secondaryButton} onPress={onOpenCameraCapture}>
          <Text style={styles.secondaryButtonText}>Capture object (camera)</Text>
        </Pressable>
      ) : null}
      {onOpenShareIntake ? (
        <Pressable style={styles.devLink} onPress={onOpenShareIntake}>
          <Text style={styles.devLinkText}>Open in Rabbit Hole</Text>
        </Pressable>
      ) : null}
      {onOpenShareIntakeWithText ? (
        <Pressable style={styles.devLink} onPress={() => onOpenShareIntakeWithText("coffee cup recycling")}>
          <Text style={styles.devLinkText}>Simulate share: coffee</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 16 },
  searchSection: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  searchSpinner: { marginLeft: 8 },
  resultsSection: { minHeight: 80, marginBottom: 24 },
  resultsScroll: { maxHeight: 200 },
  resultsHint: { fontSize: 14, color: "#666", marginBottom: 8 },
  resultsEmpty: { fontSize: 14, color: "#666", marginBottom: 8 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultThumb: { width: 48, height: 48, borderRadius: 6, marginRight: 12 },
  resultText: { flex: 1 },
  resultTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  resultSummary: { fontSize: 13, color: "#666", marginTop: 4 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 32 },
  primaryButton: { backgroundColor: "#333", padding: 16, borderRadius: 8, alignItems: "center", marginBottom: 12 },
  primaryButtonText: { color: "#fff", fontSize: 16 },
  secondaryButton: { padding: 16, alignItems: "center" },
  secondaryButtonText: { color: "#0066cc" },
  devLink: { padding: 12, alignItems: "center", marginTop: 8 },
  devLinkText: { fontSize: 13, color: "#888" },
});
