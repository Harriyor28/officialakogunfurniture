import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content.manage");
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ivory sm:text-3xl">Edit post</h1>
        <p className="mt-2 text-sm text-muted">{post.title}</p>
      </div>
      <div className="card-surface p-6 sm:p-8">
        <BlogPostForm
          post={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.coverImage,
            authorName: post.authorName,
            published: post.published,
            seoTitle: post.seoTitle,
            seoDescription: post.seoDescription,
          }}
        />
      </div>
    </div>
  );
}
