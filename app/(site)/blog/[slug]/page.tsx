import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPostBySlug, getPublishedPosts } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const dynamic = "force-dynamic";

/** Minimal, safe Markdown subset renderer (headings, paragraphs, lists, bold, italic, code, links). */
export function renderSimpleMarkdown(markdown: string): string {
  const escaped = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split(/\r?\n/);
  const html: string[] = [];
  let inList: "ul" | "ol" | null = null;
  let paragraph: string[] = [];

  const inline = (text: string) =>
    text
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');

  function flushParagraph() {
    if (paragraph.length > 0) {
      html.push(`<p>${inline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  }

  function closeList() {
    if (inList) {
      html.push(`</${inList}>`);
      inList = null;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      if (inList !== "ul") {
        closeList();
        html.push("<ul>");
        inList = "ul";
      }
      html.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (numbered) {
      flushParagraph();
      if (inList !== "ol") {
        closeList();
        html.push("<ol>");
        inList = "ol";
      }
      html.push(`<li>${inline(numbered[1])}</li>`);
      continue;
    }
    closeList();
    paragraph.push(line.trim());
  }
  flushParagraph();
  closeList();
  return html.join("\n");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    openGraph: { type: "article", title: post.title, description: post.excerpt },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const morePosts = (await getPublishedPosts(4)).filter((item) => item.id !== post.id).slice(0, 3);

  return (
    <div className="container-site pb-24 pt-32">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.title }]}
      />

      <article className="mx-auto mt-10 max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-muted">
          {formatDate(post.publishedAt ?? post.createdAt)}
          {post.authorName ? ` · ${post.authorName}` : ""}
        </p>
        <h1 className="mt-4 text-3xl leading-tight text-ivory sm:text-5xl">{post.title}</h1>
        <div className="gold-rule mt-6 w-40" />
        <div className="prose-akogun mt-10" dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(post.content) }} />
      </article>

      {morePosts.length > 0 ? (
        <section className="mx-auto mt-20 max-w-5xl" aria-labelledby="more-articles">
          <h2 id="more-articles" className="text-2xl text-ivory">More articles</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {morePosts.map((item) => (
              <Link key={item.id} href={`/blog/${item.slug}`} className="card-surface p-5 transition-colors hover:border-gold/40">
                <h3 className="text-lg text-ivory">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{item.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-16">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold">
          <ArrowLeft className="size-4" aria-hidden />
          Back to blog
        </Link>
      </p>
    </div>
  );
}
