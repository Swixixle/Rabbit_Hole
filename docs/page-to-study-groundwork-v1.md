# Page-to-Study Groundwork v1

## Purpose

Lay the foundation for Rabbit Hole to turn a page, excerpt, or article into a **study-oriented learning surface**, without building the full education product yet. This pass adds a minimal article-attached study layer so users can move from “What is this?” to “How do I understand this well enough to learn it?”

## Why this is groundwork (not full education mode)

- **No new tab, no new major UI.** Study is a compact entry on the article and a sheet/mode, not a separate app surface.
- **Fixture-backed and deterministic.** v1 uses authored study guides for sample articles (e.g. article-coffee, article-uhaul); no OCR, no quiz engine, no flashcards.
- **Article-grounded and epistemically honest.** Content stays tied to the current article and its evidence/claims; we do not imply certainty where the article is interpretive.
- **Extensible later.** The same model and entry point can later be driven by derived content, OCR, or other pipelines.

## Study guide model

- **`StudyBlock`**: `id`, `kind`, `title`, `content`, optional `bulletItems[]`.
- **`ArticleStudyGuide`**: optional `title`, optional `intro`, `blocks: StudyBlock[]`.

**Block kinds:** `overview` | `explain_simple` | `key_points` | `why_it_matters` | `common_confusion` | `study_questions`.

## Article integration

- **API:** `GET /v1/articles/:article_id/study` returns an `ArticleStudyGuide` or **404** when no guide exists. Clients should treat 404 as “no Study entry.”
- **Mobile:** When an article loads, the app requests the study guide; if present, a “Study” section appears with a single entry that opens a Study sheet. Articles without a guide are unchanged.
- **Fixtures:** `ARTICLE_STUDY_GUIDES` in the API fixtures keyed by `article_id`; `get_article_study(article_id)` returns the guide or `None`.

## Example block types

| Kind              | Purpose                                      |
|------------------|----------------------------------------------|
| `overview`       | What this is about (high-level)              |
| `explain_simple` | Explain simply (plain-language summary)      |
| `key_points`     | Key points to remember (often bulletItems)   |
| `why_it_matters` | Why it matters (relevance / impact)           |
| `common_confusion` | Common confusion (misconceptions / nuance) |
| `study_questions`| Likely questions (reuse/adapt article questions where possible) |

## In scope (v1)

- Lightweight study model attached to an article.
- One narrow study surface: compact “Study” entry on the article → sheet with blocks.
- Fixture-authored guides for article-coffee and article-uhaul.
- Reuse of article data (title, summary, questions) in authored content where practical.
- Epistemic honesty: no fake certainty; interpretive content stays interpretive.

## Out of scope (v1)

- New tab or major new UI surface.
- OCR / page-scanning pipeline.
- Flashcards, quizzes, or quiz generation.
- Textbook ingestion or complex authoring system.
- Source or textbook/page identification.

## Future path

- **OCR / page ingestion:** Turn scanned or photographed pages into structured content that can drive or augment a study guide.
- **Source identification:** Link study content to specific sources or pages where supported.
- **Quiz generation:** Generate simple checks (e.g. multiple choice) from key points and study questions.
- **Flashcards:** Spaced repetition or flashcard decks derived from key points and questions.
- **Misconception targeting:** Use “common confusion” and evidence to target common errors.
- **Textbook / lecture / transcript study modes:** Extend the same study surface to other content types (e.g. video transcripts, lecture notes) with appropriate block types and derivation.

## GitHub / repo

- No new heavy dependencies.
- CI and tests remain compatible; study endpoint and payload shape are covered by tests.
- README: optional small mention of “Study” on the article; no large education-section expansion.
- Further education features (quizzes, flashcards, OCR) can be tracked as separate issues rather than overbuilding in this pass.
