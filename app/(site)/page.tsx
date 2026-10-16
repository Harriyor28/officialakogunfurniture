import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Quote } from "lucide-react";
import { Hero, type HeroSlide } from "@/components/site/Hero";
import { ProjectCard } from "@/components/site/Cards";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/format";
import {
  getFeaturedProjects,
  getPortfolioStats,
  getPublishedCategories,
  getPublishedServices,
  getPublishedTestimonials,
} from "@/lib/data/queries";
import { getBusinessSettings, getHomepageCopy, getProcessSteps } from "@/lib/settings";

export const dynamic = "force-dynamic";

const DEMO_HERO_SLIDES: HeroSlide[] = [
  { image: "/demo/wardrobe-1.svg", title: "Sculpted fitted wardrobes", category: "Bespoke joinery" },
  { image: "/demo/kitchen-1.svg", title: "A kitchen made to gather", category: "Kitchen craft" },
  { image: "/demo/bedroom-1.svg", title: "A quieter kind of luxury", category: "Bedroom interiors" },
  { image: "/demo/living-1.svg", title: "Living, shaped around you", category: "Made-to-measure" },
  { image: "/demo/workshop-1.svg", title: "Made by hand, finished to last", category: "Workshop details" },
];

export default async function HomePage() {
  const [settings, copy, projects, categories, services, stats, testimonials, processSteps] =
    await Promise.all([
      getBusinessSettings(),
      getHomepageCopy(),
      getFeaturedProjects(6),
      getPublishedCategories(),
      getPublishedServices(),
      getPortfolioStats(),
      getPublishedTestimonials(),
      getProcessSteps(),
    ]);

  const waLink = whatsappLink(
    settings.whatsapp,
    "Hello Official Akogun Furniture, I would like to request a quotation.",
  );
  const heroSlides = projects.length
    ? projects.map((project, index) => {
        const fallbackImage = DEMO_HERO_SLIDES[index % DEMO_HERO_SLIDES.length].image;
        const image = project.coverImage?.trim() || project.images[0]?.url.trim() || fallbackImage;
        return {
          image,
          title: project.title,
          category: project.category?.name ?? "Featured furniture",
        };
      })
    : DEMO_HERO_SLIDES;

  return (
    <>
      {/* A — Cinematic hero */}
      <Hero
        headline={copy.heroHeadline}
        sub={copy.heroSub}
        slides={heroSlides}
        whatsapp={settings.whatsapp}
        videoUrl={copy.heroVideoUrl}
        videoPoster={copy.heroVideoPoster}
      />

      {/* B — Featured portfolio */}
      <section className="container-site py-24 sm:py-32" aria-labelledby="featured-heading">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="The collection"
            title="Made to belong."
            description="Explore considered pieces and interior work, each shaped around its setting and the people who live with it."
            className="max-w-2xl"
          />
          <ButtonLink href="/portfolio" variant="secondary">
            Explore all work
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>

        {projects.length === 0 ? (
          <p className="mt-10 text-muted">Featured projects will appear here once they are published.</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Reveal key={project.id} delay={index * 70}>
                <ProjectCard project={project} priority={index < 3} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* C — Furniture categories */}
      <section className="border-y border-ivory/10 bg-charcoal/55 py-24 sm:py-32" aria-labelledby="categories-heading">
        <div className="container-site">
          <SectionHeading
            eyebrow="A considered collection"
            title="Rooms, reimagined."
            description="Browse our furniture and interior work by category, and find a direction that feels like your own."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => (
              <Reveal key={category.id} delay={index * 50}>
                <Link
                  href={`/portfolio?category=${category.slug}`}
                  className="group relative block h-56 overflow-hidden rounded-[var(--radius-card)] border border-ivory/8"
                >
                  <Image
                    src={category.image ?? "/demo/custom-1.svg"}
                    alt=""
                    fill
                    unoptimized={/^https?:\/\//i.test(category.image ?? "")}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" aria-hidden />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-lg text-ivory">{category.name}</h3>
                    <p className="mt-1 text-xs text-gold opacity-0 transition-opacity group-hover:opacity-100">
                      Explore the collection →
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* D — Services */}
      <section className="container-site py-24 sm:py-32" aria-labelledby="services-heading">
        <SectionHeading
          eyebrow="Our approach"
          title="Thoughtful work, from first sketch to final fitting."
          description="Explore the services we offer, from individual commissions to considered interior woodwork."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={index * 40}>
              <article className="card-surface flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1">
                <span className="mb-4 inline-flex size-10 items-center justify-center rounded-full border border-gold/40 bg-gold/10 font-display text-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg leading-snug text-ivory">{service.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{service.description}</p>
                <Link
                  href={`/quote?service=${encodeURIComponent(service.name)}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-soft"
                >
                  Request a quote
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* E — Craftsmanship process */}
      <section className="border-y border-ivory/10 bg-charcoal/55 py-24 sm:py-32" aria-labelledby="process-heading">
        <div className="container-site">
          <SectionHeading
            eyebrow="The process"
            title="From first conversation to final fitting."
            description="A considered process keeps each detail connected to your brief, your space and the finished piece."
          />
          <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((step, index) => (
              <Reveal key={step.title} delay={index * 40} as="li" className="relative pl-12">
                <span
                  className="absolute left-0 top-0 flex size-9 items-center justify-center rounded-full border border-gold/50 bg-obsidian font-display text-sm text-gold"
                  aria-hidden
                >
                  {index + 1}
                </span>
                {index < processSteps.length - 1 ? (
                  <span className="absolute left-[1.1rem] top-10 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-gold/40 to-transparent sm:block" aria-hidden />
                ) : null}
                <h3 className="text-lg text-ivory">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* F — Statistics (calculated from published records only) */}
      <section className="container-site py-20 sm:py-24" aria-label="Project statistics">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { value: stats.completed, label: "Completed projects published" },
            { value: stats.categories, label: "Furniture categories" },
            { value: stats.inProgress, label: "Projects currently in progress" },
          ].map((stat, index) => (
            <Reveal key={stat.label} delay={index * 60}>
              <div className="card-surface px-6 py-8 text-center">
                <p className="font-display text-5xl text-gold">{stat.value}</p>
                <p className="mt-3 text-sm uppercase tracking-widest text-muted">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* G — Testimonials */}
      <section className="border-y border-ivory/10 bg-charcoal/55 py-24 sm:py-32" aria-labelledby="testimonials-heading">
        <div className="container-site">
          <SectionHeading
            eyebrow="Client notes"
            title="Considered by the people who live with it."
            description="A few words from clients about their finished projects and the experience of working with us."
          />
          {testimonials.length === 0 ? (
            <p className="mt-10 text-muted">
              Customer reviews will appear here once genuine, approved testimonials are added.
            </p>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Reveal key={testimonial.id} delay={index * 60}>
                  <figure className="card-surface flex h-full flex-col p-6">
                    <Quote className="size-6 text-gold/70" aria-hidden />
                    <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ivory/85">
                      {testimonial.content}
                    </blockquote>
                    <figcaption className="mt-6 border-t border-ivory/10 pt-4 text-sm">
                      <span className="font-semibold text-ivory">{testimonial.authorName}</span>
                      {testimonial.projectType ? (
                        <span className="block text-xs uppercase tracking-widest text-muted">{testimonial.projectType}</span>
                      ) : null}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* H — Final call to action */}
      <section className="relative overflow-hidden border-t border-ivory/10 bg-[#e7e1d5] py-24 sm:py-32" aria-labelledby="cta-heading">
        <Image src="/demo/detail-1.svg" alt="" fill sizes="100vw" className="object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#e7e1d5] via-[#e7e1d5]/90 to-[#e7e1d5]/70" aria-hidden />
        <div className="container-site relative">
          <Reveal className="max-w-2xl">
            <h2 id="cta-heading" className="text-3xl leading-tight text-ivory sm:text-5xl">
              {copy.ctaHeadline}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ivory/75 sm:text-lg">{copy.ctaSub}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <ButtonLink href="/quote">
                Start a Project
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Contact Us
              </ButtonLink>
              {waLink ? (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  <MessageCircle className="size-4" aria-hidden />
                  WhatsApp Enquiry
                </a>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
