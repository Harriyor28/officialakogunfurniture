import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { ENQUIRY_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", "NEW", "UNDER_REVIEW", "QUOTATION_SENT", "APPROVED", "CLOSED"] as const;

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePermission("enquiries.manage");
  const { status } = await searchParams;
  const active = (FILTERS as readonly string[]).includes(status ?? "ALL") ? status ?? "ALL" : "ALL";

  const enquiries = await prisma.enquiry.findMany({
    where: active === "ALL" ? undefined : { status: active },
    orderBy: { createdAt: "desc" },
    include: { assignedTo: { select: { name: true } }, quotations: { select: { id: true, reference: true, status: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ivory sm:text-3xl">Enquiries</h1>
        <p className="mt-2 text-sm text-muted">Quote requests and contact submissions from the website.</p>
      </div>

      <nav aria-label="Filter enquiries" className="flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <Link
            key={value}
            href={value === "ALL" ? "/admin/enquiries" : `/admin/enquiries?status=${value}`}
            className={
              active === value
                ? "badge badge-gold"
                : "badge hover:border-gold/50 hover:text-gold-soft"
            }
          >
            {value.replaceAll("_", " ")}
          </Link>
        ))}
      </nav>

      {enquiries.length === 0 ? (
        <div className="card-surface p-10 text-center text-sm text-muted">No enquiries with this filter.</div>
      ) : (
        <ul className="space-y-3">
          {enquiries.map((enquiry) => (
            <li key={enquiry.id} className="card-surface flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <Link href={`/admin/enquiries/${enquiry.id}`} className="font-semibold text-ivory hover:text-gold">
                  {enquiry.title || enquiry.requirements.slice(0, 70) + (enquiry.requirements.length > 70 ? "…" : "")}
                </Link>
                <p className="mt-1 text-xs text-muted">
                  {enquiry.reference} · {enquiry.name} · {enquiry.email} · {formatDate(enquiry.createdAt)}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {enquiry.serviceCategory}
                  {enquiry.budgetRange ? ` · ${enquiry.budgetRange}` : ""}
                  {enquiry.assignedTo ? ` · assigned to ${enquiry.assignedTo.name}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {enquiry.quotations.map((q) => (
                  <Link key={q.reference} href={`/admin/quotations/${q.id}`} className="badge badge-gold hover:opacity-80">
                    {q.reference}
                  </Link>
                ))}
                <StatusBadge status={enquiry.status} map={ENQUIRY_STATUSES} />
                <Link href={`/admin/enquiries/${enquiry.id}`} className="btn btn-ghost px-4 py-2 text-xs">
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
