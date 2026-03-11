/**
 * BibleNavigator.jsx — PREMIUM REDESIGN + SEEK
 * Sacred, luminous, manuscript-inspired navigation
 * All logic preserved — Seek added minimally
 */

import { useState, useRef, useEffect } from "react";

const BIBLE_STRUCTURE = [
  {
    section: "Torah",
    subtitle: "The Five Books of Moses",
    books: [
      { id: "genesis", name: "Genesis", chapters: 50 },
      { id: "exodus", name: "Exodus", chapters: 40 },
      { id: "leviticus", name: "Leviticus", chapters: 27 },
      { id: "numbers", name: "Numbers", chapters: 36 },
      { id: "deuteronomy", name: "Deuteronomy", chapters: 34 },
    ],
  },
  {
    section: "Historical Books",
    subtitle: "Israel's Story",
    books: [
      { id: "joshua", name: "Joshua", chapters: 24 },
      { id: "judges", name: "Judges", chapters: 21 },
      { id: "ruth", name: "Ruth", chapters: 4 },
      { id: "1samuel", name: "1 Samuel", chapters: 31 },
      { id: "2samuel", name: "2 Samuel", chapters: 24 },
      { id: "1kings", name: "1 Kings", chapters: 22 },
      { id: "2kings", name: "2 Kings", chapters: 25 },
      { id: "1chronicles", name: "1 Chronicles", chapters: 29 },
      { id: "2chronicles", name: "2 Chronicles", chapters: 36 },
      { id: "ezra", name: "Ezra", chapters: 10 },
      { id: "nehemiah", name: "Nehemiah", chapters: 13 },
      { id: "esther", name: "Esther", chapters: 10 },
    ],
  },
  {
    section: "Wisdom Literature",
    subtitle: "Poetry & Reflection",
    books: [
      { id: "job", name: "Job", chapters: 42 },
      { id: "psalms", name: "Psalms", chapters: 150 },
      { id: "proverbs", name: "Proverbs", chapters: 31 },
      { id: "ecclesiastes", name: "Ecclesiastes", chapters: 12 },
      { id: "songofsolomon", name: "Song of Solomon", chapters: 8 },
    ],
  },
  {
    section: "Major Prophets",
    subtitle: "Voices of Warning & Hope",
    books: [
      { id: "isaiah", name: "Isaiah", chapters: 66 },
      { id: "jeremiah", name: "Jeremiah", chapters: 52 },
      { id: "lamentations", name: "Lamentations", chapters: 5 },
      { id: "ezekiel", name: "Ezekiel", chapters: 48 },
      { id: "daniel", name: "Daniel", chapters: 12 },
    ],
  },
  {
    section: "Minor Prophets",
    subtitle: "The Twelve",
    books: [
      { id: "hosea", name: "Hosea", chapters: 14 },
      { id: "joel", name: "Joel", chapters: 3 },
      { id: "amos", name: "Amos", chapters: 9 },
      { id: "obadiah", name: "Obadiah", chapters: 1 },
      { id: "jonah", name: "Jonah", chapters: 4 },
      { id: "micah", name: "Micah", chapters: 7 },
      { id: "nahum", name: "Nahum", chapters: 3 },
      { id: "habakkuk", name: "Habakkuk", chapters: 3 },
      { id: "zephaniah", name: "Zephaniah", chapters: 3 },
      { id: "haggai", name: "Haggai", chapters: 2 },
      { id: "zechariah", name: "Zechariah", chapters: 14 },
      { id: "malachi", name: "Malachi", chapters: 4 },
    ],
  },
  {
    section: "Gospels & Acts",
    subtitle: "The Life of Christ",
    books: [
      { id: "matthew", name: "Matthew", chapters: 28 },
      { id: "mark", name: "Mark", chapters: 16 },
      { id: "luke", name: "Luke", chapters: 24 },
      { id: "john", name: "John", chapters: 21 },
      { id: "acts", name: "Acts", chapters: 28 },
    ],
  },
  {
    section: "Paul's Letters",
    subtitle: "Epistles to the Churches",
    books: [
      { id: "romans", name: "Romans", chapters: 16 },
      { id: "1corinthians", name: "1 Corinthians", chapters: 16 },
      { id: "2corinthians", name: "2 Corinthians", chapters: 13 },
      { id: "galatians", name: "Galatians", chapters: 6 },
      { id: "ephesians", name: "Ephesians", chapters: 6 },
      { id: "philippians", name: "Philippians", chapters: 4 },
      { id: "colossians", name: "Colossians", chapters: 4 },
      { id: "1thessalonians", name: "1 Thessalonians", chapters: 5 },
      { id: "2thessalonians", name: "2 Thessalonians", chapters: 3 },
      { id: "1timothy", name: "1 Timothy", chapters: 6 },
      { id: "2timothy", name: "2 Timothy", chapters: 4 },
      { id: "titus", name: "Titus", chapters: 3 },
      { id: "philemon", name: "Philemon", chapters: 1 },
    ],
  },
  {
    section: "General Letters",
    subtitle: "Universal Wisdom",
    books: [
      { id: "hebrews", name: "Hebrews", chapters: 13 },
      { id: "james", name: "James", chapters: 5 },
      { id: "1peter", name: "1 Peter", chapters: 5 },
      { id: "2peter", name: "2 Peter", chapters: 3 },
      { id: "1john", name: "1 John", chapters: 5 },
      { id: "2john", name: "2 John", chapters: 1 },
      { id: "3john", name: "3 John", chapters: 1 },
      { id: "jude", name: "Jude", chapters: 1 },
    ],
  },
  {
    section: "Apocalyptic",
    subtitle: "The End of All Things",
    books: [{ id: "revelation", name: "Revelation", chapters: 22 }],
  },
];

