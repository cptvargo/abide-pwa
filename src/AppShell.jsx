import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CoreReading from "./SwipeReading";
import BibleNavigator from "./components/BibleNavigator";
import PremiumMenu from "./components/PremiumMenu";
import SettingsModal from "./components/SettingsModal";
import DialogueSystem from "./DialogueSystem";

/* ===============================
   Book Display Name Lookup
================================ */
const BOOK_NAMES = {
  "1john": "1 John",
  "2john": "2 John",
  "3john": "3 John",
  "1samuel": "1 Samuel",
  "2samuel": "2 Samuel",
  "1kings": "1 Kings",
  "2kings": "2 Kings",
  "1chronicles": "1 Chronicles",
  "2chronicles": "2 Chronicles",
  "1corinthians": "1 Corinthians",
  "2corinthians": "2 Corinthians",
  "1thessalonians": "1 Thessalonians",
  "2thessalonians": "2 Thessalonians",
  "1timothy": "1 Timothy",
  "2timothy": "2 Timothy",
  "1peter": "1 Peter",
  "2peter": "2 Peter",
  songofsolomon: "Song of Solomon",
};

function getBookDisplayName(bookId) {
  if (!bookId) return "";
  return BOOK_NAMES[bookId] ?? bookId.charAt(0).toUpperCase() + bookId.slice(1);
}

/* ===============================
   Greeting Logic
================================ */
function getGreeting() {
  const hour = new Date().getHours();
  const name = localStorage.getItem("abide_name") || "";
  let timeGreeting;
  if (hour < 12) timeGreeting = "Good morning";
  else if (hour < 18) timeGreeting = "Good afternoon";
  else timeGreeting = "Good evening";
  return name ? `${timeGreeting}, ${name}` : timeGreeting;
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

  const [navigatorOpen, setNavigatorOpen] = useState(false);

  const [navProgress, setNavProgress] = useState(0);
  const [navCollapsed, setNavCollapsed] = useState(false);
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
    () => localStorage.getItem("translation") || "VSV",
  );

  const [readingContext, setReadingContext] = useState(() => {
    const saved = localStorage.getItem("lastReadingPosition");
    return saved ? JSON.parse(saved) : { book: "Genesis", chapter: 1 };
  });

  const [navigationTarget, setNavigationTarget] = useState(null);

  /* ===============================
     Effects
  ================================ */
  useEffect(() => {
    console.log("Theme changed to:", theme);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    const themeColors = {
      classic: "#cbb27c",
      "still-waters": "#1f6f78",
      "stone-fire": "#f97316",
      "olive-parchment": "#9d8f6f",
      parchment: "#8b7355",
    };

    const statusBarColor = themeColors[theme] || "#cbb27c";

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = statusBarColor;

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
     — converts raw book ID (e.g. "1john") to display name ("1 John")
       before storing in readingContext and passing to CoreReading
  ================================ */
  function handleNavigate(bookId, chapter) {
    const displayName = getBookDisplayName(bookId);
    setNavigationTarget({ book: bookId, chapter });
    setReadingContext({ book: displayName, chapter });
    setNavigatorOpen(false);
  }

  /* ===============================
     Render
  ================================ */
  return (
    <div
      className="no-select flex flex-col relative bg-[var(--bg-app)] text-[var(--text-primary)] font-[var(--font-ui)]"
      style={{ height: "100dvh", maxHeight: "100dvh", overflow: "hidden" }}
    >
      {/* Fixed Status Bar Background */}
      <div
        className="fixed top-0 left-0 right-0 z-40"
        style={{
          height: "env(safe-area-inset-top)",
          background: "var(--bg-app)",
          pointerEvents: "none",
        }}
      />

      {/* Scripture Reading Screen */}
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
          reflectionOpen={reflectionOpen}
          onReflectionOpenChange={setReflectionOpen}
        />
      )}

      {/* Dialoguing with God Screen */}
      {activeScreen === "dialogue" && (
        <DialogueSystem
          theme={theme}
          translation={translation}
          onBack={() => setActiveScreen("scripture")}
        />
      )}

      {/* Floating Nav */}
      {activeScreen === "scripture" &&
        uiMode === "reading" &&
        !reflectionOpen && (
          <>
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
              <button
                onClick={() => {
                  setMenuVisible(true);
                  requestAnimationFrame(() => setMenuOpen(true));
                }}
                className="px-3 py-1 text-[var(--text-inverse)] font-bold text-base hover:scale-105 transition-transform"
              >
                ☰
              </button>

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

              <button
                onClick={() => setNavigatorOpen(true)}
                className="px-3 py-1 flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <BibleIcon className="w-5 h-5 text-[var(--text-inverse)] stroke-[2.5]" />
                <span className="text-[var(--text-inverse)] font-bold tracking-wide text-base">
                  {readingContext.book} {readingContext.chapter}
                </span>
              </button>

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
                  boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                  animation:
                    "revealButtonIn 350ms cubic-bezier(0.4,0,0.2,1) 150ms both",
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

            <style>{`
            @keyframes revealButtonIn {
              from { opacity:0; transform:translateX(-50%) translateY(12px) }
              to   { opacity:1; transform:translateX(-50%) translateY(0) }
            }
          `}</style>
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
          else if (id === "grow") navigate("/grow");
          else if (id === "settings") setSettingsOpen(true);
          setMenuOpen(false);
          setMenuVisible(false);
        }}
        theme={theme}
      />

      {/* Bible Navigator */}
      <BibleNavigator
        open={navigatorOpen}
        onClose={() => setNavigatorOpen(false)}
        onNavigate={handleNavigate}
        currentBook={readingContext.book}
        currentChapter={readingContext.chapter}
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
    </div>
  );
}
