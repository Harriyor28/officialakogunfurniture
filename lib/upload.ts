import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

const MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

const ATTACHMENT_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
  "text/plain": ".txt",
};

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_VIDEO_BYTES = 40 * 1024 * 1024; // 40 MB
export const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024; // 15 MB

export type UploadResult = { url: string; filename: string; size: number };
export type UploadOutcome = UploadResult | { error: string };

function safeExt(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : "";
}

/**
 * Identify a file from its actual bytes.
 *
 * Browsers report the MIME type from the file extension on Windows, so an
 * iPhone HEIC photo renamed to `.jpeg` arrives labelled `image/jpeg`. Saving it
 * as a JPEG leaves a file that no browser can render (it shows as corrupt), so
 * the real type always wins here.
 */
export function detectImageType(buffer: Buffer): { mime: string; ext: string } | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", ext: ".jpg" };
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return { mime: "image/png", ext: ".png" };
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { mime: "image/webp", ext: ".webp" };
  }
  if (buffer.length >= 12 && buffer.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = buffer.subarray(8, 12).toString("ascii");
    if (brand === "avif" || brand === "avis") return { mime: "image/avif", ext: ".avif" };
    if (["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"].includes(brand)) {
      return { mime: "image/heic", ext: ".heic" };
    }
    if (brand === "qt  ") return { mime: "video/quicktime", ext: ".mov" };
    if (["isom", "iso2", "mp41", "mp42", "avc1", "M4V ", "m4v "].includes(brand)) {
      return { mime: "video/mp4", ext: ".mp4" };
    }
    return null;
  }
  if (buffer.length >= 4 && buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) {
    return { mime: "video/webm", ext: ".webm" };
  }
  const head = buffer.subarray(0, 512).toString("utf8").trimStart();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) {
    return { mime: "image/svg+xml", ext: ".svg" };
  }
  return null;
}

/**
 * Save a public marketing image or video (portfolio, product, hero video, blog cover)
 * under public/uploads so it is served by Next.js.
 */
export async function savePublicImage(file: File): Promise<UploadOutcome> {
  if (file.size === 0) return { error: "The selected file is empty." };

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(buffer);

  if (!detected) {
    return {
      error:
        "This file is not a supported image. Upload a JPG, PNG, WebP, AVIF or SVG photo (MP4 or WebM for video).",
    };
  }
  if (detected.mime === "image/heic") {
    return {
      error:
        "This is an iPhone HEIC photo, which web browsers cannot display. Export it as a JPG (or change the camera format to “Most Compatible”) and upload it again.",
    };
  }
  if (detected.mime === "video/quicktime") {
    return { error: "QuickTime .mov videos are not supported. Export the clip as MP4 and upload it again." };
  }

  const isVideo = detected.mime.startsWith("video/");
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return {
      error: isVideo
        ? "That video is larger than 40 MB. Compress it and try again."
        : "That image is larger than 8 MB. Resize it and try again.",
    };
  }

  const stamp = new Date().toISOString().slice(0, 10);
  // Use the detected type's extension so the file is always served with a
  // Content-Type the browser can actually decode.
  const ext = MEDIA_TYPES[detected.mime] ?? safeExt(file.name) ?? detected.ext;
  const name = `${randomBytes(8).toString("hex")}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", stamp);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return { url: `/uploads/${stamp}/${name}`, filename: name, size: file.size };
}

/**
 * Save a private enquiry attachment OUTSIDE the public directory.
 * Files are only reachable through an authenticated admin route handler.
 */
export async function savePrivateAttachment(file: File): Promise<UploadResult | null> {
  const ext = ATTACHMENT_TYPES[file.type] ?? safeExt(file.name);
  if (!ext || file.size === 0 || file.size > MAX_ATTACHMENT_BYTES) return null;
  const stamp = new Date().toISOString().slice(0, 10);
  const name = `${randomBytes(12).toString("hex")}${ext}`;
  const dir = path.join(process.cwd(), "data", "uploads", stamp);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buffer);
  return { url: `/api/attachments/${stamp}/${name}`, filename: file.name.slice(0, 200), size: file.size };
}

export function isAllowedImageType(type: string): boolean {
  return type in MEDIA_TYPES;
}
