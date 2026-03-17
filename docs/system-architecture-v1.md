# Rabbit Hole — System Architecture v1

**Status:** Canonical internal reference  
**Audience:** Engineers, AI collaborators, technical planning  
**Purpose:** Define the system that actually exists, distinguish implemented vs stubbed vs planned, and provide a dependency map for future work.

---

## 1. System Purpose

Rabbit Hole is a **multi-input interpretation engine**.

It accepts an input such as:

- image
- camera capture
- page scan
- audio clip
- media URL
- selected text
- shared link
- text query

and attempts to resolve that input into one or more structured outputs:

- article
- media interpretation
- organization profile
- verification bundle
- study guide
- market context
- **ecological entity** (groundwork)

The system is **not** a search engine wrapper. Its core design is:

```
input
→ normalization
→ resolver
→ structured interpretation
→ claims / evidence / context
```

---

## 2. Rabbit Hole Core Model

The canonical product architecture is defined in **[docs/rabbit-hole-core-model.md](rabbit-hole-core-model.md)**. That document anchors the repository to the intended design: a **universal recognition system** built around **knowledge nodes** and **exploration branches**.

Summary for this architecture spec:

- **Recognition** feeds **entity nodes**. Every input (camera, upload, audio, text, transcript, web) flows through the same interpretation pipeline and resolves into nodes (Entity, Claim, Source, Organization, Topic, Market).
- **Nodes** generate claims and sources. The epistemic spine (claim → confidence → support → source → organization) is how nodes connect to evidence and institutions.
- **Nodes** expose **exploration branches**. Branches (learn, compare, source, history, technical, context, market) are the directions the user can follow from any node.
- **Exploration branches** form **rabbit holes**. The product experience is “recognize something → understand what it is → explore related paths → keep going deeper.” Reading Assist is one interface on top of this graph, not the core system.

If development drifts toward building standalone feature systems (e.g. reading assist without node-graph integration), consult **rabbit-hole-core-model.md** to realign.

**Universal recognition envelope (Core Groundwork v2):** Rabbit Hole now has a **universal recognition envelope layer** ([docs/recognition-envelope-system-v1.md](recognition-envelope-system-v1.md)). All input modalities (text, image, audio, video, media_context) are expected to enter through this shape. **RecognitionEnvelope** is the modality-normalized capture record; **RecognitionCandidate** is the raw recognition output (label, confidence, candidateType) prior to node conversion. Entity/node resolution, claim extraction, and branch options follow in later steps.

**Entity identification layer (Core Groundwork v3):** Rabbit Hole now includes an **entity identification layer** ([docs/entity-identification-layer-v1.md](entity-identification-layer-v1.md)). Raw recognition candidates normalize into **IdentifiedEntity** (id, title, entityKind, confidence, envelopeId, candidateId) before node conversion. This is the first stable interpretation object; full nodes (EntityNode, TopicNode, MarketNode) and branch options come in a later step.

**Knowledge node conversion (Core Groundwork v4):** Rabbit Hole now includes a **knowledge node conversion layer** ([docs/knowledge-node-conversion-v1.md](knowledge-node-conversion-v1.md)). Identified entities convert into the first canonical **KnowledgeNode** (id, identifiedEntityId, envelopeId, title, nodeKind, description null, relatedNodeIds/sourceIds empty in v4). This is the first real node primitive in code; branch generation, claim extraction, and source linking follow in later steps.

**Interactive image / multi-object scene (Core Groundwork v5):** Rabbit Hole images are **multi-object exploration surfaces**, not single-subject recognitions. Any detectable region in a scene (shirt, flooring, tree, car, furniture, product, landmark, etc.) can be tappable and resolve to a node. See [docs/interactive-scene-regions-v1.md](interactive-scene-regions-v1.md). Market, materials, uses, alternatives, and DIY are architecturally prepared as exploration branches; live retailer/pricing integrations come later.

**Unified exploration graph (Core Groundwork v7):** Related nodes and branch targets are **one graph-backed substrate**, two presentations. **Related** is a summary view over exploration edges; **branch targets** are the same edges filtered by branch semantics. **BranchRecord** is the first-class branch identity; **ExplorationTarget** is the graph-derived output. Related is a presentation mode, not a separate graph primitive.

