import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, Share, Linking, Dimensions } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { Article, ArticleBlock, Claim, Question, ArticleExperience, ExperienceStep, MediaInterpretation, VerificationResponse } from "@rabbit-hole/contracts";
import type { ArticleStudyGuide } from "../types/study";
import { ReadingAssistProvider, useReadingAssist } from "../context/ReadingAssistContext";
import { getSentenceAnchorsForBlock, getFocusedSentenceText, getSentenceProgressionState, getReadingAssistScrollTarget, getAdjacentSentenceIds } from "../types/readingAssist";
import type { ReadingAssistEvent } from "../types/readingAssist";
import { ReadingAssistSentenceBand } from "../components/ReadingAssistSentenceBand";
import { ClaimTypeBadge } from "../components/ClaimTypeBadge";
import { MicroParagraphCard } from "../components/MicroParagraphCard";
import { ExperienceStepper } from "../components/ExperienceStepper";
import { FocusZoneReader } from "../components/FocusZoneReader";
import { LoadingStateBlock } from "../components/LoadingStateBlock";
import { ErrorStateBlock } from "../components/ErrorStateBlock";
import { QuestionCard } from "../components/QuestionCard";
import { NodeChip } from "../components/NodeChip";
import { MarketSheet } from "../components/MarketSheet";
import { StudySheet } from "../components/StudySheet";
import { ClipExportView } from "../components/ClipExportView";
import { api } from "../api/client";
import {
  confidenceGlyph,
  getClaimConfidence,
  getClaimSupport,
  getConfidenceLabel,
  getSupportLabel,
} from "../utils/confidenceDisplay";
import { getSupportStatusLabel } from "../utils/supportStatusLabels";
import { buildArticleSharePayload, formatShareMessage } from "../utils/shareArticle";
import { getArticleClipPlan } from "../utils/clipPlan";
import { captureAndShareClipView } from "../utils/clipExport";
import { getMarketItemAction } from "../utils/marketResolution";
import { addHistoryEntry } from "../utils/historyStore";
import { trackEvent } from "../utils/analytics";
import { VerifySheet } from "./VerifySheet";
import { OrganizationProfileSheet } from "../components/OrganizationProfileSheet";

type ArticleParams = { articleId: string; mediaInterpretation?: MediaInterpretation };

