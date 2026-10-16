"use client";

import { useActionState } from "react";
import { saveTestimonialAction, type AdminFormState } from "@/app/actions/admin/content";
import { Field, TextInput, TextArea, Select, Checkbox } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";
import { FormAlert } from "@/components/admin/FormAlert";
import { SingleImage } from "@/components/admin/ImageGallery";

const initialState: AdminFormState = {};

export function TestimonialForm({
  testimonial,
}: {
  testimonial?: {
    id: string;
    authorName: string;
    projectType: string | null;
    content: string;
    rating: number | null;
    imageUrl: string | null;
    approved: boolean;
    published: boolean;
  };
}) {
  const [state, formAction, pending] = useActionState(saveTestimonialAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <FormAlert state={state} />
      {testimonial ? <input type="hidden" name="id" value={testimonial.id} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Customer name" htmlFor="authorName" required error={state.fieldErrors?.authorName?.[0]}>
          <TextInput id="authorName" name="authorName" required defaultValue={testimonial?.authorName} />
        </Field>
        <Field label="Project type" htmlFor="projectType">
          <TextInput id="projectType" name="projectType" placeholder="e.g. Fitted wardrobe" defaultValue={testimonial?.projectType ?? ""} />
        </Field>
        <Field label="Rating (optional)" htmlFor="rating" error={state.fieldErrors?.rating?.[0]}>
          <Select
            id="rating"
            name="rating"
            defaultValue={testimonial?.rating ? String(testimonial.rating) : ""}
            options={[
              { value: "", label: "No rating" },
              ...[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} star${n > 1 ? "s" : ""}` })),
            ]}
          />
        </Field>
        <SingleImage initial={testimonial?.imageUrl ?? ""} name="imageUrl" label="Photo (optional)" />
      </div>

      <Field label="Review" htmlFor="content" required error={state.fieldErrors?.content?.[0]}>
        <TextArea id="content" name="content" required rows={5} defaultValue={testimonial?.content} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Checkbox id="approved" name="approved" defaultChecked={testimonial?.approved ?? false} label="Approved (authenticity verified)" />
        <Checkbox id="published" name="published" defaultChecked={testimonial?.published ?? false} label="Published on the website" />
      </div>

      <SubmitButton disabled={pending}>{pending ? "Saving…" : testimonial ? "Save changes" : "Create testimonial"}</SubmitButton>
    </form>
  );
}