**Claim / Source / Support substrate (Core Groundwork v8):** **ClaimRecord** expresses an epistemic assertion about a node. **SourceRecord** expresses a reusable source artifact. **ClaimSupportEdge** expresses why the system can present a claim as supported, mentioned, or contradicted. Exploration graph = how nodes relate; provenance substrate = why claims about nodes are believed. Graph and provenance remain separate but compatible.

**Edge–claim references (Core Groundwork v9):** **EdgeClaimReference** links exploration relations to claims without merging graph and provenance. Graph expresses that a relation is traversable. Provenance expresses why a claim is presentable. EdgeClaimReference allows a traversed relation to disclose its epistemic basis.

**Evidence availability (Core Groundwork v10):** Evidence availability is an explicit substrate concern. Rabbit Hole distinguishes: supported relations; relations not yet evidenced; unresolvable displayed relations; nodes with no claims yet. Absence of evidence data is represented honestly, not collapsed into a generic empty state.

**Recognition pipeline demo (Core Groundwork v11):** Demo/sample node opening now exercises the canonical recognition pipeline rather than skipping directly to hand-authored node objects. Pipeline traceability is exposed as lightweight substrate metadata, not as inference.

**Saved object tray (Core Groundwork v12):** Saved objects are references to recognized scene regions, not ad hoc favorites. Each saved object preserves source envelope, region, pipeline links, and a verification readiness state (evidenced, recognition_only, unverified). This allows collected items to remain traceable and eventually source-checkable.

**Saved object persistence (Core Groundwork v13):** Saved object tray items are now persisted locally as canonical SavedObjectItem records. Persistence stores references and snapshot epistemic state, not duplicated media. Rehydration restores collected objects without inventing missing knowledge links.

**Real camera capture (Core Groundwork v14):** Real camera captures can now enter the canonical recognition pipeline through manually defined regions and honest recognition stubs. This version stress-tests the substrate against real captured media without pretending full recognition exists.

**Vision recognition API (Core Groundwork v15):** Manual recognition stubs are replaced by backend vision candidate ingestion for selected image regions. Recognition results enter the pipeline as candidates only; unmatched results remain recognition_only rather than generating fabricated knowledge nodes.

**Real vision backend (Core Groundwork v16):** The vision route now performs real backend recognition on cropped image regions and returns candidate-level results into the canonical pipeline. Recognition output remains candidate input only; unmatched objects remain recognition_only rather than generating fabricated knowledge.

**Generated provisional nodes (Core Groundwork v17):** When recognition succeeds but no authored node matches, Rabbit Hole can generate a provisional node package (node + unsourced claims) as a fallback exploration path. Generated nodes are explicitly marked as generated and remain not-yet-verified by default.

**Persistent saved object tray (Core Groundwork v18):** Saved object tray items are persisted locally using AsyncStorage. The collection rail stores references and verification state, allowing Rabbit Hole to accumulate objects across sessions.

---

## 3. Core Architectural Rules

### 3.1 One interpretation engine, many inputs

All input types should converge into the same structured interpretation system.

Avoid building separate product silos such as:

- “video mode”
- “podcast mode”
- “plant mode”

Preferred pattern:

```
input type
→ resolver
→ shared interpretation surfaces
```

### 3.2 Epistemic spine is canonical

The core knowledge chain is:

```
claim
→ confidence
→ support
→ source
→ organization
```

Any new feature must preserve or integrate with this spine rather than bypass it.

### 3.3 No new major UI surfaces by default

New capabilities should attach to existing surfaces when possible:

- ArticleScreen
- VerifySheet
- ShareIntakeScreen
- MediaInterpretationSheet
- OrganizationProfileSheet
- ImageFocusScreen
- Home/Explore

### 3.4 Fixture-first is intentional

Fixture-backed implementations are acceptable and preferred for groundwork phases. External APIs, ML, and live systems should only be added after the contract and flow are stable.

