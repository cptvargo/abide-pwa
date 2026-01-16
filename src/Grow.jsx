// src/Grow.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Grow() {
  const navigate = useNavigate();
  const [fadingOut, setFadingOut] = useState(false);

  const handleBack = () => {
    setFadingOut(true);
    setTimeout(() => {
      navigate("/");
    }, 200); // duration matches CSS
  };

  return (
    <div
      className={`
        min-h-screen
        bg-abideDark
        text-white
        flex
        flex-col
        transition-opacity
        duration-200
        ease-out
        ${fadingOut ? "opacity-0" : "opacity-100"}
      `}
    >
      {/* Top Bar */}
      <div className="px-4 py-3">
        <button
          onClick={handleBack}
          className="text-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          ← Back to Scripture
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md px-6 text-center">
          <h1 className="text-abideGold text-2xl font-semibold mb-3">
            ABIDE — Grow
          </h1>

          <p className="opacity-80 leading-relaxed">
            Learning to listen, respond, and walk with God.
          </p>

          <p className="mt-4 text-sm opacity-60">
            Designed for children. Helpful for anyone learning to listen and
            obey.
          </p>
        </div>
      </div>
    </div>
  );
}
