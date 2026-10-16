import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePermission("audit.view");
  const { page } = await searchParams;
  const current = Math.max(1, Number(page) || 1);
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (current - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ivory sm:text-3xl">Audit log</h1>
        <p className="mt-2 text-sm text-muted">
          {total} recorded action(s). Entries are append-only and used to trace administrative changes.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="card-surface p-10 text-center text-sm text-muted">No audit entries yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ivory/10 text-xs uppercase tracking-widest text-muted">
                <th scope="col" className="py-3 pr-4">When</th>
                <th scope="col" className="py-3 pr-4">Who</th>
                <th scope="col" className="py-3 pr-4">Action</th>
                <th scope="col" className="py-3 pr-4">Entity</th>
                <th scope="col" className="py-3 pr-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-ivory/5 align-top">
                  <td className="py-3 pr-4 text-xs text-muted">{formatDate(log.createdAt, { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="py-3 pr-4 text-xs text-muted">{log.user?.name ?? "system"}</td>
                  <td className="py-3 pr-4">
                    <Badge tone="neutral">{log.action}</Badge>
                  </td>
                  <td className="py-3 pr-4 text-xs text-muted">
                    {log.entity ?? "—"}
                    {log.entityId ? ` · ${log.entityId.slice(0, 12)}` : ""}
                  </td>
                  <td className="max-w-xs break-words py-3 pr-4 text-xs text-muted">{log.meta ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 ? (
        <nav aria-label="Audit pages" className="flex gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <a
              key={n}
              href={`/admin/audit?page=${n}`}
              className={n === current ? "badge badge-gold" : "badge hover:border-gold/50"}
            >
              {n}
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