### 3.5 Stubbed is allowed, but must be explicit

Every subsystem should be clearly one of:

- **implemented**
- **fixture-backed**
- **stubbed**
- **planned**

Do not blur these states in documentation or implementation planning.

---

## 4. Current Repository Structure

```
apps/
  api/
  mobile/
  extension/

packages/
  contracts/

docs/
  architecture + feature docs
```

### 4.1 apps/api

FastAPI application. Fixture-backed. Provides all current backend routes and models.

### 4.2 apps/mobile

Expo / React Native application. Primary product surface.

### 4.3 apps/extension

Browser extension groundwork. Thin handoff client into Rabbit Hole.

### 4.4 packages/contracts

Shared TypeScript contracts for mobile/extension/frontend alignment.

---

## 5. Implemented vs Stubbed vs Planned

### 4.1 Implemented core systems

These are real and working within the current fixture-backed architecture:

- article assembly contract
- claim model with confidence/support
- source model
- evidence / verification model
- trace model
- market surface
- organization profile surface
- organization → product/med linking groundwork
- organization → source/claim cross-link groundwork
- browser extension URL/selection handoff
- share intake flow
- image object selection flow
- history
- analytics event emission and backend capture
- clip rendering/export (image-based)
- study guide attachment
- media URL classification / resolve
- media interpretation (fixture-backed summary/transcript)
- media claims (fixture-backed)
- verify-from-media groundwork
- audio recognition groundwork (fixture-backed)
- real microphone capture groundwork
- location context groundwork (pass-through only)
- **ecological identification groundwork** (fixture-backed; optional `ecologicalEntity` on explore/image, Nature block on ImageFocusScreen)
- **live subtitle / text extraction groundwork** (paste captions, media transcript → Share Intake; same pipeline as OCR/pasted text)
- **TV/show recognition groundwork** (fixture-backed; extends audio recognition with networkOrPlatform, notableCast, kind tv_show; reuses article/media/org routing)
- **reading-assist groundwork** (text focus only; focus-block mode on Article and Study; tap-to-focus; no eye tracking or rotary enlargement). **v2 — Sentence anchoring:** block focus remains primary; optional `focusedSentenceId` and sentence anchors (id scheme, segmentation by `. ! ?`) prepare fine-grained reading tools (rotary enlargement, eye tracking) without UI change. **v3 — Sentence focus surface:** sentence focus surface exists inside focused article blocks only; block remains the primary reading unit; sentence layer is minimal and subordinate (tappable sentences, light emphasis/deemphasis); Study unchanged. **v4 — Rotary sentence enlargement surface:** focused article sentence can render into a local enlargement band below the paragraph; article remains the primary surface; enlargement is subordinate to block and sentence focus; no new reading mode; Study unchanged. **v5 — Guided sentence progression:** focused article sentence can be advanced or reversed within the focused block via Previous/Next in the band; progression is manual and within-block only; article remains the primary surface; no new mode; no cross-block progression; Study unchanged. **v6 — Focus follow scrolling:** focused article block now supports assistive follow scrolling; scrolling is local, manual-focus-driven, and subordinate; no new mode; exact sentence tracking deferred; Study unchanged. **v7 — Inline sentence steering targets:** focused article sentences expose local adjacent steering targets inline (previous/next subtly styled); inline steering remains subordinate to block and sentence focus; band progression remains the explicit progression surface; no new mode; Study unchanged. **v8 — Focus event spine:** reading-assist interactions emit structured focus events via an optional callback; events form a spine for analytics, replay, and future sensor integrations; events are observational and do not drive behavior; no UI changes; Article only. **v9 — Focus session aggregator:** focus events reduce into an in-memory session summary (startedAt, endedAt, focused block/sentence ids, counts, last ids); session summary is observational and derived; resetSessionSummary() resets without changing assist state; no behavior or UI changes; persistence deferred; Article only. **v10 — Dwell and backtrack heuristics:** event/session layers reduce into a lightweight heuristic summary (totalBlockDwellMs, totalSentenceDwellMs, dwellByBlockId, dwellBySentenceId, backtrackCount, lastProgressDirection); heuristics are derived, local, and observational; no UI or behavior changes; persistence and adaptation deferred. **v11 — Verification-aware reading paths:** event/session/heuristic layers reduce into a reading path summary (examined blocks/sentences, firstSeenAt/lastSeenAt, estimatedDwellMs, focusCount, progressedTo/FromCount); reading path is derived and observational; no UI or behavior changes; verification and disagreement layers deferred. **v12 — Disagreement-ready examination markers:** verification-aware reading paths now emit examination markers (block_examined, sentence_examined, sentence_revisited, sentence_backtracked); markers are derived, local, and observational; no UI or behavior changes; semantic verification layers deferred. **v13 — Claim-ready anchor slots:** disagreement-ready markers now attach into claim-ready anchor slots (blockSlots, sentenceSlots) with markerIds; anchor slots are derived, local, and observational; claimIds/sourceIds/disagreementIds remain empty; no UI or behavior changes; semantic attachment layers deferred. **v14 — Source-ready attachment envelopes:** claim-ready anchor slots now contain an attachment envelope (attachments.markerIds, claimIds, sourceIds, disagreementIds, verificationIds); top-level slot arrays kept for compatibility; markerIds and attachments.markerIds stay in sync; envelopes are derived, local, observational scaffolding; no UI or behavior changes; semantic attachment layers deferred. **v15 — Verification-ready attachment registries:** source-ready envelopes now resolve into attachment registries (claimRegistry, sourceRegistry, disagreementRegistry, verificationRegistry); marker-backed verification placeholder records (ra-verification-placeholder|markerId) prove slot→envelope→registry flow; claim/source/disagreement registries empty; no UI or behavior changes; real semantic attachment deferred. **v16 — Claim placeholder records:** sentence-level examination markers (sentence_examined, sentence_revisited, sentence_backtracked) now emit claim placeholder records into the attachment registry (ra-claim-placeholder|markerId); claim placeholders are derived, local, and observational; block markers do not yet emit claim placeholders; slot claimIds and attachments.claimIds stay in sync; no UI or behavior changes; semantic claim extraction and source/verification linkage deferred. **v17 — Source placeholder records:** sentence-level examination markers now emit source placeholder records into the attachment registry (ra-source-placeholder|markerId); source placeholders are derived, local, and observational; block markers do not yet emit source placeholders; slot sourceIds and attachments.sourceIds stay in sync; no UI or behavior changes; semantic source reconstruction deferred. **v18 — Disagreement placeholder records:** sentence revisit/backtrack markers (sentence_revisited, sentence_backtracked) now emit disagreement placeholder records into the attachment registry (ra-disagreement-placeholder|markerId); disagreement placeholders are derived, local, and observational; sentence_examined and block_examined do not emit disagreement placeholders; slot disagreementIds and attachments.disagreementIds stay in sync; no UI or behavior changes; semantic disagreement logic deferred. **v19 — Placeholder cross-link slots:** sentence-local placeholder co-occurrence (claim + source + verification required; disagreement optional) now emits placeholder cross-links into reading path summary; cross-links are derived, local, and observational; one cross-link per sentence using first-available ids; no UI or behavior changes; semantic pairing logic deferred. **v20 — Verification bundle skeleton:** sentence-local placeholder cross-links now materialize into verification bundle skeletons in reading path summary; bundles are derived, local, observational, and deterministic; bundle creation requires an existing cross-link; one bundle per cross-link; no semantic assertion; no UI or behavior changes. **v21 — Verification bundle indexes:** verification bundle skeletons now emit deterministic retrieval indexes (bySentenceId, byAnchorId, byClaimId, bySourceId, byVerificationId, byDisagreementId); indexes are derived, local, observational, and idempotent; do not imply support, contradiction, or evaluation; no UI or behavior changes. **v22 — Curiosity signal skeleton:** verification bundles now emit sentence-local curiosity signal skeletons (explore_point, source_available, verification_opportunity, disagreement_present); signals are derived, local, observational, deterministic, and additive; do not perform interpretation or generate language; no UI or behavior changes. **v23 — Prompt tone slots:** curiosity signals now emit prompt tone slots (slot kinds, tone family, intensity); slots are derived, local, observational, deterministic, and additive; do not generate language or perform interpretation; no UI or behavior changes. **v24 — Prompt copy keys:** prompt tone slots now emit prompt copy selection keys (primary/secondary copy key, tone family, intensity); selections are derived, local, observational, deterministic, and upgrade-safe; do not generate language or perform interpretation; no UI or behavior changes. **v25 — Prompt copy library records:** prompt copy selections now emit prompt copy library records (library family, tone profile, variant keys); records are derived, local, observational, deterministic, and upgrade-safe; do not generate language or perform interpretation; no UI or behavior changes. **v26 — Prompt copy catalog bindings:** prompt copy library records now emit prompt copy catalog bindings; bindings are derived, local, observational, deterministic, and upgrade-safe; bindings reference curated catalog entries but do not render UI; no UI or behavior changes. **v27 — Prompt presentation records:** prompt copy catalog bindings now emit prompt presentation records; records are derived, local, observational, deterministic, and upgrade-safe; records are display-ready but do not render UI; no UI or behavior changes. **v28 — Prompt surface candidates:** prompt presentation records now emit prompt surface candidates; candidates are derived, local, observational, deterministic, and upgrade-safe; candidates are mount-ready but do not render UI; no UI or behavior changes. **v29 — Prompt mount plans:** prompt surface candidates now emit prompt mount plans; plans are derived, local, observational, deterministic, and upgrade-safe; plans are mount-ready orchestration data but do not render UI; no UI or behavior changes. **v30 — Mobile integration (active prompt selector):** mount plans now support app-facing active prompt selectors; selectors are read-only, deterministic, and UI-adjacent but not UI-rendering; the first mobile integration surface is one active prompt per focused sentence.

