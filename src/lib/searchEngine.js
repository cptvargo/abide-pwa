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

/* ─── Snippet extraction (matches AppShell's highlightSnippet shape) ───── */
function makeSnippet(text, term) {
  if (!term) return { pre: "", match: "", post: text.slice(0, 160) };
  const lower = text.toLowerCase();
  const idx = lower.indexOf(term.toLowerCase());
  if (idx === -1) return { pre: "", match: "", post: text.slice(0, 160) };
  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + term.length + 100);
  return {
    pre: (start > 0 ? "…" : "") + text.slice(start, idx),
    match: text.slice(idx, idx + term.length),
    post: text.slice(idx + term.length, end) + (end < text.length ? "…" : ""),
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

/* ─── Format helpers ─────────────────────────────────────────────────── */
function meiliHitToResult(hit, term) {
  return {
    ref: hit.reference ?? hit.ref,
    bookId: hit.book,
    chapter: hit.chapter,
    snippet: makeSnippet(hit.text ?? "", term),
    score: hit._rankingScore ?? 1,
  };
}

function miniHitToResult(hit, term) {
  return {
    ref: hit.ref,
    bookId: hit.bookId,
    chapter: hit.chapter,
    snippet: makeSnippet(hit.text ?? "", term),
    score: hit.score ?? 1,
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
  const term = q.split(/\s+/)[0] ?? q;

  if (q.length < 2) return [];

  // Check IDB result cache first (avoids redundant remote calls)
  const cached = await getCachedResults(q, translation);
  if (cached) return cached;

  // ── 1. Meilisearch ───────────────────────────────────────────────────
  if (await isMeiliAvailable()) {
    try {
      const client = getMeiliClient();
      const { hits } = await client.index("verses").search(q, {
        filter: `translation = "${translation.toUpperCase()}"`,
        limit: 30,
        attributesToRetrieve: ["reference", "ref", "book", "chapter", "verse", "text"],
        rankingScoreThreshold: 0.2,
      });

      const results = hits.map((h) => meiliHitToResult(h, term));
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
