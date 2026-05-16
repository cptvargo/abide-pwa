/**
 * AbideDictionary.jsx
 * Personal curated word study collection saved from Seek.
 * Supports standalone (full-screen) and picker (insert into journal) modes.
 */

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "abide_dictionary";

export function getDictionaryEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveDictionaryEntry(seekResult, query) {
  const entries = getDictionaryEntries();
  const id = `dict-${Date.now()}`;
  const entry = {
    id,
    savedAt: new Date().toISOString(),
    query,
    personalNote: "",
    ...seekResult,
  };
  const already = entries.findIndex(
    (e) =>
      (e.word || e.query || "").toLowerCase() ===
      (seekResult.word || query || "").toLowerCase(),
  );
  if (already !== -1) {
    // Update in place, preserve personal note
    entries[already] = { ...entry, personalNote: entries[already].personalNote };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return entries[already];
  }
  entries.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return entry;
}

export function deleteDictionaryEntry(id) {
  const entries = getDictionaryEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function updatePersonalNote(id, note) {
  const entries = getDictionaryEntries().map((e) =>
    e.id === id ? { ...e, personalNote: note } : e,
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const A = "rgba(203,178,124,"; // accent helper

function Label({ children }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-ui)",
        fontSize: 9,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: `${A}0.4)`,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function Rule() {
  return (
    <div
      style={{ height: 1, background: `${A}0.08)`, margin: "20px 0" }}
    />
  );
}

// ── Detail view ───────────────────────────────────────────────────────────────
function EntryDetail({ entry: initial, onBack, onInsert, onDelete }) {
  const [entry, setEntry] = useState(initial);
  const [noteOpen, setNoteOpen] = useState(!!initial.personalNote);
  const [noteVal, setNoteVal] = useState(initial.personalNote || "");
  const [deleted, setDeleted] = useState(false);
  const saveTimeout = useRef(null);

  function handleNoteChange(val) {
    setNoteVal(val);
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      updatePersonalNote(entry.id, val);
      setEntry((e) => ({ ...e, personalNote: val }));
    }, 600);
  }

  function handleDelete() {
    if (!window.confirm(`Remove "${entry.word || entry.query}" from your dictionary?`)) return;
    deleteDictionaryEntry(entry.id);
    setDeleted(true);
    onDelete?.();
    onBack();
  }

  const isQ = entry.type === "question";
  const displayWord = isQ ? (entry.question || entry.query) : (entry.word || entry.query);

  const sections = isQ
    ? [
        { label: "Answer", content: entry.answer },
        { label: "Context", content: entry.context },
      ]
    : [
        { label: "Definition", content: entry.definition },
        { label: "In Scripture", content: entry.significance },
      ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-app, #141410)",
        zIndex: 60,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          background: "var(--bg-app, #141410)",
          borderBottom: `1px solid ${A}0.08)`,
          padding: "calc(env(safe-area-inset-top,0px) + 12px) 20px 12px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: `${A}0.08)`,
            border: `1px solid ${A}0.12)`,
            borderRadius: 100,
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-accent)",
            fontSize: 16,
            cursor: "pointer",
            flexShrink: 0,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: `${A}0.5)`,
              marginBottom: 2,
            }}
          >
            ◉ &nbsp;Abide Dictionary
          </div>
          <div
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 16,
              fontWeight: 500,
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayWord}
          </div>
        </div>
        {onInsert && (
          <button
            onClick={() => onInsert(entry)}
            style={{
              background: `${A}0.15)`,
              border: `1px solid ${A}0.3)`,
              borderRadius: 8,
              padding: "7px 14px",
              color: "var(--text-accent)",
              fontFamily: "var(--font-ui)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.06em",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Insert
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "24px 20px 40px" }}>
        {/* Word + original language */}
        <div
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 9,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: `${A}0.5)`,
            marginBottom: 6,
          }}
        >
          {isQ ? "✦ Insight" : "✦ Word Study"}
        </div>
        <h2
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: isQ ? 20 : 26,
            fontWeight: 300,
            letterSpacing: "0.03em",
            color: "var(--text-primary)",
            lineHeight: 1.3,
            marginBottom: 20,
          }}
        >
          {displayWord}
        </h2>

        {!isQ && entry.originalLanguage && (
          <div
            style={{
              background: `${A}0.05)`,
              border: `1px solid ${A}0.12)`,
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 9,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: `${A}0.4)`,
                marginBottom: 10,
              }}
            >
              Original · {entry.originalLanguage.language}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: "serif",
                  fontSize: 28,
                  color: "var(--text-accent)",
                  lineHeight: 1.2,
                }}
              >
                {entry.originalLanguage.word}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  fontStyle: "italic",
                  opacity: 0.75,
                }}
              >
                {entry.originalLanguage.transliteration}
              </span>
              {entry.originalLanguage.strongs && (
                <span
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 10,
                    color: `${A}0.35)`,
                    letterSpacing: "0.05em",
                  }}
                >
                  {entry.originalLanguage.strongs}
                </span>
              )}
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--text-primary)",
                opacity: 0.7,
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              {entry.originalLanguage.meaning}
            </p>
          </div>
        )}

        {sections.map(({ label, content }) =>
          content ? (
            <div key={label} style={{ marginBottom: 20 }}>
              <Label>{label}</Label>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: "var(--text-primary)",
                  opacity: 0.85,
                  margin: 0,
                }}
              >
                {typeof content === "string" ? content : ""}
              </p>
              <Rule />
            </div>
          ) : null,
        )}

        {/* Exegesis */}
        {isQ && Array.isArray(entry.exegesis) && entry.exegesis.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <Label>Exegesis</Label>
            {entry.exegesis.map((ex, i) => (
              <div
                key={i}
                style={{
                  background: `${A}0.04)`,
                  border: `1px solid ${A}0.1)`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    color: "var(--text-accent)",
                    marginBottom: 6,
                  }}
                >
                  {ex.passage}
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    lineHeight: 1.75,
                    color: "var(--text-primary)",
                    opacity: 0.8,
                    margin: "0 0 8px",
                  }}
                >
                  {typeof ex.explanation === "string" ? ex.explanation : ""}
                </p>
                {ex.keyInsight && (
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontStyle: "italic",
                      fontSize: 13,
                      color: "var(--text-accent)",
                      opacity: 0.65,
                    }}
                  >
                    "{ex.keyInsight}"
                  </div>
                )}
              </div>
            ))}
            <Rule />
          </div>
        )}

        {/* Pastoral caution */}
        {typeof entry.pastoralCaution === "string" &&
          entry.pastoralCaution.trim() && (
            <div
              style={{
                background: `${A}0.06)`,
                border: `1px solid ${A}0.15)`,
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: `${A}0.5)`,
                  marginBottom: 6,
                }}
              >
                A Note
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: "var(--text-primary)",
                  opacity: 0.65,
                  margin: 0,
                }}
              >
                {entry.pastoralCaution}
              </p>
            </div>
          )}

        {/* Key verses */}
        {Array.isArray(entry.verses) && entry.verses.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <Label>Key Verses</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {entry.verses.map((v, i) => (
                <div
                  key={i}
                  style={{
                    background: `${A}0.04)`,
                    border: `1px solid ${A}0.1)`,
                    borderRadius: 12,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      color: `${A}0.55)`,
                      marginBottom: 8,
                    }}
                  >
                    {typeof v.ref === "string" ? v.ref : ""}
                  </div>
                  {v.text && (
                    <div
                      style={{
                        borderLeft: `2px solid ${A}0.45)`,
                        paddingLeft: 12,
                        marginBottom: 4,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-body)",
                          fontStyle: "italic",
                          fontSize: 14,
                          color: "var(--text-accent)",
                          lineHeight: 1.65,
                        }}
                      >
                        "{typeof v.text === "string" ? v.text : ""}"
                      </div>
                    </div>
                  )}
                  <div
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      color: `${A}0.4)`,
                      marginTop: 4,
                      marginBottom: v.note ? 8 : 0,
                    }}
                  >
                    — {typeof v.translation === "string" ? v.translation : "KJV"}
                  </div>
                  {v.note && (
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 12,
                        color: "var(--text-primary)",
                        opacity: 0.45,
                        lineHeight: 1.5,
                      }}
                    >
                      {typeof v.note === "string" ? v.note : ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Rule />
          </div>
        )}

        {/* Reflect */}
        {typeof entry.reflection === "string" && entry.reflection.trim() && (
          <div style={{ marginBottom: 24 }}>
            <Label>Reflect</Label>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 15,
                lineHeight: 1.8,
                fontStyle: "italic",
                color: "var(--text-primary)",
                opacity: 0.6,
                margin: 0,
              }}
            >
              {entry.reflection}
            </p>
            <Rule />
          </div>
        )}

        {/* Personal Note */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Label>My Notes</Label>
            {!noteOpen && (
              <button
                onClick={() => setNoteOpen(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-accent)",
                  fontFamily: "var(--font-ui)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  opacity: 0.7,
                  padding: 0,
                  marginBottom: 10,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                + Add note
              </button>
            )}
          </div>
          {noteOpen ? (
            <textarea
              value={noteVal}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Write your personal reflection or study note on this word…"
              rows={5}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: `${A}0.05)`,
                border: `1px solid ${A}0.15)`,
                borderRadius: 10,
                padding: "12px 14px",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                lineHeight: 1.7,
                color: "var(--text-primary)",
                resize: "vertical",
                outline: "none",
              }}
            />
          ) : noteVal ? (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                lineHeight: 1.75,
                color: "var(--text-primary)",
                opacity: 0.75,
                margin: 0,
                cursor: "pointer",
                borderLeft: `2px solid ${A}0.3)`,
                paddingLeft: 12,
              }}
              onClick={() => setNoteOpen(true)}
            >
              {noteVal}
            </p>
          ) : null}
        </div>

        {/* Saved date */}
        <div
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 11,
            color: "var(--text-primary)",
            opacity: 0.3,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Saved{" "}
          {new Date(entry.savedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            background: "transparent",
            border: `1px solid rgba(239,68,68,0.2)`,
            borderRadius: 10,
            color: "rgba(239,68,68,0.6)",
            fontFamily: "var(--font-ui)",
            fontSize: 13,
            letterSpacing: "0.06em",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          Remove from Dictionary
        </button>
      </div>
    </div>
  );
}

