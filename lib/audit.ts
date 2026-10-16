import { prisma } from "@/lib/prisma";

/** Record an audit entry for sensitive administrative changes. */
export async function audit(input: {
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  meta?: unknown;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? undefined,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        meta: input.meta === undefined ? undefined : JSON.stringify(input.meta).slice(0, 4000),
      },
    });
  } catch {
    // Never let auditing break the main operation.
  }
}
