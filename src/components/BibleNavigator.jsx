/**
 * BibleNavigator.jsx - PREMIUM REDESIGN
 * Buttery smooth animations with proper timing and sequencing
 */

import { useState, useRef, useEffect } from "react";

/* ===============================
   Complete Bible Structure
================================ */
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

/* ===============================
   Main Component
================================ */
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
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open) {
      setView("books");
      setSelectedBook(null);
      setSearchQuery("");
      setIsAnimatingOut(false);
      // Delay visibility for smooth entrance
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
    }
  }, [open]);

  // Smooth close
  function handleClose() {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  }

  // Smooth book selection
  function handleBookClick(book) {
    setSelectedBook(book);
    setTimeout(() => {
      setView("chapters");
    }, 100);
  }

  // Smooth chapter selection - start navigation early
  function handleChapterClick(chapter) {
    setIsAnimatingOut(true);
    // Trigger navigation immediately for responsiveness
    setTimeout(() => {
      onNavigate(selectedBook.id, chapter);
    }, 100);
    // Complete close animation
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  }

  if (!open && !isVisible) return null;

  const filteredStructure = searchQuery
    ? BIBLE_STRUCTURE.map((section) => ({
        ...section,
        books: section.books.filter((book) =>
          book.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      })).filter((section) => section.books.length > 0)
    : BIBLE_STRUCTURE;

  function handleBackToBooks() {
    setView("books");
    setSelectedBook(null);
  }

  /* ===============================
     Shared Styles
  ================================ */
  const sharedStyles = (
    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes slideUp {
        0% { 
          opacity: 0;
          transform: translateY(40px) scale(0.94);
        }
        100% { 
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @keyframes slideDown {
        0% { 
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        100% { 
          opacity: 0;
          transform: translateY(30px) scale(0.94);
        }
      }
      @keyframes shimmer {
        0%, 100% { opacity: 0.05; }
        50% { opacity: 0.15; }
      }
      .book-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .book-card:hover {
        transform: translateX(8px);
        background: rgba(var(--accent-rgb), 0.15) !important;
      }
      .book-card:active {
        transform: scale(0.98) translateX(8px);
      }
      .chapter-btn {
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .chapter-btn:hover {
        transform: scale(1.08);
      }
      .chapter-btn:active {
        transform: scale(0.95);
      }
      .navigator-backdrop {
        will-change: opacity;
      }
      .navigator-modal {
        will-change: transform, opacity;
      }
    `}</style>
  );

  /* ===============================
     Books View
  ================================ */
  if (view === "books") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center navigator-backdrop"
        style={{
          background: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(20px)",
          animation: isAnimatingOut
            ? "fadeOut 0.3s ease-out forwards"
            : "fadeIn 0.35s ease-out",
        }}
        onClick={handleClose}
      >
        {sharedStyles}

        <div
          className="relative w-[95%] max-w-[520px] h-[90vh] flex flex-col overflow-hidden navigator-modal"
          style={{
            background: "var(--bg-menu)",
            borderRadius: "28px",
            boxShadow: "0 40px 100px rgba(0, 0, 0, 0.8)",
            animation: isAnimatingOut
              ? "slideDown 0.3s cubic-bezier(0.5, 0, 1, 1) forwards"
              : "slideUp 0.45s cubic-bezier(0.34, 1.2, 0.64, 1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative gradient */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "200px",
              background: `linear-gradient(180deg, var(--text-accent) 0%, transparent 100%)`,
              opacity: 0.08,
              pointerEvents: "none",
              animation: "shimmer 4s ease-in-out infinite",
            }}
          />

          {/* Header */}
          <div
            className="relative px-8 pt-8 pb-6"
            style={{
              borderBottom: "1px solid rgba(var(--accent-rgb), 0.15)",
            }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1
                  className="text-4xl font-bold mb-1"
                  style={{
                    color: "var(--text-accent)",
                    letterSpacing: "-0.02em",
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  Holy Bible
                </h1>
                <p
                  className="text-sm opacity-60"
                  style={{ color: "var(--text-primary)" }}
                >
                  66 Books · Old & New Testament
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full transition-all"
                style={{
                  color: "var(--text-accent)",
                  background: "rgba(var(--accent-rgb), 0.1)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(var(--accent-rgb), 0.2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(var(--accent-rgb), 0.1)")
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-accent)",
                  opacity: 0.4,
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(var(--accent-rgb), 0.2)",
                  borderRadius: "16px",
                  padding: "14px 20px 14px 48px",
                  color: "var(--text-primary)",
                  fontSize: "15px",
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--text-accent)";
                  e.target.style.background = "rgba(0, 0, 0, 0.4)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(var(--accent-rgb), 0.2)";
                  e.target.style.background = "rgba(0, 0, 0, 0.3)";
                }}
              />
            </div>
          </div>

          {/* Scrollable Book List */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            {filteredStructure.map((section, idx) => (
              <div key={idx}>
                {/* Section Header - Complete coverage, no slivers */}
                <div
                  className="sticky"
                  style={{
                    top: "-4px",
                    paddingLeft: "2rem",
                    paddingRight: "2rem",
                    paddingTop: "1.5rem",
                    paddingBottom: "1.25rem",
                    marginBottom: "-4px",
                    background: "var(--bg-menu)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(var(--accent-rgb), 0.1)",
                    zIndex: 20,
                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.7)",
                  }}
                >
                  <h2
                    className="text-sm font-bold tracking-wider mb-1"
                    style={{
                      color: "var(--text-accent)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {section.section}
                  </h2>
                  <p
                    className="text-xs opacity-50"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {section.subtitle}
                  </p>
                </div>

                {/* Books */}
                <div className="px-8 py-6 space-y-2">
                  {section.books.map((book) => {
                    const isCurrent = book.id === currentBook?.toLowerCase();

                    return (
                      <button
                        key={book.id}
                        onClick={() => handleBookClick(book)}
                        className="book-card w-full text-left rounded-2xl p-5"
                        style={{
                          background: isCurrent
                            ? "rgba(var(--accent-rgb), 0.15)"
                            : "rgba(0, 0, 0, 0.25)",
                          border: isCurrent
                            ? "1px solid var(--text-accent)"
                            : "1px solid rgba(var(--accent-rgb), 0.15)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div
                              className="text-lg font-semibold mb-1"
                              style={{
                                color: "var(--text-primary)",
                                letterSpacing: "-0.01em",
                              }}
                            >
                              {book.name}
                            </div>
                            <div
                              className="text-sm opacity-60"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {book.chapters} chapters
                            </div>
                          </div>
                          <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5"
                            style={{
                              color: "var(--text-accent)",
                              opacity: 0.5,
                            }}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     Chapter Grid
  ================================ */
  if (view === "chapters" && selectedBook) {
    const chapters = Array.from(
      { length: selectedBook.chapters },
      (_, i) => i + 1,
    );

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center navigator-backdrop"
        style={{
          background: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(20px)",
          animation: isAnimatingOut
            ? "fadeOut 0.3s ease-out forwards"
            : "fadeIn 0.35s ease-out",
        }}
        onClick={handleClose}
      >
        {sharedStyles}

        <div
          className="relative w-[95%] max-w-[520px] h-[90vh] flex flex-col overflow-hidden navigator-modal"
          style={{
            background: "var(--bg-menu)",
            borderRadius: "28px",
            boxShadow: "0 40px 100px rgba(0, 0, 0, 0.8)",
            animation: isAnimatingOut
              ? "slideDown 0.3s cubic-bezier(0.5, 0, 1, 1) forwards"
              : "slideUp 0.45s cubic-bezier(0.34, 1.2, 0.64, 1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative gradient */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "200px",
              background: `linear-gradient(180deg, var(--text-accent) 0%, transparent 100%)`,
              opacity: 0.08,
              pointerEvents: "none",
            }}
          />

          {/* Header */}
          <div
            className="relative px-8 pt-8 pb-6"
            style={{
              borderBottom: "1px solid rgba(var(--accent-rgb), 0.15)",
            }}
          >
            <button
              onClick={handleBackToBooks}
              className="mb-4 flex items-center gap-2 text-sm font-medium transition-all"
              style={{ color: "var(--text-accent)" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              All Books
            </button>

            <h1
              className="text-4xl font-bold mb-1"
              style={{
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              {selectedBook.name}
            </h1>
            <p
              className="text-sm opacity-60"
              style={{ color: "var(--text-primary)" }}
            >
              Select a chapter to begin reading
            </p>
          </div>

          {/* Chapter Grid */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))",
                gap: "12px",
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
                    className="chapter-btn"
                    style={{
                      aspectRatio: "1",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: "600",
                      background: isCurrent
                        ? "var(--text-accent)"
                        : "rgba(0, 0, 0, 0.3)",
                      color: isCurrent ? "#000" : "var(--text-primary)",
                      border: isCurrent
                        ? "none"
                        : "1px solid rgba(var(--accent-rgb), 0.2)",
                      boxShadow: isCurrent
                        ? "0 8px 24px rgba(var(--accent-rgb), 0.4)"
                        : "none",
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
