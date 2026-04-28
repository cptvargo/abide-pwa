/**
 * searchEngine.js
 * Dual search: Meilisearch (primary) → MiniSearch (offline fallback)
 * Results always match AppShell's { ref, bookId, chapter, snippet, score } shape.
 */

import MiniSearch from "minisearch";
import { Meilisearch } from "meilisearch";
import { BIBLE_ORDER, CHAPTER_COUNT, getBookDisplayName } from "./bibleStructure.js";

/* ─── Book manifest ─────────────────────────────────────────────────────── */
const ALL_BOOKS = BIBLE_ORDER.map((id) => ({
  id,
  name: getBookDisplayName(id),
  chapters: CHAPTER_COUNT[id],
}));

const BOOK_BY_ID = Object.fromEntries(ALL_BOOKS.map((b) => [b.id, b]));

/* ─── Book abbreviation → canonical display name ─────────────────────────
   Used by normalizeQuery to expand short-hand references.              */
const ABBR_MAP = {
  // OT
  ge: "Genesis",    gen: "Genesis",
  ex: "Exodus",     exo: "Exodus",
  lev: "Leviticus", le: "Leviticus",
  nu: "Numbers",    num: "Numbers",
  dt: "Deuteronomy", deu: "Deuteronomy", deut: "Deuteronomy",
  josh: "Joshua",   jos: "Joshua",
  judg: "Judges",   jdg: "Judges",
  ru: "Ruth",
  "1sa": "1 Samuel", "1sam": "1 Samuel",
  "2sa": "2 Samuel", "2sam": "2 Samuel",
  "1ki": "1 Kings",  "1kgs": "1 Kings",
  "2ki": "2 Kings",  "2kgs": "2 Kings",
  "1ch": "1 Chronicles", "1chr": "1 Chronicles", "1chron": "1 Chronicles",
  "2ch": "2 Chronicles", "2chr": "2 Chronicles", "2chron": "2 Chronicles",
  ezr: "Ezra",
  neh: "Nehemiah",
  est: "Esther", esth: "Esther",
  jb: "Job",
  ps: "Psalms", psa: "Psalms", psalm: "Psalms",
  pr: "Proverbs", pro: "Proverbs", prov: "Proverbs",
  ecc: "Ecclesiastes", eccl: "Ecclesiastes",
  song: "Song of Solomon", sos: "Song of Solomon",
  isa: "Isaiah",
  jer: "Jeremiah",
  lam: "Lamentations",
  eze: "Ezekiel", ezek: "Ezekiel",
  dan: "Daniel",
  hos: "Hosea",
  joe: "Joel",
  am: "Amos",
  ob: "Obadiah", obad: "Obadiah",
  jon: "Jonah",
  mic: "Micah",
  na: "Nahum",
  hab: "Habakkuk",
  zep: "Zephaniah", zeph: "Zephaniah",
  hag: "Haggai",
  zec: "Zechariah", zech: "Zechariah",
  mal: "Malachi",
  // NT
  mt: "Matthew", matt: "Matthew",
  mk: "Mark",
  lk: "Luke",
  jn: "John",
  ac: "Acts",
  ro: "Romans", rom: "Romans",
  "1co": "1 Corinthians", "1cor": "1 Corinthians",
  "2co": "2 Corinthians", "2cor": "2 Corinthians",
  gal: "Galatians",
  eph: "Ephesians",
  php: "Philippians", phil: "Philippians",
  col: "Colossians",
  "1th": "1 Thessalonians", "1thes": "1 Thessalonians", "1thess": "1 Thessalonians",
  "2th": "2 Thessalonians", "2thes": "2 Thessalonians", "2thess": "2 Thessalonians",
  "1ti": "1 Timothy", "1tim": "1 Timothy",
  "2ti": "2 Timothy", "2tim": "2 Timothy",
  tit: "Titus",
  phm: "Philemon",
  heb: "Hebrews",
  jas: "James",
  "1pe": "1 Peter", "1pet": "1 Peter",
  "2pe": "2 Peter", "2pet": "2 Peter",
  "1jn": "1 John", "1jo": "1 John",
  "2jn": "2 John", "2jo": "2 John",
  "3jn": "3 John", "3jo": "3 John",
  jde: "Jude", jud: "Jude",
  re: "Revelation", rev: "Revelation",
};

