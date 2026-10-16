import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { PRODUCT_AVAILABILITY } from "@/lib/constants";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteProductAction } from "@/app/actions/admin/products";

export const dynamic = "force-dynamic";

export default async function AdminCataloguePage() {
  await requirePermission("catalogue.manage");
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-ivory sm:text-3xl">Furniture catalogue</h1>
          <p className="mt-2 text-sm text-muted">{products.length} product(s) · prices are only shown when you enter them.</p>
        </div>
        <Link href="/admin/catalogue/new" className="btn btn-primary">
          <Plus className="size-4" aria-hidden />
          New product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card-surface p-10 text-center text-sm text-muted">
          No products yet. <Link href="/admin/catalogue/new" className="text-gold hover:text-gold-soft">Add the first one</Link>.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ivory/10 text-xs uppercase tracking-widest text-muted">
                <th scope="col" className="py-3 pr-4">Name</th>
                <th scope="col" className="py-3 pr-4">Category</th>
                <th scope="col" className="py-3 pr-4">Availability</th>
                <th scope="col" className="py-3 pr-4">Price</th>
                <th scope="col" className="py-3 pr-4">Updated</th>
                <th scope="col" className="py-3 pr-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-ivory/5">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/catalogue/${product.id}`} className="font-semibold text-ivory hover:text-gold">
                      {product.name}
                    </Link>
                    <p className="text-xs text-muted">/{product.slug}</p>
                  </td>
                  <td className="py-3 pr-4 text-muted">{product.category?.name ?? "—"}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={product.availability} map={PRODUCT_AVAILABILITY} />
                      {product.published ? <Badge tone="success">Live</Badge> : <Badge>Draft</Badge>}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted">
                    {product.priceFrom !== null
                      ? `${formatMoney(product.priceFrom)}${product.priceTo !== null ? ` – ${formatMoney(product.priceTo)}` : "+"}`
                      : "On request"}
                  </td>
                  <td className="py-3 pr-4 text-muted">{formatDate(product.updatedAt)}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/catalogue/${product.id}`} className="btn btn-ghost px-3 py-1.5 text-xs">
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteProductAction}
                        formData={{ id: product.id }}
                        label="Delete"
                        confirmText={`Delete "${product.name}"? This cannot be undone.`}
                      />
                    </div>
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
