import type { ArticleSharePayload } from '@rabbit-hole/contracts';

/**
 * Share an article via the native OS share sheet.
 */
export async function shareArticle(payload: ArticleSharePayload): Promise<void> {
  const { Share } = await import('react-native');
  await Share.share({
    title: payload.title,
    message: `${payload.summary}\n\n${payload.url}`,
    url: payload.url,
  });
}

export function buildSharePayload(
  title: string,
  summary: string,
  url: string,
): ArticleSharePayload {
  return { title, summary, url };
}
