import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isStaff } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import {
  BookOpenText,
  FolderKanban,
  MessageSquareText,
  Package,
  Settings,
  Star,
  Tags,
  Wrench,
} from "lucide-react";
import { hasPermission } from "@/lib/auth";
import type { Permission } from "@/lib/constants";

export const dynamic = "force-dynamic";

const CONTENT_LINKS: Array<{
  href: string;
  label: string;
  description: string;
  permission: Permission;
  icon: typeof Settings;
}> = [
  { href: "/admin/settings", label: "Website settings", description: "Business profile, homepage text and process steps", permission: "settings.manage", icon: Settings },
  { href: "/admin/projects", label: "Portfolio", description: "Showcase projects, images and featured work", permission: "projects.manage", icon: FolderKanban },
  { href: "/admin/catalogue", label: "Furniture catalogue", description: "Furniture items, descriptions and images", permission: "catalogue.manage", icon: Package },
  { href: "/admin/categories", label: "Furniture categories", description: "Organize catalogue and portfolio work", permission: "content.manage", icon: Tags },
  { href: "/admin/services", label: "Services", description: "Edit the services and descriptions shown on the website", permission: "content.manage", icon: Wrench },
  { href: "/admin/testimonials", label: "Testimonials", description: "Manage customer reviews shown on the site", permission: "content.manage", icon: Star },
  { href: "/admin/blog", label: "Inspiration blog", description: "Publish and update articles", permission: "content.manage", icon: BookOpenText },
  { href: "/admin/enquiries", label: "Customer enquiries", description: "Read and respond to incoming requests", permission: "enquiries.manage", icon: MessageSquareText },
];

function upcomingProjects() {
  const now = new Date();
  const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  return prisma.customerProject.findMany({
    where: {
      expectedEndDate: { gte: now, lte: twoWeeks },
      status: { notIn: ["COMPLETED", "AFTER_SALES"] },
    },
    orderBy: { expectedEndDate: "asc" },
    take: 5,
    select: { reference: true, title: true, expectedEndDate: true, status: true },
  });
}

export default async function AdminOverviewPage() {
  const user = await getSessionUser();
  if (!user || !isStaff(user)) redirect("/login?next=/admin");

  const [
    publishedProjects,
    draftProjects,
    newEnquiries,
    pendingQuotations,
    activeProjects,
    awaitingApproval,
    upcoming,
    recentEnquiries,
    recentProjects,
  ] = await Promise.all([
    prisma.project.count({ where: { published: true } }),
    prisma.project.count({ where: { published: false } }),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.quotation.count({ where: { status: { in: ["DRAFT", "SENT"] } } }),
    prisma.customerProject.count({ where: { status: { notIn: ["COMPLETED", "AFTER_SALES"] } } }),
    prisma.customerProject.count({ where: { status: "AWAITING_APPROVAL" } }),
    upcomingProjects(),
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.customerProject.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { customer: { select: { name: true } } },
    }),
  ]);

  const stats = [
    { label: "Published portfolio projects", value: publishedProjects, href: "/admin/projects" },
    { label: "Draft projects", value: draftProjects, href: "/admin/projects" },
    { label: "New enquiries", value: newEnquiries, href: "/admin/enquiries" },
    { label: "Pending quotations", value: pendingQuotations, href: "/admin/quotations" },
    { label: "Active customer projects", value: activeProjects, href: "/admin/customer-projects" },
    { label: "Awaiting customer approval", value: awaitingApproval, href: "/admin/customer-projects" },
  ];
  const contentLinks = CONTENT_LINKS.filter((item) => hasPermission(user, item.permission));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl text-ivory sm:text-3xl">Dashboard overview</h1>
        <p className="mt-2 text-sm text-muted">All figures are calculated from live database records.</p>
      </div>

      <section aria-labelledby="content-controls" className="space-y-4">
        <div>
          <h2 id="content-controls" className="text-lg text-ivory">Website content</h2>
          <p className="mt-1 text-sm text-muted">Choose a section to update what customers see on the public website.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {contentLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-[#8fd8c8]/15 bg-[#0c151a]/75 p-4 transition-colors hover:border-[#8fd8c8]/50 hover:bg-[#10201f]"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[#8fd8c8]/10 text-[#8fd8c8]">
                  <item.icon className="size-4" aria-hidden />
                </span>
                <span className="font-semibold text-ivory group-hover:text-[#a9e7da]">{item.label}</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card-surface p-5 transition-colors hover:border-gold/40">
            <p className="font-display text-4xl text-gold">{stat.value}</p>
            <p className="mt-2 text-sm text-muted">{stat.label}</p>
          </Link>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="recent-enquiries">
          <h2 id="recent-enquiries" className="text-lg text-ivory">Recent enquiries</h2>
          <ul className="mt-4 space-y-3">
            {recentEnquiries.length === 0 ? <li className="text-sm text-muted">No enquiries yet.</li> : null}
            {recentEnquiries.map((enquiry) => (
              <li key={enquiry.id} className="card-surface flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <Link href={`/admin/enquiries/${enquiry.id}`} className="block truncate text-sm font-semibold text-ivory hover:text-gold">
                    {enquiry.title || enquiry.serviceCategory}
                  </Link>
                  <p className="truncate text-xs text-muted">{enquiry.reference} · {enquiry.name} · {formatDate(enquiry.createdAt)}</p>
                </div>
                <Badge tone={enquiry.status === "NEW" ? "gold" : "neutral"}>{enquiry.status.replaceAll("_", " ")}</Badge>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="recent-projects">
          <h2 id="recent-projects" className="text-lg text-ivory">Recently updated projects</h2>
          <ul className="mt-4 space-y-3">
            {recentProjects.length === 0 ? <li className="text-sm text-muted">No customer projects yet.</li> : null}
            {recentProjects.map((project) => (
              <li key={project.id} className="card-surface flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <Link href={`/admin/customer-projects/${project.id}`} className="block truncate text-sm font-semibold text-ivory hover:text-gold">
                    {project.title}
                  </Link>
                  <p className="truncate text-xs text-muted">{project.reference} · {project.customer.name} · {formatDate(project.updatedAt)}</p>
                </div>
                <Badge>{project.status.replaceAll("_", " ")}</Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="upcoming">
        <h2 id="upcoming" className="text-lg text-ivory">Upcoming delivery / completion (14 days)</h2>
        <ul className="mt-4 space-y-3">
          {upcoming.length === 0 ? <li className="text-sm text-muted">Nothing due in the next two weeks.</li> : null}
          {upcoming.map((project) => (
            <li key={project.reference} className="card-surface flex items-center justify-between p-4 text-sm">
              <span className="text-ivory">{project.title} <span className="text-muted">({project.reference})</span></span>
              <span className="text-muted">{formatDate(project.expectedEndDate)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
