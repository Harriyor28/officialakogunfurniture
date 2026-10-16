import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { ROLE_PERMISSIONS, type Permission, type Role } from "@/lib/constants";
import type { User } from "@/lib/generated/prisma/client";

export type { User };

function isStaffRole(role: string): role is Role {
  return role in ROLE_PERMISSIONS;
}

export function hasPermission(user: Pick<User, "role">, permission: Permission): boolean {
  if (!isStaffRole(user.role)) return false;
  return ROLE_PERMISSIONS[user.role].includes(permission);
}

export function isStaff(user: Pick<User, "role">): boolean {
  return isStaffRole(user.role) && user.role !== "CUSTOMER";
}

/** Require a signed-in staff user on a server action or page. Redirects otherwise. */
export async function requireStaff(): Promise<User> {
  const user = await getSessionUser();
  if (!user || !isStaff(user)) redirect("/login?next=/admin");
  return user;
}

/** Require a specific permission on a server action or page. Throws otherwise. */
export async function requirePermission(permission: Permission): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, permission)) {
    throw new Error("You do not have permission to perform this action.");
  }
  return user;
}

/** Require a signed-in customer (or staff acting as customer). */
export async function requireCustomer(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/portal");
  return user;
}

export async function requireUser(): Promise<User | null> {
  return getSessionUser();
}
