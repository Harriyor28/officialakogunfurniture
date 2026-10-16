import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, passwordIssues } from "@/lib/password";

describe("hashPassword / verifyPassword", () => {
  it("round-trips a valid password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });

  it("rejects a malformed stored hash", async () => {
    expect(await verifyPassword("anything", "not-a-hash")).toBe(false);
    expect(await verifyPassword("anything", "scrypt$bad")).toBe(false);
    expect(await verifyPassword("anything", "")).toBe(false);
  });

  it("throws for passwords under 8 characters", async () => {
    await expect(hashPassword("short")).rejects.toThrow();
  });
});

describe("passwordIssues", () => {
  it("accepts a reasonable password", () => {
    expect(passwordIssues("a-good-password")).toEqual([]);
  });

  it("flags short passwords", () => {
    expect(passwordIssues("short").length).toBeGreaterThan(0);
  });

  it("flags leading/trailing whitespace", () => {
    expect(passwordIssues(" padded-password ").length).toBeGreaterThan(0);
  });

  it("flags overly long passwords", () => {
    expect(passwordIssues("a".repeat(201)).length).toBeGreaterThan(0);
  });
});
