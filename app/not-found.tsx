import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="eyebrow mb-3">404</p>
        <h1 className="text-4xl text-ivory sm:text-5xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/portfolio" variant="secondary">Browse portfolio</ButtonLink>
        </div>
        <p className="mt-8 text-sm text-muted">
          Or <Link href="/contact" className="text-gold hover:text-gold-soft">contact us</Link> if you need help.
        </p>
      </div>
    </div>
  );
}
