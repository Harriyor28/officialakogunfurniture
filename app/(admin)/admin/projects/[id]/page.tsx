import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("projects.manage");
  const { id } = await params;

  const [project, categories] = await Promise.all([
    prisma.project.findUnique({ where: { id }, include: { images: { orderBy: { order: "asc" } } } }),
    prisma.furnitureCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ivory sm:text-3xl">Edit project</h1>
        <p className="mt-2 text-sm text-muted">{project.title}</p>
      </div>
      <div className="card-surface p-6 sm:p-8">
        <ProjectForm
          categories={categories}
          project={{
            id: project.id,
            title: project.title,
            slug: project.slug,
            categoryId: project.categoryId,
            summary: project.summary,
            description: project.description,
            inspiration: project.inspiration,
            materials: project.materials,
            dimensions: project.dimensions,
            location: project.location,
            completedAt: project.completedAt,
            status: project.status,
            published: project.published,
            featured: project.featured,
            coverImage: project.coverImage,
            seoTitle: project.seoTitle,
            seoDescription: project.seoDescription,
          }}
          images={project.images.map((image) => ({ url: image.url, alt: image.alt }))}
        />
      </div>
    </div>
  );
}
