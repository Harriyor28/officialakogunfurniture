"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type AuthState } from "@/app/actions/auth";
import { Field, TextInput } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";

const initialState: AuthState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <h1 className="text-2xl text-ivory">Create your account</h1>
        <p className="mt-2 text-sm text-muted">
          Accounts are only required to track your projects — browsing and first enquiries stay open to everyone.
        </p>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <Field label="Full name" htmlFor="name" required error={state.fieldErrors?.name?.[0]}>
        <TextInput id="name" name="name" autoComplete="name" required />
      </Field>

      <Field label="Email address" htmlFor="email" required error={state.fieldErrors?.email?.[0]}>
        <TextInput id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </Field>

      <Field label="Phone number" htmlFor="phone" error={state.fieldErrors?.phone?.[0]} hint="Used for project communication.">
        <TextInput id="phone" name="phone" type="tel" autoComplete="tel" placeholder="0800 000 0000" />
      </Field>

      <Field label="Password" htmlFor="password" required error={state.fieldErrors?.password?.[0]} hint="At least 8 characters.">
        <TextInput id="password" name="password" type="password" autoComplete="new-password" required />
      </Field>

      <Field label="Confirm password" htmlFor="confirmPassword" required error={state.fieldErrors?.confirmPassword?.[0]}>
        <TextInput id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
      </Field>

      <SubmitButton className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </SubmitButton>

      <p className="text-center text-sm text-muted">
        Already registered?{" "}
        <Link href="/login" className="text-gold hover:text-gold-soft">Sign in</Link>
      </p>
    </form>
  );
}
