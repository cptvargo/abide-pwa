import React from "react";

export default function VerseModal({ open, onClose, verse, hebrew, insight, note, setNote, onSaveNote }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50">
      <div className="bg-abideDark2 w-full max-h-[70%] rounded-t-2xl p-6 overflow-y-auto border-t border-[#CBB27C]/40 shadow-xl">

        {/* Close Button */}
        <button
          className="text-abideGold text-xl absolute top-3 right-5"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Verse */}
        <h2 className="text-abideGold text-lg font-semibold mb-3">
          {verse?.ref}
        </h2>
        <p className="text-[18px] leading-relaxed mb-6">{verse?.text}</p>

        {/* Hebrew Breakdown */}
        {hebrew && (
          <div className="mb-6">
            <h3 className="text-abideGold font-semibold mb-2">Hebrew Words</h3>
            {Object.entries(hebrew).map(([word, info]) => (
              <div key={word} className="mb-2 leading-relaxed">
                <span className="text-abideGold text-[20px]">{info.root}</span>
                <span className="text-gray-300 italic"> ({info.translit})</span>
                <span className="opacity-80"> — {info.meaning}</span>
              </div>
            ))}
          </div>
        )}

        {/* Insight */}
        {insight && (
          <div className="mb-6">
            <h3 className="text-abideGold font-semibold mb-2">Insight</h3>
            <p className="opacity-90 leading-relaxed">{insight}</p>
          </div>
        )}

        {/* Notes */}
        <div>
          <h3 className="text-abideGold font-semibold mb-2">Your Note</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 rounded bg-[#1f1f1d] border border-[#CBB27C]/30 text-white"
            rows="4"
          />
          <button
            onClick={onSaveNote}
            className="mt-3 bg-abideGold text-abideDark font-semibold px-4 py-2 rounded"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}
