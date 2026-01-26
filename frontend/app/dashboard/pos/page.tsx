
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { POSInterface } from "@/components/pos-interface"
import { getProfile, getAvailableMedicines, getCustomers } from "@/lib/posApi"


// POS page using backend API (MongoDB)
import { cookies } from "next/headers"

export default async function POSPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  // 1. Check user session/profile
  let profile = null
  try {
    profile = await getProfile(token)
  } catch {
    // Not authenticated, redirect to login
    redirect("/auth/login")
  }

  // 2. Fetch medicines with available stock
  const medicinesResponse = await getAvailableMedicines(token)
  const availableMedicines = medicinesResponse.data || []

  // 3. Fetch all customers
  const customersResponse = await getCustomers(token)
  const customers = customersResponse.data || []

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Point of Sale</h2>
          <p className="text-muted-foreground">Process medicine sales and transactions</p>
        </div>

        <POSInterface medicines={availableMedicines || []} customers={customers || []} userId={profile?._id || profile?.id} />
      </div>
    </DashboardLayout>
  )
}
