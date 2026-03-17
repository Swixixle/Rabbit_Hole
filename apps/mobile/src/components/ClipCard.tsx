/**
 * Rabbit Hole Clips v1: single vertical card for one clip frame.
 * 9:16 aspect ratio, simple typography, optional image.
 */
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import type { ClipFrameKind } from "../types/clipPlan";
import type { ClipFrameDisplayProps } from "../utils/clipRender";

const CARD_WIDTH = 360;
const CARD_HEIGHT = 640; // 9:16

export const CLIP_CARD_WIDTH = CARD_WIDTH;
export const CLIP_CARD_HEIGHT = CARD_HEIGHT;

function frameKindLabel(kind: ClipFrameKind): string {
  switch (kind) {
    case "title":
      return "";
    case "insight":
      return "Key insight";
    case "explanation":
      return "Context";
    case "closing":
      return "";
    default:
      return "";
  }
}

export function ClipCard({ frame }: { frame: ClipFrameDisplayProps }) {
  const isTitle = frame.kind === "title";
  const isClosing = frame.kind === "closing";
  const showLabel = frame.kind === "insight" || frame.kind === "explanation";

  return (
    <View style={styles.card}>
      {frame.imageUrl ? (
        <Image source={{ uri: frame.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : null}
      <View style={styles.content}>
        {showLabel ? (
          <Text style={styles.label}>{frameKindLabel(frame.kind)}</Text>
        ) : null}
        <Text
          style={[
            styles.text,
            isTitle && styles.titleText,
            isClosing && styles.closingText,
          ]}
          numberOfLines={isTitle ? 2 : isClosing ? 1 : 5}
        >
          {frame.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#f8f8f8",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 48,
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT * 0.4,
    backgroundColor: "#eee",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  text: {
    fontSize: 18,
    lineHeight: 26,
    color: "#333",
  },
  titleText: {
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
  },
  closingText: {
    fontSize: 16,
    color: "#666",
  },
});
