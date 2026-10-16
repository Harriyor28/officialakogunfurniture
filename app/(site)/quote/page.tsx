import type { Metadata } from "next";
import { QuoteForm } from "./QuoteForm";
import { getBusinessSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { whatsappLink } from "@/lib/format";
import { MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Request a personalised quotation for custom furniture, wardrobes, kitchen cabinets, interior woodwork, repairs or installation.",
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const [{ service }, settings, services] = await Promise.all([
    searchParams,
    getBusinessSettings(),
    prisma.service.findMany({ where: { published: true }, orderBy: { order: "asc" }, select: { name: true } }),
  ]);

  const waLink = whatsappLink(
    settings.whatsapp,
    "Hello Official Akogun Furniture, I would like to request a quotation.",
  );

  return (
    <div className="container-site pb-24 pt-32">
      <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
        <div>
          <p className="eyebrow mb-3">Request a quote</p>
          <h1 className="text-3xl text-ivory sm:text-5xl">Tell us about your project</h1>
          <p className="mt-5 max-w-2xl text-muted">
            Share your requirements and our team will prepare a personalised quotation. Submitting this form
            does not require an account — you will receive a reference number immediately.
          </p>
          <div className="gold-rule mt-6 w-40" />

          <div className="mt-10">
            <QuoteForm
              serviceOptions={services.map((s) => ({ value: s.name, label: s.name }))}
              defaultService={service}
            />
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="card-surface p-6">
            <h2 className="text-lg text-ivory">What happens next</h2>
            <ol className="mt-4 space-y-3 text-sm text-muted">
              <li><span className="text-gold">1.</span> You receive a unique reference number.</li>
              <li><span className="text-gold">2.</span> Our team reviews your requirements.</li>
              <li><span className="text-gold">3.</span> We contact you using your preferred method.</li>
              <li><span className="text-gold">4.</span> You receive a detailed quotation to approve.</li>
            </ol>
          </div>

          {waLink ? (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="card-surface flex items-center gap-3 p-6 transition-colors hover:border-gold/40">
              <MessageCircle className="size-5 text-gold" aria-hidden />
              <span className="text-sm text-ivory">Prefer WhatsApp? Start a chat instead.</span>
            </a>
          ) : null}

          <div className="card-surface p-6 text-sm text-muted">
            <h2 className="mb-2 text-base text-ivory">Already submitted?</h2>
            <p>
              Create an account to track your project stages, or check your email for the acknowledgement
              message when notifications are configured.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
