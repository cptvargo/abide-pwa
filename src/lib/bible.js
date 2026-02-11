// lib/bible.js - Supports VSV, KJV, AKT, ASR translations

/* ------------------------------
   Main Load Function
--------------------------------*/
export async function loadChapter(book, chapter, translation = "vsv") {
  book = capitalize(book);

  // All translations now use split files
  return await loadSplitFileChapter(book, chapter, translation.toLowerCase());
}

/* ------------------------------
   Split File Loader (VSV, AKT, ASR)
   Format: { chapter, book, translation, title, verses: { "1": "...", "2": "..." }, metadata }
--------------------------------*/
async function loadSplitFileChapter(book, chapter, translation) {
  const base = import.meta.env.BASE_URL;
  const path = `${base}data/translations/${translation}/${book.toLowerCase()}/${chapter}.json`;
  
  const res = await fetch(path);

  if (!res.ok) {
    throw new Error(`Failed to load ${translation.toUpperCase()} ${book} ${chapter}`);
  }

  // Return the chapter file directly (already in correct format)
  return await res.json();
}

/* ------------------------------
   Utility
--------------------------------*/
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}