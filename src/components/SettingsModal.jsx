/**
 * SettingsModal.jsx — Settings
 */

import { useState } from "react";
import emailjs from "@emailjs/browser";

const THEMES = [
  { id: "classic",         name: "Classic",          description: "Traditional Scripture",    swatch: "#CBB27C" },
  { id: "still-waters",    name: "Still Waters",     description: "Calm & Reflective",        swatch: "#4A9B8E" },
  { id: "stone-fire",      name: "Stone & Fire",     description: "Bold & Prophetic",         swatch: "#C4522A" },
  { id: "olive-parchment", name: "Olive & Parchment",description: "Ancient Manuscript",       swatch: "#7A8C52" },
  { id: "parchment",       name: "Parchment",        description: "Classic Book Style",       swatch: "#9B6B3C" },
];

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

/* ── SVG Icons ──────────────────────────────────────────── */

function IconBook() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z" />
      <path d="M17 4h3v16h-3" />
      <path d="M9 8h4" /><path d="M11 6v4" />
    </svg>
  );
}

function IconPalette() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="8.5" cy="11" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="11" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 19c-1.5 0-3-1-3-2.5s1.5-2.5 3-2.5h3a2.5 2.5 0 0 0 0-5" />
    </svg>
  );
}

function IconText() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

/* ── Shared sub-components ──────────────────────────────── */

function Divider() {
  return (
    <div style={{ height: 1, background: "rgba(var(--accent-rgb,203,178,124),0.1)", margin: "18px 0" }} />
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--text-accent)",
      opacity: 0.45,
      fontFamily: "var(--font-ui, system-ui)",
      marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

function SettingsRow({ icon, label, value, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 12px 13px 18px",
        borderRadius: 10,
        background: "transparent",
        border: "none",
        borderLeft: "3px solid rgba(var(--accent-rgb,203,178,124),0.3)",
        cursor: "pointer",
        marginBottom: 6,
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
        transition: "opacity 0.15s",
      }}
    >
      <span style={{ color: "var(--text-accent)", opacity: 0.6, flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{
        flex: 1,
        textAlign: "left",
        fontFamily: "var(--font-ui, system-ui)",
        fontSize: 15,
        fontWeight: 600,
        color: "var(--text-primary)",
        letterSpacing: "-0.01em",
      }}>
        {label}
      </span>
      {value && (
        <span style={{
          fontFamily: "var(--font-ui, system-ui)",
          fontSize: 12,
          color: "var(--text-accent)",
          opacity: 0.55,
          marginRight: 6,
        }}>
          {value}
        </span>
      )}
      <span style={{ color: "var(--text-accent)", opacity: 0.3 }}>
        <IconChevronRight />
      </span>
    </button>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 44,
        height: 26,
        borderRadius: 100,
        background: on
          ? "rgba(var(--accent-rgb,203,178,124),1)"
          : "rgba(var(--accent-rgb,203,178,124),0.12)",
        border: on ? "none" : "1px solid rgba(var(--accent-rgb,203,178,124),0.2)",
        position: "relative",
        transition: "background 0.22s ease",
        cursor: "pointer",
        flexShrink: 0,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div style={{
        position: "absolute",
        top: 3,
        left: on ? 21 : 3,
        width: 20,
        height: 20,
        borderRadius: 100,
        background: on ? "var(--text-inverse, #0d0d0d)" : "rgba(var(--accent-rgb,203,178,124),0.5)",
        transition: "left 0.22s cubic-bezier(0.22,1,0.36,1)",
      }} />
    </button>
  );
}

function BackHeader({ label, onBack }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
      <button
        onClick={onBack}
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "rgba(var(--accent-rgb,203,178,124),0.07)",
          border: "1px solid rgba(var(--accent-rgb,203,178,124),0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--text-accent)",
          WebkitTapHighlightColor: "transparent",
          flexShrink: 0,
        }}
      >
        <IconChevronLeft />
      </button>
      <h2 style={{
        fontFamily: "var(--font-ui, system-ui)",
        fontSize: 22,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        color: "var(--text-primary)",
        margin: 0,
      }}>
        {label}
      </h2>
    </div>
  );
}

/* ── Translation Card ───────────────────────────────────── */

