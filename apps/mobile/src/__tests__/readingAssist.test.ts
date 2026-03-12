import {
  DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
  DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY,
} from '../types/readingAssist'
import type {
  ReadingAssistReadingPathSummary,
  ReadingAssistVerificationBundle,
  ReadingAssistVerificationBundleIndexSummary,
  ReadingAssistVerificationBundleSummary,
} from '../types/readingAssist'
import {
  createReadingAssistCrossLinkId,
  createReadingAssistVerificationBundleId,
  ensureReadingAssistIdIndexEntry,
  ensureReadingAssistVerificationBundleIndexes,
  ensureVerificationBundleIndexesForBundleId,
  readingAssistReadingPathReducer,
} from '../utils/readingAssist'

// ── v20 fixtures ──────────────────────────────────────────────────────────────

const SENTENCE_ID = 'sentence-1'
const ANCHOR_ID = 'anchor-1'
const CLAIM_ID = 'claim-1'
const SOURCE_ID = 'source-1'
const VERIFICATION_ID = 'verification-1'
const DISAGREEMENT_ID = 'disagreement-1'

const CROSS_LINK_ID = createReadingAssistCrossLinkId(SENTENCE_ID, ANCHOR_ID)
const BUNDLE_ID = createReadingAssistVerificationBundleId(CROSS_LINK_ID)

function makeBundle(
  overrides: Partial<ReadingAssistVerificationBundle> = {},
): ReadingAssistVerificationBundle {
  return {
    id: BUNDLE_ID,
    sentenceId: SENTENCE_ID,
    anchorId: ANCHOR_ID,
    claimId: CLAIM_ID,
    sourceId: SOURCE_ID,
    verificationId: VERIFICATION_ID,
    disagreementId: null,
    ...overrides,
  }
}

function makeBundleSummary(
  bundle: ReadingAssistVerificationBundle,
): ReadingAssistVerificationBundleSummary {
  return { bundles: { [bundle.id]: bundle } }
}

function makeEmptyIndexSummary(): ReadingAssistVerificationBundleIndexSummary {
  return { ...DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY }
}

// ── v21 tests ─────────────────────────────────────────────────────────────────