export function ArticleScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as ArticleParams | undefined;
  const articleId = params?.articleId;
  const mediaInterpretation = params?.mediaInterpretation;
  const [article, setArticle] = useState<Article | null>(null);
  const [claims, setClaims] = useState<Record<string, Claim>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimModal, setClaimModal] = useState<Claim | null>(null);
  const [verifyVisible, setVerifyVisible] = useState(false);
  const [verifyInitialBundle, setVerifyInitialBundle] = useState<VerificationResponse | null>(null);
  const [hideLowConfidence, setHideLowConfidence] = useState(false);
  const [readMode, setReadMode] = useState<'read' | 'follow_system'>('read');
  const [highlightedStepId, setHighlightedStepId] = useState<string | null>(null);
  const [market, setMarket] = useState<import("@rabbit-hole/contracts").ArticleMarket | null>(null);
  const [marketVisible, setMarketVisible] = useState(false);
  const [study, setStudy] = useState<ArticleStudyGuide | null>(null);
  const [studyVisible, setStudyVisible] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [clipShareVisible, setClipShareVisible] = useState(false);
  const [clipExporting, setClipExporting] = useState(false);
  const [clipExportError, setClipExportError] = useState<string | null>(null);
  const clipCaptureRef = useRef<View | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const readerScrollRef = useRef<ScrollView>(null);
  const [blockOffsets, setBlockOffsets] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!articleId) return;
    let cancelled = false;
    (async () => {
      try {
        const a = await api.getArticle(articleId);
        if (cancelled) return;
        setArticle(a);
        const claimIds = new Set<string>();
        (a.blocks || []).forEach((b) => (b.claimIds || []).forEach((id) => claimIds.add(id)));
        const claimMap: Record<string, Claim> = {};
        for (const id of claimIds) {
          try {
            const c = await api.getClaim(id);
            claimMap[id] = c;
          } catch (_) {}
        }
        setClaims(claimMap);
        const qRes = await api.getArticleQuestions(articleId);
        setQuestions(qRes.questions || []);
        api.getArticleMarket(articleId).then(setMarket).catch(() => setMarket(null));
        api.getArticleStudy(articleId).then(setStudy).catch(() => setStudy(null));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load article");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [articleId]);

  if (!articleId) return null;
  if (loading) return <LoadingStateBlock message="Loading article…" />;
  if (error) return <ErrorStateBlock message={error} onRetry={() => { setError(null); setLoading(true); }} />;
  if (!article) return null;

  const claimList = Object.values(claims);
  const blocks = article.blocks || [];
  const identificationBlock = blocks.find((b) => b.blockType === "identification");
  const contentBlocks = blocks.filter((b) => b.blockType !== "identification");
  const openTrace = () => navigation.navigate("TracePreview" as never, { nodeId: article.nodeId } as never);
  const handleReadingAssistEvent = useCallback((event: ReadingAssistEvent) => {
    if (__DEV__) console.debug("ReadingAssist", event);
  }, []);
  const openRelated = (nodeId: string) =>
    api.getArticleByNode(nodeId).then((a) => {
      trackEvent("article_opened", { source: "direct", articleId: a.id });
      addHistoryEntry({
        articleId: a.id,
        title: a.title,
        subtitle: a.blocks?.find((b) => b.blockType === "identification")?.text,
        source: "direct",
      });
      navigation.navigate("Article" as never, { articleId: a.id } as never);
    });

  const handleMarketItemPress = (item: import("@rabbit-hole/contracts").MarketItem) => {
    const action = getMarketItemAction(item);
    if (!action) return;
    const destType = item.destinationType ?? "unknown";
    trackEvent("market_item_selected", { destinationType: destType });
    if (action.type === "external") {
      Linking.openURL(action.url).catch(() => {});
      return;
    }
    setMarketVisible(false);
    if (action.type === "search") {
      (navigation as any).navigate("Home", { initialSearchQuery: action.query });
      return;
    }
    if (action.type === "internal") {
      trackEvent("article_opened", { source: "market", articleId: action.articleId });
      addHistoryEntry({ articleId: action.articleId, title: "", source: "market" });
      (navigation as any).navigate("Article", { articleId: action.articleId });
    }
  };

  const experience = article.experience;
  const handleStepPress = (step: ExperienceStep) => {
    setHighlightedStepId(step.id);
    const ids = step.relatedBlockIds || [];
    const firstIndex = ids.length ? parseInt(ids[0], 10) : 0;
    const y = blockOffsets[firstIndex];
    if (y != null && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, y - 16), animated: true });
    }
  };

  const handleShare = () => {
    const payload = buildArticleSharePayload(article);
    Share.share({
      message: formatShareMessage(payload),
      title: payload.title,
    });
  };

  const handleShareClip = () => {
    setClipExportError(null);
    setClipShareVisible(true);
  };

  const handleCaptureAndShareClip = async () => {
    setClipExportError(null);
    setClipExporting(true);
    const result = await captureAndShareClipView(clipCaptureRef, {
      title: article.title,
      message: article.title,
    });
    setClipExporting(false);
    if (result === "shared") {
      setClipShareVisible(false);
    } else if (result === "error") {
      setClipExportError("Could not create clip. Try again.");
    }
  };

  return (
    <ReadingAssistProvider onReadingAssistEvent={handleReadingAssistEvent}>
      <ArticleScreenBody
        article={article}
        articleId={articleId}
        claims={claims}
        questions={questions}
        market={market}
        study={study}
        mediaInterpretation={mediaInterpretation}
        readMode={readMode}
        setReadMode={setReadMode}
        hideLowConfidence={hideLowConfidence}
        setHideLowConfidence={setHideLowConfidence}
        experience={experience}
        highlightedStepId={highlightedStepId}
        setHighlightedStepId={setHighlightedStepId}
        blockOffsets={blockOffsets}
        setBlockOffsets={setBlockOffsets}
        readerScrollRef={readerScrollRef}
        handleStepPress={handleStepPress}
        handleShare={handleShare}
        handleShareClip={handleShareClip}
        handleCaptureAndShareClip={handleCaptureAndShareClip}
        handleMarketItemPress={handleMarketItemPress}
        openTrace={openTrace}
        openRelated={openRelated}
        setClaimModal={setClaimModal}
        setVerifyVisible={setVerifyVisible}
        setVerifyInitialBundle={setVerifyInitialBundle}
        setMarketVisible={setMarketVisible}
        setStudyVisible={setStudyVisible}
        setSelectedOrgId={setSelectedOrgId}
        setClipShareVisible={setClipShareVisible}
        setClipExportError={setClipExportError}
        clipShareVisible={clipShareVisible}
        clipExporting={clipExporting}
        clipExportError={clipExportError}
        verifyVisible={verifyVisible}
        verifyInitialBundle={verifyInitialBundle}
        marketVisible={marketVisible}
        studyVisible={studyVisible}
        selectedOrgId={selectedOrgId}
        scrollRef={scrollRef}
        clipCaptureRef={clipCaptureRef}
        navigation={navigation}
      />
    </ReadingAssistProvider>
  );
}