### 5.2 Stubbed / fixture-backed systems

These work as scaffolds but are not yet real intelligence systems:

- OCR/page capture text extraction
- audio recognition logic
- live camera “recognition” (capture-to-existing flow, not continuous recognition)
- media transcript ingestion
- media claim extraction
- location-aware disambiguation (accepted but unused)
- media verification support status (fixture-backed)
- organization intelligence depth beyond fixtures
- **ecological species recognition** (groundwork is done; real classifier not yet integrated)

### 5.3 Planned systems

Not yet implemented:

- landmark / geology identification groundwork
- real audio fingerprinting
- transcript segment anchoring
- claim graph
- automatic source discovery
- organization/product/claim graph expansion
- richer market comparisons
- location-enhanced ecological / landmark disambiguation

---

## 6. Canonical Data Model

### 6.1 Article layer

Current canonical article interpretation object.

Typical structure includes:

- identification
- summary
- context/content
- claims
- sources
- evidence/trace
- questions
- optional study guide
- optional market
- optional media context

**Status:** Implemented

---

### 6.2 Claim layer

Claims are central knowledge objects.

Canonical properties:

- id
- text
- confidence
- support
- optionally claimType / derived epistemic metadata

**Confidence:** `high` | `medium` | `low`  
**Support:** `direct` | `inference` | `interpretation` | `speculation`

