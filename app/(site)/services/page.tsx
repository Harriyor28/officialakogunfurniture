import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { getPublishedServices } from "@/lib/data/queries";
import { getBusinessSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Custom furniture, wardrobes and kitchen cabinets, interior woodwork, office and school furniture, repairs, interior design, sales, doors and fittings.",
};

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([getPublishedServices(), getBusinessSettings()]);
  const waLink = whatsappLink(
    settings.whatsapp,
    "Hello Official Akogun Furniture, I would like to discuss one of your services.",
  );

  return (
    <div className="pb-24 pt-32">
      <div className="container-site">
        <SectionHeading
          eyebrow="Made with intention"
          title="A considered approach to every commission."
          description="Explore the services we offer, from a single made-to-measure piece to carefully finished interior work."
        />
      </div>

      <div className="mt-16 space-y-6">
        {services.map((service, index) => (
          <Reveal key={service.id} delay={index * 40}>
            <article
              className={`container-site grid items-center gap-8 border-y border-ivory/5 py-12 lg:grid-cols-2 ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="relative h-64 overflow-hidden rounded-[var(--radius-card)] border border-ivory/10 sm:h-80">
                <Image
                  src={service.image ?? "/demo/custom-1.svg"}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover opacity-80"
                />
              </div>
              <div>
                <span className="eyebrow">{String(index + 1).padStart(2, "0")}</span>
                <h2 className="mt-3 text-2xl text-ivory sm:text-3xl">{service.name}</h2>
                <p className="mt-4 max-w-xl leading-relaxed text-muted">{service.description}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <ButtonLink href={`/quote?service=${encodeURIComponent(service.name)}`} size="sm">
                    Discuss this service
                    <ArrowRight className="size-4" aria-hidden />
                  </ButtonLink>
                  <Link
                    href={`/portfolio${service.categoryId ? `?category=${service.slug}` : ""}`}
                    className="btn btn-ghost btn-sm"
                  >
                    See related work
                  </Link>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="container-site mt-16">
        <div className="card-surface flex flex-wrap items-center justify-between gap-6 p-8">
          <div>
            <h2 className="text-2xl text-ivory">Have a particular piece in mind?</h2>
            <p className="mt-2 text-sm text-muted">Tell us about your space and we can explore the right direction together.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/quote">Start a Project</ButtonLink>
            {waLink ? (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <MessageCircle className="size-4" aria-hidden />
                WhatsApp Enquiry
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
