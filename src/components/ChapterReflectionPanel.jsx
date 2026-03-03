/**
 * ChapterReflectionPanel.jsx
 * Premium chapter reflection panel for ABIDE
 * Sacred, contemplative — like opening an illuminated manuscript
 */

import { useEffect, useRef, useState } from "react";

export default function ChapterReflectionPanel({
  open,
  onClose,
  book,
  chapter,
  summary,
}) {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const panelRef = useRef(null);

  /* ── Orchestrated entrance ─────────────────────────────── */
  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true));
      });
      document.body.style.overflow = "hidden";
    } else {
      setAnimateIn(false);
      const t = setTimeout(() => {
        setVisible(false);
        document.body.style.overflow = "";
      }, 420);
      return () => clearTimeout(t);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!visible) return null;

  /* ── Split summary into paragraphs ─────────────────────── */
  const paragraphs =
    typeof summary === "string"
      ? summary.split(/\n+/).filter(Boolean)
      : [summary];

  return (
    <>
      <style>{`
        @keyframes crp-backdrop-in {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        @keyframes crp-backdrop-out {
          from { opacity: 1 }
          to   { opacity: 0 }
        }
        @keyframes crp-panel-in {
          from { transform: translateY(100%); opacity: 0 }
          to   { transform: translateY(0);    opacity: 1 }
        }
        @keyframes crp-panel-out {
          from { transform: translateY(0);    opacity: 1 }
          to   { transform: translateY(100%); opacity: 0 }
        }
        @keyframes crp-rule-expand {
          from { transform: scaleX(0); opacity: 0 }
          to   { transform: scaleX(1); opacity: 1 }
        }
        @keyframes crp-fade-up {
          from { opacity: 0; transform: translateY(10px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes crp-glow-pulse {
          0%, 100% { opacity: 0.4 }
          50%       { opacity: 0.75 }
        }

        .crp-backdrop {
          animation: ${animateIn ? "crp-backdrop-in 0.35s ease forwards" : "crp-backdrop-out 0.42s ease forwards"};
        }
        .crp-panel {
          animation: ${animateIn ? "crp-panel-in 0.42s cubic-bezier(0.22,1,0.36,1) forwards" : "crp-panel-out 0.38s cubic-bezier(0.55,0,1,0.45) forwards"};
        }
        .crp-rule {
          animation: crp-rule-expand 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both;
          transform-origin: center;
        }
        .crp-header {
          animation: crp-fade-up 0.5s ease 0.2s both;
        }
        .crp-body {
          animation: crp-fade-up 0.5s ease 0.35s both;
        }
        .crp-footer {
          animation: crp-fade-up 0.4s ease 0.5s both;
        }
        .crp-glow {
          animation: crp-glow-pulse 4s ease-in-out infinite;
        }

        .crp-scroll::-webkit-scrollbar { display: none }
        .crp-scroll { -ms-overflow-style: none; scrollbar-width: none }

        .crp-close-btn {
          transition: opacity 0.2s, transform 0.2s;
          opacity: 0.35;
        }
        .crp-close-btn:hover {
          opacity: 0.8;
          transform: scale(1.1);
        }
        .crp-close-btn:active {
          transform: scale(0.93);
        }
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
        {/* Ambient glow at top */}
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

        {/* Top inset glow */}
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
            style={{ textAlign: "center", marginBottom: "28px" }}
          >
            {/* Mode pill */}
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
                Reflection
              </span>
            </div>

            {/* Book & Chapter */}
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

          {/* ── Ornamental divider ──────────────────────────────── */}
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
                lineHeight: 1,
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

          {/* ── Summary body ───────────────────────────────────── */}
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
                  marginBottom: i < paragraphs.length - 1 ? "20px" : 0,
                  margin: i < paragraphs.length - 1 ? "0 0 20px" : 0,
                  textAlign: "left",
                }}
              >
                {para}
              </p>
            ))}
          </div>

          {/* ── Footer disclaimer ───────────────────────────────── */}
          <div className="crp-footer" style={{ marginTop: "36px" }}>
            {/* Bottom rule */}
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
              AI-assisted reflection provided as a reading aid. Scripture itself
              remains the final authority.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
