import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderKanban, FileText } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { QUOTATION_STATUSES, stageLabel, stagePercent } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My projects" };

export default async function PortalHomePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/portal");

  const [projects, quotations] = await Promise.all([
    prisma.customerProject.findMany({
      where: { customerUserId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { category: true },
    }),
    prisma.quotation.findMany({
      where: { enquiry: { email: user.email } },
      orderBy: { updatedAt: "desc" },
      include: { enquiry: { select: { reference: true, title: true, serviceCategory: true } } },
    }),
  ]);

  return (
    <div className="space-y-12">
      <section id="projects" aria-labelledby="projects-heading">
        <div className="flex items-center gap-3">
          <FolderKanban className="size-5 text-gold" aria-hidden />
          <h1 id="projects-heading" className="text-2xl text-ivory">My projects</h1>
        </div>

        {projects.length === 0 ? (
          <div className="card-surface mt-6 p-8 text-center">
            <p className="text-muted">No projects yet. Projects appear here after your quotation is approved.</p>
            <div className="mt-6 flex justify-center gap-3">
              <ButtonLink href="/quote">Request a Quote</ButtonLink>
              <ButtonLink href="/portfolio" variant="ghost">Browse portfolio</ButtonLink>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-5">
            {projects.map((project) => {
              const percent = Math.max(project.progressPercent, stagePercent(project.status));
              return (
                <Link
                  key={project.id}
                  href={`/portal/projects/${project.reference}`}
                  className="card-surface block p-6 transition-colors hover:border-gold/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted">{project.reference}</p>
                      <h2 className="mt-1 text-xl text-ivory">{project.title}</h2>
                      {project.category ? (
                        <p className="mt-1 text-sm text-muted">{project.category.name}</p>
                      ) : null}
                    </div>
                    <Badge tone="gold">{stageLabel(project.status)}</Badge>
                  </div>

                  <div className="mt-5" aria-hidden>
                    <div className="h-1.5 overflow-hidden rounded-full bg-ivory/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-wood to-gold" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted">{percent}% progress (based on project stages)</p>

                  <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-muted">Started</dt>
                      <dd className="text-ivory/85">{formatDate(project.startDate) || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-muted">Expected completion</dt>
                      <dd className="text-ivory/85">{formatDate(project.expectedEndDate) || "To be confirmed"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-muted">Next milestone</dt>
                      <dd className="text-ivory/85">{project.nextMilestone || stageLabel(project.status)}</dd>
                    </div>
                  </dl>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section id="quotations" aria-labelledby="quotations-heading">
        <div className="flex items-center gap-3">
          <FileText className="size-5 text-gold" aria-hidden />
          <h2 id="quotations-heading" className="text-2xl text-ivory">My quotations</h2>
        </div>

        {quotations.length === 0 ? (
          <div className="card-surface mt-6 p-8 text-center">
            <p className="text-muted">No quotations linked to your account email yet.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-ivory/10">
            <table className="w-full text-sm">
              <thead className="bg-charcoal/70 text-left text-xs uppercase tracking-widest text-muted">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Enquiry</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((quotation) => {
                  const total =
                    quotation.subtotal - quotation.discount + quotation.delivery;
                  return (
                    <tr key={quotation.id} className="border-t border-ivory/5">
                      <td className="px-4 py-3">
                        <Link href={`/portal/quotations/${quotation.reference}`} className="text-gold hover:text-gold-soft">
                          {quotation.reference}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {quotation.enquiry.title || quotation.enquiry.serviceCategory}
                        <span className="block text-xs opacity-70">{quotation.enquiry.reference}</span>
                      </td>
                      <td className="px-4 py-3 text-ivory/85">{formatMoney(total)}</td>
                      <td className="px-4 py-3"><StatusBadge status={quotation.status} map={QUOTATION_STATUSES} /></td>
                      <td className="px-4 py-3 text-muted">{formatDate(quotation.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card-surface p-6 text-sm text-muted">
        Need something urgently? <Link href="/contact" className="text-gold hover:text-gold-soft">Contact the team</Link> and
        quote your project reference.
      </section>
    </div>
  );
}
