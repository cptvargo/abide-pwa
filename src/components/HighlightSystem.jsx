/**
 * HighlightSystem.jsx - YouVersion-Style Highlighting
 * Clean bottom panel with theme colors and conditional clear icon
 */

import { useState, useEffect } from "react";
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
  const reference = formatVerseReference(
    book,
    chapter,
    selectedVerses,
    translation,
  );
  const hasExistingHighlight = !!existingColorId;

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
          {/* Clear Button (only if highlighted) */}
          {hasExistingHighlight && (
            <button
              onClick={onClear}
              className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-transform active:scale-95"
              style={{
                borderColor: "var(--text-primary)",
                opacity: 0.6,
              }}
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

          {/* Color Swatches */}
          {colors.map((colorOption) => {
            const isActive = existingColorId === colorOption.id;

            return (
              <button
                key={colorOption.id}
                onClick={() => onSelectColor(colorOption)}
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
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/* ===============================
   Export DialogueBottomSheet
================================ */
export { DialogueBottomSheet };
