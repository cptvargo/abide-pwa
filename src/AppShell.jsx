import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CoreReading from "./SwipeReading";
import BibleNavigator from "./components/BibleNavigator";
import PremiumMenu from "./components/PremiumMenu";
import SettingsModal from "./components/SettingsModal";
import DialogueSystem from "./DialogueSystem";
import DevotionalScreen from "./components/DevotionalScreen";
import { getBookDisplayName } from "./lib/bibleStructure";

const TRANSLATIONS = ["ASB", "AKT", "KJV", "WBT", "ASR"];
const TRANSLATION_FULL = {
  ASB: "ABIDE Standard Bible",
  AKT: "ABIDE Kids Translation",
  KJV: "King James Version",
  WBT: "Webster's Bible",
  ASR: "ABIDE Source Reading",
};

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
  const [translationPickerOpen, setTranslationPickerOpen] = useState(false);

  // Scroll-hide: true = visible, false = hidden
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
    () => localStorage.getItem("translation") || "VSV",
  );

  const [readingContext, setReadingContext] = useState(() => {
    const saved = localStorage.getItem("lastReadingPosition");
    return saved ? JSON.parse(saved) : { book: "Genesis", chapter: 1 };
  });

  const [navigationTarget, setNavigationTarget] = useState(null);

  /* ===============================
     Scroll-hide — attached directly to
     SwipeReading's scroll element via ref
  ================================ */
  function handleScroll() {
    const el = scrollElRef.current;
    if (!el) return;
    const y = el.scrollTop;
    const delta = y - lastScrollY.current;

    if (y < 10) {
      setNavVisible(true);
    } else if (delta > 6) {
      setNavVisible(false);
      setTranslationPickerOpen(false);
    } else if (delta < -6) {
      setNavVisible(true);
    }

    lastScrollY.current = y;
  }

  const handleScrollRef = useCallback((el) => {
    // Detach from old element
    if (scrollElRef.current) {
      scrollElRef.current.removeEventListener("scroll", handleScroll);
    }
    scrollElRef.current = el;
    if (el) {
      lastScrollY.current = el.scrollTop;
      el.addEventListener("scroll", handleScroll, { passive: true });
    }
  }, []);

  // Always show nav when chapter changes (scroll resets to top in SwipeReading)
  const handleReadingContext = useCallback((ctx) => {
    setReadingContext(ctx);
    setNavVisible(true);
    lastScrollY.current = 0;
  }, []);

  /* ===============================
     Effects
  ================================ */
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

    const statusBarColor = themeColors[theme] || "#cbb27c";
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = statusBarColor;
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

  // Cleanup scroll listener on unmount
  useEffect(() => {
    return () => {
      if (scrollElRef.current) {
        scrollElRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  /* ===============================
     Navigation Handler
  ================================ */
  function handleNavigate(bookId, chapter) {
    const displayName = getBookDisplayName(bookId);
    setNavigationTarget({ book: bookId, chapter });
    setReadingContext({ book: displayName, chapter });
    setNavigatorOpen(false);
  }

  /* ===============================
     Translation Handler
  ================================ */
  function handleSelectTranslation(t) {
    setTranslation(t);
    setTranslationPickerOpen(false);
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
          onReadingContext={handleReadingContext}
          onScrollProgress={() => {}} // kept for API compat, no longer drives nav
          onScrollRef={handleScrollRef}
          navigationTarget={navigationTarget}
          onNavigationComplete={() => setNavigationTarget(null)}
          isModalOpen={navigatorOpen}
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

      {/* Dialoguing with God Screen */}
      {activeScreen === "dialogue" && (
        <DialogueSystem
          theme={theme}
          translation={translation}
          onBack={() => setActiveScreen("scripture")}
        />
      )}

      {/* Devotionals Screen */}
      {activeScreen === "devotionals" && (
        <DevotionalScreen
          onBack={() => setActiveScreen("scripture")}
          theme={theme}
        />
      )}

      {/* ── Floating Nav ── */}
      {activeScreen === "scripture" &&
        uiMode === "reading" &&
        !reflectionOpen && (
          <>
            <nav
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                bottom: "max(24px, env(safe-area-inset-bottom))",
                left: "50%",
                transform: navVisible
                  ? "translateX(-50%) translateY(0)"
                  : "translateX(-50%) translateY(calc(100% + 40px))",
                opacity: navVisible ? 1 : 0,
                transition:
                  "transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease",
                pointerEvents: navVisible ? "auto" : "none",
                zIndex: 50,
                background: "var(--bg-nav)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                borderRadius: "9999px",
                padding: "10px 6px",
                display: "flex",
                alignItems: "center",
                gap: 0,
                whiteSpace: "nowrap",
              }}
            >
              {/* Hamburger */}
              <button
                onClick={() => {
                  setMenuVisible(true);
                  requestAnimationFrame(() => setMenuOpen(true));
                }}
                style={{
                  padding: "4px 14px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-inverse)",
                  fontSize: 18,
                  fontWeight: "bold",
                  lineHeight: 1,
                  opacity: 0.9,
                }}
              >
                ☰
              </button>

              {/* Divider */}
              <div
                style={{
                  width: "1px",
                  height: "22px",
                  background: "var(--text-inverse)",
                  opacity: 0.2,
                  borderRadius: "9999px",
                  margin: "0 2px",
                  flexShrink: 0,
                }}
              />

              {/* Book + Chapter */}
              <button
                onClick={() => setNavigatorOpen(true)}
                style={{
                  padding: "4px 14px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <BibleIcon
                  className="w-5 h-5 text-[var(--text-inverse)]"
                  style={{ strokeWidth: 2.5 }}
                />
                <span
                  style={{
                    color: "var(--text-inverse)",
                    fontWeight: 700,
                    fontSize: 15,
                    letterSpacing: "0.02em",
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  {readingContext.book} {readingContext.chapter}
                </span>
              </button>

              {/* Divider */}
              <div
                style={{
                  width: "1px",
                  height: "22px",
                  background: "var(--text-inverse)",
                  opacity: 0.2,
                  borderRadius: "9999px",
                  margin: "0 2px",
                  flexShrink: 0,
                }}
              />

              {/* Translation Badge */}
              <button
                onClick={() => setTranslationPickerOpen(true)}
                style={{
                  padding: "4px 14px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    color: "var(--text-inverse)",
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: "0.1em",
                    fontFamily: "var(--font-ui)",
                    opacity: 0.85,
                  }}
                >
                  {translation}
                </span>
              </button>
            </nav>

            <style>{`
              @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
              @keyframes sheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
            `}</style>
          </>
        )}

      {/* ── Translation Picker Bottom Sheet ── */}
      {translationPickerOpen && (
        <>
          {/* Backdrop */}
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

          {/* Sheet */}
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
            {/* Drag handle */}
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

            {/* Header */}
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

            {/* Options */}
            {TRANSLATIONS.map((t) => (
              <button
                key={t}
                onClick={() => handleSelectTranslation(t)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "16px 24px",
                  background: "transparent",
                  border: "none",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
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

                {/* Selected indicator */}
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
                    transition: "border-color 0.2s",
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
          else if (id === "grow") navigate("/grow");
          else if (id === "settings") setSettingsOpen(true);
          else if (id === "devotionals") setActiveScreen("devotionals");
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