function TranslationCard({ t }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      borderLeft: "3px solid rgba(var(--accent-rgb,203,178,124),0.3)",
      paddingLeft: 16,
      paddingTop: 14,
      paddingBottom: expanded ? 0 : 14,
      marginBottom: 12,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{
              fontFamily: "var(--font-ui, system-ui)",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}>
              {t.label}
            </span>
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-accent)",
              background: "rgba(var(--accent-rgb,203,178,124),0.1)",
              borderRadius: 4,
              padding: "2px 6px",
            }}>
              {t.badge}
            </span>
          </div>
          <div style={{
            fontFamily: "var(--font-body, Georgia, serif)",
            fontSize: 11,
            fontStyle: "italic",
            color: "var(--text-primary)",
            opacity: 0.4,
          }}>
            {t.tagline}
          </div>
        </div>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "8px 0",
          display: "flex",
          alignItems: "center",
          gap: 5,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span style={{
          fontFamily: "var(--font-ui, system-ui)",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(var(--accent-rgb,203,178,124),0.5)",
        }}>
          About this translation
        </span>
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ color: "var(--text-accent)", opacity: 0.4, transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {expanded && (
        <div style={{ paddingBottom: 16, animation: "sm-view-in 0.22s ease forwards" }}>
          <p style={{
            fontFamily: "var(--font-body, Georgia, serif)",
            fontSize: 13,
            lineHeight: 1.7,
            color: "var(--text-primary)",
            opacity: 0.6,
            margin: "0 0 10px",
          }}>
            {t.description}
          </p>
          <div style={{
            fontFamily: "var(--font-ui, system-ui)",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(var(--accent-rgb,203,178,124),0.4)",
          }}>
            {t.source}
          </div>
        </div>
      )}
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
    if (e.target === e.currentTarget) { onClose(); setView("main"); }
  }

  function handleClose() { onClose(); setView("main"); }

  return (
    <>
      <style>{`
        @keyframes sm-backdrop-in { from{opacity:0} to{opacity:1} }
        @keyframes sm-modal-in {
          from { opacity:0; transform:translateY(20px) scale(0.97) }
          to   { opacity:1; transform:translateY(0) scale(1) }
        }
        @keyframes sm-view-in {
          from { opacity:0; transform:translateX(12px) }
          to   { opacity:1; transform:translateX(0) }
        }
        .sm-backdrop { animation: sm-backdrop-in 0.25s ease forwards }
        .sm-modal    { animation: sm-modal-in 0.35s cubic-bezier(0.22,1,0.36,1) forwards }
        .sm-view     { animation: sm-view-in 0.25s ease forwards }
        .sm-scroll::-webkit-scrollbar { display:none }
        .sm-scroll { -ms-overflow-style:none; scrollbar-width:none }
      `}</style>

      {/* Backdrop */}
      <div
        className="sm-backdrop"
        onClick={handleBackdropClick}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center",
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
            borderRadius: 24,
            boxShadow: "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(var(--accent-rgb,203,178,124),0.07)",
          }}
        >
          <div style={{ padding: "28px 24px 32px" }}>

            {/* ── MAIN VIEW ─────────────────────────────────── */}
            {view === "main" && (
              <div className="sm-view">
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                  <h2 style={{
                    fontFamily: "var(--font-ui, system-ui)",
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "var(--text-primary)",
                    margin: 0,
                  }}>
                    Settings
                  </h2>
                  <button
                    onClick={handleClose}
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: "rgba(var(--accent-rgb,203,178,124),0.07)",
                      border: "1px solid rgba(var(--accent-rgb,203,178,124),0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", fontSize: 13,
                      color: "var(--text-primary)", opacity: 0.5,
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    ✕
                  </button>
                </div>

                <SectionLabel>Reading</SectionLabel>
                <SettingsRow
                  icon={<IconBook />}
                  label="Translations"
                  onClick={() => setView("translation")}
                />
                <SettingsRow
                  icon={<IconPalette />}
                  label="Appearance"
                  value={THEMES.find((t) => t.id === theme)?.name}
                  onClick={() => setView("appearance")}
                />
                <SettingsRow
                  icon={<IconText />}
                  label="Bible Text Size"
                  value={`${textSize.toFixed(1)}×`}
                  onClick={() => setView("textSize")}
                />

                <Divider />

                <SectionLabel>Display</SectionLabel>
                {/* Chapterless toggle row */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "13px 12px 13px 18px",
                  borderLeft: "3px solid rgba(var(--accent-rgb,203,178,124),0.3)",
                  borderRadius: 10,
                  marginBottom: 6,
                }}>
                  <span style={{ color: "var(--text-accent)", opacity: 0.6, flexShrink: 0 }}>
                    <IconEye />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "var(--font-ui, system-ui)",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.01em",
                      marginBottom: 2,
                    }}>
                      Chapterless Mode
                    </div>
                    <div style={{
                      fontFamily: "var(--font-ui, system-ui)",
                      fontSize: 11,
                      color: "var(--text-primary)",
                      opacity: 0.35,
                    }}>
                      Hides chapter titles and verse numbers
                    </div>
                  </div>
                  <Toggle on={chapterlessMode} onToggle={() => setChapterlessMode((v) => !v)} />
                </div>

                <Divider />

                <SectionLabel>Support</SectionLabel>
                <SettingsRow
                  icon={<IconMail />}
                  label="Contact"
                  onClick={() => setView("contact")}
                />

                <Divider />

                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--text-accent)",
                  opacity: 0.18,
                  fontFamily: "var(--font-ui, system-ui)",
                }}>
                  ABIDE
                </div>
              </div>
            )}

            {/* ── APPEARANCE VIEW ───────────────────────────── */}
            {view === "appearance" && (
              <div className="sm-view">
                <BackHeader label="Appearance" onBack={() => setView("main")} />
                <SectionLabel>Choose Theme</SectionLabel>
                {THEMES.map((t) => {
                  const isActive = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "13px 12px 13px 18px",
                        borderRadius: 10,
                        background: "transparent",
                        border: "none",
                        borderLeft: isActive
                          ? `3px solid ${t.swatch}`
                          : "3px solid rgba(var(--accent-rgb,203,178,124),0.15)",
                        cursor: "pointer",
                        marginBottom: 6,
                        WebkitTapHighlightColor: "transparent",
                        touchAction: "manipulation",
                      }}
                    >
                      {/* Color swatch dot */}
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: t.swatch,
                        flexShrink: 0,
                        opacity: isActive ? 1 : 0.55,
                      }} />
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={{
                          fontFamily: "var(--font-ui, system-ui)",
                          fontSize: 15,
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? "var(--text-accent)" : "var(--text-primary)",
                          letterSpacing: "-0.01em",
                          marginBottom: 2,
                        }}>
                          {t.name}
                        </div>
                        <div style={{
                          fontFamily: "var(--font-body, Georgia, serif)",
                          fontSize: 11,
                          fontStyle: "italic",
                          color: "var(--text-primary)",
                          opacity: 0.38,
                        }}>
                          {t.description}
                        </div>
                      </div>
                      {isActive && (
                        <span style={{ color: "var(--text-accent)", opacity: 0.7, flexShrink: 0 }}>
                          <IconCheck />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── TEXT SIZE VIEW ────────────────────────────── */}
            {view === "textSize" && (
              <div className="sm-view">
                <BackHeader label="Bible Text Size" onBack={() => setView("main")} />

                {/* Size control */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px",
                  borderLeft: "3px solid rgba(var(--accent-rgb,203,178,124),0.35)",
                  borderRadius: 10,
                  marginBottom: 24,
                }}>
                  <button
                    onClick={() => setTextSize(Math.max(0.8, textSize - 0.1))}
                    disabled={textSize <= 0.8}
                    style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: "rgba(var(--accent-rgb,203,178,124),0.08)",
                      border: "1px solid rgba(var(--accent-rgb,203,178,124),0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, fontWeight: 300,
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      opacity: textSize <= 0.8 ? 0.25 : 1,
                      WebkitTapHighlightColor: "transparent",
                      transition: "opacity 0.2s",
                    }}
                  >
                    −
                  </button>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      fontFamily: "var(--font-ui, system-ui)",
                      fontSize: 36,
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                      color: "var(--text-accent)",
                      lineHeight: 1,
                    }}>
                      {textSize.toFixed(1)}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-ui, system-ui)",
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--text-primary)",
                      opacity: 0.3,
                      marginTop: 4,
                    }}>
                      scale
                    </div>
                  </div>
                  <button
                    onClick={() => setTextSize(Math.min(2.0, textSize + 0.1))}
                    disabled={textSize >= 2.0}
                    style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: "rgba(var(--accent-rgb,203,178,124),0.08)",
                      border: "1px solid rgba(var(--accent-rgb,203,178,124),0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, fontWeight: 300,
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      opacity: textSize >= 2.0 ? 0.25 : 1,
                      WebkitTapHighlightColor: "transparent",
                      transition: "opacity 0.2s",
                    }}
                  >
                    +
                  </button>
                </div>

                <SectionLabel>Preview</SectionLabel>
                <div style={{
                  padding: 20,
                  borderLeft: "3px solid rgba(var(--accent-rgb,203,178,124),0.2)",
                  lineHeight: 1.75,
                  fontSize: `${textSize}rem`,
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body, Georgia, serif)",
                }}>
                  <sup style={{ fontSize: `${textSize * 0.7}rem`, color: "var(--text-accent)", opacity: 0.6, marginRight: 4 }}>1</sup>
                  In the beginning God created the heavens and the earth.{" "}
                  <sup style={{ fontSize: `${textSize * 0.7}rem`, color: "var(--text-accent)", opacity: 0.6, marginRight: 4 }}>2</sup>
                  And the earth was without form and empty, and darkness lay over the face of the deep.
                </div>
              </div>
            )}

            {/* ── TRANSLATION VIEW ──────────────────────────── */}
            {view === "translation" && (
              <div className="sm-view">
                <BackHeader label="Translations" onBack={() => setView("main")} />
                <SectionLabel>Choose Translation</SectionLabel>
                {TRANSLATIONS.map((t) => (
                  <TranslationCard key={t.id} t={t} />
                ))}
              </div>
            )}

            {/* ── CONTACT VIEW ──────────────────────────────── */}
            {view === "contact" && (
              <div className="sm-view">
                <BackHeader
                  label="Contact"
                  onBack={() => { setView("main"); setContactSent(false); setContactMsg(""); }}
                />

                {contactSent ? (
                  <div style={{ textAlign: "center", paddingTop: 40 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: "50%",
                      background: "rgba(var(--accent-rgb,203,178,124),0.12)",
                      border: "1px solid rgba(var(--accent-rgb,203,178,124),0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 20px",
                      color: "var(--text-accent)",
                    }}>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div style={{
                      fontFamily: "var(--font-ui, system-ui)",
                      fontSize: 18, fontWeight: 700,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.01em",
                      marginBottom: 8,
                    }}>
                      Message sent
                    </div>
                    <p style={{
                      fontFamily: "var(--font-body, Georgia, serif)",
                      fontSize: 14, lineHeight: 1.7,
                      color: "var(--text-primary)", opacity: 0.55,
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
                      color: "var(--text-primary)", opacity: 0.55,
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
                        background: "rgba(var(--accent-rgb,203,178,124),0.04)",
                        border: "1px solid rgba(var(--accent-rgb,203,178,124),0.12)",
                        borderRadius: 12,
                        padding: "14px 16px",
                        fontFamily: "var(--font-body, Georgia, serif)",
                        fontSize: 15,
                        lineHeight: 1.7,
                        color: "var(--text-primary)",
                        resize: "none",
                        outline: "none",
                        marginBottom: 14,
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
                        padding: 14,
                        borderRadius: 12,
                        background: contactMsg.trim() && !contactSending
                          ? "rgba(var(--accent-rgb,203,178,124),0.12)"
                          : "rgba(var(--accent-rgb,203,178,124),0.04)",
                        border: contactMsg.trim() && !contactSending
                          ? "1px solid rgba(var(--accent-rgb,203,178,124),0.35)"
                          : "1px solid rgba(var(--accent-rgb,203,178,124),0.08)",
                        cursor: contactMsg.trim() && !contactSending ? "pointer" : "default",
                        fontFamily: "var(--font-ui, system-ui)",
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        color: contactMsg.trim() && !contactSending
                          ? "var(--text-accent)"
                          : "rgba(var(--accent-rgb,203,178,124),0.25)",
                        transition: "all 0.2s",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      {contactSending ? "Sending…" : "Send"}
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
