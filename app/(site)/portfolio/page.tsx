import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProjectCard } from "@/components/site/Cards";
import { PortfolioFilters } from "./Filters";
import { Reveal } from "@/components/ui/Reveal";
import { PROJECT_STATUSES } from "@/lib/constants";
import { ButtonLink } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/format";
import { getBusinessSettings } from "@/lib/settings";
import { MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Our Portfolio",
  description:
    "Explore completed and ongoing furniture projects — wardrobes, kitchen cabinets, office furniture, interior woodwork and more.",
};

type Search = { category?: string; status?: string; q?: string; sort?: string; page?: string };

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const categorySlug = params.category ?? "";
  const status = params.status ?? "";
  const q = (params.q ?? "").trim();
  const sort = params.sort === "featured" ? "featured" : "newest";
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const category = categorySlug
    ? await prisma.furnitureCategory.findUnique({ where: { slug: categorySlug } })
    : null;

  const where = {
    published: true,
    status: status ? status : { not: "ARCHIVED" },
    ...(category ? { categoryId: category.id } : {}),
    ...(q ? { title: { contains: q } } : {}),
  };

  const [total, projects, categories, settings] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      orderBy: sort === "featured" ? [{ featured: "desc" }, { updatedAt: "desc" }] : [{ updatedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: true, images: { orderBy: { order: "asc" } } },
    }),
    prisma.furnitureCategory.findMany({
      where: { published: true, projects: { some: { published: true } } },
      orderBy: { order: "asc" },
    }),
    getBusinessSettings(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const waLink = whatsappLink(
    settings.whatsapp,
    "Hello Official Akogun Furniture, I saw a project in your portfolio and would like something similar.",
  );

  function pageHref(nextPage: number): string {
    const query = new URLSearchParams();
    if (categorySlug) query.set("category", categorySlug);
    if (status) query.set("status", status);
    if (q) query.set("q", q);
    if (sort !== "newest") query.set("sort", sort);
    if (nextPage > 1) query.set("page", String(nextPage));
    const toString = query.toString();
    return toString ? `/portfolio?${toString}` : "/portfolio";
  }

  return (
    <div className="container-site pb-24 pt-32">
      <div className="max-w-2xl">
        <p className="eyebrow mb-3">Our portfolio</p>
        <h1 className="text-3xl text-ivory sm:text-5xl">
          {category ? category.name : "Projects we have crafted"}
        </h1>
        <p className="mt-5 text-muted">
          {category?.description ??
            "A database-driven gallery of published work. Filter by category and status, or search by project name."}
        </p>
        <div className="gold-rule mt-6 w-40" />
      </div>

      <div className="mt-10">
        <PortfolioFilters
          categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
          statuses={PROJECT_STATUSES.filter((s) => s.value !== "ARCHIVED").map((s) => ({ value: s.value, label: s.label }))}
        />
      </div>

      {projects.length === 0 ? (
        <div className="card-surface mt-12 p-10 text-center">
          <p className="text-muted">No published projects match these filters yet.</p>
          <div className="mt-6 flex justify-center gap-3">
            <ButtonLink href="/portfolio" variant="secondary">Clear filters</ButtonLink>
            {waLink ? (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <MessageCircle className="size-4" aria-hidden />
                Ask about similar work
              </a>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <Reveal key={project.id} delay={index * 40}>
              <ProjectCard project={project} priority={index < 3} />
            </Reveal>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Portfolio pages">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="btn btn-ghost" rel="prev">← Previous</Link>
          ) : null}
          <span className="text-sm text-muted">Page {page} of {totalPages}</span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className="btn btn-ghost" rel="next">Next →</Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
