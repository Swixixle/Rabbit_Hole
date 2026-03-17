# Rabbit Hole — v0 Contract Profile

Minimum contract surface required for mobile v0. Identifies what is required now vs deferred; avoids overbuilding schemas while keeping architecture honest.

---

## Required in v0

| Contract | Why v0 needs it | Minimal required fields | Optional / deferred | Stub allowed? | Align with long-term? |
|----------|-----------------|-------------------------|---------------------|---------------|------------------------|
| **Node** | Every explored entity is a node; Article is about a node; Trace and questions reference nodes. | id, name, nodeType (enum), slug or displayLabel | description, imageUrl, metadata, edges | Minimal: name + type only for list items | Yes: nodeType must match canonical node types. |
| **Claim** | Article blocks reference claims; Verify shows claim type; no blur between fact and interpretation. | id, text, claimType (enum), confidence?, sourceCount | evidenceSpanIds, linkedNodeIds, createdAt | Can stub confidence as "high/medium/low" | Yes: claimType must be the canonical enum (verified_fact, interpretation, etc.). |
| **Source** | Verify surface; source integrity. | id, type (e.g. gov, academic, social), title, publisher? | url, retrievedAt, contentHash, excerpt, snapshotId | Can stub type + title only for v0 list | Yes: hash/timestamp when sensitive; type enum. |
| **EvidenceSpan** | Links claim to source region; optional in v0 but keeps model honest. | id, claimId, sourceId, spanRef or excerpt | offset, length | Stub: claimId + sourceId only | Yes: structure for future evidence UI. |
| **Article** | Core Read output. | id, nodeId, title, nodeType, blocks[] (micro-paragraphs with claimIds), relatedNodeIds?, questionIds? | tracePreviewId?, generatedAt | blocks must have text + claimIds | Yes: blocks = micro-blocks; one idea per block. |
| **Question** | Every page opens deeper questions. | id, text, category? (historical, scientific, …) | linkedNodeIds | Stub: text only | Yes: categories align with Rabbit Hole engine. |
| **Trace (preview)** | Minimal trace for product identity. | path[] (ordered node ids or minimal node refs), traceType? (material, legal, …), label (one-line) | full path details, evidence | path + label only | Yes: path is list of nodes; traceType enum later. |
| **Image segment / candidate** | Tap-on-image → candidate(s) for exploration. | segmentId or regionRef, label (provisional name), confidence?, nodeId? | bbox, alternativeLabels | Stub: label + confidence + nodeId when resolved | Yes: maps to Node after resolution. |
| **Job status** | If article/segment is async. | jobId, status (pending, running, completed, failed), resultId? (articleId/nodeId) | progress, errorCode | Stub: status + resultId when done | Yes: same pattern for future async flows. |

---

## Contract Details

### Node (v0 minimal)

- **id**: string (uuid or slug).
- **name**: string.
- **nodeType**: enum (object, product, place, organization, person, event, …) — subset of canonical types.
- **slug** or **displayLabel**: optional for URLs/labels.

Deferred: full metadata, imageUrl, edges list, narrative frames.

### Claim (v0 minimal)

- **id**: string.
- **text**: string.
- **claimType**: enum (verified_fact, synthesized_claim, interpretation, opinion, anecdote, speculation, conspiracy_claim, advertisement, satire_or_joke, disputed_claim).
- **confidence**: optional number or enum (high/medium/low).
- **sourceCount**: number (for "N sources" in UI).

Deferred: evidenceSpanIds, linkedNodeIds, createdAt in UI.

### Source (v0 minimal)

- **id**: string.
- **type**: enum (e.g. gov, academic, news, social, other).
- **title**: string.
- **publisher**: optional string.
- **contentHash**: optional string (show hash badge when present).
- **retrievedAt**: optional ISO timestamp (show when present).

Deferred: url, excerpt in list; full snapshot content.

### EvidenceSpan (v0 minimal)

- **id**: string.
- **claimId**: string.
- **sourceId**: string.
- **excerpt** or **spanRef**: optional string.

Can be stubbed (claimId + sourceId) if evidence drawer is not in v0.

### Article (v0 minimal)

- **id**: string.
- **nodeId**: string.
- **title**: string.
- **nodeType**: string (for chip).
- **blocks**: array of { text, claimIds[]?, blockType? } (micro-paragraphs).
- **relatedNodeIds**: optional string[].
- **questionIds**: optional string[].

Deferred: tracePreviewId in payload; narrative frames.

### Question (v0 minimal)

- **id**: string.
- **text**: string.
- **category**: optional string (historical, scientific, legal, …).

Deferred: linkedNodeIds in UI.

### Trace preview (v0 minimal)

- **path**: array of { nodeId, name } or node ids.
- **traceType**: optional string (material, legal, …).
- **label**: string (one-line explanation).

Deferred: full trace engine response, evidence per step.

### Image segment / candidate (v0 minimal)

- **segmentId** or **regionRef**: string or bbox.
- **label**: string (provisional, e.g. "Bench", "Logo").
- **confidence**: number or enum.
- **nodeId**: optional, present after resolution.

Deferred: bbox in UI if not needed for highlight; alternativeLabels.

### Job status (v0 minimal)

- **jobId**: string.
- **status**: enum (pending, running, completed, failed).
- **resultId**: optional (articleId or nodeId when completed).

Deferred: progress percentage, errorCode detail.

---

## What can be stubbed initially

- **EvidenceSpan**: List by claimId/sourceId only; no excerpt in UI.
- **Question**: Text only; category can be "general" or omitted.
- **Trace**: Single path + label; no traceType filter.
- **Source**: title + type + optional hash; no excerpt in list.
- **Job**: status + resultId; no progress bar.

---

## What must align with long-term architecture

- **Claim type enum**: Must be the single canonical set; no new types per feature.
- **Node type**: Subset of canonical node types; no one-off "image_region" as permanent type (segment is input, resolves to Node).
- **Source**: Hash and timestamp when sensitive; type taxonomy consistent.
- **Article blocks**: Micro-paragraph structure; one idea per block; claimIds link to typed claims.
- **Trace**: Path is ordered list of nodes; traceType aligns with future trace engine categories.
