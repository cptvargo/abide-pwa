import { useState, useEffect } from "react";

export default function AuthorPage({ author, meta, series, onOpenSeries, onBack }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const base = import.meta.env.BASE_URL ?? "/";
  const imgSrc = meta.image ? `${base}${encodeURIComponent(meta.image)}` : null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "var(--bg-app)",
      overflowY: "auto", WebkitOverflowScrolling: "touch",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.35s ease",
    }}>

      {/* Floating back button */}
      <button
        onClick={onBack}
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top, 0px) + 14px)",
          left: 16, zIndex: 60,
          width: 36, height: 36, borderRadius: 9,
          background: "rgba(10,10,8,0.55)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.1)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>

      {/* ── A. Hero ── */}
      <div style={{ position: "relative", width: "100%", height: "58vh", minHeight: 320, overflow: "hidden" }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={author}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(160deg, rgba(203,178,124,0.08) 0%, rgba(10,10,8,1) 100%)",
          }} />
        )}
        {/* gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(10,10,8,0.15) 0%, rgba(10,10,8,0) 25%, rgba(10,10,8,0.7) 70%, rgba(10,10,8,1) 100%)",
        }} />
        {/* name + subtitle */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 28px 32px" }}>
          <h1 style={{
            fontFamily: "var(--font-ui, system-ui)",
            fontSize: 36, fontWeight: 300,
            color: "#fff", letterSpacing: "0.02em",
            lineHeight: 1.15, margin: "0 0 7px",
          }}>
            {author}
          </h1>
          <p style={{
            fontFamily: "var(--font-ui, system-ui)",
            fontSize: 11, letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(203,178,124,0.7)",
            margin: 0,
          }}>
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* ── B. About ── */}
      {meta.about && (
        <div style={{ padding: "44px 28px 36px" }}>
          <p style={{
            fontFamily: "var(--font-body, Georgia, serif)",
            fontStyle: "italic",
            fontSize: 15, lineHeight: 1.95,
            color: "var(--text-primary)", opacity: 0.72,
            margin: 0,
          }}>
            {meta.about}
          </p>
        </div>
      )}

      {/* ── C. Quote ── */}
      {meta.quote && (
        <div style={{ padding: "0 28px 48px" }}>
          <div style={{
            borderLeft: "2px solid rgba(203,178,124,0.3)",
            paddingLeft: 22,
          }}>
            <p style={{
              fontFamily: "var(--font-body, Georgia, serif)",
              fontStyle: "italic",
              fontSize: 17, lineHeight: 1.75,
              color: "rgba(203,178,124,0.85)",
              margin: 0,
            }}>
              "{meta.quote}"
            </p>
            <p style={{
              fontFamily: "var(--font-ui, system-ui)",
              fontSize: 11, letterSpacing: "0.08em",
              color: "rgba(203,178,124,0.4)",
              margin: "10px 0 0",
            }}>
              — {author}
            </p>
          </div>
        </div>
      )}

      {/* ── D. Devotional Collections ── */}
      {series.length > 0 && (
        <div style={{ padding: "0 20px 80px" }}>
          <div style={{
            fontFamily: "var(--font-ui, system-ui)",
            fontSize: 9, fontWeight: 600,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "rgba(203,178,124,0.4)",
            marginBottom: 16, paddingLeft: 4,
          }}>
            Devotionals
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {series.map((s) => (
              <button
                key={s.id}
                onClick={() => onOpenSeries(s)}
                className="dv-card"
                style={{
                  width: "100%", textAlign: "left",
                  padding: "22px 20px",
                  borderRadius: 16,
                  background: "rgba(203,178,124,0.04)",
                  border: "1px solid rgba(203,178,124,0.12)",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <div style={{
                  fontFamily: "var(--font-ui, system-ui)",
                  fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "rgba(203,178,124,0.4)", marginBottom: 7,
                }}>
                  {s.totalDays} Days{s.authorNote ? ` · ${s.authorNote}` : ""}
                </div>
                <h3 style={{
                  fontFamily: "var(--font-ui, system-ui)",
                  fontSize: 19, fontWeight: 300,
                  color: "var(--text-primary)",
                  letterSpacing: "0.01em",
                  margin: "0 0 10px",
                }}>
                  {s.title}
                </h3>
                <p style={{
                  fontFamily: "var(--font-body, Georgia, serif)",
                  fontSize: 13, lineHeight: 1.7,
                  color: "var(--text-secondary)", opacity: 0.6,
                  margin: "0 0 18px",
                }}>
                  {s.description}
                </p>
                <div style={{
                  fontFamily: "var(--font-ui, system-ui)",
                  fontSize: 12, letterSpacing: "0.05em",
                  color: "rgba(203,178,124,0.7)",
                }}>
                  Begin Journey →
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
