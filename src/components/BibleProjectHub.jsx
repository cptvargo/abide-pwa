import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Verse parsing helpers ───────────────────────────────────────── */
function parseVerseRef(ref) {
  const m = ref.trim().match(/^([\w\s]+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!m) return null;
  return {
    bookId: m[1].toLowerCase().replace(/\s+/g, ""),
    chapter: parseInt(m[2]),
    startVerse: parseInt(m[3]),
    endVerse: m[4] ? parseInt(m[4]) : parseInt(m[3]),
    display: ref,
  };
}

async function fetchVerseText(bookId, chapter, startVerse, endVerse, translation, base) {
  const t = translation.toLowerCase();
  try {
    const res = await fetch(`${base}data/translations/${t}/${bookId}/${chapter}.json`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    const rawVerses = data.verses ?? data;
    const entries = Array.isArray(rawVerses)
      ? rawVerses
      : Object.entries(rawVerses)
          .filter(([k]) => !isNaN(Number(k)))
          .map(([k, v]) => ({ verse: Number(k), text: typeof v === "string" ? v : (v?.text ?? "") }));
    const lines = entries
      .filter((v) => v.verse >= startVerse && v.verse <= endVerse)
      .map((v) => {
        const text = typeof v.text === "string" ? v.text : (v.text?.text ?? "");
        return startVerse !== endVerse ? `[${v.verse}] ${text}` : text;
      });
    return lines.join(" ") || null;
  } catch { return null; }
}

/* ─── Verse bottom sheet ──────────────────────────────────────────── */
function VerseSheetBP({ pill, translation, base, onClose }) {
  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(true);
  const parsed = pill ? parseVerseRef(pill) : null;

  useEffect(() => {
    if (!parsed) return;
    setLoading(true); setText(null);
    fetchVerseText(parsed.bookId, parsed.chapter, parsed.startVerse, parsed.endVerse, translation, base)
      .then((t) => { setText(t); setLoading(false); });
  }, [pill, translation]);

  if (!pill) return null;
  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)",
      }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
        background: "var(--bg-app)",
        borderTop: "1px solid rgba(203,178,124,0.2)",
        borderRadius: "20px 20px 0 0",
        padding: "0 24px calc(env(safe-area-inset-bottom,0px) + 28px)",
        animation: "da-sheet-up 0.28s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: "rgba(255,255,255,0.15)",
          margin: "12px auto 24px",
        }} />
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "rgba(203,178,124,0.6)",
          fontFamily: "var(--font-ui, system-ui)", marginBottom: 6,
        }}>
          {parsed?.display}
        </div>
        <div style={{
          display: "inline-block", fontSize: 10, letterSpacing: "0.08em",
          background: "rgba(203,178,124,0.1)", border: "1px solid rgba(203,178,124,0.2)",
          borderRadius: 6, padding: "2px 8px", marginBottom: 16,
          color: "rgba(203,178,124,0.7)", fontFamily: "var(--font-ui, system-ui)",
        }}>
          {translation}
        </div>
        {loading ? (
          <div style={{ height: 48, display: "flex", alignItems: "center" }}>
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              border: "2px solid rgba(203,178,124,0.2)",
              borderTopColor: "rgba(203,178,124,0.7)",
              animation: "da-spin 0.7s linear infinite",
            }} />
          </div>
        ) : text ? (
          <p style={{
            fontFamily: "var(--font-body, Georgia, serif)", fontSize: 16,
            lineHeight: 1.85, color: "var(--text-primary)", opacity: 0.88, margin: 0,
          }}>
            {text}
          </p>
        ) : (
          <p style={{
            fontFamily: "var(--font-body, Georgia, serif)", fontSize: 14,
            color: "var(--text-primary)", opacity: 0.4, fontStyle: "italic",
          }}>
            Verse not available in {translation}.
          </p>
        )}
      </div>
    </>
  );
}

