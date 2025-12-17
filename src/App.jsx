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

  // Tracks whether user has scrolled DOWN first
  const hasScrolledDown = useRef(false);

  // ⭐ NEW: latch state for return control
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
     Scroll Tracking (NAV + RETURN SYMMETRY)
================================ */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function handleScroll() {
      gesture.cancel();

      const current = el.scrollTop;
      const delta = current - lastScroll.current;

      /* Floating nav behavior (unchanged) */
      let newNav = navOffset + delta;
      newNav = Math.max(0, Math.min(60, newNav));
      setNavOffset(newNav);

      /* Track downward reading intent */
      if (current > 40) {
        hasScrolledDown.current = true;
      }

      /* ===== Hold-to-return (latched) ===== */

      // Pulling down at top to reveal
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

        if (next >= 60) {
          returnLatched.current = true; // 🔒 latch when fully revealed
        }
      }

      // Keep visible while latched
      if (returnLatched.current) {
        setReturnOffset(60);

        // Scroll back into content → gently dismiss
        if (delta > 4 && current > 10) {
          returnLatched.current = false;
        }
      }

      // Fade away naturally when unlatched
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

  /* ===============================
     Chapter Navigation
================================ */
  function transitionTo(updateChapter) {
    if (navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }

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
      {/* Scripture */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 pt-4 pb-24"
      >
        {/* ⭐ Hold to Return (latched, polite) */}
        {chapter > 1 && (
          <div
            className="mb-12 flex justify-center transition-opacity duration-200"
            style={{
              opacity: returnOffset / 60,
              transform: `translateY(${10 - returnOffset / 6}px)`
            }}
          >
            <ChapterHoldButton
              direction="prev"
              onComplete={goPrevChapter}
            />
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

        {/* ⭐ End of Chapter (Continue) */}
        {!loading && (
          <div className="mt-20 flex justify-center">
            <ChapterHoldButton
              direction="next"
              onComplete={goNextChapter}
            />
          </div>
        )}
      </main>

      {/* ⭐ Premium Floating Nav (UNCHANGED) */}
      <nav
        style={{
          transform: `translateX(-50%) translateY(${navOffset}px)`,
          opacity: `${1 - navOffset / 60}`,
        }}
        className="
          fixed bottom-6 left-1/2
          bg-[#292926]/85
          backdrop-blur-xl
          border border-[#CBB27C]/40
          text-[#CBB27C]
          px-5 py-3
          rounded-full
          shadow-[0_6px_30px_rgba(0,0,0,0.6)]
          flex items-center justify-center
          text-base font-medium whitespace-nowrap
          transition-transform duration-150 ease-out
        "
      >
        <button className="px-3">☰</button>
        <div className="w-px h-5 bg-[#CBB27C]/30 mx-1"></div>
        <button className="px-3 capitalize tracking-wide">
          {book} {chapter}
        </button>
        <div className="w-px h-5 bg-[#CBB27C]/30 mx-1"></div>
        <button className="px-3">🌿</button>
      </nav>

      {/* ⭐ Verse Modal */}
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
