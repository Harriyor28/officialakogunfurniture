import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { QUOTATION_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", ...QUOTATION_STATUSES.map((s) => s.value)] as const;

export default async function AdminQuotationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requirePermission("quotations.manage");
  const { status } = await searchParams;
  const active = (FILTERS as readonly string[]).includes(status ?? "ALL") ? status ?? "ALL" : "ALL";

  const quotations = await prisma.quotation.findMany({
    where: active === "ALL" ? undefined : { status: active },
    orderBy: { updatedAt: "desc" },
    include: { enquiry: { select: { reference: true, name: true, email: true } }, project: { select: { reference: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-ivory sm:text-3xl">Quotations</h1>
          <p className="mt-2 text-sm text-muted">Draft, send, track approvals and convert quotations into projects.</p>
        </div>
        <Link href="/admin/quotations/new" className="btn btn-primary">
          <Plus className="size-4" aria-hidden />
          New quotation
        </Link>
      </div>

      <nav aria-label="Filter quotations" className="flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <Link
            key={value}
            href={value === "ALL" ? "/admin/quotations" : `/admin/quotations?status=${value}`}
            className={active === value ? "badge badge-gold" : "badge hover:border-gold/50 hover:text-gold-soft"}
          >
            {value.replaceAll("_", " ")}
          </Link>
        ))}
      </nav>

      {quotations.length === 0 ? (
        <div className="card-surface p-10 text-center text-sm text-muted">No quotations with this filter.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ivory/10 text-xs uppercase tracking-widest text-muted">
                <th scope="col" className="py-3 pr-4">Reference</th>
                <th scope="col" className="py-3 pr-4">Customer</th>
                <th scope="col" className="py-3 pr-4">Status</th>
                <th scope="col" className="py-3 pr-4">Total</th>
                <th scope="col" className="py-3 pr-4">Updated</th>
                <th scope="col" className="py-3 pr-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((quote) => (
                <tr key={quote.id} className="border-b border-ivory/5">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/quotations/${quote.id}`} className="inline-flex items-center gap-2 font-semibold text-ivory hover:text-gold">
                      <FileText className="size-4 text-gold" aria-hidden />
                      {quote.reference}
                    </Link>
                    {quote.project ? <p className="text-xs text-muted">→ {quote.project.reference}</p> : null}
                  </td>
                  <td className="py-3 pr-4 text-muted">
                    {quote.enquiry.name}
                    <p className="text-xs">{quote.enquiry.email}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={quote.status} map={QUOTATION_STATUSES} />
                  </td>
                  <td className="py-3 pr-4 text-muted">
                    {formatMoney(quote.subtotal - quote.discount + quote.delivery)}
                  </td>
                  <td className="py-3 pr-4 text-muted">{formatDate(quote.updatedAt)}</td>
                  <td className="py-3 pr-4 text-right">
                    <Link href={`/admin/quotations/${quote.id}`} className="btn btn-ghost px-3 py-1.5 text-xs">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
