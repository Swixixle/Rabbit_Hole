/**
 * Rabbit Hole Clips v1: capture a view as image and hand to system share.
 * Uses react-native-view-shot; no heavy image processing.
 */
import React from "react";
import { Share } from "react-native";
import type { View } from "react-native";

export type CaptureResult = "shared" | "cancelled" | "error";

/**
 * Captures the view referenced by ref as PNG, then opens the system share sheet.
 * Returns "shared" if user shared, "cancelled" if they dismissed, "error" on failure.
 */
export async function captureAndShareClipView(
  viewRef: React.RefObject<View | null>,
  options: { title?: string; message?: string }
): Promise<CaptureResult> {
  const ref = viewRef.current;
  if (!ref) return "error";

  try {
    const { captureRef } = require("react-native-view-shot");
    const uri = await captureRef(ref, {
      format: "png",
      result: "tmpfile",
      quality: 1,
    });
    if (!uri || typeof uri !== "string") return "error";

    const result = await Share.share({
      url: uri,
      title: options.title ?? "Clip",
      message: options.message,
    });

    if (result.action === Share.sharedAction) return "shared";
    if (result.action === Share.dismissedAction) return "cancelled";
    return "cancelled";
  } catch (_) {
    return "error";
  }
}
