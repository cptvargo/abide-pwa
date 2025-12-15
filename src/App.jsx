import { useEffect, useState, useRef } from "react";
import { loadChapter } from "./lib/bible";
import VerseModal from "./components/VerseModal"; // ⭐ NEW

// ⭐ Long-Press Hook (fixed to prevent triggering while scrolling)
function useLongPress(callback, timeout = 500) {
  let timer = null;
  let startX = 0;
  let startY = 0;
  const MOVE_THRESHOLD = 10; // px – prevents long press during scrolling

  const start = (e) => {
    const touch = e.touches?.[0];
    startX = touch?.clientX ?? e.clientX;
    startY = touch?.clientY ?? e.clientY;

    timer = setTimeout(callback, timeout);
  };

  const clear = () => {
    clearTimeout(timer);
    timer = null;
  };

  const handleMove = (e) => {
    if (!timer) return;

    const touch = e.touches?.[0];
    const x = touch?.clientX ?? e.clientX;
    const y = touch?.clientY ?? e.clientY;

    const dx = Math.abs(x - startX);
    const dy = Math.abs(y - startY);

    // If user is scrolling or moving finger, cancel long press
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      clear();
    }
  };

  return {
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchMove: handleMove,

    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onMouseMove: handleMove,
  };
}


export default function App() {
  const [verses, setVerses] = useState([]);
  const [book, setBook] = useState("genesis");
  const [chapter, setChapter] = useState(1);
  const [loading, setLoading] = useState(true);

  const [translation, setTranslation] = useState("VSV");

  // ⭐ Smooth nav movement offset
  const [navOffset, setNavOffset] = useState(0);
  const lastScroll = useRef(0);

  const scrollRef = useRef(null);

  // ⭐ LONG-PRESS MODAL STATE
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [hebrewData, setHebrewData] = useState(null);
  const [insight, setInsight] = useState(null);
  const [note, setNote] = useState("");

  // ⭐ Load Hebrew + Insight + Note for selected verse
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

      const savedNote = localStorage.getItem(`note-${book}-${chapter}-${verseNumber}`) || "";
      setNote(savedNote);

      setModalOpen(true);
    } catch (err) {
      console.error("Error loading verse data:", err);
    }
  }

  // ⭐ Save Note
  function saveNote() {
    const verseNumber = selectedVerse.ref.split(":")[1];
    const key = `note-${book}-${chapter}-${verseNumber}`;
    localStorage.setItem(key, note);
  }

  // ⭐ Smooth Scroll Tracking Logic (your original code)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function handleScroll() {
      const current = el.scrollTop;
      const delta = current - lastScroll.current;

      let newOffset = navOffset + delta;

      newOffset = Math.max(0, Math.min(60, newOffset));

      setNavOffset(newOffset);

      lastScroll.current = current;
    }

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  });

  // ⭐ Load chapter (your original logic)
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
      }
    }
    load();
  }, [book, chapter]);

  return (
    <div className="no-select flex flex-col h-screen bg-abideDark text-white font-serif">

      {/* Scripture */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 pt-4 pb-24"
      >
        {!loading &&
          verses.map(v => {
            const longPress = useLongPress(() => loadVerseData(v.verse));

            return (
              <p
                key={v.verse}
                {...longPress}
                className="mb-6 leading-relaxed text-[19px]"
              >
                <sup className="text-abideGold mr-2">{v.verse}</sup>
                {v.text}
              </p>
            );
          })}
      </main>

      {/* ⭐ Premium Floating Nav */}
      <nav
        style={{
          transform: `translateX(-50%) translateY(${navOffset}px)`,
          opacity: `${1 - navOffset / 60}`,
        }}
        className={`
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
        `}
      >
        {/* Menu */}
        <button className="px-3">☰</button>

        <div className="w-px h-5 bg-[#CBB27C]/30 mx-1"></div>

        <button className="px-3 capitalize tracking-wide">
          {book} {chapter}
        </button>

        <div className="w-px h-5 bg-[#CBB27C]/30 mx-1"></div>

        <button className="px-3">🌿</button>
      </nav>

      {/* ⭐ Long-Press Theological Modal */}
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