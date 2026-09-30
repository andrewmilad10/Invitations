"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SaveDraftAfterAuth } from "@/features/try/save-draft-after-auth";
import { signIn, signUp, type AuthFormState } from "../actions";

export function LoginForm({ next, draft = false }: { next?: string; draft?: boolean }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signIn, {});
  if (state.signedIn) return <SaveDraftAfterAuth />;
  return (
    <form action={action} className="grid gap-5" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {draft ? <input type="hidden" name="intent" value="draft" /> : null}
      <FormMessage>{state.error}</FormMessage>
      <Field id="email" label="Email" error={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          aria-invalid={Boolean(state.fieldErrors?.email)}
        />
      </Field>
      <Field id="password" label="Password" error={state.fieldErrors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
        />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Signing in…" : "Log in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href={draft ? "/register?draft=1" : "/register"} className="font-medium text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ draft = false }: { draft?: boolean }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signUp, {});
  if (state.signedIn) return <SaveDraftAfterAuth />;
  if (state.info) {
    return <FormMessage tone="info">{state.info}</FormMessage>;
  }
  return (
    <form action={action} className="grid gap-5" noValidate>
      {draft ? <input type="hidden" name="intent" value="draft" /> : null}
      <FormMessage>{state.error}</FormMessage>
      <Field id="fullName" label="Your name" error={state.fieldErrors?.fullName}>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          required
          defaultValue={state.values?.fullName}
          aria-invalid={Boolean(state.fieldErrors?.fullName)}
        />
      </Field>
      <Field id="email" label="Email" error={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          aria-invalid={Boolean(state.fieldErrors?.email)}
        />
      </Field>
      <Field id="password" label="Password" error={state.fieldErrors?.password} hint="At least 8 characters.">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={Boolean(state.fieldErrors?.password)}
        />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Creating account…" : draft ? "Create invitation" : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={draft ? "/login?draft=1" : "/login"} className="font-medium text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </form>
  );
}
