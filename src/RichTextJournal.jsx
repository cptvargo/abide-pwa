import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useEffect, useRef } from "react";

/* ── Book name → file ID lookup ── */
const BOOK_TO_ID = {
  "genesis":"genesis","gen":"genesis",
  "exodus":"exodus","ex":"exodus","exo":"exodus",
  "leviticus":"leviticus","lev":"leviticus",
  "numbers":"numbers","num":"numbers",
  "deuteronomy":"deuteronomy","deut":"deuteronomy","deu":"deuteronomy",
  "joshua":"joshua","josh":"joshua",
  "judges":"judges","judg":"judges",
  "ruth":"ruth",
  "1 samuel":"1samuel","1samuel":"1samuel","1 sam":"1samuel","1sam":"1samuel",
  "2 samuel":"2samuel","2samuel":"2samuel","2 sam":"2samuel","2sam":"2samuel",
  "1 kings":"1kings","1kings":"1kings","1 kgs":"1kings","1kgs":"1kings",
  "2 kings":"2kings","2kings":"2kings","2 kgs":"2kings","2kgs":"2kings",
  "1 chronicles":"1chronicles","1chronicles":"1chronicles","1 chron":"1chronicles","1chron":"1chronicles",
  "2 chronicles":"2chronicles","2chronicles":"2chronicles","2 chron":"2chronicles","2chron":"2chronicles",
  "ezra":"ezra","nehemiah":"nehemiah","neh":"nehemiah",
  "esther":"esther","esth":"esther",
  "job":"job",
  "psalms":"psalms","psalm":"psalms","ps":"psalms","psa":"psalms",
  "proverbs":"proverbs","prov":"proverbs","pro":"proverbs",
  "ecclesiastes":"ecclesiastes","eccl":"ecclesiastes","ecc":"ecclesiastes",
  "song of solomon":"songofsolomon","songofsolomon":"songofsolomon","song":"songofsolomon","sos":"songofsolomon",
  "isaiah":"isaiah","isa":"isaiah",
  "jeremiah":"jeremiah","jer":"jeremiah",
  "lamentations":"lamentations","lam":"lamentations",
  "ezekiel":"ezekiel","ezek":"ezekiel",
  "daniel":"daniel","dan":"daniel",
  "hosea":"hosea","hos":"hosea",
  "joel":"joel","amos":"amos",
  "obadiah":"obadiah","obad":"obadiah",
  "jonah":"jonah","jon":"jonah",
  "micah":"micah","mic":"micah",
  "nahum":"nahum","nah":"nahum",
  "habakkuk":"habakkuk","hab":"habakkuk",
  "zephaniah":"zephaniah","zeph":"zephaniah",
  "haggai":"haggai","hag":"haggai",
  "zechariah":"zechariah","zech":"zechariah",
  "malachi":"malachi","mal":"malachi",
  "matthew":"matthew","matt":"matthew","mat":"matthew",
  "mark":"mark","luke":"luke","john":"john","acts":"acts",
  "romans":"romans","rom":"romans",
  "1 corinthians":"1corinthians","1corinthians":"1corinthians","1 cor":"1corinthians","1cor":"1corinthians",
  "2 corinthians":"2corinthians","2corinthians":"2corinthians","2 cor":"2corinthians","2cor":"2corinthians",
  "galatians":"galatians","gal":"galatians",
  "ephesians":"ephesians","eph":"ephesians",
  "philippians":"philippians","phil":"philippians",
  "colossians":"colossians","col":"colossians",
  "1 thessalonians":"1thessalonians","1thessalonians":"1thessalonians","1 thess":"1thessalonians","1thess":"1thessalonians",
  "2 thessalonians":"2thessalonians","2thessalonians":"2thessalonians","2 thess":"2thessalonians","2thess":"2thessalonians",
  "1 timothy":"1timothy","1timothy":"1timothy","1 tim":"1timothy","1tim":"1timothy",
  "2 timothy":"2timothy","2timothy":"2timothy","2 tim":"2timothy","2tim":"2timothy",
  "titus":"titus","tit":"titus",
  "philemon":"philemon","phlm":"philemon",
  "hebrews":"hebrews","heb":"hebrews",
  "james":"james","jas":"james",
  "1 peter":"1peter","1peter":"1peter","1 pet":"1peter","1pet":"1peter",
  "2 peter":"2peter","2peter":"2peter","2 pet":"2peter","2pet":"2peter",
  "1 john":"1john","1john":"1john","1 jn":"1john","1jn":"1john",
  "2 john":"2john","2john":"2john","2 jn":"2john","2jn":"2john",
  "3 john":"3john","3john":"3john","3 jn":"3john","3jn":"3john",
  "jude":"jude",
  "revelation":"revelation","rev":"revelation",
};

