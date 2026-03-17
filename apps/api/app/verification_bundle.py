"""
Build verification bundle for Verify surface: claims, sources, evidence spans, and mappings.
Isolated so future claim-review / confidence-scoring can plug in.
"""
from __future__ import annotations

from app.models import Claim, ClaimType, ConfidenceLevel


# Support-status display labels; derived from claim type + source count + confidence (no fake scores)
SUPPORT_STATUS_SUPPORTED_FACT = "supported_fact"
SUPPORT_STATUS_SUPPORTED_SYNTHESIS = "supported_synthesis"
SUPPORT_STATUS_INTERPRETATION = "interpretation"
SUPPORT_STATUS_LIMITED_SUPPORT = "limited_support"
SUPPORT_STATUS_INSUFFICIENT_SUPPORT = "insufficient_support"
SUPPORT_STATUS_DISPUTED = "disputed"


def get_support_status(claim: Claim, source_count: int) -> str:
    """
    Derive support-status label from claim type, confidence, and actual source count.
    Future: replace with verification/confidence layer.
    """
    conf = getattr(claim, "confidence", None)
    is_high = conf == "high" or conf == ConfidenceLevel.high
    if claim.claimType == ClaimType.disputed_claim:
        return SUPPORT_STATUS_DISPUTED
    if source_count == 0:
        return SUPPORT_STATUS_INSUFFICIENT_SUPPORT
    if claim.claimType == ClaimType.verified_fact:
        if source_count >= 2 and is_high:
            return SUPPORT_STATUS_SUPPORTED_FACT
        return SUPPORT_STATUS_LIMITED_SUPPORT
    if claim.claimType == ClaimType.synthesized_claim and source_count >= 1:
        return SUPPORT_STATUS_SUPPORTED_SYNTHESIS
    if claim.claimType == ClaimType.interpretation:
        return SUPPORT_STATUS_INTERPRETATION
    if source_count < 2:
        return SUPPORT_STATUS_LIMITED_SUPPORT
    return SUPPORT_STATUS_INTERPRETATION
