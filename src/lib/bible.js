// Load KJV (single file) or VSV (per book)
export async function loadChapter(book, chapter, translation = "vsv") {
  book = capitalize(book);

  if (translation === "kjv") {
    return await loadKJVChapter(book, chapter);
  } else {
    return await loadVSVChapter(book, chapter);
  }
}

/* ------------------------------
   VSV Loader (per-book)
--------------------------------*/
async function loadVSVChapter(book, chapter) {
  const path = `/data/vsv/${book.toLowerCase()}/${chapter}.json`;
  const res = await fetch(path);
  const data = await res.json();

  const chapterData = data.chapters[String(chapter)];

  if (!chapterData) throw new Error(`Missing chapter ${chapter}`);

  return Object.entries(chapterData).map(([verse, text]) => ({
    verse,
    text,
  }));
}

/* ------------------------------
   KJV Loader (single JSON)
--------------------------------*/
async function loadKJVChapter(book, chapter) {
  const path = "/public/data/kjv/verses-1769.json";
  const res = await fetch(path);
  const data = await res.json();

  const verses = [];
  const prefix = `${book} ${chapter}:`;

  for (const ref in data) {
    if (ref.startsWith(prefix)) {
      const verseNum = ref.split(":")[1].trim();
      verses.push({
        verse: verseNum,
        text: data[ref],
      });
    }
  }

  verses.sort((a, b) => Number(a.verse) - Number(b.verse));
  return verses;
}


/* ------------------------------
   Utility
--------------------------------*/
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}