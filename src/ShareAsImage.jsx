/**
 * ShareAsImage.jsx - Generate shareable images from dialogue entries
 * Production-hardened for Vite PWA deployment on GitHub Pages
 */

import html2canvas from "html2canvas";

/**
 * Preload an image with explicit CORS handling
 * @param {string} src - Image source URL
 * @returns {Promise<HTMLImageElement>} Loaded image element
 */
function loadImageWithCORS(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Critical for canvas tainting prevention

    img.onload = () => {
      console.log("✅ Image loaded with CORS:", src);
      resolve(img);
    };

    img.onerror = (err) => {
      console.error("❌ Image failed to load:", src, err);
      reject(new Error(`Failed to load image: ${src}`));
    };

    img.src = src;
  });
}

/**
 * Share a Bible verse as a branded image card.
 * @param {{ reference: string, text: string }} verse
 * @param {string} theme - Current app theme
 * @returns {Promise<boolean>} true if share/download succeeded
 */
export async function shareVerseAsImage(verse, theme) {
  let container = null;
  try {
    const themeColors = {
      classic:          { bg: "#1C1A14", accent: "#CBB27C", text: "#E8DCC8", sub: "#9B8E6E" },
      "still-waters":   { bg: "#071E22", accent: "#4AABB8", text: "#D4E8EB", sub: "#6A9FA8" },
      "stone-fire":     { bg: "#1A0A06", accent: "#F97316", text: "#FED7AA", sub: "#B85A1A" },
      "olive-parchment":{ bg: "#1E1C14", accent: "#B0A070", text: "#E8E3D6", sub: "#7E7850" },
      parchment:        { bg: "#1C1A14", accent: "#9B8055", text: "#E8DCC8", sub: "#7A6A48" },
    };
    const colors = themeColors[theme] || themeColors.classic;

    // Preload logo
    const logoUrl = `${import.meta.env.BASE_URL}ABIDE.png`;
    const logoImg = await loadImageWithCORS(logoUrl);

    // Off-screen container
    container = document.createElement("div");
    container.style.cssText = "position:fixed;left:-9999px;top:0;z-index:-1;";
    document.body.appendChild(container);

    // Card
    const card = document.createElement("div");
    card.style.cssText = `
      width:600px; box-sizing:border-box;
      background:${colors.bg};
      padding:56px 52px 48px;
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      display:flex; flex-direction:column; align-items:center;
    `;

    // Logo
    const logo = document.createElement("img");
    logo.crossOrigin = "anonymous";
    logo.src = logoImg.src;
    logo.style.cssText = "width:140px;height:auto;opacity:0.85;margin-bottom:40px;";
    card.appendChild(logo);

    // Top rule
    const topRule = document.createElement("div");
    topRule.style.cssText = `
      width:1px; height:36px;
      background:linear-gradient(to bottom,transparent,${colors.accent}60);
      margin-bottom:32px;
    `;
    card.appendChild(topRule);

    // Verse text
    const verseText = document.createElement("p");
    verseText.style.cssText = `
      font-size:22px; line-height:1.75; font-style:italic;
      color:${colors.text}; text-align:center;
      margin:0 0 32px; padding:0 8px; letter-spacing:0.01em;
    `;
    verseText.textContent = `“${verse.text}”`;
    card.appendChild(verseText);

    // Bottom rule
    const botRule = document.createElement("div");
    botRule.style.cssText = `
      width:1px; height:36px;
      background:linear-gradient(to bottom,${colors.accent}60,transparent);
      margin-bottom:28px;
    `;
    card.appendChild(botRule);

    // Reference
    const ref = document.createElement("div");
    ref.style.cssText = `
      font-size:13px; font-weight:600; letter-spacing:0.14em;
      text-transform:uppercase; color:${colors.accent};
      text-align:center; margin-bottom:32px;
    `;
    ref.textContent = verse.reference;
    card.appendChild(ref);

    // Divider line
    const divider = document.createElement("div");
    divider.style.cssText = `
      width:100%; height:1px;
      background:linear-gradient(to right,transparent,${colors.accent}30,transparent);
      margin-bottom:24px;
    `;
    card.appendChild(divider);

    // ABIDE wordmark
    const wordmark = document.createElement("div");
    wordmark.style.cssText = `
      font-size:10px; letter-spacing:0.28em; text-transform:uppercase;
      color:${colors.sub}; text-align:center;
    `;
    wordmark.textContent = "ABIDE";
    card.appendChild(wordmark);

    container.appendChild(card);
    await new Promise((r) => setTimeout(r, 150));

    const canvas = await html2canvas(card, {
      backgroundColor: colors.bg,
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: false,
      foreignObjectRendering: false,
    });

    document.body.removeChild(container);
    container = null;

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error("toBlob returned null")), "image/png", 1.0);
    });

    const filename = `abide-verse-${Date.now()}.png`;
    const file = new File([blob], filename, { type: "image/png" });

    if (navigator.share) {
      try {
        await navigator.share({ files: [file], title: verse.reference });
        return true;
      } catch (e) {
        if (e.name === "AbortError") return true;
      }
    }

    // Fallback: download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.style.display = "none";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (err) {
    console.error("[shareVerseAsImage]", err);
    if (container?.parentNode) document.body.removeChild(container);
    return false;
  }
}

