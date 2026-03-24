/**
 * SwipeReading.jsx — Single Chapter with Swipe Navigation (Kindle-style)
 * WITH Multi-Color Highlighting & Dialogue Bottom Sheet
 * FIXED: NaN verse numbers — non-numeric keys filtered out
 * FIXED: Psalm 119 style sectioned verses (sections[].verses) flattened correctly
 */

import { useEffect, useState, useRef } from "react";
import { loadChapter } from "./lib/bible";
import ChapterReflectionPanel from "./components/ChapterReflectionPanel";
import { BIBLE_ORDER, CHAPTER_COUNT } from "./lib/bibleStructure";
import { getBookDisplayName } from "./lib/bibleStructure";
import {
  HighlightPanel,
  DialogueBottomSheet,
  getColorFromId,
  getThemeColors,
} from "./components/HighlightSystem";

/* ===============================
   Merge verses into paragraphs
   using paragraph break markers
================================ */
function buildParagraphs(verses, breakSet) {
  if (!verses.length) return [];

  const paragraphs = [];
  let current = [];

  verses.forEach((v) => {
    const isBreak = breakSet.size > 0 && breakSet.has(v.verse);
    const prevSpeaker =
      current.length > 0 ? current[current.length - 1].speaker : null;
    const speakerChanged = current.length > 0 && v.speaker !== prevSpeaker;

    if ((isBreak || speakerChanged) && current.length > 0) {
      paragraphs.push(current);
      current = [];
    }
    current.push(v);
  });

  if (current.length > 0) paragraphs.push(current);
  return paragraphs;
}

