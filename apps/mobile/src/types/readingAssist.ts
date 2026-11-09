
export interface ReadingAssistHeuristicState {
  summary: {
    dwellByBlockId: Record<string, number>;
    dwellBySentenceId: Record<string, number>;
  };
}
export function reduceReadingAssistReadingPathSummary(
  prev: ReadingAssistReadingPathSummary,
  event: ReadingAssistEvent,
  heuristicState: ReadingAssistHeuristicState
): ReadingAssistReadingPathSummary {
  const next: ReadingAssistReadingPathSummary = {
    examinedBlockIds: [...prev.examinedBlockIds],
    examinedSentenceIds: [...prev.examinedSentenceIds],
    blocks: { ...prev.blocks },
    sentences: { ...prev.sentences },
    lastExaminedBlockId: prev.lastExaminedBlockId,
    lastExaminedSentenceId: prev.lastExaminedSentenceId,
  };

  // Helper: mirror dwell values
  function mirrorBlockDwell(blockId: string) {
    const dwell = heuristicState.summary?.dwellByBlockId?.[blockId] ?? 0;
    next.blocks[blockId].estimatedDwellMs = dwell;
  }
  function mirrorSentenceDwell(sentenceId: string) {
    const dwell = heuristicState.summary?.dwellBySentenceId?.[sentenceId] ?? 0;
    next.sentences[sentenceId].estimatedDwellMs = dwell;
  }

  switch (event.type) {
    case 'block_focus_set': {
      const blockId = event.blockId;
      if (blockId) {
        if (!next.examinedBlockIds.includes(blockId)) {
          next.examinedBlockIds.push(blockId);
        }
        if (!next.blocks[blockId]) {
          next.blocks[blockId] = {
            blockId,
            firstSeenAt: event.timestamp,
            lastSeenAt: event.timestamp,
            estimatedDwellMs: 0,
            focusCount: 1,
            examinedSentenceIds: [],
          };
        } else {
          const block = { ...next.blocks[blockId] };
          block.focusCount++;
          if (block.firstSeenAt == null) block.firstSeenAt = event.timestamp;
          block.lastSeenAt = event.timestamp;
          next.blocks[blockId] = block;
        }
        mirrorBlockDwell(blockId);
        next.lastExaminedBlockId = blockId;
      }
      break;
    }
    case 'sentence_focus_set': {
      const sentenceId = event.sentenceId;
      const blockId = event.blockId ?? null;
      if (sentenceId) {
        if (!next.examinedSentenceIds.includes(sentenceId)) {
          next.examinedSentenceIds.push(sentenceId);
        }
        if (!next.sentences[sentenceId]) {
          next.sentences[sentenceId] = {
            sentenceId,
            blockId,
            firstSeenAt: event.timestamp,
            lastSeenAt: event.timestamp,
            estimatedDwellMs: 0,
            focusCount: 1,
            progressedToCount: 0,
            progressedFromCount: 0,
          };
        } else {
          const sentence = { ...next.sentences[sentenceId] };
          sentence.focusCount++;
          if (sentence.firstSeenAt == null) sentence.firstSeenAt = event.timestamp;
          sentence.lastSeenAt = event.timestamp;
          next.sentences[sentenceId] = sentence;
        }
        mirrorSentenceDwell(sentenceId);
        next.lastExaminedSentenceId = sentenceId;
      }
      if (blockId) {
        if (!next.blocks[blockId]) {
          next.blocks[blockId] = {
            blockId,
            firstSeenAt: null,
            lastSeenAt: null,
            estimatedDwellMs: 0,
            focusCount: 0,
            examinedSentenceIds: [],
          };
        }
        if (sentenceId && !next.blocks[blockId].examinedSentenceIds.includes(sentenceId)) {
          next.blocks[blockId].examinedSentenceIds.push(sentenceId);
        }
        mirrorBlockDwell(blockId);
      }
      break;
    }
    case 'sentence_progress_next':
    case 'sentence_progress_previous': {
      const sentenceId = event.sentenceId;
      if (sentenceId) {
        if (!next.sentences[sentenceId]) {
          next.sentences[sentenceId] = {
            sentenceId,
            blockId: null,
            firstSeenAt: null,
            lastSeenAt: null,
            estimatedDwellMs: 0,
            focusCount: 0,
            progressedToCount: 1,
            progressedFromCount: 0,
          };
        } else {
          const sentence = { ...next.sentences[sentenceId] };
          sentence.progressedToCount++;
          next.sentences[sentenceId] = sentence;
        }
        mirrorSentenceDwell(sentenceId);
      }
      const prevSentenceId = prev.lastExaminedSentenceId;
      if (sentenceId) {
        // Update lastExaminedSentenceId before incrementing progressedFromCount
        next.lastExaminedSentenceId = sentenceId;
      }
      if (
        prevSentenceId &&
        prevSentenceId !== sentenceId &&
        prev.examinedSentenceIds.includes(prevSentenceId) &&
        next.sentences[prevSentenceId]
      ) {
        const prevSentence = { ...next.sentences[prevSentenceId] };
        prevSentence.progressedFromCount++;
        next.sentences[prevSentenceId] = prevSentence;
        mirrorSentenceDwell(prevSentenceId);
      }
      break;
    }
    default:
      // no-op
      break;
  }
  return next;
}
export interface ReadingAssistExaminedSentence {
  sentenceId: string;
  blockId: string | null;
  firstSeenAt: number | null;
  lastSeenAt: number | null;
  estimatedDwellMs: number;
  focusCount: number;
  progressedToCount: number;
  progressedFromCount: number;
}

