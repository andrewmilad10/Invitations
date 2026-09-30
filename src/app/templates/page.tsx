import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { selectableTemplates } from "@/templates/registry";

export const metadata: Metadata = { title: "Templates" };

export default function TemplatesPage() {
  const templates = selectableTemplates();
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Brand />
        <Button asChild size="sm">
          <Link href="/register">Get started</Link>
        </Button>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-serif text-5xl">Templates</h1>
        <p className="mt-2 text-muted-foreground">Every template works with the same details — switch any time.</p>
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {templates.map((t) => (
            <li key={t.id} className="overflow-hidden rounded-xl border bg-card">
              <div className="relative aspect-[4/3] bg-muted">
                <Image src={t.previewImage} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="p-6">
                <h2 className="font-serif text-3xl">{t.name}</h2>
                <p className="mt-2 text-muted-foreground">{t.description}</p>
                <Button asChild variant="outline" className="mt-5">
                  <Link href={`/templates/${t.id}/preview`}>Preview with sample details</Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
