import { describe, it, expect } from "vitest";
import { slugify, uniqueSlug } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Fitted Wardrobe")).toBe("fitted-wardrobe");
  });

  it("strips punctuation", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("a -- b --- c")).toBe("a-b-c");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("-hello-")).toBe("hello");
  });

  it("removes accents", () => {
    expect(slugify("café")).toBe("cafe");
  });

  it("truncates to 160 characters", () => {
    const long = "a".repeat(200);
    expect(slugify(long).length).toBeLessThanOrEqual(160);
  });
});

describe("uniqueSlug", () => {
  it("returns the base when unused", () => {
    expect(uniqueSlug("post", [])).toBe("post");
  });

  it("appends -2 on first collision", () => {
    expect(uniqueSlug("post", ["post"])).toBe("post-2");
  });

  it("keeps incrementing until free", () => {
    expect(uniqueSlug("post", ["post", "post-2", "post-3"])).toBe("post-4");
  });
});
