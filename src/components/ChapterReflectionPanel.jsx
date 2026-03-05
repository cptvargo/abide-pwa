/**
 * ChapterReflectionPanel.jsx
 * Premium chapter reflection panel for ABIDE
 * Sacred, contemplative — like opening an illuminated manuscript
 * Tabs: Reflection | Cross References
 */

import { useEffect, useRef, useState } from "react";

/* ── Cross-reference loader ────────────────────────────────────── */
function toBookSlug(displayName) {
  return displayName.toLowerCase().replace(/\s+/g, "");
}

async function loadCrossRefs(book, chapter) {
  const slug = toBookSlug(book);
  const base = import.meta.env.BASE_URL;
  const url = `${base}data/cross-references/${slug}/${chapter}.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/* ── Verse text loader ─────────────────────────────────────────── */
async function loadVerseText(bookSlug, chapter, verse, translation) {
  const base = import.meta.env.BASE_URL;
  const url = `${base}data/translations/${translation.toLowerCase()}/${bookSlug}/${chapter}.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    // Structure: { book, chapter, translation, title, verses: { "1": "text", ... } }
    return data.verses?.[String(verse)] ?? null;
  } catch {
    return null;
  }
}

/* ── Ref display formatter ─────────────────────────────────────── */
const DISPLAY_NAMES = {
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
  "1john": "1 John",
  "2john": "2 John",
  "3john": "3 John",
  songofsolomon: "Song of Solomon",
};

