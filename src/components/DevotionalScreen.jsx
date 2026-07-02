/**
 * DevotionalScreen.jsx — ABIDE Devotionals
 * Sacred, contemplative, formation-focused.
 * Flow: Reading → Scripture (live from translation) → Reflection → Quiet Abiding
 * Fully theme-aware — zero hardcoded colors.
 * Data fetched from /data/devotionals/{series}/{dayXX}.json
 */

import { useState, useEffect, useRef } from "react";
import DevotionalReader from "./DevotionalReader.jsx";
import AuthorPage from "./AuthorPage.jsx";

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

// ── Author metadata ───────────────────────────────────────────────────────────
const AUTHORS = {
  "Andrew Murray": {
    subtitle: "Minister · Devotional Writer",
    image: "Andrew Murray.png",
    description:
      "Scottish-born minister (1828–1917) whose writings on humility, prayer, and abiding in Christ have shaped generations of believers.",
    about:
      "Andrew Murray did not write about the spiritual life from the outside — he wrote from within it. Born in Scotland in 1828 and raised on the frontier of South Africa, he ministered for decades in conditions that demanded both tenacity and surrender. When illness silenced him for months at a time, he did not retreat from God — he went deeper. His writings emerged not from theological distance but from the discipline of a man who had chosen, again and again, to remain close. He believed that humility was not a virtue to be cultivated but a grace to be received. That prayer was not technique but communion. That abiding in Christ was not a spiritual ideal but the only life worth living. His words are not relics — they are invitations. Read them slowly.",
    quote:
      "Humility is the only soil in which virtue takes root; the only condition in which man can rightly know himself.",
  },
  "ABIDE": {
    subtitle: "Devotionals · Inspired by the Word",
    image: "abide_author.png",
    description:
      "A collection of devotionals written by those whose lives have been shaped by the Word of God.",
    about:
      "A compilation of those who are inspired by the Word of God — people marked by pursuit, surrender, and the daily discipline of abiding in Christ. These devotionals are not written from a distance. They come from lives shaped by Scripture, formed in prayer, and pointed toward one thing: knowing Jesus.",
  },
};

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
    groupAuthor: "Andrew Murray",
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
    author: "ABIDE",
    totalDays: 22,
    hasAudio: false,
    description:
      "A foundational journey through who God is as Father, Son, and Holy Spirit — and who you are in Christ. Walk through twenty-two days of Scripture-anchored teaching on the Trinity, the person and work of Jesus, the Holy Spirit, and your identity as a child of God.",
  },
  {
    id: "living-close-to-jesus",
    title: "Living Close to Jesus",
    subtitle: "A 5-Day Devotional",
    author: "ABIDE",
    totalDays: 5,
    hasAudio: false,
    description:
      "Five daily readings on the posture of abiding — withdrawal, rest, stillness, beholding, and intimacy. What it truly means to live close to Jesus.",
  },
  {
    id: "validated-by-god",
    title: "Validated by God Alone",
    subtitle: "A 7-Day Devotional",
    author: "ABIDE",
    totalDays: 7,
    hasAudio: false,
    description:
      "The approval of others is a counterfeit for what God alone can give. Seven days sitting with what it means to be chosen, loved, and validated by God — and what it costs when we seek that from people instead.",
  },
  {
    id: "lucifer-light-and-fall",
    title: "Lucifer — Light, Law, and the Fall",
    subtitle: "A 5-Day Devotional",
    author: "ABIDE",
    totalDays: 5,
    hasAudio: false,
    description:
      "Lucifer was not heaven's worship leader. Scripture reveals something more sobering — he was heaven's chief prosecutor, created to uphold divine justice. Five days uncovering who he was, how he fell, and what his story means for how we live.",
  },
  {
    id: "seven-spirits-of-god",
    title: "School of the Seven Spirits of God",
    subtitle: "A 10-Day Devotional",
    author: "ABIDE",
    totalDays: 10,
    hasAudio: false,
    description:
      "Isaiah 11:2 describes seven expressions of the Holy Spirit resting on the Messiah. Ten days studying each spirit individually — and how they work together in pairs — to understand how God moves, leads, empowers, and transforms.",
  },
  {
    id: "fear-of-god",
    title: "The Fear of God",
    subtitle: "A 10-Day Devotional",
    author: "ABIDE",
    totalDays: 10,
    hasAudio: false,
    description:
      "The fear of the Lord is the beginning of wisdom. Ten days sitting with what it truly means to fear God — not as terror, but as holy reverence that produces wisdom, obedience, worship, and intimacy with the One who is worthy.",
  },
  {
    id: "slow-to-anger",
    title: "Slow to Anger",
    subtitle: "A 7-Day Devotional",
    author: "ABIDE",
    totalDays: 7,
    hasAudio: false,
    description:
      "Human anger does not produce the righteousness of God. Seven days sitting with what James means — and what happens when we ignore him.",
  },
];

