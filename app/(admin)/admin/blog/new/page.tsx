import { requirePermission } from "@/lib/auth";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  await requirePermission("content.manage");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-ivory sm:text-3xl">New blog post</h1>
        <p className="mt-2 text-sm text-muted">The post stays a draft until you publish it.</p>
      </div>
      <div className="card-surface p-6 sm:p-8">
        <BlogPostForm />
      </div>
    </div>
  );
}