function parseRef(refStr) {
  const clean = refStr.trim();
  // Greedy match: everything up to last "space number" is the book
  const m = clean.match(/^(.*)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!m) return null;
  const bookId = BOOK_TO_ID[m[1].toLowerCase().trim()];
  if (!bookId) return null;
  return {
    bookId,
    chapter: parseInt(m[2]),
    startVerse: m[3] ? parseInt(m[3]) : null,
    endVerse: m[4] ? parseInt(m[4]) : null,
  };
}

async function fetchVerseText(bookId, chapter, startVerse, endVerse, translation) {
  if (!startVerse) return null;
  try {
    const base = import.meta.env.BASE_URL;
    const path = `${base}data/translations/${translation.toLowerCase()}/${bookId}/${chapter}.json`;
    const res = await fetch(path);
    if (!res.ok) return null;
    const data = await res.json();
    const verses = data.verses || data;
    if (Array.isArray(verses)) {
      return verses
        .filter((v) => v.verse >= startVerse && v.verse <= (endVerse ?? startVerse))
        .map((v) => v.text)
        .join(" ") || null;
    }
    if (typeof verses === "object") {
      const texts = [];
      for (let v = startVerse; v <= (endVerse ?? startVerse); v++) {
        if (verses[String(v)]) texts.push(verses[String(v)]);
      }
      return texts.join(" ") || null;
    }
    return null;
  } catch {
    return null;
  }
}

