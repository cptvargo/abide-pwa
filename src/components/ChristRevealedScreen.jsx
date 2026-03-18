/**
 * ChristRevealedScreen.jsx
 * Main home base of the Christ Revealed pilgrimage.
 *
 * Grid shows ONLY:
 *   - Completed books (gold ring + checkmark)
 *   - Current in-progress book (partial ring)
 *   - The single next locked book as a teaser (muted, lock icon)
 *   Everything beyond that is hidden — the path reveals itself as you walk.
 *
 * Header: book name + circular progress ring, no counts.
 */

import { useState } from "react";
import { OT_BOOKS, NT_BOOKS, ALL_BOOKS_IN_ORDER } from "./useCRProgress";

/* ── Book abbreviation map ── */
const ABBREV = {
  genesis: "Gen",
  exodus: "Exo",
  leviticus: "Lev",
  numbers: "Num",
  deuteronomy: "Deu",
  joshua: "Jos",
  judges: "Jdg",
  ruth: "Rut",
  "1samuel": "1Sa",
  "2samuel": "2Sa",
  "1kings": "1Ki",
  "2kings": "2Ki",
  "1chronicles": "1Ch",
  "2chronicles": "2Ch",
  ezra: "Ezr",
  nehemiah: "Neh",
  esther: "Est",
  job: "Job",
  psalms: "Psa",
  proverbs: "Pro",
  ecclesiastes: "Ecc",
  songofsolomon: "Sng",
  isaiah: "Isa",
  jeremiah: "Jer",
  lamentations: "Lam",
  ezekiel: "Eze",
  daniel: "Dan",
  hosea: "Hos",
  joel: "Joe",
  amos: "Amo",
  obadiah: "Oba",
  jonah: "Jon",
  micah: "Mic",
  nahum: "Nah",
  habakkuk: "Hab",
  zephaniah: "Zep",
  haggai: "Hag",
  zechariah: "Zec",
  malachi: "Mal",
  matthew: "Mat",
  mark: "Mrk",
  luke: "Luk",
  john: "Jhn",
  acts: "Act",
  romans: "Rom",
  "1corinthians": "1Co",
  "2corinthians": "2Co",
  galatians: "Gal",
  ephesians: "Eph",
  philippians: "Php",
  colossians: "Col",
  "1thessalonians": "1Th",
  "2thessalonians": "2Th",
  "1timothy": "1Ti",
  "2timothy": "2Ti",
  titus: "Tit",
  philemon: "Phm",
  hebrews: "Heb",
  james: "Jas",
  "1peter": "1Pe",
  "2peter": "2Pe",
  "1john": "1Jn",
  "2john": "2Jn",
  "3john": "3Jn",
  jude: "Jud",
  revelation: "Rev",
};

const DISPLAY_NAMES = {
  genesis: "Genesis",
  exodus: "Exodus",
  leviticus: "Leviticus",
  numbers: "Numbers",
  deuteronomy: "Deuteronomy",
  joshua: "Joshua",
  judges: "Judges",
  ruth: "Ruth",
  "1samuel": "1 Samuel",
  "2samuel": "2 Samuel",
  "1kings": "1 Kings",
  "2kings": "2 Kings",
  "1chronicles": "1 Chronicles",
  "2chronicles": "2 Chronicles",
  ezra: "Ezra",
  nehemiah: "Nehemiah",
  esther: "Esther",
  job: "Job",
  psalms: "Psalms",
  proverbs: "Proverbs",
  ecclesiastes: "Ecclesiastes",
  songofsolomon: "Song of Solomon",
  isaiah: "Isaiah",
  jeremiah: "Jeremiah",
  lamentations: "Lamentations",
  ezekiel: "Ezekiel",
  daniel: "Daniel",
  hosea: "Hosea",
  joel: "Joel",
  amos: "Amos",
  obadiah: "Obadiah",
  jonah: "Jonah",
  micah: "Micah",
  nahum: "Nahum",
  habakkuk: "Habakkuk",
  zephaniah: "Zephaniah",
  haggai: "Haggai",
  zechariah: "Zechariah",
  malachi: "Malachi",
  matthew: "Matthew",
  mark: "Mark",
  luke: "Luke",
  john: "John",
  acts: "Acts",
  romans: "Romans",
  "1corinthians": "1 Corinthians",
  "2corinthians": "2 Corinthians",
  galatians: "Galatians",
  ephesians: "Ephesians",
  philippians: "Philippians",
  colossians: "Colossians",
  "1thessalonians": "1 Thessalonians",
  "2thessalonians": "2 Thessalonians",
  "1timothy": "1 Timothy",
  "2timothy": "2 Timothy",
  titus: "Titus",
  philemon: "Philemon",
  hebrews: "Hebrews",
  james: "James",
  "1peter": "1 Peter",
  "2peter": "2 Peter",
  "1john": "1 John",
  "2john": "2 John",
  "3john": "3 John",
  jude: "Jude",
  revelation: "Revelation",
};

