# Rabbit Hole — Recognition Envelope System v1

**Status:** Implemented (Core Groundwork v2)  
**Canonical references:** [rabbit-hole-core-model.md](rabbit-hole-core-model.md), [system-architecture-v1.md](system-architecture-v1.md)

---

## 1. Purpose

The Recognition Envelope System is the **first universal ingestion structure** for Rabbit Hole. It gives all input types a single normalized entry shape so future camera/image/audio/video/text pipelines do not become silos.

This step does **not** implement actual recognition models. It creates the shared envelope that every input modality will use.

---

## 2. Why Rabbit Hole needs one ingestion shape

The normalized path is:

```
Raw Input
→ RecognitionEnvelope
→ RecognitionCandidate
→ EntityIdentification (later)
→ KnowledgeNode (later)
→ BranchOptions (later)
```

If each modality (image, audio, text, video, media context) had its own capture and candidate format, the rest of the pipeline would fragment. One envelope + one candidate shape keeps the trunk universal.

---

## 3. Difference between envelope, candidate, and future node layer

| Layer | Meaning |
|-------|--------|
| **RecognitionEnvelope** | Modality-normalized capture record. Describes *what* was captured (modality, source, inputRef, optional mimeType/metadata). No interpretation. |
| **RecognitionCandidate** | Raw recognition output. A label + confidence + candidateType (entity, topic, product, landmark, media). Not yet a node, claim, or source. |
| **Entity / Node (future)** | Resolved knowledge node (EntityNode, TopicNode, MarketNode, etc.) with relatedNodeIds, sourceIds, and branch options. Conversion from candidate to node comes in a later step. |

Envelopes and candidates are **ingestion and raw recognition only**. Node conversion, claim extraction, source linking, and branch options come later.

---

## 4. Supported modalities

- **text**
- **image**
- **audio**
- **video**
- **media_context**

These are the canonical top-level input modalities. No others in v1.

---

## 5. Supported capture sources

- **camera**
- **upload**
- **microphone**
- **video_frame**
- **share_sheet**
- **manual_text**
- **url**

These describe *where* the input came from, not what it is.

---

## 6. No recognition models yet

This step does **not** implement:

- Landmark recognition
- OCR / page capture changes
- Microphone recognition logic
- Camera or upload UI

It only defines the envelope and candidate types and helpers. Real recognition feeds these shapes later.

---

## 7. No node conversion yet

Candidates are **not** yet converted into:

- EntityNode
- TopicNode
- MarketNode
- ClaimNode
- SourceNode

That conversion is a later step. This step is only the universal ingestion and raw recognition shape.

---

## 8. Future use

Once recognition models and resolvers exist, they will:

- **Camera ingestion** — Produce envelopes (modality: image, captureSource: camera) and candidates (e.g. landmark, product).
- **Upload ingestion** — Same envelope/candidate shape for uploaded images or files.
- **Audio recognition** — Envelopes (modality: audio, captureSource: microphone or url) and candidates (e.g. media, entity).
- **Landmark / product / media interpretation** — Output candidates with candidateType landmark, product, media, entity, or topic.
- **Conversion into EntityNode / TopicNode / MarketNode** — A later layer will map candidates to nodes and attach claims, sources, and branch options.

---

## 9. Files

- **Types:** `apps/mobile/src/types/recognition.ts` — RabbitHoleInputModality, RabbitHoleCaptureSource, RecognitionEnvelope, RecognitionCandidate, RecognitionCandidateSummary.
- **Utils:** `apps/mobile/src/utils/recognition.ts` — createRecognitionEnvelopeId, createRecognitionCandidateId, createRecognitionEnvelope, deriveRecognitionCandidates.
