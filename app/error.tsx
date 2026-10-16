"use client";

import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center">
        <p className="eyebrow mb-3">Error</p>
        <h1 className="text-3xl text-ivory sm:text-4xl">Something went wrong</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
          An unexpected error occurred while loading this page. You can try again, or return home.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-muted">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-primary">
            Try again
          </button>
          <Link href="/" className="btn btn-ghost">Go home</Link>
        </div>
      </div>
    </div>
  );
}