/* ── Header progress ring ── */
function HeaderRing({ percent, size = 52 }) {
  const r = (size - 5) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * percent;
  const gap = circ - dash;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(196,169,107,0.12)"
        strokeWidth="2.5"
      />
      {/* Progress */}
      {percent > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={percent >= 1 ? "#C4A96B" : "rgba(196,169,107,0.6)"}
          strokeWidth="2.5"
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
    </svg>
  );
}

/* ── Book card ring (smaller, in grid) ── */
function CardRing({ percent, size = 64, complete = false }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * percent;
  const gap = circ - dash;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(196,169,107,0.1)"
        strokeWidth="2"
      />
      {percent > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={complete ? "#C4A96B" : "rgba(196,169,107,0.55)"}
          strokeWidth="2"
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
    </svg>
  );
}

/* ── Book card ── */
function BookCard({ bookId, status, percent, onTap }) {
  const abbrev = ABBREV[bookId] || bookId.slice(0, 3);
  const complete = status === "complete";
  const inProg = status === "in-progress";
  const teaser = status === "teaser";
  const cardSize = 64;

  return (
    <button
      onClick={() => onTap(bookId, status)}
      style={{
        position: "relative",
        width: `${cardSize}px`,
        height: `${cardSize}px`,
        borderRadius: "12px",
        background: complete
          ? "rgba(196,169,107,0.1)"
          : inProg
            ? "rgba(196,169,107,0.06)"
            : "rgba(255,255,255,0.02)",
        border: complete
          ? "1px solid rgba(196,169,107,0.35)"
          : inProg
            ? "1px solid rgba(196,169,107,0.2)"
            : "1px solid rgba(255,255,255,0.06)",
        cursor: teaser ? "default" : "pointer",
        opacity: teaser ? 0.3 : 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "3px",
        WebkitTapHighlightColor: "transparent",
        transition: "background 0.15s ease",
        flexShrink: 0,
      }}
    >
      {(inProg || complete) && (
        <CardRing percent={percent} size={cardSize} complete={complete} />
      )}

      {complete ? (
        <span style={{ fontSize: "17px", color: "#C4A96B", lineHeight: 1 }}>
          ✓
        </span>
      ) : (
        <span
          style={{
            fontSize: "12px",
            fontWeight: "600",
            letterSpacing: "0.04em",
            color: teaser
              ? "rgba(240,235,224,0.25)"
              : inProg
                ? "#C4A96B"
                : "rgba(240,235,224,0.25)",
            fontFamily: "var(--font-ui, system-ui)",
            lineHeight: 1,
          }}
        >
          {abbrev}
        </span>
      )}

      {teaser && (
        <span
          style={{
            fontSize: "9px",
            color: "rgba(255,255,255,0.2)",
            lineHeight: 1,
          }}
        >
          ⚬
        </span>
      )}
    </button>
  );
}

