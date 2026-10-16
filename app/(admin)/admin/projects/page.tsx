import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { PROJECT_STATUSES } from "@/lib/constants";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteProjectAction } from "@/app/actions/admin/projects";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  await requirePermission("projects.manage");
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true, _count: { select: { images: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-ivory sm:text-3xl">Portfolio projects</h1>
          <p className="mt-2 text-sm text-muted">{projects.length} project(s) · drafts are hidden from the public site.</p>
        </div>
        <Link href="/admin/projects/new" className="btn btn-primary">
          <Plus className="size-4" aria-hidden />
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="card-surface p-10 text-center text-sm text-muted">
          No projects yet. <Link href="/admin/projects/new" className="text-gold hover:text-gold-soft">Create the first one</Link>.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ivory/10 text-xs uppercase tracking-widest text-muted">
                <th scope="col" className="py-3 pr-4">Title</th>
                <th scope="col" className="py-3 pr-4">Category</th>
                <th scope="col" className="py-3 pr-4">Status</th>
                <th scope="col" className="py-3 pr-4">Images</th>
                <th scope="col" className="py-3 pr-4">Updated</th>
                <th scope="col" className="py-3 pr-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-ivory/5 align-middle">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/projects/${project.id}`} className="font-semibold text-ivory hover:text-gold">
                      {project.title}
                    </Link>
                    <p className="text-xs text-muted">/{project.slug}</p>
                  </td>
                  <td className="py-3 pr-4 text-muted">{project.category?.name ?? "—"}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={project.status} map={PROJECT_STATUSES} />
                      {project.published ? <Badge tone="success">Live</Badge> : <Badge>Draft</Badge>}
                      {project.featured ? <Badge tone="gold">Featured</Badge> : null}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted">{project._count.images}</td>
                  <td className="py-3 pr-4 text-muted">{formatDate(project.updatedAt)}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/projects/${project.id}`} className="btn btn-ghost px-3 py-1.5 text-xs">
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteProjectAction}
                        formData={{ id: project.id }}
                        label="Delete"
                        confirmText={`Delete "${project.title}"? This cannot be undone.`}
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
