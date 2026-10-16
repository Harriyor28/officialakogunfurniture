import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await requirePermission("projects.manage");
  const categories = await prisma.furnitureCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ivory sm:text-3xl">New portfolio project</h1>
        <p className="mt-2 text-sm text-muted">The project stays a private draft until you publish it.</p>
      </div>
      <div className="card-surface p-6 sm:p-8">
        <ProjectForm categories={categories} />
      </div>
    </div>
  );
}
