import { redirect } from "next/navigation";

/** "Create invitation" without a template starts by choosing one. */
export default function CreateIndexPage() {
  redirect("/templates");
}
