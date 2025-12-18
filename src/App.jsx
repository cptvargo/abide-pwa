import { useEffect, useState, useRef } from "react";
import { loadChapter } from "./lib/bible";
import VerseModal from "./components/VerseModal";
import { useGestureIntent } from "./hooks/useGestureIntent";

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

function AbideLeafIcon({ className }) {
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
      <path d="M20 4c-8 0-14 6-14 14" />
      <path d="M4 20c8 0 14-6 14-14" />
    </svg>
  );
}

export default function App() {
  const [verses, setVerses] = useState([]);
  const [book, setBook] = useState("genesis");
  const [chapter, setChapter] = useState(1);
  const [loading, setLoading] = useState(true);

  const [translation, setTranslation] = useState("VSV");

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
  const [note, setNote] = useState("");

  /* ⭐ Transition */
  const [fading, setFading] = useState(false);

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
      const hebrew = await fetch(
        `/data/lexicon/hebrew/${book}/${chapter}.json`
      ).then(r => r.json());

      const insights = await fetch(
        `/data/insights/${book}/${chapter}.json`
      ).then(r => r.json());

      const verseText = verses.find(v => v.verse === verseNumber)?.text;

      setSelectedVerse({
        ref: `${book} ${chapter}:${verseNumber}`,
        text: verseText,
      });

      setHebrewData(hebrew[verseNumber] || null);
      setInsight(insights[verseNumber] || null);

      const savedNote =
        localStorage.getItem(`note-${book}-${chapter}-${verseNumber}`) || "";
      setNote(savedNote);

      setModalOpen(true);
    } catch (err) {
      console.error("Error loading verse data:", err);
    }
  }

  function saveNote() {
    const verseNumber = selectedVerse.ref.split(":")[1];
    localStorage.setItem(
      `note-${book}-${chapter}-${verseNumber}`,
      note
    );
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
    transitionTo(() => setChapter(c => c + 1));
  }

  function goPrevChapter() {
    transitionTo(() => setChapter(c => Math.max(1, c - 1)));
  }

  return (
    <div
      className={`no-select flex flex-col h-screen bg-abideDark text-white font-serif transition-opacity duration-300 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 pt-4 pb-24"
      >
        {chapter > 1 && (
          <div
            className="mb-12 flex justify-center transition-opacity duration-200"
            style={{
              opacity: returnOffset / 60,
              transform: `translateY(${10 - returnOffset / 6}px)`
            }}
          >
            <ChapterHoldButton direction="prev" onComplete={goPrevChapter} />
          </div>
        )}

        {!loading &&
          verses.map(v => (
            <p
              key={v.verse}
              onTouchStart={() =>
                gesture.beginStudy(() => loadVerseData(v.verse), 500)
              }
              onTouchEnd={gesture.cancel}
              onTouchMove={gesture.cancel}
              className="mb-6 leading-relaxed text-[19px]"
            >
              <sup className="text-abideGold mr-2">{v.verse}</sup>
              {v.text}
            </p>
          ))}

        {!loading && (
          <div className="mt-20 flex justify-center">
            <ChapterHoldButton direction="next" onComplete={goNextChapter} />
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

        <button className="px-3">
          <AbideLeafIcon className="w-5 h-5 text-[#1C1C1A]" />
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
              transform: menuOpen ? "translateX(0)" : "translateX(-100%)"
            }}
            onClick={e => e.stopPropagation()}
            onTransitionEnd={() => {
              if (!menuOpen) setMenuVisible(false);
            }}
          >
            <div className="p-6 text-[#EEECE6] font-serif">
              <h2 className="text-lg mb-4">Menu</h2>
              <p className="opacity-60 text-sm">
                Menu content coming soon.
              </p>
            </div>
          </div>

          {/* ✅ Overlay only while open */}
          {menuOpen && (
            <div className="flex-1 bg-black/40 backdrop-blur-sm" />
          )}
        </div>
      )}

      <VerseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        verse={selectedVerse}
        hebrew={hebrewData}
        insight={insight}
        note={note}
        setNote={setNote}
        onSaveNote={saveNote}
      />
    </div>
  );
}
