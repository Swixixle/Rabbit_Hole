/**
 * Rabbit Hole v14/v15 — Review captured image: select region, recognize via API or manual fallback.
 * Builds envelope → region → candidate → entity → optional node (exact match only).
 */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RecognitionEnvelope } from "../types/recognition";
import type { SceneObjectRegion } from "../types/sceneRegions";
import { createManualSceneObjectRegion } from "../utils/manualSceneRegion";
import {
  createManualRecognitionCandidateFromRegion,
  createIdentifiedEntityFromManualCandidate,
  resolveKnowledgeNodeForManualEntity,
} from "../utils/manualRecognition";
import {
  createRecognitionCandidateFromVisionResponse,
  createIdentifiedEntityFromVisionCandidate,
} from "../utils/visionRecognitionMapping";
import { recognizeRegionWithVisionApi } from "../utils/visionApi";
import { generateProvisionalNode } from "../utils/generatedKnowledgeApi";
import {
  createGeneratedKnowledgeNode,
  createGeneratedClaimsForNode,
} from "../utils/generatedKnowledgeMapping";
import { addGeneratedNode, setGeneratedClaimsForNode } from "../data/generatedKnowledgeStore";
import { getSampleNodes } from "../data/sampleNodes";
import { getSampleClaims } from "../data/sampleClaims";
import { selectNodeClaimsAvailability } from "../utils/evidenceAvailabilitySelectors";
import { deriveSavedObjectItemFromRegion } from "../utils/savedObjects";
import { loadSavedObjectItems, saveSavedObjectItems } from "../utils/savedObjectPersistence";
import { upsertSavedObjectItem } from "../utils/savedObjectSelectors";

const BOX_SIZE = 0.2;

type RouteParams = {
  envelope: RecognitionEnvelope;
  imageUri: string;
};

