/**
 * ChristRevealedScreen.jsx
 * Christ Revealed pilgrimage hub — journey map redesign.
 *
 * Shows:
 *   1. Today's Session card (streak + current stop + CTA)
 *   2. Journey path — vertical road with nodes for each visible book
 *      completed = glowing gold dot | in-progress = pulsing ring | teaser = dimmed
 */

import { useState, useEffect } from "react";
import { OT_BOOKS, NT_BOOKS, ALL_BOOKS_IN_ORDER } from "./useCRProgress";

/* ── Book display names ── */
const DISPLAY_NAMES = {
  genesis: "Genesis", exodus: "Exodus", leviticus: "Leviticus",
  numbers: "Numbers", deuteronomy: "Deuteronomy", joshua: "Joshua",
  judges: "Judges", ruth: "Ruth", "1samuel": "1 Samuel", "2samuel": "2 Samuel",
  "1kings": "1 Kings", "2kings": "2 Kings", "1chronicles": "1 Chronicles",
  "2chronicles": "2 Chronicles", ezra: "Ezra", nehemiah: "Nehemiah",
  esther: "Esther", job: "Job", psalms: "Psalms", proverbs: "Proverbs",
  ecclesiastes: "Ecclesiastes", songofsolomon: "Song of Solomon",
  isaiah: "Isaiah", jeremiah: "Jeremiah", lamentations: "Lamentations",
  ezekiel: "Ezekiel", daniel: "Daniel", hosea: "Hosea", joel: "Joel",
  amos: "Amos", obadiah: "Obadiah", jonah: "Jonah", micah: "Micah",
  nahum: "Nahum", habakkuk: "Habakkuk", zephaniah: "Zephaniah",
  haggai: "Haggai", zechariah: "Zechariah", malachi: "Malachi",
  matthew: "Matthew", mark: "Mark", luke: "Luke", john: "John",
  acts: "Acts", romans: "Romans", "1corinthians": "1 Corinthians",
  "2corinthians": "2 Corinthians", galatians: "Galatians",
  ephesians: "Ephesians", philippians: "Philippians", colossians: "Colossians",
  "1thessalonians": "1 Thessalonians", "2thessalonians": "2 Thessalonians",
  "1timothy": "1 Timothy", "2timothy": "2 Timothy", titus: "Titus",
  philemon: "Philemon", hebrews: "Hebrews", james: "James",
  "1peter": "1 Peter", "2peter": "2 Peter", "1john": "1 John",
  "2john": "2 John", "3john": "3 John", jude: "Jude", revelation: "Revelation",
};

/* ── Streak helpers ── */
function getStreakData() {
  try {
    const lastDate = localStorage.getItem("cr_last_date");
    const count = parseInt(localStorage.getItem("cr_streak_count") || "0", 10);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (!lastDate) return { count: 0, readToday: false };
    if (lastDate === today) return { count, readToday: true };
    if (lastDate === yesterday) return { count, readToday: false };
    return { count: 0, readToday: false };
  } catch {
    return { count: 0, readToday: false };
  }
}

function recordCRRead() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = localStorage.getItem("cr_last_date");
    if (lastDate === today) return;
    const count = parseInt(localStorage.getItem("cr_streak_count") || "0", 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newCount = lastDate === yesterday ? count + 1 : 1;
    localStorage.setItem("cr_last_date", today);
    localStorage.setItem("cr_streak_count", String(newCount));
  } catch { /* ignore */ }
}

