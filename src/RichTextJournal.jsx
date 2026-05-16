import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useEffect, useRef } from "react";
import { getDictionaryEntries } from "./components/AbideDictionary";

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

// Broad regex to detect potential verse references typed inline
// Requires book name to start with uppercase, reducing false positives
const VERSE_RE = /\b(?:(?:1|2|3)\s+)?[A-Z][a-z]+(?:\s+[A-Za-z]+)?\s+\d+:\d+(?:-\d+)?\b/g;

export default function RichTextJournal({
  initialText = "",
  initialScriptureRef = "",
  initialVerseText = null,
  initialVerseTranslation = null,
  translation = "KJV",
  onSave,
  onClose,
  scratchpadMode = false,
  onMinimize,
  onDraftChange,
}) {
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [verseSuggestion, setVerseSuggestion] = useState(null);
  const [showDictPicker, setShowDictPicker] = useState(false);
  const [dictSearch, setDictSearch] = useState("");
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const scanRef = useRef(null);
  const autoSaveRef = useRef(null);
  const dismissedRefs = useRef(new Set());

  // Track keyboard height via visualViewport so content stays above keyboard
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    function onResize() {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardOffset(offset);
    }
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Start typing your notes…" }),
    ],
    content: scratchpadMode
      ? (localStorage.getItem("scratchpad_draft") || "<p></p>")
      : (initialText || "<p></p>"),
    editorProps: {
      attributes: {
        class: "prose prose-lg focus:outline-none max-w-none px-6 py-4 min-h-[300px]",
      },
    },
  });

  // Scan editor text for verse references and show a suggestion chip
  useEffect(() => {
    if (!editor) return;

    function handleUpdate() {
      clearTimeout(scanRef.current);
      scanRef.current = setTimeout(async () => {
        const editorText = editor.getText();
        VERSE_RE.lastIndex = 0;
        const matches = [...editorText.matchAll(VERSE_RE)];
        if (!matches.length) {
          setVerseSuggestion(null);
          return;
        }

        // Use the last (most recently typed) match
        const refStr = matches[matches.length - 1][0];

        // Skip refs the user already dismissed
        if (dismissedRefs.current.has(refStr)) return;

        // Skip if already inserted as a blockquote attribution in the editor
        if (editorText.includes(`— ${refStr}`)) {
          dismissedRefs.current.add(refStr);
          return;
        }

        // Skip if it's already the active suggestion
        if (verseSuggestion?.ref === refStr) return;

        const parsed = parseRef(refStr);
        if (!parsed?.startVerse) { setVerseSuggestion(null); return; }

        const verseText = await fetchVerseText(
          parsed.bookId, parsed.chapter,
          parsed.startVerse, parsed.endVerse,
          translation,
        );
        if (verseText) {
          setVerseSuggestion({ ref: refStr, text: verseText });
        }
      }, 800);
    }

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
      clearTimeout(scanRef.current);
    };
  }, [editor, translation, verseSuggestion]);

  // Auto-save draft to localStorage in scratchpad mode
  useEffect(() => {
    if (!editor || !scratchpadMode) return;
    function onUpdate() {
      clearTimeout(autoSaveRef.current);
      autoSaveRef.current = setTimeout(() => {
        const html = editor.getHTML();
        localStorage.setItem("scratchpad_draft", html);
        onDraftChange?.(editor.getText().trim().length > 0);
      }, 800);
    }
    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
      clearTimeout(autoSaveRef.current);
    };
  }, [editor, scratchpadMode]);

  const handleSave = () => {
    if (editor) {
      onSave({
        html: editor.getHTML(),
        text: editor.getText(),
        scripture: initialScriptureRef || null,
        verseText: initialVerseText || null,
        verseTranslation: initialVerseTranslation || null,
      });
    }
  };

  function handleScratchpadSave() {
    if (!editor) return;
    onSave({ html: editor.getHTML(), text: editor.getText() });
    localStorage.removeItem("scratchpad_draft");
    onDraftChange?.(false);
    editor.commands.clearContent();
  }

  function insertVerse() {
    if (!editor || !verseSuggestion) return;
    const { ref, text } = verseSuggestion;

    const blockquote = [
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", marks: [{ type: "italic" }], text: `"${text}"` }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: `— ${ref} (${translation})` }],
          },
        ],
      },
    ];

    // Find the typed reference in the document and replace it with the blockquote
    const { doc } = editor.state;
    let from = -1, to = -1;
    doc.descendants((node, pos) => {
      if (from !== -1) return false;
      if (node.isText && node.text.includes(ref)) {
        const idx = node.text.indexOf(ref);
        from = pos + idx;
        to = from + ref.length;
        return false;
      }
    });

    if (from !== -1) {
      editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, blockquote).run();
    } else {
      editor.chain().focus().insertContent(blockquote).run();
    }

    dismissedRefs.current.add(ref);
    setVerseSuggestion(null);
  }

  function dismissSuggestion() {
    if (verseSuggestion) dismissedRefs.current.add(verseSuggestion.ref);
    setVerseSuggestion(null);
  }

  if (!editor) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col overflow-hidden"
      style={{
        background: "var(--bg-menu)",
        color: "var(--text-primary)",
        paddingTop: "env(safe-area-inset-top)",
        // Shrink from bottom as keyboard opens; fall back to safe area when closed
        paddingBottom: keyboardOffset > 0
          ? `${keyboardOffset}px`
          : "env(safe-area-inset-bottom)",
      }}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center px-5 py-4 shrink-0"
        style={{ borderBottom: "1px solid rgba(var(--accent-rgb),0.15)" }}
      >
        {scratchpadMode ? (
          <>
            <button
              onClick={onMinimize}
              className="flex items-center gap-1.5 text-sm transition active:scale-95"
              style={{ color: "var(--text-primary)", opacity: 0.55 }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
              Minimize
            </button>
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: "var(--text-accent)", opacity: 0.7 }}
            >
              Notes
            </span>
            <button
              className="font-semibold text-sm px-3 py-1.5 rounded-lg transition active:scale-95"
              style={{ background: "var(--text-accent)", color: "var(--text-inverse)" }}
              onClick={handleScratchpadSave}
            >
              Save to Notes
            </button>
          </>
        ) : (
          <>
            <span className="text-sm opacity-60">{new Date().toLocaleString()}</span>
            <button
              className="font-semibold text-sm"
              style={{ color: "var(--text-accent)" }}
              onClick={() => { handleSave(); onClose(); }}
            >
              Done
            </button>
          </>
        )}
      </div>

      {/* Formatting Toolbar */}
      <div
        className="flex items-center gap-1 px-5 py-3 overflow-x-auto shrink-0"
        style={{ borderBottom: "1px solid rgba(var(--accent-rgb),0.10)" }}
      >
        {/* Aa / Format */}
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

        {/* Bullet List */}
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

        {/* Dictionary */}
        <button
          onClick={() => { setShowDictPicker(true); setDictSearch(""); }}
          className={`px-3 py-1.5 rounded-lg transition flex flex-col items-center ${
            showDictPicker
              ? "bg-[var(--text-accent)]/20 text-[var(--text-accent)]"
              : "hover:bg-[var(--text-primary)]/5 text-[var(--text-primary)]"
          }`}
        >
          <span className="text-base leading-none">◉</span>
          <span className="text-[9px] opacity-60 mt-0.5">Dict</span>
        </button>
      </div>

      {/* Format Menu Dropdown */}
      {showFormatMenu && (
        <div
          className="mx-5 mt-2 rounded-lg overflow-hidden shrink-0"
          style={{
            background: "rgba(var(--accent-rgb),0.06)",
            border: "1px solid rgba(var(--accent-rgb),0.12)",
          }}
        >
          {[
            { label: "Heading 1", size: "text-2xl font-bold", level: 1, hint: "Large title" },
            { label: "Heading 2", size: "text-xl font-bold", level: 2, hint: "Section title" },
            { label: "Heading 3", size: "text-lg font-semibold", level: 3, hint: "Subsection" },
          ].map(({ label, size, level, hint }) => (
            <button
              key={level}
              onClick={() => { editor.chain().toggleHeading({ level }).run(); setShowFormatMenu(false); }}
              className={`w-full px-4 py-3 text-left transition border-b border-[var(--text-accent)]/5 ${
                editor.isActive("heading", { level })
                  ? "bg-[var(--text-accent)]/10"
                  : "hover:bg-[var(--text-primary)]/5"
              }`}
            >
              <div className={`${size} text-[var(--text-primary)]`}>{label}</div>
              <div className="text-xs text-[var(--text-primary)]/50 mt-0.5">{hint}</div>
            </button>
          ))}
          <button
            onClick={() => { editor.chain().setParagraph().run(); setShowFormatMenu(false); }}
            className="w-full px-4 py-3 text-left hover:bg-[var(--text-primary)]/5 transition"
          >
            <div className="text-base text-[var(--text-primary)]">Body</div>
            <div className="text-xs text-[var(--text-primary)]/50 mt-0.5">Normal text</div>
          </button>
        </div>
      )}

      {/* Inline verse suggestion chip */}
      {verseSuggestion && (
        <div
          className="mx-4 mt-2 shrink-0 rounded-xl overflow-hidden"
          style={{
            background: "rgba(var(--accent-rgb),0.07)",
            border: "1px solid rgba(var(--accent-rgb),0.18)",
            borderLeft: "3px solid var(--text-accent)",
          }}
        >
          <div className="px-4 pt-3 pb-3">
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <p
                className="flex-1 text-sm italic leading-relaxed"
                style={{
                  color: "var(--text-primary)",
                  opacity: 0.88,
                  fontFamily: "var(--font-body, Georgia, serif)",
                }}
              >
                &ldquo;{verseSuggestion.text}&rdquo;
              </p>
              <button
                onClick={dismissSuggestion}
                className="shrink-0 text-xs opacity-35 hover:opacity-65 mt-0.5"
                style={{ color: "var(--text-primary)" }}
              >
                ✕
              </button>
            </div>
            <div
              className="flex items-center justify-between pt-2.5"
              style={{ borderTop: "1px solid rgba(var(--accent-rgb),0.10)" }}
            >
              <span
                className="text-[10px] font-bold tracking-widest uppercase opacity-50"
                style={{ color: "var(--text-accent)" }}
              >
                {translation}
              </span>
              <button
                onClick={insertVerse}
                className="text-xs font-semibold tracking-wide px-3 py-1.5 rounded-lg"
                style={{
                  background: "rgba(var(--accent-rgb),0.14)",
                  color: "var(--text-accent)",
                  border: "1px solid rgba(var(--accent-rgb),0.25)",
                }}
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rich Text Editor — scrollable area */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Dictionary picker sheet */}
      {showDictPicker && (
        <DictionaryPickerSheet
          search={dictSearch}
          onSearchChange={setDictSearch}
          onClose={() => setShowDictPicker(false)}
          onInsert={(entry) => {
            setShowDictPicker(false);
            const isQ = entry.type === "question";
            const word = isQ ? (entry.question || entry.query) : (entry.word || entry.query);
            const defText = isQ ? (entry.answer || "") : (entry.definition || "");
            const origWord = (!isQ && entry.originalLanguage?.word)
              ? ` · ${entry.originalLanguage.word} (${entry.originalLanguage.transliteration || ""})`
              : "";
            const noteText = entry.personalNote ? `\n\nMy note: ${entry.personalNote}` : "";
            const blockquote = {
              type: "blockquote",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: defText.slice(0, 280) + (defText.length > 280 ? "…" : "") }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", marks: [{ type: "italic" }], text: `— ${word}${origWord}` }],
                },
              ],
            };
            editor.chain().focus().insertContent(blockquote).run();
          }}
        />
      )}
    </div>
  );
}

