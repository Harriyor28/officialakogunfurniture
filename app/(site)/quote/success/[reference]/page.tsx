import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBusinessSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Enquiry received" };

export default async function QuoteSuccessPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const enquiry = await prisma.enquiry.findUnique({ where: { reference } });
  if (!enquiry) notFound();

  const settings = await getBusinessSettings();
  const waLink = whatsappLink(
    settings.whatsapp,
    `Hello Official Akogun Furniture, I have just submitted an enquiry (reference ${enquiry.reference}).`,
  );

  return (
    <div className="container-site flex min-h-[70vh] items-center pb-24 pt-32">
      <div className="card-surface mx-auto w-full max-w-2xl p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
        <h1 className="mt-6 text-3xl text-ivory">Enquiry received</h1>
        <p className="mt-4 text-muted">
          Thank you, {enquiry.name}. Your request has been recorded and our team will review it shortly.
        </p>

        <div className="mt-8 rounded-xl border border-gold/30 bg-gold/5 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Your reference number</p>
          <p className="mt-2 font-display text-3xl text-gold">{enquiry.reference}</p>
          <p className="mt-2 text-xs text-muted">Keep this number — quote it in any follow-up conversation.</p>
        </div>

        <p className="mt-6 text-sm text-muted">
          Preferred contact method: <span className="text-ivory">{enquiry.preferredContact.toLowerCase()}</span>
          {" · "}Service: <span className="text-ivory">{enquiry.serviceCategory}</span>
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/portal" variant="secondary">
            Create account to track progress
          </ButtonLink>
          <ButtonLink href="/portfolio">Browse portfolio</ButtonLink>
          {waLink ? (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <MessageCircle className="size-4" aria-hidden />
              Follow up on WhatsApp
            </a>
          ) : null}
        </div>

        <p className="mt-8 text-xs text-muted">
          <Link href="/" className="hover:text-gold">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
