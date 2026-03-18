/**
 * ChristRevealedIntro.jsx
 * Cinematic first-time intro for Christ Revealed: The Redemption Pilgrimage.
 * Shown once — stores completion in localStorage under "cr_intro_seen".
 *
 * - Road/pilgrimage SVG as the hero icon
 * - Colossians 1:27 in the user's active translation (KJV / WAE / ASR)
 * - Four pillar cards are tappable with brief expandable descriptions
 * - Footer: "God speaks through His Word"
 */

import { useState, useEffect } from "react";

/* ── Colossians 1:27 across all three translations ── */
const VERSE_BY_TRANSLATION = {
  KJV: {
    text: "To whom God would make known what is the riches of the glory of this mystery among the Gentiles; which is Christ in you, the hope of glory.",
    reference: "Colossians 1:27 · KJV",
  },
  WAE: {
    text: "To whom God was pleased to make known what are the riches of the glory of this mystery among the Gentiles, which is Christ in you, the hope of glory.",
    reference: "Colossians 1:27 · WAE",
  },
  ASR: {
    text: "To them God chose to make known how great among the Gentiles are the riches of the glory of this mystery, which is Christ in you, the hope of glory.",
    reference: "Colossians 1:27 · ASR",
  },
};

/* ── Four pillar cards ── */
const PILLARS = [
  {
    symbol: "✦",
    label: "Where Christ is revealed",
    detail:
      "Observations drawn from the text showing how each passage points toward Jesus — as type, prophecy, or fulfillment.",
  },
  {
    symbol: "◈",
    label: "Where the enemy opposes",
    detail:
      "Thematic patterns in the text where Satan attempts to obstruct, corrupt, or destroy God's redemptive plan.",
  },
  {
    symbol: "⊕",
    label: "How Scripture connects",
    detail:
      "Cross-references that link the passage to its fulfillment elsewhere in Scripture. Read and weigh them yourself.",
  },
  {
    symbol: "◇",
    label: "Questions to bring to God",
    detail:
      "A reflection prompt — not a directive. Bring it to the text and to God in prayer. He is the one who reveals.",
  },
];

/* ─────────────────────────────────────────────────────────
   Road / Pilgrimage SVG
───────────────────────────────────────────────────────── */
function RoadIcon({ size = 80 }) {
  const w = size;
  const h = size;

  const hx = w / 2;
  const hy = h * 0.28;

  const leftX = w * 0.12;
  const rightX = w * 0.88;
  const bottomY = h * 0.98;

  const sLeftX = w * 0.22;
  const sRightX = w * 0.78;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sky glow at horizon */}
      <ellipse
        cx={hx}
        cy={hy}
        rx={w * 0.32}
        ry={h * 0.14}
        fill="#C4A96B"
        opacity="0.13"
      />
      <ellipse
        cx={hx}
        cy={hy}
        rx={w * 0.14}
        ry={h * 0.07}
        fill="#C4A96B"
        opacity="0.22"
      />

      {/* Road surface */}
      <path
        d={`M${leftX},${bottomY} L${hx},${hy} L${rightX},${bottomY} Z`}
        fill="#C4A96B"
        opacity="0.07"
      />

      {/* Road edges */}
      <line
        x1={leftX}
        y1={bottomY}
        x2={hx}
        y2={hy}
        stroke="#C4A96B"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
      <line
        x1={rightX}
        y1={bottomY}
        x2={hx}
        y2={hy}
        stroke="#C4A96B"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* Shoulder lines */}
      <line
        x1={sLeftX}
        y1={bottomY}
        x2={hx}
        y2={hy}
        stroke="#C4A96B"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.25"
      />
      <line
        x1={sRightX}
        y1={bottomY}
        x2={hx}
        y2={hy}
        stroke="#C4A96B"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.25"
      />

      {/* Centre dashes — perspective scaled */}
      {[0.92, 0.79, 0.67, 0.56, 0.46].map((t, i) => {
        const bx = w / 2;
        const x1 = bx + (hx - bx) * t;
        const y1 = bottomY + (hy - bottomY) * t;
        const t2 = t - 0.05;
        const x2 = bx + (hx - bx) * t2;
        const y2 = bottomY + (hy - bottomY) * t2;
        const op = 0.2 + i * 0.07;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#C4A96B"
            strokeWidth={1.4 - i * 0.2}
            strokeLinecap="round"
            opacity={op}
          />
        );
      })}

      {/* Horizon light */}
      <circle cx={hx} cy={hy} r={2.2} fill="#C4A96B" opacity="0.9" />
      <circle cx={hx} cy={hy} r={4.5} fill="#C4A96B" opacity="0.25" />

      {/* Ground line */}
      <line
        x1={w * 0.05}
        y1={bottomY}
        x2={w * 0.95}
        y2={bottomY}
        stroke="#C4A96B"
        strokeWidth="0.6"
        opacity="0.2"
      />

      {/* Pilgrim figure */}
      <ellipse
        cx={hx}
        cy={hy - 7}
        rx={1.4}
        ry={2.2}
        fill="#C4A96B"
        opacity="0.55"
      />
      <circle cx={hx} cy={hy - 10.5} r={1.6} fill="#C4A96B" opacity="0.55" />
      <line
        x1={hx + 2.2}
        y1={hy - 9}
        x2={hx + 3.5}
        y2={hy - 2}
        stroke="#C4A96B"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

