"""
Rabbit Hole v17 — Generate minimal provisional node package for unmatched recognition.
Text-only LLM call; no sources or support edges. Output validated and sanitized.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Literal

logger = logging.getLogger(__name__)

NodeKind = Literal["entity", "product", "landmark", "topic", "media"]
ClaimKind = Literal["identity", "material", "functional", "comparative", "contextual"]
RelationType = Literal["is_a", "part_of", "made_of", "related_to", "alternative_to", "used_for", "produced_by"]

VALID_NODE_KINDS: tuple[NodeKind, ...] = ("entity", "product", "landmark", "topic", "media")
VALID_CLAIM_KINDS: tuple[ClaimKind, ...] = ("identity", "material", "functional", "comparative", "contextual")
VALID_RELATION_TYPES: tuple[RelationType, ...] = ("is_a", "part_of", "made_of", "related_to", "alternative_to", "used_for", "produced_by")

MAX_CLAIMS = 4
MIN_CLAIMS = 2
MAX_SUGGESTED_RELATIONS = 4


def _validate_claim(c: dict) -> dict | None:
    text = (c.get("text") or "").strip()
    if not text:
        return None
    kind = (c.get("claimKind") or "").strip().lower()
    if kind not in VALID_CLAIM_KINDS:
        kind = "contextual"
    conf = c.get("confidence")
    if conf is not None:
        try:
            conf = float(conf)
            if not (0 <= conf <= 1):
                conf = None
        except (TypeError, ValueError):
            conf = None
    return {"text": text, "claimKind": kind, "confidence": conf}


def _validate_relation(r: dict) -> dict | None:
    label = (r.get("label") or "").strip()
    if not label:
        return None
    rt = (r.get("relationType") or "").strip().lower()
    if rt not in VALID_RELATION_TYPES:
        return None
    conf = r.get("confidence")
    if conf is not None:
        try:
            conf = float(conf)
            if not (0 <= conf <= 1):
                conf = None
        except (TypeError, ValueError):
            conf = None
    return {"label": label, "relationType": rt, "confidence": conf}


def _sanitize_response(raw: dict) -> dict | None:
    """Validate and sanitize LLM output. Returns None on malformed."""
    if not isinstance(raw, dict):
        return None
    title = (raw.get("title") or "").strip()
    if not title:
        return None
    description = (raw.get("description") or "").strip()
    if not description:
        description = title  # fallback to title for minimal description
    node_kind = (raw.get("nodeKind") or "").strip().lower()
    if node_kind not in VALID_NODE_KINDS:
        node_kind = "entity"
    claims_raw = raw.get("claims")
    if not isinstance(claims_raw, list):
        return None
    seen_text: set[str] = set()
    claims = []
    for c in claims_raw[:MAX_CLAIMS]:
        if len(claims) >= MAX_CLAIMS:
            break
        parsed = _validate_claim(c) if isinstance(c, dict) else None
        if not parsed or parsed["text"] in seen_text:
            continue
        seen_text.add(parsed["text"])
        claims.append(parsed)
    if len(claims) < MIN_CLAIMS:
        return None
    suggested: list[dict] = []
    rels_raw = raw.get("suggestedRelations")
    if isinstance(rels_raw, list):
        for r in rels_raw[:MAX_SUGGESTED_RELATIONS]:
            if len(suggested) >= MAX_SUGGESTED_RELATIONS:
                break
            parsed = _validate_relation(r) if isinstance(r, dict) else None
            if parsed:
                suggested.append(parsed)
    return {
        "title": title,
        "description": description,
        "nodeKind": node_kind,
        "claims": claims,
        "suggestedRelations": suggested if suggested else None,
    }


def _build_specificity_context(
    label: str,
    visual_description: str | None,
    specificity_hint: str | None,
    likely_variant: str | None,
    observed_text: list[str] | None,
    lineage_hints: list[str] | None,
) -> str:
    """Build a short context block for the prompt from optional specificity fields."""
    parts = [f'Recognized as: "{label}"']
    if likely_variant and likely_variant.strip():
        parts.append(f'Likely variant/edition: "{likely_variant.strip()}"')
    if specificity_hint and specificity_hint.strip():
        parts.append(f'Specificity: "{specificity_hint.strip()}"')
    if visual_description and visual_description.strip():
        parts.append(f'Visible: "{visual_description.strip()}"')
    if observed_text:
        seen = [str(t).strip() for t in observed_text if t and str(t).strip()][:15]
        if seen:
            parts.append(f"Observed text on object: {', '.join(repr(s) for s in seen)}")
    if lineage_hints:
        hints = [str(h).strip() for h in lineage_hints if h and str(h).strip()][:8]
        if hints:
            parts.append(f"Lineage/context hints: {', '.join(hints)}")
    return "\n".join(parts)


async def generate_node(
    label: str,
    candidate_type: str,
    alternative_labels: list[str] | None = None,
    visual_description: str | None = None,
    specificity_hint: str | None = None,
    likely_variant: str | None = None,
    observed_text: list[str] | None = None,
    lineage_hints: list[str] | None = None,
) -> dict | None:
    """
    Call LLM to generate minimal provisional node (title, description, claims, optional relations).
    v17 refinement: prefers specific observed object/variant when input supports it. No sources.
    """
    label_clean = (label or "").strip()
    if not label_clean:
        return None
    kind = (candidate_type or "entity").strip().lower()
    if kind not in VALID_NODE_KINDS:
        kind = "entity"
    alts = alternative_labels or []
    alts = [str(a).strip() for a in alts if a and str(a).strip()][:10]

    api_key = os.environ.get("OPENAI_API_KEY")
    model = os.environ.get("OPENAI_VISION_MODEL", "gpt-4o-mini")
    if not api_key or not api_key.strip():
        logger.debug("knowledge_generator: OPENAI_API_KEY not set")
        return None

    specificity_block = _build_specificity_context(
        label_clean,
        visual_description,
        specificity_hint,
        likely_variant,
        observed_text,
        lineage_hints,
    )

    prompt = f"""Generate a minimal, neutral knowledge card for the SPECIFIC observed object described below. Center the node on the most specific safe identity supported by the input — not the generic category.

