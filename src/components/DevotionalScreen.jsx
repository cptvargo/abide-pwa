/**
 * DevotionalScreen.jsx — ABIDE Devotionals
 * Sacred, contemplative, formation-focused.
 * Flow: Reading → Scripture (live from translation) → Reflection → Quiet Abiding
 * Fully theme-aware — zero hardcoded colors.
 * Data fetched from /data/devotionals/{series}/{dayXX}.json
 */

import { useState, useEffect, useRef } from "react";
import DevotionalReader from "./DevotionalReader.jsx";

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
const TRANSLATION_PRIORITY_ADULT = ["asb", "asr", "wbt", "kjv"];
const TRANSLATION_PRIORITY_KIDS = ["akt", "kjv"];

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

function parseRef(ref) {
  const normalized = ref.replace(/[–—]/g, "-").trim();
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

async function fetchPassage(ref, priority = TRANSLATION_PRIORITY_ADULT) {
  const parsed = parseRef(ref);
  if (!parsed) return null;
  const { book, chapter, startVerse, endVerse } = parsed;
  for (const translation of priority) {
    try {
      const url = `/abide-pwa/data/translations/${translation}/${book}/${chapter}.json`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (!data.verses) continue;
      const lines = [];
      for (let v = startVerse; v <= endVerse; v++) {
        const verse = data.verses?.[String(v)];
        if (!verse) break;
        const text = typeof verse === "object" ? verse.text : verse;
        if (!text) break;
        lines.push(startVerse === endVerse ? text : `${v} ${text}`);
      }
      if (lines.length > 0)
        return {
          text: lines.join(" "),
          translation: translation.toUpperCase(),
        };
    } catch {
      continue;
    }
  }
  return null;
}

const SCROLLREADER_URL =
  "https://scrollreader.com/audiobook/humility-the-beauty-of-holiness/";

// ── Series metadata (no day content — that lives in JSON files) ───────────────
const SERIES_LIST = [
  {
    id: "beauty-of-holiness",
    title: "The Beauty of Holiness",
    subtitle: "A 12-Day Devotional on Humility",
    author: "Andrew Murray",
    totalDays: 12,
    hasAudio: true,
    description:
      "Humility is not weakness — it is the glory of the creature restored. Walk through twelve days with Andrew Murray as your guide, allowing Scripture and the Spirit to form in you the mind that was in Christ.",
  },
  {
    id: "from-the-inside-out",
    title: "From the Inside Out",
    subtitle: "A 14-Day Kids Devotional on Humility",
    author: "ABIDE",
    authorNote: "Based on the writings of Andrew Murray",
    totalDays: 14,
    hasAudio: false,
    description:
      "Based on Andrew Murray's classic work, these fourteen days invite kids into the simple, beautiful truth that humility is the heart of following Jesus.",
  },
  {
    id: "discipleship-guide",
    title: "Discipleship Guide",
    subtitle: "A 22-Day Foundational Devotional",
    author: "Gavin Todd",
    totalDays: 22,
    hasAudio: false,
    description:
      "A foundational journey through who God is as Father, Son, and Holy Spirit — and who you are in Christ. Walk through twenty-two days of Scripture-anchored teaching on the Trinity, the person and work of Jesus, the Holy Spirit, and your identity as a child of God.",
  },
];

// ── Fetch a single day JSON file ──────────────────────────────────────────────
async function fetchDay(seriesId, dayNum) {
  const padded = String(dayNum).padStart(2, "0");
  const res = await fetch(
    `/abide-pwa/data/devotionals/${seriesId}/day${padded}.json`,
  );
  if (!res.ok) throw new Error(`Failed to fetch day ${dayNum}`);
  return res.json();
}


export default function DevotionalScreen({ onBack, theme }) {
  const [view, setView] = useState("library");
  const [activeSeries, setActiveSeries] = useState(null);
  const [activeDay, setActiveDay] = useState(null);
  const [loadingDay, setLoadingDay] = useState(false);
  const [completedDays, setCompletedDays] = useState([]);
  const [justCompleted, setJustCompleted] = useState(false);
  const [scriptureResult, setScriptureResult] = useState(null);
  const [scripturesResults, setScripturesResults] = useState([]);
  const [loadingScripture, setLoadingScripture] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (activeSeries) setCompletedDays(getCompletedDays(activeSeries.id));
  }, [activeSeries]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [view]);

  // Fetch scripture as soon as a day is opened
  useEffect(() => {
    if (view === "day" && activeDay?.scripture && !scriptureResult) {
      setLoadingScripture(true);
      const priority =
        activeSeries?.id === "from-the-inside-out"
          ? TRANSLATION_PRIORITY_KIDS
          : TRANSLATION_PRIORITY_ADULT;
      if (activeDay.scriptures?.length > 0) {
        Promise.all(
          activeDay.scriptures.map((ref) => fetchPassage(ref, priority)),
        ).then((results) => {
          setScripturesResults(
            activeDay.scriptures.map((ref, i) => ({ ref, result: results[i] })),
          );
          setScriptureResult(results[0]);
          setLoadingScripture(false);
        });
      } else {
        fetchPassage(activeDay.scripture, priority).then((result) => {
          setScriptureResult(result);
          setLoadingScripture(false);
        });
      }
    }
  }, [view, activeDay]);

  function openSeries(series) {
    setActiveSeries(series);
    setView("series");
  }

  async function openDay(dayNum, series) {
    setLoadingDay(true);
    try {
      const day = await fetchDay(series.id, dayNum);
      setActiveDay(day);
      setJustCompleted(false);
      setScriptureResult(null);
      setScripturesResults([]);
      setView("day");
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDay(false);
    }
  }

  function handleComplete() {
    markComplete(activeSeries.id, activeDay.day);
    setCompletedDays(getCompletedDays(activeSeries.id));
    setJustCompleted(true);
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
    const dayNums = Array.from(
      { length: activeSeries.totalDays },
      (_, i) => i + 1,
    );
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
          {loadingDay && (
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
              Loading...
            </div>
          )}
          {dayNums.map((dayNum) => {
            const locked = isDayLocked(dayNum);
            const done = completedDays.includes(dayNum);
            return (
              <button
                key={dayNum}
                onClick={() =>
                  !locked && !loadingDay && openDay(dayNum, activeSeries)
                }
                disabled={locked || loadingDay}
                className={locked ? "" : "dv-card"}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "16px 18px",
                  marginBottom: 8,
                  borderRadius: 14,
                  background: done
                    ? "var(--accent-subtle-strong)"
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
                  {done ? "✓" : dayNum}
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
                    Day {dayNum}{" "}
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
                    {activeSeries.id === "beauty-of-holiness"
                      ? [
                          "The Glory of the Creature",
                          "The Secret of Redemption",
                          "Humility in the Life of Jesus",
                          "Humility in the Teaching of Jesus",
                          "Humility in the Disciples",
                          "Humility in Daily Life",
                          "Humility and Holiness",
                          "Humility and Sin",
                          "Humility and Faith",
                          "Humility and Death to Self",
                          "Humility and Happiness",
                          "The Beauty of Holiness",
                        ][dayNum - 1]
                      : activeSeries.id === "discipleship-guide"
                        ? [
                            "The Trinity — One God, Three Persons",
                            "God as Creator and Sustainer",
                            "God as Father",
                            "God's Love and Authority",
                            "God's Discipline",
                            "Jesus as the Son of God",
                            "Jesus as the Son of Man",
                            "The Deity of Christ",
                            "The Humanity of Christ",
                            "The Finished Work of Christ",
                            "The Personhood and Deity of the Holy Spirit",
                            "The Work of the Holy Spirit",
                            "The Indwelling of the Holy Spirit",
                            "The Baptism and Filling of the Holy Spirit",
                            "The Gifts of the Holy Spirit",
                            "The Seven-Fold Spirit of God",
                            "Born Again — A New Creation",
                            "Who You Are in Christ — Part 1",
                            "Who You Are in Christ — Part 2",
                            "What You Have in Christ",
                            "Walking in the Spirit-Filled Life",
                            "Praying in Tongues",
                          ][dayNum - 1]
                        : [
                            "The Two Sons",
                            "What God Sees in the Heart",
                            "Learning Through Obedience",
                            "Jesus Shows Us True Humility",
                            "The Grumbling Heart",
                            "Choosing What Is Right",
                            "A New Heart",
                            "Jesus Came to Serve",
                            "Learning to Be Last",
                            "The Quiet Work of God",
                            "Letting Go of Pride",
                            "The Beauty of Holiness",
                            "Walking Like Jesus",
                            "A Heart That Abides",
                          ][dayNum - 1]}
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
     DAY VIEW — delegated to DevotionalReader
  ══════════════════════════════════════════════════ */
  if (view === "day" && activeDay) {
    const day = activeDay;
    const isLastDay = day.day === activeSeries.totalDays;
    const alreadyDone = completedDays.includes(day.day);

    return (
      <DevotionalReader
        day={day}
        series={activeSeries}
        scriptureResult={scriptureResult}
        scripturesResults={scripturesResults}
        loadingScripture={loadingScripture}
        onBack={() => setView("series")}
        onComplete={handleComplete}
        alreadyDone={alreadyDone}
        justCompleted={justCompleted}
        isLastDay={isLastDay}
        onNextDay={() => openDay(day.day + 1, activeSeries)}
        onReturnToSeries={() => setView("series")}
      />
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
