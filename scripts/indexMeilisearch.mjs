/**
 * indexMeilisearch.mjs
 * Indexes all local Bible translations into Meilisearch.
 * Run once (or whenever translations are updated):
 *   node scripts/indexMeilisearch.mjs
 */

import { Meilisearch } from "meilisearch";
import { readFile, readdir } from "fs/promises";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const TRANSLATIONS_DIR = resolve(__dirname, "../public/data/translations");

// ── Load .env ─────────────────────────────────────────────────────────────────
try {
  const envPath = resolve(__dirname, "../.env");
  const envContent = readFileSync(envPath, "utf8");
  for (const line of envContent.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch { /* no .env — rely on shell env */ }

// ── Config ────────────────────────────────────────────────────────────────────
const HOST  = process.env.VITE_MEILI_HOST  || "";
const KEY   = process.env.VITE_MEILI_ADMIN_KEY || process.env.VITE_MEILI_READ_KEY || "";
const INDEX = "verses";
const BATCH = 5000; // documents per batch

if (!HOST) {
  console.error("❌  VITE_MEILI_HOST is not set. Add it to your .env or pass it as an env var.");
  process.exit(1);
}

const client = new Meilisearch({ host: HOST, apiKey: KEY });

// ── Helpers ───────────────────────────────────────────────────────────────────
async function dirs(path) {
  const entries = await readdir(path, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

async function files(path) {
  const entries = await readdir(path, { withFileTypes: true });
  return entries.filter((e) => e.isFile() && e.name.endsWith(".json")).map((e) => e.name);
}

async function waitForTask(taskUid) {
  const task = await client.tasks.waitForTask(taskUid, { timeOutMs: 300_000, intervalMs: 500 });
  if (task.status === "failed") throw new Error(`Task ${taskUid} failed: ${JSON.stringify(task.error)}`);
}

// ── Index setup ───────────────────────────────────────────────────────────────
async function setupIndex() {
  console.log("⚙️  Configuring index settings…");
  const idx = client.index(INDEX);

  const settingsTask = await idx.updateSettings({
    searchableAttributes: ["text", "reference"],
    filterableAttributes: ["translation", "book", "chapter"],
    sortableAttributes:   ["book", "chapter", "verse"],
    rankingRules: [
      "words", "typo", "proximity", "attribute", "sort", "exactness",
    ],
  });
  await waitForTask(settingsTask.taskUid);
  console.log("✅  Index settings applied.");
}

// ── Build + push documents ────────────────────────────────────────────────────
async function indexTranslation(translation) {
  const tDir = join(TRANSLATIONS_DIR, translation);
  const books = await dirs(tDir);
  const idx = client.index(INDEX);

  let total = 0;
  let batch = [];

  async function flush() {
    if (!batch.length) return;
    const task = await idx.addDocuments(batch);
    await waitForTask(task.taskUid);
    total += batch.length;
    process.stdout.write(`\r  ${translation.toUpperCase()} — indexed ${total} verses…`);
    batch = [];
  }

  for (const book of books) {
    const chapterFiles = await files(join(tDir, book));

    for (const file of chapterFiles) {
      const ch = parseInt(file.replace(".json", ""));
      if (isNaN(ch)) continue;

      const raw = await readFile(join(tDir, book, file), "utf8");
      let data;
      try { data = JSON.parse(raw); } catch { continue; }

      const rawVerses = data.verses ?? data;
      const entries = Array.isArray(rawVerses)
        ? rawVerses
        : Object.entries(rawVerses)
            .filter(([k]) => !isNaN(Number(k)))
            .map(([k, v]) => ({ verse: Number(k), text: typeof v === "string" ? v : (v?.text ?? "") }));

      for (const v of entries) {
        const text = typeof v.text === "string" ? v.text : (v.text?.text ?? "");
        if (!text) continue;

        const refStr = `${data.book || book} ${ch}:${v.verse}`;
        const safeBook = book.replace(/[^a-zA-Z0-9_-]/g, "_");
        batch.push({
          id:          `${translation}-${safeBook}-${ch}-${v.verse}`,
          reference:   refStr,
          ref:         refStr,
          book,
          chapter:     ch,
          verse:       v.verse,
          text,
          translation: translation.toUpperCase(),
        });

        if (batch.length >= BATCH) await flush();
      }
    }
  }

  await flush();
  console.log(`\n  ✅  ${translation.toUpperCase()} complete — ${total} verses.`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`\n🔗  Connecting to ${HOST}…`);
  try { await client.health(); }
  catch { console.error("❌  Cannot reach Meilisearch. Check VITE_MEILI_HOST and your key."); process.exit(1); }
  console.log("✅  Connected.\n");

  await setupIndex();

  const translations = await dirs(TRANSLATIONS_DIR);
  console.log(`\n📖  Found translations: ${translations.join(", ")}\n`);

  for (const t of translations) {
    console.log(`📤  Indexing ${t.toUpperCase()}…`);
    await indexTranslation(t);
  }

  console.log("\n🎉  All translations indexed successfully!\n");
})();
