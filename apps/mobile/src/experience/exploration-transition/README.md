# Exploration Transition — Hook Point

**Do not implement the full experience layer in the first slice.**  
This folder is the **mount point** for the future Exploration Transition (rabbit-hole animation, sound, haptic).

See: **`docs/architecture/experience-layer.md`**

- **When implemented:** After the golden path works (capture → tap → article → verify → trace).
- **What will live here:** `RabbitHoleTransition.tsx`, Lottie assets, sound_effects.ts.
- **Current behavior:** `ExplorationTransitionSlot` renders children immediately (no animation).
