import {
  ReadingAssistReadingPathSummary,
  DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
  reduceReadingAssistReadingPathSummary,
} from '../types/readingAssist';

const mockHeuristicState = {
  summary: {
    dwellByBlockId: { b1: 1234, b2: 5678 },
    dwellBySentenceId: { s1: 111, s2: 222 },
  },
};

describe('ReadingAssistReadingPathSummary', () => {
  it('default summary shape', () => {
    expect(DEFAULT_READING_ASSIST_READING_PATH_SUMMARY).toEqual({
      examinedBlockIds: [],
      examinedSentenceIds: [],
      blocks: {},
      sentences: {},
      lastExaminedBlockId: null,
      lastExaminedSentenceId: null,
    });
  });

  it('block_focus_set creates block record, increments focusCount, no duplicate ids', () => {
    let summary = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    summary = reduceReadingAssistReadingPathSummary(summary, { type: 'block_focus_set', timestamp: 100, blockId: 'b1' } as const, mockHeuristicState);
    expect(summary.examinedBlockIds).toEqual(['b1']);
    expect(summary.blocks['b1']).toBeDefined();
    expect(summary.blocks['b1'].focusCount).toBe(1);
    summary = reduceReadingAssistReadingPathSummary(summary, { type: 'block_focus_set', timestamp: 110, blockId: 'b1' } as const, mockHeuristicState);
    expect(summary.examinedBlockIds).toEqual(['b1']);
    expect(summary.blocks['b1'].focusCount).toBe(2);
  });

  it('sentence_focus_set creates sentence record, increments focusCount, links into block', () => {
    let summary = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    summary = reduceReadingAssistReadingPathSummary(summary, { type: 'sentence_focus_set', timestamp: 100, sentenceId: 's1', blockId: 'b1' } as const, mockHeuristicState);
    expect(summary.examinedSentenceIds).toEqual(['s1']);
    expect(summary.sentences['s1']).toBeDefined();
    expect(summary.sentences['s1'].focusCount).toBe(1);
    expect(summary.blocks['b1']).toBeDefined();
    expect(summary.blocks['b1'].examinedSentenceIds).toEqual(['s1']);
    summary = reduceReadingAssistReadingPathSummary(summary, { type: 'sentence_focus_set', timestamp: 110, sentenceId: 's1', blockId: 'b1' } as const, mockHeuristicState);
    expect(summary.examinedSentenceIds).toEqual(['s1']);
    expect(summary.sentences['s1'].focusCount).toBe(2);
    expect(summary.blocks['b1'].examinedSentenceIds).toEqual(['s1']);
  });

  it('progression: destination increments progressedToCount, previous increments progressedFromCount', () => {
    let summary = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    summary = reduceReadingAssistReadingPathSummary(summary, { type: 'sentence_focus_set', timestamp: 100, sentenceId: 's1', blockId: 'b1' } as const, mockHeuristicState);
    summary = reduceReadingAssistReadingPathSummary(summary, { type: 'sentence_focus_set', timestamp: 110, sentenceId: 's2', blockId: 'b1' } as const, mockHeuristicState);
    summary = reduceReadingAssistReadingPathSummary(summary, { type: 'sentence_progress_next', timestamp: 120, sentenceId: 's2' } as const, mockHeuristicState);
    expect(summary.sentences['s2'].progressedToCount).toBe(1);
    expect(summary.sentences['s1'].progressedFromCount).toBe(1);
    summary = reduceReadingAssistReadingPathSummary(summary, { type: 'sentence_progress_previous', timestamp: 130, sentenceId: 's1' } as const, mockHeuristicState);
    expect(summary.sentences['s1'].progressedToCount).toBe(1);
    expect(summary.sentences['s2'].progressedFromCount).toBe(1);
  });

  it('dwell mirroring: dwell values copied from heuristic summary', () => {
    let summary = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    summary = reduceReadingAssistReadingPathSummary(summary, { type: 'block_focus_set', timestamp: 100, blockId: 'b1' } as const, mockHeuristicState);
    expect(summary.blocks['b1'].estimatedDwellMs).toBe(1234);
    summary = reduceReadingAssistReadingPathSummary(summary, { type: 'sentence_focus_set', timestamp: 110, sentenceId: 's1', blockId: 'b1' } as const, mockHeuristicState);
    expect(summary.sentences['s1'].estimatedDwellMs).toBe(111);
  });

  it('safe behavior: null or missing ids do not crash, duplicate focus handled safely', () => {
    let summary = DEFAULT_READING_ASSIST_READING_PATH_SUMMARY;
    summary = reduceReadingAssistReadingPathSummary(summary, { type: 'block_focus_set', timestamp: 100 } as const, mockHeuristicState);
    summary = reduceReadingAssistReadingPathSummary(summary, { type: 'sentence_focus_set', timestamp: 110 } as const, mockHeuristicState);
    expect(summary.examinedBlockIds).toEqual([]);
    expect(summary.examinedSentenceIds).toEqual([]);
    summary = reduceReadingAssistReadingPathSummary(summary, { type: 'block_focus_set', timestamp: 120, blockId: 'b1' } as const, mockHeuristicState);
    summary = reduceReadingAssistReadingPathSummary(summary, { type: 'block_focus_set', timestamp: 130, blockId: 'b1' } as const, mockHeuristicState);
    expect(summary.blocks['b1'].focusCount).toBe(2);
  });

  it('reset/default summary shape', () => {
    expect(DEFAULT_READING_ASSIST_READING_PATH_SUMMARY).toEqual({
      examinedBlockIds: [],
      examinedSentenceIds: [],
      blocks: {},
      sentences: {},
      lastExaminedBlockId: null,
      lastExaminedSentenceId: null,
    });
  });
});
import {
  ReadingAssistSessionSummary,
  DEFAULT_READING_ASSIST_SESSION_SUMMARY,
  reduceReadingAssistSessionSummary
} from '../types/readingAssist';

