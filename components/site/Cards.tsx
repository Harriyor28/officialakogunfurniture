import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PROJECT_STATUSES } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

type ProjectLike = {
  slug: string;
  title: string;
  summary: string | null;
  status: string;
  coverImage: string | null;
  images: Array<{ url: string; alt: string }>;
  category: { name: string } | null;
};

function coverOf(project: ProjectLike): string {
  return project.coverImage ?? project.images[0]?.url ?? "/demo/custom-1.svg";
}

export function ProjectCard({
  project,
  priority = false,
  size = "default",
}: {
  project: ProjectLike;
  priority?: boolean;
  size?: "default" | "large";
}) {
  const statusLabel = PROJECT_STATUSES.find((s) => s.value === project.status)?.label ?? project.status;
  const tone = project.status === "COMPLETED" ? "success" : project.status === "IN_PROGRESS" ? "warning" : "gold";

  return (
    <article
      className={`group card-surface relative flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${
        size === "large" ? "min-h-[26rem]" : "min-h-[20rem]"
      }`}
    >
      <div className="relative h-56 overflow-hidden sm:h-64">
        <Image
          src={coverOf(project)}
          alt={project.images[0]?.alt || project.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" aria-hidden />
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge tone={tone}>{statusLabel}</Badge>
          {project.category ? <Badge>{project.category.name}</Badge> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl text-ivory">{project.title}</h3>
        {project.summary ? (
          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted line-clamp-3">{project.summary}</p>
        ) : (
          <span className="flex-1" />
        )}
        <Link
          href={`/portfolio/${project.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold transition-colors hover:text-gold-soft"
        >
          View Project
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

type ProductLike = {
  slug: string;
  name: string;
  summary: string | null;
  availability: string;
  priceFrom: number | null;
  priceTo: number | null;
  currency: string;
  customisable: boolean;
  images: Array<{ url: string; alt: string }>;
  category: { name: string } | null;
};

export function ProductCard({ product }: { product: ProductLike }) {
  const cover = product.images[0]?.url ?? "/demo/custom-1.svg";
  return (
    <article className="group card-surface flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1">
      <div className="relative h-52 overflow-hidden">
        <Image
          src={cover}
          alt={product.images[0]?.alt || product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {product.category ? <Badge>{product.category.name}</Badge> : null}
          {product.customisable ? <Badge tone="gold">Customisable</Badge> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg text-ivory">{product.name}</h3>
        {product.summary ? <p className="mt-2 line-clamp-2 text-sm text-muted">{product.summary}</p> : null}
        <div className="mt-4 flex flex-1 items-end justify-between gap-3">
          <p className="text-xs uppercase tracking-widest text-muted">
            {product.priceFrom !== null || product.priceTo !== null
              ? [product.priceFrom, product.priceTo].filter((v) => v !== null).map((v) => formatMoney(v, product.currency)).join(" – ")
              : "Ask for a price"}
          </p>
          <Link href={`/furniture/${product.slug}`} className="text-sm font-semibold text-gold hover:text-gold-soft">
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
