import { connection } from "next/server";
import { Brand } from "@/components/brand";

/** Auth pages. A page marks itself `data-wide` to use the two-column "save your draft" layout. */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Rendered per request: these pages get a fresh script nonce (see src/proxy.ts).
  await connection();
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
