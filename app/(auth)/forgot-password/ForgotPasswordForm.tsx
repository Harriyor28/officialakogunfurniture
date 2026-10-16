"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type AuthState } from "@/app/actions/auth";
import { Field, TextInput } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";

const initialState: AuthState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <h1 className="text-2xl text-ivory">Reset your password</h1>
        <p className="mt-2 text-sm text-muted">
          Enter the email used for your account. If it exists, a one-hour reset link will be created.
        </p>
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

      <Field label="Email address" htmlFor="email" required>
        <TextInput id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </Field>

      <SubmitButton className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </SubmitButton>
    </form>
  );
}
