"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveCategoriesAction, type AdminFormState } from "@/app/actions/admin/content";
import { Checkbox, Field, TextArea, TextInput } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";
import { FormAlert } from "@/components/admin/FormAlert";

type CategoryEntry = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  published: boolean;
};

const initialState: AdminFormState = {};

function emptyCategory(): CategoryEntry {
  return { id: "", name: "", slug: "", description: "", image: "", order: 0, published: true };
}

export function CategoriesForm({ categories }: { categories: CategoryEntry[] }) {
  const [state, formAction, pending] = useActionState(saveCategoriesAction, initialState);
  const router = useRouter();
  const [entries, setEntries] = useState<CategoryEntry[]>(() => [
    ...categories.map((category) => ({ ...category })),
    emptyCategory(),
  ]);

  useEffect(() => {
    if (state.success) router.refresh();
  }, [router, state.success]);

  function updateEntry(index: number, updates: Partial<CategoryEntry>) {
    setEntries((current) =>
      current.map((entry, entryIndex) => entryIndex === index ? { ...entry, ...updates } : entry),
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <FormAlert state={state} />
      <div className="space-y-5">
        {entries.map((category, index) => (
          <fieldset
            key={category.id || `new-category-${index}`}
            className="space-y-4 rounded-xl border border-ivory/10 p-4 sm:p-5"
          >
            <legend className="px-2 text-sm font-semibold text-ivory">
              {category.id ? category.name || "Existing category" : "New category"}
            </legend>
            <input type="hidden" name="categoryId" value={category.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category name" htmlFor={`category-name-${index}`} required>
                <TextInput
                  id={`category-name-${index}`}
                  name={`categoryName_${index}`}
                  value={category.name}
                  onChange={(event) => updateEntry(index, { name: event.target.value })}
                  maxLength={120}
                  required={Boolean(category.id)}
                />
              </Field>
              <Field label="Page URL slug" htmlFor={`category-slug-${index}`} hint="Lowercase words separated by hyphens">
                <TextInput
                  id={`category-slug-${index}`}
                  name={`categorySlug_${index}`}
                  value={category.slug}
                  onChange={(event) => updateEntry(index, { slug: event.target.value })}
                  maxLength={160}
                  placeholder="generated-from-name"
                />
              </Field>
            </div>
            <Field label="Short description" htmlFor={`category-description-${index}`}>
              <TextArea
                id={`category-description-${index}`}
                name={`categoryDescription_${index}`}
                rows={2}
                value={category.description}
                onChange={(event) => updateEntry(index, { description: event.target.value })}
                maxLength={1000}
              />
            </Field>
            <Field label="Image URL" htmlFor={`category-image-${index}`} hint="Optional. Use a public image URL.">
              <TextInput
                id={`category-image-${index}`}
                name={`categoryImage_${index}`}
                type="url"
                value={category.image}
                onChange={(event) => updateEntry(index, { image: event.target.value })}
                maxLength={2000}
              />
            </Field>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Field label="Display order" htmlFor={`category-order-${index}`} hint="Lower numbers appear first">
                <TextInput
                  id={`category-order-${index}`}
                  name={`categoryOrder_${index}`}
                  type="number"
                  min={0}
                  step={1}
                  value={category.order}
                  onChange={(event) => updateEntry(index, { order: Number(event.target.value) })}
                />
              </Field>
              <input type="hidden" name={`categoryPublished_${index}`} value="off" />
              <Checkbox
                id={`category-published-${index}`}
                name={`categoryPublished_${index}`}
                checked={category.published}
                onChange={(event) => updateEntry(index, { published: event.target.checked })}
                label="Published on the public website"
              />
            </div>
          </fieldset>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setEntries((current) => [...current, emptyCategory()])}
        >
          Add another category
        </button>
        <SubmitButton disabled={pending}>
          {pending ? "Saving…" : "Save furniture categories"}
        </SubmitButton>
      </div>
    </form>
  );
}
