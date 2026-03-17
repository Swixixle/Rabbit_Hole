# Rabbit Hole — Entity Identification Layer v1

**Status:** Implemented (Core Groundwork v3)  
**Canonical references:** [rabbit-hole-core-model.md](rabbit-hole-core-model.md), [system-architecture-v1.md](system-architecture-v1.md), [recognition-envelope-system-v1.md](recognition-envelope-system-v1.md)

---

## 1. Purpose

The Entity Identification Layer converts raw recognition candidates into **normalized identified entities** that are ready to become Rabbit Hole nodes. This step does not implement claim extraction, source linking, organization context, or branch graph generation—only the bridge between recognition output and future nodes.

---

## 2. Why Rabbit Hole needs a normalized interpretation object after recognition

Recognition yields labels and confidence (candidates). The rest of the pipeline needs stable, exploration-facing objects with:

- A deterministic id
- A normalized title (trimmed, collapsed whitespace)
- A canonical entity kind (entity, topic, product, landmark, media)
- Traceability back to envelope and candidate

IdentifiedEntity is that object. It is not yet a full node (no relatedNodeIds, sourceIds, or branch options), but it is the first stable interpretation shape.

---

## 3. Difference between envelope, candidate, identified entity, and node

| Layer | Meaning |
|-------|--------|
| **RecognitionEnvelope** | Modality-normalized capture (what was captured, from where). |
| **RecognitionCandidate** | Raw recognition output (label, confidence, candidateType). |
| **IdentifiedEntity** | Normalized interpretation-ready object (id, title, entityKind, confidence, envelopeId, candidateId). Bridge before nodes. |
| **Node (future)** | Full knowledge node (EntityNode, TopicNode, MarketNode, etc.) with relatedNodeIds, sourceIds, and branch options. Node conversion comes later. |

---

## 4. Direct type-to-kind mapping in v3

Recognition `candidateType` maps directly to `RabbitHoleEntityKind`:

- entity → entity  
- topic → topic  
- product → product  
- landmark → landmark  
- media → media  

No inference or semantic resolution in v3.

---

## 5. No semantic resolution yet

This step does not:

- Resolve entities to knowledge-base ids
- Merge duplicates by meaning
- Attach claims, sources, or organizations
- Generate branch options

It only normalizes title, maps type to kind, and assigns a deterministic id.

---

## 6. Future use

IdentifiedEntity is the input to (later steps):

- **EntityNode generation** — Map entity/landmark/product to EntityNode.
- **TopicNode generation** — Map topic to TopicNode.
- **MarketNode generation** — Map product to MarketNode and market branch.
- **Claim extraction** — Attach claims to entities.
- **Source linking** — Attach sources to entities and claims.

---

## 7. Files

- **Types:** `apps/mobile/src/types/entityIdentification.ts` — RabbitHoleEntityKind, IdentifiedEntity, IdentifiedEntitySummary, DEFAULT_IDENTIFIED_ENTITY_SUMMARY.
- **Utils:** `apps/mobile/src/utils/entityIdentification.ts` — normalizeIdentifiedEntityTitle, mapRecognitionCandidateTypeToEntityKind, createIdentifiedEntityId, deriveIdentifiedEntities.

---

## 8. Implemented trunk after v3

```
Input
→ RecognitionEnvelope
→ RecognitionCandidate
→ IdentifiedEntity
→ (Node conversion, later)
```
