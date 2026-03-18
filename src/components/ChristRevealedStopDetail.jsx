/**
 * ChristRevealedStopDetail.jsx
 * Full stop reader for a single event in the pilgrimage.
 *
 * Four accordion sections:
 *   1. Christ Revealed     — observations from Scripture
 *   2. Enemy Opposition    — thematic patterns
 *   3. Cross References    — tappable, navigates to Bible reader
 *   4. Reflection          — question + reflectionClose
 *
 * Mark Complete button at the bottom unlocks the next stop.
 * All section labels come from bookData.meta.sectionLabels.
 */

import { useState, useEffect } from "react";

const SECTION_KEYS = [
  "christRevealed",
  "enemyOpposition",
  "crossReferences",
  "reflection",
];

const DEFAULT_LABELS = {
  christRevealed: "Observation from Scripture",
  enemyOpposition: "Thematic pattern observed in the text",
  crossReferences: "Passages to read and weigh yourself",
  reflection: "A question to bring to Scripture and prayer",
};

const SECTION_ICONS = {
  christRevealed: "✦",
  enemyOpposition: "◈",
  crossReferences: "⊕",
  reflection: "◇",
};

/* ── Accordion section ── */
function AccordionSection({
  sectionKey,
  label,
  icon,
  children,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(196,169,107,0.1)",
        borderRadius: "14px",
        overflow: "hidden",
        marginBottom: "10px",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          padding: "16px",
          background: open ? "rgba(196,169,107,0.07)" : "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          textAlign: "left",
          WebkitTapHighlightColor: "transparent",
          transition: "background 0.15s ease",
        }}
      >
        <span style={{ fontSize: "13px", color: "#C4A96B", flexShrink: 0 }}>
          {icon}
        </span>
        <span
          style={{
            flex: 1,
            fontSize: "13px",
            fontWeight: "500",
            color: open ? "#F0EBE0" : "rgba(240,235,224,0.6)",
            fontFamily: "var(--font-ui, system-ui)",
            letterSpacing: "0.02em",
            transition: "color 0.15s ease",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: "10px",
            color: "rgba(196,169,107,0.45)",
            flexShrink: 0,
            display: "inline-block",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          ▾
        </span>
      </button>

      {/* Body */}
      {open && (
        <div
          style={{
            padding: "0 16px 16px",
            borderTop: "1px solid rgba(196,169,107,0.08)",
          }}
        >
          <div style={{ paddingTop: "14px" }}>{children}</div>
        </div>
      )}
    </div>
  );
}

/* ── Bullet item ── */
function BulletItem({ text }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "12px",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "4px",
          height: "4px",
          borderRadius: "50%",
          background: "#C4A96B",
          flexShrink: 0,
          marginTop: "8px",
          opacity: 0.7,
        }}
      />
      <p
        style={{
          fontSize: "14px",
          lineHeight: 1.7,
          color: "rgba(240,235,224,0.75)",
          fontFamily: "var(--font-body, Georgia, serif)",
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}

/* ── Cross reference item ── */
function CrossRefItem({ reference, note, onNavigate }) {
  return (
    <button
      onClick={() => onNavigate && onNavigate(reference)}
      style={{
        width: "100%",
        textAlign: "left",
        background: "rgba(196,169,107,0.04)",
        border: "1px solid rgba(196,169,107,0.12)",
        borderRadius: "10px",
        padding: "12px 14px",
        marginBottom: "8px",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
      }}
    >
      <div style={{ flexShrink: 0, marginTop: "2px" }}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C4A96B"
          strokeWidth="2"
          opacity="0.6"
        >
          <path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z" />
          <path d="M17 4h3v16h-3" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#C4A96B",
            fontFamily: "var(--font-ui, system-ui)",
            marginBottom: "4px",
          }}
        >
          {reference}
        </div>
        <div
          style={{
            fontSize: "12px",
            lineHeight: 1.55,
            color: "rgba(240,235,224,0.45)",
            fontFamily: "var(--font-ui, system-ui)",
            fontStyle: "italic",
          }}
        >
          {note}
        </div>
      </div>
      <span
        style={{
          fontSize: "12px",
          color: "rgba(196,169,107,0.3)",
          flexShrink: 0,
        }}
      >
        →
      </span>
    </button>
  );
}

