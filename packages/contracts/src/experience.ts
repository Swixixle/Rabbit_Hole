export type ExperienceStep =
  | 'identification'
  | 'summary'
  | 'content'
  | 'evidence'
  | 'questions';

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