/**
 * Share dialogue entry as a beautiful branded image
 * @param {Object} entry - Dialogue entry data
 * @param {string} theme - Current theme (classic, still-waters, etc)
 * @returns {Promise<boolean>} True if share succeeded, false to fall back to text
 */
export async function shareDialogueAsImage(entry, theme) {
  console.log(
    "🎨 [ShareAsImage] Starting image generation for entry:",
    entry.id,
  );
  console.log("🎨 [ShareAsImage] Theme:", theme);
  console.log("🎨 [ShareAsImage] BASE_URL:", import.meta.env.BASE_URL);

  let container = null;

  try {
    // Theme color mappings
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

    // STEP 1: Preload logo with CORS
    const logoUrl = `${import.meta.env.BASE_URL}ABIDE.png`;
    console.log("🎨 [ShareAsImage] Preloading logo:", logoUrl);
    const logoImg = await loadImageWithCORS(logoUrl);

    // STEP 2: Create off-screen container
    container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.zIndex = "-1";
    document.body.appendChild(container);

    // STEP 3: Build HTML structure
    const card = document.createElement("div");
    card.style.width = "600px";
    card.style.background = colors.bg;
    card.style.color = colors.text;
    card.style.padding = "60px 50px";
    card.style.fontFamily =
      '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    card.style.boxSizing = "border-box";

    // Logo section
    const logoSection = document.createElement("div");
    logoSection.style.textAlign = "center";
    logoSection.style.marginBottom = "40px";

    const logo = document.createElement("img");
    logo.crossOrigin = "anonymous"; // Critical: prevent tainting
    logo.src = logoImg.src; // Use preloaded image src
    logo.style.width = "200px";
    logo.style.height = "auto";
    logo.style.opacity = "0.9";
    logoSection.appendChild(logo);
    card.appendChild(logoSection);

    // Scripture reference (if applicable)
    if (entry.type === "scripture" && entry.book && entry.chapter) {
      const refDiv = document.createElement("div");
      refDiv.style.textAlign = "center";
      refDiv.style.fontSize = "14px";
      refDiv.style.fontWeight = "600";
      refDiv.style.color = colors.accent;
      refDiv.style.marginBottom = "20px";
      refDiv.textContent = `${entry.book} ${entry.chapter}${entry.verseRange ? `:${entry.verseRange}` : ""}${entry.translation ? ` • ${entry.translation}` : ""}`;
      card.appendChild(refDiv);
    }

    // Verse text (if applicable)
    if (entry.type === "scripture" && entry.verseText) {
      const verseBox = document.createElement("div");
      verseBox.style.background =
        entry.highlightColor?.color || `${colors.accent}33`;
      verseBox.style.padding = "30px";
      verseBox.style.borderRadius = "12px";
      verseBox.style.marginBottom = "30px";
      verseBox.style.borderLeft = `4px solid ${colors.accent}`;

      const verseText = document.createElement("p");
      verseText.style.fontSize = "18px";
      verseText.style.lineHeight = "1.8";
      verseText.style.fontStyle = "italic";
      verseText.style.margin = "0";
      verseText.style.color = colors.text;
      verseText.textContent = `"${entry.verseText}"`;
      verseBox.appendChild(verseText);
      card.appendChild(verseBox);
    }

    // Reflection text
    const reflection = document.createElement("div");
    reflection.style.fontSize = "16px";
    reflection.style.lineHeight = "1.8";
    reflection.style.color = colors.text;
    reflection.style.marginBottom = "30px";
    reflection.style.whiteSpace = "pre-wrap";
    reflection.textContent =
      entry.text || entry.reflection.replace(/<[^>]*>/g, "");
    card.appendChild(reflection);

    // Divider
    const divider = document.createElement("div");
    divider.style.height = "1px";
    divider.style.background = `linear-gradient(to right, transparent, ${colors.accent}40, transparent)`;
    divider.style.margin = "30px 0";
    card.appendChild(divider);

    // Date
    const dateDiv = document.createElement("div");
    dateDiv.style.textAlign = "center";
    dateDiv.style.fontSize = "12px";
    dateDiv.style.color = colors.text;
    dateDiv.style.opacity = "0.6";
    dateDiv.textContent = formattedDate;
    card.appendChild(dateDiv);

    container.appendChild(card);

    // STEP 4: Allow DOM to settle
    await new Promise((resolve) => setTimeout(resolve, 150));

    console.log("🎨 [ShareAsImage] Rendering canvas...");

    // STEP 5: Render to canvas (strict CORS mode, no tainting)
    const canvas = await html2canvas(card, {
      backgroundColor: colors.bg,
      scale: 2,
      useCORS: true, // ONLY use CORS mode
      logging: false,
      allowTaint: false, // Never allow tainted canvas
      foreignObjectRendering: false, // Avoid foreign object issues
    });

    console.log("✅ [ShareAsImage] Canvas rendered successfully");
    console.log(
      "🎨 [ShareAsImage] Canvas dimensions:",
      canvas.width,
      "x",
      canvas.height,
    );

    // Clean up container
    document.body.removeChild(container);
    container = null;

    // STEP 6: Convert to blob
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(
              new Error("Canvas toBlob returned null - canvas may be tainted"),
            );
            return;
          }
          resolve(result);
        },
        "image/png",
        1.0,
      );
    });

    if (!blob) {
      throw new Error("Blob creation failed - received null");
    }

    console.log("✅ [ShareAsImage] Blob created:", blob.size, "bytes");

    // STEP 7: Create file for sharing
    const filename = `abide-dialogue-${Date.now()}.png`;
    const file = new File([blob], filename, { type: "image/png" });

    console.log("🎨 [ShareAsImage] File created:", filename);

    // STEP 8: Attempt native share
    if (navigator.share) {
      console.log(
        "🎨 [ShareAsImage] Web Share API available, attempting share...",
      );

      try {
        // Attempt share directly (don't gate on canShare - it's unreliable in PWAs)
        await navigator.share({
          files: [file],
          title:
            entry.type === "scripture"
              ? `${entry.book} ${entry.chapter}:${entry.verseRange}`
              : "My Prayer",
        });

        console.log("✅ [ShareAsImage] Share completed successfully");
        return true;
      } catch (shareError) {
        // User cancelled or share failed
        if (shareError.name === "AbortError") {
          console.log("ℹ️ [ShareAsImage] User cancelled share");
          return true; // User cancelled is not a failure
        }

        console.warn(
          "⚠️ [ShareAsImage] Share failed, falling back to download:",
          shareError,
        );
        // Fall through to download
      }
    } else {
      console.log("ℹ️ [ShareAsImage] Web Share API not available");
    }

    // STEP 9: Fallback to download
    console.log("🎨 [ShareAsImage] Downloading image as fallback...");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up blob URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    console.log("✅ [ShareAsImage] Image downloaded successfully");
    return true;
  } catch (error) {
    console.error("❌ [ShareAsImage] Fatal error:", error);
    console.error("❌ [ShareAsImage] Error stack:", error.stack);

    // Clean up container if it exists
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }

    return false; // Signal to fall back to text sharing
  }
}
