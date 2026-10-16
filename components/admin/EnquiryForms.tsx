"use client";

import { useActionState } from "react";
import { updateEnquiryAction, sendEnquiryEmailAction, type AdminFormState } from "@/app/actions/admin/enquiries";
import { Field, Select, TextArea } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";
import { FormAlert } from "@/components/admin/FormAlert";
import { ENQUIRY_STATUSES } from "@/lib/constants";

const initialState: AdminFormState = {};

export function EnquiryStatusForm({
  enquiry,
  staff,
}: {
  enquiry: { id: string; status: string; internalNotes: string | null; assignedToId: string | null };
  staff: Array<{ id: string; name: string }>;
}) {
  const [state, formAction, pending] = useActionState(updateEnquiryAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <FormAlert state={state} />
      <input type="hidden" name="enquiryId" value={enquiry.id} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Status" htmlFor="status" required>
          <Select
            id="status"
            name="status"
            defaultValue={enquiry.status}
            options={ENQUIRY_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          />
        </Field>
        <Field label="Assigned to" htmlFor="assignedToId">
          <Select
            id="assignedToId"
            name="assignedToId"
            defaultValue={enquiry.assignedToId ?? ""}
            options={[{ value: "", label: "Unassigned" }, ...staff.map((s) => ({ value: s.id, label: s.name }))]}
          />
        </Field>
      </div>

      <Field label="Internal notes (never shown to the customer)" htmlFor="internalNotes">
        <TextArea id="internalNotes" name="internalNotes" rows={5} defaultValue={enquiry.internalNotes ?? ""} />
      </Field>

      <SubmitButton disabled={pending}>{pending ? "Saving…" : "Save enquiry"}</SubmitButton>
    </form>
  );
}

export function EnquiryEmailForm({ enquiryId }: { enquiryId: string }) {
  const [state, formAction, pending] = useActionState(sendEnquiryEmailAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormAlert state={state} />
      <input type="hidden" name="enquiryId" value={enquiryId} />
      <Field label="Message to the customer" htmlFor="message" required error={state.fieldErrors?.message?.[0]}>
        <TextArea id="message" name="message" rows={5} placeholder="Hello — thank you for your enquiry…" />
      </Field>
      <SubmitButton variant="secondary" disabled={pending}>
        {pending ? "Sending…" : "Send email"}
      </SubmitButton>
      <p className="text-xs text-muted">
        The message is only marked as sent when the email provider confirms delivery; otherwise it is logged as
        skipped/failed and you can copy the text manually.
      </p>
    </form>
  );
}