/* ── Locked modal (shown when teaser tapped — not applicable here since teaser is non-interactive,
   but keeping for any edge case) ── */
function LockedModal({ onClose, nextBookName }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 80,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 90,
          background: "#1A1812",
          border: "1px solid rgba(196,169,107,0.15)",
          borderBottom: "none",
          borderRadius: "20px 20px 0 0",
          padding: "24px",
          paddingBottom: "max(28px, env(safe-area-inset-bottom))",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "3px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "2px",
            margin: "0 auto 20px",
          }}
        />
        <p
          style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "#F0EBE0",
            fontFamily: "var(--font-ui, system-ui)",
            margin: "0 0 8px",
          }}
        >
          {nextBookName} awaits
        </p>
        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.6,
            color: "rgba(240,235,224,0.45)",
            fontFamily: "var(--font-ui, system-ui)",
            margin: "0 0 20px",
          }}
        >
          Complete every stop in the current book to begin the journey into{" "}
          {nextBookName}.
        </p>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            background: "rgba(196,169,107,0.08)",
            border: "1px solid rgba(196,169,107,0.2)",
            color: "#C4A96B",
            fontSize: "14px",
            fontFamily: "var(--font-ui, system-ui)",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          Got it
        </button>
      </div>
    </>
  );
}

/* ── Leave Journey confirmation ── */
function LeaveModal({ onConfirm, onCancel, lastBook, lastChapter }) {
  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 80,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 90,
          background: "#1A1812",
          border: "1px solid rgba(196,169,107,0.15)",
          borderBottom: "none",
          borderRadius: "20px 20px 0 0",
          padding: "24px",
          paddingBottom: "max(28px, env(safe-area-inset-bottom))",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "3px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "2px",
            margin: "0 auto 20px",
          }}
        />
        <p
          style={{
            fontSize: "17px",
            fontWeight: "600",
            color: "#F0EBE0",
            fontFamily: "var(--font-ui, system-ui)",
            margin: "0 0 8px",
            textAlign: "center",
          }}
        >
          Leave Christ Revealed?
        </p>
        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.6,
            color: "rgba(240,235,224,0.45)",
            fontFamily: "var(--font-ui, system-ui)",
            margin: "0 0 24px",
            textAlign: "center",
          }}
        >
          Your progress is saved. You'll return to{" "}
          <strong style={{ color: "rgba(196,169,107,0.8)" }}>
            {lastBook} {lastChapter}
          </strong>{" "}
          in the Bible reader.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(240,235,224,0.5)",
              fontSize: "14px",
              fontFamily: "var(--font-ui, system-ui)",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Stay
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              background: "#C4A96B",
              border: "none",
              color: "#1A1510",
              fontSize: "14px",
              fontWeight: "600",
              fontFamily: "var(--font-ui, system-ui)",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Leave Journey
          </button>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════
   Main screen
