/**
 * PWAUpdatePrompt.jsx - Premium update notification
 * Shows when new version is available, matches ABIDE theme
 */

export default function PWAUpdatePrompt({ onUpdate, onDismiss }) {
  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
          zIndex: 9998,
          animation: "fadeIn 0.3s ease-out",
        }}
        onClick={onDismiss}
      />

      {/* Update Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          width: "90%",
          maxWidth: "400px",
          background: "var(--bg-app)",
          borderRadius: "16px",
          padding: "2rem 1.5rem",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          border: "1px solid rgba(var(--accent-rgb), 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          style={{
            width: "56px",
            height: "56px",
            margin: "0 auto 1.5rem",
            borderRadius: "50%",
            background: "rgba(var(--accent-rgb), 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            style={{
              width: "28px",
              height: "28px",
              stroke: "var(--text-accent)",
              fill: "none",
              strokeWidth: "2",
            }}
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "var(--text-primary)",
            textAlign: "center",
            marginBottom: "0.75rem",
            fontFamily: "var(--font-ui)",
          }}
        >
          Update Available
        </h2>

        {/* Message */}
        <p
          style={{
            fontSize: "1rem",
            color: "var(--text-primary)",
            opacity: 0.75,
            textAlign: "center",
            marginBottom: "2rem",
            lineHeight: 1.6,
            fontFamily: "var(--font-ui)",
          }}
        >
          A new version of ABIDE is available.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
          }}
        >
          {/* Later Button */}
          <button
            onClick={onDismiss}
            style={{
              flex: 1,
              padding: "0.875rem 1.5rem",
              borderRadius: "10px",
              border: "1px solid rgba(var(--accent-rgb), 0.3)",
              background: "transparent",
              color: "var(--text-primary)",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "var(--font-ui)",
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.98)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Later
          </button>

          {/* Update Now Button */}
          <button
            onClick={onUpdate}
            style={{
              flex: 1,
              padding: "0.875rem 1.5rem",
              borderRadius: "10px",
              border: "none",
              background: "var(--text-accent)",
              color: "var(--text-inverse)",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "var(--font-ui)",
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.98)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Update Now
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
}
