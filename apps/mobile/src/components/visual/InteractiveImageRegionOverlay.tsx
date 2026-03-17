/**
 * Rabbit Hole Core Groundwork v5 — Thin overlay for tappable scene regions.
 * Renders transparent hit areas over the image; selected region is highlighted and slightly enlarged.
 */
import React, { useCallback } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import type { SceneObjectRegion } from "../../types/sceneRegions";

const SELECTION_ENLARGE = 0.03;

export type InteractiveImageRegionOverlayProps = {
  imageWidth: number;
  imageHeight: number;
  regions: SceneObjectRegion[];
  selectedRegionId?: string | null;
  onRegionPress?: (region: SceneObjectRegion) => void;
};

export function InteractiveImageRegionOverlay({
  imageWidth,
  imageHeight,
  regions,
  selectedRegionId,
  onRegionPress,
}: InteractiveImageRegionOverlayProps) {
  const handlePress = useCallback(
    (region: SceneObjectRegion) => () => {
      onRegionPress?.(region);
    },
    [onRegionPress]
  );

  if (regions.length === 0 || imageWidth <= 0 || imageHeight <= 0) return null;

  return (
    <View
      style={[styles.overlay, { width: imageWidth, height: imageHeight }]}
      pointerEvents="box-none"
    >
      {regions.map((region) => {
        const { boundingBox, id } = region;
        const isSelected = selectedRegionId === id;
        const pad = isSelected ? SELECTION_ENLARGE : 0;
        const left = (boundingBox.x - pad) * imageWidth;
        const top = (boundingBox.y - pad) * imageHeight;
        const width = (boundingBox.width + pad * 2) * imageWidth;
        const height = (boundingBox.height + pad * 2) * imageHeight;

        return (
          <Pressable
            key={id}
            style={[
              styles.regionHit,
              { left, top, width, height },
              isSelected && styles.regionSelected,
            ]}
            onPress={handlePress(region)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  regionHit: {
    position: "absolute",
    backgroundColor: "transparent",
  },
  regionSelected: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});
