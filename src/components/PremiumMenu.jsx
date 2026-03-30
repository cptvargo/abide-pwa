/**
 * PremiumMenu.jsx
 * Full-screen slide-in menu — sacred, refined, luminous
 * Swipe-to-close, staggered entrance, ambient gold atmosphere
 * UPDATED: Settings removed — moved to bottom nav
 */

import { useState, useRef, useEffect } from "react";

export default function PremiumMenu({ open, onClose, onNavigate, theme }) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [visible, setVisible] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimateIn(true)),
      );
    } else {
      setAnimateIn(false);
      const t = setTimeout(() => setVisible(false), 480);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!visible) return null;

  function getGreeting() {
    const hour = new Date().getHours();
    const name = localStorage.getItem("abide_name") || "";
    let g =
      hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";
    return name ? `${g}, ${name}` : g;
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(false);
  }
  function handleTouchMove(e) {
    if (!touchStartX.current) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      setIsSwiping(true);
      if (dx > 0) setSwipeOffset(dx);
    }
  }
  function handleTouchEnd() {
    if (!isSwiping) {
      setSwipeOffset(0);
      touchStartX.current = null;
      return;
    }
    if (swipeOffset > 100) onClose();
    setSwipeOffset(0);
    setIsSwiping(false);
    touchStartX.current = null;
  }

  const menuItems = [
    {
      section: "Tools",
      items: [
        {
          id: "dialogue",
          icon: "✦",
          title: "Dialoguing with God",
          description: "Highlights, reflections & prayers",
          available: true,
        },
      ],
    },
    {
      section: "Study",
      items: [
        {
          id: "devotionals",
          icon: "◇",
          title: "Devotionals",
          description: "Daily inspiration & study",
          available: true,
        },
      ],
    },
    {
      section: "Journey",
      items: [
        {
          id: "christ-revealed",
          icon: "✧",
          title: "Christ Revealed",
          description: "Jesus from Genesis to Revelation",
          available: true,
          featured: true,
        },
      ],
    },
  ];

  const transform = isSwiping
    ? `translateX(${swipeOffset}px)`
    : animateIn
      ? "translateX(0)"
      : "translateX(100%)";
  const opacity = isSwiping ? Math.max(0.4, 1 - swipeOffset / 320) : 1;
  const transition = isSwiping
    ? "none"
    : `transform 0.48s cubic-bezier(0.22,1,0.36,1), opacity 0.48s ease`;

  return (
    <>
      <style>{`
        @keyframes pm-fade-up  { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pm-rule-expand { from { transform:scaleX(0); opacity:0 } to { transform:scaleX(1); opacity:1 } }
        @keyframes pm-glow-pulse { 0%,100% { opacity:0.35 } 50% { opacity:0.65 } }
        .pm-greeting  { animation: pm-fade-up 0.5s ease 0.12s both }
        .pm-rule      { animation: pm-rule-expand 0.6s cubic-bezier(0.22,1,0.36,1) 0.28s both; transform-origin:left }
        .pm-section-0 { animation: pm-fade-up 0.45s ease 0.22s both }
        .pm-section-1 { animation: pm-fade-up 0.45s ease 0.32s both }
        .pm-section-2 { animation: pm-fade-up 0.45s ease 0.40s both }
        .pm-footer    { animation: pm-fade-up 0.4s ease 0.48s both }
        .pm-glow      { animation: pm-glow-pulse 5s ease-in-out infinite }
        .pm-item { transition: background 0.18s ease, transform 0.15s ease, border-color 0.18s ease; -webkit-tap-highlight-color: transparent; }
        .pm-item:active { transform: scale(0.975) }
        .pm-item-available:hover { background: rgba(var(--accent-rgb,203,178,124), 0.14) !important; border-color: rgba(var(--accent-rgb,203,178,124), 0.35) !important; }
        .pm-scroll::-webkit-scrollbar { display:none }
        .pm-scroll { -ms-overflow-style:none; scrollbar-width:none }
      `}</style>

      <div
        className="pm-scroll"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "var(--bg-app, #141410)",
          transform,
          opacity,
          transition,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div
          style={{
            position: "relative",
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 52px)",
            paddingBottom: "32px",
            paddingLeft: "28px",
            paddingRight: "28px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "220px",
              background:
                "radial-gradient(ellipse at 30% 0%, rgba(var(--accent-rgb,203,178,124),0.12), transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div
            className="pm-glow"
            style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(var(--accent-rgb,203,178,124),0.7), transparent)",
              filter: "blur(1px)",
            }}
          />

          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "calc(env(safe-area-inset-top, 0px) + 16px)",
              right: "20px",
              background: "rgba(var(--accent-rgb,203,178,124),0.08)",
              border: "1px solid rgba(var(--accent-rgb,203,178,124),0.15)",
              borderRadius: "100px",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-primary, #f0ebe0)",
              fontSize: 14,
              opacity: 0.6,
              WebkitTapHighlightColor: "transparent",
            }}
            aria-label="Close menu"
          >
            ✕
          </button>

          <div
            className="pm-greeting"
            style={{ position: "relative", zIndex: 1 }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(var(--accent-rgb,203,178,124),0.7)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-ui, system-ui)",
                }}
              >
                ✦ &nbsp;ABIDE
              </span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-ui, system-ui)",
                fontSize: 30,
                fontWeight: 300,
                letterSpacing: "0.01em",
                color: "var(--text-primary, #f0ebe0)",
                lineHeight: 1.2,
                marginBottom: 8,
              }}
            >
              {getGreeting()}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body, Georgia, serif)",
                fontSize: 14,
                color: "var(--text-primary, #f0ebe0)",
                opacity: 0.45,
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              Abide in God's Word
            </p>
          </div>

          <div
            className="pm-rule"
            style={{
              marginTop: 24,
              height: "1px",
              background:
                "linear-gradient(90deg, rgba(var(--accent-rgb,203,178,124),0.5), rgba(var(--accent-rgb,203,178,124),0.05))",
            }}
          />
        </div>

        {/* Menu sections */}
        <div style={{ padding: "8px 20px 0" }}>
          {menuItems.map((section, sIdx) => (
            <div
              key={sIdx}
              className={`pm-section-${sIdx}`}
              style={{ marginBottom: 28 }}
            >
              <div
                style={{
                  fontFamily: "var(--font-ui, system-ui)",
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "rgba(var(--accent-rgb,203,178,124),0.55)",
                  marginBottom: 10,
                  paddingLeft: 4,
                }}
              >
                {section.section}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => item.available && onNavigate(item.id)}
                    disabled={!item.available}
                    className={`pm-item ${item.available ? "pm-item-available" : ""}`}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: item.featured
                        ? "linear-gradient(135deg, rgba(var(--accent-rgb,203,178,124),0.13), rgba(var(--accent-rgb,203,178,124),0.04))"
                        : "rgba(var(--accent-rgb,203,178,124),0.06)",
                      border: item.featured
                        ? "1px solid rgba(var(--accent-rgb,203,178,124),0.35)"
                        : "1px solid rgba(var(--accent-rgb,203,178,124),0.1)",
                      opacity: item.available ? 1 : 0.42,
                      cursor: item.available ? "pointer" : "default",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: item.featured
                          ? "rgba(var(--accent-rgb,203,178,124),0.18)"
                          : "rgba(var(--accent-rgb,203,178,124),0.1)",
                        border:
                          "1px solid rgba(var(--accent-rgb,203,178,124),0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        color: "rgba(var(--accent-rgb,203,178,124),0.9)",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-ui, system-ui)",
                          fontSize: 15,
                          fontWeight: 500,
                          color: "var(--text-primary, #f0ebe0)",
                          lineHeight: 1.3,
                          marginBottom: 3,
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-ui, system-ui)",
                          fontSize: 12,
                          color: "var(--text-primary, #f0ebe0)",
                          opacity: 0.45,
                          lineHeight: 1.3,
                        }}
                      >
                        {item.description}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-ui, system-ui)",
                        fontSize: item.available ? 16 : 10,
                        color: "rgba(var(--accent-rgb,203,178,124),0.5)",
                        letterSpacing: item.available ? 0 : "0.06em",
                        textTransform: "uppercase",
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

        {/* Footer — Settings removed, now in bottom nav */}
        <div
          className="pm-footer"
          style={{
            margin: "8px 20px 0",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)",
          }}
        >
          <div
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(var(--accent-rgb,203,178,124),0.15), transparent)",
              marginBottom: 20,
            }}
          />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 14,
                color: "rgba(var(--accent-rgb,203,178,124),0.25)",
                marginBottom: 8,
                letterSpacing: "0.2em",
              }}
            >
              ✦ ✦ ✦
            </div>
            <div
              style={{
                fontFamily: "var(--font-ui, system-ui)",
                fontSize: 11,
                color: "var(--text-primary, #f0ebe0)",
                opacity: 0.3,
                letterSpacing: "0.02em",
              }}
            >
              Made with ♥ by Jesus Vargas
            </div>
            <div
              style={{
                fontFamily: "var(--font-ui, system-ui)",
                fontSize: 11,
                color: "rgba(var(--accent-rgb,203,178,124),0.35)",
                marginTop: 3,
                letterSpacing: "0.04em",
              }}
            >
              Version 2.4.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
