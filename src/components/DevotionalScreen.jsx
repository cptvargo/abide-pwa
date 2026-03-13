/**
 * DevotionalScreen.jsx — ABIDE Devotionals
 * Sacred, contemplative, formation-focused.
 * Flow: Reading → Scripture (live from translation) → Reflection → Quiet Abiding
 * Fully theme-aware — zero hardcoded colors.
 * Data fetched from /data/devotionals/{series}/{dayXX}.json
 */

import { useState, useEffect, useRef } from "react";

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

// ── Parse a ref like "Philippians 2:5–8" or "John 5:19" ─────────────────────
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

// ── Fetch a passage from translation files ────────────────────────────────────
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
        const text = data.verses?.[String(v)];
        if (!text) break;
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

// ── ScrollReader URL ──────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────

// ── ReflectionIcon — sacred SVG icons for kids reflection choices ─────────────
function ReflectionIcon({ icon, active }) {
  const color = active ? "var(--text-accent)" : "var(--text-secondary)";
  const icons = {
    // Day 1
    broken_promise: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M4 15 C6 12 9 11 12 11 L14 11 C17 11 20 12 22 15"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M13 11 L11.5 8 L13.5 6 L12 3"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 15 L4 19 Q13 22 22 19 L22 15"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    changed_mind: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M7 19 L7 10 Q7 5 13 5 L17 5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 2 L17 5 L14 8"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 19 L10 16 M7 19 L4 16"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    found_out: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <ellipse
          cx="13"
          cy="13"
          rx="7"
          ry="4.5"
          stroke={color}
          strokeWidth="1.5"
        />
        <circle cx="13" cy="13" r="2" fill={color} />
        <path
          d="M13 5 L13 3"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M13 21 L13 23"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M5.5 7.5 L4 6"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M20.5 18.5 L22 20"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 13 L5 13"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M21 13 L23 13"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    // Day 2
    mask: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M4 10 Q4 6 13 6 Q22 6 22 10 L22 14 Q22 20 13 20 Q4 20 4 14 Z"
          stroke={color}
          strokeWidth="1.5"
        />
        <path
          d="M9 12 Q10 11 11 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M15 12 Q16 11 17 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M9 16 Q13 19 17 16"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    hide: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="10" r="4" stroke={color} strokeWidth="1.5" />
        <path
          d="M5 20 Q5 15 13 15 Q21 15 21 20"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M18 5 L22 3 M18 7 L23 7"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    heart_search: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M13 20 L5 13 Q2 9 6 6 Q9 4 13 8 Q17 4 20 6 Q24 9 21 13 Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="13" cy="13" r="2.5" stroke={color} strokeWidth="1.2" />
      </svg>
    ),
    // Day 3
    ear_closed: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M8 10 Q8 5 13 5 Q18 5 18 10 Q18 14 15 16 L15 19 Q15 21 13 21 Q11 21 11 19 L11 16"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 13 Q12 14 13 13"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 3 L23 23"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    argue: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M3 6 Q3 4 5 4 L14 4 Q16 4 16 6 L16 11 Q16 13 14 13 L10 13 L7 16 L7 13 L5 13 Q3 13 3 11 Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M10 19 Q10 17 12 17 L21 17 Q23 17 23 19 L23 22 Q23 24 21 24 L19 24 L19 26 L16 24 L12 24 Q10 24 10 22 Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    slow: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="9" stroke={color} strokeWidth="1.5" />
        <path
          d="M13 7 L13 13 L17 16"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 5 L22 3"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    // Day 4
    own_way: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M13 3 L13 17"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M10 6 L13 3 L16 6"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 21 Q6 18 9 17 L13 17 L17 17 Q20 18 20 21"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    hard_path: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M4 20 L8 14 L12 17 L16 10 L20 13 L24 7"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="7" r="2" fill={color} />
      </svg>
    ),
    trust: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M13 3 L15 8 L21 8 L16 12 L18 18 L13 14 L8 18 L10 12 L5 8 L11 8 Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    // Day 5
    grumble: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="11" r="7" stroke={color} strokeWidth="1.5" />
        <path
          d="M10 13 Q13 11 16 13"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M10 9 L10 9"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 9 L16 9"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M13 18 L11 23 M13 18 L15 23"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 6 L5 4 M23 6 L21 4"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    quiet_rebel: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="11" r="7" stroke={color} strokeWidth="1.5" />
        <path
          d="M10 13 Q13 15 16 13"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M10 9 L10 9"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 9 L16 9"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 3 Q13 0 18 3"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 2"
        />
      </svg>
    ),
    grateful: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="11" r="7" stroke={color} strokeWidth="1.5" />
        <path
          d="M9 11 L12 14 L17 8"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13 18 L13 22"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M9 22 L17 22"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    // Day 6
    decide_early: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="9" stroke={color} strokeWidth="1.5" />
        <path
          d="M13 7 L13 13 L16 10"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 20 L10 17"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    peer: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="8" cy="8" r="3" stroke={color} strokeWidth="1.5" />
        <circle cx="18" cy="8" r="3" stroke={color} strokeWidth="1.5" />
        <path
          d="M3 19 Q3 15 8 15 Q13 15 13 19"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M13 19 Q13 15 18 15 Q23 15 23 19"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M11 12 L15 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 2"
        />
      </svg>
    ),
    alone: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="8" r="4" stroke={color} strokeWidth="1.5" />
        <path
          d="M6 22 Q6 17 13 17 Q20 17 20 22"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M20 4 L22 3 M20 7 L23 7 M20 10 L22 11"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    // Day 7
    try_harder: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M13 4 Q19 4 21 9 Q23 14 19 18 Q15 22 9 20 Q4 18 4 13 Q4 8 8 6"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M10 3 L13 4 L10 7"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13 10 L13 14 L16 14"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    ask_help: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M5 13 L13 5 L21 13 L18 13 L18 21 L8 21 L8 13 Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M10 17 L10 13 L13 13 L13 17"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M21 3 L25 3 M23 1 L23 5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    small_change: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M4 18 Q7 10 13 8 Q19 6 22 10"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M19 7 L22 10 L19 13"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="13" cy="8" r="2" fill={color} />
      </svg>
    ),
    // Day 8
    help_others: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M13 4 Q17 4 19 7 L22 12 L19 12 Q19 17 13 19 Q7 17 7 12 L4 12 L7 7 Q9 4 13 4 Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M10 12 L12 14 L16 10"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    let_go: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M13 5 L16 8 L13 11 M16 8 L8 8 Q5 8 5 12 L5 16 Q5 20 9 20 L17 20 Q21 20 21 16 L21 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    serve_quietly: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M5 15 Q5 11 9 11 L17 11 Q21 11 21 15"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 15 L23 15"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M13 5 Q16 5 17 8 Q18 11 13 11 Q8 11 9 8 Q10 5 13 5 Z"
          stroke={color}
          strokeWidth="1.5"
        />
        <path
          d="M8 19 L8 22 M18 19 L18 22"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    // Day 9
    want_noticed: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="10" r="5" stroke={color} strokeWidth="1.5" />
        <path
          d="M13 3 L13 1 M13 19 L13 21 M5 10 L3 10 M21 10 L23 10 M7 4 L5.5 2.5 M19 4 L20.5 2.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    compare: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect
          x="3"
          y="14"
          width="8"
          height="9"
          rx="1"
          stroke={color}
          strokeWidth="1.5"
        />
        <rect
          x="15"
          y="8"
          width="8"
          height="15"
          rx="1"
          stroke={color}
          strokeWidth="1.5"
        />
        <path
          d="M7 14 L7 10 M19 8 L19 4"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 2"
        />
        <path
          d="M7 10 L19 4"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="2 2"
        />
      </svg>
    ),
    stepped_back: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M16 5 L10 13 L16 21"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 13 L10 13"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M4 7 L4 19"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    // Day 10
    quiet_moment: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M13 3 Q19 3 22 8 Q25 13 22 18 Q19 23 13 23 Q7 23 4 18 Q1 13 4 8 Q7 3 13 3 Z"
          stroke={color}
          strokeWidth="1.5"
        />
        <path
          d="M13 8 L13 13"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="13" cy="16" r="1" fill={color} />
      </svg>
    ),
    admit_wrong: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M6 13 Q6 7 13 7 Q20 7 20 13 Q20 19 13 19 Q10 19 8 17"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M5 10 L6 13 L9 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 13 L12 15 L16 10"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    chose_kind: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M13 20 L5 12 Q2 8 6 5 Q9 3 13 7 Q17 3 20 5 Q24 8 21 12 Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M10 12 L12 14 L16 10"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    // Day 11
    was_wrong: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M4 6 Q4 4 6 4 L20 4 Q22 4 22 6 L22 14 Q22 16 20 16 L15 16 L13 20 L11 16 L6 16 Q4 16 4 14 Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M9 10 L17 10"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M9 13 L14 13"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    need_help: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M13 4 L13 16 M8 21 L13 16 L18 21"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 21 L21 21"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    sorry: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="10" r="6" stroke={color} strokeWidth="1.5" />
        <path
          d="M10 9 Q10 7.5 12 7.5 Q14 7.5 14 9 Q14 10.5 13 11"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="13" cy="13" r="1" fill={color} />
        <path
          d="M10 17 Q10 15 13 15 Q16 15 16 17 L16 22 L10 22 Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    // Day 12
    gentle: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M8 16 Q6 12 8 9 Q10 6 13 6 Q16 6 18 9 Q20 12 18 16 Q16 19 13 20 Q10 19 8 16 Z"
          stroke={color}
          strokeWidth="1.5"
        />
        <path
          d="M13 6 L13 3"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M9 8 L7 6 M17 8 L19 6"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M10 13 Q13 16 16 13"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    forgive: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M13 19 L5 12 Q2 8 6 5 Q9 3 13 7 Q17 3 20 5 Q24 8 21 12 Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M9 13 L13 10 M17 13 L13 10"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    servant: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M5 15 Q5 11 9 11 L17 11 Q21 11 21 15"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 15 L23 15"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="13" cy="7" r="3" stroke={color} strokeWidth="1.5" />
        <path
          d="M8 19 L8 22 M18 19 L18 22"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    // Day 13
    copy_jesus: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="7" r="3" stroke={color} strokeWidth="1.5" />
        <path
          d="M13 10 L13 18"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M9 13 L17 13"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M10 18 L13 22 L16 18"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    follow_close: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="8" cy="10" r="3" stroke={color} strokeWidth="1.5" />
        <circle cx="18" cy="10" r="3" stroke={color} strokeWidth="1.5" />
        <path
          d="M5 20 Q5 16 8 16"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M15 16 Q18 16 21 20"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M8 16 Q13 14 18 16"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 2"
        />
      </svg>
    ),
    keep_going: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M4 20 L10 12 L14 16 L18 9 L22 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19 6 L22 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M22 6 L22 12 L16 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    // Day 14
    connected: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M13 3 L13 23"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M13 7 Q17 7 19 10 Q21 13 19 16 Q17 19 13 19"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M13 9 Q16 9 17 12 Q18 14 16 16 Q15 17 13 17"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    ),
    drifted: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M4 18 Q8 8 13 8"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 3"
        />
        <path
          d="M13 8 Q18 8 22 18"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="13" cy="8" r="2.5" stroke={color} strokeWidth="1.5" />
        <path
          d="M9 22 L17 22"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    not_sure: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle
          cx="13"
          cy="13"
          r="9"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="3 2"
        />
        <path
          d="M10 10 Q10 7.5 13 7.5 Q16 7.5 16 10 Q16 12.5 13 13.5 L13 15"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="13" cy="17.5" r="1" fill={color} />
      </svg>
    ),
    // Shared fallback
    still_figuring: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="9" stroke={color} strokeWidth="1.5" />
        <path
          d="M10 10 Q10 7.5 13 7.5 Q16 7.5 16 10 Q16 12.5 13 13.5 L13 15"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="13" cy="18" r="1" fill={color} />
      </svg>
    ),
  };
  return icons[icon] || null;
}

