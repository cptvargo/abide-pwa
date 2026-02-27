/**
 * PremiumMenu.jsx - Full-screen slide-in menu
 * Features swipe-to-close and solid status bar background
 */

import { useState, useRef } from "react";

export default function PremiumMenu({ open, onClose, onNavigate, theme }) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  if (!open) return null;

  function handleClose() {
    setIsClosing(true);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 500); // Match animation duration
  }

  const menuItems = [
    {
      section: "Tools",
      items: [
        {
          id: "dialogue",
          icon: (
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2a7 7 0 0 0-4 12c.6.6 1 1.5 1 2.5V18h6v-1.5c0-1 .4-1.9 1-2.5a7 7 0 0 0-4-12z" />
              <path d="M9 21h6" />
            </svg>
          ),
          title: "Dialoguing with God",
          description: "Your highlights, reflections, and prayers",
          available: true,
        },
        {
          id: "grow",
          icon: (
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M7 20h10" />
              <path d="M12 20c-4-4-7-9-7-13a7 7 0 0 1 14 0c0 4-3 9-7 13Z" />
              <path d="M12 20v-7" />
              <path d="M9 13l3 3 3-3" />
            </svg>
          ),
          title: "ABIDE — Grow",
          description: "Deepen your faith",
          available: true,
        },
      ],
    },
    {
      section: "Study",
      items: [
        {
          id: "devotionals",
          icon: (
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2a7 7 0 0 0-4 12c.6.6 1 1.5 1 2.5V18h6v-1.5c0-1 .4-1.9 1-2.5a7 7 0 0 0-4-12z" />
              <path d="M9 21h6" />
            </svg>
          ),
          title: "Devotionals",
          description: "Daily inspiration & study",
          available: false,
        },
        {
          id: "cross-references",
          icon: (
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8l-8 8M8 8l8 8" />
            </svg>
          ),
          title: "Cross References",
          description: "Connect Scripture passages",
          available: false,
        },
      ],
    },
    {
      section: "Journey",
      items: [
        {
          id: "christ-revealed",
          icon: (
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          ),
          title: "Christ Revealed",
          description: "Jesus from Genesis to Revelation",
          available: false,
          featured: true,
        },
      ],
    },
  ];

  function getGreeting() {
    const hour = new Date().getHours();
    const name = localStorage.getItem("abide_name") || "";

    let timeGreeting;
    if (hour < 12) timeGreeting = "Good morning";
    else if (hour < 18) timeGreeting = "Good afternoon";
    else timeGreeting = "Good evening";

    return name ? `${timeGreeting}, ${name}` : timeGreeting;
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(false);
  }

  function handleTouchMove(e) {
    if (!touchStartX.current) return;

    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    const diffX = touchCurrentX - touchStartX.current;
    const diffY = touchCurrentY - touchStartY.current;

    // Only swipe if horizontal movement is greater than vertical
    if (Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      setIsSwiping(true);
      // Only allow swipe to right (closing direction)
      if (diffX > 0) {
        setSwipeOffset(diffX);
      }
    }
  }

  function handleTouchEnd() {
    if (!isSwiping) {
      setSwipeOffset(0);
      touchStartX.current = null;
      return;
    }

    const threshold = 100; // pixels to trigger close

    if (swipeOffset > threshold) {
      handleClose();
    }

    setSwipeOffset(0);
    setIsSwiping(false);
    touchStartX.current = null;
  }

  return (
    <>
      {/* Backdrop - blocks all touch events to scripture */}
      <div
        className="fixed inset-0 z-49"
        style={{
          background: "transparent",
          pointerEvents: "auto",
        }}
      />

      {/* Menu */}
      <div
        className="fixed inset-0 z-50"
        style={{
          background: "var(--bg-app)",
          transform: isSwiping
            ? `translateX(${swipeOffset}px)`
            : isClosing
              ? "translateX(100%)"
              : "translateX(0)",
          opacity: isSwiping
            ? Math.max(0.5, 1 - swipeOffset / 300)
            : isClosing
              ? 0
              : 1,
          transition: isSwiping
            ? "none"
            : "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out",
          animation: "slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          animationFillMode: "backwards", // Start from off-screen position
          pointerEvents: "auto", // Always capture touch events
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <style>{`
        @keyframes slideInRight {
          from { 
            transform: translateX(100%);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from { 
            transform: translateX(0);
            opacity: 1;
          }
          to { 
            transform: translateX(100%);
            opacity: 0;
          }
        }
        .menu-item {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .menu-item:active {
          transform: scale(0.98);
        }
      `}</style>

        {/* Scrollable container */}
        <div
          className="h-full overflow-y-auto"
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Header with gradient and safe-area support */}
          <div
            style={{
              paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)",
              paddingBottom: "1.5rem",
              paddingLeft: "1.5rem",
              paddingRight: "1.5rem",
              background: `linear-gradient(135deg, var(--text-accent) 0%, var(--text-accent)dd 100%)`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative pattern */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                               radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)`,
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "700",
                  color: "#FFFFFF",
                  marginBottom: "0.25rem",
                  letterSpacing: "-0.02em",
                  textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                }}
              >
                {getGreeting()}
              </h2>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#FFFFFF",
                  opacity: 0.9,
                  textShadow: "0 1px 4px rgba(0, 0, 0, 0.3)",
                }}
              >
                Abide in God's Word
              </p>
            </div>
          </div>

          {/* Menu Content */}
          <div
            className="p-6"
            style={{
              background: "var(--bg-app)",
            }}
          >
            {menuItems.map((section, idx) => (
              <div key={idx} style={{ marginBottom: "2rem" }}>
                {/* Section Header */}
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--text-accent)",
                    marginBottom: "0.75rem",
                    opacity: 0.7,
                  }}
                >
                  {section.section}
                </div>

                {/* Section Items */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.available) {
                          onNavigate(item.id);
                        }
                      }}
                      disabled={!item.available}
                      className="menu-item"
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "1rem",
                        borderRadius: "12px",
                        background: item.featured
                          ? "linear-gradient(135deg, rgba(var(--accent-rgb), 0.15) 0%, rgba(var(--accent-rgb), 0.05) 100%)"
                          : "rgba(var(--accent-rgb), 0.08)",
                        border: item.featured
                          ? "1px solid var(--text-accent)"
                          : "1px solid rgba(var(--accent-rgb), 0.15)",
                        opacity: item.available ? 1 : 0.5,
                        cursor: item.available ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      {/* Icon */}
                      <div
                        style={{
                          color: "var(--text-accent)",
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "1rem",
                            fontWeight: "600",
                            color: "var(--text-primary)",
                            marginBottom: "0.125rem",
                          }}
                        >
                          {item.title}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-primary)",
                            opacity: 0.6,
                          }}
                        >
                          {item.description}
                        </div>
                      </div>

                      {/* Status/Arrow */}
                      <div
                        style={{
                          color: "var(--text-accent)",
                          opacity: item.available ? 0.5 : 0.3,
                          fontSize: "0.875rem",
                          flexShrink: 0,
                        }}
                      >
                        {item.available ? "→" : "Soon"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "1.5rem",
              paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
              borderTop: "1px solid rgba(var(--accent-rgb), 0.15)",
              background: "rgba(var(--accent-rgb), 0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {/* Settings Button */}
            <button
              onClick={() => onNavigate("settings")}
              className="menu-item"
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                borderRadius: "12px",
                background: "rgba(var(--accent-rgb), 0.08)",
                border: "1px solid rgba(var(--accent-rgb), 0.15)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                cursor: "pointer",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: "var(--text-accent)", flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                  }}
                >
                  Settings
                </div>
              </div>
              <div
                style={{
                  color: "var(--text-accent)",
                  opacity: 0.5,
                  fontSize: "0.875rem",
                }}
              >
                →
              </div>
            </button>

            {/* Version Info */}
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-primary)",
                  opacity: 0.5,
                  textAlign: "center",
                }}
              >
                Made with ♥ by Jesus Vargas
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-accent)",
                  opacity: 0.4,
                  textAlign: "center",
                  marginTop: "0.25rem",
                }}
              >
                Version 2.3.0
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
