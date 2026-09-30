import { requireUser } from "@/features/auth/session";

/** Everything under /dashboard requires a signed-in user. */
export default async function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/dashboard");
  return children;
}
