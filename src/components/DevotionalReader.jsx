import { useState, useRef, useEffect } from "react";

/* ── Reflection icons for kids devotional ───────────────────────────────── */
function ReflectionIcon({ icon, active }) {
  const color = active ? "var(--text-accent)" : "var(--text-secondary)";
  const icons = {
    broken_promise: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M4 15 C6 12 9 11 12 11 L14 11 C17 11 20 12 22 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13 11 L11.5 8 L13.5 6 L12 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 15 L4 19 Q13 22 22 19 L22 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    changed_mind: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M7 19 L7 10 Q7 5 13 5 L17 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2 L17 5 L14 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 19 L10 16 M7 19 L4 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    found_out: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <ellipse cx="13" cy="13" rx="7" ry="4.5" stroke={color} strokeWidth="1.5" />
        <circle cx="13" cy="13" r="2" fill={color} />
        <path d="M13 5 L13 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13 21 L13 23" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 13 L5 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M21 13 L23 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    still_figuring: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="9" stroke={color} strokeWidth="1.5" />
        <path d="M10 10 Q10 7.5 13 7.5 Q16 7.5 16 10 Q16 12.5 13 13.5 L13 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="13" cy="18" r="1" fill={color} />
      </svg>
    ),
  };
  return icons[icon] || null;
}

