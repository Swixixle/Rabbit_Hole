/**
 * Reading-Assist Groundwork v1/v8: context for focus-block mode and focus event spine.
 */
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  DEFAULT_READING_ASSIST_STATE,
  DEFAULT_READING_ASSIST_SESSION_SUMMARY,
  DEFAULT_READING_ASSIST_HEURISTIC_STATE,
  DEFAULT_READING_ASSIST_READING_PATH_SUMMARY,
  isBlockFocused,
  isReadingFocusActive,
  isAnyBlockFocused,
  isSentenceFocused,
  isAnySentenceFocused,
  reduceReadingAssistSessionSummary,
  reduceReadingAssistHeuristicState,
  reduceReadingAssistReadingPathSummary,
} from "../types/readingAssist";
import type {
  ReadingAssistMode,
  ReadingAssistSourceType,
  ReadingAssistState,
  ReadingAssistEvent,
  ReadingAssistSessionSummary,
  ReadingAssistHeuristicSummary,
  ReadingAssistReadingPathSummary,
} from "../types/readingAssist";

interface ReadingAssistContextValue extends ReadingAssistState {
  setMode: (mode: ReadingAssistMode) => void;
  setFocus: (blockId: string | null, sourceType: ReadingAssistSourceType | null) => void;
  clearFocus: () => void;
  setSentenceFocus: (sentenceId: string) => void;
  clearSentenceFocus: () => void;
  isBlockFocused: (blockId: string, sourceType: ReadingAssistSourceType) => boolean;
  isSentenceFocused: (sentenceId: string, blockId: string, sourceType: ReadingAssistSourceType) => boolean;
  isFocusActive: boolean;
  isAnyBlockFocused: boolean;
  isAnySentenceFocused: boolean;
  /** v8: optional callback to emit focus events. Exposed so consumers can emit progression events. */
  onReadingAssistEvent?: (event: ReadingAssistEvent) => void;
  /** v9: derived session summary from the event spine. */
  sessionSummary: ReadingAssistSessionSummary;
  resetSessionSummary: () => void;
  /** v10: derived dwell and backtrack heuristics. Observational only. */
  heuristicSummary: ReadingAssistHeuristicSummary;
  resetHeuristicSummary: () => void;
  /** v11: verification-aware reading path summary. Observational only. */
  readingPathSummary: ReadingAssistReadingPathSummary;
  resetReadingPathSummary: () => void;
}

const ReadingAssistContext = createContext<ReadingAssistContextValue | null>(null);

function createEvent(
  type: ReadingAssistEvent["type"],
  payload: { sourceType?: ReadingAssistSourceType | null; blockId?: string | null; sentenceId?: string | null }
): ReadingAssistEvent {
  return {
    type,
    timestamp: Date.now(),
    sourceType: payload.sourceType ?? null,
    blockId: payload.blockId ?? null,
    sentenceId: payload.sentenceId ?? null,
  };
}

