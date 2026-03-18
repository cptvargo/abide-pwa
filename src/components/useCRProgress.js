/**
 * useCRProgress.js
 * Shared progress hook for Christ Revealed: The Redemption Pilgrimage.
 * All state lives in localStorage under "cr_progress".
 *
 * Schema:
 * {
 *   completedStops: string[],   // e.g. ["gen-01", "gen-02"]
 *   completedBooks: string[],   // e.g. ["genesis"]
 *   currentBook: string,        // e.g. "genesis"
 *   currentChapter: number,     // e.g. 3  ← chapter user was reading
 *   currentStopId: string|null, // e.g. "gen-03"
 *   ntUnlockedSeen: boolean
 * }
 */

import { useState, useCallback } from "react";

const STORAGE_KEY = "cr_progress";

export const OT_BOOKS = [
  "genesis","exodus","leviticus","numbers","deuteronomy",
  "joshua","judges","ruth","1samuel","2samuel","1kings","2kings",
  "1chronicles","2chronicles","ezra","nehemiah","esther","job",
  "psalms","proverbs","ecclesiastes","songofsolomon","isaiah",
  "jeremiah","lamentations","ezekiel","daniel","hosea","joel",
  "amos","obadiah","jonah","micah","nahum","habakkuk","zephaniah",
  "haggai","zechariah","malachi",
];

export const NT_BOOKS = [
  "matthew","mark","luke","john","acts","romans",
  "1corinthians","2corinthians","galatians","ephesians","philippians",
  "colossians","1thessalonians","2thessalonians","1timothy","2timothy",
  "titus","philemon","hebrews","james","1peter","2peter",
  "1john","2john","3john","jude","revelation",
];

export const ALL_BOOKS_IN_ORDER = [...OT_BOOKS, ...NT_BOOKS];
export const LAST_OT_BOOK  = "malachi";
export const FIRST_NT_BOOK = "matthew";

function defaultProgress() {
  return {
    completedStops:  [],
    completedBooks:  [],
    currentBook:     "genesis",
    currentChapter:  1,
    currentStopId:   null,
    ntUnlockedSeen:  false,
  };
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) };
  } catch {
    return defaultProgress();
  }
}

function saveProgress(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function useCRProgress() {
  const [progress, setProgress] = useState(loadProgress);

  /* ── Derived helpers ── */

  function isStopComplete(stopId) {
    return progress.completedStops.includes(stopId);
  }

  function isBookComplete(bookId) {
    return progress.completedBooks.includes(bookId);
  }

  function isBookUnlocked(bookId) {
    const idx = ALL_BOOKS_IN_ORDER.indexOf(bookId);
    if (idx === 0) return true;
    const prevBook = ALL_BOOKS_IN_ORDER[idx - 1];
    return progress.completedBooks.includes(prevBook);
  }

  function getBookProgress(bookId, events = []) {
    if (!events.length) return { completed: 0, total: 0, percent: 0 };
    const completed = events.filter((e) =>
      progress.completedStops.includes(e.id),
    ).length;
    const total = events.length;
    return { completed, total, percent: total > 0 ? completed / total : 0 };
  }

  /* ── Actions ── */

  /**
   * Save the chapter the user is currently reading.
   * Called by ChristRevealedReader whenever currentChapter changes.
   */
  const saveCurrentChapter = useCallback((bookId, chapter) => {
    setProgress((prev) => {
      const next = { ...prev, currentBook: bookId, currentChapter: chapter };
      saveProgress(next);
      return next;
    });
  }, []);

  const markStopComplete = useCallback((stopId, bookId, allStopsInBook) => {
    setProgress((prev) => {
      const completedStops = prev.completedStops.includes(stopId)
        ? prev.completedStops
        : [...prev.completedStops, stopId];

      const allComplete = allStopsInBook.every((id) =>
        completedStops.includes(id),
      );

      const completedBooks =
        allComplete && !prev.completedBooks.includes(bookId)
          ? [...prev.completedBooks, bookId]
          : prev.completedBooks;

      const stopIdx = allStopsInBook.indexOf(stopId);
      let currentStopId = prev.currentStopId;
      let currentBook   = prev.currentBook;

      if (stopIdx < allStopsInBook.length - 1) {
        currentStopId = allStopsInBook[stopIdx + 1];
        currentBook   = bookId;
      } else if (allComplete) {
        const bookIdx = ALL_BOOKS_IN_ORDER.indexOf(bookId);
        if (bookIdx < ALL_BOOKS_IN_ORDER.length - 1) {
          currentBook   = ALL_BOOKS_IN_ORDER[bookIdx + 1];
          currentStopId = null;
        }
      }

      const next = {
        ...prev,
        completedStops,
        completedBooks,
        currentBook,
        currentStopId,
        currentChapter: 1, // reset to ch1 of next book
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const setCurrentStop = useCallback((bookId, stopId) => {
    setProgress((prev) => {
      const next = { ...prev, currentBook: bookId, currentStopId: stopId };
      saveProgress(next);
      return next;
    });
  }, []);

  const markNTUnlockedSeen = useCallback(() => {
    setProgress((prev) => {
      const next = { ...prev, ntUnlockedSeen: true };
      saveProgress(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = defaultProgress();
    saveProgress(fresh);
    setProgress(fresh);
  }, []);

  return {
    progress,
    isStopComplete,
    isBookComplete,
    isBookUnlocked,
    getBookProgress,
    saveCurrentChapter,
    markStopComplete,
    setCurrentStop,
    markNTUnlockedSeen,
    resetProgress,
  };
}