/* ─── Group series by book (multi-part → single card) ────────────── */
function groupByBook(series) {
  const seen = [];
  const map = {};
  for (const s of series) {
    const key = s.book || s.id;
    if (!map[key]) { map[key] = []; seen.push(key); }
    map[key].push(s);
  }
  return seen.map((key) => {
    const parts = map[key];
    if (parts.length === 1) return parts[0];
    return {
      _isGroup: true,
      id: key,
      book: key,
      title: parts[0].title.split(":")[0].trim(),
      parts,
      coverVideoId: parts[0].coverVideoId,
    };
  });
}

/* ─── Media Card ──────────────────────────────────────────────────── */
function MediaCard({ series, onPress }) {
  const imgSrc = series.coverVideoId
    ? `https://img.youtube.com/vi/${series.coverVideoId}/hqdefault.jpg`
    : null;

  return (
    <button
      onClick={onPress}
      style={{
        width: 200, flexShrink: 0,
        cursor: "pointer", background: "transparent",
        border: "none", padding: 0, textAlign: "left",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div style={{
        width: "100%", aspectRatio: "16/9",
        borderRadius: 12, overflow: "hidden",
        position: "relative",
        background: "rgba(203,178,124,0.06)",
        boxShadow: "0 6px 24px rgba(0,0,0,0.55)",
      }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={series.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.88 }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(135deg, rgba(203,178,124,0.1), rgba(10,10,8,0.9))",
          }} />
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.45))",
        }} />
        <div style={{
          position: "absolute", bottom: 8, right: 8,
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(203,178,124,0.88)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}>
          <svg width="9" height="9" viewBox="0 0 12 12" fill="#141410">
            <polygon points="2,1 11,6 2,11" />
          </svg>
        </div>
      </div>

      <div style={{
        marginTop: 10, paddingLeft: 2,
        fontSize: 13, fontFamily: "var(--font-ui, system-ui)",
        color: "var(--text-primary)", opacity: 0.88,
        lineHeight: 1.35,
        overflow: "hidden", display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
      }}>
        {series.title}
      </div>

      <div style={{
        marginTop: 4, paddingLeft: 2,
        fontSize: 10, fontFamily: "var(--font-ui, system-ui)",
        color: "rgba(203,178,124,0.48)", letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}>
        {series._isGroup ? `${series.parts.length} Parts` : "BibleProject"}
      </div>
    </button>
  );
}

