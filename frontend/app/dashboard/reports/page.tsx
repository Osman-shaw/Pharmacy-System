import React from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ReportsContent } from "@/components/reports-content"
import { cookies } from "next/headers"
import { getProfile, getLowStockMedicines, getExpiringMedicines } from "@/lib/dashboardApi"

export default async function ReportsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  let profile = null
  try {
    const profileResponse = await getProfile(token)
    profile = profileResponse.data || profileResponse.user || profileResponse
  } catch {
    redirect("/auth/login")
  }

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const lowStockMedicines = await getLowStockMedicines(token)
  const expiringMedicines = await getExpiringMedicines(60, token)

  return (
    <DashboardLayout
      userRole={profile?.role != null ? String(profile.role) : undefined}
      userName={profile?.fullName != null ? String(profile.fullName) : profile?.full_name}
    >
      <ReportsContent
        lowStockMedicines={lowStockMedicines || []}
        expiringMedicines={expiringMedicines || []}
      />
    </DashboardLayout>
  )
}
