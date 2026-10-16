import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/Cards";
import { Reveal } from "@/components/ui/Reveal";
import { whatsappLink } from "@/lib/format";
import { getBusinessSettings } from "@/lib/settings";
import { MessageCircle } from "lucide-react";
import { PRODUCT_AVAILABILITY } from "@/lib/constants";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Furniture Catalogue",
  description:
    "Browse furniture designs available from Official Akogun Furniture — wardrobes, bedroom sets, office pieces and custom options.",
};

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params.category ?? "";
  const q = (params.q ?? "").trim();
  const sort = params.sort === "name" ? "name" : "newest";
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const category = categorySlug
    ? await prisma.furnitureCategory.findUnique({ where: { slug: categorySlug } })
    : null;

  const where = {
    published: true,
    ...(category ? { categoryId: category.id } : {}),
    ...(q ? { title: { contains: q } } : {}),
  };

  const [total, products, categories, settings] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: sort === "name" ? [{ name: "asc" }] : [{ featured: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: true, images: { orderBy: { order: "asc" } } },
    }),
    prisma.furnitureCategory.findMany({
      where: { published: true, products: { some: { published: true } } },
      orderBy: { order: "asc" },
    }),
    getBusinessSettings(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const waLink = whatsappLink(
    settings.whatsapp,
    "Hello Official Akogun Furniture, I would like to ask about an item in your catalogue.",
  );

  function pageHref(nextPage: number): string {
    const query = new URLSearchParams();
    if (categorySlug) query.set("category", categorySlug);
    if (q) query.set("q", q);
    if (sort !== "newest") query.set("sort", sort);
    if (nextPage > 1) query.set("page", String(nextPage));
    const str = query.toString();
    return str ? `/furniture?${str}` : "/furniture";
  }

  return (
    <div className="container-site pb-24 pt-32">
      <div className="max-w-2xl">
        <p className="eyebrow mb-3">Furniture catalogue</p>
        <h1 className="text-3xl text-ivory sm:text-5xl">Designs made to order</h1>
        <p className="mt-5 text-muted">
          Each piece can be customised to your measurements and finish. Prices are shown only where
          genuinely listed — otherwise, request a quote for current pricing.
        </p>
        <div className="gold-rule mt-6 w-40" />
      </div>

      <form className="mt-10 flex flex-wrap items-end gap-4" method="get">
        <div className="min-w-56 flex-1">
          <label htmlFor="catalogue-search" className="label">Search products</label>
          <input id="catalogue-search" type="search" name="q" defaultValue={q} className="input" placeholder="Search by name…" />
        </div>
        <div className="min-w-48">
          <label htmlFor="catalogue-category" className="label">Category</label>
          <select id="catalogue-category" name="category" defaultValue={categorySlug} className="input">
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>{item.name}</option>
            ))}
          </select>
        </div>
        <div className="min-w-40">
          <label htmlFor="catalogue-sort" className="label">Sort</label>
          <select id="catalogue-sort" name="sort" defaultValue={sort} className="input">
            <option value="newest">Featured first</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
        <button type="submit" className="btn btn-secondary">Apply</button>
      </form>

      {products.length === 0 ? (
        <div className="card-surface mt-12 p-10 text-center">
          <p className="text-muted">No catalogue items match this filter yet.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/furniture" className="btn btn-ghost">Clear filters</Link>
            <Link href="/quote" className="btn btn-secondary">Request a custom piece</Link>
          </div>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={index * 30}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Catalogue pages">
          {page > 1 ? <Link href={pageHref(page - 1)} className="btn btn-ghost">← Previous</Link> : null}
          <span className="text-sm text-muted">Page {page} of {totalPages}</span>
          {page < totalPages ? <Link href={pageHref(page + 1)} className="btn btn-ghost">Next →</Link> : null}
        </nav>
      ) : null}

      <section className="card-surface mt-16 flex flex-wrap items-center justify-between gap-6 p-8">
        <div>
          <h2 className="text-xl text-ivory">Cannot find what you need?</h2>
          <p className="mt-2 text-sm text-muted">
            Every piece we build is customisable. Availability shown here:{" "}
            {PRODUCT_AVAILABILITY.map((a) => a.label).join(", ")}.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/quote" className="btn btn-primary">Request Customisation</Link>
          {waLink ? (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <MessageCircle className="size-4" aria-hidden />
              Enquire on WhatsApp
            </a>
          ) : null}
        </div>
      </section>
    </div>
  );
}
