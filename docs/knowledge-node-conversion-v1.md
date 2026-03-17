# Rabbit Hole — Knowledge Node Conversion v1

**Status:** Implemented (Core Groundwork v4)  
**Canonical references:** [rabbit-hole-core-model.md](rabbit-hole-core-model.md), [system-architecture-v1.md](system-architecture-v1.md), [entity-identification-layer-v1.md](entity-identification-layer-v1.md)

---

## 1. Purpose

The Knowledge Node Conversion Layer turns normalized identified entities into the **first canonical Rabbit Hole knowledge nodes**. This step does not implement claim extraction, source linking, organization context, or branch graph expansion—only the bridge between identified entities and the node + branch system defined in the core model.

---

## 2. Why Rabbit Hole needs a first canonical exploration object

The trunk so far yields recognition output and then identified entities. The product experience (“explore related branches”, “keep going deeper”) requires **explorable nodes**: stable records with an id, title, kind, and slots for related nodes and sources. KnowledgeNode is that object. In v4 it is minimal: no description text, no relatedNodeIds, no sourceIds. Those come in later steps.

---

## 3. Difference between candidate, entity, and node

| Layer | Meaning |
|-------|--------|
| **RecognitionCandidate** | Raw recognition output (label, confidence, candidateType). |
| **IdentifiedEntity** | Normalized interpretation-ready object (title, entityKind, confidence, traceability). Bridge before nodes. |
| **KnowledgeNode** | First canonical exploration object: id, identifiedEntityId, envelopeId, title, nodeKind, description (null in v4), relatedNodeIds ([] in v4), sourceIds ([] in v4), confidence, createdAt. |

---

## 4. Direct kind mapping in v4

Entity kind maps 1:1 to node kind:

- entity → entity  
- topic → topic  
- product → product  
- landmark → landmark  
- media → media  

No inference.

---

## 5. Null descriptions, empty arrays in v4

- **description:** `null`. No generated prose or placeholder yet.  
- **relatedNodeIds:** `[]`. Branch generation and related-node linking come later.  
- **sourceIds:** `[]`. Source linking comes later.

---

## 6. No claim/source/organization enrichment yet

This step does not:

- Attach claims to nodes  
- Link sources  
- Link organizations  
- Generate branch options  
- Attach market links  

It only converts each identified entity into one KnowledgeNode with the fields above.

---

## 7. Future use

KnowledgeNode is the input to (later steps):

- **Branch generation** — Populate relatedNodeIds and expose learn / compare / source / market etc.  
- **Claim extraction** — Attach claims to nodes.  
- **Source linking** — Populate sourceIds and link to evidence.  
- **Organization linking** — Connect nodes to organizations.  
- **Market branch attachment** — Connect product nodes to MarketNode and purchase options.

---

## 8. Files

- **Types:** `apps/mobile/src/types/knowledgeNodes.ts` — RabbitHoleNodeKind, KnowledgeNode, KnowledgeNodeSummary, DEFAULT_KNOWLEDGE_NODE_SUMMARY.  
- **Utils:** `apps/mobile/src/utils/knowledgeNodes.ts` — mapEntityKindToNodeKind, createKnowledgeNodeId, deriveKnowledgeNodeDescription, deriveKnowledgeNodes.

---

## 9. Implemented trunk after v4

```
Input
→ RecognitionEnvelope
→ RecognitionCandidate
→ IdentifiedEntity
→ KnowledgeNode
→ (branch options, claims, sources — later)
```
