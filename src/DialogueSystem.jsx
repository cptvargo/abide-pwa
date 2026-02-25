/**
 * DialogueSystem.jsx - Dialoguing with God
 * Unified system for Scripture-linked dialogue (from highlights) and spontaneous entries
 */

import { useState, useEffect } from "react";
import { shareDialogueAsImage } from "../ShareAsImage";
import RichTextJournal from "./RichTextJournal";

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

  // Save to localStorage whenever dialogues change
  useEffect(() => {
    saveDialogues(dialogues);
  }, [dialogues]);

  function deleteDialogue(id) {
    setDialogues((prev) => prev.filter((d) => d.id !== id));
  }

  function handleSaveEntry({ html, text }) {
    if (!text.trim()) return;

    const newEntry = {
      id: Date.now().toString(),
      type: "spontaneous",
      reflection: html,
      text: text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDialogues((prev) => [newEntry, ...prev]);
    setEditorText("");
    setCreatingEntry(false);
  }

  async function handleShareEntry(entry) {
    // Try sharing as image first
    const success = await shareDialogueAsImage(entry, theme);

    // If image share fails, fall back to text
    if (!success) {
      let shareText = "";

      // Add Scripture reference if present
      if (entry.type === "scripture" && entry.book && entry.chapter) {
        const ref = entry.verseRange
          ? `${entry.book} ${entry.chapter}:${entry.verseRange}`
          : `${entry.book} ${entry.chapter}`;
        shareText += `${ref}${entry.translation ? ` • ${entry.translation}` : ""}\n`;

        if (entry.verseText) {
          shareText += `"${entry.verseText}"\n\n`;
        }
      }

      // Add reflection
      shareText += entry.text || entry.reflection.replace(/<[^>]*>/g, "");

      // Add timestamp
      const date = new Date(entry.createdAt);
      const timestamp = date.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      shareText += `\n\n— ${timestamp}`;

      // Use native share API if available (iOS, Android)
      if (navigator.share) {
        navigator
          .share({
            title:
              entry.type === "scripture"
                ? `${entry.book} ${entry.chapter}:${entry.verseRange}`
                : "My Prayer",
            text: shareText,
          })
          .catch(() => {
            // User cancelled, do nothing
          });
      } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
          alert("Copied to clipboard!");
        });
      }
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
        onShare={() => handleShareEntry(viewingEntry)}
      />
    );
  }

  /* ===============================
     Render: Index View
  ================================ */
  return (
    <div className="flex-1 overflow-y-auto relative">
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-6 py-6 border-b"
        style={{
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

      {/* Content */}
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
          onSave={handleSaveEntry}
          onClose={() => {
            setCreatingEntry(false);
            setEditorText("");
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

  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
      style={{
        background: "rgba(var(--accent-rgb), 0.03)",
        border: "1px solid rgba(var(--accent-rgb), 0.1)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Decorative accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{
          background:
            entry.type === "scripture" && entry.highlightColor
              ? entry.highlightColor.color
              : "var(--text-accent)",
        }}
      />

      <div className="pl-6 pr-4 py-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {/* Scripture Reference */}
            {entry.type === "scripture" && entry.book && entry.chapter && (
              <div
                className="text-xs font-bold mb-2 flex items-center gap-2"
                style={{ color: "var(--text-accent)" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-3 h-3"
                  fill="currentColor"
                >
                  <path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z" />
                  <path d="M17 4h3v16h-3" />
                </svg>
                <span>
                  {entry.book} {entry.chapter}
                  {entry.verseRange ? `:${entry.verseRange}` : ""}
                  {entry.translation ? ` • ${entry.translation}` : ""}
                </span>
              </div>
            )}

            {/* Date & Time */}
            <div
              className="text-xs opacity-50"
              style={{ color: "var(--text-primary)" }}
            >
              {date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              {" — "}
              {date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
          </div>

          {/* Share button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
            className="p-2 rounded-lg transition-opacity"
            style={{
              background: "rgba(var(--accent-rgb), 0.1)",
              color: "var(--text-accent)",
            }}
            title="Share"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>

        {/* Verse Text (if Scripture-linked) */}
        {entry.type === "scripture" && entry.verseText && (
          <div
            className="mb-3 p-3 rounded-lg text-sm italic"
            style={{
              background:
                entry.highlightColor?.color || "rgba(var(--accent-rgb), 0.1)",
              color: "var(--text-primary)",
            }}
          >
            "{entry.verseText}"
          </div>
        )}

        {/* Reflection Preview */}
        <button onClick={onView} className="w-full text-left">
          <div
            className="text-sm leading-relaxed line-clamp-3 prose prose-sm max-w-none"
            style={{ color: "var(--text-primary)" }}
            dangerouslySetInnerHTML={{ __html: entry.reflection || entry.text }}
          />

          {/* Read more indicator */}
          <div
            className="text-xs mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "var(--text-accent)" }}
          >
            <span>Read full entry</span>
            <svg
              viewBox="0 0 24 24"
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Prose styles for preview */}
      <style>{`
        .prose h1, .prose h2, .prose h3 {
          color: var(--text-accent);
          font-weight: 600;
          margin: 0;
        }
        .prose h1 { font-size: 1.1em; }
        .prose h2 { font-size: 1em; }
        .prose h3 { font-size: 0.95em; }
        .prose p { margin: 0; }
        .prose strong {
          color: var(--text-accent);
          font-weight: 600;
        }
        .prose em {
          font-style: italic;
          opacity: 0.9;
        }
        .prose ul, .prose ol {
          margin: 0;
          padding-left: 1.5em;
        }
        .prose li { margin: 0; }
      `}</style>
    </div>
  );
}

/* ===============================
   Dialogue Detail Component
================================ */
function DialogueDetail({ entry, theme, onBack, onEdit, onDelete, onShare }) {
  const date = new Date(entry.createdAt);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between"
        style={{
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
          <button
            onClick={onShare}
            className="text-xs px-3 py-1.5 rounded-lg transition"
            style={{
              color: "var(--text-accent)",
              background: "rgba(var(--accent-rgb), 0.1)",
            }}
          >
            Share
          </button>

          {/* Only show Edit/Delete for spontaneous entries, not Scripture */}
          {entry.type === "spontaneous" && (
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
                : "Spontaneous Prayer"}
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
                {entry.book} {entry.chapter}
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

        {/* Full reflection with ALL formatting preserved */}
        <div
          className="prose prose-lg max-w-none"
          style={{ color: "var(--text-primary)" }}
          dangerouslySetInnerHTML={{ __html: entry.reflection || entry.text }}
        />
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