export default function RichTextJournal({
  initialText = "",
  initialScriptureRef = "",
  initialVerseText = null,
  initialVerseTranslation = null,
  translation = "KJV",
  onSave,
  onClose,
}) {
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [scriptureRef, setScriptureRef] = useState(initialScriptureRef);
  const [versePreview, setVersePreview] = useState(initialVerseText);
  const [verseFetching, setVerseFetching] = useState(false);
  const debounceRef = useRef(null);
  const activeTranslation = initialVerseTranslation || translation;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      CharacterCount.configure({ limit: 100000 }),
      Placeholder.configure({ placeholder: "Start typing here…" }),
    ],
    content: initialText || "<p></p>",
    editorProps: {
      attributes: {
        class: "prose prose-lg focus:outline-none max-w-none px-6 py-4 min-h-[300px]",
      },
    },
  });

  // Debounced verse fetch when user types a scripture reference
  useEffect(() => {
    const ref = scriptureRef.trim();
    if (!ref) {
      setVersePreview(null);
      return;
    }

    // If we already have a preview for this ref (e.g., from initialVerseText), skip fetch
    if (ref === initialScriptureRef && versePreview) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const parsed = parseRef(ref);
      if (!parsed || !parsed.startVerse) {
        setVersePreview(null);
        return;
      }
      setVerseFetching(true);
      const text = await fetchVerseText(
        parsed.bookId,
        parsed.chapter,
        parsed.startVerse,
        parsed.endVerse,
        activeTranslation,
      );
      setVerseFetching(false);
      setVersePreview(text);
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [scriptureRef]);

  const handleSave = () => {
    if (editor) {
      const html = editor.getHTML();
      const text = editor.getText();
      const ref = scriptureRef.trim() || null;
      onSave({
        html,
        text,
        scripture: ref,
        verseText: ref ? versePreview : null,
        verseTranslation: ref ? activeTranslation : null,
      });
    }
  };

  if (!editor) return null;

  const wordCount = editor.storage.characterCount.words();
  const charCount = editor.storage.characterCount.characters();

  return (
    <div
      className="fixed inset-0 z-[60] bg-[var(--bg-menu)] text-[var(--text-primary)] flex flex-col"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-[var(--text-accent)]/20">
        <span className="text-sm opacity-70">{new Date().toLocaleString()}</span>
        <button
          className="text-[var(--text-accent)] font-semibold"
          onClick={() => {
            handleSave();
            onClose();
          }}
        >
          Done
        </button>
      </div>

      {/* Scripture Reference Input */}
      <div className="px-5 pt-3 pb-2 border-b border-[var(--text-accent)]/10">
        <div className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 shrink-0 opacity-50"
            fill="currentColor"
            style={{ color: "var(--text-accent)" }}
          >
            <path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z" />
            <path d="M17 4h3v16h-3" />
          </svg>
          <input
            type="text"
            value={scriptureRef}
            onChange={(e) => setScriptureRef(e.target.value)}
            placeholder="Scripture reference (e.g. John 3:16)"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          {verseFetching && (
            <span className="text-xs opacity-40" style={{ color: "var(--text-primary)" }}>
              …
            </span>
          )}
          {scriptureRef && !verseFetching && (
            <button
              onClick={() => { setScriptureRef(""); setVersePreview(null); }}
              className="text-xs opacity-40 hover:opacity-70"
              style={{ color: "var(--text-primary)" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Verse preview */}
        {versePreview && (
          <div
            className="mt-2 px-3 py-2 rounded-lg text-sm italic"
            style={{
              background: "rgba(var(--accent-rgb), 0.08)",
              color: "var(--text-primary)",
              borderLeft: "2px solid var(--text-accent)",
            }}
          >
            "{versePreview}"
            <span className="ml-2 text-xs not-italic opacity-50">
              {activeTranslation}
            </span>
          </div>
        )}
      </div>

      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 px-5 py-3 border-b border-[var(--text-accent)]/10 overflow-x-auto">
        {/* Aa Button */}
        <button
          onClick={() => setShowFormatMenu(!showFormatMenu)}
          className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition flex flex-col items-center ${
            showFormatMenu
              ? "bg-[var(--text-accent)] text-[var(--text-inverse)]"
              : "bg-[var(--text-primary)]/5 text-[var(--text-primary)] hover:bg-[var(--text-primary)]/10"
          }`}
        >
          <span className="text-base">Aa</span>
          <span className="text-[9px] opacity-60 mt-0.5">Format</span>
        </button>

        {/* Bold */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded-lg transition flex flex-col items-center ${
            editor.isActive("bold")
              ? "bg-[var(--text-accent)]/20 text-[var(--text-accent)]"
              : "hover:bg-[var(--text-primary)]/5 text-[var(--text-primary)]"
          }`}
        >
          <strong className="text-base">B</strong>
          <span className="text-[9px] opacity-60 mt-0.5">Bold</span>
        </button>

        {/* Italic */}
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded-lg transition flex flex-col items-center ${
            editor.isActive("italic")
              ? "bg-[var(--text-accent)]/20 text-[var(--text-accent)]"
              : "hover:bg-[var(--text-primary)]/5 text-[var(--text-primary)]"
          }`}
        >
          <em className="text-base">I</em>
          <span className="text-[9px] opacity-60 mt-0.5">Italic</span>
        </button>

        {/* Underline */}
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-3 py-1.5 rounded-lg transition flex flex-col items-center ${
            editor.isActive("underline")
              ? "bg-[var(--text-accent)]/20 text-[var(--text-accent)]"
              : "hover:bg-[var(--text-primary)]/5 text-[var(--text-primary)]"
          }`}
        >
          <span className="underline text-base">U</span>
          <span className="text-[9px] opacity-60 mt-0.5">Underline</span>
        </button>

        {/* Quote */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1.5 rounded-lg transition flex flex-col items-center ${
            editor.isActive("blockquote")
              ? "bg-[var(--text-accent)]/20 text-[var(--text-accent)]"
              : "hover:bg-[var(--text-primary)]/5 text-[var(--text-primary)]"
          }`}
        >
          <span className="text-lg leading-none">"</span>
          <span className="text-[9px] opacity-60 mt-0.5">Quote</span>
        </button>

        {/* List */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded-lg transition flex flex-col items-center ${
            editor.isActive("bulletList")
              ? "bg-[var(--text-accent)]/20 text-[var(--text-accent)]"
              : "hover:bg-[var(--text-primary)]/5 text-[var(--text-primary)]"
          }`}
        >
          <span className="text-base leading-none">•</span>
          <span className="text-[9px] opacity-60 mt-0.5">List</span>
        </button>

        {/* Numbered List */}
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 rounded-lg transition flex flex-col items-center ${
            editor.isActive("orderedList")
              ? "bg-[var(--text-accent)]/20 text-[var(--text-accent)]"
              : "hover:bg-[var(--text-primary)]/5 text-[var(--text-primary)]"
          }`}
        >
          <span className="text-base leading-none font-mono">1.</span>
          <span className="text-[9px] opacity-60 mt-0.5">Numbers</span>
        </button>
      </div>

      {/* Format Menu Dropdown */}
      {showFormatMenu && (
        <div className="mx-5 mt-2 rounded-lg bg-[var(--text-primary)]/5 border border-[var(--text-accent)]/10 overflow-hidden">
          <button
            onClick={() => { editor.chain().toggleHeading({ level: 1 }).run(); setShowFormatMenu(false); }}
            className={`w-full px-4 py-3 text-left transition border-b border-[var(--text-accent)]/5 ${editor.isActive("heading", { level: 1 }) ? "bg-[var(--text-accent)]/10" : "hover:bg-[var(--text-primary)]/5"}`}
          >
            <div className="text-2xl font-bold text-[var(--text-primary)]">Heading 1</div>
            <div className="text-xs text-[var(--text-primary)]/50 mt-1">Large title</div>
          </button>

          <button
            onClick={() => { editor.chain().toggleHeading({ level: 2 }).run(); setShowFormatMenu(false); }}
            className={`w-full px-4 py-3 text-left transition border-b border-[var(--text-accent)]/5 ${editor.isActive("heading", { level: 2 }) ? "bg-[var(--text-accent)]/10" : "hover:bg-[var(--text-primary)]/5"}`}
          >
            <div className="text-xl font-bold text-[var(--text-primary)]">Heading 2</div>
            <div className="text-xs text-[var(--text-primary)]/50 mt-1">Section title</div>
          </button>

          <button
            onClick={() => { editor.chain().toggleHeading({ level: 3 }).run(); setShowFormatMenu(false); }}
            className={`w-full px-4 py-3 text-left transition border-b border-[var(--text-accent)]/5 ${editor.isActive("heading", { level: 3 }) ? "bg-[var(--text-accent)]/10" : "hover:bg-[var(--text-primary)]/5"}`}
          >
            <div className="text-lg font-semibold text-[var(--text-primary)]">Heading 3</div>
            <div className="text-xs text-[var(--text-primary)]/50 mt-1">Subsection</div>
          </button>

          <button
            onClick={() => { editor.chain().setParagraph().run(); setShowFormatMenu(false); }}
            className="w-full px-4 py-3 text-left hover:bg-[var(--text-primary)]/5 transition"
          >
            <div className="text-base text-[var(--text-primary)]">Body</div>
            <div className="text-xs text-[var(--text-primary)]/50 mt-1">Normal text</div>
          </button>
        </div>
      )}

      {/* Rich Text Editor */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Stats Footer */}
      <div className="flex justify-between items-center px-6 py-2 text-xs text-[var(--text-primary)]/50 border-t border-[var(--text-accent)]/10">
        <div>
          {wordCount} {wordCount === 1 ? "word" : "words"} • {charCount}{" "}
          {charCount === 1 ? "character" : "characters"}
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="hover:text-[var(--text-accent)] disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (⌘Z)"
          >
            ↶ Undo
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="hover:text-[var(--text-accent)] disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (⌘⇧Z)"
          >
            ↷ Redo
          </button>
        </div>
      </div>
    </div>
  );
}
