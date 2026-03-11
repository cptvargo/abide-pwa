/**
 * DevotionalScreen.jsx — ABIDE Devotionals
 * Sacred, contemplative, formation-focused.
 * Flow: Friend's intro → Full Murray chapter → Scripture (live from translation) → Reflection → Prayer → Quiet Abiding
 * Fully theme-aware — zero hardcoded colors.
 */

import { useState, useEffect, useRef } from "react";
import { MURRAY_CHAPTERS, DAYS_DATA_BOH } from "./devotionalData";

// ── Progress helpers ──────────────────────────────────────────────────────────
const PROGRESS_KEY = "abide_devotional_progress";
function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveProgress(p) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {}
}
function getCompletedDays(seriesId) {
  return loadProgress()[seriesId]?.completed || [];
}
function markComplete(seriesId, day) {
  const p = loadProgress();
  if (!p[seriesId]) p[seriesId] = { completed: [] };
  if (!p[seriesId].completed.includes(day)) p[seriesId].completed.push(day);
  saveProgress(p);
}

// ── Translation priority (mirrors Seek) ──────────────────────────────────────
const TRANSLATION_PRIORITY = ["vsv", "akt", "asr", "kjv"];

const BOOK_NAME_TO_ID = {
  genesis: "genesis",
  exodus: "exodus",
  leviticus: "leviticus",
  numbers: "numbers",
  deuteronomy: "deuteronomy",
  joshua: "joshua",
  judges: "judges",
  ruth: "ruth",
  "1 samuel": "1samuel",
  "2 samuel": "2samuel",
  "1 kings": "1kings",
  "2 kings": "2kings",
  "1 chronicles": "1chronicles",
  "2 chronicles": "2chronicles",
  ezra: "ezra",
  nehemiah: "nehemiah",
  esther: "esther",
  job: "job",
  psalm: "psalms",
  psalms: "psalms",
  proverbs: "proverbs",
  ecclesiastes: "ecclesiastes",
  "song of solomon": "songofsolomon",
  "song of songs": "songofsolomon",
  isaiah: "isaiah",
  jeremiah: "jeremiah",
  lamentations: "lamentations",
  ezekiel: "ezekiel",
  daniel: "daniel",
  hosea: "hosea",
  joel: "joel",
  amos: "amos",
  obadiah: "obadiah",
  jonah: "jonah",
  micah: "micah",
  nahum: "nahum",
  habakkuk: "habakkuk",
  zephaniah: "zephaniah",
  haggai: "haggai",
  zechariah: "zechariah",
  malachi: "malachi",
  matthew: "matthew",
  mark: "mark",
  luke: "luke",
  john: "john",
  acts: "acts",
  romans: "romans",
  "1 corinthians": "1corinthians",
  "2 corinthians": "2corinthians",
  galatians: "galatians",
  ephesians: "ephesians",
  philippians: "philippians",
  colossians: "colossians",
  "1 thessalonians": "1thessalonians",
  "2 thessalonians": "2thessalonians",
  "1 timothy": "1timothy",
  "2 timothy": "2timothy",
  titus: "titus",
  philemon: "philemon",
  hebrews: "hebrews",
  james: "james",
  "1 peter": "1peter",
  "2 peter": "2peter",
  "1 john": "1john",
  "2 john": "2john",
  "3 john": "3john",
  jude: "jude",
  revelation: "revelation",
};

// ── Parse a ref like "Philippians 2:5–8" or "John 5:19" ─────────────────────
// Returns { book, chapter, startVerse, endVerse } or null
function parseRef(ref) {
  // Normalize em-dash / en-dash to hyphen
  const normalized = ref.replace(/[–—]/g, "-").trim();
  // Range: "Book Chapter:Start-End"
  const rangeMatch = normalized.match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/);
  if (rangeMatch) {
    const bookId = BOOK_NAME_TO_ID[rangeMatch[1].toLowerCase().trim()];
    if (!bookId) return null;
    return {
      book: bookId,
      chapter: rangeMatch[2],
      startVerse: parseInt(rangeMatch[3]),
      endVerse: parseInt(rangeMatch[4]),
    };
  }
  // Single: "Book Chapter:Verse"
  const singleMatch = normalized.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (singleMatch) {
    const bookId = BOOK_NAME_TO_ID[singleMatch[1].toLowerCase().trim()];
    if (!bookId) return null;
    return {
      book: bookId,
      chapter: singleMatch[2],
      startVerse: parseInt(singleMatch[3]),
      endVerse: parseInt(singleMatch[3]),
    };
  }
  return null;
}

