"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, X } from "lucide-react";

type ImageEntry = { url: string; alt: string };

/**
 * Admin gallery editor: uploads images to /api/admin/uploads and renders
 * hidden `imageUrls[]` / `imageAlts[]` inputs consumed by save actions.
 */
export function ImageGallery({
  initial = [],
  name = "imageUrls",
  max = 12,
  label = "Gallery images",
}: {
  initial?: ImageEntry[];
  name?: string;
  max?: number;
  label?: string;
}) {
  const [images, setImages] = useState<ImageEntry[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function upload(file: File) {
    setError(null);
    startTransition(async () => {
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/uploads", { method: "POST", body });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          setError(data.error ?? "Upload failed.");
          return;
        }
        setImages((prev) => [...prev, { url: data.url!, alt: "" }]);
      } catch {
        setError("Upload failed. Check your connection and try again.");
      }
    });
  }

  return (
    <div>
      <span className="label">{label}</span>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, index) => (
          <li key={`${image.url}-${index}`} className="relative overflow-hidden rounded-lg border border-ivory/10">
            <Image src={image.url} alt={image.alt || "Gallery image"} width={300} height={200} className="h-28 w-full object-cover" />
            <input type="hidden" name={name} value={image.url} />
            <input
              type="hidden"
              name={name === "imageUrls" ? "imageAlts" : `${name}Alt`}
              value={image.alt}
            />
            <div className="absolute inset-x-0 bottom-0 bg-obsidian/85 p-1.5">
              <label className="sr-only" htmlFor={`${name}-alt-${index}`}>
                Alt text
              </label>
              <input
                id={`${name}-alt-${index}`}
                value={image.alt}
                onChange={(e) =>
                  setImages((prev) => prev.map((img, i) => (i === index ? { ...img, alt: e.target.value } : img)))
                }
                placeholder="Alt text"
                className="input px-2 py-1 text-xs"
              />
            </div>
            <button
              type="button"
              onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
              className="absolute right-1.5 top-1.5 rounded-full bg-obsidian/85 p-1 text-ivory hover:text-danger"
              aria-label={`Remove image ${index + 1}`}
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </li>
        ))}
        {images.length < max ? (
          <li>
            <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ivory/20 text-xs text-muted transition-colors hover:border-gold/50 hover:text-gold">
              {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <ImageIcon className="size-5" aria-hidden />}
              {pending ? "Uploading…" : "Add image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) upload(file);
                  e.target.value = "";
                }}
              />
            </label>
          </li>
        ) : null}
      </ul>
      {error ? (
        <p role="alert" className="field-error">
          {error}
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted">JPG, PNG, WebP, AVIF or SVG · max 8 MB each · max {max} images.</p>
      )}
    </div>
  );
}

/** Single-image field (cover images, avatars, blog covers). */
export function SingleImage({ initial = "", name = "coverImage", label = "Cover image" }: { initial?: string; name?: string; label?: string }) {
  const [url, setUrl] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-start gap-3">
        {url ? (
          <div className="relative">
            <Image src={url} alt="" width={160} height={110} className="h-24 w-36 rounded-lg border border-ivory/10 object-cover" />
            <button
              type="button"
              onClick={() => setUrl("")}
              className="absolute -right-2 -top-2 rounded-full bg-obsidian p-1 text-ivory hover:text-danger"
              aria-label="Remove image"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
        ) : null}
        <label className="btn btn-ghost cursor-pointer px-4 py-2 text-xs">
          {pending ? "Uploading…" : url ? "Replace" : "Upload"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError(null);
              startTransition(async () => {
                try {
                  const body = new FormData();
                  body.append("file", file);
                  const res = await fetch("/api/admin/uploads", { method: "POST", body });
                  const data = (await res.json()) as { url?: string; error?: string };
                  if (!res.ok || !data.url) setError(data.error ?? "Upload failed.");
                  else setUrl(data.url);
                } catch {
                  setError("Upload failed.");
                }
                e.target.value = "";
              });
            }}
          />
        </label>
      </div>
      {error ? (
        <p role="alert" className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SingleVideo({
  initial = "",
  name = "heroVideoUrl",
  label = "Hero ambient video",
  hint = "Upload an MP4 or WebM video (up to 40MB) or enter a video URL.",
}: {
  initial?: string;
  name?: string;
  label?: string;
  hint?: string;
}) {
  const [url, setUrl] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="label mb-0" htmlFor={name}>{label}</label>
        {url ? (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="text-xs text-muted hover:text-danger"
          >
            Clear video
          </button>
        ) : null}
      </div>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      <div className="flex items-center gap-3">
        <input
          id={name}
          name={name}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/demo/atelier-motion.mp4 or https://..."
          className="input flex-1 text-sm font-mono"
        />
        <label className="btn btn-ghost shrink-0 cursor-pointer px-4 py-2 text-xs">
          {pending ? "Uploading…" : "Upload video"}
          <input
            type="file"
            accept="video/mp4,video/webm"
            className="sr-only"
            disabled={pending}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError(null);
              startTransition(async () => {
                try {
                  const body = new FormData();
                  body.append("file", file);
                  const res = await fetch("/api/admin/uploads", { method: "POST", body });
                  const data = (await res.json()) as { url?: string; error?: string };
                  if (!res.ok || !data.url) setError(data.error ?? "Upload failed.");
                  else setUrl(data.url);
                } catch {
                  setError("Upload failed. File might be too large or network interrupted.");
                }
                e.target.value = "";
              });
            }}
          />
        </label>
      </div>
      {url ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-ivory/15 bg-obsidian/60 p-2">
          <p className="mb-2 text-xs text-muted">Preview:</p>
          <video
            src={url}
            autoPlay
            muted
            loop
            playsInline
            controls
            className="max-h-48 w-full rounded object-cover"
          />
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
