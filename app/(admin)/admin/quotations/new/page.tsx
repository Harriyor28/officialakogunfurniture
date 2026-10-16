import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { QuotationForm } from "@/components/admin/QuotationForm";

export const dynamic = "force-dynamic";

export default async function NewQuotationPage({
  searchParams,
}: {
  searchParams: Promise<{ enquiryId?: string }>;
}) {
  await requirePermission("quotations.manage");
  const { enquiryId } = await searchParams;

  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, reference: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ivory sm:text-3xl">New quotation</h1>
        <p className="mt-2 text-sm text-muted">Line item totals are calculated for you. Never enter estimated prices you have not confirmed.</p>
      </div>
      <div className="card-surface p-6 sm:p-8">
        <QuotationForm enquiries={enquiries} defaultEnquiryId={enquiryId} />
      </div>
    </div>
  );
}
