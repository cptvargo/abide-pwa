import { useState } from "react";

const COMPLETED_KEY = "abide_daily_completed_v1";
function markComplete(id) {
  try {
    const s = new Set(JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]"));
    s.add(id);
    localStorage.setItem(COMPLETED_KEY, JSON.stringify([...s]));
  } catch {}
}

/* ─── Verse bottom sheet (uses embedded text from pill object) ────────────── */
function VerseSheet({ pill, translation, onClose }) {
  if (!pill) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)" }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
        background: "var(--bg-app)",
        borderTop: "1px solid rgba(203,178,124,0.2)",
        borderRadius: "20px 20px 0 0",
        padding: "0 24px calc(env(safe-area-inset-bottom,0px) + 32px)",
        animation: "sgd-sheet-up 0.28s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "12px auto 24px" }} />
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
          color: "rgba(203,178,124,0.6)", fontFamily: "var(--font-ui, system-ui)", marginBottom: 8,
        }}>
          {pill.reference}
        </div>
        {translation && (
          <div style={{
            display: "inline-block", fontSize: 10, letterSpacing: "0.08em",
            background: "rgba(203,178,124,0.1)", border: "1px solid rgba(203,178,124,0.2)",
            borderRadius: 6, padding: "2px 8px", marginBottom: 16,
            color: "rgba(203,178,124,0.7)", fontFamily: "var(--font-ui, system-ui)",
          }}>
            {translation}
          </div>
        )}
        <p style={{
          fontFamily: "var(--font-body, Georgia, serif)", fontSize: 17, lineHeight: 1.9,
          color: "var(--text-primary)", opacity: 0.88, margin: 0,
        }}>
          {pill.text}
        </p>
      </div>
    </>
  );
}

/* ─── Shared layout helpers ─────────────────────────────────────────────── */
function PageWrapper({ children }) {
  return (
    <div style={{ width: "100%", flexShrink: 0, height: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ padding: "32px 22px 0", maxWidth: 560, margin: "0 auto" }}>
        {children}
      </div>
      <div style={{ height: "calc(env(safe-area-inset-bottom,0px) + 48px)" }} />
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase",
      color: "rgba(203,178,124,0.45)", fontFamily: "var(--font-ui, system-ui)",
      textAlign: "center", marginBottom: 24,
    }}>
      {children}
    </div>
  );
}

function SubLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
      color: "rgba(203,178,124,0.35)", fontFamily: "var(--font-ui, system-ui)", marginBottom: 16,
    }}>
      {children}
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: "0 0 48px", height: 48, borderRadius: 12, cursor: "pointer",
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "var(--text-primary)", opacity: 0.4,
      WebkitTapHighlightColor: "transparent",
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
    </button>
  );
}

function ContinueBtn({ onClick, label = "Continue" }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, height: 48, borderRadius: 12, cursor: "pointer",
      background: "rgba(203,178,124,0.12)", border: "1px solid rgba(203,178,124,0.28)",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      fontFamily: "var(--font-ui, system-ui)", fontSize: 14, fontWeight: 500,
      color: "rgba(203,178,124,0.9)",
      WebkitTapHighlightColor: "transparent",
    }}>
      {label}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </button>
  );
}

/* ─── Page 0 — Intro ────────────────────────────────────────────────────── */
function IntroPage({ day, onNext }) {
  return (
    <PageWrapper>
      <SectionLabel>✦ &nbsp; Daily Abiding</SectionLabel>

      <h1 style={{
        fontFamily: "var(--font-ui, system-ui)", fontSize: 30, fontWeight: 300,
        color: "var(--text-primary)", textAlign: "center", lineHeight: 1.15, marginBottom: 8,
      }}>
        {day.title}
      </h1>
      <p style={{
        fontFamily: "var(--font-body, Georgia, serif)", fontSize: 14,
        color: "rgba(203,178,124,0.6)", textAlign: "center", fontStyle: "italic", marginBottom: 40,
      }}>
        {day.subtitle}
      </p>

      <div style={{
        width: 1, height: 44,
        background: "linear-gradient(to bottom, transparent, rgba(203,178,124,0.35), transparent)",
        margin: "0 auto 40px",
      }} />

      {day.intro.map((para, i) => (
        <p key={i} style={{
          fontFamily: "var(--font-body, Georgia, serif)", fontSize: 17, lineHeight: 1.9,
          color: "var(--text-primary)", opacity: 0.85, fontStyle: "italic",
          textAlign: "center", marginBottom: 24,
        }}>
          {para}
        </p>
      ))}

      <div style={{ marginTop: 44 }}>
        <button onClick={onNext} style={{
          width: "100%", padding: "16px", borderRadius: 14, cursor: "pointer",
          background: "rgba(203,178,124,0.12)", border: "1px solid rgba(203,178,124,0.28)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          fontFamily: "var(--font-ui, system-ui)", fontSize: 14, fontWeight: 500,
          color: "rgba(203,178,124,0.9)",
          WebkitTapHighlightColor: "transparent",
        }}>
          Enter
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </PageWrapper>
  );
}