**Status:** Implemented

---

### 5.3 Source layer

Sources connect claims to evidence and organizations.

Canonical source relationships:

- claim → source
- source → organizationId

**Status:** Implemented

---

### 6.4 Verification layer

Article verification returns bundles with:

- claims
- sources
- evidence spans
- claim-to-source mapping
- claim-to-evidence mapping
- support status

**Status:** Implemented

---

### 6.5 Organization layer

Organizations are lightweight institutional profiles.

Current profile includes: id, name, kind, summary, description?, notableProducts?, notableFigures?, relatedTopics?, ownershipNote?, notes?, linkedItems?, relatedSources?, relatedClaims?

**Status:** Implemented groundwork (not yet a full corporate intelligence graph).

---

### 6.6 Media layer

**MediaReference:** kind, originalUrl, normalizedId?, title?, articleId?, organizationId?  
**MediaInterpretation:** ref, summaryBlocks?, transcriptBlocks?, claims?, supportStatusByClaimId?

**Status:** Implemented groundwork (all fixture-backed).

---

### 6.7 Audio layer

**AudioRecognitionResult:** kind, title, subtitle?, articleId?, mediaUrl?, organizationId?, confidence?

**Status:** Groundwork only (microphone capture exists; recognition is stubbed/fixture-backed).

