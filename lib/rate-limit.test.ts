import { describe, it, expect } from "vitest";
import { rateLimit, clientIp } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    expect(rateLimit("test-a", 3, 60_000)).toBe(true);
    expect(rateLimit("test-a", 3, 60_000)).toBe(true);
    expect(rateLimit("test-a", 3, 60_000)).toBe(true);
  });

  it("blocks requests over the limit", () => {
    rateLimit("test-b", 2, 60_000);
    rateLimit("test-b", 2, 60_000);
    expect(rateLimit("test-b", 2, 60_000)).toBe(false);
  });

  it("tracks keys independently", () => {
    rateLimit("test-c1", 1, 60_000);
    expect(rateLimit("test-c1", 1, 60_000)).toBe(false);
    expect(rateLimit("test-c2", 1, 60_000)).toBe(true);
  });

  it("resets after the window expires", async () => {
    rateLimit("test-d", 1, 50);
    expect(rateLimit("test-d", 1, 50)).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(rateLimit("test-d", 1, 50)).toBe(true);
  });
});

describe("clientIp", () => {
  it("reads x-forwarded-for first entry", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientIp(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "9.9.9.9" });
    expect(clientIp(headers)).toBe("9.9.9.9");
  });

  it("returns 'unknown' when no header is present", () => {
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
