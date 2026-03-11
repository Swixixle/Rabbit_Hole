# Share Surface v1

Share Surface v1 adds native sharing to the mobile reader, allowing users to share an article's title, summary, and URL through the device's native share sheet.

## Overview

The share surface is intentionally minimal in v1. It surfaces the platform share sheet with a pre-composed payload derived from the article's metadata. No custom share UI is rendered by the app.

## Share Payload

```typescript
// packages/contracts/src/share.ts

export interface ArticleSharePayload {
  /** Article title used as the share subject/title */
  title: string;
  /** Short summary used as the share message body */
  summary: string;
  /** Canonical URL of the article */
  url: string;
}
```

## Mobile Implementation

The share action is triggered by the share button in the article reader toolbar. It calls the platform native share API.

### React Native (Expo)

```typescript
import { Share } from 'react-native';
import type { ArticleSharePayload } from '@rabbit-hole/contracts';

export async function shareArticle(payload: ArticleSharePayload): Promise<void> {
  await Share.share({
    title: payload.title,
    message: `${payload.summary}\n\n${payload.url}`,
    url: payload.url, // iOS only
  });
}
```

### Platform Behaviour

| Platform | Title field | Message field | URL field |
|----------|-------------|---------------|-----------|
| iOS | Share sheet subject | Body text | Separate URL attachment |
| Android | Optional subject | Body text (URL appended) | Ignored by `Share.share` |

## User Flow

1. User reads an article and taps the **Share** button.
2. The app composes the `ArticleSharePayload` from the article in view.
3. The native share sheet opens with the payload pre-filled.
4. User selects a target app (Messages, Mail, Twitter, etc.) and sends.

## Limitations (v1)

- No custom share card or preview image.
- No analytics tracking of share events.
- Share button is only available from the article detail view.
- Deep-link handling for shared URLs is not implemented in v1.

## Planned Improvements (v2+)

- Rich share card with article thumbnail.
- Share event tracking.
- Deep-link routing so shared URLs open the article in the app.
- Per-claim share (share a single claim with its epistemic annotation).

## Related Documents

- [Epistemic Model](epistemic-model.md)
- [Experience Layer v1](experience-layer-v1.md)
