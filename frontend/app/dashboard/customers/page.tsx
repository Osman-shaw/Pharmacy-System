
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CustomersTable } from "@/components/customers-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { getProfile, getCustomers } from "@/lib/customersApi"


// Customers page using backend API (MongoDB)
import { cookies } from "next/headers"

export default async function CustomersPage() {
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

  // 2. Fetch all customers
  const customersResponse = await getCustomers(token)
  const customers = customersResponse.data || []

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
            <p className="text-muted-foreground">Manage customer information</p>
          </div>
          <Link href="/dashboard/customers/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </Link>
        </div>

        <CustomersTable customers={customers || []} userRole={profile?.role || "pharmacist"} />
      </div>
    </DashboardLayout>
  )
}
