import { describe, it, expect } from "vitest";
import { BIBLE_ORDER, CHAPTER_COUNT, getBookDisplayName } from "../bibleStructure.js";

describe("BIBLE_ORDER", () => {
  it("contains exactly 66 books", () => {
    expect(BIBLE_ORDER.length).toBe(66);
  });

  it("starts with genesis and ends with revelation", () => {
    expect(BIBLE_ORDER[0]).toBe("genesis");
    expect(BIBLE_ORDER[65]).toBe("revelation");
  });

  it("has no duplicate entries", () => {
    expect(new Set(BIBLE_ORDER).size).toBe(66);
  });
});

describe("CHAPTER_COUNT", () => {
  it("has a chapter count for every book in BIBLE_ORDER", () => {
    const missing = BIBLE_ORDER.filter((b) => !CHAPTER_COUNT[b]);
    expect(missing).toEqual([]);
  });

  it("has correct chapter counts for known books", () => {
    expect(CHAPTER_COUNT["psalms"]).toBe(150);
    expect(CHAPTER_COUNT["revelation"]).toBe(22);
    expect(CHAPTER_COUNT["genesis"]).toBe(50);
    expect(CHAPTER_COUNT["obadiah"]).toBe(1);
    expect(CHAPTER_COUNT["john"]).toBe(21);
  });
});

describe("getBookDisplayName", () => {
  it("capitalizes a simple slug", () => {
    expect(getBookDisplayName("john")).toBe("John");
  });

  it("expands numbered book slugs", () => {
    expect(getBookDisplayName("1samuel")).toBe("1 Samuel");
    expect(getBookDisplayName("2kings")).toBe("2 Kings");
    expect(getBookDisplayName("1corinthians")).toBe("1 Corinthians");
    expect(getBookDisplayName("3john")).toBe("3 John");
  });

  it("expands songofsolomon", () => {
    expect(getBookDisplayName("songofsolomon")).toBe("Song of Solomon");
  });

  it("returns empty string for falsy input", () => {
    expect(getBookDisplayName("")).toBe("");
    expect(getBookDisplayName(null)).toBe("");
    expect(getBookDisplayName(undefined)).toBe("");
  });
});
