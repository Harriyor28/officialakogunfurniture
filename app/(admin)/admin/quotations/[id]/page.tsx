import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { QUOTATION_STATUSES } from "@/lib/constants";
import { QuotationForm } from "@/components/admin/QuotationForm";
import { QuotationActions, ConvertQuotationForm } from "@/components/admin/QuotationActions";

export const dynamic = "force-dynamic";

export default async function AdminQuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("quotations.manage");
  const { id } = await params;

  const [quotation, enquiries] = await Promise.all([
    prisma.quotation.findUnique({
      where: { id },
      include: {
        enquiry: true,
        items: { orderBy: { order: "asc" } },
        project: { select: { reference: true, id: true } },
      },
    }),
    prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, reference: true, name: true },
    }),
  ]);
  if (!quotation) notFound();

  const total = quotation.subtotal - quotation.discount + quotation.delivery;
  const isConverted = Boolean(quotation.project);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/quotations" className="inline-flex items-center gap-1 text-xs text-muted hover:text-gold">
            <ArrowLeft className="size-3.5" aria-hidden />
            All quotations
          </Link>
          <h1 className="mt-2 text-2xl text-ivory sm:text-3xl">{quotation.reference}</h1>
          <p className="mt-2 text-sm text-muted">
            <Link href={`/admin/enquiries/${quotation.enquiry.id}`} className="text-gold hover:text-gold-soft">
              {quotation.enquiry.reference}
            </Link>{" "}
            · {quotation.enquiry.name} · created {formatDate(quotation.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={quotation.status} map={QUOTATION_STATUSES} />
          <a href={`/api/quotations/${quotation.reference}/pdf`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost px-4 py-2 text-xs">
            <Download className="size-4" aria-hidden />
            PDF
          </a>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <section className="card-surface p-6 sm:p-8" aria-labelledby="edit-heading">
          <h2 id="edit-heading" className="text-lg text-ivory">Quotation details</h2>
          <div className="mt-5">
            <QuotationForm
              quotation={{
                id: quotation.id,
                enquiryId: quotation.enquiryId,
                status: quotation.status,
                validUntil: quotation.validUntil,
                discount: quotation.discount,
                delivery: quotation.delivery,
                notes: quotation.notes,
                terms: quotation.terms,
              }}
              items={quotation.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              }))}
              enquiries={enquiries}
            />
          </div>
        </section>

        <div className="space-y-8">
          <section className="card-surface p-6" aria-labelledby="totals-heading">
            <h2 id="totals-heading" className="text-lg text-ivory">Totals</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <dt>Subtotal</dt>
                <dd>{formatMoney(quotation.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Discount</dt>
                <dd>−{formatMoney(quotation.discount)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Delivery</dt>
                <dd>{formatMoney(quotation.delivery)}</dd>
              </div>
              <div className="flex justify-between border-t border-gold/30 pt-2 font-semibold text-gold">
                <dt>Total</dt>
                <dd>{formatMoney(total)}</dd>
              </div>
            </dl>
            {quotation.validUntil ? (
              <p className="mt-4 text-xs text-muted">Valid until {formatDate(quotation.validUntil)}</p>
            ) : null}
          </section>

          <section className="card-surface p-6" aria-labelledby="actions-heading">
            <h2 id="actions-heading" className="text-lg text-ivory">Actions</h2>
            <div className="mt-4">
              <QuotationActions quotationId={quotation.id} status={quotation.status} />
            </div>
          </section>

          <section className="card-surface p-6" aria-labelledby="convert-heading">
            <h2 id="convert-heading" className="text-lg text-ivory">Convert to project</h2>
            <div className="mt-4">
              {isConverted ? (
                <div className="space-y-3">
                  <Badge tone="success">Converted</Badge>
                  <Link
                    href={`/admin/customer-projects/${quotation.project!.id}`}
                    className="block text-sm text-gold hover:text-gold-soft"
                  >
                    Open {quotation.project!.reference}
                  </Link>
                </div>
              ) : quotation.status === "APPROVED" ? (
                <ConvertQuotationForm
                  quotationId={quotation.id}
                  defaultTitle={`${quotation.enquiry.title || quotation.enquiry.serviceCategory} — ${quotation.enquiry.name}`}
                />
              ) : (
                <p className="text-sm text-muted">
                  Mark the quotation as approved first, then convert it into a tracked customer project.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
