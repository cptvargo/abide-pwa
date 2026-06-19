/**
 * DialogueSystem.jsx - Dialoguing with God
 * Unified system for Scripture-linked dialogue (from highlights) and spontaneous entries
 */

import { useState, useEffect } from "react";
import { shareDialogueAsImage } from "./ShareAsImage";
import RichTextJournal from "./RichTextJournal";

// Capitalize first letter of each word — fixes entries saved with book.toLowerCase()
function fmtBook(b) {
  if (!b) return b;
  return b.replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
}

/* ===============================
   Data Management
================================ */
function loadDialogues() {
  const saved = localStorage.getItem("dialogues");
  return saved ? JSON.parse(saved) : [];
}

function saveDialogues(dialogues) {
  localStorage.setItem("dialogues", JSON.stringify(dialogues));
}

function groupByMonth(dialogues) {
  return dialogues.reduce((groups, entry) => {
    const date = new Date(entry.createdAt);
    const key = date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
    return groups;
  }, {});
}

/* ===============================
   Main Component
================================ */
export default function DialogueSystem({ theme, translation, onBack }) {
  const [dialogues, setDialogues] = useState(loadDialogues);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [creatingEntry, setCreatingEntry] = useState(false);
  const [editorText, setEditorText] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);

  // Save to localStorage whenever dialogues change
  useEffect(() => {
    saveDialogues(dialogues);
  }, [dialogues]);

  function deleteDialogue(id) {
    setDialogues((prev) => prev.filter((d) => d.id !== id));
  }

  function handleSaveEntry({ html, text, scripture, verseText, verseTranslation }) {
    if (!text.trim()) return;

    const newEntry = {
      id: Date.now().toString(),
      type: "spontaneous",
      reflection: html,
      text: text,
      ...(scripture ? { scripture, verseText, verseTranslation } : {}),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDialogues((prev) => [newEntry, ...prev]);
    setEditorText("");
    setEditingEntry(null);
    setCreatingEntry(false);
  }

  async function handleShareEntry(entry, shareType = "image") {
    // If user chose image or default to image
    if (shareType === "image") {
      const success = await shareDialogueAsImage(entry, theme);
      if (success) return; // Image share worked, we're done
    }

    // Image share failed — fall back to sharing just the reference so the
    // message field stays empty for the user to write their own message.
    // The image carries the content; we don't pre-fill the text field.
    let shareTitle = "";
    let shareText  = "";

    if (entry.type === "scripture" && entry.book && entry.chapter) {
      const ref = entry.verseRange
        ? `${fmtBook(entry.book)} ${entry.chapter}:${entry.verseRange}`
        : `${fmtBook(entry.book)} ${entry.chapter}`;
      shareTitle = ref;
      // text intentionally left empty — user writes their own message
    } else if ((entry.type === "journal" || entry.type === "spontaneous") && entry.scripture) {
      shareTitle = entry.scripture;
    } else {
      shareTitle = "Shared from ABIDE";
    }

    if (navigator.share) {
      navigator.share({ title: shareTitle, text: shareText }).catch(() => {});
    } else {
      // Clipboard fallback — only then include the content
      const clipText = [
        shareTitle,
        entry.verseText ? `"${entry.verseText}"` : "",
        entry.text || (entry.reflection || "").replace(/<[^>]*>/g, ""),
      ].filter(Boolean).join("\n\n");
      navigator.clipboard.writeText(clipText).then(() => {
        alert("Copied to clipboard!");
      });
    }
  }

  /* ===============================
     Render: Detail View
  ================================ */
  if (viewingEntry) {
    return (
      <DialogueDetail
        entry={viewingEntry}
        theme={theme}
        onBack={() => setViewingEntry(null)}
        onEdit={() => {
          setEditingEntry(viewingEntry);
          setEditorText(viewingEntry.reflection || viewingEntry.text || "");
          setCreatingEntry(true);
          deleteDialogue(viewingEntry.id);
          setViewingEntry(null);
        }}
        onDelete={() => {
          if (confirm("Delete this dialogue entry?")) {
            deleteDialogue(viewingEntry.id);
            setViewingEntry(null);
          }
        }}
        onShare={(shareType) => handleShareEntry(viewingEntry, shareType)}
      />
    );
  }

  /* ===============================
     Render: Index View
  ================================ */
  return (
    <div className="flex flex-col h-full relative">
      <style>{`
        .entry-preview { font-size: 0.875rem; line-height: 1.65; }
        .entry-preview h1 { font-size: 1.25em; font-weight: 700; line-height: 1.2; margin: 0 0 0.3em; color: var(--text-accent); }
        .entry-preview h2 { font-size: 1.08em; font-weight: 600; line-height: 1.25; margin: 0 0 0.25em; color: var(--text-accent); }
        .entry-preview h3 { font-size: 0.95em; font-weight: 600; line-height: 1.3; margin: 0 0 0.2em; color: var(--text-accent); opacity: 0.8; }
        .entry-preview p { margin: 0 0 0.3em; }
        .entry-preview p:last-child { margin-bottom: 0; }
        .entry-preview strong { font-weight: 600; }
        .entry-preview em { font-style: italic; }
        .entry-preview ul, .entry-preview ol { padding-left: 1.2em; margin: 0.2em 0; }
        .entry-preview li { margin: 0.1em 0; }
        .entry-preview blockquote { border-left: 2px solid var(--text-accent); padding-left: 0.75em; margin: 0.25em 0; opacity: 0.75; font-style: italic; }
      `}</style>

      {/* Fixed Header */}
      <div
        className="fixed top-0 left-0 right-0 z-10 border-b"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 24px)",
          paddingBottom: "24px",
          paddingLeft: "24px",
          paddingRight: "24px",
          background: "var(--bg-app)",
          borderColor: "rgba(var(--accent-rgb), 0.15)",
        }}
      >
        <button
          className="flex items-center gap-2 text-sm mb-4 opacity-70 hover:opacity-100 transition"
          onClick={onBack}
          style={{ color: "var(--text-accent)" }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Scripture
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              Dialoguing with God
            </h1>
            <p
              className="text-sm opacity-60"
              style={{ color: "var(--text-primary)" }}
            >
              Your highlights, reflections, and prayers
            </p>
          </div>

          {/* Decorative element */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(var(--accent-rgb), 0.1)",
              border: "2px solid rgba(var(--accent-rgb), 0.2)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: "var(--text-accent)" }}
            >
              <path d="M12 2a7 7 0 0 0-4 12c.6.6 1 1.5 1 2.5V18h6v-1.5c0-1 .4-1.9 1-2.5a7 7 0 0 0-4-12z" />
              <path d="M9 21h6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 160px)", // Header height + safe area
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="px-6 py-8 pb-24">
          {dialogues.length === 0 ? (
            <div
              className="text-center py-16 rounded-2xl"
              style={{
                background: "rgba(var(--accent-rgb), 0.05)",
                border: "1px dashed rgba(var(--accent-rgb), 0.2)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-16 h-16 mx-auto mb-4 opacity-30"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ color: "var(--text-accent)" }}
              >
                <path d="M12 2a7 7 0 0 0-4 12c.6.6 1 1.5 1 2.5V18h6v-1.5c0-1 .4-1.9 1-2.5a7 7 0 0 0-4-12z" />
                <path d="M9 21h6" />
              </svg>
              <p
                className="text-sm opacity-50"
                style={{ color: "var(--text-primary)" }}
              >
                No dialogue entries yet
              </p>
              <p
                className="text-xs opacity-40 mt-2"
                style={{ color: "var(--text-primary)" }}
              >
                Tap + to begin your spiritual journey
              </p>
            </div>
          ) : (
            Object.entries(groupByMonth(dialogues)).map(([month, entries]) => (
              <div key={month} className="mb-12">
                {/* Month Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="h-px flex-1"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, rgba(var(--accent-rgb), 0.3), transparent)",
                    }}
                  />
                  <h2
                    className="text-xs font-bold tracking-widest uppercase px-4 py-1 rounded-full"
                    style={{
                      color: "var(--text-accent)",
                      background: "rgba(var(--accent-rgb), 0.1)",
                    }}
                  >
                    {month}
                  </h2>
                  <div
                    className="h-px flex-1"
                    style={{
                      background:
                        "linear-gradient(to left, transparent, rgba(var(--accent-rgb), 0.3), transparent)",
                    }}
                  />
                </div>

                {/* Entries */}
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <DialogueCard
                      key={entry.id}
                      entry={entry}
                      theme={theme}
                      onView={() => setViewingEntry(entry)}
                      onShare={() => handleShareEntry(entry)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        {/* End inner content wrapper */}
      </div>
      {/* End Scrollable Content Container */}

      {/* Floating + Button */}
      <button
        onClick={() => setCreatingEntry(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        style={{
          background: "var(--text-accent)",
          color: "var(--text-inverse)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* Rich Text Editor Modal */}
      {creatingEntry && (
        <RichTextJournal
          initialText={editorText}
          initialScriptureRef={editingEntry?.scripture || ""}
          initialVerseText={editingEntry?.verseText || null}
          initialVerseTranslation={editingEntry?.verseTranslation || null}
          translation={translation}
          onSave={handleSaveEntry}
          onClose={() => {
            setCreatingEntry(false);
            setEditorText("");
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
}

/* ===============================
   Dialogue Card Component
================================ */
function DialogueCard({ entry, theme, onView, onShare }) {
  const date = new Date(entry.createdAt);
  const wordCount = (entry.text || "").trim().split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.round(wordCount / 180));

  const isScripture    = entry.type === "scripture";
  const isNotes        = entry.type === "journal";
  const isSpontaneous  = entry.type === "spontaneous";
  const isDevotional   = entry.type === "devotional";

  const accentColor = isScripture && entry.highlightColor?.color
    ? entry.highlightColor.color
    : null;

  /* ── Shared footer ── */
  const Footer = () => (
    <div
      className="flex items-center justify-between mt-3 pt-2.5"
      style={{ borderTop: "1px solid rgba(var(--accent-rgb),0.07)" }}
    >
      <span className="text-[10px] opacity-30" style={{ color: "var(--text-primary)" }}>
        {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        {" · "}
        {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
      </span>
      {wordCount > 10 && (
        <span className="text-[10px] opacity-20" style={{ color: "var(--text-primary)" }}>
          {readMin} min read
        </span>
      )}
    </div>
  );

  /* ── Shared share button ── */
  const ShareBtn = () => (
    <button
      onClick={(e) => { e.stopPropagation(); onShare(); }}
      className="ml-2 shrink-0 p-1.5 rounded-lg opacity-25 hover:opacity-65 transition-opacity"
      style={{ color: "var(--text-accent)" }}
      title="Share"
    >
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    </button>
  );

  /* ── Shared reflection preview ── */
  const Preview = ({ clamp = 3 }) => (
    <button onClick={onView} className="w-full text-left">
      <div
        className={`entry-preview line-clamp-${clamp}`}
        style={{
          color: "var(--text-primary)",
          opacity: 0.82,
          fontFamily: "var(--font-body, Georgia, serif)",
        }}
        dangerouslySetInnerHTML={{ __html: entry.reflection || entry.html || entry.text }}
      />
    </button>
  );

  /* ══════════════════════════════════
     SCRIPTURE DIALOGUE card
  ══════════════════════════════════ */
  if (isScripture) {
    return (
      <div
        className="rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: accentColor
            ? `linear-gradient(140deg, ${accentColor}16 0%, rgba(var(--accent-rgb),0.02) 55%)`
            : "rgba(var(--accent-rgb),0.03)",
          border: `1px solid ${accentColor ? `${accentColor}35` : "rgba(var(--accent-rgb),0.12)"}`,
          boxShadow: accentColor
            ? `0 3px 16px ${accentColor}18, 0 1px 4px rgba(0,0,0,0.08)`
            : "0 2px 14px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        {/* Top strip in highlight color */}
        <div style={{
          height: 3,
          background: accentColor
            ? `linear-gradient(to right, ${accentColor}, ${accentColor}44, transparent)`
            : `linear-gradient(to right, var(--text-accent), transparent)`,
        }} />

        <div className="px-4 pt-3.5 pb-4">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {/* Color swatch */}
              {accentColor && (
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}88` }}
                />
              )}
              <div>
                <div
                  className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: accentColor || "var(--text-accent)" }}
                >
                  Scripture Dialogue
                </div>
                {entry.book && entry.chapter && (
                  <div className="text-[10px] mt-0.5 opacity-60 flex items-center gap-1"
                    style={{ color: accentColor || "var(--text-accent)" }}>
                    <svg viewBox="0 0 24 24" className="w-2 h-2 shrink-0" fill="currentColor">
                      <path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z"/>
                      <path d="M17 4h3v16h-3"/>
                    </svg>
                    {fmtBook(entry.book)} {entry.chapter}
                    {entry.verseRange ? `:${entry.verseRange}` : ""}
                    {entry.translation ? ` · ${entry.translation}` : ""}
                  </div>
                )}
              </div>
            </div>
            <ShareBtn />
          </div>

          {/* Highlighted verse block */}
          {entry.verseText && (
            <div
              className="mb-3 rounded-xl overflow-hidden"
              style={{
                background: accentColor ? `${accentColor}12` : "rgba(var(--accent-rgb),0.06)",
                border: `1px solid ${accentColor ? `${accentColor}28` : "rgba(var(--accent-rgb),0.12)"}`,
              }}
            >
              <div
                className="px-3 pt-2.5 pb-1 text-[9px] font-bold tracking-widest uppercase flex items-center gap-1.5"
                style={{ color: accentColor || "var(--text-accent)", opacity: 0.75 }}
              >
                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor">
                  <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"/>
                </svg>
                Highlighted
              </div>
              <p
                className="px-3 pb-3 text-sm italic leading-relaxed"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body, Georgia, serif)",
                  opacity: 0.88,
                }}
              >
                &ldquo;{entry.verseText}&rdquo;
              </p>
            </div>
          )}

          {/* Reflection label + preview */}
          <div
            className="text-[9px] font-bold tracking-widest uppercase mb-1.5 opacity-30"
            style={{ color: "var(--text-primary)" }}
          >
            Reflection
          </div>
          <Preview clamp={3} />
          <Footer />
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════
     NOTES card (scratchpad)
  ══════════════════════════════════ */
  if (isNotes) {
    return (
      <div
        className="rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: "rgba(var(--accent-rgb),0.03)",
          border: "1px solid rgba(var(--accent-rgb),0.1)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{
          height: 2,
          background: "linear-gradient(to right, rgba(var(--accent-rgb),0.4), transparent)",
        }} />

        <div className="px-4 pt-3.5 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase"
                style={{ background: "rgba(var(--accent-rgb),0.08)", color: "var(--text-accent)" }}
              >
                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                Notes
              </div>
              {entry.scripture && (
                <span className="text-[10px] flex items-center gap-1 opacity-45" style={{ color: "var(--text-accent)" }}>
                  <svg viewBox="0 0 24 24" className="w-2 h-2 shrink-0" fill="currentColor">
                    <path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z"/>
                  </svg>
                  {entry.scripture}
                </span>
              )}
            </div>
            <ShareBtn />
          </div>

          <Preview clamp={4} />
          <Footer />
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════
     SPONTANEOUS card (plus button)
  ══════════════════════════════════ */
  if (isSpontaneous) {
    return (
      <div
        className="rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: "rgba(var(--accent-rgb),0.025)",
          border: "1px solid rgba(var(--accent-rgb),0.09)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{
          height: 2,
          background: "linear-gradient(to right, rgba(var(--accent-rgb),0.25), transparent)",
        }} />

        <div className="px-4 pt-3.5 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase"
                style={{ background: "rgba(var(--accent-rgb),0.07)", color: "var(--text-accent)" }}
              >
                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Spontaneous
              </div>
              {entry.scripture && (
                <span className="text-[10px] flex items-center gap-1 opacity-45" style={{ color: "var(--text-accent)" }}>
                  <svg viewBox="0 0 24 24" className="w-2 h-2 shrink-0" fill="currentColor">
                    <path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z"/>
                  </svg>
                  {entry.scripture}
                </span>
              )}
            </div>
            <ShareBtn />
          </div>

          <Preview clamp={4} />
          <Footer />
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════
     DEVOTIONAL card
  ══════════════════════════════════ */
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: "rgba(var(--accent-rgb),0.03)",
        border: "1px solid rgba(var(--accent-rgb),0.1)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{
        height: 2,
        background: "linear-gradient(to right, rgba(var(--accent-rgb),0.55), transparent)",
      }} />

      <div className="px-4 pt-3.5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase"
              style={{ background: "rgba(var(--accent-rgb),0.08)", color: "var(--text-accent)" }}
            >
              <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8 2 5 5.5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.5-3-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5" fill="currentColor" stroke="none"/>
              </svg>
              {entry.seriesTitle || "Devotional"}
              {entry.day ? ` · Day ${entry.day}` : ""}
            </div>
            {entry.dayTitle && (
              <div className="mt-1.5 text-xs opacity-55 font-medium" style={{ color: "var(--text-primary)" }}>
                {entry.dayTitle}
              </div>
            )}
          </div>
          <ShareBtn />
        </div>

        <Preview clamp={4} />
        <Footer />
      </div>
    </div>
  );
}

/* ===============================
   Dialogue Detail Component
================================ */
function DialogueDetail({ entry, theme, onBack, onEdit, onDelete, onShare }) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const date = new Date(entry.createdAt);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-6 border-b flex items-center justify-between"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 16px)",
          paddingBottom: "16px",
          background: "var(--bg-app)",
          borderColor: "rgba(var(--accent-rgb), 0.15)",
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition"
          style={{ color: "var(--text-accent)" }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-3">
          {/* Share with menu */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="text-xs px-3 py-1.5 rounded-lg transition"
              style={{
                color: "var(--text-accent)",
                background: "rgba(var(--accent-rgb), 0.1)",
              }}
            >
              Share
            </button>

            {showShareMenu && (
              <>
                {/* Backdrop to close menu */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowShareMenu(false)}
                />
                {/* Menu */}
                <div
                  className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden shadow-lg z-50"
                  style={{
                    background: "var(--bg-menu)",
                    border: "1px solid rgba(var(--accent-rgb), 0.2)",
                    minWidth: "160px",
                  }}
                >
                  <button
                    onClick={() => {
                      onShare("image");
                      setShowShareMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm transition hover:bg-opacity-10"
                    style={{
                      color: "var(--text-primary)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(var(--accent-rgb), 0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 inline-block mr-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    Share as Image
                  </button>
                  <button
                    onClick={() => {
                      onShare("text");
                      setShowShareMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm transition"
                    style={{
                      color: "var(--text-primary)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(var(--accent-rgb), 0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 inline-block mr-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                    </svg>
                    Share as Text
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Only show Edit/Delete for journal/spontaneous and devotional entries, not Scripture */}
          {(entry.type === "spontaneous" || entry.type === "journal" || entry.type === "devotional") && (
            <>
              <button
                onClick={onEdit}
                className="text-xs px-3 py-1.5 rounded-lg transition"
                style={{
                  color: "var(--text-accent)",
                  background: "rgba(var(--accent-rgb), 0.1)",
                }}
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="text-xs px-3 py-1.5 rounded-lg transition"
                style={{
                  color: "#ef4444",
                  background: "rgba(239, 68, 68, 0.1)",
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-2xl mx-auto">
        {/* Entry header with ornamental design */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="h-px flex-1"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(var(--accent-rgb), 0.3))",
              }}
            />
            <div
              className="text-xs font-bold px-4 py-1.5 rounded-full"
              style={{
                background: "var(--text-accent)",
                color: theme === "parchment" ? "#2C2416" : "#1C1C1A",
              }}
            >
              {entry.type === "scripture"
                ? "Scripture Dialogue"
                : entry.type === "devotional"
                ? "Devotional"
                : "Journal"}
            </div>
            <div
              className="h-px flex-1"
              style={{
                background:
                  "linear-gradient(to left, transparent, rgba(var(--accent-rgb), 0.3))",
              }}
            />
          </div>

          {/* Date */}
          <div
            className="text-center text-sm opacity-60"
            style={{ color: "var(--text-primary)" }}
          >
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {" • "}
            {date.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* Scripture Reference & Verse */}
        {entry.type === "scripture" && entry.book && entry.chapter && (
          <div className="mb-8">
            <div
              className="text-sm font-bold mb-3 flex items-center justify-center gap-2"
              style={{ color: "var(--text-accent)" }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z" />
                <path d="M17 4h3v16h-3" />
              </svg>
              <span>
                {fmtBook(entry.book)} {entry.chapter}
                {entry.verseRange ? `:${entry.verseRange}` : ""}
                {entry.translation ? ` • ${entry.translation}` : ""}
              </span>
            </div>

            {entry.verseText && (
              <div
                className="p-6 rounded-2xl text-center"
                style={{
                  background:
                    entry.highlightColor?.color ||
                    "rgba(var(--accent-rgb), 0.1)",
                }}
              >
                <p
                  className="text-lg leading-relaxed italic font-[var(--font-body)]"
                  style={{ color: "var(--text-primary)" }}
                >
                  "{entry.verseText}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Journal scripture verse */}
        {(entry.type === "journal" || entry.type === "spontaneous") && entry.scripture && (
          <div className="mb-8">
            <div
              className="text-sm font-bold mb-3 flex items-center justify-center gap-2"
              style={{ color: "var(--text-accent)" }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z" />
                <path d="M17 4h3v16h-3" />
              </svg>
              <span>
                {entry.scripture}
                {entry.verseTranslation ? ` • ${entry.verseTranslation}` : ""}
              </span>
            </div>
            {entry.verseText && (
              <div
                className="p-6 rounded-2xl text-center"
                style={{ background: "rgba(var(--accent-rgb), 0.1)" }}
              >
                <p
                  className="text-lg leading-relaxed italic font-[var(--font-body)]"
                  style={{ color: "var(--text-primary)" }}
                >
                  "{entry.verseText}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Full reflection with ALL formatting preserved */}
        {entry.type === "devotional" ? (
          <div
            style={{
              borderLeft: "3px solid var(--text-accent)",
              paddingLeft: "20px",
              paddingTop: "12px",
              paddingBottom: "12px",
              background: "rgba(var(--accent-rgb), 0.04)",
              borderRadius: "0 8px 8px 0",
            }}
          >
            <div
              className="prose prose-lg max-w-none"
              style={{ color: "var(--text-primary)" }}
              dangerouslySetInnerHTML={{ __html: entry.reflection || entry.html || entry.text }}
            />
          </div>
        ) : (
          <div
            className="prose prose-lg max-w-none"
            style={{ color: "var(--text-primary)" }}
            dangerouslySetInnerHTML={{ __html: entry.reflection || entry.html || entry.text }}
          />
        )}
      </div>

      {/* Enhanced prose styles for detail view */}
      <style>{`
        .prose {
          font-family: var(--font-body);
          line-height: 1.8;
        }
        .prose h1 {
          color: var(--text-accent);
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 1rem;
          margin-top: 2rem;
          letter-spacing: -0.02em;
        }
        .prose h1:first-child {
          margin-top: 0;
        }
        .prose h2 {
          color: var(--text-accent);
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          margin-top: 1.75rem;
        }
        .prose h3 {
          color: var(--text-accent);
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          margin-top: 1.5rem;
        }
        .prose p {
          margin-bottom: 1rem;
          color: var(--text-primary);
        }
        .prose strong {
          color: var(--text-accent);
          font-weight: 600;
        }
        .prose em {
          font-style: italic;
          opacity: 0.95;
        }
        .prose ul, .prose ol {
          margin: 1rem 0;
          padding-left: 1.75rem;
        }
        .prose li {
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }
        .prose blockquote {
          border-left: 3px solid var(--text-accent);
          padding-left: 1.25rem;
          margin: 1.5rem 0;
          font-style: italic;
          opacity: 0.9;
        }
        .prose code {
          background: rgba(var(--accent-rgb), 0.1);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        .prose pre {
          background: rgba(var(--accent-rgb), 0.05);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
}
