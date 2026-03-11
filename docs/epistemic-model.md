# Epistemic Model

Every claim in a Rabbit Hole article is annotated with two epistemic properties: **confidence** and **support**. These labels help readers understand how certain a piece of information is and how it was derived.

## Confidence

Confidence describes how well-established a claim is based on available evidence.

| Level | Value | Description |
|-------|-------|-------------|
| High | `high` | The claim is well-established and supported by replicated or authoritative evidence. |
| Medium | `medium` | The claim is supported but not conclusively proven; reasonable doubt remains. |
| Low | `low` | The claim is speculative or based on early-stage, limited, or contested evidence. |

### Usage Guidelines

- Use `high` only when evidence has been independently replicated or comes from a highly authoritative primary source.
- Use `medium` for claims backed by a single study, expert opinion, or plausible but unverified reasoning.
- Use `low` for emerging hypotheses, anecdotal evidence, or predictions without strong empirical backing.

## Support Type

Support type describes the logical relationship between the evidence and the claim.

| Type | Value | Description |
|------|-------|-------------|
| Direct | `direct` | The evidence directly and explicitly demonstrates the claim with no inferential gap. |
| Inference | `inference` | The claim is logically deduced from the evidence through valid reasoning. |
| Interpretation | `interpretation` | The claim is one plausible reading of ambiguous evidence; other interpretations exist. |
| Speculation | `speculation` | The claim is an informed guess where evidence is limited, absent, or indirect. |

### Usage Guidelines

- Use `direct` when a source explicitly states the claim.
- Use `inference` when the claim follows logically but is not stated explicitly.
- Use `interpretation` when the evidence could reasonably support multiple conclusions.
- Use `speculation` when making forward-looking statements or filling knowledge gaps.

## Combining Confidence and Support

The two properties are independent and can be combined freely. Some common combinations:

| Confidence | Support | Example scenario |
|------------|---------|-----------------|
| `high` | `direct` | A published, replicated clinical trial result |
| `high` | `inference` | A well-established scientific law applied to a new context |
| `medium` | `interpretation` | Disputed academic findings open to multiple readings |
| `low` | `speculation` | An early-stage technology forecast |

## TypeScript Contract

```typescript
// packages/contracts/src/epistemic.ts

export type ClaimConfidence = 'high' | 'medium' | 'low';

export type ClaimSupport = 'direct' | 'inference' | 'interpretation' | 'speculation';

export interface EpistemicAnnotation {
  confidence: ClaimConfidence;
  support: ClaimSupport;
}
```

## Related Documents

- [Experience Layer v1](experience-layer-v1.md)
- [Share Surface v1](share-surface-v1.md)
