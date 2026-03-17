# Rabbit Hole Core Model

**Status:** Canonical product architecture reference  
**Purpose:** Anchor the repository to the intended design so development cannot drift. Future sessions (and humans) should read this document to realign.

---

> **IMPORTANT**
>
> Rabbit Hole is a **universal recognition system** built around **knowledge nodes** and **exploration branches**.
>
> If development drifts into building standalone feature systems (e.g. reading assist without node-graph integration), this document should be consulted to realign development.

---

## 1. Rabbit Hole Definition

Rabbit Hole is a **recognition-driven exploration system** that turns real-world inputs into structured knowledge nodes connected by branching exploration paths.

The project we are building is **not a reading-assist system**. Rabbit Hole is a **universal recognition and exploration engine**.

The defining experience is:

```
Recognize something
→ Understand what it is
→ Explore related branches
→ Continue down an expanding knowledge path
```

The user should feel like they are **falling down a rabbit hole of connected knowledge**.

Reading Assist is only **one exploration interface**, not the core system.

---

### 1.1 User experience

The experience should feel like:

```
You are here
↓
Understand what this is
↓
Explore related paths
↓
Keep going deeper
```

---

### 1.2 Supported inputs

All inputs feed the same interpretation pipeline:

- camera images
- uploaded photos
- video frames
- audio clips
- text documents
- transcripts / subtitles
- web pages

---

### 1.3 Interactive Image Principle

A Rabbit Hole **image is a multi-object exploration surface**, not a single recognized subject.

- A photo is a **field of tappable regions**. Users should be able to tap many things in a single scene (foreground and background).
- Each tappable region can resolve into a node and branch options.
- Examples of tappable scene items: **shirt** (on a person), **flooring** (tile / vinyl / hardwood), **tree** (in background), **car**, **furniture**, **home materials**, **appliances**, **tools**, **landmarks**, **products**, **signage**.
- **Market** is one branch. **Materials**, **uses**, **alternatives**, and **DIY** are important exploration directions for product/material nodes.
- Live retailer and pricing integrations come later; the architecture must prepare for them now (sold where, price, materials, uses, cheaper alternatives, DIY).

---

## 2. Universal Interpretation Pipeline

Every input must resolve into the same structure:

```
Input
→ Capture
→ Recognition
→ Entity Identification
→ Claim Extraction
→ Source Linking
→ Organization Context
→ Knowledge Node
→ Branch Options
```

**Implemented trunk primitives (Core Groundwork v2–v4):** The first four layers beneath Input → Capture → Recognition are now implemented in code: **RecognitionEnvelope**, **RecognitionCandidate**, **IdentifiedEntity**, and **KnowledgeNode**. See [recognition-envelope-system-v1.md](recognition-envelope-system-v1.md), [entity-identification-layer-v1.md](entity-identification-layer-v1.md), and [knowledge-node-conversion-v1.md](knowledge-node-conversion-v1.md). **KnowledgeNode** is the first implemented node primitive in the trunk (id, title, nodeKind, confidence, identifiedEntityId, envelopeId; description null and relatedNodeIds/sourceIds empty in v4). Branch options, claim extraction, and source linking follow in later steps.

---

## 3. Core System Model — Nodes and Branches

Rabbit Hole revolves around **nodes** and **branches**.

- **Nodes** represent things the user can explore.
- **Branches** represent paths the user can follow.

This structure enables the “rabbit hole” experience. The system must always produce **branchable nodes**.

**Critical architectural rule:** A **KnowledgeNode must never be created directly from UI events**. Nodes are only created through the interpretation pipeline (RecognitionEnvelope → RecognitionCandidate → IdentifiedEntity → KnowledgeNode). UI (e.g. tap on a scene region) may **resolve** an existing node and open it; it must not instantiate or fabricate nodes. This preserves system integrity and keeps the graph traceable to pipeline output.

---

## 4. Core Node Types

These are **system primitives**. They form the foundation of the Rabbit Hole knowledge graph.

Each node type should be understood to contain (at least):

- **id**
- **type**
- **title**
- **description**
- **relatedNodeIds**
- **sourceIds**
- **confidence**
- **createdAt**

### 4.1 Node type list

