/**
 * ChristRevealedBookSummary.jsx
 * Brief book intro screen shown when a user taps a book in the grid.
 * Shows: book name, testament, event count, current progress,
 * a short description, and a list of stops to navigate to.
 * Stops that are locked show as dimmed; completed show a checkmark.
 */

import { useState, useEffect } from "react";

/* One-line descriptions for each book */
const BOOK_SUMMARIES = {
  genesis:
    "Where the promise begins — creation, the fall, and the first covenant.",
  exodus: "God rescues his people and reveals the pattern of redemption.",
  leviticus:
    "The sacrificial system and priesthood that point to Christ's atonement.",
  numbers:
    "Forty years of wilderness testing — faithfulness and failure on the way.",
  deuteronomy: "Moses renews the covenant and foretells the prophet to come.",
  joshua: "The land promised is entered — a type of rest yet to be fully won.",
  judges:
    "The cycle of sin and rescue that reveals man's need for a true king.",
  ruth: "A foreign woman redeemed by a kinsman — a portrait of the gospel.",
  "1samuel": "The rise of the monarchy and the anointing of God's chosen king.",
  "2samuel": "David's covenant — a throne established forever.",
  "1kings":
    "The kingdom at its height, then the fracture that demands a greater king.",
  "2kings": "Exile — the consequence of covenant unfaithfulness.",
  "1chronicles": "The Davidic line preserved through catastrophe.",
  "2chronicles": "The temple, the glory, and the hope of return.",
  ezra: "Restoration from exile — the return to the land and the law.",
  nehemiah:
    "Rebuilding the walls — God's people reconstituted around his Word.",
  esther:
    "Providence in exile — the hidden hand of God protecting the lineage.",
  job: "Suffering, the accuser, and the Redeemer who lives.",
  psalms: "The prayers and praises of God's people — many fulfilled in Christ.",
  proverbs: "Wisdom embodied — pointing to the one who is Wisdom incarnate.",
  ecclesiastes: "The vanity of life under the sun without the one above it.",
  songofsolomon:
    "The love of the bridegroom — a picture of Christ and his church.",
  isaiah:
    "The suffering servant and the coming king — the gospel before the gospel.",
  jeremiah: "The new covenant promised in the ashes of the old.",
  lamentations: "The desolation that makes way for mercy.",
  ezekiel: "The valley of dry bones — death and the breath of God.",
  daniel:
    "The Ancient of Days and the Son of Man who receives an eternal kingdom.",
  hosea: "God's relentless love for an unfaithful people.",
  joel: "The outpouring of the Spirit in the last days.",
  amos: "Justice and the coming day of the Lord.",
  obadiah: "The pride of nations judged; the kingdom belongs to the LORD.",
  jonah: "Three days in the deep — the sign of death and resurrection.",
  micah: "Bethlehem named — the ruler of Israel born of eternity.",
  nahum: "The fall of the oppressor and the good news of peace.",
  habakkuk: "The just shall live by faith — waiting for the vision.",
  zephaniah: "The day of the LORD and the song of joy that follows.",
  haggai: "The greater glory of the second temple.",
  zechariah: "The king comes on a donkey; the pierced one is mourned.",
  malachi:
    "The messenger who prepares the way — the final word before silence.",
  matthew: "The king has come — fulfillment of the law and the prophets.",
  mark: "The servant who gives his life as a ransom for many.",
  luke: "The Son of Man seeks and saves the lost.",
  john: "The Word made flesh — seven signs, seven I AM statements.",
  acts: "The Spirit poured out — the mission begun.",
  romans: "The righteousness of God revealed in the gospel.",
  "1corinthians": "The cross as wisdom and power; the body of Christ.",
  "2corinthians": "The glory of the new covenant ministry.",
  galatians: "Freedom from the law — justification by faith alone.",
  ephesians: "Every spiritual blessing in the heavenly places in Christ.",
  philippians: "The mind of Christ — humility, exaltation, joy.",
  colossians:
    "Christ as the fullness of God — head of all creation and the church.",
  "1thessalonians": "The return of the Lord and the resurrection hope.",
  "2thessalonians": "The man of lawlessness and the faithfulness of God.",
  "1timothy": "Sound doctrine and the mystery of godliness.",
  "2timothy": "Fight the good fight — the faithful word endures.",
  titus: "Grace that trains us to live rightly.",
  philemon: "A slave received back as a brother — the gospel in miniature.",
  hebrews: "Christ as the fulfillment of every shadow in the old covenant.",
  james: "Faith that works — wisdom from above.",
  "1peter": "Chosen, holy, suffering, and hopeful.",
  "2peter": "The transfigured Lord and the day that is coming.",
  "1john": "God is light, God is love — walking in his life.",
  "2john": "Truth and love — walking in the commandments.",
  "3john": "Hospitality and the faithful witness.",
  jude: "Contend for the faith once delivered to the saints.",
  revelation: "The Lamb who was slain reigns — all things made new.",
};

