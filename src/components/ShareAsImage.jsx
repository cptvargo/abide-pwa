/**
 * ShareAsImage.jsx - Generate shareable images from dialogue entries
 * Uses html2canvas to convert styled HTML to image
 */

import html2canvas from "html2canvas";

export async function shareDialogueAsImage(entry, theme) {
  // Create invisible container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);

  // Get theme colors
  const themeColors = {
    classic: { bg: "#2C2416", accent: "#CBB27C", text: "#E8DCC8" },
    "still-waters": { bg: "#0A3940", accent: "#1F6F78", text: "#D4E8EB" },
    "stone-fire": { bg: "#7C2D12", accent: "#F97316", text: "#FED7AA" },
    "olive-parchment": { bg: "#403A2C", accent: "#9D8F6F", text: "#E8E3D6" },
    parchment: { bg: "#2C2416", accent: "#8B7355", text: "#E8DCC8" },
  };

  const colors = themeColors[theme] || themeColors.classic;

  // Format date
  const date = new Date(entry.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Create HTML for image
  container.innerHTML = `
    <div style="
      width: 600px;
      background: ${colors.bg};
      color: ${colors.text};
      padding: 60px 50px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-sizing: border-box;
    ">
      <!-- ABIDE Logo -->
      <div style="
        text-align: center;
        margin-bottom: 40px;
      ">
        <img 
          src="${import.meta.env.BASE_URL}ABIDE.png" 
          alt="ABIDE"
          style="
            width: 200px;
            height: auto;
            opacity: 0.9;
          "
        />
      </div>

      <!-- Scripture Reference -->
      ${
        entry.type === "scripture" && entry.book && entry.chapter
          ? `
        <div style="
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          color: ${colors.accent};
          margin-bottom: 20px;
        ">
          ${entry.book} ${entry.chapter}${entry.verseRange ? `:${entry.verseRange}` : ""}
          ${entry.translation ? ` • ${entry.translation}` : ""}
        </div>
      `
          : ""
      }

      <!-- Highlighted Verse -->
      ${
        entry.type === "scripture" && entry.verseText
          ? `
        <div style="
          background: ${entry.highlightColor?.color || colors.accent + "33"};
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          border-left: 4px solid ${colors.accent};
        ">
          <p style="
            font-size: 18px;
            line-height: 1.8;
            font-style: italic;
            margin: 0;
            color: ${colors.text};
          ">"${entry.verseText}"</p>
        </div>
      `
          : ""
      }

      <!-- Reflection -->
      <div style="
        font-size: 16px;
        line-height: 1.8;
        color: ${colors.text};
        margin-bottom: 30px;
        white-space: pre-wrap;
      ">${entry.text || entry.reflection.replace(/<[^>]*>/g, "")}</div>

      <!-- Divider -->
      <div style="
        height: 1px;
        background: linear-gradient(to right, transparent, ${colors.accent}40, transparent);
        margin: 30px 0;
      "></div>

      <!-- Date -->
      <div style="
        text-align: center;
        font-size: 12px;
        color: ${colors.text};
        opacity: 0.6;
      ">${formattedDate}</div>
    </div>
  `;

  try {
    // Convert to canvas
    const canvas = await html2canvas(container.firstChild, {
      backgroundColor: colors.bg,
      scale: 2, // High quality
      logging: false,
    });

    // Convert canvas to blob
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    // Clean up
    document.body.removeChild(container);

    // Create file
    const file = new File([blob], "dialogue.png", { type: "image/png" });

    // Share via native API
    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title:
          entry.type === "scripture"
            ? `${entry.book} ${entry.chapter}:${entry.verseRange}`
            : "My Prayer",
      });
      return true;
    } else {
      // Fallback: Download image
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dialogue.png";
      a.click();
      URL.revokeObjectURL(url);
      return true;
    }
  } catch (error) {
    console.error("Share failed:", error);
    document.body.removeChild(container);
    return false;
  }
}
