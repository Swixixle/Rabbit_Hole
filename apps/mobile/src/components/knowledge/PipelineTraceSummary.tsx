/**
 * Rabbit Hole Core Groundwork v11 — Minimal pipeline trace display.
 * Compact proof that the node came through the canonical recognition substrate.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { PipelineTraceRecord } from "../../types/pipelineTrace";

type Props = {
  trace: PipelineTraceRecord;
};

export function PipelineTraceSummary({ trace }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.row}>Envelope: {trace.envelopeId}</Text>
      {trace.candidateId ? (
        <Text style={styles.row}>Candidate: {trace.candidateId}</Text>
      ) : null}
      {trace.identifiedEntityId ? (
        <Text style={styles.row}>Entity: {trace.identifiedEntityId}</Text>
      ) : null}
      {trace.knowledgeNodeId ? (
        <Text style={styles.row}>Node: {trace.knowledgeNodeId}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 4 },
  row: { fontSize: 11, color: "rgba(0,0,0,0.5)", marginBottom: 2 },
});
