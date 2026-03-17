/**
 * Organization/Company Profile v1: compact sheet showing who stands behind a source or media.
 * Organization-to-Claim/Source Cross-Linking v1: shows Related sources and Related claims when present.
 */
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from "react-native";
import type {
  OrganizationProfile as OrgProfile,
  OrganizationLinkedItem,
  OrganizationRelatedSource,
  OrganizationRelatedClaim,
} from "@rabbit-hole/contracts";
import { LoadingStateBlock } from "./LoadingStateBlock";
import { EmptyStateBlock } from "./EmptyStateBlock";
import { api } from "../api/client";

const KIND_LABELS: Record<string, string> = {
  company: "Company",
  publisher: "Publisher",
  network: "Network",
  regulator: "Regulator",
  insurer: "Insurer",
  pharma: "Pharma",
  nonprofit: "Nonprofit",
  unknown: "Unknown",
};

function kindLabel(kind: string): string {
  return KIND_LABELS[kind] ?? kind;
}

const LINKED_ITEM_KIND_LABELS: Record<string, string> = {
  product: "Product",
  medication: "Medication",
  brand: "Brand",
  service: "Service",
  media_property: "Media",
  unknown: "Other",
};

function linkedItemKindLabel(kind: string): string {
  return LINKED_ITEM_KIND_LABELS[kind] ?? kind;
}

export function OrganizationProfileSheet({
  organizationId,
  visible,
  onDismiss,
  onOpenArticle,
}: {
  organizationId: string | null;
  visible: boolean;
  onDismiss: () => void;
  /** When a linked item has articleId, tap opens this article. */
  onOpenArticle?: (articleId: string) => void;
}) {
  const [profile, setProfile] = useState<OrgProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !organizationId) {
      setProfile(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    api
      .getOrganizationProfile(organizationId)
      .then((p) => setProfile(p ?? null))
      .catch(() => setError("Could not load profile"))
      .finally(() => setLoading(false));
  }, [visible, organizationId]);

  if (!visible) return null;

  return (
    <Modal transparent visible animationType="slide">
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>Organization</Text>
            <Pressable onPress={onDismiss}>
              <Text style={styles.dismiss}>Close</Text>
            </Pressable>
          </View>
          {loading && <LoadingStateBlock message="Loading…" />}
          {error && <EmptyStateBlock message={error} actionLabel="Close" onAction={onDismiss} />}
          {!loading && !error && profile && (
            <ScrollView style={styles.scroll}>
              <Text style={styles.name}>{profile.name}</Text>
              <View style={styles.kindBadge}>
                <Text style={styles.kindText}>{kindLabel(profile.kind)}</Text>
              </View>
              <Text style={styles.summary}>{profile.summary}</Text>
              {profile.description ? (
                <Text style={styles.description}>{profile.description}</Text>
              ) : null}
              {profile.notableProducts?.length ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Notable products / services</Text>
                  {profile.notableProducts.map((item, i) => (
                    <Text key={i} style={styles.bullet}>• {item}</Text>
                  ))}
                </View>
              ) : null}
              {profile.notableFigures?.length ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Notable figures</Text>
                  {profile.notableFigures.map((item, i) => (
                    <Text key={i} style={styles.bullet}>• {item}</Text>
                  ))}
                </View>
              ) : null}
              {profile.relatedTopics?.length ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Related topics</Text>
                  <Text style={styles.topics}>{profile.relatedTopics.join(", ")}</Text>
                </View>
              ) : null}
              {profile.ownershipNote ? (
                <Text style={styles.note}>{profile.ownershipNote}</Text>
              ) : null}
              {profile.linkedItems?.length ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Related products & offerings</Text>
                  {profile.linkedItems.map((item) => (
                    <LinkedItemRow
                      key={item.id}
                      item={item}
                      onOpenArticle={item.articleId ? onOpenArticle : undefined}
                    />
                  ))}
                </View>
              ) : null}
              {profile.relatedSources?.length ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Related sources</Text>
                  {profile.relatedSources.map((s) => (
                    <RelatedSourceRow key={s.id} source={s} />
                  ))}
                </View>
              ) : null}
              {profile.relatedClaims?.length ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Related claims</Text>
                  <Text style={styles.relatedHint}>Claims associated with sources from this organization; not necessarily endorsed by them.</Text>
                  {profile.relatedClaims.map((c) => (
                    <RelatedClaimRow key={c.id} claim={c} />
                  ))}
                </View>
              ) : null}
              {profile.notes?.length ? (
                <View style={styles.section}>
                  {profile.notes.map((line, i) => (
                    <Text key={i} style={styles.note}>{line}</Text>
                  ))}
                </View>
              ) : null}
            </ScrollView>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

