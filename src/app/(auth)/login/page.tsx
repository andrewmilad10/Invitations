import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/auth-forms";
import { safeRedirectPath } from "@/features/auth/schemas";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const { next, error } = await props.searchParams;
  const nextPath = typeof next === "string" ? safeRedirectPath(next) : undefined;
  return (
    <>
      <h1 className="mb-2 text-center font-serif text-4xl">Welcome back</h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">Log in to continue with your invitation.</p>
      {error === "confirm" ? (
        <p role="alert" className="mb-5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          That confirmation link is invalid or has expired. Please log in or register again.
        </p>
      ) : null}
      <LoginForm next={nextPath} />
    </>
  );
}
