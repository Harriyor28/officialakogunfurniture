import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, FolderKanban, FileText, LogOut } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: LayoutProps<"/portal">) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/portal");

  const [projectCount, quotationCount] = await Promise.all([
    prisma.customerProject.count({ where: { customerUserId: user.id } }),
    prisma.quotation.count({ where: { enquiry: { email: user.email } } }),
  ]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-ivory/10 bg-charcoal/60">
        <div className="container-site flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <Link href="/portal" className="font-display text-xl text-ivory">
              AKOGUN <span className="text-[0.6rem] uppercase tracking-[0.3em] text-gold">Portal</span>
            </Link>
            <p className="mt-1 text-xs text-muted">Signed in as {user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/portal" className="btn btn-ghost btn-sm">
              <LayoutDashboard className="size-4" aria-hidden />
              Dashboard
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="btn btn-ghost btn-sm">
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <nav aria-label="Portal" className="border-b border-ivory/5 bg-obsidian">
        <div className="container-site flex gap-6 py-3 text-sm">
          <Link href="/portal" className="inline-flex items-center gap-2 text-muted hover:text-gold">
            <LayoutDashboard className="size-4" aria-hidden />
            Overview
          </Link>
          <Link href="/portal#projects" className="inline-flex items-center gap-2 text-muted hover:text-gold">
            <FolderKanban className="size-4" aria-hidden />
            Projects ({projectCount})
          </Link>
          <Link href="/portal#quotations" className="inline-flex items-center gap-2 text-muted hover:text-gold">
            <FileText className="size-4" aria-hidden />
            Quotations ({quotationCount})
          </Link>
        </div>
      </nav>

      <main className="container-site py-10">{children}</main>
    </div>
  );
}
