"""
Media Lens Groundwork v1: URL classification and normalization.
No transcript fetch, no external APIs. Fixture-backed resolution in app.fixtures.
"""
import re
from typing import Optional

# YouTube: youtu.be/VIDEO_ID or youtube.com/watch?v=VIDEO_ID or youtube.com/v/VIDEO_ID
_YOUTUBE_SHORT = re.compile(r"^https?://(?:www\.)?youtu\.be/([a-zA-Z0-9_-]{10,12})(?:\?|$)", re.IGNORECASE)
_YOUTUBE_WATCH = re.compile(r"^https?://(?:www\.)?youtube\.com/watch\?.*?v=([a-zA-Z0-9_-]{10,12})(?:&|$)", re.IGNORECASE)
_YOUTUBE_EMBED = re.compile(r"^https?://(?:www\.)?youtube\.com/embed/([a-zA-Z0-9_-]{10,12})(?:\?|$)", re.IGNORECASE)
_YOUTUBE_V = re.compile(r"^https?://(?:www\.)?youtube\.com/v/([a-zA-Z0-9_-]{10,12})(?:\?|$)", re.IGNORECASE)

# Podcast: common host patterns (episode or show page)
_PODCAST_PATTERNS = [
    re.compile(r"^https?://(?:www\.)?podcasts\.apple\.com/", re.IGNORECASE),
    re.compile(r"^https?://open\.spotify\.com/episode/", re.IGNORECASE),
    re.compile(r"^https?://(?:www\.)?podlink\.com/", re.IGNORECASE),
    re.compile(r"^https?://(?:www\.)?podbean\.com/", re.IGNORECASE),
    re.compile(r"^https?://(?:www\.)?listennotes\.com/", re.IGNORECASE),
    re.compile(r"^https?://(?:www\.)?anchor\.fm/", re.IGNORECASE),
]
# Normalize: use path or full URL as stable id for fixture lookup
_PODCAST_ID_EXTRACT = re.compile(r"^https?://[^/]+(/[^?#]*)", re.IGNORECASE)

# TikTok: tiktok.com/@user/video/ID or vm.tiktok.com/xxx
_TIKTOK_VIDEO = re.compile(r"^https?://(?:www\.)?tiktok\.com/@[^/]+/video/(\d+)(?:\?|$)", re.IGNORECASE)
_TIKTOK_VM = re.compile(r"^https?://vm\.tiktok\.com/[a-zA-Z0-9]+", re.IGNORECASE)

# Reels / Instagram (reel or p post id; optional trailing slash)
_REEL = re.compile(r"^https?://(?:www\.)?instagram\.com/(?:reel|p)/([a-zA-Z0-9_-]+)(?:/?\?|/?$)", re.IGNORECASE)


def _trim_url(url: str) -> str:
    return (url or "").strip()


def classify_media_url(url: str) -> Optional[tuple[str, Optional[str]]]:
    """
    Classify a URL as a known media type and optionally extract a normalized ID.
    Returns (kind, normalized_id) or None if not recognized as media.
    normalized_id may be None for some podcast URLs (use path as id in registry).
    """
    u = _trim_url(url)
    if not u or not (u.startswith("http://") or u.startswith("https://")):
        return None

    # YouTube
    for pattern, group in [(_YOUTUBE_SHORT, 1), (_YOUTUBE_WATCH, 1), (_YOUTUBE_EMBED, 1), (_YOUTUBE_V, 1)]:
        m = pattern.search(u)
        if m:
            return ("youtube", m.group(group))

    # TikTok
    m = _TIKTOK_VIDEO.search(u)
    if m:
        return ("tiktok", m.group(1))
    if _TIKTOK_VM.search(u):
        return ("tiktok", None)  # short link, no id extractable

    # Reel / Instagram
    m = _REEL.search(u)
    if m:
        return ("reel", m.group(1))

    # Podcast
    for p in _PODCAST_PATTERNS:
        if p.search(u):
            path_match = _PODCAST_ID_EXTRACT.match(u)
            norm_id = path_match.group(1) if path_match else u
            return ("podcast", norm_id)

    return None


def normalize_media_id(kind: str, url: str, extracted_id: Optional[str]) -> Optional[str]:
    """Return a stable id for registry lookup. For podcast with no extracted id, use path."""
    if extracted_id:
        return extracted_id
    if kind == "podcast":
        m = _PODCAST_ID_EXTRACT.match(_trim_url(url))
        return m.group(1) if m else _trim_url(url)
    return None
