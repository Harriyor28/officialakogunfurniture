import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { CUSTOMER_PROJECT_STAGES } from "@/lib/constants";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", ...CUSTOMER_PROJECT_STAGES.map((s) => s.value)] as const;

export default async function AdminCustomerProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePermission("customerProjects.manage");
  const { status } = await searchParams;
  const active = (FILTERS as readonly string[]).includes(status ?? "ALL") ? status ?? "ALL" : "ALL";

  const projects = await prisma.customerProject.findMany({
    where: active === "ALL" ? undefined : { status: active },
    orderBy: { updatedAt: "desc" },
    include: {
      customer: { select: { name: true, email: true } },
      quotation: { select: { reference: true } },
      _count: { select: { updates: true, milestones: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-ivory sm:text-3xl">Customer projects</h1>
          <p className="mt-2 text-sm text-muted">Projects customers track in their portal.</p>
        </div>
        <Link href="/admin/customer-projects/new" className="btn btn-primary">
          <Plus className="size-4" aria-hidden />
          New project
        </Link>
      </div>

      <nav aria-label="Filter projects by stage" className="flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <Link
            key={value}
            href={value === "ALL" ? "/admin/customer-projects" : `/admin/customer-projects?status=${value}`}
            className={active === value ? "badge badge-gold" : "badge hover:border-gold/50 hover:text-gold-soft"}
          >
            {value.replaceAll("_", " ")}
          </Link>
        ))}
      </nav>

      {projects.length === 0 ? (
        <div className="card-surface p-10 text-center text-sm text-muted">
          No customer projects yet. Convert an approved{" "}
          <Link href="/admin/quotations" className="text-gold hover:text-gold-soft">quotation</Link> to create one.
        </div>
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => (
            <li key={project.id} className="card-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link href={`/admin/customer-projects/${project.id}`} className="inline-flex items-center gap-2 font-semibold text-ivory hover:text-gold">
                    <FolderKanban className="size-4 text-gold" aria-hidden />
                    {project.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted">
                    {project.reference} · {project.customer.name} ({project.customer.email})
                    {project.quotation ? ` · from ${project.quotation.reference}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Updated {formatDate(project.updatedAt)} · {project._count.updates} update(s) · {project._count.milestones} milestone(s)
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={project.status} map={CUSTOMER_PROJECT_STAGES} />
                  <Badge tone="gold">{project.progressPercent}%</Badge>
                  <Link href={`/admin/customer-projects/${project.id}`} className="btn btn-ghost px-3 py-1.5 text-xs">
                    Open
                  </Link>
                </div>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ivory/10" role="img" aria-label={`${project.progressPercent}% complete`}>
                <div className="h-full rounded-full bg-gold" style={{ width: `${project.progressPercent}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
