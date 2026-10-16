"use client";

import { useActionState } from "react";
import { approveQuotationAction, type PortalActionState } from "@/app/actions/portal";
import { SubmitButton } from "@/components/ui/Button";

const initialState: PortalActionState = {};

export function ApproveQuotationForm({ quotationId }: { quotationId: string }) {
  const [state, formAction, pending] = useActionState(approveQuotationAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="quotationId" value={quotationId} />
      {state.error ? (
        <p role="alert" className="text-sm text-danger">{state.error}</p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-sm text-success">{state.success}</p>
      ) : null}
      <SubmitButton disabled={pending}>
        {pending ? "Accepting…" : "Accept this quotation"}
      </SubmitButton>
    </form>
  );
}
