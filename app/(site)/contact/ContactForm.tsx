"use client";

import { useActionState } from "react";
import { submitContactAction, type EnquiryState } from "@/app/actions/public";
import { Checkbox, Field, TextArea, TextInput } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";

const initialState: EnquiryState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" required error={state.fieldErrors?.name?.[0]}>
          <TextInput id="name" name="name" autoComplete="name" required />
        </Field>
        <Field label="Email address" htmlFor="email" required error={state.fieldErrors?.email?.[0]}>
          <TextInput id="email" name="email" type="email" autoComplete="email" required />
        </Field>
      </div>

      <Field label="Phone number" htmlFor="phone" error={state.fieldErrors?.phone?.[0]}>
        <TextInput id="phone" name="phone" type="tel" autoComplete="tel" />
      </Field>

      <Field label="Message" htmlFor="message" required error={state.fieldErrors?.message?.[0]}>
        <TextArea id="message" name="message" required rows={6} placeholder="How can we help?" />
      </Field>

      <Checkbox
        id="privacyAccepted"
        name="privacyAccepted"
        required
        label="I acknowledge the privacy policy and agree to be contacted about this message."
      />
      {state.fieldErrors?.privacyAccepted?.[0] ? (
        <p className="field-error">{state.fieldErrors.privacyAccepted[0]}</p>
      ) : null}

      <SubmitButton disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </SubmitButton>
    </form>
  );
}
