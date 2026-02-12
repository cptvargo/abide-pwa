import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CoreReading from "./SwipeReading";
import VSVInfo from "./components/VSVInfo";
import RichTextJournal from "./RichTextJournal";
import BibleNavigator from "./components/BibleNavigator";
import PremiumMenu from "./components/PremiumMenu";

/* ===============================
   Greeting Logic
================================ */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning, Beloved";
  if (hour < 18) return "Good afternoon, Beloved";
  return "Good evening, Beloved";
}

/* ===============================
   Icons
================================ */
function BibleIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z" />
      <path d="M17 4h3v16h-3" />
      <path d="M9 8h4" />
      <path d="M11 6v4" />
    </svg>
  );
}

function NotesIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15V5a2 2 0 0 0-2-2H9" />
      <path d="M7 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
      <path d="M17 8H7" />
      <path d="M17 12H7" />
      <path d="M17 16H7" />
    </svg>
  );
}

function SettingsIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06
        a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09
        a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06
        a2 2 0 0 1-2.83-2.83l.06-.06 A1.65 1.65 0 0 0 4.6 15
        a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
        a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06
        a2 2 0 0 1 2.83-2.83l.06.06 A1.65 1.65 0 0 0 9 4.6
        a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09
        a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06
        a2 2 0 0 1 2.83 2.83l-.06.06 A1.65 1.65 0 0 0 19.4 9
        a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09
        a1.65 1.65 0 0 0-1.51 1z"
      />
    </svg>
  );
}

