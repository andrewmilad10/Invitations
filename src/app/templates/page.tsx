import { redirect } from "next/navigation";

/** The old combined gallery: now two product galleries. Keeps old links working. */
export default async function TemplatesPage(props: PageProps<"/templates">) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(await props.searchParams)) if (typeof v === "string") params.set(k, v);
  const q = params.toString();
  redirect(`/invitations${q ? `?${q}` : ""}`);
}
