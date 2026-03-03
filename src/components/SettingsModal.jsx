/**
 * SettingsModal.jsx — Premium Settings
 * Extracted from AppShell for cleanliness
 * Sacred, refined — consistent with ABIDE's design language
 */

import { useState } from "react";
import VSVInfo from "./VSVInfo";

function BibleIcon({ style }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 18, height: 18, ...style }}
    >
      <path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z" />
      <path d="M17 4h3v16h-3" />
      <path d="M9 8h4" />
      <path d="M11 6v4" />
    </svg>
  );
}

const THEMES = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional Scripture",
    glyph: "✦",
  },
  {
    id: "still-waters",
    name: "Still Waters",
    description: "Calm & Reflective",
    glyph: "◈",
  },
  {
    id: "stone-fire",
    name: "Stone & Fire",
    description: "Bold & Prophetic",
    glyph: "◇",
  },
  {
    id: "olive-parchment",
    name: "Olive & Parchment",
    description: "Ancient Manuscript",
    glyph: "⊕",
  },
  {
    id: "parchment",
    name: "Parchment",
    description: "Classic Book Style",
    glyph: "✧",
  },
];

const TRANSLATIONS = [
  {
    id: "VSV",
    label: "Vine Standard Version",
    why: "Faithful, readable — ABIDE's core translation",
  },
  {
    id: "AKT",
    label: "Abide Kids Translation",
    why: "Clear, accessible language for young readers",
  },
  {
    id: "KJV",
    label: "King James Version",
    why: "Historic English translation (1769)",
  },
  {
    id: "ASR",
    label: "Abide Source Reading",
    why: "Source-oriented reading for deeper study",
  },
];

/* ── Reusable sub-components ────────────────────────────── */

function SectionRow({ icon, label, value, onClick }) {
  return (
    <button
      onClick={onClick}
      className="sm-row"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "14px 16px",
        borderRadius: "14px",
        background: "rgba(var(--accent-rgb,203,178,124),0.06)",
        border: "1px solid rgba(var(--accent-rgb,203,178,124),0.1)",
        cursor: "pointer",
        marginBottom: "8px",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: "rgba(var(--accent-rgb,203,178,124),0.1)",
          border: "1px solid rgba(var(--accent-rgb,203,178,124),0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(var(--accent-rgb,203,178,124),0.85)",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, textAlign: "left" }}>
        <div
          style={{
            fontFamily: "var(--font-ui, system-ui)",
            fontSize: "15px",
            fontWeight: "500",
            color: "var(--text-primary, #f0ebe0)",
          }}
        >
          {label}
        </div>
      </div>
      {value && (
        <span
          style={{
            fontFamily: "var(--font-ui, system-ui)",
            fontSize: "13px",
            color: "rgba(var(--accent-rgb,203,178,124),0.6)",
            marginRight: "4px",
          }}
        >
          {value}
        </span>
      )}
      <span
        style={{
          fontSize: "14px",
          color: "rgba(var(--accent-rgb,203,178,124),0.35)",
        }}
      >
        ›
      </span>
    </button>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: "44px",
        height: "26px",
        borderRadius: "100px",
        background: on
          ? "rgba(var(--accent-rgb,203,178,124),1)"
          : "rgba(var(--accent-rgb,203,178,124),0.12)",
        border: on
          ? "none"
          : "1px solid rgba(var(--accent-rgb,203,178,124),0.2)",
        position: "relative",
        transition: "background 0.22s ease, border 0.22s ease",
        cursor: "pointer",
        flexShrink: 0,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "3px",
          left: on ? "21px" : "3px",
          width: "20px",
          height: "20px",
          borderRadius: "100px",
          background: on
            ? "var(--text-inverse, #0d0d0d)"
            : "rgba(var(--accent-rgb,203,178,124),0.5)",
          transition: "left 0.22s cubic-bezier(0.22,1,0.36,1)",
        }}
      />
    </button>
  );
}

