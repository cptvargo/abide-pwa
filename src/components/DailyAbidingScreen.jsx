import { useState, useEffect, useRef, useCallback } from "react";
import ScriptureGuidedDay from "./ScriptureGuidedDay";

/* ─── localStorage helpers ──────────────────────────────────────────────── */
const COMPLETED_KEY = "abide_daily_completed_v1";
function getCompleted() {
  try { return new Set(JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]")); }
  catch { return new Set(); }
}
function markComplete(id) {
  const s = getCompleted(); s.add(id);
  localStorage.setItem(COMPLETED_KEY, JSON.stringify([...s]));
}

/* ─── Verse ref parser ──────────────────────────────────────────────────── */
function parseVerseRef(ref) {
  const m = ref.trim().match(/^([\w\s]+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!m) return null;
  return {
    bookId: m[1].toLowerCase().replace(/\s+/g, ""),
    chapter: parseInt(m[2]),
    startVerse: parseInt(m[3]),
    endVerse: m[4] ? parseInt(m[4]) : parseInt(m[3]),
    display: ref,
  };
}

async function fetchVerseText(bookId, chapter, startVerse, endVerse, translation, base) {
  const t = translation.toLowerCase();
  try {
    const res = await fetch(`${base}data/translations/${t}/${bookId}/${chapter}.json`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    const rawVerses = data.verses ?? data;
    const entries = Array.isArray(rawVerses)
      ? rawVerses
      : Object.entries(rawVerses)
          .filter(([k]) => !isNaN(Number(k)))
          .map(([k, v]) => ({ verse: Number(k), text: typeof v === "string" ? v : (v?.text ?? "") }));
    const lines = entries
      .filter((v) => v.verse >= startVerse && v.verse <= endVerse)
      .map((v) => {
        const text = typeof v.text === "string" ? v.text : (v.text?.text ?? "");
        return startVerse !== endVerse ? `[${v.verse}] ${text}` : text;
      });
    return lines.join(" ") || null;
  } catch { return null; }
}

/* ─── Verse bottom sheet ────────────────────────────────────────────────── */
function VerseSheet({ pill, translation, base, onClose }) {
  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(true);
  const parsed = pill ? parseVerseRef(pill) : null;

  useEffect(() => {
    if (!parsed) return;
    setLoading(true); setText(null);
    fetchVerseText(parsed.bookId, parsed.chapter, parsed.startVerse, parsed.endVerse, translation, base)
      .then((t) => { setText(t); setLoading(false); });
  }, [pill, translation]);

  if (!pill) return null;
  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.55)",
      }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
        background: "var(--bg-app)",
        borderTop: "1px solid rgba(203,178,124,0.2)",
        borderRadius: "20px 20px 0 0",
        padding: "0 24px calc(env(safe-area-inset-bottom,0px) + 28px)",
        animation: "da-sheet-up 0.28s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: "rgba(255,255,255,0.15)",
          margin: "12px auto 24px",
        }} />
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "rgba(203,178,124,0.6)",
          fontFamily: "var(--font-ui, system-ui)", marginBottom: 6,
        }}>
          {parsed?.display}
        </div>
        <div style={{
          display: "inline-block", fontSize: 10, letterSpacing: "0.08em",
          background: "rgba(203,178,124,0.1)",
          border: "1px solid rgba(203,178,124,0.2)",
          borderRadius: 6, padding: "2px 8px", marginBottom: 16,
          color: "rgba(203,178,124,0.7)", fontFamily: "var(--font-ui, system-ui)",
        }}>
          {translation}
        </div>
        {loading ? (
          <div style={{ height: 48, display: "flex", alignItems: "center" }}>
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              border: "2px solid rgba(203,178,124,0.2)",
              borderTopColor: "rgba(203,178,124,0.7)",
              animation: "da-spin 0.7s linear infinite",
            }} />
          </div>
        ) : text ? (
          <p style={{
            fontFamily: "var(--font-body, Georgia, serif)", fontSize: 16,
            lineHeight: 1.85, color: "var(--text-primary)", opacity: 0.88,
            margin: 0,
          }}>
            {text}
          </p>
        ) : (
          <p style={{
            fontFamily: "var(--font-body, Georgia, serif)", fontSize: 14,
            color: "var(--text-primary)", opacity: 0.4, fontStyle: "italic",
          }}>
            Verse not available in {translation}.
          </p>
        )}
      </div>
    </>
  );
}

