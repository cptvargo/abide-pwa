/**
 * Onboarding.jsx - Sacred, minimal onboarding flow
 * Always uses Classic theme palette regardless of user's theme setting
 */

import { useState } from "react";
import abideLogo from "./assets/ABIDE.png"; // Import logo from assets

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");

  function handleBegin() {
    setStep(2);
  }

  function handleNameSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    localStorage.setItem("abide_name", name.trim());
    setStep(3);
  }

  function handleComplete() {
    localStorage.setItem("abide_onboarded", "true");
    onComplete();
  }

  // Classic theme colors (exact match from your CSS)
  const classicTheme = {
    bgApp: "#1c1c1a",
    textPrimary: "#eeece6",
    textAccent: "#cbb27c",
    textMuted: "#b8b6ae",
    accentRgb: "203, 178, 124",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: classicTheme.bgApp,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "'Crimson Text', 'Baskerville', 'Garamond', serif",
      }}
    >
      {/* Screen 1: Welcome */}
      {step === 1 && (
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
            textAlign: "center",
            animation: "fadeIn 0.6s ease-out",
          }}
        >
          {/* ABIDE Logo */}
          <div
            style={{
              marginBottom: "3rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src={abideLogo}
              alt="ABIDE"
              style={{
                width: "200px",
                height: "auto",
              }}
            />
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "600",
              color: classicTheme.textPrimary,
              marginBottom: "1rem",
              lineHeight: 1.3,
            }}
          >
            Welcome to ABIDE.
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontSize: "1.125rem",
              color: classicTheme.textPrimary,
              opacity: 0.75,
              marginBottom: "3rem",
              lineHeight: 1.6,
            }}
          >
            A quiet place to remain in Christ through His Word.
          </p>

          {/* Begin Button */}
          <button
            onClick={handleBegin}
            style={{
              background: classicTheme.textAccent,
              color: classicTheme.bgApp,
              border: "none",
              padding: "1rem 3rem",
              fontSize: "1rem",
              fontWeight: "600",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "transform 0.2s ease, opacity 0.2s ease",
              fontFamily: "inherit",
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.98)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Begin
          </button>
        </div>
      )}

      {/* Screen 2: Enter Name */}
      {step === 2 && (
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
            textAlign: "center",
            animation: "fadeIn 0.6s ease-out",
          }}
        >
          {/* Headline */}
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "600",
              color: classicTheme.textPrimary,
              marginBottom: "2rem",
              lineHeight: 1.3,
            }}
          >
            Enter your name.
          </h1>

          {/* Name Input Form */}
          <form onSubmit={handleNameSubmit} style={{ marginBottom: "2rem" }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name"
              autoFocus
              style={{
                width: "100%",
                background: `rgba(${classicTheme.accentRgb}, 0.1)`,
                border: `1px solid rgba(${classicTheme.accentRgb}, 0.3)`,
                borderRadius: "8px",
                padding: "1rem 1.5rem",
                fontSize: "1.125rem",
                color: classicTheme.textPrimary,
                fontFamily: "inherit",
                textAlign: "center",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = classicTheme.textAccent)
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = `rgba(${classicTheme.accentRgb}, 0.3)`)
              }
            />
          </form>

          {/* Continue Button */}
          <button
            onClick={handleNameSubmit}
            disabled={!name.trim()}
            style={{
              background: name.trim()
                ? classicTheme.textAccent
                : `rgba(${classicTheme.accentRgb}, 0.3)`,
              color: classicTheme.bgApp,
              border: "none",
              padding: "1rem 3rem",
              fontSize: "1rem",
              fontWeight: "600",
              borderRadius: "8px",
              cursor: name.trim() ? "pointer" : "not-allowed",
              transition: "transform 0.2s ease, opacity 0.2s ease",
              fontFamily: "inherit",
              opacity: name.trim() ? 1 : 0.5,
            }}
            onMouseDown={(e) => {
              if (name.trim()) e.currentTarget.style.transform = "scale(0.98)";
            }}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Continue
          </button>
        </div>
      )}

      {/* Screen 3: Stewardship Note */}
      {step === 3 && (
        <div
          style={{
            maxWidth: "640px",
            width: "100%",
            animation: "fadeIn 0.6s ease-out",
            overflowY: "auto",
            maxHeight: "90vh",
          }}
        >
          {/* Headline */}
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: "600",
              color: classicTheme.textPrimary,
              marginBottom: "2rem",
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            A Note on Stewardship
          </h1>

          {/* Body Text */}
          <div
            style={{
              fontSize: "1.0625rem",
              color: classicTheme.textPrimary,
              opacity: 0.85,
              lineHeight: 1.8,
              marginBottom: "2.5rem",
              textAlign: "left",
            }}
          >
            <p style={{ marginBottom: "1.5rem" }}>
              Greetings, my name is Jesus Vargas, owner of ABIDE. This app is
              built with a commitment to integrity and accountability.
            </p>

            <p style={{ marginBottom: "1.5rem" }}>
              The translations within ABIDE are developed with careful reference
              to the original Hebrew and Greek texts, with the King James
              Version serving as a structural base. Artificial intelligence is
              used as a tool to assist in clarity and structure, but every
              passage is personally reviewed to ensure faithfulness to the
              biblical text and its full context.
            </p>

            <p style={{ marginBottom: "1.5rem" }}>
              Chapter Reflections are designed to help engage thoughtful
              meditation on Scripture. They are not declarations of revelation.
              True revelation flows through intimacy with the Holy Spirit.
            </p>

            <p style={{ marginBottom: "1.5rem" }}>
              My prayer is that this app would bless you and help you remain in
              Christ.
            </p>

            {/* Scripture Quote */}
            <p
              style={{
                fontStyle: "italic",
                color: classicTheme.textAccent,
                textAlign: "center",
                fontSize: "1.125rem",
                marginTop: "2rem",
              }}
            >
              "Abide in Me, and I in you." — John 15:4
            </p>
          </div>

          {/* Enter Scripture Button */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={handleComplete}
              style={{
                background: classicTheme.textAccent,
                color: classicTheme.bgApp,
                border: "none",
                padding: "1rem 3rem",
                fontSize: "1rem",
                fontWeight: "600",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "transform 0.2s ease, opacity 0.2s ease",
                fontFamily: "inherit",
              }}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.98)")
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              Enter Scripture
            </button>
          </div>
        </div>
      )}

      {/* Fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        ::placeholder {
          color: rgba(${classicTheme.accentRgb}, 0.5);
        }
      `}</style>
    </div>
  );
}
