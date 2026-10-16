import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Register to track your furniture projects and quotations.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