export default function ChristRevealedBookSummary({
  bookId,
  bookData,
  progress,
  isStopComplete,
  onBack,
  onSelectStop,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!bookData) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          background: "#0D0C09",
        }}
      >
        <div
          style={{
            color: "rgba(240,235,224,0.3)",
            fontFamily: "var(--font-ui, system-ui)",
            fontSize: "14px",
          }}
        >
          Loading…
        </div>
      </div>
    );
  }

  const events = bookData.events || [];
  const completedCount = events.filter((e) => isStopComplete(e.id)).length;
  const totalCount = events.length;
  const summary = BOOK_SUMMARIES[bookId] || "A sacred stop on the pilgrimage.";

  // Find the first incomplete stop
  const nextStopIdx = events.findIndex((e) => !isStopComplete(e.id));

  function getStopStatus(idx) {
    const e = events[idx];
    if (isStopComplete(e.id)) return "complete";
    if (idx === 0) return "available";
    // Available if previous stop is complete
    const prev = events[idx - 1];
    if (isStopComplete(prev.id)) return "available";
    return "locked";
  }

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0D0C09",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes cr-stop-in {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* ── Header ── */}
      <div
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 16px)",
          paddingBottom: "20px",
          paddingLeft: "20px",
          paddingRight: "20px",
          borderBottom: "1px solid rgba(196,169,107,0.1)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "rgba(196,169,107,0.7)",
            fontSize: "13px",
            fontFamily: "var(--font-ui, system-ui)",
            WebkitTapHighlightColor: "transparent",
            padding: "4px 0",
            marginBottom: "16px",
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
          All Books
        </button>

        {/* Book name + testament badge */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "300",
              color: "#F0EBE0",
              fontFamily: "var(--font-ui, system-ui)",
              letterSpacing: "0.02em",
              margin: 0,
            }}
          >
            {bookData.displayName}
          </h1>
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(196,169,107,0.6)",
              fontFamily: "var(--font-ui, system-ui)",
              background: "rgba(196,169,107,0.08)",
              border: "1px solid rgba(196,169,107,0.15)",
              borderRadius: "20px",
              padding: "4px 10px",
              marginTop: "4px",
            }}
          >
            {bookData.testament === "OT" ? "Old Testament" : "New Testament"}
          </span>
        </div>

        {/* One-line summary */}
        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.6,
            color: "rgba(240,235,224,0.45)",
            fontFamily: "var(--font-ui, system-ui)",
            fontStyle: "italic",
            margin: "0 0 14px",
          }}
        >
          {summary}
        </p>

        {/* Progress row */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              flex: 1,
              height: "3px",
              background: "rgba(196,169,107,0.1)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width:
                  totalCount > 0
                    ? `${(completedCount / totalCount) * 100}%`
                    : "0%",
                background: "#C4A96B",
                borderRadius: "2px",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "11px",
              color: "rgba(196,169,107,0.5)",
              fontFamily: "var(--font-ui, system-ui)",
              whiteSpace: "nowrap",
            }}
          >
            {completedCount} / {totalCount} stops
          </span>
        </div>
      </div>

      {/* ── Stop list ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "20px",
          paddingBottom: "max(40px, env(safe-area-inset-bottom))",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(196,169,107,0.4)",
            fontFamily: "var(--font-ui, system-ui)",
            marginBottom: "14px",
          }}
        >
          Stops in this book
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {events.map((event, idx) => {
            const status = getStopStatus(idx);
            const isNext = idx === nextStopIdx;

            return (
              <button
                key={event.id}
                onClick={() => status !== "locked" && onSelectStop(event.id)}
                style={{
                  background:
                    status === "complete"
                      ? "rgba(196,169,107,0.07)"
                      : isNext
                        ? "rgba(196,169,107,0.1)"
                        : "rgba(255,255,255,0.02)",
                  border:
                    status === "complete"
                      ? "1px solid rgba(196,169,107,0.2)"
                      : isNext
                        ? "1px solid rgba(196,169,107,0.3)"
                        : "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  textAlign: "left",
                  cursor: status === "locked" ? "default" : "pointer",
                  opacity: status === "locked" ? 0.35 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  WebkitTapHighlightColor: "transparent",
                  animation: `cr-stop-in 0.4s ease ${idx * 0.06}s both`,
                }}
              >
                {/* Status icon */}
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background:
                      status === "complete"
                        ? "rgba(196,169,107,0.15)"
                        : isNext
                          ? "rgba(196,169,107,0.12)"
                          : "rgba(255,255,255,0.04)",
                    border:
                      status === "complete"
                        ? "1px solid rgba(196,169,107,0.4)"
                        : isNext
                          ? "1px solid rgba(196,169,107,0.3)"
                          : "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "12px",
                    color:
                      status === "complete"
                        ? "#C4A96B"
                        : isNext
                          ? "rgba(196,169,107,0.8)"
                          : "rgba(255,255,255,0.2)",
                  }}
                >
                  {status === "complete" ? "✓" : isNext ? "›" : "⚬"}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color:
                        status === "complete"
                          ? "rgba(240,235,224,0.6)"
                          : isNext
                            ? "#F0EBE0"
                            : "rgba(240,235,224,0.35)",
                      fontFamily: "var(--font-ui, system-ui)",
                      lineHeight: 1.3,
                      marginBottom: "3px",
                    }}
                  >
                    {event.title}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(196,169,107,0.4)",
                      fontFamily: "var(--font-ui, system-ui)",
                    }}
                  >
                    {status === "complete"
                      ? "Completed"
                      : isNext
                        ? "Continue here"
                        : `Chapters ${event.chapters.join(", ")}`}
                  </div>
                </div>

                {/* Chevron */}
                {status !== "locked" && (
                  <span
                    style={{
                      fontSize: "14px",
                      color: "rgba(196,169,107,0.3)",
                      flexShrink: 0,
                    }}
                  >
                    →
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