export default function SwipeReading({
  hideVerseNumbers = false,
  chapterlessMode = false,
  textSize = 1.0,
  translation = "VSV",
  theme = "classic",
  onReadingContext,
  onScrollProgress,
  onScrollRef,
  navigationTarget,
  onNavigationComplete,
  isModalOpen = false,
  uiMode = "reading",
  onUiModeChange,
  reflectionOpen = false,
  onReflectionOpenChange,
  onCrossRefNavigate,
}) {
  const [verses, setVerses] = useState([]);
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState([]);
  const [book, setBook] = useState("genesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [loading, setLoading] = useState(true);

  // ── Safe text extractor ──
  const safeText = (val) => {
    if (typeof val === "string") return val;
    if (val && typeof val === "object") return val.text ?? "";
    return "";
  };

  const [reflectionSummary, setReflectionSummary] = useState("");

  // Paragraph break data for chapterless mode
  const [paragraphBreaks, setParagraphBreaks] = useState({});

  const scrollRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(0);
  const lastScrollTop = useRef(0);
  const navOffsetRef = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Highlighting state
  const [selectedVerses, setSelectedVerses] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [highlightPanelOpen, setHighlightPanelOpen] = useState(false);
  const [dialogueBottomSheetOpen, setDialogueBottomSheetOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [highlights, setHighlights] = useState(() => {
    const saved = localStorage.getItem("verseHighlights");
    return saved ? JSON.parse(saved) : {};
  });

  /* ===============================
     Load Paragraph Break Data
  ================================ */
  useEffect(() => {
    if (!chapterlessMode) return;

    async function loadParagraphData() {
      try {
        const base = import.meta.env.BASE_URL;
        const res = await fetch(`${base}data/paragraphs/${book}.json`);
        if (!res.ok) return;
        const data = await res.json();
        setParagraphBreaks(data.chapters || {});
      } catch {
        setParagraphBreaks({});
      }
    }

    loadParagraphData();
  }, [book, chapterlessMode]);

  /* ===============================
     Load Single Chapter
  ================================ */
  useEffect(() => {
    let cancelled = false;

    async function loadSingleChapter() {
      setLoading(true);
      setVerses([]);
      setTitle("");
      setSections([]);

      try {
        const rawData = await loadChapter(
          book,
          currentChapter,
          translation.toLowerCase(),
        );

        if (cancelled) return;

        const chapterData = rawData.chapters
          ? rawData.chapters[String(currentChapter)]
          : rawData;

        const chapterTitle = chapterData?.title ?? "";
        const chapterSections = chapterData?.sections ?? [];
        const versesData = chapterData?.verses ?? chapterData;

        // ── Flatten Psalm 119-style sectioned verses ──
        // Some chapters (e.g. Psalm 119 ASR) store verses nested inside
        // sections[].verses rather than a top-level verses object.
        let flatVersesData = versesData;
        if (
          !chapterData?.verses &&
          chapterSections.length > 0 &&
          chapterSections[0]?.verses
        ) {
          flatVersesData = chapterSections.reduce((acc, section) => {
            return { ...acc, ...section.verses };
          }, {});
        }

        let verseItems = [];
        if (Array.isArray(flatVersesData)) {
          verseItems = flatVersesData.map((v) => ({
            verse: v.verse,
            text: safeText(v.text ?? v),
            speaker: v.speaker ?? null,
          }));
        } else if (
          typeof flatVersesData === "object" &&
          flatVersesData !== null
        ) {
          verseItems = Object.entries(flatVersesData)
            .filter(([verse]) => !isNaN(Number(verse)) && verse.trim() !== "")
            .map(([verse, val]) => ({
              verse: Number(verse),
              text: safeText(val),
              speaker: typeof val === "object" ? (val.speaker ?? null) : null,
            }));
        }

        // ── Build section title lookup ──
        // Works for both standard sections[] and Psalm 119-style sections[].verses
        const sectionStartVerses = chapterSections.map((s) => {
          if (s.startVerse != null)
            return { startVerse: s.startVerse, title: s.title };
          // Psalm 119 style — first key of section.verses
          const firstKey = s.verses ? Number(Object.keys(s.verses)[0]) : null;
          return { startVerse: firstKey, title: s.title };
        });

        // Tag each verse with its section title
        verseItems = verseItems.map((v) => ({
          ...v,
          sectionTitle:
            sectionStartVerses.find((s) => s.startVerse === v.verse)?.title ??
            null,
        }));

        setVerses(verseItems);
        setTitle(chapterTitle);
        setSections(chapterSections);

        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
          scrollRef.current.scrollLeft = 0;
        }

        onReadingContext?.({
          book: getBookDisplayName(book),
          chapter: currentChapter,
        });
      } catch (error) {
        console.error("Failed to load chapter:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSingleChapter();
    return () => {
      cancelled = true;
    };
  }, [currentChapter, translation, onReadingContext, book]);

  /* ===============================
     Hard Reset When Modal Opens/Closes
  ================================ */
  useEffect(() => {
    setSwipeOffset(0);
    setIsSwiping(false);
    touchStartX.current = null;
    touchStartY.current = null;
  }, [isModalOpen]);

  /* ===============================
     Handle Navigation Target
  ================================ */
  useEffect(() => {
    if (!navigationTarget) return;

    if (
      navigationTarget.book === book &&
      navigationTarget.chapter === currentChapter
    ) {
      onNavigationComplete?.();
      return;
    }

    setSwipeOffset(0);
    setIsSwiping(false);
    touchStartX.current = null;
    touchStartY.current = null;
    lastScrollTop.current = 0;
    navOffsetRef.current = 0;

    setBook(navigationTarget.book);
    setCurrentChapter(navigationTarget.chapter);
    onNavigationComplete?.();
  }, [navigationTarget]);

  /* ===============================
     Swipe Navigation
  ================================ */
  function handleTouchStart(e) {
    if (isSelectionMode || isModalOpen) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(false);
  }

  function handleTouchMove(e) {
    if (!touchStartX.current || isSelectionMode || isModalOpen) return;

    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    const diffX = touchCurrentX - touchStartX.current;
    const diffY = touchCurrentY - touchStartY.current;

    if (Math.abs(diffX) > 12 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      setIsSwiping(true);
      setSwipeOffset(diffX);
    }
  }

  function handleTouchEnd() {
    if (!isSwiping || isModalOpen) {
      setSwipeOffset(0);
      touchStartX.current = null;
      return;
    }

    const threshold = 75;

    if (Math.abs(swipeOffset) > threshold) {
      const currentIndex = BIBLE_ORDER.indexOf(book);
      const maxChapters = CHAPTER_COUNT[book];

      if (swipeOffset < 0) {
        if (currentChapter < maxChapters) {
          setCurrentChapter((c) => c + 1);
        } else if (currentIndex < BIBLE_ORDER.length - 1) {
          const nextBook = BIBLE_ORDER[currentIndex + 1];
          setBook(nextBook);
          setCurrentChapter(1);
        }
      } else {
        if (currentChapter > 1) {
          setCurrentChapter((c) => c - 1);
        } else if (currentIndex > 0) {
          const prevBook = BIBLE_ORDER[currentIndex - 1];
          const prevMax = CHAPTER_COUNT[prevBook];
          setBook(prevBook);
          setCurrentChapter(prevMax);
        }
      }
    }

    setSwipeOffset(0);
    setIsSwiping(false);
    touchStartX.current = null;
  }

  /* ===============================
     Scroll Progress
  ================================ */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function handleScroll() {
      const { scrollTop } = el;
      const delta = scrollTop - lastScrollTop.current;
      lastScrollTop.current = scrollTop;

      const DAMPING = 0.35;
      let next = navOffsetRef.current + delta * DAMPING;
      next = Math.max(0, Math.min(60, next));
      navOffsetRef.current = next;

      if (delta < 0) {
        navOffsetRef.current = Math.max(
          0,
          navOffsetRef.current + delta * DAMPING,
        );
      }

      onScrollProgress?.(navOffsetRef.current / 60);
    }

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [onScrollProgress]);

  /* ===============================
     Highlighting Helpers
  ================================ */
  function getVerseKey(verseNum) {
    return `${book}-${currentChapter}-${verseNum}-${translation}`;
  }

  function isVerseHighlighted(verseNum) {
    return highlights[getVerseKey(verseNum)] || null;
  }

  function getExistingColorForSelection() {
    if (selectedVerses.length === 0) return null;
    const firstKey = getVerseKey(selectedVerses[0].verse);
    const firstHighlight = highlights[firstKey];
    if (!firstHighlight) return null;
    const allSameColor = selectedVerses.every(
      (v) =>
        highlights[getVerseKey(v.verse)]?.colorId === firstHighlight.colorId,
    );
    return allSameColor ? firstHighlight.colorId : null;
  }

  function getVerseHighlightColor(verseNum) {
    const highlight = isVerseHighlighted(verseNum);
    if (!highlight) return null;
    const colorObj = getColorFromId(highlight.colorId, highlight.theme);
    return colorObj.color;
  }

  /* ===============================
     Highlighting Actions
  ================================ */
  function handleVerseClick(verse) {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedVerses([verse]);
      setHighlightPanelOpen(true);
      onUiModeChange?.("highlighting");
    } else {
      const isSelected = selectedVerses.some((v) => v.verse === verse.verse);
      if (isSelected) {
        const newSelection = selectedVerses.filter(
          (v) => v.verse !== verse.verse,
        );
        if (newSelection.length === 0) {
          setIsSelectionMode(false);
          setHighlightPanelOpen(false);
          onUiModeChange?.("reading");
        }
        setSelectedVerses(newSelection);
      } else {
        setSelectedVerses(
          [...selectedVerses, verse].sort((a, b) => a.verse - b.verse),
        );
      }
    }
  }

  function handleOpenHighlightPanel() {
    setHighlightPanelOpen(true);
  }

  function handleColorSelected(colorOption) {
    setSelectedColor(colorOption);
    setHighlightPanelOpen(false);

    const newHighlights = { ...highlights };
    selectedVerses.forEach((verse) => {
      newHighlights[getVerseKey(verse.verse)] = {
        colorId: colorOption.id,
        theme,
        book,
        chapter: currentChapter,
        verse: verse.verse,
        translation,
        text: verse.text,
        createdAt: new Date().toISOString(),
      };
    });

    setHighlights(newHighlights);
    localStorage.setItem("verseHighlights", JSON.stringify(newHighlights));
    setDialogueBottomSheetOpen(true);
    onUiModeChange?.("dialogue");
  }

  function handleClearHighlights() {
    const newHighlights = { ...highlights };
    selectedVerses.forEach((verse) => {
      delete newHighlights[getVerseKey(verse.verse)];
    });
    setHighlights(newHighlights);
    localStorage.setItem("verseHighlights", JSON.stringify(newHighlights));
    setSelectedVerses([]);
    setIsSelectionMode(false);
    setHighlightPanelOpen(false);
    onUiModeChange?.("reading");
  }

  function handleDialogueClose() {
    setSelectedVerses([]);
    setIsSelectionMode(false);
    setDialogueBottomSheetOpen(false);
    setSelectedColor(null);
    onUiModeChange?.("reading");
  }

  function handleCancelSelection() {
    setSelectedVerses([]);
    setIsSelectionMode(false);
    setHighlightPanelOpen(false);
    onUiModeChange?.("reading");
  }

  /* ===============================
     Load Chapter Summary
  ================================ */
  async function loadChapterSummary(chapterNum) {
    try {
      const base = import.meta.env.BASE_URL;
      const t = translation.toUpperCase();
      const reflectionFolder = t === "AKT" ? "akt" : "shared";
      const res = await fetch(
        `${base}data/summaries/${reflectionFolder}/${book}/${chapterNum}.json`,
      );
      const data = await res.json();
      setReflectionSummary(data.summary);
    } catch {
      setReflectionSummary(
        "This chapter invites reflection on God's work and purpose.",
      );
    }
  }

  function handleReflection() {
    loadChapterSummary(currentChapter);
    onReflectionOpenChange?.(true);
  }

  /* ===============================
     Section title renderer
  ================================ */
  function SectionTitle({ title }) {
    return (
      <div className="my-8 flex flex-col items-center">
        <div className="w-24 h-px mb-4 bg-[var(--text-accent)] opacity-20" />
        <div className="text-center font-[var(--font-ui)] text-[13px] font-semibold tracking-widest uppercase text-[var(--text-secondary)] opacity-70">
          {title}
        </div>
        <div className="w-24 h-px mt-4 bg-[var(--text-accent)] opacity-20" />
      </div>
    );
  }

  /* ===============================
     Swipe indicator chapter numbers
  ================================ */
  const maxChapters = CHAPTER_COUNT[book] || 1;
  const bookIndex = BIBLE_ORDER.indexOf(book);

  const prevChapter =
    currentChapter > 1
      ? currentChapter - 1
      : bookIndex > 0
        ? CHAPTER_COUNT[BIBLE_ORDER[bookIndex - 1]]
        : null;

  const nextChapter =
    currentChapter < maxChapters
      ? currentChapter + 1
      : bookIndex < BIBLE_ORDER.length - 1
        ? 1
        : null;

  const swipeProgress = Math.min(Math.abs(swipeOffset) / 120, 1);
  const showSwipeIndicator =
    chapterlessMode && isSwiping && swipeProgress > 0.1;

  /* ===============================
     Paragraph groups for chapterless
  ================================ */
  const breakSet = chapterlessMode
    ? new Set(
        (paragraphBreaks[String(currentChapter)] ?? null) !== null
          ? paragraphBreaks[String(currentChapter)].map(Number)
          : [],
      )
    : new Set();
  const paragraphGroups = chapterlessMode
    ? buildParagraphs(verses, breakSet)
    : null;

  /* ===============================
     Render
  ================================ */
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[var(--text-primary)] opacity-50">Loading…</div>
      </div>
    );
  }

  return (
    <div
      className="no-select flex flex-col bg-[var(--bg-primary)]"
      style={{ height: "100%", maxHeight: "100%", position: "relative" }}
    >
      {/* ── Swipe Chapter Indicators (chapterless only) ── */}
      {showSwipeIndicator && (
        <>
          {/* Going back → block on LEFT */}
          {swipeOffset > 0 && prevChapter !== null && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: `translateY(-50%) translateX(${-44 + swipeProgress * 44}px)`,
                opacity: swipeProgress,
                zIndex: 20,
                width: 44,
                height: 72,
                background: "var(--bg-nav)",
                borderRadius: "0 12px 12px 0",
                boxShadow: "2px 0 16px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-inverse)",
                }}
              >
                {prevChapter}
              </span>
            </div>
          )}

          {/* Going forward → block on RIGHT */}
          {swipeOffset < 0 && nextChapter !== null && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: `translateY(-50%) translateX(${44 - swipeProgress * 44}px)`,
                opacity: swipeProgress,
                zIndex: 20,
                width: 44,
                height: 72,
                background: "var(--bg-nav)",
                borderRadius: "12px 0 0 12px",
                boxShadow: "-2px 0 16px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-inverse)",
                }}
              >
                {nextChapter}
              </span>
            </div>
          )}
        </>
      )}

      <main
        ref={(el) => {
          scrollRef.current = el;
          onScrollRef?.(el);
        }}
        className="reader flex-1 overflow-y-auto overflow-x-hidden overscroll-none"
        style={{
          opacity: isSwiping
            ? Math.max(0.3, 1 - Math.abs(swipeOffset) / 200)
            : 1,
          transition: isSwiping ? "none" : "opacity 0.2s ease-out",
          pointerEvents: isModalOpen ? "none" : "auto",
          paddingTop: "calc(env(safe-area-inset-top) + 24px)",
          paddingBottom:
            "max(128px, calc(128px + env(safe-area-inset-bottom)))",
          paddingLeft: chapterlessMode ? "32px" : "24px",
          paddingRight: chapterlessMode ? "32px" : "24px",
          WebkitOverflowScrolling: "touch",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Standard Mode: Chapter Title ── */}
        {!chapterlessMode && (
          <>
            <div className="my-16 text-center tracking-wide opacity-85 text-[var(--text-accent)] font-[var(--font-ui)] font-semibold !text-[26px]">
              {getBookDisplayName(book)} {currentChapter}
            </div>

            {title && (
              <div className="my-12 flex flex-col items-center">
                <div className="w-24 h-px mb-4 bg-[var(--text-accent)] opacity-20" />
                <div className="text-center font-[var(--font-ui)] text-[15px] font-semibold tracking-wide text-[var(--text-secondary)] opacity-80">
                  {title}
                </div>
                <div className="w-24 h-px mt-4 bg-[var(--text-accent)] opacity-20" />
              </div>
            )}
          </>
        )}

        {/* ── Standard Mode: Verses ── */}
        {!chapterlessMode && (
          <div className="space-y-6">
            {verses.map((v) => {
              const isSelected = selectedVerses.some(
                (sv) => sv.verse === v.verse,
              );
              const highlightColor = getVerseHighlightColor(v.verse);
              const sectionTitle = v.sectionTitle;

              return (
                <div key={v.verse}>
                  {sectionTitle && <SectionTitle title={sectionTitle} />}
                  <p
                    data-chapter={currentChapter}
                    onClick={() => handleVerseClick(v)}
                    className={`leading-[var(--line-height)] font-[var(--font-body)] cursor-pointer transition-all ${v.speaker === "Jesus" ? "jesus" : "text-[var(--text-primary)]"}`}
                    style={{
                      fontSize: `${textSize * 16}px`,
                      background: highlightColor || "transparent",
                      border: isSelected
                        ? "2px solid var(--text-accent)"
                        : "none",
                      borderRadius:
                        isSelected || highlightColor ? "0.5rem" : "0",
                      padding:
                        isSelected || highlightColor ? "0.25rem 0.5rem" : "0",
                      margin: isSelected || highlightColor ? "0.25rem 0" : "0",
                      opacity: isSelected ? 0.8 : 1,
                    }}
                  >
                    {!hideVerseNumbers && (
                      <sup
                        className="mr-2 select-none text-[var(--text-accent)] opacity-[var(--verse-opacity)] font-[var(--font-verse)]"
                        style={{ fontSize: `${textSize * 0.75}rem` }}
                      >
                        {v.verse}
                      </sup>
                    )}
                    {v.text}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Chapterless Mode: Prose Paragraphs ── */}
        {chapterlessMode && (
          <div style={{ marginTop: "48px" }}>
            {paragraphGroups.map((group, groupIdx) => {
              const isSpeakerJesus = group.some((v) => v.speaker === "Jesus");
              const paragraphText = group
                .map((v) => safeText(v.text))
                .join(" ");
              const groupSelected = group.some((v) =>
                selectedVerses.some((sv) => sv.verse === v.verse),
              );
              const groupHighlightColor = group.reduce(
                (color, v) => color || getVerseHighlightColor(v.verse),
                null,
              );
              const firstVerse = group[0]?.verse;
              const sectionTitle = group[0]?.sectionTitle ?? null;

              return (
                <div key={groupIdx}>
                  {sectionTitle && <SectionTitle title={sectionTitle} />}
                  <p
                    onClick={() => {
                      if (group.length > 0) handleVerseClick(group[0]);
                    }}
                    className={isSpeakerJesus ? "jesus" : ""}
                    style={{
                      fontSize: `${textSize * 16.5}px`,
                      lineHeight: 2,
                      fontFamily: "var(--font-chapterless)",
                      color: isSpeakerJesus ? undefined : "var(--text-primary)",
                      marginBottom: "1.6em",
                      textIndent: "1.5em",
                      cursor: "pointer",
                      background: groupHighlightColor || "transparent",
                      borderRadius:
                        groupSelected || groupHighlightColor ? "0.5rem" : "0",
                      padding:
                        groupSelected || groupHighlightColor
                          ? "0.25rem 0.5rem"
                          : "0",
                      border: groupSelected
                        ? "2px solid var(--text-accent)"
                        : "none",
                      opacity: groupSelected ? 0.8 : 1,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {paragraphText}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Chapter End Reflection (standard mode only) ── */}
        {!chapterlessMode && (
          <div className="mt-16 mb-24 text-center opacity-70">
            <div className="mx-auto mb-4 h-px w-24 bg-[var(--text-accent)] opacity-20" />
            <button
              onClick={handleReflection}
              className="inline-flex items-center gap-2 text-sm font-[var(--font-ui)] tracking-wide text-[var(--text-secondary)] hover:opacity-100 transition-opacity"
            >
              Reflect on this chapter
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-[var(--text-accent)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 2a7 7 0 0 0-4 12c.6.6 1 1.5 1 2.5V18h6v-1.5c0-1 .4-1.9 1-2.5a7 7 0 0 0-4-12z" />
                <path d="M9 21h6" />
              </svg>
            </button>
          </div>
        )}
      </main>

      {/* Highlight Panel */}
      {highlightPanelOpen && (
        <HighlightPanel
          theme={theme}
          book={getBookDisplayName(book)}
          chapter={currentChapter}
          selectedVerses={selectedVerses}
          translation={translation}
          existingColorId={getExistingColorForSelection()}
          onSelectColor={handleColorSelected}
          onClear={handleClearHighlights}
          onCancel={handleCancelSelection}
        />
      )}

      {/* Dialogue Bottom Sheet */}
      {dialogueBottomSheetOpen && selectedColor && (
        <DialogueBottomSheet
          selectedVerses={selectedVerses}
          highlightColor={selectedColor}
          book={getBookDisplayName(book)}
          chapter={currentChapter}
          translation={translation}
          onClose={handleDialogueClose}
        />
      )}

      {/* Chapter Reflection Panel */}
      <ChapterReflectionPanel
        open={reflectionOpen}
        onClose={() => onReflectionOpenChange?.(false)}
        book={getBookDisplayName(book)}
        chapter={currentChapter}
        summary={reflectionSummary}
        onNavigate={onCrossRefNavigate}
        translation={translation}
      />
    </div>
  );
}
