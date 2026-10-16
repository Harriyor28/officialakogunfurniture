"use client";

import { useActionState } from "react";
import { saveProductAction, type AdminFormState } from "@/app/actions/admin/products";
import { Field, TextInput, TextArea, Select, Checkbox } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";
import { FormAlert } from "@/components/admin/FormAlert";
import { ImageGallery } from "@/components/admin/ImageGallery";
import { PRODUCT_AVAILABILITY } from "@/lib/constants";

type Category = { id: string; name: string };
type ExistingImage = { url: string; alt: string };

const initialState: AdminFormState = {};

export function ProductForm({
  categories,
  product,
  images,
}: {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    slug: string;
    categoryId: string | null;
    summary: string | null;
    description: string | null;
    dimensions: string | null;
    materials: string | null;
    colours: string | null;
    priceFrom: number | null;
    priceTo: number | null;
    availability: string;
    leadTime: string | null;
    customisable: boolean;
    featured: boolean;
    published: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
  };
  images?: ExistingImage[];
}) {
  const [state, formAction, pending] = useActionState(saveProductAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <FormAlert state={state} />
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Product name" htmlFor="name" required error={state.fieldErrors?.name?.[0]}>
          <TextInput id="name" name="name" required defaultValue={product?.name} />
        </Field>
        <Field
          label="URL slug"
          htmlFor="slug"
          error={state.fieldErrors?.slug?.[0]}
          hint={product ? undefined : "Leave blank to generate from the name."}
        >
          <TextInput id="slug" name="slug" defaultValue={product?.slug} placeholder="auto-generated" />
        </Field>
        <Field label="Category" htmlFor="categoryId">
          <Select
            id="categoryId"
            name="categoryId"
            defaultValue={product?.categoryId ?? ""}
            options={[{ value: "", label: "Uncategorised" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
        </Field>
        <Field label="Availability" htmlFor="availability" required>
          <Select
            id="availability"
            name="availability"
            defaultValue={product?.availability ?? "ASK"}
            options={PRODUCT_AVAILABILITY.map((a) => ({ value: a.value, label: a.label }))}
          />
        </Field>
        <Field
          label="Price from (₦)"
          htmlFor="priceFrom"
          hint="Only enter a real price — leave blank for 'price on request'."
        >
          <TextInput id="priceFrom" name="priceFrom" type="number" min={0} defaultValue={product?.priceFrom ?? ""} />
        </Field>
        <Field label="Price to (₦)" htmlFor="priceTo">
          <TextInput id="priceTo" name="priceTo" type="number" min={0} defaultValue={product?.priceTo ?? ""} />
        </Field>
        <Field label="Lead time" htmlFor="leadTime" hint='e.g. "4–6 weeks". Leave blank if unknown.'>
          <TextInput id="leadTime" name="leadTime" defaultValue={product?.leadTime ?? ""} />
        </Field>
        <Field label="Dimensions" htmlFor="dimensions">
          <TextInput id="dimensions" name="dimensions" defaultValue={product?.dimensions ?? ""} />
        </Field>
      </div>

      <Field label="Summary" htmlFor="summary" error={state.fieldErrors?.summary?.[0]}>
        <TextArea id="summary" name="summary" rows={2} defaultValue={product?.summary ?? ""} />
      </Field>

      <Field label="Full description" htmlFor="description" error={state.fieldErrors?.description?.[0]}>
        <TextArea id="description" name="description" rows={7} defaultValue={product?.description ?? ""} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Materials" htmlFor="materials">
          <TextArea id="materials" name="materials" rows={3} defaultValue={product?.materials ?? ""} />
        </Field>
        <Field label="Colours / finishes" htmlFor="colours">
          <TextArea id="colours" name="colours" rows={3} defaultValue={product?.colours ?? ""} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="SEO title" htmlFor="seoTitle">
          <TextInput id="seoTitle" name="seoTitle" defaultValue={product?.seoTitle ?? ""} />
        </Field>
        <Field label="SEO description" htmlFor="seoDescription">
          <TextInput id="seoDescription" name="seoDescription" defaultValue={product?.seoDescription ?? ""} />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Checkbox id="published" name="published" defaultChecked={product?.published ?? false} label="Published (visible in the catalogue)" />
        <Checkbox id="featured" name="featured" defaultChecked={product?.featured ?? false} label="Featured" />
        <Checkbox id="customisable" name="customisable" defaultChecked={product?.customisable ?? true} label="Customisable" />
      </div>

      <ImageGallery initial={images ?? []} />

      <SubmitButton disabled={pending}>{pending ? "Saving…" : product ? "Save changes" : "Create product"}</SubmitButton>
    </form>
  );
}
