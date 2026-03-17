import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { SearchResult, MediaReference, MediaInterpretation, VerificationResponse } from "@rabbit-hole/contracts";
import { api } from "../api/client";
import { normalizeSharedInput, maybeExtractSearchString, isLikelyMediaUrl } from "../utils/sharedInput";
import { addHistoryEntry } from "../utils/historyStore";
import { trackEvent } from "../utils/analytics";
import { MediaInterpretationSheet } from "../components/MediaInterpretationSheet";
import { VerifySheet } from "./VerifySheet";
import { OrganizationProfileSheet } from "../components/OrganizationProfileSheet";

export type ShareIntakeParams = { sharedText?: string; inputSource?: "paste" | "ocr" | "subtitle" };

export function ShareIntakeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const initialText = (route.params as ShareIntakeParams | undefined)?.sharedText ?? "";
  const initialInputSource = (route.params as ShareIntakeParams | undefined)?.inputSource;

  const [inputText, setInputText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [state, setState] = useState<"idle" | "resolving" | "results" | "no_results" | "media_unmapped" | "media_interpretation">("idle");
  const [mediaUnmappedRef, setMediaUnmappedRef] = useState<MediaReference | null>(null);
  const [mediaInterpretation, setMediaInterpretation] = useState<MediaInterpretation | null>(null);
  const [mediaSheetVisible, setMediaSheetVisible] = useState(false);
  const [mediaVerifyBundle, setMediaVerifyBundle] = useState<VerificationResponse | null>(null);
  const [mediaVerifyVisible, setMediaVerifyVisible] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [inputSource, setInputSource] = useState<"paste" | "ocr" | "subtitle">(initialInputSource ?? "paste");
  const didNavigateSingle = useRef(false);

  const openArticleFromMedia = useCallback(
    (ref: MediaReference, interpretation: MediaInterpretation | null) => {
      if (!ref.articleId) return;
      trackEvent("article_opened", { source: "share", articleId: ref.articleId });
      addHistoryEntry({
        articleId: ref.articleId,
        title: ref.title ?? "",
        source: "share",
      });
      (navigation as any).navigate("Article", {
        articleId: ref.articleId,
        mediaInterpretation: interpretation ?? undefined,
      });
    },
    [navigation]
  );

  const runSearchOnly = useCallback(async (raw: string) => {
    const searchString = maybeExtractSearchString(raw);
    if (!searchString) {
      setSearchResults([]);
      setState("idle");
      setMediaUnmappedRef(null);
      setMediaInterpretation(null);
      setMediaSheetVisible(false);
      return;
    }
    setState("resolving");
    setMediaUnmappedRef(null);
    setMediaInterpretation(null);
    setMediaSheetVisible(false);
    try {
      const list = await api.search(searchString);
      setSearchResults(list);
      setState(list.length === 0 ? "no_results" : "results");
      trackEvent("share_intake_resolved", { resultCount: list.length, hadSelection: false });
    } catch {
      setSearchResults([]);
      setState("no_results");
      trackEvent("share_intake_resolved", { resultCount: 0, hadSelection: false });
    }
  }, []);

  const runSearch = useCallback(async (raw: string) => {
    const normalized = normalizeSharedInput(raw);
    const searchString = maybeExtractSearchString(raw);
    if (!searchString) {
      setSearchResults([]);
      setState("idle");
      setMediaUnmappedRef(null);
      setHasSearched(false);
      return;
    }
    didNavigateSingle.current = false;
    setState("resolving");
    setHasSearched(true);
    setMediaUnmappedRef(null);

    if (isLikelyMediaUrl(normalized)) {
      const media = await api.resolveMediaUrl(normalized);
      if (media) {
        const interpretation = await api.getMediaInterpretation(normalized);
        if (media.articleId) {
          openArticleFromMedia(media, interpretation);
          return;
        }
        if (interpretation) {
          setMediaInterpretation(interpretation);
          setState("media_interpretation");
          setMediaSheetVisible(true);
          return;
        }
        setState("media_unmapped");
        setMediaUnmappedRef(media);
        return;
      }
    }

    try {
      const list = await api.search(searchString);
      setSearchResults(list);
      if (list.length === 0) {
        setState("no_results");
        trackEvent("share_intake_resolved", { resultCount: 0, hadSelection: false });
      } else {
        setState("results");
        trackEvent("share_intake_resolved", { resultCount: list.length, hadSelection: false });
      }
    } catch {
      setSearchResults([]);
      setState("no_results");
      trackEvent("share_intake_resolved", { resultCount: 0, hadSelection: false });
    }
  }, [openArticleFromMedia]);

  useEffect(() => {
    const normalized = normalizeSharedInput(initialText);
    if (normalized) {
      trackEvent("share_intake_opened", {
        hasInput: true,
        queryLength: maybeExtractSearchString(normalized)?.length ?? 0,
      });
      setInputText(normalized);
      runSearch(normalized);
    }
    if (initialInputSource) setInputSource(initialInputSource);
  }, [initialText, initialInputSource, runSearch]);

  const openArticle = useCallback(
    (result: SearchResult) => {
      const articleId = result.articleId;
      if (articleId) {
        trackEvent("search_result_selected", { source: "share", articleId });
        trackEvent("article_opened", { source: "share", articleId });
        addHistoryEntry({
          articleId,
          title: result.title,
          subtitle: result.summary,
          source: "share",
        });
        (navigation as any).navigate("Article", { articleId });
      }
    },
    [navigation]
  );

  useEffect(() => {
    if (state === "results" && searchResults.length === 1 && !didNavigateSingle.current) {
      didNavigateSingle.current = true;
      openArticle(searchResults[0]);
    }
  }, [state, searchResults, openArticle]);

  const handleSearchPress = () => {
    if (state === "media_unmapped" || state === "media_interpretation") runSearchOnly(inputText);
    else runSearch(inputText);
  };

  const handleOpenVerifyFromMedia = useCallback(async (url: string) => {
    const bundle = await api.getMediaVerification(url);
    if (bundle) {
      setMediaVerifyBundle(bundle);
      setMediaVerifyVisible(true);
    }
  }, []);

  const handleSearchFromTranscript = useCallback(
    (transcriptText: string) => {
      const normalized = normalizeSharedInput(transcriptText);
      setInputText(normalized);
      setInputSource("subtitle");
      setMediaSheetVisible(false);
      if (normalized) runSearch(normalized);
    },
    [runSearch]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Open in Rabbit Hole</Text>
      <View style={styles.inputSection}>
        <TextInput
          style={styles.inputBox}
          placeholder={inputSource === "subtitle" ? "Paste captions or transcript…" : "Paste link or text…"}
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={(t) => setInputText(t)}
          multiline
          numberOfLines={2}
        />
        <Pressable style={styles.searchButton} onPress={handleSearchPress}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      {state === "resolving" && (
        <View style={styles.stateBlock}>
          <ActivityIndicator size="small" />
          <Text style={styles.stateText}>{inputSource === "subtitle" ? "Analyzing captions…" : "Resolving…"}</Text>
        </View>
      )}

      {state === "media_unmapped" && (
        <View style={styles.noResultsBlock}>
          <Text style={styles.stateText}>Media link recognized, but no Rabbit Hole entry yet.</Text>
          <Text style={styles.hint}>You can search anyway with the link or edit the text above.</Text>
        </View>
      )}

      {state === "media_interpretation" && (
        <View style={styles.noResultsBlock}>
          <Text style={styles.hint}>You can search anyway or edit the text above.</Text>
        </View>
      )}

      <MediaInterpretationSheet
        interpretation={mediaInterpretation}
        visible={mediaSheetVisible}
        onDismiss={() => setMediaSheetVisible(false)}
        onOpenVerifyFromMedia={handleOpenVerifyFromMedia}
        onOpenOrganization={setSelectedOrgId}
        onSearchFromTranscript={handleSearchFromTranscript}
      />

      <VerifySheet
        initialBundle={mediaVerifyBundle}
        visible={mediaVerifyVisible}
        onDismiss={() => { setMediaVerifyVisible(false); setMediaVerifyBundle(null); }}
      />

      <OrganizationProfileSheet
        organizationId={selectedOrgId}
        visible={!!selectedOrgId}
        onDismiss={() => setSelectedOrgId(null)}
        onOpenArticle={(aid) => {
          setSelectedOrgId(null);
          (navigation as any).navigate("Article", { articleId: aid });
        }}
      />

      {state === "results" && searchResults.length > 1 && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsLabel}>Results</Text>
          <ScrollView style={styles.resultsScroll} keyboardShouldPersistTaps="handled">
            {searchResults.map((r) => (
              <Pressable
                key={`${r.nodeId}-${r.articleId || ""}`}
                style={styles.resultRow}
                onPress={() => openArticle(r)}
              >
                {r.imageUrl ? <Image source={{ uri: r.imageUrl }} style={styles.resultThumb} /> : null}
                <View style={styles.resultText}>
                  <Text style={styles.resultTitle}>{r.title}</Text>
                  {r.summary ? <Text style={styles.resultSummary} numberOfLines={2}>{r.summary}</Text> : null}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {state === "no_results" && (
        <View style={styles.noResultsBlock}>
          <Text style={styles.stateText}>No results yet.</Text>
          <Text style={styles.hint}>Edit the text above and tap Search to try again.</Text>
        </View>
      )}

      {state === "results" && searchResults.length === 1 && (
        <View style={styles.stateBlock}>
          <Text style={styles.stateText}>Opening article…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 16 },
  screenTitle: { fontSize: 22, fontWeight: "600", marginBottom: 16 },
  inputSection: { marginBottom: 24 },
  inputBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 56,
    textAlignVertical: "top",
  },
  searchButton: { marginTop: 12, backgroundColor: "#333", paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  searchButtonText: { color: "#fff", fontSize: 16 },
  stateBlock: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  stateText: { fontSize: 14, color: "#666" },
  noResultsBlock: { marginBottom: 16 },
  hint: { fontSize: 13, color: "#999", marginTop: 4 },
  resultsSection: { flex: 1, minHeight: 120 },
  resultsLabel: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 8, textTransform: "uppercase" },
  resultsScroll: { maxHeight: 280 },
  resultRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  resultThumb: { width: 48, height: 48, borderRadius: 6, marginRight: 12 },
  resultText: { flex: 1 },
  resultTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  resultSummary: { fontSize: 13, color: "#666", marginTop: 4 },
});
