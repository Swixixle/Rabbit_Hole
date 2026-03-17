import React, { useState, useCallback } from "react";
import { View, Image, Pressable, StyleSheet } from "react-native";

type Segment = { segmentId: string; label?: string; bbox?: { x: number; y: number; width: number; height: number } };

const SELECTION_ENLARGE = 0.03;

export function ImageCanvas({
  imageUri,
  segments,
  selectedSegmentId,
  onTap,
}: {
  imageUri: string;
  segments?: Segment[];
  selectedSegmentId?: string | null;
  onTap?: (xNorm: number, yNorm: number) => void;
}) {
  const [layout, setLayout] = useState<{ width: number; height: number } | null>(null);

  const handleLayout = useCallback((e: { nativeEvent: { layout: { width: number; height: number } } }) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setLayout({ width, height });
  }, []);

  const handlePress = useCallback(
    (e: { nativeEvent: { locationX: number; locationY: number } }) => {
      const { locationX, locationY } = e.nativeEvent;
      if (!onTap) return;
      if (layout && layout.width > 0 && layout.height > 0) {
        const xNorm = Math.max(0, Math.min(1, locationX / layout.width));
        const yNorm = Math.max(0, Math.min(1, locationY / layout.height));
        onTap(xNorm, yNorm);
      } else {
        onTap(0.5, 0.5);
      }
    },
    [onTap, layout]
  );

  const selectedSegment = selectedSegmentId && layout
    ? segments?.find((s) => s.segmentId === selectedSegmentId && s.bbox)
    : null;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handlePress}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      </Pressable>
      {selectedSegment?.bbox && layout ? (
        <View
          pointerEvents="none"
          style={[
            styles.selectionHighlight,
            {
              left: Math.max(0, (selectedSegment.bbox.x - SELECTION_ENLARGE) * layout.width),
              top: Math.max(0, (selectedSegment.bbox.y - SELECTION_ENLARGE) * layout.height),
              width: Math.min(
                layout.width,
                (selectedSegment.bbox.width + SELECTION_ENLARGE * 2) * layout.width
              ),
              height: Math.min(
                layout.height,
                (selectedSegment.bbox.height + SELECTION_ENLARGE * 2) * layout.height
              ),
            },
          ]}
        />
      ) : null}
      {segments?.length ? (
        <View style={styles.segmentHints} pointerEvents="none">
          {segments.slice(0, 3).map((s) => (
            <View key={s.segmentId} style={styles.pill}>
              <React.Fragment />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: "100%", height: "100%" },
  selectionHighlight: {
    position: "absolute",
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  segmentHints: { position: "absolute", bottom: 16, left: 16, right: 16, flexDirection: "row", gap: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 16 },
});
