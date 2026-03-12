import { EpistemicAnnotation } from './epistemic';

export interface Organization {
  id: string;
  name: string;
  /** e.g. "Reuters", "BBC" */
  displayName: string;
  /** Reliability signal (0-1) */
  reliabilityScore?: number;
  /** Bias summary signal */
  biasSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Source {
  id: string;
  /** The organization this source belongs to */
  organizationId: string;
  /** e.g. "Reuters Technology", "BBC News" */
  name: string;
  /** URL or identifier of the source */
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: string;
  articleId: string;
  /** The atomic verifiable statement */
  text: string;
  /** Epistemic annotation: confidence + support */
  epistemic: EpistemicAnnotation;
  /** Optional source reference for this specific claim */
  sourceId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ArticleAssemblyStage =
  | 'identification'
  | 'summary'
  | 'content'
  | 'evidence'
  | 'questions';

export interface ArticleSection {
  title: string;
  body: string;
}

export interface Article {
  id: string;
  /** Source this article came from */
  sourceId: string;
  /** Title of the article */
  title: string;
  /** Author name(s) */
  author?: string;
  /** Publication date */
  publishedAt?: string;
  /** Short human-readable synopsis */
  summary: string;
  /** Structured content sections */
  sections: ArticleSection[];
  /** Citations and references */
  evidence: string[];
  /** Follow-up questions generated from the article */
  questions: string[];
  /** Claims extracted from the article */
  claimIds: string[];
  /** Current assembly stage */
  assemblyStage: ArticleAssemblyStage;
  createdAt: string;
  updatedAt: string;
}

export type MediaReferenceType = 'image' | 'video' | 'audio';

export interface MediaReference {
  id: string;
  articleId?: string;
  type: MediaReferenceType;
  /** URI or URL pointing to the media */
  uri: string;
  /** MIME type */
  mimeType?: string;
  createdAt: string;
}

export type InterpretationType =
  | 'ecological'
  | 'landmark'
  | 'tv_show'
  | 'ocr'
  | 'audio_recognition';

export interface MediaInterpretation {
  id: string;
  mediaReferenceId: string;
  type: InterpretationType;
  /** Result data from the interpretation */
  result: Record<string, unknown>;
  /** Confidence score 0-1 */
  confidence: number;
  createdAt: string;
}