| Node Type | Role |
|-----------|------|
| **EntityNode** | Recognized thing (landmark, product, species, person, place, etc.) |
| **ClaimNode** | Assertion or statement linked to evidence and support |
| **SourceNode** | Evidence, reference, or citation |
| **OrganizationNode** | Institution, company, publisher, or actor |
| **TopicNode** | Subject or theme the user can learn about |
| **MarketNode** | Product, price, purchase, or alternative (shopping branch) |

Nodes connect via **relatedNodeIds** and **sourceIds** so the graph can be traversed.

---

## 5. Branch Types

Branches represent **exploration directions**. They allow the user to follow new paths indefinitely.

### 5.1 Branch type list

| Branch | Description | Example target |
|--------|-------------|----------------|
| **learn** | Go deeper on a topic or concept | TopicNode |
| **compare** | See similar or contrasting entities | EntityNode |
| **source** | See where a claim or fact comes from | SourceNode |
| **history** | Historical or temporal context | TopicNode / EntityNode |
| **technical** | Technical details or specs | TopicNode / ClaimNode |
| **context** | Broader context (era, domain, region) | TopicNode |
| **market** | Buying, alternatives, resale | MarketNode |

### 5.2 Examples

- **Entity → learn → TopicNode**  
  e.g. Eiffel Tower → learn → “History of World’s Fair”
- **Entity → source → SourceNode**  
  e.g. Claim → source → Original study or article
- **Entity → compare → EntityNode**  
  e.g. Sony WH-1000XM5 → compare → Bose QC45
- **Entity → market → MarketNode**  
  e.g. Running Shoes → market → buy / alternatives / refurbished / resale

---

## 6. Market Branch

The **market branch** is how shopping integrates into the system.

**Market is not the primary goal of Rabbit Hole.** It is **one exploration branch**.

### 6.1 Example

```
Running Shoes
→ market
   → buy on Amazon
   → cheaper alternative
   → refurbished option
   → resale market
```

### 6.2 MarketNode contents

MarketNode should include (conceptually):

- **productName**
- **brand**
- **priceRange**
- **purchaseLinks**
- **alternativeProductIds**

Links may include:

- Amazon
- cheaper alternatives
- refurbished options
- resale market

---

## 7. Exploration Behavior

Document how rabbit holes expand: one node leads to branches, which lead to more nodes, which expose more branches.

### 7.1 Example chain (landmark)

```
Photo of Eiffel Tower
→ EntityNode: Eiffel Tower
→ learn → History of World's Fair
→ learn → Gustave Eiffel
→ context → French Industrial Revolution
```

### 7.2 Example chain (product)

```
Photo of headphones
→ EntityNode: Sony WH-1000XM5
→ compare → Bose QC45
→ market → cheaper alternatives
→ learn → noise cancellation technology
```

The system must always produce **branchable nodes**. Every node should expose one or more branch types so the user can keep going deeper.

---

## 8. Reading Assist — Preservation and Role

**Reading Assist is an exploration interface** that helps guide the user through nodes and branches.

It is **not** the core system.

- Reading Assist may generate prompts such as:
  - **learn more**
  - **see source**
  - **compare views**
- The **underlying system** is the **node + branch graph**.
- Reading Assist should ultimately drive the user along branches (learn, source, compare, etc.) rather than act as a standalone text-only feature.

When implementing or extending Reading Assist, integrate it with the node/branch model so that prompts map to branch options and node transitions.

---

## 9. Summary

| Concept | Meaning |
|--------|---------|
| **Recognition** | Any input (image, audio, text, etc.) enters the pipeline and yields entities and claims. |
| **Nodes** | Entity, Claim, Source, Organization, Topic, Market — the things the user explores. |
| **Branches** | learn, compare, source, history, technical, context, market — the directions the user can follow. |
| **Rabbit hole** | The experience of following branches from node to node, indefinitely. |
| **Reading Assist** | One interface on top of this graph; not the core. |
| **Interactive image** | Images are multi-object fields; any detectable region may become a node; tap-to-explore is core product, not a side feature. |

This architecture must remain visible in the repo so future development sessions can read it and realign automatically. If future work begins drifting toward subsystem-only development (e.g. reading-assist in isolation), refer back to this document.
