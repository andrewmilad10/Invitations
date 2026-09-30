"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createWedding } from "../actions";
import { TemplatePicker, type TemplateOption } from "./template-picker";

type Errors = Record<string, string[] | undefined>;

const STEPS = ["Couple", "Date", "Template", "Create"] as const;

export function CreateWeddingWizard({ templates, defaultTemplateId }: { templates: TemplateOption[]; defaultTemplateId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [partnerOne, setPartnerOne] = useState("");
  const [partnerTwo, setPartnerTwo] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [dateUndecided, setDateUndecided] = useState(false);
  const [templateId, setTemplateId] = useState(defaultTemplateId);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const template = templates.find((t) => t.id === templateId);

  function validate(current: number): Errors {
    const e: Errors = {};
    if (current === 0) {
      if (!partnerOne.trim()) e.partnerOne = ["Enter the first name."];
      if (!partnerTwo.trim()) e.partnerTwo = ["Enter the second name."];
    }
    if (current === 1 && !dateUndecided && !weddingDate) e.weddingDate = ["Choose a date, or tick “We haven't set a date yet”."];
    if (current === 2 && !templateId) e.templateId = ["Choose a template."];
    return e;
  }

  function next() {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function submit() {
    setFormError(undefined);
    startTransition(async () => {
      const result = await createWedding({
        partnerOne,
        partnerTwo,
        weddingDate: dateUndecided ? null : weddingDate,
        templateId,
      });
      if (!result.ok) {
        setFormError(result.error);
        setErrors(result.fieldErrors ?? {});
        // Jump back to the first step with a problem.
        const fields = Object.keys(result.fieldErrors ?? {});
        if (fields.some((f) => f.startsWith("partner"))) setStep(0);
        else if (fields.includes("weddingDate")) setStep(1);
        else if (fields.includes("templateId")) setStep(2);
        return;
      }
      router.push(`/dashboard/weddings/${result.data.id}`);
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ol className="mb-10 grid grid-cols-4 gap-2" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined}>
            <div className={cn("h-1 rounded-full", i <= step ? "bg-primary" : "bg-border")} />
            <p className={cn("mt-2 text-xs", i === step ? "font-medium" : "text-muted-foreground")}>
              {i + 1}. {label}
            </p>
          </li>
        ))}
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step < STEPS.length - 1) next();
          else submit();
        }}
        noValidate
        className="grid gap-8"
      >
        {step === 0 && (
          <section className="grid gap-6">
            <header>
              <h2 className="font-serif text-4xl">Who is getting married?</h2>
              <p className="mt-2 text-muted-foreground">Names exactly as you&apos;d like them on the invitation.</p>
            </header>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="partnerOne" label="First name" error={errors.partnerOne}>
                <Input id="partnerOne" value={partnerOne} onChange={(e) => setPartnerOne(e.target.value)} maxLength={80} autoFocus aria-invalid={Boolean(errors.partnerOne)} />
              </Field>
              <Field id="partnerTwo" label="Second name" error={errors.partnerTwo}>
                <Input id="partnerTwo" value={partnerTwo} onChange={(e) => setPartnerTwo(e.target.value)} maxLength={80} aria-invalid={Boolean(errors.partnerTwo)} />
              </Field>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="grid gap-6">
            <header>
              <h2 className="font-serif text-4xl">When is the big day?</h2>
              <p className="mt-2 text-muted-foreground">You can add ceremony and reception times later.</p>
            </header>
            <Field id="weddingDate" label="Wedding date" error={errors.weddingDate}>
              <Input
                id="weddingDate"
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                disabled={dateUndecided}
                className="max-w-xs"
                aria-invalid={Boolean(errors.weddingDate)}
                autoFocus
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={dateUndecided} onChange={(e) => setDateUndecided(e.target.checked)} className="size-4 accent-[var(--primary)]" />
              We haven&apos;t set a date yet
            </label>
          </section>
        )}

        {step === 2 && (
          <section className="grid gap-6">
            <header>
              <h2 className="font-serif text-4xl">Choose a template</h2>
              <p className="mt-2 text-muted-foreground">You can switch templates at any time — your content stays the same.</p>
            </header>
            <TemplatePicker templates={templates} value={templateId} onChange={setTemplateId} />
            {errors.templateId ? <p className="text-sm text-destructive">{errors.templateId[0]}</p> : null}
          </section>
        )}

        {step === 3 && (
          <section className="grid gap-6">
            <header>
              <h2 className="font-serif text-4xl">Ready?</h2>
              <p className="mt-2 text-muted-foreground">We&apos;ll create a private draft. Nothing is public until you publish.</p>
            </header>
            <dl className="grid gap-4 rounded-lg border bg-card p-6 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Couple</dt>
                <dd className="mt-1 font-serif text-2xl">{partnerOne.trim()} &amp; {partnerTwo.trim()}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Date</dt>
                <dd className="mt-1">{dateUndecided || !weddingDate ? "To be decided" : new Date(`${weddingDate}T00:00:00Z`).toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" })}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Template</dt>
                <dd className="mt-1">{template?.name ?? "—"}</dd>
              </div>
            </dl>
          </section>
        )}

        <FormMessage>{formError}</FormMessage>

        <div className="flex items-center justify-between border-t pt-6">
          <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0 || pending}>
            Back
          </Button>
          <Button type="submit" size="lg" disabled={pending}>
            {step < STEPS.length - 1 ? "Continue" : pending ? "Creating…" : "Create wedding"}
          </Button>
        </div>
      </form>
    </div>
  );
}
