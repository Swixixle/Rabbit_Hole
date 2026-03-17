# Landmark Recognition Groundwork v1

**Status:** Implemented  
**Input type:** `visual_capture` (camera, upload, video_frame)

---

## 1. Purpose

This step establishes the **visual interpretation branch** of the Rabbit Hole pipeline. It does **not** implement ML models or real landmark detection. It builds the **infrastructure layer** so that captured images can enter the interpretation engine and produce structured interpretation candidates that feed the same epistemic spine as text:

```
Claim → Confidence → Support → Source → Organization
```

Visual interpretation must attach to the **same epistemic system** used by text interpretation. Images resolve into:

```
Landmark → Claims → Sources → Organizations
```

No separate knowledge model is introduced.

---

## 2. Connection to universal interpretation engine

The interpretation pipeline remains:

```
Input → Capture → Recognition → Interpretation → Claim Extraction → Source Linking → Organization Context → Knowledge Surface
```

Visual branch:

```
Image
→ VisualCapture
→ RecognitionCandidate (skeleton)
→ LandmarkInterpretation
→ LandmarkClaimPlaceholder
→ Knowledge Surface (future)
```

All interpretation eventually resolves to the same claim/confidence/support/source/organization model.

---

## 3. How visual inputs feed the epistemic spine

- **VisualCapture** — Raw visual input (id, source, uri, optional dimensions/metadata). No interpretation fields.
- **VisualRecognitionCandidate** — Raw recognition output (id, captureId, label, confidence). Candidates, not claims.
- **LandmarkInterpretation** — Connects recognition to the pipeline (id, captureId, candidateId, entityName, confidence). Entry point for interpretation.
- **LandmarkClaimPlaceholder** — Placeholder claim derived from interpretation (id, interpretationId, text, confidence). Example text: `"{entityName} is a landmark."` No external sources yet.

Deterministic IDs:

- Interpretation: `landmark-interpretation|{captureId}|{candidateId}`
- Claim placeholder: `landmark-claim-placeholder|{interpretationId}`

Reducer: `deriveLandmarkInterpretations(capture, candidates)` produces one interpretation per candidate.  
Placeholder step: `deriveLandmarkClaimPlaceholders(interpretations)` produces one placeholder per interpretation with fixed text format.

---

## 4. Files

- **Types:** `apps/mobile/src/types/visualCapture.ts` — VisualCapture, VisualRecognitionCandidate, LandmarkInterpretation, LandmarkClaimPlaceholder.
- **Utils:** `apps/mobile/src/utils/visualInterpretation.ts` — createLandmarkInterpretationId, deriveLandmarkInterpretations, createLandmarkClaimPlaceholderId, deriveLandmarkClaimPlaceholders.
- **Tests:** `apps/mobile/src/__tests__/visualInterpretation.test.ts`.

---

## 5. Constraints (not implemented)

- No machine learning models
- No real landmark detection
- No external APIs
- No image embeddings
- No knowledge graph expansion

This step is **visual ingestion architecture** only.

---

## 6. Future expansion

After this groundwork, the system can support:

- **Landmark recognition models** — Plug in real recognition; output remains VisualRecognitionCandidate.
- **Geolocation hints** — Enrich VisualCapture or LandmarkInterpretation with location for disambiguation.
- **Tourism and historical sources** — Source linking from LandmarkInterpretation to organizations and articles.
- **Organization connections** — Map landmarks to organizations (e.g. site operators, tourism boards).

Same pipeline; same epistemic spine. Additional input branches (product recognition, object interpretation, historical site exploration) can reuse this envelope pattern.
