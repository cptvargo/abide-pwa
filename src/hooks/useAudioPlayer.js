import { useState, useEffect, useRef, useCallback } from "react";
import { BIBLE_ORDER, CHAPTER_COUNT } from "../lib/bibleStructure";

const R2_BASE    = "https://pub-e4e33c05febe44d1b0d84bed2c11fa0e.r2.dev";
const LOOK_AHEAD = 0.4;
const NEAR_END   = 1.5; // seconds before end — trigger early for lock screen

function getAudioUrl(bookSlug, chapter) {
  return `${R2_BASE}/${bookSlug}/${chapter}.mp3`;
}

function getNextPosition(bookSlug, chapter) {
  const maxChapters = CHAPTER_COUNT[bookSlug];
  const bookIndex   = BIBLE_ORDER.indexOf(bookSlug);
  if (chapter < maxChapters) return { book: bookSlug, chapter: chapter + 1 };
  if (bookIndex < BIBLE_ORDER.length - 1) return { book: BIBLE_ORDER[bookIndex + 1], chapter: 1 };
  return null;
}

function isTimingValid(verses) {
  if (!verses?.length) return false;
  let badCount = 0;
  for (let i = 1; i < verses.length; i++) {
    if (verses[i].start <= verses[i - 1].start) badCount++;
    if (verses[i].end <= verses[i].start) badCount++;
  }
  return badCount / verses.length < 0.2;
}

function sanitizeVerses(rawVerses) {
  if (!rawVerses?.length) return [];
  const verses = [...rawVerses].sort((a, b) => a.verse - b.verse);
  verses[0].start = 0;
  for (let i = 0; i < verses.length; i++) {
    if (!verses[i].end || verses[i].end <= verses[i].start) {
      verses[i].end = verses[i].start + 0.75;
    }
    if (i > 0) {
      if (verses[i].start < verses[i - 1].start) {
        verses[i].start = verses[i - 1].start + 0.05;
      }
      const gap = verses[i].start - verses[i - 1].start;
      if (gap > 0 && gap < 0.2) {
        verses[i].start = verses[i - 1].start + 0.2;
      }
    }
  }
  return verses;
}

