import Link from "next/link";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div
        className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(112,69,45,0.35),transparent_60%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 block text-center" aria-label="Back to home">
          <span className="font-display text-2xl text-ivory">AKOGUN</span>
          <span className="ml-2 text-[0.62rem] font-semibold uppercase tracking-[0.35em] text-gold">Furniture</span>
        </Link>
        <div className="card-surface p-7 sm:p-9">{children}</div>
        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="hover:text-gold">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}
