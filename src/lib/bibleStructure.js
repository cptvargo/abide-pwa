export const BIBLE_ORDER = [
  "genesis","exodus","leviticus","numbers","deuteronomy",
  "joshua","judges","ruth","1samuel","2samuel",
  "1kings","2kings","1chronicles","2chronicles",
  "ezra","nehemiah","esther","job","psalms","proverbs",
  "ecclesiastes","songofsolomon","isaiah","jeremiah",
  "lamentations","ezekiel","daniel","hosea","joel",
  "amos","obadiah","jonah","micah","nahum","habakkuk",
  "zephaniah","haggai","zechariah","malachi",
  "matthew","mark","luke","john","acts","romans",
  "1corinthians","2corinthians","galatians","ephesians",
  "philippians","colossians","1thessalonians","2thessalonians",
  "1timothy","2timothy","titus","philemon","hebrews",
  "james","1peter","2peter","1john","2john","3john",
  "jude","revelation"
];

export const CHAPTER_COUNT = {
  genesis: 50, exodus: 40, leviticus: 27, numbers: 36, deuteronomy: 34,
  joshua: 24, judges: 21, ruth: 4, "1samuel": 31, "2samuel": 24,
  "1kings": 22, "2kings": 25, "1chronicles": 29, "2chronicles": 36,
  ezra: 10, nehemiah: 13, esther: 10, job: 42, psalms: 150,
  proverbs: 31, ecclesiastes: 12, songofsolomon: 8,
  isaiah: 66, jeremiah: 52, lamentations: 5, ezekiel: 48, daniel: 12,
  hosea: 14, joel: 3, amos: 9, obadiah: 1, jonah: 4, micah: 7,
  nahum: 3, habakkuk: 3, zephaniah: 3, haggai: 2, zechariah: 14,
  malachi: 4, matthew: 28, mark: 16, luke: 24, john: 21,
  acts: 28, romans: 16, "1corinthians": 16, "2corinthians": 13,
  galatians: 6, ephesians: 6, philippians: 4, colossians: 4,
  "1thessalonians": 5, "2thessalonians": 3,
  "1timothy": 6, "2timothy": 4, titus: 3, philemon: 1,
  hebrews: 13, james: 5, "1peter": 5, "2peter": 3,
  "1john": 5, "2john": 1, "3john": 1, jude: 1,
  revelation: 22
};

/* ===============================
   Centralized display name lookup
   Import getBookDisplayName anywhere
   you need to show a formatted book name.
================================ */
export const BOOK_DISPLAY_NAMES = {
  "1samuel":        "1 Samuel",
  "2samuel":        "2 Samuel",
  "1kings":         "1 Kings",
  "2kings":         "2 Kings",
  "1chronicles":    "1 Chronicles",
  "2chronicles":    "2 Chronicles",
  "songofsolomon":  "Song of Solomon",
  "1corinthians":   "1 Corinthians",
  "2corinthians":   "2 Corinthians",
  "1thessalonians": "1 Thessalonians",
  "2thessalonians": "2 Thessalonians",
  "1timothy":       "1 Timothy",
  "2timothy":       "2 Timothy",
  "1peter":         "1 Peter",
  "2peter":         "2 Peter",
  "1john":          "1 John",
  "2john":          "2 John",
  "3john":          "3 John",
};

/**
 * getBookDisplayName("1john")       → "1 John"
 * getBookDisplayName("genesis")     → "Genesis"
 * getBookDisplayName("songofsolomon") → "Song of Solomon"
 */
export function getBookDisplayName(bookId) {
  if (!bookId) return "";
  return (
    BOOK_DISPLAY_NAMES[bookId] ??
    bookId.charAt(0).toUpperCase() + bookId.slice(1)
  );
}