import React from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PayrollManager } from "@/components/payroll-manager"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/dashboardApi"
import { getEmployees, getPayrolls } from "@/lib/hrApi"

export default async function PayrollPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  let profile = null
  try {
    const profileResponse = await getProfile(token)
    profile = profileResponse.data
  } catch {
    redirect("/auth/login")
  }

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const employees = await getEmployees(token, { status: "active" }).catch(() => [])
  const payrolls = await getPayrolls(token).catch(() => [])

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.full_name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Payroll Management</h2>
            <p className="text-muted-foreground">Process employee salaries and payments</p>
          </div>
          <Link href="/dashboard/payroll/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700">Process Payroll</Button>
          </Link>
        </div>
        <PayrollManager employees={employees || []} payrolls={payrolls || []} />
      </div>
    </DashboardLayout>
  )
}
