# Rabbit Hole — Mobile v0 Component Inventory

Reusable UI components for the v0 slice. Prevents ad hoc component sprawl.

---

## Components

### ImageCanvas / TapOverlay

| Field | Detail |
|-------|--------|
| **Purpose** | Display image; overlay tappable hotspots or accept tap coordinates. |
| **Props (high level)** | imageUri, segments?: { id, bbox }, onTap?: (x, y) | (segmentId), highlightSelected?: segmentId. |
| **Dependencies** | Image component; touch/gesture handling. |
| **Owner** | Image Focus feature; can be shared. |
| **Screens** | Image Focus. |
| **v0 essential** | Yes. |

---

### CandidatePickerSheet

| Field | Detail |
|-------|--------|
| **Purpose** | Bottom sheet listing candidates (provisional name, confidence); "Explore this" for selection. |
| **Props** | candidates: Candidate[], onSelect: (candidate) => void, onDismiss. |
| **Dependencies** | Sheet/modal primitive. |
| **Owner** | Image Focus. |
| **Screens** | Image Focus. |
| **v0 essential** | Yes (when multiple candidates). |

---

### MicroParagraphCard

| Field | Detail |
|-------|--------|
| **Purpose** | One micro-block: 1–3 sentences, single idea; optional claim chips. |
| **Props** | text, claimIds?, claimTypeBadges?, onClaimPress?: (claimId). expandable?: boolean. |
| **Dependencies** | ClaimTypeBadge. |
| **Owner** | Article feature; shared reading. |
| **Screens** | Article Reader. |
| **v0 essential** | Yes. |

---

### FocusZoneReader

| Field | Detail |
|-------|--------|
| **Purpose** | Optional focus-zone reading: emphasize current block. |
| **Props** | children (blocks), activeIndex?, onActiveChange?. |
| **Dependencies** | Scroll view, MicroParagraphCard. |
| **Owner** | Shared (reading). |
| **Screens** | Article Reader. |
| **v0 essential** | Optional (can defer to simple scroll). |

---

### ClaimTypeBadge

| Field | Detail |
|-------|--------|
| **Purpose** | Show claim type (verified fact, interpretation, speculation, etc.). |
| **Props** | claimType: ClaimType, size?: 'small' | 'medium', onPress?. |
| **Dependencies** | None. |
| **Owner** | Shared. |
| **Screens** | Article Reader, Claim modal. |
| **v0 essential** | Yes. |

---

### SourceTypeBadge

| Field | Detail |
|-------|--------|
| **Purpose** | Icon or label for source type (gov, academic, social, etc.). |
| **Props** | sourceType: string. |
| **Dependencies** | None. |
| **Owner** | Verify / shared. |
| **Screens** | Sources sheet, SourceCard. |
| **v0 essential** | Yes. |

---

### SourceCard

| Field | Detail |
|-------|--------|
| **Purpose** | One source in list: icon, title, publisher, hash badge; tappable. |
| **Props** | source: Source, onPress. |
| **Dependencies** | SourceTypeBadge. |
| **Owner** | Verify. |
| **Screens** | Sources & Verify sheet. |
| **v0 essential** | Yes. |

---

### EvidenceDrawer (SnapshotInfo)

| Field | Detail |
|-------|--------|
| **Purpose** | Snapshot info: timestamps, hash, type, short excerpt. |
| **Props** | source: Source (full), onDismiss. |
| **Dependencies** | None. |
| **Owner** | Verify. |
| **Screens** | Sources sheet (on source tap). |
| **v0 essential** | Yes. |

---

### QuestionCard

| Field | Detail |
|-------|--------|
| **Purpose** | One suggested question; tappable to search or open node. |
| **Props** | question: Question, onPress. |
| **Dependencies** | None. |
| **Owner** | Shared. |
| **Screens** | Article Reader. |
| **v0 essential** | Yes. |

---

### TracePreviewRow

| Field | Detail |
|-------|--------|
| **Purpose** | One trace row: path of nodes (names) + chevron + one-line label. |
| **Props** | path: NodeRef[], label: string, onNodePress?: (nodeId). |
| **Dependencies** | None. |
| **Owner** | Trace feature. |
| **Screens** | Trace Preview. |
| **v0 essential** | Yes. |

---

### NodeChip

| Field | Detail |
|-------|--------|
| **Purpose** | Compact node label (e.g. related nodes, trace path). |
| **Props** | node: { id, name }, onPress. |
| **Dependencies** | None. |
| **Owner** | Shared. |
| **Screens** | Article Reader, Trace. |
| **v0 essential** | Yes. |

---

### LoadingStateBlock

| Field | Detail |
|-------|--------|
| **Purpose** | Generic loading (spinner or skeleton). |
| **Props** | message?: string. |
| **Dependencies** | None. |
| **Owner** | Shared UI. |
| **Screens** | All. |
| **v0 essential** | Yes. |

---

### ErrorStateBlock

| Field | Detail |
|-------|--------|
| **Purpose** | Error message + retry. |
| **Props** | message, onRetry?. |
| **Dependencies** | None. |
| **Owner** | Shared UI. |
| **Screens** | All. |
| **v0 essential** | Yes. |

---

### EmptyStateBlock

| Field | Detail |
|-------|--------|
| **Purpose** | Empty state (e.g. no objects detected, no sources). |
| **Props** | message, actionLabel?, onAction?. |
| **Dependencies** | None. |
| **Owner** | Shared UI. |
| **Screens** | All. |
| **v0 essential** | Yes. |

---

## Summary

- **v0 essential**: ImageCanvas/TapOverlay, CandidatePickerSheet, MicroParagraphCard, ClaimTypeBadge, SourceTypeBadge, SourceCard, EvidenceDrawer/SnapshotInfo, QuestionCard, TracePreviewRow, NodeChip, LoadingStateBlock, ErrorStateBlock, EmptyStateBlock.
- **Optional for v0**: FocusZoneReader (can use plain scroll first).
- **Feature-owned vs shared**: Badges and state blocks shared; sheet/canvas owned by Image Focus; reading and Verify components shared across Article and Verify.