---

### 6.8 Study layer

Study guide blocks: overview, explain_simple, key_points, why_it_matters, common_confusion, study_questions.

**Status:** Implemented groundwork (fixture-backed).

---

### 6.9 Market layer

Article-attached recommendation/action surface. Categories: local recommendations, healthier alternatives, safer products/vehicles, general market suggestions.

**Status:** Implemented groundwork (fixture-backed, not live commerce).

---

### 6.10 Ecological entity layer (groundwork)

**EcologicalEntity:** id, name, kind (plant | tree | insect | fungus | bird | animal | ecosystem_feature | unknown), summary?, seasonalNotes?, safetyNotes?, articleId?

Optional on **ExploreImageResponse**. Rendered as compact “Nature” block on ImageFocusScreen when present.

**Status:** Implemented groundwork (fixture-backed; trigger via uploadId `"eco"` / `"eco-demo"`).

---

## 7. Current Interpretation Pipeline

### 7.1 Generic pattern

```
input
→ normalize
→ classify
→ resolve
→ route to surface
```

### 7.2 Image / Lens pipeline

```
capture/upload image
→ uploadImage
→ exploreImage
→ segments (and optional ecologicalEntity)
→ user selects segment
→ exploreTap
→ article / candidate article(s)
```

**Status:** Implemented

### 6.3 Share intake pipeline

```
shared text/url
→ normalizeSharedInput
→ media-or-text detection
→ search / media resolve
→ article / media interpretation / fallback
```

**Status:** Implemented

### 7.4 Media URL pipeline

```
media url
→ classify_media_url
→ normalize_media_id
→ resolve_media
→ article or media interpretation
```

**Status:** Implemented groundwork

### 7.5 Audio pipeline

```
record short audio
→ recognizeAudioClip
→ fixture-backed recognition result
→ article / media / organization / no match
```

**Status:** Groundwork only

### 7.6 Page capture / OCR pipeline

```
capture page
→ extractTextFromImage
→ Share Intake text path
→ article/search
```

**Status:** Groundwork only

### 6.7 Subtitle / caption pipeline

```
paste captions or "Search from transcript"
→ normalizeSubtitleToSearchText / normalizeSharedInput
→ Share Intake (inputSource: subtitle)
→ search / media resolve
→ article / media interpretation
```

**Status:** Groundwork (paste and media transcript only; no live device caption stream).

### 7.8 Live lens pipeline

```
live lens entry
→ capture frame
→ existing image focus flow (optional location context)
```

**Status:** Groundwork only (no continuous recognition).

---

## 8. Current Mobile Surface Map

| Surface | Purpose | Status |
|--------|---------|--------|
| Home / Explore | Image upload, live lens, page scan, search, share intake, audio identify | Implemented |
| ImageFocusScreen | Segment selection, confirm lookup, candidate disambiguation, **ecological Nature block** | Implemented |
| ArticleScreen | Article body, claims, media block, study, market, org navigation, verify | Implemented |
| VerifySheet | Evidence / claim / source | Implemented |
| MediaInterpretationSheet | Media-specific summary/transcript/claims | Implemented groundwork |
| OrganizationProfileSheet | Organization context | Implemented groundwork |
| AudioIdentifyScreen | Audio recognition entry | Implemented groundwork |
| ShareIntakeScreen | Universal input normalization | Implemented |
| HistoryScreen | Reopen previous explorations | Implemented |

---

## 9. Dependency Graph

### 9.1 Foundational dependencies

**Shared contracts**  
Everything depends on `packages/contracts`. If contracts drift, mobile/extension/backend drift.

**Article / claim / source / verification**  
Hard dependency core. Used by: VerifySheet, media claims, media verification, organization source/claim cross-links, study mode, clips, analytics, future claim graph.

