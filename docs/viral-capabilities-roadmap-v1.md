# Viral capabilities roadmap v1

These are **adoption features** — the ones that create instant demo value, shareability, repeat use, and “show this to someone” energy. They are not “best engineering features”; they are **best adoption features**.

Each section includes Cursor-ready implementation prompts. The architecture reference is **docs/system-architecture-v1.md**.

---

## 1. Point-at-the-World Lens

**The moment:** Point your phone at something real, and Rabbit Hole explains it.

Most fundamental viral behavior: visual, immediate, easy to demo.

**Best examples:** product, plant, logo, medicine bottle, landmark, sign, TV screen, food package.

**Why it spreads:** People can film themselves using it in seconds.

### Cursor instructions

```
We want to strengthen Rabbit Hole's "Point-at-the-World" magic moment.

Goal:
Improve the current live lens / image lens experience so it feels faster, cleaner, and more demo-worthy without adding UI clutter.

Focus:
- reduce friction from Home → Live Lens → capture → Image Focus → article
- make the capture-to-result path feel intentional and magical
- improve visible result confidence and clarity for first-time users

Implementation priorities:
1. Review current Lens / Live Lens / Image Focus flow.
2. Identify the smallest improvements that reduce steps or increase clarity.
3. Improve transitions and state messaging, especially:
   - when capture begins
   - when recognition is in progress
   - when results appear
4. Add a compact "recognized as…" or "best match" treatment if it fits naturally.
5. Keep the product visually calm and minimal.

Do not add a new tab or major new surface.
Do not redesign the app.
Do not implement speculative ML.
Just make the current "point at something" flow feel more immediate and demo-friendly.

After implementation, summarize:
- what changed
- where friction was reduced
- what still blocks a truly magical lens experience
```

---

## 2. Fact-Check This Video

**The moment:** Paste or share a TikTok / Reel / YouTube clip, and Rabbit Hole shows what it's claiming.

Probably the **highest social-media virality feature**.

**Why it spreads:** People love “this video is lying,” “what is this clip really saying?,” “show me the receipts.”

**Existing architecture:** media URL, transcript/summary, claims, verify-from-media. Make it feel obvious and sharp.

### Cursor instructions

```
We want Rabbit Hole to feel like "fact-check this video" in the clearest possible way.

Goal:
Strengthen the media interpretation flow so pasted/shared media URLs quickly surface:
- key claims
- support status
- verify-from-media entry

Focus:
- improve the "this media says…" presentation
- make media claims feel visible and important
- make verify-from-media more obvious but still tidy

Implementation priorities:
1. Review current media interpretation surface and media claim rendering.
2. Improve the visual and information hierarchy of:
   - summary
   - transcript excerpt
   - claims from this media
   - verify-from-media
3. Keep the layout minimal and article-like.
4. Add the smallest clean copy improvements to make the flow feel like:
   "Here's what this media is claiming."
5. Reuse existing claim/support/confidence/verify components where possible.

Do not add a new major screen.
Do not add automatic external fact-checking.
Do not add clutter.
Just make media → claim → verify feel like a first-class Rabbit Hole experience.

After implementation, summarize:
- files changed
- media UX improvements made
- how the flow now better supports "fact-check this video"
- what still remains fixture-backed
```

---

## 3. Explain This Page

**The moment:** Point Rabbit Hole at a page in a textbook or document and get a useful study interpretation.

**Student adoption engine.** Students share tools with each other extremely fast if the payoff is real.

**Existing pieces:** page capture groundwork, study mode, explain simply, key points, common confusion, study questions.

### Cursor instructions

```
We want Rabbit Hole's "Explain this page" moment to feel much stronger.

Goal:
Strengthen the page capture → extracted text → study/article flow so it feels like a real learning tool, even while OCR is still groundwork.

Focus:
- make "Scan page" feel like a first-class learning flow
- connect extracted text more clearly to Study mode
- improve the transition from scanned page to understanding

Implementation priorities:
1. Review current Scan Page / OCR groundwork flow.
2. Improve the user journey from:
   capture page → reading page → text/search → article/study
3. Make Study mode easier to notice when page-derived content is involved.
4. Add calm explanatory copy where needed:
   - "Explain simply"
   - "Key points"
   - "Study questions"
5. Keep the implementation grounded in the current architecture.

Do not add a full OCR engine.
Do not add quizzes/flashcards as a major new system.
Do not add a new tab.
Just make the current page-to-study groundwork feel more real and educational.

After implementation, summarize:
- what changed
- how the page-to-study experience improved
- what remains stubbed
```

