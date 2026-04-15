/**
 * HighlightSystem.jsx - YouVersion-Style Highlighting
 * Clean bottom panel with theme colors and conditional clear icon
 */

import { useState, useEffect, useRef } from "react";
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
   YouVersion-Style Bottom Panel
================================ */
const DEFAULT_TAGS = [
  "Prayer",
  "Promise",
  "Warning",
  "Prophecy",
  "Wisdom",
  "Gospel",
];

export function HighlightPanel({
  theme,
  book,
  chapter,
  selectedVerses,
  translation,
  existingColorId,
  existingTags = [],
  onSelectColor,
  onClear,
  onCancel,
  onTagsChange,
}) {
  const colors = THEME_COLORS[theme] || THEME_COLORS.classic;
  const reference = formatVerseReference(
    book,
    chapter,
    selectedVerses,
    translation,
  );
  const hasExistingHighlight = !!existingColorId;

  const TAG_PALETTE = [
    "#e07b5b",
    "#d4a843",
    "#7db87d",
    "#5b9bd4",
    "#9b7dd4",
    "#d47db8",
    "#5bbdb8",
    "#b8845b",
  ];

  function getTagColor(tag) {
    const stored = JSON.parse(localStorage.getItem("customTagColors") || "{}");
    return stored[tag] || null;
  }

  function assignTagColor(tag, color) {
    const stored = JSON.parse(localStorage.getItem("customTagColors") || "{}");
    stored[tag] = color;
    localStorage.setItem("customTagColors", JSON.stringify(stored));
    return color;
  }

  const [activeColor, setActiveColor] = useState(
    existingColorId
      ? colors.find((c) => c.id === existingColorId) || null
      : null,
  );
  const [selectedTags, setSelectedTags] = useState(existingTags);
  const [customInput, setCustomInput] = useState("");
  const [pickedColor, setPickedColor] = useState(TAG_PALETTE[0]);
  const [allTags, setAllTags] = useState(() => {
    const saved = localStorage.getItem("customTags");
    return saved ? JSON.parse(saved) : [];
  });
  const inputRef = useRef(null);

  function toggleTag(tag) {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(next);
    onTagsChange?.(next);
  }

  function addCustomTag() {
    const tag = customInput.trim();
    if (!tag) return;
    const newAll = allTags.includes(tag) ? allTags : [...allTags, tag];
    setAllTags(newAll);
    localStorage.setItem("customTags", JSON.stringify(newAll));
    assignTagColor(tag, pickedColor);
    if (!selectedTags.includes(tag)) {
      const next = [...selectedTags, tag];
      setSelectedTags(next);
      onTagsChange?.(next);
    }
    setCustomInput("");
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-menu)] rounded-t-3xl shadow-2xl"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)",
        animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div className="px-6 py-5">
        {/* Reference Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Currently Selected:
            </div>
            <div
              className="text-base font-bold mt-1"
              style={{ color: "var(--text-accent)" }}
            >
              {reference}
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(0, 0, 0, 0.2)",
              color: "var(--text-primary)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Color Swatches Row */}
        <div className="flex items-center gap-3 mb-4">
          {hasExistingHighlight && (
            <button
              onClick={onClear}
              className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-transform active:scale-95"
              style={{ borderColor: "var(--text-primary)", opacity: 0.6 }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
          )}
          {colors.map((colorOption) => {
            const isActive = activeColor?.id === colorOption.id;
            return (
              <button
                key={colorOption.id}
                onClick={() => setActiveColor(colorOption)}
                className="w-12 h-12 rounded-full border-2 transition-all active:scale-95"
                style={{
                  background: colorOption.color,
                  borderColor: isActive ? "var(--text-accent)" : "transparent",
                  boxShadow: isActive ? "0 0 0 2px var(--text-accent)" : "none",
                }}
                title={colorOption.name}
              />
            );
          })}
        </div>

        {/* Tags */}
        <div className="mt-1">
          <div
            className="text-xs font-semibold mb-2 opacity-60"
            style={{ color: "var(--text-primary)" }}
          >
            TAGS
          </div>
          {allTags.length === 0 && (
            <p
              className="text-xs opacity-40 mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              No tags yet — add one below
            </p>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              const tagColor = getTagColor(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="px-3 py-1 rounded-full text-sm transition-all active:scale-95"
                  style={{
                    background: active
                      ? tagColor || "var(--text-accent)"
                      : "rgba(0,0,0,0.15)",
                    color: active ? "#fff" : "var(--text-primary)",
                    border: `1px solid ${active ? tagColor || "var(--text-accent)" : "transparent"}`,
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          {/* Color dots for new tag */}
          <div className="flex gap-2 mb-2">
            {TAG_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setPickedColor(c)}
                className="w-6 h-6 rounded-full transition-all active:scale-95"
                style={{
                  background: c,
                  boxShadow:
                    pickedColor === c
                      ? `0 0 0 2px #fff, 0 0 0 3px ${c}`
                      : "none",
                }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
              placeholder="Add custom tag…"
              className="flex-1 rounded-full px-4 py-1.5 text-sm outline-none"
              style={{
                background: "rgba(0,0,0,0.15)",
                color: "var(--text-primary)",
                border: `1px solid ${pickedColor}`,
              }}
            />
            <button
              onClick={addCustomTag}
              className="px-4 py-1.5 rounded-full text-sm font-semibold active:scale-95"
              style={{ background: pickedColor, color: "#fff" }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={() =>
            activeColor && onSelectColor(activeColor, selectedTags)
          }
          disabled={!activeColor}
          className="w-full mt-4 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
          style={{
            background: activeColor ? "var(--text-accent)" : "rgba(0,0,0,0.15)",
            color: activeColor ? "#fff" : "var(--text-secondary)",
            opacity: activeColor ? 1 : 0.5,
          }}
        >
          {activeColor ? "Save Highlight" : "Select a color to highlight"}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ===============================
   Export DialogueBottomSheet
================================ */
export { DialogueBottomSheet };