const SECTION_GLYPHS = ["✦", "◈", "◇", "⊕", "✧", "✦", "◈", "◇", "✧"];

// ── Seek constants ────────────────────────────────────────────────────────────
const SEEK_SUGGESTIONS = [
  "Abide",
  "Grace",
  "Faith",
  "Glory",
  "Redemption",
  "Covenant",
  "Mercy",
  "Shalom",
];
const SEEK_CACHE_VERSION = "v5";
const SEEK_CACHE_PREFIX = `abide_seek_${SEEK_CACHE_VERSION}:`;

// ── Translation lookup helpers ────────────────────────────────────────────────
const TRANSLATION_PRIORITY = ["vsv", "akt", "asr", "kjv"];

const BOOK_NAME_TO_ID = {
  genesis: "genesis",
  exodus: "exodus",
  leviticus: "leviticus",
  numbers: "numbers",
  deuteronomy: "deuteronomy",
  joshua: "joshua",
  judges: "judges",
  ruth: "ruth",
  "1 samuel": "1samuel",
  "2 samuel": "2samuel",
  "1 kings": "1kings",
  "2 kings": "2kings",
  "1 chronicles": "1chronicles",
  "2 chronicles": "2chronicles",
  ezra: "ezra",
  nehemiah: "nehemiah",
  esther: "esther",
  job: "job",
  psalm: "psalms",
  psalms: "psalms",
  proverbs: "proverbs",
  ecclesiastes: "ecclesiastes",
  "song of solomon": "songofsolomon",
  "song of songs": "songofsolomon",
  isaiah: "isaiah",
  jeremiah: "jeremiah",
  lamentations: "lamentations",
  ezekiel: "ezekiel",
  daniel: "daniel",
  hosea: "hosea",
  joel: "joel",
  amos: "amos",
  obadiah: "obadiah",
  jonah: "jonah",
  micah: "micah",
  nahum: "nahum",
  habakkuk: "habakkuk",
  zephaniah: "zephaniah",
  haggai: "haggai",
  zechariah: "zechariah",
  malachi: "malachi",
  matthew: "matthew",
  mark: "mark",
  luke: "luke",
  john: "john",
  acts: "acts",
  romans: "romans",
  "1 corinthians": "1corinthians",
  "2 corinthians": "2corinthians",
  galatians: "galatians",
  ephesians: "ephesians",
  philippians: "philippians",
  colossians: "colossians",
  "1 thessalonians": "1thessalonians",
  "2 thessalonians": "2thessalonians",
  "1 timothy": "1timothy",
  "2 timothy": "2timothy",
  titus: "titus",
  philemon: "philemon",
  hebrews: "hebrews",
  james: "james",
  "1 peter": "1peter",
  "2 peter": "2peter",
  "1 john": "1john",
  "2 john": "2john",
  "3 john": "3john",
  jude: "jude",
  revelation: "revelation",
};

function parseRef(ref) {
  const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!match) return null;
  const bookName = match[1].toLowerCase().trim();
  const bookId = BOOK_NAME_TO_ID[bookName];
  if (!bookId) return null;
  return { book: bookId, chapter: match[2], verse: match[3] };
}

async function fetchVerseText(ref) {
  // Returns { text, translation } or null
  const parsed = parseRef(ref);
  if (!parsed) return null;
  const { book, chapter, verse } = parsed;
  for (const translation of TRANSLATION_PRIORITY) {
    try {
      const url = `/data/translations/${translation}/${book}/${chapter}.json`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const text = data.verses?.[verse];
      if (text) return { text, translation: translation.toUpperCase() };
    } catch {
      continue;
    }
  }
  return null;
}

async function enrichVerses(verses) {
  return Promise.all(
    verses.map(async (v) => {
      const result = await fetchVerseText(v.ref);
      return result
        ? { ...v, text: result.text, translation: result.translation }
        : v;
    }),
  );
}
// ─────────────────────────────────────────────────────────────────────────────

