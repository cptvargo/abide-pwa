/**
 * ChristRevealedReader.jsx
 * Dedicated Bible chapter reader for the Christ Revealed pilgrimage.
 *
 * FIXES:
 *   1. Triggers fire when a verse EXITS the top of the viewport (user scrolled past it)
 *      — not when it enters. This prevents Genesis 1:1 firing immediately on load.
 *   2. Defaults to WAE translation. User can swap on the fly via inline picker in header.
 *
 * Drawer tabs:
 *   ✦ Christ Revealed      — gold (#C4A96B)
 *   ◈ The Adversary's Move — gray-white (#C8C8C8)
 *
 * Chapter-end: "Christ in this chapter" summary card shown when user taps Next Chapter.
 *
 * ALL React hooks declared unconditionally at the top level.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { loadChapter } from "../lib/bible";
import { getBookDisplayName } from "../lib/bibleStructure";

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const CHAPTER_COUNTS = {
  genesis: 50,
  exodus: 40,
  leviticus: 27,
  numbers: 36,
  deuteronomy: 34,
  joshua: 24,
  judges: 21,
  ruth: 4,
  "1samuel": 31,
  "2samuel": 24,
  "1kings": 22,
  "2kings": 25,
  "1chronicles": 29,
  "2chronicles": 36,
  ezra: 10,
  nehemiah: 13,
  esther: 10,
  job: 42,
  psalms: 150,
  proverbs: 31,
  ecclesiastes: 12,
  songofsolomon: 8,
  isaiah: 66,
  jeremiah: 52,
  lamentations: 5,
  ezekiel: 48,
  daniel: 12,
  hosea: 14,
  joel: 3,
  amos: 9,
  obadiah: 1,
  jonah: 4,
  micah: 7,
  nahum: 3,
  habakkuk: 3,
  zephaniah: 3,
  haggai: 2,
  zechariah: 14,
  malachi: 4,
  matthew: 28,
  mark: 16,
  luke: 24,
  john: 21,
  acts: 28,
  romans: 16,
  "1corinthians": 16,
  "2corinthians": 13,
  galatians: 6,
  ephesians: 6,
  philippians: 4,
  colossians: 4,
  "1thessalonians": 5,
  "2thessalonians": 3,
  "1timothy": 6,
  "2timothy": 4,
  titus: 3,
  philemon: 1,
  hebrews: 13,
  james: 5,
  "1peter": 5,
  "2peter": 3,
  "1john": 5,
  "2john": 1,
  "3john": 1,
  jude: 1,
  revelation: 22,
};

const CHRIST_COLOR = "#C4A96B";
const ADVERSARY_COLOR = "#C8C8C8";

// Translations available inside the Christ Revealed reader
const CR_TRANSLATIONS = ["WAE", "KJV", "ASR"];
const CR_TRANSLATION_LABELS = {
  WAE: "Webster ABIDE Edition",
  KJV: "King James Version",
  ASR: "ABIDE Source Reading",
};

/* ─────────────────────────────────────────
   Pure helpers
───────────────────────────────────────── */
function buildTriggerMap(bookData) {
  if (!bookData?.events) return {};
  const map = {};

  function add(ch, v, obs) {
    const key = `${ch}:${v}`;
    if (!map[key]) map[key] = [];
    map[key].push(obs);
  }

  for (const event of bookData.events) {
    for (const item of event.christRevealed || []) {
      if (item?.trigger) {
        add(item.trigger.chapter, item.trigger.verse, {
          type: "christRevealed",
          text: item.text,
          eventTitle: event.title,
        });
      }
    }
    for (const item of event.adversarysMoves || []) {
      if (item?.trigger) {
        add(item.trigger.chapter, item.trigger.verse, {
          type: "adversarysMoves",
          text: item.text,
          eventTitle: event.title,
        });
      }
    }
  }
  return map;
}

function buildChapterSummaryMap(bookData) {
  if (!bookData?.events) return {};
  const map = {};
  for (const event of bookData.events) {
    for (const summary of event.chapterSummaries || []) {
      if (summary?.chapter) map[summary.chapter] = summary.text;
    }
  }
  return map;
}

