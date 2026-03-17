# Rabbit Hole — Experience Layer (Exploration Transition)

The **Exploration Transition** is the moment between capture and discovery: a 2–3 second narrative bridge that makes the product feel like “you opened the rabbit hole,” not “you ran a search.”

This doc defines it as a **first-class UX concept**. Implementation happens **after** the first golden path works (capture → tap → article → verify → trace).

---

## 1. Purpose

- **Conceptual transition**: Reality → Investigation → Knowledge.
- **Product psychology**: “You didn’t search. You explored.”
- **Brand metaphor**: Capture → fall into the hole → emerge with knowledge.
- **Delight loop**: Tiny sensory cues that make the action feel meaningful.

The animation and sound **mask processing time** and signal that something intentional is happening. They must **never block the architecture pipeline**; they only bridge UI.

---

## 2. When It Plays

**Play the Exploration Transition when:**

- User captures image (camera or upload).
- User taps “Explore this” (or equivalent) and the system starts resolving the selection.

**Do not play it for:**

- Opening article sections.
- Following trace links.
- Browsing related nodes or sources.
- Navigating back.

It is the **entry ritual** into an exploration, not a recurring effect.

---

## 3. State Machine

```
CAPTURED
    ↓
ANIMATION_START
    ↓
INGESTION_RUNNING   (API / pipeline; animation masks this)
    ↓
ANIMATION_COMPLETE
    ↓
ARTICLE_RENDER
```

If processing fails before article is ready:

```
ANIMATION_COMPLETE (or FAILED)
    ↓
Rabbit jumps back out of hole
    ↓
Message: “Couldn’t identify that yet”
    ↓
Suggest manual search or retry
```

Failure keeps the metaphor intact; no generic error-only screen.

---

## 4. Capture Feedback (Sound + Haptic)

**When:** Photo is taken or image is selected.

**Sound:**

- Soft camera click (not harsh shutter).
- Slight echo tail or “depth” sound.

**Haptic:**

- Light tap vibration.

**Purpose:** Signal “we captured reality.”

**Stack (React Native):** `expo-av` (sound), `expo-haptics` (vibration).

---

## 5. The Rabbit Hole Animation (Core Moment)

**Duration:** 1.5–2.5 seconds.

**Sequence:**

1. Photo freezes.
2. Screen slightly darkens.
3. Small circular hole opens in center.
4. Rabbit silhouette briefly drops into hole.
5. Camera image warps inward (tunnel).
6. Transition into result screen (article or candidate picker).

**Narrative:** You pointed at reality → the system dives into the rabbit hole → knowledge emerges.

**Tone:** Symbolic, minimal, elegant. Not cartoonish.

**Flow (concept):**

```
PHOTO TAKEN
    ↓
screen freezes
    ↓
circle ripple forms
    ↓
rabbit silhouette hops
    ↓
falls into circle
    ↓
circle expands like tunnel
    ↓
result screen fades in
```

---

## 6. Sound During the Dive

**Layered sequence:**

1. Camera click (capture).
2. Soft wind-tunnel / airy whoosh (dive).
3. Quiet “landing” tone when article appears.

**Principles:** Subtle, mysterious, slightly magical. Not noisy or gimmicky.

---

## 7. Where It Lives in Architecture

**Location:**

```
apps/mobile/src/experience/
    exploration-transition/
        RabbitHoleTransition.tsx
        rabbit_drop_animation.json   (Lottie)
        tunnel_animation.json        (Lottie)
        sound_effects.ts
```

**Rule:** This layer is **separate from exploration logic**. Animation must never block the architecture pipeline; it only bridges UI. No business logic inside the experience layer.

---

## 8. Animation Technology (React Native)

**Recommended:**

- `react-native-reanimated`
- `lottie-react-native`

**Why:** Lightweight, performant, good for symbolic animation.

**Assets (examples):**

- `rabbit_drop.json` — rabbit silhouette hop + drop.
- `tunnel_transition.json` — circle opens, image warps inward, tunnel expansion.

---

## 9. Failure Handling

**If processing fails:**

- Rabbit jumps back out of hole (reverse or failure variant).
- Message: “Couldn’t identify that yet.”
- Suggest manual search or retry.

No hard error screen without the metaphor. Failure stays in-world.

---

## 10. What to Avoid

- Long cinematic animations (keep to 2–3 s).
- 5-second transitions.
- Cartoon rabbits everywhere.
- Flashy particle effects.
- Noisy or repetitive sounds.

**Target feel:** Subtle, mysterious, elegant, slightly magical — not gimmicky.

---

## 11. Optional Easter Egg

**Rare variant:** Occasionally change the falling object (e.g. 1 in 20 or random seed).

**Examples:** Rabbit (default), magnifying glass, question mark, book, lantern.

Rabbit remains the default and primary asset.

---

## 12. Implementation Timing

**Order:**

1. Photo capture works.
2. Tap-to-explore works.
3. Article loads.
4. Verify + trace preview works.

**Then:**

5. **Exploration Transition** (capture feedback + rabbit hole animation + sound).

This prevents animation work from blocking core functionality. The experience layer is designed now so it can be implemented without becoming bolted-on or sloppy.

---

## 13. Summary

| Element | Description |
|--------|-------------|
| **Name** | Exploration Transition |
| **Trigger** | Capture image or tap “Explore this” |
| **Duration** | 2–3 s |
| **Components** | Capture feedback (sound + haptic), rabbit hole animation, tunnel effect, result emergence |
| **Failure** | Rabbit jumps back; “Couldn’t identify that yet”; suggest retry/search |
| **Place in code** | `apps/mobile/src/experience/exploration-transition/` |
| **Build after** | First golden path works end-to-end |

This is the **micro-theater** that makes Rabbit Hole feel like opening the rabbit hole, not running a search.