function getCached(query) {
  try {
    const raw = localStorage.getItem(
      SEEK_CACHE_PREFIX + query.toLowerCase().trim(),
    );
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCached(query, data) {
  try {
    localStorage.setItem(
      SEEK_CACHE_PREFIX + query.toLowerCase().trim(),
      JSON.stringify(data),
    );
  } catch {}
}
// ─────────────────────────────────────────────────────────────────────────────

export default function BibleNavigator({
  open,
  onClose,
  onNavigate,
  currentBook,
  currentChapter,
}) {
  // ── Existing state (unchanged) ──────────────────────────────────────────────
  const [view, setView] = useState("books"); // books | chapters | seek | study
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const scrollRef = useRef(null);

  // ── Seek state ──────────────────────────────────────────────────────────────
  const [seekQuery, setSeekQuery] = useState("");
  const [seekResult, setSeekResult] = useState(null);
  const [seekLoading, setSeekLoading] = useState(false);
  const [seekError, setSeekError] = useState(null);
  const [seekFromCache, setSeekFromCache] = useState(false);
  const seekInputRef = useRef(null);

  // ── Existing effect (unchanged) ─────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setView("books");
      setSelectedBook(null);
      setSearchQuery("");
      setIsAnimatingOut(false);
      setIsVisible(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimateIn(true)),
      );
    } else {
      setAnimateIn(false);
      setIsVisible(false);
    }
  }, [open]);

  // ── Seek focus effect — no autoFocus used ───────────────────────────────────
  useEffect(() => {
    if (view === "seek") {
      setTimeout(() => seekInputRef.current?.focus(), 120);
    }
  }, [view]);

  // ── Existing handlers (unchanged) ───────────────────────────────────────────
  function handleClose() {
    setIsAnimatingOut(true);
    setAnimateIn(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 320);
  }

  function handleBookClick(book) {
    setSearchQuery("");
    setSelectedBook(book);
    setTimeout(() => setView("chapters"), 80);
  }

  function handleChapterClick(chapter) {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    onNavigate(selectedBook.id, chapter);
    setIsVisible(false);
    onClose();
  }

  function handleBackToBooks() {
    setView("books");
    setSelectedBook(null);
  }

  // ── Seek handler ─────────────────────────────────────────────────────────────
  async function handleSeek(queryOverride) {
    const q = (queryOverride || seekQuery).trim();
    if (!q) return;

    setSeekLoading(true);
    setSeekError(null);
    setSeekResult(null);
    setSeekFromCache(false);
    setView("study");

    const cached = getCached(q);
    if (cached) {
      setSeekResult(cached);
      setSeekFromCache(true);
      setSeekLoading(false);
      return;
    }

    if (!navigator.onLine) {
      setSeekError(
        "You're offline. Connect to search for this word — it'll be saved for next time.",
      );
      setSeekLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://abide-seek-proxy.jvargas22.workers.dev",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        },
      );
      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

      // Replace Claude's preview text with real translation verses
      if (parsed.verses?.length) {
        parsed.verses = await enrichVerses(parsed.verses);
      }

      setCached(q, parsed);
      setSeekResult(parsed);
    } catch {
      setSeekError("Something went wrong. Please try again.");
    }

    setSeekLoading(false);
  }
  // ─────────────────────────────────────────────────────────────────────────────

  if (!open && !isVisible) return null;

  const filteredStructure = searchQuery
    ? BIBLE_STRUCTURE.map((s) => ({
        ...s,
        books: s.books.filter((b) =>
          b.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      })).filter((s) => s.books.length > 0)
    : BIBLE_STRUCTURE;

  /* ── Shared keyframes ───────────────────────────────────────────── */
  const styles = (
    <style>{`
      @keyframes bn-backdrop-in  { from { opacity:0 } to { opacity:1 } }
      @keyframes bn-backdrop-out { from { opacity:1 } to { opacity:0 } }
      @keyframes bn-modal-in  {
        from { opacity:0; transform:translateY(32px) scale(0.96) }
        to   { opacity:1; transform:translateY(0)    scale(1)    }
      }
      @keyframes bn-modal-out {
        from { opacity:1; transform:translateY(0)    scale(1)    }
        to   { opacity:0; transform:translateY(24px) scale(0.96) }
      }
      @keyframes bn-glow-pulse {
        0%,100% { opacity:0.4 }
        50%      { opacity:0.75 }
      }
      @keyframes bn-rule {
        from { transform:scaleX(0); opacity:0 }
        to   { transform:scaleX(1); opacity:1 }
      }
      @keyframes bn-fade-up {
        from { opacity:0; transform:translateY(8px) }
        to   { opacity:1; transform:translateY(0)   }
      }
      @keyframes bn-shimmer { 0%,100%{opacity:0.3} 50%{opacity:0.65} }

      .bn-backdrop {
        animation: ${isAnimatingOut ? "bn-backdrop-out 0.32s ease forwards" : "bn-backdrop-in 0.3s ease forwards"};
      }
      .bn-modal {
        animation: ${isAnimatingOut ? "bn-modal-out 0.28s cubic-bezier(0.55,0,1,0.45) forwards" : "bn-modal-in 0.42s cubic-bezier(0.22,1,0.36,1) forwards"};
      }
      .bn-header-content {
        animation: bn-fade-up 0.4s ease 0.1s both;
      }
      .bn-glow {
        animation: bn-glow-pulse 4s ease-in-out infinite;
      }

      .bn-book {
        transition: background 0.16s ease, transform 0.14s ease, border-color 0.16s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .bn-book:active { transform: scale(0.985) }
      .bn-book-available:hover {
        background: rgba(var(--accent-rgb,203,178,124), 0.13) !important;
        border-color: rgba(var(--accent-rgb,203,178,124), 0.3) !important;
      }

      .bn-ch {
        transition: background 0.15s ease, transform 0.13s ease, box-shadow 0.15s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .bn-ch:hover { transform: scale(1.07) }
      .bn-ch:active { transform: scale(0.93) }

      .bn-search::placeholder { color: rgba(var(--accent-rgb,203,178,124),0.3) }
      .bn-search:focus { outline: none }
      .bn-seek-input::placeholder { color: rgba(var(--accent-rgb,203,178,124),0.3) }
      .bn-seek-input:focus { outline: none }

      .bn-scroll::-webkit-scrollbar { display:none }
      .bn-scroll { -ms-overflow-style:none; scrollbar-width:none }

      .bn-sticky {
        position: sticky;
        top: 0;
        z-index: 20;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }

      .bn-tab-btn {
        flex: 1; padding: 13px 0;
        background: transparent; border: none;
        border-bottom: 2px solid transparent;
        font-family: var(--font-ui, system-ui);
        font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
        color: rgba(var(--accent-rgb,203,178,124),0.35);
        cursor: pointer; transition: color 0.18s ease, border-color 0.18s ease;
        -webkit-tap-highlight-color: transparent;
        margin-bottom: -1px;
      }
      .bn-tab-btn.active {
        color: rgba(var(--accent-rgb,203,178,124),0.9);
        border-bottom-color: rgba(var(--accent-rgb,203,178,124),0.7);
      }

      .bn-seek-chip {
        background: rgba(var(--accent-rgb,203,178,124),0.05);
        border: 1px solid rgba(var(--accent-rgb,203,178,124),0.14);
        border-radius: 20px; padding: 8px 16px;
        font-family: var(--font-body, Georgia, serif);
        font-style: italic; font-size: 14px;
        color: rgba(var(--accent-rgb,203,178,124),0.65);
        cursor: pointer;
        transition: background 0.15s ease, border-color 0.15s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .bn-seek-chip:hover {
        background: rgba(var(--accent-rgb,203,178,124),0.1) !important;
        border-color: rgba(var(--accent-rgb,203,178,124),0.25) !important;
      }

      .bn-verse-card {
        background: rgba(var(--accent-rgb,203,178,124),0.04);
        border: 1px solid rgba(var(--accent-rgb,203,178,124),0.1);
        border-radius: 12px; padding: 12px 14px;
        transition: background 0.15s ease; cursor: default;
      }

      .bn-shimmer { animation: bn-shimmer 1.5s ease infinite; }
    `}</style>
  );

  /* ── Shared tab bar ─────────────────────────────────────────────── */
  const TabBar = ({ active }) => (
    <div
      style={{
        display: "flex",
        borderBottom: "1px solid rgba(var(--accent-rgb,203,178,124),0.1)",
        flexShrink: 0,
        position: "relative",
        zIndex: 1,
      }}
    >
      <button
        className={`bn-tab-btn${active === "books" ? " active" : ""}`}
        onClick={handleBackToBooks}
      >
        Books
      </button>
      <button
        className={`bn-tab-btn${active === "seek" ? " active" : ""}`}
        onClick={() => setView("seek")}
      >
        Seek
      </button>
    </div>
  );

  /* ══════════════════════════════════════════════════════
     BOOKS VIEW
  ══════════════════════════════════════════════════════ */
  if (view === "books") {
    return (
      <div
        className="bn-backdrop"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={handleClose}
      >
        {styles}
        <div
          className="bn-modal bn-scroll"
          style={{
            position: "relative",
            width: "95%",
            maxWidth: "520px",
            height: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--bg-menu, #141410)",
            borderRadius: "26px",
            boxShadow:
              "0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(var(--accent-rgb,203,178,124),0.08)",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div
            className="bn-glow"
            style={{
              position: "absolute",
              top: 0,
              left: "15%",
              right: "15%",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(var(--accent-rgb,203,178,124),0.8), transparent)",
              filter: "blur(1px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "180px",
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(var(--accent-rgb,203,178,124),0.09), transparent 65%)",
              pointerEvents: "none",
            }}
          />

          <div
            className="bn-header-content"
            style={{
              padding: "28px 28px 20px",
              borderBottom: "1px solid rgba(var(--accent-rgb,203,178,124),0.1)",
              position: "relative",
              zIndex: 1,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-ui, system-ui)",
                    fontSize: "10px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(var(--accent-rgb,203,178,124),0.6)",
                    marginBottom: "8px",
                  }}
                >
                  ✦ &nbsp;Scripture
                </div>
                <h1
                  style={{
                    fontFamily: "var(--font-ui, system-ui)",
                    fontSize: "28px",
                    fontWeight: "300",
                    letterSpacing: "0.02em",
                    color: "var(--text-primary, #f0ebe0)",
                    lineHeight: 1.15,
                    marginBottom: "5px",
                  }}
                >
                  Holy Bible
                </h1>
                <p
                  style={{
                    fontFamily: "var(--font-ui, system-ui)",
                    fontSize: "12px",
                    color: "var(--text-primary, #f0ebe0)",
                    opacity: 0.38,
                    letterSpacing: "0.04em",
                  }}
                >
                  66 Books · Old &amp; New Testament
                </p>
              </div>
              <button
                onClick={handleClose}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "100px",
                  background: "rgba(var(--accent-rgb,203,178,124),0.08)",
                  border: "1px solid rgba(var(--accent-rgb,203,178,124),0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-primary, #f0ebe0)",
                  fontSize: "14px",
                  opacity: 0.55,
                  transition: "opacity 0.2s",
                  WebkitTapHighlightColor: "transparent",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "14px",
                  color: "rgba(var(--accent-rgb,203,178,124),0.4)",
                  pointerEvents: "none",
                }}
              >
                ⌕
              </span>
              <input
                className="bn-search"
                type="text"
                placeholder="Search books…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(var(--accent-rgb,203,178,124),0.05)",
                  border: "1px solid rgba(var(--accent-rgb,203,178,124),0.14)",
                  borderRadius: "12px",
                  padding: "12px 16px 12px 38px",
                  color: "var(--text-primary, #f0ebe0)",
                  fontFamily: "var(--font-ui, system-ui)",
                  fontSize: "15px",
                  transition: "border-color 0.2s, background 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor =
                    "rgba(var(--accent-rgb,203,178,124),0.4)";
                  e.target.style.background =
                    "rgba(var(--accent-rgb,203,178,124),0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor =
                    "rgba(var(--accent-rgb,203,178,124),0.14)";
                  e.target.style.background =
                    "rgba(var(--accent-rgb,203,178,124),0.05)";
                }}
              />
            </div>
          </div>

          <TabBar active="books" />

          <div
            ref={scrollRef}
            className="bn-scroll"
            style={{ flex: 1, overflowY: "auto" }}
          >
            {filteredStructure.map((section, idx) => (
              <div key={idx}>
                <div
                  className="bn-sticky"
                  style={{
                    background: "var(--bg-menu, #141410)",
                    padding: "16px 28px 10px",
                    borderBottom:
                      "1px solid rgba(var(--accent-rgb,203,178,124),0.07)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        color: "rgba(var(--accent-rgb,203,178,124),0.5)",
                      }}
                    >
                      {SECTION_GLYPHS[idx % SECTION_GLYPHS.length]}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-ui, system-ui)",
                        fontSize: "10px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.13em",
                        color: "rgba(var(--accent-rgb,203,178,124),0.6)",
                      }}
                    >
                      {section.section}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        background:
                          "linear-gradient(90deg, rgba(var(--accent-rgb,203,178,124),0.15), transparent)",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body, Georgia, serif)",
                      fontSize: "11px",
                      fontStyle: "italic",
                      color: "var(--text-primary, #f0ebe0)",
                      opacity: 0.3,
                      marginTop: "3px",
                      paddingLeft: "18px",
                    }}
                  >
                    {section.subtitle}
                  </div>
                </div>
                <div style={{ padding: "8px 20px 4px" }}>
                  {section.books.map((book) => {
                    const isCurrent = book.id === currentBook?.toLowerCase();
                    return (
                      <button
                        key={book.id}
                        onClick={() => handleBookClick(book)}
                        className="bn-book bn-book-available"
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "13px 16px",
                          marginBottom: "4px",
                          borderRadius: "12px",
                          background: isCurrent
                            ? "rgba(var(--accent-rgb,203,178,124),0.14)"
                            : "transparent",
                          border: isCurrent
                            ? "1px solid rgba(var(--accent-rgb,203,178,124),0.35)"
                            : "1px solid transparent",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          style={{
                            flexShrink: 0,
                            fontFamily: "var(--font-ui, system-ui)",
                            fontSize: "10px",
                            color: "rgba(var(--accent-rgb,203,178,124),0.5)",
                            background:
                              "rgba(var(--accent-rgb,203,178,124),0.08)",
                            border:
                              "1px solid rgba(var(--accent-rgb,203,178,124),0.12)",
                            borderRadius: "6px",
                            padding: "2px 7px",
                            minWidth: "28px",
                            textAlign: "center",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {book.chapters}
                        </span>
                        <span
                          style={{
                            flex: 1,
                            fontFamily: "var(--font-ui, system-ui)",
                            fontSize: "15px",
                            fontWeight: isCurrent ? "500" : "400",
                            color: isCurrent
                              ? "var(--text-accent, #cbb27c)"
                              : "var(--text-primary, #f0ebe0)",
                            letterSpacing: "0.01em",
                          }}
                        >
                          {book.name}
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            color: "rgba(var(--accent-rgb,203,178,124),0.3)",
                            flexShrink: 0,
                          }}
                        >
                          ›
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div style={{ height: "24px" }} />
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════
     CHAPTER GRID VIEW
  ══════════════════════════════════════════════════════ */
  if (view === "chapters" && selectedBook) {
    const chapters = Array.from(
      { length: selectedBook.chapters },
      (_, i) => i + 1,
    );
    return (
      <div
        className="bn-backdrop"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={handleClose}
      >
        {styles}
        <div
          className="bn-modal bn-scroll"
          style={{
            position: "relative",
            width: "95%",
            maxWidth: "520px",
            height: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--bg-menu, #141410)",
            borderRadius: "26px",
            boxShadow:
              "0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(var(--accent-rgb,203,178,124),0.08)",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div
            className="bn-glow"
            style={{
              position: "absolute",
              top: 0,
              left: "15%",
              right: "15%",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(var(--accent-rgb,203,178,124),0.8), transparent)",
              filter: "blur(1px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "180px",
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(var(--accent-rgb,203,178,124),0.09), transparent 65%)",
              pointerEvents: "none",
            }}
          />

          <div
            className="bn-header-content"
            style={{
              padding: "28px 28px 20px",
              borderBottom: "1px solid rgba(var(--accent-rgb,203,178,124),0.1)",
              position: "relative",
              zIndex: 1,
              flexShrink: 0,
            }}
          >
            <button
              onClick={handleBackToBooks}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(var(--accent-rgb,203,178,124),0.07)",
                border: "1px solid rgba(var(--accent-rgb,203,178,124),0.14)",
                borderRadius: "100px",
                padding: "6px 14px 6px 10px",
                cursor: "pointer",
                marginBottom: "18px",
                WebkitTapHighlightColor: "transparent",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  "rgba(var(--accent-rgb,203,178,124),0.12)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  "rgba(var(--accent-rgb,203,178,124),0.07)")
              }
            >
              <span
                style={{
                  fontSize: "13px",
                  color: "rgba(var(--accent-rgb,203,178,124),0.7)",
                }}
              >
                ‹
              </span>
              <span
                style={{
                  fontFamily: "var(--font-ui, system-ui)",
                  fontSize: "12px",
                  letterSpacing: "0.04em",
                  color: "rgba(var(--accent-rgb,203,178,124),0.7)",
                }}
              >
                All Books
              </span>
            </button>
            <div
              style={{
                fontFamily: "var(--font-ui, system-ui)",
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(var(--accent-rgb,203,178,124),0.55)",
                marginBottom: "7px",
              }}
            >
              ✦ &nbsp;Select Chapter
            </div>
            <h1
              style={{
                fontFamily: "var(--font-ui, system-ui)",
                fontSize: "28px",
                fontWeight: "300",
                letterSpacing: "0.02em",
                color: "var(--text-primary, #f0ebe0)",
                lineHeight: 1.15,
                marginBottom: "5px",
              }}
            >
              {selectedBook.name}
            </h1>
            <p
              style={{
                fontFamily: "var(--font-ui, system-ui)",
                fontSize: "12px",
                color: "var(--text-primary, #f0ebe0)",
                opacity: 0.35,
                letterSpacing: "0.04em",
              }}
            >
              {selectedBook.chapters}{" "}
              {selectedBook.chapters === 1 ? "chapter" : "chapters"}
            </p>
          </div>

          <div
            className="bn-scroll"
            style={{ flex: 1, overflowY: "auto", padding: "24px 24px 32px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
                gap: "10px",
              }}
            >
              {chapters.map((chapter) => {
                const isCurrent =
                  selectedBook.id === currentBook?.toLowerCase() &&
                  chapter === currentChapter;
                return (
                  <button
                    key={chapter}
                    onClick={() => handleChapterClick(chapter)}
                    className="bn-ch"
                    style={{
                      aspectRatio: "1",
                      borderRadius: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-ui, system-ui)",
                      fontSize: "16px",
                      fontWeight: isCurrent ? "600" : "400",
                      background: isCurrent
                        ? "rgba(var(--accent-rgb,203,178,124),1)"
                        : "rgba(var(--accent-rgb,203,178,124),0.06)",
                      color: isCurrent
                        ? "var(--text-inverse, #0d0d0d)"
                        : "var(--text-primary, #f0ebe0)",
                      border: isCurrent
                        ? "none"
                        : "1px solid rgba(var(--accent-rgb,203,178,124),0.12)",
                      boxShadow: isCurrent
                        ? "0 6px 20px rgba(var(--accent-rgb,203,178,124),0.35)"
                        : "none",
                      cursor: "pointer",
                    }}
                  >
                    {chapter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════
     SEEK VIEW
  ══════════════════════════════════════════════════════ */
  if (view === "seek") {
    return (
      <div
        className="bn-backdrop"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={handleClose}
      >
        {styles}
        <div
          className="bn-modal bn-scroll"
          style={{
            position: "relative",
            width: "95%",
            maxWidth: "520px",
            height: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--bg-menu, #141410)",
            borderRadius: "26px",
            boxShadow:
              "0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(var(--accent-rgb,203,178,124),0.08)",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div
            className="bn-glow"
            style={{
              position: "absolute",
              top: 0,
              left: "15%",
              right: "15%",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(var(--accent-rgb,203,178,124),0.8), transparent)",
              filter: "blur(1px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "180px",
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(var(--accent-rgb,203,178,124),0.09), transparent 65%)",
              pointerEvents: "none",
            }}
          />

          {/* Header */}
          <div
            style={{
              padding: "28px 28px 20px",
              borderBottom: "1px solid rgba(var(--accent-rgb,203,178,124),0.1)",
              position: "relative",
              zIndex: 1,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-ui, system-ui)",
                    fontSize: "10px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(var(--accent-rgb,203,178,124),0.6)",
                    marginBottom: "8px",
                  }}
                >
                  ✦ &nbsp;Word Study
                </div>
                <h1
                  style={{
                    fontFamily: "var(--font-ui, system-ui)",
                    fontSize: "28px",
                    fontWeight: "300",
                    letterSpacing: "0.02em",
                    color: "var(--text-primary, #f0ebe0)",
                    lineHeight: 1.15,
                    marginBottom: "5px",
                  }}
                >
                  Seek
                </h1>
                <p
                  style={{
                    fontFamily: "var(--font-body, Georgia, serif)",
                    fontSize: "12px",
                    fontStyle: "italic",
                    color: "var(--text-primary, #f0ebe0)",
                    opacity: 0.38,
                    letterSpacing: "0.04em",
                  }}
                >
                  Search a word, phrase, or concept
                </p>
              </div>
              <button
                onClick={handleClose}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "100px",
                  background: "rgba(var(--accent-rgb,203,178,124),0.08)",
                  border: "1px solid rgba(var(--accent-rgb,203,178,124),0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-primary, #f0ebe0)",
                  fontSize: "14px",
                  opacity: 0.55,
                  WebkitTapHighlightColor: "transparent",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(var(--accent-rgb,203,178,124),0.05)",
                border: "1px solid rgba(var(--accent-rgb,203,178,124),0.14)",
                borderRadius: "12px",
                padding: "0 14px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  color: "rgba(var(--accent-rgb,203,178,124),0.4)",
                  flexShrink: 0,
                }}
              >
                ⌕
              </span>
              <input
                ref={seekInputRef}
                className="bn-seek-input"
                type="text"
                placeholder="e.g. Grace, Abide in Christ, Behold..."
                value={seekQuery}
                onChange={(e) => setSeekQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSeek()}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  padding: "13px 0",
                  color: "var(--text-primary, #f0ebe0)",
                  fontFamily: "var(--font-body, Georgia, serif)",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              />
              {seekQuery && (
                <button
                  onClick={() => handleSeek()}
                  style={{
                    background: "rgba(var(--accent-rgb,203,178,124),0.14)",
                    border: "1px solid rgba(var(--accent-rgb,203,178,124),0.2)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    color: "var(--text-accent, #cbb27c)",
                    fontFamily: "var(--font-ui, system-ui)",
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  SEEK
                </button>
              )}
            </div>
          </div>

          <TabBar active="seek" />

          {/* Suggestions */}
          <div
            className="bn-scroll"
            style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }}
          >
            <div
              style={{
                fontFamily: "var(--font-ui, system-ui)",
                fontSize: "10px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(var(--accent-rgb,203,178,124),0.35)",
                marginBottom: "14px",
              }}
            >
              Suggested
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "32px",
              }}
            >
              {SEEK_SUGGESTIONS.map((word) => (
                <button
                  key={word}
                  className="bn-seek-chip"
                  onClick={() => {
                    setSeekQuery(word);
                    handleSeek(word);
                  }}
                >
                  {word}
                </button>
              ))}
            </div>
            <div
              style={{
                padding: "16px 18px",
                background: "rgba(var(--accent-rgb,203,178,124),0.04)",
                border: "1px solid rgba(var(--accent-rgb,203,178,124),0.08)",
                borderRadius: "14px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body, Georgia, serif)",
                  fontStyle: "italic",
                  fontSize: "13px",
                  color: "var(--text-primary, #f0ebe0)",
                  opacity: 0.45,
                  lineHeight: 1.7,
                  textAlign: "center",
                  margin: 0,
                }}
              >
                "Seek and you will find; knock and the door will be opened to
                you."
              </p>
              <div
                style={{
                  fontFamily: "var(--font-ui, system-ui)",
                  fontSize: "9px",
                  letterSpacing: "0.14em",
                  color: "rgba(var(--accent-rgb,203,178,124),0.3)",
                  textAlign: "center",
                  marginTop: "8px",
                }}
              >
                MATTHEW 7:7
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════
     STUDY VIEW
  ══════════════════════════════════════════════════════ */
  if (view === "study") {
    return (
      <div
        className="bn-backdrop"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={handleClose}
      >
        {styles}
        <div
          className="bn-modal bn-scroll"
          style={{
            position: "relative",
            width: "95%",
            maxWidth: "520px",
            height: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--bg-menu, #141410)",
            borderRadius: "26px",
            boxShadow:
              "0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(var(--accent-rgb,203,178,124),0.08)",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div
            className="bn-glow"
            style={{
              position: "absolute",
              top: 0,
              left: "15%",
              right: "15%",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(var(--accent-rgb,203,178,124),0.8), transparent)",
              filter: "blur(1px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "180px",
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(var(--accent-rgb,203,178,124),0.09), transparent 65%)",
              pointerEvents: "none",
            }}
          />

          {/* Header */}
          <div
            style={{
              padding: "28px 28px 16px",
              borderBottom:
                "1px solid rgba(var(--accent-rgb,203,178,124),0.08)",
              position: "relative",
              zIndex: 1,
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setView("seek")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(var(--accent-rgb,203,178,124),0.07)",
                border: "1px solid rgba(var(--accent-rgb,203,178,124),0.14)",
                borderRadius: "100px",
                padding: "6px 14px 6px 10px",
                cursor: "pointer",
                marginBottom: "16px",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  color: "rgba(var(--accent-rgb,203,178,124),0.7)",
                }}
              >
                ‹
              </span>
              <span
                style={{
                  fontFamily: "var(--font-ui, system-ui)",
                  fontSize: "12px",
                  letterSpacing: "0.04em",
                  color: "rgba(var(--accent-rgb,203,178,124),0.7)",
                }}
              >
                Seek
              </span>
            </button>
            {seekLoading ? (
              <div
                className="bn-shimmer"
                style={{
                  fontFamily: "var(--font-ui, system-ui)",
                  fontSize: "22px",
                  fontWeight: "300",
                  color: "rgba(var(--accent-rgb,203,178,124),0.3)",
                  letterSpacing: "0.04em",
                }}
              >
                {seekQuery}
              </div>
            ) : seekResult ? (
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-ui, system-ui)",
                    fontSize: "10px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(var(--accent-rgb,203,178,124),0.5)",
                    marginBottom: "6px",
                  }}
                >
                  ✦ &nbsp;Word Study{" "}
                  {seekFromCache && (
                    <span style={{ opacity: 0.5 }}>· saved</span>
                  )}
                </div>
                <h1
                  style={{
                    fontFamily: "var(--font-ui, system-ui)",
                    fontSize: "26px",
                    fontWeight: "300",
                    letterSpacing: "0.03em",
                    color: "var(--text-primary, #f0ebe0)",
                    lineHeight: 1.2,
                  }}
                >
                  {seekResult.word}
                </h1>
              </div>
            ) : null}
          </div>

          <TabBar active="seek" />

          {/* Content */}
          <div
            className="bn-scroll"
            style={{ flex: 1, overflowY: "auto", padding: "20px 24px 40px" }}
          >
            {/* Loading skeleton */}
            {seekLoading && (
              <div style={{ paddingTop: "8px" }}>
                {[75, 55, 85, 50, 65, 40, 80].map((w, i) => (
                  <div
                    key={i}
                    className="bn-shimmer"
                    style={{
                      height: "11px",
                      borderRadius: "6px",
                      marginBottom: "10px",
                      width: `${w}%`,
                      background: "rgba(var(--accent-rgb,203,178,124),0.08)",
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Error */}
            {seekError && !seekLoading && (
              <div
                style={{
                  fontFamily: "var(--font-body, Georgia, serif)",
                  fontStyle: "italic",
                  fontSize: "14px",
                  color: "var(--text-primary, #f0ebe0)",
                  opacity: 0.45,
                  textAlign: "center",
                  paddingTop: "40px",
                  lineHeight: 1.7,
                }}
              >
                {seekError}
              </div>
            )}

            {/* Result */}
            {seekResult && !seekLoading && (
              <div>
                <SeekSection label="Definition">
                  <p style={proseStyle}>{seekResult.definition}</p>
                </SeekSection>
                <SeekDivider />
                <SeekSection label="In Scripture">
                  <p style={proseStyle}>{seekResult.significance}</p>
                </SeekSection>
                <SeekDivider />
                <SeekSection label="Key Verses">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {seekResult.verses?.map((v, i) => (
                      <div key={i} className="bn-verse-card">
                        {/* Reference */}
                        <div
                          style={{
                            fontFamily: "var(--font-ui, system-ui)",
                            fontSize: "10px",
                            letterSpacing: "0.1em",
                            color: "rgba(var(--accent-rgb,203,178,124),0.55)",
                            marginBottom: "8px",
                          }}
                        >
                          {v.ref}
                        </div>
                        {/* Verse text with left accent rule */}
                        <div
                          style={{
                            borderLeft:
                              "2px solid rgba(var(--accent-rgb,203,178,124),0.45)",
                            paddingLeft: "12px",
                            marginBottom: "4px",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "var(--font-body, Georgia, serif)",
                              fontStyle: "italic",
                              fontSize: "14px",
                              color: "var(--text-accent, #cbb27c)",
                              lineHeight: 1.65,
                            }}
                          >
                            "{v.text}"
                          </div>
                        </div>
                        {/* Translation label */}
                        <div
                          style={{
                            fontFamily: "var(--font-ui, system-ui)",
                            fontSize: "10px",
                            letterSpacing: "0.08em",
                            color: "rgba(var(--accent-rgb,203,178,124),0.4)",
                            opacity: 0.75,
                            marginTop: "4px",
                            marginBottom: "8px",
                          }}
                        >
                          — {v.translation || "KJV"}
                        </div>
                        {/* Commentary */}
                        <div
                          style={{
                            fontFamily: "var(--font-body, Georgia, serif)",
                            fontSize: "12px",
                            color: "var(--text-primary, #f0ebe0)",
                            opacity: 0.45,
                            lineHeight: 1.5,
                          }}
                        >
                          {v.note}
                        </div>
                      </div>
                    ))}
                  </div>
                </SeekSection>
                <SeekDivider />
                <SeekSection label="Reflect">
                  <p
                    style={{ ...proseStyle, fontStyle: "italic", opacity: 0.6 }}
                  >
                    {seekResult.reflection}
                  </p>
                </SeekSection>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ── Seek helper components ──────────────────────────────────────────────── */
const proseStyle = {
  fontFamily: "var(--font-body, Georgia, serif)",
  fontSize: "15px",
  lineHeight: 1.8,
  color: "var(--text-primary, #f0ebe0)",
  opacity: 0.85,
  margin: 0,
};

function SeekSection({ label, children }) {
  return (
    <section style={{ marginBottom: "20px" }}>
      <div
        style={{
          fontFamily: "var(--font-ui, system-ui)",
          fontSize: "9px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(var(--accent-rgb,203,178,124),0.4)",
          marginBottom: "10px",
        }}
      >
        {label}
      </div>
      {children}
    </section>
  );
}

function SeekDivider() {
  return (
    <div
      style={{
        height: "1px",
        background: "rgba(var(--accent-rgb,203,178,124),0.08)",
        margin: "4px 0 20px",
      }}
    />
  );
}
