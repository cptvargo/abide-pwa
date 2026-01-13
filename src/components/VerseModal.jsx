import React, { useState } from "react";

export default function VerseModal({
  open,
  onClose,
  verse,
  hebrew,
  insight,
  note,
  setNote,
}) {
  const [expanded, setExpanded] = useState({});

  if (!open) return null;

  const toggle = (term) => {
    setExpanded((prev) => ({
      ...prev,
      [term]: !prev[term],
    }));
  };

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

        {/* Word Guide */}
        {hebrew && (
          <div className="mb-6">
            <h3 className="text-abideGold font-semibold mb-3">Word Guide</h3>

            {Object.entries(hebrew).map(([term, info]) => {
              const isOpen = expanded[term];

              return (
                <div key={term} className="mb-4 border-b border-white/10 pb-3">
                  {/* Header */}
                  <button
                    onClick={() => toggle(term)}
                    className="w-full text-left"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-abideGold text-[18px] font-semibold">
                          {term}
                        </div>
                        <div className="text-gray-300 italic text-sm">
                          {info.original} ({info.transliteration})
                        </div>
                      </div>

                      {/* Chevron */}
                      <div
                        className={`text-abideGold text-lg ml-4 transition-transform duration-400 ease-out ${
                          isOpen ? "rotate-90" : "rotate-0"
                        }`}
                      >
                        ▸
                      </div>
                    </div>

                    {/* Basic Meaning (always visible) */}
                    <div className="opacity-90 mt-1">{info.basic_meaning}</div>
                  </button>

                  {/* Animated Expand / Collapse */}
                  <div
                    className={`
                      overflow-hidden
                      transition-[max-height,opacity,margin-top]
                      duration-500 ease-out
                      ${
                        isOpen
                          ? "max-h-[1200px] opacity-100 mt-3"
                          : "max-h-0 opacity-0 mt-0"
                      }
                    `}
                  >
                    <div
                      className={`
                        pl-2 text-sm
                        transition-opacity duration-300 delay-150
                        ${isOpen ? "opacity-100" : "opacity-0"}
                      `}
                    >
                      {info.usage_in_context && (
                        <div className="opacity-85 mb-2">
                          <span className="text-abideGold">Usage:</span>{" "}
                          {info.usage_in_context}
                        </div>
                      )}

                      {info.clarification && (
                        <div className="opacity-85 mb-2">
                          <span className="text-abideGold">Clarification:</span>{" "}
                          {info.clarification}
                        </div>
                      )}

                      {info.common_misunderstandings && (
                        <div className="opacity-85 mb-2">
                          <span className="text-abideGold">
                            Common misunderstandings:
                          </span>{" "}
                          {info.common_misunderstandings}
                        </div>
                      )}

                      {info.why_it_matters && (
                        <div className="opacity-90 mt-3">
                          <span className="text-abideGold">
                            Why it matters:
                          </span>{" "}
                          {info.why_it_matters}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Insight */}
        {insight && (
          <div className="mb-6">
            <h3 className="text-abideGold font-semibold mb-2">Insight</h3>
            <p className="opacity-90 leading-relaxed">{insight}</p>
          </div>
        )}
      </div>
    </div>
  );
}