async function loadTiming(bookSlug, chapter) {
  try {
    const base     = import.meta.env.BASE_URL;
    const bookCode = bookSlug.slice(0, 3);
    const res      = await fetch(`${base}data/audio-timing/${bookCode}_${chapter}_verses.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.verses) {
      data.verses      = sanitizeVerses(data.verses);
      data.timingValid = isTimingValid(data.verses);
    }
    return data;
  } catch {
    return null;
  }
}

// ── Single persistent audio element — created once, never destroyed ──────────
// iOS suspends NEW audio elements when screen locks. Reusing the same element
// keeps the audio session alive across chapter transitions.
let _persistentAudio = null;
function getPersistentAudio() {
  if (!_persistentAudio) {
    _persistentAudio         = new Audio();
    _persistentAudio.preload = "auto";
    // Required for iOS to keep audio session alive in background
    _persistentAudio.setAttribute("playsinline", "true");
    _persistentAudio.setAttribute("webkit-playsinline", "true");
  }
  return _persistentAudio;
}

function updateMediaSession(bookSlug, chapter, handlers) {
  if (!("mediaSession" in navigator)) return;
  const bookName = bookSlug.charAt(0).toUpperCase() + bookSlug.slice(1);
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title:  `${bookName} ${chapter}`,
      artist: "ABIDE Bible",
      album:  "King James Version",
    });
    navigator.mediaSession.playbackState = "playing";
    navigator.mediaSession.setActionHandler("play",          handlers.play  || null);
    navigator.mediaSession.setActionHandler("pause",         handlers.pause || null);
    navigator.mediaSession.setActionHandler("nexttrack",     handlers.next  || null);
    navigator.mediaSession.setActionHandler("previoustrack", handlers.prev  || null);
  } catch {}
}

export function useAudioPlayer({ book, chapter, verseCount, onAdvanceChapter }) {
  // ALL hooks declared unconditionally at the top — no early returns before this block
  const timingRef     = useRef(null);
  const rafRef        = useRef(null);
  const verseIndexRef = useRef(0);
  const posRef        = useRef({ book: book?.toLowerCase() ?? "genesis", chapter });
  const onAdvanceRef  = useRef(onAdvanceChapter);
  const advancedRef   = useRef(false);
  const audioRef      = useRef(null); // real ref — initialized below

  const [isPlaying,    setIsPlaying]    = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [isLoaded,     setIsLoaded]     = useState(false);

  // Get persistent audio element AFTER all hooks are declared
  const audio = getPersistentAudio();
  audioRef.current = audio; // keep ref in sync

  useEffect(() => { onAdvanceRef.current = onAdvanceChapter; }, [onAdvanceChapter]);
  useEffect(() => {
    posRef.current = { book: book?.toLowerCase() ?? "genesis", chapter };
  }, [book, chapter]);

  const bookSlug = book?.toLowerCase() ?? "genesis";

  // ── rAF tick for verse sync ───────────────────────────────────────────────
  const tick = useCallback(() => {
    if (audio.paused) return;
    const { currentTime, duration } = audio;
    if (duration > 0) setProgress(currentTime / duration);
    const timing = timingRef.current;
    if (timing?.verses?.length) {
      const verses = timing.verses;
      if (timing.timingValid) {
        let i = verseIndexRef.current;
        if (i < verses.length - 1 && currentTime + LOOK_AHEAD >= verses[i + 1].start) {
          i++;
          verseIndexRef.current = i;
          setCurrentVerse(verses[i].verse);
        }
      } else if (duration > 0) {
        const idx = Math.min(Math.floor((currentTime / duration) * verses.length), verses.length - 1);
        if (idx !== verseIndexRef.current) {
          verseIndexRef.current = idx;
          setCurrentVerse(verses[idx].verse);
        }
      }
      if ("mediaSession" in navigator && duration > 0) {
        try {
          navigator.mediaSession.setPositionState({ duration, playbackRate: audio.playbackRate, position: currentTime });
        } catch {}
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Advance to next chapter ───────────────────────────────────────────────
  // Called from timeupdate (near-end) and ended — whichever fires first
  function doAdvance() {
    if (advancedRef.current) return;
    advancedRef.current = true;

    const pos  = posRef.current;
    const next = getNextPosition(pos.book, pos.chapter);

    if (!next) {
      setIsPlaying(false);
      cancelAnimationFrame(rafRef.current);
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "none";
      return;
    }

    // Update position immediately
    posRef.current = next;

    // ── Swap src on the SAME audio element — keeps iOS audio session alive ──
    audio.src = getAudioUrl(next.book, next.chapter);
    audio.load();

    // Update lock screen metadata right away
    updateMediaSession(next.book, next.chapter, makeHandlers(next.book, next.chapter));

    audio.addEventListener("canplaythrough", function onReady() {
      audio.removeEventListener("canplaythrough", onReady);
      audio.volume = 1;
      audio.play().catch(() => {});
      setProgress(0);
      setCurrentVerse(null);
      verseIndexRef.current = 0;
      advancedRef.current   = false; // reset for the next chapter
      setIsLoaded(true);
    }, { once: true });

    // Notify React UI — may be delayed on lock screen, that's fine
    try { if (onAdvanceRef.current) onAdvanceRef.current(); } catch {}

    // Load timing for next chapter
    loadTiming(next.book, next.chapter).then((timing) => {
      timingRef.current     = timing;
      verseIndexRef.current = 0;
      if (timing?.verses?.length > 0) setCurrentVerse(timing.verses[0].verse);
    });
  }

  // ── Media Session handlers — always reference current posRef ─────────────
  function makeHandlers(slug, ch) {
    const handlers = {
      play: () => {
        if (audio.paused) {
          audio.play().catch(() => {});
          setIsPlaying(true);
          rafRef.current = requestAnimationFrame(tick);
          if ("mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "playing";
            // Re-register all handlers after play so lock screen controls stay active
            updateMediaSession(slug, ch, handlers);
          }
        }
      },
      pause: () => {
        if (!audio.paused) {
          audio.pause();
          setIsPlaying(false);
          cancelAnimationFrame(rafRef.current);
          if ("mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "paused";
            // Re-register all handlers after pause so play button stays active on lock screen
            updateMediaSession(slug, ch, handlers);
          }
        }
      },
      next: () => doAdvance(),
      prev: () => { audio.currentTime = 0; verseIndexRef.current = 0; },
    };
    return handlers;
  }

  // ── Load chapter into persistent element ─────────────────────────────────
  function loadChapter(slug, ch, autoplay) {
    cancelAnimationFrame(rafRef.current);
    advancedRef.current   = false;
    verseIndexRef.current = 0;
    timingRef.current     = null;

    setProgress(0);
    setCurrentVerse(null);
    setIsLoaded(false);

    // Swap src — same element, keeps session alive
    audio.src    = getAudioUrl(slug, ch);
    audio.volume = 0;
    audio.load();

    loadTiming(slug, ch).then((timing) => {
      timingRef.current     = timing;
      verseIndexRef.current = 0;
      if (timing?.verses?.length > 0) setCurrentVerse(timing.verses[0].verse);
    });

    audio.addEventListener("canplaythrough", function onReady() {
      audio.removeEventListener("canplaythrough", onReady);
      setIsLoaded(true);
      if (autoplay) {
        audio.volume = 0;
        // Fade in
        let v = 0;
        const fade = () => { v = Math.min(1, v + 0.06); audio.volume = v; if (v < 1) requestAnimationFrame(fade); };
        requestAnimationFrame(fade);
        audio.play().catch(() => {});
        setIsPlaying(true);
        rafRef.current = requestAnimationFrame(tick);
        updateMediaSession(slug, ch, makeHandlers(slug, ch));
      }
    }, { once: true });
  }

  // ── Attach persistent event listeners once on mount ───────────────────────
  useEffect(() => {
    // timeupdate — near-end detection, primary lock screen trigger
    const onTimeUpdate = () => {
      const { currentTime, duration } = audio;
      if (!duration || !isFinite(duration)) return;
      if (currentTime >= duration - NEAR_END) {
        doAdvance();
      }
    };

    // ended — fallback for when screen is active
    const onEnded = () => {
      doAdvance();
    };

    // Unlock for mobile/PWA on first user gesture
    const unlock = () => {
      audio.play().then(() => { audio.pause(); audio.currentTime = 0; }).catch(() => {});
      document.removeEventListener("touchstart", unlock, true);
      document.removeEventListener("click",      unlock, true);
    };
    document.addEventListener("touchstart", unlock, { once: true, capture: true });
    document.addEventListener("click",      unlock, { once: true, capture: true });

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended",      onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended",      onEnded);
      cancelAnimationFrame(rafRef.current);
    };
  }, []); // empty deps — attach once, never re-attach

  // ── React to prop changes (user navigates to a new chapter) ──────────────
  useEffect(() => {
    // Don't interfere if we're mid-advance
    if (advancedRef.current) return;
    loadChapter(bookSlug, chapter, false);
  }, [book, chapter]);

  // ── Toggle ────────────────────────────────────────────────────────────────
  const toggle = useCallback(() => {
    if (audio.paused) {
      if (audio.readyState < 2) audio.load();
      let v = 0;
      const fade = () => { v = Math.min(1, v + 0.06); audio.volume = v; if (v < 1) requestAnimationFrame(fade); };
      requestAnimationFrame(fade);
      audio.play().catch((err) => {
        console.warn("Play failed:", err);
        setIsPlaying(false);
        cancelAnimationFrame(rafRef.current);
      });
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
      updateMediaSession(posRef.current.book, posRef.current.chapter, makeHandlers(posRef.current.book, posRef.current.chapter));
    } else {
      audio.pause();
      setIsPlaying(false);
      cancelAnimationFrame(rafRef.current);
      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused";
        // Re-register so lock screen play button stays active
        updateMediaSession(posRef.current.book, posRef.current.chapter, makeHandlers(posRef.current.book, posRef.current.chapter));
      }
    }
  }, [tick]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    audio.pause();
    audio.currentTime     = 0;
    verseIndexRef.current = 0;
    advancedRef.current   = false;
    setIsPlaying(false);
    setProgress(0);
    setCurrentVerse(timingRef.current?.verses?.[0]?.verse ?? null);
    cancelAnimationFrame(rafRef.current);
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "none";
  }, []);

  // ── Seek to verse ─────────────────────────────────────────────────────────
  const seekToVerse = useCallback((verseNum) => {
    if (!timingRef.current?.verses) return;
    const verses = timingRef.current.verses;
    const idx    = verses.findIndex((v) => v.verse === verseNum);
    if (idx === -1) return;
    audio.currentTime     = verses[idx].start;
    verseIndexRef.current = idx;
    setCurrentVerse(verseNum);
    if (audio.paused) toggle();
  }, [toggle]);

  return {
    isPlaying,
    isLoaded,
    progress,
    currentVerse,
    audioRef,
    toggle,
    reset,
    seekToVerse,
  };
}