/**
 * HighlightSystem.jsx - Multi-Color Highlighting with Dialogue Bottom Sheet
 * Theme-aware colors with 3 options per theme
 * NOW SAVES TO DIALOGUES SYSTEM
 */

import { useState, useEffect, useRef } from "react";
import DialogueBottomSheet from "./DialogueBottomSheet";

/* ===============================
   Theme-Aware Highlight Colors (3 per theme)
================================ */
const THEME_COLORS = {
  classic: [
    {
      id: "primary",
      color: "rgba(203, 178, 124, 0.35)",
      name: "Gold",
      textColor: "#2c2416",
    },
    {
      id: "secondary",
      color: "rgba(203, 178, 124, 0.20)",
      name: "Light Gold",
      textColor: "#2c2416",
    },
    {
      id: "accent",
      color: "rgba(139, 115, 85, 0.40)",
      name: "Bronze",
      textColor: "#2c2416",
    },
  ],
  "still-waters": [
    {
      id: "primary",
      color: "rgba(31, 111, 120, 0.30)",
      name: "Teal",
      textColor: "#0a3940",
    },
    {
      id: "secondary",
      color: "rgba(31, 111, 120, 0.18)",
      name: "Light Teal",
      textColor: "#0a3940",
    },
    {
      id: "accent",
      color: "rgba(16, 70, 77, 0.35)",
      name: "Deep Teal",
      textColor: "#0a3940",
    },
  ],
  "stone-fire": [
    {
      id: "primary",
      color: "rgba(249, 115, 22, 0.30)",
      name: "Orange",
      textColor: "#7c2d12",
    },
    {
      id: "secondary",
      color: "rgba(249, 115, 22, 0.18)",
      name: "Light Orange",
      textColor: "#7c2d12",
    },
    {
      id: "accent",
      color: "rgba(194, 65, 12, 0.35)",
      name: "Deep Orange",
      textColor: "#7c2d12",
    },
  ],
  "olive-parchment": [
    {
      id: "primary",
      color: "rgba(157, 143, 111, 0.35)",
      name: "Olive",
      textColor: "#403a2c",
    },
    {
      id: "secondary",
      color: "rgba(157, 143, 111, 0.20)",
      name: "Light Olive",
      textColor: "#403a2c",
    },
    {
      id: "accent",
      color: "rgba(107, 97, 75, 0.40)",
      name: "Deep Olive",
      textColor: "#403a2c",
    },
  ],
  parchment: [
    {
      id: "primary",
      color: "rgba(139, 115, 85, 0.35)",
      name: "Brown",
      textColor: "#0d0a06",
    },
    {
      id: "secondary",
      color: "rgba(139, 115, 85, 0.20)",
      name: "Light Brown",
      textColor: "#0d0a06",
    },
    {
      id: "accent",
      color: "rgba(90, 73, 54, 0.40)",
      name: "Deep Brown",
      textColor: "#0d0a06",
    },
  ],
};

/* ===============================
   Selection Toolbar
================================ */
export function SelectionToolbar({ selectedCount, onHighlight, onCancel }) {
  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg flex items-center gap-4 z-40"
      style={{
        background: "var(--bg-nav)",
        animation: "slideUp 0.3s ease-out",
      }}
    >
      <span className="text-[var(--text-inverse)] text-sm font-medium">
        {selectedCount} verse{selectedCount > 1 ? "s" : ""} selected
      </span>

      <button
        onClick={onHighlight}
        className="px-4 py-2 rounded-full font-semibold text-sm transition"
        style={{
          background: "var(--text-inverse)",
          color: "var(--text-accent)",
        }}
      >
        Highlight
      </button>

      <button
        onClick={onCancel}
        className="text-[var(--text-inverse)] opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

/* ===============================
   Color Picker Modal
================================ */
export function ColorPicker({
  theme,
  existingHighlight,
  onSelectColor,
  onRemove,
  onCancel,
}) {
  const colors = THEME_COLORS[theme] || THEME_COLORS.classic;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-end"
      style={{ backdropFilter: "blur(8px)" }}
      onClick={onCancel}
    >
      <div
        className="bg-[var(--bg-menu)] w-full rounded-t-3xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
            Choose Highlight Color
          </h2>

          <div className="space-y-3 mb-6">
            {colors.map((colorOption) => {
              const isActive =
                existingHighlight &&
                existingHighlight.color.id === colorOption.id;

              return (
                <button
                  key={colorOption.id}
                  onClick={() => {
                    if (isActive) {
                      onRemove();
                    } else {
                      onSelectColor(colorOption);
                    }
                  }}
                  className="w-full p-4 rounded-xl transition-all border-2 relative"
                  style={{
                    background: colorOption.color,
                    borderColor: isActive
                      ? "var(--text-accent)"
                      : "transparent",
                    boxShadow: isActive
                      ? "0 0 0 2px var(--text-accent)"
                      : "none",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {colorOption.name}
                      </span>

                      {existingHighlight && isActive && (
                        <span className="text-xs opacity-50 mt-1 text-[var(--text-primary)]">
                          Tap again to clear
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg"
                        style={{ background: colorOption.color }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl font-semibold"
            style={{
              background: "rgba(0, 0, 0, 0.2)",
              color: "var(--text-primary)",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   Export DialogueBottomSheet
================================ */
export { DialogueBottomSheet };

/* ===============================
   Helper Functions
================================ */
export function getThemeColors(theme) {
  return THEME_COLORS[theme] || THEME_COLORS.classic;
}

export function getHighlightById(highlights, id) {
  return highlights.find((h) => h.id === id);
}
