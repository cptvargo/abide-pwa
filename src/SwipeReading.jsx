/**
 * SwipeReading.jsx — Single Chapter with Swipe Navigation (Kindle-style)
 * WITH Multi-Color Highlighting & Dialogue Bottom Sheet
 * FIXED: NaN verse numbers — non-numeric keys filtered out
 * FIXED: Psalm 119 style sectioned verses (sections[].verses) flattened correctly
 * ADDED: isAudioPlaying prop — fades text during audio playback
 * ADDED: segments support for inline speaker rendering
 */

import { useEffect, useState, useRef } from "react";
import { loadChapter } from "./lib/bible";
import ChapterReflectionPanel from "./components/ChapterReflectionPanel";
import { BIBLE_ORDER, CHAPTER_COUNT } from "./lib/bibleStructure";
import { getBookDisplayName } from "./lib/bibleStructure";
import {
  HighlightPanel,
  DialogueBottomSheet,
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
  isAudioPlaying = false,
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
  const [book, setBook] = useState(() => localStorage.getItem("lastBookId") || "genesis");
  const [currentChapter, setCurrentChapter] = useState(() => {
    try {
      const saved = localStorage.getItem("lastReadingPosition");
      return saved ? (JSON.parse(saved).chapter ?? 1) : 1;
    } catch {
      return 1;
    }
  });
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
  const savedScrollTop = useRef(0);

  // Highlighting state
  const [selectedVerses, setSelectedVerses] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [highlightPanelOpen, setHighlightPanelOpen] = useState(false);
  const [dialogueBottomSheetOpen, setDialogueBottomSheetOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [pendingTags, setPendingTags] = useState([]);
  const [highlights, setHighlights] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("verseHighlights") || "{}");
    // Migrate old theme-keyed highlights (book-ch-v-translation-theme) → (book-ch-v-translation)
    const THEMES = ["classic","still-waters","stone-fire","olive-parchment","parchment"];
    let needsMigration = false;
    const migrated = {};
    for (const [key, val] of Object.entries(saved)) {
      let newKey = key;
      for (const t of THEMES) {
        if (key.endsWith(`-${t}`)) { newKey = key.slice(0, -(t.length + 1)); needsMigration = true; break; }
      }
      if (!migrated[newKey] || new Date(val.createdAt) > new Date(migrated[newKey].createdAt)) {
        migrated[newKey] = val;
      }
    }
    if (needsMigration) localStorage.setItem("verseHighlights", JSON.stringify(migrated));
    return needsMigration ? migrated : saved;
  });

  // ── Scroll lock during audio playback ──
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.style.overflow = isAudioPlaying ? "hidden" : "";
  }, [isAudioPlaying]);

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
            segments: v.segments ?? null,
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
              text:
                typeof val === "object" && val.segments
                  ? val.segments.map((s) => s.text).join("")
                  : safeText(val),
              segments:
                typeof val === "object" && val.segments ? val.segments : null,
              speaker:
                typeof val === "object" && !val.segments
                  ? (val.speaker ?? null)
                  : null,
            }));
        }

        const sectionStartVerses = chapterSections.map((s) => {
          if (s.startVerse != null)
            return { startVerse: s.startVerse, title: s.title };
          const firstKey = s.verses ? Number(Object.keys(s.verses)[0]) : null;
          return { startVerse: firstKey, title: s.title };
        });

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

  // Restore scroll position after paddingBottom change reflows the container
  useEffect(() => {
    if (highlightPanelOpen && scrollRef.current) {
      const saved = savedScrollTop.current;
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = saved;
      });
    }
  }, [highlightPanelOpen]);

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
    // Use the saved color's palette position to pick the equivalent color in the current theme
    const savedPalette = getThemeColors(highlight.theme || theme);
    const idx = savedPalette.findIndex((c) => c.id === highlight.colorId);
    const currentPalette = getThemeColors(theme);
    return (currentPalette[idx >= 0 ? idx : 0]).color;
  }

  /* ===============================
     Highlighting Actions
  ================================ */
  function handleVerseClick(verse) {
    if (!isSelectionMode) {
      savedScrollTop.current = scrollRef.current?.scrollTop ?? 0;
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

  function handleColorSelected(colorOption, tags = pendingTags) {
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
        tags: tags,
        createdAt: new Date().toISOString(),
      };
    });

    setHighlights(newHighlights);
    localStorage.setItem("verseHighlights", JSON.stringify(newHighlights));
    setPendingTags([]);
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
     Verse content renderer
  ================================ */
  function renderVerseContent(v) {
    if (v.segments) {
      return v.segments.map((seg, i) => (
        <span key={i} className={seg.speaker === "Jesus" ? "jesus" : ""}>
          {seg.text}
        </span>
      ));
    }
    return v.text;
  }

  /* ===============================
     Per-theme selection colors
     (--accent-rgb not defined on every theme, so use explicit values)
  ================================ */
  const SELECTION_BG = {
    classic:           "rgba(203,178,124,0.32)",
    "still-waters":    "rgba(126,208,216,0.28)",
    "stone-fire":      "rgba(249,115,22,0.26)",
    "olive-parchment": "rgba(214,200,159,0.28)",
    parchment:         "rgba(139,107,70,0.22)",
  };
  const SELECTION_RING = {
    classic:           "rgba(203,178,124,0.6)",
    "still-waters":    "rgba(126,208,216,0.6)",
    "stone-fire":      "rgba(249,115,22,0.6)",
    "olive-parchment": "rgba(214,200,159,0.55)",
    parchment:         "rgba(139,107,70,0.55)",
  };
  const selectionBg   = SELECTION_BG[theme]   || SELECTION_BG.classic;
  const selectionRing = SELECTION_RING[theme] || SELECTION_RING.classic;

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
  const showSwipeIndicator = isSwiping && swipeProgress > 0.1;

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
          paddingBottom: highlightPanelOpen
            ? "max(120px, calc(120px + env(safe-area-inset-bottom)))"
            : "max(128px, calc(128px + env(safe-area-inset-bottom)))",
          paddingLeft: chapterlessMode ? "40px" : "24px",
          paddingRight: chapterlessMode ? "40px" : "24px",
          WebkitOverflowScrolling: "touch",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Scripture content — fades during audio playback ── */}
        <div
          style={{
            opacity: isAudioPlaying ? 0.08 : 1,
            filter: isAudioPlaying ? "blur(2px)" : "none",
            transition: "opacity 0.6s ease, filter 0.6s ease",
            pointerEvents: isAudioPlaying ? "none" : "auto",
          }}
        >
          {/* ── Standard Mode: Chapter Title ── */}
          {!chapterlessMode && (
            <div style={{ textAlign: "center", padding: "52px 0 44px" }}>
              <div
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-ui, system-ui)",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "var(--text-accent)",
                  opacity: 0.45,
                  marginBottom: "18px",
                }}
              >
                {getBookDisplayName(book)}
              </div>
              <div
                style={{
                  fontSize: "68px",
                  fontFamily: "var(--font-chapterless, Georgia, serif)",
                  fontWeight: 300,
                  lineHeight: 1,
                  color: "var(--text-accent)",
                  opacity: 0.88,
                }}
              >
                {currentChapter}
              </div>
              {title && (
                <div
                  style={{
                    fontSize: "13px",
                    fontFamily: "var(--font-ui, system-ui)",
                    color: "var(--text-primary)",
                    opacity: 0.4,
                    marginTop: "18px",
                    fontStyle: "italic",
                    letterSpacing: "0.04em",
                  }}
                >
                  {title}
                </div>
              )}
              <div
                style={{
                  width: "40px",
                  height: "1px",
                  background: "var(--text-accent)",
                  opacity: 0.18,
                  margin: "22px auto 0",
                }}
              />
            </div>
          )}

          {/* ── Standard Mode: Inline prose verses ── */}
          {!chapterlessMode && (() => {
            // Group verses: break at section titles, then every 8 verses for breathing room
            const PARA_SIZE = 8;
            const groups = [];
            let curr = { sectionTitle: null, verses: [] };
            for (const v of verses) {
              if (v.sectionTitle && curr.verses.length > 0) {
                groups.push(curr);
                curr = { sectionTitle: v.sectionTitle, verses: [] };
              } else if (v.sectionTitle) {
                curr.sectionTitle = v.sectionTitle;
              } else if (curr.verses.length > 0 && curr.verses.length % PARA_SIZE === 0) {
                groups.push(curr);
                curr = { sectionTitle: null, verses: [] };
              }
              curr.verses.push(v);
            }
            if (curr.verses.length > 0) groups.push(curr);

            return (
              <div>
                {groups.map((group, gIdx) => (
                  <div key={gIdx}>
                    {group.sectionTitle && <SectionTitle title={group.sectionTitle} />}
                    <p
                      style={{
                        fontFamily: "var(--font-chapterless)",
                        fontSize: `${textSize * 16.5}px`,
                        lineHeight: "var(--line-height, 2.1)",
                        color: "var(--text-primary)",
                        marginBottom: "2.4em",
                        textIndent: "1.5em",
                      }}
                    >
                      {group.verses.map((v) => {
                        const isSelected = selectedVerses.some(sv => sv.verse === v.verse);
                        const highlightColor = getVerseHighlightColor(v.verse);
                        return (
                          <span
                            key={v.verse}
                            data-chapter={currentChapter}
                            onClick={() => handleVerseClick(v)}
                            className={v.speaker === "Jesus" && !v.segments ? "jesus" : ""}
                            style={{ cursor: "pointer" }}
                          >
                            {!hideVerseNumbers && (
                              <sup
                                className="select-none"
                                style={{
                                  marginRight: "3px",
                                  fontSize: `${textSize * 0.7}rem`,
                                  color: "var(--text-accent)",
                                  opacity: "var(--verse-opacity, 0.5)",
                                  fontFamily: "var(--font-verse)",
                                  fontStyle: "normal",
                                  verticalAlign: "super",
                                }}
                              >
                                {v.verse}
                              </sup>
                            )}
                            <span
                              style={{
                                background: highlightColor
                                  ? highlightColor.replace(/[\d.]+\)$/, "0.55)")
                                  : isSelected
                                    ? selectionBg
                                    : "transparent",
                                borderRadius: "2px",
                                padding: (highlightColor || isSelected) ? "1px 2px" : "0",
                                transition: "background 0.12s ease",
                                outline: isSelected
                                  ? `1.5px solid ${selectionRing}`
                                  : "none",
                              }}
                            >
                              {renderVerseContent(v)}
                            </span>
                            {" "}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ── Chapterless Mode: Book Format ── */}
          {chapterlessMode && (
            <>
              {/* Book-style chapter heading */}
              <div style={{ textAlign: "center", padding: "52px 0 44px" }}>
                <div
                  style={{
                    fontSize: "10px",
                    fontFamily: "var(--font-ui, system-ui)",
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "var(--text-accent)",
                    opacity: 0.45,
                    marginBottom: "18px",
                  }}
                >
                  {getBookDisplayName(book)}
                </div>
                <div
                  style={{
                    fontSize: "68px",
                    fontFamily: "var(--font-chapterless, Georgia, serif)",
                    fontWeight: 300,
                    lineHeight: 1,
                    color: "var(--text-accent)",
                    opacity: 0.88,
                  }}
                >
                  {currentChapter}
                </div>
                {title && (
                  <div
                    style={{
                      fontSize: "13px",
                      fontFamily: "var(--font-ui, system-ui)",
                      color: "var(--text-primary)",
                      opacity: 0.4,
                      marginTop: "18px",
                      fontStyle: "italic",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {title}
                  </div>
                )}
                <div
                  style={{
                    width: "40px",
                    height: "1px",
                    background: "var(--text-accent)",
                    opacity: 0.18,
                    margin: "22px auto 0",
                  }}
                />
              </div>

              {/* Prose paragraphs — inline verse numbers + underline highlights */}
              <div>
                {paragraphGroups.map((group, groupIdx) => {
                  const sectionTitle = group[0]?.sectionTitle ?? null;
                  return (
                    <div key={groupIdx}>
                      {sectionTitle && <SectionTitle title={sectionTitle} />}
                      <p
                        style={{
                          fontSize: `${textSize * 17}px`,
                          lineHeight: "var(--line-height, 2.1)",
                          fontFamily: "var(--font-chapterless)",
                          color: "var(--text-primary)",
                          marginBottom: "2.4em",
                          textIndent: "1.75em",
                        }}
                      >
                        {group.map((v) => {
                          const isSelected = selectedVerses.some(sv => sv.verse === v.verse);
                          const highlightColor = getVerseHighlightColor(v.verse);
                          return (
                            <span
                              key={v.verse}
                              onClick={() => handleVerseClick(v)}
                              className={v.speaker === "Jesus" && !v.segments ? "jesus" : ""}
                              style={{ cursor: "pointer" }}
                            >
                              {!hideVerseNumbers && (
                                <sup
                                  className="select-none"
                                  style={{
                                    marginRight: "3px",
                                    fontSize: `${textSize * 0.7}rem`,
                                    color: "var(--text-accent)",
                                    opacity: "var(--verse-opacity, 0.5)",
                                    fontFamily: "var(--font-verse)",
                                    fontStyle: "normal",
                                    verticalAlign: "super",
                                  }}
                                >
                                  {v.verse}
                                </sup>
                              )}
                              <span
                                style={{
                                  background: highlightColor
                                    ? highlightColor.replace(/[\d.]+\)$/, "0.55)")
                                    : isSelected
                                      ? "rgba(var(--accent-rgb),0.28)"
                                      : "transparent",
                                  borderRadius: "2px",
                                  padding: (highlightColor || isSelected) ? "1px 2px" : "0",
                                  transition: "background 0.12s ease",
                                  outline: isSelected && !highlightColor
                                    ? "1.5px solid rgba(var(--accent-rgb),0.5)"
                                    : "none",
                                }}
                              >
                                {v.segments
                                  ? v.segments.map((seg, i) => (
                                      <span key={i} className={seg.speaker === "Jesus" ? "jesus" : ""}>
                                        {seg.text}
                                      </span>
                                    ))
                                  : safeText(v.text)}
                              </span>
                              {" "}
                            </span>
                          );
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
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
        </div>
        {/* end scripture fade wrapper */}
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
          onShare={async () => {
            const text = selectedVerses.map((v) => v.text).join(" ");
            const nums = selectedVerses.map((v) => v.verse).sort((a, b) => a - b);
            const range = nums.length > 1 ? `${nums[0]}-${nums[nums.length - 1]}` : `${nums[0]}`;
            const reference = `${getBookDisplayName(book)} ${currentChapter}:${range} ${translation}`;
            const { shareVerseAsImage } = await import("./ShareAsImage");
            shareVerseAsImage({ reference, text }, theme);
          }}
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
