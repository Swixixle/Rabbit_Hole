# Share Surface v1

Distribution layer for the article reader: share article title, summary, and canonical URL via the platform-native share sheet.

## Purpose

- Let users share an article with a consistent, calm payload (title, one-sentence summary, link).
- Use the **platform-native share** mechanism only; no account linking, auto-posting, or per-platform integrations.
- Keep sharing **additive and modular**; do not change article contract or epistemic UI.

## Payload model

**ArticleSharePayload** (in `@rabbit-hole/contracts`):

- **title** — Article title.
- **summary** — One-sentence summary from the first `blockType === 'summary'` block, or fallback to `"{title}."` or `"Article."`.
- **url** — Canonical/deep link for the article (deterministic from `article.id`).
- **teaser** (optional) — e.g. `"Follow the system"` when `article.experience` exists.
- **imageUrl** (optional) — Reserved for future preview cards.

Payload is built by **buildArticleSharePayload(article, baseUrl?)** in the mobile app; shared text is **formatShareMessage(payload)** → `{title}\n\n{summary}\n\n[{teaser}\n\n]{url}`.

## Header UX

- **Share** button in the article header (below identification line), styled like existing secondary actions.
- Tapping Share builds the payload and calls **Share.share({ message, title })** so the OS shows the native share sheet.

## Deep link strategy

- URL is **deterministic** from `article.id`: `{baseUrl}/article/{articleId}`.
- Base URL: `EXPO_PUBLIC_APP_URL` if set, else a default (e.g. `https://app.example.com`). No backend change required for v1; deep-link handling (opening the app to the article) can be added later when packaging/deployment is in place.

## In scope (v1)

- Share action in article header.
- Normalized payload and shared text format.
- Native share only; no analytics, no custom social integrations.
- Tests: payload with summary, fallback when no summary, teaser when experience exists, deterministic URL.

## Out of scope (v1)

- Account linking, auto-posting, analytics.
- Custom integrations per platform (Twitter, LinkedIn, etc.).
- Backend changes for share URLs (frontend-only URL construction is sufficient).
- Market layer.

## Future optional step

- **Preview metadata / image share cards:** set `imageUrl` on the payload and pass it to the share sheet where the platform supports it (e.g. Open Graph–style previews for link pastes). Would require a stable image URL per article (e.g. from CMS or generated thumbnail).
