"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { blogPostSchema, testimonialSchema } from "@/lib/validation";
import { slugify } from "@/lib/slug";
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

export async function saveServicesAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("content.manage");
  const ids = formData.getAll("serviceId").map(String);
  const entries = ids.flatMap((id, index) => {
    const name = String(formData.get(`serviceName_${index}`) ?? "").trim();
    const description = String(formData.get(`serviceDescription_${index}`) ?? "").trim();
    if (!id && !name && !description) return [];
    return [{
      id,
      name,
      description,
      slug: slugify(String(formData.get(`serviceSlug_${index}`) ?? "").trim() || name),
      order: Number(formData.get(`serviceOrder_${index}`)),
      published: formData.getAll(`servicePublished_${index}`).includes("on"),
    }];
  });

  if (entries.length === 0) return { error: "Add at least one service before saving." };
  if (entries.some((service) => service.name.length < 2 || service.name.length > 120)) {
    return { error: "Each service name must be between 2 and 120 characters." };
  }
  if (entries.some((service) => service.description.length < 10 || service.description.length > 1000)) {
    return { error: "Each service description must be between 10 and 1,000 characters." };
  }
  if (entries.some((service) => service.slug.length < 2 || service.slug.length > 160)) {
    return { error: "Each service needs a valid name to create its URL." };
  }
  if (entries.some((service) => !Number.isInteger(service.order) || service.order < 0)) {
    return { error: "Service display order must be a whole number zero or greater." };
  }
  if (new Set(entries.map((service) => service.slug)).size !== entries.length) {
    return { error: "Each service must have a unique name so its page URL is unique." };
  }

  const existingServices = await prisma.service.findMany({
    select: { id: true, slug: true },
  });
  if (entries.some((service) => service.id && !existingServices.some((existing) => existing.id === service.id))) {
    return { error: "A service was removed or is no longer available. Refresh and try again." };
  }
  const submittedIds = new Set(entries.flatMap((service) => service.id ? [service.id] : []));
  const retainedSlugs = existingServices
    .filter((service) => !submittedIds.has(service.id))
    .map((service) => service.slug);
  if (entries.some((service) => retainedSlugs.includes(service.slug))) {
    return { error: "A service already uses one of these page URLs. Change its name and try again." };
  }

  try {
    await prisma.$transaction(
      entries.map((service) => {
        const data = {
          name: service.name,
          slug: service.slug,
          description: service.description,
          order: service.order,
          published: service.published,
        };
        return service.id
          ? prisma.service.update({ where: { id: service.id }, data })
          : prisma.service.create({ data });
      }),
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "A service already uses one of these page URLs. Change its name and try again." };
    }
    throw error;
  }

  await audit({
    userId: user.id,
    action: "service.websiteContentUpdated",
    entity: "Service",
    meta: { count: entries.length },
  });
  revalidatePath("/", "layout");
  revalidatePath("/services");
  revalidatePath("/admin/services");
  return { success: "Website services saved." };
}

