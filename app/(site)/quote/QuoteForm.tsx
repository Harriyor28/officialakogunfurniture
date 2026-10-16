"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitEnquiryAction, type EnquiryState } from "@/app/actions/public";
import { Checkbox, Field, Select, TextArea, TextInput } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";
import { BUDGET_RANGES, CONTACT_METHODS } from "@/lib/constants";

const initialState: EnquiryState = {};

export function QuoteForm({
  serviceOptions,
  defaultService,
}: {
  serviceOptions: Array<{ value: string; label: string }>;
  defaultService?: string;
}) {
  const [state, formAction, pending] = useActionState(submitEnquiryAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" required error={state.fieldErrors?.name?.[0]}>
          <TextInput id="name" name="name" autoComplete="name" required />
        </Field>
        <Field label="Phone number" htmlFor="phone" required error={state.fieldErrors?.phone?.[0]}>
          <TextInput id="phone" name="phone" type="tel" autoComplete="tel" required placeholder="0800 000 0000" />
        </Field>
        <Field label="Email address" htmlFor="email" required error={state.fieldErrors?.email?.[0]}>
          <TextInput id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </Field>
        <Field label="Preferred contact method" htmlFor="preferredContact" required error={state.fieldErrors?.preferredContact?.[0]}>
          <Select
            id="preferredContact"
            name="preferredContact"
            required
            defaultValue="PHONE"
            options={CONTACT_METHODS.map((method) => ({ value: method.value, label: method.label }))}
          />
        </Field>
        <Field label="Service category" htmlFor="serviceCategory" required error={state.fieldErrors?.serviceCategory?.[0]}>
          <Select
            id="serviceCategory"
            name="serviceCategory"
            required
            defaultValue={defaultService ?? ""}
            options={[{ value: "", label: "Select a service…" }, ...serviceOptions]}
          />
        </Field>
        <Field label="Furniture type" htmlFor="furnitureType" error={state.fieldErrors?.furnitureType?.[0]}>
          <TextInput id="furnitureType" name="furnitureType" placeholder="e.g. fitted wardrobe, kitchen cabinets" />
        </Field>
        <Field label="Project title" htmlFor="title" error={state.fieldErrors?.title?.[0]} className="sm:col-span-2">
          <TextInput id="title" name="title" placeholder="e.g. Master bedroom wardrobe" />
        </Field>
      </div>

      <Field
        label="Project requirements"
        htmlFor="requirements"
        required
        error={state.fieldErrors?.requirements?.[0]}
        hint="Describe the space, style, quantity and anything else that matters."
      >
        <TextArea id="requirements" name="requirements" required rows={6} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Preferred dimensions" htmlFor="dimensions" error={state.fieldErrors?.dimensions?.[0]}>
          <TextInput id="dimensions" name="dimensions" placeholder="e.g. 2400mm W × 2400mm H × 600mm D" />
        </Field>
        <Field label="Materials & finishes" htmlFor="materials" error={state.fieldErrors?.materials?.[0]}>
          <TextInput id="materials" name="materials" placeholder="e.g. walnut veneer, soft-close hinges" />
        </Field>
        <Field label="Quantity" htmlFor="quantity" error={state.fieldErrors?.quantity?.[0]}>
          <TextInput id="quantity" name="quantity" type="number" min={1} max={1000} placeholder="1" />
        </Field>
        <Field label="Budget range" htmlFor="budgetRange" error={state.fieldErrors?.budgetRange?.[0]}>
          <Select
            id="budgetRange"
            name="budgetRange"
            defaultValue=""
            options={[{ value: "", label: "Prefer not to say" }, ...BUDGET_RANGES.map((range) => ({ value: range, label: range }))]}
          />
        </Field>
        <Field label="Project location" htmlFor="location" error={state.fieldErrors?.location?.[0]}>
          <TextInput id="location" name="location" placeholder="City / area" />
        </Field>
        <Field label="Preferred completion date" htmlFor="preferredDate" error={state.fieldErrors?.preferredDate?.[0]}>
          <TextInput id="preferredDate" name="preferredDate" type="date" />
        </Field>
        <Field label="Reference images or design files" htmlFor="attachments" className="sm:col-span-2" hint="Optional — up to 5 files, 15MB each (images, PDF, zip).">
          <input id="attachments" name="attachments" type="file" multiple className="input" accept="image/*,.pdf,.zip,.txt" />
        </Field>
        <Field label="Additional comments" htmlFor="comments" className="sm:col-span-2" error={state.fieldErrors?.comments?.[0]}>
          <TextArea id="comments" name="comments" rows={3} />
        </Field>
      </div>

      <Checkbox
        id="privacyAccepted"
        name="privacyAccepted"
        required
        label={
          <>
            I acknowledge the{" "}
            <Link href="/privacy" target="_blank" className="text-gold underline underline-offset-2">
              privacy policy
            </Link>{" "}
            and agree to be contacted about this enquiry.
          </>
        }
      />
      {state.fieldErrors?.privacyAccepted?.[0] ? (
        <p className="field-error">{state.fieldErrors.privacyAccepted[0]}</p>
      ) : null}

      <SubmitButton disabled={pending} className="w-full sm:w-auto">
        {pending ? "Submitting…" : "Submit quotation request"}
      </SubmitButton>
    </form>
  );
}