/* ── Today's Session card ── */
function TodayCard({ currentBookName, currentChapter, streak, readToday, onContinue }) {
  return (
    <div
      style={{
        margin: "0 0 32px",
        background: "rgba(196,169,107,0.05)",
        border: "1px solid rgba(196,169,107,0.2)",
        borderRadius: "18px",
        padding: "22px 20px 20px",
      }}
    >
      {/* Streak row */}
      {streak.count > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#C4A96B" }}>✦</span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#C4A96B",
              fontFamily: "var(--font-ui,system-ui)",
              letterSpacing: "0.04em",
            }}
          >
            {streak.count} day{streak.count !== 1 ? "s" : ""} in a row
          </span>
          {readToday && (
            <span
              style={{
                fontSize: "11px",
                color: "rgba(196,169,107,0.35)",
                fontFamily: "var(--font-ui,system-ui)",
              }}
            >
              · Read today
            </span>
          )}
        </div>
      )}

      {/* Label */}
      <div
        style={{
          fontSize: "10px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(196,169,107,0.38)",
          fontFamily: "var(--font-ui,system-ui)",
          marginBottom: "6px",
        }}
      >
        Today's Stop
      </div>

      {/* Book name */}
      <div
        style={{
          fontSize: "24px",
          fontWeight: 300,
          color: "#F0EBE0",
          fontFamily: "var(--font-ui,system-ui)",
          letterSpacing: "0.01em",
          lineHeight: 1.15,
          marginBottom: "4px",
        }}
      >
        {currentBookName}
      </div>

      {/* Chapter + duration */}
      <div
        style={{
          fontSize: "13px",
          color: "rgba(196,169,107,0.42)",
          fontFamily: "var(--font-ui,system-ui)",
          marginBottom: "20px",
        }}
      >
        Chapter {currentChapter} · ~10 min
      </div>

      {/* CTA button */}
      <button
        onClick={onContinue}
        style={{
          width: "100%",
          padding: "15px",
          borderRadius: "13px",
          background: "#C4A96B",
          border: "none",
          color: "#1A1510",
          fontSize: "14px",
          fontWeight: 700,
          fontFamily: "var(--font-ui,system-ui)",
          letterSpacing: "0.04em",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
          transition: "opacity 0.15s ease",
        }}
      >
        {readToday ? "Continue Reading" : "Begin Today's Reading"}
      </button>
    </div>
  );
}

/* ── Journey path node ── */
function PathNode({
  bookId,
  status,
  totalEvents,
  completedEvents,
  isLast,
  onTap,
}) {
  const displayName = DISPLAY_NAMES[bookId] || bookId;
  const complete = status === "complete";
  const inProg = status === "in-progress";
  const teaser = status === "teaser";

  const nodeSize = inProg ? 20 : 10;

  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {/* Left rail — node + connecting line */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "28px",
          flexShrink: 0,
        }}
      >
        {/* Node */}
        <div
          style={{
            width: nodeSize + "px",
            height: nodeSize + "px",
            borderRadius: "50%",
            marginTop: inProg ? "1px" : "5px",
            flexShrink: 0,
            background: complete
              ? "#C4A96B"
              : teaser
                ? "rgba(255,255,255,0.04)"
                : "transparent",
            border: complete
              ? "none"
              : inProg
                ? "2px solid #C4A96B"
                : "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: inProg ? "cr-node-pulse 2.8s ease-in-out infinite" : "none",
            boxSizing: "border-box",
          }}
        >
          {complete && (
            <span style={{ fontSize: "6px", color: "#1A1510", fontWeight: 800 }}>
              ✓
            </span>
          )}
          {inProg && (
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#C4A96B",
              }}
            />
          )}
        </div>

        {/* Connecting line below the node */}
        {!isLast && (
          <div
            style={{
              width: "1px",
              flex: 1,
              minHeight: inProg ? "36px" : "18px",
              marginTop: "4px",
              background: complete
                ? "rgba(196,169,107,0.38)"
                : inProg
                  ? "rgba(196,169,107,0.18)"
                  : "rgba(255,255,255,0.05)",
            }}
          />
        )}
      </div>

      {/* Right — book info */}
      <button
        onClick={() => !teaser && onTap(bookId, status)}
        disabled={teaser}
        style={{
          flex: 1,
          background: "none",
          border: "none",
          textAlign: "left",
          cursor: teaser ? "default" : "pointer",
          paddingLeft: "14px",
          paddingBottom: isLast ? "0" : inProg ? "28px" : "10px",
          WebkitTapHighlightColor: "transparent",
          opacity: teaser ? 0.22 : 1,
        }}
      >
        <div
          style={{
            fontSize: inProg ? "20px" : complete ? "15px" : "14px",
            fontWeight: inProg ? 300 : 300,
            letterSpacing: inProg ? "0.01em" : "0",
            color: complete
              ? "rgba(196,169,107,0.55)"
              : inProg
                ? "#F0EBE0"
                : "rgba(240,235,224,0.3)",
            fontFamily: "var(--font-ui,system-ui)",
            lineHeight: 1.2,
            marginTop: inProg ? "1px" : "4px",
          }}
        >
          {displayName}
          {complete && (
            <span
              style={{
                marginLeft: "7px",
                fontSize: "11px",
                color: "rgba(196,169,107,0.38)",
                fontWeight: 400,
              }}
            >
              Complete
            </span>
          )}
        </div>
        {inProg && totalEvents > 0 && (
          <div
            style={{
              fontSize: "12px",
              color: "rgba(196,169,107,0.35)",
              fontFamily: "var(--font-ui,system-ui)",
              marginTop: "4px",
              letterSpacing: "0.02em",
            }}
          >
            {completedEvents} of {totalEvents} events complete
          </div>
        )}
      </button>
    </div>
  );
}

