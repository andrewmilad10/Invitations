import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/auth-forms";

export const metadata: Metadata = { title: "Forgot your password?" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-2 text-center font-serif text-4xl">Forgot your password?</h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">Enter your email and we&apos;ll send you a link to choose a new one.</p>
      <ForgotPasswordForm />
    </>
  );
}
