// AudioMiniPlayer.jsx
// --------------------
// Slides up from bottom when chevron is tapped.
// Full controls: scrubber, skip ±30s, prev/next chapter, play/pause, close.
// FIXED: time display — elapsed on left counting up, total duration on right

import { useRef, useState, useEffect } from "react";
import { getBookDisplayName } from "../lib/bibleStructure";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioMiniPlayer({
  open,
  onClose,
  isPlaying,
  isLoaded,
  progress,
  audioRef,
  book,
  chapter,
  onToggle,
  onPrevChapter,
  onNextChapter,
  theme,
}) {
  const [bgColor, setBgColor] = useState("#8b7355");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);
  const scrubberRef = useRef(null);

  // ── Resolve nav color at runtime ─────────────────────────────────────────
  useEffect(() => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--bg-nav-solid")
      .trim();
    if (color) setBgColor(color);
  }, [theme]);

  // ── Sync time from audio — re-runs when sheet opens so values are fresh ──
  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;

    // Seed immediately from current audio state
    setCurrentTime(audio.currentTime || 0);
    if (isFinite(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
    }

    const onTimeUpdate = () => {
      if (!dragging) setCurrentTime(audio.currentTime);
    };
    const onDurationChange = () => {
      if (isFinite(audio.duration) && audio.duration > 0)
        setDuration(audio.duration);
    };
    const onLoaded = () => {
      if (isFinite(audio.duration) && audio.duration > 0)
        setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("loadedmetadata", onLoaded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [audioRef, dragging, open]); // open in deps so it re-seeds when sheet opens

  // ── Scrubber seek ─────────────────────────────────────────────────────────
  function handleScrubberChange(e) {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef?.current) audioRef.current.currentTime = val;
  }

  // ── Skip ±30s ─────────────────────────────────────────────────────────────
  function skip(seconds) {
    const audio = audioRef?.current;
    if (!audio) return;
    audio.currentTime = Math.max(
      0,
      Math.min(audio.duration || 0, audio.currentTime + seconds),
    );
  }

  const bookName = getBookDisplayName(book);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 55,
            animation: "fadeIn 0.2s ease",
          }}
        />
      )}

      {/* Sheet */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 56,
          background: "var(--bg-menu)",
          borderRadius: "20px 20px 0 0",
          paddingBottom: "max(32px, env(safe-area-inset-bottom))",
          boxShadow: "0 -12px 48px rgba(0,0,0,0.5)",
          transform: open ? "translateY(0)" : "translateY(110%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 4px",
          }}
        >
          <div
            style={{
              width: 32,
              height: 3,
              background: "var(--text-primary)",
              opacity: 0.15,
              borderRadius: 2,
            }}
          />
        </div>

        {/* Book / Chapter label */}
        <div
          style={{
            textAlign: "center",
            padding: "8px 24px 4px",
            fontFamily: "var(--font-ui)",
            fontSize: 13,
            letterSpacing: "0.1em",
            color: "var(--text-accent)",
            fontWeight: 700,
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          {bookName} {chapter}
        </div>

        {/* Scrubber */}
        <div style={{ padding: "16px 28px 4px" }}>
          <input
            ref={scrubberRef}
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentTime}
            onChange={handleScrubberChange}
            onMouseDown={() => setDragging(true)}
            onMouseUp={() => setDragging(false)}
            onTouchStart={() => setDragging(true)}
            onTouchEnd={() => setDragging(false)}
            style={{
              width: "100%",
              accentColor: bgColor,
              cursor: "pointer",
              height: 4,
            }}
          />
          {/* Times: elapsed left (counts up), total duration right (fixed) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "var(--font-ui)",
              fontSize: 12,
              color: "var(--text-secondary)",
              opacity: 0.7,
              marginTop: 4,
            }}
          >
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
            padding: "16px 24px 8px",
          }}
        >
          {/* Prev chapter */}
          <button onClick={onPrevChapter} style={ghostBtn}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 20L9 12l10-8v16z"
                fill="var(--text-primary)"
                opacity="0.8"
              />
              <line
                x1="5"
                y1="4"
                x2="5"
                y2="20"
                stroke="var(--text-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>
          </button>

          {/* Skip back 30s */}
          <button onClick={() => skip(-30)} style={ghostBtn}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
                fill="var(--text-primary)"
                opacity="0.8"
              />
              <text
                x="12"
                y="14.5"
                textAnchor="middle"
                fontSize="5.5"
                fill="var(--text-primary)"
                fontFamily="var(--font-ui)"
                fontWeight="700"
              >
                30
              </text>
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={onToggle}
            disabled={!isLoaded}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: bgColor,
              border: "none",
              cursor: isLoaded ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
              flexShrink: 0,
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect
                  x="6"
                  y="4"
                  width="4"
                  height="16"
                  rx="1.5"
                  fill="var(--text-inverse)"
                />
                <rect
                  x="14"
                  y="4"
                  width="4"
                  height="16"
                  rx="1.5"
                  fill="var(--text-inverse)"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginLeft: 2 }}
              >
                <path
                  d="M6 4.5L19.5 12 6 19.5V4.5Z"
                  fill="var(--text-inverse)"
                />
              </svg>
            )}
          </button>

          {/* Skip forward 30s */}
          <button onClick={() => skip(30)} style={ghostBtn}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"
                fill="var(--text-primary)"
                opacity="0.8"
              />
              <text
                x="12"
                y="14.5"
                textAnchor="middle"
                fontSize="5.5"
                fill="var(--text-primary)"
                fontFamily="var(--font-ui)"
                fontWeight="700"
              >
                30
              </text>
            </svg>
          </button>

          {/* Next chapter */}
          <button onClick={onNextChapter} style={ghostBtn}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 4l10 8-10 8V4z"
                fill="var(--text-primary)"
                opacity="0.8"
              />
              <line
                x1="19"
                y1="4"
                x2="19"
                y2="20"
                stroke="var(--text-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

const ghostBtn = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 8,
  WebkitTapHighlightColor: "transparent",
  touchAction: "manipulation",
};
