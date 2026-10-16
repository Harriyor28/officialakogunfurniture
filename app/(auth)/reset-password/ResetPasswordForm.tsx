"use client";

import { useActionState } from "react";
import { resetPasswordAction, type AuthState } from "@/app/actions/auth";
import { Field, TextInput } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";

const initialState: AuthState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <h1 className="text-2xl text-ivory">Choose a new password</h1>
        <p className="mt-2 text-sm text-muted">This link can only be used once.</p>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          {state.success}
        </p>
      ) : null}

      <input type="hidden" name="token" value={token} />

      <Field label="New password" htmlFor="password" required error={state.fieldErrors?.password?.[0]} hint="At least 8 characters.">
        <TextInput id="password" name="password" type="password" autoComplete="new-password" required />
      </Field>

      <Field label="Confirm password" htmlFor="confirmPassword" required error={state.fieldErrors?.confirmPassword?.[0]}>
        <TextInput id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
      </Field>

      <SubmitButton className="w-full" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </SubmitButton>
    </form>
  );
}