/* ─── Media Section (horizontal snap scroll) ──────────────────────── */
function MediaSection({ title, items, onPressCard, onSeeAll }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        padding: "0 20px", marginBottom: 16,
      }}>
        <div style={{
          fontSize: 19, fontWeight: 600, fontFamily: "var(--font-ui, system-ui)",
          color: "var(--text-primary)", letterSpacing: "-0.025em",
        }}>
          {title}
        </div>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, fontFamily: "var(--font-ui, system-ui)",
              color: "rgba(203,178,124,0.55)", padding: 0,
              WebkitTapHighlightColor: "transparent",
              letterSpacing: "0.01em",
            }}
          >
            See All
          </button>
        )}
      </div>

      <div style={{
        display: "flex", gap: 16,
        overflowX: "auto", overflowY: "visible",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        paddingLeft: 20, paddingRight: 20, paddingBottom: 12,
        msOverflowStyle: "none", scrollbarWidth: "none",
      }}>
        {items.map((s) => (
          <div key={s.id} style={{ scrollSnapAlign: "start" }}>
            <MediaCard series={s} onPress={() => onPressCard(s)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Cinematic Hero ──────────────────────────────────────────────── */
function CinematicHero({ base, onBack }) {
  return (
    <div style={{ flexShrink: 0 }}>
      {/* Back button above the image — doesn't overlay artwork */}
      <div style={{
        padding: "calc(env(safe-area-inset-top, 0px) + 10px) 16px 10px",
      }}>
        <button
          onClick={onBack}
          style={{
            height: 34, borderRadius: 9, padding: "0 12px 0 8px",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer", color: "var(--text-primary)",
            display: "flex", alignItems: "center", gap: 5,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span style={{ fontSize: 13, fontFamily: "var(--font-ui, system-ui)", opacity: 0.85 }}>
            Daily Abiding
          </span>
        </button>
      </div>

      {/* Image at natural 16:9 ratio — no cropping, full artwork visible */}
      <div style={{ position: "relative", width: "100%" }}>
        <img
          src={`${base}the_bible_project.png`}
          alt="The Bible Project"
          style={{
            width: "100%", height: "auto", display: "block",
            userSelect: "none", pointerEvents: "none",
          }}
        />
        {/* Bottom fade into content */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 55%, rgba(14,14,10,0.75) 100%)",
        }} />
      </div>
    </div>
  );
}

/* ─── About Sheet ────────────────────────────────────────────────── */
function AboutSheet({ onClose }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)" }}
      />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
        background: "var(--bg-app)",
        borderTop: "1px solid rgba(203,178,124,0.15)",
        borderRadius: "20px 20px 0 0",
        padding: "0 24px calc(env(safe-area-inset-bottom,0px) + 32px)",
        maxHeight: "80vh", overflowY: "auto",
        animation: "da-sheet-up 0.28s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: "rgba(255,255,255,0.15)",
          margin: "12px auto 28px",
        }} />

        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "rgba(203,178,124,0.5)",
          fontFamily: "var(--font-ui, system-ui)", marginBottom: 10,
        }}>
          About
        </div>

        <h2 style={{
          fontFamily: "var(--font-ui, system-ui)", fontSize: 24, fontWeight: 300,
          color: "var(--text-primary)", letterSpacing: "-0.02em",
          margin: "0 0 20px",
        }}>
          BibleProject
        </h2>

        <p style={{
          fontFamily: "var(--font-body, Georgia, serif)", fontSize: 15,
          lineHeight: 1.8, color: "var(--text-primary)", opacity: 0.82,
          margin: "0 0 16px",
        }}>
          BibleProject is a nonprofit organization dedicated to helping people encounter
          Scripture as a unified story that leads to Jesus. They create free educational
          resources — videos, podcasts, and classes — designed to make the Bible accessible
          and transformative for everyone.
        </p>

        <p style={{
          fontFamily: "var(--font-body, Georgia, serif)", fontSize: 15,
          lineHeight: 1.8, color: "var(--text-primary)", opacity: 0.82,
          margin: "0 0 16px",
        }}>
          Founded in 2014 by Tim Mackie and Jon Collins, BibleProject began with a simple
          conviction: biblical scholarship and visual storytelling belong together. Tim brought
          deep knowledge of the biblical text; Jon brought the craft of making complex ideas
          understandable. Together they built something that has now reached hundreds of
          millions of people across 50+ languages.
        </p>

        <p style={{
          fontFamily: "var(--font-body, Georgia, serif)", fontSize: 15,
          lineHeight: 1.8, color: "var(--text-primary)", opacity: 0.82,
          margin: "0 0 28px",
        }}>
          Their approach is rooted in the belief that the Bible is one cohesive narrative
          — Messianic, communal, ancient, and alive — meant for lifelong meditation, not
          just information. Every video, word study, and podcast is designed to help
          readers see Scripture's deep unity and encounter the God it reveals.
        </p>

        <a
          href="https://bibleproject.com/about/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            height: 48, borderRadius: 100, textDecoration: "none",
            background: "rgba(203,178,124,0.1)",
            border: "1px solid rgba(203,178,124,0.25)",
            fontFamily: "var(--font-ui, system-ui)", fontSize: 14,
            color: "rgba(203,178,124,0.85)", letterSpacing: "0.02em",
          }}
        >
          Visit BibleProject.com
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </>
  );
}

/* ─── Sticky Collapsed Header ─────────────────────────────────────── */
function StickyHeader({ onBack, visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
      padding: "calc(env(safe-area-inset-top, 0px) + 10px) 16px 10px",
      background: "rgba(12,12,9,0.92)",
      backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", gap: 12,
      animation: "da-fade-in 0.2s ease",
    }}>
      <button
        onClick={onBack}
        style={{
          height: 32, borderRadius: 8, padding: "0 10px 0 7px",
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)",
          cursor: "pointer", color: "var(--text-primary)",
          display: "flex", alignItems: "center", gap: 4,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        <span style={{ fontSize: 12, fontFamily: "var(--font-ui, system-ui)", opacity: 0.7 }}>Back</span>
      </button>
      <span style={{
        fontFamily: "var(--font-ui, system-ui)", fontSize: 16, fontWeight: 400,
        color: "var(--text-primary)",
      }}>
        The Bible Project
      </span>
    </div>
  );
}

