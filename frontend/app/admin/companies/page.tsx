import { redirect } from "next/navigation";

/**
 * This route previously rendered a second, duplicate copy of the company
 * register (with its own admin-only edit modal). The canonical screen lives at
 * /dashboard/companies, so this now redirects instead of drifting out of sync.
 */
export default function AdminCompaniesRedirect() {
  redirect("/dashboard/companies");
}