// ── Fetch a passage (single verse or range) from translation files ────────────
async function fetchPassage(ref) {
  const parsed = parseRef(ref);
  if (!parsed) return null;
  const { book, chapter, startVerse, endVerse } = parsed;

  for (const translation of TRANSLATION_PRIORITY) {
    try {
      const url = `/abide-pwa/data/translations/${translation}/${book}/${chapter}.json`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (!data.verses) continue;

      const lines = [];
      for (let v = startVerse; v <= endVerse; v++) {
        const text = data.verses?.[String(v)];
        if (!text) break;
        // Include verse number only for multi-verse ranges
        lines.push(startVerse === endVerse ? text : `${v} ${text}`);
      }
      if (lines.length > 0) {
        return {
          text: lines.join(" "),
          translation: translation.toUpperCase(),
        };
      }
    } catch {
      continue;
    }
  }
  return null;
}

// ── Fetch all scripture refs for a day ───────────────────────────────────────
async function fetchDayScriptures(scriptures) {
  return Promise.all(
    scriptures.map(async (ref) => {
      const result = await fetchPassage(ref);
      return {
        ref,
        text: result?.text || null,
        translation: result?.translation || null,
      };
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const SERIES_LIST = [
  {
    id: "beauty-of-holiness",
    title: "The Beauty of Holiness",
    subtitle: "A 12-Day Devotional on Humility",
    author: "Andrew Murray",
    totalDays: 12,
    description:
      "Humility is not weakness — it is the glory of the creature restored. Walk through twelve days with Andrew Murray as your guide, allowing Scripture and the Spirit to form in you the mind that was in Christ.",
  },
];

const SERIES_DATA = {
  "beauty-of-holiness": { days: DAYS_DATA_BOH, chapters: MURRAY_CHAPTERS },
};

export default function DevotionalScreen({ onBack, theme }) {
  const [view, setView] = useState("library");
  const [activeSeries, setActiveSeries] = useState(null);
  const [activeDay, setActiveDay] = useState(null);
  const [murrayText, setMurrayText] = useState("");
  const [section, setSection] = useState("intro");
  const [completedDays, setCompletedDays] = useState([]);
  const [justCompleted, setJustCompleted] = useState(false);
  const [dayScriptures, setDayScriptures] = useState([]); // [{ref, text, translation}]
  const [loadingScripture, setLoadingScripture] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (activeSeries) setCompletedDays(getCompletedDays(activeSeries.id));
  }, [activeSeries]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [view, section]);

  // Load scripture text when entering scripture section
  useEffect(() => {
    if (section === "scripture" && activeDay && dayScriptures.length === 0) {
      setLoadingScripture(true);
      fetchDayScriptures(activeDay.scriptures).then((results) => {
        setDayScriptures(results);
        setLoadingScripture(false);
      });
    }
  }, [section, activeDay]);

  function openSeries(series) {
    setActiveSeries(series);
    setView("series");
  }

  function openDay(day, seriesId) {
    const data = SERIES_DATA[seriesId];
    setActiveDay(day);
    setMurrayText(data.chapters[day.day - 1] || "");
    setSection("intro");
    setJustCompleted(false);
    setDayScriptures([]); // reset so they reload fresh
    setView("day");
  }

  function handleComplete() {
    markComplete(activeSeries.id, activeDay.day);
    setCompletedDays(getCompletedDays(activeSeries.id));
    setJustCompleted(true);
    setSection("abiding");
  }

  function isDayLocked(dayNum) {
    if (dayNum === 1) return false;
    return !completedDays.includes(dayNum - 1);
  }

  /* ══════════════════════════════════════════════════
     LIBRARY
  ══════════════════════════════════════════════════ */
  if (view === "library")
    return (
      <div style={s.screen}>
        <style>{dynamicCSS}</style>
        <div style={s.header}>
          <button onClick={onBack} style={s.backBtn}>
            <span
              style={{
                fontSize: 13,
                color: "var(--text-accent)",
                opacity: 0.7,
              }}
            >
              ‹
            </span>
            <span
              style={{
                fontSize: 12,
                letterSpacing: "0.04em",
                color: "var(--text-accent)",
                opacity: 0.7,
                fontFamily: "var(--font-ui)",
              }}
            >
              Back
            </span>
          </button>
          <div style={{ marginTop: 16 }}>
            <div style={s.eyebrow}>✦ &nbsp;Devotionals</div>
            <h1 style={s.pageTitle}>Abide Deeply</h1>
            <p style={s.pageSub}>Not completion — transformation.</p>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="dv-scroll"
          style={{ flex: 1, overflowY: "auto", padding: "20px 24px 48px" }}
        >
          {SERIES_LIST.map((series) => {
            const done = getCompletedDays(series.id);
            const pct = Math.round((done.length / series.totalDays) * 100);
            return (
              <button
                key={series.id}
                onClick={() => openSeries(series)}
                className="dv-card"
                style={s.seriesCard}
              >
                <div style={{ marginBottom: 12 }}>
                  <div style={s.eyebrow}>
                    {series.totalDays} Days · {series.author}
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 20,
                      fontWeight: 400,
                      color: "var(--text-primary)",
                      letterSpacing: "0.02em",
                      margin: "6px 0 4px",
                    }}
                  >
                    {series.title}
                  </h2>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontStyle: "italic",
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      opacity: 0.7,
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {series.subtitle}
                  </p>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    opacity: 0.7,
                    lineHeight: 1.7,
                    margin: "0 0 16px",
                  }}
                >
                  {series.description}
                </p>
                <div
                  style={{
                    height: 2,
                    background: "var(--border-subtle)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: "var(--text-accent)",
                      opacity: 0.5,
                      borderRadius: 2,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      color: "var(--text-accent)",
                      opacity: 0.5,
                    }}
                  >
                    {done.length} of {series.totalDays} days complete
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 10,
                      color: "var(--text-accent)",
                      opacity: 0.6,
                    }}
                  >
                    Begin →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );

  /* ══════════════════════════════════════════════════
     SERIES — Day list
  ══════════════════════════════════════════════════ */
  if (view === "series") {
    const days = SERIES_DATA[activeSeries.id].days;
    return (
      <div style={s.screen}>
        <style>{dynamicCSS}</style>
        <div style={s.header}>
          <button onClick={() => setView("library")} style={s.backBtn}>
            <span
              style={{
                fontSize: 13,
                color: "var(--text-accent)",
                opacity: 0.7,
              }}
            >
              ‹
            </span>
            <span
              style={{
                fontSize: 12,
                letterSpacing: "0.04em",
                color: "var(--text-accent)",
                opacity: 0.7,
                fontFamily: "var(--font-ui)",
              }}
            >
              Devotionals
            </span>
          </button>
          <div style={{ marginTop: 16 }}>
            <div style={s.eyebrow}>{activeSeries.author}</div>
            <h1 style={s.pageTitle}>{activeSeries.title}</h1>
            <p style={s.pageSub}>{activeSeries.subtitle}</p>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="dv-scroll"
          style={{ flex: 1, overflowY: "auto", padding: "16px 24px 48px" }}
        >
          {days.map((day) => {
            const locked = isDayLocked(day.day);
            const done = completedDays.includes(day.day);
            return (
              <button
                key={day.day}
                onClick={() => !locked && openDay(day, activeSeries.id)}
                disabled={locked}
                className={locked ? "" : "dv-card"}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "16px 18px",
                  marginBottom: 8,
                  borderRadius: 14,
                  background: done
                    ? "var(--accent-subtle-strong)"
                    : locked
                      ? "var(--accent-subtle)"
                      : "var(--accent-subtle)",
                  border: `1px solid ${done ? "var(--accent-border-strong)" : "var(--border-subtle)"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: locked ? "default" : "pointer",
                  opacity: locked ? 0.45 : 1,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: done
                      ? "var(--accent-subtle-strong)"
                      : "var(--accent-subtle)",
                    border: `1px solid ${done ? "var(--accent-border-strong)" : "var(--border-subtle)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-ui)",
                    fontSize: done ? 14 : 13,
                    color: done
                      ? "var(--text-accent)"
                      : "var(--text-secondary)",
                  }}
                >
                  {done ? "✓" : day.day}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      color: "var(--text-accent)",
                      opacity: 0.5,
                      marginBottom: 3,
                    }}
                  >
                    Day {day.day}{" "}
                    {locked ? "· Locked" : done ? "· Complete" : ""}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 15,
                      fontWeight: 400,
                      color: "var(--text-primary)",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {day.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontStyle: "italic",
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      opacity: 0.6,
                      marginTop: 2,
                    }}
                  >
                    {day.scriptures[0]}
                  </div>
                </div>
                {!locked && (
                  <span
                    style={{
                      color: "var(--text-accent)",
                      opacity: 0.4,
                      fontSize: 13,
                    }}
                  >
                    ›
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════
     DAY VIEW
  ══════════════════════════════════════════════════ */
  if (view === "day" && activeDay) {
    const day = activeDay;
    const isLastDay = day.day === activeSeries.totalDays;
    const alreadyDone = completedDays.includes(day.day);

    const tabs = [
      { id: "intro", label: "Intro" },
      { id: "reading", label: "Reading" },
      { id: "scripture", label: "Scripture" },
      { id: "reflection", label: "Reflection" },
      { id: "prayer", label: "Prayer" },
      { id: "abiding", label: "Abide" },
    ];

    return (
      <div style={s.screen}>
        <style>{dynamicCSS}</style>

        {/* Sticky header + tabs */}
        <div style={{ ...s.header, paddingBottom: 0 }}>
          <button onClick={() => setView("series")} style={s.backBtn}>
            <span
              style={{
                fontSize: 13,
                color: "var(--text-accent)",
                opacity: 0.7,
              }}
            >
              ‹
            </span>
            <span
              style={{
                fontSize: 12,
                letterSpacing: "0.04em",
                color: "var(--text-accent)",
                opacity: 0.7,
                fontFamily: "var(--font-ui)",
              }}
            >
              {activeSeries.title}
            </span>
          </button>
          <div style={{ marginTop: 12, marginBottom: 16 }}>
            <div style={s.eyebrow}>Day {day.day} · Andrew Murray</div>
            <h1 style={{ ...s.pageTitle, fontSize: 22 }}>{day.title}</h1>
          </div>
          <div
            className="dv-scroll"
            style={{
              display: "flex",
              borderBottom: "1px solid var(--border-subtle)",
              marginLeft: -24,
              marginRight: -24,
              paddingLeft: 24,
              overflowX: "auto",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSection(tab.id)}
                style={{
                  padding: "10px 14px",
                  background: "transparent",
                  border: "none",
                  borderBottom: `2px solid ${section === tab.id ? "var(--text-accent)" : "transparent"}`,
                  fontFamily: "var(--font-ui)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color:
                    section === tab.id
                      ? "var(--text-accent)"
                      : "var(--text-secondary)",
                  opacity: section === tab.id ? 1 : 0.5,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  marginBottom: -1,
                  transition: "color 0.18s, border-color 0.18s, opacity 0.18s",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section content */}
        <div
          ref={scrollRef}
          className="dv-scroll"
          style={{ flex: 1, overflowY: "auto", padding: "28px 24px 60px" }}
        >
          {/* ── INTRO ── */}
          {section === "intro" && (
            <div>
              <div style={s.sectionLabel}>Before You Read</div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  marginBottom: 24,
                }}
              >
                Before opening Murray's chapter, let this reflection prepare
                your heart.
              </p>
              {day.meditation.split("\n\n").map((para, i) => (
                <p key={i} style={s.prose}>
                  {para}
                </p>
              ))}
              <div style={{ marginTop: 36 }}>
                <button
                  onClick={() => setSection("reading")}
                  style={s.continueBtn}
                >
                  Open Murray's Chapter →
                </button>
              </div>
            </div>
          )}

          {/* ── READING ── */}
          {section === "reading" && (
            <div>
              <div style={s.sectionLabel}>Chapter Reading</div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  marginBottom: 24,
                  background: "var(--accent-subtle)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 20,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 9,
                    letterSpacing: "0.14em",
                    color: "var(--text-accent)",
                    opacity: 0.7,
                  }}
                >
                  ANDREW MURRAY · PUBLIC DOMAIN
                </span>
              </div>
              {murrayText.split("\n\n").map((para, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: i === 0 ? 17 : 15,
                    fontWeight: i === 0 ? 600 : 400,
                    lineHeight: 1.95,
                    color: "var(--text-primary)",
                    opacity: i === 0 ? 0.95 : 0.82,
                    marginBottom: i === 0 ? 28 : 18,
                  }}
                >
                  {para}
                </p>
              ))}
              <div style={{ marginTop: 36 }}>
                <button
                  onClick={() => setSection("scripture")}
                  style={s.continueBtn}
                >
                  Continue to Scripture →
                </button>
              </div>
            </div>
          )}

          {/* ── SCRIPTURE ── */}
          {section === "scripture" && (
            <div>
              <div style={s.sectionLabel}>Scripture Meditation</div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  marginBottom: 24,
                }}
              >
                Let these passages anchor what Murray has opened. Read slowly.
                More than once if needed.
              </p>

              {loadingScripture ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: "var(--text-accent)",
                    opacity: 0.4,
                    fontFamily: "var(--font-ui)",
                    fontSize: 11,
                    letterSpacing: "0.12em",
                  }}
                >
                  Loading scripture...
                </div>
              ) : (
                dayScriptures.map(({ ref, text, translation }, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: 16,
                      borderRadius: 14,
                      background: "var(--accent-subtle)",
                      border: "1px solid var(--border-subtle)",
                      borderLeft: "3px solid var(--text-accent)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Reference + translation badge */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px 8px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-ui)",
                          fontSize: 10,
                          letterSpacing: "0.12em",
                          color: "var(--text-accent)",
                          opacity: 0.8,
                        }}
                      >
                        {ref}
                      </span>
                      {translation && (
                        <span
                          style={{
                            fontFamily: "var(--font-ui)",
                            fontSize: 9,
                            letterSpacing: "0.1em",
                            color: "var(--text-accent)",
                            opacity: 0.5,
                            background: "var(--accent-subtle-strong)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: 4,
                            padding: "2px 6px",
                          }}
                        >
                          {translation}
                        </span>
                      )}
                    </div>

                    {/* Verse text */}
                    {text ? (
                      <div style={{ padding: "0 16px 16px" }}>
                        <div
                          style={{
                            borderLeft: "2px solid var(--text-accent)",
                            paddingLeft: 12,
                            opacity: 0.9,
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "var(--font-body)",
                              fontStyle: "italic",
                              fontSize: 15,
                              lineHeight: 1.85,
                              color: "var(--text-accent)",
                              margin: 0,
                            }}
                          >
                            "{text}"
                          </p>
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-ui)",
                            fontSize: 10,
                            letterSpacing: "0.08em",
                            color: "var(--text-secondary)",
                            opacity: 0.5,
                            marginTop: 8,
                          }}
                        >
                          — {translation}
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: "0 16px 16px",
                          fontFamily: "var(--font-body)",
                          fontStyle: "italic",
                          fontSize: 13,
                          color: "var(--text-secondary)",
                          opacity: 0.4,
                        }}
                      >
                        Open in your Bible and read slowly.
                      </div>
                    )}
                  </div>
                ))
              )}

              <div style={{ marginTop: 32 }}>
                <button
                  onClick={() => setSection("reflection")}
                  style={s.continueBtn}
                >
                  Continue to Reflection →
                </button>
              </div>
            </div>
          )}

          {/* ── REFLECTION ── */}
          {section === "reflection" && (
            <div>
              <div style={s.sectionLabel}>Heart Reflection</div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  marginBottom: 28,
                }}
              >
                Do not rush. Let each question sit with you before the Lord.
              </p>
              {day.reflection.map((q, i) => (
                <div
                  key={i}
                  style={{
                    padding: "18px 20px",
                    marginBottom: 12,
                    background: "var(--accent-subtle)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      color: "var(--text-accent)",
                      opacity: 0.4,
                      marginBottom: 8,
                    }}
                  >
                    {i + 1} of {day.reflection.length}
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 15,
                      lineHeight: 1.75,
                      color: "var(--text-primary)",
                      opacity: 0.88,
                      margin: 0,
                    }}
                  >
                    {q}
                  </p>
                </div>
              ))}
              <div style={{ marginTop: 32 }}>
                <button
                  onClick={() => setSection("prayer")}
                  style={s.continueBtn}
                >
                  Continue to Prayer →
                </button>
              </div>
            </div>
          )}

          {/* ── PRAYER ── */}
          {section === "prayer" && (
            <div>
              <div style={s.sectionLabel}>Prayer</div>
              <div
                style={{
                  padding: "20px",
                  marginBottom: 20,
                  background: "var(--accent-subtle)",
                  border: "1px solid var(--border-subtle)",
                  borderLeft: "3px solid var(--text-accent)",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 9,
                    letterSpacing: "0.16em",
                    color: "var(--text-accent)",
                    opacity: 0.5,
                    marginBottom: 10,
                    textTransform: "uppercase",
                  }}
                >
                  A Prayer for Today
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontStyle: "italic",
                    fontSize: 15,
                    lineHeight: 1.85,
                    color: "var(--text-primary)",
                    opacity: 0.88,
                    margin: 0,
                  }}
                >
                  {day.prayer}
                </p>
              </div>
              <div
                style={{
                  padding: "16px 18px",
                  marginBottom: 32,
                  background: "var(--accent-subtle)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 12,
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontStyle: "italic",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    opacity: 0.7,
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  {day.prayerInvitation}
                </p>
              </div>
              {!alreadyDone ? (
                <button
                  onClick={handleComplete}
                  style={{
                    ...s.continueBtn,
                    background: "var(--accent-subtle-strong)",
                    border: "1px solid var(--accent-border-strong)",
                    color: "var(--text-accent)",
                  }}
                >
                  I have prayed — Mark Day {day.day} Complete
                </button>
              ) : (
                <button
                  onClick={() => setSection("abiding")}
                  style={s.continueBtn}
                >
                  Continue to Quiet Abiding →
                </button>
              )}
            </div>
          )}

          {/* ── QUIET ABIDING ── */}
          {section === "abiding" && (
            <div style={{ textAlign: "center", paddingTop: 20 }}>
              <div style={s.sectionLabel}>Quiet Abiding</div>
              {justCompleted && (
                <div
                  style={{
                    padding: "10px 16px",
                    marginBottom: 32,
                    background: "var(--accent-subtle)",
                    border: "1px solid var(--accent-border-strong)",
                    borderRadius: 20,
                    display: "inline-block",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      color: "var(--text-accent)",
                      opacity: 0.8,
                    }}
                  >
                    ✓ &nbsp;Day {day.day} Complete
                  </span>
                </div>
              )}
              <div
                style={{
                  width: 1,
                  height: 48,
                  background:
                    "linear-gradient(to bottom, transparent, var(--text-accent))",
                  opacity: 0.3,
                  margin: "0 auto 32px",
                }}
              />
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontStyle: "italic",
                  fontSize: 17,
                  lineHeight: 1.9,
                  color: "var(--text-primary)",
                  opacity: 0.75,
                  maxWidth: 320,
                  margin: "0 auto 40px",
                }}
              >
                "{day.quietAbiding}"
              </p>
              <div
                style={{
                  width: 1,
                  height: 48,
                  background:
                    "linear-gradient(to top, transparent, var(--text-accent))",
                  opacity: 0.3,
                  margin: "0 auto 40px",
                }}
              />
              <div
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  color: "var(--text-secondary)",
                  opacity: 0.4,
                  marginBottom: 40,
                }}
              >
                BE STILL AND KNOW
              </div>

              {!isLastDay && completedDays.includes(day.day) && (
                <button
                  onClick={() =>
                    openDay(
                      SERIES_DATA[activeSeries.id].days[day.day],
                      activeSeries.id,
                    )
                  }
                  style={s.continueBtn}
                >
                  Continue to Day {day.day + 1} →
                </button>
              )}
              {isLastDay && completedDays.includes(day.day) && (
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontStyle: "italic",
                      fontSize: 14,
                      color: "var(--text-secondary)",
                      opacity: 0.6,
                      lineHeight: 1.7,
                      marginBottom: 24,
                    }}
                  >
                    You have walked through all twelve days. This is not an
                    ending — it is a beginning. Keep beholding Him.
                  </p>
                  <button
                    onClick={() => setView("series")}
                    style={s.continueBtn}
                  >
                    Return to Series
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

