"use client";

import { useActionState, useMemo, useState } from "react";
import { saveQuotationAction, type AdminFormState } from "@/app/actions/admin/quotations";
import { Field, TextInput, TextArea, Select } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";
import { FormAlert } from "@/components/admin/FormAlert";
import { QUOTATION_STATUSES } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

type Item = { description: string; quantity: number; unitPrice: number };

const initialState: AdminFormState = {};

export function QuotationForm({
  quotation,
  items,
  enquiries,
  defaultEnquiryId,
}: {
  quotation?: {
    id: string;
    enquiryId: string;
    status: string;
    validUntil: Date | null;
    discount: number;
    delivery: number;
    notes: string | null;
    terms: string | null;
  };
  items?: Item[];
  enquiries: Array<{ id: string; reference: string; name: string }>;
  defaultEnquiryId?: string;
}) {
  const [state, formAction, pending] = useActionState(saveQuotationAction, initialState);
  const [rows, setRows] = useState<Item[]>(
    items && items.length > 0 ? items : [{ description: "", quantity: 1, unitPrice: 0 }],
  );
  const [discount, setDiscount] = useState(quotation?.discount ?? 0);
  const [delivery, setDelivery] = useState(quotation?.delivery ?? 0);
  const selectedEnquiryId = quotation?.enquiryId ?? defaultEnquiryId ?? "";

  const totals = useMemo(() => {
    const subtotal = rows.reduce((sum, row) => sum + (row.quantity || 0) * (row.unitPrice || 0), 0);
    return { subtotal, total: subtotal - (discount || 0) + (delivery || 0) };
  }, [rows, discount, delivery]);

  function updateRow(index: number, patch: Partial<Item>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <form action={formAction} className="space-y-6">
      <FormAlert state={state} />
      {quotation ? <input type="hidden" name="id" value={quotation.id} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Enquiry" htmlFor="enquiryId" required error={state.fieldErrors?.enquiryId?.[0]}>
          <Select
            id="enquiryId"
            name="enquiryId"
            required
            defaultValue={selectedEnquiryId}
            options={[
              { value: "", label: "Select an enquiry…" },
              ...enquiries.map((e) => ({ value: e.id, label: `${e.reference} — ${e.name}` })),
            ]}
          />
        </Field>
        <Field label="Status" htmlFor="status" required error={state.fieldErrors?.status?.[0]}>
          <Select
            id="status"
            name="status"
            defaultValue={quotation?.status ?? "DRAFT"}
            options={QUOTATION_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          />
        </Field>
        <Field label="Valid until" htmlFor="validUntil">
          <TextInput
            id="validUntil"
            name="validUntil"
            type="date"
            defaultValue={quotation?.validUntil ? quotation.validUntil.toISOString().slice(0, 10) : ""}
          />
        </Field>
      </div>

      <fieldset className="space-y-3">
        <legend className="label">Line items</legend>
        {state.fieldErrors?.items?.[0] ? <p className="field-error">{state.fieldErrors.items[0]}</p> : null}
        {rows.map((row, index) => (
          <div key={index} className="grid gap-3 rounded-lg border border-ivory/10 p-3 sm:grid-cols-[1fr_90px_130px_40px]">
            <div>
              <label className="sr-only" htmlFor={`item-desc-${index}`}>Item description</label>
              <input
                id={`item-desc-${index}`}
                name="itemDescription"
                value={row.description}
                onChange={(e) => updateRow(index, { description: e.target.value })}
                placeholder="Description"
                className="input"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor={`item-qty-${index}`}>Quantity</label>
              <input
                id={`item-qty-${index}`}
                name="itemQuantity"
                type="number"
                min={1}
                value={row.quantity}
                onChange={(e) => updateRow(index, { quantity: Number(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor={`item-price-${index}`}>Unit price (₦)</label>
              <input
                id={`item-price-${index}`}
                name="itemUnitPrice"
                type="number"
                min={0}
                value={row.unitPrice}
                onChange={(e) => updateRow(index, { unitPrice: Number(e.target.value) })}
                className="input"
              />
            </div>
            <button
              type="button"
              onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
              className="btn btn-ghost px-2 py-1 text-xs"
              aria-label={`Remove item ${index + 1}`}
              disabled={rows.length === 1}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }])}
          className="btn btn-ghost px-4 py-2 text-xs"
        >
          + Add item
        </button>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Discount (₦)" htmlFor="discount">
          <TextInput
            id="discount"
            name="discount"
            type="number"
            min={0}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
          />
        </Field>
        <Field label="Delivery (₦)" htmlFor="delivery">
          <TextInput
            id="delivery"
            name="delivery"
            type="number"
            min={0}
            value={delivery}
            onChange={(e) => setDelivery(Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="rounded-lg border border-gold/30 bg-gold/5 p-4 text-sm">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span>
          <span>{formatMoney(totals.subtotal)}</span>
        </div>
        <div className="mt-1 flex justify-between font-semibold text-gold">
          <span>Total</span>
          <span>{formatMoney(totals.total)}</span>
        </div>
      </div>

      <Field label="Notes to the customer" htmlFor="notes">
        <TextArea id="notes" name="notes" rows={4} defaultValue={quotation?.notes ?? ""} />
      </Field>
      <Field label="Terms" htmlFor="terms">
        <TextArea id="terms" name="terms" rows={4} defaultValue={quotation?.terms ?? ""} />
      </Field>

      <SubmitButton disabled={pending}>{pending ? "Saving…" : quotation ? "Save changes" : "Create quotation"}</SubmitButton>
    </form>
  );
}