/* ── Kids interactive reflection with AI follow-up ──────────────────────── */
function KidsReflection({ day, alreadyDone, onComplete, onContinue }) {
  const [picked, setPicked] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePick(choice) {
    if (picked) return;
    setPicked(choice);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a warm, gentle conversation partner helping a child ages 8-12 reflect on a Bible devotion. Your role is like a wise older friend — never a prophet, preacher, or voice of God. Rules: Never say "God is telling you" or "The Holy Spirit is saying" or speak as God. Connect their choice back to the day's Bible story gently. Ask one simple follow-up question to help them think deeper. Keep your response to 3-4 sentences max. Use simple, warm language a child can understand. Be encouraging but honest — not preachy. Today's story: "${day.title}" — ${day.reflection}`,
          messages: [
            {
              role: "user",
              content: `The child chose: "${choice.label}" Context: "${choice.context}" Respond warmly and connect it back to today's story. End with one gentle follow-up question.`,
            },
          ],
        }),
      });
      const data = await res.json();
      setAiResponse(data.content?.find((b) => b.type === "text")?.text || "");
    } catch {
      setAiResponse("Take a moment to think about that. What would you do differently next time?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", opacity: 0.85, lineHeight: 1.7, marginBottom: 24 }}>
        {day.reflectionPrompt || "Which one sounds most like you right now?"}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {day.reflectionChoices.map((choice, i) => (
          <button
            key={i}
            onClick={() => handlePick(choice)}
            disabled={!!picked}
            style={{
              textAlign: "left",
              padding: "16px 18px",
              borderRadius: 14,
              background: picked?.label === choice.label ? "var(--accent-subtle-strong)" : "var(--accent-subtle)",
              border: `1px solid ${picked?.label === choice.label ? "var(--accent-border-strong)" : "var(--border-subtle)"}`,
              cursor: picked ? "default" : "pointer",
              opacity: picked && picked.label !== choice.label ? 0.4 : 1,
              transition: "all 0.2s ease",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ flexShrink: 0, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", opacity: picked?.label === choice.label ? 1 : 0.5 }}>
                <ReflectionIcon icon={choice.icon} active={picked?.label === choice.label} />
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)", lineHeight: 1.5 }}>
                {choice.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "24px 0", fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.12em", color: "var(--text-accent)", opacity: 0.4 }}>
          Thinking...
        </div>
      )}

      {aiResponse && !loading && (
        <>
          <div style={{ padding: "20px", marginBottom: 24, background: "var(--accent-subtle)", border: "1px solid var(--border-subtle)", borderLeft: "3px solid var(--text-accent)", borderRadius: 14 }}>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, letterSpacing: "0.16em", color: "var(--text-accent)", opacity: 0.5, marginBottom: 10 }}>
              SOMETHING TO THINK ABOUT
            </div>
            {aiResponse.split("\n\n").map((para, i) => (
              <p key={i} style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.8, color: "var(--text-primary)", opacity: 0.88, margin: i === 0 ? 0 : "12px 0 0" }}>
                {para}
              </p>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            {!alreadyDone ? (
              <button
                onClick={onComplete}
                style={{ width: "100%", padding: "14px 20px", textAlign: "center", background: "var(--accent-subtle-strong)", border: "1px solid var(--accent-border-strong)", borderRadius: 12, fontFamily: "var(--font-ui)", fontSize: 12, letterSpacing: "0.06em", color: "var(--text-accent)", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
              >
                I have reflected — Mark Day Complete
              </button>
            ) : (
              <button
                onClick={onContinue}
                style={{ width: "100%", padding: "14px 20px", textAlign: "center", background: "var(--accent-subtle)", border: "1px solid var(--border-subtle)", borderRadius: 12, fontFamily: "var(--font-ui)", fontSize: 12, letterSpacing: "0.06em", color: "var(--text-accent)", opacity: 0.85, cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
              >
                Continue to Quiet Abiding →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── localStorage helpers for dialogue entries ──────────────────────────── */
function loadDialogues() {
  try {
    return JSON.parse(localStorage.getItem("dialogues") || "[]");
  } catch {
    return [];
  }
}

function upsertDevotionalEntry(entry) {
  const dialogues = loadDialogues();
  const idx = dialogues.findIndex(
    (d) => d.type === "devotional" && d.seriesId === entry.seriesId && d.day === entry.day
  );
  if (idx >= 0) {
    dialogues[idx] = { ...dialogues[idx], ...entry, updatedAt: new Date().toISOString() };
  } else {
    dialogues.unshift(entry);
  }
  localStorage.setItem("dialogues", JSON.stringify(dialogues));
}

/* ── Page builder ───────────────────────────────────────────────────────── */
function buildPages(day) {
  const pages = [];
  pages.push({ type: "cover" });
  if (day.intro) pages.push({ type: "intro" });
  pages.push({ type: "scripture" });
  const readingText = day.murrayReading || day.reading;
  if (readingText) {
    const paras = readingText.split("\n\n").filter((p) => p.trim());
    const CHUNK = 3;
    const total = Math.ceil(paras.length / CHUNK);
    for (let i = 0; i < paras.length; i += CHUNK) {
      pages.push({
        type: "reading",
        paragraphs: paras.slice(i, i + CHUNK),
        readingPage: Math.floor(i / CHUNK) + 1,
        totalReadingPages: total,
        isFirstReadingPage: i === 0,
      });
    }
  }
  pages.push({ type: "reflection" });
  pages.push({ type: "abide" });
  return pages;
}

/* ── Swipe indicator label for a given page ─────────────────────────────── */
function pageLabel(page) {
  if (!page) return "";
  if (page.type === "reading") return String(page.readingPage);
  return { cover: "◯", intro: "I", scripture: "✦", reflection: "R", abide: "A" }[page.type] ?? "";
}

/* ═══════════════════════════════════════════════════════════════════════════
   DevotionalReader — Kindle-style swipe reader for a single devotional day
═══════════════════════════════════════════════════════════════════════════ */
export default function DevotionalReader({
  day,
  series,
  scriptureResult,
  scripturesResults,
  loadingScripture,
  onBack,
  onComplete,
  alreadyDone,
  justCompleted,
  isLastDay,
  onNextDay,
  onReturnToSeries,
}) {
  const pages = buildPages(day);
  const [pageIndex, setPageIndex] = useState(0);

  // Swipe gesture state
  const touchStartX = useRef(null);
  const touchStartY = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Per-page scroll ref
  const scrollRef = useRef(null);

  // Reflection note state
  const [noteText, setNoteText] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteAlreadySaved, setNoteAlreadySaved] = useState(false);

  const currentPage = pages[pageIndex];
  const swipeProgress = Math.min(Math.abs(swipeOffset) / 110, 1);
  const showPrevIndicator = isSwiping && swipeOffset > 20 && pageIndex > 0;
  const showNextIndicator = isSwiping && swipeOffset < -20 && pageIndex < pages.length - 1;

  // Reset scroll to top on page change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [pageIndex]);

  // Load saved reflection note for this day (if any)
  useEffect(() => {
    const existing = loadDialogues().find(
      (d) => d.type === "devotional" && d.seriesId === series.id && d.day === day.day
    );
    if (existing) {
      setNoteAlreadySaved(true);
      setNoteText(existing.text || "");
    } else {
      setNoteAlreadySaved(false);
      setNoteText("");
      setNoteSaved(false);
    }
  }, [day.day, series.id]);

  function navigate(dir) {
    const next = pageIndex + dir;
    if (next < 0 || next >= pages.length) return;
    setPageIndex(next);
    setSwipeOffset(0);
    setIsSwiping(false);
  }

  /* ── Touch handlers ────────────────────────────────────────────────────── */
  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setSwipeOffset(0);
    setIsSwiping(false);
  }

  function handleTouchMove(e) {
    if (!touchStartX.current) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(diffX) > 12 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      setIsSwiping(true);
      setSwipeOffset(diffX);
    }
  }

  function handleTouchEnd() {
    if (isSwiping) {
      if (swipeOffset < -75 && pageIndex < pages.length - 1) {
        navigate(1);
      } else if (swipeOffset > 75 && pageIndex > 0) {
        navigate(-1);
      } else {
        setSwipeOffset(0);
        setIsSwiping(false);
      }
    }
    touchStartX.current = null;
  }

  /* ── Save reflection note to Dialoguing with God ───────────────────────── */
  function saveNote() {
    if (!noteText.trim()) return;
    const html = noteText
      .split("\n\n")
      .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
      .join("");
    upsertDevotionalEntry({
      id: Date.now().toString(),
      type: "devotional",
      seriesId: series.id,
      seriesTitle: series.title,
      day: day.day,
      dayTitle: day.title,
      questions: day.reflection,
      reflection: html,
      text: noteText,
      createdAt: new Date().toISOString(),
    });
    setNoteSaved(true);
    setNoteAlreadySaved(true);
  }

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-app)",
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
        paddingTop: "env(safe-area-inset-top)",
        overflow: "hidden",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        .dr-scroll::-webkit-scrollbar { display: none }
        .dr-scroll { -ms-overflow-style: none; scrollbar-width: none }
        .dr-textarea { -webkit-user-select: text; user-select: text; }
        .dr-textarea::placeholder { opacity: 0.35; }
      `}</style>

      {/* ── Minimal top bar ──────────────────────────────────────────────── */}
      <div
        style={{
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          borderBottom: currentPage.type !== "cover" ? "1px solid var(--border-subtle)" : "none",
          background: "var(--bg-app)",
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--accent-subtle)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 100,
            padding: "6px 14px 6px 10px",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--text-accent)", opacity: 0.7 }}>‹</span>
          <span style={{ fontSize: 12, letterSpacing: "0.04em", color: "var(--text-accent)", opacity: 0.7, fontFamily: "var(--font-ui)" }}>
            {series.title}
          </span>
        </button>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, letterSpacing: "0.16em", color: "var(--text-accent)", opacity: 0.4, textTransform: "uppercase" }}>
          Day {day.day} · {pageIndex + 1} / {pages.length}
        </span>
      </div>

      {/* ── Page content area with swipe transform ──────────────────────── */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
          transform: isSwiping ? `translateX(${swipeOffset * 0.18}px)` : "translateX(0)",
          transition: isSwiping ? "none" : "transform 0.22s ease",
        }}
      >
        <div ref={scrollRef} className="dr-scroll" style={{ height: "100%", overflowY: "auto" }}>

          {/* ════════════════════════════════
              COVER PAGE
          ════════════════════════════════ */}
          {currentPage.type === "cover" && (
            <div
              style={{
                minHeight: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px 36px",
                textAlign: "center",
                position: "relative",
              }}
            >
              {/* Watermark day number */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontFamily: "var(--font-body)",
                  fontSize: 200,
                  fontWeight: 700,
                  color: "var(--text-accent)",
                  opacity: 0.045,
                  lineHeight: 1,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {day.day}
              </div>

              <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--text-accent)", opacity: 0.45, marginBottom: 22 }}>
                {series.author} · Day {day.day} of {series.totalDays}
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 30,
                  fontWeight: 400,
                  lineHeight: 1.25,
                  color: "var(--text-primary)",
                  opacity: 0.9,
                  margin: "0 0 28px",
                  letterSpacing: "0.01em",
                  maxWidth: 280,
                }}
              >
                {day.title}
              </h1>

              <div style={{ width: 36, height: 1, background: "var(--text-accent)", opacity: 0.25, marginBottom: 20 }} />

              <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.1em", color: "var(--text-accent)", opacity: 0.5 }}>
                {day.scripture}
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: 44,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontFamily: "var(--font-ui)",
                  fontSize: 9,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--text-accent)",
                  opacity: 0.25,
                }}
              >
                Swipe to begin
              </div>
            </div>
          )}

          {/* ════════════════════════════════
              INTRO PAGE
          ════════════════════════════════ */}
          {currentPage.type === "intro" && (
            <div style={{ padding: "36px 28px 72px" }}>
              <div style={eyebrow}>
                {series.hasAudio ? "Before You Read" : "Introduction"}
              </div>
              {day.intro.split("\n\n").map((para, i) => (
                <p key={i} style={prose}>{para}</p>
              ))}
            </div>
          )}

          {/* ════════════════════════════════
              SCRIPTURE PAGE
          ════════════════════════════════ */}
          {currentPage.type === "scripture" && (
            <div
              style={{
                minHeight: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px 32px",
                textAlign: "center",
              }}
            >
              <div style={eyebrow}>Scripture</div>

              {loadingScripture ? (
                <div style={{ color: "var(--text-accent)", opacity: 0.3, fontSize: 22, letterSpacing: "0.4em" }}>···</div>
              ) : day.scriptures?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 32, width: "100%" }}>
                  {scripturesResults.map(({ ref, result }, i) =>
                    result?.text ? (
                      <div key={i}>
                        <p style={scriptureQuote}>"{result.text}"</p>
                        <div style={scriptureAttrib}>— {ref} · {result.translation}</div>
                      </div>
                    ) : null
                  )}
                </div>
              ) : scriptureResult?.text ? (
                <>
                  <div style={{ width: 1, height: 44, background: "linear-gradient(to bottom, transparent, var(--text-accent))", opacity: 0.25, margin: "0 auto 32px" }} />
                  <p style={scriptureQuote}>"{scriptureResult.text}"</p>
                  <div style={{ ...scriptureAttrib, marginBottom: 32 }}>— {day.scripture} · {scriptureResult.translation}</div>
                  <div style={{ width: 1, height: 44, background: "linear-gradient(to top, transparent, var(--text-accent))", opacity: 0.25, margin: "0 auto" }} />
                </>
              ) : (
                <div style={{ padding: "16px 24px", background: "var(--accent-subtle)", border: "1px solid var(--border-subtle)", borderRadius: 12, fontFamily: "var(--font-ui)", fontSize: 13, letterSpacing: "0.06em", color: "var(--text-accent)", opacity: 0.7 }}>
                  {day.scripture}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════
              READING PAGES
          ════════════════════════════════ */}
          {currentPage.type === "reading" && (
            <div style={{ padding: "36px 28px 72px" }}>
              {/* Attribution badge on first reading page only */}
              {currentPage.isFirstReadingPage && (day.aiDisclaimer || day.murrayReading) && (
                <div style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", marginBottom: 24, background: "var(--accent-subtle)", border: "1px solid var(--border-subtle)", borderRadius: 20 }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, letterSpacing: "0.12em", color: "var(--text-accent)", opacity: 0.55 }}>
                    {day.aiDisclaimer ? "AI-ASSISTED SUMMARY · PERSONAL REFLECTION" : "ANDREW MURRAY · PUBLIC DOMAIN"}
                  </span>
                </div>
              )}

              {currentPage.paragraphs.map((para, i) => (
                <p key={i} style={{ ...prose, textIndent: "1.5em" }}>{para}</p>
              ))}

              {/* Reading progress dots */}
              {currentPage.totalReadingPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 44 }}>
                  {Array.from({ length: currentPage.totalReadingPages }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        width: i + 1 === currentPage.readingPage ? 20 : 6,
                        height: 5,
                        borderRadius: 2.5,
                        background: "var(--text-accent)",
                        opacity: i + 1 === currentPage.readingPage ? 0.6 : 0.18,
                        transition: "all 0.22s ease",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════
              REFLECTION PAGE
          ════════════════════════════════ */}
          {currentPage.type === "reflection" && (
            <div style={{ padding: "36px 28px 72px" }}>
              <div style={eyebrow}>Reflection</div>

              {day.reflectionChoices ? (
                /* Kids interactive reflection */
                <KidsReflection
                  day={day}
                  alreadyDone={alreadyDone}
                  onComplete={onComplete}
                  onContinue={() => navigate(1)}
                />
              ) : (
                <>
                  <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: 28, opacity: 0.65 }}>
                    Sit with these before the Lord. There is no rush.
                  </p>

                  {day.reflection
                    .split("?")
                    .filter((q) => q.trim())
                    .map((q, i) => (
                      <div key={i} style={{ marginBottom: 22, paddingLeft: 16, borderLeft: "2px solid var(--text-accent)" }}>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.82, color: "var(--text-primary)", opacity: 0.86, margin: 0 }}>
                          {q.trim()}?
                        </p>
                      </div>
                    ))}

                  {/* Journal textarea */}
                  <div style={{ marginTop: 38 }}>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-accent)", opacity: 0.38, marginBottom: 12 }}>
                      Your Reflection
                    </div>
                    <textarea
                      className="dr-textarea"
                      value={noteText}
                      onChange={(e) => { setNoteText(e.target.value); setNoteSaved(false); }}
                      placeholder="Write what comes to mind..."
                      style={{
                        width: "100%",
                        minHeight: 148,
                        padding: "14px 16px",
                        background: "var(--accent-subtle)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 12,
                        fontFamily: "var(--font-body)",
                        fontSize: 15,
                        lineHeight: 1.75,
                        color: "var(--text-primary)",
                        resize: "none",
                        outline: "none",
                        boxSizing: "border-box",
                        userSelect: "text",
                        WebkitUserSelect: "text",
                      }}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                    />
                    {noteText.trim() && (
                      <button
                        onClick={saveNote}
                        style={{
                          marginTop: 10,
                          width: "100%",
                          padding: "13px 20px",
                          background: noteSaved ? "var(--accent-subtle-strong)" : "var(--accent-subtle)",
                          border: `1px solid ${noteSaved ? "var(--accent-border-strong)" : "var(--border-subtle)"}`,
                          borderRadius: 12,
                          fontFamily: "var(--font-ui)",
                          fontSize: 11,
                          letterSpacing: "0.07em",
                          color: "var(--text-accent)",
                          cursor: "pointer",
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        {noteSaved
                          ? "✓  Saved to Dialoguing with God"
                          : noteAlreadySaved
                          ? "Update in Dialoguing with God"
                          : "Save to Dialoguing with God"}
                      </button>
                    )}
                    {noteAlreadySaved && !noteText.trim() && (
                      <div style={{ marginTop: 10, padding: "10px 16px", background: "var(--accent-subtle)", border: "1px solid var(--border-subtle)", borderRadius: 10, fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.08em", color: "var(--text-accent)", opacity: 0.55, textAlign: "center" }}>
                        ✓  Reflection saved to Dialoguing with God
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ════════════════════════════════
              ABIDE PAGE
          ════════════════════════════════ */}
          {currentPage.type === "abide" && (
            <div
              style={{
                minHeight: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px 32px 80px",
                textAlign: "center",
              }}
            >
              <div style={eyebrow}>Abide</div>

              <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom, transparent, var(--text-accent))", opacity: 0.28, margin: "0 auto 32px" }} />

              <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 18, lineHeight: 1.9, color: "var(--text-primary)", opacity: 0.75, maxWidth: 300, margin: "0 auto 32px" }}>
                "{day.abide}"
              </p>

              <div style={{ width: 1, height: 48, background: "linear-gradient(to top, transparent, var(--text-accent))", opacity: 0.28, margin: "0 auto 40px" }} />

              <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--text-secondary)", opacity: 0.32, marginBottom: 52 }}>
                Be Still and Know
              </div>

              {/* Just-completed badge */}
              {justCompleted && (
                <div style={{ padding: "10px 22px", marginBottom: 18, background: "var(--accent-subtle)", border: "1px solid var(--accent-border-strong)", borderRadius: 20, display: "inline-block" }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.12em", color: "var(--text-accent)", opacity: 0.82 }}>
                    ✓  Day {day.day} Complete
                  </span>
                </div>
              )}

              {/* Mark complete — adult only (kids handled inside KidsReflection) */}
              {!alreadyDone && !justCompleted && !day.reflectionChoices && (
                <button
                  onClick={onComplete}
                  style={{
                    padding: "15px 32px",
                    background: "var(--accent-subtle-strong)",
                    border: "1px solid var(--accent-border-strong)",
                    borderRadius: 12,
                    fontFamily: "var(--font-ui)",
                    fontSize: 12,
                    letterSpacing: "0.06em",
                    color: "var(--text-accent)",
                    cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                    marginBottom: 12,
                  }}
                >
                  Mark Day {day.day} Complete
                </button>
              )}

              {/* Continue to next day */}
              {!isLastDay && alreadyDone && (
                <button
                  onClick={onNextDay}
                  style={{ padding: "15px 32px", background: "var(--accent-subtle)", border: "1px solid var(--border-subtle)", borderRadius: 12, fontFamily: "var(--font-ui)", fontSize: 12, letterSpacing: "0.06em", color: "var(--text-accent)", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
                >
                  Continue to Day {day.day + 1} →
                </button>
              )}

              {/* Last day ending */}
              {isLastDay && alreadyDone && (
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 14, color: "var(--text-secondary)", opacity: 0.6, lineHeight: 1.7, marginBottom: 24, maxWidth: 280 }}>
                    {series.id === "beauty-of-holiness"
                      ? "You have walked through all twelve days. This is not an ending — it is a beginning. Keep beholding Him."
                      : series.id === "discipleship-guide"
                      ? "You have walked through all twenty-two days. You now carry a foundation that will hold the weight of a lifetime. Go deeper. Keep knowing Him."
                      : "You have walked through all fourteen days. This is not an ending — it is a beginning. Keep staying close to Jesus."}
                  </p>
                  <button
                    onClick={onReturnToSeries}
                    style={{ padding: "15px 32px", background: "var(--accent-subtle)", border: "1px solid var(--border-subtle)", borderRadius: 12, fontFamily: "var(--font-ui)", fontSize: 12, letterSpacing: "0.06em", color: "var(--text-accent)", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
                  >
                    Return to Series
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Swipe indicator — left (prev page) ────────────────────────── */}
        {showPrevIndicator && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: `translateY(-50%) translateX(${-44 + swipeProgress * 44}px)`,
              opacity: swipeProgress,
              zIndex: 20,
              width: 44,
              height: 72,
              background: "var(--bg-nav, #cbb27c)",
              borderRadius: "0 12px 12px 0",
              boxShadow: "2px 0 16px rgba(0,0,0,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <span style={{ fontFamily: "var(--font-ui)", fontSize: pages[pageIndex - 1]?.type === "reading" ? 18 : 13, fontWeight: 700, color: "var(--text-inverse, #1C1C1A)", letterSpacing: pages[pageIndex - 1]?.type === "reading" ? 0 : "0.04em" }}>
              {pageLabel(pages[pageIndex - 1])}
            </span>
          </div>
        )}

        {/* ── Swipe indicator — right (next page) ───────────────────────── */}
        {showNextIndicator && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: `translateY(-50%) translateX(${44 - swipeProgress * 44}px)`,
              opacity: swipeProgress,
              zIndex: 20,
              width: 44,
              height: 72,
              background: "var(--bg-nav, #cbb27c)",
              borderRadius: "12px 0 0 12px",
              boxShadow: "-2px 0 16px rgba(0,0,0,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <span style={{ fontFamily: "var(--font-ui)", fontSize: pages[pageIndex + 1]?.type === "reading" ? 18 : 13, fontWeight: 700, color: "var(--text-inverse, #1C1C1A)", letterSpacing: pages[pageIndex + 1]?.type === "reading" ? 0 : "0.04em" }}>
              {pageLabel(pages[pageIndex + 1])}
            </span>
          </div>
        )}
      </div>

      {/* ── Bottom progress dots ─────────────────────────────────────────── */}
      <div
        style={{
          padding: "10px 0 calc(10px + env(safe-area-inset-bottom))",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 5,
          flexShrink: 0,
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg-app)",
        }}
      >
        {pages.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === pageIndex ? 22 : 5,
              height: 5,
              borderRadius: 2.5,
              background: "var(--text-accent)",
              opacity: i === pageIndex ? 0.7 : 0.18,
              transition: "all 0.24s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Shared style objects ───────────────────────────────────────────────── */
const eyebrow = {
  fontFamily: "var(--font-ui)",
  fontSize: 9,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "var(--text-accent)",
  opacity: 0.45,
  marginBottom: 26,
};

const prose = {
  fontFamily: "var(--font-body)",
  fontSize: 16,
  lineHeight: 1.95,
  color: "var(--text-primary)",
  opacity: 0.88,
  marginBottom: 22,
};

const scriptureQuote = {
  fontFamily: "var(--font-body)",
  fontStyle: "italic",
  fontSize: 18,
  lineHeight: 1.9,
  color: "var(--text-accent)",
  opacity: 0.9,
  margin: "0 auto 14px",
  maxWidth: 340,
};

const scriptureAttrib = {
  fontFamily: "var(--font-ui)",
  fontSize: 9,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--text-accent)",
  opacity: 0.45,
};