// ── Word card ─────────────────────────────────────────────────────────────────
function WordCard({ entry, onPress }) {
  const isQ = entry.type === "question";
  const displayWord = isQ
    ? entry.question || entry.query
    : entry.word || entry.query;
  const preview = isQ
    ? entry.answer
    : entry.definition;

  return (
    <button
      onClick={() => onPress(entry)}
      style={{
        width: "100%",
        textAlign: "left",
        background: `${A}0.05)`,
        border: `1px solid ${A}0.1)`,
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 10,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        transition: "background 0.15s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Icon */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: `${A}0.1)`,
            border: `1px solid ${A}0.15)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: `${A}0.8)`,
            flexShrink: 0,
          }}
        >
          {isQ ? "✦" : "◉"}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              marginBottom: 3,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 16,
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              {displayWord}
            </span>
            {!isQ && entry.originalLanguage?.word && (
              <span
                style={{
                  fontFamily: "serif",
                  fontSize: 15,
                  color: "var(--text-accent)",
                  opacity: 0.7,
                }}
              >
                {entry.originalLanguage.word}
              </span>
            )}
          </div>
          {preview && (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                lineHeight: 1.5,
                color: "var(--text-primary)",
                opacity: 0.5,
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {typeof preview === "string" ? preview : ""}
            </p>
          )}
          <div
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 10,
              color: `${A}0.3)`,
              marginTop: 6,
              letterSpacing: "0.05em",
            }}
          >
            {new Date(entry.savedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>

        <div
          style={{
            fontSize: 16,
            color: `${A}0.4)`,
            flexShrink: 0,
            alignSelf: "center",
          }}
        >
          →
        </div>
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
/**
 * @param {Object} props
 * @param {function} props.onBack - close/back handler
 * @param {function} [props.onInsert] - if provided, shows "Insert" button in detail view
 *   called with the full entry so the journal can build a blockquote
 */
export default function AbideDictionary({ onBack, onInsert }) {
  const [entries, setEntries] = useState(() => getDictionaryEntries());
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimateIn(true)));
  }, []);

  function refresh() {
    setEntries(getDictionaryEntries());
  }

  const filtered = search.trim()
    ? entries.filter((e) => {
        const q = search.toLowerCase();
        return (
          (e.word || e.query || "").toLowerCase().includes(q) ||
          (e.definition || e.answer || "").toLowerCase().includes(q)
        );
      })
    : entries;

  if (detail) {
    return (
      <EntryDetail
        entry={detail}
        onBack={() => { setDetail(null); refresh(); }}
        onInsert={onInsert ? (entry) => { onInsert(entry); onBack(); } : undefined}
        onDelete={refresh}
      />
    );
  }

  const transform = animateIn ? "translateX(0)" : "translateX(100%)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-app, #141410)",
        zIndex: 55,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        transform,
        transition: "transform 0.38s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          background: "var(--bg-app, #141410)",
          borderBottom: `1px solid ${A}0.08)`,
          padding: "calc(env(safe-area-inset-top,0px) + 12px) 20px 12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <button
            onClick={onBack}
            style={{
              background: `${A}0.08)`,
              border: `1px solid ${A}0.12)`,
              borderRadius: 100,
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-accent)",
              fontSize: 16,
              cursor: "pointer",
              flexShrink: 0,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            ←
          </button>
          <div>
            <div
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: `${A}0.5)`,
                marginBottom: 2,
              }}
            >
              ◉ &nbsp;Study
            </div>
            <h1
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 20,
                fontWeight: 300,
                letterSpacing: "0.02em",
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              Abide Dictionary
            </h1>
          </div>
        </div>

        {/* Search */}
        {entries.length > 0 && (
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your dictionary…"
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: `${A}0.06)`,
                border: `1px solid ${A}0.12)`,
                borderRadius: 10,
                padding: "10px 36px 10px 14px",
                fontFamily: "var(--font-ui)",
                fontSize: 14,
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: `${A}0.5)`,
                  fontSize: 14,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* List */}
      <div style={{ padding: "16px 20px", paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 32px)" }}>
        {entries.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: 36, marginBottom: 16, opacity: 0.3 }}>◉</div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 16,
                fontStyle: "italic",
                color: "var(--text-primary)",
                opacity: 0.4,
                lineHeight: 1.7,
              }}
            >
              No words saved yet.
              {"\n"}Search a word in Seek and tap
              {"\n"}"Save to Dictionary" to build your collection.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontStyle: "italic",
              color: "var(--text-primary)",
              opacity: 0.4,
              textAlign: "center",
              paddingTop: 40,
            }}
          >
            No words match "{search}"
          </p>
        ) : (
          <>
            <div
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: `${A}0.4)`,
                marginBottom: 14,
              }}
            >
              {filtered.length} {filtered.length === 1 ? "word" : "words"}
            </div>
            {filtered.map((entry) => (
              <WordCard key={entry.id} entry={entry} onPress={setDetail} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