{specificity_block}

Instructions:
- TITLE: Use the most specific safe title. Prefer likelyVariant / specific model/edition when the input supports it (e.g. "Sony WH-1000XM5", "Likely Whitesnake 1984 tour shirt", "Stovetop moka pot"). Use generic category only when specificity is not justified.
- DESCRIPTION: Reflect the specific thing, not broad encyclopedia wording.
- CLAIMS:
  1. At least one claim should refer to the specific observed thing or variant when safe.
  2. At least one claim should be non-obvious but accurate/likely.
  3. Avoid generic filler (e.g. not "Headphones are used to listen to audio" or "A shirt is a type of clothing").
  4. For clothing/posters/merch/documents: you may include one claim about likely lineage/context if supported by visible evidence — phrase conservatively with "appears to", "likely", "often". Do not assert provenance as hard fact without strong support.

Reply with ONLY a single JSON object, no other text. Use this exact shape:
{{
  "title": "Most specific safe title for this observed object",
  "description": "One or two sentences about this specific thing. No citations.",
  "nodeKind": "{kind}",
  "claims": [
    {{ "text": "Short factual claim about the specific object", "claimKind": "identity"|"material"|"functional"|"comparative"|"contextual", "confidence": 0.0-1.0 or null }},
    ... 2-4 claims only
  ],
  "suggestedRelations": [
    {{ "label": "Related concept", "relationType": "is_a"|"part_of"|"made_of"|"related_to"|"alternative_to"|"used_for"|"produced_by", "confidence": number or null }}
  ]
}}
Rules: claimKind must be one of: identity, material, functional, comparative, contextual. suggestedRelations optional; 0-4 items. No sources or citations. Do not invent precision not supported by the input."""

    if alts:
        prompt += f"\nAlternative labels: {', '.join(alts[:5])}."

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
        )
        content = (response.choices[0].message.content or "").strip()
        if not content:
            logger.debug("knowledge_generator: empty response")
            return None
        if content.startswith("```"):
            lines = content.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            content = "\n".join(lines)
        data = json.loads(content)
        out = _sanitize_response(data)
        if out:
            logger.info("knowledge_generator: generated title=%r nodeKind=%s claims=%d", out["title"], out["nodeKind"], len(out["claims"]))
        else:
            logger.warning("knowledge_generator: sanitize failed")
        return out
    except json.JSONDecodeError as e:
        logger.warning("knowledge_generator: JSON decode error %s", e)
        return None
    except Exception as e:
        logger.warning("knowledge_generator: %s", e)
        return None
