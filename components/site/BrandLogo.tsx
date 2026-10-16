import Image from "next/image";

export function BrandLogo({
  logoUrl,
  businessName,
  compact = false,
}: {
  logoUrl: string;
  businessName: string;
  compact?: boolean;
}) {
  const name = businessName.trim() || "Official Akogun Furniture";
  const imageUrl = logoUrl.trim();

  return (
    <span className="inline-flex min-w-0 items-center gap-3">
      <span className="relative inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/45 bg-wood-deep/35 shadow-[0_0_22px_rgba(198,166,107,0.12)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="44px"
            unoptimized
            className="object-contain p-1.5"
          />
        ) : (
          <svg
            viewBox="0 0 40 40"
            className="size-8 text-gold"
            fill="none"
            aria-hidden="true"
          >
            <path d="M6 31V11l14 11L34 11v20" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M11 31V19l9 7 9-7v12M5 35h30" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {!compact ? (
        <span className="min-w-0">
          <span className="block truncate font-display text-base leading-tight tracking-wide text-ivory sm:text-lg">
            {name}
          </span>
          <span className="mt-1 block text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-gold">
            Furniture &amp; interiors
          </span>
        </span>
      ) : null}
    </span>
  );
}
