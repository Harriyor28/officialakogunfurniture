import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { stageLabel, stagePercent } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Project progress" };

export default async function PortalProjectPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/portal/projects/${(await params).reference}`);

  const { reference } = await params;
  const project = await prisma.customerProject.findUnique({
    where: { reference },
    include: {
      category: true,
      milestones: { orderBy: { order: "asc" } },
      updates: { orderBy: { createdAt: "desc" } },
    },
  });

  // Ownership enforcement at the data-access layer.
  if (!project || project.customerUserId !== user.id) notFound();

  const visibleMilestones = project.milestones.filter((m) => m.visible);
  const visibleUpdates = project.updates.filter((u) => u.visibleToCustomer);
  const percent = Math.max(project.progressPercent, stagePercent(project.status));

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <Link href="/portal" className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold">
          <ArrowLeft className="size-4" aria-hidden />
          Back to dashboard
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">{project.reference}</p>
            <h1 className="mt-1 text-3xl text-ivory">{project.title}</h1>
            {project.category ? <p className="mt-1 text-sm text-muted">{project.category.name}</p> : null}
          </div>
          <Badge tone="gold">{stageLabel(project.status)}</Badge>
        </div>
      </div>

      <section className="card-surface p-6" aria-labelledby="progress-heading">
        <h2 id="progress-heading" className="text-lg text-ivory">Progress</h2>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-ivory/10" aria-hidden>
          <div className="h-full rounded-full bg-gradient-to-r from-wood to-gold" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-sm text-muted">{percent}% — based on configured project stages.</p>

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted">Project start</dt>
            <dd className="mt-1 text-ivory/85">{formatDate(project.startDate) || "To be confirmed"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted">Expected completion</dt>
            <dd className="mt-1 text-ivory/85">{formatDate(project.expectedEndDate) || "To be confirmed"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted">Next milestone</dt>
            <dd className="mt-1 text-ivory/85">{project.nextMilestone || stageLabel(project.status)}</dd>
          </div>
        </dl>

        {project.summary ? <p className="mt-6 text-sm leading-relaxed text-ivory/80">{project.summary}</p> : null}
        {project.specifications ? (
          <div className="mt-4">
            <h3 className="text-xs uppercase tracking-widest text-muted">Agreed specifications</h3>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ivory/80">{project.specifications}</p>
          </div>
        ) : null}
      </section>

      {visibleMilestones.length > 0 ? (
        <section aria-labelledby="milestones-heading">
          <h2 id="milestones-heading" className="text-lg text-ivory">Milestones</h2>
          <ol className="mt-4 space-y-3">
            {visibleMilestones.map((milestone) => (
              <li key={milestone.id} className="card-surface flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  {milestone.status === "DONE" ? (
                    <CheckCircle2 className="size-5 text-success" aria-hidden />
                  ) : (
                    <span
                      className={`size-3 rounded-full ${milestone.status === "IN_PROGRESS" ? "bg-gold" : "bg-ivory/20"}`}
                      aria-hidden
                    />
                  )}
                  <span className={milestone.status === "DONE" ? "text-ivory/70 line-through" : "text-ivory"}>
                    {milestone.name}
                  </span>
                </div>
                <span className="text-xs text-muted">
                  {milestone.status === "DONE" ? "Completed" : milestone.status === "IN_PROGRESS" ? "In progress" : milestone.dueDate ? formatDate(milestone.dueDate) : "Upcoming"}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section aria-labelledby="updates-heading">
        <h2 id="updates-heading" className="text-lg text-ivory">Progress updates</h2>
        {visibleUpdates.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Updates from the workshop will appear here.</p>
        ) : (
          <ol className="mt-6 space-y-6 border-l border-ivory/10 pl-6">
            {visibleUpdates.map((update) => (
              <li key={update.id} className="relative">
                <span className="absolute -left-[1.85rem] top-1.5 size-3 rounded-full border border-gold/60 bg-obsidian" aria-hidden />
                <p className="text-xs uppercase tracking-widest text-muted">
                  {formatDate(update.createdAt)}
                  {update.stage ? ` · ${stageLabel(update.stage)}` : ""}
                </p>
                <h3 className="mt-1 text-base text-ivory">{update.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ivory/80">{update.description}</p>
                {update.imageUrl ? (
                  <div className="relative mt-3 h-52 overflow-hidden rounded-xl border border-ivory/10">
                    <Image src={update.imageUrl} alt={update.title} fill sizes="(max-width: 768px) 100vw, 40rem" className="object-cover" />
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="card-surface p-6 text-sm text-muted">
        Questions about this project?{" "}
        <Link href="/contact" className="text-gold hover:text-gold-soft">Contact us</Link> and quote reference{" "}
        <span className="text-ivory">{project.reference}</span>.
      </section>
    </div>
  );
}
