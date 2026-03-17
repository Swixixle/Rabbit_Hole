/**
 * Rabbit Hole — Scene explore screen for the first exploration loop.
 * Tap region → resolve through pipeline → open NodeViewer. Save object → persisted tray.
 */
import React, { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { InteractiveImageRegionOverlay } from "../components/visual/InteractiveImageRegionOverlay";
import { selectKnowledgeNodeForRegion } from "../utils/recognitionSelectors";
import { getSampleSceneRegionSummary } from "../data/sampleScene";
import { SAMPLE_ENVELOPE_ID_CONST, getSampleNodes } from "../data/sampleNodes";
import { getGeneratedNodes } from "../data/generatedKnowledgeStore";
import { getSampleRecognitionCandidates } from "../data/sampleRecognition";
import { getSampleIdentifiedEntities } from "../data/sampleRecognition";
import { getSampleClaims } from "../data/sampleClaims";
import { selectSceneObjectRegionsForEnvelope } from "../utils/sceneRegionSelectors";
import { selectNodeClaimsAvailability } from "../utils/evidenceAvailabilitySelectors";
import { deriveSavedObjectItemFromRegion } from "../utils/savedObjects";
import { upsertSavedObjectItem, selectSavedObjectsOrdered } from "../utils/savedObjectSelectors";
import { loadSavedObjectItems, saveSavedObjectItems } from "../utils/savedObjectPersistence";
import { resolveKnowledgeNodeForSavedObject } from "../utils/savedObjectResolution";
import { SavedObjectTray } from "../components/knowledge/SavedObjectTray";
import type { SceneObjectRegion } from "../types/sceneRegions";
import type { KnowledgeNode } from "../types/knowledgeNodes";
import type { SavedObjectItem } from "../types/savedObjects";

const PLACEHOLDER_WIDTH = 320;
const PLACEHOLDER_HEIGHT = 240;

type Props = {
  onOpenNode: (node: KnowledgeNode) => void;
};

export function SceneExploreScreen({ onOpenNode }: Props) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<SavedObjectItem[]>([]);

  useEffect(() => {
    loadSavedObjectItems()
      .then(setSavedItems)
      .catch(() => setSavedItems([]));
  }, []);

  const summary = getSampleSceneRegionSummary();
  const regions = selectSceneObjectRegionsForEnvelope(summary, SAMPLE_ENVELOPE_ID_CONST);
  const candidates = getSampleRecognitionCandidates();
  const entities = getSampleIdentifiedEntities();
  const nodes = [...getSampleNodes(), ...getGeneratedNodes()];
  const claims = getSampleClaims();

  const selectedRegion = selectedRegionId
    ? regions.find((r) => r.id === selectedRegionId) ?? null
    : null;
  const selectedNode = selectedRegion
    ? selectKnowledgeNodeForRegion(selectedRegion, candidates, entities, nodes)
    : null;
  const claimsAvailability = selectedNode
    ? selectNodeClaimsAvailability(selectedNode.id, claims).kind
    : null;

  const handleRegionPress = useCallback(
    (region: SceneObjectRegion) => {
      setSelectedRegionId(region.id);
      const node = selectKnowledgeNodeForRegion(region, candidates, entities, nodes);
      if (node) onOpenNode(node);
    },
    [onOpenNode, candidates, entities, nodes]
  );

  const handleSaveObject = useCallback(() => {
    if (!selectedRegion) return;
    const item = deriveSavedObjectItemFromRegion(selectedRegion, {
      label: selectedRegion.label,
      knowledgeNodeId: selectedNode?.id ?? selectedRegion.knowledgeNodeId ?? undefined,
      claimsAvailability,
    });
    setSavedItems((prev) => {
      const next = upsertSavedObjectItem(item, prev);
      saveSavedObjectItems(next).catch(() => {});
      return next;
    });
  }, [selectedRegion, selectedNode, claimsAvailability]);

  const handleTrayItemPress = useCallback(
    (item: SavedObjectItem) => {
      const node = resolveKnowledgeNodeForSavedObject(item, nodes);
      if (node) onOpenNode(node);
    },
    [onOpenNode, nodes]
  );

  const orderedSaved = selectSavedObjectsOrdered(savedItems);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.hint}>Tap the object to open its node</Text>
      <View style={[styles.placeholder, { width: PLACEHOLDER_WIDTH, height: PLACEHOLDER_HEIGHT }]}>
        <View style={styles.placeholderInner} />
        <InteractiveImageRegionOverlay
          imageWidth={PLACEHOLDER_WIDTH}
          imageHeight={PLACEHOLDER_HEIGHT}
          regions={regions}
          selectedRegionId={selectedRegionId}
          onRegionPress={handleRegionPress}
        />
      </View>
      {selectedRegion ? (
        <View style={styles.actionRow}>
          <Pressable style={styles.saveButton} onPress={handleSaveObject}>
            <Text style={styles.saveButtonText}>Save object</Text>
          </Pressable>
        </View>
      ) : null}
      <Text style={styles.label}>Sony WH-1000XM5 (tap above)</Text>

      <SavedObjectTray
        items={orderedSaved}
        onPressItem={handleTrayItemPress}
        emptyText="No saved objects yet. Tap an object, then Save object."
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 32, alignItems: "center" },
  hint: { fontSize: 14, color: "rgba(0,0,0,0.6)", marginBottom: 16, textAlign: "center" },
  placeholder: { position: "relative", backgroundColor: "#e8e8e8", borderRadius: 8, overflow: "hidden" },
  placeholderInner: { ...StyleSheet.absoluteFillObject, backgroundColor: "#e8e8e8" },
  actionRow: { marginTop: 12, flexDirection: "row" },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  saveButtonText: { fontSize: 14, color: "#333" },
  label: { marginTop: 8, fontSize: 13, color: "rgba(0,0,0,0.5)" },
});
