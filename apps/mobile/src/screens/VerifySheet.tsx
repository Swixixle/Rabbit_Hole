import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from "react-native";
import type { Claim, Source, EvidenceSpan } from "@rabbit-hole/contracts";
import { ClaimTypeBadge } from "../components/ClaimTypeBadge";
import { SourceCard } from "../components/SourceCard";
import { EvidenceDrawer } from "../components/EvidenceDrawer";
import { LoadingStateBlock } from "../components/LoadingStateBlock";
import { EmptyStateBlock } from "../components/EmptyStateBlock";
import { ErrorStateBlock } from "../components/ErrorStateBlock";
import { getSupportStatusLabel } from "../utils/supportStatusLabels";
import { api } from "../api/client";
import { OrganizationProfileSheet } from "../components/OrganizationProfileSheet";

type VerificationBundle = {
  sources: Source[];
  claims?: Claim[];
  evidenceSpans?: EvidenceSpan[];
  claimToSources?: Record<string, string[]>;
  claimToEvidence?: Record<string, EvidenceSpan[]>;
  supportStatusByClaimId?: Record<string, string>;
};

export function VerifySheet({
  articleId,
  initialBundle,
  visible,
  onDismiss,
  onOpenArticle,
}: {
  articleId?: string;
  /** Verify-from-Media v1: when provided, use this bundle instead of fetching by articleId. */
  initialBundle?: VerificationBundle | null;
  visible: boolean;
  onDismiss: () => void;
  /** Organization-to-Product/Med v1: when user opens a linked item with articleId, navigate to article. */
  onOpenArticle?: (articleId: string) => void;
}) {
  const [bundle, setBundle] = useState<VerificationBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [evidenceForDrawer, setEvidenceForDrawer] = useState<EvidenceSpan[]>([]);

  useEffect(() => {
    if (!visible) return;
    if (initialBundle != null) {
      setBundle(initialBundle);
      setLoading(false);
      setError(null);
      return;
    }
    if (!articleId) return;
    setLoading(true);
    setError(null);
    api
      .getVerification(articleId)
      .then((r) => setBundle(r))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load verification"))
      .finally(() => setLoading(false));
  }, [visible, articleId, initialBundle]);

  const retry = () => {
    if (!articleId) return;
    setError(null);
    api
      .getVerification(articleId)
      .then((r) => setBundle(r))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  };

  if (!visible) return null;

  const claims = bundle?.claims ?? [];
  const sources = bundle?.sources ?? [];
  const claimToSources = bundle?.claimToSources ?? {};
  const claimToEvidence = bundle?.claimToEvidence ?? {};
  const supportStatusByClaimId = bundle?.supportStatusByClaimId ?? {};
  const sourceMap = Object.fromEntries(sources.map((s) => [s.id, s]));

  return (
    <Modal transparent visible animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Verify</Text>
            <Pressable onPress={onDismiss}>
              <Text style={styles.dismiss}>Close</Text>
            </Pressable>
          </View>
          <Text style={styles.subtitle}>Claims and their support</Text>
          {loading && <LoadingStateBlock message="Loading verification…" />}
          {error && <ErrorStateBlock message={error} onRetry={retry} />}
          {!loading && !error && claims.length === 0 && sources.length === 0 && (
            <EmptyStateBlock message="No claims or sources for this article yet." />
          )}
          {!loading && !error && claims.length === 0 && sources.length > 0 && (
            <>
              <EmptyStateBlock message="No claims to verify for this article." />
              <Text style={styles.sectionLabel}>Sources</Text>
              <ScrollView style={styles.scroll}>
                {sources.map((s) => (
                  <SourceCard
                    key={s.id}
                    source={s}
                    onPress={() => { setEvidenceForDrawer([]); setSelectedSource(s); }}
                    onPressOrganization={setSelectedOrgId}
                  />
                ))}
              </ScrollView>
            </>
          )}
          {!loading && !error && claims.length > 0 && (
            <ScrollView style={styles.scroll}>
              {claims.map((claim) => {
                const isExpanded = expandedClaimId === claim.id;
                const sourceIds = claimToSources[claim.id] ?? [];
                const evidenceSpans = claimToEvidence[claim.id] ?? [];
                const supportStatus = supportStatusByClaimId[claim.id];
                const supportLabel = supportStatus ? getSupportStatusLabel(supportStatus) : null;
                return (
                  <View key={claim.id} style={styles.claimBlock}>
                    <Pressable
                      style={styles.claimHeader}
                      onPress={() => setExpandedClaimId(isExpanded ? null : claim.id)}
                    >
                      <Text style={styles.claimText} numberOfLines={isExpanded ? undefined : 2}>
                        {claim.text}
                      </Text>
                      <View style={styles.claimMeta}>
                        <ClaimTypeBadge claimType={claim.claimType as any} />
                        {supportLabel && (
                          <Text
                            style={
                              supportStatus === "insufficient_support" ||
                              supportStatus === "limited_support" ||
                              supportStatus === "no_support_yet"
                                ? styles.supportLabelWeak
                                : styles.supportLabel
                            }
                          >
                            {supportLabel}
                          </Text>
                        )}
                        <Text style={styles.sourceCount}>
                          {sourceIds.length > 0
                            ? `${sourceIds.length} source${sourceIds.length !== 1 ? "s" : ""}`
                            : "No sources"}
                        </Text>
                      </View>
                      <Text style={styles.expandHint}>{isExpanded ? "▼" : "▶"}</Text>
                    </Pressable>
                    {isExpanded && (
                      <View style={styles.supportSection}>
                        {sourceIds.length === 0 ? (
                          <Text style={styles.noSupport}>
                            No supporting sources. This claim is marked as limited or insufficient support.
                          </Text>
                        ) : (
                          sourceIds.map((sid) => {
                            const source = sourceMap[sid];
                            if (!source) return null;
                            const excerpts = evidenceSpans
                              .filter((e: EvidenceSpan) => e.sourceId === sid && e.excerpt)
                              .map((e: EvidenceSpan) => e.excerpt);
                            return (
                              <View key={sid} style={styles.sourceRow}>
                                <SourceCard
                                  source={source}
                                  onPress={() => {
                                    const spans = evidenceSpans.filter((e: EvidenceSpan) => e.sourceId === sid);
                                    setEvidenceForDrawer(spans);
                                    setSelectedSource(source);
                                  }}
                                  onPressOrganization={setSelectedOrgId}
                                />
                                {excerpts.length > 0 ? (
                                  <Text style={styles.excerptLabel}>Excerpt: "{excerpts[0]}"</Text>
                                ) : (
                                  <Text style={styles.excerptMissing}>Source supports this claim (no excerpt)</Text>
                                )}
                              </View>
                            );
                          })
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
      {selectedSource && (
        <Modal visible transparent>
          <View style={styles.drawerOverlay}>
            <EvidenceDrawer
              source={selectedSource}
              evidenceSpans={evidenceForDrawer}
              onDismiss={() => {
                setSelectedSource(null);
                setEvidenceForDrawer([]);
              }}
            />
          </View>
        </Modal>
      )}
      <OrganizationProfileSheet
        organizationId={selectedOrgId}
        visible={!!selectedOrgId}
        onDismiss={() => setSelectedOrgId(null)}
        onOpenArticle={onOpenArticle}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: "85%", padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  title: { fontSize: 18, fontWeight: "600" },
  dismiss: { color: "#0066cc" },
  subtitle: { fontSize: 13, color: "#666", marginBottom: 12 },
  scroll: { maxHeight: 400 },
  sectionLabel: { fontSize: 14, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  claimBlock: { borderBottomWidth: 1, borderColor: "#eee", paddingVertical: 12 },
  claimHeader: {},
  claimText: { fontSize: 15, lineHeight: 22 },
  claimMeta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 8 },
  supportLabel: { fontSize: 12, color: "#2e7d32", fontWeight: "500" },
  supportLabelWeak: { fontSize: 12, color: "#b71c1c", fontWeight: "500" },
  sourceCount: { fontSize: 12, color: "#666" },
  expandHint: { fontSize: 10, color: "#999", marginTop: 4 },
  supportSection: { marginTop: 12, paddingLeft: 8, borderLeftWidth: 3, borderLeftColor: "#e0e0e0" },
  noSupport: { fontSize: 13, color: "#666", fontStyle: "italic" },
  sourceRow: { marginBottom: 12 },
  excerptLabel: { fontSize: 12, color: "#444", fontStyle: "italic", marginTop: 4, marginLeft: 4 },
  excerptMissing: { fontSize: 11, color: "#888", marginTop: 4, marginLeft: 4 },
  drawerOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
});
