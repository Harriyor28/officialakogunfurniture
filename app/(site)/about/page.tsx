import type { Metadata } from "next";
import Image from "next/image";
import { getBusinessSettings, getProcessSteps } from "@/lib/settings";
import { getPortfolioStats, getProjectCoverImages } from "@/lib/data/queries";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { whatsappLink } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Official Akogun Furniture designs and builds bespoke furniture, cabinetry and interior woodwork — from consultation to installation.",
};

export default async function AboutPage() {
  const [settings, steps, stats, projectCovers] = await Promise.all([
    getBusinessSettings(),
    getProcessSteps(),
    getPortfolioStats(),
    getProjectCoverImages(1),
  ]);
  const waLink = whatsappLink(settings.whatsapp, "Hello Official Akogun Furniture, I would like to learn more.");
  // The admin can upload the workshop photo in Settings; until then, show real
  // photography from a published project rather than placeholder artwork.
  const aboutImage = settings.aboutImage || projectCovers[0] || null;

  return (
    <div className="pb-24 pt-32">
      <section className="container-site grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-3">Our point of view</p>
          <h1 className="text-3xl leading-tight text-ivory sm:text-5xl">
            A lasting piece begins with a thoughtful idea.
          </h1>
          <div className="gold-rule mt-6 w-40" />
          <div className="prose-akogun mt-8 whitespace-pre-line">
            {settings.aboutBody ||
              "Official Akogun Furniture creates made-to-measure furniture and interior woodwork for the way you live and work. Each project starts with a conversation about your space and takes shape through design, making and careful installation."}
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: stats.completed, label: "Published projects" },
              { value: stats.categories, label: "Categories" },
              { value: stats.inProgress, label: "In progress" },
            ].map((stat) => (
              <div key={stat.label} className="card-surface px-4 py-6 text-center">
                <p className="font-display text-3xl text-gold">{stat.value}</p>
                <p className="mt-2 text-[0.7rem] uppercase tracking-widest text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {aboutImage ? (
          <div className="relative h-[24rem] overflow-hidden rounded-[var(--radius-card)] border border-ivory/10 sm:h-[32rem]">
            <Image
              src={aboutImage}
              alt="Furniture crafted by Official Akogun Furniture"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover opacity-90"
            />
          </div>
        ) : null}
      </section>

      <section className="container-site mt-24" aria-labelledby="process-title">
        <SectionHeading
          eyebrow="The making of it"
          title="A thoughtful process, at every step."
          description="From the first conversation to the final fitting, we keep each step clear, considered and focused on your space."
        />
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 40} as="li" className="card-surface p-6">
              <p className="font-display text-2xl text-gold">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-lg text-ivory">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.description}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="container-site mt-24">
        <div className="card-surface grid gap-8 p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl text-ivory">Visit or contact the workshop</h2>
            <p className="mt-3 text-sm text-muted">Get in touch to discuss your space, materials and ideas with our team.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/quote">Request a Quote</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">Contact Us</ButtonLink>
            </div>
          </div>
          <ul className="space-y-3 text-sm text-muted">
            {settings.phone ? (
              <li className="flex items-center gap-3">
                <Phone className="size-4 text-gold" aria-hidden />
                <a className="hover:text-gold" href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}>{settings.phone}</a>
              </li>
            ) : null}
            {settings.email ? (
              <li className="flex items-center gap-3">
                <Mail className="size-4 text-gold" aria-hidden />
                <a className="hover:text-gold" href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
            ) : null}
            {settings.address ? (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 text-gold" aria-hidden />
                <span className="whitespace-pre-line">{settings.address}</span>
              </li>
            ) : null}
            {settings.hours ? <li className="flex items-center gap-3"><span className="size-4" aria-hidden />{settings.hours}</li> : null}
            {waLink ? (
              <li>
                <a className="inline-flex items-center gap-3 hover:text-gold" href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4 text-gold" aria-hidden />
                  WhatsApp enquiry
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </section>
    </div>
  );
}
