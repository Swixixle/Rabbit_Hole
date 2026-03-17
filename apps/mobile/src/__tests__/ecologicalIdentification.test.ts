/**
 * Ecological Identification Groundwork v1: tests for payload shape and contract.
 */
import type { EcologicalEntity, EcologicalEntityKind } from "@rabbit-hole/contracts";

const VALID_KINDS: EcologicalEntityKind[] = [
  "plant",
  "tree",
  "insect",
  "fungus",
  "bird",
  "animal",
  "ecosystem_feature",
  "unknown",
];

describe("Ecological entity payload shape", () => {
  it("matches contract: id, name, kind, optional summary, seasonalNotes, safetyNotes, articleId", () => {
    const entity: EcologicalEntity = {
      id: "eco-poison-ivy",
      name: "Poison ivy",
      kind: "plant",
      summary: "Woody vine or shrub, leaves of three.",
      seasonalNotes: ["Often more visible in spring and summer."],
      safetyNotes: [
        "General awareness: Some people experience skin irritation from contact with the plant's oil.",
      ],
      articleId: "article-poison-ivy",
    };
    expect(entity.id).toBe("eco-poison-ivy");
    expect(entity.name).toBe("Poison ivy");
    expect(VALID_KINDS).toContain(entity.kind);
    expect(entity.summary).toBeDefined();
    expect(Array.isArray(entity.seasonalNotes)).toBe(true);
    expect(Array.isArray(entity.safetyNotes)).toBe(true);
    expect(entity.articleId).toBe("article-poison-ivy");
  });

  it("allows minimal shape without optional fields", () => {
    const minimal: EcologicalEntity = {
      id: "eco-oak",
      name: "Oak tree",
      kind: "tree",
    };
    expect(minimal.id).toBe("eco-oak");
    expect(minimal.summary).toBeUndefined();
    expect(minimal.articleId).toBeUndefined();
  });

  it("exploreImage response may include ecologicalEntity", () => {
    type ExploreImageRes = {
      segments?: Array<{ segmentId: string; label: string }>;
      ecologicalEntity?: EcologicalEntity | null;
    };
    const withEco: ExploreImageRes = {
      segments: [{ segmentId: "seg-poison-ivy", label: "Poison ivy" }],
      ecologicalEntity: {
        id: "eco-poison-ivy",
        name: "Poison ivy",
        kind: "plant",
        articleId: "article-poison-ivy",
      },
    };
    expect(withEco.ecologicalEntity).not.toBeNull();
    expect(withEco.ecologicalEntity!.name).toBe("Poison ivy");
  });

  it("exploreImage response without ecological entity has no ecologicalEntity", () => {
    type ExploreImageRes = { segments?: unknown[]; ecologicalEntity?: EcologicalEntity | null };
    const withoutEco: ExploreImageRes = { segments: [], ecologicalEntity: null };
    expect(withoutEco.ecologicalEntity).toBeNull();
  });
});
