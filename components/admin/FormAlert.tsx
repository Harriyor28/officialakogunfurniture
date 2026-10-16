import type { AdminFormState } from "@/app/actions/admin/projects";

/** Success / error banner shared by admin forms. */
export function FormAlert({ state }: { state?: AdminFormState | null }) {
  if (!state) return null;
  if (state.error) {
    return (
      <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p role="status" className="rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
        {state.success}
      </p>
    );
  }
  return null;
}