export interface ReadingAssistExaminedBlock {
  blockId: string;
  firstSeenAt: number | null;
  lastSeenAt: number | null;
  estimatedDwellMs: number;
  focusCount: number;
  examinedSentenceIds: string[];
}

export interface ReadingAssistReadingPathSummary {
  examinedBlockIds: string[];
  examinedSentenceIds: string[];
  blocks: Record<string, ReadingAssistExaminedBlock>;
  sentences: Record<string, ReadingAssistExaminedSentence>;
  lastExaminedBlockId: string | null;
  lastExaminedSentenceId: string | null;
}

export const DEFAULT_READING_ASSIST_READING_PATH_SUMMARY: ReadingAssistReadingPathSummary = {
  examinedBlockIds: [],
  examinedSentenceIds: [],
  blocks: {},
  sentences: {},
  lastExaminedBlockId: null,
  lastExaminedSentenceId: null,
};
export function reduceReadingAssistSessionSummary(
  prev: ReadingAssistSessionSummary,
  event: ReadingAssistEvent
): ReadingAssistSessionSummary {
  const next: ReadingAssistSessionSummary = {
    ...prev,
    startedAt: prev.startedAt == null ? event.timestamp : prev.startedAt,
    endedAt: event.timestamp,
    sourceType: event.sourceType != null ? event.sourceType : prev.sourceType,
    focusedBlockIds: prev.focusedBlockIds.slice(),
    focusedSentenceIds: prev.focusedSentenceIds.slice(),
    blockFocusCount: prev.blockFocusCount,
    sentenceFocusCount: prev.sentenceFocusCount,
    sentenceProgressNextCount: prev.sentenceProgressNextCount,
    sentenceProgressPreviousCount: prev.sentenceProgressPreviousCount,
    lastBlockId: prev.lastBlockId,
    lastSentenceId: prev.lastSentenceId,
  };

  switch (event.type) {
    case 'block_focus_set':
      if (event.blockId && !next.focusedBlockIds.includes(event.blockId)) {
        next.focusedBlockIds.push(event.blockId);
      }
      next.blockFocusCount++;
      if (event.blockId) {
        next.lastBlockId = event.blockId;
      }
      break;
    case 'block_focus_cleared':
      next.lastBlockId = null;
      break;
    case 'sentence_focus_set':
      if (event.sentenceId && !next.focusedSentenceIds.includes(event.sentenceId)) {
        next.focusedSentenceIds.push(event.sentenceId);
      }
      next.sentenceFocusCount++;
      if (event.sentenceId) {
        next.lastSentenceId = event.sentenceId;
      }
      break;
    case 'sentence_focus_cleared':
      next.lastSentenceId = null;
      break;
    case 'sentence_progress_next':
      next.sentenceProgressNextCount++;
      break;
    case 'sentence_progress_previous':
      next.sentenceProgressPreviousCount++;
      break;
    default:
      // no-op
      break;
  }
  return next;
}
export const DEFAULT_READING_ASSIST_SESSION_SUMMARY: ReadingAssistSessionSummary = {
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
};
// Reading Assist types


export type ReadingAssistSourceType = 'article' | 'study' | 'other' | null;

export interface ReadingAssistEvent {
  type:
    | 'block_focus_set'
    | 'block_focus_cleared'
    | 'sentence_focus_set'
    | 'sentence_focus_cleared'
    | 'sentence_progress_next'
    | 'sentence_progress_previous';
  timestamp: number;
  sourceType?: ReadingAssistSourceType | null;
  blockId?: string | null;
  sentenceId?: string | null;
}

export interface ReadingAssistSessionSummary {
  sourceType: ReadingAssistSourceType | null;
  startedAt: number | null;
  endedAt: number | null;
  focusedBlockIds: string[];
  focusedSentenceIds: string[];
  blockFocusCount: number;
  sentenceFocusCount: number;
  sentenceProgressNextCount: number;
  sentenceProgressPreviousCount: number;
  lastBlockId: string | null;
  lastSentenceId: string | null;
}