export default function AppShell() {
  const navigate = useNavigate();

  /* ===============================
     App State
  ================================ */
  const [activeScreen, setActiveScreen] = useState("scripture");

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsView, setSettingsView] = useState("main");

  const [navigatorOpen, setNavigatorOpen] = useState(false);

  const [navProgress, setNavProgress] = useState(0);

  const [journalOpen, setJournalOpen] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [journalEntries, setJournalEntries] = useState(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem("journalEntries");
    return saved ? JSON.parse(saved) : [];
  });
  const [viewingEntry, setViewingEntry] = useState(null);

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
    () => localStorage.getItem("translation") || "VSV",
  );

  // Reading context supplied by CoreReading
  const [readingContext, setReadingContext] = useState(() => {
    const saved = localStorage.getItem("lastReadingPosition");
    return saved ? JSON.parse(saved) : { book: "Genesis", chapter: 1 };
  });

  // Navigation target (for jumping to specific book/chapter)
  const [navigationTarget, setNavigationTarget] = useState(null);

  // Theme definitions
  const themes = [
    { id: "classic", name: "Classic", description: "Traditional Scripture" },
    {
      id: "still-waters",
      name: "Still Waters",
      description: "Calm & Reflective",
    },
    { id: "stone-fire", name: "Stone & Fire", description: "Bold & Prophetic" },
    {
      id: "olive-parchment",
      name: "Olive & Parchment",
      description: "Ancient Manuscript",
    },
    { id: "parchment", name: "Parchment", description: "Classic Book Style" },
  ];

  /* ===============================
     Effects
  ================================ */
  useEffect(() => {
    console.log("Theme changed to:", theme);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Update PWA status bar color based on theme (for Android/iOS)
    const themeColors = {
      classic: "#cbb27c", // Gold
      "still-waters": "#1f6f78", // Teal
      "stone-fire": "#f97316", // Orange
      "olive-parchment": "#9d8f6f", // Olive
      parchment: "#8b7355", // Brown leather
    };

    const statusBarColor = themeColors[theme] || "#cbb27c";

    // Update theme-color meta tag for Android status bar
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = statusBarColor;

    // Force a small delay to ensure CSS updates
    setTimeout(() => {
      const bgNav = getComputedStyle(document.documentElement).getPropertyValue(
        "--bg-nav",
      );
      console.log("New --bg-nav value:", bgNav);
      console.log("Status bar color set to:", statusBarColor);
    }, 100);
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
    localStorage.setItem("lastReadingPosition", JSON.stringify(readingContext));
  }, [readingContext]);

  useEffect(() => {
    // Save journal entries to localStorage whenever they change
    localStorage.setItem("journalEntries", JSON.stringify(journalEntries));
  }, [journalEntries]);

  /* ===============================
     Journal Helpers
  ================================ */
  function groupEntriesByMonth(entries) {
    return entries.reduce((groups, entry) => {
      const key = new Date(entry.createdAt).toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
      return groups;
    }, {});
  }

  function deleteJournalEntry(id) {
    setJournalEntries((prev) => prev.filter((e) => e.id !== id));
  }

  /* ===============================
     Navigation Handler
  ================================ */
  function handleNavigate(book, chapter) {
    setNavigationTarget({ book, chapter });
    setNavigatorOpen(false);
  }

  /* ===============================
     Render
  ================================ */
  return (
    <div
      className="
    no-select flex flex-col h-screen relative
    bg-[var(--bg-app)]
    text-[var(--text-primary)]
    font-[var(--font-ui)]
  "
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {activeScreen === "scripture" && (
        <CoreReading
          hideVerseNumbers={chapterlessMode}
          chapterlessMode={chapterlessMode}
          textSize={textSize}
          translation={translation}
          theme={theme}
          onReadingContext={setReadingContext}
          onScrollProgress={setNavProgress}
          navigationTarget={navigationTarget}
          onNavigationComplete={() => setNavigationTarget(null)}
        />
      )}

      {/* ===============================
         Journal Index Screen
      ================================ */}
      {activeScreen === "journalIndex" && !viewingEntry && (
        <div className="flex-1 overflow-y-auto p-6">
          <button
            className="flex items-center gap-2 text-[var(--text-accent)] text-sm tracking-wide mb-6"
            onClick={() => setActiveScreen("scripture")}
          >
            ← Scripture
          </button>

          <h1 className="text-xl text-[var(--text-accent)] tracking-wide mb-6">
            ABIDE Journal
          </h1>

          {journalEntries.length === 0 ? (
            <p className="opacity-60 text-sm">No journal entries yet.</p>
          ) : (
            Object.entries(groupEntriesByMonth(journalEntries)).map(
              ([month, entries]) => (
                <div key={month} className="space-y-4 mb-8">
                  <h2 className="text-sm uppercase tracking-wide text-[var(--text-accent)]/70">
                    {month}
                  </h2>

                  {entries.map((entry, idx) => {
                    // Calculate entry number (reverse chronological)
                    const entryIndex = journalEntries.findIndex(
                      (e) => e.id === entry.id,
                    );
                    const entryNumber = journalEntries.length - entryIndex;
                    const previewText = entry.text?.substring(0, 150) || "";
                    const hasMore = entry.text?.length > 150;

                    return (
                      <div
                        key={entry.id}
                        className="relative border-b pb-3"
                        style={{
                          borderColor: "rgba(var(--accent-rgb), 0.2)",
                        }}
                      >
                        {/* Header with number and date */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            {/* Entry Number Badge */}
                            <div
                              style={{
                                background: "var(--text-accent)",
                                color:
                                  theme === "parchment" ? "#2C2416" : "#1C1C1A",
                                borderRadius: "8px",
                                padding: "0.25rem 0.625rem",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                letterSpacing: "0.05em",
                              }}
                            >
                              #{entryNumber}
                            </div>

                            {/* Date */}
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-accent)",
                                opacity: 0.7,
                              }}
                            >
                              {new Date(entry.createdAt).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                },
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {/* Export PDF Button - FIXED WITH CLOSE BUTTON */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Export as PDF with close button
                                const themeColors = {
                                  classic: {
                                    primary: "#CBB27C",
                                    bg: "#1C1C1A",
                                    text: "#E8E6E3",
                                  },
                                  "still-waters": {
                                    primary: "#1F6F78",
                                    bg: "#0F1419",
                                    text: "#E8E6E3",
                                  },
                                  "stone-fire": {
                                    primary: "#F97316",
                                    bg: "#1C1917",
                                    text: "#E8E6E3",
                                  },
                                  "olive-parchment": {
                                    primary: "#9D8F6F",
                                    bg: "#1A1814",
                                    text: "#E8E6E3",
                                  },
                                  parchment: {
                                    primary: "#8B7355",
                                    bg: "#F5F1EA",
                                    text: "#2C2416",
                                  },
                                };
                                const colors =
                                  themeColors[theme] || themeColors.classic;
                                const date = new Date(
                                  entry.createdAt,
                                ).toLocaleString("en-US", {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                });

                                const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: letter; margin: 1in; }
    @media print {
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: ${colors.bg};
      color: ${colors.text};
      line-height: 1.8;
      padding: 40px;
      max-width: 8.5in;
      margin: 0 auto;
    }
    .close-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors.primary};
      color: ${colors.bg};
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
    }
    .close-button:hover {
      opacity: 0.9;
    }
    .print-button {
      position: fixed;
      top: 20px;
      left: 20px;
      background: ${colors.primary};
      color: ${colors.bg};
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
    }
    .print-button:hover {
      opacity: 0.9;
    }
    .header {
      border-bottom: 2px solid ${colors.primary};
      padding-bottom: 20px;
      margin-bottom: 30px;
      margin-top: 60px;
    }
    .title {
      font-size: 28px;
      font-weight: 700;
      color: ${colors.primary};
      margin-bottom: 10px;
    }
    .date { font-size: 14px; opacity: 0.7; font-style: italic; }
    .content { font-size: 16px; line-height: 1.8; }
    .content p { margin-bottom: 1em; }
    .content strong { font-weight: 700; color: ${colors.primary}; }
    .content em { font-style: italic; }
    .content ul, .content ol { margin-left: 20px; margin-bottom: 1em; }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid ${colors.primary}40;
      text-align: center;
      font-size: 12px;
      opacity: 0.6;
    }
  </style>
</head>
<body>
  <button class="close-button no-print" onclick="window.close()">✕ Close</button>
  <button class="print-button no-print" onclick="window.print()">🖨️ Print / Save PDF</button>
  <div class="header">
    <div class="title">ABIDE Journal Entry #${entryNumber}</div>
    <div class="date">${date}</div>
  </div>
  <div class="content">${entry.html || entry.text}</div>
  <div class="footer">Created with ABIDE — Abide in God's Word</div>
</body>
</html>`;

                                const printWindow = window.open("", "_blank");
                                if (printWindow) {
                                  printWindow.document.write(htmlContent);
                                  printWindow.document.close();
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-[var(--text-accent)]/10 transition"
                              style={{ color: "var(--text-accent)" }}
                              title="Export as PDF"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Preview */}
                        <button
                          onClick={() => setViewingEntry(entry)}
                          className="w-full text-left rounded-lg p-3 hover:bg-[var(--text-primary)]/5 transition"
                        >
                          <div
                            className="text-sm text-[var(--text-primary)] line-clamp-3"
                            dangerouslySetInnerHTML={{
                              __html: previewText + (hasMore ? "…" : ""),
                            }}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ),
            )
          )}
        </div>
      )}

      {/* ===============================
         Journal Detail View
      ================================ */}
      {activeScreen === "journalIndex" && viewingEntry && (
        <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 bg-[var(--bg-app)] border-b border-[var(--text-accent)]/20 p-6 flex justify-between items-center z-10">
            <button
              className="flex items-center gap-2 text-[var(--text-accent)] text-sm"
              onClick={() => setViewingEntry(null)}
            >
              ← Back
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setJournalText(viewingEntry.html || viewingEntry.text || "");
                  setJournalOpen(true);
                  deleteJournalEntry(viewingEntry.id);
                  setViewingEntry(null);
                }}
                className="text-xs text-[var(--text-accent)] opacity-70 hover:opacity-100"
              >
                Edit
              </button>

              <button
                onClick={() => {
                  if (confirm("Delete this entry?")) {
                    deleteJournalEntry(viewingEntry.id);
                    setViewingEntry(null);
                  }
                }}
                className="text-xs text-red-400 opacity-70 hover:opacity-100"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="text-xs text-[var(--text-accent)]/70 mb-6">
              {new Date(viewingEntry.createdAt).toLocaleString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>

            <div
              className="prose prose-lg max-w-none text-[var(--text-primary)]"
              dangerouslySetInnerHTML={{
                __html: viewingEntry.html || viewingEntry.text,
              }}
            />
          </div>
        </div>
      )}

      {/* ===============================
         Floating Nav
      ================================ */}
      {activeScreen === "scripture" && (
        <nav
          style={{
            transform: `translateX(-50%) translateY(${navProgress * 60}px)`,
            opacity: 1 - navProgress,
            background: "var(--bg-nav)",
          }}
          className="fixed bottom-6 left-1/2 px-5 py-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-1 whitespace-nowrap transition-transform transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          {/* Menu Button */}
          <button
            onClick={() => {
              setMenuVisible(true);
              requestAnimationFrame(() => setMenuOpen(true));
            }}
            className="px-3 py-1 text-[var(--text-inverse)] font-bold text-base hover:scale-105 transition-transform"
          >
            ☰
          </button>

          {/* Separator 1 */}
          <div
            style={{
              width: "2px",
              height: "24px",
              backgroundColor: "var(--text-inverse)",
              opacity: 0.25,
              borderRadius: "9999px",
              margin: "0 4px",
            }}
          />

          {/* Book & Chapter - CLICKABLE */}
          <button
            onClick={() => setNavigatorOpen(true)}
            className="px-3 py-1 flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <BibleIcon className="w-5 h-5 text-[var(--text-inverse)] stroke-[2.5]" />
            <span className="text-[var(--text-inverse)] font-bold tracking-wide text-base capitalize">
              {readingContext.book} {readingContext.chapter}
            </span>
          </button>

          {/* Separator 2 */}
          <div
            style={{
              width: "2px",
              height: "24px",
              backgroundColor: "var(--text-inverse)",
              opacity: 0.25,
              borderRadius: "9999px",
              margin: "0 4px",
            }}
          />

          {/* Journal Button */}
          <button
            onClick={() => setJournalOpen(true)}
            className="px-3 py-1 hover:scale-105 transition-transform"
            aria-label="Journal"
          >
            <NotesIcon className="w-5 h-5 text-[var(--text-inverse)] stroke-[2.5]" />
          </button>
        </nav>
      )}

      {/* ===============================
         Premium Menu
      ================================ */}
      <PremiumMenu
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          setMenuVisible(false);
        }}
        onNavigate={(id) => {
          if (id === "journal") {
            setActiveScreen("journalIndex");
          } else if (id === "highlights") {
            setActiveScreen("highlights");
          } else if (id === "grow") {
            navigate("/grow");
          } else if (id === "settings") {
            setSettingsOpen(true);
          }
          setMenuOpen(false);
          setMenuVisible(false);
        }}
        theme={theme}
      />

      {/* ===============================
         Bible Navigator Modal
      ================================ */}
      <BibleNavigator
        open={navigatorOpen}
        onClose={() => setNavigatorOpen(false)}
        onNavigate={handleNavigate}
        currentBook={readingContext.book}
        currentChapter={readingContext.chapter}
      />

      {/* ===============================
         Settings Modal
      ================================ */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSettingsOpen(false);
              setSettingsView("main");
            }
          }}
        >
          <div className="bg-[var(--bg-menu)] rounded-3xl w-[94%] max-w-[460px] max-h-[85vh] overflow-y-auto">
            <div className="p-6 text-[var(--text-primary)]">
              {settingsView === "main" && (
                <>
                  <h2 className="text-2xl mb-6">Settings</h2>

                  <button
                    onClick={() => setSettingsView("translation")}
                    className="w-full mb-4 bg-black/30 rounded-xl px-4 py-4 flex items-center justify-between hover:bg-black/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <BibleIcon className="w-5 h-5 text-[var(--text-accent)]" />
                      <div className="text-left">
                        <div className="font-semibold">Translation</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-80">
                      <span>{translation}</span>
                      <span className="opacity-60">→</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSettingsView("appearance")}
                    className="w-full mb-4 bg-black/30 rounded-xl px-4 py-4 flex items-center justify-between hover:bg-black/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-[var(--text-accent)]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="8" cy="10" r="1.5" fill="currentColor" />
                        <circle cx="16" cy="10" r="1.5" fill="currentColor" />
                        <circle cx="8" cy="16" r="1.5" fill="currentColor" />
                        <circle cx="16" cy="16" r="1.5" fill="currentColor" />
                        <circle cx="12" cy="13" r="1.5" fill="currentColor" />
                      </svg>
                      <div className="text-left">
                        <div className="font-semibold">Appearance</div>
                      </div>
                    </div>
                    <span className="opacity-60">→</span>
                  </button>

                  <button
                    onClick={() => setSettingsView("textSize")}
                    className="w-full mb-4 bg-black/30 rounded-xl px-4 py-4 flex items-center justify-between hover:bg-black/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-[var(--text-accent)]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                      <div className="text-left">
                        <div className="font-semibold">Bible Text Size</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-80">
                      <span>{textSize.toFixed(1)}x</span>
                      <span className="opacity-60">→</span>
                    </div>
                  </button>

                  <div className="bg-black/30 rounded-xl px-4 py-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-[var(--text-accent)]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                        <div className="text-left">
                          <div className="font-semibold">Chapterless Mode</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setChapterlessMode((v) => !v)}
                        className="relative w-10 h-6 rounded-full transition"
                        style={{
                          backgroundColor: chapterlessMode
                            ? "var(--text-accent)"
                            : "rgba(0,0,0,0.4)",
                        }}
                      >
                        <div
                          className="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform"
                          style={{
                            transform: chapterlessMode
                              ? "translateX(20px)"
                              : "translateX(4px)",
                          }}
                        />
                      </button>
                    </div>
                    <div className="text-xs opacity-70 pl-8">
                      Hides chapter titles and verse numbers
                    </div>
                  </div>

                  <div className="text-center opacity-60 text-sm mt-6">
                    Made with ♥ by{" "}
                    <span className="text-[var(--text-accent)]">
                      Jesus Vargas
                    </span>
                    <div className="mt-1">Version 2.3.0</div>
                  </div>
                </>
              )}

              {settingsView === "appearance" && (
                <>
                  <button
                    className="flex items-center gap-3 mb-8 text-[var(--text-accent)]"
                    onClick={() => setSettingsView("main")}
                  >
                    <span className="text-3xl">←</span>
                    <span className="text-3xl font-semibold">Appearance</span>
                  </button>

                  <div className="text-sm opacity-70 mb-4">Choose Theme</div>

                  <div className="space-y-3">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className="w-full bg-black/30 rounded-xl px-4 py-4 flex items-center justify-between hover:bg-black/40 transition"
                      >
                        <div className="text-left">
                          <div className="font-semibold">{t.name}</div>
                          <div className="text-xs opacity-70">
                            {t.description}
                          </div>
                        </div>

                        <div
                          className="relative w-10 h-6 rounded-full transition"
                          style={{
                            backgroundColor:
                              theme === t.id
                                ? "var(--text-accent)"
                                : "rgba(0,0,0,0.4)",
                          }}
                        >
                          <div
                            className="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform"
                            style={{
                              transform:
                                theme === t.id
                                  ? "translateX(20px)"
                                  : "translateX(4px)",
                            }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {settingsView === "textSize" && (
                <>
                  <button
                    className="flex items-center gap-3 mb-8 text-[var(--text-accent)]"
                    onClick={() => setSettingsView("main")}
                  >
                    <span className="text-3xl">←</span>
                    <span className="text-3xl font-semibold">
                      Bible Text Size
                    </span>
                  </button>

                  <div className="bg-black/20 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() =>
                          setTextSize(Math.max(0.8, textSize - 0.1))
                        }
                        disabled={textSize <= 0.8}
                        className="w-12 h-12 rounded-xl bg-black/30 hover:bg-black/40 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-2xl font-bold"
                      >
                        −
                      </button>

                      <div className="text-3xl font-bold">
                        {textSize.toFixed(1)}x
                      </div>

                      <button
                        onClick={() =>
                          setTextSize(Math.min(2.0, textSize + 0.1))
                        }
                        disabled={textSize >= 2.0}
                        className="w-12 h-12 rounded-xl bg-black/30 hover:bg-black/40 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-2xl font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-sm opacity-70 mb-3">Preview</div>
                  <div
                    className="bg-black/20 rounded-2xl p-4 leading-relaxed"
                    style={{ fontSize: `${textSize}rem` }}
                  >
                    <span className="opacity-60">1 </span>
                    In the beginning God created the heavens and the earth.{" "}
                    <span className="opacity-60">2 </span>
                    And the earth was without form and empty, and darkness lay
                    over the face of the deep. And the Spirit of God hovered
                    over the waters.
                  </div>
                </>
              )}

              {settingsView === "translation" && (
                <>
                  <button
                    className="flex items-center gap-3 mb-8 text-[var(--text-accent)]"
                    onClick={() => setSettingsView("main")}
                  >
                    <span className="text-3xl">←</span>
                    <span className="text-3xl font-semibold">Translations</span>
                  </button>

                  <div className="text-xs text-[var(--text-primary)]/70 mb-5">
                    Choose Translation
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        id: "VSV",
                        label: "Vine Standard Version",
                        why: "Faithful, readable, ABIDE's core translation",
                      },
                      {
                        id: "AKT",
                        label: "Abide Kids Translation",
                        why: "Clear, accessible language for young readers",
                      },
                      {
                        id: "KJV",
                        label: "King James Version",
                        why: "Historic English translation (1769)",
                      },
                      {
                        id: "ASR",
                        label: "Abide Source Reading",
                        why: "Source-oriented reading for deeper understanding",
                      },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTranslation(t.id)}
                        className="w-full bg-black/30 rounded-xl px-4 py-4 flex items-center justify-between hover:bg-black/40 transition"
                      >
                        <div className="text-left">
                          <div className="font-semibold">{t.label}</div>
                          <div className="text-xs opacity-70 mt-1">{t.why}</div>
                        </div>

                        <div
                          className="relative w-10 h-6 rounded-full transition"
                          style={{
                            backgroundColor:
                              translation === t.id
                                ? "var(--text-accent)"
                                : "rgba(0,0,0,0.4)",
                          }}
                        >
                          <div
                            className="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform"
                            style={{
                              transform:
                                translation === t.id
                                  ? "translateX(20px)"
                                  : "translateX(4px)",
                            }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {settingsView === "vsv" && (
                <VSVInfo onBack={() => setSettingsView("main")} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===============================
         Journal Editor
      ================================ */}
      {journalOpen && (
        <RichTextJournal
          initialText={journalText}
          onSave={({ html, text }) => {
            if (text.trim()) {
              setJournalEntries((prev) => [
                {
                  id: Date.now().toString(),
                  html: html,
                  text: text,
                  createdAt: new Date().toISOString(),
                },
                ...prev,
              ]);
            }
            setJournalText("");
            setJournalOpen(false);
          }}
          onClose={() => setJournalOpen(false)}
        />
      )}
    </div>
  );
}
