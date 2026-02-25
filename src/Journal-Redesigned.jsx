/* ===============================
   ABIDE Journal - Index View
   Unique scripture-inspired design with theme support
================================ */
export function JournalIndex({
  journalEntries,
  groupEntriesByMonth,
  theme,
  onBack,
  onViewEntry,
  onExportPDF,
}) {
  return (
    <div className="flex-1 overflow-y-auto">
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
              ABIDE Journal
            </h1>
            <p
              className="text-sm opacity-60"
              style={{ color: "var(--text-primary)" }}
            >
              {journalEntries.length}{" "}
              {journalEntries.length === 1 ? "entry" : "entries"}
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
      <div className="px-6 py-8">
        {journalEntries.length === 0 ? (
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
              <path d="M21 15V5a2 2 0 0 0-2-2H9" />
              <path d="M7 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
              <path d="M17 8H7M17 12H7M17 16H7" />
            </svg>
            <p
              className="text-sm opacity-50"
              style={{ color: "var(--text-primary)" }}
            >
              No journal entries yet
            </p>
            <p
              className="text-xs opacity-40 mt-2"
              style={{ color: "var(--text-primary)" }}
            >
              Begin your spiritual journey
            </p>
          </div>
        ) : (
          Object.entries(groupEntriesByMonth(journalEntries)).map(
            ([month, entries]) => (
              <div key={month} className="mb-12">
                {/* Month Header with ornamental line */}
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
                  {entries.map((entry) => {
                    const entryIndex = journalEntries.findIndex(
                      (e) => e.id === entry.id,
                    );
                    const entryNumber = journalEntries.length - entryIndex;
                    const date = new Date(entry.createdAt);

                    return (
                      <div
                        key={entry.id}
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
                          style={{ background: "var(--text-accent)" }}
                        />

                        <div className="pl-6 pr-4 py-5">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {/* Entry number */}
                              <div
                                className="text-xs font-bold px-3 py-1 rounded-lg"
                                style={{
                                  background: "var(--text-accent)",
                                  color:
                                    theme === "parchment"
                                      ? "#2C2416"
                                      : "#1C1C1A",
                                }}
                              >
                                #{entryNumber}
                              </div>

                              {/* Date & Time */}
                              <div className="flex flex-col">
                                <span
                                  className="text-sm font-semibold"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                                <span
                                  className="text-xs opacity-50"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {date.toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Export button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onExportPDF(entry, entryNumber, theme);
                              }}
                              className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{
                                background: "rgba(var(--accent-rgb), 0.1)",
                                color: "var(--text-accent)",
                              }}
                              title="Export as PDF"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </button>
                          </div>

                          {/* Entry preview - PRESERVES FORMATTING */}
                          <button
                            onClick={() => onViewEntry(entry)}
                            className="w-full text-left"
                          >
                            <div
                              className="text-sm leading-relaxed line-clamp-3 prose prose-sm max-w-none"
                              style={{ color: "var(--text-primary)" }}
                              dangerouslySetInnerHTML={{
                                __html: entry.html || entry.text,
                              }}
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
                  })}
                </div>
              </div>
            ),
          )
        )}
      </div>

      {/* Add custom prose styles for formatted content preview */}
      <style>{`
        .prose h1, .prose h2, .prose h3 {
          color: var(--text-accent);
          font-weight: 600;
          margin: 0;
        }
        .prose h1 { font-size: 1.1em; }
        .prose h2 { font-size: 1em; }
        .prose h3 { font-size: 0.95em; }
        .prose p {
          margin: 0;
        }
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
        .prose li {
          margin: 0;
        }
      `}</style>
    </div>
  );
}

/* ===============================
   ABIDE Journal - Detail View
   Full formatting preserved
================================ */
export function JournalDetail({
  entry,
  entryNumber,
  onBack,
  onEdit,
  onDelete,
}) {
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
                color: "#1C1C1A",
              }}
            >
              Entry #{entryNumber}
            </div>
            <div
              className="h-px flex-1"
              style={{
                background:
                  "linear-gradient(to left, transparent, rgba(var(--accent-rgb), 0.3))",
              }}
            />
          </div>

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

        {/* Full entry with ALL formatting preserved */}
        <div
          className="prose prose-lg max-w-none"
          style={{ color: "var(--text-primary)" }}
          dangerouslySetInnerHTML={{ __html: entry.html || entry.text }}
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
