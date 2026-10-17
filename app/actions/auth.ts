"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, passwordIssues, verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/site-url";
import {
  loginSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  registerSchema,
} from "@/lib/validation";
import { audit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { randomBytes, createHash } from "node:crypto";

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
};

function safeNext(next: string | undefined | null): string {
  if (!next) return "/portal";
  if (!next.startsWith("/") || next.startsWith("//")) return "/portal";
  return next;
}

function formDataValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ip = clientIp(await headers());
  if (!rateLimit(`login:${ip}`, 8, 5 * 60_000)) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const parsed = loginSchema.safeParse(formDataValues(formData));
  if (!parsed.success) {
    return { error: "Check the form and try again.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { email, password, next } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id, (await headers()).get("user-agent"));
  await audit({ userId: user.id, action: "auth.login", entity: "User", entityId: user.id });

  redirect(safeNext(next));
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ip = clientIp(await headers());
  if (!rateLimit(`register:${ip}`, 5, 10 * 60_000)) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const parsed = registerSchema.safeParse(formDataValues(formData));
  if (!parsed.success) {
    return { error: "Check the form and try again.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { name, email, phone, password } = parsed.data;
  const issues = passwordIssues(password);
  if (issues.length > 0) return { error: issues[0] };

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return { error: "An account with this email already exists. Try logging in instead." };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      phone: phone || null,
      passwordHash: await hashPassword(password),
      role: "CUSTOMER",
    },
  });

  await createSession(user.id, (await headers()).get("user-agent"));
  await audit({ userId: user.id, action: "auth.register", entity: "User", entityId: user.id });

  redirect("/portal");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function requestPasswordResetAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ip = clientIp(await headers());
  if (!rateLimit(`forgot:${ip}`, 5, 15 * 60_000)) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const parsed = passwordResetRequestSchema.safeParse(formDataValues(formData));
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  // Always show the same message so accounts cannot be enumerated.
  const generic = {
    success:
      "If an account exists for that email, a password reset link has been generated. Check your email if notifications are configured.",
  };
  if (!user) return generic;

  const token = randomBytes(32).toString("hex");
  await prisma.passwordReset.create({
    data: {
      tokenHash: createHash("sha256").update(token).digest("hex"),
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const baseUrl = getSiteUrl();
  const status = await sendEmail({
    to: user.email,
    subject: "Reset your Official Akogun Furniture password",
    text: `Hello ${user.name},\n\nUse the link below within one hour to reset your password:\n${baseUrl}/reset-password?token=${token}\n\nIf you did not request this, you can ignore this message.`,
    relatedType: "passwordReset",
    relatedId: user.id,
  });
  void status;

  return generic;
}

export async function resetPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ip = clientIp(await headers());
  if (!rateLimit(`reset:${ip}`, 8, 15 * 60_000)) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const parsed = passwordResetSchema.safeParse(formDataValues(formData));
  if (!parsed.success) {
    return {
      error: "Check the form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const record = await prisma.passwordReset.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const issues = passwordIssues(parsed.data.password);
  if (issues.length > 0) return { error: issues[0] };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await hashPassword(parsed.data.password) },
    }),
    prisma.passwordReset.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: record.userId } }),
  ]);

  await audit({ userId: record.userId, action: "auth.passwordReset", entity: "User", entityId: record.userId });

  return { success: "Your password has been updated. You can now sign in." };
}
