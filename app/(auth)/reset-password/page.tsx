import type { Metadata } from "next";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl text-ivory">Invalid link</h1>
        <p className="text-sm text-muted">This password reset link is incomplete. Request a new one.</p>
      </div>
    );
  }
  return <ResetPasswordForm token={token} />;
}