/* ─── Onboarding overlay ────────────────────────────────────────────────── */
function OnboardingOverlay({ onSelect }) {
  const options = [
    { count: 1, label: "Just me" },
    { count: 2, label: "Two of us" },
    { count: 3, label: "Three of us" },
    { count: 4, label: "Four or more" },
  ];
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 50,
      background: "rgba(14,14,10,0.92)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 28px",
      backdropFilter: "blur(12px)",
      animation: "da-fade-in 0.3s ease",
    }}>
      <div style={{
        fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase",
        color: "rgba(203,178,124,0.5)", fontFamily: "var(--font-ui, system-ui)",
        marginBottom: 20,
      }}>
        ✦ &nbsp; Daily Abiding
      </div>
      <h2 style={{
        fontFamily: "var(--font-ui, system-ui)", fontSize: 24, fontWeight: 300,
        color: "var(--text-primary)", textAlign: "center",
        lineHeight: 1.3, marginBottom: 10,
      }}>
        How many are joining today?
      </h2>
      <p style={{
        fontFamily: "var(--font-body, Georgia, serif)", fontSize: 14,
        color: "var(--text-primary)", opacity: 0.45, textAlign: "center",
        fontStyle: "italic", marginBottom: 36, lineHeight: 1.6,
      }}>
        Whether you're alone or together, you're abiding.
      </p>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 10, width: "100%", maxWidth: 320,
      }}>
        {options.map(({ count, label }) => (
          <button
            key={count}
            onClick={() => onSelect(count)}
            style={{
              padding: "18px 12px", borderRadius: 14, cursor: "pointer",
              background: "rgba(203,178,124,0.07)",
              border: "1px solid rgba(203,178,124,0.18)",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 6,
              WebkitTapHighlightColor: "transparent",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onTouchStart={e => {
              e.currentTarget.style.background = "rgba(203,178,124,0.16)";
              e.currentTarget.style.borderColor = "rgba(203,178,124,0.4)";
            }}
            onTouchEnd={e => {
              e.currentTarget.style.background = "rgba(203,178,124,0.07)";
              e.currentTarget.style.borderColor = "rgba(203,178,124,0.18)";
            }}
          >
            <span style={{
              fontFamily: "var(--font-ui, system-ui)", fontSize: 28, fontWeight: 300,
              color: "rgba(203,178,124,0.9)", lineHeight: 1,
            }}>
              {count === 4 ? "4+" : count}
            </span>
            <span style={{
              fontFamily: "var(--font-ui, system-ui)", fontSize: 11,
              color: "var(--text-primary)", opacity: 0.5,
            }}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Page 0 — Video + cross-ref pills ─────────────────────────────────── */
function VideoPage({ day, translation, base, onNext, participants }) {
  const [activePill, setActivePill] = useState(null);

  // swipe to advance
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const dirLocked = useRef(null);

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    dirLocked.current = null;
  }
  function onTouchMove(e) {
    if (!touchStartX.current) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (!dirLocked.current) {
      if (Math.abs(dx) > 8) dirLocked.current = "h";
      else if (Math.abs(dy) > 8) dirLocked.current = "v";
    }
    if (dirLocked.current === "h") e.preventDefault();
  }
  function onTouchEnd(e) {
    if (dirLocked.current === "h") {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      if (dx < -80) onNext();
    }
    touchStartX.current = null;
  }

  const containerRef = useRef(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div ref={containerRef} style={{
      width: "100%", flexShrink: 0, height: "100%",
      overflowY: "auto", WebkitOverflowScrolling: "touch",
    }}>
      <div style={{ padding: "20px 18px 0" }}>
        {/* Session info */}
        {participants > 1 && (
          <div style={{
            fontSize: 11, letterSpacing: "0.08em",
            color: "rgba(203,178,124,0.5)", fontFamily: "var(--font-ui, system-ui)",
            marginBottom: 14,
          }}>
            {participants} abiding together
          </div>
        )}

        {/* Day label */}
        <div style={{
          fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "rgba(203,178,124,0.45)", fontFamily: "var(--font-ui, system-ui)",
          marginBottom: 6,
        }}>
          {day.subtitle}
        </div>
        <h2 style={{
          fontFamily: "var(--font-ui, system-ui)", fontSize: 22, fontWeight: 300,
          color: "var(--text-primary)", marginBottom: 18, lineHeight: 1.2,
        }}>
          {day.title}
        </h2>

        {/* Video embed */}
        <div style={{
          width: "100%", aspectRatio: "16/9",
          borderRadius: 12, overflow: "hidden", background: "#0a0a08",
        }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${day.videoId}?rel=0&modestbranding=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            title={day.title}
          />
        </div>

        {/* Cross-ref pills */}
        {day.crossRefPills?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
              color: "rgba(203,178,124,0.38)", fontFamily: "var(--font-ui, system-ui)",
              marginBottom: 10,
            }}>
              Key Scriptures
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {day.crossRefPills.map((pill) => (
                <button
                  key={pill}
                  onClick={() => setActivePill(pill)}
                  style={{
                    padding: "7px 13px", borderRadius: 100, cursor: "pointer",
                    background: "rgba(203,178,124,0.07)",
                    border: "1px solid rgba(203,178,124,0.22)",
                    fontSize: 12, fontFamily: "var(--font-ui, system-ui)",
                    color: "rgba(203,178,124,0.85)", letterSpacing: "0.02em",
                    WebkitTapHighlightColor: "transparent",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                  onTouchStart={e => {
                    e.currentTarget.style.background = "rgba(203,178,124,0.15)";
                    e.currentTarget.style.borderColor = "rgba(203,178,124,0.45)";
                  }}
                  onTouchEnd={e => {
                    e.currentTarget.style.background = "rgba(203,178,124,0.07)";
                    e.currentTarget.style.borderColor = "rgba(203,178,124,0.22)";
                  }}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Continue button */}
        <div style={{ marginTop: 32, marginBottom: 4 }}>
          <button
            onClick={onNext}
            style={{
              width: "100%", padding: "16px", borderRadius: 14, cursor: "pointer",
              background: "rgba(203,178,124,0.12)",
              border: "1px solid rgba(203,178,124,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontFamily: "var(--font-ui, system-ui)", fontSize: 14, fontWeight: 500,
              color: "rgba(203,178,124,0.9)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Continue to Reflection
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <p style={{
            textAlign: "center", fontSize: 11, color: "var(--text-primary)", opacity: 0.25,
            fontFamily: "var(--font-ui, system-ui)", marginTop: 10,
            fontStyle: "italic",
          }}>
            or swipe left
          </p>
        </div>
      </div>

      <div style={{ height: "calc(env(safe-area-inset-bottom,0px) + 32px)" }} />

      {/* Verse bottom sheet */}
      <VerseSheet
        pill={activePill}
        translation={translation}
        base={base}
        onClose={() => setActivePill(null)}
      />
    </div>
  );
}

/* ─── Page 1 — Reflection ───────────────────────────────────────────────── */
function ReflectionPage({ day, onNext, onPrev }) {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{
      width: "100%", flexShrink: 0, height: "100%",
      overflowY: "auto", WebkitOverflowScrolling: "touch",
    }}>
      <div style={{ padding: "28px 20px 0", maxWidth: 580, margin: "0 auto" }}>
        {/* Prompt */}
        <div style={{
          fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "rgba(203,178,124,0.45)", fontFamily: "var(--font-ui, system-ui)",
          textAlign: "center", marginBottom: 18,
        }}>
          Reflect
        </div>
        <p style={{
          fontFamily: "var(--font-body, Georgia, serif)", fontSize: 19,
          lineHeight: 1.7, color: "var(--text-primary)", opacity: 0.88,
          fontStyle: "italic", textAlign: "center", marginBottom: 32,
        }}>
          {day.reflection.prompt}
        </p>

        {/* Choices */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {day.reflection.choices.map((choice, i) => {
            const isSelected = selected === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setSelected(isSelected ? null : i)}
                  style={{
                    width: "100%", textAlign: "left",
                    padding: "16px 18px", borderRadius: 13, cursor: "pointer",
                    background: isSelected
                      ? "rgba(203,178,124,0.12)"
                      : "rgba(255,255,255,0.03)",
                    border: isSelected
                      ? "1px solid rgba(203,178,124,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                    transition: "background 0.2s, border-color 0.2s",
                    WebkitTapHighlightColor: "transparent",
                    display: "flex", alignItems: "center", gap: 14,
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    border: isSelected
                      ? "2px solid rgba(203,178,124,0.8)"
                      : "2px solid rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "border-color 0.2s",
                  }}>
                    {isSelected && (
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: "rgba(203,178,124,0.9)",
                      }} />
                    )}
                  </div>
                  <span style={{
                    fontFamily: "var(--font-body, Georgia, serif)", fontSize: 15,
                    color: "var(--text-primary)", opacity: isSelected ? 0.92 : 0.65,
                    lineHeight: 1.4,
                  }}>
                    {choice.label}
                  </span>
                </button>

                {/* Deep question — expands on select */}
                {isSelected && (
                  <div style={{
                    margin: "6px 4px 0",
                    padding: "18px 18px",
                    borderRadius: "0 0 12px 12px",
                    background: "rgba(203,178,124,0.05)",
                    borderLeft: "2px solid rgba(203,178,124,0.4)",
                    borderRight: "1px solid rgba(203,178,124,0.15)",
                    borderBottom: "1px solid rgba(203,178,124,0.15)",
                    animation: "da-fade-in 0.25s ease",
                  }}>
                    <p style={{
                      fontFamily: "var(--font-body, Georgia, serif)", fontSize: 15.5,
                      lineHeight: 1.75, color: "var(--text-primary)", opacity: 0.82,
                      fontStyle: "italic", margin: 0,
                    }}>
                      {choice.deepQuestion}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div style={{ marginTop: 32, display: "flex", gap: 10 }}>
          <button
            onClick={onPrev}
            style={{
              flex: "0 0 48px", height: 48, borderRadius: 12, cursor: "pointer",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-primary)", opacity: 0.5,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            onClick={onNext}
            disabled={selected === null}
            style={{
              flex: 1, height: 48, borderRadius: 12, cursor: selected !== null ? "pointer" : "default",
              background: selected !== null
                ? "rgba(203,178,124,0.14)"
                : "rgba(255,255,255,0.04)",
              border: selected !== null
                ? "1px solid rgba(203,178,124,0.32)"
                : "1px solid rgba(255,255,255,0.06)",
              fontFamily: "var(--font-ui, system-ui)", fontSize: 14, fontWeight: 500,
              color: selected !== null ? "rgba(203,178,124,0.9)" : "rgba(255,255,255,0.25)",
              transition: "all 0.2s",
            }}
          >
            {selected !== null ? "Continue to Abide →" : "Choose what speaks to you"}
          </button>
        </div>
      </div>
      <div style={{ height: "calc(env(safe-area-inset-bottom,0px) + 40px)" }} />
    </div>
  );
}

/* ─── Page 2 — Abide + Mark Done ───────────────────────────────────────── */
function AbidePage({ day, seriesId, onDone, onPrev }) {
  const [done, setDone] = useState(false);

  function handleDone() {
    markComplete(day.id);
    setDone(true);
    setTimeout(onDone, 1200);
  }


  return (
    <div style={{
      width: "100%", flexShrink: 0, height: "100%",
      overflowY: "auto", WebkitOverflowScrolling: "touch",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ width: "100%", maxWidth: 580, padding: "0 32px", textAlign: "center" }}>

        {/* ABIDE label */}
        <div style={{
          fontFamily: "var(--font-ui, system-ui)",
          fontSize: 10, fontWeight: 600,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "rgba(203,178,124,0.45)",
          marginBottom: 20,
        }}>
          ABIDE
        </div>

        {/* Top rule */}
        <div style={{
          width: 1, height: 48,
          background: "linear-gradient(to bottom, transparent, rgba(203,178,124,0.3), transparent)",
          margin: "0 auto 32px",
        }} />

        {/* Abide text */}
        <p style={{
          fontFamily: "var(--font-body, Georgia, serif)",
          fontSize: 19, lineHeight: 1.8,
          color: "var(--text-primary)", opacity: 0.88,
          fontStyle: "italic", margin: 0,
        }}>
          "{day.abide}"
        </p>

        {/* Bottom rule */}
        <div style={{
          width: 1, height: 48,
          background: "linear-gradient(to bottom, transparent, rgba(203,178,124,0.3), transparent)",
          margin: "32px auto 20px",
        }} />

        {/* BE STILL AND KNOW label */}
        <div style={{
          fontFamily: "var(--font-ui, system-ui)",
          fontSize: 10, fontWeight: 600,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "rgba(203,178,124,0.45)",
          marginBottom: 40,
        }}>
          BE STILL AND KNOW
        </div>

        {/* Mark complete button */}
        <button
          onClick={handleDone}
          disabled={done}
          style={{
            width: "100%", height: 56, borderRadius: 100,
            cursor: done ? "default" : "pointer",
            background: done ? "rgba(203,178,124,0.22)" : "rgba(203,178,124,0.13)",
            border: "1px solid rgba(203,178,124,0.35)",
            fontFamily: "var(--font-ui, system-ui)", fontSize: 15, fontWeight: 500,
            color: "rgba(203,178,124,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "all 0.25s",
            letterSpacing: "0.02em",
          }}
        >
          {done ? (
            <>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="rgba(203,178,124,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Session Complete
            </>
          ) : "Mark Today Complete"}
        </button>
      </div>
      <div style={{ height: "calc(env(safe-area-inset-bottom,0px) + 40px)" }} />
    </div>
  );
}

/* ─── Day experience — 3-page flow ─────────────────────────────────────── */
function DayExperience({ day, seriesId, translation, base, onComplete, onBack }) {
  const [participants, setParticipants] = useState(null); // null = onboarding not done
  const [page, setPage] = useState(0);
  const [animDir, setAnimDir] = useState(1); // 1 = forward, -1 = back

  function goTo(p, dir = 1) {
    setAnimDir(dir);
    setPage(p);
  }

  return (
    <div style={{ position: "absolute", inset: 0, background: "var(--bg-app)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        padding: "calc(env(safe-area-inset-top,0px) + 10px) 16px 10px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <button
          onClick={onBack}
          style={{
            height: 34, borderRadius: 9, flexShrink: 0, padding: "0 12px 0 8px",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)",
            cursor: "pointer", color: "var(--text-primary)",
            display: "flex", alignItems: "center", gap: 5,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span style={{ fontSize: 13, fontFamily: "var(--font-ui, system-ui)", opacity: 0.7 }}>Scripture</span>
        </button>

        {/* Page dots */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              height: 5, borderRadius: 3,
              width: i === page ? 20 : 5,
              background: i === page
                ? "rgba(203,178,124,0.85)"
                : i < page ? "rgba(203,178,124,0.4)" : "rgba(255,255,255,0.12)",
              transition: "width 0.25s ease, background 0.25s ease",
            }} />
          ))}
        </div>
      </div>

      {/* Page strip */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div style={{
          display: "flex", height: "100%",
          transform: `translateX(${-page * 100}%)`,
          transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <VideoPage
            day={day} translation={translation} base={base}
            participants={participants ?? 1}
            onNext={() => goTo(1)}
          />
          <ReflectionPage
            day={day}
            onNext={() => goTo(2)}
            onPrev={() => goTo(0, -1)}
          />
          <AbidePage
            day={day} seriesId={seriesId}
            onDone={onComplete}
            onPrev={() => goTo(1, -1)}
          />
        </div>
      </div>

      {/* Onboarding overlay */}
      {participants === null && (
        <OnboardingOverlay onSelect={setParticipants} />
      )}
    </div>
  );
}

/* ─── Series detail — sequential day cards ──────────────────────────────── */
function SeriesDetail({ series, onStartDay, onBack }) {
  const completed = getCompleted();

  function isUnlocked(day) {
    return day.unlockAfter === null || day.unlockAfter === undefined || completed.has(day.unlockAfter);
  }
  function isDone(day) { return completed.has(day.id); }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-app)" }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10, background: "var(--bg-app)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", gap: 10,
        padding: "calc(env(safe-area-inset-top,0px) + 12px) 16px 12px",
      }}>
        <button onClick={onBack} style={{
          height: 34, borderRadius: 9, flexShrink: 0, padding: "0 12px 0 8px",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)",
          cursor: "pointer", color: "var(--text-primary)",
          display: "flex", alignItems: "center", gap: 5,
          WebkitTapHighlightColor: "transparent",
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span style={{ fontSize: 13, fontFamily: "var(--font-ui, system-ui)", opacity: 0.7 }}>Scripture</span>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        {/* Series hero */}
        <div style={{ padding: "28px 20px 0" }}>
          <div style={{
            fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
            color: "rgba(203,178,124,0.45)", fontFamily: "var(--font-ui, system-ui)",
            marginBottom: 8,
          }}>
            {series.days.filter(d => completed.has(d.id)).length} / {series.days.length} complete
          </div>
          <h1 style={{
            fontFamily: "var(--font-ui, system-ui)", fontSize: 26, fontWeight: 300,
            color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 6,
          }}>
            {series.title}
          </h1>
          <p style={{
            fontFamily: "var(--font-body, Georgia, serif)", fontSize: 13.5,
            lineHeight: 1.65, color: "var(--text-primary)", opacity: 0.42,
            marginBottom: 16,
          }}>
            {series.description}
          </p>

          {/* Source credit */}
          {series.sourceCredit && (
            <a
              href={series.sourceCredit.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10, textDecoration: "none",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 12, color: "rgba(203,178,124,0.7)", fontFamily: "var(--font-ui, system-ui)" }}>
                ▶
              </span>
              <span style={{ fontSize: 12, color: "var(--text-primary)", opacity: 0.6, fontFamily: "var(--font-ui, system-ui)" }}>
                {series.sourceCredit.name}
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>

        {/* Divider */}
        <div style={{
          height: 1, margin: "20px 20px 20px",
          background: "linear-gradient(90deg, rgba(203,178,124,0.2), transparent)",
        }} />

        {/* Day cards */}
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {series.days.map((day, idx) => {
            const unlocked = isUnlocked(day);
            const done = isDone(day);
            const isNext = !done && unlocked && (idx === 0 || isDone(series.days[idx - 1]));

            return (
              <button
                key={day.id}
                onClick={() => unlocked && onStartDay(day, idx)}
                disabled={!unlocked}
                style={{
                  width: "100%", textAlign: "left", cursor: unlocked ? "pointer" : "default",
                  borderRadius: 14, overflow: "hidden",
                  border: isNext
                    ? "1px solid rgba(203,178,124,0.35)"
                    : done ? "1px solid rgba(203,178,124,0.15)"
                    : "1px solid rgba(255,255,255,0.06)",
                  position: "relative",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {/* Video thumbnail */}
                <div style={{ position: "relative", width: "100%", aspectRatio: "16/6", overflow: "hidden" }}>
                  <img
                    src={`https://img.youtube.com/vi/${day.videoId}/hqdefault.jpg`}
                    alt={day.title}
                    style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      opacity: unlocked ? (done ? 0.45 : 0.7) : 0.2,
                      filter: unlocked ? "none" : "grayscale(80%)",
                    }}
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(14,14,10,0.75))",
                  }} />
                  {!unlocked && (
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                      <span style={{
                        fontSize: 11, color: "rgba(255,255,255,0.35)",
                        fontFamily: "var(--font-ui, system-ui)", letterSpacing: "0.04em",
                      }}>
                        Complete {series.days[idx - 1]?.title} to unlock
                      </span>
                    </div>
                  )}
                  {done && (
                    <div style={{
                      position: "absolute", top: 10, right: 10,
                      width: 26, height: 26, borderRadius: "50%",
                      background: "rgba(203,178,124,0.85)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="#141410" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                  {isNext && (
                    <div style={{
                      position: "absolute", top: 10, left: 10,
                      padding: "3px 9px", borderRadius: 100,
                      background: "rgba(203,178,124,0.9)",
                      fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
                      color: "#141410", fontFamily: "var(--font-ui, system-ui)",
                      textTransform: "uppercase",
                    }}>
                      Today
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div style={{
                  padding: "14px 16px",
                  background: isNext ? "rgba(203,178,124,0.06)" : "rgba(255,255,255,0.02)",
                }}>
                  <div style={{
                    fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "rgba(203,178,124,0.5)", fontFamily: "var(--font-ui, system-ui)",
                    marginBottom: 4,
                  }}>
                    {day.subtitle}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-ui, system-ui)", fontSize: 15, fontWeight: 400,
                    color: "var(--text-primary)", opacity: unlocked ? 0.9 : 0.4,
                  }}>
                    {day.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ height: "calc(env(safe-area-inset-bottom,0px) + 48px)" }} />
      </div>
    </div>
  );
}

/* ─── Shared header bar ──────────────────────────────────────────────────── */
function DAHeader({ title, onBack, backLabel }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 10, background: "var(--bg-app)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      display: "flex", alignItems: "center", gap: 12,
      padding: "calc(env(safe-area-inset-top,0px) + 12px) 16px 12px",
      flexShrink: 0,
    }}>
      <button onClick={onBack} style={{
        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)",
        cursor: "pointer", color: "var(--text-primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <div>
        {backLabel && (
          <div style={{
            fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "rgba(203,178,124,0.38)", fontFamily: "var(--font-ui, system-ui)",
            marginBottom: 1,
          }}>{backLabel}</div>
        )}
        <h1 style={{
          fontFamily: "var(--font-ui, system-ui)", fontSize: 17, fontWeight: 400,
          color: "var(--text-primary)", margin: 0,
        }}>{title}</h1>
      </div>
    </div>
  );
}

/* ─── Shared series cover card ───────────────────────────────────────────── */
function SeriesCoverCard({ series, label, onPress }) {
  return (
    <button
      onClick={onPress}
      style={{
        width: "100%", textAlign: "left", cursor: "pointer",
        borderRadius: 16, overflow: "hidden",
        border: "1px solid rgba(203,178,124,0.2)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/7", overflow: "hidden" }}>
        {series.coverVideoId ? (
          <img
            src={`https://img.youtube.com/vi/${series.coverVideoId}/hqdefault.jpg`}
            alt={series.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.72 }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(135deg, rgba(203,178,124,0.1) 0%, rgba(10,10,8,0.95) 100%)",
          }} />
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(14,14,10,0.85) 100%)",
        }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 18px 14px" }}>
          <div style={{
            fontSize: 22, fontWeight: 300, fontFamily: "var(--font-ui, system-ui)",
            color: "var(--text-primary)", lineHeight: 1.2,
          }}>{series.title}</div>
          <div style={{
            fontSize: 12, fontFamily: "var(--font-ui, system-ui)",
            color: "rgba(203,178,124,0.5)", marginTop: 2,
          }}>{series.subtitle}</div>
        </div>
      </div>
      <div style={{
        padding: "14px 18px", background: "rgba(203,178,124,0.04)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{
          fontFamily: "var(--font-body, Georgia, serif)", fontSize: 13,
          color: "var(--text-primary)", opacity: 0.42, lineHeight: 1.5,
          flex: 1, marginRight: 12,
        }}>
          {series.description.slice(0, 80)}…
        </div>
        <div style={{
          fontFamily: "var(--font-ui, system-ui)", fontSize: 11,
          color: "rgba(203,178,124,0.65)", whiteSpace: "nowrap",
        }}>
          {label ?? "Begin →"}
        </div>
      </div>
    </button>
  );
}

/* ─── Top-level series list ──────────────────────────────────────────────── */
function SeriesList({ index, onSelectSeries, onSelectSource, onBack }) {
  const direct = index.filter((s) =>
    (s.format === "video-daily" || s.format === "scripture-guided") && !s.source
  );

  // Collect unique sources in order
  const sources = [];
  const seenSources = new Set();
  index.filter((s) => s.source).forEach((s) => {
    if (!seenSources.has(s.source)) {
      seenSources.add(s.source);
      sources.push(s.source);
    }
  });

  const SOURCE_META = {
    "bible-project": {
      name: "The Bible Project",
      subtitle: "Animated Bible Videos",
      description: "The Bible Project creates free animated videos, podcasts, and educational resources that explore the Bible as a unified story leading to Jesus.",
      coverVideoId: "GQI72THyO5I",
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-app)" }}>
      <DAHeader title="Daily Abiding" onBack={onBack} />

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ padding: "20px 20px 10px" }}>
          <p style={{
            fontFamily: "var(--font-body, Georgia, serif)", fontSize: 14,
            lineHeight: 1.7, color: "var(--text-primary)", opacity: 0.4,
            fontStyle: "italic",
          }}>
            Read. Reflect. Complete each session to unlock the next.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "4px 16px" }}>
          {/* Direct series (e.g. Holy Spirit) */}
          {direct.map((s) => (
            <SeriesCoverCard key={s.id} series={s} onPress={() => onSelectSeries(s)} />
          ))}

          {/* Source cards (e.g. The Bible Project) */}
          {sources.map((srcId) => {
            const meta = SOURCE_META[srcId] ?? { name: srcId, description: "", coverVideoId: null };
            return (
              <button
                key={srcId}
                onClick={() => onSelectSource(srcId)}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  borderRadius: 16, overflow: "hidden",
                  border: "1px solid rgba(203,178,124,0.2)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <div style={{ position: "relative", width: "100%", aspectRatio: "16/7", overflow: "hidden" }}>
                  {meta.coverVideoId ? (
                    <img
                      src={`https://img.youtube.com/vi/${meta.coverVideoId}/hqdefault.jpg`}
                      alt={meta.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.72 }}
                    />
                  ) : (
                    <div style={{
                      width: "100%", height: "100%",
                      background: "linear-gradient(135deg, rgba(203,178,124,0.1) 0%, rgba(10,10,8,0.95) 100%)",
                    }} />
                  )}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(14,14,10,0.85) 100%)",
                  }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 18px 14px" }}>
                    <div style={{
                      fontSize: 22, fontWeight: 300, fontFamily: "var(--font-ui, system-ui)",
                      color: "var(--text-primary)", lineHeight: 1.2,
                    }}>{meta.name}</div>
                    <div style={{
                      fontSize: 12, fontFamily: "var(--font-ui, system-ui)",
                      color: "rgba(203,178,124,0.5)", marginTop: 2,
                    }}>{meta.subtitle}</div>
                  </div>
                </div>
                <div style={{
                  padding: "14px 18px", background: "rgba(203,178,124,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{
                    fontFamily: "var(--font-body, Georgia, serif)", fontSize: 13,
                    color: "var(--text-primary)", opacity: 0.42, lineHeight: 1.5,
                    flex: 1, marginRight: 12,
                  }}>
                    {meta.description.slice(0, 80)}…
                  </div>
                  <div style={{
                    fontFamily: "var(--font-ui, system-ui)", fontSize: 11,
                    color: "rgba(203,178,124,0.65)", whiteSpace: "nowrap",
                  }}>
                    Explore →
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ height: "calc(env(safe-area-inset-bottom,0px) + 48px)" }} />
      </div>
    </div>
  );
}

/* ─── Source view (e.g. The Bible Project) ───────────────────────────────── */
function SourceView({ source, index, onSelectGroup, onBack }) {
  const SOURCE_META = {
    "bible-project": {
      name: "The Bible Project",
      description: "The Bible Project creates free animated videos, podcasts, and educational resources that explore the Bible as a unified story leading to Jesus. Their goal is to help people read the Bible with depth and clarity — for free, for everyone.",
      link: "https://bibleproject.com/",
    },
  };
  const GROUP_META = {
    "old-testament": {
      name: "Old Testament",
      subtitle: "The Hebrew Scriptures",
      description: "Walk through the books of the Old Testament one video at a time. Watch, reflect, and pray.",
      coverVideoId: "GQI72THyO5I",
    },
  };

  const meta = SOURCE_META[source] ?? { name: source, description: "", link: null };

  // Collect unique groups for this source
  const groups = [];
  const seenGroups = new Set();
  index.filter((s) => s.source === source && s.group).forEach((s) => {
    if (!seenGroups.has(s.group)) {
      seenGroups.add(s.group);
      groups.push(s.group);
    }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-app)" }}>
      <DAHeader title={meta.name} onBack={onBack} backLabel="Daily Abiding" />

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ padding: "24px 20px 20px" }}>
          <p style={{
            fontFamily: "var(--font-body, Georgia, serif)", fontSize: 14,
            lineHeight: 1.8, color: "var(--text-primary)", opacity: 0.55,
            margin: "0 0 20px",
          }}>
            {meta.description}
          </p>
          {meta.link && (
            <a
              href={meta.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                textDecoration: "none", padding: "9px 16px",
                borderRadius: 100,
                background: "rgba(203,178,124,0.07)",
                border: "1px solid rgba(203,178,124,0.22)",
                fontSize: 12, fontFamily: "var(--font-ui, system-ui)",
                color: "rgba(203,178,124,0.8)", letterSpacing: "0.04em",
              }}
            >
              Visit {meta.name}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "0 16px" }}>
          {groups.map((grpId) => {
            const grp = GROUP_META[grpId] ?? { name: grpId, subtitle: "", description: "", coverVideoId: null };
            const count = index.filter((s) => s.source === source && s.group === grpId).length;
            return (
              <button
                key={grpId}
                onClick={() => onSelectGroup(grpId)}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  borderRadius: 16, overflow: "hidden",
                  border: "1px solid rgba(203,178,124,0.2)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <div style={{ position: "relative", width: "100%", aspectRatio: "16/7", overflow: "hidden" }}>
                  {grp.coverVideoId ? (
                    <img
                      src={`https://img.youtube.com/vi/${grp.coverVideoId}/hqdefault.jpg`}
                      alt={grp.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.72 }}
                    />
                  ) : (
                    <div style={{
                      width: "100%", height: "100%",
                      background: "linear-gradient(135deg, rgba(203,178,124,0.1) 0%, rgba(10,10,8,0.95) 100%)",
                    }} />
                  )}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(14,14,10,0.85) 100%)",
                  }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 18px 14px" }}>
                    <div style={{
                      fontSize: 22, fontWeight: 300, fontFamily: "var(--font-ui, system-ui)",
                      color: "var(--text-primary)", lineHeight: 1.2,
                    }}>{grp.name}</div>
                    <div style={{
                      fontSize: 12, fontFamily: "var(--font-ui, system-ui)",
                      color: "rgba(203,178,124,0.5)", marginTop: 2,
                    }}>{count} series</div>
                  </div>
                </div>
                <div style={{
                  padding: "14px 18px", background: "rgba(203,178,124,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{
                    fontFamily: "var(--font-body, Georgia, serif)", fontSize: 13,
                    color: "var(--text-primary)", opacity: 0.42, lineHeight: 1.5,
                    flex: 1, marginRight: 12,
                  }}>
                    {grp.description}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-ui, system-ui)", fontSize: 11,
                    color: "rgba(203,178,124,0.65)", whiteSpace: "nowrap",
                  }}>
                    Explore →
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ height: "calc(env(safe-area-inset-bottom,0px) + 48px)" }} />
      </div>
    </div>
  );
}