/* ─────────────────────────────────────────
   Sub-components (no hooks)
───────────────────────────────────────── */
function LoadingScreen({ onBack, bookDisplayName }) {
  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0D0C09",
        overflow: "hidden",
      }}
    >
      <style>{`@keyframes cr-pulse{0%,100%{opacity:0.3}50%{opacity:0.8}}`}</style>
      <div
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 14px)",
          paddingBottom: "14px",
          paddingLeft: "20px",
          paddingRight: "20px",
          borderBottom: "1px solid rgba(196,169,107,0.08)",
          flexShrink: 0,
          background: "#0D0C09",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "rgba(196,169,107,0.65)",
            fontSize: "13px",
            fontFamily: "var(--font-ui, system-ui)",
            WebkitTapHighlightColor: "transparent",
            padding: "4px 0",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {bookDisplayName || "Back"}
        </button>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            fontSize: "24px",
            color: "rgba(196,169,107,0.5)",
            animation: "cr-pulse 1.5s ease-in-out infinite",
          }}
        >
          ✧
        </div>
        <div
          style={{
            color: "rgba(196,169,107,0.35)",
            fontFamily: "var(--font-ui, system-ui)",
            fontSize: "13px",
            letterSpacing: "0.08em",
          }}
        >
          Loading…
        </div>
      </div>
    </div>
  );
}

function LeaveModal({ onConfirm, onCancel, lastBook, lastChapter }) {
  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 80,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 90,
          background: "#1A1812",
          border: "1px solid rgba(196,169,107,0.15)",
          borderBottom: "none",
          borderRadius: "20px 20px 0 0",
          padding: "24px",
          paddingBottom: "max(28px, env(safe-area-inset-bottom))",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "3px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "2px",
            margin: "0 auto 20px",
          }}
        />
        <p
          style={{
            fontSize: "17px",
            fontWeight: "600",
            color: "#F0EBE0",
            fontFamily: "var(--font-ui, system-ui)",
            margin: "0 0 8px",
            textAlign: "center",
          }}
        >
          Leave Christ Revealed?
        </p>
        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.6,
            color: "rgba(240,235,224,0.45)",
            fontFamily: "var(--font-ui, system-ui)",
            margin: "0 0 24px",
            textAlign: "center",
          }}
        >
          Your progress is saved. You'll return to{" "}
          <strong style={{ color: "rgba(196,169,107,0.8)" }}>
            {lastBook} {lastChapter}
          </strong>{" "}
          in the Bible reader.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(240,235,224,0.5)",
              fontSize: "14px",
              fontFamily: "var(--font-ui, system-ui)",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Stay
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              background: CHRIST_COLOR,
              border: "none",
              color: "#1A1510",
              fontSize: "14px",
              fontWeight: "600",
              fontFamily: "var(--font-ui, system-ui)",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Leave Journey
          </button>
        </div>
      </div>
    </>
  );
}

