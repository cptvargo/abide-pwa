/**
 * NewTestamentUnlocked.jsx
 * Full-screen celebration overlay shown once when the user
 * completes the last OT book and unlocks the New Testament.
 * Writes "cr_nt_seen" via markNTUnlockedSeen() on dismiss.
 */

import { useState, useEffect } from "react";

const NT_VERSE = {
  KJV: {
    text: "For all the promises of God in him are yea, and in him Amen, unto the glory of God by us.",
    reference: "2 Corinthians 1:20 · KJV",
  },
  WAE: {
    text: "For as many as are the promises of God, in him is the Yes; wherefore also through him is the Amen, unto the glory of God through us.",
    reference: "2 Corinthians 1:20 · WAE",
  },
  ASR: {
    text: "For all the promises of God find their Yes in him. That is why it is through him that we utter our Amen to God for his glory.",
    reference: "2 Corinthians 1:20 · ASR",
  },
};

// Simple star particle — pure CSS, no canvas
function Particle({ style }) {
  return (
    <div
      style={{
        position: "absolute",
        width: "3px",
        height: "3px",
        borderRadius: "50%",
        background: "#C4A96B",
        ...style,
      }}
    />
  );
}

export default function NewTestamentUnlocked({
  onDismiss,
  translation = "KJV",
}) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const verse = NT_VERSE[translation] || NT_VERSE["ASR"];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  function handleDismiss() {
    setLeaving(true);
    setTimeout(() => {
      onDismiss();
    }, 500);
  }

  // Generate deterministic particle positions
  const particles = Array.from({ length: 18 }, (_, i) => ({
    top: `${10 + ((i * 17) % 80)}%`,
    left: `${5 + ((i * 23) % 90)}%`,
    opacity: 0.15 + (i % 5) * 0.08,
    width: i % 3 === 0 ? "4px" : "2px",
    height: i % 3 === 0 ? "4px" : "2px",
    animationDelay: `${(i * 0.3) % 2}s`,
  }));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#0A0907",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 32px",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        opacity: leaving ? 0 : visible ? 1 : 0,
        transition: "opacity 0.5s ease",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes nt-float {
          0%, 100% { transform: translateY(0); opacity: 0.15; }
          50%       { transform: translateY(-8px); opacity: 0.35; }
        }
        @keyframes nt-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nt-glow-ring {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.04); }
        }
        @keyframes nt-shine {
          0%   { opacity: 0; transform: translateY(10px); }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .nt-particle { animation: nt-float 3s ease-in-out infinite; }
        .nt-line-1   { opacity: 0; animation: nt-fade-up 0.7s ease 0.2s forwards; }
        .nt-line-2   { opacity: 0; animation: nt-fade-up 0.7s ease 0.5s forwards; }
        .nt-line-3   { opacity: 0; animation: nt-fade-up 0.7s ease 0.8s forwards; }
        .nt-line-4   { opacity: 0; animation: nt-fade-up 0.7s ease 1.1s forwards; }
        .nt-line-5   { opacity: 0; animation: nt-fade-up 0.7s ease 1.4s forwards; }
        .nt-line-6   { opacity: 0; animation: nt-fade-up 0.7s ease 1.8s forwards; }
        .nt-ring     { animation: nt-glow-ring 3s ease-in-out infinite; }
      `}</style>

      {/* Ambient particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="nt-particle"
          style={{
            position: "absolute",
            top: p.top,
            left: p.left,
            width: p.width,
            height: p.height,
            borderRadius: "50%",
            background: "#C4A96B",
            opacity: p.opacity,
            animationDelay: p.animationDelay,
          }}
        />
      ))}

      {/* Large ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translateX(-50%) translateY(-50%)",
          width: "340px",
          height: "340px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(196,169,107,0.1), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Pulsing ring icon */}
      <div className="nt-line-1" style={{ marginBottom: "28px" }}>
        <div
          className="nt-ring"
          style={{
            width: "96px",
            height: "96px",
            borderRadius: "50%",
            border: "1.5px solid rgba(196,169,107,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(196,169,107,0.06)",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              border: "1px solid rgba(196,169,107,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              color: "#C4A96B",
            }}
          >
            ✦
          </div>
        </div>
      </div>

      {/* Milestone label */}
      <div
        className="nt-line-2"
        style={{
          fontSize: "11px",
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "rgba(196,169,107,0.6)",
          fontFamily: "var(--font-ui, system-ui)",
          marginBottom: "10px",
        }}
      >
        Milestone Reached
      </div>

      {/* Main title */}
      <h1
        className="nt-line-3"
        style={{
          fontSize: "30px",
          fontWeight: "300",
          letterSpacing: "0.03em",
          color: "#F0EBE0",
          fontFamily: "var(--font-ui, system-ui)",
          lineHeight: 1.2,
          margin: "0 0 6px",
          textAlign: "center",
        }}
      >
        New Testament
      </h1>
      <h2
        className="nt-line-3"
        style={{
          fontSize: "20px",
          fontWeight: "300",
          letterSpacing: "0.08em",
          color: "#C4A96B",
          fontFamily: "var(--font-ui, system-ui)",
          lineHeight: 1.2,
          margin: "0 0 28px",
          textAlign: "center",
        }}
      >
        Unlocked
      </h2>

      {/* Divider */}
      <div
        className="nt-line-3"
        style={{
          width: "48px",
          height: "1px",
          background: "rgba(196,169,107,0.35)",
          marginBottom: "24px",
        }}
      />

      {/* Description */}
      <p
        className="nt-line-4"
        style={{
          fontSize: "14px",
          lineHeight: 1.7,
          color: "rgba(240,235,224,0.55)",
          fontFamily: "var(--font-ui, system-ui)",
          textAlign: "center",
          maxWidth: "280px",
          margin: "0 0 24px",
        }}
      >
        You have traced the promise through 39 books. Every shadow, every
        sacrifice, every prophecy pointed here — to the Word made flesh.
      </p>

      {/* Verse */}
      <div
        className="nt-line-5"
        style={{
          background: "rgba(196,169,107,0.06)",
          border: "1px solid rgba(196,169,107,0.18)",
          borderRadius: "12px",
          padding: "16px 18px",
          maxWidth: "300px",
          width: "100%",
          marginBottom: "32px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.7,
            fontStyle: "italic",
            color: "rgba(240,235,224,0.7)",
            fontFamily: "var(--font-body, Georgia, serif)",
            margin: "0 0 8px",
          }}
        >
          "{verse.text}"
        </p>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "rgba(196,169,107,0.55)",
            fontFamily: "var(--font-ui, system-ui)",
            margin: 0,
          }}
        >
          — {verse.reference}
        </p>
      </div>

      {/* CTA */}
      <button
        className="nt-line-6"
        onClick={handleDismiss}
        style={{
          width: "100%",
          maxWidth: "300px",
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
        Continue the Pilgrimage
      </button>
    </div>
  );
}
