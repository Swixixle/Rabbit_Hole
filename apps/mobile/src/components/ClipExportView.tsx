/**
 * Rabbit Hole Clips v1: view that stacks all clip frames for capture/export.
 * Single tall view (4 × 9:16 cards) for one-shot capture to image.
 */
import React from "react";
import { View } from "react-native";
import type { ArticleClipPlan } from "../types/clipPlan";
import { getClipFrameDisplayProps } from "../utils/clipRender";
import { ClipCard, CLIP_CARD_HEIGHT } from "./ClipCard";

const FRAME_COUNT = 4;
export const CLIP_EXPORT_VIEW_HEIGHT = FRAME_COUNT * CLIP_CARD_HEIGHT;

type ClipExportViewProps = {
  plan: ArticleClipPlan;
  captureRef: React.RefObject<View | null>;
};

export function ClipExportView({ plan, captureRef }: ClipExportViewProps) {
  const displayFrames = getClipFrameDisplayProps(plan.frames);

  return (
    <View
      ref={captureRef}
      style={{
        width: 360,
        height: CLIP_EXPORT_VIEW_HEIGHT,
        backgroundColor: "#f0f0f0",
      }}
      collapsable={false}
    >
      {displayFrames.map((frame) => (
        <ClipCard key={frame.id} frame={frame} />
      ))}
    </View>
  );
}
