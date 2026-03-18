/**
 * BookTransition.jsx
 * Full-screen cinematic moment shown when a user completes the last
 * stop in a book and crosses the threshold into the next one.
 *
 * Design: darkness, then the journey label fades in small,
 * then the book name rises large. A single gold line. Then the CTA.
 * No description. No verse. Just the name — and the weight of it.
 *
 * Props:
 *   nextBook     — display name of the book being entered, e.g. "Exodus"
 *   onContinue   — called when user taps "Enter" — unlocks the next book
 */

import { useState, useEffect } from "react";

export default function BookTransition({ nextBook, onContinue }) {
  const [phase, setPhase] = useState(0);
  // 0 — darkness
  // 1 — "Journey into" label fades in
  // 2 — book name rises
  // 3 — gold line expands
  // 4 — CTA appears

  useEffect(() => {
    const timings = [600, 1400, 2200, 3200];
    const timers = timings.map((delay, i) =>
      setTimeout(() => setPhase(i + 1), delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  function handleContinue() {
    onContinue();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        background: "#080706",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes bt-label-in {
          from { opacity: 0; letter-spacing: 0.35em; }
          to   { opacity: 1; letter-spacing: 0.28em; }
        }
        @keyframes bt-name-rise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bt-line-expand {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        @keyframes bt-cta-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bt-glow-pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.75; }
        }
        .bt-label {
          opacity: 0;
          animation: bt-label-in 1.2s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .bt-name {
          opacity: 0;
          animation: bt-name-rise 1.1s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .bt-line {
          transform-origin: center;
          animation: bt-line-expand 0.9s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .bt-cta {
          opacity: 0;
          animation: bt-cta-in 0.7s ease forwards;
        }
        .bt-glow {
          animation: bt-glow-pulse 4s ease-in-out infinite;
        }
      `}</style>

      {/* Deep ambient glow */}
      <div
        className="bt-glow"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translateX(-50%) translateY(-50%)",
          width: "400px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(196,169,107,0.06), transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Content stack */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Phase 1 — "Journey into" */}
        {phase >= 1 && (
          <div
            className="bt-label"
            style={{
              fontSize: "11px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(196,169,107,0.5)",
              fontFamily: "var(--font-ui, system-ui)",
              marginBottom: "18px",
            }}
          >
            Journey into
          </div>
        )}

        {/* Phase 2 — Book name */}
        {phase >= 2 && (
          <h1
            className="bt-name"
            style={{
              fontSize: "clamp(42px, 11vw, 64px)",
              fontWeight: "200",
              letterSpacing: "0.06em",
              color: "#F0EBE0",
              fontFamily: "var(--font-ui, system-ui)",
              margin: 0,
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            {nextBook}
          </h1>
        )}

        {/* Phase 3 — Gold line */}
        {phase >= 3 && (
          <div
            className="bt-line"
            style={{
              width: "56px",
              height: "1px",
              background: "rgba(196,169,107,0.5)",
              marginTop: "28px",
              marginBottom: "0",
            }}
          />
        )}

        {/* Phase 4 — CTA */}
        {phase >= 4 && (
          <button
            className="bt-cta"
            onClick={handleContinue}
            style={{
              marginTop: "36px",
              padding: "14px 40px",
              borderRadius: "9999px",
              background: "transparent",
              border: "1px solid rgba(196,169,107,0.35)",
              color: "#C4A96B",
              fontSize: "13px",
              fontWeight: "500",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "var(--font-ui, system-ui)",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              transition: "background 0.2s ease, border-color 0.2s ease",
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.background = "rgba(196,169,107,0.08)";
              e.currentTarget.style.borderColor = "rgba(196,169,107,0.6)";
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(196,169,107,0.35)";
            }}
          >
            Enter
          </button>
        )}
      </div>
    </div>
  );
}
