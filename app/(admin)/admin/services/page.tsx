import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ServicesForm } from "@/components/admin/ServicesForm";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  await requirePermission("content.manage");
  const services = await prisma.service.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ivory sm:text-3xl">Website services</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Add or update the services shown on the public website. Unpublish an item to hide it without deleting it.
        </p>
      </div>
      <div className="card-surface p-6 sm:p-8">
        <ServicesForm key={JSON.stringify(services)} services={services} />
      </div>
    </div>
  );
}