export async function saveCategoriesAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("content.manage");
  const ids = formData.getAll("categoryId").map(String);
  const entries = ids.flatMap((id, index) => {
    const name = String(formData.get(`categoryName_${index}`) ?? "").trim();
    const description = String(formData.get(`categoryDescription_${index}`) ?? "").trim();
    const image = String(formData.get(`categoryImage_${index}`) ?? "").trim();
    if (!id && !name && !description && !image) return [];
    return [{
      id,
      name,
      description,
      image,
      slug: slugify(String(formData.get(`categorySlug_${index}`) ?? "").trim() || name),
      order: Number(formData.get(`categoryOrder_${index}`)),
      published: formData.getAll(`categoryPublished_${index}`).includes("on"),
    }];
  });

  if (entries.length === 0) return { error: "Add at least one furniture category before saving." };
  if (entries.some((category) => category.name.length < 2 || category.name.length > 120)) {
    return { error: "Each category name must be between 2 and 120 characters." };
  }
  if (entries.some((category) => category.description.length > 1000 || category.image.length > 2000)) {
    return { error: "Category descriptions and image URLs are too long." };
  }
  if (entries.some((category) => category.slug.length < 2 || category.slug.length > 160)) {
    return { error: "Each category needs a valid name to create its URL." };
  }
  if (entries.some((category) => !Number.isInteger(category.order) || category.order < 0)) {
    return { error: "Category display order must be a whole number zero or greater." };
  }
  if (new Set(entries.map((category) => category.slug)).size !== entries.length) {
    return { error: "Each category must have a unique name so its URL is unique." };
  }

  const existingCategories = await prisma.furnitureCategory.findMany({
    select: { id: true, slug: true },
  });
  if (entries.some((category) => category.id && !existingCategories.some((existing) => existing.id === category.id))) {
    return { error: "A category was removed or is no longer available. Refresh and try again." };
  }
  const submittedIds = new Set(entries.flatMap((category) => category.id ? [category.id] : []));
  const retainedSlugs = existingCategories
    .filter((category) => !submittedIds.has(category.id))
    .map((category) => category.slug);
  if (entries.some((category) => retainedSlugs.includes(category.slug))) {
    return { error: "A category already uses one of these page URLs. Change its name and try again." };
  }

  try {
    await prisma.$transaction(
      entries.map((category) => {
        const data = {
          name: category.name,
          slug: category.slug,
          description: category.description || null,
          image: category.image || null,
          order: category.order,
          published: category.published,
        };
        return category.id
          ? prisma.furnitureCategory.update({ where: { id: category.id }, data })
          : prisma.furnitureCategory.create({ data });
      }),
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "A category already uses one of these page URLs. Change its name and try again." };
    }
    throw error;
  }

  await audit({
    userId: user.id,
    action: "category.websiteContentUpdated",
    entity: "FurnitureCategory",
    meta: { count: entries.length },
  });
  revalidatePath("/", "layout");
  revalidatePath("/portfolio");
  revalidatePath("/furniture");
  revalidatePath("/admin/categories");
  return { success: "Furniture categories saved." };
}

export async function saveTestimonialAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("content.manage");
  const id = String(formData.get("id") ?? "");
  const parsed = testimonialSchema.safeParse({
    ...values(formData),
    approved: formData.get("approved") === "on",
    published: formData.get("published") === "on",
    rating: formData.get("rating") || undefined,
  });
  if (!parsed.success) {
    return { error: "Check the testimonial fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const payload = {
    authorName: data.authorName,
    projectType: data.projectType || null,
    content: data.content,
    rating: Number.isFinite(data.rating) ? (data.rating as number) : null,
    imageUrl: data.imageUrl || null,
    approved: data.approved,
    published: data.published,
  };

  if (id) {
    await prisma.testimonial.update({ where: { id }, data: payload });
  } else {
    await prisma.testimonial.create({ data: payload });
  }
  await audit({ userId: user.id, action: id ? "testimonial.updated" : "testimonial.created", entity: "Testimonial", entityId: id || undefined });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return { success: id ? "Testimonial updated." : "Testimonial saved." };
}

export async function deleteTestimonialAction(formData: FormData): Promise<void> {
  const user = await requirePermission("content.manage");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.testimonial.delete({ where: { id } }).catch(() => null);
  await audit({ userId: user.id, action: "testimonial.deleted", entity: "Testimonial", entityId: id });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function saveBlogPostAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("content.manage");
  const id = String(formData.get("id") ?? "");
  const parsed = blogPostSchema.safeParse({
    ...values(formData),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) {
    return { error: "Check the post fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const payload = {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    coverImage: data.coverImage || null,
    authorName: data.authorName || null,
    published: data.published,
    publishedAt: data.published ? (data.published ? new Date() : null) : null,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
  };

  try {
    if (id) {
      const existing = await prisma.blogPost.findUnique({ where: { id } });
      await prisma.blogPost.update({
        where: { id },
        data: { ...payload, publishedAt: existing?.publishedAt ?? (data.published ? new Date() : null) },
      });
    } else {
      await prisma.blogPost.create({ data: payload });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "A post with this slug already exists." };
    }
    throw error;
  }

  await audit({ userId: user.id, action: id ? "blog.updated" : "blog.created", entity: "BlogPost", entityId: id || data.slug });
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { success: id ? "Post updated." : "Post created." };
}

export async function deleteBlogPostAction(formData: FormData): Promise<void> {
  const user = await requirePermission("content.manage");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.blogPost.delete({ where: { id } }).catch(() => null);
  await audit({ userId: user.id, action: "blog.deleted", entity: "BlogPost", entityId: id });
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
}
