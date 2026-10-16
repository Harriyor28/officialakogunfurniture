import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("catalogue.manage");
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { order: "asc" } } } }),
    prisma.furnitureCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ivory sm:text-3xl">Edit product</h1>
        <p className="mt-2 text-sm text-muted">{product.name}</p>
      </div>
      <div className="card-surface p-6 sm:p-8">
        <ProductForm
          categories={categories}
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            categoryId: product.categoryId,
            summary: product.summary,
            description: product.description,
            dimensions: product.dimensions,
            materials: product.materials,
            colours: product.colours,
            priceFrom: product.priceFrom,
            priceTo: product.priceTo,
            availability: product.availability,
            leadTime: product.leadTime,
            customisable: product.customisable,
            featured: product.featured,
            published: product.published,
            seoTitle: product.seoTitle,
            seoDescription: product.seoDescription,
          }}
          images={product.images.map((image) => ({ url: image.url, alt: image.alt }))}
        />
      </div>
    </div>
  );
}
