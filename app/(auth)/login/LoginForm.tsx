"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthState } from "@/app/actions/auth";
import { Field, TextInput } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";

const initialState: AuthState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const isStaffLogin = next === "/admin" || next?.startsWith("/admin/");

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <h1 className="text-2xl text-ivory">{isStaffLogin ? "Staff sign in" : "Customer login"}</h1>
        <p className="mt-2 text-sm text-muted">
          {isStaffLogin
            ? "Authorized staff only. Sign in with your work account."
            : "Sign in to track your projects and quotations."}
        </p>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <input type="hidden" name="next" value={next ?? ""} />

      <Field label="Email address" htmlFor="email" required error={state.fieldErrors?.email?.[0]}>
        <TextInput id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </Field>

      <Field label="Password" htmlFor="password" required error={state.fieldErrors?.password?.[0]}>
        <TextInput id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>

      <SubmitButton className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </SubmitButton>

      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-muted hover:text-gold">
          Forgot password?
        </Link>
        {!isStaffLogin ? (
          <Link href="/register" className="text-gold hover:text-gold-soft">
            Create an account
          </Link>
        ) : null}
      </div>
    </form>
  );
}
