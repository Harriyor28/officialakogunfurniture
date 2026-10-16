"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { productSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";
import type { AdminFormState } from "@/app/actions/admin/projects";
export type { AdminFormState };

function values(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

export async function saveProductAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("catalogue.manage");
  const productId = String(formData.get("id") ?? "");
  const parsed = productSchema.safeParse({
    ...values(formData),
    customisable: formData.get("customisable") === "on",
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    images: [],
  });
  if (!parsed.success) {
    return { error: "Check the form fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const imageUrls = formData
    .getAll("imageUrls")
    .filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
  const imageAlts = formData.getAll("imageAlts");
  const images = imageUrls.map((url, index) => ({
    url,
    alt: String(imageAlts[index] ?? ""),
    order: index,
  }));

  const payload = {
    name: data.name,
    slug: data.slug,
    categoryId: data.categoryId || null,
    summary: data.summary || null,
    description: data.description || null,
    dimensions: data.dimensions || null,
    materials: data.materials || null,
    colours: data.colours || null,
    priceFrom: Number.isFinite(data.priceFrom) ? (data.priceFrom as number) : null,
    priceTo: Number.isFinite(data.priceTo) ? (data.priceTo as number) : null,
    availability: data.availability,
    leadTime: data.leadTime || null,
    customisable: data.customisable,
    featured: data.featured,
    published: data.published,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
  };

  try {
    if (productId) {
      await prisma.product.update({
        where: { id: productId },
        data: { ...payload, images: { deleteMany: {}, create: images } },
      });
      await audit({ userId: user.id, action: "product.updated", entity: "Product", entityId: productId });
    } else {
      await prisma.product.create({ data: { ...payload, images: { create: images } } });
      await audit({ userId: user.id, action: "product.created", entity: "Product", entityId: data.slug });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "A product with this slug already exists." };
    }
    throw error;
  }

  revalidatePath("/furniture");
  revalidatePath("/admin/catalogue");
  return { success: productId ? "Product updated." : "Product created." };
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const user = await requirePermission("catalogue.manage");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.product.delete({ where: { id } }).catch(() => null);
  await audit({ userId: user.id, action: "product.deleted", entity: "Product", entityId: id });
  revalidatePath("/furniture");
  revalidatePath("/admin/catalogue");
}
