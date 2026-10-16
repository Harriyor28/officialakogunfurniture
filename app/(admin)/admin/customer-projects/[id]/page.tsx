import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { CUSTOMER_PROJECT_STAGES, stageLabel } from "@/lib/constants";
import { CustomerProjectForm } from "@/components/admin/CustomerProjectForm";
import { ProjectUpdateForm, MilestoneForm } from "@/components/admin/ProjectUpdateForms";
import { updateMilestoneAction, setUpdateVisibilityAction } from "@/app/actions/admin/customer-projects";

export const dynamic = "force-dynamic";

export default async function AdminCustomerProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("customerProjects.manage");
  const { id } = await params;

  const [project, categories] = await Promise.all([
    prisma.customerProject.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, email: true } },
        quotation: { select: { reference: true, id: true } },
        category: { select: { name: true } },
        milestones: { orderBy: { order: "asc" } },
        updates: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.furnitureCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/customer-projects" className="inline-flex items-center gap-1 text-xs text-muted hover:text-gold">
            <ArrowLeft className="size-3.5" aria-hidden />
            All projects
          </Link>
          <h1 className="mt-2 text-2xl text-ivory sm:text-3xl">{project.title}</h1>
          <p className="mt-2 text-sm text-muted">
            {project.reference} · {project.customer.name} ({project.customer.email})
            {project.quotation ? (
              <>
                {" · "}
                <Link href={`/admin/quotations/${project.quotation.id}`} className="text-gold hover:text-gold-soft">
                  {project.quotation.reference}
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={project.status} map={CUSTOMER_PROJECT_STAGES} />
          <Badge tone="gold">{project.progressPercent}%</Badge>
        </div>
      </div>

      <section aria-label="Progress" className="card-surface p-5">
        <div className="h-2 overflow-hidden rounded-full bg-ivory/10" role="img" aria-label={`${project.progressPercent}% complete`}>
          <div className="h-full rounded-full bg-gold" style={{ width: `${project.progressPercent}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">
          Stage: {stageLabel(project.status)}
          {project.nextMilestone ? ` · next: ${project.nextMilestone}` : ""}
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="card-surface p-6 sm:p-8" aria-labelledby="details-heading">
          <h2 id="details-heading" className="text-lg text-ivory">Project details</h2>
          <div className="mt-5">
            <CustomerProjectForm
              categories={categories}
              project={{
                id: project.id,
                title: project.title,
                customerEmail: project.customer.email,
                categoryId: project.categoryId,
                status: project.status,
                summary: project.summary,
                specifications: project.specifications,
                startDate: project.startDate,
                expectedEndDate: project.expectedEndDate,
                progressPercent: project.progressPercent,
                nextMilestone: project.nextMilestone,
                internalNotes: project.internalNotes,
              }}
            />
          </div>
        </section>

        <div className="space-y-8">
          <section className="card-surface p-6" aria-labelledby="updates-heading">
            <h2 id="updates-heading" className="text-lg text-ivory">Progress updates</h2>
            <div className="mt-5">
              <ProjectUpdateForm projectId={project.id} />
            </div>
            <ul className="mt-6 space-y-3">
              {project.updates.length === 0 ? (
                <li className="text-sm text-muted">No updates yet.</li>
              ) : null}
              {project.updates.map((update) => (
                <li key={update.id} className="rounded-lg border border-ivory/10 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-ivory">{update.title}</p>
                      <p className="mt-1 text-xs text-muted">
                        {formatDate(update.createdAt, { dateStyle: "medium" })}
                        {update.stage ? ` · ${stageLabel(update.stage)}` : ""}
                      </p>
                    </div>
                    <form action={setUpdateVisibilityAction}>
                      <input type="hidden" name="id" value={update.id} />
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="visible" value={String(!update.visibleToCustomer)} />
                      <button
                        type="submit"
                        className={update.visibleToCustomer ? "badge badge-success" : "badge"}
                        title={update.visibleToCustomer ? "Visible to customer — click to hide" : "Hidden — click to show"}
                      >
                        {update.visibleToCustomer ? <Eye className="size-3" aria-hidden /> : <EyeOff className="size-3" aria-hidden />}
                        {update.visibleToCustomer ? "Visible" : "Hidden"}
                      </button>
                    </form>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-ivory/80">{update.description}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="card-surface p-6" aria-labelledby="milestones-heading">
            <h2 id="milestones-heading" className="text-lg text-ivory">Milestones</h2>
            <div className="mt-5">
              <MilestoneForm projectId={project.id} />
            </div>
            <ul className="mt-6 space-y-3">
              {project.milestones.length === 0 ? (
                <li className="text-sm text-muted">No milestones yet.</li>
              ) : null}
              {project.milestones.map((milestone) => (
                <li key={milestone.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ivory/10 p-4">
                  <div>
                    <p className="text-sm text-ivory">{milestone.name}</p>
                    <p className="text-xs text-muted">
                      {milestone.dueDate ? `Due ${formatDate(milestone.dueDate)}` : "No due date"}
                      {milestone.visible ? "" : " · hidden from customer"}
                    </p>
                  </div>
                  <form action={updateMilestoneAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={milestone.id} />
                    <input type="hidden" name="projectId" value={project.id} />
                    <label className="sr-only" htmlFor={`ms-status-${milestone.id}`}>
                      Milestone status
                    </label>
                    <select
                      id={`ms-status-${milestone.id}`}
                      name="status"
                      defaultValue={milestone.status}
                      className="input px-2 py-1 text-xs"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="DONE">Done</option>
                    </select>
                    <button type="submit" className="btn btn-ghost px-3 py-1.5 text-xs">
                      Update
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
