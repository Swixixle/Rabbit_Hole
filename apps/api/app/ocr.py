"""
OCR / Page Capture: extract text from image bytes using Tesseract.
If pytesseract or Tesseract binary is not available, returns empty text and low confidence.
Output shape is suitable for future reading-assist text streams (no blocking changes).
"""
from __future__ import annotations

import io
from typing import Tuple

try:
    from PIL import Image
    import pytesseract
    _OCR_AVAILABLE = True
except Exception:
    _OCR_AVAILABLE = False


def extract_text_from_image_bytes(image_bytes: bytes) -> Tuple[str, str]:
    """
    Run OCR on image bytes. Returns (text, confidence) where confidence is 'high' | 'medium' | 'low'.
    If OCR is unavailable or fails, returns ('', 'low').
    """
    if not _OCR_AVAILABLE:
        return "", "low"
    if not image_bytes or len(image_bytes) < 100:
        return "", "low"
    try:
        img = Image.open(io.BytesIO(image_bytes))
        # Convert to RGB if necessary (e.g. RGBA, P)
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        text = pytesseract.image_to_string(img, timeout=10)
        if not text or not text.strip():
            return "", "low"
        text_clean = text.strip()
        # Heuristic confidence: longer coherent text -> higher
        if len(text_clean) > 200:
            conf = "high"
        elif len(text_clean) > 50:
            conf = "medium"
        else:
            conf = "low"
        return text_clean, conf
    except Exception:
        return "", "low"
