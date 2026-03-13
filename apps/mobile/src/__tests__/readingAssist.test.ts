import type {
  ReadingAssistCrossLinkSummary,
  ReadingAssistVerificationBundleSummary,
  ReadingAssistCuriositySignalSummary,
  ReadingAssistPromptToneSlotKind,
  ReadingAssistPromptToneFamily,
  ReadingAssistPromptToneIntensity,
  ReadingAssistPromptToneSlot,
  ReadingAssistPromptToneSlotSummary,
  ReadingAssistPromptCopySelectionKind,
  ReadingAssistPromptCopySelection,
  ReadingAssistPromptCopySelectionSummary,
  ReadingAssistPromptCopyLibraryRecord,
  ReadingAssistPromptCopyLibraryRecordSummary,
} from '../types/readingAssist';
import {
  buildVerificationBundleSummary,
  buildVerificationBundleIndexSummary,
  buildCuriositySignalSummary,
  buildPromptToneSlotSummary,
  buildPromptCopySelectionSummary,
  buildPromptCopyLibraryRecordSummary,
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

// ── v24 helper ─────────────────────────────────────────────────────────────

function makeToneSlotSummary(
  opts: { disagreement?: boolean; sourceAvailable?: boolean } = {},
): ReadingAssistPromptToneSlotSummary {
  const slotKinds: ReadingAssistPromptToneSlotKind[] = ['gentle_nudge', 'curious_invite'];
  if (opts.sourceAvailable !== false) slotKinds.push('source_peek');
  if (opts.disagreement) slotKinds.push('soft_compare');

  const bundleId = 'ra-verification-bundle|ra-cross-link|cl-1';
  const signalId = `ra-curiosity-signal|${bundleId}`;
  const slotId = `ra-prompt-tone-slot|${signalId}`;

  return {
    slots: {
      [slotId]: {
        id: slotId,
        sentenceId: 'sent-1',
        anchorId: 'anchor-1',
        signalId,
        bundleId,
        crossLinkId: 'ra-cross-link|cl-1',
        slotKinds,
        toneFamily: opts.disagreement ? 'calm' : 'neutral_warm',
        intensity: opts.disagreement ? 'medium' : 'low',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  };
}

// ── v24 — Prompt Copy Selections ───────────────────────────────────────────

describe('buildPromptCopySelectionSummary (v24)', () => {
  it('creates one selection per tone slot', () => {
    const summary = buildPromptCopySelectionSummary(makeToneSlotSummary());
    expect(Object.keys(summary.selections)).toHaveLength(1);
  });

  it('assigns the expected selection id', () => {
    const toneSlotSummary = makeToneSlotSummary();
    const slotId = Object.keys(toneSlotSummary.slots)[0];
    const summary = buildPromptCopySelectionSummary(toneSlotSummary);
    expect(summary.selections[`ra-prompt-copy-selection|${slotId}`]).toBeDefined();
  });

  it('selects compare when soft_compare is present', () => {
    const summary = buildPromptCopySelectionSummary(makeToneSlotSummary({ disagreement: true }));
    const selection = Object.values(summary.selections)[0];
    expect(selection.selectedKind).toBe<ReadingAssistPromptCopySelectionKind>('compare');
  });

  it('selects peek when source_peek is present and no soft_compare', () => {
    const summary = buildPromptCopySelectionSummary(
      makeToneSlotSummary({ disagreement: false, sourceAvailable: true }),
    );
    const selection = Object.values(summary.selections)[0];
    expect(selection.selectedKind).toBe<ReadingAssistPromptCopySelectionKind>('peek');
  });

  it('selects invite when curious_invite is present and no higher-priority kinds', () => {
    const slotId = 'ra-prompt-tone-slot|sig-only-invite';
    const inviteOnlySlot: ReadingAssistPromptToneSlotSummary = {
      slots: {
        [slotId]: {
          id: slotId,
          sentenceId: 'sent-x',
          anchorId: 'anchor-x',
          signalId: 'sig-only-invite',
          bundleId: 'bundle-x',
          crossLinkId: 'cl-x',
          slotKinds: ['gentle_nudge', 'curious_invite'],
          toneFamily: 'neutral_warm',
          intensity: 'low',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
    };
    const summary = buildPromptCopySelectionSummary(inviteOnlySlot);
    const selection = Object.values(summary.selections)[0];
    expect(selection.selectedKind).toBe<ReadingAssistPromptCopySelectionKind>('invite');
  });

  it('selects nudge when only gentle_nudge is present', () => {
    const slotId = 'ra-prompt-tone-slot|sig-nudge-only';
    const nudgeOnlySlot: ReadingAssistPromptToneSlotSummary = {
      slots: {
        [slotId]: {
          id: slotId,
          sentenceId: 'sent-y',
          anchorId: 'anchor-y',
          signalId: 'sig-nudge-only',
          bundleId: 'bundle-y',
          crossLinkId: 'cl-y',
          slotKinds: ['gentle_nudge'],
          toneFamily: 'neutral_warm',
          intensity: 'low',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
    };
    const summary = buildPromptCopySelectionSummary(nudgeOnlySlot);
    const selection = Object.values(summary.selections)[0];
    expect(selection.selectedKind).toBe<ReadingAssistPromptCopySelectionKind>('nudge');
  });

  it('compare takes priority over peek when both are present', () => {
    const slotId = 'ra-prompt-tone-slot|sig-both';
    const bothSlot: ReadingAssistPromptToneSlotSummary = {
      slots: {
        [slotId]: {
          id: slotId,
          sentenceId: 'sent-z',
          anchorId: 'anchor-z',
          signalId: 'sig-both',
          bundleId: 'bundle-z',
          crossLinkId: 'cl-z',
          slotKinds: ['gentle_nudge', 'curious_invite', 'source_peek', 'soft_compare'],
          toneFamily: 'calm',
          intensity: 'medium',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
    };
    const summary = buildPromptCopySelectionSummary(bothSlot);
    const selection = Object.values(summary.selections)[0];
    expect(selection.selectedKind).toBe<ReadingAssistPromptCopySelectionKind>('compare');
  });

  it('sets copyKey to null (placeholder)', () => {
    const summary = buildPromptCopySelectionSummary(makeToneSlotSummary());
    const selection = Object.values(summary.selections)[0];
    expect(selection.copyKey).toBeNull();
  });

  it('preserves slot provenance fields', () => {
    const toneSlotSummary = makeToneSlotSummary();
    const slot = Object.values(toneSlotSummary.slots)[0];
    const summary = buildPromptCopySelectionSummary(toneSlotSummary);
    const selection = Object.values(summary.selections)[0];

    expect(selection.slotId).toBe(slot.id);
    expect(selection.signalId).toBe(slot.signalId);
    expect(selection.bundleId).toBe(slot.bundleId);
    expect(selection.crossLinkId).toBe(slot.crossLinkId);
    expect(selection.sentenceId).toBe(slot.sentenceId);
    expect(selection.anchorId).toBe(slot.anchorId);
  });

  it('returns an empty summary when there are no slots', () => {
    const summary = buildPromptCopySelectionSummary({ slots: {} });
    expect(Object.keys(summary.selections)).toHaveLength(0);
  });

  it('handles multiple slots independently', () => {
    const slot1Id = 'ra-prompt-tone-slot|sig-1';
    const slot2Id = 'ra-prompt-tone-slot|sig-2';

    const multiSlot: ReadingAssistPromptToneSlotSummary = {
      slots: {
        [slot1Id]: {
          id: slot1Id,
          sentenceId: 'sent-1',
          anchorId: 'anchor-1',
          signalId: 'sig-1',
          bundleId: 'bundle-1',
          crossLinkId: 'cl-1',
          slotKinds: ['gentle_nudge', 'curious_invite', 'source_peek'],
          toneFamily: 'neutral_warm',
          intensity: 'low',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        [slot2Id]: {
          id: slot2Id,
          sentenceId: 'sent-2',
          anchorId: 'anchor-2',
          signalId: 'sig-2',
          bundleId: 'bundle-2',
          crossLinkId: 'cl-2',
          slotKinds: ['gentle_nudge', 'curious_invite', 'source_peek', 'soft_compare'],
          toneFamily: 'calm',
          intensity: 'medium',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
    };

    const summary = buildPromptCopySelectionSummary(multiSlot);
    expect(Object.keys(summary.selections)).toHaveLength(2);

    const sel1 = summary.selections[`ra-prompt-copy-selection|${slot1Id}`];
    const sel2 = summary.selections[`ra-prompt-copy-selection|${slot2Id}`];

    expect(sel1.selectedKind).toBe('peek');
    expect(sel1.copyKey).toBeNull();

    expect(sel2.selectedKind).toBe('compare');
    expect(sel2.copyKey).toBeNull();
  });
});

// ── v24 — Type shape ───────────────────────────────────────────────────────

describe('ReadingAssistPromptCopySelection type shape', () => {
  it('constructs a valid selection with all required fields', () => {
    const selection: ReadingAssistPromptCopySelection = {
      id: 'ra-prompt-copy-selection|ra-prompt-tone-slot|sig-1',
      sentenceId: 'sent-1',
      anchorId: 'anchor-1',
      slotId: 'ra-prompt-tone-slot|sig-1',
      signalId: 'sig-1',
      bundleId: 'bundle-1',
      crossLinkId: 'cl-1',
      selectedKind: 'invite',
      copyKey: null,
      createdAt: '2024-01-01T00:00:00.000Z',
    };
    expect(selection.id).toContain('ra-prompt-copy-selection');
    expect(selection.selectedKind).toBe('invite');
    expect(selection.copyKey).toBeNull();
  });

  it('accepts all valid copy selection kind values', () => {
    const kinds: ReadingAssistPromptCopySelectionKind[] = ['nudge', 'invite', 'peek', 'compare'];
    expect(kinds).toHaveLength(4);
  });

  it('constructs a valid ReadingAssistPromptCopySelectionSummary', () => {
    const summary: ReadingAssistPromptCopySelectionSummary = { selections: {} };
    expect(summary.selections).toBeDefined();
    expect(Object.keys(summary.selections)).toHaveLength(0);
  });
});

// ── v25 helper ─────────────────────────────────────────────────────────────

function makeSelectionSummary(
  opts: { selectedKind?: ReadingAssistPromptCopySelectionKind } = {},
): ReadingAssistPromptCopySelectionSummary {
  const bundleId = 'ra-verification-bundle|ra-cross-link|cl-1';
  const signalId = `ra-curiosity-signal|${bundleId}`;
  const slotId = `ra-prompt-tone-slot|${signalId}`;
  const selectionId = `ra-prompt-copy-selection|${slotId}`;

  return {
    selections: {
      [selectionId]: {
        id: selectionId,
        sentenceId: 'sent-1',
        anchorId: 'anchor-1',
        slotId,
        signalId,
        bundleId,
        crossLinkId: 'ra-cross-link|cl-1',
        selectedKind: opts.selectedKind ?? 'invite',
        copyKey: null,
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  };
}

// ── v25 — Prompt Copy Library Records ─────────────────────────────────────

describe('buildPromptCopyLibraryRecordSummary (v25)', () => {
  it('creates one record per copy selection', () => {
    const summary = buildPromptCopyLibraryRecordSummary(makeSelectionSummary());
    expect(Object.keys(summary.records)).toHaveLength(1);
  });

  it('assigns the expected record id', () => {
    const selectionSummary = makeSelectionSummary();
    const selectionId = Object.keys(selectionSummary.selections)[0];
    const summary = buildPromptCopyLibraryRecordSummary(selectionSummary);
    expect(summary.records[`ra-prompt-copy-library-record|${selectionId}`]).toBeDefined();
  });

  it('sets libraryKey to null (placeholder)', () => {
    const summary = buildPromptCopyLibraryRecordSummary(makeSelectionSummary());
    const record = Object.values(summary.records)[0];
    expect(record.libraryKey).toBeNull();
  });

  it('sets text to null (placeholder)', () => {
    const summary = buildPromptCopyLibraryRecordSummary(makeSelectionSummary());
    const record = Object.values(summary.records)[0];
    expect(record.text).toBeNull();
  });

  it('initialises variantKeys as an empty array (placeholder)', () => {
    const summary = buildPromptCopyLibraryRecordSummary(makeSelectionSummary());
    const record = Object.values(summary.records)[0];
    expect(record.variantKeys).toEqual([]);
  });

  it('preserves selectedKind from the source selection', () => {
    for (const kind of ['nudge', 'invite', 'peek', 'compare'] as ReadingAssistPromptCopySelectionKind[]) {
      const summary = buildPromptCopyLibraryRecordSummary(makeSelectionSummary({ selectedKind: kind }));
      const record = Object.values(summary.records)[0];
      expect(record.selectedKind).toBe(kind);
    }
  });

  it('preserves selection provenance fields', () => {
    const selectionSummary = makeSelectionSummary();
    const selection = Object.values(selectionSummary.selections)[0];
    const summary = buildPromptCopyLibraryRecordSummary(selectionSummary);
    const record = Object.values(summary.records)[0];

    expect(record.selectionId).toBe(selection.id);
    expect(record.slotId).toBe(selection.slotId);
    expect(record.signalId).toBe(selection.signalId);
    expect(record.bundleId).toBe(selection.bundleId);
    expect(record.crossLinkId).toBe(selection.crossLinkId);
    expect(record.sentenceId).toBe(selection.sentenceId);
    expect(record.anchorId).toBe(selection.anchorId);
  });

  it('returns an empty summary when there are no selections', () => {
    const summary = buildPromptCopyLibraryRecordSummary({ selections: {} });
    expect(Object.keys(summary.records)).toHaveLength(0);
  });

  it('handles multiple selections independently', () => {
    const bundleId1 = 'ra-verification-bundle|ra-cross-link|cl-1';
    const bundleId2 = 'ra-verification-bundle|ra-cross-link|cl-2';
    const sig1 = `ra-curiosity-signal|${bundleId1}`;
    const sig2 = `ra-curiosity-signal|${bundleId2}`;
    const slot1 = `ra-prompt-tone-slot|${sig1}`;
    const slot2 = `ra-prompt-tone-slot|${sig2}`;
    const sel1 = `ra-prompt-copy-selection|${slot1}`;
    const sel2 = `ra-prompt-copy-selection|${slot2}`;

    const multiSelection: ReadingAssistPromptCopySelectionSummary = {
      selections: {
        [sel1]: {
          id: sel1,
          sentenceId: 'sent-1',
          anchorId: 'anchor-1',
          slotId: slot1,
          signalId: sig1,
          bundleId: bundleId1,
          crossLinkId: 'ra-cross-link|cl-1',
          selectedKind: 'peek',
          copyKey: null,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        [sel2]: {
          id: sel2,
          sentenceId: 'sent-2',
          anchorId: 'anchor-2',
          slotId: slot2,
          signalId: sig2,
          bundleId: bundleId2,
          crossLinkId: 'ra-cross-link|cl-2',
          selectedKind: 'compare',
          copyKey: null,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
    };

    const summary = buildPromptCopyLibraryRecordSummary(multiSelection);
    expect(Object.keys(summary.records)).toHaveLength(2);

    const rec1 = summary.records[`ra-prompt-copy-library-record|${sel1}`];
    const rec2 = summary.records[`ra-prompt-copy-library-record|${sel2}`];

    expect(rec1.selectedKind).toBe('peek');
    expect(rec1.libraryKey).toBeNull();
    expect(rec1.text).toBeNull();

    expect(rec2.selectedKind).toBe('compare');
    expect(rec2.libraryKey).toBeNull();
    expect(rec2.text).toBeNull();
  });
});

// ── v25 — Type shape ───────────────────────────────────────────────────────

describe('ReadingAssistPromptCopyLibraryRecord type shape', () => {
  it('constructs a valid record with all required fields', () => {
    const record: ReadingAssistPromptCopyLibraryRecord = {
      id: 'ra-prompt-copy-library-record|ra-prompt-copy-selection|sel-1',
      selectionId: 'ra-prompt-copy-selection|sel-1',
      sentenceId: 'sent-1',
      anchorId: 'anchor-1',
      slotId: 'ra-prompt-tone-slot|sig-1',
      signalId: 'sig-1',
      bundleId: 'bundle-1',
      crossLinkId: 'cl-1',
      selectedKind: 'nudge',
      libraryKey: null,
      variantKeys: [],
      text: null,
      createdAt: '2024-01-01T00:00:00.000Z',
    };
    expect(record.id).toContain('ra-prompt-copy-library-record');
    expect(record.libraryKey).toBeNull();
    expect(record.text).toBeNull();
    expect(record.variantKeys).toHaveLength(0);
  });

  it('constructs a valid ReadingAssistPromptCopyLibraryRecordSummary', () => {
    const summary: ReadingAssistPromptCopyLibraryRecordSummary = { records: {} };
    expect(summary.records).toBeDefined();
    expect(Object.keys(summary.records)).toHaveLength(0);
  });
});