export default function ChristRevealedIntro({
  onComplete,
  translation = "KJV",
}) {
  const [phase, setPhase] = useState(0);
  const [activePillar, setActivePillar] = useState(null);

  const verse =
    VERSE_BY_TRANSLATION[translation] || VERSE_BY_TRANSLATION["ASR"];

  useEffect(() => {
    const timings = [400, 1000, 1800, 2800, 4000];
    const timers = timings.map((delay, i) =>
      setTimeout(() => setPhase(i + 1), delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  function handleBegin() {
    localStorage.setItem("cr_intro_seen", "true");
    onComplete();
  }

  function togglePillar(idx) {
    setActivePillar((prev) => (prev === idx ? null : idx));
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#0D0C09",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 32px",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes cr-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cr-fade-in-slow {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cr-glow-pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
        @keyframes cr-line-expand {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        @keyframes cr-detail-open {
          from { opacity: 0; max-height: 0; padding-top: 0; }
          to   { opacity: 1; max-height: 120px; padding-top: 8px; }
        }
        .cr-phase-1  { opacity: 0; animation: cr-fade-in-slow 1.4s ease forwards; }
        .cr-phase-2  { opacity: 0; animation: cr-fade-in 1s ease forwards; }
        .cr-phase-3  { opacity: 0; animation: cr-fade-in 1s ease 0.1s forwards; }
        .cr-pillar-0 { opacity: 0; animation: cr-fade-in 0.6s ease 0.00s forwards; }
        .cr-pillar-1 { opacity: 0; animation: cr-fade-in 0.6s ease 0.15s forwards; }
        .cr-pillar-2 { opacity: 0; animation: cr-fade-in 0.6s ease 0.30s forwards; }
        .cr-pillar-3 { opacity: 0; animation: cr-fade-in 0.6s ease 0.45s forwards; }
        .cr-cta      { opacity: 0; animation: cr-fade-in 0.8s ease forwards; }
        .cr-glow     { animation: cr-glow-pulse 3s ease-in-out infinite; }
        .cr-line     { transform-origin: center; animation: cr-line-expand 0.8s cubic-bezier(0.22,1,0.36,1) forwards; }
        .cr-detail   { overflow: hidden; animation: cr-detail-open 0.25s ease forwards; }
        .cr-pillar-btn {
          -webkit-tap-highlight-color: transparent;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .cr-pillar-btn:active { opacity: 0.8; }
      `}</style>

      {/* Ambient background glow */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(196,169,107,0.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Phase 1 — Road icon */}
      {phase >= 1 && (
        <div className="cr-phase-1" style={{ marginBottom: "24px" }}>
          <div
            className="cr-glow"
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              border: "1px solid rgba(196,169,107,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(196,169,107,0.04)",
            }}
          >
            <RoadIcon size={58} />
          </div>
        </div>
      )}

      {/* Phase 2 — Title */}
      {phase >= 2 && (
        <div
          className="cr-phase-2"
          style={{ textAlign: "center", marginBottom: "8px" }}
        >
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(196,169,107,0.6)",
              fontFamily: "var(--font-ui, system-ui)",
              marginBottom: "12px",
            }}
          >
            The Redemption Pilgrimage
          </div>
          <h1
            style={{
              fontSize: "34px",
              fontWeight: "300",
              letterSpacing: "0.04em",
              color: "#F0EBE0",
              fontFamily: "var(--font-ui, system-ui)",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Christ Revealed
          </h1>
        </div>
      )}

      {/* Ornamental line */}
      {phase >= 2 && (
        <div
          className="cr-line"
          style={{
            width: "48px",
            height: "1px",
            background: "rgba(196,169,107,0.4)",
            margin: "20px auto 22px",
          }}
        />
      )}

      {/* Phase 3 — Verse */}
      {phase >= 3 && (
        <div
          className="cr-phase-3"
          style={{
            textAlign: "center",
            maxWidth: "300px",
            marginBottom: "28px",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.75,
              fontStyle: "italic",
              color: "rgba(240,235,224,0.7)",
              fontFamily: "var(--font-body, Georgia, serif)",
              margin: "0 0 10px",
            }}
          >
            "{verse.text}"
          </p>
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              color: "rgba(196,169,107,0.55)",
              fontFamily: "var(--font-ui, system-ui)",
              margin: 0,
            }}
          >
            — {verse.reference}
          </p>
        </div>
      )}

      {/* Phase 4 — Tappable pillar cards */}
      {phase >= 4 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            width: "100%",
            maxWidth: "320px",
            marginBottom: "24px",
          }}
        >
          {PILLARS.map((p, i) => (
            <button
              key={p.label}
              className={`cr-pillar-${i} cr-pillar-btn`}
              onClick={() => togglePillar(i)}
              style={{
                background:
                  activePillar === i
                    ? "rgba(196,169,107,0.11)"
                    : "rgba(196,169,107,0.05)",
                border:
                  activePillar === i
                    ? "1px solid rgba(196,169,107,0.32)"
                    : "1px solid rgba(196,169,107,0.11)",
                borderRadius: "12px",
                padding: "12px 10px",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "7px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#C4A96B",
                      flexShrink: 0,
                      lineHeight: 1.3,
                      marginTop: "1px",
                    }}
                  >
                    {p.symbol}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "rgba(240,235,224,0.7)",
                      fontFamily: "var(--font-ui, system-ui)",
                      lineHeight: 1.35,
                    }}
                  >
                    {p.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "9px",
                    color: "rgba(196,169,107,0.45)",
                    flexShrink: 0,
                    marginTop: "3px",
                    display: "inline-block",
                    transform:
                      activePillar === i ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  ▾
                </span>
              </div>

              {/* Expandable detail */}
              {activePillar === i && (
                <div className="cr-detail">
                  <p
                    style={{
                      fontSize: "11px",
                      lineHeight: 1.55,
                      color: "rgba(240,235,224,0.45)",
                      fontFamily: "var(--font-ui, system-ui)",
                      margin: 0,
                      fontStyle: "italic",
                    }}
                  >
                    {p.detail}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Phase 5 — Notice + CTA */}
      {phase >= 5 && (
        <div
          className="cr-cta"
          style={{ width: "100%", maxWidth: "320px", textAlign: "center" }}
        >
          {/* Study tool notice */}
          <div
            style={{
              background: "rgba(196,169,107,0.04)",
              border: "1px solid rgba(196,169,107,0.14)",
              borderRadius: "10px",
              padding: "13px 16px",
              marginBottom: "18px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                lineHeight: 1.65,
                color: "rgba(240,235,224,0.42)",
                fontFamily: "var(--font-ui, system-ui)",
                margin: 0,
                fontStyle: "italic",
              }}
            >
              These observations are a study guide, not Scripture. The Holy
              Spirit — not this tool — is the teacher.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={handleBegin}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              background: "#C4A96B",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-ui, system-ui)",
              fontSize: "15px",
              fontWeight: "600",
              letterSpacing: "0.04em",
              color: "#1A1510",
              WebkitTapHighlightColor: "transparent",
              transition: "opacity 0.15s ease",
            }}
            onTouchStart={(e) => (e.currentTarget.style.opacity = "0.82")}
            onTouchEnd={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Begin the Pilgrimage
          </button>

          <p
            style={{
              fontSize: "11px",
              color: "rgba(240,235,224,0.18)",
              fontFamily: "var(--font-ui, system-ui)",
              marginTop: "14px",
              letterSpacing: "0.04em",
            }}
          >
            Shown once · God speaks through His Word
          </p>
        </div>
      )}
    </div>
  );
}
