"use client";

import { useActionState } from "react";
import { saveProjectAction, type AdminFormState } from "@/app/actions/admin/projects";
import { Field, TextInput, TextArea, Select, Checkbox } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";
import { FormAlert } from "@/components/admin/FormAlert";
import { ImageGallery, SingleImage } from "@/components/admin/ImageGallery";
import { PROJECT_STATUSES } from "@/lib/constants";

type Category = { id: string; name: string };
type ExistingImage = { url: string; alt: string };

const initialState: AdminFormState = {};

export function ProjectForm({
  categories,
  project,
  images,
}: {
  categories: Category[];
  project?: {
    id: string;
    title: string;
    slug: string;
    categoryId: string | null;
    summary: string | null;
    description: string | null;
    inspiration: string | null;
    materials: string | null;
    dimensions: string | null;
    location: string | null;
    completedAt: Date | null;
    status: string;
    published: boolean;
    featured: boolean;
    coverImage: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  };
  images?: ExistingImage[];
}) {
  const [state, formAction, pending] = useActionState(saveProjectAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <FormAlert state={state} />
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Project title" htmlFor="title" required error={state.fieldErrors?.title?.[0]}>
          <TextInput id="title" name="title" required defaultValue={project?.title} />
        </Field>
        <Field
          label="URL slug"
          htmlFor="slug"
          error={state.fieldErrors?.slug?.[0]}
          hint={project ? undefined : "Leave blank to generate from the title."}
        >
          <TextInput id="slug" name="slug" defaultValue={project?.slug} placeholder="auto-generated" />
        </Field>
        <Field label="Category" htmlFor="categoryId">
          <Select
            id="categoryId"
            name="categoryId"
            defaultValue={project?.categoryId ?? ""}
            options={[{ value: "", label: "Uncategorised" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
        </Field>
        <Field label="Status" htmlFor="status" required>
          <Select
            id="status"
            name="status"
            defaultValue={project?.status ?? "COMPLETED"}
            options={PROJECT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          />
        </Field>
        <Field label="Completed date" htmlFor="completedAt">
          <TextInput
            id="completedAt"
            name="completedAt"
            type="date"
            defaultValue={project?.completedAt ? project.completedAt.toISOString().slice(0, 10) : ""}
          />
        </Field>
        <Field label="Location" htmlFor="location" hint="Only store when the customer permits publication.">
          <TextInput id="location" name="location" defaultValue={project?.location ?? ""} />
        </Field>
      </div>

      <Field label="Summary" htmlFor="summary" error={state.fieldErrors?.summary?.[0]}>
        <TextArea id="summary" name="summary" rows={2} defaultValue={project?.summary ?? ""} />
      </Field>

      <Field label="Full description" htmlFor="description" error={state.fieldErrors?.description?.[0]}>
        <TextArea id="description" name="description" rows={7} defaultValue={project?.description ?? ""} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Inspiration" htmlFor="inspiration">
          <TextArea id="inspiration" name="inspiration" rows={4} defaultValue={project?.inspiration ?? ""} />
        </Field>
        <Field label="Materials" htmlFor="materials">
          <TextArea id="materials" name="materials" rows={4} defaultValue={project?.materials ?? ""} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Dimensions" htmlFor="dimensions">
          <TextInput id="dimensions" name="dimensions" defaultValue={project?.dimensions ?? ""} />
        </Field>
        <SingleImage initial={project?.coverImage ?? ""} label="Cover image (defaults to first gallery image)" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="SEO title" htmlFor="seoTitle">
          <TextInput id="seoTitle" name="seoTitle" defaultValue={project?.seoTitle ?? ""} />
        </Field>
        <Field label="SEO description" htmlFor="seoDescription">
          <TextInput id="seoDescription" name="seoDescription" defaultValue={project?.seoDescription ?? ""} />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Checkbox id="published" name="published" defaultChecked={project?.published ?? false} label="Published (visible on the public portfolio)" />
        <Checkbox id="featured" name="featured" defaultChecked={project?.featured ?? false} label="Featured (shown on the homepage)" />
      </div>

      <ImageGallery initial={images ?? []} />

      <div className="flex gap-3">
        <SubmitButton disabled={pending}>{pending ? "Saving…" : project ? "Save changes" : "Create project"}</SubmitButton>
      </div>
    </form>
  );
}
