import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import type { TracePreview } from "@rabbit-hole/contracts";
import { TracePreviewRow } from "../components/TracePreviewRow";
import { LoadingStateBlock } from "../components/LoadingStateBlock";
import { EmptyStateBlock } from "../components/EmptyStateBlock";
import { api } from "../api/client";

export function TracePreviewScreen({
  nodeId,
  onOpenNode,
  onBack,
}: {
  nodeId: string;
  onOpenNode: (nodeId: string) => void;
  onBack: () => void;
}) {
  const [traces, setTraces] = useState<TracePreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getTraces(nodeId)
      .then((r) => setTraces(r.traces || []))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load trace"))
      .finally(() => setLoading(false));
  }, [nodeId]);

  if (loading) return <LoadingStateBlock message="Loading trace…" />;
  if (error) return <EmptyStateBlock message={error} actionLabel="Go back" onAction={onBack} />;
  if (traces.length === 0) return <EmptyStateBlock message="No trace data for this node yet." actionLabel="Go back" onAction={onBack} />;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <Text style={styles.title}>Trace through systems</Text>
        {traces.map((t, i) => (
          <TracePreviewRow key={i} trace={t} onNodePress={onOpenNode} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  title: { fontSize: 18, fontWeight: "600", padding: 16 },
});
