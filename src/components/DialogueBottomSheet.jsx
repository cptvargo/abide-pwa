/**
 * DialogueBottomSheet.jsx - Inline Dialogue Creator
 * Slides up from bottom, keeps user in Scripture context
 * Auto-saves to dialogues system
 */

import { useState, useEffect, useRef } from "react";

export default function DialogueBottomSheet({
  selectedVerses,
  highlightColor,
  book,
  chapter,
  translation,
  onClose,
}) {
  const [reflection, setReflection] = useState("");
  const [showTrackList, setShowTrackList] = useState(false);
  const textareaRef = useRef(null);

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
    { id: "king", name: "King Jesus", file: "king_jesus.m4a" },
    { id: "fire", name: "Set Us On Fire", file: "set_us_on_fire.m4a" },
  ];

  const audioRef = useRef(null);

  const [selectedTrack, setSelectedTrack] = useState(() => {
    const saved = localStorage.getItem("dialogueTrack");
    return (
      MEDITATION_TRACKS.find((t) => t.id === saved) || MEDITATION_TRACKS[0]
    );
  });

  const [isPlaying, setIsPlaying] = useState(false);

  /* ===============================
     Persist Track Selection
  ================================ */
  useEffect(() => {
    localStorage.setItem("dialogueTrack", selectedTrack.id);
  }, [selectedTrack]);

  /* ===============================
     Audio Lifecycle - Auto-play on track change
  ================================ */
  useEffect(() => {
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

    // Auto-play if isPlaying is true
    if (isPlaying) {
      audio.play().catch(() => {});
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedTrack, isPlaying]);

  /* ===============================
     Auto-focus textarea on mount
  ================================ */
  useEffect(() => {
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 300);
  }, []);

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

  function handleClose() {
    // ALWAYS save highlight (visual color on verse)
    const highlightData = {
      verses: selectedVerses,
      verseRange,
      book: book.toLowerCase(), // Match SwipeReading's lowercase book state
      chapter,
      text: combinedText,
      color: highlightColor,
      translation,
      reflection: reflection.trim(),
      createdAt: new Date().toISOString(),
      id: Date.now().toString(),
    };

    const existingHighlights = JSON.parse(
      localStorage.getItem("highlights") || "[]",
    );
    existingHighlights.push(highlightData);
    localStorage.setItem("highlights", JSON.stringify(existingHighlights));

    // ALSO save dialogue if there's a reflection
    if (reflection.trim()) {
      const dialogueData = {
        id: Date.now().toString(),
        type: "scripture",
        book,
        chapter,
        verseRange,
        verseText: combinedText,
        translation,
        highlightColor,
        reflection: reflection.trim(),
        text: reflection.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingDialogues = JSON.parse(
        localStorage.getItem("dialogues") || "[]",
      );
      existingDialogues.unshift(dialogueData);
      localStorage.setItem("dialogues", JSON.stringify(existingDialogues));
    }

    // Fade out audio smoothly BEFORE closing
    if (audioRef.current && isPlaying) {
      const audio = audioRef.current;
      const startVolume = audio.volume;
      const fadeSteps = 30; // 1.5 seconds
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        const newVolume = startVolume * (1 - currentStep / fadeSteps);

        if (audio && newVolume > 0.01 && currentStep < fadeSteps) {
          audio.volume = newVolume;
        } else {
          clearInterval(fadeInterval);
          if (audio) {
            audio.pause();
            audio.volume = 0.35; // Reset for next time
          }
          audioRef.current = null;
          onClose(); // Only close AFTER fade completes
        }
      }, 50);
    } else {
      onClose(); // No audio playing, close immediately
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[90]"
        style={{ backdropFilter: "blur(4px)" }}
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[100] bg-[var(--bg-menu)] rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
        style={{
          animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div
            className="w-12 h-1 rounded-full opacity-30"
            style={{ background: "var(--text-primary)" }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-3 border-b"
          style={{ borderColor: "rgba(var(--accent-rgb), 0.15)" }}
        >
          <div>
            <div
              className="text-xs font-semibold opacity-60"
              style={{ color: "var(--text-primary)" }}
            >
              {book} {chapter}:{verseRange}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg font-semibold text-sm transition-transform active:scale-95"
            style={{
              background: "var(--text-accent)",
              color: "var(--text-inverse)",
            }}
          >
            Done
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Highlighted Verse */}
          <div
            className="p-4 rounded-xl mb-4"
            style={{ background: highlightColor.color }}
          >
            <p
              className="text-sm leading-relaxed font-[var(--font-body)]"
              style={{ color: "var(--text-primary)" }}
            >
              {combinedText}
            </p>
          </div>

          {/* Reflection Textarea */}
          <div className="mb-4">
            <h3
              className="text-xs font-semibold opacity-70 mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              My Reflection
            </h3>
            <textarea
              ref={textareaRef}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What is the Spirit saying to you..."
              className="w-full min-h-[150px] bg-black/10 rounded-xl p-4 outline-none resize-none font-[var(--font-body)] leading-relaxed"
              style={{
                border: "1px solid rgba(var(--accent-rgb), 0.2)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        {/* Audio Player (Always at bottom) */}
        <div
          className="px-6 py-4 border-t"
          style={{ borderColor: "rgba(var(--accent-rgb), 0.15)" }}
        >
          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(var(--accent-rgb), 0.15)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div
                  className="text-xs opacity-50 mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  MEDITATION
                </div>
                <button
                  onClick={() => setShowTrackList(!showTrackList)}
                  className="text-sm font-semibold hover:opacity-70 transition text-left flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {selectedTrack.name}
                  <svg
                    viewBox="0 0 24 24"
                    className={`w-3 h-3 transition-transform ${showTrackList ? "rotate-180" : ""}`}
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
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                  style={{
                    background: "var(--text-accent)",
                    color: "var(--text-inverse)",
                  }}
                >
                  {isPlaying ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      fill="currentColor"
                    >
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {/* Track List */}
            {showTrackList && (
              <div
                className="mt-3 pt-3 border-t space-y-1 max-h-32 overflow-y-auto"
                style={{
                  borderColor: "rgba(var(--accent-rgb), 0.15)",
                  animation: "fadeIn 0.2s ease-out",
                }}
              >
                {MEDITATION_TRACKS.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setSelectedTrack(track);
                      setShowTrackList(false);
                      // Auto-play new track immediately
                      if (track.file) {
                        setIsPlaying(true);
                      } else {
                        setIsPlaying(false);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition ${
                      selectedTrack.id === track.id
                        ? "font-medium"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    style={{
                      color: "var(--text-primary)",
                      background:
                        selectedTrack.id === track.id
                          ? "rgba(var(--accent-rgb), 0.15)"
                          : "transparent",
                    }}
                  >
                    {track.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CSS Animations */}
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
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </>
  );
}
