/**
 * ChristRevealedJourney.jsx
 * Top-level orchestrator for the Christ Revealed feature.
 *
 * Navigation:
 *   - "Leave Journey" from any screen returns user to their last Bible position
 *   - Re-entering Christ Revealed resumes at the exact book AND chapter they left
 *
 * Progress persistence:
 *   - useCRProgress saves currentBook + currentChapter to localStorage on every
 *     chapter change via saveCurrentChapter()
 *   - On mount, progress.currentBook and progress.currentChapter are restored
 */

import { useState, useEffect, useCallback } from "react";
import {
  useCRProgress,
  LAST_OT_BOOK,
  ALL_BOOKS_IN_ORDER,
} from "./useCRProgress";
import ChristRevealedScreen from "./ChristRevealedScreen";
import ChristRevealedReader from "./ChristRevealedReader";
import BookTransition from "./BookTransition";
import NewTestamentUnlocked from "./NewTestamentUnlocked";

const BASE_URL = import.meta.env.BASE_URL || "/";

const DISPLAY_NAMES = {
  genesis: "Genesis",
  exodus: "Exodus",
  leviticus: "Leviticus",
  numbers: "Numbers",
  deuteronomy: "Deuteronomy",
  joshua: "Joshua",
  judges: "Judges",
  ruth: "Ruth",
  "1samuel": "1 Samuel",
  "2samuel": "2 Samuel",
  "1kings": "1 Kings",
  "2kings": "2 Kings",
  "1chronicles": "1 Chronicles",
  "2chronicles": "2 Chronicles",
  ezra: "Ezra",
  nehemiah: "Nehemiah",
  esther: "Esther",
  job: "Job",
  psalms: "Psalms",
  proverbs: "Proverbs",
  ecclesiastes: "Ecclesiastes",
  songofsolomon: "Song of Solomon",
  isaiah: "Isaiah",
  jeremiah: "Jeremiah",
  lamentations: "Lamentations",
  ezekiel: "Ezekiel",
  daniel: "Daniel",
  hosea: "Hosea",
  joel: "Joel",
  amos: "Amos",
  obadiah: "Obadiah",
  jonah: "Jonah",
  micah: "Micah",
  nahum: "Nahum",
  habakkuk: "Habakkuk",
  zephaniah: "Zephaniah",
  haggai: "Haggai",
  zechariah: "Zechariah",
  malachi: "Malachi",
  matthew: "Matthew",
  mark: "Mark",
  luke: "Luke",
  john: "John",
  acts: "Acts",
  romans: "Romans",
  "1corinthians": "1 Corinthians",
  "2corinthians": "2 Corinthians",
  galatians: "Galatians",
  ephesians: "Ephesians",
  philippians: "Philippians",
  colossians: "Colossians",
  "1thessalonians": "1 Thessalonians",
  "2thessalonians": "2 Thessalonians",
  "1timothy": "1 Timothy",
  "2timothy": "2 Timothy",
  titus: "Titus",
  philemon: "Philemon",
  hebrews: "Hebrews",
  james: "James",
  "1peter": "1 Peter",
  "2peter": "2 Peter",
  "1john": "1 John",
  "2john": "2 John",
  "3john": "3 John",
  jude: "Jude",
  revelation: "Revelation",
};

