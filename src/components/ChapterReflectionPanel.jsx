/**
 * ChapterReflectionPanel.jsx
 * Chapter-level reflection panel
 * Designed to pause Scripture reading for thoughtful reflection
 */

import { useEffect } from "react";

export default function ChapterReflectionPanel({
  open,
  onClose,
  book,
  chapter,
  summary,
}) {
  /* ===============================
     Lock background scroll
  ================================ */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/70
        backdrop-blur-md
        flex
        items-end
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-h-[85vh]
          rounded-t-2xl
          bg-[var(--bg-menu)]
          border-t
          border-[var(--text-accent)]/10
          shadow-2xl
          px-6
          pt-4
          pb-10
          overflow-y-auto
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab handle */}
        <div className="flex justify-center mb-4">
          <div className="h-1 w-10 rounded-full bg-[var(--text-accent)]/20" />
        </div>

        {/* Mode label */}
        <div className="text-[11px] uppercase tracking-widest opacity-50 text-[var(--text-primary)] text-center mb-2">
          Reflection
        </div>

        {/* Header */}
        <div className="mb-4 text-center">
          <div className="font-[var(--font-ui)] text-sm font-semibold text-[var(--text-accent)]">
            {book} {chapter}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-auto mb-6 h-px w-24 bg-[var(--text-accent)] opacity-20" />

        {/* Summary */}
        <div
          className="
            max-w-prose
            mx-auto
            text-[15px]
            leading-[1.7]
            text-[var(--text-primary)]
            font-[var(--font-body)]
            space-y-4
          "
        >
          {summary}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-xs opacity-50 text-[var(--text-primary)] text-center">
          This AI-assisted reflection is provided as a reading aid to encourage
          thought and meditation. Scripture itself remains the final authority.
        </div>
      </div>
    </div>
  );
}
