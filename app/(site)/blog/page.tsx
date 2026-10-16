import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedPosts } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Furniture Inspiration Blog",
  description:
    "Furniture design guides, material advice, maintenance tips and completed project stories from Official Akogun Furniture.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="container-site pb-24 pt-32">
      <SectionHeading
        eyebrow="Inspiration"
        title="Furniture guides & project stories"
        description="Design ideas, material advice and maintenance tips from the workshop."
      />

      {posts.length === 0 ? (
        <p className="mt-12 text-muted">Articles will appear here once they are published.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Reveal key={post.id} delay={index * 50}>
              <article className="card-surface group flex h-full flex-col overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.coverImage ?? "/demo/detail-1.svg"}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs uppercase tracking-widest text-muted">
                    {formatDate(post.publishedAt ?? post.createdAt)}
                  </p>
                  <h2 className="mt-2 text-xl text-ivory">{post.title}</h2>
                  <p className="mt-3 flex-1 text-sm text-muted">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="mt-5 text-sm font-semibold text-gold hover:text-gold-soft">
                    Read article →
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
