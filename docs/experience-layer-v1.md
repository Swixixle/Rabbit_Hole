# Experience Layer v1

The Experience Layer defines how the mobile reader presents and tracks a user's interaction with an article. It introduces two core concepts: `ArticleExperience` and `ExperienceSteps`.

## Overview

When a user opens an article, an `ArticleExperience` record is created. As the user progresses through the article, the experience is updated with `ExperienceSteps` that record which stage of the reading pipeline the user has reached.

## ArticleExperience

`ArticleExperience` represents a single user's session with a single article.

```typescript
// packages/contracts/src/experience.ts

export interface ArticleExperience {
  /** Unique identifier for this experience record */
  id: string;
  /** The article this experience is tied to */
  articleId: string;
  /** The user who owns this experience */
  userId: string;
  /** Current step in the reading pipeline */
  currentStep: ExperienceStep;
  /** Whether the user is actively following this article for updates */
  following: boolean;
  /** Timestamp when the experience was created */
  createdAt: string;
  /** Timestamp of the last update */
  updatedAt: string;
}
```

## ExperienceStep

`ExperienceStep` maps directly to the article assembly pipeline stages.

```typescript
export type ExperienceStep =
  | 'identification'
  | 'summary'
  | 'content'
  | 'evidence'
  | 'questions';
```

### Step Descriptions

| Step | Description |
|------|-------------|
| `identification` | User has seen the article title, source, and metadata. |
| `summary` | User has read the short synopsis. |
| `content` | User has engaged with the full article body. |
| `evidence` | User has reviewed citations and supporting evidence. |
| `questions` | User has viewed or interacted with follow-up questions. |

## Read / Follow Toggle

The reader exposes a two-state toggle:

| State | Meaning |
|-------|---------|
| **Read** | The user has finished their reading session. The experience is marked complete. |
| **Follow** | The user subscribes to updates for this article. Future edits or related content surface to the user. |

These states are not mutually exclusive — a user can mark an article as read and still follow it.

## State Transitions

```
opened
  └─► identification
        └─► summary
              └─► content
                    └─► evidence
                          └─► questions (complete)
```

The experience step can only advance forward. Re-opening an article does not reset the step.

## API Endpoints (Planned)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/experiences` | Create a new experience for an article |
| `GET` | `/experiences/:id` | Get an experience by ID |
| `PATCH` | `/experiences/:id/step` | Advance the current step |
| `PATCH` | `/experiences/:id/follow` | Toggle the follow state |

## Related Documents

- [Epistemic Model](epistemic-model.md)
- [Share Surface v1](share-surface-v1.md)