function formatRefDisplay(ref) {
  const spaceIdx = ref.indexOf(" ");
  if (spaceIdx === -1) return ref;
  const slug = ref.slice(0, spaceIdx);
  const location = ref.slice(spaceIdx + 1);
  const displayBook =
    DISPLAY_NAMES[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
  return `${displayBook} ${location}`;
}

/* ── Parse ref into parts ──────────────────────────────────────── */
function parseRef(ref) {
  const spaceIdx = ref.indexOf(" ");
  if (spaceIdx === -1) return null;
  const bookSlug = ref.slice(0, spaceIdx);
  const location = ref.slice(spaceIdx + 1);
  const [chapterStr, verseStr] = location.split(":");
  const chapter = parseInt(chapterStr);
  // verse may be a range like "1-3" — take the first
  const verse = verseStr ? parseInt(verseStr.split("-")[0]) : 1;
  return { bookSlug, chapter, verse };
}

/* ── Inline Verse Preview ──────────────────────────────────────── */
function VersePreview({ ref, translation, onNavigate, onClose }) {
  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(true);
  const parsed = parseRef(ref);
  const displayRef = formatRefDisplay(ref);
  const displayBook = parsed
    ? DISPLAY_NAMES[parsed.bookSlug] ||
      parsed.bookSlug.charAt(0).toUpperCase() + parsed.bookSlug.slice(1)
    : "";

  useEffect(() => {
    if (!parsed) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadVerseText(
      parsed.bookSlug,
      parsed.chapter,
      parsed.verse,
      translation,
    ).then((t) => {
      setText(t);
      setLoading(false);
    });
  }, [ref, translation]);

  return (
    <div
      style={{
        marginTop: "10px",
        background: "rgba(var(--accent-rgb,203,178,124),0.06)",
        border: "1px solid rgba(var(--accent-rgb,203,178,124),0.14)",
        borderRadius: "12px",
        padding: "14px 16px",
        position: "relative",
      }}
    >
      {/* Close X */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "rgba(var(--accent-rgb,203,178,124),0.45)",
          fontSize: "13px",
          lineHeight: 1,
          padding: "2px",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        ✕
      </button>

      {loading ? (
        <div
          style={{
            fontFamily: "var(--font-ui, system-ui)",
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "rgba(var(--accent-rgb,203,178,124),0.4)",
            padding: "4px 0",
          }}
        >
          Loading…
        </div>
      ) : text ? (
        <>
          {/* Verse text */}
          <p
            style={{
              fontFamily: "var(--font-body, Georgia, serif)",
              fontSize: "14px",
              lineHeight: "1.7",
              color: "var(--text-primary, #f0ebe0)",
              opacity: 0.88,
              margin: "0 0 12px",
              paddingRight: "16px",
            }}
          >
            {text}
          </p>

          {/* Navigate button */}
          <button
            onClick={() => onNavigate(parsed.bookSlug, parsed.chapter)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0",
              fontFamily: "var(--font-ui, system-ui)",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(var(--accent-rgb,203,178,124),0.7)",
              WebkitTapHighlightColor: "transparent",
              transition: "opacity 0.15s",
            }}
          >
            Go to {displayBook} {parsed.chapter}
            <svg
              viewBox="0 0 24 24"
              style={{
                width: "12px",
                height: "12px",
                stroke: "currentColor",
                fill: "none",
                strokeWidth: "2.5",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </>
      ) : (
        <>
          {/* Fallback — no text but still allow navigation */}
          <p
            style={{
              fontFamily: "var(--font-ui, system-ui)",
              fontSize: "11px",
              letterSpacing: "0.04em",
              color: "rgba(var(--accent-rgb,203,178,124),0.4)",
              margin: "0 0 12px",
            }}
          >
            {displayRef}
          </p>
          <button
            onClick={() => onNavigate(parsed.bookSlug, parsed.chapter)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0",
              fontFamily: "var(--font-ui, system-ui)",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(var(--accent-rgb,203,178,124),0.7)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Go to {displayBook} {parsed.chapter}
            <svg
              viewBox="0 0 24 24"
              style={{
                width: "12px",
                height: "12px",
                stroke: "currentColor",
                fill: "none",
                strokeWidth: "2.5",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════════════════ */
export default function ChapterReflectionPanel({
  open,
  onClose,
  book,
  chapter,
  summary,
  onNavigate,
  translation = "VSV",
}) {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [activeTab, setActiveTab] = useState("reflection");
  const [crossRefs, setCrossRefs] = useState(null);
  const [refsLoading, setRefsLoading] = useState(false);
  const [expandedRef, setExpandedRef] = useState(null); // "bookslug chapter:verse"
  const panelRef = useRef(null);

  /* ── Orchestrated entrance ─────────────────────────────── */
  useEffect(() => {
    if (open) {
      setVisible(true);
      setActiveTab("reflection");
      setExpandedRef(null);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true));
      });
      document.body.style.overflow = "hidden";
    } else {
      setAnimateIn(false);
      const t = setTimeout(() => {
        setVisible(false);
        document.body.style.overflow = "";
        setCrossRefs(null);
        setExpandedRef(null);
      }, 420);
      return () => clearTimeout(t);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* ── Load cross-refs when tab is activated ─────────────── */
  useEffect(() => {
    if (activeTab !== "crossrefs" || crossRefs !== null) return;
    setRefsLoading(true);
    loadCrossRefs(book, chapter).then((data) => {
      setCrossRefs(data || {});
      setRefsLoading(false);
    });
  }, [activeTab, book, chapter, crossRefs]);

  /* ── Reset when book/chapter changes ──────────────────── */
  useEffect(() => {
    setCrossRefs(null);
    setExpandedRef(null);
  }, [book, chapter]);

  function handleRefClick(ref) {
    setExpandedRef((prev) => (prev === ref ? null : ref));
  }

  if (!visible) return null;

  const paragraphs =
    typeof summary === "string"
      ? summary.split(/\n+/).filter(Boolean)
      : [summary];

  const refEntries = crossRefs ? Object.entries(crossRefs) : [];
  const totalRefs = refEntries.reduce((acc, [, refs]) => acc + refs.length, 0);

  return (
    <>
      <style>{`
        @keyframes crp-backdrop-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes crp-backdrop-out { from { opacity: 1 } to { opacity: 0 } }
        @keyframes crp-panel-in  { from { transform: translateY(100%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes crp-panel-out { from { transform: translateY(0); opacity: 1 } to { transform: translateY(100%); opacity: 0 } }
        @keyframes crp-rule-expand { from { transform: scaleX(0); opacity: 0 } to { transform: scaleX(1); opacity: 1 } }
        @keyframes crp-fade-up { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes crp-glow-pulse { 0%, 100% { opacity: 0.4 } 50% { opacity: 0.75 } }

        .crp-backdrop { animation: ${animateIn ? "crp-backdrop-in 0.35s ease forwards" : "crp-backdrop-out 0.42s ease forwards"}; }
        .crp-panel    { animation: ${animateIn ? "crp-panel-in 0.42s cubic-bezier(0.22,1,0.36,1) forwards" : "crp-panel-out 0.38s cubic-bezier(0.55,0,1,0.45) forwards"}; }
        .crp-rule     { animation: crp-rule-expand 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both; transform-origin: center; }
        .crp-header   { animation: crp-fade-up 0.5s ease 0.2s both; }
        .crp-body     { animation: crp-fade-up 0.5s ease 0.35s both; }
        .crp-footer   { animation: crp-fade-up 0.4s ease 0.5s both; }
        .crp-glow     { animation: crp-glow-pulse 4s ease-in-out infinite; }

        .crp-scroll::-webkit-scrollbar { display: none }
        .crp-scroll { -ms-overflow-style: none; scrollbar-width: none }

        .crp-close-btn { transition: opacity 0.2s, transform 0.2s; opacity: 0.35; }
        .crp-close-btn:hover  { opacity: 0.8; transform: scale(1.1); }
        .crp-close-btn:active { transform: scale(0.93); }

        .crp-tab {
          flex: 1;
          padding: 8px 0;
          font-family: var(--font-ui, system-ui);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: none;
          background: none;
          cursor: pointer;
          transition: color 0.2s, opacity 0.2s;
          position: relative;
          -webkit-tap-highlight-color: transparent;
        }
        .crp-tab-active {
          color: rgba(var(--accent-rgb, 203,178,124), 1) !important;
          opacity: 1 !important;
        }
        .crp-tab-active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 16%;
          right: 16%;
          height: 1px;
          background: rgba(var(--accent-rgb, 203,178,124), 0.7);
          border-radius: 100px;
        }
        .crp-ref-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          padding: 9px 0;
          border-bottom: 1px solid rgba(var(--accent-rgb, 203,178,124), 0.07);
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .crp-ref-row:hover { opacity: 0.7; }
        .crp-ref-row:last-child { border-bottom: none; }
        .crp-ref-row-expanded { border-bottom: none; }
      `}</style>

      {/* ── Backdrop ──────────────────────────────────────────── */}
      <div
        className="crp-backdrop"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(0,0,0,0.82)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      {/* ── Panel ─────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        className="crp-panel crp-scroll"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 51,
          maxHeight: "88vh",
          overflowY: "auto",
          background: "var(--bg-menu, #141410)",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          paddingBottom: "env(safe-area-inset-bottom, 24px)",
          boxShadow:
            "0 -8px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(var(--accent-rgb,203,178,124),0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glow */}
        <div
          className="crp-glow"
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "60%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(var(--accent-rgb,203,178,124),0.9), transparent)",
            borderRadius: "100%",
            filter: "blur(2px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "40%",
            height: "80px",
            background:
              "radial-gradient(ellipse at top, rgba(var(--accent-rgb,203,178,124),0.07), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ padding: "0 24px 32px", position: "relative" }}>
          {/* Grab handle + close */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: "14px",
              marginBottom: "24px",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "3px",
                width: "36px",
                borderRadius: "100px",
                background: "rgba(var(--accent-rgb,203,178,124),0.25)",
              }}
            />
            <button
              className="crp-close-btn"
              onClick={onClose}
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                color: "var(--text-primary, #f0ebe0)",
                fontSize: "18px",
                lineHeight: 1,
                WebkitTapHighlightColor: "transparent",
              }}
              aria-label="Close reflection"
            >
              ✕
            </button>
          </div>

          {/* ── Header ─────────────────────────────────────────── */}
          <div
            className="crp-header"
            style={{ textAlign: "center", marginBottom: "24px" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(var(--accent-rgb,203,178,124),0.08)",
                border: "1px solid rgba(var(--accent-rgb,203,178,124),0.15)",
                borderRadius: "100px",
                padding: "4px 12px 4px 10px",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "rgba(var(--accent-rgb,203,178,124),1)",
                }}
              >
                ✦
              </span>
              <span
                style={{
                  fontFamily: "var(--font-ui, system-ui)",
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(var(--accent-rgb,203,178,124),0.8)",
                }}
              >
                Study
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-ui, system-ui)",
                fontSize: "26px",
                fontWeight: "300",
                letterSpacing: "0.04em",
                color: "var(--text-primary, #f0ebe0)",
                lineHeight: 1.2,
                marginBottom: "4px",
              }}
            >
              {book}
            </div>
            <div
              style={{
                fontFamily: "var(--font-ui, system-ui)",
                fontSize: "13px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(var(--accent-rgb,203,178,124),0.7)",
              }}
            >
              Chapter {chapter}
            </div>
          </div>

          {/* ── Tab bar ────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              borderBottom:
                "1px solid rgba(var(--accent-rgb,203,178,124),0.12)",
              marginBottom: "28px",
            }}
          >
            <button
              className={`crp-tab ${activeTab === "reflection" ? "crp-tab-active" : ""}`}
              onClick={() => setActiveTab("reflection")}
              style={{
                color:
                  activeTab === "reflection"
                    ? undefined
                    : "rgba(var(--accent-rgb,203,178,124),0.4)",
              }}
            >
              Reflection
            </button>
            <button
              className={`crp-tab ${activeTab === "crossrefs" ? "crp-tab-active" : ""}`}
              onClick={() => setActiveTab("crossrefs")}
              style={{
                color:
                  activeTab === "crossrefs"
                    ? undefined
                    : "rgba(var(--accent-rgb,203,178,124),0.4)",
              }}
            >
              Cross References
            </button>
          </div>

          {/* ── Reflection tab ─────────────────────────────────── */}
          {activeTab === "reflection" && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "28px",
                }}
              >
                <div
                  className="crp-rule"
                  style={{
                    flex: 1,
                    height: "1px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(var(--accent-rgb,203,178,124),0.3))",
                  }}
                />
                <div
                  style={{
                    fontSize: "14px",
                    color: "rgba(var(--accent-rgb,203,178,124),0.5)",
                    flexShrink: 0,
                  }}
                >
                  ✦
                </div>
                <div
                  className="crp-rule"
                  style={{
                    flex: 1,
                    height: "1px",
                    background:
                      "linear-gradient(90deg, rgba(var(--accent-rgb,203,178,124),0.3), transparent)",
                  }}
                />
              </div>

              <div
                className="crp-body"
                style={{ maxWidth: "560px", margin: "0 auto" }}
              >
                {paragraphs.map((para, i) => (
                  <p
                    key={i}
                    style={{
                      fontFamily: "var(--font-body, Georgia, serif)",
                      fontSize: "16px",
                      lineHeight: "1.85",
                      color: "var(--text-primary, #f0ebe0)",
                      opacity: 0.88,
                      margin: i < paragraphs.length - 1 ? "0 0 20px" : 0,
                      textAlign: "left",
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>

              <div className="crp-footer" style={{ marginTop: "36px" }}>
                <div
                  style={{
                    height: "1px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(var(--accent-rgb,203,178,124),0.12), transparent)",
                    marginBottom: "16px",
                  }}
                />
                <p
                  style={{
                    fontFamily: "var(--font-ui, system-ui)",
                    fontSize: "11px",
                    lineHeight: "1.6",
                    letterSpacing: "0.02em",
                    color: "var(--text-primary, #f0ebe0)",
                    opacity: 0.3,
                    textAlign: "center",
                    maxWidth: "340px",
                    margin: "0 auto",
                  }}
                >
                  AI-assisted reflection provided as a reading aid. Scripture
                  itself remains the final authority.
                </p>
              </div>
            </>
          )}

          {/* ── Cross References tab ───────────────────────────── */}
          {activeTab === "crossrefs" && (
            <div
              className="crp-body"
              style={{ maxWidth: "560px", margin: "0 auto" }}
            >
              {refsLoading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: "rgba(var(--accent-rgb,203,178,124),0.4)",
                    fontFamily: "var(--font-ui, system-ui)",
                    fontSize: "12px",
                    letterSpacing: "0.1em",
                  }}
                >
                  Loading references…
                </div>
              ) : refEntries.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: "rgba(var(--accent-rgb,203,178,124),0.35)",
                    fontFamily: "var(--font-ui, system-ui)",
                    fontSize: "12px",
                    letterSpacing: "0.06em",
                  }}
                >
                  No cross-references available for this chapter.
                </div>
              ) : (
                <>
                  {/* Count pill */}
                  <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        background: "rgba(var(--accent-rgb,203,178,124),0.08)",
                        border:
                          "1px solid rgba(var(--accent-rgb,203,178,124),0.15)",
                        borderRadius: "100px",
                        padding: "3px 14px",
                        fontFamily: "var(--font-ui, system-ui)",
                        fontSize: "10px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "rgba(var(--accent-rgb,203,178,124),0.6)",
                      }}
                    >
                      {totalRefs} references · {refEntries.length} verses
                    </span>
                  </div>

                  {/* Verse groups */}
                  {refEntries
                    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                    .map(([verseNum, refs]) => (
                      <div key={verseNum} style={{ marginBottom: "24px" }}>
                        {/* Verse label */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "6px",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-ui, system-ui)",
                              fontSize: "10px",
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              color: "rgba(var(--accent-rgb,203,178,124),0.5)",
                              flexShrink: 0,
                            }}
                          >
                            v.{verseNum}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: "1px",
                              background:
                                "rgba(var(--accent-rgb,203,178,124),0.08)",
                            }}
                          />
                        </div>

                        {/* Refs */}
                        <div style={{ paddingLeft: "4px" }}>
                          {refs.map((ref, i) => {
                            const isExpanded = expandedRef === ref;
                            return (
                              <div key={i}>
                                <div
                                  className={`crp-ref-row ${isExpanded ? "crp-ref-row-expanded" : ""}`}
                                  onClick={() => handleRefClick(ref)}
                                  style={{
                                    opacity: isExpanded ? 1 : undefined,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "9px",
                                      color: isExpanded
                                        ? "rgba(var(--accent-rgb,203,178,124),0.8)"
                                        : "rgba(var(--accent-rgb,203,178,124),0.35)",
                                      flexShrink: 0,
                                      fontFamily: "var(--font-ui, system-ui)",
                                      paddingTop: "2px",
                                      transition: "color 0.2s",
                                    }}
                                  >
                                    ✦
                                  </span>
                                  <span
                                    style={{
                                      fontFamily:
                                        "var(--font-body, Georgia, serif)",
                                      fontSize: "15px",
                                      color: "var(--text-primary, #f0ebe0)",
                                      opacity: 0.82,
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {formatRefDisplay(ref)}
                                  </span>
                                  {/* Chevron */}
                                  <span
                                    style={{
                                      marginLeft: "auto",
                                      fontSize: "10px",
                                      color:
                                        "rgba(var(--accent-rgb,203,178,124),0.4)",
                                      transition: "transform 0.2s",
                                      transform: isExpanded
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                      display: "inline-block",
                                      flexShrink: 0,
                                    }}
                                  >
                                    ⌄
                                  </span>
                                </div>

                                {/* Inline verse preview */}
                                {isExpanded && (
                                  <VersePreview
                                    ref={ref}
                                    translation={translation}
                                    onNavigate={(bookSlug, ch) => {
                                      if (onNavigate) onNavigate(bookSlug, ch);
                                    }}
                                    onClose={() => setExpandedRef(null)}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                  {/* Footer */}
                  <div style={{ marginTop: "16px" }}>
                    <div
                      style={{
                        height: "1px",
                        background:
                          "linear-gradient(90deg, transparent, rgba(var(--accent-rgb,203,178,124),0.12), transparent)",
                        marginBottom: "16px",
                      }}
                    />
                    <p
                      style={{
                        fontFamily: "var(--font-ui, system-ui)",
                        fontSize: "11px",
                        lineHeight: "1.6",
                        letterSpacing: "0.02em",
                        color: "var(--text-primary, #f0ebe0)",
                        opacity: 0.3,
                        textAlign: "center",
                        maxWidth: "340px",
                        margin: "0 auto",
                      }}
                    >
                      Cross-references sourced from the Treasury of Scripture
                      Knowledge.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