// ── Author groups (derived from SERIES_LIST, computed once) ──────────────────
const authorGroups = (() => {
  const map = new Map();
  SERIES_LIST.forEach((s) => {
    const key = s.groupAuthor ?? s.author;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  });
  return Array.from(map.entries()).map(([author, series]) => ({ author, series }));
})();

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
  const [activeAuthor, setActiveAuthor] = useState(null);
  const [activeAuthorHero, setActiveAuthorHero] = useState(null);
  const [seriesBackTarget, setSeriesBackTarget] = useState("author");
  const [scriptureResult, setScriptureResult] = useState(null);
  const [scripturesResults, setScripturesResults] = useState([]);
  const [loadingScripture, setLoadingScripture] = useState(false);
  const [dayTitleCache, setDayTitleCache] = useState({});
  const scrollRef = useRef(null);

  useEffect(() => {
    if (activeSeries) setCompletedDays(getCompletedDays(activeSeries.id));
  }, [activeSeries]);

  // Fetch all day titles for the active series when the series view opens.
  // Cached per series so switching back is instant. Day JSON is the single
  // source of truth — no hardcoded title arrays needed anywhere.
  useEffect(() => {
    if (view !== "series" || !activeSeries) return;
    const seriesId = activeSeries.id;
    if (dayTitleCache[seriesId]) return;
    Promise.all(
      Array.from({ length: activeSeries.totalDays }, (_, i) =>
        fetchDay(seriesId, i + 1)
          .then((d) => d.title || `Day ${i + 1}`)
          .catch(() => `Day ${i + 1}`)
      )
    ).then((titles) =>
      setDayTitleCache((prev) => ({ ...prev, [seriesId]: titles }))
    );
  }, [view, activeSeries?.id]);

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

  function openSeries(series, backTarget = "author") {
    setActiveSeries(series);
    setSeriesBackTarget(backTarget);
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
            <span style={{ fontSize: 13, color: "var(--text-accent)", opacity: 0.7 }}>‹</span>
            <span style={{ fontSize: 12, letterSpacing: "0.04em", color: "var(--text-accent)", opacity: 0.7, fontFamily: "var(--font-ui)" }}>Back</span>
          </button>
          <div style={{ marginTop: 16 }}>
            <div style={s.eyebrow}>✦ &nbsp;Devotionals</div>
            <h1 style={s.pageTitle}>Abide Deeply</h1>
            <p style={s.pageSub}>Not completion — transformation.</p>
          </div>
        </div>

        <div ref={scrollRef} className="dv-scroll" style={{ flex: 1, overflowY: "auto", padding: "20px 24px 48px" }}>
          {authorGroups.map((group) => {
            const totalDays = group.series.reduce((sum, s) => sum + s.totalDays, 0);
            const completedCount = group.series.reduce((sum, s) => sum + getCompletedDays(s.id).length, 0);
            const pct = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;
            const meta = AUTHORS[group.author];
            return (
              <button
                key={group.author}
                onClick={() => { setActiveAuthor(group.author); setActiveAuthorHero(group.author); setView("author-hero"); }}
                className="dv-card"
                style={s.seriesCard}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                  {meta?.image && (
                    <img
                      src={`${import.meta.env.BASE_URL ?? "/"}${encodeURIComponent(meta.image)}`}
                      alt={group.author}
                      style={{
                        width: 56, height: 56, borderRadius: "50%",
                        objectFit: "cover", flexShrink: 0,
                        border: "1px solid rgba(203,178,124,0.2)",
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.eyebrow}>
                      {group.series.length} {group.series.length === 1 ? "Devotional" : "Devotionals"} · {totalDays} Days
                    </div>
                    <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 20, fontWeight: 300, color: "var(--text-primary)", letterSpacing: "0.02em", margin: "4px 0 4px" }}>
                      {group.author}
                    </h2>
                    {meta?.subtitle && (
                      <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.06em", color: "rgba(203,178,124,0.5)" }}>
                        {meta.subtitle}
                      </div>
                    )}
                  </div>
                  <span style={{ color: "rgba(203,178,124,0.4)", fontSize: 18, flexShrink: 0 }}>›</span>
                </div>
                {meta?.description && (
                  <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 13, color: "var(--text-secondary)", opacity: 0.7, lineHeight: 1.6, margin: "0 0 14px" }}>
                    {meta.description}
                  </p>
                )}
                <div style={{ height: 2, background: "var(--border-subtle)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "var(--text-accent)", opacity: 0.5, borderRadius: 2, transition: "width 0.4s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.1em", color: "var(--text-accent)", opacity: 0.5 }}>
                    {completedCount} of {totalDays} days complete
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );

  /* ══════════════════════════════════════════════════
     AUTHOR — Series list for one author
  ══════════════════════════════════════════════════ */
  if (view === "author" && activeAuthor) {
    const group = authorGroups.find((g) => g.author === activeAuthor);
    const meta = AUTHORS[activeAuthor];
    return (
      <div style={s.screen}>
        <style>{dynamicCSS}</style>
        <div style={s.header}>
          <button onClick={() => setView("library")} style={s.backBtn}>
            <span style={{ fontSize: 13, color: "var(--text-accent)", opacity: 0.7 }}>‹</span>
            <span style={{ fontSize: 12, letterSpacing: "0.04em", color: "var(--text-accent)", opacity: 0.7, fontFamily: "var(--font-ui)" }}>Devotionals</span>
          </button>
          <div style={{ marginTop: 16 }}>
            <div style={s.eyebrow}>✦ &nbsp;Author</div>
            <h1 style={s.pageTitle}>{activeAuthor}</h1>
            <p style={s.pageSub}>{meta?.subtitle ?? `${group.series.length} devotional series`}</p>
          </div>
        </div>

        <div ref={scrollRef} className="dv-scroll" style={{ flex: 1, overflowY: "auto", padding: "20px 24px 48px" }}>
          {/* Author card — tap to open hero page */}
          {meta && (
            <button
              onClick={() => { setActiveAuthorHero(activeAuthor); setView("author-hero"); }}
              className="dv-card"
              style={{
                width: "100%", textAlign: "left", display: "flex",
                alignItems: "center", gap: 16,
                padding: "16px 18px", marginBottom: 24,
                borderRadius: 16,
                background: "rgba(203,178,124,0.04)",
                border: "1px solid rgba(203,178,124,0.12)",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {meta.image && (
                <img
                  src={`${import.meta.env.BASE_URL ?? "/"}${encodeURIComponent(meta.image)}`}
                  alt={activeAuthor}
                  style={{
                    width: 52, height: 52, borderRadius: "50%",
                    objectFit: "cover", flexShrink: 0,
                    border: "1px solid rgba(203,178,124,0.2)",
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "var(--font-ui)", fontSize: 16, fontWeight: 400,
                  color: "var(--text-primary)", marginBottom: 2,
                }}>
                  {activeAuthor}
                </div>
                <div style={{
                  fontFamily: "var(--font-ui)", fontSize: 11,
                  letterSpacing: "0.06em", color: "rgba(203,178,124,0.5)",
                }}>
                  {meta.subtitle}
                </div>
              </div>
              <span style={{ color: "rgba(203,178,124,0.4)", fontSize: 18, flexShrink: 0 }}>›</span>
            </button>
          )}
          {group.series.map((series) => {
            const done = getCompletedDays(series.id);
            const pct = Math.round((done.length / series.totalDays) * 100);
            return (
              <button key={series.id} onClick={() => openSeries(series)} className="dv-card" style={s.seriesCard}>
                <div style={{ marginBottom: 12 }}>
                  <div style={s.eyebrow}>{series.totalDays} Days{series.authorNote ? ` · ${series.authorNote}` : ""}</div>
                  <h2 style={{ fontFamily: "var(--font-ui)", fontSize: 20, fontWeight: 400, color: "var(--text-primary)", letterSpacing: "0.02em", margin: "6px 0 4px" }}>
                    {series.title}
                  </h2>
                  <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 13, color: "var(--text-secondary)", opacity: 0.7, lineHeight: 1.6, margin: 0 }}>
                    {series.subtitle}
                  </p>
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", opacity: 0.7, lineHeight: 1.7, margin: "0 0 16px" }}>
                  {series.description}
                </p>
                <div style={{ height: 2, background: "var(--border-subtle)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "var(--text-accent)", opacity: 0.5, borderRadius: 2, transition: "width 0.4s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.1em", color: "var(--text-accent)", opacity: 0.5 }}>
                    {done.length} of {series.totalDays} days complete
                  </span>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-accent)", opacity: 0.6 }}>Begin →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════
     AUTHOR HERO PAGE
  ══════════════════════════════════════════════════ */
  if (view === "author-hero" && activeAuthorHero) {
    const group = authorGroups.find((g) => g.author === activeAuthorHero);
    return (
      <AuthorPage
        author={activeAuthorHero}
        meta={AUTHORS[activeAuthorHero] ?? {}}
        series={group?.series ?? []}
        onOpenSeries={(s) => openSeries(s, "author-hero")}
        onBack={() => setView("library")}
      />
    );
  }

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
          <button onClick={() => setView(seriesBackTarget)} style={s.backBtn}>
            <span style={{ fontSize: 13, color: "var(--text-accent)", opacity: 0.7 }}>‹</span>
            <span style={{ fontSize: 12, letterSpacing: "0.04em", color: "var(--text-accent)", opacity: 0.7, fontFamily: "var(--font-ui)" }}>
              {activeAuthor ?? "Devotionals"}
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
                    {dayTitleCache[activeSeries.id]?.[dayNum - 1] ?? ""}
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
