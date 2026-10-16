import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requirePermission("catalogue.manage");
  const categories = await prisma.furnitureCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ivory sm:text-3xl">New catalogue product</h1>
        <p className="mt-2 text-sm text-muted">Never enter a price you are not sure about — leave it blank for &quot;price on request&quot;.</p>
      </div>
      <div className="card-surface p-6 sm:p-8">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
