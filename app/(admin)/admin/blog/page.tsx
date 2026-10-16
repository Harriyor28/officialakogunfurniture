import Link from "next/link";
import { Newspaper, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteBlogPostAction } from "@/app/actions/admin/content";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  await requirePermission("content.manage");
  const posts = await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-ivory sm:text-3xl">Blog</h1>
          <p className="mt-2 text-sm text-muted">{posts.length} post(s).</p>
        </div>
        <Link href="/admin/blog/new" className="btn btn-primary">
          <Plus className="size-4" aria-hidden />
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="card-surface p-10 text-center text-sm text-muted">
          No posts yet. <Link href="/admin/blog/new" className="text-gold hover:text-gold-soft">Write the first one</Link>.
        </div>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id} className="card-surface flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <Link href={`/admin/blog/${post.id}`} className="inline-flex items-center gap-2 font-semibold text-ivory hover:text-gold">
                  <Newspaper className="size-4 text-gold" aria-hidden />
                  {post.title}
                </Link>
                <p className="mt-1 text-xs text-muted">
                  /{post.slug} · {post.published ? `published ${formatDate(post.publishedAt)}` : "draft"}
                  {post.authorName ? ` · ${post.authorName}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {post.published ? <Badge tone="success">Published</Badge> : <Badge>Draft</Badge>}
                <Link href={`/admin/blog/${post.id}`} className="btn btn-ghost px-3 py-1.5 text-xs">
                  Edit
                </Link>
                <DeleteButton
                  action={deleteBlogPostAction}
                  formData={{ id: post.id }}
                  confirmText={`Delete "${post.title}"?`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