/* ─── Query normalisation ─────────────────────────────────────────────── */
export function normalizeQuery(raw) {
  let q = raw.trim().toLowerCase();

  // Collapse multiple spaces
  q = q.replace(/\s+/g, " ");

  // Attempt to expand a scripture reference at the start of the query
  // Patterns handled:
  //   "jn3:16"        → "john 3:16"
  //   "jn 3 16"       → "john 3:16"
  //   "john 3 16"     → "john 3:16"
  //   "1jn 3:3"       → "1 john 3:3"
  const refPattern = /^(\d?\s?[a-z]+)\s*(\d+)\s*[:\s]\s*(\d+)/i;
  const m = q.match(refPattern);
  if (m) {
    const rawBook = m[1].replace(/\s/g, "");
    const canonical =
      ABBR_MAP[rawBook] ||
      ALL_BOOKS.find(
        (b) =>
          b.name.toLowerCase() === rawBook ||
          b.id === rawBook,
      )?.name;

    if (canonical) {
      const rest = q.slice(m[0].length).trim();
      q = `${canonical} ${m[2]}:${m[3]}${rest ? " " + rest : ""}`;
    }
  }

  return q;
}

/* ─── Stop words (never highlight alone) ────────────────────────────────── */
const STOP_WORDS = new Set([
  "a","an","and","are","as","at","be","been","being","but","by","do","did",
  "for","from","had","has","have","he","her","his","how","i","if","in","into",
  "is","it","its","me","may","might","my","no","not","of","on","or","our",
  "out","shall","she","should","so","than","that","the","their","them","then",
  "there","these","they","this","those","to","up","us","was","we","were",
  "what","when","where","who","will","with","would","you","your",
]);

/* ─── Snippet extraction (matches AppShell's highlightSnippet shape) ───── */
function makeSnippet(text, query) {
  if (!query) return { pre: "", match: "", post: text.slice(0, 160) };
  const lower = text.toLowerCase();

  // 1. Try to match the full phrase
  let idx = lower.indexOf(query.toLowerCase());
  let matchLen = query.length;

  // 2. Fall back: pick the best (longest, non-stop) word from the query
  if (idx === -1) {
    const words = query.split(/\s+/).sort((a, b) => {
      const aStop = STOP_WORDS.has(a.toLowerCase());
      const bStop = STOP_WORDS.has(b.toLowerCase());
      if (aStop !== bStop) return aStop ? 1 : -1;
      return b.length - a.length;
    });
    for (const w of words) {
      if (w.length < 3) continue;
      idx = lower.indexOf(w.toLowerCase());
      if (idx !== -1) { matchLen = w.length; break; }
    }
  }

  // 3. Nothing matched — return plain preview without a highlight
  if (idx === -1) return { pre: "", match: "", post: text.slice(0, 160) };

  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + matchLen + 100);
  return {
    pre: (start > 0 ? "…" : "") + text.slice(start, idx),
    match: text.slice(idx, idx + matchLen),
    post: text.slice(idx + matchLen, end) + (end < text.length ? "…" : ""),
  };
}

/* ─── IndexedDB helpers ───────────────────────────────────────────────── */
const DB_NAME = "abide-search-v1";
const STORE_INDEX = "mini-index";
const STORE_CACHE = "search-cache";

let _db = null;
function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_INDEX))
        db.createObjectStore(STORE_INDEX);
      if (!db.objectStoreNames.contains(STORE_CACHE))
        db.createObjectStore(STORE_CACHE);
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(store, key) {
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const req = db.transaction(store, "readonly").objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch { return null; }
}

async function idbSet(store, key, value) {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).put(value, key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* storage full or unavailable */ }
}

/* ─── Meilisearch client ────────────────────────────────────────────────── */
let _meili = null;
function getMeiliClient() {
  if (_meili) return _meili;
  const host = import.meta.env.VITE_MEILI_HOST;
  const key  = import.meta.env.VITE_MEILI_READ_KEY ?? "";
  if (!host) return null;
  _meili = new Meilisearch({ host, apiKey: key });
  return _meili;
}

// Cache availability state for 30 s so we don't ping on every keystroke
let _meiliOk = null;
let _meiliChecked = 0;

async function isMeiliAvailable() {
  const now = Date.now();
  if (_meiliOk !== null && now - _meiliChecked < 30_000) return _meiliOk;
  const client = getMeiliClient();
  if (!client) { _meiliOk = false; return false; }
  try {
    await client.health();
    _meiliOk = true;
  } catch {
    _meiliOk = false;
  }
  _meiliChecked = Date.now();
  return _meiliOk;
}

/* ─── MiniSearch index management ────────────────────────────────────────
   One index per translation, keyed as "v1-{translation}".
   Stored serialised in IndexedDB; loaded on first use.                 */
