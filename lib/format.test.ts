import { describe, it, expect } from "vitest";
import { formatMoney, formatDate, whatsappLink, cn } from "@/lib/format";

describe("formatMoney", () => {
  it("formats naira amounts", () => {
    const result = formatMoney(250000);
    expect(result).toContain("250");
    expect(result).toContain("000");
  });

  it("returns empty string for null/undefined", () => {
    expect(formatMoney(null)).toBe("");
    expect(formatMoney(undefined)).toBe("");
  });

  it("handles zero", () => {
    expect(formatMoney(0)).toBeTruthy();
  });
});

describe("formatDate", () => {
  it("formats a valid date", () => {
    const result = formatDate(new Date("2026-01-15"));
    expect(result).toContain("2026");
    expect(result).toContain("15");
  });

  it("supports dateStyle without conflicting date components", () => {
    const date = new Date("2026-01-15T12:00:00Z");
    expect(formatDate(date, { dateStyle: "medium" })).toBe(
      new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date),
    );
    expect(formatDate(date, { dateStyle: "short", timeStyle: "short" })).toBe(
      new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "short" }).format(date),
    );
  });

  it("returns empty string for null/invalid", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate("not-a-date")).toBe("");
  });
});

describe("whatsappLink", () => {
  it("builds a wa.me link with a Nigerian local number", () => {
    const link = whatsappLink("08012345678", "Hello");
    expect(link).toContain("wa.me/2348012345678");
    expect(link).toContain("text=Hello");
  });

  it("keeps an international number starting with 234", () => {
    const link = whatsappLink("2348012345678", "Hi");
    expect(link).toContain("wa.me/2348012345678");
  });

  it("returns null for empty or unusable input", () => {
    expect(whatsappLink("", "Hi")).toBeNull();
    expect(whatsappLink(null, "Hi")).toBeNull();
    expect(whatsappLink("abc", "Hi")).toBeNull();
  });

  it("URL-encodes the message", () => {
    const link = whatsappLink("08012345678", "hello & world");
    expect(link).toContain(encodeURIComponent("hello & world"));
  });
});

describe("cn", () => {
  it("joins truthy classes", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("filters out falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });
});
