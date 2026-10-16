import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Download } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/Badge";
import { QUOTATION_STATUSES } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";
import { ApproveQuotationForm } from "./ApproveForm";
import { getBusinessSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quotation" };

export default async function PortalQuotationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/portal/quotations/${(await params).reference}`);

  const { reference } = await params;
  const quotation = await prisma.quotation.findUnique({
    where: { reference },
    include: {
      items: { orderBy: { order: "asc" } },
      enquiry: { select: { reference: true, title: true, serviceCategory: true, email: true, name: true } },
      project: { select: { reference: true, title: true } },
    },
  });

  if (!quotation || quotation.enquiry.email.toLowerCase() !== user.email.toLowerCase()) notFound();

  const settings = await getBusinessSettings();
  const total = quotation.subtotal - quotation.discount + quotation.delivery;
  const canApprove = quotation.status === "DRAFT" || quotation.status === "SENT";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/portal" className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold">
        <ArrowLeft className="size-4" aria-hidden />
        Back to dashboard
      </Link>

      <div className="mt-6 card-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">{quotation.reference}</p>
            <h1 className="mt-1 text-2xl text-ivory">
              {quotation.enquiry.title || quotation.enquiry.serviceCategory}
            </h1>
            <p className="mt-1 text-sm text-muted">Enquiry {quotation.enquiry.reference}</p>
          </div>
          <StatusBadge status={quotation.status} map={QUOTATION_STATUSES} />
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-ivory/10 text-left text-xs uppercase tracking-widest text-muted">
              <th className="py-2">Item</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items.map((item) => (
              <tr key={item.id} className="border-b border-ivory/5">
                <td className="py-3 text-ivory/85">{item.description}</td>
                <td className="py-3 text-right text-muted">{item.quantity}</td>
                <td className="py-3 text-right text-muted">{formatMoney(item.unitPrice)}</td>
                <td className="py-3 text-right text-ivory/85">{formatMoney(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-6 ml-auto w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatMoney(quotation.subtotal)}</dd></div>
          {quotation.discount > 0 ? (
            <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd>−{formatMoney(quotation.discount)}</dd></div>
          ) : null}
          {quotation.delivery > 0 ? (
            <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{formatMoney(quotation.delivery)}</dd></div>
          ) : null}
          <div className="flex justify-between border-t border-ivory/10 pt-2 text-base text-ivory">
            <dt>Total</dt>
            <dd className="text-gold">{formatMoney(total)}</dd>
          </div>
        </dl>

        {quotation.validUntil ? (
          <p className="mt-6 text-xs text-muted">Valid until {formatDate(quotation.validUntil)}.</p>
        ) : null}
        {quotation.notes ? (
          <div className="mt-4">
            <h2 className="text-xs uppercase tracking-widest text-muted">Notes</h2>
            <p className="mt-1 whitespace-pre-line text-sm text-ivory/80">{quotation.notes}</p>
          </div>
        ) : null}
        {quotation.terms ? (
          <div className="mt-4">
            <h2 className="text-xs uppercase tracking-widest text-muted">Terms</h2>
            <p className="mt-1 whitespace-pre-line text-sm text-ivory/80">{quotation.terms}</p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          {canApprove ? (
            <ApproveQuotationForm quotationId={quotation.id} />
          ) : quotation.status === "APPROVED" || quotation.status === "CONVERTED" ? (
            <p className="inline-flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="size-4" aria-hidden />
              Accepted. Our team will confirm next steps.
            </p>
          ) : (
            <p className="text-sm text-muted">This quotation is no longer available for acceptance.</p>
          )}
          {quotation.project ? (
            <Link href={`/portal/projects/${quotation.project.reference}`} className="btn btn-secondary">
              View project {quotation.project.reference}
            </Link>
          ) : null}
          <a
            href={`/api/quotations/${quotation.reference}/pdf`}
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="size-4" aria-hidden />
            Download PDF
          </a>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted">
        Quotations are issued by {settings.businessName}. Prices include only the items listed above.
      </p>
    </div>
  );
}