const INDEX_VERSION = "v1";
const _miniIndexes = {};   // translation → MiniSearch instance
const _buildTasks  = {};   // translation → Promise (in-flight build)

const MINI_OPTIONS = {
  idField: "id",
  fields: ["reference", "text", "searchText"],
  storeFields: ["id", "ref", "bookId", "chapter", "verse", "text"],
};

async function fetchAndIndexTranslation(translation) {
  const t   = translation.toLowerCase();
  const ms  = new MiniSearch(MINI_OPTIONS);
  const base = import.meta.env.BASE_URL ?? "/";
  const docs = [];

  for (const book of ALL_BOOKS) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      try {
        const res = await fetch(`${base}data/translations/${t}/${book.id}/${ch}.json`);
        if (!res.ok) continue;
        const data = await res.json();
        const rawVerses = data.verses ?? data;

        const entries = Array.isArray(rawVerses)
          ? rawVerses
          : Object.entries(rawVerses)
              .filter(([k]) => !isNaN(Number(k)))
              .map(([k, v]) => ({
                verse: Number(k),
                text: typeof v === "string" ? v : (v?.text ?? ""),
              }));

        for (const v of entries) {
          const text = typeof v.text === "string" ? v.text : (v.text?.text ?? "");
          if (!text) continue;
          const ref = `${book.name} ${ch}:${v.verse}`;
          docs.push({
            id: `${book.id}-${ch}-${v.verse}-${t}`,
            ref,
            reference: ref,
            bookId: book.id,
            chapter: ch,
            verse: v.verse,
            text,
            searchText: `${ref} ${text}`,
          });
        }
      } catch { continue; }
    }
  }

  await ms.addAllAsync(docs, { chunkSize: 500 });
  return ms;
}

async function getMiniIndex(translation) {
  const t = translation.toLowerCase();
  if (_miniIndexes[t]) return _miniIndexes[t];

  // Try IndexedDB first
  const key    = `${INDEX_VERSION}-${t}`;
  const stored = await idbGet(STORE_INDEX, key);
  if (stored) {
    try {
      const ms = MiniSearch.loadJS(stored, MINI_OPTIONS);
      _miniIndexes[t] = ms;
      return ms;
    } catch { /* corrupt — rebuild */ }
  }

  // Build (deduplicate concurrent calls)
  if (!_buildTasks[t]) {
    _buildTasks[t] = fetchAndIndexTranslation(t).then(async (ms) => {
      _miniIndexes[t] = ms;
      // Persist to IDB in the background
      idbSet(STORE_INDEX, key, ms.toJSON());
      return ms;
    });
  }
  return _buildTasks[t];
}

/* ─── Warm the index eagerly (call on app mount, fire-and-forget) ───────── */
export function warmIndex(translation) {
  // Yield to the event loop so we don't block startup
  setTimeout(() => getMiniIndex(translation), 500);
}

/* ─── Popularity scores for well-known verses ────────────────────────── */
const POPULAR_VERSES = new Map([
  ["John 3:16", 100], ["Philippians 4:13", 95], ["Jeremiah 29:11", 95],
  ["Psalm 23:1", 90],  ["Romans 8:28", 90],    ["Proverbs 3:5", 88],
  ["Isaiah 40:31", 87],["Matthew 28:19", 85],  ["John 14:6", 85],
  ["Romans 3:23", 83], ["Romans 6:23", 83],    ["Ephesians 2:8", 82],
  ["John 1:1", 80],    ["Genesis 1:1", 80],    ["Psalm 46:10", 79],
  ["Romans 8:1", 78],  ["John 15:5", 77],      ["Hebrews 11:1", 77],
  ["Galatians 2:20", 76], ["2 Timothy 3:16", 76], ["Matthew 6:33", 75],
  ["Psalm 119:105", 75], ["Proverbs 3:6", 74], ["John 10:10", 74],
  ["Romans 5:8", 73],  ["Isaiah 41:10", 73],   ["Colossians 3:23", 72],
  ["1 Corinthians 13:4", 72], ["Matthew 5:16", 71], ["Psalm 91:1", 70],
  ["Romans 12:2", 70], ["Ephesians 3:20", 69], ["James 1:2", 68],
  ["2 Chronicles 7:14", 68], ["Psalm 139:14", 67], ["Micah 6:8", 67],
  ["1 John 4:7", 66],  ["John 3:17", 65],      ["Matthew 11:28", 65],
  ["Revelation 3:20", 64], ["Luke 1:37", 63],  ["John 16:33", 63],
  ["Acts 1:8", 62],    ["Ephesians 6:11", 61], ["Psalm 37:4", 61],
  ["1 John 1:9", 60],  ["Matthew 7:7", 59],    ["John 8:32", 58],
  ["Proverbs 4:23", 57], ["Isaiah 53:5", 57],  ["Romans 10:9", 56],
  ["Psalm 27:1", 55],  ["John 15:13", 55],     ["Romans 1:16", 54],
]);

