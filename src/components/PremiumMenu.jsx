/**
 * PremiumMenu.jsx
 * Full-screen slide-in menu — bold, warm, clean
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
          title: "Devotionals",
          description: "Daily inspiration & study",
          available: true,
        },
        {
          id: "daily-abiding",
          title: "Daily Abiding",
          description: "Video devotional experiences",
          available: true,
        },
        {
          id: "abide-dictionary",
          title: "Abide Dictionary",
          description: "Your curated word study collection",
          available: true,
        },
      ],
    },
    {
      section: "Journey",
      items: [
        {
          id: "christ-revealed",
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
        @keyframes pm-fade-up { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .pm-greeting  { animation: pm-fade-up 0.45s ease 0.10s both }
        .pm-section-0 { animation: pm-fade-up 0.42s ease 0.20s both }
        .pm-section-1 { animation: pm-fade-up 0.42s ease 0.28s both }
        .pm-section-2 { animation: pm-fade-up 0.42s ease 0.34s both }
        .pm-footer    { animation: pm-fade-up 0.38s ease 0.40s both }
        .pm-item {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          transition: opacity 0.15s ease;
        }
        .pm-item:active { opacity: 0.6; }
        .pm-scroll::-webkit-scrollbar { display: none }
        .pm-scroll { -ms-overflow-style: none; scrollbar-width: none }
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
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 56px)",
            paddingBottom: "36px",
            paddingLeft: "28px",
            paddingRight: "28px",
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "calc(env(safe-area-inset-top, 0px) + 18px)",
              right: "22px",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(var(--accent-rgb,203,178,124),0.07)",
              border: "1px solid rgba(var(--accent-rgb,203,178,124),0.12)",
              borderRadius: "50%",
              color: "var(--text-primary)",
              fontSize: 13,
              opacity: 0.55,
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
            aria-label="Close menu"
          >
            ✕
          </button>

          {/* Greeting */}
          <div className="pm-greeting">
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--text-accent)",
                fontFamily: "var(--font-ui, system-ui)",
                marginBottom: 14,
                opacity: 0.7,
              }}
            >
              ABIDE
            </div>
            <h2
              style={{
                fontFamily: "var(--font-ui, system-ui)",
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                lineHeight: 1.15,
                marginBottom: 10,
              }}
            >
              {getGreeting()}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body, Georgia, serif)",
                fontSize: 15,
                color: "var(--text-primary)",
                opacity: 0.38,
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              Abide in God's Word
            </p>
          </div>

          {/* Rule */}
          <div
            style={{
              marginTop: 28,
              height: "1px",
              background: "rgba(var(--accent-rgb,203,178,124),0.14)",
            }}
          />
        </div>

        {/* Menu sections */}
        <div style={{ padding: "0 28px" }}>
          {menuItems.map((section, sIdx) => (
            <div
              key={sIdx}
              className={`pm-section-${sIdx}`}
              style={{ marginBottom: 36 }}
            >
              {/* Section label */}
              <div
                style={{
                  fontFamily: "var(--font-ui, system-ui)",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "var(--text-accent)",
                  opacity: 0.45,
                  marginBottom: 14,
                }}
              >
                {section.section}
              </div>

              {/* Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => item.available && onNavigate(item.id)}
                    disabled={!item.available}
                    className="pm-item"
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "14px 12px 14px 18px",
                      borderRadius: 10,
                      background: "transparent",
                      border: "none",
                      borderLeft: item.featured
                        ? `3px solid rgba(var(--accent-rgb,203,178,124),1)`
                        : `3px solid rgba(var(--accent-rgb,203,178,124),${item.available ? "0.35" : "0.15"})`,
                      opacity: item.available ? 1 : 0.4,
                      cursor: item.available ? "pointer" : "default",
                      display: "flex",
                      alignItems: "center",
                      gap: 0,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-ui, system-ui)",
                          fontSize: 16,
                          fontWeight: item.featured ? 700 : 600,
                          color: "var(--text-primary)",
                          lineHeight: 1.3,
                          marginBottom: 3,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-ui, system-ui)",
                          fontSize: 12,
                          color: "var(--text-primary)",
                          opacity: 0.38,
                          lineHeight: 1.35,
                        }}
                      >
                        {item.description}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: item.available ? 18 : 10,
                        color: "var(--text-accent)",
                        opacity: item.available ? (item.featured ? 0.9 : 0.4) : 0.3,
                        letterSpacing: item.available ? 0 : "0.06em",
                        textTransform: "uppercase",
                        flexShrink: 0,
                        paddingLeft: 12,
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
          className="pm-footer"
          style={{
            padding: "0 28px",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 36px)",
          }}
        >
          <div
            style={{
              height: "1px",
              background: "rgba(var(--accent-rgb,203,178,124),0.1)",
              marginBottom: 24,
            }}
          />
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--text-accent)",
              opacity: 0.2,
              fontFamily: "var(--font-ui, system-ui)",
            }}
          >
            ABIDE
          </div>
        </div>
      </div>
    </>
  );
}
