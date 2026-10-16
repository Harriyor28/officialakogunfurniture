"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  markQuotationSentAction,
  recordQuotationDecisionAction,
  type AdminFormState,
} from "@/app/actions/admin/quotations";
import { SubmitButton } from "@/components/ui/Button";
import { FormAlert } from "@/components/admin/FormAlert";
import { convertQuotationAction } from "@/app/actions/admin/customer-projects";

const initialState: AdminFormState = {};

export function QuotationActions({ quotationId, status }: { quotationId: string; status: string }) {
  const [sentState, sentAction, sentPending] = useActionState(markQuotationSentAction, initialState);
  const [decisionState, decisionAction, decisionPending] = useActionState(recordQuotationDecisionAction, initialState);

  const showSend = status === "DRAFT";
  const showDecision = status === "SENT";

  if (!showSend && !showDecision) return null;

  return (
    <div className="space-y-5">
      {showSend ? (
        <form action={sentAction} className="space-y-3">
          <FormAlert state={sentState} />
          <input type="hidden" name="quotationId" value={quotationId} />
          <SubmitButton className="w-full" disabled={sentPending}>
            {sentPending ? "Sending…" : "Email quotation to customer"}
          </SubmitButton>
          <p className="text-xs text-muted">
            Only marked as sent when the email provider confirms. Otherwise{" "}
            <Link href={`/admin/quotations/${quotationId}/pdf`} className="text-gold hover:text-gold-soft" target="_blank">
              download the PDF
            </Link>{" "}
            and send it manually.
          </p>
        </form>
      ) : null}

      {showDecision ? (
        <form action={decisionAction} className="space-y-3">
          <FormAlert state={decisionState} />
          <input type="hidden" name="quotationId" value={quotationId} />
          <div className="flex gap-3">
            <SubmitButton name="decision" value="APPROVED" className="flex-1" disabled={decisionPending}>
              Mark approved
            </SubmitButton>
            <SubmitButton name="decision" value="DECLINED" variant="danger" className="flex-1" disabled={decisionPending}>
              Mark declined
            </SubmitButton>
          </div>
          <p className="text-xs text-muted">Record the customer&apos;s decision (e.g. after a phone call). Customers can also approve from their portal.</p>
        </form>
      ) : null}
    </div>
  );
}

export function ConvertQuotationForm({ quotationId, defaultTitle }: { quotationId: string; defaultTitle: string }) {
  const [state, formAction, pending] = useActionState(convertQuotationAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <FormAlert state={state} />
      <input type="hidden" name="quotationId" value={quotationId} />
      <label className="label" htmlFor="convert-title">
        Project title
      </label>
      <input id="convert-title" name="title" defaultValue={defaultTitle} className="input" required minLength={2} />
      <SubmitButton variant="secondary" className="w-full" disabled={pending}>
        {pending ? "Converting…" : "Convert to customer project"}
      </SubmitButton>
      <p className="text-xs text-muted">
        The customer must have a registered account with this enquiry&apos;s email address.
      </p>
    </form>
  );
}