/* ════════════════════════════════
   Main component
════════════════════════════════ */
export default function ChristRevealedStopDetail({
  event,
  bookData,
  isComplete,
  onBack,
  onMarkComplete,
  onNavigateToBible,
}) {
  const [visible, setVisible] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!event || !bookData) return null;

  const meta = bookData.meta || {};
  const labels = meta.sectionLabels || DEFAULT_LABELS;
  const reflectionClose =
    meta.reflectionClose ||
    "Take this question to the text. Take it to God in prayer. He is the one who reveals.";
  const studyNotice =
    meta.studyToolNotice ||
    "These observations are a study guide, not Scripture. The Holy Spirit — not this tool — is the teacher.";

  const chapterLabel =
    event.chapters.length === 1
      ? `Chapter ${event.chapters[0]}`
      : `Chapters ${event.chapters[0]}–${event.chapters[event.chapters.length - 1]}`;

  async function handleMarkComplete() {
    setMarking(true);
    await new Promise((r) => setTimeout(r, 300));
    onMarkComplete();
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
      {/* ── Fixed header ── */}
      <div
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 16px)",
          paddingBottom: "16px",
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
            marginBottom: "14px",
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
          {bookData.displayName}
        </button>

        {/* Stop meta */}
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(196,169,107,0.5)",
            fontFamily: "var(--font-ui, system-ui)",
            marginBottom: "6px",
          }}
        >
          {bookData.displayName} · {chapterLabel}
        </div>

        <h1
          style={{
            fontSize: "20px",
            fontWeight: "400",
            color: "#F0EBE0",
            fontFamily: "var(--font-ui, system-ui)",
            lineHeight: 1.3,
            margin: 0,
          }}
        >
          {event.title}
        </h1>

        {/* Completed badge */}
        {isComplete && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              marginTop: "8px",
              background: "rgba(196,169,107,0.08)",
              border: "1px solid rgba(196,169,107,0.2)",
              borderRadius: "20px",
              padding: "3px 10px",
            }}
          >
            <span style={{ fontSize: "11px", color: "#C4A96B" }}>✓</span>
            <span
              style={{
                fontSize: "11px",
                color: "rgba(196,169,107,0.7)",
                fontFamily: "var(--font-ui, system-ui)",
              }}
            >
              Completed
            </span>
          </div>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "20px",
          paddingBottom:
            "max(120px, calc(100px + env(safe-area-inset-bottom)))",
        }}
      >
        {/* Study tool notice */}
        <div
          style={{
            background: "rgba(196,169,107,0.04)",
            border: "1px solid rgba(196,169,107,0.1)",
            borderRadius: "10px",
            padding: "10px 14px",
            marginBottom: "18px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              lineHeight: 1.55,
              color: "rgba(240,235,224,0.35)",
              fontFamily: "var(--font-ui, system-ui)",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            {studyNotice}
          </p>
        </div>

        {/* Section 1 — Christ Revealed */}
        <AccordionSection
          sectionKey="christRevealed"
          label={labels.christRevealed}
          icon={SECTION_ICONS.christRevealed}
          defaultOpen={true}
        >
          {(event.christRevealed || []).map((text, i) => (
            <BulletItem key={i} text={text} />
          ))}
        </AccordionSection>

        {/* Section 2 — Enemy Opposition */}
        <AccordionSection
          sectionKey="enemyOpposition"
          label={labels.enemyOpposition}
          icon={SECTION_ICONS.enemyOpposition}
        >
          {(event.enemyOpposition || []).map((text, i) => (
            <BulletItem key={i} text={text} />
          ))}
        </AccordionSection>

        {/* Section 3 — Cross References */}
        <AccordionSection
          sectionKey="crossReferences"
          label={labels.crossReferences}
          icon={SECTION_ICONS.crossReferences}
        >
          {(event.crossReferences || []).map((ref, i) => (
            <CrossRefItem
              key={i}
              reference={ref.reference}
              note={ref.note}
              onNavigate={onNavigateToBible}
            />
          ))}
        </AccordionSection>

        {/* Section 4 — Reflection */}
        <AccordionSection
          sectionKey="reflection"
          label={labels.reflection}
          icon={SECTION_ICONS.reflection}
        >
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.75,
              color: "rgba(240,235,224,0.8)",
              fontFamily: "var(--font-body, Georgia, serif)",
              fontStyle: "italic",
              margin: "0 0 14px",
            }}
          >
            {event.reflection}
          </p>
          <p
            style={{
              fontSize: "12px",
              lineHeight: 1.6,
              color: "rgba(196,169,107,0.5)",
              fontFamily: "var(--font-ui, system-ui)",
              margin: 0,
              borderTop: "1px solid rgba(196,169,107,0.1)",
              paddingTop: "12px",
            }}
          >
            {reflectionClose}
          </p>
        </AccordionSection>
      </div>

      {/* ── Fixed bottom bar ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 20px",
          paddingBottom: "max(20px, env(safe-area-inset-bottom))",
          background: "linear-gradient(to top, #0D0C09 70%, transparent)",
          borderTop: "1px solid rgba(196,169,107,0.08)",
        }}
      >
        {isComplete ? (
          <div
            style={{
              textAlign: "center",
              padding: "14px",
              borderRadius: "14px",
              background: "rgba(196,169,107,0.06)",
              border: "1px solid rgba(196,169,107,0.18)",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: "rgba(196,169,107,0.6)",
                fontFamily: "var(--font-ui, system-ui)",
              }}
            >
              ✓ Stop completed — press Back to continue
            </span>
          </div>
        ) : (
          <button
            onClick={handleMarkComplete}
            disabled={marking}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              background: marking ? "rgba(196,169,107,0.4)" : "#C4A96B",
              border: "none",
              cursor: marking ? "default" : "pointer",
              fontFamily: "var(--font-ui, system-ui)",
              fontSize: "15px",
              fontWeight: "600",
              letterSpacing: "0.04em",
              color: "#1A1510",
              WebkitTapHighlightColor: "transparent",
              transition: "background 0.2s ease",
            }}
          >
            {marking ? "Saving…" : "Mark Complete"}
          </button>
        )}
      </div>
    </div>
  );
}
