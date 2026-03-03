/**
 * BibleNavigator.jsx — PREMIUM REDESIGN
 * Sacred, luminous, manuscript-inspired navigation
 * All logic preserved — only the design elevated
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

/* ── Section accent colors — subtle gold variants ─────── */
const SECTION_GLYPHS = ["✦", "◈", "◇", "⊕", "✧", "✦", "◈", "◇", "✧"];

export default function BibleNavigator({
  open,
  onClose,
  onNavigate,
  currentBook,
  currentChapter,
}) {
  const [view, setView] = useState("books");
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const scrollRef = useRef(null);

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

  if (!open && !isVisible) return null;

  const filteredStructure = searchQuery
    ? BIBLE_STRUCTURE.map((s) => ({
        ...s,
        books: s.books.filter((b) =>
          b.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      })).filter((s) => s.books.length > 0)
    : BIBLE_STRUCTURE;

  /* ── Shared keyframes ───────────────────────────────── */
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

      /* Book row */
      .bn-book {
        transition: background 0.16s ease, transform 0.14s ease, border-color 0.16s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .bn-book:active { transform: scale(0.985) }
      .bn-book-available:hover {
        background: rgba(var(--accent-rgb,203,178,124), 0.13) !important;
        border-color: rgba(var(--accent-rgb,203,178,124), 0.3) !important;
      }

      /* Chapter button */
      .bn-ch {
        transition: background 0.15s ease, transform 0.13s ease, box-shadow 0.15s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .bn-ch:hover { transform: scale(1.07) }
      .bn-ch:active { transform: scale(0.93) }

      /* Search input placeholder */
      .bn-search::placeholder { color: rgba(var(--accent-rgb,203,178,124),0.3) }
      .bn-search:focus { outline: none }

      /* Scrollbar hide */
      .bn-scroll::-webkit-scrollbar { display:none }
      .bn-scroll { -ms-overflow-style:none; scrollbar-width:none }

      /* Section sticky header */
      .bn-sticky {
        position: sticky;
        top: 0;
        z-index: 20;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
    `}</style>
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
        >
          {/* Top ambient glow */}
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

          {/* ── Header ──────────────────────────────────────── */}
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
                {/* Eyebrow */}
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

              {/* Close */}
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

            {/* Search */}
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

          {/* ── Book list ───────────────────────────────────── */}
          <div
            ref={scrollRef}
            className="bn-scroll"
            style={{ flex: 1, overflowY: "auto" }}
          >
            {filteredStructure.map((section, idx) => (
              <div key={idx}>
                {/* Sticky section header */}
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

                {/* Books */}
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
                        {/* Chapter count pill */}
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

                        {/* Book name */}
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

                        {/* Arrow */}
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

            {/* Bottom padding */}
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
        >
          {/* Ambient top glow */}
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

          {/* ── Header ──────────────────────────────────────── */}
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
            {/* Back button */}
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

            {/* Title */}
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

          {/* ── Chapter grid ───────────────────────────────── */}
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

  return null;
}
