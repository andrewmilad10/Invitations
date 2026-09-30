import { Brand } from "@/components/brand";

/** Auth pages. A page marks itself `data-wide` to use the two-column "save your draft" layout. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-sm has-[[data-wide]]:max-w-5xl">
        <div className="mb-10 text-center">
          <Brand />
        </div>
        {children}
      </div>
    </main>
  );
}
