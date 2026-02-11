/**
 * SwipeReading.jsx — Single Chapter with Swipe Navigation (Kindle-style)
 * WITH Multi-Color Highlighting & Ponder Mode
 */

import { useEffect, useState, useRef } from "react";
import { loadChapter } from "./lib/bible";
import ChapterReflectionPanel from "./components/ChapterReflectionPanel";
import {
  SelectionToolbar,
  ColorPicker,
  PonderPrompt,
  PonderMode,
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
}) {
  const [verses, setVerses] = useState([]);
  const [title, setTitle] = useState("");
  const [book, setBook] = useState("genesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [loading, setLoading] = useState(true);

  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [reflectionSummary, setReflectionSummary] = useState("");

  const scrollRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const lastScrollTop = useRef(0);
  const navOffsetRef = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Highlighting state
  const [selectedVerses, setSelectedVerses] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [ponderPromptOpen, setPonderPromptOpen] = useState(false);
  const [ponderModeOpen, setPonderModeOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [highlights, setHighlights] = useState(() => {
    const saved = localStorage.getItem("highlights");
    return saved ? JSON.parse(saved) : [];
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
        }

        // Update reading context
        onReadingContext?.({
          book: book.charAt(0).toUpperCase() + book.slice(1),
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
     Handle Navigation Target
  ================================ */
  useEffect(() => {
    if (!navigationTarget) return;

    setBook(navigationTarget.book);
    setCurrentChapter(navigationTarget.chapter);
    onNavigationComplete?.();
  }, [navigationTarget, onNavigationComplete]);

  /* ===============================
     Swipe Navigation with Drag Preview
  ================================ */
  function handleTouchStart(e) {
    // Don't start swipe if in selection mode
    if (isSelectionMode) return;

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(false);
  }

  function handleTouchMove(e) {
    if (!touchStartX.current || isSelectionMode) return;

    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    const diffX = touchCurrentX - touchStartX.current;
    const diffY = touchCurrentY - touchStartY.current;

    // Only swipe if horizontal movement is greater than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      setIsSwiping(true);
      setSwipeOffset(diffX);
      e.preventDefault();
    }
  }

  function handleTouchEnd(e) {
    if (!isSwiping) {
      setSwipeOffset(0);
      return;
    }

    const threshold = 75;
    const shouldChangePage = Math.abs(swipeOffset) > threshold;

    if (shouldChangePage) {
      if (swipeOffset < 0) {
        // Swipe left - next chapter
        setCurrentChapter((c) => c + 1);
      } else {
        // Swipe right - previous chapter
        if (currentChapter > 1) {
          setCurrentChapter((c) => c - 1);
        }
      }
    }

    // Reset
    setSwipeOffset(0);
    setIsSwiping(false);
    touchStartX.current = 0;
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

      // Nav offset calculation
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
     Highlighting Functions
  ================================ */
  function handleVerseClick(verse) {
    if (!isSelectionMode) {
      // First tap - enter selection mode
      setIsSelectionMode(true);
      setSelectedVerses([verse]);
    } else {
      // Toggle verse in selection
      const isSelected = selectedVerses.some((v) => v.verse === verse.verse);

      if (isSelected) {
        const newSelection = selectedVerses.filter(
          (v) => v.verse !== verse.verse,
        );
        if (newSelection.length === 0) {
          setIsSelectionMode(false);
        }
        setSelectedVerses(newSelection);
      } else {
        // Add to selection (keep sorted)
        const newSelection = [...selectedVerses, verse].sort(
          (a, b) => a.verse - b.verse,
        );
        setSelectedVerses(newSelection);
      }
    }
  }

  function handleOpenColorPicker() {
    setColorPickerOpen(true);
  }

  function handleColorSelected(colorOption) {
    setSelectedColor(colorOption);
    setColorPickerOpen(false);
    setPonderPromptOpen(true);
  }

  function handleEnterPonder() {
    setPonderPromptOpen(false);
    setPonderModeOpen(true);
  }

  function handleSkipPonder() {
    // Save highlight without reflection
    const highlightData = {
      verses: selectedVerses,
      verseRange:
        selectedVerses.length === 1
          ? selectedVerses[0].verse
          : `${selectedVerses[0].verse}-${selectedVerses[selectedVerses.length - 1].verse}`,
      book,
      chapter: currentChapter,
      text: selectedVerses.map((v) => v.text).join(" "),
      color: selectedColor,
      reflection: "",
      createdAt: new Date().toISOString(),
      id: Date.now().toString(),
    };

    const newHighlights = [...highlights, highlightData];
    setHighlights(newHighlights);
    localStorage.setItem("highlights", JSON.stringify(newHighlights));

    // Clear selection
    setSelectedVerses([]);
    setIsSelectionMode(false);
    setPonderPromptOpen(false);
    setSelectedColor(null);
  }

  function handlePonderClose(highlightData) {
    if (highlightData) {
      // Already saved in PonderMode
      setHighlights(JSON.parse(localStorage.getItem("highlights") || "[]"));
    }

    // Clear selection
    setSelectedVerses([]);
    setIsSelectionMode(false);
    setPonderModeOpen(false);
    setSelectedColor(null);
  }

  function handleCancelSelection() {
    setSelectedVerses([]);
    setIsSelectionMode(false);
  }

  function isVerseHighlighted(verseNum) {
    return highlights.find(
      (h) =>
        h.chapter === currentChapter &&
        h.book === book &&
        h.verses.some((v) => v.verse === verseNum),
    );
  }

  function getVerseHighlightColor(verseNum) {
    const highlight = isVerseHighlighted(verseNum);
    return highlight ? highlight.color.color : null;
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
    setReflectionOpen(true);
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
    <div className="no-select flex flex-col h-screen overflow-hidden">
      <main
        ref={scrollRef}
        className="reader flex-1 overflow-y-auto px-6 pt-6 pb-32"
        style={{
          opacity: isSwiping
            ? Math.max(0.3, 1 - Math.abs(swipeOffset) / 200)
            : 1,
          transition: isSwiping ? "none" : "opacity 0.2s ease-out",
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
              {book.charAt(0).toUpperCase() + book.slice(1)} {currentChapter}
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
                  fontSize: `${textSize}rem`,
                  background: isSelected
                    ? "var(--text-accent)"
                    : highlightColor || "transparent",
                  color: isSelected
                    ? "var(--text-inverse)"
                    : "var(--text-primary)",
                  padding:
                    isSelected || highlightColor ? "0.25rem 0.5rem" : "0",
                  margin: isSelected || highlightColor ? "0.25rem 0" : "0",
                  borderRadius: isSelected || highlightColor ? "0.5rem" : "0",
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

      {/* Highlighting UI */}
      {isSelectionMode && (
        <SelectionToolbar
          selectedCount={selectedVerses.length}
          onHighlight={handleOpenColorPicker}
          onCancel={handleCancelSelection}
        />
      )}

      {colorPickerOpen && (
        <ColorPicker
          theme={theme}
          onSelectColor={handleColorSelected}
          onCancel={() => setColorPickerOpen(false)}
        />
      )}

      {ponderPromptOpen && selectedColor && (
        <PonderPrompt
          selectedVerses={selectedVerses}
          highlightColor={selectedColor}
          onEnterPonder={handleEnterPonder}
          onSkip={handleSkipPonder}
        />
      )}

      {ponderModeOpen && selectedColor && (
        <PonderMode
          selectedVerses={selectedVerses}
          highlightColor={selectedColor}
          book={book.charAt(0).toUpperCase() + book.slice(1)}
          chapter={currentChapter}
          onClose={handlePonderClose}
          audioUrl="/audio/meditation.mp3"
        />
      )}

      <ChapterReflectionPanel
        open={reflectionOpen}
        onClose={() => setReflectionOpen(false)}
        book={book.charAt(0).toUpperCase() + book.slice(1)}
        chapter={currentChapter}
        summary={reflectionSummary}
      />
    </div>
  );
}
