import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/auth-forms";
import { DraftAuthLayout } from "@/features/try/draft-auth-layout";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage(props: PageProps<"/register">) {
  const { draft } = await props.searchParams;
  if (draft === "1") {
    return (
      <DraftAuthLayout title="Almost there" intro="Create a free account to save your invitation. You can keep editing, preview it and publish whenever you're ready.">
        <RegisterForm draft />
      </DraftAuthLayout>
    );
  }
  return (
    <>
      <h1 className="mb-2 text-center font-serif text-4xl">Create your account</h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">Start your wedding invitation in minutes.</p>
      <RegisterForm />
    </>
  );
}
