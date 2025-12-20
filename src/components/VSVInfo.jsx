export default function VSVInfo({ onBack }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Card */}
      <div
        className="
          w-[94%]
          max-w-[460px]
          max-h-[82vh]
          rounded-3xl
          bg-[#1C1C1A]
          shadow-2xl
          overflow-hidden
        "
      >
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto max-h-[82vh] text-[#EEECE6] font-serif">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={onBack}
              className="text-[#CBB27C] text-xl leading-none"
              aria-label="Go back"
            >
              ←
            </button>
            <h2 className="text-2xl font-semibold">Why the VSV?</h2>
          </div>

          {/* Body Copy */}
          <div className="space-y-5 text-[17px] leading-relaxed opacity-90">
            <p>
              ABIDE uses the{" "}
              <span className="text-[#CBB27C]">
                Vine Standard Version (VSV)
              </span>
              .
            </p>

            <p>
              The VSV is a carefully refined translation built with one guiding
              principle: to remain faithful to the original Scriptures while
              inviting the reader to <em>abide</em>—to dwell, to slow down, and
              to listen.
            </p>

            <p>
              Unlike many modern translations that prioritize speed or
              surface-level clarity, the VSV preserves the weight of the
              original languages while speaking in a voice that feels present,
              intentional, and alive.
            </p>

            <p>
              The VSV is not meant to replace historic translations, but to
              stand alongside them—offering a contemplative reading experience
              rooted in reverence and depth.
            </p>

            <p>
              By including the VSV in ABIDE, I am sharing my commitment to
              Scripture as something more than content to consume. It is an
              invitation to remain in the Word, to return often, and to let
              truth take root over time.
            </p>

            <p>
              This translation exists to serve the reader—not platforms,
              algorithms, or publishing constraints—but the quiet, daily pursuit
              of God’s Word.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-10 text-center text-sm opacity-60">
            <p>
              “Abide in Me, and I in you.” —{" "}
              <span className="italic">John 15:4</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
