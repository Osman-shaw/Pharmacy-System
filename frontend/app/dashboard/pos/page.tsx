
import React from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { POSInterface } from "@/components/pos-interface"
import { getProfile, getAvailableMedicines, getCustomers } from "@/lib/posApi"
import { getPrescriptions } from "@/lib/prescriptionsApi"
import { cookies } from "next/headers"

export default async function POSPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  let profileRes = null
  try {
    profileRes = await getProfile(token)
  } catch {
    redirect("/auth/login")
  }
  const user = profileRes?.data ?? profileRes ?? null

  const medicinesResponse = await getAvailableMedicines(token)
  const availableMedicines = medicinesResponse.data || []

  const customersResponse = await getCustomers(token)
  const customers = customersResponse.data || []

  let prescriptions: any[] = []
  try {
    const rxRes = await getPrescriptions(token, 1, "Pending")
    prescriptions = rxRes?.data || rxRes || []
  } catch {
    prescriptions = []
  }

  return (
    <DashboardLayout userRole={user?.role} userName={user?.fullName}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Point of Sale</h2>
          <p className="text-muted-foreground">Process medicine sales and transactions</p>
        </div>

        <POSInterface
          medicines={availableMedicines}
          customers={customers}
          prescriptions={prescriptions}
          user={user}
        />
      </div>
    </DashboardLayout>
  )
}
