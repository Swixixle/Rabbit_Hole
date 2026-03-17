# Interactive Scene Regions v1

**Status:** Canonical reference for Core Groundwork v5  
**Purpose:** Define the multi-object image interaction layer so Rabbit Hole images are tappable exploration surfaces, not single-subject recognitions.

---

## 1. Purpose

A Rabbit Hole **image is not one thing**. It is a **field of tappable regions**.

Users should be able to tap many things in a single scene—foreground and background—and have each tap resolve to a node and branch options. This document describes the types, hit-testing, selection, and UI overlay that support that behavior.

---

## 2. Why Multi-Object Scene Regions

Rabbit Hole is a **universal recognition and exploration app**. Treating a photo as a single recognized subject would underuse the pipeline and the user’s intent. Examples of tappable scene items:

- a **shirt** on a person  
- **flooring** (tile / vinyl / hardwood)  
- a **tree** in the background  
- different **cars**  
- **furniture**, **home materials**, **appliances**, **tools**  
- **landmarks**, **products**, **signage**

The intended flow is:

```
Photo
→ many detected regions
→ user taps a region
→ region highlights / slightly enlarges
→ region resolves to node
→ Rabbit Hole branches open
```

Interactive scene regions are therefore **core product**, not a side feature.

---

## 3. Normalized Bounding Boxes

All region coordinates are **normalized** in the range 0–1 relative to the image:

- **x, y**: top-left corner  
- **width, height**: size in normalized space  

This keeps layout independent of actual pixel dimensions and allows the same data to drive different display sizes.

---

## 4. Region Kinds

Scene region kinds are image/scene-focused and can be richer than recognition candidate types:

- **entity**, **topic**, **product**, **landmark**, **media** (aligned with recognition)  
- **material**, **plant**, **vehicle**, **apparel** (for future detections)

Mapping from **RecognitionCandidate** to scene region kind is conservative in v5 (entity → entity, topic → topic, etc.). Richer kinds are allowed in raw detections and in **SceneObjectRegion**; they are not inferred from candidates in v5.

---

## 5. Deterministic Hit-Testing

- **Tap** is expressed as a normalized (x, y) point.  
- A region **contains** the point if the point lies inside its bounding box (edges inclusive).  
- Multiple regions can contain the same point (e.g. shirt and person).  

**Primary region** at a point is chosen by deterministic precedence:

1. **Smallest bounding box area** wins (most specific object).  
2. If tied, **higher confidence** wins.  
3. If still tied, **stable regionIds order** wins.  

This gives users a predictable “tap the thing I meant” behavior in crowded scenes.

---

## 6. Preview Selection

The **active scene object preview** is the app-facing payload for “what the user just tapped”: regionId, envelopeId, label, regionKind, confidence, knowledgeNodeId (or null). It is derived from the primary region at the tap point. No full node detail or branch graph is required in v5; this is the thin hook for “show something for this object.”

---

## 7. UI Overlay Groundwork

A thin overlay component (**InteractiveImageRegionOverlay**) renders transparent, tappable hit areas over the image using normalized bounding boxes. When a region is selected (`selectedRegionId`), it is visually highlighted and slightly enlarged (or outlined). Taps invoke `onRegionPress(region)`. Styling is restrained; no heavy debug boxes by default. This is the first visible implementation of “tap anything in the photo.”

---

## 8. Relationship to the Trunk

Current trunk:

```
Input → RecognitionEnvelope → RecognitionCandidate → IdentifiedEntity → KnowledgeNode
```

New image branch:

```
Image
→ Scene Object Regions
→ Tap Selection
→ RecognitionCandidate (optional link)
→ IdentifiedEntity (optional link)
→ KnowledgeNode (optional link)
```

- **SceneObjectRegion** can store `recognitionCandidateId`, `identifiedEntityId`, and `knowledgeNodeId` when summaries are supplied and a match is found (normalized label + compatible kind).  
- Regions are derived from **raw** detections (e.g. from a future detector); optional linking to candidate/entity/node is best-effort and conservative.  
- One image yields **many** tappable node entry points. The scene is not collapsed into one subject.

---

## 9. Action-Slot Preparation

We do **not** implement live prices or retailer links in v5. We **do** establish the architecture for exploration branches:

- **market** — sold where, price (later)  
- **materials** — what it’s made of  
- **uses** — what it’s for  
- **alternatives** — cheaper or similar options  
- **diy** — how to make or repair  

**NodeActionSlotKind** and **deriveDefaultNodeActionSlotKinds(node)** define which branch kinds each node kind supports (e.g. product → learn, compare, market, materials, uses, alternatives, diy; landmark → learn, history, context, source). v5 only sets these expectations; full action records and live integrations come later.

---

## 10. Future Use

- **Segmentation models** can produce raw regions with bounding boxes (and eventually masks).  
- **Retailer / provider integrations** (e.g. Home Depot, Amazon) will plug into market and source branches.  
- **Live pricing** and “buy” links will use the same region → node → action-slot path.  
- **Background objects** (e.g. tree, car in distance) are first-class tappable regions.  

Interactive scene regions are the layer that makes “tap anything in the photo” possible and keeps the product aligned with the core model.
