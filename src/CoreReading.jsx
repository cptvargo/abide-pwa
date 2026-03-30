/**
 * CoreReading.jsx — Continuous Scripture Scroll
 * FIXED: Chapterless mode now properly hides book titles, chapter titles, and verse numbers
 * FIXED: NaN verse numbers — non-numeric keys filtered out
 * FIXED: Psalm 119 style sectioned verses (sections[].verses) flattened correctly
 * ADDED: isAudioPlaying prop — fades text during audio playback
 */

import { useEffect, useState, useRef } from "react";
import { loadChapter } from "./lib/bible";
import { getBookDisplayName } from "./lib/bibleStructure";
import ChapterReflectionPanel from "./components/ChapterReflectionPanel";

export default function CoreReading({
  hideVerseNumbers = false,
  chapterlessMode = false,
  textSize = 1.0,
  translation = "VSV",
  isAudioPlaying = false, // ← NEW: from AppShell, drives text fade
  onReadingContext,
  onScrollProgress,
  navigationTarget,
  onNavigationComplete,
}) {
  /* ===============================
     Scripture State
  ================================ */
  const [verses, setVerses] = useState([]);
  const [book, setBook] = useState("genesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState([]);

  const loadedChaptersRef = useRef(new Set());

  // ── Safe text extractor ──
  const safeText = (val) => {
    if (typeof val === "string") return val;
    if (val && typeof val === "object") return val.text ?? "";
    return "";
  };

  /* ===============================
     Chapter Reflection State
  ================================ */
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [reflectionChapter, setReflectionChapter] = useState(null);
  const [reflectionSummary, setReflectionSummary] = useState("");

  /* ===============================
     Scroll State
  ================================ */
  const scrollRef = useRef(null);
  const lastScrollTop = useRef(0);
  const navOffsetRef = useRef(0);

  // ── Scroll lock during audio playback ──
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.style.overflow = isAudioPlaying ? "hidden" : "";
  }, [isAudioPlaying]);

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
     Load & Append Chapter
  ================================ */
  async function appendChapter(chapterNumber, bookId = book) {
    if (loadedChaptersRef.current.has(chapterNumber)) return;

    setLoading(true);
    loadedChaptersRef.current.add(chapterNumber);

    const rawData = await loadChapter(
      bookId,
      chapterNumber,
      translation.toLowerCase(),
    );

    const chapterData = rawData.chapters
      ? rawData.chapters[String(chapterNumber)]
      : rawData;

    const title = chapterData?.title ?? null;
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
        chapter: chapterNumber,
      }));
    } else if (typeof flatVersesData === "object" && flatVersesData !== null) {
      verseItems = Object.entries(flatVersesData)
        .filter(([verse]) => !isNaN(Number(verse)) && verse.trim() !== "")
        .map(([verse, val]) => ({
          verse: Number(verse),
          text: safeText(val),
          speaker: typeof val === "object" ? (val.speaker ?? null) : null,
          chapter: chapterNumber,
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
        sectionStartVerses.find((s) => s.startVerse === v.verse)?.title ?? null,
    }));

    const newVerses = [];

    if (!chapterlessMode) {
      newVerses.push({ type: "divider", chapter: chapterNumber });
    }

    if (!chapterlessMode && title) {
      newVerses.push({ type: "title", text: title, chapter: chapterNumber });
    }

    newVerses.push(...verseItems);

    setVerses((prev) => [...prev, ...newVerses]);
    setLoading(false);
  }

  /* ===============================
     Load Chapter Summary
  ================================ */
  async function loadChapterSummary(chapterNumber) {
    try {
      const base = import.meta.env.BASE_URL;
      const res = await fetch(
        `${base}data/summaries/vsv/${book}/${chapterNumber}.json`,
      );
      const data = await res.json();
      setReflectionSummary(data.summary);
    } catch (err) {
      console.error("Failed to load chapter summary", err);
      setReflectionSummary(
        "This chapter invites reflection on God's work and purpose.",
      );
    }
  }

  /* ===============================
     Initial Load
  ================================ */
  useEffect(() => {
    setVerses([]);
    loadedChaptersRef.current.clear();
    setCurrentChapter(1);
    appendChapter(1);
    onReadingContext?.({ book: getBookDisplayName(book), chapter: 1 });
  }, [translation]);

  /* ===============================
     Reload when chapterlessMode changes
  ================================ */
  useEffect(() => {
    setVerses([]);
    loadedChaptersRef.current.clear();
    setCurrentChapter(1);
    appendChapter(1);
  }, [chapterlessMode]);

  /* ===============================
     Handle Navigation Target
  ================================ */
  useEffect(() => {
    if (!navigationTarget) return;

    const newBook = navigationTarget.book;

    setBook(newBook);
    setVerses([]);
    loadedChaptersRef.current.clear();
    setCurrentChapter(navigationTarget.chapter);
    appendChapter(navigationTarget.chapter, newBook);

    onNavigationComplete?.();
  }, [navigationTarget]);

  /* ===============================
     Scroll Behavior
  ================================ */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function handleScroll() {
      const { scrollTop, scrollHeight, clientHeight } = el;
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

      const nearBottom = scrollTop + clientHeight >= scrollHeight - 120;
      if (nearBottom && !loading) {
        appendChapter(currentChapter + 1);
        setCurrentChapter((c) => c + 1);
      }

      const verseNodes = el.querySelectorAll("[data-chapter]");
      for (const node of verseNodes) {
        const rect = node.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < window.innerHeight * 0.4) {
          const chapter = Number(node.dataset.chapter);
          onReadingContext?.({ book: getBookDisplayName(book), chapter });
          break;
        }
      }
    }

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [currentChapter, loading, onScrollProgress, onReadingContext]);

  /* ===============================
     Render
  ================================ */
  return (
    <div className="no-select flex flex-col h-screen">
      <main
        ref={scrollRef}
        className="reader flex-1 overflow-y-auto px-6 pt-6 pb-32"
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
          {verses.map((v, idx) => {
            const isLastVerseOfChapter =
              !v.type && verses[idx + 1]?.chapter !== v.chapter;

            if (v.type === "divider") {
              return (
                <div
                  key={`divider-${v.chapter}`}
                  className="my-16 text-center tracking-wide opacity-85 text-[var(--text-accent)] font-[var(--font-ui)] font-semibold !text-[26px]"
                >
                  {getBookDisplayName(book)} {v.chapter}
                </div>
              );
            }

            if (v.type === "title") {
              return (
                <div
                  key={`title-${v.chapter}`}
                  className="my-12 flex flex-col items-center"
                >
                  <div className="w-24 h-px mb-4 bg-[var(--text-accent)] opacity-20" />
                  <div className="text-center font-[var(--font-ui)] text-[15px] font-semibold tracking-wide text-[var(--text-secondary)] opacity-80">
                    {v.text}
                  </div>
                  <div className="w-24 h-px mt-4 bg-[var(--text-accent)] opacity-20" />
                </div>
              );
            }

            return (
              <div key={`${v.chapter}-${v.verse}-${idx}`}>
                {v.sectionTitle && <SectionTitle title={v.sectionTitle} />}
                <p
                  data-chapter={v.chapter}
                  className={`mb-6 leading-[var(--line-height)] font-[var(--font-body)] ${v.speaker === "Jesus" ? "jesus" : "text-[var(--text-primary)]"}`}
                  style={{ fontSize: `${textSize}rem` }}
                >
                  {!chapterlessMode && (
                    <sup
                      className="mr-2 select-none text-[var(--text-accent)] opacity-[var(--verse-opacity)] font-[var(--font-verse)]"
                      style={{ fontSize: `${textSize * 0.75}rem` }}
                    >
                      {v.verse}
                    </sup>
                  )}
                  {v.text}
                </p>

                {isLastVerseOfChapter && !chapterlessMode && (
                  <div className="mt-16 mb-24 text-center opacity-70">
                    <div className="mx-auto mb-4 h-px w-24 bg-[var(--text-accent)] opacity-20" />
                    <button
                      onClick={() => {
                        setReflectionChapter(v.chapter);
                        loadChapterSummary(v.chapter);
                        setReflectionOpen(true);
                      }}
                      className="inline-flex items-center gap-2 text-sm font-[var(--font-ui)] tracking-wide text-[var(--text-secondary)] hover:opacity-100 transition-opacity"
                      aria-label="Open chapter reflection"
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
            );
          })}

          {loading && (
            <div className="text-center text-sm opacity-50 mt-12">Loading…</div>
          )}
        </div>
        {/* end scripture fade wrapper */}
      </main>

      <ChapterReflectionPanel
        open={reflectionOpen}
        onClose={() => setReflectionOpen(false)}
        book={getBookDisplayName(book)}
        chapter={reflectionChapter}
        summary={reflectionSummary}
      />
    </div>
  );
}
