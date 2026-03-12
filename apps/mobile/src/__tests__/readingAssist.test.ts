import type {
  ReadingAssistCrossLinkSummary,
  ReadingAssistVerificationBundleSummary,
  ReadingAssistCuriositySignalSummary,
  ReadingAssistPromptToneSlotKind,
  ReadingAssistPromptToneFamily,
  ReadingAssistPromptToneIntensity,
  ReadingAssistPromptToneSlot,
  ReadingAssistPromptToneSlotSummary,
} from '../types/readingAssist';
import {
  buildVerificationBundleSummary,
  buildVerificationBundleIndexSummary,
  buildCuriositySignalSummary,
  buildPromptToneSlotSummary,
} from '../utils/readingAssist';

// ── helpers ────────────────────────────────────────────────────────────────

function makeSignalSummary(
  opts: { disagreement?: boolean; source?: boolean } = {},
): ReadingAssistCuriositySignalSummary {
  const kinds: ReadingAssistCuriositySignalSummary['signals'][string]['kinds'] = [
    'explore_point',
    'verification_opportunity',
  ];
  if (opts.source !== false) kinds.push('source_available');
  if (opts.disagreement) kinds.push('disagreement_present');

  const bundleId = 'ra-verification-bundle|ra-cross-link|cl-1';
  const signalId = `ra-curiosity-signal|${bundleId}`;

  return {
    signals: {
      [signalId]: {
        id: signalId,
        bundleId,
        crossLinkId: 'ra-cross-link|cl-1',
        sentenceId: 'sent-1',
        anchorId: 'anchor-1',
        kinds,
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  };
}

// ── v20 — Verification Bundle Skeleton ────────────────────────────────────

describe('buildVerificationBundleSummary (v20)', () => {
  const crossLinkSummary: ReadingAssistCrossLinkSummary = {
    slots: {
      'ra-cross-link|cl-1': {
        id: 'ra-cross-link|cl-1',
        sentenceId: 'sent-1',
        anchorId: 'anchor-1',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  };

  it('creates one bundle per cross-link slot', () => {
    const summary = buildVerificationBundleSummary(crossLinkSummary);
    expect(Object.keys(summary.bundles)).toHaveLength(1);
  });

  it('assigns the expected bundle id', () => {
    const summary = buildVerificationBundleSummary(crossLinkSummary);
    expect(summary.bundles['ra-verification-bundle|ra-cross-link|cl-1']).toBeDefined();
  });

  it('preserves sentenceId and anchorId from the cross-link slot', () => {
    const summary = buildVerificationBundleSummary(crossLinkSummary);
    const bundle = summary.bundles['ra-verification-bundle|ra-cross-link|cl-1'];
    expect(bundle.sentenceId).toBe('sent-1');
    expect(bundle.anchorId).toBe('anchor-1');
  });

  it('sets all placeholder fields to null', () => {
    const summary = buildVerificationBundleSummary(crossLinkSummary);
    const bundle = summary.bundles['ra-verification-bundle|ra-cross-link|cl-1'];
    expect(bundle.claimId).toBeNull();
    expect(bundle.sourceId).toBeNull();
    expect(bundle.verificationId).toBeNull();
    expect(bundle.disagreementId).toBeNull();
  });
});

// ── v21 — Verification Bundle Indexes ─────────────────────────────────────

describe('buildVerificationBundleIndexSummary (v21)', () => {
  const bundleSummary: ReadingAssistVerificationBundleSummary = {
    bundles: {
      'ra-verification-bundle|ra-cross-link|cl-1': {
        id: 'ra-verification-bundle|ra-cross-link|cl-1',
        crossLinkId: 'ra-cross-link|cl-1',
        sentenceId: 'sent-1',
        anchorId: 'anchor-1',
        claimId: null,
        sourceId: null,
        verificationId: null,
        disagreementId: null,
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  };

  it('exposes all six index keys', () => {
    const idx = buildVerificationBundleIndexSummary(bundleSummary);
    expect(idx).toHaveProperty('bySentenceId');
    expect(idx).toHaveProperty('byAnchorId');
    expect(idx).toHaveProperty('byClaimId');
    expect(idx).toHaveProperty('bySourceId');
    expect(idx).toHaveProperty('byVerificationId');
    expect(idx).toHaveProperty('byDisagreementId');
  });

  it('indexes by sentenceId and anchorId', () => {
    const idx = buildVerificationBundleIndexSummary(bundleSummary);
    expect(idx.bySentenceId['sent-1']).toContain('ra-verification-bundle|ra-cross-link|cl-1');
    expect(idx.byAnchorId['anchor-1']).toContain('ra-verification-bundle|ra-cross-link|cl-1');
  });

  it('skips null placeholder fields', () => {
    const idx = buildVerificationBundleIndexSummary(bundleSummary);
    expect(Object.keys(idx.byClaimId)).toHaveLength(0);
    expect(Object.keys(idx.bySourceId)).toHaveLength(0);
    expect(Object.keys(idx.byVerificationId)).toHaveLength(0);
    expect(Object.keys(idx.byDisagreementId)).toHaveLength(0);
  });
});

// ── v22 — Curiosity Signal Skeleton ───────────────────────────────────────

describe('buildCuriositySignalSummary (v22)', () => {
  const bundleSummary: ReadingAssistVerificationBundleSummary = {
    bundles: {
      'ra-verification-bundle|ra-cross-link|cl-1': {
        id: 'ra-verification-bundle|ra-cross-link|cl-1',
        crossLinkId: 'ra-cross-link|cl-1',
        sentenceId: 'sent-1',
        anchorId: 'anchor-1',
        claimId: null,
        sourceId: null,
        verificationId: null,
        disagreementId: null,
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  };

  it('creates one signal per bundle', () => {
    const summary = buildCuriositySignalSummary(bundleSummary);
    expect(Object.keys(summary.signals)).toHaveLength(1);
  });

  it('assigns the expected signal id', () => {
    const summary = buildCuriositySignalSummary(bundleSummary);
    const expectedId = 'ra-curiosity-signal|ra-verification-bundle|ra-cross-link|cl-1';
    expect(summary.signals[expectedId]).toBeDefined();
  });

  it('includes base signal kinds when no disagreement', () => {
    const summary = buildCuriositySignalSummary(bundleSummary);
    const signal = Object.values(summary.signals)[0];
    expect(signal.kinds).toContain('explore_point');
    expect(signal.kinds).toContain('source_available');
    expect(signal.kinds).toContain('verification_opportunity');
    expect(signal.kinds).not.toContain('disagreement_present');
  });

  it('adds disagreement_present when bundle has a disagreementId', () => {
    const withDisagreement: ReadingAssistVerificationBundleSummary = {
      bundles: {
        'ra-verification-bundle|ra-cross-link|cl-2': {
          id: 'ra-verification-bundle|ra-cross-link|cl-2',
          crossLinkId: 'ra-cross-link|cl-2',
          sentenceId: 'sent-2',
          anchorId: 'anchor-2',
          claimId: null,
          sourceId: null,
          verificationId: null,
          disagreementId: 'dis-1',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
    };
    const summary = buildCuriositySignalSummary(withDisagreement);
    const signal = Object.values(summary.signals)[0];
    expect(signal.kinds).toContain('disagreement_present');
  });
});

// ── v23 — Prompt Tone Slots ────────────────────────────────────────────────

describe('buildPromptToneSlotSummary (v23)', () => {
  it('creates one slot per curiosity signal', () => {
    const summary = buildPromptToneSlotSummary(makeSignalSummary());
    expect(Object.keys(summary.slots)).toHaveLength(1);
  });

  it('assigns the expected slot id', () => {
    const summary = buildPromptToneSlotSummary(makeSignalSummary());
    const bundleId = 'ra-verification-bundle|ra-cross-link|cl-1';
    const signalId = `ra-curiosity-signal|${bundleId}`;
    const expectedId = `ra-prompt-tone-slot|${signalId}`;
    expect(summary.slots[expectedId]).toBeDefined();
  });

  it('always includes gentle_nudge and curious_invite', () => {
    const summary = buildPromptToneSlotSummary(makeSignalSummary());
    const slot = Object.values(summary.slots)[0];
    expect(slot.slotKinds).toContain('gentle_nudge');
    expect(slot.slotKinds).toContain('curious_invite');
  });

  it('adds source_peek when signal includes source_available', () => {
    const summary = buildPromptToneSlotSummary(makeSignalSummary({ source: true }));
    const slot = Object.values(summary.slots)[0];
    expect(slot.slotKinds).toContain('source_peek');
  });

  it('omits source_peek when signal lacks source_available', () => {
    const summary = buildPromptToneSlotSummary(makeSignalSummary({ source: false }));
    const slot = Object.values(summary.slots)[0];
    expect(slot.slotKinds).not.toContain('source_peek');
  });

  it('adds soft_compare when signal includes disagreement_present', () => {
    const summary = buildPromptToneSlotSummary(makeSignalSummary({ disagreement: true }));
    const slot = Object.values(summary.slots)[0];
    expect(slot.slotKinds).toContain('soft_compare');
  });

  it('omits soft_compare when signal lacks disagreement_present', () => {
    const summary = buildPromptToneSlotSummary(makeSignalSummary({ disagreement: false }));
    const slot = Object.values(summary.slots)[0];
    expect(slot.slotKinds).not.toContain('soft_compare');
  });

  it('uses neutral_warm toneFamily when no disagreement', () => {
    const summary = buildPromptToneSlotSummary(makeSignalSummary({ disagreement: false }));
    const slot = Object.values(summary.slots)[0];
    expect(slot.toneFamily).toBe<ReadingAssistPromptToneFamily>('neutral_warm');
  });

  it('uses calm toneFamily when disagreement is present', () => {
    const summary = buildPromptToneSlotSummary(makeSignalSummary({ disagreement: true }));
    const slot = Object.values(summary.slots)[0];
    expect(slot.toneFamily).toBe<ReadingAssistPromptToneFamily>('calm');
  });

  it('uses low intensity when no disagreement', () => {
    const summary = buildPromptToneSlotSummary(makeSignalSummary({ disagreement: false }));
    const slot = Object.values(summary.slots)[0];
    expect(slot.intensity).toBe<ReadingAssistPromptToneIntensity>('low');
  });

  it('uses medium intensity when disagreement is present', () => {
    const summary = buildPromptToneSlotSummary(makeSignalSummary({ disagreement: true }));
    const slot = Object.values(summary.slots)[0];
    expect(slot.intensity).toBe<ReadingAssistPromptToneIntensity>('medium');
  });

  it('does not auto-emit playful_light', () => {
    const summary = buildPromptToneSlotSummary(makeSignalSummary());
    const slot = Object.values(summary.slots)[0];
    expect(slot.toneFamily).not.toBe<ReadingAssistPromptToneFamily>('playful_light');
  });

  it('preserves signal provenance fields on each slot', () => {
    const signalSummary = makeSignalSummary();
    const signal = Object.values(signalSummary.signals)[0];
    const summary = buildPromptToneSlotSummary(signalSummary);
    const slot = Object.values(summary.slots)[0];

    expect(slot.signalId).toBe(signal.id);
    expect(slot.bundleId).toBe(signal.bundleId);
    expect(slot.crossLinkId).toBe(signal.crossLinkId);
    expect(slot.sentenceId).toBe(signal.sentenceId);
    expect(slot.anchorId).toBe(signal.anchorId);
  });

  it('returns an empty summary when there are no signals', () => {
    const summary = buildPromptToneSlotSummary({ signals: {} });
    expect(Object.keys(summary.slots)).toHaveLength(0);
  });

  it('handles multiple signals independently', () => {
    const bundle1 = 'ra-verification-bundle|ra-cross-link|cl-1';
    const bundle2 = 'ra-verification-bundle|ra-cross-link|cl-2';
    const sig1 = `ra-curiosity-signal|${bundle1}`;
    const sig2 = `ra-curiosity-signal|${bundle2}`;

    const multiSignal: ReadingAssistCuriositySignalSummary = {
      signals: {
        [sig1]: {
          id: sig1,
          bundleId: bundle1,
          crossLinkId: 'ra-cross-link|cl-1',
          sentenceId: 'sent-1',
          anchorId: 'anchor-1',
          kinds: ['explore_point', 'source_available', 'verification_opportunity'],
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        [sig2]: {
          id: sig2,
          bundleId: bundle2,
          crossLinkId: 'ra-cross-link|cl-2',
          sentenceId: 'sent-2',
          anchorId: 'anchor-2',
          kinds: ['explore_point', 'source_available', 'verification_opportunity', 'disagreement_present'],
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
    };

    const summary = buildPromptToneSlotSummary(multiSignal);
    expect(Object.keys(summary.slots)).toHaveLength(2);

    const slot1 = summary.slots[`ra-prompt-tone-slot|${sig1}`];
    const slot2 = summary.slots[`ra-prompt-tone-slot|${sig2}`];

    expect(slot1.toneFamily).toBe('neutral_warm');
    expect(slot1.intensity).toBe('low');
    expect(slot1.slotKinds).not.toContain('soft_compare');

    expect(slot2.toneFamily).toBe('calm');
    expect(slot2.intensity).toBe('medium');
    expect(slot2.slotKinds).toContain('soft_compare');
  });
});

// ── v23 — Type shape ───────────────────────────────────────────────────────

describe('ReadingAssistPromptToneSlot type shape', () => {
  it('constructs a valid slot with all required fields', () => {
    const slot: ReadingAssistPromptToneSlot = {
      id: 'ra-prompt-tone-slot|ra-curiosity-signal|ra-verification-bundle|cl-1',
      sentenceId: 'sent-1',
      anchorId: 'anchor-1',
      signalId: 'ra-curiosity-signal|ra-verification-bundle|cl-1',
      bundleId: 'ra-verification-bundle|cl-1',
      crossLinkId: 'cl-1',
      slotKinds: ['gentle_nudge', 'curious_invite'],
      toneFamily: 'neutral_warm',
      intensity: 'low',
      createdAt: '2024-01-01T00:00:00.000Z',
    };
    expect(slot.id).toContain('ra-prompt-tone-slot');
    expect(slot.slotKinds).toHaveLength(2);
    expect(slot.toneFamily).toBe('neutral_warm');
    expect(slot.intensity).toBe('low');
  });

  it('accepts all valid slot kind values', () => {
    const kinds: ReadingAssistPromptToneSlotKind[] = [
      'gentle_nudge',
      'curious_invite',
      'source_peek',
      'soft_compare',
    ];
    expect(kinds).toHaveLength(4);
  });

  it('accepts all valid tone family values', () => {
    const families: ReadingAssistPromptToneFamily[] = ['neutral_warm', 'calm', 'playful_light'];
    expect(families).toHaveLength(3);
  });

  it('accepts all valid intensity values', () => {
    const intensities: ReadingAssistPromptToneIntensity[] = ['low', 'medium'];
    expect(intensities).toHaveLength(2);
  });

  it('constructs a valid ReadingAssistPromptToneSlotSummary', () => {
    const summary: ReadingAssistPromptToneSlotSummary = { slots: {} };
    expect(summary.slots).toBeDefined();
    expect(Object.keys(summary.slots)).toHaveLength(0);
  });
});
