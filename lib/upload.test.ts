import { describe, expect, it } from "vitest";
import { detectImageType } from "@/lib/upload";

const bytes = (...values: number[]) => Buffer.from(values);

function heic(): Buffer {
  const buffer = Buffer.alloc(32);
  buffer.writeUInt32BE(24, 0);
  buffer.write("ftypheic", 4, "ascii");
  buffer.write("mif1heic", 12, "ascii");
  return buffer;
}

function isoMediaBox(brand: string): Buffer {
  const buffer = Buffer.alloc(32);
  buffer.writeUInt32BE(24, 0);
  buffer.write("ftyp", 4, "ascii");
  buffer.write(brand, 8, "ascii");
  return buffer;
}

describe("detectImageType", () => {
  it("detects JPEG from its signature regardless of the file name", () => {
    expect(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10))).toEqual({
      mime: "image/jpeg",
      ext: ".jpg",
    });
  });

  it("detects PNG", () => {
    expect(detectImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toEqual({
      mime: "image/png",
      ext: ".png",
    });
  });

  it("detects WebP", () => {
    const buffer = Buffer.alloc(16);
    buffer.write("RIFF", 0, "ascii");
    buffer.write("WEBPVP8X", 8, "ascii");
    expect(detectImageType(buffer)).toEqual({ mime: "image/webp", ext: ".webp" });
  });

  it("detects AVIF", () => {
    expect(detectImageType(isoMediaBox("avif"))).toEqual({ mime: "image/avif", ext: ".avif" });
  });

  it("flags HEIC photos so they are rejected instead of saved as unreadable JPEGs", () => {
    expect(detectImageType(heic())?.mime).toBe("image/heic");
  });

  it("detects inline SVG", () => {
    expect(detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toEqual({
      mime: "image/svg+xml",
      ext: ".svg",
    });
  });

  it("returns null for files that are not images or supported videos", () => {
    expect(detectImageType(Buffer.from("not an image"))).toBeNull();
  });
});
