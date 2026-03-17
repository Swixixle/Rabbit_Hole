/**
 * Rabbit Hole v12 — Verification readiness badge.
 * Minimal text badge for saved object verification state.
 */
import React from "react";
import { Text, StyleSheet } from "react-native";
import type { SavedObjectVerificationKind } from "../../types/savedObjects";

type Props = {
  kind: SavedObjectVerificationKind;
};

const BADGE_LABELS: Record<SavedObjectVerificationKind, string> = {
  verified: "Verified",
  evidenced: "Evidenced",
  recognition_only: "Recognition only",
  unverified: "Unverified",
};

export function VerificationBadge({ kind }: Props) {
  return (
    <Text style={styles.badge} numberOfLines={1}>
      {BADGE_LABELS[kind]}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontSize: 10,
    color: "rgba(0,0,0,0.6)",
    textTransform: "capitalize",
  },
});
