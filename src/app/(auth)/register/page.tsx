import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/auth-forms";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-2 text-center font-serif text-4xl">Create your account</h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">Start your wedding invitation in minutes.</p>
      <RegisterForm />
    </>
  );
}
