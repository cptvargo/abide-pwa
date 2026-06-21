import { describe, it, expect } from "vitest";
import { parseRef, formatRefDisplay } from "../crossRefUtils.js";

describe("parseRef", () => {
  it("parses a standard book chapter:verse ref", () => {
    expect(parseRef("john 3:16")).toEqual({ bookSlug: "john", chapter: 3, verse: 16 });
  });

  it("parses a large psalm ref", () => {
    expect(parseRef("psalms 119:105")).toEqual({ bookSlug: "psalms", chapter: 119, verse: 105 });
  });

  it("parses a multi-book slug", () => {
    expect(parseRef("songofsolomon 1:2")).toEqual({ bookSlug: "songofsolomon", chapter: 1, verse: 2 });
  });

  it("parses a numbered-book slug", () => {
    expect(parseRef("1corinthians 13:4")).toEqual({ bookSlug: "1corinthians", chapter: 13, verse: 4 });
  });

  it("defaults verse to 1 when no verse given", () => {
    expect(parseRef("john 3")).toEqual({ bookSlug: "john", chapter: 3, verse: 1 });
  });

  it("handles verse range by using the first verse", () => {
    expect(parseRef("romans 8:28-30")).toEqual({ bookSlug: "romans", chapter: 8, verse: 28 });
  });

  it("returns null for a ref with no space (malformed)", () => {
    expect(parseRef("john3:16")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(parseRef("")).toBeNull();
  });

  it("returns null for a single word with no location", () => {
    expect(parseRef("genesis")).toBeNull();
  });
});

describe("formatRefDisplay", () => {
  it("capitalizes a simple book slug", () => {
    expect(formatRefDisplay("john 3:16")).toBe("John 3:16");
  });

  it("expands a numbered book slug", () => {
    expect(formatRefDisplay("1samuel 2:3")).toBe("1 Samuel 2:3");
  });

  it("expands songofsolomon", () => {
    expect(formatRefDisplay("songofsolomon 4:1")).toBe("Song of Solomon 4:1");
  });

  it("expands 1corinthians", () => {
    expect(formatRefDisplay("1corinthians 13:13")).toBe("1 Corinthians 13:13");
  });

  it("returns the ref unchanged when there is no space (no crash)", () => {
    expect(formatRefDisplay("malformedref")).toBe("malformedref");
  });

  it("capitalizes psalms correctly", () => {
    expect(formatRefDisplay("psalms 23:1")).toBe("Psalms 23:1");
  });
});
