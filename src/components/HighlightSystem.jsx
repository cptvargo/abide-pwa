/**
 * HighlightSystem.jsx - YouVersion-Style Highlighting
 * Clean bottom panel with theme colors and conditional clear icon
 */

import DialogueBottomSheet from "./DialogueBottomSheet";

/* ===============================
   Theme Color Definitions - Premium & Distinct
================================ */
const THEME_COLORS = {
  classic: [
    { id: "gold", color: "rgba(203, 178, 124, 0.50)", name: "Gold" }, // Rich warm gold from screenshot
    { id: "amber", color: "rgba(255, 191, 105, 0.35)", name: "Amber" }, // Lighter, peachy warmth
    { id: "bronze", color: "rgba(139, 115, 85, 0.45)", name: "Bronze" }, // Deep, earthy tone
  ],
  "still-waters": [
    { id: "teal", color: "rgba(0, 128, 128, 0.35)", name: "Teal" }, // Pure, saturated teal
    { id: "aqua", color: "rgba(127, 255, 212, 0.30)", name: "Aqua" }, // Light, refreshing aqua
    { id: "deep-sea", color: "rgba(25, 89, 89, 0.40)", name: "Deep Sea" }, // Dark, contemplative
  ],
  "stone-fire": [
    { id: "flame", color: "rgba(255, 99, 71, 0.38)", name: "Flame" }, // Bright, energetic orange-red
    { id: "sunset", color: "rgba(255, 140, 0, 0.35)", name: "Sunset" }, // Warm orange
    { id: "ember", color: "rgba(178, 34, 34, 0.40)", name: "Ember" }, // Deep, smoldering red
  ],
  "olive-parchment": [
    { id: "sage", color: "rgba(143, 151, 121, 0.40)", name: "Sage" }, // Muted, herbal green
    { id: "wheat", color: "rgba(196, 164, 132, 0.38)", name: "Wheat" }, // Warm, golden beige
    { id: "moss", color: "rgba(101, 104, 71, 0.42)", name: "Moss" }, // Deep forest green
  ],
  parchment: [
    { id: "sepia", color: "rgba(112, 66, 20, 0.35)", name: "Sepia" }, // Rich brown with red undertones
    { id: "sand", color: "rgba(194, 178, 128, 0.38)", name: "Sand" }, // Light, warm tan
    { id: "mahogany", color: "rgba(75, 35, 15, 0.42)", name: "Mahogany" }, // Deep, luxurious brown
  ],
};

/* ===============================
   Helper: Format Verse Reference
================================ */
function formatVerseReference(book, chapter, verses, translation) {
  const verseNums = verses.map((v) => v.verse).sort((a, b) => a - b);

  if (verseNums.length === 0) return "";

  // Check if consecutive
  let ranges = [];
  let start = verseNums[0];
  let end = verseNums[0];

  for (let i = 1; i < verseNums.length; i++) {
    if (verseNums[i] === end + 1) {
      end = verseNums[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = end = verseNums[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);

  return `${book} ${chapter}:${ranges.join(",")} ${translation}`;
}

/* ===============================
   Helper: Get Color Object from ID
================================ */
export function getColorFromId(colorId, theme) {
  const colors = THEME_COLORS[theme] || THEME_COLORS.classic;
  return colors.find((c) => c.id === colorId) || colors[0];
}

/* ===============================
   Helper: Get Theme Colors
================================ */
export function getThemeColors(theme) {
  return THEME_COLORS[theme] || THEME_COLORS.classic;
}

/* ===============================
   Slim Highlight Pill Bar
================================ */
export function HighlightPanel({
  theme,
  book,
  chapter,
  selectedVerses,
  translation,
  existingColorId,
  onSelectColor,
  onClear,
  onCancel,
}) {
  const colors = THEME_COLORS[theme] || THEME_COLORS.classic;
  const reference = formatVerseReference(book, chapter, selectedVerses, translation);
  const hasExisting = !!existingColorId;

  return (
    <>
      <style>{`
        @keyframes hl-slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 12,
          animation: "hl-slide-up 0.28s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          style={{
            background: "var(--bg-menu)",
            borderRadius: 20,
            border: "1px solid rgba(var(--accent-rgb,203,178,124),0.18)",
            boxShadow: "0 -4px 32px rgba(0,0,0,0.35)",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {/* Reference */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-ui, system-ui)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "var(--text-accent)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {reference}
            </div>
            <div
              style={{
                fontFamily: "var(--font-ui, system-ui)",
                fontSize: 10,
                color: "var(--text-primary)",
                opacity: 0.4,
                marginTop: 2,
                letterSpacing: "0.04em",
              }}
            >
              Tap a color to highlight
            </div>
          </div>

          {/* Clear button — only when re-highlighting */}
          {hasExisting && (
            <button
              onClick={onClear}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1.5px solid rgba(var(--accent-rgb,203,178,124),0.3)",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-primary)",
                opacity: 0.55,
                cursor: "pointer",
                flexShrink: 0,
                WebkitTapHighlightColor: "transparent",
              }}
              title="Remove highlight"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}

          {/* Color dots */}
          {colors.map((c) => {
            const isActive = existingColorId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectColor(c, [])}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: c.color,
                  border: isActive
                    ? "2.5px solid var(--text-accent)"
                    : "2px solid rgba(var(--accent-rgb,203,178,124),0.2)",
                  boxShadow: isActive ? "0 0 0 2px var(--text-accent)" : "none",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "transform 0.12s ease, box-shadow 0.12s ease",
                  WebkitTapHighlightColor: "transparent",
                }}
                title={c.name}
              />
            );
          })}

          {/* Dismiss */}
          <button
            onClick={onCancel}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.18)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-primary)",
              opacity: 0.5,
              fontSize: 13,
              cursor: "pointer",
              flexShrink: 0,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
}

/* ===============================
   Export DialogueBottomSheet
================================ */
export { DialogueBottomSheet };
