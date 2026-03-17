import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { HistoryEntry } from "../types/history";
import { listHistoryEntries, clearHistory } from "../utils/historyStore";
import { trackEvent } from "../utils/analytics";

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function sourceLabel(source?: HistoryEntry["source"]): string {
  if (!source) return "";
  const labels: Record<HistoryEntry["source"] & string, string> = {
    search: "Search",
    image: "Image lookup",
    share: "Share",
    trace: "Trace",
    market: "Market",
    direct: "Related",
  };
  return labels[source] ?? "";
}

export function HistoryScreen() {
  const navigation = useNavigation();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listHistoryEntries();
      setEntries(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleClear = useCallback(async () => {
    setClearing(true);
    try {
      await clearHistory();
      setEntries([]);
    } finally {
      setClearing(false);
    }
  }, []);

  const handlePress = useCallback(
    (item: HistoryEntry) => {
      trackEvent("history_item_opened", { articleId: item.articleId });
      (navigation as any).navigate("Explore", {
        screen: "Article",
        params: { articleId: item.articleId },
      });
    },
    [navigation]
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No explorations yet.</Text>
        <Text style={styles.emptySub}>Articles you open from search, image, share, or trace will appear here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Pressable
          style={[styles.clearButton, clearing && styles.clearButtonDisabled]}
          onPress={handleClear}
          disabled={clearing}
        >
          <Text style={styles.clearButtonText}>{clearing ? "Clearing…" : "Clear"}</Text>
        </Pressable>
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => handlePress(item)}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle} numberOfLines={2}>
                {item.title || "Article"}
              </Text>
              {item.subtitle ? (
                <Text style={styles.rowSubtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              ) : null}
              <View style={styles.rowMeta}>
                {item.source ? (
                  <Text style={styles.sourceLabel}>{sourceLabel(item.source)}</Text>
                ) : null}
                <Text style={styles.timeLabel}>{formatRelativeTime(item.openedAt)}</Text>
              </View>
            </View>
          </Pressable>
        )}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { marginTop: 8, fontSize: 14, color: "#666" },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#333", textAlign: "center" },
  emptySub: { fontSize: 14, color: "#666", marginTop: 8, textAlign: "center", paddingHorizontal: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  clearButton: { paddingVertical: 6, paddingHorizontal: 12 },
  clearButtonDisabled: { opacity: 0.6 },
  clearButtonText: { fontSize: 14, color: "#1565c0" },
  list: { flex: 1 },
  row: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  rowContent: {},
  rowTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  rowSubtitle: { fontSize: 13, color: "#666", marginTop: 2 },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  sourceLabel: { fontSize: 12, color: "#888", textTransform: "capitalize" },
  timeLabel: { fontSize: 12, color: "#999" },
});
