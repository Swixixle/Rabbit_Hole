/**
 * Rabbit Hole v8 — Sample source records for provenance substrate.
 */
import type { SourceRecord } from "../types/provenance";

const CREATED = "2025-01-01T00:00:00Z";

const sources: SourceRecord[] = [
  {
    id: "sample-source|sony-product-page",
    title: "Sony WH-1000XM5 product page",
    sourceKind: "manufacturer",
    citationLabel: "Sony (official)",
    createdAt: CREATED,
  },
  {
    id: "sample-source|sony-support-manual",
    title: "Sony support / product manual",
    sourceKind: "manual",
    citationLabel: "Sony Support",
    createdAt: CREATED,
  },
  {
    id: "sample-source|reference-headphones",
    title: "Consumer headphones reference",
    sourceKind: "reference",
    citationLabel: "Reference",
    createdAt: CREATED,
  },
];

const byId = new Map(sources.map((s) => [s.id, s]));

export function getSampleSources(): SourceRecord[] {
  return sources;
}

export function getSampleSourceById(id: string): SourceRecord | undefined {
  return byId.get(id);
}
