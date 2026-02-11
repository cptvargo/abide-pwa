/**
 * HighlightSystem.jsx - Multi-Color Highlighting with Ponder Mode
 * Theme-aware colors with 3 options per theme
 */

import { useState, useEffect } from "react";

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
export function ColorPicker({ theme, onSelectColor, onCancel }) {
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
            {colors.map((colorOption) => (
              <button
                key={colorOption.id}
                onClick={() => onSelectColor(colorOption)}
                className="w-full p-4 rounded-xl transition-all border-2"
                style={{
                  background: colorOption.color,
                  borderColor: "var(--text-accent)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-primary)]">
                    {colorOption.name}
                  </span>
                  <div
                    className="w-12 h-12 rounded-lg"
                    style={{ background: colorOption.color }}
                  />
                </div>
              </button>
            ))}
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
   Ponder Mode Prompt
================================ */
export function PonderPrompt({
  selectedVerses,
  highlightColor,
  onEnterPonder,
  onSkip,
}) {
  const verseRange =
    selectedVerses.length === 1
      ? selectedVerses[0].verse
      : `${selectedVerses[0].verse}-${selectedVerses[selectedVerses.length - 1].verse}`;

  const combinedText = selectedVerses.map((v) => v.text).join(" ");

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      style={{ backdropFilter: "blur(12px)" }}
    >
      <div
        className="bg-[var(--bg-menu)] w-[90%] max-w-[480px] rounded-3xl overflow-hidden"
        style={{
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div className="p-8 text-center border-b border-[var(--text-accent)]/20">
          <div className="mb-4">
            <svg
              viewBox="0 0 24 24"
              className="w-16 h-16 mx-auto text-[var(--text-accent)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2a7 7 0 0 0-4 12c.6.6 1 1.5 1 2.5V18h6v-1.5c0-1 .4-1.9 1-2.5a7 7 0 0 0-4-12z" />
              <path d="M9 21h6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Enter Ponder Mode?
          </h2>
          <p className="text-sm opacity-70 text-[var(--text-primary)]">
            Meditate deeply on these verses in a focused space
          </p>
        </div>

        {/* Selected verses preview */}
        <div
          className="p-6 m-6 rounded-xl"
          style={{ background: highlightColor.color }}
        >
          <div className="text-xs font-semibold text-[var(--text-accent)] mb-2">
            Verse {verseRange}
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed font-[var(--font-body)] line-clamp-4">
            {combinedText}
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3">
          <button
            onClick={onEnterPonder}
            className="w-full py-4 rounded-xl font-semibold text-lg transition"
            style={{
              background: "var(--text-accent)",
              color: "var(--text-inverse)",
            }}
          >
            Enter Ponder Mode
          </button>

          <button
            onClick={onSkip}
            className="w-full py-4 rounded-xl font-semibold transition"
            style={{
              background: "rgba(0, 0, 0, 0.15)",
              color: "var(--text-primary)",
            }}
          >
            Continue Reading
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   Ponder Mode - Full Screen Meditation
================================ */
export function PonderMode({
  selectedVerses,
  highlightColor,
  book,
  chapter,
  onClose,
  audioUrl, // Optional instrumental music URL
}) {
  const [reflection, setReflection] = useState("");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  const verseRange =
    selectedVerses.length === 1
      ? selectedVerses[0].verse
      : `${selectedVerses[0].verse}-${selectedVerses[selectedVerses.length - 1].verse}`;

  const combinedText = selectedVerses.map((v) => v.text).join(" ");

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.loop = true;
      audio.volume = 0.4;
      setAudioElement(audio);

      return () => {
        audio.pause();
        audio.src = "";
      };
    }
  }, [audioUrl]);

  function toggleAudio() {
    if (!audioElement) return;

    if (audioPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setAudioPlaying(!audioPlaying);
  }

  function handleSave() {
    // Save reflection to highlights
    const highlightData = {
      verses: selectedVerses,
      verseRange,
      book,
      chapter,
      text: combinedText,
      color: highlightColor,
      reflection: reflection.trim(),
      createdAt: new Date().toISOString(),
      id: Date.now().toString(),
    };

    // Get existing highlights
    const existing = JSON.parse(localStorage.getItem("highlights") || "[]");
    existing.push(highlightData);
    localStorage.setItem("highlights", JSON.stringify(existing));

    onClose(highlightData);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg-app)] flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-[var(--text-accent)]/10"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 1rem)",
        }}
      >
        <button
          onClick={() => {
            if (audioElement) audioElement.pause();
            onClose(null);
          }}
          className="text-[var(--text-accent)] font-semibold"
        >
          Cancel
        </button>

        <span className="text-sm text-[var(--text-primary)] opacity-70">
          Ponder Mode
        </span>

        <button
          onClick={handleSave}
          className="text-[var(--text-accent)] font-semibold"
        >
          Save
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Verse Reference */}
        <div className="text-center mt-8 mb-6">
          <div className="text-sm font-semibold text-[var(--text-accent)] opacity-80 mb-2">
            {book} {chapter}:{verseRange}
          </div>
          <div
            className="w-16 h-1 mx-auto rounded-full"
            style={{ background: highlightColor.color }}
          />
        </div>

        {/* Highlighted Verses */}
        <div
          className="p-8 rounded-2xl mb-8"
          style={{ background: highlightColor.color }}
        >
          <p className="text-lg leading-relaxed text-center font-[var(--font-body)] text-[var(--text-primary)]">
            {combinedText}
          </p>
        </div>

        {/* Audio Controls */}
        {audioUrl && (
          <div className="flex justify-center mb-8">
            <button
              onClick={toggleAudio}
              className="px-6 py-3 rounded-full flex items-center gap-3 transition"
              style={{
                background: "var(--text-accent)",
                color: "var(--text-inverse)",
              }}
            >
              {audioPlaying ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="currentColor"
                  >
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  <span className="font-medium">Pause Music</span>
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="font-medium">Play Music</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Reflection Prompts */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] opacity-80 mb-4">
            Reflect & Meditate
          </h3>
          <div className="space-y-3 mb-6">
            <button className="w-full text-left p-4 rounded-xl bg-black/10 hover:bg-black/15 transition flex items-center gap-3">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 flex-shrink-0 text-[var(--text-accent)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                What is God speaking to me through this?
              </div>
            </button>
            <button className="w-full text-left p-4 rounded-xl bg-black/10 hover:bg-black/15 transition flex items-center gap-3">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 flex-shrink-0 text-[var(--text-accent)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2a7 7 0 0 0-4 12c.6.6 1 1.5 1 2.5V18h6v-1.5c0-1 .4-1.9 1-2.5a7 7 0 0 0-4-12z" />
                <path d="M9 21h6" />
              </svg>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                How should I respond in prayer?
              </div>
            </button>
            <button className="w-full text-left p-4 rounded-xl bg-black/10 hover:bg-black/15 transition flex items-center gap-3">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 flex-shrink-0 text-[var(--text-accent)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                What action is God calling me to take?
              </div>
            </button>
          </div>
        </div>

        {/* Reflection Text Area */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] opacity-80 mb-3">
            My Reflection
          </h3>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Write your thoughts, prayers, or insights..."
            className="w-full min-h-[200px] bg-black/10 text-[var(--text-primary)] rounded-xl p-4 outline-none resize-none font-[var(--font-body)] leading-relaxed"
            style={{
              border: "1px solid rgba(var(--accent-rgb), 0.2)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ===============================
   Helper Functions
================================ */
export function getThemeColors(theme) {
  return THEME_COLORS[theme] || THEME_COLORS.classic;
}

export function getHighlightById(highlights, id) {
  return highlights.find((h) => h.id === id);
}
