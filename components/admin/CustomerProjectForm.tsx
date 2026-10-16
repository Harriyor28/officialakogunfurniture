"use client";

import { useActionState } from "react";
import { saveCustomerProjectAction, type AdminFormState } from "@/app/actions/admin/customer-projects";
import { Field, TextInput, TextArea, Select } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";
import { FormAlert } from "@/components/admin/FormAlert";
import { CUSTOMER_PROJECT_STAGES, stagePercent } from "@/lib/constants";

const initialState: AdminFormState = {};

type Category = { id: string; name: string };

export function CustomerProjectForm({
  categories,
  project,
  defaultStatus = "CONSULTATION",
}: {
  categories: Category[];
  project?: {
    id: string;
    title: string;
    customerEmail: string;
    categoryId: string | null;
    status: string;
    summary: string | null;
    specifications: string | null;
    startDate: Date | null;
    expectedEndDate: Date | null;
    progressPercent: number;
    nextMilestone: string | null;
    internalNotes: string | null;
  };
  defaultStatus?: string;
}) {
  const [state, formAction, pending] = useActionState(saveCustomerProjectAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <FormAlert state={state} />
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Project title" htmlFor="title" required error={state.fieldErrors?.title?.[0]}>
          <TextInput id="title" name="title" required defaultValue={project?.title} />
        </Field>
        <Field
          label="Customer account email"
          htmlFor="customerEmail"
          required
          error={state.fieldErrors?.customerEmail?.[0]}
          hint={project ? "Changing this reassigns the project." : "The customer must already be registered."}
        >
          <TextInput
            id="customerEmail"
            name="customerEmail"
            type="email"
            required
            defaultValue={project?.customerEmail}
            placeholder="customer@example.com"
          />
        </Field>
        <Field label="Stage" htmlFor="status" required>
          <Select
            id="status"
            name="status"
            defaultValue={project?.status ?? defaultStatus}
            options={CUSTOMER_PROJECT_STAGES.map((s) => ({ value: s.value, label: `${s.label} (${s.percent}%)` }))}
          />
        </Field>
        <Field label="Category" htmlFor="categoryId">
          <Select
            id="categoryId"
            name="categoryId"
            defaultValue={project?.categoryId ?? ""}
            options={[{ value: "", label: "Uncategorised" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
        </Field>
        <Field label="Start date" htmlFor="startDate">
          <TextInput
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={project?.startDate ? project.startDate.toISOString().slice(0, 10) : ""}
          />
        </Field>
        <Field label="Expected completion" htmlFor="expectedEndDate">
          <TextInput
            id="expectedEndDate"
            name="expectedEndDate"
            type="date"
            defaultValue={project?.expectedEndDate ? project.expectedEndDate.toISOString().slice(0, 10) : ""}
          />
        </Field>
        <Field
          label="Progress %"
          htmlFor="progressPercent"
          hint={project ? undefined : "Leave blank to follow the stage default."}
        >
          <TextInput
            id="progressPercent"
            name="progressPercent"
            type="number"
            min={0}
            max={100}
            defaultValue={project ? project.progressPercent : stagePercent(defaultStatus)}
          />
        </Field>
        <Field label="Next milestone" htmlFor="nextMilestone">
          <TextInput id="nextMilestone" name="nextMilestone" defaultValue={project?.nextMilestone ?? ""} />
        </Field>
      </div>

      <Field label="Summary (shown to the customer)" htmlFor="summary" error={state.fieldErrors?.summary?.[0]}>
        <TextArea id="summary" name="summary" rows={3} defaultValue={project?.summary ?? ""} />
      </Field>
      <Field label="Specifications" htmlFor="specifications">
        <TextArea id="specifications" name="specifications" rows={4} defaultValue={project?.specifications ?? ""} />
      </Field>
      <Field label="Internal notes (never shown to the customer)" htmlFor="internalNotes">
        <TextArea id="internalNotes" name="internalNotes" rows={4} defaultValue={project?.internalNotes ?? ""} />
      </Field>

      <SubmitButton disabled={pending}>{pending ? "Saving…" : project ? "Save changes" : "Create project"}</SubmitButton>
    </form>
  );
}