/* ─── Collection Detail ───────────────────────────────────────────── */
function CollectionDetail({ title, items, coverImage, description, base, onPressCard, onBack }) {
  return (
    <div style={{
      position: "absolute", inset: 0, background: "var(--bg-app)",
      display: "flex", flexDirection: "column",
      animation: "bp-slide-in 0.28s cubic-bezier(0.4,0,0.2,1)", zIndex: 10,
    }}>
      <div style={{ position: "relative", width: "100%", height: 260, flexShrink: 0, overflow: "hidden" }}>
        {coverImage && (
          <img
            src={`${base}${coverImage}`}
            alt={title}
            style={{ width: "100%", height: "110%", objectFit: "cover", opacity: 0.75, objectPosition: "center top" }}
          />
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(14,14,10,0.35) 0%, rgba(14,14,10,1.0) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 120%, rgba(203,178,124,0.06) 0%, transparent 60%)",
        }} />
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: "calc(env(safe-area-inset-top, 0px) + 12px)", left: 16,
            height: 34, borderRadius: 9, padding: "0 12px 0 8px",
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
            cursor: "pointer", color: "var(--text-primary)",
            display: "flex", alignItems: "center", gap: 5,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span style={{ fontSize: 13, fontFamily: "var(--font-ui, system-ui)", opacity: 0.85 }}>Back</span>
        </button>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 22px" }}>
          <h1 style={{
            fontFamily: "var(--font-ui, system-ui)", fontSize: 28, fontWeight: 300,
            color: "var(--text-primary)", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 8px",
          }}>
            {title}
          </h1>
          {description && (
            <p style={{
              fontFamily: "var(--font-body, Georgia, serif)", fontSize: 13,
              color: "var(--text-primary)", opacity: 0.5, lineHeight: 1.65, margin: 0,
            }}>
              {description}
            </p>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onPressCard(s)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 12,
                background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                cursor: "pointer", textAlign: "left",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div style={{
                width: 22, flexShrink: 0, textAlign: "center",
                fontSize: 12, fontFamily: "var(--font-ui, system-ui)",
                color: "rgba(255,255,255,0.2)", fontWeight: 300,
              }}>
                {i + 1}
              </div>
              <div style={{
                width: 80, height: 50, borderRadius: 8, overflow: "hidden",
                flexShrink: 0, background: "rgba(203,178,124,0.06)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
              }}>
                {s.coverVideoId && (
                  <img
                    src={`https://img.youtube.com/vi/${s.coverVideoId}/hqdefault.jpg`}
                    alt={s.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.88 }}
                  />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase",
                  color: "rgba(203,178,124,0.42)", fontFamily: "var(--font-ui, system-ui)", marginBottom: 3,
                }}>
                  {s._isGroup ? `${s.parts.length} Parts` : s.subtitle}
                </div>
                <div style={{
                  fontSize: 14, fontFamily: "var(--font-ui, system-ui)",
                  color: "var(--text-primary)", opacity: 0.88,
                  lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {s.title}
                </div>
              </div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.2)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
        <div style={{ height: "calc(env(safe-area-inset-bottom,0px) + 40px)" }} />
      </div>
    </div>
  );
}

/* ─── Video Detail Screen ─────────────────────────────────────────── */
function VideoDetailScreen({ seriesMeta, base, translation, onContinue, onBack }) {
  const [seriesData, setSeriesData] = useState(null);
  const [activePill, setActivePill] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    const file = seriesMeta.seriesFile ?? "series.json";
    fetch(`${base}data/devotionals/${seriesMeta.id}/${file}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.videoId && Array.isArray(data.days)) {
          data.days = data.days.map((d) => (d.videoId ? d : { ...d, videoId: data.videoId }));
        }
        setSeriesData(data);
      })
      .catch(() => {});
  }, [seriesMeta.id, base]);

  const day = seriesData?.days?.[0] ?? null;
  const videoId = seriesMeta.coverVideoId;
  const crossRefPills = day?.crossRefPills ?? [];
  const description = seriesData?.description ?? seriesMeta.description ?? "";

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "var(--bg-app)",
      display: "flex", flexDirection: "column",
      animation: "bp-slide-in 0.28s cubic-bezier(0.4,0,0.2,1)",
      zIndex: 15,
    }}>

      {/* ── Sticky header ── */}
      <div style={{
        flexShrink: 0,
        padding: "calc(env(safe-area-inset-top, 0px) + 10px) 16px 10px",
        background: "rgba(12,12,9,0.97)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: 10,
        zIndex: 2,
      }}>
        <button
          onClick={onBack}
          style={{
            height: 34, borderRadius: 9, padding: "0 12px 0 8px",
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)",
            cursor: "pointer", color: "var(--text-primary)",
            display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span style={{ fontSize: 13, fontFamily: "var(--font-ui, system-ui)", opacity: 0.75 }}>Back</span>
        </button>

        {/* Centered title */}
        <div style={{ flex: 1, textAlign: "center", overflow: "hidden" }}>
          <div style={{
            fontSize: 14, fontFamily: "var(--font-ui, system-ui)", fontWeight: 500,
            color: "var(--text-primary)", opacity: 0.82,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {seriesMeta.title}
          </div>
        </div>

        {/* Right balance spacer */}
        <div style={{ width: 68, flexShrink: 0 }} />
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>

        {/* Video player */}
        <div style={{ padding: "20px 16px 0" }}>
          <div style={{
            width: "100%", aspectRatio: "16/9",
            borderRadius: 16, overflow: "hidden",
            background: "#080806",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 12px 60px rgba(0,0,0,0.8)",
          }}>
            {videoId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                title={seriesMeta.title}
              />
            ) : (
              <div style={{
                width: "100%", height: "100%",
                background: "linear-gradient(135deg, rgba(203,178,124,0.08), rgba(10,10,8,0.9))",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  border: "2px solid rgba(203,178,124,0.25)",
                  borderTopColor: "rgba(203,178,124,0.7)",
                  animation: "da-spin 0.7s linear infinite",
                }} />
              </div>
            )}
          </div>

          {/* Ambient glow beneath player */}
          <div style={{
            height: 40, margin: "0 40px",
            background: "radial-gradient(ellipse at 50% 0%, rgba(203,178,124,0.06) 0%, transparent 70%)",
            filter: "blur(12px)",
            transform: "translateY(-20px)",
            pointerEvents: "none",
          }} />
        </div>

        {/* Source / Collection card */}
        <div style={{ padding: "4px 16px 0" }}>
          <button
            onClick={onBack}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "13px 14px", borderRadius: 13,
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              cursor: "pointer", textAlign: "left",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* BP logo mark */}
            <div style={{
              width: 38, height: 38, borderRadius: 9, flexShrink: 0,
              background: "rgba(203,178,124,0.09)",
              border: "1px solid rgba(203,178,124,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="rgba(203,178,124,0.75)" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontFamily: "var(--font-ui, system-ui)",
                color: "var(--text-primary)", opacity: 0.82, marginBottom: 2,
              }}>
                More from BibleProject
              </div>
              <div style={{
                fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase",
                color: "rgba(203,178,124,0.48)", fontFamily: "var(--font-ui, system-ui)",
              }}>
                Animated Bible Series
              </div>
            </div>

            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.2)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Video info */}
        <div style={{ padding: "22px 20px 0" }}>
          {seriesMeta.subtitle && (
            <div style={{
              fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
              color: "rgba(203,178,124,0.45)", fontFamily: "var(--font-ui, system-ui)", marginBottom: 7,
            }}>
              {seriesMeta.subtitle}
            </div>
          )}
          <h1 style={{
            fontFamily: "var(--font-ui, system-ui)", fontSize: 24, fontWeight: 300,
            color: "var(--text-primary)", lineHeight: 1.2, letterSpacing: "-0.02em",
            margin: "0 0 16px",
          }}>
            {seriesMeta.title}
          </h1>

          {/* Description with Read More */}
          {description && (
            <>
              <p style={{
                fontFamily: "var(--font-body, Georgia, serif)", fontSize: 15,
                color: "var(--text-primary)", opacity: 0.62, lineHeight: 1.82,
                margin: 0,
                display: descExpanded ? "block" : "-webkit-box",
                WebkitLineClamp: descExpanded ? undefined : 3,
                WebkitBoxOrient: "vertical",
                overflow: descExpanded ? "visible" : "hidden",
              }}>
                {description}
              </p>
              {!descExpanded && description.length > 100 && (
                <button
                  onClick={() => setDescExpanded(true)}
                  style={{
                    background: "none", border: "none", padding: "7px 0 0",
                    cursor: "pointer",
                    fontSize: 12.5, fontFamily: "var(--font-ui, system-ui)",
                    color: "rgba(203,178,124,0.6)",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  Read More
                </button>
              )}
            </>
          )}
        </div>

        {/* Related Scripture pills */}
        {crossRefPills.length > 0 && (
          <div style={{ padding: "26px 20px 0" }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
              color: "rgba(203,178,124,0.38)", fontFamily: "var(--font-ui, system-ui)",
              marginBottom: 13,
            }}>
              Related Scripture
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {crossRefPills.map((pill) => (
                <button
                  key={pill}
                  onClick={() => setActivePill(pill)}
                  style={{
                    padding: "7px 14px", borderRadius: 100, cursor: "pointer",
                    background: "rgba(203,178,124,0.07)",
                    border: "1px solid rgba(203,178,124,0.22)",
                    fontSize: 12.5, fontFamily: "var(--font-ui, system-ui)",
                    color: "rgba(203,178,124,0.88)", letterSpacing: "0.02em",
                    WebkitTapHighlightColor: "transparent",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{
          height: 1, margin: "28px 20px 0",
          background: "linear-gradient(90deg, rgba(203,178,124,0.15), transparent)",
        }} />

        {/* Daily Abiding CTA */}
        <div style={{ padding: "22px 20px 0" }}>
          <div style={{
            fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "rgba(203,178,124,0.3)", fontFamily: "var(--font-ui, system-ui)",
            textAlign: "center", marginBottom: 14,
          }}>
            Daily Abiding
          </div>
          <button
            onClick={() => day && onContinue(day)}
            disabled={!day}
            style={{
              width: "100%", height: 54, borderRadius: 100,
              cursor: day ? "pointer" : "default",
              background: day ? "rgba(203,178,124,0.12)" : "rgba(255,255,255,0.04)",
              border: day
                ? "1px solid rgba(203,178,124,0.3)"
                : "1px solid rgba(255,255,255,0.06)",
              fontFamily: "var(--font-ui, system-ui)", fontSize: 15, fontWeight: 500,
              color: day ? "rgba(203,178,124,0.95)" : "rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "all 0.2s",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {day ? (
              <>
                Continue to Reflection
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              <div style={{
                width: 16, height: 16, borderRadius: "50%",
                border: "2px solid rgba(203,178,124,0.2)",
                borderTopColor: "rgba(203,178,124,0.6)",
                animation: "da-spin 0.7s linear infinite",
              }} />
            )}
          </button>
        </div>

        <div style={{ height: "calc(env(safe-area-inset-bottom,0px) + 44px)" }} />
      </div>

      {/* Verse bottom sheet */}
      {activePill && (
        <VerseSheetBP
          pill={activePill}
          translation={translation}
          base={base}
          onClose={() => setActivePill(null)}
        />
      )}
    </div>
  );
}

/* ─── Book Detail (multi-part series) ────────────────────────────── */
function BookDetailView({ group, onPressCard, onBack }) {
  return (
    <div style={{
      position: "absolute", inset: 0, background: "var(--bg-app)",
      display: "flex", flexDirection: "column", overflowY: "auto",
      WebkitOverflowScrolling: "touch",
      animation: "bp-slide-in 0.28s cubic-bezier(0.4,0,0.2,1)", zIndex: 10,
    }}>
      {/* Banner */}
      <div style={{ position: "relative", width: "100%", height: 220, flexShrink: 0, overflow: "hidden" }}>
        {group.coverVideoId && (
          <img
            src={`https://img.youtube.com/vi/${group.coverVideoId}/hqdefault.jpg`}
            alt={group.title}
            style={{ width: "100%", height: "120%", objectFit: "cover", opacity: 0.6, objectPosition: "center" }}
          />
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(14,14,10,0.35) 0%, rgba(14,14,10,1.0) 100%)",
        }} />
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: "calc(env(safe-area-inset-top, 0px) + 12px)", left: 16,
            height: 34, borderRadius: 9, padding: "0 12px 0 8px",
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
            cursor: "pointer", color: "var(--text-primary)",
            display: "flex", alignItems: "center", gap: 5,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span style={{ fontSize: 13, fontFamily: "var(--font-ui, system-ui)", opacity: 0.85 }}>Back</span>
        </button>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 20px" }}>
          <h1 style={{
            fontFamily: "var(--font-ui, system-ui)", fontSize: 28, fontWeight: 300,
            color: "var(--text-primary)", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 4px",
          }}>
            {group.title}
          </h1>
          <div style={{
            fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "rgba(203,178,124,0.5)", fontFamily: "var(--font-ui, system-ui)",
          }}>
            {group.parts.length} Parts · BibleProject
          </div>
        </div>
      </div>

      {/* Parts list */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {group.parts.map((part, i) => {
          const subtitle = part.title.includes(":") ? part.title.split(":").slice(1).join(":").trim() : part.subtitle;
          return (
            <button
              key={part.id}
              onClick={() => onPressCard(part)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 12,
                background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                cursor: "pointer", textAlign: "left",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div style={{
                width: 88, height: 52, borderRadius: 8, overflow: "hidden",
                flexShrink: 0, background: "rgba(203,178,124,0.06)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
              }}>
                {part.coverVideoId && (
                  <img
                    src={`https://img.youtube.com/vi/${part.coverVideoId}/hqdefault.jpg`}
                    alt={part.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.88 }}
                  />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "rgba(203,178,124,0.55)", fontFamily: "var(--font-ui, system-ui)", marginBottom: 4,
                }}>
                  Part {i + 1}
                </div>
                <div style={{
                  fontSize: 14, fontFamily: "var(--font-ui, system-ui)",
                  color: "var(--text-primary)", opacity: 0.9,
                  lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {subtitle}
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, opacity: 0.3 }}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          );
        })}
      </div>

      <div style={{ height: "calc(env(safe-area-inset-bottom,0px) + 40px)" }} />
    </div>
  );
}

