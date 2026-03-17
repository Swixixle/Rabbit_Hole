import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import type { ImageSegment } from "@rabbit-hole/contracts";
import { ImageCanvas } from "../components/ImageCanvas";
import { CandidatePickerSheet } from "../components/CandidatePickerSheet";
import { EcologicalContextBlock } from "../components/EcologicalContextBlock";
import { LoadingStateBlock } from "../components/LoadingStateBlock";
import { EmptyStateBlock } from "../components/EmptyStateBlock";
import { getSegmentIdAtPoint, isPointInSegment } from "../utils/segmentHitTest";
import { api } from "../api/client";
import { trackEvent } from "../utils/analytics";

export function ImageFocusScreen({
  uploadId,
  imageUri,
  locationContext,
  onSelectArticle,
}: {
  uploadId: string;
  imageUri: string;
  /** Location Context v1: optional context from Live Lens; passed to explore/image. */
  locationContext?: import("@rabbit-hole/contracts").LocationContext;
  onSelectArticle: (articleId: string) => void;
}) {
  const [segments, setSegments] = useState<ImageSegment[] | null>(null);
  const [ecologicalEntity, setEcologicalEntity] = useState<import("@rabbit-hole/contracts").EcologicalEntity | null>(null);
  const [candidates, setCandidates] = useState<ImageSegment[] | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [noHitHint, setNoHitHint] = useState(false);
  const [lookupInProgress, setLookupInProgress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.exploreImage(uploadId, locationContext);
        if (!cancelled) {
          setSegments(res.segments || []);
          setEcologicalEntity(res.ecologicalEntity ?? null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load regions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [uploadId, locationContext]);

  const handleTap = useCallback(
    (xNorm: number, yNorm: number) => {
      setError(null);
      setNoHitHint(false);
      if (selectedSegmentId) {
        const selected = segments?.find((s) => s.segmentId === selectedSegmentId);
        if (selected && isPointInSegment(selected, xNorm, yNorm)) {
          return;
        }
        setSelectedSegmentId(null);
        return;
      }
      const hitId = getSegmentIdAtPoint(segments, xNorm, yNorm);
      if (hitId) {
        trackEvent("image_segment_selected", { segmentId: hitId });
        setSelectedSegmentId(hitId);
      } else if (segments?.length) {
        trackEvent("image_tap_miss", { hadSegments: true });
        setNoHitHint(true);
      }
    },
    [segments, selectedSegmentId]
  );

  const handleConfirmLookup = useCallback(async () => {
    if (!selectedSegmentId || lookupInProgress) return;
    setError(null);
    setLookupInProgress(true);
    trackEvent("lookup_confirmed", { segmentId: selectedSegmentId });
    try {
      const res = await api.exploreTap({ uploadId, segmentId: selectedSegmentId });
      setCandidates(res.candidates);
      setSelectedSegmentId(null);
      if (res.articleId && res.candidates.length <= 1) {
        trackEvent("lookup_candidate_selected", { hadCandidates: false, hadSelection: true });
        onSelectArticle(res.articleId);
        return;
      }
      trackEvent("lookup_candidates_shown", { candidateCount: res.candidates.length });
      setPickerVisible(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLookupInProgress(false);
    }
  }, [uploadId, selectedSegmentId, lookupInProgress, onSelectArticle]);

  const handleSelectCandidate = async (c: ImageSegment) => {
    setPickerVisible(false);
    if (c.segmentId === "seg-unknown" || (c.label === "No good match here" && !c.nodeId)) {
      setError("No article here. Try tapping a different object.");
      return;
    }
    try {
      const res = await api.exploreTap({ uploadId, segmentId: c.segmentId });
      if (res.articleId) {
        trackEvent("lookup_candidate_selected", {
          hadCandidates: true,
          hadSelection: true,
          segmentId: c.segmentId,
        });
        onSelectArticle(res.articleId);
        return;
      }
      if (c.nodeId) {
        const article = await api.getArticleByNode(c.nodeId);
        trackEvent("lookup_candidate_selected", {
          hadCandidates: true,
          hadSelection: true,
          segmentId: c.segmentId,
        });
        onSelectArticle(article.id);
        return;
      }
      setError("No article for this selection.");
    } catch {
      setError("Could not load article for this selection.");
    }
  };

  if (loading) return <LoadingStateBlock message="Finding objects…" />;
  if (error) return <EmptyStateBlock message={error} actionLabel="Try again" onAction={() => setError(null)} />;

  const selectedSegment = selectedSegmentId ? segments?.find((s) => s.segmentId === selectedSegmentId) : null;
  const selectedLabel = selectedSegment?.label;
  const hasSegments = (segments?.length ?? 0) > 0;

  const hintText = !hasSegments
    ? "No objects detected. Try another photo."
    : selectedSegmentId
      ? "Tap outside to deselect, or look up in Rabbit Hole."
      : "Tap an object to explore";

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>{hintText}</Text>
      {noHitHint && hasSegments ? (
        <Text style={styles.noHitHint}>No object here — try tapping something in the scene.</Text>
      ) : null}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <ImageCanvas
          imageUri={imageUri}
          segments={segments || undefined}
          selectedSegmentId={selectedSegmentId}
          onTap={handleTap}
        />
        {ecologicalEntity ? (
          <EcologicalContextBlock entity={ecologicalEntity} onOpenArticle={onSelectArticle} />
        ) : null}
      </ScrollView>
      {selectedSegmentId && !lookupInProgress ? (
        <>
          {selectedLabel ? (
            <Text style={styles.selectedLabel}>Selected: {selectedLabel}</Text>
          ) : null}
          <Pressable style={styles.lookUpButton} onPress={handleConfirmLookup}>
            <Text style={styles.lookUpButtonText}>Look up</Text>
          </Pressable>
        </>
      ) : lookupInProgress ? (
        <View style={styles.lookupLoading}>
          <ActivityIndicator size="small" color="#333" />
          <Text style={styles.lookupLoadingText}>Looking up…</Text>
        </View>
      ) : null}
      <CandidatePickerSheet
        visible={pickerVisible}
        candidates={candidates || []}
        onSelect={handleSelectCandidate}
        onDismiss={() => setPickerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hint: { paddingHorizontal: 16, paddingVertical: 8, textAlign: "center", fontSize: 13, color: "rgba(0,0,0,0.6)" },
  noHitHint: { paddingHorizontal: 16, paddingBottom: 4, textAlign: "center", fontSize: 12, color: "rgba(0,0,0,0.5)", fontStyle: "italic" },
  selectedLabel: { paddingHorizontal: 16, paddingTop: 4, fontSize: 12, color: "rgba(0,0,0,0.6)", textAlign: "center" },
  lookUpButton: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 14,
    backgroundColor: "#333",
    borderRadius: 8,
    alignItems: "center",
  },
  lookUpButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  lookupLoading: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginVertical: 16 },
  lookupLoadingText: { fontSize: 14, color: "rgba(0,0,0,0.6)" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
});