// ── KidsReflection — interactive scenario-based reflection with AI follow-up ──
function KidsReflection({ day, alreadyDone, onComplete, onContinue }) {
  const [picked, setPicked] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePick(choice) {
    if (picked) return;
    setPicked(choice);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a warm, gentle conversation partner helping a child ages 8-12 reflect on a Bible devotion. Your role is like a wise older friend — never a prophet, preacher, or voice of God. Rules: Never say "God is telling you" or "The Holy Spirit is saying" or speak as God. Connect their choice back to the day's Bible story gently. Ask one simple follow-up question to help them think deeper. Keep your response to 3-4 sentences max. Use simple, warm language a child can understand. Be encouraging but honest — not preachy. Today's story: "${day.title}" — ${day.reflection}`,
          messages: [
            {
              role: "user",
              content: `The child chose: "${choice.label}" Context: "${choice.context}" Respond warmly and connect it back to today's story. End with one gentle follow-up question.`,
            },
          ],
        }),
      });
      const data = await res.json();
      setAiResponse(data.content?.find((b) => b.type === "text")?.text || "");
    } catch {
      setAiResponse(
        "Take a moment to think about that. What would you do differently next time?",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 15,
          color: "var(--text-primary)",
          opacity: 0.85,
          lineHeight: 1.7,
          marginBottom: 24,
        }}
      >
        {day.reflectionPrompt || "Which one sounds most like you right now?"}
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 24,
        }}
      >
        {day.reflectionChoices.map((choice, i) => (
          <button
            key={i}
            onClick={() => handlePick(choice)}
            disabled={!!picked}
            style={{
              textAlign: "left",
              padding: "16px 18px",
              borderRadius: 14,
              background:
                picked?.label === choice.label
                  ? "var(--accent-subtle-strong)"
                  : "var(--accent-subtle)",
              border: `1px solid ${picked?.label === choice.label ? "var(--accent-border-strong)" : "var(--border-subtle)"}`,
              cursor: picked ? "default" : "pointer",
              opacity: picked && picked.label !== choice.label ? 0.4 : 1,
              transition: "all 0.2s ease",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: picked?.label === choice.label ? 1 : 0.5,
                }}
              >
                <ReflectionIcon
                  icon={choice.icon}
                  active={picked?.label === choice.label}
                />
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  color: "var(--text-primary)",
                  lineHeight: 1.5,
                }}
              >
                {choice.label}
              </span>
            </div>
          </button>
        ))}
      </div>
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "24px 0",
            fontFamily: "var(--font-ui)",
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "var(--text-accent)",
            opacity: 0.4,
          }}
        >
          Thinking...
        </div>
      )}
      {aiResponse && !loading && (
        <>
          <div
            style={{
              padding: "20px",
              marginBottom: 24,
              background: "var(--accent-subtle)",
              border: "1px solid var(--border-subtle)",
              borderLeft: "3px solid var(--text-accent)",
              borderRadius: 14,
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
              }}
            >
              SOMETHING TO THINK ABOUT
            </div>
            {aiResponse.split("\n\n").map((para, i) => (
              <p
                key={i}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: "var(--text-primary)",
                  opacity: 0.88,
                  margin: i === 0 ? 0 : "12px 0 0",
                }}
              >
                {para}
              </p>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            {!alreadyDone ? (
              <button
                onClick={onComplete}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  textAlign: "center",
                  background: "var(--accent-subtle-strong)",
                  border: "1px solid var(--accent-border-strong)",
                  borderRadius: 12,
                  fontFamily: "var(--font-ui)",
                  fontSize: 12,
                  letterSpacing: "0.06em",
                  color: "var(--text-accent)",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                I have reflected — Mark Day Complete
              </button>
            ) : (
              <button
                onClick={onContinue}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  textAlign: "center",
                  background: "var(--accent-subtle)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 12,
                  fontFamily: "var(--font-ui)",
                  fontSize: 12,
                  letterSpacing: "0.06em",
                  color: "var(--text-accent)",
                  opacity: 0.85,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Continue to Quiet Abiding →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function DevotionalScreen({ onBack, theme }) {
  const [view, setView] = useState("library");
  const [activeSeries, setActiveSeries] = useState(null);
  const [activeDay, setActiveDay] = useState(null);
  const [loadingDay, setLoadingDay] = useState(false);
  const [section, setSection] = useState("intro");
  const [showChoice, setShowChoice] = useState(true);
  const [completedDays, setCompletedDays] = useState([]);
  const [justCompleted, setJustCompleted] = useState(false);
  const [scriptureResult, setScriptureResult] = useState(null);
  const [loadingScripture, setLoadingScripture] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (activeSeries) setCompletedDays(getCompletedDays(activeSeries.id));
  }, [activeSeries]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [view, section]);

  // Fetch scripture when entering scripture section
  useEffect(() => {
    if (section === "scripture" && activeDay?.scripture && !scriptureResult) {
      setLoadingScripture(true);
      const priority =
        activeSeries?.id === "from-the-inside-out"
          ? TRANSLATION_PRIORITY_KIDS
          : TRANSLATION_PRIORITY_ADULT;
      fetchPassage(activeDay.scripture, priority).then((result) => {
        setScriptureResult(result);
        setLoadingScripture(false);
      });
    }
  }, [section, activeDay]);

  function openSeries(series) {
    setActiveSeries(series);
    setView("series");
  }

  async function openDay(dayNum, series) {
    setLoadingDay(true);
    try {
      const day = await fetchDay(series.id, dayNum);
      setActiveDay(day);
      setSection("intro");
      setShowChoice(true);
      setJustCompleted(false);
      setScriptureResult(null);
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
      { id: "abiding", label: "Abide" },
    ];

    // ── Listen / Read choice screen — disabled until audio hosting is ready ──
    if (false && showChoice && activeSeries.hasAudio)
      return (
        <div style={s.screen}>
          <style>{dynamicCSS}</style>
          <div style={s.header}>
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
            <div style={{ marginTop: 16 }}>
              <div style={s.eyebrow}>
                Day {day.day} · {activeSeries.author}
              </div>
              <h1 style={{ ...s.pageTitle, fontSize: 22 }}>{day.title}</h1>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px 28px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 10,
                letterSpacing: "0.2em",
                color: "var(--text-accent)",
                opacity: 0.35,
                marginBottom: 28,
              }}
            >
              ✦ &nbsp; HOW WOULD YOU LIKE TO ENGAGE TODAY? &nbsp; ✦
            </div>

            <button
              onClick={() => {
                window.open(SCROLLREADER_URL, "_blank");
                setShowChoice(false);
              }}
              className="dv-card"
              style={{
                width: "100%",
                textAlign: "left",
                padding: "22px",
                marginBottom: 14,
                borderRadius: 16,
                background: "var(--accent-subtle)",
                border: "1px solid var(--border-subtle)",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    flexShrink: 0,
                    background: "var(--accent-subtle-strong)",
                    border: "1px solid var(--accent-border-strong)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  🎧
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 15,
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      marginBottom: 4,
                    }}
                  >
                    Listen
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontStyle: "italic",
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    Hear Murray read aloud on ScrollReader — then return here
                    for reflection
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontFamily: "var(--font-ui)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  color: "var(--text-accent)",
                  opacity: 0.55,
                }}
              >
                Opens scrollreader.com · Chapter {day.day} →
              </div>
            </button>

            <button
              onClick={() => setShowChoice(false)}
              className="dv-card"
              style={{
                width: "100%",
                textAlign: "left",
                padding: "22px",
                borderRadius: 16,
                background: "var(--accent-subtle)",
                border: "1px solid var(--border-subtle)",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    flexShrink: 0,
                    background: "var(--accent-subtle-strong)",
                    border: "1px solid var(--accent-border-strong)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  📖
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 15,
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      marginBottom: 4,
                    }}
                  >
                    Read
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontStyle: "italic",
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    Read Murray's chapter inside ABIDE at your own pace
                  </div>
                </div>
              </div>
            </button>

            <p
              style={{
                fontFamily: "var(--font-body)",
                fontStyle: "italic",
                fontSize: 12,
                color: "var(--text-secondary)",
                opacity: 0.5,
                textAlign: "center",
                marginTop: 32,
                lineHeight: 1.7,
              }}
            >
              Either way, the reflection, Scripture, and prayer await you here
              when you're ready.
            </p>
          </div>
        </div>
      );

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
            <div style={s.eyebrow}>
              Day {day.day}
              {activeSeries.author !== "ABIDE"
                ? ` · ${activeSeries.author}`
                : ""}
            </div>
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
              <div style={s.sectionLabel}>
                {activeSeries.hasAudio ? "Before You Read" : "Today's Word"}
              </div>
              {activeSeries.hasAudio && (
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
              )}
              {(day.intro || day.reading).split("\n\n").map((para, i) => (
                <p key={i} style={s.prose}>
                  {para}
                </p>
              ))}
              <div style={{ marginTop: 36 }}>
                <button
                  onClick={() => setSection("reading")}
                  style={s.continueBtn}
                >
                  {activeSeries.hasAudio
                    ? "Open Murray's Chapter →"
                    : "Continue to Reading →"}
                </button>
              </div>
            </div>
          )}

          {/* ── READING ── */}
          {section === "reading" && (
            <div>
              {activeSeries.hasAudio || day.murrayReading ? (
                <>
                  <div style={s.sectionLabel}>From Andrew Murray</div>
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
                  {(day.murrayReading || day.reading)
                    .split("\n\n")
                    .map((para, i) => (
                      <p
                        key={i}
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 15,
                          fontWeight: 400,
                          lineHeight: 1.95,
                          color: "var(--text-primary)",
                          opacity: 0.88,
                          marginBottom: 18,
                        }}
                      >
                        {para}
                      </p>
                    ))}
                </>
              ) : (
                <>
                  <div style={s.sectionLabel}>Today's Reading</div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontStyle: "italic",
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      lineHeight: 1.7,
                      marginBottom: 28,
                    }}
                  >
                    Read the Scripture for today slowly — more than once if you
                    can.
                  </p>
                  <div
                    style={{
                      padding: "14px 18px",
                      marginBottom: 10,
                      background: "var(--accent-subtle)",
                      border: "1px solid var(--border-subtle)",
                      borderLeft: "3px solid var(--text-accent)",
                      borderRadius: 12,
                      fontFamily: "var(--font-ui)",
                      fontSize: 13,
                      letterSpacing: "0.06em",
                      color: "var(--text-accent)",
                      opacity: 0.8,
                    }}
                  >
                    {day.scripture}
                  </div>
                </>
              )}
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
                {activeSeries.hasAudio
                  ? "Let this passage anchor what Murray has opened. Read slowly. More than once if needed."
                  : "This is where it gets real. Read it slowly. Don't move on until it lands."}
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
                <div
                  style={{
                    marginBottom: 16,
                    borderRadius: 14,
                    background: "var(--accent-subtle)",
                    border: "1px solid var(--border-subtle)",
                    borderLeft: "3px solid var(--text-accent)",
                    overflow: "hidden",
                  }}
                >
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
                      {day.scripture}
                    </span>
                    {scriptureResult?.translation && (
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
                        {scriptureResult.translation}
                      </span>
                    )}
                  </div>
                  {scriptureResult?.text ? (
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
                          "{scriptureResult.text}"
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
                        — {scriptureResult.translation}
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

              {day.reflectionChoices ? (
                /* ── KIDS: interactive scenario reflection ── */
                <KidsReflection
                  day={day}
                  alreadyDone={alreadyDone}
                  onComplete={handleComplete}
                  onContinue={() => setSection("abiding")}
                />
              ) : (
                /* ── ADULT: static question list ── */
                <>
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
                  {day.reflection
                    .split("?")
                    .filter((q) => q.trim())
                    .map((q, i, arr) => (
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
                          {i + 1} of {arr.length}
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
                          {q.trim()}?
                        </p>
                      </div>
                    ))}
                  <div style={{ marginTop: 32 }}>
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
                        I have reflected — Mark Day {day.day} Complete
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
                </>
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
                "{day.abide}"
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
                  onClick={() => openDay(day.day + 1, activeSeries)}
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
                    {activeSeries.id === "beauty-of-holiness"
                      ? "You have walked through all twelve days. This is not an ending — it is a beginning. Keep beholding Him."
                      : "You have walked through all fourteen days. This is not an ending — it is a beginning. Keep staying close to Jesus."}
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
