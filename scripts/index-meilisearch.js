#!/usr/bin/env node
/**
 * index-meilisearch.js
 *
 * Indexes all translations found in public/data/translations/ into Meilisearch.
 * Run once to set up, or re-run whenever you add a new translation — it upserts
 * so existing documents are updated rather than duplicated.
 *
 * Usage:
 *   MEILI_HOST=https://your-project.meilisearch.io \
 *   MEILI_KEY=your-admin-api-key \
 *   node scripts/index-meilisearch.js
 *
 * Optional — index only specific translations:
 *   node scripts/index-meilisearch.js kjv asr
 */

import { Meilisearch } from "meilisearch";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const TRANSLATIONS_DIR = resolve(__dirname, "../public/data/translations");
const INDEX_NAME = "verses";
const BATCH_SIZE = 1000;

/* ── Config ──────────────────────────────────────────────────────────────── */
const host = process.env.MEILI_HOST;
const key  = process.env.MEILI_KEY;

if (!host || !key) {
  console.error(
    "Missing env vars.\n" +
    "  MEILI_HOST   — your Meilisearch instance URL\n" +
    "  MEILI_KEY    — Admin or Default Admin API key (NOT the search key)\n\n" +
    "Example:\n" +
    "  MEILI_HOST=https://xxx.meilisearch.io MEILI_KEY=masterKey node scripts/index-meilisearch.js",
  );
  process.exit(1);
}

const client = new Meilisearch({ host, apiKey: key });

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function dirs(parent) {
  return readdirSync(parent).filter((n) =>
    statSync(join(parent, n)).isDirectory(),
  );
}

function readJSON(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

async function waitForTask(index, taskUid) {
  let task;
  do {
    await new Promise((r) => setTimeout(r, 300));
    task = await index.getTask(taskUid);
  } while (task.status === "enqueued" || task.status === "processing");
  if (task.status !== "succeeded") {
    console.error("  Task failed:", task.error);
  }
}

/* ── Index setup ─────────────────────────────────────────────────────────── */
async function ensureIndex() {
  try {
    await client.getIndex(INDEX_NAME);
  } catch {
    console.log(`Creating index "${INDEX_NAME}"…`);
    const task = await client.createIndex(INDEX_NAME, { primaryKey: "id" });
    await client.waitForTask(task.taskUid);
  }

  const index = client.index(INDEX_NAME);

  // Filterable so we can scope queries to a single translation
  await index.updateFilterableAttributes(["translation", "book", "chapter"]);
  // Searchable fields in priority order
  await index.updateSearchableAttributes(["reference", "text"]);
  // Ranking: keep Meilisearch defaults (typo, words, proximity, attribute, exactness)
  // but bump ranking score threshold in queries instead
  await index.updateSettings({
    rankingRules: [
      "words",
      "typo",
      "proximity",
      "attribute",
      "sort",
      "exactness",
    ],
  });

  return index;
}

/* ── Document building ───────────────────────────────────────────────────── */
function buildDocs(translationId) {
  const tDir = join(TRANSLATIONS_DIR, translationId);
  const t    = translationId.toUpperCase();
  const docs = [];

  for (const bookId of dirs(tDir)) {
    const bookDir = join(tDir, bookId);
    const chapterFiles = readdirSync(bookDir)
      .filter((f) => f.endsWith(".json"))
      .sort((a, b) => parseInt(a) - parseInt(b));

    for (const file of chapterFiles) {
      const data = readJSON(join(bookDir, file));
      if (!data) continue;

      const chapter = data.chapter ?? parseInt(file);
      const bookName = data.book ?? bookId;
      const rawVerses = data.verses ?? data;

      const entries = Array.isArray(rawVerses)
        ? rawVerses
        : Object.entries(rawVerses)
            .filter(([k]) => !isNaN(Number(k)))
            .map(([k, v]) => ({
              verse: Number(k),
              text: typeof v === "string" ? v : (v?.text ?? ""),
            }));

      for (const { verse, text } of entries) {
        if (!text) continue;
        const reference = `${bookName} ${chapter}:${verse}`;
        docs.push({
          id: `${bookId}-${chapter}-${verse}-${t}`,
          reference,
          ref: reference,
          book: bookId,
          chapter,
          verse,
          text,
          translation: t,
        });
      }
    }
  }

  return docs;
}

/* ── Main ────────────────────────────────────────────────────────────────── */
async function main() {
  console.log(`\nMeilisearch indexer — ${host}\n`);

  const index = await ensureIndex();

  // Discover translations: use CLI args if given, otherwise scan directory
  const available = dirs(TRANSLATIONS_DIR);
  const requested = process.argv.slice(2).map((a) => a.toLowerCase());
  const targets   = requested.length
    ? requested.filter((t) => {
        if (!available.includes(t)) {
          console.warn(`  Warning: translation "${t}" not found in translations dir, skipping.`);
          return false;
        }
        return true;
      })
    : available;

  if (!targets.length) {
    console.error("No translations to index.");
    process.exit(1);
  }

  console.log(`Translations to index: ${targets.join(", ")}\n`);

  for (const t of targets) {
    process.stdout.write(`Building docs for ${t.toUpperCase()}… `);
    const docs = buildDocs(t);
    console.log(`${docs.length} verses`);

    // Upload in batches so we don't hit payload limits
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE);
      const pct   = Math.round(((i + batch.length) / docs.length) * 100);
      process.stdout.write(`  Uploading batch ${Math.ceil((i + 1) / BATCH_SIZE)}… ${pct}%\r`);
      const { taskUid } = await index.addDocuments(batch);
      await waitForTask(index, taskUid);
    }
    console.log(`  ${t.toUpperCase()} done.                    `);
  }

  console.log("\nAll done. Index is ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
