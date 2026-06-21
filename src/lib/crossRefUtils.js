// Utilities for parsing and displaying cross-reference strings.
// Format: "bookslug chapter:verse"  e.g. "john 3:16", "psalms 119:1"

export const CROSS_REF_DISPLAY_NAMES = {
  "1samuel": "1 Samuel",
  "2samuel": "2 Samuel",
  "1kings": "1 Kings",
  "2kings": "2 Kings",
  "1chronicles": "1 Chronicles",
  "2chronicles": "2 Chronicles",
  "1corinthians": "1 Corinthians",
  "2corinthians": "2 Corinthians",
  "1thessalonians": "1 Thessalonians",
  "2thessalonians": "2 Thessalonians",
  "1timothy": "1 Timothy",
  "2timothy": "2 Timothy",
  "1peter": "1 Peter",
  "2peter": "2 Peter",
  "1john": "1 John",
  "2john": "2 John",
  "3john": "3 John",
  songofsolomon: "Song of Solomon",
};

export function formatRefDisplay(ref) {
  const spaceIdx = ref.indexOf(" ");
  if (spaceIdx === -1) return ref;
  const slug = ref.slice(0, spaceIdx);
  const location = ref.slice(spaceIdx + 1);
  const displayBook =
    CROSS_REF_DISPLAY_NAMES[slug] ||
    slug.charAt(0).toUpperCase() + slug.slice(1);
  return `${displayBook} ${location}`;
}

// Returns null if ref is malformed (no space separator).
export function parseRef(ref) {
  const spaceIdx = ref.indexOf(" ");
  if (spaceIdx === -1) return null;
  const bookSlug = ref.slice(0, spaceIdx);
  const location = ref.slice(spaceIdx + 1);
  const [chapterStr, verseStr] = location.split(":");
  const chapter = parseInt(chapterStr);
  const verse = verseStr ? parseInt(verseStr.split("-")[0]) : 1;
  return { bookSlug, chapter, verse };
}
