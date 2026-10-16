import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { CustomerProjectForm } from "@/components/admin/CustomerProjectForm";

export const dynamic = "force-dynamic";

export default async function NewCustomerProjectPage() {
  await requirePermission("customerProjects.manage");
  const categories = await prisma.furnitureCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ivory sm:text-3xl">New customer project</h1>
        <p className="mt-2 text-sm text-muted">
          The customer needs an account first (they can register at /register). Approved quotations are converted
          automatically from the quotation page.
        </p>
      </div>
      <div className="card-surface p-6 sm:p-8">
        <CustomerProjectForm categories={categories} />
      </div>
    </div>
  );
}