/* ── Shared style objects — all CSS variables, zero hardcoded colors ─────── */
const s = {
  screen: {
    position: "fixed",
    inset: 0,
    background: "var(--bg-app)",
    display: "flex",
    flexDirection: "column",
    zIndex: 40,
    paddingTop: "env(safe-area-inset-top)",
  },
  header: {
    padding: "20px 24px 0",
    borderBottom: "1px solid var(--border-subtle)",
    flexShrink: 0,
    background: "var(--bg-app)",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "var(--accent-subtle)",
    border: "1px solid var(--border-subtle)",
    borderRadius: 100,
    padding: "6px 14px 6px 10px",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
  eyebrow: {
    fontFamily: "var(--font-ui, system-ui)",
    fontSize: 10,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--text-accent)",
    opacity: 0.6,
    marginBottom: 6,
  },
  pageTitle: {
    fontFamily: "var(--font-ui, system-ui)",
    fontSize: 26,
    fontWeight: 300,
    letterSpacing: "0.02em",
    color: "var(--text-primary)",
    lineHeight: 1.2,
    margin: 0,
  },
  pageSub: {
    fontFamily: "var(--font-body, Georgia, serif)",
    fontStyle: "italic",
    fontSize: 13,
    color: "var(--text-secondary)",
    marginTop: 6,
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: "var(--font-ui, system-ui)",
    fontSize: 9,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "var(--text-accent)",
    opacity: 0.5,
    marginBottom: 18,
  },
  seriesCard: {
    width: "100%",
    textAlign: "left",
    padding: "20px",
    marginBottom: 16,
    borderRadius: 16,
    background: "var(--accent-subtle)",
    border: "1px solid var(--border-subtle)",
    cursor: "pointer",
  },
  continueBtn: {
    width: "100%",
    padding: "14px 20px",
    textAlign: "center",
    background: "var(--accent-subtle)",
    border: "1px solid var(--border-subtle)",
    borderRadius: 12,
    fontFamily: "var(--font-ui, system-ui)",
    fontSize: 12,
    letterSpacing: "0.06em",
    color: "var(--text-accent)",
    opacity: 0.85,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
  prose: {
    fontFamily: "var(--font-body, Georgia, serif)",
    fontSize: 16,
    lineHeight: 1.9,
    color: "var(--text-primary)",
    opacity: 0.88,
    marginBottom: 20,
  },
};

const dynamicCSS = `
  .dv-scroll::-webkit-scrollbar { display: none }
  .dv-scroll { -ms-overflow-style: none; scrollbar-width: none }
  .dv-card { transition: background 0.15s ease, border-color 0.15s ease; }
  .dv-card:hover { opacity: 0.85; }
  .dv-card:active { transform: scale(0.99); }
`;