function LinkedItemRow({
  item,
  onOpenArticle,
}: {
  item: OrganizationLinkedItem;
  onOpenArticle?: (articleId: string) => void;
}) {
  const hasArticle = Boolean(item.articleId && onOpenArticle);
  const content = (
    <>
      <View style={styles.linkedItemMeta}>
        <Text style={styles.linkedItemKind}>{linkedItemKindLabel(item.kind)}</Text>
      </View>
      <Text style={styles.linkedItemName}>{item.name}</Text>
      {item.summary ? <Text style={styles.linkedItemSummary}>{item.summary}</Text> : null}
      {hasArticle ? <Text style={styles.linkedItemAction}>Tap to open article</Text> : null}
    </>
  );
  if (hasArticle) {
    return (
      <Pressable
        style={styles.linkedItemRow}
        onPress={() => onOpenArticle!(item.articleId!)}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={styles.linkedItemRow}>{content}</View>;
}

function RelatedSourceRow({ source }: { source: OrganizationRelatedSource }) {
  return (
    <View style={styles.relatedRow}>
      <Text style={styles.relatedSourceTitle} numberOfLines={2}>{source.title}</Text>
    </View>
  );
}

function confidenceLabel(conf?: string): string {
  if (!conf) return "";
  return conf === "high" ? "High" : conf === "medium" ? "Medium" : conf === "low" ? "Low" : conf;
}

function RelatedClaimRow({ claim }: { claim: OrganizationRelatedClaim }) {
  return (
    <View style={styles.relatedRow}>
      {claim.confidence ? (
        <Text style={styles.relatedClaimMeta}>{confidenceLabel(claim.confidence)}</Text>
      ) : null}
      <Text style={styles.relatedClaimText} numberOfLines={3}>{claim.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "80%",
    padding: 16,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "600" },
  dismiss: { color: "#0066cc" },
  scroll: { maxHeight: 400 },
  name: { fontSize: 20, fontWeight: "600", color: "#333", marginBottom: 6 },
  kindBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "#e8e8e8", borderRadius: 6, marginBottom: 12 },
  kindText: { fontSize: 12, color: "#555" },
  summary: { fontSize: 15, color: "#444", lineHeight: 22, marginBottom: 8 },
  description: { fontSize: 14, color: "#555", lineHeight: 20, marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "600", color: "#666", marginBottom: 6, textTransform: "uppercase" },
  bullet: { fontSize: 14, color: "#444", lineHeight: 22, marginBottom: 2 },
  topics: { fontSize: 14, color: "#444", lineHeight: 20 },
  note: { fontSize: 13, color: "#666", fontStyle: "italic", lineHeight: 20, marginBottom: 6 },
  linkedItemRow: { marginBottom: 12, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: "#f8f8f8", borderRadius: 8 },
  linkedItemMeta: { marginBottom: 4 },
  linkedItemKind: { fontSize: 11, color: "#666", textTransform: "uppercase" },
  linkedItemName: { fontSize: 15, fontWeight: "600", color: "#333" },
  linkedItemSummary: { fontSize: 13, color: "#555", marginTop: 4, lineHeight: 18 },
  linkedItemAction: { fontSize: 12, color: "#0066cc", marginTop: 6 },
  relatedHint: { fontSize: 12, color: "#666", fontStyle: "italic", marginBottom: 8 },
  relatedRow: { marginBottom: 10, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: "#f8f8f8", borderRadius: 8 },
  relatedSourceTitle: { fontSize: 14, color: "#333" },
  relatedClaimMeta: { fontSize: 11, color: "#666", marginBottom: 4 },
  relatedClaimText: { fontSize: 13, color: "#444", lineHeight: 18 },
});
