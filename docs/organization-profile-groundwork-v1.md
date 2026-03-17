# Organization / Company Profile Groundwork v1

## Purpose

Allow Rabbit Hole to attach a **lightweight organization/company profile** to relevant sources, media, or articles so users can understand who stands behind a claim, product, publication, or institution—without building a full corporate intelligence platform.

## Why this is groundwork (not full company intelligence)

- **No live company lookup, no financial APIs, no controversy scraping.** v1 is fixture-backed and deterministic. Profiles are authored in code; no external enrichment.
- **Minimal surface.** One new type (OrganizationProfile), two attachment points (Source, MediaReference), one GET endpoint, one sheet. No new tab or major screen.
- **Extensible.** The same model and resolution path can later drive richer profiles, ownership graphs, or product/company linking.

## Model

```ts
type OrganizationKind =
  | 'company' | 'publisher' | 'network' | 'regulator'
  | 'insurer' | 'pharma' | 'nonprofit' | 'unknown';

interface OrganizationProfile {
  id: string;
  name: string;
  kind: OrganizationKind;
  summary: string;
  description?: string;
  notableProducts?: string[];
  notableFigures?: string[];
  relatedTopics?: string[];
  ownershipNote?: string;
  notes?: string[];  // Carefully phrased, fixture-backed only.
}
```

- **kind:** Type of institution (company, publisher, network, regulator, etc.).
- **summary / description:** Short who/what.
- **notableProducts, notableFigures, relatedTopics:** Optional structured context.
- **ownershipNote:** Ownership/publisher relationship when relevant.
- **notes:** Only when fixture-backed; neutral, non-defamatory language (see Safety below).

**Organization-to-Product/Med Linking v1:** Optional **linkedItems** on OrganizationProfile:

```ts
type OrganizationLinkedItemKind = 'product' | 'medication' | 'brand' | 'service' | 'media_property' | 'unknown';

interface OrganizationLinkedItem {
  id: string;
  name: string;
  kind: OrganizationLinkedItemKind;
  summary?: string;
  articleId?: string;  // When set, client can navigate to article.
  notes?: string[];
}
```

- **linkedItems:** Optional array of products, medications, brands, services, or media properties. When an item has **articleId**, the UI offers “Tap to open article” and navigates to that article. Items without articleId are shown as structured context only.

**Organization-to-Claim/Source Cross-Linking v1:** Optional **relatedSources** and **relatedClaims** on OrganizationProfile:

- **relatedSources:** `Array<{ id: string; title: string }>` — compact list of sources associated with this org (fixture-backed; derived from ORG_RELATED_SOURCE_IDS).
- **relatedClaims:** `Array<{ id: string; text: string; confidence?: string }>` — compact list of claims (e.g. cited by org sources; fixture-backed from ORG_RELATED_CLAIM_IDS). Shown with neutral “not necessarily endorsed” hint.

Attachment approach: **Source.organizationId** remains the main link from source → org. The inverse (org → sources, org → claims) is maintained in fixture maps **ORG_RELATED_SOURCE_IDS** and **ORG_RELATED_CLAIM_IDS**; GET /v1/organizations/:id enriches the profile with these lists so the client does not need extra requests.

## Where profiles attach

| Attachment point | Field | Resolution |
|-----------------|--------|------------|
| **Source** | `organizationId?: string` | Verification bundle returns sources with organizationId; client fetches GET /v1/organizations/:id when user taps Organization. |
| **MediaReference** | `organizationId?: string` | Media resolve (and thus interpretation ref) includes organizationId when MEDIA_REGISTRY entry has it; same GET for profile. |

Article-level attachment was left for a later pass; one or two clean attachment points are enough for v1.

## UI integration

- **Verify sheet (Sources):** When a source has `organizationId`, SourceCard shows an "Organization" link; tap opens OrganizationProfileSheet with profile fetched by id.
- **Media interpretation sheet:** When `interpretation.ref.organizationId` is set, show "Organization" link; tap opens same profile sheet.
- **Article "From this media":** When media interpretation ref has `organizationId`, show "Organization" button; tap opens same profile sheet.

No new tab; profile is a compact sheet (name, kind, summary, description, optional lists, ownershipNote, notes, **linked items**).

**Organization-to-Product/Med Linking v1:** When a profile has **linkedItems**, the sheet shows a “Related products & offerings” section. Each item shows kind, name, optional summary. If the item has **articleId** and the client provides **onOpenArticle**, tapping opens that article (sheet dismisses first). Items without articleId are display-only context.

**Organization-to-Claim/Source Cross-Linking v1:** When a profile has **relatedSources** and/or **relatedClaims**, the sheet shows:
- **Related sources** — compact list (id + title). Label: “Related sources”. No tap-to-open in v1; display-only.
- **Related claims** — compact list (id + text + optional confidence). Label: “Related claims” with hint: “Claims associated with sources from this organization; not necessarily endorsed by them.”

Source cards in the Verify sheet already show **Organization** when the source has `organizationId`; tap opens the same profile sheet. So “who is behind this source?” is answered there. The new sections answer “what sources and claims are associated with this organization?” when viewing the org profile.

## Fixture-backed examples

