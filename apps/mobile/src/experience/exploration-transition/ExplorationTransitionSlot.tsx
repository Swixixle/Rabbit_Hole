/**
 * EXPLORATION TRANSITION — MOUNT POINT (hook only, no implementation yet)
 *
 * Future: RabbitHoleTransition will run here (photo freezes → circle opens →
 * rabbit drops → tunnel → result). See docs/architecture/experience-layer.md.
 *
 * State machine (when implemented): CAPTURED → ANIMATION_START → INGESTION_RUNNING
 * → ANIMATION_COMPLETE → ARTICLE_RENDER. This slot will sit between capture
 * and the next screen so the animation can mask processing time.
 *
 * For the first slice we only pass through: render children immediately.
 * Do not add Lottie, Reanimated, sound, or haptic in this pass.
 */
import React from "react";

type Props = {
  /** Captured image URI (for future transition - freeze frame) */
  capturedImageUri?: string | null;
  /** When true, future implementation will run the rabbit-hole animation before showing children */
  triggerTransition?: boolean;
  children: React.ReactNode;
};

export function ExplorationTransitionSlot({
  capturedImageUri,
  triggerTransition = false,
  children,
}: Props): React.ReactElement {
  // TODO(experience-layer): When implementing, run animation when triggerTransition is true
  // and capturedImageUri is set; then call onTransitionComplete() and show children.
  // See docs/architecture/experience-layer.md — do not add Lottie/sound/haptic until golden path works.
  return <>{children}</>;
}
