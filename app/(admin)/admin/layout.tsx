import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FolderKanban,
  LayoutGrid,
  Package,
  MessagesSquare,
  ClipboardList,
  Star,
  Newspaper,
  Settings,
  Users,
  LogOut,
  History,
  ExternalLink,
  Tags,
  Wrench,
} from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { hasPermission, isStaff } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import type { Permission } from "@/lib/constants";
import { cn } from "@/lib/format";
import type { Metadata } from "next";
import { getBusinessSettings } from "@/lib/settings";
import { BrandLogo } from "@/components/site/BrandLogo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private staff workspace",
  robots: { index: false, follow: false, noarchive: true },
};

const NAV: Array<{ href: string; label: string; icon: React.ElementType; permission?: Permission }> = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/enquiries", label: "Enquiries", icon: MessagesSquare, permission: "enquiries.manage" },
  { href: "/admin/quotations", label: "Quotations", icon: ClipboardList, permission: "quotations.manage" },
  { href: "/admin/customer-projects", label: "Projects", icon: FolderKanban, permission: "customerProjects.manage" },
  { href: "/admin/projects", label: "Portfolio", icon: FolderKanban, permission: "projects.manage" },
  { href: "/admin/catalogue", label: "Catalogue", icon: Package, permission: "catalogue.manage" },
  { href: "/admin/categories", label: "Categories", icon: Tags, permission: "content.manage" },
  { href: "/admin/services", label: "Services", icon: Wrench, permission: "content.manage" },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star, permission: "content.manage" },
  { href: "/admin/blog", label: "Blog", icon: Newspaper, permission: "content.manage" },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings.manage" },
  { href: "/admin/users", label: "Users", icon: Users, permission: "users.manage" },
  { href: "/admin/audit", label: "Audit log", icon: History, permission: "audit.view" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getSessionUser();
  if (!user || !isStaff(user)) redirect("/login?next=/admin");

  const settings = await getBusinessSettings();
  const items = NAV.filter((item) => !item.permission || hasPermission(user, item.permission));

  return (
    <div className="admin-console flex min-h-screen flex-col bg-[#111820] lg:flex-row">
      <aside className="border-b border-[#8fd8c8]/15 bg-[#091116] lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="border-b border-[#8fd8c8]/10 p-5">
          <Link href="/admin" className="inline-flex items-center gap-2" aria-label={`${settings.businessName} staff workspace`}>
            <BrandLogo logoUrl={settings.logoUrl} businessName={settings.businessName} compact />
            <span className="font-display text-lg text-ivory">
              Control
            </span>
          </Link>
          <p className="mt-2 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#8fd8c8]/70">Workshop operations</p>
          <p className="mt-3 truncate text-xs text-muted">{user.name} · {user.role.replaceAll("_", " ").toLowerCase()}</p>
        </div>
        <nav aria-label="Admin" className="flex flex-row gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-ivory/75 transition-colors hover:bg-ivory/5 hover:text-gold",
              )}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-ivory/10 p-3">
          <form action={logoutAction}>
            <button type="submit" className="inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-ivory/5 hover:text-gold">
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-[radial-gradient(ellipse_at_top_right,rgba(83,140,128,0.12),transparent_44%)] p-5 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-[#8fd8c8]/15 pb-4">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#8fd8c8]">Staff workspace · Private</p>
              <p className="mt-1 text-xs text-muted">Manage projects, customer requests, and published content.</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#8fd8c8]/25 px-4 py-2 text-xs font-semibold text-ivory transition-colors hover:border-[#8fd8c8]/60 hover:text-[#8fd8c8]"
            >
              View public website
              <ExternalLink className="size-3.5" aria-hidden />
            </Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
