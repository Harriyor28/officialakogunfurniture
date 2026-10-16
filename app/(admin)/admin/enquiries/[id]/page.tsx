import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Paperclip, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { ENQUIRY_STATUSES, QUOTATION_STATUSES, CONTACT_METHODS } from "@/lib/constants";
import { EnquiryStatusForm, EnquiryEmailForm } from "@/components/admin/EnquiryForms";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="border-b border-ivory/5 py-3 sm:grid sm:grid-cols-[200px_1fr] sm:gap-4">
      <dt className="text-xs uppercase tracking-widest text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-ivory sm:mt-0">{value}</dd>
    </div>
  );
}

export default async function AdminEnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("enquiries.manage");
  const { id } = await params;

  const [enquiry, staff] = await Promise.all([
    prisma.enquiry.findUnique({
      where: { id },
      include: {
        attachments: true,
        assignedTo: { select: { name: true } },
        quotations: { orderBy: { createdAt: "desc" } },
        projects: { select: { reference: true, title: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "STAFF"] }, active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!enquiry) notFound();

  const contactLabel = CONTACT_METHODS.find((m) => m.value === enquiry.preferredContact)?.label ?? enquiry.preferredContact;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold">{enquiry.reference}</p>
          <h1 className="mt-1 text-2xl text-ivory sm:text-3xl">{enquiry.title || enquiry.serviceCategory}</h1>
          <p className="mt-2 text-sm text-muted">
            {enquiry.name} · received {formatDate(enquiry.createdAt, { dateStyle: "full" })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={enquiry.status} map={ENQUIRY_STATUSES} />
          <Link href="/admin/enquiries" className="btn btn-ghost px-4 py-2 text-xs">
            Back to enquiries
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="card-surface p-6 sm:p-8" aria-labelledby="details-heading">
          <h2 id="details-heading" className="text-lg text-ivory">Enquiry details</h2>
          <dl className="mt-4">
            <Row label="Email" value={enquiry.email} />
            <Row label="Phone" value={enquiry.phone} />
            <Row label="Preferred contact" value={contactLabel} />
            <Row label="Service" value={enquiry.serviceCategory} />
            <Row label="Furniture type" value={enquiry.furnitureType} />
            <Row label="Requirements" value={enquiry.requirements} />
            <Row label="Dimensions" value={enquiry.dimensions} />
            <Row label="Materials" value={enquiry.materials} />
            <Row label="Quantity" value={enquiry.quantity} />
            <Row label="Budget range" value={enquiry.budgetRange} />
            <Row label="Location" value={enquiry.location} />
            <Row label="Preferred date" value={enquiry.preferredDate ? formatDate(enquiry.preferredDate) : null} />
            <Row label="Comments" value={enquiry.comments} />
            <Row label="Source" value={enquiry.source} />
            <Row label="Assigned to" value={enquiry.assignedTo?.name} />
          </dl>

          {enquiry.attachments.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm text-ivory">Attachments</h3>
              <ul className="mt-3 space-y-2">
                {enquiry.attachments.map((file) => (
                  <li key={file.id}>
                    <a
                      href={file.url}
                      className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-soft"
                      download
                    >
                      <Paperclip className="size-4" aria-hidden />
                      {file.filename} ({Math.max(1, Math.round(file.size / 1024))} KB)
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <div className="space-y-8">
          <section className="card-surface p-6" aria-labelledby="update-heading">
            <h2 id="update-heading" className="text-lg text-ivory">Update enquiry</h2>
            <div className="mt-4">
              <EnquiryStatusForm
                enquiry={{
                  id: enquiry.id,
                  status: enquiry.status,
                  internalNotes: enquiry.internalNotes,
                  assignedToId: enquiry.assignedToId,
                }}
                staff={staff}
              />
            </div>
          </section>

          <section className="card-surface p-6" aria-labelledby="email-heading">
            <h2 id="email-heading" className="text-lg text-ivory">Reply by email</h2>
            <div className="mt-4">
              <EnquiryEmailForm enquiryId={enquiry.id} />
            </div>
          </section>
        </div>
      </div>

      <section className="card-surface p-6 sm:p-8" aria-labelledby="quotes-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="quotes-heading" className="text-lg text-ivory">Quotations</h2>
          <Link href={`/admin/quotations/new?enquiryId=${enquiry.id}`} className="btn btn-primary px-4 py-2 text-xs">
            <Plus className="size-4" aria-hidden />
            Prepare quotation
          </Link>
        </div>
        {enquiry.quotations.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No quotations yet for this enquiry.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {enquiry.quotations.map((quote) => (
              <li key={quote.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ivory/10 p-4">
                <Link href={`/admin/quotations/${quote.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-ivory hover:text-gold">
                  <FileText className="size-4 text-gold" aria-hidden />
                  {quote.reference}
                </Link>
                <StatusBadge status={quote.status} map={QUOTATION_STATUSES} />
              </li>
            ))}
          </ul>
        )}
        {enquiry.projects.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-sm text-ivory">Converted projects</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {enquiry.projects.map((project) => (
                <Link key={project.reference} href={`/admin/customer-projects`} className="badge badge-gold hover:opacity-80">
                  {project.reference} · {project.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
