/**
 * HighlightSystem.jsx - Multi-Color Highlighting with Ponder Mode
 * Theme-aware colors with 3 options per theme
 */

import { useState, useEffect, useRef } from "react";

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
  translation,
  onClose,
  audioUrl, // <-- still here so nothing breaks
}) {
  const [reflection, setReflection] = useState("");
  const [showTrackList, setShowTrackList] = useState(false);

  const verseRange =
    selectedVerses.length === 1
      ? selectedVerses[0].verse
      : `${selectedVerses[0].verse}-${selectedVerses[selectedVerses.length - 1].verse}`;

  const combinedText = selectedVerses.map((v) => v.text).join(" ");

  /* ===============================
     Meditation Tracks
  ================================ */
  const MEDITATION_TRACKS = [
    { id: "silence", name: "Silence", file: null },
    {
      id: "bliss",
      name: "Bliss of His Presence",
      file: "bliss_of_his_presence.m4a",
    },
    { id: "father", name: "Father of Spirits", file: "father_of_spirits.m4a" },
    { id: "fresh", name: "Fresh Oil", file: "fresh_oil.m4a" },
    { id: "hiding", name: "Hiding Place", file: "hiding_place.m4a" },
    { id: "king", name: "King Jesus", file: "king_jesus.m4a" },
    { id: "fire", name: "Set Us On Fire", file: "set_us_on_fire.m4a" },
    { id: "heaven", name: "Sounds of Heaven", file: "sounds_of_heaven.m4a" },
  ];

  const audioRef = useRef(null);

  const [selectedTrack, setSelectedTrack] = useState(() => {
    const saved = localStorage.getItem("ponderTrack");
    return (
      MEDITATION_TRACKS.find((t) => t.id === saved) || MEDITATION_TRACKS[0]
    );
  });

  const [isPlaying, setIsPlaying] = useState(false);

  /* ===============================
     Persist Track
  ================================ */
  useEffect(() => {
    localStorage.setItem("ponderTrack", selectedTrack.id);
  }, [selectedTrack]);

  /* ===============================
     Fade Helpers
  ================================ */
  function fadeIn(audio, targetVolume = 0.35, duration = 2000) {
    const step = targetVolume / (duration / 50);
    const fade = setInterval(() => {
      if (audio.volume < targetVolume) {
        audio.volume = Math.min(audio.volume + step, targetVolume);
      } else {
        clearInterval(fade);
      }
    }, 50);
  }

  function fadeOut(audio, callback, duration = 1500) {
    const step = audio.volume / (duration / 50);
    const fade = setInterval(() => {
      if (audio.volume > 0) {
        audio.volume = Math.max(audio.volume - step, 0);
      } else {
        clearInterval(fade);
        callback?.();
      }
    }, 50);
  }

  /* ===============================
     Audio Lifecycle (Fixed – No Restart on Pause)
  ================================ */
  useEffect(() => {
    // Stop existing audio if track changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (!selectedTrack.file) {
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(
      `${import.meta.env.BASE_URL}audio/meditation/${selectedTrack.file}`,
    );

    audio.loop = true;
    audio.volume = 0.35;

    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedTrack]);

  /* ===============================
     Auto-play when track selected
  ================================ */
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [isPlaying]);

  function handleSave() {
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

    const existing = JSON.parse(localStorage.getItem("highlights") || "[]");
    existing.push(highlightData);
    localStorage.setItem("highlights", JSON.stringify(existing));

    onClose(highlightData);
  }

  function handleClose() {
    if (audioRef.current) {
      fadeOut(audioRef.current, () => {
        audioRef.current.pause();
        audioRef.current = null;
      });
    }
    onClose(null);
  }

  function toggleAudio() {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg-app)] flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-[var(--text-accent)]/10"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}
      >
        <button
          onClick={handleClose}
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
        <div className="mb-8">
          <div
            className="relative overflow-hidden rounded-2xl p-6"
            style={{
              background: "rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(var(--accent-rgb), 0.2)",
            }}
          >
            {/* Now Playing */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs text-[var(--text-primary)] opacity-50 mb-1">
                  NOW PLAYING
                </div>
                <button
                  onClick={() => setShowTrackList(!showTrackList)}
                  className="text-sm font-semibold text-[var(--text-primary)] hover:opacity-70 transition text-left flex items-center gap-2"
                >
                  {selectedTrack.name}
                  <svg
                    viewBox="0 0 24 24"
                    className={`w-4 h-4 transition-transform ${showTrackList ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>

              {/* Play/Pause Button */}
              {selectedTrack.file && (
                <button
                  onClick={toggleAudio}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                  style={{
                    background: "var(--text-accent)",
                    color: "var(--text-inverse)",
                  }}
                >
                  {isPlaying ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5"
                      fill="currentColor"
                    >
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {/* Track List Accordion */}
            {showTrackList && (
              <div className="mt-4 pt-4 border-t border-[var(--text-accent)]/20 space-y-1 max-h-48 overflow-y-auto animate-fadeIn">
                {MEDITATION_TRACKS.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setSelectedTrack(track);
                      if (track.file) setIsPlaying(true);
                      else setIsPlaying(false);
                      setShowTrackList(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition text-[var(--text-primary)] ${
                      selectedTrack.id === track.id
                        ? "font-medium"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    style={{
                      background:
                        selectedTrack.id === track.id
                          ? "rgba(var(--accent-rgb), 0.15)"
                          : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTrack.id !== track.id) {
                        e.currentTarget.style.background =
                          "rgba(var(--accent-rgb), 0.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTrack.id !== track.id) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {track.name}
                  </button>
                ))}
              </div>
            )}
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

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
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
