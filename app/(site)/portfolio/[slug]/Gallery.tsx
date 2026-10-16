"use client";

import Image from "next/image";
import { useState } from "react";
import { Expand } from "lucide-react";
import { Lightbox, type LightboxImage } from "@/components/ui/Lightbox";

export function Gallery({
  cover,
  images,
  title,
}: {
  cover: { url: string; alt: string };
  images: LightboxImage[];
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const all: LightboxImage[] = images.length > 0 ? images : [cover];

  return (
    <>
      <div className="grid gap-4">
        <button
          type="button"
          className="group relative block h-[22rem] w-full overflow-hidden rounded-[var(--radius-card)] border border-ivory/10 sm:h-[32rem]"
          onClick={() => {
            setStartIndex(0);
            setOpen(true);
          }}
          aria-label={`View ${title} cover image full screen`}
        >
          <Image
            src={cover.url}
            alt={cover.alt || title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-obsidian/80 px-3 py-2 text-xs text-ivory opacity-0 transition-opacity group-hover:opacity-100">
            <Expand className="size-4" aria-hidden /> View
          </span>
        </button>

        {all.length > 1 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {all.slice(0, 4).map((image, index) => (
              <button
                key={`${image.url}-${index}`}
                type="button"
                className="group relative block aspect-[4/3] overflow-hidden rounded-xl border border-ivory/10"
                onClick={() => {
                  setStartIndex(index);
                  setOpen(true);
                }}
                aria-label={`View image ${index + 1} of ${all.length}`}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {open ? <Lightbox images={all} startIndex={startIndex} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
