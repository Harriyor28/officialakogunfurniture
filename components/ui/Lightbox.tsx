"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type LightboxImage = { url: string; alt: string };

/**
 * Accessible image lightbox: keyboard navigation (Escape, arrow keys),
 * backdrop click to close, and touch-friendly controls.
 */
export function Lightbox({
  images,
  startIndex = 0,
  onClose,
}: {
  images: LightboxImage[];
  startIndex?: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);

  const previous = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, next, previous]);

  const current = images[index];
  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/95 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close image viewer"
        className="absolute right-4 top-4 z-10 rounded-full border border-ivory/20 p-2 text-ivory hover:bg-ivory/10"
        onClick={onClose}
      >
        <X className="size-5" />
      </button>

      {images.length > 1 ? (
        <button
          type="button"
          aria-label="Previous image"
          className="absolute left-3 z-10 rounded-full border border-ivory/20 bg-obsidian/70 p-3 text-ivory hover:bg-ivory/10 sm:left-6"
          onClick={(event) => {
            event.stopPropagation();
            previous();
          }}
        >
          <ChevronLeft className="size-6" />
        </button>
      ) : null}

      <figure
        className="relative max-h-[85vh] w-full max-w-5xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Demo and uploaded assets are local; fill keeps the lightbox layout stable. */}
        <Image
          src={current.url}
          alt={current.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-contain"
          priority
        />
        <figcaption className="mt-3 text-center text-sm text-muted">
          {current.alt || "Project image"} · {index + 1} / {images.length}
        </figcaption>
      </figure>

      {images.length > 1 ? (
        <button
          type="button"
          aria-label="Next image"
          className="absolute right-3 z-10 rounded-full border border-ivory/20 bg-obsidian/70 p-3 text-ivory hover:bg-ivory/10 sm:right-6"
          onClick={(event) => {
            event.stopPropagation();
            next();
          }}
        >
          <ChevronRight className="size-6" />
        </button>
      ) : null}
    </div>
  );
}
