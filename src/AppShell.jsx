import { useEffect, useState, useRef, useCallback } from "react";
import CoreReading from "./SwipeReading";
import HomeScreen from "./components/HomeScreen";
import SettingsModal from "./components/SettingsModal";
import DialogueSystem from "./DialogueSystem";
import DevotionalScreen from "./components/DevotionalScreen";
import ChristRevealedIntro from "./components/ChristRevealedIntro";
import DailyAbidingScreen from "./components/DailyAbidingScreen";
import ChristRevealedJourney from "./components/ChristRevealedJourney";
import { AudioMiniPlayer } from "./components/AudioMiniPlayer";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import {
  getBookDisplayName,
  BIBLE_ORDER,
  CHAPTER_COUNT,
} from "./lib/bibleStructure";
import { search, warmIndex } from "./lib/searchEngine";
import RichTextJournal from "./RichTextJournal";
import AbideDictionary, { saveDictionaryEntry } from "./components/AbideDictionary";
import { getSeekCached, setSeekCached, clearSeekCache } from "./lib/seekCache";

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
function BibleIcon({ size = 22, color = "currentColor", strokeWidth = 2.5 }) {
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

function SearchIcon({ size = 22, strokeWidth = 2.5 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
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

function SettingsIcon({ size = 22, strokeWidth = 2.5 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
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
  // Matches "Book Chapter:Verse" or "Book Chapter:VerseStart-VerseEnd"
  const match = ref.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!match) return null;
  const bookId = SEEK_BOOK_NAME_TO_ID[match[1].toLowerCase().trim()];
  if (!bookId) return null;
  return {
    book: bookId,
    chapter: match[2],
    verse: match[3],
    verseEnd: match[4] ?? null,
  };
}

function extractVerseText(raw, verseNum) {
  if (Array.isArray(raw)) {
    const entry = raw.find(v => v.verse === verseNum);
    if (entry) return typeof entry.text === "string" ? entry.text : (entry.text?.text ?? "");
    const byIdx = raw[verseNum] ?? raw[verseNum - 1];
    if (byIdx) return typeof byIdx === "string" ? byIdx : (typeof byIdx.text === "string" ? byIdx.text : "");
  } else {
    const entry = raw[String(verseNum)] ?? raw[verseNum];
    if (entry) return typeof entry === "string" ? entry : (entry.text ?? "");
  }
  return "";
}

async function seekFetchVerseText(ref, translation) {
  const parsed = seekParseRef(ref);
  if (!parsed) return null;
  const { book, chapter, verse, verseEnd } = parsed;
  const verseStart = parseInt(verse, 10);
  const verseEndNum = verseEnd ? parseInt(verseEnd, 10) : verseStart;
  const t = translation.toLowerCase();
  const priority = t === "kjv" ? ["kjv"] : [t, "kjv"];
  for (const trans of priority) {
    try {
      const base = import.meta.env.BASE_URL;
      const res = await fetch(`${base}data/translations/${trans}/${book}/${chapter}.json`);
      if (!res.ok) continue;
      const data = await res.json();
      const raw = data.verses ?? data;
      const parts = [];
      for (let v = verseStart; v <= verseEndNum; v++) {
        const t = extractVerseText(raw, v);
        if (t) parts.push(t);
      }
      const text = parts.join(" ");
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
        : { ...v, text: "", translation: translation.toUpperCase() };
    }),
  );
}


/* ===============================
   Search Panel — YouVersion-style
================================ */
const TOPIC_CHIPS = [
  "Grace", "Faith", "Hope", "Love", "Peace", "Prayer", "Salvation",
  "Holy Spirit", "Redemption", "Covenant", "Abide", "Glory", "Mercy",
  "Forgiveness", "Righteousness", "Wisdom", "Strength", "Joy", "Trust",
];

function SearchPanel({ open, onClose, onNavigate, translation }) {
  const [filter, setFilter] = useState("scripture"); // "scripture" | "seek" | "highlights"

  // Scripture search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Seek state
  const [seekQuery, setSeekQuery] = useState("");
  const [seekResult, setSeekResult] = useState(null);
  const [seekLoading, setSeekLoading] = useState(false);
  const [seekError, setSeekError] = useState(null);
  const [seekView, setSeekView] = useState("input"); // "input" | "result"
  const [fromCache, setFromCache] = useState(false);
  const [seekSaved, setSeekSaved] = useState(false);

  // Highlights state
  const [highlightTag, setHighlightTag] = useState("All");
  const [highlights, setHighlights] = useState(() =>
    JSON.parse(localStorage.getItem("verseHighlights") || "{}")
  );
  // Re-read after SwipeReading may have migrated theme-keyed highlights on mount
  useEffect(() => {
    setHighlights(JSON.parse(localStorage.getItem("verseHighlights") || "{}"));
  }, [open]);
  const [userTags, setUserTags] = useState(() =>
    JSON.parse(localStorage.getItem("customTags") || "[]")
  );
  const [activeTagCard, setActiveTagCard] = useState(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#d4a843");

  const TAG_PALETTE = ["#e07b5b","#d4a843","#7db87d","#5b9bd4","#9b7dd4","#d47db8","#5bbdb8","#b8845b"];

  function addCustomTag(highlightKey) {
    const tag = newTagName.trim();
    if (!tag) return;
    const next = userTags.includes(tag) ? userTags : [...userTags, tag];
    setUserTags(next);
    localStorage.setItem("customTags", JSON.stringify(next));
    const colors = JSON.parse(localStorage.getItem("customTagColors") || "{}");
    colors[tag] = newTagColor;
    localStorage.setItem("customTagColors", JSON.stringify(colors));
    // Auto-apply to the current highlight
    if (highlightKey) toggleHighlightTag(highlightKey, tag);
    setNewTagName("");
  }

  function saveHighlights(next) {
    setHighlights(next);
    localStorage.setItem("verseHighlights", JSON.stringify(next));
  }

  function toggleHighlightTag(keys, tag) {
    const keyList = Array.isArray(keys) ? keys : [keys];
    const h = highlights[keyList[0]];
    if (!h) return;
    const current = h.tags || [];
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    const updated = { ...highlights };
    keyList.forEach((k) => {
      if (updated[k]) updated[k] = { ...updated[k], tags: next };
    });
    saveHighlights(updated);
  }

  function getTagColor(tag) {
    const colors = JSON.parse(localStorage.getItem("customTagColors") || "{}");
    return colors[tag] || null;
  }

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setQuery("");
        setResults([]);
        setSuggestions([]);
        setSeekQuery("");
        setSeekResult(null);
        setSeekView("input");
        setFilter("scripture");
        setHighlightTag("All");
      }, 0);
    }
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => { warmIndex(translation); }, [translation]);

  // ── Scripture search ──────────────────────────────────────────────────────
  async function doSearch(q) {
    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const cacheKey = q.trim().toLowerCase();
      const cached = await getSeekCached(cacheKey, translation, "scripture");
      if (cached) {
        setResults(cached);
        setSearching(false);
        return;
      }

      // Primary search — Meilisearch → MiniSearch fallback
      const primary = await search(q, translation);
      if (primary.length > 0) setResults(primary);

      const top = primary[0] ?? null;
      const finalResults = [...primary];
      const seenRefs = new Set(primary.map((r) => r.ref));

      // Cross-ref enrichment for the top result
      if (top) {
        const base = import.meta.env.BASE_URL;
        const t = translation.toLowerCase();
        const topVerse = parseInt(top.ref.match(/:(\d+)/)?.[1] ?? "0");

        function parseCrossRef(ref) {
          const m = ref.trim().toLowerCase().match(/^(.+?)\s+(\d+):(\d+)/);
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

        try {
          const crRes = await fetch(
            `${base}data/cross-references/${top.bookId}/${top.chapter}.json`,
          );
          if (crRes.ok) {
            const crData = await crRes.json();
            const refs =
              crData[String(topVerse)] ||
              crData[`${top.chapter}:${topVerse}`] ||
              [];
            for (const cr of refs) {
              if (finalResults.length >= 20) break;
              const parsed = parseCrossRef(cr);
              if (!parsed) continue;
              const crRef = `${parsed.book.name} ${parsed.chapter}:${parsed.verse}`;
              if (seenRefs.has(crRef)) continue;
              seenRefs.add(crRef);
              const crText = await fetchVerseText(
                parsed.book.id,
                parsed.chapter,
                parsed.verse,
              );
              if (!crText) continue;
              finalResults.push({
                ref: crRef,
                bookId: parsed.book.id,
                chapter: parsed.chapter,
                text: crText,
                snippet: highlightSnippet(crText, q.trim()),
                isCrossRef: true,
                crossRefFrom: top.ref,
                score: 0,
              });
            }
          }
        } catch { /* cross-ref unavailable */ }
      }

      await setSeekCached(cacheKey, translation, finalResults, "scripture");
      setResults(finalResults);
    } catch {
      setResults([]);
    }
    setSearching(false);
  }

  const SEARCH_STOP_WORDS = new Set([
    "a","an","and","are","as","at","be","been","being","but","by","do","did",
    "for","from","had","has","have","he","her","his","how","i","if","in","into",
    "is","it","its","me","may","might","my","no","not","of","on","or","our",
    "out","shall","she","should","so","than","that","the","their","them","then",
    "there","these","they","this","those","to","up","us","was","we","were",
    "what","when","where","who","will","with","would","you","your",
  ]);

  function highlightSnippet(text, query) {
    const lower = text.toLowerCase();

    // 1. Try full phrase
    let idx = lower.indexOf(query.toLowerCase());
    let matchLen = query.length;

    // 2. Fall back to best non-stop word
    if (idx === -1) {
      const words = query.split(/\s+/).sort((a, b) => {
        const aStop = SEARCH_STOP_WORDS.has(a.toLowerCase());
        const bStop = SEARCH_STOP_WORDS.has(b.toLowerCase());
        if (aStop !== bStop) return aStop ? 1 : -1;
        return b.length - a.length;
      });
      for (const w of words) {
        if (w.length < 3) continue;
        idx = lower.indexOf(w.toLowerCase());
        if (idx !== -1) { matchLen = w.length; break; }
      }
    }

    if (idx === -1) return { pre: "", match: "", post: text.slice(0, 160) };

    let start = Math.max(0, idx - 60);
    while (start > 0 && text[start] !== " ") start--;
    let end = start === 0 ? text.length : Math.min(text.length, idx + matchLen + 120);
    while (end < text.length && text[end] !== " ") end++;
    return {
      pre: (start > 0 ? "..." : "") + text.slice(start, idx).trimStart(),
      match: text.slice(idx, idx + matchLen),
      post: text.slice(idx + matchLen, end) + (end < text.length ? "..." : ""),
    };
  }

  function buildSuggestions(raw) {
    if (!raw || raw.trim().length < 2) return [];
    const lower = raw.trim().toLowerCase();
    const out = [];

    // Verse reference pattern → navigate directly
    const refPat = /^(\d?\s?[a-z]+)\s*(\d+)\s*[:\s]\s*(\d+)/i;
    if (refPat.test(raw.trim())) {
      out.push({ type: "ref", label: raw.trim() });
      return out;
    }

    // Book name prefix match
    for (const { books } of BIBLE_SECTIONS) {
      for (const book of books) {
        if (book.name.toLowerCase().startsWith(lower) || book.id.startsWith(lower)) {
          out.push({ type: "book", label: book.name, book });
          if (out.length >= 3) return out;
        }
      }
    }

    // Topic chips
    for (const topic of TOPIC_CHIPS) {
      if (topic.toLowerCase().includes(lower)) {
        out.push({ type: "topic", label: topic });
        if (out.length >= 6) break;
      }
    }
    return out;
  }

  function handleQueryChange(val) {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setResults([]);
      setSuggestions([]);
      return;
    }
    setSuggestions(buildSuggestions(val));
    debounceRef.current = setTimeout(() => {
      // Direct book nav
      const lower = val.trim().toLowerCase();
      for (const { books } of BIBLE_SECTIONS) {
        for (const book of books) {
          if (book.name.toLowerCase() === lower || book.id === lower) {
            setResults([{ ref: book.name, bookId: book.id, chapter: 1, isBookNav: true, text: `${book.chapters} chapters`, snippet: { pre: "", match: book.name, post: ` · ${book.chapters} chapters` } }]);
            setSuggestions([]);
            return;
          }
        }
      }
      doSearch(val);
    }, 200);
  }

  // ── Seek word study ───────────────────────────────────────────────────────
  async function handleSeek(queryOverride) {
    const q = (queryOverride || seekQuery).trim();
    if (!q) return;
    setSeekLoading(true);
    setSeekError(null);
    setSeekResult(null);
    setFromCache(false);
    setSeekSaved(false);
    setSeekView("result");
    const cached = await getSeekCached(q, translation, "seek");
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
      const isQuestion = /^(why|what|who|how|when|where|did|does|is|are|can|could|would|should|was|were)\b/i.test(q) || q.endsWith("?");
      const response = await fetch(
        "https://abide-seek-proxy.jvargas22.workers.dev",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q, translation, queryType: isQuestion ? "question" : "word_study" }),
        },
      );
      const data = await response.json();
      if (data.error) {
        setSeekError(`API error: ${data.error.message || JSON.stringify(data.error)}`);
        setSeekLoading(false);
        return;
      }
      const text = data.content?.[0]?.text || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      // Enrich verses with actual text from local translation files
      if (parsed.verses?.length) {
        parsed.verses = await seekEnrichVerses(parsed.verses, translation);
      }
      await setSeekCached(q, translation, parsed, "seek");
      setSeekResult(parsed);
    } catch (err) {
      setSeekError(`Something went wrong: ${err.message}`);
    }
    setSeekLoading(false);
  }

  if (!open) return null;

  const FILTERS = [
    { id: "scripture",  label: "Scripture" },
    { id: "seek",       label: "Seek" },
    { id: "highlights", label: "Highlights" },
  ];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:80, background:"var(--bg-app)", display:"flex", flexDirection:"column", animation:"searchSlideUp 0.32s cubic-bezier(0.4,0,0.2,1)" }}>
      <style>{`
        @keyframes searchSlideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes shimmer { 0%,100%{opacity:0.35} 50%{opacity:0.75} }
      `}</style>

      {/* ── Header ── */}
      <div style={{ padding:"calc(env(safe-area-inset-top) + 12px) 20px 0", borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0 }}>
        {/* Input + Cancel */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <div style={{ flex:1, display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"10px 14px" }}>
            <SearchIcon size={16} />
            <input
              ref={inputRef}
              value={filter === "seek" ? seekQuery : query}
              onChange={(e) => {
                if (filter === "seek") {
                  setSeekQuery(e.target.value);
                  if (seekView === "result") { setSeekView("input"); setSeekResult(null); }
                } else {
                  handleQueryChange(e.target.value);
                }
              }}
              onKeyDown={(e) => filter === "seek" && e.key === "Enter" && seekQuery.trim() && handleSeek()}
              placeholder={filter === "seek" ? "e.g. Abide · Why did Jesus weep? · Grace" : `Search ${translation}…`}
              style={{ background:"transparent", border:"none", outline:"none", color:"var(--text-primary)", fontSize:16, fontFamily:"var(--font-ui)", width:"100%", caretColor:"var(--text-accent)" }}
            />
            {(filter === "seek" ? seekQuery : query) && (
              <button
                onClick={() => filter === "seek"
                  ? (setSeekQuery(""), setSeekResult(null), setSeekView("input"))
                  : (setQuery(""), setResults([]), setSuggestions([]))}
                style={{ background:"transparent", border:"none", cursor:"pointer", color:"var(--text-secondary)", fontSize:18, lineHeight:1, padding:0 }}
              >×</button>
            )}
          </div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", cursor:"pointer", color:"var(--text-accent)", fontSize:14, fontWeight:600, fontFamily:"var(--font-ui)", flexShrink:0 }}>Cancel</button>
        </div>

        {/* Pills */}
        <div style={{ display:"flex", gap:8, padding:"4px 0 12px" }}>
          {FILTERS.map(({ id, label }) => {
            const active = filter === id;
            return (
              <button key={id} onClick={() => setFilter(id)} style={{
                flex:1, padding:"8px 0",
                background: active ? "var(--text-accent)" : "rgba(255,255,255,0.06)",
                border: active ? "none" : "1px solid rgba(255,255,255,0.09)",
                borderRadius:999,
                fontFamily:"var(--font-ui)", fontSize:11, letterSpacing:"0.1em",
                textTransform:"uppercase", cursor:"pointer",
                color: active ? "#1a1510" : "var(--text-secondary)",
                fontWeight: active ? 700 : 500,
                opacity: active ? 1 : 0.7,
                transition:"background 0.15s, color 0.15s",
                WebkitTapHighlightColor:"transparent",
              }}>{label}</button>
            );
          })}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch" }}>

      {/* BIBLE / ALL */}
      {filter === "scripture" && (
        <div style={{ padding:"12px 20px 40px" }}>
          {/* Empty state */}
          {!query && (
            <>
              <p style={{ textAlign:"center", color:"var(--text-secondary)", fontSize:14, opacity:0.45, marginTop:36, marginBottom:28, fontFamily:"var(--font-body)", fontStyle:"italic", lineHeight:1.8 }}>
                Search across all 66 books<br />in {translation}
              </p>
            </>
          )}
          {/* Typeahead suggestions */}
          {query && suggestions.length > 0 && !searching && results.length === 0 && (
            <div style={{ marginTop:4, marginBottom:8 }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => {
                  if (s.type === "book") { onNavigate(s.book.id, 1); onClose(); }
                  else if (s.type === "topic") { setFilter("seek"); setSeekQuery(s.label); handleSeek(s.label); }
                  else doSearch(query);
                }} style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"13px 4px", borderBottom:"1px solid rgba(255,255,255,0.05)", background:"transparent", border:"none", cursor:"pointer", textAlign:"left", WebkitTapHighlightColor:"transparent" }}>
                  <span style={{ fontSize:15, opacity:0.45, width:22, flexShrink:0 }}>
                    {s.type === "book" ? "📖" : s.type === "topic" ? "✦" : "→"}
                  </span>
                  <span style={{ fontFamily:"var(--font-ui)", fontSize:15, color:"var(--text-primary)", flex:1 }}>{s.label}</span>
                  <span style={{ fontFamily:"var(--font-ui)", fontSize:11, color:"var(--text-secondary)", opacity:0.45 }}>
                    {s.type === "book" ? "Book" : s.type === "topic" ? "Topic" : "Verse"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Searching skeleton */}
          {searching && (
            <div style={{ paddingTop:8 }}>
              {[85,60,78,50].map((w,i) => (
                <div key={i} style={{ borderLeft:"3px solid rgba(203,178,124,0.15)", borderRadius:10, padding:"14px 14px", marginBottom:10, background:"rgba(255,255,255,0.03)", animation:"shimmer 1.5s ease infinite", animationDelay:`${i*0.12}s` }}>
                  <div style={{ height:9, width:`${w*0.45}%`, borderRadius:6, background:"rgba(203,178,124,0.2)", marginBottom:10 }} />
                  <div style={{ height:8, width:`${w}%`, borderRadius:6, background:"rgba(255,255,255,0.07)", marginBottom:6 }} />
                  <div style={{ height:8, width:`${w*0.75}%`, borderRadius:6, background:"rgba(255,255,255,0.05)" }} />
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {!searching && query && results.length === 0 && suggestions.length === 0 && (
            <p style={{ textAlign:"center", color:"var(--text-secondary)", fontSize:13, opacity:0.5, marginTop:48, fontFamily:"var(--font-ui)" }}>No results found</p>
          )}

          {/* Results */}
          {!searching && results.length > 0 && (() => {
            const primaryResults = results.filter(r => !r.isCrossRef);
            const crossRefsBySource = {};
            results.filter(r => r.isCrossRef).forEach(cr => {
              if (!crossRefsBySource[cr.crossRefFrom]) crossRefsBySource[cr.crossRefFrom] = [];
              crossRefsBySource[cr.crossRefFrom].push(cr);
            });
            const pairedSources = new Set(Object.keys(crossRefsBySource).filter(src => primaryResults.some(p => p.ref === src)));
            const orphanCrossRefs = results.filter(r => r.isCrossRef && !pairedSources.has(r.crossRefFrom));

            const getVerseText = r => r.text || (typeof r.snippet === "object" ? r.snippet.pre + r.snippet.match + r.snippet.post : r.snippet || "");

            const NavBtn = ({ r }) => (
              <button onClick={() => { onNavigate(r.bookId, r.chapter); onClose(); }} style={{ background:"transparent", border:"1px solid rgba(203,178,124,0.25)", borderRadius:8, padding:"6px 14px", color:"var(--text-accent)", fontSize:11, fontWeight:600, fontFamily:"var(--font-ui)", letterSpacing:"0.06em", cursor:"pointer" }}>
                {r.isBookNav ? "Open book" : "Read chapter"}
              </button>
            );

            const VCard = ({ r, sub = false }) => {
              const crs = crossRefsBySource[r.ref] || [];
              return (
                <div style={{ borderLeft:`3px solid ${sub ? "rgba(203,178,124,0.3)" : "var(--text-accent)"}`, borderRadius:12, padding:"14px 16px", marginBottom:10, background:"rgba(255,255,255,0.03)" }}>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", color: sub ? "var(--text-secondary)" : "var(--text-accent)", textTransform:"uppercase", marginBottom:8, fontFamily:"var(--font-ui)" }}>{r.ref}</div>
                  <div style={{ fontFamily:"var(--font-body)", fontSize: sub ? 14 : 16, lineHeight:1.8, color:"var(--text-primary)", marginBottom:12, opacity: sub ? 0.8 : 1 }}>{getVerseText(r)}</div>
                  <NavBtn r={r} />
                  {crs.length > 0 && (
                    <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", marginTop:14, paddingTop:12 }}>
                      <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.14em", color:"var(--text-secondary)", textTransform:"uppercase", fontFamily:"var(--font-ui)", marginBottom:10, opacity:0.5 }}>See also</div>
                      {crs.map((cr, j) => <VCard key={j} r={cr} sub />)}
                    </div>
                  )}
                </div>
              );
            };

            return (
              <>
                {primaryResults.map((r, i) => <VCard key={i} r={r} />)}
                {orphanCrossRefs.map((r, i) => <VCard key={`o${i}`} r={r} sub />)}
                {results.length >= 25 && <p style={{ textAlign:"center", color:"var(--text-secondary)", fontSize:12, opacity:0.4, marginTop:8, fontFamily:"var(--font-ui)" }}>Showing top results — refine for more</p>}
              </>
            );
          })()}
        </div>
      )}

      {/* ── TOPICS (Seek) ── */}
      {filter === "seek" && (
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
                onClick={async () => {
                  await clearSeekCache();
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
                  Topics
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
                  {(() => {
                    const isQ = seekResult.type === "question";
                    return (
                      <>
                        <div style={{ fontFamily:"var(--font-ui)", fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(203,178,124,0.5)", marginBottom:6 }}>
                          {isQ ? "✦ Insight" : "✦ Word Study"}
                          {fromCache && <span style={{ opacity:0.5 }}> · saved</span>}
                        </div>
                        <h2 style={{ fontFamily:"var(--font-ui)", fontSize: isQ ? 20 : 26, fontWeight:300, letterSpacing:"0.03em", color:"var(--text-primary)", lineHeight:1.3, marginBottom:20 }}>
                          {isQ ? (seekResult.question || seekQuery) : seekResult.word}
                        </h2>
                        {!isQ && seekResult.originalLanguage && (
                          <div style={{ background:"rgba(203,178,124,0.05)", border:"1px solid rgba(203,178,124,0.12)", borderRadius:12, padding:"14px 16px", marginBottom:24 }}>
                            <div style={{ fontFamily:"var(--font-ui)", fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(203,178,124,0.4)", marginBottom:10 }}>
                              Original · {seekResult.originalLanguage.language}
                            </div>
                            <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:8, flexWrap:"wrap" }}>
                              <span style={{ fontFamily:"serif", fontSize:28, color:"var(--text-accent)", lineHeight:1.2 }}>{seekResult.originalLanguage.word}</span>
                              <span style={{ fontFamily:"var(--font-ui)", fontSize:14, color:"var(--text-secondary)", fontStyle:"italic", opacity:0.75 }}>{seekResult.originalLanguage.transliteration}</span>
                              {seekResult.originalLanguage.strongs && (
                                <span style={{ fontFamily:"var(--font-ui)", fontSize:10, color:"rgba(203,178,124,0.35)", letterSpacing:"0.05em" }}>{seekResult.originalLanguage.strongs}</span>
                              )}
                            </div>
                            <p style={{ fontFamily:"var(--font-body)", fontSize:14, color:"var(--text-primary)", opacity:0.7, lineHeight:1.65, margin:0 }}>
                              {seekResult.originalLanguage.meaning}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {(seekResult.type === "question"
                    ? [{ label: "Answer", content: seekResult.answer }, { label: "Context", content: seekResult.context }]
                    : [{ label: "Definition", content: seekResult.definition }, { label: "In Scripture", content: seekResult.significance }]
                  ).map(({ label, content }) => (
                    <div key={label} style={{ marginBottom: 20 }}>
                      <div style={{ fontFamily:"var(--font-ui)", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(203,178,124,0.4)", marginBottom:10 }}>
                        {label}
                      </div>
                      <p style={{ fontFamily:"var(--font-body)", fontSize:15, lineHeight:1.8, color:"var(--text-primary)", opacity:0.85, margin:0 }}>
                        {typeof content === "string" ? content : ""}
                      </p>
                      <div style={{ height:1, background:"rgba(203,178,124,0.08)", margin:"20px 0" }} />
                    </div>
                  ))}

                  {/* Exegesis — shown for questions */}
                  {seekResult.type === "question" && Array.isArray(seekResult.exegesis) && seekResult.exegesis.length > 0 && (
                    <div style={{ marginBottom:20 }}>
                      <div style={{ fontFamily:"var(--font-ui)", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(203,178,124,0.4)", marginBottom:12 }}>
                        Exegesis
                      </div>
                      {seekResult.exegesis.map((ex, i) => (
                        <div key={i} style={{ background:"rgba(203,178,124,0.04)", border:"1px solid rgba(203,178,124,0.1)", borderRadius:10, padding:"12px 14px", marginBottom:8 }}>
                          <div style={{ fontFamily:"var(--font-ui)", fontSize:10, letterSpacing:"0.08em", color:"var(--text-accent)", marginBottom:6 }}>{ex.passage}</div>
                          <p style={{ fontFamily:"var(--font-body)", fontSize:14, lineHeight:1.75, color:"var(--text-primary)", opacity:0.8, margin:"0 0 8px" }}>{typeof ex.explanation === "string" ? ex.explanation : ""}</p>
                          {ex.keyInsight && <div style={{ fontFamily:"var(--font-body)", fontStyle:"italic", fontSize:13, color:"var(--text-accent)", opacity:0.65 }}>"{ex.keyInsight}"</div>}
                        </div>
                      ))}
                      <div style={{ height:1, background:"rgba(203,178,124,0.08)", margin:"20px 0" }} />
                    </div>
                  )}

                  {/* Pastoral caution — shown if returned */}
                  {typeof seekResult.pastoralCaution === "string" && seekResult.pastoralCaution.trim() && (
                    <div style={{ background:"rgba(203,178,124,0.06)", border:"1px solid rgba(203,178,124,0.15)", borderRadius:10, padding:"12px 14px", marginBottom:20 }}>
                      <div style={{ fontFamily:"var(--font-ui)", fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(203,178,124,0.5)", marginBottom:6 }}>A Note</div>
                      <p style={{ fontFamily:"var(--font-body)", fontSize:13, lineHeight:1.7, color:"var(--text-primary)", opacity:0.65, margin:0 }}>{seekResult.pastoralCaution}</p>
                    </div>
                  )}

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
                      {Array.isArray(seekResult.verses) && seekResult.verses.map((v, i) => (
                        <div key={i} style={{ background:"rgba(203,178,124,0.04)", border:"1px solid rgba(203,178,124,0.1)", borderRadius:12, padding:"12px 14px" }}>
                          <div style={{ fontFamily:"var(--font-ui)", fontSize:10, letterSpacing:"0.1em", color:"rgba(203,178,124,0.55)", marginBottom:8 }}>
                            {typeof v.ref === "string" ? v.ref : ""}
                          </div>
                          {v.text && (
                            <div style={{ borderLeft:"2px solid rgba(203,178,124,0.45)", paddingLeft:12, marginBottom:4 }}>
                              <div style={{ fontFamily:"var(--font-body)", fontStyle:"italic", fontSize:14, color:"var(--text-accent)", lineHeight:1.65 }}>
                                "{typeof v.text === "string" ? v.text : ""}"
                              </div>
                            </div>
                          )}
                          <div style={{ fontFamily:"var(--font-ui)", fontSize:10, letterSpacing:"0.08em", color:"rgba(203,178,124,0.4)", marginTop:4, marginBottom:8 }}>
                            — {typeof v.translation === "string" ? v.translation : "KJV"}
                          </div>
                          <div style={{ fontFamily:"var(--font-body)", fontSize:12, color:"var(--text-primary)", opacity:0.45, lineHeight:1.5 }}>
                            {typeof v.note === "string" ? v.note : ""}
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
                      {typeof seekResult.reflection === "string" ? seekResult.reflection : ""}
                    </p>
                  </div>

                  {/* Save to Dictionary */}
                  <button
                    onClick={() => {
                      if (seekSaved) return;
                      try {
                        saveDictionaryEntry(seekResult, seekQuery);
                        setSeekSaved(true);
                      } catch {
                        alert("Could not save — storage may be full or restricted.");
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      width: "100%",
                      padding: "13px",
                      marginBottom: 32,
                      background: seekSaved
                        ? "rgba(203,178,124,0.12)"
                        : "rgba(203,178,124,0.07)",
                      border: `1px solid rgba(203,178,124,${seekSaved ? "0.35" : "0.18"})`,
                      borderRadius: 12,
                      color: "var(--text-accent)",
                      fontFamily: "var(--font-ui)",
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      cursor: seekSaved ? "default" : "pointer",
                      WebkitTapHighlightColor: "transparent",
                      touchAction: "manipulation",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{seekSaved ? "◉" : "◎"}</span>
                    {seekSaved ? "Saved to Dictionary" : "Save to Dictionary"}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── HIGHLIGHTS ── */}
      {filter === "highlights" && (() => {
          const allHighlights = Object.entries(highlights).map(([key, h]) => ({ key, ...h }));

          // Group individual verse entries that were highlighted together
          const groupMap = {};
          allHighlights.forEach((h) => {
            const gid = h.groupId || h.key;
            if (!groupMap[gid]) groupMap[gid] = [];
            groupMap[gid].push(h);
          });
          const allGroups = Object.values(groupMap).map((entries) => {
            const sv = [...entries].sort((a, b) => a.verse - b.verse);
            return {
              key: sv[0].key,
              allKeys: sv.map((e) => e.key),
              book: sv[0].book,
              chapter: sv[0].chapter,
              colorId: sv[0].colorId,
              theme: sv[0].theme,
              translation: sv[0].translation,
              tags: sv[0].tags || [],
              createdAt: sv[0].createdAt,
              minVerse: sv[0].verse,
              maxVerse: sv[sv.length - 1].verse,
              text: sv.map((v) => v.text).join(" "),
            };
          });
          const filtered = highlightTag === "All"
            ? allGroups
            : allGroups.filter((g) => (g.tags || []).includes(highlightTag));
          const sorted = [...filtered].sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );

          return (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", WebkitOverflowScrolling: "touch" }}>

              {/* Tag filter bar + New Tag button */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
                {["All", ...userTags].map((tag) => {
                  const tagColor = getTagColor(tag);
                  const isActive = highlightTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setHighlightTag(tag)}
                      style={{
                        padding: "5px 14px", borderRadius: 999, border: "none",
                        cursor: "pointer", fontSize: 12, fontFamily: "var(--font-ui)",
                        fontWeight: 600,
                        background: isActive ? (tag === "All" ? "var(--text-accent)" : tagColor || "var(--text-accent)") : "rgba(255,255,255,0.08)",
                        color: isActive ? "#fff" : "var(--text-secondary)",
                        transition: "background 0.15s",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >{tag}</button>
                  );
                })}
              </div>

              {/* Empty states */}
              {allGroups.length === 0 && (
                <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 14, opacity: 0.55, marginTop: 48, fontFamily: "var(--font-body)", fontStyle: "italic", lineHeight: 1.8 }}>
                  No highlights yet.<br />Tap a verse while reading to highlight it.
                </p>
              )}
              {allGroups.length > 0 && sorted.length === 0 && (
                <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 13, opacity: 0.5, marginTop: 48, fontFamily: "var(--font-ui)" }}>
                  No highlights tagged "{highlightTag}"
                </p>
              )}

              {/* Highlight cards */}
              {sorted.map((group) => {
                const verseRange = group.minVerse === group.maxVerse
                  ? `${group.minVerse}`
                  : `${group.minVerse}-${group.maxVerse}`;
                const ref = `${group.book || ""} ${group.chapter}:${verseRange}`;
                const appliedTags = group.tags || [];
                const highlightColor = (() => {
                  const themeColors = {
                    classic:          [{ id:"gold",color:"rgba(203,178,124,0.50)"},{id:"amber",color:"rgba(255,191,105,0.35)"},{id:"bronze",color:"rgba(139,115,85,0.45)"}],
                    "still-waters":   [{ id:"teal",color:"rgba(0,128,128,0.35)"},{id:"aqua",color:"rgba(127,255,212,0.30)"},{id:"deep-sea",color:"rgba(25,89,89,0.40)"}],
                    "stone-fire":     [{ id:"flame",color:"rgba(255,99,71,0.38)"},{id:"sunset",color:"rgba(255,140,0,0.35)"},{id:"ember",color:"rgba(178,34,34,0.40)"}],
                    "olive-parchment":[{ id:"sage",color:"rgba(143,151,121,0.40)"},{id:"wheat",color:"rgba(196,164,132,0.38)"},{id:"moss",color:"rgba(101,104,71,0.42)"}],
                    parchment:        [{ id:"sepia",color:"rgba(112,66,20,0.35)"},{id:"sand",color:"rgba(194,178,128,0.38)"},{id:"mahogany",color:"rgba(75,35,15,0.42)"}],
                  };
                  const palette = themeColors[group.theme] || themeColors.classic;
                  return (palette.find((c) => c.id === group.colorId) || palette[0]).color;
                })();

                return (
                  <div
                    key={group.key}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderLeft: `3px solid ${highlightColor}`,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                    }}
                  >
                    {/* Header row: color dot + reference + share */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                        background: highlightColor,
                        border: "1px solid rgba(255,255,255,0.2)",
                      }} />
                      <div style={{
                        flex: 1, fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700,
                        letterSpacing: "0.1em", color: "var(--text-accent)", textTransform: "uppercase",
                      }}>
                        {ref} · {group.translation}
                      </div>
                      {/* Share */}
                      <button
                        onClick={async () => {
                          const { shareVerseAsImage } = await import("./ShareAsImage");
                          const bookName = group.book ? group.book.charAt(0).toUpperCase() + group.book.slice(1) : "";
                          const reference = `${bookName} ${group.chapter}:${verseRange} · ${group.translation}`;
                          const ok = await shareVerseAsImage({ reference, text: group.text }, group.theme || "classic");
                          if (!ok && navigator.share) {
                            navigator.share({ text: `"${group.text}"\n\n— ${reference}` }).catch(() => {});
                          }
                        }}
                        style={{
                          background: "transparent", border: "none", padding: 4,
                          color: "var(--text-accent)", opacity: 0.55, cursor: "pointer",
                          display: "flex", alignItems: "center",
                          WebkitTapHighlightColor: "transparent",
                        }}
                        title="Share verse"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
                          <circle cx="18" cy="19" r="3"/>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                      </button>
                    </div>

                    {/* Verse text */}
                    <div style={{
                      fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.65,
                      color: "var(--text-primary)", marginBottom: 12,
                    }}>
                      {group.text}
                    </div>

                    {/* Applied tags display */}
                    {appliedTags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                        {appliedTags.map((tag) => {
                          const tc = getTagColor(tag);
                          return (
                            <span
                              key={tag}
                              style={{
                                fontSize: 11, padding: "3px 10px", borderRadius: 999,
                                fontFamily: "var(--font-ui)", fontWeight: 500,
                                background: tc ? `${tc}33` : "rgba(203,178,124,0.18)",
                                color: tc || "var(--text-accent)",
                                border: `1px solid ${tc ? `${tc}66` : "rgba(203,178,124,0.35)"}`,
                              }}
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* + Tag button */}
                    <button
                      onClick={() => {
                        setActiveTagCard(activeTagCard === group.key ? null : group.key);
                        setNewTagName("");
                        setNewTagColor("#d4a843");
                      }}
                      style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 999, marginBottom: 10,
                        cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 600,
                        background: "transparent", color: "var(--text-accent)",
                        border: "1px dashed rgba(203,178,124,0.35)",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      {activeTagCard === group.key ? "✕ Close" : "+ Tag"}
                    </button>

                    {/* Per-card tag panel */}
                    {activeTagCard === group.key && (
                      <div style={{
                        background: "rgba(203,178,124,0.06)",
                        border: "1px solid rgba(203,178,124,0.15)",
                        borderRadius: 12, padding: "12px 14px", marginBottom: 10,
                      }}>
                        {/* Existing tags to pick */}
                        {userTags.length > 0 && (
                          <>
                            <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(203,178,124,0.45)", marginBottom: 8 }}>
                              Your Tags
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                              {userTags.map((tag) => {
                                const active = appliedTags.includes(tag);
                                const tc = getTagColor(tag);
                                return (
                                  <button
                                    key={tag}
                                    onClick={() => toggleHighlightTag(group.allKeys, tag)}
                                    style={{
                                      fontSize: 11, padding: "4px 12px", borderRadius: 999,
                                      cursor: "pointer", fontFamily: "var(--font-ui)", fontWeight: 500,
                                      background: active ? (tc ? `${tc}33` : "rgba(203,178,124,0.18)") : "rgba(255,255,255,0.05)",
                                      color: active ? (tc || "var(--text-accent)") : "var(--text-secondary)",
                                      border: `1px solid ${active ? (tc ? `${tc}66` : "rgba(203,178,124,0.35)") : "rgba(255,255,255,0.1)"}`,
                                      transition: "all 0.15s ease",
                                      WebkitTapHighlightColor: "transparent",
                                    }}
                                  >
                                    {active ? "✓ " : ""}{tag}
                                  </button>
                                );
                              })}
                            </div>
                            <div style={{ height: 1, background: "rgba(203,178,124,0.1)", marginBottom: 12 }} />
                          </>
                        )}

                        {/* New tag creator */}
                        <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(203,178,124,0.45)", marginBottom: 8 }}>
                          New Tag
                        </div>
                        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                          {TAG_PALETTE.map((c) => (
                            <button
                              key={c}
                              onClick={() => setNewTagColor(c)}
                              style={{
                                width: 22, height: 22, borderRadius: "50%", background: c,
                                border: "none", cursor: "pointer", flexShrink: 0,
                                boxShadow: newTagColor === c ? `0 0 0 2px #fff, 0 0 0 3.5px ${c}` : "none",
                                transition: "box-shadow 0.12s ease",
                                WebkitTapHighlightColor: "transparent",
                              }}
                            />
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addCustomTag(group.allKeys)}
                            placeholder="Tag name…"
                            style={{
                              flex: 1, background: "rgba(0,0,0,0.2)",
                              border: `1px solid ${newTagColor}`,
                              borderRadius: 999, padding: "6px 12px",
                              fontFamily: "var(--font-ui)", fontSize: 12,
                              color: "var(--text-primary)", outline: "none",
                            }}
                          />
                          <button
                            onClick={() => addCustomTag(group.allKeys)}
                            style={{
                              padding: "6px 14px", borderRadius: 999, border: "none",
                              background: newTagColor, color: "#fff",
                              fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600,
                              cursor: "pointer", WebkitTapHighlightColor: "transparent",
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Read chapter */}
                    <button
                      onClick={() => { onNavigate(group.book, group.chapter); onClose(); }}
                      style={{
                        background: "transparent", border: "1px solid rgba(203,178,124,0.25)",
                        borderRadius: 8, padding: "7px 14px", color: "var(--text-accent)",
                        fontSize: 12, fontWeight: 600, fontFamily: "var(--font-ui)",
                        letterSpacing: "0.06em", cursor: "pointer",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      Read chapter →
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
/* ===============================
   App Shell
================================ */
const BOOK_ABBREV = {
  genesis: "Gen", exodus: "Ex", leviticus: "Lev", numbers: "Num",
  deuteronomy: "Dt", joshua: "Jos", judges: "Jdg", ruth: "Ru",
  "1samuel": "1Sa", "2samuel": "2Sa", "1kings": "1Ki", "2kings": "2Ki",
  "1chronicles": "1Ch", "2chronicles": "2Ch", ezra: "Ezr", nehemiah: "Neh",
  esther: "Est", job: "Job", psalms: "Ps", proverbs: "Pr",
  ecclesiastes: "Ec", songofsolomon: "SS", isaiah: "Isa", jeremiah: "Jer",
  lamentations: "Lam", ezekiel: "Ezk", daniel: "Dan", hosea: "Hos",
  joel: "Joel", amos: "Am", obadiah: "Ob", jonah: "Jon", micah: "Mic",
  nahum: "Na", habakkuk: "Hab", zephaniah: "Zep", haggai: "Hag",
  zechariah: "Zec", malachi: "Mal",
  matthew: "Mt", mark: "Mk", luke: "Lk", john: "Jn", acts: "Ac",
  romans: "Ro", "1corinthians": "1Co", "2corinthians": "2Co",
  galatians: "Gal", ephesians: "Eph", philippians: "Ph", colossians: "Col",
  "1thessalonians": "1Th", "2thessalonians": "2Th", "1timothy": "1Ti",
  "2timothy": "2Ti", titus: "Tit", philemon: "Phm", hebrews: "Heb",
  james: "Jas", "1peter": "1Pe", "2peter": "2Pe", "1john": "1Jn",
  "2john": "2Jn", "3john": "3Jn", jude: "Jude", revelation: "Rev",
};

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

  // Migrate seek cache from localStorage (v7/v9) to IndexedDB
  useEffect(() => {
    if (!localStorage.getItem("abide_idb_migrated")) {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("abide_seek_v"))
        .forEach((k) => localStorage.removeItem(k));
      localStorage.setItem("abide_idb_migrated", "1");
    }
  }, []);

  const [activeScreen, setActiveScreen] = useState("home");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [translationPickerOpen, setTranslationPickerOpen] = useState(false);
  const [miniPlayerOpen, setMiniPlayerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Persistent scripture scratchpad — draft auto-saved to localStorage
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [scratchpadHasDraft, setScratchpadHasDraft] = useState(
    () => !!(localStorage.getItem("scratchpad_draft"))
  );

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
  const [translation, setTranslation] = useState(() => {
    const stored = localStorage.getItem("translation");
    return TRANSLATIONS.includes(stored) ? stored : "KJV";
  });
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
  const [passageTabs, setPassageTabs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("passageTabs") || "[]"); }
    catch { return []; }
  });
  const [showChristRevealedIntro, setShowChristRevealedIntro] = useState(false);

  // Audio
  const [audioBook, setAudioBook] = useState(currentBookId);
  const [audioChapter, setAudioChapter] = useState(readingContext.chapter);

  const audio = useAudioPlayer({
    book: audioBook,
    chapter: audioChapter,
    verseCount: 0,
    enabled: audioEnabled,
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
    setActiveScreen("scripture");
    localStorage.setItem("lastBookId", bookId);
    localStorage.setItem("lastReadingPosition", JSON.stringify({ book: displayName, chapter }));
  }

  function pinCurrentPassage() {
    const id = `${currentBookId}-${readingContext.chapter}`;
    const alreadyPinned = passageTabs.some((t) => t.id === id);
    const newTabs = alreadyPinned
      ? passageTabs.filter((t) => t.id !== id)
      : [...passageTabs, { id, bookId: currentBookId, displayName: readingContext.book, chapter: readingContext.chapter }];
    setPassageTabs(newTabs);
    if (newTabs.length > 0) localStorage.setItem("passageTabs", JSON.stringify(newTabs));
    else localStorage.removeItem("passageTabs");
  }

  function closePassageTab(id) {
    const newTabs = passageTabs.filter((t) => t.id !== id);
    setPassageTabs(newTabs);
    if (newTabs.length > 0) localStorage.setItem("passageTabs", JSON.stringify(newTabs));
    else localStorage.removeItem("passageTabs");
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

  // Parchment is a light theme — its CSS variables are dark ink, which would be
  // invisible on the dark-glass pill backgrounds. All other themes have light CSS vars.
  const isParchment = theme === "parchment";
  const navAccent   = isParchment ? "rgba(203,178,124,0.95)" : "var(--text-accent)";
  const navPrimary  = isParchment ? "rgba(255,255,255,0.92)" : "var(--text-primary)";
  const navInactive = isParchment ? "rgba(255,255,255,0.55)" : "var(--text-secondary)";
  const navMuted    = isParchment ? "rgba(255,255,255,0.35)" : "var(--text-secondary)";

  function handleScratchpadSave({ html, text }) {
    const entry = {
      id: Date.now().toString(),
      type: "journal",
      scripture: `${readingContext.book} ${readingContext.chapter}`,
      text,
      html,
      createdAt: new Date().toISOString(),
    };
    const saveEntry = () => {
      const saved = JSON.parse(localStorage.getItem("dialogues") || "[]");
      saved.unshift(entry);
      localStorage.setItem("dialogues", JSON.stringify(saved));
    };
    try {
      saveEntry();
    } catch {
      alert("Storage is full. Please delete some content and try again.");
    }
    setScratchpadHasDraft(false);
    setQuickNoteOpen(false);
  }

  const isCurrentPassagePinned = passageTabs.some(
    (t) => t.bookId === currentBookId && t.chapter === readingContext.chapter,
  );

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
        (uiMode === "reading" || uiMode === "highlighting") &&
        !reflectionOpen && (
          <nav
            style={{
              position: "sticky",
              top: "calc(env(safe-area-inset-top) + 8px)",
              zIndex: 40,
              margin: "calc(env(safe-area-inset-top) + 8px) 0 0 16px",
              alignSelf: "flex-start",
              background: "rgba(15,12,8,0.85)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              padding: "8px 10px",
              gap: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Book + chapter selector */}
            <button
              className="nav-item-btn"
              onClick={() => setNavigatorOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              <BibleIcon
                size={18}
                color={navAccent}
                strokeWidth={2.5}
              />
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: navPrimary,
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
                  color: navMuted,
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
                  color: navPrimary,
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
                    background: navAccent,
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

            {/* Pin passage tab */}
            <button
              className="nav-item-btn"
              onClick={pinCurrentPassage}
              title={isCurrentPassagePinned ? "Remove tab" : "Pin as tab"}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                flexShrink: 0,
                cursor: "pointer",
                background: isCurrentPassagePinned ? "rgba(203,178,124,0.15)" : "rgba(255,255,255,0.06)",
                border: isCurrentPassagePinned ? "1px solid rgba(203,178,124,0.35)" : "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg viewBox="0 0 24 24" width="15" height="15"
                fill={isCurrentPassagePinned ? navAccent : "none"}
                stroke={isCurrentPassagePinned ? navAccent : navMuted}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>

            {/* Pencil pill — sermon notes scratchpad, pushed to far right */}
            <button
              className="nav-item-btn"
              onClick={() => setQuickNoteOpen(true)}
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: scratchpadHasDraft
                  ? "rgba(var(--accent-rgb),0.18)"
                  : "rgba(255,255,255,0.06)",
                border: scratchpadHasDraft
                  ? "1px solid rgba(var(--accent-rgb),0.45)"
                  : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "8px 12px",
                cursor: "pointer",
                flexShrink: 0,
                position: "relative",
              }}
              aria-label="Sermon notes"
            >
              {scratchpadHasDraft && (
                <span style={{
                  position: "absolute", top: 5, right: 5,
                  width: 5, height: 5, borderRadius: "50%",
                  background: "var(--text-accent)",
                }} />
              )}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={navAccent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: scratchpadHasDraft ? "var(--text-accent)" : navPrimary,
                fontFamily: "var(--font-ui)",
              }}>
                Notes
              </span>
            </button>
            </div>{/* end row 1 */}

            {/* Passage tab strip — row 2 */}
            {passageTabs.length > 0 && (
              <div style={{
                display: "flex",
                gap: 5,
                overflowX: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                minWidth: 0,
                marginTop: 6,
                paddingTop: 6,
                borderTop: "1px solid rgba(255,255,255,0.07)",
              }}>
                {passageTabs.map((tab) => {
                  const isActive =
                    tab.bookId === currentBookId &&
                    tab.chapter === readingContext.chapter;
                  const label = `${BOOK_ABBREV[tab.bookId] || tab.displayName.slice(0, 3)} ${tab.chapter}`;
                  return (
                    <div key={tab.id} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      background: isActive ? "rgba(203,178,124,0.18)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${isActive ? "rgba(203,178,124,0.4)" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: 8,
                      padding: "4px 6px 4px 9px",
                      flexShrink: 0,
                    }}>
                      <button
                        onClick={() => handleNavigate(tab.bookId, tab.chapter)}
                        style={{
                          background: "none", border: "none", cursor: "pointer", padding: 0,
                          fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
                          color: isActive ? "var(--text-accent)" : navPrimary,
                          fontFamily: "var(--font-ui)", whiteSpace: "nowrap",
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        {label}
                      </button>
                      <button
                        onClick={() => closePassageTab(tab.id)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          padding: "0 2px", color: navMuted, fontSize: 10, lineHeight: 1,
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
                {passageTabs.length > 1 && (
                  <button
                    onClick={() => { setPassageTabs([]); localStorage.removeItem("passageTabs"); }}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 10, color: navMuted, opacity: 0.45, padding: "4px 8px",
                      flexShrink: 0, fontFamily: "var(--font-ui)",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    clear all
                  </button>
                )}
              </div>
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
      {activeScreen === "abide-dictionary" && (
        <AbideDictionary onBack={() => setActiveScreen("scripture")} />
      )}
      {activeScreen === "devotionals" && (
        <DevotionalScreen
          onBack={() => setActiveScreen("scripture")}
          theme={theme}
        />
      )}
      {activeScreen === "daily-abiding" && (
        <DailyAbidingScreen onBack={() => setActiveScreen("scripture")} translation={translation} />
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
      {((activeScreen === "scripture" && (uiMode === "reading" || uiMode === "highlighting") && !reflectionOpen) ||
        activeScreen === "home") && (
          <nav
            style={{
              position: "fixed",
              bottom: "calc(env(safe-area-inset-bottom) + 2px)",
              left: 24,
              right: 24,
              zIndex: 40,
              background: "rgba(15,12,8,0.92)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.06) inset",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              paddingTop: 10,
              paddingLeft: 8,
              paddingRight: 8,
              paddingBottom: 10,
              transform: (activeScreen === "home" || navVisible) ? "translateY(0)" : "translateY(140%)",
              opacity: (activeScreen === "home" || navVisible) ? 1 : 0,
              transition:
                "transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease",
            }}
          >
            {/* Home */}
            <button
              className="nav-item-btn"
              onClick={() => setActiveScreen("home")}
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
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ color: activeScreen === "home" ? navAccent : navInactive }}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                {activeScreen === "home" && (
                  <span style={{
                    position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)",
                    width: 4, height: 4, borderRadius: "50%", background: navAccent,
                  }} />
                )}
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: activeScreen === "home" ? navAccent : navInactive,
                letterSpacing: "0.04em", fontFamily: "var(--font-ui)",
              }}>
                Home
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
                  color={isScriptureActive ? navAccent : navInactive}
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
                      background: navAccent,
                    }}
                  />
                )}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  fontFamily: "var(--font-ui)",
                  color: isScriptureActive ? navAccent : navInactive,
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
              <div style={{ color: navInactive }}>
                <SearchIcon />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: navInactive,
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
              <div style={{ color: navInactive }}>
                <SettingsIcon />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: navInactive,
                  letterSpacing: "0.04em",
                  fontFamily: "var(--font-ui)",
                }}
              >
                Settings
              </span>
            </button>
          </nav>
        )}

      {/* ── Scripture Scratchpad — full RichTextJournal overlay ── */}
      {quickNoteOpen && (
        <RichTextJournal
          scratchpadMode
          translation={translation}
          onSave={handleScratchpadSave}
          onMinimize={() => setQuickNoteOpen(false)}
          onDraftChange={setScratchpadHasDraft}
        />
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

      {activeScreen === "home" && (
        <HomeScreen
          theme={theme}
          translation={translation}
          onNavigate={(id, ctx) => {
            if (id === "dialogue") setActiveScreen("dialogue");
            else if (id === "devotionals") setActiveScreen("devotionals");
            else if (id === "daily-abiding") setActiveScreen("daily-abiding");
            else if (id === "abide-dictionary") setActiveScreen("abide-dictionary");
            else if (id === "christ-revealed") handleChristRevealedEntry();
            else if (id === "scripture") {
              if (ctx?.book) {
                const displayName = getBookDisplayName(ctx.book);
                setCurrentBookId(ctx.book);
                setReadingContext({ book: displayName, chapter: ctx.chapter });
                setNavigationTarget({ book: ctx.book, chapter: ctx.chapter });
              }
              setActiveScreen("scripture");
            }
          }}
        />
      )}

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