**Organization profile**  
Depends on: source organizationId, media organizationId, organization fixtures.

**Share intake**  
Depends on: search, media resolve, article routing, media interpretation routing. New inputs should feed through Share Intake when possible.

### 9.2 Groundwork-only systems

| System | Depends on | Blocked until |
|--------|------------|----------------|
| Audio recognition | Microphone capture, audio recognize route, fixture mapping, article/media/org routing | Real recognition service or fingerprinting |
| OCR / page capture | Camera capture, text extraction helper, Share Intake text path | Real OCR integration |
| Subtitle / caption | Share Intake, normalizeSharedInput, media transcript blocks | Live device caption stream (optional) |
| Live lens | Camera capture, image upload, image focus flow | Continuous capture/inference |
| Media interpretation | Media resolve, media fixtures, interpretation endpoint, media claims/verification | Transcript acquisition / parsing |
| Ecological recognition | explore/image, segments, fixtures, ImageFocusScreen | Real species classifier (groundwork done) |

### 9.3 Dependency matrix (simplified)

```
                    contracts
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    ▼                    ▼                    ▼
 article/claim      organization         media layer
    │                    │                    │
    └────────────────────┼────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    VerifySheet    OrgProfileSheet   MediaInterp
         │               │               │
         └───────────────┼───────────────┘
                         │
                    Share Intake
                         │
    ┌────────────────────┼────────────────────┐
    ▼                    ▼                    ▼
 Image/Lens           Audio               Page/OCR + Subtitle
 (incl. ecological)   (stubbed)           (OCR real; subtitle groundwork)
```

---

## 10. Current Bottlenecks

- **Recognition is mostly stubbed:** Audio, OCR, live recognition, ecological species, landmark.
- **Fixtures are the source of truth:** Scale is limited; content expansion is manual.
- **Organization intelligence is still shallow:** Limited breadth, not live, not graph-like.
- **Media understanding is early:** Summary, transcript, claims, verify state are fixture-backed.

---

## 11. Recommended Near-Term Roadmap Order

Based on architecture and dependency order:

1. **Landmark / geology identification groundwork** — Benefits from location context; complements ecological; strong “real-world interpretation” use case.
2. **TV / show recognition groundwork** — Builds on audio + media + organization; likely strong user value.
3. **Live subtitle / text extraction groundwork** — Done. Paste captions + Search from transcript; same pipeline as OCR.
4. **Upgrade one stubbed system** — Audio recognition with real integration (OCR already upgraded).

---

## 11. What Not To Do Yet

To keep the architecture healthy, avoid:

- full knowledge graph explorer UI
- live company intelligence APIs
- full product/med catalog
- dashboard-heavy analytics
- background location or background audio
- giant new navigation surfaces
- splitting the app into separate “modes” for every input type

---

## 13. Canonical Documentation Strategy

| Document type | Purpose |
|---------------|---------|
| **Architecture spec** (this file) | Define what exists, dependencies, real vs stubbed vs planned. |
| **Core model** ([rabbit-hole-core-model.md](rabbit-hole-core-model.md)) | Canonical product architecture: nodes, branches, rabbit-hole experience; use to realign if development drifts. |
| **Product vision** | What Rabbit Hole is trying to become (partners, strategy). |
| **Active roadmap** | Next milestone only, dependencies, concrete next step. |

---

## 14. How to Use This Spec (e.g. with Cursor)

**Do not execute this spec.** Treat it as a **canonical reference**.

Use it to understand:

- system components and attachment points
- dependency order
- model relationships
- architectural constraints

Before recommending or implementing changes, read this file. Do not modify the architecture unless explicitly instructed.

---

## 15. One-Line Reality Check

Rabbit Hole is currently:

> **A structurally strong, multi-input interpretation platform with real epistemic modeling and many fixture-backed intelligence surfaces (including ecological identification groundwork).**

It is **not yet**:

- a real-time recognition platform
- a full company intelligence system
- a fully automated fact-checking engine

The architecture is positioned to grow into those areas without needing a redesign.