/* ─── Bible Project Hub ───────────────────────────────────────────── */
export default function BibleProjectHub({
  index,
  onSelectSeries,
  onSelectSeriesAtReflection,
  onBack,
  base,
  translation = "KJV",
}) {
  const [subView, setSubView] = useState(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const bpSeries = index.filter((s) => s.source === "bible-project");

  const sections = [
    {
      id: "old-testament",
      title: "Old Testament",
      description: "Walk through the Hebrew Scriptures through animated visual teachings.",
      coverImage: "bible_project_old_testament.png",
      items: groupByBook(bpSeries.filter((s) => s.group === "old-testament")),
    },
    {
      id: "new-testament",
      title: "New Testament",
      description: "Watch through the life of Jesus and the early church.",
      coverImage: "bible_project_new_testament.png",
      items: groupByBook(bpSeries.filter((s) => s.group === "new-testament")),
    },
  ].filter((s) => s.items.length > 0);

  function handlePressCard(item, prev = null) {
    if (item._isGroup) {
      setSubView({ type: "book", group: item, prev });
    } else {
      setSubView({ type: "video", seriesMeta: item, prev });
    }
  }

  const handleScroll = useCallback((e) => {
    const y = e.currentTarget.scrollTop;
    setHeaderVisible(y > 200);
  }, []);

  function handleStartWatching() {
    if (bpSeries.length > 0) {
      setSubView({ type: "video", seriesMeta: bpSeries[0] });
    }
  }

  // ── Sub-view: Video Detail ──
  if (subView?.type === "video") {
    return (
      <div style={{ position: "absolute", inset: 0, background: "var(--bg-app)" }}>
        <VideoDetailScreen
          seriesMeta={subView.seriesMeta}
          base={base}
          translation={translation}
          onBack={() => setSubView(subView.prev ?? null)}
          onContinue={(day) => {
            setSubView(null);
            onSelectSeriesAtReflection(subView.seriesMeta, day);
          }}
        />
      </div>
    );
  }

  // ── Sub-view: Book Detail (multi-part) ──
  if (subView?.type === "book") {
    return (
      <div style={{ position: "absolute", inset: 0, background: "var(--bg-app)" }}>
        <BookDetailView
          group={subView.group}
          onPressCard={(part) => handlePressCard(part, subView)}
          onBack={() => setSubView(subView.prev ?? null)}
        />
      </div>
    );
  }

  // ── Sub-view: Collection Detail ──
  if (subView?.type === "collection") {
    return (
      <div style={{ position: "absolute", inset: 0, background: "var(--bg-app)" }}>
        <CollectionDetail
          title={subView.title}
          items={subView.items}
          coverImage={subView.coverImage}
          description={subView.description}
          base={base}
          onPressCard={(s) => handlePressCard(s, subView)}
          onBack={() => setSubView(subView.prev ?? null)}
        />
      </div>
    );
  }

  // ── Main hub ──
  return (
    <>
      <style>{`
        @keyframes bp-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes da-spin { to { transform: rotate(360deg) } }
        @keyframes da-fade-in { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes da-sheet-up { from { transform:translateY(100%) } to { transform:translateY(0) } }
      `}</style>

      <div style={{ position: "absolute", inset: 0, background: "var(--bg-app)" }}>
        <StickyHeader onBack={onBack} visible={headerVisible} />

        <div
          onScroll={handleScroll}
          style={{ height: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch" }}
        >
          <CinematicHero base={base} onBack={onBack} />

          {/* CTAs — directly beneath the hero image */}
          <div style={{ padding: "20px 20px 0", display: "flex", gap: 10 }}>
            <button
              onClick={handleStartWatching}
              style={{
                flex: 1, height: 48, borderRadius: 100, cursor: "pointer",
                background: "rgba(203,178,124,0.9)", border: "none",
                fontFamily: "var(--font-ui, system-ui)", fontSize: 14, fontWeight: 600,
                color: "#141410", letterSpacing: "0.01em",
                WebkitTapHighlightColor: "transparent",
                boxShadow: "0 4px 20px rgba(203,178,124,0.2)",
              }}
            >
              Start Watching
            </button>
            <button
              onClick={() => setShowAbout(true)}
              style={{
                flexShrink: 0, height: 48, borderRadius: 100, cursor: "pointer",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontFamily: "var(--font-ui, system-ui)", fontSize: 14,
                color: "rgba(255,255,255,0.7)", padding: "0 22px",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              More Info
            </button>
          </div>

          {/* Section intro — breathing room before rows */}
          <div style={{ padding: "32px 20px 20px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                color: "rgba(203,178,124,0.35)", fontFamily: "var(--font-ui, system-ui)",
                whiteSpace: "nowrap",
              }}>
                Explore Series
              </div>
              <div style={{
                flex: 1, height: 1,
                background: "linear-gradient(90deg, rgba(203,178,124,0.14), transparent)",
              }} />
            </div>
          </div>

          {/* Content rows */}
          {sections.map((section) => (
            <MediaSection
              key={section.id}
              title={section.title}
              items={section.items}
              onPressCard={(s) => handlePressCard(s)}
              onSeeAll={() =>
                setSubView({
                  type: "collection",
                  title: section.title,
                  items: section.items,
                  coverImage: section.coverImage,
                  description: section.description,
                })
              }
            />
          ))}

          <div style={{ height: "calc(env(safe-area-inset-bottom,0px) + 48px)" }} />
        </div>
      </div>

      {showAbout && <AboutSheet onClose={() => setShowAbout(false)} />}
    </>
  );
}
