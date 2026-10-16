import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/format";
import { BrandLogo } from "@/components/site/BrandLogo";

export function Footer({
  businessName,
  logoUrl,
  phone,
  email,
  whatsapp,
  address,
  hours,
  socials,
  footerNote,
  demoContent,
}: {
  businessName: string;
  logoUrl: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  hours: string;
  socials: { facebook: string; instagram: string; twitter: string };
  footerNote: string;
  demoContent: boolean;
}) {
  const waLink = whatsappLink(whatsapp, "Hello Official Akogun Furniture, I would like to make an enquiry.");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-ivory/10 bg-charcoal">
      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandLogo logoUrl={logoUrl} businessName={businessName} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {footerNote || "Bespoke furniture, cabinetry and interior woodwork crafted to transform your space."}
          </p>
          {demoContent ? (
            <p className="mt-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
              Some portfolio images and examples are illustrative.
            </p>
          ) : null}
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-ivory/70">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li><Link className="hover:text-gold" href="/portfolio">Portfolio</Link></li>
            <li><Link className="hover:text-gold" href="/furniture">Furniture catalogue</Link></li>
            <li><Link className="hover:text-gold" href="/services">Services</Link></li>
            <li><Link className="hover:text-gold" href="/blog">Inspiration blog</Link></li>
            <li><Link className="hover:text-gold" href="/about">About us</Link></li>
          </ul>
        </nav>

        <nav aria-label="Customer">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-ivory/70">Customers</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li><Link className="hover:text-gold" href="/quote">Request a quote</Link></li>
            <li><Link className="hover:text-gold" href="/track">Track my project</Link></li>
            <li><Link className="hover:text-gold" href="/login">Customer login</Link></li>
            <li><Link className="hover:text-gold" href="/register">Create an account</Link></li>
            <li><Link className="hover:text-gold" href="/contact">Contact us</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-ivory/70">Contact</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {phone ? (
              <li>
                <a className="hover:text-gold" href={`tel:${phone.replace(/[^0-9+]/g, "")}`}>{phone}</a>
              </li>
            ) : null}
            {email ? (
              <li>
                <a className="hover:text-gold" href={`mailto:${email}`}>{email}</a>
              </li>
            ) : null}
            {address ? <li className="whitespace-pre-line">{address}</li> : null}
            {hours ? <li>{hours}</li> : null}
            {waLink ? (
              <li>
                <a className="inline-flex items-center gap-2 hover:text-gold" href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" aria-hidden />
                  WhatsApp enquiry
                </a>
              </li>
            ) : null}
          </ul>
          {(socials.facebook || socials.instagram || socials.twitter) ? (
            <div className="mt-4 flex gap-4 text-sm">
              {socials.facebook ? (
                <a className="hover:text-gold" href={socials.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
              ) : null}
              {socials.instagram ? (
                <a className="hover:text-gold" href={socials.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              ) : null}
              {socials.twitter ? (
                <a className="hover:text-gold" href={socials.twitter} target="_blank" rel="noopener noreferrer">X / Twitter</a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted sm:flex-row">
          <p>© {year} {businessName || "Official Akogun Furniture"}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link className="hover:text-gold" href="/privacy">Privacy policy</Link>
            <Link className="hover:text-gold" href="/terms">Terms &amp; conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
