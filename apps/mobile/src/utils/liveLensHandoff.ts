/**
 * Live Camera Recognition Groundwork v1: capture a frame and hand off to the existing image pipeline.
 * Uses expo-image-picker camera (no in-app preview in v1). Replace capture step with CameraView when adding real preview.
 */

import * as ImagePicker from "expo-image-picker";

export type CaptureResult =
  | { ok: true; uploadId: string; imageUri: string }
  | { ok: false; error: string };

/**
 * Request camera permission. Returns true if granted.
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === ImagePicker.PermissionStatus.GRANTED;
}

/**
 * Open system camera and capture one photo. Returns asset URI or null if user cancels.
 */
export async function captureFrame(): Promise<string | null> {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
  });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

export type UploadImageFn = (uri: string) => Promise<{ uploadId: string }>;

/**
 * Request permission, capture one frame, then upload via the provided function.
 * Returns result for handoff to ImageFocus or an error message for fallback UI.
 */
export async function captureAndUploadFrame(
  uploadImage: UploadImageFn
): Promise<CaptureResult> {
  const granted = await requestCameraPermission();
  if (!granted) {
    return { ok: false, error: "Camera access is required for Live Lens." };
  }
  const uri = await captureFrame();
  if (!uri) {
    return { ok: false, error: "No photo captured." };
  }
  try {
    const { uploadId } = await uploadImage(uri);
    return { ok: true, uploadId, imageUri: uri };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed.";
    return { ok: false, error: message };
  }
}
