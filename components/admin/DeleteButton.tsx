"use client";

import { useRef, useState, useTransition } from "react";

/**
 * Confirmation-gated delete button for admin tables.
 * Runs the given server action with the given fields.
 */
export function DeleteButton({
  action,
  formData,
  label = "Delete",
  confirmText = "Are you sure? This cannot be undone.",
}: {
  action: (formData: FormData) => Promise<void> | void;
  formData: Record<string, string>;
  label?: string;
  confirmText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-danger px-3 py-1.5 text-xs">
        {label}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-xs text-muted">{confirmText}</span>
      <form
        ref={formRef}
        action={() => {
          const data = new FormData();
          for (const [key, value] of Object.entries(formData)) data.append(key, value);
          startTransition(async () => {
            await action(data);
            setOpen(false);
          });
        }}
        className="inline-flex gap-2"
      >
        <button type="submit" className="btn btn-danger px-3 py-1.5 text-xs" disabled={pending}>
          {pending ? "…" : "Confirm"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost px-3 py-1.5 text-xs">
          Cancel
        </button>
      </form>
    </span>
  );
}