export default function ChristRevealedJourney({
  onBack, // () => void — returns to Bible reader at last position
  readingContext, // { book, chapter } — shown in Leave Journey modal
  translation = "KJV",
  theme,
}) {
  const [screen, setScreen] = useState("grid");
  const [activeBook, setActiveBook] = useState(null);
  const [bookData, setBookData] = useState(null);
  const [loadingBook, setLoadingBook] = useState(false);
  const [bookIndex, setBookIndex] = useState([]);

  const [bookTransition, setBookTransition] = useState(null);
  const [showNTUnlocked, setShowNTUnlocked] = useState(false);

  const {
    progress,
    isStopComplete,
    isBookComplete,
    isBookUnlocked,
    getBookProgress,
    saveCurrentChapter,
    markStopComplete,
    setCurrentStop,
    markNTUnlockedSeen,
  } = useCRProgress();

  /* ── Load index.json ── */
  useEffect(() => {
    async function loadIndex() {
      try {
        const res = await fetch(`${BASE_URL}data/christ-revealed/index.json`);
        const data = await res.json();
        setBookIndex(data);
      } catch (err) {
        console.error("[CR] Failed to load index.json", err);
      }
    }
    loadIndex();
  }, []);

  /* ── Load individual book JSON ── */
  const loadBook = useCallback(
    async (bookId) => {
      if (bookData?.book === bookId) return;
      setLoadingBook(true);
      try {
        const res = await fetch(
          `${BASE_URL}data/christ-revealed/${bookId}.json`,
        );
        const data = await res.json();
        setBookData(data);
      } catch (err) {
        console.error(`[CR] Failed to load ${bookId}.json`, err);
        setBookData(null);
      } finally {
        setLoadingBook(false);
      }
    },
    [bookData],
  );

  /* ── Navigate into a book's reader ──
     If the book is the current progress book, restore saved chapter.
     Otherwise start at chapter 1.
  ── */
  function goToReader(bookId) {
    setActiveBook(bookId);
    loadBook(bookId);
    setScreen("reader");
  }

  function goBackToGrid() {
    setScreen("grid");
    setActiveBook(null);
    setBookData(null);
  }

  /* ── Mark entire book complete (called from reader) ── */
  function handleBookComplete() {
    if (!bookData) return;

    const allStopIds = bookData.events.map((e) => e.id);
    allStopIds.forEach((stopId) => {
      if (!isStopComplete(stopId)) {
        markStopComplete(stopId, activeBook, allStopIds);
      }
    });

    const bookIdx = ALL_BOOKS_IN_ORDER.indexOf(activeBook);
    const nextBook = ALL_BOOKS_IN_ORDER[bookIdx + 1];

    setTimeout(() => {
      if (activeBook === LAST_OT_BOOK && !progress.ntUnlockedSeen) {
        setShowNTUnlocked(true);
      } else if (nextBook) {
        setBookTransition(DISPLAY_NAMES[nextBook] || nextBook);
      } else {
        goBackToGrid();
      }
    }, 500);
  }

  function handleTransitionContinue() {
    setBookTransition(null);
    goBackToGrid();
  }

  function handleNTDismiss() {
    markNTUnlockedSeen();
    setShowNTUnlocked(false);
    goBackToGrid();
  }

  /* ── Saved chapter for the active book ── */
  const savedChapter =
    activeBook && activeBook === progress.currentBook
      ? progress.currentChapter || 1
      : 1;

  return (
    <div
      style={{ position: "relative", height: "100%", background: "#0D0C09" }}
    >
      {/* Grid */}
      {screen === "grid" && (
        <ChristRevealedScreen
          onBack={onBack}
          onSelectBook={goToReader}
          progress={progress}
          isBookComplete={isBookComplete}
          isBookUnlocked={isBookUnlocked}
          getBookProgress={getBookProgress}
          bookIndex={bookIndex}
          readingContext={readingContext}
        />
      )}

      {/* Reader */}
      {screen === "reader" && (
        <ChristRevealedReader
          bookId={activeBook}
          bookData={loadingBook ? null : bookData}
          translation={translation}
          initialChapter={savedChapter}
          onSaveChapter={(chapter) => saveCurrentChapter(activeBook, chapter)}
          onBack={goBackToGrid}
          onLeaveJourney={onBack}
          onMarkComplete={handleBookComplete}
          isComplete={isBookComplete(activeBook)}
          readingContext={readingContext}
        />
      )}

      {/* Book transition */}
      {bookTransition && (
        <BookTransition
          nextBook={bookTransition}
          onContinue={handleTransitionContinue}
        />
      )}

      {/* NT Unlocked */}
      {showNTUnlocked && (
        <NewTestamentUnlocked
          translation={translation}
          onDismiss={handleNTDismiss}
        />
      )}
    </div>
  );
}
