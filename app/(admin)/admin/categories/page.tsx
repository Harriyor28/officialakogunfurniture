import { CategoriesForm } from "@/components/admin/CategoriesForm";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requirePermission("content.manage");
  const categories = await prisma.furnitureCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ivory sm:text-3xl">Furniture categories</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Organize published portfolio work and furniture items. Unpublish a category to hide it without deleting it.
        </p>
      </div>
      <div className="card-surface p-6 sm:p-8">
        <CategoriesForm
          key={JSON.stringify(categories)}
          categories={categories.map((category) => ({
            ...category,
            description: category.description ?? "",
            image: category.image ?? "",
          }))}
        />
      </div>
    </div>
  );
}