function ArticleScreenBody(props: {
  article: Article;
  articleId: string;
  claims: Record<string, Claim>;
  questions: Question[];
  market: import("@rabbit-hole/contracts").ArticleMarket | null;
  study: ArticleStudyGuide | null;
  mediaInterpretation: MediaInterpretation | undefined;
  readMode: "read" | "follow_system";
  setReadMode: (m: "read" | "follow_system") => void;
  hideLowConfidence: boolean;
  setHideLowConfidence: (v: boolean) => void;
  experience: ArticleExperience | undefined;
  highlightedStepId: string | null;
  setHighlightedStepId: (id: string | null) => void;
  blockOffsets: Record<number, number>;
  setBlockOffsets: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  readerScrollRef: React.RefObject<ScrollView | null>;
  handleStepPress: (step: ExperienceStep) => void;
  handleShare: () => void;
  handleShareClip: () => void;
  handleCaptureAndShareClip: () => Promise<void>;
  handleMarketItemPress: (item: import("@rabbit-hole/contracts").MarketItem) => void;
  openTrace: () => void;
  openRelated: (nodeId: string) => void;
  setClaimModal: (c: Claim | null) => void;
  setVerifyVisible: (v: boolean) => void;
  setVerifyInitialBundle: (b: VerificationResponse | null) => void;
  setMarketVisible: (v: boolean) => void;
  setStudyVisible: (v: boolean) => void;
  setSelectedOrgId: (id: string | null) => void;
  setClipShareVisible: (v: boolean) => void;
  setClipExportError: (e: string | null) => void;
  clipShareVisible: boolean;
  clipExporting: boolean;
  clipExportError: string | null;
  verifyVisible: boolean;
  verifyInitialBundle: VerificationResponse | null;
  marketVisible: boolean;
  studyVisible: boolean;
  selectedOrgId: string | null;
  scrollRef: React.RefObject<ScrollView | null>;
  clipCaptureRef: React.RefObject<View | null>;
  navigation: any;
}) {
  const {
    article,
    articleId,
    claims,
    questions,
    market,
    study,
    mediaInterpretation,
    readMode,
    setReadMode,
    hideLowConfidence,
    setHideLowConfidence,
    experience,
    highlightedStepId,
    setHighlightedStepId,
    blockOffsets,
    setBlockOffsets,
    readerScrollRef,
    handleStepPress,
    handleShare,
    handleShareClip,
    handleCaptureAndShareClip,
    handleMarketItemPress,
    openTrace,
    openRelated,
    setClaimModal,
    setVerifyVisible,
    setVerifyInitialBundle,
    setMarketVisible,
    setStudyVisible,
    setSelectedOrgId,
    setClipShareVisible,
    setClipExportError,
    clipShareVisible,
    clipExporting,
    clipExportError,
    verifyVisible,
    verifyInitialBundle,
    marketVisible,
    studyVisible,
    selectedOrgId,
    scrollRef,
    clipCaptureRef,
    navigation,
  } = props;
  const readingAssist = useReadingAssist();
  const [blockLayouts, setBlockLayouts] = useState<Record<number, { y: number; height: number }>>({});
  const [readerScrollY, setReaderScrollY] = useState(0);

  useEffect(() => {
    return () => {
      if (
        __DEV__ &&
        readingAssist &&
        (readingAssist.sessionSummary.startedAt != null ||
          readingAssist.sessionSummary.blockFocusCount > 0)
      ) {
        console.debug("ReadingAssist session summary", readingAssist.sessionSummary);
        console.debug("ReadingAssist heuristic summary", readingAssist.heuristicSummary);
        console.debug("ReadingAssist reading path summary", readingAssist.readingPathSummary);
      }
    };
  }, [
    readingAssist?.sessionSummary,
    readingAssist?.heuristicSummary,
    readingAssist?.readingPathSummary,
  ]);

  useEffect(() => {
    if (readingAssist?.mode !== "focus_block" || !readingAssist.focusedBlockId) return;
    const match = readingAssist.focusedBlockId.match(/^article-.+-block-(\d+)$/);
    const blockIndex = match ? parseInt(match[1], 10) : -1;
    const layout = blockIndex >= 0 ? blockLayouts[blockIndex] : undefined;
    if (!layout) return;
    const hasSentenceBand = !!readingAssist.focusedSentenceId;
    const bandEstimate = 120;
    const blockHeight = layout.height + (hasSentenceBand ? bandEstimate : 0);
    const viewportHeight = Dimensions.get("window").height * 0.6;
    const target = getReadingAssistScrollTarget({
      blockTop: layout.y,
      blockHeight,
      viewportHeight,
      currentScrollY: readerScrollY,
    });
    if (target == null) return;
    const id = requestAnimationFrame(() => {
      readerScrollRef.current?.scrollTo({ y: target, animated: true });
    });
    return () => cancelAnimationFrame(id);
  }, [
    readingAssist?.mode,
    readingAssist?.focusedBlockId,
    readingAssist?.focusedSentenceId,
    blockLayouts,
    readerScrollY,
  ]);

  const claimList = Object.values(claims);
  const blocks = article.blocks || [];
  const identificationBlock = blocks.find((b) => b.blockType === "identification");
  const contentBlocks = blocks.filter((b) => b.blockType !== "identification");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.nodeType}>{article.nodeType}</Text>
        {identificationBlock && (
          <Text style={styles.identificationLine}>{identificationBlock.text}</Text>
        )}
        <View style={styles.shareRow}>
          <Pressable style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>Share</Text>
          </Pressable>
          <Pressable style={styles.shareButton} onPress={handleShareClip}>
            <Text style={styles.shareButtonText}>Share Clip</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView ref={scrollRef} style={styles.scroll}>
        <View>
          {experience && (
            <View style={styles.modeSection}>
              <Text style={styles.sectionTitle}>View</Text>
              <View style={styles.filterRow}>
                <Pressable
                  style={[styles.filterToggle, readMode === "read" && styles.filterToggleActive]}
                  onPress={() => setReadMode("read")}
                >
                  <Text style={styles.filterLabel}>Read</Text>
                </Pressable>
                <Pressable
                  style={[styles.filterToggle, readMode === "follow_system" && styles.filterToggleActive]}
                  onPress={() => setReadMode("follow_system")}
                >
                  <Text style={styles.filterLabel}>Follow system</Text>
                </Pressable>
              </View>
              {readMode === "follow_system" && (
                <ExperienceStepper
                  experience={experience}
                  onStepPress={handleStepPress}
                  highlightedStepId={highlightedStepId}
                />
              )}
            </View>
          )}
          {readingAssist ? (
            <View style={styles.readingFocusSection}>
              <Text style={styles.sectionTitle}>Reading focus</Text>
              <View style={styles.filterRow}>
                <Pressable
                  style={[styles.filterToggle, readingAssist.mode === "off" && styles.filterToggleActive]}
                  onPress={() => readingAssist.setMode("off")}
                >
                  <Text style={styles.filterLabel}>Off</Text>
                </Pressable>
                <Pressable
                  style={[styles.filterToggle, readingAssist.mode === "focus_block" && styles.filterToggleActive]}
                  onPress={() => readingAssist.setMode("focus_block")}
                >
                  <Text style={styles.filterLabel}>Focus block</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
          <FocusZoneReader
            ref={readerScrollRef}
            onScroll={(e) => setReaderScrollY(e.nativeEvent.contentOffset.y)}
          >
            {contentBlocks.map((block, i) => {
              const showSectionLabel =
                block.blockType === "context" &&
                (i === 0 || contentBlocks[i - 1].blockType !== "context");
              const blockId = `article-${articleId}-block-${i}`;
              const blockSentences = getSentenceAnchorsForBlock(block.text, blockId);
              const isFocused = readingAssist?.isBlockFocused(blockId, "article") ?? false;
              const isDeemphasized = (readingAssist?.isAnyBlockFocused ?? false) && !isFocused;
              const isSentenceLayerActive =
                readingAssist?.mode === "focus_block" &&
                isFocused &&
                blockSentences.length > 0;
              const enlargedSentenceText =
                isFocused && readingAssist?.focusedSentenceId
                  ? getFocusedSentenceText(
                      block.text,
                      blockSentences,
                      readingAssist.focusedSentenceId
                    )
                  : null;
              const progression =
                isFocused && readingAssist?.focusedSentenceId
                  ? getSentenceProgressionState(
                      blockSentences,
                      readingAssist.focusedSentenceId
                    )
                  : null;
              return (
                <Pressable
                  key={i}
                  onPress={() => {
                    if (!readingAssist) return;
                    if (isFocused) readingAssist.setFocus(null, null);
                    else readingAssist.setFocus(blockId, "article");
                  }}
                  onLayout={(e) => {
                    const { y, height } = e.nativeEvent.layout;
                    setBlockOffsets((prev) => ({ ...prev, [i]: y }));
                    setBlockLayouts((prev) => ({ ...prev, [i]: { y, height } }));
                  }}
                  style={[
                    styles.readingBlockWrap,
                    isFocused && styles.readingBlockFocused,
                    isDeemphasized && styles.readingBlockDeemphasized,
                  ]}
                >
                  <MicroParagraphCard
                    block={block}
                    claims={claimList}
                    onClaimPress={(id) => setClaimModal(claims[id] || null)}
                    showSectionLabel={showSectionLabel}
                    hideLowConfidence={hideLowConfidence}
                    sentenceAnchors={blockSentences}
                    isSentenceLayerActive={isSentenceLayerActive}
                    focusedSentenceId={readingAssist?.focusedSentenceId ?? null}
                    onSentencePress={
                      readingAssist
                        ? (sentenceId) => {
                            if (readingAssist.focusedSentenceId === sentenceId) {
                              readingAssist.clearSentenceFocus();
                            } else {
                              readingAssist.setSentenceFocus(sentenceId);
                            }
                          }
                        : undefined
                    }
                    isSentenceFocused={
                      readingAssist
                        ? (sentenceId) =>
                            readingAssist.isSentenceFocused(sentenceId, blockId, "article")
                        : undefined
                    }
                    adjacentSentenceIds={
                      isSentenceLayerActive
                        ? getAdjacentSentenceIds(
                            blockSentences,
                            readingAssist?.focusedSentenceId ?? null
                          )
                        : undefined
                    }
                  />
                  {enlargedSentenceText ? (
                    <ReadingAssistSentenceBand
                      sentenceText={enlargedSentenceText}
                      onPrevious={
                        progression && readingAssist && progression.total > 1
                          ? () => {
                              if (progression.previousSentenceId) {
                                readingAssist.onReadingAssistEvent?.({
                                  type: "sentence_progress_previous",
                                  timestamp: Date.now(),
                                  sourceType: "article",
                                  blockId,
                                  sentenceId: progression.previousSentenceId,
                                });
                                readingAssist.setSentenceFocus(progression.previousSentenceId);
                              }
                            }
                          : undefined
                      }
                      onNext={
                        progression && readingAssist && progression.total > 1
                          ? () => {
                              if (progression.nextSentenceId) {
                                readingAssist.onReadingAssistEvent?.({
                                  type: "sentence_progress_next",
                                  timestamp: Date.now(),
                                  sourceType: "article",
                                  blockId,
                                  sentenceId: progression.nextSentenceId,
                                });
                                readingAssist.setSentenceFocus(progression.nextSentenceId);
                              }
                            }
                          : undefined
                      }
                      canGoPrevious={!!progression?.previousSentenceId}
                      canGoNext={!!progression?.nextSentenceId}
                      progressLabel={
                        progression &&
                        progression.total > 0 &&
                        progression.currentIndex >= 0
                          ? `${progression.currentIndex + 1} / ${progression.total}`
                          : undefined
                      }
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </FocusZoneReader>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confidence filter</Text>
          <View style={styles.filterRow}>
            <Pressable
              style={[styles.filterToggle, !hideLowConfidence && styles.filterToggleActive]}
              onPress={() => setHideLowConfidence(false)}
            >
              <Text style={styles.filterLabel}>Show all</Text>
            </Pressable>
            <Pressable
              style={[styles.filterToggle, hideLowConfidence && styles.filterToggleActive]}
              onPress={() => setHideLowConfidence(true)}
            >
              <Text style={styles.filterLabel}>Hide low confidence</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evidence & trace</Text>
          <Pressable style={styles.linkButton} onPress={() => { setVerifyInitialBundle(null); setVerifyVisible(true); }}>
            <Text style={styles.linkText}>Sources & Verify</Text>
            <Text style={styles.linkSubtext}>Inspect claim and source support</Text>
          </Pressable>
          <Pressable style={styles.linkButton} onPress={openTrace}>
            <Text style={styles.linkText}>Trace through systems</Text>
            <Text style={styles.linkSubtext}>Preview material and supply chain</Text>
          </Pressable>
        </View>
        {market ? (
          <View style={styles.section}>
            <Pressable style={styles.linkButton} onPress={() => setMarketVisible(true)}>
              <Text style={styles.linkText}>Market</Text>
              <Text style={styles.linkSubtext}>Ways to act on what you learned</Text>
            </Pressable>
          </View>
        ) : null}
        {study ? (
          <View style={styles.section}>
            <Pressable style={styles.linkButton} onPress={() => setStudyVisible(true)}>
              <Text style={styles.linkText}>Study</Text>
              <Text style={styles.linkSubtext}>Key points, explain simply, study questions</Text>
            </Pressable>
          </View>
        ) : null}
        {mediaInterpretation && (mediaInterpretation.summaryBlocks?.length || mediaInterpretation.transcriptBlocks?.length || mediaInterpretation.claims?.length) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>From this media</Text>
            {mediaInterpretation.ref?.organizationId ? (
              <Pressable
                style={styles.mediaVerifyButton}
                onPress={() => setSelectedOrgId(mediaInterpretation.ref!.organizationId!)}
              >
                <Text style={styles.mediaVerifyButtonText}>Organization</Text>
              </Pressable>
            ) : null}
            {mediaInterpretation.summaryBlocks?.map((b) => (
              <View key={b.id} style={styles.mediaBlock}>
                {b.title ? <Text style={styles.mediaBlockTitle}>{b.title}</Text> : null}
                <Text style={styles.mediaBlockContent}>{b.content}</Text>
              </View>
            ))}
            {mediaInterpretation.transcriptBlocks?.length ? (
              <>
                <Text style={styles.mediaSubsectionTitle}>Transcript</Text>
                {mediaInterpretation.transcriptBlocks.map((b) => (
                  <View key={b.id} style={styles.mediaTranscriptLine}>
                    {b.speaker ? <Text style={styles.mediaSpeaker}>{b.speaker}</Text> : null}
                    <Text style={styles.mediaTranscriptContent}>{b.content}</Text>
                  </View>
                ))}
              </>
            ) : null}
            {mediaInterpretation.claims?.length ? (
              <>
                <Text style={styles.mediaSubsectionTitle}>Claims from this media</Text>
                <Text style={styles.mediaClaimsHint}>Claims surfaced from this media; not independently verified.</Text>
                {mediaInterpretation.claims.map((c) => {
                  const supportStatus = mediaInterpretation.supportStatusByClaimId?.[c.id];
                  const supportLabel = supportStatus ? getSupportStatusLabel(supportStatus) : getSupportLabel(getClaimSupport(c));
                  return (
                    <View key={c.id} style={styles.mediaClaimRow}>
                      <View style={styles.mediaClaimMetaRow}>
                        <ClaimTypeBadge claimType={c.claimType} />
                        <Text style={styles.mediaClaimMeta}>{confidenceGlyph(getClaimConfidence(c))} {getConfidenceLabel(getClaimConfidence(c))} · {supportLabel}</Text>
                      </View>
                      <Text style={styles.mediaBlockContent}>{c.text}</Text>
                    </View>
                  );
                })}
                {mediaInterpretation.ref?.originalUrl ? (
                  <Pressable
                    style={styles.mediaVerifyButton}
                    onPress={async () => {
                      const bundle = await api.getMediaVerification(mediaInterpretation.ref!.originalUrl);
                      if (bundle) {
                        setVerifyInitialBundle(bundle);
                        setVerifyVisible(true);
                      }
                    }}
                  >
                    <Text style={styles.mediaVerifyButtonText}>Verify from this media</Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}
          </View>
        ) : null}
        {article.relatedNodeIds?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Related</Text>
            {article.relatedNodeIds.map((nodeId) => (
              <NodeChip key={nodeId} node={{ id: nodeId, name: nodeId, nodeType: "product" }} onPress={() => openRelated(nodeId)} />
            ))}
          </View>
        ) : null}
        {questions.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested questions</Text>
            <Text style={styles.questionsIntro}>Explore further</Text>
            {questions.slice(0, 5).map((q) => (
              <QuestionCard key={q.id} question={q} onPress={() => {}} />
            ))}
          </View>
        ) : null}
        </View>
      </ScrollView>
      <MarketSheet market={market} visible={marketVisible} onDismiss={() => setMarketVisible(false)} onItemPress={handleMarketItemPress} />
      <StudySheet guide={study} visible={studyVisible} onDismiss={() => setStudyVisible(false)} />
      <Modal visible={clipShareVisible} animationType="slide">
        <View style={styles.clipModalContainer}>
          <ScrollView
            style={styles.clipScroll}
            contentContainerStyle={styles.clipScrollContent}
            centerContent
          >
            {clipShareVisible && article ? (
              <ClipExportView
                plan={getArticleClipPlan(article)}
                captureRef={clipCaptureRef}
              />
            ) : null}
          </ScrollView>
          <View style={styles.clipModalFooter}>
            {clipExportError ? (
              <Text style={styles.clipExportError}>{clipExportError}</Text>
            ) : null}
            <View style={styles.clipModalButtons}>
              <Pressable
                style={[styles.clipShareButton, clipExporting && styles.clipShareButtonDisabled]}
                onPress={handleCaptureAndShareClip}
                disabled={clipExporting}
              >
                <Text style={styles.clipShareButtonText}>
                  {clipExporting ? "Creating…" : "Share"}
                </Text>
              </Pressable>
              <Pressable
                style={styles.clipCancelButton}
                onPress={() => {
                  setClipShareVisible(false);
                  setClipExportError(null);
                }}
              >
                <Text style={styles.clipCancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <VerifySheet
        articleId={articleId}
        initialBundle={verifyInitialBundle}
        visible={verifyVisible}
        onDismiss={() => { setVerifyVisible(false); setVerifyInitialBundle(null); }}
        onOpenArticle={(aid) => {
          setVerifyVisible(false);
          setVerifyInitialBundle(null);
          setSelectedOrgId(null);
          (navigation as any).navigate("Article", { articleId: aid });
        }}
      />
      <OrganizationProfileSheet
        organizationId={selectedOrgId}
        visible={!!selectedOrgId}
        onDismiss={() => setSelectedOrgId(null)}
        onOpenArticle={(aid) => {
          setSelectedOrgId(null);
          (navigation as any).navigate("Article", { articleId: aid });
        }}
      />
      <Modal visible={!!claimModal} transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setClaimModal(null)}>
          <View style={styles.modalContent}>
            {claimModal && (
              <>
                <Text style={styles.claimText}>{claimModal.text}</Text>
                <View style={styles.claimMetaRow}>
                  <ClaimTypeBadge claimType={claimModal.claimType as any} />
                  <Text style={styles.claimMeta}>{claimModal.sourceCount} source{claimModal.sourceCount !== 1 ? "s" : ""}</Text>
                </View>
                <View style={styles.epistemicRow}>
                  <Text style={styles.confidenceGlyph}>{confidenceGlyph(getClaimConfidence(claimModal))}</Text>
                  <Text style={styles.epistemicLabel}>{getConfidenceLabel(getClaimConfidence(claimModal))}</Text>
                  <Text style={styles.epistemicDivider}>·</Text>
                  <Text style={styles.epistemicLabel}>{getSupportLabel(getClaimSupport(claimModal))}</Text>
                </View>
                <Text style={styles.verifyHint}>Open Verify to see sources and evidence.</Text>
                <Pressable style={styles.verifyCta} onPress={() => { setClaimModal(null); setVerifyInitialBundle(null); setVerifyVisible(true); }}>
                  <Text style={styles.verifyCtaText}>Sources & Verify</Text>
                </Pressable>
                <Pressable onPress={() => setClaimModal(null)}><Text style={styles.dismiss}>Close</Text></Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: "#eee" },
  title: { fontSize: 22, fontWeight: "600" },
  nodeType: { fontSize: 12, color: "#666", marginTop: 4 },
  identificationLine: { fontSize: 14, color: "#444", marginTop: 8, lineHeight: 20 },
  shareRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  shareButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#f0f0f0", borderRadius: 8 },
  shareButtonText: { fontSize: 14, color: "#333" },
  scroll: { flex: 1 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 },
  linkButton: { paddingVertical: 10 },
  linkText: { color: "#1565c0", fontSize: 15 },
  linkSubtext: { fontSize: 12, color: "#666", marginTop: 2 },
  questionsIntro: { fontSize: 13, color: "#666", marginBottom: 10 },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", padding: 24 },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 8 },
  claimText: { fontSize: 16 },
  claimMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  claimMeta: { fontSize: 12, color: "#666" },
  verifyHint: { fontSize: 13, color: "#666", marginTop: 12 },
  verifyCta: { marginTop: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#e3f2fd", borderRadius: 8 },
  verifyCtaText: { color: "#1565c0", fontWeight: "600" },
  dismiss: { marginTop: 16, color: "#1565c0" },
  epistemicRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  confidenceGlyph: { fontSize: 14, color: "#333" },
  epistemicLabel: { fontSize: 12, color: "#666" },
  epistemicDivider: { fontSize: 12, color: "#999" },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  filterToggle: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#f0f0f0" },
  filterToggleActive: { backgroundColor: "#e3f2fd" },
  filterLabel: { fontSize: 13, color: "#333" },
  readingFocusSection: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  readingBlockWrap: { padding: 0 },
  readingBlockFocused: { backgroundColor: "#f5f5f5" },
  readingBlockDeemphasized: { opacity: 0.88 },
  modeSection: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  clipModalContainer: { flex: 1, backgroundColor: "#eee" },
  clipScroll: { flex: 1 },
  clipScrollContent: { paddingVertical: 24, alignItems: "center" },
  clipModalFooter: { padding: 16, paddingBottom: 32, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#eee" },
  clipExportError: { fontSize: 13, color: "#c00", marginBottom: 8 },
  clipModalButtons: { flexDirection: "row", gap: 12 },
  clipShareButton: { flex: 1, paddingVertical: 12, backgroundColor: "#333", borderRadius: 8, alignItems: "center" },
  clipShareButtonDisabled: { opacity: 0.6 },
  clipShareButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  clipCancelButton: { paddingVertical: 12, paddingHorizontal: 16, alignItems: "center" },
  clipCancelButtonText: { fontSize: 16, color: "#666" },
  mediaBlock: { marginBottom: 12 },
  mediaBlockTitle: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 4 },
  mediaBlockContent: { fontSize: 14, color: "#444", lineHeight: 20 },
  mediaSubsectionTitle: { fontSize: 12, fontWeight: "600", color: "#666", marginTop: 12, marginBottom: 6, textTransform: "uppercase" },
  mediaTranscriptLine: { marginBottom: 8 },
  mediaSpeaker: { fontSize: 12, fontWeight: "600", color: "#666", marginBottom: 2 },
  mediaTranscriptContent: { fontSize: 14, color: "#444", lineHeight: 20 },
  mediaClaimsHint: { fontSize: 12, color: "#666", fontStyle: "italic", marginBottom: 8 },
  mediaClaimRow: { marginBottom: 12 },
  mediaClaimMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  mediaClaimMeta: { fontSize: 12, color: "#666" },
  mediaVerifyButton: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: "#333", alignSelf: "flex-start", borderRadius: 8 },
  mediaVerifyButtonText: { color: "#fff", fontSize: 14 },
});
