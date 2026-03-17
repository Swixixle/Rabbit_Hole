/**
 * Rabbit Hole v14 — Captured scene state for real camera flow.
 * Local/session state only; not persisted as a separate system.
 */
import type { RecognitionEnvelope } from "./recognition";
import type { SceneObjectRegion } from "./sceneRegions";

export type CapturedSceneState = {
  envelope: RecognitionEnvelope;
  imageUri: string;
  selectedRegion?: SceneObjectRegion;
};