- **org-recycling-today** — publisher (Recycling Today); **linkedItems:** media_property (Recycling Today magazine). **Cross-linking v1:** relatedSources: src-1; relatedClaims: claim-1, claim-3, claim-6.
- **org-epa** — regulator (U.S. EPA); no linked items. **Cross-linking v1:** relatedSources: src-2; relatedClaims: claim-2.
- **org-uhaul** — company (U-Haul); **linkedItems:** product (U-Haul moving box, articleId → article-uhaul), service (Moving trucks & trailers). **Cross-linking v1:** relatedSources: src-3; relatedClaims: claim-4.
- **org-journal-industrial-ecology** — publisher (academic journal); no linked items. **Cross-linking v1:** relatedSources: src-4; relatedClaims: (none in fixture).
- **org-podcast-demo** — network; **linkedItems:** media_property (Disposable coffee cup episode, articleId → article-coffee). No related sources/claims in fixture.
- **org-pharma-demo** — pharma (fixture); **linkedItems:** medication (context-only stub; no articleId, no medical advice). No related sources/claims in fixture.

## Safety / neutrality rules

- No speculative controversy claims; no defamatory or accusatory language.
- If **notes** touch controversy, keep them generic and carefully phrased (e.g. “Has faced public controversy over X”) only when fixture-backed and intentionally authored.
- No financial/market claims unless fixture-backed in this pass.
- No implying that profile data is live or current; fixture-backed only.
- **Linked items (product/med/brand):** Descriptive context only; not prescriptive. Medication-style items are organizational context only, not recommendations or medical advice. No dosing, no current pricing unless explicitly fixture-authored and neutral.
- **Organization-to-Claim/Source Cross-Linking v1:** Do not imply that every claim tied to an organization is officially endorsed by that organization. Use neutral labels: “Related claims”, “Related sources”, “Associated sources”. No speculative controversy mapping; no legal/accusatory wording. Related claims are “associated with sources from this organization; not necessarily endorsed by them.”

## API

- **GET /v1/organizations/{org_id}**  
  - **200:** OrganizationProfile.  
  - **404:** Unknown id.

Sources in verification responses and MediaReference in media resolve/interpretation may include **organizationId**; client uses it to call GET /v1/organizations/:id when the user opens the profile.

## Tests

- Organization profile payload shape and valid kind.
- Profile resolution: GET by id returns 200; unknown id returns 404.
- Media resolve includes organizationId for podcast 123.
- Verification bundle sources include organizationId when fixture has it; resolution to profile works.

**Organization-to-Product/Med Linking v1:**

- Profile payload includes **linkedItems** when fixture has them; valid **kind** values (product, medication, brand, service, media_property, unknown).
- Linked item with **articleId** resolves to existing article (GET /v1/articles/:id).
- Profiles without linked items remain valid (linkedItems absent or empty).
- Pharma-style fixture (org-pharma-demo) has medication linked item for context-only demo.

**Organization-to-Claim/Source Cross-Linking v1:**

- Profile includes **relatedSources** and/or **relatedClaims** when fixture maps have them.
- **relatedSources** entries have id and title; each id resolves to GET /v1/sources/:id.
- **relatedClaims** entries have id, text, optional confidence; each id resolves to GET /v1/claims/:id.
- Profiles without related data (e.g. org-pharma-demo not in ORG_RELATED_SOURCE_IDS) have absent or empty relatedSources/relatedClaims.

## Future path

- Richer organization profiles (more fields, logos, links).
- Ownership graphs and parent/subsidiary.
- **Richer product/med graphs:** company → product → claim linking; med/product pricing history (fixture or later); recall/safety signals.
- Network/platform recognition (e.g. “published on X”).
- **Organization/source/claim graph:** fuller relationship graph; org-backed claim bundles; organization timelines; claim provenance by institution.

Fuller organization/company intelligence (live data, financial APIs, controversy signals) should be a separate GitHub issue. Fuller product/med catalogs and pricing engines are out of scope for this groundwork.

---

## Roadmap note: Audio Recognition Groundwork

Rabbit Hole will need **Audio Recognition Groundwork** in a future pass.

**Target use cases:**

- Identify songs / audio playing nearby.
- Identify TV audio / show theme / dialogue context.
- Identify podcast / speaker / media clip when possible.

**Product framing:** Audio input → entity/media recognition → existing Rabbit Hole article / media / organization system.

Not implemented in v1; preserved here as a future roadmap note.

## Summary

| Item | Status |
|------|--------|
| OrganizationProfile type | contracts + API |
| Source.organizationId, MediaReference.organizationId | Added |
| ORGANIZATION_PROFILES fixtures | 5 profiles |
| GET /v1/organizations/:id | Implemented |
| OrganizationProfileSheet | Implemented |
| Entry points (Verify, Media sheet, Article From this media) | Implemented |
| Tests | Payload shape, 404, media resolve, verification sources |
| **Organization-to-Product/Med Linking v1** | **linkedItems** on profile; sheet shows “Related products & offerings”; tap item with articleId → open article; fixture examples: U-Haul (product+service), Recycling Today (media_property), podcast demo (media_property→article), pharma stub (medication context-only). |
| **Organization-to-Claim/Source Cross-Linking v1** | **relatedSources** and **relatedClaims** on profile (fixture-backed); ORG_RELATED_SOURCE_IDS and ORG_RELATED_CLAIM_IDS; GET org enriches with get_related_sources_for_org / get_related_claims_for_org; sheet shows “Related sources” and “Related claims” with neutral hint; epistemic caution in doc; fixture examples: Recycling Today (src-1, claims 1/3/6), EPA (src-2, claim-2), U-Haul (src-3, claim-4), Journal (src-4). |
