export interface ArticleSharePayload {
  /** Article title used as the share subject/title */
  title: string;
  /** Short summary used as the share message body */
  summary: string;
  /** Canonical URL of the article */
  url: string;
}
