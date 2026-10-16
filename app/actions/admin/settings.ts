"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { settingsSchema, staffUserSchema } from "@/lib/validation";
import { hashPassword, passwordIssues } from "@/lib/password";
import { audit } from "@/lib/audit";
import { DEFAULT_PROCESS_STEPS, saveBusinessSettings, setJsonSetting } from "@/lib/settings";
import type { AdminFormState } from "@/app/actions/admin/projects";
export type { AdminFormState };

function values(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

export async function saveSettingsAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("settings.manage");
  const parsed = settingsSchema.safeParse({
    ...values(formData),
    contentIsDemo: formData.get("contentIsDemo") === "on",
  });
  if (!parsed.success) {
    return { error: "Check the settings fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await saveBusinessSettings(parsed.data);
  await audit({ userId: user.id, action: "settings.businessUpdated", entity: "SiteSetting", entityId: "business" });
  revalidatePath("/", "layout");
  return { success: "Business settings saved." };
}

export async function saveHomepageCopyAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("settings.manage");
  const heroHeadline = String(formData.get("heroHeadline") ?? "").trim();
  const heroSub = String(formData.get("heroSub") ?? "").trim();
  const ctaHeadline = String(formData.get("ctaHeadline") ?? "").trim();
  const ctaSub = String(formData.get("ctaSub") ?? "").trim();
  const heroVideoUrl = String(formData.get("heroVideoUrl") ?? "").trim();
  const heroVideoPoster = String(formData.get("heroVideoPoster") ?? "").trim();
  if (heroHeadline.length < 2 || ctaHeadline.length < 2) {
    return { error: "Headlines must be at least 2 characters." };
  }
  await setJsonSetting("homepage:copy", {
    heroHeadline,
    heroSub,
    ctaHeadline,
    ctaSub,
    heroVideoUrl: heroVideoUrl || "/demo/atelier-motion.mp4",
    heroVideoPoster: heroVideoPoster || "/demo/workshop-1.svg",
  });
  await audit({ userId: user.id, action: "settings.homepageCopyUpdated", entity: "SiteSetting", entityId: "homepage:copy" });
  revalidatePath("/");
  return { success: "Homepage copy & hero video settings saved." };
}

export async function saveProcessAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("settings.manage");
  const titles = formData.getAll("stepTitle").map(String);
  const descriptions = formData.getAll("stepDescription").map(String);
  const steps = titles
    .map((title, index) => ({ title: title.trim(), description: (descriptions[index] ?? "").trim() }))
    .filter((step) => step.title.length > 0);
  if (steps.length === 0) return { error: "Add at least one process step." };
  await setJsonSetting("process", steps);
  await audit({ userId: user.id, action: "settings.processUpdated", entity: "SiteSetting", entityId: "process" });
  revalidatePath("/", "layout");
  revalidatePath("/about");
  return { success: "Process steps saved." };
}

export async function resetProcessAction(): Promise<void> {
  const user = await requirePermission("settings.manage");
  await setJsonSetting("process", DEFAULT_PROCESS_STEPS);
  await audit({ userId: user.id, action: "settings.processReset", entity: "SiteSetting", entityId: "process" });
  revalidatePath("/", "layout");
  revalidatePath("/about");
}

export async function saveStaffUserAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("users.manage");
  const id = String(formData.get("id") ?? "");
  const changePassword = formData.get("changePassword") === "on";
  const rawPassword = String(formData.get("password") ?? "");
  // On edit, an empty password means "keep the current one".
  const password = id && !changePassword && rawPassword === "" ? "placeholder-not-validated" : rawPassword;
  const parsed = staffUserSchema.safeParse({
    ...values(formData),
    password,
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    return { error: "Check the user fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const mustValidatePassword = !id || changePassword || rawPassword !== "";
  if (mustValidatePassword) {
    const issues = passwordIssues(rawPassword);
    if (issues.length > 0) return { error: issues[0] };
  }

  const email = data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!id && existing) return { error: "A user with this email already exists." };
  if (id && existing && existing.id !== id) return { error: "Another user already uses this email." };

  if (id) {
    await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email,
        phone: data.phone || null,
        role: data.role,
        active: data.active,
        ...(changePassword ? { passwordHash: await hashPassword(rawPassword) } : {}),
      },
    });
    await audit({ userId: user.id, action: "user.updated", entity: "User", entityId: id, meta: { role: data.role } });
  } else {
    await prisma.user.create({
      data: {
        name: data.name,
        email,
        phone: data.phone || null,
        role: data.role,
        active: data.active,
        passwordHash: await hashPassword(rawPassword),
      },
    });
    await audit({ userId: user.id, action: "user.created", entity: "User", entityId: email, meta: { role: data.role } });
  }

  revalidatePath("/admin/users");
  return { success: id ? "User updated." : "User created." };
}

export async function toggleUserActiveAction(formData: FormData): Promise<void> {
  const actor = await requirePermission("users.manage");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  if (id === actor.id) return; // never deactivate yourself
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;
  await prisma.user.update({ where: { id }, data: { active: !user.active } });
  if (user.active) {
    // Just deactivated → revoke all sessions immediately.
    await prisma.session.deleteMany({ where: { userId: id } });
  }
  await audit({ userId: actor.id, action: "user.toggledActive", entity: "User", entityId: id, meta: { active: !user.active } });
  revalidatePath("/admin/users");
}
