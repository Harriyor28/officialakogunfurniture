"use client";

import { useActionState } from "react";
import {
  saveSettingsAction,
  saveProcessAction,
  saveHomepageCopyAction,
  type AdminFormState,
} from "@/app/actions/admin/settings";
import { Field, TextInput, TextArea, Checkbox } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";
import { FormAlert } from "@/components/admin/FormAlert";
import { SingleImage, SingleVideo } from "@/components/admin/ImageGallery";

const initialState: AdminFormState = {};

type Settings = {
  businessName: string;
  logoUrl: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  facebook: string;
  instagram: string;
  twitter: string;
  aboutBody: string;
  footerNote: string;
  contentIsDemo: boolean;
};

export function BusinessSettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <FormAlert state={state} />
      <div className="rounded-xl border border-ivory/10 bg-obsidian/35 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-ivory">Website logo</h3>
        <p className="mb-4 mt-1 text-xs leading-relaxed text-muted">
          Upload the logo used on both the public website and the private staff workspace. A clear transparent PNG, WebP, or SVG works best.
        </p>
        <SingleImage initial={settings.logoUrl} name="logoUrl" label="Brand logo" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Business name" htmlFor="businessName" required error={state.fieldErrors?.businessName?.[0]}>
          <TextInput id="businessName" name="businessName" required defaultValue={settings.businessName} />
        </Field>
        <Field label="Tagline" htmlFor="tagline">
          <TextInput id="tagline" name="tagline" defaultValue={settings.tagline} />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <TextInput id="phone" name="phone" defaultValue={settings.phone} />
        </Field>
        <Field label="WhatsApp number" htmlFor="whatsapp" hint="International format, e.g. 2348012345678">
          <TextInput id="whatsapp" name="whatsapp" defaultValue={settings.whatsapp} />
        </Field>
        <Field label="Email" htmlFor="email">
          <TextInput id="email" name="email" type="email" defaultValue={settings.email} />
        </Field>
        <Field label="Opening hours" htmlFor="hours">
          <TextInput id="hours" name="hours" defaultValue={settings.hours} />
        </Field>
      </div>
      <Field label="Address" htmlFor="address">
        <TextArea id="address" name="address" rows={2} defaultValue={settings.address} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Facebook URL" htmlFor="facebook">
          <TextInput id="facebook" name="facebook" defaultValue={settings.facebook} />
        </Field>
        <Field label="Instagram URL" htmlFor="instagram">
          <TextInput id="instagram" name="instagram" defaultValue={settings.instagram} />
        </Field>
        <Field label="X / Twitter URL" htmlFor="twitter">
          <TextInput id="twitter" name="twitter" defaultValue={settings.twitter} />
        </Field>
      </div>
      <Field label="About page body" htmlFor="aboutBody">
        <TextArea id="aboutBody" name="aboutBody" rows={6} defaultValue={settings.aboutBody} />
      </Field>
      <Field label="Footer note" htmlFor="footerNote">
        <TextInput id="footerNote" name="footerNote" defaultValue={settings.footerNote} />
      </Field>
      <Checkbox
        id="contentIsDemo"
        name="contentIsDemo"
        defaultChecked={settings.contentIsDemo}
        label="Show the “demo content” banner — turn this off once real content is in place"
      />
      <SubmitButton disabled={pending}>{pending ? "Saving…" : "Save settings"}</SubmitButton>
    </form>
  );
}

export function ProcessStepsForm({ steps }: { steps: Array<{ title: string; description: string }> }) {
  const [state, formAction, pending] = useActionState(saveProcessAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormAlert state={state} />
      <ul className="space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="grid gap-3 rounded-lg border border-ivory/10 p-3 sm:grid-cols-[220px_1fr]">
            <div>
              <label className="sr-only" htmlFor={`step-title-${index}`}>Step {index + 1} title</label>
              <input
                id={`step-title-${index}`}
                name="stepTitle"
                defaultValue={step.title}
                placeholder="Step title"
                className="input"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor={`step-desc-${index}`}>Step {index + 1} description</label>
              <input
                id={`step-desc-${index}`}
                name="stepDescription"
                defaultValue={step.description}
                placeholder="Description"
                className="input"
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-3">
        <SubmitButton variant="secondary" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save process steps"}
        </SubmitButton>
      </div>
    </form>
  );
}

type HomepageCopy = {
  heroHeadline: string;
  heroSub: string;
  ctaHeadline: string;
  ctaSub: string;
  heroVideoUrl?: string;
  heroVideoPoster?: string;
};

export function HomepageCopyForm({ copy }: { copy: HomepageCopy }) {
  const [state, formAction, pending] = useActionState(saveHomepageCopyAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <FormAlert state={state} />

      <div className="space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">Hero section copy</h3>
        <Field label="Hero headline" htmlFor="heroHeadline" required error={state.fieldErrors?.heroHeadline?.[0]}>
          <TextInput id="heroHeadline" name="heroHeadline" required defaultValue={copy.heroHeadline} />
        </Field>
        <Field label="Hero supporting line" htmlFor="heroSub">
          <TextArea id="heroSub" name="heroSub" rows={2} defaultValue={copy.heroSub} />
        </Field>
      </div>

      <div className="border-t border-ivory/10 pt-5 space-y-5">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">Hero background video</h3>
          <p className="mt-1 text-xs text-muted">
            The ambient craftsmanship video playing behind the hero headline and introduction text.
          </p>
        </div>

        <SingleVideo
          initial={copy.heroVideoUrl || "/demo/atelier-motion.mp4"}
          name="heroVideoUrl"
          label="Hero video"
          hint="Upload an MP4 or WebM video (up to 40MB) or enter a video URL (/uploads/..., /demo/atelier-motion.mp4, or an external CDN URL)."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SingleImage
            initial={copy.heroVideoPoster || "/demo/workshop-1.svg"}
            name="heroVideoPoster"
            label="Video fallback poster image"
          />
        </div>
      </div>

      <div className="border-t border-ivory/10 pt-5 space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">Call-to-action section</h3>
        <Field label="Call-to-action headline" htmlFor="ctaHeadline" required error={state.fieldErrors?.ctaHeadline?.[0]}>
          <TextInput id="ctaHeadline" name="ctaHeadline" required defaultValue={copy.ctaHeadline} />
        </Field>
        <Field label="Call-to-action supporting line" htmlFor="ctaSub">
          <TextArea id="ctaSub" name="ctaSub" rows={2} defaultValue={copy.ctaSub} />
        </Field>
      </div>

      <SubmitButton variant="secondary" disabled={pending}>
        {pending ? "Saving…" : "Save homepage copy & video"}
      </SubmitButton>
    </form>
  );
}
