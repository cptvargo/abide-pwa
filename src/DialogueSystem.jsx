/**
 * DialogueSystem.jsx - Dialoguing with God
 * Unified system for Scripture-linked dialogue (from highlights) and spontaneous entries
 */

import { useState, useEffect } from "react";
import { shareDialogueAsImage } from "./ShareAsImage";
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
      type: "journal",
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

    // Fall back to text (either user chose text or image failed)
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

    // Add scripture for journal entries
    if ((entry.type === "journal" || entry.type === "spontaneous") && entry.scripture) {
      shareText += `${entry.scripture}${entry.verseTranslation ? ` • ${entry.verseTranslation}` : ""}\n`;
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
              : entry.scripture || "My Journal",
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

            {/* Journal scripture reference */}
            {(entry.type === "journal" || entry.type === "spontaneous") && entry.scripture && (
              <div
                className="text-xs font-bold mb-2 flex items-center gap-2"
                style={{ color: "var(--text-accent)" }}
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
                  <path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z" />
                  <path d="M17 4h3v16h-3" />
                </svg>
                <span>
                  {entry.scripture}
                  {entry.verseTranslation ? ` • ${entry.verseTranslation}` : ""}
                </span>
              </div>
            )}

            {/* Devotional series/day reference */}
            {entry.type === "devotional" && entry.seriesTitle && (
              <div
                className="text-xs font-bold mb-2 flex items-center gap-2"
                style={{ color: "var(--text-accent)" }}
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
                  <path d="M2 4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4z" opacity="0.15"/>
                  <path d="M7 8h10M7 12h7M7 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </svg>
                <span>
                  {entry.seriesTitle}
                  {entry.day ? ` • Day ${entry.day}` : ""}
                  {entry.dayTitle ? ` — ${entry.dayTitle}` : ""}
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

        {/* Verse Text (if journal with scripture) */}
        {(entry.type === "journal" || entry.type === "spontaneous") && entry.verseText && (
          <div
            className="mb-3 p-3 rounded-lg text-sm italic"
            style={{
              background: "rgba(var(--accent-rgb), 0.08)",
              color: "var(--text-primary)",
            }}
          >
            "{entry.verseText}"
          </div>
        )}

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
              dangerouslySetInnerHTML={{ __html: entry.reflection || entry.text }}
            />
          </div>
        ) : (
          <div
            className="prose prose-lg max-w-none"
            style={{ color: "var(--text-primary)" }}
            dangerouslySetInnerHTML={{ __html: entry.reflection || entry.text }}
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