/* ─── Group view (e.g. Old Testament) — grouped by book ─────────────────── */
const BOOK_META = {
  genesis:     { name: "Genesis",     coverVideoId: "GQI72THyO5I" },
  exodus:      { name: "Exodus",      coverVideoId: "jH_aojNJM3E" },
  leviticus:   { name: "Leviticus",   coverVideoId: "IJ-FekWUZzE" },
  numbers:     { name: "Numbers",     coverVideoId: "tp5MIrMZFqo" },
  deuteronomy: { name: "Deuteronomy", coverVideoId: "q5QEH9bH8AU" },
};

function GroupView({ group, source, index, onSelectSeries, onSelectBook, onBack }) {
  const GROUP_META = {
    "old-testament": { name: "Old Testament", subtitle: "The Hebrew Scriptures" },
  };
  const SOURCE_META = {
    "bible-project": { name: "The Bible Project" },
  };
  const grp = GROUP_META[group] ?? { name: group, subtitle: "" };
  const src = SOURCE_META[source] ?? { name: source };

  const series = index.filter((s) => s.source === source && s.group === group);

  // Group by book, preserving order
  const books = [];
  const seenBooks = new Map();
  series.forEach((s) => {
    const bookId = s.book || s.id;
    if (!seenBooks.has(bookId)) { seenBooks.set(bookId, []); books.push({ bookId, items: seenBooks.get(bookId) }); }
    seenBooks.get(bookId).push(s);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-app)" }}>
      <DAHeader title={grp.name} onBack={onBack} backLabel={src.name} />

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ padding: "20px 20px 10px" }}>
          <p style={{
            fontFamily: "var(--font-body, Georgia, serif)", fontSize: 14,
            lineHeight: 1.7, color: "var(--text-primary)", opacity: 0.4, fontStyle: "italic",
          }}>
            {grp.subtitle}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "4px 16px" }}>
          {books.map(({ bookId, items }) => {
            if (items.length === 1) {
              return <SeriesCoverCard key={bookId} series={items[0]} onPress={() => onSelectSeries(items[0])} />;
            }
            const meta = BOOK_META[bookId] ?? { name: bookId, coverVideoId: items[0].coverVideoId };
            return (
              <button
                key={bookId}
                onClick={() => onSelectBook(bookId, items)}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  borderRadius: 16, overflow: "hidden",
                  border: "1px solid rgba(203,178,124,0.2)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <div style={{ position: "relative", width: "100%", aspectRatio: "16/7", overflow: "hidden" }}>
                  <img
                    src={`https://img.youtube.com/vi/${meta.coverVideoId}/hqdefault.jpg`}
                    alt={meta.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.72 }}
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(14,14,10,0.85) 100%)",
                  }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 18px 14px" }}>
                    <div style={{
                      fontSize: 22, fontWeight: 300, fontFamily: "var(--font-ui, system-ui)",
                      color: "var(--text-primary)", lineHeight: 1.2,
                    }}>{meta.name}</div>
                    <div style={{
                      fontSize: 12, fontFamily: "var(--font-ui, system-ui)",
                      color: "rgba(203,178,124,0.5)", marginTop: 2,
                    }}>{items.length} parts</div>
                  </div>
                </div>
                <div style={{
                  padding: "14px 18px", background: "rgba(203,178,124,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{
                    fontFamily: "var(--font-body, Georgia, serif)", fontSize: 13,
                    color: "var(--text-primary)", opacity: 0.42, lineHeight: 1.5,
                    flex: 1, marginRight: 12,
                  }}>
                    {items[0].description.slice(0, 80)}…
                  </div>
                  <div style={{
                    fontFamily: "var(--font-ui, system-ui)", fontSize: 11,
                    color: "rgba(203,178,124,0.65)", whiteSpace: "nowrap",
                  }}>
                    Explore →
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ height: "calc(env(safe-area-inset-bottom,0px) + 48px)" }} />
      </div>
    </div>
  );
}

