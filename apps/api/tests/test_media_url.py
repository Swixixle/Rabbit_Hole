"""Media Lens Groundwork v1: tests for media URL classification."""
import pytest
from app.media_url import classify_media_url, normalize_media_id


def test_classify_youtube_watch():
    out = classify_media_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    assert out == ("youtube", "dQw4w9WgXcQ")


def test_classify_youtube_short():
    out = classify_media_url("https://youtu.be/jNQXAC9IVRw")
    assert out == ("youtube", "jNQXAC9IVRw")


def test_classify_youtube_embed():
    out = classify_media_url("https://www.youtube.com/embed/abc123XYZ01")
    assert out == ("youtube", "abc123XYZ01")


def test_classify_tiktok_video():
    out = classify_media_url("https://www.tiktok.com/@user/video/1234567890123456789")
    assert out == ("tiktok", "1234567890123456789")


def test_classify_tiktok_vm():
    out = classify_media_url("https://vm.tiktok.com/abc123")
    assert out == ("tiktok", None)


def test_classify_instagram_reel():
    out = classify_media_url("https://www.instagram.com/reel/ABC123xyz/")
    assert out == ("reel", "ABC123xyz")


def test_classify_podcast_apple():
    out = classify_media_url("https://podcasts.apple.com/us/podcast/some-show/id123")
    assert out[0] == "podcast"
    assert out[1] is not None


def test_classify_podcast_spotify_episode():
    out = classify_media_url("https://open.spotify.com/episode/abc123")
    assert out[0] == "podcast"


def test_classify_non_media_url_returns_none():
    assert classify_media_url("https://example.com/page") is None
    assert classify_media_url("https://news.ycombinator.com/item?id=123") is None


def test_classify_plain_text_returns_none():
    assert classify_media_url("coffee cup recycling") is None
    assert classify_media_url("") is None
    assert classify_media_url("   ") is None


def test_classify_trimmed_url():
    out = classify_media_url("  https://youtu.be/abc123XYZ01  ")
    assert out == ("youtube", "abc123XYZ01")


def test_normalize_media_id_youtube():
    assert normalize_media_id("youtube", "https://youtu.be/abc", "abc") == "abc"


def test_normalize_media_id_podcast_with_path():
    out = normalize_media_id("podcast", "https://podcasts.apple.com/podcast/episode/123", None)
    assert out == "/podcast/episode/123"