// ── Dictionary picker sheet ───────────────────────────────────────────────────
function DictionaryPickerSheet({ search, onSearchChange, onClose, onInsert }) {
  const entries = getDictionaryEntries();
  const filtered = search.trim()
    ? entries.filter((e) =>
        (e.word || e.query || "").toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--bg-app, #141410)",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px",
          borderBottom: "1px solid rgba(var(--accent-rgb),0.10)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "rgba(var(--accent-rgb),0.08)",
            border: "1px solid rgba(var(--accent-rgb),0.15)",
            borderRadius: 100,
            padding: "6px 14px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-accent)",
            fontFamily: "var(--font-ui)",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.04em",
            cursor: "pointer",
            flexShrink: 0,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          ← Back to Journal
        </button>
        <div style={{ flex: 1 }} />
      </div>

      {/* Search */}
      {entries.length > 0 && (
        <div style={{ padding: "10px 16px 0", flexShrink: 0 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search words…"
            autoFocus
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "rgba(var(--accent-rgb),0.06)",
              border: "1px solid rgba(var(--accent-rgb),0.12)",
              borderRadius: 9,
              padding: "9px 12px",
              fontFamily: "var(--font-ui)",
              fontSize: 14,
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
        </div>
      )}

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px calc(env(safe-area-inset-bottom, 0px) + 24px)", WebkitOverflowScrolling: "touch" }}>
        {entries.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 28, opacity: 0.25, marginBottom: 12 }}>◉</div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontStyle: "italic",
                color: "var(--text-primary)",
                opacity: 0.4,
                lineHeight: 1.6,
              }}
            >
              No words saved yet.{"\n"}Search a word in Seek to build your dictionary.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontStyle: "italic", color: "var(--text-primary)", opacity: 0.4, textAlign: "center", paddingTop: 30 }}>
            No words match "{search}"
          </p>
        ) : (
          filtered.map((entry) => {
            const isQ = entry.type === "question";
            const word = isQ ? (entry.question || entry.query) : (entry.word || entry.query);
            const preview = isQ ? entry.answer : entry.definition;
            return (
              <button
                key={entry.id}
                onClick={() => onInsert(entry)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "rgba(var(--accent-rgb),0.05)",
                  border: "1px solid rgba(var(--accent-rgb),0.1)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  marginBottom: 8,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 14, color: "rgba(203,178,124,0.7)", flexShrink: 0, marginTop: 1 }}>
                  {isQ ? "✦" : "◉"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>
                      {word}
                    </span>
                    {!isQ && entry.originalLanguage?.word && (
                      <span style={{ fontFamily: "serif", fontSize: 14, color: "var(--text-accent)", opacity: 0.65 }}>
                        {entry.originalLanguage.word}
                      </span>
                    )}
                  </div>
                  {preview && (
                    <p style={{
                      fontFamily: "var(--font-body)", fontSize: 12, lineHeight: 1.5,
                      color: "var(--text-primary)", opacity: 0.45, margin: 0,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {typeof preview === "string" ? preview : ""}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: 14, color: "rgba(203,178,124,0.35)", flexShrink: 0, alignSelf: "center" }}>→</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
