
import React from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SalesTable } from "@/components/sales-table"
import { getProfile } from "@/lib/dashboardApi"
import { getSales } from "@/lib/salesApi"


// Sales page using backend API (MongoDB)
import { cookies } from "next/headers"

export default async function SalesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  // 1. Check user session/profile
  let profile = null
  try {
    const profileRes = await getProfile(token)
    profile = profileRes.data ?? profileRes
  } catch {
    // Not authenticated, redirect to login
    redirect("/auth/login")
  }

  // 2. Fetch all sales (backend returns { success, data, pagination })
  const salesResponse = await getSales(token)
  const sales = Array.isArray(salesResponse?.data) ? salesResponse.data : []

  return (
    <DashboardLayout
      userRole={profile?.role != null ? String(profile.role) : undefined}
      userName={profile?.fullName != null ? String(profile.fullName) : undefined}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales History</h2>
          <p className="text-muted-foreground">View all sales transactions</p>
        </div>

        <SalesTable sales={sales || []} />
      </div>
    </DashboardLayout>
  )
}
