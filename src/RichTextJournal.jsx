// RichTextJournal.jsx - Updated with Numbered List
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import { useState } from "react";

export default function RichTextJournal({ initialText = "", onSave, onClose }) {
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      CharacterCount.configure({
        limit: 100000,
      }),
      Placeholder.configure({
        placeholder: "Start typing here…",
      }),
    ],
    content: initialText || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-lg focus:outline-none max-w-none px-6 py-4 min-h-[400px]",
      },
    },
  });

  const handleSave = () => {
    if (editor) {
      const html = editor.getHTML();
      const text = editor.getText();
      onSave({ html, text });
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
        <span className="text-sm opacity-70">
          {new Date().toLocaleString()}
        </span>
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
            onClick={() => {
              editor.chain().toggleHeading({ level: 1 }).run();
              setShowFormatMenu(false);
            }}
            className={`w-full px-4 py-3 text-left transition border-b border-[var(--text-accent)]/5 ${
              editor.isActive("heading", { level: 1 })
                ? "bg-[var(--text-accent)]/10"
                : "hover:bg-[var(--text-primary)]/5"
            }`}
          >
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              Heading 1
            </div>
            <div className="text-xs text-[var(--text-primary)]/50 mt-1">
              Large title
            </div>
          </button>

          <button
            onClick={() => {
              editor.chain().toggleHeading({ level: 2 }).run();
              setShowFormatMenu(false);
            }}
            className={`w-full px-4 py-3 text-left transition border-b border-[var(--text-accent)]/5 ${
              editor.isActive("heading", { level: 2 })
                ? "bg-[var(--text-accent)]/10"
                : "hover:bg-[var(--text-primary)]/5"
            }`}
          >
            <div className="text-xl font-bold text-[var(--text-primary)]">
              Heading 2
            </div>
            <div className="text-xs text-[var(--text-primary)]/50 mt-1">
              Section title
            </div>
          </button>

          <button
            onClick={() => {
              editor.chain().toggleHeading({ level: 3 }).run();
              setShowFormatMenu(false);
            }}
            className={`w-full px-4 py-3 text-left transition border-b border-[var(--text-accent)]/5 ${
              editor.isActive("heading", { level: 3 })
                ? "bg-[var(--text-accent)]/10"
                : "hover:bg-[var(--text-primary)]/5"
            }`}
          >
            <div className="text-lg font-semibold text-[var(--text-primary)]">
              Heading 3
            </div>
            <div className="text-xs text-[var(--text-primary)]/50 mt-1">
              Subsection
            </div>
          </button>

          <button
            onClick={() => {
              editor.chain().setParagraph().run();
              setShowFormatMenu(false);
            }}
            className="w-full px-4 py-3 text-left hover:bg-[var(--text-primary)]/5 transition"
          >
            <div className="text-base text-[var(--text-primary)]">Body</div>
            <div className="text-xs text-[var(--text-primary)]/50 mt-1">
              Normal text
            </div>
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
