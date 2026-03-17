/**
 * Real Microphone Capture Groundwork v1: permission + short recording for audio identification.
 * Produces a local file URI; callers send a normalized token to the recognition API (v1: no fingerprinting).
 */
import { Audio } from "expo-av";
import { RECORDED_CLIP_TOKEN, normalizedRecordedClipToken } from "./audioRecordingTokens";

export { RECORDED_CLIP_TOKEN, normalizedRecordedClipToken };

export type RecordingRef = { stopAndGetUri: () => Promise<string | null> };

/**
 * Request microphone permission. Returns true if granted, false if denied.
 */
export async function requestRecordingPermission(): Promise<boolean> {
  const { status } = await Audio.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Set audio mode for recording (reduces playback interference). Call before createRecording.
 */
export async function setAudioModeForRecording(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: false,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

/**
 * Start recording. Returns a ref with stopAndGetUri(). Call setAudioModeForRecording once before first record.
 */
export async function startRecording(): Promise<RecordingRef> {
  const preset = (Audio as any).RecordingOptionsPresets?.HIGH_QUALITY ?? (Audio as any).RECORDING_OPTIONS_PRESET_HIGH_QUALITY ?? {};
  const { recording } = await (Audio.Recording as any).createAsync(preset);
  await recording.startAsync();
  return {
    async stopAndGetUri(): Promise<string | null> {
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        return uri ?? null;
      } catch {
        return null;
      }
    },
  };
}

/**
 * Normalize a recorded file URI for the recognition API. In v1 we send RECORDED_CLIP_TOKEN
 * because the backend does not read file contents (no fingerprinting). Returns RECORDED_CLIP_TOKEN.
 */