// Minimal mock ReadingAssistEvent and ReadingAssistSourceType
const mockSourceType = 'article';


describe('ReadingAssistSessionSummary', () => {
  it('default summary shape', () => {
    expect(DEFAULT_READING_ASSIST_SESSION_SUMMARY).toEqual({
      sourceType: null,
      startedAt: null,
      endedAt: null,
      focusedBlockIds: [],
      focusedSentenceIds: [],
      blockFocusCount: 0,
      sentenceFocusCount: 0,
      sentenceProgressNextCount: 0,
      sentenceProgressPreviousCount: 0,
      lastBlockId: null,
      lastSentenceId: null,
    });
  });

  it('first event sets startedAt', () => {
    const event = { type: 'block_focus_set' as const, timestamp: 100 };
    const summary = reduceReadingAssistSessionSummary(DEFAULT_READING_ASSIST_SESSION_SUMMARY, event);
    expect(summary.startedAt).toBe(100);
  });

  it('every event updates endedAt', () => {
    let summary = DEFAULT_READING_ASSIST_SESSION_SUMMARY;
    summary = reduceReadingAssistSessionSummary(summary, { type: 'block_focus_set', timestamp: 100 } as const);
    summary = reduceReadingAssistSessionSummary(summary, { type: 'sentence_focus_set', timestamp: 200 } as const);
    expect(summary.endedAt).toBe(200);
  });

  it('block_focus_set increments count and deduplicates ids', () => {
    let summary = DEFAULT_READING_ASSIST_SESSION_SUMMARY;
    summary = reduceReadingAssistSessionSummary(summary, { type: 'block_focus_set', timestamp: 100, blockId: 'b1' } as const);
    summary = reduceReadingAssistSessionSummary(summary, { type: 'block_focus_set', timestamp: 110, blockId: 'b2' } as const);
    expect(summary.blockFocusCount).toBe(2);
    expect(summary.focusedBlockIds).toEqual(['b1', 'b2']);
  });

  it('duplicate block focus increments count but does not duplicate id', () => {
    let summary = DEFAULT_READING_ASSIST_SESSION_SUMMARY;
    summary = reduceReadingAssistSessionSummary(summary, { type: 'block_focus_set', timestamp: 100, blockId: 'b1' } as const);
    summary = reduceReadingAssistSessionSummary(summary, { type: 'block_focus_set', timestamp: 110, blockId: 'b1' } as const);
    expect(summary.blockFocusCount).toBe(2);
    expect(summary.focusedBlockIds).toEqual(['b1']);
  });

  it('sentence_focus_set increments count and deduplicates ids', () => {
    let summary = DEFAULT_READING_ASSIST_SESSION_SUMMARY;
    summary = reduceReadingAssistSessionSummary(summary, { type: 'sentence_focus_set', timestamp: 100, sentenceId: 's1' } as const);
    summary = reduceReadingAssistSessionSummary(summary, { type: 'sentence_focus_set', timestamp: 110, sentenceId: 's2' } as const);
    expect(summary.sentenceFocusCount).toBe(2);
    expect(summary.focusedSentenceIds).toEqual(['s1', 's2']);
  });

  it('sentence_progress_next increments next count', () => {
    let summary = DEFAULT_READING_ASSIST_SESSION_SUMMARY;
    summary = reduceReadingAssistSessionSummary(summary, { type: 'sentence_progress_next', timestamp: 100 } as const);
    summary = reduceReadingAssistSessionSummary(summary, { type: 'sentence_progress_next', timestamp: 110 } as const);
    expect(summary.sentenceProgressNextCount).toBe(2);
  });

  it('sentence_progress_previous increments previous count', () => {
    let summary = DEFAULT_READING_ASSIST_SESSION_SUMMARY;
    summary = reduceReadingAssistSessionSummary(summary, { type: 'sentence_progress_previous', timestamp: 100 } as const);
    summary = reduceReadingAssistSessionSummary(summary, { type: 'sentence_progress_previous', timestamp: 110 } as const);
    expect(summary.sentenceProgressPreviousCount).toBe(2);
  });

  it('latest non-null sourceType wins', () => {
    let summary = DEFAULT_READING_ASSIST_SESSION_SUMMARY;
    summary = reduceReadingAssistSessionSummary(summary, { type: 'block_focus_set', timestamp: 100, sourceType: null } as const);
    summary = reduceReadingAssistSessionSummary(summary, { type: 'block_focus_set', timestamp: 110, sourceType: mockSourceType } as const);
    expect(summary.sourceType).toBe(mockSourceType);
  });

  it('lastBlockId updates correctly and clears on block_focus_cleared', () => {
    let summary = DEFAULT_READING_ASSIST_SESSION_SUMMARY;
    summary = reduceReadingAssistSessionSummary(summary, { type: 'block_focus_set', timestamp: 100, blockId: 'b1' } as const);
    expect(summary.lastBlockId).toBe('b1');
    summary = reduceReadingAssistSessionSummary(summary, { type: 'block_focus_cleared', timestamp: 110 } as const);
    expect(summary.lastBlockId).toBeNull();
  });

  it('lastSentenceId updates correctly and clears on sentence_focus_cleared', () => {
    let summary = DEFAULT_READING_ASSIST_SESSION_SUMMARY;
    summary = reduceReadingAssistSessionSummary(summary, { type: 'sentence_focus_set', timestamp: 100, sentenceId: 's1' } as const);
    expect(summary.lastSentenceId).toBe('s1');
    summary = reduceReadingAssistSessionSummary(summary, { type: 'sentence_focus_cleared', timestamp: 110 } as const);
    expect(summary.lastSentenceId).toBeNull();
  });
});
