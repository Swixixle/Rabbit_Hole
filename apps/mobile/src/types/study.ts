/**
 * Page-to-Study Groundwork v1: article-attached study guide types.
 * Aligned with API ArticleStudyGuide / StudyBlock.
 */

export type StudyBlockKind =
  | "overview"
  | "explain_simple"
  | "key_points"
  | "why_it_matters"
  | "common_confusion"
  | "study_questions";

export interface StudyBlock {
  id: string;
  kind: StudyBlockKind;
  title: string;
  content: string;
  bulletItems?: string[];
}

export interface ArticleStudyGuide {
  title?: string;
  intro?: string;
  blocks: StudyBlock[];
}
