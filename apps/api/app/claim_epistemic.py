"""
Epistemic derivation: claimType → support and default confidence.
Frozen contract: do not use claimType as proxy for reader trust without this mapping.

- confidence: how strongly the system stands behind the claim (high | medium | low)
- support: what kind of epistemic backing the claim has (direct | inference | interpretation | speculation)
- claimType: editorial/content classification (unchanged)
"""
from __future__ import annotations

from app.models import Claim, ClaimType, ConfidenceLevel, ClaimSupport


def derive_support(claim_type: ClaimType) -> str:
    """Deterministic mapping from claimType to support. Used when claim.support is not set."""
    return {
        ClaimType.verified_fact: ClaimSupport.direct.value,
        ClaimType.synthesized_claim: ClaimSupport.inference.value,
        ClaimType.interpretation: ClaimSupport.interpretation.value,
        ClaimType.speculation: ClaimSupport.speculation.value,
        ClaimType.opinion: ClaimSupport.inference.value,
        ClaimType.anecdote: ClaimSupport.inference.value,
        ClaimType.conspiracy_claim: ClaimSupport.speculation.value,
        ClaimType.advertisement: ClaimSupport.speculation.value,
        ClaimType.satire_or_joke: ClaimSupport.speculation.value,
        ClaimType.disputed_claim: ClaimSupport.interpretation.value,
    }.get(claim_type, ClaimSupport.inference.value)


def default_confidence(claim_type: ClaimType) -> str:
    """Default confidence when claim.confidence is not set."""
    return {
        ClaimType.verified_fact: ConfidenceLevel.high.value,
        ClaimType.synthesized_claim: ConfidenceLevel.medium.value,
        ClaimType.interpretation: ConfidenceLevel.medium.value,
        ClaimType.speculation: ConfidenceLevel.low.value,
        ClaimType.opinion: ConfidenceLevel.medium.value,
        ClaimType.anecdote: ConfidenceLevel.medium.value,
        ClaimType.conspiracy_claim: ConfidenceLevel.low.value,
        ClaimType.advertisement: ConfidenceLevel.low.value,
        ClaimType.satire_or_joke: ConfidenceLevel.low.value,
        ClaimType.disputed_claim: ConfidenceLevel.low.value,
    }.get(claim_type, ConfidenceLevel.medium.value)


def enrich_claim(claim: Claim) -> dict:
    """
    Return claim as dict with support and confidence guaranteed.
    Use when serving claims to the reader so UI always has epistemic fields.
    """
    d = claim.model_dump()
    conf = getattr(claim, "confidence", None)
    d["confidence"] = conf.value if conf is not None and hasattr(conf, "value") else (conf or default_confidence(claim.claimType))
    if d.get("support") is None:
        d["support"] = derive_support(claim.claimType)
    else:
        d["support"] = d["support"].value if hasattr(d["support"], "value") else d["support"]
    return d
