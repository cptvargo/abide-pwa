import { useEffect, useState, useRef } from "react";
import { loadChapter } from "./lib/bible";
import VerseModal from "./components/VerseModal";
import { useGestureIntent } from "./hooks/useGestureIntent";
import VSVInfo from "./components/VSVInfo";

/* ===============================
   ABIDE Chapter Hold Button
================================ */
function ChapterHoldButton({ direction, onComplete }) {
  const gesture = useGestureIntent();

  return (
    <div
      className="flex flex-col items-center justify-center text-[#CBB27C] select-none"
      onTouchStart={() => gesture.beginNavigate(onComplete, 700)}
      onTouchEnd={gesture.cancel}
      onTouchMove={gesture.cancel}
    >
      <div
        className="
          w-12 h-12
          rounded-full
          border border-[#CBB27C]/40
          flex items-center justify-center
          mb-2
          text-xl
        "
      >
        {direction === "next" ? "↓" : "↑"}
      </div>

      <div className="text-xs tracking-wide opacity-80">
        Hold to {direction === "next" ? "continue" : "return"}
      </div>
    </div>
  );
}

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
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning, Beloved";
  if (hour < 18) return "Good afternoon, Beloved";
  return "Good evening, Beloved";
}

export default function App() {
  const [verses, setVerses] = useState([]);
  const [book, setBook] = useState("genesis");
  const [chapter, setChapter] = useState(1);
  const [loading, setLoading] = useState(true);

  const [translation, setTranslation] = useState("VSV");

  // Group journal entries by Month + Year
  function groupEntriesByMonth(entries) {
    return entries.reduce((groups, entry) => {
      const monthKey = new Date(entry.createdAt).toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      });

      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(entry);

      return groups;
    }, {});
  }

  // Delete a journal entry
  function deleteJournalEntry(id) {
    setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  // ⭐ Reading Preferences
  const [hideVerseNumbers, setHideVerseNumbers] = useState(() => {
    return localStorage.getItem("hideVerseNumbers") === "true";
  });

  const [settingsView, setSettingsView] = useState("main");
  // "main" | "vsv"

  /* ⭐ Smooth nav movement offset */
  const [navOffset, setNavOffset] = useState(0);
  const [returnOffset, setReturnOffset] = useState(0);
  const lastScroll = useRef(0);
  const scrollRef = useRef(null);

  /* ⭐ Gesture Intent (verse study only) */
  const gesture = useGestureIntent();

  /* ⭐ Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [hebrewData, setHebrewData] = useState(null);
  const [insight, setInsight] = useState(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalText, setJournalText] = useState("");

  const [journalEntries, setJournalEntries] = useState([]);

  /* ⭐ Transition */
  const [fading, setFading] = useState(false);

  const [activeScreen, setActiveScreen] = useState("scripture");
  // scripture | journalIndex

  // ⭐ Slide-out menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const hasScrolledDown = useRef(false);
  const returnLatched = useRef(false);

  /* ===============================
     Verse Data Loader
================================ */
  async function loadVerseData(verseNumber) {
    try {
      // ✅ Vite-aware base path (handles /abide-pwa/)
      const base = import.meta.env.BASE_URL;

      const hebrew = await fetch(
        `${base}data/lexicon/hebrew/${book}/${chapter}.json`
      ).then((r) => r.json());

      const insights = await fetch(
        `${base}data/insights/${book}/${chapter}.json`
      ).then((r) => r.json());

      const verseText = verses.find((v) => v.verse === verseNumber)?.text;

      setSelectedVerse({
        ref: `${book} ${chapter}:${verseNumber}`,
        text: verseText,
      });

      setHebrewData(hebrew[verseNumber] || null);

      // ✅ Supports BOTH Genesis 2 (string) and Genesis 3 (object)
      const rawInsight = insights[verseNumber];
      setInsight(
        typeof rawInsight === "string"
          ? rawInsight
          : rawInsight?.insight || null
      );

      setModalOpen(true);
    } catch (err) {
      console.error("Error loading verse data:", err);
    }
  }

  /* ===============================
     Scroll Tracking
================================ */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function handleScroll() {
      gesture.cancel();

      const current = el.scrollTop;
      const delta = current - lastScroll.current;

      let newNav = navOffset + delta;
      newNav = Math.max(0, Math.min(60, newNav));
      setNavOffset(newNav);

      if (current > 40) hasScrolledDown.current = true;

      if (
        chapter > 1 &&
        hasScrolledDown.current &&
        current <= 0 &&
        delta < 0 &&
        !returnLatched.current
      ) {
        let next = returnOffset - delta;
        next = Math.min(60, next);
        setReturnOffset(next);
        if (next >= 60) returnLatched.current = true;
      }

      if (returnLatched.current) {
        setReturnOffset(60);
        if (delta > 4 && current > 10) returnLatched.current = false;
      }

      if (!returnLatched.current && delta > 0) {
        let next = returnOffset - delta;
        next = Math.max(0, next);
        setReturnOffset(next);
      }

      lastScroll.current = current;
    }

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [navOffset, returnOffset, gesture, chapter]);

  useEffect(() => {
    localStorage.setItem("hideVerseNumbers", hideVerseNumbers);
  }, [hideVerseNumbers]);

  /* ===============================
     Load Chapter
================================ */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await loadChapter(book, chapter, "vsv");
        setVerses(data);
      } catch (err) {
        console.error("Error loading scripture:", err);
      } finally {
        setLoading(false);
        hasScrolledDown.current = false;
        returnLatched.current = false;
        setReturnOffset(0);
      }
    }
    load();
  }, [book, chapter]);

  function transitionTo(updateChapter) {
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);

    setFading(true);

    setTimeout(() => {
      updateChapter();
      requestAnimationFrame(() => {
        scrollRef.current.scrollTop = 0;
        lastScroll.current = 0;
        setNavOffset(0);
        setReturnOffset(0);
        setFading(false);
      });
    }, 250);
  }

  function goNextChapter() {
    transitionTo(() => setChapter((c) => c + 1));
  }

  function goPrevChapter() {
    transitionTo(() => setChapter((c) => Math.max(1, c - 1)));
  }

  return (
    <div
      className={`no-select flex flex-col h-screen bg-abideDark text-white font-serif transition-opacity duration-300 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 pt-4 pb-24">
        {activeScreen === "scripture" && (
          <>
            {chapter > 1 && (
              <div
                className="mb-12 flex justify-center transition-opacity duration-200"
                style={{
                  opacity: returnOffset / 60,
                  transform: `translateY(${10 - returnOffset / 6}px)`,
                }}
              >
                <ChapterHoldButton
                  direction="prev"
                  onComplete={goPrevChapter}
                />
              </div>
            )}

            {!loading &&
              verses.map((v) => (
                <p
                  key={v.verse}
                  onTouchStart={() =>
                    gesture.beginStudy(() => loadVerseData(v.verse), 500)
                  }
                  onTouchEnd={gesture.cancel}
                  onTouchMove={gesture.cancel}
                  className="mb-6 leading-relaxed text-[19px]"
                >
                  {!hideVerseNumbers && (
                    <sup className="text-abideGold mr-2 select-none">
                      {v.verse}
                    </sup>
                  )}
                  {v.text}
                </p>
              ))}

            {!loading && (
              <div className="mt-20 flex justify-center">
                <ChapterHoldButton
                  direction="next"
                  onComplete={goNextChapter}
                />
              </div>
            )}
          </>
        )}

        {activeScreen === "journalIndex" && (
          <div className="space-y-6">
            {/* Back to Scripture */}
            <button
              className="flex items-center gap-2 text-[#CBB27C] text-sm tracking-wide"
              onClick={() => setActiveScreen("scripture")}
            >
              ← Scripture
            </button>

            <h1 className="text-xl text-[#CBB27C] tracking-wide">
              ABIDE Journal
            </h1>

            {journalEntries.length === 0 ? (
              <p className="opacity-60 text-sm">No journal entries yet.</p>
            ) : (
              Object.entries(groupEntriesByMonth(journalEntries)).map(
                ([month, entries]) => (
                  <div key={month} className="space-y-4">
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
                )
              )
            )}
          </div>
        )}
      </main>

      {/* ⭐ Premium Floating Nav */}
      <nav
        style={{
          transform: `translateX(-50%) translateY(${navOffset}px)`,
          opacity: `${1 - navOffset / 60}`,
        }}
        className="
          fixed bottom-6 left-1/2
          bg-[#CBB27C]
          px-6 py-2.5
          rounded-full
          shadow-[0_6px_22px_rgba(0,0,0,0.45)]
          flex items-center justify-center
          whitespace-nowrap
          transition-transform duration-150 ease-out
          border border-[#1C1C1A]/25
        "
      >
        <button
          onClick={() => {
            setMenuVisible(true);
            requestAnimationFrame(() => setMenuOpen(true));
          }}
          className="px-3 text-[#1C1C1A] font-semibold text-sm tracking-wide"
        >
          ☰
        </button>

        <div className="w-px h-4 bg-[#1C1C1A]/30 mx-2"></div>

        <button className="px-3 flex items-center gap-2 capitalize">
          <BibleIcon className="w-5 h-5 text-[#1C1C1A]" />
          <span className="text-[#1C1CA] font-semibold tracking-wide text-sm">
            {book} {chapter}
          </span>
        </button>

        <div className="w-px h-4 bg-[#1C1C1A]/30 mx-2"></div>

        <button
          onClick={() => setJournalOpen(true)}
          className="px-3"
          aria-label="Journal"
        >
          <NotesIcon className="w-5 h-5 text-[#1C1C1A]" />
        </button>
      </nav>

      {/* ⭐ Slide-Out Menu */}
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
            <div className="relative h-full p-6 text-[#EEECE6] font-serif">
              <p className="mb-6 text-sm text-[#CBB27C] tracking-wide">
                {getGreeting()}
              </p>

              <h2 className="text-lg mb-4">Menu</h2>
              <button
                className="
    w-full
    flex items-center justify-between
    py-3
    text-[#EEECE6]
    text-base
    tracking-wide
    hover:text-[#CBB27C]
    transition-colors
  "
                onClick={() => {
                  setMenuOpen(false);
                  setMenuVisible(false);
                  setActiveScreen("journalIndex");
                }}
              >
                <span>ABIDE Journal</span>
                <span className="text-[#CBB27C] text-lg">→</span>
              </button>

              {/* Settings (visual only) */}
              <button
                className="
      absolute bottom-6 right-6
      text-[#CBB27C]/80
      hover:text-[#CBB27C]
      transition-colors
    "
                aria-label="Settings"
                onClick={() => setSettingsOpen(true)}
              >
                <SettingsIcon className="w-6 h-6" />
              </button>
            </div>

            {/* ✅ Overlay only while open */}
            {menuOpen && (
              <div className="flex-1 bg-black/40 backdrop-blur-sm" />
            )}
          </div>
        </div>
      )}

      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setSettingsOpen(false);
            setSettingsView("main");
          }}
        >
          <div
            className="
        w-[94%]
        max-w-[460px]
        max-h-[82vh]
        rounded-3xl
        bg-[#1C1C1A]
        shadow-2xl
        overflow-hidden
      "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 overflow-y-auto max-h-[82vh] text-[#EEECE6] font-serif">
              {/* =====================
            SETTINGS MAIN
        ===================== */}
              {settingsView === "main" && (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Settings</h2>
                    <button
                      onClick={() => {
                        setSettingsOpen(false);
                        setSettingsView("main");
                      }}
                      className="text-[#CBB27C]"
                      aria-label="Close settings"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Bible Translation */}
                  <button
                    onClick={() => setSettingsView("vsv")}
                    className="
                mb-4
                w-full
                rounded-2xl
                bg-black/30
                px-5
                py-4
                flex
                items-center
                justify-between
                text-left
              "
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#CBB27C"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z" />
                        <path d="M17 4h3v16h-3" />
                      </svg>
                      <span>Bible Translation</span>
                    </div>
                    <span className="text-[#CBB27C] opacity-80">VSV →</span>
                  </button>

                  {/* Hide Verse Numbers */}
                  <div className="mb-6 rounded-2xl bg-black/30 px-5 py-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#CBB27C"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.74-1.69 1.83-3.21 3.17-4.44" />
                          <path d="M1 1l22 22" />
                        </svg>
                        <span>Hide Verse Numbers</span>
                      </div>
                      <p className="text-sm opacity-60">
                        Create a more seamless reading experience closer to the
                        original text.
                      </p>
                    </div>

                    <button
                      onClick={() => setHideVerseNumbers((v) => !v)}
                      className={`
    w-10 h-6 rounded-full transition-colors flex items-center
    ${hideVerseNumbers ? "bg-[#CBB27C]" : "bg-black/40"}
  `}
                    >
                      <span
                        className={`
      w-5 h-5 rounded-full bg-[#1C1C1A] transition-transform
      ${hideVerseNumbers ? "translate-x-4" : "translate-x-1"}
    `}
                      />
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 text-center opacity-60 text-sm">
                    <p>
                      Made with ♥ by{" "}
                      <span className="text-[#CBB27C]">Jesus Vargas</span>
                    </p>
                    <p className="mt-1">Version 2.2.0</p>
                  </div>
                </>
              )}

              {/* =====================
            VSV INFO PAGE
        ===================== */}
              {settingsView === "vsv" && (
                <div className="animate-slide-in">
                  <VSVInfo onBack={() => setSettingsView("main")} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Journal Shell */}
      {journalOpen && (
        <div className="fixed inset-0 z-[60] bg-[#1C1C1A] text-[#EEECE6] font-serif">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#CBB27C]/20">
            <div className="text-sm text-[#CBB27C]/80">
              {new Date().toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              ·{" "}
              {new Date().toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>

            <button
              onClick={() => {
                const text = journalText.trim();
                if (!text) {
                  setJournalOpen(false);
                  setActiveScreen("scripture");
                  return;
                }

                setJournalEntries((prev) => [
                  {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    text,
                    createdAt: new Date().toISOString(),
                  },
                  ...prev,
                ]);

                setJournalText("");
                setJournalOpen(false);
              }}
              className="text-[#CBB27C] font-semibold"
            >
              Done
            </button>
          </div>{" "}
          {/* ✅ HEADER CLOSED */}
          {/* Editor */}
          <textarea
            autoFocus
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Begin writing…"
            className="
        w-full
        h-[calc(100vh-64px)]
        bg-transparent
        resize-none
        outline-none
        px-5
        py-6
        text-lg
        leading-relaxed
        placeholder:text-[#EEECE6]/30
      "
          />
        </div>
      )}

      <VerseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        verse={selectedVerse}
        hebrew={hebrewData}
        insight={insight}
      />
    </div>
  );
}
