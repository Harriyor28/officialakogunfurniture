"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, MessageCircle, Phone, X } from "lucide-react";
import { cn, whatsappLink } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { BrandLogo } from "@/components/site/BrandLogo";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/furniture", label: "Furniture" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header({
  whatsapp,
  phone,
  logoUrl,
  businessName,
}: {
  whatsapp: string;
  phone: string;
  logoUrl: string;
  businessName: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const waLink = whatsappLink(whatsapp, "Hello Official Akogun Furniture, I would like to make an enquiry.");

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-ivory/10 backdrop-blur-md transition-all duration-300",
        scrolled || open
          ? "bg-[var(--color-obsidian)]/90 shadow-[0_10px_35px_-30px_rgba(36,29,21,0.18)]"
          : "bg-[var(--color-obsidian)]/75",
      )}
    >
      <div className="container-site relative z-10 flex h-[5.25rem] items-center justify-between gap-4">
        <Link href="/" className="group min-w-0" aria-label={`${businessName} — home`}>
          <BrandLogo logoUrl={logoUrl} businessName={businessName} />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 xl:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[0.78rem] font-medium tracking-wide transition-colors hover:text-gold",
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                  ? "text-gold"
                  : "text-ivory/80",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-ivory/80 transition-colors hover:text-gold"
            >
              <MessageCircle className="size-4" aria-hidden />
              WhatsApp
            </a>
          ) : null}
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
              className="inline-flex items-center gap-2 text-xs text-ivory/80 transition-colors hover:text-gold"
              aria-label="Call us"
            >
              <Phone className="size-4" aria-hidden />
              <span className="sr-only sm:not-sr-only">Call</span>
            </a>
          ) : null}
          <ButtonLink href="/track" variant="ghost" size="sm" className="border-0 px-2">
            Track
          </ButtonLink>
          <ButtonLink href="/quote" size="sm" className="rounded-sm px-5">
            Begin a commission
          </ButtonLink>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-ivory/20 px-4 py-2 text-sm text-ivory xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile navigation drawer */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-ivory/10 bg-charcoal xl:hidden"
      >
        <nav aria-label="Mobile" className="container-site flex flex-col gap-1 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-3 py-3 text-base font-medium",
                pathname === link.href ? "bg-ivory/5 text-gold" : "text-ivory/85",
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 grid gap-3 pb-6">
            <ButtonLink href="/quote" className="w-full" onClick={() => setOpen(false)}>
              Request a Quote
            </ButtonLink>
            <ButtonLink href="/track" variant="secondary" className="w-full" onClick={() => setOpen(false)}>
              Track My Project
            </ButtonLink>
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost w-full"
              >
                <MessageCircle className="size-4" aria-hidden />
                Chat on WhatsApp
              </a>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
