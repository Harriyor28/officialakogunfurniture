import { MessageSquare, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteTestimonialAction } from "@/app/actions/admin/content";
import { TestimonialForm } from "@/components/admin/TestimonialForm";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  await requirePermission("content.manage");
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl text-ivory sm:text-3xl">Testimonials</h1>
        <p className="mt-2 text-sm text-muted">
          Only add reviews real customers gave you. Unapproved or unpublished reviews are never shown publicly.
        </p>
      </div>

      <section className="card-surface p-6 sm:p-8" aria-labelledby="new-testimonial">
        <h2 id="new-testimonial" className="text-lg text-ivory">
          {testimonials.length === 0 ? "Add the first testimonial" : "Add a testimonial"}
        </h2>
        <div className="mt-5">
          <TestimonialForm />
        </div>
      </section>

      <section aria-labelledby="all-testimonials">
        <h2 id="all-testimonials" className="text-lg text-ivory">All testimonials ({testimonials.length})</h2>
        {testimonials.length === 0 ? (
          <div className="card-surface mt-4 p-8 text-center text-sm text-muted">Nothing yet.</div>
        ) : (
          <ul className="mt-4 space-y-3">
            {testimonials.map((testimonial) => (
              <li key={testimonial.id} className="card-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-2 font-semibold text-ivory">
                      <MessageSquare className="size-4 text-gold" aria-hidden />
                      {testimonial.authorName}
                      {testimonial.rating ? (
                        <span className="inline-flex items-center gap-0.5 text-xs text-gold">
                          <Star className="size-3 fill-current" aria-hidden />
                          {testimonial.rating}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {testimonial.projectType ? `${testimonial.projectType} · ` : ""}
                      {formatDate(testimonial.createdAt)}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-ivory/80">{testimonial.content}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {testimonial.approved ? <Badge tone="success">Approved</Badge> : <Badge tone="warning">Unapproved</Badge>}
                    {testimonial.published ? <Badge tone="gold">Published</Badge> : <Badge>Hidden</Badge>}
                    <details className="relative">
                      <summary className="btn btn-ghost cursor-pointer px-3 py-1.5 text-xs">Edit</summary>
                      <div className="absolute right-0 z-20 mt-2 w-[min(92vw,34rem)] card-surface p-5 shadow-lift">
                        <TestimonialForm
                          testimonial={{
                            id: testimonial.id,
                            authorName: testimonial.authorName,
                            projectType: testimonial.projectType,
                            content: testimonial.content,
                            rating: testimonial.rating,
                            imageUrl: testimonial.imageUrl,
                            approved: testimonial.approved,
                            published: testimonial.published,
                          }}
                        />
                      </div>
                    </details>
                    <DeleteButton
                      action={deleteTestimonialAction}
                      formData={{ id: testimonial.id }}
                      confirmText="Delete this testimonial?"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