export function ReadingAssistProvider({
  children,
  onReadingAssistEvent,
}: {
  children: React.ReactNode;
  onReadingAssistEvent?: (event: ReadingAssistEvent) => void;
}) {
  const [state, setState] = useState<ReadingAssistState>(DEFAULT_READING_ASSIST_STATE);
  const [sessionSummary, setSessionSummary] = useState<ReadingAssistSessionSummary>(
    DEFAULT_READING_ASSIST_SESSION_SUMMARY
  );
  const [heuristicState, setHeuristicState] = useState(DEFAULT_READING_ASSIST_HEURISTIC_STATE);
  const [readingPathSummary, setReadingPathSummary] = useState<ReadingAssistReadingPathSummary>(
    DEFAULT_READING_ASSIST_READING_PATH_SUMMARY
  );
  const onEventRef = useRef(onReadingAssistEvent);
  onEventRef.current = onReadingAssistEvent;
  const emit = useCallback((event: ReadingAssistEvent) => {
    setSessionSummary((prev) => reduceReadingAssistSessionSummary(prev, event));
    const nextHeuristic = reduceReadingAssistHeuristicState(heuristicState, event);
    setHeuristicState(nextHeuristic);
    setReadingPathSummary((prev) =>
      reduceReadingAssistReadingPathSummary(prev, event, nextHeuristic)
    );
    onEventRef.current?.(event);
  }, [heuristicState]);

  const resetSessionSummary = useCallback(() => {
    setSessionSummary(DEFAULT_READING_ASSIST_SESSION_SUMMARY);
  }, []);

  const resetHeuristicSummary = useCallback(() => {
    setHeuristicState(DEFAULT_READING_ASSIST_HEURISTIC_STATE);
  }, []);

  const resetReadingPathSummary = useCallback(() => {
    setReadingPathSummary(DEFAULT_READING_ASSIST_READING_PATH_SUMMARY);
  }, []);

  const setMode = useCallback((mode: ReadingAssistMode) => {
    setState((prev) => ({
      ...prev,
      mode,
      ...(mode === "off"
        ? { focusedBlockId: null, focusedSentenceId: null, sourceType: null }
        : {}),
    }));
  }, []);

  const setFocus = useCallback(
    (blockId: string | null, sourceType: ReadingAssistSourceType | null) => {
      setState((prev) => ({
        ...prev,
        focusedBlockId: blockId,
        sourceType,
        focusedSentenceId: null,
        ...(prev.mode === "off" && blockId ? { mode: "focus_block" as const } : {}),
      }));
      if (blockId != null) {
        emit(createEvent("block_focus_set", { sourceType, blockId, sentenceId: null }));
      } else {
        emit(createEvent("block_focus_cleared", { sourceType: null, blockId: null, sentenceId: null }));
      }
    },
    [emit]
  );

  const clearFocus = useCallback(() => {
    setState((prev) => ({
      ...prev,
      focusedBlockId: null,
      focusedSentenceId: null,
      sourceType: null,
    }));
    emit(createEvent("block_focus_cleared", { sourceType: null, blockId: null, sentenceId: null }));
  }, [emit]);

  const setSentenceFocus = useCallback(
    (sentenceId: string) => {
      setState((prev) => {
        if (prev.mode !== "focus_block" || prev.focusedBlockId == null) return prev;
        emit(
          createEvent("sentence_focus_set", {
            sourceType: prev.sourceType,
            blockId: prev.focusedBlockId,
            sentenceId,
          })
        );
        return { ...prev, focusedSentenceId: sentenceId };
      });
    },
    [emit]
  );

  const clearSentenceFocus = useCallback(() => {
    setState((prev) => {
      if (prev.focusedSentenceId != null) {
        emit(
          createEvent("sentence_focus_cleared", {
            sourceType: prev.sourceType,
            blockId: prev.focusedBlockId,
            sentenceId: null,
          })
        );
      }
      return { ...prev, focusedSentenceId: null };
    });
  }, [emit]);

  const isBlockFocusedFn = useCallback(
    (blockId: string, sourceType: ReadingAssistSourceType) =>
      isBlockFocused(state, blockId, sourceType),
    [state.focusedBlockId, state.sourceType, state.mode]
  );

  const isSentenceFocusedFn = useCallback(
    (sentenceId: string, blockId: string, sourceType: ReadingAssistSourceType) =>
      isSentenceFocused(state, sentenceId, blockId, sourceType),
    [state.focusedBlockId, state.focusedSentenceId, state.sourceType, state.mode]
  );

  const value: ReadingAssistContextValue = {
    ...state,
    setMode,
    setFocus,
    clearFocus,
    setSentenceFocus,
    clearSentenceFocus,
    isBlockFocused: isBlockFocusedFn,
    isSentenceFocused: isSentenceFocusedFn,
    isFocusActive: isReadingFocusActive(state),
    isAnyBlockFocused: isAnyBlockFocused(state),
    isAnySentenceFocused: isAnySentenceFocused(state),
    onReadingAssistEvent: onReadingAssistEvent ?? undefined,
    sessionSummary,
    resetSessionSummary,
    heuristicSummary: heuristicState.summary,
    resetHeuristicSummary,
    readingPathSummary,
    resetReadingPathSummary,
  };

  return (
    <ReadingAssistContext.Provider value={value}>
      {children}
    </ReadingAssistContext.Provider>
  );
}

export function useReadingAssist(): ReadingAssistContextValue | null {
  return useContext(ReadingAssistContext);
}
