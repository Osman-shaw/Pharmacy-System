import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CustomerForm } from "@/components/customer-form"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/customersApi"

export default async function NewCustomerPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  let profile
  try {
    const profileData = await getProfile(token)
    profile = profileData.user || profileData.data
  } catch (error) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.username}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New Customer</h2>
          <p className="text-muted-foreground">Register a new customer</p>
        </div>

        <CustomerForm />
      </div>
    </DashboardLayout>
  )
}