════════════════════════════════ */
export default function ChristRevealedScreen({
  onBack,
  onSelectBook,
  progress,
  isBookComplete,
  getBookProgress,
  bookIndex,
  readingContext,
}) {
  const [lockedModal, setLockedModal] = useState(null);
  const [leaveModal, setLeaveModal] = useState(false);

  /* ── Determine which books to show ──
     Visible = completed books + current book + one teaser (next locked)
  ── */
  function getVisibleBooks() {
    const visible = [];
    let teaserAdded = false;

    for (let i = 0; i < ALL_BOOKS_IN_ORDER.length; i++) {
      const bookId = ALL_BOOKS_IN_ORDER[i];
      const entry = bookIndex.find((b) => b.book === bookId);

      if (isBookComplete(bookId)) {
        visible.push({ bookId, status: "complete" });
      } else if (
        bookId === progress.currentBook ||
        (entry?.available && i === 0 && progress.completedBooks.length === 0)
      ) {
        visible.push({ bookId, status: "in-progress" });
        // Add one teaser after current book
        if (!teaserAdded && i + 1 < ALL_BOOKS_IN_ORDER.length) {
          const nextId = ALL_BOOKS_IN_ORDER[i + 1];
          visible.push({ bookId: nextId, status: "teaser" });
          teaserAdded = true;
        }
        break;
      } else if (entry?.available && !teaserAdded) {
        // Available but not started and not current — treat as current
        visible.push({ bookId, status: "in-progress" });
        if (i + 1 < ALL_BOOKS_IN_ORDER.length) {
          const nextId = ALL_BOOKS_IN_ORDER[i + 1];
          visible.push({ bookId: nextId, status: "teaser" });
          teaserAdded = true;
        }
        break;
      }
    }

    return visible;
  }

  const visibleBooks = getVisibleBooks();
  const currentBookId = progress.currentBook || "genesis";
  const currentBookEntry =
    bookIndex.find((b) => b.book === currentBookId) || {};
  const currentBookName = DISPLAY_NAMES[currentBookId] || currentBookId;

  // Progress for current book header ring
  const completedInCurrent = progress.completedStops.filter((s) =>
    s.startsWith(currentBookId.slice(0, 3)),
  ).length;
  const totalInCurrent = currentBookEntry.eventCount || 1;
  const currentPercent = isBookComplete(currentBookId)
    ? 1
    : completedInCurrent / totalInCurrent;

  function handleBookTap(bookId, status) {
    if (status === "teaser") {
      const name = DISPLAY_NAMES[bookId] || bookId;
      setLockedModal(name);
      return;
    }
    onSelectBook(bookId);
  }

  /* ── OT / NT split label ── */
  function getTestamentLabel(bookId) {
    return OT_BOOKS.includes(bookId) ? "Old Testament" : "New Testament";
  }

  // Detect if we're crossing a testament boundary in visible books
  const hasOT = visibleBooks.some((b) => OT_BOOKS.includes(b.bookId));
  const hasNT = visibleBooks.some((b) => NT_BOOKS.includes(b.bookId));

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0D0C09",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes cr-card-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Fixed header ── */}
      <div
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 16px)",
          paddingBottom: "20px",
          paddingLeft: "20px",
          paddingRight: "20px",
          background: "#0D0C09",
          borderBottom: "1px solid rgba(196,169,107,0.08)",
          flexShrink: 0,
        }}
      >
        {/* Leave Journey button */}
        <button
          onClick={() => setLeaveModal(true)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "rgba(196,169,107,0.6)",
            fontSize: "13px",
            fontFamily: "var(--font-ui, system-ui)",
            WebkitTapHighlightColor: "transparent",
            padding: "4px 0",
            marginBottom: "20px",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Leave Journey
        </button>

        {/* Pilgrimage label */}
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(196,169,107,0.4)",
            fontFamily: "var(--font-ui, system-ui)",
            marginBottom: "16px",
          }}
        >
          The Redemption Pilgrimage
        </div>

        {/* Current book + ring */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Ring */}
          <div
            style={{
              position: "relative",
              width: "52px",
              height: "52px",
              flexShrink: 0,
            }}
          >
            <HeaderRing percent={currentPercent} size={52} />
            {/* Centre label */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {currentPercent >= 1 ? (
                <span style={{ fontSize: "16px", color: "#C4A96B" }}>✓</span>
              ) : (
                <span
                  style={{
                    fontSize: "10px",
                    color: "rgba(196,169,107,0.6)",
                    fontFamily: "var(--font-ui, system-ui)",
                  }}
                >
                  {ABBREV[currentBookId] || "—"}
                </span>
              )}
            </div>
          </div>

          {/* Book name */}
          <div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: "300",
                color: "#F0EBE0",
                fontFamily: "var(--font-ui, system-ui)",
                letterSpacing: "0.02em",
                lineHeight: 1.1,
              }}
            >
              {currentBookName}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "rgba(196,169,107,0.4)",
                fontFamily: "var(--font-ui, system-ui)",
                marginTop: "3px",
                letterSpacing: "0.06em",
              }}
            >
              {isBookComplete(currentBookId) ? "Complete" : "In progress"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable journey path ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "28px 20px",
          paddingBottom: "max(48px, env(safe-area-inset-bottom))",
        }}
      >
        {/* OT label if present */}
        {hasOT && (
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(196,169,107,0.35)",
              fontFamily: "var(--font-ui, system-ui)",
              marginBottom: "16px",
            }}
          >
            Old Testament
          </div>
        )}

        {/* Book cards — OT */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: hasNT ? "32px" : "0",
          }}
        >
          {visibleBooks
            .filter((b) => OT_BOOKS.includes(b.bookId))
            .map(({ bookId, status }, idx) => {
              const completed = progress.completedStops.filter((s) =>
                s.startsWith(bookId.slice(0, 3)),
              ).length;
              const total =
                (bookIndex.find((b) => b.book === bookId) || {}).eventCount ||
                1;
              const pct = isBookComplete(bookId) ? 1 : completed / total;

              return (
                <div
                  key={bookId}
                  style={{
                    animation: `cr-card-in 0.4s ease ${idx * 0.07}s both`,
                  }}
                >
                  <BookCard
                    bookId={bookId}
                    status={status}
                    percent={pct}
                    onTap={handleBookTap}
                  />
                </div>
              );
            })}
        </div>

        {/* OT → NT boundary */}
        {hasOT && hasNT && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(196,169,107,0.1)",
              }}
            />
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(196,169,107,0.25)",
                fontFamily: "var(--font-ui, system-ui)",
                whiteSpace: "nowrap",
              }}
            >
              ✦ The Word Made Flesh ✦
            </div>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(196,169,107,0.1)",
              }}
            />
          </div>
        )}

        {/* NT label if present */}
        {hasNT && (
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(196,169,107,0.35)",
              fontFamily: "var(--font-ui, system-ui)",
              marginBottom: "16px",
            }}
          >
            New Testament
          </div>
        )}

        {/* Book cards — NT */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {visibleBooks
            .filter((b) => NT_BOOKS.includes(b.bookId))
            .map(({ bookId, status }, idx) => {
              const completed = progress.completedStops.filter((s) =>
                s.startsWith(bookId.slice(0, 3)),
              ).length;
              const total =
                (bookIndex.find((b) => b.book === bookId) || {}).eventCount ||
                1;
              const pct = isBookComplete(bookId) ? 1 : completed / total;

              return (
                <div
                  key={bookId}
                  style={{
                    animation: `cr-card-in 0.4s ease ${idx * 0.07}s both`,
                  }}
                >
                  <BookCard
                    bookId={bookId}
                    status={status}
                    percent={pct}
                    onTap={handleBookTap}
                  />
                </div>
              );
            })}
        </div>

        {/* Empty state — just started */}
        {visibleBooks.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: "60px" }}>
            <div
              style={{
                fontSize: "28px",
                color: "rgba(196,169,107,0.3)",
                marginBottom: "12px",
              }}
            >
              ✧
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(240,235,224,0.3)",
                fontFamily: "var(--font-ui, system-ui)",
              }}
            >
              Your pilgrimage begins in Genesis
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {lockedModal && (
        <LockedModal
          onClose={() => setLockedModal(null)}
          nextBookName={lockedModal}
        />
      )}

      {leaveModal && (
        <LeaveModal
          onConfirm={onBack}
          onCancel={() => setLeaveModal(false)}
          lastBook={readingContext?.book || "Genesis"}
          lastChapter={readingContext?.chapter || 1}
        />
      )}
    </div>
  );
}