/* ── Testament crossing divider ── */
function TestamentDivider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 0 22px",
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
          color: "rgba(196,169,107,0.22)",
          fontFamily: "var(--font-ui,system-ui)",
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
  );
}

/* ── Locked sheet ── */
function LockedModal({ onClose, nextBookName }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 80 }}
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
            width: 32,
            height: 3,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 2,
            margin: "0 auto 20px",
          }}
        />
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#F0EBE0",
            fontFamily: "var(--font-ui,system-ui)",
            margin: "0 0 8px",
          }}
        >
          {nextBookName} awaits
        </p>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: "rgba(240,235,224,0.45)",
            fontFamily: "var(--font-ui,system-ui)",
            margin: "0 0 20px",
          }}
        >
          Complete every stop in the current book to continue the journey into{" "}
          {nextBookName}.
        </p>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            background: "rgba(196,169,107,0.08)",
            border: "1px solid rgba(196,169,107,0.2)",
            color: "#C4A96B",
            fontSize: 14,
            fontFamily: "var(--font-ui,system-ui)",
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
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 80 }}
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
            width: 32,
            height: 3,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 2,
            margin: "0 auto 20px",
          }}
        />
        <p
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: "#F0EBE0",
            fontFamily: "var(--font-ui,system-ui)",
            margin: "0 0 8px",
            textAlign: "center",
          }}
        >
          Leave Christ Revealed?
        </p>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: "rgba(240,235,224,0.45)",
            fontFamily: "var(--font-ui,system-ui)",
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
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 12,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(240,235,224,0.5)",
              fontSize: 14,
              fontFamily: "var(--font-ui,system-ui)",
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
              padding: 14,
              borderRadius: 12,
              background: "#C4A96B",
              border: "none",
              color: "#1A1510",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--font-ui,system-ui)",
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
  bookIndex,
  readingContext,
}) {
  const [lockedModal, setLockedModal] = useState(null);
  const [leaveModal, setLeaveModal] = useState(false);
  const [streak, setStreak] = useState({ count: 0, readToday: false });

  useEffect(() => {
    setStreak(getStreakData());
  }, []);

  /* ── Determine which books to show ── */
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
        if (!teaserAdded && i + 1 < ALL_BOOKS_IN_ORDER.length) {
          visible.push({ bookId: ALL_BOOKS_IN_ORDER[i + 1], status: "teaser" });
          teaserAdded = true;
        }
        break;
      } else if (entry?.available && !teaserAdded) {
        visible.push({ bookId, status: "in-progress" });
        if (i + 1 < ALL_BOOKS_IN_ORDER.length) {
          visible.push({ bookId: ALL_BOOKS_IN_ORDER[i + 1], status: "teaser" });
          teaserAdded = true;
        }
        break;
      }
    }

    return visible;
  }

  const visibleBooks = getVisibleBooks();
  const currentBookId = progress.currentBook || "genesis";
  const currentChapter = progress.currentChapter || 1;
  const currentBookName = DISPLAY_NAMES[currentBookId] || currentBookId;

  function handleContinue() {
    recordCRRead();
    setStreak(getStreakData());
    onSelectBook(currentBookId);
  }

  function handleBookTap(bookId, status) {
    if (status === "teaser") {
      setLockedModal(DISPLAY_NAMES[bookId] || bookId);
      return;
    }
    onSelectBook(bookId);
  }

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
        @keyframes cr-node-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(196,169,107,0); }
          50%       { box-shadow: 0 0 0 7px rgba(196,169,107,0.10); }
        }
        @keyframes cr-card-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Header ── */}
      <div
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 16px)",
          paddingBottom: "16px",
          paddingLeft: "20px",
          paddingRight: "20px",
          background: "#0D0C09",
          borderBottom: "1px solid rgba(196,169,107,0.07)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setLeaveModal(true)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "rgba(196,169,107,0.55)",
            fontSize: 13,
            fontFamily: "var(--font-ui,system-ui)",
            WebkitTapHighlightColor: "transparent",
            padding: "4px 0",
            marginBottom: 14,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Leave Journey
        </button>

        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(196,169,107,0.35)",
            fontFamily: "var(--font-ui,system-ui)",
          }}
        >
          The Redemption Pilgrimage
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "24px 20px",
          paddingBottom: "max(56px, env(safe-area-inset-bottom))",
        }}
      >
        {/* Today's session */}
        <div style={{ animation: "cr-card-in 0.35s ease 0.05s both" }}>
          <TodayCard
            currentBookName={currentBookName}
            currentChapter={currentChapter}
            streak={streak}
            readToday={streak.readToday}
            onContinue={handleContinue}
          />
        </div>

        {/* Journey path label */}
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(196,169,107,0.28)",
            fontFamily: "var(--font-ui,system-ui)",
            marginBottom: "20px",
            animation: "cr-card-in 0.35s ease 0.12s both",
          }}
        >
          Your Journey
        </div>

        {/* Journey path */}
        <div style={{ animation: "cr-card-in 0.35s ease 0.18s both" }}>
          {visibleBooks.map(({ bookId, status }, idx) => {
            const isOT = OT_BOOKS.includes(bookId);
            const nextBook = visibleBooks[idx + 1];
            const crossingTestament =
              isOT && nextBook && NT_BOOKS.includes(nextBook.bookId);

            const bookEntry = bookIndex.find((b) => b.book === bookId) || {};
            const totalEvents = bookEntry.eventCount || 0;
            const prefix = bookId.slice(0, 3);
            const completedEvents = progress.completedStops.filter((s) =>
              s.startsWith(prefix),
            ).length;

            const isLast = !crossingTestament && idx === visibleBooks.length - 1;

            return (
              <div key={bookId}>
                <PathNode
                  bookId={bookId}
                  status={status}
                  totalEvents={totalEvents}
                  completedEvents={completedEvents}
                  isLast={isLast}
                  onTap={handleBookTap}
                />
                {crossingTestament && <TestamentDivider />}
              </div>
            );
          })}

        </div>

        {/* Empty state */}
        {visibleBooks.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div
              style={{
                fontSize: 28,
                color: "rgba(196,169,107,0.3)",
                marginBottom: 12,
              }}
            >
              ✧
            </div>
            <p
              style={{
                fontSize: 14,
                color: "rgba(240,235,224,0.3)",
                fontFamily: "var(--font-ui,system-ui)",
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
