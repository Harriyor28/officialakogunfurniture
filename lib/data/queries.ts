import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Request-scoped deduplication for data used in several components. */
export const getPublishedCategories = cache(async () =>
  prisma.furnitureCategory.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  }),
);

export const getPublishedServices = cache(async () =>
  prisma.service.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  }),
);

export const getFeaturedProjects = cache(async (limit = 6) =>
  prisma.project.findMany({
    where: { published: true, featured: true, status: { not: "ARCHIVED" } },
    orderBy: [{ updatedAt: "desc" }],
    take: limit,
    include: { category: true, images: { orderBy: { order: "asc" } } },
  }),
);

export const getPublishedProjects = cache(async (limit = 12) =>
  prisma.project.findMany({
    where: { published: true, status: { not: "ARCHIVED" } },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: limit,
    include: { category: true, images: { orderBy: { order: "asc" } } },
  }),
);

export const getPublishedProducts = cache(async (limit = 12) =>
  prisma.product.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: limit,
    include: { category: true, images: { orderBy: { order: "asc" } } },
  }),
);

export const getPublishedTestimonials = cache(async () =>
  prisma.testimonial.findMany({
    where: { published: true, approved: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  }),
);

export const getPublishedPosts = cache(async (limit?: number) =>
  prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    ...(limit ? { take: limit } : {}),
  }),
);

/**
 * Cover photography from published projects, used as a genuine fallback when a
 * service or the About page has no photo of its own yet (instead of shipping
 * placeholder artwork).
 */
export const getProjectCoverImages = cache(async (limit = 8) => {
  const projects = await prisma.project.findMany({
    where: { published: true, status: { not: "ARCHIVED" } },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: limit,
    select: {
      coverImage: true,
      images: { select: { url: true }, orderBy: { order: "asc" }, take: 1 },
    },
  });
  return projects
    .map((project) => project.coverImage ?? project.images[0]?.url ?? null)
    .filter((url): url is string => Boolean(url));
});

export const getPortfolioStats = cache(async () => {
  const [completed, categories, inProgress] = await Promise.all([
    prisma.project.count({ where: { published: true, status: "COMPLETED" } }),
    prisma.furnitureCategory.count({ where: { published: true } }),
    prisma.project.count({ where: { published: true, status: "IN_PROGRESS" } }),
  ]);
  return { completed, categories, inProgress };
});

export const getProjectBySlug = cache(async (slug: string) =>
  prisma.project.findFirst({
    where: { slug, published: true },
    include: { category: true, images: { orderBy: { order: "asc" } } },
  }),
);

export const getRelatedProjects = cache(async (categoryId: string | null, excludeId: string) => {
  if (!categoryId) return [];
  return prisma.project.findMany({
    where: { published: true, categoryId, id: { not: excludeId }, status: { not: "ARCHIVED" } },
    orderBy: { updatedAt: "desc" },
    take: 3,
    include: { category: true, images: { orderBy: { order: "asc" } } },
  });
});

export const getProductBySlug = cache(async (slug: string) =>
  prisma.product.findFirst({
    where: { slug, published: true },
    include: { category: true, images: { orderBy: { order: "asc" } } },
  }),
);

export const getRelatedProducts = cache(async (categoryId: string | null, excludeId: string) => {
  if (!categoryId) return [];
  return prisma.product.findMany({
    where: { published: true, categoryId, id: { not: excludeId } },
    orderBy: { updatedAt: "desc" },
    take: 3,
    include: { category: true, images: { orderBy: { order: "asc" } } },
  });
});

export const getPostBySlug = cache(async (slug: string) =>
  prisma.blogPost.findFirst({ where: { slug, published: true } }),
);
