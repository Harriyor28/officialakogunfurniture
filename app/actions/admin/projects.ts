"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { portfolioProjectSchema } from "@/lib/validation";
import { slugify } from "@/lib/slug";
import { audit } from "@/lib/audit";

export type AdminFormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

function values(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

function imageEntries(formData: FormData) {
  return formData
    .getAll("imageUrls")
    .filter((entry): entry is string => typeof entry === "string" && entry.length > 0)
    .map((url, index) => ({
      url,
      alt: String(formData.getAll("imageAlts")[index] ?? ""),
      order: index,
    }));
}

export async function saveProjectAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("projects.manage");
  const projectId = String(formData.get("id") ?? "");
  const parsed = portfolioProjectSchema.safeParse({
    ...values(formData),
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
    images: [],
  });
  if (!parsed.success) {
    return { error: "Check the form fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const images = imageEntries(formData);
  const slug = data.slug || slugify(data.title);

  const payload = {
    title: data.title,
    slug,
    categoryId: data.categoryId || null,
    summary: data.summary || null,
    description: data.description || null,
    inspiration: data.inspiration || null,
    materials: data.materials || null,
    dimensions: data.dimensions || null,
    location: data.location || null,
    completedAt: data.completedAt ? new Date(data.completedAt) : null,
    status: data.status,
    published: data.published,
    featured: data.featured,
    coverImage: data.coverImage || images[0]?.url || null,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
  };

  try {
    if (projectId) {
      const existing = await prisma.project.findUnique({ where: { id: projectId } });
      if (!existing) return { error: "Project not found." };
      await prisma.project.update({
        where: { id: projectId },
        data: { ...payload, images: { deleteMany: {}, create: images } },
      });
      await audit({ userId: user.id, action: "project.updated", entity: "Project", entityId: projectId });
    } else {
      await prisma.project.create({
        data: { ...payload, images: { create: images } },
      });
      await audit({ userId: user.id, action: "project.created", entity: "Project", entityId: slug, meta: { title: data.title } });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "A project with this slug already exists." };
    }
    throw error;
  }

  revalidatePath("/portfolio");
  revalidatePath("/admin/projects");
  revalidatePath("/");
  return { success: projectId ? "Project updated." : "Project created." };
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const user = await requirePermission("projects.manage");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.project.delete({ where: { id } }).catch(() => null);
  await audit({ userId: user.id, action: "project.deleted", entity: "Project", entityId: id });
  revalidatePath("/portfolio");
  revalidatePath("/admin/projects");
}
