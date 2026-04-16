import { useEffect, useState, useRef, useCallback } from "react";
import CoreReading from "./SwipeReading";
import PremiumMenu from "./components/PremiumMenu";
import SettingsModal from "./components/SettingsModal";
import DialogueSystem from "./DialogueSystem";
import DevotionalScreen from "./components/DevotionalScreen";
import ChristRevealedIntro from "./components/ChristRevealedIntro";
import ChristRevealedJourney from "./components/ChristRevealedJourney";
import { AudioMiniPlayer } from "./components/AudioMiniPlayer";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import {
  getBookDisplayName,
  BIBLE_ORDER,
  CHAPTER_COUNT,
} from "./lib/bibleStructure";

const TRANSLATIONS = ["KJV", "ASR", "WAE"];
const TRANSLATION_FULL = {
  KJV: "King James Version",
  ASR: "ABIDE Source Reading",
  WAE: "Webster ABIDE Edition",
};
const TRANSLATIONS_WITH_AUDIO = new Set(["KJV"]);

// ── Canonical Bible sections for the navigator sheet ─────────────────────────
const BIBLE_SECTIONS = [
  {
    section: "Torah",
    subtitle: "The Law · 5 books",
    books: [
      { id: "genesis", name: "Genesis", chapters: 50 },
      { id: "exodus", name: "Exodus", chapters: 40 },
      { id: "leviticus", name: "Leviticus", chapters: 27 },
      { id: "numbers", name: "Numbers", chapters: 36 },
      { id: "deuteronomy", name: "Deuteronomy", chapters: 34 },
    ],
  },
  {
    section: "History",
    subtitle: "Historical Books · 12 books",
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
    section: "Wisdom",
    subtitle: "Poetry & Wisdom · 5 books",
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
    subtitle: "5 books",
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
    subtitle: "The Twelve · 12 books",
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
    section: "Gospels",
    subtitle: "4 books",
    books: [
      { id: "matthew", name: "Matthew", chapters: 28 },
      { id: "mark", name: "Mark", chapters: 16 },
      { id: "luke", name: "Luke", chapters: 24 },
      { id: "john", name: "John", chapters: 21 },
    ],
  },
  {
    section: "Acts",
    subtitle: "The Church · 1 book",
    books: [{ id: "acts", name: "Acts", chapters: 28 }],
  },
  {
    section: "Epistles",
    subtitle: "Paul's Letters · 13 books",
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
    subtitle: "8 books",
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
    section: "Prophecy",
    subtitle: "Revelation · 1 book",
    books: [{ id: "revelation", name: "Revelation", chapters: 22 }],
  },
];

// Build a flat book-id → section name lookup
const BOOK_SECTION_MAP = {};
BIBLE_SECTIONS.forEach(({ section, books }) =>
  books.forEach((b) => (BOOK_SECTION_MAP[b.id] = section)),
);

/* ===============================
   Icons
================================ */
function BibleIcon({ size = 22, color = "currentColor", strokeWidth = 2.2 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z" />
      <path d="M17 4h3v16h-3" />
      <path d="M9 8h4" />
      <path d="M11 6v4" />
    </svg>
  );
}

function SearchIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function MenuIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function SettingsIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function AudioIcon({ active }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="18"
      height="18"
      style={{
        color: active ? "var(--text-accent)" : "var(--text-secondary)",
        opacity: active ? 1 : 0.5,
        transition: "color 0.2s, opacity 0.2s",
      }}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

/* ===============================
   Bible Navigator Sheet
================================ */
function BibleNavigatorSheet({
  open,
  onClose,
  onNavigate,
  currentBookId,
  currentChapter,
}) {
  const [selectedBookId, setSelectedBookId] = useState(
    currentBookId || "genesis",
  );
  const booksColRef = useRef(null);
  const chaptersColRef = useRef(null);

  // Find selected book data
  const selectedBookData =
    BIBLE_SECTIONS.flatMap((s) => s.books).find(
      (b) => b.id === selectedBookId,
    ) || BIBLE_SECTIONS[0].books[0];

  // Scroll selected book into view when opening
  useEffect(() => {
    if (open && booksColRef.current) {
      setTimeout(() => {
        const el = booksColRef.current?.querySelector(".nav-book-selected");
        if (el) el.scrollIntoView({ block: "center" });
      }, 150);
    }
  }, [open]);

  // Scroll chapters to top when book changes
  useEffect(() => {
    if (chaptersColRef.current) chaptersColRef.current.scrollTop = 0;
  }, [selectedBookId]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 60,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 70,
          background: "var(--bg-menu)",
          borderRadius: "20px 20px 0 0",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          height: "84dvh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -12px 48px rgba(0,0,0,0.6)",
          animation: "sheetUp 0.32s cubic-bezier(0.4,0,0.2,1)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Handle + title */}
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "12px 0 4px",
            }}
          >
            <div
              style={{
                width: 32,
                height: 3,
                background: "var(--text-primary)",
                opacity: 0.15,
                borderRadius: 2,
              }}
            />
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "2px 24px 12px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.16em",
              color: "var(--text-primary)",
              opacity: 0.3,
              textTransform: "uppercase",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              fontFamily: "var(--font-ui)",
            }}
          >
            Go to
          </div>
        </div>

        {/* Two-column body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Books column */}
          <div
            ref={booksColRef}
            style={{
              width: 148,
              flexShrink: 0,
              overflowY: "auto",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              padding: "6px 0 24px",
            }}
          >
            {BIBLE_SECTIONS.map(({ section, subtitle, books }) => (
              <div key={section}>
                {/* Section tile */}
                <div
                  style={{
                    margin: "8px 8px 4px",
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: "rgba(203,178,124,0.08)",
                    border: "1px solid rgba(203,178,124,0.15)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--text-accent)",
                      fontFamily: "var(--font-ui)",
                      display: "block",
                    }}
                  >
                    {section}
                  </span>
                  <span
                    style={{
                      fontSize: 8,
                      color: "var(--text-secondary)",
                      opacity: 0.6,
                      fontFamily: "var(--font-ui)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {subtitle}
                  </span>
                </div>

                {/* Books */}
                {books.map((b) => {
                  const isSelected = b.id === selectedBookId;
                  return (
                    <div
                      key={b.id}
                      className={isSelected ? "nav-book-selected" : ""}
                      onClick={() => setSelectedBookId(b.id)}
                      style={{
                        padding: "10px 14px 10px 16px",
                        cursor: "pointer",
                        fontSize: 13.5,
                        fontFamily: "var(--font-ui)",
                        color: isSelected
                          ? "var(--text-accent)"
                          : "var(--text-secondary)",
                        fontWeight: isSelected ? 600 : 400,
                        borderLeft: isSelected
                          ? "2px solid var(--text-accent)"
                          : "2px solid transparent",
                        background: isSelected
                          ? "rgba(203,178,124,0.06)"
                          : "transparent",
                        lineHeight: 1.3,
                        transition: "background 0.1s, color 0.1s",
                      }}
                    >
                      {b.name}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Chapters column */}
          <div
            ref={chaptersColRef}
            style={{ flex: 1, overflowY: "auto", padding: "16px 14px 24px" }}
          >
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 22,
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: 4,
              }}
            >
              {selectedBookData.name}
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-accent)",
                opacity: 0.6,
                marginBottom: 16,
                fontFamily: "var(--font-ui)",
              }}
            >
              {BOOK_SECTION_MAP[selectedBookId]}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 7,
              }}
            >
              {Array.from(
                { length: selectedBookData.chapters },
                (_, i) => i + 1,
              ).map((ch) => {
                const isCurrent =
                  selectedBookId === currentBookId && ch === currentChapter;
                return (
                  <div
                    key={ch}
                    onClick={() => {
                      onNavigate(selectedBookId, ch);
                      onClose();
                    }}
                    style={{
                      aspectRatio: "1",
                      borderRadius: 9,
                      border: isCurrent
                        ? "none"
                        : "1px solid rgba(255,255,255,0.07)",
                      background: isCurrent
                        ? "var(--text-accent)"
                        : "rgba(255,255,255,0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: isCurrent ? 700 : 600,
                      fontFamily: "var(--font-ui)",
                      color: isCurrent
                        ? "var(--text-inverse)"
                        : "var(--text-secondary)",
                      transition: "background 0.12s, color 0.12s",
                    }}
                  >
                    {ch}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ===============================
   Seek (Word Study) constants
================================ */
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
const SEEK_CACHE_PREFIX = "abide_seek_v9:"; // v9: full verse snippet for start-of-verse matches

// ── Verse enrichment — replaces AI-generated text with real local translation ─
const SEEK_BOOK_NAME_TO_ID = {
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

function seekParseRef(ref) {
  const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!match) return null;
  const bookId = SEEK_BOOK_NAME_TO_ID[match[1].toLowerCase().trim()];
  if (!bookId) return null;
  return { book: bookId, chapter: match[2], verse: match[3] };
}

async function seekFetchVerseText(ref, translation) {
  const parsed = seekParseRef(ref);
  if (!parsed) return null;
  const { book, chapter, verse } = parsed;
  const t = translation.toLowerCase();
  const priority = t === "kjv" ? ["kjv"] : [t, "kjv"];
  for (const trans of priority) {
    try {
      const base = import.meta.env.BASE_URL;
      const res = await fetch(
        `${base}data/translations/${trans}/${book}/${chapter}.json`,
      );
      if (!res.ok) continue;
      const data = await res.json();
      const text = data.verses?.[verse];
      if (text) return { text, translation: trans.toUpperCase() };
    } catch {
      continue;
    }
  }
  return null;
}

async function seekEnrichVerses(verses, translation) {
  return Promise.all(
    verses.map(async (v) => {
      const result = await seekFetchVerseText(v.ref, translation);
      return result
        ? { ...v, text: result.text, translation: result.translation }
        : v;
    }),
  );
}

function getCached(q, translation) {
  try {
    const r = localStorage.getItem(
      SEEK_CACHE_PREFIX +
        translation.toLowerCase() +
        ":" +
        q.toLowerCase().trim(),
    );
    return r ? JSON.parse(r) : null;
  } catch {
    return null;
  }
}
function setCached(q, translation, data) {
  try {
    localStorage.setItem(
      SEEK_CACHE_PREFIX +
        translation.toLowerCase() +
        ":" +
        q.toLowerCase().trim(),
      JSON.stringify(data),
    );
  } catch {}
}

/* ===============================
   Search Panel (Scripture + Seek)
================================ */
function SearchPanel({ open, onClose, onNavigate, translation }) {
  const [tab, setTab] = useState("scripture"); // "scripture" | "seek" | "highlights"

  // Scripture search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const seekInputRef = useRef(null);
  const debounceRef = useRef(null);

  // Seek state
  const [seekQuery, setSeekQuery] = useState("");
  const [seekResult, setSeekResult] = useState(null);
  const [seekLoading, setSeekLoading] = useState(false);
  const [seekError, setSeekError] = useState(null);
  const [seekView, setSeekView] = useState("input"); // "input" | "result"
  const [fromCache, setFromCache] = useState(false);

  // Highlights tab state
  const [highlightTag, setHighlightTag] = useState("All");
  const [highlightSearch, setHighlightSearch] = useState("");

  function getTagColor(tag) {
    const colors = JSON.parse(localStorage.getItem("customTagColors") || "{}");
    return colors[tag] || null;
  }

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSeekQuery("");
      setSeekResult(null);
      setSeekView("input");
      setTab("scripture");
      setHighlightTag("All");
      setHighlightSearch("");
    }
  }, [open]);

  useEffect(() => {
    if (open && tab === "scripture")
      setTimeout(() => inputRef.current?.focus(), 100);
    if (open && tab === "seek")
      setTimeout(() => seekInputRef.current?.focus(), 100);
  }, [open, tab]);

  // ── Scripture search ──────────────────────────────────────────────────────
  // ── Scripture search ──────────────────────────────────────────────────────
  // ── Scripture search ──────────────────────────────────────────────────────
  async function doSearch(q) {
    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const cacheKey = q.trim().toLowerCase();
      const cached = getCached(cacheKey, translation);
      if (cached) {
        setResults(cached);
        setSearching(false);
        return;
      }

      const base = import.meta.env.BASE_URL;
      const t = translation.toLowerCase();
      const candidateSeen = new Set(); // deduplicates the scan pass
      const seenRefs = new Set();      // deduplicates what is pushed to finalResults
      const finalResults = [];
      // Strip trailing punctuation/dots so "For God So..." still matches
      const phrase = q.trim().toLowerCase().replace(/[.\s]+$/, "");
      const words = phrase.split(/\s+/).filter(Boolean);

      // Accepts if the full phrase is contained, OR every word is present.
      function matchesQuery(text) {
        const lower = text.toLowerCase();
        if (lower.includes(phrase)) return true;
        return words.every((w) => new RegExp(`\\b${w}\\b`, "i").test(lower));
      }

      function scoreVerse(text) {
        const lower = text.toLowerCase();

        // Tier 1 — full phrase present
        if (lower.includes(phrase)) {
          // Verse STARTS with the phrase (e.g. "For God so..." → John 3:16): highest priority
          return lower.trimStart().startsWith(phrase) ? 2000 : 1000;
        }

        // Tier 2 — all words except the last are present as a phrase, and the last
        // word is a prefix of the next token in the text (handles partial typing).
        if (words.length > 1) {
          const stem = words.slice(0, -1).join(" ");
          const lastWord = words[words.length - 1];
          const idx = lower.indexOf(stem);
          if (idx !== -1) {
            const after = lower.slice(idx + stem.length).trimStart();
            if (after.startsWith(lastWord)) return 900;
            return 500; // phrase stem matches but last word doesn't continue
          }
        }

        // Tier 3 — individual word scoring with proximity bonus
        let score = 0;
        let allPresent = true;
        words.forEach((w, i) => {
          if (new RegExp(`\\b${w}\\b`, "i").test(text)) {
            score += 10;
          } else {
            allPresent = false;
          }
          if (i < words.length - 1) {
            if (new RegExp(`\\b${w}\\b.{0,30}\\b${words[i + 1]}\\b`, "i").test(text))
              score += 8;
          }
        });
        if (allPresent) score += words.length * 5; // bonus when every word hits
        return score;
      }

      function parseCrossRef(ref) {
        const m = ref
          .trim()
          .toLowerCase()
          .match(/^(.+?)\s+(\d+):(\d+)/);
        if (!m) return null;
        const bookId = m[1].replace(/\s+/g, "");
        for (const section of BIBLE_SECTIONS)
          for (const book of section.books)
            if (
              book.id === bookId ||
              book.name.toLowerCase().replace(/\s+/g, "") === bookId
            )
              return { book, chapter: parseInt(m[2]), verse: parseInt(m[3]) };
        return null;
      }

      async function fetchVerseText(bookId, chapter, verseNum) {
        try {
          const res = await fetch(
            `${base}data/translations/${t}/${bookId}/${chapter}.json`,
          );
          if (!res.ok) return null;
          const data = await res.json();
          const verses = data.verses ?? data;
          const entries = Array.isArray(verses)
            ? verses
            : Object.entries(verses).map(([v, val]) => ({
                verse: Number(v),
                text: typeof val === "string" ? val : (val?.text ?? ""),
              }));
          const match = entries.find((v) => v.verse === verseNum);
          if (!match) return null;
          return typeof match.text === "string"
            ? match.text
            : (match.text?.text ?? "");
        } catch {
          return null;
        }
      }

      // Phase 1: find matching verses, stream high-score ones immediately
      const candidates = [];
      for (const section of BIBLE_SECTIONS) {
        for (const book of section.books) {
          try {
            for (let ch = 1; ch <= book.chapters; ch++) {
              const res = await fetch(
                `${base}data/translations/${t}/${book.id}/${ch}.json`,
              );
              if (!res.ok) continue;
              const data = await res.json();
              const verses = data.verses ?? data;
              const entries = Array.isArray(verses)
                ? verses
                : Object.entries(verses).map(([v, val]) => ({
                    verse: Number(v),
                    text: typeof val === "string" ? val : (val?.text ?? ""),
                  }));
              for (const v of entries) {
                const text =
                  typeof v.text === "string" ? v.text : (v.text?.text ?? "");
                if (!matchesQuery(text)) continue;
                const score = scoreVerse(text);
                if (score === 0) continue;
                // candidateSeen deduplicates the scan; seenRefs is reserved
                // for tracking what has actually been pushed to finalResults.
                const refKey = `${book.id}-${ch}-${v.verse}`;
                if (candidateSeen.has(refKey)) continue;
                candidateSeen.add(refKey);
                candidates.push({ book, ch, verse: v.verse, text, score, refKey });
              }
            }
          } catch {
            continue;
          }
        }
      }

      // Phase 2: sort candidates, push primary + up to 2 related into results.
      // seenRefs is only touched HERE and in Phase 3, so it correctly guards
      // against duplicates across all three phases.
      candidates.sort((a, b) => b.score - a.score);
      const primary = candidates[0] ?? null;
      const related = candidates.slice(1, 3);

      if (primary) {
        seenRefs.add(primary.refKey);
        finalResults.push({
          ref: `${primary.book.name} ${primary.ch}:${primary.verse}`,
          bookId: primary.book.id,
          chapter: primary.ch,
          snippet: highlightSnippet(primary.text, words[0]),
          score: primary.score,
        });
        // Stream the primary verse immediately so the UI isn't blank while
        // cross-refs are loading.
        setResults([...finalResults]);
      }

      // Phase 3: cross-refs for the PRIMARY verse only.
      // We try both key formats ("16" and "3:16") because the JSON files
      // are inconsistent across books.
      if (primary) {
        try {
          const crRes = await fetch(
            `${base}data/cross-references/${primary.book.id}/${primary.ch}.json`,
          );
          if (crRes.ok) {
            const crData = await crRes.json();
            const refs =
              crData[String(primary.verse)] ||
              crData[`${primary.ch}:${primary.verse}`] ||
              [];
            for (const cr of refs) {
              if (finalResults.length >= 20) break;
              const parsed = parseCrossRef(cr);
              if (!parsed) continue;
              const crKey = `${parsed.book.id}-${parsed.chapter}-${parsed.verse}`;
              if (seenRefs.has(crKey)) continue;
              seenRefs.add(crKey);
              const crText = await fetchVerseText(
                parsed.book.id,
                parsed.chapter,
                parsed.verse,
              );
              if (!crText) continue;
              finalResults.push({
                ref: `${parsed.book.name} ${parsed.chapter}:${parsed.verse}`,
                bookId: parsed.book.id,
                chapter: parsed.chapter,
                snippet: highlightSnippet(crText, words[0]),
                isCrossRef: true,
                crossRefFrom: `${primary.book.name} ${primary.ch}:${primary.verse}`,
                score: 0,
              });
            }
          }
        } catch {
          // cross-ref file unavailable — continue with what we have
        }
      }

      // Phase 4: append related verses that weren't already pulled in as
      // cross-refs so they don't crowd the primary result.
      for (const match of related) {
        if (seenRefs.has(match.refKey)) continue;
        seenRefs.add(match.refKey);
        finalResults.push({
          ref: `${match.book.name} ${match.ch}:${match.verse}`,
          bookId: match.book.id,
          chapter: match.ch,
          snippet: highlightSnippet(match.text, words[0]),
          score: match.score,
        });
      }

      setCached(cacheKey, translation, finalResults);
      setResults(finalResults);
    } catch {
      setResults([]);
    }
    setSearching(false);
  }

  function highlightSnippet(text, term) {
    const idx = text.toLowerCase().indexOf(term);
    if (idx === -1) return { pre: "", match: "", post: text.slice(0, 160) };
    let start = Math.max(0, idx - 60);
    while (start > 0 && text[start] !== " ") start--;
    // When the match is near the start, show the full verse rather than
    // cutting off mid-sentence with a fixed character window.
    let end = start === 0 ? text.length : Math.min(text.length, idx + term.length + 120);
    while (end < text.length && text[end] !== " ") end++;
    const pre = (start > 0 ? "..." : "") + text.slice(start, idx).trimStart();
    const match = text.slice(idx, idx + term.length);
    const post =
      text.slice(idx + term.length, end) + (end < text.length ? "..." : "");
    return { pre, match, post };
  }

  function checkBookNameQuery(val) {
    const q = val.trim().toLowerCase();
    for (const section of BIBLE_SECTIONS) {
      for (const book of section.books) {
        if (book.name.toLowerCase() === q || book.id === q) return book;
      }
    }
    return null;
  }

  function handleQueryChange(val) {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const bookMatch = checkBookNameQuery(val);
      if (bookMatch) {
        setResults([
          {
            ref: bookMatch.name,
            bookId: bookMatch.id,
            chapter: 1,
            isBookNav: true,
            snippet: {
              pre: "",
              match: bookMatch.name,
              post: " - " + bookMatch.chapters + " chapters",
            },
          },
        ]);
        return;
      }
      doSearch(val);
    }, 300);
  }

  // ── Seek word study ───────────────────────────────────────────────────────
  async function handleSeek(queryOverride) {
    const q = (queryOverride || seekQuery).trim();
    if (!q) return;
    setSeekLoading(true);
    setSeekError(null);
    setSeekResult(null);
    setFromCache(false);
    setSeekView("result");
    const cached = getCached(q, translation);
    if (cached) {
      setSeekResult(cached);
      setFromCache(true);
      setSeekLoading(false);
      return;
    }
    if (!navigator.onLine) {
      setSeekError("You're offline. Connect to search for this word.");
      setSeekLoading(false);
      return;
    }
    try {
      const response = await fetch(
        "https://abide-seek-proxy.jvargas22.workers.dev",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q, translation }),
        },
      );
      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      // Enrich verses with actual text from local translation files
      if (parsed.verses?.length) {
        parsed.verses = await seekEnrichVerses(parsed.verses, translation);
      }
      setCached(q, translation, parsed);
      setSeekResult(parsed);
    } catch {
      setSeekError("Something went wrong. Please try again.");
    }
    setSeekLoading(false);
  }

  if (!open) return null;

  const tabStyle = (active) => ({
    flex: 1,
    padding: "11px 0",
    background: "transparent",
    border: "none",
    borderBottom: active
      ? "2px solid var(--text-accent)"
      : "2px solid transparent",
    fontFamily: "var(--font-ui)",
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    cursor: "pointer",
    color: active ? "var(--text-accent)" : "var(--text-secondary)",
    opacity: active ? 1 : 0.55,
    transition: "color 0.15s, border-color 0.15s",
    marginBottom: -1,
    WebkitTapHighlightColor: "transparent",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "var(--bg-app)",
        display: "flex",
        flexDirection: "column",
        animation: "searchSlideUp 0.32s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <style>{`@keyframes searchSlideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }`}</style>

      {/* Header */}
      <div
        style={{
          padding: "calc(env(safe-area-inset-top) + 12px) 20px 0",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}
      >
        {/* Input row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          {tab !== "highlights" && (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: "10px 14px",
              }}
            >
              <SearchIcon size={16} />
              {tab === "scripture" ? (
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder={`Search ${translation}…`}
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--text-primary)",
                    fontSize: 15,
                    fontFamily: "var(--font-ui)",
                    width: "100%",
                    caretColor: "var(--text-accent)",
                  }}
                />
              ) : (
                <input
                  ref={seekInputRef}
                  value={seekQuery}
                  onChange={(e) => setSeekQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSeek()}
                  placeholder="e.g. Grace, Abide in Christ, Behold…"
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--text-primary)",
                    fontSize: 15,
                    fontFamily: "var(--font-ui)",
                    width: "100%",
                    caretColor: "var(--text-accent)",
                  }}
                />
              )}
              {(tab === "scripture" ? query : seekQuery) && (
                <button
                  onClick={() =>
                    tab === "scripture"
                      ? (setQuery(""), setResults([]))
                      : (setSeekQuery(""),
                        setSeekResult(null),
                        setSeekView("input"))
                  }
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    fontSize: 16,
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          )}
          {tab === "seek" && seekQuery && seekView === "input" && (
            <button
              onClick={() => handleSeek()}
              style={{
                background: "rgba(203,178,124,0.14)",
                border: "1px solid rgba(203,178,124,0.2)",
                borderRadius: 8,
                padding: "8px 14px",
                color: "var(--text-accent)",
                fontFamily: "var(--font-ui)",
                fontSize: 11,
                letterSpacing: "0.1em",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              SEEK
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-accent)",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--font-ui)",
              flexShrink: 0,
            }}
          >
            Cancel
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <button
            style={tabStyle(tab === "scripture")}
            onClick={() => setTab("scripture")}
          >
            Scripture
          </button>
          <button
            style={tabStyle(tab === "seek")}
            onClick={() => setTab("seek")}
          >
            Seek
          </button>
          <button
            style={tabStyle(tab === "highlights")}
            onClick={() => setTab("highlights")}
          >
            Highlights
          </button>
        </div>
      </div>

      {/* ── SCRIPTURE TAB ── */}
      {tab === "scripture" && (
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {!query && (
            <p
              style={{
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: 14,
                opacity: 0.55,
                marginTop: 48,
                fontFamily: "var(--font-body)",
                fontStyle: "italic",
                lineHeight: 1.8,
              }}
            >
              Search across all 66 books
              <br />
              in your active translation ({translation})
            </p>
          )}
          {searching && (
            <p
              style={{
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: 13,
                opacity: 0.5,
                marginTop: 48,
                fontFamily: "var(--font-ui)",
              }}
            >
              Searching…
            </p>
          )}
          {!searching && query && results.length === 0 && (
            <p
              style={{
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: 13,
                opacity: 0.5,
                marginTop: 48,
                fontFamily: "var(--font-ui)",
              }}
            >
              No results found
            </p>
          )}
          {!searching && (() => {
            const primaryResults = results.filter((r) => !r.isCrossRef);
            const crossRefsBySource = {};
            results
              .filter((r) => r.isCrossRef)
              .forEach((cr) => {
                if (!crossRefsBySource[cr.crossRefFrom])
                  crossRefsBySource[cr.crossRefFrom] = [];
                crossRefsBySource[cr.crossRefFrom].push(cr);
              });
            const pairedSources = new Set(Object.keys(crossRefsBySource).filter(
              (src) => primaryResults.some((p) => p.ref === src),
            ));
            const orphanCrossRefs = results.filter(
              (r) => r.isCrossRef && !pairedSources.has(r.crossRefFrom),
            );

            function renderSnippet(r) {
              return typeof r.snippet === "object" ? (
                <>
                  {r.snippet.pre}
                  <em
                    style={{
                      color: "var(--text-accent)",
                      fontStyle: "normal",
                      fontWeight: 600,
                    }}
                  >
                    {r.snippet.match}
                  </em>
                  {r.snippet.post}
                </>
              ) : (
                r.snippet
              );
            }

            function renderNavButton(r) {
              return (
                <button
                  onClick={() => {
                    onNavigate(r.bookId, r.chapter);
                    onClose();
                  }}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(203,178,124,0.3)",
                    borderRadius: 8,
                    padding: "7px 14px",
                    color: "var(--text-accent)",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "var(--font-ui)",
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                  }}
                >
                  {r.isBookNav ? "Go to book" : "Read full chapter"}
                </button>
              );
            }

            return (
              <>
                {primaryResults.map((r, i) => {
                  const crossRefs = crossRefsBySource[r.ref] || [];
                  return (
                    <div
                      key={i}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          color: "var(--text-accent)",
                          textTransform: "uppercase",
                          marginBottom: 6,
                          fontFamily: "var(--font-ui)",
                        }}
                      >
                        {r.ref}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 15,
                          lineHeight: 1.65,
                          color: "var(--text-primary)",
                          marginBottom: 12,
                        }}
                      >
                        {renderSnippet(r)}
                      </div>
                      {renderNavButton(r)}

                      {crossRefs.length > 0 && (
                        <>
                          <div
                            style={{
                              borderTop: "1px solid rgba(255,255,255,0.07)",
                              marginTop: 14,
                              paddingTop: 12,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: "0.12em",
                                color: "var(--text-secondary)",
                                textTransform: "uppercase",
                                fontFamily: "var(--font-ui)",
                                marginBottom: 10,
                                opacity: 0.6,
                              }}
                            >
                              See also
                            </div>
                            {crossRefs.map((cr, j) => (
                              <div
                                key={j}
                                style={{
                                  marginBottom: j < crossRefs.length - 1 ? 14 : 0,
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: "0.1em",
                                    color: "var(--text-secondary)",
                                    textTransform: "uppercase",
                                    marginBottom: 4,
                                    fontFamily: "var(--font-ui)",
                                  }}
                                >
                                  {cr.ref}
                                </div>
                                <div
                                  style={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: 14,
                                    lineHeight: 1.6,
                                    color: "var(--text-primary)",
                                    opacity: 0.85,
                                    marginBottom: 8,
                                  }}
                                >
                                  {renderSnippet(cr)}
                                </div>
                                {renderNavButton(cr)}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {orphanCrossRefs.map((r, i) => (
                  <div
                    key={`orphan-${i}`}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        marginBottom: 6,
                        fontFamily: "var(--font-ui)",
                      }}
                    >
                      {r.ref}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 15,
                        lineHeight: 1.65,
                        color: "var(--text-primary)",
                        marginBottom: 12,
                      }}
                    >
                      {renderSnippet(r)}
                    </div>
                    {renderNavButton(r)}
                  </div>
                ))}
              </>
            );
          })()}
          {!searching && results.length === 30 && (
            <p
              style={{
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: 12,
                opacity: 0.45,
                marginTop: 8,
                fontFamily: "var(--font-ui)",
              }}
            >
              Showing first 30 results — refine your search for more
            </p>
          )}
        </div>
      )}

      {/* ── SEEK TAB ── */}
      {tab === "seek" && (
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Input view — suggestions */}
          {seekView === "input" && (
            <>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  opacity: 0.45,
                  marginBottom: 12,
                  fontFamily: "var(--font-ui)",
                }}
              >
                Suggested
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 32,
                }}
              >
                {SEEK_SUGGESTIONS.map((word) => (
                  <button
                    key={word}
                    onClick={() => {
                      setSeekQuery(word);
                      handleSeek(word);
                    }}
                    style={{
                      background: "rgba(203,178,124,0.05)",
                      border: "1px solid rgba(203,178,124,0.14)",
                      borderRadius: 20,
                      padding: "8px 16px",
                      fontFamily: "var(--font-body)",
                      fontStyle: "italic",
                      fontSize: 14,
                      color: "rgba(203,178,124,0.65)",
                      cursor: "pointer",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {word}
                  </button>
                ))}
              </div>
              <div
                style={{
                  padding: "16px 18px",
                  background: "rgba(203,178,124,0.04)",
                  border: "1px solid rgba(203,178,124,0.08)",
                  borderRadius: 14,
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontStyle: "italic",
                    fontSize: 13,
                    color: "var(--text-primary)",
                    opacity: 0.45,
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  "Seek and you will find; knock and the door will be opened to
                  you."
                </p>
                <div
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 9,
                    letterSpacing: "0.14em",
                    color: "rgba(203,178,124,0.3)",
                    marginTop: 8,
                  }}
                >
                  MATTHEW 7:7
                </div>
              </div>

              {/* Clear Seek cache */}
              <button
                onClick={() => {
                  Object.keys(localStorage)
                    .filter((k) => k.startsWith("abide_seek_v"))
                    .forEach((k) => localStorage.removeItem(k));
                  alert(
                    "Seek cache cleared. Results will refresh on next search.",
                  );
                }}
                style={{
                  display: "block",
                  margin: "24px auto 0",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-ui)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  color: "rgba(203,178,124,0.25)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                CLEAR SEEK CACHE
              </button>
            </>
          )}

          {/* Result view */}
          {seekView === "result" && (
            <>
              {/* Back */}
              <button
                onClick={() => {
                  setSeekView("input");
                  setSeekResult(null);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 20,
                  background: "rgba(203,178,124,0.07)",
                  border: "1px solid rgba(203,178,124,0.14)",
                  borderRadius: 100,
                  padding: "6px 14px 6px 10px",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span style={{ fontSize: 13, color: "rgba(203,178,124,0.7)" }}>
                  ‹
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 12,
                    letterSpacing: "0.04em",
                    color: "rgba(203,178,124,0.7)",
                  }}
                >
                  Seek
                </span>
              </button>

              {/* Loading skeleton */}
              {seekLoading && (
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 22,
                      fontWeight: 300,
                      color: "rgba(203,178,124,0.3)",
                      letterSpacing: "0.04em",
                      marginBottom: 20,
                    }}
                  >
                    {seekQuery}
                  </div>
                  {[75, 55, 85, 50, 65, 40].map((w, i) => (
                    <div
                      key={i}
                      style={{
                        height: 11,
                        borderRadius: 6,
                        marginBottom: 10,
                        width: `${w}%`,
                        background: "rgba(203,178,124,0.08)",
                        animation: "shimmer 1.5s ease infinite",
                        animationDelay: `${i * 0.08}s`,
                      }}
                    />
                  ))}
                  <style>{`@keyframes shimmer{0%,100%{opacity:0.3}50%{opacity:0.65}}`}</style>
                </div>
              )}

              {/* Error */}
              {seekError && !seekLoading && (
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontStyle: "italic",
                    fontSize: 14,
                    color: "var(--text-primary)",
                    opacity: 0.45,
                    textAlign: "center",
                    paddingTop: 40,
                    lineHeight: 1.7,
                  }}
                >
                  {seekError}
                </p>
              )}

              {/* Result */}
              {seekResult && !seekLoading && (
                <>
                  <div
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "rgba(203,178,124,0.5)",
                      marginBottom: 6,
                    }}
                  >
                    ✦ Word Study
                    {fromCache && (
                      <span style={{ opacity: 0.5 }}> · saved</span>
                    )}
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 26,
                      fontWeight: 300,
                      letterSpacing: "0.03em",
                      color: "var(--text-primary)",
                      lineHeight: 1.2,
                      marginBottom: 20,
                    }}
                  >
                    {seekResult.word}
                  </h2>

                  {[
                    { label: "Definition", content: seekResult.definition },
                    { label: "In Scripture", content: seekResult.significance },
                  ].map(({ label, content }) => (
                    <div key={label} style={{ marginBottom: 20 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-ui)",
                          fontSize: 9,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "rgba(203,178,124,0.4)",
                          marginBottom: 10,
                        }}
                      >
                        {label}
                      </div>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 15,
                          lineHeight: 1.8,
                          color: "var(--text-primary)",
                          opacity: 0.85,
                          margin: 0,
                        }}
                      >
                        {content}
                      </p>
                      <div
                        style={{
                          height: 1,
                          background: "rgba(203,178,124,0.08)",
                          margin: "20px 0",
                        }}
                      />
                    </div>
                  ))}

                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: 9,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "rgba(203,178,124,0.4)",
                        marginBottom: 10,
                      }}
                    >
                      Key Verses
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {seekResult.verses?.map((v, i) => (
                        <div
                          key={i}
                          style={{
                            background: "rgba(203,178,124,0.04)",
                            border: "1px solid rgba(203,178,124,0.1)",
                            borderRadius: 12,
                            padding: "12px 14px",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "var(--font-ui)",
                              fontSize: 10,
                              letterSpacing: "0.1em",
                              color: "rgba(203,178,124,0.55)",
                              marginBottom: 8,
                            }}
                          >
                            {v.ref}
                          </div>
                          <div
                            style={{
                              borderLeft: "2px solid rgba(203,178,124,0.45)",
                              paddingLeft: 12,
                              marginBottom: 4,
                            }}
                          >
                            <div
                              style={{
                                fontFamily: "var(--font-body)",
                                fontStyle: "italic",
                                fontSize: 14,
                                color: "var(--text-accent)",
                                lineHeight: 1.65,
                              }}
                            >
                              "{v.text}"
                            </div>
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-ui)",
                              fontSize: 10,
                              letterSpacing: "0.08em",
                              color: "rgba(203,178,124,0.4)",
                              marginTop: 4,
                              marginBottom: 8,
                            }}
                          >
                            — {v.translation || "KJV"}
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: 12,
                              color: "var(--text-primary)",
                              opacity: 0.45,
                              lineHeight: 1.5,
                            }}
                          >
                            {v.note}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: 1,
                        background: "rgba(203,178,124,0.08)",
                        margin: "20px 0",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 32 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-ui)",
                        fontSize: 9,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "rgba(203,178,124,0.4)",
                        marginBottom: 10,
                      }}
                    >
                      Reflect
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 15,
                        lineHeight: 1.8,
                        fontStyle: "italic",
                        color: "var(--text-primary)",
                        opacity: 0.6,
                        margin: 0,
                      }}
                    >
                      {seekResult.reflection}
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── HIGHLIGHTS TAB ── */}
      {tab === "highlights" &&
        (() => {
          const saved = JSON.parse(
            localStorage.getItem("verseHighlights") || "{}",
          );
          const allHighlights = Object.values(saved);
          const userTags = JSON.parse(
            localStorage.getItem("customTags") || "[]",
          );
          const usedTags = userTags.filter((t) =>
            allHighlights.some((h) => (h.tags || []).includes(t)),
          );
          const filtered = allHighlights.filter((h) => {
            if (!h.tags || h.tags.length === 0) return false;
            const matchTag =
              highlightTag === "All" || h.tags.includes(highlightTag);
            const matchText =
              !highlightSearch ||
              h.text?.toLowerCase().includes(highlightSearch.toLowerCase());
            return matchTag && matchText;
          });

          return (
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 20px",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {usedTags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 16,
                  }}
                >
                  {["All", ...usedTags].map((tag) => {
                    const tagColor = getTagColor(tag);
                    const isActive = highlightTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => setHighlightTag(tag)}
                        style={{
                          padding: "5px 14px",
                          borderRadius: 999,
                          border: "none",
                          cursor: "pointer",
                          fontSize: 12,
                          fontFamily: "var(--font-ui)",
                          fontWeight: 600,
                          background: isActive
                            ? tag === "All"
                              ? "var(--text-accent)"
                              : tagColor || "var(--text-accent)"
                            : "rgba(255,255,255,0.08)",
                          color: isActive ? "#fff" : "var(--text-secondary)",
                          boxShadow:
                            isActive && tag !== "All" && tagColor
                              ? `0 0 0 1px ${tagColor}`
                              : "none",
                          transition: "background 0.15s",
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              )}

              {allHighlights.length === 0 && (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    fontSize: 14,
                    opacity: 0.55,
                    marginTop: 48,
                    fontFamily: "var(--font-body)",
                    fontStyle: "italic",
                    lineHeight: 1.8,
                  }}
                >
                  No highlights yet.
                  <br />
                  Tap a verse while reading to highlight it.
                </p>
              )}
              {allHighlights.length > 0 && filtered.length === 0 && (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    fontSize: 13,
                    opacity: 0.5,
                    marginTop: 48,
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  No highlights match
                </p>
              )}

              {filtered.map((h, i) => {
                const book = h.book
                  ? h.book.charAt(0).toUpperCase() + h.book.slice(1)
                  : "";
                const ref = `${book} ${h.chapter}:${h.verse}`;
                return (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderLeft: "3px solid var(--text-accent)",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: "var(--text-accent)",
                        textTransform: "uppercase",
                        marginBottom: 6,
                        fontFamily: "var(--font-ui)",
                      }}
                    >
                      {ref} · {h.translation}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 15,
                        lineHeight: 1.65,
                        color: "var(--text-primary)",
                        marginBottom: (h.tags || []).length ? 10 : 12,
                      }}
                    >
                      {h.text}
                    </div>
                    {(h.tags || []).length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                          marginBottom: 12,
                        }}
                      >
                        {h.tags.map((t) => {
                          const tc = getTagColor(t);
                          return (
                            <span
                              key={t}
                              style={{
                                fontSize: 11,
                                padding: "3px 10px",
                                borderRadius: 999,
                                background: tc
                                  ? `${tc}22`
                                  : "rgba(255,255,255,0.08)",
                                color: tc || "var(--text-secondary)",
                                border: `1px solid ${tc ? `${tc}55` : "transparent"}`,
                                fontFamily: "var(--font-ui)",
                              }}
                            >
                              {t}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        onNavigate(h.book, h.chapter);
                        onClose();
                      }}
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(203,178,124,0.3)",
                        borderRadius: 8,
                        padding: "7px 14px",
                        color: "var(--text-accent)",
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "var(--font-ui)",
                        letterSpacing: "0.06em",
                        cursor: "pointer",
                      }}
                    >
                      Read chapter
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })()}
    </div>
  );
}
/* ===============================
   App Shell
================================ */
export default function AppShell() {
  // One-time migration — clears old translation-unaware Seek cache (v5 and earlier)
  // Safe: only removes abide_seek_ keys, leaves notes/highlights/settings untouched
  useEffect(() => {
    const migrated = localStorage.getItem("abide_seek_cache_migrated_v7");
    if (!migrated) {
      Object.keys(localStorage)
        .filter(
          (k) => k.startsWith("abide_seek_v") && !k.startsWith("abide_seek_v7"),
        )
        .forEach((k) => localStorage.removeItem(k));
      localStorage.setItem("abide_seek_cache_migrated_v7", "1");
    }
  }, []);

  const [activeScreen, setActiveScreen] = useState("scripture");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [translationPickerOpen, setTranslationPickerOpen] = useState(false);
  const [miniPlayerOpen, setMiniPlayerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Bottom nav hide/show on scroll
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollElRef = useRef(null);

  const [uiMode, setUiMode] = useState("reading");
  const [reflectionOpen, setReflectionOpen] = useState(false);

  const [hideVerseNumbers, setHideVerseNumbers] = useState(
    () => localStorage.getItem("hideVerseNumbers") === "true",
  );
  const [chapterlessMode, setChapterlessMode] = useState(
    () => localStorage.getItem("chapterlessMode") === "true",
  );
  const [textSize, setTextSize] = useState(
    () => parseFloat(localStorage.getItem("textSize")) || 1.0,
  );
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "classic",
  );
  const [translation, setTranslation] = useState(
    () => localStorage.getItem("translation") || "KJV",
  );
  const [audioEnabled, setAudioEnabled] = useState(
    () => localStorage.getItem("audioEnabled") === "true",
  );

  const [readingContext, setReadingContext] = useState(() => {
    const saved = localStorage.getItem("lastReadingPosition");
    return saved ? JSON.parse(saved) : { book: "Genesis", chapter: 1 };
  });
  const [currentBookId, setCurrentBookId] = useState(
    () => localStorage.getItem("lastBookId") || "genesis",
  );
  const [navigationTarget, setNavigationTarget] = useState(null);
  const [showChristRevealedIntro, setShowChristRevealedIntro] = useState(false);

  // Audio
  const [audioBook, setAudioBook] = useState(currentBookId);
  const [audioChapter, setAudioChapter] = useState(readingContext.chapter);

  const audio = useAudioPlayer({
    book: audioBook,
    chapter: audioChapter,
    verseCount: 0,
    onAdvanceChapter: () => {
      const maxChapters = CHAPTER_COUNT[audioBook];
      const bookIndex = BIBLE_ORDER.indexOf(audioBook);
      let nextBook = audioBook;
      let nextChapter = audioChapter;
      if (audioChapter < maxChapters) {
        nextChapter = audioChapter + 1;
        setAudioChapter(nextChapter);
      } else if (bookIndex < BIBLE_ORDER.length - 1) {
        nextBook = BIBLE_ORDER[bookIndex + 1];
        nextChapter = 1;
        setAudioBook(nextBook);
        setAudioChapter(1);
      }
      const displayName = getBookDisplayName(nextBook);
      setReadingContext({ book: displayName, chapter: nextChapter });
      setCurrentBookId(nextBook);
      setNavigationTarget({ book: nextBook, chapter: nextChapter });
    },
  });

  useEffect(() => {
    if (!audio.isPlaying) {
      setAudioBook(currentBookId);
      setAudioChapter(readingContext.chapter);
    }
  }, [currentBookId, readingContext.chapter]);

  function handlePrevChapter() {
    const idx = BIBLE_ORDER.indexOf(audioBook);
    if (audioChapter > 1) setAudioChapter((c) => c - 1);
    else if (idx > 0) {
      const pb = BIBLE_ORDER[idx - 1];
      setAudioBook(pb);
      setAudioChapter(CHAPTER_COUNT[pb]);
    }
  }
  function handleNextChapter() {
    const max = CHAPTER_COUNT[audioBook];
    const idx = BIBLE_ORDER.indexOf(audioBook);
    if (audioChapter < max) setAudioChapter((c) => c + 1);
    else if (idx < BIBLE_ORDER.length - 1) {
      setAudioBook(BIBLE_ORDER[idx + 1]);
      setAudioChapter(1);
    }
  }

  /* ── Scroll-hide bottom nav ── */
  function handleScroll() {
    const el = scrollElRef.current;
    if (!el) return;
    const y = el.scrollTop;
    const delta = y - lastScrollY.current;
    if (y < 10) setNavVisible(true);
    else if (delta > 6) setNavVisible(false);
    else if (delta < -6) setNavVisible(true);
    lastScrollY.current = y;
  }

  const handleScrollRef = useCallback((el) => {
    if (scrollElRef.current)
      scrollElRef.current.removeEventListener("scroll", handleScroll);
    scrollElRef.current = el;
    if (el) {
      lastScrollY.current = el.scrollTop;
      el.addEventListener("scroll", handleScroll, { passive: true });
    }
  }, []);

  const handleReadingContext = useCallback((ctx) => {
    setReadingContext(ctx);
    lastScrollY.current = 0;
  }, []);

  /* ── Effects ── */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    const themeColors = {
      classic: "#cbb27c",
      "still-waters": "#1f6f78",
      "stone-fire": "#f97316",
      "olive-parchment": "#9d8f6f",
      parchment: "#8b7355",
    };
    const color = themeColors[theme] || "#cbb27c";
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = color;
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("hideVerseNumbers", hideVerseNumbers);
  }, [hideVerseNumbers]);
  useEffect(() => {
    localStorage.setItem("chapterlessMode", chapterlessMode);
  }, [chapterlessMode]);
  useEffect(() => {
    localStorage.setItem("textSize", textSize.toString());
    document.documentElement.style.setProperty(
      "--verse-size",
      `${textSize}rem`,
    );
  }, [textSize]);
  useEffect(() => {
    localStorage.setItem("translation", translation);
  }, [translation]);
  useEffect(() => {
    localStorage.setItem("audioEnabled", audioEnabled);
  }, [audioEnabled]);
  useEffect(() => {
    if (!TRANSLATIONS_WITH_AUDIO.has(translation)) setAudioEnabled(false);
  }, [translation]);
  useEffect(
    () => () => {
      if (scrollElRef.current)
        scrollElRef.current.removeEventListener("scroll", handleScroll);
    },
    [],
  );

  /* ── Navigation ── */
  function handleNavigate(bookId, chapter) {
    const displayName = getBookDisplayName(bookId);
    setCurrentBookId(bookId);
    setNavigationTarget({ book: bookId, chapter });
    setReadingContext({ book: displayName, chapter });
    setNavigatorOpen(false);
  }

  function handleSelectTranslation(t) {
    setTranslation(t);
    setTranslationPickerOpen(false);
    if (!TRANSLATIONS_WITH_AUDIO.has(t)) setAudioEnabled(false);
  }
  function handleEnableAudio(t) {
    setTranslation(t);
    setAudioEnabled(true);
    setTranslationPickerOpen(false);
  }

  function handleChristRevealedEntry() {
    const seen = localStorage.getItem("cr_intro_seen") === "true";
    if (!seen) setShowChristRevealedIntro(true);
    else setActiveScreen("christ-revealed");
  }
  function handleIntroComplete() {
    setShowChristRevealedIntro(false);
    setActiveScreen("christ-revealed");
  }
  function handleCRBack() {
    setNavigationTarget({
      book: currentBookId,
      chapter: readingContext.chapter,
    });
    setActiveScreen("scripture");
  }

  // Nav item active state
  const isScriptureActive = activeScreen === "scripture";

  return (
    <div
      className="no-select flex flex-col relative bg-[var(--bg-app)] text-[var(--text-primary)] font-[var(--font-ui)]"
      style={{ height: "100dvh", maxHeight: "100dvh", overflow: "hidden" }}
    >
      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes sheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .nav-item-btn { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
      `}</style>

      {/* Status bar */}
      <div
        className="fixed top-0 left-0 right-0 z-40"
        style={{
          height: "env(safe-area-inset-top)",
          background: "var(--bg-app)",
          pointerEvents: "none",
        }}
      />

      {/* ── TOP NAV ── */}
      {activeScreen === "scripture" &&
        uiMode === "reading" &&
        !reflectionOpen && (
          <nav
            style={{
              position: "sticky",
              top: 0,
              zIndex: 40,
              background: "var(--bg-app)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              padding: "calc(env(safe-area-inset-top) + 10px) 16px 10px",
              gap: 10,
            }}
          >
            {/* Book + chapter selector */}
            <button
              className="nav-item-btn"
              onClick={() => setNavigatorOpen(true)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "8px 14px",
                cursor: "pointer",
                minWidth: 0,
              }}
            >
              <BibleIcon
                size={18}
                color="var(--text-accent)"
                strokeWidth={2.5}
              />
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontFamily: "var(--font-ui)",
                }}
              >
                {readingContext.book} {readingContext.chapter}
              </span>
              <svg
                style={{
                  marginLeft: "auto",
                  color: "var(--text-secondary)",
                  flexShrink: 0,
                }}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Translation pill */}
            <button
              className="nav-item-btn"
              onClick={() => setTranslationPickerOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "8px 12px",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "var(--text-primary)",
                  opacity: 0.85,
                  fontFamily: "var(--font-ui)",
                }}
              >
                {translation}
              </span>
              {audioEnabled && TRANSLATIONS_WITH_AUDIO.has(translation) && (
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--text-accent)",
                  }}
                />
              )}
            </button>

            {/* Audio button */}
            {audioEnabled && TRANSLATIONS_WITH_AUDIO.has(translation) && (
              <button
                className="nav-item-btn"
                onClick={() => setMiniPlayerOpen(true)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  flexShrink: 0,
                  cursor: "pointer",
                  background: "rgba(203,178,124,0.12)",
                  border: "1px solid rgba(203,178,124,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
                {audio.isPlaying && (
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--text-accent)",
                      animation: "pulse 1.2s ease-in-out infinite",
                    }}
                  />
                )}
              </button>
            )}
          </nav>
        )}

      {/* Screens */}
      {activeScreen === "scripture" && (
        <CoreReading
          hideVerseNumbers={chapterlessMode}
          chapterlessMode={chapterlessMode}
          textSize={textSize}
          translation={translation}
          theme={theme}
          audioEnabled={audioEnabled}
          isAudioPlaying={audio.isPlaying}
          onReadingContext={handleReadingContext}
          onScrollProgress={() => {}}
          onScrollRef={handleScrollRef}
          navigationTarget={navigationTarget}
          onNavigationComplete={() => setNavigationTarget(null)}
          isModalOpen={navigatorOpen || searchOpen}
          uiMode={uiMode}
          onUiModeChange={setUiMode}
          reflectionOpen={reflectionOpen}
          onReflectionOpenChange={setReflectionOpen}
          onCrossRefNavigate={(bookId, chapter) => {
            handleNavigate(bookId, chapter);
            setReflectionOpen(false);
          }}
        />
      )}

      {activeScreen === "dialogue" && (
        <DialogueSystem
          theme={theme}
          translation={translation}
          onBack={() => {
            setNavigationTarget({
              book: currentBookId,
              chapter: readingContext.chapter,
            });
            setActiveScreen("scripture");
          }}
        />
      )}
      {activeScreen === "devotionals" && (
        <DevotionalScreen
          onBack={() => setActiveScreen("scripture")}
          theme={theme}
        />
      )}
      {activeScreen === "christ-revealed" && (
        <ChristRevealedJourney
          onBack={handleCRBack}
          onNavigateToBible={() => setActiveScreen("scripture")}
          readingContext={readingContext}
          translation={translation}
          theme={theme}
        />
      )}

      {/* ── BOTTOM NAV ── */}
      {activeScreen === "scripture" &&
        uiMode === "reading" &&
        !reflectionOpen && (
          <nav
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 40,
              background: "var(--bg-app)",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              paddingTop: 10,
              paddingLeft: 8,
              paddingRight: 8,
              paddingBottom: "max(10px, env(safe-area-inset-bottom))",
              transform: navVisible ? "translateY(0)" : "translateY(100%)",
              opacity: navVisible ? 1 : 0,
              transition:
                "transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease",
            }}
          >
            {/* Menu */}
            <button
              className="nav-item-btn"
              onClick={() => {
                setMenuVisible(true);
                requestAnimationFrame(() => setMenuOpen(true));
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "6px 16px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                minWidth: 60,
              }}
            >
              <div style={{ color: "var(--text-secondary)" }}>
                <MenuIcon />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  letterSpacing: "0.04em",
                  fontFamily: "var(--font-ui)",
                }}
              >
                Menu
              </span>
            </button>

            {/* Scripture */}
            <button
              className="nav-item-btn"
              onClick={() => setActiveScreen("scripture")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "6px 16px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                minWidth: 60,
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BibleIcon
                  size={22}
                  color={
                    isScriptureActive
                      ? "var(--text-accent)"
                      : "var(--text-secondary)"
                  }
                />
                {isScriptureActive && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: -4,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "var(--text-accent)",
                    }}
                  />
                )}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  fontFamily: "var(--font-ui)",
                  color: isScriptureActive
                    ? "var(--text-accent)"
                    : "var(--text-secondary)",
                }}
              >
                Scripture
              </span>
            </button>

            {/* Search */}
            <button
              className="nav-item-btn"
              onClick={() => setSearchOpen(true)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "6px 16px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                minWidth: 60,
              }}
            >
              <div style={{ color: "var(--text-secondary)" }}>
                <SearchIcon />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  letterSpacing: "0.04em",
                  fontFamily: "var(--font-ui)",
                }}
              >
                Search
              </span>
            </button>

            {/* Settings */}
            <button
              className="nav-item-btn"
              onClick={() => setSettingsOpen(true)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "6px 16px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                minWidth: 60,
              }}
            >
              <div style={{ color: "var(--text-secondary)" }}>
                <SettingsIcon />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  letterSpacing: "0.04em",
                  fontFamily: "var(--font-ui)",
                }}
              >
                Settings
              </span>
            </button>
          </nav>
        )}

      {/* ── Bible Navigator Sheet ── */}
      <BibleNavigatorSheet
        open={navigatorOpen}
        onClose={() => setNavigatorOpen(false)}
        onNavigate={handleNavigate}
        currentBookId={currentBookId}
        currentChapter={readingContext.chapter}
      />

      {/* ── Search Panel ── */}
      <SearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigate}
        translation={translation}
      />

      {/* ── Audio Mini Player ── */}
      {audioEnabled && (
        <AudioMiniPlayer
          open={miniPlayerOpen}
          onClose={() => setMiniPlayerOpen(false)}
          isPlaying={audio.isPlaying}
          isLoaded={audio.isLoaded}
          progress={audio.progress}
          audioRef={audio.audioRef}
          book={audioBook}
          chapter={audioChapter}
          onToggle={audio.toggle}
          onPrevChapter={handlePrevChapter}
          onNextChapter={handleNextChapter}
          theme={theme}
        />
      )}

      {/* ── Translation Picker ── */}
      {translationPickerOpen && (
        <>
          <div
            onClick={() => setTranslationPickerOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 60,
              animation: "fadeIn 0.2s ease",
            }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 70,
              background: "var(--bg-menu)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px 20px 0 0",
              paddingBottom: "max(24px, env(safe-area-inset-bottom))",
              boxShadow: "0 -12px 48px rgba(0,0,0,0.4)",
              animation: "sheetUp 0.32s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "12px 0 4px",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 3,
                  background: "var(--text-primary)",
                  opacity: 0.15,
                  borderRadius: 2,
                }}
              />
            </div>
            <div
              style={{
                padding: "8px 24px 14px",
                fontSize: 11,
                letterSpacing: "0.16em",
                color: "var(--text-primary)",
                opacity: 0.35,
                textTransform: "uppercase",
                textAlign: "center",
                fontFamily: "var(--font-ui)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              Translation
            </div>
            {TRANSLATIONS.map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <button
                  onClick={() => handleSelectTranslation(t)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 16px 16px 24px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        fontFamily: "var(--font-ui)",
                        color:
                          translation === t
                            ? "var(--text-accent)"
                            : "var(--text-primary)",
                        marginBottom: 3,
                      }}
                    >
                      {t}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-body)",
                        fontStyle: "italic",
                      }}
                    >
                      {TRANSLATION_FULL[t]}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: `1.5px solid ${translation === t ? "var(--text-accent)" : "rgba(255,255,255,0.15)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginRight: TRANSLATIONS_WITH_AUDIO.has(t) ? 12 : 0,
                    }}
                  >
                    {translation === t && (
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "var(--text-accent)",
                        }}
                      />
                    )}
                  </div>
                </button>
                {TRANSLATIONS_WITH_AUDIO.has(t) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEnableAudio(t);
                    }}
                    aria-label={`Enable audio for ${t}`}
                    style={{
                      padding: "16px 20px 16px 4px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AudioIcon active={audioEnabled && translation === t} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Premium Menu */}
      <PremiumMenu
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          setMenuVisible(false);
        }}
        onNavigate={(id) => {
          if (id === "dialogue") setActiveScreen("dialogue");
          else if (id === "devotionals") setActiveScreen("devotionals");
          else if (id === "christ-revealed") handleChristRevealedEntry();
          setMenuOpen(false);
          setMenuVisible(false);
        }}
        theme={theme}
      />

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        translation={translation}
        setTranslation={setTranslation}
        textSize={textSize}
        setTextSize={setTextSize}
        chapterlessMode={chapterlessMode}
        setChapterlessMode={setChapterlessMode}
      />

      {showChristRevealedIntro && (
        <ChristRevealedIntro
          theme={theme}
          translation={translation}
          onComplete={handleIntroComplete}
        />
      )}
    </div>
  );
}
