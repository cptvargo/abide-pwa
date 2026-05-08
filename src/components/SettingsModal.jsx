/**
 * SettingsModal.jsx — Premium Settings
 * Extracted from AppShell for cleanliness
 * Sacred, refined — consistent with ABIDE's design language
 */

import { useState } from "react";
import emailjs from "@emailjs/browser";

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

// ── Active translations: KJV, ASR, AKT
// ── ASB and WBT removed
const TRANSLATIONS = [
  {
    id: "KJV",
    label: "King James Version",
    tagline: "The historic 1769 English translation",
    description:
      "The most widely read English Bible in history. Majestic, poetic language that has shaped the Church for centuries. Ideal for devotional reading, memorization, and those who grew up with its beloved cadence.",
    badge: "Classic",
    source: "Authorized Version (1769)",
  },
  {
    id: "ASR",
    label: "ABIDE Source Reading",
    tagline: "A study-oriented rendering close to the source",
    description:
      "Based on the Berean Standard Bible, the ASR is designed for readers who want to stay close to the original language structure — ideal for word studies, cross-referencing, and deeper theological reading. As a derived translation, minor edits may be present for study clarity and consistency.",
    badge: "For Study",
    source: "Derived from the Berean Standard Bible (BSB)",
  },
  {
    id: "WAE",
    label: "Webster ABIDE Edition",
    tagline: "Noah Webster's classic revision, refined for ABIDE",
    description:
      "Webster's 1833 revision of the King James Bible — updated spelling, clarified archaic language, and refined for modern devotional use. Reverent in tone, accessible in language. Ideal for those who love the cadence of the KJV but want clearer expression.",
    badge: "Revised Classic",
    source: "Derived from Noah Webster's Bible, 1833",
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

/* ── Translation Card ───────────────────────────────────── */

function TranslationCard({ t }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        borderRadius: "16px",
        background: "rgba(var(--accent-rgb,203,178,124),0.04)",
        border: "1px solid rgba(var(--accent-rgb,203,178,124),0.09)",
        marginBottom: "10px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "11px",
            background: "rgba(var(--accent-rgb,203,178,124),0.08)",
            border: "1px solid rgba(var(--accent-rgb,203,178,124),0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-ui, system-ui)",
              fontSize: t.id.length > 3 ? "7px" : "9px",
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
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "2px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-ui, system-ui)",
                fontSize: "14px",
                fontWeight: "400",
                color: "var(--text-primary, #f0ebe0)",
              }}
            >
              {t.label}
            </span>
            <span
              style={{
                fontFamily: "var(--font-ui, system-ui)",
                fontSize: "9px",
                fontWeight: "600",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(var(--accent-rgb,203,178,124),0.7)",
                background: "rgba(var(--accent-rgb,203,178,124),0.1)",
                border: "1px solid rgba(var(--accent-rgb,203,178,124),0.18)",
                borderRadius: "4px",
                padding: "2px 6px",
              }}
            >
              {t.badge}
            </span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-body, Georgia, serif)",
              fontSize: "11px",
              fontStyle: "italic",
              color: "var(--text-primary, #f0ebe0)",
              opacity: 0.42,
            }}
          >
            {t.tagline}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "0 0 12px 54px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-ui, system-ui)",
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(var(--accent-rgb,203,178,124),0.5)",
            }}
          >
            About this translation
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "rgba(var(--accent-rgb,203,178,124),0.4)",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              display: "inline-block",
            }}
          >
            ›
          </span>
        </button>

        {expanded && (
          <div
            style={{
              paddingLeft: "54px",
              paddingBottom: "16px",
              animation: "sm-view-in 0.22s ease forwards",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body, Georgia, serif)",
                fontSize: "13px",
                lineHeight: "1.7",
                color: "var(--text-primary, #f0ebe0)",
                opacity: 0.65,
                margin: "0 0 10px 0",
              }}
            >
              {t.description}
            </p>
            <div
              style={{
                fontFamily: "var(--font-ui, system-ui)",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(var(--accent-rgb,203,178,124),0.4)",
              }}
            >
              {t.source}
            </div>
          </div>
        )}
      </div>
    </div>
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
  const [contactMsg, setContactMsg] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const [contactSending, setContactSending] = useState(false);

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

                <Divider />

                <SectionRow
                  icon={<BibleIcon />}
                  label="Translations"
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

                <SectionRow
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="3" />
                      <path d="M2 7l10 7 10-7" />
                    </svg>
                  }
                  label="Contact"
                  onClick={() => setView("contact")}
                />

                <Divider />

                {/* Footer */}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "13px",
                      letterSpacing: "0.18em",
                      color: "rgba(var(--accent-rgb,203,178,124),0.2)",
                    }}
                  >
                    ✦ ✦ ✦
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
                    marginBottom: "14px",
                  }}
                >
                  Choose Translation
                </div>

                {TRANSLATIONS.map((t) => (
                  <TranslationCard key={t.id} t={t} />
                ))}

              </div>
            )}

            {/* ── CONTACT VIEW ──────────────────────────────── */}
            {view === "contact" && (
              <div className="sm-view">
                <BackHeader label="Contact" onBack={() => { setView("main"); setContactSent(false); setContactMsg(""); }} />

                {contactSent ? (
                  <div style={{ textAlign: "center", paddingTop: 40 }}>
                    <div style={{ fontSize: 36, marginBottom: 16 }}>✦</div>
                    <div style={{
                      fontFamily: "var(--font-ui, system-ui)",
                      fontSize: 17, fontWeight: 300,
                      color: "var(--text-primary)",
                      marginBottom: 8,
                    }}>
                      Message sent
                    </div>
                    <p style={{
                      fontFamily: "var(--font-body, Georgia, serif)",
                      fontSize: 14, lineHeight: 1.7,
                      color: "var(--text-secondary)", opacity: 0.6,
                      margin: 0,
                    }}>
                      Thank you for reaching out. I'll get back to you soon.
                    </p>
                  </div>
                ) : (
                  <>
                    <p style={{
                      fontFamily: "var(--font-body, Georgia, serif)",
                      fontSize: 14, lineHeight: 1.75,
                      color: "var(--text-primary)",
                      opacity: 0.6,
                      margin: "0 0 20px",
                    }}>
                      Found a bug, have an idea, or just want to say something? Write it here and it'll go straight to me.
                    </p>

                    <textarea
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      placeholder="Write your message..."
                      rows={6}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        background: "rgba(var(--accent-rgb,203,178,124),0.05)",
                        border: "1px solid rgba(var(--accent-rgb,203,178,124),0.15)",
                        borderRadius: 12,
                        padding: "14px 16px",
                        fontFamily: "var(--font-body, Georgia, serif)",
                        fontSize: 15,
                        lineHeight: 1.7,
                        color: "var(--text-primary)",
                        resize: "none",
                        outline: "none",
                        marginBottom: 16,
                      }}
                    />

                    <button
                      onClick={async () => {
                        if (!contactMsg.trim() || contactSending) return;
                        setContactSending(true);
                        try {
                          await emailjs.send(
                            "service_z9q4col",
                            "template_fyclurw",
                            { message: contactMsg.trim() },
                            { publicKey: "tTCVbghqW-ocRbMLd" }
                          );
                          setContactSent(true);
                          setContactMsg("");
                        } catch (err) {
                          console.error("[EmailJS]", err);
                        } finally {
                          setContactSending(false);
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: 12,
                        background: contactMsg.trim() && !contactSending
                          ? "rgba(var(--accent-rgb,203,178,124),0.15)"
                          : "rgba(var(--accent-rgb,203,178,124),0.05)",
                        border: contactMsg.trim() && !contactSending
                          ? "1px solid rgba(var(--accent-rgb,203,178,124),0.4)"
                          : "1px solid rgba(var(--accent-rgb,203,178,124),0.1)",
                        cursor: contactMsg.trim() && !contactSending ? "pointer" : "default",
                        fontFamily: "var(--font-ui, system-ui)",
                        fontSize: 14,
                        fontWeight: 500,
                        letterSpacing: "0.06em",
                        color: contactMsg.trim() && !contactSending
                          ? "rgba(var(--accent-rgb,203,178,124),0.9)"
                          : "rgba(var(--accent-rgb,203,178,124),0.3)",
                        transition: "all 0.2s",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      {contactSending ? "Sending..." : "Send"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
