import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { StaffUserForm } from "@/components/admin/StaffUserForm";
import { toggleUserActiveAction } from "@/app/actions/admin/settings";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const actor = await requirePermission("users.manage");
  const users = await prisma.user.findMany({
    where: { role: { not: "CUSTOMER" } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    include: { _count: { select: { auditLogs: true } } },
  });

  const editingSelf = (id: string) => id === actor.id;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl text-ivory sm:text-3xl">Staff users</h1>
        <p className="mt-2 text-sm text-muted">
          Team accounts with dashboard access. Customer accounts are managed through registration.
        </p>
      </div>

      <section className="card-surface p-6 sm:p-8" aria-labelledby="new-user">
        <h2 id="new-user" className="text-lg text-ivory">Invite a team member</h2>
        <div className="mt-5 max-w-2xl">
          <StaffUserForm />
        </div>
      </section>

      <section aria-labelledby="all-users">
        <h2 id="all-users" className="text-lg text-ivory">All staff ({users.length})</h2>
        <div className="mt-4 space-y-4">
          {users.map((user) => (
            <div key={user.id} className="card-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ivory">
                    {user.name}
                    {user.id === actor.id ? <span className="ml-2 text-xs text-gold">(you)</span> : null}
                  </p>
                  <p className="text-xs text-muted">
                    {user.email} · joined {formatDate(user.createdAt)} · {user._count.auditLogs} audit entr{user._count.auditLogs === 1 ? "y" : "ies"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={user.role === "SUPER_ADMIN" ? "gold" : "neutral"}>{user.role.replaceAll("_", " ")}</Badge>
                  {user.active ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Inactive</Badge>}
                  {user.id !== actor.id ? (
                    <form action={toggleUserActiveAction}>
                      <input type="hidden" name="id" value={user.id} />
                      <button type="submit" className="btn btn-ghost px-3 py-1.5 text-xs">
                        {user.active ? "Deactivate" : "Reactivate"}
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-xs text-gold hover:text-gold-soft">Edit</summary>
                <div className="mt-4 max-w-2xl">
                  <StaffUserForm
                    editingSelf={editingSelf(user.id)}
                    user={{
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      phone: user.phone,
                      role: user.role,
                      active: user.active,
                    }}
                  />
                </div>
              </details>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
