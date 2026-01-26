import { redirect } from "next/navigation"

export default async function FinancesPage() {
  redirect("/dashboard/finance/expenses")
}
