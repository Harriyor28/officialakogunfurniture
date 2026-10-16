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

function safeExt(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : "";
}

/**
 * Save a public marketing image or video (portfolio, product, hero video, blog cover)
 * under public/uploads so it is served by Next.js.
 * Returns null when the file type or size is not allowed.
 */
export async function savePublicImage(file: File): Promise<UploadResult | null> {
  const ext = MEDIA_TYPES[file.type];
  const isVideo = file.type.startsWith("video/");
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (!ext || file.size === 0 || file.size > maxBytes) return null;
  const stamp = new Date().toISOString().slice(0, 10);
  const name = `${randomBytes(8).toString("hex")}${safeExt(file.name) || ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", stamp);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
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