describe('v21 — Verification Bundle Indexes', () => {
  // ── default / reset shape ──────────────────────────────────────────────────

  describe('default / reset shape', () => {
    it('default reading path summary includes verificationBundleIndexSummary', () => {
      expect(DEFAULT_READING_ASSIST_READING_PATH_SUMMARY).toHaveProperty(
        'verificationBundleIndexSummary',
      )
    })

    it('all index maps are empty by default', () => {
      const idx = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY.verificationBundleIndexSummary
      expect(idx.bySentenceId).toEqual({})
      expect(idx.byAnchorId).toEqual({})
      expect(idx.byClaimId).toEqual({})
      expect(idx.bySourceId).toEqual({})
      expect(idx.byVerificationId).toEqual({})
      expect(idx.byDisagreementId).toEqual({})
    })

    it('reset (default constant) yields empty verification bundle index summary', () => {
      const idx = DEFAULT_READING_ASSIST_VERIFICATION_BUNDLE_INDEX_SUMMARY
      expect(Object.keys(idx.bySentenceId)).toHaveLength(0)
      expect(Object.keys(idx.byAnchorId)).toHaveLength(0)
      expect(Object.keys(idx.byClaimId)).toHaveLength(0)
      expect(Object.keys(idx.bySourceId)).toHaveLength(0)
      expect(Object.keys(idx.byVerificationId)).toHaveLength(0)
      expect(Object.keys(idx.byDisagreementId)).toHaveLength(0)
    })
  })

  // ── id index helper ────────────────────────────────────────────────────────

  describe('ensureReadingAssistIdIndexEntry', () => {
    it('initializes a new array when key is absent', () => {
      const result = ensureReadingAssistIdIndexEntry({}, 'k1', 'id-a')
      expect(result['k1']).toEqual(['id-a'])
    })

    it('does not duplicate the same id', () => {
      const base = { k1: ['id-a'] }
      const result = ensureReadingAssistIdIndexEntry(base, 'k1', 'id-a')
      expect(result['k1']).toEqual(['id-a'])
    })

    it('appends a second distinct id', () => {
      const base = { k1: ['id-a'] }
      const result = ensureReadingAssistIdIndexEntry(base, 'k1', 'id-b')
      expect(result['k1']).toEqual(['id-a', 'id-b'])
    })

    it('ignores a falsy key and returns the map unchanged', () => {
      const base = { k1: ['id-a'] }
      const result = ensureReadingAssistIdIndexEntry(base, '', 'id-b')
      expect(result).toEqual(base)
    })

    it('does not mutate the original map', () => {
      const base: Record<string, string[]> = {}
      ensureReadingAssistIdIndexEntry(base, 'k1', 'id-a')
      expect(base).toEqual({})
    })
  })

  // ── bundle index helper ────────────────────────────────────────────────────

  describe('ensureReadingAssistVerificationBundleIndexes', () => {
    it('indexes a bundle into sentence, anchor, claim, source, and verification', () => {
      const bundle = makeBundle()
      const result = ensureReadingAssistVerificationBundleIndexes(makeEmptyIndexSummary(), bundle)

      expect(result.bySentenceId[SENTENCE_ID]).toContain(BUNDLE_ID)
      expect(result.byAnchorId[ANCHOR_ID]).toContain(BUNDLE_ID)
      expect(result.byClaimId[CLAIM_ID]).toContain(BUNDLE_ID)
      expect(result.bySourceId[SOURCE_ID]).toContain(BUNDLE_ID)
      expect(result.byVerificationId[VERIFICATION_ID]).toContain(BUNDLE_ID)
    })

    it('does not index into byDisagreementId when disagreementId is null', () => {
      const bundle = makeBundle({ disagreementId: null })
      const result = ensureReadingAssistVerificationBundleIndexes(makeEmptyIndexSummary(), bundle)

      expect(result.byDisagreementId).toEqual({})
    })

    it('indexes into byDisagreementId only when disagreementId is non-null', () => {
      const bundle = makeBundle({ disagreementId: DISAGREEMENT_ID })
      const result = ensureReadingAssistVerificationBundleIndexes(makeEmptyIndexSummary(), bundle)

      expect(result.byDisagreementId[DISAGREEMENT_ID]).toContain(BUNDLE_ID)
    })

    it('repeated ensure does not duplicate any ids', () => {
      const bundle = makeBundle({ disagreementId: DISAGREEMENT_ID })
      const once = ensureReadingAssistVerificationBundleIndexes(makeEmptyIndexSummary(), bundle)
      const twice = ensureReadingAssistVerificationBundleIndexes(once, bundle)

      expect(twice.bySentenceId[SENTENCE_ID]).toEqual([BUNDLE_ID])
      expect(twice.byAnchorId[ANCHOR_ID]).toEqual([BUNDLE_ID])
      expect(twice.byClaimId[CLAIM_ID]).toEqual([BUNDLE_ID])
      expect(twice.bySourceId[SOURCE_ID]).toEqual([BUNDLE_ID])
      expect(twice.byVerificationId[VERIFICATION_ID]).toEqual([BUNDLE_ID])
      expect(twice.byDisagreementId[DISAGREEMENT_ID]).toEqual([BUNDLE_ID])
    })
  })

  // ── bundle-id helper ───────────────────────────────────────────────────────

  describe('ensureVerificationBundleIndexesForBundleId', () => {
    it('indexes the bundle when it exists in the summary', () => {
      const bundle = makeBundle()
      const bundleSummary = makeBundleSummary(bundle)
      const result = ensureVerificationBundleIndexesForBundleId(
        makeEmptyIndexSummary(),
        bundleSummary,
        BUNDLE_ID,
      )

      expect(result.bySentenceId[SENTENCE_ID]).toContain(BUNDLE_ID)
    })

    it('returns the index summary unchanged when bundle id is missing', () => {
      const empty = makeEmptyIndexSummary()
      const result = ensureVerificationBundleIndexesForBundleId(
        empty,
        { bundles: {} },
        'nonexistent-bundle',
      )

      expect(result).toBe(empty)
    })

    it('repeated ensure does not duplicate ids', () => {
      const bundle = makeBundle()
      const bundleSummary = makeBundleSummary(bundle)

      const once = ensureVerificationBundleIndexesForBundleId(
        makeEmptyIndexSummary(),
        bundleSummary,
        BUNDLE_ID,
      )
      const twice = ensureVerificationBundleIndexesForBundleId(once, bundleSummary, BUNDLE_ID)

      expect(twice.bySentenceId[SENTENCE_ID]).toEqual([BUNDLE_ID])
    })
  })

  // ── reducer behavior ───────────────────────────────────────────────────────

  describe('readingAssistReadingPathReducer', () => {
    it('eligible sentence event produces exactly one bundle id in each relevant index', () => {
      const next = readingAssistReadingPathReducer(DEFAULT_READING_ASSIST_READING_PATH_SUMMARY, {
        type: 'SENTENCE_OBSERVED',
        sentenceId: SENTENCE_ID,
        anchorId: ANCHOR_ID,
        claimId: CLAIM_ID,
        sourceId: SOURCE_ID,
        verificationId: VERIFICATION_ID,
      })

      const idx = next.verificationBundleIndexSummary
      expect(idx.bySentenceId[SENTENCE_ID]).toEqual([BUNDLE_ID])
      expect(idx.byAnchorId[ANCHOR_ID]).toEqual([BUNDLE_ID])
      expect(idx.byClaimId[CLAIM_ID]).toEqual([BUNDLE_ID])
      expect(idx.bySourceId[SOURCE_ID]).toEqual([BUNDLE_ID])
      expect(idx.byVerificationId[VERIFICATION_ID]).toEqual([BUNDLE_ID])
      expect(idx.byDisagreementId).toEqual({})
    })

    it('repeated reduction does not duplicate indexed bundle ids', () => {
      const event = {
        type: 'SENTENCE_OBSERVED' as const,
        sentenceId: SENTENCE_ID,
        anchorId: ANCHOR_ID,
        claimId: CLAIM_ID,
        sourceId: SOURCE_ID,
        verificationId: VERIFICATION_ID,
      }

      const once = readingAssistReadingPathReducer(DEFAULT_READING_ASSIST_READING_PATH_SUMMARY, event)
      const twice = readingAssistReadingPathReducer(once, event)

      expect(twice.verificationBundleIndexSummary.bySentenceId[SENTENCE_ID]).toEqual([BUNDLE_ID])
    })

    it('revisit with disagreementId updates byDisagreementId without duplicating other indexes', () => {
      const baseEvent = {
        type: 'SENTENCE_OBSERVED' as const,
        sentenceId: SENTENCE_ID,
        anchorId: ANCHOR_ID,
        claimId: CLAIM_ID,
        sourceId: SOURCE_ID,
        verificationId: VERIFICATION_ID,
      }

      const revisitEvent = {
        ...baseEvent,
        disagreementId: DISAGREEMENT_ID,
      }

      const after = readingAssistReadingPathReducer(DEFAULT_READING_ASSIST_READING_PATH_SUMMARY, baseEvent)
      const afterRevisit = readingAssistReadingPathReducer(after, revisitEvent)

      const idx = afterRevisit.verificationBundleIndexSummary
      expect(idx.byDisagreementId[DISAGREEMENT_ID]).toEqual([BUNDLE_ID])
      // main indexes still have exactly one entry
      expect(idx.bySentenceId[SENTENCE_ID]).toEqual([BUNDLE_ID])
    })

    it('block-only events do not create bundle indexes', () => {
      const next = readingAssistReadingPathReducer(DEFAULT_READING_ASSIST_READING_PATH_SUMMARY, {
        type: 'BLOCK_OBSERVED',
        blockId: 'block-1',
      })

      expect(next.verificationBundleIndexSummary).toBe(
        DEFAULT_READING_ASSIST_READING_PATH_SUMMARY.verificationBundleIndexSummary,
      )
    })

    it('no indexes appear when no verification bundle exists (block-only)', () => {
      const next = readingAssistReadingPathReducer(DEFAULT_READING_ASSIST_READING_PATH_SUMMARY, {
        type: 'BLOCK_OBSERVED',
        blockId: 'block-2',
      })

      const idx = next.verificationBundleIndexSummary
      expect(Object.keys(idx.bySentenceId)).toHaveLength(0)
      expect(Object.keys(idx.byAnchorId)).toHaveLength(0)
      expect(Object.keys(idx.byClaimId)).toHaveLength(0)
      expect(Object.keys(idx.bySourceId)).toHaveLength(0)
      expect(Object.keys(idx.byVerificationId)).toHaveLength(0)
      expect(Object.keys(idx.byDisagreementId)).toHaveLength(0)
    })
  })
})