export function CapturedSceneReviewScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { envelope, imageUri } = (route.params ?? {}) as RouteParams;
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [boundingBox, setBoundingBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<{
    label: string;
    candidateType: string;
    confidence?: number;
    likelyVariant?: string;
    specificityHint?: string;
  } | null>(null);
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [manualLabel, setManualLabel] = useState("");
  const [done, setDone] = useState<"saved" | null>(null);

  const handleImageLayout = useCallback((e: { nativeEvent: { layout: { width: number; height: number } } }) => {
    const { width, height } = e.nativeEvent.layout;
    setImageSize({ width, height });
  }, []);

  const handleImagePress = useCallback(
    (e: { nativeEvent: { locationX: number; locationY: number } }) => {
      if (!imageSize) return;
      setRecognitionError(null);
      setRecognitionResult(null);
      const { locationX, locationY } = e.nativeEvent;
      const xNorm = locationX / imageSize.width;
      const yNorm = locationY / imageSize.height;
      let x = xNorm - BOX_SIZE / 2;
      let y = yNorm - BOX_SIZE / 2;
      x = Math.max(0, Math.min(1 - BOX_SIZE, x));
      y = Math.max(0, Math.min(1 - BOX_SIZE, y));
      setBoundingBox({ x, y, width: BOX_SIZE, height: BOX_SIZE });
    },
    [imageSize]
  );

  const saveAndNavigate = useCallback(
    async (
      regionWithIds: SceneObjectRegion,
      labelTrimmed: string,
      node: ReturnType<typeof resolveKnowledgeNodeForManualEntity>,
      recognitionDetail?: string
    ) => {
      const claims = getSampleClaims();
      const claimsAvailability = node ? selectNodeClaimsAvailability(node.id, claims).kind : null;
      const item = deriveSavedObjectItemFromRegion(regionWithIds, {
        label: labelTrimmed,
        knowledgeNodeId: node?.id,
        claimsAvailability,
      });
      const loaded = await loadSavedObjectItems();
      const next = upsertSavedObjectItem(item, loaded);
      await saveSavedObjectItems(next);
      setDone("saved");
      if (node) {
        (navigation as any).navigate("NodeViewer", {
          node,
          ...(recognitionDetail != null ? { recognitionDetail } : {}),
        });
      }
    },
    [navigation]
  );

  const handleRecognizeObject = useCallback(async () => {
    if (!envelope?.id || !imageUri || !boundingBox) return;
    setRecognizing(true);
    setRecognitionError(null);
    setRecognitionResult(null);
    try {
      const response = await recognizeRegionWithVisionApi({ imageUri, boundingBox });
      if (!response) {
        setRecognitionError("Could not recognize object.");
        return;
      }
      setRecognitionResult({
        label: response.label,
        candidateType: response.candidateType,
        confidence: response.confidence ?? undefined,
        likelyVariant: response.likelyVariant,
        specificityHint: response.specificityHint,
      });
      const nodes = getSampleNodes();
      const region = createManualSceneObjectRegion({
        envelopeId: envelope.id,
        label: response.label,
        boundingBox,
      });
      const candidate = createRecognitionCandidateFromVisionResponse({ region, response });
      const entity = createIdentifiedEntityFromVisionCandidate({ envelopeId: envelope.id, candidate });
      let node = resolveKnowledgeNodeForManualEntity(response.label, nodes);
      if (!node) {
        const genResp = await generateProvisionalNode({
          label: response.label,
          candidateType: response.candidateType as "entity" | "product" | "landmark" | "topic" | "media",
          alternativeLabels: response.alternativeLabels,
          confidence: response.confidence ?? undefined,
          visualDescription: response.visualDescription,
          specificityHint: response.specificityHint,
          likelyVariant: response.likelyVariant,
          observedText: response.observedText,
          lineageHints: response.lineageHints,
        });
        if (genResp) {
          node = createGeneratedKnowledgeNode({
            envelopeId: envelope.id,
            identifiedEntityId: entity.id,
            response: genResp,
          });
          const claims = createGeneratedClaimsForNode({ nodeId: node.id, claims: genResp.claims });
          addGeneratedNode(node);
          setGeneratedClaimsForNode(node.id, claims);
        }
      }
      const regionWithIds: SceneObjectRegion = {
        ...region,
        recognitionCandidateId: candidate.id,
        identifiedEntityId: entity.id,
        knowledgeNodeId: node?.id ?? null,
      };
      await saveAndNavigate(
        regionWithIds,
        response.label,
        node,
        node?.origin === "generated" ? response.likelyVariant || response.label : undefined
      );
    } finally {
      setRecognizing(false);
    }
  }, [envelope, imageUri, boundingBox, saveAndNavigate]);

  const handleManualSave = useCallback(async () => {
    if (!envelope?.id || !imageUri || !boundingBox) return;
    const labelTrimmed = manualLabel.trim() || "Unlabeled object";
    const nodes = getSampleNodes();
    const region = createManualSceneObjectRegion({
      envelopeId: envelope.id,
      label: labelTrimmed,
      boundingBox,
    });
    const candidate = createManualRecognitionCandidateFromRegion({ region, label: labelTrimmed });
    const entity = createIdentifiedEntityFromManualCandidate({ envelopeId: envelope.id, candidate });
    const node = resolveKnowledgeNodeForManualEntity(labelTrimmed, nodes);
    const regionWithIds: SceneObjectRegion = {
      ...region,
      recognitionCandidateId: candidate.id,
      identifiedEntityId: entity.id,
      knowledgeNodeId: node?.id ?? null,
    };
    await saveAndNavigate(regionWithIds, labelTrimmed, node);
  }, [envelope, imageUri, boundingBox, manualLabel, saveAndNavigate]);

  if (!envelope?.id || !imageUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Missing capture data.</Text>
      </View>
    );
  }

  if (done === "saved") {
    return (
      <View style={styles.container}>
        <Text style={styles.savedTitle}>Saved to collection</Text>
        <Text style={styles.savedHint}>
          Object is stored with recognition-only state. Open Scene Explore to see your tray.
        </Text>
        <Pressable style={styles.button} onPress={() => (navigation as any).navigate("SceneExplore")}>
          <Text style={styles.buttonText}>View collection</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.hint}>Tap on the image to select the object region</Text>
      <Pressable style={styles.imageWrap} onPress={handleImagePress} onLayout={handleImageLayout}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        {boundingBox && imageSize ? (
          <View
            style={[
              styles.boxOverlay,
              {
                left: boundingBox.x * imageSize.width,
                top: boundingBox.y * imageSize.height,
                width: boundingBox.width * imageSize.width,
                height: boundingBox.height * imageSize.height,
              },
            ]}
          />
        ) : null}
      </Pressable>

      {recognitionResult ? (
        <View style={styles.resultSummary}>
          <Text style={styles.resultTitle}>Recognized</Text>
          <Text style={styles.resultRow}>Recognized as: {recognitionResult.label}</Text>
          {recognitionResult.likelyVariant ? (
            <Text style={styles.resultRow}>Likely variant: {recognitionResult.likelyVariant}</Text>
          ) : null}
          <Text style={styles.resultRow}>Type: {recognitionResult.candidateType}</Text>
          {recognitionResult.confidence != null ? (
            <Text style={styles.resultRow}>
              Confidence: {(recognitionResult.confidence * 100).toFixed(0)}%
            </Text>
          ) : null}
        </View>
      ) : null}

      {recognitionError ? (
        <Text style={styles.errorText}>{recognitionError}</Text>
      ) : null}

      <Pressable
        style={[styles.button, (!boundingBox || recognizing) && styles.buttonDisabled]}
        onPress={handleRecognizeObject}
        disabled={!boundingBox || recognizing}
      >
        {recognizing ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Recognize object</Text>
        )}
      </Pressable>

      {recognitionError ? (
        <Pressable style={styles.fallbackButton} onPress={() => setShowManualFallback(true)}>
          <Text style={styles.fallbackButtonText}>Enter label manually instead</Text>
        </Pressable>
      ) : null}

      {showManualFallback ? (
        <View style={styles.manualSection}>
          <Text style={styles.labelHint}>Manual label</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sony WH-1000XM5"
            placeholderTextColor="rgba(0,0,0,0.4)"
            value={manualLabel}
            onChangeText={setManualLabel}
            autoCapitalize="none"
          />
          <Pressable
            style={[styles.secondaryButtonBlock, !boundingBox && styles.buttonDisabled]}
            onPress={handleManualSave}
            disabled={!boundingBox}
          >
            <Text style={styles.secondaryButtonText}>Save with manual label</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const { width: screenWidth } = Dimensions.get("window");
const imageWidth = Math.min(screenWidth - 32, 360);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 32 },
  hint: { fontSize: 14, color: "rgba(0,0,0,0.6)", marginBottom: 12 },
  imageWrap: { position: "relative", width: imageWidth, height: imageWidth * 0.75, alignSelf: "center", marginBottom: 16 },
  image: { width: imageWidth, height: imageWidth * 0.75, borderRadius: 8 },
  boxOverlay: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(0,120,255,0.9)",
    backgroundColor: "rgba(0,120,255,0.15)",
  },
  resultSummary: { marginBottom: 16, padding: 12, backgroundColor: "#f5f5f5", borderRadius: 8 },
  resultTitle: { fontSize: 12, fontWeight: "600", color: "rgba(0,0,0,0.5)", marginBottom: 6 },
  resultRow: { fontSize: 14, color: "#333", marginBottom: 2 },
  errorText: { fontSize: 14, color: "#c00", marginBottom: 12 },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: "#333",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 16, color: "#fff", fontWeight: "600" },
  fallbackButton: { marginTop: 12, paddingVertical: 10, alignItems: "center" },
  fallbackButtonText: { fontSize: 14, color: "#666" },
  manualSection: { marginTop: 20 },
  labelHint: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  secondaryButtonBlock: { paddingVertical: 12, alignItems: "center" },
  savedTitle: { fontSize: 18, fontWeight: "700", color: "#333", marginBottom: 12, textAlign: "center" },
  savedHint: { fontSize: 14, color: "rgba(0,0,0,0.6)", textAlign: "center", marginBottom: 24 },
  secondaryButton: { marginTop: 12, paddingVertical: 12, alignItems: "center" },
  secondaryButtonText: { fontSize: 15, color: "#666" },
  error: { fontSize: 15, color: "#c00", padding: 24 },
});
