import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CoreReading from "./CoreReading";
import VSVInfo from "./components/VSVInfo";

/* ===============================
   Theme Handling
================================ */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

/* ===============================
   Greeting Logic (GitHub)
================================ */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning, Beloved";
  if (hour < 18) return "Good afternoon, Beloved";
  return "Good evening, Beloved";
}

/* ===============================
   Icons (GitHub)
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

  const [navProgress, setNavProgress] = useState(0);

  const [journalOpen, setJournalOpen] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [journalEntries, setJournalEntries] = useState([]);

  const [hideVerseNumbers, setHideVerseNumbers] = useState(
    () => localStorage.getItem("hideVerseNumbers") === "true",
  );

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "classic",
  );

  // Reading context supplied by CoreReading
  const [readingContext, setReadingContext] = useState({
    book: "Genesis",
    chapter: 1,
  });

  /* ===============================
     Effects
  ================================ */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("hideVerseNumbers", hideVerseNumbers);
  }, [hideVerseNumbers]);

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
    >
      {activeScreen === "scripture" && (
        <CoreReading
          hideVerseNumbers={hideVerseNumbers}
          onReadingContext={setReadingContext}
          onScrollProgress={setNavProgress}
        />
      )}

      {/* ===============================
         Journal Index Screen (RESTORED)
      ================================ */}
      {activeScreen === "journalIndex" && (
        <div className="flex-1 overflow-y-auto p-6">
          <button
            className="flex items-center gap-2 text-[#CBB27C] text-sm tracking-wide mb-6"
            onClick={() => setActiveScreen("scripture")}
          >
            ← Scripture
          </button>

          <h1 className="text-xl text-[#CBB27C] tracking-wide mb-6">
            ABIDE Journal
          </h1>

          {journalEntries.length === 0 ? (
            <p className="opacity-60 text-sm">No journal entries yet.</p>
          ) : (
            Object.entries(groupEntriesByMonth(journalEntries)).map(
              ([month, entries]) => (
                <div key={month} className="space-y-4 mb-8">
                  <h2 className="text-sm uppercase tracking-wide text-[#CBB27C]/70">
                    {month}
                  </h2>

                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="border-b border-[#CBB27C]/20 pb-3 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-[#CBB27C]/70">
                          {new Date(entry.createdAt).toLocaleString()}
                        </div>

                        <button
                          onClick={() => deleteJournalEntry(entry.id)}
                          className="text-xs text-red-400 opacity-70 hover:opacity-100"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="whitespace-pre-wrap text-sm">
                        {entry.text}
                      </div>
                    </div>
                  ))}
                </div>
              ),
            )
          )}
        </div>
      )}

      {/* ===============================
         Floating Nav (GitHub Exact)
      ================================ */}
      <nav
        style={{
          transform: `translateX(-50%) translateY(${navProgress * 60}px)`,
          opacity: 1 - navProgress,
        }}
        className="
    fixed bottom-6 left-1/2
    bg-[var(--bg-nav)]
    px-6 py-2.5
    rounded-full
    shadow-[0_6px_22px_rgba(0,0,0,0.45)]
    flex items-center justify-center
    whitespace-nowrap
    border-[color:var(--text-inverse)/0.25]
    transition-transform transition-opacity
    duration-300
    ease-[cubic-bezier(0.22,1,0.36,1)]
  "
      >
        <button
          onClick={() => {
            setMenuVisible(true);
            requestAnimationFrame(() => setMenuOpen(true));
          }}
          className="px-3 text-[var(--text-inverse)] font-semibold text-sm"
        >
          ☰
        </button>

        <div className="w-px h-4 bg-[var(--text-inverse)/0.3] mx-2" />

        <div className="px-3 flex items-center gap-2 capitalize">
          <BibleIcon className="w-5 h-5 text-[var(--text-inverse)]" />
          <span className="text-[var(--text-inverse)] font-semibold tracking-wide text-sm">
            {readingContext.book} {readingContext.chapter}
          </span>
        </div>

        <div className="w-px h-4 bg-[var(--text-inverse)/0.3] mx-2" />

        <button
          onClick={() => setJournalOpen(true)}
          className="px-3"
          aria-label="Journal"
        >
          <NotesIcon className="w-5 h-5 text-[var(--text-inverse)]" />
        </button>
      </nav>

      {/* ===============================
         Slide-Out Menu
      ================================ */}
      {menuVisible && (
        <div
          className="fixed inset-0 z-50 flex"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="
              w-[80%] max-w-sm
              bg-[#1C1C1A]
              h-full
              shadow-[4px_0_20px_rgba(0,0,0,0.6)]
              transition-transform duration-700 ease-in-out
            "
            style={{
              transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
            }}
            onClick={(e) => e.stopPropagation()}
            onTransitionEnd={() => {
              if (!menuOpen) setMenuVisible(false);
            }}
          >
            <div className="relative h-full p-6 text-[#EEECE6]">
              <p className="mb-1 text-lg text-[#CBB27C] tracking-wide">
                {getGreeting()}
              </p>
              <p className="mb-6 text-xs opacity-60">Abide in God’s Word</p>

              <button
                className="w-full py-3 text-left hover:text-[#CBB27C]"
                onClick={() => {
                  setMenuOpen(false);
                  setMenuVisible(false);
                  setActiveScreen("journalIndex");
                }}
              >
                ABIDE Journal →
              </button>

              <button
                className="w-full py-3 text-left hover:text-[#CBB27C]"
                onClick={() => {
                  setMenuOpen(false);
                  setMenuVisible(false);
                  navigate("/grow");
                }}
              >
                ABIDE — Grow →
              </button>

              <div className="py-3 opacity-50">Devotionals (Coming Soon)</div>
              <div className="py-3 opacity-50">
                Cross References (Coming Soon)
              </div>

              <button
                className="absolute bottom-6 right-6 text-[#CBB27C]"
                onClick={() => setSettingsOpen(true)}
              >
                <SettingsIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===============================
         Settings Modal
      ================================ */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => {
            setSettingsOpen(false);
            setSettingsView("main");
          }}
        >
          <div
            className="bg-[#1C1C1A] rounded-3xl w-[94%] max-w-[460px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-[#EEECE6]">
              {settingsView === "main" && (
                <>
                  <h2 className="text-2xl mb-6">Settings</h2>

                  <button
                    className="w-full mb-4 bg-black/30 rounded-xl px-4 py-3"
                    onClick={() => setSettingsView("vsv")}
                  >
                    Bible Translation → VSV
                  </button>

                  <div className="flex justify-between items-center mb-6">
                    <span>Hide Verse Numbers</span>
                    <button
                      onClick={() => setHideVerseNumbers((v) => !v)}
                      className={`w-10 h-6 rounded-full ${
                        hideVerseNumbers ? "bg-[#CBB27C]" : "bg-black/40"
                      }`}
                    />
                  </div>

                  <div className="mt-6">
                    <h3 className="mb-3 text-sm opacity-70">Theme</h3>

                    <div className="space-y-2">
                      {[
                        {
                          id: "classic",
                          label: "Classic",
                          desc: "Traditional Scripture",
                        },
                        {
                          id: "still-waters",
                          label: "Still Waters",
                          desc: "Calm & Reflective",
                        },
                        {
                          id: "stone-fire",
                          label: "Stone & Fire",
                          desc: "Bold & Prophetic",
                        },
                        {
                          id: "olive-parchment",
                          label: "Olive & Parchment",
                          desc: "Ancient Manuscript",
                        },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`
          w-full flex items-center justify-between
          px-4 py-3 rounded-xl
          transition
          ${
            theme === t.id
              ? "bg-[var(--bg-nav)] text-[var(--text-inverse)]"
              : "bg-black/30 opacity-70 hover:opacity-100"
          }
        `}
                        >
                          <div className="text-left">
                            <div className="font-semibold">{t.label}</div>
                            <div className="text-xs opacity-70">{t.desc}</div>
                          </div>

                          {theme === t.id && <span className="text-sm">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-center opacity-60 text-sm">
                    Made with ♥ by{" "}
                    <span className="text-[#CBB27C]">Jesus Vargas</span>
                    <div className="mt-1">Version 2.2.0</div>
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
        <div className="fixed inset-0 z-[60] bg-[#1C1C1A] text-[#EEECE6]">
          <div className="flex justify-between px-5 py-4 border-b border-[#CBB27C]/20">
            <span className="text-sm opacity-70">
              {new Date().toLocaleString()}
            </span>
            <button
              className="text-[#CBB27C]"
              onClick={() => {
                if (journalText.trim()) {
                  setJournalEntries((prev) => [
                    {
                      id: Date.now().toString(),
                      text: journalText,
                      createdAt: new Date().toISOString(),
                    },
                    ...prev,
                  ]);
                }
                setJournalText("");
                setJournalOpen(false);
              }}
            >
              Done
            </button>
          </div>

          <textarea
            autoFocus
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Begin writing…"
            className="w-full h-[calc(100vh-64px)] bg-transparent p-6 outline-none"
          />
        </div>
      )}
    </div>
  );
}