function TranslationPicker({ current, onSelect, onClose }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 80,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 90,
          background: "#1A1812",
          border: "1px solid rgba(196,169,107,0.15)",
          borderBottom: "none",
          borderRadius: "20px 20px 0 0",
          paddingBottom: "max(24px, env(safe-area-inset-bottom))",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 4px",
          }}
        >
          <div
            style={{
              width: 32,
              height: 3,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 2,
            }}
          />
        </div>
        <div
          style={{
            padding: "8px 24px 14px",
            fontSize: 11,
            letterSpacing: "0.16em",
            color: "rgba(240,235,224,0.3)",
            textTransform: "uppercase",
            textAlign: "center",
            fontFamily: "var(--font-ui, system-ui)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          Translation
        </div>
        {CR_TRANSLATIONS.map((t) => (
          <button
            key={t}
            onClick={() => {
              onSelect(t);
              onClose();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "16px 24px",
              background: "transparent",
              border: "none",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              cursor: "pointer",
              textAlign: "left",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  fontFamily: "var(--font-ui, system-ui)",
                  color: current === t ? CHRIST_COLOR : "rgba(240,235,224,0.7)",
                  marginBottom: 3,
                }}
              >
                {t}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(240,235,224,0.35)",
                  fontFamily: "var(--font-ui, system-ui)",
                  fontStyle: "italic",
                }}
              >
                {CR_TRANSLATION_LABELS[t]}
              </div>
            </div>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: `1.5px solid ${current === t ? CHRIST_COLOR : "rgba(255,255,255,0.15)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {current === t && (
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: CHRIST_COLOR,
                  }}
                />
              )}
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function ObservationDrawer({
  christObservations,
  adversaryObservations,
  activeTab,
  onTabChange,
  isOpen,
  onToggle,
  onClose,
  hasUnreadChrist,
  hasUnreadAdversary,
}) {
  const hasAny =
    christObservations.length > 0 || adversaryObservations.length > 0;
  if (!hasAny) return null;

  const tabObs =
    activeTab === "christRevealed" ? christObservations : adversaryObservations;
  const currentObs = tabObs.length > 0 ? tabObs[tabObs.length - 1] : null;
  const accentColor =
    activeTab === "christRevealed" ? CHRIST_COLOR : ADVERSARY_COLOR;

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(0,0,0,0.35)",
          }}
        />
      )}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "#131210",
          border: `1px solid ${isOpen ? `rgba(${activeTab === "christRevealed" ? "196,169,107" : "200,200,200"},0.22)` : "rgba(196,169,107,0.14)"}`,
          borderBottom: "none",
          borderRadius: "18px 18px 0 0",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          transform: isOpen ? "translateY(0)" : "translateY(calc(100% - 52px))",
          paddingBottom: "env(safe-area-inset-bottom)",
          maxHeight: "65vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Minimized tab */}
        <button
          onClick={onToggle}
          style={{
            position: "relative",
            width: "100%",
            padding: "14px 16px 10px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "7px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "32px",
              height: "3px",
              background: "rgba(196,169,107,0.25)",
              borderRadius: "2px",
            }}
          />
          <span style={{ fontSize: "12px", color: accentColor }}>
            {activeTab === "christRevealed" ? "✦" : "◈"}
          </span>
          <span
            style={{
              fontSize: "12px",
              color: `${accentColor}BB`,
              fontFamily: "var(--font-ui, system-ui)",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              flex: 1,
              textAlign: "left",
            }}
          >
            {activeTab === "christRevealed"
              ? "Christ Revealed"
              : "The Adversary's Move"}
          </span>
          {!isOpen && hasUnreadAdversary && activeTab === "christRevealed" && (
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: ADVERSARY_COLOR,
                opacity: 0.7,
                flexShrink: 0,
              }}
            />
          )}
          {!isOpen && hasUnreadChrist && activeTab === "adversarysMoves" && (
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: CHRIST_COLOR,
                opacity: 0.7,
                flexShrink: 0,
              }}
            />
          )}
          <span
            style={{
              fontSize: "10px",
              color: "rgba(196,169,107,0.4)",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              display: "inline-block",
            }}
          >
            ▾
          </span>
        </button>

        {isOpen && (
          <>
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                flexShrink: 0,
              }}
            >
              {[
                {
                  key: "christRevealed",
                  icon: "✦",
                  label: "Christ Revealed",
                  color: CHRIST_COLOR,
                  count: christObservations.length,
                  unread: hasUnreadChrist,
                },
                {
                  key: "adversarysMoves",
                  icon: "◈",
                  label: "The Adversary's Move",
                  color: ADVERSARY_COLOR,
                  count: adversaryObservations.length,
                  unread: hasUnreadAdversary,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  style={{
                    flex: 1,
                    padding: "10px 8px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                    borderBottom:
                      activeTab === tab.key
                        ? `2px solid ${tab.color}`
                        : "2px solid transparent",
                    WebkitTapHighlightColor: "transparent",
                    transition: "border-color 0.15s ease",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color:
                        activeTab === tab.key ? tab.color : `${tab.color}55`,
                    }}
                  >
                    {tab.icon}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: "var(--font-ui, system-ui)",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color:
                        activeTab === tab.key ? tab.color : `${tab.color}55`,
                    }}
                  >
                    {tab.label}
                  </span>
                  {tab.count > 0 && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontFamily: "var(--font-ui, system-ui)",
                        color:
                          activeTab === tab.key
                            ? `${tab.color}88`
                            : `${tab.color}33`,
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                  {tab.unread && activeTab !== tab.key && (
                    <div
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: tab.color,
                        position: "absolute",
                        top: "7px",
                        right: "8px",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 20px 20px",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {tabObs.length === 0 ? (
                <p
                  style={{
                    fontSize: "13px",
                    color:
                      activeTab === "christRevealed"
                        ? "rgba(196,169,107,0.3)"
                        : "rgba(200,200,200,0.25)",
                    fontFamily: "var(--font-ui, system-ui)",
                    fontStyle: "italic",
                    textAlign: "center",
                    margin: "20px 0",
                  }}
                >
                  {activeTab === "christRevealed"
                    ? "Christ will be revealed as you read."
                    : "The adversary's moves will surface as you read."}
                </p>
              ) : (
                <>
                  {currentObs && (
                    <div style={{ marginBottom: "20px" }}>
                      <p
                        style={{
                          fontSize: "15px",
                          lineHeight: 1.8,
                          color:
                            activeTab === "christRevealed"
                              ? "rgba(240,235,224,0.88)"
                              : "rgba(210,210,210,0.75)",
                          fontFamily: "var(--font-body, Georgia, serif)",
                          margin: 0,
                        }}
                      >
                        {currentObs.text}
                      </p>
                    </div>
                  )}
                  {tabObs.length > 1 && (
                    <>
                      <div
                        style={{
                          height: "1px",
                          background:
                            activeTab === "christRevealed"
                              ? "rgba(196,169,107,0.08)"
                              : "rgba(200,200,200,0.07)",
                          marginBottom: "14px",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color:
                            activeTab === "christRevealed"
                              ? "rgba(196,169,107,0.3)"
                              : "rgba(200,200,200,0.25)",
                          fontFamily: "var(--font-ui, system-ui)",
                          marginBottom: "12px",
                        }}
                      >
                        Earlier in this chapter
                      </div>
                      {[...tabObs]
                        .reverse()
                        .slice(1)
                        .map((obs, i) => (
                          <div
                            key={i}
                            style={{
                              marginBottom: "14px",
                              paddingLeft: "12px",
                              borderLeft: `2px solid ${activeTab === "christRevealed" ? "rgba(196,169,107,0.15)" : "rgba(200,200,200,0.12)"}`,
                            }}
                          >
                            <p
                              style={{
                                fontSize: "13px",
                                lineHeight: 1.65,
                                color:
                                  activeTab === "christRevealed"
                                    ? "rgba(240,235,224,0.45)"
                                    : "rgba(200,200,200,0.38)",
                                fontFamily: "var(--font-body, Georgia, serif)",
                                margin: 0,
                              }}
                            >
                              {obs.text}
                            </p>
                          </div>
                        ))}
                    </>
                  )}
                </>
              )}
              <div
                style={{
                  marginTop: "16px",
                  padding: "10px 12px",
                  background: "rgba(196,169,107,0.03)",
                  border: "1px solid rgba(196,169,107,0.08)",
                  borderRadius: "8px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    lineHeight: 1.55,
                    color: "rgba(240,235,224,0.25)",
                    fontFamily: "var(--font-ui, system-ui)",
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  These observations are a study guide, not Scripture. The Holy
                  Spirit — not this tool — is the teacher.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function ChapterSummaryCard({
  summaryText,
  bookDisplayName,
  currentChapter,
  isLastChapter,
  isComplete,
  marking,
  onNextChapter,
  onMarkComplete,
}) {
  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          background: "rgba(0,0,0,0.55)",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 70,
          background: "#111009",
          border: "1px solid rgba(196,169,107,0.2)",
          borderBottom: "none",
          borderRadius: "22px 22px 0 0",
          padding: "24px",
          paddingBottom: "max(28px, env(safe-area-inset-bottom))",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "3px",
            background: "rgba(196,169,107,0.2)",
            borderRadius: "2px",
            margin: "0 auto 20px",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "14px",
          }}
        >
          <span style={{ fontSize: "14px", color: CHRIST_COLOR }}>✦</span>
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(196,169,107,0.55)",
              fontFamily: "var(--font-ui, system-ui)",
            }}
          >
            Christ in {bookDisplayName} {currentChapter}
          </span>
        </div>
        <p
          style={{
            fontSize: "16px",
            lineHeight: 1.8,
            color: "rgba(240,235,224,0.9)",
            fontFamily: "var(--font-body, Georgia, serif)",
            margin: "0 0 24px",
          }}
        >
          {summaryText}
        </p>
        {isLastChapter ? (
          isComplete ? (
            <div
              style={{
                padding: "14px",
                borderRadius: "12px",
                background: "rgba(196,169,107,0.06)",
                border: "1px solid rgba(196,169,107,0.15)",
                color: "rgba(196,169,107,0.6)",
                fontSize: "13px",
                fontFamily: "var(--font-ui, system-ui)",
                textAlign: "center",
              }}
            >
              ✓ {bookDisplayName} complete
            </div>
          ) : (
            <button
              onClick={onMarkComplete}
              disabled={marking}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "14px",
                background: marking ? "rgba(196,169,107,0.4)" : CHRIST_COLOR,
                border: "none",
                cursor: marking ? "default" : "pointer",
                fontFamily: "var(--font-ui, system-ui)",
                fontSize: "15px",
                fontWeight: "600",
                letterSpacing: "0.04em",
                color: "#1A1510",
                WebkitTapHighlightColor: "transparent",
                transition: "background 0.2s ease",
              }}
            >
              {marking ? "Saving…" : `Mark ${bookDisplayName} Complete`}
            </button>
          )
        ) : (
          <button
            onClick={onNextChapter}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "14px",
              background: CHRIST_COLOR,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-ui, system-ui)",
              fontSize: "14px",
              fontWeight: "600",
              letterSpacing: "0.04em",
              color: "#1A1510",
              WebkitTapHighlightColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {bookDisplayName} {currentChapter + 1}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   Main Component — ALL hooks at top level
───────────────────────────────────────── */
export default function ChristRevealedReader({
  bookId,
  bookData,
  translation: appTranslation = "WAE", // app-level translation
  initialChapter = 1,
  onSaveChapter,
  onBack,
  onLeaveJourney,
  onMarkComplete,
  isComplete,
  readingContext,
}) {
  /* ══════════════════════════════════════
     HOOKS — all unconditional, all first
  ══════════════════════════════════════ */
  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [verses, setVerses] = useState([]);
  const [loadingChapter, setLoadingChapter] = useState(false);

  // Local translation — defaults to WAE, user can swap on the fly
  const [localTranslation, setLocalTranslation] = useState(
    CR_TRANSLATIONS.includes(appTranslation) ? appTranslation : "WAE",
  );
  const [showTranslationPicker, setShowTranslationPicker] = useState(false);

  const [christObservations, setChristObservations] = useState([]);
  const [adversaryObservations, setAdversaryObservations] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("christRevealed");
  const [unreadChrist, setUnreadChrist] = useState(false);
  const [unreadAdversary, setUnreadAdversary] = useState(false);
  const [seenTriggers, setSeenTriggers] = useState(new Set());

  const [showSummaryCard, setShowSummaryCard] = useState(false);
  const [marking, setMarking] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const scrollRef = useRef(null);
  const observerRef = useRef(null);
  const autoCloseTimer = useRef(null);

  /* ── Derived values ── */
  const triggerMap = buildTriggerMap(bookData);
  const chapterSummaryMap = buildChapterSummaryMap(bookData);
  const TOTAL_CHAPTERS = CHAPTER_COUNTS[bookId] || 1;
  const bookDisplayName =
    bookData?.displayName || (bookId ? getBookDisplayName(bookId) : "");
  const isLastChapter = currentChapter === TOTAL_CHAPTERS;
  const currentSummary = chapterSummaryMap[currentChapter] || null;

  /* ── Restore initialChapter when bookId changes ── */
  useEffect(() => {
    setCurrentChapter(initialChapter);
  }, [bookId]);

  /* ── Save chapter progress ── */
  useEffect(() => {
    if (bookId && onSaveChapter) onSaveChapter(currentChapter);
  }, [currentChapter, bookId]);

  /* ── Load chapter verses ── */
  useEffect(() => {
    if (!bookId || !bookData) return;
    let cancelled = false;

    setLoadingChapter(true);
    setVerses([]);
    setChristObservations([]);
    setAdversaryObservations([]);
    setSeenTriggers(new Set());
    setDrawerOpen(false);
    setUnreadChrist(false);
    setUnreadAdversary(false);
    setShowSummaryCard(false);

    if (scrollRef.current) scrollRef.current.scrollTop = 0;

    async function fetchChapter() {
      try {
        const raw = await loadChapter(
          bookId,
          currentChapter,
          localTranslation.toLowerCase(),
        );
        if (cancelled) return;

        const chapterData = raw.chapters
          ? raw.chapters[String(currentChapter)]
          : raw;
        const versesData = chapterData?.verses ?? chapterData;

        let items = [];
        if (Array.isArray(versesData)) {
          items = versesData;
        } else if (versesData && typeof versesData === "object") {
          items = Object.entries(versesData).map(([v, t]) => ({
            verse: Number(v),
            text: t,
          }));
        }
        setVerses(items);
      } catch (err) {
        console.error(
          `[CR Reader] Failed to load ${bookId} ch${currentChapter}`,
          err,
        );
      } finally {
        if (!cancelled) setLoadingChapter(false);
      }
    }

    fetchChapter();
    return () => {
      cancelled = true;
    };
  }, [bookId, currentChapter, localTranslation, bookData]);

  /* ── IntersectionObserver — fire when verse EXITS the top of viewport ──
     Using rootMargin "0px 0px -85% 0px" means a verse only triggers when
     it has scrolled UP past the top 15% of the scroll container —
     i.e. the user has already read past it. This prevents first-verse
     triggers firing immediately on chapter load.
  ── */
  useEffect(() => {
    if (!scrollRef.current || verses.length === 0 || !bookData) return;

    if (observerRef.current) observerRef.current.disconnect();
    const root = scrollRef.current;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Fire only when the verse has LEFT the viewport upward
          // isIntersecting: false + boundingClientRect.bottom < 0 means
          // the verse has scrolled above the top of the container
          if (entry.isIntersecting) continue;
          if (entry.boundingClientRect.bottom > 0) continue; // still below top — not yet

          const verseKey = entry.target.dataset.verseKey;
          if (!verseKey || seenTriggers.has(verseKey) || !triggerMap[verseKey])
            continue;

          setSeenTriggers((prev) => new Set([...prev, verseKey]));

          const triggered = triggerMap[verseKey];
          const christItems = triggered.filter(
            (o) => o.type === "christRevealed",
          );
          const adversaryItems = triggered.filter(
            (o) => o.type === "adversarysMoves",
          );

          if (christItems.length > 0) {
            setChristObservations((prev) => [...prev, ...christItems]);
            setActiveTab("christRevealed");
            setDrawerOpen(true);
            setUnreadChrist(false);
            if (adversaryItems.length > 0) setUnreadAdversary(true);
          }
          if (adversaryItems.length > 0) {
            setAdversaryObservations((prev) => [...prev, ...adversaryItems]);
            if (christItems.length === 0) {
              setActiveTab("adversarysMoves");
              setDrawerOpen(true);
              setUnreadAdversary(false);
            } else {
              setUnreadAdversary(true);
            }
          }

          if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
          autoCloseTimer.current = setTimeout(() => setDrawerOpen(false), 5000);
        }
      },
      {
        root,
        // threshold 0 + rootMargin: observe the full element but we check
        // boundingClientRect manually in the callback for exit-top detection
        threshold: 0,
      },
    );

    const nodes = root.querySelectorAll("[data-verse-key]");
    nodes.forEach((n) => observerRef.current.observe(n));

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    };
  }, [verses, bookData]);

  /* ══════════════════════════════════════
     ALL HOOKS DONE
  ══════════════════════════════════════ */

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === "christRevealed") setUnreadChrist(false);
    else setUnreadAdversary(false);
  }

  function handleNextChapterPress() {
    if (currentSummary) {
      setShowSummaryCard(true);
    } else {
      advanceChapter();
    }
  }

  function advanceChapter() {
    setShowSummaryCard(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setCurrentChapter((c) => c + 1);
  }

  function handleMarkCompletePress() {
    if (currentSummary && !showSummaryCard) {
      setShowSummaryCard(true);
    } else {
      doMarkComplete();
    }
  }

  async function doMarkComplete() {
    setMarking(true);
    await new Promise((r) => setTimeout(r, 300));
    onMarkComplete();
  }

  /* ── Loading guard (after all hooks) ── */
  if (!bookData) {
    return <LoadingScreen onBack={onBack} bookDisplayName={bookDisplayName} />;
  }

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0D0C09",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes cr-verse-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Header ── */}
      <div
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 14px)",
          paddingBottom: "12px",
          paddingLeft: "20px",
          paddingRight: "20px",
          borderBottom: "1px solid rgba(196,169,107,0.08)",
          flexShrink: 0,
          background: "#0D0C09",
          zIndex: 10,
        }}
      >
        {/* Row 1: back + chapter counter + translation badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "rgba(196,169,107,0.65)",
              fontSize: "13px",
              fontFamily: "var(--font-ui, system-ui)",
              WebkitTapHighlightColor: "transparent",
              padding: "4px 0",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {bookDisplayName}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Translation badge — tappable */}
            <button
              onClick={() => setShowTranslationPicker(true)}
              style={{
                background: "rgba(196,169,107,0.08)",
                border: "1px solid rgba(196,169,107,0.2)",
                borderRadius: "20px",
                padding: "3px 10px",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.1em",
                  color: CHRIST_COLOR,
                  fontFamily: "var(--font-ui, system-ui)",
                }}
              >
                {localTranslation}
              </span>
            </button>

            {/* Chapter counter */}
            <span
              style={{
                fontSize: "12px",
                color: "rgba(196,169,107,0.4)",
                fontFamily: "var(--font-ui, system-ui)",
                letterSpacing: "0.06em",
              }}
            >
              {currentChapter} / {TOTAL_CHAPTERS}
            </span>
          </div>
        </div>

        {/* Row 2: Leave Journey */}
        <button
          onClick={() => setShowLeaveModal(true)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            color: "rgba(240,235,224,0.28)",
            fontSize: "12px",
            fontFamily: "var(--font-ui, system-ui)",
            WebkitTapHighlightColor: "transparent",
            padding: "2px 0",
            letterSpacing: "0.04em",
          }}
        >
          Leave Journey
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          paddingBottom:
            "max(120px, calc(100px + env(safe-area-inset-bottom)))",
        }}
      >
        {/* Chapter heading */}
        <div
          style={{
            paddingTop: "36px",
            paddingBottom: "8px",
            paddingLeft: "24px",
            paddingRight: "24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "300",
              color: CHRIST_COLOR,
              fontFamily: "var(--font-ui, system-ui)",
              letterSpacing: "0.06em",
              opacity: 0.85,
            }}
          >
            {bookDisplayName} {currentChapter}
          </div>
          <div
            style={{
              width: "32px",
              height: "1px",
              background: "rgba(196,169,107,0.2)",
              margin: "14px auto 0",
            }}
          />
        </div>

        {/* Verses */}
        {loadingChapter ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              fontSize: "12px",
              color: "rgba(196,169,107,0.3)",
              fontFamily: "var(--font-ui, system-ui)",
            }}
          >
            Loading…
          </div>
        ) : (
          <div style={{ padding: "20px 24px 0" }}>
            {verses.map((v, idx) => {
              const key = `${currentChapter}:${v.verse}`;
              const hasTrigger = Boolean(triggerMap[key]);
              const isChrist =
                hasTrigger &&
                triggerMap[key].some((o) => o.type === "christRevealed");
              const isAdversary =
                hasTrigger &&
                triggerMap[key].some((o) => o.type === "adversarysMoves");

              return (
                <p
                  key={key}
                  data-verse={v.verse}
                  data-verse-key={hasTrigger ? key : undefined}
                  style={{
                    marginBottom: "20px",
                    lineHeight: 1.9,
                    color: "rgba(240,235,224,0.85)",
                    fontFamily: "var(--font-body, Georgia, serif)",
                    fontSize: "16px",
                    animation: `cr-verse-in 0.25s ease ${Math.min(idx * 0.015, 0.3)}s both`,
                  }}
                >
                  <sup
                    style={{
                      marginRight: "5px",
                      fontSize: "10px",
                      color: isChrist
                        ? CHRIST_COLOR
                        : isAdversary
                          ? ADVERSARY_COLOR
                          : "rgba(196,169,107,0.3)",
                      opacity: hasTrigger ? 0.9 : 0.4,
                      fontFamily: "var(--font-ui, system-ui)",
                      fontStyle: "normal",
                      verticalAlign: "super",
                    }}
                  >
                    {v.verse}
                  </sup>
                  {v.text}
                </p>
              );
            })}
          </div>
        )}

        {/* Bottom action */}
        {!loadingChapter && verses.length > 0 && (
          <div style={{ padding: "32px 24px 16px", textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "rgba(196,169,107,0.08)",
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(196,169,107,0.25)",
                  fontFamily: "var(--font-ui, system-ui)",
                  letterSpacing: "0.1em",
                }}
              >
                {isLastChapter
                  ? "End of " + bookDisplayName
                  : bookDisplayName + " " + currentChapter}
              </span>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "rgba(196,169,107,0.08)",
                }}
              />
            </div>

            {isLastChapter ? (
              isComplete ? (
                <div
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: "rgba(196,169,107,0.06)",
                    border: "1px solid rgba(196,169,107,0.15)",
                    color: "rgba(196,169,107,0.6)",
                    fontSize: "13px",
                    fontFamily: "var(--font-ui, system-ui)",
                  }}
                >
                  ✓ {bookDisplayName} complete
                </div>
              ) : (
                <button
                  onClick={handleMarkCompletePress}
                  disabled={marking}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "14px",
                    background: marking
                      ? "rgba(196,169,107,0.4)"
                      : CHRIST_COLOR,
                    border: "none",
                    cursor: marking ? "default" : "pointer",
                    fontFamily: "var(--font-ui, system-ui)",
                    fontSize: "15px",
                    fontWeight: "600",
                    letterSpacing: "0.04em",
                    color: "#1A1510",
                    WebkitTapHighlightColor: "transparent",
                    transition: "background 0.2s ease",
                  }}
                >
                  {marking ? "Saving…" : `Mark ${bookDisplayName} Complete`}
                </button>
              )
            ) : (
              <button
                onClick={handleNextChapterPress}
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: "14px",
                  background: "transparent",
                  border: "1px solid rgba(196,169,107,0.28)",
                  cursor: "pointer",
                  fontFamily: "var(--font-ui, system-ui)",
                  fontSize: "14px",
                  fontWeight: "500",
                  letterSpacing: "0.06em",
                  color: CHRIST_COLOR,
                  WebkitTapHighlightColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background 0.15s ease",
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.background = "rgba(196,169,107,0.08)";
                  e.currentTarget.style.borderColor = "rgba(196,169,107,0.5)";
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(196,169,107,0.28)";
                }}
              >
                {bookDisplayName} {currentChapter + 1}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Observation Drawer */}
      <ObservationDrawer
        christObservations={christObservations}
        adversaryObservations={adversaryObservations}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={drawerOpen}
        onToggle={() => setDrawerOpen((o) => !o)}
        onClose={() => setDrawerOpen(false)}
        hasUnreadChrist={unreadChrist}
        hasUnreadAdversary={unreadAdversary}
      />

      {/* Christ in This Chapter */}
      {showSummaryCard && currentSummary && (
        <ChapterSummaryCard
          summaryText={currentSummary}
          bookDisplayName={bookDisplayName}
          currentChapter={currentChapter}
          isLastChapter={isLastChapter}
          isComplete={isComplete}
          marking={marking}
          onNextChapter={advanceChapter}
          onMarkComplete={doMarkComplete}
        />
      )}

      {/* Translation picker */}
      {showTranslationPicker && (
        <TranslationPicker
          current={localTranslation}
          onSelect={setLocalTranslation}
          onClose={() => setShowTranslationPicker(false)}
        />
      )}

      {/* Leave Journey */}
      {showLeaveModal && (
        <LeaveModal
          onConfirm={onLeaveJourney}
          onCancel={() => setShowLeaveModal(false)}
          lastBook={readingContext?.book || "Genesis"}
          lastChapter={readingContext?.chapter || 1}
        />
      )}
    </div>
  );
}
