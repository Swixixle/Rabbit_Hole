# Market Surface v1

Minimal secondary panel attached to articles so users can act on what they learned: restaurants, shopping, healthier alternatives, vehicle safety, and high-level medication-related information with a clear safety warning.

## Purpose

- From an article, the user can open a compact **Market** panel to discover ways to act on the knowledge (e.g. reusable cup options, moving blanket alternatives, vehicle safety resources).
- Market is **secondary** to knowledge exploration: it does not replace or clutter the article body.

## Why Market is secondary

- The primary product is identification → summary → context/content → evidence/trace → questions.
- Market is an optional sidecar: one footer entry, one panel. No persistent tabs, no marketplace dashboard, no dominant header actions.
- Design constraint: keep the app neat; new functionality appears as a contained surface, not as permanent UI noise.

## Data model

- **MarketCategory:** `'shopping' | 'restaurants' | 'healthier_alternative' | 'vehicle_safety' | 'medical_info'`
- **MarketItem:** id, title, subtitle?, description?, category, actionLabel?, destinationType?, destinationValue?, warning?, tags?
- **ArticleMarket:** title?, intro?, items: MarketItem[]

Defined in `packages/contracts` (TypeScript) and `apps/api/app/models.py` (Pydantic). Fixture-backed in `apps/api/app/fixtures.py` (ARTICLE_MARKET, get_article_market).

## Entry point behavior

- On the article screen, a small footer entry labeled **Market** appears only when the article has market data.
- It is placed low in the reading surface (after Evidence & trace), not as a dominant header action.
- Tapping **Market** opens a compact sheet/panel.

## Panel behavior

- Sheet shows optional title and intro, then a list of market items.
- Items may show title, subtitle, description, and optional action label.
- **Resolution (Market Resolution Layer v1):** Tapping an item resolves using `destinationType` and `destinationValue`:
  - **external** — open `destinationValue` as URL via `Linking.openURL`. No in-app navigation.
  - **search** — close sheet, navigate to Home (Lens), run `api.search(destinationValue)`, show results. User can tap a result to open an article.
  - **internal** — close sheet, navigate to Article screen with `articleId = destinationValue`.
- No new UI: same panel and footer; only the behavior behind the tap changes.
- Layout is minimal and quiet; no giant marketplace UI. Copy is calm and non-salesy.

## Safety warning behavior (medical-related items)

- **medical_info** (or any item with `warning`) must display a clear disclaimer.
- Wording: *"Information only — not medical advice. Talk to a licensed clinician or pharmacist before making treatment decisions."*
- This warning appears at panel level when any medical_info item is present, and on the item when the item has a `warning` field.
- We do **not** present medication suggestions as diagnosis, prescribing, or personalized medical advice. No dosing, contraindication, or individualized treatment logic.

## Out of scope for v1

- No live restaurant/store/provider integrations.
- No web crawling, maps APIs, or e-commerce APIs.
- No AI recommendations engine.
- No personalized medical advice.
- Fixture-backed and deterministic only.

## Future path

- **Local / place recommendations:** plug in maps or local search for “nearby” options.
- **Healthier alternatives layer:** structured alternatives (e.g. reusable vs disposable) with optional provider links.
- **Safer products / safer vehicles:** integrate safety ratings or safer-product data sources.
- **External provider integration:** commerce, reservations, or product links when ready; keep Market as secondary panel.

## API

- **GET /v1/articles/:article_id/market** — Returns ArticleMarket or **404** when there is no market for the article (client hides Market entry on 404).

## Tests

- Article with market (e.g. article-coffee) returns 200 and valid ArticleMarket payload.
- Article without market returns 404.
- medical_info items include warning text in payload and in UI.
- Market payload shape (items[].id, .title, .category, etc.) is stable and validated.
- **Resolution:** Mobile unit tests verify `getMarketItemAction` returns correct action for external, search, and internal; API fixtures include search and internal items so the client can resolve without new UI.

## Local Recommendations Layer v1

Market items can represent **local/place-oriented recommendations** (e.g. restaurants, grocery stores, healthier food options, safer vehicle resources) using the same Market panel and resolution flow.

### Approach

- **Fixture-backed only:** No maps API, geolocation, or live provider data. Recommendations are deterministic and generic.
- **Reuse existing model:** Same `MarketItem` and `MarketCategory` (`restaurants`, `shopping`, `healthier_alternative`, `vehicle_safety`, `medical_info`). Place-oriented items use `destinationType: "search"` with a place-oriented `destinationValue` (e.g. "healthier coffee shop tea shop options", "reusable packing supply stores moving").
- **Resolution:** Tapping a local recommendation routes into the existing Lens/Home search flow; the app runs `api.search(destinationValue)` and shows results. No new UI or screens.
- **Copy:** Items read as "Ways to act on what you learned" — search-style suggestions, not verified listings. Descriptions make clear they are search suggestions (e.g. "Search for…").