---

## 4. Who's Behind This?

**The moment:** Point Rabbit Hole at a company, source, network, or drug and it shows the organization behind it.

**Transparency engine** — one of the most distinctive things Rabbit Hole can become.

**Why it spreads:** “Who owns this?,” “who made this drug?,” “what company is behind this article?,” “what controversies are attached to this organization?”

**Existing pieces:** organization profiles, organization-linked items, org↔claim/source cross-links. Make it more legible and powerful.

### Cursor instructions

```
We want Rabbit Hole's "Who's behind this?" experience to feel stronger.

Goal:
Strengthen organization/company context so users can more clearly understand the institution behind a source, media item, product, or claim.

Focus:
- make organization profile entry points easier to notice where appropriate
- improve compact organization profile usefulness
- strengthen organization ↔ source ↔ claim readability

Implementation priorities:
1. Review current organization profile surfaces and organization links in Verify, media interpretation, and articles.
2. Improve the hierarchy and clarity of:
   - organization entry points
   - related products/offerings
   - related sources
   - related claims
3. Keep the UI compact and secondary.
4. Preserve careful, neutral wording.
5. Reuse existing sheet patterns and avoid introducing a new major screen.

Do not add live company APIs.
Do not scrape controversies.
Do not add a huge org database.
Just make the existing organization groundwork feel more coherent, useful, and discoverable.

After implementation, summarize:
- what changed
- where organization context is now clearer
- what still remains fixture-backed
```

---

## 5. Shareable Truth Cards

**The moment:** Turn Rabbit Hole's interpretation into something people can screenshot, post, and argue with.

**Distribution weapon.** You already have clip scaffolding and clip export. The next viral step is turning key knowledge objects into compact, highly legible “truth cards.”

**Why it spreads:** People share one claim, one verdict, one source-backed card, one visual proof — not always full articles.

### Cursor instructions

```
We want Rabbit Hole to generate highly shareable "truth cards" from its existing interpretation system.

Goal:
Create a compact, screenshot-friendly card format that turns a claim or interpreted fact pattern into a visually clear share artifact.

Focus:
- one claim
- confidence/support
- optional source or organization context
- clean visual hierarchy

Implementation priorities:
1. Review current clip/share export systems.
2. Implement the smallest clean "truth card" rendering path using existing article/claim/source data.
3. Prefer image export over video.
4. Keep cards visually simple and readable.
5. Make the output feel like a Rabbit Hole artifact, not generic social content.

Suggested formats:
- claim card
- claim + support card
- source-backed card
- media claim card

Do not build a social publishing suite.
Do not add a complex card editor.
Do not add a new major UI surface.
Just create a reusable export path for one strong knowledge card format.

After implementation, summarize:
- card types added
- export/share path used
- where this fits relative to clips
- what future expansion would be natural
```

---

## Ranking for fastest virality

| Order | Capability | Why |
|-------|------------|-----|
| 1 | **Fact-Check This Video** | Fastest social spread |
| 2 | **Point-at-the-World Lens** | Best “show your friend” demo |
| 3 | **Explain This Page** | Best education adoption |
| 4 | **Shareable Truth Cards** | Best argument / screenshot distribution |
| 5 | **Who's Behind This?** | Best long-term distinctiveness and trust |

---

## Recommended first build (from current product state)

Given where the product is now, prioritize:

- **Shareable Truth Cards** or **Fact-Check This Video polish**

They are the fastest path from strong architecture to visible virality.

---

## Relationship to architecture

These capabilities **attach to existing surfaces** and **reuse the interpretation pipeline**. They do not require new platform redesign. See **docs/system-architecture-v1.md** for dependency order and where each feature should attach.
