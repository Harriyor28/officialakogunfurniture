import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "./ContactForm";
import { getBusinessSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Official Akogun Furniture by phone, WhatsApp, email or the contact form.",
};

export default async function ContactPage() {
  const settings = await getBusinessSettings();
  const waLink = whatsappLink(settings.whatsapp, "Hello Official Akogun Furniture, I have a question.");

  return (
    <div className="container-site grid gap-12 pb-24 pt-32 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <p className="eyebrow mb-3">Contact us</p>
        <h1 className="text-3xl text-ivory sm:text-5xl">Let&apos;s talk about your space</h1>
        <p className="mt-5 max-w-xl text-muted">
          Send a message and our team will respond using your preferred contact method. For project
          quotations, the dedicated quote form captures everything we need first time.
        </p>
        <div className="gold-rule mt-6 w-40" />
        <div className="mt-10">
          <ContactForm />
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
        <div className="card-surface p-6">
          <h2 className="text-lg text-ivory">Business details</h2>
          <ul className="mt-4 space-y-4 text-sm text-muted">
            {settings.phone ? (
              <li className="flex items-center gap-3">
                <Phone className="size-4 text-gold" aria-hidden />
                <a className="hover:text-gold" href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}>{settings.phone}</a>
              </li>
            ) : null}
            {settings.email ? (
              <li className="flex items-center gap-3">
                <Mail className="size-4 text-gold" aria-hidden />
                <a className="hover:text-gold" href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
            ) : null}
            {settings.address ? (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 text-gold" aria-hidden />
                <span className="whitespace-pre-line">{settings.address}</span>
              </li>
            ) : null}
            {settings.hours ? (
              <li className="flex items-center gap-3">
                <span className="size-4" aria-hidden />
                <span>{settings.hours}</span>
              </li>
            ) : null}
          </ul>
        </div>

        {waLink ? (
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="card-surface flex items-center gap-3 p-6 transition-colors hover:border-gold/40">
            <MessageCircle className="size-5 text-gold" aria-hidden />
            <span className="text-sm text-ivory">Chat with us on WhatsApp</span>
          </a>
        ) : null}
      </aside>
    </div>
  );
}