function BackHeader({ label, onBack }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "28px",
      }}
    >
      <button
        onClick={onBack}
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "100px",
          background: "rgba(var(--accent-rgb,203,178,124),0.08)",
          border: "1px solid rgba(var(--accent-rgb,203,178,124),0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "15px",
          color: "rgba(var(--accent-rgb,203,178,124),0.7)",
          WebkitTapHighlightColor: "transparent",
          transition: "background 0.15s",
          flexShrink: 0,
        }}
      >
        ‹
      </button>
      <h2
        style={{
          fontFamily: "var(--font-ui, system-ui)",
          fontSize: "22px",
          fontWeight: "300",
          letterSpacing: "0.02em",
          color: "var(--text-primary, #f0ebe0)",
          margin: 0,
        }}
      >
        {label}
      </h2>
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: "1px",
        background:
          "linear-gradient(90deg, transparent, rgba(var(--accent-rgb,203,178,124),0.15), transparent)",
        margin: "20px 0",
      }}
    />
  );
}

/* ── Main component ─────────────────────────────────────── */

export default function SettingsModal({
  open,
  onClose,
  theme,
  setTheme,
  translation,
  setTranslation,
  textSize,
  setTextSize,
  chapterlessMode,
  setChapterlessMode,
}) {
  const [view, setView] = useState("main");

  if (!open) return null;

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
      setView("main");
    }
  }

  function handleClose() {
    onClose();
    setView("main");
  }

  return (
    <>
      <style>{`
        @keyframes sm-backdrop-in { from{opacity:0} to{opacity:1} }
        @keyframes sm-modal-in {
          from { opacity:0; transform:translateY(20px) scale(0.97) }
          to   { opacity:1; transform:translateY(0)    scale(1)    }
        }
        @keyframes sm-glow-pulse {
          0%,100% { opacity:0.35 }
          50%      { opacity:0.7  }
        }
        @keyframes sm-view-in {
          from { opacity:0; transform:translateX(16px) }
          to   { opacity:1; transform:translateX(0)    }
        }

        .sm-backdrop { animation: sm-backdrop-in 0.25s ease forwards }
        .sm-modal    { animation: sm-modal-in 0.38s cubic-bezier(0.22,1,0.36,1) forwards }
        .sm-view     { animation: sm-view-in 0.28s ease forwards }
        .sm-glow     { animation: sm-glow-pulse 4.5s ease-in-out infinite }

        .sm-row {
          transition: background 0.16s ease, transform 0.13s ease, border-color 0.16s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .sm-row:hover {
          background: rgba(var(--accent-rgb,203,178,124), 0.11) !important;
          border-color: rgba(var(--accent-rgb,203,178,124), 0.22) !important;
        }
        .sm-row:active { transform: scale(0.985) }

        .sm-scroll::-webkit-scrollbar { display:none }
        .sm-scroll { -ms-overflow-style:none; scrollbar-width:none }
      `}</style>

      {/* Backdrop */}
      <div
        className="sm-backdrop"
        onClick={handleBackdropClick}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Modal */}
        <div
          className="sm-modal sm-scroll"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            width: "94%",
            maxWidth: "460px",
            maxHeight: "85vh",
            overflowY: "auto",
            background: "var(--bg-menu, #141410)",
            borderRadius: "24px",
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(var(--accent-rgb,203,178,124),0.08)",
          }}
        >
          {/* Ambient top glow */}
          <div
            className="sm-glow"
            style={{
              position: "absolute",
              top: 0,
              left: "20%",
              right: "20%",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(var(--accent-rgb,203,178,124),0.75), transparent)",
              filter: "blur(1px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "140px",
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(var(--accent-rgb,203,178,124),0.08), transparent 65%)",
              pointerEvents: "none",
              borderRadius: "24px 24px 0 0",
            }}
          />

          <div style={{ padding: "28px 24px 32px", position: "relative" }}>
            {/* ── MAIN VIEW ─────────────────────────────────── */}
            {view === "main" && (
              <div className="sm-view">
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "24px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-ui, system-ui)",
                        fontSize: "10px",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(var(--accent-rgb,203,178,124),0.55)",
                        marginBottom: "7px",
                      }}
                    >
                      ✦ &nbsp;Preferences
                    </div>
                    <h2
                      style={{
                        fontFamily: "var(--font-ui, system-ui)",
                        fontSize: "26px",
                        fontWeight: "300",
                        letterSpacing: "0.02em",
                        color: "var(--text-primary, #f0ebe0)",
                        margin: 0,
                      }}
                    >
                      Settings
                    </h2>
                  </div>
                  <button
                    onClick={handleClose}
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "100px",
                      background: "rgba(var(--accent-rgb,203,178,124),0.08)",
                      border:
                        "1px solid rgba(var(--accent-rgb,203,178,124),0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "13px",
                      color: "var(--text-primary, #f0ebe0)",
                      opacity: 0.5,
                      transition: "opacity 0.2s",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    ✕
                  </button>
                </div>

                <Divider />

                {/* Rows */}
                <SectionRow
                  icon={<BibleIcon />}
                  label="Translation"
                  value={translation}
                  onClick={() => setView("translation")}
                />
                <SectionRow
                  icon={<span style={{ fontSize: "15px" }}>◈</span>}
                  label="Appearance"
                  value={THEMES.find((t) => t.id === theme)?.name}
                  onClick={() => setView("appearance")}
                />
                <SectionRow
                  icon={<span style={{ fontSize: "15px" }}>Aa</span>}
                  label="Bible Text Size"
                  value={`${textSize.toFixed(1)}×`}
                  onClick={() => setView("textSize")}
                />

                <Divider />

                {/* Chapterless toggle */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    background: "rgba(var(--accent-rgb,203,178,124),0.06)",
                    border: "1px solid rgba(var(--accent-rgb,203,178,124),0.1)",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(var(--accent-rgb,203,178,124),0.1)",
                      border:
                        "1px solid rgba(var(--accent-rgb,203,178,124),0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "rgba(var(--accent-rgb,203,178,124),0.85)",
                      fontSize: "15px",
                      flexShrink: 0,
                    }}
                  >
                    ◇
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-ui, system-ui)",
                        fontSize: "15px",
                        fontWeight: "500",
                        color: "var(--text-primary, #f0ebe0)",
                        marginBottom: "2px",
                      }}
                    >
                      Chapterless Mode
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-ui, system-ui)",
                        fontSize: "11px",
                        color: "var(--text-primary, #f0ebe0)",
                        opacity: 0.38,
                      }}
                    >
                      Hides chapter titles and verse numbers
                    </div>
                  </div>
                  <Toggle
                    on={chapterlessMode}
                    onToggle={() => setChapterlessMode((v) => !v)}
                  />
                </div>

                <Divider />

                {/* Footer */}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "13px",
                      letterSpacing: "0.18em",
                      color: "rgba(var(--accent-rgb,203,178,124),0.2)",
                      marginBottom: "8px",
                    }}
                  >
                    ✦ ✦ ✦
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-ui, system-ui)",
                      fontSize: "11px",
                      color: "var(--text-primary, #f0ebe0)",
                      opacity: 0.28,
                    }}
                  >
                    Made with ♥ by Jesus Vargas
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-ui, system-ui)",
                      fontSize: "11px",
                      color: "rgba(var(--accent-rgb,203,178,124),0.32)",
                      marginTop: "3px",
                    }}
                  >
                    Version 2.3.0
                  </div>
                </div>
              </div>
            )}

            {/* ── APPEARANCE VIEW ───────────────────────────── */}
            {view === "appearance" && (
              <div className="sm-view">
                <BackHeader label="Appearance" onBack={() => setView("main")} />

                <div
                  style={{
                    fontFamily: "var(--font-ui, system-ui)",
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(var(--accent-rgb,203,178,124),0.45)",
                    marginBottom: "12px",
                  }}
                >
                  Choose Theme
                </div>

                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className="sm-row"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px 16px",
                      borderRadius: "14px",
                      background:
                        theme === t.id
                          ? "rgba(var(--accent-rgb,203,178,124),0.12)"
                          : "rgba(var(--accent-rgb,203,178,124),0.05)",
                      border:
                        theme === t.id
                          ? "1px solid rgba(var(--accent-rgb,203,178,124),0.4)"
                          : "1px solid rgba(var(--accent-rgb,203,178,124),0.09)",
                      cursor: "pointer",
                      marginBottom: "8px",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background:
                          theme === t.id
                            ? "rgba(var(--accent-rgb,203,178,124),0.2)"
                            : "rgba(var(--accent-rgb,203,178,124),0.08)",
                        border:
                          "1px solid rgba(var(--accent-rgb,203,178,124),0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "15px",
                        color: "rgba(var(--accent-rgb,203,178,124),0.85)",
                        flexShrink: 0,
                      }}
                    >
                      {t.glyph}
                    </div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-ui, system-ui)",
                          fontSize: "15px",
                          fontWeight: theme === t.id ? "500" : "400",
                          color:
                            theme === t.id
                              ? "var(--text-accent, #cbb27c)"
                              : "var(--text-primary, #f0ebe0)",
                          marginBottom: "2px",
                        }}
                      >
                        {t.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-body, Georgia, serif)",
                          fontSize: "11px",
                          fontStyle: "italic",
                          color: "var(--text-primary, #f0ebe0)",
                          opacity: 0.38,
                        }}
                      >
                        {t.description}
                      </div>
                    </div>
                    {theme === t.id && (
                      <span
                        style={{
                          fontSize: "14px",
                          color: "rgba(var(--accent-rgb,203,178,124),0.8)",
                        }}
                      >
                        ✦
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ── TEXT SIZE VIEW ────────────────────────────── */}
            {view === "textSize" && (
              <div className="sm-view">
                <BackHeader
                  label="Bible Text Size"
                  onBack={() => setView("main")}
                />

                {/* Size control */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 20px",
                    borderRadius: "16px",
                    background: "rgba(var(--accent-rgb,203,178,124),0.06)",
                    border: "1px solid rgba(var(--accent-rgb,203,178,124),0.1)",
                    marginBottom: "20px",
                  }}
                >
                  <button
                    onClick={() => setTextSize(Math.max(0.8, textSize - 0.1))}
                    disabled={textSize <= 0.8}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(var(--accent-rgb,203,178,124),0.1)",
                      border:
                        "1px solid rgba(var(--accent-rgb,203,178,124),0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      fontWeight: "300",
                      color: "var(--text-primary, #f0ebe0)",
                      cursor: "pointer",
                      opacity: textSize <= 0.8 ? 0.3 : 1,
                      WebkitTapHighlightColor: "transparent",
                      transition: "opacity 0.2s",
                    }}
                  >
                    −
                  </button>

                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontFamily: "var(--font-ui, system-ui)",
                        fontSize: "32px",
                        fontWeight: "300",
                        letterSpacing: "0.02em",
                        color: "var(--text-accent, #cbb27c)",
                        lineHeight: 1,
                      }}
                    >
                      {textSize.toFixed(1)}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-ui, system-ui)",
                        fontSize: "10px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--text-primary, #f0ebe0)",
                        opacity: 0.35,
                        marginTop: "4px",
                      }}
                    >
                      scale
                    </div>
                  </div>

                  <button
                    onClick={() => setTextSize(Math.min(2.0, textSize + 0.1))}
                    disabled={textSize >= 2.0}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(var(--accent-rgb,203,178,124),0.1)",
                      border:
                        "1px solid rgba(var(--accent-rgb,203,178,124),0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      fontWeight: "300",
                      color: "var(--text-primary, #f0ebe0)",
                      cursor: "pointer",
                      opacity: textSize >= 2.0 ? 0.3 : 1,
                      WebkitTapHighlightColor: "transparent",
                      transition: "opacity 0.2s",
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Preview */}
                <div
                  style={{
                    fontFamily: "var(--font-ui, system-ui)",
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(var(--accent-rgb,203,178,124),0.45)",
                    marginBottom: "10px",
                  }}
                >
                  Preview
                </div>

                <div
                  style={{
                    padding: "20px",
                    borderRadius: "14px",
                    background: "rgba(var(--accent-rgb,203,178,124),0.04)",
                    border:
                      "1px solid rgba(var(--accent-rgb,203,178,124),0.08)",
                    lineHeight: 1.75,
                    fontSize: `${textSize}rem`,
                    color: "var(--text-primary, #f0ebe0)",
                    fontFamily: "var(--font-body, Georgia, serif)",
                  }}
                >
                  <sup
                    style={{
                      fontSize: `${textSize * 0.7}rem`,
                      color: "rgba(var(--accent-rgb,203,178,124),0.6)",
                      marginRight: "4px",
                    }}
                  >
                    1
                  </sup>
                  In the beginning God created the heavens and the earth.{" "}
                  <sup
                    style={{
                      fontSize: `${textSize * 0.7}rem`,
                      color: "rgba(var(--accent-rgb,203,178,124),0.6)",
                      marginRight: "4px",
                    }}
                  >
                    2
                  </sup>
                  And the earth was without form and empty, and darkness lay
                  over the face of the deep.
                </div>
              </div>
            )}

            {/* ── TRANSLATION VIEW ──────────────────────────── */}
            {view === "translation" && (
              <div className="sm-view">
                <BackHeader
                  label="Translations"
                  onBack={() => setView("main")}
                />

                <div
                  style={{
                    fontFamily: "var(--font-ui, system-ui)",
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(var(--accent-rgb,203,178,124),0.45)",
                    marginBottom: "12px",
                  }}
                >
                  Choose Translation
                </div>

                {TRANSLATIONS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTranslation(t.id)}
                    className="sm-row"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px 16px",
                      borderRadius: "14px",
                      background:
                        translation === t.id
                          ? "rgba(var(--accent-rgb,203,178,124),0.12)"
                          : "rgba(var(--accent-rgb,203,178,124),0.05)",
                      border:
                        translation === t.id
                          ? "1px solid rgba(var(--accent-rgb,203,178,124),0.4)"
                          : "1px solid rgba(var(--accent-rgb,203,178,124),0.09)",
                      cursor: "pointer",
                      marginBottom: "8px",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background:
                          translation === t.id
                            ? "rgba(var(--accent-rgb,203,178,124),0.2)"
                            : "rgba(var(--accent-rgb,203,178,124),0.08)",
                        border:
                          "1px solid rgba(var(--accent-rgb,203,178,124),0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-ui, system-ui)",
                          fontSize: "9px",
                          fontWeight: "700",
                          letterSpacing: "0.04em",
                          color: "rgba(var(--accent-rgb,203,178,124),0.85)",
                        }}
                      >
                        {t.id}
                      </span>
                    </div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-ui, system-ui)",
                          fontSize: "14px",
                          fontWeight: translation === t.id ? "500" : "400",
                          color:
                            translation === t.id
                              ? "var(--text-accent, #cbb27c)"
                              : "var(--text-primary, #f0ebe0)",
                          marginBottom: "2px",
                        }}
                      >
                        {t.label}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-body, Georgia, serif)",
                          fontSize: "11px",
                          fontStyle: "italic",
                          color: "var(--text-primary, #f0ebe0)",
                          opacity: 0.38,
                        }}
                      >
                        {t.why}
                      </div>
                    </div>
                    {translation === t.id && (
                      <span
                        style={{
                          fontSize: "14px",
                          color: "rgba(var(--accent-rgb,203,178,124),0.8)",
                        }}
                      >
                        ✦
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ── VSV INFO VIEW ─────────────────────────────── */}
            {view === "vsv" && (
              <div className="sm-view">
                <VSVInfo onBack={() => setView("main")} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
