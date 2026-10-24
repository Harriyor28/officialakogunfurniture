"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveServicesAction, type AdminFormState } from "@/app/actions/admin/content";
import { Field, TextArea, TextInput, Checkbox } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";
import { FormAlert } from "@/components/admin/FormAlert";
import { SingleImage } from "@/components/admin/ImageGallery";

type ServiceEntry = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  published: boolean;
};

const initialState: AdminFormState = {};

function emptyService(): ServiceEntry {
  return { id: "", name: "", slug: "", description: "", image: "", order: 0, published: true };
}

export function ServicesForm({
  services,
}: {
  services: Array<Omit<ServiceEntry, "image"> & { image: string | null }>;
}) {
  const [state, formAction, pending] = useActionState(saveServicesAction, initialState);
  const router = useRouter();
  const [entries, setEntries] = useState<ServiceEntry[]>(() => [
    ...services.map((service) => ({ ...service, image: service.image ?? "" })),
    emptyService(),
  ]);

  useEffect(() => {
    if (state.success) router.refresh();
  }, [router, state.success]);

  function updateEntry(index: number, updates: Partial<ServiceEntry>) {
    setEntries((current) =>
      current.map((entry, entryIndex) => entryIndex === index ? { ...entry, ...updates } : entry),
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <FormAlert state={state} />
      <div className="space-y-5">
        {entries.map((service, index) => (
          <fieldset
            key={service.id || `new-service-${index}`}
            className="space-y-4 rounded-xl border border-ivory/10 p-4 sm:p-5"
          >
            <legend className="px-2 text-sm font-semibold text-ivory">
              {service.id ? service.name || "Existing service" : "New service"}
            </legend>
            <input type="hidden" name="serviceId" value={service.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Service name" htmlFor={`service-name-${index}`} required>
                <TextInput
                  id={`service-name-${index}`}
                  name={`serviceName_${index}`}
                  value={service.name}
                  onChange={(event) => updateEntry(index, { name: event.target.value })}
                  maxLength={120}
                  required={Boolean(service.id)}
                />
              </Field>
              <Field label="Page URL slug" htmlFor={`service-slug-${index}`} hint="Lowercase words separated by hyphens">
                <TextInput
                  id={`service-slug-${index}`}
                  name={`serviceSlug_${index}`}
                  value={service.slug}
                  onChange={(event) => updateEntry(index, { slug: event.target.value })}
                  maxLength={160}
                  placeholder="generated-from-name"
                />
              </Field>
            </div>
            <Field label="Description" htmlFor={`service-description-${index}`} required>
              <TextArea
                id={`service-description-${index}`}
                name={`serviceDescription_${index}`}
                rows={3}
                value={service.description}
                onChange={(event) => updateEntry(index, { description: event.target.value })}
                maxLength={1000}
                required={Boolean(service.id)}
              />
            </Field>
            <SingleImage
              initial={service.image}
              name={`serviceImage_${index}`}
              label="Service photo"
            />
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Field label="Display order" htmlFor={`service-order-${index}`} hint="Lower numbers appear first">
                <TextInput
                  id={`service-order-${index}`}
                  name={`serviceOrder_${index}`}
                  type="number"
                  min={0}
                  step={1}
                  value={service.order}
                  onChange={(event) => updateEntry(index, { order: Number(event.target.value) })}
                />
              </Field>
              <input type="hidden" name={`servicePublished_${index}`} value="off" />
              <Checkbox
                id={`service-published-${index}`}
                name={`servicePublished_${index}`}
                checked={service.published}
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
          onClick={() => setEntries((current) => [...current, emptyService()])}
        >
          Add another service
        </button>
        <SubmitButton disabled={pending}>
          {pending ? "Saving…" : "Save website services"}
        </SubmitButton>
      </div>
    </form>
  );
}
