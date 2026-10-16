import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/queries";
import { getBusinessSettings } from "@/lib/settings";
import { formatMoney, whatsappLink } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { PRODUCT_AVAILABILITY } from "@/lib/constants";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductCard } from "@/components/site/Cards";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.summary ?? `View ${product.name}.`,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, settings] = await Promise.all([
    getRelatedProducts(product.categoryId, product.id),
    getBusinessSettings(),
  ]);

  const images = product.images.map((image) => ({ url: image.url, alt: image.alt || product.name }));
  const coverUrl = product.images[0]?.url ?? "/demo/custom-1.svg";
  const availability = PRODUCT_AVAILABILITY.find((a) => a.value === product.availability);
  const priceLabel =
    product.priceFrom !== null || product.priceTo !== null
      ? [product.priceFrom, product.priceTo]
          .filter((value): value is number => value !== null)
          .map((value) => formatMoney(value, product.currency))
          .join(" – ")
      : null;

  const waLink = whatsappLink(
    settings.whatsapp,
    `Hello Official Akogun Furniture, I would like to enquire about "${product.name}" (${product.slug}).`,
  );

  const quoteHref = `/quote?service=${encodeURIComponent(product.category?.name ?? "Furniture Sales")}&title=${encodeURIComponent(product.name)}&furniture=${encodeURIComponent(product.name)}`;

  return (
    <div className="container-site pb-24 pt-32">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Furniture", href: "/furniture" },
          { label: product.name },
        ]}
      />

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div className="grid gap-4">
          <div className="relative h-[24rem] overflow-hidden rounded-[var(--radius-card)] border border-ivory/10 sm:h-[30rem]">
            <Image
              src={coverUrl}
              alt={images[0]?.alt ?? product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {images.length > 1 ? (
            <div className="grid grid-cols-3 gap-4">
              {images.slice(1, 4).map((image, index) => (
                <div key={`${image.url}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-ivory/10">
                  <Image src={image.url} alt={image.alt} fill sizes="33vw" className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {product.category ? <Badge>{product.category.name}</Badge> : null}
            <Badge tone={product.availability === "IN_STOCK" ? "success" : product.availability === "UNAVAILABLE" ? "danger" : "warning"}>
              {availability?.label ?? "Ask us"}
            </Badge>
            {product.customisable ? <Badge tone="gold">Customisable</Badge> : null}
          </div>

          <h1 className="mt-4 text-3xl text-ivory sm:text-4xl">{product.name}</h1>

          {product.summary ? <p className="mt-4 text-muted">{product.summary}</p> : null}

          <div className="mt-6 rounded-xl border border-ivory/10 bg-charcoal/60 px-5 py-4">
            <p className="text-xs uppercase tracking-widest text-muted">Price</p>
            <p className="mt-1 text-lg text-ivory">
              {priceLabel ?? "Price on request — request a quote for current pricing."}
            </p>
          </div>

          <dl className="mt-8 space-y-4 text-sm">
            {product.dimensions ? (
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted">Dimensions</dt>
                <dd className="mt-1 text-ivory/85">{product.dimensions}</dd>
              </div>
            ) : null}
            {product.materials ? (
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted">Materials</dt>
                <dd className="mt-1 text-ivory/85">{product.materials}</dd>
              </div>
            ) : null}
            {product.colours ? (
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted">Colours & finishes</dt>
                <dd className="mt-1 text-ivory/85">{product.colours}</dd>
              </div>
            ) : null}
            {product.leadTime ? (
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted">Production lead time</dt>
                <dd className="mt-1 text-ivory/85">{product.leadTime}</dd>
              </div>
            ) : null}
          </dl>

          {product.description ? (
            <div className="prose-akogun mt-8 whitespace-pre-line">{product.description}</div>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={quoteHref}>Request Customisation</ButtonLink>
            <ButtonLink href="/quote" variant="secondary">Request a Quote</ButtonLink>
            {waLink ? (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <MessageCircle className="size-4" aria-hidden />
                WhatsApp Enquiry
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-20" aria-labelledby="related-products">
          <h2 id="related-products" className="text-2xl text-ivory">You may also like</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-16">
        <Link href="/furniture" className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold">
          <ArrowLeft className="size-4" aria-hidden />
          Back to catalogue
        </Link>
      </p>
    </div>
  );
}