### Content examples (v1 fixtures)

- **article-coffee:** Healthier coffee/tea shop options, reusable cup sellers, grocery alternatives for lower-sugar drinks, plus optional health-resource item (pharmacist / healthier food) with medical warning.
- **article-uhaul:** Reusable packing supply stores, moving-supply alternatives, safer vehicle/transport search, plus existing internal link to coffee article.

### Safety

- Health-oriented place/resource items (e.g. pharmacist consultation, healthier food) use `medical_info` and the standard medical warning. No diagnosis, prescribing, or dosing.

### Limitations (v1)

- No true "near me" or geolocation.
- No live restaurant/store/provider integrations.
- No maps or place-detail APIs.
- Results are from existing article/search index, not a places database.

### Future path

- True local integration: maps API, place search, or provider APIs can plug in later via the same Market surface and resolution pattern (e.g. a future `destinationType` or provider-backed items). Keep implementation modular.

## Healthier Alternatives Layer v1

Articles can offer structured **“better alternative”** actions so users can move from the object or category to healthier, lower-waste, safer-material, or less-processed options—without turning the app into a marketplace or a medical-advice product.

### Purpose

- Market items with category **healthier_alternative** (and related copy) present clear alternatives: reusable vs disposable, lower sugar, lower waste, safer materials, higher durability.
- Same Market panel and resolution: tap → search, internal article, or external link. No new UI.
- Fixture-backed and deterministic for v1.

### Examples (v1 fixtures)

- **article-coffee:** Reusable cup options, safer-material cup alternatives, lower-sugar drink alternatives, lower-waste coffee preparation, unsweetened / lower-sugar bottled options. Medical items (caffeine/health, pharmacist resources) keep the existing warning.
- **article-uhaul:** Moving blanket alternatives, reusable packing goods, related coffee article (internal), reusable packing crates, recycled-content packing paper, durable long-life moving blankets. Vehicle safety and local-store items remain.

### Safety limits

- No diagnosis, prescribing, dosing, or personalized health advice.
- Any item that touches medical/health decisions uses **medical_info** and the standard disclaimer. Alternatives are generic “better paths” (e.g. lower sugar, reusable), not treatment advice.

### How it differs from local recommendations

- **Local recommendations** answer “where can I find this?” (places, stores, shops) and use place-oriented search queries.
- **Healthier alternatives** answer “what’s a better option than this?” (reusable, lower-waste, safer material, less processed) and use category **healthier_alternative** plus resolution via search or internal article. Both live in the same Market list; no separate section or screen.

### Future path

- Richer alternatives: comparison copy, optional "vs current" framing, or structured alternative types (e.g. by material or waste profile) can be added later within the same model. Safer products / safer vehicles layer can extend this pattern.

## Safer Products / Safer Vehicles Layer v1

Articles can offer structured **lower-risk / safer-option** actions so users can move from an object or category to safer materials, safer product categories, lower-risk alternatives, or safer vehicle/resource searches—without turning the app into a shopping app, medical device, or compliance-heavy system.

### Purpose

- Market items with category **vehicle_safety** or with "safer" / "lower-risk" framing present clear safer-option paths: safer materials, safer transport and support equipment, lower-leaching or lower-risk product choices.
- Same Market panel and resolution: tap → search, internal article, or external link. No new UI.
- Fixture-backed and deterministic for v1. Guidance is category-level and generic, not individualized.

### Examples (v1 fixtures)

- **article-coffee:** Safer-material cup alternatives (refined with lower-risk/leaching copy), lower-heat or lower-leaching cup materials, stainless or ceramic mug (durability and material safety). All resolve via search.
- **article-uhaul:** Vehicle safety resources, safer vehicle and transport options, safer moving support and loading equipment, lower-risk packing and cushioning materials. vehicle_safety items resolve via search; lower-risk material items use healthier_alternative and search.

### Safety limits

- No medical diagnosis, prescribing, dosing, or personalized health advice.
- No legal or compliance claims that imply certification or warranty unless already fixture-supported. No personalized safety guarantees. Claims stay high-level and cautious.
- Any item that touches health/medical decisions keeps **medical_info** and the existing warning behavior.

### How it differs from healthier alternatives

- **Healthier alternatives** answer "what's a better option?" (reusable, lower-waste, less processed) and emphasize **healthier_alternative** and "better path" copy.
- **Safer products / safer vehicles** answer "what's a lower-risk or safer option?" and use **vehicle_safety** for transport/equipment and **healthier_alternative** (or shopping) with "safer" / "lower-risk" framing for materials and product categories. Both live in the same Market list; no separate section or screen.

### Future path

- Richer comparisons: side-by-side safer vs standard framing, optional crash-test or recall-conscious search stubs when a vehicle article exists.
- True vehicle data or safer-product integrations (ratings, recalls) can plug in later via the same Market surface and resolution pattern. Keep implementation modular.