/* ─── Book view (e.g. Genesis → Part 1 / Part 2) ────────────────────────── */
function BookView({ book, items, onSelectSeries, onBack }) {
  const meta = BOOK_META[book] ?? { name: book };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-app)" }}>
      <DAHeader title={meta.name} onBack={onBack} backLabel="Old Testament" />

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "20px 16px" }}>
          {items.map((s) => (
            <SeriesCoverCard key={s.id} series={s} onPress={() => onSelectSeries(s)} />
          ))}
        </div>
        <div style={{ height: "calc(env(safe-area-inset-bottom,0px) + 48px)" }} />
      </div>
    </div>
  );
}

/* ─── Root ───────────────────────────────────────────────────────────────── */
export default function DailyAbidingScreen({ onBack, translation = "KJV" }) {
  const [view, setView] = useState("list");
  const [index, setIndex] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [activeDay, setActiveDay] = useState(null);
  const [activeSource, setActiveSource] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeBook, setActiveBook] = useState(null);

  const base = import.meta.env.BASE_URL ?? "/";

  useEffect(() => {
    fetch(`${base}data/devotionals/index.json`)
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => {});
  }, [base]);

  async function handleSelectSeries(meta) {
    if (meta.format === "scripture-guided") {
      try {
        const file = meta.dataFile ?? "day.json";
        const res = await fetch(`${base}data/devotionals/${meta.id}/${file}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setActiveDay(data);
        setView("scripture-guided");
      } catch { /* silent */ }
      return;
    }
    try {
      const file = meta.seriesFile ?? "series.json";
      const res = await fetch(`${base}data/devotionals/${meta.id}/${file}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.videoId && Array.isArray(data.days)) {
        data.days = data.days.map(d => d.videoId ? d : { ...d, videoId: data.videoId });
      }
      const loaded = { ...data, format: meta.format };
      setSelectedSeries(loaded);
      if (loaded.days?.length === 1) {
        setActiveDay(loaded.days[0]);
        setView("day");
      } else {
        setView("series");
      }
    } catch { /* silent */ }
  }

  function handleStartDay(day, idx) {
    setActiveDay(day);
    setView("day");
  }

  function handleDayComplete() {
    setView("series");
    setActiveDay(null);
    // Re-render series to pick up new completed state
    setSelectedSeries((s) => s ? { ...s } : s);
  }

  return (
    <>
      <style>{`
        @keyframes da-spin { to { transform: rotate(360deg) } }
        @keyframes da-fade-in { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes da-sheet-up { from { transform:translateY(100%) } to { transform:translateY(0) } }
      `}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 45, background: "var(--bg-app)" }}>
        {view === "list" && (
          <SeriesList
            index={index}
            onSelectSeries={handleSelectSeries}
            onSelectSource={(src) => { setActiveSource(src); setView("source"); }}
            onBack={onBack}
          />
        )}
        {view === "source" && activeSource && (
          <SourceView
            source={activeSource}
            index={index}
            onSelectGroup={(grp) => { setActiveGroup(grp); setView("group"); }}
            onBack={() => setView("list")}
          />
        )}
        {view === "group" && activeGroup && (
          <GroupView
            group={activeGroup}
            source={activeSource}
            index={index}
            onSelectSeries={handleSelectSeries}
            onSelectBook={(book, items) => { setActiveBook({ book, items }); setView("book"); }}
            onBack={() => setView("source")}
          />
        )}
        {view === "book" && activeBook && (
          <BookView
            book={activeBook.book}
            items={activeBook.items}
            onSelectSeries={handleSelectSeries}
            onBack={() => setView("group")}
          />
        )}
        {view === "series" && selectedSeries && (
          <SeriesDetail
            series={selectedSeries}
            onStartDay={handleStartDay}
            onBack={() => setView(activeBook ? "book" : activeGroup ? "group" : "list")}
          />
        )}
        {view === "scripture-guided" && activeDay && (
          <ScriptureGuidedDay
            day={activeDay}
            translation={translation}
            base={base}
            onComplete={() => { setView("list"); setActiveDay(null); }}
            onBack={onBack}
          />
        )}
        {view === "day" && activeDay && (
          <DayExperience
            day={activeDay}
            seriesId={selectedSeries?.id}
            translation={translation}
            base={base}
            onComplete={handleDayComplete}
            onBack={onBack}
          />
        )}
      </div>
    </>
  );
}
