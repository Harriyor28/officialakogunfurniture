"use client";

import { useActionState } from "react";
import {
  addProjectUpdateAction,
  addMilestoneAction,
  type AdminFormState,
} from "@/app/actions/admin/customer-projects";
import { Field, TextInput, TextArea, Select, Checkbox } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";
import { FormAlert } from "@/components/admin/FormAlert";
import { CUSTOMER_PROJECT_STAGES } from "@/lib/constants";

const initialState: AdminFormState = {};

export function ProjectUpdateForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState(addProjectUpdateAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <FormAlert state={state} />
      <input type="hidden" name="projectId" value={projectId} />

      <Field label="Update title" htmlFor="update-title" required error={state.fieldErrors?.title?.[0]}>
        <TextInput id="update-title" name="title" required placeholder="Materials delivered to the workshop" />
      </Field>
      <Field label="What happened" htmlFor="update-description" required error={state.fieldErrors?.description?.[0]}>
        <TextArea id="update-description" name="description" required rows={4} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Stage reached" htmlFor="update-stage" hint="Optionally advances the project stage.">
          <Select
            id="update-stage"
            name="stage"
            defaultValue=""
            options={[{ value: "", label: "Keep current stage" }, ...CUSTOMER_PROJECT_STAGES.map((s) => ({ value: s.value, label: s.label }))]}
          />
        </Field>
        <Field label="Image URL (optional)" htmlFor="update-image">
          <TextInput id="update-image" name="imageUrl" placeholder="/uploads/…" />
        </Field>
      </div>
      <Checkbox id="update-visible" name="visibleToCustomer" defaultChecked label="Visible to the customer (they receive an email)" />
      <SubmitButton disabled={pending}>{pending ? "Adding…" : "Add update"}</SubmitButton>
    </form>
  );
}

export function MilestoneForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState(addMilestoneAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormAlert state={state} />
      <input type="hidden" name="projectId" value={projectId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Milestone" htmlFor="ms-name" required error={state.fieldErrors?.name?.[0]}>
          <TextInput id="ms-name" name="name" required placeholder="Design sign-off" />
        </Field>
        <Field label="Due date" htmlFor="ms-due">
          <TextInput id="ms-due" name="dueDate" type="date" />
        </Field>
        <Field label="Status" htmlFor="ms-status">
          <Select
            id="ms-status"
            name="status"
            defaultValue="PENDING"
            options={[
              { value: "PENDING", label: "Pending" },
              { value: "IN_PROGRESS", label: "In progress" },
              { value: "DONE", label: "Done" },
            ]}
          />
        </Field>
      </div>
      <Checkbox id="ms-visible" name="visible" defaultChecked label="Visible to the customer" />
      <SubmitButton variant="secondary" size="sm" disabled={pending}>
        {pending ? "Adding…" : "Add milestone"}
      </SubmitButton>
    </form>
  );
}
