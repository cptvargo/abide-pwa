import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CoreReading from "./SwipeReading";
import VSVInfo from "./components/VSVInfo";
import BibleNavigator from "./components/BibleNavigator";
import PremiumMenu from "./components/PremiumMenu";
import DialogueSystem from "./DialogueSystem";

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
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [uiMode, setUiMode] = useState("reading"); // "reading" | "highlighting" | "dialogue"

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
      {/* ===============================
         Scripture Reading Screen
      ================================ */}
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
          isModalOpen={navigatorOpen}
          uiMode={uiMode}
          onUiModeChange={setUiMode}
        />
      )}

      {/* ===============================
         Dialoguing with God Screen
      ================================ */}
      {activeScreen === "dialogue" && (
        <DialogueSystem
          theme={theme}
          translation={translation}
          onBack={() => setActiveScreen("scripture")}
        />
      )}

      {/* ===============================
         Floating Nav with Collapse (only in reading mode)
      ================================ */}
      {activeScreen === "scripture" && uiMode === "reading" && (
        <>
          {/* Main Nav Pill */}
          <nav
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            style={{
              transform: navCollapsed
                ? `translateX(-50%) translateY(calc(100% + 24px))`
                : `translateX(-50%) translateY(${navProgress * 60}px)`,
              opacity: navCollapsed ? 0 : 1 - navProgress,
              background: "var(--bg-nav)",
              transition: navCollapsed
                ? "transform 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease-out"
                : "transform 300ms ease-[cubic-bezier(0.22,1,0.36,1)], opacity 300ms ease-[cubic-bezier(0.22,1,0.36,1)]",
              pointerEvents: navCollapsed ? "none" : "auto",
              zIndex: 50,
            }}
            className="fixed bottom-6 left-1/2 px-5 py-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-1 whitespace-nowrap"
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

            {/* Separator */}
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

            {/* Separator */}
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

            {/* Collapse Button */}
            <button
              onClick={() => setNavCollapsed(true)}
              className="px-3 py-1 text-[var(--text-inverse)] opacity-60 hover:opacity-100 transition-opacity"
              title="Hide navigation"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </nav>

          {/* Floating Reveal Button (shown when collapsed) */}
          {navCollapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setNavCollapsed(false);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="fixed left-1/2 -translate-x-1/2"
              style={{
                bottom: "90px",
                width: "44px",
                height: "44px",
                background: "rgba(var(--bg-nav-rgb), 0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
                animation:
                  "revealButtonIn 350ms cubic-bezier(0.4, 0, 0.2, 1) 150ms both",
                zIndex: 50,
                pointerEvents: "auto",
              }}
              title="Show navigation"
            >
              <svg
                viewBox="0 0 24 24"
                style={{
                  width: "18px",
                  height: "18px",
                  stroke: "var(--text-accent)",
                  fill: "none",
                  strokeWidth: "2.5",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                }}
              >
                <path d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}

          {/* Animation styles */}
          <style>{`
            @keyframes revealButtonIn {
              from {
                opacity: 0;
                transform: translateX(-50%) translateY(12px);
              }
              to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
              }
            }
          `}</style>
        </>
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
          if (id === "dialogue") {
            setActiveScreen("dialogue");
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
    </div>
  );
}
