import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { getProjectBySlug, getRelatedProjects } from "@/lib/data/queries";
import { getBusinessSettings } from "@/lib/settings";
import { formatDate, whatsappLink } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { PROJECT_STATUSES } from "@/lib/constants";
import { Gallery } from "./Gallery";
import { ProjectCard } from "@/components/site/Cards";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.seoTitle ?? project.title,
    description: project.seoDescription ?? project.summary ?? `View the ${project.title} project.`,
    openGraph: {
      title: project.title,
      description: project.seoDescription ?? project.summary ?? undefined,
      images: project.coverImage ? [{ url: project.coverImage }] : undefined,
      type: "article",
    },
  };
}

export default async function ProjectDetailPage({ params }: Params) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const [related, settings] = await Promise.all([
    getRelatedProjects(project.categoryId, project.id),
    getBusinessSettings(),
  ]);

  const images = project.images.map((image) => ({ url: image.url, alt: image.alt || project.title }));
  const cover = {
    url: project.coverImage ?? images[0]?.url ?? "/demo/custom-1.svg",
    alt: images[0]?.alt ?? project.title,
  };
  const statusLabel = PROJECT_STATUSES.find((s) => s.value === project.status)?.label ?? project.status;
  const waLink = whatsappLink(
    settings.whatsapp,
    `Hello Official Akogun Furniture, I am interested in a design like "${project.title}".`,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary ?? undefined,
    image: images.map((image) => image.url),
    dateCreated: project.completedAt?.toISOString(),
  };

  return (
    <div className="container-site pb-24 pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Portfolio", href: "/portfolio" },
          { label: project.title },
        ]}
      />

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <Gallery
          cover={cover}
          images={images.length > 0 ? images : [cover]}
          title={project.title}
        />

        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={project.status === "COMPLETED" ? "success" : project.status === "IN_PROGRESS" ? "warning" : "gold"}>
              {statusLabel}
            </Badge>
            {project.category ? <Badge>{project.category.name}</Badge> : null}
          </div>

          <h1 className="mt-4 text-3xl leading-tight text-ivory sm:text-4xl">{project.title}</h1>

          {project.summary ? <p className="mt-4 text-muted">{project.summary}</p> : null}

          <dl className="mt-8 space-y-4 text-sm">
            {project.materials ? (
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted">Materials & finishes</dt>
                <dd className="mt-1 text-ivory/85">{project.materials}</dd>
              </div>
            ) : null}
            {project.dimensions ? (
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted">Dimensions</dt>
                <dd className="mt-1 text-ivory/85">{project.dimensions}</dd>
              </div>
            ) : null}
            {project.completedAt ? (
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted">Completed</dt>
                <dd className="mt-1 text-ivory/85">{formatDate(project.completedAt)}</dd>
              </div>
            ) : null}
            {project.location ? (
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted">Location</dt>
                <dd className="mt-1 text-ivory/85">{project.location}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={`/quote?service=${encodeURIComponent(project.category?.name ?? "Custom Furniture")}&title=${encodeURIComponent(`Similar to ${project.title}`)}`}>
              Enquire About a Similar Design
            </ButtonLink>
            <ButtonLink href="/quote" variant="secondary">Request a Quote</ButtonLink>
            {waLink ? (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <MessageCircle className="size-4" aria-hidden />
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {(project.description || project.inspiration) ? (
        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          {project.description ? (
            <section>
              <h2 className="text-2xl text-ivory">About this project</h2>
              <div className="gold-rule mt-4 w-24" />
              <p className="mt-5 whitespace-pre-line leading-relaxed text-ivory/80">{project.description}</p>
            </section>
          ) : null}
          {project.inspiration ? (
            <section>
              <h2 className="text-2xl text-ivory">Design inspiration</h2>
              <div className="gold-rule mt-4 w-24" />
              <p className="mt-5 whitespace-pre-line leading-relaxed text-ivory/80">{project.inspiration}</p>
            </section>
          ) : null}
        </div>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-20" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-2xl text-ivory">Related projects</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProjectCard key={item.id} project={item} />
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-16">
        <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold">
          <ArrowLeft className="size-4" aria-hidden />
          Back to portfolio
        </Link>
      </p>
    </div>
  );
}
