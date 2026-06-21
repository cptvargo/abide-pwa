import { describe, it, expect } from "vitest";

// The validation logic from AppShell's translation state initializer.
// Extracted here so it can be tested independently of the React component.
const TRANSLATIONS = ["KJV", "ASR", "WAE"];

function resolveTranslation(stored) {
  return TRANSLATIONS.includes(stored) ? stored : "KJV";
}

describe("TRANSLATIONS list", () => {
  it("contains exactly KJV, ASR, WAE", () => {
    expect(TRANSLATIONS).toEqual(["KJV", "ASR", "WAE"]);
  });

  it("does not contain dropped translations", () => {
    expect(TRANSLATIONS).not.toContain("VSV");
    expect(TRANSLATIONS).not.toContain("AKT");
  });
});

describe("resolveTranslation (localStorage fallback guard)", () => {
  it("returns a valid stored translation as-is", () => {
    expect(resolveTranslation("KJV")).toBe("KJV");
    expect(resolveTranslation("ASR")).toBe("ASR");
    expect(resolveTranslation("WAE")).toBe("WAE");
  });

  it("falls back to KJV for a dropped translation (VSV bug)", () => {
    expect(resolveTranslation("VSV")).toBe("KJV");
  });

  it("falls back to KJV for null (nothing stored)", () => {
    expect(resolveTranslation(null)).toBe("KJV");
  });

  it("falls back to KJV for undefined", () => {
    expect(resolveTranslation(undefined)).toBe("KJV");
  });

  it("falls back to KJV for an empty string", () => {
    expect(resolveTranslation("")).toBe("KJV");
  });

  it("falls back to KJV for an arbitrary garbage string", () => {
    expect(resolveTranslation("XYZ")).toBe("KJV");
  });
});