function popularityBoost(ref) {
  return (POPULAR_VERSES.get(ref) ?? 0) / 100 * 0.25;
}

/* ─── Format helpers ─────────────────────────────────────────────────── */
function meiliHitToResult(hit, term) {
  return {
    ref: hit.reference ?? hit.ref,
    bookId: hit.book,
    chapter: hit.chapter,
    verse: hit.verse,
    text: hit.text ?? "",
    snippet: makeSnippet(hit.text ?? "", term),
    score: (hit._rankingScore ?? 1) + popularityBoost(hit.reference ?? hit.ref),
  };
}

function miniHitToResult(hit, term) {
  return {
    ref: hit.ref,
    bookId: hit.bookId,
    chapter: hit.chapter,
    verse: hit.verse,
    text: hit.text ?? "",
    snippet: makeSnippet(hit.text ?? "", term),
    score: (hit.score ?? 1) + popularityBoost(hit.ref),
  };
}

/* ─── Result cache (IndexedDB) ──────────────────────────────────────────
   Key: "{translation}:{normalised query}"                              */
async function getCachedResults(query, translation) {
  return idbGet(STORE_CACHE, `${translation.toLowerCase()}:${query}`);
}

async function setCachedResults(query, translation, results) {
  idbSet(STORE_CACHE, `${translation.toLowerCase()}:${query}`, results);
}

/* ─── Main search entry point ────────────────────────────────────────── */
/**
 * search(rawQuery, translation) → Promise<ResultItem[]>
 *
 * ResultItem = { ref, bookId, chapter, snippet: {pre,match,post}, score,
 *                isCrossRef?, crossRefFrom? }
 *
 * Priority:
 *   1. Meilisearch (if reachable)  → cache results in IDB
 *   2. MiniSearch  (offline / fail) → from local index
 */
export async function search(rawQuery, translation = "KJV") {
  const q    = normalizeQuery(rawQuery);
  const term = q;

  if (q.length < 2) return [];

  // Check IDB result cache first (avoids redundant remote calls)
  const cached = await getCachedResults(q, translation);
  if (cached) return cached;

  // ── 1. Meilisearch ───────────────────────────────────────────────────
  if (await isMeiliAvailable()) {
    try {
      const client = getMeiliClient();
      const idx = client.index("verses");
      const filter = `translation = "${translation.toUpperCase()}"`;
      const attrs = ["reference", "ref", "book", "chapter", "verse", "text"];

      // Try exact (all-words-must-match) first for precise results
      let { hits } = await idx.search(q, {
        filter,
        limit: 25,
        matchingStrategy: "all",
        attributesToRetrieve: attrs,
        showRankingScore: true,
      });

      // If too few, fall back to "last" strategy (at least last word matches)
      if (hits.length < 3) {
        const fallback = await idx.search(q, {
          filter,
          limit: 25,
          matchingStrategy: "last",
          attributesToRetrieve: attrs,
          showRankingScore: true,
          rankingScoreThreshold: 0.35,
        });
        hits = fallback.hits;
      }

      const results = hits
        .map((h) => meiliHitToResult(h, term))
        .sort((a, b) => b.score - a.score);
      setCachedResults(q, translation, results);
      return results;
    } catch {
      // Fall through to MiniSearch
      _meiliOk = false;
    }
  }

  // ── 2. MiniSearch ────────────────────────────────────────────────────
  try {
    const ms = await getMiniIndex(translation);
    const hits = ms.search(q, {
      fuzzy:       0.15,
      prefix:      true,
      boost:       { reference: 4, searchText: 2, text: 1 },
      combineWith: "AND",
    });

    // Re-try with OR if AND yields nothing
    const finalHits = hits.length
      ? hits
      : ms.search(q, { fuzzy: 0.15, prefix: true, boost: { reference: 4 } });

    const results = finalHits.slice(0, 30).map((h) => miniHitToResult(h, term));
    if (results.length) setCachedResults(q, translation, results);
    return results;
  } catch {
    return [];
  }
}
