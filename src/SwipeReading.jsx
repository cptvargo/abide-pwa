/**
 * SwipeReading.jsx — Single Chapter with Swipe Navigation (Kindle-style)
 * WITH Multi-Color Highlighting & Dialogue Bottom Sheet
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

export default function SwipeReading({
  hideVerseNumbers = false,
  chapterlessMode = false,
  textSize = 1.0,
  translation = "VSV",
  theme = "classic",
  onReadingContext,
  onScrollProgress,
  navigationTarget,
  onNavigationComplete,
  isModalOpen = false,
  uiMode = "reading",
  onUiModeChange,
  reflectionOpen = false,
  onReflectionOpenChange,
}) {
  const [verses, setVerses] = useState([]);
  const [title, setTitle] = useState("");
  const [book, setBook] = useState("genesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [loading, setLoading] = useState(true);

  const [reflectionSummary, setReflectionSummary] = useState("");

  const scrollRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(0);
  const lastScrollTop = useRef(0);
  const navOffsetRef = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Highlighting state (verse-level storage with colorId)
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
     Load Single Chapter
  ================================ */
  useEffect(() => {
    let cancelled = false;

    async function loadSingleChapter() {
      setLoading(true);
      setVerses([]);
      setTitle("");

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
        const versesData = chapterData?.verses ?? chapterData;

        let verseItems = [];
        if (Array.isArray(versesData)) {
          verseItems = versesData;
        } else if (typeof versesData === "object" && versesData !== null) {
          verseItems = Object.entries(versesData).map(([verse, text]) => ({
            verse: Number(verse),
            text,
          }));
        }

        setVerses(verseItems);
        setTitle(chapterTitle);

        // Scroll to top
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
          scrollRef.current.scrollLeft = 0;
        }

        // Update reading context
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
   Swipe Navigation with Premium Drag Preview
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
     Scroll Progress (Nav Fade)
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
     Highlighting Helper Functions
  ================================ */
  function getVerseKey(verseNum) {
    return `${book}-${currentChapter}-${verseNum}-${translation}`;
  }

  function isVerseHighlighted(verseNum) {
    const key = getVerseKey(verseNum);
    return highlights[key] || null;
  }

  function getExistingColorForSelection() {
    if (selectedVerses.length === 0) return null;

    const firstKey = getVerseKey(selectedVerses[0].verse);
    const firstHighlight = highlights[firstKey];

    if (!firstHighlight) return null;

    // Check if all verses have same colorId
    const allSameColor = selectedVerses.every((v) => {
      const key = getVerseKey(v.verse);
      return highlights[key]?.colorId === firstHighlight.colorId;
    });

    return allSameColor ? firstHighlight.colorId : null;
  }

  function getVerseHighlightColor(verseNum) {
    const highlight = isVerseHighlighted(verseNum);
    if (!highlight) return null;

    // Resolve color from colorId + theme
    const colorObj = getColorFromId(highlight.colorId, highlight.theme);
    return colorObj.color;
  }

  /* ===============================
     Highlighting Action Functions
  ================================ */
  function handleVerseClick(verse) {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedVerses([verse]);
      // Auto-open highlight panel immediately
      setHighlightPanelOpen(true);
      // Set UI mode to highlighting
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
          // Return to reading mode
          onUiModeChange?.("reading");
        }
        setSelectedVerses(newSelection);
      } else {
        const newSelection = [...selectedVerses, verse].sort(
          (a, b) => a.verse - b.verse,
        );
        setSelectedVerses(newSelection);
      }
    }
  }

  function handleOpenHighlightPanel() {
    setHighlightPanelOpen(true);
  }

  function handleColorSelected(colorOption) {
    setSelectedColor(colorOption);
    setHighlightPanelOpen(false);

    // Save highlights immediately (verse-level)
    const newHighlights = { ...highlights };
    selectedVerses.forEach((verse) => {
      const key = getVerseKey(verse.verse);
      newHighlights[key] = {
        colorId: colorOption.id,
        theme: theme,
        book: book,
        chapter: currentChapter,
        verse: verse.verse,
        translation: translation,
        text: verse.text,
        createdAt: new Date().toISOString(),
      };
    });

    setHighlights(newHighlights);
    localStorage.setItem("verseHighlights", JSON.stringify(newHighlights));

    // Open dialogue sheet and set UI mode to dialogue
    setDialogueBottomSheetOpen(true);
    onUiModeChange?.("dialogue");
  }

  function handleClearHighlights() {
    const newHighlights = { ...highlights };

    selectedVerses.forEach((verse) => {
      const key = getVerseKey(verse.verse);
      delete newHighlights[key];
    });

    setHighlights(newHighlights);
    localStorage.setItem("verseHighlights", JSON.stringify(newHighlights));

    // Clear selection and return to reading mode
    setSelectedVerses([]);
    setIsSelectionMode(false);
    setHighlightPanelOpen(false);
    onUiModeChange?.("reading");
  }

  function handleDialogueClose() {
    // Highlights already saved, just clear selection
    setSelectedVerses([]);
    setIsSelectionMode(false);
    setDialogueBottomSheetOpen(false);
    setSelectedColor(null);
    // Return to reading mode
    onUiModeChange?.("reading");
  }

  function handleCancelSelection() {
    setSelectedVerses([]);
    setIsSelectionMode(false);
    setHighlightPanelOpen(false);
    // Return to reading mode
    onUiModeChange?.("reading");
  }

  /* ===============================
     Load Chapter Summary
  ================================ */
  async function loadChapterSummary(chapterNum) {
    try {
      const base = import.meta.env.BASE_URL;
      let reflectionFolder;

      if (translation === "AKT" || translation === "akt") {
        reflectionFolder = "akt";
      } else if (translation === "ASR" || translation === "asr") {
        reflectionFolder = "asr";
      } else {
        reflectionFolder = "vsv";
      }

      const res = await fetch(
        `${base}data/summaries/${reflectionFolder}/${book}/${chapterNum}.json`,
      );
      const data = await res.json();
      setReflectionSummary(data.summary);
    } catch (err) {
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
      style={{
        height: "100%",
        maxHeight: "100%",
      }}
    >
      <main
        ref={scrollRef}
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
          paddingLeft: "24px",
          paddingRight: "24px",
          WebkitOverflowScrolling: "touch",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Chapter Title */}
        {!chapterlessMode && (
          <>
            <div
              className="
                my-16
                text-center
                tracking-wide
                opacity-85
                text-[var(--text-accent)]
                font-[var(--font-ui)]
                font-semibold
                !text-[26px]
              "
            >
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

        {/* Verses */}
        <div className="space-y-6">
          {verses.map((v) => {
            const isSelected = selectedVerses.some(
              (sv) => sv.verse === v.verse,
            );
            const highlightColor = getVerseHighlightColor(v.verse);

            return (
              <p
                key={v.verse}
                data-chapter={currentChapter}
                onClick={() => handleVerseClick(v)}
                className="leading-[var(--line-height)] text-[var(--text-primary)] font-[var(--font-body)] cursor-pointer transition-all"
                style={{
                  fontSize: `${textSize * 16}px`,
                  background: highlightColor || "transparent",
                  border: isSelected
                    ? "2px solid var(--text-accent)"
                    : highlightColor
                      ? "none"
                      : "none",
                  borderRadius: isSelected || highlightColor ? "0.5rem" : "0",
                  padding:
                    isSelected || highlightColor ? "0.25rem 0.5rem" : "0",
                  margin: isSelected || highlightColor ? "0.25rem 0" : "0",
                  color: "var(--text-primary)",
                  opacity: isSelected ? 0.8 : 1,
                }}
              >
                {!chapterlessMode && !hideVerseNumbers && (
                  <sup
                    className="mr-2 select-none text-[var(--text-accent)] opacity-[var(--verse-opacity)] font-[var(--font-verse)]"
                    style={{ fontSize: `${textSize * 0.75}rem` }}
                  >
                    {v.verse}
                  </sup>
                )}
                {v.text}
              </p>
            );
          })}
        </div>

        {/* Chapter End Reflection */}
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

      {/* YouVersion-Style Highlight Panel */}
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
      />
    </div>
  );
}
