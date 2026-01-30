/**
 * CoreReading.jsx — Continuous Scripture Scroll
 * Chapters append naturally, reverse scroll supported
 * Behavior only. Theme via CSS variables.
 */

import { useEffect, useState, useRef } from "react";
import { loadChapter } from "./lib/bible";
import VerseModal from "./components/VerseModal";
import { useGestureIntent } from "./hooks/useGestureIntent";

export default function CoreReading({
  hideVerseNumbers = false,
  onReadingContext,
  onScrollProgress,
}) {
  /* ===============================
     Scripture State
  ================================ */
  const [verses, setVerses] = useState([]);
  const [book] = useState("genesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadedChaptersRef = useRef(new Set());

  /* ===============================
     Modal State
  ================================ */
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [hebrewData, setHebrewData] = useState(null);
  const [insight, setInsight] = useState(null);

  /* ===============================
     Scroll State
  ================================ */
  const scrollRef = useRef(null);
  const lastScrollTop = useRef(0);
  const navOffsetRef = useRef(0);
  const gesture = useGestureIntent();

  /* ===============================
     Verse Study Loader
  ================================ */
  async function loadVerseData(verseNumber, chapter) {
    try {
      const base = import.meta.env.BASE_URL;

      const hebrew = await fetch(
        `${base}data/lexicon/hebrew/${book}/${chapter}.json`,
      ).then((r) => r.json());

      const insights = await fetch(
        `${base}data/insights/${book}/${chapter}.json`,
      ).then((r) => r.json());

      const verseText = verses.find(
        (v) => v.chapter === chapter && v.verse === verseNumber,
      )?.text;

      setSelectedVerse({
        ref: `${book} ${chapter}:${verseNumber}`,
        text: verseText,
      });

      setHebrewData(hebrew[String(verseNumber)] || null);

      const rawInsight = insights[verseNumber];
      setInsight(
        typeof rawInsight === "string"
          ? rawInsight
          : rawInsight?.insight || null,
      );

      setModalOpen(true);
    } catch (err) {
      console.error("Error loading verse data:", err);
    }
  }

  /* ===============================
     Load & Append Chapter
  ================================ */
  async function appendChapter(chapterNumber) {
    if (loadedChaptersRef.current.has(chapterNumber)) return;

    setLoading(true);
    loadedChaptersRef.current.add(chapterNumber);

    const data = await loadChapter(book, chapterNumber, "vsv");

    setVerses((prev) => [
      ...prev,
      { type: "divider", chapter: chapterNumber },
      ...data.map((v) => ({ ...v, chapter: chapterNumber })),
    ]);

    setLoading(false);
  }

  /* ===============================
     Initial Load
  ================================ */
  useEffect(() => {
    appendChapter(1);
    onReadingContext?.({ book: "Genesis", chapter: 1 });
  }, []);

  /* ===============================
     Scroll Behavior (GitHub-style)
  ================================ */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function handleScroll() {
      gesture.cancel();

      const { scrollTop, scrollHeight, clientHeight } = el;
      const delta = scrollTop - lastScrollTop.current;
      lastScrollTop.current = scrollTop;

      /* ⭐ Smooth nav fade (matches GitHub feel) */
      const DAMPING = 0.35;
      let next = navOffsetRef.current + delta * DAMPING;
      next = Math.max(0, Math.min(60, next));
      navOffsetRef.current = next;

      onScrollProgress?.(next / 60);

      /* 📜 Append next chapter near bottom */
      const nearBottom = scrollTop + clientHeight >= scrollHeight - 120;
      if (nearBottom && !loading) {
        appendChapter(currentChapter + 1);
        setCurrentChapter((c) => c + 1);
      }

      /* 🔁 Detect active chapter in viewport */
      const verseNodes = el.querySelectorAll("[data-chapter]");
      for (const node of verseNodes) {
        const rect = node.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < window.innerHeight * 0.4) {
          const chapter = Number(node.dataset.chapter);
          onReadingContext?.({ book: "Genesis", chapter });
          break;
        }
      }
    }

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [currentChapter, loading, onScrollProgress, onReadingContext, gesture]);

  /* ===============================
     Render
  ================================ */
  return (
    <div className="no-select flex flex-col h-screen">
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 pt-6 pb-32">
        {verses.map((v, idx) =>
          v.type === "divider" ? (
            <div
              key={`divider-${v.chapter}`}
              className="
                my-12
                text-center
                tracking-wide
                opacity-70
                text-[var(--text-accent)]
                font-[var(--font-ui)]
              "
            >
              Genesis {v.chapter}
            </div>
          ) : (
            <p
              key={`${v.chapter}-${v.verse}-${idx}`}
              data-chapter={v.chapter}
              onTouchStart={() =>
                gesture.begin?.(() => loadVerseData(v.verse, v.chapter), 500)
              }
              onTouchEnd={gesture.cancel}
              onTouchMove={gesture.cancel}
              className="
                mb-6
                text-[19px]
                leading-[var(--line-height)]
                text-[var(--text-primary)]
                font-[var(--font-body)]
              "
            >
              {!hideVerseNumbers && (
                <sup
                  className="
                    mr-2
                    select-none
                    text-[var(--text-accent)]
                    opacity-[var(--verse-opacity)]
                    text-[length:var(--verse-size)]
                    font-[var(--font-verse)]
                  "
                >
                  {v.verse}
                </sup>
              )}
              {v.text}
            </p>
          ),
        )}

        {loading && (
          <div className="text-center text-sm opacity-50 mt-12">Loading…</div>
        )}
      </main>

      <VerseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        verse={selectedVerse}
        hebrew={hebrewData}
        insight={insight}
      />
    </div>
  );
}