/* ─── Page 1 — Reading ──────────────────────────────────────────────────── */
function ReadingPage({ day, onNext, onPrev }) {
  const paragraphs = day.reading.split("\n\n");
  return (
    <PageWrapper>
      <SectionLabel>Reading</SectionLabel>

      {paragraphs.map((para, i) => (
        <p key={i} style={{
          fontFamily: "var(--font-body, Georgia, serif)", fontSize: 16.5, lineHeight: 1.95,
          color: "var(--text-primary)", opacity: 0.85, marginBottom: 26,
        }}>
          {para}
        </p>
      ))}

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <BackBtn onClick={onPrev} />
        <ContinueBtn onClick={onNext} />
      </div>
    </PageWrapper>
  );
}

/* ─── Page 2 — Scripture ────────────────────────────────────────────────── */
function ScripturePage({ day, onNext, onPrev, onPillClick }) {
  return (
    <PageWrapper>
      <SectionLabel>Scripture</SectionLabel>

      <p style={{
        fontFamily: "var(--font-body, Georgia, serif)", fontSize: 13,
        color: "var(--text-primary)", opacity: 0.35, textAlign: "center",
        fontStyle: "italic", marginBottom: 28,
      }}>
        Touch a verse to read it.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 40 }}>
        {day.scripturePills.map((pill) => (
          <button
            key={pill.reference}
            onClick={() => onPillClick(pill)}
            style={{
              padding: "7px 14px", borderRadius: 100, cursor: "pointer",
              background: "rgba(203,178,124,0.07)", border: "1px solid rgba(203,178,124,0.22)",
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
            {pill.reference}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <BackBtn onClick={onPrev} />
        <ContinueBtn onClick={onNext} />
      </div>
    </PageWrapper>
  );
}

/* ─── Page 3 — Worship ──────────────────────────────────────────────────── */
function WorshipPage({ day, onNext, onPrev }) {
  const w = day.worship;
  return (
    <PageWrapper>
      <SectionLabel>Worship</SectionLabel>

      <p style={{
        fontFamily: "var(--font-body, Georgia, serif)", fontSize: 17, lineHeight: 1.85,
        color: "var(--text-primary)", opacity: 0.78, fontStyle: "italic",
        textAlign: "center", marginBottom: 28,
      }}>
        {w.prompt}
      </p>

      <div style={{
        width: "100%", aspectRatio: "16/9",
        borderRadius: 12, overflow: "hidden", background: "#0a0a08", marginBottom: 12,
      }}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${w.videoId}?rel=0&modestbranding=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          title={w.song}
        />
      </div>

      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <span style={{
          fontFamily: "var(--font-ui, system-ui)", fontSize: 11,
          color: "rgba(203,178,124,0.45)", letterSpacing: "0.06em",
        }}>
          {w.song} &nbsp;·&nbsp; {w.artist}
        </span>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <BackBtn onClick={onPrev} />
        <ContinueBtn onClick={onNext} label="Continue to Abiding" />
      </div>
    </PageWrapper>
  );
}

/* ─── Page 4 — Abiding (Reflect + Respond) ──────────────────────────────── */
function AbidingPage({ day, onNext, onPrev }) {
  const { reflect, respond } = day.abiding;
  return (
    <PageWrapper>
      <SectionLabel>Abiding</SectionLabel>

      <SubLabel>Reflect</SubLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
        {reflect.map((q, i) => (
          <div key={i} style={{
            padding: "18px 20px", borderRadius: 12,
            background: "rgba(203,178,124,0.04)", border: "1px solid rgba(203,178,124,0.12)",
          }}>
            <p style={{
              fontFamily: "var(--font-body, Georgia, serif)", fontSize: 16, lineHeight: 1.85,
              color: "var(--text-primary)", opacity: 0.82, fontStyle: "italic", margin: 0,
            }}>
              {q}
            </p>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(203,178,124,0.25), transparent)", marginBottom: 32 }} />

      <SubLabel>Respond</SubLabel>
      <p style={{
        fontFamily: "var(--font-body, Georgia, serif)", fontSize: 16, lineHeight: 1.9,
        color: "var(--text-primary)", opacity: 0.75, fontStyle: "italic", marginBottom: 44,
      }}>
        {respond}
      </p>

      <div style={{ display: "flex", gap: 10 }}>
        <BackBtn onClick={onPrev} />
        <ContinueBtn onClick={onNext} label="Continue to Abide" />
      </div>
    </PageWrapper>
  );
}

/* ─── Page 5 — Abide (final statement + complete) ───────────────────────── */
function AbidePage({ day, onComplete, onPrev }) {
  const [done, setDone] = useState(false);

  function handleComplete() {
    markComplete(day.id);
    setDone(true);
    setTimeout(onComplete, 1200);
  }

  return (
    <div style={{
      width: "100%", flexShrink: 0, height: "100%",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ width: "100%", maxWidth: 560, padding: "0 32px", textAlign: "center" }}>

        <div style={{
          fontFamily: "var(--font-ui, system-ui)", fontSize: 10, fontWeight: 600,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "rgba(203,178,124,0.45)", marginBottom: 24,
        }}>
          ABIDE
        </div>

        <div style={{
          width: 1, height: 48,
          background: "linear-gradient(to bottom, transparent, rgba(203,178,124,0.3), transparent)",
          margin: "0 auto 36px",
        }} />

        <p style={{
          fontFamily: "var(--font-body, Georgia, serif)", fontSize: 19, lineHeight: 1.85,
          color: "var(--text-primary)", opacity: 0.88, fontStyle: "italic", margin: 0,
        }}>
          "{day.abide}"
        </p>

        <div style={{
          width: 1, height: 48,
          background: "linear-gradient(to bottom, transparent, rgba(203,178,124,0.3), transparent)",
          margin: "36px auto 24px",
        }} />

        <div style={{
          fontFamily: "var(--font-ui, system-ui)", fontSize: 10, fontWeight: 600,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "rgba(203,178,124,0.45)", marginBottom: 44,
        }}>
          BE STILL AND KNOW
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <BackBtn onClick={onPrev} />
          <button
            onClick={handleComplete}
            disabled={done}
            style={{
              flex: 1, height: 56, borderRadius: 100,
              cursor: done ? "default" : "pointer",
              background: done ? "rgba(203,178,124,0.22)" : "rgba(203,178,124,0.13)",
              border: "1px solid rgba(203,178,124,0.35)",
              fontFamily: "var(--font-ui, system-ui)", fontSize: 15, fontWeight: 500,
              color: "rgba(203,178,124,0.95)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "all 0.25s", letterSpacing: "0.02em",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {done ? (
              <>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(203,178,124,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Session Complete
              </>
            ) : "I Have Abided"}
          </button>
        </div>

      </div>
      <div style={{ height: "calc(env(safe-area-inset-bottom,0px) + 40px)" }} />
    </div>
  );
}

/* ─── Root ───────────────────────────────────────────────────────────────── */
export default function ScriptureGuidedDay({ day, onComplete, onBack, translation }) {
  const [page, setPage] = useState(0);
  const [activePill, setActivePill] = useState(null);
  const TOTAL = 6;

  return (
    <>
      <style>{`
        @keyframes sgd-spin { to { transform: rotate(360deg) } }
        @keyframes sgd-sheet-up { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
      <div style={{ position: "absolute", inset: 0, background: "var(--bg-app)", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
          padding: "calc(env(safe-area-inset-top,0px) + 10px) 16px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          <button onClick={onBack} style={{
            height: 34, borderRadius: 9, flexShrink: 0, padding: "0 12px 0 8px",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)",
            cursor: "pointer", color: "var(--text-primary)",
            display: "flex", alignItems: "center", gap: 5,
            WebkitTapHighlightColor: "transparent",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            <span style={{ fontSize: 13, fontFamily: "var(--font-ui, system-ui)", opacity: 0.7 }}>Scripture</span>
          </button>

          <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 6 }}>
            {Array.from({ length: TOTAL }).map((_, i) => (
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

          <div style={{ width: 34 }} />
        </div>

        {/* Page strip */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <div style={{
            display: "flex", height: "100%",
            transform: `translateX(${-page * 100}%)`,
            transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1)",
          }}>
            <IntroPage    day={day} onNext={() => setPage(1)} />
            <ReadingPage  day={day} onNext={() => setPage(2)} onPrev={() => setPage(0)} />
            <ScripturePage day={day} onNext={() => setPage(3)} onPrev={() => setPage(1)} onPillClick={setActivePill} />
            <WorshipPage  day={day} onNext={() => setPage(4)} onPrev={() => setPage(2)} />
            <AbidingPage  day={day} onNext={() => setPage(5)} onPrev={() => setPage(3)} />
            <AbidePage    day={day} onComplete={onComplete} onPrev={() => setPage(4)} />
          </div>
        </div>

      </div>

      {/* VerseSheet rendered outside the transform context so position:fixed works correctly */}
      <VerseSheet pill={activePill} translation={translation} onClose={() => setActivePill(null)} />
    </>
  );
}
