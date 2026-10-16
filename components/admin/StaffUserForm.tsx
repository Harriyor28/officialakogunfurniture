"use client";

import { useActionState } from "react";
import { saveStaffUserAction, type AdminFormState } from "@/app/actions/admin/settings";
import { Field, TextInput, Select, Checkbox } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";
import { FormAlert } from "@/components/admin/FormAlert";

const initialState: AdminFormState = {};

const ROLES = [
  { value: "SUPER_ADMIN", label: "Super admin (full access)" },
  { value: "ADMIN", label: "Admin (everything except users)" },
  { value: "PROJECT_MANAGER", label: "Project manager" },
  { value: "STAFF", label: "Staff (enquiries & project updates)" },
];

export function StaffUserForm({
  user,
  editingSelf,
}: {
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    active: boolean;
  };
  editingSelf?: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveStaffUserAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <FormAlert state={state} />
      {user ? <input type="hidden" name="id" value={user.id} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="user-name" required error={state.fieldErrors?.name?.[0]}>
          <TextInput id="user-name" name="name" required defaultValue={user?.name} />
        </Field>
        <Field label="Email" htmlFor="user-email" required error={state.fieldErrors?.email?.[0]}>
          <TextInput id="user-email" name="email" type="email" required defaultValue={user?.email} />
        </Field>
        <Field label="Phone" htmlFor="user-phone">
          <TextInput id="user-phone" name="phone" defaultValue={user?.phone ?? ""} />
        </Field>
        <Field label="Role" htmlFor="user-role" required error={state.fieldErrors?.role?.[0]}>
          <Select
            id="user-role"
            name="role"
            defaultValue={user?.role ?? "STAFF"}
            disabled={editingSelf}
            options={ROLES}
          />
        </Field>
      </div>

      <Field
        label={user ? "Password" : "Initial password"}
        htmlFor="user-password"
        required={!user}
        error={state.fieldErrors?.password?.[0]}
        hint={user ? "Leave unchanged unless resetting — untick the box below to keep the current password." : "At least 10 characters."}
      >
        <TextInput
          id="user-password"
          name="password"
          type="password"
          required={!user}
          autoComplete="new-password"
        />
      </Field>

      {user ? (
        <Checkbox id="changePassword" name="changePassword" label="Change password to the value above" />
      ) : null}

      <Checkbox id="user-active" name="active" defaultChecked={user ? user.active : true} label="Active (can sign in)" />

      <SubmitButton disabled={pending}>{pending ? "Saving…" : user ? "Save user" : "Create user"}</SubmitButton>
    </form>
  );
}
